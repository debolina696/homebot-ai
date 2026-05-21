import { useState, useEffect } from "react";

const API = "http://127.0.0.1:5000";

const ROOMS = [
  { id: 1, name: "Bathroom",    icon: "🛁" },
  { id: 2, name: "Bedroom",     icon: "🛏️" },
  { id: 3, name: "Kitchen",     icon: "🍳" },
  { id: 4, name: "Living Room", icon: "🛋️" },
  { id: 5, name: "Dining Room", icon: "🍽️" },
  { id: 6, name: "Study Room",  icon: "📚" },
  { id: 7, name: "Puja Room",   icon: "🙏" },
  { id: 8, name: "Exterior",    icon: "🏗️" },
];

export default function App() {
  const [screen, setScreen]         = useState("home");
  const [selectedRoom, setRoom]     = useState(null);
  const [products, setProducts]     = useState([]);
  const [cart, setCart]             = useState([]);
  const [messages, setMessages]     = useState([
    { role: "ai", text: "👋 Namaste! I am HomeBot AI. Which room do you want to renovate today?" }
  ]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [budget, setBudget]         = useState(100000);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (selectedRoom) {
      fetch(`${API}/api/products/${selectedRoom.id}`)
        .then(r => r.json())
        .then(d => setProducts(d.products || []));
    }
  }, [selectedRoom]);

  const addToCart = (product) => {
    const exists = cart.find(i => i.id === product.id);
    if (exists) {
      setCart(cart.map(i =>
        i.id === product.id ? { ...i, qty: i.qty + 1 } : i
      ));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const subtotal   = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const gst        = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gst;

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          room: selectedRoom?.name || "general",
          budget: budget
        })
      });
      const d = await r.json();
      setMessages(m => [...m, {
        role: "ai",
        text: d.reply || "Sorry, I could not process that.",
        lang: d.detected_lang
      }]);
    } catch {
      setMessages(m => [...m, {
        role: "ai",
        text: "Connection error. Please check if backend is running."
      }]);
    }
    setLoading(false);
  };

  const downloadPDF = async () => {
    if (cart.length === 0) {
      alert("Please add products to cart first!");
      return;
    }
    setPdfLoading(true);
    try {
      const response = await fetch(`${API}/api/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/pdf"
        },
        body: JSON.stringify({
          items: cart.map(i => ({
            name: String(i.name),
            price: Number(i.price),
            qty: Number(i.qty)
          })),
          budget: Number(budget),
          room: selectedRoom?.name || "Home"
        })
      });
      if (!response.ok) {
        const err = await response.text();
        alert("PDF Error: " + err);
        setPdfLoading(false);
        return;
      }
      const blob = await response.blob();
      const url  = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );
      const a          = document.createElement("a");
      a.style.display  = "none";
      a.href           = url;
      a.download       = "HomeBot_Quotation.pdf";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (err) {
      alert("PDF generation failed: " + err.message);
    }
    setPdfLoading(false);
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto", background: "#f8f9fa", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: "#BA7517", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "white", fontWeight: 600, fontSize: 18 }}>🏠 HomeBot AI</div>
          <div style={{ color: "#FFE0A0", fontSize: 12 }}>Interior Design Assistant</div>
        </div>
        <div style={{ background: "white", borderRadius: 20, padding: "4px 12px", fontSize: 13, color: "#BA7517", fontWeight: 500, cursor: "pointer" }}
          onClick={() => setScreen("cart")}>
          🛒 {cart.length} items
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 480, background: "white", display: "flex", borderTop: "1px solid #eee", zIndex: 100 }}>
        {[
          { id: "home",     icon: "🏠", label: "Rooms" },
          { id: "products", icon: "📦", label: "Products" },
          { id: "chat",     icon: "💬", label: "AI Chat" },
          { id: "cart",     icon: "🛒", label: "Cart" },
        ].map(tab => (
          <button key={tab.id}
            onClick={() => setScreen(tab.id)}
            style={{ flex: 1, padding: "10px 0", border: "none", background: "none", cursor: "pointer", fontSize: 11, color: screen === tab.id ? "#BA7517" : "#888", fontWeight: screen === tab.id ? 600 : 400 }}>
            <div style={{ fontSize: 20 }}>{tab.icon}</div>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "16px", paddingBottom: 80 }}>

        {/* HOME */}
        {screen === "home" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Select a room to renovate</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>Tap a room to see AI recommendations</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {ROOMS.map(room => (
                <div key={room.id}
                  onClick={() => { setRoom(room); setScreen("products"); }}
                  style={{
                    background: selectedRoom?.id === room.id ? "#FFF3DC" : "white",
                    border: selectedRoom?.id === room.id ? "2px solid #BA7517" : "1px solid #eee",
                    borderRadius: 12, padding: 16, cursor: "pointer", textAlign: "center"
                  }}>
                  <div style={{ fontSize: 32 }}>{room.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginTop: 6 }}>{room.name}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "white", borderRadius: 12, padding: 16, marginTop: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>💰 Your Budget</div>
              <input type="range" min={10000} max={500000} step={5000}
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#BA7517" }} />
              <div style={{ textAlign: "center", fontWeight: 600, color: "#BA7517", fontSize: 18 }}>
                ₹{budget.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {screen === "products" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
              {selectedRoom ? `${selectedRoom.icon} ${selectedRoom.name} Products` : "Select a room first"}
            </div>
            {!selectedRoom && (
              <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
                Please select a room from the Rooms tab first
              </div>
            )}
            {products.length === 0 && selectedRoom && (
              <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading products...</div>
            )}
            {products.map(p => (
              <div key={p.id}
                style={{ background: "white", borderRadius: 12, padding: 16, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{p.description}</div>
                  <div style={{ color: "#BA7517", fontWeight: 600, marginTop: 4 }}>
                    ₹{Number(p.price).toLocaleString("en-IN")}
                    <span style={{ fontSize: 11, color: "#888" }}> {p.unit}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                    Brand: {p.brand} | Stock: {p.stock_qty}
                  </div>
                </div>
                <button onClick={() => addToCart(p)}
                  style={{ background: "#BA7517", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, marginLeft: 12 }}>
                  + Add
                </button>
              </div>
            ))}
          </div>
        )}

        {/* AI CHAT */}
        {screen === "chat" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>💬 AI Chat — Ask in any language!</div>
            <div style={{ background: "white", borderRadius: 12, padding: 12, minHeight: 350, maxHeight: 400, overflowY: "auto", marginBottom: 12 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                  <div style={{
                    maxWidth: "80%", padding: "10px 14px", borderRadius: 12, fontSize: 14, lineHeight: 1.5,
                    background: m.role === "user" ? "#BA7517" : "#f0f0f0",
                    color: m.role === "user" ? "white" : "#333"
                  }}>
                    {m.text}
                    {m.lang && <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7 }}>Detected: {m.lang}</div>}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
                  <div style={{ background: "#f0f0f0", padding: "10px 14px", borderRadius: 12, fontSize: 14 }}>⏳ Thinking...</div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Type in Hindi, Tamil, English..."
                style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, outline: "none" }}
              />
              <button onClick={sendMessage}
                style={{ background: "#BA7517", color: "white", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 16 }}>
                ➤
              </button>
            </div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 8, textAlign: "center" }}>
              Try: "मुझे बाथरूम के लिए टाइल चाहिए" or "I need kitchen sink"
            </div>
          </div>
        )}

        {/* CART */}
        {screen === "cart" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>🛒 Your Cart</div>
            {cart.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
                <div style={{ fontSize: 40 }}>🛒</div>
                <div style={{ marginTop: 8 }}>Cart is empty — add products first!</div>
              </div>
            )}
            {cart.map(item => (
              <div key={item.id}
                style={{ background: "white", borderRadius: 12, padding: 14, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
                  <div style={{ color: "#BA7517", fontSize: 13, marginTop: 2 }}>
                    ₹{Number(item.price).toLocaleString("en-IN")} × {item.qty}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontWeight: 600 }}>
                    ₹{(item.price * item.qty).toLocaleString("en-IN")}
                  </div>
                  <button onClick={() => removeFromCart(item.id)}
                    style={{ background: "#fee", border: "1px solid #fcc", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#c00", fontSize: 12 }}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {cart.length > 0 && (
              <div style={{ background: "white", borderRadius: 12, padding: 16, marginTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: "#666" }}>
                  <span>GST (18%)</span>
                  <span>₹{gst.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16, borderTop: "1px solid #eee", paddingTop: 10 }}>
                  <span>Grand Total</span>
                  <span style={{ color: "#BA7517" }}>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
                <button
                  onClick={downloadPDF}
                  disabled={pdfLoading}
                  style={{ width: "100%", marginTop: 14, background: pdfLoading ? "#ccc" : "#BA7517", color: "white", border: "none", borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 600, cursor: pdfLoading ? "not-allowed" : "pointer" }}>
                  {pdfLoading ? "⏳ Generating PDF..." : "📄 Download PDF Quote"}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}