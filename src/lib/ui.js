// Мелкие утилиты для UI
// trimString, getInputClass, formatStatus

export function trimString(str) {
  return (str || '').trim()
}

export function getInputClass(error) {
  return error ? 'input-error' : ''
}

export function formatStatus(status) {
  if (status === 'match') return 'Совпадает с формой'
  if (status === 'alias') return 'Алиас (global/template)'
  if (status === 'unknown') return 'Не найдено в форме'
  if (status === 'non-standard') return 'Ключ с пробелом'
  return ''
}
