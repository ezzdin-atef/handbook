import path from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { visit, SKIP } from "unist-util-visit";
import { toString as mdToString } from "mdast-util-to-string";
import { toString as hastToString } from "hast-util-to-string";
import type { Root as MdRoot } from "mdast";
import type { Root as HastRoot, Element } from "hast";

export type Heading = { depth: 2 | 3; text: string; id: string };

export type Rendered = {
  html: string;
  headings: Heading[];
  /** Slugs of other notes this markdown links to. */
  links: string[];
  /** Text of the first H1 if it was the first node (removed from html). */
  h1?: string;
  plainText: string;
};

type Options = {
  /** Path of the source file relative to the notes dir, e.g. "rust/ownership.md". */
  relPath: string;
  /** Drop a leading H1 (used as the page title instead). */
  stripLeadingH1?: boolean;
};

/** "rust/ownership.md" -> "rust/ownership"; "rust/README.md" -> "rust". */
export function fileToSlug(relPath: string): string {
  const noExt = relPath.replace(/\\/g, "/").replace(/\.md$/i, "");
  if (/(^|\/)README$/i.test(noExt)) return noExt.replace(/\/?README$/i, "");
  return noExt;
}

export async function renderMarkdown(source: string, opts: Options): Promise<Rendered> {
  const headings: Heading[] = [];
  const links = new Set<string>();
  let h1: string | undefined;
  let plainText = "";

  const fromDir = path.posix.dirname(opts.relPath.replace(/\\/g, "/"));

  const remarkNotes = () => (tree: MdRoot) => {
    const first = tree.children[0];
    if (opts.stripLeadingH1 && first?.type === "heading" && first.depth === 1) {
      h1 = mdToString(first);
      tree.children.shift();
    }
    plainText = mdToString(tree);

    visit(tree, "link", (node) => {
      const url = node.url;
      if (/^[a-z]+:|^\/\/|^#/i.test(url)) return;
      const [target, hash] = url.split("#");
      if (!/\.md$/i.test(target)) return;
      const resolved = path.posix.normalize(path.posix.join(fromDir, target));
      if (resolved.startsWith("..")) return;
      const slug = fileToSlug(resolved);
      links.add(slug);
      node.url = "/" + slug + (hash ? "#" + hash : "");
    });
  };

  const rehypeCollect = () => (tree: HastRoot) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "h2" || node.tagName === "h3") {
        const id = String(node.properties?.id ?? "");
        if (id) headings.push({ depth: node.tagName === "h2" ? 2 : 3, text: hastToString(node), id });
        return SKIP;
      }
      if (node.tagName === "a") {
        const href = String(node.properties?.href ?? "");
        if (/^https?:\/\//.test(href)) {
          node.properties = { ...node.properties, rel: ["noopener", "noreferrer"] };
        }
      }
    });
  };

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkNotes)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeCollect)
    .use(rehypePrettyCode, { theme: "github-dark", keepBackground: false })
    .use(rehypeStringify)
    .process(source);

  return { html: String(file), headings, links: [...links], h1, plainText };
}
