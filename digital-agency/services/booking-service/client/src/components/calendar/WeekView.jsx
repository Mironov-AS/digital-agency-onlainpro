import { DOW_RU } from '../../constants/index.js';
import { toDateStr, getWeekDays } from '../../utils/date.js';
import AppointmentBlock from './AppointmentBlock.jsx';

export default function WeekView({ currentDate, appointments, onSelect, onSlotDoubleClick, workingHours }) {
  const weekDays = getWeekDays(currentDate);
  const todayStr = toDateStr(new Date());
  const wh = workingHours || {};
  const hours = Array.from({ length: (wh.end || 21) - (wh.start || 8) }, (_, i) => i + (wh.start || 8));

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <div className="grid border-b" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
          <div className="border-r" />
          {weekDays.map((d, i) => (
            <div key={i} className={`text-center py-2 text-sm font-medium border-r last:border-r-0 ${toDateStr(d) === todayStr ? 'bg-teal-50 text-teal-700' : 'text-gray-600'}`}>
              <div className="text-xs text-gray-400">{DOW_RU[i]}</div>
              <div>{d.getDate()}</div>
            </div>
          ))}
        </div>
        {hours.map(h => (
          <div key={h} className={`grid border-b min-h-12 ${h % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`} style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
            <div className="text-right pr-2 text-xs text-gray-400 pt-1 border-r">{String(h).padStart(2, '0')}:00</div>
            {weekDays.map((d, i) => {
              const dateStr = toDateStr(d);
              const hApps = appointments.filter(a => (a.appointment_date || '').slice(0, 10) === dateStr && parseInt(a.appointment_time?.slice(0, 2), 10) === h);
              return (
                <div key={i} className={`p-0.5 border-r last:border-r-0 cursor-pointer overflow-hidden min-w-0 ${toDateStr(d) === todayStr ? 'bg-teal-50/30' : ''}`} onDoubleClick={() => onSlotDoubleClick?.(dateStr, h)}>
                  {hApps.map(a => <AppointmentBlock key={a.id} a={a} onClick={onSelect} />)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
