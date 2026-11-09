# How to write a post

This file is a template. It is set to `"published": false` in `posts.json`, so it never shows on the site. Copy it, rename it, and write your own post.

Preview it locally at `post.html?slug=how-to-write-a-post&preview=1`.

## Headings

Use `##` for main sections and `###` for sub-sections. The post title comes from `posts.json`, so you do not need a `#` title at the top (if you add one, the page hides it so it is not shown twice).

### A sub-section

Normal paragraphs are just text. You can use **bold**, *italic* and `inline code`.

## Lists

- Bullet one
- Bullet two
- Bullet three

1. Numbered step one
2. Numbered step two

## Code blocks

Put the language after the three backticks to get syntax highlighting.

```python
def is_injection(prompt: str) -> bool:
    markers = ["ignore previous instructions", "you are now"]
    return any(m in prompt.lower() for m in markers)
```

```bash
docker compose up -d
```

## Quotes

> Use a quote block for key takeaways or notes.

## Images

Put images in `/blog/images/` and link them like this. Always write alt text.

![Short description of the image](images/example.png)

## Links

Link to things like this: [MITRE ATLAS](https://atlas.mitre.org/).

## Tables

| Column | Column |
| ------ | ------ |
| Value  | Value  |
