import { pointer, lerp, reduceMotion } from './util.js'

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`
const FRAG = `
precision highp float;
uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse; uniform float u_scroll; uniform float u_pulse; uniform float u_light;
uniform vec3 u_c1; uniform vec3 u_c2; uniform vec3 u_c3;
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0., a=.5; mat2 m=mat2(1.6,1.2,-1.2,1.6); for(int i=0;i<5;i++){ v+=a*noise(p); p=m*p; a*=.5; } return v; }
float stars(vec2 uv, float scale, float t){
  vec2 g = uv*scale; vec2 id = floor(g); vec2 f = fract(g)-.5;
  float h = hash(id); if(h < .925) return 0.;
  vec2 o = vec2(hash(id+1.3), hash(id+7.1))-.5; float d = length(f - o*.7);
  float tw = .55 + .45*sin(t*(1.4+h*4.) + h*40.);
  return smoothstep(.055, 0., d) * tw * (h-.925)*13.0;
}
void main(){
  vec2 uv = (gl_FragCoord.xy - .5*u_res) / u_res.y;
  vec2 m = (u_mouse - .5*u_res) / u_res.y;
  float t = u_time*.035;
  uv += m*.035;
  uv.y += u_scroll*.22;
  vec2 q = vec2(fbm(uv*1.3 + t), fbm(uv*1.3 + vec2(5.2,1.3) - t));
  vec2 r = vec2(fbm(uv*1.5 + 2.6*q + vec2(1.7,9.2) + t*1.2), fbm(uv*1.5 + 2.6*q + vec2(8.3,2.8) - t));
  float f = fbm(uv*1.1 + 3.0*r);

  vec3 darkCol = mix(vec3(.02,.025,.05), u_c2*.42, smoothstep(.22,.82,f));
  darkCol = mix(darkCol, u_c1*.52, smoothstep(.45,.95,length(q))*.48);
  darkCol = mix(darkCol, u_c3*.45, smoothstep(.58,1.08,r.x)*.35);
  darkCol *= .45 + f*f*1.35;
  float md = length(uv - m - vec2(0., u_scroll*.22));
  darkCol += u_c1 * .11 * exp(-md*md*8.) * (1. + u_pulse*2.5);
  float s = stars(uv + vec2(t*.5, 0.), 56., u_time) + stars(uv*1.6 + vec2(t,2.), 88., u_time)*.7;
  darkCol += vec3(s) * mix(vec3(1.), u_c1, .35);
  vec2 vu = gl_FragCoord.xy / u_res;
  darkCol *= .62 + .38*pow(16.*vu.x*vu.y*(1.-vu.x)*(1.-vu.y), .25);
  darkCol += u_pulse * .07 * u_c2;

  vec3 lightCol = vec3(.965, .97, .988);
  lightCol = mix(lightCol, mix(vec3(1.), u_c1, .14), smoothstep(.35,.9,f));
  lightCol = mix(lightCol, mix(vec3(1.), u_c2, .12), smoothstep(.5,1.0,length(q)));
  lightCol -= (1. - exp(-md*md*7.)) * 0.015;

  vec3 finalCol = mix(pow(darkCol, vec3(.92)), lightCol, u_light);
  gl_FragColor = vec4(finalCol, 1.);
}`

const hex = h => {
  const n = parseInt(h.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export function createNebula(canvas, initialColors, initialLight = false) {
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false })
  if (!gl || reduceMotion()) {
    return { setColors() {}, setLight() {}, pulse() {}, stop() {}, start() {} }
  }
  const sh = (type, src) => {
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
  }
  const prog = gl.createProgram()
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    return { setColors() {}, setLight() {}, pulse() {}, stop() {}, start() {} }
  }
  gl.useProgram(prog)
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'p')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const U = n => gl.getUniformLocation(prog, n)
  const u = {
    res: U('u_res'),
    time: U('u_time'),
    mouse: U('u_mouse'),
    scroll: U('u_scroll'),
    pulse: U('u_pulse'),
    light: U('u_light'),
    c1: U('u_c1'),
    c2: U('u_c2'),
    c3: U('u_c3'),
  }

  let cur = initialColors.map(hex)
  let target = cur.map(c => [...c])
  let lightCur = initialLight ? 1 : 0
  let lightTarget = lightCur
  let mouse = [0, 0], scroll = 0, pulse = 0, running = true, raf
  const scale = 0.5
  const resize = () => {
    canvas.width = Math.max(1, Math.round(innerWidth * scale))
    canvas.height = Math.max(1, Math.round(innerHeight * scale))
    gl.viewport(0, 0, canvas.width, canvas.height)
  }
  resize()
  addEventListener('resize', resize)
  const t0 = performance.now()

  function frame(now) {
    if (!running) return
    raf = requestAnimationFrame(frame)
    for (let i = 0; i < 3; i++) for (let k = 0; k < 3; k++) cur[i][k] = lerp(cur[i][k], target[i][k], 0.04)
    lightCur = lerp(lightCur, lightTarget, 0.06)
    mouse[0] = lerp(mouse[0], pointer.x * scale, 0.06)
    mouse[1] = lerp(mouse[1], (innerHeight - pointer.y) * scale, 0.06)
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight)
    scroll = lerp(scroll, scrollY / max, 0.08)
    pulse = lerp(pulse, 0, 0.04)
    gl.uniform2f(u.res, canvas.width, canvas.height)
    gl.uniform1f(u.time, (now - t0) / 1000)
    gl.uniform2f(u.mouse, mouse[0], mouse[1])
    gl.uniform1f(u.scroll, scroll)
    gl.uniform1f(u.pulse, pulse)
    gl.uniform1f(u.light, lightCur)
    gl.uniform3fv(u.c1, cur[0])
    gl.uniform3fv(u.c2, cur[1])
    gl.uniform3fv(u.c3, cur[2])
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  raf = requestAnimationFrame(frame)
  return {
    setColors(cols) { target = cols.map(hex) },
    setLight(isLight) { lightTarget = isLight ? 1 : 0 },
    pulse(v = 1) { pulse = v },
    stop() { running = false; cancelAnimationFrame(raf) },
    start() { if (!running) { running = true; raf = requestAnimationFrame(frame) } },
  }
}

export function createParticleDust(canvas, getColors) {
  if (reduceMotion()) return { burst() {}, stop() {}, start() {} }
  const ctx = canvas.getContext('2d')
  const glyphs = '·•+×✦◇○⋆'
  let parts = [], sparks = [], running = true, raf, W = 0, H = 0, dpr = 1
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2)
    W = innerWidth; H = innerHeight
    canvas.width = W * dpr; canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const n = Math.min(72, Math.round((W * H) / 22000))
    parts = Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -0.06 - Math.random() * 0.22,
      s: 9 + Math.random() * 9,
      ch: glyphs[(Math.random() * glyphs.length) | 0],
      a: 0.14 + Math.random() * 0.36,
      ci: (Math.random() * 3) | 0,
      ph: Math.random() * 6.28,
    }))
  }
  resize()
  addEventListener('resize', resize)
  let lastScroll = scrollY

  function frame(now) {
    if (!running) return
    raf = requestAnimationFrame(frame)
    ctx.clearRect(0, 0, W, H)
    const cols = getColors()
    const ds = scrollY - lastScroll
    lastScroll = scrollY
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (const p of parts) {
      const dx = p.x - pointer.x, dy = p.y - pointer.y
      const d2 = dx * dx + dy * dy
      if (d2 < 20000) {
        const f = (1 - d2 / 20000) * 0.55
        const d = Math.sqrt(d2) || 1
        p.vx += (dx / d) * f
        p.vy += (dy / d) * f
      }
      p.vx *= 0.96
      p.vy = p.vy * 0.96 + (-0.12 - p.vy) * 0.02
      p.x += p.vx
      p.y += p.vy - ds * 0.14 * (p.s / 18)
      if (p.y < -20) p.y = H + 20
      if (p.y > H + 20) p.y = -20
      if (p.x < -20) p.x = W + 20
      if (p.x > W + 20) p.x = -20
      ctx.globalAlpha = p.a * (0.55 + 0.45 * Math.sin(now / 750 + p.ph))
      ctx.fillStyle = cols[p.ci]
      ctx.font = `${p.s}px 'JetBrains Mono', monospace`
      ctx.fillText(p.ch, p.x, p.y)
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]
      s.x += s.vx; s.y += s.vy; s.vy += 0.08; s.life -= 0.024
      if (s.life <= 0) { sparks.splice(i, 1); continue }
      ctx.globalAlpha = s.life
      ctx.fillStyle = s.color
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r * s.life, 0, 6.28)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }
  raf = requestAnimationFrame(frame)
  return {
    burst(x = innerWidth / 2, y = innerHeight / 2, count = 28) {
      const cols = getColors()
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = 1.5 + Math.random() * 5.2
        sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, r: 2 + Math.random() * 3, life: 1, color: cols[i % cols.length] })
      }
    },
    stop() { running = false; cancelAnimationFrame(raf) },
    start() { if (!running) { running = true; raf = requestAnimationFrame(frame) } },
  }
}

export function createMatrix(canvas) {
  const ctx = canvas.getContext('2d')
  const chars = 'KAAZHIM01アイウエオSQLPYTHONJAVA<>◈✦'
  let drops = [], timer = null, active = false
  const start = (ms = 6000) => {
    canvas.width = innerWidth
    canvas.height = innerHeight
    const cols = Math.floor(canvas.width / 16)
    drops = Array(cols).fill(1)
    active = true
    canvas.classList.add('is-on')
    clearInterval(timer)
    timer = setInterval(() => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.09)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--c1').trim() || '#10b981'
      ctx.font = '14px "JetBrains Mono", monospace'
      for (let i = 0; i < drops.length; i++) {
        const ch = chars[(Math.random() * chars.length) | 0]
        ctx.fillText(ch, i * 16, drops[i] * 16)
        if (drops[i] * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      }
    }, 36)
    if (ms) setTimeout(stop, ms)
  }
  const stop = () => {
    active = false
    clearInterval(timer)
    canvas.classList.remove('is-on')
  }
  return { toggle: () => (active ? stop() : start(6500)), start, stop, get active() { return active } }
}

const FONT_5X7 = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10111', '10001', '10001', '01110'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '0': ['01110', '10011', '10101', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  ' ': ['000', '000', '000', '000', '000', '000', '000'],
}

export function textToAscii(text) {
  const chars = [...text.toUpperCase()]
  const lines = Array(7).fill('')
  for (let r = 0; r < 7; r++) {
    lines[r] = chars.map(ch => (FONT_5X7[ch] || FONT_5X7[' '])[r].replace(/1/g, '█').replace(/0/g, ' ')).join('  ')
  }
  return lines.join('\n')
}
