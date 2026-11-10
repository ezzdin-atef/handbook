# DESIGN.md — Ezzdin's Notes (Handbook)

The visual and interaction spec for the Handbook design. Product scope lives in `PRODUCT.md`.

## 1. Principles

1. **Always show where you are.** There's an active nav item, an expanded and highlighted sidebar folder or file, and a breadcrumb on every inner page.
2. **One obvious next step.** Each screen ends with somewhere to go: previous/next, "See all", "Show all N", "Back to note".
3. **Text first.** Typography carries the design. No illustrations, no cover images, and colour only where it means something.
4. **Quiet chrome, readable content.** Neutral grey UI, one accent (visitor-selectable), a body column of at most 700px.
5. **Git is visible but secondary.** Hashes and commit messages are set in small grey monospace text.

## 2. Tokens

### Colour
Neutrals are plain greys with no warm or blue tint, so the accent is the only colour on the page. Values live as CSS variables in `app/globals.css`, with dark overrides under `:root[data-theme="dark"]`.

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#FFFFFF` | `#111113` | Page background |
| `bg-subtle` | `#FAFAFA` | `#18181B` | README block, quotes, search button, table header |
| `bg-muted` | `#F4F4F5` | `#232326` | Inline code, pills, segmented-control track |
| `border` | `#E4E4E7` | `#2A2A2E` | Dividers, cards, sidebar edge |
| `border-strong` | `#D4D4D8` | `#3F3F46` | Inputs, secondary buttons |
| `text` | `#18181B` | `#FAFAFA` | Headings, primary text, primary button background |
| `text-body` | `#27272A` | `#E4E4E7` | Article body |
| `text-secondary` | `#3F3F46` | `#D4D4D8` | Nav links, sidebar items |
| `text-muted` | `#52525B` | `#A1A1AA` | Descriptions, intros |
| `text-subtle` | `#67676F` | `#8E8E96` | Meta, counts, labels (≥4.5:1 on `bg`, `bg-subtle`, `bg-muted`) |
| `success-soft` / `success` | `#E6F4EA` / `#14532D` | `#132B1D` / `#86EFAC` | "New" badge, diff additions |
| `danger-soft` / `danger` | `#FCEDEA` / `#9B1C1C` | `#331717` / `#FCA5A5` | Diff removals |
| `warn-soft` / `warn` | `#FDF0E2` / `#8A3B0C` | `#33230F` / `#FDBA74` | "Moved" badge |
| `mark-bg` / `mark-text` | `#FDE68A` / `#18181B` | `#5C4A0E` / `#FDE68A` | Search matches and text selection (a highlighter) |
| `code-bg` / `code-text` | `#18181B` / `#E4E4E7` | `#09090B` / `#E4E4E7` | Code blocks (always dark; bordered in dark mode) |
| `overlay` | `rgba(9,9,11,0.45)` | `rgba(0,0,0,0.6)` | Search and mobile-menu backdrop |

### Accent
All four accent tones come from one colour, `--accent-base` (default `#0E7A63`, green). Each tone fixes the OKLCH lightness and caps the chroma; only the hue comes from the base, so any colour a visitor picks stays readable.

| Token | Light (L / max C) | Dark (L / max C) | Use |
|---|---|---|---|
| `accent` | 0.52 / 0.20 | 0.74 / 0.16 | Active borders, focus ring |
| `accent-text` | 0.47 / 0.18 | 0.80 / 0.14 | Links and accent-coloured text |
| `accent-strong` | 0.36 / 0.14 | 0.88 / 0.09 | Text on `accent-soft` |
| `accent-soft` | 0.955 / 0.04 | 0.30 / 0.06 | Active nav item, active file, selected commit |

Checked across every hue (10° steps): `accent-text` on `bg` is ≥6.4:1 (light) and ≥9.4:1 (dark), and `accent-strong` on `accent-soft` is ≥9.2:1. Browsers without relative colour syntax fall back to fixed green tones.

