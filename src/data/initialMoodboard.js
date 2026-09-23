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

// Sub-kategori seragam yang diterapkan di seluruh kategori moodboard
export const UNIFIED_SUB_CATEGORIES = [
  { id: 'before-wedding', label: 'Before Wedding' },
  { id: 'holy-matrimony', label: 'Holy Matrimony' },
  { id: 'reception', label: 'Reception' },
  { id: 'after-party', label: 'After Party & General' }
];

export const DEFAULT_MOODBOARD_CATEGORIES = [
  { 
    id: 'dekorasi', 
    label: 'Dekorasi & Pelaminan', 
    color: 'amber',
    desc: 'Konsep dekorasi pelaminan, altar pemberkatan, foyer entrance, photo booth & table setting.',
    subCategories: [...UNIFIED_SUB_CATEGORIES]
  },
  { 
    id: 'busana', 
    label: 'Busana & Gaun Pengantin', 
    color: 'rose',
    desc: 'Gaun pengantin pemberkatan, gaun resepsi malam, jas tuxedo pria & seragam keluarga.',
    subCategories: [...UNIFIED_SUB_CATEGORIES]
  },
  { 
    id: 'makeup', 
    label: 'Makeup & Hairdo', 
    color: 'purple',
    desc: 'Riasan wajah bride, tata rambut updo/down, aksesoris tiara, retouch & makeup keluarga.',
    subCategories: [...UNIFIED_SUB_CATEGORIES]
  },
  { 
    id: 'bunga', 
    label: 'Bunga & Handbouquet', 
    color: 'emerald',
    desc: 'Buket bunga tangan pengantin wanita, boutonniere jas pria, corsage & dekorasi mobil pengantin.',
    subCategories: [...UNIFIED_SUB_CATEGORIES]
  },
  { 
    id: 'undangan', 
    label: 'Undangan & Souvenir', 
    color: 'sky',
    desc: 'Desain undangan fisik foil/wax seal, undangan website digital & souvenir cinderamata tamu.',
    subCategories: [...UNIFIED_SUB_CATEGORIES]
  },
  { 
    id: 'dokumentasi', 
    label: 'Foto & Dokumentasi', 
    color: 'orange',
    desc: 'Inspirasi shot list foto flatlay cincin, prosesi sakral, pose pelaminan & video sinematik.',
    subCategories: [...UNIFIED_SUB_CATEGORIES]
  }
];

export const INITIAL_MOODBOARD_ITEMS = [
  {
    id: 'mb-1',
    title: 'Konsep Altar Pemberkatan Sage & White',
    categoryId: 'dekorasi',
    subCategoryId: 'holy-matrimony',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    notes: 'Rangkaian bunga putih dan daun eucalyptus di altar utama gereja untuk nuansa suci & elegan.',
    source: 'Inspirasi Altar Holy Matrimony',
    createdAt: '2026-09-23'
  },
  {
    id: 'mb-2',
    title: 'Gaun Pengantin Minimalis A-Line & Cathedral Veil',
    categoryId: 'busana',
    subCategoryId: 'holy-matrimony',
    imageUrl: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1200&q=80',
    notes: 'Siluet bersih dengan aksen renda halus dan cathedral veil panjang untuk sesi prosesi masuk gereja.',
    source: 'Bridal Atelier Concept',
    createdAt: '2026-09-23'
  },
  {
    id: 'mb-3',
    title: 'Natural Glowing Bride Makeup',
    categoryId: 'makeup',
    subCategoryId: 'holy-matrimony',
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
    notes: 'Flawless complexion dengan soft peach tone, fokus pada mata tegas dan bibir nude glossy.',
    source: 'Wedding MUA Lookbook',
    createdAt: '2026-09-23'
  },
  {
    id: 'mb-4',
    title: 'Handbouquet Mawar Putih & Baby Breath',
    categoryId: 'bunga',
    subCategoryId: 'holy-matrimony',
    imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80',
    notes: 'Buket bunga tangan segar dengan pita sutra satin ivory yang menjuntai rapi.',
    source: 'Florist Portfolio',
    createdAt: '2026-09-23'
  },
  {
    id: 'mb-5',
    title: 'Suasana Resepsi Warm Fairy Lights & Chandelier',
    categoryId: 'dekorasi',
    subCategoryId: 'reception',
    imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
    notes: 'Pencahayaan warm white di area grand ballroom untuk ambience intim dan mewah saat resepsi malam.',
    source: 'Ballroom Lighting Inspiration',
    createdAt: '2026-09-23'
  },
  {
    id: 'mb-6',
    title: 'Detail Flatlay Kotak Cincin & Aksesoris',
    categoryId: 'dokumentasi',
    subCategoryId: 'before-wedding',
    imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80',
    notes: 'Foto detail flatlay cincin kawin di atas buku acara dan kain sutra sebelum acara dimulai.',
    source: 'Photography Shot List',
    createdAt: '2026-09-23'
  },
  {
    id: 'mb-7',
    title: 'Pelaminan Modern Minimalis dengan Aksen Gold Arch',
    categoryId: 'dekorasi',
    subCategoryId: 'reception',
    imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    notes: 'Pelaminan resepsi dengan lengkungan geometris emas dan karpet putih bersih.',
    source: 'Wedding Decor Concept',
    createdAt: '2026-09-23'
  },
  {
    id: 'mb-8',
    title: 'Tuxedo Hitam Klasik Satin Shawl Lapel',
    categoryId: 'busana',
    subCategoryId: 'before-wedding',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
    notes: 'Jas tuxedo hitam formal dengan kerah shawl lapel satin dan dasi kupu-kupu sutra.',
    source: 'Groom Suiting Guide',
    createdAt: '2026-09-23'
  },
  {
    id: 'mb-9',
    title: 'Inspirasi Video Sinematik Highlight Pernikahan',
    categoryId: 'dokumentasi',
    subCategoryId: 'reception',
    mediaType: 'video',
    videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    imageUrl: 'https://img.youtube.com/vi/ScMzIvxBSi4/hqdefault.jpg',
    notes: 'Referensi color grading hangat dan transisi sinematik untuk video highlight & teaser pernikahan.',
    source: 'YouTube Cinematic',
    createdAt: '2026-09-23'
  }
];
