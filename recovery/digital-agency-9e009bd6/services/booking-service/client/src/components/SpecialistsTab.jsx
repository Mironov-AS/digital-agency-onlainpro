import { useState, useEffect } from 'react';
import { apiFetch } from '../api.js';

function SpecialistModal({ specialist, onClose, onSave }) {
  const isNew = !specialist;
  const [form, setForm] = useState(specialist ? {
    name: specialist.name, position: specialist.position || '', is_active: specialist.is_active,
  } : { name: '', position: '', is_active: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Введите имя сотрудника'); return; }
    setSaving(true); setError('');
    try {
      const url = isNew ? '/api/booking/specialists' : `/api/booking/specialists/${specialist.id}`;
      const res = await apiFetch(url, { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(form) });
      if (!res) return;
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Ошибка'); return; }
      onSave();
      onClose();
    } catch { setError('Ошибка соединения'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold">{isNew ? 'Новый сотрудник' : 'Редактировать сотрудника'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={save} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ФИО <span className="text-red-500">*</span></label>
            <input maxLength={200} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Иванов Иван Иванович" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Должность</label>
            <input maxLength={200} value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Мастер / Специалист / Врач" />
          </div>
          {!isNew && (
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
              <span className="text-sm text-gray-700">Активен</span>
            </div>
          )}
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

export default function SpecialistsTab() {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await apiFetch('/api/booking/specialists?' + params);
      if (res?.ok) setSpecialists(await res.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const deleteSpecialist = async (s) => {
    if (!confirm(`Удалить сотрудника "${s.name}"?`)) return;
    const res = await apiFetch(`/api/booking/specialists/${s.id}`, { method: 'DELETE' });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Ошибка'); return; }
    if (data.deactivated) { alert('Сотрудник деактивирован (есть привязанные записи)'); }
    load();
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none">
          <option value="all">Все сотрудники</option>
          <option value="active">Активные</option>
          <option value="inactive">Неактивные</option>
        </select>
        <button onClick={() => setModal({ mode: 'new' })}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ml-auto">
          + Добавить сотрудника
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" /></div>
      ) : specialists.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">👤</div>
          <p className="text-lg font-medium">Нет сотрудников</p>
          <p className="text-sm">Добавьте сотрудников, чтобы закреплять за ними записи</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">ФИО</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Должность</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Статус</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {specialists.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{s.name}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{s.position || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>{s.is_active ? 'Активен' : 'Неактивен'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => setModal({ mode: 'edit', specialist: s })}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition" title="Редактировать">✏️</button>
                      <button onClick={() => deleteSpecialist(s)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition" title="Удалить">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <SpecialistModal
          specialist={modal.mode === 'edit' ? modal.specialist : null}
          onClose={() => setModal(null)}
          onSave={load}
        />
      )}
    </div>
  );
}
