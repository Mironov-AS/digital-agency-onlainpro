import { apiFetch } from "../api.js"
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ArrowLeft, Loader2, X, Check, Eye, EyeOff, Tag, DollarSign, ChevronDown, ChevronUp } from 'lucide-react'

const API_SVC = '/api/catalog/services'
const API_CAT = '/api/catalog/categories'
const API_COSTS = '/api/catalog/costs'

const PRICE_TYPES = [
  { value: 'from',   label: 'от N ₽' },
  { value: 'fixed',  label: 'Фиксировано' },
  { value: 'hourly', label: 'За час' },
]

const PERIOD_LABELS = {
  monthly: 'Ежемесячно',
  quarterly: 'Ежеквартально',
  yearly: 'Ежегодно',
  once: 'Разово',
}

const PRESET_COLORS = [
  '#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444',
  '#ec4899','#06b6d4','#84cc16','#f97316','#6366f1',
]

function ColorPicker({ value, onChange }) {
  return (
    <div className="color-picker">
      {PRESET_COLORS.map(c => (
        <button key={c} type="button"
          className={`color-swatch ${value === c ? 'color-swatch--active' : ''}`}
          style={{ background: c }} onClick={() => onChange(c)} />
      ))}
      <input type="color" className="color-custom" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

function ConfirmDelete({ name, extra, onConfirm, onClose }) {
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

function ServiceModal({ initial, categories, onSave, onClose }) {
  const defaultCat = categories[0]?.value || ''
  const [form, setForm] = useState(initial || {
    title: '', description: '', price: '', price_type: 'from',
    price_label: '', category: defaultCat, is_active: true, sort_order: 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  function set(f, v) { setForm(p => ({ ...p, [f]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Название обязательно'); return }
    setSaving(true); setError('')
    try {
      const body = { ...form, price: form.price === '' ? null : Number(form.price), sort_order: Number(form.sort_order) || 0, is_active: form.is_active ? 1 : 0 }
      if (initial?.id) await apiFetch(`${API_SVC}/${initial.id}`, { method: 'PUT', body: JSON.stringify(body) })
      else await apiFetch(API_SVC, { method: 'POST', body: JSON.stringify(body) })
      onSave()
    } catch (err) { setError(err.error || 'Ошибка сохранения') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>{initial?.id ? 'Редактировать услугу' : 'Новая услуга'}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row"><label>Название *</label>
            <input className="field" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Landing Page" />
          </div>
          <div className="form-row"><label>Описание</label>
            <textarea className="field" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Краткое описание услуги" />
          </div>
          <div className="form-row-2">
            <div className="form-row"><label>Цена (число)</label>
              <input className="field" type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="35000" />
            </div>
            <div className="form-row"><label>Тип цены</label>
              <select className="field" value={form.price_type} onChange={e => set('price_type', e.target.value)}>
                {PRICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row"><label>Подпись цены (на лендинге)</label>
            <input className="field" value={form.price_label} onChange={e => set('price_label', e.target.value)} placeholder="от 35 000 ₽" />
          </div>
          <div className="form-row-2">
            <div className="form-row"><label>Вид услуги</label>
              <select className="field" value={form.category} onChange={e => set('category', e.target.value)}>
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-row"><label>Порядок сортировки</label>
              <input className="field" type="number" min="0" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} />
            </div>
          </div>
          <div className="form-check">
            <input type="checkbox" id="is_active" checked={!!form.is_active} onChange={e => set('is_active', e.target.checked)} />
            <label htmlFor="is_active">Отображать на лендинге</label>
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

// ── Модалка затрат по конкретной услуге каталога ─────────────────────────────

// Выбор вида затраты: select из справочника + опция «Своё»
function CostNameField({ value, onChange, costTypes, style = {} }) {
  const knownNames = costTypes.map(ct => ct.name)
  const isCustom = value !== '' && !knownNames.includes(value)
  const selectVal = isCustom ? '__custom__' : (value || '')

  function handleSelect(e) {
    const v = e.target.value
    if (v === '__custom__') onChange('')
    else onChange(v)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <select className="field" style={style} value={selectVal} onChange={handleSelect}>
        <option value="">— Выберите вид —</option>
        {costTypes.map(ct => <option key={ct.id} value={ct.name}>{ct.name}</option>)}
        <option value="__custom__">✏️ Своё название…</option>
      </select>
      {(selectVal === '__custom__' || isCustom) && (
        <input className="field" style={style} value={value}
          onChange={e => onChange(e.target.value)} placeholder="Своё название затраты" autoFocus />
      )}
    </div>
  )
}

function ServiceCostsModal({ service, costTypes, onClose }) {
  const [costs, setCosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ cost_name: '', amount: '', period: 'monthly', note: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  async function load() {
    setLoading(true)
    try { setCosts(await apiFetch(`${API_COSTS}/services/${service.id}`)) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [service.id])

  function startAdd() {
    setEditId(null)
    setForm({ cost_name: '', amount: '', period: 'monthly', note: '' })
    setAdding(true)
  }
  function startEdit(c) {
    setAdding(false)
    setEditId(c.id)
    setForm({ cost_name: c.cost_name, amount: c.amount, period: c.period, note: c.note || '' })
  }
  function cancel() { setAdding(false); setEditId(null) }

  async function handleSave() {
    if (!form.cost_name.trim() || form.amount === '') return
    setSaving(true)
    try {
      const body = JSON.stringify({ ...form, amount: parseFloat(form.amount) })
      if (editId) {
        await apiFetch(`${API_COSTS}/services/${service.id}/${editId}`, { method: 'PUT', body })
      } else {
        await apiFetch(`${API_COSTS}/services/${service.id}`, { method: 'POST', body })
      }
      cancel(); load()
    } finally { setSaving(false) }
  }

  async function handleDelete(c) {
    await apiFetch(`${API_COSTS}/services/${service.id}/${c.id}`, { method: 'DELETE' })
    setDeleting(null); load()
  }

  const totalMonthly = costs.reduce((sum, c) => {
    if (c.period === 'monthly') return sum + c.amount
    if (c.period === 'quarterly') return sum + c.amount / 3
    if (c.period === 'yearly') return sum + c.amount / 12
    return sum + c.amount / 12
  }, 0)

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 620 }}>
        <div className="modal-header">
          <div>
            <h2>Затраты по услуге</h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>{service.title}</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ padding: '0 24px 20px' }}>
          {loading ? <div style={{ textAlign: 'center', padding: 32 }}><Loader2 size={22} className="spin" /></div> : (
            <>
              {costs.length === 0 && !adding && (
                <div className="dash-empty">Затраты по услуге не заданы</div>
              )}
              {costs.length > 0 && (
                <table className="data-table" style={{ marginBottom: 12 }}>
                  <thead><tr>
                    <th>Наименование</th>
                    <th style={{ width: 120 }}>Сумма</th>
                    <th style={{ width: 130 }}>Период</th>
                    <th style={{ width: 80 }}>Действия</th>
                  </tr></thead>
                  <tbody>
                    {costs.map(c => (
                      editId === c.id ? (
                        <tr key={c.id} className="svc-row">
                          <td>
                            <CostNameField value={form.cost_name}
                              onChange={v => setForm(f => ({ ...f, cost_name: v }))}
                              costTypes={costTypes} style={{ padding: '5px 8px', fontSize: 13 }} />
                          </td>
                          <td>
                            <input type="number" min="0" className="field" style={{ padding: '5px 8px', fontSize: 13 }}
                              value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                          </td>
                          <td>
                            <select className="field" style={{ padding: '5px 8px', fontSize: 13 }}
                              value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}>
                              {Object.entries(PERIOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                          </td>
                          <td>
                            <button className="icon-btn" onClick={handleSave} disabled={saving} title="Сохранить">
                              {saving ? <Loader2 size={13} className="spin" /> : <Check size={13} />}
                            </button>
                            <button className="icon-btn" onClick={cancel} title="Отмена"><X size={13} /></button>
                          </td>
                        </tr>
                      ) : (
                        <tr key={c.id} className="svc-row">
                          <td style={{ fontWeight: 600 }}>{c.cost_name}</td>
                          <td style={{ fontWeight: 700 }}>{c.amount?.toLocaleString('ru-RU')} ₽</td>
                          <td style={{ color: '#6b7280', fontSize: 13 }}>{PERIOD_LABELS[c.period] || c.period}</td>
                          <td>
                            <button className="icon-btn" onClick={() => startEdit(c)}><Pencil size={13} /></button>
                            <button className="icon-btn icon-btn--danger" onClick={() => setDeleting(c)}><Trash2 size={13} /></button>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              )}

              {adding && (
                <div className="cost-add-row">
                  <div className="form-row" style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 11 }}>Вид затраты *</label>
                    <CostNameField value={form.cost_name}
                      onChange={v => setForm(f => ({ ...f, cost_name: v }))}
                      costTypes={costTypes} style={{ padding: '7px 10px', fontSize: 13 }} />
                  </div>
                  <div className="form-row-2">
                    <div className="form-row" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 11 }}>Сумма (₽) *</label>
                      <input type="number" min="0" className="field" style={{ padding: '7px 10px', fontSize: 13 }}
                        value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                        placeholder="500" />
                    </div>
                    <div className="form-row" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 11 }}>Период</label>
                      <select className="field" style={{ padding: '7px 10px', fontSize: 13 }}
                        value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}>
                        {Object.entries(PERIOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row" style={{ marginBottom: 0, marginTop: 8 }}>
                    <label style={{ fontSize: 11 }}>Примечание</label>
                    <input className="field" style={{ padding: '7px 10px', fontSize: 13 }}
                      value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                      placeholder="Необязательно" />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                    <button className="btn-cancel" onClick={cancel}>Отмена</button>
                    <button className="btn-save" onClick={handleSave} disabled={saving || !form.cost_name.trim() || form.amount === ''}>
                      {saving ? <Loader2 size={13} className="spin" /> : <Check size={13} />} Добавить
                    </button>
                  </div>
                </div>
              )}

              {!adding && !editId && (
                <button className="btn-primary-sm" onClick={startAdd} style={{ marginTop: 8 }}>
                  <Plus size={14} /> Добавить затрату
                </button>
              )}

              {costs.length > 0 && (
                <div className="cost-total-row">
                  <span>Итого в месяц (план):</span>
                  <strong style={{ color: '#dc2626' }}>{Math.round(totalMonthly).toLocaleString('ru-RU')} ₽</strong>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {deleting && <ConfirmDelete name={deleting.cost_name} onConfirm={() => handleDelete(deleting)} onClose={() => setDeleting(null)} />}
    </div>
  )
}

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
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row"><label>Название *</label>
            <input className="field" value={form.label} onChange={e => set('label', e.target.value)} placeholder="Веб-приложения" />
          </div>
          {!initial?.id && (
            <div className="form-row"><label>Код (slug) *</label>
              <input className="field" value={form.value}
                onChange={e => set('value', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, ''))}
                placeholder="webapps" />
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
            <input className="field" type="number" min="0" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} />
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

// ── Раздел: справочник видов затрат ──────────────────────────────────────────
function CostTypesSection({ isAdmin }) {
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', sort_order: 0 })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  async function load() {
    setLoading(true)
    try { setTypes(await apiFetch(`${API_COSTS}/types`)) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function startAdd() { setEditId(null); setForm({ name: '', description: '', sort_order: types.length }); setAdding(true) }
  function startEdit(t) { setAdding(false); setEditId(t.id); setForm({ name: t.name, description: t.description, sort_order: t.sort_order }) }
  function cancel() { setAdding(false); setEditId(null) }

  async function save(id) {
    setSaving(true)
    try {
      const body = JSON.stringify({ ...form, sort_order: Number(form.sort_order) })
      if (id) await apiFetch(`${API_COSTS}/types/${id}`, { method: 'PUT', body })
      else await apiFetch(`${API_COSTS}/types`, { method: 'POST', body })
      cancel(); load()
    } finally { setSaving(false) }
  }

  async function del(t) {
    await apiFetch(`${API_COSTS}/types/${t.id}`, { method: 'DELETE' })
    setDeleting(null); load()
  }

  if (loading) return <div className="loading-center"><Loader2 size={22} className="spin" /></div>

  return (
    <>
      {isAdmin && (
        <div className="section-toolbar">
          <button className="btn-primary-sm" onClick={startAdd}><Plus size={16} /> Добавить вид затраты</button>
        </div>
      )}

      {types.length === 0 && !adding && <div className="empty-state">Справочник затрат пуст</div>}

      {(types.length > 0 || adding) && (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr>
              <th>Наименование</th><th>Описание</th><th style={{ width: 90 }}>Порядок</th>
              {isAdmin && <th style={{ width: 100 }}>Действия</th>}
            </tr></thead>
            <tbody>
              {types.map(t => (
                editId === t.id ? (
                  <tr key={t.id} className="svc-row">
                    <td><input className="field" style={{ padding: '5px 8px' }} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></td>
                    <td><input className="field" style={{ padding: '5px 8px' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></td>
                    <td><input type="number" className="field" style={{ padding: '5px 8px', width: 60 }} value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} /></td>
                    <td>
                      <button className="icon-btn" onClick={() => save(t.id)} disabled={saving}>{saving ? <Loader2 size={13} className="spin" /> : <Check size={13} />}</button>
                      <button className="icon-btn" onClick={cancel}><X size={13} /></button>
                    </td>
                  </tr>
                ) : (
                  <tr key={t.id} className="svc-row">
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td style={{ color: '#6b7280', fontSize: 13 }}>{t.description || '—'}</td>
                    <td className="td-order">{t.sort_order}</td>
                    {isAdmin && (
                      <td className="td-actions">
                        <button className="icon-btn" onClick={() => startEdit(t)}><Pencil size={14} /></button>
                        <button className="icon-btn icon-btn--danger" onClick={() => setDeleting(t)}><Trash2 size={14} /></button>
                      </td>
                    )}
                  </tr>
                )
              ))}

              {adding && (
                <tr className="svc-row">
                  <td><input className="field" style={{ padding: '5px 8px' }} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Хостинг" autoFocus /></td>
                  <td><input className="field" style={{ padding: '5px 8px' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Оплата хостинга" /></td>
                  <td><input type="number" className="field" style={{ padding: '5px 8px', width: 60 }} value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} /></td>
                  <td>
                    <button className="icon-btn" onClick={() => save(null)} disabled={saving || !form.name.trim()}>{saving ? <Loader2 size={13} className="spin" /> : <Check size={13} />}</button>
                    <button className="icon-btn" onClick={cancel}><X size={13} /></button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {deleting && <ConfirmDelete name={deleting.name} onConfirm={() => del(deleting)} onClose={() => setDeleting(null)} />}
    </>
  )
}

// ── Раздел: услуги ────────────────────────────────────────────────────────────
function ServicesSection({ categories, isAdmin }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [costsFor, setCostsFor] = useState(null)
  const [costTypes, setCostTypes] = useState([])
  const [deleting, setDeleting] = useState(null)
  const [filterCat, setFilterCat] = useState('all')
  const catMap = Object.fromEntries(categories.map(c => [c.value, c]))

  async function load() {
    setLoading(true)
    try {
      const [svcs, types] = await Promise.all([
        apiFetch(`${API_SVC}?active_only=0`),
        apiFetch(`${API_COSTS}/types`),
      ])
      setServices(svcs); setCostTypes(types)
    }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function handleDelete(svc) {
    await apiFetch(`${API_SVC}/${svc.id}`, { method: 'DELETE' })
    setDeleting(null); load()
  }
  async function handleToggle(svc) {
    await apiFetch(`${API_SVC}/${svc.id}`, { method: 'PUT', body: JSON.stringify({ is_active: svc.is_active ? 0 : 1 }) })
    load()
  }

  const filtered = filterCat === 'all' ? services : services.filter(s => s.category === filterCat)

  return (
    <>
      <div className="filter-bar">
        <button className={`filter-btn ${filterCat === 'all' ? 'active' : ''}`} onClick={() => setFilterCat('all')}>Все ({services.length})</button>
        {categories.map(c => (
          <button key={c.value} className={`filter-btn ${filterCat === c.value ? 'active' : ''}`}
            onClick={() => setFilterCat(c.value)}>
            <span className="cat-dot" style={{ background: c.color }} />
            {c.label} ({services.filter(s => s.category === c.value).length})
          </button>
        ))}
      </div>

      {isAdmin && (
        <div className="section-toolbar">
          <button className="btn-primary-sm" onClick={() => setModal('create')}><Plus size={16} /> Добавить услугу</button>
        </div>
      )}

      {loading ? <div className="loading-center"><Loader2 size={24} className="spin" /></div>
        : filtered.length === 0 ? <div className="empty-state">Услуги не найдены</div>
        : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr>
                <th>Вид услуги</th><th>Название / Описание</th>
                <th>Цена</th><th>Порядок</th><th>Статус</th>
                {isAdmin && <th>Действия</th>}
              </tr></thead>
              <tbody>
                {filtered.map(svc => {
                  const cat = catMap[svc.category]
                  return (
                    <tr key={svc.id} className={`svc-row ${!svc.is_active ? 'svc-row--inactive' : ''}`}>
                      <td className="td-icon">
                        <span className="cat-badge" style={{ background: (cat?.color || '#9ca3af') + '1a', color: cat?.color || '#9ca3af' }}>
                          <span className="cat-dot" style={{ background: cat?.color || '#9ca3af' }} />
                          {cat?.label || svc.category}
                        </span>
                      </td>
                      <td className="td-name">
                        <div className="svc-name">{svc.title}</div>
                        {svc.description && <div className="svc-desc-sm">{svc.description}</div>}
                      </td>
                      <td className="td-price">{svc.price_label || '—'}</td>
                      <td className="td-order">{svc.sort_order}</td>
                      <td className="td-status">
                        <button className={`status-toggle ${svc.is_active ? 'status-toggle--on' : 'status-toggle--off'}`}
                          onClick={() => isAdmin && handleToggle(svc)}>
                          {svc.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                          {svc.is_active ? 'Активна' : 'Скрыта'}
                        </button>
                      </td>
                      {isAdmin && (
                        <td className="td-actions">
                          <button className="icon-btn" onClick={() => setCostsFor(svc)} title="Затраты" style={{ color: '#f59e0b' }}>
                            <DollarSign size={15} />
                          </button>
                          <button className="icon-btn" onClick={() => setModal(svc)}><Pencil size={15} /></button>
                          <button className="icon-btn icon-btn--danger" onClick={() => setDeleting(svc)}><Trash2 size={15} /></button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

      {modal && <ServiceModal initial={modal === 'create' ? null : modal} categories={categories} onSave={() => { setModal(null); load() }} onClose={() => setModal(null)} />}
      {deleting && <ConfirmDelete name={deleting.title} onConfirm={() => handleDelete(deleting)} onClose={() => setDeleting(null)} />}
      {costsFor && <ServiceCostsModal service={costsFor} costTypes={costTypes} onClose={() => { setCostsFor(null); load() }} />}
    </>
  )
}

function CategoriesSection({ categories, onReload, isAdmin }) {
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

export default function CatalogPage({ onBack, user }) {
  const [categories, setCategories] = useState([])
  const [catsLoading, setCatsLoading] = useState(true)
  const [section, setSection] = useState('services')
  const isAdmin = user?.role === 'admin'

  async function loadCategories() {
    setCatsLoading(true)
    try { setCategories(await apiFetch(API_CAT)) }
    finally { setCatsLoading(false) }
  }
  useEffect(() => { loadCategories() }, [])

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-back" onClick={onBack}><ArrowLeft size={16} /> Назад</button>
        <div>
          <h1 className="page-title">Услуги</h1>
          <p className="page-sub">Справочник услуг агентства · Данные подтягиваются на лендинг автоматически</p>
        </div>
        <div className="section-tabs">
          <button className={`section-tab ${section === 'services' ? 'active' : ''}`} onClick={() => setSection('services')}>
            Услуги
          </button>
          <button className={`section-tab ${section === 'categories' ? 'active' : ''}`} onClick={() => setSection('categories')}>
            <Tag size={14} /> Виды услуг
          </button>
          <button className={`section-tab ${section === 'costs' ? 'active' : ''}`} onClick={() => setSection('costs')}>
            <DollarSign size={14} /> Виды затрат
          </button>
        </div>
      </div>

      {catsLoading
        ? <div className="loading-center"><Loader2 size={24} className="spin" /></div>
        : section === 'services'
          ? <ServicesSection categories={categories} isAdmin={isAdmin} />
          : section === 'categories'
            ? <CategoriesSection categories={categories} onReload={loadCategories} isAdmin={isAdmin} />
            : <CostTypesSection isAdmin={isAdmin} />
      }
    </div>
  )
}
