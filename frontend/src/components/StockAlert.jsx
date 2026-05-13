import React, { useState, useEffect } from 'react';

export default function StockAlert({ stock, threshold }) {
  const [closed, setClosed] = useState(false);

  // Si el stock sube por encima del umbral, reseteamos el estado "cerrado"
  // para que vuelva a aparecer si vuelve a bajar.
  useEffect(() => {
    if (stock > threshold) {
      setClosed(false);
    }
  }, [stock, threshold]);

  if (closed || stock > threshold) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: '320px',
      background: '#fff',
      borderLeft: '6px solid #d32f2f',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
      padding: '20px',
      zIndex: 20000,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      animation: 'slideInStock 0.4s ease-out'
    }}>
      <style>{`
        @keyframes slideInStock {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '18px' }}>🚨</div>
        <button 
          onClick={() => setClosed(true)}
          style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#999', padding: '0' }}
        >✕</button>
      </div>
      <div style={{ fontWeight: 700, color: '#d32f2f', fontSize: '16px' }}>Stock Crítico</div>
      <div style={{ fontSize: '14px', color: '#555', lineHeight: 1.5 }}>
        ¡Atención! Solo quedan <strong>{stock}</strong> medialunas disponibles. 
        El umbral de alerta es de {threshold} unidades.
      </div>
      <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--muted)' }}>
        Reponé el stock pronto para seguir tomando pedidos.
      </div>
    </div>
  );
}
