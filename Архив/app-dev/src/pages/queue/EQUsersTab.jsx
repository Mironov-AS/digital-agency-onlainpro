import { useState, useEffect } from 'react'
import {
  Plus, Pencil, Trash2, Loader2, X, Check, Key, UserCog, ShieldCheck,
} from 'lucide-react'
import { apiFetch } from '../../api.js'
import { ROLE_LABELS, ROLE_COLORS, fmtDateTime } from './shared.js'

function UserForm({ form, onChange, errors }) {
  return (
    <>
      <div className="form-row">
        <label>Логин *</label>
        <input className={`field ${errors.username ? 'field-error' : ''}`}
          value={form.username}
          onChange={e => onChange('username', e.target.value)}
          placeholder="ivanov" autoComplete="off" />
        {errors.username && <span style={{ color: '#dc2626', fontSize: 12 }}>{errors.username}</span>}
      </div>
      <div className="form-row">
        <label>Пароль {!form.editingId && '*'}</label>
        <input className={`field ${errors.password ? 'field-error' : ''}`}
          type="password"
          value={form.password}
          onChange={e => onChange('password', e.target.value)}
          placeholder={form.editingId ? 'Оставьте пустым, чтобы не менять' : 'Минимум 8 символов'}
          autoComplete="new-password" />
        {errors.password && <span style={{ color: '#dc2626', fontSize: 12 }}>{errors.password}</span>}
      </div>
      <div className="form-row">
        <label>Роль</label>
        <select className="field" value={form.role} onChange={e => onChange('role', e.target.value)}>
          <option value="operator">Оператор</option>
          <option value="advertiser">Рекламодатель</option>
        </select>
        <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
          Администраторы создаются в основном приложении (роль admin зарезервирована)
        </span>
      </div>
    </>
  )
}

function PasswordResetModal({ user, onClose }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const save = async () => {
    if (!password || password.length < 8) { setError('Минимум 8 символов'); return }
    setError(''); setSaving(true)
    try {
      await apiFetch(`/api/users/${user.id}/password`, {
        method: 'PUT', body: JSON.stringify({ password })
      })
      setDone(true)
    } catch (e) { setError(e.error || 'Ошибка') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box--sm">
        <div className="modal-header">
          <h2>Сброс пароля</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-form">
          <div className="form-row">
            <label>Пользователь</label>
            <input className="field" value={user.username} disabled />
          </div>
          <div className="form-row">
            <label>Новый пароль *</label>
            <input className="field" type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Минимум 8 символов" autoFocus autoComplete="new-password" />
          </div>
          {error && <div className="form-error">{error}</div>}
          {done && (
            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: 10, borderRadius: 8, fontSize: 13 }}>
              Пароль обновлён
            </div>
          )}
          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>Закрыть</button>
            {!done && (
              <button className="btn-save" onClick={save} disabled={saving}>
                {saving ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
                Сохранить
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EQUsersTab({ currentUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ username: '', password: '', role: 'operator' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const r = await apiFetch('/api/users')
      setUsers(Array.isArray(r) ? r : [])
    } catch (e) { setError(e.error || 'Ошибка') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const validate = () => {
    const errs = {}
    if (!form.username.trim()) errs.username = 'Логин обязателен'
    else if (form.username.trim().length < 3) errs.username = 'Минимум 3 символа'
    if (!modal?.editingId) {
      if (!form.password) errs.password = 'Пароль обязателен'
      else if (form.password.length < 8) errs.password = 'Минимум 8 символов'
    } else if (form.password && form.password.length < 8) {
      errs.password = 'Минимум 8 символов'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const openNew = () => {
    setForm({ username: '', password: '', role: 'operator' })
    setErrors({})
    setModal({ mode: 'add' })
  }

  const save = async () => {
    if (!validate()) return
    setSaving(true); setError('')
    try {
      await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ username: form.username.trim(), password: form.password, role: form.role })
      })
      setModal(null)
      load()
    } catch (e) { setError(e.error || 'Ошибка сохранения') }
    finally { setSaving(false) }
  }

  const remove = async (u) => {
    if (!confirm(`Удалить пользователя «${u.username}»?`)) return
    try { await apiFetch(`/api/users/${u.id}`, { method: 'DELETE' }); load() }
    catch (e) { alert('Ошибка: ' + (e.error || e.message)) }
  }

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Пользователи очереди</h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
            {users.length} пользователей
          </p>
        </div>
        <button className="btn-primary" onClick={openNew}>
          <Plus size={14} /> Добавить
        </button>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: 10, borderRadius: 10, fontSize: 13 }}>{error}</div>}

      {loading ? (
        <div className="loading-center"><Loader2 size={28} className="spin" /></div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <UserCog size={40} style={{ color: '#d1d5db' }} />
          <p>Нет пользователей</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Логин</th>
                <th style={{ width: 150 }}>Роль</th>
                <th style={{ width: 110, textAlign: 'center' }}>Кампаний</th>
                <th style={{ width: 130, textAlign: 'center' }}>На модерации</th>
                <th style={{ width: 160 }}>Создан</th>
                <th style={{ width: 110 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const rc = ROLE_COLORS[u.role] || ROLE_COLORS.operator
                const isCurrentAdmin = currentUser?.id === u.id && u.role === 'admin'
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                        {u.role === 'admin' ? <ShieldCheck size={16} style={{ color: '#6d28d9' }} /> : <UserCog size={16} style={{ color: '#9ca3af' }} />}
                        {u.username}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                        background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
                      }}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', color: '#374151' }}>{u.campaigns_total || 0}</td>
                    <td style={{ textAlign: 'center', color: u.campaigns_pending ? '#c2410c' : '#6b7280', fontWeight: u.campaigns_pending ? 700 : 400 }}>
                      {u.campaigns_pending || 0}
                    </td>
                    <td style={{ fontSize: 12, color: '#6b7280' }}>{fmtDateTime(u.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {u.role !== 'admin' && (
                          <>
                            <button className="icon-btn" onClick={() => setModal({ mode: 'password', user: u })} title="Сбросить пароль">
                              <Key size={14} />
                            </button>
                            {!isCurrentAdmin && (
                              <button className="icon-btn icon-btn--danger" onClick={() => remove(u)} title="Удалить">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal?.mode === 'add' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box modal-box--sm">
            <div className="modal-header">
              <h2>Новый пользователь</h2>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); save() }} className="modal-form">
              <UserForm
                form={{ ...form, editingId: null }}
                onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))}
                errors={errors}
              />
              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Отмена</button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal?.mode === 'password' && (
        <PasswordResetModal user={modal.user} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
