import {
  X, Check, Loader2,
  Phone, Users as UsersIcon, CheckCircle,
  Briefcase, MessageSquare, Link2,
} from 'lucide-react'

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Звонок', icon: Phone, color: '#3b82f6' },
  { value: 'meeting', label: 'Встреча', icon: UsersIcon, color: '#8b5cf6' },
  { value: 'task', label: 'Задача', icon: CheckCircle, color: '#10b981' },
  { value: 'service', label: 'Услуга', icon: Briefcase, color: '#f59e0b' },
  { value: 'other', label: 'Другое', icon: MessageSquare, color: '#6b7280' },
]

export default function CalendarActivityModal({
  modal, form, setForm, saving, error,
  customers, services, orders, employees,
  bookingAvailable, crmMode,
  onSave, onClose,
}) {
  if (!modal) return null

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box crm-calendar-modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h3>{modal === 'add' ? 'Новая активность' : 'Редактирование'}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form className="modal-form crm-calendar-form" autoComplete="off" onSubmit={e => { e.preventDefault(); onSave() }}>
          {error && <div className="form-error">{error}</div>}

          <div className="form-row">
            <label>Клиент *</label>
            <select className="field" value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value, order_id: '' })} autoComplete="off">
              <option value="">— Выберите клиента —</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.full_name}{c.phone ? ` (${c.phone})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Название *</label>
            <input className="field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Например: Перезвонить клиенту" autoComplete="off" />
          </div>

          <div className="form-row">
            <label>Тип активности</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ACTIVITY_TYPES.map(t => (
                <button key={t.value} type="button"
                  className={`btn-sm ${form.activity_type === t.value ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setForm({ ...form, activity_type: t.value })}
                  style={form.activity_type === t.value ? { background: t.color, borderColor: t.color } : {}}>
                  <t.icon size={12} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {bookingAvailable && (
            <>
              <div className="form-row-2">
                <div className="form-row">
                  <label>Дата *</label>
                  <input type="date" className="field" value={form.planned_date}
                    onChange={e => setForm({ ...form, planned_date: e.target.value })} autoComplete="off" />
                </div>
                <div className="form-row">
                  <label>Время</label>
                  <input type="time" className="field" value={form.planned_time}
                    onChange={e => setForm({ ...form, planned_time: e.target.value })} autoComplete="off" />
                </div>
              </div>

              {crmMode !== 'sales' && (
                <div className="form-row">
                  <label>Услуга <span style={{ fontSize: 11, color: '#8b5cf6' }}>(синхронизация с Booking)</span></label>
                  <select className="field" value={form.service_id}
                    onChange={e => setForm({ ...form, service_id: e.target.value, activity_type: e.target.value ? 'service' : form.activity_type })}
                    autoComplete="off">
                    <option value="">— Без услуги —</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}{s.price ? ` (${s.price} ₽)` : ''}</option>
                    ))}
                  </select>
                  {form.service_id && form.planned_time && (
                    <div className="sync-notice">
                      <Link2 size={12} /> При сохранении запись будет создана в Электронной записи
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {!bookingAvailable && (
            <div className="form-row-2">
              <div className="form-row">
                <label>Дата *</label>
                <input type="date" className="field" value={form.planned_date}
                  onChange={e => setForm({ ...form, planned_date: e.target.value })} autoComplete="off" />
              </div>
              <div className="form-row">
                <label>Время</label>
                <input type="time" className="field" value={form.planned_time}
                  onChange={e => setForm({ ...form, planned_time: e.target.value })} autoComplete="off" />
              </div>
            </div>
          )}

          <div className="form-row">
            <label>Длительность (мин)</label>
            <input type="number" className="field" value={form.duration} min={5} max={480}
              onChange={e => setForm({ ...form, duration: e.target.value })} autoComplete="off" />
          </div>

          {crmMode !== 'services' && (
            <div className="form-row">
              <label>Заказ</label>
              <select className="field" value={form.order_id} onChange={e => setForm({ ...form, order_id: e.target.value })} autoComplete="off">
                <option value="">— Без заказа —</option>
                {orders
                  .filter(o => !form.customer_id || o.customer_id === form.customer_id)
                  .map(o => (
                    <option key={o.id} value={o.id}>{o.title} · {o.customer_name || 'клиент'}</option>
                  ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <label>Исполнитель</label>
            <select className="field" value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })} autoComplete="off">
              <option value="">— Не указан —</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.full_name}{e.position ? ` (${e.position})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Описание</label>
            <textarea className="field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3} placeholder="Дополнительная информация..." autoComplete="off" />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
              {modal === 'add' ? ' Создать' : ' Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
