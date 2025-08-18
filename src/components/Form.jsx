
// Компонент формы для генерации акта
// Рендерит поля из схемы, показывает подсказки, placeholder, help
import React, { useState } from 'react'
import { FORM_SECTIONS } from '../schema/fields'
import { fieldMeta } from '../schema/helpers'
import { getInputClass } from '../lib/ui'

export default function Form({ value, onChange, onSubmit, onInspect, onClear, onExport, onImport, errors = {} }) {
  const [importJson, setImportJson] = useState('')
  // Обработка изменения поля
  const handleChange = e => {
    const { name, value: val } = e.target
    onChange({ ...value, [name]: val })
  }
  // Импорт JSON
  const handleImport = () => {
    try {
      const data = JSON.parse(importJson)
      onImport(data)
    } catch {}
  }
  return (
    <div className="content-narrow">
      <form className="act-form" onSubmit={e => { e.preventDefault(); onSubmit() }}>
        <div className="form-help section">
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
        {FORM_SECTIONS.map(section => (
          <fieldset key={section.id} className="form-section section">
            <legend>{section.title}</legend>
            <div className={`grid-${section.columns}`}> 
              {section.fields.map(f => (
                <div key={f.name} className="field">
                  <label htmlFor={f.name} title={f.help}>{f.label}</label>
                  <input
                    id={f.name}
                    name={f.name}
                    value={value[f.name] || ''}
                    onChange={handleChange}
                    required={!!f.required}
                    aria-required={!!f.required}
                    placeholder={f.placeholder}
                    className={getInputClass(errors[f.name])}
                    aria-describedby={f.name + '-help'}
                  />
                  {f.help && <small className="hint">{f.help}</small>}
                  {errors[f.name] && <div className="error">{errors[f.name]}</div>}
                </div>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onInspect}>Проверить плейсхолдеры</button>
          <button type="submit" className="btn btn-primary btn-lg">Сформировать DOCX</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>Сбросить</button>
          <button type="button" className="btn btn-sm" onClick={onExport}>Экспорт JSON</button>
          <input type="text" value={importJson} onChange={e => setImportJson(e.target.value)} placeholder="Вставьте JSON для импорта" />
          <button type="button" className="btn btn-sm" onClick={handleImport}>Импорт JSON</button>
        </div>
      </form>
    </div>
  )
}
