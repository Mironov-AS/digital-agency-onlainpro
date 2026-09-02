import { useState, useEffect } from 'react'
import { Send, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { apiFetch } from '../../api.js'

export default function SmtpSettingsTab() {
  const [form, setForm] = useState({
    host: '', port: 465, username: '', password: '',
    from_email: '', from_name: '', use_ssl: true, is_enabled: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [message, setMessage] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await apiFetch('/api/admin/smtp-settings')
      setForm({
        host: data.host || '', port: data.port || 465,
        username: data.username || '', password: '',
        from_email: data.from_email || '', from_name: data.from_name || '',
        use_ssl: data.use_ssl ?? true, is_enabled: data.is_enabled ?? false,
      })
    } catch (e) {
      setMessage({ type: 'error', text: e.error || 'Ошибка загрузки настроек' })
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleSave(e) {
    e.preventDefault()
    if (!form.host.trim() || !form.username.trim() || !form.from_email.trim()) {
      setMessage({ type: 'error', text: 'Заполните обязательные поля: хост, имя пользователя, email отправителя' })
      return
    }
    setSaving(true); setMessage(null)
    try {
      await apiFetch('/api/admin/smtp-settings', { method: 'PUT', body: JSON.stringify(form) })
      setMessage({ type: 'success', text: 'Настройки сохранены' })
    } catch (e) {
      setMessage({ type: 'error', text: e.error || 'Ошибка сохранения' })
    } finally { setSaving(false) }
  }

  async function handleTest() {
    if (!testEmail.trim()) {
      setMessage({ type: 'error', text: 'Введите email для тестового письма' })
      return
    }
    setTesting(true); setMessage(null)
    try {
      const res = await apiFetch('/api/admin/smtp-test', { method: 'POST', body: JSON.stringify({ test_email: testEmail }) })
      setMessage({ type: 'success', text: res.message || 'Тестовое письмо отправлено' })
    } catch (e) {
      setMessage({ type: 'error', text: e.error || 'Ошибка тестирования' })
    } finally { setTesting(false) }
  }

  if (loading) return <p style={{ color: '#6b7280', padding: '40px 0', textAlign: 'center' }}>Загрузка...</p>

  const inputStyle = { display: 'block', width: '100%', boxSizing: 'border-box' }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Настройки SMTP-сервера</h2>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          Настройте подключение к SMTP-серверу для отправки email-уведомлений о заявках
        </p>
      </div>

      {message && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px',
          background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: message.type === 'success' ? '#16a34a' : '#dc2626',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
        }}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} autoComplete="off">
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>Подключение</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
              <input type="checkbox" checked={form.is_enabled} onChange={e => setForm(f => ({ ...f, is_enabled: e.target.checked }))} />
              <span style={{ color: form.is_enabled ? '#16a34a' : '#6b7280' }}>
                {form.is_enabled ? 'Включено' : 'Выключено'}
              </span>
            </label>
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label>SMTP-хост *</label>
              <input className="field" style={inputStyle} value={form.host} onChange={e => setForm(f => ({ ...f, host: e.target.value }))} placeholder="smtp.yandex.ru" autoComplete="off" />
            </div>
            <div className="form-row">
              <label>Порт *</label>
              <input className="field" style={inputStyle} type="number" value={form.port} onChange={e => setForm(f => ({ ...f, port: Number(e.target.value) }))} placeholder="465" autoComplete="off" />
            </div>
            <div className="form-row">
              <label>Имя пользователя *</label>
              <input className="field" style={inputStyle} value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="user@yandex.ru" autoComplete="off" />
            </div>
            <div className="form-row">
              <label>Пароль *</label>
              <div style={{ position: 'relative' }}>
                <input className="field" style={{ ...inputStyle, paddingRight: '40px' }}
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Пароль сохранён — оставьте пустым" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
              <input type="checkbox" checked={form.use_ssl} onChange={e => setForm(f => ({ ...f, use_ssl: e.target.checked }))} />
              SSL/TLS (порт 465)
            </label>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Отправитель</h3>
          <div className="form-grid">
            <div className="form-row">
              <label>Email отправителя *</label>
              <input className="field" style={inputStyle} type="email" value={form.from_email} onChange={e => setForm(f => ({ ...f, from_email: e.target.value }))} placeholder="noreply@company.ru" autoComplete="off" />
            </div>
            <div className="form-row">
              <label>Имя отправителя</label>
              <input className="field" style={inputStyle} value={form.from_name} onChange={e => setForm(f => ({ ...f, from_name: e.target.value }))} placeholder="Заявки с сайта" autoComplete="off" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </div>
      </form>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>Тестирование</h3>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
          Отправьте тестовое письмо для проверки подключения. Настройки должны быть предварительно сохранены.
        </p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Email получателя</label>
            <input className="field" style={inputStyle} type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="test@example.com" autoComplete="off" />
          </div>
          <button type="button" className="btn-primary" onClick={handleTest} disabled={testing} style={{ whiteSpace: 'nowrap', height: '38px' }}>
            <Send size={14} /> {testing ? 'Отправка...' : 'Отправить тест'}
          </button>
        </div>
      </div>
    </div>
  )
}
