# notes.ezzdinatef.com

My personal notes handbook. Notes are plain Markdown files in `notes/`. The site is a static Next.js export built from those files plus their git history. There's no CMS, database or admin panel: write a file, push, done.

- **Product scope:** [`PRODUCT.md`](PRODUCT.md)
- **Visual spec and tokens:** [`DESIGN.md`](DESIGN.md)

---

## Contents

1. [Quick start](#quick-start)
2. [Writing a note](#writing-a-note)
3. [Front-matter reference](#front-matter-reference)
4. [How notes are ordered](#how-notes-are-ordered)
5. [Folders, READMEs and URLs](#folders-readmes-and-urls)
6. [Linking between notes](#linking-between-notes)
7. [What comes from git](#what-comes-from-git)
8. [Site settings](#site-settings)
9. [Visitor appearance settings](#visitor-appearance-settings)
10. [Deploying](#deploying)
11. [Project structure](#project-structure)
12. [Troubleshooting](#troubleshooting)

---

## Quick start

Requires Node.js 20 or newer.

```bash
npm install
npm run dev          # http://localhost:3000, reloads as you edit notes
npm run build        # static site in out/
npm run start        # serve out/ locally to check the real build
npm run typecheck    # TypeScript only
```

---

## Writing a note

1. Create a `.md` file in a folder under `notes/`, for example `notes/rust/ownership.md`.
2. Write Markdown. Front-matter is optional (see below).
3. Commit and push to `main`. CI rebuilds and deploys the site.

The smallest valid note is just text:

```markdown
# Ownership, explained to past me

Every value has exactly one owner...
```

Supported Markdown: headings, paragraphs, lists, quotes, links, images, tables (GitHub style), inline code and fenced code blocks with syntax highlighting. `##` and `###` headings appear in the note's "On this page" table of contents.

---

## Front-matter reference

> **Required: nothing.** Every field is optional. A note with no front-matter at all builds fine; the title comes from its first `# Heading` or, failing that, its file name.

Front-matter is a YAML block at the very top of the file, between two `---` lines.

### Recommended (fill these in on most notes)

| Field | Type | Default if missing | What it does |
|---|---|---|---|
| `title` | text | First `# H1` in the note, else the file name (`ownership.md` → "Ownership") | Page title, lists, search, browser tab. If set, a leading `# H1` in the body is kept as normal content; if not set, that H1 becomes the title and is removed from the body so it isn't shown twice. |
| `summary` | text | none | One line under the title in folder lists, Home cards and search matching. |
| `tags` | list or comma text | none | Shown as `#tag` pills on the note; each links to All notes filtered by that tag. `[a, b]` and `a, b` both work. Write tags without `#`: in YAML an unquoted `#` starts a comment, so `tags: a, #b` silently becomes just `a`. |

### Ordering and placement

| Field | Type | Default if missing | What it does |
|---|---|---|---|
| `order` | number | none: falls back to created date | Pins the note to a position in its folder's reading order. See [How notes are ordered](#how-notes-are-ordered). |
| `date` | date (`2026-01-15`) | Date of the first git commit for the file | Overrides the **created** date. Use it when importing old notes, so they sort where they belong instead of on the day you copied them in. It does not change the "Updated" date, which always comes from git. |
| `start_here` | `true` / `false` | `false` | Shows the note in Home → "Start here". Only 3 are shown; with more, the first 3 found win (folders A–Z, a folder's subfolders before its own notes). Keep it to 3. |

### Publishing

| Field | Type | Default if missing | What it does |
|---|---|---|---|
| `draft` | `true` / `false` | `false` | `true` leaves the note out of the build entirely: no page, no search entry, no links to it. |

### Full example

```yaml
---
title: Ownership, explained to past me
summary: The mental model that finally made borrowing click.
tags: [basics, mental-model]
order: 2
date: 2026-01-15
start_here: true
draft: false
---
```

### Validation

A field with the wrong type is **ignored with a build warning**, not a failure. For example `order: "two"` prints:

```
[notes] notes/rust/ownership.md: ignoring "order", expected a number.
```

Unknown fields are ignored silently, so you can keep your own keys in front-matter.

---

## How notes are ordered

Inside each folder, notes are listed in **reading order**. This drives the folder page (with `1.`, `2.` numbering), the sidebar and the Previous/Next cards at the bottom of each note.

The rules, applied in this order:

1. **Notes with `order`** come first, lowest number first. Use it only to pin an intro or "start with this" note to the top.
2. **Every other note by created date, oldest first.** Folders read in the order you learned things, with no manual numbering. A note added today goes to the end.
3. **Ties** (same created time, for example several notes added in one commit) are alphabetical by title.

The created date comes from the `date` field if you set it, otherwise the first git commit that added the file, otherwise the file's creation time on disk.

Example folder:

| File | `order` | Created | Position |
|---|---|---|---|
| `learning-rust.md` | `1` | Mar 3 | **1** (pinned) |
| `ownership.md` | — | Jan 10 | **2** (oldest of the rest) |
| `lifetimes.md` | — | Feb 2 | **3** |
| `wasm.md` | — | Apr 20 | **4** |

Most notes need no `order` at all. Reach for it when one note has to come first no matter when it was written. Leave gaps (`10`, `20`, `30`) if you pin several, so you can slot one in later without renumbering.

Visitors can re-sort a folder by "Recently updated" or "A–Z" on the folder page. All notes and Recently updated have their own sorting and don't use reading order.

---

## Folders, READMEs and URLs

```
notes/
├── README.md              # optional: replaces the Home intro text
├── rust/
│   ├── README.md          # optional: intro block at the top of /rust
│   ├── ownership.md       # → /rust/ownership
│   └── wasm/              # subfolder → /rust/wasm
│       └── bindgen.md     # → /rust/wasm/bindgen
└── thoughts/
    └── notes-not-blog.md  # → /thoughts/notes-not-blog
```

- **Folder = topic.** The sidebar mirrors the folder tree. Folders are listed A–Z. Two levels deep is the practical limit for the sidebar.
- **File = note.** The URL is the path without `.md`. Renaming or moving a file changes its URL. The old URL then shows a 404 that redirects to the new location (see [What comes from git](#what-comes-from-git)).
- **`README.md`** in a folder is that folder's intro, not a note. `notes/README.md` replaces the default Home intro.
- **Ignored:** files and folders starting with `_` or `.`, notes with `draft: true`, and anything outside `notes/`.
- **Each note has a history page** at its URL plus `/history`, for example `/rust/ownership/history`.

---

## Linking between notes

Link with **relative paths to the `.md` file**, exactly as you would on GitHub:

```markdown
See [lifetimes](./lifetimes.md) or [the wasm notes](./wasm/bindgen.md#setup).
Up a level: [ownership](../ownership.md). A folder: [rust](../README.md).
```

At build time these become site URLs (`/rust/lifetimes`). They also feed the **"Linked from"** list on the target note. Links still work when browsing the repo on GitHub.

A link to a note that doesn't exist doesn't fail the build. It prints a warning, and visitors who click it get the 404 page:

```
[notes] 1 link(s) point to notes that don't exist:
  notes/rust/ownership.md -> /rust/nope
```

External links (`https://...`) are left as they are.

---

## What comes from git

These are read from `git log` at build time; you never write them by hand:

| Shown as | Source |
|---|---|
| "Updated Nov 7, 2026", short hash and commit message on each note | Last commit touching the file |
| Created date (and so the default reading order) | First commit touching the file, unless `date` overrides it |
| History page with a diff per commit | Every commit touching the file, following renames |
| Recently updated feed (New / Edited / Moved) | Every commit touching any note |
| 404 "This note has moved" and auto-redirect | Renames recorded by git |

Without a git repo the site still builds. Dates fall back to file times, and history, the feed badges and moved-note redirects are empty.

**Commit messages are public.** They appear on notes and in the feed, so write them for readers ("rewrite key analogy", not "wip").

---

## Site settings

Everything personal lives in [`site.config.ts`](site.config.ts):

| Setting | Used for |
|---|---|
| `name` | Browser tab titles ("Note title · Ezzdin's Notes") |
| `logoName`, `logoPath` | Header wordmark, shown as `ezzdinatef/notes` |
| `author` | Home greeting and About |
| `url` | Canonical site URL for metadata |
| `description` | Default meta description |
| `repo` | "Edit on GitHub", "Open folder on GitHub", history "View this version", About source link. Set to `""` to hide all of them (for a private repo). |
| `branch` | Branch used in those GitHub links |
| `notesDir` | Folder the notes are read from (default `notes`) |
| `social` | Portfolio, GitHub, LinkedIn and X links on Home, About, the sidebar and the header. Remove an entry to hide it everywhere. |

---

## Visitor appearance settings

Each visitor can open the palette button in the header and choose:

- **Theme:** System (follows the OS setting), Light or Dark.
- **Accent colour:** 8 presets or any custom colour. Shades are computed so text stays readable (WCAG AA) in both themes.

Choices are stored in the visitor's browser (`localStorage`, key `notes:prefs`) and sync across their open tabs. Nothing is sent to a server. The default accent is green (`#0e7a63`); change `--accent-base` in [`app/globals.css`](app/globals.css) and `DEFAULT_ACCENT` in [`lib/theme.ts`](lib/theme.ts) to change it for everyone.

---

## Deploying

`npm run build` writes a fully static site to `out/`, including `404.html`, `search-index.json` and `redirects.json`. Any static host works.

**Use a full git clone in CI.** A shallow clone has only the last commit, so every note would show the same date and history would be empty.

GitHub Actions example:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0        # full history: required for dates, history and redirects
- uses: actions/setup-node@v4
  with:
    node-version: 22
- run: npm ci
- run: npm run build
# then upload ./out to GitHub Pages, Netlify, Cloudflare Pages, etc.
```

- **Vercel / Netlify:** both clone with history by default and serve `404.html` for unknown URLs. Build command `npm run build`, output directory `out`.
- **GitHub Pages:** serves `404.html` automatically. Deploy the `out/` folder.

---

## Project structure

```
app/                     routes (App Router)
  page.tsx               Home
  [...slug]/page.tsx     folder pages, note pages and /history
  notes/  recent/  about/
  not-found.tsx          404 page
  search-index.json/     search index generated at build time
  redirects.json/        old URL → new URL, from git renames
  globals.css            all styles and design tokens
components/              UI (header, sidebar, search, appearance menu, views)
lib/
  content.ts             reads notes/, front-matter, ordering, backlinks
  markdown.ts            Markdown → HTML, headings, link rewriting
  git.ts                 git log parsing (history, diffs, renames)
  theme.ts               visitor preferences (theme + accent)
notes/                   your notes
site.config.ts           personal settings
```

---

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Every note shows the same date | Built without git history. Use a full clone (`fetch-depth: 0`). Locally, make sure the folder is a git repo and the notes are committed. |
| A note is missing | Check for `draft: true`, a file name starting with `_`, or a file outside `notes/`. |
| Note is in the wrong position | Check its `order` and `date`. Without them, position follows the first commit date. |
| `[notes] ... ignoring "order"` warning | The field has the wrong type; see [Validation](#validation). |
| `[notes] ... link(s) point to notes that don't exist` | Fix the relative `.md` path in the listed note. |
| "Edit on GitHub" opens a 404 | `repo` or `branch` in `site.config.ts` doesn't match your GitHub repo, or the repo is private. |
| Empty site shows a `/_empty` page in the build | Expected. Static export needs at least one generated page; it disappears once you add a note. |
