import React from 'react';
import { Cloud, ShieldCheck, Database, HardDrive } from 'lucide-react';

export default function Navbar({ cloudStatus }) {
  const isConnected = cloudStatus?.online && cloudStatus?.cloud?.s3Connected;

  return (
    <header>
      <div className="nav-wrap">
        <div className="logo-group">
          <div className="logo-icon">
            <Cloud size={24} color="#031024" />
          </div>
          <div className="logo-text">
            <h1>CloudVault</h1>
            <p>Chunked &amp; AES-256 Encrypted Cloud Storage</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="cloud-pill" style={{
            background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderColor: isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
            color: isConnected ? 'var(--success)' : 'var(--danger)'
          }}>
            <span 
              className="cloud-dot" 
              style={{ 
                background: isConnected ? 'var(--success)' : 'var(--danger)',
                boxShadow: isConnected ? '0 0 8px var(--success)' : '0 0 8px var(--danger)'
              }} 
            />
            <span>
              {isConnected 
                ? `AWS S3 Connected (${cloudStatus?.cloud?.region || 'ap-south-1'})` 
                : 'AWS S3 Connecting...'}
            </span>
          </div>

          <div style={{
            fontSize: '0.75rem',
            padding: '6px 12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '999px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}>
            Bucket: {cloudStatus?.cloud?.bucket || 'chunked-file-storage-jainil'}
          </div>
        </div>
      </div>
    </header>
  );
}
