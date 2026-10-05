/**
 * Central Navigation Registry (Single Source of Truth)
 * 
 * Seluruh menu dan sub-menu yang ada di website didaftarkan di sini.
 * CMS "Pengaturan Menu" dan komponen Navigasi Publik (Navbar & Mobile Drawer)
 * secara dinamis mendeteksi dan mengonsumsi data dari konfigurasi ini.
 * 
 * Jika Anda menambah atau menghapus menu di sini:
 * 1. CMS "Pengaturan Menu" otomatis mendeteksi, menambah, atau menghapusnya.
 * 2. Super Admin dapat langsung mengontrol aktif/nonaktifnya tanpa ubah kode JSX.
 */

export interface NavigationSubItem {
  id: string;
  label: string;
  path: string;
  tab: string;
  description: string;
  badge?: string;
  defaultEnabled?: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  tab: string;
  description: string;
  iconName: string;
  defaultEnabled?: boolean;
  children?: NavigationSubItem[];
}

export type MenuVisibilityMap = Record<string, boolean>;

export const NAVIGATION_CONFIG: NavigationItem[] = [
  {
    id: 'home',
    label: 'Beranda',
    path: '/beranda',
    tab: 'home',
    description: 'Halaman Beranda utama, hero slide foto, sambutan kepala, statistik sekolah, pengumuman & agenda.',
    iconName: 'Home',
    defaultEnabled: true,
  },
  {
    id: 'profile',
    label: 'Profil',
    path: '/profil',
    tab: 'profile',
    description: 'Profil instansi Korwilcam Purwodadi, visi-misi, bagan organisasi, nominatif dan organisasi mitra.',
    iconName: 'ShieldCheck',
    defaultEnabled: true,
    children: [
      {
        id: 'profile.welcome',
        label: 'Sambutan & Visi Misi',
        path: '/profil#sambutan',
        tab: 'profile',
        description: 'Sambutan pimpinan Korwilcam, visi, misi, dan nilai dasar pelayanan.',
        defaultEnabled: true,
      },
      {
        id: 'profile.structure',
        label: 'Struktur Organisasi',
        path: '/profil#struktur',
        tab: 'profile',
        description: 'Bagan alur struktur organisasi serta daftar pejabat dan jajaran staf.',
        defaultEnabled: true,
      },
      {
        id: 'profile.nominative',
        label: 'Nominatif',
        path: '/profil#nominatif',
        tab: 'nominatif',
        description: 'Daftar nominatif pendidik dan tenaga kependidikan Korwilcam.',
        defaultEnabled: true,
      },
      {
        id: 'profile.organization',
        label: 'Organisasi',
        path: '/profil#organisasi',
        tab: 'organization',
        description: 'Halaman organisasi mitra dan profesi guru (PGRI, K3S, IGTKI, Himpaudi, dll.).',
        defaultEnabled: true,
      },
    ],
  },
  {
    id: 'sop-pelayanan',
    label: 'SOP',
    path: '/sop-pelayanan',
    tab: 'sop-pelayanan',
    description: 'Standar Operasional Prosedur (SOP) dan alur alur bagan pelayanan publik Korwilcam.',
    iconName: 'FileCheck',
    defaultEnabled: true,
  },
  {
    id: 'schools',
    label: 'Sekolah',
    path: '/sekolah',
    tab: 'schools',
    description: 'Pangkalan data direktori seluruh satuan pendidikan dasar (SD, TK, & KB) se-Kecamatan Purwodadi.',
    iconName: 'GraduationCap',
    defaultEnabled: true,
  },
  {
    id: 'karyaku',
    label: 'Karyaku',
    path: '/karyaku',
    tab: 'karyaku',
    description: 'Platform literasi digital, penerbitan dan etalase karya buku guru serta siswa.',
    iconName: 'BookOpen',
    defaultEnabled: true,
  },
  {
    id: 'news',
    label: 'Berita',
    path: '/berita',
    tab: 'news',
    description: 'Pusat publikasi informasi terkini, surat edaran, jadwal agenda kegiatan, dan prestasi.',
    iconName: 'BellRing',
    defaultEnabled: true,
    children: [
      {
        id: 'news.latest',
        label: 'Berita Terkini',
        path: '/berita',
        tab: 'news',
        description: 'Kumpulan artikel berita dan liputan kegiatan resmi pendidikan.',
        defaultEnabled: true,
      },
      {
        id: 'news.announcements',
        label: 'Pengumuman & Edaran',
        path: '/berita/pengumuman',
        tab: 'news',
        description: 'Surat edaran, pengumuman resmi dinas, dan berkas penting.',
        defaultEnabled: true,
      },
      {
        id: 'news.agenda',
        label: 'Agenda Kegiatan',
        path: '/berita/agenda',
        tab: 'news',
        description: 'Jadwal agenda acara wilayah dan pemakaian fasilitas aula.',
        defaultEnabled: true,
      },
      {
        id: 'news.achievements',
        label: 'Prestasi Siswa & Guru',
        path: '/berita/prestasi',
        tab: 'achievements',
        description: 'Etalase kejuaraan dan capaian membanggakan siswa serta pendidik.',
        defaultEnabled: true,
      },
    ],
  },
  {
    id: 'services',
    label: 'Layanan',
    path: '/layanan',
    tab: 'services',
    description: 'Pusat pelayanan administrasi terpadu online bagi pendidik, sekolah, dan masyarakat.',
    iconName: 'Briefcase',
    defaultEnabled: true,
    children: [
      {
        id: 'services.requirements',
        label: 'Persyaratan Pelayanan',
        path: '/layanan/persyaratan-pelayanan',
        tab: 'service-requirements',
        description: 'Daftar syarat kelengkapan berkas untuk setiap jenis layanan kedinasan.',
        defaultEnabled: true,
      },
      {
        id: 'services.downloads',
        label: 'Unduh Berkas',
        path: '/layanan/unduh-berkas',
        tab: 'downloads',
        description: 'Pusat unduhan formulir resmi, blanko surat, modul kurikulum, dan regulasi.',
        defaultEnabled: true,
      },
      {
        id: 'services.aula',
        label: 'Peminjaman Aula',
        path: '/layanan/peminjaman-aula',
        tab: 'service-aula',
        description: 'Formulir online permohonan penggunaan aula pertemuan Korwilcam.',
        defaultEnabled: true,
      },
      {
        id: 'services.cuti',
        label: 'Surat Cuti',
        path: '/layanan/surat-cuti',
        tab: 'service-cuti',
        description: 'Pengajuan dan administrasi surat cuti bagi guru dan tenaga kependidikan.',
        defaultEnabled: true,
      },
      {
        id: 'services.survey',
        label: 'Survey Pelayanan',
        path: '/layanan/survey-pelayanan',
        tab: 'service-survey',
        description: 'Kuisioner survei Indeks Kepuasan Masyarakat (IKM) atas layanan kantor.',
        defaultEnabled: true,
      },
      {
        id: 'services.data-request',
        label: 'Permintaan Data',
        path: '/layanan/permintaan-data',
        tab: 'service-permintaan-data',
        description: 'Layanan formulir permohonan data dan informasi kependidikan.',
        defaultEnabled: true,
      },
    ],
  },
  {
    id: 'gallery',
    label: 'Galeri',
    path: '/galeri',
    tab: 'gallery',
    description: 'Dokumentasi album foto dan liputan visual kegiatan pendidikan se-Kecamatan.',
    iconName: 'ImageIcon',
    defaultEnabled: true,
  },
  {
    id: 'contact',
    label: 'Kontak',
    path: '/kontak',
    tab: 'contact',
    description: 'Saluran komunikasi kantor, alamat, telepon, formulir aduan, dan tautan medsos resmi.',
    iconName: 'Phone',
    defaultEnabled: true,
    children: [
      {
        id: 'contact.office',
        label: 'Kontak & Pengaduan',
        path: '/kontak',
        tab: 'contact',
        description: 'Alamat kantor, nomor WhatsApp/telepon, email, dan kotak pengaduan.',
        defaultEnabled: true,
      },
      {
        id: 'contact.social',
        label: 'Sos Med',
        path: '/media-sosial',
        tab: 'social-media',
        description: 'Kumpulan tautan akun media sosial resmi Korwilcam Purwodadi.',
        defaultEnabled: true,
      },
    ],
  },
];

