import { useState, useEffect } from 'react';
import { apiFetch } from '../api.js';

const COLORS = ['#14b8a6', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316'];

function ServiceModal({ service, onClose, onSave }) {
  const isNew = !service;
  const [form, setForm] = useState(service ? {
    name: service.name, description: service.description || '',
    duration: service.duration, price: service.price || 0,
    color: service.color || COLORS[0], status: service.status,
  } : { name: '', description: '', duration: 60, price: 0, color: COLORS[0], status: 'active' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Введите название услуги'); return; }
    setSaving(true); setError('');
    try {
      const url = isNew ? '/api/booking/catalog' : `/api/booking/catalog/${service.id}`;
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
          <h2 className="text-lg font-bold">{isNew ? 'Новая услуга' : 'Редактировать услугу'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={save} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название <span className="text-red-500">*</span></label>
            <input maxLength={100} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Название услуги" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea maxLength={500} rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Длительность (мин)</label>
              <input type="number" min={5} max={480} value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Стоимость (₽)</label>
              <input type="number" min={0} step={0.01} value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none">
                <option value="active">Активна</option>
                <option value="archive">Архив</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Цвет</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                    style={{ background: c }}
                    className={`w-7 h-7 rounded-full border-2 transition ${form.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`} />
                ))}
              </div>
            </div>
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

export default function CatalogTab() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (sort !== 'default') params.set('sort', sort);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await apiFetch('/api/booking/catalog?' + params);
      if (res?.ok) setServices(await res.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, sort, statusFilter]);

  const deleteService = async (s) => {
    if (!confirm(`Удалить услугу "${s.name}"?`)) return;
    const res = await apiFetch(`/api/booking/catalog/${s.id}`, { method: 'DELETE' });
    if (!res) return;
    if (!res.ok) { const d = await res.json(); alert(d.error || 'Ошибка'); return; }
    load();
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          placeholder="Поиск по названию..." />
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none">
          <option value="default">По умолчанию</option>
          <option value="name">По названию</option>
          <option value="duration">По длительности</option>
          <option value="price">По цене</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none">
          <option value="all">Все статусы</option>
          <option value="active">Активные</option>
          <option value="archive">Архив</option>
        </select>
        <button onClick={() => setModal({ mode: 'new' })}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition whitespace-nowrap">
          + Добавить услугу
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" /></div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-lg font-medium">Нет услуг</p>
          <p className="text-sm">Добавьте первую услугу в каталог</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Название</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Длительность</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Стоимость</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Статус</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {services.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color || '#14b8a6' }} />
                      <div>
                        <div className="font-medium text-gray-900">{s.name}</div>
                        {s.description && <div className="text-xs text-gray-500 truncate max-w-xs">{s.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{s.duration} мин</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{Number(s.price).toLocaleString('ru-RU')} ₽</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>{s.status === 'active' ? 'Активна' : 'Архив'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => setModal({ mode: 'edit', service: s })}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition" title="Редактировать">✏️</button>
                      <button onClick={() => deleteService(s)}
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
        <ServiceModal
          service={modal.mode === 'edit' ? modal.service : null}
          onClose={() => setModal(null)}
          onSave={load}
        />
      )}
    </div>
  );
}
