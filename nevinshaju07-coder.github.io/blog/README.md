# Write-ups: how the blog works

No build step and no coding needed. Each post is one Markdown file plus one entry in `posts.json`.

```
blog/
  index.html          list of all posts (tag filter + search)
  post.html           one template page that shows any post
  posts.json          the list of posts (the "index")
  posts/              your Markdown files, one per post
  images/             images used inside posts
  README.md           this file
```

## Publish a new post in 2 steps

### Step 1. Add the Markdown file

Create a file in `blog/posts/`. The file name is the post's **slug**.

- Use only lowercase letters, numbers and hyphens: `gandalf-prompt-injection.md`
- No spaces, capitals or other symbols. Anything else is rejected for safety.

The easiest way: copy `posts/how-to-write-a-post.md`, rename it, and replace the text. It shows every format you need (headings, code blocks, images, links, tables).

### Step 2. Add one entry to `posts.json`

Add an object to the `"posts"` list. Mind the commas between entries.

```json
{
  "slug": "gandalf-prompt-injection",
  "title": "Beating Lakera Gandalf: prompt injection techniques",
  "date": "2026-12-01",
  "summary": "One or two sentences. This shows on the card and as the Google / LinkedIn description.",
  "tags": ["AI Security", "Prompt Injection"],
  "published": true
}
```

| Field | What it does |
| --- | --- |
| `slug` | Must match the file name without `.md` |
| `title` | Post title, page title and social share title |
| `date` | `YYYY-MM-DD`. Newest posts show first |
| `summary` | Card text and meta description (keep it under ~160 characters) |
| `tags` | Use these so the filter buttons work: `AI Security`, `Prompt Injection`, `Detection Engineering`, `SOC`, `Cloud Security`, `CTF / Labs` |
| `published` | `true` shows it on the site. `false` hides it everywhere |
| `readingTime` | Optional number of minutes. If left out, it is worked out from the word count |

Commit and push. GitHub Pages updates in about a minute. The 3 newest published posts appear on the homepage automatically.

## Preview a draft

Keep `"published": false` and open:

```
https://nevinshaju07-coder.github.io/blog/post.html?slug=YOUR-SLUG&preview=1
```

Drafts are marked "DRAFT PREVIEW" and set to `noindex`, so search engines ignore them.

## Images

Put image files in `blog/images/` and reference them from your post as:

```markdown
![What the image shows](images/my-screenshot.png)
```

Tip: export screenshots as `.webp` or compressed `.png` under ~300 KB so pages stay fast on mobile. Blur or crop anything sensitive (IPs, hostnames, client names, tokens) before uploading.

## Check before you push

- `posts.json` is valid JSON. Paste it into https://jsonlint.com if unsure. One missing comma breaks the whole list.
- The slug in `posts.json` matches the file name exactly.
- Test locally: from the site folder run `python3 -m http.server 8000` and open http://localhost:8000/blog/

## Planned topics (ideas, not published posts)

- Lakera Gandalf: the prompt injection techniques that worked (jailbreaks, role-play, encoding tricks, indirect questions) and how they became Haris AI test cases
- Writing AI-attack detections in Wazuh mapped to MITRE ATLAS (from AegisSOC)
- Building Haris AI: an AI security gateway for UAE organisations
- TryHackMe AI security room write-ups: prompt injection, insecure output handling, attacking AI applications
