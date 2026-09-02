import { useState, useEffect } from 'react'
import { apiFetch } from '../api.js'
import {
  Plus, Pencil, Trash2, ArrowLeft, Loader2, X, Check,
  FolderKanban, ExternalLink, Link as LinkIcon,
} from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal.jsx'

const STATUS_LABELS = {
  active: 'Активен',
  completed: 'Завершён',
  on_hold: 'На паузе',
  cancelled: 'Отменён',
}

const STATUS_COLORS = {
  active: '#16a34a',
  completed: '#3b82f6',
  on_hold: '#f59e0b',
  cancelled: '#ef4444',
}

function fmt(n) { return (n || 0).toLocaleString('ru-RU') }

const EMPTY_FORM = { title: '', client_name: '', service_name: '', prod_url: '', description: '', notes: '', status: 'active' }

function ProjectForm({ form, onChange, errors }) {
  return (
    <div className="form-grid" style={{ padding: '0 0 8px' }}>
      <div className="form-row">
        <label>Название проекта *</label>
        <input className={`field ${errors.title ? 'field-error' : ''}`} value={form.title}
          onChange={e => onChange('title', e.target.value)} placeholder="Лендинг для ООО «Пример»" />
      </div>
      <div className="form-row">
        <label>Клиент</label>
        <input className="field" value={form.client_name}
          onChange={e => onChange('client_name', e.target.value)} placeholder="ООО «Пример»" />
      </div>
      <div className="form-row">
        <label>Услуга</label>
        <input className="field" value={form.service_name}
          onChange={e => onChange('service_name', e.target.value)} placeholder="Landing Page" />
      </div>
      <div className="form-row">
        <label>URL продакшена</label>
        <input className="field" value={form.prod_url}
          onChange={e => onChange('prod_url', e.target.value)} placeholder="https://example.ru" />
      </div>
      <div className="form-row" style={{ gridColumn: '1 / -1' }}>
        <label>Описание</label>
        <input className="field" value={form.description}
          onChange={e => onChange('description', e.target.value)} placeholder="Краткое описание проекта" />
      </div>
      <div className="form-row">
        <label>Статус</label>
        <select className="field" value={form.status} onChange={e => onChange('status', e.target.value)}>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div className="form-row" style={{ gridColumn: '1 / -1' }}>
        <label>Заметки</label>
        <input className="field" value={form.notes}
          onChange={e => onChange('notes', e.target.value)} placeholder="Дополнительная информация" />
      </div>
    </div>
  )
}

export default function ProjectsPage({ onBack }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)

  async function load() {
    setLoading(true); setError('')
    try {
      const data = await apiFetch('/api/projects')
      setProjects(Array.isArray(data) ? data : [])
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
    if (!form.title.trim()) errors.title = 'Название обязательно'
    if (Object.keys(errors).length) { setModal(m => ({ ...m, errors })); return }

    setModal(m => ({ ...m, loading: true, serverError: '' }))
    try {
      if (modal.mode === 'add') {
        const created = await apiFetch('/api/projects', {
          method: 'POST',
          body: JSON.stringify(form),
        })
        setProjects(c => [created, ...c])
      } else {
        const updated = await apiFetch(`/api/projects/${modal.target.id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        })
        setProjects(c => c.map(x => x.id === updated.id ? updated : x))
      }
      setModal(null)
    } catch (err) {
      setModal(m => ({ ...m, loading: false, serverError: err.error || 'Ошибка сохранения' }))
    }
  }

  async function handleDelete() {
    setModal(m => ({ ...m, loading: true, serverError: '' }))
    try {
      await apiFetch(`/api/projects/${modal.target.id}`, { method: 'DELETE' })
      setProjects(c => c.filter(x => x.id !== modal.target.id))
      setModal(null)
    } catch (err) {
      setModal(m => ({ ...m, loading: false, serverError: err.error || 'Ошибка удаления' }))
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-back" onClick={onBack}><ArrowLeft size={16} /> Назад</button>
        <div>
          <h1 className="page-title">Реализованные проекты</h1>
          <p className="page-sub">Учёт проектов, ссылки на продакшн, брошюры, инструкции</p>
        </div>
        <button className="btn-primary-sm" onClick={() => setModal({ mode: 'add', form: { ...EMPTY_FORM }, errors: {}, loading: false, serverError: '' })} style={{ marginLeft: 'auto' }}>
          <Plus size={16} /> Добавить проект
        </button>
      </div>

      {loading ? (
        <div className="loading-center"><Loader2 size={24} className="spin" /></div>
      ) : error ? (
        <div className="page-error">{error} <button onClick={load}>Повторить</button></div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <FolderKanban size={40} style={{ color: '#9ca3af', marginBottom: 12 }} />
          <p>Проектов пока нет</p>
          <button className="btn-primary-sm" onClick={() => setModal({ mode: 'add', form: { ...EMPTY_FORM }, errors: {}, loading: false, serverError: '' })}>
            <Plus size={14} /> Добавить первый проект
          </button>
        </div>
      ) : (
        <div className="table-wrap" style={{ margin: '0 32px' }}>
          <table className="data-table">
            <thead><tr>
              <th>Проект</th>
              <th style={{ width: 150 }}>Клиент</th>
              <th style={{ width: 150 }}>Услуга</th>
              <th style={{ width: 120 }}>Статус</th>
              <th style={{ width: 120 }}>Продакшен</th>
              <th style={{ width: 100 }}>Действия</th>
            </tr></thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} className="svc-row">
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.title}</div>
                    {p.description && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{p.description}</div>}
                  </td>
                  <td style={{ color: '#374151' }}>{p.client_name || '—'}</td>
                  <td style={{ fontSize: 13, color: '#6b7280' }}>{p.service_name || '—'}</td>
                  <td>
                    <span style={{
                      fontSize: 12, padding: '2px 8px', borderRadius: 12,
                      background: STATUS_COLORS[p.status] + '22',
                      color: STATUS_COLORS[p.status],
                      fontWeight: 500,
                    }}>
                      {STATUS_LABELS[p.status] || p.status}
                    </span>
                  </td>
                  <td>
                    {p.prod_url ? (
                      <a href={p.prod_url} target="_blank" rel="noreferrer" className="icon-btn" title="Открыть продакшен" style={{ color: '#3b82f6' }}>
                        <ExternalLink size={15} />
                      </a>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="icon-btn" onClick={() => setModal({ mode: 'edit', target: p, form: { ...p }, errors: {}, loading: false, serverError: '' })} title="Редактировать">
                        <Pencil size={15} />
                      </button>
                      <button className="icon-btn icon-btn--danger" onClick={() => setModal({ mode: 'delete', target: p, loading: false, serverError: '' })} title="Удалить">
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
              <h2>{modal.mode === 'add' ? 'Новый проект' : 'Редактировать проект'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleSubmit() }} className="modal-form">
              <ProjectForm
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
          title="Удалить проект"
          message={`Удалить «${modal.target.title}»?`}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
          loading={modal.loading}
          danger
        />
      )}
    </div>
  )
}