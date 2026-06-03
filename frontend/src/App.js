import { useState, useEffect } from "react";

const API = "http://127.0.0.1:5000";

// Analytics tracking helpers
const track = async (action, roomId = null, productId = null, details = "") => {
  try {
    await fetch(`${API}/api/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id:    1,
        action,
        room_id:    roomId,
        product_id: productId,
        details
      })
    });
  } catch {}
};

const trackPage = async (page, duration = 0) => {
  try {
    await fetch(`${API}/api/analytics/pageview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: 1, page, duration })
    });
  } catch {}
};

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

const STATUS_COLORS = {
  pending:    { bg: "#FFF3DC", color: "#BA7517" },
  processing: { bg: "#E6F1FB", color: "#0C447C" },
  shipped:    { bg: "#EEEDFE", color: "#26215C" },
  delivered:  { bg: "#E1F5EE", color: "#085041" },
  cancelled:  { bg: "#FCEBEB", color: "#501313" },
};

const LANGUAGES = [
  "english", "hindi", "bengali", "tamil",
  "telugu", "marathi", "gujarati", "kannada",
  "malayalam", "punjabi", "odia"
];

export default function App() {
  const [screen, setScreen]               = useState("login");
  const [user, setUser]                   = useState(null);
  const [selectedRoom, setRoom]           = useState(null);
  const [products, setProducts]           = useState([]);
  const [cart, setCart]                   = useState([]);
  const [messages, setMessages]           = useState([
    { role: "ai", text: "👋 Namaste! I am HomeBot AI. Which room do you want to renovate today?" }
  ]);
  const [input, setInput]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [budget, setBudget]               = useState(100000);
  const [pdfLoading, setPdfLoading]       = useState(false);
  const [loginEmail, setLoginEmail]       = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError]       = useState("");
  const [regName, setRegName]             = useState("");
  const [regEmail, setRegEmail]           = useState("");
  const [regPassword, setRegPassword]     = useState("");
  const [regPhone, setRegPhone]           = useState("");
  const [regCity, setRegCity]             = useState("");
  const [showRegister, setShowRegister]   = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]         = useState(false);
  const [filterRoom, setFilterRoom]       = useState("");
  const [filterMin, setFilterMin]         = useState("");
  const [filterMax, setFilterMax]         = useState("");
  const [filterStyle, setFilterStyle]     = useState("");
  const [brands, setBrands]               = useState([]);
  const [styles, setStyles]               = useState([]);
  const [filterBrand, setFilterBrand]     = useState("");
  const [showFilters, setShowFilters]     = useState(false);
  const [orders, setOrders]               = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderPlacing, setOrderPlacing]   = useState(false);
  const [orderSuccess, setOrderSuccess]   = useState(null);
  const [trackedOrder, setTrackedOrder]   = useState(null);
  const [trackLoading, setTrackLoading]   = useState(false);
  const [profile, setProfile]             = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editProfile, setEditProfile]     = useState(false);
  const [editName, setEditName]           = useState("");
  const [editPhone, setEditPhone]         = useState("");
  const [editCity, setEditCity]           = useState("");
  const [editLang, setEditLang]           = useState("");
  const [uploadScreen, setUploadScreen]   = useState(false);
  const [uploadFile, setUploadFile]       = useState(null);
  const [uploadProductId, setUploadProductId] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [allProducts, setAllProducts]     = useState([]);

  useEffect(() => {
    if (selectedRoom) {
      fetch(`${API}/api/products/${selectedRoom.id}`)
        .then(r => r.json())
        .then(d => setProducts(d.products || []));
    }
  }, [selectedRoom]);

  useEffect(() => {
    fetch(`${API}/api/brands`)
      .then(r => r.json())
      .then(d => setBrands(d.brands || []));
    fetch(`${API}/api/styles`)
      .then(r => r.json())
      .then(d => setStyles(d.styles || []));
  }, []);

  useEffect(() => {
    if (user && screen === "orders")  loadOrders();
    if (user && screen === "profile") loadProfile();
    trackPage(screen);
  }, [screen, user]);

  useEffect(() => {
    if (uploadScreen) loadAllProducts();
  }, [uploadScreen]);

  const loadOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const r = await fetch(`${API}/api/orders/${user.id}`);
      const d = await r.json();
      setOrders(d.orders || []);
    } catch { setOrders([]); }
    setOrdersLoading(false);
  };

  const loadProfile = async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const r = await fetch(`${API}/api/profile/${user.id}`);
      const d = await r.json();
      setProfile(d);
      setEditName(d.user.name);
      setEditPhone(d.user.phone || "");
      setEditCity(d.user.city || "");
      setEditLang(d.user.language || "english");
    } catch { setProfile(null); }
    setProfileLoading(false);
  };

  const loadAllProducts = async () => {
    try {
      const r = await fetch(`${API}/api/search?q=`);
      const d = await r.json();
      setAllProducts(d.products || []);
    } catch { setAllProducts([]); }
  };

  const uploadImage = async () => {
    if (!uploadFile || !uploadProductId) {
      alert("Please select a product and image!");
      return;
    }
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("product_id", uploadProductId);
      const r = await fetch(`${API}/api/upload-image`, {
        method: "POST",
        body: formData
      });
      const d = await r.json();
      if (d.status === "ok") {
        setUploadSuccess(d.image_url);
        alert("✅ Image uploaded successfully!");
      } else {
        alert("Error: " + d.error);
      }
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
    setUploadLoading(false);
  };

  const trackOrderFn = async (orderId) => {
    setTrackLoading(true);
    setTrackedOrder(null);
    try {
      const r = await fetch(`${API}/api/track/${orderId}`);
      const d = await r.json();
      setTrackedOrder(d.order);
      setScreen("track");
    } catch { alert("Could not track order"); }
    setTrackLoading(false);
  };

  const saveProfile = async () => {
    try {
      const r = await fetch(`${API}/api/profile/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName, phone: editPhone,
          city: editCity, language: editLang
        })
      });
      const d = await r.json();
      if (d.status === "ok") {
        alert("✅ Profile updated!");
        setEditProfile(false);
        loadProfile();
        setUser({ ...user, name: editName });
      }
    } catch (err) { alert("Update failed: " + err.message); }
  };

  const placeOrder = async () => {
    if (cart.length === 0) { alert("Cart is empty!"); return; }
    setOrderPlacing(true);
    try {
      const r = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || 1,
          items: cart.map(i => ({
            id: i.id, price: Number(i.price),
            qty: Number(i.qty), name: i.name
          })),
          room: selectedRoom?.name || "Home"
        })
      });
      const d = await r.json();
      if (d.status === "ok") {
        setOrderSuccess(d);
        setCart([]);
        track("place_order", null, null, `Order #${d.order_id}`);
      } else alert("Order failed: " + d.error);
    } catch (err) { alert("Order failed: " + err.message); }
    setOrderPlacing(false);
  };

  const handleSearch = async () => {
    setSearching(true);
    let url = `${API}/api/search?q=${searchQuery}`;
    if (filterRoom)  url += `&room_id=${filterRoom}`;
    if (filterMin)   url += `&min_price=${filterMin}`;
    if (filterMax)   url += `&max_price=${filterMax}`;
    if (filterStyle) url += `&style=${filterStyle}`;
    if (filterBrand) url += `&brand=${filterBrand}`;
    try {
      const r = await fetch(url);
      const d = await r.json();
      setSearchResults(d.products || []);
      track("search", null, null, searchQuery);
    } catch { setSearchResults([]); }
    setSearching(false);
  };

  const clearFilters = () => {
    setSearchQuery(""); setFilterRoom(""); setFilterMin("");
    setFilterMax(""); setFilterStyle(""); setFilterBrand("");
    setSearchResults([]);
  };

  const addToCart = (product) => {
    const exists = cart.find(i => i.id === product.id);
    if (exists) {
      setCart(cart.map(i => i.id === product.id
        ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    track("add_to_cart", product.room_id, product.id, product.name);
  };

  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));

  const subtotal   = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const gst        = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gst;

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    track("chat_message", null, null, userMsg);
    try {
      const r = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          room: selectedRoom?.name || "general",
          budget
        })
      });
      const d = await r.json();
      setMessages(m => [...m, {
        role: "ai",
        text: d.reply || "Sorry, could not process that.",
        lang: d.detected_lang
      }]);
    } catch {
      setMessages(m => [...m, { role: "ai", text: "Connection error." }]);
    }
    setLoading(false);
  };

  const downloadPDF = async () => {
    if (cart.length === 0) { alert("Add products first!"); return; }
    setPdfLoading(true);
    track("download_pdf", null, null, `${cart.length} items`);
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
      if (!response.ok) { alert("PDF Error"); setPdfLoading(false); return; }
      const blob = await response.blob();
      const url  = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );
      const a         = document.createElement("a");
      a.style.display = "none";
      a.href          = url;
      a.download      = "HomeBot_Quotation.pdf";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (err) { alert("PDF failed: " + err.message); }
    setPdfLoading(false);
  };

  const sendWhatsApp = async () => {
    const phone = prompt("Enter WhatsApp number:\nExample: +919876543210");
    if (!phone) return;
    track("whatsapp_quote", null, null, phone);
    try {
      const r = await fetch(`${API}/api/notify-whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(i => ({
            name: i.name,
            price: Number(i.price),
            qty: Number(i.qty)
          })),
          total: grandTotal,
          room: selectedRoom?.name || "Home",
          phone: `whatsapp:${phone}`
        })
      });
      const d = await r.json();
      alert(d.status === "ok" ? "✅ WhatsApp sent!" : "Error: " + d.error);
    } catch (err) { alert("Failed: " + err.message); }
  };

  const handleLogin = async () => {
    setLoginError("");
    try {
      const r = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });
      const d = await r.json();
      if (d.status === "ok") {
        setUser(d.user);
        setScreen("home");
        track("login", null, null, d.user.name);
      } else setLoginError(d.message || "Login failed");
    } catch { setLoginError("Connection error."); }
  };

  const handleRegister = async () => {
    try {
      const r = await fetch(`${API}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName, email: regEmail,
          password: regPassword, phone: regPhone,
          city: regCity, language: "english"
        })
      });
      const d = await r.json();
      if (d.status === "ok") {
        alert("✅ Registered! Please login.");
        setShowRegister(false);
      } else alert("Error: " + d.error);
    } catch (err) { alert("Failed: " + err.message); }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1px solid #ddd", fontSize: 14, marginBottom: 12,
    outline: "none", boxSizing: "border-box"
  };

  const selectStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1px solid #ddd", fontSize: 14, marginBottom: 12,
    outline: "none", background: "white", boxSizing: "border-box"
  };

  const ProductCard = ({ p }) => (
    <div style={{ background: "white", borderRadius: 12, padding: 16, marginBottom: 12, display: "flex", alignItems: "flex-start", gap: 12 }}
      onClick={() => track("view_product", p.room_id, p.id, p.name)}>
      <div style={{ flexShrink: 0 }}>
        {p.image_url ? (
          <img src={p.image_url} alt={p.name}
            style={{ width: 90, height: 90, borderRadius: 8, objectFit: "cover" }}
            onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/90x90/FFF3DC/BA7517?text=🏠"; }} />
        ) : (
          <div style={{ width: 90, height: 90, borderRadius: 8, background: "#FFF3DC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🏠</div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{p.description}</div>
        <div style={{ color: "#BA7517", fontWeight: 700, marginTop: 6, fontSize: 15 }}>
          ₹{Number(p.price).toLocaleString("en-IN")}
          <span style={{ fontSize: 11, color: "#888", fontWeight: 400 }}> / {p.unit}</span>
        </div>
        {(p.length_cm || p.width_cm || p.height_cm) && (
          <div style={{ fontSize: 11, color: "#555", marginTop: 4, background: "#f8f8f8", borderRadius: 6, padding: "3px 8px", display: "inline-block" }}>
            📐 {[
              p.length_cm && `L:${p.length_cm}cm`,
              p.width_cm  && `W:${p.width_cm}cm`,
              p.height_cm && `H:${p.height_cm}cm`
            ].filter(Boolean).join(" × ")}
          </div>
        )}
        {(p.material || p.color) && (
          <div style={{ fontSize: 11, marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" }}>
            {p.material && <span style={{ background: "#EEEDFE", color: "#26215C", borderRadius: 4, padding: "2px 6px" }}>🧱 {p.material}</span>}
            {p.color    && <span style={{ background: "#E1F5EE", color: "#085041", borderRadius: 4, padding: "2px 6px" }}>🎨 {p.color}</span>}
          </div>
        )}
        <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
          Brand: <strong>{p.brand}</strong> | Stock: {p.stock_qty}
          {p.room_name && <span style={{ color: "#BA7517" }}> | {p.room_name}</span>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); addToCart(p); }}
          style={{ marginTop: 8, background: "#BA7517", color: "white", border: "none", borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
          + Add to Cart
        </button>
      </div>
    </div>
  );

  // ── LOGIN SCREEN ──
  if (screen === "login") {
    return (
      <div style={{ fontFamily: "sans-serif", maxWidth: 400, margin: "0 auto", padding: "40px 20px", background: "#f8f9fa", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 56 }}>🏠</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#BA7517" }}>HomeBot AI</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Interior Design Assistant</div>
        </div>
        {!showRegister ? (
          <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Login</div>
            <input placeholder="Email" value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)} style={inputStyle} />
            <input type="password" placeholder="Password" value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={inputStyle} />
            {loginError && <div style={{ color: "red", fontSize: 13, marginBottom: 10 }}>{loginError}</div>}
            <button onClick={handleLogin}
              style={{ width: "100%", padding: 12, background: "#BA7517", color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 12 }}>
              Login →
            </button>
            <div style={{ textAlign: "center", fontSize: 13, color: "#888", marginBottom: 12 }}>
              Test: rahul@gmail.com / homebot123
            </div>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 13, color: "#888" }}>New user? </span>
              <span onClick={() => setShowRegister(true)}
                style={{ fontSize: 13, color: "#BA7517", cursor: "pointer", fontWeight: 500 }}>Register</span>
            </div>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Create Account</div>
            <input placeholder="Full name" value={regName} onChange={e => setRegName(e.target.value)} style={inputStyle} />
            <input placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} style={inputStyle} />
            <input type="password" placeholder="Password" value={regPassword} onChange={e => setRegPassword(e.target.value)} style={inputStyle} />
            <input placeholder="Phone" value={regPhone} onChange={e => setRegPhone(e.target.value)} style={inputStyle} />
            <input placeholder="City" value={regCity} onChange={e => setRegCity(e.target.value)} style={inputStyle} />
            <button onClick={handleRegister}
              style={{ width: "100%", padding: 12, background: "#BA7517", color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 12 }}>
              Register →
            </button>
            <div style={{ textAlign: "center" }}>
              <span onClick={() => setShowRegister(false)}
                style={{ fontSize: 13, color: "#BA7517", cursor: "pointer" }}>← Back to Login</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── ORDER TRACKING SCREEN ──
  if (screen === "track" && trackedOrder) {
    return (
      <div style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto", background: "#f8f9fa", minHeight: "100vh" }}>
        <div style={{ background: "#BA7517", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setScreen("orders")}
            style={{ background: "none", border: "none", color: "white", fontSize: 20, cursor: "pointer" }}>←</button>
          <div style={{ color: "white", fontWeight: 600, fontSize: 16 }}>Track Order #{trackedOrder.id}</div>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ background: "white", borderRadius: 12, padding: 16, marginBottom: 12, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#888" }}>Current Status</div>
            <div style={{
              display: "inline-block", marginTop: 8,
              background: STATUS_COLORS[trackedOrder.status]?.bg || "#f0f0f0",
              color:      STATUS_COLORS[trackedOrder.status]?.color || "#333",
              borderRadius: 20, padding: "6px 20px", fontSize: 15, fontWeight: 600
            }}>
              {trackedOrder.status?.toUpperCase()}
            </div>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>Order Timeline</div>
            {trackedOrder.timeline?.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: step.done ? "#E1F5EE" : "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  {step.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: step.done ? "#085041" : "#888" }}>
                    {step.step}{step.done && <span style={{ marginLeft: 6, color: "#1D9E75" }}>✓</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Items Ordered</div>
            {trackedOrder.items?.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid #f0f0f0", fontSize: 13 }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{item.product_name}</div>
                  <div style={{ color: "#888", fontSize: 12 }}>Brand: {item.brand} | Qty: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 600, color: "#BA7517" }}>
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontWeight: 700, fontSize: 15 }}>
              <span>Grand Total</span>
              <span style={{ color: "#BA7517" }}>₹{Number(trackedOrder.grand_total).toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>Delivery Details</div>
            <div style={{ fontSize: 13, color: "#555" }}>👤 {trackedOrder.customer_name}</div>
            <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>📧 {trackedOrder.email}</div>
            <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>📍 {trackedOrder.city}</div>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN APP ──
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto", background: "#f8f9fa", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: "#BA7517", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "white", fontWeight: 600, fontSize: 18 }}>🏠 HomeBot AI</div>
          <div style={{ color: "#FFE0A0", fontSize: 12 }}>
            {user ? `Welcome, ${user.name}!` : "Interior Design Assistant"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ background: "white", borderRadius: 20, padding: "4px 12px", fontSize: 13, color: "#BA7517", fontWeight: 500, cursor: "pointer" }}
            onClick={() => setScreen("cart")}>🛒 {cart.length}</div>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 10px", fontSize: 12, color: "white", cursor: "pointer" }}
            onClick={() => { setUser(null); setScreen("login"); setCart([]); track("logout"); }}>Logout</div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 480, background: "white", display: "flex", borderTop: "1px solid #eee", zIndex: 100 }}>
        {[
          { id: "home",    icon: "🏠", label: "Rooms" },
          { id: "search",  icon: "🔍", label: "Search" },
          { id: "orders",  icon: "📦", label: "Orders" },
          { id: "profile", icon: "👤", label: "Profile" },
        ].map(tab => (
          <button key={tab.id} onClick={() => { setScreen(tab.id); trackPage(tab.id); }}
            style={{ flex: 1, padding: "10px 0", border: "none", background: "none", cursor: "pointer", fontSize: 11, color: screen === tab.id ? "#BA7517" : "#888", fontWeight: screen === tab.id ? 600 : 400 }}>
            <div style={{ fontSize: 20 }}>{tab.icon}</div>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Image Upload Modal */}
      {uploadScreen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, width: "90%", maxWidth: 400, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>📸 Upload Product Image</div>
              <button onClick={() => { setUploadScreen(false); setUploadSuccess(""); setUploadFile(null); setUploadProductId(""); }}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888" }}>✕</button>
            </div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Select Product</div>
            <select value={uploadProductId} onChange={e => setUploadProductId(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, marginBottom: 16, outline: "none", background: "white" }}>
              <option value="">-- Select a product --</option>
              {allProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.room_name})</option>
              ))}
            </select>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Select Image</div>
            <input type="file" accept="image/*"
              onChange={e => setUploadFile(e.target.files[0])}
              style={{ width: "100%", marginBottom: 16, fontSize: 13 }} />
            {uploadFile && (
              <div style={{ marginBottom: 16, textAlign: "center" }}>
                <img src={URL.createObjectURL(uploadFile)} alt="preview"
                  style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }} />
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{uploadFile.name}</div>
              </div>
            )}
            {uploadSuccess && (
              <div style={{ background: "#E1F5EE", borderRadius: 8, padding: 10, marginBottom: 12, textAlign: "center" }}>
                <img src={uploadSuccess} alt="uploaded"
                  style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }} />
                <div style={{ fontSize: 12, color: "#085041", marginTop: 4 }}>✅ Uploaded!</div>
              </div>
            )}
            <button onClick={uploadImage} disabled={uploadLoading}
              style={{ width: "100%", padding: 12, background: uploadLoading ? "#ccc" : "#BA7517", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: uploadLoading ? "not-allowed" : "pointer" }}>
              {uploadLoading ? "⏳ Uploading..." : "📤 Upload Image"}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "16px", paddingBottom: 80 }}>

        {/* HOME */}
        {screen === "home" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Select a room to renovate</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>Tap a room to see products</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {ROOMS.map(room => (
                <div key={room.id}
                  onClick={() => {
                    setRoom(room);
                    setScreen("products");
                    track("view_room", room.id, null, room.name);
                    trackPage("products");
                  }}
                  style={{ background: selectedRoom?.id === room.id ? "#FFF3DC" : "white", border: selectedRoom?.id === room.id ? "2px solid #BA7517" : "1px solid #eee", borderRadius: 12, padding: 16, cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: 32 }}>{room.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginTop: 6 }}>{room.name}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "white", borderRadius: 12, padding: 16, marginTop: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>💰 Your Budget</div>
              <input type="range" min={10000} max={500000} step={5000}
                value={budget} onChange={e => setBudget(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#BA7517" }} />
              <div style={{ textAlign: "center", fontWeight: 600, color: "#BA7517", fontSize: 18 }}>
                ₹{budget.toLocaleString("en-IN")}
              </div>
            </div>
            {cart.length > 0 && (
              <div style={{ background: "#FFF3DC", borderRadius: 12, padding: 14, marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>🛒 {cart.length} items in cart</div>
                  <div style={{ fontSize: 13, color: "#BA7517" }}>₹{grandTotal.toLocaleString("en-IN")} total</div>
                </div>
                <button onClick={() => setScreen("cart")}
                  style={{ background: "#BA7517", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  View Cart →
                </button>
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS */}
        {screen === "products" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {selectedRoom ? `${selectedRoom.icon} ${selectedRoom.name}` : "Select a room first"}
              </div>
              <button onClick={() => setScreen("home")}
                style={{ fontSize: 12, color: "#BA7517", background: "none", border: "none", cursor: "pointer" }}>← Back</button>
            </div>
            {products.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading...</div>}
            {products.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        )}

        {/* SEARCH */}
        {screen === "search" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>🔍 Search Products</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Search tiles, sink, wardrobe..."
                style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, outline: "none" }} />
              <button onClick={handleSearch}
                style={{ background: "#BA7517", color: "white", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 16 }}>🔍</button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <button onClick={() => setShowFilters(!showFilters)}
                style={{ fontSize: 13, color: "#BA7517", background: "#FFF3DC", border: "1px solid #BA7517", borderRadius: 20, padding: "4px 14px", cursor: "pointer" }}>
                {showFilters ? "Hide Filters ▲" : "Show Filters ▼"}
              </button>
              {(filterRoom || filterMin || filterMax || filterStyle || filterBrand) && (
                <button onClick={clearFilters}
                  style={{ fontSize: 12, color: "#c00", background: "none", border: "none", cursor: "pointer" }}>Clear all ✕</button>
              )}
            </div>
            {showFilters && (
              <div style={{ background: "white", borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#666" }}>FILTER BY</div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Room</div>
                <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)} style={selectStyle}>
                  <option value="">All Rooms</option>
                  {ROOMS.map(r => <option key={r.id} value={r.id}>{r.icon} {r.name}</option>)}
                </select>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Style</div>
                <select value={filterStyle} onChange={e => setFilterStyle(e.target.value)} style={selectStyle}>
                  <option value="">All Styles</option>
                  {styles.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Brand</div>
                <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} style={selectStyle}>
                  <option value="">All Brands</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Price Range (₹)</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="number" placeholder="Min" value={filterMin}
                    onChange={e => setFilterMin(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                  <input type="number" placeholder="Max" value={filterMax}
                    onChange={e => setFilterMax(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                </div>
                <button onClick={handleSearch}
                  style={{ width: "100%", marginTop: 12, padding: 10, background: "#BA7517", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Apply Filters
                </button>
              </div>
            )}
            {searching && <div style={{ textAlign: "center", padding: 30, color: "#888" }}>🔍 Searching...</div>}
            {!searching && searchResults.length > 0 && (
              <div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>Found <strong>{searchResults.length}</strong> products</div>
                {searchResults.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
            {!searching && searchResults.length === 0 && !searchQuery && (
              <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
                <div style={{ fontSize: 32 }}>🔍</div>
                <div style={{ marginTop: 8 }}>Search across all rooms</div>
                <div style={{ fontSize: 12, marginTop: 8 }}>Try: tile, tap, wardrobe, light</div>
              </div>
            )}
            {!searching && searchResults.length === 0 && searchQuery && (
              <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
                <div style={{ fontSize: 32 }}>🔍</div>
                <div style={{ marginTop: 8 }}>No results for "{searchQuery}"</div>
              </div>
            )}
          </div>
        )}

        {/* ORDERS */}
        {screen === "orders" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>📦 My Orders</div>
            {ordersLoading && <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading...</div>}
            {!ordersLoading && orders.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
                <div style={{ fontSize: 40 }}>📦</div>
                <div style={{ marginTop: 8 }}>No orders yet</div>
              </div>
            )}
            {orders.map(order => {
              const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
              return (
                <div key={order.id} style={{ background: "white", borderRadius: 12, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>Order #{order.id}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{new Date(order.created_at).toLocaleDateString("en-IN")}</div>
                    </div>
                    <div style={{ background: statusStyle.bg, color: statusStyle.color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
                      {order.status}
                    </div>
                  </div>
                  {order.items?.map((item, i) => (
                    <div key={i} style={{ fontSize: 13, color: "#555", padding: "4px 0", borderBottom: "0.5px solid #f0f0f0" }}>
                      • {item.product_name} × {item.quantity}
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: "1px solid #eee" }}>
                    <span style={{ fontWeight: 700, color: "#BA7517" }}>₹{Number(order.grand_total).toLocaleString("en-IN")}</span>
                    <button onClick={() => trackOrderFn(order.id)} disabled={trackLoading}
                      style={{ background: "#E6F1FB", color: "#0C447C", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                      🚚 Track Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PROFILE */}
        {screen === "profile" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>👤 My Profile</div>
            {profileLoading && <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading...</div>}
            {profile && !editProfile && (
              <div>
                <div style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 12, textAlign: "center" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FFF3DC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto" }}>👤</div>
                  <div style={{ fontWeight: 600, fontSize: 18, marginTop: 10 }}>{profile.user.name}</div>
                  <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{profile.user.email}</div>
                  <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>📍 {profile.user.city || "City not set"}</div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
                    <button onClick={() => setEditProfile(true)}
                      style={{ background: "#BA7517", color: "white", border: "none", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontSize: 13 }}>
                      ✏️ Edit Profile
                    </button>
                    <button onClick={() => setUploadScreen(true)}
                      style={{ background: "#E6F1FB", color: "#0C447C", border: "none", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontSize: 13 }}>
                      📸 Upload Images
                    </button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  {[
                    { label: "Total Orders", value: profile.stats.total_orders,  icon: "📦" },
                    { label: "Delivered",    value: profile.stats.delivered,     icon: "✅" },
                    { label: "Pending",      value: profile.stats.pending,       icon: "⏳" },
                    { label: "Total Spent",  value: `₹${Number(profile.stats.total_spent).toLocaleString("en-IN")}`, icon: "💰" },
                  ].map((stat, i) => (
                    <div key={i} style={{ background: "white", borderRadius: 12, padding: 14, textAlign: "center" }}>
                      <div style={{ fontSize: 24 }}>{stat.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: "#BA7517", marginTop: 4 }}>{stat.value}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "white", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>Account Details</div>
                  {[
                    { label: "Phone",    value: profile.user.phone    || "Not set" },
                    { label: "City",     value: profile.user.city     || "Not set" },
                    { label: "Language", value: profile.user.language || "English" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid #f0f0f0", fontSize: 14 }}>
                      <span style={{ color: "#888" }}>{item.label}</span>
                      <span style={{ fontWeight: 500 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {profile && editProfile && (
              <div style={{ background: "white", borderRadius: 12, padding: 20 }}>
                <div style={{ fontWeight: 600, marginBottom: 16 }}>✏️ Edit Profile</div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Full Name</div>
                <input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} />
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Phone</div>
                <input value={editPhone} onChange={e => setEditPhone(e.target.value)} style={inputStyle} />
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>City</div>
                <input value={editCity} onChange={e => setEditCity(e.target.value)} style={inputStyle} />
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Preferred Language</div>
                <select value={editLang} onChange={e => setEditLang(e.target.value)} style={selectStyle}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <button onClick={saveProfile}
                  style={{ width: "100%", padding: 12, background: "#BA7517", color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 10 }}>
                  Save Changes
                </button>
                <button onClick={() => setEditProfile(false)}
                  style={{ width: "100%", padding: 10, background: "none", color: "#888", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* CART */}
        {screen === "cart" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>🛒 Your Cart</div>
            {orderSuccess && (
              <div style={{ background: "#E1F5EE", border: "1px solid #1D9E75", borderRadius: 12, padding: 16, marginBottom: 16, textAlign: "center" }}>
                <div style={{ fontSize: 32 }}>🎉</div>
                <div style={{ fontWeight: 600, color: "#085041", marginTop: 8 }}>Order Placed!</div>
                <div style={{ fontSize: 13, color: "#085041", marginTop: 4 }}>Order ID: #{orderSuccess.order_id}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#085041", marginTop: 4 }}>
                  Total: ₹{Number(orderSuccess.grand_total).toLocaleString("en-IN")}
                </div>
                <button onClick={() => { setOrderSuccess(null); setScreen("orders"); }}
                  style={{ marginTop: 12, background: "#1D9E75", color: "white", border: "none", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontSize: 13 }}>
                  View Orders →
                </button>
              </div>
            )}
            {cart.length === 0 && !orderSuccess && (
              <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
                <div style={{ fontSize: 40 }}>🛒</div>
                <div style={{ marginTop: 8 }}>Cart is empty!</div>
              </div>
            )}
            {cart.map(item => (
              <div key={item.id} style={{ background: "white", borderRadius: 12, padding: 14, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
                  <div style={{ color: "#BA7517", fontSize: 13, marginTop: 2 }}>
                    ₹{Number(item.price).toLocaleString("en-IN")} × {item.qty}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontWeight: 600 }}>₹{(item.price * item.qty).toLocaleString("en-IN")}</div>
                  <button onClick={() => removeFromCart(item.id)}
                    style={{ background: "#fee", border: "1px solid #fcc", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#c00", fontSize: 12 }}>✕</button>
                </div>
              </div>
            ))}
            {cart.length > 0 && (
              <div style={{ background: "white", borderRadius: 12, padding: 16, marginTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                  <span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: "#666" }}>
                  <span>GST (18%)</span><span>₹{gst.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16, borderTop: "1px solid #eee", paddingTop: 10 }}>
                  <span>Grand Total</span>
                  <span style={{ color: "#BA7517" }}>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
                <button onClick={placeOrder} disabled={orderPlacing}
                  style={{ width: "100%", marginTop: 14, background: orderPlacing ? "#ccc" : "#1D9E75", color: "white", border: "none", borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 600, cursor: orderPlacing ? "not-allowed" : "pointer" }}>
                  {orderPlacing ? "⏳ Placing..." : "✅ Place Order"}
                </button>
                <button onClick={downloadPDF} disabled={pdfLoading}
                  style={{ width: "100%", marginTop: 10, background: pdfLoading ? "#ccc" : "#BA7517", color: "white", border: "none", borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 600, cursor: pdfLoading ? "not-allowed" : "pointer" }}>
                  {pdfLoading ? "⏳ Generating..." : "📄 Download PDF"}
                </button>
                <button onClick={sendWhatsApp}
                  style={{ width: "100%", marginTop: 10, background: "#25D366", color: "white", border: "none", borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                  💬 WhatsApp Quote
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}