'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Shell } from '../../components/Shell';
import { RequireAuth } from '../../components/RequireAuth';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiShield,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiHash,
  FiFileText,
  FiRefreshCw,
  FiAlertCircle,
  FiZap,
  FiXCircle,
  FiCopy,
  FiCheck,
  FiActivity,
  FiKey,
} from 'react-icons/fi';

const ALGO_COLORS: Record<string, string> = {
  'RSA-PSS': '#6366f1',
  'DSA': '#06b6d4',
  'ECDSA': '#10b981',
  'Ed25519': '#f59e0b',
};

export default function Verify() {
  const qc = useQueryClient();

  const sigs = useQuery({
    queryKey: ['sigs'],
    queryFn: async () => {
      const { data } = await api.get('/signatures');
      return data.signatures;
    },
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const docs = useQuery({
    queryKey: ['docs'],
    queryFn: async () => {
      const { data } = await api.get('/documents');
      return data.documents;
    },
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const logs = useQuery({
    queryKey: ['verify-logs'],
    queryFn: async () => {
      const { data } = await api.get('/signatures/verify');
      return data.verificationLogs;
    },
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const [signatureId, setSignatureId] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSig, setCopiedSig] = useState(false);
  const [showKeyDetails, setShowKeyDetails] = useState(false);

  // Map of documentId -> Document object
  const docMap = (docs.data || []).reduce((acc: any, d: any) => {
    acc[d._id] = d;
    return acc;
  }, {});

  // URL query parameter parsing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const s = p.get('sigId');
      const d = p.get('docId');
      if (s) setSignatureId(s);
      if (d) setDocumentId(d);
    }
  }, []);

  // Auto-populate document if signature is pre-selected from URL
  useEffect(() => {
    if (signatureId && !documentId && sigs.data) {
      const selected = sigs.data.find((s: any) => s._id === signatureId);
      if (selected?.documentId) {
        setDocumentId(selected.documentId);
      }
    }
  }, [signatureId, sigs.data, documentId]);

  // When signature selection changes, auto-select its source document
  function handleSignatureChange(id: string) {
    setSignatureId(id);
    setResult(null);
    setErrorMessage(null);
    const selected = sigs.data?.find((s: any) => s._id === id);
    if (selected?.documentId) {
      setDocumentId(selected.documentId);
    }
  }

  async function handleVerify(simulateCorruption = false) {
    if (!signatureId || !documentId) {
      setErrorMessage('Please select both a signature and a document payload.');
      return;
    }
    setLoading(true);
    setResult(null);
    setErrorMessage(null);
    try {
      const { data } = await api.post('/signatures/verify', {
        signatureId,
        documentId,
        corruptSignature: simulateCorruption,
      });
      setResult(data);
      qc.invalidateQueries({ queryKey: ['verify-logs'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (e: any) {
      setErrorMessage(e.response?.data?.message || 'Verification execution failed.');
    } finally {
      setLoading(false);
    }
  }

  function handleSimulateTamperedDoc() {
    const selected = sigs.data?.find((s: any) => s._id === signatureId);
    const alternative = docs.data?.find((d: any) => d._id !== selected?.documentId);
    if (alternative) {
      setDocumentId(alternative._id);
      setResult(null);
      setErrorMessage(null);
    } else {
      setErrorMessage('Please upload or generate at least two documents in Documents to test tamper comparison.');
    }
  }

  function handleResetToAuthenticDoc() {
    const selected = sigs.data?.find((s: any) => s._id === signatureId);
    if (selected?.documentId) {
      setDocumentId(selected.documentId);
      setResult(null);
      setErrorMessage(null);
    }
  }

  const selectedSig = sigs.data?.find((s: any) => s._id === signatureId);
  const selectedDoc = docs.data?.find((d: any) => d._id === documentId);
  const isDocTampered = selectedSig && selectedDoc && selectedSig.documentId !== selectedDoc._id;
  const isValid = result?.status === 'Valid';
  const isTampered = result?.status === 'Tampered';

  // Compute average verification latencies across algorithms from log data
  const algoBenchmarks = ['RSA-PSS', 'DSA', 'ECDSA', 'Ed25519'].map((algo) => {
    const matchingLogs = (logs.data || []).filter(
      (l: any) => l.signatureId?.algorithm === algo || l.remarks?.includes(algo)
    );
    const count = matchingLogs.length;
    const avgTime = count > 0
      ? matchingLogs.reduce((acc: number, l: any) => acc + (l.verificationTime || 0), 0) / count
      : null;
    return { algo, count, avgTime };
  });

  return (
    <RequireAuth>
      <Shell>
        <div className="fade-in">
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div>
              <div className="section-label" style={{ marginBottom: 6 }}>Cryptographic Verification</div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>
                Verify Signature
              </h1>
              <p style={{ color: 'var(--ink-2)', marginTop: 6, fontSize: 14 }}>
                Validate document authenticity, signature integrity, and measure verification performance.
              </p>
            </div>
            <button
              onClick={() => {
                sigs.refetch();
                docs.refetch();
                logs.refetch();
              }}
              disabled={sigs.isFetching || docs.isFetching}
              className="btn btn-secondary"
              style={{ fontSize: 13, padding: '8px 14px' }}
              title="Refresh signatures, documents, and logs"
            >
              <FiRefreshCw size={13} style={{ animation: sigs.isFetching ? 'spin 0.8s linear infinite' : 'none' }} />
              Refresh Data
            </button>
          </div>

          {/* Quick Algorithm Latency Benchmark Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
            {algoBenchmarks.map(({ algo, count, avgTime }) => (
              <div
                key={algo}
                className="card"
                style={{
                  padding: '14px 18px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderTop: `3px solid ${ALGO_COLORS[algo]}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: ALGO_COLORS[algo] }}>
                    {algo}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                    {count} {count === 1 ? 'test' : 'tests'}
                  </span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', fontFamily: "'JetBrains Mono', monospace" }}>
                  {avgTime !== null ? `${avgTime.toFixed(3)} ms` : '—'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                  Avg. Verification Latency
                </div>
              </div>
            ))}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.15fr) minmax(320px, 1.25fr)', gap: 24, alignItems: 'start', marginBottom: 28 }}>
            {/* Verification Parameters card */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiShield size={15} style={{ color: 'var(--brand-light)' }} />
                Verification Parameters
              </h2>

              {/* Signature selection */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
                  Cryptographic Signature
                </label>
                <select
                  className="input"
                  value={signatureId}
                  onChange={(e) => handleSignatureChange(e.target.value)}
                  style={{ width: '100%', height: 44 }}
                >
                  <option value="">— Select a signature to verify —</option>
                  {sigs.data?.map((s: any) => {
                    const originalDocName = docMap[s.documentId]?.fileName || 'Unknown File';
                    return (
                      <option key={s._id} value={s._id}>
                        [{s.algorithm}] {originalDocName} (ID: …{s._id.slice(-6)})
                      </option>
                    );
                  })}
                </select>

                {!sigs.data?.length && (
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>
                    No signatures generated yet.{' '}
                    <Link href="/sign" style={{ color: 'var(--brand-light)', fontWeight: 600 }}>
                      Generate one in Sign →
                    </Link>
                  </div>
                )}

                {selectedSig && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: '12px 14px',
                      borderRadius: 8,
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink)' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: (ALGO_COLORS[selectedSig.algorithm] || '#6366f1') + '22',
                            color: ALGO_COLORS[selectedSig.algorithm] || '#6366f1',
                            border: `1px solid ${ALGO_COLORS[selectedSig.algorithm] || '#6366f1'}44`,
                          }}
                        >
                          {selectedSig.algorithm}
                        </span>
                        <span style={{ color: 'var(--ink-2)' }}>Size: {selectedSig.signatureSize} bytes</span>
                      </span>
                      <button
                        onClick={() => setShowKeyDetails(!showKeyDetails)}
                        className="btn btn-secondary"
                        style={{ fontSize: 11, padding: '4px 8px', height: 26 }}
                      >
                        <FiKey size={11} /> {showKeyDetails ? 'Hide Key' : 'Inspect Key'}
                      </button>
                    </div>

                    {showKeyDetails && (
                      <div className="fade-in" style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>Public Key (PEM)</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedSig.publicKey);
                              setCopiedKey(true);
                              setTimeout(() => setCopiedKey(false), 2000);
                            }}
                            className="btn btn-secondary"
                            style={{ fontSize: 10, padding: '2px 6px', height: 22 }}
                          >
                            {copiedKey ? <FiCheck size={10} color="#10b981" /> : <FiCopy size={10} />}
                            {copiedKey ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <pre
                          className="mono"
                          style={{
                            fontSize: 10,
                            background: 'var(--surface-raised)',
                            padding: 8,
                            borderRadius: 6,
                            maxHeight: 90,
                            overflowY: 'auto',
                            color: 'var(--ink-2)',
                            margin: 0,
                          }}
                        >
                          {selectedSig.publicKey}
                        </pre>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>Signature Value (Base64)</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedSig.signatureValue);
                              setCopiedSig(true);
                              setTimeout(() => setCopiedSig(false), 2000);
                            }}
                            className="btn btn-secondary"
                            style={{ fontSize: 10, padding: '2px 6px', height: 22 }}
                          >
                            {copiedSig ? <FiCheck size={10} color="#10b981" /> : <FiCopy size={10} />}
                            {copiedSig ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <pre
                          className="mono"
                          style={{
                            fontSize: 10,
                            background: 'var(--surface-raised)',
                            padding: 8,
                            borderRadius: 6,
                            maxHeight: 60,
                            overflowY: 'auto',
                            wordBreak: 'break-all',
                            whiteSpace: 'pre-wrap',
                            color: 'var(--ink-2)',
                            margin: 0,
                          }}
                        >
                          {selectedSig.signatureValue}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Document selection */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Document to Validate Against
                  </label>
                  {isDocTampered && (
                    <span style={{ fontSize: 11, color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiAlertTriangle size={11} /> Simulating Tampered Payload
                    </span>
                  )}
                </div>

                <select
                  className="input"
                  value={documentId}
                  onChange={(e) => {
                    setDocumentId(e.target.value);
                    setResult(null);
                  }}
                  style={{
                    width: '100%',
                    height: 44,
                    borderColor: isDocTampered ? 'rgba(239, 68, 68, 0.5)' : undefined,
                  }}
                >
                  <option value="">— Select document payload —</option>
                  {docs.data?.map((d: any) => (
                    <option key={d._id} value={d._id}>
                      {d.fileName} ({Math.round(d.fileSize / 1024) || 1} KB)
                    </option>
                  ))}
                </select>

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
                      flexWrap: 'wrap',
                      gap: 6,
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

              {/* Tamper / Attack Simulation Buttons */}
              <div
                style={{
                  padding: '14px',
                  borderRadius: 10,
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid var(--border)',
                  fontSize: 12,
                  color: 'var(--ink-2)',
                  marginBottom: 20,
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiZap size={13} style={{ color: 'var(--brand-light)' }} />
                  Tamper & Integrity Simulation Test
                </div>
                <p style={{ margin: '0 0 10px 0', fontSize: 12, color: 'var(--ink-2)' }}>
                  Test how the cryptographic engine verifies authentic data vs detects tampering or forged signatures:
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleResetToAuthenticDoc}
                    disabled={!selectedSig || !isDocTampered}
                    className="btn btn-secondary"
                    style={{ fontSize: 11, padding: '5px 10px', height: 28 }}
                  >
                    <FiCheck size={11} color="#10b981" /> Authentic Document
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulateTamperedDoc}
                    disabled={!selectedSig || (docs.data?.length ?? 0) < 2}
                    className="btn btn-secondary"
                    style={{ fontSize: 11, padding: '5px 10px', height: 28, color: '#f87171' }}
                  >
                    <FiAlertTriangle size={11} /> Simulate Tampered Doc
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerify(true)}
                    disabled={!signatureId || !documentId || loading}
                    className="btn btn-secondary"
                    style={{ fontSize: 11, padding: '5px 10px', height: 28, color: '#f87171' }}
                  >
                    <FiXCircle size={11} /> Simulate Forged Signature
                  </button>
                </div>
              </div>

              <button
                className="btn btn-primary"
                disabled={!signatureId || !documentId || loading}
                onClick={() => handleVerify(false)}
                style={{ width: '100%', height: 48, fontSize: 15, fontWeight: 700 }}
              >
                {loading ? (
                  <>
                    <div className="spinner" /> Performing Verification…
                  </>
                ) : (
                  <>
                    <FiShield size={16} /> Verify Digital Signature
                  </>
                )}
              </button>
            </div>

            {/* Results card */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: isValid ? 'var(--emerald-dim)' : 'var(--red-dim)',
                      border: `1px solid ${isValid ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isValid ? '#34d399' : '#fca5a5',
                      fontSize: 26,
                      flexShrink: 0,
                    }}
                  >
                    {isValid ? <FiCheckCircle size={26} /> : isTampered ? <FiAlertTriangle size={26} /> : <FiXCircle size={26} />}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 900,
                        color: isValid ? '#34d399' : '#fca5a5',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {result.status}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 2 }}>{result.remarks}</div>
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <FiClock size={11} /> Verification Latency
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {result.verificationTimeMs?.toFixed(3)} ms
                    </div>
                  </div>

                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <FiShield size={11} /> Algorithm Tested
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: ALGO_COLORS[result.algorithm] || 'var(--ink)' }}>
                      {result.algorithm || selectedSig?.algorithm || 'Cryptographic'}
                    </div>
                  </div>
                </div>

                {/* Hash integrity check */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <FiHash size={11} /> Verified Document Hash
                    </span>
                    <span style={{ color: isValid ? '#34d399' : '#f87171', fontWeight: 700, fontSize: 11 }}>
                      {isValid ? 'Hash Match: Verified' : 'Hash Mismatch / Invalid'}
                    </span>
                  </div>
                  <code style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--ink-2)', wordBreak: 'break-all', lineHeight: 1.6 }}>
                    {result.documentHash}
                  </code>
                </div>
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
                  <FiShield size={26} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--ink)', marginBottom: 8 }}>
                  Awaiting Verification
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', maxWidth: 280, lineHeight: 1.5 }}>
                  Select a digital signature on the left to verify its mathematical validity and document payload integrity.
                </div>
              </div>
            )}
          </div>

          {/* Verification Audit Log Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>Recent Verification Performance Log</h2>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Historical verification results and execution latency benchmarks</p>
              </div>
              <span style={{ fontSize: 12, color: 'var(--ink-3)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 10px' }}>
                {logs.data?.length ?? 0} records
              </span>
            </div>

            <div>
              {logs.data?.length === 0 && (
                <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--ink-3)' }}>
                  <p style={{ fontSize: 13 }}>No verification checks logged yet. Run a verification test above.</p>
                </div>
              )}

              {logs.data?.map((l: any) => {
                const isLValid = l.verificationStatus === 'Valid';
                const isLTampered = l.verificationStatus === 'Tampered';
                const logAlgo = l.signatureId?.algorithm;
                return (
                  <div
                    key={l._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 24px',
                      borderBottom: '1px solid var(--border)',
                      fontSize: 13,
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {isLValid ? (
                        <FiCheckCircle size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                      ) : isLTampered ? (
                        <FiAlertTriangle size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />
                      ) : (
                        <FiXCircle size={16} style={{ color: '#fca5a5', flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          {logAlgo && (
                            <span
                              style={{
                                fontWeight: 800,
                                fontSize: 10,
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: (ALGO_COLORS[logAlgo] || '#6366f1') + '22',
                                color: ALGO_COLORS[logAlgo] || '#6366f1',
                                border: `1px solid ${ALGO_COLORS[logAlgo] || '#6366f1'}44`,
                              }}
                            >
                              {logAlgo}
                            </span>
                          )}
                          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{l.remarks}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3 }}>
                          {new Date(l.verifiedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 11, color: 'var(--ink-3)', display: 'block' }}>Latency</span>
                        <span className="mono" style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 12 }}>
                          {l.verificationTime?.toFixed(3)} ms
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 20,
                          background: isLValid
                            ? 'rgba(16, 185, 129, 0.15)'
                            : isLTampered
                            ? 'rgba(251, 191, 36, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                          color: isLValid ? '#34d399' : isLTampered ? '#fbbf24' : '#fca5a5',
                          border: `1px solid ${
                            isLValid
                              ? 'rgba(16, 185, 129, 0.3)'
                              : isLTampered
                              ? 'rgba(251, 191, 36, 0.3)'
                              : 'rgba(239, 68, 68, 0.3)'
                          }`,
                        }}
                      >
                        {l.verificationStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Shell>
    </RequireAuth>
  );
}
