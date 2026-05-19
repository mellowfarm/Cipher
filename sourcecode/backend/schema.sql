CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR NOT NULL,
    amount FLOAT NOT NULL,
    category VARCHAR DEFAULT '',
    predicted_category VARCHAR DEFAULT '',
    time VARCHAR DEFAULT '',
    date VARCHAR DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS archetypes (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    archetype_name VARCHAR,
    portrait TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS imported_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_hash VARCHAR NOT NULL,
    imported_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE archetypes ADD COLUMN IF NOT EXISTS transaction_count INT DEFAULT 0;

CREATE TABLE training_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR NOT NULL,
    correct_category VARCHAR NOT NULL,
    original_category VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);