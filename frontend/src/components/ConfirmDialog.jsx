import { useEffect } from 'react'

export default function ConfirmDialog({ titulo, onConfirm, onCancel }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onCancel])

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
        <p className="confirm-text">
          Excluir <strong>"{titulo || '(sem título)'}"</strong>?
        </p>
        <p className="confirm-subtext">Essa ação não pode ser desfeita.</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel} autoFocus>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}