Every text/background pair in this section meets WCAG AA (4.5:1) in both themes. Badges always pair colour with a word (New, Edited, Moved), and diff lines with a `+` or `−` sign.

### Appearance preferences
- The palette button in the header opens an Appearance popover: **Theme** (System / Light / Dark segmented control), **Accent colour** (8 presets: Green, Blue, Indigo, Violet, Pink, Red, Orange, Graphite, plus a custom colour picker) and **Reset to default**.
- Swatches show the tone the accent will actually get in the current theme. The selected one has a 2px `text` ring.
- Choices are saved per visitor in `localStorage` (`notes:prefs` = `{ theme, accent }`) and sync across open tabs. "System" follows the OS setting live.
- An inline script in `<head>` applies the theme (`data-theme` on `<html>`) and accent (`--accent-base`) before first paint, so there is no flash.
- Primary buttons and selected chips use `text` as the background and `bg` as the text, so they invert with the theme.

### Typography
- **UI and body:** Inter (400, 500, 600, 700)
- **Mono:** JetBrains Mono (400, 500) for hashes, file paths, inline code and code blocks

| Role | Size / line-height | Weight | Notes |
|---|---|---|---|
| H1 page | 32px / 1.2 | 700 | letter-spacing −0.02em |
| H1 note | 34px / 1.2 | 700 | |
| H2 in note | 22px / 1.3 | 700 | 32px top margin |
| Section label | 12–13px | 600 | UPPERCASE, +0.05em tracking, `text-subtle` |
| Body (note) | 16px / 1.8 | 400 | `text-body` |
| Intro / lead | 16px / 1.65 | 400 | `text-muted` |
| UI default | 14px | 400–600 | |
| Meta | 13px | 400 | `text-subtle` |
| Mono meta | 12px | 400 | |
| Inline code | 14px mono | 400 | `bg-muted`, 2px 6px padding, 4px radius |

Mobile: H1 26–28px, H2 20px, body 16px / 1.75.

### Spacing, radius, elevation
- **Spacing scale (px):** 4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32 · 40 · 48 · 72
- **Radius:** 4 (code, kbd) · 6 (sidebar items, tags) · 8 (buttons, inputs) · 10 (small cards, diff) · 12 (cards, panels) · 14 (search dialog) · 999 (pills, chips)
- **Shadows:** only on floating layers. The search dialog uses `0 24px 64px rgba(15,23,42,.3)`; the selected segment uses `0 1px 2px rgba(15,23,42,.08)`.

## 3. Layout

### Desktop (≥ 1024px)
```
┌──────────────────────────── Header (max 1280, 12/24 padding) ────────────────────────────┐
│ [E] Ezzdin's Notes   Home · All notes · Recently updated · About   [Search… ⌘K]  [GH]   │
├────────────┬──────────────────────────────────────────────┬──────────────┤
│ Sidebar    │ Main                                          │ Right rail   │
│ 220–260px  │ flex: 999 1 520–560px                          │ 200–240px    │
│ border-r   │ padding 32–36 / 40 / 72                        │ note only    │
│            │ article max-width 700px                        │              │
└────────────┴──────────────────────────────────────────────┴──────────────┘
```
- The container is at most 1280px wide and centred.
- The right rail appears only on Note. Every other page uses sidebar + main.

### Tablet (640–1023px)
- The right rail drops below the article, or is hidden with the TOC moving inline like on mobile.
- The sidebar stays if it fits; otherwise it collapses into the mobile drawer.

### Mobile (< 640px, designed at 390px)
- Sticky top bar, 56px high: menu (44×44) · logo · search (44×44).
- Content padding is 20px.
- The sidebar becomes a left drawer 320px wide over the `overlay` backdrop.
- Grids collapse to 1–2 columns, and previous/next stack vertically.

## 4. Components

