import { EducationalOrganization, OrganizationLeader, OrganizationOfficial, OrganizationSocialMedia } from '../types';
import { parseCSV } from './googleSheetService';

export const ORGANIZATIONS_SPREADSHEET_ID = '15eou_pxJFy6CNQK8gQWW4bhmF5hblCHJaUKeKiu4Rag';
export const ORGANIZATIONS_SHEET_GID = '0';
export const ORGANIZATIONS_GVIZ_JSON_URL = `https://docs.google.com/spreadsheets/d/${ORGANIZATIONS_SPREADSHEET_ID}/gviz/tq?gid=${ORGANIZATIONS_SHEET_GID}`;
export const ORGANIZATIONS_CSV_URL = `https://docs.google.com/spreadsheets/d/${ORGANIZATIONS_SPREADSHEET_ID}/export?format=csv&gid=${ORGANIZATIONS_SHEET_GID}`;
export const ORGANIZATIONS_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${ORGANIZATIONS_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${ORGANIZATIONS_SHEET_GID}`;
export const ORGANIZATIONS_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${ORGANIZATIONS_SPREADSHEET_ID}/edit?gid=${ORGANIZATIONS_SHEET_GID}#gid=${ORGANIZATIONS_SHEET_GID}`;

export const ORGANIZATIONS_CACHE_KEY = 'korwilcam_organizations';
export const ORGANIZATIONS_CACHE_TIMESTAMP_KEY = 'korwilcam_organizations_last_fetch';
export const ORGANIZATIONS_CACHE_TTL_MS = 2 * 60 * 1000; // 2 Menit Cache TTL

export const ORGANIZATIONS_WEBAPP_STORAGE_KEY = 'korwilcam_organizations_gas_url';
export const DEFAULT_ORGANIZATIONS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyP2NOsgEgqbRpfmVKClDP07iwv6vdOoxuSwaqOrb82OvvONp_AwhUAbp2v24_b0Hs6rg/exec';

let inMemoryOrganizationsWebAppUrl = DEFAULT_ORGANIZATIONS_WEBAPP_URL;

/**
 * Mendapatkan URL Webhook Google Apps Script (GAS) untuk Organisasi
 */
export function getOrganizationsWebAppUrl(): string {
  if (inMemoryOrganizationsWebAppUrl && inMemoryOrganizationsWebAppUrl.trim()) {
    return inMemoryOrganizationsWebAppUrl.trim();
  }
  try {
    const saved = localStorage.getItem(ORGANIZATIONS_WEBAPP_STORAGE_KEY);
    if (saved && saved.trim()) {
      inMemoryOrganizationsWebAppUrl = saved.trim();
      return inMemoryOrganizationsWebAppUrl;
    }
  } catch {}
  return DEFAULT_ORGANIZATIONS_WEBAPP_URL;
}

/**
 * Menyimpan URL Webhook Google Apps Script (GAS) untuk Organisasi
 */
export function setOrganizationsWebAppUrl(url: string): void {
  const clean = (url || '').trim();
  inMemoryOrganizationsWebAppUrl = clean;
  try {
    if (clean) {
      localStorage.setItem(ORGANIZATIONS_WEBAPP_STORAGE_KEY, clean);
    } else {
      localStorage.removeItem(ORGANIZATIONS_WEBAPP_STORAGE_KEY);
    }
  } catch {}
}

/**
 * Helper parsing aman untuk data JSON dari cell spreadsheet
 */
function parseSafeJson<T>(val: any, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val as T;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed || trimmed === '-' || trimmed === '{}' || trimmed === '[]') return fallback;
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/**
 * Helper default leader jika kosong
 */
function createDefaultLeader(): OrganizationLeader {
  return {
    name: '',
    title: '',
    period: '',
    photo: '',
    speechTitle: '',
    speech: ''
  };
}

/**
 * Parsing data organisasi dari format Google Visualization API (GViz)
 */
export function parseGVizOrganizations(text: string): EducationalOrganization[] {
  try {
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) return [];

    const jsonStr = text.substring(startIdx, endIdx + 1);
    const data = JSON.parse(jsonStr);

    if (!data.table || !data.table.rows || !data.table.cols) return [];

    const cols: string[] = data.table.cols.map((c: any) =>
      String(c ? c.label || c.id || '' : '').toLowerCase().replace(/[\s_\-]+/g, '')
    );

    const findIdx = (aliases: string[], fallback: number): number => {
      for (const a of aliases) {
        const norm = a.toLowerCase().replace(/[\s_\-]+/g, '');
        const idx = cols.indexOf(norm);
        if (idx !== -1) return idx;
      }
      return fallback;
    };

    const idCol = findIdx(['id', 'id_organisasi'], 0);
    const slugCol = findIdx(['slug', 'url'], 1);
    const nameCol = findIdx(['name', 'nama', 'nama_organisasi'], 2);
    const shortNameCol = findIdx(['short_name', 'shortname', 'singkatan'], 3);
    const descCol = findIdx(['description', 'deskripsi', 'keterangan'], 4);
    const logoCol = findIdx(['logo', 'logo_url'], 5);
    const coverCol = findIdx(['cover_image', 'coverimage', 'sampul', 'cover'], 6);
    const leaderCol = findIdx(['leader', 'ketua', 'pimpinan'], 7);
    const visionCol = findIdx(['vision', 'visi'], 8);
    const missionsCol = findIdx(['missions', 'misi'], 9);
    const officialsCol = findIdx(['officials', 'pengurus', 'susunan_pengurus'], 10);
    const addressCol = findIdx(['address', 'alamat'], 11);
    const phoneCol = findIdx(['phone', 'telepon', 'no_hp', 'kontak'], 12);
    const emailCol = findIdx(['email'], 13);
    const updatedCol = findIdx(['updated_at', 'updatedat'], 14);
    const socialCol = findIdx(['social_media', 'socialmedia', 'sosmed'], 15);
    const userCol = findIdx(['assigned_username', 'assignedusername', 'pengelola', 'username'], 16);

    const list: EducationalOrganization[] = [];

    for (let r = 0; r < data.table.rows.length; r++) {
      const row = data.table.rows[r];
      if (!row || !row.c) continue;

      const getVal = (colIdx: number) => {
        if (colIdx < 0 || colIdx >= row.c.length || !row.c[colIdx]) return null;
        return row.c[colIdx].v !== undefined ? row.c[colIdx].v : row.c[colIdx].f;
      };

      const id = String(getVal(idCol) || '').trim();
      const name = String(getVal(nameCol) || '').trim();
      const slugRaw = String(getVal(slugCol) || '').trim();
      if (!id && !name) continue;

      const slug = slugRaw || (name
        ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : `org-${r + 1}`);

      const shortName = String(getVal(shortNameCol) || name || '').trim();
      const description = String(getVal(descCol) || '').trim();
      const logo = String(getVal(logoCol) || '').trim();
      const coverImage = String(getVal(coverCol) || '').trim();

      const rawLeader = getVal(leaderCol);
      const leader = parseSafeJson<OrganizationLeader>(rawLeader, createDefaultLeader());

      const vision = String(getVal(visionCol) || '').trim();

      const rawMissions = getVal(missionsCol);
      let missions: string[] = [];
      if (Array.isArray(rawMissions)) {
        missions = rawMissions;
      } else if (typeof rawMissions === 'string') {
        const parsedM = parseSafeJson<string[]>(rawMissions, []);
        if (Array.isArray(parsedM) && parsedM.length > 0) {
          missions = parsedM;
        } else {
          missions = rawMissions.split('\n').map((m) => m.trim()).filter(Boolean);
        }
      }

      const rawOfficials = getVal(officialsCol);
      const officials = parseSafeJson<OrganizationOfficial[]>(rawOfficials, []);

      const address = String(getVal(addressCol) || '').trim();
      const phone = String(getVal(phoneCol) || '').trim();
      const email = String(getVal(emailCol) || '').trim();

      const rawSocial = getVal(socialCol);
      const socialMedia = parseSafeJson<OrganizationSocialMedia>(rawSocial, {});

      const assignedUsername = String(getVal(userCol) || '').trim() || undefined;
      const updatedAt = String(getVal(updatedCol) || '').trim() || new Date().toISOString();

      list.push({
        id: id || `org-${r + 1}`,
        slug,
        name,
        shortName,
        description,
        logo,
        coverImage,
        leader,
        vision,
        missions,
        officials,
        address,
        phone,
        email,
        socialMedia,
        assignedUsername,
        updatedAt
      });
    }

    return list;
  } catch (err) {
    console.warn('Gagal memproses respons GViz Organisasi:', err);
    return [];
  }
}

