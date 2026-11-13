// Back + Home bar: Back returns to the page the visitor came from on this site, else follows the parent link.
(() => {
  const bar = document.querySelector('.pgback')
  if (!bar) return
  if (window.top !== window) { bar.remove(); return } // inside the home-page hero frame
  const back = bar.querySelector('[data-back]')
  if (!back) return
  let same = false
  try { same = !!document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1 } catch (e) { same = false }
  if (same) back.addEventListener('click', (e) => { e.preventDefault(); history.back() })
})()
