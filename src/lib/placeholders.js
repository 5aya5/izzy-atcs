// Модуль для работы с плейсхолдерами DOCX и алиасами
// extractTemplateKeys: извлекает ключи из шаблона
// buildPayload: формирует payload для подстановки

import PizZip from 'pizzip'

export const GLOBAL_ALIASES = {
  fullname: 'fullName',
  Address: 'address'
}

export const TEMPLATE_ALIASES = {
  chargers: { bankcard: 'bankCard' },
  drivers: { bankcard: 'bankCard' },
  fines: { 'shiftsOf Them': 'shiftsOfThem' },
  deposit: { bankcard: 'bankCard' }
}

// Регэксп для одиночных фигурных скобок
const PLACEHOLDER_REGEX = /\{\s*([\w.\- ]+)\s*\}/g

// Извлекает ключи из DOCX-шаблона
export async function extractTemplateKeys(arrayBuffer) {
  // Вход: arrayBuffer DOCX
  // Выход: { keys: string[], byFile: Record<string, string[]> }
  const zip = new PizZip(arrayBuffer)
  const files = Object.keys(zip.files).filter(f => f.startsWith('word/') && f.endsWith('.xml'))
  const byFile = {}
  const keysSet = new Set()
  for (const file of files) {
    const xml = zip.files[file].asText()
    const matches = [...xml.matchAll(PLACEHOLDER_REGEX)]
    byFile[file] = matches.map(m => m[1].trim())
    matches.forEach(m => keysSet.add(m[1].trim()))
  }
  return { keys: Array.from(keysSet), byFile }
}

// Формирует payload для подстановки в шаблон
export function buildPayload(form, selectedTemplateId) {
  // Вход: form (объект), selectedTemplateId (строка)
  // Выход: объект для docxtemplater
  const t = {}
  // 1. Копируем значения формы
  Object.keys(form).forEach(key => {
    t[key] = (form[key] || '').trim()
  })
  // 2. Применяем глобальные алиасы
  Object.entries(GLOBAL_ALIASES).forEach(([alias, canonical]) => {
    t[alias] = t[canonical]
  })
  // 3. Применяем алиасы шаблона
  const templateAliases = TEMPLATE_ALIASES[selectedTemplateId] || {}
  Object.entries(templateAliases).forEach(([alias, canonical]) => {
    t[alias] = t[canonical]
  })
  // 4. Ключи с пробелом
  Object.keys(t).forEach(key => {
    if (key.includes(' ')) {
      const noSpace = key.replace(/\s+/g, '')
      if (t[noSpace]) t[key] = t[noSpace]
    }
  })
  return t
}
