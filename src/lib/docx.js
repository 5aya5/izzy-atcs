// Модуль для рендеринга DOCX из шаблона
// renderDocx: генерирует DOCX с подстановкой данных

import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'

// Рендер DOCX
export async function renderDocx(templateArrayBuffer, payload) {
  // Вход: ArrayBuffer шаблона, payload (объект)
  // Выход: Promise<Blob>
  const zip = new PizZip(templateArrayBuffer)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{', end: '}' }
  })
  doc.setData(payload)
  try {
    doc.render()
  } catch (e) {
    // Ошибка рендеринга: собираем детали
    const error = {
      name: e.name,
      message: e.message,
      errors: e.properties?.errors || []
    }
    throw error
  }
  return doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  })
}
