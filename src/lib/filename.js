// Модуль для генерации имени выходного файла
// makeFileName: формирует имя файла акта

export function makeFileName(d) {
  // Вход: d — объект формы
  // Выход: строка имени файла
  const name = d.shortName || d.fullName || 'Act'
  const day = d.day || d.docDay || 'XX'
  const month = d.month || d.docMonth || 'XX'
  const year = d.year || d.docYear || 'XXXX'
  let fileName = `Akt_${name}_${day}-${month}-${year}.docx`
  fileName = fileName.replace(/\s+/g, '_')
  fileName = fileName.replace(/[^A-Za-z0-9_.-]/g, '')
  return fileName
}
