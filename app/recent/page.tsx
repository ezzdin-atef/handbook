import type { Metadata } from "next";
import { allChanges, getSite } from "@/lib/content";
import { RecentFeed } from "@/components/RecentFeed";
import { EmptyState } from "@/components/EmptyState";

export const metadata: Metadata = { title: "Recently updated" };

export default async function RecentPage() {
  const data = await getSite();
  const changes = allChanges(data.notes);

  return (
    <main id="content" className="main">
      <h1 className="page-title">Recently updated</h1>
      <p className="lead" style={{ marginTop: 10 }}>
        Every change here comes from a commit to the notes repo, newest first.
      </p>
      {changes.length === 0 ? (
        <EmptyState title="No changes yet">New and edited notes will appear here, grouped by day.</EmptyState>
      ) : (
        <RecentFeed changes={changes} />
      )}
    </main>
  );
}
