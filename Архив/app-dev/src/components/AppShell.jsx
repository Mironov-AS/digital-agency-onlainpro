import { LayoutDashboard, LogOut, Settings } from 'lucide-react'
import { SERVICES, hasAccess, accessibleServices } from '../config/services.js'
import ServiceCard from './ServiceCard.jsx'

export default function AppShell({ user, onLogout, onNavigate }) {
  const services = accessibleServices(user)

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-logo">
          <LayoutDashboard size={20} />
          <span>Цифровое агентство ОнлайнПро.РФ</span>
        </div>
        <div className="app-header-user">
          <button className="btn-settings" onClick={() => onNavigate('admin')}>
            <Settings size={16} />
          </button>
          <span className="user-name">{user.name}</span>
          <span className="user-role">
            {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
          </span>
          <button className="btn-logout" onClick={onLogout}>
            <LogOut size={16} /> Выйти
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Добро пожаловать, {user.name.split(' ')[0]}!</h1>
          <p className="dashboard-sub">Выберите сервис для работы</p>
        </div>

        <div className="services-grid">
          {SERVICES.map(svc => (
            <ServiceCard
              key={svc.id}
              svc={svc}
              hasAccess={hasAccess(user, svc)}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        <div className="dashboard-info">
          <div className="info-card">
            <div className="info-label">Ваша роль</div>
            <div className="info-value">
              {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">Доступных сервисов</div>
            <div className="info-value">{services.length}</div>
          </div>
          <div className="info-card">
            <div className="info-label">Email</div>
            <div className="info-value">{user.email}</div>
          </div>
        </div>
      </main>
    </div>
  )
}
