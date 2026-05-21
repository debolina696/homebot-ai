from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import psycopg2
import psycopg2.extras

load_dotenv()

app = Flask(__name__)
CORS(app)

# ── Database connection function ──
def get_db():
    conn = psycopg2.connect(
        host     = os.getenv("DB_HOST", "localhost"),
        database = os.getenv("DB_NAME", "homebot_db"),
        user     = os.getenv("DB_USER", "postgres"),
        password = os.getenv("DB_PASSWORD", "runka@1993"),
        port     = 5432
    )
    return conn

# ── Route 1: Health check ──
@app.route("/")
def home():
    return jsonify({
        "message": "HomeBot AI Backend Running",
        "version": "1.0",
        "status":  "ok"
    })

# ── Route 2: Get all rooms from database ──
@app.route("/api/rooms", methods=["GET"])
def get_rooms():
    try:
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM rooms ORDER BY id")
        rooms  = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"rooms": list(rooms)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── Route 3: Get products by room from database ──
@app.route("/api/products/<int:room_id>", methods=["GET"])
def get_products(room_id):
    try:
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            "SELECT * FROM products WHERE room_id = %s ORDER BY id",
            (room_id,)
        )
        products = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"room_id": room_id, "products": list(products)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── Route 4: AI chat endpoint ──
@app.route("/api/chat", methods=["POST"])
def chat():
    data         = request.get_json()
    user_message = data.get("message", "")
    room         = data.get("room", "general")
    response     = f"You asked about {room}: '{user_message}'. I will recommend the best products shortly!"
    return jsonify({"reply": response, "room": room, "status": "ok"})

# ── Route 5: Budget calculator ──
@app.route("/api/budget", methods=["POST"])
def calculate_budget():
    data        = request.get_json()
    items       = data.get("items", [])
    total       = sum(item.get("price", 0) * item.get("qty", 1) for item in items)
    gst         = round(total * 0.18, 2)
    grand_total = round(total + gst, 2)
    return jsonify({
        "subtotal":   total,
        "gst_18pct":  gst,
        "grand_total": grand_total,
        "currency":   "INR"
    })

# ── Route 6: Add product to cart ──
@app.route("/api/cart", methods=["POST"])
def add_to_cart():
    try:
        data       = request.get_json()
        user_id    = data.get("user_id", 1)
        product_id = data.get("product_id")
        quantity   = data.get("quantity", 1)
        conn       = get_db()
        cursor     = conn.cursor()
        cursor.execute(
            "INSERT INTO cart (user_id, product_id, quantity) VALUES (%s, %s, %s)",
            (user_id, product_id, quantity)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Added to cart", "status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)