// Bible Strong Avatar Lab integration (https://github.com/smontlouis/bible-strong-avatar-lab)
import { createAvatar } from '../../vendor/avatar-web.js'
import { pointer, clamp, pick, download, toast, copyText } from './util.js'
import { audio } from './audio.js'
import { THEMES, THEME_ORDER } from './themes.js'

export const SURFACES = ['sphere', 'cube', 'capsule', 'cylinder', 'cone', 'diamond', 'trapezoid', 'mickey', 'cursor']
export const ACCESSORIES = ['none', 'cyber-visor', 'orbitals', 'wizard-hat', 'diadem', 'earmuffs', 'wings']
export const BODY_COLORS = ['#f73b56', '#6d4aff', '#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#7cf7ff', '#f4f4f8', '#1d1b2e']
export const EYE_COLORS = ['#111316', '#ffffff', '#7cf7ff', '#ffd60a', '#10b981', '#f73b56']

export const DEFAULT_CONFIG = {
  bodyColor: '#f73b56',
  eyeColor: '#111316',
  surface: 'sphere',
  accessory: 'cyber-visor',
  roundness: 1,
  outline: true,
}

const GAZE_COLS = 7
const GAZE_ROWS = 5
const hex6 = c => (/^#[0-9a-f]{6}$/i.test(c || '') ? c.toLowerCase() : '#f73b56')

let baseDefinition = null
export let ANIMATIONS = []
export let EXPRESSIONS = []

export async function loadAvatarDefinition() {
  if (baseDefinition) return baseDefinition
  const res = await fetch('./assets/strobi.avatar.json')
  if (!res.ok) throw new Error(`Failed to load avatar definition (${res.status})`)
  baseDefinition = await res.json()
  ANIMATIONS = baseDefinition.animationOrder || Object.keys(baseDefinition.animations || {})
  EXPRESSIONS = baseDefinition.expressionOrder || Object.keys(baseDefinition.expressions || {})
  return baseDefinition
}

function nodesForAccessory(accessory) {
  switch (accessory) {
    case 'cyber-visor':
      return {
        scale: 0.88,
        nodes: [
          {
            color: '#0f172a',
            surface: { type: 'capsule', width: 174, height: 42, depth: 52, roundness: 0.9 },
            position: [0, -14, 96],
            rotation: [0, 0, 0],
          },
          {
            color: '#38bdf8',
            surface: { type: 'capsule', width: 148, height: 14, depth: 30, roundness: 1 },
            position: [0, -14, 114],
            rotation: [0, 0, 0],
          },
          {
            color: '#f73b56',
            surface: { type: 'cylinder', width: 22, height: 46, depth: 22, roundness: 0.8 },
            position: [-96, -12, 16],
            rotation: [0, 0, 12],
          },
          {
            color: '#f73b56',
            surface: { type: 'cylinder', width: 22, height: 46, depth: 22, roundness: 0.8 },
            position: [96, -12, 16],
            rotation: [0, 0, -12],
          },
        ],
      }
    case 'orbitals':
      return {
        scale: 0.82,
        nodes: [
          {
            color: '#38bdf8',
            surface: { type: 'sphere', width: 32, height: 32, depth: 32, roundness: 1 },
            position: [-104, -64, 14],
            rotation: [0, 0, 0],
          },
          {
            color: '#f73b56',
            surface: { type: 'diamond', width: 34, height: 42, depth: 34, roundness: 0.3 },
            position: [106, -54, -12],
            rotation: [12, 24, 15],
          },
          {
            color: '#fbbf24',
            surface: { type: 'sphere', width: 24, height: 24, depth: 24, roundness: 1 },
            position: [88, 72, 18],
            rotation: [0, 0, 0],
          },
        ],
      }
    case 'wizard-hat':
      return {
        scale: 0.78,
        nodes: [
          {
            color: '#1b1336',
            surface: { type: 'cylinder', width: 215, height: 16, depth: 215, roundness: 0.9 },
            position: [0, -76, 0],
            rotation: [14, 0, -6],
          },
          {
            color: '#ffd166',
            surface: { type: 'cylinder', width: 132, height: 14, depth: 132, roundness: 0.8 },
            position: [2, -85, 0],
            rotation: [12, 0, -8],
          },
          {
            color: '#341f66',
            surface: { type: 'cone', width: 130, height: 86, depth: 130, roundness: 0.25, tipRoundness: 0.35, baseRoundness: 0.2 },
            position: [5, -104, 0],
            rotation: [10, 0, -10],
          },
        ],
      }
    case 'wings':
      return {
        scale: 0.82,
        nodes: [
          {
            color: '#f8fafc',
            surface: { type: 'diamond', width: 90, height: 32, depth: 18, roundness: 0.7 },
            position: [-102, -14, -18],
            rotation: [0, 12, -24],
          },
          {
            color: '#f8fafc',
            surface: { type: 'diamond', width: 90, height: 32, depth: 18, roundness: 0.7 },
            position: [102, -14, -18],
            rotation: [0, -12, 24],
          },
          {
            color: '#fbbf24',
            surface: { type: 'capsule', width: 56, height: 18, depth: 16, roundness: 1 },
            position: [-94, 8, -22],
            rotation: [0, 8, -10],
          },
          {
            color: '#fbbf24',
            surface: { type: 'capsule', width: 56, height: 18, depth: 16, roundness: 1 },
            position: [94, 8, -22],
            rotation: [0, -8, 10],
          },
        ],
      }
    case 'diadem':
      return {
        scale: 0.84,
        nodes: [
          {
            color: '#ffd166',
            surface: { type: 'cylinder', width: 162, height: 16, depth: 162, roundness: 0.8 },
            position: [0, -86, 0],
            rotation: [12, 0, 0],
          },
          {
            color: '#38bdf8',
            surface: { type: 'diamond', width: 38, height: 48, depth: 24, roundness: 0.2 },
            position: [0, -108, 10],
            rotation: [0, 0, 0],
          },
        ],
      }
    case 'earmuffs':
      return {
        scale: 0.84,
        nodes: [
          {
            color: '#fbbf24',
            surface: { type: 'capsule', width: 42, height: 76, depth: 46, roundness: 1 },
            position: [-96, -4, 0],
            rotation: [0, 0, 8],
          },
          {
            color: '#fbbf24',
            surface: { type: 'capsule', width: 42, height: 76, depth: 46, roundness: 1 },
            position: [96, -4, 0],
            rotation: [0, 0, -8],
          },
          {
            color: '#10b981',
            surface: { type: 'cylinder', width: 176, height: 14, depth: 36, roundness: 1 },
            position: [0, -90, 0],
            rotation: [0, 0, 0],
          },
        ],
      }
    default:
      return { scale: 1, nodes: [] }
  }
}

export function buildDefinition(config = DEFAULT_CONFIG) {
  const def = structuredClone(baseDefinition)
  def.name = 'Kaazhim Bot'
  def.colors = { body: hex6(config.bodyColor), eyes: hex6(config.eyeColor) }
  def.body.primary.type = SURFACES.includes(config.surface) ? config.surface : 'sphere'
  def.body.primary.roundness = clamp(Number(config.roundness ?? 1), 0, 2)

  const acc = nodesForAccessory(config.accessory || 'none')
  def.body.primary.width = Math.round(240 * acc.scale)
  def.body.primary.height = Math.round(240 * acc.scale)
  def.body.primary.depth = Math.round(240 * acc.scale)
  def.body.nodes = acc.nodes

  if (config.outline) def.style = { outline: { enabled: true, color: '#ffffff', width: 4, opacity: 0.45 } }
  else delete def.style

  const neutral = def.expressions.neutral
  for (let c = 0; c < GAZE_COLS; c++) {
    for (let r = 0; r < GAZE_ROWS; r++) {
      const nx = (c / (GAZE_COLS - 1)) * 2 - 1
      const ny = (r / (GAZE_ROWS - 1)) * 2 - 1
      const key = `gaze-c${c}-r${r}`
      const eye = side => ({
        ...neutral.eyes[side],
        x: neutral.eyes[side].x + nx * 4,
        y: neutral.eyes[side].y + ny * 16,
        height: neutral.eyes[side].height * (ny < 0 ? 1 + -ny * 0.08 : 1 - ny * 0.12),
      })
      def.expressions[key] = {
        ...structuredClone(neutral),
        head: { x: -ny * 16, y: nx * 34, z: -nx * 6 },
        eyes: { ...neutral.eyes, left: eye('left'), right: eye('right') },
        blinking: true,
        motion: { eyes: 'microSaccades', body: 'slowDrift' },
      }
      def.expressionOrder.push(key)
    }
  }
  return def
}

function gazeKeyFor(el) {
  const r = el.getBoundingClientRect()
  if (!r.width || !r.height) return 'neutral'
  const cx = r.left + r.width / 2
  const cy = r.top + r.height / 2
  const nx = clamp((pointer.x - cx) / (innerWidth * 0.45), -1, 1)
  const ny = clamp((pointer.y - cy) / (innerHeight * 0.45), -1, 1)
  const c = Math.round(((nx + 1) / 2) * (GAZE_COLS - 1))
  const rr = Math.round(((ny + 1) / 2) * (GAZE_ROWS - 1))
  return `gaze-c${c}-r${rr}`
}

function loadConfig() {
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(localStorage.getItem('knk-avatar') || '{}') }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

function saveConfig(c) {
  try {
    localStorage.setItem('knk-avatar', JSON.stringify(c))
  } catch {}
}

/** Creates the live companion + hero avatar controllers sharing the customized Avatar Lab rig. */
export function createCompanionSystem({ companionHost, bubble, heroHost, heroStatusEl }) {
  let config = loadConfig()
  let definition = buildDefinition(config)
  let compAvatar = null
  let heroAvatar = null
  let mode = 'gaze'
  let currentGaze = null
  let heroGaze = null
  let reactTimer, bubbleTimer, typeTimer
  let minimized = false

  const mountBoth = () => {
    compAvatar?.destroy()
    heroAvatar?.destroy()
    try {
      if (companionHost) {
        compAvatar = createAvatar(companionHost, {
          definition,
          defaultExpression: 'neutral',
          size: '100%',
          ariaLabel: 'Interactive avatar companion',
        })
      }
      if (heroHost) {
        heroAvatar = createAvatar(heroHost, {
          definition,
          defaultAnimation: 'idle',
          size: '100%',
          ariaLabel: 'Kaazhim interactive hero avatar',
        })
      }
    } catch (err) {
      console.warn('[avatar] reverting invalid config', err)
      config = { ...DEFAULT_CONFIG }
      definition = buildDefinition(config)
      if (companionHost) compAvatar = createAvatar(companionHost, { definition, defaultExpression: 'neutral', size: '100%' })
      if (heroHost) heroAvatar = createAvatar(heroHost, { definition, defaultAnimation: 'idle', size: '100%' })
    }
    currentGaze = null
    heroGaze = null
  }
  mountBoth()

  function say(text, ms = 3600) {
    if (!bubble || minimized) return
    clearTimeout(bubbleTimer)
    clearInterval(typeTimer)
    bubble.textContent = ''
    bubble.classList.add('is-on')
    let i = 0
    typeTimer = setInterval(() => {
      bubble.textContent = text.slice(0, ++i)
      audio.voice(text[i - 1] || '')
      if (i >= text.length) clearInterval(typeTimer)
    }, 26)
    bubbleTimer = setTimeout(() => bubble.classList.remove('is-on'), ms + text.length * 26)
  }

  function react(animation, ms = 2800, line) {
    clearTimeout(reactTimer)
    mode = 'react'
    compAvatar?.play(animation)
    heroAvatar?.play(animation)
    if (heroStatusEl) heroStatusEl.textContent = `mood: ${animation}`
    if (line) say(line)
    reactTimer = setTimeout(() => {
      mode = 'gaze'
      currentGaze = null
      heroAvatar?.play('idle')
      if (heroStatusEl) heroStatusEl.textContent = 'gaze tracking · active'
    }, ms)
  }

  function express(key, ms = 3600) {
    clearTimeout(reactTimer)
    mode = 'react'
    compAvatar?.setExpression(key)
    heroAvatar?.setExpression(key)
    if (heroStatusEl) heroStatusEl.textContent = `expression: ${key}`
    reactTimer = setTimeout(() => {
      mode = 'gaze'
      currentGaze = null
      heroAvatar?.play('idle')
      if (heroStatusEl) heroStatusEl.textContent = 'gaze tracking · active'
    }, ms)
  }

  const lines = [
    ['happy', 'Hi! I follow your cursor — explore Avatar Lab below!'],
    ['proud', 'Built with @bible-strong/avatar-web procedural SVG!'],
    ['excited', 'Press Ctrl + K (or Cmd + K) for the Command Palette!'],
    ['playful', 'Try typing "matrix" or "skills" in the Terminal!'],
    ['curious', 'Drag the skill stars inside the Skill Constellation!'],
  ]
  let lineIdx = 0
  companionHost?.addEventListener('click', () => {
    const [anim, msg] = lines[lineIdx++ % lines.length]
    audio.click()
    react(anim, 3000, msg)
  })
  heroHost?.addEventListener('click', () => {
    const [anim, msg] = lines[lineIdx++ % lines.length]
    audio.click()
    react(anim, 2600, msg)
  })

  setInterval(() => {
    const idle = performance.now() - pointer.lastMove
    if (mode === 'gaze' && idle > 26000) {
      mode = 'drowsy'
      compAvatar?.play('drowsy')
      say('*yawn*… still here when you need me…')
    } else if (mode === 'drowsy' && idle > 46000) {
      mode = 'sleep'
      compAvatar?.play('sleeping')
      say('z z z …', 4500)
    } else if ((mode === 'drowsy' || mode === 'sleep') && idle < 500) {
      mode = 'waking'
      compAvatar?.play('waking')
      say(pick(["Welcome back!", "Ready when you are!", "Let's explore Kaazhim's work!"]))
      clearTimeout(reactTimer)
      reactTimer = setTimeout(() => ((mode = 'gaze'), (currentGaze = null)), 2200)
    }

    if (mode !== 'gaze' || !pointer.hasMoved) return
    const sinceMove = performance.now() - pointer.lastMove
    if (companionHost && !minimized) {
      const k = gazeKeyFor(companionHost)
      if (k !== currentGaze) {
        currentGaze = k
        compAvatar?.setExpression(k)
      }
    }
    if (heroHost && scrollY < innerHeight * 0.95) {
      if (sinceMove < 1600) {
        const hk = gazeKeyFor(heroHost)
        if (hk !== heroGaze) {
          heroGaze = hk
          heroAvatar?.setExpression(hk)
        }
      } else if (heroGaze !== null) {
        heroGaze = null
        heroAvatar?.play('idle')
      }
    }
  }, 110)

  return {
    say,
    react,
    express,
    setMinimized(v) {
      minimized = v
      if (v && bubble) bubble.classList.remove('is-on')
    },
    get config() { return config },
    rebuild(next) {
      config = { ...DEFAULT_CONFIG, ...next }
      definition = buildDefinition(config)
      saveConfig(config)
      mountBoth()
    },
  }
}

/** Interactive Avatar Lab playground section. */
export function createAvatarLab(root, companion, onCustomize) {
  const q = s => root.querySelector(s)
  const stage = q('#lab-avatar')
  const status = q('#lab-status')
  let config = { ...DEFAULT_CONFIG, ...companion.config }
  let avatar = null
  let activeAnim = 'idle'
  let follow = false
  let gaze = null

  const updateStatus = () => {
    if (!avatar) return
    const s = avatar.getState()
    status.textContent = `status: ${s.status} · anim: ${s.activeAnimation ?? '—'} · expr: ${s.activeExpression}`
  }

  const mount = () => {
    avatar?.destroy()
    const definition = buildDefinition(config)
    avatar = createAvatar(stage, {
      definition,
      defaultAnimation: activeAnim ?? 'idle',
      size: '100%',
      ariaLabel: 'Avatar Lab live preview',
      onExpressionChange: updateStatus,
      onAnimationEnd: updateStatus,
    })
    updateStatus()
    renderCode()
  }

  const presetGrid = q('#lab-presets')
  THEME_ORDER.forEach(id => {
    const th = THEMES[id]
    const b = pill(`${th.icon} ${th.short}`, () => {
      applyConfig({ ...config, ...th.avatar })
      onCustomize?.(`Applied ${th.short} avatar style`)
    })
    presetGrid.append(b)
  })

  const animGrid = q('#lab-anims')
  ANIMATIONS.forEach(key => {
    const b = pill(key, () => {
      follow = false
      q('#lab-follow').checked = false
      activeAnim = key
      avatar.play(key)
      setActive(animGrid, b)
      setActive(q('#lab-exprs'), null)
      updateStatus()
    })
    if (key === activeAnim) b.classList.add('is-active')
    animGrid.append(b)
  })

  const exprGrid = q('#lab-exprs')
  EXPRESSIONS.forEach(key => {
    const b = pill(key.replaceAll('-', ' '), () => {
      follow = false
      q('#lab-follow').checked = false
      activeAnim = null
      avatar.setExpression(key)
      setActive(exprGrid, b)
      setActive(animGrid, null)
      updateStatus()
    })
    exprGrid.append(b)
  })

  const shapeGrid = q('#lab-shapes')
  SURFACES.forEach(s => {
    const b = pill(s, () => {
      const prev = config.surface
      config.surface = s
      try {
        mount()
        setActive(shapeGrid, b)
        audio.blip(660, 0.08)
        onCustomize?.()
      } catch {
        config.surface = prev
        mount()
        toast(`Surface "${s}" unavailable`)
      }
    })
    if (s === config.surface) b.classList.add('is-active')
    shapeGrid.append(b)
  })

  const accLabels = {
    none: 'None',
    'cyber-visor': '🕶 Cyber Visor',
    orbitals: '✦ Orbitals',
    'wizard-hat': '🎩 Wizard Hat',
    diadem: '👑 Crown',
    earmuffs: '🎧 Headset',
    wings: '🪽 Wings',
  }
  const accGrid = q('#lab-accessories')
  ACCESSORIES.forEach(acc => {
    const b = pill(accLabels[acc] || acc, () => {
      config.accessory = acc
      mount()
      setActive(accGrid, b)
      audio.chime([523, 659, 784])
      onCustomize?.()
    })
    b.dataset.acc = acc
    if (acc === config.accessory) b.classList.add('is-active')
    accGrid.append(b)
  })

  swatches(q('#lab-body-colors'), BODY_COLORS, config.bodyColor, c => ((config.bodyColor = hex6(c)), mount()))
  swatches(q('#lab-eye-colors'), EYE_COLORS, config.eyeColor, c => ((config.eyeColor = hex6(c)), mount()))

  const round = q('#lab-round')
  const roundVal = q('#lab-round-val')
  round.value = config.roundness
  roundVal.textContent = Number(config.roundness).toFixed(2)
  round.addEventListener('input', () => (roundVal.textContent = Number(round.value).toFixed(2)))
  round.addEventListener('change', () => ((config.roundness = Number(round.value)), mount()))

  const outline = q('#lab-outline')
  outline.checked = config.outline
  outline.addEventListener('change', () => ((config.outline = outline.checked), mount()))

  function syncControlsUI() {
    round.value = config.roundness
    roundVal.textContent = Number(config.roundness).toFixed(2)
    outline.checked = !!config.outline
    setActive(shapeGrid, [...shapeGrid.children].find(b => b.textContent === config.surface))
    setActive(accGrid, [...accGrid.children].find(b => b.dataset.acc === config.accessory))
    root.querySelectorAll('#lab-body-colors .swatch').forEach(s => s.classList.toggle('is-active', s.dataset.color === config.bodyColor))
    root.querySelectorAll('#lab-eye-colors .swatch').forEach(s => s.classList.toggle('is-active', s.dataset.color === config.eyeColor))
  }

  function applyConfig(next) {
    config = { ...DEFAULT_CONFIG, ...next }
    syncControlsUI()
    mount()
  }

  q('#lab-random').addEventListener('click', () => {
    applyConfig({
      bodyColor: pick(BODY_COLORS),
      eyeColor: pick(EYE_COLORS),
      surface: pick(SURFACES),
      accessory: pick(ACCESSORIES),
      roundness: Number((0.25 + Math.random() * 0.75).toFixed(2)),
      outline: Math.random() > 0.25,
    })
    activeAnim = pick(['excited', 'celebrate', 'playful', 'proud', 'curious'])
    avatar.play(activeAnim)
    audio.chime([440, 587, 740, 880])
    toast('Randomized procedural avatar!')
  })

  q('#lab-speak-form').addEventListener('submit', e => {
    e.preventDefault()
    const input = q('#lab-speak-input')
    const msg = input.value.trim()
    if (!msg) return
    companion.react('happy', 3400, msg)
    avatar.play('happy')
    input.value = ''
  })

  q('#lab-pause').addEventListener('click', () => (avatar.pause(), updateStatus()))
  q('#lab-stop').addEventListener('click', () => {
    avatar.stop()
    follow = false
    q('#lab-follow').checked = false
    updateStatus()
  })
  q('#lab-follow').addEventListener('change', e => {
    follow = e.target.checked
    gaze = null
    if (!follow && activeAnim) avatar.play(activeAnim)
  })
  setInterval(() => {
    if (!follow) return
    const key = gazeKeyFor(stage)
    if (key !== gaze) {
      gaze = key
      avatar.setExpression(key)
    }
  }, 110)

  root.querySelectorAll('.tab').forEach(tab =>
    tab.addEventListener('click', () => {
      root.querySelectorAll('.tab').forEach(t => t.classList.toggle('is-active', t === tab))
      root.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('is-active', p.dataset.panel === tab.dataset.tab))
    })
  )

  q('#lab-sync').addEventListener('click', () => {
    companion.rebuild(config)
    companion.react('celebrate', 3200, 'Synced new avatar build! ✦')
    toast('Applied custom look to Hero & Companion!')
    onCustomize?.('Synced companion avatar')
  })
  q('#lab-json').addEventListener('click', () => {
    download('kaazhim-avatar.avatar.json', JSON.stringify(buildDefinition(config), null, 2), 'application/json')
    toast('Downloaded kaazhim-avatar.avatar.json')
  })
  q('#lab-svg').addEventListener('click', () => {
    download('kaazhim-avatar.svg', svgString(stage), 'image/svg+xml')
    toast('Downloaded SVG snapshot')
  })
  q('#lab-png').addEventListener('click', async () => {
    const blob = await svgToPng(svgString(stage), 1024)
    download('kaazhim-avatar.png', blob)
    toast('Downloaded 1024px PNG snapshot')
  })
  q('#lab-copy-code').addEventListener('click', () => copyText(q('#lab-code').textContent, 'Copied @bible-strong/avatar-web snippet!'))
  q('#lab-reset').addEventListener('click', () => applyConfig({ ...DEFAULT_CONFIG }))

  function renderCode() {
    q('#lab-code').textContent =
      `import { createAvatar } from '@bible-strong/avatar-web'\n` +
      `import definition from './kaazhim-avatar.avatar.json'\n\n` +
      `const avatar = createAvatar('#avatar', {\n` +
      `  definition,\n` +
      `  defaultAnimation: '${activeAnim ?? 'idle'}',\n` +
      `  size: 240,\n` +
      `})\n` +
      `// surface: ${config.surface} | accessory: ${config.accessory} | body: ${config.bodyColor}\n` +
      `avatar.play('celebrate')`
  }

  mount()
  return {
    applyConfig,
    play(key) {
      if (!ANIMATIONS.includes(key)) return false
      activeAnim = key
      avatar.play(key)
      setActive(animGrid, [...animGrid.children].find(b => b.textContent === key))
      return true
    },
  }
}

