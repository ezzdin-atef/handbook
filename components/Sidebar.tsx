"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileIcon, FolderIcon } from "./Icons";
import { SocialLinks } from "./SocialLinks";
import { href, type Tree, type TreeFolder } from "@/lib/tree";

const MAX_FILES = 6;

function decode(pathname: string) {
  try {
    return decodeURIComponent(pathname).replace(/^\/|\/$/g, "").replace(/\/history$/, "");
  } catch {
    return pathname;
  }
}

function FolderNode({ folder, current, onNavigate }: { folder: TreeFolder; current: string; onNavigate?: () => void }) {
  const isOpen = current === folder.slug || current.startsWith(folder.slug + "/");
  const isCurrent = current === folder.slug;

  let files = folder.notes;
  let hidden = 0;
  if (files.length > MAX_FILES) {
    const activeIdx = files.findIndex((n) => n.slug === current);
    const shown = files.slice(0, MAX_FILES);
    if (activeIdx >= MAX_FILES) shown[MAX_FILES - 1] = files[activeIdx];
    hidden = files.length - shown.length;
    files = shown;
  }

  return (
    <div>
      <Link
        href={href(folder.slug)}
        className="tree-folder"
        data-open={isOpen}
        aria-current={isCurrent ? "page" : undefined}
        onClick={onNavigate}
      >
        <span className="tree-folder__name">
          <FolderIcon />
          {folder.name}
        </span>
        <span className="count">{folder.count}</span>
      </Link>
      {isOpen && (
        <div className="tree-children">
          {folder.folders.map((f) => (
            <FolderNode key={f.slug} folder={f} current={current} onNavigate={onNavigate} />
          ))}
          {files.map((n) => (
            <Link
              key={n.slug}
              href={href(n.slug)}
              className="tree-file"
              aria-current={n.slug === current ? "page" : undefined}
              onClick={onNavigate}
            >
              <FileIcon />
              {n.fileName}
            </Link>
          ))}
          {hidden > 0 && (
            <Link href={href(folder.slug)} className="tree-more" onClick={onNavigate}>
              + {hidden} more
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ tree, onNavigate }: { tree: Tree; onNavigate?: () => void }) {
  const current = decode(usePathname() ?? "/");
  return (
    <nav aria-label="Folders" className="sidebar">
      <div className="sidebar__inner">
        <p className="section-label">Browse</p>
        {tree.folders.length === 0 && <p className="sidebar__empty">No folders yet.</p>}
        {tree.folders.map((f) => (
          <FolderNode key={f.slug} folder={f} current={current} onNavigate={onNavigate} />
        ))}
        <div className="sidebar__footer">
          <Link href="/notes" onClick={onNavigate}>
            {tree.total > 0 ? `All ${tree.total} notes →` : "All notes →"}
          </Link>
          <Link href="/recent" onClick={onNavigate}>
            What changed lately →
          </Link>
        </div>
        <div className="sidebar__social">
          <p className="section-label">Elsewhere</p>
          <SocialLinks variant="icons" />
        </div>
      </div>
    </nav>
  );
}
