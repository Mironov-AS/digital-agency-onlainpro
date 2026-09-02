import { formatDateRu } from '../../utils/date.js';

export default function BookingResult({ result, onReset }) {
  const isPendingReview = result.status === 'pending_review';

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
        <div className={`w-16 h-16 ${isPendingReview ? 'bg-orange-100' : 'bg-teal-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {isPendingReview ? (
            <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {isPendingReview ? 'Заявка отправлена!' : 'Вы записаны!'}
        </h2>
        <div className={`${isPendingReview ? 'bg-orange-50' : 'bg-teal-50'} rounded-xl p-4 mb-4 text-left space-y-1.5 text-sm`}>
          <div><span className="text-gray-500">Услуга:</span> <span className="font-medium">{result.service_name}</span></div>
          <div><span className="text-gray-500">Дата:</span> <span className="font-medium">{formatDateRu(result.appointment_date)}</span></div>
          <div><span className="text-gray-500">Время:</span> <span className="font-medium">{result.appointment_time?.slice(0, 5)}</span></div>
          {result.customer_name && <div><span className="text-gray-500">Имя:</span> <span className="font-medium">{result.customer_name}</span></div>}
          {isPendingReview && (
            <div><span className="text-gray-500">Статус:</span> <span className="font-medium text-orange-600">На проверке</span></div>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {isPendingReview
            ? 'Ваша запись ожидает подтверждения администратором.'
            : 'Пожалуйста, приходите вовремя.'}
        </p>
        <button onClick={onReset}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition">
          Записаться ещё
        </button>
      </div>
    </div>
  );
}
