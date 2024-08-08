import React, { useState } from 'react';

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

// Utility to parse a DataTransferItem into a structured file/folder format
const parseDataTransferItems = async (items) => {
  const parsedItems = [];

  for (const item of items) {
    const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : item.getAsEntry();

    if (entry.isDirectory) {
      const folderItem = await parseDirectory(entry);
      parsedItems.push(folderItem);
    } else {
      const file = await new Promise((resolve, reject) => {
        entry.file(resolve, reject);
      });
      parsedItems.push({ name: file.name, isFolder: false });
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
      folder.children.push({ name: file.name, isFolder: false });
    }
  }
  return folder;
};

// File component
const File = ({ name }) => {
  return (
    <div style={{ marginLeft: '20px' }}>
      {name}
    </div>
  );
};

// Folder component
const Folder = ({ folder, path, onFileDrop }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event from propagating up the DOM tree
    const items = Array.from(e.dataTransfer.items);
    const parsedItems = await parseDataTransferItems(items);
    const pathArray = path.split('/').filter(part => part);
    setIsOpen(true); // Open the folder when an item is dropped into it
    setIsDraggingOver(false); // Reset the dragging state
    onFileDrop(parsedItems, pathArray); // Convert path to array of parts
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

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{
        marginLeft: '20px',
        border: isDraggingOver ? '2px solid blue' : '1px dashed lightgray',
        padding: '10px',
        backgroundColor: isDraggingOver ? 'lightblue' : 'transparent'
      }}
    >
      <div onClick={toggleOpen} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        {/* <span style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
          ►
        </span> */}
        {isOpen ? <span>-</span>:<span>+</span>}
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
              />
            ) : (
              <File key={index} name={item.name} />
            )
          )}
        </div>
      )}
    </div>
  );
};

// FileTree component
const FileTree = ({ structure }) => {
  const [fileSystem, setFileSystem] = useState(structure);
  console.log("fileSystem-----------.",fileSystem);

  const handleFileDrop = (items, pathParts) => {
    const newFileSystem = { ...fileSystem };
    addFilesToFolder(items, newFileSystem, pathParts);
    setFileSystem(newFileSystem);
  };

  return (
    <div style={{ padding: '10px' }}>
      <Folder
        folder={fileSystem}
        path=""
        onFileDrop={handleFileDrop}
      />
    </div>
  );
};

export default FileTree;
