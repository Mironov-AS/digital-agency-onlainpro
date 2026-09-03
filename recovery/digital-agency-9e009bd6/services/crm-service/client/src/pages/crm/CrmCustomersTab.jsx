import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Trash2, X, Check, Loader2, Search, Download,
  Edit2, ChevronLeft, ChevronRight, Clock, Filter, Save, BookOpen,
  ChevronDown, ChevronUp, UserCheck, Link, AlertTriangle, ShoppingCart,
} from 'lucide-react'
import { apiFetch } from '../../api.js'
import CustomerMatchModals, { SelfRegBadge, MatchScoreBadge } from './CustomerMatchModals'

const FIELD_TYPE_LABELS = {
  text: 'Текст', number: 'Число', phone: 'Телефон',
  email: 'E-mail', date: 'Дата', list: 'Список', checkbox: 'Чекбокс',
}

const STANDARD_FIELDS = [
  { value: 'full_name', label: 'ФИО', type: 'text' },
  { value: 'phone', label: 'Телефон', type: 'text' },
  { value: 'email', label: 'E-mail', type: 'text' },
  { value: 'additional_contacts', label: 'Доп. контакты', type: 'text' },
  { value: 'notes', label: 'Примечания', type: 'text' },
  { value: 'created_at', label: 'Дата создания', type: 'date' },
]

function getOperatorsForType(type) {
  switch (type) {
    case 'text': case 'phone': case 'email':
      return [
        { value: 'contains', label: 'Содержит' },
        { value: 'equals', label: 'Равно' },
        { value: 'starts_with', label: 'Начинается с' },
        { value: 'not_empty', label: 'Не пусто' },
        { value: 'is_empty', label: 'Пусто' },
      ]
    case 'number':
      return [
        { value: 'equals', label: 'Равно' },
        { value: 'gt', label: 'Больше' },
        { value: 'lt', label: 'Меньше' },
        { value: 'not_empty', label: 'Не пусто' },
        { value: 'is_empty', label: 'Пусто' },
      ]
    case 'date':
      return [
        { value: 'equals', label: 'Равно' },
        { value: 'gt', label: 'После' },
        { value: 'lt', label: 'До' },
        { value: 'range', label: 'Диапазон' },
      ]
    case 'list':
      return [
        { value: 'equals', label: 'Равно' },
        { value: 'not_empty', label: 'Не пусто' },
        { value: 'is_empty', label: 'Пусто' },
      ]
    case 'checkbox':
      return [
        { value: 'equals', label: 'Равно' },
      ]
    default:
      return [{ value: 'contains', label: 'Содержит' }]
  }
}

function emptyCondition() {
  return { field: 'full_name', operator: 'contains', value: '', value_from: '', value_to: '' }
}

function renderCustomFieldInput(field, value, onChange) {
  if (!field) return null
  switch (field.field_type) {
    case 'checkbox':
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={value === 'true' || value === true}
            onChange={e => onChange(String(e.target.checked))} />
          {field.name}
        </label>
      )
    case 'date':
      return <input className="field" type="date" value={value || ''} onChange={e => onChange(e.target.value)} autoComplete="off" />
    case 'number':
      return <input className="field" type="number" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.name} autoComplete="off" />
    case 'list':
      return (
        <select className="field" value={value || ''} onChange={e => onChange(e.target.value)} autoComplete="off">
          <option value="">— Выберите —</option>
          {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      )
    case 'email':
      return <input className="field" type="email" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.name} autoComplete="off" />
    default:
      return <input className="field" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.name} autoComplete="off" />
  }
}