### Header
- Logo: a 28px mark matching the favicon: a rounded square (7px radius on a 32 grid) filled with `text`, with a drawn lowercase "e" stroked in `bg`, so it inverts in dark mode. It tilts −6° on hover. Next to it is the wordmark `ezzdinatef/notes`: "ezzdinatef" in 16px/700 `text`, "/notes" in 15px mono 500 `text-subtle`, turning `accent-text` on hover. The favicon (`app/icon.svg`) is the same drawing in fixed `#18181B`/`#FAFAFA`, swapped by `prefers-color-scheme`.
- Appearance button: 40×40 palette icon between search and GitHub; opens the Appearance popover (272px wide, 12px radius, floating shadow), closed by Esc or a click outside.
- Nav item: 8/12 padding, 8px radius. Active items use `accent-soft` background and `accent-strong` 600 text, with `aria-current="page"`.
- Search trigger: at least 260px wide, 40px high, `bg-subtle`, `border-strong`, a ⌘K kbd hint, linking to the search overlay.
- GitHub icon button: 40×40, with an `aria-label`.

### Sidebar (folder tree)
- "BROWSE" section label.
- Folder row: folder icon, name, and a count right-aligned in `text-subtle`, with 8px padding. The open folder is 600 weight.
- File row: file icon and filename (with `.md`), indented 30px.
- Active file: a 2px `accent` left border, `accent-soft` background, `accent-strong` 600 text, and `aria-current="page"`.
- Overflow: "+ N more" in `accent-text`, linking to the folder page.
- Footer links, after a divider: "All N notes →" and "What changed lately →".

### Breadcrumb
- 13px `text-subtle`, with › separators. The last item is `text`, not a link.

### Cards
- **Start-here card:** 18px padding, `border`, 12px radius. It has a folder label (12px, `accent-text`, 600), a title (16px, 600) and a description (`text-muted`).
- **Folder tile:** 12/14 padding, 10px radius, with icon, name and count.
- **Prev/next card:** 16px padding, 10px radius. A direction label (12px `text-subtle`) sits over the title (600). "Next" is right-aligned.

### Lists
- **Recent row:** title (15px/600, flex-grow), folder, then mono "message" · relative date. Rows have a bottom border and wrap on narrow screens.
- **Folder note row:** a two-column grid of title and date, with the summary on its own line below.
- **Change row (Recent page):** a 76px badge column plus the content. The badge is 12px/600 with 2/8 padding and 6px radius.

### Table (All notes)
- `border` with 12px radius, and a `bg-subtle` header row using the section-label style.
- Cells have 14/16 padding with row dividers. The title column is a 600-weight link.
- It sits in an `overflow-x: auto` wrapper with a minimum width of 560px.

### Buttons and controls
- **Primary:** `text` background, white text, 8px radius, 40–44px high.
- **Secondary:** white with `border-strong`, `text` colour, 500 weight.
- **Chip (filter):** 999 radius, 36px high, 13px text. Selected chips are filled `text` with white text; unselected are white with `border-strong`. Uses `aria-pressed`.
- **Segmented control:** a `bg-muted` track with 4px padding. The selected segment is white, 600 weight, with a small shadow.
- **Select:** 6/10 padding, `border-strong`, 8px radius, with a visible label ("Sort by").
- Touch targets are at least 44px on mobile.

### Note meta row
- Updated date · `mono hash · "message"` · reading time, with **View history** and **Edit on GitHub** pushed right in `accent-text`.
- A bottom border separates it from the content.

### Article (Markdown rendering)
| Element | Style |
|---|---|
| `p` | 16px / 1.8, `text-body`, 16px bottom margin |
| `h2` | 22px/700, 32px top margin, anchor id for the TOC |
| `h3` | 18px/600, 24px top margin |
| `a` | `accent-text`, underlined in body |
| `ul/ol` | 22px left padding |
| `blockquote` | `bg-subtle`, 12/18 padding, 8px radius, no left bar |
| inline `code` | see Typography |
| code block | `code-bg` background, `code-text` text, 14px mono, 16/18 padding, 10px radius, horizontal scroll |

