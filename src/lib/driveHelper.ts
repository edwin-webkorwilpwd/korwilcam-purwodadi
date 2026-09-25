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
 * Mengonversi link Google Drive apa pun menjadi URL gambar langsung berkecepatan tinggi.
 * Jika parameter size diberikan, Google CDN akan mengompresi dan meresize gambar ke ukuran yang dibutuhkan
 * (mengurangi ukuran data hingga 95%+ dan mempercepat load secara dramatis).
 * Jika URL bukan Google Drive, mengembalikan URL asli apa adanya.
 */
export function formatGoogleDriveImageUrl(url: string, size?: number): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    // lh3.googleusercontent.com/d/{id} menyajikan gambar murni tanpa CORS atau batasan redirect
    if (size && size > 0) {
      return `https://lh3.googleusercontent.com/d/${driveId}=s${size}`;
    }
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }

  return trimmed;
}

/**
 * Mendapatkan daftar kandidat URL Google Drive langsung (multi-tier fallback dengan dukungan ukuran)
 */
export function getGoogleDriveCandidates(url: string, size?: number): string[] {
  if (!url || typeof url !== 'string') return [];
  const trimmed = url.trim();
  const driveId = extractGoogleDriveId(trimmed);
  if (!driveId) return [trimmed];
  const sizeParam = size && size > 0 ? `=s${size}` : '';
  const szParam = size && size > 0 ? `&sz=w${size}` : '&sz=w1200';
  return [
    `https://lh3.googleusercontent.com/d/${driveId}${sizeParam}`,
    `https://drive.google.com/thumbnail?id=${driveId}${szParam}`,
    `https://lh3.googleusercontent.com/u/0/d/${driveId}${sizeParam}`,
    `https://drive.google.com/uc?export=view&id=${driveId}`
  ];
}

/**
 * Prefetch gambar Google Drive ke dalam memori/cache browser sebelum komponen dibuka
 * sehingga gambar langsung tampil instan (0ms) saat pengunjung mengklik kartu/menu.
 */
export function prefetchGoogleDriveImage(url: string, size?: number): void {
  if (!url || typeof url !== 'string') return;
  const targetUrl = formatGoogleDriveImageUrl(url, size);
  if (!targetUrl || targetUrl === '#' || targetUrl.startsWith('data:')) return;
  try {
    const img = new Image();
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    img.src = targetUrl;
  } catch {}
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
 * Mendapatkan URL Google Drive embedded folder view untuk ditampilkan dalam iframe
 */
export function getGoogleDriveEmbeddedFolderUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const folderId = extractGoogleDriveFolderId(trimmed);
  if (folderId) {
    return `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
  }
  return trimmed;
}

/**
 * Mengekstrak banyak URL / File ID Google Drive dari sebuah blok teks (multi-link/multi-line)
 * dan mengonversinya menjadi URL langsung berkecepatan tinggi.
 */
export function parseGoogleDriveImageLinks(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  
  // Pisahkan berdasarkan baris baru, spasi ganda, koma, titik koma, kutip, tanda kurung siku atau kurung biasa
  const rawTokens = text.split(/[\r\n,;\s"'\(\)\[\]]+/).map((t) => t.trim()).filter(Boolean);
  const result: string[] = [];
  const seenIds = new Set<string>();

  for (const token of rawTokens) {
    // Abaikan jika ini hanya folder link tanpa file
    if (token.includes('/drive/folders/') || token.includes('embeddedfolderview')) {
      continue;
    }

    const driveId = extractGoogleDriveId(token);
    if (driveId && !seenIds.has(driveId)) {
      seenIds.add(driveId);
      result.push(formatGoogleDriveImageUrl(token));
    } else if (!driveId && (token.startsWith('http://') || token.startsWith('https://') || token.startsWith('/'))) {
      if (!seenIds.has(token)) {
        seenIds.add(token);
        result.push(token);
      }
    }
  }

  return result;
}

/**
 * Metadata Galeri Fallback untuk Supabase
 * Memungkinkan penyimpanan daftar foto (images) dan driveFolderUrl di dalam kolom description
 * sehingga data foto dokumentasi 100% aman tersimpan dan tidak hilang meskipun tabel Supabase
 * belum memiliki kolom `images` atau `drive_folder_url`.
 */
const META_START_TAG = '<!--DRIVE_META:';
const META_END_TAG = ':DRIVE_META-->';

export interface GalleryMetaPayload {
  driveFolderUrl?: string;
  images?: string[];
}

export function embedGalleryMetadata(description: string, meta: GalleryMetaPayload): string {
  const baseDesc = (description || '').replace(/<!--DRIVE_META:[\s\S]*?:DRIVE_META-->/g, '').trim();
  const hasMeta = Boolean((meta.driveFolderUrl && meta.driveFolderUrl.trim()) || (meta.images && meta.images.length > 0));
  
  if (!hasMeta) return baseDesc;

  try {
    const jsonStr = JSON.stringify({
      driveFolderUrl: meta.driveFolderUrl?.trim() || '',
      images: Array.isArray(meta.images) ? meta.images : []
    });
    return `${baseDesc ? baseDesc + '\n\n' : ''}${META_START_TAG}${jsonStr}${META_END_TAG}`;
  } catch {
    return baseDesc;
  }
}

export function extractGalleryMetadata(description: string): {
  cleanDescription: string;
  driveFolderUrl?: string;
  images?: string[];
} {
  if (!description || typeof description !== 'string') {
    return { cleanDescription: '' };
  }

  const match = description.match(/<!--DRIVE_META:([\s\S]*?):DRIVE_META-->/);
  const cleanDescription = description.replace(/<!--DRIVE_META:[\s\S]*?:DRIVE_META-->/g, '').trim();

  if (!match || !match[1]) {
    return { cleanDescription };
  }

  try {
    const parsed = JSON.parse(match[1]);
    return {
      cleanDescription,
      driveFolderUrl: typeof parsed.driveFolderUrl === 'string' ? parsed.driveFolderUrl : undefined,
      images: Array.isArray(parsed.images) ? parsed.images : undefined
    };
  } catch {
    return { cleanDescription };
  }
}

/**
 * Mengambil daftar foto dari Google Drive API v3 (jika API Key tersedia)
 */
export async function fetchGoogleDriveFolderPhotos(folderId: string, apiKey?: string): Promise<string[]> {
  if (!folderId) return [];
  const key = apiKey || (import.meta as any).env?.VITE_GOOGLE_DRIVE_API_KEY;
  if (!key) return [];

  try {
    const q = encodeURIComponent(`'${folderId}' in parents and trashed = false and (mimeType contains 'image/' or mimeType = 'application/vnd.google-apps.photo')`);
    const fields = encodeURIComponent('files(id, name, mimeType)');
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=100&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.files && Array.isArray(data.files)) {
      return data.files.map((file: any) => `https://lh3.googleusercontent.com/d/${file.id}`);
    }
  } catch (err) {
    console.warn('Gagal memuat Google Drive API:', err);
  }
  return [];
}


