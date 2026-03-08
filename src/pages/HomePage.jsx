import { useState, useEffect, useRef } from "react";
import { theme, mockDeals, allCategories, categoryItems } from "../theme";
import BottomNav from "../components/BottomNav";


// ── Store color map ────────────────────────────────────────────────────────────
const STORE_COLORS = {
  "no frills":   "#e8a800",
  "walmart":     "#0071CE",
  "loblaws":     "#C8102E",
  "metro":       "#005B99",
  "costco":      "#E31837",
  "food basics": "#006B3F",
};

function getStoreColor(name) {
  const lower = name.toLowerCase();
  for (const [key, color] of Object.entries(STORE_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return "#3a7d44";
}

function metersToLabel(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}

// ── Search pool ────────────────────────────────────────────────────────────────
function buildSearchPool() {
  const pool = [];
  const seen = new Set();
  Object.entries(categoryItems).forEach(([category, items]) => {
    items.forEach(item => {
      if (!seen.has(item.id)) { seen.add(item.id); pool.push({ ...item, category }); }
    });
  });
  mockDeals.forEach(deal => {
    if (!seen.has(deal.id)) {
      seen.add(deal.id);
      pool.push({ id: deal.id, name: deal.name, emoji: deal.emoji, price: parseFloat(deal.price.replace(/[^0-9.]/g, "")), store: deal.store, category: "Deals" });
    }
  });
  return pool;
}
const SEARCH_POOL = buildSearchPool();

function searchItems(query) {
  if (!query || query.trim().length < 1) return [];
  const q = query.toLowerCase().trim();
  return SEARCH_POOL.filter(item =>
    item.name.toLowerCase().includes(q) ||
    (item.category && item.category.toLowerCase().includes(q)) ||
    (item.store && item.store.toLowerCase().includes(q))
  ).slice(0, 12);
}

// ── Preferred Stores component ─────────────────────────────────────────────────
function PreferredStores({ setPage }) {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cartly_preferences");
      if (raw) {
        const prefs = JSON.parse(raw);
        if (prefs.selected_stores?.length) setStores(prefs.selected_stores);
      }
    } catch {}
  }, []);

  if (stores.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ fontSize: 13, color: theme.gray, marginBottom: 10 }}>No preferred stores set yet.</div>
        <button onClick={() => setPage("profile")} style={{ background: "none", border: "none", outline: "none", color: theme.greenDark, fontSize: 12, cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textDecoration: "underline", padding: 0 }}>
          Set store preferences in Profile →
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {Array.from({ length: 4 }).map((_, i) => {
          const store = stores[i];
          const color = store ? getStoreColor(store.name) : "#e0e0e0";
          return store ? (
            <div key={store.id} style={{ background: `${color}08`, borderRadius: 12, padding: "14px", border: `1.5px solid ${color}30`, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: color }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: theme.charcoal }}>{store.name}</div>
                <div style={{ fontSize: 11, color: theme.gray }}>{store.distance_m ? metersToLabel(store.distance_m) + " away" : "Preferred store"}</div>
              </div>
            </div>
          ) : (
            <div key={i} style={{ background: "#f9f9f9", borderRadius: 12, padding: "14px", border: "1.5px dashed #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 64 }}>
              <span style={{ fontSize: 11, color: "#ccc", fontWeight: 600 }}>Empty slot</span>
            </div>
          );
        })}
      </div>
      <button onClick={() => setPage("profile")} style={{ marginTop: 12, background: "none", border: "none", outline: "none", color: theme.gray, fontSize: 12, cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontWeight: 600, textDecoration: "underline", padding: 0 }}>
        Change store preferences in Profile →
      </button>
    </>
  );
}

