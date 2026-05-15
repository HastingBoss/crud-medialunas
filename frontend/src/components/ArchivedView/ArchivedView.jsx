import React, { useState } from 'react';
import './ArchivedView.css';

const TIME_OPTIONS = ['08:00', '08:30', '09:00', '09:30', '10:00'];

export default function ArchivedView({ orders, deleteOrder, reprogramarOrder, calcularTotal }) {
  const [orderToReprogram, setOrderToReprogram] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  
  const [newDate, setNewDate] = useState('');
  const [newDesde, setNewDesde] = useState('');
  const [newHasta, setNewHasta] = useState('');

  const archivedOrders = orders.filter(o => o.archivado);

  const handleOpenReprogram = (order) => {
    setOrderToReprogram(order);
    setNewDate('');
    setNewDesde('');
    setNewHasta('');
  };

  const handleConfirmReprogram = async () => {
    if (!newDate || !newDesde || !newHasta) {
      alert('Por favor completá fecha y horario.');
      return;
    }
    if (newHasta <= newDesde) {
      alert('El horario "Hasta" debe ser posterior al "Desde".');
      return;
    }
    const success = await reprogramarOrder(orderToReprogram.id, newDate, newDesde, newHasta);
    if (success) setOrderToReprogram(null);
  };

  const handleConfirmDelete = async () => {
    await deleteOrder(orderToDelete.id);
    setOrderToDelete(null);
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  const maxDateObj = new Date(today);
  maxDateObj.setDate(today.getDate() + 30);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  return (
    <div className="archived-view-container">
      <div className="archived-header">
        <div className="archived-title">📦 Pedidos Archivados</div>
        <p className="archived-subtitle">Aquí se encuentran los pedidos cancelados o para reprogramar.</p>
      </div>

      {archivedOrders.length === 0 ? (
        <div className="empty-archived">No hay pedidos archivados.</div>
      ) : (
        <div className="archived-table-wrapper">
          <table className="archived-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Paquete</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Pago</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {archivedOrders.map(o => (
                <tr key={o.id} className="archived-row">
                  <td className="archived-name">{o.nombre}</td>
                  <td className="archived-package">{o.paquete}</td>
                  <td>{o.fecha}</td>
                  <td className="archived-price">${calcularTotal(o.paquete).toLocaleString('es-AR')}</td>
                  <td>
                    <span className="archived-payment-badge">{o.pago}</span>
                  </td>
                  <td>
                    <div className="archived-actions">
                      {o.estadoPago !== 'Pagado' && (
                        <button 
                          className="btn-archived-reprogram"
                          onClick={() => handleOpenReprogram(o)}
                        >📅 Reprogramar</button>
                      )}
                      <button 
                        className="btn-archived-delete"
                        onClick={() => setOrderToDelete(o)}
                      >🗑 Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Reprogramar */}
      {orderToReprogram && (
        <div className="modal-overlay-reprogram">
          <div className="modal-content-reprogram">
            <h3 className="modal-title-reprogram">📅 Reprogramar Pedido</h3>
            <p className="modal-subtitle-reprogram">Seleccioná la nueva fecha y horario para <strong>{orderToReprogram.nombre}</strong></p>
            
            <div className="reprogram-field">
              <label className="reprogram-label">Fecha de entrega</label>
              <input 
                type="date" 
                className="reprogram-input"
                min={minDate} 
                max={maxDate}
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
              />
            </div>

            <div className="reprogram-time-grid">
              <div style={{ flex: 1 }}>
                <label className="reprogram-label">Desde</label>
                <select 
                  className="reprogram-select"
                  value={newDesde}
                  onChange={e => setNewDesde(e.target.value)}
                >
                  <option value="">Hora...</option>
                  {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="reprogram-label">Hasta</label>
                <select 
                  className="reprogram-select"
                  value={newHasta}
                  onChange={e => setNewHasta(e.target.value)}
                >
                  <option value="">Hora...</option>
                  {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-reprogram-confirm" onClick={handleConfirmReprogram}>Confirmar</button>
              <button className="btn-reprogram-cancel" onClick={() => setOrderToReprogram(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmar Eliminación */}
      {orderToDelete && (
        <div className="modal-overlay-reprogram" style={{ zIndex: 2001 }}>
          <div className="modal-content-reprogram" style={{ textAlign: 'center', maxWidth: '350px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 12px 0', color: 'var(--brown)' }}>¿Eliminar pedido?</h3>
            <p className="modal-subtitle-reprogram" style={{ marginBottom: '24px' }}>Esta acción no se puede deshacer. El pedido de <strong>{orderToDelete.nombre}</strong> será borrado permanentemente.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-reprogram-confirm" 
                style={{ background: '#d32f2f' }}
                onClick={handleConfirmDelete}
              >Sí, eliminar</button>
              <button className="btn-reprogram-cancel" onClick={() => setOrderToDelete(null)}>No, cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
