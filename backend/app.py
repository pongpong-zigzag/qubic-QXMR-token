from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime, date
from typing import Optional, Dict, Any

app = Flask(__name__)
# Configure CORS to allow specific origins
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://frontend.qxmr.quest",
            "https://admin.qxmr.quest",
            "http://localhost:5173",  # For local development
            "http://localhost:5174"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": False
    }
})

# Database file paths
USERS_DB = 'users.db'
TRANSACTIONS_DB = 'transactions.db'

def init_databases():
    """Initialize both databases with their tables"""
    # Initialize users database
    conn_users = sqlite3.connect(USERS_DB)
    cursor_users = conn_users.cursor()
    cursor_users.execute('''
        CREATE TABLE IF NOT EXISTS users (
            walletid TEXT PRIMARY KEY,
            amount TEXT DEFAULT '0',
            gameleft TEXT DEFAULT '0',
            lastplayed TEXT DEFAULT '',
            paid TEXT DEFAULT '0',
            highest TEXT DEFAULT '0',
            col1 TEXT DEFAULT '',
            col2 TEXT DEFAULT '',
            col3 TEXT DEFAULT ''
        )
    ''')
    # Add leaderboard_access column if it doesn't exist
    try:
        cursor_users.execute('ALTER TABLE users ADD COLUMN leaderboard_access TEXT DEFAULT "0"')
    except sqlite3.OperationalError:
        pass  # Column already exists
    conn_users.commit()
    conn_users.close()
    
    # Initialize transactions database
    conn_trans = sqlite3.connect(TRANSACTIONS_DB)
    cursor_trans = conn_trans.cursor()
    cursor_trans.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            walletid TEXT NOT NULL,
            hash TEXT NOT NULL,
            paid TEXT NOT NULL,
            col1 TEXT DEFAULT '',
            col2 TEXT DEFAULT ''
        )
    ''')
    conn_trans.commit()
    conn_trans.close()
    
    # Initialize daily_scores database for tracking daily leaderboard and prizes
    conn_daily = sqlite3.connect('daily_scores.db')
    cursor_daily = conn_daily.cursor()
    cursor_daily.execute('''
        CREATE TABLE IF NOT EXISTS daily_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            walletid TEXT NOT NULL,
            score_date TEXT NOT NULL,
            score REAL NOT NULL,
            prize_claimed TEXT DEFAULT '0',
            UNIQUE(walletid, score_date)
        )
    ''')
    cursor_daily.execute('''
        CREATE INDEX IF NOT EXISTS idx_daily_scores_date ON daily_scores(score_date)
    ''')
    conn_daily.commit()
    conn_daily.close()

def get_user(walletid: str) -> Optional[Dict[str, Any]]:
    """Get user by walletid"""
    conn = sqlite3.connect(USERS_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE walletid = ?', (walletid,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return dict(row)
    return None

def create_user(walletid: str) -> Dict[str, Any]:
    """Create a new user with default values (free play enabled, no leaderboard access)"""
    conn = sqlite3.connect(USERS_DB)
    cursor = conn.cursor()
    # Check if leaderboard_access column exists
    try:
        cursor.execute('''
            INSERT INTO users (walletid, amount, gameleft, lastplayed, paid, highest, col1, col2, col3, leaderboard_access)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (walletid, '0', '0', '', '0', '0', '', '', '', '0'))
    except sqlite3.OperationalError:
        # Fallback if column doesn't exist yet
        cursor.execute('''
            INSERT INTO users (walletid, amount, gameleft, lastplayed, paid, highest, col1, col2, col3)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (walletid, '0', '0', '', '0', '0', '', '', ''))
    conn.commit()
    conn.close()
    return get_user(walletid)

def check_and_reset_daily_games(user: Dict[str, Any]) -> Dict[str, Any]:
    """Check if it's a new day and reset games if needed"""
    lastplayed_str = user.get('lastplayed', '')
    if not lastplayed_str:
        # First time playing, set to 3 games
        return update_user(user['walletid'], {'gameleft': '3'})
    
    try:
        # Parse lastplayed date
        lastplayed_date = datetime.fromisoformat(lastplayed_str).date()
        today = date.today()
        
        # If different date, reset games to 3
        if lastplayed_date != today:
            current_gameleft = int(user.get('gameleft', '0') or '0')
            new_gameleft = 3  # Reset to 3 free games
            return update_user(user['walletid'], {'gameleft': str(new_gameleft)})
    except (ValueError, AttributeError):
        # If parsing fails, assume new day and reset
        return update_user(user['walletid'], {'gameleft': '3'})
    
    return user

def update_user(walletid: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Update user data"""
    conn = sqlite3.connect(USERS_DB)
    cursor = conn.cursor()
    
    # Build update query dynamically based on provided fields
    update_fields = []
    values = []
    
    allowed_fields = ['amount', 'gameleft', 'lastplayed', 'paid', 'highest', 'col1', 'col2', 'col3', 'leaderboard_access']
    for field in allowed_fields:
        if field in data:
            update_fields.append(f'{field} = ?')
            values.append(str(data[field]))
    
    if not update_fields:
        conn.close()
        return get_user(walletid)
    
    values.append(walletid)
    query = f'UPDATE users SET {", ".join(update_fields)} WHERE walletid = ?'
    cursor.execute(query, values)
    conn.commit()
    conn.close()
    return get_user(walletid)

@app.route('/get_user', methods=['GET', 'POST'])
def get_user_endpoint():
    """Get user info or create new user if doesn't exist. Automatically checks and resets daily games."""
    try:
        if request.method == 'POST':
            data = request.get_json()
            walletid = data.get('walletid') if data else None
        else:
            walletid = request.args.get('walletid')
        
        if not walletid:
            return jsonify({'error': 'walletid is required'}), 400
        
        user = get_user(walletid)
        if not user:
            user = create_user(walletid)
            return jsonify({'user': user, 'created': True}), 200
        
        # Check and reset daily games if needed
        user = check_and_reset_daily_games(user)
        
        return jsonify({'user': user, 'created': False}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update_user', methods=['POST'])
def update_user_endpoint():
    """Update user data"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        walletid = data.get('walletid')
        if not walletid:
            return jsonify({'error': 'walletid is required'}), 400
        
        # Remove walletid from update data
        update_data = {k: v for k, v in data.items() if k != 'walletid'}
        
        user = update_user(walletid, update_data)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/leaderboard', methods=['GET', 'POST'])
def leaderboard_endpoint():
    """Get leaderboard with top 100 users who have paid for access, total users, and user ranking"""
    try:
        walletid = None
        if request.method == 'POST':
            data = request.get_json()
            walletid = data.get('walletid') if data else None
        else:
            walletid = request.args.get('walletid')
        
        conn = sqlite3.connect(USERS_DB)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get total users count (only those with leaderboard access)
        cursor.execute('SELECT COUNT(*) as total FROM users WHERE leaderboard_access = "1"')
        total_users = cursor.fetchone()['total']
        
        # Get top 100 users sorted by amount (descending) - only those with leaderboard access
        cursor.execute('''
            SELECT walletid, amount, gameleft, lastplayed, paid, highest, col1, col2, col3, leaderboard_access
            FROM users
            WHERE leaderboard_access = "1"
            ORDER BY CAST(amount AS REAL) DESC
            LIMIT 100
        ''')
        top_users = [dict(row) for row in cursor.fetchall()]
        
        # Get user ranking if walletid provided (only among paid users)
        user_ranking = None
        if walletid:
            user = get_user(walletid)
            if user and user.get('leaderboard_access', '0') == '1':
                cursor.execute('''
                    SELECT COUNT(*) + 1 as rank
                    FROM users
                    WHERE leaderboard_access = "1" AND CAST(amount AS REAL) > (SELECT CAST(amount AS REAL) FROM users WHERE walletid = ?)
                ''', (walletid,))
                rank_result = cursor.fetchone()
                if rank_result:
                    user_ranking = rank_result['rank']
                
                user_ranking = {
                    'rank': user_ranking or 1,
                    'user': user
                }
        
        conn.close()
        
        return jsonify({
            'top_users': top_users,
            'total_users': total_users,
            'user_ranking': user_ranking
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/transaction', methods=['POST'])
def transaction_endpoint():
    """Save transaction. Handle leaderboard payment (10000 QXMR) or game purchases."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        walletid = data.get('walletid')
        tx_hash = data.get('hash')
        paid_amount = data.get('paid')
        col1 = data.get('col1', '')  # Transaction type: 'leaderboard_payment' or 'game_purchase'
        col2 = data.get('col2', '')  # Additional data
        
        if not walletid or not tx_hash or paid_amount is None:
            return jsonify({'error': 'walletid, hash, and paid are required'}), 400
        
        # Convert paid_amount to string for storage
        paid_amount_str = str(paid_amount)
        paid_amount_float = float(paid_amount)
        
        # Save transaction
        conn_trans = sqlite3.connect(TRANSACTIONS_DB)
        cursor_trans = conn_trans.cursor()
        cursor_trans.execute('''
            INSERT INTO transactions (walletid, hash, paid, col1, col2)
            VALUES (?, ?, ?, ?, ?)
        ''', (walletid, tx_hash, paid_amount_str, col1, col2))
        conn_trans.commit()
        conn_trans.close()
        
        # Get or create user
        user = get_user(walletid)
        if not user:
            user = create_user(walletid)
        
        # Check transaction type
        LEADERBOARD_PRICE = 100  # 10000 QXMR for leaderboard access
        GAME_PRICE = 500  # Old game purchase price (deprecated but kept for compatibility)
        
        update_data = {}
        leaderboard_access_granted = False
        
        # Check if this is a leaderboard payment
        if col1 == 'leaderboard_payment' and paid_amount_float >= LEADERBOARD_PRICE:
            # Grant leaderboard access
            update_data['leaderboard_access'] = '1'
            leaderboard_access_granted = True
            # Increment paid amount
            current_paid = float(user.get('paid', '0') or '0')
            new_paid = current_paid + paid_amount_float
            update_data['paid'] = str(new_paid)
        # Legacy: Check if this is a game purchase (deprecated - games are now free)
        elif col1 == 'game_purchase' and paid_amount_float >= GAME_PRICE:
            games_purchased = int(paid_amount_float / GAME_PRICE)
            current_gameleft = int(user.get('gameleft', '0') or '0')
            new_gameleft = current_gameleft + games_purchased
            update_data['gameleft'] = str(new_gameleft)
            current_paid = float(user.get('paid', '0') or '0')
            new_paid = current_paid + paid_amount_float
            update_data['paid'] = str(new_paid)
        else:
            # Generic payment - just increment paid amount
            current_paid = float(user.get('paid', '0') or '0')
            new_paid = current_paid + paid_amount_float
            update_data['paid'] = str(new_paid)
        
        if update_data:
            update_user(walletid, update_data)
        
        return jsonify({
            'success': True,
            'transaction_saved': True,
            'leaderboard_access_granted': leaderboard_access_granted,
            'user_paid_updated': update_data.get('paid', user.get('paid', '0'))
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/start_game', methods=['POST'])
def start_game_endpoint():
    """Allow free play - no gameleft check needed"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        walletid = data.get('walletid')
        if not walletid:
            return jsonify({'error': 'walletid is required'}), 400
        
        # Get or create user
        user = get_user(walletid)
        if not user:
            user = create_user(walletid)
        
        # Free play - always allow
        return jsonify({
            'success': True,
            'can_play': True,
            'user': user
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update_game_score', methods=['POST'])
def update_game_score_endpoint():
    """Update user's score. Only update leaderboard if user has paid for access."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        walletid = data.get('walletid')
        score = data.get('score')
        
        if not walletid or score is None:
            return jsonify({'error': 'walletid and score are required'}), 400
        
        # Get current user
        user = get_user(walletid)
        if not user:
            user = create_user(walletid)
        
        # Check if user has leaderboard access
        leaderboard_access = user.get('leaderboard_access', '0') or '0'
        has_access = leaderboard_access == '1'
        
        # Always update highest score locally
        current_highest = float(user.get('highest', '0') or '0')
        new_highest = max(current_highest, float(score))

        #Always get gameleft
        current_gameleft = int(user.get('gameleft', '0') or '0')
        
        update_data = {
            'highest': str(new_highest)
        }
        
        # Only update amount (leaderboard score) if user has paid for access
        if has_access and current_gameleft:

            # Update lastplayed timestamp
            lastplayed = datetime.now().isoformat()
            update_data['lastplayed'] = lastplayed

            current_amount = float(user.get('amount', '0') or '0')
            new_amount = max(current_amount, float(score))
            update_data['amount'] = str(new_amount)
            
            new_gameleft = current_gameleft - 1
            update_data['gameleft'] = str(new_gameleft)

            # Also save to daily_scores for daily prize calculation
            # We track each game score separately, then sum them for daily totals
            today = date.today().isoformat()
            conn_daily = sqlite3.connect('daily_scores.db')
            cursor_daily = conn_daily.cursor()
            # Insert a new row for this game score (we'll sum them when querying)
            cursor_daily.execute(
                '''
                INSERT INTO daily_scores (walletid, score_date, score)
                VALUES (?, ?, ?)
                ON CONFLICT(walletid, score_date)
                DO UPDATE SET score = CASE
                    WHEN excluded.score > daily_scores.score THEN excluded.score
                    ELSE daily_scores.score
                END
                ''',
                (walletid, today, float(score)),
            )
            conn_daily.commit()
            conn_daily.close()
        else:
            # User played for free but doesn't have leaderboard access
            # Still update highest for their personal record
            pass
        
        updated_user = update_user(walletid, update_data)
        
        return jsonify({
            'success': True,
            'user': updated_user,
            'leaderboard_updated': has_access
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/buy_games', methods=['POST'])
def buy_games_endpoint():
    """Buy games - increment gameleft and paid amount"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        walletid = data.get('walletid')
        games_to_buy = data.get('games', 1)  # Number of games to buy
        paid_amount = data.get('paid', 500000)  # Amount paid per game (default 500000)
        
        if not walletid:
            return jsonify({'error': 'walletid is required'}), 400
        
        # Calculate total paid amount
        total_paid = float(paid_amount) * int(games_to_buy)
        
        # Get current user
        user = get_user(walletid)
        if not user:
            user = create_user(walletid)
        
        # Increment gameleft
        current_gameleft = int(user.get('gameleft', '0') or '0')
        new_gameleft = current_gameleft + int(games_to_buy)
        
        # Increment paid amount
        current_paid = float(user.get('paid', '0') or '0')
        new_paid = current_paid + total_paid
        
        # Update user
        updated_user = update_user(walletid, {
            'gameleft': str(new_gameleft),
            'paid': str(new_paid)
        })
        
        return jsonify({
            'success': True,
            'games_added': int(games_to_buy),
            'total_paid': total_paid,
            'games_remaining': new_gameleft,
            'user': updated_user
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/daily_winner', methods=['GET'])
def daily_winner_endpoint():
    """Get the daily winner (highest score of the day)"""
    try:
        target_date = request.args.get('date', date.today().isoformat())
        
        conn_daily = sqlite3.connect('daily_scores.db')
        conn_daily.row_factory = sqlite3.Row
        cursor_daily = conn_daily.cursor()
        
        # Get highest score for the date (sum of all scores for each user on that day)
        cursor_daily.execute('''
            SELECT walletid, SUM(score) as total_score
            FROM daily_scores
            WHERE score_date = ?
            GROUP BY walletid
            ORDER BY total_score DESC
            LIMIT 1
        ''', (target_date,))
        
        winner = cursor_daily.fetchone()
        conn_daily.close()
        
        if winner:
            user = get_user(winner['walletid'])
            return jsonify({
                'success': True,
                'winner': {
                    'walletid': winner['walletid'],
                    'score': winner['total_score'],
                    'user': user
                },
                'date': target_date,
                'prize_amount': 1000000  # 1,000,000 Qubic
            }), 200
        else:
            return jsonify({
                'success': True,
                'winner': None,
                'date': target_date,
                'prize_amount': 1000000
            }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200

# Admin endpoints
@app.route('/admin/users', methods=['GET'])
def get_all_users():
    """Get all users from the database"""
    try:
        conn = sqlite3.connect(USERS_DB)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users ORDER BY CAST(amount AS REAL) DESC')
        users = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify({'users': users}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/transactions', methods=['GET'])
def get_all_transactions():
    """Get all transactions from the database"""
    try:
        conn = sqlite3.connect(TRANSACTIONS_DB)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM transactions ORDER BY id DESC')
        transactions = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify({'transactions': transactions}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/reset-balances', methods=['POST'])
def reset_all_balances():
    """Reset all users' balances to 0"""
    try:
        conn = sqlite3.connect(USERS_DB)
        cursor = conn.cursor()
        cursor.execute('UPDATE users SET amount = ?', ('0',))
        conn.commit()
        affected_rows = cursor.rowcount
        conn.close()
        return jsonify({
            'success': True,
            'message': f'Reset {affected_rows} users\' balances to 0',
            'affected_rows': affected_rows
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Initialize databases on startup
    init_databases()
    print("Databases initialized successfully!")
    print("Starting Flask server on http://localhost:5000")
    app.run(debug=True, port=5000)

