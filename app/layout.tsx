import type { Metadata, Viewport } from "next";
import { prefsScript } from "@/lib/theme";
import { Inter, JetBrains_Mono } from "next/font/google";
import { site } from "@/site.config";
import { getSite, type Folder } from "@/lib/content";
import type { Tree, TreeFolder } from "@/lib/tree";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SearchDialog } from "@/components/SearchDialog";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains" });

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
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
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
