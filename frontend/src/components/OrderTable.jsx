import React from 'react';

export default function OrderTable({ filteredOrders, setSelectedOrder, setMapCenter, setMapZoom, renderPacks, safeDate }) {
  return (
    <div className="pedidos-cercanos">
      <div className="pedidos-cercanos-header">
        {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''} en el mapa
      </div>
      <div>
        {!filteredOrders.length ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>No hay pedidos para mostrar</div>
        ) : (
          filteredOrders.map(p => (
            <div key={p.id} className="pedido-item" onClick={() => {
              setMapCenter([p.lat, p.lng]);
              setMapZoom(16);
              setSelectedOrder(p);
            }}>
              <div className="pedido-item-left">
                <div className="pedido-dot" style={{ background: p.estado === 'Entregado' ? '#2E7D32' : '#F57F17' }} />
                <div>
                  <div className="pedido-nombre">{p.nombre || 'Sin nombre'} ({renderPacks(p.paquete)})</div>
                  <div className="pedido-dir">{p.direccion || 'Sin dirección'} | {p.pago || 'No especificado'}</div>
                  <div className="pedido-dir" style={{ marginTop: '2px', fontWeight: 500 }}>📅 {safeDate(p.fecha)} {p.desde && p.hasta ? `(${p.desde} a ${p.hasta})` : ''}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span className="badge" style={{ background: p.estadoPago === 'Pagado' ? '#e8f5e9' : '#fff3e0', color: p.estadoPago === 'Pagado' ? '#2E7D32' : '#F57F17' }}>
                    💲 {p.estadoPago === 'Pagado' ? 'Pagado' : 'Pendiente'}
                  </span>
                  <span className={`badge ${p.estado === 'Entregado' ? 'badge-entregado' : 'badge-pendiente'}`}>{p.estado}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = (p.lat != null && p.lng != null)
                      ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.direccion)}`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  style={{ background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', color: '#333' }}
                >📍 Navegar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
