import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import StatsOverview from './components/StatsOverview';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import ChunkInspectorModal from './components/ChunkInspectorModal';
import { API_BASE } from './apiConfig';

export default function App() {
  const [cloudStatus, setCloudStatus] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inspectingFile, setInspectingFile] = useState(null);

  const fetchCloudStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/status`);
      const data = await res.json();
      setCloudStatus(data);
    } catch (err) {
      console.error('Failed to fetch status:', err);
      setCloudStatus({ online: false, error: err.message });
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/files`);
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error('Failed to fetch files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCloudStatus();
    fetchFiles();
  }, []);

  const handleUploadSuccess = (newFile) => {
    setFiles(prev => [newFile, ...prev]);
    fetchCloudStatus();
  };

  const handleFileDeleted = (fileId) => {
    setFiles(prev => prev.filter(f => f.fileId !== fileId));
    if (inspectingFile && inspectingFile.fileId === fileId) {
      setInspectingFile(null);
    }
  };

  return (
    <div>
      <div className="container">
        <Navbar cloudStatus={cloudStatus} />
        <ArchitectureDiagram />
        <StatsOverview files={files} cloudStatus={cloudStatus} />
        <FileUpload onUploadSuccess={handleUploadSuccess} />
        <FileList 
          files={files} 
          onFileDeleted={handleFileDeleted}
          onInspectFile={(f) => setInspectingFile(f)}
        />

        {inspectingFile && (
          <ChunkInspectorModal 
            file={inspectingFile} 
            onClose={() => setInspectingFile(null)} 
          />
        )}
      </div>
    </div>
  );
}
