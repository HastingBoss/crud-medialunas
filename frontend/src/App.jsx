import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import UserForm from './pages/UserForm';
import AdminDashboard from './pages/AdminDashboard';
import InstallPWA from './components/InstallPWA/InstallPWA';

function ManifestSwitcher() {
  const location = useLocation();

  useEffect(() => {
    const link = document.querySelector('link[rel="manifest"]');
    if (link) {
      if (location.pathname.startsWith('/admin')) {
        link.setAttribute('href', '/admin-manifest.json');
      } else {
        link.setAttribute('href', '/manifest.json');
      }
    }
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <Router>
      {import.meta.env.DEV && (
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, background: 'rgba(0,0,0,0.5)', padding: '5px', borderRadius: '5px' }}>
          <Link to="/" style={{ color: 'white', marginRight: '10px' }}>User</Link>
          <Link to="/admin" style={{ color: 'white' }}>Admin</Link>
        </div>
      )}
      <ManifestSwitcher />
      <Routes>
        <Route path="/" element={<UserForm />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <InstallPWA />
    </Router>
  );
}

export default App;
