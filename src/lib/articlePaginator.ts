/**
 * Utility untuk membagi konten artikel berita menjadi beberapa halaman (Pagination Baca).
 * Memecah konten secara cerdas berdasarkan paragraf dan kalimat agar kata/tag HTML tidak terpotong.
 */

export interface ArticlePage {
  pageNumber: number;
  content: string;
  wordCount: number;
  isHtml: boolean;
}

export interface PaginationResult {
  pages: ArticlePage[];
  totalWords: number;
  totalPages: number;
}

export function countWords(text: string): number {
  if (!text) return 0;
  // Hapus tag HTML jika ada untuk menghitung kata murni
  const plainText = text.replace(/<[^>]*>/g, ' ');
  return plainText.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Memecah teks HTML menjadi beberapa halaman berdasarkan target jumlah kata per halaman.
 */
function splitHtmlIntoPages(htmlContent: string, targetWords: number = 600): ArticlePage[] {
  // Gunakan DOMParser jika tersedia di browser
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return [{ pageNumber: 1, content: htmlContent, wordCount: countWords(htmlContent), isHtml: true }];
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const childNodes = Array.from(doc.body.childNodes);

    if (childNodes.length === 0) {
      return [{ pageNumber: 1, content: htmlContent, wordCount: countWords(htmlContent), isHtml: true }];
    }

    const blocks: { html: string; words: number }[] = [];

    childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const text = el.textContent || '';
        const words = countWords(text);

        // Jika satu paragraf sangat panjang (> targetWords * 1.4), pecah berdasarkan kalimat
        if (words > targetWords * 1.4 && el.tagName.toLowerCase() === 'p') {
          const sentences = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [text];
          let currentGroup: string[] = [];
          let currentWords = 0;

          sentences.forEach((s) => {
            const sWords = countWords(s);
            if (currentWords + sWords > targetWords && currentGroup.length > 0) {
              resultsPush();
            }
            currentGroup.push(s.trim());
            currentWords += sWords;
          });

          function resultsPush() {
            if (currentGroup.length > 0) {
              blocks.push({
                html: `<p>${currentGroup.join(' ')}</p>`,
                words: currentWords
              });
              currentGroup = [];
              currentWords = 0;
            }
          }
          resultsPush();
        } else if (words > 0 || el.querySelector('img, iframe, table')) {
          blocks.push({ html: el.outerHTML, words: Math.max(words, 10) });
        }
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        const text = node.textContent.trim();
        blocks.push({ html: `<p>${text}</p>`, words: countWords(text) });
      }
    });

    if (blocks.length === 0) {
      return [{ pageNumber: 1, content: htmlContent, wordCount: countWords(htmlContent), isHtml: true }];
    }

    const pages: ArticlePage[] = [];
    let currentPageBlocks: string[] = [];
    let currentWords = 0;

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];

      // Jika halaman saat ini sudah mencapai target kata dan sudah memiliki minimal 1 blok
      if (currentWords >= targetWords && currentPageBlocks.length > 0) {
        pages.push({
          pageNumber: pages.length + 1,
          content: currentPageBlocks.join('\n'),
          wordCount: currentWords,
          isHtml: true
        });
        currentPageBlocks = [];
        currentWords = 0;
      }

      currentPageBlocks.push(block.html);
      currentWords += block.words;
    }

    if (currentPageBlocks.length > 0) {
      pages.push({
        pageNumber: pages.length + 1,
        content: currentPageBlocks.join('\n'),
        wordCount: currentWords,
        isHtml: true
      });
    }

    return pages.length > 0 ? pages : [{ pageNumber: 1, content: htmlContent, wordCount: countWords(htmlContent), isHtml: true }];
  } catch (err) {
    console.warn('Gagal memecah HTML berita, memuat versi utuh:', err);
    return [{ pageNumber: 1, content: htmlContent, wordCount: countWords(htmlContent), isHtml: true }];
  }
}

/**
 * Memecah teks biasa (plain text) menjadi beberapa halaman berdasarkan target jumlah kata per halaman.
 */
function splitPlainTextIntoPages(text: string, targetWords: number = 600): ArticlePage[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return [{ pageNumber: 1, content: text, wordCount: countWords(text), isHtml: false }];
  }

  const blocks: { text: string; words: number }[] = [];

  paragraphs.forEach((p) => {
    const words = countWords(p);
    if (words > targetWords * 1.4) {
      const sentences = p.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [p];
      let currentSentenceGroup: string[] = [];
      let currentSentenceWords = 0;

      sentences.forEach((s) => {
        const sWords = countWords(s);
        if (currentSentenceWords + sWords > targetWords && currentSentenceGroup.length > 0) {
          blocks.push({
            text: currentSentenceGroup.join(' ').trim(),
            words: currentSentenceWords
          });
          currentSentenceGroup = [];
          currentSentenceWords = 0;
        }
        currentSentenceGroup.push(s.trim());
        currentSentenceWords += sWords;
      });

      if (currentSentenceGroup.length > 0) {
        blocks.push({
          text: currentSentenceGroup.join(' ').trim(),
          words: currentSentenceWords
        });
      }
    } else {
      blocks.push({ text: p, words });
    }
  });

  const pages: ArticlePage[] = [];
  let currentPageParagraphs: string[] = [];
  let currentWords = 0;

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (currentWords >= targetWords && currentPageParagraphs.length > 0) {
      pages.push({
        pageNumber: pages.length + 1,
        content: currentPageParagraphs.join('\n\n'),
        wordCount: currentWords,
        isHtml: false
      });
      currentPageParagraphs = [];
      currentWords = 0;
    }
    currentPageParagraphs.push(b.text);
    currentWords += b.words;
  }

  if (currentPageParagraphs.length > 0) {
    pages.push({
      pageNumber: pages.length + 1,
      content: currentPageParagraphs.join('\n\n'),
      wordCount: currentWords,
      isHtml: false
    });
  }

  return pages.length > 0 ? pages : [{ pageNumber: 1, content: text, wordCount: countWords(text), isHtml: false }];
}

/**
 * Fungsi utama untuk memecah artikel berita menjadi beberapa halaman (pagination pembaca).
 * @param content Teks atau HTML isi berita
 * @param wordsPerPage Jumlah target kata per halaman (default: 600 kata)
 */
export function paginateArticleContent(content: string, wordsPerPage: number = 600): PaginationResult {
  if (!content) {
    return { pages: [], totalWords: 0, totalPages: 0 };
  }

  const totalWords = countWords(content);

  // Jika artikel di bawah atau sama dengan 600 kata, tampilkan langsung 1 halaman tanpa dipecah
  if (totalWords <= wordsPerPage) {
    return {
      pages: [
        {
          pageNumber: 1,
          content,
          wordCount: totalWords,
          isHtml: content.includes('<')
        }
      ],
      totalWords,
      totalPages: 1
    };
  }

  const isHtml = content.includes('<');
  const pages = isHtml
    ? splitHtmlIntoPages(content, wordsPerPage)
    : splitPlainTextIntoPages(content, wordsPerPage);

  return {
    pages,
    totalWords,
    totalPages: pages.length
  };
}
