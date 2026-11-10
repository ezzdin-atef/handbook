// Visitor appearance preferences, stored in localStorage. Client-safe (no Node imports).

export const PREFS_KEY = "notes:prefs";
const LEGACY_THEME_KEY = "theme";

export type ThemePref = "system" | "light" | "dark";
export type Prefs = { theme: ThemePref; accent: string | null };

export const DEFAULT_ACCENT = "#0e7a63";

export const ACCENTS: { name: string; value: string }[] = [
  { name: "Green", value: "#0e7a63" },
  { name: "Blue", value: "#2563eb" },
  { name: "Indigo", value: "#4f46e5" },
  { name: "Violet", value: "#9333ea" },
  { name: "Pink", value: "#db2777" },
  { name: "Red", value: "#dc2626" },
  { name: "Orange", value: "#ea580c" },
  { name: "Graphite", value: "#52525b" },
];

const HEX = /^#[0-9a-f]{6}$/i;

export function readPrefs(): Prefs {
  const prefs: Prefs = { theme: "system", accent: null };
  try {
    const raw = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "null");
    if (raw && ["system", "light", "dark"].includes(raw.theme)) prefs.theme = raw.theme;
    if (raw && typeof raw.accent === "string" && HEX.test(raw.accent)) prefs.accent = raw.accent.toLowerCase();
    // Migrate the theme saved by the earlier toggle.
    const legacy = localStorage.getItem(LEGACY_THEME_KEY);
    if (!raw && (legacy === "light" || legacy === "dark")) prefs.theme = legacy;
  } catch {}
  return prefs;
}

export function writePrefs(prefs: Prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    localStorage.removeItem(LEGACY_THEME_KEY);
  } catch {}
}

export function resolvedTheme(pref: ThemePref): "light" | "dark" {
  if (pref !== "system") return pref;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyPrefs(prefs: Prefs) {
  const root = document.documentElement;
  root.dataset.theme = resolvedTheme(prefs.theme);
  if (prefs.accent) root.style.setProperty("--accent-base", prefs.accent);
  else root.style.removeProperty("--accent-base");
}

/**
 * Inlined in <head> so theme and accent are applied before first paint.
 * Mirrors readPrefs + applyPrefs; keep the two in sync.
 */
export const prefsScript = `(function(){try{var d=document.documentElement,p=null;try{p=JSON.parse(localStorage.getItem("${PREFS_KEY}"))}catch(e){}var t=p&&p.theme;if(!p){var l=localStorage.getItem("${LEGACY_THEME_KEY}");if(l==="light"||l==="dark")t=l}if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";d.dataset.theme=t;if(p&&/^#[0-9a-f]{6}$/i.test(p.accent))d.style.setProperty("--accent-base",p.accent)}catch(e){}})()`;
