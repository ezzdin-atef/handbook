"use client";

import { useState } from "react";
import type { Commit } from "@/lib/git";

type Item = Commit & { dateLabel: string; versionUrl: string | null };

const SIGN = { add: "+", del: "−", ctx: " ", gap: "⋯" } as const;

export function HistoryPanel({ commits }: { commits: Item[] }) {
  const [selected, setSelected] = useState(0);
  const c = commits[selected];

  return (
    <div className="history">
      <div role="group" aria-label="Commits" className="commit-list">
        {commits.map((item, i) => (
          <button
            key={item.hash}
            type="button"
            className="commit-btn"
            aria-pressed={i === selected}
            onClick={() => setSelected(i)}
          >
            <span className="commit-btn__title">{item.message}</span>
            <span className="mono-meta">
              {item.short} · {item.dateLabel}
            </span>
          </button>
        ))}
      </div>
      <div className="diff">
        <div className="diff__head">
          <span style={{ fontWeight: 600 }}>{c.message}</span>
          <span className="meta">
            <span className="plus">+{c.added}</span> · <span className="minus">−{c.removed}</span> lines
            {c.versionUrl && (
              <>
                {" · "}
                <a href={c.versionUrl} className="link-accent">
                  View this version
                </a>
              </>
            )}
          </span>
        </div>
        <div className="diff__body">
          {c.diff.length === 0 ? (
            <div className="diff-line">
              <span className="diff-line__sign" aria-hidden="true" />
              <span>No text changes (rename only).</span>
            </div>
          ) : (
            c.diff.map((l, i) => (
              <div key={i} className={`diff-line diff-line--${l.type}`}>
                <span className="diff-line__sign" aria-hidden="true">
                  {SIGN[l.type]}
                </span>
                {l.type === "add" && <span className="sr-only">Added: </span>}
                {l.type === "del" && <span className="sr-only">Removed: </span>}
                <span>{l.text}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
