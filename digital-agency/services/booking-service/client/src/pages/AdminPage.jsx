import { useState } from 'react';
import { useAuth } from '../App';
import DashboardPage from './DashboardPage';
import CatalogTab from '../components/CatalogTab';
import AppointmentsTab from '../components/AppointmentsTab';
import LogsTab from '../components/LogsTab';
import SelfBookingTab from '../components/SelfBookingTab';
import SpecialistsTab from '../components/SpecialistsTab';

const TABS = [
  { id: 'dashboard', label: 'Дашборд', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
  { id: 'appointments', label: 'Записи', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'services', label: 'Услуги', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { id: 'specialists', label: 'Сотрудники', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'logs', label: 'Журнал', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'self-booking', label: 'Настройки', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

function getDisplayBoardUrl(user) {
  const clientId = user.clientId || user.client_id || localStorage.getItem('bookingClientId') || '';
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/display?client_id=${encodeURIComponent(clientId)}`;
}

function getDisplaySpecialistsUrl(user) {
  const clientId = user.clientId || user.client_id || localStorage.getItem('bookingClientId') || '';
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/display-specialists?client_id=${encodeURIComponent(clientId)}`;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('dashboard');

  const displayUrl = getDisplayBoardUrl(user);
  const displaySpecialistsUrl = getDisplaySpecialistsUrl(user);

  const openDisplay = () => window.open(displayUrl, '_blank');
  const openDisplaySpecialists = () => window.open(displaySpecialistsUrl, '_blank');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <h1 className="text-lg font-semibold text-gray-800">Электронная запись</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={openDisplay}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg font-medium transition"
              title="Открыть табло записей в новой вкладке"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              <span className="hidden sm:inline">Табло</span>
            </button>
            <button
              onClick={openDisplaySpecialists}
              className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-sm px-3 py-1.5 rounded-lg font-medium transition"
              title="Открыть табло по сотрудникам в новой вкладке"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span className="hidden sm:inline">Табло сотрудники</span>
            </button>
            <span className="hidden md:inline text-sm text-gray-500">{user.displayName || user.display_name || user.username}</span>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {TABS.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === item.id ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon}/></svg>
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {tab === 'dashboard' && <DashboardPage />}
        {tab === 'appointments' && <AppointmentsTab />}
        {tab === 'services' && <CatalogTab />}
        {tab === 'specialists' && <SpecialistsTab />}
        {tab === 'logs' && <LogsTab />}
        {tab === 'self-booking' && <SelfBookingTab />}
      </main>
    </div>
  );
}