function pill(label, onClick) {
  const b = document.createElement('button')
  b.className = 'pill'
  b.type = 'button'
  b.textContent = label
  b.addEventListener('click', () => {
    audio.click()
    onClick()
  })
  return b
}

function setActive(container, el) {
  if (!container) return
  ;[...container.children].forEach(c => c.classList.toggle('is-active', c === el))
}

function swatches(container, colors, current, onPick) {
  colors.forEach(c => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'swatch' + (c === current ? ' is-active' : '')
    b.style.background = c
    b.dataset.color = c
    b.title = c
    b.addEventListener('click', () => {
      ;[...container.querySelectorAll('.swatch')].forEach(s => s.classList.toggle('is-active', s === b))
      audio.click()
      onPick(c)
    })
    container.append(b)
  })
  const input = document.createElement('input')
  input.type = 'color'
  input.className = 'swatch-input'
  input.value = current
  input.title = 'Custom color'
  input.addEventListener('change', () => {
    ;[...container.querySelectorAll('.swatch')].forEach(s => s.classList.remove('is-active'))
    onPick(input.value)
  })
  container.append(input)
}

function svgString(stage) {
  const svg = stage.querySelector('svg').cloneNode(true)
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svg.setAttribute('width', '600')
  svg.setAttribute('height', '600')
  svg.removeAttribute('style')
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + svg.outerHTML
}

function svgToPng(svgText, size) {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }))
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = c.height = size
      c.getContext('2d').drawImage(img, 0, 0, size, size)
      URL.revokeObjectURL(url)
      c.toBlob(resolve, 'image/png')
    }
    img.src = url
  })
}
