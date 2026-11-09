# nevinshaju07-coder.github.io

Personal portfolio of **Nevin Shaju**, AI Security Engineer (Dubai, UAE).
Static site, no build step. Three.js 0.160.0, GSAP 3.12.5, marked 12.0.2, DOMPurify 3.1.6 and highlight.js 11.9.0, all pinned and loaded from cdn.jsdelivr.net.

Live: https://nevinshaju07-coder.github.io

---

## 1. Folder structure

```
nevinshaju07-coder.github.io/
├── index.html                  Homepage (all 9 sections)
├── 404.html                    Custom "page not found"
├── robots.txt                  Lets search engines crawl the site
├── sitemap.xml                 Page list for Google
├── .nojekyll                   Tells GitHub Pages to serve files as-is
├── README.md                   This file
├── css/
│   ├── style.css               Main styles. Colours/fonts are CSS variables at the top
│   └── blog.css                Blog list + post + terminal code blocks
├── js/
│   ├── data.js                 ALL CONTENT: projects, tools, experience, skills, certs
│   ├── main.js                 Homepage logic (nav, loader, modals, timeline, form...)
│   ├── utils.js                Device detection, blog helpers, copy-to-clipboard
│   ├── hero.js                 3D retro computer (Three.js)
│   ├── tools.js                3D tools universe (Three.js)
│   ├── blog.js                 Blog list page (tags + search)
│   └── post.js                 Single post page (markdown rendering)
├── assets/
│   ├── Nevin_Shaju_CV.pdf      <-- YOU ADD THIS (see TODO list)
│   ├── README.txt              Reminder about the CV file
│   ├── hero-static.webp        Hero image for reduced motion / no WebGL
│   ├── og-image.png            1200x630 preview for LinkedIn/WhatsApp shares
│   ├── favicon.svg
│   ├── favicon-32.png
│   └── apple-touch-icon.png
└── blog/
    ├── index.html              All write-ups
    ├── post.html               Template for every post (?slug=...)
    ├── posts.json              Post index (only "published": true are shown)
    ├── README.md               How to publish a post + planned topics
    ├── posts/
    │   └── how-to-write-a-post.md   Format template (published: false)
    └── images/
        └── example.png         Used by the template post
```

---

## 2. Deploy to GitHub Pages (step by step)

You need a GitHub account with the username **nevinshaju07-coder**. A repo named exactly `<username>.github.io` is served at the root domain.

### Step 1. Add your CV
Copy your CV into `assets/` and name it exactly `Nevin_Shaju_CV.pdf` (capitals matter on GitHub Pages).

### Step 2. Create the repository
1. Go to https://github.com/new
2. Repository name: `nevinshaju07-coder.github.io`
3. Visibility: **Public** (free GitHub Pages needs a public repo)
4. Do **not** tick "Add a README" (you already have one)
5. Click **Create repository**

### Step 3a. Upload with the browser (no Git needed)
1. On the new empty repo page, click **uploading an existing file**
2. Open the unzipped site folder on your computer, select **everything inside it** (not the folder itself) and drag it into the page
   - On macOS, press `Cmd + Shift + .` in Finder first so the hidden `.nojekyll` file is visible and gets uploaded
3. Commit message: `Initial site`, then **Commit changes**
4. Check that `index.html` sits at the top level of the repo, not inside a sub-folder

### Step 3b. Or upload with Git (terminal)
```bash
cd path/to/the/unzipped/site
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/nevinshaju07-coder/nevinshaju07-coder.github.io.git
git push -u origin main
```
When asked for a password, use a GitHub Personal Access Token (Settings > Developer settings > Personal access tokens), not your account password.

### Step 4. Turn on Pages
1. Repo > **Settings** > **Pages** (left sidebar)
2. Source: **Deploy from a branch**
3. Branch: **main**, folder: **/ (root)**, then **Save**
4. Wait 1 to 2 minutes. The green box shows: *Your site is live at https://nevinshaju07-coder.github.io/*
5. Tick **Enforce HTTPS** if it is not already on

### Step 5. Check it
- Open the site on your phone and laptop
- Click every "Download CV" button
- Open https://nevinshaju07-coder.github.io/blog/
- Paste the URL into https://www.opengraph.xyz to check the LinkedIn preview card
- Run Lighthouse: Chrome > right-click > Inspect > Lighthouse > Mobile > Analyze

### Step 6. Tell Google about it (optional, recommended)
1. https://search.google.com/search-console > Add property > URL prefix > your site URL
2. Verify with the "HTML tag" method: paste the `<meta name="google-site-verification" ...>` tag into the `<head>` of `index.html`, push, then click Verify
3. Sitemaps > submit `sitemap.xml`

