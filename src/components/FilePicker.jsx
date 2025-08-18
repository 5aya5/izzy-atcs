// Компонент выбора файла .docx
// Универсальный input для замены/добавления шаблона
import React from 'react'

/**
 * props:
 * - onPick(file): обработчик выбора файла
 */
export default function FilePicker({ onPick }) {
  return (
    <input type="file" accept=".docx" onChange={e => onPick(e.target.files[0])} />
  )
}
