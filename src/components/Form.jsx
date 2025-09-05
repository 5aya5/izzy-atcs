
// Компонент формы для генерации акта
// Рендерит поля из схемы, показывает подсказки, placeholder, help
import React, { useState } from 'react'
import { applyDigitMask } from '../lib/mask'
import { FORM_SECTIONS } from '../schema/fields'
import { fieldMeta } from '../schema/helpers'
import { getInputClass } from '../lib/ui'

export default function Form({ value, onChange, onSubmit, onInspect, onClear, onExport, onImport, onFillLast, onApplyPreset, onQuickParse, errors = {}, progressText }) {
  const [importJson, setImportJson] = useState('')
  const [quickLine, setQuickLine] = useState('')
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
        {FORM_SECTIONS.map(section => (
          <fieldset key={section.id} className="form-section section">
            <legend>{section.title}</legend>
            <div className={`grid-${section.columns}`}> 
              {section.fields.map(f => (
                <div key={f.name} className="field">
                  <label htmlFor={f.name} title={f.help}>{f.label}</label>
                  {f.mask ? (
                    <input
                      id={f.name}
                      name={f.name}
                      value={applyDigitMask(value[f.name] || '', f.mask)}
                      onChange={(e) => {
                        const masked = applyDigitMask(e.target.value, f.mask)
                        onChange({ ...value, [f.name]: masked })
                      }}
                      required={!!f.required}
                      aria-required={!!f.required}
                      placeholder={f.placeholder}
                      inputMode={f.inputMode}
                      maxLength={f.mask.length}
                      className={getInputClass(errors[f.name])}
                      aria-describedby={f.name + '-help'}
                    />
                  ) : (
                    <input
                      id={f.name}
                      name={f.name}
                      value={value[f.name] || ''}
                      onChange={handleChange}
                      required={!!f.required}
                      aria-required={!!f.required}
                      placeholder={f.placeholder}
                      inputMode={f.inputMode}
                      className={getInputClass(errors[f.name])}
                      aria-describedby={f.name + '-help'}
                    />
                  )}
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
          {onFillLast && <button type="button" className="btn btn-sm" onClick={onFillLast}>Использовать последние</button>}
          {onApplyPreset && <button type="button" className="btn btn-sm" onClick={onApplyPreset}>Применить пресет</button>}
        </div>
        <div className="actions">
          <input type="text" value={quickLine} onChange={e => setQuickLine(e.target.value)} placeholder="Вставьте одну строку (паспорт, дата, карта, ПИНФЛ)…" />
          <button type="button" className="btn btn-sm" onClick={() => onQuickParse && onQuickParse(quickLine)}>Разобрать строку</button>
        </div>
      </form>
    </div>
  )
}