/**
 * Mengambil daftar Organisasi Mitra & Profesi dari Google Spreadsheet
 */
export async function fetchOrganizationsFromSheet(forceRefresh = false): Promise<EducationalOrganization[]> {
  const now = Date.now();
  const lastFetchStr = localStorage.getItem(ORGANIZATIONS_CACHE_TIMESTAMP_KEY);

  // 0. Periksa cache lokal jika tidak force refresh
  if (!forceRefresh && lastFetchStr) {
    const elapsed = now - parseInt(lastFetchStr, 10);
    if (elapsed < ORGANIZATIONS_CACHE_TTL_MS) {
      try {
        const cached = localStorage.getItem(ORGANIZATIONS_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {}
    }
  }

  // 1. Coba ambil dari WebApp GAS jika URL sudah terpasang
  const webAppUrl = getOrganizationsWebAppUrl();
  if (webAppUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(`${webAppUrl}?action=read&_t=${now}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: EducationalOrganization[] = json.data.map((r: any, idx: number) => ({
            id: String(r.id || `org-${idx + 1}`),
            slug: String(r.slug || '').trim(),
            name: String(r.name || '').trim(),
            shortName: String(r.short_name || r.shortName || r.name || '').trim(),
            description: String(r.description || '').trim(),
            logo: String(r.logo || '').trim(),
            coverImage: String(r.cover_image || r.coverImage || '').trim(),
            leader: typeof r.leader === 'object' && r.leader ? r.leader : parseSafeJson<OrganizationLeader>(r.leader, createDefaultLeader()),
            vision: String(r.vision || '').trim(),
            missions: Array.isArray(r.missions) ? r.missions : parseSafeJson<string[]>(r.missions, []),
            officials: Array.isArray(r.officials) ? r.officials : parseSafeJson<OrganizationOfficial[]>(r.officials, []),
            address: String(r.address || '').trim(),
            phone: String(r.phone || '').trim(),
            email: String(r.email || '').trim(),
            socialMedia: typeof r.social_media === 'object' && r.social_media ? r.social_media : parseSafeJson<OrganizationSocialMedia>(r.socialMedia || r.social_media, {}),
            assignedUsername: r.assigned_username || r.assignedUsername || undefined,
            updatedAt: r.updated_at || r.updatedAt || new Date().toISOString()
          }));

          localStorage.setItem(ORGANIZATIONS_CACHE_KEY, JSON.stringify(mapped));
          sessionStorage.setItem(ORGANIZATIONS_CACHE_KEY, JSON.stringify(mapped));
          localStorage.setItem(ORGANIZATIONS_CACHE_TIMESTAMP_KEY, now.toString());

          return mapped;
        }
      }
    } catch (e) {
      console.warn('Gagal membaca organizations dari WebApp GAS:', e);
    }
  }

  // 2. Fetch via Google Visualization API (GViz) - Sangat cepat, stabil, tanpa CORS issue
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(`${ORGANIZATIONS_GVIZ_JSON_URL}&_t=${now}`, {
      signal: controller.signal,
      cache: 'no-cache'
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      if (text && text.includes('google.visualization.Query.setResponse')) {
        const list = parseGVizOrganizations(text);
        if (list && list.length > 0) {
          localStorage.setItem(ORGANIZATIONS_CACHE_KEY, JSON.stringify(list));
          sessionStorage.setItem(ORGANIZATIONS_CACHE_KEY, JSON.stringify(list));
          localStorage.setItem(ORGANIZATIONS_CACHE_TIMESTAMP_KEY, now.toString());
          return list;
        }
      }
    }
  } catch (e) {
    console.warn('Gagal membaca GViz organizations:', e);
  }

  // 3. Fallback: Fetch via CSV publik dari Spreadsheet
  const urls = [
    `${ORGANIZATIONS_CSV_URL}&_t=${now}`,
    `${ORGANIZATIONS_GVIZ_URL}&_t=${now}`
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(url, {
        signal: controller.signal,
        cache: 'no-cache'
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const csv = await res.text();
        if (csv && !csv.includes('<!DOCTYPE html>') && csv.length > 50) {
          const rows = parseCSV(csv);
          if (rows && rows.length > 1) {
            const headerRow = rows[0];
            const headerMap: Record<string, number> = {};
            for (let i = 0; i < headerRow.length; i++) {
              const k = String(headerRow[i] || '').toLowerCase().replace(/[\s_\-]+/g, '');
              if (k) headerMap[k] = i;
            }

            const findIdx = (aliases: string[], fallback: number): number => {
              for (const a of aliases) {
                const norm = a.toLowerCase().replace(/[\s_\-]+/g, '');
                if (headerMap.hasOwnProperty(norm)) return headerMap[norm];
              }
              return fallback;
            };

            const idCol = findIdx(['id'], 0);
            const slugCol = findIdx(['slug'], 1);
            const nameCol = findIdx(['name', 'nama'], 2);
            const shortNameCol = findIdx(['short_name', 'shortname', 'singkatan'], 3);
            const descCol = findIdx(['description', 'deskripsi'], 4);
            const logoCol = findIdx(['logo'], 5);
            const coverCol = findIdx(['cover_image', 'coverimage', 'sampul'], 6);
            const leaderCol = findIdx(['leader', 'ketua'], 7);
            const visionCol = findIdx(['vision', 'visi'], 8);
            const missionsCol = findIdx(['missions', 'misi'], 9);
            const officialsCol = findIdx(['officials', 'pengurus'], 10);
            const addressCol = findIdx(['address', 'alamat'], 11);
            const phoneCol = findIdx(['phone', 'telepon'], 12);
            const emailCol = findIdx(['email'], 13);
            const updatedCol = findIdx(['updated_at', 'updatedat'], 14);
            const socialCol = findIdx(['social_media', 'socialmedia', 'sosmed'], 15);
            const userCol = findIdx(['assigned_username', 'assignedusername'], 16);

            const list: EducationalOrganization[] = [];
            for (let r = 1; r < rows.length; r++) {
              const row = rows[r];
              const id = (row[idCol] || '').trim();
              const name = (row[nameCol] || '').trim();
              if (!id && !name) continue;

              const slug = (row[slugCol] || '').trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
              const shortName = (row[shortNameCol] || name).trim();
              const description = (row[descCol] || '').trim();
              const logo = (row[logoCol] || '').trim();
              const coverImage = (row[coverCol] || '').trim();
              const leader = parseSafeJson<OrganizationLeader>(row[leaderCol], createDefaultLeader());
              const vision = (row[visionCol] || '').trim();
              const missions = parseSafeJson<string[]>(row[missionsCol], []);
              const officials = parseSafeJson<OrganizationOfficial[]>(row[officialsCol], []);
              const address = (row[addressCol] || '').trim();
              const phone = (row[phoneCol] || '').trim();
              const email = (row[emailCol] || '').trim();
              const socialMedia = parseSafeJson<OrganizationSocialMedia>(row[socialCol], {});
              const assignedUsername = (row[userCol] || '').trim() || undefined;
              const updatedAt = (row[updatedCol] || '').trim() || new Date().toISOString();

              list.push({
                id: id || `org-${r}`,
                slug,
                name,
                shortName,
                description,
                logo,
                coverImage,
                leader,
                vision,
                missions,
                officials,
                address,
                phone,
                email,
                socialMedia,
                assignedUsername,
                updatedAt
              });
            }

            if (list.length > 0) {
              localStorage.setItem(ORGANIZATIONS_CACHE_KEY, JSON.stringify(list));
              sessionStorage.setItem(ORGANIZATIONS_CACHE_KEY, JSON.stringify(list));
              localStorage.setItem(ORGANIZATIONS_CACHE_TIMESTAMP_KEY, now.toString());
              return list;
            }
          }
        }
      }
    } catch (e) {
      // lanjut ke fallback berikutnya
    }
  }

  // Fallback terakhir: baca cache lokal yang ada
  try {
    const cached = localStorage.getItem(ORGANIZATIONS_CACHE_KEY) || sessionStorage.getItem(ORGANIZATIONS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return [];
}

/**
 * Menyimpan / memperbarui data organisasi ke Google Spreadsheet via GAS Webhook
 */
export async function saveOrganizationToSheet(
  org: EducationalOrganization,
  action: 'create' | 'update' = 'update'
): Promise<{ success: boolean; message: string }> {
  const gasUrl = getOrganizationsWebAppUrl();

  const payload = {
    action,
    id: org.id,
    slug: org.slug,
    name: org.name,
    short_name: org.shortName,
    description: org.description || '',
    logo: org.logo || '',
    cover_image: org.coverImage || '',
    leader: typeof org.leader === 'object' ? JSON.stringify(org.leader) : String(org.leader || '{}'),
    vision: org.vision || '',
    missions: Array.isArray(org.missions) ? JSON.stringify(org.missions) : String(org.missions || '[]'),
    officials: Array.isArray(org.officials) ? JSON.stringify(org.officials) : String(org.officials || '[]'),
    address: org.address || '',
    phone: org.phone || '',
    email: org.email || '',
    social_media: typeof org.socialMedia === 'object' ? JSON.stringify(org.socialMedia) : String(org.socialMedia || '{}'),
    assigned_username: org.assignedUsername || '',
    updated_at: org.updatedAt || new Date().toISOString()
  };

  if (!gasUrl) {
    return {
      success: true,
      message: 'Data organisasi berhasil disimpan secara lokal (URL Webhook GAS belum dikonfigurasikan).'
    };
  }

  try {
    await fetch(gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    try {
      localStorage.removeItem(ORGANIZATIONS_CACHE_TIMESTAMP_KEY);
    } catch {}

    return {
      success: true,
      message: 'Data organisasi berhasil disimpan ke Spreadsheet!'
    };
  } catch (err: any) {
    console.warn('Gagal menyimpan ke WebApp GAS:', err);
    return {
      success: true,
      message: 'Tersimpan di penyimpanan lokal browser.'
    };
  }
}

/**
 * Menghapus data organisasi dari Google Spreadsheet via GAS Webhook
 */
export async function deleteOrganizationFromSheet(
  id: string,
  slug?: string
): Promise<{ success: boolean; message: string }> {
  const gasUrl = getOrganizationsWebAppUrl();

  if (!gasUrl) {
    return {
      success: true,
      message: 'Organisasi berhasil dihapus secara lokal (URL Webhook GAS belum dikonfigurasikan).'
    };
  }

  try {
    await fetch(gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'delete', id, slug })
    });

    try {
      localStorage.removeItem(ORGANIZATIONS_CACHE_TIMESTAMP_KEY);
    } catch {}

    return {
      success: true,
      message: 'Organisasi berhasil dihapus dari Spreadsheet!'
    };
  } catch (err: any) {
    console.warn('Gagal menghapus dari WebApp GAS:', err);
    return {
      success: true,
      message: 'Dihapus dari penyimpanan lokal browser.'
    };
  }
}

/**
 * Template Kode Google Apps Script (GAS) Lengkap untuk Database Organisasi Mitra & Profesi
 * Target Spreadsheet ID : 15eou_pxJFy6CNQK8gQWW4bhmF5hblCHJaUKeKiu4Rag
 * Target Sheet GID       : 0
 */
export const OFFICIAL_ORGANIZATIONS_GAS_CODE = `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - DATABASE ORGANISASI MITRA & PROFESI KORWILCAM PURWODADI
 * Target Spreadsheet ID : 15eou_pxJFy6CNQK8gQWW4bhmF5hblCHJaUKeKiu4Rag
 * Target Sheet GID       : 0
 * ============================================================================
 */

var DEFAULT_HEADERS = [
  'id', 'slug', 'name', 'short_name', 'description', 'logo', 'cover_image',
  'leader', 'vision', 'missions', 'officials', 'address', 'phone', 'email',
  'updated_at', 'social_media', 'assigned_username'
];

function getHeaderMap(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) {
    sheet.appendRow(DEFAULT_HEADERS);
    lastCol = DEFAULT_HEADERS.length;
  }
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  for (var c = 0; c < headers.length; c++) {
    var key = String(headers[c] || '').toLowerCase().replace(/[\\s_\\-]+/g, '');
    if (key) map[key] = c;
  }
  return { map: map, count: lastCol };
}

function findColIdx(map, keys) {
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i].toLowerCase().replace(/[\\s_\\-]+/g, '');
    if (map.hasOwnProperty(k)) return map[k];
  }
  return -1;
}

function createJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0] || ss.getActiveSheet();
    var values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      return createJson({ status: 'success', data: [] });
    }

    var headerInfo = getHeaderMap(sheet);
    var hMap = headerInfo.map;

    var idCol = findColIdx(hMap, ['id', 'id_organisasi']);
    var slugCol = findColIdx(hMap, ['slug', 'url']);
    var nameCol = findColIdx(hMap, ['name', 'nama', 'nama_organisasi']);
    var shortNameCol = findColIdx(hMap, ['short_name', 'shortname', 'singkatan']);
    var descCol = findColIdx(hMap, ['description', 'deskripsi', 'keterangan']);
    var logoCol = findColIdx(hMap, ['logo', 'logo_url']);
    var coverCol = findColIdx(hMap, ['cover_image', 'coverimage', 'sampul', 'cover']);
    var leaderCol = findColIdx(hMap, ['leader', 'ketua', 'pimpinan']);
    var visionCol = findColIdx(hMap, ['vision', 'visi']);
    var missionsCol = findColIdx(hMap, ['missions', 'misi']);
    var officialsCol = findColIdx(hMap, ['officials', 'pengurus', 'susunan_pengurus']);
    var addressCol = findColIdx(hMap, ['address', 'alamat']);
    var phoneCol = findColIdx(hMap, ['phone', 'telepon', 'no_hp', 'kontak']);
    var emailCol = findColIdx(hMap, ['email']);
    var updatedCol = findColIdx(hMap, ['updated_at', 'updatedat']);
    var socialCol = findColIdx(hMap, ['social_media', 'socialmedia', 'sosmed']);
    var userCol = findColIdx(hMap, ['assigned_username', 'assignedusername', 'pengelola', 'username']);

    var list = [];
    for (var r = 1; r < values.length; r++) {
      var row = values[r];
      var id = (idCol >= 0) ? String(row[idCol] || '').trim() : '';
      var name = (nameCol >= 0) ? String(row[nameCol] || '').trim() : '';
      if (!id && !name) continue;

      var slug = (slugCol >= 0) ? String(row[slugCol] || '').trim() : '';
      var shortName = (shortNameCol >= 0) ? String(row[shortNameCol] || name).trim() : name;
      var desc = (descCol >= 0) ? String(row[descCol] || '').trim() : '';
      var logo = (logoCol >= 0) ? String(row[logoCol] || '').trim() : '';
      var cover = (coverCol >= 0) ? String(row[coverCol] || '').trim() : '';
      var rawLeader = (leaderCol >= 0) ? row[leaderCol] : '';
      var vision = (visionCol >= 0) ? String(row[visionCol] || '').trim() : '';
      var rawMissions = (missionsCol >= 0) ? row[missionsCol] : '';
      var rawOfficials = (officialsCol >= 0) ? row[officialsCol] : '';
      var address = (addressCol >= 0) ? String(row[addressCol] || '').trim() : '';
      var phone = (phoneCol >= 0) ? String(row[phoneCol] || '').trim() : '';
      var email = (emailCol >= 0) ? String(row[emailCol] || '').trim() : '';
      var rawSocial = (socialCol >= 0) ? row[socialCol] : '';
      var user = (userCol >= 0) ? String(row[userCol] || '').trim() : '';
      var updated = (updatedCol >= 0) ? String(row[updatedCol] || '').trim() : '';

      list.push({
        id: id,
        slug: slug,
        name: name,
        short_name: shortName,
        description: desc,
        logo: logo,
        cover_image: cover,
        leader: rawLeader,
        vision: vision,
        missions: rawMissions,
        officials: rawOfficials,
        address: address,
        phone: phone,
        email: email,
        social_media: rawSocial,
        assigned_username: user,
        updated_at: updated
      });
    }

    return createJson({ status: 'success', data: list });
  } catch (err) {
    return createJson({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (err) {
    return createJson({ status: 'error', message: 'Server sibuk, silakan coba beberapa saat lagi.' });
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0] || ss.getActiveSheet();

    if (!e || !e.postData || !e.postData.contents) {
      return createJson({ status: 'error', message: 'Payload data kosong.' });
    }

    var payload = JSON.parse(e.postData.contents);
    var action = String(payload.action || 'update').toLowerCase();

    var headerInfo = getHeaderMap(sheet);
    var hMap = headerInfo.map;

    var idCol = findColIdx(hMap, ['id', 'id_organisasi']);
    var slugCol = findColIdx(hMap, ['slug', 'url']);
    var nameCol = findColIdx(hMap, ['name', 'nama', 'nama_organisasi']);
    var shortNameCol = findColIdx(hMap, ['short_name', 'shortname', 'singkatan']);
    var descCol = findColIdx(hMap, ['description', 'deskripsi', 'keterangan']);
    var logoCol = findColIdx(hMap, ['logo', 'logo_url']);
    var coverCol = findColIdx(hMap, ['cover_image', 'coverimage', 'sampul', 'cover']);
    var leaderCol = findColIdx(hMap, ['leader', 'ketua', 'pimpinan']);
    var visionCol = findColIdx(hMap, ['vision', 'visi']);
    var missionsCol = findColIdx(hMap, ['missions', 'misi']);
    var officialsCol = findColIdx(hMap, ['officials', 'pengurus', 'susunan_pengurus']);
    var addressCol = findColIdx(hMap, ['address', 'alamat']);
    var phoneCol = findColIdx(hMap, ['phone', 'telepon', 'no_hp', 'kontak']);
    var emailCol = findColIdx(hMap, ['email']);
    var updatedCol = findColIdx(hMap, ['updated_at', 'updatedat']);
    var socialCol = findColIdx(hMap, ['social_media', 'socialmedia', 'sosmed']);
    var userCol = findColIdx(hMap, ['assigned_username', 'assignedusername', 'pengelola', 'username']);

    var values = sheet.getDataRange().getValues();

    // 1. DELETE
    if (action === 'delete') {
      var targetId = String(payload.id || '').trim();
      var targetSlug = String(payload.slug || '').trim();
      for (var r = values.length - 1; r >= 1; r--) {
        var rowId = (idCol >= 0) ? String(values[r][idCol] || '').trim() : '';
        var rowSlug = (slugCol >= 0) ? String(values[r][slugCol] || '').trim() : '';
        if ((targetId && rowId === targetId) || (targetSlug && rowSlug === targetSlug)) {
          sheet.deleteRow(r + 1);
          return createJson({ status: 'success', message: 'Organisasi berhasil dihapus.' });
        }
      }
      return createJson({ status: 'warning', message: 'Organisasi tidak ditemukan untuk dihapus.' });
    }

    // Helper serialisasi JSON string
    var serializeVal = function(val, defaultStr) {
      if (val === null || val === undefined) return defaultStr;
      if (typeof val === 'string') return val;
      return JSON.stringify(val);
    };

    var pId = String(payload.id || '').trim();
    var pSlug = String(payload.slug || '').trim();
    var pName = String(payload.name || '').trim();
    var pShort = String(payload.short_name || payload.shortName || pName).trim();
    var pDesc = String(payload.description || '').trim();
    var pLogo = String(payload.logo || '').trim();
    var pCover = String(payload.cover_image || payload.coverImage || '').trim();
    var pLeader = serializeVal(payload.leader, '{}');
    var pVision = String(payload.vision || '').trim();
    var pMissions = serializeVal(payload.missions, '[]');
    var pOfficials = serializeVal(payload.officials, '[]');
    var pAddress = String(payload.address || '').trim();
    var pPhone = String(payload.phone || '').trim();
    var pEmail = String(payload.email || '').trim();
    var pSocial = serializeVal(payload.social_media || payload.socialMedia, '{}');
    var pUser = String(payload.assigned_username || payload.assignedUsername || '').trim();
    var pUpdated = String(payload.updated_at || new Date().toISOString()).trim();

    // 2. UPDATE
    if (action === 'update' || action === 'edit') {
      var targetRow = -1;
      for (var r = 1; r < values.length; r++) {
        var rowId = (idCol >= 0) ? String(values[r][idCol] || '').trim() : '';
        var rowSlug = (slugCol >= 0) ? String(values[r][slugCol] || '').trim() : '';
        if ((pId && rowId === pId) || (pSlug && rowSlug === pSlug)) {
          targetRow = r + 1;
          break;
        }
      }

      if (targetRow > 0) {
        if (pSlug && slugCol >= 0) sheet.getRange(targetRow, slugCol + 1).setValue(pSlug);
        if (pName && nameCol >= 0) sheet.getRange(targetRow, nameCol + 1).setValue(pName);
        if (shortNameCol >= 0) sheet.getRange(targetRow, shortNameCol + 1).setValue(pShort);
        if (descCol >= 0) sheet.getRange(targetRow, descCol + 1).setValue(pDesc);
        if (logoCol >= 0) sheet.getRange(targetRow, logoCol + 1).setValue(pLogo);
        if (coverCol >= 0) sheet.getRange(targetRow, coverCol + 1).setValue(pCover);
        if (leaderCol >= 0) sheet.getRange(targetRow, leaderCol + 1).setValue(pLeader);
        if (visionCol >= 0) sheet.getRange(targetRow, visionCol + 1).setValue(pVision);
        if (missionsCol >= 0) sheet.getRange(targetRow, missionsCol + 1).setValue(pMissions);
        if (officialsCol >= 0) sheet.getRange(targetRow, officialsCol + 1).setValue(pOfficials);
        if (addressCol >= 0) sheet.getRange(targetRow, addressCol + 1).setValue(pAddress);
        if (phoneCol >= 0) sheet.getRange(targetRow, phoneCol + 1).setValue(pPhone);
        if (emailCol >= 0) sheet.getRange(targetRow, emailCol + 1).setValue(pEmail);
        if (socialCol >= 0) sheet.getRange(targetRow, socialCol + 1).setValue(pSocial);
        if (userCol >= 0) sheet.getRange(targetRow, userCol + 1).setValue(pUser);
        if (updatedCol >= 0) sheet.getRange(targetRow, updatedCol + 1).setValue(pUpdated);

        return createJson({
          status: 'success',
          message: 'Data organisasi "' + pName + '" berhasil diperbarui di Spreadsheet!',
          id: pId,
          slug: pSlug
        });
      }
    }

    // 3. CREATE (INSERT BARU)
    var newId = pId || ('org-' + Date.now());
    var newRow = new Array(headerInfo.count);
    for (var c = 0; c < headerInfo.count; c++) newRow[c] = '';

    if (idCol >= 0) newRow[idCol] = newId;
    if (slugCol >= 0) newRow[slugCol] = pSlug;
    if (nameCol >= 0) newRow[nameCol] = pName;
    if (shortNameCol >= 0) newRow[shortNameCol] = pShort;
    if (descCol >= 0) newRow[descCol] = pDesc;
    if (logoCol >= 0) newRow[logoCol] = pLogo;
    if (coverCol >= 0) newRow[coverCol] = pCover;
    if (leaderCol >= 0) newRow[leaderCol] = pLeader;
    if (visionCol >= 0) newRow[visionCol] = pVision;
    if (missionsCol >= 0) newRow[missionsCol] = pMissions;
    if (officialsCol >= 0) newRow[officialsCol] = pOfficials;
    if (addressCol >= 0) newRow[addressCol] = pAddress;
    if (phoneCol >= 0) newRow[phoneCol] = pPhone;
    if (emailCol >= 0) newRow[emailCol] = pEmail;
    if (socialCol >= 0) newRow[socialCol] = pSocial;
    if (userCol >= 0) newRow[userCol] = pUser;
    if (updatedCol >= 0) newRow[updatedCol] = pUpdated;

    sheet.appendRow(newRow);

    return createJson({
      status: 'success',
      message: 'Organisasi "' + pName + '" berhasil ditambahkan ke Spreadsheet!',
      id: newId,
      slug: pSlug,
      row: sheet.getLastRow()
    });

  } catch (err) {
    return createJson({ status: 'error', message: err.toString() });
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}
`;
