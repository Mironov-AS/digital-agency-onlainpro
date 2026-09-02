import { useState, useEffect } from 'react'
import {
  RefreshCw, Loader2, CheckCircle, XCircle, AlertCircle,
  ArrowDownToLine, Users, Briefcase, UserCog, Calendar, Link2, Power,
} from 'lucide-react'
import { apiFetch } from '../../api.js'

function StatusBadge({ ok }) {
  return ok
    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#16a34a', fontSize: 12, fontWeight: 600 }}>
        <CheckCircle size={14} /> Подключено
      </span>
    : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#ef4444', fontSize: 12, fontWeight: 600 }}>
        <XCircle size={14} /> Недоступно
      </span>
}

function SyncCard({ icon: Icon, title, description, stats, onSync, syncing, result }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb',
      padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: '#eff6ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} style={{ color: '#3b82f6' }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{title}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{description}</div>
        </div>
      </div>

      {stats && (
        <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', gap: 16 }}>
          <span>Синхронизировано: <b style={{ color: '#111827' }}>{stats.count || 0}</b></span>
          {stats.last_sync && (
            <span>Последняя: <b style={{ color: '#111827' }}>{new Date(stats.last_sync).toLocaleString('ru-RU')}</b></span>
          )}
        </div>
      )}

      {result && (
        <div style={{
          padding: '8px 12px', borderRadius: 8, fontSize: 12,
          background: result.error ? '#fef2f2' : '#f0fdf4',
          color: result.error ? '#991b1b' : '#166534',
          border: `1px solid ${result.error ? '#fecaca' : '#bbf7d0'}`,
        }}>
          {result.error
            ? <><AlertCircle size={12} style={{ verticalAlign: -2, marginRight: 4 }} />{result.error}</>
            : <><CheckCircle size={12} style={{ verticalAlign: -2, marginRight: 4 }} />{result.message}</>
          }
        </div>
      )}

      <button className="btn-primary-sm" onClick={onSync} disabled={syncing} style={{ alignSelf: 'flex-start' }}>
        {syncing ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
        {syncing ? 'Синхронизация...' : 'Синхронизировать'}
      </button>
    </div>
  )
}

