// Client-side HTML5 Canvas generator for official announcement letter documents
// Generates high-definition JPEG images with 100% visible typography, badges, Kop Surat, and signature.

export interface AnnouncementData {
  id: string;
  title: string;
  date: string;
  urgency: string;
  target: string;
  summary: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
}

export interface OfficeProfileData {
  address?: string;
  email?: string;
  phone?: string;
  korwilName?: string;
  korwilNip?: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill?: string,
  stroke?: string,
  strokeWidth = 1
) {
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [];
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (let p = 0; p < paragraphs.length; p++) {
    const para = paragraphs[p];
    if (para.trim() === '') {
      lines.push('');
      continue;
    }
    const words = para.split(/\s+/);
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  return lines;
}

/**
 * Generates an ultra-crisp JPEG Blob of the official announcement document.
 */
export async function generateAnnouncementJpegBlob(
  announcement: AnnouncementData,
  officeProfile: OfficeProfileData,
  shareUrl: string
): Promise<Blob> {
  const width = 1200;
  const scale = 2; // 2x Retina scale for ultra-sharp fonts and graphics

  // Fallback defaults matching office profile
  const address = officeProfile?.address || 'Jl. Siswamiharja, No.4. Kec. Purwodadi, Kab. Grobogan. Jawa Tengah';
  const email = officeProfile?.email || 'korwilpurwodadi1234@gmail.com';
  const phone = officeProfile?.phone || '082170774341';
  const korwilName = officeProfile?.korwilName || 'Supriyanto, S.Pd., M.Pd.';
  const korwilNip = officeProfile?.korwilNip || '19720415 199603 1 003';
  const urgency = announcement.urgency || 'Biasa';
  const target = announcement.target || 'Semua Satuan';
  const date = announcement.date || '10 September 2026';

  // Measure fonts & dynamic height using a temporary canvas
  const measureCanvas = document.createElement('canvas');
  const mCtx = measureCanvas.getContext('2d');
  if (!mCtx) throw new Error('Canvas 2D context unavailable');

  // Measure Title
  mCtx.font = '800 32px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif';
  const titleLines = wrapCanvasText(mCtx, announcement.title || 'Pengumuman Resmi', 1010);
  const titleHeight = Math.max(48, titleLines.length * 46);

  // Measure Summary Text
  mCtx.font = '400 20px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif';
  const summaryLines = wrapCanvasText(mCtx, announcement.summary || '', 950);
  const summaryBoxHeight = Math.max(140, 56 + summaryLines.length * 34);

  // Calculate dynamic total height
  const innerCardTop = 40;
  const kopHeight = 350;
  const badgesHeight = 60;
  const perihalLabelHeight = 35;
  const lampiranBoxHeight = 64;
  const footerHeight = 220;
  const cardPaddingBottom = 45;

  const totalHeight = 
    innerCardTop + 
    kopHeight + 
    badgesHeight + 
    perihalLabelHeight + 
    titleHeight + 
    25 + 
    summaryBoxHeight + 
    20 + 
    lampiranBoxHeight + 
    30 + 
    footerHeight + 
    cardPaddingBottom + 
    40;

  // Create actual high-resolution canvas
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = totalHeight * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Scale context for retina sharpness
  ctx.scale(scale, scale);
  ctx.textBaseline = 'top';

  // 1. Soft Slate Outer Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, totalHeight);

  // 2. White Paper Card Container with rounded corners & border
  const cardX = 45;
  const cardY = innerCardTop;
  const cardWidth = 1110;
  const cardHeight = totalHeight - 80;
  drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 24, '#ffffff', '#cbd5e1', 2);

  // 3. Load and draw Kop Surat Logo
  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await loadImage('/logo_kop.png');
  } catch {
    try {
      logoImg = await loadImage('/logo.png');
    } catch {
      logoImg = null;
    }
  }

  if (logoImg) {
    // Preserve logo aspect ratio inside box 110x140
    const logoMaxW = 105;
    const logoMaxH = 135;
    const logoRatio = logoImg.naturalWidth / (logoImg.naturalHeight || 1);
    let drawW = logoMaxW;
    let drawH = drawW / logoRatio;
    if (drawH > logoMaxH) {
      drawH = logoMaxH;
      drawW = drawH * logoRatio;
    }
    const logoX = 95 + (logoMaxW - drawW) / 2;
    const logoY = 70 + (logoMaxH - drawH) / 2;
    ctx.drawImage(logoImg, logoX, logoY, drawW, drawH);
  }

  // 4. Official Kop Surat Typography (Centered)
  const centerX = 600;

  // Line 1: Pemerintah Kabupaten Grobogan
  ctx.textAlign = 'center';
  ctx.font = 'bold 15px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('PEMERINTAH KABUPATEN GROBOGAN', centerX, 76);

  // Line 2: DINAS PENDIDIKAN
  ctx.font = '800 23px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('DINAS PENDIDIKAN', centerX, 102);

  // Line 3: KOORDINATOR WILAYAH KECAMATAN
  ctx.font = '900 26px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
  ctx.fillStyle = '#0a192f';
  ctx.fillText('KOORDINATOR WILAYAH KECAMATAN', centerX, 138);

  // Line 4: BIDANG PENDIDIKAN
  ctx.font = '900 26px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('BIDANG PENDIDIKAN', centerX, 172);

  // Line 5: KECAMATAN PURWODADI
  ctx.font = '900 28px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('KECAMATAN PURWODADI', centerX, 208);

  // Line 6 & 7: Alamat, Pos-el, Kontak
  ctx.font = '400 13.5px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(address, centerX, 248);
  ctx.fillText(`Pos-el: ${email}   •   Kontak: ${phone}`, centerX, 271);

  // 5. Official Double Dividing Line
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(95, 305);
  ctx.lineTo(1105, 305);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(95, 313);
  ctx.lineTo(1105, 313);
  ctx.stroke();

  // 6. Badges & Meta Row
  const metaY = 338;

  // Badge 1: Urgency
  let badgeBg = '#eff6ff';
  let badgeBorder = '#bfdbfe';
  let badgeText = '#1d4ed8';
  if (urgency.toLowerCase().includes('mendesak')) {
    badgeBg = '#fff1f2';
    badgeBorder = '#fecdd3';
    badgeText = '#be123c';
  } else if (urgency.toLowerCase().includes('penting')) {
    badgeBg = '#fffbeb';
    badgeBorder = '#fde68a';
    badgeText = '#b45309';
  }

  ctx.font = 'bold 13.5px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
  const urgencyLabel = `🏷️ Tingkat: ${urgency}`;
  const urgencyWidth = ctx.measureText(urgencyLabel).width + 32;
  drawRoundedRect(ctx, 95, metaY, urgencyWidth, 34, 17, badgeBg, badgeBorder, 1.5);
  ctx.textAlign = 'center';
  ctx.fillStyle = badgeText;
  ctx.fillText(urgencyLabel, 95 + urgencyWidth / 2, metaY + 9);

  // Badge 2: Target
  const targetLabel = `🏢 Sasaran: ${target}`;
  const targetWidth = ctx.measureText(targetLabel).width + 32;
  const targetX = 95 + urgencyWidth + 12;
  drawRoundedRect(ctx, targetX, metaY, targetWidth, 34, 17, '#eef2ff', '#c7d2fe', 1.5);
  ctx.fillStyle = '#4338ca';
  ctx.fillText(targetLabel, targetX + targetWidth / 2, metaY + 9);

  // Meta Date (Right Aligned)
  ctx.textAlign = 'right';
  ctx.font = '500 14px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
  ctx.fillStyle = '#64748b';
  const dateStr = `📅 Diterbitkan: ${date}`;
  ctx.fillText(dateStr, 1105, metaY + 9);

  // 7. Perihal Label
  const perihalY = metaY + 54;
  ctx.textAlign = 'left';
  ctx.font = '800 12.5px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
  ctx.fillStyle = '#2563eb';
  ctx.fillText('PERIHAL / JUDUL SURAT EDARAN', 95, perihalY);

  // 8. Judul Surat Edaran
  const titleY = perihalY + 24;
  ctx.font = '800 30px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
  ctx.fillStyle = '#090d16';
  for (let i = 0; i < titleLines.length; i++) {
    ctx.fillText(titleLines[i], 95, titleY + i * 44);
  }

  // 9. Summary Container Box
  const summaryBoxY = titleY + titleHeight + 15;
  drawRoundedRect(ctx, 95, summaryBoxY, 1010, summaryBoxHeight, 20, '#f8fafc', '#e2e8f0', 1.5);

  ctx.font = '400 19px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
  ctx.fillStyle = '#1e293b';
  for (let i = 0; i < summaryLines.length; i++) {
    ctx.fillText(summaryLines[i], 125, summaryBoxY + 28 + i * 34);
  }

  // 10. Notice / Attachment Callout Box
  const lampiranY = summaryBoxY + summaryBoxHeight + 18;
  drawRoundedRect(ctx, 95, lampiranY, 1010, 60, 16, '#f8fafc', '#e2e8f0', 1.5);

  // Info Icon Circle
  ctx.beginPath();
  ctx.arc(126, lampiranY + 30, 11, 0, Math.PI * 2);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = 'bold 12.5px "Segoe UI", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('i', 126, lampiranY + 22);

  // Info Text
  ctx.textAlign = 'left';
  ctx.font = '400 14.5px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
  ctx.fillStyle = '#64748b';
  let lampiranMsg = 'Surat edaran ini merupakan pemberitahuan langsung tanpa lampiran dokumen fisik terpisah.';
  if (announcement.fileUrl && announcement.fileUrl !== '#') {
    lampiranMsg = `Dokumen Lampiran: ${announcement.fileName || 'Berkas Lampiran Resmi'} (${announcement.fileSize || 'Tersedia'})`;
  }
  ctx.fillText(lampiranMsg, 148, lampiranY + 21);

  // 11. Dividing Footer Separator Line
  const sepY = lampiranY + 60 + 26;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(95, sepY);
  ctx.lineTo(1105, sepY);
  ctx.stroke();

  // 12. Footer & Signature Block
  const footerY = sepY + 28;

  // Left Column: Catatan Informasi & Link Verifikasi Dokumen
  ctx.textAlign = 'left';
  ctx.font = 'bold 14.5px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('Catatan Informasi:', 95, footerY);

  ctx.font = '400 13px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Pengumuman resmi ini diterbitkan melalui Portal Resmi Korwilcam', 95, footerY + 24);
  ctx.fillText('Purwodadi untuk disosialisasikan kepada seluruh Kepala Sekolah,', 95, footerY + 44);
  ctx.fillText('Guru, dan Tenaga Kependidikan terkait.', 95, footerY + 64);

  // Link Verifikasi
  ctx.font = '500 12px "Consolas", monospace';
  ctx.fillStyle = '#2563eb';
  ctx.fillText(`🔗 Tautan Dokumen Resmi: ${shareUrl}`, 95, footerY + 96);

  // Right Column: Tanggal & Tanda Tangan Pimpinan Korwil
  ctx.textAlign = 'right';
  ctx.font = '400 14.5px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(`Purwodadi, ${date}`, 1105, footerY);

  ctx.font = 'bold 15px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('Koordinator Wilayah Kecamatan', 1105, footerY + 24);
  ctx.fillText('Bidang Pendidikan Purwodadi', 1105, footerY + 46);

  // Nama Pejabat & Garis Bawah
  const signY = footerY + 120;
  ctx.font = 'bold 17px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
  ctx.fillStyle = '#020617';
  ctx.fillText(korwilName, 1105, signY);

  const nameWidth = ctx.measureText(korwilName).width;
  ctx.beginPath();
  ctx.moveTo(1105 - nameWidth, signY + 22);
  ctx.lineTo(1105, signY + 22);
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // NIP Pejabat
  ctx.font = '500 13.5px "Consolas", monospace';
  ctx.fillStyle = '#475569';
  ctx.fillText(`NIP. ${korwilNip}`, 1105, signY + 28);

  // Export as high-quality JPEG Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas toBlob JPEG conversion failed'));
        }
      },
      'image/jpeg',
      0.95
    );
  });
}

