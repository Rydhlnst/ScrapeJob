import DOMPurify from "isomorphic-dompurify"

// Allow-list mirrors what the TipTap editor can produce so we never strip
// content the operator authored — but blocks scripts, iframes, event handlers,
// javascript:/data: URLs, and other XSS vectors.
const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "code", "pre",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "hr",
  "a", "img",
  "table", "thead", "tbody", "tr", "th", "td",
  "span", "div",
  "mark", "sub", "sup",
  "input",
]

const ALLOWED_ATTR = [
  "href", "target", "rel",
  "src", "alt", "title", "width", "height",
  "colspan", "rowspan", "align",
  "class", "style",
  "data-checked", "data-type",
  "type", "checked", "disabled",
]

// Force safe defaults on anchors even if editor omitted them.
DOMPurify.addHook?.("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank")
    node.setAttribute("rel", "noopener noreferrer nofollow")
  }
  // Only allow safe CSS properties in style attributes.
  if (node.hasAttribute("style")) {
    const style = node.getAttribute("style") ?? ""
    const safe = style
      .split(";")
      .map((s) => s.trim())
      .filter((s) => {
        if (!s) return false
        const prop = s.split(":")[0]?.trim().toLowerCase() ?? ""
        return [
          "text-align",
          "color",
          "background-color",
          "font-weight",
          "font-style",
          "text-decoration",
        ].includes(prop)
      })
      .join("; ")
    if (safe) {
      node.setAttribute("style", safe)
    } else {
      node.removeAttribute("style")
    }
  }
})

export function sanitizeHtml(html: string): string {
  if (!html) return ""
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ["script", "iframe", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  })
}
