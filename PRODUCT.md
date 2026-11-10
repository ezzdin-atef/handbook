# PRODUCT.md — Ezzdin's Notes (Handbook)

## 1. What it is

A personal knowledge site where I dump what I learn and think about while building. It's a **notebook first, a website second**: notes are written for me, not polished for readers, but anyone who lands on the site should still understand where to go and what to click.

Notes are **plain Markdown files in a git repo**. The site is a read-only view of that repo, shaped like a docs handbook.

## 2. Goals

1. **Zero-friction writing**: write a `.md` file, commit and push. No CMS, no admin panel, no database.
2. **Easy to find things again**: in two clicks or one search, for me and for visitors.
3. **Clear for strangers**: a first-time visitor knows within seconds what the site is, where to start, and how to move around.
4. **Git is the history**: every note shows when it changed and why, taken straight from commits.

## 3. Non-goals

- No comments, likes, accounts or newsletter.
- No rich content types (snippet cards, link cards, embeds). **Everything is text Markdown**: headings, paragraphs, lists, quotes, inline code and code blocks.
- No in-browser editor. Editing happens in my editor, or on GitHub through the "Edit on GitHub" link.
- No polished blog layout (cover images, author bios on every post).

## 4. Audience

| Who | Needs |
|---|---|
| **Me** (primary) | Dump notes fast, find them again, see what I changed. |
| **Visitors** (devs, colleagues, people from X or LinkedIn) | Understand the site at a glance, browse a topic, search, read comfortably. |

## 5. Content model

### Repo layout
```
notes/
├── README.md              # home intro (optional)
├── rust/
│   ├── README.md          # folder intro + suggested reading order
│   ├── ownership.md
│   └── wasm/              # subfolders allowed (max 2 levels recommended)
├── web/
├── threejs/
├── work/
├── devops/
└── thoughts/
```

- **Folder = topic.** The sidebar mirrors the folder tree exactly.
- **File = note.** The slug comes from the path: `rust/ownership.md` → `/rust/ownership`.
- A folder's `README.md` is shown at the top of its folder page and is not listed as a note.

### Front-matter (all optional)
```yaml
---
title: Ownership, explained to past me   # default: first H1, else filename
summary: The mental model that made borrowing click.   # shown in lists
tags: [basics, mental-model]
date: 2026-01-15    # override the created date (default: first git commit)
order: 2            # pin a position in the folder's reading order
start_here: true    # pin to Home → "Start here" (max 3)
draft: true         # excluded from the build
---
```

**Reading order** inside a folder: notes with `order` first (lowest first), then every other note by created date, oldest first, so a folder reads in the order things were learned without manual numbering. Ties are alphabetical. Full reference in `README.md`.

### Derived from git (never written by hand)
- Created date: the first commit touching the file (unless `date` overrides it)
- Updated date, commit hash and commit message: the last commit
- Full history: the commit list plus a diff per commit
- Renames and moves, used for the 404 "moved to" suggestion

### Derived from content
- Reading time
- Table of contents from H2/H3 headings
- Backlinks ("Linked from"): every note that links to this one
- Previous/next: the neighbouring notes in the folder's reading order

## 6. Information architecture

```
Header:  Logo · Home · All notes · Recently updated · About · [Search ⌘K] · GitHub
Sidebar: Browse (folder tree) · All N notes → · What changed lately →
```

| Route | Screen | Purpose |
|---|---|---|
| `/` | Home | Intro, Start here (3 notes), folder grid, latest 4 changes |
| `/:folder` | Folder | README intro, subfolders, notes in reading order |
| `/:folder/:note` | Note | Article, meta, TOC, backlinks, tags, previous/next |
| `/:folder/:note/history` | Note history | Commit list + diff of the selected commit |
| `/notes` | All notes | Table of every note, filter by folder/tag, sort |
| `/notes?tag=x` | All notes (tag) | Same table, pre-filtered (no separate tag page) |
| `/recent` | Recently updated | Changes grouped by day, labelled New / Edited / Moved |
| `/about` | About | Who I am, how to navigate, how it's built, links |
| *(overlay)* | Search ⌘K | Title + heading search from any page |
| `*` | 404 | Explains the miss, suggests a moved/renamed note |

## 7. Features by screen

