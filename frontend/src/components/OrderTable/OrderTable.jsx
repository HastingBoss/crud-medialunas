import './OrderTable.css';

const RANGES = [
  { label: '8:00 - 8:30', desde: '08:00', hasta: '08:30' },
  { label: '8:30 - 9:00', desde: '08:30', hasta: '09:00' },
  { label: '9:00 - 9:30', desde: '09:00', hasta: '09:30' },
  { label: '9:30 - 10:00', desde: '09:30', hasta: '10:00' }
];

export default function OrderTable({ 
  filteredOrders, setSelectedOrderId, setMapCenter, setMapZoom, 
  selectedForRoute, toggleOrderSelection, toggleSelectAll,
  timeFrom, setTimeFrom, timeTo, setTimeTo
}) {
  const allSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedForRoute.includes(o.id));

  const currentRangeValue = timeFrom && timeTo ? `${timeFrom}-${timeTo}` : '';

  const handleRangeChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setTimeFrom('');
      setTimeTo('');
    } else {
      const [from, to] = val.split('-');
      setTimeFrom(from);
      setTimeTo(to);
    }
  };

  return (
    <div className="order-list">
      <div className="order-list-header">
        <div className="order-count-text">
          📋 Pedidos ({filteredOrders.length})
        </div>
        <button className="btn-toggle-select" onClick={toggleSelectAll}>
          {allSelected ? 'Desmarcar todos' : 'Marcar todos'}
        </button>
      </div>

      <div className="order-filters">
        <div className="time-range-filters">
          <select 
            className="filter-select" 
            value={currentRangeValue} 
            onChange={handleRangeChange}
          >
            <option value="">Todos los horarios</option>
            {RANGES.map(r => (
              <option key={`${r.desde}-${r.hasta}`} value={`${r.desde}-${r.hasta}`}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {!filteredOrders.length ? (
        <div className="empty-orders">
          No hay pedidos para mostrar
        </div>
      ) : (
        <div className="orders-container">
          {filteredOrders.map(order => {
            const isSelected = selectedForRoute.includes(order.id);
            return (
              <div 
                key={order.id} 
                className={`order-card ${isSelected ? 'selected' : ''}`}
              >
                <div 
                  className={`custom-checkbox ${isSelected ? 'checked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOrderSelection(order.id);
                  }}
                >
                  {isSelected && <span className="checkbox-tick">✓</span>}
                </div>

                <div 
                  className="order-info-main"
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setMapCenter([order.lat, order.lng]);
                    setMapZoom(16);
                  }}
                >
                  <div className="order-text-content">
                    <div className="order-name">{order.nombre}</div>
                    <div className="order-address">{order.direccion}</div>
                    <div className="order-time-range">⏰ <strong>{order.desde} - {order.hasta}</strong></div>
                  </div>
                  
                  <div className="order-badges">
                    <span className={`badge-status ${order.estadoPago === 'Pagado' ? 'pagado' : 'pendiente-pago'}`}>
                      {order.estadoPago === 'Pagado' ? 'Pagado' : 'Pend.'}
                    </span>
                    <span className={`badge-status ${order.estado === 'Entregado' ? 'entregado' : 'pendiente-entrega'}`}>
                      {order.estado}
                    </span>
                  </div>
                </div>

                <button 
                  className="btn-map-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.lat},${order.lng}`, '_blank');
                  }}
                >📍</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
