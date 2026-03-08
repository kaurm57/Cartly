import { useState, useEffect } from "react";
import { theme } from "./theme";
import LandingPage  from "./pages/LandingPage";
import LoginPage    from "./pages/LoginPage";
import HomePage     from "./pages/HomePage";
import CartPage     from "./pages/CartPage";
import OptimizePage from "./pages/OptimizePage";
import ProfilePage  from "./pages/ProfilePage";

export default function App() {
  const [page, setPage]               = useState("landing");
  const [user, setUser]               = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cartItems, setCartItems]     = useState([]);
  const [budget, setBudget]           = useState("");
  const [priceSlider, setPriceSlider] = useState(30);
  const [brandSlider, setBrandSlider] = useState(50);

  useEffect(() => {
    // TODO: swap for real Auth0 when backend is ready
    // fetch("http://localhost:5000/api/me", { credentials: "include" })
    //   .then(res => res.ok ? res.json() : null)
    //   .then(data => { if (data?.user) { setUser(data.user); setPage("home"); } })
    //   .catch(() => {})
    //   .finally(() => setAuthLoading(false));
    setAuthLoading(false);
  }, []);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: theme.cream, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, margin: "0 auto 14px", background: `linear-gradient(135deg, ${theme.green}, ${theme.greenDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🛒</div>
          <p style={{ color: theme.gray, fontSize: 13 }}>Loading...</p>
        </div>
      </div>
    );
  }

  const sharedProps = {
    setPage, user, cartItems, setCartItems,
    budget, setBudget, priceSlider, setPriceSlider, brandSlider, setBrandSlider,
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; margin: 0; padding: 0; overflow-x: hidden; }
        body { background: ${theme.cream}; font-family: 'Nunito', sans-serif; }
        input[type=range] { -webkit-appearance: none; height: 6px; border-radius: 4px; background: ${theme.grayBorder}; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${theme.greenDark}; cursor: pointer; box-shadow: 0 2px 6px rgba(102,156,53,0.4); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: ${theme.grayBorder}; border-radius: 3px; }
        button { transition: opacity 0.15s; }
        button:hover { opacity: 0.88; }
      `}</style>
      <div style={{ width: "100%", minHeight: "100vh", margin: 0, padding: 0, overflowX: "hidden" }}>
        {page === "landing"  && <LandingPage   {...sharedProps} />}
        {page === "login"    && <LoginPage     {...sharedProps} />}
        {page === "home"     && <HomePage      {...sharedProps} />}
        {page === "cart"     && <CartPage      {...sharedProps} />}
        {page === "optimize" && <OptimizePage  {...sharedProps} />}
        {page === "profile"  && <ProfilePage   {...sharedProps} />}
      </div>
    </>
  );
}