import { profile, skills, skillGroups, projects } from './data.js'
import { $, $$, lerp, esc, scramble, toast, copyText, pointer, reduceMotion, initTilt, initMagnetic, initScrollReveal, animateCounter } from './modules/util.js'
import { audio } from './modules/audio.js'
import { THEMES, THEME_ORDER, applyThemeVars } from './modules/themes.js'
import { createNebula, createParticleDust, createMatrix } from './modules/backdrop.js'
import { createConstellation } from './modules/constellation.js'
import { createProjectsSection } from './modules/projects.js'
import { loadAvatarDefinition, createCompanionSystem, createAvatarLab, ANIMATIONS } from './modules/avatar.js'
import { createTerminal } from './modules/terminal.js'

const SECTIONS = ['home', 'about', 'skills', 'projects', 'avatar-lab', 'experience', 'terminal', 'contact']

let themeKey = localStorage.getItem('knk-theme')
if (!THEMES[themeKey]) themeKey = 'crimson'
applyThemeVars(THEMES[themeKey])

const getColors = () => {
  const th = THEMES[themeKey]
  return [th.c1, th.c2, th.c3]
}

/* ─────────────────────────── BACKDROP & FX ─────────────────────────── */
const nebula = createNebula($('#nebula'), getColors(), THEMES[themeKey].light)
const dust = createParticleDust($('#particles'), getColors)
const matrix = createMatrix($('#matrix'))

