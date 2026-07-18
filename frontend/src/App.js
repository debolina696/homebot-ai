import { useState, useEffect } from "react";

const API = "https://homebot-ai.onrender.com";

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

// ── EMI CALCULATOR COMPONENT ──
const EMICalculator = ({price, onClose}) => {
  const [amount, setAmount]   = useState(price||50000);
  const [tenure, setTenure]   = useState(12);
  const [rate, setRate]       = useState(12);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const r=await fetch(`${API}/api/emi/calculate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({amount,tenure_months:tenure,annual_rate:rate})});
      const d=await r.json(); setResult(d);
    } catch(err) { alert("Failed: "+err.message); }
    setLoading(false);
  };

  useEffect(()=>{ calculate(); },[]);

  return (
    <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:"white",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",paddingBottom:30}}>
        <div style={{padding:"20px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:17}}>💳 EMI Calculator</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:"0 20px"}}>
          <div style={{background:"#f8f9fa",borderRadius:12,padding:16,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:13,color:"#666"}}>Loan Amount</span><span style={{fontWeight:700,color:"#BA7517",fontSize:15}}>₹{Number(amount).toLocaleString("en-IN")}</span></div>
            <input type="range" min={5000} max={500000} step={1000} value={amount} onChange={e=>setAmount(Number(e.target.value))} onMouseUp={calculate} onTouchEnd={calculate} style={{width:"100%",accentColor:"#BA7517"}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#888",marginTop:4}}><span>₹5,000</span><span>₹5,00,000</span></div>
          </div>
          <div style={{background:"#f8f9fa",borderRadius:12,padding:16,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:13,color:"#666"}}>Tenure</span><span style={{fontWeight:700,color:"#BA7517",fontSize:15}}>{tenure} Months</span></div>
            <input type="range" min={3} max={36} step={3} value={tenure} onChange={e=>setTenure(Number(e.target.value))} onMouseUp={calculate} onTouchEnd={calculate} style={{width:"100%",accentColor:"#BA7517"}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#888",marginTop:4}}><span>3 Mo</span><span>36 Mo</span></div>
          </div>
          <div style={{background:"#f8f9fa",borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:13,color:"#666"}}>Interest Rate</span><span style={{fontWeight:700,color:"#BA7517",fontSize:15}}>{rate}%</span></div>
            <input type="range" min={0} max={24} step={0.5} value={rate} onChange={e=>setRate(Number(e.target.value))} onMouseUp={calculate} onTouchEnd={calculate} style={{width:"100%",accentColor:"#BA7517"}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#888",marginTop:4}}><span>0% (No Cost)</span><span>24%</span></div>
          </div>
          <button onClick={calculate} disabled={loading} style={{width:"100%",padding:12,background:"#BA7517",color:"white",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",marginBottom:16}}>{loading?"⏳ Calculating...":"🔄 Calculate EMI"}</button>
          {result&&!result.error&&(
            <>
              <div style={{background:"linear-gradient(135deg,#BA7517,#E8960A)",borderRadius:16,padding:20,marginBottom:16,textAlign:"center",color:"white"}}>
                <div style={{fontSize:13,opacity:0.85,marginBottom:4}}>Monthly EMI</div>
                <div style={{fontSize:36,fontWeight:800}}>₹{Number(result.emi).toLocaleString("en-IN",{maximumFractionDigits:0})}</div>
                <div style={{fontSize:12,opacity:0.8,marginTop:4}}>per month for {tenure} months</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:16}}>
                  <div style={{background:"rgba(255,255,255,0.15)",borderRadius:8,padding:10}}><div style={{fontSize:11,opacity:0.8}}>Principal</div><div style={{fontWeight:700,fontSize:14}}>₹{Number(result.principal).toLocaleString("en-IN",{maximumFractionDigits:0})}</div></div>
                  <div style={{background:"rgba(255,255,255,0.15)",borderRadius:8,padding:10}}><div style={{fontSize:11,opacity:0.8}}>Total Interest</div><div style={{fontWeight:700,fontSize:14}}>₹{Number(result.total_interest).toLocaleString("en-IN",{maximumFractionDigits:0})}</div></div>
                  <div style={{background:"rgba(255,255,255,0.15)",borderRadius:8,padding:10}}><div style={{fontSize:11,opacity:0.8}}>Total Payment</div><div style={{fontWeight:700,fontSize:14}}>₹{Number(result.total_payment).toLocaleString("en-IN",{maximumFractionDigits:0})}</div></div>
                  <div style={{background:"rgba(255,255,255,0.15)",borderRadius:8,padding:10}}><div style={{fontSize:11,opacity:0.8}}>Interest Rate</div><div style={{fontWeight:700,fontSize:14}}>{rate}% p.a.</div></div>
                </div>
              </div>
              <div style={{background:"white",borderRadius:12,border:"1px solid #eee",overflow:"hidden",marginBottom:16}}>
                <div style={{background:"#f8f9fa",padding:"10px 16px",fontWeight:600,fontSize:13,color:"#555"}}>📋 Compare EMI Plans</div>
                {result.plans?.map((plan,i)=>(
                  <div key={i} onClick={()=>{setTenure(plan.months);calculate();}} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"12px 16px",borderBottom:"0.5px solid #f0f0f0",cursor:"pointer",background:tenure===plan.months?"#FFF3DC":"white"}}>
                    <div style={{fontSize:13,fontWeight:tenure===plan.months?600:400,color:tenure===plan.months?"#BA7517":"#333"}}>{plan.label}</div>
                    <div style={{fontSize:13,fontWeight:700,color:"#BA7517",textAlign:"center"}}>₹{Number(plan.emi).toLocaleString("en-IN",{maximumFractionDigits:0})}/mo</div>
                    <div style={{fontSize:11,color:"#888",textAlign:"right"}}>₹{Number(plan.total_interest).toLocaleString("en-IN",{maximumFractionDigits:0})} int.</div>
                  </div>
                ))}
              </div>
              <div style={{background:"#E6F1FB",borderRadius:12,padding:14,marginBottom:8}}>
                <div style={{fontWeight:600,fontSize:13,color:"#0C447C",marginBottom:8}}>🏦 Available on EMI via</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["HDFC Bank","ICICI Bank","SBI","Axis Bank","Kotak","Yes Bank"].map(bank=>(<span key={bank} style={{background:"white",border:"1px solid #ddd",borderRadius:6,padding:"3px 8px",fontSize:11,color:"#555"}}>{bank}</span>))}</div>
                <div style={{fontSize:11,color:"#888",marginTop:8}}>*Subject to bank approval. T&C apply.</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── BUDGET PLANNER COMPONENT ──
const BudgetPlanner = ({onClose, onAddToCart}) => {
  const [step, setStep]               = useState(1);
  const [totalBudget, setTotalBudget] = useState(200000);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [style, setStyle]             = useState("modern");
  const [plan, setPlan]               = useState(null);
  const [loading, setLoading]         = useState(false);
  const [selectedRoomPlan, setSelectedRoomPlan] = useState(null);
  const [roomProducts, setRoomProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const ROOM_ICONS = {"Bathroom":"🛁","Bedroom":"🛏️","Kitchen":"🍳","Living Room":"🛋️","Dining Room":"🍽️","Study Room":"📚","Puja Room":"🙏","Exterior":"🏗️"};

  const generatePlan = async () => {
    setLoading(true);
    try {
      const r=await fetch(`${API}/api/budget/plan`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({total_budget:totalBudget,rooms:selectedRooms,style})});
      const d=await r.json();
      setPlan(d); setStep(3);
    } catch(err) { alert("Failed: "+err.message); }
    setLoading(false);
  };

  const loadRoomProducts = async (roomPlan) => {
    setSelectedRoomPlan(roomPlan); setLoadingProducts(true);
    try {
      const r=await fetch(`${API}/api/budget/products`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({room_id:roomPlan.room_id,max_budget:roomPlan.allocated})});
      const d=await r.json(); setRoomProducts(d.products||[]);
    } catch { setRoomProducts([]); }
    setLoadingProducts(false);
  };

  const toggleRoom = (name) => {
    setSelectedRooms(prev=>prev.includes(name)?prev.filter(r=>r!==name):[...prev,name]);
  };

  return (
    <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:"white",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto",paddingBottom:30}}>

        <div style={{padding:"20px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div>
            <div style={{fontWeight:700,fontSize:17}}>💰 Smart Budget Planner</div>
            <div style={{fontSize:12,color:"#888",marginTop:2}}>Step {step} of 3</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>

        <div style={{margin:"12px 20px",background:"#f0f0f0",borderRadius:4,height:4}}>
          <div style={{height:"100%",background:"#BA7517",borderRadius:4,width:`${(step/3)*100}%`,transition:"width 0.3s"}}/>
        </div>

        <div style={{padding:"0 20px"}}>

          {step===1&&(
            <div>
              <div style={{fontWeight:600,fontSize:15,marginBottom:16,color:"#BA7517"}}>Set Your Budget & Style</div>

              <div style={{background:"#f8f9fa",borderRadius:12,padding:16,marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:13,color:"#666"}}>Total Renovation Budget</span>
                  <span style={{fontWeight:700,color:"#BA7517",fontSize:16}}>₹{Number(totalBudget).toLocaleString("en-IN")}</span>
                </div>
                <input type="range" min={25000} max={2000000} step={25000} value={totalBudget} onChange={e=>setTotalBudget(Number(e.target.value))} style={{width:"100%",accentColor:"#BA7517"}}/>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#888",marginTop:4}}>
                  <span>₹25K</span><span>₹20L</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginTop:12}}>
                  {[100000,250000,500000,1000000].map(amt=>(
                    <button key={amt} onClick={()=>setTotalBudget(amt)}
                      style={{background:totalBudget===amt?"#BA7517":"#f0f0f0",color:totalBudget===amt?"white":"#555",border:"none",borderRadius:8,padding:"6px 4px",cursor:"pointer",fontSize:11,fontWeight:totalBudget===amt?600:400}}>
                      ₹{amt>=100000?`${amt/100000}L`:`${amt/1000}K`}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{marginBottom:16}}>
                <div style={{fontSize:13,color:"#666",marginBottom:8}}>Interior Style</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {[{id:"modern",emoji:"🏙️"},{id:"classic",emoji:"🏛️"},{id:"traditional",emoji:"🏯"},{id:"luxury",emoji:"💎"},{id:"minimalist",emoji:"⬜"},{id:"bohemian",emoji:"🌿"}].map(s=>(
                    <button key={s.id} onClick={()=>setStyle(s.id)}
                      style={{background:style===s.id?"#FFF3DC":"#f8f9fa",border:style===s.id?"2px solid #BA7517":"1px solid #eee",borderRadius:10,padding:"10px 6px",cursor:"pointer",textAlign:"center"}}>
                      <div style={{fontSize:20}}>{s.emoji}</div>
                      <div style={{fontSize:11,marginTop:4,fontWeight:style===s.id?600:400,color:style===s.id?"#BA7517":"#555",textTransform:"capitalize"}}>{s.id}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={()=>setStep(2)} style={{width:"100%",padding:14,background:"#BA7517",color:"white",border:"none",borderRadius:10,fontSize:15,fontWeight:600,cursor:"pointer"}}>Next: Select Rooms →</button>
            </div>
          )}

          {step===2&&(
            <div>
              <div style={{fontWeight:600,fontSize:15,marginBottom:4,color:"#BA7517"}}>Select Rooms to Renovate</div>
              <div style={{fontSize:12,color:"#888",marginBottom:16}}>Choose all rooms you want to renovate</div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                {ROOMS.map(room=>{
                  const isSelected = selectedRooms.includes(room.name);
                  return (
                    <div key={room.id} onClick={()=>toggleRoom(room.name)}
                      style={{background:isSelected?"#FFF3DC":"white",border:isSelected?"2px solid #BA7517":"1px solid #eee",borderRadius:12,padding:14,cursor:"pointer",textAlign:"center",position:"relative"}}>
                      {isSelected&&<div style={{position:"absolute",top:6,right:8,fontSize:14}}>✅</div>}
                      <div style={{fontSize:28}}>{room.icon}</div>
                      <div style={{fontSize:13,fontWeight:isSelected?600:400,color:isSelected?"#BA7517":"#333",marginTop:4}}>{room.name}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{background:"#FFF3DC",borderRadius:10,padding:12,marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,color:"#BA7517"}}>
                  {selectedRooms.length===0?"Select at least 1 room":selectedRooms.length===8?"All 8 rooms selected ✅":`${selectedRooms.length} room${selectedRooms.length>1?"s":""} selected`}
                </span>
                {selectedRooms.length>0&&<button onClick={()=>setSelectedRooms([])} style={{fontSize:11,color:"#c00",background:"none",border:"none",cursor:"pointer"}}>Clear</button>}
              </div>

              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setStep(1)} style={{flex:1,padding:14,background:"#f0f0f0",color:"#555",border:"none",borderRadius:10,fontSize:14,cursor:"pointer"}}>← Back</button>
                <button onClick={generatePlan} disabled={selectedRooms.length===0||loading}
                  style={{flex:2,padding:14,background:selectedRooms.length===0||loading?"#ccc":"#BA7517",color:"white",border:"none",borderRadius:10,fontSize:15,fontWeight:600,cursor:selectedRooms.length===0||loading?"not-allowed":"pointer"}}>
                  {loading?"⏳ Planning...":"✨ Generate Plan →"}
                </button>
              </div>
            </div>
          )}

          {step===3&&plan&&!selectedRoomPlan&&(
            <div>
              <div style={{fontWeight:600,fontSize:15,marginBottom:4,color:"#BA7517"}}>Your Budget Plan 🎯</div>
              <div style={{fontSize:12,color:"#888",marginBottom:12}}>Total: ₹{Number(plan.total_budget).toLocaleString("en-IN")} across {plan.total_rooms} rooms</div>

              {plan.ai_tip&&(
                <div style={{background:"linear-gradient(135deg,#BA7517,#E8960A)",borderRadius:12,padding:16,marginBottom:16,color:"white"}}>
                  <div style={{fontWeight:600,fontSize:13,marginBottom:6}}>✨ AI Budget Tip</div>
                  <div style={{fontSize:13,lineHeight:1.5,opacity:0.95}}>{plan.ai_tip}</div>
                </div>
              )}

              {plan.plan?.map((room,i)=>(
                <div key={i} style={{background:"white",borderRadius:12,border:"1px solid #eee",padding:14,marginBottom:10,cursor:"pointer"}}
                  onClick={()=>loadRoomProducts(room)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:20}}>{ROOM_ICONS[room.room]||"🏠"}</span>
                      <div>
                        <div style={{fontWeight:600,fontSize:14}}>{room.room}</div>
                        <div style={{fontSize:11,color:"#888"}}>{room.product_count} products available</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:700,color:"#BA7517",fontSize:15}}>₹{Number(room.allocated).toLocaleString("en-IN",{maximumFractionDigits:0})}</div>
                      <div style={{fontSize:11,color:"#888"}}>{room.percentage}% of budget</div>
                    </div>
                  </div>
                  <div style={{background:"#f0f0f0",borderRadius:4,height:6,marginBottom:6}}>
                    <div style={{height:"100%",background:room.is_feasible?"#BA7517":"#FF4444",borderRadius:4,width:`${room.percentage}%`}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:11,color:room.is_feasible?"#085041":"#c00"}}>{room.is_feasible?"✅ Budget is sufficient":"⚠️ May need more budget"}</span>
                    <span style={{fontSize:11,color:"#BA7517",fontWeight:500}}>See products →</span>
                  </div>
                </div>
              ))}

              <div style={{background:"#f8f9fa",borderRadius:12,padding:14,marginBottom:16}}>
                <div style={{fontWeight:600,fontSize:13,marginBottom:8}}>📊 Budget Summary</div>
                {plan.plan?.map((room,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:13}}>
                    <span>{ROOM_ICONS[room.room]} {room.room}</span>
                    <span style={{fontWeight:500}}>₹{Number(room.allocated).toLocaleString("en-IN",{maximumFractionDigits:0})}</span>
                  </div>
                ))}
                <div style={{borderTop:"1px solid #ddd",marginTop:8,paddingTop:8,display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:14}}>
                  <span>Total</span>
                  <span style={{color:"#BA7517"}}>₹{Number(plan.total_budget).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setStep(2);setPlan(null);}} style={{flex:1,padding:12,background:"#f0f0f0",color:"#555",border:"none",borderRadius:10,fontSize:13,cursor:"pointer"}}>← Replan</button>
                <button onClick={onClose} style={{flex:1,padding:12,background:"#BA7517",color:"white",border:"none",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer"}}>Done ✅</button>
              </div>
            </div>
          )}

          {step===3&&selectedRoomPlan&&(
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <button onClick={()=>setSelectedRoomPlan(null)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>←</button>
                <div>
                  <div style={{fontWeight:600,fontSize:15}}>{ROOM_ICONS[selectedRoomPlan.room]} {selectedRoomPlan.room}</div>
                  <div style={{fontSize:12,color:"#888"}}>Budget: ₹{Number(selectedRoomPlan.allocated).toLocaleString("en-IN",{maximumFractionDigits:0})}</div>
                </div>
              </div>

              {loadingProducts?<LoadingSpinner/>:roomProducts.length===0?(
                <div style={{textAlign:"center",padding:30,color:"#888"}}>
                  <div style={{fontSize:32}}>🔍</div>
                  <div style={{marginTop:8}}>No products found in this budget range</div>
                </div>
              ):(
                <>
                  <div style={{fontSize:12,color:"#888",marginBottom:12}}>Products within ₹{Number(selectedRoomPlan.allocated/3).toLocaleString("en-IN",{maximumFractionDigits:0})} each</div>
                  {roomProducts.map(p=>(
                    <div key={p.id} style={{background:"white",borderRadius:12,border:"1px solid #eee",padding:12,marginBottom:10,display:"flex",gap:10,alignItems:"flex-start"}}>
                      {p.image_url?<img src={p.image_url} alt={p.name} style={{width:70,height:70,borderRadius:8,objectFit:"cover",flexShrink:0}} onError={e=>{e.target.onerror=null;e.target.src="https://placehold.co/70x70/FFF3DC/BA7517?text=🏠";}}/>:<div style={{width:70,height:70,borderRadius:8,background:"#FFF3DC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>🏠</div>}
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:13}}>{p.name}</div>
                        <div style={{fontSize:11,color:"#888",marginTop:2}}>{p.brand}</div>
                        <div style={{color:"#BA7517",fontWeight:700,fontSize:14,marginTop:4}}>₹{Number(p.price).toLocaleString("en-IN")}<span style={{fontSize:10,color:"#888",fontWeight:400}}> / {p.unit}</span></div>
                        {Number(p.avg_rating)>0&&<div style={{display:"flex",alignItems:"center",gap:3,marginTop:3}}><StarRating rating={Math.round(Number(p.avg_rating))} size={11}/><span style={{fontSize:10,color:"#888"}}>({p.review_count||0})</span></div>}
                        <button onClick={()=>onAddToCart(p)} style={{marginTop:6,background:"#BA7517",color:"white",border:"none",borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:11,fontWeight:600}}>+ Add to Cart</button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ── LOYALTY POINTS COMPONENT (Day 35 — NEW) ──
const LoyaltyModal = ({user, onClose}) => {
  const [loyalty, setLoyalty] = useState(null);
  const [loadingLoyalty, setLoadingLoyalty] = useState(true);

  const loadLoyalty = async () => {
    setLoadingLoyalty(true);
    try {
      const r = await fetch(`${API}/api/loyalty/${user?.id||1}`);
      const d = await r.json();
      setLoyalty(d.loyalty);
    } catch { setLoyalty(null); }
    setLoadingLoyalty(false);
  };

  useEffect(()=>{ loadLoyalty(); }, []);

  const typeIcon  = (type) => type==="earn" ? "➕" : "➖";
  const typeColor = (type) => type==="earn" ? "#085041" : "#c00";

  return (
    <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:"white",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",paddingBottom:30}}>
        <div style={{padding:"20px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:17}}>🏆 Loyalty Points</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:"0 20px"}}>
          {loadingLoyalty?<LoadingSpinner/>:loyalty?(
            <>
              <div style={{background:"linear-gradient(135deg,#BA7517,#E8960A)",borderRadius:16,padding:24,marginBottom:16,textAlign:"center",color:"white"}}>
                <div style={{fontSize:13,opacity:0.85,marginBottom:6}}>Your Points Balance</div>
                <div style={{fontSize:42,fontWeight:800}}>{loyalty.points}</div>
                <div style={{fontSize:13,opacity:0.9,marginTop:6}}>= ₹{((loyalty.points/100)*10).toFixed(0)} discount value</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:16}}>
                  <div style={{background:"rgba(255,255,255,0.15)",borderRadius:8,padding:10}}>
                    <div style={{fontSize:11,opacity:0.8}}>Total Earned</div>
                    <div style={{fontWeight:700,fontSize:16}}>{loyalty.total_earned}</div>
                  </div>
                  <div style={{background:"rgba(255,255,255,0.15)",borderRadius:8,padding:10}}>
                    <div style={{fontSize:11,opacity:0.8}}>Total Redeemed</div>
                    <div style={{fontWeight:700,fontSize:16}}>{loyalty.total_redeemed}</div>
                  </div>
                </div>
              </div>

              <div style={{background:"#E6F1FB",borderRadius:12,padding:14,marginBottom:16}}>
                <div style={{fontWeight:600,fontSize:13,color:"#0C447C",marginBottom:8}}>💡 How to Earn Points</div>
                <div style={{fontSize:12,color:"#0C447C",lineHeight:1.6}}>
                  • Every ₹100 spent = 10 points<br/>
                  • Write a product review = 50 bonus points<br/>
                  • 100 points = ₹10 discount at checkout
                </div>
              </div>

              <div style={{fontWeight:600,fontSize:14,marginBottom:10}}>📜 Points History</div>
              {(!loyalty.history || loyalty.history.length===0) ? (
                <div style={{textAlign:"center",padding:24,color:"#888",fontSize:13}}>No history yet. Start shopping to earn points!</div>
              ) : (
                loyalty.history.map((h,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"0.5px solid #f0f0f0"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span>{typeIcon(h.type)}</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:500}}>{h.description}</div>
                        <div style={{fontSize:11,color:"#888",marginTop:2}}>{new Date(h.created_at).toLocaleDateString("en-IN")}</div>
                      </div>
                    </div>
                    <div style={{fontWeight:700,fontSize:14,color:typeColor(h.type)}}>{h.points>0?"+":""}{h.points}</div>
                  </div>
                ))
              )}
            </>
          ):(
            <div style={{textAlign:"center",padding:40,color:"#888"}}>Could not load points. Try again later.</div>
          )}
        </div>
      </div>
    </div>
  );
};


// ── ROOM VISUALIZER COMPONENT (Day 4) ──
const RoomVisualizer = ({dims, products, onClose}) => {
  const [activeView, setActiveView] = React.useState("floor");
  const canvasRef = React.useRef(null);
  const frontRef  = React.useRef(null);

  const COLORS = {
    wall:    "#F5ECD7",
    floor:   "#D4A96A",
    ceiling: "#FFF8EE",
    grid:    "#E8D5B0",
    door:    "#8B6914",
    window:  "#A8D8EA",
    text:    "#4A3728",
    accent:  "#BA7517",
  };

  const PRODUCT_COLORS = [
    "#E8847A","#7AB8D4","#89C987","#D4A76A",
    "#9B87C9","#E8B87A","#7AC9C9","#C987A8",
  ];

  const PRODUCT_ICONS = {
    "sofa":"🛋️","chair":"🪑","table":"🪞","bed":"🛏️",
    "tile":"⬜","sink":"🚿","toilet":"🚽","cabinet":"🗄️",
    "lamp":"💡","tv":"📺","shelf":"📚","default":"📦",
  };

  const getProductIcon = (name) => {
    const n = name.toLowerCase();
    for (const [key, icon] of Object.entries(PRODUCT_ICONS)) {
      if (n.includes(key)) return icon;
    }
    return PRODUCT_ICONS.default;
  };

  const scale = 30; // pixels per foot
  const W = (dims?.length || 12) * scale;
  const H = (dims?.width  || 10) * scale;
  const roomH = (dims?.height || 9) * scale * 0.7;

  // Draw 2D Floor Plan
  React.useEffect(() => {
    if (activeView !== "floor") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pad = 40;
    canvas.width  = W + pad * 2;
    canvas.height = H + pad * 2;

    // Background
    ctx.fillStyle = "#FAFAF8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    for (let x = pad; x <= W + pad; x += scale) {
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, H + pad); ctx.stroke();
    }
    for (let y = pad; y <= H + pad; y += scale) {
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W + pad, y); ctx.stroke();
    }

    // Floor
    ctx.fillStyle = COLORS.floor;
    ctx.globalAlpha = 0.15;
    ctx.fillRect(pad, pad, W, H);
    ctx.globalAlpha = 1;

    // Walls
    ctx.strokeStyle = COLORS.text;
    ctx.lineWidth = 3;
    ctx.strokeRect(pad, pad, W, H);

    // Door (bottom wall, left side)
    ctx.strokeStyle = COLORS.door;
    ctx.lineWidth = 2;
    ctx.strokeRect(pad, pad + H - 6, 30, 6);
    ctx.fillStyle = COLORS.door;
    ctx.font = "10px sans-serif";
    ctx.fillText("🚪", pad + 5, pad + H - 8);

    // Window (top wall, center)
    ctx.fillStyle = COLORS.window;
    ctx.fillRect(pad + W/2 - 20, pad - 3, 40, 6);
    ctx.fillStyle = COLORS.text;
    ctx.fillText("🪟", pad + W/2 - 8, pad - 5);

    // Place products
    const prods = products || [];
    const cols = Math.ceil(Math.sqrt(prods.length));
    prods.slice(0, 8).forEach((p, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const pw = Math.min(60, W / cols - 10);
      const ph = Math.min(50, H / Math.ceil(prods.length / cols) - 10);
      const px = pad + 15 + col * (W / cols);
      const py = pad + 15 + row * (H / Math.ceil(prods.length / cols));

      // Product box
      ctx.fillStyle = PRODUCT_COLORS[i % PRODUCT_COLORS.length];
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, 4);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = PRODUCT_COLORS[i % PRODUCT_COLORS.length];
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Icon
      ctx.font = "16px sans-serif";
      ctx.fillText(getProductIcon(p.name), px + pw/2 - 8, py + ph/2 + 4);

      // Label
      ctx.fillStyle = COLORS.text;
      ctx.font = "bold 8px sans-serif";
      ctx.textAlign = "center";
      const label = p.name.length > 10 ? p.name.substring(0,10)+"..." : p.name;
      ctx.fillText(label, px + pw/2, py + ph + 10);
      ctx.textAlign = "left";
    });

    // Dimensions
    ctx.fillStyle = COLORS.accent;
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${dims?.length || 12} ft`, pad + W/2, pad - 10);
    ctx.save();
    ctx.translate(pad - 12, pad + H/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText(`${dims?.width || 10} ft`, 0, 0);
    ctx.restore();
    ctx.textAlign = "left";

    // Title
    ctx.fillStyle = COLORS.text;
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("📐 Floor Plan", pad, pad - 18);

  }, [activeView, dims, products]);

  // Draw Front View
  React.useEffect(() => {
    if (activeView !== "front") return;
    const canvas = frontRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cW = W + 80;
    const cH = roomH + 80;
    canvas.width  = cW;
    canvas.height = cH;
    const pad = 40;

    // Sky/ceiling
    ctx.fillStyle = "#FFF8EE";
    ctx.fillRect(0, 0, cW, cH);

    // Back wall
    const wallGrad = ctx.createLinearGradient(pad, pad, pad, pad + roomH);
    wallGrad.addColorStop(0, "#F5ECD7");
    wallGrad.addColorStop(1, "#E8D5B0");
    ctx.fillStyle = wallGrad;
    ctx.fillRect(pad, pad, W, roomH);

    // Floor
    const floorGrad = ctx.createLinearGradient(pad, pad + roomH, pad, pad + roomH + 30);
    floorGrad.addColorStop(0, "#C4955A");
    floorGrad.addColorStop(1, "#A07840");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(pad, pad + roomH, W, 30);

    // Wall border
    ctx.strokeStyle = "#8B6914";
    ctx.lineWidth = 2;
    ctx.strokeRect(pad, pad, W, roomH);

    // Window on back wall
    ctx.fillStyle = "#A8D8EA";
    ctx.globalAlpha = 0.7;
    ctx.fillRect(pad + W/2 - 30, pad + 20, 60, 50);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#6A9BB0";
    ctx.lineWidth = 2;
    ctx.strokeRect(pad + W/2 - 30, pad + 20, 60, 50);
    // Window cross
    ctx.beginPath();
    ctx.moveTo(pad + W/2, pad + 20);
    ctx.lineTo(pad + W/2, pad + 70);
    ctx.moveTo(pad + W/2 - 30, pad + 45);
    ctx.lineTo(pad + W/2 + 30, pad + 45);
    ctx.stroke();

    // Place products along the floor
    const prods = products || [];
    const prodW = Math.min(W / (prods.length + 1) - 5, 60);
    const prodMaxH = roomH * 0.6;

    prods.slice(0, 6).forEach((p, i) => {
      const px = pad + (i + 1) * (W / (prods.length + 1)) - prodW/2;
      const ph = prodMaxH * (0.4 + Math.random() * 0.3);
      const py = pad + roomH - ph;

      // Product shadow
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.beginPath();
      ctx.ellipse(px + prodW/2, pad + roomH + 15, prodW/2, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Product body
      const grad = ctx.createLinearGradient(px, py, px + prodW, py);
      grad.addColorStop(0, PRODUCT_COLORS[i % PRODUCT_COLORS.length]);
      grad.addColorStop(1, PRODUCT_COLORS[(i+1) % PRODUCT_COLORS.length]);
      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.roundRect(px, py, prodW, ph, 6);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Product icon
      ctx.font = `${Math.min(prodW * 0.5, 24)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(getProductIcon(p.name), px + prodW/2, py + ph/2 + 6);

      // Product name below floor
      ctx.fillStyle = COLORS.text;
      ctx.font = "bold 8px sans-serif";
      const label = p.name.length > 8 ? p.name.substring(0,8)+"..." : p.name;
      ctx.fillText(label, px + prodW/2, pad + roomH + 28);
      ctx.textAlign = "left";
    });

    // Dimension lines
    ctx.strokeStyle = COLORS.accent;
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1;
    // Width dimension
    ctx.beginPath();
    ctx.moveTo(pad, pad + roomH + 35);
    ctx.lineTo(pad + W, pad + roomH + 35);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = COLORS.accent;
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${dims?.length || 12} ft`, pad + W/2, pad + roomH + 48);
    // Height dimension
    ctx.save();
    ctx.translate(pad - 20, pad + roomH/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText(`${dims?.height || 9} ft`, 0, 0);
    ctx.restore();
    ctx.textAlign = "left";

    // Title
    ctx.fillStyle = COLORS.text;
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("🎨 Front View", pad, pad - 10);

  }, [activeView, dims, products]);

  const area = ((dims?.length||12) * (dims?.width||10)).toFixed(0);
  const totalCost = products?.reduce((s,p)=>s+(p.price||0),0) || 0;

  return (
    <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.7)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"white",borderRadius:16,width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto",paddingBottom:20}}>

        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#BA7517,#E8960A)",padding:"16px 20px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{color:"white",fontWeight:700,fontSize:16}}>🏠 Room Visualization</div>
            <div style={{color:"rgba(255,255,255,0.85)",fontSize:12,marginTop:2}}>{dims?.length||12}ft × {dims?.width||10}ft × {dims?.height||9}ft • {area} sq.ft</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:"50%",width:32,height:32,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>

        {/* View Toggle */}
        <div style={{display:"flex",gap:8,padding:"12px 16px",borderBottom:"1px solid #eee"}}>
          {[{id:"floor",label:"📐 Floor Plan"},{id:"front",label:"🎨 Front View"},{id:"summary",label:"📊 Summary"}].map(v=>(
            <button key={v.id} onClick={()=>setActiveView(v.id)}
              style={{flex:1,padding:"8px 4px",background:activeView===v.id?"#BA7517":"#f0f0f0",color:activeView===v.id?"white":"#555",border:"none",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:activeView===v.id?700:400}}>
              {v.label}
            </button>
          ))}
        </div>

        {/* Floor Plan View */}
        {activeView==="floor"&&(
          <div style={{padding:16,textAlign:"center"}}>
            <canvas ref={canvasRef} style={{maxWidth:"100%",borderRadius:8,border:"1px solid #eee"}}/>
            <div style={{fontSize:11,color:"#888",marginTop:8}}>Top-down view showing product placement</div>
          </div>
        )}

        {/* Front View */}
        {activeView==="front"&&(
          <div style={{padding:16,textAlign:"center"}}>
            <canvas ref={frontRef} style={{maxWidth:"100%",borderRadius:8,border:"1px solid #eee"}}/>
            <div style={{fontSize:11,color:"#888",marginTop:8}}>Front view showing room with products</div>
          </div>
        )}

        {/* Summary View */}
        {activeView==="summary"&&(
          <div style={{padding:16}}>
            <div style={{background:"#FFF3DC",borderRadius:12,padding:16,marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:14,color:"#BA7517",marginBottom:10}}>📐 Room Dimensions</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[{label:"Length",value:`${dims?.length||12} ft`},{label:"Width",value:`${dims?.width||10} ft`},{label:"Height",value:`${dims?.height||9} ft`},{label:"Area",value:`${area} sq.ft`}].map((item,i)=>(
                  <div key={i} style={{background:"white",borderRadius:8,padding:10,textAlign:"center"}}>
                    <div style={{fontSize:11,color:"#888"}}>{item.label}</div>
                    <div style={{fontWeight:700,fontSize:15,color:"#BA7517",marginTop:2}}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{fontWeight:600,fontSize:14,marginBottom:10}}>🛍️ Recommended Products</div>
            {products?.map((p,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"0.5px solid #f0f0f0"}}>
                <div style={{width:36,height:36,borderRadius:8,background:PRODUCT_COLORS[i%PRODUCT_COLORS.length],display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{getProductIcon(p.name)}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:500,fontSize:13}}>{p.name}</div>
                  <div style={{fontSize:11,color:"#888"}}>{p.brand} • {p.room_name}</div>
                </div>
                <div style={{fontWeight:700,color:"#BA7517",fontSize:13}}>₹{Number(p.price).toLocaleString("en-IN")}</div>
              </div>
            ))}

            <div style={{background:"linear-gradient(135deg,#BA7517,#E8960A)",borderRadius:12,padding:14,marginTop:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{color:"white",fontWeight:600,fontSize:14}}>Total Estimated Cost</div>
              <div style={{color:"white",fontWeight:800,fontSize:18}}>₹{totalCost.toLocaleString("en-IN")}</div>
            </div>
          </div>
        )}

      </div>
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
  const [showShareModal, setShowShareModal]   = useState(false);
  const [shareProduct, setShareProduct]       = useState(null);
  const [shareCopied, setShareCopied]         = useState(false);
  const [showEMI, setShowEMI]                 = useState(false);
  const [emiProduct, setEmiProduct]           = useState(null);
  const [showBudgetPlanner, setShowBudgetPlanner] = useState(false);
  // Day 3 — Room Design Chat (NEW)
  // Unified chat flow states (Day 4 redesign)
  const [chatFlow, setChatFlow]           = useState("idle"); // idle|style|budget|dims|products|view2d|done
  const [chatSession, setChatSession]     = useState({});
  const [chatMode, setChatMode]           = useState("normal");
  const [roomDesignSession, setRoomDesignSession] = useState({});
  const [roomDesignProducts, setRoomDesignProducts] = useState([]);
  // Day 4 — Room Visualizer (NEW)
  const [showVisualizer, setShowVisualizer]   = useState(false);
  const [visualizerDims, setVisualizerDims]   = useState(null);
  const [visualizerProducts, setVisualizerProducts] = useState([]);
  // Day 35 — Loyalty Points (NEW)
  const [showLoyalty, setShowLoyalty]         = useState(false);
  const [loyaltyPoints, setLoyaltyPoints]     = useState(0);
  const [usePointsAtCheckout, setUsePointsAtCheckout] = useState(0);
  const [pointsDiscount, setPointsDiscount]   = useState(0);
  const [redeemingPoints, setRedeemingPoints] = useState(false);

  useEffect(() => {
    if (selectedRoom) {
      fetch(`${API}/api/products/${selectedRoom.id}`).then(r=>r.json()).then(d=>setProducts(d.products||[]));
      loadBundles(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    fetch(`${API}/api/brands`).then(r=>r.json()).then(d=>setBrands(d.brands||[]));
    fetch(`${API}/api/styles`).then(r=>r.json()).then(d=>setStyles(d.styles||[]));
    loadTopRated(); loadSales();
  }, []);

  useEffect(() => {
    if (user&&screen==="orders")    loadOrders();
    if (user&&screen==="profile")   { loadProfile(); loadStyleProfile(); loadLoyaltyPoints(); }
    if (user&&screen==="wishlist")  loadWishlist();
    if (screen==="recommendations") loadRecommendations();
    trackPage(screen);
  }, [screen, user]);

  useEffect(() => { if (uploadScreen) loadAllProducts(); }, [uploadScreen]);
  useEffect(() => { if (selectedProduct) { loadProductReviews(selectedProduct.id); loadProductGallery(selectedProduct.id); } }, [selectedProduct]);
  useEffect(() => { if (user) { loadWishlist(); loadRecentlyViewed(); loadLoyaltyPoints(); } }, [user]);
  useEffect(() => { setShowCompareBar(compareList.length>0); }, [compareList]);

  const loadTopRated       = async () => { try { const r=await fetch(`${API}/api/top-rated`); const d=await r.json(); setTopRated(d.products||[]); } catch {} };
  const loadBundles        = async (id) => { try { const r=await fetch(`${API}/api/bundles/${id}`); const d=await r.json(); setBundles(d); } catch {} };
  const loadProductReviews = async (id) => { try { const r=await fetch(`${API}/api/reviews/${id}`); const d=await r.json(); setProductReviews(d); } catch { setProductReviews(null); } };
  const loadProductGallery = async (id) => { try { const r=await fetch(`${API}/api/gallery/${id}`); const d=await r.json(); setProductGallery(d.images||[]); setGalleryIndex(0); } catch { setProductGallery([]); } };
  const loadSales          = async () => { try { const r=await fetch(`${API}/api/sales`); const d=await r.json(); setSales(d.sales||[]); } catch {} };
  const loadRecentlyViewed = async () => { if (!user) return; try { const r=await fetch(`${API}/api/recently-viewed/${user.id}`); const d=await r.json(); setRecentlyViewed(d.recently_viewed||[]); } catch {} };

  // ── Day 35 — Loyalty Points functions (NEW) ──
  const loadLoyaltyPoints = async () => {
    if (!user) return;
    try {
      const r = await fetch(`${API}/api/loyalty/${user.id}`);
      const d = await r.json();
      setLoyaltyPoints(d.loyalty?.points || 0);
    } catch { setLoyaltyPoints(0); }
  };

  const applyPointsAtCheckout = async () => {
    if (usePointsAtCheckout<=0) { alert("Enter points to use!"); return; }
    if (usePointsAtCheckout>loyaltyPoints) { alert(`You only have ${loyaltyPoints} points!`); return; }
    setRedeemingPoints(true);
    try {
      const r = await fetch(`${API}/api/loyalty/redeem`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:user?.id||1,points:usePointsAtCheckout})});
      const d = await r.json();
      if (d.status==="ok") {
        setPointsDiscount(d.discount);
        setLoyaltyPoints(prev=>prev-usePointsAtCheckout);
        alert(d.message);
      } else alert(d.error||"Failed to redeem points");
    } catch(err) { alert("Failed: "+err.message); }
    setRedeemingPoints(false);
  };

  const removePointsDiscount = () => {
    setPointsDiscount(0);
    setLoyaltyPoints(prev=>prev+usePointsAtCheckout);
    setUsePointsAtCheckout(0);
  };

  const openShare      = (product) => { setShareProduct(product); setShowShareModal(true); setShareCopied(false); track("share_product",product.room_id,product.id,product.name); };
  const getShareText   = (p) => { if (!p) return ""; return `🏠 HomeBot AI\n\n${p.name}\nRoom: ${p.room_name||""}\nBrand: ${p.brand||""}\n💰 ₹${Number(p.price).toLocaleString("en-IN")} / ${p.unit||""}\n`+(p.material?`Material: ${p.material}\n`:"")+`\n✨ HomeBot AI — India's #1 Interior Design App`; };
  const shareOnWhatsApp = (p) => { window.open(`https://wa.me/?text=${encodeURIComponent(getShareText(p))}`,"_blank"); };
  const copyToClipboard = async (p) => { try { await navigator.clipboard.writeText(getShareText(p)); setShareCopied(true); setTimeout(()=>setShareCopied(false),2000); } catch { alert("Copied!"); } };

  const loadWishlist = async () => {
    if (!user) return; setWishlistLoading(true);
    try { const r=await fetch(`${API}/api/wishlist/${user.id}`); const d=await r.json(); setWishlist(d.wishlist||[]); setWishlistIds(new Set((d.wishlist||[]).map(i=>i.id))); } catch { setWishlist([]); }
    setWishlistLoading(false);
  };

  const toggleWishlist = async (product) => {
    if (!user) { alert("Please login!"); return; }
    const isIn = wishlistIds.has(product.id);
    if (isIn) { try { await fetch(`${API}/api/wishlist/${user.id}/${product.id}`,{method:"DELETE"}); setWishlistIds(prev=>{const n=new Set(prev);n.delete(product.id);return n;}); setWishlist(prev=>prev.filter(i=>i.id!==product.id)); } catch(err) { alert("Failed"); } }
    else { try { const r=await fetch(`${API}/api/wishlist`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:user.id,product_id:product.id})}); const d=await r.json(); if (d.status==="ok"||d.status==="exists") { setWishlistIds(prev=>new Set([...prev,product.id])); setWishlist(prev=>[...prev,{...product}]); } } catch(err) { alert("Failed"); } }
  };

  const toggleCompare = (product) => { const exists=compareList.find(p=>p.id===product.id); if (exists) { setCompareList(prev=>prev.filter(p=>p.id!==product.id)); } else { if (compareList.length>=2) { alert("Max 2 products!"); return; } setCompareList(prev=>[...prev,product]); } };
  const startCompare  = async () => { if (compareList.length<2) { alert("Select 2!"); return; } setCompareLoading(true); try { const r=await fetch(`${API}/api/compare`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({product_ids:compareList.map(p=>p.id)})}); const d=await r.json(); setCompareData(d.products||[]); setScreen("compare"); } catch(err) { alert("Failed"); } setCompareLoading(false); };
  const loadSaleProducts = async (sale) => { setSelectedSale(sale); setSaleLoading(true); try { const r=await fetch(`${API}/api/sales/${sale.id}/products`); const d=await r.json(); setSaleProducts(d.products||[]); setScreen("sale_detail"); } catch {} setSaleLoading(false); };
  const loadOrders = async () => { if (!user) return; setOrdersLoading(true); try { const r=await fetch(`${API}/api/orders/${user.id}`); const d=await r.json(); setOrders(d.orders||[]); } catch { setOrders([]); } setOrdersLoading(false); };

  const loadProfile = async () => {
    if (!user) return; setProfileLoading(true);
    try { const r=await fetch(`${API}/api/profile/${user.id}`); const d=await r.json(); setProfile(d); setEditName(d.user.name); setEditPhone(d.user.phone||""); setEditCity(d.user.city||""); setEditLang(d.user.language||"english"); } catch { setProfile(null); }
    setProfileLoading(false);
  };

  const loadStyleProfile = async () => { try { const r=await fetch(`${API}/api/personalization/${user?.id||1}`); const d=await r.json(); setStyleProfile(d); if (d.profile) { setStylePref(d.profile.favorite_style||"modern"); setBudgetPref(d.profile.budget_range||"medium"); setColorPref(d.profile.color_pref||""); setMaterialPref(d.profile.material_pref||""); } } catch {} };
  const saveStyleProfile = async () => { try { const r=await fetch(`${API}/api/personalization/${user?.id||1}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({favorite_style:stylePref,budget_range:budgetPref,color_pref:colorPref,material_pref:materialPref})}); const d=await r.json(); if (d.status==="ok") { alert("✅ Saved!"); setShowStyleSetup(false); loadStyleProfile(); } } catch(err) { alert("Failed"); } };
  const loadAllProducts = async () => { try { const r=await fetch(`${API}/api/search?q=`); const d=await r.json(); setAllProducts(d.products||[]); } catch { setAllProducts([]); } };
  const loadRecommendations = async () => { setRecLoading(true); try { const r=await fetch(`${API}/api/recommendations/user/${user?.id||1}`); const d=await r.json(); setRecommendations(d.recommendations||[]); } catch { setRecommendations([]); } try { const r=await fetch(`${API}/api/trending`); const d=await r.json(); setTrending(d.trending||[]); } catch { setTrending([]); } setRecLoading(false); };

  const uploadGalleryImage = async (productId) => { if (!galleryFile) { alert("Select image!"); return; } setGalleryUploading(true); try { const fd=new FormData(); fd.append("file",galleryFile); fd.append("sort_order",productGallery.length); fd.append("image_type","gallery"); const r=await fetch(`${API}/api/gallery/${productId}`,{method:"POST",body:fd}); const d=await r.json(); if (d.status==="ok") { alert("✅ Added!"); setGalleryFile(null); setShowGalleryUpload(false); loadProductGallery(productId); } else alert("Error: "+d.error); } catch(err) { alert("Failed"); } setGalleryUploading(false); };

  // Day 35 — review submit now also awards bonus points
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
      if (d.status==="ok") {
        try {
          const br = await fetch(`${API}/api/loyalty/review-bonus/${user?.id||1}`,{method:"POST"});
          const bd = await br.json();
          alert(bd.status==="ok" ? ("✅ Submitted! "+bd.message) : "✅ Submitted!");
          loadLoyaltyPoints();
        } catch { alert("✅ Submitted!"); }
        setShowReviewForm(false); setReviewText(""); setReviewRating(5); setReviewPhoto(null); setIsAnonymous(false); setDisplayName("");
        loadProductReviews(selectedProduct.id);
      }
    } catch(err) { alert("Failed"); }
  };

  const submitChatbotRating = async () => { try { const r=await fetch(`${API}/api/chatbot/rate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:user?.id||1,rating:chatbotRating,feedback:chatbotFeedback,session_msg:lastAiMessage})}); const d=await r.json(); if (d.status==="ok") { alert("✅ Thank you!"); setShowChatbotRating(false); setChatbotFeedback(""); setChatbotRating(0); } } catch(err) { alert("Failed"); } };
  const uploadImage = async () => { if (!uploadFile||!uploadProductId) { alert("Select product and image!"); return; } setUploadLoading(true); try { const fd=new FormData(); fd.append("file",uploadFile); fd.append("product_id",uploadProductId); const r=await fetch(`${API}/api/upload-image`,{method:"POST",body:fd}); const d=await r.json(); if (d.status==="ok") { setUploadSuccess(d.image_url); alert("✅ Uploaded!"); } else alert("Error: "+d.error); } catch(err) { alert("Upload failed"); } setUploadLoading(false); };
  const trackOrderFn = async (orderId) => { setTrackLoading(true); try { const r=await fetch(`${API}/api/track/${orderId}`); const d=await r.json(); setTrackedOrder(d.order); setScreen("track"); } catch { alert("Could not track"); } setTrackLoading(false); };
  const saveProfile = async () => { try { const r=await fetch(`${API}/api/profile/${user.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:editName,phone:editPhone,city:editCity,language:editLang})}); const d=await r.json(); if (d.status==="ok") { alert("✅ Updated!"); setEditProfile(false); loadProfile(); setUser({...user,name:editName}); } } catch(err) { alert("Failed"); } };

  const validateCoupon = async () => { if (!couponCode.trim()) { setCouponError("Enter coupon!"); return; } setCouponLoading(true); setCouponError(""); try { const r=await fetch(`${API}/api/coupons/validate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:couponCode.toUpperCase(),user_id:user?.id||1,order_total:subtotal})}); const d=await r.json(); if (d.valid) { setCouponData(d); setCouponError(""); } else { setCouponData(null); setCouponError(d.message||"Invalid"); } } catch(err) { setCouponError("Failed"); } setCouponLoading(false); };
  const loadAvailableCoupons = async () => { try { const r=await fetch(`${API}/api/coupons`); const d=await r.json(); setAvailableCoupons(d.coupons||[]); } catch {} };
  const removeCoupon = () => { setCouponData(null); setCouponCode(""); setCouponError(""); };

  // Day 35 — placeOrder now applies points discount + earns new points after order
  const placeOrder = async () => {
    if (cart.length===0) { alert("Cart is empty!"); return; }
    setOrderPlacing(true);
    try {
      const totalDiscount = (couponData?.discount||0) + (pointsDiscount||0);
      const r=await fetch(`${API}/api/orders`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:user?.id||1,items:cart.map(i=>({id:i.id,price:Number(i.price),qty:Number(i.qty),name:i.name})),room:selectedRoom?.name||"Home",coupon_id:couponData?.coupon_id||null,coupon_discount:totalDiscount})});
      const d=await r.json();
      if (d.status==="ok") {
        setOrderSuccess(d); setCart([]); setCouponData(null); setCouponCode(""); setPointsDiscount(0); setUsePointsAtCheckout(0);
        track("place_order",null,null,`Order #${d.order_id}`);
        try {
          const lr = await fetch(`${API}/api/loyalty/earn`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:user?.id||1,order_id:d.order_id,amount_paid:d.grand_total})});
          const ld = await lr.json();
          if (ld.status==="ok") loadLoyaltyPoints();
        } catch {}
      } else alert("Order failed: "+d.error);
    } catch(err) { alert("Failed"); }
    setOrderPlacing(false);
  };

  const handleSearch = async () => { setSearching(true); let url=`${API}/api/search?q=${searchQuery}`; if (filterRoom) url+=`&room_id=${filterRoom}`; if (filterMin) url+=`&min_price=${filterMin}`; if (filterMax) url+=`&max_price=${filterMax}`; if (filterStyle) url+=`&style=${filterStyle}`; if (filterBrand) url+=`&brand=${filterBrand}`; try { const r=await fetch(url); const d=await r.json(); setSearchResults(d.products||[]); track("search",null,null,searchQuery); } catch { setSearchResults([]); } setSearching(false); };
  const clearFilters   = () => { setSearchQuery(""); setFilterRoom(""); setFilterMin(""); setFilterMax(""); setFilterStyle(""); setFilterBrand(""); setSearchResults([]); };
  const addToCart      = (p) => { const e=cart.find(i=>i.id===p.id); if(e){setCart(cart.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i));}else{setCart([...cart,{...p,qty:1}]);} track("add_to_cart",p.room_id,p.id,p.name); };
  const removeFromCart = (id) => setCart(cart.filter(i=>i.id!==id));
  const subtotal   = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const gst        = Math.round(subtotal*0.18);
  const grandTotal = subtotal+gst;
  const finalTotal = Math.max(0, grandTotal-(couponData?.discount||0)-(pointsDiscount||0));

  // ── UNIFIED CHAT HANDLER (Day 4) ──
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m=>[...m,{role:"user",text:userMsg}]);
    setLoading(true);
    track("chat_message",null,null,userMsg);

    try {
      // ── FLOW: Collecting style ──
      if (chatFlow === "style") {
        const styleMap = {"1":"modern","2":"classic","3":"traditional","4":"luxury","5":"minimalist",
          "modern":"modern","classic":"classic","traditional":"traditional","luxury":"luxury","minimalist":"minimalist"};
        const chosen = styleMap[userMsg.toLowerCase().trim()] || "modern";
        setChatSession(s=>({...s, style:chosen}));
        setChatFlow("budget");
        setMessages(m=>[...m,{role:"ai",text:`Great choice! 🎨 ${chosen.charAt(0).toUpperCase()+chosen.slice(1)} style it is!

Now, what is your BUDGET in rupees?
(e.g. 50000, 1 lakh, 2 lakh)`}]);
        setLoading(false); return;
      }

      // ── FLOW: Collecting budget ──
      if (chatFlow === "budget") {
        const nums = userMsg.replace(/,/g,"").match(/\d+/g);
        if (!nums) {
          setMessages(m=>[...m,{role:"ai",text:"Please enter a valid budget amount (e.g. 50000 or 1 lakh)"}]);
          setLoading(false); return;
        }
        let bgt = parseInt(nums[0]);
        if (userMsg.toLowerCase().includes("lakh") || userMsg.toLowerCase().includes("lac")) bgt *= 100000;
        else if (bgt < 1000 && userMsg.toLowerCase().includes("k")) bgt *= 1000;
        setChatSession(s=>({...s, budget:bgt}));
        setChatFlow("dims");
        setMessages(m=>[...m,{role:"ai",text:`Perfect! Budget: ₹${bgt.toLocaleString("en-IN")} ✅

Now tell me your room dimensions.
You can say it naturally like:
"My room is 12 by 10 feet, height 9"
or give one value at a time.

What is the LENGTH of your room in feet?`}]);
        setLoading(false); return;
      }

      // ── FLOW: Collecting dimensions ──
      if (chatFlow === "dims") {
        const r = await fetch(`${API}/api/chat/room-design`,{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({message:userMsg, user_id:user?.id||1, session:{...chatSession, step: chatSession.step||"get_length"}})
        });
        const d = await r.json();
        if (d.session) setChatSession(s=>({...s,...d.session}));

        if (d.session?.step === "done" || (d.products && d.products.length > 0)) {
          // Got products! Show them + ask about 2D
          setChatFlow("products");
          if (d.room_dims) { setVisualizerDims(d.room_dims); setVisualizerProducts(d.products||[]); }
          setMessages(m=>[...m,
            {role:"ai", text:d.reply||"Here are my recommendations!", lang:d.detected_lang, products:d.products, room_dims:d.room_dims},
            {role:"ai", text:"🏠 Want to see a 2D floor plan of your room with these products?

Type YES to see the floor plan or NO to continue chatting.", type:"ask_2d"}
          ]);
          setChatSession(s=>({...s, dims:d.room_dims}));
        } else {
          setMessages(m=>[...m,{role:"ai",text:d.reply||"Please continue...",lang:d.detected_lang}]);
        }
        setLoading(false); return;
      }

      // ── FLOW: Ask about 2D ──
      if (chatFlow === "products") {
        const ans = userMsg.toLowerCase().trim();
        if (ans.includes("yes") || ans === "y" || ans.includes("हां") || ans.includes("ha")) {
          setChatFlow("view2d");
          setShowVisualizer(true);
          setMessages(m=>[...m,{role:"ai",text:"📐 Opening your 2D floor plan now! Check the visualization above.

After viewing, type YES if you'd also like to see a 3D view, or NO to finish.",type:"ask_3d"}]);
        } else {
          setChatFlow("done");
          setMessages(m=>[...m,{role:"ai",text:"No problem! Feel free to ask me anything else about interior design. 😊"}]);
        }
        setLoading(false); return;
      }

      // ── FLOW: Ask about 3D ──
      if (chatFlow === "view2d") {
        const ans = userMsg.toLowerCase().trim();
        if (ans.includes("yes") || ans === "y") {
          setChatFlow("done");
          setMessages(m=>[...m,{role:"ai",text:"🚀 3D visualization is coming soon in the next update! For now, enjoy the 2D floor plan. Thank you for using HomeBot AI! 🏠"}]);
        } else {
          setChatFlow("done");
          setMessages(m=>[...m,{role:"ai",text:"Great! Your room design is saved. Feel free to add products to cart and contact us for installation. 🏠"}]);
        }
        setLoading(false); return;
      }

      // ── DEFAULT: Normal personalized chat + detect if user wants room design ──
      const roomKeywords = ["design","renovate","my room","floor plan","2d","3d","dimension","room size"];
      const wantsDesign = roomKeywords.some(k=>userMsg.toLowerCase().includes(k));

      if (wantsDesign && chatFlow === "idle") {
        setChatFlow("style");
        setMessages(m=>[...m,{role:"ai",text:`🏠 Let's design your perfect room!

First, what is your preferred style?

1️⃣ Modern
2️⃣ Classic
3️⃣ Traditional
4️⃣ Luxury
5️⃣ Minimalist

Type a number or the style name!`}]);
        setLoading(false); return;
      }

      // Normal personalized chat
      const ep = usePersonalizedChat?`${API}/api/chat/personalized`:`${API}/api/chat`;
      const r = await fetch(ep,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:userMsg,user_id:user?.id||1,room:selectedRoom?.name||"general",budget})});
      const d = await r.json();
      const aiReply = d.reply || "Sorry, could not process that.";
      setLastAiMessage(aiReply);
      setMessages(m=>[...m,{role:"ai",text:aiReply,lang:d.detected_lang,personalized:d.personalized}]);
      setTimeout(()=>setShowChatbotRating(true),3000);

    } catch(e) {
      setMessages(m=>[...m,{role:"ai",text:"Connection error. Please try again."}]);
    }
    setLoading(false);
  };
  const downloadPDF = async () => { if (cart.length===0) { alert("Add products first!"); return; } setPdfLoading(true); try { const res=await fetch(`${API}/api/generate-pdf`,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/pdf"},body:JSON.stringify({items:cart.map(i=>({name:String(i.name),price:Number(i.price),qty:Number(i.qty)})),budget:Number(budget),room:selectedRoom?.name||"Home"})}); if (!res.ok) { alert("PDF Error"); setPdfLoading(false); return; } const blob=await res.blob(); const url=window.URL.createObjectURL(new Blob([blob],{type:"application/pdf"})); const a=document.createElement("a"); a.style.display="none"; a.href=url; a.download="HomeBot_Quotation.pdf"; document.body.appendChild(a); a.click(); setTimeout(()=>{window.URL.revokeObjectURL(url);document.body.removeChild(a);},100); } catch(err) { alert("PDF failed"); } setPdfLoading(false); };
  const sendWhatsApp = async () => { const phone=prompt("Enter WhatsApp number:\nExample: +919876543210"); if (!phone) return; try { const r=await fetch(`${API}/api/notify-whatsapp`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:cart.map(i=>({name:i.name,price:Number(i.price),qty:Number(i.qty)})),total:finalTotal,room:selectedRoom?.name||"Home",phone:`whatsapp:${phone}`})}); const d=await r.json(); alert(d.status==="ok"?"✅ WhatsApp sent!":"Error: "+d.error); } catch(err) { alert("Failed"); } };
  const handleLogin = async () => { setLoginError(""); try { const r=await fetch(`${API}/api/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:loginEmail,password:loginPassword})}); const d=await r.json(); if (d.status==="ok") { setUser(d.user); setScreen("home"); track("login",null,null,d.user.name); } else setLoginError(d.message||"Login failed"); } catch { setLoginError("Connection error."); } };
  const handleRegister = async () => { try { const r=await fetch(`${API}/api/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:regName,email:regEmail,password:regPassword,phone:regPhone,city:regCity,language:"english"})}); const d=await r.json(); if (d.status==="ok") { alert("✅ Registered! Please login."); setShowRegister(false); } else alert("Error: "+d.error); } catch(err) { alert("Failed"); } };

  const S = {
    input:  {width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #ddd",fontSize:14,marginBottom:12,outline:"none",boxSizing:"border-box"},
    select: {width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #ddd",fontSize:14,marginBottom:12,outline:"none",background:"white",boxSizing:"border-box"}
  };

  const WishlistBtn = ({product}) => { const isW=wishlistIds.has(product.id); return <button onClick={e=>{e.stopPropagation();toggleWishlist(product);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,padding:4}}>{isW?"❤️":"🤍"}</button>; };
  const CompareBtn  = ({product}) => { const isC=compareList.find(p=>p.id===product.id); return <button onClick={e=>{e.stopPropagation();toggleCompare(product);}} style={{background:isC?"#E6F1FB":"#f0f0f0",border:isC?"1px solid #0C447C":"1px solid #ddd",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:11,color:isC?"#0C447C":"#555",fontWeight:isC?600:400}}>{isC?"✓ Compare":"⊕ Compare"}</button>; };
  const ShareBtn    = ({product}) => <button onClick={e=>{e.stopPropagation();openShare(product);}} style={{background:"#f0f0f0",border:"1px solid #ddd",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:11,color:"#555"}}>📤 Share</button>;
  const EMIBtn      = ({product}) => <button onClick={e=>{e.stopPropagation();setEmiProduct(product);setShowEMI(true);}} style={{background:"#E6F1FB",border:"1px solid #0C447C",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:11,color:"#0C447C",fontWeight:500}}>💳 EMI</button>;

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
            <EMIBtn product={p}/>
            <CompareBtn product={p}/>
            <ShareBtn product={p}/>
          </div>
        </div>
      </div>
    );
  };

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
          <div style={{display:"flex",gap:12,background:"#f8f9fa",borderRadius:10,padding:12,marginBottom:20}}>
            {p.image_url?<img src={p.image_url} alt={p.name} style={{width:60,height:60,borderRadius:8,objectFit:"cover"}} onError={e=>{e.target.onerror=null;e.target.src="https://placehold.co/60x60/FFF3DC/BA7517?text=🏠";}}/>:<div style={{width:60,height:60,borderRadius:8,background:"#FFF3DC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🏠</div>}
            <div><div style={{fontWeight:600,fontSize:13}}>{p.name}</div><div style={{fontSize:12,color:"#888",marginTop:2}}>{p.room_name}</div><div style={{color:"#BA7517",fontWeight:700,fontSize:14,marginTop:2}}>₹{Number(p.price).toLocaleString("en-IN")}</div></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
            <button onClick={()=>shareOnWhatsApp(p)} style={{background:"#25D366",color:"white",border:"none",borderRadius:12,padding:"14px 0",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><span style={{fontSize:24}}>💬</span>WhatsApp</button>
            <button onClick={()=>window.open(`https://t.me/share/url?text=${encodeURIComponent(getShareText(p))}`,"_blank")} style={{background:"#0088cc",color:"white",border:"none",borderRadius:12,padding:"14px 0",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><span style={{fontSize:24}}>✈️</span>Telegram</button>
            <button onClick={()=>copyToClipboard(p)} style={{background:shareCopied?"#085041":"#f0f0f0",color:shareCopied?"white":"#333",border:"none",borderRadius:12,padding:"14px 0",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><span style={{fontSize:24}}>{shareCopied?"✅":"📋"}</span>{shareCopied?"Copied!":"Copy"}</button>
          </div>
          <div style={{background:"#f8f9fa",borderRadius:8,padding:12,fontSize:12,color:"#555",lineHeight:1.6,whiteSpace:"pre-line",maxHeight:100,overflowY:"auto"}}>{getShareText(p)}</div>
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
        {showEMI&&<EMICalculator price={emiProduct?.price||50000} onClose={()=>setShowEMI(false)}/>}
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
                <div style={{display:"flex",gap:6,marginTop:8,justifyContent:"center",flexWrap:"wrap"}}>
                  <button onClick={()=>addToCart(p)} style={{background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:600}}>+ Cart</button>
                  <button onClick={()=>{setEmiProduct(p);setShowEMI(true);}} style={{background:"#E6F1FB",color:"#0C447C",border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",fontSize:11}}>💳</button>
                  <button onClick={()=>openShare(p)} style={{background:"#25D366",color:"white",border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",fontSize:11}}>📤</button>
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
                  <button onClick={()=>addToCart(winner)} style={{background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"10px 20px",cursor:"pointer",fontSize:13,fontWeight:600}}>+ Cart</button>
                  <button onClick={()=>{setEmiProduct(winner);setShowEMI(true);}} style={{background:"#E6F1FB",color:"#0C447C",border:"none",borderRadius:8,padding:"10px 14px",cursor:"pointer",fontSize:13,fontWeight:600}}>💳 EMI</button>
                  <button onClick={()=>openShare(winner)} style={{background:"#25D366",color:"white",border:"none",borderRadius:8,padding:"10px 14px",cursor:"pointer",fontSize:13}}>📤</button>
                </div>
              </div>
            );
          })()}
          <ShareModal/>
          {showEMI&&<EMICalculator price={emiProduct?.price||50000} onClose={()=>setShowEMI(false)}/>}
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
            <button onClick={()=>{setEmiProduct(selectedProduct);setShowEMI(true);}} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:20,padding:"4px 10px",fontSize:12,cursor:"pointer"}}>💳 EMI</button>
            <button onClick={()=>openShare(selectedProduct)} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:20,padding:"4px 10px",fontSize:12,cursor:"pointer"}}>📤</button>
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
            <div style={{background:"#E6F1FB",borderRadius:8,padding:"8px 12px",marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>{setEmiProduct(selectedProduct);setShowEMI(true);}}>
              <span style={{fontSize:13,color:"#0C447C"}}>💳 EMI from ₹{Math.round(Number(selectedProduct.price)*1.12/12).toLocaleString("en-IN")}/month</span>
              <span style={{fontSize:12,color:"#0C447C",fontWeight:600}}>Calculate →</span>
            </div>
            {total>0&&<div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}><StarRating rating={Math.round(avg)} size={18}/><span style={{fontSize:14,fontWeight:600}}>{Number(avg).toFixed(1)}</span><span style={{fontSize:13,color:"#888"}}>({total} reviews)</span></div>}
            <div style={{marginTop:12}}>
              {[{label:"Brand",value:selectedProduct.brand},{label:"Material",value:selectedProduct.material},{label:"Color",value:selectedProduct.color},{label:"Stock",value:selectedProduct.stock_qty?`${selectedProduct.stock_qty} units`:null},selectedProduct.length_cm&&{label:"Size",value:`${selectedProduct.length_cm}×${selectedProduct.width_cm}×${selectedProduct.height_cm} cm`}].filter(s=>s&&s.value).map((spec,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"0.5px solid #f0f0f0",fontSize:13}}><span style={{color:"#888"}}>{spec.label}</span><span style={{fontWeight:500}}>{spec.value}</span></div>
              ))}
            </div>
            <div style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap"}}>
              <button onClick={()=>addToCart(selectedProduct)} style={{flex:1,background:"#BA7517",color:"white",border:"none",borderRadius:10,padding:14,fontSize:15,fontWeight:600,cursor:"pointer"}}>+ Add to Cart</button>
              <button onClick={()=>toggleWishlist(selectedProduct)} style={{background:wishlistIds.has(selectedProduct.id)?"#FCEBEB":"#f0f0f0",color:wishlistIds.has(selectedProduct.id)?"#c00":"#555",border:"none",borderRadius:10,padding:"14px 16px",fontSize:20,cursor:"pointer"}}>{wishlistIds.has(selectedProduct.id)?"❤️":"🤍"}</button>
              <button onClick={()=>toggleCompare(selectedProduct)} style={{background:compareList.find(p=>p.id===selectedProduct.id)?"#E6F1FB":"#f0f0f0",color:compareList.find(p=>p.id===selectedProduct.id)?"#0C447C":"#555",border:"none",borderRadius:10,padding:"14px 12px",fontSize:13,cursor:"pointer",fontWeight:600}}>🆚</button>
              <button onClick={()=>openShare(selectedProduct)} style={{background:"#25D366",color:"white",border:"none",borderRadius:10,padding:"14px 12px",fontSize:13,cursor:"pointer",fontWeight:600}}>📤</button>
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
            {productReviews?.reviews?.length===0&&<div style={{textAlign:"center",padding:20,color:"#888",fontSize:13}}>No reviews yet!</div>}
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
        {showEMI&&<EMICalculator price={emiProduct?.price||selectedProduct?.price||50000} onClose={()=>setShowEMI(false)}/>}
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
      {showEMI&&<EMICalculator price={emiProduct?.price||50000} onClose={()=>setShowEMI(false)}/>}
      {showBudgetPlanner&&<BudgetPlanner onClose={()=>setShowBudgetPlanner(false)} onAddToCart={addToCart}/>}
      {showVisualizer&&visualizerDims&&<RoomVisualizer dims={visualizerDims} products={visualizerProducts} onClose={()=>setShowVisualizer(false)}/>}
      {showLoyalty&&<LoyaltyModal user={user} onClose={()=>{setShowLoyalty(false);loadLoyaltyPoints();}}/>}

      <div style={{background:"#BA7517",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{color:"white",fontWeight:600,fontSize:18}}>🏠 HomeBot AI</div><div style={{color:"#FFE0A0",fontSize:12}}>{user?`Welcome, ${user.name}!`:"Interior Design Assistant"}</div></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {user&&(
            <div style={{background:"white",borderRadius:20,padding:"4px 12px",fontSize:13,color:"#BA7517",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:3}} onClick={()=>setShowLoyalty(true)}>
              🏆 {loyaltyPoints}
            </div>
          )}
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
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={{fontSize:16,fontWeight:600}}>Select a room to renovate</div>
              <button onClick={()=>setShowBudgetPlanner(true)} style={{background:"#BA7517",color:"white",border:"none",borderRadius:20,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:600}}>💰 Plan Budget</button>
            </div>
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
                        <button onClick={e=>{e.stopPropagation();setEmiProduct(p);setShowEMI(true);}} style={{background:"#E6F1FB",color:"#0C447C",border:"none",borderRadius:6,padding:"3px 5px",cursor:"pointer",fontSize:10}}>💳</button>
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
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontWeight:600}}>💰 Quick Budget</div>
                <button onClick={()=>setShowBudgetPlanner(true)} style={{fontSize:11,color:"#BA7517",background:"none",border:"none",cursor:"pointer",fontWeight:500}}>Full Planner →</button>
              </div>
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
                      <button onClick={()=>{setEmiProduct(p);setShowEMI(true);}} style={{background:"#E6F1FB",color:"#0C447C",border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",fontSize:11}}>💳 EMI</button>
                      <button onClick={()=>openShare(p)} style={{background:"#25D366",color:"white",border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",fontSize:11}}>📤</button>
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
            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:16,fontWeight:600}}>💬 AI Chat</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                {chatFlow!=="idle"&&chatFlow!=="done"&&(
                  <div style={{background:"#E1F5EE",color:"#085041",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>
                    {chatFlow==="style"?"🎨 Style":chatFlow==="budget"?"💰 Budget":chatFlow==="dims"?"📐 Dims":chatFlow==="products"?"🛍️ Products":"🏠 Design"}
                  </div>
                )}
                {chatFlow==="idle"&&usePersonalizedChat&&<div style={{background:"#FFF3DC",color:"#BA7517",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>✨ Personalized</div>}
                <button onClick={()=>setShowStyleSetup(true)} style={{background:"#f0f0f0",border:"none",borderRadius:20,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>🎨 Style</button>
                {chatFlow!=="idle"&&(
                  <button onClick={()=>{setChatFlow("idle");setChatSession({});}} style={{background:"#fee",color:"#c00",border:"none",borderRadius:20,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>✕ Reset</button>
                )}
              </div>
            </div>

            {/* Quick Start Button — only when idle */}
            {chatFlow==="idle"&&(
              <button onClick={()=>{
                setChatFlow("style");
                setMessages(m=>[...m,{role:"ai",text:"🏠 Let's design your perfect room!

First, what is your preferred style?

1️⃣ Modern
2️⃣ Classic
3️⃣ Traditional
4️⃣ Luxury
5️⃣ Minimalist

Type a number or the style name!"}]);
              }} style={{width:"100%",background:"linear-gradient(135deg,#BA7517,#E8960A)",color:"white",border:"none",borderRadius:10,padding:"10px 16px",cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                🏠 Design My Room — AI Assistant
              </button>
            )}

            {/* Progress bar during flow */}
            {chatFlow!=="idle"&&chatFlow!=="done"&&(
              <div style={{display:"flex",gap:4,marginBottom:12}}>
                {["style","budget","dims","products","view2d"].map((f,i)=>(
                  <div key={f} style={{flex:1,height:4,borderRadius:2,background:["style","budget","dims","products","view2d"].indexOf(chatFlow)>=i?"#BA7517":"#e0e0e0"}}/>
                ))}
              </div>
            )}

            {/* Chat messages */}
            <div style={{background:"white",borderRadius:12,padding:12,minHeight:320,maxHeight:400,overflowY:"auto",marginBottom:12}}>
              {messages.map((m,i)=>(
                <div key={i} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                    <div style={{maxWidth:"82%",padding:"10px 14px",borderRadius:12,fontSize:14,lineHeight:1.6,background:m.role==="user"?"#BA7517":"#f0f0f0",color:m.role==="user"?"white":"#333",whiteSpace:"pre-line"}}>
                      {m.text}
                      {m.lang&&m.lang!=="en"&&<div style={{fontSize:10,marginTop:4,opacity:0.6}}>Detected: {m.lang}</div>}
                      {m.personalized&&<div style={{fontSize:10,marginTop:2,color:"#BA7517"}}>✨ Personalized</div>}
                    </div>
                  </div>

                  {/* Product Cards */}
                  {m.products&&m.products.length>0&&(
                    <div style={{marginTop:10}}>
                      <div style={{fontSize:12,color:"#BA7517",fontWeight:700,marginBottom:8}}>🛍️ Recommended Products:</div>
                      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6}}>
                        {m.products.map((p,pi)=>(
                          <div key={pi} style={{flexShrink:0,width:130,background:"#f8f9fa",borderRadius:10,padding:10,border:"1px solid #eee",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                            {p.image_url
                              ?<img src={p.image_url} alt={p.name} style={{width:"100%",height:70,objectFit:"cover",borderRadius:6}} onError={e=>{e.target.onerror=null;e.target.style.display="none";}}/>
                              :<div style={{width:"100%",height:70,background:"#FFF3DC",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🏠</div>
                            }
                            <div style={{fontSize:11,fontWeight:600,marginTop:6,lineHeight:1.3,color:"#222"}}>{p.name}</div>
                            <div style={{fontSize:10,color:"#999",marginTop:2}}>{p.brand}</div>
                            <div style={{color:"#BA7517",fontWeight:700,fontSize:13,marginTop:4}}>₹{Number(p.price).toLocaleString("en-IN")}</div>
                            <button onClick={()=>{addToCart(p);}} style={{width:"100%",marginTop:6,background:"#BA7517",color:"white",border:"none",borderRadius:6,padding:"5px 0",cursor:"pointer",fontSize:11,fontWeight:600}}>+ Add to Cart</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2D View Button */}
                  {m.type==="ask_2d"&&(
                    <div style={{display:"flex",gap:8,marginTop:8}}>
                      <button onClick={()=>{setShowVisualizer(true);setChatFlow("view2d");setMessages(mn=>[...mn,{role:"user",text:"Yes"},{role:"ai",text:"📐 Here's your 2D floor plan! After viewing, type YES if you'd like a 3D view too.",type:"ask_3d"}]);}} style={{flex:1,background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"8px",cursor:"pointer",fontSize:12,fontWeight:600}}>
                        ✅ Yes, Show 2D Plan
                      </button>
                      <button onClick={()=>{setChatFlow("done");setMessages(mn=>[...mn,{role:"user",text:"No"},{role:"ai",text:"No problem! You can add the products to cart and we'll help with installation. 🏠"}]);}} style={{flex:1,background:"#f0f0f0",color:"#555",border:"none",borderRadius:8,padding:"8px",cursor:"pointer",fontSize:12}}>
                        ❌ No Thanks
                      </button>
                    </div>
                  )}

                  {/* 3D View Button */}
                  {m.type==="ask_3d"&&(
                    <div style={{display:"flex",gap:8,marginTop:8}}>
                      <button onClick={()=>{setChatFlow("done");setMessages(mn=>[...mn,{role:"user",text:"Yes"},{role:"ai",text:"🚀 3D visualization is coming in the next update! For now, explore the 2D floor plan. Thank you for using HomeBot AI! 🏠✨"}]);}} style={{flex:1,background:"#0C447C",color:"white",border:"none",borderRadius:8,padding:"8px",cursor:"pointer",fontSize:12,fontWeight:600}}>
                        ✅ Yes, Show 3D
                      </button>
                      <button onClick={()=>{setChatFlow("done");setMessages(mn=>[...mn,{role:"user",text:"No"},{role:"ai",text:"Great! Your design is ready. Add products to cart and our team will help with installation. 🏠"}]);}} style={{flex:1,background:"#f0f0f0",color:"#555",border:"none",borderRadius:8,padding:"8px",cursor:"pointer",fontSize:12}}>
                        ❌ No Thanks
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {loading&&(
                <div style={{display:"flex",justifyContent:"flex-start",marginBottom:10}}>
                  <div style={{background:"#f0f0f0",padding:"10px 14px",borderRadius:12,fontSize:14,display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{animation:"pulse 1s infinite"}}>⏳</span> HomeBot AI is thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{display:"flex",gap:8}}>
              <input
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&sendMessage()}
                placeholder={
                  chatFlow==="style"?"Type style number or name (e.g. 1 or Modern)...":
                  chatFlow==="budget"?"Enter budget (e.g. 50000 or 1 lakh)...":
                  chatFlow==="dims"?"Enter room size (e.g. 12 by 10 feet height 9)...":
                  chatFlow==="products"?"Type YES to see 2D floor plan...":
                  chatFlow==="view2d"?"Type YES for 3D view or NO to finish...":
                  "Chat freely or say 'design my room'..."
                }
                style={{flex:1,padding:"10px 14px",borderRadius:8,border:"1px solid #ddd",fontSize:13,outline:"none"}}
              />
              <button onClick={sendMessage} style={{background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"10px 16px",cursor:"pointer",fontSize:16}}>➤</button>
            </div>
            <div style={{fontSize:11,color:"#888",marginTop:6,textAlign:"center"}}>
              {chatFlow==="idle"?"Try: "design my room" or "मुझे बाथरूम डिज़ाइन करना है"":
               chatFlow==="style"?"Choose your preferred interior style":
               chatFlow==="budget"?"Enter your renovation budget":
               chatFlow==="dims"?"Share your room measurements":
               chatFlow==="products"?"Products ready! View 2D floor plan?":
               "🏠 Room design in progress..."}
            </div>
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
                        <div key={p.id} style={{flexShrink:0,width:130,background:"white",borderRadius:10,padding:10,cursor:"pointer",border:"1px solid #eee"}} onClick={()=>{setSelectedProduct(p);setScreen("product_detail");}}>
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
                  <div onClick={()=>setShowLoyalty(true)} style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:6,background:"#FFF3DC",border:"1px solid #BA7517",borderRadius:20,padding:"6px 16px",cursor:"pointer"}}>
                    <span style={{fontSize:16}}>🏆</span>
                    <span style={{fontWeight:700,color:"#BA7517",fontSize:14}}>{loyaltyPoints} Points</span>
                  </div>
                  <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12,flexWrap:"wrap"}}>
                    <button onClick={()=>setEditProfile(true)} style={{background:"#BA7517",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13}}>✏️ Edit</button>
                    <button onClick={()=>setUploadScreen(true)} style={{background:"#E6F1FB",color:"#0C447C",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13}}>📸 Images</button>
                    <button onClick={()=>setShowStyleSetup(true)} style={{background:"#FFF3DC",color:"#BA7517",border:"1px solid #BA7517",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13}}>🎨 Style</button>
                    <button onClick={()=>setScreen("wishlist")} style={{background:"#FCEBEB",color:"#c00",border:"1px solid #fcc",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13}}>❤️ Wishlist ({wishlistIds.size})</button>
                    <button onClick={()=>setShowBudgetPlanner(true)} style={{background:"#E1F5EE",color:"#085041",border:"1px solid #1D9E75",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13}}>💰 Budget Plan</button>
                    <button onClick={()=>setScreen("orders")} style={{background:"#EEEDFE",color:"#26215C",border:"1px solid #26215C",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13}}>📦 Orders</button>
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
                <div style={{fontSize:13,color:"#BA7517",fontWeight:600,marginTop:6}}>🏆 Points earned on this order!</div>
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

                {/* Day 35 — Redeem Loyalty Points (NEW) */}
                <div style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{fontWeight:600,fontSize:14}}>🏆 Use Loyalty Points</div>
                    <span style={{fontSize:12,color:"#888"}}>Balance: {loyaltyPoints} pts</span>
                  </div>
                  {pointsDiscount<=0?(
                    <div style={{display:"flex",gap:8}}>
                      <input type="number" min={0} max={loyaltyPoints} value={usePointsAtCheckout||""} onChange={e=>setUsePointsAtCheckout(Number(e.target.value))} placeholder="Enter points to redeem" style={{flex:1,padding:"10px 14px",borderRadius:8,border:"1px solid #ddd",fontSize:13,outline:"none"}}/>
                      <button onClick={applyPointsAtCheckout} disabled={redeemingPoints||loyaltyPoints===0} style={{background:redeemingPoints||loyaltyPoints===0?"#ccc":"#BA7517",color:"white",border:"none",borderRadius:8,padding:"10px 16px",cursor:redeemingPoints||loyaltyPoints===0?"not-allowed":"pointer",fontSize:13,fontWeight:600}}>{redeemingPoints?"...":"Redeem"}</button>
                    </div>
                  ):(
                    <div style={{background:"#FFF3DC",borderRadius:8,padding:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:13,color:"#BA7517",fontWeight:600}}>🏆 {usePointsAtCheckout} points redeemed</div>
                        <div style={{fontSize:12,color:"#BA7517",marginTop:2}}>You save ₹{pointsDiscount.toFixed(0)}</div>
                      </div>
                      <button onClick={removePointsDiscount} style={{background:"#FCEBEB",color:"#c00",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:12}}>Remove</button>
                    </div>
                  )}
                </div>

                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:14}}><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:14,color:"#666"}}><span>GST (18%)</span><span>₹{gst.toLocaleString("en-IN")}</span></div>
                {couponData&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:14,color:"#085041",fontWeight:600}}><span>🎟️ Coupon Discount</span><span>- ₹{parseInt(couponData.discount).toLocaleString("en-IN")}</span></div>}
                {pointsDiscount>0&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:14,color:"#BA7517",fontWeight:600}}><span>🏆 Points Discount</span><span>- ₹{pointsDiscount.toFixed(0)}</span></div>}
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