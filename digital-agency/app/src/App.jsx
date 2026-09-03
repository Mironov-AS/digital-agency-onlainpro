import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import './App.css'
import { apiFetch, clearAccessToken } from './api.js'
import LoginPage from './pages/LoginPage.jsx'
import AppShell from './components/AppShell.jsx'
import CatalogPage from './pages/CatalogPage'
import ClientsPage from './pages/ClientsPage'
import ClientDetailPage from './pages/ClientDetailPage'
import DashboardPage from './pages/DashboardPage'
import ProductShelfPage from './pages/ProductShelfPage'
import OrgCostsPage from './pages/OrgCostsPage'
import AdminPage from './pages/AdminPage'
import ProjectsPage from './pages/ProjectsPage'

function Splash() {
  return <div className="splash"><Loader2 size={32} className="spin" /></div>
}

function Dashboard({ user, onLogout }) {
  const [page, setPage] = useState('dashboard')
  const [selectedClientId, setSelectedClientId] = useState(null)

  const goHome = () => { setPage('dashboard'); setSelectedClientId(null) }

  if (page === 'analytics') {
    return (
      <DashboardPage
        onBack={goHome}
        onGoToClient={(id) => { setSelectedClientId(id); setPage('clients') }}
      />
    )
  }
  if (page === 'catalog') return <CatalogPage onBack={goHome} user={user} />
  if (page === 'clients' && selectedClientId) {
    return <ClientDetailPage clientId={selectedClientId} onBack={() => setSelectedClientId(null)} />
  }
  if (page === 'clients') {
    return <ClientsPage onBack={goHome} onSelectClient={setSelectedClientId} />
  }
  if (page === 'projects') return <ProjectsPage onBack={goHome} />
  if (page === 'orgcosts') return <OrgCostsPage onBack={goHome} />
  if (page === 'product-shelf') return <ProductShelfPage onBack={goHome} user={user} />
  if (page === 'admin') return <AdminPage onBack={goHome} user={user} />

  return <AppShell user={user} onLogout={onLogout} onNavigate={setPage} />
}

export default function App() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    apiFetch('/api/auth/me')
      .then(async (currentUser) => {
        if (currentUser?.role === 'admin') {
          setUser(currentUser)
          return
        }
        await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
        clearAccessToken()
        setUser(null)
      })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [])

  async function handleLogout() {
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    clearAccessToken()
    setUser(null)
  }

  if (checking) return <Splash />
  if (!user) return <LoginPage onLogin={setUser} />
  return <Dashboard user={user} onLogout={handleLogout} />
}
