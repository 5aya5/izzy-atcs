// Модуль для валидации формы
// validateForm: возвращает map ошибок по каждому полю
import { FORM_SECTIONS } from '../schema/fields'

export function validateForm(form) {
  const errors = {}
  for (const section of FORM_SECTIONS) {
    for (const field of section.fields) {
      const value = form[field.name] || ''
      if (field.validate) {
        const valid = field.validate(value)
        if (valid !== true) errors[field.name] = valid
      } else if (field.required && !value) {
        errors[field.name] = 'Обязательное поле'
      }
    }
  }
  return errors
}
