import React, { useState } from 'react';

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
    <div style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brown)', borderBottom: '2px solid #C4922A', paddingBottom: '6px', marginBottom: '6px' }}>
          📦 Pedidos Archivados
        </div>
        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
          Aquí se encuentran los pedidos cancelados o para reprogramar.
        </p>
      </div>

      {archivedOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--muted)' }}>
          No hay pedidos archivados.
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ background: '#fdf8f5', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--brown)', fontWeight: 600 }}>Nombre</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--brown)', fontWeight: 600 }}>Paquete</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--brown)', fontWeight: 600 }}>Fecha</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--brown)', fontWeight: 600 }}>Total</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--brown)', fontWeight: 600 }}>Pago</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: 'var(--brown)', fontWeight: 600 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {archivedOrders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid #f5f0e8' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{o.nombre}</td>
                  <td style={{ padding: '12px 16px', color: '#555' }}>{o.paquete}</td>
                  <td style={{ padding: '12px 16px' }}>{o.fecha}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>${calcularTotal(o.paquete).toLocaleString('es-AR')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'capitalize', padding: '2px 8px', borderRadius: '10px', background: '#f0f0f0', color: '#666' }}>
                      {o.pago}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleOpenReprogram(o)}
                        style={{ background: '#C4922A', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        📅 Reprogramar
                      </button>
                      <button 
                        onClick={() => setOrderToDelete(o)}
                        style={{ background: '#fff', color: '#d32f2f', border: '1px solid #ffcdd2', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        🗑 Eliminar
                      </button>
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--brown)', fontFamily: '"Playfair Display", serif' }}>📅 Reprogramar Pedido</h3>
            <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '20px' }}>Seleccioná la nueva fecha y horario para <strong>{orderToReprogram.nombre}</strong></p>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--brown)', marginBottom: '6px' }}>Fecha de entrega</label>
              <input 
                type="date" 
                min={minDate} 
                max={maxDate}
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border)', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--brown)', marginBottom: '6px' }}>Desde</label>
                <select 
                  value={newDesde}
                  onChange={e => setNewDesde(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border)', outline: 'none', fontFamily: 'inherit' }}
                >
                  <option value="">Hora...</option>
                  {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--brown)', marginBottom: '6px' }}>Hasta</label>
                <select 
                  value={newHasta}
                  onChange={e => setNewHasta(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border)', outline: 'none', fontFamily: 'inherit' }}
                >
                  <option value="">Hora...</option>
                  {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleConfirmReprogram}
                style={{ flex: 1, background: 'var(--brown)', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirmar
              </button>
              <button 
                onClick={() => setOrderToReprogram(null)}
                style={{ flex: 1, background: '#fff', color: 'var(--muted)', border: '1px solid var(--border)', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmar Eliminación */}
      {orderToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '350px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 12px 0', color: 'var(--brown)' }}>¿Eliminar pedido?</h3>
            <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '24px' }}>Esta acción no se puede deshacer. El pedido de <strong>{orderToDelete.nombre}</strong> será borrado permanentemente.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleConfirmDelete}
                style={{ flex: 1, background: '#d32f2f', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                Sí, eliminar
              </button>
              <button 
                onClick={() => setOrderToDelete(null)}
                style={{ flex: 1, background: '#fff', color: 'var(--muted)', border: '1px solid var(--border)', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
              >
                No, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