// ── Main HomePage ──────────────────────────────────────────────────────────────
export default function HomePage({ setPage, user, cartItems = [], setCartItems }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchWrapRef = useRef(null);

  const searchResults = searchItems(searchQuery);
  const showDropdown = searchFocused && searchQuery.length > 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addToCart = (item) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
    setShowCartSidebar(true);
  };

  const updateQty = (id, delta) => {
    setCartItems(prev =>
      prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
          .filter(i => i.qty > 0)
    );
  };

  const removeFromCart = (id) => setCartItems(prev => prev.filter(i => i.id !== id));
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  const visibleCategories = showAllCategories ? allCategories : allCategories.slice(0, 8);
  const browsingItems = activeCategory ? (categoryItems[activeCategory] || []) : [];

  // Click result row → open that category
  const handleSearchSelect = (item) => {
    const category = Object.entries(categoryItems).find(([, items]) => items.some(i => i.id === item.id))?.[0];
    if (category) setActiveCategory(category);
    setSearchQuery("");
    setSearchFocused(false);
  };

  // + Add in dropdown
  const handleSearchAdd = (item, e) => {
    e.stopPropagation();
    addToCart(item);
  };

  const QtyControl = ({ item }) => {
    const inCart = cartItems.find(i => i.id === item.id);
    if (!inCart) {
      return (
        <button onClick={() => addToCart(item)} style={{ background: theme.green, color: theme.white, border: "none", outline: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Add</button>
      );
    }
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => updateQty(item.id, -1)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", outline: "none", background: theme.grayLight, color: theme.charcoal, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
        <span style={{ minWidth: 18, textAlign: "center", fontWeight: 800, fontSize: 14, color: theme.charcoal }}>{inCart.qty}</span>
        <button onClick={() => updateQty(item.id, 1)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", outline: "none", background: theme.greenLight, color: theme.greenDark, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", width: "100vw", background: theme.cream, paddingBottom: 80, boxSizing: "border-box", overflowX: "hidden" }}>

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div style={{ background: theme.white, borderBottom: `1.5px solid ${theme.grayBorder}`, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 46, height: 46, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <img onClick={() => setPage("landing")} src="https://res.cloudinary.com/dk5bcgmky/image/upload/v1772925782/Cartly_Logo_h7qgil.png" style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} />
          </div>
          <span onClick={() => setPage("landing")} style={{ fontSize: 22, fontFamily: "'Nunito', sans-serif", fontWeight: 900, color: theme.charcoal, letterSpacing: "-0.3px", cursor: "pointer" }}>Cartly</span>
          <div style={{ width: 1, height: 32, background: theme.grayBorder, marginLeft: 4 }} />
          <div>
            <p style={{ margin: 0, fontSize: 12, color: theme.gray }}>Hello,</p>
<h2 style={{ margin: "-4px 0 0", fontSize: 16, fontFamily: "'Nunito', sans-serif", fontWeight: 900, color: theme.charcoal }}>{user?.nickname || user?.name || "there"} 👋</h2>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

          {/* ── Search bar ── */}
          <div ref={searchWrapRef} style={{ position: "relative" }}>
            <div style={{
              background: searchFocused ? theme.white : theme.cream,
              border: `1.5px solid ${searchFocused ? theme.green : theme.grayBorder}`,
              borderRadius: showDropdown ? "10px 10px 0 0" : 10,
              padding: "9px 14px",
              display: "flex", alignItems: "center", gap: 8,
              width: searchFocused ? 340 : 240,
              transition: "width 0.2s, border-color 0.15s",
              boxSizing: "border-box",
              boxShadow: searchFocused ? `0 0 0 3px ${theme.green}22` : "none",
            }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>🔍</span>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder={searchFocused ? "Search items, categories, stores…" : "Search groceries, deals..."}
                style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, color: theme.charcoal, width: "100%", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}
              />
              {searchQuery.length > 0 && (
                <span onClick={() => setSearchQuery("")} style={{ cursor: "pointer", color: theme.gray, fontSize: 17, flexShrink: 0, lineHeight: 1, userSelect: "none" }}>×</span>
              )}
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0,
                background: theme.white,
                border: `1.5px solid ${theme.green}`,
                borderTop: `1px solid ${theme.grayBorder}`,
                borderRadius: "0 0 12px 12px",
                boxShadow: "0 10px 28px rgba(0,0,0,0.11)",
                zIndex: 200, maxHeight: 380, overflowY: "auto",
              }}>
                {searchResults.length === 0 ? (
                  <div style={{ padding: "20px 18px", color: theme.gray, fontSize: 13, textAlign: "center" }}>
                    No results for <strong>"{searchQuery}"</strong>
                  </div>
                ) : (
                  <>
                    <div style={{ padding: "8px 16px 4px", fontSize: 11, fontWeight: 700, color: theme.gray, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                    </div>
                    {searchResults.map((item, i) => {
                      const inCart = cartItems.find(c => c.id === item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSearchSelect(item)}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderTop: i > 0 ? `1px solid ${theme.grayLight}` : "none", cursor: "pointer", background: "transparent", transition: "background 0.1s" }}
                          onMouseEnter={e => e.currentTarget.style.background = theme.cream}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <div style={{ width: 36, height: 36, borderRadius: 9, background: theme.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                            {item.emoji}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: theme.charcoal, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: theme.gray, marginTop: 1 }}>{item.category}{item.store ? ` · ${item.store}` : ""}</div>
                          </div>
                          <button
                            onClick={e => handleSearchAdd(item, e)}
                            style={{ background: inCart ? theme.greenLight : theme.green, color: inCart ? theme.greenDark : theme.white, border: `1.5px solid ${inCart ? theme.green : "transparent"}`, borderRadius: 8, padding: "5px 12px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap", transition: "all 0.15s" }}
                          >
                            {inCart ? `✓ ×${inCart.qty}` : "+ Add"}
                          </button>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>

          <button onClick={() => setCartItems([])} style={{ background: theme.greenLight, color: theme.greenDark, border: `1.5px solid ${theme.greenMid}`, borderRadius: 10, outline: "none", padding: "9px 16px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>🛒 New Cart</button>
          {cartCount > 0 && (
            <button onClick={() => setShowCartSidebar(!showCartSidebar)} style={{ background: theme.green, border: "none", outline: "none", borderRadius: 10, padding: "9px 16px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", color: theme.white, display: "flex", alignItems: "center", gap: 6 }}>🛒 {cartCount} items</button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", width: "100%", boxSizing: "border-box", alignItems: "flex-start" }}>

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <div style={{ flex: 1, padding: "24px 28px", minWidth: 0, boxSizing: "border-box" }}>

          {/* Categories */}
          <div style={{ background: theme.white, borderRadius: 16, padding: "20px 22px", border: `1.5px solid ${theme.grayBorder}`, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: theme.charcoal }}>Grocery Categories</h3>
              <span onClick={() => setShowAllCategories(!showAllCategories)} style={{ fontSize: 12, color: theme.greenDark, fontWeight: 700, cursor: "pointer" }}>
                {showAllCategories ? "Show less ↑" : "See all →"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10 }}>
              {visibleCategories.map(c => (
                <div key={c.label} onClick={() => setActiveCategory(activeCategory === c.label ? null : c.label)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "18px 8px", borderRadius: 14, cursor: "pointer", background: activeCategory === c.label ? theme.greenLight : theme.cream, border: `1.5px solid ${activeCategory === c.label ? theme.green : theme.grayBorder}`, transition: "all 0.15s" }}>
                  <span style={{ fontSize: 32 }}>{c.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: activeCategory === c.label ? theme.greenDark : theme.gray, textAlign: "center" }}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category browse */}
          {activeCategory && browsingItems.length > 0 && (
            <div style={{ background: theme.white, borderRadius: 16, padding: "20px 22px", border: `1.5px solid ${theme.grayBorder}`, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: theme.charcoal }}>{activeCategory}</h3>
                <span onClick={() => setActiveCategory(null)} style={{ fontSize: 12, color: theme.gray, cursor: "pointer" }}>✕ Close</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {browsingItems.map(item => (
                  <div key={item.id} style={{ background: theme.cream, borderRadius: 14, padding: "16px", border: `1.5px solid ${theme.grayBorder}`, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ width: 46, height: 46, borderRadius: 12, background: theme.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{item.emoji}</div>
                      <span style={{ fontSize: 11, color: theme.gray, fontWeight: 600 }}>{item.store}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: theme.charcoal }}>{item.name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <QtyControl item={item} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personalized flyer */}
          <div style={{ background: theme.white, borderRadius: 16, padding: "20px 22px", border: `1.5px solid ${theme.grayBorder}`, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: theme.charcoal }}>🗞 Personalized Flyer</h3>
              <span style={{ fontSize: 11, color: theme.gray, background: theme.greenLight, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>Based on your recent purchases</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {mockDeals.map(deal => {
                const dealItem = { id: deal.id, name: deal.name, emoji: deal.emoji, price: parseFloat(deal.price.replace(/[^0-9.]/g, "")), unit: "", store: deal.store };
                return (
                  <div key={deal.id} style={{ background: theme.cream, borderRadius: 14, padding: "14px", border: `1.5px solid ${theme.grayBorder}`, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{deal.emoji}</div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: theme.greenDark, background: theme.greenMid, borderRadius: 6, padding: "2px 7px" }}>{deal.savings}</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: theme.charcoal }}>{deal.name}</div>
                      <div style={{ fontSize: 11, color: theme.gray, marginTop: 1 }}>{deal.store}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 900, fontSize: 16, color: theme.greenDark }}>{deal.price}</span>
                      <QtyControl item={dealItem} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preferred stores — live from localStorage */}
          <div style={{ background: theme.white, borderRadius: 16, padding: "20px 22px", border: `1.5px solid ${theme.grayBorder}` }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 900, color: theme.charcoal }}>🏪 Your Preferred Stores</h3>
            <PreferredStores setPage={setPage} />
          </div>

        </div>

        {/* ── Cart sidebar ──────────────────────────────────────────────────── */}
        {showCartSidebar && cartCount > 0 && (
          <div style={{ width: 300, flexShrink: 0, background: theme.white, border: `1.5px solid ${theme.grayBorder}`, padding: "20px", position: "sticky", borderRadius: "16px", marginTop: "22px", marginRight: "5px", overflowY: "auto", boxSizing: "border-box", alignSelf: "flex-start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: theme.charcoal }}>🛒 Cart</h3>
              <span onClick={() => setShowCartSidebar(false)} style={{ cursor: "pointer", color: theme.gray, fontSize: 18 }}>✕</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cartItems.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", borderRadius: 12, background: theme.cream, border: `1px solid ${theme.grayBorder}` }}>
                  <span style={{ fontSize: 22 }}>{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: theme.charcoal }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: theme.gray }}>x{item.qty}</div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", outline: "none", color: theme.gray, cursor: "pointer", fontSize: 16 }}>×</button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1.5px solid ${theme.grayBorder}`, display: "flex", justifyContent: "space-between", marginBottom: 14 }} />
            <button onClick={() => setPage("cart")} style={{ width: "100%", padding: "12px 0", background: `linear-gradient(135deg, ${theme.green}, ${theme.greenDark})`, color: theme.white, border: "none", outline: "none", borderRadius: 12, fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
              View Full Cart →
            </button>
          </div>
        )}
      </div>

      <BottomNav setPage={setPage} activePage="home" />
    </div>
  );
}