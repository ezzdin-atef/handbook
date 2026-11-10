"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/markdown";

/** Table of contents with scroll-spy. */
export function Toc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState(headings[0]?.id);

  useEffect(() => {
    if (!headings.length) return;
    const els = headings.map((h) => document.getElementById(h.id)).filter((x): x is HTMLElement => !!x);
    const onScroll = () => {
      const line = 120;
      let current = els[0]?.id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      // At the very bottom, the last heading wins even if it can't reach the line.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) current = els[els.length - 1]?.id;
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  return (
    <nav className="toc" aria-label="On this page">
      {headings.map((h) => (
        <a key={h.id} href={`#${h.id}`} className={h.depth === 3 ? "depth-3" : undefined} data-active={active === h.id}>
          {h.text}
        </a>
      ))}
    </nav>
  );
}
