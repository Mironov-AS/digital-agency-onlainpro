import { useState, useEffect } from 'react'
import { Plus, Loader2, X, Check, DollarSign, Calendar } from 'lucide-react'
import { apiFetch } from '../../api.js'
import { INTERVAL_LABELS } from '../../constants/intervals.js'
import { generatePaymentDates } from '../../utils/date.js'

const PERIOD_LABELS = INTERVAL_LABELS

export default function ServiceFormModal({ catalogServices, service, onClose, onSave, loading, serverError }) {
  const isEdit = !!service
  const [form, setForm] = useState({
    service_id: service?.service_id || '',
    service_name: service?.service_name || '',
    price: service?.price || '',
    payment_interval: service?.payment_interval || 'monthly',
    service_end_date: service?.service_end_date?.slice(0, 10) || '',
    create_schedule: false,
    schedule_start: '',
    schedule_end: '',
  })
  const [costs, setCosts] = useState(service?.costs || [])
  const [costsExpanded, setCostsExpanded] = useState(false)
  const [costsError, setCostsError] = useState('')
  const [newCost, setNewCost] = useState({ cost_name: '', amount: '', period: 'monthly' })
  const [costsLoading, setCostsLoading] = useState(false)
  const [costTypeNames, setCostTypeNames] = useState([])

  useEffect(() => {
    apiFetch('/api/catalog/costs/types').then(types => setCostTypeNames(types.map(t => t.name))).catch(() => {})
  }, [])

  const showSchedule = !isEdit && form.payment_interval !== 'once'
  const scheduleDates = (showSchedule && form.create_schedule && form.schedule_start && form.schedule_end && form.price)
    ? generatePaymentDates(form.schedule_start, form.schedule_end, form.payment_interval)
    : []

  async function handleServiceSelect(serviceId) {
    const svc = catalogServices.find(s => s.id === serviceId)
    setForm(f => ({ ...f, service_id: serviceId, service_name: svc ? svc.title : serviceId }))
    if (serviceId && !isEdit) {
      setCostsLoading(true)
      setCostsError('')
      setCostsExpanded(true)
      try {
        const catalogCosts = await apiFetch(`/api/catalog/costs/services/${serviceId}`)
        setCosts(catalogCosts.map(c => ({ ...c, _draft: true })))
      } catch (e) {
        setCostsError('Не удалось загрузить затраты из каталога')
      } finally {
        setCostsLoading(false)
      }
    } else if (!serviceId) {
      setCosts([])
      setCostsError('')
    }
  }

  function handleIntervalChange(val) {
    setForm(f => ({ ...f, payment_interval: val, create_schedule: val === 'once' ? false : f.create_schedule }))
  }

  function removeCost(idx) { setCosts(c => c.filter((_, i) => i !== idx)) }
  function updateCost(idx, field, val) { setCosts(c => c.map((x, i) => i === idx ? { ...x, [field]: val } : x)) }
  function addNewCost() {
    if (!newCost.cost_name.trim() || newCost.amount === '') return
    setCosts(c => [...c, { ...newCost, amount: parseFloat(newCost.amount), _draft: true }])
    setNewCost({ cost_name: '', amount: '', period: 'monthly' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, service_end_date: form.service_end_date || null, costs })
  }

  const totalMonthlyCost = costs.reduce((s, c) => {
    const a = parseFloat(c.amount) || 0
    if (c.period === 'monthly') return s + a
    if (c.period === 'quarterly') return s + a / 3
    if (c.period === 'yearly') return s + a / 12
    return s + a / 12
  }, 0)

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <h2>{isEdit ? 'Редактировать услугу' : 'Новая услуга'}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form" autoComplete="off">
          <div className="form-row">
            <label>Услуга из каталога</label>
            <select className="field" value={form.service_id} onChange={e => handleServiceSelect(e.target.value)} autoComplete="off">
              <option value="">— Выберите услугу —</option>
              {catalogServices.map(s => (
                <option key={s.id} value={s.id}>{s.title} — {s.price_label}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Название (если своё)</label>
            <input className="field" type="text" value={form.service_name} onChange={e => setForm(f => ({ ...f, service_name: e.target.value }))} placeholder="Своё название услуги" autoComplete="off" />
          </div>
          <div className="form-row">
            <label>Стоимость продажи (₽) *</label>
            <input className="field" type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="50000" required autoComplete="off" />
          </div>
          <div className="form-row-2">
            <div className="form-row">
              <label>Период оплаты</label>
              <select className="field" value={form.payment_interval} onChange={e => handleIntervalChange(e.target.value)} autoComplete="off">
                <option value="monthly">Ежемесячно</option>
                <option value="quarterly">Ежеквартально</option>
                <option value="yearly">Ежегодно</option>
                <option value="once">Разово</option>
              </select>
            </div>
            <div className="form-row">
              <label>Дата окончания</label>
              <input className="field" type="date" value={form.service_end_date} onChange={e => setForm(f => ({ ...f, service_end_date: e.target.value }))} autoComplete="off" />
            </div>
          </div>

          <div className="costs-block">
            <button type="button" className="costs-block-toggle" onClick={() => setCostsExpanded(e => !e)}>
              <DollarSign size={14} />
              <span>Затраты по услуге {costs.length > 0 && `(${costs.length})`}</span>
              {costsLoading && <Loader2 size={12} className="spin" />}
              <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 12 }}>{costsExpanded ? '▲' : '▼'}</span>
            </button>
            {costsExpanded && (
              <div className="costs-block-body">
                {costsError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0 8px', color: '#dc2626', fontSize: 13 }}>
                    <span>{costsError}</span>
                    <button type="button" style={{ fontSize: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      onClick={() => handleServiceSelect(form.service_id)}>Повторить</button>
                  </div>
                )}
                {!costsError && costs.length === 0 && <p style={{ color: '#9ca3af', fontSize: 13, margin: '0 0 8px' }}>Затрат нет — можно добавить вручную</p>}
                {costs.map((c, i) => (
                  <div key={i} className="cost-edit-row">
                    <select className="field cost-edit-name"
                      value={costTypeNames.includes(c.cost_name) ? c.cost_name : (c.cost_name ? '__custom__' : '')}
                      onChange={e => updateCost(i, 'cost_name', e.target.value === '__custom__' ? '' : e.target.value)} autoComplete="off">
                      <option value="">— Выберите —</option>
                      {costTypeNames.map(n => <option key={n} value={n}>{n}</option>)}
                      {c.cost_name && !costTypeNames.includes(c.cost_name) && <option value="__custom__">{c.cost_name}</option>}
                      <option value="__custom__">Своё…</option>
                    </select>
                    <input type="number" min="0" className="field cost-edit-amount" value={c.amount}
                      onChange={e => updateCost(i, 'amount', e.target.value)} placeholder="0" autoComplete="off" />
                    <select className="field cost-edit-period" value={c.period}
                      onChange={e => updateCost(i, 'period', e.target.value)} autoComplete="off">
                      {Object.entries(PERIOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <button type="button" className="icon-btn icon-btn--danger" onClick={() => removeCost(i)}><X size={13} /></button>
                  </div>
                ))}
                <div className="cost-edit-row cost-new-row">
                  <select className="field cost-edit-name"
                    value={costTypeNames.includes(newCost.cost_name) ? newCost.cost_name : (newCost.cost_name ? '__custom__' : '')}
                    onChange={e => setNewCost(n => ({ ...n, cost_name: e.target.value === '__custom__' ? '' : e.target.value }))} autoComplete="off">
                    <option value="">+ Добавить</option>
                    {costTypeNames.map(n => <option key={n} value={n}>{n}</option>)}
                    <option value="__custom__">Своё…</option>
                  </select>
                  <input type="number" min="0" className="field cost-edit-amount" value={newCost.amount}
                    onChange={e => setNewCost(n => ({ ...n, amount: e.target.value }))} placeholder="0 ₽" autoComplete="off" />
                  <select className="field cost-edit-period" value={newCost.period}
                    onChange={e => setNewCost(n => ({ ...n, period: e.target.value }))} autoComplete="off">
                    {Object.entries(PERIOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <button type="button" className="icon-btn" onClick={addNewCost}
                    disabled={!newCost.cost_name.trim() || newCost.amount === ''}
                    style={{ color: '#10b981' }}><Plus size={13} /></button>
                </div>
                {costs.length > 0 && (
                  <div className="cost-total-row" style={{ marginTop: 6 }}>
                    <span>Итого затрат/мес:</span>
                    <strong style={{ color: '#dc2626' }}>{Math.round(totalMonthlyCost).toLocaleString('ru-RU')} ₽</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {showSchedule && (
            <div className="schedule-section">
              <label className="schedule-toggle">
                <input type="checkbox" checked={form.create_schedule}
                  onChange={e => setForm(f => ({ ...f, create_schedule: e.target.checked, schedule_start: '', schedule_end: '' }))} />
                <Calendar size={14} />
                <span>Создать график платежей</span>
              </label>
              {form.create_schedule && (
                <>
                  <div className="form-row-2" style={{ marginTop: 12 }}>
                    <div className="form-row">
                      <label>Начальная дата *</label>
                      <input className="field" type="date" value={form.schedule_start}
                        onChange={e => setForm(f => ({ ...f, schedule_start: e.target.value }))} required autoComplete="off" />
                    </div>
                    <div className="form-row">
                      <label>Дата окончания *</label>
                      <input className="field" type="date" value={form.schedule_end}
                        onChange={e => setForm(f => ({ ...f, schedule_end: e.target.value }))} required autoComplete="off" />
                    </div>
                  </div>
                  {scheduleDates.length > 0 && (
                    <div className="schedule-preview">
                      <Calendar size={13} />
                      Будет создано <strong>{scheduleDates.length}</strong> платежей
                      по <strong>{parseFloat(form.price || 0).toLocaleString('ru-RU')} ₽</strong>
                      {' '}({INTERVAL_LABELS[form.payment_interval]})
                    </div>
                  )}
                  {form.schedule_start && form.schedule_end && form.schedule_end <= form.schedule_start && (
                    <div className="form-error">Дата окончания должна быть позже начальной</div>
                  )}
                </>
              )}
            </div>
          )}

          {serverError && <div className="form-error">{serverError}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn-save" disabled={loading || !form.price || (form.create_schedule && (!form.schedule_start || !form.schedule_end || form.schedule_end <= form.schedule_start))}>
              {loading ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
              {isEdit ? 'Сохранить' : (form.create_schedule && scheduleDates.length > 0 ? `Добавить + ${scheduleDates.length} платежей` : 'Добавить')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
