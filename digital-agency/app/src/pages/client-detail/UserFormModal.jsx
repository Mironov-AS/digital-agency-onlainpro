import { useState } from 'react'
import { Loader2, X, Check } from 'lucide-react'
import { apiFetch } from '../../api.js'

export default function UserFormModal({ clientId, user, onClose, onSave, loading, serverError }) {
  const isEdit = !!user
  const [form, setForm] = useState({
    email: user?.email || '',
    name: user?.name || '',
    password: '',
  })
  const [errors, setErrors] = useState({})

  function validate() {
    const errs = {}
    if (!form.email.trim()) errs.email = 'Email обязателен'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Некорректный email'
    if (!form.name.trim()) errs.name = 'Имя обязательно'
    if (!isEdit && !form.password) errs.password = 'Пароль обязателен'
    else if (form.password && form.password.length < 6) errs.password = 'Минимум 6 символов'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      const payload = {
        email: form.email.trim(),
        name: form.name.trim(),
        role: 'client',
        client_id: clientId,
        apps: ['product-shelf'],
      }
      if (form.password) payload.password = form.password

      if (isEdit) {
        await apiFetch(`/api/auth/users/${user.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      } else {
        await apiFetch('/api/auth/users', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }
      onSave()
    } catch (e) {
      setErrors({ form: e.error || 'Ошибка сохранения' })
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>{isEdit ? 'Редактировать пользователя' : 'Новый пользователь'}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form" autoComplete="off">
          <div className="form-row">
            <label>Email *</label>
            <input
              className={`field ${errors.email ? 'field-error' : ''}`}
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="user@company.ru"
              disabled={isEdit}
              autoComplete="off"
            />
            {errors.email && <span style={{ color: '#dc2626', fontSize: 12 }}>{errors.email}</span>}
          </div>
          <div className="form-row">
            <label>Имя *</label>
            <input
              className={`field ${errors.name ? 'field-error' : ''}`}
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Иванов Иван"
              autoComplete="off"
            />
            {errors.name && <span style={{ color: '#dc2626', fontSize: 12 }}>{errors.name}</span>}
          </div>
          <div className="form-row">
            <label>{isEdit ? 'Новый пароль' : 'Пароль *'}</label>
            <input
              className={`field ${errors.password ? 'field-error' : ''}`}
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder={isEdit ? 'Оставьте пустым, чтобы не менять' : 'Минимум 6 символов'}
              autoComplete="new-password"
            />
            {errors.password && <span style={{ color: '#dc2626', fontSize: 12 }}>{errors.password}</span>}
          </div>
          {errors.form && <div className="form-error">{errors.form}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
              {loading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
