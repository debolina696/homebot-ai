import psycopg2

conn = psycopg2.connect('postgresql://neondb_owner:npg_wx4W9HSBZoRA@ep-old-voice-aobcd4io.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS festival_sales (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    discount_pct INTEGER DEFAULT 10,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    banner_color VARCHAR(20) DEFAULT '#BA7517',
    emoji VARCHAR(20) DEFAULT 'sale',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS sale_products (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER,
    product_id INTEGER,
    discount_pct INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
INSERT INTO festival_sales (name, description, discount_pct, start_date, end_date, banner_color, emoji)
VALUES ('Diwali Dhamaka Sale', 'Biggest sale! Up to 30 percent off', 30, NOW(), NOW() + INTERVAL '10 days', '#FF6B00', 'Diwali')
ON CONFLICT DO NOTHING
""")

cur.execute("""
INSERT INTO festival_sales (name, description, discount_pct, start_date, end_date, banner_color, emoji)
VALUES ('Summer Renovation Sale', '20 percent off bathroom kitchen', 20, NOW(), NOW() + INTERVAL '7 days', '#0066CC', 'Summer')
ON CONFLICT DO NOTHING
""")

cur.execute("""
INSERT INTO festival_sales (name, description, discount_pct, start_date, end_date, banner_color, emoji)
VALUES ('Puja Room Special', '25 percent off puja items', 25, NOW(), NOW() + INTERVAL '5 days', '#8B00FF', 'Puja')
ON CONFLICT DO NOTHING
""")

conn.commit()
cur.close()
conn.close()
print('Neon festival sales created successfully!')