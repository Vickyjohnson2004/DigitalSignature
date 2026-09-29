'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Shell } from '../../components/Shell';
import { RequireAuth } from '../../components/RequireAuth';
import { useState } from 'react';
import Link from 'next/link';
import {
  FiUpload,
  FiDownload,
  FiFileText,
  FiHash,
  FiTrash2,
  FiPenTool,
  FiActivity,
  FiCopy,
  FiCheck,
  FiZap,
  FiRefreshCw,
} from 'react-icons/fi';

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

const SAMPLE_TEMPLATES = [
  {
    name: 'contract_agreement.txt',
    type: 'text/plain',
    label: 'Contract Agreement',
    icon: '📄',
    desc: 'Sample legal non-disclosure & asset transfer text',
    content: `DIGITAL ASSET TRANSFER & NONDISCLOSURE AGREEMENT

This Agreement is entered into on this 29th day of September, 2026, by and between:
Party A: Cryptographic Systems Inc., having its principal office at Suite 400, Tech Park.
Party B: Global Verification Authority, having its registered office at Cyber Gateway.

1. PURPOSE
The parties agree to test, evaluate, and benchmark digital signature schemes including RSA-PSS, DSA, ECDSA, and Ed25519 for tamper-evident data integrity verification.

2. INTEGRITY VERIFICATION
Any alteration of even a single byte or bit of this text shall render the associated cryptographic signature invalid under all standard verification procedures.

3. EXECUTION
This document serves as standard test payload for digital signature benchmarking.`,
  },
  {
    name: 'academic_paper_abstract.txt',
    type: 'text/plain',
    label: 'Research Paper Abstract',
    icon: '📝',
    desc: 'Comparative study on RSA-PSS, DSA, ECDSA, Ed25519',
    content: `TITLE: Comparative Performance Analysis of Digital Signature Schemes for Secure Document Verification

ABSTRACT:
Digital signatures form the bedrock of authentication, non-repudiation, and message integrity in modern computer systems. This study conducts a comparative empirical evaluation of four primary digital signature algorithms: RSA-PSS (2048-bit with Probabilistic Signature Scheme padding), DSA (2048-bit Digital Signature Algorithm), ECDSA (Elliptic Curve Digital Signature Algorithm using NIST P-256), and Ed25519 (Edwards-curve Digital Signature Algorithm).

We measure signing latency, verification latency, and raw signature payload size across varying workloads. Our experimental analysis demonstrates that Ed25519 and ECDSA offer superior signature compactness and significantly accelerated signing throughput, whereas RSA-PSS exhibits asymmetric advantages in verification efficiency. The findings provide quantitative guidance for protocol designers choosing signature standards in cloud and embedded environments.

KEYWORDS: RSA-PSS, ECDSA, Ed25519, DSA, Cryptographic Verification, Benchmark Analysis.`,
  },
  {
    name: 'financial_report.csv',
    type: 'text/csv',
    label: 'Financial Ledger (CSV)',
    icon: '📊',
    desc: 'Structured ledger table with transaction records',
    content: `TransactionID,Timestamp,AccountFrom,AccountTo,AmountUSD,Currency,Status
TX100982,2026-09-29T10:15:30Z,ACC-882109,ACC-991204,14500.00,USD,CLEARED
TX100983,2026-09-29T10:18:12Z,ACC-110293,ACC-449102,8920.50,USD,CLEARED
TX100984,2026-09-29T10:22:45Z,ACC-552190,ACC-331092,234100.00,USD,AUDITED
TX100985,2026-09-29T10:25:01Z,ACC-774019,ACC-662910,450.25,USD,CLEARED`,
  },
];

