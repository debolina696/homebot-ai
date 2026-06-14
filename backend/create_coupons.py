import psycopg2

conn = psycopg2.connect('postgresql://neondb_owner:npg_wx4W9HSBZoRA@ep-old-voice-aobcd4io.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS coupons (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(50) UNIQUE NOT NULL,
    description     TEXT,
    discount_type   VARCHAR(20) DEFAULT 'percent',
    discount_value  NUMERIC(10,2) NOT NULL,
    min_order_value NUMERIC(10,2) DEFAULT 0,
    max_discount    NUMERIC(10,2) DEFAULT 99999,
    usage_limit     INTEGER DEFAULT 100,
    used_count      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    valid_from      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until     TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 days',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS coupon_usage (
    id         SERIAL PRIMARY KEY,
    coupon_id  INTEGER,
    user_id    INTEGER,
    order_id   INTEGER,
    discount   NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

coupons = [
    ('WELCOME10',  'Welcome! 10% off on first order',        'percent', 10,  500,   2000),
    ('HOMEBOT20',  'Special HomeBot offer 20% off',          'percent', 20,  1000,  5000),
    ('DIWALI30',   'Diwali special 30% off',                 'percent', 30,  2000,  10000),
    ('FLAT500',    'Flat 500 off on orders above 3000',      'flat',    500, 3000,  500),
    ('NEWUSER15',  'New user special 15% off',               'percent', 15,  800,   3000),
    ('SUMMER25',   'Summer sale extra 25% off',              'percent', 25,  1500,  7000),
]

for c in coupons:
    cur.execute("""
        INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, max_discount)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (code) DO NOTHING
    """, c)

conn.commit()
cur.close()
conn.close()
print('Coupons created in Neon!')