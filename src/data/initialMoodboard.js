// Data terstruktur untuk Modul Moodboard & Konsep Visual Pernikahan
// Hak Cipta: Andre & Lois

export const COLOR_PRESETS = [
  { id: 'amber', label: 'Gold Amber', bg: 'bg-amber-500', badgeColor: 'bg-amber-50 text-amber-900 border-amber-200' },
  { id: 'rose', label: 'Dusty Rose', bg: 'bg-rose-500', badgeColor: 'bg-rose-50 text-rose-900 border-rose-200' },
  { id: 'purple', label: 'Royal Purple', bg: 'bg-purple-500', badgeColor: 'bg-purple-50 text-purple-900 border-purple-200' },
  { id: 'emerald', label: 'Sage Emerald', bg: 'bg-emerald-500', badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
  { id: 'sky', label: 'Classic Blue', bg: 'bg-sky-500', badgeColor: 'bg-sky-50 text-sky-900 border-sky-200' },
  { id: 'orange', label: 'Sunset Terracotta', bg: 'bg-orange-500', badgeColor: 'bg-orange-50 text-orange-900 border-orange-200' },
  { id: 'stone', label: 'Monochrome Stone', bg: 'bg-stone-700', badgeColor: 'bg-stone-100 text-stone-900 border-stone-200' },
  { id: 'teal', label: 'Teal Cyan', bg: 'bg-teal-500', badgeColor: 'bg-teal-50 text-teal-900 border-teal-200' }
];

export const DEFAULT_MOODBOARD_CATEGORIES = [
  { 
    id: 'dekorasi', 
    label: 'Dekorasi & Pelaminan', 
    color: 'amber',
    desc: 'Konsep dekorasi pelaminan, altar pemberkatan, foyer entrance, photo booth & table setting.',
    subCategories: [
      { id: 'altar', label: 'Altar & Holy Matrimony' },
      { id: 'pelaminan', label: 'Pelaminan & Backdrop Resepsi' },
      { id: 'foyer', label: 'Foyer, Entrance & Photo Booth' },
      { id: 'lighting', label: 'Pencahayaan & Table Setting' }
    ]
  },
  { 
    id: 'busana', 
    label: 'Busana & Gaun Pengantin', 
    color: 'rose',
    desc: 'Gaun pengantin pemberkatan, gaun resepsi malam, jas tuxedo pria & seragam keluarga.',
    subCategories: [
      { id: 'gaun-pemberkatan', label: 'Gaun Holy Matrimony & Veil' },
      { id: 'gaun-resepsi', label: 'Gaun Resepsi Malam' },
      { id: 'jas-pria', label: 'Jas & Tuxedo Pengantin Pria' },
      { id: 'keluarga-bridesmaids', label: 'Busana Orang Tua & Bridesmaids' }
    ]
  },
  { 
    id: 'makeup', 
    label: 'Makeup & Hairdo', 
    color: 'purple',
    desc: 'Riasan wajah bride, tata rambut updo/down, aksesoris tiara, retouch & makeup keluarga.',
    subCategories: [
      { id: 'mua-pemberkatan', label: 'Morning Holy Matrimony Look' },
      { id: 'mua-resepsi', label: 'Evening Reception Glam' },
      { id: 'hairdo', label: 'Hairdo & Tiara / Headpiece' },
      { id: 'mua-keluarga', label: 'Makeup Mama & Bridesmaids' }
    ]
  },
  { 
    id: 'bunga', 
    label: 'Bunga & Handbouquet', 
    color: 'emerald',
    desc: 'Buket bunga tangan pengantin wanita, boutonniere jas pria, corsage & dekorasi mobil pengantin.',
    subCategories: [
      { id: 'handbouquet', label: 'Handbouquet Pengantin Wanita' },
      { id: 'boutonniere', label: 'Boutonniere Jas Pengantin Pria' },
      { id: 'corsage', label: 'Corsage Orang Tua & Bestman' },
      { id: 'bunga-mobil', label: 'Dekorasi Bunga Mobil Pengantin' }
    ]
  },
  { 
    id: 'undangan', 
    label: 'Undangan & Souvenir', 
    color: 'sky',
    desc: 'Desain undangan fisik foil/wax seal, undangan website digital & souvenir cinderamata tamu.',
    subCategories: [
      { id: 'undangan-fisik', label: 'Undangan Fisik, Foil & Amplop' },
      { id: 'undangan-digital', label: 'Desain Undangan Digital / Web' },
      { id: 'souvenir', label: 'Souvenir Tamu & Packaging Box' }
    ]
  },
  { 
    id: 'dokumentasi', 
    label: 'Foto & Dokumentasi', 
    color: 'orange',
    desc: 'Inspirasi shot list foto flatlay cincin, prosesi sakral, pose pelaminan & video sinematik.',
    subCategories: [
      { id: 'flatlay', label: 'Detail Flatlay Cincin & Aksesoris' },
      { id: 'prosesi', label: 'Prosesi Masuk & First Look' },
      { id: 'pelaminan-pose', label: 'Sesi Foto Panggung Pelaminan' },
      { id: 'cinematic', label: 'Mood Video Sinematik & Drone' }
    ]
  }
];

export const INITIAL_MOODBOARD_ITEMS = [
  {
    id: 'mb-1',
    title: 'Konsep Altar Pemberkatan Sage & White',
    categoryId: 'dekorasi',
    subCategoryId: 'altar',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    notes: 'Rangkaian bunga putih dan daun eucalyptus di altar utama gereja untuk nuansa suci & elegan.',
    source: 'Inspirasi Altar Holy Matrimony',
    createdAt: '2026-09-23'
  },
  {
    id: 'mb-2',
    title: 'Gaun Pengantin Minimalis A-Line & Cathedral Veil',
    categoryId: 'busana',
    subCategoryId: 'gaun-pemberkatan',
    imageUrl: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1200&q=80',
    notes: 'Siluet bersih dengan aksen renda halus dan cathedral veil panjang untuk sesi prosesi masuk gereja.',
    source: 'Bridal Atelier Concept',
    createdAt: '2026-09-23'
  },
  {
    id: 'mb-3',
    title: 'Natural Glowing Bride Makeup',
    categoryId: 'makeup',
    subCategoryId: 'mua-pemberkatan',
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
    notes: 'Flawless complexion dengan soft peach tone, fokus pada mata tegas dan bibir nude glossy.',
    source: 'Wedding MUA Lookbook',
    createdAt: '2026-09-23'
  },
  {
    id: 'mb-4',
    title: 'Handbouquet Mawar Putih & Baby Breath',
    categoryId: 'bunga',
    subCategoryId: 'handbouquet',
    imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80',
    notes: 'Buket bunga tangan segar dengan pita sutra satin ivory yang menjuntai rapi.',
    source: 'Florist Portfolio',
    createdAt: '2026-09-23'
  },
  {
    id: 'mb-5',
    title: 'Suasana Resepsi Warm Fairy Lights & Chandelier',
    categoryId: 'dekorasi',
    subCategoryId: 'lighting',
    imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
    notes: 'Pencahayaan warm white di area grand ballroom untuk ambience intim dan mewah saat resepsi malam.',
    source: 'Ballroom Lighting Inspiration',
    createdAt: '2026-09-23'
  },
  {
    id: 'mb-6',
    title: 'Detail Flatlay Kotak Cincin & Aksesoris',
    categoryId: 'dokumentasi',
    subCategoryId: 'flatlay',
    imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80',
    notes: 'Foto detail flatlay cincin kawin di atas buku acara dan kain sutra sebelum acara dimulai.',
    source: 'Photography Shot List',
    createdAt: '2026-09-23'
  },
  {
    id: 'mb-7',
    title: 'Pelaminan Modern Minimalis dengan Aksen Gold Arch',
    categoryId: 'dekorasi',
    subCategoryId: 'pelaminan',
    imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    notes: 'Pelaminan resepsi dengan lengkungan geometris emas dan karpet putih bersih.',
    source: 'Wedding Decor Concept',
    createdAt: '2026-09-23'
  },
  {
    id: 'mb-8',
    title: 'Tuxedo Hitam Klasik Satin Shawl Lapel',
    categoryId: 'busana',
    subCategoryId: 'jas-pria',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
    notes: 'Jas tuxedo hitam formal dengan kerah shawl lapel satin dan dasi kupu-kupu sutra.',
    source: 'Groom Suiting Guide',
    createdAt: '2026-09-23'
  }
];
