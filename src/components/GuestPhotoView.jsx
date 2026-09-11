import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Camera, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Printer, 
  Copy, 
  Check, 
  AlertCircle, 
  UserX, 
  Heart, 
  Sparkles, 
  User, 
  Briefcase, 
  Church, 
  Layers
} from 'lucide-react';

export function GuestPhotoView({ items, onChange }) {
  const [selectedSide, setSelectedSide] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    side: 'Andre (Mempelai Pria)',
    category: 'Keluarga Inti',
    name: '',
    detail: '',
    note: ''
  });

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSide = selectedSide === 'Semua' || item.side.toLowerCase().includes(selectedSide.toLowerCase());
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || [item.name, item.detail, item.category, item.note, item.side].some(v => v?.toLowerCase().includes(q));
      return matchSide && matchQuery;
    });
  }, [items, selectedSide, searchQuery]);

  // Group items by Side and Category for structured hierarchical display
  const groupedData = useMemo(() => {
    const groups = {};
    filteredItems.forEach(item => {
      const sideKey = item.side.includes('Andre') ? 'Pihak Andre (Mempelai Pria)' : 'Pihak Lois Erin (Mempelai Wanita)';
      if (!groups[sideKey]) groups[sideKey] = {};
      const catKey = item.category || 'Lainnya';
      if (!groups[sideKey][catKey]) groups[sideKey][catKey] = [];
      groups[sideKey][catKey].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = items.length;
    const andreCount = items.filter(i => i.side.includes('Andre')).length;
    const loisCount = items.filter(i => i.side.includes('Lois')).length;
    const toConfirm = items.filter(i => i.note?.toLowerCase().includes('confirm')).length;
    const tidakHadir = items.filter(i => i.note?.toLowerCase().includes('tidak')).length;
    return { total, andreCount, loisCount, toConfirm, tidakHadir };
  }, [items]);

  // Category Icon helper
  const getCategoryIcon = (catName) => {
    if (catName.includes('Inti')) return <Heart size={14} className="text-rose-500" />;
    if (catName.includes('Besar')) return <Users size={14} className="text-amber-600" />;
    if (catName.includes('Kerabat') || catName.includes('Besan')) return <Sparkles size={14} className="text-amber-500" />;
    if (catName.includes('Rekan')) return <Briefcase size={14} className="text-sky-600" />;
    if (catName.includes('Rohani') || catName.includes('Agama')) return <Church size={14} className="text-purple-600" />;
    return <Layers size={14} className="text-emerald-600" />;
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      side: selectedSide === 'Lois' ? 'Lois Erin (Mempelai Wanita)' : 'Andre (Mempelai Pria)',
      category: 'Keluarga Besar',
      name: '',
      detail: '',
      note: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenAddForCategory = (sideTitle, catName) => {
    setEditingItem(null);
    const isAndre = sideTitle.includes('Andre');
    setFormData({
      side: isAndre ? 'Andre (Mempelai Pria)' : 'Lois Erin (Mempelai Wanita)',
      category: catName,
      name: '',
      detail: '',
      note: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenAddForSide = (sideTitle) => {
    setEditingItem(null);
    const isAndre = sideTitle.includes('Andre');
    setFormData({
      side: isAndre ? 'Andre (Mempelai Pria)' : 'Lois Erin (Mempelai Wanita)',
      category: 'Keluarga Besar',
      name: '',
      detail: '',
      note: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      side: item.side,
      category: item.category,
      name: item.name,
      detail: item.detail || '',
      note: item.note || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    onChange(items.filter(item => item.id !== id));
    fetch(`/api/photos?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      onChange(items.map(i => i.id === editingItem.id ? { ...i, ...formData } : i));
    } else {
      const newItem = {
        id: `photo-${Date.now()}`,
        status: 'Menunggu',
        ...formData
      };
      onChange([...items, newItem]);
    }
    setIsModalOpen(false);
  };

  // Copy list text to clipboard for WhatsApp / MC
  const handleCopyList = () => {
    let text = `📸 DAFTAR SESI FOTO TAMU UNDANGAN & KELUARGA\nAndre & Lois Erin — Wedding Dashboard\n================================\n\n`;
    
    Object.entries(groupedData).forEach(([side, categories]) => {
      text += `*${side.toUpperCase()}*\n`;
      Object.entries(categories).forEach(([category, list]) => {
        text += `\n📁 ${category}:\n`;
        list.forEach((item, idx) => {
          text += `  ${idx + 1}. ${item.name} ${item.note ? `[${item.note}]` : ''}\n`;
        });
      });
      text += `\n--------------------------------\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    });
  };

  return (
    <div className="space-y-3.5 sm:space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-100/90 via-orange-100/70 to-rose-100/80 border border-amber-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <Camera size={16} />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-stone-900 tracking-tight">
                Daftar Sesi Foto Tamu &amp; Keluarga
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5">
                Panduan urutan sesi foto panggung resepsi pernikahan Andre &amp; Lois Erin
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
          <button
            type="button"
            onClick={handleCopyList}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold bg-white/90 hover:bg-white text-stone-700 border border-stone-300/80 shadow-xs transition flex items-center gap-1.5"
            title="Salin daftar untuk WhatsApp / MC"
          >
            {copiedNotification ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{copiedNotification ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold bg-white/90 hover:bg-white text-stone-700 border border-stone-300/80 shadow-xs transition flex items-center gap-1.5"
            title="Cetak daftar foto"
          >
            <Printer size={13} />
            <span>Cetak</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-stone-900 to-stone-800 hover:from-stone-800 hover:to-stone-700 text-white shadow-xs transition flex items-center gap-1.5"
          >
            <Plus size={13} />
            <span>Tambah Rombongan</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="nude-card p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-white to-amber-50/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Total Sesi Foto</span>
          <div className="text-2xl font-bold text-stone-900 mt-1 tabular-nums">{stats.total}</div>
          <p className="text-[11px] text-stone-500 mt-0.5">Rombongan terdaftar</p>
        </div>

        <div className="nude-card p-3.5 rounded-2xl bg-gradient-to-br from-white to-sky-50/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">Pihak Andre</span>
          <div className="text-2xl font-bold text-sky-900 mt-1 tabular-nums">{stats.andreCount}</div>
          <p className="text-[11px] text-sky-700 mt-0.5">Keluarga &amp; sahabat pria</p>
        </div>

        <div className="nude-card p-3.5 rounded-2xl bg-gradient-to-br from-white to-rose-50/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">Pihak Lois Erin</span>
          <div className="text-2xl font-bold text-rose-900 mt-1 tabular-nums">{stats.loisCount}</div>
          <p className="text-[11px] text-rose-700 mt-0.5">Keluarga &amp; kerabat wanita</p>
        </div>

        <div className="nude-card p-3.5 rounded-2xl bg-gradient-to-br from-white to-orange-50/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Catatan Khusus</span>
          <div className="text-2xl font-bold text-amber-900 mt-1 tabular-nums">
            {stats.toConfirm + stats.tidakHadir}
          </div>
          <p className="text-[11px] text-amber-700 mt-0.5">
            {stats.toConfirm} to confirm · {stats.tidakHadir} absen
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl nude-card">
        {/* Side Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'Semua', label: 'Semua Rombongan', count: items.length },
            { id: 'Andre', label: 'Pihak Andre (Pria)', count: stats.andreCount },
            { id: 'Lois', label: 'Pihak Lois Erin (Wanita)', count: stats.loisCount }
          ].map(side => (
            <button
              key={side.id}
              onClick={() => setSelectedSide(side.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedSide === side.id 
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-xs font-bold' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
              }`}
            >
              <span>{side.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedSide === side.id ? 'bg-white/20 text-white' : 'bg-stone-200/80 text-stone-700'
              }`}>
                {side.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama keluarga / rombongan..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-stone-50/50 focus:bg-white outline-none focus:border-amber-600 transition"
          />
        </div>
      </div>

      {/* Main Hierarchical List Render */}
      <div className="space-y-6">
        {Object.keys(groupedData).length === 0 ? (
          <div className="nude-card rounded-2xl p-12 text-center">
            <Camera size={28} className="mx-auto text-stone-300 mb-2" />
            <h4 className="text-sm font-bold text-stone-800">Tidak ada rombongan yang cocok</h4>
            <p className="text-xs text-stone-500 mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
          </div>
        ) : (
          Object.entries(groupedData).map(([sideTitle, categories]) => {
            const isAndre = sideTitle.includes('Andre');

            return (
              <div 
                key={sideTitle}
                className={`rounded-3xl border p-4 sm:p-6 transition-all ${
                  isAndre 
                    ? 'border-sky-200/80 bg-gradient-to-b from-sky-50/40 via-white to-sky-50/20' 
                    : 'border-rose-200/80 bg-gradient-to-b from-rose-50/40 via-white to-rose-50/20'
                }`}
              >
                {/* Side Header Banner */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200/80">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                      isAndre ? 'bg-gradient-to-tr from-sky-600 to-blue-700' : 'bg-gradient-to-tr from-rose-500 to-pink-600'
                    }`}>
                      {isAndre ? <User size={16} /> : <Sparkles size={16} />}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-stone-900 tracking-tight">
                        {sideTitle}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {Object.values(categories).reduce((sum, list) => sum + list.length, 0)} Sesi Pemotretan
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenAddForSide(sideTitle)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 hover:text-stone-900 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                    title={`Tambah rombongan baru untuk ${sideTitle}`}
                  >
                    <Plus size={13} className={isAndre ? 'text-sky-600' : 'text-rose-600'} />
                    <span className="hidden sm:inline">Tambah Rombongan</span>
                    <span className="sm:hidden">Tambah</span>
                  </button>
                </div>

                {/* Categories inside this side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(categories).map(([catName, list]) => (
                    <div 
                      key={catName}
                      className="nude-card rounded-2xl p-4 bg-white flex flex-col justify-between"
                    >
                      <div>
                        {/* Category Header with + Tambah Button */}
                        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-100">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="p-1 rounded-lg bg-stone-50 border border-stone-200/70 flex-shrink-0">
                              {getCategoryIcon(catName)}
                            </span>
                            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider truncate">
                              {catName}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[11px] font-semibold text-stone-400 tabular-nums">
                              {list.length} sesi
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenAddForCategory(sideTitle, catName)}
                              className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200/90 text-amber-900 text-[11px] font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer"
                              title={`Tambah sesi foto di kategori ${catName}`}
                              aria-label={`Tambah sesi foto di kategori ${catName}`}
                            >
                              <Plus size={12} className="text-amber-700 stroke-[2.5]" />
                              <span>Tambah</span>
                            </button>
                          </div>
                        </div>

                        {/* List items */}
                        <div className="space-y-2">
                          {list.length === 0 ? (
                            <div className="py-4 text-center text-xs text-stone-400 italic">
                              Belum ada sesi di kategori ini.
                            </div>
                          ) : (
                            list.map((item, idx) => {
                              const isToConfirm = item.note?.toLowerCase().includes('confirm');
                              const isAbsent = item.note?.toLowerCase().includes('tidak');

                              return (
                                <div
                                  key={item.id}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition group ${
                                    isAbsent 
                                      ? 'bg-rose-50/40 border-rose-200 text-stone-400' 
                                      : isToConfirm 
                                      ? 'bg-amber-50/50 border-amber-200' 
                                      : 'bg-stone-50/50 border-stone-200/80 hover:bg-stone-50'
                                  }`}
                                >
                                  <div className="flex items-start gap-2.5 min-w-0">
                                    <span className="w-5 h-5 rounded-md bg-stone-200/70 text-stone-600 flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`text-xs font-bold ${
                                          isAbsent ? 'line-through text-stone-400' : 'text-stone-900'
                                        }`}>
                                          {item.name}
                                        </span>

                                        {isToConfirm && (
                                          <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                            <AlertCircle size={10} /> {item.note}
                                          </span>
                                        )}

                                        {isAbsent && (
                                          <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                            <UserX size={10} /> {item.note}
                                          </span>
                                        )}
                                      </div>

                                      {item.detail && (
                                        <p className="text-[11px] text-stone-500 mt-0.5">
                                          {item.detail}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 flex-shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEdit(item)}
                                      className="p-1 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 cursor-pointer"
                                      title="Edit"
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(item.id)}
                                      className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                      title="Hapus"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Card Bottom Quick Add Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenAddForCategory(sideTitle, catName)}
                        className="w-full mt-3 py-2 px-3 rounded-xl border border-dashed border-stone-300 hover:border-amber-500 bg-stone-50/50 hover:bg-gradient-to-r hover:from-amber-50/70 hover:to-orange-50/70 text-stone-600 hover:text-amber-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs group/btn cursor-pointer"
                        title={`Tambah sesi foto di kategori ${catName}`}
                      >
                        <div className="w-4 h-4 rounded-full bg-stone-200 group-hover/btn:bg-amber-600 group-hover/btn:text-white flex items-center justify-center transition-colors">
                          <Plus size={11} className="stroke-[2.5]" />
                        </div>
                        <span>Tambah Sesi di {catName}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Simple Modal Add/Edit Photo Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs">
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-rose-50">
              <h3 className="text-sm font-bold text-stone-900 truncate pr-2">
                {editingItem 
                  ? 'Edit Sesi Foto' 
                  : formData.category 
                  ? `Tambah Sesi Foto — ${formData.category}` 
                  : 'Tambah Sesi Foto Baru'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
                  Pihak Mempelai
                </label>
                <select
                  value={formData.side}
                  onChange={(e) => setFormData({ ...formData, side: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white outline-none focus:border-amber-600"
                >
                  <option value="Andre (Mempelai Pria)">Andre (Mempelai Pria)</option>
                  <option value="Lois Erin (Mempelai Wanita)">Lois Erin (Mempelai Wanita)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
                  Kategori / Hubungan Keluarga
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Contoh: Keluarga Inti, Keluarga Besar (Pihak Bapak)..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
                  Nama Sesi / Nama Rombongan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Kel. Om / Tante Ke-2 (Kel. Bpk Nainggolan)"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
                  Keterangan Anggota Rombongan
                </label>
                <input
                  type="text"
                  value={formData.detail}
                  onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                  placeholder="Contoh: Papa, Mama, 2 Anak..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Contoh: to be confirm / tidak hadir / rombongan 8 orang..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-stone-600 hover:bg-stone-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-rose-600 text-white font-semibold shadow-xs"
                >
                  Simpan Sesi Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
