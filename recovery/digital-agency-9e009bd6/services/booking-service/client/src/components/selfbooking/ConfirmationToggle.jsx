export default function ConfirmationToggle({ enabled, loading, onToggle }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Подтверждение</h3>
            <p className="text-sm text-gray-500">
              {enabled
                ? 'Самозаписи требуют подтверждения администратора'
                : 'Самозаписи подтверждаются автоматически'}
            </p>
          </div>
        </div>
        <button
          onClick={onToggle}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
            enabled ? 'bg-teal-600' : 'bg-gray-200'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>
      {enabled && (
        <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2.5 text-sm text-orange-700">
          Когда клиент записывается через самозапись, запись получает статус <strong>«На проверке»</strong>. Вы можете подтвердить или отклонить её во вкладке <strong>«Записи»</strong>.
        </div>
      )}
    </div>
  );
}
