import React, { useEffect, useState } from 'react';
import './App.css';
import FileTree from './components/fileSystem';
import FileUpload from './components/fileUpload';
import FolderUpload from './components/folderUpload';
import { fileSystem } from './jsonData/sampleJsonData';

function App() {
  // const [checkInspectOpen,setcheckInspectOpen] = useState(true);
  // // ---------to stop right click -------------
  // Need to create a error screen like (you can not access govDrive when Inspect Element is open.)
  // useEffect(() => {
  //   const disableRightClick = (e) => {
  //     e.preventDefault();
  //   };
  //   document.addEventListener('contextmenu', disableRightClick);
  //   return () => {
  //     document.removeEventListener('contextmenu', disableRightClick);
  //   };
  // }, []);

  // // ---------to detect dev tools and redirect -------------
  // useEffect(() => {
  //   const detectDevTools = () => {
  //     const threshold = 160;
  //     const isDevToolsOpen = (e) => {
  //       if (e.outerHeight - e.innerHeight > threshold || e.outerWidth - e.innerWidth > threshold) {
  //         window.location.href = 'https://www.google.com/'; // Redirect to another page
  //       }else{
  //         setcheckInspectOpen(false);
  //       }
  //     };
  //     window.addEventListener('resize', () => isDevToolsOpen(window));
  //     isDevToolsOpen(window);
  //   };

  //   detectDevTools();
  // }, []);

  // if(checkInspectOpen){
  //   return
  // }

  return (
    <div> 
      {/* <FileUpload/> */}
      <FileTree structure={fileSystem} />
      {/* <FolderUpload/> */}
    </div>
  );
}

export default App;
