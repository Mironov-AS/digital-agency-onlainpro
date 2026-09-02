import { toDateStr } from '../../utils/date.js';
import AppointmentBlock from './AppointmentBlock.jsx';

export default function DayView({ currentDate, appointments, onSelect, onSlotDoubleClick, workingHours }) {
  const dateStr = toDateStr(currentDate);
  const wh = workingHours || {};
  const hours = Array.from({ length: (wh.end || 21) - (wh.start || 8) }, (_, i) => i + (wh.start || 8));

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        {hours.map(h => {
          const hApps = appointments.filter(a => {
            const ah = parseInt(a.appointment_time?.slice(0, 2), 10);
            return (a.appointment_date || '').slice(0, 10) === dateStr && ah === h;
          });
          return (
            <div key={h} className={`flex border-b min-h-14 ${h % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <div className="w-16 text-right pr-3 text-xs text-gray-400 pt-2 flex-shrink-0">{String(h).padStart(2, '0')}:00</div>
              <div className="flex-1 p-1 border-l cursor-pointer overflow-hidden min-w-0" onDoubleClick={() => onSlotDoubleClick?.(dateStr, h)}>
                {hApps.map(a => <AppointmentBlock key={a.id} a={a} onClick={onSelect} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
