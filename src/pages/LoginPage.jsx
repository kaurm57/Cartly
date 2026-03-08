import { theme } from "../theme";
import { useEffect, useState } from "react";

export default function LoginPage({ setPage, setUser }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // On mount: check if we just came back from Auth0 callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");

    if (auth === "success") {
      // Clean the URL then fetch the logged-in user
      window.history.replaceState({}, "", "/");
      fetchUser();
    } else if (auth === "error") {
      const msg = params.get("msg") || "Authentication failed.";
      setError(msg);
      window.history.replaceState({}, "", "/");
    }
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/me", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser?.(data.user);
          setPage("home");
        } else {
          setError("Could not retrieve user info.");
        }
      } else {
        setError("Login session not found.");
      }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // Redirect browser to Flask /login → Auth0 → /callback → back here
    window.location.href = "/login";
  };

  return (
    <div style={{
      height: "100vh", width: "100%",
      background: theme.cream,
      fontFamily: "'Nunito', sans-serif",
      display: "flex", flexDirection: "column",
      position: "fixed", top: 0, left: 0, overflow: "hidden",
    }}>
      {/* Background blobs */}
      <div style={{ position: "absolute", top: -150, right: -150, width: 500, height: 500, borderRadius: "50%", background: "rgba(177,221,140,0.2)", filter: "blur(100px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(177,221,140,0.12)", filter: "blur(80px)", pointerEvents: "none" }} />

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", padding: "20px 60px", position: "relative", zIndex: 10, borderBottom: `1.5px solid ${theme.grayBorder}`, flexShrink: 0 }}>
        <button onClick={() => setPage("landing")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 46, height: 46, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <img src="https://res.cloudinary.com/dk5bcgmky/image/upload/v1772925782/Cartly_Logo_h7qgil.png" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span style={{ fontSize: 22, fontFamily: "'Nunito', sans-serif", fontWeight: 900, color: theme.bodyText, letterSpacing: "-0.3px" }}>Cartly</span>
          </div>
        </button>
      </nav>

      {/* Centered card */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px", position: "relative", zIndex: 10 }}>
        <div style={{ background: theme.white, borderRadius: 22, padding: "48px 44px", width: "100%", maxWidth: 440, border: `1.5px solid ${theme.grayBorder}`, boxShadow: "0 16px 60px rgba(30,42,18,0.08)", textAlign: "center" }}>

        <div style={{ width: 58, height: 58, borderRadius: 16, margin: "0 auto 18px", overflow: "hidden" }}>
  <img src="https://res.cloudinary.com/dk5bcgmky/image/upload/v1772925782/Cartly_Logo_h7qgil.png" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
</div>          <h2 style={{ fontSize: 26, fontFamily: "'Nunito', sans-serif", fontWeight: 900, color: theme.charcoal, margin: "0 0 8px" }}>Welcome to Cartly</h2>
          <p style={{ fontSize: 14, color: theme.gray, margin: "0 0 32px", lineHeight: 1.6 }}>
            Log in or sign up to start saving<br />on your grocery trips.
          </p>

          {/* Error state */}
          {error && (
            <div style={{ background: "#fff0f0", border: "1.5px solid #ffcccc", borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#c0392b" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Loading state — came back from Auth0, fetching user */}
          {loading ? (
            <div style={{ padding: "15px 0", fontSize: 14, color: theme.gray, fontWeight: 600 }}>
              Signing you in…
            </div>
          ) : (
            <button onClick={handleLogin} style={{
              width: "100%", padding: "15px 0",
              background: `linear-gradient(135deg, ${theme.green}, ${theme.greenDark})`,
              color: theme.white, border: "none", borderRadius: 12,
              fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 15,
              cursor: "pointer", boxShadow: `0 8px 24px rgba(177,221,140,0.5)`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <span>Continue with Auth0</span><span>→</span>
            </button>
          )}

          <p style={{ fontSize: 11, color: theme.gray, marginTop: 18, lineHeight: 1.7 }}>
            By continuing you agree to our Terms of Service.<br />Secured by Auth0.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: theme.grayBorder }} />
            <span style={{ fontSize: 11, color: theme.gray }}>trusted & secure</span>
            <div style={{ flex: 1, height: 1, background: theme.grayBorder }} />
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
            {["🔒 Encrypted", "✦ Auth0", "🍁 Canadian"].map((b, i) => (
              <span key={i} style={{ fontSize: 11, color: theme.gray, fontWeight: 700 }}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}