import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { site } from "@/site.config";
import { renderMarkdown, fileToSlug, type Heading } from "./markdown";
import { fileHistory, renames, stripPrefix, type Commit } from "./git";

export type { Heading } from "./markdown";
export type { Commit, DiffLine } from "./git";

export type Note = {
  slug: string; // "rust/ownership"
  fileName: string; // "ownership.md"
  /** Path relative to the app dir, e.g. "notes/rust/ownership.md". */
  sourcePath: string;
  folder: string; // "rust" or "rust/devdock"
  title: string;
  summary: string;
  tags: string[];
  order: number | null;
  startHere: boolean;
  html: string;
  headings: Heading[];
  links: string[];
  backlinks: string[];
  readingMinutes: number;
  plainText: string;
  created: string; // ISO
  updated: string; // ISO
  lastCommit: { short: string; message: string } | null;
  history: Commit[];
};

export type Folder = {
  slug: string; // "rust" or "rust/devdock"
  name: string;
  sourcePath: string; // "notes/rust"
  readme: { html: string; sourcePath: string } | null;
  notes: Note[]; // reading order
  folders: Folder[];
  /** Notes in this folder and all subfolders. */
  count: number;
};

export type Site = {
  root: Folder; // slug ""
  intro: string | null; // rendered notes/README.md
  notes: Note[]; // every note, flat
  bySlug: Map<string, Note>;
  folderBySlug: Map<string, Folder>;
  redirects: Record<string, { to: string; short: string; date: string }>;
};

const NOTES_DIR = site.notesDir;
const WORDS_PER_MINUTE = 200;

const isIgnored = (name: string) => name.startsWith("_") || name.startsWith(".");

function byReadingOrder(a: Note, b: Note) {
  // 1. Notes with `order` come first, lowest number first.
  if (a.order !== null && b.order !== null && a.order !== b.order) return a.order - b.order;
  if (a.order !== null && b.order === null) return -1;
  if (a.order === null && b.order !== null) return 1;
  // 2. Everything else in the order it was written (oldest first), so a folder
  //    reads like the path you learned it on without any manual numbering.
  if (a.created !== b.created) return a.created.localeCompare(b.created);
  // 3. Same creation time (e.g. added in one commit): alphabetical.
  return a.title.localeCompare(b.title);
}

/** `date: 2026-01-15` in front-matter (YAML gives a Date) or any parseable string. */
function parseDate(value: unknown): string | null {
  if (value instanceof Date && !isNaN(value.getTime())) return value.toISOString();
  if (typeof value === "string" && value.trim()) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return null;
}

