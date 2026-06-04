import './OrderSummary.css';

export default function OrderSummary({ formData, resumenLineas, total }) {
  return (
    <div className="order-summary-screen">
      <div className="success-icon">✓</div>
      <h2 style={{ color: 'var(--brown)', marginBottom: '20px', textAlign: 'center', fontFamily: '"Playfair Display", serif' }}>
        ¡Pedido recibido!
      </h2>

      <div className="summary-card">
        <h3 className="summary-card-title">Resumen del pedido</h3>

        <p className="summary-line"><strong>Nombre:</strong> {formData.nombre}</p>
        <p className="summary-line"><strong>Teléfono:</strong> {formData.telefono}</p>
        <p className="summary-line"><strong>Dirección:</strong> {formData.direccion}</p>
        <p className="summary-line"><strong>Entrega:</strong> {formData.fecha.split('-').reverse().join('/')} ({formData.desde} a {formData.hasta})</p>

        <div className="summary-divider">
          <strong className="summary-packs-label">Packs:</strong>
          {resumenLineas.map((line, idx) => (
            <div key={idx} className="summary-pack-item">• {line}</div>
          ))}
        </div>

        <div className="summary-total-row">
          <strong className="summary-total-label">Total a pagar:</strong>
          <span className="summary-total-value">${total.toLocaleString('es-AR')}</span>
        </div>

        <div className="summary-payment-box">
          <strong>Método de pago:</strong><br />
          {formData.pago === 'efectivo' ? 'Efectivo al recibir' : 'Transferencia'}
        </div>
      </div>

      <p className="final-contact-text">Te contactaremos por WhatsApp para confirmar 🥐</p>
    </div>
  );
}
