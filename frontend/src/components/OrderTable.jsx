import React from 'react';

export default function OrderTable({ filteredOrders, setSelectedOrder, setMapCenter, setMapZoom, renderPacks, safeDate, selectedForRoute, toggleOrderSelection, toggleSelectAll }) {
  const allSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedForRoute.includes(o.id));

  return (
    <div className="order-list" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>
          📋 Pedidos ({filteredOrders.length})
        </div>
        <button 
          onClick={toggleSelectAll}
          style={{ background: 'none', border: 'none', color: 'var(--gold-dark)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }}
        >
          {allSelected ? 'Desmarcar todos' : 'Marcar todos'}
        </button>
      </div>

      {!filteredOrders.length ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px', background: '#fff', borderRadius: '14px', border: '1.5px solid var(--border)' }}>
          No hay pedidos para mostrar
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredOrders.map(order => (
            <div key={order.id} className="order-item" style={{ 
              display: 'flex', gap: '12px', alignItems: 'center', background: '#fff', 
              padding: '12px', borderRadius: '12px', border: '1.5px solid var(--border)',
              transition: 'all 0.2s', borderLeft: selectedForRoute.includes(order.id) ? '4px solid var(--brown)' : '1.5px solid var(--border)'
            }}>
              <div 
                onClick={() => toggleOrderSelection(order.id)}
                style={{ 
                  width: '22px', height: '22px', borderRadius: '6px', 
                  border: `2px solid ${selectedForRoute.includes(order.id) ? 'var(--brown)' : '#ddd'}`,
                  background: selectedForRoute.includes(order.id) ? 'var(--brown)' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                  transition: 'all 0.2s'
                }}
              >
                {selectedForRoute.includes(order.id) && <span style={{ color: '#fff', fontSize: '12px', fontWeight: 900 }}>✓</span>}
              </div>

              <div 
                style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', minWidth: 0 }}
                onClick={() => {
                  setSelectedOrder(order);
                  setMapCenter([order.lat, order.lng]);
                  setMapZoom(16);
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--brown)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.nombre}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.direccion}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>🕒 {order.desde} - {order.hasta}</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', margin: '0 12px', flexShrink: 0 }}>
                  <span style={{ 
                    fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', 
                    background: order.estadoPago === 'Pagado' ? '#e8f5e9' : '#fff3e0', 
                    color: order.estadoPago === 'Pagado' ? '#2E7D32' : '#E65100',
                    border: `1px solid ${order.estadoPago === 'Pagado' ? '#c8e6c9' : '#ffe0b2'}`,
                    textTransform: 'uppercase'
                  }}>{order.estadoPago === 'Pagado' ? 'Pagado' : 'Pend.'}</span>
                  <span style={{ 
                    fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', 
                    background: order.estado === 'Entregado' ? '#e8f5e9' : '#fbe9e7', 
                    color: order.estado === 'Entregado' ? '#2E7D32' : '#d32f2f',
                    border: `1px solid ${order.estado === 'Entregado' ? '#c8e6c9' : '#ffccbc'}`,
                    textTransform: 'uppercase'
                  }}>{order.estado}</span>
                </div>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.lat},${order.lng}`, '_blank');
                }}
                style={{ 
                  background: '#1565C0', color: '#fff', border: 'none', borderRadius: '8px', 
                  width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', cursor: 'pointer', flexShrink: 0
                }}
              >📍</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
