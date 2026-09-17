/**
 * Helper sanitasi teks untuk membersihkan tag HTML, mengonversi entity,
 * dan menghasilkan ringkasan (summary) teks polos yang rapi untuk artikel berita dan pengumuman.
 */

export const stripHtml = (html?: string | null): string => {
  if (!html) return '';
  return String(html)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&hellip;/gi, '...')
    .replace(/&#(\d+);/g, (_, code) => {
      try {
        return String.fromCharCode(parseInt(code, 10));
      } catch {
        return '';
      }
    })
    .replace(/\s+/g, ' ')
    .trim();
};

export const generateSummary = (content?: string | null, maxLength: number = 180): string => {
  const plain = stripHtml(content);
  if (!plain) return '';
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trim() + '...';
};
