CREATE SCHEMA IF NOT EXISTS analytics;

CREATE TABLE analytics.users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    signup_date DATE NOT NULL,
    country TEXT,
    plan TEXT CHECK (plan IN ('free', 'pro', 'enterprise'))
);

CREATE TABLE analytics.orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES analytics.users(id),
    order_date DATE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'refunded')),
    total_amount NUMERIC(10, 2) NOT NULL
);

CREATE TABLE analytics.order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES analytics.orders(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL
);

INSERT INTO analytics.users (email, signup_date, country, plan)
SELECT
    'user' || i || '@example.com',
    CURRENT_DATE - (random() * 180)::int,
    (ARRAY['US', 'UK', 'IN', 'DE', 'BR', 'CA'])[floor(random() * 6 + 1)],
    (ARRAY['free', 'free', 'free', 'pro', 'pro', 'enterprise'])[floor(random() * 6 + 1)]
FROM generate_series(1, 100) AS i;

INSERT INTO analytics.orders (user_id, order_date, status, total_amount)
SELECT
    (random() * 99 + 1)::int,
    CURRENT_DATE - (random() * 90)::int,
    (ARRAY['pending', 'completed', 'completed', 'completed', 'refunded'])[floor(random() * 5 + 1)],
    round((random() * 490 + 10)::numeric, 2)
FROM generate_series(1, 300) AS i;

INSERT INTO analytics.order_items (order_id, product_name, quantity, unit_price)
SELECT
    o.id,
    (ARRAY['Widget A', 'Widget B', 'Gadget X', 'Gadget Y', 'Gizmo Z'])[floor(random() * 5 + 1)],
    floor(random() * 3 + 1)::int,
    round((random() * 90 + 10)::numeric, 2)
FROM analytics.orders o
CROSS JOIN generate_series(1, (random() * 2 + 1)::int);

-- ---------------------------------------------------------------------------
-- Schema: support (second schema for multi-schema discovery demos)
-- ---------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS support;

CREATE TABLE support.tickets (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL CHECK (status IN ('open', 'pending', 'resolved')),
    subject TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high'))
);

INSERT INTO support.tickets (user_email, opened_at, status, subject, priority)
SELECT
    'user' || ((i % 100) + 1) || '@example.com',
    now() - ((random() * 60)::int || ' days')::interval,
    (ARRAY['open', 'pending', 'resolved', 'resolved'])[floor(random() * 4 + 1)],
    (ARRAY['Billing question', 'Login issue', 'Feature request', 'Bug report', 'Account upgrade'])[floor(random() * 5 + 1)],
    (ARRAY['low', 'medium', 'medium', 'high'])[floor(random() * 4 + 1)]
FROM generate_series(1, 50) AS i;

-- ---------------------------------------------------------------------------
-- Read-only role (matches DATABASE_URL in .env.example)
-- Grants cover every seeded schema — scout will only see what this role can access.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    CREATE ROLE analyst_agent LOGIN PASSWORD 'analyst_pw';
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;

GRANT CONNECT ON DATABASE prod TO analyst_agent;

GRANT USAGE ON SCHEMA analytics TO analyst_agent;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO analyst_agent;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT SELECT ON TABLES TO analyst_agent;

GRANT USAGE ON SCHEMA support TO analyst_agent;
GRANT SELECT ON ALL TABLES IN SCHEMA support TO analyst_agent;
ALTER DEFAULT PRIVILEGES IN SCHEMA support GRANT SELECT ON TABLES TO analyst_agent;

ALTER ROLE analyst_agent SET statement_timeout = '30s';
ALTER ROLE analyst_agent SET default_transaction_read_only = on;
