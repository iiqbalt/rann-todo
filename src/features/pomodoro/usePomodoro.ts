import { useContext } from 'react'

import { PomodoroContext } from './PomodoroProvider'
import type { PomodoroContextValue } from './PomodoroProvider'

export function usePomodoro(): PomodoroContextValue {
  const ctx = useContext(PomodoroContext)
  if (!ctx) {
    throw new Error('usePomodoro must be used within a PomodoroProvider')
  }
  return ctx
}
