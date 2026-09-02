import { useState, useEffect } from 'react'
import {
  Plus, X, Check, Loader2, Search, Download,
  Edit2, UserX, UserCheck,
} from 'lucide-react'
import { apiFetch } from '../../api.js'

export default function CrmEmployeesTab() {
  const [employees, setEmployees] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ full_name: '', position: '', phone: '', email: '', specializations: [] })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadData() {
    setLoading(true)
    try {
      const [emps, svcs] = await Promise.all([
        apiFetch(`/api/crm/employees?active_only=${!showInactive}&search=${search}`),
        apiFetch('/api/crm/services?status=active'),
      ])
      setEmployees(Array.isArray(emps) ? emps : [])
      setServices(Array.isArray(svcs) ? svcs : [])
    } catch (e) {
      console.error('[crm] load employees', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [showInactive])

  function handleSearch(e) {
    e.preventDefault()
    loadData()
  }

  function openAdd() {
    setForm({ full_name: '', position: '', phone: '', email: '', specializations: [] })
    setError('')
    setModal('add')
  }

  function openEdit(emp) {
    let specs = emp.specializations || []
    if (typeof specs === 'string') try { specs = JSON.parse(specs) } catch { specs = [] }
    setForm({
      full_name: emp.full_name, position: emp.position || '',
      phone: emp.phone || '', email: emp.email || '',
      specializations: specs,
    })
    setError('')
    setModal(emp.id)
  }

  async function handleSave() {
    if (!form.full_name) { setError('ФИО обязательно'); return }
    setSaving(true)
    setError('')
    try {
      if (modal === 'add') {
        await apiFetch('/api/crm/employees', { method: 'POST', body: JSON.stringify(form) })
      } else {
        await apiFetch(`/api/crm/employees/${modal}`, { method: 'PUT', body: JSON.stringify(form) })
      }
      setModal(null)
      loadData()
    } catch (e) {
      setError(e.error || e.message || 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(emp) {
    try {
      await apiFetch(`/api/crm/employees/${emp.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...emp, is_active: !emp.is_active }),
      })
      loadData()
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    }
  }

  async function handleExport() {
    try {
      const res = await fetch('/api/crm/export/employees', { credentials: 'include' })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'employees.csv'; a.click()
      URL.revokeObjectURL(url)
    } catch { alert('Ошибка экспорта') }
  }

  function toggleSpecialization(serviceId) {
    setForm(f => {
      const has = f.specializations.includes(serviceId)
      return { ...f, specializations: has
        ? f.specializations.filter(id => id !== serviceId)
        : [...f.specializations, serviceId],
      }
    })
  }

  if (loading) return <div className="loading-center"><Loader2 size={28} className="spin" /></div>

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: '1 1 280px', minWidth: 0 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input className="field" placeholder="Поиск по ФИО, должности..."
              value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} autoComplete="off" />
          </div>
          <button type="submit" className="btn-primary-sm">Найти</button>
        </form>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>
          <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} />
          Неактивные
        </label>
        <button className="btn-primary-sm" onClick={handleExport} title="Экспорт CSV">
          <Download size={14} /> CSV
        </button>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={14} /> Добавить сотрудника
        </button>
      </div>

      {employees.length === 0 ? (
        <div className="empty-state">
          <p>Нет сотрудников</p>
          <button className="btn-primary-sm" onClick={openAdd}><Plus size={14} /> Добавить первого</button>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ФИО</th>
                <th>Должность</th>
                <th>Телефон</th>
                <th>E-mail</th>
                <th style={{ width: 90 }}>Статус</th>
                <th style={{ width: 100 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} style={{ opacity: emp.is_active ? 1 : 0.5 }}>
                  <td style={{ fontWeight: 600, color: '#111827' }}>{emp.full_name}</td>
                  <td style={{ color: '#6b7280', fontSize: 13 }}>{emp.position || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{emp.phone || '—'}</td>
                  <td style={{ color: '#6b7280', fontSize: 13 }}>{emp.email || '—'}</td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                      background: emp.is_active ? '#dcfce7' : '#f3f4f6',
                      color: emp.is_active ? '#16a34a' : '#6b7280',
                    }}>
                      {emp.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="icon-btn" onClick={() => openEdit(emp)} title="Редактировать"><Edit2 size={15} /></button>
                      <button className="icon-btn" onClick={() => handleToggleActive(emp)}
                        title={emp.is_active ? 'Деактивировать' : 'Активировать'}>
                        {emp.is_active ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2>{modal === 'add' ? 'Новый сотрудник' : 'Редактирование сотрудника'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleSave() }} className="modal-form" autoComplete="off">
              <div className="form-row">
                <label>ФИО *</label>
                <input className="field" value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Петров Пётр Петрович" autoComplete="off" />
              </div>
              <div className="form-row">
                <label>Должность</label>
                <input className="field" value={form.position}
                  onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="Мастер, специалист и т.д." autoComplete="off" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div className="form-row">
                  <label>Телефон</label>
                  <input className="field" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+7 (999) 000-00-00" autoComplete="off" />
                </div>
                <div className="form-row">
                  <label>E-mail</label>
                  <input className="field" type="email" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" autoComplete="off" />
                </div>
              </div>
              {services.length > 0 && (
                <div className="form-row">
                  <label>Специализации (какие услуги оказывает)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {services.map(s => (
                      <label key={s.id} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                        background: form.specializations.includes(s.id) ? '#ede9fe' : '#f3f4f6',
                        color: form.specializations.includes(s.id) ? '#7c3aed' : '#6b7280',
                        border: `1px solid ${form.specializations.includes(s.id) ? '#c4b5fd' : '#e5e7eb'}`,
                      }}>
                        <input type="checkbox" checked={form.specializations.includes(s.id)}
                          onChange={() => toggleSpecialization(s.id)} style={{ display: 'none' }} />
                        {s.name}
                      </label>
                    ))}
                  </div>
                </div>
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
    </div>
  )
}
