import { useState, useEffect } from "react";

const API = "http://127.0.0.1:5000";

const track = async (action, roomId=null, productId=null, details="") => {
  try { await fetch(`${API}/api/analytics/track`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:1,action,room_id:roomId,product_id:productId,details})}); } catch {}
};
const trackPage = async (page, duration=0) => {
  try { await fetch(`${API}/api/analytics/pageview`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:1,page,duration})}); } catch {}
};

const ROOMS = [
  {id:1,name:"Bathroom",    icon:"🛁"},
  {id:2,name:"Bedroom",     icon:"🛏️"},
  {id:3,name:"Kitchen",     icon:"🍳"},
  {id:4,name:"Living Room", icon:"🛋️"},
  {id:5,name:"Dining Room", icon:"🍽️"},
  {id:6,name:"Study Room",  icon:"📚"},
  {id:7,name:"Puja Room",   icon:"🙏"},
  {id:8,name:"Exterior",    icon:"🏗️"},
];

const STATUS_COLORS = {
  pending:    {bg:"#FFF3DC",color:"#BA7517"},
  processing: {bg:"#E6F1FB",color:"#0C447C"},
  shipped:    {bg:"#EEEDFE",color:"#26215C"},
  delivered:  {bg:"#E1F5EE",color:"#085041"},
  cancelled:  {bg:"#FCEBEB",color:"#501313"},
};

const LANGUAGES = ["english","hindi","bengali","tamil","telugu","marathi","gujarati","kannada","malayalam","punjabi","odia"];

const StarRating = ({rating, onRate, size=20}) => (
  <div style={{display:"flex",gap:2}}>
    {[1,2,3,4,5].map(star=>(
      <span key={star} onClick={()=>onRate&&onRate(star)}
        style={{fontSize:size,cursor:onRate?"pointer":"default",color:star<=rating?"#FFB800":"#ddd"}}>★</span>
    ))}
  </div>
);

const LoadingSpinner = () => (
  <div style={{textAlign:"center",padding:40}}>
    <div style={{width:40,height:40,border:"4px solid #FFF3DC",borderTop:"4px solid #BA7517",borderRadius:"50%",margin:"0 auto",animation:"spin 1s linear infinite"}}/>
    <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
    <div style={{color:"#888",fontSize:13,marginTop:12}}>Loading...</div>
  </div>
);

