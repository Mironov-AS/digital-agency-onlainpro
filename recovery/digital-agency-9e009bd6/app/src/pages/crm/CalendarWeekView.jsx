import { Loader2, Phone, Users as UsersIcon, CheckCircle, Briefcase, MessageSquare } from 'lucide-react'
import { getWeekActivityCardMeta } from './CrmCalendarTab.utils.js'

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Звонок', icon: Phone, color: '#3b82f6' },
  { value: 'meeting', label: 'Встреча', icon: UsersIcon, color: '#8b5cf6' },
  { value: 'task', label: 'Задача', icon: CheckCircle, color: '#10b981' },
  { value: 'service', label: 'Услуга', icon: Briefcase, color: '#f59e0b' },
  { value: 'other', label: 'Другое', icon: MessageSquare, color: '#6b7280' },
]

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const HOUR_H = 72

function getTypeInfo(type) {
  return ACTIVITY_TYPES.find(t => t.value === type) || ACTIVITY_TYPES[4]
}

function timeToMin(t) {
  if (!t) return 0
  const [h, m] = t.slice(0, 5).split(':').map(Number)
  return h * 60 + m
}

function layoutColumn(activities) {
  const timed = activities
    .filter(a => a.planned_time)
    .map(a => ({ ...a, _start: timeToMin(a.planned_time), _end: timeToMin(a.planned_time) + (a.duration || 60) }))
    .sort((a, b) => a._start - b._start || a._end - b._end)

  const columns = []
  timed.forEach(ev => {
    let placed = false
    for (let c = 0; c < columns.length; c++) {
      const last = columns[c][columns[c].length - 1]
      if (ev._start >= last._end) {
        columns[c].push(ev)
        ev._col = c
        placed = true
        break
      }
    }
    if (!placed) {
      ev._col = columns.length
      columns.push([ev])
    }
  })

  const totalCols = columns.length || 1
  timed.forEach(ev => { ev._totalCols = totalCols })
  return timed
}

