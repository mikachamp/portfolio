/* Scroll reveal: adds .rv-in once per element as it enters view, then unobserves. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var SEL = [
    'section:not(.hero) h2', 'section:not(.hero) .sublede', 'section:not(.hero) > .wrap > .eyebrow',
    '.project', '.pcard', '.mini', '.box', '.proof', '.role', '.timeline > *', '.cta', '.lab > *',
    '.col > *', 'main > .col'
  ].join(',');
  var list = [].slice.call(d.querySelectorAll(SEL)).filter(function (el) {
    // skip hero, nested duplicates (a target inside another target)
    if (el.closest('.hero, canvas')) return false;
    return true;
  });
  // second pass for nesting in DOM order
  var targets = [];
  list.forEach(function (el) {
    for (var i = 0; i < targets.length; i++) if (targets[i].contains(el)) return;
    targets.push(el);
  });
  if (!targets.length) return;
  var vh = window.innerHeight || 800, counts = new Map();
  var io = new IntersectionObserver(function (ents) {
    ents.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  targets.forEach(function (el) {
    var r = el.getBoundingClientRect();
    el.classList.add('rv');
    if (r.top < vh * 0.92 && r.bottom > 0) { el.classList.add('rv-in', 'rv-now'); return; }
    var par = el.parentElement, n = counts.get(par) || 0;
    counts.set(par, n + 1);
    if (n) el.style.setProperty('--rv-d', Math.min(n, 5) * 70 + 'ms');
    io.observe(el);
  });
  root.classList.add('js-reveal');
})();
