import { useState, useEffect } from 'react'
import {
  Plus, X, Loader2,
  ArrowUp, ArrowDown, Eye, GripVertical, Save, Check,
  Briefcase, UserCog, SlidersHorizontal, Filter, Link2, Clock,
  Package, Layers,
} from 'lucide-react'
import { apiFetch } from '../../api.js'
import CrmServicesTab from './CrmServicesTab'
import CrmEmployeesTab from './CrmEmployeesTab'
import CrmFieldsSettings from './CrmFieldsSettings'
import CrmFiltersTab from './CrmFiltersTab'
import CrmIntegrationTab from './CrmIntegrationTab'
import CrmSalesItemsTab from './CrmSalesItemsTab'

const BASE_SETTINGS_SECTIONS = [
  { id: 'services', label: 'Услуги', icon: Briefcase },
  { id: 'sales', label: 'Номенклатура', icon: Package },
  { id: 'employees', label: 'Сотрудники', icon: UserCog },
  { id: 'fields', label: 'Доп. поля', icon: SlidersHorizontal },
  { id: 'filters', label: 'Шаблоны фильтров', icon: Filter },
  { id: 'integration', label: 'Интеграция', icon: Link2 },
  { id: 'display', label: 'Экран', icon: Eye },
  { id: 'mode', label: 'Режим CRM', icon: Layers },
  { id: 'workhours', label: 'Рабочее время', icon: Clock },
]
const CRM_MODE_OPTIONS = [
  { value: 'services', label: 'Услуги' },
  { value: 'sales', label: 'Продажи' },
  { value: 'both', label: 'Услуги и продажи' },
]

const WORK_HOURS_KEY = 'crm_work_hours'
const HOURS_OPTIONS = Array.from({ length: 24 }, (_, i) => i)

function getWorkHours() {
  try {
    const raw = localStorage.getItem(WORK_HOURS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (typeof parsed.start === 'number' && typeof parsed.end === 'number') return parsed
    }
  } catch {}
  return { start: 9, end: 18 }
}

function WorkHoursSection() {
  const [hours, setHours] = useState(getWorkHours)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    localStorage.setItem(WORK_HOURS_KEY, JSON.stringify(hours))
    setSaved(true)
    window.dispatchEvent(new Event('crm-work-hours-changed'))
    setTimeout(() => setSaved(false), 2000)
  }

  const isValid = hours.start < hours.end

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
            <Clock size={16} style={{ verticalAlign: -2, marginRight: 6 }} />
            Рабочее время организации
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
            Задайте рабочие часы. Календарь в режиме «Раб. неделя» будет отображать
            рабочий день как основной диапазон, а нерабочие часы покажет только при запланированных активностях.
          </p>
        </div>
        <button className="btn-save" onClick={handleSave} disabled={!isValid}>
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? 'Сохранено' : 'Сохранить'}
        </button>
      </div>

      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb',
        padding: 24, maxWidth: 480,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Начало рабочего дня
            </label>
            <select
              className="crm-input"
              value={hours.start}
              onChange={e => { setHours(h => ({ ...h, start: +e.target.value })); setSaved(false) }}
              style={{ width: '100%' }}
            >
              {HOURS_OPTIONS.map(h => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Конец рабочего дня
            </label>
            <select
              className="crm-input"
              value={hours.end}
              onChange={e => { setHours(h => ({ ...h, end: +e.target.value })); setSaved(false) }}
              style={{ width: '100%' }}
            >
              {HOURS_OPTIONS.map(h => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
              ))}
            </select>
          </div>
        </div>
        {!isValid && (
          <div style={{ marginTop: 12, fontSize: 13, color: '#ef4444' }}>
            Время начала должно быть раньше времени окончания.
          </div>
        )}

        <div style={{
          marginTop: 20, padding: '12px 16px', background: '#f0fdf4',
          border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, color: '#166534',
        }}>
          <strong>Рабочая неделя:</strong> Понедельник — Пятница
          <br />
          <strong>Рабочие часы:</strong> {String(hours.start).padStart(2, '0')}:00 — {String(hours.end).padStart(2, '0')}:00
          <br />
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            Активности вне рабочего времени расширяют сетку календаря только на нужные часы.
          </span>
        </div>
      </div>
    </div>
  )
}

