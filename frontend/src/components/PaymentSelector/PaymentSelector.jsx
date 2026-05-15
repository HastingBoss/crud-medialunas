import React from 'react';
import './PaymentSelector.css';

export default function PaymentSelector({ pago, handleInputChange, comprobanteEnviado, setComprobanteEnviado, pagoCompleto }) {
  return (
    <div className="payment-selector-container">
      <p className="section-title">Método de pago{pagoCompleto && <span className="check-mark">✓</span>}</p>

      <div className="payment-options">
        <label className={`pay-option ${pago === 'transferencia' ? 'selected' : ''}`} onClick={() => handleInputChange('pago', 'transferencia')}>
          <div className="pay-icon">🏦</div>
          <div className="pay-label">Transferencia</div>
          <div className="pay-sub">Adjuntá comprobante</div>
        </label>
        <label className={`pay-option ${pago === 'efectivo' ? 'selected' : ''}`} onClick={() => handleInputChange('pago', 'efectivo')}>
          <div className="pay-icon">💵</div>
          <div className="pay-label">Efectivo</div>
          <div className="pay-sub">Al momento de entrega</div>
        </label>
      </div>

      {pago === 'transferencia' && (
        <div className="comprobante-field visible">
          <button
            type="button"
            className="btn-whatsapp-comprobante"
            onClick={() => {
              setComprobanteEnviado(true);
              window.open('https://wa.me/5491126487393?text=Hola%2C%20realicé%20un%20pedido%20de%20medialunas%20y%20adjunto%20mi%20comprobante%20de%20transferencia%20🥐', '_blank');
            }}
          >Enviar comprobante por WhatsApp 📎</button>
          {comprobanteEnviado && (
            <div className="comprobante-success-text">
              ✓ Comprobante enviado por WhatsApp
            </div>
          )}
        </div>
      )}
    </div>
  );
}
