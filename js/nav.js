// Projects dropdown (disclosure button) and the status filter on projects.html
(() => {
  const btn = document.querySelector('.ddbtn'), menu = document.getElementById('ddmenu')
  if (btn && menu) {
    const items = () => [...menu.querySelectorAll('a')]
    const set = (open, focus) => { menu.hidden = !open; btn.setAttribute('aria-expanded', String(open)); if (open && focus) items()[0].focus() }
    btn.addEventListener('click', () => set(menu.hidden))
    btn.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); if (e.key === 'ArrowDown') { e.preventDefault(); set(true, true) } })
    menu.addEventListener('keydown', (e) => {
      const a = items(), i = a.indexOf(document.activeElement)
      if (e.key === 'Escape') { set(false); btn.focus() }
      else if (e.key === 'ArrowDown') { e.preventDefault(); a[(i + 1) % a.length].focus() }
      else if (e.key === 'ArrowUp') { e.preventDefault(); a[(i - 1 + a.length) % a.length].focus() }
      else if (e.key === 'Home') { e.preventDefault(); a[0].focus() }
      else if (e.key === 'End') { e.preventDefault(); a[a.length - 1].focus() }
    })
    btn.parentNode.addEventListener('focusout', (e) => { if (e.relatedTarget && !btn.parentNode.contains(e.relatedTarget)) set(false) })
    document.addEventListener('click', (e) => { if (!btn.parentNode.contains(e.target)) set(false) })
    menu.addEventListener('click', () => set(false))
  }
  const fs = document.querySelectorAll('.filters button')
  fs.forEach((b) => b.addEventListener('click', () => {
    fs.forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)) })
    document.querySelectorAll('.pcard').forEach((c) => { c.hidden = b.dataset.f !== 'all' && c.dataset.status !== b.dataset.f })
  }))
})()
