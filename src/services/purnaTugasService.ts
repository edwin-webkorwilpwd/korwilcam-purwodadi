import { PurnaTugasPegawai } from '../types';
import { parseCSV } from './googleSheetService';

export const PURNA_TUGAS_SPREADSHEET_ID = '11Cjmu-R6gbh1Z-hgKTWCagBdAFZh_bPcQQQHSzacVz4';
export const PURNA_TUGAS_SHEET_GID = '0';
export const PURNA_TUGAS_CSV_URL = `https://docs.google.com/spreadsheets/d/${PURNA_TUGAS_SPREADSHEET_ID}/export?format=csv&gid=${PURNA_TUGAS_SHEET_GID}`;
export const PURNA_TUGAS_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${PURNA_TUGAS_SPREADSHEET_ID}/edit?gid=${PURNA_TUGAS_SHEET_GID}#gid=${PURNA_TUGAS_SHEET_GID}`;
export const PURNA_TUGAS_CACHE_KEY = 'korwilcam_purna_tugas_cache';

export const FALLBACK_PURNA_TUGAS: PurnaTugasPegawai[] = [
  {
    no: '1',
    nama: 'NARTO, S.Pd., M.Pd',
    nip: '196703121992011001',
    mkGol: '30 th 02 bl',
    mkPns: '35 th 2 bl',
    mkPens: '35 th 3 bl',
    mkGol2: '29 th 09 bl',
    mkPns2: '34 th 9 bl',
    mkPens2: '34 th 10 bl',
    usiaPensiun: '60 th',
    tempatLahir: 'GROBOGAN',
    tanggalLahir: '12-03-1967',
    agama: 'Islam',
    jenisKelamin: 'Laki-laki',
    tmtCpns: '01-01-1992',
    golongan: 'IV/b',
    pangkat: 'Pembina Tingkat I',
    jenjangPendidikan: 'S-2',
    jurusanPendidikan: 'S-2 MAGISTER MANAJEMEN PENDIDIKAN',
    namaSekolah: 'UNIVERSITAS MUHAMMADIYAH SURAKARTA',
    instansiSubUnit: 'Koordinator Wilayah Kecamatan Bidang Pendidikan Kecamatan Purwodadi',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Pengawas Sekolah Ahli Madya',
    rumpunJabatan: 'Teknis',
    batasUsiaPensiun: '01-04-2027',
    linkFoto: ''
  },
  {
    no: '11',
    nama: 'SISWANTI, S.Pd',
    nip: '196702152008012008',
    mkGol: '14 th 01 bl',
    mkPns: '19 th 1 bl',
    mkPens: '19 th 2 bl',
    mkGol2: '13 th 09 bl',
    mkPns2: '18 th 9 bl',
    mkPens2: '18 th 10 bl',
    usiaPensiun: '60 th',
    tempatLahir: 'GROBOGAN',
    tanggalLahir: '15-02-1967',
    agama: 'Islam',
    jenisKelamin: 'Perempuan',
    tmtCpns: '01-01-2008',
    golongan: 'III/c',
    pangkat: 'Penata',
    jenjangPendidikan: 'S-1/Sarjana',
    jurusanPendidikan: 'S-1 BIMBINGAN DAN KONSELING',
    namaSekolah: 'IKIP VETERAN',
    instansiSubUnit: 'TK Dharma Wanita Kandangan I-',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Guru Ahli Muda',
    rumpunJabatan: 'Guru',
    batasUsiaPensiun: '01-03-2027',
    linkFoto: ''
  },
  {
    no: '12',
    nama: 'SUTIPAH, S.Pd.',
    nip: '196707012000122005',
    mkGol: '21 th 07 bl',
    mkPns: '26 th 7 bl',
    mkPens: '23 th 8 bl',
    mkGol2: '20 th 10 bl',
    mkPns2: '25 th 10 bl',
    mkPens2: '22 th 11 bl',
    usiaPensiun: '60 th',
    tempatLahir: 'GROBOGAN',
    tanggalLahir: '01-07-1967',
    agama: 'Islam',
    jenisKelamin: 'Perempuan',
    tmtCpns: '01-12-2000',
    golongan: 'IV/b',
    pangkat: 'Pembina Tingkat I',
    jenjangPendidikan: 'S-1/Sarjana',
    jurusanPendidikan: 'S-1 PENDIDIKAN GURU SEKOLAH DASAR',
    namaSekolah: 'UNIVERSITAS TERBUKA',
    instansiSubUnit: 'SDN 1 Candisari-',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Guru Ahli Madya',
    rumpunJabatan: 'Guru',
    batasUsiaPensiun: '01-08-2027',
    linkFoto: ''
  },
  {
    no: '37',
    nama: 'AGRIPINA YUSTINA, S.Pd.SD',
    nip: '196706232008012008',
    mkGol: '14 th 05 bl',
    mkPns: '19 th 5 bl',
    mkPens: '19 th 6 bl',
    mkGol2: '13 th 09 bl',
    mkPns2: '18 th 9 bl',
    mkPens2: '18 th 10 bl',
    usiaPensiun: '60 th',
    tempatLahir: 'SEMARANG',
    tanggalLahir: '23-06-1967',
    agama: 'Islam',
    jenisKelamin: 'Perempuan',
    tmtCpns: '01-01-2008',
    golongan: 'III/d',
    pangkat: 'Penata Tingkat I',
    jenjangPendidikan: 'S-1/Sarjana',
    jurusanPendidikan: 'S-1 PENDIDIKAN GURU SEKOLAH DASAR',
    namaSekolah: 'UNIVERSITAS TERBUKA',
    instansiSubUnit: 'SDN 1 Cingkrong-',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Guru Ahli Muda',
    rumpunJabatan: 'Guru',
    batasUsiaPensiun: '01-07-2027',
    linkFoto: ''
  },
  {
    no: '43',
    nama: 'ASMINI, S.Pd.SD',
    nip: '196711092021212001',
    mkGol: '06 th 10 bl',
    mkPns: 'th bl',
    mkPens: 'th bl',
    mkGol2: '05 th 09 bl',
    mkPns2: 'th bl',
    mkPens2: 'th bl',
    usiaPensiun: '60 th',
    tempatLahir: 'GROBOGAN',
    tanggalLahir: '09-11-1967',
    agama: 'Islam',
    jenisKelamin: 'Perempuan',
    tmtCpns: '30-11--0001',
    golongan: 'III/a',
    pangkat: 'Penata Muda',
    jenjangPendidikan: 'S-1/Sarjana',
    jurusanPendidikan: 'S-1 PGSD',
    namaSekolah: 'UNIVERSITAS TERBUKA',
    instansiSubUnit: 'SDN 2 Cingkrong-',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Guru Ahli Pertama',
    rumpunJabatan: 'Guru',
    batasUsiaPensiun: '01-12-2027',
    linkFoto: ''
  },
  {
    no: '91',
    nama: 'SUKINEM, S.Pd',
    nip: '196710171994022001',
    mkGol: '28 th 08 bl',
    mkPns: '33 th 8 bl',
    mkPens: '33 th 9 bl',
    mkGol2: '27 th 08 bl',
    mkPns2: '32 th 8 bl',
    mkPens2: '32 th 9 bl',
    usiaPensiun: '60 th',
    tempatLahir: 'GROBOGAN',
    tanggalLahir: '17-10-1967',
    agama: 'Islam',
    jenisKelamin: 'Perempuan',
    tmtCpns: '01-02-1994',
    golongan: 'IV/b',
    pangkat: 'Pembina Tingkat I',
    jenjangPendidikan: 'S-1/Sarjana',
    jurusanPendidikan: 'S-1 BIMBINGAN DAN KONSELING',
    namaSekolah: 'UNIVERSITAS SLAMET RIYADI SURAKARTA',
    instansiSubUnit: 'SDN 1 Kalongan-',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Guru Ahli Madya',
    rumpunJabatan: 'Guru',
    batasUsiaPensiun: '01-11-2027',
    linkFoto: ''
  },
  {
    no: '148',
    nama: 'SUSILOWATI, S.Pd.SD',
    nip: '196704222006042005',
    mkGol: '16 th 00 bl',
    mkPns: '21 th 0 bl',
    mkPens: '21 th 1 bl',
    mkGol2: '15 th 06 bl',
    mkPns2: '20 th 6 bl',
    mkPens2: '20 th 7 bl',
    usiaPensiun: '60 th',
    tempatLahir: 'GROBOGAN',
    tanggalLahir: '22-04-1967',
    agama: 'Islam',
    jenisKelamin: 'Perempuan',
    tmtCpns: '01-04-2006',
    golongan: 'III/c',
    pangkat: 'Penata',
    jenjangPendidikan: 'S-1/Sarjana',
    jurusanPendidikan: 'S-1 PENDIDIKAN GURU SEKOLAH DASAR',
    namaSekolah: 'UNIVERSITAS TERBUKA',
    instansiSubUnit: 'SDN 1 Kedungrejo-',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Guru Ahli Muda',
    rumpunJabatan: 'Guru',
    batasUsiaPensiun: '01-05-2027',
    linkFoto: ''
  },
  {
    no: '171',
    nama: 'Dra. RUSMINI',
    nip: '196612021992032008',
    mkGol: '29 th 09 bl',
    mkPns: '34 th 9 bl',
    mkPens: '34 th 10 bl',
    mkGol2: '29 th 07 bl',
    mkPns2: '34 th 7 bl',
    mkPens2: '34 th 8 bl',
    usiaPensiun: '60 th',
    tempatLahir: 'GROBOGAN',
    tanggalLahir: '02-12-1966',
    agama: 'Islam',
    jenisKelamin: 'Perempuan',
    tmtCpns: '01-03-1992',
    golongan: 'IV/b',
    pangkat: 'Pembina Tingkat I',
    jenjangPendidikan: 'S-1/Sarjana',
    jurusanPendidikan: 'S-1 KURIKULUM DAN TEKNOLOGI PENDIDIKAN',
    namaSekolah: 'UNIVERSITAS MUHAMMADIYAH SURAKARTA',
    instansiSubUnit: 'SDN 1 Kuripan-',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Guru Ahli Madya',
    rumpunJabatan: 'Guru',
    batasUsiaPensiun: '01-01-2027',
    linkFoto: ''
  },
  {
    no: '222',
    nama: 'NURIMIN, S.Pd',
    nip: '196709261992091001',
    mkGol: '30 th 00 bl',
    mkPns: '35 th 0 bl',
    mkPens: '35 th 1 bl',
    mkGol2: '29 th 01 bl',
    mkPns2: '34 th 1 bl',
    mkPens2: '34 th 2 bl',
    usiaPensiun: '60 th',
    tempatLahir: 'GROBOGAN',
    tanggalLahir: '26-09-1967',
    agama: 'Islam',
    jenisKelamin: 'Laki-laki',
    tmtCpns: '01-09-1992',
    golongan: 'IV/a',
    pangkat: 'Pembina',
    jenjangPendidikan: 'S-1/Sarjana',
    jurusanPendidikan: 'S-1 PENDIDIKAN PMP DAN KEWARGANEGARAAN',
    namaSekolah: 'IKIP VETERAN JAWA TENGAH',
    instansiSubUnit: 'SDN 2 Nambuhan-',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Guru Ahli Madya',
    rumpunJabatan: 'Guru',
    batasUsiaPensiun: '01-10-2027',
    linkFoto: ''
  },
  {
    no: '244',
    nama: 'D SRI WAHYUNI, S.Pd., M.Pd.',
    nip: '196612031987032003',
    mkGol: '34 th 09 bl',
    mkPns: '39 th 9 bl',
    mkPens: '39 th 10 bl',
    mkGol2: '34 th 07 bl',
    mkPns2: '39 th 7 bl',
    mkPens2: '39 th 8 bl',
    usiaPensiun: '60 th',
    tempatLahir: 'GROBOGAN',
    tanggalLahir: '03-12-1966',
    agama: 'Katholik',
    jenisKelamin: 'Perempuan',
    tmtCpns: '01-03-1987',
    golongan: 'IV/c',
    pangkat: 'Pembina Utama Muda',
    jenjangPendidikan: 'S-2',
    jurusanPendidikan: 'S-2 PENDIDIKAN BAHASA INDONESIA',
    namaSekolah: 'UNS SURAKARTA',
    instansiSubUnit: 'SDN 1 Ngembak-',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Guru Ahli Madya',
    rumpunJabatan: 'Guru',
    batasUsiaPensiun: '01-01-2027',
    linkFoto: ''
  },
  {
    no: '245',
    nama: 'TRIYAT, S.Pd.',
    nip: '196704022022212002',
    mkGol: '20 th 03 bl',
    mkPns: 'th bl',
    mkPens: 'th bl',
    mkGol2: '20 th 09 bl',
    mkPns2: 'th bl',
    mkPens2: 'th bl',
    usiaPensiun: '60 th',
    tempatLahir: 'GROBOGAN',
    tanggalLahir: '02-04-1967',
    agama: 'Islam',
    jenisKelamin: 'Perempuan',
    tmtCpns: '30-11--0001',
    golongan: 'III/a',
    pangkat: 'Penata Muda',
    jenjangPendidikan: 'S-1/Sarjana',
    jurusanPendidikan: 'S-1 PENDIDIKAN GURU SEKOLAH DASAR',
    namaSekolah: 'UNIVERSITAS TERBUKA',
    instansiSubUnit: 'SDN 1 Ngembak-',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Guru Ahli Pertama',
    rumpunJabatan: 'Guru',
    batasUsiaPensiun: '01-05-2027',
    linkFoto: ''
  },
  {
    no: '288',
    nama: 'SRI SOELASTRI, S.Pd., M.Pd.',
    nip: '196701311991032006',
    mkGol: '30 th 10 bl',
    mkPns: '35 th 10 bl',
    mkPens: '35 th 11 bl',
    mkGol2: '30 th 07 bl',
    mkPns2: '35 th 7 bl',
    mkPens2: '35 th 8 bl',
    usiaPensiun: '60 th',
    tempatLahir: 'GROBOGAN',
    tanggalLahir: '31-01-1967',
    agama: 'Islam',
    jenisKelamin: 'Perempuan',
    tmtCpns: '01-03-1991',
    golongan: 'IV/c',
    pangkat: 'Pembina Utama Muda',
    jenjangPendidikan: 'S-2',
    jurusanPendidikan: 'S-2 TEKNOLOGI PENDIDIKAN',
    namaSekolah: 'UNS SURAKARTA',
    instansiSubUnit: 'SDN 1 Ngraji-',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Guru Ahli Madya',
    rumpunJabatan: 'Guru',
    batasUsiaPensiun: '01-02-2027',
    linkFoto: ''
  },
  {
    no: '327',
    nama: 'PURWATI, S.Pd.',
    nip: '196709252005012005',
    mkGol: '17 th 08 bl',
    mkPns: '22 th 8 bl',
    mkPens: '19 th 9 bl',
    mkGol2: '16 th 09 bl',
    mkPns2: '21 th 9 bl',
    mkPens2: '18 th 10 bl',
    usiaPensiun: '60 th',
    tempatLahir: 'PURWODADI',
    tanggalLahir: '25-09-1967',
    agama: 'Islam',
    jenisKelamin: 'Perempuan',
    tmtCpns: '01-01-2005',
    golongan: 'III/d',
    pangkat: 'Penata Tingkat I',
    jenjangPendidikan: 'S-1/Sarjana',
    jurusanPendidikan: 'S-1 PENDIDIKAN BAHASA DAN SASTRA DAERAH',
    namaSekolah: '',
    instansiSubUnit: 'SDN 1 Pulorejo-',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Guru Ahli Muda',
    rumpunJabatan: 'Guru',
    batasUsiaPensiun: '01-10-2027',
    linkFoto: ''
  },
  {
    no: '379',
    nama: 'MAFTUKIN, S.Pd.SD',
    nip: '196709011988101002',
    mkGol: '33 th 11 bl',
    mkPns: '38 th 11 bl',
    mkPens: '39 th 0 bl',
    mkGol2: '33 th 00 bl',
    mkPns2: '38 th 0 bl',
    mkPens2: '38 th 1 bl',
    usiaPensiun: '60 th',
    tempatLahir: 'GROBOGAN',
    tanggalLahir: '01-09-1967',
    agama: 'Islam',
    jenisKelamin: 'Laki-laki',
    tmtCpns: '01-10-1988',
    golongan: 'IV/b',
    pangkat: 'Pembina Tingkat I',
    jenjangPendidikan: 'S-1/Sarjana',
    jurusanPendidikan: 'S-1 PENDIDIKAN GURU SEKOLAH DASAR (PGSD)',
    namaSekolah: 'UNIVERSITAS TERBUKA JAKARTA',
    instansiSubUnit: 'SDN 4 Purwodadi-',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Guru Ahli Madya',
    rumpunJabatan: 'Guru',
    batasUsiaPensiun: '01-10-2027',
    linkFoto: ''
  },
  {
    no: '396',
    nama: 'SRI UTAMI, S.Pd.SD',
    nip: '196711031991032009',
    mkGol: '31 th 08 bl',
    mkPns: '36 th 8 bl',
    mkPens: '36 th 9 bl',
    mkGol2: '30 th 07 bl',
    mkPns2: '35 th 7 bl',
    mkPens2: '35 th 8 bl',
    usiaPensiun: '60 th',
    tempatLahir: 'BOYOLALI',
    tanggalLahir: '03-11-1967',
    agama: 'Islam',
    jenisKelamin: 'Perempuan',
    tmtCpns: '01-03-1991',
    golongan: 'IV/b',
    pangkat: 'Pembina Tingkat I',
    jenjangPendidikan: 'S-1/Sarjana',
    jurusanPendidikan: 'S-1 PENDIDIKAN GURU SEKOLAH DASAR (PGSD)',
    namaSekolah: 'UNIVERSITAS TERBUKA',
    instansiSubUnit: 'SDN 5 Purwodadi-',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Guru Ahli Madya',
    rumpunJabatan: 'Guru',
    batasUsiaPensiun: '01-12-2027',
    linkFoto: ''
  },
  {
    no: '412',
    nama: 'KASMIATI, S.Pd.SD',
    nip: '196708171992012002',
    mkGol: '30 th 07 bl',
    mkPns: '35 th 7 bl',
    mkPens: '35 th 8 bl',
    mkGol2: '29 th 09 bl',
    mkPns2: '34 th 9 bl',
    mkPens2: '34 th 10 bl',
    usiaPensiun: '60 th',
    tempatLahir: 'GROBOGAN',
    tanggalLahir: '17-08-1967',
    agama: 'Katholik',
    jenisKelamin: 'Perempuan',
    tmtCpns: '01-01-1992',
    golongan: 'IV/c',
    pangkat: 'Pembina Utama Muda',
    jenjangPendidikan: 'S-1/Sarjana',
    jurusanPendidikan: 'S-1 PENDIDIKAN GURU SEKOLAH DASAR',
    namaSekolah: 'UNIVERSITAS TERBUKA SEMARANG',
    instansiSubUnit: 'SDN 8 Purwodadi-',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Guru Ahli Madya',
    rumpunJabatan: 'Guru',
    batasUsiaPensiun: '01-09-2027',
    linkFoto: ''
  },
  {
    no: '420',
    nama: 'TJATUR PRIJANTO ADI, S.Pd.',
    nip: '196612241988101001',
    mkGol: '33 th 02 bl',
    mkPns: '38 th 2 bl',
    mkPens: '38 th 3 bl',
    mkGol2: '33 th 00 bl',
    mkPns2: '38 th 0 bl',
    mkPens2: '38 th 1 bl',
    usiaPensiun: '60 th',
    tempatLahir: 'PENAWANGAN',
    tanggalLahir: '24-12-1966',
    agama: 'Islam',
    jenisKelamin: 'Laki-laki',
    tmtCpns: '01-10-1988',
    golongan: 'IV/b',
    pangkat: 'Pembina Tingkat I',
    jenjangPendidikan: 'S-1/Sarjana',
    jurusanPendidikan: 'S-1 BIMBINGAN DAN KONSELING',
    namaSekolah: 'IKIP PGRI WATES',
    instansiSubUnit: 'SDN 9 Purwodadi-',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Guru Ahli Madya',
    rumpunJabatan: 'Guru',
    batasUsiaPensiun: '01-01-2027',
    linkFoto: ''
  },
  {
    no: '446',
    nama: 'ISTIQOMATUN NAFI`AH, S.Pd.',
    nip: '196707041992012001',
    mkGol: '30 th 06 bl',
    mkPns: '35 th 6 bl',
    mkPens: '35 th 7 bl',
    mkGol2: '29 th 09 bl',
    mkPns2: '34 th 9 bl',
    mkPens2: '34 th 10 bl',
    usiaPensiun: '60 th',
    tempatLahir: 'GROBOGAN',
    tanggalLahir: '04-07-1967',
    agama: 'Islam',
    jenisKelamin: 'Perempuan',
    tmtCpns: '01-01-1992',
    golongan: 'IV/c',
    pangkat: 'Pembina Utama Muda',
    jenjangPendidikan: 'S-1/Sarjana',
    jurusanPendidikan: 'S-1 PENDIDIKAN GURU SEKOLAH DASAR',
    namaSekolah: 'UNIVERSITAS TERBUKA',
    instansiSubUnit: 'SDN 12 Purwodadi-',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Guru Ahli Madya',
    rumpunJabatan: 'Guru',
    batasUsiaPensiun: '01-08-2027',
    linkFoto: ''
  },
  {
    no: '447',
    nama: 'SUPRIYADI, S.Pd',
    nip: '196711192000031003',
    mkGol: '22 th 08 bl',
    mkPns: '27 th 8 bl',
    mkPens: '27 th 9 bl',
    mkGol2: '21 th 07 bl',
    mkPns2: '26 th 7 bl',
    mkPens2: '26 th 8 bl',
    usiaPensiun: '60 th',
    tempatLahir: 'GROBOGAN',
    tanggalLahir: '19-11-1967',
    agama: 'Islam',
    jenisKelamin: 'Laki-laki',
    tmtCpns: '01-03-2000',
    golongan: 'III/d',
    pangkat: 'Penata Tingkat I',
    jenjangPendidikan: 'S-1/Sarjana',
    jurusanPendidikan: 'S-1 PENDIDIKAN KEPELATIHAN OLAHRAGA',
    namaSekolah: 'UNIVERSITAS TUNAS PEMBANGUNAN SURAKARTA (UTP)',
    instansiSubUnit: 'SDN 12 Purwodadi-',
    jenisJabatan: 'Fungsional Tertentu',
    jabatan: 'Guru Ahli Muda',
    rumpunJabatan: 'Guru',
    batasUsiaPensiun: '01-12-2027',
    linkFoto: ''
  }
];

