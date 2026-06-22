import { useState, useEffect } from "react";

const API = "https://homebot-ai.onrender.com";

export default function Admin() {
  const [tab, setTab]                   = useState("dashboard");
  const [stats, setStats]               = useState(null);
  const [products, setProducts]         = useState([]);
  const [analytics, setAnalytics]       = useState(null);
  const [sales, setSales]               = useState([]);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [editingSale, setEditingSale]   = useState(null);
  const [saleForm, setSaleForm]         = useState({
    name:"", description:"", discount_pct:10,
    start_date:"", end_date:"", banner_color:"#BA7517", emoji:"sale"
  });
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct]   = useState(null);
  const [productForm, setProductForm]         = useState({
    room_id:"1", name:"", description:"", price:"",
    unit:"sqft", stock_qty:"100", style_tag:"modern",
    brand:"", length_cm:"", width_cm:"", height_cm:"",
    material:"", color:"", image_url:""
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState("");

  const ROOMS = [
    {id:1,name:"Bathroom"},{id:2,name:"Bedroom"},
    {id:3,name:"Kitchen"},{id:4,name:"Living Room"},
    {id:5,name:"Dining Room"},{id:6,name:"Study Room"},
    {id:7,name:"Puja Room"},{id:8,name:"Exterior"}
  ];

  useEffect(() => {
    loadStats();
    loadProducts();
    loadAnalytics();
    loadSales();
  }, []);

  const loadStats = async () => {
    try { const r=await fetch(`${API}/api/admin/stats`); const d=await r.json(); setStats(d); } catch {}
  };

  const loadProducts = async () => {
    try { const r=await fetch(`${API}/api/admin/products`); const d=await r.json(); setProducts(d.products||[]); } catch {}
  };

  const loadAnalytics = async () => {
    try { const r=await fetch(`${API}/api/analytics/dashboard`); const d=await r.json(); setAnalytics(d); } catch {}
  };

  const loadSales = async () => {
    try { const r=await fetch(`${API}/api/sales`); const d=await r.json(); setSales(d.sales||[]); } catch {}
  };

  const saveProduct = async () => {
    setLoading(true);
    try {
      const url    = editingProduct ? `${API}/api/admin/products/${editingProduct.id}` : `${API}/api/admin/products`;
      const method = editingProduct ? "PUT" : "POST";
      const r      = await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify({...productForm,price:Number(productForm.price),room_id:Number(productForm.room_id),stock_qty:Number(productForm.stock_qty)})});
      const d      = await r.json();
      if (d.status==="ok") { setMsg(editingProduct?"✅ Product updated!":"✅ Product added!"); setShowProductForm(false); setEditingProduct(null); loadProducts(); resetProductForm(); }
      else setMsg("Error: "+d.error);
    } catch(err) { setMsg("Failed: "+err.message); }
    setLoading(false);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await fetch(`${API}/api/admin/products/${id}`,{method:"DELETE"});
      setMsg("✅ Product deleted!"); loadProducts();
    } catch(err) { setMsg("Failed: "+err.message); }
  };

  const saveSale = async () => {
    if (!saleForm.name||!saleForm.end_date) { setMsg("Please fill name and end date!"); return; }
    setLoading(true);
    try {
      const url    = editingSale ? `${API}/api/sales/${editingSale.id}` : `${API}/api/sales`;
      const method = editingSale ? "PUT" : "POST";
      const body   = editingSale
        ? { name:saleForm.name, description:saleForm.description, discount_pct:Number(saleForm.discount_pct), end_date:saleForm.end_date, is_active:true }
        : { ...saleForm, discount_pct:Number(saleForm.discount_pct), start_date:saleForm.start_date||new Date().toISOString() };
      const r = await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const d = await r.json();
      if (d.status==="ok") { setMsg(editingSale?"✅ Sale updated!":"✅ Sale created!"); setShowSaleForm(false); setEditingSale(null); resetSaleForm(); loadSales(); }
      else setMsg("Error: "+d.error);
    } catch(err) { setMsg("Failed: "+err.message); }
    setLoading(false);
  };

  const deleteSale = async (id) => {
    if (!window.confirm("End this sale?")) return;
    try {
      await fetch(`${API}/api/sales/${id}`,{method:"DELETE"});
      setMsg("✅ Sale ended!"); loadSales();
    } catch(err) { setMsg("Failed: "+err.message); }
  };

  const editSale = (sale) => {
    setEditingSale(sale);
    setSaleForm({ name:sale.name, description:sale.description||"", discount_pct:sale.discount_pct, start_date:sale.start_date?.split("T")[0]||"", end_date:sale.end_date?.split("T")[0]||"", banner_color:sale.banner_color||"#BA7517", emoji:sale.emoji||"sale" });
    setShowSaleForm(true);
  };

  const resetSaleForm    = () => setSaleForm({name:"",description:"",discount_pct:10,start_date:"",end_date:"",banner_color:"#BA7517",emoji:"sale"});
  const resetProductForm = () => setProductForm({room_id:"1",name:"",description:"",price:"",unit:"sqft",stock_qty:"100",style_tag:"modern",brand:"",length_cm:"",width_cm:"",height_cm:"",material:"",color:"",image_url:""});

  const startEditProduct = (p) => {
    setEditingProduct(p);
    setProductForm({ room_id:String(p.room_id), name:p.name, description:p.description||"", price:String(p.price), unit:p.unit||"sqft", stock_qty:String(p.stock_qty||0), style_tag:p.style_tag||"modern", brand:p.brand||"", length_cm:String(p.length_cm||""), width_cm:String(p.width_cm||""), height_cm:String(p.height_cm||""), material:p.material||"", color:p.color||"", image_url:p.image_url||"" });
    setShowProductForm(true);
  };

  const S = {
    input:  {width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #ddd",fontSize:13,marginBottom:10,outline:"none",boxSizing:"border-box"},
    select: {width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #ddd",fontSize:13,marginBottom:10,outline:"none",background:"white",boxSizing:"border-box"},
    label:  {fontSize:12,color:"#666",display:"block",marginBottom:3}
  };

  // ── SALE EMOJI DISPLAY ──
  const saleEmoji = (emoji) => {
    const map = {Diwali:"🪔",Summer:"☀️",Puja:"🙏",New:"🏠",sale:"🎉"};
    return map[emoji] || "🎉";
  };

  // ── TIME LEFT ──
  const timeLeft = (endDate) => {
    const diff = new Date(endDate) - new Date();
    if (diff<=0) return "Expired";
    const days  = Math.floor(diff/(1000*60*60*24));
    const hours = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
    return days>0 ? `${days}d ${hours}h left` : `${hours}h left`;
  };

  return (
    <div style={{fontFamily:"sans-serif",maxWidth:900,margin:"0 auto",padding:20,background:"#f8f9fa",minHeight:"100vh"}}>

      {/* Header */}
      <div style={{background:"#BA7517",borderRadius:12,padding:"16px 20px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{color:"white",fontWeight:700,fontSize:20}}>🏠 HomeBot AI — Admin Panel</div><div style={{color:"#FFE0A0",fontSize:13,marginTop:2}}>Manage products, sales & analytics</div></div>
        <a href="http://localhost:3000" target="_blank" rel="noreferrer" style={{background:"white",color:"#BA7517",borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:600,textDecoration:"none"}}>View App →</a>
      </div>

      {msg&&<div style={{background:"#E1F5EE",border:"1px solid #1D9E75",borderRadius:8,padding:"10px 16px",marginBottom:16,fontSize:13,color:"#085041",display:"flex",justifyContent:"space-between"}}>{msg}<span style={{cursor:"pointer"}} onClick={()=>setMsg("")}>✕</span></div>}

      {/* Tabs */}
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {[{id:"dashboard",label:"📊 Dashboard"},{id:"products",label:"📦 Products"},{id:"sales",label:"🎉 Festival Sales"},{id:"analytics",label:"📈 Analytics"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"8px 18px",borderRadius:20,border:"none",cursor:"pointer",fontSize:13,fontWeight:500,background:tab===t.id?"#BA7517":"white",color:tab===t.id?"white":"#555",boxShadow:tab===t.id?"0 2px 8px rgba(186,117,23,0.3)":"none"}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD TAB ── */}
      {tab==="dashboard"&&stats&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
            {[{label:"Total Products",value:stats.total_products,icon:"📦",color:"#BA7517"},{label:"Total Users",value:stats.total_users,icon:"👥",color:"#0C447C"},{label:"Total Orders",value:stats.total_orders,icon:"🛒",color:"#085041"},{label:"Revenue",value:`₹${Number(stats.total_revenue).toLocaleString("en-IN")}`,icon:"💰",color:"#8B00FF"}].map((s,i)=>(
              <div key={i} style={{background:"white",borderRadius:12,padding:16,textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                <div style={{fontSize:28}}>{s.icon}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color,marginTop:4}}>{s.value}</div>
                <div style={{fontSize:12,color:"#888",marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{background:"white",borderRadius:12,padding:16}}>
              <div style={{fontWeight:600,marginBottom:12}}>📦 Orders by Status</div>
              {stats.orders_by_status?.map((s,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"0.5px solid #f0f0f0",fontSize:13}}>
                  <span style={{textTransform:"capitalize"}}>{s.status}</span>
                  <span style={{fontWeight:600}}>{s.count}</span>
                </div>
              ))}
            </div>
            <div style={{background:"white",borderRadius:12,padding:16}}>
              <div style={{fontWeight:600,marginBottom:12}}>🏆 Top Products</div>
              {stats.top_products?.map((p,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"0.5px solid #f0f0f0",fontSize:13}}>
                  <span>#{i+1} {p.name?.substring(0,25)}</span>
                  <span style={{fontWeight:600,color:"#BA7517"}}>{p.total_sold} sold</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:"white",borderRadius:12,padding:16,marginTop:16}}>
            <div style={{fontWeight:600,marginBottom:12}}>💰 Revenue by Room</div>
            {stats.revenue_by_room?.map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"0.5px solid #f0f0f0"}}>
                <span style={{fontSize:13}}>{r.room}</span>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:100,height:6,background:"#f0f0f0",borderRadius:3}}><div style={{height:"100%",borderRadius:3,background:"#BA7517",width:`${Math.min((r.revenue/Math.max(...stats.revenue_by_room.map(x=>x.revenue)))*100,100)}%`}}/></div>
                  <span style={{fontSize:12,fontWeight:600,color:"#BA7517",minWidth:60}}>₹{Number(r.revenue).toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PRODUCTS TAB ── */}
      {tab==="products"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:16,fontWeight:600}}>📦 Products ({products.length})</div>
            <button onClick={()=>{setShowProductForm(true);setEditingProduct(null);resetProductForm();}}
              style={{background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,fontWeight:600}}>
              + Add Product
            </button>
          </div>

          {showProductForm&&(
            <div style={{background:"white",borderRadius:12,padding:20,marginBottom:16,boxShadow:"0 2px 12px rgba(0,0,0,0.1)"}}>
              <div style={{fontWeight:600,fontSize:15,marginBottom:16}}>{editingProduct?"✏️ Edit Product":"➕ Add New Product"}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label style={S.label}>Room</label><select value={productForm.room_id} onChange={e=>setProductForm({...productForm,room_id:e.target.value})} style={S.select}>{ROOMS.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
                <div><label style={S.label}>Product Name *</label><input value={productForm.name} onChange={e=>setProductForm({...productForm,name:e.target.value})} placeholder="Product name" style={S.input}/></div>
                <div><label style={S.label}>Price (₹) *</label><input type="number" value={productForm.price} onChange={e=>setProductForm({...productForm,price:e.target.value})} placeholder="Price" style={S.input}/></div>
                <div><label style={S.label}>Unit</label><input value={productForm.unit} onChange={e=>setProductForm({...productForm,unit:e.target.value})} placeholder="sqft / piece" style={S.input}/></div>
                <div><label style={S.label}>Brand</label><input value={productForm.brand} onChange={e=>setProductForm({...productForm,brand:e.target.value})} placeholder="Brand name" style={S.input}/></div>
                <div><label style={S.label}>Stock Qty</label><input type="number" value={productForm.stock_qty} onChange={e=>setProductForm({...productForm,stock_qty:e.target.value})} placeholder="Stock" style={S.input}/></div>
                <div><label style={S.label}>Style</label><select value={productForm.style_tag} onChange={e=>setProductForm({...productForm,style_tag:e.target.value})} style={S.select}>{["modern","classic","traditional","luxury","minimalist"].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                <div><label style={S.label}>Material</label><input value={productForm.material} onChange={e=>setProductForm({...productForm,material:e.target.value})} placeholder="Ceramic, Wood..." style={S.input}/></div>
                <div><label style={S.label}>Color</label><input value={productForm.color} onChange={e=>setProductForm({...productForm,color:e.target.value})} placeholder="White, Beige..." style={S.input}/></div>
                <div><label style={S.label}>Image URL</label><input value={productForm.image_url} onChange={e=>setProductForm({...productForm,image_url:e.target.value})} placeholder="https://..." style={S.input}/></div>
              </div>
              <div><label style={S.label}>Description</label><textarea value={productForm.description} onChange={e=>setProductForm({...productForm,description:e.target.value})} placeholder="Product description" style={{...S.input,minHeight:60,resize:"vertical"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                <div><label style={S.label}>Length (cm)</label><input type="number" value={productForm.length_cm} onChange={e=>setProductForm({...productForm,length_cm:e.target.value})} style={S.input}/></div>
                <div><label style={S.label}>Width (cm)</label><input type="number" value={productForm.width_cm} onChange={e=>setProductForm({...productForm,width_cm:e.target.value})} style={S.input}/></div>
                <div><label style={S.label}>Height (cm)</label><input type="number" value={productForm.height_cm} onChange={e=>setProductForm({...productForm,height_cm:e.target.value})} style={S.input}/></div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <button onClick={saveProduct} disabled={loading}
                  style={{flex:1,padding:10,background:loading?"#ccc":"#BA7517",color:"white",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:loading?"not-allowed":"pointer"}}>
                  {loading?"⏳ Saving...":editingProduct?"💾 Update Product":"➕ Add Product"}
                </button>
                <button onClick={()=>{setShowProductForm(false);setEditingProduct(null);}}
                  style={{padding:"10px 20px",background:"#f0f0f0",color:"#555",border:"none",borderRadius:8,fontSize:14,cursor:"pointer"}}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{background:"white",borderRadius:12,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:"#f8f9fa"}}>
                  {["Image","Name","Room","Price","Stock","Brand",""].map((h,i)=>(
                    <th key={i} style={{padding:"10px 12px",textAlign:"left",fontSize:12,color:"#666",fontWeight:600,borderBottom:"1px solid #eee"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p=>(
                  <tr key={p.id} style={{borderBottom:"0.5px solid #f0f0f0"}}>
                    <td style={{padding:"8px 12px"}}>
                      {p.image_url?<img src={p.image_url} alt={p.name} style={{width:44,height:44,borderRadius:6,objectFit:"cover"}} onError={e=>{e.target.onerror=null;e.target.src="https://placehold.co/44x44/FFF3DC/BA7517?text=🏠";}}/>:<div style={{width:44,height:44,borderRadius:6,background:"#FFF3DC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏠</div>}
                    </td>
                    <td style={{padding:"8px 12px",fontSize:13,fontWeight:500,maxWidth:160}}>{p.name}</td>
                    <td style={{padding:"8px 12px",fontSize:12,color:"#888"}}>{p.room_name}</td>
                    <td style={{padding:"8px 12px",fontSize:13,fontWeight:600,color:"#BA7517"}}>₹{Number(p.price).toLocaleString("en-IN")}</td>
                    <td style={{padding:"8px 12px",fontSize:13}}>{p.stock_qty}</td>
                    <td style={{padding:"8px 12px",fontSize:12,color:"#666"}}>{p.brand}</td>
                    <td style={{padding:"8px 12px"}}>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>startEditProduct(p)} style={{background:"#E6F1FB",color:"#0C447C",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:12}}>Edit</button>
                        <button onClick={()=>deleteProduct(p.id)} style={{background:"#FCEBEB",color:"#501313",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:12}}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── FESTIVAL SALES TAB ── */}
      {tab==="sales"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:16,fontWeight:600}}>🎉 Festival Sales ({sales.length} active)</div>
            <button onClick={()=>{setShowSaleForm(true);setEditingSale(null);resetSaleForm();}}
              style={{background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,fontWeight:600}}>
              + Create Sale
            </button>
          </div>

          {showSaleForm&&(
            <div style={{background:"white",borderRadius:12,padding:20,marginBottom:16,boxShadow:"0 2px 12px rgba(0,0,0,0.1)"}}>
              <div style={{fontWeight:600,fontSize:15,marginBottom:16}}>{editingSale?"✏️ Edit Sale":"🎉 Create Festival Sale"}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div style={{gridColumn:"1/-1"}}><label style={S.label}>Sale Name *</label><input value={saleForm.name} onChange={e=>setSaleForm({...saleForm,name:e.target.value})} placeholder="e.g. Diwali Dhamaka Sale" style={S.input}/></div>
                <div style={{gridColumn:"1/-1"}}><label style={S.label}>Description</label><textarea value={saleForm.description} onChange={e=>setSaleForm({...saleForm,description:e.target.value})} placeholder="Sale description..." style={{...S.input,minHeight:50,resize:"vertical"}}/></div>
                <div><label style={S.label}>Discount % *</label><input type="number" min="1" max="90" value={saleForm.discount_pct} onChange={e=>setSaleForm({...saleForm,discount_pct:e.target.value})} style={S.input}/></div>
                <div><label style={S.label}>Banner Color</label>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <input type="color" value={saleForm.banner_color} onChange={e=>setSaleForm({...saleForm,banner_color:e.target.value})} style={{width:40,height:36,borderRadius:6,border:"1px solid #ddd",cursor:"pointer",padding:2}}/>
                    <input value={saleForm.banner_color} onChange={e=>setSaleForm({...saleForm,banner_color:e.target.value})} style={{...S.input,marginBottom:0,flex:1}}/>
                  </div>
                </div>
                <div><label style={S.label}>Emoji Label</label>
                  <select value={saleForm.emoji} onChange={e=>setSaleForm({...saleForm,emoji:e.target.value})} style={S.select}>
                    <option value="Diwali">🪔 Diwali</option>
                    <option value="Summer">☀️ Summer</option>
                    <option value="Puja">🙏 Puja</option>
                    <option value="New">🏠 New Home</option>
                    <option value="sale">🎉 General Sale</option>
                  </select>
                </div>
                {!editingSale&&<div><label style={S.label}>Start Date</label><input type="date" value={saleForm.start_date} onChange={e=>setSaleForm({...saleForm,start_date:e.target.value})} style={S.input}/></div>}
                <div><label style={S.label}>End Date *</label><input type="date" value={saleForm.end_date} onChange={e=>setSaleForm({...saleForm,end_date:e.target.value})} style={S.input}/></div>
              </div>

              {/* Preview Banner */}
              {saleForm.name&&(
                <div style={{marginTop:12,marginBottom:12}}>
                  <label style={S.label}>Preview:</label>
                  <div style={{borderRadius:12,padding:16,background:saleForm.banner_color,display:"inline-block",minWidth:220}}>
                    <div style={{fontSize:24,marginBottom:4}}>{saleForm.emoji==="Diwali"?"🪔":saleForm.emoji==="Summer"?"☀️":saleForm.emoji==="Puja"?"🙏":saleForm.emoji==="New"?"🏠":"🎉"}</div>
                    <div style={{color:"white",fontWeight:700,fontSize:14}}>{saleForm.name}</div>
                    <div style={{color:"rgba(255,255,255,0.85)",fontSize:12,marginTop:4}}>Up to {saleForm.discount_pct}% OFF</div>
                  </div>
                </div>
              )}

              <div style={{display:"flex",gap:8}}>
                <button onClick={saveSale} disabled={loading}
                  style={{flex:1,padding:10,background:loading?"#ccc":"#BA7517",color:"white",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:loading?"not-allowed":"pointer"}}>
                  {loading?"⏳ Saving...":editingSale?"💾 Update Sale":"🎉 Create Sale"}
                </button>
                <button onClick={()=>{setShowSaleForm(false);setEditingSale(null);}}
                  style={{padding:"10px 20px",background:"#f0f0f0",color:"#555",border:"none",borderRadius:8,fontSize:14,cursor:"pointer"}}>Cancel</button>
              </div>
            </div>
          )}

          {sales.length===0&&(
            <div style={{background:"white",borderRadius:12,padding:40,textAlign:"center",color:"#888"}}>
              <div style={{fontSize:40}}>🎉</div>
              <div style={{marginTop:8,fontWeight:500}}>No active sales</div>
              <div style={{fontSize:13,marginTop:4}}>Create your first festival sale!</div>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {sales.map(sale=>(
              <div key={sale.id} style={{borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.1)"}}>
                <div style={{background:sale.banner_color||"#BA7517",padding:16}}>
                  <div style={{fontSize:28,marginBottom:6}}>{saleEmoji(sale.emoji)}</div>
                  <div style={{color:"white",fontWeight:700,fontSize:15}}>{sale.name}</div>
                  <div style={{color:"rgba(255,255,255,0.85)",fontSize:12,marginTop:4}}>{sale.description?.substring(0,60)}...</div>
                  <div style={{background:"rgba(255,255,255,0.25)",borderRadius:8,padding:"4px 10px",display:"inline-block",color:"white",fontSize:13,fontWeight:700,marginTop:8}}>
                    {sale.discount_pct}% OFF
                  </div>
                </div>
                <div style={{background:"white",padding:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#888",marginBottom:8}}>
                    <span>⏱️ {timeLeft(sale.end_date)}</span>
                    <span>Ends: {new Date(sale.end_date).toLocaleDateString("en-IN")}</span>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>editSale(sale)} style={{flex:1,background:"#E6F1FB",color:"#0C447C",border:"none",borderRadius:6,padding:"6px 0",cursor:"pointer",fontSize:12,fontWeight:500}}>✏️ Edit</button>
                    <button onClick={()=>deleteSale(sale.id)} style={{flex:1,background:"#FCEBEB",color:"#501313",border:"none",borderRadius:6,padding:"6px 0",cursor:"pointer",fontSize:12,fontWeight:500}}>🔴 End Sale</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {tab==="analytics"&&analytics&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
            {[{label:"Total Users",value:analytics.total_users,icon:"👥"},{label:"Active Today",value:analytics.active_today,icon:"🟢"},{label:"Avg Session",value:`${analytics.avg_session_duration}s`,icon:"⏱️"}].map((s,i)=>(
              <div key={i} style={{background:"white",borderRadius:12,padding:16,textAlign:"center"}}>
                <div style={{fontSize:24}}>{s.icon}</div>
                <div style={{fontSize:22,fontWeight:700,color:"#BA7517",marginTop:4}}>{s.value}</div>
                <div style={{fontSize:12,color:"#888",marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{background:"white",borderRadius:12,padding:16}}>
              <div style={{fontWeight:600,marginBottom:12}}>🏠 Popular Rooms</div>
              {analytics.popular_rooms?.slice(0,5).map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"0.5px solid #f0f0f0"}}>
                  <span style={{fontSize:13}}>#{i+1} {r.room}</span>
                  <span style={{background:"#FFF3DC",color:"#BA7517",borderRadius:10,padding:"2px 10px",fontSize:12,fontWeight:600}}>{r.views} views</span>
                </div>
              ))}
            </div>
            <div style={{background:"white",borderRadius:12,padding:16}}>
              <div style={{fontWeight:600,marginBottom:12}}>🛒 Cart Products</div>
              {analytics.cart_products?.slice(0,5).map((p,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"0.5px solid #f0f0f0"}}>
                  <span style={{fontSize:13}}>#{i+1} {p.product?.substring(0,20)}</span>
                  <span style={{background:"#E1F5EE",color:"#085041",borderRadius:10,padding:"2px 10px",fontSize:12,fontWeight:600}}>{p.add_count}x</span>
                </div>
              ))}
            </div>
            <div style={{background:"white",borderRadius:12,padding:16}}>
              <div style={{fontWeight:600,marginBottom:12}}>📄 Page Views</div>
              {analytics.page_stats?.slice(0,5).map((p,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"0.5px solid #f0f0f0",fontSize:13}}>
                  <span>/{p.page}</span>
                  <span style={{fontWeight:600}}>{p.views} views</span>
                </div>
              ))}
            </div>
            <div style={{background:"white",borderRadius:12,padding:16}}>
              <div style={{fontWeight:600,marginBottom:12}}>📅 Daily Orders (7 days)</div>
              {analytics.daily_orders?.length===0&&<div style={{color:"#888",fontSize:13}}>No orders yet</div>}
              {analytics.daily_orders?.map((d,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"0.5px solid #f0f0f0",fontSize:13}}>
                  <span>{d.date}</span>
                  <span style={{fontWeight:600,color:"#BA7517"}}>₹{Number(d.revenue).toLocaleString("en-IN")} ({d.orders} orders)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}