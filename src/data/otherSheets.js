// Data terstruktur untuk modul Foto Tamu & Rundown Hari-H
// Sumber: Google Spreadsheet (gid 69771647 dan gid 97489117)
// Hak Cipta: Andre & Lois

export const INITIAL_PHOTO_LIST = [
  {
    "id": "p-andre-1",
    "side": "Andre (Mempelai Pria)",
    "category": "Keluarga Inti",
    "name": "Orang Tua Mempelai Pria",
    "detail": "Papa & Mama Andre",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-andre-2",
    "side": "Andre (Mempelai Pria)",
    "category": "Keluarga Inti",
    "name": "Orang Tua Mempelai Pria & Wanita",
    "detail": "Kedua Pasang Orang Tua",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-andre-3",
    "side": "Andre (Mempelai Pria)",
    "category": "Keluarga Inti",
    "name": "Adik Kandung (Reinhard Habel Keluanan)",
    "detail": "Adik Kandung Andre",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-andre-4",
    "side": "Andre (Mempelai Pria)",
    "category": "Keluarga Besar (Pihak Bapak)",
    "name": "Om / Tante Mempelai Pria (dari pihak Bapak)",
    "detail": "Keluarga Besar Pihak Bapak",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-andre-5",
    "side": "Andre (Mempelai Pria)",
    "category": "Keluarga Besar (Pihak Bapak)",
    "name": "Kel. Om / Tante Ke-1 (Kel. Bpk Lambertus)",
    "detail": "Keluarga Bpk Lambertus",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-andre-6",
    "side": "Andre (Mempelai Pria)",
    "category": "Keluarga Besar (Pihak Mama)",
    "name": "Om / Tante Mempelai Pria (dari pihak Mama)",
    "detail": "Keluarga Besar Pihak Mama",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-andre-7",
    "side": "Andre (Mempelai Pria)",
    "category": "Keluarga Besar (Pihak Mama)",
    "name": "Kel. Mama Tua (Kel. Ibu Tuti)",
    "detail": "Kel. Ibu Tuti",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-andre-8",
    "side": "Andre (Mempelai Pria)",
    "category": "Keluarga Besar (Pihak Mama)",
    "name": "Kel. Tante Ke-3 (Kel. Ibu Ana)",
    "detail": "Kel. Ibu Ana",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-andre-9",
    "side": "Andre (Mempelai Pria)",
    "category": "Keluarga Besar (Pihak Mama)",
    "name": "Kel. Tante Ke-4 (Kel. Ibu Aryati & Bpk. Lassa)",
    "detail": "Kel. Ibu Aryati & Bpk. Lassa",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-andre-10",
    "side": "Andre (Mempelai Pria)",
    "category": "Keluarga Besar (Pihak Mama)",
    "name": "Kel. Tante Ke-5 (Kel. Ibu Ratna & Bpk. Pius)",
    "detail": "Kel. Ibu Ratna & Bpk. Pius",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-andre-11",
    "side": "Andre (Mempelai Pria)",
    "category": "Keluarga Besar (Pihak Mama)",
    "name": "Kel. Om Ke-6 (Kel. Bpk Anton & Ibu Eli)",
    "detail": "Kel. Bpk Anton & Ibu Eli",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-andre-12",
    "side": "Andre (Mempelai Pria)",
    "category": "Keluarga Besar (Pihak Mama)",
    "name": "Om Ke-7 (Om Andy)",
    "detail": "Om Andy & Pendamping",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-andre-13",
    "side": "Andre (Mempelai Pria)",
    "category": "Keluarga Besar",
    "name": "Sepupu Mempelai Pria",
    "detail": "Rombongan Sepupu Andre",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-andre-14",
    "side": "Andre (Mempelai Pria)",
    "category": "Rekan & Sahabat",
    "name": "Rekan dari Mempelai Pria",
    "detail": "Teman Sekolah & Sahabat Andre",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-1",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Keluarga Inti",
    "name": "Orang Tua Mempelai Wanita",
    "detail": "Papa & Mama Lois",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-2",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Keluarga Inti",
    "name": "Orang Tua Mempelai Pria & Wanita",
    "detail": "Kedua Pasang Orang Tua",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-3",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Keluarga Inti",
    "name": "Kakak / Adik Kandung Mempelai Wanita",
    "detail": "Saudara Kandung Lois",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-4",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Keluarga Inti",
    "name": "Kel. Abang Ke-1 (Kel. Bpk. Ivan David)",
    "detail": "Keluarga Bpk. Ivan David",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-5",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Keluarga Besar (Pihak Bapak)",
    "name": "Om / Tante Mempelai Wanita (dari pihak Bapak)",
    "detail": "Keluarga Besar Pihak Bapak",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-6",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Keluarga Besar (Pihak Bapak)",
    "name": "Keluarga Besar Semarang",
    "detail": "Rombongan Keluarga Semarang",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-7",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Keluarga Besar (Pihak Mama)",
    "name": "Om / Tante Mempelai Wanita (dari pihak Mama)",
    "detail": "Keluarga Besar Pihak Mama",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-8",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Keluarga Besar (Pihak Mama)",
    "name": "Kel. Mama Tua (Kel. Ibu Siti Nainggolan)",
    "detail": "Kel. Ibu Siti Nainggolan",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-9",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Keluarga Besar (Pihak Mama)",
    "name": "Kel. Tante Ke-3 (Kel. Ibu Ani Nainggolan & Bpk. Tobing)",
    "detail": "Kel. Ibu Ani & Bpk. Tobing",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-10",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Keluarga Besar (Pihak Mama)",
    "name": "Kel. Tulang Ke-4 (Kel. Bpk. Ferry Nainggolan & Ibu Gultom)",
    "detail": "Kel. Ferry Nainggolan & Ibu Gultom",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-11",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Keluarga Besar (Pihak Mama)",
    "name": "Kel. Tulang Ke-5 (Kel. Bpk. Erwan Nainggolan & Ibu Simanjuntak)",
    "detail": "Kel. Erwan Nainggolan & Ibu Simanjuntak",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-12",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Keluarga Besar (Pihak Mama)",
    "name": "Kel. Tulang Ke-6 (Kel. Bpk. Erwan Nainggolan & Ibu Gultom)",
    "detail": "Kel. Erwan Nainggolan & Ibu Gultom",
    "status": "Menunggu",
    "note": "to be confirm"
  },
  {
    "id": "p-lois-13",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Keluarga Besar (Pihak Mama)",
    "name": "Kel. Tante Ke-7 (Kel. Lina Nainggolan & Bpk. Siagian)",
    "detail": "Kel. Lina Nainggolan & Bpk. Siagian",
    "status": "Tidak Hadir",
    "note": "tidak hadir"
  },
  {
    "id": "p-lois-14",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Keluarga Besar (Pihak Mama)",
    "name": "Kel. Tante Ke-8 (Kel. Teti Nainggolan & Bpk. Pakpakan)",
    "detail": "Kel. Teti Nainggolan & Bpk. Pakpakan",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-15",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Keluarga Besar (Pihak Mama)",
    "name": "Kel. Tante Ke-9 (Kel. Hanna Nainggolan & Bpk. Sitorus)",
    "detail": "Kel. Hanna Nainggolan & Bpk. Sitorus",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-16",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Keluarga Besar",
    "name": "Sepupu Mempelai Wanita",
    "detail": "Rombongan Sepupu Lois",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-17",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Kerabat Mama",
    "name": "Fitri Purba & Fam",
    "detail": "Kerabat Jauh Pihak Mama",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-18",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Kerabat Mama",
    "name": "Danny Purba & Fam",
    "detail": "Kerabat Jauh Pihak Mama",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-19",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Kerabat Mama",
    "name": "Frida Panjaitan & Fam",
    "detail": "Kerabat Jauh Pihak Mama",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-20",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Kerabat Mama",
    "name": "H. Parulian Nainggolan & Fam",
    "detail": "Kerabat Jauh Pihak Mama",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-21",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Kerabat Mama",
    "name": "Jainun Simarmata & Fam",
    "detail": "Kerabat Jauh Pihak Mama",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-22",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Keluarga Besan",
    "name": "Kel. Bpk. Alfred Pesik & Ibu Marsini",
    "detail": "Besan Orang Tua",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-23",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Keluarga Besan",
    "name": "Kel. Bpk. Tamba & Ibu Siringo-ringo",
    "detail": "Besan Orang Tua",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-24",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Rekan Kerja",
    "name": "Rekan-rekan dari Amazone/Playtopia Group",
    "detail": "Kolega & Rekan Kerja Lois",
    "status": "Menunggu",
    "note": ""
  },
  {
    "id": "p-lois-25",
    "side": "Lois Erin (Mempelai Wanita)",
    "category": "Komunitas Rohani",
    "name": "Team PD. El-Shaddai",
    "detail": "Tokoh Agama & Ibu Rohani",
    "status": "Menunggu",
    "note": ""
  }
];

