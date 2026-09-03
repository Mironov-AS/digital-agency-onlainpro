const STATUS_LABELS = {
  planned: { label: 'Запланировано', color: '#3b82f6' },
  completed: { label: 'Завершено', color: '#10b981' },
  canceled: { label: 'Отменено', color: '#ef4444' },
}

export function getWeekActivityCardMeta(activity) {
  const status = STATUS_LABELS[activity?.status] || STATUS_LABELS.planned
  const plannedTime = typeof activity?.planned_time === 'string'
    ? activity.planned_time.slice(0, 5)
    : ''
  return {
    title: activity?.title || 'Без названия',
    statusLabel: status.label,
    plannedTime,
    durationLabel: activity?.duration ? `${activity.duration}м` : '',
    customerName: activity?.customer_name || '',
    serviceName: activity?.service_name || '',
  }
}
