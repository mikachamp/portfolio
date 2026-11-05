// Hero scene: pause the animation when the hero is off-screen or the tab is hidden; show what it's machining
const frame = document.getElementById('heroScene'), now = document.getElementById('now'), nav = document.getElementById('nav')
let visible = true
const post = (type) => { try { frame.contentWindow.postMessage({ type }, '*') } catch {} }
new IntersectionObserver(([e]) => { visible = e.isIntersecting; post(visible && !document.hidden ? 'resume' : 'pause') }, { threshold: .05 }).observe(frame)
document.addEventListener('visibilitychange', () => post(document.hidden || !visible ? 'pause' : 'resume'))
addEventListener('message', (e) => {
  if (e.source !== frame.contentWindow || e.data?.type !== 'career-stage') return
  const b = document.createElement('b'); b.textContent = String(e.data.n)
  const dot = document.createElement('i'); if (e.data.ai) dot.className = 'ai'
  now.replaceChildren(dot, String(e.data.y) + ' · ', b, ' — ' + String(e.data.k))
})
addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > 40), { passive: true })
