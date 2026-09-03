import { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus, X, Check, Loader2,
  ChevronLeft, ChevronRight, ChevronDown, Calendar, Bell,
  Phone, Users as UsersIcon, Clock, CheckCircle,
  Briefcase, MessageSquare,
} from 'lucide-react'
import { apiFetch } from '../../api.js'
import { getWeekActivityCardMeta } from './CrmCalendarTab.utils.js'
import CalendarMonthView from './CalendarMonthView.jsx'
import CalendarWeekView from './CalendarWeekView.jsx'
import CalendarDayView from './CalendarDayView.jsx'
import CalendarActivityModal from './CalendarActivityModal.jsx'

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Звонок', icon: Phone, color: '#3b82f6' },
  { value: 'meeting', label: 'Встреча', icon: UsersIcon, color: '#8b5cf6' },
  { value: 'task', label: 'Задача', icon: CheckCircle, color: '#10b981' },
  { value: 'service', label: 'Услуга', icon: Briefcase, color: '#f59e0b' },
  { value: 'other', label: 'Другое', icon: MessageSquare, color: '#6b7280' },
]

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

const MONTH_NAMES_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]
const HOUR_H = 72

function formatLocalDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getWorkHours() {
  try {
    const raw = localStorage.getItem('crm_work_hours')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (typeof parsed.start === 'number' && typeof parsed.end === 'number') return parsed
    }
  } catch {}
  return { start: 9, end: 18 }
}

function getTypeInfo(type) {
  return ACTIVITY_TYPES.find(t => t.value === type) || ACTIVITY_TYPES[4]
}

function getMonday(d) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.getFullYear(), date.getMonth(), diff, 12)
}

export function getWeekDates(monday) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return formatLocalDate(d)
  })
}

function timeToMin(t) {
  if (!t) return 0
  const [h, m] = t.slice(0, 5).split(':').map(Number)
  return h * 60 + m
}

const MIN_DAY_HOUR = 0
const MAX_DAY_HOUR = 24

export function getVisibleWeekTimeRange(workHours, activities) {
  const fallback = { start: 9, end: 18 }
  const safeStart = Number.isFinite(workHours?.start) ? workHours.start : fallback.start
  const safeEnd = Number.isFinite(workHours?.end) ? workHours.end : fallback.end
  let start = Math.max(MIN_DAY_HOUR, Math.min(safeStart, MAX_DAY_HOUR - 1))
  let end = Math.max(start + 1, Math.min(safeEnd, MAX_DAY_HOUR))

  activities
    .filter(a => a?.planned_time)
    .forEach(a => {
      const activityStart = timeToMin(a.planned_time)
      const duration = Number(a.duration) || 60
      const activityEnd = activityStart + duration
      start = Math.min(start, Math.floor(activityStart / 60))
      end = Math.max(end, Math.ceil(activityEnd / 60))
    })

  start = Math.max(MIN_DAY_HOUR, Math.min(start, MAX_DAY_HOUR - 1))
  end = Math.max(start + 1, Math.min(end, MAX_DAY_HOUR))

  return {
    start,
    end,
    hours: Array.from({ length: end - start + 1 }, (_, i) => i + start),
  }
}

export function getWorkWeekScrollTop(workHours, weekTimeRange, viewportHeight, gridHeight) {
  const desiredTop = Math.max(0, (workHours.start - weekTimeRange.start) * HOUR_H)
  const maxScrollTop = Math.max(0, gridHeight - viewportHeight)
  return Math.min(desiredTop, maxScrollTop)
}

