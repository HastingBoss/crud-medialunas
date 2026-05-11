import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UserForm from './pages/UserForm';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, background: 'rgba(0,0,0,0.5)', padding: '5px', borderRadius: '5px' }}>
        <Link to="/" style={{ color: 'white', marginRight: '10px' }}>User</Link>
        <Link to="/admin" style={{ color: 'white' }}>Admin</Link>
      </div>
      <Routes>
        <Route path="/" element={<UserForm />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
