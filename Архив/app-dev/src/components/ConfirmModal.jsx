import { X, Check, Loader2 } from 'lucide-react'

export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
  confirmLabel,
  cancelLabel = 'Отмена',
}) {
  const submitText = confirmLabel ?? (danger ? 'Удалить' : 'Подтвердить')
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="modal-box modal-box--sm">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>
        <p className="confirm-text">{message}</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            className={danger ? 'btn-danger' : 'btn-save'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
            {submitText}
          </button>
        </div>
      </div>
    </div>
  )
}
