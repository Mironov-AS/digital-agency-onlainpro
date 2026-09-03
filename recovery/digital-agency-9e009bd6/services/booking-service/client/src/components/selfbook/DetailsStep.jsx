import { formatDateRu } from '../../utils/date.js';

export default function DetailsStep({ service, date, slot, name, setName, phone, setPhone, comment, setComment, error, submitting, onBack, onSubmit }) {
  return (
    <div>
      <div className="bg-teal-50 rounded-xl p-3 mb-4">
        <div className="font-semibold text-teal-800">{service.name}</div>
        <div className="text-sm text-teal-600">{formatDateRu(date)} в {slot}</div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ваше имя <span className="text-red-500">*</span></label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Иван Иванов" autoComplete="off"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 999 123 45 67" autoComplete="off"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="Дополнительная информация"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
        </div>
      </div>

      {error && <div className="mt-3 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm">{error}</div>}

      <div className="flex gap-3 mt-5">
        <button onClick={onBack}
          className="flex-1 border border-gray-300 rounded-xl py-2.5 text-gray-600 hover:bg-gray-50 font-medium">Назад</button>
        <button onClick={onSubmit} disabled={submitting}
          className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl py-2.5 font-medium transition">
          {submitting ? 'Отправка...' : 'Записаться'}
        </button>
      </div>
    </div>
  );
}
