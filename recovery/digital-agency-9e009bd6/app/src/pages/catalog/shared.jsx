import { X } from 'lucide-react'

export const API_SVC = '/api/catalog/services'
export const API_CAT = '/api/catalog/categories'
export const API_COSTS = '/api/catalog/costs'

export const PRICE_TYPES = [
  { value: 'from',   label: 'от N ₽' },
  { value: 'fixed',  label: 'Фиксировано' },
  { value: 'hourly', label: 'За час' },
]

export const PERIOD_LABELS = {
  monthly: 'Ежемесячно',
  quarterly: 'Ежеквартально',
  yearly: 'Ежегодно',
  once: 'Разово',
}

export const PRESET_COLORS = [
  '#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444',
  '#ec4899','#06b6d4','#84cc16','#f97316','#6366f1',
]

export function ColorPicker({ value, onChange }) {
  return (
    <div className="color-picker">
      {PRESET_COLORS.map(c => (
        <button key={c} type="button"
          className={`color-swatch ${value === c ? 'color-swatch--active' : ''}`}
          style={{ background: c }} onClick={() => onChange(c)} />
      ))}
      <input autoComplete="off" type="color" className="color-custom" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

export function ConfirmDelete({ name, extra, onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box--sm">
        <div className="modal-header">
          <h2>Удалить?</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <p className="confirm-text">Элемент <strong>«{name}»</strong> будет удалён. Это действие нельзя отменить.</p>
        {extra && <div className="form-error" style={{ margin: '0 0 8px' }}>{extra}</div>}
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Отмена</button>
          <button className="btn-danger" onClick={onConfirm}>Удалить</button>
        </div>
      </div>
    </div>
  )
}
