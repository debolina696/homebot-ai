from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from dotenv import load_dotenv
import os
import psycopg2
import psycopg2.extras
from google import genai
from langdetect import detect
from deep_translator import GoogleTranslator
import io

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini AI
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Language map
LANGUAGE_MAP = {
    "hi": "Hindi",
    "bn": "Bengali",
    "te": "Telugu",
    "ta": "Tamil",
    "mr": "Marathi",
    "gu": "Gujarati",
    "kn": "Kannada",
    "ml": "Malayalam",
    "pa": "Punjabi",
    "ur": "Urdu",
    "or": "Odia",
    "as": "Assamese",
    "en": "English"
}

# Database connection
def get_db():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "homebot_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "runka@1993"),
        port=5432
    )

# Translate helper
def translate(text, from_lang, to_lang):
    if from_lang == to_lang:
        return text
    try:
        return GoogleTranslator(
            source=from_lang,
            target=to_lang
        ).translate(text)
    except:
        return text

# Route 1: Health check
@app.route("/")
def home():
    return jsonify({
        "message": "HomeBot AI Backend Running",
        "version": "2.0",
        "status": "ok",
        "ai": "Gemini connected"
    })

# Route 2: Get all rooms
@app.route("/api/rooms", methods=["GET"])
def get_rooms():
    try:
        conn = get_db()
        cursor = conn.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )
        cursor.execute("SELECT * FROM rooms ORDER BY id")
        rooms = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"rooms": list(rooms)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route 3: Get products by room
