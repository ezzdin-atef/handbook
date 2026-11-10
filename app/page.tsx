import Link from "next/link";
import { site } from "@/site.config";
import { byUpdated, getSite } from "@/lib/content";
import { href } from "@/lib/tree";
import { FolderIcon } from "@/components/Icons";
import { RelTime } from "@/components/RelTime";
import { SocialLinks } from "@/components/SocialLinks";
import { EmptyState } from "@/components/EmptyState";

export default async function Home() {
  const data = await getSite();
  const startHere = data.notes.filter((n) => n.startHere).slice(0, 3);
  const recent = byUpdated(data.notes).slice(0, 4);

  if (data.notes.length === 0) {
    return (
      <main id="content" className="main">
        <h1 className="page-title">Hi, I&apos;m {site.author}</h1>
        <p className="lead">
          This is where I keep my personal notes: things I learn and think about while building. Written for me first,
          so expect rough edges.
        </p>
        <SocialLinks variant="inline" />
        <EmptyState title="No notes yet">
          The notebook is empty for now. New notes show up here as soon as they&apos;re published.
        </EmptyState>
      </main>
    );
  }

  return (
    <main id="content" className="main">
      <h1 className="page-title">Hi, I&apos;m {site.author}</h1>
      {data.intro ? (
        <div className="lead" dangerouslySetInnerHTML={{ __html: data.intro }} />
      ) : (
        <p className="lead">
          These are my personal notes: things I learn and think about while building. They&apos;re written for me
          first, so expect rough edges. Pick a folder on the left, search with ⌘K, or start below.
        </p>
      )}
      <SocialLinks variant="inline" />

      {startHere.length > 0 && (
        <>
          <h2 className="section-label home-section">Start here</h2>
          <div className="card-grid">
            {startHere.map((n) => (
              <Link key={n.slug} href={href(n.slug)} className="card">
                <span className="card__label">{n.folder} /</span>
                <span className="card__title">{n.title}</span>
                {n.summary && <span className="card__desc">{n.summary}</span>}
              </Link>
            ))}
          </div>
        </>
      )}

      <h2 className="section-label home-section">Folders</h2>
      <div className="folder-grid">
        {data.root.folders.map((f) => (
          <Link key={f.slug} href={href(f.slug)} className="folder-tile">
            <span className="folder-tile__name">
              <FolderIcon />
              {f.name}
            </span>
            <span className="count">{f.count}</span>
          </Link>
        ))}
      </div>

      <div className="section-head home-section" style={{ alignItems: "baseline", marginBottom: 6 }}>
        <h2 className="section-label">Recently updated</h2>
        <Link href="/recent" className="link-accent">
          See all changes →
        </Link>
      </div>
      <ul className="plain-list">
        {recent.map((n) => (
          <li key={n.slug} className="recent-row">
            <Link href={href(n.slug)}>
              <span className="recent-row__title">{n.title}</span>
              <span className="meta">{n.folder}/</span>
              <span className="mono-meta">
                {n.lastCommit && <>“{n.lastCommit.message}” · </>}
                <RelTime iso={n.updated} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
