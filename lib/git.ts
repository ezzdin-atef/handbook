import { execFileSync } from "node:child_process";

export type DiffLine = { type: "add" | "del" | "ctx" | "gap"; text: string };

export type Commit = {
  hash: string;
  short: string;
  date: string; // ISO
  message: string;
  kind: "new" | "edited" | "moved";
  /** Path of the file at this commit, relative to the repo root. */
  path: string;
  added: number;
  removed: number;
  diff: DiffLine[];
};

export type Rename = { from: string; to: string; short: string; date: string };

const MAX_DIFF_LINES = 400;

function git(args: string[]): string | null {
  try {
    return execFileSync("git", args, {
      cwd: process.cwd(),
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

let repoAvailable: boolean | undefined;
export function hasGit(): boolean {
  if (repoAvailable === undefined) {
    repoAvailable = git(["rev-parse", "--is-inside-work-tree"])?.trim() === "true";
  }
  return repoAvailable;
}

let prefixCache: string | undefined;
/** Path of cwd relative to the repo root ("" when the app is at the root). */
function repoPrefix(): string {
  if (prefixCache === undefined) prefixCache = (git(["rev-parse", "--show-prefix"]) ?? "").trim();
  return prefixCache;
}

/** Commit history for one file, newest first, following renames. */
export function fileHistory(relToCwd: string): Commit[] {
  if (!hasGit()) return [];
  const out = git([
    "log",
    "--follow",
    "-p",
    "--no-color",
    "-M",
    "--format=%x1e%H%x1f%h%x1f%aI%x1f%s",
    "--",
    relToCwd,
  ]);
  if (!out) return [];

  const commits: Commit[] = [];
  for (const chunk of out.split("\x1e")) {
    if (!chunk.trim()) continue;
    const nl = chunk.indexOf("\n");
    const header = nl === -1 ? chunk : chunk.slice(0, nl);
    const body = nl === -1 ? "" : chunk.slice(nl + 1);
    const [hash, short, date, message] = header.split("\x1f");

    let kind: Commit["kind"] = "edited";
    let filePath = repoPrefix() + relToCwd.replace(/\\/g, "/");
    let added = 0;
    let removed = 0;
    const diff: DiffLine[] = [];
    let inHunk = false;

    for (const rawLine of body.split("\n")) {
      const line = rawLine.replace(/\r$/, "");
      if (line.startsWith("diff --git")) {
        inHunk = false;
        const m = line.match(/ b\/(.+)$/);
        if (m) filePath = m[1];
        continue;
      }
      if (!inHunk) {
        if (line.startsWith("new file mode")) kind = "new";
        else if (line.startsWith("rename from") && kind !== "new") kind = "moved";
        else if (line.startsWith("@@")) inHunk = true;
        continue;
      }
      if (line.startsWith("@@")) {
        diff.push({ type: "gap", text: "" });
        continue;
      }
      if (line.startsWith("\\")) continue;
      const push = (l: DiffLine) => diff.length < MAX_DIFF_LINES && diff.push(l);
      if (line.startsWith("+")) {
        added++;
        push({ type: "add", text: line.slice(1) });
      } else if (line.startsWith("-")) {
        removed++;
        push({ type: "del", text: line.slice(1) });
      } else if (line.startsWith(" ")) {
        push({ type: "ctx", text: line.slice(1) });
      }
    }
    // Trim trailing blank context.
    while (diff.length && diff[diff.length - 1].type === "ctx" && !diff[diff.length - 1].text) diff.pop();

    commits.push({ hash, short, date, message, kind, path: filePath, added, removed, diff });
  }
  // The oldest commit is always the creation, even if git saw it as a copy.
  if (commits.length) commits[commits.length - 1].kind = "new";
  return commits;
}

/** All renames under a directory (repo-root-relative paths), newest first. */
export function renames(dirRelToCwd: string): Rename[] {
  if (!hasGit()) return [];
  const out = git([
    "log",
    "-M",
    "--diff-filter=R",
    "--name-status",
    "--format=%x1e%h%x1f%aI",
    "--",
    dirRelToCwd,
  ]);
  if (!out) return [];
  const result: Rename[] = [];
  for (const chunk of out.split("\x1e")) {
    const lines = chunk.split("\n").filter(Boolean);
    if (!lines.length) continue;
    const [short, date] = lines[0].split("\x1f");
    for (const l of lines.slice(1)) {
      const [status, from, to] = l.split("\t");
      if (status?.startsWith("R") && from && to) result.push({ from, to, short, date });
    }
  }
  return result;
}

/** Repo-root-relative path -> path relative to the app dir. */
export function stripPrefix(p: string): string {
  const prefix = repoPrefix();
  return prefix && p.startsWith(prefix) ? p.slice(prefix.length) : p;
}
