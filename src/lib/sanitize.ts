import DOMPurify from "isomorphic-dompurify";

/** Sanitiser du HTML pour usage dans dangerouslySetInnerHTML */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["strong", "em", "br", "span", "p", "ul", "li", "div"],
    ALLOWED_ATTR: ["style"],
  });
}
