export function daysUntil(dateStr) {
  if (!dateStr) return null
  const now = new Date()
  const target = new Date(dateStr)
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

export function generatePaymentDates(startDate, endDate, interval) {
  const dates = []
  const end = new Date(endDate)
  let current = new Date(startDate)
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10))
    const next = new Date(current)
    if (interval === 'monthly') next.setMonth(next.getMonth() + 1)
    else if (interval === 'quarterly') next.setMonth(next.getMonth() + 3)
    else if (interval === 'yearly') next.setFullYear(next.getFullYear() + 1)
    else break
    current = next
  }
  return dates
}
