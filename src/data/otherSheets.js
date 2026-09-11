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
    id: "rd-1",
    time: "04:00 - 06:00",
    duration: "120m",
    phase: "Persiapan Pagi",
    activity: "Start Makeup & Hairdo (Bride & Groom Dressed)",
    pic: "MUA Studio & Bride",
    status: "Upcoming",
    note: "Mulai pukul 04.00. Target pukul 06.00 selesai makeup, hairdo & dressed."
  },
  {
    id: "rd-2",
    time: "06:00 - 06:15",
    duration: "15m",
    phase: "Persiapan Pagi",
    activity: "Bride & Groom Breakfast",
    pic: "WO & Family",
    status: "Upcoming",
    note: "Sarapan pagi santai untuk kedua mempelai."
  },
  {
    id: "rd-3",
    time: "06:15 - 07:15",
    duration: "60m",
    phase: "Persiapan Pagi",
    activity: "Sesi Foto Bride & Groom",
    pic: "Documentation (FG/VG)",
    status: "Upcoming",
    note: "Sesi pemotretan berdua pengantin (area penthouse / indoor)."
  },
  {
    id: "rd-4",
    time: "07:15 - 07:45",
    duration: "30m",
    phase: "Persiapan Pagi",
    activity: "Sesi Foto Groom bersama Keluarga Inti Pria",
    pic: "Documentation (FG/VG) & WO",
    status: "Upcoming",
    note: "Sesi foto Groom bersama orang tua & saudara kandung keluarga pria."
  },
  {
    id: "rd-5",
    time: "07:45 - 08:15",
    duration: "30m",
    phase: "Persiapan Pagi",
    activity: "Prosesi Pelepasan Groom dengan Orang Tua",
    pic: "WO & Keluarga Groom",
    status: "Upcoming",
    note: "• Prosesi pemakaian jas oleh orang tua\n• Prosesi pemberian Handbouquet oleh orang tua\n• Foto orang tua & saudara kandung"
  },
  {
    id: "rd-6",
    time: "08:15 - 08:45",
    duration: "30m",
    phase: "Persiapan Pagi",
    activity: "Sesi Foto Bride bersama Keluarga Inti Wanita & Prosesi Pelepasan",
    pic: "WO & Keluarga Bride",
    status: "Upcoming",
    note: "• Pemberian corsage oleh mama & papa\n• Prosesi penutupan veil (tidak ada pantangan buka tutup)\n• Foto orang tua"
  },
  {
    id: "rd-7",
    time: "08:45 - 09:15",
    duration: "30m",
    phase: "Persiapan Pagi",
    activity: "Prosesi Pertemuan Pengantin (First Look)",
    pic: "WO & Documentation (FG/VG)",
    status: "Upcoming",
    note: "Momen first look dan pertemuan kedua pengantin didampingi tim dokumentasi."
  },
  {
    id: "rd-8",
    time: "09:15 - 09:45",
    duration: "30m",
    phase: "Persiapan Pagi",
    activity: "Sesi Foto di Luar Penthouse",
    pic: "Documentation (FG/VG)",
    status: "Upcoming",
    note: "Sesi pemotretan outdoor di area luar penthouse."
  },
  {
    id: "rd-9",
    time: "09:45 - 09:50",
    duration: "5m",
    phase: "Persiapan Pagi",
    activity: "Menuju Venue Holy Matrimony",
    pic: "WO & Transport",
    status: "Upcoming",
    note: "Perjalanan kedua mempelai beserta keluarga inti menuju venue Holy Matrimony."
  },
  {
    id: "rd-10",
    time: "09:50 - 10:00",
    duration: "10m",
    phase: "Pemberkatan",
    activity: "Briefing Ruang Persiapan (Penatalayan, Pendeta, Pengantin & Keluarga)",
    pic: "WO & Tim Penatalayan",
    status: "Upcoming",
    note: "Penatalayan + Pdt beserta pengantin & keluarga pengantin berada di ruangan persiapan."
  },
  {
    id: "rd-11",
    time: "10:00 - 10:10",
    duration: "10m",
    phase: "Pemberkatan",
    activity: "Prosesi Masuk Pengantin (Entrance)",
    pic: "WO & Stage Coordinator",
    status: "Upcoming",
    note: "Prosesi masuk pengantin dan keluarga memasuki ruang ibadah pemberkatan."
  },
  {
    id: "rd-12",
    time: "10:10 - 10:50",
    duration: "40m",
    phase: "Pemberkatan",
    activity: "Ibadah Pemberkatan Nikah Kudus (Holy Matrimony)",
    pic: "Pendeta & Tim Liturgi",
    status: "Upcoming",
    note: "Sakramen pemberkatan nikah kudus dipimpin oleh Pendeta."
  },
  {
    id: "rd-13",
    time: "10:50 - 10:55",
    duration: "5m",
    phase: "Pemberkatan",
    activity: "Foto Pengantin bersama Pendeta",
    pic: "Documentation (FG/VG) & WO",
    status: "Upcoming",
    note: "Sesi foto kedua mempelai bersama Pendeta di area altar."
  },
  {
    id: "rd-14",
    time: "10:55 - 11:10",
    duration: "15m",
    phase: "Pemberkatan",
    activity: "Pengantin Meninggalkan Ruangan Pemberkatan",
    pic: "WO & Usher",
    status: "Upcoming",
    note: "Pukul 11.00 pengantin dan keluarga meninggalkan ruangan pemberkatan menuju venue resepsi."
  },
  {
    id: "rd-15",
    time: "11:10 - 11:15",
    duration: "5m",
    phase: "Resepsi",
    activity: "Soft Opening by MC (Live Music)",
    pic: "MC & Entertainment",
    status: "Upcoming",
    note: "Pembukaan awal acara resepsi oleh MC diiringi Live Music."
  },
  {
    id: "rd-16",
    time: "11:15 - 11:25",
    duration: "10m",
    phase: "Resepsi",
    activity: "Grand Entrance Bride & Groom",
    pic: "MC, WO & Soundman",
    status: "Upcoming",
    note: "Music: TBC. Prosesi masuk kedua pengantin ke area resepsi."
  },
  {
    id: "rd-17",
    time: "11:25 - 11:35",
    duration: "10m",
    phase: "Resepsi",
    activity: "Pemberian Ulos Holong oleh Keluarga Bride",
    pic: "Keluarga Bride & MC / WO",
    status: "Upcoming",
    note: "Prosesi adat penyerahan kain Ulos Holong dari pihak keluarga mempelai wanita."
  },
  {
    id: "rd-18",
    time: "11:35 - 11:45",
    duration: "10m",
    phase: "Resepsi",
    activity: "Cutting Cake Ceremony & Prosesi Suapan",
    pic: "WO & Banquet / MC",
    status: "Upcoming",
    note: "Music: TBC\n• Suapan untuk orang tua pengantin pria\n• Suapan untuk orang tua pengantin wanita\n• Pengantin saling suap"
  },
  {
    id: "rd-19",
    time: "11:45 - 11:50",
    duration: "5m",
    phase: "Resepsi",
    activity: "Wedding Kiss",
    pic: "MC & Soundman",
    status: "Upcoming",
    note: "Music: TBC. Momen ciuman pernikahan kedua mempelai."
  },
  {
    id: "rd-20",
    time: "11:50 - 11:55",
    duration: "5m",
    phase: "Resepsi",
    activity: "Welcome Speech by Groom",
    pic: "Groom (Andre) & MC",
    status: "Upcoming",
    note: "Sambutan hangat dan ucapan terima kasih dari mempelai pria kepada para tamu undangan."
  },
  {
    id: "rd-21",
    time: "11:55 - 12:00",
    duration: "5m",
    phase: "Resepsi",
    activity: "Doa Makan Bersama",
    pic: "Pemimpin Doa & MC",
    status: "Upcoming",
    note: "Doa syukur bersama sebelum santap siang dimulai."
  },
  {
    id: "rd-22",
    time: "12:00 - 13:00",
    duration: "60m",
    phase: "Resepsi",
    activity: "Lunch Time, Mingle, Entertainment & Games Handbouquet",
    pic: "Catering, Entertainment & WO",
    status: "Upcoming",
    note: "• Lunch Time (Jamuan makan siang)\n• Pengantin melakukan table mingle menyapa para tamu\n• Performance by Entertainment (Live Music)\n• Handbouquet: 1 hadiah"
  },
  {
    id: "rd-23",
    time: "13:00 - 14:30",
    duration: "90m",
    phase: "Penutupan",
    activity: "Photo Session bersama Tamu & Closing",
    pic: "Documentation (FG/VG), MC & WO",
    status: "Upcoming",
    note: "Sesi foto bersama tamu undangan & rombongan keluarga sesuai modul Foto Tamu, dilanjutkan penutupan acara."
  }
];
