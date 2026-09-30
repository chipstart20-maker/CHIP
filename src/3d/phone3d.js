// iPhone em 3D (Three.js). Gerado para assets/js/phone3d.min.js com:
//   npx esbuild src/3d/phone3d.js --bundle --minify --format=esm --outfile=assets/js/phone3d.min.js
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, Shape, ExtrudeGeometry, ShapeGeometry,
  CylinderGeometry, CircleGeometry, BoxGeometry, MeshPhysicalMaterial, MeshStandardMaterial,
  PMREMGenerator, TextureLoader, SRGBColorSpace, ACESFilmicToneMapping, DirectionalLight, AmbientLight, Color,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// medidas aproximadas do iPhone 16 (1 unidade ≈ 10 cm)
const W = 0.716, H = 1.476, D = 0.078, R = 0.112, BEVEL = 0.012;

function roundedRect(w, h, r) {
  const s = new Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

// plano com cantos arredondados e UV de 0 a 1 (para a textura da tela)
function panel(w, h, r) {
  const g = new ShapeGeometry(roundedRect(w, h, r), 24);
  const pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  return g;
}

export function mount(container, { screen, color }) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const canvas = renderer.domElement;
  canvas.className = 'phone3d';
  container.appendChild(canvas);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new DirectionalLight(0xffffff, 1.6); key.position.set(2, 3, 4); scene.add(key);
  const rim = new DirectionalLight(0x9fb4ff, 1.2); rim.position.set(-3, 1, -2); scene.add(rim);
  scene.add(new AmbientLight(0xffffff, 0.25));

  const camera = new PerspectiveCamera(28, 1, 0.1, 30);
  camera.position.set(0, 0, 4.3);

  // ---------- materiais ----------
  const frameMat = new MeshPhysicalMaterial({ metalness: 0.9, roughness: 0.25, clearcoat: 0.6, clearcoatRoughness: 0.15 });
  const backMat = new MeshPhysicalMaterial({ metalness: 0.05, roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.35 });
  const bumpMat = new MeshPhysicalMaterial({ metalness: 0.1, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 });
  const glassBlack = new MeshPhysicalMaterial({ color: 0x050507, metalness: 0.2, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04 });
  const lensMat = new MeshPhysicalMaterial({ color: 0x0a0c14, metalness: 0.4, roughness: 0.05, clearcoat: 1, iridescence: 0.6, iridescenceIOR: 1.6 });
  const lensTint = new MeshStandardMaterial({ color: 0x14224a, metalness: 0.6, roughness: 0.15, emissive: 0x0d1c55, emissiveIntensity: 0.6 });
  const flashMat = new MeshStandardMaterial({ color: 0xf4efe2, roughness: 0.35, emissive: 0x2a2616 });
  const screenMat = new MeshPhysicalMaterial({ color: 0x000000, roughness: 0.18, clearcoat: 0.35, clearcoatRoughness: 0.12, emissive: 0xffffff, emissiveIntensity: 1, envMapIntensity: 0.25 });

  new TextureLoader().load(screen, t => { t.colorSpace = SRGBColorSpace; t.anisotropy = 8; screenMat.emissiveMap = t; screenMat.needsUpdate = true; });

  // ---------- modelo ----------
  const phone = new Group();
  const bodyGeo = new ExtrudeGeometry(roundedRect(W - 2 * BEVEL, H - 2 * BEVEL, R - BEVEL), {
    depth: D - 2 * BEVEL, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL, bevelSegments: 6, curveSegments: 32,
  });
  bodyGeo.center();
  phone.add(new Mesh(bodyGeo, frameMat));

  // frente: vidro preto (borda) + tela
  const front = new Mesh(panel(W - 0.016, H - 0.016, R - 0.008), glassBlack);
  front.position.z = D / 2 + 0.0006; phone.add(front);
  const scr = new Mesh(panel(W - 0.052, H - 0.052, R - 0.03), screenMat);
  scr.position.z = D / 2 + 0.0012; phone.add(scr);

  // traseira: vidro fosco colorido
  const back = new Mesh(panel(W - 0.016, H - 0.016, R - 0.008), backMat);
  back.rotation.y = Math.PI; back.position.z = -D / 2 - 0.0006; phone.add(back);

  // módulo de câmeras (pílula vertical, canto superior esquerdo visto de trás)
  const cx = W / 2 - 0.165, cy = H / 2 - 0.235;
  const bumpGeo = new ExtrudeGeometry(roundedRect(0.19, 0.37, 0.095), {
    depth: 0.008, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 4, curveSegments: 32,
  });
  const bump = new Mesh(bumpGeo, bumpMat);
  bump.rotation.y = Math.PI; bump.position.set(cx, cy, -D / 2 - 0.001); phone.add(bump);
  const lensZ = -D / 2 - 0.022;
  for (const dy of [0.088, -0.088]) {
    const ring = new Mesh(new CylinderGeometry(0.07, 0.072, 0.024, 64), frameMat);
    ring.rotation.x = Math.PI / 2; ring.position.set(cx, cy + dy, lensZ); phone.add(ring);
    const glass = new Mesh(new CylinderGeometry(0.055, 0.055, 0.026, 64), lensMat);
    glass.rotation.x = Math.PI / 2; glass.position.set(cx, cy + dy, lensZ - 0.0015); phone.add(glass);
    const tint = new Mesh(new CircleGeometry(0.022, 40), lensTint);
    tint.rotation.y = Math.PI; tint.position.set(cx, cy + dy, lensZ - 0.0148); phone.add(tint);
  }
  const flash = new Mesh(new CircleGeometry(0.026, 40), flashMat);
  flash.rotation.y = Math.PI; flash.position.set(cx - 0.155, cy + 0.088, -D / 2 - 0.0012); phone.add(flash);

  // botões laterais
  const btn = (h, x, y) => { const m = new Mesh(new BoxGeometry(0.012, h, 0.03), frameMat); m.position.set(x, y, 0); phone.add(m); };
  btn(0.06, -W / 2 - 0.004, 0.44); btn(0.11, -W / 2 - 0.004, 0.3); btn(0.11, -W / 2 - 0.004, 0.16);
  btn(0.16, W / 2 + 0.004, 0.3); btn(0.1, W / 2 + 0.004, -0.2);
  scene.add(phone);

  // ---------- cor ----------
  const target = { back: new Color(), frame: new Color() };
  let colorT = 1;
  const from = { back: new Color(), frame: new Color() };
  function setColor(c, instant) {
    from.back.copy(backMat.color); from.frame.copy(frameMat.color);
    target.back.set(c.back); target.frame.set(c.frame);
    colorT = instant ? 1 : 0;
    if (instant) apply(1);
  }
  function apply(k) {
    backMat.color.copy(from.back).lerp(target.back, k);
    frameMat.color.copy(from.frame).lerp(target.frame, k);
    bumpMat.color.copy(backMat.color).offsetHSL(0, 0.04, 0.03);
  }
  setColor(color, true);

  // ---------- interação ----------
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let userY = 0, userX = 0, vel = 0, dragging = false, lastX = 0, lastY = 0, startX = 0, startY = 0, idleAt = 0, decided = false, horizontal = false;
  let scrollTurn = Math.PI; // gira de costas → de frente conforme a seção entra na tela
  const onDown = e => { dragging = true; decided = false; startX = lastX = e.clientX; startY = lastY = e.clientY; vel = 0; };
  const onMove = e => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (!decided && Math.hypot(e.clientX - startX, e.clientY - startY) > 6) {
      decided = true; horizontal = Math.abs(e.clientX - startX) > Math.abs(e.clientY - startY);
      if (horizontal) canvas.setPointerCapture?.(e.pointerId);
    }
    if (decided && horizontal) {
      userY += dx * 0.012; vel = dx * 0.012;
      userX = Math.max(-0.5, Math.min(0.5, userX + dy * 0.006));
      container.classList.add('touched');
    }
    lastX = e.clientX; lastY = e.clientY; idleAt = performance.now();
  };
  const onUp = () => { dragging = false; idleAt = performance.now(); };
  canvas.addEventListener('pointerdown', onDown);
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerup', onUp);
  addEventListener('pointercancel', onUp);

  function onScroll() {
    const r = container.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.85)));
    scrollTurn = (1 - p) * Math.PI * 1.1;
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // enquadra o aparelho inteiro, com folga, em qualquer proporção
    const fitH = 1.95, fitW = 1.4;
    const dist = Math.max(fitH / 2 / Math.tan((camera.fov * Math.PI) / 360), fitW / 2 / Math.tan((camera.fov * Math.PI) / 360) / camera.aspect);
    camera.position.z = dist;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize); ro.observe(container); resize();

  // só desenha quando está visível
  let visible = true, raf = 0, last = performance.now(), t = 0, auto = 0;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) loop(); });
  io.observe(container);

  function loop() {
    raf = 0;
    if (!visible || document.hidden) return;
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
    if (!dragging) {
      userY += vel; vel *= 0.93;
      if (!reduced && now - idleAt > 2500) auto += dt * 0.35;
      userX *= 0.96;
    }
    if (colorT < 1) { colorT = Math.min(1, colorT + dt * 2.2); apply(1 - Math.pow(1 - colorT, 3)); }
    phone.rotation.y = userY + auto + scrollTurn + Math.sin(t * 0.6) * (reduced ? 0 : 0.08) - 0.35;
    phone.rotation.x = userX + (reduced ? 0 : Math.sin(t * 0.8) * 0.04) - 0.06;
    phone.rotation.z = reduced ? 0 : Math.sin(t * 0.5) * 0.025;
    phone.position.y = reduced ? 0 : Math.sin(t * 1.1) * 0.035;
    container.style.setProperty('--float', phone.position.y.toFixed(3));
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf) { last = performance.now(); loop(); } });
  loop();

  return {
    setColor,
    destroy() {
      cancelAnimationFrame(raf); visible = false; io.disconnect(); ro.disconnect();
      removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp);
      removeEventListener('pointercancel', onUp); removeEventListener('scroll', onScroll);
      scene.traverse(o => { o.geometry?.dispose(); });
      [frameMat, backMat, bumpMat, glassBlack, lensMat, lensTint, flashMat, screenMat].forEach(m => { m.emissiveMap?.dispose(); m.dispose(); });
      pmrem.dispose(); renderer.dispose(); canvas.remove();
    },
  };
}
