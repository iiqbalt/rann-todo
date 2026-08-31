import { useEffect, useState } from 'react'
import { Play, Timer } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { usePomodoro } from './usePomodoro'
import type { PomodoroConfig } from './types'

type Field =
  | 'focusMinutes'
  | 'shortBreakMinutes'
  | 'longBreakMinutes'
  | 'cyclesBeforeLongBreak'

const FIELD_META: Array<{
  key: Field
  label: string
  suffix: string
  min: number
  max: number
}> = [
  { key: 'focusMinutes', label: 'Focus', suffix: 'min', min: 1, max: 99 },
  {
    key: 'shortBreakMinutes',
    label: 'Short Break',
    suffix: 'min',
    min: 1,
    max: 60,
  },
  {
    key: 'longBreakMinutes',
    label: 'Long Break',
    suffix: 'min',
    min: 1,
    max: 99,
  },
  {
    key: 'cyclesBeforeLongBreak',
    label: 'Cycles before Long Break',
    suffix: '',
    min: 2,
    max: 12,
  },
]

export function PomodoroSettings() {
  const { config, updateConfig, start } = usePomodoro()
  const [draft, setDraft] = useState<PomodoroConfig>(config)

  useEffect(() => {
    setDraft(config)
  }, [config])

  const handleChange = (key: Field, raw: string) => {
    const meta = FIELD_META.find((m) => m.key === key)
    if (!meta) return
    const n = Number(raw)
    if (Number.isNaN(n)) return
    const clamped = Math.min(meta.max, Math.max(meta.min, Math.floor(n)))
    setDraft((d) => ({ ...d, [key]: clamped }))
  }

  const handleBlur = (key: Field) => {
    updateConfig({ [key]: draft[key] })
  }

  const handleStart = () => {
    updateConfig(draft)
    start()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b-2 border-ink/10 pb-3 dark:border-dark-ink/10">
        <Timer className="h-5 w-5 text-pink-deep" />
        <h2 className="font-bold uppercase tracking-wider text-ink dark:text-dark-ink">
          Pomodoro
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {FIELD_META.map(({ key, label, suffix, min, max }) => (
          <label
            key={key}
            className="flex flex-col gap-1.5 text-sm font-medium text-ink dark:text-dark-ink"
          >
            <span className="text-xs uppercase tracking-wider text-muted dark:text-dark-muted">
              {label}
            </span>
            <div className="flex items-stretch gap-2">
              <Input
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                value={draft[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                onBlur={() => handleBlur(key)}
                className="w-full font-mono"
              />
              {suffix && (
                <span className="flex w-16 shrink-0 items-center justify-center rounded-brutal-sm border-2 border-ink/20 bg-ivory text-xs font-bold uppercase tracking-wider text-muted dark:border-dark-ink/20 dark:bg-dark-ivory dark:text-dark-muted">
                  {suffix}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>

      <Button onClick={handleStart} size="md" className="w-full">
        <Play className="h-4 w-4" fill="currentColor" />
        Start Focus
      </Button>
    </div>
  )
}
