export default function QRCodeSection({ services, selectedService, onServiceChange, qrData, qrLoading, onPrint }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        QR-код для самозаписи
      </h3>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1.5 block">Привязка к услуге (необязательно)</label>
          <select value={selectedService} onChange={e => onServiceChange(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Все услуги (клиент выбирает)</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {qrData && (
          <div className="flex flex-col items-center gap-4 pt-2">
            <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-inner">
              <img src={qrData.qrcode} alt="QR-код самозаписи" className="w-64 h-64" />
            </div>
            <p className="font-mono text-xs text-teal-600 break-all text-center max-w-xs">{qrData.url}</p>
            <div className="flex gap-3 w-full max-w-xs">
              <button onClick={onPrint}
                className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-xl transition text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Печать A4
              </button>
              <a href={`/api/booking/qrcode/download?url=${encodeURIComponent(qrData.url)}`}
                className="flex-1 flex items-center justify-center gap-2 border border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold py-2.5 rounded-xl transition text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Скачать PNG
              </a>
            </div>
          </div>
        )}
        {qrLoading && <div className="text-center py-8 text-gray-400">Генерация QR-кода...</div>}
      </div>
    </div>
  );
}
