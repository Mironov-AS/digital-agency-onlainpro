import { useEffect, useState } from 'react'
import { Package, Users } from 'lucide-react'
import CrmStatEmployees from './CrmStatEmployees'
import CrmStatSales from './CrmStatSales'

const BASE_STAT_SECTIONS = [
  { id: 'employees', label: 'По сотрудникам', icon: Users },
  { id: 'sales', label: 'По продажам', icon: Package },
]

export default function CrmStatisticsTab({ crmMode = 'both' }) {
  const sections = BASE_STAT_SECTIONS.filter(s => s.id !== 'sales' || crmMode !== 'services')
  const [section, setSection] = useState('employees')

  useEffect(() => {
    if (!sections.some(s => s.id === section)) setSection(sections[0]?.id || 'employees')
  }, [section, sections])

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
        {section === 'employees' && <CrmStatEmployees />}
        {section === 'sales' && <CrmStatSales />}
      </div>
    </div>
  )
}
