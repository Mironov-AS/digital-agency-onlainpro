import { useState } from 'react';
import { apiFetch } from '../api.js';
import { timeSlots } from '../utils/date.js';

export default function AppointmentModal({ appointment, services, specialists = [], onClose, onSave, defaultDate, defaultTime, workingHours }) {
  const wh = workingHours || { start: 8, end: 21 };
  const ALL_TIME_SLOTS = timeSlots(wh.start, wh.end);
  const isNew = !appointment;
  const [form, setForm] = useState(appointment ? {
    appointment_date: (appointment.appointment_date || '').slice(0, 10),
    appointment_time: appointment.appointment_time?.slice(0, 5),
    vehicle_number: appointment.vehicle_number || '',
    phone: appointment.phone || '',
    service_id: appointment.service_id,
    specialist_id: appointment.specialist_id || '',
    comment: appointment.comment || '',
    customer_name: appointment.customer_name || '',
    status: appointment.status || 'confirmed',
  } : {
    appointment_date: defaultDate || new Date().toISOString().slice(0, 10),
    appointment_time: defaultTime || '09:00',
    vehicle_number: '', phone: '', service_id: '', specialist_id: '', comment: '', customer_name: '', status: 'confirmed',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    if (!form.appointment_date || !form.appointment_time || !form.service_id) {
      setError('Заполните дату, время и услугу'); return;
    }
    setSaving(true); setError('');
    try {
      const payload = { ...form };
      if (!payload.specialist_id) payload.specialist_id = null;
      const url = isNew ? '/api/booking/appointments' : `/api/booking/appointments/${appointment.id}`;
      const res = await apiFetch(url, { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(payload) });
      if (!res) return;
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Ошибка'); return; }
      onSave(); onClose();
    } catch { setError('Ошибка соединения'); }
    finally { setSaving(false); }
  };

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[55] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-bold">{isNew ? 'Новая запись' : 'Редактировать запись'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={save} className="p-6 space-y-4" autoComplete="off">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата <span className="text-red-500">*</span></label>
              <input type="date" value={form.appointment_date} onChange={e => set('appointment_date', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Время <span className="text-red-500">*</span></label>
              <select value={form.appointment_time} onChange={e => set('appointment_time', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none">
                {ALL_TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Услуга <span className="text-red-500">*</span></label>
            <select value={form.service_id} onChange={e => set('service_id', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none">
              <option value="">— выберите услугу —</option>
              {services.filter(s => s.status === 'active').map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.duration} мин)</option>
              ))}
            </select>
          </div>
          {specialists.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Сотрудник</label>
              <select value={form.specialist_id} onChange={e => set('specialist_id', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none">
                <option value="">— не указан —</option>
                {specialists.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.name}{sp.position ? ` (${sp.position})` : ''}</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Номер авто</label>
              <input value={form.vehicle_number} onChange={e => set('vehicle_number', e.target.value.toUpperCase())}
                maxLength={12} placeholder="А001АА777"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="+7 XXX XXX XX XX"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имя клиента</label>
            <input value={form.customer_name} onChange={e => set('customer_name', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="ФИО или имя" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none">
              <option value="confirmed">Подтверждена</option>
              <option value="pending">Ожидает</option>
              <option value="pending_review">На проверке</option>
              <option value="canceled">Отменена</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
            <textarea maxLength={1000} rows={3} value={form.comment} onChange={e => set('comment', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none" />
          </div>
          {error && <div className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border rounded-lg py-2 text-gray-600 hover:bg-gray-50">Отмена</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg py-2 font-medium transition">
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
