import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { STATUS_LABEL_SHORT, STATUS_BORDER } from '../../constants/index.js';

export default function AppointmentBlock({ a, onClick }) {
  const [tooltip, setTooltip] = useState(false);
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, direction: 'below' });

  useEffect(() => {
    if (tooltip && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const tooltipW = 240;
      const tooltipH = 180;
      const gap = 6;

      let top = rect.bottom + gap;
      let left = rect.left;
      let direction = 'below';

      if (left + tooltipW > window.innerWidth - 8) left = window.innerWidth - tooltipW - 8;
      if (left < 8) left = 8;

      if (top + tooltipH > window.innerHeight - 8) {
        top = rect.top - tooltipH - gap;
        direction = 'above';
      }
      if (top < 8) top = 8;

      setPos({ top, left, direction });
    }
  }, [tooltip]);

  return (
    <div
      ref={ref}
      className="rounded cursor-pointer transition-all hover:brightness-110 hover:shadow-md p-1.5 mb-0.5 text-xs leading-tight overflow-hidden min-w-0"
      style={{ background: a.service_color || '#14b8a6', color: '#fff', borderLeft: `3px solid ${STATUS_BORDER[a.status] || '#14b8a6'}` }}
      onClick={() => onClick && onClick(a)}
      onDoubleClick={e => e.stopPropagation()}
      onMouseEnter={() => setTooltip(true)}
      onMouseLeave={() => setTooltip(false)}
    >
      <div className="font-semibold truncate">{a.appointment_time?.slice(0, 5)} {a.service_name}</div>
      {a.specialist_name && <div className="opacity-90 truncate">{a.specialist_name}</div>}
      {a.vehicle_number && <div className="opacity-90 truncate">{a.vehicle_number}</div>}
      <div className="flex items-center gap-1 opacity-75 text-[10px]">
        {STATUS_LABEL_SHORT[a.status]}
        {a.source === 'self-booking' && <span title="Самозапись" className="inline-block w-2 h-2 rounded-full bg-green-300 border border-white/50" />}
      </div>

      {tooltip && createPortal(
        <div
          className="fixed z-[70] bg-gray-900 text-white rounded-xl p-3.5 text-xs shadow-2xl border border-gray-700/50 pointer-events-none"
          style={{ top: pos.top, left: pos.left, minWidth: 220, maxWidth: 300 }}
        >
          <div className="font-bold text-sm mb-2 text-teal-300">{a.service_name}</div>
          <div className="space-y-1 text-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">🕐</span>
              <span className="font-medium">{a.appointment_time?.slice(0, 5)}{a.end_time ? ` — ${a.end_time.slice(0, 5)}` : ''}</span>
            </div>
            {a.specialist_name && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">🧑‍💼</span>
                <span>{a.specialist_name}</span>
              </div>
            )}
            {a.customer_name && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">👤</span>
                <span>{a.customer_name}</span>
              </div>
            )}
            {a.vehicle_number && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">🚗</span>
                <span className="font-mono">{a.vehicle_number}</span>
              </div>
            )}
            {a.phone && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📞</span>
                <span>{a.phone}</span>
              </div>
            )}
            {a.comment && (
              <div className="flex items-start gap-2 mt-1">
                <span className="text-gray-400">💬</span>
                <span className="text-gray-300 break-words">{a.comment}</span>
              </div>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-700 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              a.status === 'confirmed' ? 'bg-green-400' :
              a.status === 'pending' ? 'bg-yellow-400' :
              a.status === 'pending_review' ? 'bg-orange-400' : 'bg-red-400'
            }`} />
            <span className="font-medium">{STATUS_LABEL_SHORT[a.status]}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
