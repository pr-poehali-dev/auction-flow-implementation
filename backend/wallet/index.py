"""
API для управления кошельком и интеграции с CloudPayments
"""
import json
import os
import psycopg2
import jwt
import hashlib
import hmac
from datetime import datetime

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def verify_token(token: str):
    try:
        return jwt.decode(token, os.environ['JWT_SECRET'], algorithms=['HS256'])
    except:
        return None

def verify_cloudpayments_signature(data: dict, signature: str) -> bool:
    api_secret = os.environ.get('CLOUDPAYMENTS_API_SECRET', '')
    message = f"{data.get('TransactionId')}{data.get('Amount')}{data.get('Currency')}"
    expected = hmac.new(api_secret.encode(), message.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)

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
    path = query_params.get('action', 'balance')
    
    try:
        conn = get_db()
        cur = conn.cursor()
        
        if path == 'balance' and method == 'GET':
            auth_token = event.get('headers', {}).get('X-Auth-Token', '')
            payload = verify_token(auth_token)
            
            if not payload:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Требуется авторизация'})
                }
            
            user_id = payload['user_id']
            
            cur.execute("""
                SELECT balance, total_deposit, loyalty_level 
                FROM users WHERE id = %s
            """, (user_id,))
            
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь не найден'})
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'balance': float(user[0]),
                    'total_deposit': float(user[1]),
                    'loyalty_level': user[2]
                })
            }
        
        elif path == 'transactions' and method == 'GET':
            auth_token = event.get('headers', {}).get('X-Auth-Token', '')
            payload = verify_token(auth_token)
            
            if not payload:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Требуется авторизация'})
                }
            
            user_id = payload['user_id']
            limit = int(query_params.get('limit', 50))
            
            cur.execute("""
                SELECT id, type, amount, balance_after, reference, 
                       payment_method, status, created_at
                FROM transactions 
                WHERE user_id = %s 
                ORDER BY created_at DESC 
                LIMIT %s
            """, (user_id, limit))
            
            transactions = []
            for row in cur.fetchall():
                transactions.append({
                    'id': row[0],
                    'type': row[1],
                    'amount': float(row[2]),
                    'balance_after': float(row[3]),
                    'reference': row[4],
                    'payment_method': row[5],
                    'status': row[6],
                    'created_at': row[7].isoformat() if row[7] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'transactions': transactions})
            }
        
        elif path == 'topup' and method == 'POST':
            auth_token = event.get('headers', {}).get('X-Auth-Token', '')
            payload = verify_token(auth_token)
            
            if not payload:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Требуется авторизация'})
                }
            
            user_id = payload['user_id']
            data = json.loads(event.get('body', '{}'))
            amount = float(data.get('amount', 0))
            
            if amount < 100:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Минимальная сумма 100₸'})
                }
            
            cur.execute("SELECT email FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь не найден'})
                }
            
            public_id = os.environ.get('CLOUDPAYMENTS_PUBLIC_ID', 'demo')
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'public_id': public_id,
                    'amount': amount,
                    'currency': 'KZT',
                    'description': f'Пополнение кошелька на {amount}₸',
                    'account_id': str(user_id),
                    'email': user[0]
                })
            }
        
        elif path == 'callback' and method == 'POST':
            data = json.loads(event.get('body', '{}'))
            
            if data.get('Status') != 'Completed':
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'code': 0})
                }
            
            user_id = int(data.get('AccountId', 0))
            amount = float(data.get('Amount', 0))
            transaction_id = data.get('TransactionId')
            
            cur.execute("""
                SELECT balance, total_deposit FROM users WHERE id = %s FOR UPDATE
            """, (user_id,))
            
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'code': 13})
                }
            
            new_balance = user[0] + amount
            new_deposit = user[1] + amount
            
            new_loyalty = 'Hero'
            if new_deposit >= 150000:
                new_loyalty = 'Monarch'
            elif new_deposit >= 50000:
                new_loyalty = 'Noble'
            
            cur.execute("""
                UPDATE users 
                SET balance = %s, total_deposit = %s, loyalty_level = %s
                WHERE id = %s
            """, (new_balance, new_deposit, new_loyalty, user_id))
            
            cur.execute("""
                INSERT INTO transactions (user_id, type, amount, balance_after, reference, payment_method, status)
                VALUES (%s, 'topup', %s, %s, %s, 'cloudpayments', 'completed')
            """, (user_id, amount, new_balance, transaction_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'code': 0})
            }
        
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Endpoint не найден'})
            }
    
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
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
