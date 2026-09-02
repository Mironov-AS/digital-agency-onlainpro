import { useState, useEffect } from 'react'
import { apiFetch } from '../api.js'
import {
  Plus, Pencil, Trash2, ArrowLeft, Loader2, X, Check,
  DollarSign, ToggleLeft, ToggleRight,
} from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { INTERVAL_LABELS as PERIOD_LABELS } from '../constants/intervals.js'

function fmt(n) { return (n || 0).toLocaleString('ru-RU') }

const EMPTY_FORM = { name: '', amount: '', period: 'monthly', note: '' }

function OrgCostForm({ form, onChange, errors }) {
  return (
    <div className="form-grid" style={{ padding: '0 0 8px' }}>
      <div className="form-row">
        <label>Название затраты *</label>
        <input className={`field ${errors.name ? 'field-error' : ''}`} value={form.name}
          onChange={e => onChange('name', e.target.value)} placeholder="Хостинг сервера" />
      </div>
      <div className="form-row">
        <label>Сумма (₽)</label>
        <input type="number" min="0" className={`field ${errors.amount ? 'field-error' : ''}`}
          value={form.amount} onChange={e => onChange('amount', e.target.value)} placeholder="0" />
      </div>
      <div className="form-row">
        <label>Периодичность</label>
        <select className="field" value={form.period} onChange={e => onChange('period', e.target.value)}>
          {Object.entries(PERIOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div className="form-row" style={{ gridColumn: '1 / -1' }}>
        <label>Примечание</label>
        <input className="field" value={form.note} onChange={e => onChange('note', e.target.value)} placeholder="Оплата за..." />
      </div>
    </div>
  )
}

export default function OrgCostsPage({ onBack }) {
  const [costs, setCosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)

  async function load() {
    setLoading(true); setError('')
    try {
      const data = await apiFetch('/api/clients/org-costs')
      setCosts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.error || 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleSubmit() {
    const form = modal.form
    const errors = {}
    if (!form.name.trim()) errors.name = 'Название обязательно'
    if (form.amount && isNaN(Number(form.amount))) errors.amount = 'Некорректная сумма'
    if (Object.keys(errors).length) { setModal(m => ({ ...m, errors })); return }

    setModal(m => ({ ...m, loading: true, serverError: '' }))
    try {
      if (modal.mode === 'add') {
        const created = await apiFetch('/api/clients/org-costs', {
          method: 'POST',
          body: JSON.stringify(form),
        })
        setCosts(c => [...c, created])
      } else {
        const updated = await apiFetch(`/api/clients/org-costs/${modal.target.id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        })
        setCosts(c => c.map(x => x.id === updated.id ? updated : x))
      }
      setModal(null)
    } catch (err) {
      setModal(m => ({ ...m, loading: false, serverError: err.error || 'Ошибка сохранения' }))
    }
  }

  async function handleToggle(cost) {
    try {
      const updated = await apiFetch(`/api/clients/org-costs/${cost.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: cost.is_active ? 0 : 1 }),
      })
      setCosts(c => c.map(x => x.id === updated.id ? updated : x))
    } catch {}
  }

  async function handleDelete() {
    setModal(m => ({ ...m, loading: true, serverError: '' }))
    try {
      await apiFetch(`/api/clients/org-costs/${modal.target.id}`, { method: 'DELETE' })
      setCosts(c => c.filter(x => x.id !== modal.target.id))
      setModal(null)
    } catch (err) {
      setModal(m => ({ ...m, loading: false, serverError: err.error || 'Ошибка удаления' }))
    }
  }

  const activeCosts = costs.filter(c => c.is_active)
  const totalMonthly = activeCosts.reduce((sum, c) => {
    let monthly = Number(c.amount) || 0
    if (c.period === 'quarterly') monthly /= 3
    else if (c.period === 'yearly') monthly /= 12
    else if (c.period === 'once') monthly /= 12
    return sum + monthly
  }, 0)

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-back" onClick={onBack}><ArrowLeft size={16} /> Назад</button>
        <div>
          <h1 className="page-title">Общие затраты организации</h1>
          <p className="page-sub">Хостинг, домены, зарплаты, налоги, аренда</p>
        </div>
        <button className="btn-primary-sm" onClick={() => setModal({ mode: 'add', form: { ...EMPTY_FORM }, errors: {}, loading: false, serverError: '' })} style={{ marginLeft: 'auto' }}>
          <Plus size={16} /> Добавить затрату
        </button>
      </div>

      {totalMonthly > 0 && (
        <div style={{ margin: '0 32px 16px', padding: '12px 20px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <DollarSign size={16} style={{ color: '#c2410c' }} />
          <span style={{ fontSize: 14, color: '#9a3412' }}>
            Регулярные затраты: <strong>{fmt(Math.round(totalMonthly))} ₽/мес</strong> ({activeCosts.length} позиций)
          </span>
        </div>
      )}

      {loading ? (
        <div className="loading-center"><Loader2 size={24} className="spin" /></div>
      ) : error ? (
        <div className="page-error">{error} <button onClick={load}>Повторить</button></div>
      ) : costs.length === 0 ? (
        <div className="empty-state">
          <DollarSign size={40} style={{ color: '#9ca3af', marginBottom: 12 }} />
          <p>Затрат пока нет</p>
          <button className="btn-primary-sm" onClick={() => setModal({ mode: 'add', form: { ...EMPTY_FORM }, errors: {}, loading: false, serverError: '' })}>
            <Plus size={14} /> Добавить первую
          </button>
        </div>
      ) : (
        <div className="table-wrap" style={{ margin: '0 32px' }}>
          <table className="data-table">
            <thead><tr>
              <th>Название</th>
              <th style={{ width: 120 }}>Сумма</th>
              <th style={{ width: 150 }}>Периодичность</th>
              <th style={{ width: 150 }}>В месяц</th>
              <th style={{ width: 100 }}>Статус</th>
              <th style={{ width: 100 }}>Действия</th>
            </tr></thead>
            <tbody>
              {costs.map(c => {
                let monthly = Number(c.amount) || 0
                if (c.period === 'quarterly') monthly /= 3
                else if (c.period === 'yearly') monthly /= 12
                else if (c.period === 'once') monthly /= 12
                return (
                  <tr key={c.id} className="svc-row">
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      {c.note && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{c.note}</div>}
                    </td>
                    <td style={{ fontWeight: 700 }}>{fmt(c.amount)} ₽</td>
                    <td><span style={{ fontSize: 13, color: '#6b7280' }}>{PERIOD_LABELS[c.period] || c.period}</span></td>
                    <td style={{ fontWeight: c.period !== 'once' ? 600 : 400, color: c.period !== 'once' ? '#f97316' : '#9ca3af' }}>
                      {c.period === 'once' ? '—' : `${fmt(Math.round(monthly))} ₽`}
                    </td>
                    <td>
                      <button
                        className="icon-btn"
                        onClick={() => handleToggle(c)}
                        title={c.is_active ? 'Отключить' : 'Включить'}
                        style={{ color: c.is_active ? '#16a34a' : '#9ca3af' }}
                      >
                        {c.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                    </td>
                    <td>
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
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (modal.mode === 'add' || modal.mode === 'edit') && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <h2>{modal.mode === 'add' ? 'Новая затрата' : 'Редактировать затрату'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleSubmit() }} className="modal-form">
              <OrgCostForm
                form={modal.form}
                onChange={(k, v) => setModal(m => ({ ...m, form: { ...m.form, [k]: v } }))}
                errors={modal.errors}
              />
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
          title="Удалить затрату"
          message={`Удалить «${modal.target.name}»?`}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
          loading={modal.loading}
          danger
        />
      )}
    </div>
  )
}