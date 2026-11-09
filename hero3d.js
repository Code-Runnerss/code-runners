// Hero scene for Code Runners: a 3D Shopify bag on a glowing podium with an
// orange orbit ring and floating storefront / Liquid / cart panels — the same
// composition as the @code_runners campaign posts. Built from primitives (no
// model downloads), lighter on small screens and paused when off-screen.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const canvas = document.getElementById('hero-canvas');
const host = canvas && canvas.parentElement;
const hero = document.querySelector('.hero');

if (canvas && host) init();

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err) {
    document.documentElement.classList.add('no-webgl');
    return;
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = innerWidth < 760;
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

  /* ---------- Lights ---------- */
  scene.add(new THREE.HemisphereLight(0xfff4ea, 0x1a1410, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(-2, 4, 5); scene.add(key);
  const rimR = new THREE.DirectionalLight(0xff6a00, 3); rimR.position.set(4, 1.5, -2); scene.add(rimR);
  const rimL = new THREE.DirectionalLight(0xff8f1f, 2.5); rimL.position.set(-4, 0.5, -3); scene.add(rimL);
  const under = new THREE.PointLight(0xff6a00, 10, 6, 2); under.position.set(0, -0.6, 1.8); scene.add(under);

  const stage = new THREE.Group();
  scene.add(stage);

  /* ---------- Podium ---------- */
  const podium = new THREE.Group();
  podium.position.y = -1.05;
  stage.add(podium);
  const podiumMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.35, metalness: 0.5 });
  podium.add(new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.6, 0.46, 72), podiumMat));
  const glowRing = (r, y, op) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.022, 10, 120), new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: op, toneMapped: false }));
    m.rotation.x = Math.PI / 2; m.position.y = y;
    podium.add(m);
    return m;
  };
  glowRing(1.55, 0.23, 1);
  glowRing(1.6, -0.23, 0.35);

  /* ---------- Shopify bag ---------- */
  const bag = new THREE.Group();
  stage.add(bag);
  const W = 1.3, H = 1.45, D = 0.62;
  const bodyGeo = new RoundedBoxGeometry(W, H, D, 5, 0.07);
  const pos = bodyGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setX(i, pos.getX(i) * (1 - 0.14 * ((pos.getY(i) + H / 2) / H)));
  bodyGeo.computeVertexNormals();
  const green = new THREE.MeshStandardMaterial({ color: 0x5f9e2a, roughness: 0.5 });
  bag.add(new THREE.Mesh(bodyGeo, green));
  const top = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.8, D * 0.78), new THREE.MeshStandardMaterial({ color: 0x3f6418, roughness: 0.8 }));
  top.rotation.x = -Math.PI / 2; top.position.y = H / 2 + 0.002;
  bag.add(top);
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x6aa52e, roughness: 0.45 });
  for (const z of [0.2, -0.2]) {
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.045, 14, 40, Math.PI), handleMat);
    h.position.set(0, H / 2 - 0.02, z);
    bag.add(h);
  }
  // white "S" mark, drawn once fonts are ready
  const sCanvas = document.createElement('canvas');
  sCanvas.width = sCanvas.height = 256;
  const sTex = new THREE.CanvasTexture(sCanvas);
  sTex.colorSpace = THREE.SRGBColorSpace;
  const sMark = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.86), new THREE.MeshBasicMaterial({ map: sTex, transparent: true, toneMapped: false }));
  sMark.position.set(0, -0.06, D / 2 + 0.004);
  bag.add(sMark);
  const drawS = () => {
    const g = sCanvas.getContext('2d');
    g.clearRect(0, 0, 256, 256);
    g.fillStyle = '#ffffff';
    g.font = 'italic 900 230px Montserrat, "Arial Black", Arial, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('S', 132, 140);
    sTex.needsUpdate = true;
    if (reduce) renderer.render(scene, camera);
  };
  drawS();
  document.fonts?.ready.then(drawS);
  bag.position.y = -0.1;
  bag.rotation.y = -0.45;

  // CR logo on the podium front
  new THREE.TextureLoader().load('assets/cr-logo.png', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
    logo.position.set(0, 0, 1.585);
    podium.add(logo);
    if (reduce) renderer.render(scene, camera);
  });

  /* ---------- Orbit ring + glow ---------- */
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.016, 8, 160), new THREE.MeshBasicMaterial({ color: 0xff8f1f, transparent: true, opacity: 0.9, toneMapped: false }));
  orbit.rotation.set(1.3, 0.25, 0);
  orbit.position.y = 0.35;
  stage.add(orbit);
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d'); const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, 'rgba(255,106,0,.9)'); grd.addColorStop(0.45, 'rgba(255,106,0,.22)'); grd.addColorStop(1, 'rgba(255,106,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  })();
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.6 }));
  glow.scale.set(6, 6, 1); glow.position.set(0, -0.2, -2.5);
  stage.add(glow);
  const floorGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5 }));
  floorGlow.scale.set(5, 1.1, 1); floorGlow.position.set(0, -1.32, 0.4);
  stage.add(floorGlow);

  /* ---------- Floating UI panels ---------- */
  const panel = (draw, w = 512, h = 340) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 26); g.closePath();
    g.save(); g.clip(); draw(g, w, h); g.restore();
    g.lineWidth = 4; g.strokeStyle = 'rgba(255,106,0,.9)'; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 26); g.stroke();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2 * h / w), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
    scene.add(mesh);
    return mesh;
  };
  const dots = (g) => ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(34 + i * 22, 30, 7, 0, 7); g.fill(); });
  const bar = (g, x, y, w, h, c) => { g.fillStyle = c; g.beginPath(); g.roundRect(x, y, w, h, h / 2); g.fill(); };
  const font = (wgt, px) => `${wgt} ${px}px Montserrat, Arial, sans-serif`;

  const store = panel((g, w, h) => {
    g.fillStyle = '#111111'; g.fillRect(0, 0, w, h); dots(g);
    g.fillStyle = '#1d1d1d'; g.beginPath(); g.roundRect(34, 62, 220, 240, 18); g.fill();
    const grd = g.createRadialGradient(144, 182, 10, 144, 182, 100); grd.addColorStop(0, '#ffc49f'); grd.addColorStop(0.45, '#ff6a00'); grd.addColorStop(1, '#3a1406');
    g.fillStyle = grd; g.beginPath(); g.arc(144, 182, 70, 0, 7); g.fill();
    g.fillStyle = '#ffffff'; g.font = font(800, 28); g.fillText('New Collection', 276, 104);
    g.fillStyle = '#ff6a00'; g.font = font(800, 26); g.fillText('$68.00', 276, 146);
    bar(g, 276, 172, 190, 12, '#353535'); bar(g, 276, 196, 140, 12, '#353535');
    bar(g, 276, 244, 196, 46, '#ff6a00');
    g.fillStyle = '#ffffff'; g.font = font(700, 18); g.fillText('ADD TO CART', 312, 274);
  });
  const code = panel((g, w, h) => {
    g.fillStyle = '#0c0c0c'; g.fillRect(0, 0, w, h); dots(g);
    g.font = '500 21px "Courier New", monospace';
    const lines = [
      [['{% schema %}', '#ff8f1f']],
      [['{ ', '#d9d9d9'], ['"name"', '#a8d8a0'], [': ', '#d9d9d9'], ['"Checkout"', '#a8d8a0'], [',', '#d9d9d9']],
      [['  ', '#d9d9d9'], ['"target"', '#a8d8a0'], [':', '#d9d9d9']],
      [['  ', '#d9d9d9'], ['"purchase.checkout"', '#ffd479']],
      [['}', '#d9d9d9']],
      [['{% endschema %}', '#ff8f1f']],
      [['{{ ', '#ff8f1f'], ['cart.total_price', '#9ecbff'], [' | money }}', '#ff8f1f']],
    ];
    lines.forEach((parts, i) => { let x = 30; parts.forEach(([t, c]) => { g.fillStyle = c; g.fillText(t, x, 92 + i * 36); x += g.measureText(t).width; }); });
  });
  const cart = panel((g, w, h) => {
    g.fillStyle = '#f5f2ec'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#121212'; g.font = font(800, 28); g.fillText('Secure Checkout', 32, 58);
    [['Gift wrap', '+$5.00', true], ['Delivery date', 'Fri, 14', false]].forEach(([t, v, check], i) => {
      const y = 88 + i * 70;
      g.strokeStyle = i === 0 ? '#ff6a00' : '#d9d3c8'; g.lineWidth = 3; g.beginPath(); g.roundRect(32, y, w - 64, 56, 12); g.stroke();
      if (check) { g.fillStyle = '#ff6a00'; g.beginPath(); g.roundRect(48, y + 16, 24, 24, 6); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(54, y + 28); g.lineTo(59, y + 33); g.lineTo(67, y + 23); g.stroke(); }
      g.fillStyle = '#121212'; g.font = font(700, 20); g.fillText(t, check ? 86 : 52, y + 35);
      g.fillStyle = '#6e6a62'; g.font = font(600, 18); g.fillText(v, w - 140, y + 35);
    });
    g.fillStyle = '#ff6a00'; g.beginPath(); g.roundRect(32, 248, w - 64, 56, 14); g.fill();
    g.fillStyle = '#fff'; g.font = font(800, 21); g.fillText('Pay Now  →', w / 2 - 60, 284);
  });
  const panels = [store, code, cart];

  /* ---------- Particles ---------- */
  const N = small ? 90 : 200;
  const pts = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 2.2 + Math.random() * 2.6, t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1);
    pts.set([r * Math.sin(p) * Math.cos(t), r * Math.cos(p) * 0.7, r * Math.sin(p) * Math.sin(t) - 1.4], i * 3);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xff7a1a, size: 0.035, transparent: true, opacity: 0.85, depthWrite: false }));
  scene.add(particles);

  /* ---------- Layout ---------- */
  let baseZ = 8;
  const layout = () => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    baseZ = Math.max(7.6, 2.55 / (camera.aspect * Math.tan(THREE.MathUtils.degToRad(16))));
    camera.position.set(0, 0.35, baseZ);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    const narrow = camera.aspect < 1.05;
    const spots = narrow
      ? [[-1.55, 1.45, -1.3, 0.6, 0.35], [1.6, 1.15, -1.8, 0.6, -0.35], [1.55, -0.85, -0.2, 0.52, -0.3]]
      : [[-1.85, 1.4, -1.3, 0.7, 0.35], [1.9, 1.25, -1.8, 0.7, -0.35], [1.85, -0.95, -0.3, 0.62, -0.3]];
    panels.forEach((m, i) => {
      const [x, y, z, s, ry] = spots[i];
      m.userData.base = { x, y, z, ry };
      m.position.set(x, y, z); m.scale.setScalar(s); m.rotation.y = ry;
    });
  };

  /* ---------- Interaction + loop ---------- */
  let tx = 0, ty = 0, mx = 0, my = 0, sp = 0;
  addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth) * 2 - 1; ty = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
  const clock = new THREE.Clock();
  const frame = () => {
    const t = clock.getElapsedTime();
    mx += (tx - mx) * 0.05;
    my += (ty - my) * 0.05;
    const target = hero ? Math.min(1, Math.max(0, scrollY / hero.offsetHeight)) : 0;
    sp += (target - sp) * 0.1;

    bag.rotation.y = -0.45 + Math.sin(t * 0.5) * 0.18 + mx * 0.5 + sp * 1.2;
    bag.rotation.x = my * 0.08;
    bag.position.y = -0.1 + Math.sin(t * 1.2) * 0.06 + sp * 0.5;
    stage.rotation.y = mx * 0.12;
    orbit.rotation.z = t * 0.35;
    panels.forEach((m, i) => {
      const b = m.userData.base;
      m.position.x = b.x * (1 + sp * 0.6);
      m.position.y = b.y + Math.sin(t * 0.8 + i * 2.1) * 0.08 + sp * 0.4;
      m.rotation.y = b.ry + mx * 0.12;
      m.rotation.x = -my * 0.06;
    });
    particles.rotation.y = t * 0.04;
    camera.position.z = baseZ + sp * 1.5;
    renderer.render(scene, camera);
  };

  layout();
  addEventListener('resize', () => { layout(); if (reduce) frame(); });
  if (reduce) { frame(); return; }
  let visible = true;
  const run = () => renderer.setAnimationLoop(visible && !document.hidden ? frame : null);
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; run(); }).observe(host);
  document.addEventListener('visibilitychange', run);
  run();
}
