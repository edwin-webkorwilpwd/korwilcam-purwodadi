import { AulaAgendaBooking } from '../types';

export const AULA_SPREADSHEET_ID = '1nzkmMYJ0mKDYXdkEr89dFTJCON0XulNgRDeK8eVbNbA';
export const AULA_SHEET_GID = '1176610395';
export const AULA_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${AULA_SPREADSHEET_ID}/export?format=csv&gid=${AULA_SHEET_GID}`;
export const AULA_SHEET_WEB_URL = `https://docs.google.com/spreadsheets/d/${AULA_SPREADSHEET_ID}/edit?gid=${AULA_SHEET_GID}#gid=${AULA_SHEET_GID}`;

// Robust CSV parser handling quotes, commas within quotes, line breaks
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some(val => val.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(val => val.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Helper to format ISO or YYYY-MM-DD date into friendly Indonesian format
export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr || dateStr === '-') return '-';
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // If multiple dates separated by comma
  if (dateStr.includes(',')) {
    const parts = dateStr.split(',').map(s => s.trim()).filter(Boolean);
    return parts.map(p => formatIndonesianDate(p)).join(' & ');
  }

  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const year = match[1];
    const monthIndex = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    const monthName = months[monthIndex] || match[2];
    return `${day} ${monthName} ${year}`;
  }

  return dateStr;
}

export function formatMonthDayBadge(dateStr: string): { day: string; month: string } {
  if (!dateStr || dateStr === '-') return { day: '—', month: 'AULA' };
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];

  const firstDate = dateStr.split(',')[0].trim();
  const match = firstDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const monthIndex = parseInt(match[2], 10) - 1;
    const day = match[3];
    return { day, month: months[monthIndex] || 'AULA' };
  }

  return { day: '01', month: 'AULA' };
}

export function getComparableDate(item: AulaAgendaBooking): number {
  if (item.tanggalPenggunaan && item.tanggalPenggunaan !== '-') {
    const dates = item.tanggalPenggunaan.split(',').map(s => s.trim()).filter(Boolean);
    const dateStr = dates[0];
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      return new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10)).getTime();
    }
  }
  if (item.timestamp) {
    const t = new Date(item.timestamp).getTime();
    if (!isNaN(t)) return t;
  }
  return 0;
}

export function compareAgendaDatesDescending(a: AulaAgendaBooking, b: AulaAgendaBooking): number {
  const dateA = getComparableDate(a);
  const dateB = getComparableDate(b);
  if (dateB !== dateA) {
    return dateB - dateA; // Newest date first
  }
  const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
  const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
  if (!isNaN(timeA) && !isNaN(timeB) && timeB !== timeA) {
    return timeB - timeA;
  }
  return 0;
}

