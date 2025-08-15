// Компонент статус-бара для вывода ошибок и статусов
// Показывает ошибки docxtemplater и другие сообщения
import React from 'react'

/**
 * props:
 * - error: объект ошибки (name, message, errors)
 * - message: строка статуса
 */
export default function StatusBar({ error, message }) {
  return (
    <div className="status-bar" aria-live="polite">
      {error ? (
        <div className="error">
          <strong>{error.name}</strong><br />
          <span style={{ whiteSpace: 'pre-line' }}>{error.message}</span>
          {error.errors && error.errors.length > 0 && (
            <pre>{JSON.stringify(error.errors, null, 2)}</pre>
          )}
        </div>
      ) : message ? (
        <div className="success">{message}</div>
      ) : null}
    </div>
  )
}
