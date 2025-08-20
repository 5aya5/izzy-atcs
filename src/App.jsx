// Главный компонент приложения "Генератор акта"
// Управляет состоянием формы, шаблонов, буфера шаблона и статусом
import React, { useState, useEffect } from 'react'
import TemplateGallery from './components/TemplateGallery'
import FilePicker from './components/FilePicker'
import Inspector from './components/Inspector'
import StatusBar from './components/StatusBar'
import Form from './components/Form'
import { BUILTIN_TEMPLATES, loadBuiltinBuffer, loadBuiltinBufferById } from './lib/templates'
import { extractTemplateKeys, buildPayload, GLOBAL_ALIASES, TEMPLATE_ALIASES } from './lib/placeholders'
import { renderDocx } from './lib/docx'
import { loadForm, saveForm, clearForm } from './lib/storage'
import { makeFileName } from './lib/filename'
import { saveAs } from 'file-saver'

function App() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [buffer, setBuffer] = useState(null);
  const [bufferError, setBufferError] = useState(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [templates, setTemplates] = useState(BUILTIN_TEMPLATES);
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState({ error: null, message: '' });
  const [inspectorKeys, setInspectorKeys] = useState([]);

  // Загрузка буфера встроенного шаблона при монтировании
  useEffect(() => {
    const loadBuffer = async () => {
      setIsLoadingTemplate(true);
      try {
        const buffer = await loadBuiltinBuffer();
        setBuffer(buffer);
        setStatus({ error: null, message: 'Шаблон загружен' });
      } catch (e) {
        setStatus({ error: { name: 'Buffer', message: 'Ошибка загрузки шаблона' } });
      } finally {
        setIsLoadingTemplate(false);
      }
    };
    loadBuffer();
  }, []);

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
    }
  };

  // Замена шаблона
  const handleReplace = async id => {
    const template = templates.find(t => t.id === id);
    if (!template) return;
    setIsLoadingTemplate(true);
    try {
      const buffer = await template.file.arrayBuffer();
      setBuffer(buffer);
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
    setTemplates([...templates, { id, title: file.name, file, src: 'uploaded' }])
    setSelectedTemplateId(id)
    setStatus({ error: null, message: 'Шаблон добавлен' })
  }
  // Проверка плейсхолдеров
  const handleInspect = async () => {
    if (!templateBuffer) return setStatus({ error: { name: 'Buffer', message: 'Шаблон не загружен' } })
    try {
      const { keys } = await extractTemplateKeys(templateBuffer)
      setInspectorKeys(keys)
      setStatus({ error: null, message: 'Плейсхолдеры извлечены' })
    } catch (e) {
      setStatus({ error: { name: 'Inspector', message: 'Ошибка разбора шаблона', errors: e.errors } })
    }
  }
  // Генерация DOCX
  const handleSubmit = async () => {
    if (!templateBuffer) return setStatus({ error: { name: 'Buffer', message: 'Нет активного шаблона' } })
    try {
      const payload = buildPayload(formData, selectedTemplateId)
      const blob = await renderDocx(templateBuffer, payload)
      saveAs(blob, makeFileName(formData))
      setStatus({ error: null, message: 'Документ успешно создан' })
    } catch (e) {
      setStatus({ error: { name: e.name, message: e.message, errors: e.errors } })
    }
  }
  // Сброс формы
  const handleClear = () => {
    clearForm()
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
    setFormData(data)
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
          <button className="btn btn-ghost btn-sm" onClick={handleSelfCheck}>Быстрая проверка</button>
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
              bufferLoaded={!!buffer}
            />
          </div>
        </section>

        <div className="content-narrow">
          <section className="section">
            {/* HowToFill: инструкция по заполнению, можно вынести в отдельный компонент */}
            <div className="form-help">
              <strong>Как заполнить поля:</strong>
              <ul>
                <li>Даты — только цифрами, формат ДД.ММ.ГГГГ или по инструкции.</li>
                <li>Суммы — цифрами и отдельно прописью.</li>
                <li>ФИО — полностью, как в паспорте.</li>
                <li>Паспорт — серия и номер как в документе.</li>
                <li>Сумма прописью должна соответствовать цифрам.</li>
                <li>Проверьте банк, карту и ПИНФЛ.</li>
                <li>Дополнительные поля — только если требует шаблон.</li>
              </ul>
            </div>
          </section>
          <section className="section">
            <Form
              value={formData}
              onChange={setFormData}
              onSubmit={handleSubmit}
              onInspect={handleInspect}
              onClear={handleClear}
              onExport={handleExport}
              onImport={handleImport}
              errors={{}}
            />
          </section>
        </div>

        <StatusBar error={status.error} message={status.message} />
      </div>
    </main>
  );
}

export default App;
