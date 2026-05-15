import React from 'react';
import './OrderModal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function OrderModal({ selectedOrder, onClose, changeStatus, changePaymentStatus, archiveOrder, renderPacks, safeDate, calcularTotal }) {
  if (!selectedOrder) return null;

  const total = selectedOrder.total || calcularTotal(selectedOrder.paquete);

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal-content" onClick={e => e.stopPropagation()}>
        <button className="order-modal-close" onClick={onClose}>✕</button>
        <h2 className="order-modal-title">Detalle del Pedido</h2>

        <p className="order-detail-line"><strong>Cliente:</strong> {selectedOrder.nombre || 'No disponible'}</p>
        <p className="order-detail-line"><strong>Teléfono:</strong> {selectedOrder.telefono || 'No disponible'}</p>
        <p className="order-detail-line"><strong>Dirección:</strong> {selectedOrder.direccion || 'No disponible'}</p>
        <p className="order-detail-line"><strong>Fecha y hora:</strong> {safeDate(selectedOrder.fecha)} ({selectedOrder.desde || '--'} a {selectedOrder.hasta || '--'})</p>
        <p className="order-detail-line"><strong>Packs:</strong> {renderPacks(selectedOrder.paquete)}</p>
        <p className="order-detail-line"><strong>Total:</strong> ${total.toLocaleString('es-AR')}</p>
        <p className="order-detail-line">
          <strong>Método de pago:</strong> {selectedOrder.pago || 'No disponible'}
          {selectedOrder.comprobante && (
            <a href={`${API_URL}/uploads/${selectedOrder.comprobante}`} target="_blank" rel="noreferrer" className="view-proof-link">Ver comprobante</a>
          )}
        </p>

        <div className="status-summary-row">
          <div className={`status-box ${selectedOrder.estadoPago === 'Pagado' ? 'success' : 'warning'}`}>
            <strong className={selectedOrder.estadoPago === 'Pagado' ? 'status-label-success' : 'status-label-warning'}>
              Pago: {selectedOrder.estadoPago || 'Pendiente'}
            </strong>
          </div>
          <div className={`status-box ${selectedOrder.estado === 'Entregado' ? 'success' : 'warning'}`}>
            <strong className={selectedOrder.estado === 'Entregado' ? 'status-label-success' : 'status-label-warning'}>
              Entrega: {selectedOrder.estado}
            </strong>
          </div>
        </div>

        <div className="action-buttons-stack">
          <button
            className="btn-whatsapp"
            onClick={() => {
              const phoneDigits = String(selectedOrder.telefono || '').replace(/\D/g, '');
              const phoneStr = phoneDigits.startsWith('54') ? phoneDigits.slice(2) : phoneDigits;
              const packsStr = renderPacks(selectedOrder.paquete);
              const fechaStr = safeDate(selectedOrder.fecha);
              const msg = `Hola ${selectedOrder.nombre || ''}, tu pedido de ${packsStr} está confirmado para el ${fechaStr} entre ${selectedOrder.desde || '--'} y ${selectedOrder.hasta || '--'}. 🥐`;
              window.open(`https://wa.me/54${phoneStr}?text=${encodeURIComponent(msg)}`, '_blank');
            }}
          >Confirmar por WhatsApp</button>

          <button
            className="btn-navigate"
            onClick={() => {
              const url = (selectedOrder.lat != null && selectedOrder.lng != null)
                ? `https://www.google.com/maps/dir/?api=1&destination=${selectedOrder.lat},${selectedOrder.lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrder.direccion)}`;
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
          >📍 Navegar</button>

          <div className="btn-row">
            <button
              className="btn-toggle-status"
              onClick={() => changePaymentStatus(selectedOrder.id, selectedOrder.estadoPago === 'Pagado' ? 'Pendiente' : 'Pagado')}
            >
              Marcar como {selectedOrder.estadoPago === 'Pagado' ? 'Pendiente' : 'Pagado'}
            </button>
            <button
              className="btn-toggle-status"
              onClick={() => changeStatus(selectedOrder.id, selectedOrder.estado === 'Entregado' ? 'Pendiente' : 'Entregado')}
            >
              Marcar como {selectedOrder.estado === 'Entregado' ? 'Pendiente' : 'Entregado'}
            </button>
          </div>

          <button
            className="btn-archive"
            onClick={() => archiveOrder(selectedOrder, onClose)}
          >📦 Archivar pedido</button>
        </div>
      </div>
    </div>
  );
}