### Home
- One-sentence intro saying who I am and that these are personal, rough notes.
- **Start here**: up to 3 notes with `start_here: true`.
- **Folders**: every top-level folder with its note count.
- **Recently updated**: the last 4 changed notes, each with folder, commit message and relative date. "See all changes →" goes to `/recent`.

### Folder
- Breadcrumb `Notes › folder`.
- Title, a note-count pill and an "Open folder on GitHub" link.
- `README.md` intro block, labelled with its file path.
- Subfolder chips with counts.
- Notes list with title, summary and updated date. Sort by reading order (default), recently updated or A–Z.
- Show 8 notes, then "Show all N".

### Note
- Breadcrumb, H1, and a meta row: updated date · short hash + commit message · reading time · **View history** · **Edit on GitHub**.
- Rendered Markdown.
- Right rail: **On this page** (TOC with scroll-spy), **Linked from**, **Tags**.
- Previous/next cards inside the same folder.
- The sidebar expands the current folder and highlights the current file.

### Note history
- A list of commits (message, hash, date); the selected one is highlighted.
- Diff panel with line counts (+/−) and a "View this version" link that opens the note as of that commit.
- "Back to note" button.

### All notes
- Summary line, e.g. "Showing 9 of 81 notes across 6 folders".
- Folder filter chips (single select), tag filter, and sort (recently updated, A–Z, oldest).
- Table columns: Title · Folder · Tags · Updated. It scrolls sideways on small screens.

### Recently updated
- A feed of commits that touched notes, grouped by day and newest first.
- Each item has a badge (**New**, **Edited** or **Moved**), the note title, the folder, the short hash and the message.
- A toggle between all changes and new notes only, plus "Load older changes".

### Search (⌘K)
- Opens with ⌘K / Ctrl+K, `/`, or the header button. Closes with Esc or a click outside.
- Searches note titles and H2/H3 headings, plus body text if the index size allows.
- Results are grouped: **Notes**, then **Headings inside notes** (shown as `Note › Heading`). The matched text is highlighted.
- Keyboard: ↑/↓ moves, ↵ opens, and the first result is selected by default.
- The empty state suggests a shorter word or links to All notes.
- Runs client-side with a prebuilt index (no server).

### About
- Short bio, a statement that the notes are rough, and 3 numbered tips for getting around (folders, ⌘K, recent).
- "How it's built", with a small repo-tree illustration.
- Links: X (@ezzdin_atef), LinkedIn, GitHub repo.

### 404
- Shows the requested path.
- If git history shows the file was renamed or moved, it shows "closest match" with the new location and the commit that moved it. It also sets up a redirect if possible.
- Two buttons: Search notes, Go home.

### Mobile
- Top bar: menu · logo · search.
- The menu is a left drawer with the main nav plus the folder tree.
- On the note screen the TOC becomes a collapsible "On this page" block under the meta row, and previous/next stack vertically.

## 8. Build & publishing flow

1. Write or edit `.md` → commit → push to `main`.
2. CI builds the site: it reads the repo and git log, then generates pages, the search index, backlinks and the redirect map.
3. It deploys as a static site.

Notes with `draft: true`, files starting with `_`, and anything outside `notes/` are ignored.

## 9. Suggested stack (open to change)
- **Next.js** (App Router, static export / SSG) reading the repo at build time.
- Markdown: `remark` / `rehype` (+ `rehype-slug`, `rehype-autolink-headings`, Shiki for code).
- Git data: `git log --follow --name-status` at build time (needs a full clone in CI, not shallow).
- Search: a prebuilt JSON index + MiniSearch or FlexSearch, or Pagefind.
- Hosting: Vercel, Netlify or GitHub Pages.

## 10. Scope

**MVP**: Home, Folder, Note, All notes, Search, About, 404, mobile layouts, Edit on GitHub, updated date from git.

**v1.1**: Note history with diff, Recently updated feed, backlinks, moved-note redirects.

**Later**: RSS for recent changes, a graph of links.

## 11. Success signals (for me)
- Time from "learned something" to "note online" is under 2 minutes.
- I find an old note in 1 search or 2 clicks.
- Visitors reach a note from Home without using the browser's back button to recover.

## 12. Open questions
- Should tags matter, or are folders enough?
- Is full-text body search worth the index size, or are titles and headings enough?
- Should the repo itself be public, or private with only the site public? This decides whether "Edit on GitHub" and "View source" links appear.
