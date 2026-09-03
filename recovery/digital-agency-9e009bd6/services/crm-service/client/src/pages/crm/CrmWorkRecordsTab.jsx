import { useState, useEffect } from 'react'
import {
  Plus, Trash2, X, Check, Loader2, Download,
  Edit2, ChevronLeft, ChevronRight, Filter,
} from 'lucide-react'
import { apiFetch } from '../../api.js'

const FIELD_TYPE_LABELS = {
  text: 'Текст', number: 'Число', phone: 'Телефон',
  email: 'Email', date: 'Дата', list: 'Список', checkbox: 'Флажок',
}

export default function CrmWorkRecordsTab() {
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [customers, setCustomers] = useState([])
  const [services, setServices] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ customer_id: '', employee_id: '', service_id: '', from: '', to: '' })
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({
    customer_id: '', service_id: '', employee_id: '',
    performed_at: new Date().toISOString().slice(0, 16),
    duration: 60, price: 0, comment: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const limit = 30

  const [serviceFields, setServiceFields] = useState([])
  const [fieldValues, setFieldValues] = useState({})

  async function loadData() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit })
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })

      const [data, custs, svcs, emps] = await Promise.all([
        apiFetch(`/api/crm/work-records?${params}`),
        apiFetch('/api/crm/customers?limit=1000'),
        apiFetch('/api/crm/services?status=active'),
        apiFetch('/api/crm/employees?active_only=true'),
      ])
      setRecords(data.items || [])
      setTotal(data.total || 0)
      setCustomers((custs.items || custs) || [])
      setServices(Array.isArray(svcs) ? svcs : [])
      setEmployees(Array.isArray(emps) ? emps : [])
    } catch (e) {
      console.error('[crm] load work-records', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [page])

  function applyFilters() {
    setPage(1)
    loadData()
  }

  async function loadServiceFields(serviceId) {
    if (!serviceId) { setServiceFields([]); return }
    try {
      const data = await apiFetch(`/api/crm/service-fields?service_id=${serviceId}`)
      setServiceFields(Array.isArray(data) ? data : [])
    } catch { setServiceFields([]) }
  }

  async function loadFieldValues(workRecordId) {
    try {
      const data = await apiFetch(`/api/crm/service-fields/values?work_record_id=${workRecordId}`)
      const vals = {}
      if (Array.isArray(data)) data.forEach(v => { vals[v.field_id] = v.value })
      setFieldValues(vals)
    } catch { setFieldValues({}) }
  }

  function openAdd() {
    setForm({
      customer_id: '', service_id: '', employee_id: '',
      performed_at: new Date().toISOString().slice(0, 16),
      duration: 60, price: 0, comment: '',
    })
    setServiceFields([])
    setFieldValues({})
    setError('')
    setModal('add')
  }

  function openEdit(r) {
    setForm({
      customer_id: r.customer_id, service_id: r.service_id || '',
      employee_id: r.employee_id || '',
      performed_at: r.performed_at ? r.performed_at.slice(0, 16) : '',
      duration: r.duration || 0, price: r.price || 0, comment: r.comment || '',
    })
    setError('')
    setModal(r.id)
    if (r.service_id) {
      loadServiceFields(r.service_id)
      loadFieldValues(r.id)
    } else {
      setServiceFields([])
      setFieldValues({})
    }
  }

  function handleServiceSelect(serviceId) {
    const svc = services.find(s => s.id === serviceId)
    setForm(f => ({
      ...f,
      service_id: serviceId,
      duration: svc ? svc.duration : f.duration,
      price: svc ? +svc.price : f.price,
    }))
    setFieldValues({})
    loadServiceFields(serviceId)
  }

  async function handleSave() {
    if (!form.customer_id) { setError('Выберите клиента'); return }

    const requiredMissing = serviceFields.filter(f => f.is_required && !fieldValues[f.id]?.trim())
    if (requiredMissing.length) {
      setError(`Заполните обязательные поля: ${requiredMissing.map(f => f.name).join(', ')}`)
      return
    }

    setSaving(true)
    setError('')
    try {
      const body = { ...form, duration: +form.duration, price: +form.price }
      let recordId = modal
      if (modal === 'add') {
        const created = await apiFetch('/api/crm/work-records', { method: 'POST', body: JSON.stringify(body) })
        recordId = created.id
      } else {
        await apiFetch(`/api/crm/work-records/${modal}`, { method: 'PUT', body: JSON.stringify(body) })
      }

      if (serviceFields.length > 0) {
        const values = serviceFields.map(f => ({
          field_id: f.id,
          value: fieldValues[f.id] || '',
        }))
        await apiFetch('/api/crm/service-fields/values', {
          method: 'POST',
          body: JSON.stringify({ work_record_id: recordId, values }),
        })
      }

      setModal(null)
      loadData()
    } catch (e) {
      setError(e.error || e.message || 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Удалить запись?')) return
    try {
      await apiFetch(`/api/crm/work-records/${id}`, { method: 'DELETE' })
      loadData()
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    }
  }

  async function handleExport() {
    try {
      const params = new URLSearchParams()
      if (filters.from) params.set('from', filters.from)
      if (filters.to) params.set('to', filters.to)
      const res = await fetch(`/api/crm/export/work-records?${params}`, { credentials: 'include' })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'work-records.csv'; a.click()
      URL.revokeObjectURL(url)
    } catch { alert('Ошибка экспорта') }
  }

  function renderFieldInput(field) {
    const value = fieldValues[field.id] || ''
    const onChange = v => setFieldValues(prev => ({ ...prev, [field.id]: v }))

    if (field.field_type === 'checkbox') {
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={value === 'true'}
            onChange={e => onChange(e.target.checked ? 'true' : '')} />
          <span style={{ fontSize: 13 }}>{field.name}{field.is_required ? ' *' : ''}</span>
        </label>
      )
    }

    if (field.field_type === 'list') {
      return (
        <>
          <label>{field.name}{field.is_required ? ' *' : ''}</label>
          <select className="field" value={value} onChange={e => onChange(e.target.value)} autoComplete="off">
            <option value="">— выберите —</option>
            {(field.options || []).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>
        </>
      )
    }

    const typeMap = { number: 'number', phone: 'tel', email: 'email', date: 'date' }
    return (
      <>
        <label>{field.name}{field.is_required ? ' *' : ''}</label>
        <input className="field" type={typeMap[field.field_type] || 'text'}
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={field.name} autoComplete="off" />
      </>
    )
  }

  const totalPages = Math.ceil(total / limit) || 1
  const custList = Array.isArray(customers) ? customers : []

  if (loading) return <div className="loading-center"><Loader2 size={28} className="spin" /></div>

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <Filter size={16} style={{ color: '#6b7280' }} />
        <select className="field" value={filters.customer_id}
          onChange={e => setFilters(f => ({ ...f, customer_id: e.target.value }))} style={{ maxWidth: 200 }} autoComplete="off">
          <option value="">Все клиенты</option>
          {custList.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
        </select>
        <select className="field" value={filters.employee_id}
          onChange={e => setFilters(f => ({ ...f, employee_id: e.target.value }))} style={{ maxWidth: 200 }} autoComplete="off">
          <option value="">Все исполнители</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
        </select>
        <input className="field" type="date" value={filters.from} title="С даты"
          onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} style={{ maxWidth: 150 }} autoComplete="off" />
        <input className="field" type="date" value={filters.to} title="По дату"
          onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} style={{ maxWidth: 150 }} autoComplete="off" />
        <button className="btn-primary-sm" onClick={applyFilters}>Применить</button>
        <div style={{ flex: 1 }} />
        <button className="btn-primary-sm" onClick={handleExport} title="Экспорт CSV">
          <Download size={14} /> CSV
        </button>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={14} /> Записать работу
        </button>
      </div>

      {records.length === 0 ? (
        <div className="empty-state">
          <p>Нет записей о работах</p>
          <button className="btn-primary-sm" onClick={openAdd}><Plus size={14} /> Записать первую</button>
        </div>
      ) : (
        <>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Клиент</th>
                  <th>Услуга</th>
                  <th>Исполнитель</th>
                  <th style={{ width: 80 }}>Длит.</th>
                  <th style={{ width: 100 }}>Стоимость</th>
                  <th style={{ width: 100 }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontSize: 13 }}>
                      {r.performed_at ? new Date(r.performed_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{r.customer_name || '—'}</div>
                      {r.customer_phone && <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{r.customer_phone}</div>}
                    </td>
                    <td style={{ color: '#374151', fontSize: 13 }}>{r.service_name || '—'}</td>
                    <td style={{ color: '#6b7280', fontSize: 13 }}>{r.employee_name || '—'}</td>
                    <td style={{ fontSize: 13 }}>{r.duration ? `${r.duration} мин` : '—'}</td>
                    <td style={{ fontWeight: 600 }}>
                      {r.price > 0 ? `${Number(r.price).toLocaleString('ru-RU')} ₽` : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="icon-btn" onClick={() => openEdit(r)} title="Редактировать"><Edit2 size={15} /></button>
                        <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(r.id)} title="Удалить"><Trash2 size={15} /></button>
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
          <div className="modal-box" style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>{modal === 'add' ? 'Новая запись работы' : 'Редактирование записи'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleSave() }} className="modal-form" autoComplete="off">
              <div className="form-row">
                <label>Клиент *</label>
                <select className="field" value={form.customer_id}
                  onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} autoComplete="off">
                  <option value="">— выберите клиента —</option>
                  {custList.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.phone})</option>)}
                </select>
              </div>
              <div className="form-row">
                <label>Услуга</label>
                <select className="field" value={form.service_id}
                  onChange={e => handleServiceSelect(e.target.value)} autoComplete="off">
                  <option value="">— без услуги —</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration} мин, {Number(s.price).toLocaleString('ru-RU')} ₽)</option>)}
                </select>
              </div>
              <div className="form-row">
                <label>Исполнитель</label>
                <select className="field" value={form.employee_id}
                  onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))} autoComplete="off">
                  <option value="">— без исполнителя —</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.full_name} {e.position ? `(${e.position})` : ''}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                <div className="form-row">
                  <label>Дата и время</label>
                  <input className="field" type="datetime-local" value={form.performed_at}
                    onChange={e => setForm(f => ({ ...f, performed_at: e.target.value }))} autoComplete="off" />
                </div>
                <div className="form-row">
                  <label>Длительность (мин)</label>
                  <input className="field" type="number" min="0" value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} autoComplete="off" />
                </div>
                <div className="form-row">
                  <label>Стоимость (₽)</label>
                  <input className="field" type="number" min="0" step="100" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))} autoComplete="off" />
                </div>
              </div>

              {/* Dynamic service custom fields */}
              {serviceFields.length > 0 && (
                <div style={{
                  marginTop: 8, padding: 12, background: '#f0fdf4',
                  borderRadius: 8, border: '1px solid #bbf7d0',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 8 }}>
                    Дополнительная информация
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {serviceFields.map(field => (
                      <div key={field.id} className="form-row" style={{ marginBottom: 0 }}>
                        {renderFieldInput(field)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-row">
                <label>Комментарий</label>
                <textarea className="field" rows={2} value={form.comment}
                  onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="Описание проделанной работы" autoComplete="off" />
              </div>
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
    </div>
  )
}
