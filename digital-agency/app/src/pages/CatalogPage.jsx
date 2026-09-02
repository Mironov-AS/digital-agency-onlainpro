import { useState, useEffect } from 'react'
import { ArrowLeft, Loader2, Tag, DollarSign } from 'lucide-react'
import { apiFetch } from '../api.js'
import { API_CAT } from './catalog/shared.jsx'
import ServicesSection from './catalog/ServicesSection.jsx'
import CategoriesSection from './catalog/CategoriesSection.jsx'
import CostTypesSection from './catalog/CostTypesSection.jsx'

export default function CatalogPage({ onBack, user }) {
  const [categories, setCategories] = useState([])
  const [catsLoading, setCatsLoading] = useState(true)
  const [section, setSection] = useState('services')
  const isAdmin = user?.role === 'admin'

  async function loadCategories() {
    setCatsLoading(true)
    try { setCategories(await apiFetch(API_CAT)) }
    finally { setCatsLoading(false) }
  }
  useEffect(() => { loadCategories() }, [])

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-back" onClick={onBack}><ArrowLeft size={16} /> Назад</button>
        <div>
          <h1 className="page-title">Услуги</h1>
          <p className="page-sub">Справочник услуг агентства · Данные подтягиваются на лендинг автоматически</p>
        </div>
        <div className="section-tabs">
          <button className={`section-tab ${section === 'services' ? 'active' : ''}`} onClick={() => setSection('services')}>
            Услуги
          </button>
          <button className={`section-tab ${section === 'categories' ? 'active' : ''}`} onClick={() => setSection('categories')}>
            <Tag size={14} /> Виды услуг
          </button>
          <button className={`section-tab ${section === 'costs' ? 'active' : ''}`} onClick={() => setSection('costs')}>
            <DollarSign size={14} /> Виды затрат
          </button>
        </div>
      </div>

      {catsLoading
        ? <div className="loading-center"><Loader2 size={24} className="spin" /></div>
        : section === 'services'
          ? <ServicesSection categories={categories} isAdmin={isAdmin} />
          : section === 'categories'
            ? <CategoriesSection categories={categories} onReload={loadCategories} isAdmin={isAdmin} />
            : <CostTypesSection isAdmin={isAdmin} />
      }
    </div>
  )
}
