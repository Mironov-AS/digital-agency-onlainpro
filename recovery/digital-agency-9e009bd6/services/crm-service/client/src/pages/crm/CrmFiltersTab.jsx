import { useState, useEffect } from 'react'
import {
  Plus, Trash2, X, Check, Loader2, Edit2, Filter,
  ChevronDown, ChevronUp, Save,
} from 'lucide-react'
import { apiFetch } from '../../api.js'

const STANDARD_FIELDS = [
  { value: 'full_name', label: 'ФИО' },
  { value: 'phone', label: 'Телефон' },
  { value: 'email', label: 'E-mail' },
  { value: 'additional_contacts', label: 'Доп. контакты' },
  { value: 'notes', label: 'Примечания' },
  { value: 'created_at', label: 'Дата создания' },
]

const TEXT_OPERATORS = [
  { value: 'contains', label: 'Содержит' },
  { value: 'equals', label: 'Равно' },
  { value: 'starts_with', label: 'Начинается с' },
  { value: 'not_empty', label: 'Не пусто' },
  { value: 'is_empty', label: 'Пусто' },
]

const DATE_OPERATORS = [
  { value: 'equals', label: 'Равно' },
  { value: 'gt', label: 'После' },
  { value: 'lt', label: 'До' },
  { value: 'range', label: 'Диапазон' },
  { value: 'not_empty', label: 'Не пусто' },
  { value: 'is_empty', label: 'Пусто' },
]

const NUMBER_OPERATORS = [
  { value: 'equals', label: 'Равно' },
  { value: 'gt', label: 'Больше' },
  { value: 'lt', label: 'Меньше' },
  { value: 'not_empty', label: 'Не пусто' },
  { value: 'is_empty', label: 'Пусто' },
]

const OPERATOR_LABELS = {
  contains: 'Содержит', equals: 'Равно', starts_with: 'Начинается с',
  not_empty: 'Не пусто', is_empty: 'Пусто',
  gt: 'Больше / После', lt: 'Меньше / До', range: 'Диапазон',
}

function getOperatorsForField(fieldValue, customFields) {
  if (fieldValue === 'created_at') return DATE_OPERATORS
  if (fieldValue?.startsWith('cf_')) {
    const cfId = fieldValue.slice(3)
    const cf = customFields.find(f => f.id === cfId)
    if (cf?.field_type === 'number') return NUMBER_OPERATORS
    if (cf?.field_type === 'date') return DATE_OPERATORS
    if (cf?.field_type === 'checkbox') return [
      { value: 'equals', label: 'Равно' },
      { value: 'not_empty', label: 'Не пусто' },
      { value: 'is_empty', label: 'Пусто' },
    ]
  }
  return TEXT_OPERATORS
}

function needsValue(operator) {
  return !['not_empty', 'is_empty'].includes(operator)
}

