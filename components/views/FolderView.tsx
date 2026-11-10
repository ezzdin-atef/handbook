import Link from "next/link";
import { githubUrl, type Folder } from "@/lib/content";
import { href } from "@/lib/tree";
import { Breadcrumb, folderCrumbs } from "../Breadcrumb";
import { FolderIcon } from "../Icons";
import { FolderNotes } from "../FolderNotes";

export function FolderView({ folder }: { folder: Folder }) {
  const crumbs = folderCrumbs(folder.slug);
  const gh = githubUrl("tree", folder.sourcePath);

  return (
    <main id="content" className="main">
      <Breadcrumb items={crumbs} />
      <div className="section-head" style={{ alignItems: "flex-end", marginTop: 14 }}>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {folder.name}
          <span className="pill">
            {folder.count} {folder.count === 1 ? "note" : "notes"}
          </span>
        </h1>
        {gh && (
          <a href={gh} className="link-accent">
            Open folder on GitHub ↗
          </a>
        )}
      </div>

      {folder.readme && (
        <div className="readme">
          <div className="mono-meta">{folder.readme.sourcePath.replace(/^notes\//, "")}</div>
          <div className="readme__body" dangerouslySetInnerHTML={{ __html: folder.readme.html }} />
        </div>
      )}

      {folder.folders.length > 0 && (
        <>
          <h2 className="section-label" style={{ margin: "32px 0 10px" }}>
            Subfolders
          </h2>
          <div className="chips" style={{ gap: 10 }}>
            {folder.folders.map((f) => (
              <Link key={f.slug} href={href(f.slug)} className="subfolder-chip">
                <FolderIcon />
                {f.name} <span className="count">{f.count}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <FolderNotes
        notes={folder.notes.map((n, i) => ({
          slug: n.slug,
          title: n.title,
          summary: n.summary,
          updated: n.updated,
          position: i + 1,
        }))}
      />
    </main>
  );
}
