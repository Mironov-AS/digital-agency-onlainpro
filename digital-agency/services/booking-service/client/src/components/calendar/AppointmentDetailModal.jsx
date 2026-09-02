import { STATUS_LABEL } from '../../constants/index.js';
import StatusBadge from '../ui/StatusBadge.jsx';
import { SelfBookingBadge } from '../ui/StatusBadge.jsx';

export default function AppointmentDetailModal({ appointment, onClose, onEdit }) {
  if (!appointment) return null;
  const a = appointment;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: a.service_color || '#14b8a6' }} />
            <h2 className="font-bold text-lg truncate">{a.service_name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-2 flex-shrink-0 transition-colors">&times;</button>
        </div>
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 w-5 text-center">📅</span>
            <span className="text-gray-500">Дата:</span>
            <span className="font-medium">{new Date(a.appointment_date).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 w-5 text-center">🕐</span>
            <span className="text-gray-500">Время:</span>
            <span className="font-medium">{a.appointment_time?.slice(0, 5)}{a.end_time ? ` — ${a.end_time.slice(0, 5)}` : ''}</span>
          </div>
          {a.vehicle_number && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 w-5 text-center">🚗</span>
              <span className="text-gray-500">Авто:</span>
              <span className="font-medium font-mono">{a.vehicle_number}</span>
            </div>
          )}
          {a.phone && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 w-5 text-center">📞</span>
              <span className="text-gray-500">Телефон:</span>
              <span className="font-medium">{a.phone}</span>
            </div>
          )}
          {a.customer_name && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 w-5 text-center">👤</span>
              <span className="text-gray-500">Клиент:</span>
              <span className="font-medium">{a.customer_name}</span>
            </div>
          )}
          {a.specialist_name && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 w-5 text-center">🧑‍💼</span>
              <span className="text-gray-500">Сотрудник:</span>
              <span className="font-medium">{a.specialist_name}</span>
            </div>
          )}
          {a.comment && (
            <div className="flex items-start gap-2">
              <span className="text-gray-400 w-5 text-center mt-0.5">💬</span>
              <div>
                <span className="text-gray-500">Комментарий:</span>
                <p className="font-medium mt-0.5 break-words">{a.comment}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 w-5 text-center">📌</span>
            <span className="text-gray-500">Статус:</span>
            <StatusBadge status={a.status} />
          </div>
          {a.source === 'self-booking' && (
            <div className="ml-7"><SelfBookingBadge /></div>
          )}
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-300 rounded-lg py-2 hover:bg-gray-50 text-gray-600 transition-colors">Закрыть</button>
          {onEdit && <button onClick={() => onEdit(a)} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2 font-medium transition-colors">Редактировать</button>}
        </div>
      </div>
    </div>
  );
}