### Right rail
- **On this page:** H2s listed with a 2px left rule. The active heading gets an `accent` rule and `accent-strong` 600 text (scroll-spy).
- **Linked from:** a list of `accent-text` links.
- **Tags:** `bg-muted` pills with 6px radius that link to All notes filtered by that tag.

### Diff panel (History)
- A header bar (`bg-subtle`) with the commit title, +/− counts and "View this version".
- 13px mono lines with 1.8 line-height. Additions use `success-soft`/`success` with `+`; removals use `danger-soft`/`danger` with `−`; context lines are white.
- Commit list items are full-width buttons. The selected one has an `accent` border and `accent-soft` background, plus `aria-pressed`.

### Search dialog
- `overlay` backdrop; the dialog sits 96px from the top, at most 640px wide, with 14px radius.
- The input row is 60px high with a 17px input, a search icon and an `esc` kbd.
- Results scroll inside a 420px max height.
  - Group labels are in the section-label style.
  - Note results show the title on the left and the folder path on the right.
  - Heading results show `Note ›` in `text-subtle` followed by the heading.
  - Matches are wrapped in `<mark>` with `mark-bg` and `mark-text` (a highlighter yellow).
  - The active row has an `accent-soft` background.
- Footer (`bg-subtle`): "↑↓ to move · ↵ to open · esc to close", with the result count on the right.
- `role="dialog"` and `aria-label`; focus moves to the input and is trapped while the dialog is open.

### Mobile drawer
- 320px wide, full height, white, over the `overlay` backdrop.
- Head: logo plus a close button (44×44). Below it are the main nav and the folder tree, with rows at least 44px high.

## 5. States

| State | Treatment |
|---|---|
| Hover (links) | colour → `accent-text` |
| Focus | 2px `accent` outline, 2px offset, on every interactive element |
| Active/current | `accent-soft` + `accent-strong` + `aria-current` |
| Empty search | Centred message with a link to All notes |
| Empty filter | "No notes in this folder yet." plus a "Clear filter" link |
| Loading | Grey skeleton blocks in `bg-muted`, no spinners |
| Not found | 404 screen with a moved-note suggestion |

## 6. Motion
- Keep it minimal: 120–160ms ease-out for the dialog/drawer fade and slide, and for hover colours.
- Respect `prefers-reduced-motion` by turning transitions off.

## 7. Accessibility checklist
- Use landmarks (`header`, `nav[aria-label]`, `main`, `aside[aria-label]`) and one H1 per page.
- Interactive elements must be real `<a>` or `<button>`, and icon-only buttons need an `aria-label`.
- Inputs need labels (visually hidden where the design hides them).
- Text contrast is at least 4.5:1, and meaning never relies on colour alone.
- Everything works with the keyboard: ⌘K, `/`, Esc and the arrow keys in search.

## 8. Screen inventory (canvas)
| # | Screen | Canvas file |
|---|---|---|
| 1 | Home | `hb/Home.dc.html` |
| 2 | Folder | `hb/Folder.dc.html` |
| 3 | Note | `hb/Note.dc.html` |
| 4 | Note history | `hb/History.dc.html` |
| 5 | All notes | `hb/AllNotes.dc.html` |
| 6 | Recently updated | `hb/Recent.dc.html` |
| 7 | Search ⌘K | `hb/Search.dc.html` |
| 8 | About | `hb/About.dc.html` |
| 9 | 404 | `hb/NotFound.dc.html` |
| 10 | Mobile home | `hb/MobileHome.dc.html` |
| 11 | Mobile menu | `hb/MobileMenu.dc.html` |
| 12 | Mobile note | `hb/MobileNote.dc.html` |

## 9. Implementation notes
- Define the tokens as CSS variables (`--color-accent`, etc.) or in the Tailwind theme. Names above map 1:1.
- Load both fonts with `next/font` to avoid layout shift.
- Code highlighting with Shiki should use a dark theme; the block background is forced to `code-bg`.
- Dark mode and accent colours ship: see Appearance preferences in section 2.
