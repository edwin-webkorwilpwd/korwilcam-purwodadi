import { DocumentDownload } from '../types';
import { extractGoogleDriveId } from './driveHelper';

/**
 * Helper untuk pembuatan slug dan URL detail dokumen / unduh berkas
 */

export const generateDocumentSlug = (title: string): string => {
  return (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getDocumentSlug = (item: { title: string; slug?: string; id?: string }): string => {
  if (item.slug && item.slug.trim()) {
    return item.slug.trim();
  }
  return generateDocumentSlug(item.title) || item.id || 'berkas';
};

export const getDocumentDetailPath = (item: { title: string; slug?: string; id?: string }): string => {
  const slug = getDocumentSlug(item);
  return `/layanan/unduh-berkas/${encodeURIComponent(slug)}`;
};

/**
 * Menghasilkan nama file yang bersih dan sesuai dengan judul serta format dokumen
 * Contoh: "Syarat Cuti Terbaru" + "DOCX" -> "Syarat Cuti Terbaru.docx"
 */
export const getCleanDocumentFileName = (title: string, fileType?: string): string => {
  let cleanTitle = (title || 'Dokumen_Resmi_Korwilcam').trim().replace(/[/\\?%*:|"<>]/g, ' ');
  const ext = (fileType || 'pdf').toLowerCase().replace(/^\./, '');

  // Jika judul sudah memiliki ekstensi yang sama di belakangnya
  if (cleanTitle.toLowerCase().endsWith(`.${ext}`)) {
    return cleanTitle;
  }

  // Jika judul sudah memiliki salah satu ekstensi file umum yang valid
  const knownExtensions = ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'zip', 'rar', 'csv', 'txt'];
  for (const known of knownExtensions) {
    if (cleanTitle.toLowerCase().endsWith(`.${known}`)) {
      return cleanTitle;
    }
  }

  return `${cleanTitle}.${ext}`;
};

/**
 * Mendapatkan URL unduh langsung dari sistem internal website tanpa beralih ke Google Drive
 */
export const getDirectDocumentDownloadUrl = (doc: DocumentDownload): string => {
  const fileName = getCleanDocumentFileName(doc.title, doc.fileType);
  const driveId = extractGoogleDriveId(doc.downloadUrl || '');

  if (driveId) {
    return `/api/download-document?id=${encodeURIComponent(driveId)}&filename=${encodeURIComponent(fileName)}`;
  }

  if (doc.downloadUrl && doc.downloadUrl !== '#' && (doc.downloadUrl.startsWith('http://') || doc.downloadUrl.startsWith('https://'))) {
    return `/api/download-document?url=${encodeURIComponent(doc.downloadUrl)}&filename=${encodeURIComponent(fileName)}`;
  }

  return doc.downloadUrl || '#';
};

/**
 * Mengunduh dokumen secara langsung dari website (Direct Download)
 * - File terunduh langsung ke perangkat pengunjung (tidak berpindah ke halaman Google Drive)
 * - Penamaan file otomatis sesuai nama dokumen resmi dan ekstensi filenya
 */
export const triggerDocumentDownload = async (doc: DocumentDownload): Promise<void> => {
  const fileName = getCleanDocumentFileName(doc.title, doc.fileType);

  // 1. Jika URL berupa Base64 Data URI
  if (doc.downloadUrl && doc.downloadUrl !== '#' && doc.downloadUrl.startsWith('data:')) {
    const link = document.createElement('a');
    link.href = doc.downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // 2. Jika tautan berupa Google Drive atau URL HTTP(S) publik
  if (doc.downloadUrl && doc.downloadUrl !== '#' && (doc.downloadUrl.startsWith('http://') || doc.downloadUrl.startsWith('https://'))) {
    const downloadApiUrl = getDirectDocumentDownloadUrl(doc);

    try {
      // Ambil file via API endpoint internal
      const response = await fetch(downloadApiUrl);
      if (!response.ok) {
        throw new Error(`Gagal mengunduh berkas (Status ${response.status})`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Bebaskan memori blob setelah unduhan dimulai
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 15000);
      return;
    } catch (fetchErr) {
      console.warn('Fetch langsung menemui kendala, mengaktifkan unduhan native attachment:', fetchErr);
      
      // Fallback: Unduh via elemen <a> dengan endpoint attachment (tetap di website ini tanpa pindah halaman)
      const link = document.createElement('a');
      link.href = downloadApiUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
  }

  // 3. Fallback jika berkas belum memiliki tautan biner di spreadsheet: buat berkas teks terstruktur resmi
  const content = `==========================================================\nPORTAL RESMI KORWILCAM BIDANG PENDIDIKAN PURWODADI\nDINAS PENDIDIKAN KABUPATEN GROBOGAN\n==========================================================\n\nJudul Dokumen  : ${doc.title}\nKategori       : ${doc.category}\nFormat Berkas  : ${doc.fileType}\nUkuran Berkas  : ${doc.fileSize}\nTanggal Rilis  : ${doc.date}\n\nKETERANGAN / DESKRIPSI:\n${doc.description}\n\n----------------------------------------------------------\nDokumen ini merupakan arsip digital resmi yang diterbitkan oleh Kantor Koordinator Wilayah Bidang Pendidikan Kecamatan Purwodadi untuk satuan pendidikan SD, TK, dan KB.\n----------------------------------------------------------`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};
