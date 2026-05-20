from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allows React frontend to talk to this backend

# ── Route 1: Health check ──
@app.route("/")
def home():
    return jsonify({
        "message": "HomeBot AI Backend Running",
        "version": "1.0",
        "status": "ok"
    })

# ── Route 2: Get all rooms ──
@app.route("/api/rooms", methods=["GET"])
def get_rooms():
    rooms = [
        {"id": 1, "name": "Bathroom",    "icon": "🛁"},
        {"id": 2, "name": "Bedroom",     "icon": "🛏️"},
        {"id": 3, "name": "Kitchen",     "icon": "🍳"},
        {"id": 4, "name": "Living Room", "icon": "🛋️"},
        {"id": 5, "name": "Dining Room", "icon": "🍽️"},
        {"id": 6, "name": "Study Room",  "icon": "📚"},
        {"id": 7, "name": "Puja Room",   "icon": "🙏"},
        {"id": 8, "name": "Exterior",    "icon": "🏗️"}
    ]
    return jsonify({"rooms": rooms})

# ── Route 3: Get products by room ──
@app.route("/api/products/<int:room_id>", methods=["GET"])
def get_products(room_id):
    # Sample products — we will replace with real database in Day 5
    sample_products = {
        1: [
            {"id": 101, "name": "RAK Ceramic Floor Tile", "price": 850,  "unit": "per sqft"},
            {"id": 102, "name": "Jaquar Shower System",   "price": 12000,"unit": "per set"},
            {"id": 103, "name": "Hindware Wall Tap",      "price": 2200, "unit": "per piece"},
        ],
        2: [
            {"id": 201, "name": "Wooden Wardrobe 6ft",    "price": 18000,"unit": "per piece"},
            {"id": 202, "name": "LED Ceiling Light",      "price": 1500, "unit": "per piece"},
        ],
        3: [
            {"id": 301, "name": "Franke Kitchen Sink",    "price": 8500, "unit": "per piece"},
            {"id": 302, "name": "Modular Cabinet Set",    "price": 45000,"unit": "per set"},
        ]
    }
    products = sample_products.get(room_id, [])
    return jsonify({"room_id": room_id, "products": products})

# ── Route 4: AI chat endpoint (Claude) ──
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")
    room = data.get("room", "general")

    # We will connect real Claude API here in Phase 3
    # For now returning a smart placeholder response
    response = f"You asked about {room}: '{user_message}'. " \
               f"I will recommend the best products for your {room} shortly!"

    return jsonify({
        "reply": response,
        "room": room,
        "status": "ok"
    })

# ── Route 5: Budget calculator ──
@app.route("/api/budget", methods=["POST"])
def calculate_budget():
    data = request.get_json()
    items = data.get("items", [])

    total = sum(item.get("price", 0) * item.get("qty", 1) for item in items)
    gst = round(total * 0.18, 2)  # 18% GST
    grand_total = round(total + gst, 2)

    return jsonify({
        "subtotal":    total,
        "gst_18pct":   gst,
        "grand_total": grand_total,
        "currency":    "INR"
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)