import React, { useState } from 'react';
import axios from 'axios';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

const FolderUpload = () => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleFolderChange = async (e) => {
    const files = e.target.files;
    const fileArray = Array.from(files);
    const totalFiles = fileArray.length;
    let uploadedFiles = 0;

    setProgress(0);
    setUploading(true);

    for (let file of fileArray) {
      await uploadFile(file);
      uploadedFiles += 1;
      setProgress(Math.round((uploadedFiles / totalFiles) * 100));
    }

    setUploading(false);
  };

  const uploadFile = async (file) => {
    let currentChunkIndex = 0;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    while (currentChunkIndex < totalChunks) {
      const start = currentChunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('filename', file.webkitRelativePath || file.name);
      formData.append('chunkIndex', currentChunkIndex);
      formData.append('totalChunks', totalChunks);

      await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      currentChunkIndex += 1;
    }
  };

  return (
    <div>
      <input type="file" webkitdirectory="true" mozdirectory="true" directory="true" multiple onChange={handleFolderChange} />
      <button disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Folder'}
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

export default FolderUpload;
