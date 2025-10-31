import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ChatInterfaceNebula from './components/ChatInterfaceNebula';
import AdminLayout from './components/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<ChatInterfaceNebula />} />
          <Route path="/admin_pan" element={<AdminLayout />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
