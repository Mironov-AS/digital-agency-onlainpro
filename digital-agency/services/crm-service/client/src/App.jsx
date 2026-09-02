import { useState, useEffect } from 'react'
import { saveAccessToken, clearAccessToken, apiFetch } from './api'
import CrmLightPage from './pages/CrmLightPage'

export default function App() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const authToken = params.get('auth_token') || params.get('token')
    if (authToken) {
      saveAccessToken(authToken)
      params.delete('auth_token')
      params.delete('token')
      params.delete('client_id')
      const qs = params.toString()
      window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''))
    }

    apiFetch('/api/crm/display-settings')
      .then(() => setReady(true))
      .catch(() => {
        clearAccessToken()
        setError('Не удалось авторизоваться. Вернитесь в личный кабинет и попробуйте снова.')
      })
  }, [])

  if (error) {
    return (
      <div className="crm-auth-error">
        <p>{error}</p>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="crm-auth-loading">
        <div className="spin" style={{ width: 24, height: 24, border: '3px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%' }} />
      </div>
    )
  }

  return <CrmLightPage />
}
