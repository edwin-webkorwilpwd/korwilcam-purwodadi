/**
 * Data default dan helper link Google Maps / titik koordinat
 * untuk satuan pendidikan Kecamatan Purwodadi, Kabupaten Grobogan.
 */

export const DEFAULT_SCHOOL_COORDINATES: Record<string, string> = {
  'sch-01': '-7.086389, 110.916111', // SD Negeri 1 Purwodadi (Jl. MT Haryono)
  'sch-02': '-7.088194, 110.919722', // SD Negeri 3 Purwodadi (Jl. Ahmad Yani)
  'sch-03': '-7.091389, 110.908056', // SD IT Al-Firdaus (Jl. Diponegoro, Kuripan)
  'sch-04': '-7.102500, 110.923889', // SD Negeri 2 Danyang (Jl. Danyang-Kuwu)
  'sch-05': '-7.084722, 110.913889', // TK Negeri Pembina Purwodadi (Jl. Bhayangkara)
  'sch-06': '-7.081944, 110.925278', // TK Pertiwi 01 Purwodadi (Jl. Gatot Subroto)
  'sch-07': '-7.089444, 110.914722', // TK ABA 1 Purwodadi (Jl. KH Ahmad Dahlan)
  'sch-08': '-7.078611, 110.927500', // PAUD Terpadu Mawar Ceria (Griya Praja Mukti)
  'sch-09': '-7.098333, 110.931944', // KB Tunas Bangsa Purwodadi (Jl. Cempaka Putih, Kandangan)
  'sch-1788412534285': '-7.096944, 110.934167' // SDN 1 Kandangan
};

export const DEFAULT_SCHOOL_MAPS_URLS: Record<string, string> = {
  'sch-01': 'https://www.google.com/maps?q=-7.086389,110.916111', // SD Negeri 1 Purwodadi
  'sch-02': 'https://www.google.com/maps?q=-7.088194,110.919722', // SD Negeri 3 Purwodadi
  'sch-03': 'https://www.google.com/maps?q=-7.091389,110.908056', // SD IT Al-Firdaus
  'sch-04': 'https://www.google.com/maps?q=-7.102500,110.923889', // SD Negeri 2 Danyang
  'sch-05': 'https://www.google.com/maps?q=-7.084722,110.913889', // TK Negeri Pembina Purwodadi
  'sch-06': 'https://www.google.com/maps?q=-7.081944,110.925278', // TK Pertiwi 01 Purwodadi
  'sch-07': 'https://www.google.com/maps?q=-7.089444,110.914722', // TK ABA 1 Purwodadi
  'sch-08': 'https://www.google.com/maps?q=-7.078611,110.927500', // PAUD Terpadu Mawar Ceria
  'sch-09': 'https://www.google.com/maps?q=-7.098333,110.931944', // KB Tunas Bangsa Purwodadi
  'sch-1788412534285': 'https://www.google.com/maps?q=-7.096944,110.934167' // SDN 1 Kandangan
};

// Titik default per Desa / Kelurahan di Kecamatan Purwodadi jika link maps belum diisi manual
export const DESA_DEFAULT_COORDINATES: Record<string, string> = {
  'Purwodadi': '-7.086389, 110.916111',
  'Kuripan': '-7.091389, 110.908056',
  'Danyang': '-7.102500, 110.923889',
  'Kalongan': '-7.081944, 110.925278',
  'Kandangan': '-7.098333, 110.931944',
  'Nglejok': '-7.083333, 110.920000',
  'Cingkrong': '-7.065000, 110.930000',
  'Karanganyar': '-7.110000, 110.915000',
  'Kedungrejo': '-7.075000, 110.895000',
  'Ngembak': '-7.082000, 110.940000',
  'Pulorejo': '-7.058000, 110.920000',
  'Warukaranganyar': '-7.095000, 110.945000',
  'Genuksuran': '-7.125000, 110.930000'
};

/**
 * Mengubah input (koordinat lat,lng atau teks atau link) menjadi URL Google Maps yang valid.
 * Jika input sudah berupa tautan (http/https), dikembalikan langsung.
 */