export default function CalendarWeekView({
  weekLoading, weekDates, weekData, todayStr, weekTimeRange,
  maxDayCount, weekTotalCount, weekPlannedCount, weekCompletedCount, weekCanceledCount,
  isCurrentWeek, weekBodyRef,
  onSelectDay, onAddActivity, onEditActivity,
}) {
  if (weekLoading) {
    return <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={24} className="spin" /></div>
  }

  return (
    <div className="crm-week-view">
      <div className="crm-week-summary">
        <span><strong>{weekTotalCount}</strong> активностей</span>
        <span style={{ color: '#3b82f6' }}>● <strong>{weekPlannedCount}</strong> план</span>
        <span style={{ color: '#10b981' }}>● <strong>{weekCompletedCount}</strong> готово</span>
        {weekCanceledCount > 0 && <span style={{ color: '#ef4444' }}>● <strong>{weekCanceledCount}</strong> отмена</span>}
        <span className="crm-week-legend">
          {ACTIVITY_TYPES.map(t => (
            <span key={t.value}><span style={{ background: t.color }} className="crm-week-legend-dot" />{t.label}</span>
          ))}
        </span>
      </div>

      <div className="crm-week-header">
        <div className="crm-week-gutter" />
        {weekDates.map(date => {
          const d = new Date(date + 'T12:00:00')
          const isToday = date === todayStr
          const acts = weekData[date] || []
          const count = acts.length
          const dayIdx = d.getDay()
          const plannedPct = count ? (acts.filter(a => a.status === 'planned').length / count) * 100 : 0
          const completedPct = count ? (acts.filter(a => a.status === 'completed').length / count) * 100 : 0
          const fillPct = (count / maxDayCount) * 100
          return (
            <div key={date} className={`crm-week-day-hdr${isToday ? ' is-today' : ''}`}
              onClick={() => onSelectDay(date)}>
              <span className="crm-week-day-name">{DAY_NAMES[dayIdx === 0 ? 6 : dayIdx - 1]}</span>
              <span className="crm-week-day-num">{d.getDate()}</span>
              {count > 0 && <span className="crm-week-day-badge">{count}</span>}
              {count > 0 && (
                <div className="crm-week-day-density" style={{ width: `${fillPct}%` }}>
                  <div className="crm-week-density-done" style={{ width: `${completedPct}%` }} />
                  <div className="crm-week-density-plan" style={{ width: `${plannedPct}%` }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {weekDates.some(d => (weekData[d] || []).some(a => !a.planned_time)) && (
        <div className="crm-week-allday">
          <div className="crm-week-gutter" style={{ fontSize: 10, color: '#9ca3af', padding: '4px 2px', textAlign: 'center' }}>
            Без<br />времени
          </div>
          {weekDates.map(date => {
            const noTime = (weekData[date] || []).filter(a => !a.planned_time)
            return (
              <div key={date} className="crm-week-allday-cell">
                {noTime.map(a => {
                  const ti = getTypeInfo(a.activity_type)
                  const meta = getWeekActivityCardMeta(a)
                  return (
                    <div key={a.id} className="crm-week-allday-chip"
                      style={{ borderLeftColor: ti.color }}
                      onClick={() => onSelectDay(date)}
                      title={`${meta.title}${meta.customerName ? ' — ' + meta.customerName : ''}\n${meta.statusLabel}`}>
                      <ti.icon size={10} color={ti.color} />
                      <span className="crm-week-allday-title">{meta.title}</span>
                      <span className="crm-week-chip-status">{meta.statusLabel}</span>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      <div className="crm-week-body" ref={weekBodyRef}>
        <div className="crm-week-grid" style={{ height: (weekTimeRange.end - weekTimeRange.start) * HOUR_H }}>
          <div className="crm-week-gutter crm-week-times">
            {weekTimeRange.hours.map(h => (
              <div key={h} className="crm-week-time-label" style={{ top: (h - weekTimeRange.start) * HOUR_H }}>
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {weekDates.map(date => {
            const isToday = date === todayStr
            const activities = weekData[date] || []
            const timed = layoutColumn(activities)
            return (
              <div key={date} className={`crm-week-col${isToday ? ' is-today' : ''}`}>
                {weekTimeRange.hours.map(h => (
                  <div key={h} className="crm-week-hour-line" style={{ top: (h - weekTimeRange.start) * HOUR_H }} />
                ))}
                {weekTimeRange.hours.slice(0, -1).map(h => (
                  <div key={`h${h}`} className="crm-week-half-line" style={{ top: (h - weekTimeRange.start) * HOUR_H + HOUR_H / 2 }} />
                ))}
                {weekTimeRange.hours.slice(0, -1).map(h => (
                  <div key={`slot-${h}`} className="crm-week-hour-slot"
                    style={{ top: (h - weekTimeRange.start) * HOUR_H, height: HOUR_H }}
                    onClick={() => onAddActivity(date, h)}>
                    <span className="crm-week-slot-plus">+</span>
                  </div>
                ))}
                {timed.map(a => {
                  const ti = getTypeInfo(a.activity_type)
                  const visibleStartMin = weekTimeRange.start * 60
                  const visibleEndMin = weekTimeRange.end * 60
                  const eventStartMin = Math.max(a._start, visibleStartMin)
                  const eventEndMin = Math.min(a._end, visibleEndMin)
                  const top = Math.max(0, ((eventStartMin - visibleStartMin) / 60) * HOUR_H)
                  const height = Math.max(((eventEndMin - eventStartMin) / 60) * HOUR_H, 46)
                  const colW = 100 / a._totalCols
                  const left = a._col * colW
                  const isCompleted = a.status === 'completed'
                  const isCanceled = a.status === 'canceled'
                  const meta = getWeekActivityCardMeta(a)
                  return (
                    <div key={a.id}
                      className={`crm-week-event${isCompleted ? ' completed' : ''}${isCanceled ? ' canceled' : ''}`}
                      style={{
                        top, height,
                        left: `calc(${left}% + 2px)`,
                        width: `calc(${colW}% - 4px)`,
                        borderLeftColor: ti.color,
                        background: isCompleted ? '#f0fdf4' : isCanceled ? '#fef2f2' : `${ti.color}12`,
                        color: isCompleted ? '#065f46' : isCanceled ? '#991b1b' : ti.color,
                      }}
                      onClick={(e) => { e.stopPropagation(); onEditActivity(a) }}
                      title={`${meta.plannedTime} ${meta.title}\n${meta.customerName || ''}\n${ti.label} · ${meta.statusLabel}`}>
                      <div className="crm-week-event-head">
                        <div className="crm-week-event-time">
                          <ti.icon size={10} /> {meta.plannedTime}
                          {meta.durationLabel && <span className="crm-week-event-dur"> · {meta.durationLabel}</span>}
                        </div>
                        <span className="crm-week-event-status">{meta.statusLabel}</span>
                      </div>
                      <div className="crm-week-event-title">{meta.title}</div>
                      {height > 58 && meta.customerName && (
                        <div className="crm-week-event-client">{meta.customerName}</div>
                      )}
                      {height > 82 && meta.serviceName && (
                        <div className="crm-week-event-service">{meta.serviceName}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}

          {isCurrentWeek && (() => {
            const nowD = new Date()
            const nowMin = nowD.getHours() * 60 + nowD.getMinutes()
            if (nowMin < weekTimeRange.start * 60 || nowMin > weekTimeRange.end * 60) return null
            const top = ((nowMin - weekTimeRange.start * 60) / 60) * HOUR_H
            return <div className="crm-week-now-line" style={{ top }}><div className="crm-week-now-dot" /></div>
          })()}
        </div>
      </div>
    </div>
  )
}
