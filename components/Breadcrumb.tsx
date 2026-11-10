import Link from "next/link";
import { Fragment } from "react";

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <Fragment key={i}>
            {i > 0 && <span aria-hidden="true">›</span>}
            {last || !c.href ? (
              <span aria-current={last ? "page" : undefined}>{c.label}</span>
            ) : (
              <Link href={c.href}>{c.label}</Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

/** "rust/devdock" -> crumbs for Notes › rust › devdock (all linked). */
export function folderCrumbs(folderSlug: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: "Notes", href: "/" }];
  const parts = folderSlug ? folderSlug.split("/") : [];
  parts.forEach((p, i) => crumbs.push({ label: p, href: "/" + parts.slice(0, i + 1).join("/") }));
  return crumbs;
}
