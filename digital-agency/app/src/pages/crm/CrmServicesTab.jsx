import { useState, useEffect } from 'react'
import {
  Plus, Trash2, X, Check, Loader2, Download,
  Edit2, FolderPlus, Archive, Settings, ChevronDown, ChevronUp,
} from 'lucide-react'
import { apiFetch } from '../../api.js'

const FIELD_TYPES = [
  { value: 'text', label: 'Текст' },
  { value: 'number', label: 'Число' },
  { value: 'phone', label: 'Телефон' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Дата' },
  { value: 'list', label: 'Список' },
  { value: 'checkbox', label: 'Флажок' },
]

export default function CrmServicesTab() {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [catModal, setCatModal] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', category_id: '', duration: 60, price: 0, sort_order: 0 })
  const [catForm, setCatForm] = useState({ name: '', parent_id: '', sort_order: 0 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filterCat, setFilterCat] = useState('')

  const [customFields, setCustomFields] = useState([])
  const [fieldsOpen, setFieldsOpen] = useState(false)
  const [fieldForm, setFieldForm] = useState({ name: '', field_type: 'text', is_required: false, options: [] })
  const [fieldEditing, setFieldEditing] = useState(null)
  const [fieldSaving, setFieldSaving] = useState(false)
  const [newOption, setNewOption] = useState('')

  async function loadData() {
    setLoading(true)
    try {
      const [svcs, cats] = await Promise.all([
        apiFetch('/api/crm/services'),
        apiFetch('/api/crm/categories'),
      ])
      setServices(Array.isArray(svcs) ? svcs : [])
      setCategories(Array.isArray(cats) ? cats : [])
    } catch (e) {
      console.error('[crm] load services', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function loadCustomFields(serviceId) {
    try {
      const data = await apiFetch(`/api/crm/service-fields?service_id=${serviceId}`)
      setCustomFields(Array.isArray(data) ? data : [])
    } catch { setCustomFields([]) }
  }

  function openAddService() {
    setForm({ name: '', description: '', category_id: '', duration: 60, price: 0, sort_order: 0 })
    setCustomFields([])
    setFieldsOpen(false)
    resetFieldForm()
    setError('')
    setModal('add')
  }

  function openEditService(s) {
    setForm({
      name: s.name, description: s.description || '', category_id: s.category_id || '',
      duration: s.duration || 60, price: s.price || 0, sort_order: s.sort_order || 0,
    })
    setFieldsOpen(false)
    resetFieldForm()
    setError('')
    setModal(s.id)
    loadCustomFields(s.id)
  }

  function resetFieldForm() {
    setFieldForm({ name: '', field_type: 'text', is_required: false, options: [] })
    setFieldEditing(null)
    setNewOption('')
  }

  function openAddCategory() {
    setCatForm({ name: '', parent_id: '', sort_order: 0 })
    setError('')
    setCatModal('add')
  }

  function openEditCategory(c) {
    setCatForm({ name: c.name, parent_id: c.parent_id || '', sort_order: c.sort_order || 0 })
    setError('')
    setCatModal(c.id)
  }

  async function handleSaveService() {
    if (!form.name) { setError('Название обязательно'); return }
    setSaving(true)
    setError('')
    try {
      const body = { ...form, duration: +form.duration, price: +form.price, sort_order: +form.sort_order }
      if (modal === 'add') {
        const created = await apiFetch('/api/crm/services', { method: 'POST', body: JSON.stringify(body) })
        loadData()
        setModal(created.id)
        setCustomFields([])
        setFieldsOpen(true)
        resetFieldForm()
      } else {
        await apiFetch(`/api/crm/services/${modal}`, { method: 'PUT', body: JSON.stringify(body) })
        setModal(null)
        loadData()
      }
    } catch (e) {
      setError(e.error || e.message || 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveCategory() {
    if (!catForm.name) { setError('Название обязательно'); return }
    setSaving(true)
    setError('')
    try {
      const body = { ...catForm, sort_order: +catForm.sort_order }
      if (catModal === 'add') {
        await apiFetch('/api/crm/categories', { method: 'POST', body: JSON.stringify(body) })
      } else {
        await apiFetch(`/api/crm/categories/${catModal}`, { method: 'PUT', body: JSON.stringify(body) })
      }
      setCatModal(null)
      loadData()
    } catch (e) {
      setError(e.error || e.message || 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  async function handleArchiveService(id) {
    if (!confirm('Архивировать услугу?')) return
    try {
      await apiFetch(`/api/crm/services/${id}`, { method: 'DELETE' })
      loadData()
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    }
  }

  async function handleDeleteCategory(id) {
    if (!confirm('Архивировать категорию?')) return
    try {
      await apiFetch(`/api/crm/categories/${id}`, { method: 'DELETE' })
      loadData()
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    }
  }

  async function handleExport() {
    try {
      const res = await fetch('/api/crm/export/services', { credentials: 'include' })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'services.csv'; a.click()
      URL.revokeObjectURL(url)
    } catch { alert('Ошибка экспорта') }
  }

  async function handleSaveField() {
    if (!fieldForm.name.trim()) { setError('Название поля обязательно'); return }
    setFieldSaving(true)
    setError('')
    try {
      const body = { ...fieldForm, service_id: modal }
      if (fieldEditing) {
        await apiFetch(`/api/crm/service-fields/${fieldEditing}`, { method: 'PUT', body: JSON.stringify(body) })
      } else {
        await apiFetch('/api/crm/service-fields', { method: 'POST', body: JSON.stringify(body) })
      }
      resetFieldForm()
      loadCustomFields(modal)
    } catch (e) {
      setError(e.error || e.message || 'Ошибка')
    } finally {
      setFieldSaving(false)
    }
  }

  function startEditField(f) {
    setFieldForm({ name: f.name, field_type: f.field_type, is_required: f.is_required, options: f.options || [] })
    setFieldEditing(f.id)
    setNewOption('')
  }

  async function handleDeleteField(id) {
    if (!confirm('Удалить доп. поле?')) return
    try {
      await apiFetch(`/api/crm/service-fields/${id}`, { method: 'DELETE' })
      loadCustomFields(modal)
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    }
  }

  function addOption() {
    if (!newOption.trim()) return
    setFieldForm(f => ({ ...f, options: [...f.options, newOption.trim()] }))
    setNewOption('')
  }

  function removeOption(idx) {
    setFieldForm(f => ({ ...f, options: f.options.filter((_, i) => i !== idx) }))
  }

  const filtered = filterCat
    ? services.filter(s => s.category_id === filterCat)
    : services

  const activeServices = filtered.filter(s => s.status === 'active')
  const archivedServices = filtered.filter(s => s.status === 'archived')

  if (loading) return <div className="loading-center"><Loader2 size={28} className="spin" /></div>

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <select className="field" value={filterCat} onChange={e => setFilterCat(e.target.value)}
          style={{ maxWidth: 240 }} autoComplete="off">
          <option value="">Все категории</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn-primary-sm" onClick={openAddCategory}>
          <FolderPlus size={14} /> Категория
        </button>
        <button className="btn-primary-sm" onClick={handleExport} title="Экспорт CSV">
          <Download size={14} /> CSV
        </button>
        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={openAddService}>
          <Plus size={14} /> Добавить услугу
        </button>
      </div>

      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {categories.map(c => (
            <div key={c.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', background: '#f5f3ff', borderRadius: 6, fontSize: 12, color: '#7c3aed',
            }}>
              <span style={{ fontWeight: 600 }}>{c.name}</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed', padding: 0 }}
                onClick={() => openEditCategory(c)} title="Редактировать">
                <Edit2 size={12} />
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 0 }}
                onClick={() => handleDeleteCategory(c.id)} title="Архивировать">
                <Archive size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeServices.length === 0 && archivedServices.length === 0 ? (
        <div className="empty-state">
          <p>Нет услуг</p>
          <button className="btn-primary-sm" onClick={openAddService}><Plus size={14} /> Добавить первую</button>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Категория</th>
                <th style={{ width: 100 }}>Длительность</th>
                <th style={{ width: 100 }}>Цена</th>
                <th style={{ width: 90 }}>Статус</th>
                <th style={{ width: 100 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {activeServices.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{s.name}</div>
                    {s.description && <div style={{ fontSize: 12, color: '#6b7280', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description}</div>}
                  </td>
                  <td style={{ color: '#6b7280', fontSize: 13 }}>{s.category_name || '—'}</td>
                  <td style={{ fontSize: 13 }}>{s.duration} мин</td>
                  <td style={{ fontWeight: 600 }}>{Number(s.price).toLocaleString('ru-RU')} ₽</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: '#dcfce7', color: '#16a34a' }}>
                      Активна
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="icon-btn" onClick={() => openEditService(s)} title="Редактировать"><Edit2 size={15} /></button>
                      <button className="icon-btn icon-btn--danger" onClick={() => handleArchiveService(s.id)} title="Архивировать"><Archive size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {archivedServices.map(s => (
                <tr key={s.id} style={{ opacity: 0.5 }}>
                  <td><div style={{ fontWeight: 600 }}>{s.name}</div></td>
                  <td style={{ color: '#6b7280', fontSize: 13 }}>{s.category_name || '—'}</td>
                  <td style={{ fontSize: 13 }}>{s.duration} мин</td>
                  <td>{Number(s.price).toLocaleString('ru-RU')} ₽</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: '#f3f4f6', color: '#6b7280' }}>
                      Архив
                    </span>
                  </td>
                  <td>
                    <button className="icon-btn" onClick={() => openEditService(s)} title="Восстановить"><Edit2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Service Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box" style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>{modal === 'add' ? 'Новая услуга' : 'Редактирование услуги'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleSaveService() }} className="modal-form" autoComplete="off">
              <div className="form-row">
                <label>Название *</label>
                <input className="field" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Название услуги" autoComplete="off" />
              </div>
              <div className="form-row">
                <label>Описание</label>
                <textarea className="field" rows={2} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Описание" autoComplete="off" />
              </div>
              <div className="form-row">
                <label>Категория</label>
                <select className="field" value={form.category_id}
                  onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} autoComplete="off">
                  <option value="">Без категории</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div className="form-row">
                  <label>Длительность (мин)</label>
                  <input className="field" type="number" min="0" value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} autoComplete="off" />
                </div>
                <div className="form-row">
                  <label>Цена (₽)</label>
                  <input className="field" type="number" min="0" step="100" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))} autoComplete="off" />
                </div>
              </div>

              {/* Custom Fields Section — only for existing services */}
              {modal !== 'add' && (
                <div style={{ marginTop: 12, borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
                  <button type="button" onClick={() => setFieldsOpen(!fieldsOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, background: 'none',
                      border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                      color: '#4f46e5', padding: 0, width: '100%',
                    }}>
                    <Settings size={15} />
                    Дополнительные поля ({customFields.length})
                    {fieldsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {fieldsOpen && (
                    <div style={{ marginTop: 12 }}>
                      {customFields.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                          {customFields.map(f => (
                            <div key={f.id} style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '8px 12px', background: '#f9fafb', borderRadius: 8, fontSize: 13,
                            }}>
                              <span style={{ fontWeight: 600, flex: 1 }}>{f.name}</span>
                              <span style={{
                                fontSize: 11, padding: '2px 6px', borderRadius: 4,
                                background: '#e0e7ff', color: '#4338ca',
                              }}>
                                {FIELD_TYPES.find(t => t.value === f.field_type)?.label || f.field_type}
                              </span>
                              {f.is_required && (
                                <span style={{
                                  fontSize: 11, padding: '2px 6px', borderRadius: 4,
                                  background: '#fef3c7', color: '#92400e',
                                }}>обяз.</span>
                              )}
                              <button type="button" className="icon-btn" onClick={() => startEditField(f)} title="Редактировать">
                                <Edit2 size={13} />
                              </button>
                              <button type="button" className="icon-btn icon-btn--danger" onClick={() => handleDeleteField(f.id)} title="Удалить">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{
                        padding: 12, background: '#f0f9ff', borderRadius: 8,
                        border: '1px solid #bae6fd',
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#0369a1' }}>
                          {fieldEditing ? 'Редактировать поле' : 'Добавить поле'}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
                          <input className="field" placeholder="Название поля" value={fieldForm.name}
                            onChange={e => setFieldForm(f => ({ ...f, name: e.target.value }))}
                            style={{ fontSize: 13 }} autoComplete="off" />
                          <select className="field" value={fieldForm.field_type}
                            onChange={e => setFieldForm(f => ({ ...f, field_type: e.target.value, options: e.target.value === 'list' ? f.options : [] }))}
                            style={{ fontSize: 13 }} autoComplete="off">
                            {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                            <input type="checkbox" checked={fieldForm.is_required}
                              onChange={e => setFieldForm(f => ({ ...f, is_required: e.target.checked }))} />
                            Обязательное поле
                          </label>
                        </div>

                        {fieldForm.field_type === 'list' && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Варианты списка:</div>
                            {fieldForm.options.map((opt, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontSize: 13, flex: 1 }}>{opt}</span>
                                <button type="button" onClick={() => removeOption(idx)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 0 }}>
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                            <div style={{ display: 'flex', gap: 4 }}>
                              <input className="field" value={newOption} placeholder="Новый вариант"
                                onChange={e => setNewOption(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption() } }}
                                style={{ fontSize: 13, flex: 1 }} autoComplete="off" />
                              <button type="button" className="btn-primary-sm" onClick={addOption}
                                style={{ fontSize: 12, padding: '4px 8px' }}>
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                          <button type="button" className="btn-primary-sm" onClick={handleSaveField}
                            disabled={fieldSaving} style={{ fontSize: 12 }}>
                            {fieldSaving ? <Loader2 size={12} className="spin" /> : <Check size={12} />}
                            {fieldEditing ? 'Обновить' : 'Добавить'}
                          </button>
                          {fieldEditing && (
                            <button type="button" className="btn-cancel" onClick={resetFieldForm}
                              style={{ fontSize: 12, padding: '4px 10px' }}>
                              Отмена
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModal(null)}>
                  {modal !== 'add' ? 'Закрыть' : 'Отмена'}
                </button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
                  {saving ? 'Сохранение...' : modal === 'add' ? 'Сохранить и настроить поля' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {catModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setCatModal(null)}>
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2>{catModal === 'add' ? 'Новая категория' : 'Редактирование категории'}</h2>
              <button className="modal-close" onClick={() => setCatModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleSaveCategory() }} className="modal-form" autoComplete="off">
              <div className="form-row">
                <label>Название *</label>
                <input className="field" value={catForm.name}
                  onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="Название категории" autoComplete="off" />
              </div>
              <div className="form-row">
                <label>Родительская категория</label>
                <select className="field" value={catForm.parent_id}
                  onChange={e => setCatForm(f => ({ ...f, parent_id: e.target.value }))} autoComplete="off">
                  <option value="">Корневая</option>
                  {categories.filter(c => c.id !== catModal).map(c =>
                    <option key={c.id} value={c.id}>{c.name}</option>,
                  )}
                </select>
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setCatModal(null)}>Отмена</button>
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
