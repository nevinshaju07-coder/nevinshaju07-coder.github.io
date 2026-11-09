// =====================================================================
// Tools & Frameworks universe: glass tiles orbiting an AI-shield core.
// Each group of tools has its own orbit and colour.
// Hover (desktop) or tap (touch) a tile to highlight it.
// =====================================================================
import * as THREE from 'three';

export function initToolsScene({ canvas, stage, tools, groups, device, onSelect }) {
  const high = device.tier === 'high';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(device.pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 1.6, 15.5);
  camera.lookAt(0, 0, 0);

  /* ---------- Core: an AI shield ---------- */
  const core = new THREE.Group();
  scene.add(core);
  const cyan = new THREE.Color('#22e4ff');

  core.add(new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.35, 1),
    new THREE.MeshBasicMaterial({ color: cyan, wireframe: true, transparent: true, opacity: 0.35 })
  ));
  const inner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.95, 0),
    new THREE.MeshBasicMaterial({ color: 0x0a3a46, transparent: true, opacity: 0.85 })
  );
  core.add(inner);

  // Shield outline (flat, always faces the camera)
  const shieldShape = new THREE.Shape();
  shieldShape.moveTo(0, 0.85);
  shieldShape.lineTo(0.68, 0.58);
  shieldShape.lineTo(0.68, 0.05);
  shieldShape.quadraticCurveTo(0.62, -0.62, 0, -0.95);
  shieldShape.quadraticCurveTo(-0.62, -0.62, -0.68, 0.05);
  shieldShape.lineTo(-0.68, 0.58);
  shieldShape.lineTo(0, 0.85);
  const shield = new THREE.Group();
  const shieldLine = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(shieldShape.getPoints(40)),
    new THREE.LineBasicMaterial({ color: cyan })
  );
  const shieldFill = new THREE.Mesh(new THREE.ShapeGeometry(shieldShape), new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: 0.12 }));
  const check = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.28, -0.02, 0), new THREE.Vector3(-0.06, -0.24, 0), new THREE.Vector3(0.32, 0.2, 0)]),
    new THREE.LineBasicMaterial({ color: 0xffb347 })
  );
  shield.add(shieldFill, shieldLine, check);
  shield.position.z = 0.01;
  scene.add(shield);

  // Glow halo
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: cyan, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.set(6, 6, 1);
  scene.add(halo);

  /* ---------- Orbits and tiles ---------- */
  const universe = new THREE.Group();
  scene.add(universe);

  const groupIndex = Object.fromEntries(groups.map((g, i) => [g.id, i]));
  const orbits = groups.map((g, i) => {
    const o = new THREE.Group();
    // Each group gets its own tilted ring
    o.rotation.x = 0.35 + i * 0.18 * (i % 2 ? -1 : 1);
    o.rotation.z = (i - 2) * 0.22;
    o.userData = { speed: 0.05 + (i % 3) * 0.025 * (i % 2 ? -1 : 1), radius: 3.8 + i * 1.2 };
    universe.add(o);
    // Faint ring line
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(o.userData.radius - 0.005, o.userData.radius + 0.005, 128),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(g.color), transparent: true, opacity: 0.18, side: THREE.DoubleSide })
    );
    ring.rotation.x = Math.PI / 2;
    o.add(ring);
    return o;
  });

  const tiles = [];
  const byGroup = {};
  tools.forEach((t) => (byGroup[t.group] = byGroup[t.group] || []).push(t));
  Object.entries(byGroup).forEach(([gid, list]) => {
    const gi = groupIndex[gid];
    const color = groups[gi].color;
    const orbit = orbits[gi];
    list.forEach((tool, j) => {
      const tex = tileTexture(tool.name, color);
      const aspect = tex.image.width / tex.image.height;
      const h = 0.62;
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(h * aspect, h), mat);
      const angle = (j / list.length) * Math.PI * 2 + gi * 0.7;
      const anchor = new THREE.Object3D();
      anchor.position.set(Math.cos(angle) * orbit.userData.radius, 0, Math.sin(angle) * orbit.userData.radius);
      orbit.add(anchor);
      scene.add(mesh); // tiles live in world space so they can billboard cleanly
      mesh.userData = { tool, anchor, baseScale: 1, color };
      tiles.push(mesh);
    });
  });

  /* ---------- Starfield ---------- */
  const starCount = high ? 600 : 200;
  const sGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 14 + Math.random() * 20;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    sPos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3);
  }
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0x7fdfff, size: 0.06, transparent: true, opacity: 0.6, depthWrite: false })));

  /* ---------- Interaction ---------- */
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(-9, -9);
  let hovered = null;
  let selected = null;
  let drag = null;
  let rotY = 0, rotX = 0, velY = 0;
  let autoSpin = true;

  const toNDC = (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  const pick = () => {
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(tiles, false)[0];
    return hit ? hit.object : null;
  };

  canvas.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY, moved: false, rotY, rotX };
    autoSpin = false;
  });
  canvas.addEventListener('pointermove', (e) => {
    toNDC(e);
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
      const ny = drag.rotY + dx * 0.006;
      velY = ny - rotY;
      rotY = ny;
      rotX = THREE.MathUtils.clamp(drag.rotX + dy * 0.003, -0.5, 0.5);
    } else if (e.pointerType === 'mouse') {
      const obj = pick();
      if (obj !== hovered) {
        hovered = obj;
        canvas.style.cursor = obj ? 'pointer' : 'grab';
        onSelect(obj ? obj.userData.tool : selected ? selected.userData.tool : null);
      }
    }
  });
  const endDrag = (e) => {
    if (drag && !drag.moved) {
      toNDC(e);
      const obj = pick();
      selected = obj === selected ? null : obj;
      onSelect(selected ? selected.userData.tool : null);
    }
    drag = null;
    setTimeout(() => { autoSpin = true; }, 2500);
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointerleave', () => {
    drag = null;
    if (hovered) { hovered = null; onSelect(selected ? selected.userData.tool : null); }
  });

  /* ---------- Loop ---------- */
  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();
  let active = true, visible = false, tabVisible = !document.hidden, running = false;

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (autoSpin) { rotY += 0.06 * dt + velY * 0.9; velY *= 0.92; }
    universe.rotation.y = rotY;
    universe.rotation.x = rotX * 0.6;
    orbits.forEach((o) => { o.rotation.y += o.userData.speed * dt; });

    core.rotation.y = t * 0.25;
    core.rotation.x = Math.sin(t * 0.4) * 0.2;
    inner.material.opacity = 0.75 + Math.sin(t * 2) * 0.1;
    halo.material.opacity = 0.45 + Math.sin(t * 1.5) * 0.1;
    shield.quaternion.copy(camera.quaternion);

    const focus = hovered || selected;
    tiles.forEach((m) => {
      m.userData.anchor.getWorldPosition(tmp);
      m.position.copy(tmp);
      m.quaternion.copy(camera.quaternion); // billboard
      const isFocus = m === focus;
      const depth = THREE.MathUtils.clamp((tmp.z + 8) / 16, 0, 1); // tiles behind the core fade a little
      const targetScale = isFocus ? 1.35 : 1;
      const s = THREE.MathUtils.lerp(m.scale.x, targetScale, 0.15);
      m.scale.set(s, s, s);
      m.material.opacity = focus ? (isFocus ? 1 : 0.3) : 0.45 + depth * 0.55;
      m.renderOrder = Math.round(tmp.z * 10) + (isFocus ? 1000 : 0);
    });

    renderer.render(scene, camera);
  }

  const setRunning = () => {
    const should = active && visible && tabVisible;
    if (should && !running) { clock.getDelta(); renderer.setAnimationLoop(frame); running = true; }
    if (!should && running) { renderer.setAnimationLoop(null); running = false; }
  };

  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Pull back on narrow screens so all orbits fit
    camera.position.z = camera.aspect < 1 ? 15.5 / Math.max(camera.aspect, 0.55) : 15.5;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; setRunning(); }).observe(stage);
  document.addEventListener('visibilitychange', () => { tabVisible = !document.hidden; setRunning(); });
  resize();
  setRunning();

  return {
    setActive(v) { active = v; if (v) resize(); setRunning(); }
  };
}

