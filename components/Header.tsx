"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/site.config";
import type { Tree } from "@/lib/tree";
import { CloseIcon, GitHubIcon, LogoMark, MenuIcon, SearchIcon } from "./Icons";
import { AppearanceMenu } from "./AppearanceMenu";
import { Sidebar } from "./Sidebar";
import { openSearch } from "./SearchDialog";
import { useDialogFocus } from "./useDialogFocus";
import { profile } from "./SocialLinks";

const github = profile("github");

const NAV = [
  { href: "/", label: "Home" },
  { href: "/notes", label: "All notes" },
  { href: "/recent", label: "Recently updated" },
  { href: "/about", label: "About" },
];

function MainNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? "/";
  return (
    <nav aria-label="Main" className="main-nav">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={pathname === item.href ? "page" : undefined}
          onClick={onNavigate}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function Logo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link href="/" className="logo" aria-label={`${site.name}, home`} onClick={onNavigate}>
      <LogoMark />
      <span className="logo__word" aria-hidden="true">
        <span className="logo__name">{site.logoName}</span>
        <span className="logo__path">/{site.logoPath}</span>
      </span>
    </Link>
  );
}

function Drawer({ tree, onClose }: { tree: Tree; onClose: () => void }) {
  const ref = useDialogFocus<HTMLDivElement>(onClose);
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div ref={ref} className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="drawer__head">
          <Logo onNavigate={onClose} />
          <button type="button" className="icon-btn" aria-label="Close menu" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <MainNav onNavigate={onClose} />
        <Sidebar tree={tree} onNavigate={onClose} />
      </div>
    </>
  );
}

export function Header({ tree }: { tree: Tree }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mac, setMac] = useState(true);
  const pathname = usePathname();

  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button
          type="button"
          className="icon-btn only-mobile"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon />
        </button>
        <Logo />
        <MainNav />
        <button type="button" className="search-trigger" onClick={openSearch}>
          <SearchIcon />
          Search notes…
          <span className="kbd">{mac ? "⌘K" : "Ctrl K"}</span>
        </button>
        <button type="button" className="icon-btn only-mobile" aria-label="Search notes" onClick={openSearch}>
          <SearchIcon size={20} />
        </button>
        <AppearanceMenu />
        {github && (
          <a
            href={github.url}
            className="icon-btn gh-link"
            aria-label={`${site.author} on GitHub`}
            title="GitHub"
            target="_blank"
            rel="noopener noreferrer me"
          >
            <GitHubIcon />
          </a>
        )}
      </div>
      {menuOpen && <Drawer tree={tree} onClose={() => setMenuOpen(false)} />}
    </header>
  );
}
