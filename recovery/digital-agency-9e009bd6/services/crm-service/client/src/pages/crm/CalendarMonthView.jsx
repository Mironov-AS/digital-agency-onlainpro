import { Loader2 } from 'lucide-react'

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Звонок', color: '#3b82f6' },
  { value: 'meeting', label: 'Встреча', color: '#8b5cf6' },
  { value: 'task', label: 'Задача', color: '#10b981' },
  { value: 'service', label: 'Услуга', color: '#f59e0b' },
  { value: 'other', label: 'Другое', color: '#6b7280' },
]

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function getTypeInfo(type) {
  return ACTIVITY_TYPES.find(t => t.value === type) || ACTIVITY_TYPES[4]
}

export default function CalendarMonthView({
  loading, calendarCells, todayStr, selectedDate,
  onSelectDay, onAddActivity, onEditActivity,
}) {
  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={24} className="spin" /></div>
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: '#e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
      {DAY_NAMES.map(d => (
        <div key={d} style={{ background: '#f9fafb', padding: '8px 4px', textAlign: 'center', fontWeight: 600, fontSize: 13, color: '#6b7280' }}>
          {d}
        </div>
      ))}
      {calendarCells.map((cell, i) => {
        const isToday = cell.date === todayStr
        const isSelected = cell.date === selectedDate
        return (
          <div key={i}
            onClick={() => cell.date && onSelectDay(cell.date)}
            onDoubleClick={() => cell.date && onAddActivity(cell.date)}
            style={{
              background: isSelected ? '#eff6ff' : isToday ? '#f0fdf4' : '#fff',
              padding: '6px 4px', minHeight: 80, cursor: cell.date ? 'pointer' : 'default',
              opacity: cell.inMonth ? 1 : 0.4,
              borderLeft: isSelected ? '3px solid #3b82f6' : '3px solid transparent',
            }}
          >
            <div style={{
              fontSize: 13, fontWeight: isToday ? 700 : 400,
              color: isToday ? '#059669' : '#374151', marginBottom: 4,
            }}>
              {cell.day}
            </div>
            {(cell.activities || []).slice(0, 3).map((a, j) => {
              const ti = getTypeInfo(a.activity_type)
              return (
                <div key={j}
                  onClick={(e) => { e.stopPropagation(); onEditActivity(a) }}
                  onDoubleClick={(e) => e.stopPropagation()}
                  style={{
                    fontSize: 11, padding: '1px 4px', borderRadius: 3,
                    background: a.status === 'completed' ? '#d1fae5' : a.status === 'canceled' ? '#fee2e2' : `${ti.color}15`,
                    color: a.status === 'completed' ? '#065f46' : a.status === 'canceled' ? '#991b1b' : ti.color,
                    marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    cursor: 'pointer',
                  }}>
                  {a.planned_time ? a.planned_time.slice(0, 5) + ' ' : ''}{a.title}
                </div>
              )
            })}
            {(cell.activities || []).length > 3 && (
              <div style={{ fontSize: 10, color: '#6b7280' }}>+{cell.activities.length - 3} ещё</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
