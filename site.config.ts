// Edit these to match your repo. Leave `repo` empty to hide all GitHub links
// (useful if the notes repo stays private).
export const site = {
  name: "Ezzdin's Notes",
  // Wordmark shown in the header as "<logoName>/<logoPath>".
  logoName: "ezzdinatef",
  logoPath: "notes",
  author: "Ezzdin",
  url: "https://notes.ezzdinatef.com",
  description: "Personal notes on things I learn and think about while building.",
  repo: "https://github.com/ezzdin-atef/handbook",
  branch: "main",
  notesDir: "notes",
  // Profile links shown on Home, About, the sidebar and the header.
  // Remove an entry to hide it everywhere.
  social: [
    { kind: "portfolio", label: "Portfolio", handle: "ezzdinatef.com", url: "https://ezzdinatef.com" },
    { kind: "github", label: "GitHub", handle: "ezzdin-atef", url: "https://github.com/ezzdin-atef" },
    { kind: "linkedin", label: "LinkedIn", handle: "ezzdin-atef", url: "https://www.linkedin.com/in/ezzdin-atef" },
    { kind: "x", label: "X", handle: "@ezzdin_atef", url: "https://x.com/ezzdin_atef" },
  ] as const satisfies readonly SocialLink[],
};

export type SocialLink = {
  kind: "portfolio" | "github" | "linkedin" | "x";
  label: string;
  handle: string;
  url: string;
};
