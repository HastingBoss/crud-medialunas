import React from 'react';

export default function DeleteConfirmModal({ orderToDelete, onCancel, onConfirm }) {
  if (!orderToDelete) return null;

  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={onCancel}
    >
      <div
        style={{ background: '#fff', borderRadius: '16px', padding: '30px', width: '100%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: '50px', marginBottom: '15px' }}>⚠️</div>
        <h3 style={{ color: 'var(--brown)', margin: '0 0 10px 0', fontSize: '22px' }}>¿Eliminar pedido?</h3>
        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', margin: '0 0 25px 0' }}>
          Esta acción no se puede deshacer. El pedido de <strong>{orderToDelete.nombre}</strong> será eliminado permanentemente.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: '#f5f5f5', color: '#666', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
          >Cancelar</button>
          <button
            onClick={() => onConfirm(orderToDelete.id)}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#B71C1C', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
          >Sí, eliminar</button>
        </div>
      </div>
    </div>
  );
}
