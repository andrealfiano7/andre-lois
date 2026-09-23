import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Luggage, 
  Check, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  RotateCcw, 
  CheckSquare, 
  Square, 
  Church, 
  Building2, 
  Heart, 
  Sparkles, 
  User, 
  Briefcase, 
  Filter, 
  X, 
  AlertCircle,
  Clock,
  MapPin,
  CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function LogisticsView({ items = [], onChange, onResetToDefault }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'hotel' | 'matrimony'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'ready' | 'pending'
  const [selectedPic, setSelectedPic] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: 'hotel',
    subCategory: 'Groom',
    name: '',
    pic: 'Groom',
    status: 'Belum',
    notes: '',
    location: ''
  });

  const safeItems = Array.isArray(items) ? items : [];

  // Toggle Item Ready Status
  const handleToggleStatus = (id) => {
    const updated = safeItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: item.status === 'Siap' ? 'Belum' : 'Siap'
        };
      }
      return item;
    });
    onChange?.(updated);
  };

  // Mark all ready or unmark in current tab
  const handleMarkAllReady = (markAsReady = true) => {
    const targetStatus = markAsReady ? 'Siap' : 'Belum';
    const confirmMsg = markAsReady 
      ? 'Tandai semua barang dalam daftar ini sebagai SUDAH SIAP?' 
      : 'Kembalikan status semua barang menjadi BELUM SIAP?';
    if (!window.confirm(confirmMsg)) return;

    let targetIds = new Set();
    if (activeTab === 'hotel') {
      safeItems.filter(i => i.category === 'hotel').forEach(i => targetIds.add(i.id));
    } else if (activeTab === 'matrimony') {
      safeItems.filter(i => i.category === 'matrimony').forEach(i => targetIds.add(i.id));
    } else {
      safeItems.forEach(i => targetIds.add(i.id));
    }

    const updated = safeItems.map(item => {
      if (targetIds.has(item.id)) {
        return { ...item, status: targetStatus };
      }
      return item;
    });
    onChange?.(updated);
  };

  // Open Modal Add
  const handleOpenAdd = (defaultSub = 'Groom') => {
    setEditingItem(null);
    const cat = defaultSub === 'Holy Matrimony' ? 'matrimony' : 'hotel';
    const defaultPic = defaultSub === 'Groom' ? 'Groom' : defaultSub === 'Bride' ? 'Bride' : 'WO';
    setFormData({
      category: cat,
      subCategory: defaultSub,
      name: '',
      pic: defaultPic,
      status: 'Belum',
      notes: '',
      location: defaultSub === 'Holy Matrimony' ? 'Tempat Ibadah / Gereja' : `Kamar Hotel ${defaultSub}`
    });
    setIsModalOpen(true);
  };

  // Open Modal Edit
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      category: item.category || 'hotel',
      subCategory: item.subCategory || 'Groom',
      name: item.name || '',
      pic: item.pic || '',
      status: item.status || 'Belum',
      notes: item.notes || '',
      location: item.location || ''
    });
    setIsModalOpen(true);
  };

  // Save Modal
  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      const updated = safeItems.map(item => {
        if (item.id === editingItem.id) {
          return { ...item, ...formData };
        }
        return item;
      });
      onChange?.(updated);
    } else {
      const newItem = {
        id: `log-${Date.now()}`,
        ...formData
      };
      onChange?.([...safeItems, newItem]);
    }
    setIsModalOpen(false);
  };

  // Delete Item
  const handleDeleteItem = (id, name) => {
    if (window.confirm(`Hapus barang "${name}" dari checklist?`)) {
      const updated = safeItems.filter(i => i.id !== id);
      onChange?.(updated);
    }
  };

  // Copy to WhatsApp
  const handleCopyWA = () => {
    const hotelGroom = safeItems.filter(i => i.category === 'hotel' && i.subCategory === 'Groom');
    const hotelBride = safeItems.filter(i => i.category === 'hotel' && i.subCategory === 'Bride');
    const matrimony = safeItems.filter(i => i.category === 'matrimony');

    let text = `*CHECKLIST LOGISTIK & BARANG PERNIKAHAN*\n`;
    text += `*Andre & Lois Wedding*\n\n`;

    text += `🏨 *1. LIST BARANG DI HOTEL - GROOM*\n`;
    hotelGroom.forEach((item, idx) => {
      const mark = item.status === 'Siap' ? '✅' : '⬜';
      text += `${mark} ${item.name}${item.notes ? ` (${item.notes})` : ''}\n`;
    });

    text += `\n👰 *2. LIST BARANG DI HOTEL - BRIDE*\n`;
    hotelBride.forEach((item, idx) => {
      const mark = item.status === 'Siap' ? '✅' : '⬜';
      text += `${mark} ${item.name}${item.notes ? ` (${item.notes})` : ''}\n`;
    });

    text += `\n⛪ *3. LIST KEPERLUAN HOLY MATRIMONY*\n`;
    matrimony.forEach((item, idx) => {
      const mark = item.status === 'Siap' ? '✅' : '⬜';
      text += `${mark} ${item.name} - [PIC: ${item.pic}]\n`;
    });

    text += `\n_Diperbarui secara realtime via Wedding Checklist Dashboard_`;

    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2600);
    });
  };

  // Unique PICs for filter
  const uniquePics = useMemo(() => {
    const pics = new Set();
    safeItems.forEach(i => {
      if (i.pic) pics.add(i.pic);
    });
    return Array.from(pics).sort();
  }, [safeItems]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = safeItems.length;
    const ready = safeItems.filter(i => i.status === 'Siap').length;
    const pending = total - ready;
    const percent = total > 0 ? Math.round((ready / total) * 100) : 0;

    const hotelItems = safeItems.filter(i => i.category === 'hotel');
    const hotelTotal = hotelItems.length;
    const hotelReady = hotelItems.filter(i => i.status === 'Siap').length;

    const groomItems = safeItems.filter(i => i.category === 'hotel' && i.subCategory === 'Groom');
    const groomReady = groomItems.filter(i => i.status === 'Siap').length;

    const brideItems = safeItems.filter(i => i.category === 'hotel' && i.subCategory === 'Bride');
    const brideReady = brideItems.filter(i => i.status === 'Siap').length;

    const matItems = safeItems.filter(i => i.category === 'matrimony');
    const matTotal = matItems.length;
    const matReady = matItems.filter(i => i.status === 'Siap').length;

    return {
      total,
      ready,
      pending,
      percent,
      hotelTotal,
      hotelReady,
      groomTotal: groomItems.length,
      groomReady,
      brideTotal: brideItems.length,
      brideReady,
      matTotal,
      matReady
    };
  }, [safeItems]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return safeItems.filter(item => {
      // Tab filter
      if (activeTab === 'hotel' && item.category !== 'hotel') return false;
      if (activeTab === 'matrimony' && item.category !== 'matrimony') return false;

      // Status filter
      if (statusFilter === 'ready' && item.status !== 'Siap') return false;
      if (statusFilter === 'pending' && item.status === 'Siap') return false;

      // PIC filter
      if (selectedPic !== 'all' && item.pic !== selectedPic) return false;

      // Query search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match = [
          item.name,
          item.pic,
          item.notes,
          item.location,
          item.subCategory
        ].some(field => field?.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [safeItems, activeTab, statusFilter, selectedPic, searchQuery]);

  // Subgroups of filtered items
  const groomList = useMemo(() => filteredItems.filter(i => i.category === 'hotel' && i.subCategory === 'Groom'), [filteredItems]);
  const brideList = useMemo(() => filteredItems.filter(i => i.category === 'hotel' && i.subCategory === 'Bride'), [filteredItems]);
  const matrimonyList = useMemo(() => filteredItems.filter(i => i.category === 'matrimony'), [filteredItems]);

  // Badge styling for PIC
  const getPicBadge = (pic) => {
    const p = pic?.toLowerCase() || '';
    if (p.includes('wo')) return 'bg-amber-50 text-amber-900 border-amber-200';
    if (p.includes('gereja') || p.includes('tim')) return 'bg-purple-50 text-purple-900 border-purple-200';
    if (p.includes('venue')) return 'bg-sky-50 text-sky-900 border-sky-200';
    if (p.includes('dekor')) return 'bg-rose-50 text-rose-900 border-rose-200';
    if (p.includes('entertainment') || p.includes('musik')) return 'bg-indigo-50 text-indigo-900 border-indigo-200';
    if (p.includes('pengantin') || p.includes('groom') || p.includes('bride')) return 'bg-emerald-50 text-emerald-900 border-emerald-200';
    return 'bg-stone-100 text-stone-800 border-stone-200';
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 sm:pb-0">
      {/* Toast Notification Copy Feedback */}
      <AnimatePresence>
        {copyFeedback && typeof document !== 'undefined' && createPortal(
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-white/20"
          >
            <CheckCheck size={16} className="text-emerald-400" />
            <span>Checklist berhasil disalin! Siap ditempel di WhatsApp.</span>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#EADBCE] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Luggage size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
                  Logistik &amp; Perlengkapan Acara
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  {stats.ready}/{stats.total} Siap ({stats.percent}%)
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Checklist barang bawaan di hotel (Groom &amp; Bride) serta perlengkapan ibadah Holy Matrimony
              </p>
            </div>
          </div>

          {/* Quick Actions Button Group */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyWA}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Salin ringkasan checklist untuk dikirim ke tim / WA group"
            >
              <Copy size={14} className="text-stone-600" />
              <span>Salin WA</span>
            </button>

            <button
              type="button"
              onClick={() => handleMarkAllReady(stats.ready < stats.total)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Tandai semua barang siap atau belum"
            >
              <CheckSquare size={14} className={stats.ready === stats.total ? "text-emerald-600" : "text-stone-600"} />
              <span>{stats.ready === stats.total ? 'Reset Centang' : 'Tandai Semua'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenAdd(activeTab === 'matrimony' ? 'Holy Matrimony' : 'Groom')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-stone-900 to-stone-800 hover:from-amber-700 hover:to-rose-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              <span>Tambah Barang</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5 pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
            <span className="text-stone-600 flex items-center gap-1.5">
              <span>Progres Kesiapan Keseluruhan</span>
              <span className="text-[11px] font-bold text-stone-400">({stats.ready} dari {stats.total} item)</span>
            </span>
            <span className="font-extrabold text-stone-900">{stats.percent}%</span>
          </div>
          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.percent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
            <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]/70">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <Building2 size={12} className="text-amber-600" />
                <span>Barang Hotel</span>
              </div>
              <div className="text-base font-extrabold text-stone-900 mt-0.5">
                {stats.hotelReady}/{stats.hotelTotal}
                <span className="text-[11px] font-normal text-stone-500 ml-1.5">
                  ({stats.hotelTotal > 0 ? Math.round((stats.hotelReady / stats.hotelTotal) * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]/70">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <User size={12} className="text-slate-700" />
                <span>Hotel Groom</span>
              </div>
              <div className="text-base font-extrabold text-stone-900 mt-0.5">
                {stats.groomReady}/{stats.groomTotal}
                <span className="text-[11px] font-normal text-stone-500 ml-1.5">item siap</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]/70">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <Heart size={12} className="text-rose-600" />
                <span>Hotel Bride</span>
              </div>
              <div className="text-base font-extrabold text-stone-900 mt-0.5">
                {stats.brideReady}/{stats.brideTotal}
                <span className="text-[11px] font-normal text-stone-500 ml-1.5">item siap</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]/70">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <Church size={12} className="text-purple-600" />
                <span>Holy Matrimony</span>
              </div>
              <div className="text-base font-extrabold text-stone-900 mt-0.5">
                {stats.matReady}/{stats.matTotal}
                <span className="text-[11px] font-normal text-stone-500 ml-1.5">
                  ({stats.matTotal > 0 ? Math.round((stats.matReady / stats.matTotal) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Tab Section */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-2xl w-fit self-start overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'all' 
                ? 'bg-white text-stone-900 shadow-2xs' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Semua Barang</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-300 text-stone-700'}`}>
              {stats.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hotel')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'hotel' 
                ? 'bg-white text-stone-900 shadow-2xs' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Building2 size={13} className="text-amber-600" />
            <span>Barang di Hotel</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'hotel' ? 'bg-amber-600 text-white' : 'bg-stone-300 text-stone-700'}`}>
              {stats.hotelReady}/{stats.hotelTotal}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matrimony')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'matrimony' 
                ? 'bg-white text-stone-900 shadow-2xs' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Church size={13} className="text-purple-600" />
            <span>Holy Matrimony</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'matrimony' ? 'bg-purple-600 text-white' : 'bg-stone-300 text-stone-700'}`}>
              {stats.matReady}/{stats.matTotal}
            </span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari barang / PIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#EADBCE] rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-800"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-[#EADBCE] rounded-xl text-xs font-medium text-stone-700 focus:outline-none focus:border-stone-800 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="pending">⏳ Belum Siap</option>
            <option value="ready">✅ Sudah Siap</option>
          </select>

          {/* PIC Filter */}
          <select
            value={selectedPic}
            onChange={(e) => setSelectedPic(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-[#EADBCE] rounded-xl text-xs font-medium text-stone-700 focus:outline-none focus:border-stone-800 cursor-pointer max-w-[140px] truncate"
          >
            <option value="all">Semua PIC</option>
            {uniquePics.map(pic => (
              <option key={pic} value={pic}>{pic}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#EADBCE] shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
            <Search size={22} />
          </div>
          <h3 className="text-sm font-bold text-stone-800">Tidak ada barang yang cocok</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau ubah filter status/PIC Anda.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setSelectedPic('all');
            }}
            className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-stone-900 text-white font-bold text-xs"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION 1: BARANG DI HOTEL (Groom & Bride Side-by-Side) */}
          {(activeTab === 'all' || activeTab === 'hotel') && (groomList.length > 0 || brideList.length > 0) && (
            <div className="space-y-3">
              <div className="flex items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0 mt-0.5 sm:mt-0">
                    <Building2 size={15} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight leading-snug">
                      Tabel 1: List Barang di Hotel
                    </h3>
                    <p className="text-[11px] text-stone-500 leading-tight mt-0.5 line-clamp-1 sm:line-clamp-none">
                      Perlengkapan dan aksesoris pribadi kedua mempelai di kamar hotel
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAdd('Groom')}
                  className="shrink-0 whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition flex items-center gap-1 shadow-2xs cursor-pointer mt-0.5 sm:mt-0"
                  title="Tambah Barang di Hotel"
                >
                  <Plus size={13} className="text-amber-700" />
                  <span className="hidden sm:inline">+ Item Hotel</span>
                  <span className="sm:hidden text-[11px]">+ Item</span>
                </button>
              </div>

              {/* Two Column Layout: Groom vs Bride */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* GROOM COLUMN */}
                <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden flex flex-col">
                  {/* Column Header */}
                  <div className="px-5 py-3.5 border-b border-stone-100 bg-gradient-to-r from-stone-900 to-slate-800 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-white/15 text-white flex items-center justify-center font-bold">
                        🤵
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold tracking-tight">
                          Groom (Mempelai Pria)
                        </h4>
                        <p className="text-[10px] text-stone-300">
                          Setelan, sepatu, parfum, cincin &amp; aksesoris
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white">
                      {groomList.filter(i => i.status === 'Siap').length}/{groomList.length} Siap
                    </span>
                  </div>

                  {/* Item List */}
                  <div className="divide-y divide-stone-100 p-2 sm:p-3 space-y-1">
                    {groomList.map(item => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        onToggle={() => handleToggleStatus(item.id)}
                        onEdit={() => handleOpenEdit(item)}
                        onDelete={() => handleDeleteItem(item.id, item.name)}
                      />
                    ))}
                    {groomList.length === 0 && (
                      <p className="text-center py-6 text-xs text-stone-400">Tidak ada item Groom</p>
                    )}
                  </div>
                </div>

                {/* BRIDE COLUMN */}
                <div className="bg-white rounded-3xl border border-rose-200/70 shadow-xs overflow-hidden flex flex-col">
                  {/* Column Header */}
                  <div className="px-5 py-3.5 border-b border-rose-100 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold">
                        👰
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold tracking-tight">
                          Bride (Mempelai Wanita)
                        </h4>
                        <p className="text-[10px] text-rose-100">
                          Robe, gaun, veil, sepatu, perhiasan &amp; handbouquet
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/25 text-white">
                      {brideList.filter(i => i.status === 'Siap').length}/{brideList.length} Siap
                    </span>
                  </div>

                  {/* Item List */}
                  <div className="divide-y divide-stone-100 p-2 sm:p-3 space-y-1">
                    {brideList.map(item => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        onToggle={() => handleToggleStatus(item.id)}
                        onEdit={() => handleOpenEdit(item)}
                        onDelete={() => handleDeleteItem(item.id, item.name)}
                        isBride
                      />
                    ))}
                    {brideList.length === 0 && (
                      <p className="text-center py-6 text-xs text-stone-400">Tidak ada item Bride</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: LIST KEPERLUAN HOLY MATRIMONY */}
          {(activeTab === 'all' || activeTab === 'matrimony') && matrimonyList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold shrink-0 mt-0.5 sm:mt-0">
                    <Church size={15} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight leading-snug">
                      Tabel 2: List Keperluan Holy Matrimony
                    </h3>
                    <p className="text-[11px] text-stone-500 leading-tight mt-0.5 line-clamp-1 sm:line-clamp-none">
                      Perlengkapan teknis, buku acara, meja altar, dan penanggung jawab (PIC)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAdd('Holy Matrimony')}
                  className="shrink-0 whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 transition flex items-center gap-1 shadow-2xs cursor-pointer mt-0.5 sm:mt-0"
                  title="Tambah Keperluan Holy Matrimony"
                >
                  <Plus size={13} className="text-purple-700" />
                  <span className="hidden sm:inline">+ Item Matrimony</span>
                  <span className="sm:hidden text-[11px]">+ Item</span>
                </button>
              </div>

              {/* Table / Card Container */}
              <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
                {/* Desktop Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 bg-stone-50 border-b border-stone-200/80 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  <div className="col-span-1 text-center">Status</div>
                  <div className="col-span-5">Nama Barang / Keperluan</div>
                  <div className="col-span-3">Penanggung Jawab (PIC)</div>
                  <div className="col-span-2">Lokasi / Detail</div>
                  <div className="col-span-1 text-right">Aksi</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-stone-100">
                  {matrimonyList.map((item) => (
                    <div 
                      key={item.id}
                      className={`p-3 sm:px-5 sm:py-3 transition-colors ${
                        item.status === 'Siap' ? 'bg-emerald-50/25' : 'hover:bg-stone-50/60'
                      }`}
                    >
                      {/* Mobile Card Layout (< md) */}
                      <div className="md:hidden flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item.id)}
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5 ${
                            item.status === 'Siap' 
                              ? 'bg-emerald-600 text-white shadow-2xs' 
                              : 'border-2 border-stone-300 hover:border-stone-400 bg-white'
                          }`}
                          title={item.status === 'Siap' ? 'Batal siap' : 'Tandai siap'}
                        >
                          {item.status === 'Siap' && <Check size={13} className="stroke-[3]" />}
                        </button>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          {/* Name + Actions Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h4 className={`text-xs sm:text-sm font-extrabold tracking-tight leading-snug ${
                                item.status === 'Siap' ? 'text-stone-400 line-through' : 'text-stone-900'
                              }`}>
                                {item.name}
                              </h4>
                              {item.notes && (
                                <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">
                                  {item.notes}
                                </p>
                              )}
                            </div>

                            {/* Actions Inline at Top-Right */}
                            <div className="flex items-center gap-0.5 shrink-0 -mt-0.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id, item.name)}
                                className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Meta Row: PIC + Location + Status */}
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-[11px]">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold border ${getPicBadge(item.pic)} shrink-0`}>
                              <Briefcase size={10} />
                              <span>{item.pic}</span>
                            </span>

                            {item.location && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 shrink-0">
                                <MapPin size={11} className="text-stone-400" />
                                <span>{item.location}</span>
                              </span>
                            )}

                            <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded-md shrink-0 ${
                              item.status === 'Siap' 
                                ? 'bg-emerald-100/70 text-emerald-800' 
                                : 'bg-stone-100 text-stone-500'
                            }`}>
                              {item.status === 'Siap' ? 'Siap' : 'Belum'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Grid Layout (>= md) */}
                      <div className="hidden md:grid md:grid-cols-12 gap-3 items-center">
                        {/* Checkbox */}
                        <div className="col-span-1 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item.id)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                              item.status === 'Siap' 
                                ? 'bg-emerald-600 text-white shadow-xs' 
                                : 'border-2 border-stone-300 hover:border-stone-400 bg-white'
                            }`}
                          >
                            {item.status === 'Siap' && <Check size={14} className="stroke-[3]" />}
                          </button>
                        </div>

                        {/* Nama Barang */}
                        <div className="col-span-5 min-w-0">
                          <span className={`text-xs sm:text-sm font-bold tracking-tight ${
                            item.status === 'Siap' ? 'text-stone-400 line-through' : 'text-stone-900'
                          }`}>
                            {item.name}
                          </span>
                          {item.notes && (
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              {item.notes}
                            </p>
                          )}
                        </div>

                        {/* PIC Badge */}
                        <div className="col-span-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold border ${getPicBadge(item.pic)}`}>
                            <Briefcase size={12} />
                            <span>{item.pic}</span>
                          </span>
                        </div>

                        {/* Lokasi */}
                        <div className="col-span-2 text-[11px] text-stone-500 flex items-center gap-1">
                          <MapPin size={12} className="text-stone-400 shrink-0" />
                          <span className="truncate">{item.location || 'Tempat Ibadah'}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="col-span-1 flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Information / Reset to Default Banner */}
      <div className="p-4 rounded-3xl bg-white border border-[#EADBCE] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
        <div className="flex items-center gap-2 text-stone-600">
          <AlertCircle size={15} className="text-amber-600 shrink-0" />
          <span>
            Checklist barang ini disimpan otomatis dan dapat diakses offline saat hari-H di hotel &amp; venue.
          </span>
        </div>

        {onResetToDefault && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Kembalikan seluruh daftar barang & logistik ke data bawaan awal? (Perubahan kustom akan direset)')) {
                onResetToDefault();
              }
            }}
            className="text-[11px] font-bold text-stone-500 hover:text-rose-700 flex items-center gap-1 transition cursor-pointer shrink-0"
          >
            <RotateCcw size={12} />
            <span>Reset ke Standar Awal</span>
          </button>
        )}
      </div>

      {/* Clean Add/Edit Modal (iOS-Style Bottom Sheet & Portalled to document.body) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs"
                onClick={() => setIsModalOpen(false)}
              />

              {/* Modal Container */}
              <motion.div 
                initial={{ opacity: 0, y: 80, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 80, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                className="relative w-full sm:max-w-md max-h-[90vh] bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border-t sm:border border-stone-200 flex flex-col overflow-hidden z-10"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag Pill */}
                <div className="w-10 h-1 rounded-full bg-stone-300 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

                {/* Header */}
                <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-amber-50/80 via-white to-rose-50/70 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-stone-900 to-amber-700 text-white flex items-center justify-center shadow-xs">
                      <Luggage size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-stone-900">
                        {editingItem ? 'Edit Barang Logistik' : 'Tambah Barang Baru'}
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Atur nama barang, kategori, dan penanggung jawab
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSaveModal} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
                  {/* Kategori Utama */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Kategori Checklist
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          category: 'hotel', 
                          subCategory: 'Groom',
                          pic: 'Groom',
                          location: 'Kamar Hotel Groom' 
                        }))}
                        className={`p-2.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                          formData.category === 'hotel' 
                            ? 'bg-amber-50/80 border-amber-400 text-amber-950 font-bold shadow-2xs' 
                            : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <Building2 size={16} className={formData.category === 'hotel' ? 'text-amber-700' : 'text-stone-400'} />
                        <span className="text-xs">Barang Hotel</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          category: 'matrimony', 
                          subCategory: 'Holy Matrimony',
                          pic: 'WO',
                          location: 'Tempat Ibadah / Gereja' 
                        }))}
                        className={`p-2.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                          formData.category === 'matrimony' 
                            ? 'bg-purple-50/80 border-purple-400 text-purple-950 font-bold shadow-2xs' 
                            : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <Church size={16} className={formData.category === 'matrimony' ? 'text-purple-700' : 'text-stone-400'} />
                        <span className="text-xs">Holy Matrimony</span>
                      </button>
                    </div>
                  </div>

                  {/* Sub Kategori (Jika Hotel: Groom vs Bride) */}
                  {formData.category === 'hotel' && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Pemilik / Bagian
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            subCategory: 'Groom', 
                            pic: 'Groom',
                            location: 'Kamar Hotel Groom' 
                          }))}
                          className={`p-2 rounded-xl border text-center text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                            formData.subCategory === 'Groom' 
                              ? 'bg-stone-900 text-white border-stone-900 shadow-2xs' 
                              : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <span>🤵 Groom</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            subCategory: 'Bride', 
                            pic: 'Bride',
                            location: 'Kamar Hotel Bride' 
                          }))}
                          className={`p-2 rounded-xl border text-center text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                            formData.subCategory === 'Bride' 
                              ? 'bg-rose-600 text-white border-rose-600 shadow-2xs' 
                              : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <span>👰 Bride</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Nama Barang */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Nama Barang / Keperluan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Setelan jas, Cincin, Kotak Angpao..."
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:border-stone-800 focus:bg-white"
                    />
                  </div>

                  {/* Penanggung Jawab (PIC) */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Penanggung Jawab (PIC)
                    </label>
                    <input
                      type="text"
                      list="picSuggestions"
                      placeholder="Contoh: Groom, Bride, WO, Dekor, Venue..."
                      value={formData.pic}
                      onChange={(e) => setFormData(prev => ({ ...prev, pic: e.target.value }))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:border-stone-800 focus:bg-white"
                    />
                    <datalist id="picSuggestions">
                      <option value="Groom" />
                      <option value="Bride" />
                      <option value="WO" />
                      <option value="WO & Pengantin" />
                      <option value="Tim Gereja" />
                      <option value="Venue" />
                      <option value="Entertainment" />
                      <option value="Dekor" />
                      <option value="Pengantin" />
                      <option value="Keluarga" />
                    </datalist>
                  </div>

                  {/* Lokasi / Posisi */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Lokasi / Penempatan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Kamar Hotel, Meja Altar, Meja Tamu..."
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:border-stone-800 focus:bg-white"
                    />
                  </div>

                  {/* Catatan / Keterangan */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Catatan khusus, nomor kontak atau instruksi detail..."
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:border-stone-800 focus:bg-white resize-none"
                    />
                  </div>

                  {/* Status Awal */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="statusReadyCheck"
                      checked={formData.status === 'Siap'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'Siap' : 'Belum' }))}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="statusReadyCheck" className="text-xs font-semibold text-stone-700 cursor-pointer">
                      Barang sudah siap / telah dipacking
                    </label>
                  </div>

                  {/* Submit / Cancel Buttons (Pinned Footer) */}
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-stone-900 to-stone-800 hover:from-amber-700 hover:to-rose-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Check size={14} />
                      <span>{editingItem ? 'Simpan Perubahan' : 'Tambah ke Daftar'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

// Subcomponent: Individual Item Row in Hotel Columns
function ItemRow({ item, onToggle, onEdit, onDelete, isBride = false }) {
  const isReady = item.status === 'Siap';

  return (
    <div 
      className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 group ${
        isReady 
          ? 'bg-emerald-50/40 border-emerald-200/60' 
          : 'bg-[#FAF7F2] border-stone-200/70 hover:border-stone-300'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={onToggle}
          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            isReady 
              ? 'bg-emerald-600 text-white shadow-2xs' 
              : 'border-2 border-stone-300 hover:border-stone-400 bg-white'
          }`}
          title={isReady ? 'Klik untuk batal siap' : 'Klik untuk tandai siap'}
        >
          {isReady && <Check size={13} className="stroke-[3]" />}
        </button>

        <div className="min-w-0 flex-1">
          <p className={`text-xs font-bold leading-snug break-words ${
            isReady ? 'text-stone-400 line-through' : 'text-stone-900'
          }`}>
            {item.name}
          </p>
          {item.notes && (
            <p className="text-[10px] text-stone-500 leading-tight mt-0.5 break-words">
              {item.notes}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition cursor-pointer"
          title="Edit"
        >
          <Edit3 size={13} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
          title="Hapus"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
