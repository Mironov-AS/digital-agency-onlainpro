import {
  Loader2, Edit2, Trash2,
  Phone, Users as UsersIcon, Clock, CheckCircle, XCircle,
  Briefcase, Link2,
} from 'lucide-react'

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Звонок', icon: Phone, color: '#3b82f6' },
  { value: 'meeting', label: 'Встреча', icon: UsersIcon, color: '#8b5cf6' },
  { value: 'task', label: 'Задача', icon: CheckCircle, color: '#10b981' },
  { value: 'service', label: 'Услуга', icon: Briefcase, color: '#f59e0b' },
  { value: 'other', label: 'Другое', color: '#6b7280' },
]

const STATUS_LABELS = {
  planned: { label: 'Запланировано', color: '#3b82f6' },
  completed: { label: 'Завершено', color: '#10b981' },
  canceled: { label: 'Отменено', color: '#ef4444' },
}

function getTypeInfo(type) {
  return ACTIVITY_TYPES.find(t => t.value === type) || ACTIVITY_TYPES[4]
}

export default function CalendarDayView({
  selectedDate, dayLoading, dayActivities,
  onComplete, onCancel, onDelete, onEdit,
}) {
  if (!selectedDate) return null

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <h4 style={{ margin: 0 }}>
          {new Date(selectedDate + 'T12:00:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h4>
      </div>

      {dayLoading ? (
        <div style={{ textAlign: 'center', padding: 20 }}><Loader2 size={18} className="spin" /></div>
      ) : dayActivities.length === 0 ? (
        <div style={{ color: '#9ca3af', padding: 12 }}>Нет активностей на этот день</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {dayActivities.map(a => {
            const ti = getTypeInfo(a.activity_type)
            const st = STATUS_LABELS[a.status] || STATUS_LABELS.planned
            const TIcon = ti.icon
            return (
              <div key={a.id} style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
                padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12,
                borderLeft: `4px solid ${ti.color}`,
                opacity: a.status === 'canceled' ? 0.6 : 1,
              }}>
                {TIcon && <TIcon size={18} color={ti.color} style={{ marginTop: 2, flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong>{a.title}</strong>
                    <span style={{
                      fontSize: 11, padding: '1px 6px', borderRadius: 10,
                      background: `${st.color}15`, color: st.color,
                    }}>{st.label}</span>
                    {a.booking_appointment_id && (
                      <span style={{ fontSize: 11, color: '#8b5cf6' }} title="Синхронизировано с Электронной записью">
                        <Link2 size={12} /> Booking
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                    {a.customer_name && <span><UsersIcon size={12} style={{ verticalAlign: -2 }} /> {a.customer_name}</span>}
                    {a.planned_time && <span style={{ marginLeft: 12 }}><Clock size={12} style={{ verticalAlign: -2 }} /> {a.planned_time.slice(0, 5)}</span>}
                    {a.duration && <span style={{ marginLeft: 8 }}>({a.duration} мин)</span>}
                    {a.service_name && <span style={{ marginLeft: 12 }}><Briefcase size={12} style={{ verticalAlign: -2 }} /> {a.service_name}</span>}
                    {a.employee_name && <span style={{ marginLeft: 12 }}>Исполнитель: {a.employee_name}</span>}
                  </div>
                  {a.description && <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>{a.description}</div>}
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {a.status === 'planned' && (
                    <>
                      <button className="btn-icon" onClick={() => onComplete(a.id)} title="Завершить" style={{ color: '#10b981' }}>
                        <CheckCircle size={16} />
                      </button>
                      <button className="btn-icon" onClick={() => onCancel(a.id)} title="Отменить" style={{ color: '#ef4444' }}>
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                  <button className="btn-icon" onClick={() => onEdit(a)} title="Редактировать">
                    <Edit2 size={16} />
                  </button>
                  <button className="btn-icon" onClick={() => onDelete(a.id)} title="Удалить" style={{ color: '#ef4444' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
