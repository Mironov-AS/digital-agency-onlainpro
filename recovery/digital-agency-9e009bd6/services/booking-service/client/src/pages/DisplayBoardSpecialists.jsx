import { useState, useEffect, useCallback } from 'react';

const STATUS_BORDER = { confirmed: '#22c55e', pending: '#eab308', pending_review: '#ea580c', canceled: '#ef4444' };
const STATUS_LABEL = { confirmed: 'Подтверждена', pending: 'Ожидает', pending_review: 'На проверке', canceled: 'Отменена' };
const STATUS_DOT = { confirmed: 'bg-green-400', pending: 'bg-yellow-400', pending_review: 'bg-orange-400', canceled: 'bg-red-400' };
const DOW_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function toDateStr(d) { return d.toISOString().slice(0, 10); }

function getWeekDays(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return Array.from({ length: 7 }, (_, i) => {
    const nd = new Date(d);
    nd.setDate(d.getDate() + i);
    return nd;
  });
}

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="text-right">
      <div className="text-5xl font-black tabular-nums tracking-tight">
        {now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-lg text-gray-400 mt-1">
        {now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>
    </div>
  );
}

function AppointmentChip({ a }) {
  return (
    <div
      className="rounded px-1.5 py-0.5 mb-0.5 last:mb-0"
      style={{
        background: `${a.service_color || '#14b8a6'}cc`,
        borderLeft: `3px solid ${STATUS_BORDER[a.status] || '#14b8a6'}`,
      }}
    >
      <div className="flex items-center gap-1">
        <span className="font-bold tabular-nums">{a.appointment_time?.slice(0, 5)}</span>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[a.status] || 'bg-teal-400'}`} />
        <span className="font-medium truncate">{a.service_name}</span>
      </div>
      {a.customer_name && <div className="truncate opacity-80">{a.customer_name}</div>}
      {a.vehicle_number && <div className="truncate opacity-80 font-mono">{a.vehicle_number}</div>}
    </div>
  );
}

export default function DisplayBoardSpecialists() {
  const [appointments, setAppointments] = useState([]);
  const [specialists, setSpecialists] = useState([]);
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
        setAppointments((data.appointments || []).filter(a => a.status !== 'canceled'));
        setSpecialists(data.specialists || []);
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
  const isWeek = interval === 'week';
  const weekDays = getWeekDays(new Date());

  const displayDays = isWeek ? weekDays : [new Date()];

  const unassigned = { id: '__none__', name: 'Без сотрудника', position: '' };
  const groups = specialists.length > 0 ? [...specialists, unassigned] : [unassigned];

  const hasAnyData = appointments.length > 0;

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

  const title = isWeek ? 'Записи по сотрудникам — неделя' : 'Записи по сотрудникам — сегодня';

  const colTemplate = `180px repeat(${displayDays.length}, 1fr)`;

  return (
    <div className="h-screen bg-gray-950 text-white select-none overflow-hidden flex flex-col">
      <header className="px-6 pt-4 pb-2 flex items-start justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{title}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {hasAnyData
              ? `${appointments.length} ${appointments.length === 1 ? 'запись' : appointments.length < 5 ? 'записи' : 'записей'}`
              : 'Нет записей'}
          </p>
        </div>
        <Clock />
      </header>

      <div className="px-6 pb-8 flex-1 min-h-0 flex flex-col">
        {!hasAnyData ? (
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="text-8xl mb-6 opacity-30">👥</div>
            <div className="text-3xl text-gray-600 font-bold">
              {isWeek ? 'Записей на эту неделю нет' : 'Записей на сегодня нет'}
            </div>
            <div className="text-gray-700 text-lg mt-2">Данные обновляются автоматически</div>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-700 overflow-hidden bg-gray-900/50 flex-1 min-h-0 flex flex-col">
            {/* Header row */}
            <div
              className="grid border-b border-gray-700 flex-shrink-0"
              style={{ gridTemplateColumns: colTemplate }}
            >
              <div className="px-3 py-2 text-sm font-semibold text-gray-400 border-r border-gray-700 bg-gray-900">
                Сотрудник
              </div>
              {displayDays.map((d, i) => {
                const ds = toDateStr(d);
                const isToday = ds === today;
                return (
                  <div
                    key={i}
                    className={`text-center py-2 text-sm font-semibold border-r border-gray-700 last:border-r-0 ${
                      isToday ? 'bg-teal-900/40 text-teal-300' : 'text-gray-400'
                    }`}
                  >
                    {isWeek && <div className="text-xs text-gray-500">{DOW_RU[i]}</div>}
                    <div>{isWeek ? d.getDate() : d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</div>
                  </div>
                );
              })}
            </div>

            {/* Specialist rows — equal height, fill remaining space */}
            <div className="flex-1 min-h-0 flex flex-col">
              {groups.map(sp => {
                const isNone = sp.id === '__none__';

                return (
                  <div
                    key={sp.id}
                    className="flex-1 min-h-0 border-b border-gray-800 last:border-b-0"
                  >
                    <div
                      className="grid h-full"
                      style={{ gridTemplateColumns: colTemplate }}
                    >
                      <div className={`px-3 py-2 border-r border-gray-700 bg-gray-900 flex items-center ${isNone ? 'opacity-50 italic' : ''}`}>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">{sp.name}</div>
                          {sp.position && <div className="text-xs text-gray-500 truncate">{sp.position}</div>}
                        </div>
                      </div>
                      {displayDays.map((d, i) => {
                        const ds = toDateStr(d);
                        const isToday = ds === today;
                        const dayApps = appointments.filter(a => {
                          const ad = (a.appointment_date || '').slice(0, 10);
                          if (ad !== ds) return false;
                          return isNone ? !a.specialist_id : a.specialist_id === sp.id;
                        }).sort((a, b) => (a.appointment_time || '').localeCompare(b.appointment_time || ''));

                        return (
                          <div
                            key={i}
                            className={`p-1 border-r border-gray-800 last:border-r-0 overflow-y-auto ${
                              isToday ? 'bg-teal-900/10' : ''
                            }`}
                            style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}
                          >
                            {dayApps.map((a, idx) => (
                              <AppointmentChip key={idx} a={a} />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 py-2 flex items-center justify-between text-gray-700 text-xs">
        <div>Данные обновляются каждые 30 секунд</div>
        {lastUpdate && (
          <div>Обновлено: {lastUpdate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
        )}
      </div>
    </div>
  );
}
