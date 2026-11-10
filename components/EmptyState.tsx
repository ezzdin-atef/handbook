import { site } from "@/site.config";
import { FileIcon } from "./Icons";

/** Shown when the notes folder has nothing in it yet. */
export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        <FileIcon size={22} />
      </span>
      <h2 className="empty-state__title">{title}</h2>
      {children && <div className="empty-state__body">{children}</div>}
      <p className="empty-state__hint">
        To add one, create <code>{site.notesDir}/&lt;folder&gt;/&lt;note&gt;.md</code> and push to{" "}
        <code>{site.branch}</code>.
      </p>
    </div>
  );
}