export const INITIAL_RUNDOWN = [
  {
    "id": "rd-1",
    "time": "05:00 - 07:00",
    "duration": "120m",
    "phase": "Persiapan Pagi",
    "activity": "MUA & Hairdo Pengantin & Kedua Ibu",
    "pic": "Bride & MUA Studio",
    "status": "Upcoming",
    "note": "Kamar rias Svarnabumi / Hotel. Sarapan ringan & kopi disiapkan untuk tim rias."
  },
  {
    "id": "rd-2",
    "time": "07:00 - 08:00",
    "duration": "60m",
    "phase": "Persiapan Pagi",
    "activity": "Fitting Gaun Pengantin, Jas Groom & Pasang Corsage",
    "pic": "WO & Bridesmaid",
    "status": "Upcoming",
    "note": "Pastikan ring box dan wedding ring dibawa oleh Best Man / Groom."
  },
  {
    "id": "rd-3",
    "time": "08:00 - 08:45",
    "duration": "45m",
    "phase": "Persiapan Pagi",
    "activity": "First Look & Sesi Pemotretan Eksklusif Pasangan",
    "pic": "Documentation (FG/VG)",
    "status": "Upcoming",
    "note": "Spot foto: Garden view Svarnabumi & area foyer utama."
  },
  {
    "id": "rd-4",
    "time": "08:45 - 09:15",
    "duration": "30m",
    "phase": "Persiapan Pagi",
    "activity": "Doa Bersama Keluarga Inti & Keberangkatan Altar",
    "pic": "Keluarga & Groom",
    "status": "Upcoming",
    "note": "Dipimpin oleh perwakilan keluarga inti sebelum menuju area chapel."
  },
  {
    "id": "rd-5",
    "time": "09:15 - 09:45",
    "duration": "30m",
    "phase": "Pemberkatan",
    "activity": "Briefing Tim Pelayanan Gereja & Pastor Pemberkatan",
    "pic": "WO & Tim Gereja",
    "status": "Upcoming",
    "note": "Penyerahan rice box & gift bag tanda kasih untuk Pendeta dan pemusik."
  },
  {
    "id": "rd-6",
    "time": "10:00 - 11:30",
    "duration": "90m",
    "phase": "Pemberkatan",
    "activity": "Ibadah Pemberkatan Nikah Kudus (Holy Matrimony)",
    "pic": "Pastor, Andre & Lois",
    "status": "Upcoming",
    "note": "Liturgi, pertukaran cincin, janji suci pernikahan, dan berkat keluarga."
  },
  {
    "id": "rd-7",
    "time": "11:30 - 12:15",
    "duration": "45m",
    "phase": "Pemberkatan",
    "activity": "Penandatanganan Dokumen Sipil & Foto Resmi Altar",
    "pic": "Dokumentasi & Catatan Sipil",
    "status": "Upcoming",
    "note": "Foto bersama Pastor, Saksi Pernikahan, dan Orang Tua kedua belah pihak."
  },
  {
    "id": "rd-8",
    "time": "12:15 - 13:15",
    "duration": "60m",
    "phase": "Pemberkatan",
    "activity": "Makan Siang Keluarga Inti & Pondokan (Gubukan)",
    "pic": "Family & Catering",
    "status": "Upcoming",
    "note": "Pemeriksaan kelengkapan alat makan gubukan & area istirahat VIP."
  },
  {
    "id": "rd-9",
    "time": "13:15 - 14:15",
    "duration": "60m",
    "phase": "Pemberkatan",
    "activity": "Ramah Tamah & Doa Kekeluargaan",
    "pic": "Keluarga Inti",
    "status": "Upcoming",
    "note": "Ramah tamah dan doa bersama keluarga inti & keluarga besar."
  },
  {
    "id": "rd-10",
    "time": "14:15 - 15:30",
    "duration": "75m",
    "phase": "Resepsi",
    "activity": "Touch-up MUA, Retouch Gaun Resepsi & Persiapan Pengantin",
    "pic": "MUA & Bride",
    "status": "Upcoming",
    "note": "Pengantin beristirahat sejenak dan bersiap sebelum resepsi malam."
  },
  {
    "id": "rd-11",
    "time": "15:30 - 16:30",
    "duration": "60m",
    "phase": "Resepsi",
    "activity": "Soundcheck, Lighting, MC Briefing & Final All Vendor Check",
    "pic": "WO & Soundsystem / Band",
    "status": "Upcoming",
    "note": "Simulasi rundown resepsi, cek mic wireless, dan penataan display wedding cake."
  },
  {
    "id": "rd-12",
    "time": "16:30 - 17:00",
    "duration": "30m",
    "phase": "Resepsi",
    "activity": "Briefing Tim Penerima Tamu (Usher), Buku Tamu & Souvenir Corner",
    "pic": "WO & Tim Souvenir",
    "status": "Upcoming",
    "note": "QR scanner undangan digital, souvenir hand-out, dan kotak amplop diamankan."
  },
  {
    "id": "rd-13",
    "time": "17:00 - 17:30",
    "duration": "30m",
    "phase": "Resepsi",
    "activity": "Open Gate Resepsi & Welcome Drinks / Finger Food",
    "pic": "WO & Catering",
    "status": "Upcoming",
    "note": "Musik latar instrumen akustik menyambut kehadiran tamu undangan."
  },
  {
    "id": "rd-14",
    "time": "17:30 - 17:45",
    "duration": "15m",
    "phase": "Resepsi",
    "activity": "Grand Entrance Mempelai (Andre & Lois) & Parents",
    "pic": "MC & Stage Coordinator",
    "status": "Upcoming",
    "note": "Lampu tembak sorot & lagu entrance romantis saat pasangan memasuki ballroom."
  },
  {
    "id": "rd-15",
    "time": "17:45 - 18:00",
    "duration": "15m",
    "phase": "Resepsi",
    "activity": "Wedding Cake Cutting Ceremony & Champagne Toast",
    "pic": "Bride & Groom, MC",
    "status": "Upcoming",
    "note": "Potong kue pengantin 3 susun & toast berkat bersama kedua orang tua."
  },
  {
    "id": "rd-16",
    "time": "18:00 - 18:10",
    "duration": "10m",
    "phase": "Resepsi",
    "activity": "Doa Makan Bersama Tamu Resepsi",
    "pic": "Keluarga (PIC Doa Makan)",
    "status": "Upcoming",
    "note": "Dipimpin oleh tokoh keluarga yang telah ditunjuk resmi."
  },
  {
    "id": "rd-17",
    "time": "18:10 - 20:30",
    "duration": "140m",
    "phase": "Resepsi",
    "activity": "Dinner Jamuan, Live Entertainment & Pemanggilan Sesi Foto Tamu",
    "pic": "MC, Stage Manager & FG/VG",
    "status": "Upcoming",
    "note": "Sesi pemotretan panggung dipanggil berurutan sesuai data di modul Foto Tamu."
  },
  {
    "id": "rd-18",
    "time": "20:30 - 20:50",
    "duration": "20m",
    "phase": "Penutupan",
    "activity": "Lempar Handbouquet & Special Interactive Performance",
    "pic": "Bride, Groom & MC",
    "status": "Upcoming",
    "note": "Ajang seru interaktif bersama rekan-rekan lajang dan pembagian hadiah game."
  },
  {
    "id": "rd-19",
    "time": "20:50 - 21:15",
    "duration": "25m",
    "phase": "Penutupan",
    "activity": "Sambutan Penutup, Ucapan Terima Kasih & Foto Panitia",
    "pic": "Andre & Lois, Tim WO",
    "status": "Upcoming",
    "note": "Foto bersama seluruh vendor pendukung dan panitia keluarga."
  },
  {
    "id": "rd-20",
    "time": "21:15 - 22:30",
    "duration": "75m",
    "phase": "Penutupan",
    "activity": "Serah Terima Titipan, Kotak Angpao, Souvenir & Loading Out Vendor",
    "pic": "WO & Keluarga Inti",
    "status": "Upcoming",
    "note": "Pemeriksaan barang bawaan penting, serah terima kunci hotel, dan clearance area Svarnabumi."
  }
];
