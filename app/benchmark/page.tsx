'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Shell } from '../../components/Shell';
import { RequireAuth } from '../../components/RequireAuth';
import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  FiPlay, FiDownload, FiClock, FiZap, FiPackage, FiRefreshCw,
} from 'react-icons/fi';

const ALGORITHMS = ['RSA-PSS', 'DSA', 'ECDSA', 'Ed25519'] as const;

const ALGO_COLORS: Record<string, string> = {
  'RSA-PSS': '#6366f1',
  'DSA': '#06b6d4',
  'ECDSA': '#10b981',
  'Ed25519': '#f59e0b',
};

const AlgoBadge = ({ algo }: { algo: string }) => {
  const classMap: Record<string, string> = {
    'RSA-PSS': 'algo-rsa',
    'DSA': 'algo-dsa',
    'ECDSA': 'algo-ecdsa',
    'Ed25519': 'algo-ed',
  };
  return (
    <span className={`algo-badge ${classMap[algo] || 'algo-rsa'}`}>
      {algo}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', gap: 8, marginBottom: 2 }}>
          <span style={{ color: 'var(--ink-2)' }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: p.color }}>
            {typeof p.value === 'number' ? p.value.toFixed(3) : p.value}
            {p.name.includes('ms') ? ' ms' : p.name.includes('bytes') ? ' B' : ''}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Benchmark() {
  const qc = useQueryClient();
  const docs = useQuery({
    queryKey: ['docs'],
    queryFn: async () => {
      const { data } = await api.get('/documents');
      return data.documents;
    },
  });
  const bench = useQuery({
    queryKey: ['bench'],
    queryFn: async () => {
      const { data } = await api.get('/benchmarks');
      return data.benchmarks;
    },
  });

  const [documentId, setDocumentId] = useState('');
  const [algorithm, setAlgorithm] = useState<string>('Ed25519');
  const [runs, setRuns] = useState(100);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  async function run() {
    setLoading(true);
    setLastResult(null);
    try {
      const { data } = await api.post('/benchmarks/run', { documentId, algorithm, runs });
      setLastResult(data);
      qc.invalidateQueries({ queryKey: ['bench'] });
    } catch (e: any) {
      alert(e.response?.data?.message || 'Benchmark failed');
    } finally {
      setLoading(false);
    }
  }

  // Aggregate chart: latest per algorithm
  const latestByAlgo: Record<string, any> = {};
  (bench.data || []).forEach((x: any) => {
    latestByAlgo[x.algorithm] = x;
  });
  const barData = Object.values(latestByAlgo).map((x: any) => ({
    algorithm: x.algorithm,
    sign: parseFloat(x.signingTime?.toFixed(3)),
    verify: parseFloat(x.verificationTime?.toFixed(3)),
    size: x.signatureSize ?? 0,
  }));

  const radarData = Object.values(latestByAlgo).map((x: any) => ({
    subject: x.algorithm,
    'Sign Speed': Math.max(0, 100 - (x.signingTime || 0) * 10),
    'Verify Speed': Math.max(0, 100 - (x.verificationTime || 0) * 10),
    'Compactness': Math.max(0, 100 - (x.signatureSize || 0) / 10),
  }));

  const recent = (bench.data || []).slice(0, 15);

  return (
    <RequireAuth>
      <Shell>
        <div className="fade-in">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div className="section-label" style={{ marginBottom: 6 }}>Benchmark Lab</div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>
                Algorithm Performance
              </h1>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 6 }}>
                Run controlled experiments and compare measurable performance.
              </p>
            </div>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || '/api'}/benchmarks/export.csv`}
              className="btn btn-secondary"
            >
              <FiDownload size={14} />
              Export CSV
            </a>
          </div>

          {/* Run panel */}
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiPlay size={15} style={{ color: 'var(--brand-light)' }} />
              Configure & Run
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Document
                </label>
                <select className="input" value={documentId} onChange={e => setDocumentId(e.target.value)}>
                  <option value="">Select document</option>
                  {docs.data?.map((d: any) => (
                    <option key={d._id} value={d._id}>{d.fileName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Algorithm
                </label>
                <select className="input" value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
                  {ALGORITHMS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Iterations
                </label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  max={500}
                  value={runs}
                  onChange={e => setRuns(Number(e.target.value))}
                />
              </div>
              <button
                className="btn btn-primary"
                disabled={!documentId || loading}
                onClick={run}
                style={{ height: 44 }}
              >
                {loading ? (
                  <><div className="spinner" /> Running…</>
                ) : (
                  <><FiZap size={14} /> Run {runs} tests</>
                )}
              </button>
            </div>

            {/* Last result inline */}
            {lastResult && (
              <div style={{
                marginTop: 20,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 12,
                borderTop: '1px solid var(--border)',
                paddingTop: 20,
              }}>
                {[
                  { label: 'Algorithm', value: lastResult.algorithm, icon: FiZap },
                  { label: 'Sign time', value: `${lastResult.signingTime?.toFixed(3)} ms`, icon: FiClock },
                  { label: 'Verify time', value: `${lastResult.verificationTime?.toFixed(3)} ms`, icon: FiRefreshCw },
                  { label: 'Sig size', value: `${lastResult.signatureSize} bytes`, icon: FiPackage },
                ].map(m => (
                  <div key={m.label} style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '14px 16px',
                  }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                      {m.label}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--brand-light)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* Bar chart */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>
                Sign vs Verify Time
              </h2>
              <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 20 }}>Milliseconds per operation</p>
              <div style={{ height: 260 }}>
                {barData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="algorithm" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={50} unit=" ms" />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                      <Bar dataKey="sign" name="Sign (ms)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="verify" name="Verify (ms)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
                    Run a benchmark to see results
                  </div>
                )}
              </div>
            </div>

            {/* Radar chart */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>
                Algorithm Comparison
              </h2>
              <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 20 }}>Normalized score (higher = better)</p>
              <div style={{ height: 260 }}>
                {radarData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--ink-2)' }} />
                      <PolarRadiusAxis tick={{ fontSize: 10, fill: 'var(--ink-3)' }} angle={30} domain={[0, 100]} />
                      <Radar name="Sign Speed" dataKey="Sign Speed" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
                      <Radar name="Verify Speed" dataKey="Verify Speed" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                      <Radar name="Compactness" dataKey="Compactness" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
                    Run benchmarks for multiple algorithms
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Signature size chart */}
          {barData.length > 0 && (
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>
                Signature Size
              </h2>
              <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 20 }}>Bytes per algorithm</p>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit=" B" />
                    <YAxis dataKey="algorithm" type="category" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="size" name="Size (bytes)" radius={[0, 4, 4, 0]}
                      label={{ position: 'right', fontSize: 11, fill: 'var(--ink-2)' }}
                    >
                      {barData.map((entry, index) => (
                        <rect key={`cell-${index}`} fill={ALGO_COLORS[entry.algorithm] || '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Records table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>Benchmark Records</h2>
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{bench.data?.length ?? 0} records</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Algorithm</th>
                    <th>Iterations</th>
                    <th>Sign Time</th>
                    <th>Verify Time</th>
                    <th>Sig Size</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((x: any) => (
                    <tr key={x._id}>
                      <td><AlgoBadge algo={x.algorithm} /></td>
                      <td style={{ color: 'var(--ink-2)' }}>{x.runs?.toLocaleString()}</td>
                      <td>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#818cf8' }}>
                          {x.signingTime?.toFixed(3)} ms
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#34d399' }}>
                          {x.verificationTime?.toFixed(3)} ms
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--ink-2)' }}>
                          {x.signatureSize ?? '—'} B
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!bench.data?.length && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--ink-3)' }}>
                        No benchmark records yet. Run your first test above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Shell>
    </RequireAuth>
  );
}
