"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { href, type SearchEntry } from "@/lib/tree";
import { SearchIcon } from "./Icons";
import { useDialogFocus } from "./useDialogFocus";

const OPEN_EVENT = "notes:open-search";
const LIMIT = 8;

export function openSearch() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

type Result =
  | { kind: "note"; entry: SearchEntry; key: string; url: string }
  | { kind: "heading"; entry: SearchEntry; heading: { text: string; id: string }; key: string; url: string };

let indexPromise: Promise<SearchEntry[]> | null = null;
function loadIndex() {
  indexPromise ??= fetch("/search-index.json")
    .then((r) => r.json() as Promise<SearchEntry[]>)
    .catch(() => {
      indexPromise = null;
      return [];
    });
  return indexPromise;
}

function search(index: SearchEntry[], query: string): Result[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return index.slice(0, LIMIT).map((e) => ({ kind: "note", entry: e, key: e.slug, url: href(e.slug) }));
  }
  const scored: { e: SearchEntry; score: number }[] = [];
  for (const e of index) {
    const t = e.title.toLowerCase();
    let score = 0;
    if (t.startsWith(q)) score = 100;
    else if (t.includes(q)) score = 80;
    else if (e.tags.some((tag) => tag.toLowerCase().includes(q))) score = 50;
    else if (e.summary.toLowerCase().includes(q)) score = 40;
    else if (e.body.toLowerCase().includes(q)) score = 10;
    if (score) scored.push({ e, score });
  }
  scored.sort((a, b) => b.score - a.score);
  const notes: Result[] = scored.slice(0, LIMIT).map(({ e }) => ({ kind: "note", entry: e, key: e.slug, url: href(e.slug) }));

  const headings: Result[] = [];
  for (const e of index) {
    for (const h of e.headings) {
      if (h.text.toLowerCase().includes(q)) {
        headings.push({ kind: "heading", entry: e, heading: h, key: `${e.slug}#${h.id}`, url: `${href(e.slug)}#${h.id}` });
        if (headings.length >= LIMIT) break;
      }
    }
    if (headings.length >= LIMIT) break;
  }
  return [...notes, ...headings];
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const parts: React.ReactNode[] = [];
  let i = 0;
  let at = lower.indexOf(needle);
  while (at !== -1) {
    if (at > i) parts.push(text.slice(i, at));
    parts.push(<mark key={at}>{text.slice(at, at + q.length)}</mark>);
    i = at + q.length;
    at = lower.indexOf(needle, i);
  }
  parts.push(text.slice(i));
  return <>{parts}</>;
}

function Dialog({ onClose }: { onClose: () => void }) {
  const ref = useDialogFocus<HTMLDivElement>(onClose);
  const router = useRouter();
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadIndex().then(setIndex);
  }, []);

  const results = useMemo(() => (index ? search(index, query) : []), [index, query]);
  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (r: Result) => {
    onClose();
    router.push(r.url);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  };

  const notes = results.filter((r) => r.kind === "note");
  const headings = results.filter((r) => r.kind === "heading");
  const labelId = "search-input";

  const renderRow = (r: Result, i: number) => (
    <Link
      key={r.key}
      href={r.url}
      id={`search-opt-${i}`}
      role="option"
      aria-selected={i === active}
      className="result"
      data-active={i === active}
      onMouseMove={() => setActive(i)}
      onClick={(e) => {
        e.preventDefault();
        go(r);
      }}
    >
      {r.kind === "note" ? (
        <>
          <span className="result__title">
            <Highlight text={r.entry.title} query={query} />
          </span>
          <span className="result__path">{r.entry.folder}/</span>
        </>
      ) : (
        <span className="result__title">
          <span className="result__prefix">{r.entry.title} › </span>
          <Highlight text={r.heading.text} query={query} />
        </span>
      )}
    </Link>
  );

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div ref={ref} className="search-dialog" role="dialog" aria-modal="true" aria-label="Search notes">
        <div className="search-dialog__input-row">
          <SearchIcon size={18} />
          <label htmlFor={labelId} className="sr-only">
            Search notes
          </label>
          <input
            id={labelId}
            className="search-dialog__input"
            placeholder="Search titles and headings…"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `search-opt-${active}` : undefined}
          />
          <span className="kbd">esc</span>
        </div>
        <div ref={listRef} id="search-results" role="listbox" aria-label="Results" className="search-dialog__results">
          {index === null ? (
            <div className="search-dialog__empty">Loading…</div>
          ) : index.length === 0 ? (
            <div className="search-dialog__empty">There are no notes to search yet.</div>
          ) : results.length === 0 ? (
            <div className="search-dialog__empty">
              No notes match “{query}”. Try a shorter word, or browse{" "}
              <Link href="/notes" onClick={onClose}>
                all notes
              </Link>
              .
            </div>
          ) : (
            <>
              {notes.length > 0 && (
                <>
                  <p className="section-label">{query.trim() ? "Notes" : "Recently updated"}</p>
                  {notes.map((r, i) => renderRow(r, i))}
                </>
              )}
              {headings.length > 0 && (
                <>
                  <p className="section-label">Headings inside notes</p>
                  {headings.map((r, i) => (
                    <Fragment key={r.key}>{renderRow(r, notes.length + i)}</Fragment>
                  ))}
                </>
              )}
            </>
          )}
        </div>
        <div className="search-dialog__footer">
          <span>↑↓ to move · ↵ to open · esc to close</span>
          <span>{results.length} results</span>
        </div>
      </div>
    </>
  );
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      const t = e.target as HTMLElement;
      const typing = t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return open ? <Dialog onClose={() => setOpen(false)} /> : null;
}

export function SearchButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={openSearch}>
      {children}
    </button>
  );
}
