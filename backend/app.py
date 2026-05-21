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

if __name__ == "__main__":
    app.run(debug=True, port=5000)   