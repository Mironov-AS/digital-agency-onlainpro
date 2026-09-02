import { useState, useMemo } from 'react'
import {
  Loader2, Download, ChevronDown, ChevronUp,
  Users, Briefcase, UserCog, Calendar, TrendingUp,
  ArrowUpDown, ChevronsUpDown, Clock, DollarSign,
  BarChart2, Hash, Award,
} from 'lucide-react'
import { apiFetch } from '../../api.js'

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

function getMonthRange(year, month) {
  const from = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const last = new Date(year, month + 1, 0).getDate()
  const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(last).padStart(2, '0')}`
  return { from, to }
}

function fmtMoney(v) {
  return Number(v).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' ₽'
}

function fmtDuration(min) {
  if (!min) return '0 мин'
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} мин`
  if (m === 0) return `${h} ч`
  return `${h} ч ${m} мин`
}

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ru-RU')
}

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function pct(val, total) {
  if (!total) return 0
  return Math.round((val / total) * 100)
}

const SORT_OPTIONS = [
  { key: 'price_desc', label: 'По выручке ↓', fn: (a, b) => b.total_price - a.total_price },
  { key: 'price_asc', label: 'По выручке ↑', fn: (a, b) => a.total_price - b.total_price },
  { key: 'count_desc', label: 'По кол-ву работ ↓', fn: (a, b) => b.work_count - a.work_count },
  { key: 'count_asc', label: 'По кол-ву работ ↑', fn: (a, b) => a.work_count - b.work_count },
  { key: 'duration_desc', label: 'По времени ↓', fn: (a, b) => b.total_duration - a.total_duration },
  { key: 'name_asc', label: 'По имени А–Я', fn: (a, b) => (a.employee_name || '').localeCompare(b.employee_name || '', 'ru') },
]

const MEDAL_COLORS = ['#fbbf24', '#94a3b8', '#d97706']

