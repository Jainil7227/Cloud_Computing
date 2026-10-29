import React from 'react';
import { Layers, Lock, UploadCloud, Server, Unlock, DownloadCloud, ArrowRight } from 'lucide-react';

export default function ArchitectureDiagram() {
  const steps = [
    {
      icon: <Layers size={18} color="#00d2ff" />,
      title: '1. File Chunking',
      desc: 'Buffer sliced into blocks (e.g. 1MB segments)'
    },
    {
      icon: <Lock size={18} color="#c084fc" />,
      title: '2. AES-256 Encryption',
      desc: 'Each chunk encrypted with unique 16B IV'
    },
    {
      icon: <UploadCloud size={18} color="#38bdf8" />,
      title: '3. Amazon S3 Upload',
      desc: 'Chunks stored as chunks/{id}/chunk_n.enc'
    },
    {
      icon: <DownloadCloud size={18} color="#f59e0b" />,
      title: '4. Direct S3 Fetch',
      desc: 'Encrypted chunks downloaded via AWS SDK'
    },
    {
      icon: <Unlock size={18} color="#10b981" />,
      title: '5. Decrypt Chunks',
      desc: 'Deciphered with master key & chunk IVs'
    },
    {
      icon: <Server size={18} color="#a855f7" />,
      title: '6. Reassembly',
      desc: 'Concatenation & SHA-256 integrity check'
    }
  ];

  return (
    <div className="arch-banner">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--primary)' }}>⚡</span> Direct AWS S3 Pipeline Architecture
        </h3>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Client-Side Chunking + Symmetric Encryption Protocol
        </span>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: '10px' 
      }}>
        {steps.map((st, i) => (
          <div 
            key={i} 
            style={{ 
              background: 'rgba(0, 0, 0, 0.25)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {st.icon}
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff' }}>{st.title}</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
              {st.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
