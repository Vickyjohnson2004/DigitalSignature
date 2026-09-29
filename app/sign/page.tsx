'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Shell } from '../../components/Shell';
import { RequireAuth } from '../../components/RequireAuth';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiPenTool,
  FiClock,
  FiPackage,
  FiKey,
  FiCheckCircle,
  FiArrowRight,
  FiCopy,
  FiCheck,
  FiFileText,
  FiShield,
  FiAlertCircle,
} from 'react-icons/fi';

const ALGO_COLORS: Record<string, string> = {
  'RSA-PSS': '#6366f1',
  'DSA': '#06b6d4',
  'ECDSA': '#10b981',
  'Ed25519': '#f59e0b',
};

const ALGO_DESC: Record<string, string> = {
  'RSA-PSS': 'Probabilistic Signature Scheme (2048-bit) — robust, widely deployed',
  'DSA': 'Digital Signature Algorithm (2048-bit) — FIPS legacy standard',
  'ECDSA': 'Elliptic Curve (NIST P-256) — compact signatures, high security',
  'Ed25519': 'Edwards-curve (EdDSA) — ultra-fast, modern, deterministic',
};

export default function Sign() {
  const docs = useQuery({
    queryKey: ['docs'],
    queryFn: async () => {
      const { data } = await api.get('/documents');
      return data.documents;
    },
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const [documentId, setDocumentId] = useState('');
  const [algorithm, setAlgorithm] = useState('Ed25519');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const d = p.get('docId');
      if (d) setDocumentId(d);
    }
  }, []);

  async function handleSign() {
    if (!documentId) {
      setErrorMessage('Please select a document to sign.');
      return;
    }
    setLoading(true);
    setResult(null);
    setErrorMessage(null);
    try {
      const { data } = await api.post('/signatures/sign', { documentId, algorithm });
      setResult(data);
    } catch (e: any) {
      setErrorMessage(e.response?.data?.message || 'Signature generation failed.');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  const selectedDoc = docs.data?.find((d: any) => d._id === documentId);

  return (
    <RequireAuth>
      <Shell>
        <div className="fade-in">
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-label" style={{ marginBottom: 6 }}>Cryptography Engine</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>
              Sign Document
            </h1>
            <p style={{ color: 'var(--ink-2)', marginTop: 6, fontSize: 14 }}>
              Generate verifiable digital signatures across RSA-PSS, DSA, ECDSA, and Ed25519.
            </p>
          </div>

          {errorMessage && (
            <div
              style={{
                marginBottom: 20,
                padding: '14px 18px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <FiAlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(320px, 1.2fr)', gap: 24, alignItems: 'start' }}>
            {/* Config panel */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiPenTool size={15} style={{ color: 'var(--brand-light)' }} />
                Signing Configuration
              </h2>

              {/* Document selector */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
                  Target Document
                </label>
                <select
                  className="input"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  style={{ width: '100%', height: 44 }}
                >
                  <option value="">— Select a document to sign —</option>
                  {docs.data?.map((d: any) => (
                    <option key={d._id} value={d._id}>
                      {d.fileName} ({Math.round(d.fileSize / 1024) || 1} KB)
                    </option>
                  ))}
                </select>

                {docs.data?.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>
                    No documents uploaded yet.{' '}
                    <Link href="/documents" style={{ color: 'var(--brand-light)', fontWeight: 600 }}>
                      Upload one in Documents →
                    </Link>
                  </div>
                )}

                {selectedDoc && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiFileText size={13} />
                      SHA-256 Hash:
                    </span>
                    <span className="mono" style={{ color: 'var(--brand-light)', fontSize: 11 }}>
                      {selectedDoc.fileHash?.slice(0, 16)}…{selectedDoc.fileHash?.slice(-8)}
                    </span>
                  </div>
                )}
              </div>

              {/* Algorithm picker */}
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>
                  Signature Algorithm
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {Object.entries(ALGO_DESC).map(([algo, desc]) => {
                    const color = ALGO_COLORS[algo];
                    const selected = algorithm === algo;
                    return (
                      <button
                        key={algo}
                        type="button"
                        onClick={() => setAlgorithm(algo)}
                        style={{
                          background: selected ? color + '22' : 'var(--surface)',
                          border: `1px solid ${selected ? color : 'var(--border)'}`,
                          borderRadius: 12,
                          padding: '12px 14px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          boxShadow: selected ? `0 0 16px ${color}33` : 'none',
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: 14, color: selected ? color : 'var(--ink)', marginBottom: 4 }}>
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
                onClick={handleSign}
                style={{ width: '100%', height: 48, fontSize: 15, fontWeight: 700 }}
              >
                {loading ? (
                  <>
                    <div className="spinner" /> Generating Cryptographic Signature…
                  </>
                ) : (
                  <>
                    <FiPenTool size={16} /> Sign Document with {algorithm}
                  </>
                )}
              </button>

              <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiKey size={12} style={{ color: 'var(--brand-light)' }} />
                Standard cryptographic keypair generated ephemerally; public key saved with signature.
              </p>
            </div>

            {/* Result panel */}
            {result ? (
              <div className="card card-glow fade-in" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: 'var(--emerald-dim)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--emerald)',
                    }}
                  >
                    <FiCheckCircle size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--ink)' }}>Signature Generated</div>
                    <div style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>Cryptographic signature verified and saved to database</div>
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'Algorithm', value: result.signature?.algorithm, icon: FiPenTool, mono: false },
                    { label: 'Signing Latency', value: `${result.metrics?.signingTimeMs?.toFixed(3)} ms`, icon: FiClock, mono: true },
                    { label: 'Signature Size', value: `${result.signature?.signatureSize} bytes`, icon: FiPackage, mono: true },
                    { label: 'Key Format', value: 'PKCS#8 / SPKI', icon: FiKey, mono: false },
                  ].map((m) => (
                    <div
                      key={m.label}
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        padding: '12px 14px',
                      }}
                    >
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <m.icon size={11} />
                        {m.label}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: 'var(--ink)',
                          fontFamily: m.mono ? "'JetBrains Mono', monospace" : 'inherit',
                        }}
                      >
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Signature Payload Box */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase' }}>
                      Base64 Signature Payload
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.signature?.signatureValue || '', 'sig')}
                      className="btn btn-secondary"
                      style={{ fontSize: 11, padding: '4px 8px', height: 'auto' }}
                    >
                      {copiedField === 'sig' ? <><FiCheck size={11} /> Copied</> : <><FiCopy size={11} /> Copy</>}
                    </button>
                  </div>
                  <div
                    className="mono"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 11,
                      wordBreak: 'break-all',
                      maxHeight: 70,
                      overflowY: 'auto',
                      color: 'var(--ink-2)',
                    }}
                  >
                    {result.signature?.signatureValue}
                  </div>
                </div>

                {/* Public Key Box */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase' }}>
                      Verification Public Key (PEM)
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.signature?.publicKey || '', 'key')}
                      className="btn btn-secondary"
                      style={{ fontSize: 11, padding: '4px 8px', height: 'auto' }}
                    >
                      {copiedField === 'key' ? <><FiCheck size={11} /> Copied</> : <><FiCopy size={11} /> Copy</>}
                    </button>
                  </div>
                  <div
                    className="mono"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 10,
                      maxHeight: 70,
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      color: 'var(--ink-2)',
                    }}
                  >
                    {result.signature?.publicKey}
                  </div>
                </div>

                <Link
                  className="btn btn-primary"
                  href={`/verify?sigId=${result.signature?.id}&docId=${documentId}`}
                  style={{ width: '100%', justifyContent: 'center', height: 44, fontWeight: 700 }}
                >
                  <FiShield size={15} />
                  Verify this Signature Now <FiArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="card" style={{ padding: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 340, textAlign: 'center' }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 18,
                    background: 'var(--brand-dim)',
                    border: '1px solid var(--brand-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-light)',
                    marginBottom: 16,
                  }}
                >
                  <FiPenTool size={26} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--ink)', marginBottom: 8 }}>
                  Ready to Sign
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', maxWidth: 280, lineHeight: 1.5 }}>
                  Select an uploaded document on the left, choose your algorithm, and click Sign to generate cryptographic proofs.
                </div>
              </div>
            )}
          </div>
        </div>
      </Shell>
    </RequireAuth>
  );
}