/* ─────────────────────────── CUSTOM CURSOR ─────────────────────────── */
const cursor = $('#cursor')
if (cursor && matchMedia('(pointer: fine)').matches && !reduceMotion()) {
  const curDot = $('.cursor__dot', cursor)
  const curRing = $('.cursor__ring', cursor)
  let cx = pointer.x, cy = pointer.y
  ;(function moveCursor() {
    requestAnimationFrame(moveCursor)
    cx = lerp(cx, pointer.x, 0.22)
    cy = lerp(cy, pointer.y, 0.22)
    curDot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`
    curRing.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
  })()
  document.addEventListener('pointerover', e => {
    cursor.classList.toggle('is-hover', !!e.target.closest('a, button, input, textarea, [data-tilt]'))
  })
  addEventListener('pointerdown', () => cursor.classList.add('is-down'))
  addEventListener('pointerup', () => cursor.classList.remove('is-down'))
} else if (cursor) {
  cursor.style.display = 'none'
}

/* ─────────────────────────── POPULATE CONTENT ─────────────────────────── */
$('#hero-status').textContent = profile.status
$('#hero-location').textContent = profile.location
$('#hero-headline').textContent = profile.headline
$('#hero-sub').textContent = profile.subheadline
scramble($('#hero-name'), profile.name, 900)

// Role typer
const roleEl = $('#role-typer')
let ri = 0, ci = 0, deleting = false
function tickRole() {
  const word = profile.roles[ri % profile.roles.length]
  if (reduceMotion()) {
    roleEl.textContent = profile.roles.join(' · ')
    return
  }
  if (!deleting) {
    roleEl.textContent = word.slice(0, ++ci)
    if (ci === word.length) {
      deleting = true
      setTimeout(tickRole, 1700)
      return
    }
    setTimeout(tickRole, 55)
  } else {
    roleEl.textContent = word.slice(0, --ci)
    if (ci === 0) {
      deleting = false
      ri++
      setTimeout(tickRole, 280)
      return
    }
    setTimeout(tickRole, 30)
  }
}
tickRole()

// Services
const serviceIcons = {
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 6l-2 12"/></svg>',
  cpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 3 3 8 12 13 21 8 12 3"/><path d="M3 13l9 5 9-5M3 17.5l9 5 9-5"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
}
$('#services-grid').innerHTML = profile.services
  .map(
    s => `
  <article class="service-card glass reveal" data-tilt>
    <div class="service-card__icon">${serviceIcons[s.icon] || ''}</div>
    <h3>${esc(s.title)}</h3>
    <p>${esc(s.desc)}</p>
    <div class="tags">${s.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
  </article>`
  )
  .join('')

// About + Whoami + Stats + Awards
$('#about-text').innerHTML = profile.about.map(p => `<p class="lead-p reveal">${esc(p)}</p>`).join('')
$('#whoami').textContent =
  `{\n` +
  `  "name": "${profile.name}",\n` +
  `  "degree": "${profile.education.degree}",\n` +
  `  "university": "${profile.education.school}",\n` +
  `  "cgpa": "${profile.education.cgpa}",\n` +
  `  "currentRole": "IT Intern @ Encorp Berhad",\n` +
  `  "location": "${profile.location}",\n` +
  `  "languages": ["Malay", "English"]\n` +
  `}`

const statsGrid = $('#stats-grid')
profile.stats.forEach((st, idx) => {
  const card = document.createElement('div')
  card.className = 'stat-card glass reveal'
  card.innerHTML = `<span class="stat-card__num mono" data-stat="${idx}">0</span><span class="stat-card__label">${esc(st.label)}</span>`
  statsGrid.append(card)
})

const statIO = new IntersectionObserver(
  entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return
      const el = en.target
      const st = profile.stats[Number(el.dataset.stat)]
      animateCounter(el, st.value, st.suffix, st.decimals)
      statIO.unobserve(el)
    })
  },
  { threshold: 0.3 }
)
$$('[data-stat]').forEach(el => statIO.observe(el))

$('#awards-grid').innerHTML = profile.awards
  .map(
    a => `
  <article class="award-card glass reveal" data-tilt>
    <div class="award-card__top">
      <span class="award-badge mono">${esc(a.badge)}</span>
      <span class="mono small muted-note">${esc(a.year)}</span>
    </div>
    <h3>${esc(a.title)}</h3>
    <p class="award-card__org mono">${esc(a.org)}</p>
    <p>${esc(a.detail)}</p>
  </article>`
  )
  .join('')

// Skills Constellation & Bars
const constellation = createConstellation($('#skills-canvas'), $('#skill-tip'), skills, skillGroups)
const skillChips = $('#skill-chips')
const skillBars = $('#skill-bars')

function renderSkillBars(filter = 'all') {
  skillBars.innerHTML = skills
    .filter(s => filter === 'all' || s.group === filter)
    .map(s => {
      const g = skillGroups[s.group]
      return `
      <div class="skill-bar glass">
        <div class="skill-bar__head">
          <span>${esc(s.name)}</span>
          <span class="mono" style="color:${g.color}">${s.level}%</span>
        </div>
        <div class="skill-bar__track">
          <span class="skill-bar__fill" style="width:${s.level}%; background:${g.color}"></span>
        </div>
      </div>`
    })
    .join('')
}

;[['all', 'All Skills'], ...Object.entries(skillGroups).map(([k, v]) => [k, v.label])].forEach(([key, label]) => {
  const b = document.createElement('button')
  b.type = 'button'
  b.className = 'chip' + (key === 'all' ? ' is-active' : '')
  b.textContent = label
  b.addEventListener('click', () => {
    audio.click()
    ;[...skillChips.children].forEach(c => c.classList.toggle('is-active', c === b))
    constellation.setFilter(key)
    renderSkillBars(key)
  })
  skillChips.append(b)
})
renderSkillBars('all')

// Projects
const projectsCtrl = createProjectsSection({
  grid: $('#project-grid'),
  chipsEl: $('#project-chips'),
  searchEl: $('#project-search'),
  modal: $('#project-modal'),
  projects,
  onOpen: p => {
    audio.click()
    app.companion?.react('curious', 2800, `Inspecting ${p.title}!`)
  },
})

// Experience Timeline
const timelineEl = $('#timeline')
profile.experience.forEach(item => {
  const node = document.createElement('article')
  node.className = 'timeline-item glass reveal'
  node.innerHTML = `
    <span class="timeline-dot" aria-hidden="true"></span>
    <div class="timeline-item__meta">
      <span class="mono timeline-period">${esc(item.period)}</span>
      <span class="timeline-org">${esc(item.org)}</span>
    </div>
    <h3>${esc(item.role)}</h3>
    <p>${esc(item.desc)}</p>
    <div class="tags">${item.highlights.map(h => `<span class="tag">${esc(h)}</span>`).join('')}</div>
  `
  timelineEl.append(node)
})

// Contact & Socials
const socialIcons = {
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.48 2.48 0 1 1 0 4.96 2.48 2.48 0 0 1 0-4.96ZM3 9h4v12H3V9Zm7 0h3.8v1.64h.05c.53-1 1.82-2.05 3.75-2.05 4 0 4.74 2.63 4.74 6.06V21h-4v-5.6c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.97V21h-4V9Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
}
$('#contact-email-val').textContent = profile.email
$('#contact-phone-val').textContent = profile.phone
$('#contact-location-val').textContent = profile.location
$('#copy-email').addEventListener('click', () => copyText(profile.email, `Copied ${profile.email}`))
$('#copy-phone').addEventListener('click', () => copyText(profile.phone, `Copied ${profile.phone}`))

$('#socials-list').innerHTML = profile.socials
  .map(
    s => `
  <a href="${esc(s.url)}" target="_blank" rel="noopener" class="social-pill glass">
    <span class="social-pill__icon">${socialIcons[s.icon] || ''}</span>
    <span>${esc(s.label)}</span>
    <span class="mono small muted-note">${esc(s.handle)}</span>
  </a>`
  )
  .join('')

$('#year').textContent = new Date().getFullYear()

// Contact Form
const contactForm = $('#contact-form')
const copyInquiryBtn = $('#copy-inquiry-btn')
function getInquiryText() {
  const fd = new FormData(contactForm)
  const name = (fd.get('name') || '').toString().trim()
  const email = (fd.get('email') || '').toString().trim()
  const subject = (fd.get('subject') || 'Portfolio Inquiry').toString().trim()
  const msg = (fd.get('message') || '').toString().trim()
  return { name, email, subject, msg, formatted: `From: ${name} <${email}>\nSubject: ${subject}\n\n${msg}` }
}
contactForm.addEventListener('submit', e => {
  e.preventDefault()
  const { name, email, subject, msg } = getInquiryText()
  if (!name || !email || !msg) {
    toast('Please fill in your name, email, and message.')
    return
  }
  const mailBody = `Hi Kaazhim,\n\n${msg}\n\nBest,\n${name}\n(${email})`
  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`
  window.location.href = mailto
  audio.chime([523, 659, 784])
  dust.burst(innerWidth / 2, innerHeight / 2, 32)
  app.companion?.react('celebrate', 3400, 'Opening your email app — thanks for reaching out!')
  toast('Opening mail client to send message to Kaazhim!')
})
copyInquiryBtn.addEventListener('click', () => {
  const { formatted, msg } = getInquiryText()
  if (!msg) return toast('Write a message first before copying.')
  copyText(formatted, 'Copied formatted message to clipboard!')
})

/* ─────────────────────────── THEME SWITCHER ─────────────────────────── */
const themeMenu = $('#theme-menu')
const themeList = $('#theme-list')
const themePillLabel = $('#theme-pill-label')

function renderThemeList() {
  themeList.innerHTML = ''
  THEME_ORDER.forEach(id => {
    const th = THEMES[id]
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'theme-option' + (id === themeKey ? ' is-active' : '')
    b.innerHTML = `
      <span class="theme-swatch" style="background:linear-gradient(135deg,${th.c1},${th.c2})"></span>
      <span class="theme-option__text"><b>${esc(th.name)}</b><small>${esc(th.desc)}</small></span>
    `
    b.addEventListener('click', () => {
      audio.click()
      setTheme(id)
      themeMenu.classList.remove('is-open')
    })
    themeList.append(b)
  })
}

function setTheme(id) {
  if (!THEMES[id]) return false
  themeKey = id
  localStorage.setItem('knk-theme', id)
  const th = THEMES[id]
  applyThemeVars(th)
  nebula.setColors(getColors())
  nebula.setLight(!!th.light)
  nebula.pulse(0.9)
  themePillLabel.textContent = `${th.icon} ${th.short}`
  renderThemeList()
  if ($('#theme-sync-avatar')?.checked && app.lab && app.companion) {
    app.companion.rebuild(th.avatar)
    app.lab.applyConfig(th.avatar)
  }
  toast(`Theme switched to ${th.name}`)
  return true
}

themePillLabel.textContent = `${THEMES[themeKey].icon} ${THEMES[themeKey].short}`
renderThemeList()

$('#theme-btn').addEventListener('click', e => {
  e.stopPropagation()
  audio.click()
  themeMenu.classList.toggle('is-open')
})
document.addEventListener('click', e => {
  if (!themeMenu.contains(e.target) && e.target !== $('#theme-btn')) themeMenu.classList.remove('is-open')
})

/* ─────────────────────────── NAV, PROGRESS & SCROLL SPY ─────────────────────────── */
const sideDots = $('#side-dots')
SECTIONS.forEach(id => {
  const li = document.createElement('li')
  const a = document.createElement('a')
  a.href = `#${id}`
  a.title = id
  a.dataset.target = id
  li.append(a)
  sideDots.append(li)
})

const navLinks = $('#nav-links')
$('#burger').addEventListener('click', () => navLinks.classList.toggle('is-open'))
$$('#nav-links a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('is-open')))

const progressFill = $('#progress-fill')
const timelineFill = $('#timeline-fill')

function onScroll() {
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight)
  const pct = (scrollY / max) * 100
  progressFill.style.width = `${pct.toFixed(1)}%`
  $('#nav').classList.toggle('is-scrolled', scrollY > 24)

  const tlRect = timelineEl.getBoundingClientRect()
  const tlProgress = Math.max(0, Math.min(1, (innerHeight * 0.65 - tlRect.top) / Math.max(1, tlRect.height)))
  timelineFill.style.height = `${(tlProgress * 100).toFixed(1)}%`

  let active = SECTIONS[0]
  for (const id of SECTIONS) {
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top <= innerHeight * 0.42) active = id
  }
  $$('#nav-links a').forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${active}`))
  $$('#side-dots a').forEach(a => a.classList.toggle('is-active', a.dataset.target === active))
}
addEventListener('scroll', onScroll, { passive: true })
onScroll()

/* ─────────────────────────── SOUND & APP CONTROLLER ─────────────────────────── */
const soundBtn = $('#sound-btn')
function syncSound() {
  const on = audio.enabled
  soundBtn.textContent = on ? '♪ ON' : '♪'
  soundBtn.setAttribute('aria-pressed', String(on))
  soundBtn.classList.toggle('is-active', on)
}
soundBtn.addEventListener('click', () => {
  const on = audio.toggle()
  syncSound()
  toast(on ? 'Web Audio synth enabled' : 'Audio muted')
})

const app = {
  themes: THEMES,
  get theme() { return themeKey },
  setTheme,
  syncSound,
  matrix: () => {
    matrix.toggle()
    toast(matrix.active ? 'Matrix rain activated' : 'Matrix rain stopped')
  },
  openProject: id => projectsCtrl.openModal(id),
  goto: sec => {
    const target = document.getElementById(sec)
    if (!target) return false
    target.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' })
    return true
  },
  companion: null,
  lab: null,
}

/* ─────────────────────────── TERMINAL & COMMAND PALETTE ─────────────────────────── */
const palette = $('#palette')
const palInput = $('#palette-input')
const palList = $('#palette-list')

const palItems = [
  ...SECTIONS.map(s => ({ label: `Jump to #${s}`, hint: 'section', run: () => app.goto(s) })),
  ...THEME_ORDER.map(id => ({ label: `Theme: ${THEMES[id].name}`, hint: 'theme', run: () => setTheme(id) })),
  ...projects.map(p => ({ label: `Open Project: ${p.title}`, hint: p.year, run: () => projectsCtrl.openModal(p.id) })),
  { label: 'Copy Email (kaazhim03@gmail.com)', hint: 'action', run: () => copyText(profile.email, `Copied ${profile.email}`) },
  { label: 'Toggle Matrix Rain', hint: 'fx', run: () => app.matrix() },
  { label: 'Toggle Web Audio Synth', hint: 'audio', run: () => { audio.toggle(); syncSound() } },
  { label: 'Particle Burst', hint: 'fx', run: () => dust.burst(innerWidth / 2, innerHeight / 2, 42) },
]

let palSel = 0
function renderPalette(q = '') {
  const matches = palItems.filter(it => it.label.toLowerCase().includes(q.toLowerCase()))
  palSel = Math.min(palSel, Math.max(0, matches.length - 1))
  palList.innerHTML = ''
  matches.slice(0, 10).forEach((it, idx) => {
    const li = document.createElement('li')
    li.className = idx === palSel ? 'is-active' : ''
    li.innerHTML = `<span>${esc(it.label)}</span><span class="mono small muted-note">${esc(it.hint)}</span>`
    li.addEventListener('click', () => {
      it.run()
      closePalette()
    })
    palList.append(li)
  })
  return matches
}

function openPalette() {
  palette.classList.add('is-open')
  palette.setAttribute('aria-hidden', 'false')
  palInput.value = ''
  palSel = 0
  renderPalette('')
  setTimeout(() => palInput.focus(), 20)
}
function closePalette() {
  palette.classList.remove('is-open')
  palette.setAttribute('aria-hidden', 'true')
}
$('#palette-btn').addEventListener('click', openPalette)
palette.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closePalette))
palInput.addEventListener('input', () => {
  palSel = 0
  renderPalette(palInput.value)
})
palInput.addEventListener('keydown', e => {
  const matches = renderPalette(palInput.value).slice(0, 10)
  if (e.key === 'ArrowDown') {
    palSel = (palSel + 1) % Math.max(1, matches.length)
    renderPalette(palInput.value)
    e.preventDefault()
  } else if (e.key === 'ArrowUp') {
    palSel = (palSel - 1 + Math.max(1, matches.length)) % Math.max(1, matches.length)
    renderPalette(palInput.value)
    e.preventDefault()
  } else if (e.key === 'Enter' && matches[palSel]) {
    matches[palSel].run()
    closePalette()
  }
})

addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    palette.classList.contains('is-open') ? closePalette() : openPalette()
  } else if (e.key === 'Escape') {
    closePalette()
    projectsCtrl.closeModal()
    themeMenu.classList.remove('is-open')
  }
})

$('#to-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' }))
$('#hero-burst-btn').addEventListener('click', e => {
  const r = e.currentTarget.getBoundingClientRect()
  dust.burst(r.left + r.width / 2, r.top + r.height / 2, 36)
  nebula.pulse(1.2)
  audio.chime([523, 659, 784, 1046])
  app.companion?.react('celebrate', 2600, 'Let us build something awesome!')
})

/* ─────────────────────────── BOOT AVATAR LAB & TERMINAL ─────────────────────────── */
async function bootInteractive() {
  try {
    await loadAvatarDefinition()
    const compBox = $('#companion')
    const compSystem = createCompanionSystem({
      companionHost: $('#companion-avatar'),
      bubble: $('#companion-bubble'),
      heroHost: $('#hero-avatar'),
      heroStatusEl: $('#hero-avatar-status'),
    })
    app.companion = compSystem
    app.lab = createAvatarLab($('#avatar-lab'), compSystem)

    $$('[data-hero-mood]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mood = btn.dataset.heroMood
        audio.click()
        compSystem.react(mood, 2800, `Mood: ${mood}!`)
      })
    })

    $('#companion-toggle').addEventListener('click', () => {
      const next = !compBox.classList.contains('is-minimized')
      compBox.classList.toggle('is-minimized', next)
      $('#companion-toggle').textContent = next ? '✦ Avatar' : '▾'
      compSystem.setMinimized(next)
    })

    setTimeout(() => compSystem.say('Hey! Move around & try Avatar Lab below ✦', 3600), 1100)
  } catch (err) {
    console.warn('[avatar] could not initialize:', err)
    $('#hero-avatar').innerHTML = '<div class="avatar-fallback mono">Avatar Lab ready when served over HTTP(S)</div>'
  }

  createTerminal(app)
  palItems.push(
    ...ANIMATIONS.slice(0, 8).map(a => ({
      label: `Avatar Play: ${a}`,
      hint: 'avatar',
      run: () => app.companion?.react(a, 3000, `Playing ${a}!`),
    }))
  )
}

bootInteractive()
initScrollReveal()
initTilt()
initMagnetic()

// Subtle 400ms curtain release
const preloader = $('#preloader')
if (preloader) {
  requestAnimationFrame(() => {
    setTimeout(() => preloader.classList.add('is-done'), reduceMotion() ? 50 : 380)
  })
}
