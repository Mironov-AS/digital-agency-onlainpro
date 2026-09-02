import { apiFetch } from '../api.js'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ArrowLeft, Loader2, X, Check, Phone, Mail, MapPin, Users, User } from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal.jsx'

const API_CLIENTS = '/api/clients'

const EMPTY_FORM = {
  name: '', address: '', phone: '', email: '', contact_person: '', notes: '',
}

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Название обязательно'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Некорректный e-mail'
  return errors
}

function ClientForm({ form, onChange, errors }) {
  return (
    <div className="form-grid" style={{ padding: '0 0 8px' }}>
      <div className="form-row">
        <label>Название клиента *</label>
        <input className={`field ${errors.name ? 'field-error' : ''}`} value={form.name} onChange={e => onChange('name', e.target.value)} placeholder="ООО «Клиент»" />
      </div>
      <div className="form-row">
        <label>Телефон</label>
        <input className="field" type="tel" value={form.phone} onChange={e => onChange('phone', e.target.value)} placeholder="+7 495 000-00-00" />
      </div>
      <div className="form-row">
        <label>E-mail</label>
        <input className="field" type="email" value={form.email} onChange={e => onChange('email', e.target.value)} placeholder="client@example.com" />
      </div>
      <div className="form-row" style={{ gridColumn: '1 / -1' }}>
        <label>Контактное лицо</label>
        <input className="field" value={form.contact_person} onChange={e => onChange('contact_person', e.target.value)} placeholder="Иванов Иван Иванович" />
      </div>
      <div className="form-row" style={{ gridColumn: '1 / -1' }}>
        <label>Адрес</label>
        <input className="field" value={form.address} onChange={e => onChange('address', e.target.value)} placeholder="г. Москва, ул. Примерная, 1" />
      </div>
      <div className="form-row" style={{ gridColumn: '1 / -1' }}>
        <label>Примечания</label>
        <textarea className="field" rows={3} value={form.notes} onChange={e => onChange('notes', e.target.value)} placeholder="Дополнительная информация..." style={{ resize: 'vertical' }} />
      </div>
    </div>
  )
}

