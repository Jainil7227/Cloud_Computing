import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, File, Lock, Cpu, Database } from 'lucide-react';

export default function FileUpload({ onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [chunkSize, setChunkSize] = useState(1048576); // 1MB default
  const [uploading, setUploading] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [estimatedChunks, setEstimatedChunks] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const chunkSizeOptions = [
    { label: '512 KB', bytes: 524288, hint: 'Best for demo (creates more chunks)' },
    { label: '1 MB', bytes: 1048576, hint: 'Default standard' },
    { label: '2 MB', bytes: 2097152, hint: 'Balanced' },
    { label: '5 MB', bytes: 5242880, hint: 'High throughput' },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setErrorMsg('');
    const count = Math.ceil(file.size / chunkSize);
    setEstimatedChunks(count);
  };

  const handleChunkSizeChange = (bytes) => {
    setChunkSize(bytes);
    if (selectedFile) {
      setEstimatedChunks(Math.ceil(selectedFile.size / bytes));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setErrorMsg('');
    setProgressStage('Dividing file into segments & generating AES-256 keys...');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('chunkSize', chunkSize);

    try {
      // Simulate live step updates for visual impact during demo
      setTimeout(() => {
        setProgressStage(`Encrypting ${estimatedChunks} chunks with AES-256-CBC & transmitting to AWS S3...`);
      }, 700);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload and chunk file');
      }

      setProgressStage('All chunks encrypted, uploaded to Amazon S3, and verified!');
      
      setTimeout(() => {
        setSelectedFile(null);
        setUploading(false);
        setProgressStage('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onUploadSuccess) onUploadSuccess(data.file);
      }, 1000);

    } catch (err) {
      console.error('Upload Error:', err);
      setErrorMsg(err.message || 'An error occurred during upload');
      setUploading(false);
      setProgressStage('');
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="glass-card" style={{ marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Upload &amp; Chunk File to Cloud</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Files are sliced into blocks, encrypted client-side with AES-256, and pushed directly to Amazon S3.
          </p>
        </div>

        {/* Chunk Size Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            Chunk Block Size:
          </span>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.04)', padding: '3px', borderRadius: '8px' }}>
            {chunkSizeOptions.map(opt => (
              <button
                key={opt.bytes}
                type="button"
                onClick={() => handleChunkSizeChange(opt.bytes)}
                disabled={uploading}
                style={{
                  background: chunkSize === opt.bytes ? 'var(--primary)' : 'transparent',
                  color: chunkSize === opt.bytes ? '#031024' : 'var(--text-muted)',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                title={opt.hint}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className={`dropzone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
          disabled={uploading}
        />

        <div className="dropzone-icon-wrap">
          <UploadCloud size={32} />
        </div>

        <h3>Drag &amp; Drop any file or image here</h3>
        <p>Supports Images, PDFs, Videos, ZIPs, or Documents (up to 100MB)</p>
      </div>

      {/* Selected File Card */}
      {selectedFile && (
        <div style={{
          marginTop: '18px',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(0, 210, 255, 0.1)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <File size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{selectedFile.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {formatBytes(selectedFile.size)} &bull; Will be sliced into{' '}
                <strong style={{ color: 'var(--primary)' }}>{estimatedChunks} chunks</strong> of{' '}
                {formatBytes(chunkSize)} each
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={uploading}
            >
              <Lock size={16} />
              {uploading ? 'Processing...' : 'Encrypt, Chunk & Upload to S3'}
            </button>
          </div>
        </div>
      )}

      {/* Live Chunk Visualization during Upload */}
      {uploading && (
        <div className="progress-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '600' }}>
              <Cpu size={16} /> {progressStage}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Target: AWS S3 (ap-south-1)
            </span>
          </div>

          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: '100%', animation: 'pulse 1.5s infinite' }} />
          </div>

          <div className="chunk-flow">
            {Array.from({ length: estimatedChunks }).map((_, idx) => (
              <div key={idx} className="chunk-pill active">
                <Database size={12} color="#00d2ff" />
                <span>chunk_{idx}.enc</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div style={{
          marginTop: '16px',
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#fca5a5',
          fontSize: '0.85rem'
        }}>
          <AlertCircle size={18} color="var(--danger)" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