const CountdownTimer = ({endDate}) => {
  const [timeLeft, setTimeLeft] = useState({});
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate) - new Date();
      if (diff<=0) { setTimeLeft({expired:true}); return; }
      setTimeLeft({days:Math.floor(diff/(1000*60*60*24)),hours:Math.floor((diff%(1000*60*60*24))/(1000*60*60)),minutes:Math.floor((diff%(1000*60*60))/(1000*60)),seconds:Math.floor((diff%(1000*60))/1000)});
    };
    calc();
    const timer = setInterval(calc,1000);
    return () => clearInterval(timer);
  }, [endDate]);
  if (timeLeft.expired) return <span style={{color:"#c00",fontSize:11}}>Sale Ended</span>;
  return (
    <div style={{display:"flex",gap:4,alignItems:"center"}}>
      {[["days",timeLeft.days],["hrs",timeLeft.hours],["min",timeLeft.minutes],["sec",timeLeft.seconds]].map(([label,val])=>(
        <div key={label} style={{background:"rgba(0,0,0,0.2)",borderRadius:4,padding:"2px 5px",textAlign:"center",minWidth:32}}>
          <div style={{fontSize:13,fontWeight:700,color:"white"}}>{String(val||0).padStart(2,"0")}</div>
          <div style={{fontSize:8,color:"rgba(255,255,255,0.8)"}}>{label}</div>
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [screen, setScreen]               = useState("login");
  const [user, setUser]                   = useState(null);
  const [selectedRoom, setRoom]           = useState(null);
  const [products, setProducts]           = useState([]);
  const [cart, setCart]                   = useState([]);
  const [messages, setMessages]           = useState([{role:"ai",text:"👋 Namaste! I am HomeBot AI. Which room do you want to renovate today?"}]);
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
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending]           = useState([]);
  const [recLoading, setRecLoading]       = useState(false);
  const [styleProfile, setStyleProfile]   = useState(null);
  const [showStyleSetup, setShowStyleSetup] = useState(false);
  const [stylePref, setStylePref]         = useState("modern");
  const [budgetPref, setBudgetPref]       = useState("medium");
  const [colorPref, setColorPref]         = useState("");
  const [materialPref, setMaterialPref]   = useState("");
  const [usePersonalizedChat, setUsePersonalizedChat] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productReviews, setProductReviews]   = useState(null);
  const [showReviewForm, setShowReviewForm]   = useState(false);
  const [reviewRating, setReviewRating]       = useState(5);
  const [reviewText, setReviewText]           = useState("");
  const [reviewPhoto, setReviewPhoto]         = useState(null);
  const [isAnonymous, setIsAnonymous]         = useState(false);
  const [displayName, setDisplayName]         = useState("");
  const [chatbotRating, setChatbotRating]     = useState(0);
  const [showChatbotRating, setShowChatbotRating] = useState(false);
  const [chatbotFeedback, setChatbotFeedback] = useState("");
  const [lastAiMessage, setLastAiMessage]     = useState("");
  const [bundles, setBundles]                 = useState(null);
  const [topRated, setTopRated]               = useState([]);
  const [productGallery, setProductGallery]   = useState([]);
  const [galleryIndex, setGalleryIndex]       = useState(0);
  const [showGalleryUpload, setShowGalleryUpload] = useState(false);
  const [galleryFile, setGalleryFile]         = useState(null);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [sales, setSales]                     = useState([]);
  const [selectedSale, setSelectedSale]       = useState(null);
  const [saleProducts, setSaleProducts]       = useState([]);
  const [saleLoading, setSaleLoading]         = useState(false);
  const [wishlist, setWishlist]               = useState([]);
  const [wishlistIds, setWishlistIds]         = useState(new Set());
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [compareList, setCompareList]         = useState([]);
  const [compareData, setCompareData]         = useState([]);
  const [compareLoading, setCompareLoading]   = useState(false);
  const [showCompareBar, setShowCompareBar]   = useState(false);
  const [couponCode, setCouponCode]           = useState("");
  const [couponData, setCouponData]           = useState(null);
  const [couponLoading, setCouponLoading]     = useState(false);
  const [couponError, setCouponError]         = useState("");
  const [showCoupons, setShowCoupons]         = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [recentlyViewed, setRecentlyViewed]   = useState([]);
  // Day 32 — Share
  const [showShareModal, setShowShareModal]   = useState(false);
  const [shareProduct, setShareProduct]       = useState(null);
  const [shareCopied, setShareCopied]         = useState(false);

  useEffect(() => {
    if (selectedRoom) {
      fetch(`${API}/api/products/${selectedRoom.id}`).then(r=>r.json()).then(d=>setProducts(d.products||[]));
      loadBundles(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    fetch(`${API}/api/brands`).then(r=>r.json()).then(d=>setBrands(d.brands||[]));
    fetch(`${API}/api/styles`).then(r=>r.json()).then(d=>setStyles(d.styles||[]));
    loadTopRated();
    loadSales();
  }, []);

  useEffect(() => {
    if (user&&screen==="orders")    loadOrders();
    if (user&&screen==="profile")   { loadProfile(); loadStyleProfile(); }
    if (user&&screen==="wishlist")  loadWishlist();
    if (screen==="recommendations") loadRecommendations();
    trackPage(screen);
  }, [screen, user]);

  useEffect(() => { if (uploadScreen) loadAllProducts(); }, [uploadScreen]);
  useEffect(() => {
    if (selectedProduct) { loadProductReviews(selectedProduct.id); loadProductGallery(selectedProduct.id); }
  }, [selectedProduct]);
  useEffect(() => { if (user) { loadWishlist(); loadRecentlyViewed(); } }, [user]);
  useEffect(() => { setShowCompareBar(compareList.length>0); }, [compareList]);

  const loadTopRated       = async () => { try { const r=await fetch(`${API}/api/top-rated`); const d=await r.json(); setTopRated(d.products||[]); } catch {} };
  const loadBundles        = async (id) => { try { const r=await fetch(`${API}/api/bundles/${id}`); const d=await r.json(); setBundles(d); } catch {} };
  const loadProductReviews = async (id) => { try { const r=await fetch(`${API}/api/reviews/${id}`); const d=await r.json(); setProductReviews(d); } catch { setProductReviews(null); } };
  const loadProductGallery = async (id) => { try { const r=await fetch(`${API}/api/gallery/${id}`); const d=await r.json(); setProductGallery(d.images||[]); setGalleryIndex(0); } catch { setProductGallery([]); } };
  const loadSales          = async () => { try { const r=await fetch(`${API}/api/sales`); const d=await r.json(); setSales(d.sales||[]); } catch {} };
  const loadRecentlyViewed = async () => { if (!user) return; try { const r=await fetch(`${API}/api/recently-viewed/${user.id}`); const d=await r.json(); setRecentlyViewed(d.recently_viewed||[]); } catch {} };

  // Day 32 — Share function
  const openShare = async (product) => {
    setShareProduct(product);
    setShowShareModal(true);
    setShareCopied(false);
    track("share_product", product.room_id, product.id, product.name);
  };

  const getShareText = (p) => {
    if (!p) return "";
    return (
      `🏠 HomeBot AI — Interior Design\n\n` +
      `${p.name}\n` +
      `Room: ${p.room_name||""}\n` +
      `Brand: ${p.brand||""}\n` +
      `💰 Price: ₹${Number(p.price).toLocaleString("en-IN")} / ${p.unit||""}\n` +
      (p.material ? `Material: ${p.material}\n` : "") +
      (p.color    ? `Color: ${p.color}\n`       : "") +
      `\n✨ Discover more at HomeBot AI!\nIndia's #1 AI Interior Design App`
    );
  };

  const shareOnWhatsApp = (p) => {
    const text = encodeURIComponent(getShareText(p));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const copyToClipboard = async (p) => {
    try {
      await navigator.clipboard.writeText(getShareText(p));
      setShareCopied(true);
      setTimeout(()=>setShareCopied(false), 2000);
    } catch {
      alert("Copied to clipboard!");
    }
  };

  const loadWishlist = async () => {
    if (!user) return; setWishlistLoading(true);
    try {
      const r=await fetch(`${API}/api/wishlist/${user.id}`); const d=await r.json();
      setWishlist(d.wishlist||[]); setWishlistIds(new Set((d.wishlist||[]).map(i=>i.id)));
    } catch { setWishlist([]); }
    setWishlistLoading(false);
  };

  const toggleWishlist = async (product) => {
    if (!user) { alert("Please login!"); return; }
    const isIn = wishlistIds.has(product.id);
    if (isIn) {
      try {
        await fetch(`${API}/api/wishlist/${user.id}/${product.id}`,{method:"DELETE"});
        setWishlistIds(prev=>{const n=new Set(prev);n.delete(product.id);return n;});
        setWishlist(prev=>prev.filter(i=>i.id!==product.id));
      } catch(err) { alert("Failed: "+err.message); }
    } else {
      try {
        const r=await fetch(`${API}/api/wishlist`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:user.id,product_id:product.id})});
        const d=await r.json();
        if (d.status==="ok"||d.status==="exists") { setWishlistIds(prev=>new Set([...prev,product.id])); setWishlist(prev=>[...prev,{...product}]); }
      } catch(err) { alert("Failed: "+err.message); }
    }
  };

  const toggleCompare = (product) => {
    const exists = compareList.find(p=>p.id===product.id);
    if (exists) { setCompareList(prev=>prev.filter(p=>p.id!==product.id)); }
    else {
      if (compareList.length>=2) { alert("Maximum 2 products to compare!"); return; }
      setCompareList(prev=>[...prev,product]);
    }
  };

  const startCompare = async () => {
    if (compareList.length<2) { alert("Select 2 products!"); return; }
    setCompareLoading(true);
    try {
      const r=await fetch(`${API}/api/compare`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({product_ids:compareList.map(p=>p.id)})});
      const d=await r.json(); setCompareData(d.products||[]); setScreen("compare");
    } catch(err) { alert("Failed: "+err.message); }
    setCompareLoading(false);
  };

  const loadSaleProducts = async (sale) => {
    setSelectedSale(sale); setSaleLoading(true);
    try { const r=await fetch(`${API}/api/sales/${sale.id}/products`); const d=await r.json(); setSaleProducts(d.products||[]); setScreen("sale_detail"); } catch {}
    setSaleLoading(false);
  };

  const loadOrders = async () => {
    if (!user) return; setOrdersLoading(true);
    try { const r=await fetch(`${API}/api/orders/${user.id}`); const d=await r.json(); setOrders(d.orders||[]); } catch { setOrders([]); }
    setOrdersLoading(false);
  };

  const loadProfile = async () => {
    if (!user) return; setProfileLoading(true);
    try {
      const r=await fetch(`${API}/api/profile/${user.id}`); const d=await r.json(); setProfile(d);
      setEditName(d.user.name); setEditPhone(d.user.phone||""); setEditCity(d.user.city||""); setEditLang(d.user.language||"english");
    } catch { setProfile(null); }
    setProfileLoading(false);
  };

  const loadStyleProfile = async () => {
    try {
      const r=await fetch(`${API}/api/personalization/${user?.id||1}`); const d=await r.json(); setStyleProfile(d);
      if (d.profile) { setStylePref(d.profile.favorite_style||"modern"); setBudgetPref(d.profile.budget_range||"medium"); setColorPref(d.profile.color_pref||""); setMaterialPref(d.profile.material_pref||""); }
    } catch {}
  };

  const saveStyleProfile = async () => {
    try {
      const r=await fetch(`${API}/api/personalization/${user?.id||1}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({favorite_style:stylePref,budget_range:budgetPref,color_pref:colorPref,material_pref:materialPref})});
      const d=await r.json();
      if (d.status==="ok") { alert("✅ Style profile saved!"); setShowStyleSetup(false); loadStyleProfile(); }
    } catch(err) { alert("Failed: "+err.message); }
  };

  const loadAllProducts = async () => { try { const r=await fetch(`${API}/api/search?q=`); const d=await r.json(); setAllProducts(d.products||[]); } catch { setAllProducts([]); } };

  const loadRecommendations = async () => {
    setRecLoading(true);
    try { const r=await fetch(`${API}/api/recommendations/user/${user?.id||1}`); const d=await r.json(); setRecommendations(d.recommendations||[]); } catch { setRecommendations([]); }
    try { const r=await fetch(`${API}/api/trending`); const d=await r.json(); setTrending(d.trending||[]); } catch { setTrending([]); }
    setRecLoading(false);
  };

  const uploadGalleryImage = async (productId) => {
    if (!galleryFile) { alert("Select an image!"); return; }
    setGalleryUploading(true);
    try {
      const fd=new FormData(); fd.append("file",galleryFile); fd.append("sort_order",productGallery.length); fd.append("image_type","gallery");
      const r=await fetch(`${API}/api/gallery/${productId}`,{method:"POST",body:fd}); const d=await r.json();
      if (d.status==="ok") { alert("✅ Added!"); setGalleryFile(null); setShowGalleryUpload(false); loadProductGallery(productId); }
      else alert("Error: "+d.error);
    } catch(err) { alert("Failed: "+err.message); }
    setGalleryUploading(false);
  };

  const submitReview = async () => {
    if (!selectedProduct) return;
    let photoUrl="";
    if (reviewPhoto) {
      try {
        const fd=new FormData(); fd.append("file",reviewPhoto); fd.append("product_id",`review_${selectedProduct.id}_${Date.now()}`);
        const r=await fetch(`${API}/api/upload-image`,{method:"POST",body:fd}); const d=await r.json();
        if (d.status==="ok") photoUrl=d.image_url;
      } catch {}
    }
    try {
      const r=await fetch(`${API}/api/reviews`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({product_id:selectedProduct.id,user_id:user?.id||1,rating:reviewRating,review_text:reviewText,review_photo:photoUrl,is_anonymous:isAnonymous,display_name:isAnonymous?"Anonymous":(displayName||user?.name||"User")})});
      const d=await r.json();
      if (d.status==="ok") { alert(d.is_verified?"✅ Verified!":"✅ Review submitted!"); setShowReviewForm(false); setReviewText(""); setReviewRating(5); setReviewPhoto(null); setIsAnonymous(false); setDisplayName(""); loadProductReviews(selectedProduct.id); }
    } catch(err) { alert("Failed: "+err.message); }
  };

  const submitChatbotRating = async () => {
    try {
      const r=await fetch(`${API}/api/chatbot/rate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:user?.id||1,rating:chatbotRating,feedback:chatbotFeedback,session_msg:lastAiMessage})});
      const d=await r.json();
      if (d.status==="ok") { alert("✅ Thank you!"); setShowChatbotRating(false); setChatbotFeedback(""); setChatbotRating(0); }
    } catch(err) { alert("Failed: "+err.message); }
  };

  const uploadImage = async () => {
    if (!uploadFile||!uploadProductId) { alert("Select product and image!"); return; }
    setUploadLoading(true);
    try {
      const fd=new FormData(); fd.append("file",uploadFile); fd.append("product_id",uploadProductId);
      const r=await fetch(`${API}/api/upload-image`,{method:"POST",body:fd}); const d=await r.json();
      if (d.status==="ok") { setUploadSuccess(d.image_url); alert("✅ Uploaded!"); } else alert("Error: "+d.error);
    } catch(err) { alert("Upload failed: "+err.message); }
    setUploadLoading(false);
  };

  const trackOrderFn = async (orderId) => {
    setTrackLoading(true);
    try { const r=await fetch(`${API}/api/track/${orderId}`); const d=await r.json(); setTrackedOrder(d.order); setScreen("track"); } catch { alert("Could not track"); }
    setTrackLoading(false);
  };

  const saveProfile = async () => {
    try {
      const r=await fetch(`${API}/api/profile/${user.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:editName,phone:editPhone,city:editCity,language:editLang})});
      const d=await r.json();
      if (d.status==="ok") { alert("✅ Updated!"); setEditProfile(false); loadProfile(); setUser({...user,name:editName}); }
    } catch(err) { alert("Failed: "+err.message); }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) { setCouponError("Enter a coupon code!"); return; }
    setCouponLoading(true); setCouponError("");
    try {
      const r=await fetch(`${API}/api/coupons/validate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:couponCode.toUpperCase(),user_id:user?.id||1,order_total:subtotal})});
      const d=await r.json();
      if (d.valid) { setCouponData(d); setCouponError(""); }
      else { setCouponData(null); setCouponError(d.message||"Invalid coupon"); }
    } catch(err) { setCouponError("Failed: "+err.message); }
    setCouponLoading(false);
  };

  const loadAvailableCoupons = async () => {
    try { const r=await fetch(`${API}/api/coupons`); const d=await r.json(); setAvailableCoupons(d.coupons||[]); } catch {}
  };

  const removeCoupon = () => { setCouponData(null); setCouponCode(""); setCouponError(""); };

  const placeOrder = async () => {
    if (cart.length===0) { alert("Cart is empty!"); return; }
    setOrderPlacing(true);
    try {
      const r=await fetch(`${API}/api/orders`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        user_id:         user?.id||1,
        items:           cart.map(i=>({id:i.id,price:Number(i.price),qty:Number(i.qty),name:i.name})),
        room:            selectedRoom?.name||"Home",
        coupon_id:       couponData?.coupon_id||null,
        coupon_discount: couponData?.discount||0
      })});
      const d=await r.json();
      if (d.status==="ok") { setOrderSuccess(d); setCart([]); setCouponData(null); setCouponCode(""); track("place_order",null,null,`Order #${d.order_id}`); }
      else alert("Order failed: "+d.error);
    } catch(err) { alert("Failed: "+err.message); }
    setOrderPlacing(false);
  };

  const handleSearch = async () => {
    setSearching(true);
    let url=`${API}/api/search?q=${searchQuery}`;
    if (filterRoom)  url+=`&room_id=${filterRoom}`;
    if (filterMin)   url+=`&min_price=${filterMin}`;
    if (filterMax)   url+=`&max_price=${filterMax}`;
    if (filterStyle) url+=`&style=${filterStyle}`;
    if (filterBrand) url+=`&brand=${filterBrand}`;
    try { const r=await fetch(url); const d=await r.json(); setSearchResults(d.products||[]); track("search",null,null,searchQuery); } catch { setSearchResults([]); }
    setSearching(false);
  };

  const clearFilters   = () => { setSearchQuery(""); setFilterRoom(""); setFilterMin(""); setFilterMax(""); setFilterStyle(""); setFilterBrand(""); setSearchResults([]); };
  const addToCart      = (p) => { const e=cart.find(i=>i.id===p.id); if(e){setCart(cart.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i));}else{setCart([...cart,{...p,qty:1}]);} track("add_to_cart",p.room_id,p.id,p.name); };
  const removeFromCart = (id) => setCart(cart.filter(i=>i.id!==id));
  const subtotal   = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const gst        = Math.round(subtotal*0.18);
  const grandTotal = subtotal+gst;
  const finalTotal = Math.max(0, grandTotal-(couponData?.discount||0));

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg=input; setInput("");
    setMessages(m=>[...m,{role:"user",text:userMsg}]); setLoading(true); track("chat_message",null,null,userMsg);
    try {
      const ep=usePersonalizedChat?`${API}/api/chat/personalized`:`${API}/api/chat`;
      const r=await fetch(ep,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:userMsg,user_id:user?.id||1,room:selectedRoom?.name||"general",budget})});
      const d=await r.json(); const aiReply=d.reply||"Sorry, could not process that."; setLastAiMessage(aiReply);
      setMessages(m=>[...m,{role:"ai",text:aiReply,lang:d.detected_lang,personalized:d.personalized}]);
      setTimeout(()=>setShowChatbotRating(true),3000);
    } catch { setMessages(m=>[...m,{role:"ai",text:"Connection error."}]); }
    setLoading(false);
  };

  const downloadPDF = async () => {
    if (cart.length===0) { alert("Add products first!"); return; } setPdfLoading(true);
    try {
      const res=await fetch(`${API}/api/generate-pdf`,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/pdf"},body:JSON.stringify({items:cart.map(i=>({name:String(i.name),price:Number(i.price),qty:Number(i.qty)})),budget:Number(budget),room:selectedRoom?.name||"Home"})});
      if (!res.ok) { alert("PDF Error"); setPdfLoading(false); return; }
      const blob=await res.blob(); const url=window.URL.createObjectURL(new Blob([blob],{type:"application/pdf"}));
      const a=document.createElement("a"); a.style.display="none"; a.href=url; a.download="HomeBot_Quotation.pdf";
      document.body.appendChild(a); a.click(); setTimeout(()=>{window.URL.revokeObjectURL(url);document.body.removeChild(a);},100);
    } catch(err) { alert("PDF failed: "+err.message); }
    setPdfLoading(false);
  };

  const sendWhatsApp = async () => {
    const phone=prompt("Enter WhatsApp number:\nExample: +919876543210"); if (!phone) return;
    try {
      const r=await fetch(`${API}/api/notify-whatsapp`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:cart.map(i=>({name:i.name,price:Number(i.price),qty:Number(i.qty)})),total:finalTotal,room:selectedRoom?.name||"Home",phone:`whatsapp:${phone}`})});
      const d=await r.json(); alert(d.status==="ok"?"✅ WhatsApp sent!":"Error: "+d.error);
    } catch(err) { alert("Failed: "+err.message); }
  };

  const handleLogin = async () => {
    setLoginError("");
    try {
      const r=await fetch(`${API}/api/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:loginEmail,password:loginPassword})});
      const d=await r.json();
      if (d.status==="ok") { setUser(d.user); setScreen("home"); track("login",null,null,d.user.name); } else setLoginError(d.message||"Login failed");
    } catch { setLoginError("Connection error."); }
  };

  const handleRegister = async () => {
    try {
      const r=await fetch(`${API}/api/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:regName,email:regEmail,password:regPassword,phone:regPhone,city:regCity,language:"english"})});
      const d=await r.json();
      if (d.status==="ok") { alert("✅ Registered! Please login."); setShowRegister(false); } else alert("Error: "+d.error);
    } catch(err) { alert("Failed: "+err.message); }
  };

  const S = {
    input:  {width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #ddd",fontSize:14,marginBottom:12,outline:"none",boxSizing:"border-box"},
    select: {width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #ddd",fontSize:14,marginBottom:12,outline:"none",background:"white",boxSizing:"border-box"}
  };

  const WishlistBtn = ({product}) => {
    const isW = wishlistIds.has(product.id);
    return <button onClick={e=>{e.stopPropagation();toggleWishlist(product);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,padding:4}}>{isW?"❤️":"🤍"}</button>;
  };

  const CompareBtn = ({product}) => {
    const isC = compareList.find(p=>p.id===product.id);
    return (
      <button onClick={e=>{e.stopPropagation();toggleCompare(product);}}
        style={{background:isC?"#E6F1FB":"#f0f0f0",border:isC?"1px solid #0C447C":"1px solid #ddd",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:11,color:isC?"#0C447C":"#555",fontWeight:isC?600:400}}>
        {isC?"✓ Compare":"⊕ Compare"}
      </button>
    );
  };

  const ShareBtn = ({product}) => (
    <button onClick={e=>{e.stopPropagation();openShare(product);}}
      style={{background:"#f0f0f0",border:"1px solid #ddd",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:11,color:"#555"}}>
      📤 Share
    </button>
  );

  const ProductCard = ({p, saleDiscount=0}) => {
    const salePrice = saleDiscount>0 ? Math.round(p.price*(1-saleDiscount/100)) : null;
    return (
      <div style={{background:"white",borderRadius:12,padding:16,marginBottom:12,display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer"}}
        onClick={()=>{track("view_product",p.room_id,p.id,p.name);setSelectedProduct(p);setScreen("product_detail");setTimeout(()=>loadRecentlyViewed(),1000);}}>
        <div style={{flexShrink:0,position:"relative"}}>
          {p.image_url?<img src={p.image_url} alt={p.name} style={{width:90,height:90,borderRadius:8,objectFit:"cover"}} onError={e=>{e.target.onerror=null;e.target.src="https://placehold.co/90x90/FFF3DC/BA7517?text=🏠";}}/>:<div style={{width:90,height:90,borderRadius:8,background:"#FFF3DC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>🏠</div>}
          {saleDiscount>0&&<div style={{position:"absolute",top:-4,left:-4,background:"#FF4444",color:"white",borderRadius:6,padding:"2px 5px",fontSize:10,fontWeight:700}}>{saleDiscount}% OFF</div>}
        </div>
        <div style={{flex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{fontWeight:600,fontSize:14,flex:1}}>{p.name}</div>
            <WishlistBtn product={p}/>
          </div>
          <div style={{fontSize:12,color:"#888",marginTop:2}}>{p.description}</div>
          <div style={{marginTop:6}}>
            {salePrice?(
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:"#FF4444",fontWeight:700,fontSize:16}}>₹{salePrice.toLocaleString("en-IN")}</span>
                <span style={{color:"#888",fontSize:12,textDecoration:"line-through"}}>₹{Number(p.price).toLocaleString("en-IN")}</span>
                <span style={{background:"#FF4444",color:"white",borderRadius:4,padding:"1px 5px",fontSize:10}}>SALE</span>
              </div>
            ):(
              <span style={{color:"#BA7517",fontWeight:700,fontSize:15}}>₹{Number(p.price).toLocaleString("en-IN")}<span style={{fontSize:11,color:"#888",fontWeight:400}}> / {p.unit}</span></span>
            )}
          </div>
          {Number(p.avg_rating)>0&&<div style={{display:"flex",alignItems:"center",gap:4,marginTop:4}}><StarRating rating={Math.round(Number(p.avg_rating))} size={14}/><span style={{fontSize:11,color:"#888"}}>({p.review_count||0})</span></div>}
          {(p.material||p.color)&&<div style={{fontSize:11,marginTop:4,display:"flex",gap:4,flexWrap:"wrap"}}>{p.material&&<span style={{background:"#EEEDFE",color:"#26215C",borderRadius:4,padding:"2px 6px"}}>🧱 {p.material}</span>}{p.color&&<span style={{background:"#E1F5EE",color:"#085041",borderRadius:4,padding:"2px 6px"}}>🎨 {p.color}</span>}</div>}
          <div style={{fontSize:11,color:"#666",marginTop:4}}>Brand: <strong>{p.brand}</strong>{p.room_name&&<span style={{color:"#BA7517"}}> | {p.room_name}</span>}</div>
          <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
            <button onClick={e=>{e.stopPropagation();addToCart(salePrice?{...p,price:salePrice}:p);}} style={{background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:600}}>+ Add to Cart</button>
            <CompareBtn product={p}/>
            <ShareBtn product={p}/>
          </div>
        </div>
      </div>
    );
  };

  // Share Modal Component
  const ShareModal = () => {
    if (!showShareModal||!shareProduct) return null;
    const p = shareProduct;
    return (
      <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
        <div style={{background:"white",borderRadius:"20px 20px 0 0",padding:24,width:"100%",maxWidth:480,paddingBottom:40}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontWeight:600,fontSize:16}}>📤 Share Product</div>
            <button onClick={()=>setShowShareModal(false)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>✕</button>
          </div>

          {/* Product Preview */}
          <div style={{display:"flex",gap:12,background:"#f8f9fa",borderRadius:10,padding:12,marginBottom:20}}>
            {p.image_url?<img src={p.image_url} alt={p.name} style={{width:60,height:60,borderRadius:8,objectFit:"cover"}} onError={e=>{e.target.onerror=null;e.target.src="https://placehold.co/60x60/FFF3DC/BA7517?text=🏠";}}/>:<div style={{width:60,height:60,borderRadius:8,background:"#FFF3DC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🏠</div>}
            <div>
              <div style={{fontWeight:600,fontSize:13}}>{p.name}</div>
              <div style={{fontSize:12,color:"#888",marginTop:2}}>{p.room_name}</div>
              <div style={{color:"#BA7517",fontWeight:700,fontSize:14,marginTop:2}}>₹{Number(p.price).toLocaleString("en-IN")}</div>
            </div>
          </div>

          {/* Share Options */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
            <button onClick={()=>shareOnWhatsApp(p)}
              style={{background:"#25D366",color:"white",border:"none",borderRadius:12,padding:"14px 0",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{fontSize:24}}>💬</span>
              WhatsApp
            </button>
            <button onClick={()=>{
                const text = encodeURIComponent(getShareText(p));
                window.open(`https://t.me/share/url?text=${text}`, "_blank");
              }}
              style={{background:"#0088cc",color:"white",border:"none",borderRadius:12,padding:"14px 0",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{fontSize:24}}>✈️</span>
              Telegram
            </button>
            <button onClick={()=>copyToClipboard(p)}
              style={{background:shareCopied?"#085041":"#f0f0f0",color:shareCopied?"white":"#333",border:"none",borderRadius:12,padding:"14px 0",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{fontSize:24}}>{shareCopied?"✅":"📋"}</span>
              {shareCopied?"Copied!":"Copy"}
            </button>
          </div>

          {/* Share Text Preview */}
          <div style={{background:"#f8f9fa",borderRadius:8,padding:12,fontSize:12,color:"#555",lineHeight:1.6,whiteSpace:"pre-line",maxHeight:120,overflowY:"auto"}}>
            {getShareText(p)}
          </div>
        </div>
      </div>
    );
  };

  if (screen==="login") return (
    <div style={{fontFamily:"sans-serif",maxWidth:400,margin:"0 auto",padding:"40px 20px",background:"#f8f9fa",minHeight:"100vh"}}>
      <div style={{textAlign:"center",marginBottom:32}}><div style={{fontSize:56}}>🏠</div><div style={{fontSize:24,fontWeight:700,color:"#BA7517"}}>HomeBot AI</div><div style={{fontSize:13,color:"#888",marginTop:4}}>Interior Design Assistant</div></div>
      {!showRegister?(
        <div style={{background:"white",borderRadius:16,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
          <div style={{fontSize:18,fontWeight:600,marginBottom:20}}>Login</div>
          <input placeholder="Email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} style={S.input}/>
          <input type="password" placeholder="Password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={S.input}/>
          {loginError&&<div style={{color:"red",fontSize:13,marginBottom:10}}>{loginError}</div>}
          <button onClick={handleLogin} style={{width:"100%",padding:12,background:"#BA7517",color:"white",border:"none",borderRadius:8,fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:12}}>Login →</button>
          <div style={{textAlign:"center",fontSize:13,color:"#888",marginBottom:12}}>Test: rahul@gmail.com / homebot123</div>
          <div style={{textAlign:"center"}}><span style={{fontSize:13,color:"#888"}}>New user? </span><span onClick={()=>setShowRegister(true)} style={{fontSize:13,color:"#BA7517",cursor:"pointer",fontWeight:500}}>Register</span></div>
        </div>
      ):(
        <div style={{background:"white",borderRadius:16,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
          <div style={{fontSize:18,fontWeight:600,marginBottom:20}}>Create Account</div>
          <input placeholder="Full name"  value={regName}     onChange={e=>setRegName(e.target.value)}     style={S.input}/>
          <input placeholder="Email"      value={regEmail}    onChange={e=>setRegEmail(e.target.value)}    style={S.input}/>
          <input type="password" placeholder="Password" value={regPassword} onChange={e=>setRegPassword(e.target.value)} style={S.input}/>
          <input placeholder="Phone"      value={regPhone}    onChange={e=>setRegPhone(e.target.value)}    style={S.input}/>
          <input placeholder="City"       value={regCity}     onChange={e=>setRegCity(e.target.value)}     style={S.input}/>
          <button onClick={handleRegister} style={{width:"100%",padding:12,background:"#BA7517",color:"white",border:"none",borderRadius:8,fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:12}}>Register →</button>
          <div style={{textAlign:"center"}}><span onClick={()=>setShowRegister(false)} style={{fontSize:13,color:"#BA7517",cursor:"pointer"}}>← Back to Login</span></div>
        </div>
      )}
    </div>
  );

  if (screen==="track"&&trackedOrder) return (
    <div style={{fontFamily:"sans-serif",maxWidth:480,margin:"0 auto",background:"#f8f9fa",minHeight:"100vh"}}>
      <div style={{background:"#BA7517",padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>setScreen("orders")} style={{background:"none",border:"none",color:"white",fontSize:20,cursor:"pointer"}}>←</button>
        <div style={{color:"white",fontWeight:600,fontSize:16}}>Track Order #{trackedOrder.id}</div>
      </div>
      <div style={{padding:16}}>
        <div style={{background:"white",borderRadius:12,padding:16,marginBottom:12,textAlign:"center"}}>
          <div style={{fontSize:13,color:"#888"}}>Current Status</div>
          <div style={{display:"inline-block",marginTop:8,background:STATUS_COLORS[trackedOrder.status]?.bg||"#f0f0f0",color:STATUS_COLORS[trackedOrder.status]?.color||"#333",borderRadius:20,padding:"6px 20px",fontSize:15,fontWeight:600}}>{trackedOrder.status?.toUpperCase()}</div>
        </div>
        <div style={{background:"white",borderRadius:12,padding:16,marginBottom:12}}>
          <div style={{fontWeight:600,marginBottom:16}}>Order Timeline</div>
          {trackedOrder.timeline?.map((step,i)=>(
            <div key={i} style={{display:"flex",gap:12,marginBottom:16,alignItems:"flex-start"}}>
              <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,background:step.done?"#E1F5EE":"#f0f0f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{step.icon}</div>
              <div style={{flex:1}}><div style={{fontWeight:500,fontSize:14,color:step.done?"#085041":"#888"}}>{step.step}{step.done&&<span style={{marginLeft:6,color:"#1D9E75"}}>✓</span>}</div><div style={{fontSize:12,color:"#888",marginTop:2}}>{step.desc}</div></div>
            </div>
          ))}
        </div>
        <div style={{background:"white",borderRadius:12,padding:16,marginBottom:12}}>
          <div style={{fontWeight:600,marginBottom:12}}>Items Ordered</div>
          {trackedOrder.items?.map((item,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"0.5px solid #f0f0f0",fontSize:13}}>
              <div><div style={{fontWeight:500}}>{item.product_name}</div><div style={{color:"#888",fontSize:12}}>Qty: {item.quantity}</div></div>
              <div style={{fontWeight:600,color:"#BA7517"}}>₹{(item.price*item.quantity).toLocaleString("en-IN")}</div>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:12,fontWeight:700,fontSize:15}}><span>Grand Total</span><span style={{color:"#BA7517"}}>₹{Number(trackedOrder.grand_total).toLocaleString("en-IN")}</span></div>
        </div>
        <div style={{background:"white",borderRadius:12,padding:16}}>
          <div style={{fontWeight:600,marginBottom:10}}>Delivery Details</div>
          <div style={{fontSize:13,color:"#555"}}>👤 {trackedOrder.customer_name}</div>
          <div style={{fontSize:13,color:"#555",marginTop:4}}>📧 {trackedOrder.email}</div>
          <div style={{fontSize:13,color:"#555",marginTop:4}}>📍 {trackedOrder.city}</div>
        </div>
      </div>
    </div>
  );

  if (screen==="sale_detail"&&selectedSale) return (
    <div style={{fontFamily:"sans-serif",maxWidth:480,margin:"0 auto",background:"#f8f9fa",minHeight:"100vh"}}>
      <div style={{background:selectedSale.banner_color||"#BA7517",padding:"16px 20px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:"white",fontSize:20,cursor:"pointer"}}>←</button>
          <div style={{background:"white",borderRadius:20,padding:"4px 12px",fontSize:13,color:"#BA7517",fontWeight:500,cursor:"pointer"}} onClick={()=>setScreen("cart")}>🛒 {cart.length}</div>
        </div>
        <div style={{color:"white",fontWeight:700,fontSize:20}}>{selectedSale.emoji==="Diwali"?"🪔":selectedSale.emoji==="Summer"?"☀️":selectedSale.emoji==="Puja"?"🙏":"🎉"} {selectedSale.name}</div>
        <div style={{color:"rgba(255,255,255,0.85)",fontSize:13,marginTop:4}}>{selectedSale.description}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}>
          <div style={{background:"rgba(255,255,255,0.2)",borderRadius:8,padding:"4px 12px",color:"white",fontSize:13,fontWeight:600}}>Up to {selectedSale.discount_pct}% OFF</div>
          <CountdownTimer endDate={selectedSale.end_date}/>
        </div>
      </div>
      <div style={{padding:16,paddingBottom:80}}>
        <ShareModal/>
        {saleLoading?<LoadingSpinner/>:saleProducts.map(p=><ProductCard key={p.id} p={p} saleDiscount={p.discount_pct||selectedSale.discount_pct}/>)}
      </div>
    </div>
  );

  if (screen==="compare") return (
    <div style={{fontFamily:"sans-serif",maxWidth:480,margin:"0 auto",background:"#f8f9fa",minHeight:"100vh"}}>
      <div style={{background:"#0C447C",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setScreen("products")} style={{background:"none",border:"none",color:"white",fontSize:20,cursor:"pointer"}}>←</button>
          <div style={{color:"white",fontWeight:600,fontSize:16}}>🆚 Compare Products</div>
        </div>
        <button onClick={()=>{setCompareList([]);setScreen("products");}} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:8,padding:"4px 10px",fontSize:12,cursor:"pointer"}}>Clear</button>
      </div>
      {compareLoading?<LoadingSpinner/>:compareData.length>=2&&(
        <div style={{padding:16,paddingBottom:80}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            {compareData.map((p)=>(
              <div key={p.id} style={{background:"white",borderRadius:12,padding:12,textAlign:"center"}}>
                {p.image_url?<img src={p.image_url} alt={p.name} style={{width:"100%",height:120,objectFit:"cover",borderRadius:8}} onError={e=>{e.target.onerror=null;e.target.src="https://placehold.co/200x120/FFF3DC/BA7517?text=🏠";}}/>:<div style={{width:"100%",height:120,background:"#FFF3DC",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40}}>🏠</div>}
                <div style={{fontWeight:600,fontSize:13,marginTop:8,lineHeight:1.3}}>{p.name}</div>
                <div style={{color:"#BA7517",fontWeight:700,fontSize:15,marginTop:4}}>₹{Number(p.price).toLocaleString("en-IN")}</div>
                <div style={{display:"flex",gap:6,marginTop:8,justifyContent:"center"}}>
                  <button onClick={()=>addToCart(p)} style={{background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>+ Cart</button>
                  <button onClick={()=>openShare(p)} style={{background:"#25D366",color:"white",border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12}}>📤</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:"white",borderRadius:12,overflow:"hidden"}}>
            <div style={{background:"#0C447C",padding:"10px 16px",color:"white",fontWeight:600,fontSize:14}}>📊 Side by Side Comparison</div>
            {[
              {label:"💰 Price",    key:"price",       fmt:(v)=>`₹${Number(v).toLocaleString("en-IN")}`},
              {label:"🏷️ Brand",   key:"brand",       fmt:(v)=>v||"—"},
              {label:"🧱 Material", key:"material",    fmt:(v)=>v||"—"},
              {label:"🎨 Color",    key:"color",       fmt:(v)=>v||"—"},
              {label:"📐 Length",   key:"length_cm",   fmt:(v)=>v?`${v} cm`:"—"},
              {label:"📐 Width",    key:"width_cm",    fmt:(v)=>v?`${v} cm`:"—"},
              {label:"🏠 Room",     key:"room_name",   fmt:(v)=>v||"—"},
              {label:"🎨 Style",    key:"style_tag",   fmt:(v)=>v||"—"},
              {label:"📦 Stock",    key:"stock_qty",   fmt:(v)=>v?`${v} units`:"—"},
              {label:"⭐ Rating",   key:"avg_rating",  fmt:(v)=>Number(v)>0?`${Number(v).toFixed(1)} ★`:"No ratings"},
              {label:"💬 Reviews",  key:"review_count",fmt:(v)=>`${v||0} reviews`},
            ].map((row,i)=>{
              const v0=compareData[0]?.[row.key]; const v1=compareData[1]?.[row.key];
              const b0=row.key==="price"?Number(v0)<Number(v1):row.key==="avg_rating"||row.key==="review_count"?Number(v0)>Number(v1):false;
              const b1=row.key==="price"?Number(v1)<Number(v0):row.key==="avg_rating"||row.key==="review_count"?Number(v1)>Number(v0):false;
              return (
                <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:"0.5px solid #f0f0f0"}}>
                  <div style={{padding:"10px 12px",background:"#f8f9fa",fontSize:12,fontWeight:600,color:"#555",display:"flex",alignItems:"center"}}>{row.label}</div>
                  <div style={{padding:"10px 12px",fontSize:13,textAlign:"center",background:b0?"#E1F5EE":"white",color:b0?"#085041":"#333",fontWeight:b0?600:400,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>{row.fmt(v0)}{b0&&<span style={{fontSize:10}}>✓</span>}</div>
                  <div style={{padding:"10px 12px",fontSize:13,textAlign:"center",background:b1?"#E1F5EE":"white",color:b1?"#085041":"#333",fontWeight:b1?600:400,display:"flex",alignItems:"center",justifyContent:"center",gap:4,borderLeft:"0.5px solid #f0f0f0"}}>{row.fmt(v1)}{b1&&<span style={{fontSize:10}}>✓</span>}</div>
                </div>
              );
            })}
          </div>
          {(()=>{
            const p0=compareData[0]; const p1=compareData[1];
            const s0=(Number(p0?.avg_rating)||0)*20+(Number(p0?.review_count)||0)*2-(Number(p0?.price)||0)/10000;
            const s1=(Number(p1?.avg_rating)||0)*20+(Number(p1?.review_count)||0)*2-(Number(p1?.price)||0)/10000;
            const winner=s0>=s1?p0:p1;
            return (
              <div style={{background:"#FFF3DC",borderRadius:12,padding:16,marginTop:16,textAlign:"center"}}>
                <div style={{fontSize:24,marginBottom:8}}>🏆</div>
                <div style={{fontWeight:700,fontSize:15,color:"#BA7517"}}>Our Recommendation</div>
                <div style={{fontSize:14,color:"#555",marginTop:6}}><strong>{winner.name}</strong> is the better choice!</div>
                <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12}}>
                  <button onClick={()=>addToCart(winner)} style={{background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"10px 20px",cursor:"pointer",fontSize:13,fontWeight:600}}>+ Add to Cart</button>
                  <button onClick={()=>openShare(winner)} style={{background:"#25D366",color:"white",border:"none",borderRadius:8,padding:"10px 16px",cursor:"pointer",fontSize:13}}>📤 Share</button>
                </div>
              </div>
            );
          })()}
          <ShareModal/>
        </div>
      )}
    </div>
  );

  if (screen==="product_detail"&&selectedProduct) {
    const avg=productReviews?.summary?.avg_rating||0;
    const total=productReviews?.summary?.total_reviews||0;
    return (
      <div style={{fontFamily:"sans-serif",maxWidth:480,margin:"0 auto",background:"#f8f9fa",minHeight:"100vh"}}>
        <div style={{background:"#BA7517",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setScreen("products")} style={{background:"none",border:"none",color:"white",fontSize:20,cursor:"pointer"}}>←</button>
            <div style={{color:"white",fontWeight:600,fontSize:16}}>Product Details</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>openShare(selectedProduct)} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:20,padding:"4px 10px",fontSize:12,cursor:"pointer"}}>📤 Share</button>
            <WishlistBtn product={selectedProduct}/>
            <div style={{background:"white",borderRadius:20,padding:"4px 12px",fontSize:13,color:"#BA7517",fontWeight:500,cursor:"pointer"}} onClick={()=>setScreen("cart")}>🛒 {cart.length}</div>
          </div>
        </div>
        <div style={{padding:16,paddingBottom:80}}>
          <div style={{background:"white",borderRadius:12,overflow:"hidden",marginBottom:12}}>
            <div style={{position:"relative",width:"100%",height:280,background:"#f8f9fa"}}>
              {productGallery.length>0?(<img src={productGallery[galleryIndex]?.image_url} alt={selectedProduct.name} style={{width:"100%",height:280,objectFit:"cover"}} onError={e=>{e.target.onerror=null;e.target.src="https://placehold.co/480x280/FFF3DC/BA7517?text=🏠";}}/>):selectedProduct.image_url?(<img src={selectedProduct.image_url} alt={selectedProduct.name} style={{width:"100%",height:280,objectFit:"cover"}} onError={e=>{e.target.onerror=null;e.target.src="https://placehold.co/480x280/FFF3DC/BA7517?text=🏠";}}/>):(<div style={{width:"100%",height:280,background:"#FFF3DC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:80}}>🏠</div>)}
              {productGallery.length>1&&galleryIndex>0&&(<button onClick={()=>setGalleryIndex(i=>i-1)} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",background:"rgba(0,0,0,0.5)",color:"white",border:"none",borderRadius:"50%",width:36,height:36,fontSize:20,cursor:"pointer"}}>‹</button>)}
              {productGallery.length>1&&galleryIndex<productGallery.length-1&&(<button onClick={()=>setGalleryIndex(i=>i+1)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"rgba(0,0,0,0.5)",color:"white",border:"none",borderRadius:"50%",width:36,height:36,fontSize:20,cursor:"pointer"}}>›</button>)}
              {productGallery.length>1&&<div style={{position:"absolute",bottom:10,right:10,background:"rgba(0,0,0,0.6)",color:"white",borderRadius:12,padding:"3px 10px",fontSize:12}}>{galleryIndex+1} / {productGallery.length}</div>}
            </div>
            {productGallery.length>1?(<div style={{display:"flex",gap:8,padding:12,overflowX:"auto"}}>{productGallery.map((img,i)=>(<img key={i} src={img.image_url} alt={`view ${i+1}`} onClick={()=>setGalleryIndex(i)} style={{width:60,height:60,borderRadius:6,objectFit:"cover",cursor:"pointer",flexShrink:0,border:i===galleryIndex?"2px solid #BA7517":"2px solid transparent",opacity:i===galleryIndex?1:0.7}} onError={e=>{e.target.onerror=null;e.target.src="https://placehold.co/60x60/FFF3DC/BA7517?text=🏠";}}/>))}<div onClick={()=>setShowGalleryUpload(true)} style={{width:60,height:60,borderRadius:6,border:"2px dashed #BA7517",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,color:"#BA7517",fontSize:24}}>+</div></div>):(<div style={{padding:"8px 12px",textAlign:"center"}}><button onClick={()=>setShowGalleryUpload(true)} style={{background:"#FFF3DC",color:"#BA7517",border:"1px dashed #BA7517",borderRadius:8,padding:"6px 16px",cursor:"pointer",fontSize:12}}>📷 Add More Photos</button></div>)}
          </div>
          <div style={{background:"white",borderRadius:12,padding:16,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{fontWeight:700,fontSize:18,flex:1}}>{selectedProduct.name}</div>
              <WishlistBtn product={selectedProduct}/>
            </div>
            <div style={{fontSize:13,color:"#888",marginTop:4}}>{selectedProduct.description}</div>
            <div style={{color:"#BA7517",fontWeight:700,fontSize:24,marginTop:8}}>₹{Number(selectedProduct.price).toLocaleString("en-IN")}<span style={{fontSize:13,color:"#888",fontWeight:400}}> / {selectedProduct.unit}</span></div>
            {total>0&&<div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}><StarRating rating={Math.round(avg)} size={18}/><span style={{fontSize:14,fontWeight:600}}>{Number(avg).toFixed(1)}</span><span style={{fontSize:13,color:"#888"}}>({total} reviews)</span></div>}
            <div style={{marginTop:12}}>
              {[{label:"Brand",value:selectedProduct.brand},{label:"Material",value:selectedProduct.material},{label:"Color",value:selectedProduct.color},{label:"Stock",value:selectedProduct.stock_qty?`${selectedProduct.stock_qty} units`:null},selectedProduct.length_cm&&{label:"Size",value:`${selectedProduct.length_cm}×${selectedProduct.width_cm}×${selectedProduct.height_cm} cm`}].filter(s=>s&&s.value).map((spec,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"0.5px solid #f0f0f0",fontSize:13}}><span style={{color:"#888"}}>{spec.label}</span><span style={{fontWeight:500}}>{spec.value}</span></div>
              ))}
            </div>
            <div style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap"}}>
              <button onClick={()=>addToCart(selectedProduct)} style={{flex:1,background:"#BA7517",color:"white",border:"none",borderRadius:10,padding:14,fontSize:15,fontWeight:600,cursor:"pointer"}}>+ Add to Cart</button>
              <button onClick={()=>toggleWishlist(selectedProduct)} style={{background:wishlistIds.has(selectedProduct.id)?"#FCEBEB":"#f0f0f0",color:wishlistIds.has(selectedProduct.id)?"#c00":"#555",border:"none",borderRadius:10,padding:"14px 18px",fontSize:20,cursor:"pointer"}}>{wishlistIds.has(selectedProduct.id)?"❤️":"🤍"}</button>
              <button onClick={()=>toggleCompare(selectedProduct)} style={{background:compareList.find(p=>p.id===selectedProduct.id)?"#E6F1FB":"#f0f0f0",color:compareList.find(p=>p.id===selectedProduct.id)?"#0C447C":"#555",border:"none",borderRadius:10,padding:"14px 14px",fontSize:13,cursor:"pointer",fontWeight:600}}>🆚</button>
              <button onClick={()=>openShare(selectedProduct)} style={{background:"#25D366",color:"white",border:"none",borderRadius:10,padding:"14px 14px",fontSize:13,cursor:"pointer",fontWeight:600}}>📤</button>
            </div>
          </div>
          {bundles?.bundle_products?.length>0&&(
            <div style={{background:"white",borderRadius:12,padding:16,marginBottom:12}}>
              <div style={{fontWeight:600,fontSize:15,marginBottom:12}}>🛍️ Complete the Look</div>
              <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
                {bundles.bundle_products.filter(p=>p.id!==selectedProduct.id).slice(0,5).map(p=>(
                  <div key={p.id} style={{flexShrink:0,width:120,background:"#f8f9fa",borderRadius:10,padding:10,cursor:"pointer"}} onClick={()=>setSelectedProduct(p)}>
                    {p.image_url?<img src={p.image_url} alt={p.name} style={{width:"100%",height:80,objectFit:"cover",borderRadius:6}} onError={e=>{e.target.onerror=null;e.target.src="https://placehold.co/120x80/FFF3DC/BA7517?text=🏠";}}/>:<div style={{width:"100%",height:80,background:"#FFF3DC",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🏠</div>}
                    <div style={{fontSize:11,fontWeight:500,marginTop:6,lineHeight:1.3}}>{p.name}</div>
                    <div style={{color:"#BA7517",fontWeight:600,fontSize:12,marginTop:2}}>₹{Number(p.price).toLocaleString("en-IN")}</div>
                    <button onClick={e=>{e.stopPropagation();addToCart(p);}} style={{width:"100%",marginTop:4,background:"#BA7517",color:"white",border:"none",borderRadius:6,padding:"3px 0",cursor:"pointer",fontSize:10}}>+ Add</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{background:"white",borderRadius:12,padding:16,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontWeight:600,fontSize:15}}>⭐ Customer Reviews</div>
              <button onClick={()=>setShowReviewForm(true)} style={{background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12}}>Write Review</button>
            </div>
            {total>0&&(
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                  <div style={{fontSize:40,fontWeight:700,color:"#BA7517"}}>{Number(avg).toFixed(1)}</div>
                  <div><StarRating rating={Math.round(avg)} size={20}/><div style={{fontSize:12,color:"#888",marginTop:4}}>{total} reviews</div></div>
                </div>
                {[5,4,3,2,1].map(star=>{const key=["one","two","three","four","five"][star-1]+"_star";const count=productReviews?.summary?.[key]||0;return(
                  <div key={star} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontSize:12,width:30}}>{star}★</span>
                    <div style={{flex:1,height:6,background:"#f0f0f0",borderRadius:3}}><div style={{height:"100%",borderRadius:3,background:"#FFB800",width:`${total>0?(count/total)*100:0}%`}}/></div>
                    <span style={{fontSize:12,color:"#888",width:20}}>{count}</span>
                  </div>
                );})}
              </div>
            )}
            {productReviews?.reviews?.length===0&&<div style={{textAlign:"center",padding:20,color:"#888",fontSize:13}}>No reviews yet — be the first!</div>}
            {productReviews?.reviews?.map((review,i)=>(
              <div key={i} style={{padding:"12px 0",borderBottom:"0.5px solid #f0f0f0"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:"#FFF3DC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{review.is_anonymous?"🔒":"👤"}</div>
                    <div>
                      <div style={{fontWeight:500,fontSize:13}}>{review.is_anonymous?"Anonymous":(review.display_name||review.user_name)}</div>
                      {review.is_verified&&<div style={{fontSize:10,color:"#085041",background:"#E1F5EE",borderRadius:4,padding:"1px 6px",display:"inline-block"}}>✓ Verified Purchase</div>}
                    </div>
                  </div>
                  <StarRating rating={review.rating} size={14}/>
                </div>
                <div style={{fontSize:13,color:"#555",marginTop:8,lineHeight:1.5}}>{review.review_text}</div>
                {review.review_photo&&<img src={review.review_photo} alt="review" style={{width:80,height:80,borderRadius:6,objectFit:"cover",marginTop:8}} onError={e=>e.target.style.display="none"}/>}
                <div style={{fontSize:11,color:"#888",marginTop:6}}>{new Date(review.created_at).toLocaleDateString("en-IN")}</div>
              </div>
            ))}
          </div>
        </div>
        <ShareModal/>
        {showGalleryUpload&&(
          <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{background:"white",borderRadius:16,padding:24,width:"90%",maxWidth:400}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div style={{fontWeight:600,fontSize:16}}>📷 Add Product Photo</div>
                <button onClick={()=>{setShowGalleryUpload(false);setGalleryFile(null);}} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>✕</button>
              </div>
              <input type="file" accept="image/*" onChange={e=>setGalleryFile(e.target.files[0])} style={{width:"100%",marginBottom:16,fontSize:13}}/>
              {galleryFile&&<div style={{marginBottom:16,textAlign:"center"}}><img src={URL.createObjectURL(galleryFile)} alt="preview" style={{width:150,height:150,objectFit:"cover",borderRadius:8,border:"1px solid #eee"}}/></div>}
              <button onClick={()=>uploadGalleryImage(selectedProduct.id)} disabled={galleryUploading||!galleryFile} style={{width:"100%",padding:12,background:galleryUploading?"#ccc":"#BA7517",color:"white",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:galleryUploading?"not-allowed":"pointer"}}>{galleryUploading?"⏳ Uploading...":"📤 Add to Gallery"}</button>
            </div>
          </div>
        )}
        {showReviewForm&&(
          <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{background:"white",borderRadius:16,padding:24,width:"90%",maxWidth:420,maxHeight:"90vh",overflowY:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div style={{fontWeight:600,fontSize:16}}>⭐ Write a Review</div>
                <button onClick={()=>setShowReviewForm(false)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>✕</button>
              </div>
              <div style={{fontSize:13,color:"#888",marginBottom:8}}>Your Rating *</div>
              <StarRating rating={reviewRating} onRate={setReviewRating} size={36}/>
              <div style={{fontSize:13,color:"#888",marginTop:16,marginBottom:4}}>Display Name</div>
              <input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder={user?.name||"Your name"} style={S.input}/>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <input type="checkbox" checked={isAnonymous} onChange={e=>setIsAnonymous(e.target.checked)} style={{width:16,height:16,accentColor:"#BA7517"}}/>
                <span style={{fontSize:13}}>🔒 Post anonymously</span>
              </div>
              <div style={{fontSize:13,color:"#888",marginBottom:4}}>Your Review</div>
              <textarea value={reviewText} onChange={e=>setReviewText(e.target.value)} placeholder="Share your experience..." style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #ddd",fontSize:13,minHeight:100,outline:"none",resize:"none",boxSizing:"border-box",marginBottom:12}}/>
              <div style={{fontSize:13,color:"#888",marginBottom:4}}>📷 Add Photo (optional)</div>
              <input type="file" accept="image/*" onChange={e=>setReviewPhoto(e.target.files[0])} style={{width:"100%",marginBottom:12,fontSize:13}}/>
              {reviewPhoto&&<div style={{marginBottom:12,textAlign:"center"}}><img src={URL.createObjectURL(reviewPhoto)} alt="preview" style={{width:100,height:100,objectFit:"cover",borderRadius:8}}/></div>}
              <button onClick={submitReview} style={{width:"100%",padding:12,background:"#BA7517",color:"white",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer"}}>Submit Review ⭐</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{fontFamily:"sans-serif",maxWidth:480,margin:"0 auto",background:"#f8f9fa",minHeight:"100vh"}}>
      <ShareModal/>
      <div style={{background:"#BA7517",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{color:"white",fontWeight:600,fontSize:18}}>🏠 HomeBot AI</div><div style={{color:"#FFE0A0",fontSize:12}}>{user?`Welcome, ${user.name}!`:"Interior Design Assistant"}</div></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{background:"white",borderRadius:20,padding:"4px 12px",fontSize:13,color:"#BA7517",fontWeight:500,cursor:"pointer",position:"relative"}} onClick={()=>setScreen("wishlist")}>
            ❤️{wishlistIds.size>0&&<span style={{position:"absolute",top:-4,right:-4,background:"#FF4444",color:"white",borderRadius:"50%",width:16,height:16,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{wishlistIds.size}</span>}
          </div>
          <div style={{background:"white",borderRadius:20,padding:"4px 12px",fontSize:13,color:"#BA7517",fontWeight:500,cursor:"pointer"}} onClick={()=>setScreen("cart")}>🛒 {cart.length}</div>
          <div style={{background:"rgba(255,255,255,0.2)",borderRadius:20,padding:"4px 10px",fontSize:12,color:"white",cursor:"pointer"}} onClick={()=>{setUser(null);setScreen("login");setCart([]);track("logout");}}>Logout</div>
        </div>
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:480,background:"white",display:"flex",borderTop:"1px solid #eee",zIndex:100}}>
        {[{id:"home",icon:"🏠",label:"Rooms"},{id:"search",icon:"🔍",label:"Search"},{id:"chat",icon:"💬",label:"AI Chat"},{id:"recommendations",icon:"✨",label:"For You"},{id:"profile",icon:"👤",label:"Profile"}].map(tab=>(
          <button key={tab.id} onClick={()=>{setScreen(tab.id);trackPage(tab.id);}} style={{flex:1,padding:"10px 0",border:"none",background:"none",cursor:"pointer",fontSize:11,color:screen===tab.id?"#BA7517":"#888",fontWeight:screen===tab.id?600:400}}>
            <div style={{fontSize:20}}>{tab.icon}</div>{tab.label}
          </button>
        ))}
      </div>

      {showCompareBar&&(
        <div style={{position:"fixed",bottom:70,left:"50%",transform:"translateX(-50%)",width:"90%",maxWidth:440,background:"#0C447C",borderRadius:16,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:150,boxShadow:"0 4px 20px rgba(0,0,0,0.2)"}}>
          <div>
            <div style={{color:"white",fontWeight:600,fontSize:13}}>🆚 Compare ({compareList.length}/2)</div>
            <div style={{color:"rgba(255,255,255,0.8)",fontSize:11,marginTop:2}}>{compareList.map(p=>p.name.substring(0,15)).join(" vs ")}</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            {compareList.length===2&&<button onClick={startCompare} disabled={compareLoading} style={{background:"white",color:"#0C447C",border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:700}}>{compareLoading?"...":"Compare →"}</button>}
            <button onClick={()=>setCompareList([])} style={{background:"rgba(255,255,255,0.2)",color:"white",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:12}}>✕</button>
          </div>
        </div>
      )}

      {uploadScreen&&(
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"white",borderRadius:16,padding:24,width:"90%",maxWidth:400,maxHeight:"80vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontWeight:600,fontSize:16}}>📸 Upload Product Image</div>
              <button onClick={()=>{setUploadScreen(false);setUploadSuccess("");setUploadFile(null);setUploadProductId("");}} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#888"}}>✕</button>
            </div>
            <select value={uploadProductId} onChange={e=>setUploadProductId(e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #ddd",fontSize:13,marginBottom:16,outline:"none",background:"white"}}>
              <option value="">-- Select a product --</option>
              {allProducts.map(p=><option key={p.id} value={p.id}>{p.name} ({p.room_name})</option>)}
            </select>
            <input type="file" accept="image/*" onChange={e=>setUploadFile(e.target.files[0])} style={{width:"100%",marginBottom:16,fontSize:13}}/>
            {uploadFile&&<div style={{marginBottom:16,textAlign:"center"}}><img src={URL.createObjectURL(uploadFile)} alt="preview" style={{width:120,height:120,objectFit:"cover",borderRadius:8}}/></div>}
            {uploadSuccess&&<div style={{background:"#E1F5EE",borderRadius:8,padding:10,marginBottom:12,textAlign:"center"}}><div style={{fontSize:12,color:"#085041",marginTop:4}}>✅ Uploaded!</div></div>}
            <button onClick={uploadImage} disabled={uploadLoading} style={{width:"100%",padding:12,background:uploadLoading?"#ccc":"#BA7517",color:"white",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:uploadLoading?"not-allowed":"pointer"}}>{uploadLoading?"⏳ Uploading...":"📤 Upload Image"}</button>
          </div>
        </div>
      )}

      {showStyleSetup&&(
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"white",borderRadius:16,padding:24,width:"90%",maxWidth:400,maxHeight:"80vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontWeight:600,fontSize:16}}>🎨 My Style Profile</div>
              <button onClick={()=>setShowStyleSetup(false)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{fontSize:12,color:"#888",marginBottom:4}}>Preferred Style</div>
            <select value={stylePref} onChange={e=>setStylePref(e.target.value)} style={S.select}>{["modern","classic","traditional","luxury","minimalist"].map(s=><option key={s} value={s}>{s}</option>)}</select>
            <div style={{fontSize:12,color:"#888",marginBottom:4}}>Budget Range</div>
            <select value={budgetPref} onChange={e=>setBudgetPref(e.target.value)} style={S.select}>
              <option value="low">Low — Under ₹50,000</option><option value="medium">Medium — ₹50,000 to ₹2,00,000</option>
              <option value="high">High — ₹2,00,000 to ₹5,00,000</option><option value="luxury">Luxury — Above ₹5,00,000</option>
            </select>
            <div style={{fontSize:12,color:"#888",marginBottom:4}}>Favorite Color</div>
            <input value={colorPref} onChange={e=>setColorPref(e.target.value)} placeholder="e.g. White, Beige, Grey" style={S.input}/>
            <div style={{fontSize:12,color:"#888",marginBottom:4}}>Favorite Material</div>
            <input value={materialPref} onChange={e=>setMaterialPref(e.target.value)} placeholder="e.g. Marble, Wood, Steel" style={S.input}/>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
              <input type="checkbox" checked={usePersonalizedChat} onChange={e=>setUsePersonalizedChat(e.target.checked)} style={{width:16,height:16,accentColor:"#BA7517"}}/>
              <span style={{fontSize:13}}>Use personalized AI chat</span>
            </div>
            <button onClick={saveStyleProfile} style={{width:"100%",padding:12,background:"#BA7517",color:"white",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer"}}>💾 Save Style Profile</button>
          </div>
        </div>
      )}

      {showChatbotRating&&(
        <div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",width:"90%",maxWidth:400,background:"white",borderRadius:16,padding:20,boxShadow:"0 4px 20px rgba(0,0,0,0.15)",zIndex:150}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontWeight:600,fontSize:14}}>💬 Rate this response</div>
            <button onClick={()=>setShowChatbotRating(false)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#888"}}>✕</button>
          </div>
          <StarRating rating={chatbotRating} onRate={setChatbotRating} size={28}/>
          {chatbotRating>0&&(
            <div style={{marginTop:10}}>
              <input value={chatbotFeedback} onChange={e=>setChatbotFeedback(e.target.value)} placeholder="Optional feedback..." style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
              <button onClick={submitChatbotRating} style={{width:"100%",padding:10,background:"#BA7517",color:"white",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer"}}>Submit Feedback</button>
            </div>
          )}
        </div>
      )}

      <div style={{padding:"16px",paddingBottom:80}}>

        {screen==="home"&&(
          <div>
            <div style={{fontSize:16,fontWeight:600,marginBottom:4}}>Select a room to renovate</div>
            <div style={{fontSize:13,color:"#888",marginBottom:16}}>Tap a room to see products</div>
            {sales.length>0&&(
              <div style={{marginBottom:16}}>
                <div style={{fontWeight:600,fontSize:14,marginBottom:10,color:"#BA7517"}}>🎉 Festival Sales Live Now!</div>
                <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
                  {sales.map(sale=>(
                    <div key={sale.id} onClick={()=>loadSaleProducts(sale)} style={{flexShrink:0,width:220,borderRadius:14,padding:16,cursor:"pointer",background:sale.banner_color||"#BA7517"}}>
                      <div style={{fontSize:24,marginBottom:6}}>{sale.emoji==="Diwali"?"🪔":sale.emoji==="Summer"?"☀️":sale.emoji==="Puja"?"🙏":"🎉"}</div>
                      <div style={{color:"white",fontWeight:700,fontSize:14,marginBottom:4}}>{sale.name}</div>
                      <div style={{color:"rgba(255,255,255,0.85)",fontSize:11,marginBottom:8}}>{sale.description?.substring(0,50)}...</div>
                      <div style={{background:"rgba(255,255,255,0.25)",borderRadius:8,padding:"4px 10px",display:"inline-block",color:"white",fontSize:12,fontWeight:700,marginBottom:8}}>Up to {sale.discount_pct}% OFF</div>
                      <div><CountdownTimer endDate={sale.end_date}/></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {ROOMS.map(room=>(
                <div key={room.id} onClick={()=>{setRoom(room);setScreen("products");track("view_room",room.id,null,room.name);}}
                  style={{background:selectedRoom?.id===room.id?"#FFF3DC":"white",border:selectedRoom?.id===room.id?"2px solid #BA7517":"1px solid #eee",borderRadius:12,padding:16,cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:32}}>{room.icon}</div>
                  <div style={{fontSize:14,fontWeight:500,marginTop:6}}>{room.name}</div>
                </div>
              ))}
            </div>
            {recentlyViewed.length>0&&(
              <div style={{marginTop:16}}>
                <div style={{fontWeight:600,fontSize:14,marginBottom:12,color:"#555"}}>👁️ Recently Viewed</div>
                <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
                  {recentlyViewed.map(p=>(
                    <div key={p.id} style={{flexShrink:0,width:130,background:"white",borderRadius:10,padding:10,cursor:"pointer",border:"1px solid #eee"}}
                      onClick={()=>{track("view_product",p.room_id,p.id,p.name);setSelectedProduct(p);setScreen("product_detail");}}>
                      {p.image_url?<img src={p.image_url} alt={p.name} style={{width:"100%",height:80,objectFit:"cover",borderRadius:6}} onError={e=>{e.target.onerror=null;e.target.src="https://placehold.co/130x80/FFF3DC/BA7517?text=🏠";}}/>:<div style={{width:"100%",height:80,background:"#FFF3DC",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🏠</div>}
                      <div style={{fontSize:11,fontWeight:600,marginTop:6,lineHeight:1.3}}>{p.name}</div>
                      <div style={{fontSize:10,color:"#888",marginTop:2}}>{p.room_name}</div>
                      <div style={{color:"#BA7517",fontWeight:700,fontSize:12,marginTop:2}}>₹{Number(p.price).toLocaleString("en-IN")}</div>
                      <div style={{display:"flex",gap:4,marginTop:4}}>
                        <button onClick={e=>{e.stopPropagation();addToCart(p);}} style={{flex:1,background:"#BA7517",color:"white",border:"none",borderRadius:6,padding:"3px 0",cursor:"pointer",fontSize:10}}>+ Cart</button>
                        <button onClick={e=>{e.stopPropagation();openShare(p);}} style={{background:"#25D366",color:"white",border:"none",borderRadius:6,padding:"3px 6px",cursor:"pointer",fontSize:10}}>📤</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {topRated.length>0&&(
              <div style={{marginTop:16}}>
                <div style={{fontWeight:600,fontSize:14,marginBottom:12,color:"#BA7517"}}>⭐ Top Rated Products</div>
                <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
                  {topRated.slice(0,6).map(p=>(
                    <div key={p.id} style={{flexShrink:0,width:140,background:"white",borderRadius:10,padding:12,cursor:"pointer"}} onClick={()=>{setSelectedProduct(p);setScreen("product_detail");}}>
                      {p.image_url?<img src={p.image_url} alt={p.name} style={{width:"100%",height:90,objectFit:"cover",borderRadius:6}} onError={e=>{e.target.onerror=null;e.target.src="https://placehold.co/140x90/FFF3DC/BA7517?text=🏠";}}/>:<div style={{width:"100%",height:90,background:"#FFF3DC",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>🏠</div>}
                      <div style={{fontSize:12,fontWeight:500,marginTop:6}}>{p.name}</div>
                      <StarRating rating={Math.round(Number(p.avg_rating))} size={12}/>
                      <div style={{color:"#BA7517",fontWeight:600,fontSize:12}}>₹{Number(p.price).toLocaleString("en-IN")}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{background:"white",borderRadius:12,padding:16,marginTop:16}}>
              <div style={{fontWeight:600,marginBottom:8}}>💰 Your Budget</div>
              <input type="range" min={10000} max={500000} step={5000} value={budget} onChange={e=>setBudget(Number(e.target.value))} style={{width:"100%",accentColor:"#BA7517"}}/>
              <div style={{textAlign:"center",fontWeight:600,color:"#BA7517",fontSize:18}}>₹{budget.toLocaleString("en-IN")}</div>
            </div>
            {cart.length>0&&(
              <div style={{background:"#FFF3DC",borderRadius:12,padding:14,marginTop:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontWeight:600,fontSize:14}}>🛒 {cart.length} items in cart</div><div style={{fontSize:13,color:"#BA7517"}}>₹{finalTotal.toLocaleString("en-IN")} total</div></div>
                <button onClick={()=>setScreen("cart")} style={{background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,fontWeight:600}}>View Cart →</button>
              </div>
            )}
          </div>
        )}

        {screen==="wishlist"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div style={{fontSize:16,fontWeight:600}}>❤️ My Wishlist ({wishlist.length})</div>
              <button onClick={()=>setScreen("home")} style={{fontSize:12,color:"#BA7517",background:"none",border:"none",cursor:"pointer"}}>← Back</button>
            </div>
            {wishlistLoading?<LoadingSpinner/>:wishlist.length===0?(
              <div style={{textAlign:"center",padding:40,color:"#888"}}>
                <div style={{fontSize:48}}>🤍</div>
                <div style={{marginTop:12,fontWeight:500,fontSize:15}}>Your wishlist is empty!</div>
                <button onClick={()=>setScreen("home")} style={{marginTop:16,background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"10px 24px",cursor:"pointer",fontSize:13,fontWeight:600}}>Browse Rooms →</button>
              </div>
            ):(
              <>
                {wishlist.map(p=>(
                  <div key={p.id} style={{background:"white",borderRadius:12,padding:16,marginBottom:12,display:"flex",alignItems:"flex-start",gap:12}}>
                    <div style={{flexShrink:0,cursor:"pointer"}} onClick={()=>{setSelectedProduct(p);setScreen("product_detail");}}>
                      {p.image_url?<img src={p.image_url} alt={p.name} style={{width:80,height:80,borderRadius:8,objectFit:"cover"}} onError={e=>{e.target.onerror=null;e.target.src="https://placehold.co/80x80/FFF3DC/BA7517?text=🏠";}}/>:<div style={{width:80,height:80,borderRadius:8,background:"#FFF3DC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>🏠</div>}
                    </div>
                    <div style={{flex:1,cursor:"pointer"}} onClick={()=>{setSelectedProduct(p);setScreen("product_detail");}}>
                      <div style={{fontWeight:600,fontSize:14}}>{p.name}</div>
                      <div style={{fontSize:12,color:"#888",marginTop:2}}>{p.room_name}</div>
                      <div style={{color:"#BA7517",fontWeight:700,fontSize:15,marginTop:4}}>₹{Number(p.price).toLocaleString("en-IN")}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                      <button onClick={()=>toggleWishlist(p)} style={{background:"none",border:"none",cursor:"pointer",fontSize:22}}>❤️</button>
                      <button onClick={()=>addToCart(p)} style={{background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:600}}>+ Cart</button>
                      <button onClick={()=>openShare(p)} style={{background:"#25D366",color:"white",border:"none",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:11}}>📤</button>
                    </div>
                  </div>
                ))}
                <div style={{background:"#FFF3DC",borderRadius:12,padding:14,textAlign:"center"}}>
                  <button onClick={()=>{wishlist.forEach(p=>addToCart(p));alert(`✅ ${wishlist.length} items added!`);setScreen("cart");}} style={{background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"8px 20px",cursor:"pointer",fontSize:13,fontWeight:600}}>🛒 Add All to Cart</button>
                </div>
              </>
            )}
          </div>
        )}

        {screen==="products"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{fontSize:16,fontWeight:600}}>{selectedRoom?`${selectedRoom.icon} ${selectedRoom.name}`:"Select a room first"}</div>
              <button onClick={()=>setScreen("home")} style={{fontSize:12,color:"#BA7517",background:"none",border:"none",cursor:"pointer"}}>← Back</button>
            </div>
            {products.length===0?<LoadingSpinner/>:products.map(p=><ProductCard key={p.id} p={p}/>)}
            {products.length>0&&<div style={{textAlign:"center",padding:16,color:"#888",fontSize:12}}>Showing {products.length} products in {selectedRoom?.name}</div>}
          </div>
        )}

        {screen==="search"&&(
          <div>
            <div style={{fontSize:16,fontWeight:600,marginBottom:16}}>🔍 Search Products</div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()} placeholder="Search tiles, sink, wardrobe..." style={{flex:1,padding:"10px 14px",borderRadius:8,border:"1px solid #ddd",fontSize:14,outline:"none"}}/>
              <button onClick={handleSearch} style={{background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"10px 16px",cursor:"pointer",fontSize:16}}>🔍</button>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <button onClick={()=>setShowFilters(!showFilters)} style={{fontSize:13,color:"#BA7517",background:"#FFF3DC",border:"1px solid #BA7517",borderRadius:20,padding:"4px 14px",cursor:"pointer"}}>{showFilters?"Hide Filters ▲":"Show Filters ▼"}</button>
              {(filterRoom||filterMin||filterMax||filterStyle||filterBrand)&&<button onClick={clearFilters} style={{fontSize:12,color:"#c00",background:"none",border:"none",cursor:"pointer"}}>Clear all ✕</button>}
            </div>
            {showFilters&&(
              <div style={{background:"white",borderRadius:12,padding:16,marginBottom:12}}>
                <div style={{fontSize:12,color:"#888",marginBottom:4}}>Room</div>
                <select value={filterRoom} onChange={e=>setFilterRoom(e.target.value)} style={S.select}><option value="">All Rooms</option>{ROOMS.map(r=><option key={r.id} value={r.id}>{r.icon} {r.name}</option>)}</select>
                <div style={{fontSize:12,color:"#888",marginBottom:4}}>Style</div>
                <select value={filterStyle} onChange={e=>setFilterStyle(e.target.value)} style={S.select}><option value="">All Styles</option>{styles.map(s=><option key={s} value={s}>{s}</option>)}</select>
                <div style={{fontSize:12,color:"#888",marginBottom:4}}>Brand</div>
                <select value={filterBrand} onChange={e=>setFilterBrand(e.target.value)} style={S.select}><option value="">All Brands</option>{brands.map(b=><option key={b} value={b}>{b}</option>)}</select>
                <div style={{fontSize:12,color:"#888",marginBottom:4}}>Price Range (₹)</div>
                <div style={{display:"flex",gap:8}}>
                  <input type="number" placeholder="Min" value={filterMin} onChange={e=>setFilterMin(e.target.value)} style={{...S.input,marginBottom:0}}/>
                  <input type="number" placeholder="Max" value={filterMax} onChange={e=>setFilterMax(e.target.value)} style={{...S.input,marginBottom:0}}/>
                </div>
                <button onClick={handleSearch} style={{width:"100%",marginTop:12,padding:10,background:"#BA7517",color:"white",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer"}}>Apply Filters</button>
              </div>
            )}
            {searching?<LoadingSpinner/>:searchResults.length>0?(<div><div style={{fontSize:13,color:"#888",marginBottom:12}}>Found <strong>{searchResults.length}</strong> products</div>{searchResults.map(p=><ProductCard key={p.id} p={p}/>)}</div>):!searchQuery?(<div style={{textAlign:"center",padding:40,color:"#888"}}><div style={{fontSize:32}}>🔍</div><div style={{marginTop:8}}>Search across all rooms</div></div>):(<div style={{textAlign:"center",padding:40,color:"#888"}}><div style={{fontSize:32}}>🔍</div><div style={{marginTop:8}}>No results for "{searchQuery}"</div></div>)}
          </div>
        )}

        {screen==="chat"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:16,fontWeight:600}}>💬 AI Chat</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                {usePersonalizedChat&&<div style={{background:"#FFF3DC",color:"#BA7517",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>✨ Personalized</div>}
                <button onClick={()=>setShowStyleSetup(true)} style={{background:"#f0f0f0",border:"none",borderRadius:20,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>🎨 Style</button>
              </div>
            </div>
            <div style={{background:"white",borderRadius:12,padding:12,minHeight:350,maxHeight:400,overflowY:"auto",marginBottom:12}}>
              {messages.map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:10}}>
                  <div style={{maxWidth:"80%",padding:"10px 14px",borderRadius:12,fontSize:14,lineHeight:1.5,background:m.role==="user"?"#BA7517":"#f0f0f0",color:m.role==="user"?"white":"#333"}}>
                    {m.text}
                    {m.lang&&<div style={{fontSize:10,marginTop:4,opacity:0.7}}>Detected: {m.lang}</div>}
                    {m.personalized&&<div style={{fontSize:10,marginTop:2,color:"#BA7517"}}>✨ Personalized</div>}
                  </div>
                </div>
              ))}
              {loading&&<div style={{display:"flex",justifyContent:"flex-start",marginBottom:10}}><div style={{background:"#f0f0f0",padding:"10px 14px",borderRadius:12,fontSize:14}}>⏳ Thinking...</div></div>}
            </div>
            <div style={{display:"flex",gap:8}}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Type in Hindi, Tamil, English..." style={{flex:1,padding:"10px 14px",borderRadius:8,border:"1px solid #ddd",fontSize:14,outline:"none"}}/>
              <button onClick={sendMessage} style={{background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"10px 16px",cursor:"pointer",fontSize:16}}>➤</button>
            </div>
            <div style={{fontSize:11,color:"#888",marginTop:8,textAlign:"center"}}>Try: "मुझे बाथरूम के लिए टाइल चाहिए"</div>
          </div>
        )}

        {screen==="recommendations"&&(
          <div>
            <div style={{fontSize:16,fontWeight:600,marginBottom:4}}>✨ Recommended For You</div>
            <div style={{fontSize:13,color:"#888",marginBottom:16}}>Based on your browsing history</div>
            {recLoading?<LoadingSpinner/>:(
              <>
                {recentlyViewed.length>0&&(
                  <div style={{marginBottom:20}}>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:12,color:"#555"}}>👁️ Recently Viewed</div>
                    <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
                      {recentlyViewed.map(p=>(
                        <div key={p.id} style={{flexShrink:0,width:130,background:"white",borderRadius:10,padding:10,cursor:"pointer",border:"1px solid #eee"}}
                          onClick={()=>{setSelectedProduct(p);setScreen("product_detail");}}>
                          {p.image_url?<img src={p.image_url} alt={p.name} style={{width:"100%",height:80,objectFit:"cover",borderRadius:6}} onError={e=>{e.target.onerror=null;e.target.src="https://placehold.co/130x80/FFF3DC/BA7517?text=🏠";}}/>:<div style={{width:"100%",height:80,background:"#FFF3DC",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🏠</div>}
                          <div style={{fontSize:11,fontWeight:600,marginTop:6,lineHeight:1.3}}>{p.name}</div>
                          <div style={{color:"#BA7517",fontWeight:700,fontSize:12,marginTop:2}}>₹{Number(p.price).toLocaleString("en-IN")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {trending.length>0&&(
                  <div style={{marginBottom:20}}>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:12,color:"#BA7517"}}>🔥 Trending This Week</div>
                    <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
                      {trending.map(p=>(
                        <div key={p.id} style={{flexShrink:0,width:150,background:"white",borderRadius:10,padding:12,cursor:"pointer"}} onClick={()=>{setSelectedProduct(p);setScreen("product_detail");}}>
                          {p.image_url?<img src={p.image_url} alt={p.name} style={{width:"100%",height:100,objectFit:"cover",borderRadius:6}} onError={e=>{e.target.onerror=null;e.target.src="https://placehold.co/150x100/FFF3DC/BA7517?text=🏠";}}/>:<div style={{width:"100%",height:100,background:"#FFF3DC",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>🏠</div>}
                          <div style={{fontWeight:500,fontSize:12,marginTop:6}}>{p.name}</div>
                          <div style={{color:"#BA7517",fontWeight:600,fontSize:13,marginTop:2}}>₹{Number(p.price).toLocaleString("en-IN")}</div>
                          <button onClick={e=>{e.stopPropagation();addToCart(p);}} style={{width:"100%",marginTop:6,background:"#BA7517",color:"white",border:"none",borderRadius:6,padding:"4px 0",cursor:"pointer",fontSize:11}}>+ Add</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {recommendations.length>0&&<div><div style={{fontWeight:600,fontSize:14,marginBottom:12,color:"#0C447C"}}>💡 Based on Your Interests</div>{recommendations.map((p,i)=><ProductCard key={`${p.id}-${i}`} p={p}/>)}</div>}
                {recommendations.length===0&&trending.length===0&&recentlyViewed.length===0&&<div style={{textAlign:"center",padding:40,color:"#888"}}><div style={{fontSize:40}}>✨</div><div style={{marginTop:8,fontWeight:500}}>Browse products to see recommendations!</div><button onClick={()=>setScreen("home")} style={{marginTop:16,background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"10px 24px",cursor:"pointer",fontSize:13,fontWeight:600}}>Browse Rooms →</button></div>}
              </>
            )}
          </div>
        )}

        {screen==="orders"&&(
          <div>
            <div style={{fontSize:16,fontWeight:600,marginBottom:16}}>📦 My Orders</div>
            {ordersLoading?<LoadingSpinner/>:orders.length===0?(<div style={{textAlign:"center",padding:40,color:"#888"}}><div style={{fontSize:40}}>📦</div><div style={{marginTop:8}}>No orders yet</div></div>):orders.map(order=>{
              const ss=STATUS_COLORS[order.status]||STATUS_COLORS.pending;
              return(
                <div key={order.id} style={{background:"white",borderRadius:12,padding:16,marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div><div style={{fontWeight:600,fontSize:14}}>Order #{order.id}</div><div style={{fontSize:12,color:"#888",marginTop:2}}>{new Date(order.created_at).toLocaleDateString("en-IN")}</div></div>
                    <div style={{background:ss.bg,color:ss.color,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600}}>{order.status}</div>
                  </div>
                  {order.items?.map((item,i)=><div key={i} style={{fontSize:13,color:"#555",padding:"4px 0",borderBottom:"0.5px solid #f0f0f0"}}>• {item.product_name} × {item.quantity}</div>)}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12,paddingTop:10,borderTop:"1px solid #eee"}}>
                    <span style={{fontWeight:700,color:"#BA7517"}}>₹{Number(order.grand_total).toLocaleString("en-IN")}</span>
                    <button onClick={()=>trackOrderFn(order.id)} disabled={trackLoading} style={{background:"#E6F1FB",color:"#0C447C",border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:600}}>🚚 Track Order</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {screen==="profile"&&(
          <div>
            <div style={{fontSize:16,fontWeight:600,marginBottom:16}}>👤 My Profile</div>
            {profileLoading?<LoadingSpinner/>:profile&&!editProfile?(
              <div>
                <div style={{background:"white",borderRadius:12,padding:20,marginBottom:12,textAlign:"center"}}>
                  <div style={{width:64,height:64,borderRadius:"50%",background:"#FFF3DC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto"}}>👤</div>
                  <div style={{fontWeight:600,fontSize:18,marginTop:10}}>{profile.user.name}</div>
                  <div style={{fontSize:13,color:"#888",marginTop:4}}>{profile.user.email}</div>
                  <div style={{fontSize:13,color:"#888",marginTop:2}}>📍 {profile.user.city||"City not set"}</div>
                  <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12,flexWrap:"wrap"}}>
                    <button onClick={()=>setEditProfile(true)} style={{background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13}}>✏️ Edit</button>
                    <button onClick={()=>setUploadScreen(true)} style={{background:"#E6F1FB",color:"#0C447C",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13}}>📸 Images</button>
                    <button onClick={()=>setShowStyleSetup(true)} style={{background:"#FFF3DC",color:"#BA7517",border:"1px solid #BA7517",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13}}>🎨 Style</button>
                    <button onClick={()=>setScreen("wishlist")} style={{background:"#FCEBEB",color:"#c00",border:"1px solid #fcc",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13}}>❤️ Wishlist ({wishlistIds.size})</button>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                  {[{label:"Total Orders",value:profile.stats.total_orders,icon:"📦"},{label:"Delivered",value:profile.stats.delivered,icon:"✅"},{label:"Pending",value:profile.stats.pending,icon:"⏳"},{label:"Total Spent",value:`₹${Number(profile.stats.total_spent).toLocaleString("en-IN")}`,icon:"💰"}].map((stat,i)=>(
                    <div key={i} style={{background:"white",borderRadius:12,padding:14,textAlign:"center"}}><div style={{fontSize:24}}>{stat.icon}</div><div style={{fontWeight:700,fontSize:18,color:"#BA7517",marginTop:4}}>{stat.value}</div><div style={{fontSize:12,color:"#888",marginTop:2}}>{stat.label}</div></div>
                  ))}
                </div>
                <div style={{background:"white",borderRadius:12,padding:16}}>
                  <div style={{fontWeight:600,marginBottom:12}}>Account Details</div>
                  {[{label:"Phone",value:profile.user.phone||"Not set"},{label:"City",value:profile.user.city||"Not set"},{label:"Language",value:profile.user.language||"English"}].map((item,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"0.5px solid #f0f0f0",fontSize:14}}><span style={{color:"#888"}}>{item.label}</span><span style={{fontWeight:500}}>{item.value}</span></div>
                  ))}
                </div>
              </div>
            ):profile&&editProfile?(
              <div style={{background:"white",borderRadius:12,padding:20}}>
                <div style={{fontWeight:600,marginBottom:16}}>✏️ Edit Profile</div>
                <div style={{fontSize:12,color:"#888",marginBottom:4}}>Full Name</div><input value={editName} onChange={e=>setEditName(e.target.value)} style={S.input}/>
                <div style={{fontSize:12,color:"#888",marginBottom:4}}>Phone</div><input value={editPhone} onChange={e=>setEditPhone(e.target.value)} style={S.input}/>
                <div style={{fontSize:12,color:"#888",marginBottom:4}}>City</div><input value={editCity} onChange={e=>setEditCity(e.target.value)} style={S.input}/>
                <div style={{fontSize:12,color:"#888",marginBottom:4}}>Preferred Language</div>
                <select value={editLang} onChange={e=>setEditLang(e.target.value)} style={S.select}>{LANGUAGES.map(l=><option key={l} value={l}>{l}</option>)}</select>
                <button onClick={saveProfile} style={{width:"100%",padding:12,background:"#BA7517",color:"white",border:"none",borderRadius:8,fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:10}}>Save Changes</button>
                <button onClick={()=>setEditProfile(false)} style={{width:"100%",padding:10,background:"none",color:"#888",border:"1px solid #ddd",borderRadius:8,fontSize:14,cursor:"pointer"}}>Cancel</button>
              </div>
            ):null}
          </div>
        )}

        {screen==="cart"&&(
          <div>
            <div style={{fontSize:16,fontWeight:600,marginBottom:16}}>🛒 Your Cart</div>
            {orderSuccess&&(
              <div style={{background:"#E1F5EE",border:"1px solid #1D9E75",borderRadius:12,padding:16,marginBottom:16,textAlign:"center"}}>
                <div style={{fontSize:32}}>🎉</div>
                <div style={{fontWeight:600,color:"#085041",marginTop:8}}>Order Placed!</div>
                <div style={{fontSize:13,color:"#085041",marginTop:4}}>Order ID: #{orderSuccess.order_id}</div>
                <div style={{fontSize:14,fontWeight:600,color:"#085041",marginTop:4}}>Total: ₹{Number(orderSuccess.grand_total).toLocaleString("en-IN")}</div>
                {orderSuccess.discount>0&&<div style={{fontSize:13,color:"#085041",marginTop:2}}>You saved ₹{parseInt(orderSuccess.discount).toLocaleString("en-IN")} 🎟️</div>}
                <button onClick={()=>{setOrderSuccess(null);setScreen("orders");}} style={{marginTop:12,background:"#1D9E75",color:"white",border:"none",borderRadius:8,padding:"8px 20px",cursor:"pointer",fontSize:13}}>View Orders →</button>
              </div>
            )}
            {cart.length===0&&!orderSuccess&&<div style={{textAlign:"center",padding:40,color:"#888"}}><div style={{fontSize:40}}>🛒</div><div style={{marginTop:8}}>Cart is empty!</div></div>}
            {cart.map(item=>(
              <div key={item.id} style={{background:"white",borderRadius:12,padding:14,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{flex:1}}><div style={{fontWeight:500,fontSize:14}}>{item.name}</div><div style={{color:"#BA7517",fontSize:13,marginTop:2}}>₹{Number(item.price).toLocaleString("en-IN")} × {item.qty}</div></div>
                <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{fontWeight:600}}>₹{(item.price*item.qty).toLocaleString("en-IN")}</div><button onClick={()=>removeFromCart(item.id)} style={{background:"#fee",border:"1px solid #fcc",borderRadius:6,padding:"4px 8px",cursor:"pointer",color:"#c00",fontSize:12}}>✕</button></div>
              </div>
            ))}
            {cart.length>0&&(
              <div style={{background:"white",borderRadius:12,padding:16,marginTop:8}}>
                <div style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{fontWeight:600,fontSize:14}}>🎟️ Apply Coupon</div>
                    <button onClick={()=>{setShowCoupons(!showCoupons);loadAvailableCoupons();}} style={{fontSize:12,color:"#BA7517",background:"none",border:"none",cursor:"pointer"}}>{showCoupons?"Hide ▲":"View All ▼"}</button>
                  </div>
                  {showCoupons&&(
                    <div style={{background:"#f8f9fa",borderRadius:8,padding:12,marginBottom:12,maxHeight:200,overflowY:"auto"}}>
                      {availableCoupons.map(c=>(
                        <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"0.5px solid #eee"}}>
                          <div>
                            <div style={{background:"#FFF3DC",color:"#BA7517",borderRadius:6,padding:"2px 8px",fontWeight:700,fontSize:12,display:"inline-block"}}>{c.code}</div>
                            <div style={{fontSize:11,color:"#888",marginTop:2}}>{c.description}</div>
                            <div style={{fontSize:11,color:"#555",marginTop:1}}>Min: ₹{Number(c.min_order_value).toLocaleString("en-IN")} | {c.discount_type==="percent"?`${c.discount_value}% off`:`₹${c.discount_value} off`}</div>
                          </div>
                          <button onClick={()=>{setCouponCode(c.code);setShowCoupons(false);}} style={{background:"#BA7517",color:"white",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11,fontWeight:600}}>Apply</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {!couponData?(
                    <div style={{display:"flex",gap:8}}>
                      <input value={couponCode} onChange={e=>{setCouponCode(e.target.value.toUpperCase());setCouponError("");}} placeholder="Enter coupon code" onKeyDown={e=>e.key==="Enter"&&validateCoupon()} style={{flex:1,padding:"10px 14px",borderRadius:8,border:"1px solid #ddd",fontSize:13,outline:"none",textTransform:"uppercase"}}/>
                      <button onClick={validateCoupon} disabled={couponLoading} style={{background:couponLoading?"#ccc":"#BA7517",color:"white",border:"none",borderRadius:8,padding:"10px 16px",cursor:couponLoading?"not-allowed":"pointer",fontSize:13,fontWeight:600}}>{couponLoading?"...":"Apply"}</button>
                    </div>
                  ):(
                    <div style={{background:"#E1F5EE",borderRadius:8,padding:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{background:"#085041",color:"white",borderRadius:6,padding:"2px 8px",fontWeight:700,fontSize:12}}>{couponData.code}</span>
                          <span style={{fontSize:13,color:"#085041",fontWeight:600}}>✅ Applied!</span>
                        </div>
                        <div style={{fontSize:12,color:"#085041",marginTop:4}}>You save ₹{parseInt(couponData.discount).toLocaleString("en-IN")}</div>
                      </div>
                      <button onClick={removeCoupon} style={{background:"#FCEBEB",color:"#c00",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:12}}>Remove</button>
                    </div>
                  )}
                  {couponError&&<div style={{color:"#c00",fontSize:12,marginTop:6}}>{couponError}</div>}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:14}}><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:14,color:"#666"}}><span>GST (18%)</span><span>₹{gst.toLocaleString("en-IN")}</span></div>
                {couponData&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:14,color:"#085041",fontWeight:600}}><span>🎟️ Coupon Discount</span><span>- ₹{parseInt(couponData.discount).toLocaleString("en-IN")}</span></div>}
                <div style={{display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:16,borderTop:"1px solid #eee",paddingTop:10}}><span>Grand Total</span><span style={{color:"#BA7517"}}>₹{finalTotal.toLocaleString("en-IN")}</span></div>
                <button onClick={placeOrder} disabled={orderPlacing} style={{width:"100%",marginTop:14,background:orderPlacing?"#ccc":"#1D9E75",color:"white",border:"none",borderRadius:10,padding:14,fontSize:15,fontWeight:600,cursor:orderPlacing?"not-allowed":"pointer"}}>{orderPlacing?"⏳ Placing...":"✅ Place Order"}</button>
                <button onClick={downloadPDF} disabled={pdfLoading} style={{width:"100%",marginTop:10,background:pdfLoading?"#ccc":"#BA7517",color:"white",border:"none",borderRadius:10,padding:14,fontSize:15,fontWeight:600,cursor:pdfLoading?"not-allowed":"pointer"}}>{pdfLoading?"⏳ Generating...":"📄 Download PDF"}</button>
                <button onClick={sendWhatsApp} style={{width:"100%",marginTop:10,background:"#25D366",color:"white",border:"none",borderRadius:10,padding:14,fontSize:15,fontWeight:600,cursor:"pointer"}}>💬 WhatsApp Quote</button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}