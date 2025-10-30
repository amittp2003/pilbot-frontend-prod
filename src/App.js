import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ChatInterfacePremium from './components/ChatInterfacePremium';
import AdminLayout from './components/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<ChatInterfacePremium />} />
          <Route path="/admin_pan" element={<AdminLayout />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
