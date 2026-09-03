import { ChevronRight } from 'lucide-react'

export default function ServiceCard({ svc, hasAccess, onNavigate }) {
  const Icon = svc.icon
  const card = (
    <div
      className={`svc-card ${!hasAccess ? 'svc-card--locked' : ''}`}
      style={{ '--svc-color': svc.color, '--svc-bg': svc.bg }}
    >
      <div className="svc-icon-wrap"><Icon size={28} /></div>
      <div className="svc-body">
        <h3 className="svc-title">{svc.title}</h3>
        <p className="svc-desc">{svc.desc}</p>
      </div>
      {hasAccess
        ? <ChevronRight size={20} className="svc-arrow" />
        : <span className="svc-locked-badge">Нет доступа</span>}
    </div>
  )

  if (!hasAccess) return card
  if (svc.url) return <a href={svc.url} target="_blank" rel="noreferrer">{card}</a>
  return (
    <div style={{ cursor: 'pointer' }} onClick={() => onNavigate(svc.page)}>
      {card}
    </div>
  )
}
