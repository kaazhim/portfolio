// Zero-dependency Web Audio synthesizer (muted by default; toggled via navbar/terminal)

let ctx = null
let master = null
let ambient = null
let enabled = false

function ensure() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return null
    ctx = new AudioCtx()
    master = ctx.createGain()
    master.gain.value = 0.42
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

function startAmbient() {
  if (ambient || !ctx) return
  const t = ctx.currentTime
  const out = ctx.createGain()
  out.gain.setValueAtTime(0.0001, t)
  out.gain.exponentialRampToValueAtTime(0.075, t + 2.4)

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 620
  filter.Q.value = 4

  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 0.08
  lfoGain.gain.value = 320
  lfo.connect(lfoGain).connect(filter.frequency)

  const notes = [65.41, 98.0, 130.81, 196.0]
  const oscs = notes.map((f, i) => {
    const o = ctx.createOscillator()
    o.type = i % 2 ? 'triangle' : 'sine'
    o.frequency.value = f
    o.detune.value = (Math.random() - 0.5) * 10
    const g = ctx.createGain()
    g.gain.value = 0.22 / (i + 1)
    o.connect(g).connect(filter)
    o.start()
    return o
  })

  filter.connect(out).connect(master)
  lfo.start()
  ambient = { out, oscs, lfo }
}

function stopAmbient() {
  if (!ambient || !ctx) return
  const { out, oscs, lfo } = ambient
  const t = ctx.currentTime
  out.gain.cancelScheduledValues(t)
  out.gain.setValueAtTime(Math.max(0.0001, out.gain.value), t)
  out.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
  setTimeout(() => {
    oscs.forEach(o => { try { o.stop() } catch {} })
    try { lfo.stop() } catch {}
    out.disconnect()
  }, 550)
  ambient = null
}

export const audio = {
  get enabled() {
    return enabled
  },
  toggle(force) {
    enabled = force ?? !enabled
    if (enabled) {
      if (ensure()) {
        startAmbient()
        this.chime([523.25, 659.25, 783.99])
      }
    } else {
      stopAmbient()
    }
    return enabled
  },
  blip(freq = 760, dur = 0.055, type = 'sine', vol = 0.06) {
    if (!enabled) return
    const c = ensure()
    if (!c) return
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = type
    o.frequency.setValueAtTime(freq, c.currentTime)
    o.frequency.exponentialRampToValueAtTime(freq * 1.35, c.currentTime + dur)
    g.gain.setValueAtTime(vol, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur)
    o.connect(g).connect(master)
    o.start()
    o.stop(c.currentTime + dur + 0.02)
  },
  hover() {
    this.blip(980 + Math.random() * 220, 0.035, 'sine', 0.022)
  },
  click() {
    this.blip(540, 0.07, 'triangle', 0.065)
  },
  voice(ch) {
    if (!enabled || !/[a-z0-9]/i.test(ch)) return
    const base = 360 + ((ch.toLowerCase().charCodeAt(0) * 31) % 240)
    this.blip(base, 0.04, 'square', 0.018)
  },
  chime(freqs = [523, 659, 784, 1046]) {
    if (!enabled) return
    freqs.forEach((f, i) => setTimeout(() => this.blip(f, 0.14, 'triangle', 0.055), i * 55))
  },
}
