"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, saveSession } from "../../lib/api";
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiUser, FiMail } from "react-icons/fi";

export default function Register() {
  const r = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      saveSession(data);
      r.replace("/dashboard");
    } catch (e: any) {
      setError(e.response?.data?.message || "Unable to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--bg-2)" }}>
      {/* Background orbs */}
      <div style={{ position: "fixed", top: "20%", left: "30%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "20%", right: "30%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 440, position: "relative" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}>
            <FiLock size={16} color="#fff" />
          </div>
          <Link href="/login" style={{ textDecoration: "none" }}>
            <span style={{ fontWeight: 800, fontSize: 16, color: "var(--ink)" }}>DigitalSignature Suite</span>
          </Link>
        </div>

        <div className="card" style={{ padding: 36 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--ink)", marginBottom: 8 }}>
              Create your account
            </h1>
            <p style={{ fontSize: 14, color: "var(--ink-2)" }}>
              Start signing, verifying and benchmarking securely.
            </p>
          </div>

          {error && (
            <div style={{ background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#fca5a5", marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Full name
              </label>
              <div style={{ position: "relative" }}>
                <FiUser size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)" }} />
                <input
                  className="input"
                  placeholder="Your name"
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  required
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <FiMail size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)" }} />
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <FiLock size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)" }} />
                <input
                  className="input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="new-password"
                  style={{ paddingLeft: 38, paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)", display: "flex", padding: 4 }}
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
              {loading
                ? <><div className="spinner" /> Creating account…</>
                : <>Create account <FiArrowRight size={16} /></>
              }
            </button>
          </form>

          <p style={{ fontSize: 14, textAlign: "center", marginTop: 20, color: "var(--ink-3)" }}>
            Already registered?{" "}
            <Link href="/login" style={{ color: "var(--brand-light)", fontWeight: 600, textDecoration: "none" }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
