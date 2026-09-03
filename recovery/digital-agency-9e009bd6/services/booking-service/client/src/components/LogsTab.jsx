import { useState, useEffect } from 'react';
import { apiFetch } from '../api.js';

const ACTION_LABEL = {
  'auth.login': 'Вход', 'service_created': 'Услуга добавлена', 'service_updated': 'Услуга обновлена',
  'service_deleted': 'Услуга удалена', 'appointment_created': 'Запись создана',
  'appointment_updated': 'Запись обновлена', 'appointment_deleted': 'Запись удалена',
  'user_created': 'Пользователь создан', 'user_updated': 'Пользователь обновлён',
  'user_deleted': 'Пользователь удалён',
};

export default function LogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await apiFetch('/api/booking/logs?limit=200');
      if (res?.ok) setLogs(await res.json());
      setLoading(false);
    })();
  }, []);

  return (
    <div className="p-6">
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" /></div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><div className="text-4xl mb-2">📜</div><p>Журнал пуст</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Дата</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Пользователь</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Действие</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Детали</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map(l => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString('ru-RU')}
                  </td>
                  <td className="px-4 py-3 font-medium">{l.username || '—'}</td>
                  <td className="px-4 py-3">{ACTION_LABEL[l.action] || l.action}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{l.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
