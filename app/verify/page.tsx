'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Shell } from '../../components/Shell';
import { RequireAuth } from '../../components/RequireAuth';
import { useState } from 'react';
import { FiShield, FiCheckCircle, FiAlertTriangle, FiClock, FiHash } from 'react-icons/fi';

export default function Verify() {
  const sigs = useQuery({
    queryKey: ['sigs'],
    queryFn: async () => {
      const { data } = await api.get('/signatures');
      return data.signatures;
    },
  });
  const docs = useQuery({
    queryKey: ['docs'],
    queryFn: async () => {
      const { data } = await api.get('/documents');
      return data.documents;
    },
  });

  const [signatureId, setSignatureId] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function verify() {
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/signatures/verify', { signatureId, documentId });
      setResult(data);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  const isValid = result?.status === 'Valid';

  return (
    <RequireAuth>
      <Shell>
        <div className="fade-in">
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-label" style={{ marginBottom: 6 }}>Integrity Check</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>
              Verify Signature
            </h1>
            <p style={{ color: 'var(--ink-2)', marginTop: 6, fontSize: 14 }}>
              Validate authenticity and confirm document integrity.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
            {/* Config panel */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiShield size={15} style={{ color: 'var(--brand-light)' }} />
                Verification Parameters
              </h2>

              <label style={{ display: 'block', marginBottom: 18 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
                  Signature
                </span>
                <select className="input" value={signatureId} onChange={e => setSignatureId(e.target.value)}>
                  <option value="">Select a signature</option>
                  {sigs.data?.map((s: any) => (
                    <option key={s._id} value={s._id}>
                      {s.algorithm} • …{s._id.slice(-8)}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'block', marginBottom: 24 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
                  Document to verify
                </span>
                <select className="input" value={documentId} onChange={e => setDocumentId(e.target.value)}>
                  <option value="">Select document</option>
                  {docs.data?.map((d: any) => (
                    <option key={d._id} value={d._id}>{d.fileName}</option>
                  ))}
                </select>
              </label>

              <button
                className="btn btn-primary"
                disabled={!signatureId || !documentId || loading}
                onClick={verify}
                style={{ width: '100%', height: 46, fontSize: 15 }}
              >
                {loading
                  ? <><div className="spinner" /> Verifying…</>
                  : <><FiShield size={16} /> Verify signature</>
                }
              </button>

              <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 12, lineHeight: 1.5 }}>
                The system checks both document integrity (SHA-256 hash match) and cryptographic validity of the signature.
              </p>
            </div>

            {/* Result panel */}
            {result ? (
              <div
                className="card fade-in"
                style={{
                  padding: 24,
                  border: `1px solid ${isValid ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  boxShadow: `0 0 32px ${isValid ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'}`,
                }}
              >
                {/* Status header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: isValid ? 'var(--emerald-dim)' : 'var(--red-dim)',
                    border: `1px solid ${isValid ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isValid ? '#34d399' : '#fca5a5',
                    fontSize: 22,
                    flexShrink: 0,
                  }}>
                    {isValid ? <FiCheckCircle size={22} /> : <FiAlertTriangle size={22} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: isValid ? '#34d399' : '#fca5a5' }}>
                      {result.status}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{result.remarks}</div>
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <FiClock size={10} /> Verify time
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {result.verificationTimeMs?.toFixed(3)} ms
                    </div>
                  </div>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <FiShield size={10} /> Result
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>
                      <span className={isValid ? 'badge-valid' : 'badge-invalid'}>
                        {result.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hash */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <FiHash size={10} /> Document SHA-256
                  </div>
                  <code style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--ink-2)', wordBreak: 'break-all', lineHeight: 1.6 }}>
                    {result.documentHash}
                  </code>
                </div>
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
                  <FiShield size={24} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 8 }}>
                  Awaiting verification
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', maxWidth: 240 }}>
                  Select a signature and document to run the integrity check.
                </div>
              </div>
            )}
          </div>
        </div>
      </Shell>
    </RequireAuth>
  );
}
