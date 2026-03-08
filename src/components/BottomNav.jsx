import { useState } from "react";
import { theme } from "../theme";
import userIcon from "../assets/user.png";
import homeIcon from "../assets/home.png"

const NAV_ITEMS = [
  { id: "home",     label: "Home",     icon: homeIcon,  isImage: true },
  { id: "cart",     label: "Cart",     icon: "🛒",      isImage: false },
  { id: "optimize", label: "Optimize", icon: "◈",       isImage: false },
  { id: "profile",  label: "Profile",  icon: userIcon,  isImage: true  },
];

export default function BottomNav({ setPage, activePage }) {
  const [hovered, setHovered] = useState(null);

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: theme.white, borderTop: `1.5px solid ${theme.grayBorder}`,
      display: "flex", zIndex: 100, boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
      width: "100%", boxSizing: "border-box",
    }}>
      {NAV_ITEMS.map(item => (
        <button key={item.id} onClick={() => setPage(item.id)}
          onMouseEnter={() => setHovered(item.id)}
          onMouseLeave={() => setHovered(null)}
          style={{
          flex: 1, padding: "12px 0", border: "none", outline: "none",
          background: hovered === item.id ? "rgba(0,0,0,0.04)" : "none",
          cursor: "pointer", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 3,
          transition: "background 0.15s",
          color: item.id === activePage ? theme.greenDark : theme.gray,
        }}>
          {item.isImage
            ? <img src={item.icon} alt={item.label} style={{ width: 22, height: 22, objectFit: "contain", opacity: item.id === activePage ? 1 : 0.4 }} />
            : <span style={{ fontSize: 22 }}>{item.icon}</span>
          }
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "'Nunito', sans-serif" }}>{item.label}</span>
          {item.id === activePage && (
            <div style={{ position: "absolute", bottom: 0, width: 24, height: 3, borderRadius: 2, background: theme.greenDark }} />
          )}
        </button>
      ))}
    </nav>
  );
}