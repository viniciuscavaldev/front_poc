import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'necava_theme'

const THEME_FILES = {
  night: '/themes/theme-night.css',
  light: '/themes/theme-light.css',
  'high-contrast': '/themes/theme-high-contrast.css'
}

const THEME_ORDER = ['night', 'light', 'high-contrast']

function normalizeTheme(value) {
  return Object.prototype.hasOwnProperty.call(THEME_FILES, value) ? value : 'night'
}

function applyThemeStylesheet(theme) {
  const safeTheme = normalizeTheme(theme)
  const href = THEME_FILES[safeTheme]
  let link = document.getElementById('app-theme-css')
  if (!link) {
    link = document.createElement('link')
    link.id = 'app-theme-css'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  if (link.getAttribute('href') !== href) {
    link.setAttribute('href', href)
  }
  document.documentElement.dataset.theme = safeTheme
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return normalizeTheme(localStorage.getItem(STORAGE_KEY))
    } catch {
      return 'night'
    }
  })

  useEffect(() => {
    applyThemeStylesheet(theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Ignore storage quota errors
    }
  }, [theme])

  const setTheme = useCallback((nextTheme) => {
    setThemeState(normalizeTheme(nextTheme))
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const idx = THEME_ORDER.indexOf(normalizeTheme(prev))
      return THEME_ORDER[(idx + 1) % THEME_ORDER.length]
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme deve ser utilizado dentro de ThemeProvider')
  }
  return ctx
}
