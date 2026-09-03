import { useEffect, useState } from 'react'
import {
  Archive, Check, ChevronDown, ChevronUp, Edit2, Loader2,
  Plus, Settings, Trash2, X,
} from 'lucide-react'
import { apiFetch } from '../../api.js'

const EMPTY_FORM = { name: '', sku: '', description: '', unit: 'шт', price: 0, sort_order: 0, status: 'active' }
const FIELD_TYPES = [
  { value: 'text', label: 'Текст' },
  { value: 'number', label: 'Число' },
  { value: 'phone', label: 'Телефон' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Дата' },
  { value: 'list', label: 'Список' },
  { value: 'checkbox', label: 'Флажок' },
]

export default function CrmSalesItemsTab() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [customFields, setCustomFields] = useState([])
  const [fieldsOpen, setFieldsOpen] = useState(false)
  const [fieldForm, setFieldForm] = useState({ name: '', field_type: 'text', is_required: false, options: [] })
  const [fieldEditing, setFieldEditing] = useState(null)
  const [fieldSaving, setFieldSaving] = useState(false)
  const [newOption, setNewOption] = useState('')

  async function loadData() {
    setLoading(true)
    try {
      const data = await apiFetch('/api/crm/sales-items')
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('[crm] load sales items', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function loadCustomFields(salesItemId) {
    try {
      const data = await apiFetch(`/api/crm/sales-item-fields?sales_item_id=${salesItemId}`)
      setCustomFields(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('[crm] load sales item fields', e)
      setCustomFields([])
    }
  }

  function resetFieldForm() {
    setFieldForm({ name: '', field_type: 'text', is_required: false, options: [] })
    setFieldEditing(null)
    setNewOption('')
  }

  function openAdd() {
    setForm(EMPTY_FORM)
    setCustomFields([])
    setFieldsOpen(false)
    resetFieldForm()
    setError('')
    setModal('add')
  }

  function openEdit(item) {
    setForm({
      name: item.name || '',
      sku: item.sku || '',
      description: item.description || '',
      unit: item.unit || 'шт',
      price: item.price || 0,
      sort_order: item.sort_order || 0,
      status: item.status || 'active',
    })
    setFieldsOpen(false)
    resetFieldForm()
    setError('')
    setModal(item.id)
    loadCustomFields(item.id)
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Название обязательно'); return }
    setSaving(true)
    setError('')
    try {
      const body = { ...form, price: +form.price, sort_order: +form.sort_order }
      if (modal === 'add') {
        const created = await apiFetch('/api/crm/sales-items', { method: 'POST', body: JSON.stringify(body) })
        setForm({
          name: created.name || '',
          sku: created.sku || '',
          description: created.description || '',
          unit: created.unit || 'шт',
          price: created.price || 0,
          sort_order: created.sort_order || 0,
          status: created.status || 'active',
        })
        setModal(created.id)
        setCustomFields([])
        setFieldsOpen(true)
        resetFieldForm()
      } else {
        await apiFetch(`/api/crm/sales-items/${modal}`, { method: 'PUT', body: JSON.stringify(body) })
        setModal(null)
      }
      loadData()
    } catch (e) {
      setError(e.error || e.message || 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveField() {
    if (!fieldForm.name.trim()) { setError('Название поля обязательно'); return }
    if (modal === 'add') { setError('Сначала сохраните позицию'); return }
    setFieldSaving(true)
    setError('')
    try {
      const body = { ...fieldForm, sales_item_id: modal }
      if (fieldEditing) {
        await apiFetch(`/api/crm/sales-item-fields/${fieldEditing}`, { method: 'PUT', body: JSON.stringify(body) })
      } else {
        await apiFetch('/api/crm/sales-item-fields', { method: 'POST', body: JSON.stringify(body) })
      }
      resetFieldForm()
      loadCustomFields(modal)
    } catch (e) {
      setError(e.error || e.message || 'Ошибка')
    } finally {
      setFieldSaving(false)
    }
  }

  function startEditField(field) {
    setFieldForm({
      name: field.name,
      field_type: field.field_type,
      is_required: !!field.is_required,
      options: field.options || [],
    })
    setFieldEditing(field.id)
    setNewOption('')
  }

  async function handleDeleteField(id) {
    if (!confirm('Удалить доп. поле?')) return
    try {
      await apiFetch(`/api/crm/sales-item-fields/${id}`, { method: 'DELETE' })
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

  async function handleArchive(id) {
    if (!confirm('Архивировать позицию продаж?')) return
    try {
      await apiFetch(`/api/crm/sales-items/${id}`, { method: 'DELETE' })
      loadData()
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    }
  }

  const activeItems = items.filter(i => i.status === 'active')
  const archivedItems = items.filter(i => i.status === 'archived')

  if (loading) return <div className="loading-center"><Loader2 size={28} className="spin" /></div>

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Номенклатура</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Номенклатура товаров и позиций, которые компания продаёт клиентам.</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={14} /> Добавить позицию</button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>Справочник продаж пуст</p>
          <button className="btn-primary-sm" onClick={openAdd}><Plus size={14} /> Добавить первую позицию</button>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Название</th>
                <th style={{ width: 120 }}>Артикул</th>
                <th style={{ width: 90 }}>Ед.</th>
                <th style={{ width: 120 }}>Цена</th>
                <th style={{ width: 90 }}>Статус</th>
                <th style={{ width: 100 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {[...activeItems, ...archivedItems].map(item => (
                <tr key={item.id} style={item.status === 'archived' ? { opacity: 0.55 } : undefined}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#111827' }}>{item.name}</div>
                    {item.description && <div style={{ fontSize: 12, color: '#6b7280', maxWidth: 380, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</div>}
                  </td>
                  <td style={{ fontSize: 13, color: '#6b7280' }}>{item.sku || '—'}</td>
                  <td style={{ fontSize: 13 }}>{item.unit || 'шт'}</td>
                  <td style={{ fontWeight: 700 }}>{Number(item.price).toLocaleString('ru-RU')} ₽</td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                      background: item.status === 'archived' ? '#f3f4f6' : '#dcfce7',
                      color: item.status === 'archived' ? '#6b7280' : '#16a34a',
                    }}>
                      {item.status === 'archived' ? 'Архив' : 'Активна'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="icon-btn" onClick={() => openEdit(item)} title="Редактировать"><Edit2 size={15} /></button>
                      {item.status !== 'archived' && (
                        <button className="icon-btn icon-btn--danger" onClick={() => handleArchive(item.id)} title="Архивировать"><Archive size={15} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box" style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>{modal === 'add' ? 'Новая позиция для продаж' : 'Редактирование позиции'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form className="modal-form" autoComplete="off" onSubmit={e => { e.preventDefault(); handleSave() }}>
              <div className="form-row">
                <label>Название *</label>
                <input className="field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoComplete="off" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12 }}>
                <div className="form-row">
                  <label>Артикул</label>
                  <input className="field" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} autoComplete="off" />
                </div>
                <div className="form-row">
                  <label>Ед. изм.</label>
                  <input className="field" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} autoComplete="off" />
                </div>
              </div>
              <div className="form-row">
                <label>Описание</label>
                <textarea className="field" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} autoComplete="off" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-row">
                  <label>Цена (₽)</label>
                  <input className="field" type="number" min="0" step="1" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} autoComplete="off" />
                </div>
                <div className="form-row">
                  <label>Статус</label>
                  <select className="field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} autoComplete="off">
                    <option value="active">Активна</option>
                    <option value="archived">Архив</option>
                  </select>
                </div>
              </div>

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
                          {customFields.map(field => (
                            <div key={field.id} style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '8px 12px', background: '#f9fafb', borderRadius: 8, fontSize: 13,
                            }}>
                              <span style={{ fontWeight: 600, flex: 1 }}>{field.name}</span>
                              <span style={{
                                fontSize: 11, padding: '2px 6px', borderRadius: 4,
                                background: '#e0e7ff', color: '#4338ca',
                              }}>
                                {FIELD_TYPES.find(t => t.value === field.field_type)?.label || field.field_type}
                              </span>
                              {field.is_required && (
                                <span style={{
                                  fontSize: 11, padding: '2px 6px', borderRadius: 4,
                                  background: '#fef3c7', color: '#92400e',
                                }}>обяз.</span>
                              )}
                              <button type="button" className="icon-btn" onClick={() => startEditField(field)} title="Редактировать">
                                <Edit2 size={13} />
                              </button>
                              <button type="button" className="icon-btn icon-btn--danger" onClick={() => handleDeleteField(field.id)} title="Удалить">
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
                <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Отмена</button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
                  {saving ? 'Сохранение...' : modal === 'add' ? 'Сохранить и настроить поля' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
