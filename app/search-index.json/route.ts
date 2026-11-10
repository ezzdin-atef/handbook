import { byUpdated, getSite } from "@/lib/content";
import type { SearchEntry } from "@/lib/tree";

export const dynamic = "force-static";

const BODY_CHARS = 4000;

export async function GET() {
  const data = await getSite();
  const entries: SearchEntry[] = byUpdated(data.notes).map((n) => ({
    slug: n.slug,
    title: n.title,
    folder: n.folder,
    summary: n.summary,
    tags: n.tags,
    headings: n.headings.map((h) => ({ text: h.text, id: h.id })),
    body: n.plainText.slice(0, BODY_CHARS),
  }));
  return Response.json(entries);
}
