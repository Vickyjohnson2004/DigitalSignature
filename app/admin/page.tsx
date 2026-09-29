"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Shell } from "../../components/Shell";
import { RequireAuth } from "../../components/RequireAuth";
import { FiUsers, FiActivity, FiBarChart2, FiShield, FiClock } from "react-icons/fi";

function timeSince(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const ACTION_COLORS: Record<string, string> = {
  sign: '#6366f1',
  verify: '#10b981',
  upload: '#06b6d4',
  benchmark: '#f59e0b',
  login: '#8b5cf6',
  register: '#ec4899',
};

export default function Admin() {
  const q = useQuery({
    queryKey: ["admin"],
    queryFn: async () => {
      const { data } = await api.get("/admin/overview");
      return data;
    },
    retry: false,
  });
  const logs = useQuery({
    queryKey: ["logs"],
    queryFn: async () => {
      const { data } = await api.get("/admin/audit-logs");
      return data.logs;
    },
    retry: false,
  });
  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return data.users;
    },
    retry: false,
  });

  if (q.isError) {
    return (
      <RequireAuth>
        <Shell>
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <FiShield size={32} style={{ color: '#fca5a5', marginBottom: 12 }} />
            <p style={{ color: '#fca5a5', fontWeight: 700, fontSize: 16 }}>Administrator access required.</p>
            <p style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 8 }}>
              This section is restricted to admin accounts.
            </p>
          </div>
        </Shell>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <Shell>
        <div className="fade-in">
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-label" style={{ marginBottom: 6 }}>Administration</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>
              Admin Console
            </h1>
            <p style={{ color: 'var(--ink-2)', marginTop: 6, fontSize: 14 }}>
              System activity, user management, and operational oversight.
            </p>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Users', value: q.data?.users ?? 0, icon: FiUsers, accent: '#6366f1' },
              { label: 'Audit Events', value: q.data?.audits ?? 0, icon: FiActivity, accent: '#06b6d4' },
              { label: 'Benchmarks Run', value: q.data?.benchmarks ?? 0, icon: FiBarChart2, accent: '#10b981' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ '--accent-color': s.accent + '33' } as React.CSSProperties}>
                <div style={{ padding: '22px 22px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>{s.label}</span>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: s.accent + '22', border: `1px solid ${s.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.accent }}>
                      <s.icon size={16} />
                    </div>
                  </div>
                  <div className="metric-value" style={{ fontSize: 36 }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Users + Audit log */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
            {/* Users table */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>Users</h2>
                <span style={{ fontSize: 12, color: 'var(--ink-3)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 10px' }}>
                  {users.data?.length ?? 0}
                </span>
              </div>
              <div>
                {users.data?.map((u: any) => (
                  <div
                    key={u._id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 20px',
                      borderBottom: '1px solid var(--border)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0,
                    }}>
                      {u.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.fullName || '—'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.email}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                      background: u.role === 'admin' ? 'rgba(99,102,241,0.2)' : 'var(--surface)',
                      color: u.role === 'admin' ? 'var(--brand-light)' : 'var(--ink-3)',
                      border: `1px solid ${u.role === 'admin' ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                      textTransform: 'capitalize',
                      flexShrink: 0,
                    }}>
                      {u.role}
                    </span>
                  </div>
                ))}
                {!users.data?.length && (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
                    No users found.
                  </div>
                )}
              </div>
            </div>

            {/* Audit log */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>Recent Audit Log</h2>
                <span style={{ fontSize: 12, color: 'var(--ink-3)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 10px' }}>
                  {logs.data?.length ?? 0} events
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Resource</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.data?.map((l: any) => {
                      const actionKey = l.action?.toLowerCase().split('_')[0] || '';
                      const color = ACTION_COLORS[actionKey] || 'var(--ink-3)';
                      return (
                        <tr key={l._id}>
                          <td>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 12, fontWeight: 600,
                              color,
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                              {l.action}
                            </span>
                          </td>
                          <td>{l.resourceType || '—'}</td>
                          <td>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink-3)' }}>
                              <FiClock size={11} />
                              {timeSince(l.createdAt)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {!logs.data?.length && (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-3)' }}>
                          No audit events recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Shell>
    </RequireAuth>
  );
}
