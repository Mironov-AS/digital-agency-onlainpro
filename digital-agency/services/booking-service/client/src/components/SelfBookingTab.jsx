import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { apiFetch } from '../api';
import ConfirmationToggle from './selfbooking/ConfirmationToggle.jsx';
import QRCodeSection from './selfbooking/QRCodeSection.jsx';
import DisplayBoardSection from './selfbooking/DisplayBoardSection.jsx';
import WidgetEmbedSection from './selfbooking/WidgetEmbedSection.jsx';

const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

function bookingUrl(path) {
  return new URL(`${basePath}${path}`, window.location.origin).toString();
}

const HOW_IT_WORKS = [
  { icon: '1', title: 'Распечатайте QR-код', desc: 'Разместите его на стойке, двери или в рекламных материалах.' },
  { icon: '2', title: 'Клиент сканирует QR', desc: 'Откроется страница самозаписи с выбором услуги, даты и времени.' },
  { icon: '3', title: 'Клиент заполняет форму', desc: 'Имя, телефон и комментарий — всё что нужно для записи.' },
  { icon: '4', title: 'Запись появляется у вас', desc: 'В разделе «Записи» с зелёной меткой «Самозапись».' },
];

export default function SelfBookingTab() {
  const { user } = useAuth();
  const clientId = user.clientId || user.client_id || localStorage.getItem('bookingClientId') || '';

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [qrData, setQrData] = useState(null);
  const [displayQr, setDisplayQr] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [confirmationEnabled, setConfirmationEnabled] = useState(false);
  const [displayInterval, setDisplayInterval] = useState('day');
  const [workStart, setWorkStart] = useState('08:00');
  const [workEnd, setWorkEnd] = useState('21:00');
  const [workDays, setWorkDays] = useState([1, 2, 3, 4, 5, 6]);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const apiUrl = window.location.origin;
  const widgetUrl = `${apiUrl}/api/booking/widget.js`;
  const embedCode = `<script src="${widgetUrl}" data-client-id="${clientId}" data-api-url="${apiUrl}" defer><\/script>`;
  const displayUrl = bookingUrl(`/display${clientId ? `?client_id=${encodeURIComponent(clientId)}` : ''}`);

  useEffect(() => {
    apiFetch('/api/booking/catalog').then(r => r?.json()).then(data => {
      if (data) setServices(data.filter(s => s.status === 'active'));
    });
    apiFetch('/api/booking/settings').then(r => r?.json()).then(data => {
      if (data) {
        setConfirmationEnabled(data.self_booking_confirmation === 'true');
        setDisplayInterval(data.display_board_interval || 'day');
        if (data.working_hours_start) setWorkStart(data.working_hours_start);
        if (data.working_hours_end) setWorkEnd(data.working_hours_end);
        if (data.working_days) setWorkDays(data.working_days.split(',').map(Number));
      }
    });
    generateQR(null);
    fetch(`/api/booking/qrcode?url=${encodeURIComponent(displayUrl)}`)
      .then(r => r.json()).then(setDisplayQr).catch(() => {});
  }, []);

  const toggleConfirmation = async () => {
    setSettingsLoading(true);
    try {
      const newValue = !confirmationEnabled;
      const res = await apiFetch('/api/booking/settings', {
        method: 'PUT',
        body: JSON.stringify({ self_booking_confirmation: String(newValue) }),
      });
      if (res?.ok) setConfirmationEnabled(newValue);
    } catch {}
    finally { setSettingsLoading(false); }
  };

  const changeDisplayInterval = async (val) => {
    setSettingsLoading(true);
    try {
      const res = await apiFetch('/api/booking/settings', {
        method: 'PUT',
        body: JSON.stringify({ display_board_interval: val }),
      });
      if (res?.ok) setDisplayInterval(val);
    } catch {}
    finally { setSettingsLoading(false); }
  };

  const saveWorkingHours = async (start, end) => {
    setSettingsLoading(true);
    try {
      const res = await apiFetch('/api/booking/settings', {
        method: 'PUT',
        body: JSON.stringify({ working_hours_start: start, working_hours_end: end }),
      });
      if (res?.ok) { setWorkStart(start); setWorkEnd(end); }
    } catch {}
    finally { setSettingsLoading(false); }
  };

  const toggleWorkDay = async (day) => {
    const newDays = workDays.includes(day) ? workDays.filter(d => d !== day) : [...workDays, day].sort((a, b) => a - b);
    if (newDays.length === 0) return;
    setSettingsLoading(true);
    try {
      const res = await apiFetch('/api/booking/settings', {
        method: 'PUT',
        body: JSON.stringify({ working_days: newDays.join(',') }),
      });
      if (res?.ok) setWorkDays(newDays);
    } catch {}
    finally { setSettingsLoading(false); }
  };

  const generateQR = async (serviceId) => {
    setQrLoading(true);
    const selfBookUrl = new URL(bookingUrl('/self-book'));
    if (clientId) selfBookUrl.searchParams.set('client_id', clientId);
    if (serviceId) selfBookUrl.searchParams.set('service', serviceId);
    try {
      const res = await fetch(`/api/booking/qrcode?url=${encodeURIComponent(selfBookUrl.toString())}`);
      const data = await res.json();
      setQrData(data);
    } catch {}
    finally { setQrLoading(false); }
  };

  const printQR = () => {
    if (!qrData) return;
    const svcName = services.find(s => s.id === selectedService)?.name || '';
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>QR-код записи</title>
      <style>body{font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;text-align:center}
      img{max-width:300px}h1{font-size:1.5rem;margin-bottom:6px;color:#0d9488}p{color:#666;font-size:.9rem;margin:4px 0}</style>
      </head><body>
      <h1>Электронная запись</h1>
      ${svcName ? `<p><strong>${svcName}</strong></p>` : ''}
      <p>Отсканируйте QR-код для записи на приём</p>
      <img src="${qrData.qrcode}" />
      <p style="margin-top:12px;font-size:.7rem;color:#aaa">${qrData.url}</p>
      </body></html>`);
    win.document.close();
    win.print();
  };

  const handleServiceChange = (value) => {
    setSelectedService(value);
    generateQR(value || null);
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Самозапись клиентов</h2>
        <p className="text-gray-500">
          Разместите QR-код или виджет, чтобы клиенты могли самостоятельно записываться на услуги.
        </p>
      </div>

      <ConfirmationToggle enabled={confirmationEnabled} loading={settingsLoading} onToggle={toggleConfirmation} />

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Временной интервал табло</h3>
            <p className="text-sm text-gray-500 mt-1">Выберите, за какой период показывать записи на публичном табло</p>
          </div>
          <div className="flex items-center gap-1 border rounded-lg overflow-hidden">
            <button
              onClick={() => changeDisplayInterval('day')}
              disabled={settingsLoading}
              className={`px-4 py-2 text-sm font-medium transition ${displayInterval === 'day' ? 'bg-teal-600 text-white' : 'hover:bg-gray-50 text-gray-600'}`}
            >День</button>
            <button
              onClick={() => changeDisplayInterval('week')}
              disabled={settingsLoading}
              className={`px-4 py-2 text-sm font-medium transition ${displayInterval === 'week' ? 'bg-teal-600 text-white' : 'hover:bg-gray-50 text-gray-600'}`}
            >Неделя</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-1">Рабочее время</h3>
        <p className="text-sm text-gray-500 mb-4">Записи возможны только в рабочие дни и часы</p>
        <div className="flex items-center gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Начало</label>
            <input type="time" value={workStart} disabled={settingsLoading}
              onChange={e => saveWorkingHours(e.target.value, workEnd)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
          </div>
          <span className="text-gray-400 mt-5">—</span>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Конец</label>
            <input type="time" value={workEnd} disabled={settingsLoading}
              onChange={e => saveWorkingHours(workStart, e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-2">Рабочие дни</label>
          <div className="flex gap-1.5">
            {[{d:1,l:'Пн'},{d:2,l:'Вт'},{d:3,l:'Ср'},{d:4,l:'Чт'},{d:5,l:'Пт'},{d:6,l:'Сб'},{d:7,l:'Вс'}].map(({d,l}) => (
              <button key={d} onClick={() => toggleWorkDay(d)} disabled={settingsLoading}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                  workDays.includes(d)
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <QRCodeSection
        services={services} selectedService={selectedService}
        onServiceChange={handleServiceChange}
        qrData={qrData} qrLoading={qrLoading} onPrint={printQR}
      />

      <DisplayBoardSection displayUrl={displayUrl} displayQr={displayQr} basePath={basePath} clientId={clientId} />

      <WidgetEmbedSection embedCode={embedCode} />

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Как это работает</h3>
        <div className="space-y-4">
          {HOW_IT_WORKS.map(step => (
            <div key={step.icon} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {step.icon}
              </div>
              <div>
                <div className="font-medium text-gray-800">{step.title}</div>
                <div className="text-sm text-gray-500">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="font-medium text-teal-800 mb-1">Ваш идентификатор клиента</div>
            <code className="bg-teal-100 text-teal-800 px-2 py-1 rounded text-sm font-mono">{clientId || '—'}</code>
            <p className="text-sm text-teal-700 mt-2">Этот ID привязывает QR-код и виджет к вашему аккаунту.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
