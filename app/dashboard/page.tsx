"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Shell } from "../../components/Shell";
import { RequireAuth } from "../../components/RequireAuth";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LineChart, Line,
} from "recharts";
import Link from "next/link";
import {
  FiFileText, FiPenTool, FiShield, FiActivity,
  FiArrowRight, FiTrendingUp, FiCheckCircle, FiZap, FiRefreshCw,
} from "react-icons/fi";

const ALGO_COLORS: Record<string, string> = {
  "RSA-PSS": "#6366f1",
  "DSA": "#06b6d4",
  "ECDSA": "#10b981",
  "Ed25519": "#f59e0b",
};

function StatCard({
  label, value, icon: Icon, accent, sub,
}: {
  label: string; value: number | string; icon: any; accent: string; sub?: string;
}) {
  return (
    <div
      className="stat-card"
      style={{ "--accent-color": accent + "33" } as React.CSSProperties}
    >
      <div style={{ padding: "22px 22px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>{label}</span>
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: accent + "22",
              border: `1px solid ${accent}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: accent,
            }}
          >
            <Icon size={16} />
          </div>
        </div>
        <div className="metric-value" style={{ fontSize: 36, marginBottom: 4 }}>{value ?? 0}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>{sub}</div>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1a2035",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color, display: "flex", gap: 8 }}>
          <span style={{ color: "var(--ink-2)" }}>{p.name}:</span>
          <span style={{ fontWeight: 600 }}>{typeof p.value === "number" ? p.value.toFixed(3) : p.value} ms</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const q = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard");
      return data;
    },
    refetchOnMount: 'always',
    staleTime: 0,
  });
  const s = q.data?.stats || {};
  const rawBench = q.data?.recentBenchmarks || [];

  const barChart = rawBench.map((x: any) => ({
    algorithm: x.algorithm,
    sign: parseFloat(x.signingTime?.toFixed(3)),
    verify: parseFloat(x.verificationTime?.toFixed(3)),
    fill: ALGO_COLORS[x.algorithm] || "#6366f1",
  }));

  const trendData = rawBench.map((x: any, i: number) => ({
    name: x.algorithm,
    idx: i + 1,
    sign: parseFloat(x.signingTime?.toFixed(3)),
    verify: parseFloat(x.verificationTime?.toFixed(3)),
  }));

  const steps = [
    { label: "Upload a document", href: "/documents", icon: FiFileText, color: "#6366f1" },
    { label: "Generate a signature", href: "/sign", icon: FiPenTool, color: "#06b6d4" },
    { label: "Verify integrity", href: "/verify", icon: FiShield, color: "#10b981" },
    { label: "Benchmark algorithms", href: "/benchmark", icon: FiActivity, color: "#f59e0b" },
    { label: "Export research data", href: "/benchmark", icon: FiTrendingUp, color: "#8b5cf6" },
  ];

  return (
    <RequireAuth>
      <Shell>
        <div className="fade-in">
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
            <div>
              <div className="section-label" style={{ marginBottom: 6 }}>Overview</div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--ink)", lineHeight: 1.1 }}>
                Cryptographic Workspace
              </h1>
              <p style={{ color: "var(--ink-2)", marginTop: 6, fontSize: 14 }}>
                Monitor documents, signatures and empirical performance.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                onClick={() => q.refetch()}
                disabled={q.isFetching}
                className="btn btn-secondary"
                style={{ fontSize: 13, padding: "8px 14px", cursor: q.isFetching ? "wait" : "pointer" }}
                title="Refresh metrics from database"
              >
                <FiRefreshCw size={13} style={{ animation: q.isFetching ? "spin 0.8s linear infinite" : "none" }} />
                {q.isFetching ? "Refreshing..." : "Refresh Stats"}
              </button>
              <Link href="/sign" className="btn btn-primary" style={{ flexShrink: 0 }}>
                <FiPenTool size={15} />
                Sign a document
              </Link>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
            <StatCard label="Documents" value={s.documents ?? 0} icon={FiFileText} accent="#6366f1" sub="Uploaded files" />
            <StatCard label="Signatures" value={s.signatures ?? 0} icon={FiPenTool} accent="#06b6d4" sub="Generated signatures" />
            <StatCard label="Benchmarks" value={s.benchmarks ?? 0} icon={FiActivity} accent="#10b981" sub="Test runs" />
            <StatCard label="Valid Verifications" value={s.validVerifications ?? 0} icon={FiCheckCircle} accent="#f59e0b" sub="Integrity checks passed" />
          </div>

          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            {/* Bar chart */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>Algorithm Performance</h2>
                  <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 3 }}>Avg. milliseconds per operation</p>
                </div>
                <Link href="/benchmark" style={{ fontSize: 13, fontWeight: 600, color: "var(--brand-light)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                  Run tests <FiArrowRight size={13} />
                </Link>
              </div>
              <div style={{ height: 240 }}>
                {barChart.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChart} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="algorithm" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                      <Bar dataKey="sign" name="Sign (ms)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="verify" name="Verify (ms)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--ink-3)" }}>
                    <FiZap size={28} style={{ opacity: 0.4 }} />
                    <p style={{ fontSize: 13 }}>No benchmark data yet</p>
                    <Link href="/benchmark" className="btn btn-secondary" style={{ fontSize: 12, padding: "7px 14px" }}>
                      Run first benchmark
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Line chart */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>Trend Overview</h2>
                <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 3 }}>Sign vs verify time trend</p>
              </div>
              <div style={{ height: 240 }}>
                {trendData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                      <Line type="monotone" dataKey="sign" name="Sign (ms)" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="verify" name="Verify (ms)" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)", fontSize: 13 }}>
                    Run benchmarks to see trends
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Workflow steps */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginBottom: 18 }}>
              Recommended Workflow
            </h2>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
              {steps.map((step, i) => (
                <Link
                  key={step.label}
                  href={step.href}
                  style={{ textDecoration: "none", flex: "1 1 0", minWidth: 130 }}
                >
                  <div
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      padding: "16px 14px",
                      transition: "all 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = step.color + "66";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 9,
                      background: step.color + "22",
                      border: `1px solid ${step.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: step.color,
                      marginBottom: 10,
                    }}>
                      <step.icon size={15} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginBottom: 4 }}>
                      Step {i + 1}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", lineHeight: 1.3 }}>
                      {step.label}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Shell>
    </RequireAuth>
  );
}
