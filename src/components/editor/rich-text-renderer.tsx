import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { isExternalUrl, isSafeImageUrl, isSafeUrl } from "@/lib/security/url";
import type { RichTextMark, RichTextNode } from "@/validation/rich-text";

/**
 * Renders stored rich text JSON as React elements. No HTML strings and no
 * dangerouslySetInnerHTML: text is escaped by React, only allow-listed
 * node types render, and every URL is checked again at render time, so
 * even tampered database content can't inject markup or script.
 * Works in Server Components (no client JavaScript).
 */
export function RichTextRenderer({
  document,
  className,
}: {
  document: RichTextNode | null | undefined;
  className?: string;
}) {
  if (!document || document.type !== "doc") return null;
  return <div className={cn("rich-text", className)}>{renderChildren(document)}</div>;
}

function renderChildren(node: RichTextNode): ReactNode {
  return (node.content ?? []).map((child, index) => (
    <Fragment key={index}>{renderNode(child)}</Fragment>
  ));
}

function renderNode(node: RichTextNode): ReactNode {
  switch (node.type) {
    case "paragraph":
      return <p>{renderChildren(node)}</p>;
    case "heading": {
      const level = node.attrs?.level;
      if (level === 1) return <h1>{renderChildren(node)}</h1>;
      if (level === 3) return <h3>{renderChildren(node)}</h3>;
      return <h2>{renderChildren(node)}</h2>;
    }
    case "bulletList":
      return <ul>{renderChildren(node)}</ul>;
    case "orderedList": {
      const start = Number(node.attrs?.start);
      return (
        <ol start={Number.isInteger(start) && start > 1 ? start : undefined}>
          {renderChildren(node)}
        </ol>
      );
    }
    case "listItem":
      return <li>{renderChildren(node)}</li>;
    case "blockquote":
      return <blockquote>{renderChildren(node)}</blockquote>;
    case "hardBreak":
      return <br />;
    case "image": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
      if (!isSafeImageUrl(src)) return null;
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      const title = typeof node.attrs?.title === "string" ? node.attrs.title : undefined;
      return (
        // Inline content images have unknown dimensions; next/image is
        // used for media-library images with stored width/height.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} title={title} loading="lazy" decoding="async" />
      );
    }
    case "text":
      return renderText(node.text ?? "", node.marks ?? []);
    default:
      return null;
  }
}

function renderText(text: string, marks: RichTextMark[]): ReactNode {
  return marks.reduce<ReactNode>((children, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{children}</strong>;
      case "italic":
        return <em>{children}</em>;
      case "underline":
        return <u>{children}</u>;
      case "link": {
        const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "";
        if (!isSafeUrl(href)) return children;
        const external = isExternalUrl(href);
        return (
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            {children}
          </a>
        );
      }
      default:
        return children;
    }
  }, text);
}
