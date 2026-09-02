import { useState } from 'react';
import { Settings, Shield, BrainCircuit } from 'lucide-react';
import SettingsTab from './tabs/SettingsTab';
import AuditTab from './tabs/AuditTab';
import LLMTab from './tabs/LLMTab';

const TABS = [
  { key: 'settings', label: 'Настройки системы',    icon: Settings,     component: SettingsTab },
  { key: 'audit',    label: 'Безопасность и аудит', icon: Shield,       component: AuditTab },
  { key: 'llm',      label: 'ИИ-модели',            icon: BrainCircuit, component: LLMTab },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('settings');
  const ActiveComponent = TABS.find(t => t.key === activeTab)?.component ?? SettingsTab;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Панель администратора</h1>
        <p className="text-sm text-gray-500 mt-0.5">Настройки, интеграции и аудит системы</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl flex-wrap">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <ActiveComponent />
    </div>
  );
}
