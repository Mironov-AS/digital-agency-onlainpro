import { DOW_RU } from '../../constants/index.js';
import { toDateStr, getWeekDays } from '../../utils/date.js';
import AppointmentBlock from './AppointmentBlock.jsx';

export default function SpecialistWeekView({ currentDate, appointments, specialists, onSelect, onSlotDoubleClick }) {
  const weekDays = getWeekDays(currentDate);
  const todayStr = toDateStr(new Date());

  const unassignedLabel = { id: '__none__', name: 'Без сотрудника' };
  const groups = specialists.length > 0
    ? [...specialists, unassignedLabel]
    : [unassignedLabel];

  return (
    <div className="p-4 space-y-0">
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <div className="grid border-b" style={{ gridTemplateColumns: `140px repeat(7, 1fr)` }}>
          <div className="px-3 py-2 text-sm font-medium text-gray-500 border-r bg-gray-50">Сотрудник</div>
          {weekDays.map((d, i) => (
            <div key={i} className={`text-center py-2 text-sm font-medium border-r last:border-r-0 ${toDateStr(d) === todayStr ? 'bg-teal-50 text-teal-700' : 'text-gray-600'}`}>
              <div className="text-xs text-gray-400">{DOW_RU[i]}</div>
              <div>{d.getDate()}</div>
            </div>
          ))}
        </div>

        {groups.map(sp => {
          const isNone = sp.id === '__none__';
          return (
            <div key={sp.id} className="grid border-b last:border-b-0" style={{ gridTemplateColumns: `140px repeat(7, 1fr)` }}>
              <div className={`px-3 py-2 border-r flex items-start gap-2 bg-gray-50 ${isNone ? 'text-gray-400 italic' : ''}`}>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{sp.name}</div>
                  {sp.position && <div className="text-xs text-gray-400 truncate">{sp.position}</div>}
                </div>
              </div>
              {weekDays.map((d, i) => {
                const dateStr = toDateStr(d);
                const dayApps = appointments.filter(a => {
                  const aDate = (a.appointment_date || '').slice(0, 10);
                  if (aDate !== dateStr) return false;
                  if (isNone) return !a.specialist_id;
                  return a.specialist_id === sp.id;
                }).sort((a, b) => (a.appointment_time || '').localeCompare(b.appointment_time || ''));

                return (
                  <div
                    key={i}
                    className={`p-1 border-r last:border-r-0 min-h-16 cursor-pointer overflow-hidden min-w-0 ${toDateStr(d) === todayStr ? 'bg-teal-50/30' : ''}`}
                    onDoubleClick={() => onSlotDoubleClick?.(dateStr)}
                  >
                    {dayApps.map(a => (
                      <AppointmentBlock key={a.id} a={a} onClick={onSelect} />
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}

        {groups.length === 1 && groups[0].id === '__none__' && appointments.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Нет записей за выбранный период
          </div>
        )}
      </div>
    </div>
  );
}
