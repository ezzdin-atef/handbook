import type { Metadata } from "next";
import { Suspense } from "react";
import { getSite } from "@/lib/content";
import { AllNotesTable, type Row } from "@/components/AllNotesTable";
import { EmptyState } from "@/components/EmptyState";

export const metadata: Metadata = { title: "All notes" };

export default async function AllNotesPage() {
  const data = await getSite();
  const rows: Row[] = data.notes.map((n) => ({
    slug: n.slug,
    title: n.title,
    folder: n.folder,
    topFolder: n.folder.split("/")[0],
    tags: n.tags,
    updated: n.updated,
    created: n.created,
  }));
  const folders = data.root.folders.map((f) => f.name);

  return (
    <main id="content" className="main">
      <h1 className="page-title">All notes</h1>
      {rows.length === 0 ? (
        <EmptyState title="No notes yet">Every note will be listed here, with filters by folder and tag.</EmptyState>
      ) : (
        <Suspense fallback={<AllNotesTable rows={rows} folders={folders} />}>
          <AllNotesTable rows={rows} folders={folders} withParams />
        </Suspense>
      )}
    </main>
  );
}
