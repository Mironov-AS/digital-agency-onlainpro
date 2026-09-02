import { Loader2, X, Link, AlertTriangle, UserCheck } from 'lucide-react'

function SelfRegBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600,
      background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a',
      whiteSpace: 'nowrap',
    }}>
      <UserCheck size={10} /> Самозапись
    </span>
  )
}

function MatchScoreBadge({ score }) {
  const bg = score >= 50 ? '#dcfce7' : score >= 30 ? '#fef3c7' : '#f3f4f6'
  const color = score >= 50 ? '#166534' : score >= 30 ? '#92400e' : '#6b7280'
  const border = score >= 50 ? '#bbf7d0' : score >= 30 ? '#fde68a' : '#e5e7eb'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
      background: bg, color, border: `1px solid ${border}`,
    }}>
      ★ {score}%
    </span>
  )
}

export { SelfRegBadge, MatchScoreBadge }

export default function CustomerMatchModals({
  matchModal, onCloseMatch, matchLoading, matchResults, linking, customFields,
  onLinkTo, onConfirmSelf, noMatchConfirm, onCloseNoMatch,
}) {
  return (
    <>
      {matchModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCloseMatch()}>
          <div className="modal-box" style={{ maxWidth: 800 }}>
            <div className="modal-header">
              <h2>Поиск совпадений для самозаписи</h2>
              <button className="modal-close" onClick={onCloseMatch}><X size={18} /></button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{
                background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10,
                padding: 16, marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#92400e' }}>Данные самозаписи</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
                  {[
                    ['ФИО', matchModal.full_name],
                    ['Телефон', matchModal.phone],
                    ['E-mail', matchModal.email],
                    ['Доп. контакты', matchModal.additional_contacts],
                    ['Примечания', matchModal.notes],
                  ].filter(([, v]) => v).map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, color: '#92400e', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: 13, color: '#78350f', marginTop: 1 }}>{val}</div>
                    </div>
                  ))}
                  {matchResults?.source?.custom_values && customFields.length > 0 && (
                    customFields.map(cf => {
                      const val = matchResults.source.custom_values[cf.id]
                      if (!val) return null
                      return (
                        <div key={cf.id}>
                          <div style={{ fontSize: 10, color: '#92400e', textTransform: 'uppercase', fontWeight: 600 }}>{cf.name}</div>
                          <div style={{ fontSize: 13, color: '#78350f', marginTop: 1 }}>{val}</div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {matchLoading ? (
                <div className="loading-center" style={{ padding: 40 }}>
                  <Loader2 size={24} className="spin" />
                  <div style={{ marginTop: 8, fontSize: 13, color: '#6b7280' }}>Поиск совпадений по всем полям...</div>
                </div>
              ) : matchResults?.error ? (
                <div style={{ color: '#ef4444', padding: 20, textAlign: 'center' }}>{matchResults.error}</div>
              ) : (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
                    Найдено совпадений: {matchResults?.matches?.length || 0}
                  </div>
                  <div style={{ display: 'grid', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
                    {matchResults?.matches?.map(m => (
                      <div key={m.id} style={{
                        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
                        padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                        gap: 12,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{m.full_name}</span>
                            <MatchScoreBadge score={m.score} />
                            {m.is_self_registered && <SelfRegBadge />}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                            {m.phone && <span>Тел: {m.phone}</span>}
                            {m.email && <span>Email: {m.email}</span>}
                            {m.additional_contacts && <span>Контакты: {m.additional_contacts}</span>}
                          </div>
                          {customFields.length > 0 && m.custom_values && Object.keys(m.custom_values).length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 11, color: '#6b7280', marginBottom: 6 }}>
                              {customFields.map(cf => {
                                const val = m.custom_values[cf.id]
                                if (!val) return null
                                return <span key={cf.id}>{cf.name}: {val}</span>
                              })}
                            </div>
                          )}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {m.reasons.map((r, i) => (
                              <span key={i} style={{
                                padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 500,
                                background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                              }}>
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          className="btn-primary-sm"
                          onClick={() => onLinkTo(matchModal.id, m.id)}
                          disabled={linking}
                          style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                        >
                          {linking ? <Loader2 size={13} className="spin" /> : <Link size={13} />}
                          Привязать
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 16, paddingTop: 12, textAlign: 'center' }}>
                    <button className="btn-cancel" onClick={() => onConfirmSelf(matchModal.id)} style={{ fontSize: 12 }}>
                      <UserCheck size={13} /> Подтвердить как нового клиента (совпадений нет)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {noMatchConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCloseNoMatch()}>
          <div className="modal-box" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>Совпадений не найдено</h2>
              <button className="modal-close" onClick={onCloseNoMatch}><X size={18} /></button>
            </div>
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: '#f0fdf4',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              }}>
                <UserCheck size={24} style={{ color: '#16a34a' }} />
              </div>
              <div style={{ fontSize: 15, color: '#111827', fontWeight: 600, marginBottom: 8 }}>
                Клиент «{noMatchConfirm.full_name || 'Без имени'}» — новый
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                Среди существующих клиентов совпадений не найдено. Подтвердите добавление как нового клиента.
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn-cancel" onClick={onCloseNoMatch}>Отмена</button>
                <button className="btn-primary-sm" onClick={() => {
                  onConfirmSelf(noMatchConfirm.id)
                  onCloseNoMatch()
                }}>
                  <UserCheck size={14} /> Подтвердить как нового
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
