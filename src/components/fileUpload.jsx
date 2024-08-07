import React, { useState, useRef } from 'react';
import axios from 'axios';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

const ChunkedUpload = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const currentChunkIndex = useRef(0);
  const totalChunks = useRef(0);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setProgress(0);
    currentChunkIndex.current = 0;
    totalChunks.current = Math.ceil(e.target.files[0].size / CHUNK_SIZE);
  };

  const uploadChunk = async () => {
    if (!file) return;

    const start = currentChunkIndex.current * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('file', chunk);
    formData.append('filename', file.name);
    formData.append('chunkIndex', currentChunkIndex.current);
    formData.append('totalChunks', totalChunks.current);

    try {
      await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          const chunkProgress = Math.round((event.loaded / event.total) * 100);
          setProgress(((currentChunkIndex.current * 100) / totalChunks.current) + (chunkProgress / totalChunks.current));
        },
      });
      currentChunkIndex.current += 1;
      if (currentChunkIndex.current < totalChunks.current) {
        uploadChunk();
      } else {
        setUploading(false);
        console.log('Upload complete');
      }
    } catch (error) {
      console.error('Error uploading chunk:', error);
      setUploading(false);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    uploadChunk();
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      <div style={{ marginTop: '10px' }}>
        <div
          style={{
            width: '100%',
            backgroundColor: '#e0e0e0',
            borderRadius: '5px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '20px',
              backgroundColor: '#3b82f6',
              transition: 'width 0.5s ease-in-out',
            }}
          ></div>
        </div>
        <div style={{ marginTop: '5px' }}>{progress}%</div>
      </div>
    </div>
  );
};

export default ChunkedUpload;
