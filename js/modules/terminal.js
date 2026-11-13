import { profile, skills, projects } from '../data.js'
import { esc } from './util.js'
import { textToAscii } from './backdrop.js'
import { ANIMATIONS, EXPRESSIONS } from './avatar.js'
import { audio } from './audio.js'

export function createTerminal(app) {
  const out = document.getElementById('term-out')
  const form = document.getElementById('term-form')
  const input = document.getElementById('term-input')
  const history = []
  let hIdx = 0

  const print = (html, cls = '') => {
    const div = document.createElement('div')
    if (cls) div.className = cls
    div.innerHTML = html
    out.append(div)
    out.scrollTop = out.scrollHeight
  }

  const help = {
    help: 'list all available commands',
    whoami: 'view developer profile summary',
    about: 'read full bio & education',
    experience: 'work history & internships',
    awards: 'honors & certifications',
    skills: 'skill proficiency bars',
    projects: 'list portfolio projects',
    'open <id>': 'open project case study modal',
    'avatar <anim>': 'animate the live companion',
    'say <text>': 'make the companion speak',
    'theme <name>': 'switch theme (crimson, cyber, emerald, gold, light)',
    'goto <section>': 'scroll to a section',
    'ascii <text>': 'render blocky ASCII art',
    matrix: 'toggle Matrix rain easter egg',
    'sound on|off': 'toggle ambient Web Audio synth',
    contact: 'display contact links',
    clear: 'clear terminal output',
  }

  const commands = {
    help: () =>
      print(
        Object.entries(help)
          .map(([k, v]) => `  <span class="t-acc">${k.padEnd(16)}</span><span class="t-dim">${v}</span>`)
          .join('\n')
      ),
    whoami: () =>
      print(
        `<span class="t-acc">${esc(profile.name)}</span> — ${esc(profile.roles[0])} · ${esc(profile.location)}\n` +
          `${esc(profile.education.degree)} @ ${esc(profile.education.school)} (CGPA ${esc(profile.education.cgpa)})`
      ),
    about: () => print(profile.about.map(esc).join('\n\n')),
    experience: () =>
      print(
        profile.experience
          .map(e => `  <span class="t-acc2">${esc(e.period.padEnd(20))}</span> <b>${esc(e.role)}</b> — ${esc(e.org)}`)
          .join('\n')
      ),
    awards: () =>
      print(
        profile.awards
          .map(a => `  <span class="t-acc">[${esc(a.badge)}]</span> ${esc(a.title)} <span class="t-dim">(${esc(a.org)})</span>`)
          .join('\n')
      ),
    skills: () =>
      print(
        skills
          .map(
            s =>
              `  ${esc(s.name.padEnd(18))} <span class="t-acc">${'█'.repeat(Math.round(s.level / 5))}</span><span class="t-dim">${'░'.repeat(
                20 - Math.round(s.level / 5)
              )}</span> ${s.level}%`
          )
          .join('\n')
      ),
    projects: () =>
      print(
        projects.map(p => `  <span class="t-acc2">${esc(p.id.padEnd(18))}</span> ${esc(p.title)} <span class="t-dim">(${esc(p.year)})</span>`).join('\n') +
          '\n\n<span class="t-dim">tip: run</span> <span class="t-acc">open cashflow-8</span> <span class="t-dim">or</span> <span class="t-acc">open pcad-bpms</span>'
      ),
    open: ([id]) => {
      const p = projects.find(x => x.id === id)
      if (!p) return print(`project not found: ${esc(id ?? '')} — try "projects"`, 't-err')
      app.openProject(p.id)
      print(`opening case study <span class="t-acc">${esc(p.title)}</span>…`)
    },
    goto: ([sec]) => {
      if (!app.goto(sec)) return print(`unknown section: ${esc(sec ?? '')}`, 't-err')
      print(`jumping to #${esc(sec)}…`)
    },
    theme: ([name]) => {
      if (!name) return print(`themes: ${Object.keys(app.themes).join(', ')} (current: <span class="t-acc">${app.theme}</span>)`)
      if (!app.setTheme(name)) return print(`unknown theme: ${esc(name)}`, 't-err')
      const th = app.themes[name]
      print(`switched theme → <span class="t-acc">${th.icon} ${esc(th.name)}</span>`)
    },
    avatar: ([a]) => {
      if (!a || a === 'list') return print(`animations:\n  ${ANIMATIONS.join(', ')}\n\nexpressions:\n  ${EXPRESSIONS.slice(0, 14).join(', ')}…`)
      if (ANIMATIONS.includes(a)) {
        app.companion.react(a, 3400, `Playing "${a}"!`)
        return print(`avatar.play('${esc(a)}') <span class="t-acc">→ ok</span>`)
      }
      if (EXPRESSIONS.includes(a)) {
        app.companion.express(a, 3400)
        return print(`avatar.setExpression('${esc(a)}') <span class="t-acc">→ ok</span>`)
      }
      print(`unknown animation/expression: "${esc(a)}" — run "avatar list"`, 't-err')
    },
    say: args => {
      const t = args.join(' ') || 'Hello from Kaazhim!'
      app.companion.react('happy', 3400, t)
      print(`companion: "${esc(t)}"`)
    },
    ascii: args => {
      const t = (args.join(' ') || 'KAAZHIM').slice(0, 14)
      print(`<span class="t-acc ascii-out">${esc(textToAscii(t))}</span>`)
    },
    matrix: () => {
      app.matrix()
      print('toggling Matrix rain protocol…', 't-acc')
    },
    sound: ([v]) => {
      const on = audio.toggle(v === 'on' ? true : v === 'off' ? false : undefined)
      app.syncSound()
      print(`audio synth ${on ? 'ENABLED ♪' : 'MUTED'}`)
    },
    contact: () =>
      print(
        `email    <span class="t-acc">${esc(profile.email)}</span>\n` +
          `phone    <span class="t-acc">${esc(profile.phone)}</span>\n` +
          `location ${esc(profile.location)}\n` +
          profile.socials.map(s => `${esc(s.label.padEnd(9))}<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a>`).join('\n')
      ),
    clear: () => (out.innerHTML = ''),
    sudo: () => print('nice try — permission denied by Kaazhim firewall.', 't-err'),
  }

  function run(raw) {
    const line = raw.trim()
    print(`<span class="t-cmd"><b>kaazhim@portfolio:~$</b> ${esc(line)}</span>`)
    if (!line) return
    history.push(line)
    hIdx = history.length
    const [cmd, ...args] = line.split(/\s+/)
    const fn = commands[cmd.toLowerCase()]
    if (fn) fn(args)
    else print(`command not found: ${esc(cmd)} — type <span class="t-acc">help</span>`, 't-err')
  }

  form.addEventListener('submit', e => {
    e.preventDefault()
    audio.click()
    run(input.value)
    input.value = ''
  })

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') {
      hIdx = Math.max(0, hIdx - 1)
      input.value = history[hIdx] ?? ''
      e.preventDefault()
    } else if (e.key === 'ArrowDown') {
      hIdx = Math.min(history.length, hIdx + 1)
      input.value = history[hIdx] ?? ''
      e.preventDefault()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const parts = input.value.split(' ')
      let pool = Object.keys(commands)
      if (parts.length > 1) {
        const c = parts[0].toLowerCase()
        pool =
          c === 'avatar'
            ? [...ANIMATIONS, 'list']
            : c === 'theme'
            ? Object.keys(app.themes)
            : c === 'open'
            ? projects.map(p => p.id)
            : c === 'goto'
            ? ['home', 'about', 'skills', 'projects', 'avatar-lab', 'experience', 'terminal', 'contact']
            : []
      }
      const last = parts[parts.length - 1]
      const m = pool.filter(k => k.startsWith(last))
      if (m.length === 1) {
        parts[parts.length - 1] = m[0]
        input.value = parts.join(' ') + ' '
      } else if (m.length > 1) print(`<span class="t-dim">${m.join('  ')}</span>`)
    }
  })

  document.querySelectorAll('[data-term-cmd]').forEach(btn => {
    btn.addEventListener('click', () => {
      audio.click()
      run(btn.dataset.termCmd)
    })
  })

  document.getElementById('term').addEventListener('click', e => {
    if (!e.target.closest('button, a')) input.focus({ preventScroll: true })
  })

  print(
    `<span class="t-acc ascii-out">${esc(textToAscii('KAAZHIM'))}</span>\n` +
      `<span class="t-dim">interactive portfolio shell v2.0 — Kaazhim Nur Kaarim</span>\n` +
      `type <span class="t-acc">help</span> or click a quick command below. try <span class="t-acc2">avatar celebrate</span> or <span class="t-acc2">matrix</span>.\n`
  )
  return { run }
}
