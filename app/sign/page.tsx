'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Shell } from '../../components/Shell';
import { RequireAuth } from '../../components/RequireAuth';
import { useState } from 'react';
import Link from 'next/link';
import { FiPenTool, FiClock, FiPackage, FiKey, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const ALGO_COLORS: Record<string, string> = {
  'RSA-PSS': '#6366f1',
  'DSA': '#06b6d4',
  'ECDSA': '#10b981',
  'Ed25519': '#f59e0b',
};

const ALGO_DESC: Record<string, string> = {
  'RSA-PSS': 'Probabilistic Signature Scheme — robust and widely deployed',
  'DSA': 'FIPS-standard discrete-log signature — legacy compatible',
  'ECDSA': 'Elliptic Curve — smaller keys, strong security',
  'Ed25519': 'Edwards-curve — fastest, modern, deterministic',
};

export default function Sign() {
  const docs = useQuery({
    queryKey: ['docs'],
    queryFn: async () => {
      const { data } = await api.get('/documents');
      return data.documents;
    },
  });

  const [documentId, setDocumentId] = useState('');
  const [algorithm, setAlgorithm] = useState('Ed25519');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function sign() {
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/signatures/sign', { documentId, algorithm });
      setResult(data);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Signing failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <RequireAuth>
      <Shell>
        <div className="fade-in">
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-label" style={{ marginBottom: 6 }}>Cryptography</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>
              Sign Document
            </h1>
            <p style={{ color: 'var(--ink-2)', marginTop: 6, fontSize: 14 }}>
              Generate a cryptographic signature using an ephemeral private key.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
            {/* Config panel */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiPenTool size={15} style={{ color: 'var(--brand-light)' }} />
                Signing Configuration
              </h2>

              <label style={{ display: 'block', marginBottom: 18 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
                  Document
                </span>
                <select className="input" value={documentId} onChange={e => setDocumentId(e.target.value)}>
                  <option value="">Select a document</option>
                  {docs.data?.map((d: any) => (
                    <option key={d._id} value={d._id}>{d.fileName}</option>
                  ))}
                </select>
                {!docs.data?.length && (
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>
                    No documents yet.{' '}
                    <Link href="/documents" style={{ color: 'var(--brand-light)' }}>Upload one first →</Link>
                  </div>
                )}
              </label>

              {/* Algorithm picker */}
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>
                  Algorithm
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {Object.entries(ALGO_DESC).map(([algo, desc]) => {
                    const color = ALGO_COLORS[algo];
                    const selected = algorithm === algo;
                    return (
                      <button
                        key={algo}
                        onClick={() => setAlgorithm(algo)}
                        style={{
                          background: selected ? color + '22' : 'var(--surface)',
                          border: `1px solid ${selected ? color + '66' : 'var(--border)'}`,
                          borderRadius: 12,
                          padding: '12px 14px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 13, color: selected ? color : 'var(--ink)', marginBottom: 4 }}>
                          {algo}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.4 }}>{desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                className="btn btn-primary"
                disabled={!documentId || loading}
                onClick={sign}
                style={{ width: '100%', height: 46, fontSize: 15 }}
              >
                {loading
                  ? <><div className="spinner" /> Generating signature…</>
                  : <><FiPenTool size={16} /> Generate signature</>
                }
              </button>

              <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiKey size={11} />
                Private key is never persisted — generated ephemerally per signing.
              </p>
            </div>

            {/* Result panel */}
            {result ? (
              <div className="card card-glow fade-in" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'var(--emerald-dim)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--emerald)',
                  }}>
                    <FiCheckCircle size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>Signature Generated</div>
                    <div style={{ fontSize: 12, color: '#34d399' }}>Cryptographic operation successful</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'Algorithm', value: result.signature?.algorithm, icon: FiPenTool, mono: false },
                    { label: 'Signing time', value: `${result.metrics?.signingTimeMs?.toFixed(3)} ms`, icon: FiClock, mono: true },
                    { label: 'Signature size', value: `${result.signature?.signatureSize} bytes`, icon: FiPackage, mono: true },
                    { label: 'Key material', value: 'Public key retained', icon: FiKey, mono: false },
                  ].map(m => (
                    <div
                      key={m.label}
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        padding: '14px 16px',
                      }}
                    >
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <m.icon size={10} />
                        {m.label}
                      </div>
                      <div style={{
                        fontSize: 15, fontWeight: 700, color: 'var(--ink)',
                        fontFamily: m.mono ? "'JetBrains Mono', monospace" : 'inherit',
                      }}>
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>

                <Link className="btn btn-secondary" href="/verify" style={{ width: '100%', justifyContent: 'center' }}>
                  Verify this signature <FiArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: 'var(--brand-dim)',
                  border: '1px solid var(--brand-glow)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--brand-light)',
                  marginBottom: 16,
                }}>
                  <FiPenTool size={24} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 8 }}>
                  Ready to sign
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', maxWidth: 240 }}>
                  Select a document and algorithm, then generate your signature.
                </div>
              </div>
            )}
          </div>
        </div>
      </Shell>
    </RequireAuth>
  );
}
