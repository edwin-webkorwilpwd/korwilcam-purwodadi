/**
 * Utilitas untuk mengelola dan mengonversi tautan gambar Google Drive
 * Mendukung berbagai format tautan sharing:
 * - https://drive.google.com/file/d/[FILE_ID]/view?usp=sharing
 * - https://drive.google.com/open?id=[FILE_ID]
 * - https://drive.google.com/uc?id=[FILE_ID]
 * - https://lh3.googleusercontent.com/d/[FILE_ID]
 */

export function extractGoogleDriveId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // 1. Format /file/d/{id} atau /d/{id}
  const matchFileD = trimmed.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{20,})/);
  if (matchFileD && matchFileD[1]) return matchFileD[1];

  // 2. Format googleusercontent.com/d/{id}
  const matchLh3 = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{20,})/);
  if (matchLh3 && matchLh3[1]) return matchLh3[1];

  // 3. Format id={id} pada query parameter
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  // 4. Fallback matching string panjang 25+ karakter
  const matchGeneral = trimmed.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]{25,})/);
  if (matchGeneral && matchGeneral[1]) return matchGeneral[1];

  return null;
}

export function isGoogleDriveUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return /drive\.google\.com|googleusercontent\.com\/d\//i.test(url);
}

/**
 * Mengonversi link Google Drive apa pun menjadi URL gambar resolusi tinggi langsung.
 * Jika URL bukan Google Drive, mengembalikan URL asli apa adanya.
 */
export function formatGoogleDriveImageUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    // lh3.googleusercontent.com/d/{id} menyajikan gambar murni tanpa CORS atau batasan redirect
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }

  return trimmed;
}

/**
 * Mendapatkan daftar kandidat URL Google Drive langsung (multi-tier fallback)
 */
export function getGoogleDriveCandidates(url: string): string[] {
  if (!url || typeof url !== 'string') return [];
  const trimmed = url.trim();
  const driveId = extractGoogleDriveId(trimmed);
  if (!driveId) return [trimmed];
  return [
    `https://lh3.googleusercontent.com/d/${driveId}`,
    `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`,
    `https://drive.google.com/uc?export=view&id=${driveId}`,
    `https://lh3.googleusercontent.com/u/0/d/${driveId}`
  ];
}

/**
 * Mendapatkan URL Google Drive asli untuk tombol "Buka di Google Drive"
 */
export function getGoogleDriveViewUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/view?usp=sharing`;
  }
  return trimmed;
}

/**
 * Mendapatkan URL thumbnail Google Drive resolusi tinggi
 */
export function getGoogleDriveThumbnailUrl(url: string, width = 2500): string {
  if (!url) return '';
  const trimmed = url.trim();
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w${width}`;
  }
  return trimmed;
}

/**
 * Mendapatkan URL preview iframe Google Drive
 */
export function getGoogleDrivePreviewUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }
  return trimmed;
}

/**
 * Mengekstrak Folder ID dari URL Google Drive Folder
 * Mendukung format:
 * - https://drive.google.com/drive/folders/[FOLDER_ID]
 * - https://drive.google.com/drive/u/0/folders/[FOLDER_ID]
 * - https://drive.google.com/open?id=[FOLDER_ID]
 */
export function extractGoogleDriveFolderId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  const matchFolders = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{15,})/);
  if (matchFolders && matchFolders[1]) return matchFolders[1];

  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  return null;
}

export function isGoogleDriveFolderUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return /drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\//i.test(url) || extractGoogleDriveFolderId(url) !== null;
}

export function getGoogleDriveFolderViewUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const folderId = extractGoogleDriveFolderId(trimmed);
  if (folderId) {
    return `https://drive.google.com/drive/folders/${folderId}`;
  }
  return trimmed;
}

/**
 * Mengekstrak banyak URL / File ID Google Drive dari sebuah blok teks (multi-link/multi-line)
 */
export function parseGoogleDriveImageLinks(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  
  // Split berdasarkan baris baru, koma, spasi, atau titik koma
  const tokens = text.split(/[\r\n,;]+/).map((t) => t.trim()).filter(Boolean);
  const result: string[] = [];
  const seenIds = new Set<string>();

  for (const token of tokens) {
    const driveId = extractGoogleDriveId(token);
    if (driveId && !seenIds.has(driveId)) {
      seenIds.add(driveId);
      result.push(token);
    } else if (!driveId && (token.startsWith('http://') || token.startsWith('https://'))) {
      result.push(token);
    }
  }

  return result;
}

