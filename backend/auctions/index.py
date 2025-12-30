"""
API для управления аукционами и ставками
"""
import json
import os
import psycopg2
import jwt
from datetime import datetime, timedelta

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

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
    path = query_params.get('action', 'list')
    
    try:
        conn = get_db()
        cur = conn.cursor()
        
        if path == 'list' and method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            category_id = params.get('category_id')
            status = params.get('status', 'active')
            limit = int(params.get('limit', 50))
            
            query = """
                SELECT a.id, a.title, a.image_url, a.current_price, a.total_bids, 
                       a.timer_seconds, a.retail_price, a.min_price_limit, a.status,
                       a.winner_id, a.buy_it_now_deadline, a.bot_bids_count, a.started_at,
                       c.name as category_name, s.name as supplier_name
                FROM auctions a
                LEFT JOIN categories c ON a.category_id = c.id
                LEFT JOIN suppliers s ON a.supplier_id = s.id
                WHERE a.status = %s
            """
            
            query_params = [status]
            
            if category_id:
                query += " AND a.category_id = %s"
                query_params.append(category_id)
            
            query += " ORDER BY a.started_at DESC LIMIT %s"
            query_params.append(limit)
            
            cur.execute(query, query_params)
            
            auctions = []
            for row in cur.fetchall():
                auctions.append({
                    'id': row[0],
                    'title': row[1],
                    'image': row[2],
                    'currentPrice': float(row[3]),
                    'totalBids': row[4],
                    'timeLeft': row[5],
                    'retail': float(row[6]),
                    'minPrice': float(row[7]),
                    'status': row[8],
                    'winnerId': row[9],
                    'buyItNowDeadline': row[10].isoformat() if row[10] else None,
                    'botBidsCount': row[11],
                    'startedAt': row[12].isoformat() if row[12] else None,
                    'category': row[13],
                    'supplier': row[14]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'auctions': auctions})
            }
        
        elif path == 'details' and method == 'GET':
            auction_id = event.get('queryStringParameters', {}).get('id')
            
            if not auction_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID аукциона обязателен'})
                }
            
            cur.execute("""
                SELECT a.id, a.title, a.description, a.image_url, a.current_price, 
                       a.total_bids, a.timer_seconds, a.retail_price, a.min_price_limit, 
                       a.status, a.winner_id, a.buy_it_now_deadline, a.bot_bids_count,
                       a.ships_by, a.started_at, a.ended_at,
                       c.name as category_name, s.name as supplier_name,
                       s.rating as supplier_rating
                FROM auctions a
                LEFT JOIN categories c ON a.category_id = c.id
                LEFT JOIN suppliers s ON a.supplier_id = s.id
                WHERE a.id = %s
            """, (auction_id,))
            
            row = cur.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Аукцион не найден'})
                }
            
            cur.execute("""
                SELECT COUNT(DISTINCT user_id) FROM bids 
                WHERE auction_id = %s AND is_bot = false
            """, (auction_id,))
            unique_bidders = cur.fetchone()[0]
            
            cur.execute("""
                SELECT u.id, ep.joined_at
                FROM early_participants ep
                JOIN users u ON ep.user_id = u.id
                WHERE ep.auction_id = %s
                ORDER BY ep.joined_at
                LIMIT 10
            """, (auction_id,))
            
            early_participants = [{'userId': r[0], 'joinedAt': r[1].isoformat()} for r in cur.fetchall()]
            
            auction = {
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'image': row[3],
                'currentPrice': float(row[4]),
                'totalBids': row[5],
                'timeLeft': row[6],
                'retail': float(row[7]),
                'minPrice': float(row[8]),
                'status': row[9],
                'winnerId': row[10],
                'buyItNowDeadline': row[11].isoformat() if row[11] else None,
                'botBidsCount': row[12],
                'shipsBy': row[13].isoformat() if row[13] else None,
                'startedAt': row[14].isoformat() if row[14] else None,
                'endedAt': row[15].isoformat() if row[15] else None,
                'category': row[16],
                'supplier': row[17],
                'supplierRating': float(row[18]) if row[18] else 0,
                'uniqueBidders': unique_bidders,
                'earlyParticipants': early_participants
            }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(auction)
            }
        
        elif path == 'bid' and method == 'POST':
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
            auction_id = data.get('auction_id')
            
            if not auction_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID аукциона обязателен'})
                }
            
            cur.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            
            if not user or user[0] < 50:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Недостаточно средств на балансе'})
                }
            
            cur.execute("""
                SELECT id, current_price, status, min_price_limit, winner_id
                FROM auctions WHERE id = %s FOR UPDATE
            """, (auction_id,))
            
            auction = cur.fetchone()
            
            if not auction:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Аукцион не найден'})
                }
            
            if auction[2] != 'active' or auction[4]:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Аукцион завершен'})
                }
            
            current_price = float(auction[1])
            min_price = float(auction[3])
            
            if current_price >= min_price:
                cur.execute("""
                    SELECT 1 FROM early_participants 
                    WHERE auction_id = %s AND user_id = %s
                """, (auction_id, user_id))
                
                if not cur.fetchone():
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'No Jumper: лимит достигнут'})
                    }
            
            new_price = current_price + 50
            new_balance = user[0] - 50
            
            cur.execute("""
                UPDATE users SET balance = %s WHERE id = %s
            """, (new_balance, user_id))
            
            cur.execute("""
                UPDATE auctions 
                SET current_price = %s, total_bids = total_bids + 1, timer_seconds = 10
                WHERE id = %s
            """, (new_price, auction_id))
            
            cur.execute("""
                INSERT INTO bids (auction_id, user_id, bid_amount, price_after_bid, is_bot)
                VALUES (%s, %s, 50, %s, false)
            """, (auction_id, user_id, new_price))
            
            if current_price < min_price:
                cur.execute("""
                    INSERT INTO early_participants (auction_id, user_id)
                    VALUES (%s, %s)
                    ON CONFLICT (auction_id, user_id) DO NOTHING
                """, (auction_id, user_id))
            
            cur.execute("""
                INSERT INTO transactions (user_id, type, amount, balance_after, reference)
                VALUES (%s, 'bid', -50, %s, 'Auction #' || %s)
            """, (user_id, new_balance, auction_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'newPrice': float(new_price),
                    'newBalance': float(new_balance)
                })
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