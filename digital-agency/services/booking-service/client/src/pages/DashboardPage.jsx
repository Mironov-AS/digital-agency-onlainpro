import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api.js';
import { toDateStr, getWeekDays } from '../utils/date.js';
import { SpinnerCenter } from '../components/ui/Spinner.jsx';
import DayView from '../components/calendar/DayView.jsx';
import WeekView from '../components/calendar/WeekView.jsx';
import MonthView from '../components/calendar/MonthView.jsx';
import SpecialistWeekView from '../components/calendar/SpecialistWeekView.jsx';
import AppointmentDetailModal from '../components/calendar/AppointmentDetailModal.jsx';
import AppointmentModal from '../components/AppointmentModal.jsx';

const MODE_LABELS = { day: 'День', week: 'Неделя', month: 'Месяц' };

export default function DashboardPage() {
  const [mode, setMode] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalAppointment, setModalAppointment] = useState(undefined);
  const [showModal, setShowModal] = useState(false);
  const [bySpecialist, setBySpecialist] = useState(false);
  const [workingHours, setWorkingHours] = useState({ start: 8, end: 21, days: [1,2,3,4,5,6] });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let date_from, date_to;
      if (mode === 'day') {
        date_from = date_to = toDateStr(currentDate);
      } else if (mode === 'week') {
        const days = getWeekDays(currentDate);
        date_from = toDateStr(days[0]);
        date_to = toDateStr(days[6]);
      } else {
        const y = currentDate.getFullYear(), m = currentDate.getMonth();
        date_from = toDateStr(new Date(y, m, 1));
        date_to = toDateStr(new Date(y, m + 1, 0));
      }
      const params = new URLSearchParams({ date_from, date_to });
      const res = await apiFetch('/api/booking/dashboard?' + params);
      if (res?.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
        setServices(data.services || []);
        setSpecialists(data.specialists || []);
      }
    } finally { setLoading(false); }
  }, [mode, currentDate]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    apiFetch('/api/booking/settings').then(r => r?.json()).then(data => {
      if (data) {
        const [sh, sm] = (data.working_hours_start || '08:00').split(':').map(Number);
        const [eh, em] = (data.working_hours_end || '21:00').split(':').map(Number);
        setWorkingHours({
          start: sh,
          end: eh,
          startMin: sm || 0,
          endMin: em || 0,
          days: (data.working_days || '1,2,3,4,5,6').split(',').map(Number),
        });
      }
    });
  }, []);

  const filtered = appointments.filter(a =>
    selectedServices.length === 0 || selectedServices.includes(a.service_id)
  );

  const byDate = {};
  filtered.forEach(a => {
    const k = (a.appointment_date || '').slice(0, 10);
    if (!byDate[k]) byDate[k] = [];
    byDate[k].push(a);
  });

  const nav = (dir) => {
    const d = new Date(currentDate);
    if (mode === 'day') d.setDate(d.getDate() + dir);
    else if (mode === 'week') d.setDate(d.getDate() + 7 * dir);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const navLabel = () => {
    const opts = { year: 'numeric', month: 'long' };
    if (mode === 'day') return currentDate.toLocaleDateString('ru-RU', { ...opts, day: 'numeric', weekday: 'long' });
    if (mode === 'week') {
      const days = getWeekDays(currentDate);
      return `${days[0].toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} — ${days[6].toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('ru-RU', opts);
  };

  const toggleService = (id) =>
    setSelectedServices(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);

  const handleSlotDoubleClick = (date, hour) => {
    setModalAppointment({
      appointment_date: date,
      appointment_time: hour !== undefined ? String(hour).padStart(2, '0') + ':00' : '09:00',
    });
    setShowModal(true);
  };

  const handleEdit = (appointment) => {
    setSelected(null);
    setModalAppointment(appointment);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalAppointment(undefined);
  };

  const handleModalSave = () => {
    handleModalClose();
    loadData();
  };

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center border rounded-lg overflow-hidden">
          {Object.entries(MODE_LABELS).map(([key, label]) => (
            <button key={key} onClick={() => setMode(key)}
              className={`px-3.5 py-1.5 text-sm font-medium transition-colors ${mode === key ? 'bg-teal-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => nav(-1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <span className="font-semibold text-gray-800 min-w-48 text-center text-sm">{navLabel()}</span>
          <button onClick={() => nav(1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
        <button onClick={() => setCurrentDate(new Date())}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors text-gray-600">
          Сегодня
        </button>
        {mode === 'week' && specialists.length > 0 && (
          <label className="flex items-center gap-2 cursor-pointer select-none ml-auto sm:ml-0">
            <input type="checkbox" checked={bySpecialist} onChange={e => setBySpecialist(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
            <span className="text-sm text-gray-700 whitespace-nowrap">По сотрудникам</span>
          </label>
        )}
        {services.length > 0 && (
          <div className="flex gap-1.5 flex-wrap ml-auto sm:ml-0">
            {services.map(s => (
              <button key={s.id} onClick={() => toggleService(s.id)}
                style={{ borderColor: s.color, color: selectedServices.includes(s.id) ? '#fff' : s.color, background: selectedServices.includes(s.id) ? s.color : 'transparent' }}
                className="text-xs px-2.5 py-1 rounded-full border font-medium transition-colors hover:opacity-80">
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <SpinnerCenter className="py-20" />
      ) : (
        <div className="overflow-auto">
          {mode === 'day' && <DayView currentDate={currentDate} appointments={filtered} onSelect={setSelected} onSlotDoubleClick={handleSlotDoubleClick} workingHours={workingHours} />}
          {mode === 'week' && !bySpecialist && <WeekView currentDate={currentDate} appointments={filtered} onSelect={setSelected} onSlotDoubleClick={handleSlotDoubleClick} workingHours={workingHours} />}
          {mode === 'week' && bySpecialist && <SpecialistWeekView currentDate={currentDate} appointments={filtered} specialists={specialists} onSelect={setSelected} onSlotDoubleClick={handleSlotDoubleClick} />}
          {mode === 'month' && <MonthView currentDate={currentDate} appointmentsByDate={byDate} onSelect={setSelected} onSlotDoubleClick={handleSlotDoubleClick} />}
        </div>
      )}

      <AppointmentDetailModal appointment={selected} onClose={() => setSelected(null)} onEdit={handleEdit} />

      {showModal && (
        <AppointmentModal
          appointment={modalAppointment?.id ? modalAppointment : null}
          services={services}
          specialists={specialists}
          onClose={handleModalClose}
          onSave={handleModalSave}
          defaultDate={modalAppointment?.appointment_date}
          defaultTime={modalAppointment?.appointment_time}
          workingHours={workingHours}
        />
      )}
    </div>
  );
}
