import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2, X, Check, Eye, EyeOff, DollarSign } from 'lucide-react'
import { apiFetch } from '../../api.js'
import { API_SVC, API_COSTS, PRICE_TYPES, PERIOD_LABELS, ConfirmDelete } from './shared.jsx'

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
      <select className="field" style={style} value={selectVal} onChange={handleSelect} autoComplete="off">
        <option value="">— Выберите вид —</option>
        {costTypes.map(ct => <option key={ct.id} value={ct.name}>{ct.name}</option>)}
        <option value="__custom__">Своё название…</option>
      </select>
      {(selectVal === '__custom__' || isCustom) && (
        <input className="field" style={style} value={value}
          onChange={e => onChange(e.target.value)} placeholder="Своё название затраты" autoFocus autoComplete="off" />
      )}
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
        <form onSubmit={handleSubmit} className="modal-form" autoComplete="off">
          <div className="form-row"><label>Название *</label>
            <input className="field" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Landing Page" autoComplete="off" />
          </div>
          <div className="form-row"><label>Описание</label>
            <textarea className="field" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Краткое описание услуги" autoComplete="off" />
          </div>
          <div className="form-row-2">
            <div className="form-row"><label>Цена (число)</label>
              <input className="field" type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="35000" autoComplete="off" />
            </div>
            <div className="form-row"><label>Тип цены</label>
              <select className="field" value={form.price_type} onChange={e => set('price_type', e.target.value)} autoComplete="off">
                {PRICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row"><label>Подпись цены (на лендинге)</label>
            <input className="field" value={form.price_label} onChange={e => set('price_label', e.target.value)} placeholder="от 35 000 ₽" autoComplete="off" />
          </div>
          <div className="form-row-2">
            <div className="form-row"><label>Вид услуги</label>
              <select className="field" value={form.category} onChange={e => set('category', e.target.value)} autoComplete="off">
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-row"><label>Порядок сортировки</label>
              <input className="field" type="number" min="0" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} autoComplete="off" />
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
                              value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} autoComplete="off" />
                          </td>
                          <td>
                            <select className="field" style={{ padding: '5px 8px', fontSize: 13 }}
                              value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} autoComplete="off">
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
                        placeholder="500" autoComplete="off" />
                    </div>
                    <div className="form-row" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 11 }}>Период</label>
                      <select className="field" style={{ padding: '7px 10px', fontSize: 13 }}
                        value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} autoComplete="off">
                        {Object.entries(PERIOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row" style={{ marginBottom: 0, marginTop: 8 }}>
                    <label style={{ fontSize: 11 }}>Примечание</label>
                    <input className="field" style={{ padding: '7px 10px', fontSize: 13 }}
                      value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                      placeholder="Необязательно" autoComplete="off" />
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

export default function ServicesSection({ categories, isAdmin }) {
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
