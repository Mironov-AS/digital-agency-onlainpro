import {
  BarChart3, Users, BookOpen, FolderKanban,
  DollarSign, Package,
} from 'lucide-react'

export const SERVICES = [
  {
    id: 'analytics',
    title: 'Дашборд',
    desc: 'Управленческая статистика: клиенты, финансы, просрочки, ближайшие платежи',
    icon: BarChart3,
    color: '#0ea5e9',
    bg: '#f0f9ff',
    page: 'analytics',
    app: 'clients',
  },
  {
    id: 'clients',
    title: 'Клиенты',
    desc: 'Ведение информации по клиентам, услугам, платежам и балансу',
    icon: Users,
    color: '#3b82f6',
    bg: '#eff6ff',
    page: 'clients',
    app: 'clients',
  },
  {
    id: 'catalog',
    title: 'Услуги',
    desc: 'Справочник услуг агентства. Редактирование текста, цен, фото',
    icon: BookOpen,
    color: '#8b5cf6',
    bg: '#f5f3ff',
    page: 'catalog',
    app: 'catalog',
  },
  {
    id: 'product-shelf',
    title: 'Продуктовая полка',
    desc: 'Цифровые продукты: Электронная очередь и другие решения для клиентов',
    icon: Package,
    color: '#7c3aed',
    bg: '#f5f3ff',
    page: 'product-shelf',
    app: 'clients',
  },
  {
    id: 'projects',
    title: 'Реализованные проекты',
    desc: 'Учёт проектов, ссылки на продакшн, брошюры, инструкции',
    icon: FolderKanban,
    color: '#10b981',
    bg: '#ecfdf5',
    page: 'projects',
    app: 'projects',
  },
  {
    id: 'orgcosts',
    title: 'Общие затраты',
    desc: 'Затраты организации: хостинг, домены, зарплаты, налоги, аренда',
    icon: DollarSign,
    color: '#f97316',
    bg: '#fff7ed',
    page: 'orgcosts',
    app: 'clients',
  },
]

export function hasAccess(user, svc) {
  return user.role === 'admin' || user.apps?.includes(svc.app)
}

export function accessibleServices(user) {
  if (user.role === 'admin') return SERVICES
  return SERVICES.filter(s => user.apps?.includes(s.app))
}
