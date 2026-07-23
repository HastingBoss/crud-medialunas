import { useState, useEffect } from 'react';
import './StockView.css';

export default function StockView({ orders, stock, threshold, updateStockAPI, calcularUnidades }) {
  const [newStockValue, setNewStockValue] = useState('');
  const [newThreshold, setNewThreshold] = useState(threshold);

  useEffect(() => {
    setNewThreshold(threshold);
  }, [threshold]);

  const handleUpdate = () => {
    const val = newStockValue === '' ? undefined : parseInt(newStockValue, 10);
    if (newStockValue !== '' && isNaN(val)) {
      alert('Ingresá un número válido para el stock');
      return;
    }
    updateStockAPI(val, parseInt(newThreshold, 10));
    setNewStockValue('');
  };

  // Preparar datos para el gráfico de ventas
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const salesData = last7Days.map(date => {
    const dayOrders = orders.filter(o => o.fecha === date && !o.archivado);
    const units = dayOrders.reduce((acc, o) => acc + calcularUnidades(o.paquete), 0);
    return { date, units };
  });

  const weekdaysSales = salesData.filter(d => {
    const day = new Date(d.date + 'T12:00:00').getDay();
    return day !== 0 && day !== 6;
  });
  const averageWeekdaySales = weekdaysSales.length > 0
    ? weekdaysSales.reduce((a, b) => a + b.units, 0) / weekdaysSales.length
    : 0;

  const maxUnits = Math.max(...salesData.map(d => d.units), 1);

  console.log('threshold prop:', threshold);

  return (
    <div className="stock-view-container">
      <div className="stock-section">
        <div className="stock-title">
          📦 Control de Stock
        </div>
        
        <div className="stock-cards-grid">
          {/* Card Stock Actual */}
          <div className="stock-card-actual">
            <div className="card-label">Stock Disponible</div>
            <div className={`stock-value-large ${stock < threshold ? 'low' : 'normal'}`}>
              {stock}
            </div>
            <div className="stock-unit-label">medialunas</div>
            {threshold > 0 && (
              <div className="stock-threshold-indicator">
                <div className="stock-threshold-bar-bg">
                  <div
                    className="stock-threshold-bar-fill"
                    style={{
                      width: `${Math.min((stock / Math.max(threshold * 3, stock)) * 100, 100)}%`,
                      background: stock < threshold ? '#d32f2f' : stock < threshold * 1.5 ? '#FF9800' : '#2E7D32'
                    }}
                  />
                  <div
                    className="stock-threshold-marker"
                    style={{ left: `${Math.min((threshold / Math.max(threshold * 3, stock)) * 100, 100)}%` }}
                  />
                </div>
                <div className="stock-threshold-label">
                  Alerta en <strong>{threshold}</strong> unidades
                </div>
              </div>
            )}
          </div>

          {/* Card Actualizar Stock */}
          <div className="stock-card-config">
            <div className="card-label">Configuración de Stock</div>
            <div className="config-form">
              <div className="config-row">
                <div className="config-label">Nuevo Stock:</div>
                <input 
                  type="number" 
                  className="config-input"
                  placeholder="Ej: 100"
                  value={newStockValue}
                  onChange={e => setNewStockValue(e.target.value)}
                />
              </div>
              <div className="config-row">
                <div className="config-label">Alerta en:</div>
                <input 
                  type="number" 
                  className="config-input"
                  value={newThreshold}
                  onChange={e => setNewThreshold(e.target.value)}
                />
              </div>
              <button className="btn-save-stock" onClick={handleUpdate}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Ventas (Unidades) */}
      <div className="sales-chart-card">
        <div className="chart-label">Demanda últimos 7 días (unidades)</div>
        <div className="chart-area">
          {salesData.map((d, i) => {
            const dayName = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][new Date(d.date + 'T12:00:00').getDay()];
            return (
              <div key={i} className="chart-bar-container">
                <div className="chart-bar-value" style={{ opacity: d.units > 0 ? 1 : 0 }}>
                  {d.units}
                </div>
                <div 
                  className="chart-bar" 
                  style={{ 
                    height: `${(d.units / maxUnits) * 120}px`, 
                    minHeight: d.units > 0 ? '4px' : '0', 
                    background: d.units > 0 ? '#C4922A' : '#f5f0eb' 
                  }} 
                />
                <div className="chart-day-label">{dayName}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="forecast-tip">
        <div className="tip-icon">💡</div>
        <div className="tip-text">
          <strong>Tip de previsión:</strong> El promedio de venta diaria es de <strong>{averageWeekdaySales.toFixed(1)}</strong> unidades. 
          No se hacen ventas los fines de semana.
        </div>
      </div>
    </div>
  );
}
