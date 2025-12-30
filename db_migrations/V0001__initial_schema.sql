-- Users table with email auth and loyalty system
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(50),
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    balance DECIMAL(10, 2) DEFAULT 0.00,
    total_deposit DECIMAL(10, 2) DEFAULT 0.00,
    loyalty_level VARCHAR(20) DEFAULT 'Hero',
    daily_bonus_claimed_at TIMESTAMP,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories (22 categories)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers/Stores
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auctions
CREATE TABLE auctions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    image_url TEXT,
    category_id INTEGER REFERENCES categories(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    retail_price DECIMAL(10, 2) NOT NULL,
    purchase_price DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2) DEFAULT 0.00,
    bot_threshold DECIMAL(10, 2) NOT NULL,
    min_price_limit DECIMAL(10, 2) DEFAULT 1000.00,
    total_bids INTEGER DEFAULT 0,
    bot_bids_count INTEGER DEFAULT 0,
    timer_seconds INTEGER DEFAULT 10,
    status VARCHAR(20) DEFAULT 'active',
    winner_id INTEGER REFERENCES users(id),
    buy_it_now_deadline TIMESTAMP,
    ships_by DATE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bids history
CREATE TABLE bids (
    id SERIAL PRIMARY KEY,
    auction_id INTEGER REFERENCES auctions(id),
    user_id INTEGER REFERENCES users(id),
    bid_amount DECIMAL(10, 2) DEFAULT 50.00,
    price_after_bid DECIMAL(10, 2) NOT NULL,
    is_bot BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Early participants for No Jumper protection
CREATE TABLE early_participants (
    id SERIAL PRIMARY KEY,
    auction_id INTEGER REFERENCES auctions(id),
    user_id INTEGER REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(auction_id, user_id)
);

-- Wallet transactions
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    reference VARCHAR(255),
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'completed',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders (Buy It Now purchases)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    auction_id INTEGER REFERENCES auctions(id),
    user_id INTEGER REFERENCES users(id),
    final_price DECIMAL(10, 2) NOT NULL,
    delivery_status VARCHAR(50) DEFAULT 'pending',
    tracking_number VARCHAR(255),
    delivery_address TEXT,
    delivery_phone VARCHAR(50),
    delivery_city VARCHAR(255),
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Returns and complaints
CREATE TABLE returns (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    user_id INTEGER REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    admin_response TEXT,
    is_replacement BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Loyalty badges
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url TEXT,
    requirement_type VARCHAR(50),
    requirement_value INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User badges
CREATE TABLE user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    badge_id INTEGER REFERENCES badges(id),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

-- Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin banners and promo
CREATE TABLE banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    image_url TEXT NOT NULL,
    link TEXT,
    position VARCHAR(50) DEFAULT 'main',
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_category ON auctions(category_id);
CREATE INDEX idx_bids_auction ON bids(auction_id);
CREATE INDEX idx_bids_user ON bids(user_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_early_participants_auction ON early_participants(auction_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
