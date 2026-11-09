// =====================================================================
// Hero scene: a 1980s beige computer built from primitives.
// The CRT screen is a live canvas texture that boots up and types
// the headline. Scrolling dollies the camera into the screen.
// =====================================================================
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const PHOSPHOR = '#6dffd9';
const PHOSPHOR_DIM = '#2f9e86';
const BEIGE = 0xd9cfb2;
const BEIGE_DARK = 0xb9ae90;

export async function initHero({ canvas, section, fade, device }) {
  const high = device.tier === 'high';

  /* ---------- Renderer ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !high ? false : true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(device.pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x05070d, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070d, 0.055);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.03, 80);

  /* ---------- Lights ---------- */
  scene.add(new THREE.HemisphereLight(0x8fb8ff, 0x0a0c12, 0.35));
  const key = new THREE.DirectionalLight(0xffe2b8, 1.1); // warm amber key light
  key.position.set(-5, 7, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x22e4ff, 0.9); // cyan rim from behind
  rim.position.set(4, 4, -6);
  scene.add(rim);
  const screenLight = new THREE.PointLight(0x5fffe0, 6, 9, 2); // light thrown by the CRT
  screenLight.position.set(0, 1.75, 1.7);
  scene.add(screenLight);

  /* ---------- Materials ---------- */
  const plastic = new THREE.MeshStandardMaterial({ color: BEIGE, roughness: 0.62, metalness: 0.02 });
  const plasticDark = new THREE.MeshStandardMaterial({ color: BEIGE_DARK, roughness: 0.7 });
  const blackPlastic = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.55 });
  const keyMat = new THREE.MeshStandardMaterial({ color: 0xcbc0a2, roughness: 0.55 });
  const keyMatDark = new THREE.MeshStandardMaterial({ color: 0x8c836d, roughness: 0.6 });

  const computer = new THREE.Group();
  scene.add(computer);

  /* ---------- System unit (desktop case) ---------- */
  const caseMesh = new THREE.Mesh(new RoundedBoxGeometry(3.3, 0.62, 2.5, 4, 0.06), plastic);
  caseMesh.position.set(0, 0.31, 0);
  computer.add(caseMesh);

  // Two floppy drive bays
  [-0.85, 0.35].forEach((x) => {
    const bay = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.24, 0.04, 2, 0.015), plasticDark);
    bay.position.set(x, 0.33, 1.255);
    computer.add(bay);
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.03, 0.02), blackPlastic);
    slot.position.set(x, 0.36, 1.28);
    computer.add(slot);
  });
  // Power LED (amber) and vents
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffb347, toneMapped: false }));
  led.position.set(1.35, 0.33, 1.265);
  computer.add(led);
  for (let i = 0; i < 6; i++) {
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.02), blackPlastic);
    vent.position.set(1.0 + i * 0.07, 0.33, 1.255);
    vent.scale.set(0.5, 1, 1);
    computer.add(vent);
  }

  /* ---------- Monitor ---------- */
  const neck = new THREE.Mesh(new RoundedBoxGeometry(1.4, 0.08, 1.2, 2, 0.03), plasticDark);
  neck.position.set(0, 0.66, -0.1);
  computer.add(neck);

  const monitor = new THREE.Group();
  monitor.position.set(0, 1.78, -0.15);
  computer.add(monitor);

  // Front shell plus a tapered back (old CRTs are deep)
  const shell = new THREE.Mesh(new RoundedBoxGeometry(2.6, 2.15, 1.3, 5, 0.14), plastic);
  shell.position.z = 0.35;
  monitor.add(shell);
  const back = new THREE.Mesh(new RoundedBoxGeometry(1.9, 1.6, 1.1, 4, 0.18), plastic);
  back.position.z = -0.6;
  monitor.add(back);

  // Dark glass surround inside the bezel
  const surround = new THREE.Mesh(new RoundedBoxGeometry(2.12, 1.66, 0.06, 3, 0.08), new THREE.MeshStandardMaterial({ color: 0x0b0d10, roughness: 0.3, metalness: 0.2 }));
  surround.position.set(0, 0.07, 1.0);
  monitor.add(surround);

  // Brand-free badge strip and knobs under the screen
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.01), plasticDark);
  strip.position.set(-0.75, -0.88, 1.005);
  monitor.add(strip);
  [0.7, 0.88].forEach((x) => {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 16), plasticDark);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(x, -0.88, 1.02);
    monitor.add(knob);
  });

  /* ---------- CRT screen (curved, canvas texture) ---------- */
  const crt = createCRT(high ? 1024 : 768);
  const screenW = 1.86, screenH = 1.4;
  const screenGeo = new THREE.PlaneGeometry(screenW, screenH, 32, 24);
  // Bulge the plane outward so the glass looks curved like a real tube.
  const pos = screenGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / (screenW / 2);
    const y = pos.getY(i) / (screenH / 2);
    pos.setZ(i, 0.075 * (1 - x * x * 0.55 - y * y * 0.55) - 0.03);
  }
  screenGeo.computeVertexNormals();
  const screenMat = new THREE.MeshBasicMaterial({ map: crt.texture, toneMapped: false });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 0.07, 1.04);
  monitor.add(screen);

  // Soft additive glow in front of the tube (cheap bloom stand-in on low tier, extra halo on high)
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 3.4),
    new THREE.MeshBasicMaterial({ map: radialTexture('rgba(80,255,220,0.55)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: high ? 0.16 : 0.4, toneMapped: false })
  );
  glow.position.set(0, 0.07, 1.12);
  monitor.add(glow);

  const screenWorld = new THREE.Vector3();

  /* ---------- Keyboard ---------- */
  const keyboard = new THREE.Group();
  keyboard.position.set(0, 0.07, 2.25);
  keyboard.rotation.x = 0.07;
  computer.add(keyboard);
  const kbBody = new THREE.Mesh(new RoundedBoxGeometry(3.1, 0.14, 1.1, 3, 0.05), plastic);
  keyboard.add(kbBody);

  const keyGeo = new RoundedBoxGeometry(0.16, 0.07, 0.15, 2, 0.025);
  const rows = 5, cols = 15;
  const keys = new THREE.InstancedMesh(keyGeo, keyMat, rows * cols);
  const darkKeys = new THREE.InstancedMesh(keyGeo, keyMatDark, 12);
  const m = new THREE.Matrix4();
  let k = 0, dk = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = -1.33 + c * 0.19 + (r % 2 ? 0.05 : 0);
      const z = -0.36 + r * 0.18;
      if (r === 4 && c > 3 && c < 11) continue; // room for the space bar
      m.makeTranslation(x, 0.09, z);
      if ((c === 0 || c === cols - 1) && dk < 12) darkKeys.setMatrixAt(dk++, m);
      else keys.setMatrixAt(k++, m);
    }
  }
  keys.count = k; darkKeys.count = dk;
  keyboard.add(keys, darkKeys);
  const space = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.07, 0.15, 2, 0.025), keyMat);
  space.position.set(-0.24 + 0.19 * 3.5, 0.09, -0.36 + 4 * 0.18);
  keyboard.add(space);

  /* ---------- Desk, floor grid, particles ---------- */
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x0b111d, roughness: 0.85, metalness: 0.1 }));
  desk.rotation.x = -Math.PI / 2;
  scene.add(desk);
  const grid = new THREE.GridHelper(40, 60, 0x22e4ff, 0x22e4ff);
  grid.material.transparent = true;
  grid.material.opacity = 0.06;
  grid.position.y = 0.002;
  scene.add(grid);

  const pCount = high ? 380 : 120;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pSpeed = new Float32Array(pCount);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 14;
    pPos[i * 3 + 1] = Math.random() * 6;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    pSpeed[i] = 0.08 + Math.random() * 0.25;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0x22e4ff, size: high ? 0.03 : 0.045, transparent: true, opacity: 0.55,
    blending: THREE.AdditiveBlending, depthWrite: false, map: radialTexture('rgba(255,255,255,1)')
  }));
  scene.add(particles);

  /* ---------- Post-processing bloom (high tier only) ---------- */
  let composer = null;
  if (high) {
    try {
      const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
        import('three/addons/postprocessing/EffectComposer.js'),
        import('three/addons/postprocessing/RenderPass.js'),
        import('three/addons/postprocessing/UnrealBloomPass.js'),
        import('three/addons/postprocessing/OutputPass.js')
      ]);
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(512, 512), 0.6, 0.5, 0.78));
      composer.addPass(new OutputPass());
    } catch (e) {
      composer = null; // bloom is optional
    }
  }

  /* ---------- Camera path ---------- */
  const look = new THREE.Vector3();
  const camStart = new THREE.Vector3();
  const lookStart = new THREE.Vector3();
  const camEnd = new THREE.Vector3();
  const lookEnd = new THREE.Vector3();

  function layout() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    composer && composer.setSize(w, h);
    camera.aspect = w / h;
    // Wider vertical FOV on portrait so the whole machine fits
    camera.fov = camera.aspect < 0.8 ? 46 : 35;
    camera.updateProjectionMatrix();

    // Fit the computer horizontally at any aspect ratio
    const halfWidth = 2.2;
    const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
    const dist = Math.max(7.6, halfWidth / tanH);
    const portrait = camera.aspect < 0.8;
    // On phones, push the computer up so the HTML headline below has room
    // On wide screens the computer sits to the right, leaving the left for the headline
    const offX = camera.aspect > 1.25 ? -1.5 : 0;
    camStart.set(offX, portrait ? 1.0 : 2.15, dist);
    lookStart.set(offX, portrait ? -0.75 : 1.05, 0.6);

    monitor.getWorldPosition(screenWorld);
    screenWorld.add(new THREE.Vector3(0, 0.07, 1.04));
    camEnd.set(0, screenWorld.y, screenWorld.z + 0.32);
    lookEnd.copy(screenWorld);
  }

  /* ---------- Interaction: parallax ---------- */
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  // Touch: gentle tilt following the finger without blocking page scroll
  window.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (!t) return;
    target.x = ((t.clientX / window.innerWidth) * 2 - 1) * 0.6;
  }, { passive: true });

  /* ---------- Scroll progress ---------- */
  const scrollProgress = () => {
    const r = section.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    return total > 0 ? THREE.MathUtils.clamp(-r.top / total, 0, 1) : 0;
  };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* ---------- Render loop with pause on hidden / offscreen ---------- */
  const clock = new THREE.Clock();
  let visible = true;
  let tabVisible = !document.hidden;
  let running = false;

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    crt.update(t);

    // Parallax
    current.x += (target.x - current.x) * 0.05;
    current.y += (target.y - current.y) * 0.05;

    // Scroll dolly
    const p = scrollProgress();
    const e = ease(THREE.MathUtils.clamp(p / 0.85, 0, 1));
    camera.position.lerpVectors(camStart, camEnd, e);
    look.lerpVectors(lookStart, lookEnd, e);
    const sway = 1 - e; // parallax fades as we enter the screen
    camera.position.x += current.x * 0.6 * sway;
    camera.position.y += -current.y * 0.3 * sway;
    camera.lookAt(look);
    computer.rotation.y = current.x * 0.12 * sway;

    // Fade into the next section once we are "inside" the screen
    const f = THREE.MathUtils.clamp((p - 0.62) / 0.3, 0, 1);
    fade.style.opacity = f.toFixed(3);
    canvas.style.opacity = (1 - Math.max(0, (p - 0.88) / 0.12)).toFixed(3);

    // CRT flicker and light
    const flick = 0.96 + Math.sin(t * 60) * 0.015 + (Math.random() < 0.01 ? -0.06 : 0);
    screenMat.color.setScalar(flick);
    screenLight.intensity = (high ? 6 : 8) * flick;
    led.material.color.setHSL(0.09, 1, 0.5 + Math.sin(t * 2) * 0.1);

    // Drift particles upward
    const arr = pGeo.attributes.position.array;
    for (let i = 0; i < pCount; i++) {
      arr[i * 3 + 1] += pSpeed[i] * dt;
      if (arr[i * 3 + 1] > 6) arr[i * 3 + 1] = 0;
    }
    pGeo.attributes.position.needsUpdate = true;

    if (composer) composer.render(); else renderer.render(scene, camera);
  }

  const setRunning = () => {
    const should = visible && tabVisible;
    if (should && !running) { clock.getDelta(); renderer.setAnimationLoop(frame); running = true; }
    if (!should && running) { renderer.setAnimationLoop(null); running = false; }
  };

  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; setRunning(); }).observe(section);
  document.addEventListener('visibilitychange', () => { tabVisible = !document.hidden; setRunning(); });
  new ResizeObserver(() => layout()).observe(canvas);

  layout();
  // Wait for the terminal font so the screen text uses it
  try { await document.fonts.load('500 32px "JetBrains Mono"'); } catch {}
  crt.start();
  frame();
  canvas.classList.add('is-ready');
  section.classList.add('has-3d');
  setRunning();
}