export default function Documents() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['docs'],
    queryFn: async () => {
      const { data } = await api.get('/documents');
      return data.documents;
    },
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function loadTemplate(template: (typeof SAMPLE_TEMPLATES)[0]) {
    const blob = new Blob([template.content], { type: template.type });
    const f = new File([blob], template.name, { type: template.type });
    setFile(f);
    setStatusMsg({ type: 'success', text: `Loaded template: "${template.name}". Click "Upload" to store and compute its hash.` });
  }

  async function download(id: string, name: string) {
    try {
      const { data } = await api.get(`/documents/${id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.response?.data?.message || 'Download failed' });
    }
  }

  async function deleteDoc(id: string, name: string) {
    if (!confirm(`Delete "${name}" and its associated signatures?`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/documents/${id}`);
      qc.invalidateQueries({ queryKey: ['docs'] });
      setStatusMsg({ type: 'success', text: `Deleted "${name}" successfully` });
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.response?.data?.message || 'Delete failed' });
    } finally {
      setDeletingId(null);
    }
  }

  async function upload() {
    if (!file) return;
    setLoading(true);
    setStatusMsg(null);
    const fd = new FormData();
    fd.append('file', file);
    try {
      await api.post('/documents', fd);
      setFile(null);
      qc.invalidateQueries({ queryKey: ['docs'] });
      setStatusMsg({ type: 'success', text: `Uploaded "${file.name}" successfully! SHA-256 computed.` });
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.response?.data?.message || 'Upload failed' });
    } finally {
      setLoading(false);
    }
  }

  function copyHash(id: string, hash: string) {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const extIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    if (ext === 'csv') return '📊';
    if (['json', 'xml'].includes(ext || '')) return '⚙️';
    return '📃';
  };

  return (
    <RequireAuth>
      <Shell>
        <div className="fade-in">
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
            <div>
              <div className="section-label" style={{ marginBottom: 6 }}>Payload Management</div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>
                Documents
              </h1>
              <p style={{ color: 'var(--ink-2)', marginTop: 6, fontSize: 14 }}>
                Upload source documents for cryptographic hashing (SHA-256), signing (RSA-PSS, DSA, ECDSA, Ed25519), and benchmark analysis.
              </p>
            </div>
            <button
              onClick={() => q.refetch()}
              disabled={q.isFetching}
              className="btn btn-secondary"
              style={{ fontSize: 13, padding: '8px 14px', cursor: q.isFetching ? 'wait' : 'pointer' }}
              title="Refresh documents list"
            >
              <FiRefreshCw size={13} style={{ animation: q.isFetching ? 'spin 0.8s linear infinite' : 'none' }} />
              {q.isFetching ? 'Refreshing...' : 'Refresh Documents'}
            </button>
          </div>

          {/* Feedback banner */}
          {statusMsg && (
            <div
              style={{
                marginBottom: 20,
                padding: '12px 16px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: statusMsg.type === 'success' ? '#34d399' : '#f87171',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{statusMsg.text}</span>
              <button
                onClick={() => setStatusMsg(null)}
                style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16 }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Quick-test templates */}
          <div className="card" style={{ padding: 20, marginBottom: 20, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <FiZap size={16} style={{ color: 'var(--brand-light)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Instant Test Payloads (1-Click)
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 14 }}>
              Don&apos;t have a file ready? Click any sample document below to load it instantly:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {SAMPLE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  onClick={() => loadTemplate(tmpl)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--brand)';
                    e.currentTarget.style.background = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'var(--surface)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>{tmpl.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{tmpl.label}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{tmpl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload card */}
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiUpload size={15} style={{ color: 'var(--brand-light)' }} />
              Upload Source Document
            </h2>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) setFile(f);
              }}
              style={{
                border: `2px dashed ${dragOver ? 'var(--brand)' : 'var(--border-bright)'}`,
                borderRadius: 14,
                padding: '36px 20px',
                textAlign: 'center',
                transition: 'all 0.2s',
                background: dragOver ? 'var(--brand-dim)' : 'var(--surface)',
                cursor: 'pointer',
                marginBottom: 16,
              }}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>
                {file ? extIcon(file.name) : '☁️'}
              </div>
              {file ? (
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15, marginBottom: 4 }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                    {formatBytes(file.size)} • Click to choose a different file
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 15, marginBottom: 4 }}>
                    Drop your file here, or click to browse
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                    Supports TXT, PDF, DOCX, CSV, JSON, XML, MD (up to 10 MB)
                  </div>
                </div>
              )}
              <input
                id="file-input"
                type="file"
                accept=".pdf,.txt,.doc,.docx,.csv,.json,.xml,.md,.rtf,.log"
                style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
              {file && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setFile(null)}
                  disabled={loading}
                  style={{ fontSize: 13 }}
                >
                  Clear Selection
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={upload}
                disabled={!file || loading}
                style={{ minWidth: 160 }}
              >
                {loading ? (
                  <>
                    <div className="spinner" /> Uploading & Hashing…
                  </>
                ) : (
                  <>
                    <FiUpload size={14} /> Upload & Compute Hash
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Documents list */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>Stored Payloads & Hashes</h2>
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--ink-3)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  padding: '3px 10px',
                }}
              >
                {q.data?.length ?? 0} {q.data?.length === 1 ? 'document' : 'documents'}
              </span>
            </div>

            <div>
              {q.isLoading && (
                <div style={{ padding: '36px', textAlign: 'center', color: 'var(--ink-3)' }}>
                  <div className="spinner" style={{ margin: '0 auto 12px' }} />
                  Loading documents...
                </div>
              )}

              {q.data?.length === 0 && (
                <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-3)' }}>
                  <FiFileText size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>No documents uploaded yet</p>
                  <p style={{ fontSize: 13 }}>Click one of the Instant Test Payloads above or browse for any file to get started.</p>
                </div>
              )}

              {q.data?.map((d: any) => (
                <div
                  key={d._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s',
                    flexWrap: 'wrap',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* File icon */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'var(--brand-dim)',
                      border: '1px solid var(--brand-glow)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {extIcon(d.fileName)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: 'var(--ink)',
                        fontSize: 14,
                        marginBottom: 4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {d.fileName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                        {formatBytes(d.fileSize)}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--ink-3)' }}>
                          <FiHash size={11} />
                          <span className="mono" style={{ fontSize: 11 }}>
                            {d.fileHash?.slice(0, 16)}…{d.fileHash?.slice(-8)}
                          </span>
                        </span>
                        <button
                          onClick={() => copyHash(d._id, d.fileHash)}
                          title="Copy Full SHA-256 Hash"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: copiedId === d._id ? '#10b981' : 'var(--ink-3)',
                            cursor: 'pointer',
                            padding: 2,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {copiedId === d._id ? <FiCheck size={12} /> : <FiCopy size={12} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Link
                      href={`/sign?docId=${d._id}`}
                      className="btn btn-secondary"
                      style={{ fontSize: 12, padding: '7px 12px' }}
                    >
                      <FiPenTool size={12} />
                      Sign
                    </Link>

                    <Link
                      href={`/benchmark?docId=${d._id}`}
                      className="btn btn-secondary"
                      style={{ fontSize: 12, padding: '7px 12px' }}
                    >
                      <FiActivity size={12} />
                      Benchmark
                    </Link>

                    <button
                      className="btn btn-secondary"
                      onClick={() => download(d._id, d.fileName)}
                      title="Download Document"
                      style={{ fontSize: 12, padding: '7px 12px' }}
                    >
                      <FiDownload size={12} />
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={() => deleteDoc(d._id, d.fileName)}
                      disabled={deletingId === d._id}
                      title="Delete Document"
                      style={{
                        fontSize: 12,
                        padding: '7px 12px',
                        color: 'var(--accent-red, #ef4444)',
                        borderColor: 'rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Shell>
    </RequireAuth>
  );
}
