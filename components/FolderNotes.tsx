"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { href } from "@/lib/tree";
import { RelTime } from "./RelTime";

type Item = { slug: string; title: string; summary: string; updated: string; position: number };
type Sort = "order" | "updated" | "az";

const PAGE = 8;

export function FolderNotes({ notes }: { notes: Item[] }) {
  const [sort, setSort] = useState<Sort>("order");
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(() => {
    const list = [...notes];
    if (sort === "updated") list.sort((a, b) => b.updated.localeCompare(a.updated));
    if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [notes, sort]);

  const visible = showAll ? sorted : sorted.slice(0, PAGE);

  return (
    <>
      <div className="section-head" style={{ margin: "32px 0 4px" }}>
        <h2 className="section-label">Notes in this folder</h2>
        {notes.length > 1 && (
          <label className="select-label">
            Sort by
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="order">Reading order</option>
              <option value="updated">Recently updated</option>
              <option value="az">A–Z</option>
            </select>
          </label>
        )}
      </div>
      {notes.length === 0 ? (
        <p className="empty">No notes in this folder yet.</p>
      ) : (
        visible.map((n) => (
          <Link key={n.slug} href={href(n.slug)} className="note-row">
            <span className="note-row__title">
              {sort === "order" ? `${n.position}. ` : ""}
              {n.title}
            </span>
            <span className="meta">
              <RelTime iso={n.updated} prefix="Updated " />
            </span>
            {n.summary && <span className="note-row__summary">{n.summary}</span>}
          </Link>
        ))
      )}
      {!showAll && sorted.length > PAGE && (
        <button type="button" className="btn btn--secondary" style={{ marginTop: 18 }} onClick={() => setShowAll(true)}>
          Show all {sorted.length} notes
        </button>
      )}
    </>
  );
}
