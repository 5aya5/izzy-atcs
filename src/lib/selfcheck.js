// Модуль для быстрой самопроверки работоспособности
// checkTemplatesAccessible, checkInspector, checkPayload, checkRender
import { BUILTIN_TEMPLATES, loadBuiltinBufferById, resolvePublicUrl } from './templates'
import { extractTemplateKeys } from './placeholders'
import { makePayload } from './aliases'
import { renderDocx } from './docx'

export async function checkTemplatesAccessible() {
  // Проверяет доступность всех шаблонов по id через безопасный загрузчик
  const templateResults = []
  for (const t of BUILTIN_TEMPLATES) {
    let ok = false, hrefs = [], error = null
    try {
      const buf = await loadBuiltinBufferById(t.id)
      ok = !!buf
    } catch (e) {
      error = String(e.message||e)
      // Извлекаем пробованные пути
      const match = error.match(/Пробованные пути:\n([\s\S]*)/)
      hrefs = match ? match[1].split('\n') : []
    }
    templateResults.push({ id: t.id, ok, hrefs, error })
  }
  return templateResults
}
// Мини-проверка реальных файлов-алиасов
export function checkAliasesExist() {
  return (async () => {
    const aliases = [
      'act_chargers.docx',
      'act_drivers.docx',
      'act_fines.docx',
      'act_deposit.docx',
    ]
    const aliasResults = []
    for(const name of aliases){
      const href = resolvePublicUrl('resources/' + encodeURI(name))
      try{
        const res = await fetch(href, { cache:'no-store' })
        aliasResults.push({ name, href, status: res.status, ok: res.ok })
      }catch(e){
        aliasResults.push({ name, href, error: String(e) })
      }
    }
    return aliasResults
  })()
}

export async function checkInspector(buffer) {
  // Проверяет, что extractTemplateKeys возвращает ключи
  try {
    const { keys } = await extractTemplateKeys(buffer)
    return { ok: keys.length > 0, keys }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export function checkPayload(form, templateId) {
  // Проверяет, что payload содержит ключевые поля и алиасы
  const payload = makePayload(form, templateId)
  const required = ['fullName', 'address', 'bankCard', 'bankcard', 'bankName']
  const present = required.filter(k => k in payload)
  return { ok: present.length > 2, present, payload }
}

export async function checkRender(buffer, payload) {
  // Проверяет, что renderDocx возвращает Blob
  try {
    const blob = await renderDocx(buffer, payload)
    return { ok: blob instanceof Blob && blob.size > 0, size: blob.size }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}
