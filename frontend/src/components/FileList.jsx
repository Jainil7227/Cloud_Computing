import React, { useState } from 'react';
import { API_BASE } from '../apiConfig';
import { 
  DownloadCloud, 
  Trash2, 
  Eye, 
  ShieldCheck, 
  FileText, 
  Layers, 
  Clock, 
  Check, 
  Copy,
  AlertTriangle 
} from 'lucide-react';

export default function FileList({ files = [], onFileDeleted, onInspectFile }) {
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (file) => {
    setDownloadingId(file.fileId);
    try {
      const res = await fetch(`${API_BASE}/api/download/${file.fileId}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to download and reassemble file');
      }

      // Convert response stream to blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error('Download error:', err);
      alert(`Download failed: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file and all its chunks from AWS S3?')) {
      return;
    }

    setDeletingId(fileId);
    try {
      const res = await fetch(`${API_BASE}/api/files/${fileId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete file from S3');
      if (onFileDeleted) onFileDeleted(fileId);
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const copyChecksum = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  if (!files || files.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Layers size={48} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '16px' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>No Files in Cloud Storage Yet</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
          Upload any file above to witness real-time slicing into chunks, AES-256 encryption, and direct transmission to Amazon S3.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Cloud Storage Ledger &amp; Chunk Directory</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            All files are stored as encrypted, split chunk objects on Amazon S3 bucket.
          </p>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>
          {files.length} {files.length === 1 ? 'file' : 'files'} stored
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>File Name</th>
              <th>Total Size</th>
              <th>S3 Chunks</th>
              <th>Encryption</th>
              <th>SHA-256 Checksum</th>
              <th>Uploaded At</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.fileId}>
                {/* File Name */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: 'rgba(0, 210, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)'
                    }}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#fff' }}>{file.originalName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        ID: {file.fileId.substring(0, 13)}...
                      </div>
                    </div>
                  </div>
                </td>

                {/* Size */}
                <td style={{ fontWeight: '600', color: '#e5e7eb' }}>
                  {formatBytes(file.totalSizeBytes)}
                </td>

                {/* Chunks */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge badge-s3">
                      <Layers size={12} />
                      {file.totalChunks} Chunks
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      ({formatBytes(file.chunkSizeBytes)}/blk)
                    </span>
                  </div>
                </td>

                {/* Encryption */}
                <td>
                  <span className="badge badge-enc">
                    <ShieldCheck size={12} />
                    {file.encryptionAlgorithm || 'AES-256-CBC'}
                  </span>
                </td>

                {/* Checksum */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)'
                    }}>
                      {file.originalChecksum ? file.originalChecksum.substring(0, 10) + '...' : 'N/A'}
                    </span>
                    {file.originalChecksum && (
                      <button
                        type="button"
                        onClick={() => copyChecksum(file.originalChecksum)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedHash === file.originalChecksum ? 'var(--success)' : 'var(--text-dim)',
                          cursor: 'pointer'
                        }}
                        title="Copy full SHA-256 checksum"
                      >
                        {copiedHash === file.originalChecksum ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </td>

                {/* Date */}
                <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {new Date(file.uploadedAt).toLocaleDateString()} {new Date(file.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>

                {/* Actions */}
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    {/* Inspect Chunks */}
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onInspectFile(file)}
                      title="Inspect encrypted S3 chunks & ciphertext"
                    >
                      <Eye size={14} />
                      Inspect
                    </button>

                    {/* Download & Reassemble */}
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleDownload(file)}
                      disabled={downloadingId === file.fileId}
                      title="Download all chunks from AWS S3, decrypt with AES-256, and reassemble"
                    >
                      <DownloadCloud size={14} />
                      {downloadingId === file.fileId ? 'Reassembling...' : 'Download'}
                    </button>

                    {/* Delete */}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(file.fileId)}
                      disabled={deletingId === file.fileId}
                      title="Delete all chunks from AWS S3"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
