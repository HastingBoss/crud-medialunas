import React, { useState } from 'react';

export default function ReportsView({ orders, calcularTotal }) {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));

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

  const MetricCard = ({ label, value, sub }) => (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 140px', minWidth: '130px' }}>
      <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--brown)', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{sub}</div>}
    </div>
  );

  const SectionTitle = ({ children }) => (
    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brown)', borderBottom: '2px solid #C4922A', paddingBottom: '6px', marginBottom: '14px' }}>{children}</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"DM Sans", sans-serif' }}>

      {/* Reporte Diario */}
      <div style={{ background: '#fdf8f5', borderRadius: '14px', padding: '20px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <SectionTitle>📅 Reporte diario</SectionTitle>
          <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1.5px solid var(--border)', fontSize: '13px', fontFamily: 'inherit', color: 'var(--brown)', outline: 'none' }} />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          <MetricCard label="Total pedidos" value={dayOrders.length} />
          <MetricCard label="Recaudado" value={`$${dayRevenue.toLocaleString('es-AR')}`} sub="Solo pagados" />
          <MetricCard label="Pendientes" value={dayPendientes} sub={`${dayEntregados} entregados`} />
          <MetricCard label="Pack estrella" value={topPackDay ? topPackDay[0].replace('Pack ', '') : '—'} sub={topPackDay ? `${topPackDay[1]} und.` : 'Sin datos'} />
        </div>

        <div style={{ background: '#fff', borderRadius: '10px', padding: '14px 16px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Método de pago</div>
          {[['💵 Efectivo', dayEfectivo], ['🏦 Transferencia', dayTransferencia]].map(([label, count]) => (
            <div key={label} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: '#555' }}>{label}</span>
                <span style={{ fontWeight: 600, color: 'var(--brown)' }}>{count} ({Math.round((count / payTotal) * 100)}%)</span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', background: '#f0e8e0', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(count / payTotal) * 100}%`, background: '#C4922A', borderRadius: '4px', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reporte Mensual */}
      <div style={{ background: '#fdf8f5', borderRadius: '14px', padding: '20px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <SectionTitle>📆 Reporte mensual</SectionTitle>
          <input type="month" value={reportMonth} onChange={e => setReportMonth(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1.5px solid var(--border)', fontSize: '13px', fontFamily: 'inherit', color: 'var(--brown)', outline: 'none' }} />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          <MetricCard label="Total pedidos" value={monthOrders.length} />
          <MetricCard label="Recaudado" value={`$${monthRevenue.toLocaleString('es-AR')}`} sub="Solo pagados" />
          <MetricCard label="Prom. x día" value={avgPerDay} sub={`sobre ${daysInMonth} días`} />
        </div>

        <div style={{ background: '#fff', borderRadius: '10px', padding: '14px 16px', border: '1px solid var(--border)', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏆 Top 3 packs del mes</div>
          {topPacksMonth.length === 0 && <div style={{ color: 'var(--muted)', fontSize: '13px' }}>Sin datos</div>}
          {topPacksMonth.map(([name, qty], idx) => {
            const medals = ['🥇', '🥈', '🥉'];
            const maxQ = topPacksMonth[0][1] || 1;
            const barColors = ['#C4922A', '#A0714F', '#8B6F5A'];
            return (
              <div key={name} style={{ marginBottom: idx < topPacksMonth.length - 1 ? '10px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span style={{ color: '#555' }}>{medals[idx]} {name}</span>
                  <span style={{ fontWeight: 600, color: 'var(--brown)' }}>{qty} und.</span>
                </div>
                <div style={{ height: '8px', borderRadius: '4px', background: '#f0e8e0', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(qty / maxQ) * 100}%`, background: barColors[idx], borderRadius: '4px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: '#fff', borderRadius: '10px', padding: '14px 16px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pedidos por día del mes</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px', overflowX: 'auto', paddingBottom: '20px', position: 'relative' }}>
            {ordersPerDay.map((count, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto', width: '22px', height: '100%', justifyContent: 'flex-end', position: 'relative' }} title={`Día ${i + 1}: ${count} pedidos`}>
                <div style={{ fontSize: '9px', color: 'var(--brown)', fontWeight: 600, marginBottom: '2px', opacity: count > 0 ? 1 : 0 }}>{count || ''}</div>
                <div style={{ width: '16px', height: `${(count / maxBarVal) * 58}px`, minHeight: count > 0 ? '4px' : '0', background: count > 0 ? '#C4922A' : '#f0e8e0', borderRadius: '3px 3px 0 0', transition: 'height 0.3s ease' }} />
                <div style={{ position: 'absolute', bottom: '-18px', fontSize: '9px', color: 'var(--muted)', width: '22px', textAlign: 'center' }}>{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