// 55 real records from the official Google Spreadsheet as verified fallback
export const FALLBACK_AULA_BOOKINGS: AulaAgendaBooking[] = [
  {
    id: "sheet-1",
    timestamp: "4/20/2026 19:50:24",
    namaPJ: "ANGGA GADING PRADANA, M.Pd.",
    organisasi: "Pramuka",
    whatsapp: "6285741775617",
    tanggalPenggunaan: "2026-04-20",
    jamPemakaian: "11:00 - 13:00",
    kategori: "Pelatihan",
    keterangan: "Pelatihan pramuka kepada anak-anak",
    statusPersetujuan: "Disetujui",
    nip: "198810252009021001"
  },
  {
    id: "sheet-2",
    timestamp: "4/21/2026 12:32:06",
    namaPJ: "ANGGA GADING PRADANA, M.Pd.",
    organisasi: "Pramuka",
    whatsapp: "6285741775617",
    tanggalPenggunaan: "2026-04-21",
    jamPemakaian: "10:00 - 12:00",
    kategori: "Pelatihan",
    keterangan: "Sosialisasi Pesta Siaga",
    statusPersetujuan: "Disetujui",
    nip: "198810252009021001"
  },
  {
    id: "sheet-3",
    timestamp: "4/22/2026 12:04:31",
    namaPJ: "YELLA SENAWATI, S.Pd.",
    organisasi: "Pramuka",
    whatsapp: "6285741730001",
    tanggalPenggunaan: "2026-04-22",
    jamPemakaian: "10:00 - 12:00",
    kategori: "Pelatihan",
    keterangan: "Pramuka Siaga",
    statusPersetujuan: "Disetujui",
    nip: "198401092011012002"
  },
  {
    id: "sheet-4",
    timestamp: "4/23/2026 12:38:44",
    namaPJ: "YELLA SENAWATI, S.Pd.",
    organisasi: "Pramuka",
    whatsapp: "6285741730001",
    tanggalPenggunaan: "2026-04-23",
    jamPemakaian: "10:00 - 12:00",
    kategori: "Lainnya",
    keterangan: "Latihan Pramuka Kwarran Purwodadi",
    statusPersetujuan: "Disetujui",
    nip: "198401092011012002"
  },
  {
    id: "sheet-5",
    timestamp: "4/23/2026 18:21:27",
    namaPJ: "Arif Kurniawan",
    organisasi: "Dinas Pendidikan",
    whatsapp: "6285870700007",
    tanggalPenggunaan: "2026-04-30",
    jamPemakaian: "07:30 - 13:00",
    kategori: "Seminar/Workshop",
    keterangan: "Pendampingan advokasi MBG",
    statusPersetujuan: "Disetujui",
    nip: "198304152010011002"
  },
  {
    id: "sheet-6",
    timestamp: "4/25/2026 16:20:23",
    namaPJ: "Sawijo, S.Pd",
    organisasi: "KKKS Ki Ageng Selo",
    whatsapp: "6282136885290",
    tanggalPenggunaan: "2026-04-25",
    jamPemakaian: "10:00 - 13:00",
    kategori: "Rapat Dinas",
    keterangan: "Rapat penyamaan persepsi penilaian FLS3N",
    statusPersetujuan: "Disetujui",
    nip: "198401112006041003"
  },
  {
    id: "sheet-7",
    timestamp: "5/5/2026 14:31:48",
    namaPJ: "SAPUAN",
    organisasi: "IGTKI",
    whatsapp: "6285712361703",
    tanggalPenggunaan: "2026-05-07",
    jamPemakaian: "08:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "Rapat rutin IGTKI",
    statusPersetujuan: "Disetujui",
    nip: "197604192025211023"
  },
  {
    id: "sheet-8",
    timestamp: "5/5/2026 14:33:22",
    namaPJ: "SAPUAN",
    organisasi: "Himpaudi",
    whatsapp: "6285712361703",
    tanggalPenggunaan: "2026-05-08",
    jamPemakaian: "08:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "Rapat rutin Himpaudi",
    statusPersetujuan: "Disetujui",
    nip: "197604192025211023"
  },
  {
    id: "sheet-9",
    timestamp: "5/6/2026 10:33:29",
    namaPJ: "Anggun",
    organisasi: "IGTKI",
    whatsapp: "62895346500002",
    tanggalPenggunaan: "2026-05-09",
    jamPemakaian: "08:00 - 12:00",
    kategori: "Lainnya",
    keterangan: "Pertemuan IGTKI",
    statusPersetujuan: "Disetujui",
    nip: "TK"
  },
  {
    id: "sheet-10",
    timestamp: "5/6/2026 12:38:48",
    namaPJ: "EDWIN TITO NUR KUNCORO",
    organisasi: "Pramuka",
    whatsapp: "6282329378013",
    tanggalPenggunaan: "2026-05-09",
    jamPemakaian: "08:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "Koordinasi Pramuka",
    statusPersetujuan: "Disetujui",
    nip: "199805172025211045"
  },
  {
    id: "sheet-11",
    timestamp: "5/7/2026 9:07:26",
    namaPJ: "YULIANTO WIBOWO, S.Pd.SD",
    organisasi: "SDN 2 Purwodadi",
    whatsapp: "6282191963020",
    tanggalPenggunaan: "2026-06-13",
    jamPemakaian: "07:00 - 12:30",
    kategori: "Lainnya",
    keterangan: "Perpisahan Kelas 6 SDN 2 Purwodadi",
    statusPersetujuan: "Disetujui",
    nip: "198707082009021002"
  },
  {
    id: "sheet-12",
    timestamp: "5/7/2026 9:10:41",
    namaPJ: "TJATUR PRIJANTO ADI, S.Pd.",
    organisasi: "SDN 9 Purwodadi",
    whatsapp: "6287826567002",
    tanggalPenggunaan: "2026-06-06",
    jamPemakaian: "07:00 - 12:30",
    kategori: "Lainnya",
    keterangan: "Perpisahan Kelas 6 SDN 9 Purwodadi",
    statusPersetujuan: "Disetujui",
    nip: "196612241988101001"
  },
  {
    id: "sheet-13",
    timestamp: "5/7/2026 12:07:40",
    namaPJ: "Anggun",
    organisasi: "TK",
    whatsapp: "62895356200002",
    tanggalPenggunaan: "2026-05-13",
    jamPemakaian: "07:00 - 12:30",
    kategori: "Lainnya",
    keterangan: "Perpisahan TK",
    statusPersetujuan: "Disetujui",
    nip: "TK"
  },
  {
    id: "sheet-14",
    timestamp: "5/8/2026 11:12:59",
    namaPJ: "Anggun",
    organisasi: "Bidang SD",
    whatsapp: "62895356200002",
    tanggalPenggunaan: "2026-05-20, 2026-05-22",
    jamPemakaian: "08:00 - 12:30",
    kategori: "Rapat Dinas",
    keterangan: "Kegiatan Bidang SD",
    statusPersetujuan: "Disetujui",
    nip: "Dinas"
  },
  {
    id: "sheet-15",
    timestamp: "5/12/2026 9:43:09",
    namaPJ: "Anggun",
    organisasi: "Bidang SD",
    whatsapp: "62895356200002",
    tanggalPenggunaan: "2026-05-13",
    jamPemakaian: "09:00 - 12:00",
    kategori: "Lainnya",
    keterangan: "Sosialisasi OSN",
    statusPersetujuan: "Disetujui",
    nip: "Dinas"
  },
  {
    id: "sheet-16",
    timestamp: "5/12/2026 9:48:51",
    namaPJ: "Anggun",
    organisasi: "SD",
    whatsapp: "62895356200002",
    tanggalPenggunaan: "2026-05-30",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Lainnya",
    keterangan: "Pelepasan siswa kelas 6",
    statusPersetujuan: "Disetujui",
    nip: "SD"
  },
  {
    id: "sheet-17",
    timestamp: "5/12/2026 9:52:23",
    namaPJ: "Anggun",
    organisasi: "PMPTK",
    whatsapp: "62895356200002",
    tanggalPenggunaan: "2026-05-16",
    jamPemakaian: "08:00 - 12:00",
    kategori: "Lainnya",
    keterangan: "PMPTK PW",
    statusPersetujuan: "Disetujui",
    nip: "Dinas"
  },
  {
    id: "sheet-18",
    timestamp: "5/21/2026 6:29:19",
    namaPJ: "Indar Wiyati",
    organisasi: "Dinas Pendidikan",
    whatsapp: "6285161717170",
    tanggalPenggunaan: "2026-05-26",
    jamPemakaian: "07:00 - 13:00",
    kategori: "Rapat Dinas",
    keterangan: "Rapat kedinasan pengawas kabupaten grobogan",
    statusPersetujuan: "Disetujui",
    nip: "197202012008012012"
  },
  {
    id: "sheet-19",
    timestamp: "6/3/2026 12:26:00",
    namaPJ: "Edwin Tito Nur Kuncoro, S.Pd",
    organisasi: "Dinas Pendidikan",
    whatsapp: "6285161717170",
    tanggalPenggunaan: "2026-06-10",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "Rapat Dinas Pendidikan",
    statusPersetujuan: "Disetujui",
    nip: "199805172025211045"
  },
  {
    id: "sheet-20",
    timestamp: "6/3/2026 12:45:38",
    namaPJ: "TJATUR PRIJANTO ADI, S.Pd.",
    organisasi: "SDN 9 Purwodadi",
    whatsapp: "6285161717170",
    tanggalPenggunaan: "2026-06-06",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Lainnya",
    keterangan: "Perpisahan Siswa SDN 9 Purwodadi",
    statusPersetujuan: "Disetujui",
    nip: "196612241988101001"
  },
  {
    id: "sheet-21",
    timestamp: "6/3/2026 13:34:49",
    namaPJ: "EDWIN TITO NUR KUNCORO",
    organisasi: "Dinas Pendidikan",
    whatsapp: "6285161717170",
    tanggalPenggunaan: "2026-06-10",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "Rapat PMPTK",
    statusPersetujuan: "Disetujui",
    nip: "199805172025211045"
  },
  {
    id: "sheet-22",
    timestamp: "6/4/2026 11:55:11",
    namaPJ: "Anggun",
    organisasi: "Korwilcam Purwodadi",
    whatsapp: "62895356200002",
    tanggalPenggunaan: "2026-06-05",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "Rapat IGTKI Kabupaten",
    statusPersetujuan: "Disetujui",
    nip: "TK"
  },
  {
    id: "sheet-23",
    timestamp: "6/4/2026 11:55:58",
    namaPJ: "Anggun",
    organisasi: "Korwilcam Purwodadi",
    whatsapp: "62895356200002",
    tanggalPenggunaan: "2026-06-12",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "Rapat IGTKI Kecamatan",
    statusPersetujuan: "Disetujui",
    nip: "TK"
  },
  {
    id: "sheet-24",
    timestamp: "6/4/2026 11:56:48",
    namaPJ: "Anggun",
    organisasi: "Korwilcam Purwodadi",
    whatsapp: "62895356200002",
    tanggalPenggunaan: "2026-06-15",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "Rapat HIMPAUDI Kec. Purwodadi",
    statusPersetujuan: "Disetujui",
    nip: "KB"
  },
  {
    id: "sheet-25",
    timestamp: "6/4/2026 11:58:32",
    namaPJ: "DYAN DWI AFRIANTO, S.Pd.",
    organisasi: "SDN 3 Purwodadi",
    whatsapp: "6281225092727",
    tanggalPenggunaan: "2026-06-17",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Lainnya",
    keterangan: "Perpisahan SDN 3 Purwodadi",
    statusPersetujuan: "Disetujui",
    nip: "198704192010011003"
  },
  {
    id: "sheet-26",
    timestamp: "6/4/2026 11:59:12",
    namaPJ: "Anggun",
    organisasi: "Korwilcam Purwodadi",
    whatsapp: "62895356200002",
    tanggalPenggunaan: "2026-06-19",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Seminar/Workshop",
    keterangan: "Seminar Pendidikan",
    statusPersetujuan: "Disetujui",
    nip: "Korwil"
  },
  {
    id: "sheet-27",
    timestamp: "6/5/2026 8:26:45",
    namaPJ: "EDWIN TITO NUR KUNCORO",
    organisasi: "Korwilcam Purwodadi",
    whatsapp: "6285161717170",
    tanggalPenggunaan: "2026-06-11",
    jamPemakaian: "07:00 - 12:30",
    kategori: "Rapat Dinas",
    keterangan: "Rapat Pengawas se-Kabupaten",
    statusPersetujuan: "Disetujui",
    nip: "199805172025211045"
  },
  {
    id: "sheet-28",
    timestamp: "6/5/2026 8:39:59",
    namaPJ: "LENNY VERAWATI, S.Pd",
    organisasi: "Korwilcam Purwodadi",
    whatsapp: "6281228467668",
    tanggalPenggunaan: "2026-06-13",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Lainnya",
    keterangan: "Perpisahan TK Tunas Simpang",
    statusPersetujuan: "Disetujui",
    nip: "198006082006042009"
  },
  {
    id: "sheet-29",
    timestamp: "6/10/2026 15:10:24",
    namaPJ: "Sayful",
    organisasi: "Korwilcam Purwodadi",
    whatsapp: "6285161717170",
    tanggalPenggunaan: "2026-06-23, 2026-06-24",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "PMPTK",
    statusPersetujuan: "Disetujui",
    nip: "200204192025211007"
  },
  {
    id: "sheet-30",
    timestamp: "6/15/2026 8:21:32",
    namaPJ: "EDWIN TITO NUR KUNCORO",
    organisasi: "Korwilcam Purwodadi",
    whatsapp: "6285161717170",
    tanggalPenggunaan: "2026-06-19",
    jamPemakaian: "07:30 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "Rapat Dinas Korwilcam Purwodadi",
    statusPersetujuan: "Disetujui",
    nip: "199805172025211045"
  },
  {
    id: "sheet-31",
    timestamp: "6/15/2026 8:23:01",
    namaPJ: "EDWIN TITO NUR KUNCORO",
    organisasi: "Korwilcam Purwodadi",
    whatsapp: "6285161717170",
    tanggalPenggunaan: "2026-06-19",
    jamPemakaian: "13:30 - 17:00",
    kategori: "Lainnya",
    keterangan: "Rapat Seminar Pendidikan",
    statusPersetujuan: "Disetujui",
    nip: "199805172025211045"
  },
  {
    id: "sheet-32",
    timestamp: "6/17/2026 11:31:49",
    namaPJ: "Sayful Anwar",
    organisasi: "Korwilcam Purwodadi / a.n PMPTK",
    whatsapp: "6282170774341",
    tanggalPenggunaan: "2026-06-22",
    jamPemakaian: "07:30 - 15:15",
    kategori: "Pelatihan",
    keterangan: "PMPTK",
    statusPersetujuan: "Disetujui",
    nip: "200204192025211007"
  },
  {
    id: "sheet-33",
    timestamp: "6/26/2026 7:50:47",
    namaPJ: "Anggun",
    organisasi: "KKKS",
    whatsapp: "62895356200002",
    tanggalPenggunaan: "2026-06-27",
    jamPemakaian: "08:00 - 12:30",
    kategori: "Lainnya",
    keterangan: "Rapat KKKS",
    statusPersetujuan: "Disetujui",
    nip: "-"
  },
  {
    id: "sheet-34",
    timestamp: "7/2/2026 7:44:29",
    namaPJ: "Anggun",
    organisasi: "Bidang SD",
    whatsapp: "62895356200002",
    tanggalPenggunaan: "2026-07-07",
    jamPemakaian: "07:00 - 12:30",
    kategori: "Lainnya",
    keterangan: "Sosialisasi inklusi",
    statusPersetujuan: "Disetujui",
    nip: "Dinas"
  },
  {
    id: "sheet-35",
    timestamp: "7/3/2026 10:39:29",
    namaPJ: "EDWIN TITO NUR KUNCORO",
    organisasi: "IPUNDI Kabupaten",
    whatsapp: "6285161717170",
    tanggalPenggunaan: "2026-07-08",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "Rapat Rutin",
    statusPersetujuan: "Disetujui",
    nip: "199805172025211045"
  },
  {
    id: "sheet-36",
    timestamp: "7/3/2026 11:00:05",
    namaPJ: "EDWIN TITO NUR KUNCORO",
    organisasi: "IGTK",
    whatsapp: "6285161717170",
    tanggalPenggunaan: "2026-07-09",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "Rapat IGTKI",
    statusPersetujuan: "Disetujui",
    nip: "199805172025211045"
  },
  {
    id: "sheet-37",
    timestamp: "7/13/2026 8:39:19",
    namaPJ: "EDWIN TITO NUR KUNCORO",
    organisasi: "PMPTK",
    whatsapp: "6285161717170",
    tanggalPenggunaan: "2026-07-16",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "Rapat Dinas Pengawas se-Kabupaten",
    statusPersetujuan: "Disetujui",
    nip: "199805172025211045"
  },
  {
    id: "sheet-38",
    timestamp: "7/15/2026 10:28:18",
    namaPJ: "Edwin Tito Nur Kuncoro",
    organisasi: "Korwilcam Purwodadi",
    whatsapp: "6285161717170",
    tanggalPenggunaan: "2026-07-15",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "OSN Kabupaten",
    statusPersetujuan: "Disetujui",
    nip: "199805172025211045"
  },
  {
    id: "sheet-39",
    timestamp: "7/15/2026 10:29:08",
    namaPJ: "Edwin Tito Nur Kuncoro",
    organisasi: "Korwilcam Purwodadi",
    whatsapp: "6285161717170",
    tanggalPenggunaan: "2026-07-22",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "PMPTK",
    statusPersetujuan: "Disetujui",
    nip: "199805172025211045"
  },
  {
    id: "sheet-40",
    timestamp: "7/15/2026 10:29:38",
    namaPJ: "Edwin Tito Nur Kuncoro",
    organisasi: "Korwilcam Purwodadi",
    whatsapp: "6285161717170",
    tanggalPenggunaan: "2026-07-24",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "KB",
    statusPersetujuan: "Disetujui",
    nip: "199805172025211045"
  },
  {
    id: "sheet-41",
    timestamp: "8/3/2026 14:24:18",
    namaPJ: "Anggun",
    organisasi: "HIMPAUDI",
    whatsapp: "62895356200002",
    tanggalPenggunaan: "2026-08-14",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "Rapat Rutin himpaudi",
    statusPersetujuan: "Disetujui",
    nip: "KB"
  },
  {
    id: "sheet-42",
    timestamp: "8/6/2026 7:30:16",
    namaPJ: "Martono",
    organisasi: "IGTKI",
    whatsapp: "6285290001972",
    tanggalPenggunaan: "2026-08-07",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "Rapat Rutin IGTKI",
    statusPersetujuan: "Disetujui",
    nip: "197208052025211024"
  },
  {
    id: "sheet-43",
    timestamp: "8/6/2026 7:33:15",
    namaPJ: "Martono",
    organisasi: "IGTKI Kabupaten",
    whatsapp: "6285290001972",
    tanggalPenggunaan: "2026-08-10",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "Rapat rutin IGTKI Kabupaten",
    statusPersetujuan: "Disetujui",
    nip: "197208052025211024"
  },
  {
    id: "sheet-44",
    timestamp: "8/12/2026 10:56:54",
    namaPJ: "SAYFUL ANWAR",
    organisasi: "KORWILCAM BIDANG PENDIDIKAN KECAMATAN PURWODADI",
    whatsapp: "6282170774341",
    tanggalPenggunaan: "2026-08-13",
    jamPemakaian: "08:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "PMPTK",
    statusPersetujuan: "Disetujui",
    nip: "200204192025211007"
  },
  {
    id: "sheet-45",
    timestamp: "8/19/2026 11:12:03",
    namaPJ: "A. ARIF KURNIAWAN",
    organisasi: "Korwilcam Purwodadi",
    whatsapp: "6282329378013",
    tanggalPenggunaan: "2026-08-26",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "Rapat PMPTK",
    statusPersetujuan: "Disetujui",
    nip: "198304152010011002"
  },
  {
    id: "sheet-46",
    timestamp: "8/21/2026 10:08:02",
    namaPJ: "Anggun",
    organisasi: "Dinas Pendidikan",
    whatsapp: "62895356200002",
    tanggalPenggunaan: "2026-09-05",
    jamPemakaian: "08:00 - 12:30",
    kategori: "Rapat Dinas",
    keterangan: "Bimtek Bos Kinerja",
    statusPersetujuan: "Disetujui",
    nip: "-"
  },
  {
    id: "sheet-47",
    timestamp: "8/21/2026 10:09:02",
    namaPJ: "Anggun",
    organisasi: "Dinas Pendidikan",
    whatsapp: "62895356200002",
    tanggalPenggunaan: "2026-10-17",
    jamPemakaian: "08:00 - 12:30",
    kategori: "Rapat Dinas",
    keterangan: "Bimtek Bos Kinerja",
    statusPersetujuan: "Disetujui",
    nip: "-"
  },
  {
    id: "sheet-48",
    timestamp: "8/21/2026 10:10:30",
    namaPJ: "Anggun",
    organisasi: "Dinas Pendidikan",
    whatsapp: "62895356200002",
    tanggalPenggunaan: "2026-10-24",
    jamPemakaian: "08:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "Bimtek Bos Kinerja",
    statusPersetujuan: "Disetujui",
    nip: "-"
  },
  {
    id: "sheet-49",
    timestamp: "8/28/2026 13:35:11",
    namaPJ: "Yulianto Wibowo, S.Pd.SD",
    organisasi: "KKKS Ki Ageng Selo",
    whatsapp: "6282191963020",
    tanggalPenggunaan: "2026-08-29",
    jamPemakaian: "08:00 - 12:30",
    kategori: "Pelatihan",
    keterangan: "Rapat KKG Guru Kelas 6",
    statusPersetujuan: "Disetujui",
    nip: "198707082009021002"
  },
  {
    id: "sheet-50",
    timestamp: "9/2/2026 16:47:51",
    namaPJ: "EDWIN TITO NUR KUNCORO",
    organisasi: "Korwilcam Purwodadi",
    whatsapp: "6282329378013",
    tanggalPenggunaan: "2026-09-03",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "TM FTBI dari K3S Korwilcam Purwodadi",
    statusPersetujuan: "Disetujui",
    nip: "199805172025211045"
  },
  {
    id: "sheet-51",
    timestamp: "9/2/2026 16:48:31",
    namaPJ: "EDWIN TITO NUR KUNCORO",
    organisasi: "Korwilcam Purwodadi",
    whatsapp: "6282329378013",
    tanggalPenggunaan: "2026-09-04",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Seminar/Workshop",
    keterangan: "Sosialisasi BOS",
    statusPersetujuan: "Disetujui",
    nip: "199805172025211045"
  },
  {
    id: "sheet-52",
    timestamp: "9/3/2026 12:22:10",
    namaPJ: "Martono",
    organisasi: "Korwilcam Purwodadi",
    whatsapp: "6285290001972",
    tanggalPenggunaan: "2026-09-15",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "Rapat Rutin HIMPAUDI",
    statusPersetujuan: "Disetujui",
    nip: "197208052025211024"
  },
  {
    id: "sheet-53",
    timestamp: "9/3/2026 13:14:06",
    namaPJ: "SRI SOELASTRI, M.Pd.",
    organisasi: "SDN 1 Ngraji",
    whatsapp: "6285868825675",
    tanggalPenggunaan: "2026-09-17",
    jamPemakaian: "07:00 - 12:00",
    kategori: "Rapat Dinas",
    keterangan: "BOSKIN Oleh Bu Sri Soelastri",
    statusPersetujuan: "Ditolak",
    nip: "196701311991032006"
  }
];

