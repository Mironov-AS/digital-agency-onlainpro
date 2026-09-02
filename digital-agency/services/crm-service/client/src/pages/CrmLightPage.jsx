import { useEffect, useMemo, useState } from 'react'
import { Users, ClipboardList, BarChart3, Settings, Calendar, ShoppingCart } from 'lucide-react'
import CrmCustomersTab from './crm/CrmCustomersTab'
import CrmWorkRecordsTab from './crm/CrmWorkRecordsTab'
import CrmStatisticsTab from './crm/CrmStatisticsTab'
import CrmSettingsTab from './crm/CrmSettingsTab'
import CrmCalendarTab from './crm/CrmCalendarTab'
import CrmOrdersTab from './crm/CrmOrdersTab'
import { apiFetch } from '../api.js'

const TABS = [
  { id: 'customers', label: 'Клиенты', icon: Users },
  { id: 'records', label: 'Работы', icon: ClipboardList },
  { id: 'orders', label: 'Заказы', icon: ShoppingCart },
  { id: 'calendar', label: 'Календарь', icon: Calendar },
  { id: 'statistics', label: 'Статистика', icon: BarChart3 },
  { id: 'settings', label: 'Настройки', icon: Settings },
]

export default function CrmLightPage() {
  const [activeTab, setActiveTab] = useState('customers')
  const [crmMode, setCrmMode] = useState('both')

  useEffect(() => {
    apiFetch('/api/crm/display-settings')
      .then(data => setCrmMode(data.crm_mode || 'both'))
      .catch(() => setCrmMode('both'))
  }, [])

  const visibleTabs = useMemo(() => TABS.filter(tab => {
    if (tab.id === 'records') return crmMode !== 'sales'
    if (tab.id === 'orders') return crmMode !== 'services'
    return true
  }), [crmMode])

  useEffect(() => {
    if (!visibleTabs.some(tab => tab.id === activeTab)) {
      setActiveTab('customers')
    }
  }, [activeTab, visibleTabs])

  return (
    <div className="page crm-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">CRM Light</h1>
          <p className="page-sub">Учёт клиентов, услуг, сотрудников и работ</p>
        </div>
      </div>

      <div className={`section-tabs crm-tabs-strip${activeTab === 'calendar' ? ' crm-tabs-strip--with-toolbar' : ''}`}>
        <div className="crm-tabs-nav">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              className={`section-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
        {activeTab === 'calendar' && <div id="crm-calendar-toolbar-slot" className="crm-calendar-toolbar-slot" />}
      </div>

      {activeTab === 'customers' && <CrmCustomersTab />}
      {activeTab === 'records' && <CrmWorkRecordsTab />}
      {activeTab === 'orders' && <CrmOrdersTab />}
      {activeTab === 'calendar' && <CrmCalendarTab />}
      {activeTab === 'statistics' && <CrmStatisticsTab crmMode={crmMode} />}
      {activeTab === 'settings' && <CrmSettingsTab crmMode={crmMode} onCrmModeChange={setCrmMode} />}
    </div>
  )
}
