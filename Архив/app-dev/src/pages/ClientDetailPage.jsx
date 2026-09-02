import { apiFetch } from '../api.js'
import { useState, useEffect } from 'react'
import {
  ArrowLeft, Plus, Pencil, Trash2, X, Check, Loader2,
  Phone, Mail, MapPin, DollarSign, Calendar, AlertTriangle,
  Pause, Play, Clock, CreditCard, Package, Eye, EyeOff, User,
  RefreshCw, ExternalLink, Users,
} from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { INTERVAL_LABELS } from '../constants/intervals.js'
import { daysUntil, generatePaymentDates } from '../utils/date.js'

const API_BASE = '/api/clients'
const API_CATALOG = '/api/catalog/services'
const API_CATALOG_COSTS = '/api/catalog/costs'

const PERIOD_LABELS = INTERVAL_LABELS

function ServiceStatusBadge({ service, payments }) {
  if (!service.is_active) {
    return <span className="status-badge status-badge--stopped"><Pause size={11} /> Остановлена</span>
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const hasOverdue = (payments || []).some(
    p => p.client_service_id === service.id && p.status === 'pending' && new Date(p.planned_date) < today
  )
  if (hasOverdue) {
    return <span className="status-badge status-badge--overdue"><AlertTriangle size={11} /> Просрочка</span>
  }
  if (service.service_end_date) {
    const days = daysUntil(service.service_end_date)
    if (days < 0) return <span className="status-badge status-badge--expired"><AlertTriangle size={11} /> Истекла {Math.abs(days)} дн.</span>
    if (days <= 7) return <span className="status-badge status-badge--warning"><Clock size={11} /> {days} дн. осталось</span>
    return <span className="status-badge status-badge--active"><Play size={11} /> {days} дн.</span>
  }
  return <span className="status-badge status-badge--active"><Play size={11} /> Активна</span>
}

function ServiceFormModal({ catalogServices, service, onClose, onSave, loading, serverError }) {
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
        const catalogCosts = await apiFetch(`${API_CATALOG_COSTS}/services/${serviceId}`)
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
            <select className="field" value={form.service_id} onChange={e => handleServiceSelect(e.target.value)}>
              <option value="">— Выберите услугу —</option>
              {catalogServices.map(s => (
                <option key={s.id} value={s.id}>{s.title} — {s.price_label}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Название (если своё)</label>
            <input className="field" type="text" value={form.service_name} onChange={e => setForm(f => ({ ...f, service_name: e.target.value }))} placeholder="Своё название услуги" />
          </div>
          <div className="form-row">
            <label>Стоимость продажи (₽) *</label>
            <input className="field" type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="50000" required />
          </div>
          <div className="form-row-2">
            <div className="form-row">
              <label>Период оплаты</label>
              <select className="field" value={form.payment_interval} onChange={e => handleIntervalChange(e.target.value)}>
                <option value="monthly">Ежемесячно</option>
                <option value="quarterly">Ежеквартально</option>
                <option value="yearly">Ежегодно</option>
                <option value="once">Разово</option>
              </select>
            </div>
            <div className="form-row">
              <label>Дата окончания</label>
              <input className="field" type="date" value={form.service_end_date} onChange={e => setForm(f => ({ ...f, service_end_date: e.target.value }))} />
            </div>
          </div>

          {/* Блок затрат */}
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
                      onChange={e => updateCost(i, 'cost_name', e.target.value === '__custom__' ? '' : e.target.value)}>
                      <option value="">— Выберите —</option>
                      {costTypeNames.map(n => <option key={n} value={n}>{n}</option>)}
                      {c.cost_name && !costTypeNames.includes(c.cost_name) && <option value="__custom__">{c.cost_name}</option>}
                      <option value="__custom__">✏️ Своё…</option>
                    </select>
                    <input type="number" min="0" className="field cost-edit-amount" value={c.amount}
                      onChange={e => updateCost(i, 'amount', e.target.value)} placeholder="0" />
                    <select className="field cost-edit-period" value={c.period}
                      onChange={e => updateCost(i, 'period', e.target.value)}>
                      {Object.entries(PERIOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <button type="button" className="icon-btn icon-btn--danger" onClick={() => removeCost(i)}><X size={13} /></button>
                  </div>
                ))}
                <div className="cost-edit-row cost-new-row">
                  <select className="field cost-edit-name"
                    value={costTypeNames.includes(newCost.cost_name) ? newCost.cost_name : (newCost.cost_name ? '__custom__' : '')}
                    onChange={e => setNewCost(n => ({ ...n, cost_name: e.target.value === '__custom__' ? '' : e.target.value }))}>
                    <option value="">+ Добавить</option>
                    {costTypeNames.map(n => <option key={n} value={n}>{n}</option>)}
                    <option value="__custom__">✏️ Своё…</option>
                  </select>
                  <input type="number" min="0" className="field cost-edit-amount" value={newCost.amount}
                    onChange={e => setNewCost(n => ({ ...n, amount: e.target.value }))} placeholder="0 ₽" />
                  <select className="field cost-edit-period" value={newCost.period}
                    onChange={e => setNewCost(n => ({ ...n, period: e.target.value }))}>
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
                        onChange={e => setForm(f => ({ ...f, schedule_start: e.target.value }))} required />
                    </div>
                    <div className="form-row">
                      <label>Дата окончания *</label>
                      <input className="field" type="date" value={form.schedule_end}
                        onChange={e => setForm(f => ({ ...f, schedule_end: e.target.value }))} required />
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

function PaymentFormModal({ services, subscriptions, payment, onClose, onSave, loading, serverError }) {
  const [form, setForm] = useState({
    amount: payment?.amount || '',
    planned_date: payment?.planned_date?.slice(0, 10) || '',
    client_service_id: payment?.client_service_id || '',
    client_product_subscription_id: payment?.client_product_subscription_id || '',
    note: payment?.note || '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, amount: parseFloat(form.amount), client_service_id: form.client_service_id || null, client_product_subscription_id: form.client_product_subscription_id || null })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>{payment ? 'Редактировать платёж' : 'Новый платёж'}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form" autoComplete="off">
          <div className="form-row-2">
            <div className="form-row">
              <label>Сумма *</label>
              <input className="field" type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" required />
            </div>
            <div className="form-row">
              <label>Дата *</label>
              <input className="field" type="date" value={form.planned_date} onChange={e => setForm(f => ({ ...f, planned_date: e.target.value }))} required />
            </div>
          </div>
          <div className="form-row">
            <label>Услуга</label>
            <select className="field" value={form.client_service_id} onChange={e => setForm(f => ({ ...f, client_service_id: e.target.value, client_product_subscription_id: '' }))}>
              <option value="">— Без привязки —</option>
              {(services || []).map(s => (
                <option key={s.id} value={s.id}>{s.service_name} ({INTERVAL_LABELS[s.payment_interval]})</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Продукт</label>
            <select className="field" value={form.client_product_subscription_id} onChange={e => setForm(f => ({ ...f, client_product_subscription_id: e.target.value, client_service_id: '' }))}>
              <option value="">— Без привязки —</option>
              {(subscriptions || []).map(sub => (
                <option key={sub.id} value={sub.id}>{sub.product_name || sub.product_code} ({INTERVAL_LABELS[sub.billing_period] || sub.billing_period})</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Примечание</label>
            <input className="field" type="text" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Оплата за..." />
          </div>
          {serverError && <div className="form-error">{serverError}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
              {payment ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ClientDetailPage({ clientId, onBack }) {
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [section, setSection] = useState('services')
  const [modal, setModal] = useState(null)
  const [catalogServices, setCatalogServices] = useState([])
  const [products, setProducts] = useState([])
  const [clientSubscriptions, setClientSubscriptions] = useState([])
  const [clientUsers, setClientUsers] = useState([])

  useEffect(() => {
    apiFetch(API_CATALOG).then(setCatalogServices).catch(() => {})
    apiFetch('/api/product-shelf/products').then(setProducts).catch(() => {})
    apiFetch('/api/product-shelf/subscriptions').then(subs => {
      setClientSubscriptions((subs || []).filter(s => s.client_id === clientId))
    }).catch(() => {})
  }, [clientId])

  async function loadClient() {
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch(`${API_BASE}/${clientId}`)
      setClient(data)
    } catch (err) {
      setError(err.error || 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadClient() }, [clientId])

  async function handleAddService(svcData) {
    const { create_schedule, schedule_start, schedule_end, costs = [], ...serviceData } = svcData
    setModal(m => ({ ...m, loading: true }))
    try {
      const created = await apiFetch(`${API_BASE}/${clientId}/services`, {
        method: 'POST',
        body: JSON.stringify(serviceData),
      })

      // Save costs for this client service
      for (const cost of costs) {
        try {
          await apiFetch(`${API_BASE}/${clientId}/services/${created.id}/costs`, {
            method: 'POST',
            body: JSON.stringify({
              cost_name: cost.cost_name,
              amount: parseFloat(cost.amount) || 0,
              period: cost.period || 'monthly',
              note: cost.note || '',
            }),
          })
        } catch {}
      }

      const newPayments = []
      if (create_schedule && schedule_start && schedule_end && serviceData.payment_interval !== 'once') {
        const dates = generatePaymentDates(schedule_start, schedule_end, serviceData.payment_interval)
        for (const date of dates) {
          try {
            const payment = await apiFetch(`${API_BASE}/${clientId}/payments`, {
              method: 'POST',
              body: JSON.stringify({
                amount: parseFloat(serviceData.price),
                planned_date: date,
                client_service_id: created.id,
                note: created.service_name,
              }),
            })
            newPayments.push(payment)
          } catch {}
        }
      }

      setClient(c => ({
        ...c,
        services: [...(c.services || []), { ...created, costs }],
        payments: [...(c.payments || []), ...newPayments],
      }))
      setModal(null)
      if (newPayments.length > 0) setSection('payments')
    } catch (err) {
      setModal(m => ({ ...m, loading: false, serverError: err.error || 'Ошибка' }))
    }
  }

  async function handleUpdateService(serviceId, updates) {
    setModal(m => ({ ...m, loading: true }))
    try {
      const updated = await apiFetch(`${API_BASE}/${clientId}/services/${serviceId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      setClient(c => ({ ...c, services: c.services.map(s => s.id === serviceId ? updated : s) }))
      setModal(null)
    } catch (err) {
      setModal(m => ({ ...m, loading: false, serverError: err.error || 'Ошибка' }))
    }
  }

  async function handleDeleteService(serviceId) {
    setModal(m => ({ ...m, loading: true }))
    try {
      await apiFetch(`${API_BASE}/${clientId}/services/${serviceId}`, { method: 'DELETE' })
      setClient(c => ({ ...c, services: c.services.filter(s => s.id !== serviceId) }))
      setModal(null)
    } catch (err) {
      setModal(m => ({ ...m, loading: false, serverError: err.error || 'Ошибка' }))
    }
  }

  async function handleToggleStop(service) {
    const fn = service.is_active
      ? apiFetch(`${API_BASE}/${clientId}/services/${service.id}/stop`, { method: 'PATCH' })
      : apiFetch(`${API_BASE}/${clientId}/services/${service.id}/resume`, { method: 'PATCH' })
    try {
      const updated = await fn
      setClient(c => ({ ...c, services: c.services.map(s => s.id === service.id ? updated : s) }))
    } catch {}
  }

  async function handleAddPayment(paymentData) {
    setModal(m => ({ ...m, loading: true }))
    try {
      const created = await apiFetch(`${API_BASE}/${clientId}/payments`, {
        method: 'POST',
        body: JSON.stringify(paymentData),
      })
      setClient(c => ({ ...c, payments: [...(c.payments || []), created] }))
      setModal(null)
    } catch (err) {
      setModal(m => ({ ...m, loading: false, serverError: err.error || 'Ошибка' }))
    }
  }

  async function handleUpdatePayment(paymentId, paymentData) {
    setModal(m => ({ ...m, loading: true }))
    try {
      const updated = await apiFetch(`${API_BASE}/${clientId}/payments/${paymentId}`, {
        method: 'PUT',
        body: JSON.stringify(paymentData),
      })
      setClient(c => ({ ...c, payments: c.payments.map(p => p.id === paymentId ? updated : p) }))
      setModal(null)
    } catch (err) {
      setModal(m => ({ ...m, loading: false, serverError: err.error || 'Ошибка' }))
    }
  }

  async function handleDeletePayment(paymentId) {
    setModal(m => ({ ...m, loading: true }))
    try {
      await apiFetch(`${API_BASE}/${clientId}/payments/${paymentId}`, { method: 'DELETE' })
      setClient(c => ({ ...c, payments: c.payments.filter(p => p.id !== paymentId) }))
      setModal(null)
    } catch (err) {
      setModal(m => ({ ...m, loading: false, serverError: err.error || 'Ошибка' }))
    }
  }

  async function handleMarkPaid(payment) {
    try {
      const updated = await apiFetch(`${API_BASE}/${clientId}/payments/${payment.id}/pay`, { method: 'PATCH' })
      setClient(c => ({ ...c, payments: c.payments.map(p => p.id === payment.id ? updated : p) }))
    } catch {}
  }

  async function handleAddProductSubscription(formData) {
    setModal(m => ({ ...m, loading: true }))
    try {
      const { create_schedule, schedule_start, schedule_end, ...subscriptionData } = formData
      const sub = await apiFetch('/api/product-shelf/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ ...subscriptionData, client_id: clientId }),
      })

      // Create payment schedule if requested
      const newPayments = []
      if (create_schedule && schedule_start && schedule_end && subscriptionData.billing_period !== 'once') {
        const dates = generatePaymentDates(schedule_start, schedule_end, subscriptionData.billing_period)
        for (const date of dates) {
          try {
            const payment = await apiFetch(`${API_BASE}/${clientId}/payments`, {
              method: 'POST',
              body: JSON.stringify({
                amount: parseFloat(subscriptionData.billing_amount),
                planned_date: date,
                client_product_subscription_id: sub.id,
                note: subscriptionData.product_code,
              }),
            })
            newPayments.push(payment)
          } catch {}
        }
      }

      const subs = await apiFetch('/api/product-shelf/subscriptions')
      setClientSubscriptions((subs || []).filter(s => s.client_id === clientId))
      if (newPayments.length > 0) {
        setClient(c => ({ ...c, payments: [...(c.payments || []), ...newPayments] }))
        setSection('payments')
      }
      setModal(null)
    } catch (err) {
      setModal(m => ({ ...m, loading: false, serverError: err.error || 'Ошибка' }))
    }
  }

  async function handleEditProductSubscription(id, formData) {
    setModal(m => ({ ...m, loading: true }))
    try {
      await apiFetch(`/api/product-shelf/subscriptions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
      })
      const subs = await apiFetch('/api/product-shelf/subscriptions')
      setClientSubscriptions((subs || []).filter(s => s.client_id === clientId))
      setModal(null)
    } catch (err) {
      setModal(m => ({ ...m, loading: false, serverError: err.error || 'Ошибка' }))
    }
  }

  async function handleDeleteProductSubscription(id) {
    setModal(m => ({ ...m, loading: true }))
    try {
      await apiFetch(`/api/product-shelf/subscriptions/${id}`, { method: 'DELETE' })
      setClientSubscriptions(subs => subs.filter(s => s.id !== id))
      setModal(null)
    } catch (err) {
      setModal(m => ({ ...m, loading: false, serverError: err.error || 'Ошибка' }))
    }
  }

  async function loadClientUsers() {
    try {
      const users = await apiFetch('/api/auth/users')
      setClientUsers((users || []).filter(u => u.client_id === clientId))
    } catch (e) {
      console.error('Failed to load client users:', e)
    }
  }

  useEffect(() => { loadClientUsers() }, [clientId])

  async function handleToggleSubscriptionStatus(sub) {
    try {
      const nextStatus = sub.status === 'active' ? 'inactive' : 'active'
      await apiFetch(`/api/product-shelf/subscriptions/${sub.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      })
      const subs = await apiFetch('/api/product-shelf/subscriptions')
      setClientSubscriptions((subs || []).filter(s => s.client_id === clientId))
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    }
  }

  if (loading) return <div className="loading-center"><Loader2 size={28} className="spin" /></div>
  if (error) return <div className="page-error">{error} <button onClick={loadClient}>Повторить</button></div>
  if (!client) return null

  const pending = (client.payments || []).filter(p => p.status === 'pending')

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-back" onClick={onBack}><ArrowLeft size={16} /> Назад</button>
        <div>
          <h1 className="page-title">{client.name}</h1>
          {client.email && <p className="page-sub">{client.email}</p>}
        </div>
        <div className="section-tabs">
          <button className={`section-tab ${section === 'services' ? 'active' : ''}`} onClick={() => setSection('services')}>
            <Package size={14} /> Услуги
          </button>
          <button className={`section-tab ${section === 'payments' ? 'active' : ''}`} onClick={() => setSection('payments')}>
            <CreditCard size={14} /> Платежи {pending.length > 0 && <span className="badge-count">{pending.length}</span>}
          </button>
          <button className={`section-tab ${section === 'products' ? 'active' : ''}`} onClick={() => setSection('products')}>
            <RefreshCw size={14} /> Продукты
          </button>
          <button className={`section-tab ${section === 'users' ? 'active' : ''}`} onClick={() => setSection('users')}>
            <Users size={14} /> Пользователи
          </button>
        </div>
      </div>

      {section === 'services' && <ServicesSection client={client} modal={modal} setModal={setModal} catalogServices={catalogServices}
        onAddService={handleAddService} onUpdateService={handleUpdateService} onDeleteService={handleDeleteService} onToggleStop={handleToggleStop} />}

      {section === 'payments' && <PaymentsSection client={client} modal={modal} setModal={setModal}
        onAddPayment={handleAddPayment} onUpdatePayment={handleUpdatePayment} onDeletePayment={handleDeletePayment} onMarkPaid={handleMarkPaid}
        subscriptions={clientSubscriptions} />}

      {section === 'products' && <ClientProductsSection
        subscriptions={clientSubscriptions}
        products={products}
        modal={modal}
        setModal={setModal}
        onAddSubscription={handleAddProductSubscription}
        onDeleteSubscription={handleDeleteProductSubscription}
        onToggleStatus={handleToggleSubscriptionStatus}
        onEditSubscription={(sub) => setModal({ mode: 'editProduct', target: sub })}
      />}

      {section === 'users' && <ClientUsersSection
        users={clientUsers}
        setModal={setModal}
      />}

      {modal?.mode === 'addService' && (
        <ServiceFormModal catalogServices={catalogServices} onClose={() => setModal(null)} onSave={handleAddService}
          loading={modal.loading} serverError={modal.serverError} />
      )}
      {modal?.mode === 'editService' && (
        <ServiceFormModal catalogServices={catalogServices} service={modal.target} onClose={() => setModal(null)}
          onSave={(data) => handleUpdateService(modal.target.id, data)} loading={modal.loading} serverError={modal.serverError} />
      )}
      {modal?.mode === 'deleteService' && (
        <ConfirmModal title="Удалить услугу" message={`Удалить услугу «${modal.target?.service_name}» у клиента?`}
          onConfirm={() => handleDeleteService(modal.target.id)} onCancel={() => setModal(null)} loading={modal.loading} danger />
      )}
      {modal?.mode === 'addPayment' && (
        <PaymentFormModal services={client.services} subscriptions={clientSubscriptions} onClose={() => setModal(null)} onSave={handleAddPayment}
          loading={modal.loading} serverError={modal.serverError} />
      )}
      {modal?.mode === 'editPayment' && (
        <PaymentFormModal services={client.services} subscriptions={clientSubscriptions} payment={modal.target} onClose={() => setModal(null)}
          onSave={(d) => handleUpdatePayment(modal.target.id, d)} loading={modal.loading} serverError={modal.serverError} />
      )}
      {modal?.mode === 'deletePayment' && (
        <ConfirmModal title="Удалить платёж" message={`Удалить платёж ${modal.target?.amount?.toLocaleString('ru-RU')} ₽?`}
          onConfirm={() => handleDeletePayment(modal.target.id)} onCancel={() => setModal(null)} loading={modal.loading} danger />
      )}
      {modal?.mode === 'addProduct' && (
        <AddProductModal
          products={products}
          existingSubscriptions={clientSubscriptions}
          onClose={() => setModal(null)}
          onSave={handleAddProductSubscription}
          loading={modal.loading}
          serverError={modal.serverError}
        />
      )}
      {modal?.mode === 'editProduct' && (
        <EditProductModal
          subscription={modal.target}
          products={products}
          onClose={() => setModal(null)}
          onSave={(formData) => handleEditProductSubscription(modal.target.id, formData)}
          loading={modal.loading}
          serverError={modal.serverError}
        />
      )}
      {modal?.mode === 'deleteProduct' && (
        <ConfirmModal title="Удалить продукт" message={`Отключить продукт «${modal.target?.product_name}» у клиента?`}
          onConfirm={() => handleDeleteProductSubscription(modal.target.id)} onCancel={() => setModal(null)} loading={modal.loading} danger />
      )}
      {modal?.mode === 'addUser' && (
        <UserFormModal clientId={clientId} onClose={() => setModal(null)} onSave={() => { setModal(null); loadClientUsers() }} loading={modal.loading} serverError={modal.serverError} />
      )}
      {modal?.mode === 'editUser' && (
        <UserFormModal clientId={clientId} user={modal.target} onClose={() => setModal(null)} onSave={() => { setModal(null); loadClientUsers() }} loading={modal.loading} serverError={modal.serverError} />
      )}
      {modal?.mode === 'deleteUser' && (
        <ConfirmModal title="Удалить пользователя" message={`Удалить пользователя «${modal.target?.name}» (${modal.target?.email})?`}
          onConfirm={async () => {
            setModal(m => ({ ...m, loading: true }))
            try {
              await apiFetch(`/api/auth/users/${modal.target.id}`, { method: 'DELETE' })
              loadClientUsers()
              setModal(null)
            } catch (e) {
              setModal(m => ({ ...m, loading: false, serverError: e.error || 'Ошибка' }))
            }
          }} onCancel={() => setModal(null)} loading={modal.loading} danger />
      )}
    </div>
  )
}

function ServicesSection({ client, modal, setModal, catalogServices, onAddService, onUpdateService, onDeleteService, onToggleStop }) {
  return (
    <>
      <div style={{ padding: '16px 32px', display: 'flex', gap: 24, flexWrap: 'wrap', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        {client.contact_person && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#374151', fontWeight: 500 }}><User size={14} /> {client.contact_person}</div>}
        {client.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#6b7280' }}><Phone size={14} /> {client.phone}</div>}
        {client.email && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#6b7280' }}><Mail size={14} /> {client.email}</div>}
        {client.address && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#6b7280' }}><MapPin size={14} /> {client.address}</div>}
      </div>

      <div className="section-toolbar" style={{ padding: '16px 32px 0', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary-sm" onClick={() => setModal({ mode: 'addService' })}>
          <Plus size={16} /> Добавить услугу
        </button>
      </div>

      {(!client.services || client.services.length === 0) ? (
        <div className="empty-state">
          <p>У клиента нет услуг</p>
          <button className="btn-primary-sm" onClick={() => setModal({ mode: 'addService' })}>
            <Plus size={14} /> Добавить первую
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Услуга</th>
                <th style={{ width: 120 }}>Продано</th>
                <th style={{ width: 160 }}>Оплачено / Всего</th>
                <th style={{ width: 130 }}>Период</th>
                <th style={{ width: 140 }}>Действует до</th>
                <th style={{ width: 130 }}>Статус</th>
                <th style={{ width: 120 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {client.services.map(svc => {
                const isFullyPaid = svc.price && svc.total_billed > 0 && svc.paid_amount >= svc.price
                return (
                  <tr key={svc.id} className={`svc-row ${!svc.is_active ? 'svc-row--inactive' : ''}`}>
                    <td>
                      <div className="svc-name">{svc.service_name}</div>
                      {svc.price && <div className="svc-desc-sm">{svc.price?.toLocaleString('ru-RU')} ₽</div>}
                    </td>
                    <td style={{ fontWeight: 700, color: '#1e3a8a' }}>
                      {svc.price ? `${svc.price?.toLocaleString('ru-RU')} ₽` : '—'}
                    </td>
                    <td>
                      {svc.price ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: isFullyPaid ? '#16a34a' : '#374151' }}>
                            {svc.paid_amount?.toLocaleString('ru-RU')} ₽
                          </div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>
                            из {svc.price?.toLocaleString('ru-RU')} ₽
                          </div>
                          {isFullyPaid && <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>✓ Оплачено</span>}
                        </div>
                      ) : <span style={{ color: '#9ca3af' }}>—</span>}
                    </td>
                    <td style={{ color: '#374151', fontWeight: 600 }}>
                      {INTERVAL_LABELS[svc.payment_interval] || svc.payment_interval}
                    </td>
                    <td style={{ color: '#6b7280' }}>
                      {svc.service_end_date ? new Date(svc.service_end_date).toLocaleDateString('ru-RU') : '—'}
                    </td>
                    <td><ServiceStatusBadge service={svc} payments={client.payments} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="icon-btn" onClick={() => setModal({ mode: 'editService', target: svc })} title="Редактировать">
                          <Pencil size={15} />
                        </button>
                        <button className="icon-btn" onClick={() => onToggleStop(svc)} title={svc.is_active ? 'Остановить' : 'Возобновить'}>
                          {svc.is_active ? <Pause size={15} /> : <Play size={15} />}
                        </button>
                        <button className="icon-btn icon-btn--danger" onClick={() => setModal({ mode: 'deleteService', target: svc })} title="Удалить">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function PaymentsSection({ client, modal, setModal, onAddPayment, onUpdatePayment, onDeletePayment, onMarkPaid, subscriptions }) {
  return (
    <>
      <div className="section-toolbar" style={{ padding: '16px 32px 0', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary-sm" onClick={() => setModal({ mode: 'addPayment' })}>
          <Plus size={16} /> Добавить платёж
        </button>
      </div>

      {(!client.payments || client.payments.length === 0) ? (
        <div className="empty-state">
          <p>Платежей пока нет</p>
          <button className="btn-primary-sm" onClick={() => setModal({ mode: 'addPayment' })}>
            <Plus size={14} /> Запланировать
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Сумма</th>
                <th style={{ width: 140 }}>Плановая дата</th>
                <th>Услуга / Продукт</th>
                <th style={{ width: 120 }}>Статус</th>
                <th style={{ width: 120 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {client.payments.map(p => {
                const isPast = p.status === 'pending' && new Date(p.planned_date) < new Date()
                const svc = client.services?.find(s => s.id === p.client_service_id)
                const sub = (subscriptions || []).find(s => s.id === p.client_product_subscription_id)
                return (
                  <tr key={p.id} className={`svc-row ${p.status === 'paid' ? 'svc-row--inactive' : isPast ? 'svc-row--overdue' : ''}`}>
                    <td style={{ fontWeight: 700, fontSize: 15 }}>
                      {p.amount?.toLocaleString('ru-RU')} ₽
                    </td>
                    <td style={{ color: '#6b7280' }}>
                      {new Date(p.planned_date).toLocaleDateString('ru-RU')}
                    </td>
                    <td style={{ color: '#374151' }}>
                      {svc ? (
                        <span>{svc.service_name}</span>
                      ) : sub ? (
                        <span style={{ color: '#7c3aed' }}>{sub.product_name || sub.product_code}</span>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>—</span>
                      )}
                    </td>
                    <td>
                      {p.status === 'paid' ? (
                        <span className="status-badge status-badge--active"><Check size={11} /> {new Date(p.paid_date).toLocaleDateString('ru-RU')}</span>
                      ) : isPast ? (
                        <span className="status-badge status-badge--expired"><AlertTriangle size={11} /> Просрочен</span>
                      ) : (
                        <span className="status-badge" style={{ background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }}><Clock size={11} /> Ожидает</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {p.status !== 'paid' && (
                          <button className="icon-btn" onClick={() => onMarkPaid(p)} title="Оплачен" style={{ color: '#10b981' }}>
                            <Check size={15} />
                          </button>
                        )}
                        <button className="icon-btn" onClick={() => setModal({ mode: 'editPayment', target: p })} title="Редактировать">
                          <Pencil size={15} />
                        </button>
                        <button className="icon-btn icon-btn--danger" onClick={() => setModal({ mode: 'deletePayment', target: p })} title="Удалить">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function AddProductModal({ products, existingSubscriptions, onClose, onSave, loading, serverError }) {
  const [form, setForm] = useState({
    product_code: '',
    billing_amount: '',
    billing_period: 'monthly',
    create_schedule: false,
    schedule_start: '',
    schedule_end: '',
  })
  const availableProducts = products.filter(p =>
    p.is_active && !existingSubscriptions.some(s => s.product_code === p.code)
  )

  const selectedProduct = products.find(p => p.code === form.product_code)

  const showSchedule = form.billing_period !== 'once'
  const scheduleDates = (showSchedule && form.create_schedule && form.schedule_start && form.schedule_end && form.billing_amount)
    ? generatePaymentDates(form.schedule_start, form.schedule_end, form.billing_period)
    : []

  function handleProductChange(code) {
    const product = products.find(p => p.code === code)
    if (product) {
      const period = product.billing_period || 'monthly'
      const amount = period === 'yearly' ? (product.price_yearly || 0) : (product.price_monthly || 0)
      setForm({ product_code: code, billing_amount: amount > 0 ? amount : '', billing_period: period, create_schedule: false, schedule_start: '', schedule_end: '' })
    } else {
      setForm({ product_code: code, billing_amount: '', billing_period: 'monthly', create_schedule: false, schedule_start: '', schedule_end: '' })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  const canSubmit = loading || !form.product_code || (form.create_schedule && (!form.schedule_start || !form.schedule_end || form.schedule_end <= form.schedule_start))

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>Добавить продукт</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form" autoComplete="off">
          <div className="form-row">
            <label>Продукт</label>
            <select
              className="field"
              value={form.product_code}
              onChange={e => handleProductChange(e.target.value)}
            >
              <option value="">— выберите продукт —</option>
              {availableProducts.map(p => (
                <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
              ))}
            </select>
          </div>

          {form.product_code && (
            <>
              <div className="form-row">
                <label>Стоимость (₽)</label>
                <input
                  className="field"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.billing_amount}
                  onChange={e => setForm(f => ({ ...f, billing_amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="form-row">
                <label>Периодичность</label>
                <select
                  className="field"
                  value={form.billing_period}
                  onChange={e => setForm(f => ({ ...f, billing_period: e.target.value, create_schedule: false, schedule_start: '', schedule_end: '' }))}
                >
                  <option value="monthly">Ежемесячно</option>
                  <option value="quarterly">Ежеквартально</option>
                  <option value="yearly">Ежегодно</option>
                  <option value="once">Разово</option>
                </select>
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
                            onChange={e => setForm(f => ({ ...f, schedule_start: e.target.value }))} />
                        </div>
                        <div className="form-row">
                          <label>Дата окончания *</label>
                          <input className="field" type="date" value={form.schedule_end}
                            onChange={e => setForm(f => ({ ...f, schedule_end: e.target.value }))} />
                        </div>
                      </div>
                      {scheduleDates.length > 0 && (
                        <div className="schedule-preview">
                          <Calendar size={13} />
                          Будет создано <strong>{scheduleDates.length}</strong> платежей
                          по <strong>{parseFloat(form.billing_amount || 0).toLocaleString('ru-RU')} ₽</strong>
                          {' '}({INTERVAL_LABELS[form.billing_period]})
                        </div>
                      )}
                      {form.schedule_start && form.schedule_end && form.schedule_end <= form.schedule_start && (
                        <div className="form-error">Дата окончания должна быть позже начальной</div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {serverError && <div className="form-error">{serverError}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn-save" disabled={canSubmit}>
              {loading ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
              {loading ? 'Сохранение...' : (form.create_schedule && scheduleDates.length > 0 ? `Подключить + ${scheduleDates.length} платежей` : 'Подключить')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditProductModal({ subscription, products, onClose, onSave, loading, serverError }) {
  const [form, setForm] = useState({
    billing_amount: subscription?.billing_amount ?? '',
    billing_period: subscription?.billing_period || 'monthly',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>Редактировать продукт</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form" autoComplete="off">
          <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontWeight: 600, color: '#111827' }}>{subscription?.product_name || subscription?.product_code}</div>
            {subscription?.product_description && (
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{subscription.product_description}</div>
            )}
          </div>

          <div className="form-row">
            <label>Стоимость (₽)</label>
            <input
              className="field"
              type="number"
              min="0"
              step="0.01"
              value={form.billing_amount}
              onChange={e => setForm(f => ({ ...f, billing_amount: e.target.value }))}
              placeholder="0.00"
            />
          </div>
          <div className="form-row">
            <label>Периодичность</label>
            <select
              className="field"
              value={form.billing_period}
              onChange={e => setForm(f => ({ ...f, billing_period: e.target.value }))}
            >
              <option value="monthly">Ежемесячно</option>
              <option value="quarterly">Ежеквартально</option>
              <option value="yearly">Ежегодно</option>
              <option value="once">Разово</option>
            </select>
          </div>

          {serverError && <div className="form-error">{serverError}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ClientProductsSection({ subscriptions, products, modal, setModal, onAddSubscription, onDeleteSubscription, onToggleStatus, onEditSubscription }) {
  return (
    <>
      <div className="section-toolbar" style={{ padding: '16px 32px 0', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary-sm" onClick={() => setModal({ mode: 'addProduct' })}>
          <Plus size={16} /> Добавить продукт
        </button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="empty-state">
          <RefreshCw size={48} style={{ color: '#d1d5db' }} />
          <p>У клиента нет подключённых продуктов</p>
          <button className="btn-primary-sm" onClick={() => setModal({ mode: 'addProduct' })}>
            <Plus size={14} /> Подключить первый
          </button>
        </div>
      ) : (
        <div style={{ padding: '16px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {subscriptions.map(sub => {
              const product = products.find(p => p.code === sub.product_code)
              return (
                <div key={sub.id} style={{
                  background: '#fff',
                  borderRadius: 14,
                  border: '1.5px solid #e5e7eb',
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: '#f5f3ff', color: '#7c3aed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Package size={24} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 4 }}>
                        {sub.product_name || sub.product_code}
                      </h3>
                      {sub.product_description && (
                        <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.4 }}>
                          {sub.product_description}
                        </p>
                      )}
                      {sub.billing_amount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                            {Number(sub.billing_amount).toLocaleString('ru-RU')} ₽
                          </span>
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>
                            / {INTERVAL_LABELS[sub.billing_period] || sub.billing_period}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {product?.config?.frontend_url && (
                        <a
                          href={product.config.frontend_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#7c3aed', textDecoration: 'none' }}
                        >
                          <ExternalLink size={12} /> Открыть
                        </a>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => onToggleStatus(sub)}
                        style={{
                          fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                          background: sub.status === 'active' ? '#dcfce7' : '#fef9c3',
                          color: sub.status === 'active' ? '#16a34a' : '#ca8a04',
                        }}
                      >
                        {sub.status === 'active' ? 'Активен' : 'Приостановлен'}
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => onEditSubscription(sub)}
                        title="Редактировать"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-btn icon-btn--danger"
                        onClick={() => setModal({ mode: 'deleteProduct', target: sub })}
                        title="Отключить"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

function UserFormModal({ clientId, user, onClose, onSave, loading, serverError }) {
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

function ClientUsersSection({ users, setModal }) {
  return (
    <>
      <div className="section-toolbar" style={{ padding: '16px 32px 0', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary-sm" onClick={() => setModal({ mode: 'addUser' })}>
          <Plus size={16} /> Добавить пользователя
        </button>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <Users size={48} style={{ color: '#d1d5db' }} />
          <p>У клиента нет пользователей</p>
          <button className="btn-primary-sm" onClick={() => setModal({ mode: 'addUser' })}>
            <Plus size={14} /> Создать первого
          </button>
        </div>
      ) : (
        <div style={{ padding: '16px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {users.map(u => (
              <div key={u.id} style={{
                background: '#fff',
                borderRadius: 14,
                border: '1.5px solid #e5e7eb',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: '#eff6ff', color: '#3b82f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <User size={24} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 4 }}>
                      {u.name}
                    </h3>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{u.email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                    background: u.is_active ? '#dcfce7' : '#f3f4f6',
                    color: u.is_active ? '#16a34a' : '#6b7280',
                  }}>
                    {u.is_active ? 'Активен' : 'Неактивен'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      className="icon-btn"
                      onClick={() => setModal({ mode: 'editUser', target: u })}
                      title="Редактировать"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-btn icon-btn--danger"
                      onClick={() => setModal({ mode: 'deleteUser', target: u })}
                      title="Удалить"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}