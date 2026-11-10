import Link from "next/link";
import { githubUrl, type Note, type Site } from "@/lib/content";
import { formatDate, href } from "@/lib/tree";
import { Breadcrumb, folderCrumbs } from "../Breadcrumb";
import { Toc } from "../Toc";

function LinkedFrom({ note, site }: { note: Note; site: Site }) {
  const sources = note.backlinks.map((s) => site.bySlug.get(s)).filter((n): n is Note => !!n);
  if (!sources.length) return null;
  return (
    <>
      <p className="section-label">Linked from</p>
      {sources.map((n) => (
        <Link key={n.slug} href={href(n.slug)} className="rail-link">
          {n.title}
        </Link>
      ))}
    </>
  );
}

function Tags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <>
      <p className="section-label">Tags</p>
      <div className="tags">
        {tags.map((t) => (
          <Link key={t} href={`/notes?tag=${encodeURIComponent(t)}`} className="tag">
            #{t}
          </Link>
        ))}
      </div>
    </>
  );
}

export function NoteView({ note, site }: { note: Note; site: Site }) {
  const folder = site.folderBySlug.get(note.folder);
  const siblings = folder?.notes ?? [];
  const idx = siblings.findIndex((n) => n.slug === note.slug);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const folderName = folder?.name ?? note.folder;

  const crumbs = [...folderCrumbs(note.folder), { label: note.slug.split("/").pop()! }];
  const edit = githubUrl("edit", note.sourcePath);
  const hasExtra = note.backlinks.length > 0 || note.tags.length > 0;

  return (
    <>
      <main id="content" className="main main--note">
        <article className="article">
          <Breadcrumb items={crumbs} />
          <h1 className="note-title">{note.title}</h1>
          <div className="note-meta">
            <span>Updated {formatDate(note.updated, { year: true })}</span>
            {note.lastCommit && (
              <span className="mono">
                {note.lastCommit.short} · “{note.lastCommit.message}”
              </span>
            )}
            <span>{note.readingMinutes} min read</span>
            <span className="note-meta__actions">
              {note.history.length > 0 && <Link href={`${href(note.slug)}/history`}>View history</Link>}
              {edit && <a href={edit}>Edit on GitHub</a>}
            </span>
          </div>

          {note.headings.length > 1 && (
            <details className="inline-toc">
              <summary>On this page</summary>
              <Toc headings={note.headings} />
            </details>
          )}

          <div className="prose" dangerouslySetInnerHTML={{ __html: note.html }} />

          {hasExtra && (
            <div className="inline-extra">
              <LinkedFrom note={note} site={site} />
              <Tags tags={note.tags} />
            </div>
          )}

          {(prev || next) && (
            <div className="prev-next">
              {prev && (
                <Link href={href(prev.slug)}>
                  <span className="prev-next__dir">← Previous in {folderName}</span>
                  <span className="prev-next__title">{prev.title}</span>
                </Link>
              )}
              {next && (
                <Link href={href(next.slug)} className="next">
                  <span className="prev-next__dir">Next in {folderName} →</span>
                  <span className="prev-next__title">{next.title}</span>
                </Link>
              )}
            </div>
          )}
        </article>
      </main>
      <aside aria-label="On this page" className="rail">
        <div className="rail__inner">
          {note.headings.length > 0 && (
            <>
              <p className="section-label">On this page</p>
              <Toc headings={note.headings} />
            </>
          )}
          <LinkedFrom note={note} site={site} />
          <Tags tags={note.tags} />
        </div>
      </aside>
    </>
  );
}