/* Glass tile texture with the tool name. Text only, no logos. */
function tileTexture(text, color) {
  const fontPx = 34;
  const padX = 30;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  ctx.font = `500 ${fontPx}px "JetBrains Mono", ui-monospace, monospace`;
  const w = Math.ceil(ctx.measureText(text).width + padX * 2 + 24);
  const h = 96;
  c.width = Math.max(w, 180); c.height = h;
  ctx.font = `500 ${fontPx}px "JetBrains Mono", ui-monospace, monospace`;

  const r = 18;
  const path = () => {
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(3, 3, c.width - 6, h - 6, r) : ctx.rect(3, 3, c.width - 6, h - 6);
  };
  // Glass fill
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(40, 60, 100, 0.72)');
  g.addColorStop(1, 'rgba(8, 14, 30, 0.82)');
  path(); ctx.fillStyle = g; ctx.fill();
  // Glowing border
  ctx.shadowColor = color; ctx.shadowBlur = 10;
  ctx.strokeStyle = color; ctx.lineWidth = 3; path(); ctx.stroke();
  ctx.shadowBlur = 0;
  // Group colour pip
  ctx.fillStyle = color;
  ctx.fillRect(padX - 6, h / 2 - 3, 10, 6);
  // Label
  ctx.fillStyle = '#eef6ff';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, padX + 16, h / 2 + 2);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.3, 'rgba(255,255,255,0.25)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
