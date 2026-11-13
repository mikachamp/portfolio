// "How it connects": a light 3D graph of projects, skill areas and learning sources.
// Labels only. Data is the hand-checked data/graph.json (never read from the vault).
// Phones and reduced motion get a simple 2D list instead of WebGL.
const box = document.getElementById('graph');
if (box) init();

async function init() {
  let data;
  try { data = await (await fetch('data/graph.json')).json(); } catch (e) { return; }
  const byId = Object.fromEntries(data.nodes.map(n => [n.id, n]));
  const small = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (small || still || !webgl()) return flat(data, byId);
  try { await three(data, byId); } catch (e) { flat(data, byId); }
}

function webgl() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

// 2D fallback: each skill area and learning source with the projects it links to.
function flat(data, byId) {
  box.classList.add('flat');
  const hubs = data.nodes.filter(n => n.type !== 'project');
  const ul = document.createElement('ul');
  ul.className = 'gflat';
  for (const h of hubs) {
    const li = document.createElement('li');
    const b = document.createElement('b'); b.className = 't-' + h.type; b.textContent = h.label; li.appendChild(b);
    const wrap = document.createElement('span');
    for (const [a, z] of data.links) {
      const other = a === h.id ? z : z === h.id ? a : null;
      if (!other) continue;
      const n = byId[other];
      const el = document.createElement(n.href ? 'a' : 'span');
      if (n.href) el.href = n.href;
      el.className = 't-' + n.type; el.textContent = n.label; wrap.appendChild(el);
    }
    li.appendChild(wrap); ul.appendChild(li);
  }
  box.appendChild(ul);
}

async function three(data, byId) {
  const THREE = await import('../vendor/three/three.module.js');
  const nodes = data.nodes, N = nodes.length;
  const idx = Object.fromEntries(nodes.map((n, i) => [n.id, i]));
  const edges = data.links.map(([a, b]) => [idx[a], idx[b]]);

  // Tiny deterministic force layout, run once.
  const P = nodes.map((n, i) => {
    const r = n.type === 'project' ? 5 : 2, t = i * 2.399, y = 1 - (2 * (i + .5)) / N;
    const s = Math.sqrt(1 - y * y);
    return new THREE.Vector3(Math.cos(t) * s * r, y * r, Math.sin(t) * s * r);
  });
  const d = new THREE.Vector3();
  for (let it = 0; it < 300; it++) {
    const F = P.map(() => new THREE.Vector3());
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      d.subVectors(P[i], P[j]); const l2 = Math.max(d.lengthSq(), .01);
      d.multiplyScalar(6 / l2 / Math.sqrt(l2)); F[i].add(d); F[j].sub(d);
    }
    for (const [a, b] of edges) {
      d.subVectors(P[b], P[a]); const l = d.length(); d.multiplyScalar((l - 3.4) * .06 / Math.max(l, .01));
      F[a].add(d); F[b].sub(d);
    }
    P.forEach((p, i) => { F[i].addScaledVector(p, -.01); p.addScaledVector(F[i], .5); });
  }
  const c = new THREE.Vector3(); P.forEach(p => c.add(p)); c.divideScalar(N); P.forEach(p => p.sub(c));
  // Lay the long axis sideways to fit the wide box, then frame the height.
  const ext = k => Math.max(...P.map(p => Math.abs(p[k])));
  if (ext('y') > ext('x')) P.forEach(p => p.set(p.y, p.x, p.z));
  P.forEach(p => { p.x *= 1.25; });
  const rad = Math.max(ext('y'), ext('x') / 2.6) + 1;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  box.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(40, 2, .1, 200);
  cam.position.set(0, 0, rad / Math.tan(Math.PI / 9) * 1.15);
  const group = new THREE.Group(); scene.add(group);

  const col = { skill: 0xff9d42, source: 0x7cc4ff, project: 0xeeece6 };
  const size = { skill: .55, source: .45, project: .3 };
  const geo = new THREE.SphereGeometry(1, 24, 16);
  const meshes = nodes.map((n, i) => {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col[n.type], transparent: true }));
    m.scale.setScalar(size[n.type]); m.position.copy(P[i]); m.userData.i = i; group.add(m); return m;
  });

  const lpos = new Float32Array(edges.length * 6), lcol = new Float32Array(edges.length * 6);
  edges.forEach(([a, b], k) => { P[a].toArray(lpos, k * 6); P[b].toArray(lpos, k * 6 + 3); });
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.BufferAttribute(lpos, 3));
  lg.setAttribute('color', new THREE.BufferAttribute(lcol, 3));
  group.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true })));

  const layer = document.createElement('div'); layer.className = 'glabels'; box.appendChild(layer);
  const labels = nodes.map(n => {
    const el = document.createElement('span'); el.className = 'gl t-' + n.type; el.textContent = n.label;
    layer.appendChild(el); return el;
  });

  let hover = -1;
  const dim = new THREE.Color(0x3a3d44), lit = new THREE.Color(0xff9d42), base = new THREE.Color(0x5b5f68);
  function paint() {
    const on = new Set([hover]);
    edges.forEach(([a, b], k) => {
      const hit = hover >= 0 && (a === hover || b === hover);
      if (hit) { on.add(a); on.add(b); }
      const cc = hover < 0 ? base : hit ? lit : dim;
      cc.toArray(lcol, k * 6); cc.toArray(lcol, k * 6 + 3);
    });
    lg.attributes.color.needsUpdate = true;
    meshes.forEach((m, i) => { const o = hover < 0 || on.has(i); m.material.opacity = o ? 1 : .25; labels[i].classList.toggle('dim', !o); labels[i].classList.toggle('hot', i === hover); });
    box.style.cursor = hover >= 0 && nodes[hover].href ? 'pointer' : 'default';
    need = true;
  }

  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  function pick(e) {
    const r = renderer.domElement.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, cam);
    const h = ray.intersectObjects(meshes)[0];
    return h ? h.object.userData.i : -1;
  }
  renderer.domElement.addEventListener('pointermove', e => { const i = pick(e); if (i !== hover) { hover = i; paint(); } });
  renderer.domElement.addEventListener('pointerleave', () => { hover = -1; paint(); });
  renderer.domElement.addEventListener('click', e => { const i = pick(e); if (i >= 0 && nodes[i].href) location.href = nodes[i].href; });

  function resize() {
    const w = box.clientWidth, h = box.clientHeight;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); need = true;
  }
  new ResizeObserver(resize).observe(box);

  let visible = true, need = true, last = performance.now(), raf = 0;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); }).observe(box);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) loop(); });

  const v = new THREE.Vector3();
  function render() {
    renderer.render(scene, cam);
    const w = box.clientWidth, h = box.clientHeight;
    meshes.forEach((m, i) => {
      m.getWorldPosition(v); const z = v.z; v.project(cam);
      const el = labels[i];
      el.style.transform = `translate(${(v.x * .5 + .5) * w}px, ${(-v.y * .5 + .5) * h}px) translate(-50%, ${nodes[i].type === 'project' ? '14px' : '20px'})`;
      el.style.zIndex = String(Math.round(100 + z * 5));
    });
  }
  function loop() {
    if (raf) return;
    raf = requestAnimationFrame(function tick(t) {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min(t - last, 50); last = t;
      if (hover < 0) group.rotation.y += dt * .00008;
      render(); need = false;
      loop();
    });
  }
  paint(); resize(); render(); box.classList.add('ready'); loop();
}
