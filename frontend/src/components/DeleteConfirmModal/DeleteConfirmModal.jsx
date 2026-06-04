import './DeleteConfirmModal.css';

export default function DeleteConfirmModal({ orderToDelete, onCancel, onConfirm }) {
  if (!orderToDelete) return null;

  return (
    <div className="delete-modal-overlay" onClick={onCancel}>
      <div className="delete-modal-content" onClick={e => e.stopPropagation()}>
        <div className="delete-modal-icon">⚠️</div>
        <h3 className="delete-modal-title">¿Eliminar pedido?</h3>
        <p className="delete-modal-text">
          Esta acción no se puede deshacer. El pedido de <strong>{orderToDelete.nombre}</strong> será eliminado permanentemente.
        </p>
        <div className="delete-modal-actions">
          <button className="btn-delete-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn-delete-confirm" onClick={() => onConfirm(orderToDelete.id)}>
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
