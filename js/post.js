// Single post page: /blog/post.html?slug=<slug>
// Loads /blog/posts/<slug>.md, renders it with marked, sanitises it with
// DOMPurify, highlights code with highlight.js and sets SEO tags from posts.json.
import { loadPosts, readingTime, formatDate, escapeHTML, isValidSlug, copyText, toast } from './utils.js';

const SITE = 'https://nevinshaju07-coder.github.io';
const $ = (id) => document.getElementById(id);

const params = new URLSearchParams(location.search);
const slug = params.get('slug');
// Add &preview=1 to the URL to view a draft ("published": false) before publishing it.
const preview = params.get('preview') === '1';

function setMeta(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute('content', value);
}

function showError(title, msg) {
  document.title = `${title} | Nevin Shaju`;
  $('postTitle').textContent = title;
  $('postBody').innerHTML = `<div class="post-error"><h2>${escapeHTML(title)}</h2><p>${msg}</p></div>`;
  $('post').setAttribute('aria-busy', 'false');
  // Keep error pages out of search results
  const robots = document.createElement('meta');
  robots.name = 'robots'; robots.content = 'noindex';
  document.head.appendChild(robots);
}

function wrapCodeBlocks(root) {
  root.querySelectorAll('pre > code').forEach((code) => {
    const pre = code.parentElement;
    const lang = ([...code.classList].find((c) => c.startsWith('language-')) || '').replace('language-', '') || 'shell';
    if (window.hljs) {
      try { window.hljs.highlightElement(code); } catch {}
    }
    const box = document.createElement('div');
    box.className = 'code-term';
    box.innerHTML = `<div class="code-term__bar"><i></i><i></i><i></i><span class="code-term__lang">${escapeHTML(lang)}</span><button class="code-term__copy" type="button">copy</button></div>`;
    pre.replaceWith(box);
    box.appendChild(pre);
    box.querySelector('button').addEventListener('click', async (e) => {
      const ok = await copyText(code.innerText);
      e.target.textContent = ok ? 'copied' : 'failed';
      toast(ok ? 'Code copied' : 'Copy failed');
      setTimeout(() => { e.target.textContent = 'copy'; }, 1500);
    });
  });
}

async function main() {
  if (!isValidSlug(slug)) {
    showError('Post not found', 'That link does not point to a valid post. <a href="./">See all write-ups</a>.');
    return;
  }

  let entry;
  try {
    const all = await loadPosts('', { includeDrafts: true });
    entry = all.find((p) => p.slug === slug);
  } catch {
    showError('Could not load posts', 'Please try again in a moment. <a href="./">See all write-ups</a>.');
    return;
  }
  if (!entry || (!entry.published && !preview)) {
    showError('Post not found', 'This post does not exist or has not been published yet. <a href="./">See all write-ups</a>.');
    return;
  }

  let md;
  try {
    const res = await fetch(`posts/${slug}.md`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.status);
    md = await res.text();
  } catch {
    showError('Post file missing', `posts.json lists <code>${escapeHTML(slug)}</code> but <code>posts/${escapeHTML(slug)}.md</code> was not found.`);
    return;
  }

  // ---- SEO from posts.json ----
  const url = `${SITE}/blog/post.html?slug=${encodeURIComponent(slug)}`;
  document.title = `${entry.title} | Nevin Shaju`;
  setMeta('meta[name="description"]', entry.summary || '');
  setMeta('meta[property="og:title"]', entry.title);
  setMeta('meta[property="og:description"]', entry.summary || '');
  setMeta('meta[property="og:url"]', url);
  setMeta('meta[name="twitter:title"]', entry.title);
  setMeta('meta[name="twitter:description"]', entry.summary || '');
  document.querySelector('link[rel="canonical"]').href = url;
  if (!entry.published) {
    const robots = document.createElement('meta');
    robots.name = 'robots'; robots.content = 'noindex';
    document.head.appendChild(robots);
    $('draftNote').hidden = false;
  }

  // ---- Header ----
  const mins = entry.readingTime || readingTime(md);
  $('postTitle').textContent = entry.title;
  $('postMeta').innerHTML = `<time datetime="${escapeHTML(entry.date)}">${escapeHTML(formatDate(entry.date))}</time><span>${mins} min read</span><span>Nevin Shaju</span>`;
  $('postTags').innerHTML = (entry.tags || []).map((t) => `<a class="chip" href="./?tag=${encodeURIComponent(t)}">${escapeHTML(t)}</a>`).join('');

  // ---- Body ----
  // Drop a leading "# Title" from the markdown so the title is not shown twice.
  const body = md.replace(/^﻿?\s*#\s+.+\n/, '');
  if (!window.marked) {
    $('postBody').innerHTML = `<pre>${escapeHTML(body)}</pre>`;
  } else {
    window.marked.use({ gfm: true, breaks: false });
    const raw = window.marked.parse(body);
    const clean = window.DOMPurify ? window.DOMPurify.sanitize(raw, { ADD_ATTR: ['target'] }) : escapeHTML(body);
    $('postBody').innerHTML = clean;
  }

  // External links open in a new tab safely; images lazy-load
  $('postBody').querySelectorAll('a[href^="http"]').forEach((a) => {
    if (!a.href.startsWith(SITE)) { a.target = '_blank'; a.rel = 'noopener'; }
  });
  $('postBody').querySelectorAll('img').forEach((img) => { img.loading = 'lazy'; img.decoding = 'async'; if (!img.alt) img.alt = ''; });
  wrapCodeBlocks($('postBody'));
  $('post').setAttribute('aria-busy', 'false');
}

main();