function ConditionEditor({ conditions, customFields, onChange }) {
  const allFields = [
    ...STANDARD_FIELDS,
    ...customFields.map(f => ({ value: `cf_${f.id}`, label: `${f.name} (доп.)` })),
  ]

  function updateCondition(index, patch) {
    const next = conditions.map((c, i) => i === index ? { ...c, ...patch } : c)
    onChange(next)
  }

  function removeCondition(index) {
    onChange(conditions.filter((_, i) => i !== index))
  }

  function addCondition() {
    onChange([...conditions, { field: 'full_name', operator: 'contains', value: '' }])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {conditions.map((c, i) => {
        const operators = getOperatorsForField(c.field, customFields)
        const validOp = operators.find(o => o.value === c.operator) ? c.operator : operators[0]?.value
        if (validOp !== c.operator) {
          setTimeout(() => updateCondition(i, { operator: validOp, value: '', value_from: '', value_to: '' }), 0)
        }

        return (
          <div key={i} style={{
            display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start',
            padding: '8px 10px', background: '#f9fafb', borderRadius: 8,
            border: '1px solid #e5e7eb',
          }}>
            <select className="field" value={c.field}
              onChange={e => updateCondition(i, { field: e.target.value, operator: 'contains', value: '', value_from: '', value_to: '' })}
              style={{ flex: '1 1 160px', minWidth: 120, maxWidth: 260, fontSize: 13 }} autoComplete="off">
              {allFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>

            <select className="field" value={c.operator}
              onChange={e => updateCondition(i, { operator: e.target.value, value: '', value_from: '', value_to: '' })}
              style={{ flex: '1 1 130px', minWidth: 100, maxWidth: 200, fontSize: 13 }} autoComplete="off">
              {operators.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {needsValue(c.operator) && c.operator !== 'range' && (
              <input className="field" value={c.value || ''}
                onChange={e => updateCondition(i, { value: e.target.value })}
                placeholder="Значение"
                type={c.field === 'created_at' || (c.field?.startsWith('cf_') && customFields.find(f => f.id === c.field?.slice(3))?.field_type === 'date') ? 'date' : 'text'}
                style={{ flex: '2 1 140px', minWidth: 100, fontSize: 13 }} autoComplete="off" />
            )}

            {c.operator === 'range' && (
              <>
                <input className="field" value={c.value_from || ''}
                  onChange={e => updateCondition(i, { value_from: e.target.value })}
                  placeholder="От" type="date"
                  style={{ flex: '1 1 120px', minWidth: 100, fontSize: 13 }} autoComplete="off" />
                <input className="field" value={c.value_to || ''}
                  onChange={e => updateCondition(i, { value_to: e.target.value })}
                  placeholder="До" type="date"
                  style={{ flex: '1 1 120px', minWidth: 100, fontSize: 13 }} autoComplete="off" />
              </>
            )}

            {!needsValue(c.operator) && (
              <div style={{ flex: '1 1 100px' }} />
            )}

            <button className="icon-btn icon-btn--danger" onClick={() => removeCondition(i)} title="Удалить условие"
              style={{ flexShrink: 0, marginTop: 2 }}>
              <X size={14} />
            </button>
          </div>
        )
      })}

      <button className="btn-primary-sm" onClick={addCondition}
        style={{ alignSelf: 'flex-start', fontSize: 12, padding: '4px 12px' }}>
        <Plus size={12} /> Добавить условие
      </button>
    </div>
  )
}

export default function CrmFiltersTab() {
  const [templates, setTemplates] = useState([])
  const [customFields, setCustomFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editLogic, setEditLogic] = useState('and')
  const [editConditions, setEditConditions] = useState([])
  const [saving, setSaving] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newLogic, setNewLogic] = useState('and')
  const [newConditions, setNewConditions] = useState([{ field: 'full_name', operator: 'contains', value: '' }])
  const [creatingSaving, setCreatingSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const [tpl, fields] = await Promise.all([
        apiFetch('/api/crm/search-templates'),
        apiFetch('/api/crm/custom-fields'),
      ])
      setTemplates(Array.isArray(tpl) ? tpl : [])
      setCustomFields(Array.isArray(fields) ? fields.filter(f => !f.is_deleted) : [])
    } catch (e) {
      console.error('[crm] load filters', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  function getFieldLabel(fieldValue) {
    const std = STANDARD_FIELDS.find(f => f.value === fieldValue)
    if (std) return std.label
    if (fieldValue?.startsWith('cf_')) {
      const cfId = fieldValue.slice(3)
      const cf = customFields.find(f => f.id === cfId)
      return cf ? cf.name : fieldValue
    }
    return fieldValue
  }

  async function handleDelete(id) {
    if (!confirm('Удалить шаблон фильтра?')) return
    try {
      await apiFetch(`/api/crm/search-templates/${id}`, { method: 'DELETE' })
      setTemplates(prev => prev.filter(t => t.id !== id))
      if (expanded === id) setExpanded(null)
      if (editId === id) setEditId(null)
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    }
  }

  function startEdit(t) {
    setEditId(t.id)
    setEditName(t.name)
    setEditLogic(t.config?.logic || 'and')
    setEditConditions(JSON.parse(JSON.stringify(t.config?.conditions || [])))
    setExpanded(t.id)
  }

  function cancelEdit() {
    setEditId(null)
    setEditConditions([])
  }

  async function saveEdit() {
    if (!editName.trim()) return
    if (editConditions.length === 0) { alert('Добавьте хотя бы одно условие'); return }
    setSaving(true)
    try {
      const config = { conditions: editConditions, logic: editLogic }
      const result = await apiFetch(`/api/crm/search-templates/${editId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editName.trim(), config }),
      })
      setTemplates(prev => prev.map(t => t.id === editId ? { ...t, name: editName.trim(), config: result.config || config } : t))
      setEditId(null)
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    } finally {
      setSaving(false)
    }
  }

  function openNewForm() {
    setShowNew(true)
    setNewName('')
    setNewLogic('and')
    setNewConditions([{ field: 'full_name', operator: 'contains', value: '' }])
  }

  async function createNew() {
    if (!newName.trim()) { alert('Введите название'); return }
    if (newConditions.length === 0) { alert('Добавьте хотя бы одно условие'); return }
    setCreatingSaving(true)
    try {
      const config = { conditions: newConditions, logic: newLogic }
      const created = await apiFetch('/api/crm/search-templates', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim(), config }),
      })
      setTemplates(prev => [...prev, created])
      setShowNew(false)
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    } finally {
      setCreatingSaving(false)
    }
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Шаблоны фильтров</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
            Управляйте шаблонами поиска клиентов: создавайте, редактируйте условия и удаляйте
          </p>
        </div>
        <button className="btn-primary" onClick={openNewForm} disabled={showNew}>
          <Plus size={14} /> Новый фильтр
        </button>
      </div>

      {showNew && (
        <div style={{
          background: '#fff', borderRadius: 12, border: '2px solid #3b82f6',
          padding: 20, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Новый шаблон фильтра</h4>
            <button className="icon-btn" onClick={() => setShowNew(false)} title="Отмена"><X size={16} /></button>
          </div>

          <div className="form-row" style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Название</label>
            <input className="field" value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Например: VIP-клиенты" autoFocus autoComplete="off" />
          </div>

          <div className="form-row" style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Логика условий</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={newLogic === 'and' ? 'btn-primary-sm' : 'btn-cancel'}
                onClick={() => setNewLogic('and')} style={{ fontSize: 12, padding: '4px 14px' }}>
                И (все совпадают)
              </button>
              <button className={newLogic === 'or' ? 'btn-primary-sm' : 'btn-cancel'}
                onClick={() => setNewLogic('or')} style={{ fontSize: 12, padding: '4px 14px' }}>
                ИЛИ (любое совпадает)
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Условия</label>
            <ConditionEditor conditions={newConditions} customFields={customFields} onChange={setNewConditions} />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn-cancel" onClick={() => setShowNew(false)}>Отмена</button>
            <button className="btn-save" onClick={createNew} disabled={creatingSaving}>
              {creatingSaving ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
              {creatingSaving ? 'Сохранение...' : 'Создать'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-center"><Loader2 size={28} className="spin" /></div>
      ) : templates.length === 0 && !showNew ? (
        <div className="empty-state">
          <Filter size={32} style={{ color: '#d1d5db', marginBottom: 8 }} />
          <p>Нет сохранённых шаблонов</p>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>
            Нажмите «Новый фильтр» или создайте шаблон из расширенного поиска на вкладке «Клиенты»
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {templates.map(t => {
            const isExpanded = expanded === t.id
            const isEditing = editId === t.id
            const conditions = isEditing ? editConditions : (t.config?.conditions || [])
            const logic = isEditing ? editLogic : (t.config?.logic || 'and')

            return (
              <div key={t.id} style={{
                background: '#fff', borderRadius: 12,
                border: isEditing ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                transition: 'box-shadow 0.15s',
                ...(isExpanded ? { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } : {}),
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', cursor: 'pointer',
                }}
                  onClick={() => { if (!isEditing) setExpanded(isExpanded ? null : t.id) }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <Filter size={15} style={{ color: '#6366f1', flexShrink: 0 }} />
                    {isEditing ? (
                      <input className="field" value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        style={{ fontSize: 14, padding: '4px 8px', fontWeight: 600 }}
                        autoComplete="off" />
                    ) : (
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {!isEditing && (
                      <span style={{ fontSize: 12, color: '#9ca3af', marginRight: 8 }}>
                        {(t.config?.conditions || []).length} {(t.config?.conditions || []).length === 1 ? 'условие' : (t.config?.conditions || []).length < 5 ? 'условия' : 'условий'}
                        {' '}({(t.config?.logic || 'and') === 'and' ? 'И' : 'ИЛИ'})
                      </span>
                    )}
                    {!isEditing && (
                      <>
                        <button className="icon-btn" onClick={e => { e.stopPropagation(); startEdit(t) }} title="Редактировать">
                          <Edit2 size={14} />
                        </button>
                        <button className="icon-btn icon-btn--danger" onClick={e => { e.stopPropagation(); handleDelete(t.id) }} title="Удалить">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                    {!isEditing && (
                      isExpanded ? <ChevronUp size={16} style={{ color: '#9ca3af' }} /> : <ChevronDown size={16} style={{ color: '#9ca3af' }} />
                    )}
                  </div>
                </div>

                {isExpanded && !isEditing && conditions.length > 0 && (
                  <div style={{ padding: '0 16px 14px', borderTop: '1px solid #f3f4f6' }}>
                    <table style={{ width: '100%', fontSize: 13, marginTop: 10 }}>
                      <thead>
                        <tr style={{ color: '#6b7280', fontWeight: 600 }}>
                          <th style={{ textAlign: 'left', padding: '4px 8px', width: '30%' }}>Поле</th>
                          <th style={{ textAlign: 'left', padding: '4px 8px', width: '25%' }}>Оператор</th>
                          <th style={{ textAlign: 'left', padding: '4px 8px' }}>Значение</th>
                        </tr>
                      </thead>
                      <tbody>
                        {conditions.map((c, i) => (
                          <tr key={i}>
                            <td style={{ padding: '4px 8px', fontWeight: 500 }}>{getFieldLabel(c.field)}</td>
                            <td style={{ padding: '4px 8px', color: '#6b7280' }}>
                              {OPERATOR_LABELS[c.operator] || c.operator}
                            </td>
                            <td style={{ padding: '4px 8px' }}>
                              {['not_empty', 'is_empty'].includes(c.operator)
                                ? <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>—</span>
                                : c.operator === 'range'
                                  ? `${c.value_from || '?'} — ${c.value_to || '?'}`
                                  : c.value || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>—</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {isEditing && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid #fef3c7' }}>
                    <div className="form-row" style={{ margin: '14px 0 12px' }}>
                      <label style={{ fontSize: 13, fontWeight: 600 }}>Логика условий</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className={editLogic === 'and' ? 'btn-primary-sm' : 'btn-cancel'}
                          onClick={() => setEditLogic('and')} style={{ fontSize: 12, padding: '4px 14px' }}>
                          И (все совпадают)
                        </button>
                        <button className={editLogic === 'or' ? 'btn-primary-sm' : 'btn-cancel'}
                          onClick={() => setEditLogic('or')} style={{ fontSize: 12, padding: '4px 14px' }}>
                          ИЛИ (любое совпадает)
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Условия</label>
                      <ConditionEditor conditions={editConditions} customFields={customFields} onChange={setEditConditions} />
                    </div>

                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn-cancel" onClick={cancelEdit}>Отмена</button>
                      <button className="btn-save" onClick={saveEdit} disabled={saving}>
                        {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                        {saving ? 'Сохранение...' : 'Сохранить'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
