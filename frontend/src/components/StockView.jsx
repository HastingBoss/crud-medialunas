import React, { useState } from 'react';

export default function StockView({ orders, stock, threshold, updateStockAPI, calcularUnidades }) {
  const [newStockValue, setNewStockValue] = useState('');
  const [newThreshold, setNewThreshold] = useState(threshold);

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

  const maxUnits = Math.max(...salesData.map(d => d.units), 1);

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brown)', borderBottom: '2px solid #C4922A', paddingBottom: '6px', marginBottom: '14px' }}>
          📦 Control de Stock
        </div>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* Card Stock Actual */}
          <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid var(--border)', flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Stock Disponible</div>
            <div style={{ fontSize: '48px', fontWeight: 800, color: stock < 24 ? '#d32f2f' : 'var(--brown)', lineHeight: 1 }}>{stock}</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px' }}>medialunas</div>
          </div>

          {/* Card Actualizar Stock */}
          <div style={{ background: '#fdf8f5', borderRadius: '14px', padding: '20px', border: '1px solid var(--border)', flex: '1 1 280px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>Configuración de Stock</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--brown)', width: '120px' }}>Nuevo Stock:</div>
                <input 
                  type="number" 
                  placeholder="Ej: 100"
                  value={newStockValue}
                  onChange={e => setNewStockValue(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)', outline: 'none', fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--brown)', width: '120px' }}>Alerta en:</div>
                <input 
                  type="number" 
                  value={newThreshold}
                  onChange={e => setNewThreshold(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)', outline: 'none', fontSize: '14px' }}
                />
              </div>
              <button 
                onClick={handleUpdate}
                style={{ background: 'var(--brown)', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', marginTop: '4px' }}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Ventas (Unidades) */}
      <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Demanda últimos 7 días (unidades)</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px', paddingBottom: '30px', position: 'relative' }}>
          {salesData.map((d, i) => {
            const dayName = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][new Date(d.date + 'T12:00:00').getDay()];
            return (
              <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--brown)', marginBottom: '4px', opacity: d.units > 0 ? 1 : 0 }}>{d.units}</div>
                <div style={{ width: '100%', maxWidth: '35px', height: `${(d.units / maxUnits) * 120}px`, minHeight: d.units > 0 ? '4px' : '0', background: d.units > 0 ? '#C4922A' : '#f5f0eb', borderRadius: '6px 6px 0 0', transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                <div style={{ position: 'absolute', bottom: '-22px', fontSize: '10px', color: 'var(--muted)', textAlign: 'center', width: '100%' }}>{dayName}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: '20px', background: '#fff', borderRadius: '14px', padding: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '24px' }}>💡</div>
        <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.4 }}>
          <strong>Tip de previsión:</strong> El promedio de venta diaria es de <strong>{(salesData.reduce((a, b) => a + b.units, 0) / 7).toFixed(1)}</strong> unidades. 
          Asegúrate de tener stock suficiente para el fin de semana.
        </div>
      </div>
    </div>
  );
}
