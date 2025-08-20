// ----------------- src/lib/templates.js (BEGIN) -----------------
function joinPath(a, b) {
  return (a.replace(/\/+$/,'') + '/' + b.replace(/^\/+/, ''));
}

export function resolvePublicUrl(rel) {
  // Строим путь с учётом BASE_URL (например, '/izzy-atcs/') и абсолютного origin
  const relClean = String(rel || '').replace(/^\/+/, '');
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/'); // гарантируем закрывающий '/'
  const origin = window.location.origin;
  return origin + base + relClean;
}

function normalizeCandidates(name) {
  const set = new Set([name]);
  try { set.add(name.normalize('NFC')); } catch {}
  try { set.add(name.normalize('NFD')); } catch {}
  return Array.from(set);
}

function isZipArrayBuffer(buf) {
  if (!(buf instanceof ArrayBuffer) || buf.byteLength < 4) return false;
  const u8 = new Uint8Array(buf, 0, 4);
  // 'PK\x03\x04'
  return u8[0] === 0x50 && u8[1] === 0x4B && u8[2] === 0x03 && u8[3] === 0x04;
}

// Регистрация: у каждого шаблона 2 имени — оригинал (кириллица) и ASCII-алиас
export const BUILTIN_TEMPLATES = [
  { id:'chargers', title:'Акт для чарджеров',  files:['Дефолтный акт для чарджеров.docx','act_chargers.docx'],  src:'builtin' },
  { id:'drivers',  title:'Акт для водителей',   files:['Дефолтный акт для водителей.docx','act_drivers.docx'],   src:'builtin' },
  { id:'fines',    title:'Акт с удержанием штрафа', files:['Акт с удержанием штрафа.docx','act_fines.docx'],      src:'builtin' },
  { id:'deposit',  title:'Акт с удержанием депозита', files:['Акт с удержанием депозита за использование корп инструмента.docx','act_deposit.docx'], src:'builtin' },
];

// Внутренний универсальный загрузчик по множеству имён
async function loadByCandidates(fileNames) {
  const tried = [];
  for (const baseName of fileNames) {
    for (const n of normalizeCandidates(baseName)) {
      const href = resolvePublicUrl('resources/' + encodeURIComponent(n));
      tried.push(href);
      try {
        const res = await fetch(href, { cache:'no-store' });
        if (!res.ok) continue;
        const buf = await res.arrayBuffer();
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        const mimeOk = ct.includes('application/vnd.openxmlformats-officedocument') || ct.includes('application/octet-stream');
        if (isZipArrayBuffer(buf) || mimeOk) return buf;
      } catch {}
    }
  }
  throw new Error('Не удалось найти DOCX.\n' + tried.map((u,i)=>`${i+1}) ${u}`).join('\n'));
}

// Обратная совместимость: старая сигнатура — одной строкой имя файла

// src/lib/templates.js
export async function loadBuiltinBuffer(fileName) {
  if (!fileName) {
    throw new Error('Не выбран шаблон: имя пустое (undefined).');
  }
  // fileName без расширения или с ним — см. ниже
  const name = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
  const url = resolvePublicUrl('resources/' + encodeURIComponent(name));

  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) {
    throw new Error(`Не удалось загрузить шаблон: ${url} (HTTP ${res.status})`);
  }
  return await res.arrayBuffer();
}


// Рекомендуемый API: по id шаблона (перебирает оригинал+алиас, NFC/NFD)
const RESOLVED_FILE_BY_ID = new Map(); // id -> href
export async function loadBuiltinBufferById(tplId) {
  const tpl = BUILTIN_TEMPLATES.find(t => t.id === tplId);
  if (!tpl) throw new Error(`Template ${tplId} not found`);

  // быстрый путь — если уже кэшировали удачный href
  const cached = RESOLVED_FILE_BY_ID.get(tplId);
  if (cached) {
    const r = await fetch(cached, { cache:'no-store' });
    if (r.ok) return await r.arrayBuffer();
    RESOLVED_FILE_BY_ID.delete(tplId);
  }

  const buf = await loadByCandidates(tpl.files);
  // найдём фактический href (последний успешный в loadByCandidates недоступен здесь;
  // закэшируем первый существующий для ускорения последующих выборов):
  for (const baseName of tpl.files) {
    for (const n of normalizeCandidates(baseName)) {
      const href = resolvePublicUrl('resources/' + encodeURIComponent(n));
      try {
        const r = await fetch(href, { cache:'no-store' });
        if (r.ok) {
          RESOLVED_FILE_BY_ID.set(tplId, href);
          throw new Error('__STOP__');
        }
      } catch (e) {
        if (String(e.message) === '__STOP__') break;
      }
    }
  }
  return buf;
}
// ----------------- src/lib/templates.js (END) -----------------
