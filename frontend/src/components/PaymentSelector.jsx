import React from 'react';

export default function PaymentSelector({ pago, handleInputChange, comprobanteEnviado, setComprobanteEnviado, pagoCompleto }) {
  const CheckMark = () => <span style={{ color: '#2E7D32', marginLeft: '8px', fontSize: '18px' }}>✓</span>;

  return (
    <>
      <p className="section-title" style={{ marginTop: '22px' }}>Método de pago{pagoCompleto && <CheckMark />}</p>

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
        <div className="comprobante-field visible" style={{ marginTop: '15px' }}>
          <button
            type="button"
            onClick={() => {
              setComprobanteEnviado(true);
              window.open('https://wa.me/5491126487393?text=Hola%2C%20realicé%20un%20pedido%20de%20medialunas%20y%20adjunto%20mi%20comprobante%20de%20transferencia%20🥐', '_blank');
            }}
            style={{
              width: '100%', background: '#25D366', color: 'white', border: 'none',
              padding: '18px', borderRadius: '12px', fontSize: '16px', fontWeight: '600',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(37,211,102,0.2)',
            }}
          >Enviar comprobante por WhatsApp 📎</button>
          {comprobanteEnviado && (
            <div style={{ color: '#2E7D32', fontSize: '13px', marginTop: '8px', fontWeight: 500, textAlign: 'center' }}>
              ✓ Comprobante enviado por WhatsApp
            </div>
          )}
        </div>
      )}
    </>
  );
}
