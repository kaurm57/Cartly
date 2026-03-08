import { theme, inputStyle } from "../theme";
import BottomNav from "../components/BottomNav";

// 3-point snapping brand slider
// brandSlider values: 0 = generic, 50 = mid, 100 = brand
const BRAND_POINTS = [
  { value: 0,   emoji: "🟢", label: "No Name / Generic",  sub: "Store brands only", bg: theme.greenLight, border: theme.green,     text: theme.greenDark },
  { value: 50,  emoji: "🟡", label: "Mixed",     sub: "Mix of brands",     bg: theme.greenLight, border: theme.greenMid,  text: theme.greenDark },
  { value: 100, emoji: "🔵", label: "Brand",     sub: "Name brands",       bg: theme.greenLight, border: theme.greenDark, text: theme.greenDark },
];

function snapToNearest(raw) {
  const dists = BRAND_POINTS.map(p => Math.abs(p.value - raw));
  const minIdx = dists.indexOf(Math.min(...dists));
  return BRAND_POINTS[minIdx].value;
}

const BrandSlider = ({ value, onChange }) => {
  const active = BRAND_POINTS.find(p => p.value === value) || BRAND_POINTS[1];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: theme.charcoal }}>Brand Preference</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: active.text, background: active.bg, border: `1.5px solid ${active.border}`, padding: "2px 12px", borderRadius: 20 }}>
          {active.emoji} {active.label}
        </span>
      </div>

      {/* Slider track with 3 snap points */}
      <div style={{ position: "relative", height: 36, display: "flex", alignItems: "center", marginBottom: 8 }}>
        {/* Track background */}
        <div style={{ position: "absolute", left: 0, right: 0, height: 6, borderRadius: 3, background: theme.grayBorder }} />
        {/* Filled track */}
        <div style={{
          position: "absolute", left: 0, height: 6, borderRadius: 3,
          width: `${value}%`,
          background: `linear-gradient(90deg, #4caf50, ${active.border})`,
          transition: "width 0.15s, background 0.15s",
        }} />
        {/* Tick marks at 0%, 50%, 100% */}
        {BRAND_POINTS.map(p => (
          <div
            key={p.value}
            onClick={() => onChange(p.value)}
            style={{
              position: "absolute",
              left: `calc(${p.value}% - 8px)`,
              width: 16, height: 16, borderRadius: "50%",
              background: value >= p.value ? active.border : theme.white,
              border: `2.5px solid ${value >= p.value ? active.border : theme.grayBorder}`,
              cursor: "pointer",
              zIndex: 2,
              transition: "all 0.15s",
              boxShadow: value === p.value ? `0 0 0 3px ${active.border}44` : "none",
            }}
          />
        ))}
        {/* Invisible native range input for drag support */}
        <input
          type="range" min={0} max={100} step={1} value={value}
          onChange={e => onChange(snapToNearest(+e.target.value))}
          style={{
            position: "absolute", left: 0, right: 0, width: "100%",
            opacity: 0, cursor: "pointer", height: 36, zIndex: 3, margin: 0,
          }}
        />
      </div>

      {/* Labels under the 3 points */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {BRAND_POINTS.map(p => (
          <div key={p.value} style={{ textAlign: p.value === 0 ? "left" : p.value === 100 ? "right" : "center", flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: value === p.value ? 800 : 600, color: value === p.value ? active.text : theme.gray }}>
              {p.label}
            </div>
            <div style={{ fontSize: 10, color: theme.gray }}>{p.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function CartPage({ setPage, cartItems = [], setCartItems, budget, setBudget, brandSlider, setBrandSlider }) {
  const removeItem = (id) => setCartItems(prev => prev.filter(i => i.id !== id));
  const updateQty = (id, delta) => setCartItems(prev =>
    prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
  );

  const active = BRAND_POINTS.find(p => p.value === brandSlider) || BRAND_POINTS[1];

  return (
    <div style={{
      fontFamily: "'Nunito', sans-serif",
      minHeight: "100vh",
      width: "100vw",
      background: theme.cream,
      paddingBottom: 80,
      boxSizing: "border-box",
      overflowX: "hidden",
    }}>

      {/* Top bar */}
      <div style={{
        background: theme.white, borderBottom: `1.5px solid ${theme.grayBorder}`,
        padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50, width: "100%", boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 46, height: 46, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <img onClick={() => setPage("landing")} src="https://res.cloudinary.com/dk5bcgmky/image/upload/v1772925782/Cartly_Logo_h7qgil.png" style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} />
          </div>
          <span onClick={() => setPage("landing")} style={{ fontSize: 22, fontFamily: "'Nunito', sans-serif", fontWeight: 900, color: theme.charcoal, letterSpacing: "-0.3px", cursor: "pointer" }}>Cartly</span>
          <div style={{ width: 1, height: 32, background: theme.grayBorder, marginLeft: 4 }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h2 style={{ margin: 0, fontSize: 16, fontFamily: "'Nunito', sans-serif", fontWeight: 900, color: theme.charcoal }}>Your Cart</h2>
            <p style={{ margin: "-2px 0 0", fontSize: 12, color: theme.gray }}>{cartItems.length} items</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ padding: "24px 28px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 22, width: "100%", boxSizing: "border-box" }}>

        {/* Left — items */}
        <div>
          <div style={{ background: theme.white, borderRadius: 16, border: `1.5px solid ${theme.grayBorder}`, overflow: "hidden" }}>
            <div style={{ padding: "14px 22px", borderBottom: `1px solid ${theme.grayLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: theme.gray, textTransform: "uppercase", letterSpacing: "0.05em" }}>Cart Items</span>
              <span style={{ fontSize: 12, color: theme.gray }}>{cartItems.length} items</span>
            </div>

            {cartItems.length === 0 ? (
              <div style={{ padding: "52px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
                <p style={{ color: theme.gray, fontSize: 14, margin: 0 }}>Your cart is empty.</p>
                <button onClick={() => setPage("home")} style={{
                  marginTop: 14, background: theme.greenLight, color: theme.greenDark,
                  border: `1.5px solid ${theme.greenMid}`, borderRadius: 10,
                  padding: "9px 20px", fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}>← Browse items</button>
              </div>
            ) : (
              cartItems.map((item, i) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 22px", borderTop: i > 0 ? `1px solid ${theme.grayLight}` : "none" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: theme.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{item.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: theme.charcoal }}>{item.name}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: theme.cream, borderRadius: 10, padding: "4px 8px", border: `1.5px solid ${theme.grayBorder}` }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: theme.white, color: theme.charcoal, fontWeight: 900, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>−</button>
                    <span style={{ minWidth: 28, textAlign: "center", fontWeight: 900, fontSize: 15, color: theme.charcoal }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: theme.greenDark, color: theme.white, fontWeight: 900, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(102,156,53,0.3)" }}>+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: theme.gray, lineHeight: 1 }}>×</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right — budget + preferences */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ background: theme.white, borderRadius: 16, padding: "22px", border: `1.5px solid ${theme.grayBorder}` }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 900, color: theme.charcoal }}>💰 Weekly Budget</h3>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: theme.gray, fontSize: 15 }}>$</span>
              <input value={budget} onChange={e => setBudget(e.target.value)}
                placeholder="0.00" type="number"
                style={{ ...inputStyle, paddingLeft: 28 }} />
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 11, color: theme.gray }}>Cartly will keep your cart within budget if possible</p>
          </div>

          <div style={{ background: theme.white, borderRadius: 16, padding: "22px", border: `1.5px solid ${theme.grayBorder}` }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 900, color: theme.charcoal }}>🎚 Preferences</h3>
            <p style={{ margin: "0 0 20px", fontSize: 11, color: theme.gray }}>These shape which products and stores get picked when you optimize</p>

            <BrandSlider value={brandSlider} onChange={setBrandSlider} />

            {/* Live preview */}
            <div style={{ marginTop: 16, background: active.bg, borderRadius: 10, padding: "10px 14px", border: `1.5px solid ${active.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: active.text, marginBottom: 3 }}>Your profile:</div>
              <div style={{ fontSize: 11, color: active.text }}>
                {brandSlider === 0
                  ? "No Name & store brands — always cheapest"
                  : brandSlider === 50
                  ? "Mix of brands and generics"
                  : "Name brands preferred (Kraft, Neilson & more)"}
              </div>
            </div>
          </div>

          <button onClick={() => setPage("optimize")} style={{
            width: "100%", padding: "14px 0",
            background: `linear-gradient(135deg, ${theme.green}, ${theme.greenDark})`,
            color: theme.white, border: "none", borderRadius: 13,
            fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 15,
            cursor: "pointer", boxShadow: `0 6px 20px rgba(177,221,140,0.45)`,
          }}>
            Optimize My Cart ✦
          </button>
        </div>
      </div>

      <BottomNav setPage={setPage} activePage="cart" />
    </div>
  );
}