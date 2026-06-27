import './PackSelector.css';

const CheckMark = () => <span className="check-mark">✓</span>;

export default function PackSelector({ qtys, cambiarQty, precios, nombres, resumenLineas, total, packsCompletos }) {
  const totalUnidades = (qtys.individual || 0) * 3 + 
                        (qtys.media || 0) * 6 + 
                        (qtys.clasico || 0) * 12 + 
                        (qtys.familiar || 0) * 24;

  return (
    <div className="pack-selector-container">
      <p className="section-title">Elegí tus packs{packsCompletos && <CheckMark />}</p>

      <div className="packs-list">
        {Object.keys(precios).filter(k => k !== 'id').map(packKey => {
          const unidades = { individual: '3 unidades', media: '6 unidades', clasico: '12 unidades', familiar: '24 unidades' };
          return (
            <div key={packKey} className={`pack-card ${qtys[packKey] > 0 ? 'active' : ''}`}>
              <div className="pack-img-wrapper">
                 <img src={`/packs/pack-${packKey}.png`} alt={nombres[packKey]} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                 <div className="img-fallback">🥐</div>
              </div>
              
              <div className="pack-name">{nombres[packKey]} <span style={{ fontSize: '12px', fontWeight: 400, opacity: 0.7 }}>({unidades[packKey]})</span></div>
              
              <div className="pack-footer">
                <div className="pack-price">${precios[packKey].toLocaleString('es-AR')}</div>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => cambiarQty(packKey, -1)} disabled={qtys[packKey] === 0}>−</button>
                  <span className="qty-num">{qtys[packKey]}</span>
                  <button className="qty-btn" onClick={() => cambiarQty(packKey, 1)}>+</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalUnidades > 48 && (
        <div style={{
          marginTop: '12px',
          padding: '12px 14px',
          backgroundColor: '#FFFBE6',
          border: '1px solid #FF9800',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#856404',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span>⚠️</span>
            <span style={{ lineHeight: '1.4' }}><strong>Pedido grande:</strong> Consultá la disponibilidad por WhatsApp antes de realizar el pedido.</span>
          </div>
          <button
            type="button"
            onClick={() => {
              const msg = `Quiero hacer un pedido de ${totalUnidades} medialunas, ¿hay stock para un pedido de este tamaño?`;
              window.open(`https://wa.me/5491150593803?text=${encodeURIComponent(msg)}`, '_blank');
            }}
            style={{
              width: '100%',
              background: '#25D366',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: 'inherit'
            }}
          >
            <span style={{ fontSize: '16px' }}>📱</span> Consultar por WhatsApp
          </button>
        </div>
      )}

      {resumenLineas.length > 0 && (
        <div className="resumen visible">
          <div className="resumen-title">Resumen del pedido</div>
          <div className="resumen-items">
            {Object.keys(qtys).map(k => qtys[k] > 0 && (
              <div key={k}>{qtys[k]} × {nombres[k]} — ${(qtys[k] * precios[k]).toLocaleString('es-AR')}</div>
            ))}
          </div>
          <div className="resumen-total">Total: ${total.toLocaleString('es-AR')}</div>
        </div>
      )}
    </div>
  );
}