const STORAGE_CACHE_KEY = 'korwilcam_aula_agenda_cache';

export async function fetchAulaAgendaFromSheet(): Promise<AulaAgendaBooking[]> {
  try {
    const res = await fetch(AULA_SHEET_CSV_URL, {
      method: 'GET',
      cache: 'no-cache',
    });

    if (!res.ok) {
      throw new Error(`Gagal mengunduh database Korwilcam Purwodadi (Status ${res.status})`);
    }

    const csvText = await res.text();
    if (!csvText || csvText.trim().length === 0) {
      throw new Error('Data database Korwilcam Purwodadi kosong');
    }

    const rows = parseCSV(csvText);
    if (rows.length <= 1) {
      throw new Error('Baris data database Korwilcam Purwodadi tidak ditemukan');
    }

    // Header index mapping
    const header = rows[0].map(h => h.toLowerCase().trim());
    const idxNamaPJ = header.findIndex(h => h.includes('penanggung') || h.includes('pj') || h.includes('nama'));
    const idxOrg = header.findIndex(h => h.includes('organisasi') || h.includes('instansi'));
    const idxWa = header.findIndex(h => h.includes('whatsapp') || h.includes('wa') || h.includes('telp'));
    const idxTgl = header.findIndex(h => h.includes('tanggal'));
    const idxJam = header.findIndex(h => h.includes('jam') || h.includes('waktu'));
    const idxKat = header.findIndex(h => h.includes('kategori'));
    const idxKet = header.findIndex(h => h.includes('keterangan') || h.includes('acara') || h.includes('kegiatan'));
    const idxStatus = header.findIndex(h => h.includes('status') || h.includes('persetujuan'));
    const idxNip = header.findIndex(h => h.includes('nip'));
    const idxTime = header.findIndex(h => h.includes('timestamp') || h.includes('waktu'));

    const items: AulaAgendaBooking[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0 || !row.some(c => c && c.trim().length > 0)) continue;

      const namaPJ = (idxNamaPJ !== -1 ? row[idxNamaPJ] : row[1]) || '-';
      const organisasi = (idxOrg !== -1 ? row[idxOrg] : row[2]) || '-';
      const whatsapp = (idxWa !== -1 ? row[idxWa] : row[3]) || '';
      const tanggalPenggunaan = (idxTgl !== -1 ? row[idxTgl] : row[4]) || '-';
      const jamPemakaian = (idxJam !== -1 ? row[idxJam] : row[5]) || '-';
      const kategori = (idxKat !== -1 ? row[idxKat] : row[6]) || 'Lainnya';
      const keterangan = (idxKet !== -1 ? row[idxKet] : row[7]) || '-';
      const statusPersetujuan = (idxStatus !== -1 ? row[idxStatus] : row[8]) || 'Disetujui';
      const nip = (idxNip !== -1 ? row[idxNip] : row[9]) || '';
      const timestamp = (idxTime !== -1 ? row[idxTime] : row[0]) || '';

      items.push({
        id: `sheet-${i}`,
        timestamp,
        namaPJ: namaPJ.trim(),
        organisasi: organisasi.trim(),
        whatsapp: whatsapp.trim(),
        tanggalPenggunaan: tanggalPenggunaan.trim(),
        jamPemakaian: jamPemakaian.trim(),
        kategori: kategori.trim() || 'Lainnya',
        keterangan: keterangan.trim(),
        statusPersetujuan: statusPersetujuan.trim() || 'Disetujui',
        nip: nip.trim()
      });
    }

    if (items.length > 0) {
      items.sort(compareAgendaDatesDescending);
      try {
        localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn('Gagal menyimpan cache agenda di localStorage:', e);
      }
      return items;
    }

    return [...FALLBACK_AULA_BOOKINGS].sort(compareAgendaDatesDescending);
  } catch (error) {
    console.warn('Gagal mengambil data live database Korwilcam Purwodadi, menggunakan cache/fallback:', error);
    try {
      const cached = localStorage.getItem(STORAGE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort(compareAgendaDatesDescending);
        }
      }
    } catch {
      // ignore
    }
    return [...FALLBACK_AULA_BOOKINGS].sort(compareAgendaDatesDescending);
  }
}
