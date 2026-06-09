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

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

LANGUAGE_MAP = {
    "hi": "Hindi", "bn": "Bengali", "te": "Telugu",
    "ta": "Tamil", "mr": "Marathi", "gu": "Gujarati",
    "kn": "Kannada", "ml": "Malayalam", "pa": "Punjabi",
    "ur": "Urdu", "or": "Odia", "as": "Assamese", "en": "English"
}

def get_db():
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return psycopg2.connect(database_url, sslmode="require")
    return psycopg2.connect(
        host     = os.getenv("DB_HOST",     "localhost"),
        database = os.getenv("DB_NAME",     "homebot_db"),
        user     = os.getenv("DB_USER",     "postgres"),
        password = os.getenv("DB_PASSWORD", "runka@1993"),
        port     = 5432
    )

def translate(text, from_lang, to_lang):
    if from_lang == to_lang:
        return text
    try:
        return GoogleTranslator(source=from_lang, target=to_lang).translate(text)
    except:
        return text

@app.route("/")
def home():
    return jsonify({"message": "HomeBot AI Backend Running", "version": "2.0", "status": "ok"})

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
        print(f"get_rooms error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/products/<int:room_id>", methods=["GET"])
def get_products(room_id):
    try:
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            """SELECT p.*,
               COALESCE(AVG(pr.rating), 0) as avg_rating,
               COUNT(pr.id) as review_count
               FROM products p
               LEFT JOIN product_reviews pr ON pr.product_id = p.id
               WHERE p.room_id = %s
               GROUP BY p.id
               ORDER BY p.id""",
            (room_id,)
        )
        products = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"room_id": room_id, "products": list(products)})
    except Exception as e:
        print(f"get_products error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data         = request.get_json()
        user_message = data.get("message", "")
        room         = data.get("room", "general")
        budget       = data.get("budget", None)
        try:
            detected_lang = detect(user_message)
        except:
            detected_lang = "en"
        lang_name = LANGUAGE_MAP.get(detected_lang, "English")
        if detected_lang != "en":
            english_message = translate(user_message, detected_lang, "en")
        else:
            english_message = user_message
        budget_text = f"Customer budget: Rs.{budget}" if budget else "Budget not specified"
        prompt = f"""You are HomeBot AI, an expert interior design assistant for Indian homes.
Room: {room}
{budget_text}
Customer message: {english_message}
Give a helpful friendly recommendation in 2-3 sentences."""
        response         = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        english_response = response.text
        if detected_lang != "en":
            final_response = translate(english_response, "en", detected_lang)
        else:
            final_response = english_response
        return jsonify({"reply": final_response, "detected_lang": lang_name, "status": "ok"})
    except Exception as e:
        print(f"chat error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/budget", methods=["POST"])
def calculate_budget():
    data        = request.get_json()
    items       = data.get("items", [])
    total       = sum(item.get("price", 0) * item.get("qty", 1) for item in items)
    gst         = round(total * 0.18, 2)
    grand_total = round(total + gst, 2)
    return jsonify({"subtotal": total, "gst_18pct": gst, "grand_total": grand_total, "currency": "INR"})

@app.route("/api/cart", methods=["POST"])
def add_to_cart():
    try:
        data   = request.get_json()
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO cart (user_id, product_id, quantity) VALUES (%s,%s,%s)",
            (data.get("user_id", 1), data.get("product_id"), data.get("quantity", 1))
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Added to cart", "status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        subtotal   = sum(i["price"] * i["qty"] for i in items)
        gst        = round(subtotal * 0.18, 2)
        grandtotal = round(subtotal + gst, 2)
        buffer     = io.BytesIO()
        doc        = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        styles     = getSampleStyleSheet()
        story      = []
        story.append(Paragraph("<b>HomeBot AI — Product Quotation</b>", styles["Title"]))
        story.append(Spacer(1, 0.2 * inch))
        story.append(Paragraph(f"<b>Room:</b> {room}", styles["Normal"]))
        story.append(Paragraph(f"<b>Budget:</b> Rs.{int(budget):,}", styles["Normal"]))
        story.append(Spacer(1, 0.3 * inch))
        table_data = [["Product", "Price (Rs.)", "Qty", "Total (Rs.)"]]
        for item in items:
            table_data.append([str(item["name"]), f"{int(item['price']):,}", str(item["qty"]), f"{int(item['price'] * item['qty']):,}"])
        table_data.append(["", "", "Subtotal",    f"{int(subtotal):,}"])
        table_data.append(["", "", "GST 18%",     f"{int(gst):,}"])
        table_data.append(["", "", "Grand Total", f"{int(grandtotal):,}"])
        table = Table(table_data, colWidths=[3*inch, 1.3*inch, 1.1*inch, 1.3*inch])
        table.setStyle(TableStyle([
            ("BACKGROUND",     (0,0),  (-1,0),  colors.HexColor("#BA7517")),
            ("TEXTCOLOR",      (0,0),  (-1,0),  colors.white),
            ("FONTNAME",       (0,0),  (-1,0),  "Helvetica-Bold"),
            ("ALIGN",          (0,0),  (-1,-1), "CENTER"),
            ("BACKGROUND",     (0,-1), (-1,-1), colors.HexColor("#BA7517")),
            ("TEXTCOLOR",      (0,-1), (-1,-1), colors.white),
            ("FONTNAME",       (0,-1), (-1,-1), "Helvetica-Bold"),
            ("GRID",           (0,0),  (-1,-1), 0.5, colors.grey),
            ("PADDING",        (0,0),  (-1,-1), 8),
            ("ROWBACKGROUNDS", (0,1),  (-1,-4), [colors.white, colors.HexColor("#FFF3DC")]),
        ]))
        story.append(table)
        story.append(Spacer(1, 0.3*inch))
        story.append(Paragraph("Thank you for using HomeBot AI!", styles["Normal"]))
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

@app.route("/api/notify-whatsapp", methods=["POST"])
def notify_whatsapp():
    try:
        from twilio.rest import Client
        data      = request.get_json()
        items     = data.get("items", [])
        total     = data.get("total", 0)
        room      = data.get("room", "Home")
        phone     = data.get("phone", os.getenv("YOUR_WHATSAPP"))
        item_list = "\n".join([f"• {i['name']} x{i['qty']} = Rs.{int(i['price']*i['qty']):,}" for i in items])
        message   = f"🏠 *HomeBot AI*\nRoom: {room}\n{item_list}\n💰 Total: Rs.{int(total):,}"
        tc = Client(os.getenv("TWILIO_SID"), os.getenv("TWILIO_TOKEN"))
        tc.messages.create(from_=os.getenv("TWILIO_WHATSAPP"), to=phone, body=message)
        return jsonify({"message": "WhatsApp sent!", "status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/login", methods=["POST"])
def login():
    try:
        data   = request.get_json()
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            "SELECT * FROM users WHERE email = %s AND password = %s",
            (data.get("email"), data.get("password"))
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        if user:
            return jsonify({"status": "ok", "user": {"id": user["id"], "name": user["name"], "email": user["email"], "language": user["language"], "city": user["city"]}})
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/register", methods=["POST"])
def register():
    try:
        data   = request.get_json()
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (name,email,password,phone,city,language) VALUES (%s,%s,%s,%s,%s,%s) RETURNING id",
            (data.get("name"), data.get("email"), data.get("password"), data.get("phone"), data.get("city"), data.get("language","english"))
        )
        user_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "ok", "user_id": user_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/search", methods=["GET"])
def search_products():
    try:
        query     = request.args.get("q", "")
        room_id   = request.args.get("room_id", None)
        min_price = request.args.get("min_price", 0)
        max_price = request.args.get("max_price", 999999)
        style     = request.args.get("style", None)
        brand     = request.args.get("brand", None)
        conn      = get_db()
        cursor    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        sql       = """SELECT p.*, r.name as room_name,
                       COALESCE(AVG(pr.rating),0) as avg_rating,
                       COUNT(pr.id) as review_count
                       FROM products p
                       JOIN rooms r ON p.room_id = r.id
                       LEFT JOIN product_reviews pr ON pr.product_id = p.id
                       WHERE 1=1"""
        params = []
        if query:
            sql += " AND (LOWER(p.name) LIKE %s OR LOWER(p.description) LIKE %s OR LOWER(p.brand) LIKE %s)"
            params.extend([f"%{query.lower()}%"] * 3)
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
        sql += " GROUP BY p.id, r.name ORDER BY p.price ASC"
        cursor.execute(sql, params)
        products = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"products": list(products), "count": len(products), "query": query})
    except Exception as e:
        print(f"search error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/brands", methods=["GET"])
