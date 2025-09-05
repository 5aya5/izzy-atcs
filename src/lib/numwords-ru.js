// Пропись чисел на русском для сум (UZS)
// Поддерживает целые числа до триллионов

const UNITS = [
  '', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять',
  'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'
]
const TENS = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто']
const HUNDS = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот']

// формы для разрядов: [1, 2-4, 5-0]
const THOUS = [['тысяча', 'тысячи', 'тысяч'], true]
const MILL  = [['миллион', 'миллиона', 'миллионов'], false]
const BILL  = [['миллиард', 'миллиарда', 'миллиардов'], false]
const TRIL  = [['триллион', 'триллиона', 'триллионов'], false]

function plural(n, forms){
  const n10 = n % 10, n100 = n % 100
  if (n10 === 1 && n100 !== 11) return forms[0]
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1]
  return forms[2]
}

function tripletToWords(num, female){
  let s = []
  const h = Math.floor(num / 100)
  const t = Math.floor((num % 100) / 10)
  const u = num % 10
  if (h) s.push(HUNDS[h])
  if (t > 1){
    s.push(TENS[t])
    if (u) s.push((female && u === 1) ? 'одна' : (female && u === 2) ? 'две' : UNITS[u])
  } else if (t === 1){
    s.push(UNITS[10 + u])
  } else if (u){
    s.push((female && u === 1) ? 'одна' : (female && u === 2) ? 'две' : UNITS[u])
  }
  return s.join(' ')
}

export function numberToWordsRu(n){
  if (n === 0) return 'ноль'
  let parts = []
  const groups = []
  while(n > 0){ groups.push(n % 1000); n = Math.floor(n / 1000) }
  const names = [null, THOUS, MILL, BILL, TRIL]
  for (let i = groups.length - 1; i >= 0; i--){
    const g = groups[i]
    if (!g) continue
    const name = names[i]
    const female = name ? name[1] : false
    parts.push(tripletToWords(g, female))
    if (name){
      parts.push(plural(g, name[0]))
    }
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

export function uzsToWords(n){
  const rubForms = ['сум', 'сумы', 'сумов']
  const int = Math.floor(Math.max(0, n))
  return `${numberToWordsRu(int)} ${plural(int, rubForms)}`
}

