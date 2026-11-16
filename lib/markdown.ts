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

/**
 * Blocks that get an explicit `dir`. Code blocks (`pre`) are deliberately left LTR.
 * `li` is left out so a whole list shares one direction (from the list's text) and
 * its numbers or bullets stay on one side.
 */
const DIR_BLOCKS = new Set(["p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "blockquote", "table"]);

const RTL_LETTER = /[֐-ࣿיִ-﷿ﹰ-﻿]/gu;
const LTR_LETTER = /[A-Za-zÀ-ɏ]/g;

/** Letters of a block's text, skipping inline code (always LTR, so it shouldn't vote). */
function proseText(node: Element | HastRoot): string {
  let out = "";
  for (const child of node.children) {
    if (child.type === "text") out += child.value;
    else if (child.type === "element" && child.tagName !== "code") out += proseText(child);
  }
  return out;
}

/**
 * Direction by majority script rather than the first letter (what `dir="auto"`
 * does). Mixed Arabic/English notes often start an Arabic sentence with an English
 * term ("**Ownership** = الكتاب بتاعك"), which `auto` would wrongly render LTR.
 */
function blockDir(node: Element): "rtl" | "ltr" {
  const text = proseText(node);
  const rtl = text.match(RTL_LETTER)?.length ?? 0;
  const ltr = text.match(LTR_LETTER)?.length ?? 0;
  return rtl > ltr ? "rtl" : "ltr";
}

/** "rust/ownership.md" -> "rust/ownership";"rust/README.md" -> "rust". */
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
      if (DIR_BLOCKS.has(node.tagName)) {
        node.properties = { ...node.properties, dir: blockDir(node) };
      }
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
