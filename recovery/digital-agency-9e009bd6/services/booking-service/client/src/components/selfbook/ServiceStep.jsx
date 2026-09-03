function formatDuration(minutes) {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h + ' ч' + (m ? ' ' + m + ' мин' : '');
  }
  return minutes + ' мин';
}

export default function ServiceStep({ services, onSelect }) {
  if (services.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-4xl mb-3">📋</div>
        <p>Нет доступных услуг</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {services.map(s => {
        const dur = formatDuration(s.duration);
        const price = s.price > 0 ? Number(s.price).toLocaleString('ru-RU') + ' ₽' : '';
        return (
          <button key={s.id} onClick={() => onSelect(s)}
            className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-teal-500 transition group">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ background: s.color || '#14b8a6' }} />
              <div className="flex-1">
                <div className="font-semibold text-gray-800 group-hover:text-teal-700">{s.name}</div>
                <div className="text-sm text-gray-500 mt-0.5">{dur}{price ? ` · ${price}` : ''}</div>
                {s.description && <div className="text-xs text-gray-400 mt-1">{s.description}</div>}
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-teal-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
}
