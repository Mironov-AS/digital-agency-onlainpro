import { useState, useEffect } from 'react'
import {
  Plus, Trash2, X, Check, Loader2, Edit2, RotateCcw,
  ArrowUp, ArrowDown, Eye, EyeOff,
} from 'lucide-react'
import { apiFetch } from '../../api.js'

const FIELD_TYPES = [
  { value: 'text', label: 'Текст' },
  { value: 'number', label: 'Число' },
  { value: 'phone', label: 'Телефон' },
  { value: 'email', label: 'E-mail' },
  { value: 'date', label: 'Дата' },
  { value: 'list', label: 'Список' },
  { value: 'checkbox', label: 'Чекбокс' },
]

export default function CrmFieldsSettings() {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleted, setShowDeleted] = useState(false)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', field_type: 'text', is_required: false, is_visible: true, options: [] })
  const [optionInput, setOptionInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadFields() {
    setLoading(true)
    try {
      const params = showDeleted ? '?include_deleted=true' : ''
      const data = await apiFetch(`/api/crm/custom-fields${params}`)
      setFields(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('[crm] load fields', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadFields() }, [showDeleted])

  function openAdd() {
    setForm({ name: '', field_type: 'text', is_required: false, is_visible: true, options: [] })
    setOptionInput('')
    setError('')
    setModal('add')
  }

  function openEdit(f) {
    setForm({
      name: f.name,
      field_type: f.field_type,
      is_required: !!f.is_required,
      is_visible: f.is_visible !== false,
      sort_order: f.sort_order || 0,
      options: Array.isArray(f.options) ? f.options : [],
    })
    setOptionInput('')
    setError('')
    setModal(f.id)
  }

  async function handleSave() {
    if (!form.name?.trim()) { setError('Название обязательно'); return }
    setSaving(true)
    setError('')
    try {
      if (modal === 'add') {
        await apiFetch('/api/crm/custom-fields', {
          method: 'POST',
          body: JSON.stringify(form),
        })
      } else {
        await apiFetch(`/api/crm/custom-fields/${modal}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        })
      }
      setModal(null)
      loadFields()
    } catch (e) {
      setError(e.error || e.message || 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Удалить поле? Данные сохранятся, поле можно будет восстановить.')) return
    try {
      await apiFetch(`/api/crm/custom-fields/${id}`, { method: 'DELETE' })
      loadFields()
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    }
  }

  async function handleRestore(id) {
    try {
      await apiFetch(`/api/crm/custom-fields/${id}/restore`, { method: 'POST' })
      loadFields()
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    }
  }

  function addOption() {
    const v = optionInput.trim()
    if (!v || form.options.includes(v)) return
    setForm(f => ({ ...f, options: [...f.options, v] }))
    setOptionInput('')
  }

  function removeOption(idx) {
    setForm(f => ({ ...f, options: f.options.filter((_, i) => i !== idx) }))
  }

  async function moveField(id, direction) {
    const active = fields.filter(f => !f.is_deleted)
    const idx = active.findIndex(f => f.id === id)
    if (idx < 0) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= active.length) return

    const a = active[idx]
    const b = active[swapIdx]
    try {
      await Promise.all([
        apiFetch(`/api/crm/custom-fields/${a.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...a, sort_order: b.sort_order ?? swapIdx }),
        }),
        apiFetch(`/api/crm/custom-fields/${b.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...b, sort_order: a.sort_order ?? idx }),
        }),
      ])
      loadFields()
    } catch (e) {
      console.error('[crm] move field', e)
    }
  }

  const activeFields = fields.filter(f => !f.is_deleted)
  const deletedFields = fields.filter(f => f.is_deleted)

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Пользовательские поля</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
            Дополнительные поля для карточки клиента (макс. 50)
          </p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={14} /> Добавить поле
        </button>
      </div>

      {loading ? (
        <div className="loading-center"><Loader2 size={28} className="spin" /></div>
      ) : activeFields.length === 0 ? (
        <div className="empty-state">
          <p>Нет пользовательских полей</p>
          <button className="btn-primary-sm" onClick={openAdd}><Plus size={14} /> Добавить первое</button>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th>Название</th>
                <th>Тип</th>
                <th style={{ width: 90 }}>Обязат.</th>
                <th style={{ width: 90 }}>Видимость</th>
                <th style={{ width: 160 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {activeFields.map((f, i) => (
                <tr key={f.id}>
                  <td style={{ color: '#9ca3af', fontSize: 12 }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{f.name}</td>
                  <td style={{ color: '#6b7280', fontSize: 13 }}>
                    {FIELD_TYPES.find(t => t.value === f.field_type)?.label || f.field_type}
                  </td>
                  <td>{f.is_required ? <Check size={14} style={{ color: '#16a34a' }} /> : '—'}</td>
                  <td>
                    {f.is_visible !== false
                      ? <Eye size={14} style={{ color: '#6b7280' }} />
                      : <EyeOff size={14} style={{ color: '#d1d5db' }} />}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="icon-btn" onClick={() => moveField(f.id, 'up')} disabled={i === 0} title="Вверх">
                        <ArrowUp size={14} />
                      </button>
                      <button className="icon-btn" onClick={() => moveField(f.id, 'down')} disabled={i === activeFields.length - 1} title="Вниз">
                        <ArrowDown size={14} />
                      </button>
                      <button className="icon-btn" onClick={() => openEdit(f)} title="Редактировать">
                        <Edit2 size={14} />
                      </button>
                      <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(f.id)} title="Удалить">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deletedFields.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <button
            className="btn-cancel"
            onClick={() => setShowDeleted(!showDeleted)}
            style={{ fontSize: 13 }}
          >
            <RotateCcw size={13} /> {showDeleted ? 'Скрыть удалённые' : `Показать удалённые (${deletedFields.length})`}
          </button>
          {showDeleted && (
            <div style={{ marginTop: 12, background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca', overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Тип</th>
                    <th style={{ width: 120 }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedFields.map(f => (
                    <tr key={f.id} style={{ opacity: 0.7 }}>
                      <td>{f.name}</td>
                      <td style={{ color: '#6b7280', fontSize: 13 }}>
                        {FIELD_TYPES.find(t => t.value === f.field_type)?.label || f.field_type}
                      </td>
                      <td>
                        <button className="btn-primary-sm" onClick={() => handleRestore(f.id)}>
                          <RotateCcw size={13} /> Восстановить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2>{modal === 'add' ? 'Новое поле' : 'Редактирование поля'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleSave() }} className="modal-form" autoComplete="off">
              <div className="form-row">
                <label>Название *</label>
                <input className="field" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Название поля" autoComplete="off" />
              </div>
              <div className="form-row">
                <label>Тип поля</label>
                <select className="field" value={form.field_type}
                  onChange={e => setForm(f => ({ ...f, field_type: e.target.value }))} autoComplete="off">
                  {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_required}
                    onChange={e => setForm(f => ({ ...f, is_required: e.target.checked }))} />
                  Обязательное
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_visible}
                    onChange={e => setForm(f => ({ ...f, is_visible: e.target.checked }))} />
                  Видимое в таблице
                </label>
              </div>

              {form.field_type === 'list' && (
                <div className="form-row">
                  <label>Варианты списка</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input className="field" value={optionInput}
                      onChange={e => setOptionInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption() } }}
                      placeholder="Добавить вариант" autoComplete="off" />
                    <button type="button" className="btn-primary-sm" onClick={addOption}>
                      <Plus size={14} />
                    </button>
                  </div>
                  {form.options.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {form.options.map((opt, i) => (
                        <span key={i} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 10px', background: '#f3f4f6', borderRadius: 6,
                          fontSize: 13, color: '#374151',
                        }}>
                          {opt}
                          <button type="button" onClick={() => removeOption(i)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9ca3af' }}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Отмена</button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
