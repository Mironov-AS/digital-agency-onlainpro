import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { apiFetch } from './api';
import LoginPage from './pages/LoginPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import DisplayBoard from './pages/DisplayBoard.jsx';
import DisplayBoardSpecialists from './pages/DisplayBoardSpecialists.jsx';
import SelfBookPage from './pages/SelfBookPage.jsx';

export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function extractSsoParams() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('auth_token') || params.get('token');
  const clientId = params.get('client_id');
  if (token && clientId) {
    sessionStorage.setItem('_sso_token', token);
    sessionStorage.setItem('_sso_client_id', clientId);
    window.history.replaceState({}, '', window.location.pathname);
    return { token, clientId };
  }
  const savedToken = sessionStorage.getItem('_sso_token');
  const savedClientId = sessionStorage.getItem('_sso_client_id');
  if (savedToken && savedClientId) {
    return { token: savedToken, clientId: savedClientId };
  }
  return null;
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sso = extractSsoParams();

    if (sso) {
      fetch('/api/booking/auth/sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sso.token, client_id: sso.clientId }),
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          sessionStorage.removeItem('_sso_token');
          sessionStorage.removeItem('_sso_client_id');
          if (data?.token && data?.user) {
            localStorage.setItem('bookingToken', data.token);
            localStorage.setItem('bookingClientId', sso.clientId);
            setUser(data.user);
          }
        })
        .catch(() => {
          sessionStorage.removeItem('_sso_token');
          sessionStorage.removeItem('_sso_client_id');
        })
        .finally(() => setLoading(false));
      return;
    }

    const stored = localStorage.getItem('bookingToken');
    if (!stored) { setLoading(false); return; }

    apiFetch('/api/booking/auth/me')
      .then(r => r?.ok ? r.json() : null)
      .then(data => { if (data?.id) setUser(data); else localStorage.removeItem('bookingToken'); })
      .catch(() => localStorage.removeItem('bookingToken'))
      .finally(() => setLoading(false));
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('bookingToken', token);
    localStorage.setItem('bookingUser', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('bookingToken');
    localStorage.removeItem('bookingUser');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-400 text-lg">Загрузка...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function DevAutoLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    fetch('/api/booking/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123456' }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.token && data.user) {
          login(data.user, data.token);
          navigate('/admin', { replace: true });
        }
      });
  }, []);
  return <div className="flex items-center justify-center h-screen bg-gray-50"><div className="text-gray-400">Авто-вход...</div></div>;
}

function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export default function App() {
  const base = import.meta.env.BASE_URL;
  return (
    <BrowserRouter basename={base.replace(/\/$/, '')} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/dev-login" element={<DevAutoLogin />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/display" element={<DisplayBoard />} />
          <Route path="/display-specialists" element={<DisplayBoardSpecialists />} />
          <Route path="/self-book" element={<SelfBookPage />} />
          <Route path="/admin/*" element={<RequireAuth><AdminPage /></RequireAuth>} />
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