/**
 * Downloads the announcement as an official high-resolution JPEG image file.
 */
export async function downloadAnnouncementJpeg(
  announcement: AnnouncementData,
  officeProfile: OfficeProfileData,
  shareUrl: string
): Promise<void> {
  const blob = await generateAnnouncementJpegBlob(announcement, officeProfile, shareUrl);
  const safeId = (announcement.id || 'surat').replace(/[^a-zA-Z0-9_-]/g, '');
  const filename = `Pengumuman-Korwilcam-${safeId}.jpg`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Shares the announcement to WhatsApp:
 * 1. Converts the announcement to a high-resolution JPEG image.
 * 2. On supported devices (Android / iOS / supported desktop), shares the JPEG file AND caption text via Web Share API directly to WhatsApp.
 * 3. On desktop browsers without Web Share file support: downloads the JPEG file, copies caption to clipboard, and opens WhatsApp Web pre-filled.
 */
export async function shareAnnouncementWhatsApp(
  announcement: AnnouncementData,
  officeProfile: OfficeProfileData,
  shareUrl: string,
  showToast?: (message: string, type?: 'info' | 'success' | 'error') => void
): Promise<void> {
  const captionText =
    `*PENGUMUMAN RESMI KORWILCAM PURWODADI*\n\n` +
    `*${announcement.title}*\n\n` +
    `📋 *Sasaran:* ${announcement.target}\n` +
    `⚡ *Tingkat:* ${announcement.urgency}\n` +
    `📅 *Diterbitkan:* ${announcement.date}\n\n` +
    `*Ringkasan Surat Edaran:*\n${announcement.summary}\n\n` +
    `🔗 *Buka & Unduh Lembar Dokumen Resmi:*\n${shareUrl}`;

  const safeId = (announcement.id || 'surat').replace(/[^a-zA-Z0-9_-]/g, '');
  const filename = `Pengumuman-Korwilcam-${safeId}.jpg`;

  showToast?.('Sedang mengonversi pengumuman menjadi gambar (JPEG)...', 'info');
  const blob = await generateAnnouncementJpegBlob(announcement, officeProfile, shareUrl);
  const file = new File([blob], filename, { type: 'image/jpeg' });

  // Check if browser supports Web Share API with files (Android & iOS Chrome/Safari)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: announcement.title,
        text: captionText,
      });
      showToast?.('Pengumuman beserta gambar JPEG berhasil dibagikan ke WhatsApp!', 'success');
      return;
    } catch (shareErr: any) {
      if (shareErr.name === 'AbortError') {
        // User cancelled share dialog
        return;
      }
      console.warn('Web Share failed, falling back to desktop flow:', shareErr);
    }
  }

  // Fallback for Desktop (WhatsApp Web / Desktop):
  // 1. Download JPEG image directly
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);

  // 2. Copy caption text to clipboard
  try {
    await navigator.clipboard.writeText(captionText);
  } catch {}

  // 3. Open WhatsApp Web with caption text
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(captionText)}`;
  window.open(waUrl, '_blank');

  showToast?.(
    'Gambar pengumuman (JPEG) telah otomatis diunduh dan teks disiapkan! Silakan lampirkan gambar tersebut di WhatsApp.',
    'success'
  );
}
