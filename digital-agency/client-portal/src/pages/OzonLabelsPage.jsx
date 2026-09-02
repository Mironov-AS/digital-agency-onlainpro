import { useState, useRef, useEffect } from 'react';
import { FileText, Upload, Download, Loader2, AlertCircle, CheckCircle, X, Tag, History, ChevronLeft, Eye, XCircle } from 'lucide-react';
import API from '../services/api.js';

export default function OzonLabelsPage({ user, onBack }) {
  const [assemblyFile, setAssemblyFile] = useState(null);
  const [ticketsFile, setTicketsFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [previewJobId, setPreviewJobId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const assemblyRef = useRef(null);
  const ticketsRef = useRef(null);

  useEffect(() => { loadJobs(); }, []);

  async function loadJobs() {
    setJobsLoading(true);
    try {
      const res = await API.get('/label-merger/jobs');
      setJobs(res.data || []);
    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      setJobsLoading(false);
    }
  }

  function handleFileChange(e, setter) {
    const file = e.target.files?.[0];
    if (file && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Можно загружать только PDF-файлы');
      return;
    }
    setter(file || null);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!assemblyFile || !ticketsFile) {
      setError('Загрузите оба PDF-файла');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('assembly_pdf', assemblyFile);
    formData.append('tickets_pdf', ticketsFile);

    try {
      const res = await API.post('/label-merger/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      setAssemblyFile(null);
      setTicketsFile(null);
      if (assemblyRef.current) assemblyRef.current.value = '';
      if (ticketsRef.current) ticketsRef.current.value = '';
      loadJobs();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка обработки файлов');
    } finally {
      setLoading(false);
    }
  }

  function downloadUrl(jobId) {
    return `/api/label-merger/jobs/${jobId}/download`;
  }

  function previewUrl(jobId) {
    return `/api/label-merger/jobs/${jobId}/preview`;
  }

  return (
    <div className="ozon-labels-page">
      <header className="ozon-header">
        <button className="ozon-back" onClick={onBack}><ChevronLeft size={18} /> Назад к продуктам</button>
        <div className="ozon-header-title">
          <Tag size={22} />
          <h1>Ozon Labels</h1>
        </div>
        <span className="ozon-user">{user?.name}</span>
      </header>

      <main className="ozon-main">
        <section className="ozon-card">
          <h2>Создать этикетки</h2>
          <p className="ozon-sub">Загрузите лист подбора Ozon и PDF с этикетками. Сервис сопоставит заказы и создаст готовые этикетки 120×75 мм.</p>

          <form onSubmit={handleSubmit} className="ozon-form">
            <div className="ozon-upload-grid">
              <div className={`ozon-upload ${assemblyFile ? 'ozon-upload--filled' : ''}`} onClick={() => assemblyRef.current?.click()}>
                <input ref={assemblyRef} type="file" accept=".pdf,application/pdf" onChange={(e) => handleFileChange(e, setAssemblyFile)} />
                <FileText size={32} />
                <strong>Лист подбора</strong>
                <span>{assemblyFile ? assemblyFile.name : 'PDF со списком заказов'}</span>
              </div>

              <div className={`ozon-upload ${ticketsFile ? 'ozon-upload--filled' : ''}`} onClick={() => ticketsRef.current?.click()}>
                <input ref={ticketsRef} type="file" accept=".pdf,application/pdf" onChange={(e) => handleFileChange(e, setTicketsFile)} />
                <Upload size={32} />
                <strong>Этикетки Ozon</strong>
                <span>{ticketsFile ? ticketsFile.name : 'PDF с QR-кодами'}</span>
              </div>
            </div>

            {error && <div className="ozon-error"><AlertCircle size={16} /> {error}</div>}

            {result && (
              <div className="ozon-success">
                <CheckCircle size={18} />
                <div>
                  <div>Обработано: {result.matchedCount} из {result.itemCount} заказов</div>
                  <div className="ozon-result-actions">
                    <button type="button" className="ozon-preview-link" onClick={() => setPreviewJobId(result.id)}>
                      <Eye size={14} /> Предпросмотр
                    </button>
                    <a className="ozon-download-link" href={downloadUrl(result.id)} target="_blank" rel="noreferrer">
                      <Download size={14} /> Скачать готовые этикетки
                    </a>
                  </div>
                </div>
              </div>
            )}

            {previewJobId && (
              <div className="ozon-preview">
                <div className="ozon-preview-header">
                  <strong>Предпросмотр этикеток</strong>
                  <button type="button" className="ozon-preview-close" onClick={() => setPreviewJobId(null)}>
                    <XCircle size={18} />
                  </button>
                </div>
                <iframe
                  src={previewUrl(previewJobId)}
                  title="Предпросмотр этикеток"
                  className="ozon-preview-frame"
                />
              </div>
            )}

            <button type="submit" className="ozon-submit" disabled={loading || !assemblyFile || !ticketsFile}>
              {loading ? <><Loader2 size={16} className="spin" /> Обработка…</> : <><Tag size={16} /> Создать этикетки</>}
            </button>
          </form>
        </section>

        <section className="ozon-card">
          <h2><History size={18} /> История заданий</h2>
          {jobsLoading ? (
            <div className="ozon-loading"><Loader2 size={20} className="spin" /> Загрузка…</div>
          ) : jobs.length === 0 ? (
            <p className="ozon-empty">Пока нет обработанных заданий</p>
          ) : (
            <div className="ozon-jobs">
              {jobs.map(job => (
                <div key={job.id} className="ozon-job">
                  <div className="ozon-job-info">
                    <div className="ozon-job-name">{job.output_name || 'Этикетки Ozon'}</div>
                    <div className="ozon-job-meta">
                      {job.item_count > 0 && `${job.matched_count || 0} из ${job.item_count} заказов`}
                      {' · '}
                      {new Date(job.created_at).toLocaleString('ru-RU')}
                    </div>
                  </div>
                  <div className="ozon-job-actions">
                    <button type="button" className="ozon-job-preview" onClick={() => setPreviewJobId(job.id)} title="Предпросмотр">
                      <Eye size={16} />
                    </button>
                    <a className="ozon-job-download" href={downloadUrl(job.id)} target="_blank" rel="noreferrer" title="Скачать">
                      <Download size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
