import './OrderTable.css';

export default function OrderTable({ 
  filteredOrders, setSelectedOrderId, setMapCenter, setMapZoom, 
  selectedForRoute, toggleOrderSelection, toggleSelectAll,
  timeFrom, setTimeFrom, timeTo, setTimeTo
}) {
  const allSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedForRoute.includes(o.id));

  const timeOptions = [];
  for (let hour = 8; hour <= 10; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const time = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

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
            value={timeFrom} 
            onChange={e => setTimeFrom(e.target.value)}
          >
            <option value="">Desde</option>
            {timeOptions.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
          
          <span className="time-separator">→</span>
          
          <select 
            className="filter-select" 
            value={timeTo} 
            onChange={e => setTimeTo(e.target.value)}
          >
            <option value="">Hasta</option>
            {timeOptions.map(time => (
              <option key={time} value={time}>{time}</option>
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
