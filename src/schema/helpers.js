// Утилиты для работы со схемой формы
// getAllFields, getSectionByField, fieldMeta
import { FORM_SECTIONS } from './fields'

// Получить список всех name
export function getAllFields() {
  return FORM_SECTIONS.flatMap(s => s.fields.map(f => f.name))
}

// Найти секцию по имени поля
export function getSectionByField(name) {
  return FORM_SECTIONS.find(s => s.fields.some(f => f.name === name))
}

// Получить метаданные поля
export function fieldMeta(name) {
  for (const section of FORM_SECTIONS) {
    const field = section.fields.find(f => f.name === name)
    if (field) return field
  }
  return null
}
