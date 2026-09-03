import { useState, useEffect, useCallback } from 'react';
import { todayStr } from '../utils/date.js';
import { SpinnerPage } from '../components/ui/Spinner.jsx';
import ServiceStep from '../components/selfbook/ServiceStep.jsx';
import DateTimeStep from '../components/selfbook/DateTimeStep.jsx';
import DetailsStep from '../components/selfbook/DetailsStep.jsx';
import BookingResult from '../components/selfbook/BookingResult.jsx';

const STEP_TITLES = ['Выберите услугу', 'Выберите дату и время', 'Ваши данные'];

export default function SelfBookPage() {
  const params = new URLSearchParams(window.location.search);
  const clientId = params.get('client_id') || '';
  const preselectedService = params.get('service') || '';

  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [service, setService] = useState(null);
  const [date, setDate] = useState(todayStr());
  const [slots, setSlots] = useState([]);
  const [slot, setSlot] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const apiBase = `/api/booking/public/${encodeURIComponent(clientId)}`;

  useEffect(() => {
    fetch(`${apiBase}/services`)
      .then(r => r.json())
      .then(data => {
        setServices(data || []);
        if (preselectedService) {
          const found = (data || []).find(s => s.id === preselectedService);
          if (found) { setService(found); setStep(1); }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadSlots = useCallback(async (d, svcId) => {
    setSlotsLoading(true);
    setSlot('');
    try {
      const res = await fetch(`${apiBase}/slots?date=${d}&service_id=${svcId}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch { setSlots([]); }
    finally { setSlotsLoading(false); }
  }, [apiBase]);

  useEffect(() => {
    if (step === 1 && service && date) loadSlots(date, service.id);
  }, [step, service, date, loadSlots]);

  const submit = async () => {
    if (!name.trim()) { setError('Введите ваше имя'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await fetch(`${apiBase}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: service.id,
          appointment_date: date,
          appointment_time: slot,
          customer_name: name.trim(),
          phone: phone.trim(),
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Ошибка записи'); return; }
      setResult(data);
    } catch { setError('Ошибка соединения'); }
    finally { setSubmitting(false); }
  };

  const reset = () => {
    setResult(null); setStep(0); setService(null);
    setSlot(''); setName(''); setPhone(''); setComment('');
  };

  const selectService = (s) => { setService(s); setStep(1); };
  const backToServices = () => { setStep(0); setService(null); setSlot(''); };

  if (loading) return <SpinnerPage />;
  if (result) return <BookingResult result={result} onReset={reset} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-teal-700 px-6 py-5 text-white">
          <h1 className="text-xl font-bold">Запись на приём</h1>
          <p className="text-teal-200 text-sm mt-1">{STEP_TITLES[step]}</p>
          <div className="flex gap-2 mt-3">
            {STEP_TITLES.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition ${i <= step ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 0 && <ServiceStep services={services} onSelect={selectService} />}
          {step === 1 && (
            <DateTimeStep
              service={service} date={date} setDate={setDate}
              slots={slots} slotsLoading={slotsLoading}
              slot={slot} setSlot={setSlot}
              onBack={backToServices} onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <DetailsStep
              service={service} date={date} slot={slot}
              name={name} setName={setName}
              phone={phone} setPhone={setPhone}
              comment={comment} setComment={setComment}
              error={error} submitting={submitting}
              onBack={() => setStep(1)} onSubmit={submit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
