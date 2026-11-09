// =====================================================================
// Homepage controller: loader, nav, content rendering, interactions,
// scroll animations and lazy loading of the 3D scenes.
// =====================================================================
import { projects, toolGroups, tools, experience, education, skills, certs } from './data.js';
import { device, escapeHTML, loadPosts, withReadingTimes, postCardHTML, copyText, toast, whenVisible } from './utils.js';

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const html = document.documentElement;
const RM = device.reducedMotion;

/* =========================================================
   1. Boot loader (max 1.5s, once per session)
   ========================================================= */
function runLoader() {
  const loader = $('#loader');
  if (!loader || RM || html.classList.contains('booted')) { loader && loader.remove(); return; }
  const log = $('#loaderLog');
  const bar = $('#loaderBar');
  const lines = [
    'NS-BIOS v2.6  (c) 2026',
    'CPU check ............ <span class="ok">OK</span>',
    'Memory test .......... <span class="ok">OK</span>',
    'Loading threat models  <span class="ok">OK</span>',
    'Guardrails ........... <span class="ok">ARMED</span>',
    'Mounting /portfolio .. <span class="warn">READY</span>'
  ];
  const total = 1150; // ms of typing, then a short fade (stays under 1.5s)
  const step = total / lines.length;
  lines.forEach((l, i) => setTimeout(() => {
    log.innerHTML += (i ? '\n' : '') + '> ' + l;
    bar.style.width = `${((i + 1) / lines.length) * 100}%`;
  }, i * step));
  setTimeout(() => {
    loader.classList.add('is-done');
    try { sessionStorage.setItem('booted', '1'); } catch {}
    setTimeout(() => loader.remove(), 400);
  }, total + 100);
}

/* =========================================================
   2. Navigation
   ========================================================= */
