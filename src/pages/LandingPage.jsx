import { theme } from "../theme";
import { useState, useEffect } from "react";

function AnimatedTagline() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setActive(prev => (prev + 1) % 3);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
      {["FASTER.", "CHEAPER.", "BETTER."].map((word, i) => (
        <span key={i} style={{
          fontSize: 13, fontWeight: 900, letterSpacing: "0.18em",
          color: active === i ? theme.greenDark : theme.charcoal,
          opacity: active === i ? 1 : 0.35,
          fontFamily: "'Nunito', sans-serif",
          textTransform: "uppercase",
          transition: "color 0.4s ease, opacity 0.4s ease",
        }}>{word}</span>
      ))}
    </div>
  );
}

export default function LandingPage({ setPage }) {
  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: theme.cream,
      fontFamily: "'Nunito', sans-serif",
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
      boxSizing: "border-box",
      margin: 0, padding: 0,
    }}>
      {/* Blobs */}
      <div style={{ position: "absolute", top: -200, left: -200, width: 700, height: 700, borderRadius: "50%", background: "rgba(177,221,140,0.2)", filter: "blur(120px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: "rgba(177,221,140,0.12)", filter: "blur(100px)", pointerEvents: "none" }} />

      {/* Navbar */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 60px", position: "relative", zIndex: 10,
        borderBottom: `1.5px solid ${theme.grayBorder}`,
        background: "rgba(249,250,245,0.85)", backdropFilter: "blur(12px)",
        width: "100%", boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 11,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            <img src="https://res.cloudinary.com/dojayxyvx/image/upload/v1772864715/cart_background-removebg-preview_gsl33k.png" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <span style={{ fontSize: 22, fontFamily: "'Nunito', sans-serif", fontWeight: 900, color: theme.bodyText, letterSpacing: "-0.3px" }}>Cartly</span>
        </div>
        <button onClick={() => setPage("login")} style={{
          background: `linear-gradient(135deg, ${theme.green}, ${theme.greenDark})`,
          color: theme.white, border: "none", borderRadius: 10,
          padding: "10px 24px", fontFamily: "'Nunito', sans-serif",
          fontWeight: 700, fontSize: 14, cursor: "pointer",
          boxShadow: `0 4px 14px rgba(177,221,140,0.45)`,
        }}>Log In / Sign Up</button>
      </nav>

      {/* Hero */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "40px 60px",
        position: "relative", zIndex: 10,
        width: "100%", boxSizing: "border-box",
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: theme.greenLight, border: `1.5px solid ${theme.greenMid}`,
          borderRadius: 100, padding: "5px 16px", marginBottom: 28,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: theme.greenDark, display: "inline-block" }} />
          <span style={{ fontSize: 12, color: theme.greenDark, fontWeight: 700 }}>Built for Canadian shoppers 🍁</span>
        </div>

        <AnimatedTagline />

        <h1 style={{
          fontSize: 76, fontFamily: "'Nunito', sans-serif", fontWeight: 900,
          color: theme.charcoal, margin: "0 0 20px",
          lineHeight: 1.05, letterSpacing: "-2.5px", maxWidth: 860,
          textAlign: "center",
        }}>
          Stop overpaying<br />
          for{" "}
          <span style={{
            background: `linear-gradient(135deg, ${theme.greenDark}, ${theme.greenDarker})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>groceries.</span>
        </h1>

        <p style={{
          fontSize: 18, color: theme.gray, maxWidth: 520,
          margin: "0 0 44px", lineHeight: 1.7, textAlign: "center",
        }}>
          Tell us what you need. We will scan every store nearby and find you the best prices!
        </p>

        <div style={{ display: "flex", justifyContent: "center", width: "100%", maxWidth: 1000 }}>
          <button onClick={() => setPage("login")} style={{
            background: `linear-gradient(135deg, ${theme.green}, ${theme.greenDark})`,
            color: theme.white, border: "none", borderRadius: 14,
            padding: "15px 36px", fontFamily: "'Nunito', sans-serif",
            fontWeight: 800, fontSize: 16, cursor: "pointer",
            boxShadow: `0 8px 24px rgba(177,221,140,0.5)`,
          }}>Start saving for free →</button>
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex", marginTop: 64,
          background: theme.white, border: `1.5px solid ${theme.grayBorder}`,
          borderRadius: 18, overflow: "hidden",
          boxShadow: "0 4px 20px rgba(30,42,18,0.06)",
        }}>
          {[
            { val: "$847", label: "Avg. yearly savings", icon: "💵" },
            { val: "6+",   label: "Stores compared",     icon: "🏪" },
            { val: "2 min",label: "To optimize your cart", icon: "⚡" },
            { val: "100%", label: "Free to use",          icon: "🎉" },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "24px 48px", textAlign: "center",
              borderLeft: i > 0 ? `1.5px solid ${theme.grayBorder}` : "none",
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: theme.greenDark, fontFamily: "'Nunito', sans-serif" }}>{s.val}</div>
              <div style={{ fontSize: 11, color: theme.gray, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, padding: "52px 60px 60px", position: "relative", zIndex: 10, width: "100%", boxSizing: "border-box" }}>
        {[
          { icon: "🏷️", title: "Price Optimization",  desc: "Finds the cheapest combo of stores for your exact list" },
          { icon: "🗺️", title: "Route Planning",       desc: "Maps the most efficient multi-store trip from your location" },
          { icon: "🔄", title: "Smart Substitutions",  desc: "Suggests better-value alternatives when they're available" },
          { icon: "💰", title: "Budget Tracking",      desc: "Builds your entire cart to stay under your weekly budget" },
        ].map((f, i) => (
          <div key={i} style={{
            background: theme.white, border: `1.5px solid ${theme.grayBorder}`,
            borderRadius: 16, padding: "22px", flex: 1, maxWidth: 255,
            boxShadow: "0 2px 12px rgba(30,42,18,0.04)",
          }}>
            <div style={{
              width: 46, height: 46, borderRadius: 13, background: theme.greenLight,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, marginBottom: 14,
            }}>{f.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: theme.charcoal, marginBottom: 7, fontFamily: "'Nunito', sans-serif" }}>{f.title}</div>
            <div style={{ fontSize: 13, color: theme.gray, lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}