// Компонент инспектора плейсхолдеров шаблона
// Показывает таблицу ключей и их статусы
import React from 'react'

/**
 * props:
 * - keys: массив ключей
 * - formKeys: ключи формы
 * - aliases: алиасы (глобальные/шаблонные)
 */
export default function Inspector({ keys = [], formKeys = [], aliases = {} }) {
  // Проверка статуса ключа
  const getStatus = key => {
    if (formKeys.includes(key)) return 'match'
    if (Object.keys(aliases).includes(key)) return 'alias'
    return 'unknown'
  }
  // Примечание для non-standard
  const getNote = key => key.includes(' ') ? 'non-standard (поддерживается через алиас или прямую подстановку)' : ''
  // Цветная метка статуса
  const getBadge = status => {
    const cls = status === 'non-standard' ? 'nonstd' : status
    return <span className={`badge badge--${cls}`}>{status}</span>
  }

  if (!keys.length) {
    return <div className="hint">Шаблон не выбран или не загружен. Выберите шаблон и нажмите «Проверить плейсхолдеры».</div>
  }

  return (
    <table className="inspector-table">
      <thead>
        <tr>
          <th>Ключ</th>
          <th>Статус</th>
          <th>Примечание</th>
        </tr>
      </thead>
      <tbody>
        {keys.map(key => {
          const status = getStatus(key)
          const note = getNote(key)
          return (
            <tr key={key}>
              <td>{key}</td>
              <td>{getBadge(status)}{note && status === 'unknown' ? getBadge('non-standard') : null}</td>
              <td>{note}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
