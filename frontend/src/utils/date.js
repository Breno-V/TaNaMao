export function toLocalDate(dateStr) {
  if (!dateStr) return new Date(NaN)
  const datePart = dateStr.split('T')[0]
  const [y, m, d] = datePart.split('-').map(Number)
  return new Date(y, m - 1, d)
}
