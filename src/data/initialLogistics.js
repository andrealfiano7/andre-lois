// Data terstruktur untuk Modul Logistik & Perlengkapan Acara
// Tabel 1: List Barang di Hotel (Groom & Bride)
// Tabel 2: List Keperluan Holy Matrimony (Nama Barang & PIC)
// Hak Cipta: Andre & Lois

export const INITIAL_LOGISTICS_LIST = [
  // ==========================================
  // TABEL 1: LIST BARANG DI HOTEL - GROOM
  // ==========================================
  {
    id: 'log-hotel-g-1',
    category: 'hotel',
    subCategory: 'Groom',
    name: 'Setelan jas, kemeja dan dasi',
    pic: 'Groom',
    status: 'Belum',
    notes: 'Pastikan sudah disetrika uap & hanger siap',
    location: 'Kamar Hotel Groom'
  },
  {
    id: 'log-hotel-g-2',
    category: 'hotel',
    subCategory: 'Groom',
    name: 'Sepatu dan kaos kaki',
    pic: 'Groom',
    status: 'Belum',
    notes: 'Sepatu pantofel semir hitam & kaos kaki bersih',
    location: 'Kamar Hotel Groom'
  },
  {
    id: 'log-hotel-g-3',
    category: 'hotel',
    subCategory: 'Groom',
    name: 'Pomade, parfum',
    pic: 'Groom',
    status: 'Belum',
    notes: 'Untuk persiapan rambut & kesegaran selama acara',
    location: 'Kamar Hotel Groom'
  },
  {
    id: 'log-hotel-g-4',
    category: 'hotel',
    subCategory: 'Groom',
    name: 'Jam tangan',
    pic: 'Groom',
    status: 'Belum',
    notes: 'Aksesoris formal groom untuk foto detail',
    location: 'Kamar Hotel Groom'
  },
  {
    id: 'log-hotel-g-5',
    category: 'hotel',
    subCategory: 'Groom',
    name: 'Cincin',
    pic: 'Groom',
    status: 'Belum',
    notes: 'Cincin kawin & ring box untuk sesi flatlay/foto',
    location: 'Kamar Hotel Groom'
  },
  {
    id: 'log-hotel-g-6',
    category: 'hotel',
    subCategory: 'Groom',
    name: 'Corsage',
    pic: 'Groom',
    status: 'Belum',
    notes: 'Bunga saku jas pengantin pria',
    location: 'Kamar Hotel Groom'
  },

  // ==========================================
  // TABEL 1: LIST BARANG DI HOTEL - BRIDE
  // ==========================================
  {
    id: 'log-hotel-b-1',
    category: 'hotel',
    subCategory: 'Bride',
    name: 'Wedding robe',
    pic: 'Bride',
    status: 'Belum',
    notes: 'Dipakai saat sesi makeup & hair do pagi',
    location: 'Kamar Hotel Bride'
  },
  {
    id: 'log-hotel-b-2',
    category: 'hotel',
    subCategory: 'Bride',
    name: 'Wedding gown & Veil',
    pic: 'Bride',
    status: 'Belum',
    notes: 'Gaun pengantin utama & veil slayer',
    location: 'Kamar Hotel Bride'
  },
  {
    id: 'log-hotel-b-3',
    category: 'hotel',
    subCategory: 'Bride',
    name: 'Wedding shoes dan sendal',
    pic: 'Bride',
    status: 'Belum',
    notes: 'Sepatu heels utama + sendal ganti santai',
    location: 'Kamar Hotel Bride'
  },
  {
    id: 'log-hotel-b-4',
    category: 'hotel',
    subCategory: 'Bride',
    name: 'Set perhiasan (kalung, anting, gelang)',
    pic: 'Bride',
    status: 'Belum',
    notes: 'Perhiasan pengantin wanita untuk sesi foto detail',
    location: 'Kamar Hotel Bride'
  },
  {
    id: 'log-hotel-b-5',
    category: 'hotel',
    subCategory: 'Bride',
    name: 'Handbouquet',
    pic: 'Bride',
    status: 'Belum',
    notes: 'Buket bunga segar pengantin wanita',
    location: 'Kamar Hotel Bride'
  },

  // ==========================================
  // TABEL 2: LIST KEPERLUAN HOLY MATRIMONY
  // ==========================================
  {
    id: 'log-matrimony-1',
    category: 'matrimony',
    subCategory: 'Holy Matrimony',
    name: 'Buku Acara',
    pic: 'WO & Pengantin',
    status: 'Belum',
    notes: 'Didistribusikan di pintu masuk ibadah pemberkatan',
    location: 'Meja Foyer / Pintu Masuk'
  },
  {
    id: 'log-matrimony-2',
    category: 'matrimony',
    subCategory: 'Holy Matrimony',
    name: 'Cincin',
    pic: 'Tim Gereja',
    status: 'Belum',
    notes: 'Diserahkan ke penatalayan / pendeta sebelum ibadah',
    location: 'Meja Altar'
  },
  {
    id: 'log-matrimony-3',
    category: 'matrimony',
    subCategory: 'Holy Matrimony',
    name: 'Meja Altar',
    pic: 'Venue',
    status: 'Belum',
    notes: 'Disiapkan oleh pihak venue / gereja dengan taplak bersih',
    location: 'Altar Utama'
  },
  {
    id: 'log-matrimony-4',
    category: 'matrimony',
    subCategory: 'Holy Matrimony',
    name: 'Kursi jemaat / tamu',
    pic: 'Venue',
    status: 'Belum',
    notes: 'Ditata rapi sesuai kapasitas undangan yang hadir',
    location: 'Area Jemaat'
  },
  {
    id: 'log-matrimony-5',
    category: 'matrimony',
    subCategory: 'Holy Matrimony',
    name: 'Mic untuk pdt, singer & MC',
    pic: 'Entertainment',
    status: 'Belum',
    notes: 'Sound check & sediakan baterai cadangan',
    location: 'Panggung / Sound System'
  },
  {
    id: 'log-matrimony-6',
    category: 'matrimony',
    subCategory: 'Holy Matrimony',
    name: 'Keyboard',
    pic: 'Entertainment',
    status: 'Belum',
    notes: 'Alat musik pengiring pujian dan penyembahan',
    location: 'Area Pemain Musik'
  },
  {
    id: 'log-matrimony-7',
    category: 'matrimony',
    subCategory: 'Holy Matrimony',
    name: 'Buku tamu',
    pic: 'WO',
    status: 'Belum',
    notes: 'Disediakan di meja registrasi depan beserta spidol/pulpen',
    location: 'Meja Registrasi'
  },
  {
    id: 'log-matrimony-8',
    category: 'matrimony',
    subCategory: 'Holy Matrimony',
    name: 'Kotak Angpao',
    pic: 'WO',
    status: 'Belum',
    notes: 'Dipasang di meja penerima tamu & kondisi terkunci',
    location: 'Meja Registrasi'
  },
  {
    id: 'log-matrimony-9',
    category: 'matrimony',
    subCategory: 'Holy Matrimony',
    name: 'Kunci kotak angpao',
    pic: 'Pengantin',
    status: 'Belum',
    notes: 'Dipegang aman oleh perwakilan keluarga pengantin',
    location: 'Keluarga Pengantin'
  },
  {
    id: 'log-matrimony-10',
    category: 'matrimony',
    subCategory: 'Holy Matrimony',
    name: 'Bantal sungkeman',
    pic: 'Dekor',
    status: 'Belum',
    notes: 'Diletakkan di depan panggung untuk prosesi sungkem',
    location: 'Depan Altar'
  },
  {
    id: 'log-matrimony-11',
    category: 'matrimony',
    subCategory: 'Holy Matrimony',
    name: 'Kursi bench pengantin',
    pic: 'Dekor',
    status: 'Belum',
    notes: 'Kursi dekoratif khusus kedua mempelai',
    location: 'Tengah Altar'
  },
  {
    id: 'log-matrimony-12',
    category: 'matrimony',
    subCategory: 'Holy Matrimony',
    name: 'Goodie bag Pendeta & penatalayan',
    pic: 'Pengantin & WO',
    status: 'Belum',
    notes: 'Diserahkan sebagai tanda kasih setelah ibadah selesai',
    location: 'Ruang Transit / Konsistori'
  }
];
