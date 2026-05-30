import SystemClock from '../SystemClock/SystemClock.jsx';
import './AdminHeader.css';

export default function AdminHeader({ config, onOpenCloseConfirm, onOpenExtendModal, onOpenCierreHastaModal }) {
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

        <button className="btn-extend" onClick={onOpenExtendModal}>
          {isOpen ? 'Modificar corte' : 'Extender'}
        </button>

        {isOpen && (
          <button className="btn-close-now" onClick={onOpenCloseConfirm}>
            Cerrar hoy
          </button>
        )}

        <button className="btn-close-now" style={{ background: '#856404', borderColor: '#856404' }} onClick={onOpenCierreHastaModal}>
          📋 Cerrar hasta...
        </button>
      </div>
    </div>
  );
}
