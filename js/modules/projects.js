import { esc, initTilt } from './util.js'

/** Crisp domain-specific SVG architecture previews for each project card. */
export function renderProjectArt(diagram, accent) {
  switch (diagram) {
    case 'bpms':
      return `<svg viewBox="0 0 360 150" class="proj-svg" aria-hidden="true">
        <defs><linearGradient id="g-bpms" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${accent}" stop-opacity=".35"/><stop offset="100%" stop-color="${accent}" stop-opacity=".03"/></linearGradient></defs>
        <rect x="24" y="54" width="66" height="40" rx="8" fill="url(#g-bpms)" stroke="${accent}" stroke-opacity=".7"/>
        <text x="57" y="78" text-anchor="middle" fill="currentColor" font-size="9" font-family="JetBrains Mono">INTAKE</text>
        <path d="M90 74 H136" stroke="${accent}" stroke-width="2" stroke-dasharray="4 3"/>
        <polygon points="154,50 184,74 154,98 124,74" fill="url(#g-bpms)" stroke="${accent}"/>
        <text x="154" y="77" text-anchor="middle" fill="currentColor" font-size="8" font-family="JetBrains Mono">SLA</text>
        <path d="M184 74 H222 M154 50 V30 H248 V54" stroke="${accent}" stroke-opacity=".75" stroke-width="1.6" fill="none"/>
        <rect x="222" y="54" width="76" height="40" rx="8" fill="url(#g-bpms)" stroke="${accent}"/>
        <text x="260" y="78" text-anchor="middle" fill="currentColor" font-size="9" font-family="JetBrains Mono">APPROVED</text>
        <circle cx="322" cy="74" r="10" fill="${accent}" fill-opacity=".25" stroke="${accent}"/>
        <path d="M298 74 H312" stroke="${accent}" stroke-width="2"/>
      </svg>`
    case 'cashflow':
      return `<svg viewBox="0 0 360 150" class="proj-svg" aria-hidden="true">
        ${[36, 52, 44, 68, 84, 72, 98, 114]
          .map(
            (h, i) =>
              `<rect x="${34 + i * 38}" y="${124 - h}" width="22" height="${h}" rx="5" fill="${accent}" fill-opacity="${0.28 + i * 0.08}" stroke="${accent}" stroke-opacity=".6"/>`
          )
          .join('')}
        <path d="M45 96 L83 78 L121 86 L159 62 L197 46 L235 58 L273 34 L311 20" fill="none" stroke="currentColor" stroke-width="2" stroke-opacity=".85"/>
        <circle cx="311" cy="20" r="5" fill="${accent}"/>
      </svg>`
    case 'telemetry':
      return `<svg viewBox="0 0 360 150" class="proj-svg" aria-hidden="true">
        <rect x="24" y="22" width="142" height="106" rx="12" fill="${accent}" fill-opacity=".08" stroke="${accent}" stroke-opacity=".4"/>
        <circle cx="95" cy="76" r="34" fill="none" stroke="currentColor" stroke-opacity=".14" stroke-width="8"/>
        <circle cx="95" cy="76" r="34" fill="none" stroke="${accent}" stroke-width="8" stroke-dasharray="168 220" stroke-linecap="round" transform="rotate(-90 95 76)"/>
        <text x="95" y="80" text-anchor="middle" fill="currentColor" font-size="13" font-weight="700" font-family="JetBrains Mono">94.2%</text>
        <rect x="184" y="22" width="152" height="46" rx="10" fill="${accent}" fill-opacity=".08" stroke="${accent}" stroke-opacity=".35"/>
        <path d="M198 52 L222 40 L246 48 L270 32 L294 42 L322 30" fill="none" stroke="${accent}" stroke-width="2.2"/>
        <rect x="184" y="80" width="152" height="48" rx="10" fill="${accent}" fill-opacity=".08" stroke="${accent}" stroke-opacity=".35"/>
        <text x="202" y="102" fill="currentColor" font-size="9" font-family="JetBrains Mono" opacity=".75">DOWNTIME ALERT</text>
        <rect x="202" y="110" width="94" height="6" rx="3" fill="${accent}" fill-opacity=".75"/>
      </svg>`
    case 'healthcare':
      return `<svg viewBox="0 0 360 150" class="proj-svg" aria-hidden="true">
        <rect x="30" y="26" width="300" height="98" rx="14" fill="${accent}" fill-opacity=".07" stroke="${accent}" stroke-opacity=".4"/>
        <rect x="54" y="54" width="36" height="36" rx="9" fill="${accent}" fill-opacity=".22" stroke="${accent}"/>
        <path d="M72 62 V82 M62 72 H82" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>
        <rect x="108" y="54" width="120" height="10" rx="5" fill="currentColor" fill-opacity=".25"/>
        <rect x="108" y="72" width="82" height="8" rx="4" fill="currentColor" fill-opacity=".14"/>
        <rect x="252" y="56" width="56" height="24" rx="12" fill="${accent}" fill-opacity=".28" stroke="${accent}"/>
        <text x="280" y="71" text-anchor="middle" fill="currentColor" font-size="8.5" font-family="JetBrains Mono">TRIAGE</text>
      </svg>`
    case 'attendance':
      return `<svg viewBox="0 0 360 150" class="proj-svg" aria-hidden="true">
        ${[0, 1, 2].map(r => [0, 1, 2, 3, 4, 5].map(c => {
          const on = (r + c) % 3 !== 0
          return `<rect x="${48 + c * 46}" y="${30 + r * 34}" width="32" height="22" rx="6" fill="${accent}" fill-opacity="${on ? '.32' : '.08'}" stroke="${accent}" stroke-opacity="${on ? '.8' : '.25'}"/>`
        }).join('')).join('')}
      </svg>`
    case 'library':
      return `<svg viewBox="0 0 360 150" class="proj-svg" aria-hidden="true">
        <rect x="34" y="28" width="96" height="94" rx="10" fill="${accent}" fill-opacity=".12" stroke="${accent}"/>
        <text x="82" y="50" text-anchor="middle" fill="${accent}" font-size="9" font-family="JetBrains Mono">BOOKS_TBL</text>
        <line x1="46" y1="62" x2="118" y2="62" stroke="currentColor" stroke-opacity=".2"/>
        <text x="50" y="78" fill="currentColor" font-size="8" font-family="JetBrains Mono" opacity=".75">PK book_id</text>
        <text x="50" y="94" fill="currentColor" font-size="8" font-family="JetBrains Mono" opacity=".6">isbn_code</text>
        <path d="M130 75 H226" stroke="${accent}" stroke-width="2" stroke-dasharray="5 4"/>
        <rect x="226" y="28" width="100" height="94" rx="10" fill="${accent}" fill-opacity=".12" stroke="${accent}"/>
        <text x="276" y="50" text-anchor="middle" fill="${accent}" font-size="9" font-family="JetBrains Mono">LOANS_APEX</text>
        <line x1="238" y1="62" x2="314" y2="62" stroke="currentColor" stroke-opacity=".2"/>
        <text x="242" y="78" fill="currentColor" font-size="8" font-family="JetBrains Mono" opacity=".75">FK member_id</text>
        <text x="242" y="94" fill="currentColor" font-size="8" font-family="JetBrains Mono" opacity=".6">due_status</text>
      </svg>`
    case 'gps':
      return `<svg viewBox="0 0 360 150" class="proj-svg" aria-hidden="true">
        <path d="M32 106 C80 104, 102 42, 152 48 C196 54, 210 98, 256 76 C288 60, 308 38, 328 36" fill="none" stroke="${accent}" stroke-width="3.2" stroke-linecap="round"/>
        <circle cx="152" cy="48" r="6" fill="${accent}"/>
        <circle cx="328" cy="36" r="10" fill="${accent}" fill-opacity=".28" stroke="${accent}"/>
        <text x="44" y="38" fill="currentColor" font-size="11" font-weight="700" font-family="JetBrains Mono">04:52 /km · 5.42 km</text>
      </svg>`
    default:
      return `<svg viewBox="0 0 360 150" class="proj-svg" aria-hidden="true">
        <rect x="34" y="26" width="136" height="98" rx="10" fill="${accent}" fill-opacity=".1" stroke="${accent}" stroke-opacity=".45"/>
        <text x="50" y="50" fill="${accent}" font-size="9" font-family="JetBrains Mono">class OrderEngine</text>
        <rect x="50" y="64" width="96" height="7" rx="3" fill="currentColor" fill-opacity=".2"/>
        <rect x="50" y="80" width="76" height="7" rx="3" fill="currentColor" fill-opacity=".16"/>
        <rect x="50" y="96" width="88" height="7" rx="3" fill="currentColor" fill-opacity=".12"/>
        <rect x="196" y="26" width="130" height="98" rx="10" fill="currentColor" fill-opacity=".04" stroke="${accent}" stroke-opacity=".35"/>
        <text x="214" y="52" fill="currentColor" font-size="9" font-family="JetBrains Mono">RECEIPT #042</text>
        <text x="214" y="74" fill="currentColor" font-size="8.5" font-family="JetBrains Mono" opacity=".7">2x Nasi Lemak</text>
        <text x="214" y="92" fill="currentColor" font-size="8.5" font-family="JetBrains Mono" opacity=".7">1x Teh Tarik</text>
        <text x="214" y="112" fill="${accent}" font-size="9.5" font-weight="700" font-family="JetBrains Mono">TOTAL RM 24.50</text>
      </svg>`
  }
}