export const normalizeToGoogleMapsUrl = (input: string | null | undefined): string => {
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Jika sudah berupa link web Google Maps / maps.app.goo.gl dll
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Jika berupa koordinat latitude, longitude (misal: -7.086389, 110.916111)
  if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(trimmed)) {
    const cleanCoords = trimmed.replace(/\s+/g, '');
    return `https://www.google.com/maps?q=${cleanCoords}`;
  }

  // Jika teks biasa, encode sebagai query Maps
  return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}`;
};

/**
 * Mengekstrak representasi koordinat teks jika diperlukan
 */
export const extractCoordinatesFromUrl = (urlOrCoord: string | null | undefined): string => {
  if (!urlOrCoord) return '';
  const trimmed = urlOrCoord.trim();
  if (!trimmed) return '';

  if (!trimmed.startsWith('http')) {
    return trimmed;
  }

  const qMatch = trimmed.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) {
    return `${qMatch[1]}, ${qMatch[2]}`;
  }

  const atMatch = trimmed.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    return `${atMatch[1]}, ${atMatch[2]}`;
  }

  return trimmed;
};

/**
 * Mengambil link Google Maps sekolah (dengan fallback ke default sekolah / default desa / kantor Korwilcam)
 */
export const getGoogleMapsUrl = (school: {
  id?: string;
  name?: string;
  desa?: string;
  address?: string;
  coordinates?: string;
  titikKoordinat?: string;
} | null | undefined): string => {
  if (!school) return 'https://www.google.com/maps?q=Purwodadi+Grobogan';

  // 1. Cek dari field database yang tersimpan
  const saved = (school.titikKoordinat || school.coordinates || '').trim();
  if (saved) {
    return normalizeToGoogleMapsUrl(saved);
  }

  // 2. Cek dari ID default sekolah
  if (school.id && DEFAULT_SCHOOL_MAPS_URLS[school.id]) {
    return DEFAULT_SCHOOL_MAPS_URLS[school.id];
  }

  // 3. Cek dari nama sekolah jika cocok
  if (school.name) {
    const lower = school.name.toLowerCase();
    if (lower.includes('tunas bangsa')) return DEFAULT_SCHOOL_MAPS_URLS['sch-09'];
    if (lower.includes('kandangan')) return DEFAULT_SCHOOL_MAPS_URLS['sch-1788412534285'];
    if (lower.includes('mawar ceria')) return DEFAULT_SCHOOL_MAPS_URLS['sch-08'];
    if (lower.includes('aisyiyah') || lower.includes('aba')) return DEFAULT_SCHOOL_MAPS_URLS['sch-07'];
    if (lower.includes('pertiwi')) return DEFAULT_SCHOOL_MAPS_URLS['sch-06'];
    if (lower.includes('pembina')) return DEFAULT_SCHOOL_MAPS_URLS['sch-05'];
    if (lower.includes('danyang')) return DEFAULT_SCHOOL_MAPS_URLS['sch-04'];
    if (lower.includes('firdaus')) return DEFAULT_SCHOOL_MAPS_URLS['sch-03'];
    if (lower.includes('sd negeri 3') || lower.includes('sdn 3')) return DEFAULT_SCHOOL_MAPS_URLS['sch-02'];
    if (lower.includes('sd negeri 1') || lower.includes('sdn 1')) return DEFAULT_SCHOOL_MAPS_URLS['sch-01'];
  }

  // 4. Cek dari desa
  if (school.desa && DESA_DEFAULT_COORDINATES[school.desa]) {
    const cleanDesa = DESA_DEFAULT_COORDINATES[school.desa].replace(/\s+/g, '');
    return `https://www.google.com/maps?q=${cleanDesa}`;
  }

  // Default titik pusat Kota Purwodadi
  const query = `${school.name || ''} ${school.desa || ''} Purwodadi Grobogan`.trim();
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}`;
};

/**
 * Mengambil titik koordinat sekolah (fallback kompatibilitas lama)
 */
export const getSchoolCoordinates = (school: {
  id?: string;
  name?: string;
  desa?: string;
  coordinates?: string;
  titikKoordinat?: string;
} | null | undefined): string => {
  const url = getGoogleMapsUrl(school);
  return extractCoordinatesFromUrl(url) || url;
};

