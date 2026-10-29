import React from 'react';
import { Files, Layers, ShieldCheck, Database } from 'lucide-react';

export default function StatsOverview({ files = [], cloudStatus }) {
  const totalFiles = files.length;
  const totalChunks = files.reduce((acc, curr) => acc + (curr.totalChunks || 0), 0);
  const totalBytes = files.reduce((acc, curr) => acc + (curr.totalSizeBytes || 0), 0);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stats = [
    {
      title: 'Files in Cloud',
      value: totalFiles,
      subtitle: 'Managed documents & media',
      icon: <Files size={22} color="#00d2ff" />,
      bg: 'rgba(0, 210, 255, 0.1)'
    },
    {
      title: 'Encrypted S3 Chunks',
      value: totalChunks,
      subtitle: 'Divided .enc segments on AWS',
      icon: <Layers size={22} color="#c084fc" />,
      bg: 'rgba(192, 132, 252, 0.1)'
    },
    {
      title: 'Total Cloud Storage',
      value: formatBytes(totalBytes),
      subtitle: 'Across all S3 chunk blocks',
      icon: <Database size={22} color="#38bdf8" />,
      bg: 'rgba(56, 189, 248, 0.1)'
    },
    {
      title: 'Security Standard',
      value: 'AES-256-CBC',
      subtitle: 'Unique IV per chunk segment',
      icon: <ShieldCheck size={22} color="#10b981" />,
      bg: 'rgba(16, 185, 129, 0.1)'
    }
  ];

  return (
    <div className="stat-grid">
      {stats.map((s, idx) => (
        <div key={idx} className="glass-card stat-box">
          <div className="stat-icon" style={{ background: s.bg }}>
            {s.icon}
          </div>
          <div>
            <div className="stat-val">{s.value}</div>
            <div className="stat-lbl" style={{ fontWeight: '600', color: '#fff', fontSize: '0.82rem' }}>
              {s.title}
            </div>
            <div className="stat-lbl">{s.subtitle}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
