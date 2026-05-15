import React from 'react';
import './CutoffModals.css';

export default function CutoffModals({ 
  showExtendModal, setShowExtendModal, 
  showCloseConfirm, setShowCloseConfirm, 
  extendTime, setExtendTime, 
  handleExtend, handleCloseNow 
}) {
  return (
    <>
      {showExtendModal && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 12000 }}>
          <div className="modal-content" style={{ maxWidth: '320px' }}>
            <h3 className="modal-title">Extender horario</h3>
            <p className="modal-text">Elegí la nueva hora de cierre automático para hoy.</p>
            
            <select 
              className="modal-select"
              value={extendTime} 
              onChange={e => setExtendTime(e.target.value)}
            >
              <option value="06:00">06:00 hs</option>
              <option value="07:00">07:00 hs</option>
              <option value="08:00">08:00 hs</option>
              <option value="09:00">09:00 hs</option>
              <option value="10:00">10:00 hs</option>
            </select>

            <div className="modal-actions">
              <button 
                className="btn-modal btn-secondary"
                onClick={() => setShowExtendModal(false)}
              >Cancelar</button>
              <button 
                className="btn-modal btn-primary"
                onClick={handleExtend}
              >Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {showCloseConfirm && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 12500 }}>
          <div className="modal-content" style={{ maxWidth: '350px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
            <h3 className="modal-title">¿Cerrar pedidos ahora?</h3>
            <p className="modal-text">
              Si cerrás ahora, nadie podrá realizar nuevos pedidos para mañana hasta que vuelvas a abrir o llegue la medianoche.
            </p>
            <div className="modal-actions">
              <button 
                className="btn-modal btn-secondary"
                onClick={() => setShowCloseConfirm(false)}
              >Cancelar</button>
              <button 
                className="btn-modal btn-danger"
                onClick={() => { handleCloseNow(); setShowCloseConfirm(false); }}
              >Cerrar pedidos</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
