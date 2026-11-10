// Client-safe types and helpers (no Node imports).

export type TreeFolder = {
  slug: string;
  name: string;
  count: number;
  notes: { slug: string; fileName: string }[];
  folders: TreeFolder[];
};

export type Tree = { folders: TreeFolder[]; total: number };

export type SearchEntry = {
  slug: string;
  title: string;
  folder: string;
  summary: string;
  tags: string[];
  headings: { text: string; id: string }[];
  body: string;
};

export function href(slug: string) {
  return "/" + slug.split("/").map(encodeURIComponent).join("/");
}

const DAY = 86_400_000;

export function formatDate(iso: string, opts: { year?: boolean } = {}) {
  const d = new Date(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: opts.year || !sameYear ? "numeric" : undefined,
    timeZone: "UTC",
  });
}

export function relativeDate(iso: string, now = Date.now()) {
  const d = new Date(iso).getTime();
  const days = Math.floor((now - d) / DAY);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(iso);
}
