import React from 'react';
import './CutoffModals.css';

export default function CutoffModals({ 
  showExtendModal, setShowExtendModal, 
  showCloseConfirm, setShowCloseConfirm,
  showCierreHastaModal, setShowCierreHastaModal,
  extendTime, setExtendTime,
  cierreHastaDate, setCierreHastaDate,
  handleExtend, handleCloseNow, handleCierreHasta,
  cierreHasta, handleLevantarCierre
}) {
  return (
    <>
      {showExtendModal && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 12000 }}>
          <div className="modal-content" style={{ maxWidth: '320px' }}>
            <h3 className="modal-title">Modificar horario de corte</h3>
            <p className="modal-text">Elegí la nueva hora de cierre automático de pedidos.</p>
            <select className="modal-select" value={extendTime} onChange={e => setExtendTime(e.target.value)}>
              <option value="03:00">03:00 hs</option>
              <option value="04:00">04:00 hs</option>
              <option value="05:00">05:00 hs</option>
              <option value="06:00">06:00 hs</option>
              <option value="07:00">07:00 hs</option>
              <option value="07:30">07:30 hs</option>
              <option value="08:00">08:00 hs</option>
            </select>
            <div className="modal-actions">
              <button className="btn-modal btn-secondary" onClick={() => setShowExtendModal(false)}>Cancelar</button>
              <button className="btn-modal btn-primary" onClick={handleExtend}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {showCloseConfirm && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 12500 }}>
          <div className="modal-content" style={{ maxWidth: '350px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
            <h3 className="modal-title">¿Cerrar pedidos hoy?</h3>
            <p className="modal-text">
              Nadie podrá realizar nuevos pedidos para mañana hasta la medianoche.
            </p>
            <div className="modal-actions">
              <button className="btn-modal btn-secondary" onClick={() => setShowCloseConfirm(false)}>Cancelar</button>
              <button className="btn-modal btn-danger" onClick={handleCloseNow}>Cerrar pedidos</button>
            </div>
          </div>
        </div>
      )}

      {showCierreHastaModal && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 12500 }}>
          <div className="modal-content" style={{ maxWidth: '350px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📋</div>
            <h3 className="modal-title">Cerrar pedidos hasta una fecha</h3>
            <p className="modal-text">Los pedidos estarán deshabilitados hasta el día elegido inclusive.</p>
            {cierreHasta && (
              <div style={{ background: '#FFF8EC', border: '1px solid var(--gold)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '13px', color: 'var(--brown)' }}>
                ⚠️ Actualmente cerrado hasta <strong>{cierreHasta}</strong>.{' '}
                <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { handleLevantarCierre(); setShowCierreHastaModal(false); }}>
                  Levantar cierre
                </span>
              </div>
            )}
            <input
              type="date"
              className="modal-select"
              value={cierreHastaDate}
              onChange={e => setCierreHastaDate(e.target.value)}
              min={new Date().toLocaleDateString('sv-SE')}
            />
            <div className="modal-actions">
              <button className="btn-modal btn-secondary" onClick={() => setShowCierreHastaModal(false)}>Cancelar</button>
              <button className="btn-modal btn-danger" onClick={handleCierreHasta}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
