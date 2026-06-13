import SystemClock from '../SystemClock/SystemClock.jsx';
import './AdminHeader.css';

export default function AdminHeader({ config }) {
  const isOpen = config.formularioAbierto;
  const statusColor = isOpen ? '#4CAF50' : '#F44336';

  return (
    <div className="admin-header">
      <div className="admin-header-title">🥐 <span>Admin</span> Medialunas</div>
      <SystemClock />
      <div className="status-controls">
        <div className="status-badge">
          <div className="status-dot" style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
          <span className="status-text">{isOpen ? 'Abierto' : 'Cerrado'}</span>
        </div>
      </div>
    </div>
  );
}
