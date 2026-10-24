import { Moon, Sun } from 'lucide-react'
import useTheme from '../context/useTheme'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="theme-toggle"
    >
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      <span>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}

export default ThemeToggle
