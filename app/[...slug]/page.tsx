import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSite } from "@/lib/content";
import { FolderView } from "@/components/views/FolderView";
import { NoteView } from "@/components/views/NoteView";
import { HistoryView } from "@/components/views/HistoryView";

type Params = { slug: string[] };

export const dynamicParams = false;

const EMPTY_PLACEHOLDER = "_empty";

export async function generateStaticParams(): Promise<Params[]> {
  const data = await getSite();
  const params: Params[] = [];
  for (const slug of data.folderBySlug.keys()) if (slug) params.push({ slug: slug.split("/") });
  for (const n of data.notes) {
    params.push({ slug: n.slug.split("/") });
    params.push({ slug: [...n.slug.split("/"), "history"] });
  }
  // Static export needs at least one path. With no notes yet, emit a placeholder
  // that renders the 404 page ("_" prefixes are ignored as note names, so no clash).
  if (!params.length) params.push({ slug: [EMPTY_PLACEHOLDER] });
  return params;
}

async function resolve(segments: string[]) {
  const data = await getSite();
  const slug = segments.map(decodeURIComponent).join("/");
  const folder = data.folderBySlug.get(slug);
  if (folder) return { data, folder } as const;
  const note = data.bySlug.get(slug);
  if (note) return { data, note } as const;
  if (segments[segments.length - 1] === "history") {
    const n = data.bySlug.get(segments.slice(0, -1).map(decodeURIComponent).join("/"));
    if (n) return { data, history: n } as const;
  }
  return { data } as const;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const r = await resolve((await params).slug);
  if ("folder" in r && r.folder) return { title: r.folder.slug };
  if ("note" in r && r.note) return { title: r.note.title, description: r.note.summary || undefined };
  if ("history" in r && r.history) return { title: `History of ${r.history.fileName}` };
  return {};
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const r = await resolve((await params).slug);
  if ("folder" in r && r.folder) return <FolderView folder={r.folder} />;
  if ("note" in r && r.note) return <NoteView note={r.note} site={r.data} />;
  if ("history" in r && r.history) return <HistoryView note={r.history} />;
  notFound();
}
