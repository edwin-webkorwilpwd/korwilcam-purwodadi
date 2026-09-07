import { 
  OfficeProfile, 
  School, 
  NewsArticle, 
  Announcement, 
  AgendaEvent, 
  DocumentDownload, 
  GalleryItem, 
  StaffProfile,
  ComplaintMessage 
} from '../types';

export const initialOfficeProfile: OfficeProfile = {
  name: "Kantor Korwilcam Bidang Pendidikan Purwodadi",
  tagline: "Mewujudkan Pendidikan Dasar dan Usia Dini yang Berkarakter, Unggul, Inklusif, dan Merdeka Belajar",
  address: "Jl. Jenderal Sudirman No. 42, Purwodadi, Kabupaten Grobogan, Jawa Tengah 58111",
  phone: "(0292) 421098",
  whatsapp: "0812-3456-7890",
  email: "korwilcampurwodadi.pendidikan@gmail.com",
  workingHours: "Senin - Kamis: 07.30 - 16.00 WIB | Jumat: 07.30 - 15.00 WIB",
  korwilName: "Drs. H. Bambang Sujarwo, M.Pd.",
  korwilNip: "19710815 199603 1 004",
  korwilPhoto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600",
  greetingTitle: "Selamat Datang di Portal Resmi Korwilcam Bidang Pendidikan Purwodadi",
  greetingText: "Assalamu’alaikum Warahmatullahi Wabarakatuh, Salam Sejahtera, Om Swastiastu, Namo Buddhaya, Salam Kebajikan, Rahayu. Puji syukur kita panjatkan ke hadirat Tuhan Yang Maha Esa. Melalui kehadiran website ini, kami berkomitmen menghadirkan layanan informasi yang transparan, akuntabel, dan ramah masyarakat. Korwilcam Purwodadi terus berikhtiar mendampingi sekolah jenjang SD, TK, dan PAUD untuk melahirkan generasi penerus bangsa yang berakhlak mulia, cerdas, berwawasan global, dan berakar pada nilai-nilai luhur Pancasila. Mari kita bersinergi demi kemajuan pendidikan anak-anak kita.",
  vision: "Terwujudnya Generasi Purwodadi yang Berkarakter Pancasila, Unggul dalam Prestasi, Mandiri, dan Berbudaya melalui Layanan Pendidikan SD, TK, dan PAUD yang Inklusif dan Berkualitas.",
  missions: [
    "Meningkatkan aksesibilitas dan pemerataan mutu pendidikan di seluruh satuan PAUD, TK, dan SD se-Kecamatan Purwodadi.",
    "Mengoptimalkan kompetensi profesional guru dan tenaga kependidikan melalui pembinaan berkelanjutan dan komunitas belajar.",
    "Mengembangkan iklim sekolah yang aman, ramah anak, berwawasan lingkungan, dan bebas dari perundungan.",
    "Memperkuat implementasi Kurikulum Merdeka yang kontekstual, adaptif terhadap teknologi, dan berpusat pada murid.",
    "Membangun tata kelola birokrasi pendidikan yang transparan, akuntabel, partisipatif, dan berbasis digital."
  ],
  heroBadge: "Portal Resmi Pendidikan Kecamatan Purwodadi",
  heroTitle: "Mewujudkan Fondasi Generasi Emas SD, TK, & PAUD di Purwodadi",
  heroSubtitle: "Selamat datang di pusat informasi dan layanan terpadu Kantor Korwilcam Purwodadi. Kami hadir mendampingi seluruh satuan pendidikan dasar dan anak usia dini demi terciptanya proses belajar yang merdeka, aman, berkarakter, dan berprestasi.",
  korwilQuote: "Pendidikan bukan sekadar transfer ilmu, melainkan menuntun kodrat anak agar mereka selamat dan bahagia setinggi-tingginya sebagai manusia dan anggota masyarakat."
};