export default function ClientsPage({ onBack, onSelectClient }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)

  async function loadClients() {
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch(API_CLIENTS)
      setClients(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.error || 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadClients() }, [])

  async function handleSubmit() {
    const errs = validate(modal.form)
    if (Object.keys(errs).length) { setModal(m => ({ ...m, errors: errs })); return }
    setModal(m => ({ ...m, loading: true, serverError: '' }))
    try {
      if (modal.mode === 'add') {
        const created = await apiFetch(API_CLIENTS, { method: 'POST', body: JSON.stringify(modal.form) })
        setClients(c => [created, ...c])
      } else {
        const updated = await apiFetch(`${API_CLIENTS}/${modal.target.id}`, { method: 'PUT', body: JSON.stringify(modal.form) })
        setClients(c => c.map(x => x.id === updated.id ? updated : x))
      }
      setModal(null)
    } catch (err) {
      setModal(m => ({ ...m, loading: false, serverError: err.error || 'Ошибка сохранения' }))
    }
  }

  async function handleDelete() {
    setModal(m => ({ ...m, loading: true, serverError: '' }))
    try {
      await apiFetch(`${API_CLIENTS}/${modal.target.id}`, { method: 'DELETE' })
      setClients(c => c.filter(x => x.id !== modal.target.id))
      setModal(null)
    } catch (err) {
      setModal(m => ({ ...m, loading: false, serverError: err.error || 'Ошибка удаления' }))
    }
  }

  const filtered = clients.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q)
      || (c.email || '').toLowerCase().includes(q)
      || (c.phone || '').includes(q)
      || c.services?.some(s => s.service_name.toLowerCase().includes(q))
  })

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-back" onClick={onBack}><ArrowLeft size={16} /> Назад</button>
        <div>
          <h1 className="page-title">Клиенты</h1>
          <p className="page-sub">{clients.length} клиентов</p>
        </div>
        <button className="btn-primary-sm" onClick={() => setModal({ mode: 'add', form: { ...EMPTY_FORM }, errors: {}, loading: false, serverError: '' })} style={{ marginLeft: 'auto' }}>
          <Plus size={16} /> Добавить клиента
        </button>
      </div>

      <div className="filter-bar">
        <input
          className="search-input"
          style={{ width: 320 }}
          type="search"
          placeholder="Поиск по названию, email, телефону..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-center"><Loader2 size={24} className="spin" /></div>
      ) : error ? (
        <div className="page-error">{error} <button onClick={loadClients}>Повторить</button></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Users size={40} style={{ color: '#9ca3af', marginBottom: 12 }} />
          <p>{search ? 'Ничего не найдено' : 'Клиентов пока нет'}</p>
          {!search && (
            <button className="btn-primary-sm" onClick={() => setModal({ mode: 'add', form: { ...EMPTY_FORM }, errors: {}, loading: false, serverError: '' })}>
              <Plus size={14} /> Добавить первого
            </button>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr>
              <th>Клиент</th>
              <th>Контакты</th>
              <th>Услуги</th>
              <th style={{ width: 120 }}>Платежи</th>
              <th style={{ width: 100 }}>Статус</th>
              <th style={{ width: 100 }}>Действия</th>
            </tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="svc-row" style={{ cursor: 'pointer' }} onClick={() => onSelectClient(c.id)}>
                  <td>
                    <div className="svc-name">{c.name}</div>
                    {c.address && <div className="svc-desc-sm">{c.address}</div>}
                  </td>
                  <td>
                    {c.contact_person && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#374151', fontWeight: 500 }}><User size={12} /> {c.contact_person}</div>}
                    {c.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#374151', marginTop: c.contact_person ? 2 : 0 }}><Phone size={12} /> {c.phone}</div>}
                    {c.email && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#6b7280', marginTop: 2 }}><Mail size={12} /> {c.email}</div>}
                  </td>
                  <td>
                    {c.services?.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {c.services.filter(s => s.is_active).map(s => (
                          <span key={s.id} style={{ fontSize: 12, background: '#eff6ff', color: '#1e40af', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>{s.service_name}</span>
                        ))}
                      </div>
                    ) : <span style={{ color: '#9ca3af', fontSize: 13 }}>—</span>}
                  </td>
                  <td>
                    {c.pending_payments > 0 ? (
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#f97316' }}>{c.pending_payments} ожидает</span>
                    ) : <span style={{ color: '#9ca3af', fontSize: 13 }}>—</span>}
                  </td>
                  <td>
                    <span className={`status-toggle ${c.is_active ? 'status-toggle--on' : 'status-toggle--off'}`}>
                      {c.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="icon-btn" onClick={() => setModal({ mode: 'edit', target: c, form: { ...c }, errors: {}, loading: false, serverError: '' })} title="Редактировать">
                        <Pencil size={15} />
                      </button>
                      <button className="icon-btn icon-btn--danger" onClick={() => setModal({ mode: 'delete', target: c, loading: false, serverError: '' })} title="Удалить">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (modal.mode === 'add' || modal.mode === 'edit') && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <h2>{modal.mode === 'add' ? 'Новый клиент' : 'Редактировать клиента'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleSubmit() }} className="modal-form">
              <ClientForm form={modal.form} onChange={(k, v) => setModal(m => ({ ...m, form: { ...m.form, [k]: v } }))} errors={modal.errors} />
              {modal.serverError && <div className="form-error">{modal.serverError}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Отмена</button>
                <button type="submit" className="btn-save" disabled={modal.loading}>
                  {modal.loading ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
                  {modal.mode === 'add' ? 'Создать' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal && modal.mode === 'delete' && (
        <ConfirmModal
          title="Удалить клиента"
          message={`Удалить клиента «${modal.target.name}»? Это действие необратимо.`}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
          loading={modal.loading}
          danger
        />
      )}
    </div>
  )
}