import type { Metadata } from "next";
import { site } from "@/site.config";
import { SocialLinks } from "@/components/SocialLinks";

export const metadata: Metadata = { title: "About" };

const TIPS = [
  { title: "Browse folders", text: "The sidebar mirrors the repo. Each folder has a short intro and a suggested order." },
  { title: "Search with ⌘K", text: "Matches titles and headings across every note. Press / anywhere too." },
  { title: "Check what changed", text: "“Recently updated” lists every commit, newest first." },
];

const TREE = `notes/
├── rust/
│   ├── README.md
│   └── ownership.md
├── web/
└── thoughts/`;

export default function AboutPage() {
  return (
    <main id="content" className="main">
      <div className="about" style={{ maxWidth: 720 }}>
        <h1 className="page-title">About this place</h1>
        <p>
          I&apos;m {site.author}, a full-stack developer working mostly in Node.js and Next.js, learning Rust and
          Three.js on the side. This site is my notebook: what I learn, half-formed thoughts, and things I don&apos;t
          want to look up twice.
        </p>
        <p>
          Notes are written for me, not polished for readers. If something is wrong, it&apos;s probably because I
          hadn&apos;t learned it yet.
        </p>

        <h2>How to find your way</h2>
        <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {TIPS.map((t, i) => (
            <div key={t.title} className="card" style={{ cursor: "default" }}>
              <span className="step-num">{i + 1}</span>
              <span className="card__title" style={{ marginTop: 10, fontSize: 15 }}>
                {t.title}
              </span>
              <span className="card__desc" style={{ marginTop: 6 }}>
                {t.text}
              </span>
            </div>
          ))}
        </div>

        <h2 style={{ marginBottom: 10 }}>How it&apos;s built</h2>
        <p style={{ margin: 0 }}>
          Every note is a plain <code>.md</code> file in a git repo. Pushing to <code>{site.branch}</code> rebuilds the
          site, and each page links back to its source and history.
        </p>
        <div className="repo-tree mono" aria-label="Example repo layout">
          {TREE}
        </div>

        <h2 style={{ marginBottom: 10 }}>Elsewhere</h2>
        <p style={{ margin: "0 0 14px" }}>
          More of my work lives on my portfolio. I also post short versions of these notes on X and LinkedIn.
        </p>
        <SocialLinks variant="buttons" />
        {site.repo && (
          <p style={{ fontSize: 14, marginTop: 16 }}>
            The source for this site and its notes:{" "}
            <a href={site.repo} className="link-accent">
              {site.repo.replace(/^https:\/\/github\.com\//, "")}
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