### Updating later
Edit files, then commit and push again (or use "Add file > Upload files" on GitHub). Pages redeploys automatically in about a minute. Hard-refresh (`Ctrl/Cmd + Shift + R`) if you still see the old version.

### Test locally before pushing
ES modules do not run from `file://`, so use a tiny local server:
```bash
cd path/to/site
python3 -m http.server 8000
# open http://localhost:8000
```

---

## 3. TODO list (everything you need to fill in)

Search the code for `TODO` to find each one.

| # | Where | What to add |
|---|---|---|
| 1 | `assets/Nevin_Shaju_CV.pdf` | Your CV file (exact name). Every Download CV button links here |
| 2 | `index.html` > contact form `action` | Formspree form ID: replace `YOUR_FORM_ID` (formspree.io > New form > copy the ID) |
| 3 | `js/main.js` > `initContact` | Optional: once #2 is done, you can delete the "Form not connected yet" branch (it stops triggering automatically) |
| 4 | `index.html` > red-team terminal | Highest Lakera Gandalf level reached (replace "pending update") |
| 5 | `index.html` > `.thm-badge__link` `href="#"` | TryHackMe public profile URL (`https://tryhackme.com/p/USERNAME`) |
| 6 | `index.html` > TryHackMe badge | Optional: official TryHackMe badge image instead of the placeholder |
| 7 | `js/data.js` > Haris AI `links` | GitHub repo URL |
| 8 | `js/data.js` > Haris AI `links` | Demo / landing page URL (or delete that link) |
| 9 | `js/data.js` > Haris AI `tech` | Exact stack (languages, libraries, models) |
| 10 | `js/data.js` > Agentic SOC `links` | GitHub repo URL |
| 11 | `js/data.js` > Agentic SOC `tech` | Exact stack (agent framework, LLM, SIEM) |
| 12 | `js/data.js` > Agentic SOC `mapping` | Frameworks it is mapped to, if any |
| 13 | `js/data.js` > Splunk lab `links` | GitHub repo URL |
| 14 | `js/data.js` > Splunk lab `problem` / `built` | Specific detections, dashboards or findings |
| 15 | `js/data.js` > Splunk lab `mapping` | e.g. MITRE ATT&CK, if used |
| 16 | `js/data.js` > `certs` (7 entries) | Credly / verification URL for each cert (put it in `verify`; a "Verify" link appears automatically). Includes your TryHackMe profile link |

To fill a link in `data.js`, change `href: null` to `href: 'https://...'`. While `href` is `null`, the button shows "coming soon" and is disabled, so no broken links reach recruiters.

---

## 4. Publishing a new blog post (short version)

1. Copy `blog/posts/how-to-write-a-post.md` to `blog/posts/my-post-slug.md` and write your post (lowercase letters, numbers and hyphens only in the file name).
2. Add one entry to `blog/posts.json`:
   ```json
   { "slug": "my-post-slug", "title": "Post title", "date": "2026-12-01",
     "summary": "One or two sentences.", "tags": ["AI Security"], "published": true }
   ```
3. Commit and push. It appears on `/blog/` and (if it is one of the 3 newest) on the homepage.

Preview a draft with `blog/post.html?slug=my-post-slug&preview=1`. Full guide and topic ideas: `blog/README.md`.

---

## 5. How things work (for future edits)

- **Change content**: almost everything is in `js/data.js`. The About text, quick facts and contact details are in `index.html`.
- **Change colours**: edit the variables at the top of `css/style.css` (`--cyan`, `--amber`, `--bg`...).
- **Performance**: Three.js only downloads after first paint (`requestIdleCallback`). The tools scene only loads when you scroll near it. Both scenes pause when off-screen or when the tab is hidden. Pixel ratio is capped at 2 (1.5 on low-power devices).
- **Low-power devices** (touch screens, small screens, fewer than 4 CPU cores, under 4 GB RAM, or Data Saver on): no bloom, fewer particles, and the tools section opens in grid view (visitors can still switch to 3D on desktop).
- **Reduced motion** (OS setting): no loader, no 3D, no typing effects. A static hero image and the tools grid are shown instead.
- **Accessibility**: skip link, keyboard-operable nav, cards, modal (native `<dialog>`, Esc closes, focus returns), visible amber focus rings, ARIA live regions for the form and copy buttons. The hero name and title are real HTML text.
- **Blog security**: post slugs are validated (`^[a-z0-9-]+$`), markdown output is sanitised with DOMPurify, and draft/error pages are `noindex`.
