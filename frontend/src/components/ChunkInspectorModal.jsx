import React, { useState, useEffect } from 'react';
import { X, Lock, Shield, Eye, Download, Database, Check } from 'lucide-react';
import { API_BASE } from '../apiConfig';

export default function ChunkInspectorModal({ file, onClose }) {
  const [selectedChunkIndex, setSelectedChunkIndex] = useState(0);
  const [chunkDetail, setChunkDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedHex, setCopiedHex] = useState(false);

  useEffect(() => {
    if (file && file.chunks && file.chunks.length > 0) {
      fetchChunkDetails(selectedChunkIndex);
    }
  }, [file, selectedChunkIndex]);

  const fetchChunkDetails = async (idx) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/preview-chunk/${file.fileId}/${idx}`);
      const data = await res.json();
      setChunkDetail(data);
    } catch (err) {
      console.error('Failed to inspect chunk:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(true);
    setTimeout(() => setCopiedHex(false), 1500);
  };

  if (!file) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Shield size={20} color="#00d2ff" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Cloud Chunk &amp; Encryption Inspector</h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Inspecting Amazon S3 raw encrypted block for: <strong style={{ color: '#fff' }}>{file.originalName}</strong>
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Chunk selector tabs */}
        <div style={{ marginBottom: '18px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            Select S3 Chunk Block ({file.chunks.length} total):
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {file.chunks.map((c, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedChunkIndex(idx)}
                style={{
                  background: selectedChunkIndex === idx ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedChunkIndex === idx ? '#031024' : 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Lock size={12} />
                chunk_{idx}.enc
              </button>
            ))}
          </div>
        </div>

        {/* Details Card */}
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Fetching encrypted chunk directly from Amazon S3...
          </div>
        ) : chunkDetail ? (
          <div>
            <div style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '16px',
              fontSize: '0.8rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>S3 Object Key:</span>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', marginTop: '2px', wordBreak: 'break-all' }}>
                  {chunkDetail.s3Key}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)' }}>Target S3 Bucket:</span>
                <div style={{ fontFamily: 'var(--font-mono)', color: '#fff', marginTop: '2px' }}>
                  {chunkDetail.s3Bucket}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)' }}>Initialization Vector (IV):</span>
                <div style={{ fontFamily: 'var(--font-mono)', color: '#c084fc', marginTop: '2px', wordBreak: 'break-all' }}>
                  {chunkDetail.ivHex}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)' }}>Original vs Encrypted Size:</span>
                <div style={{ fontFamily: 'var(--font-mono)', color: '#10b981', marginTop: '2px' }}>
                  {chunkDetail.originalSizeBytes} bytes &rarr; {chunkDetail.encryptedSizeBytes} bytes
                </div>
              </div>
            </div>

            {/* Ciphertext Hex Sample Preview */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Eye size={14} /> Raw AES-256 Ciphertext Sample (Hexadecimal Stream from S3):
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(chunkDetail.previewHex)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copiedHex ? <Check size={14} color="var(--success)" /> : null}
                  {copiedHex ? 'Copied!' : 'Copy Hex'}
                </button>
              </div>

              <div className="code-box">
                {chunkDetail.previewHex}
              </div>
            </div>

            {/* Ciphertext Base64 Sample Preview */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Raw Ciphertext (Base64 Encoded):
              </span>
              <div className="code-box" style={{ color: '#c084fc' }}>
                {chunkDetail.previewBase64}
              </div>
            </div>

            {/* Download single chunk button for verification */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Download this single encrypted chunk file to verify in Notepad/Hex Editor.
              </div>
              <a
                href={`/api/download-encrypted-chunk/${file.fileId}/${selectedChunkIndex}`}
                download
                className="btn btn-secondary btn-sm"
              >
                <Download size={14} />
                Download Raw .enc Chunk
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