function DisplayFieldsSection() {
  const [displaySettings, setDisplaySettings] = useState(null)
  const [columns, setColumns] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function loadSettings() {
    setLoading(true)
    try {
      const data = await apiFetch('/api/crm/display-settings')
      setDisplaySettings(data)
      setColumns(data.columns || [])
    } catch (e) {
      console.error('[crm] load display settings', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSettings() }, [])

  function allFields() {
    if (!displaySettings) return []
    const std = displaySettings.available_standard.map(f => ({
      key: f.key, label: f.label, always: f.always, group: 'standard',
    }))
    const cf = (displaySettings.available_custom || []).map(f => ({
      key: f.key, label: f.label, group: 'custom',
    }))
    return [...std, ...cf]
  }

  function toggleField(key) {
    const field = allFields().find(f => f.key === key)
    if (field?.always) return
    setColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
    setSaved(false)
  }

  function moveField(key, dir) {
    setColumns(prev => {
      const idx = prev.indexOf(key)
      if (idx < 0) return prev
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next
    })
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await apiFetch('/api/crm/display-settings', {
        method: 'PUT',
        body: JSON.stringify({ columns }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      alert('Ошибка: ' + (e.error || e.message))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading-center"><Loader2 size={20} className="spin" /></div>
  if (!displaySettings) return null

  const fields = allFields()
  const selectedFields = columns.map(k => fields.find(f => f.key === k)).filter(Boolean)
  const unselectedFields = fields.filter(f => !columns.includes(f.key))

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
            <Eye size={16} style={{ verticalAlign: -2, marginRight: 6 }} />
            Поля на главном экране
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
            Выберите, какие поля отображать в таблице клиентов. Поиск работает по выбранным полям.
          </p>
        </div>
        <button className="btn-save" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={14} className="spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
          {saving ? 'Сохранение...' : saved ? 'Сохранено' : 'Сохранить'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
            Отображаемые поля (порядок = порядок столбцов)
          </div>
          {selectedFields.length === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: 13 }}>Нет выбранных полей</div>
          ) : (
            <div style={{ display: 'grid', gap: 4 }}>
              {selectedFields.map((f, i) => (
                <div key={f.key} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe',
                }}>
                  <GripVertical size={14} style={{ color: '#93c5fd', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{f.label}</span>
                  {f.group === 'custom' && (
                    <span style={{ fontSize: 10, color: '#6b7280', background: '#f3f4f6', borderRadius: 4, padding: '1px 5px' }}>доп.</span>
                  )}
                  <div style={{ display: 'flex', gap: 2 }}>
                    <button className="icon-btn" onClick={() => moveField(f.key, 'up')} disabled={i === 0} title="Вверх"
                      style={{ width: 24, height: 24 }}>
                      <ArrowUp size={12} />
                    </button>
                    <button className="icon-btn" onClick={() => moveField(f.key, 'down')} disabled={i === selectedFields.length - 1} title="Вниз"
                      style={{ width: 24, height: 24 }}>
                      <ArrowDown size={12} />
                    </button>
                    {!f.always && (
                      <button className="icon-btn icon-btn--danger" onClick={() => toggleField(f.key)} title="Убрать"
                        style={{ width: 24, height: 24 }}>
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
            Доступные поля
          </div>
          {unselectedFields.length === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: 13 }}>Все поля выбраны</div>
          ) : (
            <div style={{ display: 'grid', gap: 4 }}>
              {unselectedFields.map(f => (
                <div key={f.key} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                }} onClick={() => toggleField(f.key)}>
                  <Plus size={14} style={{ color: '#2563eb', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: '#6b7280' }}>{f.label}</span>
                  {f.group === 'custom' && (
                    <span style={{ fontSize: 10, color: '#6b7280', background: '#f3f4f6', borderRadius: 4, padding: '1px 5px' }}>доп.</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FeatureModeSection({ crmMode, onCrmModeChange }) {
  const [mode, setMode] = useState(crmMode || 'both')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setMode(crmMode || 'both') }, [crmMode])

  async function handleSave() {
    setSaving(true)
    try {
      const result = await apiFetch('/api/crm/display-settings', {
        method: 'PUT',
        body: JSON.stringify({ crm_mode: mode }),
      })
      onCrmModeChange?.(result.crm_mode || mode)
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ maxWidth: 720 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
          <Layers size={16} style={{ verticalAlign: -2, marginRight: 6 }} />
          Режим CRM
        </h3>
        <p style={{ margin: '4px 0 18px', fontSize: 13, color: '#6b7280' }}>
          Выберите, какие рабочие разделы показывать пользователям: услуги, продажи или оба направления.
        </p>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'grid', gap: 10 }}>
            {CRM_MODE_OPTIONS.map(opt => (
              <label key={opt.value} style={{
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                border: `1.5px solid ${mode === opt.value ? '#93c5fd' : '#e5e7eb'}`,
                background: mode === opt.value ? '#eff6ff' : '#fff',
                borderRadius: 8, padding: '12px 14px',
              }}>
                <input type="radio" checked={mode === opt.value} onChange={() => setMode(opt.value)} />
                <span style={{ fontWeight: 700 }}>{opt.label}</span>
              </label>
            ))}
          </div>
          <button className="btn-save" onClick={handleSave} disabled={saving} style={{ marginTop: 16 }}>
            {saving ? <Loader2 size={14} className="spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
            {saving ? 'Сохранение...' : saved ? 'Сохранено' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CrmSettingsTab({ crmMode = 'both', onCrmModeChange }) {
  const sections = BASE_SETTINGS_SECTIONS.filter(s => {
    if (s.id === 'services') return crmMode !== 'sales'
    if (s.id === 'sales') return crmMode !== 'services'
    return true
  })
  const [section, setSection] = useState(() => (crmMode === 'sales' ? 'sales' : 'services'))

  useEffect(() => {
    if (!sections.some(s => s.id === section)) {
      setSection(sections[0]?.id || 'mode')
    }
  }, [crmMode, section, sections])

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 140px)' }}>
      <nav style={{
        width: 200, flexShrink: 0, background: '#f9fafb',
        borderRight: '1px solid #e5e7eb', padding: '16px 0',
      }}>
        {sections.map(s => {
          const Icon = s.icon
          const active = section === s.id
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '10px 20px', border: 'none',
                background: active ? '#fff' : 'transparent',
                borderRight: active ? '2px solid #3b82f6' : '2px solid transparent',
                color: active ? '#111827' : '#6b7280',
                fontWeight: active ? 600 : 400,
                fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={15} />
              {s.label}
            </button>
          )
        })}
      </nav>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {section === 'services' && <CrmServicesTab />}
        {section === 'sales' && <CrmSalesItemsTab />}
        {section === 'employees' && <CrmEmployeesTab />}
        {section === 'fields' && <CrmFieldsSettings />}
        {section === 'filters' && <CrmFiltersTab />}
        {section === 'integration' && <CrmIntegrationTab />}
        {section === 'display' && <DisplayFieldsSection />}
        {section === 'mode' && <FeatureModeSection crmMode={crmMode} onCrmModeChange={onCrmModeChange} />}
        {section === 'workhours' && <WorkHoursSection />}
      </div>
    </div>
  )
}
