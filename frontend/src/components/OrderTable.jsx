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
            <div key={p.id} className="pedido-item" 
              style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0E8D8', cursor: 'pointer' }}
              onClick={() => {
                setMapCenter([p.lat, p.lng]);
                setMapZoom(16);
                setSelectedOrder(p);
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="pedido-dot" style={{ background: p.estado === 'Entregado' ? '#2E7D32' : '#F57F17', width: '10px', height: '10px', borderRadius: '50%' }} />
                  <div className="pedido-nombre" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--brown)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.nombre || 'Sin nombre'} <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '12px' }}>({renderPacks(p.paquete)})</span>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', paddingLeft: '18px' }}>
                  {p.direccion || 'Sin dirección'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--brown)', fontWeight: 500, paddingLeft: '18px', marginTop: '2px' }}>
                  📅 {safeDate(p.fecha)} {p.desde && p.hasta ? `(${p.desde} a ${p.hasta})` : ''} • {p.pago}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                  <span style={{ 
                    fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', 
                    background: p.estadoPago === 'Pagado' ? '#e8f5e9' : '#fff3e0', 
                    color: p.estadoPago === 'Pagado' ? '#2E7D32' : '#E65100',
                    border: `1px solid ${p.estadoPago === 'Pagado' ? '#c8e6c9' : '#ffe0b2'}`,
                    textTransform: 'uppercase', letterSpacing: '0.4px'
                  }}>
                    {p.estadoPago === 'Pagado' ? 'Pagado' : 'Pago Pend.'}
                  </span>
                  <span style={{ 
                    fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', 
                    background: p.estado === 'Entregado' ? '#e8f5e9' : '#fbe9e7', 
                    color: p.estado === 'Entregado' ? '#2E7D32' : '#d32f2f',
                    border: `1px solid ${p.estado === 'Entregado' ? '#c8e6c9' : '#ffccbc'}`,
                    textTransform: 'uppercase', letterSpacing: '0.4px'
                  }}>
                    {p.estado}
                  </span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = (p.lat != null && p.lng != null)
                      ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.direccion)}`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  style={{ 
                    background: '#1565C0', color: '#fff', border: 'none', borderRadius: '8px', 
                    width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(21,101,192,0.3)', transition: 'transform 0.1s'
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  title="Navegar"
                >📍</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
