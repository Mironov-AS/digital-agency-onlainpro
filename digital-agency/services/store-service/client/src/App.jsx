import { useEffect, useMemo, useState } from 'react'
import {
  Boxes, Building2, ClipboardList, CreditCard, FileBarChart2, FileText, History,
  FolderTree, LayoutDashboard, Minus, PackagePlus, Pencil, Percent, Plus, QrCode, Save, Search,
  ShoppingBag, Store, Trash2, Truck, Upload, Users, X,
} from 'lucide-react'
import { apiFetch, apiUpload, clearAccessToken, saveAccessToken } from './api'

const money = (value) => `${Math.round(Number(value || 0)).toLocaleString('ru-RU')} ₽`

const tabs = [
  { id: 'dashboard', label: 'Панель', icon: LayoutDashboard },
  { id: 'products', label: 'Товары', icon: Boxes },
  { id: 'stock', label: 'Остатки', icon: Store },
  { id: 'purchases', label: 'Закупки', icon: PackagePlus },
  { id: 'sales', label: 'Продажи', icon: CreditCard },
  { id: 'storefront', label: 'Витрина', icon: QrCode },
  { id: 'orders', label: 'Заказы', icon: ClipboardList },
  { id: 'reports', label: 'Отчёты', icon: FileBarChart2 },
  { id: 'admin', label: 'Администрирование', icon: Users },
]

const emptyData = {
  locations: [], suppliers: [], products: [], stock: [], purchases: [], transfers: [],
  inventories: [], sales: [], orders: [], audit: [], groups: [], attention: [],
  summary: { stores: 0, warehouses: 0, products: 0, stock_value: 0, revenue: 0, profit: 0 },
  storefront: { url: '', qr: '' },
}

function arr(value) {
  return Array.isArray(value) ? value : []
}

function productName(products, id) {
  return arr(products).find(p => p.id === id)?.name || 'Товар'
}

function locationName(locations, id) {
  return arr(locations).find(l => l.id === id)?.name || 'Локация'
}

function stores(locations) {
  return arr(locations).filter(location => location.location_type === 'store')
}

function warehouses(locations) {
  return arr(locations).filter(location => location.location_type === 'warehouse')
}

function firstId(items) {
  return arr(items)[0]?.id || ''
}

function Notice({ notice, onClose }) {
  if (!notice) return null
  return (
    <div className={`store-notice store-notice--${notice.type || 'success'}`}>
      <span>{notice.text}</span>
      <button type="button" onClick={onClose}>Закрыть</button>
    </div>
  )
}

function Empty({ title, text }) {
  return (
    <div className="store-empty">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  )
}

