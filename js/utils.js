// Shared helpers used by the homepage and the blog pages.

/* ---------- Device profile ----------
   Decides how heavy the 3D scenes can be.
   tier 'high'  : desktop with decent GPU/CPU, full effects (bloom, more particles)
   tier 'low'   : phones, tablets, low-memory or few-core devices, data saver on */
export const device = (() => {
  const mq = (q) => window.matchMedia(q).matches;
  const reducedMotion = mq('(prefers-reduced-motion: reduce)');
  const coarse = mq('(pointer: coarse)');
  const small = mq('(max-width: 720px)');
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4; // Chrome only; others report undefined
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const lowPower = coarse || small || cores < 4 || memory < 4 || saveData;

  let webgl = false;
  try {
    const c = document.createElement('canvas');
    webgl = !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { webgl = false; }

  return {
    reducedMotion, coarse, small, lowPower, webgl, saveData,
    tier: lowPower ? 'low' : 'high',
    // Pixel ratio is capped at 2 everywhere, and lower on weak devices.
    pixelRatio: Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2)
  };
})();

/* ---------- Text helpers ---------- */
export const escapeHTML = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const formatDate = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso || '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* Reading time at ~220 words per minute. Code blocks count too. */
export const readingTime = (markdown = '') => {
  const words = markdown.replace(/[#>*_`\-\[\]\(\)!]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
};

/* Only lowercase letters, numbers and hyphens are allowed in a slug.
   This stops anyone loading arbitrary paths through ?slug=. */
export const isValidSlug = (s) => typeof s === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) && s.length <= 100;

/* ---------- Blog index loader ----------
   base: path prefix to the /blog folder from the current page ('blog/' on the homepage, '' inside /blog). */
export async function loadPosts(base = '', { includeDrafts = false } = {}) {
  const res = await fetch(`${base}posts.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`posts.json ${res.status}`);
  const data = await res.json();
  const list = Array.isArray(data) ? data : (data.posts || []);
  return list
    .filter((p) => p && isValidSlug(p.slug) && (includeDrafts || p.published === true))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

/* Fetch the markdown for each post to work out its reading time.
   If a post sets "readingTime" in posts.json, that number is used instead. */
export async function withReadingTimes(posts, base = '') {
  return Promise.all(posts.map(async (p) => {
    if (p.readingTime) return { ...p, minutes: p.readingTime };
    try {
      const r = await fetch(`${base}posts/${p.slug}.md`);
      return { ...p, minutes: r.ok ? readingTime(await r.text()) : null };
    } catch { return { ...p, minutes: null }; }
  }));
}

export function postCardHTML(p, href) {
  const tags = (p.tags || []).map((t) => `<span class="chip">${escapeHTML(t)}</span>`).join('');
  const mins = p.minutes ? `<span>${p.minutes} min read</span>` : '';
  return `
    <a class="post-card" href="${href}">
      <span class="post-card__meta"><time datetime="${escapeHTML(p.date)}">${escapeHTML(formatDate(p.date))}</time>${mins}</span>
      <h3 class="post-card__title">${escapeHTML(p.title)}</h3>
      <p class="post-card__summary">${escapeHTML(p.summary || '')}</p>
      <span class="post-card__tags">${tags}</span>
    </a>`;
}

/* ---------- Clipboard + toast ---------- */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers / non-secure contexts
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

let toastTimer;
export function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 2200);
}

/* Run fn once when el scrolls near the viewport. */
export function whenVisible(el, fn, rootMargin = '200px') {
  if (!el) return;
  if (!('IntersectionObserver' in window)) { fn(); return; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); fn(); }
  }, { rootMargin });
  io.observe(el);
}
