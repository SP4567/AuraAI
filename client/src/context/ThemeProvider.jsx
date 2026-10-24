import { useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './ThemeContext'

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('aura-theme') === 'dark' ? 'dark' : 'light'
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    localStorage.setItem('aura-theme', theme)
  }, [theme])

  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme(current => current === 'light' ? 'dark' : 'light'),
  }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
