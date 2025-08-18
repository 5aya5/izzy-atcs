// Модуль для работы с алиасами плейсхолдеров
// makePayload: формирует объект значений с учётом алиасов и ключей с пробелами

const GLOBAL_ALIASES = {
  fullname: 'fullName',
  Address: 'address'
}

const TEMPLATE_ALIASES = {
  chargers: { bankcard: 'bankCard' },
  drivers: { bankcard: 'bankCard' },
  fines: { 'shiftsOf Them': 'shiftsOfThem' },
  deposit: { bankcard: 'bankCard' }
}

export function makePayload(form, selectedTemplateId) {
  // Вход: form (объект), selectedTemplateId (строка)
  // Выход: объект для docxtemplater
  const t = {}
  Object.keys(form).forEach(key => {
    t[key] = (form[key] || '').trim()
  })
  Object.entries(GLOBAL_ALIASES).forEach(([alias, canonical]) => {
    t[alias] = t[canonical]
  })
  const templateAliases = TEMPLATE_ALIASES[selectedTemplateId] || {}
  Object.entries(templateAliases).forEach(([alias, canonical]) => {
    t[alias] = t[canonical]
  })
  Object.keys(t).forEach(key => {
    if (key.includes(' ')) {
      const noSpace = key.replace(/\s+/g, '')
      if (t[noSpace]) t[key] = t[noSpace]
    }
  })
  return t
}

export { GLOBAL_ALIASES, TEMPLATE_ALIASES }
