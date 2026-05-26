import { useState, useEffect } from "react";

const API = "http://127.0.0.1:5000";

const ROOMS = [
  { id: 1, name: "Bathroom" },
  { id: 2, name: "Bedroom" },
  { id: 3, name: "Kitchen" },
  { id: 4, name: "Living Room" },
  { id: 5, name: "Dining Room" },
  { id: 6, name: "Study Room" },
  { id: 7, name: "Puja Room" },
  { id: 8, name: "Exterior" },
];

const STYLES = ["modern", "classic", "traditional", "luxury"];

export default function Admin() {
  const [screen, setScreen]         = useState("dashboard");
  const [stats, setStats]           = useState(null);
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRoom, setFilterRoom] = useState("");

  const emptyForm = {
    room_id: 1, name: "", description: "", price: "",
    unit: "per piece", stock_qty: "", style_tag: "modern",
    brand: "", length_cm: "", width_cm: "", height_cm: "",
    material: "", color: "", image_url: ""
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (screen === "dashboard") loadStats();
    if (screen === "products")  loadProducts();
  }, [screen]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/admin/stats`);
      const d = await r.json();
      setStats(d);
    } catch { setStats(null); }
    setLoading(false);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/admin/products`);
      const d = await r.json();
      setProducts(d.products || []);
    } catch { setProducts([]); }
    setLoading(false);
  };

  const saveProduct = async () => {
    if (!form.name || !form.price) {
      alert("Name and price are required!");
      return;
    }
    try {
      const url    = editProduct
        ? `${API}/api/admin/products/${editProduct.id}`
        : `${API}/api/admin/products`;
      const method = editProduct ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          room_id:   Number(form.room_id),
          price:     Number(form.price),
          stock_qty: Number(form.stock_qty),
          length_cm: form.length_cm ? Number(form.length_cm) : null,
          width_cm:  form.width_cm  ? Number(form.width_cm)  : null,
          height_cm: form.height_cm ? Number(form.height_cm) : null,
        })
      });
      const d = await r.json();
      if (d.status === "ok") {
        alert(editProduct ? "✅ Product updated!" : "✅ Product added!");
        setShowForm(false);
        setEditProduct(null);
        setForm(emptyForm);
        loadProducts();
      } else {
        alert("Error: " + d.error);
      }
    } catch (err) { alert("Failed: " + err.message); }
  };

  const deleteProduct = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone!`)) return;
    try {
      const r = await fetch(`${API}/api/admin/products/${id}`, {
        method: "DELETE"
      });
      const d = await r.json();
      if (d.status === "ok") {
        alert("✅ Product deleted!");
        loadProducts();
      }
    } catch (err) { alert("Failed: " + err.message); }
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      room_id:     p.room_id,
      name:        p.name,
      description: p.description || "",
      price:       p.price,
      unit:        p.unit || "per piece",
      stock_qty:   p.stock_qty || 0,
      style_tag:   p.style_tag || "modern",
      brand:       p.brand || "",
      length_cm:   p.length_cm || "",
      width_cm:    p.width_cm  || "",
      height_cm:   p.height_cm || "",
      material:    p.material  || "",
      color:       p.color     || "",
      image_url:   p.image_url || ""
    });
    setShowForm(true);
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRoom   = filterRoom ? p.room_id === Number(filterRoom) : true;
    return matchSearch && matchRoom;
  });

  const inputStyle = {
    width: "100%", padding: "8px 12px", borderRadius: 6,
    border: "1px solid #ddd", fontSize: 13, outline: "none",
    boxSizing: "border-box", marginBottom: 8
  };

  const labelStyle = {
    fontSize: 11, color: "#666",
    marginBottom: 2, display: "block"
  };

  return (
    <div style={{ fontFamily: "sans-serif", background: "#f0f2f5", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: "#1a1a2e", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: "white", fontWeight: 700, fontSize: 18 }}>
          🏠 HomeBot AI — Admin Panel
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { id: "dashboard", label: "📊 Dashboard" },
            { id: "products",  label: "📦 Products" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setScreen(tab.id)}
              style={{ padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: screen === tab.id ? "#BA7517" : "rgba(255,255,255,0.1)", color: "white" }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 24 }}>

        {/* DASHBOARD */}
        {screen === "dashboard" && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: "#1a1a2e" }}>
              📊 Admin Dashboard
            </div>

            {loading && <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading...</div>}

            {stats && (
              <div>
                {/* Stats cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                  {[
                    { label: "Total Products", value: stats.total_products,  icon: "📦", color: "#BA7517", bg: "#FFF3DC" },
                    { label: "Total Users",    value: stats.total_users,     icon: "👥", color: "#0C447C", bg: "#E6F1FB" },
                    { label: "Total Orders",   value: stats.total_orders,    icon: "🛒", color: "#085041", bg: "#E1F5EE" },
                    { label: "Total Revenue",  value: `₹${Number(stats.total_revenue).toLocaleString("en-IN")}`, icon: "💰", color: "#501313", bg: "#FCEBEB" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: s.bg, borderRadius: 12, padding: 20, border: `1px solid ${s.color}20` }}>
                      <div style={{ fontSize: 28 }}>{s.icon}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: s.color, marginTop: 8 }}>{s.value}</div>
                      <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                  {/* Orders by status */}
                  <div style={{ background: "white", borderRadius: 12, padding: 20 }}>
                    <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Orders by Status</div>
                    {stats.orders_by_status?.map((s, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid #f0f0f0", fontSize: 14 }}>
                        <span style={{ textTransform: "capitalize" }}>{s.status}</span>
                        <span style={{ fontWeight: 600, color: "#BA7517" }}>{s.count}</span>
                      </div>
                    ))}
                  </div>

                  {/* Top products */}
                  <div style={{ background: "white", borderRadius: 12, padding: 20 }}>
                    <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Top Products</div>
                    {stats.top_products?.map((p, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid #f0f0f0", fontSize: 13 }}>
                        <span>#{i + 1} {p.name}</span>
                        <span style={{ fontWeight: 600, color: "#BA7517" }}>{p.total_sold} sold</span>
                      </div>
                    ))}
                  </div>

                  {/* Revenue by room */}
                  <div style={{ background: "white", borderRadius: 12, padding: 20, gridColumn: "1 / -1" }}>
                    <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Revenue by Room</div>
                    {stats.revenue_by_room?.map((r, i) => (
                      <div key={i} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                          <span>{r.room}</span>
                          <span style={{ fontWeight: 600 }}>₹{Number(r.revenue).toLocaleString("en-IN")}</span>
                        </div>
                        <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 3, background: "#BA7517",
                            width: `${Math.min(100, (r.revenue / Math.max(...stats.revenue_by_room.map(x => x.revenue))) * 100)}%`
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS */}
        {screen === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>📦 Products ({filteredProducts.length})</div>
              <button onClick={() => { setShowForm(true); setEditProduct(null); setForm(emptyForm); }}
                style={{ background: "#BA7517", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                + Add Product
              </button>
            </div>

            {/* Search and filter */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <input
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, outline: "none" }}
              />
              <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)}
                style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, outline: "none", background: "white" }}>
                <option value="">All Rooms</option>
                {ROOMS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>

            {/* Products table */}
            <div style={{ background: "white", borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#1a1a2e", color: "white" }}>
                    {["Image", "Name", "Room", "Price", "Stock", "Brand", "Actions"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 13 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p, i) => (
                    <tr key={p.id} style={{ background: i % 2 === 0 ? "white" : "#fafafa", borderBottom: "0.5px solid #f0f0f0" }}>
                      <td style={{ padding: "10px 16px" }}>
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name}
                            style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover" }}
                            onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/48x48/FFF3DC/BA7517?text=🏠"; }} />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: 6, background: "#FFF3DC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏠</div>
                        )}
                      </td>
                      <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 500, maxWidth: 200 }}>
                        <div>{p.name}</div>
                        {(p.length_cm || p.width_cm) && (
                          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                            📐 {p.length_cm && `${p.length_cm}cm`}{p.width_cm && ` × ${p.width_cm}cm`}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "10px 16px", fontSize: 13, color: "#BA7517" }}>{p.room_name}</td>
                      <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>₹{Number(p.price).toLocaleString("en-IN")}</td>
                      <td style={{ padding: "10px 16px", fontSize: 13 }}>
                        <span style={{ background: p.stock_qty > 10 ? "#E1F5EE" : "#FCEBEB", color: p.stock_qty > 10 ? "#085041" : "#501313", borderRadius: 4, padding: "2px 8px" }}>
                          {p.stock_qty}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px", fontSize: 13 }}>{p.brand}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => openEdit(p)}
                            style={{ background: "#E6F1FB", color: "#0C447C", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                            ✏️ Edit
                          </button>
                          <button onClick={() => deleteProduct(p.id, p.name)}
                            style={{ background: "#FCEBEB", color: "#501313", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, width: "90%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>
                {editProduct ? "✏️ Edit Product" : "➕ Add New Product"}
              </div>
              <button onClick={() => { setShowForm(false); setEditProduct(null); }}
                style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888" }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Product Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="e.g. RAK Ceramic Floor Tile" style={inputStyle} />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Description</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Short product description" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Room *</label>
                <select value={form.room_id} onChange={e => setForm({...form, room_id: e.target.value})}
                  style={inputStyle}>
                  {ROOMS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Style</label>
                <select value={form.style_tag} onChange={e => setForm({...form, style_tag: e.target.value})}
                  style={inputStyle}>
                  {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Price (₹) *</label>
                <input type="number" value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  placeholder="e.g. 850" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Unit</label>
                <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                  style={inputStyle}>
                  {["per piece", "per set", "per sqft", "per meter", "per kg", "per bucket"].map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Stock Quantity</label>
                <input type="number" value={form.stock_qty}
                  onChange={e => setForm({...form, stock_qty: e.target.value})}
                  placeholder="e.g. 100" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Brand</label>
                <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}
                  placeholder="e.g. Jaquar" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Length (cm)</label>
                <input type="number" value={form.length_cm}
                  onChange={e => setForm({...form, length_cm: e.target.value})}
                  placeholder="e.g. 60" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Width (cm)</label>
                <input type="number" value={form.width_cm}
                  onChange={e => setForm({...form, width_cm: e.target.value})}
                  placeholder="e.g. 30" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Height (cm)</label>
                <input type="number" value={form.height_cm}
                  onChange={e => setForm({...form, height_cm: e.target.value})}
                  placeholder="e.g. 180" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Material</label>
                <input value={form.material} onChange={e => setForm({...form, material: e.target.value})}
                  placeholder="e.g. Ceramic" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Color</label>
                <input value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                  placeholder="e.g. White" style={inputStyle} />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Image URL</label>
                <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})}
                  placeholder="https://res.cloudinary.com/..." style={inputStyle} />
              </div>

            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={saveProduct}
                style={{ flex: 1, padding: 12, background: "#BA7517", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                {editProduct ? "💾 Save Changes" : "➕ Add Product"}
              </button>
              <button onClick={() => { setShowForm(false); setEditProduct(null); }}
                style={{ flex: 1, padding: 12, background: "none", color: "#888", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}