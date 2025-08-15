// Модуль для работы с localStorage формы
// loadForm, saveForm, clearForm

const STORAGE_KEY = 'acts.form.v1'
let debounceTimer = null

export function loadForm() {
  // Загружает форму из localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveForm(data) {
  // Сохраняет форму с debounce
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }, 400)
}

export function clearForm() {
  // Очищает форму
  localStorage.removeItem(STORAGE_KEY)
}
