/**
 * Lightweight, zero-dependency HTML sanitizer for rich text content.
 * Defends against Cross-Site Scripting (XSS) attacks while preserving
 * standard safe formatting, tables, images, and links.
 */

// Tags allowed for rich text articles and formatted content
const ALLOWED_TAGS = new Set([
  'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'ins', 'sub', 'sup',
  'span', 'mark', 'small',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'div', 'section', 'article',
  'a', 'img', 'figure', 'figcaption'
]);

// Tags that must be completely removed along with their children
const FORBIDDEN_TAGS = new Set([
  'script', 'iframe', 'object', 'embed', 'applet',
  'meta', 'link', 'style', 'base', 'form',
  'input', 'button', 'textarea', 'select', 'option'
]);

// Global attributes allowed on any allowed tag
const GLOBAL_ALLOWED_ATTRS = new Set([
  'class', 'title', 'id', 'dir', 'lang'
]);

// Tag-specific allowed attributes
const TAG_ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel', 'title']),
  img: new Set(['src', 'alt', 'title', 'width', 'height', 'loading', 'style', 'align', 'data-align', 'data-size', 'class']),
  th: new Set(['colspan', 'rowspan', 'align', 'scope']),
  td: new Set(['colspan', 'rowspan', 'align']),
  span: new Set(['style', 'class']),
  p: new Set(['style', 'class']),
  div: new Set(['style', 'class']),
  h1: new Set(['style', 'class']),
  h2: new Set(['style', 'class']),
  h3: new Set(['style', 'class']),
  h4: new Set(['style', 'class']),
  h5: new Set(['style', 'class']),
  h6: new Set(['style', 'class']),
  figure: new Set(['style', 'class']),
  figcaption: new Set(['style', 'class']),
  table: new Set(['border', 'cellpadding', 'cellspacing', 'style', 'class'])
};

/**
 * Validates whether a URL protocol is safe (http, https, mailto, tel, relative, anchor, or safe image data).
 */
export function isSafeUrl(url: string, isImage = false): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();

  // Block dangerous pseudo-protocols
  if (/^(?:javascript|vbscript|data):/i.test(trimmed)) {
    // Only permit safe base64 images for img tags
    if (isImage && /^data:image\/(?:png|jpeg|jpg|webp|gif|svg\+xml);base64,/i.test(trimmed)) {
      return true;
    }
    return false;
  }

  // Safe schemes or relative paths
  return /^(?:https?:\/\/|\/|#|mailto:|tel:|blob:)/i.test(trimmed);
}

/**
 * Validates and sanitizes a single URL string.
 * Returns sanitized URL or fallback if unsafe.
 */
export function sanitizeUrl(url: string | null | undefined, fallback = ''): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  return isSafeUrl(trimmed) ? trimmed : fallback;
}

/**
 * Sanitizes inline CSS styles to prevent expression() or javascript: in styles.
 */
function sanitizeStyle(styleValue: string): string {
  if (!styleValue || typeof styleValue !== 'string') return '';
  // Block css expressions, javascript url in styles, behavior, or moz-binding
  if (/expression|javascript|vbscript|behavior|-moz-binding/i.test(styleValue)) {
    return '';
  }
  return styleValue;
}

/**
 * Sanitizes raw HTML string, stripping dangerous tags, scripts, and event handlers.
 * Preserves safe markup, formatting, tables, images, and links.
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty || typeof dirty !== 'string') return '';
  const trimmed = dirty.trim();
  if (!trimmed) return '';

  // If running in browser environment, use DOMParser
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed, 'text/html');

      // Helper to recursively sanitize DOM nodes
      const sanitizeNode = (node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          const tagName = element.tagName.toLowerCase();

          // 1. If it's a strictly forbidden tag, remove it completely
          if (FORBIDDEN_TAGS.has(tagName)) {
            element.remove();
            return;
          }

          // 2. If tag is NOT in allowed list, unwrap it (keep child nodes)
          if (!ALLOWED_TAGS.has(tagName)) {
            while (element.firstChild) {
              element.parentNode?.insertBefore(element.firstChild, element);
            }
            element.remove();
            return;
          }

          // 3. Clean attributes
          const attributes = Array.from(element.attributes);
          const allowedForThisTag = TAG_ALLOWED_ATTRS[tagName] || new Set();

          for (const attr of attributes) {
            const attrName = attr.name.toLowerCase();

            // Strip ALL event handlers (onerror, onload, onclick, etc.)
            if (attrName.startsWith('on')) {
              element.removeAttribute(attr.name);
              continue;
            }

            // Check if attribute is permitted
            const isAllowed =
              GLOBAL_ALLOWED_ATTRS.has(attrName) ||
              allowedForThisTag.has(attrName);

            if (!isAllowed) {
              element.removeAttribute(attr.name);
              continue;
            }

            // Validate href attribute on links
            if (attrName === 'href' && tagName === 'a') {
              if (!isSafeUrl(attr.value)) {
                element.removeAttribute('href');
              } else {
                // Ensure external links have safe rel
                if (element.getAttribute('target') === '_blank') {
                  element.setAttribute('rel', 'noopener noreferrer');
                }
              }
            }

            // Validate src attribute on images
            if (attrName === 'src' && tagName === 'img') {
              if (!isSafeUrl(attr.value, true)) {
                element.removeAttribute('src');
              }
            }

            // Sanitize style attribute
            if (attrName === 'style') {
              const safeStyle = sanitizeStyle(attr.value);
              if (safeStyle) {
                element.setAttribute('style', safeStyle);
              } else {
                element.removeAttribute('style');
              }
            }
          }

          // Recursively sanitize remaining children
          const children = Array.from(element.childNodes);
          for (const child of children) {
            sanitizeNode(child);
          }
        } else if (node.nodeType === Node.COMMENT_NODE) {
          // Remove HTML comments
          node.parentNode?.removeChild(node);
        }
      };

      const nodes = Array.from(doc.body.childNodes);
      for (const node of nodes) {
        sanitizeNode(node);
      }

      return doc.body.innerHTML;
    } catch {
      // Fallback regex if DOMParser fails
    }
  }

  // Fallback regex-based sanitizer (Node / SSR fallback)
  return trimmed
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/\son\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    .replace(/href\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, '')
    .replace(/src\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, '');
}
