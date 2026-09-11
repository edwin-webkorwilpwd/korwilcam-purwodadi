import { DocumentDownload } from '../types';

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
 * Utilitas untuk mengunduh dokumen secara langsung (Data URL, Public HTTP URL, atau Blob Generator)
 */
export const triggerDocumentDownload = (doc: DocumentDownload): void => {
  if (doc.downloadUrl && doc.downloadUrl !== '#' && doc.downloadUrl.startsWith('data:')) {
    const link = document.createElement('a');
    link.href = doc.downloadUrl;
    link.download = `${doc.title.replace(/[/\\?%*:|"<>]/g, '-')}.${(doc.fileType || 'pdf').toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (doc.downloadUrl && doc.downloadUrl !== '#' && (doc.downloadUrl.startsWith('http://') || doc.downloadUrl.startsWith('https://'))) {
    window.open(doc.downloadUrl, '_blank');
  } else {
    // Dokumen teks terstruktur resmi jika link belum berupa file biner
    const content = `==========================================================\nPORTAL RESMI KORWILCAM BIDANG PENDIDIKAN PURWODADI\nDINAS PENDIDIKAN KABUPATEN GROBOGAN\n==========================================================\n\nJudul Dokumen  : ${doc.title}\nKategori       : ${doc.category}\nFormat Berkas  : ${doc.fileType}\nUkuran Berkas  : ${doc.fileSize}\nTanggal Rilis  : ${doc.date}\n\nKETERANGAN / DESKRIPSI:\n${doc.description}\n\n----------------------------------------------------------\nDokumen ini merupakan arsip digital resmi yang diterbitkan oleh Kantor Koordinator Wilayah Bidang Pendidikan Kecamatan Purwodadi untuk satuan pendidikan SD, TK, dan KB.\n----------------------------------------------------------`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const extension = doc.fileType === 'PDF' ? 'txt' : doc.fileType === 'DOCX' ? 'doc' : 'csv';
    link.download = `${doc.title.replace(/[/\\?%*:|"<>]/g, '-')}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