export function createProjectsSection({ grid, chipsEl, searchEl, modal, projects, onOpen }) {
  const categories = [
    { key: 'all', label: 'All Projects' },
    { key: 'fullstack', label: 'Full-Stack & Web' },
    { key: 'enterprise', label: 'Enterprise & BI' },
    { key: 'mobile', label: 'Mobile & UI/UX' },
    { key: 'systems', label: 'Systems & OOP' },
  ]
  let activeCat = 'all'
  let query = ''

  categories.forEach(cat => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'chip' + (cat.key === 'all' ? ' is-active' : '')
    b.textContent = cat.label
    b.addEventListener('click', () => {
      activeCat = cat.key
      ;[...chipsEl.children].forEach(c => c.classList.toggle('is-active', c === b))
      render()
    })
    chipsEl.append(b)
  })

  searchEl.addEventListener('input', () => {
    query = searchEl.value.trim().toLowerCase()
    render()
  })

  function render() {
    const filtered = projects.filter(p => {
      const catOk = activeCat === 'all' || p.category === activeCat
      if (!catOk) return false
      if (!query) return true
      return (
        p.title.toLowerCase().includes(query) ||
        p.summary.toLowerCase().includes(query) ||
        p.stack.some(s => s.toLowerCase().includes(query))
      )
    })

    grid.innerHTML = ''
    if (!filtered.length) {
      grid.innerHTML = `<div class="empty-state glass">No projects matched "<b>${esc(query)}</b>". Try clearing the filter.</div>`
      return
    }

    filtered.forEach(p => {
      const card = document.createElement('article')
      card.className = 'project-card glass'
      card.dataset.tilt = ''
      card.style.setProperty('--card-accent', p.accent)
      card.innerHTML = `
        <div class="project-card__art">
          ${renderProjectArt(p.diagram, p.accent)}
          <span class="project-card__year mono">${esc(p.year)} · ${esc(p.categoryLabel)}</span>
        </div>
        <div class="project-card__body">
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.summary)}</p>
          <div class="tags">${p.stack.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
          <div class="project-card__foot">
            <button type="button" class="mini-btn mini-btn--accent" data-open="${esc(p.id)}">Inspect Case Study →</button>
            <div class="project-card__links">
              ${p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener" class="icon-link" title="GitHub Repository">GitHub ↗</a>` : ''}
              ${p.live ? `<a href="${esc(p.live)}" target="_blank" rel="noopener" class="icon-link icon-link--live" title="Live Demo">Live ↗</a>` : ''}
            </div>
          </div>
        </div>
      `
      card.querySelector('[data-open]').addEventListener('click', () => openModal(p.id))
      grid.append(card)
    })
    initTilt('[data-tilt]')
  }

  function openModal(id) {
    const p = projects.find(x => x.id === id)
    if (!p) return
    modal.querySelector('#modal-art').innerHTML = renderProjectArt(p.diagram, p.accent)
    modal.querySelector('#modal-meta').textContent = `${p.year} · ${p.categoryLabel}`
    modal.querySelector('#modal-title').textContent = p.title
    modal.querySelector('#modal-details').textContent = p.details
    modal.querySelector('#modal-highlights').innerHTML = p.highlights.map(h => `<li>${esc(h)}</li>`).join('')
    modal.querySelector('#modal-stack').innerHTML = p.stack.map(t => `<span class="tag">${esc(t)}</span>`).join('')

    const actions = modal.querySelector('#modal-actions')
    actions.innerHTML = ''
    if (p.live) {
      actions.innerHTML += `<a class="btn btn--primary" href="${esc(p.live)}" target="_blank" rel="noopener">Open Live App ↗</a>`
    }
    if (p.repo) {
      actions.innerHTML += `<a class="btn btn--ghost" href="${esc(p.repo)}" target="_blank" rel="noopener">View on GitHub ↗</a>`
    }
    if (!p.live && !p.repo) {
      actions.innerHTML = `<span class="mono small muted-note">Internal / Academic Prototype — reach out for a live walkthrough.</span>`
    }

    modal.classList.add('is-open')
    modal.setAttribute('aria-hidden', 'false')
    onOpen?.(p)
  }

  function closeModal() {
    modal.classList.remove('is-open')
    modal.setAttribute('aria-hidden', 'true')
  }

  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal))
  render()
  return { render, openModal, closeModal }
}
