import { useState } from 'react'
import { LayoutDashboard, LogIn, AlertCircle, Loader2 } from 'lucide-react'
import { apiFetch, clearAccessToken, saveAccessToken } from '../api.js'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      saveAccessToken(data.accessToken)
      if (data.user?.role !== 'admin') {
        clearAccessToken()
        await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
        setError('Доступ запрещен!')
        return
      }
      onLogin(data.user)
    } catch (err) {
      setError(err.error || 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <LayoutDashboard size={32} />
          <span>Цифровое агентство ОнлайнПро.РФ</span>
        </div>
        <h1 className="login-title">Вход в систему</h1>
        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          <label className="field-label">Email</label>
          <input
            className="field-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoFocus
            autoComplete="off"
          />
          <label className="field-label">Пароль</label>
          <input
            className="field-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
          {error && (
            <div className="error-msg"><AlertCircle size={14} />{error}</div>
          )}
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? <Loader2 size={16} className="spin" /> : <LogIn size={16} />}
            {loading ? 'Входим…' : 'Войти'}
          </button>
        </form>
        <a href="/" className="back-link">← На главную</a>
      </div>
      <div className="login-brand-footer">
        <span className="login-brand-text">ОнлайнПро.РФ</span>
      </div>
    </div>
  )
}
