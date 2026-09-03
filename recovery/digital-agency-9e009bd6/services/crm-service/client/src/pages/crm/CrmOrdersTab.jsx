import { useEffect, useMemo, useState } from 'react'
import {
  Check, ChevronDown, ChevronUp, Edit2, Filter, Loader2,
  Plus, Settings, X,
} from 'lucide-react'
import { apiFetch } from '../../api.js'

const EMPTY_ITEM = { sales_item_id: '', name: '', quantity: 1, price: 0, comment: '' }
const EMPTY_ACTIVITY = { title: '', planned_date: new Date().toISOString().slice(0, 10), planned_time: '', description: '' }
const FIELD_TYPES = [
  { value: 'text', label: 'Текст' },
  { value: 'number', label: 'Число' },
  { value: 'phone', label: 'Телефон' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Дата' },
  { value: 'list', label: 'Список' },
  { value: 'checkbox', label: 'Флажок' },
]
const STATUS_LABELS = {
  active: { label: 'В работе', bg: '#eff6ff', color: '#1e40af' },
  completed: { label: 'Выполнен', bg: '#dcfce7', color: '#166534' },
  canceled: { label: 'Отменен', bg: '#fee2e2', color: '#991b1b' },
}

function normalizeListResponse(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.customers)) return data.customers
  if (Array.isArray(data?.rows)) return data.rows
  if (Array.isArray(data?.data)) return data.data
  return []
}