export const initialSchools: School[] = [
  {
    id: "sch-01",
    name: "SD Negeri 1 Purwodadi",
    level: "SD",
    status: "Negeri",
    npsn: "20313001",
    akreditasi: "A",
    headmaster: "Sri Wahyuni, S.Pd., M.Pd.",
    address: "Jl. MT Haryono No. 12, Purwodadi",
    desa: "Purwodadi",
    studentsCount: 384,
    teachersCount: 22,
    phone: "(0292) 421101",
    email: "sdn1purwodadi@sekolah.sch.id",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    id: "sch-02",
    name: "SD Negeri 3 Purwodadi",
    level: "SD",
    status: "Negeri",
    npsn: "20313003",
    akreditasi: "A",
    headmaster: "H. Sukamto, S.Pd., M.Si.",
    address: "Jl. Ahmad Yani No. 58, Purwodadi",
    desa: "Purwodadi",
    studentsCount: 310,
    teachersCount: 19,
    phone: "(0292) 421103",
    email: "sdn3purwodadi@sekolah.sch.id",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    id: "sch-03",
    name: "SD Islam Terpadu Al-Firdaus",
    level: "SD",
    status: "Swasta",
    npsn: "20313045",
    akreditasi: "A",
    headmaster: "Ahmad Fauzi, S.Pd.I.",
    address: "Jl. Diponegoro No. 88, Purwodadi",
    desa: "Kuripan",
    studentsCount: 420,
    teachersCount: 28,
    phone: "(0292) 422055",
    email: "sdit.alfirdaus.pwd@gmail.com",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    id: "sch-04",
    name: "SD Negeri 2 Danyang",
    level: "SD",
    status: "Negeri",
    npsn: "20313012",
    akreditasi: "B",
    headmaster: "Eni Lestari, S.Pd.",
    address: "Jl. Danyang - Kuwu KM 2, Purwodadi",
    desa: "Danyang",
    studentsCount: 215,
    teachersCount: 14,
    phone: "(0292) 423112",
    email: "sdn2danyang@gmail.com",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    id: "sch-05",
    name: "TK Negeri Pembina Purwodadi",
    level: "TK",
    status: "Negeri",
    npsn: "20360001",
    akreditasi: "A",
    headmaster: "Dra. Hj. Tri Rahayu",
    address: "Jl. Bhayangkara No. 05, Purwodadi",
    desa: "Purwodadi",
    studentsCount: 145,
    teachersCount: 12,
    phone: "(0292) 424001",
    email: "tkn.pembina.purwodadi@gmail.com",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    id: "sch-06",
    name: "TK Pertiwi 01 Purwodadi",
    level: "TK",
    status: "Swasta",
    npsn: "20360015",
    akreditasi: "A",
    headmaster: "Siti Nurjanah, S.Pd.AUD",
    address: "Jl. Gatot Subroto No. 24, Purwodadi",
    desa: "Kalongan",
    studentsCount: 110,
    teachersCount: 9,
    phone: "(0292) 424015",
    email: "tkpertiwi1purwodadi@gmail.com",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    id: "sch-07",
    name: "TK Aisyiyah Bustanul Athfal 1",
    level: "TK",
    status: "Swasta",
    npsn: "20360022",
    akreditasi: "B",
    headmaster: "Nur Hidayati, S.Pd.",
    address: "Jl. KH. Ahmad Dahlan No. 17, Purwodadi",
    desa: "Purwodadi",
    studentsCount: 95,
    teachersCount: 8,
    phone: "(0292) 424022",
    email: "aba1purwodadi@gmail.com",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    id: "sch-08",
    name: "PAUD Terpadu Mawar Ceria",
    level: "PAUD",
    status: "Swasta",
    npsn: "69850110",
    akreditasi: "A",
    headmaster: "Dewi Anggraini, S.Pd.",
    address: "Komplek Perumahan Griya Praja Mukti, Purwodadi",
    desa: "Kalongan",
    studentsCount: 68,
    teachersCount: 6,
    phone: "0852-9012-3344",
    email: "paudmawar.pwd@gmail.com",
    image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    id: "sch-09",
    name: "KB Tunas Bangsa Purwodadi",
    level: "PAUD",
    status: "Swasta",
    npsn: "69850125",
    akreditasi: "B",
    headmaster: "Endang Sulistyowati, S.Pd.",
    address: "Jl. Cempaka Putih No. 09, Purwodadi",
    desa: "Kandangan",
    studentsCount: 52,
    teachersCount: 5,
    phone: "0813-2890-4455",
    email: "kbtunasbangsa.pwd@gmail.com",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800",
    featured: false
  }
];

