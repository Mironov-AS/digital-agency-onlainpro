import { useEffect, useState } from 'react'
import { Download, Loader2, Package, TrendingUp, Users } from 'lucide-react'
import { apiFetch } from '../../api.js'

function fmtMoney(value) {
  return `${Number(value || 0).toLocaleString('ru-RU')} ₽`
}

function defaultFrom() {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().slice(0, 10)
}

function defaultTo() {
  return new Date().toISOString().slice(0, 10)
}

export default function CrmStatSales() {
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)
  const [customerId, setCustomerId] = useState('')
  const [itemId, setItemId] = useState('')
  const [customers, setCustomers] = useState([])
  const [items, setItems] = useState([])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  async function loadRefs() {
    try {
      const [custData, itemData] = await Promise.all([
        apiFetch('/api/crm/customers?limit=1000'),
        apiFetch('/api/crm/sales-items'),
      ])
      setCustomers((custData.items || custData) || [])
      setItems(Array.isArray(itemData) ? itemData : [])
    } catch (e) {
      console.error('[crm] load sales report refs', e)
    }
  }

  async function loadReport() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ from, to })
      if (customerId) params.set('customer_id', customerId)
      if (itemId) params.set('item_id', itemId)
      setData(await apiFetch(`/api/crm/statistics/sales?${params}`))
    } catch (e) {
      console.error('[crm] load sales report', e)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRefs() }, [])
  useEffect(() => { loadReport() }, [])

  function exportCsv() {
    if (!data?.orders?.length) return
    const rows = [
      ['Заказ', 'Клиент', 'Статус', 'Сумма', 'Дата', 'Итог'],
      ...data.orders.map(o => [
        o.title,
        o.customer_name,
        o.status,
        o.total,
        o.created_at ? new Date(o.created_at).toLocaleDateString('ru-RU') : '',
        o.outcome || '',
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-report-${from}-${to}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      <div className="stat-period-panel">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input className="field" type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ maxWidth: 150 }} autoComplete="off" />
          <input className="field" type="date" value={to} onChange={e => setTo(e.target.value)} style={{ maxWidth: 150 }} autoComplete="off" />
          <select className="field" value={customerId} onChange={e => setCustomerId(e.target.value)} style={{ maxWidth: 220 }} autoComplete="off">
            <option value="">Все клиенты</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
          <select className="field" value={itemId} onChange={e => setItemId(e.target.value)} style={{ maxWidth: 220 }} autoComplete="off">
            <option value="">Вся номенклатура</option>
            {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          <button className="btn-primary-sm" onClick={loadReport}>Сформировать</button>
          <button className="btn-secondary" onClick={exportCsv} disabled={!data?.orders?.length}><Download size={14} /> CSV</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><Loader2 size={28} className="spin" /></div>
      ) : !data ? (
        <div className="empty-state">Нет данных отчёта</div>
      ) : (
        <>
          <div className="stat-kpi-grid">
            <div className="stat-kpi-card">
              <div className="stat-kpi-icon" style={{ background: '#1e40af' }}><TrendingUp size={20} /></div>
              <div><div className="stat-kpi-label">Сумма сделок</div><div className="stat-kpi-value">{fmtMoney(data.grand_total)}</div></div>
            </div>
            <div className="stat-kpi-card">
              <div className="stat-kpi-icon" style={{ background: '#059669' }}><Package size={20} /></div>
              <div><div className="stat-kpi-label">Заказов</div><div className="stat-kpi-value">{data.order_count}</div></div>
            </div>
            <div className="stat-kpi-card">
              <div className="stat-kpi-icon" style={{ background: '#7c3aed' }}><Users size={20} /></div>
              <div><div className="stat-kpi-label">Клиентов</div><div className="stat-kpi-value">{data.by_customers?.length || 0}</div></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>По клиентам</h3>
              {(data.by_customers || []).map(c => (
                <div key={c.customer_id || c.name} className="stat-summary-row">
                  <div className="stat-summary-row-info">
                    <span className="stat-summary-row-name">{c.name}</span>
                    <span className="stat-summary-row-count">{c.order_count} заказов</span>
                  </div>
                  <span className="stat-summary-row-money">{fmtMoney(c.total)}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>По номенклатуре</h3>
              {(data.by_items || []).map(i => (
                <div key={i.sales_item_id || i.name} className="stat-summary-row">
                  <div className="stat-summary-row-info">
                    <span className="stat-summary-row-name">{i.name}</span>
                    <span className="stat-summary-row-count">{Number(i.quantity).toLocaleString('ru-RU')} шт · {i.order_count} заказов</span>
                  </div>
                  <span className="stat-summary-row-money">{fmtMoney(i.total)}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflowX: 'auto', marginTop: 20 }}>
            <table className="data-table">
              <thead>
                <tr><th>Заказ</th><th>Клиент</th><th>Дата</th><th>Статус</th><th style={{ width: 120 }}>Сумма</th></tr>
              </thead>
              <tbody>
                {(data.orders || []).map(o => (
                  <tr key={o.id}>
                    <td><div style={{ fontWeight: 700 }}>{o.title}</div>{o.outcome && <div style={{ fontSize: 12, color: '#6b7280' }}>{o.outcome}</div>}</td>
                    <td>{o.customer_name}</td>
                    <td>{o.created_at ? new Date(o.created_at).toLocaleDateString('ru-RU') : '—'}</td>
                    <td>{o.status === 'completed' ? 'Выполнен' : o.status === 'canceled' ? 'Отменен' : 'В работе'}</td>
                    <td style={{ fontWeight: 700 }}>{fmtMoney(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
