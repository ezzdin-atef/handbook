type P = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const SearchIcon = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

export const GitHubIcon = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M9 19c-4 1.5-4-2-6-2.5M15 22v-3.5a3 3 0 0 0-.9-2.4c3-.3 6-1.5 6-6.6a5 5 0 0 0-1.4-3.6 4.7 4.7 0 0 0-.1-3.6s-1.1-.3-3.6 1.4a12.4 12.4 0 0 0-6.5 0C6 1.6 4.9 1.9 4.9 1.9a4.7 4.7 0 0 0-.1 3.6A5 5 0 0 0 3.4 9.1c0 5.1 3 6.3 6 6.6a3 3 0 0 0-.9 2.4V22" />
  </svg>
);

export const FolderIcon = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

export const FileIcon = ({ size = 14 }: P) => (
  <svg {...base(size)}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
  </svg>
);

export const MenuIcon = ({ size = 22 }: P) => (
  <svg {...base(size)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const GlobeIcon = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>
);

export const LinkedInIcon = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M8 10.5V17M8 7.25v.01M12 17v-6.5M12 13.5a2.5 2.5 0 0 1 5 0V17" />
  </svg>
);

export const XIcon = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77zm-1.08 16.18h1.7L7.4 4.73H5.58z" />
  </svg>
);

export const PaletteIcon = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.7 1.8-1.7H16a5 5 0 0 0 5-5c0-3.9-4-7.2-9-7.2z" />
    <circle cx="7.5" cy="11" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="10.5" cy="7" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

/**
 * Logo mark: same drawing as app/icon.svg (monochrome rounded square + drawn "e"),
 * but themed: `text` square with a `bg` glyph, so it inverts in dark mode.
 */
export const LogoMark = ({ size = 28 }: P) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="logo__mark">
    <rect className="logo__tile" x="2" y="2" width="28" height="28" rx="7" />
    <path
      className="logo__glyph"
      d="M10.5 16.5h11a5.5 5.5 0 1 0-1.6 3.9"
      fill="none"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CloseIcon = ({ size = 22 }: P) => (
  <svg {...base(size)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