export const initialNews: NewsArticle[] = [
  {
    id: "news-01",
    title: "Rakor Pemantapan Persiapan Asesmen Nasional (ANBK) Jenjang SD se-Kecamatan Purwodadi",
    slug: "rakor-pemantapan-anbk-sd-purwodadi",
    category: "Kedinasan",
    summary: "Korwilcam Purwodadi menyelenggarakan rapat koordinasi bersama seluruh Kepala SD Negeri dan Swasta guna memastikan kesiapan sarana chromebook, jaringan internet, dan proktor.",
    content: `Purwodadi — Bertempat di Aula Kantor Korwilcam Bidang Pendidikan Kecamatan Purwodadi, telah diselenggarakan Rapat Koordinasi (Rakor) Pemantapan Kesiapan Asesmen Nasional Berbasis Komputer (ANBK) Jenjang Sekolah Dasar. Acara ini dihadiri oleh 48 Kepala SD Negeri dan Swasta se-Kecamatan Purwodadi beserta jajaran Pengawas Sekolah.

Koordinator Wilayah, Drs. H. Bambang Sujarwo, M.Pd., dalam arahannya menegaskan bahwa ANBK bukan sekadar tes evaluasi siswa, melainkan cermin dari potret mutu pembelajaran dan lingkungan belajar di masing-masing satuan pendidikan.

"Kami minta seluruh kepala sekolah mengawal penuh kesiapan infrastruktur pendukung, mulai dari ketersediaan chromebook bantuan pemerintah, kestabilan jaringan internet, hingga kesiapan genset untuk mengantisipasi kendala kelistrikan," terang beliau.

Pengawas SD, Drs. Sutrisno, M.Pd., menambahkan materi teknis terkait pelaksanaan gladi bersih dan sinkronisasi data simulasi ANBK. Diharapkan seluruh sekolah dapat melaksanakan kegiatan secara mandiri dengan hasil yang optimal.`,
    author: "Humas Korwilcam Purwodadi",
    date: "28 Agustus 2026",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000",
    views: 642,
    isPinned: true,
    tags: ["ANBK", "SD", "Rapat Koordinasi", "Pendidikan"]
  },
  {
    id: "news-02",
    title: "Semarak Gebyar PAUD & Peringatan Hari Anak Nasional: Mengasah Kreativitas Sejak Dini",
    slug: "gebyar-paud-hari-anak-nasional-purwodadi",
    category: "TK/PAUD",
    summary: "Ratusan peserta didik dari jenjang PAUD dan TK se-Kecamatan Purwodadi antusias mengikuti lomba mewarnai, gerak lagu ceria, dan parade busana adat nusantara.",
    content: `Purwodadi — Lapangan Simpang Lima Purwodadi dibanjiri tawa dan keriangan anak-anak dalam perhelatan Gebyar PAUD & TK tingkat Kecamatan Purwodadi. Kegiatan yang digagas oleh IGTKI dan HIMPAUDI di bawah naungan Korwilcam ini mengusung tema 'Anak Terlindungi, Indonesia Maju'.

Sebanyak lebih dari 600 anak usia dini berpartisipasi dalam aneka lomba edukatif, antara lain lomba kolase bersama orang tua, gerak dan lagu profil pelajar Pancasila, serta pembacaan doa pendek.

Penilik PAUD Korwilcam Purwodadi, Siti Khotimah, S.Pd., menyampaikan apresiasi yang setinggi-tingginya kepada seluruh pendidik PAUD dan wali murid yang kompak mendukung tumbuhnya fondasi emas anak-anak Purwodadi. "Pendidikan usia dini merupakan masa keemasan (golden age) yang membutuhkan stimulus kasih sayang dan kegembiraan, bukan tekanan akademik yang memberatkan," tutur Siti.`,
    author: "Tim Redaksi PAUD",
    date: "20 Agustus 2026",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=1000",
    views: 489,
    isPinned: false,
    tags: ["PAUD", "TK", "Gebyar PAUD", "Kreativitas"]
  },
  {
    id: "news-03",
    title: "Membanggakan! Kontingen Siswa SD Purwodadi Raih Juara Umum FLS2N Tingkat Kabupaten",
    slug: "siswa-sd-purwodadi-juara-umum-fls2n",
    category: "Prestasi",
    summary: "Prestasi gemilang diraih siswa-siswi SD perwakilan Kecamatan Purwodadi yang sukses menyabet 4 medali emas pada cabang Menyanyi Solo, Tari Kreasi, Kriya Anyam, dan Gambar Bercerita.",
    content: `Grobogan — Prestasi membanggakan kembali ditorehkan oleh generasi muda Kecamatan Purwodadi. Pada gelaran Festival dan Lomba Seni Siswa Nasional (FLS2N) Jenjang SD Tingkat Kabupaten yang dihelat pekan lalu, kontingen Korwilcam Purwodadi dinobatkan sebagai Juara Umum.

Perolehan medali emas disumbangkan oleh siswa dari SDN 1 Purwodadi untuk cabang Kriya Anyam, SD IT Al-Firdaus untuk Gambar Bercerita, dan SDN 3 Purwodadi untuk Menyanyi Solo.

Korwilcam Purwodadi menyampaikan rasa bangga dan memberikan sertifikat penghargaan serta tali asih kepada para pembina dan siswa berprestasi. Para pemenang ini selanjutnya akan mewakili kabupaten ke tingkat Provinsi Jawa Tengah.`,
    author: "Seksi Kesiswaan & Bakat",
    date: "14 Agustus 2026",
    image: "https://images.unsplash.com/photo-1569783721739-16a7f5024443?auto=format&fit=crop&q=80&w=1000",
    views: 812,
    isPinned: true,
    tags: ["Prestasi", "FLS2N", "Seni Budaya", "SD"]
  },
  {
    id: "news-04",
    title: "Workshop Optimalisasi Komunitas Belajar (Kombel) Guru SD dan Implementasi PMM",
    slug: "workshop-kombel-guru-sd-pmm",
    category: "SD",
    summary: "Guna mempercepat pemanfaatan Platform Merdeka Mengajar (PMM), Korwilcam menggelar bimtek intensif bagi guru kelas dan kepala sekolah di Gedung KKG Purwodadi.",
    content: `Purwodadi — Komunitas Belajar (Kombel) memiliki peran strategis dalam menuntun para guru berkolaborasi memecahkan tantangan riil di ruang kelas. Menindaklanjuti hal tersebut, Korwilcam Purwodadi menghelat 'Workshop Penguatan Komunitas Belajar Antarsekolah dan Pemanfaatan PMM Berkelanjutan'.

Pelatihan ini memfasilitasi pendidik dalam merancang modul ajar berdiferensiasi, membuat aksi nyata PMM yang lolos kurasi, serta menyusun asesmen formatif yang ramah anak. Para peserta sangat antusias mengikuti praktik langsung pembuatan konten refleksi pembelajaran.`,
    author: "Tim Kurikulum & GTK",
    date: "05 Agustus 2026",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1000",
    views: 520,
    isPinned: false,
    tags: ["Kurikulum Merdeka", "KKG", "PMM", "Pelatihan Guru"]
  }
];

