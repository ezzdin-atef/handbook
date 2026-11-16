import type { Metadata, Viewport } from "next";
import { prefsScript } from "@/lib/theme";
import { Inter, IBM_Plex_Sans_Arabic, JetBrains_Mono } from "next/font/google";
import { site } from "@/site.config";
import { getSite, type Folder } from "@/lib/content";
import type { Tree, TreeFolder } from "@/lib/tree";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SearchDialog } from "@/components/SearchDialog";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter" });
// Arabic text: IBM Plex Sans Arabic is drawn to sit well beside Inter.
const arabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600", "700"], variable: "--font-arabic" });

/**
 * Each next/font family comes as "'Real', 'Real Fallback'", where the fallback is
 * local Arial. Arial has Arabic glyphs, so `Inter, Inter Fallback, Plex Arabic`
 * would draw Arabic in Arial. Put both real fonts first, then the fallbacks.
 */
const families = (f: { style: { fontFamily: string } }) => f.style.fontFamily.split(",").map((s) => s.trim());
const [interMain, ...interFallback] = families(inter);
const [arabicMain, ...arabicFallback] = families(arabic);
const fontSans = [interMain, arabicMain, ...interFallback, ...arabicFallback, "system-ui", "sans-serif"].join(", ");
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains" });
// Same problem in code: JetBrains Mono's fallback is Arial scaled up 134% to match
// mono widths, so Arabic comments came out in oversized Arial. There is no good
// Arabic monospace, so Arabic in code uses Plex Arabic like the prose does.
const [monoMain, ...monoFallback] = families(mono);
const fontMono = [monoMain, arabicMain, ...monoFallback, "ui-monospace", "monospace"].join(", ");

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111113" },
  ],
};

function toTree(folder: Folder): TreeFolder {
  return {
    slug: folder.slug,
    name: folder.name,
    count: folder.count,
    notes: folder.notes.map((n) => ({ slug: n.slug, fileName: n.fileName })),
    folders: folder.folders.map(toTree),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const data = await getSite();
  const tree: Tree = { folders: data.root.folders.map(toTree), total: data.notes.length };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${arabic.variable} ${mono.variable}`}
      style={{ "--font-sans": fontSans, "--font-mono": fontMono } as React.CSSProperties}
      suppressHydrationWarning
    >
      <head>
        {/* Applies saved theme + accent before first paint. Must stay a plain inline
            script: next/script queues it until hydration, which causes a flash.
            React logs a harmless dev-only warning about script tags for this. */}
        <script dangerouslySetInnerHTML={{ __html: prefsScript }} />
      </head>
      <body>
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <Header tree={tree} />
        <div className="shell">
          <Sidebar tree={tree} />
          {children}
        </div>
        <SearchDialog />
      </body>
    </html>
  );
}
