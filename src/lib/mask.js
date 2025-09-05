// Простейшая цифровая маска по шаблону из 9-ок
// Примеры масок: '99', '9999', '99.99.9999', '9999 9999 9999 9999'

export function applyDigitMask(input, mask) {
  const digits = String(input || '').replace(/\D/g, '')
  let out = ''
  let i = 0
  for (const ch of mask) {
    if (ch === '9') {
      if (i < digits.length) {
        out += digits[i++]
      } else {
        break
      }
    } else {
      out += ch
    }
  }
  return out
}

