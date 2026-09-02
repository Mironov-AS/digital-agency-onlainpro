import { useState, useEffect } from 'react'
import {
  ArrowLeft, Plus, Pencil, X,
  UserCog, ShieldCheck, Trash2,
} from 'lucide-react'
import { apiFetch } from '../api.js'

export default function AdminPage({ onBack, user }) {
  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} /> Назад
        </button>
        <div>
          <h1 className="page-title">Администрирование</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
            Управление пользователями
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 32px' }}>
        <UsersTab user={user} />
      </div>
    </div>
  )
}

// Users management tab
function UsersTab({ user }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', apps: [], is_active: true })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  async function loadUsers() {
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch('/api/auth/users')
      setUsers(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.error || 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Имя обязательно'
    if (!form.email.trim()) errs.email = 'Email обязателен'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Некорректный email'
    if (modal?.mode === 'add' && !form.password) errs.password = 'Пароль обязателен'
    else if (form.password && form.password.length < 6) errs.password = 'Минимум 6 символов'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    setError('')
    try {
      if (modal.mode === 'add') {
        const created = await apiFetch('/api/auth/users', {
          method: 'POST',
          body: JSON.stringify(form),
        })
        setUsers(u => [created, ...u])
      } else {
        const updated = await apiFetch(`/api/auth/users/${modal.target.id}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        })
        setUsers(u => u.map(x => x.id === updated.id ? updated : x))
      }
      setModal(null)
    } catch (e) {
      setError(e.error || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await apiFetch(`/api/auth/users/${modal.target.id}`, { method: 'DELETE' })
      setUsers(u => u.filter(x => x.id !== modal.target.id))
      setModal(null)
    } catch (e) {
      setError(e.error || 'Ошибка удаления')
    }
  }

  function openAdd() {
    setForm({ name: '', email: '', password: '', role: 'user', apps: [], is_active: true })
    setErrors({})
    setModal({ mode: 'add' })
  }

  function openEdit(u) {
    setForm({ name: u.name, email: u.email, password: '', role: u.role, apps: u.apps || [], is_active: u.is_active })
    setErrors({})
    setModal({ mode: 'edit', target: u })
  }

  const AVAILABLE_APPS = [
    { id: 'demo', label: 'Демо' },
    { id: 'clients', label: 'Клиенты' },
    { id: 'catalog', label: 'Каталог' },
    { id: 'projects', label: 'Проекты' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Управление пользователями</h2>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{users.length} пользователей</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={14} /> Добавить пользователя
        </button>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Загрузка...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Пользователь</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Роль</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Приложения</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Статус</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{u.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                      background: u.role === 'admin' ? '#fef3c7' : '#f3f4f6',
                      color: u.role === 'admin' ? '#92400e' : '#374151',
                    }}>
                      {u.role === 'admin' ? <ShieldCheck size={12} /> : <UserCog size={12} />}
                      {u.role === 'admin' ? 'Админ' : 'Пользователь'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {(u.apps || []).map(app => {
                        const appInfo = AVAILABLE_APPS.find(a => a.id === app)
                        return appInfo ? (
                          <span key={app} style={{ fontSize: '11px', background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                            {appInfo.label}
                          </span>
                        ) : null
                      })}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: '600',
                      color: u.is_active ? '#16a34a' : '#6b7280',
                    }}>
                      {u.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn" onClick={() => openEdit(u)} title="Редактировать">
                        <Pencil size={15} />
                      </button>
                      {u.id !== user?.id && (
                        <button className="icon-btn icon-btn--danger" onClick={() => setModal({ mode: 'delete', target: u })} title="Удалить">
                          <Trash2 size={15} />
                        </button>
                      )}
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
              <h2>{modal.mode === 'add' ? 'Новый пользователь' : 'Редактировать пользователя'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleSubmit() }} className="modal-form" autoComplete="off">
              <div className="form-grid" style={{ padding: '0 0 8px' }}>
                <div className="form-row">
                  <label>Имя *</label>
                  <input className={`field ${errors.name ? 'field-error' : ''}`} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Иванов Иван" />
                  {errors.name && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.name}</span>}
                </div>
                <div className="form-row">
                  <label>Email *</label>
                  <input className={`field ${errors.email ? 'field-error' : ''}`} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ivan@example.com" />
                  {errors.email && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.email}</span>}
                </div>
                <div className="form-row">
                  <label>{modal.mode === 'add' ? 'Пароль *' : 'Новый пароль'}</label>
                  <input className={`field ${errors.password ? 'field-error' : ''}`} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={modal.mode === 'add' ? 'Минимум 6 символов' : 'Оставьте пустым, чтобы не менять'} autoComplete="new-password" />
                  {errors.password && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.password}</span>}
                </div>
                <div className="form-row">
                  <label>Роль</label>
                  <select className="field" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="user">Пользователь</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>
                <div className="form-row" style={{ gridColumn: '1 / -1' }}>
                  <label>Приложения</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {AVAILABLE_APPS.map(app => (
                      <label key={app.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: '1.5px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                        <input type="checkbox" checked={form.apps.includes(app.id)} onChange={e => {
                          if (e.target.checked) setForm(f => ({ ...f, apps: [...f.apps, app.id] }))
                          else setForm(f => ({ ...f, apps: f.apps.filter(a => a !== app.id) }))
                        }} />
                        {app.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-row">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                    Активен
                  </label>
                </div>
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Отмена</button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Сохранение...' : modal.mode === 'add' ? 'Создать' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal && modal.mode === 'delete' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box modal-box--sm">
            <div className="modal-header">
              <h2>Удалить пользователя</h2>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <p className="confirm-text">Удалить пользователя «{modal.target.name}» ({modal.target.email})? Это действие необратимо.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setModal(null)}>Отмена</button>
              <button className="btn-danger" onClick={handleDelete}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
