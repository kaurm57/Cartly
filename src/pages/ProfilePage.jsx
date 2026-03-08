import { useState, useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { theme } from "../theme";
import BottomNav from "../components/BottomNav";

// ── Mapbox token ───────────────────────────────────────────────────────────────
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// ── localStorage helpers ───────────────────────────────────────────────────────
const STORAGE_KEY = "cartly_preferences";

function saveToLocalStorage(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ── Constants ──────────────────────────────────────────────────────────────────
const RADIUS_OPTIONS = [1000, 2000, 5000, 10000, 15000];

function metersToLabel(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}

function buildCircleGeoJSON(center, radiusMeters, steps = 64) {
  const coords = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dx = radiusMeters / 111320;
    const dy = radiusMeters / (111320 * Math.cos((center[1] * Math.PI) / 180));
    coords.push([center[0] + dy * Math.cos(angle), center[1] + dx * Math.sin(angle)]);
  }
  return { type: "Feature", geometry: { type: "Polygon", coordinates: [coords] } };
}

function formatAddress(result) {
  const a = result.address || {};
  const parts = [];

  if (a.house_number && a.road) {
    parts.push(`${a.house_number} ${a.road}`);
  } else if (a.road) {
    parts.push(a.road);
  } else if (a.pedestrian || a.footway) {
    parts.push(a.pedestrian || a.footway);
  }

  if (parts.length === 0 && (a.neighbourhood || a.suburb)) {
    parts.push(a.neighbourhood || a.suburb);
  }

  const city = a.city || a.town || a.village || a.municipality || a.county;
  if (city) parts.push(city);

  const provinceMap = {
    "Ontario": "ON", "Quebec": "QC", "British Columbia": "BC",
    "Alberta": "AB", "Manitoba": "MB", "Saskatchewan": "SK",
    "Nova Scotia": "NS", "New Brunswick": "NB",
    "Newfoundland and Labrador": "NL", "Prince Edward Island": "PE",
  };
  const province = a.state || a.province;
  if (province) parts.push(provinceMap[province] || province);

  return parts.length > 0
    ? parts.join(", ")
    : result.display_name.split(",").slice(0, 3).join(",").trim();
}

const MAP_CSS = `
  @keyframes cartly-pulse {
    0% { transform: translate(-50%,-50%) scale(0.5); opacity: 1; }
    100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
  }
  .cartly-user-marker { position: relative; width: 20px; height: 20px; }
  .cartly-user-dot {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 14px; height: 14px; border-radius: 50%;
    background: #3a7d44; border: 2px solid #fff; z-index: 2;
    box-shadow: 0 0 10px #3a7d4488;
  }
  .cartly-user-pulse {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 36px; height: 36px; border-radius: 50%;
    background: #3a7d4422; border: 1px solid #3a7d4455;
    animation: cartly-pulse 2s ease-out infinite;
  }
  .cartly-store-marker {
    width: 30px; height: 30px; border-radius: 50%;
    background: #fff; border: 2px solid #c8e6c9;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 14px; transition: all .2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  .cartly-store-marker:hover { border-color: #3a7d44; transform: scale(1.15); }
  .cartly-store-marker.active {
    border-color: #3a7d44; background: #f0faf0;
    transform: scale(1.25); box-shadow: 0 0 0 4px #3a7d4433;
  }
  .cartly-popup .mapboxgl-popup-content {
    background: #fff !important;
    border: 1.5px solid #e8f5e9 !important;
    border-radius: 12px !important; padding: 0 !important;
    box-shadow: 0 6px 24px rgba(0,0,0,0.12) !important;
  }
  .cartly-popup .mapboxgl-popup-tip { border-top-color: #e8f5e9 !important; }
  .cartly-popup-inner {
    padding: 10px 14px; display: flex; flex-direction: column; gap: 2;
    font-family: 'Nunito', sans-serif;
  }
  .cartly-popup-inner strong { color: #1a1a2e; font-size: 13px; font-weight: 800; }
  .cartly-popup-inner span { color: #3a7d44; font-size: 11px; font-weight: 600; }
  .cartly-popup-inner em { color: #888; font-size: 11px; font-style: normal; }
  .mapboxgl-ctrl-group { border-radius: 10px !important; overflow: hidden; }
`;

// ── Address Search ─────────────────────────────────────────────────────────────
function AddressSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setResults([]);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim() || val.length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("format", "json");
        url.searchParams.set("q", val);
        url.searchParams.set("limit", "6");
        url.searchParams.set("addressdetails", "1");
        url.searchParams.set("countrycodes", "ca");
        url.searchParams.set("dedupe", "1");
        const resp = await fetch(url.toString(), { headers: { "User-Agent": "CartlyApp/1.0" } });
        const data = await resp.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const pick = (result) => {
    const label = formatAddress(result);
    onSelect({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) }, label);
    setQuery("");
    setResults([]);
    setFocused(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: focused ? theme.white : theme.cream,
        border: `1.5px solid ${focused ? theme.green : theme.grayBorder}`,
        borderRadius: results.length > 0 ? "10px 10px 0 0" : 10,
        padding: "10px 14px", transition: "border-color 0.15s, background 0.15s",
      }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>🔍</span>
        <input
          value={query}
          onChange={e => search(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search address or neighbourhood…"
          style={{
            flex: 1, border: "none", background: "transparent", outline: "none",
            fontFamily: "'Nunito', sans-serif", fontSize: 13, color: theme.charcoal,
          }}
        />
        {searching
          ? <span style={{ fontSize: 11, color: theme.gray, flexShrink: 0 }}>Searching…</span>
          : query.length > 0
            ? <span onClick={() => { setQuery(""); setResults([]); }}
                style={{ fontSize: 16, color: theme.gray, cursor: "pointer", flexShrink: 0, lineHeight: 1 }}>×</span>
            : null
        }
      </div>

      {results.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0,
          background: theme.white, zIndex: 200,
          border: `1.5px solid ${theme.green}`,
          borderTop: `1px solid ${theme.grayBorder}`,
          borderRadius: "0 0 10px 10px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}>
          {results.map((r, i) => {
            const label = formatAddress(r);
            const city = r.address?.city || r.address?.town || r.address?.village || r.address?.county || "";
            const type = r.type || r.class || "";
            return (
              <div
                key={r.place_id}
                onClick={() => pick(r)}
                style={{
                  padding: "10px 14px", cursor: "pointer",
                  borderBottom: i < results.length - 1 ? `1px solid ${theme.grayBorder}` : "none",
                  transition: "background 0.1s",
                  display: "flex", alignItems: "center", gap: 10,
                }}
                onMouseEnter={e => e.currentTarget.style.background = theme.cream}
                onMouseLeave={e => e.currentTarget.style.background = theme.white}
              >
                <span style={{ fontSize: 14, flexShrink: 0 }}>
                  {r.address?.house_number ? "🏠" :
                   type === "city" || type === "town" || type === "village" ? "🏙️" : "📍"}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: theme.charcoal, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {label}
                  </div>
                  {city && !label.includes(city) && (
                    <div style={{ fontSize: 10, color: theme.gray, marginTop: 1 }}>{city}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ProfilePage({ setPage, user }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const userMarker = useRef(null);
  const storeMarkers = useRef([]);
  const popups = useRef([]);

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [locationShared, setLocationShared] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const [radius, setRadius] = useState(2000);
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [activeStore, setActiveStore] = useState(null);

  const [selectedStores, setSelectedStores] = useState([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Load preferences on mount ──────────────────────────────────────────────
  useEffect(() => {
    const local = loadFromLocalStorage();
    if (local) {
      if (local.selected_stores?.length) setSelectedStores(local.selected_stores);
      if (local.radius_meters) setRadius(local.radius_meters);
      if (local.location_lat && local.location_lng) {
        setLocation({ lat: local.location_lat, lng: local.location_lng });
        setLocationShared(true);
      }
      if (local.location_address) setAddress(local.location_address);
    }
    fetch("/api/user/preferences?user_id=guest")
      .then(r => r.json())
      .then(d => {
        if (d.selected_stores?.length) setSelectedStores(d.selected_stores);
        if (d.radius_meters) setRadius(d.radius_meters);
        if (d.location_lat && d.location_lng) {
          setLocation({ lat: d.location_lat, lng: d.location_lng });
          setLocationShared(true);
        }
        if (d.location_address) setAddress(d.location_address);
      })
      .catch(() => {});
  }, []);

  // ── Auto-save location + radius to localStorage ────────────────────────────
  useEffect(() => {
    if (!location) return;
    const local = loadFromLocalStorage() || {};
    saveToLocalStorage({
      ...local,
      radius_meters: radius,
      location_lat: location?.lat,
      location_lng: location?.lng,
      location_address: address,
    });
  }, [location, radius, address]);

  // ── Init Mapbox ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-79.383, 43.653],
      zoom: 12,
      attributionControl: false,
    });
    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    map.current.on("load", () => {
      map.current.addSource("radius-circle", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.current.addLayer({
        id: "radius-fill", type: "fill", source: "radius-circle",
        paint: { "fill-color": "#3a7d44", "fill-opacity": 0.08 },
      });
      map.current.addLayer({
        id: "radius-border", type: "line", source: "radius-circle",
        paint: { "line-color": "#3a7d44", "line-width": 2, "line-opacity": 0.6 },
      });
    });
  }, []);

  // ── Request GPS ────────────────────────────────────────────────────────────
  const requestLocation = () => {
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        setLocationShared(true);
        setGpsLoading(false);
        setSaved(false);
      },
      () => {
        setGpsError("Location access denied. Check your browser permissions.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Reverse geocode ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!location) return;
    fetch(`/api/reverse-geocode?lat=${location.lat}&lng=${location.lng}`)
      .then(r => r.json())
      .then(d => setAddress(d.address))
      .catch(() => setAddress(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`));
  }, [location]);

  // ── Pan map + user marker ──────────────────────────────────────────────────
  useEffect(() => {
    if (!location || !map.current) return;
    const go = () => {
      if (!map.current.isStyleLoaded()) { setTimeout(go, 100); return; }
      map.current.flyTo({ center: [location.lng, location.lat], zoom: 13, speed: 1.4 });
      if (userMarker.current) userMarker.current.remove();
      const el = document.createElement("div");
      el.className = "cartly-user-marker";
      el.innerHTML = `<div class="cartly-user-dot"></div><div class="cartly-user-pulse"></div>`;
      userMarker.current = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([location.lng, location.lat])
        .addTo(map.current);
    };
    go();
  }, [location]);

  // ── Draw radius circle ─────────────────────────────────────────────────────
  const drawCircle = useCallback(() => {
    if (!location || !map.current || !map.current.getSource("radius-circle")) return;
    const circle = buildCircleGeoJSON([location.lng, location.lat], radius);
    map.current.getSource("radius-circle").setData({ type: "FeatureCollection", features: [circle] });
  }, [location, radius]);
  useEffect(() => { drawCircle(); }, [drawCircle]);

  // ── Fetch stores ───────────────────────────────────────────────────────────
  const fetchStores = useCallback(async () => {
    if (!location) return;
    setStoresLoading(true);
    setActiveStore(null);
    try {
      const r = await fetch(`/api/grocery-stores?lat=${location.lat}&lng=${location.lng}&radius=${radius}`);
      const data = await r.json();
      setStores(data.stores || []);
    } catch {
      setStores([]);
    } finally {
      setStoresLoading(false);
    }
  }, [location, radius]);

  useEffect(() => {
    if (!location) return;
    const t = setTimeout(fetchStores, 600);
    return () => clearTimeout(t);
  }, [location, radius, fetchStores]);

  // ── Place store markers ────────────────────────────────────────────────────
  useEffect(() => {
    storeMarkers.current.forEach(m => m.remove());
    popups.current.forEach(p => p.remove());
    storeMarkers.current = [];
    popups.current = [];
    if (!map.current || !stores.length) return;
    stores.forEach((store, i) => {
      const icons = { supermarket: "🛒", grocery: "🥦", convenience: "🏪" };
      const el = document.createElement("div");
      el.className = "cartly-store-marker";
      el.innerHTML = `<span>${icons[store.shop_type] || "🛒"}</span>`;
      const popup = new mapboxgl.Popup({ offset: 12, closeButton: false, className: "cartly-popup" })
        .setHTML(`
          <div class="cartly-popup-inner">
            <strong>${store.name}</strong>
            <span>${store.shop_type}</span>
            ${store.address ? `<em>${store.address}</em>` : ""}
            <em>${metersToLabel(store.distance_m)} away</em>
          </div>
        `);
      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([store.lng, store.lat])
        .setPopup(popup)
        .addTo(map.current);
      el.addEventListener("click", () => setActiveStore(i));
      storeMarkers.current.push(marker);
      popups.current.push(popup);
    });
  }, [stores]);

  // ── Highlight active marker ────────────────────────────────────────────────
  useEffect(() => {
    storeMarkers.current.forEach((m, i) => {
      const el = m.getElement();
      if (i === activeStore) {
        el.classList.add("active");
        popups.current[i].addTo(map.current);
        map.current.flyTo({ center: [stores[i].lng, stores[i].lat], zoom: 15, speed: 1 });
      } else {
        el.classList.remove("active");
        popups.current[i].remove();
      }
    });
  }, [activeStore, stores]);

  // ── Toggle store selection ─────────────────────────────────────────────────
  const toggleStore = (store) => {
    setSaved(false);
    setSelectedStores(prev => {
      const already = prev.find(s => s.id === store.id);
      if (already) return prev.filter(s => s.id !== store.id);
      if (prev.length >= 4) return prev;
      return [...prev, { id: store.id, name: store.name, distance_m: store.distance_m, shop_type: store.shop_type }];
    });
  };

  // ── Save preferences ───────────────────────────────────────────────────────
  const savePreferences = async () => {
    setSaving(true);
    const prefs = {
      user_id: user?.sub || "guest",
      selected_stores: selectedStores,
      radius_meters: radius,
      location_lat: location?.lat,
      location_lng: location?.lng,
      location_address: address,
    };
    saveToLocalStorage(prefs);
    try {
      await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
    } catch {}
    setSaved(true);
    setSaving(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: theme.cream, paddingBottom: 80 }}>
      <style>{MAP_CSS}</style>

      {/* Top bar */}
      <div style={{
        background: theme.white, borderBottom: `1.5px solid ${theme.grayBorder}`,
        padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50, boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div onClick={() => setPage("landing")} style={{ width: 46, height: 46, borderRadius: 11, overflow: "hidden", cursor: "pointer" }}>
            <img src="https://res.cloudinary.com/dojayxyvx/image/upload/v1772864715/cart_background-removebg-preview_gsl33k.png" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <span onClick={() => setPage("landing")} style={{ fontSize: 22, fontWeight: 900, color: theme.charcoal, cursor: "pointer" }}>Cartly</span>
          <div style={{ width: 1, height: 32, background: theme.grayBorder, marginLeft: 4 }} />
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: theme.charcoal }}>Your Profile</h2>
        </div>
        <button style={{
          background: theme.cream, border: `1.5px solid ${theme.grayBorder}`,
          borderRadius: 10, width: 40, height: 40, display: "flex",
          alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18,
        }}>⚙️</button>
      </div>

      <div style={{ padding: "22px 28px", display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20 }}>

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* User card */}
          <div style={{ background: theme.charcoal, borderRadius: 16, padding: "22px", display: "flex", alignItems: "center", gap: 16 }}>
            {user?.picture ? (
              <img src={user.picture} alt="Profile" style={{ width: 52, height: 52, borderRadius: 14, objectFit: "cover", flexShrink: 0, border: `3px solid ${theme.green}` }} />
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, background: `linear-gradient(135deg, ${theme.green}, ${theme.greenDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👤</div>
            )}
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: theme.white }}>{user?.name || "Guest User"}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{user?.email || ""}</div>
              <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                {[{ val: "$847", label: "Saved" }, { val: "42", label: "Trips" }, { val: "6", label: "Stores" }].map((s, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: theme.green }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Location card */}
          <div style={{ background: theme.white, borderRadius: 16, padding: "20px", border: `1.5px solid ${theme.grayBorder}` }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 900, color: theme.charcoal }}>📍 Your Location</h3>
            {!locationShared ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 12, color: theme.gray, lineHeight: 1.5 }}>
                  Use your current location or search for a specific address.
                </div>
                {gpsError && (
                  <div style={{ fontSize: 11, color: "#e53935", background: "#ffebee", borderRadius: 8, padding: "8px 12px" }}>
                    {gpsError}
                  </div>
                )}
                <button onClick={requestLocation} disabled={gpsLoading} style={{
                  background: `linear-gradient(135deg, ${theme.green}, ${theme.greenDark})`,
                  color: theme.white, border: "none", borderRadius: 10,
                  padding: "11px 0", fontFamily: "'Nunito', sans-serif",
                  fontWeight: 900, fontSize: 13, cursor: gpsLoading ? "wait" : "pointer",
                }}>
                  {gpsLoading ? "⏳ Detecting…" : "📍 Use My Location"}
                </button>
                <AddressSearch onSelect={(coords, label) => {
                  setLocation(coords);
                  setAddress(label);
                  setLocationShared(true);
                  setSaved(false);
                }} />
              </div>
            ) : (
              <div>
                <div style={{
                  background: theme.cream, borderRadius: 10, padding: "10px 14px",
                  border: `1.5px solid ${theme.grayBorder}`, marginBottom: 10,
                  display: "flex", alignItems: "flex-start", gap: 8,
                }}>
                  <span>📍</span>
                  <span style={{ flex: 1, lineHeight: 1.5, fontSize: 11, color: theme.charcoal }}>{address || "Fetching address…"}</span>
                  <button onClick={() => {
                    setLocationShared(false);
                    setLocation(null);
                    setAddress("");
                    setStores([]);
                  }} style={{
                    background: "none", border: "none", color: theme.greenDark,
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif", flexShrink: 0,
                  }}>Change</button>
                </div>
                {location && (
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["LAT", location.lat.toFixed(4)], ["LNG", location.lng.toFixed(4)]].map(([label, val]) => (
                      <div key={label} style={{
                        background: `${theme.green}15`, borderRadius: 8,
                        padding: "4px 10px", display: "flex", alignItems: "center", gap: 6,
                      }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: theme.greenDark }}>{label}</span>
                        <span style={{ fontSize: 11, color: theme.charcoal, fontWeight: 600 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Radius slider */}
          <div style={{ background: theme.white, borderRadius: 16, padding: "20px", border: `1.5px solid ${theme.grayBorder}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 900, color: theme.charcoal }}>🚗 Search Radius</h3>
              <span style={{ fontSize: 13, fontWeight: 900, color: theme.greenDark, background: `${theme.green}20`, borderRadius: 20, padding: "2px 12px" }}>
                {metersToLabel(radius)}
              </span>
            </div>
            <input
              type="range"
              min={0} max={RADIUS_OPTIONS.length - 1}
              value={RADIUS_OPTIONS.indexOf(radius) === -1 ? 1 : RADIUS_OPTIONS.indexOf(radius)}
              onChange={e => { setRadius(RADIUS_OPTIONS[+e.target.value]); setSaved(false); }}
              style={{ width: "100%", accentColor: theme.greenDark, cursor: "pointer", marginBottom: 8 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {RADIUS_OPTIONS.map((o) => (
                <span key={o} onClick={() => { setRadius(o); setSaved(false); }} style={{
                  fontSize: 10, fontWeight: 700, cursor: "pointer",
                  color: o === radius ? theme.greenDark : theme.gray,
                  transition: "color .2s",
                }}>{metersToLabel(o)}</span>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN — Live Map */}
        <div style={{ background: theme.white, borderRadius: 16, border: `1.5px solid ${theme.grayBorder}`, overflow: "hidden", position: "relative", minHeight: 420 }}>
          <div ref={mapContainer} style={{ width: "100%", height: "100%", minHeight: 420 }} />
          {!locationShared && (
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16,
            }}>
              <div style={{ fontSize: 36 }}>🗺️</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: theme.charcoal }}>Set your location</div>
              <div style={{ fontSize: 12, color: theme.gray }}>to load the live map</div>
            </div>
          )}
        </div>
      </div>

      {/* Store Selection Panel */}
      <div style={{ margin: "0 28px 24px", background: theme.white, borderRadius: 16, border: `1.5px solid ${theme.grayBorder}`, padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: theme.charcoal }}>🏪 Select Your Stores</h3>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: theme.gray }}>Pick up to 4 stores — these will be used across Cartly</p>
          </div>
          <div style={{
            background: selectedStores.length >= 4 ? `${theme.green}20` : theme.cream,
            border: `1.5px solid ${selectedStores.length >= 4 ? theme.green : theme.grayBorder}`,
            borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 900,
            color: selectedStores.length >= 4 ? theme.greenDark : theme.gray,
          }}>
            {selectedStores.length}/4 selected
          </div>
        </div>

        {!locationShared ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: theme.gray, fontSize: 13 }}>
            Set your location above to discover nearby stores.
          </div>
        ) : storesLoading ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: theme.gray, fontSize: 13 }}>
            🔍 Finding stores near you…
          </div>
        ) : stores.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: theme.gray, fontSize: 13 }}>
            No stores found. Try increasing your radius.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {stores.map((store, i) => {
              const isSelected = selectedStores.some(s => s.id === store.id);
              const isDisabled = !isSelected && selectedStores.length >= 4;
              const icons = { supermarket: "🛒", grocery: "🥦", convenience: "🏪" };
              return (
                <div key={store.id} onClick={() => !isDisabled && toggleStore(store)} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 13,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  background: isSelected ? `${theme.green}15` : theme.cream,
                  border: `1.5px solid ${isSelected ? theme.green : theme.grayBorder}`,
                  opacity: isDisabled ? 0.45 : 1, transition: "all 0.15s",
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    border: `2px solid ${isSelected ? theme.greenDark : theme.grayBorder}`,
                    background: isSelected ? theme.greenDark : theme.white,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {isSelected && <span style={{ color: theme.white, fontSize: 12, fontWeight: 900 }}>✓</span>}
                  </div>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: `${theme.green}15`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  }}>{icons[store.shop_type] || "🛒"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: theme.charcoal, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {store.name}
                    </div>
                    <div style={{ fontSize: 11, color: theme.gray, marginTop: 1 }}>
                      {metersToLabel(store.distance_m)} away
                    </div>
                  </div>
                  {activeStore === i && (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.greenDark, flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedStores.length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1.5px solid ${theme.grayBorder}` }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {selectedStores.map(s => (
                <div key={s.id} style={{
                  background: `${theme.green}15`, border: `1.5px solid ${theme.green}`,
                  borderRadius: 20, padding: "4px 12px", fontSize: 12,
                  fontWeight: 700, color: theme.greenDark, display: "flex", alignItems: "center", gap: 6,
                }}>
                  {s.name}
                  <span onClick={() => toggleStore(s)} style={{ cursor: "pointer", fontWeight: 900, fontSize: 14, lineHeight: 1 }}>×</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={savePreferences} disabled={saving} style={{
          width: "100%", padding: "13px 0", marginTop: selectedStores.length > 0 ? 0 : 16,
          background: saved ? theme.grayLight : `linear-gradient(135deg, ${theme.green}, ${theme.greenDark})`,
          color: saved ? theme.gray : theme.white,
          border: "none", borderRadius: 12,
          fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 14,
          cursor: saving ? "wait" : "pointer", transition: "all 0.2s",
        }}>
          {saving ? "Saving…" : saved ? "✓ Preferences Saved" : "Save Preferences"}
        </button>
      </div>

      <BottomNav setPage={setPage} activePage="profile" />
    </div>
  );
}