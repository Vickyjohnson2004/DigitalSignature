"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiBarChart2,
  FiFileText,
  FiPenTool,
  FiShield,
  FiActivity,
  FiLogOut,
  FiUserCheck,
  FiMenu,
  FiX,
  FiLock,
} from "react-icons/fi";
import { logout } from "../lib/api";

const links = [
  ["/dashboard", "Dashboard", FiBarChart2],
  ["/documents", "Documents", FiFileText],
  ["/sign", "Sign document", FiPenTool],
  ["/verify", "Verify signature", FiShield],
  ["/benchmark", "Benchmarks", FiActivity],
] as const;

type User = {
  fullName?: string;
  role?: string;
};

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User>({});

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("dss_user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {
      setUser({});
    }
  }, []);

  useEffect(() => { setMobileOpen(false); }, [path]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const avatar = user.fullName?.charAt(0)?.toUpperCase() || "U";

  const NavLinks = () => (
    <nav className="space-y-1">
      {links.map(([href, label, Icon]) => {
        const active = path === href;
        return (
          <Link
            key={href}
            href={href}
            className={`sidebar-link${active ? " active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={17} className="shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}

      {user.role === "admin" && (
        <Link
          href="/admin"
          className={`sidebar-link${path === "/admin" ? " active" : ""}`}
          onClick={() => setMobileOpen(false)}
        >
          <FiUserCheck size={17} className="shrink-0" />
          <span>Admin</span>
        </Link>
      )}
    </nav>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex"
        style={{
          width: 240,
          flexShrink: 0,
          flexDirection: "column",
          background: "var(--bg-2)",
          borderRight: "1px solid var(--border)",
          padding: "20px 14px",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            marginBottom: 28,
            padding: "0 6px",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
              flexShrink: 0,
            }}
          >
            <FiLock size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "var(--ink)", lineHeight: 1.2 }}>
              DSS
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 500 }}>
              Digital Signature
            </div>
          </div>
        </Link>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", padding: "0 6px", marginBottom: 8 }}>
          Navigation
        </div>
        <NavLinks />

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 10,
              background: "var(--surface)",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 13,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {avatar}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.fullName || "User"}
              </div>
              {user.role && (
                <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "capitalize" }}>
                  {user.role}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="sidebar-link"
            style={{ color: "#fca5a5", width: "100%" }}
          >
            <FiLogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Backdrop ── */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          display: mobileOpen ? "block" : "none",
        }}
      />

      {/* ── Mobile Sidebar ── */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          width: "82%",
          maxWidth: 300,
          background: "var(--bg-2)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: 20,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
        className="md:hidden"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <Link href="/dashboard" onClick={() => setMobileOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiLock size={14} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, color: "var(--ink)" }}>DSS</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-hover)", border: "1px solid var(--border)", color: "var(--ink-2)", cursor: "pointer" }}
          >
            <FiX size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <NavLinks />
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#fff" }}>
              {avatar}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{user.fullName || "User"}</div>
              {user.role && <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "capitalize" }}>{user.role}</div>}
            </div>
          </div>
          <button onClick={logout} className="sidebar-link" style={{ color: "#fca5a5", width: "100%" }}>
            <FiLogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <header
          style={{
            height: 60,
            background: "rgba(8,11,20,0.85)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            position: "sticky",
            top: 0,
            zIndex: 30,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden"
              aria-label="Open menu"
              style={{
                width: 36, height: 36, borderRadius: 9,
                background: "var(--surface-hover)",
                border: "1px solid var(--border)",
                color: "var(--ink-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <FiMenu size={18} />
            </button>

            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "var(--ink)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {links.find((x) => x[0] === path)?.[1] ||
                (path === "/admin" ? "Administration" : "DigitalSignature Suite")}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "6px 12px",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {avatar}
              </div>
              <div className="hidden sm:block" style={{ lineHeight: 1.25 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                  {user.fullName || "User"}
                </div>
                {user.role && (
                  <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "capitalize" }}>
                    {user.role}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, padding: "28px 24px", maxWidth: 1280, margin: "0 auto", width: "100%" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