export const initialAnnouncements: Announcement[] = [
  {
    id: "ann-01",
    title: "Surat Edaran: Batas Akhir Sinkronisasi Dapodik Cut-Off Semester Ganjil TA 2026/2027",
    date: "01 September 2026",
    urgency: "Mendesak",
    target: "Semua Satuan",
    fileSize: "850 KB",
    summary: "Diberitahukan kepada seluruh Operator Satuan Pendidikan (SD, TK, PAUD) batas akhir validasi dan sinkronisasi data peserta didik dan PTK adalah 31 Agustus 2026 pukul 23.59 WIB."
  },
  {
    id: "ann-02",
    title: "Jadwal Pelaksanaan Asesmen Nasional Berbasis Komputer (ANBK) Jenjang SD",
    date: "25 Agustus 2026",
    urgency: "Penting",
    target: "SD",
    fileSize: "1.2 MB",
    summary: "Surat pemberitahuan jadwal gladi bersih gelombang 1 & 2 serta jadwal pelaksanaan utama ANBK jenjang SD se-Kecamatan Purwodadi."
  },
  {
    id: "ann-03",
    title: "Verifikasi Berkas Bantuan Operasional Pendidikan (BOP) PAUD & Kesetaraan Tahap II",
    date: "18 Agustus 2026",
    urgency: "Biasa",
    target: "TK/PAUD",
    fileSize: "620 KB",
    summary: "Pengumpulan berkas SPJ BOP PAUD Tahap I dan pengajuan pencairan Tahap II paling lambat diserahkan ke loket pelayanan Korwilcam tanggal 10 September 2026."
  }
];