@app.route("/api/products/<int:room_id>", methods=["GET"])
def get_products(room_id):
    try:
        conn = get_db()
        cursor = conn.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )
        cursor.execute(
            "SELECT * FROM products WHERE room_id = %s ORDER BY id",
            (room_id,)
        )
        products = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({
            "room_id": room_id,
            "products": list(products)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route 4: AI Multilingual Chat
@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("message", "")
        room = data.get("room", "general")
        budget = data.get("budget", None)

        # Detect language
        try:
            detected_lang = detect(user_message)
        except:
            detected_lang = "en"

        lang_name = LANGUAGE_MAP.get(detected_lang, "English")

        # Translate to English
        if detected_lang != "en":
            english_message = translate(
                user_message, detected_lang, "en"
            )
        else:
            english_message = user_message

        # Build prompt
        if budget:
            budget_text = f"Customer budget: Rs.{budget}"
        else:
            budget_text = "Budget not specified"

        prompt = f"""You are HomeBot AI, an expert interior design assistant for Indian homes. You help customers choose the right products for home renovation.

Room: {room}
{budget_text}
Customer message: {english_message}

Give a helpful friendly product recommendation in 2-3 sentences. Mention 1-2 specific product types they should consider. Keep it conversational and relevant to Indian homes."""

        # Get Gemini response
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        english_response = response.text

        # Translate back to user language
        if detected_lang != "en":
            final_response = translate(
                english_response, "en", detected_lang
            )
        else:
            final_response = english_response

        return jsonify({
            "reply": final_response,
            "detected_lang": lang_name,
            "room": room,
            "status": "ok"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route 5: Budget calculator
@app.route("/api/budget", methods=["POST"])
def calculate_budget():
    data = request.get_json()
    items = data.get("items", [])
    total = sum(
        item.get("price", 0) * item.get("qty", 1)
        for item in items
    )
    gst = round(total * 0.18, 2)
    grand_total = round(total + gst, 2)
    return jsonify({
        "subtotal": total,
        "gst_18pct": gst,
        "grand_total": grand_total,
        "currency": "INR"
    })

# Route 6: Add to cart
@app.route("/api/cart", methods=["POST"])
def add_to_cart():
    try:
        data = request.get_json()
        user_id = data.get("user_id", 1)
        product_id = data.get("product_id")
        quantity = data.get("quantity", 1)
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO cart (user_id, product_id, quantity) VALUES (%s, %s, %s)",
            (user_id, product_id, quantity)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({
            "message": "Added to cart",
            "status": "ok"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route 7: Generate PDF Quote
@app.route("/api/generate-pdf", methods=["POST"])
def generate_pdf():
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib.units import inch

        data       = request.get_json()
        items      = data.get("items", [])
        budget     = data.get("budget", 0)
        room       = data.get("room", "Home")

        # Calculate totals
        subtotal   = sum(i["price"] * i["qty"] for i in items)
        gst        = round(subtotal * 0.18, 2)
        grandtotal = round(subtotal + gst, 2)

        # Create PDF in memory
        buffer = io.BytesIO()
        doc    = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )
        styles = getSampleStyleSheet()
        story  = []

        # Title
        story.append(Paragraph(
            "<b>HomeBot AI — Product Quotation</b>",
            styles["Title"]
        ))
        story.append(Spacer(1, 0.2 * inch))
        story.append(Paragraph(
            f"<b>Room:</b> {room}",
            styles["Normal"]
        ))
        story.append(Paragraph(
            f"<b>Budget:</b> Rs.{int(budget):,}",
            styles["Normal"]
        ))
        story.append(Spacer(1, 0.3 * inch))

        # Table data
        table_data = [["Product", "Price (Rs.)", "Qty", "Total (Rs.)"]]
        for item in items:
            table_data.append([
                str(item["name"]),
                f"{int(item['price']):,}",
                str(item["qty"]),
                f"{int(item['price'] * item['qty']):,}"
            ])

        # Totals rows
        table_data.append(["", "", "Subtotal",   f"{int(subtotal):,}"])
        table_data.append(["", "", "GST 18%",    f"{int(gst):,}"])
        table_data.append(["", "", "Grand Total", f"{int(grandtotal):,}"])

        # Build table
        table = Table(
            table_data,
            colWidths=[3*inch, 1.3*inch, 1.1*inch, 1.3*inch]
        )
        table.setStyle(TableStyle([
            ("BACKGROUND",     (0, 0),  (-1, 0),  colors.HexColor("#BA7517")),
            ("TEXTCOLOR",      (0, 0),  (-1, 0),  colors.white),
            ("FONTNAME",       (0, 0),  (-1, 0),  "Helvetica-Bold"),
            ("FONTSIZE",       (0, 0),  (-1, 0),  11),
            ("ALIGN",          (0, 0),  (-1, -1), "CENTER"),
            ("BACKGROUND",     (0, -1), (-1, -1), colors.HexColor("#BA7517")),
            ("TEXTCOLOR",      (0, -1), (-1, -1), colors.white),
            ("FONTNAME",       (0, -1), (-1, -1), "Helvetica-Bold"),
            ("GRID",           (0, 0),  (-1, -1), 0.5, colors.grey),
            ("PADDING",        (0, 0),  (-1, -1), 8),
            ("ROWBACKGROUNDS", (0, 1),  (-1, -4),
             [colors.white, colors.HexColor("#FFF3DC")]),
        ]))

        story.append(table)
        story.append(Spacer(1, 0.3 * inch))
        story.append(Paragraph(
            "Thank you for using HomeBot AI!",
            styles["Normal"]
        ))
        story.append(Paragraph(
            "Share this quote with your contractor or interior designer.",
            styles["Normal"]
        ))

        # Build and send PDF
        doc.build(story)
        pdf_data = buffer.getvalue()
        buffer.close()

        response = make_response(pdf_data)
        response.headers["Content-Type"]        = "application/pdf"
        response.headers["Content-Disposition"] = "attachment; filename=HomeBot_Quotation.pdf"
        response.headers["Content-Length"]      = len(pdf_data)
        return response

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    # Route 9: User Login
@app.route("/api/login", methods=["POST"])
def login():
    try:
        data     = request.get_json()
        email    = data.get("email", "")
        password = data.get("password", "")

        conn   = get_db()
        cursor = conn.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )
        cursor.execute(
            "SELECT * FROM users WHERE email = %s AND password = %s",
            (email, password)
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user:
            return jsonify({
                "status":  "ok",
                "message": "Login successful",
                "user": {
                    "id":       user["id"],
                    "name":     user["name"],
                    "email":    user["email"],
                    "language": user["language"],
                    "city":     user["city"]
                }
            })
        else:
            return jsonify({
                "status":  "error",
                "message": "Invalid email or password"
            }), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route 10: User Registration
@app.route("/api/register", methods=["POST"])
def register():
    try:
        data     = request.get_json()
        name     = data.get("name", "")
        email    = data.get("email", "")
        password = data.get("password", "")
        phone    = data.get("phone", "")
        city     = data.get("city", "")
        language = data.get("language", "english")

        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO users
               (name, email, password, phone, city, language)
               VALUES (%s, %s, %s, %s, %s, %s)
               RETURNING id""",
            (name, email, password, phone, city, language)
        )
        user_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "status":  "ok",
            "message": "Registration successful",
            "user_id": user_id
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route 11: Search and filter products
@app.route("/api/search", methods=["GET"])
def search_products():
    try:
        query      = request.args.get("q", "")
        room_id    = request.args.get("room_id", None)
        min_price  = request.args.get("min_price", 0)
        max_price  = request.args.get("max_price", 999999)
        style      = request.args.get("style", None)
        brand      = request.args.get("brand", None)

        conn   = get_db()
        cursor = conn.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )

        # Build dynamic SQL query
        sql    = "SELECT p.*, r.name as room_name FROM products p JOIN rooms r ON p.room_id = r.id WHERE 1=1"
        params = []

        if query:
            sql += " AND (LOWER(p.name) LIKE %s OR LOWER(p.description) LIKE %s OR LOWER(p.brand) LIKE %s)"
            params.extend([f"%{query.lower()}%", f"%{query.lower()}%", f"%{query.lower()}%"])

        if room_id:
            sql += " AND p.room_id = %s"
            params.append(int(room_id))

        if min_price:
            sql += " AND p.price >= %s"
            params.append(float(min_price))

        if max_price:
            sql += " AND p.price <= %s"
            params.append(float(max_price))

        if style:
            sql += " AND LOWER(p.style_tag) = %s"
            params.append(style.lower())

        if brand:
            sql += " AND LOWER(p.brand) = %s"
            params.append(brand.lower())

        sql += " ORDER BY p.price ASC"

        cursor.execute(sql, params)
        products = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify({
            "products": list(products),
            "count":    len(products),
            "query":    query
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Route 12: Get all brands
@app.route("/api/brands", methods=["GET"])
def get_brands():
    try:
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT DISTINCT brand FROM products ORDER BY brand"
        )
        brands = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return jsonify({"brands": brands})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Route 13: Get all styles
@app.route("/api/styles", methods=["GET"])
def get_styles():
    try:
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT DISTINCT style_tag FROM products ORDER BY style_tag"
        )
        styles = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return jsonify({"styles": styles})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
# Route 14: Place order
@app.route("/api/orders", methods=["POST"])
def place_order():
    try:
        data       = request.get_json()
        user_id    = data.get("user_id", 1)
        items      = data.get("items", [])
        room       = data.get("room", "Home")

        if not items:
            return jsonify({"error": "No items in order"}), 400

        # Calculate totals
        subtotal    = sum(i["price"] * i["qty"] for i in items)
        gst         = round(subtotal * 0.18, 2)
        grand_total = round(subtotal + gst, 2)

        conn   = get_db()
        cursor = conn.cursor()

        # Insert order
        cursor.execute(
            """INSERT INTO orders
               (user_id, total_amount, gst_amount, grand_total, status)
               VALUES (%s, %s, %s, %s, %s)
               RETURNING id""",
            (user_id, subtotal, gst, grand_total, "pending")
        )
        order_id = cursor.fetchone()[0]

        # Insert order items
        for item in items:
            cursor.execute(
                """INSERT INTO order_items
                   (order_id, product_id, quantity, price)
                   VALUES (%s, %s, %s, %s)""",
                (order_id, item["id"], item["qty"], item["price"])
            )

            # Update stock
            cursor.execute(
                """UPDATE products
                   SET stock_qty = stock_qty - %s
                   WHERE id = %s""",
                (item["qty"], item["id"])
            )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "status":      "ok",
            "message":     "Order placed successfully!",
            "order_id":    order_id,
            "grand_total": grand_total
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Route 15: Get user orders
@app.route("/api/orders/<int:user_id>", methods=["GET"])
def get_orders(user_id):
    try:
        conn   = get_db()
        cursor = conn.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )

        # Get orders
        cursor.execute(
            """SELECT o.*,
               COUNT(oi.id) as item_count
               FROM orders o
               LEFT JOIN order_items oi ON o.id = oi.order_id
               WHERE o.user_id = %s
               GROUP BY o.id
               ORDER BY o.created_at DESC""",
            (user_id,)
        )
        orders = cursor.fetchall()

        # Get items for each order
        result = []
        for order in orders:
            cursor.execute(
                """SELECT oi.*, p.name as product_name
                   FROM order_items oi
                   JOIN products p ON oi.product_id = p.id
                   WHERE oi.order_id = %s""",
                (order["id"],)
            )
            items = cursor.fetchall()
            order_dict = dict(order)
            order_dict["items"] = list(items)
            order_dict["created_at"] = str(order["created_at"])
            result.append(order_dict)

        cursor.close()
        conn.close()

        return jsonify({"orders": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Route 16: Update order status
@app.route("/api/orders/<int:order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    try:
        data   = request.get_json()
        status = data.get("status", "pending")

        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE orders SET status = %s WHERE id = %s",
            (status, order_id)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "status":  "ok",
            "message": f"Order {order_id} updated to {status}"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
# Route 17: Track single order
@app.route("/api/track/<int:order_id>", methods=["GET"])
def track_order(order_id):
    try:
        conn   = get_db()
        cursor = conn.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )
        cursor.execute(
            """SELECT o.*, u.name as customer_name,
               u.email, u.phone, u.city
               FROM orders o
               JOIN users u ON o.user_id = u.id
               WHERE o.id = %s""",
            (order_id,)
        )
        order = cursor.fetchone()

        if not order:
            return jsonify({"error": "Order not found"}), 404

        cursor.execute(
            """SELECT oi.*, p.name as product_name,
               p.brand, r.name as room_name
               FROM order_items oi
               JOIN products p ON oi.product_id = p.id
               JOIN rooms r ON p.room_id = r.id
               WHERE oi.order_id = %s""",
            (order_id,)
        )
        items = cursor.fetchall()
        cursor.close()
        conn.close()

        order_dict = dict(order)
        order_dict["items"]      = list(items)
        order_dict["created_at"] = str(order["created_at"])

        # Build tracking timeline
        status = order["status"]
        timeline = [
            {
                "step":   "Order Placed",
                "icon":   "📋",
                "done":   True,
                "desc":   "Your order has been received"
            },
            {
                "step":   "Processing",
                "icon":   "⚙️",
                "done":   status in ["processing", "shipped", "delivered"],
                "desc":   "We are preparing your items"
            },
            {
                "step":   "Shipped",
                "icon":   "🚚",
                "done":   status in ["shipped", "delivered"],
                "desc":   "Your order is on the way"
            },
            {
                "step":   "Delivered",
                "icon":   "✅",
                "done":   status == "delivered",
                "desc":   "Order delivered successfully"
            },
        ]

        order_dict["timeline"] = timeline
        return jsonify({"order": order_dict})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Route 18: Get user profile
@app.route("/api/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):
    try:
        conn   = get_db()
        cursor = conn.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )

        # Get user details
        cursor.execute(
            "SELECT id, name, email, phone, city, language FROM users WHERE id = %s",
            (user_id,)
        )
        user = cursor.fetchone()

        # Get order stats
        cursor.execute(
            """SELECT
               COUNT(*) as total_orders,
               COALESCE(SUM(grand_total), 0) as total_spent,
               COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
               COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
               FROM orders WHERE user_id = %s""",
            (user_id,)
        )
        stats = cursor.fetchone()
        cursor.close()
        conn.close()

        return jsonify({
            "user":  dict(user),
            "stats": dict(stats)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Route 19: Update user profile
@app.route("/api/profile/<int:user_id>", methods=["PUT"])
def update_profile(user_id):
    try:
        data     = request.get_json()
        name     = data.get("name")
        phone    = data.get("phone")
        city     = data.get("city")
        language = data.get("language")

        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE users SET
               name = %s, phone = %s,
               city = %s, language = %s
               WHERE id = %s""",
            (name, phone, city, language, user_id)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "status":  "ok",
            "message": "Profile updated successfully"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == "__main__":
    app.run(debug=True, port=5000) 
    # Route 8: Send WhatsApp notification
@app.route("/api/notify-whatsapp", methods=["POST"])
def notify_whatsapp():
    try:
        from twilio.rest import Client

        data       = request.get_json()
        items      = data.get("items", [])
        total      = data.get("total", 0)
        room       = data.get("room", "Home")
        phone      = data.get("phone", os.getenv("YOUR_WHATSAPP"))

        # Build message
        item_list  = "\n".join([
            f"• {i['name']} x{i['qty']} = Rs.{int(i['price']*i['qty']):,}"
            for i in items
        ])

        message = f"""🏠 *HomeBot AI — Order Confirmation*

Room: {room}
Items:
{item_list}

💰 Grand Total: Rs.{int(total):,}

Thank you for using HomeBot AI!
Share your PDF quote with your contractor."""

        # Send WhatsApp
        client = Client(
            os.getenv("TWILIO_SID"),
            os.getenv("TWILIO_TOKEN")
        )
        client.messages.create(
            from_=os.getenv("TWILIO_WHATSAPP"),
            to=phone,
            body=message
        )

        return jsonify({
            "message": "WhatsApp notification sent!",
            "status": "ok"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500  
    