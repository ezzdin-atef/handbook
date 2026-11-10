"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Change } from "@/lib/content";
import { href } from "@/lib/tree";

const PAGE = 20;
const LABEL = { new: "New", edited: "Edited", moved: "Moved" } as const;

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function dayLabel(key: string) {
  const d = new Date(key + "T00:00:00Z");
  const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
  const today = new Date().toISOString().slice(0, 10);
  return key === today ? `Today · ${label}` : label;
}

export function RecentFeed({ changes }: { changes: Change[] }) {
  const [newOnly, setNewOnly] = useState(false);
  const [limit, setLimit] = useState(PAGE);

  const filtered = useMemo(() => (newOnly ? changes.filter((c) => c.kind === "new") : changes), [changes, newOnly]);
  const groups = useMemo(() => {
    const map = new Map<string, Change[]>();
    for (const c of filtered.slice(0, limit)) {
      const k = dayKey(c.date);
      map.set(k, [...(map.get(k) ?? []), c]);
    }
    return [...map.entries()];
  }, [filtered, limit]);

  return (
    <>
      <div role="group" aria-label="Show" className="segmented" style={{ marginTop: 20 }}>
        <button type="button" aria-pressed={!newOnly} onClick={() => setNewOnly(false)}>
          All changes
        </button>
        <button type="button" aria-pressed={newOnly} onClick={() => setNewOnly(true)}>
          New notes only
        </button>
      </div>

      {groups.length === 0 && <p className="empty">Nothing here yet.</p>}

      {groups.map(([key, items]) => (
        <section key={key}>
          <h2 className="section-label day-label" suppressHydrationWarning>
            {dayLabel(key)}
          </h2>
          <ul className="plain-list">
            {items.map((c) => (
              <li key={c.slug + c.hash} className="change-row">
                <span className={`badge badge--${c.kind}`}>{LABEL[c.kind]}</span>
                <span>
                  <Link href={href(c.slug)} className="change-row__title">
                    {c.title}
                  </Link>
                  <span className="meta change-row__meta">
                    {c.folder}/
                    {c.short && (
                      <>
                        {" · "}
                        <span className="mono-meta">
                          {c.short} “{c.message}”
                        </span>
                      </>
                    )}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {filtered.length > limit && (
        <button type="button" className="btn btn--secondary" style={{ marginTop: 24 }} onClick={() => setLimit((l) => l + PAGE)}>
          Load older changes
        </button>
      )}
    </>
  );
}
