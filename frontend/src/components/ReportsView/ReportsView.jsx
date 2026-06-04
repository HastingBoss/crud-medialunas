import { useState } from 'react';
import './ReportsView.css';

const MetricCard = ({ label, value, sub, isZero }) => (
  <div className="metric-card">
    <div className="metric-label">{label}</div>
    <div className="metric-value">{value}</div>
    {sub && <div className={`metric-sub ${isZero ? 'warning' : ''}`}>{sub}</div>}
  </div>
);

export default function ReportsView({ orders, calcularTotal }) {
  const [reportDate, setReportDate] = useState(new Date().toLocaleDateString('sv-SE'));
  const [reportMonth, setReportMonth] = useState(new Date().toLocaleDateString('sv-SE').slice(0, 7));

  // Daily
  const dayOrders = orders.filter(o => o.fecha && String(o.fecha).split('T')[0] === reportDate);
  const dayRevenue = dayOrders.filter(o => o.estadoPago === 'Pagado').reduce((s, o) => s + calcularTotal(o.paquete), 0);
  const dayEfectivo = dayOrders.filter(o => o.pago === 'efectivo').length;
  const dayTransferencia = dayOrders.filter(o => o.pago === 'transferencia').length;
  const dayPendientes = dayOrders.filter(o => o.estado !== 'Entregado').length;
  const dayEntregados = dayOrders.filter(o => o.estado === 'Entregado').length;

  const packCountDay = {};
  dayOrders.forEach(o => {
    const str = Array.isArray(o.paquete) ? o.paquete.join(', ') : String(o.paquete || '');
    str.split(', ').forEach(item => {
      const p = item.split(' × ');
      if (p.length === 2) packCountDay[p[1]] = (packCountDay[p[1]] || 0) + parseInt(p[0], 10);
    });
  });
  const topPackDay = Object.entries(packCountDay).sort((a, b) => b[1] - a[1])[0];

  // Monthly
  const monthOrders = orders.filter(o => o.fecha && String(o.fecha).slice(0, 7) === reportMonth);
  const monthRevenue = monthOrders.filter(o => o.estadoPago === 'Pagado').reduce((s, o) => s + calcularTotal(o.paquete), 0);
  const [mY, mM] = reportMonth.split('-').map(Number);
  const daysInMonth = new Date(mY, mM, 0).getDate();
  const avgPerDay = monthOrders.length > 0 ? (monthOrders.length / daysInMonth).toFixed(1) : '0';

  const packCountMonth = {};
  monthOrders.forEach(o => {
    const str = Array.isArray(o.paquete) ? o.paquete.join(', ') : String(o.paquete || '');
    str.split(', ').forEach(item => {
      const p = item.split(' × ');
      if (p.length === 2) packCountMonth[p[1]] = (packCountMonth[p[1]] || 0) + parseInt(p[0], 10);
    });
  });
  const topPacksMonth = Object.entries(packCountMonth).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const ordersPerDay = Array.from({ length: daysInMonth }, (_, i) => {
    const dd = String(i + 1).padStart(2, '0');
    const key = `${reportMonth}-${dd}`;
    return monthOrders.filter(o => String(o.fecha).split('T')[0] === key).length;
  });
  const maxBarVal = Math.max(...ordersPerDay, 1);
  const payTotal = dayEfectivo + dayTransferencia || 1;

  return (
    <div className="reports-view-container">
      {/* Reporte Diario */}
      <div className="report-section">
        <div className="report-section-header">
          <h3 className="report-section-title">📅 Reporte diario</h3>
          <input 
            type="date" 
            className="report-date-input"
            value={reportDate} 
            onChange={e => setReportDate(e.target.value)} 
          />
        </div>

        <div className="metrics-grid">
          <MetricCard label="Total pedidos" value={dayOrders.length} />
          <MetricCard 
            label="Recaudado" 
            value={`$${dayRevenue.toLocaleString('es-AR')}`} 
            sub={dayRevenue === 0 ? "Sin pedidos pagados aún" : "Solo pagados"} 
            isZero={dayRevenue === 0}
          />
          <MetricCard label="Pendientes" value={dayPendientes} sub={`${dayEntregados} entregados`} />
          <MetricCard 
            label="Pack estrella" 
            value={topPackDay ? topPackDay[0].replace('Pack ', '') : '—'} 
            sub={topPackDay ? `${topPackDay[1]} und.` : 'Sin datos'} 
          />
        </div>

        <div className="report-data-card">
          <div className="card-label-small">Método de pago</div>
          {[
            ['💵 Efectivo', dayEfectivo], 
            ['🏦 Transferencia', dayTransferencia]
          ].map(([label, count]) => (
            <div key={label} className="progress-item">
              <div className="progress-info">
                <span className="progress-label">{label}</span>
                <span className="progress-value">{count} ({Math.round((count / payTotal) * 100)}%)</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${(count / payTotal) * 100}%`, background: '#C4922A' }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reporte Mensual */}
      <div className="report-section">
        <div className="report-section-header">
          <h3 className="report-section-title">📆 Reporte mensual</h3>
          <input 
            type="month" 
            className="report-date-input"
            value={reportMonth} 
            onChange={e => setReportMonth(e.target.value)} 
          />
        </div>

        <div className="metrics-grid">
          <MetricCard label="Total pedidos" value={monthOrders.length} />
          <MetricCard 
            label="Recaudado" 
            value={`$${monthRevenue.toLocaleString('es-AR')}`} 
            sub={monthRevenue === 0 ? "Sin pedidos pagados aún" : "Solo pagados"}
            isZero={monthRevenue === 0}
          />
          <MetricCard label="Prom. x día" value={avgPerDay} sub={`sobre ${daysInMonth} días`} />
        </div>

        <div className="report-data-card">
          <div className="card-label-small">🏆 Top 3 packs del mes</div>
          {topPacksMonth.length === 0 && <div className="metric-sub">Sin datos</div>}
          {topPacksMonth.map(([name, qty], idx) => {
            const medals = ['🥇', '🥈', '🥉'];
            const maxQ = topPacksMonth[0][1] || 1;
            const barColors = ['#C4922A', '#A0714F', '#8B6F5A'];
            return (
              <div key={name} className="progress-item">
                <div className="progress-info">
                  <span className="progress-label">{medals[idx]} {name}</span>
                  <span className="progress-value">{qty} und.</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${(qty / maxQ) * 100}%`, background: barColors[idx] }} 
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="report-data-card">
          <div className="card-label-small">Pedidos por día del mes</div>
          <div className="chart-monthly-container">
            {ordersPerDay.map((count, i) => (
              <div 
                key={i} 
                className="chart-day-column"
                title={`Día ${i + 1}: ${count} pedidos`}
              >
                <div 
                  className="chart-day-count" 
                  style={{ opacity: count > 0 ? 1 : 0 }}
                >
                  {count || ''}
                </div>
                <div 
                  className="chart-day-bar" 
                  style={{ 
                    height: `${(count / maxBarVal) * 140}px`, 
                    minHeight: count > 0 ? '6px' : '0', 
                    background: count > 0 ? '#C4922A' : '#f5f0eb' 
                  }} 
                />
                <div 
                  className="chart-day-num"
                  style={{ 
                    color: count > 0 ? 'var(--brown)' : 'var(--muted)', 
                    fontWeight: count > 0 ? 600 : 400 
                  }}
                >{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
