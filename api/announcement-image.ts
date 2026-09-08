import { createClient } from '@supabase/supabase-js';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xatvlaxseiyuvfcntmml.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vwFyPFm1dkVCbKOisqkdDQ_8CarPKuK';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text: string, maxCharsPerLine = 40): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length > maxCharsPerLine) {
      if (current.trim()) lines.push(current.trim());
      current = w;
    } else {
      current = (current + ' ' + w).trim();
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

export default async function handler(req: any, res: any) {
  try {
    const rawParam = (req.query?.id || req.query?.slug || '').toString().trim();
    let cleanParam = rawParam.replace(/^pengumuman\//, '').replace(/^\/pengumuman\//, '');

    let announcement: any = null;

    if (cleanParam) {
      // 1. Try match by ID
      const { data: byId } = await supabase
        .from('announcements')
        .select('*')
        .or(`id.eq.${cleanParam},id.eq.ann-${cleanParam}`)
        .limit(1)
        .maybeSingle();

      if (byId) {
        announcement = byId;
      } else {
        // 2. Try match by title like or slug match
        const { data: list } = await supabase
          .from('announcements')
          .select('*')
          .limit(20);

        if (list && list.length > 0) {
          const found = list.find((a: any) => {
            const annSlug = a.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            return annSlug === cleanParam || a.id === cleanParam || cleanParam.includes(annSlug);
          });
          if (found) announcement = found;
        }
      }
    }

    // Default Fallback if no specific announcement found
    if (!announcement) {
      announcement = {
        id: 'ann-03',
        title: 'Verifikasi Berkas Bantuan Operasional Pendidikan (BOP) PAUD & Kesetaraan Tahap II',
        date: '18 Agustus 2026',
        urgency: 'Biasa',
        target: 'TK/PAUD',
        summary: 'Pengumpulan berkas SPJ BOP PAUD Tahap I dan pengajuan pencairan Tahap II paling lambat diserahkan ke loket pelayanan Korwilcam tanggal 10 September 2026.'
      };
    }

    // Fetch office profile for signatory and official address
    let profile: any = null;
    try {
      const { data: profs } = await supabase.from('office_profile').select('*').limit(1);
      if (profs && profs.length > 0) profile = profs[0];
    } catch {}

    // Load Logo Base64
    let logoBase64 = '';
    try {
      const primaryLogoPath = path.join(process.cwd(), 'public', 'logo_kop.png');
      if (fs.existsSync(primaryLogoPath)) {
        logoBase64 = fs.readFileSync(primaryLogoPath).toString('base64');
      } else {
        const fallbackLogoPath = path.join(process.cwd(), 'public', 'logo.png');
        if (fs.existsSync(fallbackLogoPath)) {
          logoBase64 = fs.readFileSync(fallbackLogoPath).toString('base64');
        }
      }
    } catch (e) {
      console.warn('Logo file read warning:', e);
    }

    const titleLines = wrapText(announcement.title, 38).map(escapeXml);
    const summaryLines = wrapText(announcement.summary, 54).map(escapeXml);
    const date = escapeXml(announcement.date || '18 Agustus 2026');
    const urgency = escapeXml(announcement.urgency || 'Biasa');
    const target = escapeXml(announcement.target || 'Semua Satuan');
    const korwilName = escapeXml(profile?.korwil_name || 'Narto, S.Pd., M.Pd');
    const korwilNip = escapeXml(profile?.korwil_nip || '196703121992011001');
    const address = escapeXml(profile?.address || 'Jl. Jenderal Sudirman No. 42, Purwodadi, Kabupaten Grobogan, Jawa Tengah 58111');
    const email = escapeXml(profile?.email || 'korwilcampurwodadi.pendidikan@gmail.com');
    const phone = escapeXml(profile?.phone || '085161717170');

    // Determine badge urgency colors
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

    const titleY = 525;
    const titleBlockHeight = titleLines.length * 48;
    const summaryY = 530 + titleBlockHeight;
    const summaryHeight = Math.max(140, 60 + summaryLines.length * 36);
    const noteY = summaryY + summaryHeight + 25;

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1420" viewBox="0 0 1200 1420">
  <defs>
    <style>
      .bold { font-weight: 800; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
      .semi { font-weight: 600; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
      .regular { font-weight: 400; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
    </style>
  </defs>

  <!-- Background Paper Container -->
  <rect width="1200" height="1420" fill="#f8fafc"/>
  <rect x="50" y="40" width="1100" height="1340" rx="24" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" />

  <!-- KOP SURAT RESMI -->
  ${logoBase64 ? `<image href="data:image/png;base64,${logoBase64}" x="95" y="75" width="120" height="150" />` : ''}

  <!-- Teks Identitas Lembaga (Center) -->
  <text x="650" y="110" class="bold" font-size="18" fill="#334155" text-anchor="middle" letter-spacing="2">PEMERINTAH KABUPATEN GROBOGAN</text>
  <text x="650" y="142" class="bold" font-size="24" fill="#0f172a" text-anchor="middle" letter-spacing="1">DINAS PENDIDIKAN</text>
  <text x="650" y="180" class="bold" font-size="28" fill="#0f172a" text-anchor="middle">KOORDINATOR WILAYAH KECAMATAN</text>
  <text x="650" y="218" class="bold" font-size="26" fill="#1e3a8a" text-anchor="middle">BIDANG PENDIDIKAN</text>
  <text x="650" y="256" class="bold" font-size="30" fill="#1e3a8a" text-anchor="middle">KECAMATAN PURWODADI</text>
  <text x="650" y="292" class="regular" font-size="15" fill="#475569" text-anchor="middle">${address}</text>
  <text x="650" y="318" class="regular" font-size="15" fill="#475569" text-anchor="middle">Pos-el: ${email} &#8226; Kontak: ${phone}</text>

  <!-- Garis Pemisah Ganda Kop Surat -->
  <line x1="95" y1="345" x2="1105" y2="345" stroke="#0f172a" stroke-width="4"/>
  <line x1="95" y1="353" x2="1105" y2="353" stroke="#0f172a" stroke-width="1.5"/>

  <!-- Baris Badges / Meta Info -->
  <g transform="translate(95, 385)">
    <!-- Badge Urgensi -->
    <rect x="0" y="0" width="160" height="38" rx="19" fill="${badgeBg}" stroke="${badgeBorder}" stroke-width="1.5" />
    <text x="80" y="24" class="bold" font-size="15" fill="${badgeText}" text-anchor="middle">Tingkat: ${urgency}</text>

    <!-- Badge Sasaran -->
    <rect x="180" y="0" width="190" height="38" rx="19" fill="#eef2ff" stroke="#c7d2fe" stroke-width="1.5" />
    <text x="275" y="24" class="bold" font-size="15" fill="#4338ca" text-anchor="middle">Sasaran: ${target}</text>

    <!-- Tanggal Terbit -->
    <text x="1010" y="24" class="semi" font-size="16" fill="#64748b" text-anchor="end">Diterbitkan: <tspan class="bold" fill="#0f172a">${date}</tspan></text>
  </g>

  <!-- Label Perihal -->
  <text x="95" y="475" class="bold" font-size="15" fill="#2563eb" letter-spacing="1">PERIHAL / JUDUL SURAT EDARAN</text>

  <!-- Judul Pengumuman -->
  ${titleLines.map((line, idx) => `
    <text x="95" y="${titleY + idx * 48}" class="bold" font-size="34" fill="#090d16">${line}</text>
  `).join('')}

  <!-- Kotak Isi Ringkasan Surat -->
  <g transform="translate(95, ${summaryY})">
    <rect x="0" y="0" width="1010" height="${summaryHeight}" rx="20" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5" />
    ${summaryLines.map((line, idx) => `
      <text x="35" y="${48 + idx * 36}" class="regular" font-size="22" fill="#1e293b">${line}</text>
    `).join('')}
  </g>

  <!-- Kotak Catatan / Lampiran -->
  <g transform="translate(95, ${noteY})">
    <rect x="0" y="0" width="1010" height="70" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5" />
    <circle cx="40" cy="35" r="13" fill="none" stroke="#94a3b8" stroke-width="2"/>
    <text x="40" y="40" class="bold" font-size="15" fill="#94a3b8" text-anchor="middle">i</text>
    <text x="70" y="41" class="regular" font-size="17" fill="#64748b">Surat edaran ini merupakan pemberitahuan langsung tanpa lampiran dokumen fisik terpisah.</text>
  </g>

  <!-- Garis Bawah Penutup -->
  <line x1="95" y1="1080" x2="1105" y2="1080" stroke="#e2e8f0" stroke-width="1.5"/>

  <!-- Kiri Bawah: Catatan Informasi -->
  <text x="95" y="1130" class="bold" font-size="16" fill="#0f172a">Catatan Informasi:</text>
  <text x="95" y="1160" class="regular" font-size="15" fill="#64748b">Pengumuman resmi ini diterbitkan melalui Portal Resmi Korwilcam</text>
  <text x="95" y="1185" class="regular" font-size="15" fill="#64748b">Purwodadi untuk disosialisasikan kepada seluruh Kepala Sekolah,</text>
  <text x="95" y="1210" class="regular" font-size="15" fill="#64748b">Guru, dan Tenaga Kependidikan terkait.</text>

  <!-- Kanan Bawah: Kolom Tanda Tangan Resmi -->
  <text x="1105" y="1130" class="regular" font-size="16" fill="#1e293b" text-anchor="end">Purwodadi, ${date}</text>
  <text x="1105" y="1158" class="bold" font-size="17" fill="#0f172a" text-anchor="end">Koordinator Wilayah Kecamatan</text>
  <text x="1105" y="1186" class="bold" font-size="17" fill="#0f172a" text-anchor="end">Bidang Pendidikan Purwodadi</text>

  <!-- Ruang Tanda Tangan & Nama Pimpinan -->
  <text x="1105" y="1290" class="bold" font-size="20" fill="#020617" text-anchor="end" text-decoration="underline">${korwilName}</text>
  <text x="1105" y="1318" class="regular" font-size="15" fill="#475569" text-anchor="end">NIP. ${korwilNip}</text>
</svg>
`;

    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: 1200
      }
    });
    const pngBuffer = resvg.render().asPng();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', pngBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.statusCode = 200;
    return res.end(pngBuffer);
  } catch (err: any) {
    console.error('api/announcement-image error:', err);
    res.statusCode = 500;
    return res.end('Internal server error generating announcement image');
  }
}
