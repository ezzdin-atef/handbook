import { site, type SocialLink } from "@/site.config";
import { GitHubIcon, GlobeIcon, LinkedInIcon, XIcon } from "./Icons";

const ICONS: Record<SocialLink["kind"], (p: { size?: number }) => React.ReactElement> = {
  portfolio: GlobeIcon,
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  x: XIcon,
};

export function socialIcon(kind: SocialLink["kind"], size = 18) {
  const Icon = ICONS[kind];
  return <Icon size={size} />;
}

export const profile = (kind: SocialLink["kind"]) => site.social.find((s) => s.kind === kind);

/**
 * variant "buttons": labelled secondary buttons (About).
 * variant "inline": icon + label text links (Home intro).
 * variant "icons": icon-only buttons (sidebar footer).
 */
export function SocialLinks({ variant }: { variant: "buttons" | "inline" | "icons" }) {
  const links: readonly SocialLink[] = site.social;
  if (!links.length) return null;

  return (
    <ul className={`social social--${variant}`} aria-label="Elsewhere">
      {links.map((l) => (
        <li key={l.kind}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer me"
            className={variant === "buttons" ? "btn btn--secondary" : undefined}
            aria-label={variant === "icons" ? `${l.label} (${l.handle})` : undefined}
            title={variant === "icons" ? l.label : undefined}
          >
            {socialIcon(l.kind, variant === "icons" ? 18 : 16)}
            {variant !== "icons" && (
              <span>
                {l.label}
                {variant === "buttons" && <span className="social__handle"> · {l.handle}</span>}
              </span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