export function getLocalPurnaTugasCache(): PurnaTugasPegawai[] {
  try {
    const raw = localStorage.getItem(PURNA_TUGAS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Gagal membaca cache Purna Tugas:', e);
  }
  return FALLBACK_PURNA_TUGAS;
}

export async function fetchPurnaTugasFromSheet(): Promise<PurnaTugasPegawai[]> {
  try {
    const res = await fetch(PURNA_TUGAS_CSV_URL, {
      method: 'GET',
      cache: 'no-cache',
    });

    if (!res.ok) {
      throw new Error(`Gagal mengunduh spreadsheet purna tugas (Status ${res.status})`);
    }

    const csvText = await res.text();
    if (!csvText || csvText.trim().length === 0) {
      throw new Error('Data spreadsheet purna tugas kosong');
    }

    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      throw new Error('Baris CSV spreadsheet tidak terbaca');
    }

    // Deteksi baris header (mencari baris yang mengandung 'NIP' atau 'NAMA')
    let headerRowIdx = rows.findIndex((row) =>
      row.some((col) => col && (col.trim().toUpperCase() === 'NIP' || col.trim().toUpperCase() === 'NAMA'))
    );

    if (headerRowIdx === -1) {
      headerRowIdx = 0;
    }

    const items: PurnaTugasPegawai[] = [];

    for (let i = headerRowIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      // Kolom A = index 0 (NO)
      // Kolom B = index 1 (NAMA)
      // Kolom C = index 2 (NIP)
      const nama = (row[1] || '').trim();
      const nip = (row[2] || '').trim();

      // Lewati baris kosong atau baris judul berulang
      if (!nama || !nip || nama.toUpperCase().includes('DAFTAR NOMINATIF') || nama.toUpperCase().includes('NAMA')) {
        continue;
      }

      items.push({
        no: (row[0] || `${i}`).trim(),
        nama,
        nip,
        mkGol: (row[3] || '-').trim(),
        mkPns: (row[4] || '-').trim(),
        mkPens: (row[5] || '-').trim(),
        mkGol2: (row[6] || '-').trim(),
        mkPns2: (row[7] || '-').trim(),
        mkPens2: (row[8] || '-').trim(),
        usiaPensiun: (row[9] || '-').trim(),
        tempatLahir: (row[10] || '-').trim(),
        tanggalLahir: (row[11] || '-').trim(),
        agama: (row[12] || '-').trim(),
        jenisKelamin: (row[13] || '-').trim(),
        tmtCpns: (row[14] || '-').trim(),
        golongan: (row[15] || '-').trim(),
        pangkat: (row[16] || '-').trim(),
        jenjangPendidikan: (row[17] || '-').trim(),
        jurusanPendidikan: (row[18] || '-').trim(),
        namaSekolah: (row[19] || '-').trim(),
        instansiSubUnit: (row[20] || '-').trim(),
        jenisJabatan: (row[21] || '-').trim(),
        jabatan: (row[22] || '-').trim(),
        rumpunJabatan: (row[23] || '-').trim(),
        batasUsiaPensiun: (row[24] || '-').trim(),
        linkFoto: (row[25] || '').trim()
      });
    }

    if (items.length > 0) {
      try {
        localStorage.setItem(PURNA_TUGAS_CACHE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn('Gagal menyimpan cache purna tugas:', e);
      }
      return items;
    }

    return getLocalPurnaTugasCache();
  } catch (err) {
    console.warn('Gagal fetch live purna tugas dari Google Spreadsheet, menggunakan cache fallback:', err);
    return getLocalPurnaTugasCache();
  }
}
