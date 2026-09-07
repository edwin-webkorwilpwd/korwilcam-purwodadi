/**
 * Helper utility for calculating and formatting reading durations and overall reader averages.
 */

export interface ReadingStats {
  text: string;           // E.g. 2 Menit Baca or 45 Detik Baca
  avgSeconds: number;     // Average duration in seconds
  avgMinutes: number;     // Average duration in minutes
  readCount: number;      // Total readers measured
  isReal: boolean;        // True if derived from real user reading sessions
  detailed: string;       // Human-readable detailed breakdown for tooltips
}

/**
 * Calculates raw word count by stripping HTML tags and punctuation.
 */
export const calculateWordCount = (content: string = ''): number => {
  if (!content) return 0;
  return content
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
};

/**
 * Formats reading duration and calculates the overall reader average.
 * If actual reading data exists (readCount > 0 and totalSeconds > 0),
 * it averages the time spent by all visitors.
 * Otherwise, it falls back to standard reading speed estimation (180 words per minute).
 */
export const formatReadingDuration = (
  totalSeconds: number = 0,
  readCount: number = 0,
  wordCount: number = 0
): ReadingStats => {
  const safeTotal = Math.max(0, Number(totalSeconds) || 0);
  const safeCount = Math.max(0, Number(readCount) || 0);

  if (safeCount > 0 && safeTotal > 0) {
    const avgSeconds = Math.round(safeTotal / safeCount);

    if (avgSeconds < 60) {
      return {
        text: `${avgSeconds} Detik Baca`,
        avgSeconds,
        avgMinutes: Math.max(1, Math.round(avgSeconds / 60)),
        readCount: safeCount,
        isReal: true,
        detailed: `Rata-rata durasi baca: ${avgSeconds} detik (berdasarkan ${safeCount} pembaca)`
      };
    }

    const minutes = Math.max(1, Math.round(avgSeconds / 60));
    const minsPart = Math.floor(avgSeconds / 60);
    const secsPart = avgSeconds % 60;
    const detailTime = secsPart > 0 ? `${minsPart} menit ${secsPart} detik` : `${minsPart} menit`;

    return {
      text: `${minutes} Menit Baca`,
      avgSeconds,
      avgMinutes: minutes,
      readCount: safeCount,
      isReal: true,
      detailed: `Rata-rata durasi baca: ${detailTime} (berdasarkan ${safeCount} pembaca)`
    };
  }

  // Fallback to estimation based on text length (standard average ~180 wpm)
  const estimatedMinutes = Math.max(1, Math.ceil(wordCount / 180));
  return {
    text: `${estimatedMinutes} Menit Baca`,
    avgSeconds: estimatedMinutes * 60,
    avgMinutes: estimatedMinutes,
    readCount: 0,
    isReal: false,
    detailed: `Estimasi waktu membaca: ~${estimatedMinutes} menit (${wordCount} kata)`
  };
};

/**
 * Convenience wrapper for any news article object.
 */
export const getArticleReadingStats = (article: {
  content?: string;
  totalReadSeconds?: number;
  readCount?: number;
}): ReadingStats => {
  const wordCount = calculateWordCount(article.content || '');
  return formatReadingDuration(
    article.totalReadSeconds || 0,
    article.readCount || 0,
    wordCount
  );
};