/** `tags: [a, b]` or `tags: a, b`. */
function parseTags(value: unknown): string[] {
  const list = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return [...new Set(list.map((t) => String(t).trim().replace(/^#/, "")).filter(Boolean))];
}

function warnField(sourcePath: string, field: string, expected: string) {
  console.warn(`[notes] ${sourcePath}: ignoring "${field}", expected ${expected}.`);
}

function titleFromFile(fileName: string) {
  const base = fileName.replace(/\.md$/i, "").replace(/[-_]+/g, " ");
  return base.charAt(0).toUpperCase() + base.slice(1);
}

async function loadNote(relPath: string, folder: string): Promise<Note | null> {
  const sourcePath = path.posix.join(NOTES_DIR, relPath);
  const raw = fs.readFileSync(sourcePath, "utf8");
  const { data, content } = matter(raw);
  if (data.draft === true) return null;

  const hasTitle = typeof data.title === "string" && data.title.trim();
  const rendered = await renderMarkdown(content, { relPath, stripLeadingH1: !hasTitle });
  const fileName = path.posix.basename(relPath);
  const title = hasTitle ? String(data.title) : rendered.h1 ?? titleFromFile(fileName);

  // Dates: front-matter `date` > first git commit > file creation time.
  const history = fileHistory(sourcePath);
  const stat = fs.statSync(sourcePath);
  const fileCreated = (stat.birthtimeMs > 0 && stat.birthtime < stat.mtime ? stat.birthtime : stat.mtime).toISOString();
  const updated = history[0]?.date ?? stat.mtime.toISOString();
  const fmDate = parseDate(data.date);
  if (data.date !== undefined && !fmDate) warnField(sourcePath, "date", "a date like 2026-01-15");
  const created = fmDate ?? history[history.length - 1]?.date ?? fileCreated;
  const words = rendered.plainText.split(/\s+/).filter(Boolean).length;

  if (data.order !== undefined && typeof data.order !== "number") warnField(sourcePath, "order", "a number");
  for (const flag of ["start_here", "draft"] as const) {
    if (data[flag] !== undefined && typeof data[flag] !== "boolean") warnField(sourcePath, flag, "true or false");
  }

  return {
    slug: fileToSlug(relPath),
    fileName,
    sourcePath,
    folder,
    title,
    summary: typeof data.summary === "string" ? data.summary : "",
    tags: parseTags(data.tags),
    order: typeof data.order === "number" ? data.order : null,
    startHere: data.start_here === true,
    html: rendered.html,
    headings: rendered.headings,
    links: rendered.links,
    backlinks: [],
    readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    plainText: rendered.plainText,
    created,
    updated,
    lastCommit: history[0] ? { short: history[0].short, message: history[0].message } : null,
    history,
  };
}

async function loadFolder(relDir: string, all: Note[], folders: Map<string, Folder>): Promise<Folder> {
  const abs = path.join(NOTES_DIR, relDir);
  // A missing notes/ folder is treated as "no notes yet" rather than a build error.
  const entries = fs.existsSync(abs)
    ? fs
        .readdirSync(abs, { withFileTypes: true })
        .filter((e) => !isIgnored(e.name))
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];
  const slug = relDir.replace(/\\/g, "/");

  let readme: Folder["readme"] = null;
  const notes: Note[] = [];
  const subfolders: Folder[] = [];

  for (const entry of entries) {
    const rel = path.posix.join(slug, entry.name);
    if (entry.isDirectory()) {
      const sub = await loadFolder(rel, all, folders);
      if (sub.count > 0 || sub.readme) subfolders.push(sub);
    } else if (/\.md$/i.test(entry.name)) {
      if (/^readme\.md$/i.test(entry.name)) {
        const { content } = matter(fs.readFileSync(path.join(abs, entry.name), "utf8"));
        const r = await renderMarkdown(content, { relPath: rel });
        readme = { html: r.html, sourcePath: path.posix.join(NOTES_DIR, rel) };
      } else {
        const note = await loadNote(rel, slug);
        if (note) notes.push(note);
      }
    }
  }

  notes.sort(byReadingOrder);
  subfolders.sort((a, b) => a.name.localeCompare(b.name));
  all.push(...notes);

  const folder: Folder = {
    slug,
    name: slug ? path.posix.basename(slug) : "notes",
    sourcePath: path.posix.join(NOTES_DIR, slug),
    readme,
    notes,
    folders: subfolders,
    count: notes.length + subfolders.reduce((n, f) => n + f.count, 0),
  };
  folders.set(slug, folder);
  return folder;
}

function buildRedirects(bySlug: Map<string, Note>): Site["redirects"] {
  const result: Site["redirects"] = {};
  const prefix = NOTES_DIR + "/";
  const toSlug = (p: string) => {
    const rel = stripPrefix(p);
    return rel.startsWith(prefix) ? fileToSlug(rel.slice(prefix.length)) : null;
  };
  // Newest first, so later renames win and chains resolve to the current path.
  const alias = new Map<string, string>();
  for (const r of renames(NOTES_DIR)) {
    const from = toSlug(r.from);
    const to = toSlug(r.to);
    if (!from || !to) continue;
    const current = alias.get(to) ?? to;
    alias.set(from, current);
    if (!bySlug.has(from) && bySlug.has(current) && !result[from]) {
      result[from] = { to: current, short: r.short, date: r.date };
    }
  }
  return result;
}

let cache: Promise<Site> | null = null;
let warnedBroken = false;

export function getSite(): Promise<Site> {
  if (!cache || process.env.NODE_ENV === "development") cache = loadSite();
  return cache;
}

async function loadSite(): Promise<Site> {
  const notes: Note[] = [];
  const folderBySlug = new Map<string, Folder>();
  const root = await loadFolder("", notes, folderBySlug);
  // Notes directly under notes/ are allowed but uncommon; README there is the home intro.
  const intro = root.readme?.html ?? null;

  const bySlug = new Map(notes.map((n) => [n.slug, n]));
  const broken: string[] = [];
  for (const note of notes) {
    for (const target of note.links) {
      const t = bySlug.get(target);
      if (t && t !== note && !t.backlinks.includes(note.slug)) t.backlinks.push(note.slug);
      if (!t && !folderBySlug.has(target)) broken.push(`  ${note.sourcePath} -> /${target}`);
    }
  }
  // Broken links still build (visitors get the 404 page), but flag them once per build.
  if (broken.length && !warnedBroken) {
    warnedBroken = true;
    console.warn(`[notes] ${broken.length} link(s) point to notes that don't exist:\n${broken.join("\n")}`);
  }

  return { root, intro, notes, bySlug, folderBySlug, redirects: buildRedirects(bySlug) };
}

/** Notes sorted newest-updated first. */
export function byUpdated(notes: Note[]) {
  return [...notes].sort((a, b) => b.updated.localeCompare(a.updated));
}

export type Change = {
  hash: string;
  short: string;
  date: string;
  message: string;
  kind: Commit["kind"];
  slug: string;
  title: string;
  folder: string;
};

/** Every commit that touched a note, newest first. Falls back to file dates without git. */
export function allChanges(notes: Note[]): Change[] {
  const changes: Change[] = [];
  for (const n of notes) {
    const base = { slug: n.slug, title: n.title, folder: n.folder };
    if (n.history.length) {
      for (const c of n.history) {
        changes.push({ ...base, hash: c.hash, short: c.short, date: c.date, message: c.message, kind: c.kind });
      }
    } else {
      changes.push({ ...base, hash: "", short: "", date: n.updated, message: "", kind: "edited" });
    }
  }
  return changes.sort((a, b) => b.date.localeCompare(a.date));
}

export function githubUrl(kind: "edit" | "tree" | "blob" | "commits", p: string, ref = site.branch) {
  if (!site.repo) return null;
  if (kind === "commits") return `${site.repo}/commits/${ref}/${p}`;
  return `${site.repo}/${kind}/${ref}/${p}`;
}