export const initialAgenda: AgendaEvent[] = [
  {
    id: "agd-01",
    title: "Rapat Koordinasi Pengawas dan Kepala SD se-Purwodadi",
    date: "10 September 2026",
    time: "08.30 - 12.00 WIB",
    location: "Aula Utama Korwilcam Purwodadi",
    organizer: "Pengawas SD Purwodadi",
    targetAudience: "Kepala SD Negeri & Swasta",
    status: "Akan Datang"
  },
  {
    id: "agd-02",
    title: "Bimtek Peningkatan Literasi & Numerasi PAUD-SD Menyenangkan",
    date: "16 September 2026",
    time: "08.00 - 15.00 WIB",
    location: "Gedung Guru PGRI Purwodadi",
    organizer: "Pokja Transisi PAUD-SD",
    targetAudience: "Guru Kelas 1 SD & Pendidik TK B",
    status: "Akan Datang"
  },
  {
    id: "agd-03",
    title: "Pekan Olahraga Tradisional & Senam Sehat Bersama Pendidik Purwodadi",
    date: "25 September 2026",
    time: "06.30 - 10.30 WIB",
    location: "Alun-Alun Purwodadi",
    organizer: "KKGO Purwodadi",
    targetAudience: "Seluruh Pendidik & Tenaga Kependidikan",
    status: "Akan Datang"
  }
];

export const initialDocuments: DocumentDownload[] = [
  {
    id: "doc-01",
    title: "Panduan Pembelajaran dan Asesmen (PPA) Kurikulum Merdeka Edisi Revisi",
    category: "Kurikulum",
    fileType: "PDF",
    fileSize: "4.8 MB",
    downloadCount: 342,
    date: "15 Juli 2026",
    description: "Pedoman resmi pelaksanaan pembelajaran berdiferensiasi dan penyusunan asesmen formatif-sumatif untuk SD dan PAUD.",
    downloadUrl: "#"
  },
  {
    id: "doc-02",
    title: "Format Blanko Usulan Angka Kredit & SKP Guru (Format E-Kinerja BKN)",
    category: "Blanko GTK",
    fileType: "XLSX",
    fileSize: "1.2 MB",
    downloadCount: 528,
    date: "02 Agustus 2026",
    description: "Template Excel resmi untuk penyusunan target dan realisasi SKP tahunan guru SD dan PAUD/TK.",
    downloadUrl: "#"
  },
  {
    id: "doc-03",
    title: "Surat Edaran Kalender Pendidikan Kabupaten Grobogan TA 2026/2027",
    category: "Surat Edaran",
    fileType: "PDF",
    fileSize: "2.1 MB",
    downloadCount: 890,
    date: "01 Juli 2026",
    description: "Jadwal resmi hari efektif sekolah, jeda tengah semester, libur hari besar, dan pekan ujian semester.",
    downloadUrl: "#"
  },
  {
    id: "doc-04",
    title: "Juknis dan Pedoman Lomba O2SN dan FLS2N SD Tingkat Kecamatan",
    category: "Juknis Lomba",
    fileType: "PDF",
    fileSize: "3.5 MB",
    downloadCount: 415,
    date: "10 Agustus 2026",
    description: "Kriteria penilaian, syarat peserta, teknis cabang perlombaan, dan jadwal seleksi tingkat kecamatan.",
    downloadUrl: "#"
  },
  {
    id: "doc-05",
    title: "Blanko Formulir Permohonan Mutasi / Rekomendasi Siswa Antarsekolah",
    category: "Blanko GTK",
    fileType: "DOCX",
    fileSize: "450 KB",
    downloadCount: 671,
    date: "20 Juni 2026",
    description: "Format surat keterangan pindah sekolah jenjang TK dan SD untuk pengesahan Korwilcam.",
    downloadUrl: "#"
  }
];

