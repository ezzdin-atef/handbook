"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { href } from "@/lib/tree";
import { RelTime } from "./RelTime";

export type Row = {
  slug: string;
  title: string;
  folder: string;
  topFolder: string;
  tags: string[];
  updated: string;
  created: string;
};

type Sort = "updated" | "az" | "oldest";

type Props = { rows: Row[]; folders: string[]; withParams?: boolean };

export function AllNotesTable(props: Props) {
  return props.withParams ? <WithParams {...props} /> : <Table {...props} tag={null} />;
}

function WithParams(props: Props) {
  const params = useSearchParams();
  return <Table {...props} tag={params.get("tag")} />;
}

function Table({ rows, folders, tag }: Props & { tag: string | null }) {
  const router = useRouter();
  const [folder, setFolder] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("updated");

  const allTags = useMemo(() => [...new Set(rows.flatMap((r) => r.tags))].sort(), [rows]);

  const filtered = useMemo(() => {
    const list = rows.filter((r) => (!folder || r.topFolder === folder) && (!tag || r.tags.includes(tag)));
    if (sort === "updated") list.sort((a, b) => b.updated.localeCompare(a.updated));
    if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "oldest") list.sort((a, b) => a.created.localeCompare(b.created));
    return list;
  }, [rows, folder, tag, sort]);

  const setTag = (t: string) => router.replace(t ? `/notes?tag=${encodeURIComponent(t)}` : "/notes", { scroll: false });
  const folderCount = new Set(rows.map((r) => r.topFolder)).size;

  return (
    <>
      <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: 15 }}>
        Showing {filtered.length} of {rows.length} notes across {folderCount} folders
        {tag && (
          <>
            {" "}
            tagged <strong>#{tag}</strong>
          </>
        )}
        .
      </p>
      <div className="section-head" style={{ marginTop: 22 }}>
        <div role="group" aria-label="Filter by folder" className="chips">
          <button type="button" className="chip" aria-pressed={folder === null} onClick={() => setFolder(null)}>
            All
          </button>
          {folders.map((f) => (
            <button key={f} type="button" className="chip" aria-pressed={folder === f} onClick={() => setFolder(f)}>
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {allTags.length > 0 && (
            <label className="select-label">
              Tag
              <select className="select" value={tag ?? ""} onChange={(e) => setTag(e.target.value)}>
                <option value="">Any</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    #{t}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="select-label">
            Sort
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="updated">Recently updated</option>
              <option value="az">A–Z</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="empty">
          No notes match this filter yet.{" "}
          <button
            type="button"
            className="link-accent"
            style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}
            onClick={() => {
              setFolder(null);
              if (tag) setTag("");
            }}
          >
            Clear filter
          </button>
        </p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Folder</th>
                <th scope="col">Tags</th>
                <th scope="col" style={{ textAlign: "right" }}>
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.slug}>
                  <td>
                    <Link href={href(r.slug)} className="table__title">
                      {r.title}
                    </Link>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{r.folder}/</td>
                  <td className="table__tags">
                    {r.tags.map((t) => (
                      <Link key={t} href={`/notes?tag=${encodeURIComponent(t)}`} scroll={false}>
                        #{t}
                      </Link>
                    ))}
                  </td>
                  <td className="num">
                    <RelTime iso={r.updated} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
