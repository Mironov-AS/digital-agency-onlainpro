import { useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, X, Check } from 'lucide-react'
import { apiFetch } from '../../api.js'
import { API_CAT, ColorPicker, ConfirmDelete } from './shared.jsx'

function CategoryModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { label: '', value: '', color: '#3b82f6', sort_order: 0 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  function set(f, v) { setForm(p => ({ ...p, [f]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.label.trim()) { setError('Название обязательно'); return }
    if (!initial?.id && !form.value.trim()) { setError('Код обязателен'); return }
    setSaving(true); setError('')
    try {
      const body = { label: form.label.trim(), color: form.color, sort_order: Number(form.sort_order) || 0, ...(!initial?.id && { value: form.value.trim() }) }
      if (initial?.id) await apiFetch(`${API_CAT}/${initial.id}`, { method: 'PUT', body: JSON.stringify(body) })
      else await apiFetch(API_CAT, { method: 'POST', body: JSON.stringify(body) })
      onSave()
    } catch (err) { setError(err.error || 'Ошибка сохранения') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>{initial?.id ? 'Редактировать вид' : 'Новый вид услуги'}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form" autoComplete="off">
          <div className="form-row"><label>Название *</label>
            <input className="field" value={form.label} onChange={e => set('label', e.target.value)} placeholder="Веб-приложения" autoComplete="off" />
          </div>
          {!initial?.id && (
            <div className="form-row"><label>Код (slug) *</label>
              <input className="field" value={form.value}
                onChange={e => set('value', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, ''))}
                placeholder="webapps" autoComplete="off" />
              <span className="field-hint">Латинские буквы, цифры, дефис. Нельзя изменить после создания.</span>
            </div>
          )}
          {initial?.id && (
            <div className="form-row"><label>Код</label>
              <input className="field" value={form.value || initial.value} disabled style={{ opacity: .6 }} />
            </div>
          )}
          <div className="form-row"><label>Цвет</label>
            <ColorPicker value={form.color} onChange={v => set('color', v)} />
          </div>
          <div className="form-row" style={{ maxWidth: 160 }}><label>Порядок сортировки</label>
            <input className="field" type="number" min="0" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} autoComplete="off" />
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
              {saving ? 'Сохраняем…' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CategoriesSection({ categories, onReload, isAdmin }) {
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  async function handleDelete(cat) {
    try {
      await apiFetch(`${API_CAT}/${cat.id}`, { method: 'DELETE' })
      setDeleting(null); onReload()
    } catch (err) { setDeleteError(err.error || 'Ошибка удаления') }
  }

  return (
    <>
      {isAdmin && (
        <div className="section-toolbar">
          <button className="btn-primary-sm" onClick={() => setModal('create')}><Plus size={16} /> Добавить вид услуги</button>
        </div>
      )}

      {categories.length === 0 ? <div className="empty-state">Виды услуг не найдены</div> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr>
              <th style={{ width: 50 }}>Цвет</th>
              <th>Название</th><th>Код</th><th>Порядок</th>
              {isAdmin && <th>Действия</th>}
            </tr></thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="svc-row">
                  <td><span className="color-preview" style={{ background: cat.color }} /></td>
                  <td>
                    <span className="cat-badge" style={{ background: cat.color + '1a', color: cat.color }}>
                      {cat.label}
                    </span>
                  </td>
                  <td><code className="slug-code">{cat.value}</code></td>
                  <td className="td-order">{cat.sort_order}</td>
                  {isAdmin && (
                    <td className="td-actions">
                      <button className="icon-btn" onClick={() => setModal(cat)}><Pencil size={15} /></button>
                      <button className="icon-btn icon-btn--danger" onClick={() => { setDeleteError(''); setDeleting(cat) }}><Trash2 size={15} /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && <CategoryModal initial={modal === 'create' ? null : modal} onSave={() => { setModal(null); onReload() }} onClose={() => setModal(null)} />}
      {deleting && <ConfirmDelete name={deleting.label} extra={deleteError} onConfirm={() => handleDelete(deleting)} onClose={() => setDeleting(null)} />}
    </>
  )
}
