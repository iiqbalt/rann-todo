import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

const STORAGE_KEY = 'rann:dark-mode'

type DarkModeContextType = {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(
  undefined,
)

function readDarkMode(): boolean {
  if (typeof window === 'undefined') return false
  const stored = window.localStorage.getItem(STORAGE_KEY)
  console.log('Reading dark mode from localStorage:', stored)
  return stored === 'true'
}

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const initialDarkMode = readDarkMode()
    console.log('Initial dark mode:', initialDarkMode)
    setIsDarkMode(initialDarkMode)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    console.log('Setting dark mode to:', isDarkMode)
    window.localStorage.setItem(STORAGE_KEY, String(isDarkMode))

    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      console.log('Added dark class to html')
    } else {
      document.documentElement.classList.remove('dark')
      console.log('Removed dark class from html')
    }
  }, [isDarkMode, isMounted])

  const toggleDarkMode = () => {
    console.log('Toggling dark mode from:', isDarkMode, 'to:', !isDarkMode)
    setIsDarkMode((prev) => !prev)
  }

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
}
