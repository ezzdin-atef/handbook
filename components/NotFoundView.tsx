"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDate, href, type SearchEntry } from "@/lib/tree";
import { FolderIcon, SearchIcon } from "./Icons";
import { openSearch } from "./SearchDialog";

type Redirects = Record<string, { to: string; short: string; date: string }>;
type Moved = { to: string; short: string; date: string; title: string };
type State =
  | { status: "loading" }
  | { status: "ready"; moved: Moved | null; suggestions: SearchEntry[]; folder: string | null; empty: boolean };

const REDIRECT_SECONDS = 5;
const MAX_SUGGESTIONS = 3;

const tokens = (s: string) =>
  s
    .toLowerCase()
    .split(/[\/\-_.\s,:]+/)
    .filter((t) => t.length >= 2);

function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

/**
 * Rank notes by how closely their own name/title match the requested path.
 * Folder names alone never qualify (the "Nearby" folder link covers that);
 * a matching folder only breaks ties between real candidates.
 */
function suggest(path: string, index: SearchEntry[]): SearchEntry[] {
  const parts = path.toLowerCase().split("/");
  const last = parts.pop() ?? "";
  const want = tokens(last);
  if (!last) return [];
  return index
    .map((e) => {
      const name = e.slug.split("/").pop() ?? "";
      const have = tokens(`${name} ${e.title}`);
      let score = 0;
      for (const w of want) if (have.some((h) => h === w || (w.length >= 3 && (h.startsWith(w) || w.startsWith(h))))) score += 2;
      const sim = 1 - levenshtein(last, name) / Math.max(last.length, name.length, 1);
      if (sim >= 0.6) score += sim * 3;
      if (score > 0 && parts.join("/") === e.folder) score += 1;
      return { e, score };
    })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SUGGESTIONS)
    .map((x) => x.e);
}

/** Deepest existing folder that the requested path starts with. */
function closestFolder(path: string, index: SearchEntry[]): string | null {
  const folders = new Set<string>();
  for (const e of index) {
    const parts = e.folder.split("/");
    parts.forEach((_, i) => folders.add(parts.slice(0, i + 1).join("/")));
  }
  const parts = path.split("/");
  for (let i = parts.length - 1; i >= 1; i--) {
    const candidate = parts.slice(0, i).join("/");
    if (folders.has(candidate)) return candidate;
  }
  return null;
}

async function getJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const r = await fetch(url);
    return r.ok ? ((await r.json()) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function NotFoundView() {
  const router = useRouter();
  const [path, setPath] = useState("");
  const [state, setState] = useState<State>({ status: "loading" });
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    let slug = window.location.pathname;
    try {
      slug = decodeURIComponent(slug);
    } catch {}
    slug = slug.replace(/^\/+|\/+$/g, "").replace(/\.md$/i, "").replace(/\/README$/i, "");
    setPath(slug);

    Promise.all([getJson<Redirects>("/redirects.json", {}), getJson<SearchEntry[]>("/search-index.json", [])]).then(
      ([redirects, index]) => {
        const hit = redirects[slug] ?? redirects[slug.replace(/\/history$/, "")];
        const moved = hit ? { ...hit, title: index.find((e) => e.slug === hit.to)?.title ?? hit.to } : null;
        const suggestions = moved ? [] : suggest(slug, index);
        setState({ status: "ready", moved, suggestions, folder: closestFolder(slug, index), empty: index.length === 0 });
        if (moved) setCountdown(REDIRECT_SECONDS);
      }
    );
  }, []);

  // Moved notes: follow the redirect automatically unless the visitor cancels.
  useEffect(() => {
    if (countdown === null || state.status !== "ready" || !state.moved) return;
    if (countdown <= 0) {
      router.replace(href(state.moved.to));
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
  }, [countdown, state, router]);

  const ready = state.status === "ready" ? state : null;
  const moved = ready?.moved ?? null;

  const heading = moved ? "This note has moved" : "This page doesn't exist";
  const lead = moved
    ? "It was renamed or moved to a new address."
    : ready?.empty
      ? "There are no notes here yet, so there's nothing to link to."
      : "The link may be old or mistyped, or the note was removed.";

  return (
    <div className="not-found">
      <div className="mono-meta" style={{ fontSize: 13 }}>
        404{path && <> · /{path}</>}
      </div>
      <h1 className="page-title" style={{ marginTop: 12 }}>
        {heading}
      </h1>
      <p className="lead">{lead}</p>

      {moved && (
        <>
          <Link href={href(moved.to)} className="match-card">
            <span className="card__label">
              {moved.to.split("/").slice(0, -1).join("/") || "notes"} / · moved {formatDate(moved.date)} in {moved.short}
            </span>
            <span className="card__title">{moved.title}</span>
          </Link>
          {countdown !== null && countdown > 0 && (
            <p className="not-found__redirect" role="status">
              Taking you there in {countdown}s.{" "}
              <button type="button" className="link-button" onClick={() => setCountdown(null)}>
                Stay on this page
              </button>
            </p>
          )}
        </>
      )}

      {ready && ready.suggestions.length > 0 && (
        <section className="not-found__section">
          <h2 className="section-label">Did you mean</h2>
          <ul className="plain-list">
            {ready.suggestions.map((s) => (
              <li key={s.slug} className="recent-row">
                <Link href={href(s.slug)}>
                  <span className="recent-row__title">{s.title}</span>
                  <span className="meta">{s.folder}/</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {ready?.folder && !moved && (
        <section className="not-found__section">
          <h2 className="section-label">Nearby</h2>
          <Link href={href(ready.folder)} className="subfolder-chip" style={{ display: "inline-flex" }}>
            <FolderIcon />
            Browse {ready.folder}/
          </Link>
        </section>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
        {!ready?.empty && (
          <button type="button" className="btn btn--primary btn--lg" onClick={openSearch}>
            <SearchIcon />
            Search notes
          </button>
        )}
        <Link href="/" className={`btn btn--lg ${ready?.empty ? "btn--primary" : "btn--secondary"}`}>
          Go home
        </Link>
        {!ready?.empty && (
          <Link href="/notes" className="btn btn--secondary btn--lg">
            All notes
          </Link>
        )}
      </div>
    </div>
  );
}
