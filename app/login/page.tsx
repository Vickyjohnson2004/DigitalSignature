"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, saveSession } from "../../lib/api";
import { FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";

const FEATURES = [
  { icon: "🔐", title: "RSA-PSS, DSA, ECDSA, Ed25519", desc: "Compare four production-grade signature algorithms" },
  { icon: "📊", title: "Empirical Benchmarks", desc: "Measure signing & verification speed with real data" },
  { icon: "🔍", title: "Integrity Verification", desc: "Cryptographic proof of document authenticity" },
  { icon: "📁", title: "Audit Trail", desc: "Full log of every cryptographic operation" },
];

export default function Login() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveSession(data);
      r.replace("/dashboard");
    } catch (e: any) {
      setError(e.response?.data?.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--bg)" }}>
      {/* Left panel */}
      <section
        className="login-panel-bg hidden lg:flex"
        style={{
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 52px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative orbs */}
        <div style={{
          position: "absolute", top: "-120px", right: "-120px",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "60px", left: "-100px",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 20px rgba(99,102,241,0.4)",
          }}>
            <FiLock size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#f1f5f9" }}>DigitalSignature Suite</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Cryptographic workspace</div>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-block",
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 20,
            padding: "5px 14px",
            fontSize: 12,
            fontWeight: 700,
            color: "#818cf8",
            marginBottom: 20,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            Research Platform
          </div>
          <h1 style={{
            fontSize: 48,
            fontWeight: 900,
            lineHeight: 1.1,
            color: "#f1f5f9",
            marginBottom: 20,
          }}>
            Sign.{" "}
            <span style={{ color: "#818cf8" }}>Verify.</span>
            <br />
            Benchmark.
          </h1>
          <p style={{ fontSize: 16, color: "#64748b", maxWidth: 420, lineHeight: 1.7 }}>
            A unified workspace for document integrity and comparative analysis
            of modern digital signature algorithms.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, position: "relative" }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "16px 16px",
            }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0", marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ fontSize: 12, color: "#334155", position: "relative" }}>
          Node.js built-in crypto • No third-party crypto libs • Ephemeral keys
        </div>
      </section>

      {/* Right panel — form */}
      <main style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px", background: "var(--bg-2)" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiLock size={16} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, color: "var(--ink)" }}>DigitalSignature Suite</span>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: "var(--ink)", marginBottom: 8 }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 14, color: "var(--ink-2)" }}>Sign in to your cryptographic workspace.</p>
          </div>

          {error && (
            <div style={{
              background: "var(--red-dim)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 14,
              color: "#fca5a5",
              marginBottom: 20,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Email
              </label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: "absolute",
                    right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--ink-3)", display: "flex", padding: 4,
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%", height: 48, fontSize: 15 }}
              disabled={loading}
            >
              {loading ? <><div className="spinner" />Signing in…</> : <>Sign in <FiArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ fontSize: 14, textAlign: "center", marginTop: 24, color: "var(--ink-3)" }}>
            No account?{" "}
            <Link href="/register" style={{ color: "var(--brand-light)", fontWeight: 600, textDecoration: "none" }}>
              Create one →
            </Link>
          </p>

          {/* Demo credentials hint */}
          <div style={{
            marginTop: 28,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "14px 16px",
            fontSize: 13,
          }}>
            <div style={{ fontWeight: 700, color: "var(--ink-2)", marginBottom: 8, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Demo admin credentials
            </div>
            <div style={{ color: "var(--ink-3)", display: "flex", flexDirection: "column", gap: 4 }}>
              <span>📧 <code style={{ fontFamily: "'JetBrains Mono', monospace" }}>admin@example.com</code></span>
              <span>🔑 <code style={{ fontFamily: "'JetBrains Mono', monospace" }}>Admin12345!</code></span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