/* =====================================================================
   CRT screen: canvas texture that boots, types the headline and blinks.
   Redraws only when something changes (typing or cursor blink).
   ===================================================================== */
function createCRT(width) {
  const W = width, H = Math.round(width * 0.75);
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const s = W / 1024; // scale factor so layout works at any resolution

  const font = (px, weight = 500) => `${weight} ${Math.round(px * s)}px "JetBrains Mono", ui-monospace, monospace`;

  const bios = [
    'NS-BIOS v2.6   640K RAM OK',
    'Detecting drives ...... A: B: C:',
    'Loading GUARDRAIL.SYS . OK',
    'Loading DETECT.SYS .... OK',
    '',
    'C:\\> run profile.exe'
  ];
  const lines = [
    { text: '> NEVIN SHAJU', size: 78, weight: 700, color: '#d7fff4' },
    { text: '> AI Security Engineer | LLM & Agentic AI Security | Detection Engineering', size: 36, weight: 500, color: PHOSPHOR },
    { text: '> Status: Available immediately | Dubai, UAE', size: 36, weight: 500, color: '#ffd38a' }
  ];

  // Timeline: BIOS lines appear one by one, then each headline line types in.
  const plan = [];
  let tCursor = 0.2;
  bios.forEach((_, i) => { plan.push({ kind: 'bios', i, at: tCursor }); tCursor += 0.12; });
  tCursor += 0.35;
  lines.forEach((l, i) => {
    plan.push({ kind: 'type', i, at: tCursor, dur: l.text.length * (i === 0 ? 0.06 : 0.022) });
    tCursor += l.text.length * (i === 0 ? 0.06 : 0.022) + 0.25;
  });

  let started = false, startTime = 0, lastKey = '';

  function wrap(text, maxWidth) {
    const words = text.split(' ');
    const out = [];
    let line = '';
    words.forEach((w) => {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxWidth && line) { out.push(line); line = '   ' + w; }
      else line = test;
    });
    out.push(line);
    return out;
  }

  function draw(now) {
    const el = now - startTime;
    // Work out what should be visible
    let biosShown = 0;
    const typed = lines.map(() => 0);
    plan.forEach((p) => {
      if (el < p.at) return;
      if (p.kind === 'bios') biosShown = p.i + 1;
      else typed[p.i] = Math.min(lines[p.i].text.length, Math.floor(((el - p.at) / p.dur) * lines[p.i].text.length));
    });
    const cursorOn = Math.floor(el * 2.2) % 2 === 0;
    const keyState = `${biosShown}|${typed.join(',')}|${cursorOn}`;
    if (keyState === lastKey) return;
    lastKey = keyState;

    // Background: dark phosphor glass
    const bg = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, W * 0.75);
    bg.addColorStop(0, '#062b26');
    bg.addColorStop(1, '#010907');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const pad = 70 * s;
    let y = pad + 20 * s;
    ctx.textBaseline = 'top';

    // BIOS block
    ctx.font = font(26);
    ctx.shadowColor = PHOSPHOR_DIM;
    ctx.shadowBlur = 8 * s;
    ctx.fillStyle = PHOSPHOR_DIM;
    for (let i = 0; i < biosShown; i++) { ctx.fillText(bios[i], pad, y); y += 34 * s; }
    y += 26 * s;

    // Headline
    let cursorX = pad, cursorY = y, cursorH = 30 * s;
    lines.forEach((l, i) => {
      if (!typed[i]) return;
      ctx.font = font(l.size, l.weight);
      ctx.fillStyle = l.color;
      ctx.shadowColor = l.color;
      ctx.shadowBlur = (i === 0 ? 22 : 12) * s;
      const parts = wrap(l.text.slice(0, typed[i]), W - pad * 2);
      parts.forEach((part) => {
        ctx.fillText(part, pad, y);
        cursorX = pad + ctx.measureText(part).width + 6 * s;
        cursorY = y;
        cursorH = l.size * s;
        y += l.size * s * 1.35;
      });
      y += 10 * s;
    });

    // Blinking block cursor
    if (cursorOn) {
      ctx.shadowColor = PHOSPHOR;
      ctx.shadowBlur = 14 * s;
      ctx.fillStyle = PHOSPHOR;
      ctx.fillRect(cursorX, cursorY + 2 * s, cursorH * 0.55, cursorH);
    }
    ctx.shadowBlur = 0;

    // Scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    for (let sy = 0; sy < H; sy += 4 * s) ctx.fillRect(0, sy, W, 1.6 * s);

    // Vignette for the curved-tube look
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.68);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);

    // Glass reflection
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgba(255,255,255,0.07)');
    g.addColorStop(0.35, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    texture.needsUpdate = true;
  }

  return {
    texture,
    start() { started = true; startTime = performance.now() / 1000; draw(startTime); },
    update() { if (started) draw(performance.now() / 1000); }
  };
}

/* Small radial gradient texture used for glows and particles. */
function radialTexture(color) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
