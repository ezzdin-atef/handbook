import Link from "next/link";
import { githubUrl, type Note } from "@/lib/content";
import { formatDate, href } from "@/lib/tree";
import { Breadcrumb, folderCrumbs } from "../Breadcrumb";
import { HistoryPanel } from "../HistoryPanel";

export function HistoryView({ note }: { note: Note }) {
  const noteHref = href(note.slug);
  const crumbs = [...folderCrumbs(note.folder), { label: note.slug.split("/").pop()!, href: noteHref }, { label: "History" }];
  const first = note.history[note.history.length - 1];
  const n = note.history.length;

  return (
    <main id="content" className="main">
      <Breadcrumb items={crumbs} />
      <div className="section-head" style={{ marginTop: 14 }}>
        <h1 className="page-title" style={{ fontSize: 28 }}>
          History of <span className="mono" style={{ fontSize: 24 }}>{note.fileName}</span>
        </h1>
        <Link href={noteHref} className="btn btn--primary">
          Back to note
        </Link>
      </div>
      {n === 0 ? (
        <p className="lead">No git history for this note yet. Commit it to see changes here.</p>
      ) : (
        <>
          <p style={{ margin: "8px 0 0", color: "var(--text-muted)" }}>
            {n} {n === 1 ? "change" : "changes"} since {formatDate(first.date, { year: true })}. Pick one to see what
            changed.
          </p>
          <HistoryPanel
            commits={note.history.map((c) => ({
              ...c,
              dateLabel: formatDate(c.date, { year: true }),
              versionUrl: githubUrl("blob", c.path, c.hash),
            }))}
          />
        </>
      )}
    </main>
  );
}
