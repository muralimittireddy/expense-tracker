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

-- New table: groups (Modified)
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT, -- NEW: Optional description for the group
    created_by_user_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE CASCADE
);


-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255),
    amount FLOAT NOT NULL,
    date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    category expensecategory DEFAULT 'Other' NOT NULL,
    owner_id INTEGER NOT NULL,
    group_id INTEGER, -- NEW: Links to a group if it's a shared expense (NULL if personal)
    paid_by_user_id INTEGER NOT NULL, -- NEW: The user who actually paid the full amount
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE SET NULL, -- Use SET NULL if group deleted
    FOREIGN KEY (paid_by_user_id) REFERENCES users (id) ON DELETE CASCADE
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


-- New table: group_members (for many-to-many relationship between users and groups)
CREATE TABLE IF NOT EXISTS group_members (
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id), -- Composite primary key
    FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- New table: expense_shares (for splitting group expenses)
CREATE TABLE IF NOT EXISTS expense_shares (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL, -- The user who owes/is responsible for this share
    share_amount FLOAT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_id) REFERENCES expenses (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE (expense_id, user_id) -- A user should have only one share per expense
);

-- New table: settlements (for recording payments between users)
CREATE TABLE IF NOT EXISTS settlements (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL, -- The user who made the payment
    to_user_id INTEGER NOT NULL,   -- The user who received the payment
    group_id INTEGER NOT NULL,     -- The group within which the settlement occurred
    amount FLOAT NOT NULL,
    settled_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE
);