export const initialGallery: GalleryItem[] = [
  {
    id: "gal-01",
    title: "Upacara Peringatan Hari Pendidikan Nasional Tingkat Kecamatan",
    category: "Upacara",
    date: "02 Mei 2026",
    image: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "Seluruh kepala sekolah dan perwakilan guru mengenakan busana adat daerah dalam upacara di halaman Korwilcam."
  },
  {
    id: "gal-02",
    title: "Kunjungan Monitoring Transisi PAUD ke SD yang Menyenangkan",
    category: "Kegiatan Belajar",
    date: "18 Juli 2026",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "Pengawas dan Penilik meninjau MPLS ramah anak di salah satu sekolah dasar dan TK terpadu."
  },
  {
    id: "gal-03",
    title: "Pentas Seni dan Festival Kreativitas Siswa Sekolah Dasar Purwodadi",
    category: "Lomba & Prestasi",
    date: "12 Agustus 2026",
    image: "https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "Penampilan tari tradisional kreasi baru yang memukau para penonton dan dewan juri."
  },
  {
    id: "gal-04",
    title: "Bimbingan Teknis Pengelolaan BOSP & Akuntansi Sekolah",
    category: "Rakor & Pelatihan",
    date: "22 Agustus 2026",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "Sesi tanya jawab bendahara sekolah bersama narasumber akuntabilitas keuangan daerah."
  },
  {
    id: "gal-05",
    title: "Keceriaan Anak-Anak PAUD Belajar Membaca Nyaring (Read Aloud)",
    category: "Kegiatan Belajar",
    date: "25 Agustus 2026",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "Stimulasi literasi dini melalui dongeng interaktif bersama bunda pendidik."
  },
  {
    id: "gal-06",
    title: "Penyerahan Trophy Pemenang Lomba Literasi & Numerasi Wilayah",
    category: "Lomba & Prestasi",
    date: "29 Agustus 2026",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "Koordinator Wilayah menyerahkan piala bergilir kepada sekolah peraih akumulasi poin tertinggi."
  }
];

export const initialStaff: StaffProfile[] = [
  {
    id: "st-01",
    name: "Drs. H. Bambang Sujarwo, M.Pd.",
    role: "Koordinator Wilayah Kecamatan",
    nip: "19710815 199603 1 004",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600",
    division: "Pimpinan"
  },
  {
    id: "st-02",
    name: "Drs. Sutrisno, M.Pd.",
    role: "Pengawas Sekolah Dasar Madya",
    nip: "19690312 199308 1 002",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
    division: "Pengawas SD"
  },
  {
    id: "st-03",
    name: "Hj. Endang Tri Wahyuni, M.Pd.",
    role: "Pengawas Sekolah Dasar Madya",
    nip: "19721104 199702 2 003",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
    division: "Pengawas SD"
  },
  {
    id: "st-04",
    name: "Siti Khotimah, S.Pd.AUD",
    role: "Penilik PAUD / PNF Ahli Muda",
    nip: "19760519 200312 2 006",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600",
    division: "Penilik PAUD/TK"
  },
  {
    id: "st-05",
    name: "Agus Prasetyo, S.AP.",
    role: "Kepala Sub Bagian Tata Usaha",
    nip: "19830214 200801 1 009",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
    division: "Tata Usaha"
  },
  {
    id: "st-06",
    name: "Budi Santoso, S.Kom.",
    role: "Pengelola Sistem Informasi & Dapodik",
    nip: "19900921 201503 1 003",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600",
    division: "Tata Usaha"
  }
];

export const initialComplaints: ComplaintMessage[] = [
  {
    id: "comp-01",
    name: "Drs. Joko Purnomo",
    phone: "0812-8877-6655",
    schoolOrOrigin: "SD Negeri 2 Danyang",
    category: "Konsultasi Layanan",
    message: "Mohon konfirmasi jadwal validasi berkas pencairan BOSP Tahap II untuk operator sekolah kami.",
    date: "02 September 2026",
    status: "Baru"
  },
  {
    id: "comp-02",
    name: "Ibu Ratna Dewi",
    phone: "0857-4433-2211",
    schoolOrOrigin: "Wali Murid TK Pertiwi",
    category: "Permohonan Informasi",
    message: "Apakah ada ketentuan zonasi terbaru untuk pendaftaran transisi PAUD ke SD Negeri tahun ajaran berikutnya?",
    date: "28 Agustus 2026",
    status: "Dibaca"
  }
];

