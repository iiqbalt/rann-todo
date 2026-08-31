type AudioCtxCtor = typeof AudioContext

function getAudioContextCtor(): AudioCtxCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    AudioContext?: AudioCtxCtor
    webkitAudioContext?: AudioCtxCtor
  }
  return w.AudioContext ?? w.webkitAudioContext ?? null
}

let cachedCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (cachedCtx) return cachedCtx
  const Ctor = getAudioContextCtor()
  if (!Ctor) return null
  cachedCtx = new Ctor()
  return cachedCtx
}

export function unlockAudio(): void {
  const ctx = getCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    void ctx.resume()
  }
}

type BeepOptions = {
  frequency?: number
  durationMs?: number
  volume?: number
  repeat?: number
  gapMs?: number
}

export function playBeep(options: BeepOptions = {}): void {
  const {
    frequency = 880,
    durationMs = 250,
    volume = 0.3,
    repeat = 1,
    gapMs = 120,
  } = options

  const ctx = getCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    void ctx.resume()
  }

  const now = ctx.currentTime
  const dur = durationMs / 1000
  const gap = gapMs / 1000

  for (let i = 0; i < repeat; i++) {
    const start = now + i * (dur + gap)

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(frequency, start)

    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(volume, start + 0.01)
    gain.gain.linearRampToValueAtTime(0, start + dur)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(start)
    osc.stop(start + dur + 0.02)
  }
}

export function playFocusEndBeep(): void {
  playBeep({ frequency: 880, durationMs: 300, volume: 0.3, repeat: 2 })
}

export function playBreakEndBeep(): void {
  playBeep({ frequency: 660, durationMs: 250, volume: 0.25, repeat: 1 })
}
