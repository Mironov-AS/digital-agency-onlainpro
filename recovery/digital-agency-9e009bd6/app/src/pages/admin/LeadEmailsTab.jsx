import { useState, useEffect } from 'react'
import { Plus, Pencil, X, Trash2 } from 'lucide-react'
import { apiFetch } from '../../api.js'

export default function LeadEmailsTab() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ email: '', label: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await apiFetch('/api/admin/lead-emails')
      setEmails(Array.isArray(data) ? data : [])
    } catch (e) { setError(e.error || 'Ошибка загрузки') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setForm({ email: '', label: '' })
    setError('')
    setModal({ mode: 'add' })
  }

  function openEdit(item) {
    setForm({ email: item.email, label: item.label || '' })
    setError('')
    setModal({ mode: 'edit', target: item })
  }

  async function handleSubmit() {
    if (!form.email.trim()) { setError('Email обязателен'); return }
    setSaving(true); setError('')
    try {
      if (modal.mode === 'add') {
        const created = await apiFetch('/api/admin/lead-emails', { method: 'POST', body: JSON.stringify(form) })
        setEmails(e => [created, ...e])
      } else {
        const updated = await apiFetch(`/api/admin/lead-emails/${modal.target.id}`, { method: 'PATCH', body: JSON.stringify(form) })
        setEmails(e => e.map(x => x.id === updated.id ? updated : x))
      }
      setModal(null)
    } catch (e) { setError(e.error || 'Ошибка сохранения') }
    finally { setSaving(false) }
  }

  async function handleDelete(item) {
    try {
      await apiFetch(`/api/admin/lead-emails/${item.id}`, { method: 'DELETE' })
      setEmails(e => e.filter(x => x.id !== item.id))
    } catch (e) { setError(e.error || 'Ошибка удаления') }
  }

  async function toggleActive(item) {
    try {
      const updated = await apiFetch(`/api/admin/lead-emails/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !item.is_active }),
      })
      setEmails(e => e.map(x => x.id === updated.id ? updated : x))
    } catch (e) { setError(e.error || 'Ошибка') }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>Адреса, на которые приходят заявки с сайта</p>
        <button className="btn-primary-sm" onClick={openAdd}><Plus size={14} /> Добавить</button>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

      {loading ? <p style={{ color: '#6b7280' }}>Загрузка…</p> : emails.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '32px 0' }}>Нет адресов. Добавьте email, чтобы получать заявки с сайта.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Описание</th>
              <th>Активен</th>
              <th style={{ width: '100px' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {emails.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.email}</td>
                <td style={{ color: '#6b7280' }}>{item.label || '—'}</td>
                <td>
                  <button onClick={() => toggleActive(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: item.is_active ? '#22c55e' : '#9ca3af' }}>
                    {item.is_active ? 'Да' : 'Нет'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="icon-btn" title="Редактировать" onClick={() => openEdit(item)}><Pencil size={14} /></button>
                    <button className="icon-btn icon-btn--danger" title="Удалить" onClick={() => handleDelete(item)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box modal-box--sm">
            <div className="modal-header">
              <h2>{modal.mode === 'add' ? 'Добавить email' : 'Редактировать email'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleSubmit() }} className="modal-form" autoComplete="off">
              <div style={{ padding: '0 0 8px' }}>
                <div className="form-row">
                  <label>Email *</label>
                  <input className="field" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" autoFocus autoComplete="off" />
                </div>
                <div className="form-row">
                  <label>Описание (необязательно)</label>
                  <input className="field" type="text" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Например: Отдел продаж" autoComplete="off" />
                </div>
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Отмена</button>
                <button type="submit" className="btn-save" disabled={saving}>{saving ? 'Сохранение…' : 'Сохранить'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
