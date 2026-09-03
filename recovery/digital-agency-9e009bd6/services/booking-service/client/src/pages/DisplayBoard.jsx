import { useState, useEffect, useCallback } from 'react';

const STATUS_BORDER = { confirmed: '#22c55e', pending: '#eab308', pending_review: '#ea580c', canceled: '#ef4444' };
const STATUS_LABEL = { confirmed: 'Подтверждена', pending: 'Ожидает', pending_review: 'На проверке', canceled: 'Отменена' };
const STATUS_ICON = { confirmed: '✓', pending: '⏳', pending_review: '🔍', canceled: '✕' };

const DAY_NAMES = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="text-right">
      <div className="text-6xl font-black tabular-nums tracking-tight">
        {now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-xl text-gray-400 mt-1">
        {now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    pending_review: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    canceled: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${colors[status] || colors.pending}`}>
      {STATUS_ICON[status]} {STATUS_LABEL[status]}
    </span>
  );
}

function isCurrentOrUpcoming(a) {
  const now = new Date();
  const dateStr = (a.appointment_date || '').slice(0, 10);
  const today = toDateStr(now);
  if (dateStr > today) return true;
  if (dateStr < today) return false;
  const [h, m] = (a.end_time || a.appointment_time || '23:59').split(':').map(Number);
  const endMinutes = h * 60 + m;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return endMinutes >= nowMinutes;
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = toDateStr(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === today) return 'Сегодня';
  if (dateStr === toDateStr(tomorrow)) return 'Завтра';
  return d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
}

function AppointmentCard({ a, compact }) {
  return (
    <div
      className={`rounded-2xl transition-all ${compact ? 'p-4' : 'p-6'}`}
      style={{
        background: `linear-gradient(135deg, ${a.service_color || '#14b8a6'}ee, ${a.service_color || '#14b8a6'}99)`,
        borderLeft: `6px solid ${STATUS_BORDER[a.status] || '#14b8a6'}`,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`${compact ? 'text-2xl' : 'text-4xl'} font-black tabular-nums`}>{a.appointment_time?.slice(0, 5)}</div>
        <StatusBadge status={a.status} />
      </div>
      <div className={`${compact ? 'text-lg' : 'text-2xl'} font-bold`}>{a.service_name}</div>
      {a.specialist_name && (
        <div className={`${compact ? 'text-sm' : 'text-base'} opacity-90 mt-1`}>🧑‍💼 {a.specialist_name}</div>
      )}
      {a.vehicle_number && (
        <div className={`${compact ? 'text-base' : 'text-xl'} opacity-90 mt-1 font-mono tracking-wider`}>{a.vehicle_number}</div>
      )}
      {a.customer_name && (
        <div className={`${compact ? 'text-sm' : 'text-lg'} opacity-80 mt-1`}>{a.customer_name}</div>
      )}
    </div>
  );
}

function PastCard({ a }) {
  return (
    <div
      className="rounded-xl p-4 opacity-50"
      style={{
        background: `${a.service_color || '#14b8a6'}33`,
        borderLeft: `4px solid ${a.service_color || '#14b8a6'}55`,
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold tabular-nums text-gray-400">{a.appointment_time?.slice(0, 5)}</span>
        <span className="text-gray-500 font-medium">{a.service_name}</span>
      </div>
      {a.specialist_name && <div className="text-sm text-gray-600 mt-1">🧑‍💼 {a.specialist_name}</div>}
      {a.vehicle_number && <div className="text-sm text-gray-600 mt-1 font-mono">{a.vehicle_number}</div>}
    </div>
  );
}

export default function DisplayBoard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [interval, setInterval_] = useState('day');

  const params = new URLSearchParams(window.location.search);
  const clientId = params.get('client_id') || '';

  useEffect(() => {
    fetch(`/api/booking/settings/public/${encodeURIComponent(clientId || 'default')}`)
      .then(r => r.json())
      .then(d => { if (d.display_board_interval) setInterval_(d.display_board_interval); })
      .catch(() => {});
  }, [clientId]);

  const load = useCallback(async () => {
    try {
      const url = clientId
        ? `/api/booking/dashboard/public/${encodeURIComponent(clientId)}`
        : `/api/booking/dashboard/public/default`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const allApps = (data.appointments || []).filter(a => a.status !== 'canceled');
        setAppointments(allApps);
        setLastUpdate(new Date());
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const iv = window.setInterval(load, 30000);
    return () => window.clearInterval(iv);
  }, [load]);

  const today = toDateStr(new Date());

  const filteredApps = interval === 'day'
    ? appointments.filter(a => (a.appointment_date || '').slice(0, 10) === today)
    : appointments;

  const upcoming = filteredApps.filter(isCurrentOrUpcoming);
  const past = filteredApps.filter(a => !isCurrentOrUpcoming(a));

  const groupByDate = (items) => {
    const groups = {};
    items.forEach(a => {
      const d = (a.appointment_date || '').slice(0, 10);
      if (!groups[d]) groups[d] = [];
      groups[d].push(a);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  };

  const isWeek = interval === 'week';
  const upcomingGroups = isWeek ? groupByDate(upcoming) : null;
  const pastGroups = isWeek ? groupByDate(past) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4 text-lg">Загрузка табло...</p>
        </div>
      </div>
    );
  }

  const title = isWeek ? 'Записи на неделю' : 'Запись на сегодня';
  const totalUpcoming = upcoming.length;

  return (
    <div className="min-h-screen bg-gray-950 text-white select-none overflow-hidden">
      <header className="px-8 pt-6 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tight">{title}</h1>
          <p className="text-gray-500 text-lg mt-2">
            {totalUpcoming > 0
              ? `${totalUpcoming} ${totalUpcoming === 1 ? 'запись' : totalUpcoming < 5 ? 'записи' : 'записей'} предстоит`
              : 'Все записи завершены'}
          </p>
        </div>
        <Clock />
      </header>

      <div className="px-8 pb-8">
        {filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="text-8xl mb-6 opacity-30">📅</div>
            <div className="text-3xl text-gray-600 font-bold">
              {isWeek ? 'Записей на эту неделю нет' : 'Записей на сегодня нет'}
            </div>
            <div className="text-gray-700 text-lg mt-2">Данные обновляются автоматически</div>
          </div>
        ) : isWeek ? (
          <>
            {upcomingGroups.length > 0 && upcomingGroups.map(([dateStr, items]) => (
              <div key={dateStr} className="mb-6">
                <h2 className="text-2xl font-bold text-gray-300 mb-3">{formatDateLabel(dateStr)}</h2>
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {items.map(a => <AppointmentCard key={a.id || a.appointment_time} a={a} compact />)}
                </div>
              </div>
            ))}
            {pastGroups.length > 0 && (
              <div>
                <div className="text-gray-600 text-sm font-semibold uppercase tracking-wider mb-3 mt-4">Завершённые</div>
                {pastGroups.map(([dateStr, items]) => (
                  <div key={dateStr} className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">{formatDateLabel(dateStr)}</div>
                    <div className="grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                      {items.map(a => <PastCard key={a.id || a.appointment_time} a={a} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mb-6">
                {upcoming.map(a => <AppointmentCard key={a.id || a.appointment_time} a={a} />)}
              </div>
            )}
            {past.length > 0 && (
              <div>
                <div className="text-gray-600 text-sm font-semibold uppercase tracking-wider mb-3">Завершённые</div>
                <div className="grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                  {past.map(a => <PastCard key={a.id || a.appointment_time} a={a} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-8 py-3 flex items-center justify-between text-gray-700 text-sm">
        <div>Данные обновляются каждые 30 секунд</div>
        {lastUpdate && (
          <div>Обновлено: {lastUpdate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
        )}
      </div>
    </div>
  );
}