function Metric({ label, value, tone = 'blue' }) {
  return (
    <div className={`store-metric store-metric--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function ProductSelect({ products, value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} required>
      <option value="">Выберите товар</option>
      {arr(products).map(product => (
        <option key={product.id} value={product.id}>{product.name} · {product.sku}</option>
      ))}
    </select>
  )
}

function LocationSelect({ locations, value, onChange, onlyStores = false }) {
  const options = onlyStores ? stores(locations) : arr(locations)
  return (
    <select value={value} onChange={e => onChange(e.target.value)} required>
      <option value="">Выберите место</option>
      {options.map(location => (
        <option key={location.id} value={location.id}>
          {location.location_type === 'warehouse' ? 'Склад' : 'Магазин'} · {location.name}
        </option>
      ))}
    </select>
  )
}

function SupplierSelect({ suppliers, value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Без поставщика</option>
      {arr(suppliers).map(supplier => (
        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
      ))}
    </select>
  )
}

function GroupSelect({ groups, value, onChange, required = false }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} required={required}>
      <option value="">{required ? 'Выберите группу' : 'Без группы'}</option>
      {arr(groups).map(group => (
        <option key={group.id || group.name} value={group.name}>{group.name}</option>
      ))}
    </select>
  )
}

function ProductForm({ groups, runAction }) {
  const initial = { name: '', sku: '', group_name: '', purchase_price: 0, sale_price: '', markup_percent: 40, unit: 'шт', description: '', is_public: true, min_quantity: 0 }
  const [form, setForm] = useState(initial)

  const save = async (event) => {
    event.preventDefault()
    const payload = {
      ...form,
      purchase_price: Number(form.purchase_price || 0),
      markup_percent: Number(form.markup_percent || 0),
      min_quantity: Number(form.min_quantity || 0),
    }
    if (form.sale_price === '') delete payload.sale_price
    else payload.sale_price = Number(form.sale_price || 0)
    await runAction(async () => {
      await apiFetch('/api/store/products', { method: 'POST', body: JSON.stringify(payload) })
      setForm(initial)
    }, 'Товар добавлен')
  }

  return (
    <form className="store-form" onSubmit={save}>
      <h3><Plus size={18} /> Быстро добавить товар</h3>
      <div className="store-form-grid">
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Название товара" required />
        <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="Артикул" required />
        <GroupSelect groups={groups} value={form.group_name} onChange={value => setForm(f => ({ ...f, group_name: value }))} />
        <input type="number" min="0" value={form.purchase_price} onChange={e => setForm(f => ({ ...f, purchase_price: Number(e.target.value) }))} placeholder="Закупочная цена" />
        <input type="number" min="0" value={form.sale_price} onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))} placeholder="Цена продажи" />
        <input type="number" min="0" value={form.markup_percent} onChange={e => setForm(f => ({ ...f, markup_percent: Number(e.target.value) }))} placeholder="Наценка, %" />
        <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="Ед. изм. (шт, кг, л)" />
        <input type="number" min="0" step="1" value={form.min_quantity} onChange={e => setForm(f => ({ ...f, min_quantity: Number(e.target.value) }))} placeholder="Мин. остаток" title="Минимальное количество на складе" />
      </div>
      <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Короткое описание для витрины" />
      <label className="store-checkbox">
        <input type="checkbox" checked={form.is_public} onChange={e => setForm(f => ({ ...f, is_public: e.target.checked }))} />
        Показывать на витрине
      </label>
      <button className="store-primary">Добавить товар</button>
    </form>
  )
}

function ProductGroups({ groups, products, runAction }) {
  const initial = { name: '', description: '' }
  const [form, setForm] = useState(initial)
  const [editingId, setEditingId] = useState('')
  const [draft, setDraft] = useState(initial)
  const counts = useMemo(() => {
    const map = new Map()
    arr(products).forEach(product => {
      const groupName = product.group_name || ''
      if (!groupName) return
      map.set(groupName, (map.get(groupName) || 0) + 1)
    })
    return map
  }, [products])

  const submit = async (event) => {
    event.preventDefault()
    await runAction(async () => {
      await apiFetch('/api/store/groups', { method: 'POST', body: JSON.stringify(form) })
      setForm(initial)
    }, 'Группа добавлена')
  }

  const startEdit = (group) => {
    setEditingId(group.id)
    setDraft({ name: group.name || '', description: group.description || '' })
  }

  const saveGroup = async (groupId) => {
    await runAction(async () => {
      await apiFetch(`/api/store/groups/${groupId}`, { method: 'PUT', body: JSON.stringify(draft) })
      setEditingId('')
      setDraft(initial)
    }, 'Группа обновлена')
  }

  const deleteGroup = async (group) => {
    await runAction(async () => {
      await apiFetch(`/api/store/groups/${group.id}`, { method: 'DELETE' })
    }, 'Группа удалена')
  }

  return (
    <section className="store-panel">
      <div className="store-panel-head">
        <h2><FolderTree size={18} /> Справочник групп</h2>
      </div>
      <form className="store-inline-form" onSubmit={submit}>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Новая группа" required />
        <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Описание" />
        <button className="store-secondary" type="submit"><Plus size={16} /> Добавить</button>
      </form>
      {arr(groups).length === 0 ? <Empty title="Групп пока нет" text="Добавьте группы, чтобы выбирать их в карточке товара." /> : (
        <div className="store-table-wrap">
          <table className="store-table">
            <thead><tr><th>Группа</th><th>Описание</th><th>Товаров</th><th /></tr></thead>
            <tbody>
              {arr(groups).map(group => {
                const used = counts.get(group.name) || 0
                return editingId === group.id ? (
                  <tr key={group.id} className="store-edit-row">
                    <td><input value={draft.name} onChange={e => setDraft(f => ({ ...f, name: e.target.value }))} required /></td>
                    <td><input value={draft.description} onChange={e => setDraft(f => ({ ...f, description: e.target.value }))} /></td>
                    <td>{used}</td>
                    <td>
                      <div className="store-table-actions">
                        <button className="store-icon-button" type="button" onClick={() => saveGroup(group.id)} title="Сохранить"><Save size={16} /></button>
                        <button className="store-icon-button" type="button" onClick={() => setEditingId('')} title="Отмена"><X size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={group.id}>
                    <td><strong>{group.name}</strong></td>
                    <td>{group.description || '—'}</td>
                    <td>{used}</td>
                    <td>
                      <div className="store-table-actions">
                        <button className="store-icon-button" type="button" onClick={() => startEdit(group)} title="Редактировать"><Pencil size={16} /></button>
                        <button className="store-icon-button" type="button" onClick={() => deleteGroup(group)} title={used ? 'Нельзя удалить группу с товарами' : 'Удалить'} disabled={used > 0}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function Dashboard({ data, setActiveTab }) {
  const attention = arr(data.attention || [])
  const lowStockItems = attention.filter(a => a.type === 'low_stock')
  const unprocessedOrders = attention.filter(a => a.type === 'order')

  return (
    <div className="store-stack">
      <div className="store-metrics">
        <Metric label="Магазины" value={data.summary.stores} />
        <Metric label="Склады" value={data.summary.warehouses} tone="green" />
        <Metric label="Товаров" value={data.summary.products} tone="violet" />
        <Metric label="Стоимость остатков" value={money(data.summary.stock_value)} tone="orange" />
        <Metric label="Выручка" value={money(data.summary.revenue)} tone="green" />
        <Metric label="Прибыль" value={money(data.summary.profit)} tone="blue" />
      </div>

      <div className="store-quick-actions">
        <button onClick={() => setActiveTab('sales')}><CreditCard size={18} /> Оформить продажу</button>
        <button onClick={() => setActiveTab('purchases')}><PackagePlus size={18} /> Принять закупку</button>
        <button onClick={() => setActiveTab('stock')}><Truck size={18} /> Переместить товар</button>
        <button onClick={() => setActiveTab('admin')}><Building2 size={18} /> Добавить магазин</button>
      </div>

      <div className="store-grid-2">
        <section className="store-panel">
          <h2>⚠️ Критичные остатки</h2>
          {lowStockItems.length === 0 ? <Empty title="Всё в наличии" text="Нет товаров ниже минимума." /> : (
            <div className="store-list">
              {lowStockItems.map((item, idx) => (
                <div className="store-list-row" key={item.product_id + '-' + idx}>
                  <span>{item.product_name}</span>
                  <strong style={{ color: '#ef4444' }}>{item.quantity} шт.</strong>
                  <small>мин: {Number(item.min_quantity).toLocaleString('ru-RU')} шт. · {locationName(data.locations, item.location_id)}</small>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="store-panel">
          <h2>📦 Необработанные заказы</h2>
          {unprocessedOrders.length === 0 ? <Empty title="Заказов нет" text="Все заказы обработаны." /> : (
            <div className="store-list">
              {unprocessedOrders.map(order => (
                <div className="store-list-row" key={order.id}>
                  <span>{order.number}</span>
                  <strong>{money(order.total)}</strong>
                  <small>{order.customer_name} · {order.status === 'new' ? 'новый' : 'в обработке'}</small>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Products({ data, runAction }) {
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState('')
  const [draft, setDraft] = useState({})
  const filtered = arr(data.products).filter(product =>
    `${product.name} ${product.sku} ${product.group_name}`.toLowerCase().includes(query.toLowerCase()),
  )
  const stockMap = useMemo(() => {
    const map = new Map()
    for (const item of arr(data.stock)) {
      const prev = map.get(item.product_id) || 0
      map.set(item.product_id, prev + Number(item.quantity || 0))
    }
    return map
  }, [data.stock])
  const stockQty = (productId) => {
    const qty = stockMap.get(productId) || 0
    return qty > 0 ? Math.round(qty).toLocaleString('ru-RU') : '—'
  }
  const startEdit = (product) => {
    setEditingId(product.id)
    setDraft({
      name: product.name || '',
      sku: product.sku || '',
      group_name: product.group_name || '',
      purchase_price: Number(product.purchase_price || 0),
      sale_price: Number(product.sale_price || 0),
      markup_percent: Number(product.markup_percent || 0),
      unit: product.unit || 'шт',
      description: product.description || '',
      is_public: product.is_public !== false,
      min_quantity: Number(product.min_quantity || 0),
    })
  }
  const cancelEdit = () => {
    setEditingId('')
    setDraft({})
  }
  const updateDraft = (patch) => setDraft(current => ({ ...current, ...patch }))
  const saveDraft = async (productId) => {
    await runAction(async () => {
      await apiFetch(`/api/store/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...draft,
          purchase_price: Number(draft.purchase_price || 0),
          sale_price: Number(draft.sale_price || 0),
          markup_percent: Number(draft.markup_percent || 0),
          min_quantity: Number(draft.min_quantity || 0),
        }),
      })
      cancelEdit()
    }, 'Товар обновлён')
  }

  return (
    <div className="store-stack">
      <div className="store-grid-2">
        <ProductForm groups={data.groups} runAction={runAction} />
        <ProductGroups groups={data.groups} products={data.products} runAction={runAction} />
      </div>
      <section className="store-panel">
        <div className="store-panel-head">
          <h2>Справочник товаров</h2>
          <label className="store-search"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по названию, артикулу, группе" /></label>
        </div>
        {filtered.length === 0 ? <Empty title="Товаров нет" text="Добавьте первый товар через форму выше." /> : (
          <div className="store-table-wrap">
            <table className="store-table store-products-table">
              <thead><tr><th>Товар</th><th>Артикул</th><th>Группа</th><th>Закупка</th><th>Цена продажи</th><th>Наценка</th><th>Ед.</th><th>Остаток</th><th>Мин. ост.</th><th>Витрина</th><th /></tr></thead>
              <tbody>
                {filtered.map(product => (
                  editingId === product.id ? (
                    <tr key={product.id} className="store-edit-row">
                      <td>
                        <input value={draft.name} onChange={e => updateDraft({ name: e.target.value })} placeholder="Название" required />
                        <textarea value={draft.description} onChange={e => updateDraft({ description: e.target.value })} placeholder="Описание" />
                      </td>
                      <td><input value={draft.sku} onChange={e => updateDraft({ sku: e.target.value })} placeholder="Артикул" required /></td>
                      <td><GroupSelect groups={data.groups} value={draft.group_name} onChange={value => updateDraft({ group_name: value })} /></td>
                      <td><input type="number" min="0" value={draft.purchase_price} onChange={e => updateDraft({ purchase_price: e.target.value })} placeholder="0.00" /></td>
                      <td><input type="number" min="0" value={draft.sale_price} onChange={e => updateDraft({ sale_price: e.target.value })} placeholder="0.00" /></td>
                      <td><input type="number" min="0" value={draft.markup_percent} onChange={e => updateDraft({ markup_percent: e.target.value })} placeholder="0" /></td>
                      <td><input value={draft.unit} onChange={e => updateDraft({ unit: e.target.value })} placeholder="шт" /></td>
                      <td style={{ background: '#f5f5f5', color: '#999', textAlign: 'center' }}>—</td>
                      <td><input type="number" min="0" step="1" value={draft.min_quantity} onChange={e => updateDraft({ min_quantity: e.target.value })} placeholder="мин. кол-во" title="Минимальное количество на складе" /></td>
                      <td>
                        <label className="store-checkbox">
                          <input type="checkbox" checked={draft.is_public} onChange={e => updateDraft({ is_public: e.target.checked })} />
                          Да
                        </label>
                      </td>
                      <td>
                        <div className="store-table-actions">
                          <button className="store-icon-button" type="button" onClick={() => saveDraft(product.id)} title="Сохранить"><Save size={16} /></button>
                          <button className="store-icon-button" type="button" onClick={cancelEdit} title="Отмена"><X size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={product.id}>
                      <td><strong>{product.name}</strong><small>{product.description}</small></td>
                      <td>{product.sku}</td>
                      <td>{product.group_name || 'Без группы'}</td>
                      <td>{money(product.purchase_price)}</td>
                      <td><strong>{money(product.sale_price)}</strong></td>
                      <td>{product.markup_percent}%</td>
                      <td>{product.unit || 'шт'}</td>
                      <td>{stockQty(product.id)}</td>
                      <td>{product.min_quantity > 0 ? Number(product.min_quantity).toLocaleString('ru-RU') : '—'}</td>
                      <td>{product.is_public ? 'Да' : 'Нет'}</td>
                      <td><button className="store-icon-button" type="button" onClick={() => startEdit(product)} title="Редактировать"><Pencil size={16} /></button></td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function TransferForm({ data, runAction }) {
  const [form, setForm] = useState({
    product_id: firstId(data.products),
    from_location_id: firstId(warehouses(data.locations)) || firstId(data.locations),
    to_location_id: firstId(stores(data.locations)) || firstId(data.locations),
    qty: 1,
  })

  const submit = async (event) => {
    event.preventDefault()
    await runAction(async () => {
      await apiFetch('/api/store/transfers', {
        method: 'POST',
        body: JSON.stringify({
          from_location_id: form.from_location_id,
          to_location_id: form.to_location_id,
          items: [{ product_id: form.product_id, qty: Number(form.qty) }],
        }),
      })
    }, 'Товар перемещён')
  }

  return (
    <form className="store-form" onSubmit={submit}>
      <h3><Truck size={18} /> Переместить товар</h3>
      <div className="store-form-grid">
        <ProductSelect products={data.products} value={form.product_id} onChange={value => setForm(f => ({ ...f, product_id: value }))} />
        <LocationSelect locations={data.locations} value={form.from_location_id} onChange={value => setForm(f => ({ ...f, from_location_id: value }))} />
        <LocationSelect locations={data.locations} value={form.to_location_id} onChange={value => setForm(f => ({ ...f, to_location_id: value }))} />
        <input type="number" min="0.001" step="0.001" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} placeholder="Количество" required />
      </div>
      <button className="store-primary">Переместить</button>
    </form>
  )
}

function InventoryForm({ data, runAction }) {
  const [form, setForm] = useState({
    location_id: firstId(data.locations),
    product_id: firstId(data.products),
    actual_qty: 0,
  })
  const systemQty = arr(data.stock).find(item => item.location_id === form.location_id && item.product_id === form.product_id)?.quantity || 0

  const submit = async (event) => {
    event.preventDefault()
    await runAction(async () => {
      await apiFetch('/api/store/inventories', {
        method: 'POST',
        body: JSON.stringify({
          location_id: form.location_id,
          items: [{ product_id: form.product_id, system_qty: systemQty, actual_qty: Number(form.actual_qty) }],
        }),
      })
    }, 'Инвентаризация проведена')
  }

  return (
    <form className="store-form" onSubmit={submit}>
      <h3><ClipboardList size={18} /> Инвентаризация</h3>
      <div className="store-form-grid">
        <LocationSelect locations={data.locations} value={form.location_id} onChange={value => setForm(f => ({ ...f, location_id: value }))} />
        <ProductSelect products={data.products} value={form.product_id} onChange={value => setForm(f => ({ ...f, product_id: value }))} />
        <input type="number" min="0" step="0.001" value={form.actual_qty} onChange={e => setForm(f => ({ ...f, actual_qty: e.target.value }))} placeholder="Фактический остаток" required />
      </div>
      <p className="store-hint">Сейчас в системе: {systemQty} ед. После проведения остаток станет равен фактическому количеству.</p>
      <button className="store-primary">Провести инвентаризацию</button>
    </form>
  )
}

function Stock({ data, runAction }) {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('all') // 'all' | 'warehouse' | 'store'
  const [locationFilter, setLocationFilter] = useState('')

  const locations = arr(data.locations)
  const stockItems = arr(data.stock)
  const products = arr(data.products)

  // Build pivot: product → location → quantity
  const pivotMap = useMemo(() => {
    const map = new Map()
    for (const item of stockItems) {
      if (!map.has(item.product_id)) map.set(item.product_id, new Map())
      const locMap = map.get(item.product_id)
      const prev = locMap.get(item.location_id) || 0
      locMap.set(item.location_id, prev + Number(item.quantity || 0))
    }
    return map
  }, [stockItems])

  // Filter locations for display
  const displayLocations = useMemo(() => {
    return locations.filter(loc => {
      if (viewMode === 'warehouse' && loc.location_type !== 'warehouse') return false
      if (viewMode === 'store' && loc.location_type !== 'store') return false
      if (locationFilter && loc.id !== locationFilter) return false
      return true
    })
  }, [locations, viewMode, locationFilter])

  // Filter products by search
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter(p => {
      if (!q) return true
      return `${p.name} ${p.sku || ''} ${p.group_name || ''}`.toLowerCase().includes(q)
    })
  }, [products, search])

  // Group products for tabs: Опт = warehouse, Розница = store, Все = all
  const tabCounts = useMemo(() => {
    const wh = new Set(locations.filter(l => l.location_type === 'warehouse').map(l => l.id))
    const st = new Set(locations.filter(l => l.location_type === 'store').map(l => l.id))
    const totals = new Map()
    for (const [productId, locMap] of pivotMap) {
      let total = 0
      for (const qty of locMap.values()) total += qty
      totals.set(productId, total)
    }
    return { all: filteredProducts.length }
  }, [filteredProducts, pivotMap, locations])

  return (
    <div className="store-stack">
      <div className="store-grid-2">
        <TransferForm data={data} runAction={runAction} />
        <InventoryForm data={data} runAction={runAction} />
      </div>
      <section className="store-panel">
        <div className="store-panel-head">
          <h2>Остатки по товарам</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <label className="store-search">
              <Search size={16} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по названию, артикулу, группе"
              />
            </label>
            <select
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }}
            >
              <option value="">Все точки</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.location_type === 'warehouse' ? 'склад' : 'магазин'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View mode tabs: Опт / Розница / Все */}
        <div className="section-tabs" style={{ padding: '0 0 16px', background: 'transparent', borderBottom: 'none', marginBottom: 0 }}>
          {[['all', 'Все'], ['warehouse', 'Опт'], ['store', 'Розница']].map(([val, label]) => (
            <button
              key={val}
              className={`section-tab ${viewMode === val ? 'active' : ''}`}
              onClick={() => setViewMode(val)}
            >
              {label}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <Empty title="Нет данных" text="Нет товаров или остатков для отображения." />
        ) : (
          <div className="store-table-wrap">
            <table className="store-table">
              <thead>
                <tr>
                  <th>Товар</th>
                  {displayLocations.map(loc => (
                    <th key={loc.id} style={{ textAlign: 'right' }}>{loc.name}</th>
                  ))}
                  <th style={{ textAlign: 'right' }}>Итого</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const locMap = pivotMap.get(product.id) || new Map()
                  let total = 0
                  displayLocations.forEach(loc => { total += locMap.get(loc.id) || 0 })
                  return (
                    <tr key={product.id}>
                      <td>
                        <strong>{product.name}</strong>
                        <small>{product.sku || '—'} · {product.group_name || 'без группы'}</small>
                      </td>
                      {displayLocations.map(loc => {
                        const qty = locMap.get(loc.id) || 0
                        return (
                          <td key={loc.id} style={{ textAlign: 'right', color: qty === 0 ? '#9ca3af' : '#111827' }}>
                            {qty > 0 ? qty.toLocaleString('ru-RU') : '—'}
                          </td>
                        )
                      })}
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {total > 0 ? total.toLocaleString('ru-RU') : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f9fafb' }}>
                  <td><strong>ИТОГО</strong></td>
                  {displayLocations.map(loc => {
                    const colTotal = stockItems
                      .filter(s => s.location_id === loc.id && filteredProducts.some(p => p.id === s.product_id))
                      .reduce((sum, s) => sum + Number(s.quantity || 0), 0)
                    return (
                      <td key={loc.id} style={{ textAlign: 'right', fontWeight: 700 }}>
                        {colTotal > 0 ? colTotal.toLocaleString('ru-RU') : '—'}
                      </td>
                    )
                  })}
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>
                    {stockItems
                      .filter(s => filteredProducts.some(p => p.id === s.product_id))
                      .reduce((sum, s) => sum + Number(s.quantity || 0), 0)
                      .toLocaleString('ru-RU')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function SupplierForm({ runAction }) {
  const initial = { name: '', contact_person: '', phone: '', email: '', terms: '' }
  const [form, setForm] = useState(initial)
  const submit = async (event) => {
    event.preventDefault()
    await runAction(async () => {
      await apiFetch('/api/store/suppliers', { method: 'POST', body: JSON.stringify(form) })
      setForm(initial)
    }, 'Поставщик добавлен')
  }

  return (
    <form className="store-form" onSubmit={submit}>
      <h3><Users size={18} /> Новый поставщик</h3>
      <div className="store-form-grid">
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Название" required />
        <input value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} placeholder="Контактное лицо" />
        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Телефон" />
        <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" />
        <input value={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))} placeholder="Условия поставки" />
      </div>
      <button className="store-primary">Добавить поставщика</button>
    </form>
  )
}

function PurchaseForm({ data, runAction }) {
  const firstProduct = arr(data.products)[0]
  const blankLine = (product = firstProduct) => ({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    product_id: product?.id || '',
    sku: product?.sku || '',
    name: product?.name || '',
    qty: 1,
    unit: product?.unit || 'шт',
    purchase_price: product?.purchase_price || 0,
  })
  const [form, setForm] = useState({
    supplier_id: firstId(data.suppliers),
    location_id: firstId(warehouses(data.locations)) || firstId(data.locations),
    invoice_number: '',
    purchased_at: new Date().toISOString().slice(0, 10),
  })
  const [lines, setLines] = useState([blankLine()])
  const [invoiceFile, setInvoiceFile] = useState(null)
  const [recognitionMessage, setRecognitionMessage] = useState('')
  const [recognizing, setRecognizing] = useState(false)

  const chooseProduct = (lineId, productId) => {
    const product = arr(data.products).find(item => item.id === productId)
    setLines(current => current.map(line => (
      line.id === lineId
        ? {
          ...line,
          product_id: productId,
          sku: product?.sku || line.sku,
          name: product?.name || line.name,
          unit: product?.unit || line.unit,
          purchase_price: product?.purchase_price ?? line.purchase_price,
        }
        : line
    )))
  }

  const updateLine = (lineId, patch) => {
    setLines(current => current.map(line => line.id === lineId ? { ...line, ...patch } : line))
  }

  const addLine = () => {
    setLines(current => [...current, blankLine(null)])
  }

  const removeLine = (lineId) => {
    setLines(current => current.length === 1 ? [blankLine(null)] : current.filter(line => line.id !== lineId))
  }

  const productByRecognition = (item) => {
    const sku = String(item.sku || '').trim().toLowerCase()
    const name = String(item.name || '').trim().toLowerCase()
    return arr(data.products).find(product => (
      (sku && String(product.sku || '').trim().toLowerCase() === sku)
      || (name && String(product.name || '').trim().toLowerCase() === name)
    ))
  }

  const lineFromRecognition = (item) => {
    const product = productByRecognition(item)
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      product_id: product?.id || '',
      sku: item.sku || product?.sku || '',
      name: item.name || product?.name || '',
      qty: item.qty || 1,
      unit: item.unit || product?.unit || 'шт',
      purchase_price: item.purchase_price ?? product?.purchase_price ?? 0,
    }
  }

  const recognizeInvoice = async () => {
    if (!invoiceFile) return
    setRecognizing(true)
    setRecognitionMessage('')
    try {
      const body = new FormData()
      body.append('invoice', invoiceFile)
      const result = await apiUpload('/api/store/invoices/recognize', body)
      if (result.invoice_number) setForm(f => ({ ...f, invoice_number: result.invoice_number }))
      if (result.invoice_date) setForm(f => ({ ...f, purchased_at: result.invoice_date }))
      const recognizedLines = arr(result.items).map(lineFromRecognition).filter(line => line.name || line.sku)
      if (recognizedLines.length) setLines(recognizedLines)
      setRecognitionMessage(result.message || 'Накладная обработана. Проверьте строки перед приёмкой.')
    } catch (error) {
      setRecognitionMessage(error.error || error.message || 'Не удалось распознать накладную')
    } finally {
      setRecognizing(false)
    }
  }

  const validLines = lines.filter(line => (line.product_id || line.name || line.sku) && Number(line.qty) > 0)
  const total = validLines.reduce((sum, line) => sum + Number(line.qty || 0) * Number(line.purchase_price || 0), 0)

  const submit = async (event) => {
    event.preventDefault()
    if (!validLines.length) return
    await runAction(async () => {
      await apiFetch('/api/store/purchases', {
        method: 'POST',
        body: JSON.stringify({
          supplier_id: form.supplier_id || null,
          location_id: form.location_id,
          invoice_number: form.invoice_number,
          purchased_at: form.purchased_at,
          items: validLines.map(line => ({
            product_id: line.product_id || undefined,
            sku: line.sku,
            name: line.name,
            unit: line.unit || 'шт',
            qty: Number(line.qty),
            purchase_price: Number(line.purchase_price || 0),
          })),
        }),
      })
      setLines([blankLine(null)])
      setRecognitionMessage('')
    }, 'Закупка принята, остатки обновлены')
  }

  return (
    <form className="store-form store-invoice-form" onSubmit={submit}>
      <h3><PackagePlus size={18} /> Приёмка по накладной</h3>
      <div className="store-invoice-head">
        <SupplierSelect suppliers={data.suppliers} value={form.supplier_id} onChange={value => setForm(f => ({ ...f, supplier_id: value }))} />
        <LocationSelect locations={data.locations} value={form.location_id} onChange={value => setForm(f => ({ ...f, location_id: value }))} />
        <input value={form.invoice_number} onChange={e => setForm(f => ({ ...f, invoice_number: e.target.value }))} placeholder="Номер накладной" />
        <input type="date" value={form.purchased_at} onChange={e => setForm(f => ({ ...f, purchased_at: e.target.value }))} />
      </div>

      <div className="store-invoice-upload">
        <label>
          <FileText size={18} />
          <span>{invoiceFile ? invoiceFile.name : 'Фото, скан, PDF, TXT или CSV накладной'}</span>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.csv,.tsv,image/*,application/pdf,text/plain,text/csv"
            onChange={e => setInvoiceFile(e.target.files?.[0] || null)}
          />
        </label>
        <button className="store-secondary" type="button" onClick={recognizeInvoice} disabled={!invoiceFile || recognizing}>
          <Upload size={16} /> {recognizing ? 'Распознаю...' : 'Распознать накладную'}
        </button>
      </div>
      {recognitionMessage ? <p className="store-hint">{recognitionMessage}</p> : null}

      <div className="store-invoice-table-wrap">
        <table className="store-table store-invoice-table">
          <thead><tr><th>Товар в системе</th><th>Артикул</th><th>Название из накладной</th><th>Кол-во</th><th>Ед.</th><th>Закупка</th><th>Сумма</th><th /></tr></thead>
          <tbody>
            {lines.map(line => (
              <tr key={line.id}>
                <td>
                  <select value={line.product_id} onChange={e => chooseProduct(line.id, e.target.value)}>
                    <option value="">Новый товар</option>
                    {arr(data.products).map(product => (
                      <option key={product.id} value={product.id}>{product.name} · {product.sku}</option>
                    ))}
                  </select>
                  {!line.product_id ? <small>Будет создан при приёмке</small> : null}
                </td>
                <td><input value={line.sku} onChange={e => updateLine(line.id, { sku: e.target.value })} placeholder="Артикул" /></td>
                <td><input value={line.name} onChange={e => updateLine(line.id, { name: e.target.value })} placeholder="Название товара" /></td>
                <td><input type="number" min="0.001" step="0.001" value={line.qty} onChange={e => updateLine(line.id, { qty: e.target.value })} /></td>
                <td><input value={line.unit} onChange={e => updateLine(line.id, { unit: e.target.value })} /></td>
                <td><input type="number" min="0" step="0.01" value={line.purchase_price} onChange={e => updateLine(line.id, { purchase_price: e.target.value })} /></td>
                <td>{money(Number(line.qty || 0) * Number(line.purchase_price || 0))}</td>
                <td><button className="store-icon-danger" type="button" onClick={() => removeLine(line.id)}><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="store-sale-footer">
        <button className="store-secondary" type="button" onClick={addLine}><Plus size={16} /> Добавить строку</button>
        <button className="store-primary" disabled={!validLines.length}>Принять на склад на {money(total)}</button>
      </div>
    </form>
  )
}

function Purchases({ data, runAction }) {
  return (
    <div className="store-stack">
      <PurchaseForm data={data} runAction={runAction} />
      <div className="store-grid-2">
        <SupplierForm runAction={runAction} />
        <section className="store-panel">
          <h2>Поставщики</h2>
          <div className="store-list">
            {arr(data.suppliers).map(supplier => (
              <div className="store-list-row" key={supplier.id}>
                <span>{supplier.name}</span>
                <strong>{supplier.contact_person || 'Контакт не указан'}</strong>
                <small>{supplier.phone || 'без телефона'} · {supplier.terms || 'условия не указаны'}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="store-panel">
          <h2>Закупки и поступления</h2>
          {arr(data.purchases).length === 0 ? <Empty title="Документов пока нет" text="Примите первое поступление через форму выше." /> : (
            <div className="store-list">
              {arr(data.purchases).map(order => (
                <div className="store-list-row" key={order.id}>
                  <span>{order.number}</span>
                  <strong>{money(order.total)}</strong>
                  <small>{order.status} · {order.purchased_at}</small>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Sales({ data, runAction }) {
  const initialLocation = firstId(stores(data.locations)) || firstId(data.locations)
  const [form, setForm] = useState({
    location_id: initialLocation,
    cashier_name: '',
  })
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState([])

  const products = arr(data.products)
  const productById = useMemo(() => new Map(products.map(item => [item.id, item])), [products])
  const stockByProduct = useMemo(() => {
    const map = new Map()
    for (const item of arr(data.stock)) {
      if (item.location_id === form.location_id) {
        map.set(item.product_id, Number(item.quantity || 0))
      }
    }
    return map
  }, [data.stock, form.location_id])
  const cartQtyByProduct = useMemo(() => new Map(cart.map(item => [item.product_id, Number(item.qty || 0)])), [cart])
  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return [...products]
      .filter(item => {
        if (!normalizedQuery) return true
        return `${item.name || ''} ${item.sku || ''} ${item.group_name || ''}`.toLowerCase().includes(normalizedQuery)
      })
      .sort((left, right) => {
        const leftAvailable = stockByProduct.get(left.id) || 0
        const rightAvailable = stockByProduct.get(right.id) || 0
        if ((leftAvailable > 0) !== (rightAvailable > 0)) return rightAvailable > 0 ? 1 : -1
        return String(left.name || '').localeCompare(String(right.name || ''), 'ru')
      })
  }, [products, query, stockByProduct])
  const cartTotal = cart.reduce((sum, item) => {
    const lineProduct = productById.get(item.product_id)
    return sum + Number(item.qty || 0) * Number(lineProduct?.sale_price || 0)
  }, 0)
  const cartCount = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0)
  const availableFor = (productId) => stockByProduct.get(productId) || 0
  const inCartFor = (productId) => cartQtyByProduct.get(productId) || 0

  const changeLocation = (locationId) => {
    setForm(f => ({ ...f, location_id: locationId }))
    setCart([])
  }

  const setProductQty = (productId, qty) => {
    const nextQty = Math.max(0, Math.min(Number(qty || 0), availableFor(productId)))
    setCart(current => {
      const existing = current.find(item => item.product_id === productId)
      if (nextQty <= 0) return current.filter(item => item.product_id !== productId)
      if (existing) {
        return current.map(item => item.product_id === productId ? { ...item, qty: nextQty } : item)
      }
      return [...current, { product_id: productId, qty: nextQty }]
    })
  }

  const addOne = (productId) => {
    setProductQty(productId, inCartFor(productId) + 1)
  }

  const removeFromCart = (productId) => {
    setCart(current => current.filter(item => item.product_id !== productId))
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!cart.length) return
    await runAction(async () => {
      await apiFetch('/api/store/sales', {
        method: 'POST',
        body: JSON.stringify({
          location_id: form.location_id,
          cashier_name: form.cashier_name,
          items: cart.map(item => ({ product_id: item.product_id, qty: Number(item.qty) })),
        }),
      })
      setCart([])
    }, 'Продажа проведена, остатки списаны')
  }

  return (
    <div className="store-stack">
      <form className="store-form" onSubmit={submit}>
        <h3><CreditCard size={18} /> Касса: быстрый набор корзины</h3>
        <div className="store-sale-toolbar">
          <LocationSelect locations={data.locations} onlyStores value={form.location_id} onChange={changeLocation} />
          <input value={form.cashier_name} onChange={e => setForm(f => ({ ...f, cashier_name: e.target.value }))} placeholder="Продавец" />
          <label className="store-search">
            <Search size={18} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Найти товар по названию или артикулу" />
          </label>
        </div>
        <div className="store-sale-layout">
          <div className="store-sale-products">
            {visibleProducts.length === 0 ? <Empty title="Товар не найден" text="Проверьте название или артикул в поиске." /> : (
              <div className="store-product-grid">
                {visibleProducts.map(product => {
                  const available = availableFor(product.id)
                  const inCart = inCartFor(product.id)
                  const canAdd = available > inCart
                  return (
                    <article className={`store-product-card ${available <= 0 ? 'store-product-card--muted' : ''}`} key={product.id}>
                      <div className="store-product-card-head">
                        <div>
                          <strong>{product.name}</strong>
                          <small>{product.sku || 'без артикула'} · {product.group_name || 'без группы'}</small>
                        </div>
                        <span>{money(product.sale_price)}</span>
                      </div>
                      <div className="store-product-meta">
                        <span>Остаток: {available} {product.unit}</span>
                        {inCart > 0 && <strong>В чеке: {inCart} {product.unit}</strong>}
                      </div>
                      <div className="store-product-card-actions">
                        {inCart > 0 ? (
                          <div className="store-quantity-control">
                            <button type="button" onClick={() => setProductQty(product.id, inCart - 1)}><Minus size={14} /></button>
                            <input type="number" min="0" step="0.001" value={inCart} onChange={e => setProductQty(product.id, e.target.value)} />
                            <button type="button" onClick={() => addOne(product.id)} disabled={!canAdd}><Plus size={14} /></button>
                          </div>
                        ) : (
                          <button className="store-secondary" type="button" onClick={() => addOne(product.id)} disabled={!canAdd}>
                            <Plus size={16} /> В чек
                          </button>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          <div className="store-sale-cart">
            <div className="store-cart-summary">
              <span>В чеке: {cart.length} поз. / {cartCount} ед.</span>
              <strong>{money(cartTotal)}</strong>
            </div>
            {cart.length === 0 ? <Empty title="Чек пустой" text="Добавьте товары покупателя, затем нажмите «Пробить чек»." /> : (
              <div className="store-cart-lines">
                {cart.map(item => {
                  const lineProduct = productById.get(item.product_id)
                  return (
                    <div className="store-cart-line" key={item.product_id}>
                      <div>
                        <strong>{lineProduct?.name}</strong>
                        <small>{money(lineProduct?.sale_price)} · на точке {availableFor(item.product_id)} {lineProduct?.unit}</small>
                      </div>
                      <div className="store-cart-line-actions">
                        <div className="store-quantity-control">
                          <button type="button" onClick={() => setProductQty(item.product_id, Number(item.qty) - 1)}><Minus size={14} /></button>
                          <input type="number" min="0" step="0.001" value={item.qty} onChange={e => setProductQty(item.product_id, e.target.value)} />
                          <button type="button" onClick={() => setProductQty(item.product_id, Number(item.qty) + 1)} disabled={Number(item.qty) >= availableFor(item.product_id)}><Plus size={14} /></button>
                        </div>
                        <strong>{money(Number(item.qty) * Number(lineProduct?.sale_price || 0))}</strong>
                        <button className="store-icon-danger" type="button" onClick={() => removeFromCart(item.product_id)}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        <div className="store-sale-footer">
          <button className="store-primary" disabled={!cart.length}>Пробить чек на {money(cartTotal)}</button>
          <button className="store-danger" type="button" disabled={!cart.length} onClick={() => setCart([])}>Очистить чек</button>
        </div>
      </form>
      <section className="store-panel">
        <h2>Архив продаж</h2>
        <table className="store-table">
          <thead><tr><th>Продажа</th><th>Магазин</th><th>Кассир</th><th>Сумма</th><th>Прибыль</th><th>Дата</th></tr></thead>
          <tbody>
            {arr(data.sales).map(sale => (
              <tr key={sale.id}>
                <td><strong>{sale.number}</strong><small>{arr(sale.items).length} поз.</small></td>
                <td>{locationName(data.locations, sale.location_id)}</td>
                <td>{sale.cashier_name || 'Кассир'}</td>
                <td>{money(sale.total)}</td>
                <td>{money(sale.profit)}</td>
                <td>{new Date(sale.created_at).toLocaleDateString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function Storefront({ data }) {
  const publicUrl = `${window.location.origin}${data.storefront.url}`
  return (
    <div className="store-grid-2">
      <section className="store-panel">
        <h2>Публичная витрина</h2>
        <p>Покупатель открывает каталог по ссылке или QR-коду, добавляет товары в корзину и оформляет заказ с уникальным номером.</p>
        <div className="store-qr">
          <img src={data.storefront.qr} alt="QR-код витрины" />
          <div>
            <strong>Ссылка на витрину</strong>
            <code>{publicUrl}</code>
            <a className="store-link-button" href={data.storefront.url} target="_blank" rel="noreferrer">Открыть витрину</a>
          </div>
        </div>
      </section>
      <section className="store-panel">
        <h2>Товары на витрине</h2>
        <div className="store-public-products">
          {arr(data.products).filter(p => p.is_public).slice(0, 6).map(product => (
            <article key={product.id}>
              <ShoppingBag size={18} />
              <strong>{product.name}</strong>
              <span>{money(product.sale_price)}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function Orders({ data, runAction }) {
  const changeStatus = async (order, status) => {
    await runAction(async () => {
      await apiFetch(`/api/store/orders/${order.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
    }, 'Статус заказа обновлён')
  }
  const statuses = ['new', 'processing', 'packed', 'shipped', 'done']
  const labels = { new: 'новый', processing: 'в обработке', packed: 'собран', shipped: 'отгружен', done: 'выполнен' }

  return (
    <section className="store-panel">
      <h2>Онлайн-заказы</h2>
      {arr(data.orders).length === 0 ? <Empty title="Заказов нет" text="Когда покупатель оформит заказ на витрине, он появится здесь." /> : (
        <table className="store-table">
          <thead><tr><th>Номер</th><th>Покупатель</th><th>Состав</th><th>Сумма</th><th>Статус</th></tr></thead>
          <tbody>
            {arr(data.orders).map(order => (
              <tr key={order.id}>
                <td><strong>{order.number}</strong></td>
                <td>{order.customer_name}<small>{order.customer_phone}</small></td>
                <td>{arr(order.items).map(i => `${i.name} x${i.qty}`).join(', ')}</td>
                <td>{money(order.total)}</td>
                <td>
                  <select value={order.status} onChange={e => changeStatus(order, e.target.value)}>
                    {statuses.map(status => <option key={status} value={status}>{labels[status]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function Reports({ data }) {
  const byGroup = useMemo(() => {
    const map = new Map()
    arr(data.products).forEach(product => {
      const current = map.get(product.group_name || 'Без группы') || { count: 0, value: 0 }
      const stock = arr(data.stock).filter(s => s.product_id === product.id).reduce((sum, s) => sum + s.quantity, 0)
      current.count += stock
      current.value += stock * product.purchase_price
      map.set(product.group_name || 'Без группы', current)
    })
    return Array.from(map.entries())
  }, [data])

  return (
    <div className="store-grid-2">
      <section className="store-panel">
        <h2>Остатки по группам</h2>
        <div className="store-list">
          {byGroup.map(([group, item]) => (
            <div className="store-list-row" key={group}>
              <span>{group}</span>
              <strong>{item.count} ед.</strong>
              <small>{money(item.value)}</small>
            </div>
          ))}
        </div>
      </section>
      <section className="store-panel">
        <h2>Прибыльность</h2>
        <div className="store-list">
          {arr(data.sales).flatMap(s => arr(s.items)).slice(0, 6).map((item, index) => (
            <div className="store-list-row" key={`${item.product_id}-${index}`}>
              <span>{item.name}</span>
              <strong>{money((item.price - item.purchase_price) * item.qty)}</strong>
              <small>Продано: {item.qty}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function LocationForm({ runAction }) {
  const initial = { name: '', location_type: 'store', address: '', is_central: false }
  const [form, setForm] = useState(initial)
  const submit = async (event) => {
    event.preventDefault()
    await runAction(async () => {
      await apiFetch('/api/store/locations', { method: 'POST', body: JSON.stringify(form) })
      setForm(initial)
    }, 'Магазин или склад добавлен')
  }

  return (
    <form className="store-form" onSubmit={submit}>
      <h3><Building2 size={18} /> Новый магазин или склад</h3>
      <div className="store-form-grid">
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Название" required />
        <select value={form.location_type} onChange={e => setForm(f => ({ ...f, location_type: e.target.value, is_central: e.target.value === 'warehouse' ? f.is_central : false }))}>
          <option value="store">Магазин</option>
          <option value="warehouse">Склад</option>
        </select>
        <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Адрес" />
      </div>
      <label className="store-checkbox">
        <input type="checkbox" checked={form.is_central} onChange={e => setForm(f => ({ ...f, is_central: e.target.checked }))} disabled={form.location_type !== 'warehouse'} />
        Центральный склад
      </label>
      <button className="store-primary">Добавить</button>
    </form>
  )
}

function LocationEditForm({ location, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: location.name,
    location_type: location.location_type,
    address: location.address || '',
    is_central: !!location.is_central,
  })
  const submit = (e) => { e.preventDefault(); onSave(form) }

  return (
    <form className="store-form" onSubmit={submit}>
      <h3><Building2 size={18} /> Редактирование: {location.name}</h3>
      <div className="store-form-grid">
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Название" required />
        <select value={form.location_type} onChange={e => setForm(f => ({ ...f, location_type: e.target.value, is_central: e.target.value === 'warehouse' ? f.is_central : false }))}>
          <option value="store">Магазин</option>
          <option value="warehouse">Склад</option>
        </select>
        <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Адрес" />
      </div>
      <label className="store-checkbox">
        <input type="checkbox" checked={form.is_central} onChange={e => setForm(f => ({ ...f, is_central: e.target.checked }))} disabled={form.location_type !== 'warehouse'} />
        Центральный склад
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="store-primary" type="submit">Сохранить</button>
        <button className="store-ghost" type="button" onClick={onCancel}>Отмена</button>
      </div>
    </form>
  )
}

function Admin({ data, runAction }) {
  const [editingLocation, setEditingLocation] = useState(null)
  const [deletingLocation, setDeletingLocation] = useState(null)
  const [moveToId, setMoveToId] = useState('')

  const handleEditLocation = async (form) => {
    await runAction(async () => {
      await apiFetch(`/api/store/locations/${editingLocation.id}`, { method: 'PUT', body: JSON.stringify(form) })
      setEditingLocation(null)
    }, 'Магазин или склад обновлён')
  }

  const handleDeleteLocation = async () => {
    if (!deletingLocation) return
    await runAction(async () => {
      const body = moveToId ? { move_to_location_id: moveToId } : {}
      await apiFetch(`/api/store/locations/${deletingLocation.id}`, { method: 'DELETE', body: JSON.stringify(body) })
      setDeletingLocation(null)
      setMoveToId('')
    }, 'Магазин или склад удалён')
  }

  return (
    <div className="store-stack">
      <LocationForm runAction={runAction} />
      {editingLocation && (
        <LocationEditForm
          location={editingLocation}
          onSave={handleEditLocation}
          onCancel={() => setEditingLocation(null)}
        />
      )}
      {deletingLocation && (
        <div className="store-panel store-modal-overlay">
          <div className="store-panel store-modal">
            <h2>Удалить «{deletingLocation.name}»?</h2>
            <p>Это действие нельзя отменить.</p>
            {arr(data.locations).filter(l => l.id !== deletingLocation.id).length > 0 && (
              <div className="store-form-grid" style={{ marginTop: 12 }}>
                <label>Куда переместить товары:</label>
                <select value={moveToId} onChange={e => setMoveToId(e.target.value)}>
                  <option value="">Удалить вместе с остатками</option>
                  {arr(data.locations).filter(l => l.id !== deletingLocation.id).map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.location_type === 'warehouse' ? 'Склад' : 'Магазин'})</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="store-primary" style={{ background: '#dc2626' }} onClick={handleDeleteLocation}>Удалить</button>
              <button className="store-ghost" onClick={() => { setDeletingLocation(null); setMoveToId('') }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
      <div className="store-grid-2">
        <section className="store-panel">
          <h2>Структура сети</h2>
          <div className="store-list">
            {arr(data.locations).map(location => (
              <div className="store-list-row" key={location.id}>
                <div style={{ flex: 1 }}>
                  <span>{location.name}</span>
                  <strong>{location.location_type === 'warehouse' ? 'Склад' : 'Магазин'}</strong>
                  <small>{location.is_central ? 'Центральный склад' : location.address}</small>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="store-ghost" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setEditingLocation(location)}>Изменить</button>
                  <button className="store-ghost" style={{ padding: '4px 8px', fontSize: 12, color: '#dc2626' }} onClick={() => setDeletingLocation(location)}>Удалить</button>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="store-panel">
          <h2>Журнал действий</h2>
          {arr(data.audit).length === 0 ? <Empty title="Пока пусто" text="Здесь будут видны действия пользователей." /> : (
            <div className="store-list">
              {arr(data.audit).slice(0, 8).map(row => (
                <div className="store-list-row" key={row.id}>
                  <span>{row.action} · {row.entity_type}</span>
                  <strong>{row.user_email || 'система'}</strong>
                  <small>{new Date(row.created_at).toLocaleString('ru-RU')}</small>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function AdminApp() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(null)

  const load = async () => {
    const next = await apiFetch('/api/store/dashboard')
    setData({ ...emptyData, ...next })
  }

  const runAction = async (action, successText) => {
    try {
      setNotice(null)
      await action()
      await load()
      setNotice({ type: 'success', text: successText })
    } catch (err) {
      setNotice({ type: 'error', text: err?.error || err?.message || 'Действие не выполнено' })
    }
  }

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
    load().catch(() => {
      clearAccessToken()
      setError('Не удалось авторизоваться. Вернитесь в личный кабинет и попробуйте снова.')
    })
  }, [])

  if (error) return <div className="store-auth"><p>{error}</p></div>
  if (!data) return <div className="store-auth"><div className="store-spinner" /></div>

  const content = {
    dashboard: <Dashboard data={data} setActiveTab={setActiveTab} />,
    products: <Products data={data} runAction={runAction} />,
    stock: <Stock data={data} runAction={runAction} />,
    purchases: <Purchases data={data} runAction={runAction} />,
    sales: <Sales data={data} runAction={runAction} />,
    storefront: <Storefront data={data} />,
    orders: <Orders data={data} runAction={runAction} />,
    reports: <Reports data={data} />,
    admin: <Admin data={data} runAction={runAction} />,
  }[activeTab]

  return (
    <div className="store-shell">
      <aside className="store-sidebar">
        <div className="store-brand">
          <Building2 size={24} />
          <div><strong>Управление магазином</strong><span>ОнлайнПро.РФ</span></div>
        </div>
        <nav>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="store-main">
        <header className="store-topbar">
          <div>
            <span className="store-kicker">товары · склады · продажи · витрина</span>
            <h1>{tabs.find(t => t.id === activeTab)?.label}</h1>
          </div>
          <div className="store-top-actions">
            <button onClick={() => setActiveTab('products')}><Percent size={16} /> цены</button>
            <button onClick={() => setActiveTab('stock')}><Truck size={16} /> перемещения</button>
            <button onClick={() => setActiveTab('admin')}><History size={16} /> журнал</button>
          </div>
        </header>
        <Notice notice={notice} onClose={() => setNotice(null)} />
        {content}
      </main>
    </div>
  )
}

function PublicStorefront() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState({})
  const [customer, setCustomer] = useState({ customer_name: '', customer_phone: '' })
  const [done, setDone] = useState(null)
  const [error, setError] = useState('')
  const clientId = window.location.pathname.split('/').filter(Boolean).at(-1)

  useEffect(() => {
    fetch(`/api/store/public/${encodeURIComponent(clientId)}/catalog`)
      .then(r => r.json())
      .then(data => setProducts(arr(data.products)))
      .catch(() => setProducts([]))
  }, [clientId])

  const total = products.reduce((sum, product) => sum + (cart[product.id] || 0) * product.sale_price, 0)
  const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  const add = (product) => setCart(c => ({ ...c, [product.id]: (c[product.id] || 0) + 1 }))
  const remove = (product) => setCart(c => ({ ...c, [product.id]: Math.max((c[product.id] || 0) - 1, 0) }))

  const order = async () => {
    setError('')
    const items = Object.entries(cart).filter(([, qty]) => qty > 0).map(([product_id, qty]) => ({ product_id, qty }))
    if (!items.length) return
    if (!customer.customer_name.trim()) {
      setError('Укажите имя покупателя')
      return
    }
    const res = await fetch(`/api/store/public/${encodeURIComponent(clientId)}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...customer, items }),
    })
    const payload = await res.json()
    if (!res.ok) {
      setError(payload?.error || 'Не удалось оформить заказ')
      return
    }
    setDone(payload)
    setCart({})
    setCustomer({ customer_name: '', customer_phone: '' })
  }

  return (
    <div className="storefront-page">
      <header>
        <span>Онлайн-витрина</span>
        <h1>Каталог товаров</h1>
        <p>Выберите товары, добавьте в корзину и оформите заказ. Номер заказа появится сразу после отправки.</p>
      </header>
      {done && <div className="storefront-done">Заказ {done.number} создан на сумму {money(done.total)}</div>}
      {error && <div className="storefront-error">{error}</div>}
      <main className="storefront-grid">
        {products.map(product => (
          <article key={product.id}>
            <div className="storefront-image"><ShoppingBag size={30} /></div>
            <strong>{product.name}</strong>
            <p>{product.description}</p>
            <span>{money(product.sale_price)}</span>
            <div className="storefront-counter">
              <button onClick={() => remove(product)} disabled={!cart[product.id]}><Minus size={16} /></button>
              <b>{cart[product.id] || 0}</b>
              <button onClick={() => add(product)}><Plus size={16} /></button>
            </div>
          </article>
        ))}
      </main>
      <footer className="storefront-cart">
        <div>
          <strong>Корзина: {count} шт.</strong>
          <span>{money(total)}</span>
        </div>
        <input value={customer.customer_name} onChange={e => setCustomer(f => ({ ...f, customer_name: e.target.value }))} placeholder="Ваше имя" />
        <input value={customer.customer_phone} onChange={e => setCustomer(f => ({ ...f, customer_phone: e.target.value }))} placeholder="Телефон" />
        <button disabled={!total} onClick={order}>Оформить заказ</button>
      </footer>
    </div>
  )
}

export default function App() {
  if (window.location.pathname.includes('/store/public/')) {
    return <PublicStorefront />
  }
  return <AdminApp />
}