export default function CrmStatEmployees() {
  const now = new Date()
  const [mode, setMode] = useState('month')
  const [month, setMonth] = useState(now.getMonth() === 0 ? 11 : now.getMonth() - 1)
  const [selYear, setSelYear] = useState(now.getFullYear())
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return toISODate(d)
  })
  const [dateTo, setDateTo] = useState(() => toISODate(now))
  const [reportLabel, setReportLabel] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState({})
  const [exporting, setExporting] = useState(false)
  const [sortKey, setSortKey] = useState('price_desc')
  const [detailView, setDetailView] = useState({})

  const sortedEmployees = useMemo(() => {
    if (!data?.employees?.length) return []
    const sortOption = SORT_OPTIONS.find(s => s.key === sortKey) || SORT_OPTIONS[0]
    return [...data.employees].sort(sortOption.fn)
  }, [data, sortKey])

  async function loadReport() {
    let from, to, label
    if (mode === 'month') {
      const range = getMonthRange(selYear, month)
      from = range.from
      to = range.to
      label = `${MONTHS[month]} ${selYear}`
    } else {
      if (!dateFrom || !dateTo) { alert('Укажите обе даты'); return }
      if (dateFrom > dateTo) { alert('Дата «С» не может быть позже даты «По»'); return }
      from = dateFrom
      to = dateTo
      label = `${fmtDate(dateFrom)} — ${fmtDate(dateTo)}`
    }
    setLoading(true)
    setData(null)
    try {
      const result = await apiFetch(`/api/crm/statistics/employees?from=${from}&to=${to}`)
      setData(result)
      setReportLabel(label)
      setExpanded({})
      setDetailView({})
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    } finally {
      setLoading(false)
    }
  }

  function toggleExpand(empId) {
    setExpanded(prev => ({ ...prev, [empId]: !prev[empId] }))
  }

  function expandAll() {
    const all = {}
    sortedEmployees.forEach(e => { all[e.employee_id] = true })
    setExpanded(all)
  }

  function collapseAll() {
    setExpanded({})
  }

  function toggleDetailView(empId) {
    setDetailView(prev => ({ ...prev, [empId]: prev[empId] === 'records' ? 'summary' : 'records' }))
  }

  async function exportExcel() {
    if (!data?.employees?.length) return
    setExporting(true)
    try {
      const XLSX = await import('xlsx')

      const summaryRows = []
      sortedEmployees.forEach((emp, idx) => {
        summaryRows.push({
          '№': idx + 1,
          'Сотрудник': emp.employee_name,
          'Должность': emp.employee_position || '',
          'Кол-во работ': emp.work_count,
          'Время (мин)': emp.total_duration,
          'Время (ч)': +(emp.total_duration / 60).toFixed(1),
          'Сумма (₽)': +emp.total_price.toFixed(2),
          'Средняя цена работы (₽)': emp.work_count ? +(emp.total_price / emp.work_count).toFixed(2) : 0,
          'Средняя длит. (мин)': emp.work_count ? Math.round(emp.total_duration / emp.work_count) : 0,
          'Доля выручки (%)': pct(emp.total_price, data.grand_total),
        })
      })
      summaryRows.push({
        '№': '',
        'Сотрудник': 'ИТОГО',
        'Должность': '',
        'Кол-во работ': data.grand_count,
        'Время (мин)': data.grand_duration,
        'Время (ч)': +(data.grand_duration / 60).toFixed(1),
        'Сумма (₽)': +data.grand_total.toFixed(2),
        'Средняя цена работы (₽)': data.grand_count ? +(data.grand_total / data.grand_count).toFixed(2) : 0,
        'Средняя длит. (мин)': data.grand_count ? Math.round(data.grand_duration / data.grand_count) : 0,
        'Доля выручки (%)': 100,
      })

      const detailRows = []
      let rowNum = 0
      for (const emp of sortedEmployees) {
        const sorted = [...emp.records].sort((a, b) => (a.performed_at || '').localeCompare(b.performed_at || ''))
        for (const rec of sorted) {
          rowNum++
          detailRows.push({
            '№': rowNum,
            'Сотрудник': emp.employee_name,
            'Должность': emp.employee_position || '',
            'Дата': fmtDate(rec.performed_at),
            'Услуга': rec.service_name || '—',
            'Клиент': rec.customer_name || '—',
            'Время (мин)': rec.duration,
            'Сумма (₽)': +Number(rec.price).toFixed(2),
            'Комментарий': rec.comment || '',
          })
        }
        detailRows.push({
          '№': '',
          'Сотрудник': `ИТОГО: ${emp.employee_name}`,
          'Должность': '',
          'Дата': '',
          'Услуга': `${emp.work_count} работ`,
          'Клиент': '',
          'Время (мин)': emp.total_duration,
          'Сумма (₽)': +emp.total_price.toFixed(2),
          'Комментарий': '',
        })
      }
      detailRows.push({
        '№': '',
        'Сотрудник': 'ОБЩИЙ ИТОГ',
        'Должность': '',
        'Дата': '',
        'Услуга': `${data.grand_count} работ`,
        'Клиент': '',
        'Время (мин)': data.grand_duration,
        'Сумма (₽)': +data.grand_total.toFixed(2),
        'Комментарий': '',
      })

      const svcRows = []
      for (const emp of sortedEmployees) {
        for (const svc of emp.services) {
          svcRows.push({
            'Сотрудник': emp.employee_name,
            'Услуга': svc.name,
            'Кол-во': svc.count,
            'Время (мин)': svc.duration,
            'Сумма (₽)': +svc.total.toFixed(2),
          })
        }
      }

      const custRows = []
      for (const emp of sortedEmployees) {
        for (const cust of emp.customers) {
          custRows.push({
            'Сотрудник': emp.employee_name,
            'Клиент': cust.name,
            'Кол-во работ': cust.count,
            'Сумма (₽)': +cust.total.toFixed(2),
          })
        }
      }

      const wb = XLSX.utils.book_new()

      const infoRows = [
        ['Отчёт: Статистика по сотрудникам'],
        [`Период: ${reportLabel}`],
        [`Сформировано: ${new Date().toLocaleString('ru-RU')}`],
        [],
      ]
      const ws1 = XLSX.utils.aoa_to_sheet(infoRows)
      XLSX.utils.sheet_add_json(ws1, summaryRows, { origin: 'A5' })
      ws1['!cols'] = [
        { wch: 4 }, { wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 14 },
        { wch: 10 }, { wch: 14 }, { wch: 20 }, { wch: 18 }, { wch: 16 },
      ]
      XLSX.utils.book_append_sheet(wb, ws1, 'Сводка по сотрудникам')

      const ws2Info = [
        ['Детализация выполненных работ'],
        [`Период: ${reportLabel}`],
        [],
      ]
      const ws2 = XLSX.utils.aoa_to_sheet(ws2Info)
      XLSX.utils.sheet_add_json(ws2, detailRows, { origin: 'A4' })
      ws2['!cols'] = [
        { wch: 4 }, { wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 30 },
        { wch: 30 }, { wch: 12 }, { wch: 14 }, { wch: 40 },
      ]
      XLSX.utils.book_append_sheet(wb, ws2, 'Детализация работ')

      const ws3 = XLSX.utils.json_to_sheet(svcRows)
      ws3['!cols'] = [{ wch: 30 }, { wch: 30 }, { wch: 10 }, { wch: 12 }, { wch: 14 }]
      XLSX.utils.book_append_sheet(wb, ws3, 'По услугам')

      const ws4 = XLSX.utils.json_to_sheet(custRows)
      ws4['!cols'] = [{ wch: 30 }, { wch: 30 }, { wch: 12 }, { wch: 14 }]
      XLSX.utils.book_append_sheet(wb, ws4, 'По клиентам')

      const safeName = reportLabel.replace(/[\/\\?*\[\]:]/g, '-')
      XLSX.writeFile(wb, `Статистика_сотрудники_${safeName}.xlsx`)
    } catch (e) {
      alert('Ошибка экспорта: ' + e.message)
    } finally {
      setExporting(false)
    }
  }

  const maxPrice = sortedEmployees.length > 0 ? Math.max(...sortedEmployees.map(e => e.total_price)) : 0
  const avgPricePerWork = data?.grand_count ? data.grand_total / data.grand_count : 0
  const avgDurationPerWork = data?.grand_count ? data.grand_duration / data.grand_count : 0

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
          <UserCog size={16} style={{ verticalAlign: -2, marginRight: 6 }} />
          Статистика по сотрудникам
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
          Детальный отчёт о выполненных работах для расчёта заработной платы
        </p>
      </div>

      {/* Period selector */}
      <div className="stat-period-panel">
        <div style={{ display: 'flex', gap: 0, marginBottom: 14 }}>
          {[{ key: 'month', label: 'За месяц' }, { key: 'range', label: 'Произвольный период' }].map(t => (
            <button key={t.key} onClick={() => setMode(t.key)}
              className={`stat-period-btn ${mode === t.key ? 'active' : ''}`}
              style={{ borderRadius: t.key === 'month' ? '8px 0 0 8px' : '0 8px 8px 0' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {mode === 'month' ? (
            <>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                  <Calendar size={12} style={{ verticalAlign: -1, marginRight: 4 }} />Месяц
                </label>
                <select className="field" value={month} onChange={e => setMonth(Number(e.target.value))}
                  style={{ minWidth: 150 }} autoComplete="off">
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Год</label>
                <select className="field" value={selYear} onChange={e => setSelYear(Number(e.target.value))}
                  style={{ minWidth: 100 }} autoComplete="off">
                  {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y =>
                    <option key={y} value={y}>{y}</option>
                  )}
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                  <Calendar size={12} style={{ verticalAlign: -1, marginRight: 4 }} />С
                </label>
                <input type="date" className="field" value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)} style={{ minWidth: 160 }} autoComplete="off" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                  <Calendar size={12} style={{ verticalAlign: -1, marginRight: 4 }} />По
                </label>
                <input type="date" className="field" value={dateTo}
                  onChange={e => setDateTo(e.target.value)} style={{ minWidth: 160 }} autoComplete="off" />
              </div>
            </>
          )}

          <button className="btn-primary" onClick={loadReport} disabled={loading} style={{ height: 38 }}>
            {loading ? <Loader2 size={14} className="spin" /> : <BarChart2 size={14} />}
            Сформировать
          </button>

          {data?.employees?.length > 0 && (
            <button className="btn-save" onClick={exportExcel} disabled={exporting}
              style={{ height: 38, marginLeft: 'auto' }}>
              {exporting ? <Loader2 size={14} className="spin" /> : <Download size={14} />}
              Выгрузить в Excel
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="loading-center"><Loader2 size={28} className="spin" /></div>
      )}

      {data && !loading && (
        <>
          {/* Report header */}
          {reportLabel && (
            <div className="stat-report-label">
              <Calendar size={14} />
              <span>Отчётный период: <strong>{reportLabel}</strong></span>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af' }}>
                Сформировано: {new Date().toLocaleString('ru-RU')}
              </span>
            </div>
          )}

          {/* KPI cards */}
          <div className="stat-kpi-grid">
            <div className="stat-kpi-card">
              <div className="stat-kpi-icon" style={{ background: '#1e40af' }}><DollarSign size={20} /></div>
              <div>
                <div className="stat-kpi-label">Общая выручка</div>
                <div className="stat-kpi-value">{fmtMoney(data.grand_total)}</div>
              </div>
            </div>
            <div className="stat-kpi-card">
              <div className="stat-kpi-icon" style={{ background: '#059669' }}><Hash size={20} /></div>
              <div>
                <div className="stat-kpi-label">Всего работ</div>
                <div className="stat-kpi-value">{data.grand_count}</div>
              </div>
            </div>
            <div className="stat-kpi-card">
              <div className="stat-kpi-icon" style={{ background: '#7c3aed' }}><Clock size={20} /></div>
              <div>
                <div className="stat-kpi-label">Общее время</div>
                <div className="stat-kpi-value">{fmtDuration(data.grand_duration)}</div>
              </div>
            </div>
            <div className="stat-kpi-card">
              <div className="stat-kpi-icon" style={{ background: '#0891b2' }}><TrendingUp size={20} /></div>
              <div>
                <div className="stat-kpi-label">Средняя цена работы</div>
                <div className="stat-kpi-value">{fmtMoney(avgPricePerWork)}</div>
              </div>
            </div>
            <div className="stat-kpi-card">
              <div className="stat-kpi-icon" style={{ background: '#ea580c' }}><Users size={20} /></div>
              <div>
                <div className="stat-kpi-label">Сотрудников</div>
                <div className="stat-kpi-value">{data.employees.length}</div>
              </div>
            </div>
            <div className="stat-kpi-card">
              <div className="stat-kpi-icon" style={{ background: '#be185d' }}><Clock size={20} /></div>
              <div>
                <div className="stat-kpi-label">Ср. длительность</div>
                <div className="stat-kpi-value">{fmtDuration(Math.round(avgDurationPerWork))}</div>
              </div>
            </div>
          </div>

          {data.employees.length === 0 ? (
            <div className="empty-state">
              <Users size={32} style={{ color: '#d1d5db', marginBottom: 8 }} />
              <p>Нет данных за выбранный период</p>
            </div>
          ) : (
            <>
              {/* Toolbar: sort + expand/collapse */}
              <div className="stat-toolbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ArrowUpDown size={14} style={{ color: '#6b7280' }} />
                  <select className="field" value={sortKey} onChange={e => setSortKey(e.target.value)}
                    style={{ minWidth: 180, height: 34, fontSize: 13 }} autoComplete="off">
                    {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-secondary btn-sm" onClick={expandAll}>
                    <ChevronsUpDown size={13} /> Развернуть все
                  </button>
                  <button className="btn-secondary btn-sm" onClick={collapseAll}>
                    Свернуть все
                  </button>
                </div>
              </div>

              {/* Employee cards */}
              <div style={{ display: 'grid', gap: 12 }}>
                {sortedEmployees.map((emp, idx) => {
                  const isOpen = expanded[emp.employee_id]
                  const sharePercent = pct(emp.total_price, data.grand_total)
                  const barWidth = maxPrice > 0 ? (emp.total_price / maxPrice) * 100 : 0
                  const empAvgPrice = emp.work_count ? emp.total_price / emp.work_count : 0
                  const empAvgDuration = emp.work_count ? emp.total_duration / emp.work_count : 0
                  const isTop3 = idx < 3 && sortedEmployees.length > 3
                  const viewMode = detailView[emp.employee_id] || 'summary'
                  const sortedRecords = [...emp.records].sort((a, b) =>
                    (a.performed_at || '').localeCompare(b.performed_at || ''))

                  return (
                    <div key={emp.employee_id || 'none'} className={`stat-emp-card${isOpen ? ' is-open' : ''}`}>
                      {/* Header row */}
                      <div className="stat-emp-header" onClick={() => toggleExpand(emp.employee_id)}>
                        <div className="stat-emp-rank">
                          {isTop3 && sortKey === 'price_desc' ? (
                            <Award size={20} style={{ color: MEDAL_COLORS[idx] }} />
                          ) : (
                            <span className="stat-emp-rank-num">{idx + 1}</span>
                          )}
                        </div>
                        <div className="stat-emp-avatar">
                          <UserCog size={18} />
                        </div>
                        <div className="stat-emp-info">
                          <div className="stat-emp-name">{emp.employee_name}</div>
                          {emp.employee_position && (
                            <div className="stat-emp-position">{emp.employee_position}</div>
                          )}
                        </div>
                        <div className="stat-emp-metrics">
                          <div className="stat-emp-metric">
                            <span className="stat-emp-metric-val">{emp.work_count}</span>
                            <span className="stat-emp-metric-lbl">работ</span>
                          </div>
                          <div className="stat-emp-metric">
                            <span className="stat-emp-metric-val">{fmtDuration(emp.total_duration)}</span>
                            <span className="stat-emp-metric-lbl">время</span>
                          </div>
                          <div className="stat-emp-metric stat-emp-metric--primary">
                            <span className="stat-emp-metric-val">{fmtMoney(emp.total_price)}</span>
                            <span className="stat-emp-metric-lbl">{sharePercent}% от общей</span>
                          </div>
                        </div>
                        <div className="stat-emp-chevron">
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>

                      {/* Revenue bar */}
                      <div className="stat-emp-bar-wrap">
                        <div className="stat-emp-bar" style={{ width: `${barWidth}%` }} />
                      </div>

                      {/* Expanded content */}
                      {isOpen && (
                        <div className="stat-emp-body">
                          {/* Mini KPIs */}
                          <div className="stat-emp-mini-kpis">
                            <div className="stat-mini-kpi">
                              <div className="stat-mini-kpi-val">{fmtMoney(empAvgPrice)}</div>
                              <div className="stat-mini-kpi-lbl">Ср. стоимость работы</div>
                            </div>
                            <div className="stat-mini-kpi">
                              <div className="stat-mini-kpi-val">{fmtDuration(Math.round(empAvgDuration))}</div>
                              <div className="stat-mini-kpi-lbl">Ср. длительность</div>
                            </div>
                            <div className="stat-mini-kpi">
                              <div className="stat-mini-kpi-val">{sharePercent}%</div>
                              <div className="stat-mini-kpi-lbl">Доля выручки</div>
                            </div>
                            <div className="stat-mini-kpi">
                              <div className="stat-mini-kpi-val">{emp.services?.length || 0}</div>
                              <div className="stat-mini-kpi-lbl">Видов услуг</div>
                            </div>
                            <div className="stat-mini-kpi">
                              <div className="stat-mini-kpi-val">{emp.customers?.length || 0}</div>
                              <div className="stat-mini-kpi-lbl">Клиентов</div>
                            </div>
                          </div>

                          {/* View mode toggle */}
                          <div className="stat-emp-view-toggle">
                            <button className={viewMode === 'summary' ? 'active' : ''}
                              onClick={() => setDetailView(p => ({ ...p, [emp.employee_id]: 'summary' }))}>
                              <Briefcase size={13} /> Сводка по услугам / клиентам
                            </button>
                            <button className={viewMode === 'records' ? 'active' : ''}
                              onClick={() => setDetailView(p => ({ ...p, [emp.employee_id]: 'records' }))}>
                              <BarChart2 size={13} /> Полная детализация ({emp.work_count})
                            </button>
                          </div>

                          {viewMode === 'summary' && (
                            <div className="stat-emp-summary-grid">
                              {/* By services */}
                              <div className="stat-emp-summary-col">
                                <div className="stat-emp-summary-title">
                                  <Briefcase size={13} /> По услугам
                                </div>
                                {emp.services.length === 0 ? (
                                  <div style={{ fontSize: 13, color: '#9ca3af', padding: 8 }}>Нет данных</div>
                                ) : emp.services.map((s, i) => {
                                  const svcPct = pct(s.total, emp.total_price)
                                  return (
                                    <div key={i} className="stat-summary-row">
                                      <div className="stat-summary-row-info">
                                        <span className="stat-summary-row-name">{s.name}</span>
                                        <span className="stat-summary-row-count">{s.count} шт · {fmtDuration(s.duration)}</span>
                                      </div>
                                      <div className="stat-summary-row-right">
                                        <span className="stat-summary-row-money">{fmtMoney(s.total)}</span>
                                        <div className="stat-summary-mini-bar">
                                          <div style={{ width: `${svcPct}%`, background: '#3b82f6' }} />
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              {/* By clients */}
                              <div className="stat-emp-summary-col">
                                <div className="stat-emp-summary-title">
                                  <Users size={13} /> По клиентам
                                </div>
                                {emp.customers.length === 0 ? (
                                  <div style={{ fontSize: 13, color: '#9ca3af', padding: 8 }}>Нет данных</div>
                                ) : emp.customers.map((c, i) => {
                                  const custPct = pct(c.total, emp.total_price)
                                  return (
                                    <div key={i} className="stat-summary-row">
                                      <div className="stat-summary-row-info">
                                        <span className="stat-summary-row-name">{c.name}</span>
                                        <span className="stat-summary-row-count">{c.count} работ</span>
                                      </div>
                                      <div className="stat-summary-row-right">
                                        <span className="stat-summary-row-money">{fmtMoney(c.total)}</span>
                                        <div className="stat-summary-mini-bar">
                                          <div style={{ width: `${custPct}%`, background: '#8b5cf6' }} />
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {viewMode === 'records' && (
                            <div className="stat-records-table-wrap">
                              <table className="data-table stat-records-table">
                                <thead>
                                  <tr>
                                    <th style={{ width: 32 }}>№</th>
                                    <th>Дата</th>
                                    <th>Услуга</th>
                                    <th>Клиент</th>
                                    <th style={{ width: 90 }}>Время</th>
                                    <th style={{ width: 120, textAlign: 'right' }}>Сумма</th>
                                    <th>Комментарий</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sortedRecords.map((r, i) => (
                                    <tr key={i}>
                                      <td style={{ color: '#9ca3af', fontSize: 12 }}>{i + 1}</td>
                                      <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(r.performed_at)}</td>
                                      <td>{r.service_name || '—'}</td>
                                      <td>{r.customer_name || '—'}</td>
                                      <td>{fmtDuration(r.duration)}</td>
                                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right' }}>
                                        {r.price > 0 ? fmtMoney(r.price) : '—'}
                                      </td>
                                      <td className="stat-records-comment">{r.comment || ''}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="stat-records-total-row">
                                    <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>
                                      Итого по {emp.employee_name}:
                                    </td>
                                    <td style={{ fontWeight: 700 }}>{fmtDuration(emp.total_duration)}</td>
                                    <td style={{ fontWeight: 700, textAlign: 'right' }}>{fmtMoney(emp.total_price)}</td>
                                    <td style={{ color: '#6b7280', fontSize: 12 }}>{emp.work_count} работ</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Grand total footer */}
              <div className="stat-grand-total">
                <div className="stat-grand-total-label">ОБЩИЙ ИТОГ</div>
                <div className="stat-grand-total-metrics">
                  <div>
                    <div className="stat-grand-val">{data.employees.length}</div>
                    <div className="stat-grand-lbl">Сотрудников</div>
                  </div>
                  <div>
                    <div className="stat-grand-val">{data.grand_count}</div>
                    <div className="stat-grand-lbl">Работ</div>
                  </div>
                  <div>
                    <div className="stat-grand-val">{fmtDuration(data.grand_duration)}</div>
                    <div className="stat-grand-lbl">Время</div>
                  </div>
                  <div>
                    <div className="stat-grand-val stat-grand-val--accent">{fmtMoney(data.grand_total)}</div>
                    <div className="stat-grand-lbl">Выручка</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
