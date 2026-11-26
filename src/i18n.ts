import { ref } from 'vue'

type Locale = 'zh-CN' | 'en'
const preferenceKey = 'wristo-growth.locale'
const saved = localStorage.getItem(preferenceKey)
export const locale = ref<Locale>(saved === 'en' || saved === 'zh-CN'
  ? saved : navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en')

document.documentElement.lang = locale.value

export function setLocale(value: Locale) {
  locale.value = value
  document.documentElement.lang = value
  localStorage.setItem(preferenceKey, value)
}

export function t(chinese: string, english: string) {
  return locale.value === 'zh-CN' ? chinese : english
}
