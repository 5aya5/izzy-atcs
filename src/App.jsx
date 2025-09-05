// Главный компонент приложения "Генератор акта"
// Управляет состоянием формы, шаблонов, буфера шаблона и статусом
import React, { useState, useEffect } from 'react'
import TemplateGallery from './components/TemplateGallery'
import Inspector from './components/Inspector'
import StatusBar from './components/StatusBar'
import Form from './components/Form'
import { BUILTIN_TEMPLATES, loadBuiltinBufferById } from './lib/templates'
import { extractTemplateKeys } from './lib/placeholders'
import { makePayload, GLOBAL_ALIASES, TEMPLATE_ALIASES } from './lib/aliases'
import { renderDocx } from './lib/docx'
import { loadForm, saveForm, clearForm } from './lib/storage'
import { makeFileName } from './lib/filename'
import { getAllFields } from './schema/helpers'
import { FORM_SECTIONS } from './schema/fields'
import { saveAs } from 'file-saver'
import { uzsToWords } from './lib/numwords-ru'
import { validateForm } from './lib/validate'

function App() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [buffer, setBuffer] = useState(null);
  const [bufferError, setBufferError] = useState(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [templates, setTemplates] = useState(BUILTIN_TEMPLATES);
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState({ error: null, message: '' });
  const [inspectorKeys, setInspectorKeys] = useState([]);
  const [errors, setErrors] = useState({});
  const [autoWordsCache, setAutoWordsCache] = useState({});

  // Загрузка буфера встроенного шаблона при монтировании
  useEffect(() => {
    const loadBuffer = async () => {
      setIsLoadingTemplate(true);
      try {
        const firstId = BUILTIN_TEMPLATES[0]?.id;
        if (firstId) {
          const buf = await loadBuiltinBufferById(firstId);
          setSelectedTemplateId(firstId);
          setBuffer(buf);
          setStatus({ error: null, message: 'Шаблон загружен' });
        }
      } catch (e) {
        setStatus({ error: { name: 'Buffer', message: 'Ошибка загрузки шаблона' } });
      } finally {
        setIsLoadingTemplate(false);
      }
    };
    loadBuffer();
  }, []);

  // Загрузка/сохранение формы
  useEffect(() => {
    const stored = loadForm();
    if (stored && typeof stored === 'object') setFormData(stored);
  }, []);
  useEffect(() => {
    saveForm(formData);
    setErrors(validateForm(formData));
  }, [formData]);

  // Подсчёт прогресса заполнения обязательных полей
  const getProgressText = () => {
    const req = []
    FORM_SECTIONS.forEach(s => s.fields.forEach(f => { if (f.required) req.push(f.name) }))
    const filled = req.filter(n => (formData[n] || '').trim().length > 0)
    return `Заполнено ${filled.length}/${req.length}`
  }

  // Обработчик изменений формы с автозаполнением сумм прописью
  const handleFormChange = (next) => {
    const sumFields = [
      ['amount', 'amountWords'],
      ['paymentAmount', 'paymentAmountWords'],
      ['toolCost', 'toolCostWords'],
      ['paymentByCustomer', 'paymentByCustomerWords'],
    ]
    const updated = { ...next }
    const newCache = { ...autoWordsCache }
    for (const [numKey, wordsKey] of sumFields) {
      const raw = (updated[numKey] || '').replace(/\D+/g, '')
      if (!raw) continue
      const n = parseInt(raw, 10)
      if (!Number.isFinite(n)) continue
      const autoText = uzsToWords(n)
      const currentWords = (updated[wordsKey] || '').trim()
      if (!currentWords || currentWords === autoWordsCache[wordsKey]) {
        updated[wordsKey] = autoText
        newCache[wordsKey] = autoText
      }
    }
    setAutoWordsCache(newCache)
    setFormData(updated)
  }

  // Выбор шаблона
  const selectTemplate = async id => {
    setSelectedTemplateId(id);
    setStatus({ error: null, message: 'Шаблон выбран' });
    // Загрузка буфера выбранного шаблона
    const template = templates.find(t => t.id === id);
    if (template && template.src === 'builtin') {
      setIsLoadingTemplate(true);
      try {
        const buffer = await loadBuiltinBufferById(id);
        setBuffer(buffer);
        setStatus({ error: null, message: 'Шаблон загружен' });
      } catch (e) {
        setStatus({ error: { name: 'Buffer', message: 'Ошибка загрузки шаблона' } });
      } finally {
        setIsLoadingTemplate(false);
      }
    } else if (template && template.src === 'uploaded' && template.file) {
      setIsLoadingTemplate(true);
      try {
        const buf = await template.file.arrayBuffer();
        setBuffer(buf);
        setStatus({ error: null, message: 'Шаблон загружен' });
      } catch (e) {
        setStatus({ error: { name: 'Buffer', message: 'Ошибка загрузки файла шаблона' } });
      } finally {
        setIsLoadingTemplate(false);
      }
    }
  };

  // Замена шаблона
  const handleReplace = async (id, file) => {
    const template = templates.find(t => t.id === id);
    if (!template || !file) return;
    setIsLoadingTemplate(true);
    try {
      const buf = await file.arrayBuffer();
      setBuffer(buf);
      // Обновляем список шаблонов, помечая как загруженный файл
      setTemplates(prev => prev.map(t => t.id === id ? { ...t, file, src: 'uploaded', title: file.name } : t));
      setSelectedTemplateId(id);
      setStatus({ error: null, message: 'Шаблон заменён' });
    } catch (e) {
      setStatus({ error: { name: 'Buffer', message: 'Ошибка загрузки шаблона' } });
    } finally {
      setIsLoadingTemplate(false);
    }
  }
  // Добавление нового шаблона
  const handleAdd = async file => {
    const id = 'custom_' + Date.now()
    setTemplates(prev => [...prev, { id, title: file.name, file, src: 'uploaded' }])
    setSelectedTemplateId(id)
    try {
      const buf = await file.arrayBuffer()
      setBuffer(buf)
      setStatus({ error: null, message: 'Шаблон добавлен и загружен' })
    } catch (e) {
      setStatus({ error: { name: 'Buffer', message: 'Ошибка чтения файла шаблона' } })
    }
  }

  // Применить пресет значений по выбранному шаблону
  const handleApplyPreset = () => {
    const preset = {
      chargers: { typeServices: 'Чарджинг' },
      drivers: { typeServices: 'Доставка' },
      fines: { typeServices: 'Услуги со штрафом' },
      deposit: { typeServices: 'Услуги с удержанием депозита' },
    }[selectedTemplateId] || {}
    if (Object.keys(preset).length) {
      handleFormChange({ ...formData, ...preset })
      setStatus({ error: null, message: 'Пресет применён' })
    } else {
      setStatus({ error: null, message: 'Для текущего шаблона пресета нет' })
    }
  }

  // Использовать последние сохранённые значения
  const handleFillLast = () => {
    const last = loadForm()
    if (last && typeof last === 'object') {
      handleFormChange(last)
      setStatus({ error: null, message: 'Данные загружены из черновика' })
    }
  }

  // Разбор одной строки (паспорт, дата, карта, ПИНФЛ)
  const handleQuickParse = (line) => {
    const next = { ...formData }
    const s = String(line || '')
    const passport = s.match(/[A-ZА-Я]{2}\s?\d{7}/i)
    if (passport) next.passport = passport[0].replace(/\s+/g, '')
    const date = s.match(/\b(\d{2})[.\/-](\d{2})[.\/-](\d{4})\b/)
    if (date) { next.issDay = date[1]; next.issMonth = date[2]; next.issYear = date[3] }
    const card = s.match(/\b(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})\b/)
    if (card) next.bankCard = `${card[1]} ${card[2]} ${card[3]} ${card[4]}`
    const pinfl = s.match(/\b\d{14}\b/)
    if (pinfl) next.pinfl = pinfl[0]
    handleFormChange(next)
    setStatus({ error: null, message: 'Строка разобрана и применена' })
  }

  // Горячие клавиши
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey
      if (!mod) return
      const k = e.key.toLowerCase()
      if (k === 's') { e.preventDefault(); handleExport(); }
      if (k === 'g') { e.preventDefault(); handleSubmit(); }
      if (k === 'i') { e.preventDefault(); handleInspect(); }
      if (k === 'l') { e.preventDefault(); handleFillLast(); }
      if (k === 'k') { e.preventDefault(); handleSelfCheck(); }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [formData, buffer, selectedTemplateId])
  // Проверка плейсхолдеров
  const handleInspect = async () => {
    if (!buffer) return setStatus({ error: { name: 'Buffer', message: 'Шаблон не загружен' } })
    try {
      const { keys } = await extractTemplateKeys(buffer)
      setInspectorKeys(keys)
      setStatus({ error: null, message: 'Плейсхолдеры извлечены' })
    } catch (e) {
      setStatus({ error: { name: 'Inspector', message: 'Ошибка разбора шаблона', errors: e.errors } })
    }
  }
  // Генерация DOCX
  const handleSubmit = async () => {
    if (!buffer) return setStatus({ error: { name: 'Buffer', message: 'Нет активного шаблона' } })
    try {
      const payload = makePayload(formData, selectedTemplateId)
      const blob = await renderDocx(buffer, payload)
      saveAs(blob, makeFileName(formData))
      setStatus({ error: null, message: 'Документ успешно создан' })
    } catch (e) {
      setStatus({ error: { name: e.name, message: e.message, errors: e.errors } })
    }
  }
  // Сброс формы
  const handleClear = () => {
    clearForm()
    setAutoWordsCache({})
    setFormData({})
    setStatus({ error: null, message: 'Форма сброшена' })
  }
  // Экспорт JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(formData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    saveAs(blob, 'act-form.json')
    setStatus({ error: null, message: 'Форма экспортирована' })
  }
  // Импорт JSON
  const handleImport = data => {
    handleFormChange(data)
    setStatus({ error: null, message: 'Форма импортирована' })
  }


  // Быстрая самопроверка
  const handleSelfCheck = async () => {
    setStatus({ error: null, message: 'Выполняется самопроверка...' })
    try {
      const { checkTemplatesAccessible, checkInspector, checkPayload, checkRender, checkAliasesExist } = await import('./lib/selfcheck')
      // 0. Мини-проверка алиасов
      const aliasResult = await checkAliasesExist()
      // 1. Проверка доступности шаблонов через безопасный загрузчик
      const templatesResult = await checkTemplatesAccessible()
      // 2. Загружаем активный шаблон через новый загрузчик
      const t = templates.find(t => t.id === selectedTemplateId) || templates[0]
      let buf, triedPaths = []
      if (t.src === 'uploaded' && t.file) {
        buf = await t.file.arrayBuffer()
      } else {
        try {
          const { loadBuiltinBufferById } = await import('./lib/templates')
          buf = await loadBuiltinBufferById(t.id)
        } catch (e) {
          // Извлекаем пробованные пути из текста ошибки
          const match = String(e.message).match(/Пробованные пути:\n([\s\S]*)/)
          triedPaths = match ? match[1].split('\n') : []
          throw new Error('Ошибка загрузки шаблона.\n' + e.message)
        }
      }
      // 3. Инспектор
      const inspectorResult = await checkInspector(buf)
      // 4. Мок-форма для payload
      const mockForm = {
        fullName: 'Тестовый Пользователь',
        address: 'г. Тест, ул. Пример, д.1',
        bankCard: '1234567890123456',
        bankName: 'ТестБанк',
        docNum: '123', docDay: '01', docMonth: '01', docYear: '2025',
        day: '01', month: '01', year: '2025'
      }
      const payloadResult = checkPayload(mockForm, t.id)
      // 5. Пробный рендер
      const renderResult = await checkRender(buf, payloadResult.payload)
      // Формируем отчёт

      let report = 'Самопроверка:\n'
      report += '0. Алиасы:\n' + aliasResult.map(r => `${r.name}: ${r.status}${r.ok ? '' : ' (ошибка)'}`).join('\n') + '\n'
      report += '1. Доступность шаблонов:\n' + templatesResult.map(r => `${r.id}: ${r.ok ? 'OK' : 'Ошибка'}${r.error ? ' ('+r.error+')' : ''}`).join('\n') + '\n'
      if (triedPaths.length) {
        report += 'Пробованные пути:\n' + triedPaths.map((u,i)=>`${i+1}) ${u}`).join('\n') + '\n'
      }
      report += '2. Инспектор: ' + (inspectorResult.ok ? 'OK' : 'Ошибка') + '\n'
      report += '3. Payload: ' + (payloadResult.ok ? 'OK' : 'Ошибка') + ' [' + payloadResult.present.join(', ') + ']\n'
      report += '4. Рендер: ' + (renderResult.ok ? 'OK' : 'Ошибка') + (renderResult.size ? ' (' + renderResult.size + ' байт)' : '') + '\n'
      setStatus({ error: null, message: report })
    } catch (e) {
      setStatus({ error: { name: 'SelfCheck', message: e.message } })
    }
  }

  return (
    <main className="page">
      <div className="container">
        <div className="toolbar">
          <h1 className="page-title">Генератор акта</h1>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <small className="muted">{getProgressText()}</small>
            <button className="btn btn-ghost btn-sm" onClick={handleSelfCheck}>Быстрая проверка</button>
          </div>
        </div>

        <section className="section">
          <h2 className="center-text">Шаблоны актов</h2>
          <p className="muted center-text">Выберите или замените .docx.</p>
          <div className="tpl-grid-wrap">
            <TemplateGallery
              templates={templates}
              selectedId={selectedTemplateId}
              onSelect={selectTemplate}
              onReplace={handleReplace}
              onAdd={handleAdd}
              onInspect={handleInspect}
              bufferLoaded={!!buffer}
            />
          </div>
        </section>

        <div className="content-narrow">
          <section className="section">
            {/* HowToFill: инструкция по заполнению */}
            <div className="form-help">
              <strong>Как заполнить поля:</strong>
              <ul>
                <li>Даты — только цифрами, формат ДД.ММ.ГГГГ.</li>
                <li>Суммы — цифрами и отдельно прописью.</li>
                <li>ФИО — полностью, как в паспорте.</li>
                <li>Паспорт — серия и номер как в документе.</li>
                <li>Проверьте банк, карту и ПИНФЛ.</li>
                <li>Дополнительные поля — только если требует шаблон.</li>
              </ul>
            </div>
          </section>
          <section className="section">
            <Form
              value={formData}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              onInspect={handleInspect}
              onClear={handleClear}
              onExport={handleExport}
              onImport={handleImport}
              onFillLast={handleFillLast}
              onApplyPreset={handleApplyPreset}
              onQuickParse={handleQuickParse}
              errors={errors}
              progressText={getProgressText()}
            />
          </section>
          {inspectorKeys.length > 0 && (
            <section className="section">
              <h2 className="center-text">Инспектор плейсхолдеров</h2>
              <Inspector
                keys={inspectorKeys}
                formKeys={getAllFields()}
                aliases={{ ...GLOBAL_ALIASES, ...(TEMPLATE_ALIASES[selectedTemplateId] || {}) }}
              />
            </section>
          )}
        </div>

        <StatusBar error={status.error} message={status.message} />
      </div>
    </main>
  );
}

export default App;
