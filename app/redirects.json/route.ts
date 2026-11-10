import { getSite } from "@/lib/content";

export const dynamic = "force-static";

/** Old slug -> current slug, from git renames. Used by the 404 page. */
export async function GET() {
  const data = await getSite();
  return Response.json(data.redirects);
}
