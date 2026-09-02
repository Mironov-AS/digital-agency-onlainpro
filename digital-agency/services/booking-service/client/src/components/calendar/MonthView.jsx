import { DOW_RU } from '../../constants/index.js';
import { toDateStr, getMonthDays } from '../../utils/date.js';
import AppointmentBlock from './AppointmentBlock.jsx';

export default function MonthView({ currentDate, appointmentsByDate, onSelect, onSlotDoubleClick }) {
  const todayStr = toDateStr(new Date());
  const days = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <div className="grid grid-cols-7 border-b">
          {DOW_RU.map(d => (
            <div key={d} className="text-center py-2 text-xs font-medium text-gray-500 border-r last:border-r-0">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map(({ date, currentMonth }, i) => {
            const ds = toDateStr(date);
            const dApps = appointmentsByDate[ds] || [];
            const isToday = ds === todayStr;
            return (
              <div key={i} className={`min-h-24 border-b border-r last:border-r-0 p-1 cursor-pointer ${!currentMonth ? 'bg-gray-50' : ''} ${isToday ? 'ring-2 ring-inset ring-teal-400' : ''}`} onDoubleClick={() => onSlotDoubleClick?.(ds)}>
                <div className={`text-xs font-medium mb-1 ${!currentMonth ? 'text-gray-300' : isToday ? 'text-teal-600 font-bold' : 'text-gray-600'}`}>
                  {date.getDate()}
                </div>
                {dApps.slice(0, 3).map(a => <AppointmentBlock key={a.id} a={a} onClick={onSelect} />)}
                {dApps.length > 3 && <div className="text-xs text-gray-400">+{dApps.length - 3} ещё</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
