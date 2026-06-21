export function toLocalDate(dateStr) {
  if (!dateStr) return new Date(NaN)
  const datePart = dateStr.split('T')[0]
  const [y, m, d] = datePart.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toLocalDatetime(dateStr) {
  if (!dateStr) return new Date(NaN)
  const [datePart, timePart] = dateStr.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  if (!timePart) return new Date(y, m - 1, d)
  const [hh, mm] = timePart.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm)
}

export function hasTimeComponent(dateStr) {
  if (!dateStr) return false
  const timePart = dateStr.split('T')[1]
  if (!timePart) return false
  return !timePart.startsWith('00:00')
}

export function formatTime(dateStr) {
  if (!hasTimeComponent(dateStr)) return ''
  const timePart = dateStr.split('T')[1]
  return timePart.slice(0, 5)
}
