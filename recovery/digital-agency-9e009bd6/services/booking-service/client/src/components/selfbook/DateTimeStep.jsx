import { todayStr } from '../../utils/date.js';

export default function DateTimeStep({ service, date, setDate, slots, slotsLoading, slot, setSlot, onBack, onNext }) {
  return (
    <div>
      <div className="bg-teal-50 rounded-xl p-3 mb-4 flex items-center justify-between">
        <div>
          <div className="font-semibold text-teal-800">{service.name}</div>
          <div className="text-xs text-teal-600">{service.duration} мин</div>
        </div>
        <button onClick={onBack} className="text-xs text-teal-600 hover:text-teal-800 underline">Изменить</button>
      </div>

      <label className="block text-sm font-medium text-gray-700 mb-1.5">Дата</label>
      <input type="date" value={date} min={todayStr()}
        onChange={e => { setDate(e.target.value); setSlot(''); }}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500" />

      <label className="block text-sm font-medium text-gray-700 mb-1.5">Свободное время</label>
      {slotsLoading ? (
        <div className="text-center py-6 text-gray-400">Загрузка слотов...</div>
      ) : slots.length === 0 ? (
        <div className="text-center py-6 text-gray-400">Нет свободного времени на эту дату</div>
      ) : (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {slots.map(s => (
            <button key={s} onClick={() => setSlot(s)}
              className={`py-2 text-sm font-medium rounded-lg border transition ${
                slot === s
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'border-gray-200 text-gray-700 hover:border-teal-400'
              }`}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <button onClick={onBack}
          className="flex-1 border border-gray-300 rounded-xl py-2.5 text-gray-600 hover:bg-gray-50 font-medium">Назад</button>
        <button onClick={onNext} disabled={!slot}
          className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl py-2.5 font-medium transition">Далее</button>
      </div>
    </div>
  );
}
