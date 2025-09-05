// Компонент галереи шаблонов актов
// Позволяет выбрать, заменить или добавить шаблон
import React from 'react'

/**
 * props:
 * - templates: массив шаблонов
 * - selectedId: id выбранного шаблона
 * - onSelect(id): выбрать шаблон
 * - onReplace(id, file): заменить шаблон
 * - onAdd(file): добавить новый шаблон
 */
export default function TemplateGallery({ templates, selectedId, onSelect, onReplace, onAdd, onInspect, bufferLoaded }) {
  // ...existing code...
  // Обработка замены шаблона
  const handleReplace = (id, e) => {
    const file = e.target.files[0]
    if (file) onReplace(id, file)
  }
  // Обработка добавления нового шаблона
  const handleAdd = e => {
    const file = e.target.files[0]
    if (file) onAdd(file)
  }
  return (
    <div className="template-gallery tpl-grid-wrap">
      <div className="template-desc center-text">
        Выберите шаблон для генерации акта.<br />
        <b>Редактировать шаблон</b> — заменить файл на свой .docx.<br />
        <div style={{marginTop:'8px',fontWeight:'bold',color:'#6cf'}}>
          {selectedId ? `Выбран: ${templates.find(t=>t.id===selectedId)?.title || selectedId}` : 'Шаблон не выбран'}
          {bufferLoaded ? ' (шаблон загружен)' : ' (шаблон не загружен)'}
        </div>
      </div>
      <div className="tpl-grid">
        {templates.map(t => (
          <div key={t.id} className={`tpl-card card${selectedId === t.id ? ' is-active' : ''}`}> 
            <div className="card__body">
              <div className="tpl-title">{t.title}</div>
              {(() => {
                const title = String(t.title || '').trim().toLowerCase()
                const note = String(t.note || '').trim()
                const noteLc = note.toLowerCase()
                return note && noteLc !== title ? (
                  <div className="tpl-note">{note}</div>
                ) : null
              })()}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className={`btn btn-primary btn-sm${selectedId === t.id ? ' is-active' : ''}`} onClick={() => onSelect(t.id)}>
                  {selectedId === t.id ? 'Выбран' : 'Выбрать'}
                </button>
                <button className="btn btn-outline btn-sm" disabled={!bufferLoaded} onClick={() => onInspect && onInspect()}>
                  Проверить плейсхолдеры
                </button>
                <label className="btn btn-ghost btn-sm">
                  Заменить файлом…
                  <input type="file" accept=".docx" style={{ display: 'none' }} onChange={e => handleReplace(t.id, e)} />
                </label>
              </div>
            </div>
          </div>
        ))}
        <div className="tpl-card card add">
          <div className="card__body center-text">
            <label className="btn btn-primary btn-sm">
              Добавить новый шаблон
              <input type="file" accept=".docx" style={{ display: 'none' }} onChange={handleAdd} />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
