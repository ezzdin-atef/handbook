"use client";

import { useEffect, useState } from "react";
import { formatDate, relativeDate } from "@/lib/tree";

/**
 * Renders an absolute date at build time and swaps to a relative one
 * ("3d ago") in the browser, so static pages never show stale relative dates.
 */
export function RelTime({ iso, prefix = "" }: { iso: string; prefix?: string }) {
  const [text, setText] = useState(() => formatDate(iso));
  useEffect(() => setText(relativeDate(iso)), [iso]);
  return (
    <time dateTime={iso} title={new Date(iso).toUTCString()}>
      {prefix}
      {text}
    </time>
  );
}
