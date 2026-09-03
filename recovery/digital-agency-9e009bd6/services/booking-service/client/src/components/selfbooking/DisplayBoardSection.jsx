export default function DisplayBoardSection({ displayUrl, displayQr, basePath, clientId }) {
  return (
    <div className="bg-gray-950 rounded-xl p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-base mb-1">Табло записей</h3>
          <p className="text-gray-400 text-sm mb-3">
            Откройте на экране в зоне ожидания — показывает записи на сегодня в реальном времени.
          </p>
          <a href={`${basePath}/display${clientId ? `?client_id=${encodeURIComponent(clientId)}` : ''}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Открыть табло
          </a>
        </div>
        {displayQr && (
          <div className="flex gap-4 items-center flex-shrink-0">
            <div className="bg-white p-2 rounded-xl">
              <img src={displayQr.qrcode} alt="QR табло" className="w-28 h-28" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
