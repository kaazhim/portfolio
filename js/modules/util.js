// Shared DOM, math, motion, clipboard and toast utilities

export const $ = (s, root = document) => root.querySelector(s)
export const $$ = (s, root = document) => [...root.querySelectorAll(s)]
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const pick = arr => arr[(Math.random() * arr.length) | 0]
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const motionQuery = matchMedia('(prefers-reduced-motion: reduce)')
export const reduceMotion = () => motionQuery.matches

export const pointer = {
  x: innerWidth / 2,
  y: innerHeight / 2,
  lastMove: performance.now(),
  hasMoved: false,
}

addEventListener(
  'pointermove',
  e => {
    pointer.x = e.clientX
    pointer.y = e.clientY
    pointer.lastMove = performance.now()
    pointer.hasMoved = true
  },
  { passive: true }
)

export function fitCanvas(canvas, maxDpr = 2) {
  const dpr = Math.min(devicePixelRatio || 1, maxDpr)
  const rect = canvas.getBoundingClientRect()
  const w = Math.max(1, Math.round(rect.width * dpr))
  const h = Math.max(1, Math.round(rect.height * dpr))
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }
  return { w, h, dpr }
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+/<>'

export function scramble(el, targetText = el.dataset.text || el.textContent, duration = 680) {
  if (!el) return
  el.dataset.text = targetText
  if (reduceMotion()) {
    el.textContent = targetText
    return
  }
  const start = performance.now()
  clearInterval(el._scrambleTimer)
  el._scrambleTimer = setInterval(() => {
    const p = clamp((performance.now() - start) / duration, 0, 1)
    const revealed = Math.floor(p * targetText.length)
    let out = ''
    for (let i = 0; i < targetText.length; i++) {
      const ch = targetText[i]
      if (ch === ' ' || i < revealed) out += ch
      else out += GLYPHS[(Math.random() * GLYPHS.length) | 0]
    }
    el.textContent = out
    if (p >= 1) {
      clearInterval(el._scrambleTimer)
      el.textContent = targetText
    }
  }, 28)
}

export function toast(message, accent = '') {
  const stack = $('#toasts')
  if (!stack) return
  const el = document.createElement('div')
  el.className = 'toast'
  if (accent) el.style.borderColor = accent
  el.textContent = message
  stack.append(el)
  requestAnimationFrame(() => el.classList.add('is-in'))
  setTimeout(() => {
    el.classList.remove('is-in')
    setTimeout(() => el.remove(), 320)
  }, 3000)
}

export async function copyText(text, label = 'Copied to clipboard') {
  try {
    await navigator.clipboard.writeText(text)
    toast(label)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.append(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    toast(ok ? label : 'Copy failed — please copy manually')
    return ok
  }
}

export function download(filename, data, mime = 'application/octet-stream') {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function initTilt(selector = '[data-tilt]') {
  if (reduceMotion() || matchMedia('(pointer: coarse)').matches) return
  $$(selector).forEach(card => {
    if (card.dataset.tiltBound) return
    card.dataset.tiltBound = '1'
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect()
      const px = clamp((e.clientX - r.left) / r.width, 0, 1)
      const py = clamp((e.clientY - r.top) / r.height, 0, 1)
      const rx = (0.5 - py) * 9
      const ry = (px - 0.5) * 11
      card.style.setProperty('--mx', `${px * 100}%`)
      card.style.setProperty('--my', `${py * 100}%`)
      card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-3px)`
    })
    card.addEventListener('pointerleave', () => {
      card.style.transform = ''
    })
  })
}

export function initMagnetic(selector = '.magnetic') {
  if (reduceMotion() || matchMedia('(pointer: coarse)').matches) return
  $$(selector).forEach(el => {
    if (el.dataset.magBound) return
    el.dataset.magBound = '1'
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.18
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.24
      el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`
    })
    el.addEventListener('pointerleave', () => {
      el.style.transform = ''
    })
  })
}

export function animateCounter(el, target, suffix = '', decimals = 0) {
  if (!el || el.dataset.counted) return
  el.dataset.counted = '1'
  if (reduceMotion()) {
    el.textContent = Number(target).toFixed(decimals) + suffix
    return
  }
  const dur = 1100
  const start = performance.now()
  const tick = now => {
    const t = clamp((now - start) / dur, 0, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    const val = target * eased
    el.textContent = (decimals ? val.toFixed(decimals) : Math.round(val)) + suffix
    if (t < 1) requestAnimationFrame(tick)
    else el.textContent = (decimals ? Number(target).toFixed(decimals) : target) + suffix
  }
  requestAnimationFrame(tick)
}

export function initScrollReveal() {
  const els = $$('.reveal')
  if (reduceMotion() || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('is-visible'))
    return
  }
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        const sc = entry.target.querySelector('[data-scramble]') || (entry.target.hasAttribute('data-scramble') ? entry.target : null)
        if (sc && !sc.dataset.scrambled) {
          sc.dataset.scrambled = '1'
          scramble(sc, sc.textContent.trim(), 560)
        }
        io.unobserve(entry.target)
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  )
  els.forEach(el => io.observe(el))
}
