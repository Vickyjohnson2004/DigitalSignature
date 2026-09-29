'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Shell } from '../../components/Shell';
import { RequireAuth } from '../../components/RequireAuth';
import { useState } from 'react';
import { FiUpload, FiDownload, FiFile, FiFileText, FiHash } from 'react-icons/fi';

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

export default function Documents() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['docs'],
    queryFn: async () => {
      const { data } = await api.get('/documents');
      return data.documents;
    },
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function download(id: string, name: string) {
    try {
      const { data } = await api.get(`/documents/${id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url; a.download = name; a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Download failed');
    }
  }

  async function upload() {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      await api.post('/documents', fd);
      setFile(null);
      qc.invalidateQueries({ queryKey: ['docs'] });
    } catch (e: any) {
      alert(e.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  const extIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    return '📃';
  };

  return (
    <RequireAuth>
      <Shell>
        <div className="fade-in">
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-label" style={{ marginBottom: 6 }}>File Manager</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>
              Documents
            </h1>
            <p style={{ color: 'var(--ink-2)', marginTop: 6, fontSize: 14 }}>
              Upload and manage source documents for signing and verification.
            </p>
          </div>

          {/* Upload area */}
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiUpload size={15} style={{ color: 'var(--brand-light)' }} />
              Upload Document
            </h2>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) setFile(f);
              }}
              style={{
                border: `2px dashed ${dragOver ? 'var(--brand)' : 'var(--border-bright)'}`,
                borderRadius: 14,
                padding: '32px 20px',
                textAlign: 'center',
                transition: 'all 0.2s',
                background: dragOver ? 'var(--brand-dim)' : 'var(--surface)',
                cursor: 'pointer',
                marginBottom: 16,
              }}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>
                {file ? extIcon(file.name) : '☁️'}
              </div>
              {file ? (
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15, marginBottom: 4 }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                    {formatBytes(file.size)} • Click to change
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--ink-2)', fontSize: 14, marginBottom: 4 }}>
                    Drop file here or click to browse
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                    PDF, TXT, DOC, DOCX supported
                  </div>
                </div>
              )}
              <input
                id="file-input"
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                style={{ display: 'none' }}
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              {file && (
                <button className="btn btn-secondary" onClick={() => setFile(null)}>
                  Clear
                </button>
              )}
              <button className="btn btn-primary" onClick={upload} disabled={!file || loading}>
                {loading ? <><div className="spinner" /> Uploading…</> : <><FiUpload size={14} /> Upload</>}
              </button>
            </div>
          </div>

          {/* Documents list */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>Your Documents</h2>
              <span style={{ fontSize: 12, color: 'var(--ink-3)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 10px' }}>
                {q.data?.length ?? 0} files
              </span>
            </div>
            <div>
              {q.data?.length === 0 && (
                <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-3)' }}>
                  <FiFileText size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <p style={{ fontSize: 14 }}>No documents yet. Upload your first file above.</p>
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
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* File icon */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: 'var(--brand-dim)',
                    border: '1px solid var(--brand-glow)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>
                    {extIcon(d.fileName)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 14, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.fileName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                        {formatBytes(d.fileSize)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--ink-3)' }}>
                        <FiHash size={10} />
                        <span className="mono" style={{ fontSize: 11 }}>
                          {d.fileHash?.slice(0, 20)}…
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    className="btn btn-secondary"
                    onClick={() => download(d._id, d.fileName)}
                    style={{ fontSize: 13, padding: '8px 14px', flexShrink: 0 }}
                  >
                    <FiDownload size={14} />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Shell>
    </RequireAuth>
  );
}
