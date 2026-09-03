import { useState } from 'react'
import { Loader2, X, Check, Calendar, Clock } from 'lucide-react'
import { INTERVAL_LABELS } from '../../constants/intervals.js'
import { generatePaymentDates } from '../../utils/date.js'

export function AddProductModal({ products, existingSubscriptions, onClose, onSave, loading, serverError }) {
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
            <select className="field" value={form.product_code} onChange={e => handleProductChange(e.target.value)} autoComplete="off">
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
                <input className="field" type="number" min="0" step="0.01" value={form.billing_amount}
                  onChange={e => setForm(f => ({ ...f, billing_amount: e.target.value }))} placeholder="0.00" autoComplete="off" />
              </div>
              <div className="form-row">
                <label>Периодичность</label>
                <select className="field" value={form.billing_period}
                  onChange={e => setForm(f => ({ ...f, billing_period: e.target.value, create_schedule: false, schedule_start: '', schedule_end: '' }))} autoComplete="off">
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
                            onChange={e => setForm(f => ({ ...f, schedule_start: e.target.value }))} autoComplete="off" />
                        </div>
                        <div className="form-row">
                          <label>Дата окончания *</label>
                          <input className="field" type="date" value={form.schedule_end}
                            onChange={e => setForm(f => ({ ...f, schedule_end: e.target.value }))} autoComplete="off" />
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

export function EditProductModal({ subscription, products, onClose, onSave, loading, serverError }) {
  const isTrial = subscription?.status === 'trial'
  const [form, setForm] = useState({
    billing_amount: subscription?.billing_amount ?? '',
    billing_period: subscription?.billing_period || 'monthly',
    trial_days: subscription?.trial_days ?? 14,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { billing_amount: form.billing_amount, billing_period: form.billing_period }
    if (isTrial) payload.trial_days = parseInt(form.trial_days) || 14
    onSave(payload)
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

          {isTrial && (
            <div className="form-row">
              <label>Срок тестового периода (дней)</label>
              <input className="field" type="number" min="1" max="365" value={form.trial_days}
                onChange={e => setForm(f => ({ ...f, trial_days: e.target.value }))} autoComplete="off" />
              <span style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                Срок отсчитывается от даты подключения. Текущая дата окончания: {subscription.trial_ends_at ? new Date(subscription.trial_ends_at).toLocaleDateString('ru-RU') : '—'}
              </span>
            </div>
          )}

          <div className="form-row">
            <label>Стоимость (₽)</label>
            <input className="field" type="number" min="0" step="0.01" value={form.billing_amount}
              onChange={e => setForm(f => ({ ...f, billing_amount: e.target.value }))} placeholder="0.00" autoComplete="off" />
          </div>
          <div className="form-row">
            <label>Периодичность</label>
            <select className="field" value={form.billing_period}
              onChange={e => setForm(f => ({ ...f, billing_period: e.target.value }))} autoComplete="off">
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