/**
 * Memeriksa apakah suatu menu atau submenu aktif
 * Default nilai adalah true (aktif) kecuali jika secara eksplisit diset ke false
 */
export function isItemActive(visibility: MenuVisibilityMap, id: string): boolean {
  if (!visibility) return true;
  return visibility[id] !== false;
}

/**
 * Memeriksa apakah menu induk (parent) harus ditampilkan di navbar
 * Syarat tampil:
 * 1. Menu induk itu sendiri tidak dinonaktifkan (visibility[parent.id] !== false)
 * 2. Jika memiliki anak (children), minimal ada 1 sub-menu yang masih aktif
 */
export function isParentActive(visibility: MenuVisibilityMap, parent: NavigationItem): boolean {
  if (!visibility) return true;
  if (visibility[parent.id] === false) return false;
  if (parent.children && parent.children.length > 0) {
    return parent.children.some((child) => isItemActive(visibility, child.id));
  }
  return true;
}

/**
 * Mengambil daftar sub-menu yang aktif saja untuk suatu menu induk
 */
export function getActiveChildren(visibility: MenuVisibilityMap, parent: NavigationItem): NavigationSubItem[] {
  if (!parent.children) return [];
  return parent.children.filter((child) => isItemActive(visibility, child.id));
}

/**
 * Menghitung statistik navigasi untuk keperluan CMS
 */
export function getNavigationStats(visibility: MenuVisibilityMap) {
  let totalParents = NAVIGATION_CONFIG.length;
  let activeParents = 0;
  let totalSubmenus = 0;
  let activeSubmenus = 0;

  for (const item of NAVIGATION_CONFIG) {
    const parentActive = isParentActive(visibility, item);
    if (parentActive) activeParents++;

    if (item.children) {
      totalSubmenus += item.children.length;
      for (const child of item.children) {
        if (isItemActive(visibility, child.id) && visibility[item.id] !== false) {
          activeSubmenus++;
        }
      }
    }
  }

  const totalAll = totalParents + totalSubmenus;
  const activeAll = activeParents + activeSubmenus;

  return {
    totalParents,
    activeParents,
    totalSubmenus,
    activeSubmenus,
    totalAll,
    activeAll,
    disabledCount: totalAll - activeAll,
  };
}
