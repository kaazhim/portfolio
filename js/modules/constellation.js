import { pointer, fitCanvas, reduceMotion } from './util.js'
import { audio } from './audio.js'

/** Interactive spring-physics skill constellation canvas. */
export function createConstellation(canvas, tip, skills, groups) {
  const ctx = canvas.getContext('2d')
  const groupKeys = Object.keys(groups)
  let W = 0, H = 0, dpr = 1
  let filter = 'all'
  let hovered = null, dragging = null
  let visible = false, raf

  const hubs = groupKeys.map(k => ({ key: k, x: 0, y: 0, hx: 0, hy: 0, color: groups[k].color, label: groups[k].label }))
  const nodes = skills.map(s => ({ ...s, x: 0, y: 0, vx: 0, vy: 0, r: 5 + s.level / 15, hub: null, ph: Math.random() * 6.28 }))

  function layout() {
    ;({ w: W, h: H, dpr } = fitCanvas(canvas, 2))
    W /= dpr; H /= dpr
    const rx = W * 0.28
    const ry = H * 0.28
    hubs.forEach((h, i) => {
      const a = (i / hubs.length) * Math.PI * 2 - Math.PI / 4
      h.hx = W / 2 + Math.cos(a) * rx
      h.hy = H / 2 + Math.sin(a) * ry
      if (!h.x) { h.x = h.hx; h.y = h.hy }
    })
    nodes.forEach(n => {
      n.hub = hubs.find(h => h.key === n.group)
      if (!n.x) {
        n.x = n.hub.hx + (Math.random() - 0.5) * 85
        n.y = n.hub.hy + (Math.random() - 0.5) * 85
      }
    })
  }
  layout()
  addEventListener('resize', layout)

  const local = e => {
    const r = canvas.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const hit = p => [...nodes, ...hubs].find(n => Math.hypot(n.x - p.x, n.y - p.y) < (n.r || 16) + 9)

  canvas.addEventListener('pointerdown', e => {
    const n = hit(local(e))
    if (n) {
      dragging = n
      canvas.setPointerCapture(e.pointerId)
      audio.blip(440 + (n.level || 60) * 5, 0.08)
    }
  })

  canvas.addEventListener('pointermove', e => {
    const p = local(e)
    if (dragging) {
      dragging.x = p.x
      dragging.y = p.y
      dragging.vx = dragging.vy = 0
    }
    const n = hit(p)
    if (n !== hovered) {
      hovered = n
      if (n) audio.hover()
    }
    if (n) {
      tip.classList.add('is-on')
      tip.style.left = n.x + 'px'
      tip.style.top = n.y - (n.r || 16) + 'px'
      tip.innerHTML = n.level
        ? `<b style="color:${n.hub.color}">${n.name}</b> · ${n.level}%`
        : `<b style="color:${n.color}">${n.label}</b> · drag node`
    } else {
      tip.classList.remove('is-on')
    }
  })

  const end = () => (dragging = null)
  canvas.addEventListener('pointerup', end)
  canvas.addEventListener('pointercancel', end)
  canvas.addEventListener('pointerleave', () => {
    tip.classList.remove('is-on')
    hovered = null
  })

  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting
    if (visible) {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(frame)
    }
  })
  io.observe(canvas)

  function frame(now) {
    if (!visible) return
    if (!reduceMotion()) raf = requestAnimationFrame(frame)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    const isLight = document.documentElement.classList.contains('is-light')
    const labelColor = isLight ? '#0f172a' : '#e8ecff'
    const dimLabel = isLight ? '#94a3b8' : '#64748b'
    const r = canvas.getBoundingClientRect()
    const mx = pointer.x - r.left, my = pointer.y - r.top

    for (const h of hubs) {
      if (h === dragging) continue
      h.x += (h.hx + Math.sin(now / 2200 + h.hx) * 8 - h.x) * 0.045
      h.y += (h.hy + Math.cos(now / 2500 + h.hy) * 8 - h.y) * 0.045
    }

    for (const n of nodes) {
      if (n === dragging) continue
      const orbit = 52 + (100 - n.level) * 1.15
      const a = now / 4500 + n.ph
      const tx = n.hub.x + Math.cos(a) * orbit
      const ty = n.hub.y + Math.sin(a) * orbit * 0.78
      n.vx += (tx - n.x) * 0.0045
      n.vy += (ty - n.y) * 0.0045

      for (const m of nodes) {
        if (m === n) continue
        const dx = n.x - m.x, dy = n.y - m.y
        const d2 = dx * dx + dy * dy
        if (d2 < 2400 && d2 > 0.01) {
          const f = ((2400 - d2) / 2400) * 0.35
          const d = Math.sqrt(d2)
          n.vx += (dx / d) * f
          n.vy += (dy / d) * f
        }
      }

      const dx = n.x - mx, dy = n.y - my
      const d2 = dx * dx + dy * dy
      if (d2 < 5200 && !dragging) {
        const d = Math.sqrt(d2) || 1
        n.vx += (dx / d) * 0.5
        n.vy += (dy / d) * 0.5
      }
      n.vx *= 0.9
      n.vy *= 0.9
      n.x += n.vx
      n.y += n.vy
    }

    ctx.lineWidth = 1.1
    for (const n of nodes) {
      const on = filter === 'all' || n.group === filter
      ctx.strokeStyle = n.hub.color
      ctx.globalAlpha = on ? 0.3 : 0.05
      ctx.beginPath()
      ctx.moveTo(n.hub.x, n.hub.y)
      ctx.lineTo(n.x, n.y)
      ctx.stroke()
    }

    ctx.globalAlpha = isLight ? 0.12 : 0.08
    ctx.strokeStyle = isLight ? '#0f172a' : '#ffffff'
    ctx.beginPath()
    hubs.forEach((h, i) => (i ? ctx.lineTo(h.x, h.y) : ctx.moveTo(h.x, h.y)))
    ctx.closePath()
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (const h of hubs) {
      const on = filter === 'all' || h.key === filter
      ctx.globalAlpha = on ? 1 : 0.2
      const g = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, 38)
      g.addColorStop(0, h.color + '88')
      g.addColorStop(1, h.color + '00')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(h.x, h.y, 38, 0, 7)
      ctx.fill()
      ctx.fillStyle = h.color
      ctx.font = `700 12px 'JetBrains Mono', monospace`
      ctx.fillText(`◈ ${h.label.toUpperCase()}`, h.x, h.y)
    }

    for (const n of nodes) {
      const on = filter === 'all' || n.group === filter
      const hov = n === hovered
      ctx.globalAlpha = on ? 1 : 0.16
      ctx.shadowColor = n.hub.color
      ctx.shadowBlur = hov ? 22 : 10
      ctx.fillStyle = n.hub.color
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.r * (hov ? 1.45 : 1), 0, 7)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = on ? labelColor : dimLabel
      ctx.font = `${hov ? 600 : 500} ${hov ? 13 : 11.5}px 'Space Grotesk', sans-serif`
      ctx.fillText(n.name, n.x, n.y + n.r + 12)
    }
    ctx.globalAlpha = 1
  }

  return {
    setFilter(f) {
      filter = f
      if (reduceMotion() && visible) frame(performance.now())
    },
  }
}
