// Hero scene: a still poster always; the three.js workshop (an iframe, ~200 KB gzipped of three.js plus the scene)
// loads only on screens wider than 640px with motion allowed and no Save-Data. Phones and reduced motion keep the poster.
// Pauses the animation when the hero is off-screen or the tab is hidden; shows what it's machining.
const frame = document.getElementById('heroScene'), now = document.getElementById('now'), nav = document.getElementById('nav')
const hero = frame && frame.closest('.hero')
const still = matchMedia('(max-width: 640px), (prefers-reduced-motion: reduce)')
const saveData = !!(navigator.connection && navigator.connection.saveData)
let visible = true, started = false
function start () {
  if (started || !frame || still.matches || saveData || !frame.dataset.src) return
  started = true
  frame.src = frame.dataset.src
  // Show the scene once it has drawn (first stage message), or a few seconds after load if no message arrives.
  frame.addEventListener('load', () => setTimeout(() => hero.classList.add('live'), 4000), { once: true })
}
start()
still.addEventListener('change', start)
const post = (type) => { try { if (started) frame.contentWindow.postMessage({ type }, '*') } catch {} }
if (frame) new IntersectionObserver(([e]) => { visible = e.isIntersecting; post(visible && !document.hidden ? 'resume' : 'pause') }, { threshold: .05 }).observe(frame)
document.addEventListener('visibilitychange', () => post(document.hidden || !visible ? 'pause' : 'resume'))
addEventListener('message', (e) => {
  if (!frame || e.source !== frame.contentWindow || e.data?.type !== 'career-stage') return
  hero.classList.add('live')
  if (!now) return
  const b = document.createElement('b'); b.textContent = String(e.data.n)
  const dot = document.createElement('i'); if (e.data.ai) dot.className = 'ai'
  now.replaceChildren(dot, String(e.data.y) + ' · ', b, ' — ' + String(e.data.k))
})
addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > 40), { passive: true })
