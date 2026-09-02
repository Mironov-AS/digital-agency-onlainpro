import { useState, useEffect } from 'react';
import { apiFetch } from '../api.js';
import { STATUS_LABEL, STATUS_COLOR } from '../constants/index.js';
import { SpinnerCenter } from './ui/Spinner.jsx';
import StatusBadge from './ui/StatusBadge.jsx';
import { SelfBookingBadge } from './ui/StatusBadge.jsx';
import EmptyState from './ui/EmptyState.jsx';
import AppointmentModal from './AppointmentModal.jsx';

export default function AppointmentsTab() {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [filters, setFilters] = useState({ date_from: '', date_to: '', service_id: '', status: '' });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.date_from) params.set('date_from', filters.date_from);
      if (filters.date_to) params.set('date_to', filters.date_to);
      if (filters.service_id) params.set('service_id', filters.service_id);
      if (filters.status) params.set('status', filters.status);
      const [aRes, sRes, spRes] = await Promise.all([
        apiFetch('/api/booking/appointments?' + params),
        apiFetch('/api/booking/catalog'),
        apiFetch('/api/booking/specialists?status=active'),
      ]);
      if (aRes?.ok) setAppointments(await aRes.json());
      if (sRes?.ok) setServices(await sRes.json());
      if (spRes?.ok) setSpecialists(await spRes.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [JSON.stringify(filters)]);

  const deleteAppointment = async (a) => {
    if (!confirm(`Удалить запись от ${new Date(a.appointment_date).toLocaleDateString('ru-RU')}?`)) return;
    const res = await apiFetch(`/api/booking/appointments/${a.id}`, { method: 'DELETE' });
    if (res?.ok) load();
  };

  const confirmAppointment = async (a) => {
    const res = await apiFetch(`/api/booking/appointments/${a.id}/confirm`, { method: 'PUT' });
    if (res?.ok) load();
  };

  const rejectAppointment = async (a) => {
    if (!confirm(`Отклонить запись от ${new Date(a.appointment_date).toLocaleDateString('ru-RU')}?`)) return;
    const res = await apiFetch(`/api/booking/appointments/${a.id}/reject`, { method: 'PUT' });
    if (res?.ok) load();
  };

  const exportCSV = () => {
    const params = new URLSearchParams();
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);
    window.open('/api/booking/export/appointments?' + params, '_blank');
  };

  const setFilter = (key, value) => setFilters(f => ({ ...f, [key]: value }));

  return (
    <div className="p-6">
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-wrap gap-3">
          <input type="date" value={filters.date_from} onChange={e => setFilter('date_from', e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" title="Дата от" />
          <input type="date" value={filters.date_to} onChange={e => setFilter('date_to', e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" title="Дата до" />
          <select value={filters.service_id} onChange={e => setFilter('service_id', e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none">
            <option value="">Все услуги</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filters.status} onChange={e => setFilter('status', e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none">
            <option value="">Все статусы</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div className="flex gap-2 ml-auto">
            <button onClick={exportCSV}
              className="border border-teal-600 text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-lg font-medium transition">
              ⬇ Экспорт CSV
            </button>
            <button onClick={() => setModal({ mode: 'new' })}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition">
              + Новая запись
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <SpinnerCenter />
      ) : appointments.length === 0 ? (
        <EmptyState icon="📅" title="Нет записей" subtitle="Создайте первую запись клиента" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Дата / Время</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Услуга</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Сотрудник</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Контакты</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Статус</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {appointments.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="font-medium">{new Date(a.appointment_date).toLocaleDateString('ru-RU')}</div>
                    <div className="text-gray-500">{a.appointment_time?.slice(0, 5)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: a.service_color || '#14b8a6' }} />
                      <div>
                        <div className="font-medium">{a.service_name || '—'}</div>
                        {a.vehicle_number && <div className="text-xs text-gray-400">{a.vehicle_number}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="font-medium text-gray-800">{a.specialist_name || <span className="text-gray-400">—</span>}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div>{a.customer_name || '—'}</div>
                    {a.phone && <div className="text-xs text-gray-500">{a.phone}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={a.status} />
                      {a.source === 'self-booking' && <SelfBookingBadge />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      {a.status === 'pending_review' && (
                        <>
                          <button onClick={() => confirmAppointment(a)} title="Подтвердить"
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                          </button>
                          <button onClick={() => rejectAppointment(a)} title="Отклонить"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        </>
                      )}
                      <button onClick={() => setModal({ mode: 'edit', appointment: a })} title="Редактировать"
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition">✏️</button>
                      <button onClick={() => deleteAppointment(a)} title="Удалить"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <AppointmentModal
          appointment={modal.mode === 'edit' ? modal.appointment : null}
          services={services}
          specialists={specialists}
          onClose={() => setModal(null)}
          onSave={load}
        />
      )}
    </div>
  );
}