export default function CrmCalendarTab() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [calendarData, setCalendarData] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)
  const [dayActivities, setDayActivities] = useState([])
  const [dayLoading, setDayLoading] = useState(false)

  const [viewMode, setViewMode] = useState('month')
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [weekData, setWeekData] = useState({})
  const [weekLoading, setWeekLoading] = useState(false)
  const [toolbarHost, setToolbarHost] = useState(null)
  const [monthPickerOpen, setMonthPickerOpen] = useState(false)
  const [monthPickerYear, setMonthPickerYear] = useState(now.getFullYear())
  const calendarRootRef = useRef(null)
  const weekBodyRef = useRef(null)

  const [reminders, setReminders] = useState([])
  const [showReminders, setShowReminders] = useState(false)
  const [reminderCount, setReminderCount] = useState(0)

  const [customers, setCustomers] = useState([])
  const [services, setServices] = useState([])
  const [orders, setOrders] = useState([])
  const [employees, setEmployees] = useState([])
  const [bookingAvailable, setBookingAvailable] = useState(false)
  const [crmMode, setCrmMode] = useState('both')
  const [workHours, setWorkHours] = useState(getWorkHours)

  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({
    customer_id: '', title: '', description: '', activity_type: 'task',
    planned_date: '', planned_time: '', duration: 60,
    service_id: '', order_id: '', employee_id: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadCalendar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch(`/api/crm/activities/calendar?year=${year}&month=${month}`)
      setCalendarData(data.days || {})
    } catch (e) {
      console.error('[crm] load calendar', e)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  const loadReminders = useCallback(async () => {
    try {
      const data = await apiFetch('/api/crm/activities/reminders')
      setReminders(data.activities || [])
      setReminderCount(data.count || 0)
    } catch (e) {
      console.error('[crm] load reminders', e)
    }
  }, [])

  const loadDicts = useCallback(async () => {
    try {
      const [custs, svcs, emps, orderData, settings] = await Promise.all([
        apiFetch('/api/crm/customers?limit=1000'),
        apiFetch('/api/crm/services?status=active'),
        apiFetch('/api/crm/employees?active_only=true'),
        apiFetch('/api/crm/orders?status=active'),
        apiFetch('/api/crm/display-settings'),
      ])
      setCustomers((custs.items || custs) || [])
      setServices(Array.isArray(svcs) ? svcs : [])
      setEmployees(Array.isArray(emps) ? emps : [])
      setOrders(Array.isArray(orderData) ? orderData : [])
      setCrmMode(settings.crm_mode || 'both')
    } catch {}

    try {
      const status = await apiFetch('/api/crm/integration/booking/status')
      setBookingAvailable(!!status.booking_available)
    } catch {
      setBookingAvailable(false)
    }
  }, [])

  useEffect(() => { loadCalendar() }, [loadCalendar])
  useEffect(() => { loadReminders() }, [loadReminders])
  useEffect(() => { loadDicts() }, [loadDicts])

  useEffect(() => {
    const handler = () => setWorkHours(getWorkHours())
    window.addEventListener('crm-work-hours-changed', handler)
    return () => window.removeEventListener('crm-work-hours-changed', handler)
  }, [])

  const loadWorkWeek = useCallback(async () => {
    setWeekLoading(true)
    try {
      const dates = getWeekDates(weekStart)
      const results = await Promise.all(
        dates.map(d => apiFetch(`/api/crm/activities?date_from=${d}&date_to=${d}`))
      )
      const grouped = {}
      dates.forEach((d, i) => { grouped[d] = Array.isArray(results[i]) ? results[i] : [] })
      setWeekData(grouped)
    } catch (e) {
      console.error('[crm] load work week', e)
    } finally {
      setWeekLoading(false)
    }
  }, [weekStart])

  useEffect(() => {
    if (viewMode === 'workweek') loadWorkWeek()
  }, [viewMode, loadWorkWeek])

  async function loadDayActivities(date) {
    setSelectedDate(date)
    setDayLoading(true)
    try {
      const data = await apiFetch(`/api/crm/activities?date_from=${date}&date_to=${date}`)
      setDayActivities(Array.isArray(data) ? data : [])
    } catch {
      setDayActivities([])
    } finally {
      setDayLoading(false)
    }
  }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }
  function prevWeek() {
    setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n })
  }
  function nextWeek() {
    setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n })
  }

  function switchView(mode) {
    if (mode === viewMode) return
    if (mode === 'workweek') {
      const base = selectedDate ? new Date(selectedDate + 'T12:00:00') : new Date()
      setWeekStart(getMonday(base))
    } else {
      setYear(weekStart.getFullYear())
      setMonth(weekStart.getMonth() + 1)
      setMonthPickerYear(weekStart.getFullYear())
    }
    setViewMode(mode)
  }

  function openMonthPicker() {
    setMonthPickerYear(year)
    setMonthPickerOpen(true)
  }
  function chooseMonth(nextMonthValue) {
    setYear(monthPickerYear)
    setMonth(nextMonthValue)
    setMonthPickerOpen(false)
  }

  function goToday() {
    const t = new Date()
    if (viewMode === 'month') {
      setYear(t.getFullYear())
      setMonth(t.getMonth() + 1)
    } else {
      setWeekStart(getMonday(t))
    }
    loadDayActivities(formatLocalDate(t))
  }

  function openAddModal(date, hour) {
    setForm({
      customer_id: '', title: '', description: '', activity_type: 'task',
      planned_date: date || formatLocalDate(new Date()),
      planned_time: hour != null ? `${String(hour).padStart(2, '0')}:00` : '',
      duration: 60, service_id: '', order_id: '', employee_id: '',
    })
    setError('')
    setModal('add')
  }

  async function openEditModal(activity) {
    let source = activity
    if (activity?.id) {
      try {
        source = await apiFetch(`/api/crm/activities/${activity.id}`)
      } catch {
        source = activity
      }
    }
    const pd = typeof source.planned_date === 'string'
      ? source.planned_date.slice(0, 10)
      : new Date(source.planned_date).toISOString().slice(0, 10)
    const pt = source.planned_time
      ? (typeof source.planned_time === 'string' ? source.planned_time.slice(0, 5) : '')
      : ''
    setForm({
      customer_id: source.customer_id || '',
      title: source.title || '',
      description: source.description || '',
      activity_type: source.activity_type || 'task',
      planned_date: pd,
      planned_time: pt,
      duration: source.duration || 60,
      service_id: source.service_id || '',
      order_id: source.order_id || '',
      employee_id: source.employee_id || '',
    })
    setError('')
    setModal({ type: 'edit', id: source.id || activity.id })
  }

  async function saveActivity() {
    if (!form.customer_id) return setError('Выберите клиента')
    if (!form.title.trim()) return setError('Введите название')
    if (!form.planned_date) return setError('Выберите дату')

    setSaving(true)
    setError('')
    try {
      const payload = { ...form, duration: parseInt(form.duration) || 60 }
      if (!payload.service_id) delete payload.service_id
      if (!payload.order_id) delete payload.order_id
      if (!payload.employee_id) delete payload.employee_id
      if (!payload.planned_time) delete payload.planned_time

      if (modal === 'add') {
        await apiFetch('/api/crm/activities', {
          method: 'POST', body: JSON.stringify(payload),
        })
      } else {
        await apiFetch(`/api/crm/activities/${modal.id}`, {
          method: 'PUT', body: JSON.stringify(payload),
        })
      }

      setModal(null)
      loadCalendar()
      if (viewMode === 'workweek') loadWorkWeek()
      if (selectedDate) loadDayActivities(selectedDate)
      loadReminders()
    } catch (e) {
      setError(e.error || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  async function completeActivity(id) {
    try {
      await apiFetch(`/api/crm/activities/${id}/complete`, { method: 'POST' })
      if (selectedDate) loadDayActivities(selectedDate)
      loadCalendar()
      if (viewMode === 'workweek') loadWorkWeek()
      loadReminders()
    } catch {}
  }

  async function deleteActivity(id) {
    if (!confirm('Удалить активность?')) return
    try {
      await apiFetch(`/api/crm/activities/${id}`, { method: 'DELETE' })
      if (selectedDate) loadDayActivities(selectedDate)
      loadCalendar()
      if (viewMode === 'workweek') loadWorkWeek()
      loadReminders()
    } catch {}
  }

  async function cancelActivity(id) {
    try {
      await apiFetch(`/api/crm/activities/${id}`, {
        method: 'PUT', body: JSON.stringify({ status: 'canceled' }),
      })
      if (selectedDate) loadDayActivities(selectedDate)
      loadCalendar()
      if (viewMode === 'workweek') loadWorkWeek()
      loadReminders()
    } catch {}
  }

  async function dismissReminders() {
    const ids = reminders.filter(r => !r.reminder_sent).map(r => r.id)
    if (!ids.length) return
    try {
      await apiFetch('/api/crm/activities/reminders/mark-sent', {
        method: 'POST', body: JSON.stringify({ activity_ids: ids }),
      })
      loadReminders()
    } catch {}
  }

  const calendarCells = buildCalendarCells(year, month, calendarData)
  const todayStr = formatLocalDate(new Date())

  const weekDates = viewMode === 'workweek' ? getWeekDates(weekStart) : []
  const weekRangeLabel = weekDates.length >= 7 ? (() => {
    const from = new Date(weekDates[0] + 'T12:00:00')
    const to = new Date(weekDates[6] + 'T12:00:00')
    if (from.getMonth() === to.getMonth()) {
      return `${from.getDate()} – ${to.getDate()} ${MONTH_NAMES_GEN[from.getMonth()]} ${from.getFullYear()}`
    }
    return `${from.getDate()} ${MONTH_NAMES_GEN[from.getMonth()]} – ${to.getDate()} ${MONTH_NAMES_GEN[to.getMonth()]} ${from.getFullYear()}`
  })() : ''
  const isCurrentWeek = weekDates.includes(todayStr)
  const weekTotalCount = weekDates.reduce((s, d) => s + (weekData[d] || []).length, 0)
  const weekPlannedCount = weekDates.reduce((s, d) => s + (weekData[d] || []).filter(a => a.status === 'planned').length, 0)
  const weekCompletedCount = weekDates.reduce((s, d) => s + (weekData[d] || []).filter(a => a.status === 'completed').length, 0)
  const weekCanceledCount = weekDates.reduce((s, d) => s + (weekData[d] || []).filter(a => a.status === 'canceled').length, 0)
  const maxDayCount = Math.max(...weekDates.map(d => (weekData[d] || []).length), 1)
  const weekTimedActivities = weekDates.flatMap(d => weekData[d] || [])
  const weekTimeRange = getVisibleWeekTimeRange(workHours, weekTimedActivities)

  useLayoutEffect(() => {
    if (viewMode === 'workweek' && weekBodyRef.current && !weekLoading) {
      const gridHeight = (weekTimeRange.end - weekTimeRange.start) * HOUR_H
      const weekBody = weekBodyRef.current
      weekBody.scrollTop = getWorkWeekScrollTop(
        workHours, weekTimeRange, weekBody.clientHeight, gridHeight,
      )
      if (calendarRootRef.current) {
        const top = window.scrollY + calendarRootRef.current.getBoundingClientRect().top - 12
        window.scrollTo({ top: Math.max(0, top), behavior: 'auto' })
      }
    }
  }, [viewMode, weekLoading, workHours.start, weekTimeRange.start, weekTimeRange.end])

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return
    setToolbarHost(document.getElementById('crm-calendar-toolbar-slot'))
  }, [])

  const calendarToolbar = (
    <div className="crm-calendar-toolbar">
      <div className="crm-calendar-view-switch-wrap" data-tooltip="Переключение режимов отображения Месяц/Неделя">
        <button
          type="button"
          className={`crm-calendar-view-switch${viewMode === 'workweek' ? ' is-week' : ''}`}
          role="switch"
          aria-checked={viewMode === 'workweek'}
          aria-label={`Переключение режимов отображения Месяц/Неделя. Сейчас: ${viewMode === 'month' ? 'Месяц' : 'Неделя'}`}
          title="Переключение режимов отображения Месяц/Неделя"
          onClick={() => switchView(viewMode === 'month' ? 'workweek' : 'month')}
        >
          <span className="crm-calendar-view-switch-thumb" aria-hidden="true" />
          <span className="crm-calendar-view-switch-label">Месяц</span>
          <span className="crm-calendar-view-switch-label">Неделя</span>
        </button>
      </div>

      <div className="crm-calendar-tool-group crm-calendar-period-nav" aria-label="Период календаря">
        <button className="crm-calendar-icon-btn" onClick={viewMode === 'month' ? prevMonth : prevWeek} title="Назад" aria-label="Назад">
          <ChevronLeft size={16} />
        </button>
        {viewMode === 'month' ? (
          <button
            type="button"
            className="crm-calendar-period-label crm-calendar-period-label--button"
            onClick={openMonthPicker}
            title="Выбрать месяц"
            aria-label={`Выбрать месяц, сейчас ${MONTH_NAMES[month - 1]} ${year}`}
          >
            <Calendar size={14} />
            <span>{MONTH_NAMES[month - 1]} {year}</span>
            <ChevronDown size={14} />
          </button>
        ) : (
          <span className="crm-calendar-period-label">{weekRangeLabel}</span>
        )}
        <button className="crm-calendar-icon-btn" onClick={viewMode === 'month' ? nextMonth : nextWeek} title="Вперёд" aria-label="Вперёд">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="crm-calendar-tool-group crm-calendar-tool-group--actions" aria-label="Действия календаря">
        <button className="btn-secondary btn-sm" onClick={goToday}>
          <Calendar size={14} /> {viewMode === 'month' ? 'Сегодня' : 'Эта неделя'}
        </button>
        <button className="btn-primary-sm crm-calendar-add-btn" onClick={() => openAddModal(selectedDate || todayStr)}>
          <Plus size={13} /> Активность
        </button>
      </div>
    </div>
  )

  return (
    <>
    {toolbarHost && createPortal(calendarToolbar, toolbarHost)}
    <div ref={calendarRootRef} style={{ padding: '16px 32px 24px' }}>
      {reminderCount > 0 && (
        <div style={{
          background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 8,
          padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Bell size={20} color="#d97706" />
          <div style={{ flex: 1 }}>
            <strong>Напоминания на сегодня ({reminderCount})</strong>
            <span style={{ marginLeft: 8, color: '#92400e', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => setShowReminders(!showReminders)}>
              {showReminders ? 'Скрыть' : 'Показать'}
            </span>
          </div>
          <button className="btn-secondary btn-sm" onClick={dismissReminders} title="Отметить прочитанными">
            <Check size={14} /> Прочитано
          </button>
        </div>
      )}

      {showReminders && reminders.length > 0 && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8,
          padding: 12, marginBottom: 16,
        }}>
          {reminders.map(r => {
            const ti = getTypeInfo(r.activity_type)
            return (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
                borderBottom: '1px solid #fde68a',
              }}>
                <ti.icon size={14} color={ti.color} />
                <span style={{ flex: 1 }}>
                  <strong>{r.title}</strong>
                  {r.customer_name && <span style={{ color: '#6b7280' }}> — {r.customer_name}</span>}
                  {r.planned_time && <span style={{ color: '#92400e', marginLeft: 8 }}>
                    <Clock size={12} style={{ verticalAlign: -2 }} /> {r.planned_time.slice(0, 5)}
                  </span>}
                </span>
                <button className="btn-sm" style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
                  onClick={() => completeActivity(r.id)} title="Завершить">
                  <Check size={12} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {viewMode === 'month' && (
        <CalendarMonthView
          loading={loading}
          calendarCells={calendarCells}
          todayStr={todayStr}
          selectedDate={selectedDate}
          onSelectDay={loadDayActivities}
          onAddActivity={openAddModal}
          onEditActivity={openEditModal}
        />
      )}

      {viewMode === 'workweek' && (
        <CalendarWeekView
          weekLoading={weekLoading}
          weekDates={weekDates}
          weekData={weekData}
          todayStr={todayStr}
          weekTimeRange={weekTimeRange}
          maxDayCount={maxDayCount}
          weekTotalCount={weekTotalCount}
          weekPlannedCount={weekPlannedCount}
          weekCompletedCount={weekCompletedCount}
          weekCanceledCount={weekCanceledCount}
          isCurrentWeek={isCurrentWeek}
          weekBodyRef={weekBodyRef}
          onSelectDay={loadDayActivities}
          onAddActivity={openAddModal}
          onEditActivity={openEditModal}
        />
      )}

      <CalendarDayView
        selectedDate={selectedDate}
        dayLoading={dayLoading}
        dayActivities={dayActivities}
        onComplete={completeActivity}
        onCancel={cancelActivity}
        onDelete={deleteActivity}
        onEdit={openEditModal}
      />

      <CalendarActivityModal
        modal={modal}
        form={form}
        setForm={setForm}
        saving={saving}
        error={error}
        customers={customers}
        services={services}
        orders={orders}
        employees={employees}
        bookingAvailable={bookingAvailable}
        crmMode={crmMode}
        onSave={saveActivity}
        onClose={() => setModal(null)}
      />

      {monthPickerOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setMonthPickerOpen(false)}>
          <div className="modal-box crm-month-picker-modal">
            <div className="modal-header">
              <h2>Выбор месяца</h2>
              <button className="modal-close" onClick={() => setMonthPickerOpen(false)}><X size={18} /></button>
            </div>
            <div className="crm-month-picker-year">
              <button className="btn-secondary btn-sm" onClick={() => setMonthPickerYear(y => y - 1)} title="Предыдущий год">
                <ChevronLeft size={16} />
              </button>
              <strong>{monthPickerYear}</strong>
              <button className="btn-secondary btn-sm" onClick={() => setMonthPickerYear(y => y + 1)} title="Следующий год">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="crm-month-picker-grid">
              {MONTH_NAMES.map((name, idx) => {
                const monthValue = idx + 1
                const isSelectedMonth = monthValue === month && monthPickerYear === year
                return (
                  <button
                    type="button"
                    key={name}
                    className={isSelectedMonth ? 'active' : ''}
                    onClick={() => chooseMonth(monthValue)}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

function buildCalendarCells(year, month, data) {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const startDow = (firstDay.getDay() + 6) % 7
  const daysInMonth = lastDay.getDate()

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const prevDays = new Date(prevYear, prevMonth, 0).getDate()

  const cells = []

  for (let i = startDow - 1; i >= 0; i--) {
    const d = prevDays - i
    const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, date: dateStr, inMonth: false, activities: data[dateStr] || [] })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, date: dateStr, inMonth: true, activities: data[dateStr] || [] })
  }

  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    for (let d = 1; d <= remaining; d++) {
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      cells.push({ day: d, date: dateStr, inMonth: false, activities: data[dateStr] || [] })
    }
  }

  return cells
}
