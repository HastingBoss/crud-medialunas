import { useState } from 'react';
import './StockAlert.css';

export default function StockAlert({ stock, threshold }) {
  const [prevStock, setPrevStock] = useState(stock);
  const [closed, setClosed] = useState(false);

  // Si el stock cambia, actualizamos el stock anterior. Si sube por encima 
  // del umbral, reseteamos el estado "cerrado" para que vuelva a aparecer 
  // si vuelve a bajar de nuevo en el futuro.
  if (stock !== prevStock) {
    setPrevStock(stock);
    if (stock > threshold) {
      setClosed(false);
    }
  }

  if (closed || stock > threshold) return null;

  return (
    <div className="stock-alert-floating">
      <div className="stock-alert-header">
        <div className="stock-alert-icon">🚨</div>
        <button className="stock-alert-close" onClick={() => setClosed(true)}>✕</button>
      </div>
      <div className="stock-alert-title">Stock Crítico</div>
      <div className="stock-alert-body">
        ¡Atención! Solo quedan <strong>{stock}</strong> medialunas disponibles. 
        El umbral de alerta es de {threshold} unidades.
      </div>
      <div className="stock-alert-footer">
        Reponé el stock pronto para seguir tomando pedidos.
      </div>
    </div>
  );
}