export default function CrmIntegrationTab() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState({})
  const [results, setResults] = useState({})
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [appointments, setAppointments] = useState([])
  const [aptsLoading, setAptsLoading] = useState(false)
  const [showAppointments, setShowAppointments] = useState(false)
  const [integrationEnabled, setIntegrationEnabled] = useState(true)
  const [toggling, setToggling] = useState(false)

  async function loadStatus() {
    setLoading(true)
    try {
      const data = await apiFetch('/api/crm/integration/booking/status')
      setStatus(data)
      setIntegrationEnabled(data.integration_enabled !== false)
    } catch (e) {
      setStatus({ booking_available: false, error: e.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStatus() }, [])

  async function toggleIntegration() {
    const newValue = !integrationEnabled
    setToggling(true)
    try {
      await apiFetch('/api/crm/display-settings', {
        method: 'PUT',
        body: JSON.stringify({ booking_integration_enabled: newValue }),
      })
      setIntegrationEnabled(newValue)
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    } finally {
      setToggling(false)
    }
  }

  async function handleSync(type) {
    setSyncing(s => ({ ...s, [type]: true }))
    setResults(r => ({ ...r, [type]: null }))
    try {
      const body = {}
      if (type === 'customers' || type === 'records') {
        if (dateFrom) body.date_from = dateFrom
        if (dateTo) body.date_to = dateTo
      }

      const urlMap = {
        services: '/api/crm/integration/booking/sync-services',
        specialists: '/api/crm/integration/booking/sync-specialists',
        customers: '/api/crm/integration/booking/sync-customers',
        records: '/api/crm/integration/booking/import-records',
      }

      const data = await apiFetch(urlMap[type], {
        method: 'POST',
        body: JSON.stringify(body),
      })

      let msg = ''
      if (type === 'services') {
        msg = `Всего: ${data.total}. Создано: ${data.created}, обновлено: ${data.updated}, совпало: ${data.skipped}`
      } else if (type === 'specialists') {
        msg = `Всего: ${data.total}. Создано: ${data.created}, обновлено: ${data.updated}, совпало: ${data.skipped}`
      } else if (type === 'customers') {
        msg = `Записей: ${data.total_appointments}. Уникальных клиентов: ${data.unique_customers}. Создано: ${data.created}, найдено: ${data.matched}`
      } else if (type === 'records') {
        msg = `Всего записей: ${data.total}, подтверждённых: ${data.confirmed}. Импортировано: ${data.imported}, пропущено (уже есть): ${data.skipped}`
      }

      setResults(r => ({ ...r, [type]: { message: msg } }))
      loadStatus()
    } catch (e) {
      setResults(r => ({ ...r, [type]: { error: e.error || e.message || 'Ошибка' } }))
    } finally {
      setSyncing(s => ({ ...s, [type]: false }))
    }
  }

  async function loadAppointments() {
    setAptsLoading(true)
    setShowAppointments(true)
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.set('date_from', dateFrom)
      if (dateTo) params.set('date_to', dateTo)
      const data = await apiFetch(`/api/crm/integration/booking/appointments?${params}`)
      setAppointments(Array.isArray(data) ? data : [])
    } catch (e) {
      setAppointments([])
      alert('Ошибка: ' + (e.error || e.message))
    } finally {
      setAptsLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '24px 32px' }}>
        <div className="loading-center"><Loader2 size={28} className="spin" /></div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
            <Link2 size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
            Интеграция с Электронной записью
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
            Синхронизация справочников, клиентов и записей из модуля Booking
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <StatusBadge ok={status?.booking_available} />
          <button className="icon-btn" onClick={loadStatus} title="Обновить статус">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {!status?.booking_available && (
        <div style={{
          padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 12, marginBottom: 20, color: '#991b1b', fontSize: 13,
        }}>
          <AlertCircle size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          Сервис Электронной записи недоступен. Убедитесь, что модуль Booking запущен.
          {status?.error && <div style={{ marginTop: 4, fontSize: 12, color: '#b91c1c' }}>{status.error}</div>}
        </div>
      )}

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, alignItems: 'center',
        padding: '12px 16px', background: '#f9fafb', borderRadius: 10,
        border: '1px solid #e5e7eb',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
          <Calendar size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> Период:
        </span>
        <input type="date" className="field" value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          style={{ flex: '0 1 160px', minWidth: 120 }} autoComplete="off" />
        <span style={{ color: '#9ca3af', fontSize: 13 }}>—</span>
        <input type="date" className="field" value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          style={{ flex: '0 1 160px', minWidth: 120 }} autoComplete="off" />
        <span style={{ fontSize: 11, color: '#9ca3af' }}>
          (для синхр. клиентов и импорта записей)
        </span>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24,
        opacity: integrationEnabled ? 1 : 0.5, pointerEvents: integrationEnabled ? 'auto' : 'none',
      }}>
        <SyncCard
          icon={Briefcase}
          title="Услуги"
          description="Синхронизация каталога услуг из Booking → CRM"
          stats={status?.sync_stats?.service}
          onSync={() => handleSync('services')}
          syncing={syncing.services}
          result={results.services}
        />
        <SyncCard
          icon={UserCog}
          title="Специалисты → Сотрудники"
          description="Синхронизация специалистов из Booking → сотрудники CRM"
          stats={status?.sync_stats?.specialist}
          onSync={() => handleSync('specialists')}
          syncing={syncing.specialists}
          result={results.specialists}
        />
        <SyncCard
          icon={Users}
          title="Клиенты"
          description="Извлечение уникальных клиентов из записей Booking"
          stats={status?.sync_stats?.customer}
          onSync={() => handleSync('customers')}
          syncing={syncing.customers}
          result={results.customers}
        />
        <SyncCard
          icon={ArrowDownToLine}
          title="Записи → Работы"
          description="Импорт подтверждённых записей как рабочих записей CRM"
          stats={status?.sync_stats?.appointment}
          onSync={() => handleSync('records')}
          syncing={syncing.records}
          result={results.records}
        />
      </div>

      {/* Управление интеграцией */}
      <div style={{
        background: integrationEnabled ? '#fff' : '#fefce8', borderRadius: 12,
        border: `1px solid ${integrationEnabled ? '#e5e7eb' : '#fde047'}`,
        padding: 20, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: integrationEnabled ? '#f0fdf4' : '#fef9c3',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Power size={18} style={{ color: integrationEnabled ? '#16a34a' : '#ca8a04' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                {integrationEnabled ? 'Интеграция активна' : 'Интеграция отключена'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {integrationEnabled
                  ? 'Данные синхронизируются автоматически между CRM и Booking'
                  : 'Автоматическая синхронизация и вебхуки отключены'}
              </div>
            </div>
          </div>
          <button
            className={integrationEnabled ? 'btn-danger-sm' : 'btn-primary-sm'}
            onClick={toggleIntegration}
            disabled={toggling}
            style={{ whiteSpace: 'nowrap' }}
          >
            {toggling
              ? <Loader2 size={14} className="spin" />
              : <Power size={14} />
            }
            {integrationEnabled ? 'Отключить интеграцию' : 'Включить интеграцию'}
          </button>
        </div>
        {!integrationEnabled && (
          <div style={{
            marginTop: 12, padding: '10px 14px', background: '#fef3c7',
            borderRadius: 8, fontSize: 12, color: '#92400e',
            border: '1px solid #fde68a',
          }}>
            <AlertCircle size={12} style={{ verticalAlign: -2, marginRight: 4 }} />
            При отключённой интеграции записи из Booking не будут автоматически попадать в CRM,
            фоновая синхронизация приостановлена, вебхуки игнорируются.
          </div>
        )}
      </div>

      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
            Записи Booking с привязкой к CRM
          </h4>
          <button className="btn-primary-sm" onClick={loadAppointments} disabled={aptsLoading}>
            {aptsLoading ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
            Загрузить записи
          </button>
        </div>

        {showAppointments && (
          aptsLoading ? (
            <div className="loading-center"><Loader2 size={20} className="spin" /></div>
          ) : appointments.length === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: 20 }}>
              Нет записей за выбранный период
            </div>
          ) : (
            <div style={{ overflow: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Время</th>
                    <th>Клиент</th>
                    <th>Телефон</th>
                    <th>Услуга</th>
                    <th>Специалист</th>
                    <th>Статус</th>
                    <th>CRM-клиент</th>
                    <th>Импорт</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(apt => (
                    <tr key={apt.id}>
                      <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                        {apt.appointment_date ? new Date(apt.appointment_date).toLocaleDateString('ru-RU') : '—'}
                      </td>
                      <td style={{ fontSize: 13, fontFamily: 'monospace' }}>
                        {apt.appointment_time?.slice(0, 5) || '—'}
                      </td>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{apt.customer_name || '—'}</td>
                      <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{apt.phone || '—'}</td>
                      <td style={{ fontSize: 13, color: '#6b7280' }}>{apt.service_name || '—'}</td>
                      <td style={{ fontSize: 13, color: '#6b7280' }}>{apt.specialist_name || '—'}</td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                          background: apt.status === 'confirmed' ? '#dcfce7' : apt.status === 'canceled' ? '#fee2e2' : '#fef3c7',
                          color: apt.status === 'confirmed' ? '#166534' : apt.status === 'canceled' ? '#991b1b' : '#92400e',
                        }}>
                          {apt.status === 'confirmed' ? 'Подтв.' : apt.status === 'canceled' ? 'Отмена' : 'Ожидание'}
                        </span>
                      </td>
                      <td>
                        {apt.crm_customer ? (
                          <span style={{ fontSize: 12, color: '#16a34a' }}>
                            <CheckCircle size={12} style={{ verticalAlign: -2, marginRight: 2 }} />
                            {apt.crm_customer.full_name}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: '#d97706' }}>
                            <AlertCircle size={12} style={{ verticalAlign: -2, marginRight: 2 }} />
                            Не найден
                          </span>
                        )}
                      </td>
                      <td>
                        {apt.imported_to_crm ? (
                          <CheckCircle size={14} style={{ color: '#16a34a' }} />
                        ) : (
                          <span style={{ color: '#d1d5db' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  )
}
