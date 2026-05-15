import React from 'react';
import './PackSelector.css';

export default function PackSelector({ qtys, cambiarQty, precios, nombres, resumenLineas, total, packsCompletos }) {
  const CheckMark = () => <span className="check-mark">✓</span>;

  return (
    <div className="pack-selector-container">
      <p className="section-title">Elegí tus packs{packsCompletos && <CheckMark />}</p>

      <div className="packs-list">
        {Object.keys(precios).map(packKey => {
          const unidades = { individual: '3 unidades', media: '6 unidades', clasico: '12 unidades', familiar: '24 unidades' };
          return (
            <div key={packKey} className={`pack-row ${qtys[packKey] > 0 ? 'active' : ''}`}>
              <div className="pack-info">
                <div className="pack-name">{nombres[packKey]} <span style={{ fontSize: '11px', fontWeight: 400, opacity: 0.7 }}>({unidades[packKey]})</span></div>
                <div className="pack-price">${precios[packKey].toLocaleString('es-AR')}</div>
              </div>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => cambiarQty(packKey, -1)} disabled={qtys[packKey] === 0}>−</button>
                <span className="qty-num">{qtys[packKey]}</span>
                <button className="qty-btn" onClick={() => cambiarQty(packKey, 1)}>+</button>
              </div>
            </div>
          );
        })}
      </div>

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