def get_brands():
    try:
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL ORDER BY brand")
        brands = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return jsonify({"brands": brands})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/styles", methods=["GET"])
def get_styles():
    try:
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT style_tag FROM products WHERE style_tag IS NOT NULL ORDER BY style_tag")
        styles = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return jsonify({"styles": styles})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/orders", methods=["POST"])
def place_order():
    try:
        data        = request.get_json()
        user_id     = data.get("user_id", 1)
        items       = data.get("items", [])
        if not items:
            return jsonify({"error": "No items"}), 400
        subtotal    = sum(i["price"] * i["qty"] for i in items)
        gst         = round(subtotal * 0.18, 2)
        grand_total = round(subtotal + gst, 2)
        conn        = get_db()
        cursor      = conn.cursor()
        cursor.execute(
            "INSERT INTO orders (user_id,total_amount,gst_amount,grand_total,status) VALUES (%s,%s,%s,%s,'pending') RETURNING id",
            (user_id, subtotal, gst, grand_total)
        )
        order_id = cursor.fetchone()[0]
        for item in items:
            cursor.execute(
                "INSERT INTO order_items (order_id,product_id,quantity,price) VALUES (%s,%s,%s,%s)",
                (order_id, item["id"], item["qty"], item["price"])
            )
            cursor.execute(
                "UPDATE products SET stock_qty = stock_qty - %s WHERE id = %s",
                (item["qty"], item["id"])
            )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "ok", "order_id": order_id, "grand_total": grand_total})
    except Exception as e:
        print(f"place_order error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/orders/<int:user_id>", methods=["GET"])
