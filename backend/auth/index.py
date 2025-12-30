"""
API для регистрации, входа и управления пользователями
"""
import json
import os
import psycopg2
import hashlib
import secrets
import jwt
from datetime import datetime, timedelta

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token(user_id: int) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, os.environ['JWT_SECRET'], algorithm='HS256')

def verify_token(token: str):
    try:
        return jwt.decode(token, os.environ['JWT_SECRET'], algorithms=['HS256'])
    except:
        return None

def handler(event, context):
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token'
            },
            'body': ''
        }
    
    query_params = event.get('queryStringParameters', {}) or {}
    path = query_params.get('action', 'status')
    
    try:
        conn = get_db()
        cur = conn.cursor()
        
        if path == 'register' and method == 'POST':
            data = json.loads(event.get('body', '{}'))
            email = data.get('email', '').lower().strip()
            password = data.get('password', '')
            full_name = data.get('full_name', '')
            
            if not email or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email и пароль обязательны'})
                }
            
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email уже зарегистрирован'})
                }
            
            password_hash = hash_password(password)
            verification_token = secrets.token_urlsafe(32)
            
            cur.execute("""
                INSERT INTO users (email, password_hash, full_name, verification_token, balance, total_deposit)
                VALUES (%s, %s, %s, %s, 0, 0)
                RETURNING id, email, full_name, balance, loyalty_level
            """, (email, password_hash, full_name, verification_token))
            
            user = cur.fetchone()
            conn.commit()
            
            cur.execute("INSERT INTO user_badges (user_id, badge_id) VALUES (%s, 1)", (user[0],))
            conn.commit()
            
            token = generate_token(user[0])
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'token': token,
                    'user': {
                        'id': user[0],
                        'email': user[1],
                        'full_name': user[2],
                        'balance': float(user[3]),
                        'loyalty_level': user[4]
                    }
                })
            }
        
        elif path == 'login' and method == 'POST':
            data = json.loads(event.get('body', '{}'))
            email = data.get('email', '').lower().strip()
            password = data.get('password', '')
            
            if not email or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email и пароль обязательны'})
                }
            
            password_hash = hash_password(password)
            
            cur.execute("""
                SELECT id, email, full_name, balance, loyalty_level, total_deposit, is_blocked
                FROM users WHERE email = %s AND password_hash = %s
            """, (email, password_hash))
            
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный email или пароль'})
                }
            
            if user[6]:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Аккаунт заблокирован'})
                }
            
            token = generate_token(user[0])
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'token': token,
                    'user': {
                        'id': user[0],
                        'email': user[1],
                        'full_name': user[2],
                        'balance': float(user[3]),
                        'loyalty_level': user[4],
                        'total_deposit': float(user[5])
                    }
                })
            }
        
        elif path == 'me' and method == 'GET':
            auth_token = event.get('headers', {}).get('X-Auth-Token', '')
            payload = verify_token(auth_token)
            
            if not payload:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный токен'})
                }
            
            user_id = payload['user_id']
            
            cur.execute("""
                SELECT id, email, full_name, avatar_url, phone, balance, total_deposit, 
                       loyalty_level, email_verified, created_at
                FROM users WHERE id = %s
            """, (user_id,))
            
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь не найден'})
                }
            
            cur.execute("""
                SELECT COUNT(*) FROM bids WHERE user_id = %s AND is_bot = false
            """, (user_id,))
            total_bids = cur.fetchone()[0]
            
            cur.execute("""
                SELECT COUNT(*) FROM auctions WHERE winner_id = %s
            """, (user_id,))
            total_wins = cur.fetchone()[0]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'id': user[0],
                    'email': user[1],
                    'full_name': user[2],
                    'avatar_url': user[3],
                    'phone': user[4],
                    'balance': float(user[5]),
                    'total_deposit': float(user[6]),
                    'loyalty_level': user[7],
                    'email_verified': user[8],
                    'created_at': user[9].isoformat() if user[9] else None,
                    'stats': {
                        'total_bids': total_bids,
                        'total_wins': total_wins
                    }
                })
            }
        
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Endpoint не найден'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()