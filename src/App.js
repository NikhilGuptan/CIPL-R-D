
import './App.css';
import FileTree from './components/fileSystem';
import FileUpload from './components/fileUpload';
import FolderUpload from './components/folderUpload';
import { fileSystem } from './jsonData/sampleJsonData';

function App() {
  return (
    <div> 
      {/* <FileUpload/> */}
      <FileTree structure={fileSystem} />
      {/* <FolderUpload/> */}
    </div>
  );
}

export default App;