def get_orders(user_id):
    try:
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            "SELECT o.*, COUNT(oi.id) as item_count FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id WHERE o.user_id = %s GROUP BY o.id ORDER BY o.created_at DESC",
            (user_id,)
        )
        orders = cursor.fetchall()
        result = []
        for order in orders:
            cursor.execute(
                "SELECT oi.*, p.name as product_name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = %s",
                (order["id"],)
            )
            od               = dict(order)
            od["items"]      = list(cursor.fetchall())
            od["created_at"] = str(order["created_at"])
            result.append(od)
        cursor.close()
        conn.close()
        return jsonify({"orders": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/orders/<int:order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    try:
        data   = request.get_json()
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE orders SET status = %s WHERE id = %s", (data.get("status","pending"), order_id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/track/<int:order_id>", methods=["GET"])
def track_order(order_id):
    try:
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            "SELECT o.*, u.name as customer_name, u.email, u.phone, u.city FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = %s",
            (order_id,)
        )
        order = cursor.fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404
        cursor.execute(
            "SELECT oi.*, p.name as product_name, p.brand, r.name as room_name FROM order_items oi JOIN products p ON oi.product_id = p.id JOIN rooms r ON p.room_id = r.id WHERE oi.order_id = %s",
            (order_id,)
        )
        od               = dict(order)
        od["items"]      = list(cursor.fetchall())
        od["created_at"] = str(order["created_at"])
        status           = order["status"]
        od["timeline"]   = [
            {"step": "Order Placed", "icon": "📋", "done": True,                                         "desc": "Your order has been received"},
            {"step": "Processing",   "icon": "⚙️", "done": status in ["processing","shipped","delivered"],"desc": "We are preparing your items"},
            {"step": "Shipped",      "icon": "🚚", "done": status in ["shipped","delivered"],             "desc": "Your order is on the way"},
            {"step": "Delivered",    "icon": "✅", "done": status == "delivered",                        "desc": "Order delivered successfully"},
        ]
        cursor.close()
        conn.close()
        return jsonify({"order": od})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):
    try:
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT id,name,email,phone,city,language FROM users WHERE id=%s", (user_id,))
        user   = cursor.fetchone()
        cursor.execute(
            "SELECT COUNT(*) as total_orders, COALESCE(SUM(grand_total),0) as total_spent, COUNT(CASE WHEN status='delivered' THEN 1 END) as delivered, COUNT(CASE WHEN status='pending' THEN 1 END) as pending FROM orders WHERE user_id=%s",
            (user_id,)
        )
        stats = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify({"user": dict(user), "stats": dict(stats)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/profile/<int:user_id>", methods=["PUT"])
def update_profile(user_id):
    try:
        data   = request.get_json()
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET name=%s,phone=%s,city=%s,language=%s WHERE id=%s",
            (data.get("name"), data.get("phone"), data.get("city"), data.get("language"), user_id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/upload-image", methods=["POST"])
def upload_image():
    try:
        import cloudinary
        import cloudinary.uploader
        cloudinary.config(
            cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
            api_key    = os.getenv("CLOUDINARY_API_KEY"),
            api_secret = os.getenv("CLOUDINARY_API_SECRET")
        )
        if "file" not in request.files:
            return jsonify({"error": "No file"}), 400
        file       = request.files["file"]
        product_id = request.form.get("product_id", "unknown")
        result     = cloudinary.uploader.upload(
            file, folder="homebot-products",
            public_id=f"product_{product_id}", overwrite=True, resource_type="image"
        )
        image_url = result["secure_url"]
        if product_id and not str(product_id).startswith("review_"):
            try:
                conn   = get_db()
                cursor = conn.cursor()
                cursor.execute("UPDATE products SET image_url=%s WHERE id=%s", (image_url, int(product_id)))
                conn.commit()
                cursor.close()
                conn.close()
            except:
                pass
        return jsonify({"status": "ok", "image_url": image_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── ADMIN ──

@app.route("/api/admin/products", methods=["GET"])
def admin_get_products():
    try:
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT p.*, r.name as room_name FROM products p JOIN rooms r ON p.room_id = r.id ORDER BY r.name, p.name")
        products = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"products": list(products)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/admin/products", methods=["POST"])
def admin_add_product():
    try:
        data   = request.get_json()
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO products (room_id,name,description,price,unit,stock_qty,style_tag,brand,length_cm,width_cm,height_cm,material,color,image_url) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
            (data.get("room_id"), data.get("name"), data.get("description"), data.get("price"), data.get("unit"), data.get("stock_qty",0), data.get("style_tag"), data.get("brand"), data.get("length_cm"), data.get("width_cm"), data.get("height_cm"), data.get("material"), data.get("color"), data.get("image_url"))
        )
        product_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "ok", "product_id": product_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/admin/products/<int:product_id>", methods=["PUT"])
def admin_update_product(product_id):
    try:
        data   = request.get_json()
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE products SET room_id=%s,name=%s,description=%s,price=%s,unit=%s,stock_qty=%s,style_tag=%s,brand=%s,length_cm=%s,width_cm=%s,height_cm=%s,material=%s,color=%s,image_url=%s WHERE id=%s",
            (data.get("room_id"), data.get("name"), data.get("description"), data.get("price"), data.get("unit"), data.get("stock_qty"), data.get("style_tag"), data.get("brand"), data.get("length_cm"), data.get("width_cm"), data.get("height_cm"), data.get("material"), data.get("color"), data.get("image_url"), product_id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/admin/products/<int:product_id>", methods=["DELETE"])
def admin_delete_product(product_id):
    try:
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM products WHERE id=%s", (product_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/admin/stats", methods=["GET"])
def admin_stats():
    try:
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT COUNT(*) as count FROM products")
        total_products = cursor.fetchone()["count"]
        cursor.execute("SELECT COUNT(*) as count FROM users")
        total_users = cursor.fetchone()["count"]
        cursor.execute("SELECT COUNT(*) as count FROM orders")
        total_orders = cursor.fetchone()["count"]
        cursor.execute("SELECT COALESCE(SUM(grand_total),0) as total FROM orders")
        total_revenue = cursor.fetchone()["total"]
        cursor.execute("SELECT status, COUNT(*) as count FROM orders GROUP BY status")
        orders_by_status = cursor.fetchall()
        cursor.execute("SELECT p.name, SUM(oi.quantity) as total_sold FROM order_items oi JOIN products p ON oi.product_id=p.id GROUP BY p.name ORDER BY total_sold DESC LIMIT 5")
        top_products = cursor.fetchall()
        cursor.execute("SELECT r.name as room, COALESCE(SUM(o.grand_total),0) as revenue FROM rooms r LEFT JOIN products p ON p.room_id=r.id LEFT JOIN order_items oi ON oi.product_id=p.id LEFT JOIN orders o ON o.id=oi.order_id GROUP BY r.name ORDER BY revenue DESC")
        revenue_by_room = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({
            "total_products":   total_products,
            "total_users":      total_users,
            "total_orders":     total_orders,
            "total_revenue":    float(total_revenue),
            "orders_by_status": list(orders_by_status),
            "top_products":     list(top_products),
            "revenue_by_room":  list(revenue_by_room)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── ANALYTICS ──

@app.route("/api/analytics/track", methods=["POST"])
def track_activity():
    try:
        data   = request.get_json()
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO user_activity (user_id,action,room_id,product_id,details) VALUES (%s,%s,%s,%s,%s)",
            (data.get("user_id",1), data.get("action",""), data.get("room_id"), data.get("product_id"), data.get("details",""))
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/analytics/pageview", methods=["POST"])
def track_pageview():
    try:
        data   = request.get_json()
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO page_views (user_id,page,duration_sec) VALUES (%s,%s,%s)",
            (data.get("user_id",1), data.get("page",""), data.get("duration",0))
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/analytics/dashboard", methods=["GET"])
def analytics_dashboard():
    try:
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT COUNT(*) as count FROM users")
        total_users = cursor.fetchone()["count"]
        cursor.execute("SELECT COUNT(DISTINCT user_id) as count FROM user_activity WHERE created_at >= CURRENT_DATE")
        active_today = cursor.fetchone()["count"]
        cursor.execute("SELECT r.name as room, COUNT(*) as views FROM user_activity ua JOIN rooms r ON ua.room_id=r.id WHERE ua.action='view_room' GROUP BY r.name ORDER BY views DESC")
        popular_rooms = cursor.fetchall()
        cursor.execute("SELECT p.name as product, p.brand, COUNT(*) as views FROM user_activity ua JOIN products p ON ua.product_id=p.id WHERE ua.action='view_product' GROUP BY p.name,p.brand ORDER BY views DESC LIMIT 10")
        popular_products = cursor.fetchall()
        cursor.execute("SELECT p.name as product, COUNT(*) as add_count FROM user_activity ua JOIN products p ON ua.product_id=p.id WHERE ua.action='add_to_cart' GROUP BY p.name ORDER BY add_count DESC LIMIT 5")
        cart_products = cursor.fetchall()
        cursor.execute("SELECT page, COUNT(*) as views, AVG(duration_sec) as avg_duration FROM page_views GROUP BY page ORDER BY views DESC")
        page_stats = cursor.fetchall()
        cursor.execute("SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(grand_total) as revenue FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' GROUP BY DATE(created_at) ORDER BY date")
        daily_orders = cursor.fetchall()
        cursor.execute("SELECT AVG(duration_sec) as avg_duration FROM page_views")
        avg_duration = cursor.fetchone()["avg_duration"] or 0
        cursor.close()
        conn.close()
        return jsonify({
            "total_users":          total_users,
            "active_today":         active_today,
            "popular_rooms":        list(popular_rooms),
            "popular_products":     list(popular_products),
            "cart_products":        list(cart_products),
            "page_stats":           list(page_stats),
            "daily_orders":         [{**dict(d), "date": str(d["date"]), "revenue": float(d["revenue"] or 0)} for d in daily_orders],
            "avg_session_duration": round(float(avg_duration), 1)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── RECOMMENDATIONS ──

@app.route("/api/recommendations/<int:product_id>", methods=["GET"])
def get_recommendations(product_id):
    try:
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM products WHERE id=%s", (product_id,))
        current = cursor.fetchone()
        if not current:
            return jsonify({"recommendations": []})
        cursor.execute(
            "SELECT p.*, r.name as room_name, ABS(p.price-%s) as price_diff FROM products p JOIN rooms r ON p.room_id=r.id WHERE p.room_id=%s AND p.id!=%s ORDER BY price_diff ASC LIMIT 4",
            (current["price"], current["room_id"], product_id)
        )
        same_room = cursor.fetchall()
        cursor.execute(
            "SELECT p.*, r.name as room_name FROM products p JOIN rooms r ON p.room_id=r.id WHERE p.style_tag=%s AND p.id!=%s AND p.room_id!=%s ORDER BY RANDOM() LIMIT 4",
            (current["style_tag"], product_id, current["room_id"])
        )
        same_style = cursor.fetchall()
        cursor.execute(
            "SELECT p.*, r.name as room_name, COUNT(*) as bought_together FROM order_items oi1 JOIN order_items oi2 ON oi1.order_id=oi2.order_id JOIN products p ON oi2.product_id=p.id JOIN rooms r ON p.room_id=r.id WHERE oi1.product_id=%s AND oi2.product_id!=%s GROUP BY p.id,r.name ORDER BY bought_together DESC LIMIT 4",
            (product_id, product_id)
        )
        bought_together = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"same_room": list(same_room), "same_style": list(same_style), "bought_together": list(bought_together), "current_product": dict(current)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/recommendations/user/<int:user_id>", methods=["GET"])
def get_user_recommendations(user_id):
    try:
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            "SELECT room_id, COUNT(*) as views FROM user_activity WHERE user_id=%s AND action='view_room' AND room_id IS NOT NULL GROUP BY room_id ORDER BY views DESC LIMIT 3",
            (user_id,)
        )
        fav_rooms       = cursor.fetchall()
        recommendations = []
        for room in fav_rooms:
            cursor.execute(
                "SELECT p.*, r.name as room_name FROM products p JOIN rooms r ON p.room_id=r.id WHERE p.room_id=%s ORDER BY RANDOM() LIMIT 3",
                (room["room_id"],)
            )
            recommendations.extend(list(cursor.fetchall()))
        if not recommendations:
            cursor.execute(
                "SELECT p.*, r.name as room_name, COUNT(oi.id) as order_count FROM products p JOIN rooms r ON p.room_id=r.id LEFT JOIN order_items oi ON oi.product_id=p.id GROUP BY p.id,r.name ORDER BY order_count DESC LIMIT 8"
            )
            recommendations = list(cursor.fetchall())
        cursor.close()
        conn.close()
        return jsonify({"recommendations": recommendations, "favorite_rooms": list(fav_rooms)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/trending", methods=["GET"])
def get_trending():
    try:
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            "SELECT p.*, r.name as room_name, COUNT(oi.id) as view_count FROM products p JOIN rooms r ON p.room_id=r.id LEFT JOIN order_items oi ON oi.product_id=p.id GROUP BY p.id,r.name ORDER BY view_count DESC, p.id ASC LIMIT 8"
        )
        trending = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"trending": list(trending), "hot_items": list(trending)[:4]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── PERSONALIZATION ──

@app.route("/api/personalization/<int:user_id>", methods=["GET"])
def get_personalization(user_id):
    try:
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM user_style_profile WHERE user_id=%s", (user_id,))
        profile = cursor.fetchone()
        if not profile:
            cursor.execute(
                "INSERT INTO user_style_profile (user_id,favorite_style,budget_range) VALUES (%s,'modern','medium') RETURNING *",
                (user_id,)
            )
            profile = cursor.fetchone()
            conn.commit()
        cursor.execute("SELECT pref_key, pref_value FROM user_preferences WHERE user_id=%s", (user_id,))
        prefs = {row["pref_key"]: row["pref_value"] for row in cursor.fetchall()}
        cursor.execute(
            "SELECT r.name as room, COUNT(*) as orders FROM orders o JOIN order_items oi ON o.id=oi.order_id JOIN products p ON oi.product_id=p.id JOIN rooms r ON p.room_id=r.id WHERE o.user_id=%s GROUP BY r.name ORDER BY orders DESC",
            (user_id,)
        )
        order_history = cursor.fetchall()
        cursor.execute("SELECT AVG(grand_total) as avg_spend, MAX(grand_total) as max_spend FROM orders WHERE user_id=%s", (user_id,))
        spend_info = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify({"profile": dict(profile), "preferences": prefs, "order_history": list(order_history), "spend_info": dict(spend_info)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/personalization/<int:user_id>", methods=["PUT"])
def update_personalization(user_id):
    try:
        data = request.get_json()
        fs   = data.get("favorite_style","modern")
        br   = data.get("budget_range","medium")
        cp   = data.get("color_pref","")
        mp   = data.get("material_pref","")
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO user_style_profile (user_id,favorite_style,budget_range,color_pref,material_pref) VALUES (%s,%s,%s,%s,%s) ON CONFLICT (user_id) DO UPDATE SET favorite_style=%s,budget_range=%s,color_pref=%s,material_pref=%s,updated_at=CURRENT_TIMESTAMP",
            (user_id,fs,br,cp,mp,fs,br,cp,mp)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/chat/personalized", methods=["POST"])
def personalized_chat():
    try:
        data         = request.get_json()
        user_message = data.get("message","")
        user_id      = data.get("user_id",1)
        room         = data.get("room","general")
        budget       = data.get("budget",100000)
        try:
            detected_lang = detect(user_message)
        except:
            detected_lang = "en"
        lang_name = LANGUAGE_MAP.get(detected_lang,"English")
        if detected_lang != "en":
            english_message = translate(user_message, detected_lang, "en")
        else:
            english_message = user_message
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT name,city FROM users WHERE id=%s", (user_id,))
        user_info = cursor.fetchone()
        cursor.execute("SELECT * FROM user_style_profile WHERE user_id=%s", (user_id,))
        style_profile = cursor.fetchone()
        cursor.execute(
            "SELECT p.name, r.name as room FROM order_items oi JOIN products p ON oi.product_id=p.id JOIN rooms r ON p.room_id=r.id JOIN orders o ON oi.order_id=o.id WHERE o.user_id=%s ORDER BY o.created_at DESC LIMIT 5",
            (user_id,)
        )
        past_orders = cursor.fetchall()
        cursor.close()
        conn.close()
        user_name  = user_info["name"] if user_info else "Customer"
        user_city  = user_info["city"] if user_info else "India"
        style_pref = style_profile["favorite_style"] if style_profile else "modern"
        past_str   = ", ".join([f"{o['name']} ({o['room']})" for o in past_orders]) if past_orders else "No previous orders"
        prompt = f"""You are HomeBot AI for {user_name} from {user_city}.
Style: {style_pref}, Budget: Rs.{budget:,}, Past purchases: {past_str}
Room: {room}, Message: {english_message}
Give a PERSONALIZED recommendation in 2-3 sentences. Address by name."""
        response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        english_response = response.text
        if detected_lang != "en":
            final_response = translate(english_response, "en", detected_lang)
        else:
            final_response = english_response
        return jsonify({"reply": final_response, "detected_lang": lang_name, "personalized": True, "status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── REVIEWS ──

@app.route("/api/reviews", methods=["POST"])
def submit_review():
    try:
        data         = request.get_json()
        product_id   = data.get("product_id")
        user_id      = data.get("user_id",1)
        rating       = data.get("rating",5)
        review_text  = data.get("review_text","")
        review_photo = data.get("review_photo","")
        is_anonymous = data.get("is_anonymous",False)
        display_name = data.get("display_name","")
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT COUNT(*) FROM order_items oi JOIN orders o ON oi.order_id=o.id WHERE oi.product_id=%s AND o.user_id=%s",
            (product_id, user_id)
        )
        is_verified = cursor.fetchone()[0] > 0
        cursor.execute("SELECT id FROM product_reviews WHERE product_id=%s AND user_id=%s", (product_id, user_id))
        existing = cursor.fetchone()
        if existing:
            cursor.execute(
                "UPDATE product_reviews SET rating=%s,review_text=%s,is_verified=%s,review_photo=%s,is_anonymous=%s,display_name=%s WHERE product_id=%s AND user_id=%s",
                (rating,review_text,is_verified,review_photo,is_anonymous,display_name,product_id,user_id)
            )
        else:
            cursor.execute(
                "INSERT INTO product_reviews (product_id,user_id,rating,review_text,is_verified,review_photo,is_anonymous,display_name) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
                (product_id,user_id,rating,review_text,is_verified,review_photo,is_anonymous,display_name)
            )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "ok", "is_verified": is_verified})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/reviews/<int:product_id>", methods=["GET"])
def get_reviews(product_id):
    try:
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            "SELECT pr.*, u.name as user_name FROM product_reviews pr JOIN users u ON pr.user_id=u.id WHERE pr.product_id=%s ORDER BY pr.created_at DESC",
            (product_id,)
        )
        reviews = cursor.fetchall()
        cursor.execute(
            "SELECT COUNT(*) as total_reviews, COALESCE(AVG(rating),0) as avg_rating, COUNT(CASE WHEN rating=5 THEN 1 END) as five_star, COUNT(CASE WHEN rating=4 THEN 1 END) as four_star, COUNT(CASE WHEN rating=3 THEN 1 END) as three_star, COUNT(CASE WHEN rating=2 THEN 1 END) as two_star, COUNT(CASE WHEN rating=1 THEN 1 END) as one_star FROM product_reviews WHERE product_id=%s",
            (product_id,)
        )
        summary = cursor.fetchone()
        cursor.close()
        conn.close()
        result = []
        for r in reviews:
            d = dict(r)
            d["created_at"] = str(r["created_at"])
            result.append(d)
        return jsonify({"reviews": result, "summary": dict(summary)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/reviews/<int:review_id>/helpful", methods=["POST"])
def mark_helpful(review_id):
    try:
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE product_reviews SET helpful_count=helpful_count+1 WHERE id=%s", (review_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/chatbot/rate", methods=["POST"])
def rate_chatbot():
    try:
        data   = request.get_json()
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO chatbot_ratings (user_id,session_msg,rating,feedback) VALUES (%s,%s,%s,%s)",
            (data.get("user_id",1), data.get("session_msg",""), data.get("rating",5), data.get("feedback",""))
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/chatbot/stats", methods=["GET"])
def chatbot_stats():
    try:
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT COUNT(*) as total_ratings, COALESCE(AVG(rating),0) as avg_rating, COUNT(CASE WHEN rating>=4 THEN 1 END) as positive, COUNT(CASE WHEN rating<=2 THEN 1 END) as negative FROM chatbot_ratings")
        stats = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify({"stats": dict(stats)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/top-rated", methods=["GET"])
def get_top_rated_all():
    try:
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            "SELECT p.*, r.name as room_name, COALESCE(AVG(pr.rating),0) as avg_rating, COUNT(pr.id) as review_count FROM products p JOIN rooms r ON p.room_id=r.id LEFT JOIN product_reviews pr ON pr.product_id=p.id GROUP BY p.id,r.name HAVING COUNT(pr.id) > 0 ORDER BY avg_rating DESC, review_count DESC LIMIT 10"
        )
        products = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"products": list(products)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── BUNDLES ──

@app.route("/api/bundles/<int:room_id>", methods=["GET"])
def get_bundles(room_id):
    try:
        conn   = get_db()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            "SELECT p.*, r.name as room_name FROM products p JOIN rooms r ON p.room_id=r.id WHERE p.room_id=%s ORDER BY p.id ASC LIMIT 6",
            (room_id,)
        )
        bundle_products = cursor.fetchall()
        cursor.execute(
            "SELECT p.*, r.name as room_name, COALESCE(AVG(pr.rating),0) as avg_rating, COUNT(pr.id) as review_count FROM products p JOIN rooms r ON p.room_id=r.id LEFT JOIN product_reviews pr ON pr.product_id=p.id GROUP BY p.id,r.name HAVING COALESCE(AVG(pr.rating),0) >= 4 ORDER BY avg_rating DESC LIMIT 6"
        )
        top_rated = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"bundle_products": list(bundle_products), "top_rated": list(top_rated)})
    except Exception as e:
        print(f"bundles error: {e}")
        return jsonify({"bundle_products": [], "top_rated": []}), 200
# ── GALLERY ROUTES ──

# Route: Get all images for a product
@app.route("/api/gallery/<int:product_id>", methods=["GET"])
def get_gallery(product_id):
    try:
        conn   = get_db()
        cursor = conn.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )

        # Get gallery images
        cursor.execute(
            """SELECT * FROM product_images
               WHERE product_id = %s
               ORDER BY sort_order ASC""",
            (product_id,)
        )
        gallery = cursor.fetchall()

        # Also get main product image
        cursor.execute(
            "SELECT image_url FROM products WHERE id = %s",
            (product_id,)
        )
        product = cursor.fetchone()

        cursor.close()
        conn.close()

        images = []

        # Add main image first if exists
        if product and product["image_url"]:
            images.append({
                "id":         0,
                "product_id": product_id,
                "image_url":  product["image_url"],
                "image_type": "main",
                "sort_order": -1
            })

        # Add gallery images
        images.extend(list(gallery))

        return jsonify({"images": images, "count": len(images)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Route: Add image to gallery
@app.route("/api/gallery/<int:product_id>", methods=["POST"])
def add_gallery_image(product_id):
    try:
        import cloudinary
        import cloudinary.uploader

        cloudinary.config(
            cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
            api_key    = os.getenv("CLOUDINARY_API_KEY"),
            api_secret = os.getenv("CLOUDINARY_API_SECRET")
        )

        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file       = request.files["file"]
        sort_order = request.form.get("sort_order", 0)
        image_type = request.form.get("image_type", "gallery")

        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file,
            folder        = "homebot-gallery",
            public_id     = f"gallery_{product_id}_{sort_order}_{os.urandom(4).hex()}",
            overwrite     = False,
            resource_type = "image"
        )
        image_url = result["secure_url"]

        # Save to database
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO product_images
               (product_id, image_url, image_type, sort_order)
               VALUES (%s, %s, %s, %s)
               RETURNING id""",
            (product_id, image_url, image_type, int(sort_order))
        )
        image_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "status":    "ok",
            "image_id":  image_id,
            "image_url": image_url,
            "message":   "Gallery image added!"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Route: Delete gallery image
@app.route("/api/gallery/image/<int:image_id>", methods=["DELETE"])
def delete_gallery_image(image_id):
    try:
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM product_images WHERE id = %s",
            (image_id,)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "ok", "message": "Image deleted!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == "__main__":
    app.run(debug=True, port=5000)     