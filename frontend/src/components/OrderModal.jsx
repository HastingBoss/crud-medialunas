import React from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function OrderModal({ selectedOrder, onClose, changeStatus, changePaymentStatus, archiveOrder, renderPacks, safeDate, calcularTotal }) {
  if (!selectedOrder) return null;

  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--brown)' }}>✕</button>
        <h2 style={{ color: 'var(--brown)', marginTop: 0, marginBottom: '15px', fontSize: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Detalle del Pedido</h2>

        <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}><strong style={{ color: 'var(--brown)' }}>Cliente:</strong> {selectedOrder.nombre || 'No disponible'}</p>
        <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}><strong style={{ color: 'var(--brown)' }}>Teléfono:</strong> {selectedOrder.telefono || 'No disponible'}</p>
        <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}><strong style={{ color: 'var(--brown)' }}>Dirección:</strong> {selectedOrder.direccion || 'No disponible'}</p>
        <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}><strong style={{ color: 'var(--brown)' }}>Fecha y hora:</strong> {safeDate(selectedOrder.fecha)} ({selectedOrder.desde || '--'} a {selectedOrder.hasta || '--'})</p>
        <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}><strong style={{ color: 'var(--brown)' }}>Packs:</strong> {renderPacks(selectedOrder.paquete)}</p>
        <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}><strong style={{ color: 'var(--brown)' }}>Total:</strong> ${(selectedOrder.total || calcularTotal(selectedOrder.paquete)).toLocaleString('es-AR')}</p>
        <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}>
          <strong style={{ color: 'var(--brown)' }}>Método de pago:</strong> {selectedOrder.pago || 'No disponible'}
          {selectedOrder.comprobante && <a href={`${API_URL}/uploads/${selectedOrder.comprobante}`} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', marginLeft: '5px', textDecoration: 'underline' }}>Ver comprobante</a>}
        </p>

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', alignItems: 'center' }}>
          <div style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${selectedOrder.estadoPago === 'Pagado' ? '#2E7D32' : '#F57F17'}`, background: selectedOrder.estadoPago === 'Pagado' ? '#e8f5e9' : '#fff3e0', textAlign: 'center', fontSize: '14px' }}>
            <strong style={{ color: selectedOrder.estadoPago === 'Pagado' ? '#2E7D32' : '#F57F17' }}>Pago: {selectedOrder.estadoPago || 'Pendiente'}</strong>
          </div>
          <div style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${selectedOrder.estado === 'Entregado' ? '#2E7D32' : '#F57F17'}`, background: selectedOrder.estado === 'Entregado' ? '#e8f5e9' : '#fff3e0', textAlign: 'center', fontSize: '14px' }}>
            <strong style={{ color: selectedOrder.estado === 'Entregado' ? '#2E7D32' : '#F57F17' }}>Entrega: {selectedOrder.estado}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={() => {
              const phoneDigits = String(selectedOrder.telefono || '').replace(/\D/g, '');
              const phoneStr = phoneDigits.startsWith('54') ? phoneDigits.slice(2) : phoneDigits;
              const packsStr = renderPacks(selectedOrder.paquete);
              const fechaStr = safeDate(selectedOrder.fecha);
              const msg = `Hola ${selectedOrder.nombre || ''}, tu pedido de ${packsStr} está confirmado para el ${fechaStr} entre ${selectedOrder.desde || '--'} y ${selectedOrder.hasta || '--'}. 🥐`;
              window.open(`https://wa.me/54${phoneStr}?text=${encodeURIComponent(msg)}`, '_blank');
            }}
            style={{ background: '#25D366', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: '"DM Sans", sans-serif' }}
          >Confirmar por WhatsApp</button>

          <button
            onClick={() => {
              const url = (selectedOrder.lat != null && selectedOrder.lng != null)
                ? `https://www.google.com/maps/dir/?api=1&destination=${selectedOrder.lat},${selectedOrder.lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrder.direccion)}`;
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
            style={{ background: '#1976D2', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: '"DM Sans", sans-serif' }}
          >📍 Navegar</button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => changePaymentStatus(selectedOrder.id, selectedOrder.estadoPago === 'Pagado' ? 'Pendiente' : 'Pagado')}
              style={{ flex: 1, background: '#fff', color: '#333', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: '"DM Sans", sans-serif', fontWeight: 500 }}
            >Marcar como {selectedOrder.estadoPago === 'Pagado' ? 'Pendiente de pago' : 'Pagado'}</button>
            <button
              onClick={() => changeStatus(selectedOrder.id, selectedOrder.estado === 'Entregado' ? 'Pendiente' : 'Entregado')}
              style={{ flex: 1, background: '#fff', color: '#333', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: '"DM Sans", sans-serif', fontWeight: 500 }}
            >Marcar como {selectedOrder.estado === 'Entregado' ? 'Pendiente' : 'Entregado'}</button>
          </div>

          <button
            onClick={() => archiveOrder(selectedOrder, onClose)}
            style={{ marginTop: '10px', width: '100%', background: '#FFF3E0', color: '#E65100', border: '1px solid #FFCC80', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: '"DM Sans", sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >📦 Archivar pedido</button>
        </div>
      </div>
    </div>
  );
}
