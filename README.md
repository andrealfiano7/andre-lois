# 💍 Wedding Dashboard — Andre & Lois

Modern, elegant, and responsive Web Dashboard for Wedding Operations & Checklist Management.

🌐 **Live URL**: [https://andre-lois.vercel.app/](https://andre-lois.vercel.app/)

---

## ✨ Fitur Utama

- **📊 Dashboard & Ringkasan Metrik**:
  - Pelacakan progres persiapan pernikahan secara real-time (*Total Selesai, Dalam Proses, Belum Mulai*).
  - Countdown hitung mundur hari H pernikahan (10 Oktober 2026).
- **📋 Multi-View Operasional Tugas**:
  - **Tabel & Checklist**: Tampilan tabel interaktif dengan checkbox proporsional, status tugas, dan filter lengkap.
  - **Papan Kanban**: Drag-and-drop interaktif antar status (*Belum Mulai, Dalam Proses, Selesai*), dilengkapi dropzone highlight dan tombol aksi cepat 1-tap di mobile.
  - **Linimasa Jadwal**: Visualisasi timeline berbasis tanggal tenggat tugas.
  - **Beban Tugas PIC**: Pemetaan distribusi tugas berdasarkan penanggung jawab.
- **📸 List Foto Tamu & VVIP**:
  - Manajemen daftar foto bersama pengantin, pengelompokan sesi, serta pencarian nama tamu.
- **⏱️ Rundown Acara Lengkap**:
  - Timeline detail acara dari persiapan pagi, pemberkatan gereja, hingga resepsi.
- **📱 Mobile-First Responsive Design**:
  - Dropdown navigasi ringkas di mode HP.
  - Tab switcher 2 baris (tanpa perlu slide horizontal).
  - Grid metrik seimbang, touch-friendly, dan bebas distorsi layout.
- **🕊️ Desain & Estetika**:
  - Tema *Warm Nude Luxury* (#FAF7F2) dengan aksen gradasi hangat.
  - Tipografi Google Font *Plus Jakarta Sans*.
  - Bebas informasi harga (*Zero Price Policy*).

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Bundler**: Vite 5
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Date Utilities**: date-fns

---

## 🚀 Panduan Memulai

### Prasyarat
- Node.js (v18 atau lebih baru)
- npm

### Instalasi & Menjalankan Lokal

```bash
# Clone repository
git clone https://github.com/andrealfiano7/andre-lois.git
cd andre-lois

# Install dependencies
npm install

# Jalankan server development
npm run dev
```

Server development akan aktif di http://localhost:5173/.

### Build untuk Produksi

```bash
npm run build
```

Hasil build akan tersimpan di direktori dist/.

---

## 📄 Hak Cipta

© 2026 Andre & Lois. All rights reserved.