function initNav() {
  const nav = $('#nav');
  const toggle = $('#navToggle');
  const menu = $('#navMenu');

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
  });

  // Highlight the nav link for the section in view
  const links = new Map($$('.nav__menu ul a').map((a) => [a.getAttribute('href').slice(1), a]));
  const sections = [...links.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  // "Projects" link stays active while reading the red-team / skills sections that follow it.
  const alias = { redteam: 'tools', skills: 'experience' };
  const watch = [...sections, $('#redteam'), $('#skills')].filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = alias[e.target.id] || e.target.id;
      links.forEach((a, key) => a.classList.toggle('is-active', key === id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  watch.forEach((s) => io.observe(s));
}

/* =========================================================
   3. Projects: cards, 3D tilt and detail modal
   ========================================================= */
// Simple generic logos: every product gets a shield with its own glyph inside.
function projectLogo(kind) {
  const glyphs = {
    gateway: '<rect x="22" y="22" width="20" height="16" rx="2"/><path d="M27 22v-4a5 5 0 0 1 10 0v4M32 28v4"/>',
    radar: '<circle cx="32" cy="30" r="10"/><circle cx="32" cy="30" r="4"/><path d="M32 30 40 22"/>',
    agents: '<circle cx="24" cy="24" r="3.5"/><circle cx="40" cy="24" r="3.5"/><circle cx="32" cy="38" r="3.5"/><path d="M27 25.5 30 35M37 25.5 34 35M27.5 24h9"/>',
    network: '<rect x="20" y="20" width="9" height="7" rx="1"/><rect x="35" y="20" width="9" height="7" rx="1"/><rect x="27.5" y="34" width="9" height="7" rx="1"/><path d="M24.5 27v3.5h15V27M32 30.5V34"/>',
    neural: '<circle cx="22" cy="24" r="2.5"/><circle cx="22" cy="36" r="2.5"/><circle cx="32" cy="22" r="2.5"/><circle cx="32" cy="30" r="2.5"/><circle cx="32" cy="38" r="2.5"/><circle cx="42" cy="30" r="2.5"/><path d="M24.5 24 29.5 22M24.5 24l5 6M24.5 36l5-6M24.5 36l5 2M34.5 22l5 8M34.5 30h5M34.5 38l5-8"/>'
  };
  return `<svg class="card__logo" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M32 4 9 13v15c0 15 9.7 27.6 23 32 13.3-4.4 23-17 23-32V13L32 4Z" stroke-width="2.4"/>
    <path d="M32 9 14 16v12c0 12.2 7.6 22.6 18 26.5" stroke-opacity=".35"/>
    ${glyphs[kind] || glyphs.gateway}
  </svg>`;
}

function renderProjects() {
  const wrap = $('#projectCards');
  wrap.innerHTML = projects.map((p) => `
    <button class="card reveal" type="button" data-project="${p.id}" aria-haspopup="dialog">
      <span class="card__top">
        ${projectLogo(p.icon)}
        <span class="card__status ${p.statusTone === 'amber' ? 'card__status--amber' : ''}">${escapeHTML(p.status)}</span>
      </span>
      <span>
        <span class="card__title" style="display:block">${escapeHTML(p.name)}</span>
        <span class="card__tagline">${escapeHTML(p.tagline)}</span>
      </span>
      <span class="card__summary">${escapeHTML(p.summary)}</span>
      <span class="card__chips">${(p.mapping.length ? p.mapping : p.tech).slice(0, 3).map((t) => `<span class="chip">${escapeHTML(t)}</span>`).join('')}</span>
      <span class="card__more">View details <svg aria-hidden="true"><use href="#i-arrow"/></svg></span>
    </button>`).join('');

  // 3D tilt on pointer devices only
  if (!RM && !device.coarse) {
    $$('.card', wrap).forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.transform = `rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 12}deg) translateZ(0)`;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  const modal = $('#projectModal');
  const content = $('#modalContent');
  let lastFocus = null;

  const open = (id) => {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    const list = (arr) => `<ul class="bullets">${arr.map((b) => `<li>${escapeHTML(b)}</li>`).join('')}</ul>`;
    const chips = (arr) => `<div class="chips">${arr.map((t) => `<span class="chip">${escapeHTML(t)}</span>`).join('')}</div>`;
    const links = p.links.map((l) => l.href
      ? `<a class="btn btn--primary" href="${l.href}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-github"/></svg>${escapeHTML(l.label)}<svg aria-hidden="true"><use href="#i-ext"/></svg></a>`
      : `<span class="btn btn--ghost is-disabled" aria-disabled="true">${escapeHTML(l.label)}: coming soon</span>`).join('');

    content.innerHTML = `
      <div class="modal__head">
        ${projectLogo(p.icon)}
        <div>
          <p class="card__tagline">${escapeHTML(p.tagline)}</p>
          <h2 class="modal__title" id="modalTitle">${escapeHTML(p.name)}</h2>
          <span class="card__status ${p.statusTone === 'amber' ? 'card__status--amber' : ''}" style="display:inline-block;margin-top:8px">${escapeHTML(p.status)}</span>
        </div>
      </div>
      <h3>The problem</h3><p>${escapeHTML(p.problem)}</p>
      <h3>What I built</h3>${list(p.built)}
      ${p.why ? `<h3>Why it matters</h3><p>${escapeHTML(p.why)}</p>` : ''}
      <h3>Tech used</h3>${chips(p.tech)}
      ${p.mapping.length ? `<h3>Framework mapping</h3>${chips(p.mapping)}` : ''}
      <div class="modal__links">${links}</div>`;

    lastFocus = document.activeElement;
    modal.showModal();
    document.body.style.overflow = 'hidden';
    $('#modalClose').focus();
  };
  const close = () => modal.close();

  modal.addEventListener('close', () => {
    document.body.style.overflow = '';
    lastFocus && lastFocus.focus();
  });
  $('#modalClose').addEventListener('click', close);
  // Click on the dark backdrop closes the dialog
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  wrap.addEventListener('click', (e) => {
    const card = e.target.closest('[data-project]');
    if (card) open(card.dataset.project);
  });
}

/* =========================================================
   4. Tools universe: legend, grid fallback, lazy 3D scene
   ========================================================= */
function renderTools() {
  const section = $('#tools');
  const groupById = Object.fromEntries(toolGroups.map((g) => [g.id, g]));
  $('#toolsLegend').innerHTML = toolGroups.map((g) => `<li style="--c:${g.color}"><i></i>${escapeHTML(g.label)}</li>`).join('');

  const grid = $('#toolsGrid');
  grid.innerHTML = tools.map((t, i) => {
    const g = groupById[t.group];
    return `<li><button type="button" style="--c:${g.color};--i:${i}" aria-expanded="false">
      <i aria-hidden="true"></i>${escapeHTML(t.name)}
      <span class="sr-only">, ${escapeHTML(g.label)}</span>
      <span class="tile-desc">${escapeHTML(t.desc)}</span>
    </button></li>`;
  }).join('');
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const was = b.getAttribute('aria-expanded') === 'true';
    $$('button', grid).forEach((x) => x.setAttribute('aria-expanded', 'false'));
    b.setAttribute('aria-expanded', String(!was));
  });

  const btn3d = $('#view3d');
  const btnGrid = $('#viewGrid');
  let scene = null;
  let loading = false;

  const can3D = device.webgl && !RM;
  const setView = async (mode) => {
    const is3d = mode === '3d' && can3D;
    section.classList.toggle('is-grid', !is3d);
    btn3d.setAttribute('aria-pressed', String(is3d));
    btnGrid.setAttribute('aria-pressed', String(!is3d));
    if (scene) scene.setActive(is3d);
    if (is3d && !scene && !loading) {
      loading = true;
      try {
        const mod = await import('./tools.js');
        // Tile labels are drawn to canvas, so wait for the mono font first
        try { await document.fonts.load('500 34px "JetBrains Mono"'); } catch {}
        scene = mod.initToolsScene({
          canvas: $('#toolsCanvas'), stage: $('#toolsStage'),
          tools, groups: toolGroups, device,
          onSelect: (t) => {
            const info = t || { name: 'Tools universe', desc: 'Drag to rotate. Hover or tap a tile to read what it is.' };
            $('#toolsInfoGroup').textContent = t ? groupById[t.group].label : 'select a tile';
            $('#toolsInfoGroup').style.color = t ? groupById[t.group].color : '';
            $('#toolsInfoName').textContent = info.name;
            $('#toolsInfoDesc').textContent = info.desc;
          }
        });
      } catch (err) {
        console.warn('3D tools scene unavailable, showing grid.', err);
        section.classList.add('is-grid');
        btn3d.disabled = true;
      }
      loading = false;
    }
  };

  btn3d.addEventListener('click', () => setView('3d'));
  btnGrid.addEventListener('click', () => setView('grid'));

  // Phones, low-power devices, reduced motion and no-WebGL get the grid by default.
  if (!can3D) { btn3d.disabled = true; setView('grid'); return; }
  if (device.lowPower) { setView('grid'); return; }
  section.classList.remove('is-grid');
  whenVisible($('#toolsStage'), () => setView('3d'), '300px');
}

/* =========================================================
   5. Red-team terminal typing
   ========================================================= */
function initTerminal() {
  const term = $('.terminal');
  const lines = $$('.t-line', term);
  if (RM) return; // text is already fully visible
  term.classList.add('is-typing');

  whenVisible(term, () => {
    let i = 0;
    const next = () => {
      if (i >= lines.length) { term.classList.remove('is-typing'); return; }
      const line = lines[i++];
      // Type the plain text, then restore the original styled markup.
      const original = line.innerHTML;
      const text = line.textContent;
      line.textContent = '';
      line.classList.add('is-shown');
      let c = 0;
      const speed = line.classList.contains('t-cmd') ? 28 : 7;
      const tick = () => {
        c += line.classList.contains('t-cmd') ? 1 : 3;
        line.textContent = text.slice(0, c);
        if (c < text.length) setTimeout(tick, speed);
        else { line.innerHTML = original; setTimeout(next, line.classList.contains('t-cmd') ? 260 : 90); }
      };
      tick();
    };
    next();
  }, '-80px');
}

/* =========================================================
   6. Experience timeline
   ========================================================= */
function renderTimeline() {
  const tl = $('#timeline');
  const items = experience.map((job, i) => {
    const id = `tl-b-${i}`;
    return `
      <li class="tl-item reveal ${job.current ? 'is-current' : ''}">
        <article class="tl-card">
          <div class="tl-head">
            <h3 class="tl-role">${escapeHTML(job.role)}</h3>
            <span class="tl-dates">${escapeHTML(job.dates)}</span>
          </div>
          <p class="tl-meta">${escapeHTML(job.company)}<span class="sep">/</span>${escapeHTML(job.location)}</p>
          ${job.note ? `<span class="chip tl-note">${escapeHTML(job.note)}</span>` : ''}
          <button class="tl-toggle" type="button" aria-expanded="false" aria-controls="${id}">
            <svg aria-hidden="true"><use href="#i-plus"/></svg><span>Show details (${job.bullets.length})</span>
          </button>
          <ul class="tl-bullets" id="${id}" ${device.small ? 'hidden' : ''}>
            ${job.bullets.map((b) => `<li>${escapeHTML(b)}</li>`).join('')}
          </ul>
        </article>
      </li>`;
  }).join('');

  const edu = `
    <li class="tl-item tl-item--edu reveal">
      <h3 class="tl-edu-label">Education</h3>
      <div class="edu-grid">
        ${education.map((e) => `
          <article class="tl-card">
            <div class="tl-head">
              <h4 class="tl-role">${escapeHTML(e.degree)}</h4>
              <span class="tl-dates">${escapeHTML(e.dates)}</span>
            </div>
            <p class="tl-meta">${escapeHTML(e.school)}</p>
            ${e.note ? `<span class="chip tl-note">${escapeHTML(e.note)}</span>` : ''}
          </article>`).join('')}
      </div>
    </li>`;
  tl.insertAdjacentHTML('beforeend', items + edu);

  tl.addEventListener('click', (e) => {
    const btn = e.target.closest('.tl-toggle');
    if (!btn) return;
    const list = document.getElementById(btn.getAttribute('aria-controls'));
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    list.hidden = !open;
    btn.querySelector('span').textContent = open ? 'Hide details' : `Show details (${list.children.length})`;
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });
}

/* =========================================================
   7. Skills and certifications
   ========================================================= */
function renderSkills() {
  $('#skillsGrid').innerHTML = skills.map((g) => `
    <section class="skill-group reveal" aria-label="${escapeHTML(g.group)}">
      <h3>${escapeHTML(g.group)}</h3>
      <ul>${g.items.map((s) => `<li class="chip">${escapeHTML(s)}</li>`).join('')}</ul>
    </section>`).join('');

  $('#certsGrid').innerHTML = certs.map((c) => `
    <li class="cert reveal ${c.tone === 'amber' ? 'cert--amber' : ''}">
      <span class="cert__icon" aria-hidden="true"><svg><use href="#i-cert"/></svg></span>
      <span>
        <span class="cert__issuer">${escapeHTML(c.issuer)}</span>
        <span class="cert__name" style="display:block">${escapeHTML(c.name)}</span>
        ${c.verify ? `<a class="cert__verify" href="${c.verify}" target="_blank" rel="noopener">Verify <svg aria-hidden="true"><use href="#i-ext"/></svg></a>` : ''}
      </span>
    </li>`).join('');
}

/* =========================================================
   8. Latest write-ups from blog/posts.json
   ========================================================= */
async function renderLatestPosts() {
  const wrap = $('#latestPosts');
  const empty = `
    <div class="empty-state">
      <svg aria-hidden="true"><use href="#i-flag"/></svg>
      <div><strong>Write-ups coming soon</strong>
      <p>Notes on prompt injection, AI-attack detections and lab work will be published here.</p></div>
    </div>`;
  try {
    const posts = (await loadPosts('blog/')).slice(0, 3);
    if (!posts.length) { wrap.innerHTML = empty; return; }
    const withTimes = await withReadingTimes(posts, 'blog/');
    wrap.innerHTML = withTimes.map((p) => postCardHTML(p, `blog/post.html?slug=${encodeURIComponent(p.slug)}`)).join('');
  } catch (err) {
    console.warn('Could not load posts.json', err);
    wrap.innerHTML = empty;
  }
}

/* =========================================================
   9. Contact: copy buttons and Formspree form
   ========================================================= */
function initContact() {
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    const ok = await copyText(btn.dataset.copy);
    toast(ok ? `Copied: ${btn.dataset.copy}` : 'Copy failed. Please select the text.');
    if (ok) {
      btn.classList.add('is-copied');
      btn.querySelector('use').setAttribute('href', '#i-check');
      setTimeout(() => { btn.classList.remove('is-copied'); btn.querySelector('use').setAttribute('href', '#i-copy'); }, 1800);
    }
  });

  const form = $('#contactForm');
  const status = $('#formStatus');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form__status mono';

    // Basic validation with accessible error states
    let firstBad = null;
    $$('[required]', form).forEach((f) => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));
      f.setAttribute('aria-invalid', String(bad));
      if (bad && !firstBad) firstBad = f;
    });
    if (firstBad) {
      status.textContent = '> Please fill in your name, a valid email and a message.';
      status.classList.add('err');
      firstBad.focus();
      return;
    }

    if (form.action.includes('YOUR_FORM_ID')) {
      // TODO: Remove this branch once your Formspree ID is set in index.html.
      status.innerHTML = '> Form not connected yet. Please email <a href="mailto:Nevinshaju07@gmail.com">Nevinshaju07@gmail.com</a>.';
      status.classList.add('err');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    status.textContent = '> sending...';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      $$('[aria-invalid]', form).forEach((f) => f.removeAttribute('aria-invalid'));
      status.textContent = '> Message sent. I will reply soon.';
      status.classList.add('ok');
    } catch {
      status.innerHTML = '> Something went wrong. Please email <a href="mailto:Nevinshaju07@gmail.com">Nevinshaju07@gmail.com</a>.';
      status.classList.add('err');
    } finally {
      btn.disabled = false;
    }
  });
}

