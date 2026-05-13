import React from 'react';

export default function OrderSummary({ formData, resumenLineas, total, daysStr }) {
  return (
    <div className="success-screen visible" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', boxSizing: 'border-box' }}>
      <div className="success-icon">✓</div>
      <h2 style={{ color: 'var(--brown)', marginBottom: '20px', textAlign: 'center' }}>¡Pedido recibido!</h2>

      <div style={{ background: '#fff', padding: '25px', borderRadius: '16px', border: '1px solid var(--gold)', textAlign: 'left', marginBottom: '25px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginTop: 0, color: 'var(--brown)', fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '15px', textAlign: 'center' }}>Resumen del pedido</h3>

        <p style={{ margin: '8px 0', color: '#555' }}><strong style={{ color: 'var(--brown)' }}>Nombre:</strong> {formData.nombre}</p>
        <p style={{ margin: '8px 0', color: '#555' }}><strong style={{ color: 'var(--brown)' }}>Teléfono:</strong> {formData.telefono}</p>
        <p style={{ margin: '8px 0', color: '#555' }}><strong style={{ color: 'var(--brown)' }}>Dirección:</strong> {formData.direccion}</p>
        <p style={{ margin: '8px 0', color: '#555' }}><strong style={{ color: 'var(--brown)' }}>Entrega:</strong> {formData.fecha.split('-').reverse().join('/')} ({formData.desde} a {formData.hasta})</p>

        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed var(--border)' }}>
          <strong style={{ color: 'var(--brown)', display: 'block', marginBottom: '8px' }}>Packs:</strong>
          {resumenLineas.map((line, idx) => (
            <div key={idx} style={{ color: '#555', fontSize: '15px', margin: '4px 0' }}>• {line}</div>
          ))}
        </div>

        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ color: 'var(--brown)', fontSize: '16px' }}>Total a pagar:</strong>
          <span style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '20px' }}>${total.toLocaleString('es-AR')}</span>
        </div>

        <div style={{ marginTop: '15px', color: '#555', fontSize: '15px', textAlign: 'center', background: '#fdf8f5', padding: '10px', borderRadius: '8px' }}>
          <strong style={{ color: 'var(--brown)' }}>Método de pago:</strong><br />
          {formData.pago === 'efectivo' ? 'Efectivo al recibir' : 'Transferencia'}
        </div>
      </div>

      <p style={{ fontWeight: 500, color: 'var(--brown)', textAlign: 'center', fontSize: '16px' }}>Te contactaremos por WhatsApp para confirmar 🥐</p>
    </div>
  );
}
