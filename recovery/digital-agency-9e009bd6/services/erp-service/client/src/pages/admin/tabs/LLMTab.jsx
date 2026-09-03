import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, AlertCircle, CheckCircle, Zap, Sliders, Eye, EyeOff,
  Plus, Trash2, X, BrainCircuit,
} from 'lucide-react';
import api from '../../../services/api';
import Modal from '../../../components/ui/Modal';

const PROVIDER_TYPES = [
  { id: 'openai', label: 'OpenAI-совместимый', hint: 'OpenAI, OpenRouter, DeepSeek, YandexGPT, Сбер и др.' },
  { id: 'anthropic', label: 'Anthropic', hint: 'Claude модели (claude.ai API)' },
];

const DEFAULT_BASE_URLS = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com',
};

const POPULAR_PROVIDERS = [
  { name: 'OpenAI', type: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' },
  { name: 'OpenRouter', type: 'openai', baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o' },
  { name: 'YandexGPT', type: 'openai', baseUrl: 'https://llm.api.cloud.yandex.net/v1', model: 'yandexgpt/latest' },
  { name: 'DeepSeek', type: 'openai', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { name: 'Anthropic', type: 'anthropic', baseUrl: 'https://api.anthropic.com', model: 'claude-sonnet-4-6' },
];

function getProviderIcon(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('yandex') || n.includes('яндекс')) return { abbr: 'Я', color: 'bg-red-100 text-red-700' };
  if (n.includes('anthropic') || n.includes('claude')) return { abbr: 'Cl', color: 'bg-orange-100 text-orange-700' };
  if (n.includes('openai') || n.includes('gpt')) return { abbr: 'AI', color: 'bg-green-100 text-green-700' };
  if (n.includes('openrouter')) return { abbr: 'OR', color: 'bg-blue-100 text-blue-700' };
  if (n.includes('deepseek')) return { abbr: 'DS', color: 'bg-indigo-100 text-indigo-700' };
  if (n.includes('sber') || n.includes('сбер')) return { abbr: 'Сб', color: 'bg-emerald-100 text-emerald-700' };
  return { abbr: (name || 'LL').slice(0, 2).toUpperCase(), color: 'bg-gray-100 text-gray-700' };
}

export default function LLMTab() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | { edit: providerId }
  const [fields, setFields] = useState({});
  const [testStatus, setTestStatus] = useState({});
  const [keyVisible, setKeyVisible] = useState(false);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/llm-config');
      setConfig(data);
    } catch {
      setError('Не удалось загрузить конфигурацию моделей');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!config) loadConfig();
  }, [config, loadConfig]);

  async function handleSetActive(providerId) {
    setConfig(prev => ({ ...prev, activeProvider: providerId }));
    try {
      await api.put('/llm-config', { activeProvider: providerId });
      flashSaved();
    } catch {
      setError('Ошибка при сохранении');
    }
  }

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function openAddModal(preset) {
    setFields({
      name: preset?.name || '',
      providerType: preset?.type || 'openai',
      apiKey: '',
      baseUrl: preset?.baseUrl || '',
      model: preset?.model || '',
      temperature: 0.7,
      maxTokens: 4000,
    });
    setKeyVisible(false);
    setModal('add');
  }

  function openEditModal(providerId) {
    const p = config?.providers?.[providerId];
    if (!p) return;
    setFields({
      id: providerId,
      name: p.name,
      providerType: p.providerType,
      apiKey: '',
      baseUrl: p.baseUrl || '',
      model: p.model || '',
      temperature: p.temperature ?? 0.7,
      maxTokens: p.maxTokens ?? 4000,
    });
    setKeyVisible(false);
    setModal({ edit: providerId });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        id: fields.id || undefined,
        name: fields.name || 'LLM провайдер',
        providerType: fields.providerType,
        apiKey: fields.apiKey || undefined,
        baseUrl: fields.baseUrl || undefined,
        model: fields.model || undefined,
        temperature: parseFloat(fields.temperature) || 0.7,
        maxTokens: parseInt(fields.maxTokens) || 4000,
      };
      await api.put('/llm-config', { provider: payload });
      await loadConfig();
      setModal(null);
      flashSaved();
    } catch {
      setError('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(providerId) {
    if (!confirm('Удалить провайдер?')) return;
    try {
      await api.delete(`/llm-config/${providerId}`);
      await loadConfig();
    } catch {
      setError('Ошибка при удалении');
    }
  }

  async function handleTest(providerId) {
    setTestStatus(prev => ({ ...prev, [providerId]: 'loading' }));
    try {
      const { data } = await api.post(`/llm-config/test/${providerId}`);
      setTestStatus(prev => ({ ...prev, [providerId]: data.ok ? 'ok' : 'error', [`${providerId}_err`]: data.error }));
    } catch {
      setTestStatus(prev => ({ ...prev, [providerId]: 'error', [`${providerId}_err`]: 'Сетевая ошибка' }));
    }
    setTimeout(() => setTestStatus(prev => {
      const n = { ...prev };
      delete n[providerId]; delete n[`${providerId}_err`];
      return n;
    }), 5000);
  }

  const providers = config?.providers ? Object.entries(config.providers) : [];

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <RefreshCw size={15} className="animate-spin" />
          Загрузка конфигурации...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={15} />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle size={15} />
          Настройки сохранены
        </div>
      )}

      {/* Info block */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <BrainCircuit size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Подключение ИИ-моделей</p>
            <p className="text-blue-600 text-xs">
              Подключите любого LLM-провайдера: OpenAI, YandexGPT, DeepSeek, OpenRouter, Сбер, Anthropic и др.
              Все провайдеры, совместимые с OpenAI API, работают через тип &laquo;OpenAI-совместимый&raquo;.
            </p>
          </div>
        </div>
      </div>

      {/* Active provider selector */}
      {providers.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-blue-500" />
            <h3 className="font-semibold text-gray-900">Активный провайдер</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Выберите провайдера для ИИ-ассистента.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {providers.map(([id, p]) => {
              const isActive = config.activeProvider === Number(id) || config.activeProvider === id;
              const icon = getProviderIcon(p.name);
              return (
                <button
                  key={id}
                  onClick={() => handleSetActive(Number(id))}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    isActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${icon.color}`}>
                    {icon.abbr}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {p.apiKeySet ? (p.model || 'Не указана') : 'Не настроен'}
                    </p>
                  </div>
                  {isActive && <CheckCircle size={16} className="text-blue-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Provider cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map(([id, p]) => {
          const isActive = config.activeProvider === Number(id) || config.activeProvider === id;
          const icon = getProviderIcon(p.name);
          const test = testStatus[id];
          return (
            <div key={id} className={`card flex flex-col gap-4 ${isActive ? 'ring-2 ring-blue-200' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${icon.color}`}>
                  {icon.abbr}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{p.name}</h3>
                    {isActive && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        Активен
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{p.providerType === 'anthropic' ? 'Anthropic' : 'OpenAI-совместимый'}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Статус</span>
                  <span className={p.apiKeySet ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {p.apiKeySet ? 'Настроен' : 'Не настроен'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Модель</span>
                  <span className="text-gray-700 font-mono text-xs truncate max-w-[140px]" title={p.model}>
                    {p.model || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Температура</span>
                  <span className="text-gray-700">{p.temperature ?? 0.7}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Макс. токенов</span>
                  <span className="text-gray-700">{(p.maxTokens ?? 4000).toLocaleString()}</span>
                </div>
                {p.baseUrl && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">URL</span>
                    <span className="text-gray-400 font-mono text-xs truncate max-w-[140px]" title={p.baseUrl}>
                      {p.baseUrl.replace(/^https?:\/\//, '')}
                    </span>
                  </div>
                )}
                {p.apiKeyMasked && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">API Key</span>
                    <span className="text-gray-400 font-mono text-xs">{p.apiKeyMasked}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-gray-100 mt-auto">
                <button
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  onClick={() => openEditModal(Number(id))}
                >
                  <Sliders size={12} />
                  Настроить
                </button>
                <button
                  className={`btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 ${
                    test === 'loading' ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  disabled={test === 'loading'}
                  onClick={() => handleTest(Number(id))}
                >
                  <RefreshCw size={12} className={test === 'loading' ? 'animate-spin' : ''} />
                  {test === 'loading' ? 'Проверка...' : 'Тест'}
                </button>
                <button
                  className="btn-secondary text-xs py-1.5 px-2 text-gray-400 hover:text-red-500"
                  onClick={() => handleDelete(Number(id))}
                  title="Удалить"
                >
                  <Trash2 size={12} />
                </button>
                {test === 'ok' && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle size={12} /> OK
                  </span>
                )}
                {test === 'error' && (
                  <span className="text-xs text-red-500 truncate max-w-[80px]" title={testStatus[`${id}_err`]}>
                    Ошибка
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Add button */}
        <button
          onClick={() => openAddModal()}
          className="card border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center gap-3 py-8 transition-all cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
            <Plus size={20} className="text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Добавить провайдер</p>
            <p className="text-xs text-gray-400 mt-0.5">OpenAI, Yandex, DeepSeek, и др.</p>
          </div>
        </button>
      </div>

      {/* Quick add presets */}
      {providers.length === 0 && !loading && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Быстрый старт</h3>
          <p className="text-sm text-gray-500 mb-4">Выберите провайдера для быстрой настройки:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {POPULAR_PROVIDERS.map((pp) => {
              const icon = getProviderIcon(pp.name);
              return (
                <button
                  key={pp.name}
                  onClick={() => openAddModal(pp)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${icon.color}`}>
                    {icon.abbr}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{pp.name}</p>
                    <p className="text-xs text-gray-400">{pp.type === 'anthropic' ? 'Anthropic' : 'OpenAI-совместимый'}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Новый провайдер' : 'Настройка провайдера'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModal(null)}>Отмена</button>
            <button className="btn-primary flex items-center gap-2" onClick={handleSave} disabled={saving}>
              {saving && <RefreshCw size={14} className="animate-spin" />}
              Сохранить
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="form-label">Название <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="Например: Мой OpenAI"
              value={fields.name || ''}
              onChange={e => setFields(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          {/* Provider type */}
          <div>
            <label className="form-label">Тип API</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PROVIDER_TYPES.map(pt => (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => setFields(f => ({ ...f, providerType: pt.id, baseUrl: f.baseUrl || DEFAULT_BASE_URLS[pt.id] || '' }))}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    fields.providerType === pt.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className={`text-sm font-medium ${fields.providerType === pt.id ? 'text-blue-700' : 'text-gray-800'}`}>
                    {pt.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{pt.hint}</p>
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="form-label">API Key <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-2">
              <input
                type={keyVisible ? 'text' : 'password'}
                className="form-input font-mono text-sm flex-1"
                placeholder={modal?.edit ? 'Оставьте пустым, чтобы не менять' : 'sk-...'}
                value={fields.apiKey || ''}
                onChange={e => setFields(f => ({ ...f, apiKey: e.target.value }))}
              />
              <button
                type="button"
                className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500"
                onClick={() => setKeyVisible(v => !v)}
              >
                {keyVisible ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Base URL */}
          <div>
            <label className="form-label">Base URL</label>
            <input
              type="text"
              className="form-input font-mono text-sm"
              placeholder={DEFAULT_BASE_URLS[fields.providerType] || 'https://api.openai.com/v1'}
              value={fields.baseUrl || ''}
              onChange={e => setFields(f => ({ ...f, baseUrl: e.target.value }))}
            />
            <p className="text-xs text-gray-400 mt-1">
              {fields.providerType === 'anthropic'
                ? 'По умолчанию: https://api.anthropic.com'
                : 'По умолчанию: https://api.openai.com/v1. Для OpenRouter: https://openrouter.ai/api/v1'}
            </p>
          </div>

          {/* Model */}
          <div>
            <label className="form-label">Модель</label>
            <input
              type="text"
              className="form-input font-mono text-sm"
              placeholder={
                fields.providerType === 'anthropic'
                  ? 'claude-sonnet-4-6'
                  : 'gpt-4o'
              }
              value={fields.model || ''}
              onChange={e => setFields(f => ({ ...f, model: e.target.value }))}
            />
            <p className="text-xs text-gray-400 mt-1">
              {fields.providerType === 'anthropic'
                ? 'claude-opus-4-6, claude-sonnet-4-6, claude-haiku-4-5-20251001'
                : 'gpt-4o, deepseek-chat, yandexgpt/latest, openai/gpt-4o (OpenRouter) и др.'}
            </p>
          </div>

          {/* Temperature */}
          <div>
            <label className="form-label flex items-center justify-between">
              <span>Температура</span>
              <span className="font-mono text-blue-600">{Number(fields.temperature || 0.7).toFixed(1)}</span>
            </label>
            <input
              type="range" min="0" max="1" step="0.1"
              className="w-full accent-blue-500"
              value={fields.temperature || 0.7}
              onChange={e => setFields(f => ({ ...f, temperature: e.target.value }))}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Точный (0)</span>
              <span>Креативный (1)</span>
            </div>
          </div>

          {/* Max tokens */}
          <div>
            <label className="form-label">Макс. токенов ответа</label>
            <input
              type="number" className="form-input"
              min={100} max={32000} step={100}
              value={fields.maxTokens || 4000}
              onChange={e => setFields(f => ({ ...f, maxTokens: e.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
