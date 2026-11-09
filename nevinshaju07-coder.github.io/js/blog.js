// Blog list page: loads posts.json, tag filter buttons and search box.
import { loadPosts, withReadingTimes, postCardHTML, escapeHTML } from './utils.js';

const TAGS = ['AI Security', 'Prompt Injection', 'Detection Engineering', 'SOC', 'Cloud Security', 'CTF / Labs'];

const list = document.getElementById('posts');
const tagWrap = document.getElementById('tags');
const search = document.getElementById('search');
const count = document.getElementById('count');

const params = new URLSearchParams(location.search);
let activeTag = TAGS.includes(params.get('tag')) ? params.get('tag') : 'All';
let posts = [];

tagWrap.innerHTML = ['All', ...TAGS].map((t) =>
  `<button type="button" class="chip chip--btn" data-tag="${escapeHTML(t)}" aria-pressed="${t === activeTag}">${escapeHTML(t)}</button>`).join('');

tagWrap.addEventListener('click', (e) => {
  const b = e.target.closest('[data-tag]');
  if (!b) return;
  activeTag = b.dataset.tag;
  tagWrap.querySelectorAll('[data-tag]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  const url = new URL(location.href);
  if (activeTag === 'All') url.searchParams.delete('tag'); else url.searchParams.set('tag', activeTag);
  history.replaceState(null, '', url);
  render();
});

let t;
search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(render, 120); });

function render() {
  const q = search.value.trim().toLowerCase();
  const shown = posts.filter((p) => {
    const tagOk = activeTag === 'All' || (p.tags || []).includes(activeTag);
    const text = `${p.title} ${p.summary} ${(p.tags || []).join(' ')}`.toLowerCase();
    return tagOk && (!q || text.includes(q));
  });

  if (!posts.length) {
    count.textContent = '';
    list.innerHTML = `<div class="empty-state"><div><strong>Write-ups coming soon</strong>
      <p>The first posts on AI security and detection engineering are on the way.</p></div></div>`;
    return;
  }
  count.textContent = `> ${shown.length} of ${posts.length} post${posts.length === 1 ? '' : 's'}`;
  list.innerHTML = shown.length
    ? shown.map((p) => postCardHTML(p, `post.html?slug=${encodeURIComponent(p.slug)}`)).join('')
    : `<div class="empty-state"><div><strong>No matches</strong><p>Try another tag or search term.</p></div></div>`;
}

(async () => {
  try {
    posts = await withReadingTimes(await loadPosts(''), '');
  } catch (err) {
    console.warn('Could not load posts.json', err);
    posts = [];
  }
  render();
})();
