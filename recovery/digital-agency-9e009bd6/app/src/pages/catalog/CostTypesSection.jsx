import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2, X, Check } from 'lucide-react'
import { apiFetch } from '../../api.js'
import { API_COSTS, ConfirmDelete } from './shared.jsx'

export default function CostTypesSection({ isAdmin }) {
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', sort_order: 0 })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  async function load() {
    setLoading(true)
    try { setTypes(await apiFetch(`${API_COSTS}/types`)) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function startAdd() { setEditId(null); setForm({ name: '', description: '', sort_order: types.length }); setAdding(true) }
  function startEdit(t) { setAdding(false); setEditId(t.id); setForm({ name: t.name, description: t.description, sort_order: t.sort_order }) }
  function cancel() { setAdding(false); setEditId(null) }

  async function save(id) {
    setSaving(true)
    try {
      const body = JSON.stringify({ ...form, sort_order: Number(form.sort_order) })
      if (id) await apiFetch(`${API_COSTS}/types/${id}`, { method: 'PUT', body })
      else await apiFetch(`${API_COSTS}/types`, { method: 'POST', body })
      cancel(); load()
    } finally { setSaving(false) }
  }

  async function del(t) {
    await apiFetch(`${API_COSTS}/types/${t.id}`, { method: 'DELETE' })
    setDeleting(null); load()
  }

  if (loading) return <div className="loading-center"><Loader2 size={22} className="spin" /></div>

  return (
    <>
      {isAdmin && (
        <div className="section-toolbar">
          <button className="btn-primary-sm" onClick={startAdd}><Plus size={16} /> Добавить вид затраты</button>
        </div>
      )}

      {types.length === 0 && !adding && <div className="empty-state">Справочник затрат пуст</div>}

      {(types.length > 0 || adding) && (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr>
              <th>Наименование</th><th>Описание</th><th style={{ width: 90 }}>Порядок</th>
              {isAdmin && <th style={{ width: 100 }}>Действия</th>}
            </tr></thead>
            <tbody>
              {types.map(t => (
                editId === t.id ? (
                  <tr key={t.id} className="svc-row">
                    <td><input className="field" style={{ padding: '5px 8px' }} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoComplete="off" /></td>
                    <td><input className="field" style={{ padding: '5px 8px' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} autoComplete="off" /></td>
                    <td><input type="number" className="field" style={{ padding: '5px 8px', width: 60 }} value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} autoComplete="off" /></td>
                    <td>
                      <button className="icon-btn" onClick={() => save(t.id)} disabled={saving}>{saving ? <Loader2 size={13} className="spin" /> : <Check size={13} />}</button>
                      <button className="icon-btn" onClick={cancel}><X size={13} /></button>
                    </td>
                  </tr>
                ) : (
                  <tr key={t.id} className="svc-row">
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td style={{ color: '#6b7280', fontSize: 13 }}>{t.description || '—'}</td>
                    <td className="td-order">{t.sort_order}</td>
                    {isAdmin && (
                      <td className="td-actions">
                        <button className="icon-btn" onClick={() => startEdit(t)}><Pencil size={14} /></button>
                        <button className="icon-btn icon-btn--danger" onClick={() => setDeleting(t)}><Trash2 size={14} /></button>
                      </td>
                    )}
                  </tr>
                )
              ))}

              {adding && (
                <tr className="svc-row">
                  <td><input className="field" style={{ padding: '5px 8px' }} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Хостинг" autoFocus autoComplete="off" /></td>
                  <td><input className="field" style={{ padding: '5px 8px' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Оплата хостинга" autoComplete="off" /></td>
                  <td><input type="number" className="field" style={{ padding: '5px 8px', width: 60 }} value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} autoComplete="off" /></td>
                  <td>
                    <button className="icon-btn" onClick={() => save(null)} disabled={saving || !form.name.trim()}>{saving ? <Loader2 size={13} className="spin" /> : <Check size={13} />}</button>
                    <button className="icon-btn" onClick={cancel}><X size={13} /></button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {deleting && <ConfirmDelete name={deleting.name} onConfirm={() => del(deleting)} onClose={() => setDeleting(null)} />}
    </>
  )
}