/* =========================================================
   10. Scroll animations (GSAP + ScrollTrigger)
   ========================================================= */
function initScrollFX() {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger || RM) return;
  gsap.registerPlugin(ScrollTrigger);

  // Fade/slide sections in as they enter. Elements in view at load are left alone.
  $$('.reveal').forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    el.classList.add('pre-reveal');
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', onComplete: () => { el.classList.remove('pre-reveal'); el.style.cssText = el.style.cssText.replace(/opacity[^;]*;?|transform[^;]*;?/g, ''); } })
    });
  });

  // Timeline "data flow" fills as you scroll through it
  const flow = $('.timeline__flow');
  if (flow) {
    gsap.fromTo(flow, { '--fill': '0%' }, {
      '--fill': '100%', ease: 'none',
      scrollTrigger: { trigger: '#timeline', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 }
    });
  }

  // Hero copy drifts up and fades as the camera dives into the screen
  gsap.to(['#heroCopy', '.hero__scroll'], {
    opacity: 0, y: -60, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '22% top', scrub: true }
  });

  // Recalculate after fonts/images settle
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

/* =========================================================
   11. Hero 3D scene (lazy, skipped for reduced motion / no WebGL)
   ========================================================= */
function initHero() {
  if (RM || !device.webgl) return;
  const start = () => import('./hero.js')
    .then((m) => m.initHero({ canvas: $('#heroCanvas'), section: $('.hero'), fade: $('#heroFade'), device }))
    .catch((err) => console.warn('Hero 3D unavailable, keeping static image.', err));
  // Let the page paint first, then load Three.js
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 600 });
  else setTimeout(start, 200);
}

/* =========================================================
   Boot
   ========================================================= */
runLoader();
initNav();
renderProjects();
renderTools();
initTerminal();
renderTimeline();
renderSkills();
renderLatestPosts();
initContact();
initHero();
// GSAP scripts are deferred and run before this module, but guard anyway.
if (window.gsap) initScrollFX(); else window.addEventListener('load', initScrollFX, { once: true });
