import React, { useEffect } from 'react';
import './App.css';
import FileTree from './components/fileSystem';
import FileUpload from './components/fileUpload';
import FolderUpload from './components/folderUpload';
import { fileSystem } from './jsonData/sampleJsonData';

function App() {


  // ---------to stop right click -------------
  // useEffect(() => {
  //   const disableRightClick = (e) => {
  //     e.preventDefault();
  //   };
  //   document.addEventListener('contextmenu', disableRightClick);
  //   return () => {
  //     document.removeEventListener('contextmenu', disableRightClick);
  //   };
  // }, []);

  return (
    <div> 
      {/* <FileUpload/> */}
      <FileTree structure={fileSystem} />
      {/* <FolderUpload/> */}
    </div>
  );
}

export default App;
