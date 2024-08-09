import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Utility to recursively add files and folders to the target folder
const addFilesToFolder = (items, folder, pathParts) => {
  let targetFolder = folder;

  for (const part of pathParts) {
    targetFolder = targetFolder.children.find(child => child.name === part && child.isFolder);
    if (!targetFolder) return; // If folder not found, exit
  }

  items.forEach(item => {
    targetFolder.children.push(item);
  });
};

// Utility to parse DataTransferItem into a structured file/folder format
const parseDataTransferItems = async (items) => {
  const parsedItems = [];

  for (const item of items) {
    const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : item.getAsEntry();

    if (entry) {
      if (entry.isDirectory) {
        const folderItem = await parseDirectory(entry);
        parsedItems.push(folderItem);
      } else {
        const file = await new Promise((resolve, reject) => {
          entry.file(resolve, reject);
        });
        parsedItems.push({ name: file.name, isFolder: false, file });
      }
    } else {
      console.warn('Invalid entry:', entry);
    }
  }
  return parsedItems;
};

// Recursively parse a directory entry into a folder structure
const parseDirectory = async (dirEntry) => {
  const folder = { name: dirEntry.name, isFolder: true, children: [] };

  const dirReader = dirEntry.createReader();
  const entries = await new Promise((resolve, reject) => {
    dirReader.readEntries(resolve, reject);
  });

  for (const entry of entries) {
    if (entry.isDirectory) {
      folder.children.push(await parseDirectory(entry));
    } else {
      const file = await new Promise((resolve, reject) => {
        entry.file(resolve, reject);
      });
      folder.children.push({ name: file.name, isFolder: false, file });
    }
  }
  return folder;
};

// File component
const File = ({ name, onClick }) => {
  return (
    <div 
      style={{ marginLeft: '20px', cursor: 'pointer' }} 
      onClick={onClick}
    >
      📄 {name}
    </div>
  );
};

// FolderContents component to display files on the right
const FolderContents = ({ folder, onDrop }) => {
  return (
    <div 
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{ minHeight: '500px' }}
    >
      <h3>{folder.name}</h3>
      <div>
        {folder.children.map((item, index) =>
          item.isFolder ? (
            <div key={index} style={{ fontWeight: 'bold' }}>
              📁 {item.name}
            </div>
          ) : (
            <div key={index}>
              📄 {item.name}
            </div>
          )
        )}
      </div>
    </div>
  );
};

// Folder component
const Folder = ({ folder, path, onFileDrop, onFolderSelect, selectedFolder, openFileModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const toggleOpen = async (e) => {
    e.stopPropagation();
    onFolderSelect(folder); // Set the selected folder when opened

    // Fetch folder contents if needed
    if (!isOpen) {
      const response = await axios.get('http://localhost:5000/api/filesystem');
      setIsOpen(true);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event from propagating up the DOM tree
    const items = Array.from(e.dataTransfer.items);
    const parsedItems = await parseDataTransferItems(items);
    const pathArray = path.split('/').filter(part => part);
    setIsOpen(true); // Open the folder when an item is dropped into it
    setIsDraggingOver(false); // Reset the dragging state
    onFileDrop(parsedItems, pathArray);

    // Upload files and folders to the server
    const formData = new FormData();
    const flattenItems = (items) => items.flatMap(item => item.isFolder ? [item, ...flattenItems(item.children)] : [item]);

    flattenItems(parsedItems).forEach(item => {
      if (item.file) {
        formData.append('files', item.file);
      }
    });

    await axios.post('http://localhost:5000/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event from propagating up the DOM tree
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const isSelected = selectedFolder && selectedFolder.name === folder.name;

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{
        marginLeft: '20px',
        padding: '10px',
      }}
    >
      <div
        onClick={toggleOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          border: isSelected ? '2px solid blue' : isDraggingOver ? '2px solid blue' : '1px dashed lightgray',
          padding: '5px',
          backgroundColor: isSelected ? 'lightblue' : isDraggingOver ? 'lightblue' : 'transparent',
          cursor: 'pointer'
        }}
      >
        <span onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}>
          {isOpen ? <span>-</span> : <span>+</span>}
        </span>
        <span style={{ marginLeft: '5px' }}>
          {folder.name}
        </span>
      </div>
      {isOpen && (
        <div style={{ paddingLeft: '20px' }}>
          {folder.children.map((item, index) =>
            item.isFolder ? (
              <Folder
                key={index}
                folder={item}
                path={path ? `${path}/${item.name}` : item.name}
                onFileDrop={onFileDrop}
                onFolderSelect={onFolderSelect}
                selectedFolder={selectedFolder}
                openFileModal={openFileModal}
              />
            ) : (
              <File 
                key={index} 
                name={item.name} 
                onClick={() => openFileModal(item.name)} 
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

// FileTree component
const FileTree = () => {
  const [fileSystem, setFileSystem] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchFileSystem = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/filesystem');
        setFileSystem(response.data);
      } catch (error) {
        console.error('Error fetching file system:', error);
      }
    };

    fetchFileSystem();
  }, []);

  const handleFileDrop = (items, pathParts) => {
    const newFileSystem = { ...fileSystem };
    addFilesToFolder(items, newFileSystem, pathParts);
    setFileSystem(newFileSystem);
  };

  const handleFolderSelect = (folder) => {
    setSelectedFolder(folder);
  };

  const openFileModal = async (fileName) => {
    try {
      const response = await axios.get(`http://localhost:5000/files/${fileName}`, { responseType: 'arraybuffer' });
      const fileBlob = new Blob([response.data], { type: response.headers['content-type'] });
      setSelectedFile({ name: fileName, blob: fileBlob });
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching file:', error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedFile(null);
  };

  const handleRightSideDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event from propagating up the DOM tree
    if (selectedFolder) {
      const items = Array.from(e.dataTransfer.items);
      const parsedItems = await parseDataTransferItems(items);
      const pathArray = [selectedFolder.name]; // Upload to selected folder

      // Upload files and folders to the server
      const formData = new FormData();
      const flattenItems = (items) => items.flatMap(item => item.isFolder ? [item, ...flattenItems(item.children)] : [item]);

      flattenItems(parsedItems).forEach(item => {
        if (item.file) {
          formData.append('files', item.file);
        }
      });

      await axios.post('http://localhost:5000/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      // Refresh file system
      const response = await axios.get('http://localhost:5000/api/filesystem');
      setFileSystem(response.data);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '30%', borderRight: '1px solid lightgray' }}>
        {fileSystem && (
          <Folder
            folder={fileSystem}
            path=""
            onFileDrop={handleFileDrop}
            onFolderSelect={handleFolderSelect}
            selectedFolder={selectedFolder}
            openFileModal={openFileModal}
          />
        )}
      </div>
      <div
        style={{ width: '70%', padding: '20px' }}
        onDrop={handleRightSideDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {selectedFolder ? (
          <FolderContents folder={selectedFolder} onDrop={handleRightSideDrop} />
        ) : (
          <div>Select a folder to view its contents</div>
        )}
      </div>
      {modalVisible && selectedFile && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', backgroundColor: 'white', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
          <h2>{selectedFile.name}</h2>
          <iframe src={URL.createObjectURL(selectedFile.blob)} style={{ width: '100%', height: '500px' }} />
          <button onClick={closeModal}>Close</button>
        </div>
      )}
    </div>
  );
};

export default FileTree;