export default function CrmCustomersTab() {
  const [customers, setCustomers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', additional_contacts: '', notes: '', custom_values: {} })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState(null)
  const [history, setHistory] = useState([])
  const [ordersHistory, setOrdersHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const [customFields, setCustomFields] = useState([])
  const [displayColumns, setDisplayColumns] = useState(['full_name', 'phone', 'email', 'created_at'])
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [conditions, setConditions] = useState([emptyCondition()])
  const [logic, setLogic] = useState('and')
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false)

  const [templates, setTemplates] = useState([])
  const [templateName, setTemplateName] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)

  const [selfRegCount, setSelfRegCount] = useState(0)
  const [selfRegOnly, setSelfRegOnly] = useState(false)

  const [matchModal, setMatchModal] = useState(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchResults, setMatchResults] = useState(null)
  const [linking, setLinking] = useState(false)
  const [noMatchConfirm, setNoMatchConfirm] = useState(null)

  const limit = 30

  useEffect(() => {
    apiFetch('/api/crm/custom-fields').then(data => {
      setCustomFields(Array.isArray(data) ? data.filter(f => !f.is_deleted) : [])
    }).catch(() => {})
    apiFetch('/api/crm/search-templates').then(data => {
      setTemplates(Array.isArray(data) ? data : [])
    }).catch(() => {})
    apiFetch('/api/crm/display-settings').then(data => {
      if (data?.columns) setDisplayColumns(data.columns)
    }).catch(() => {})
    loadSelfRegCount()
  }, [])

  function loadSelfRegCount() {
    apiFetch('/api/crm/customers/self-registered/count').then(data => {
      setSelfRegCount(data?.count || 0)
    }).catch(() => {})
  }

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    try {
      if (isAdvancedSearch) {
        const validConditions = conditions.filter(c =>
          c.field && c.operator &&
          !['not_empty', 'is_empty'].includes(c.operator) ? c.value : true
        )
        const data = await apiFetch('/api/crm/customers/search', {
          method: 'POST',
          body: JSON.stringify({ conditions: validConditions, logic, page, limit }),
        })
        setCustomers(data.items || [])
        setTotal(data.total || 0)
      } else {
        const params = new URLSearchParams({ page, limit })
        if (search) params.set('search', search)
        if (selfRegOnly) params.set('self_registered_only', 'true')
        const data = await apiFetch(`/api/crm/customers?${params}`)
        setCustomers(data.items || [])
        setTotal(data.total || 0)
      }
    } catch (e) {
      console.error('[crm] load customers', e)
    } finally {
      setLoading(false)
    }
  }, [page, search, isAdvancedSearch, conditions, logic, selfRegOnly])

  useEffect(() => { loadCustomers() }, [page, selfRegOnly])

  function handleSimpleSearch(e) {
    e.preventDefault()
    setIsAdvancedSearch(false)
    setPage(1)
    loadCustomers()
  }

  function handleAdvancedSearch() {
    setIsAdvancedSearch(true)
    setSelfRegOnly(false)
    setPage(1)
    setTimeout(loadCustomers, 0)
  }

  function resetSearch() {
    setSearch('')
    setConditions([emptyCondition()])
    setLogic('and')
    setIsAdvancedSearch(false)
    setSelfRegOnly(false)
    setPage(1)
    setTimeout(loadCustomers, 0)
  }

  function toggleSelfRegFilter() {
    setSelfRegOnly(prev => !prev)
    setIsAdvancedSearch(false)
    setSearch('')
    setPage(1)
  }

  function updateCondition(idx, updates) {
    setConditions(prev => prev.map((c, i) => {
      if (i !== idx) return c
      const updated = { ...c, ...updates }
      if (updates.field) {
        const allFields = [...STANDARD_FIELDS, ...customFields.map(cf => ({
          value: `cf_${cf.id}`, label: cf.name, type: cf.field_type,
        }))]
        const fieldDef = allFields.find(f => f.value === updates.field)
        const ops = getOperatorsForType(fieldDef?.type || 'text')
        if (!ops.find(o => o.value === updated.operator)) {
          updated.operator = ops[0]?.value || 'contains'
        }
        updated.value = ''
        updated.value_from = ''
        updated.value_to = ''
      }
      return updated
    }))
  }

  function addCondition() {
    setConditions(prev => [...prev, emptyCondition()])
  }

  function removeCondition(idx) {
    setConditions(prev => prev.length <= 1 ? [emptyCondition()] : prev.filter((_, i) => i !== idx))
  }

  async function saveTemplate() {
    if (!templateName.trim()) return
    try {
      const saved = await apiFetch('/api/crm/search-templates', {
        method: 'POST',
        body: JSON.stringify({ name: templateName.trim(), config: { conditions, logic } }),
      })
      setTemplates(prev => [...prev, saved])
      setTemplateName('')
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    }
  }

  function loadTemplate(t) {
    if (t.config?.conditions) setConditions(t.config.conditions)
    if (t.config?.logic) setLogic(t.config.logic)
    setShowTemplates(false)
    setAdvancedOpen(true)
  }

  async function deleteTemplate(id) {
    try {
      await apiFetch(`/api/crm/search-templates/${id}`, { method: 'DELETE' })
      setTemplates(prev => prev.filter(t => t.id !== id))
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    }
  }

  function openAdd() {
    setForm({ full_name: '', phone: '', email: '', additional_contacts: '', notes: '', custom_values: {} })
    setError('')
    setModal('add')
  }

  function openEdit(c) {
    setForm({
      full_name: c.full_name, phone: c.phone, email: c.email || '',
      additional_contacts: c.additional_contacts || '', notes: c.notes || '',
      custom_values: c.custom_values || {},
    })
    setError('')
    setDetail(null)
    setModal(c.id)
  }

  async function openDetail(c) {
    try {
      const full = await apiFetch(`/api/crm/customers/${c.id}`)
      setDetail(full)
    } catch {
      setDetail(c)
    }
    setHistoryLoading(true)
    try {
      const [workData, orderData] = await Promise.all([
        apiFetch(`/api/crm/customers/${c.id}/history`),
        apiFetch(`/api/crm/customers/${c.id}/orders`),
      ])
      setHistory(Array.isArray(workData) ? workData : [])
      setOrdersHistory(Array.isArray(orderData) ? orderData : [])
    } catch {
      setHistory([])
      setOrdersHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  async function handleSave() {
    if (!form.full_name || !form.phone) {
      setError('ФИО и телефон обязательны')
      return
    }
    const requiredMissing = customFields.filter(f => f.is_required && !form.custom_values?.[f.id])
    if (requiredMissing.length) {
      setError(`Заполните обязательные поля: ${requiredMissing.map(f => f.name).join(', ')}`)
      return
    }
    setSaving(true)
    setError('')
    try {
      if (modal === 'add') {
        await apiFetch('/api/crm/customers', { method: 'POST', body: JSON.stringify(form) })
      } else {
        await apiFetch(`/api/crm/customers/${modal}`, { method: 'PUT', body: JSON.stringify(form) })
      }
      setModal(null)
      loadCustomers()
      loadSelfRegCount()
    } catch (e) {
      setError(e.error || e.message || 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Удалить клиента?')) return
    try {
      await apiFetch(`/api/crm/customers/${id}`, { method: 'DELETE' })
      loadCustomers()
      loadSelfRegCount()
      if (detail?.id === id) setDetail(null)
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    }
  }

  async function handleExport() {
    try {
      const res = await fetch('/api/crm/export/customers', { credentials: 'include' })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'customers.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Ошибка экспорта')
    }
  }

  async function openMatchModal(customer) {
    setMatchLoading(true)
    setMatchModal(null)
    setMatchResults(null)
    setNoMatchConfirm(null)
    try {
      const data = await apiFetch(`/api/crm/customers/${customer.id}/find-matches`, { method: 'POST' })
      if (!data.matches || data.matches.length === 0) {
        setMatchLoading(false)
        setNoMatchConfirm(customer)
        return
      }
      setMatchModal(customer)
      setMatchResults(data)
    } catch (e) {
      setMatchModal(customer)
      setMatchResults({ error: e.error || e.message })
    } finally {
      setMatchLoading(false)
    }
  }

  async function handleLinkTo(sourceId, targetId) {
    if (!confirm('Привязать самозапись к этому клиенту? Все работы будут перенесены, самозапись удалена.')) return
    setLinking(true)
    try {
      await apiFetch(`/api/crm/customers/${sourceId}/link-to/${targetId}`, {
        method: 'POST',
        body: JSON.stringify({ merge_data: true }),
      })
      setMatchModal(null)
      setMatchResults(null)
      loadCustomers()
      loadSelfRegCount()
      if (detail?.id === sourceId) setDetail(null)
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    } finally {
      setLinking(false)
    }
  }

  async function handleConfirmSelf(id) {
    try {
      await apiFetch(`/api/crm/customers/${id}/confirm-self`, { method: 'POST' })
      loadCustomers()
      loadSelfRegCount()
      setMatchModal(null)
      if (detail?.id === id) {
        const updated = await apiFetch(`/api/crm/customers/${id}`)
        setDetail(updated)
      }
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    }
  }

  const totalPages = Math.ceil(total / limit) || 1

  const COLUMN_LABELS = {
    full_name: 'ФИО', phone: 'Телефон', email: 'E-mail',
    additional_contacts: 'Доп. контакты', notes: 'Примечания',
    created_at: 'Дата создания',
  }

  function getColumnLabel(col) {
    if (COLUMN_LABELS[col]) return COLUMN_LABELS[col]
    if (col.startsWith('cf_')) {
      const cf = customFields.find(f => f.id === col.slice(3))
      return cf ? cf.name : col
    }
    return col
  }

  function getCellValue(c, col) {
    if (col === 'full_name') return c.full_name
    if (col === 'phone') return c.phone
    if (col === 'email') return c.email || '—'
    if (col === 'additional_contacts') return c.additional_contacts || '—'
    if (col === 'notes') return c.notes || '—'
    if (col === 'created_at') return c.created_at ? new Date(c.created_at).toLocaleDateString('ru-RU') : '—'
    if (col.startsWith('cf_')) {
      const fieldId = col.slice(3)
      const cf = customFields.find(f => f.id === fieldId)
      let val = c.custom_values?.[fieldId] || ''
      if (cf?.field_type === 'checkbox') val = val === 'true' ? 'Да' : val ? 'Нет' : '—'
      if (cf?.field_type === 'date' && val) {
        try { val = new Date(val).toLocaleDateString('ru-RU') } catch {}
      }
      return val || '—'
    }
    return '—'
  }

  function getCellStyle(col) {
    if (col === 'full_name') return { fontWeight: 600, color: '#111827' }
    if (col === 'phone') return { fontFamily: 'monospace', fontSize: 13 }
    if (col === 'created_at') return { color: '#6b7280', fontSize: 12 }
    return { color: '#6b7280', fontSize: 13 }
  }

  const allSearchFields = [
    ...STANDARD_FIELDS,
    ...customFields.map(cf => ({
      value: `cf_${cf.id}`, label: cf.name, type: cf.field_type, options: cf.options,
    })),
  ]

  if (detail) {
    const cv = detail.custom_values || {}
    return (
      <div style={{ padding: '24px 32px' }}>
        <button className="btn-back" onClick={() => setDetail(null)} style={{ marginBottom: 16 }}>
          <ChevronLeft size={16} /> К списку клиентов
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{detail.full_name}</h3>
              {detail.is_self_registered && <SelfRegBadge />}
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                ['Телефон', detail.phone],
                ['E-mail', detail.email],
                ['Доп. контакты', detail.additional_contacts],
                ['Примечания', detail.notes],
                ['Создан', detail.created_at ? new Date(detail.created_at).toLocaleDateString('ru-RU') : ''],
              ].filter(([, v]) => v).map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 14, color: '#111827', marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>

            {customFields.length > 0 && (
              <>
                <div style={{ margin: '16px 0 12px', borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
                    Дополнительные поля
                  </div>
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {customFields.map(cf => {
                    let val = cv[cf.id] || ''
                    if (cf.field_type === 'checkbox') val = val === 'true' ? 'Да' : 'Нет'
                    if (cf.field_type === 'date' && val) {
                      try { val = new Date(val).toLocaleDateString('ru-RU') } catch {}
                    }
                    return (
                      <div key={cf.id}>
                        <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>{cf.name}</div>
                        <div style={{ fontSize: 14, color: val ? '#111827' : '#d1d5db', marginTop: 2 }}>{val || '—'}</div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn-primary-sm" onClick={() => openEdit(detail)}>
                <Edit2 size={14} /> Редактировать
              </button>
              {detail.is_self_registered && (
                <>
                  <button className="btn-primary-sm" onClick={() => openMatchModal(detail)}
                    style={{ background: '#f59e0b', borderColor: '#f59e0b' }}>
                    <Link size={14} /> Найти совпадения
                  </button>
                  <button className="btn-cancel" onClick={() => handleConfirmSelf(detail.id)}
                    style={{ fontSize: 12 }}>
                    <UserCheck size={13} /> Подтвердить как нового
                  </button>
                </>
              )}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700 }}>
              <Clock size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
              История работ
            </h3>
            {historyLoading ? (
              <div className="loading-center"><Loader2 size={20} className="spin" /></div>
            ) : history.length === 0 ? (
              <div style={{ color: '#9ca3af', fontSize: 14 }}>Нет записей</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {history.map(r => (
                  <div key={r.id} style={{ padding: '10px 12px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{r.service_name || 'Без услуги'}</span>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>
                        {r.performed_at ? new Date(r.performed_at).toLocaleDateString('ru-RU') : ''}
                      </span>
                    </div>
                    {r.employee_name && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Исполнитель: {r.employee_name}</div>}
                    {r.price > 0 && <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 2 }}>{Number(r.price).toLocaleString('ru-RU')} ₽</div>}
                    {r.comment && <div style={{ fontSize: 12, color: '#374151', marginTop: 4 }}>{r.comment}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700 }}>
              <ShoppingCart size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
              Заказы / продажи
            </h3>
            {historyLoading ? (
              <div className="loading-center"><Loader2 size={20} className="spin" /></div>
            ) : ordersHistory.length === 0 ? (
              <div style={{ color: '#9ca3af', fontSize: 14 }}>Нет заказов</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {ordersHistory.map(order => {
                  const statusLabel = order.status === 'completed' ? 'Выполнен' : order.status === 'canceled' ? 'Отменен' : 'В работе'
                  const statusColor = order.status === 'completed' ? '#16a34a' : order.status === 'canceled' ? '#dc2626' : '#2563eb'
                  return (
                    <div key={order.id} style={{ padding: '10px 12px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{order.title}</span>
                        <span style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('ru-RU') : ''}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: statusColor, fontWeight: 700 }}>{statusLabel}</span>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>Позиции: {order.items_count || 0}</span>
                        {Number(order.total_amount) > 0 && (
                          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>
                            {Number(order.total_amount).toLocaleString('ru-RU')} ₽
                          </span>
                        )}
                      </div>
                      {order.outcome && <div style={{ fontSize: 12, color: '#374151', marginTop: 4 }}>{order.outcome}</div>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <CustomerMatchModals
          matchModal={matchModal} onCloseMatch={() => setMatchModal(null)}
          matchLoading={matchLoading} matchResults={matchResults} linking={linking}
          customFields={customFields} onLinkTo={handleLinkTo} onConfirmSelf={handleConfirmSelf}
          noMatchConfirm={noMatchConfirm} onCloseNoMatch={() => setNoMatchConfirm(null)}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12, alignItems: 'center' }}>
        <form onSubmit={handleSimpleSearch} style={{ display: 'flex', gap: 8, flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              className="field"
              placeholder="Поиск по ФИО, телефону, e-mail..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 34 }}
              autoComplete="off"
            />
          </div>
          <button type="submit" className="btn-primary-sm">Найти</button>
        </form>
        <button
          className={`btn-cancel ${advancedOpen ? 'active' : ''}`}
          onClick={() => setAdvancedOpen(!advancedOpen)}
          title="Расширенный поиск"
          style={advancedOpen ? { background: '#eff6ff', borderColor: '#3b82f6', color: '#2563eb' } : {}}
        >
          <Filter size={14} /> Фильтры {advancedOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {selfRegCount > 0 && (
          <button
            className="btn-cancel"
            onClick={toggleSelfRegFilter}
            title="Показать самозаписи"
            style={selfRegOnly
              ? { background: '#fef3c7', borderColor: '#f59e0b', color: '#92400e' }
              : {}
            }
          >
            <UserCheck size={14} />
            Самозаписи
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 18, height: 18, borderRadius: 9, fontSize: 10, fontWeight: 700,
              background: '#f59e0b', color: '#fff', marginLeft: 4, padding: '0 4px',
            }}>
              {selfRegCount}
            </span>
          </button>
        )}

        <button className="btn-primary-sm" onClick={handleExport} title="Экспорт CSV">
          <Download size={14} /> CSV
        </button>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={14} /> Добавить
        </button>
      </div>

      {advancedOpen && (
        <div style={{
          background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12,
          padding: 16, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Условия:</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  className={`btn-cancel ${logic === 'and' ? '' : ''}`}
                  onClick={() => setLogic('and')}
                  style={{
                    fontSize: 11, padding: '2px 10px', borderRadius: 4,
                    ...(logic === 'and' ? { background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' } : {}),
                  }}
                >И</button>
                <button
                  className="btn-cancel"
                  onClick={() => setLogic('or')}
                  style={{
                    fontSize: 11, padding: '2px 10px', borderRadius: 4,
                    ...(logic === 'or' ? { background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' } : {}),
                  }}
                >ИЛИ</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {templates.length > 0 && (
                <div style={{ position: 'relative' }}>
                  <button className="btn-cancel" onClick={() => setShowTemplates(!showTemplates)} style={{ fontSize: 12 }}>
                    <BookOpen size={13} /> Шаблоны
                  </button>
                  {showTemplates && (
                    <div style={{
                      position: 'absolute', right: 0, top: '100%', marginTop: 4,
                      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: 200,
                    }}>
                      {templates.map(t => (
                        <div key={t.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 12px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
                        }}>
                          <span style={{ fontSize: 13 }} onClick={() => loadTemplate(t)}>{t.name}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteTemplate(t.id) }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {conditions.map((cond, idx) => {
              const fieldDef = allSearchFields.find(f => f.value === cond.field)
              const operators = getOperatorsForType(fieldDef?.type || 'text')
              const needsValue = !['not_empty', 'is_empty'].includes(cond.operator)

              return (
                <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <select className="field" value={cond.field} style={{ flex: '1 1 160px', minWidth: 120, maxWidth: 260 }}
                    onChange={e => updateCondition(idx, { field: e.target.value })} autoComplete="off">
                    <optgroup label="Стандартные">
                      {STANDARD_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </optgroup>
                    {customFields.length > 0 && (
                      <optgroup label="Пользовательские">
                        {customFields.map(cf => <option key={cf.id} value={`cf_${cf.id}`}>{cf.name}</option>)}
                      </optgroup>
                    )}
                  </select>
                  <select className="field" value={cond.operator} style={{ flex: '1 1 130px', minWidth: 100, maxWidth: 200 }}
                    onChange={e => updateCondition(idx, { operator: e.target.value })} autoComplete="off">
                    {operators.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {needsValue && cond.operator === 'range' ? (
                    <div style={{ display: 'flex', gap: 4, flex: '2 1 160px', minWidth: 100 }}>
                      <input className="field" type="date" value={cond.value_from || ''}
                        onChange={e => updateCondition(idx, { value_from: e.target.value })} autoComplete="off" />
                      <input className="field" type="date" value={cond.value_to || ''}
                        onChange={e => updateCondition(idx, { value_to: e.target.value })} autoComplete="off" />
                    </div>
                  ) : needsValue && fieldDef?.type === 'checkbox' ? (
                    <select className="field" value={cond.value} style={{ flex: '2 1 140px', minWidth: 100 }}
                      onChange={e => updateCondition(idx, { value: e.target.value })} autoComplete="off">
                      <option value="">—</option>
                      <option value="true">Да</option>
                      <option value="false">Нет</option>
                    </select>
                  ) : needsValue && fieldDef?.type === 'list' && fieldDef.options?.length ? (
                    <select className="field" value={cond.value} style={{ flex: '2 1 140px', minWidth: 100 }}
                      onChange={e => updateCondition(idx, { value: e.target.value })} autoComplete="off">
                      <option value="">—</option>
                      {fieldDef.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : needsValue && fieldDef?.type === 'date' ? (
                    <input className="field" type="date" value={cond.value || ''} style={{ flex: '2 1 140px', minWidth: 100 }}
                      onChange={e => updateCondition(idx, { value: e.target.value })} autoComplete="off" />
                  ) : needsValue ? (
                    <input className="field" value={cond.value || ''} style={{ flex: '2 1 140px', minWidth: 100 }}
                      placeholder="Значение" autoComplete="off"
                      onChange={e => updateCondition(idx, { value: e.target.value })} />
                  ) : (
                    <div style={{ flex: '1 1 100px' }} />
                  )}
                  <button className="icon-btn icon-btn--danger" onClick={() => removeCondition(idx)} title="Удалить">
                    <X size={14} />
                  </button>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <button className="btn-cancel" onClick={addCondition} style={{ fontSize: 12 }}>
              <Plus size={13} /> Добавить условие
            </button>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <input className="field" value={templateName} onChange={e => setTemplateName(e.target.value)}
                  placeholder="Название шаблона" style={{ width: 140, fontSize: 12 }} autoComplete="off" />
                <button className="btn-cancel" onClick={saveTemplate} disabled={!templateName.trim()} style={{ fontSize: 12 }}>
                  <Save size={13} />
                </button>
              </div>
              <button className="btn-cancel" onClick={resetSearch} style={{ fontSize: 12 }}>Сбросить</button>
              <button className="btn-primary-sm" onClick={handleAdvancedSearch}>
                <Search size={13} /> Искать
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdvancedSearch && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
          padding: '6px 12px', background: '#eff6ff', borderRadius: 8, fontSize: 12, color: '#2563eb',
        }}>
          <Filter size={12} />
          Активен расширенный поиск ({conditions.length} усл.)
          <button onClick={resetSearch} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', textDecoration: 'underline', fontSize: 12,
          }}>Сбросить</button>
        </div>
      )}

      {selfRegOnly && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
          padding: '6px 12px', background: '#fef3c7', borderRadius: 8, fontSize: 12, color: '#92400e',
        }}>
          <UserCheck size={12} />
          Показаны только самозаписи ({total})
          <button onClick={() => { setSelfRegOnly(false); setPage(1) }} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', textDecoration: 'underline', fontSize: 12,
          }}>Показать всех</button>
        </div>
      )}

      {loading ? (
        <div className="loading-center"><Loader2 size={28} className="spin" /></div>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <p>{isAdvancedSearch || selfRegOnly ? 'Ничего не найдено' : 'Нет клиентов'}</p>
          {!isAdvancedSearch && !selfRegOnly && (
            <button className="btn-primary-sm" onClick={openAdd}><Plus size={14} /> Добавить первого</button>
          )}
        </div>
      ) : (
        <>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {displayColumns.map(col => (
                    <th key={col} style={col.startsWith('cf_') ? { fontSize: 12 } : col === 'created_at' ? { width: 140 } : {}}>
                      {getColumnLabel(col)}
                    </th>
                  ))}
                  <th style={{ width: 140 }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(c)}>
                    {displayColumns.map(col => (
                      <td key={col} style={getCellStyle(col)}>
                        {col === 'full_name' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{getCellValue(c, col)}</span>
                            {c.is_self_registered && <SelfRegBadge />}
                          </div>
                        ) : getCellValue(c, col)}
                      </td>
                    ))}
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {c.is_self_registered && (
                          <button className="icon-btn" onClick={() => openMatchModal(c)}
                            title="Найти совпадения"
                            style={{ color: '#f59e0b' }}>
                            <Link size={15} />
                          </button>
                        )}
                        <button className="icon-btn" onClick={() => openEdit(c)} title="Редактировать"><Edit2 size={15} /></button>
                        <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(c.id)} title="Удалить"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <button className="btn-cancel" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{page} / {totalPages} (всего: {total})</span>
              <button className="btn-cancel" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2>{modal === 'add' ? 'Новый клиент' : 'Редактирование клиента'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleSave() }} className="modal-form" autoComplete="off">
              <div className="form-row">
                <label>ФИО *</label>
                <input className="field" value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Иванов Иван Иванович" autoComplete="off" />
              </div>
              <div className="form-row">
                <label>Телефон *</label>
                <input className="field" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+7 (999) 123-45-67" autoComplete="off" />
              </div>
              <div className="form-row">
                <label>E-mail</label>
                <input className="field" type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com" autoComplete="off" />
              </div>
              <div className="form-row">
                <label>Дополнительные контакты</label>
                <input className="field" value={form.additional_contacts}
                  onChange={e => setForm(f => ({ ...f, additional_contacts: e.target.value }))}
                  placeholder="Telegram, WhatsApp и т.д." autoComplete="off" />
              </div>
              <div className="form-row">
                <label>Примечания</label>
                <textarea className="field" rows={3} value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Заметки о клиенте" autoComplete="off" />
              </div>

              {customFields.length > 0 && (
                <>
                  <div style={{ borderTop: '1px solid #e5e7eb', margin: '12px 0', paddingTop: 12 }}>
                    <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
                      Дополнительные поля
                    </div>
                  </div>
                  {customFields.map(cf => (
                    <div className="form-row" key={cf.id}>
                      <label>{cf.name}{cf.is_required ? ' *' : ''}</label>
                      {renderCustomFieldInput(cf, form.custom_values?.[cf.id] || '', (val) =>
                        setForm(f => ({ ...f, custom_values: { ...f.custom_values, [cf.id]: val } }))
                      )}
                    </div>
                  ))}
                </>
              )}

              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Отмена</button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CustomerMatchModals
        matchModal={matchModal} onCloseMatch={() => setMatchModal(null)}
        matchLoading={matchLoading} matchResults={matchResults} linking={linking}
        customFields={customFields} onLinkTo={handleLinkTo} onConfirmSelf={handleConfirmSelf}
        noMatchConfirm={noMatchConfirm} onCloseNoMatch={() => setNoMatchConfirm(null)}
      />
    </div>
  )
}
