"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACCENTS,
  DEFAULT_ACCENT,
  PREFS_KEY,
  applyPrefs,
  readPrefs,
  writePrefs,
  type Prefs,
  type ThemePref,
} from "@/lib/theme";
import { PaletteIcon } from "./Icons";

const THEMES: { value: ThemePref; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

/** Header button + popover for theme (system/light/dark) and accent colour. */
export function AppearanceMenu() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({ theme: "system", accent: null });
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load saved prefs, follow OS theme changes, and sync with other tabs.
  useEffect(() => {
    setPrefs(readPrefs());
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      const p = readPrefs();
      if (p.theme === "system") applyPrefs(p);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== PREFS_KEY) return;
      const p = readPrefs();
      applyPrefs(p);
      setPrefs(p);
    };
    mq.addEventListener("change", onSystem);
    window.addEventListener("storage", onStorage);
    return () => {
      mq.removeEventListener("change", onSystem);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const update = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    applyPrefs(next);
    writePrefs(next);
  };

  const accent = prefs.accent ?? DEFAULT_ACCENT;
  const isPreset = ACCENTS.some((a) => a.value === accent);
  const isDefault = prefs.theme === "system" && !prefs.accent;

  return (
    <div className="appearance" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className="icon-btn"
        aria-label="Appearance"
        aria-expanded={open}
        aria-controls="appearance-panel"
        onClick={() => setOpen((o) => !o)}
      >
        <PaletteIcon />
      </button>
      {open && (
        <div id="appearance-panel" className="appearance__panel" role="dialog" aria-label="Appearance">
          <p className="section-label">Theme</p>
          <div role="group" aria-label="Theme" className="segmented appearance__themes">
            {THEMES.map((t) => (
              <button key={t.value} type="button" aria-pressed={prefs.theme === t.value} onClick={() => update({ theme: t.value })}>
                {t.label}
              </button>
            ))}
          </div>

          <p className="section-label">Accent colour</p>
          <div role="group" aria-label="Accent colour" className="swatches">
            {ACCENTS.map((a) => (
              <button
                key={a.value}
                type="button"
                className="swatch"
                aria-label={a.name}
                title={a.name}
                aria-pressed={accent === a.value}
                style={{ "--swatch": a.value } as React.CSSProperties}
                onClick={() => update({ accent: a.value === DEFAULT_ACCENT ? null : a.value })}
              />
            ))}
            <label
              className="swatch swatch--custom"
              title="Custom colour"
              data-selected={!isPreset}
              style={{ "--swatch": isPreset ? "#888888" : accent } as React.CSSProperties}
            >
              <span className="sr-only">Custom colour</span>
              <input type="color" value={accent} onChange={(e) => update({ accent: e.target.value.toLowerCase() })} />
            </label>
          </div>
          <p className="appearance__hint">Tones adjust automatically so text stays readable.</p>

          <button
            type="button"
            className="appearance__reset"
            disabled={isDefault}
            onClick={() => update({ theme: "system", accent: null })}
          >
            Reset to default
          </button>
        </div>
      )}
    </div>
  );
}
