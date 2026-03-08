import { theme } from "../theme";

const navItems = [
  { id: "home",     label: "Home",     icon: "⌂" },
  { id: "cart",     label: "Cart",     icon: "◫" },
  { id: "optimize", label: "Optimize", icon: "◈" },
  { id: "profile",  label: "Profile",  icon: "◉" },
];

export default function Sidebar({ page, setPage }) {
  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      background: theme.white,
      display: "flex",
      flexDirection: "column",
      padding: "32px 0",
      position: "fixed",
      top: 0, left: 0, bottom: 0,
      zIndex: 100,
      borderRight: `1.5px solid ${theme.grayBorder}`,
    }}>
      {/* Logo */}
      <div style={{ padding: "0 24px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `linear-gradient(135deg, ${theme.green}, ${theme.greenDark})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, flexShrink: 0,
            boxShadow: `0 4px 16px rgba(177,221,140,0.5)`,
          }}>🛒</div>
          <span style={{
            fontSize: 24, fontFamily: "'Syne', sans-serif",
            fontWeight: 800, color: theme.charcoal, letterSpacing: "-0.5px",
          }}>cartly</span>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map(item => {
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", borderRadius: 12,
              border: "none", cursor: "pointer",
              background: active ? theme.greenLight : "transparent",
              color: active ? theme.greenDark : theme.gray,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: active ? 700 : 500,
              fontSize: 14, textAlign: "left",
              transition: "all 0.15s",
              position: "relative",
            }}>
              {active && (
                <div style={{
                  position: "absolute", left: 0, top: "20%", bottom: "20%",
                  width: 3, borderRadius: 4,
                  background: theme.greenDark,
                }} />
              )}
              <span style={{
                fontSize: 18,
                color: active ? theme.greenDark : theme.gray,
              }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom user */}
      <div style={{
        padding: "16px 20px",
        borderTop: `1.5px solid ${theme.grayBorder}`,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${theme.green}, ${theme.greenDark})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0,
        }}>👤</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.charcoal, fontFamily: "'DM Sans', sans-serif" }}>Jane Smith</div>
          <div style={{ fontSize: 11, color: theme.gray, fontFamily: "'DM Sans', sans-serif" }}>jane@email.com</div>
        </div>
      </div>
    </aside>
  );
}