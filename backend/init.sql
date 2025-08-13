-- backend/init.sql
-- This script will be executed by PostgreSQL on first run to initialize the database schema.

-- Create the ExpenseCategory ENUM type if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expensecategory') THEN
        CREATE TYPE expensecategory AS ENUM (
            'Food',
            'Travel',
            'Rent',
            'Utilities',
            'Entertainment',
            'Shopping',
            'Health',
            'Education',
            'Transportation',
            'Other'
        );
    END IF;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255),
    amount FLOAT NOT NULL,
    date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    category expensecategory DEFAULT 'Other' NOT NULL,
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    amount FLOAT NOT NULL,
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE (owner_id, month, year) -- Ensure only one budget per user per month/year
);