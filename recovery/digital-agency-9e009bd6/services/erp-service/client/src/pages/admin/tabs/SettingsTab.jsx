import { useState, useEffect } from 'react';
import { Building2, Save, CheckCircle } from 'lucide-react';
import { settingsApi } from '../../../services/api';

export default function SettingsTab() {
  const [companyName, setCompanyName] = useState('');
  const [companyNameSaved, setCompanyNameSaved] = useState('');
  const [savingCompany, setSavingCompany] = useState(false);
  const [companySaved, setCompanySaved] = useState(false);

  useEffect(() => {
    settingsApi.get().then(({ data }) => {
      const name = data.company_name || '';
      setCompanyName(name);
      setCompanyNameSaved(name);
    }).catch(() => {});
  }, []);

  async function handleSaveCompany() {
    setSavingCompany(true);
    try {
      const { data } = await settingsApi.update({ company_name: companyName.trim() });
      const saved = data.company_name || '';
      setCompanyName(saved);
      setCompanyNameSaved(saved);
      setCompanySaved(true);
      setTimeout(() => setCompanySaved(false), 2500);
    } catch {
      // ignore
    } finally {
      setSavingCompany(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card">
        <div className="flex items-center gap-2 mb-1">
          <Building2 size={16} className="text-blue-500" />
          <h3 className="font-semibold text-gray-900">Наша компания</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Укажите официальное название вашей компании. Оно используется при импорте договоров — ИИ будет знать, что это ваша сторона, и правильно определит контрагента (покупателя).
        </p>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder='Например: ООО "АРТМЕБЕЛЬ"'
          />
          <button
            className="btn-primary flex items-center gap-1.5 shrink-0"
            onClick={handleSaveCompany}
            disabled={savingCompany || companyName.trim() === companyNameSaved}
          >
            {companySaved
              ? <><CheckCircle size={14} />Сохранено</>
              : <><Save size={14} />Сохранить</>
            }
          </button>
        </div>
        {companyNameSaved && (
          <p className="text-xs text-green-600 mt-2">
            Текущее значение: <span className="font-medium">{companyNameSaved}</span>
          </p>
        )}
      </div>
    </div>
  );
}