export default function CrmOrdersTab() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ customer_id: '', status: '', from: '', to: '', search: '' })
  const [modal, setModal] = useState(null)
  const [closeModal, setCloseModal] = useState(null)
  const [form, setForm] = useState({ customer_id: '', title: '', description: '', items: [{ ...EMPTY_ITEM }] })
  const [orderDetails, setOrderDetails] = useState(null)
  const [activityForm, setActivityForm] = useState(EMPTY_ACTIVITY)
  const [closeForm, setCloseForm] = useState({ status: 'completed', outcome: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [customFields, setCustomFields] = useState([])
  const [fieldsOpen, setFieldsOpen] = useState(false)
  const [customValues, setCustomValues] = useState({})

  async function loadData() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      const [orderResult, customerResult, itemResult] = await Promise.allSettled([
        apiFetch(`/api/crm/orders?${params}`),
        apiFetch('/api/crm/customers?page=1&limit=1000&sort_by=full_name&sort_dir=asc'),
        apiFetch('/api/crm/sales-items?status=active'),
      ])

      if (orderResult.status === 'fulfilled') setOrders(normalizeListResponse(orderResult.value))
      else console.error('[crm] load orders list', orderResult.reason)

      if (customerResult.status === 'fulfilled') setCustomers(normalizeListResponse(customerResult.value))
      else console.error('[crm] load order customers', customerResult.reason)

      if (itemResult.status === 'fulfilled') setItems(normalizeListResponse(itemResult.value))
      else console.error('[crm] load sales items for orders', itemResult.reason)
    } catch (e) {
      console.error('[crm] load orders', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const custList = Array.isArray(customers) ? customers : []
  const totalInForm = useMemo(
    () => form.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0),
    [form.items],
  )

  function applyFilters() {
    loadData()
  }

  async function loadOrderFields(orderId) {
    if (!orderId) {
      setCustomFields([])
      setCustomValues({})
      return
    }
    try {
      const data = await apiFetch(`/api/crm/order-fields?order_id=${orderId}`)
      const fields = normalizeListResponse(data)
      setCustomFields(fields)
      setCustomValues(Object.fromEntries(fields.map(f => [f.id, f.value ?? ''])))
    } catch (e) {
      console.error('[crm] load order fields', e)
      setCustomFields([])
      setCustomValues({})
    }
  }

  function openAdd() {
    setForm({ customer_id: '', title: '', description: '', items: [{ ...EMPTY_ITEM }] })
    setOrderDetails(null)
    setActivityForm(EMPTY_ACTIVITY)
    setCustomFields([])
    setCustomValues({})
    setFieldsOpen(false)
    setError('')
    setModal('add')
  }

  async function openEdit(order) {
    setError('')
    setModal(order.id)
    try {
      const data = await apiFetch(`/api/crm/orders/${order.id}`)
      setOrderDetails(data)
      setForm({
        customer_id: data.customer_id || '',
        title: data.title || '',
        description: data.description || '',
        items: data.items?.length ? data.items.map(i => ({
          sales_item_id: i.sales_item_id || '',
          name: i.name || '',
          quantity: i.quantity || 1,
          price: i.price || 0,
          comment: i.comment || '',
        })) : [{ ...EMPTY_ITEM }],
      })
      setFieldsOpen(false)
      loadOrderFields(data.id)
    } catch (e) {
      setError(e.error || e.message || 'Ошибка загрузки заказа')
    }
  }

  function setOrderItem(index, patch) {
    setForm(f => ({
      ...f,
      items: f.items.map((item, i) => i === index ? { ...item, ...patch } : item),
    }))
  }

  function chooseSalesItem(index, salesItemId) {
    const salesItem = items.find(i => i.id === salesItemId)
    setOrderItem(index, {
      sales_item_id: salesItemId,
      name: salesItem ? salesItem.name : '',
      price: salesItem ? salesItem.price : 0,
    })
  }

  function setOrderFieldValue(fieldId, value) {
    setCustomValues(v => ({ ...v, [fieldId]: value }))
  }

  async function saveOrderFieldValues(orderId) {
    if (!orderId || !customFields.length) return
    const values = customFields.map(f => ({ field_id: f.id, value: customValues[f.id] ?? '' }))
    await apiFetch('/api/crm/order-fields/values', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, values }),
    })
  }

  async function handleSave() {
    if (!form.customer_id) { setError('Выберите клиента'); return }
    if (!form.title.trim()) { setError('Номер заказа обязателен'); return }
    const normalizedItems = form.items.filter(i => i.sales_item_id)
    if (!normalizedItems.length) { setError('Выберите позицию номенклатуры'); return }
    const missingField = customFields.find(f => f.is_required && !String(customValues[f.id] ?? '').trim())
    if (missingField) { setError(`Заполните поле "${missingField.name}"`); return }
    setSaving(true)
    setError('')
    try {
      const body = { ...form, items: normalizedItems }
      const saved = modal === 'add'
        ? await apiFetch('/api/crm/orders', { method: 'POST', body: JSON.stringify(body) })
        : await apiFetch(`/api/crm/orders/${modal}`, { method: 'PUT', body: JSON.stringify(body) })
      if (modal !== 'add') {
        await saveOrderFieldValues(saved.id)
        setOrderDetails(saved)
        loadOrderFields(saved.id)
      } else {
        setModal(null)
        setOrderDetails(null)
        setCustomFields([])
        setCustomValues({})
        setFieldsOpen(false)
      }
      loadData()
    } catch (e) {
      setError(e.error || e.message || 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddActivity() {
    if (!orderDetails?.id) return
    if (!activityForm.title.trim()) { setError('Название активности обязательно'); return }
    if (!activityForm.planned_date) { setError('Дата активности обязательна'); return }
    setSaving(true)
    setError('')
    try {
      await apiFetch('/api/crm/activities', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: orderDetails.customer_id,
          order_id: orderDetails.id,
          title: activityForm.title,
          description: activityForm.description,
          activity_type: 'task',
          planned_date: activityForm.planned_date,
          planned_time: activityForm.planned_time,
          duration: 60,
        }),
      })
      const data = await apiFetch(`/api/crm/orders/${orderDetails.id}`)
      setOrderDetails(data)
      setActivityForm(EMPTY_ACTIVITY)
    } catch (e) {
      setError(e.error || e.message || 'Ошибка создания активности')
    } finally {
      setSaving(false)
    }
  }

  async function handleCloseOrder() {
    if (!closeForm.outcome.trim()) { setError('Заполните итог по заказу'); return }
    setSaving(true)
    setError('')
    try {
      await apiFetch(`/api/crm/orders/${closeModal.id}/close`, {
        method: 'POST',
        body: JSON.stringify(closeForm),
      })
      setCloseModal(null)
      setModal(null)
      loadData()
    } catch (e) {
      setError(e.error || e.message || 'Ошибка закрытия заказа')
    } finally {
      setSaving(false)
    }
  }

  function renderOrderFieldValue(field, disabled) {
    const value = customValues[field.id] ?? ''
    if (field.field_type === 'checkbox') {
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={value === 'true' || value === true}
            onChange={e => setOrderFieldValue(field.id, e.target.checked ? 'true' : '')}
            disabled={disabled}
          />
          Да
        </label>
      )
    }
    if (field.field_type === 'list') {
      return (
        <select className="field" value={value} onChange={e => setOrderFieldValue(field.id, e.target.value)} disabled={disabled} autoComplete="off">
          <option value="">— выберите —</option>
          {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      )
    }
    return (
      <input
        className="field"
        type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : 'text'}
        value={value}
        onChange={e => setOrderFieldValue(field.id, e.target.value)}
        disabled={disabled}
        autoComplete="off"
      />
    )
  }

  if (loading) return <div className="loading-center"><Loader2 size={28} className="spin" /></div>

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <Filter size={16} style={{ color: '#6b7280' }} />
        <input className="field" value={filters.search} placeholder="Поиск заказа" onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} style={{ maxWidth: 180 }} autoComplete="off" />
        <select className="field" value={filters.customer_id} onChange={e => setFilters(f => ({ ...f, customer_id: e.target.value }))} style={{ maxWidth: 200 }} autoComplete="off">
          <option value="">Все клиенты</option>
          {custList.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
        </select>
        <select className="field" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} style={{ maxWidth: 150 }} autoComplete="off">
          <option value="">Все статусы</option>
          <option value="active">В работе</option>
          <option value="completed">Выполнен</option>
          <option value="canceled">Отменен</option>
        </select>
        <input className="field" type="date" value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} style={{ maxWidth: 150 }} autoComplete="off" />
        <input className="field" type="date" value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} style={{ maxWidth: 150 }} autoComplete="off" />
        <button className="btn-primary-sm" onClick={applyFilters}>Применить</button>
        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={openAdd}><Plus size={14} /> Добавить заказ</button>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>Заказов пока нет</p>
          <button className="btn-primary-sm" onClick={openAdd}><Plus size={14} /> Добавить первый заказ</button>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Заказ</th>
                <th>Клиент</th>
                <th style={{ width: 120 }}>Сумма</th>
                <th style={{ width: 100 }}>Позиции</th>
                <th style={{ width: 110 }}>Статус</th>
                <th style={{ width: 110 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const st = STATUS_LABELS[order.status] || STATUS_LABELS.active
                return (
                  <tr key={order.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#111827' }}>{order.title}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(order.created_at).toLocaleDateString('ru-RU')}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.customer_name || '—'}</div>
                      {order.customer_phone && <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{order.customer_phone}</div>}
                    </td>
                    <td style={{ fontWeight: 700 }}>{Number(order.total_amount).toLocaleString('ru-RU')} ₽</td>
                    <td style={{ fontSize: 13 }}>{order.items_count || 0}</td>
                    <td><span style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 999, background: st.bg, color: st.color }}>{st.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="icon-btn" onClick={() => openEdit(order)} title="Открыть"><Edit2 size={15} /></button>
                        {order.status === 'active' && (
                          <button className="btn-primary-sm" onClick={() => { setCloseModal(order); setCloseForm({ status: 'completed', outcome: '' }); setError('') }} style={{ padding: '6px 10px' }}>Закрыть</button>
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

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box" style={{ maxWidth: 760, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>{modal === 'add' ? 'Новый заказ' : 'Заказ'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form className="modal-form" autoComplete="off" onSubmit={e => { e.preventDefault(); handleSave() }}>
              <div className="form-row">
                <label>Клиент *</label>
                <select className="field" value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} disabled={orderDetails?.status && orderDetails.status !== 'active'} autoComplete="off">
                  <option value="">— выберите клиента —</option>
                  {custList.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.phone})</option>)}
                </select>
              </div>
              <div className="form-row">
                <label>Номер заказа *</label>
                <input className="field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} disabled={orderDetails?.status && orderDetails.status !== 'active'} autoComplete="off" />
              </div>
              <div className="form-row">
                <label>Описание</label>
                <textarea className="field" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} disabled={orderDetails?.status && orderDetails.status !== 'active'} autoComplete="off" />
              </div>

              {modal !== 'add' && (
                <div style={{ marginTop: 12, borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
                  <button type="button" onClick={() => setFieldsOpen(!fieldsOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, background: 'none',
                      border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                      color: '#4f46e5', padding: 0, width: '100%',
                    }}>
                    <Settings size={15} />
                    Дополнительные поля ({customFields.length})
                    {fieldsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {fieldsOpen && (
                    <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
                      {customFields.length > 0 && (
                        <div style={{ display: 'grid', gap: 10 }}>
                          {customFields.map(field => (
                            <div key={field.id} style={{
                              display: 'grid',
                              gridTemplateColumns: 'minmax(150px, 0.8fr) minmax(180px, 1.2fr)',
                              gap: 8,
                              alignItems: 'center',
                              padding: '8px 10px',
                              background: '#f9fafb',
                              borderRadius: 8,
                              border: '1px solid #e5e7eb',
                            }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>{field.name}{field.is_required ? ' *' : ''}</div>
                                <div style={{ fontSize: 11, color: '#6b7280' }}>
                                  {FIELD_TYPES.find(t => t.value === field.field_type)?.label || field.field_type}
                                </div>
                              </div>
                              {renderOrderFieldValue(field, orderDetails?.status && orderDetails.status !== 'active')}
                            </div>
                          ))}
                        </div>
                      )}

                      {customFields.length === 0 && (
                        <div style={{
                          padding: 12,
                          background: '#f9fafb',
                          borderRadius: 8,
                          border: '1px solid #e5e7eb',
                          fontSize: 13,
                          color: '#6b7280',
                        }}>
                          Для этого заказа нет дополнительных полей. Управление доп. полями находится в разделе «Настройка → Доп. поля».
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: 8, borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>Позиции заказа</div>
                    <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.45, marginTop: 3 }}>
                      Выберите позиции из справочника номенклатуры. Управление номенклатурой находится в разделе «Настройка → Номенклатура».
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{totalInForm.toLocaleString('ru-RU')} ₽</div>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {form.items.map((item, index) => (
                    <div key={index} style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1.4fr) 80px 110px 34px', gap: 8, alignItems: 'end' }}>
                      <label style={{ display: 'grid', gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>Позиция</span>
                        <select className="field" value={item.sales_item_id} onChange={e => chooseSalesItem(index, e.target.value)} disabled={orderDetails?.status && orderDetails.status !== 'active'} autoComplete="off">
                          <option value="">— выберите позицию —</option>
                          {items.map(i => <option key={i.id} value={i.id}>{i.name} ({Number(i.price).toLocaleString('ru-RU')} ₽)</option>)}
                        </select>
                      </label>
                      <label style={{ display: 'grid', gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>Кол-во</span>
                        <input className="field" type="number" min="1" step="1" value={item.quantity} onChange={e => setOrderItem(index, { quantity: e.target.value })} placeholder="1" disabled={orderDetails?.status && orderDetails.status !== 'active'} autoComplete="off" />
                      </label>
                      <label style={{ display: 'grid', gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>Цена за ед.</span>
                        <input className="field" type="number" min="0" step="1" value={item.price} onChange={e => setOrderItem(index, { price: e.target.value })} placeholder="0 ₽" disabled={orderDetails?.status && orderDetails.status !== 'active'} autoComplete="off" />
                      </label>
                      <button type="button" className="icon-btn icon-btn--danger" onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== index) }))} disabled={form.items.length === 1 || (orderDetails?.status && orderDetails.status !== 'active')} title="Убрать"><X size={14} /></button>
                    </div>
                  ))}
                </div>
                {(!orderDetails?.status || orderDetails.status === 'active') && (
                  <button type="button" className="btn-primary-sm" onClick={() => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }))} style={{ marginTop: 10 }}>
                    <Plus size={13} /> Добавить позицию
                  </button>
                )}
              </div>

              {orderDetails?.id && (
                <div style={{ marginTop: 16, borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Активности по заказу</div>
                  {orderDetails.activities?.length ? (
                    <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
                      {orderDetails.activities.map(a => (
                        <div key={a.id} style={{ padding: '8px 10px', borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb', fontSize: 13 }}>
                          <b>{a.title}</b> · {a.planned_date?.slice(0, 10)} {a.planned_time?.slice(0, 5) || ''}
                        </div>
                      ))}
                    </div>
                  ) : <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>Активностей пока нет</div>}
                  {orderDetails.status === 'active' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 120px', gap: 8 }}>
                      <input className="field" placeholder="Название активности" value={activityForm.title} onChange={e => setActivityForm(f => ({ ...f, title: e.target.value }))} autoComplete="off" />
                      <input className="field" type="date" value={activityForm.planned_date} onChange={e => setActivityForm(f => ({ ...f, planned_date: e.target.value }))} autoComplete="off" />
                      <input className="field" type="time" value={activityForm.planned_time} onChange={e => setActivityForm(f => ({ ...f, planned_time: e.target.value }))} autoComplete="off" />
                      <textarea className="field" rows={2} placeholder="Описание активности" value={activityForm.description} onChange={e => setActivityForm(f => ({ ...f, description: e.target.value }))} style={{ gridColumn: '1 / -1' }} autoComplete="off" />
                      <button type="button" className="btn-primary-sm" onClick={handleAddActivity} disabled={saving} style={{ justifySelf: 'start' }}><Plus size={13} /> Запланировать</button>
                    </div>
                  )}
                </div>
              )}

              {orderDetails?.outcome && (
                <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb', fontSize: 13 }}>
                  <b>Итог:</b> {orderDetails.outcome}
                </div>
              )}

              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Закрыть</button>
                {(!orderDetails?.status || orderDetails.status === 'active') && (
                  <>
                    {orderDetails?.id && <button type="button" className="btn-secondary" onClick={() => { setCloseModal(orderDetails); setCloseForm({ status: 'completed', outcome: '' }); setError('') }}>Закрыть заказ</button>}
                    <button type="submit" className="btn-save" disabled={saving}>
                      {saving ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
                      {saving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {closeModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setCloseModal(null)}>
          <div className="modal-box" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2>Закрытие заказа</h2>
              <button className="modal-close" onClick={() => setCloseModal(null)}><X size={18} /></button>
            </div>
            <form className="modal-form" autoComplete="off" onSubmit={e => { e.preventDefault(); handleCloseOrder() }}>
              <div className="form-row">
                <label>Статус закрытия</label>
                <select className="field" value={closeForm.status} onChange={e => setCloseForm(f => ({ ...f, status: e.target.value }))} autoComplete="off">
                  <option value="completed">Выполнен</option>
                  <option value="canceled">Отменен</option>
                </select>
              </div>
              <div className="form-row">
                <label>ИТОГ *</label>
                <textarea className="field" rows={5} value={closeForm.outcome} onChange={e => setCloseForm(f => ({ ...f, outcome: e.target.value }))} placeholder="Опишите итоги взаимодействия по заказу" autoComplete="off" />
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setCloseModal(null)}>Отмена</button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
                  Закрыть заказ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
