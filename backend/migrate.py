import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
import os

load_dotenv()

# Local database
local_conn = psycopg2.connect(
    host     = "localhost",
    database = "homebot_db",
    user     = "postgres",
    password = "runka@1993",
    port     = 5432
)

# Neon cloud database
neon_conn = psycopg2.connect(
    "postgresql://neondb_owner:npg_wx4W9HSBZoRA@ep-old-voice-aobcd4io.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
)

local_cur = local_conn.cursor(
    cursor_factory=psycopg2.extras.RealDictCursor
)
neon_cur  = neon_conn.cursor()

print("Connected to both databases!")

# ── Step 1: Create tables in Neon ──
print("Creating tables...")

neon_cur.execute("""
CREATE TABLE IF NOT EXISTS rooms (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    icon        VARCHAR(10),
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    room_id     INTEGER REFERENCES rooms(id),
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    price       NUMERIC(10,2) NOT NULL,
    unit        VARCHAR(50),
    stock_qty   INTEGER DEFAULT 0,
    style_tag   VARCHAR(100),
    image_url   TEXT,
    brand       VARCHAR(100),
    length_cm   NUMERIC(10,2),
    width_cm    NUMERIC(10,2),
    height_cm   NUMERIC(10,2),
    weight_kg   NUMERIC(10,2),
    color       VARCHAR(100),
    material    VARCHAR(100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    email        VARCHAR(200) UNIQUE NOT NULL,
    phone        VARCHAR(15),
    language     VARCHAR(20) DEFAULT 'english',
    city         VARCHAR(100),
    password     VARCHAR(255),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER REFERENCES users(id),
    total_amount NUMERIC(10,2),
    gst_amount   NUMERIC(10,2),
    grand_total  NUMERIC(10,2),
    status       VARCHAR(50) DEFAULT 'pending',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id          SERIAL PRIMARY KEY,
    order_id    INTEGER REFERENCES orders(id),
    product_id  INTEGER REFERENCES products(id),
    quantity    INTEGER NOT NULL,
    price       NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS cart (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id),
    product_id  INTEGER REFERENCES products(id),
    quantity    INTEGER DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""")
neon_conn.commit()
print("Tables created!")

# ── Step 2: Migrate rooms ──
print("Migrating rooms...")
local_cur.execute("SELECT * FROM rooms ORDER BY id")
rooms = local_cur.fetchall()
for room in rooms:
    neon_cur.execute(
        """INSERT INTO rooms (id, name, icon, description)
           VALUES (%s, %s, %s, %s)
           ON CONFLICT (id) DO NOTHING""",
        (room["id"], room["name"], room["icon"], room["description"])
    )
neon_conn.commit()
print(f"Migrated {len(rooms)} rooms!")

# ── Step 3: Migrate products ──
print("Migrating products...")
local_cur.execute("SELECT * FROM products ORDER BY id")
products = local_cur.fetchall()
for p in products:
    neon_cur.execute(
        """INSERT INTO products
           (id, room_id, name, description, price, unit,
            stock_qty, style_tag, image_url, brand,
            length_cm, width_cm, height_cm,
            color, material)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
           ON CONFLICT (id) DO NOTHING""",
        (
            p["id"], p["room_id"], p["name"],
            p["description"], p["price"], p["unit"],
            p["stock_qty"], p["style_tag"], p["image_url"],
            p["brand"], p["length_cm"], p["width_cm"],
            p["height_cm"], p["color"], p["material"]
        )
    )
neon_conn.commit()
print(f"Migrated {len(products)} products!")

# ── Step 4: Migrate users ──
print("Migrating users...")
local_cur.execute("SELECT * FROM users ORDER BY id")
users = local_cur.fetchall()
for u in users:
    neon_cur.execute(
        """INSERT INTO users
           (id, name, email, phone, language, city, password)
           VALUES (%s,%s,%s,%s,%s,%s,%s)
           ON CONFLICT (id) DO NOTHING""",
        (
            u["id"], u["name"], u["email"],
            u["phone"], u["language"],
            u["city"], u["password"]
        )
    )
neon_conn.commit()
print(f"Migrated {len(users)} users!")

# ── Step 5: Migrate orders ──
print("Migrating orders...")
local_cur.execute("SELECT * FROM orders ORDER BY id")
orders = local_cur.fetchall()
for o in orders:
    neon_cur.execute(
        """INSERT INTO orders
           (id, user_id, total_amount, gst_amount,
            grand_total, status)
           VALUES (%s,%s,%s,%s,%s,%s)
           ON CONFLICT (id) DO NOTHING""",
        (
            o["id"], o["user_id"], o["total_amount"],
            o["gst_amount"], o["grand_total"], o["status"]
        )
    )
neon_conn.commit()
print(f"Migrated {len(orders)} orders!")

# ── Step 6: Migrate order items ──
print("Migrating order items...")
local_cur.execute("SELECT * FROM order_items ORDER BY id")
items = local_cur.fetchall()
for item in items:
    neon_cur.execute(
        """INSERT INTO order_items
           (id, order_id, product_id, quantity, price)
           VALUES (%s,%s,%s,%s,%s)
           ON CONFLICT (id) DO NOTHING""",
        (
            item["id"], item["order_id"],
            item["product_id"], item["quantity"],
            item["price"]
        )
    )
neon_conn.commit()
print(f"Migrated {len(items)} order items!")

# ── Done ──
local_cur.close()
local_conn.close()
neon_cur.close()
neon_conn.close()

print("")
print("Migration complete!")
print(f"Rooms    : {len(rooms)}")
print(f"Products : {len(products)}")
print(f"Users    : {len(users)}")
print(f"Orders   : {len(orders)}")
print(f"Items    : {len(items)}")