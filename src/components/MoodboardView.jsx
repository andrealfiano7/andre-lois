import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Palette, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Download, 
  X, 
  Upload, 
  Image as ImageIcon, 
  Layers, 
  ExternalLink, 
  Eye, 
  Check, 
  Sparkles, 
  RotateCcw, 
  FolderPlus, 
  Tag, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLOR_PRESETS } from '../data/initialMoodboard';

// Helper to compress local image files via Canvas
function compressImageFile(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export function MoodboardView({
  items = [],
  categories = [],
  onChangeItems,
  onChangeCategories,
  onResetToDefault
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);

  // Upload Form State
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    imageUrl: '',
    notes: '',
    source: ''
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  // Category Manager Form State
  const [categoryFormData, setCategoryFormData] = useState({
    id: '',
    label: '',
    color: 'amber'
  });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const safeItems = Array.isArray(items) ? items : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  // Helper to get category details
  const getCategory = (catId) => {
    return safeCategories.find(c => c.id === catId) || {
      id: catId,
      label: catId || 'Lainnya',
      color: 'amber'
    };
  };

  // Helper to get category badge style
  const getCategoryBadgeClass = (catId) => {
    const cat = getCategory(catId);
    const preset = COLOR_PRESETS.find(p => p.id === cat.color) || COLOR_PRESETS[0];
    return preset.badgeColor;
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return safeItems.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cat = getCategory(item.categoryId);
        const match = [
          item.title,
          item.notes,
          item.source,
          cat?.label
        ].some(val => val?.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [safeItems, selectedCategory, searchQuery, safeCategories]);

  // Open Upload / Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    const defaultCat = selectedCategory !== 'all' ? selectedCategory : (safeCategories[0]?.id || 'dekorasi');
    setFormData({
      title: '',
      categoryId: defaultCat,
      imageUrl: '',
      notes: '',
      source: ''
    });
    setIsUploadModalOpen(true);
  };

  // Open Edit Item Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      categoryId: item.categoryId || safeCategories[0]?.id || 'dekorasi',
      imageUrl: item.imageUrl || '',
      notes: item.notes || '',
      source: item.source || ''
    });
    setDetailItem(null);
    setIsUploadModalOpen(true);
  };

  // Handle Local File Pick & Compression
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar yang valid (JPEG, PNG, atau WEBP).');
      return;
    }

    try {
      setIsCompressing(true);
      const compressedDataUrl = await compressImageFile(file);
      setFormData(prev => ({
        ...prev,
        imageUrl: compressedDataUrl,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "")
      }));
    } catch (err) {
      console.error(err);
      alert('Gagal memproses gambar. Coba gunakan gambar lain.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Save Item (Add or Edit)
  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Harap isi judul inspirasi.');
      return;
    }
    if (!formData.imageUrl.trim()) {
      alert('Harap upload gambar atau masukkan URL gambar.');
      return;
    }

    if (editingItem) {
      const updated = safeItems.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            ...formData
          };
        }
        return item;
      });
      onChangeItems?.(updated);
    } else {
      const newItem = {
        id: `mb-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onChangeItems?.([newItem, ...safeItems]);
    }
    setIsUploadModalOpen(false);
  };

  // Delete Item
  const handleDeleteItem = (id, title) => {
    if (window.confirm(`Hapus inspirasi "${title}" dari moodboard?`)) {
      const updated = safeItems.filter(i => i.id !== id);
      onChangeItems?.(updated);
      if (detailItem?.id === id) setDetailItem(null);
    }
  };

  // Download Image from Detail Popup
  const handleDownloadImage = (item) => {
    if (!item?.imageUrl) return;
    try {
      const link = document.createElement('a');
      link.href = item.imageUrl;
      link.download = `${item.title || 'moodboard-wedding'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(item.imageUrl, '_blank');
    }
  };

  // Category Manager: Add or Edit Category
  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!categoryFormData.label.trim()) return;

    if (editingCategoryId) {
      const updated = safeCategories.map(c => {
        if (c.id === editingCategoryId) {
          return {
            ...c,
            label: categoryFormData.label.trim(),
            color: categoryFormData.color
          };
        }
        return c;
      });
      onChangeCategories?.(updated);
      setEditingCategoryId(null);
    } else {
      const newCatId = categoryFormData.label.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 24) || `cat-${Date.now()}`;
      // Prevent duplicate ID
      const finalId = safeCategories.some(c => c.id === newCatId) ? `${newCatId}-${Date.now().toString().slice(-4)}` : newCatId;
      const newCat = {
        id: finalId,
        label: categoryFormData.label.trim(),
        color: categoryFormData.color
      };
      onChangeCategories?.([...safeCategories, newCat]);
      setIsAddingCategory(false);
    }
    setCategoryFormData({ id: '', label: '', color: 'amber' });
  };

  // Category Manager: Delete Category
  const handleDeleteCategory = (catId, catLabel) => {
    if (safeCategories.length <= 1) {
      alert('Minimal harus ada satu kategori dalam moodboard.');
      return;
    }

    const itemsInCat = safeItems.filter(i => i.categoryId === catId);
    let confirmMsg = `Hapus kategori "${catLabel}"?`;
    if (itemsInCat.length > 0) {
      const fallbackCat = safeCategories.find(c => c.id !== catId);
      confirmMsg += `\n\nPerhatian: ${itemsInCat.length} foto dalam kategori ini akan otomatis dipindahkan ke kategori "${fallbackCat?.label}".`;
    }

    if (window.confirm(confirmMsg)) {
      const fallbackCat = safeCategories.find(c => c.id !== catId);
      // Reassign items
      if (itemsInCat.length > 0 && fallbackCat) {
        const updatedItems = safeItems.map(item => {
          if (item.categoryId === catId) {
            return { ...item, categoryId: fallbackCat.id };
          }
          return item;
        });
        onChangeItems?.(updatedItems);
      }
      // Remove category
      const updatedCategories = safeCategories.filter(c => c.id !== catId);
      onChangeCategories?.(updatedCategories);
      if (selectedCategory === catId) setSelectedCategory('all');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#EADBCE] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Palette size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
                  Moodboard &amp; Konsep Visual
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-fuchsia-50 text-fuchsia-900 border border-fuchsia-200">
                  {safeItems.length} Foto Inspirasi
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
                  {safeCategories.length} Kategori
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Koleksi inspirasi visual dekorasi, busana pengantin, riasan, bunga, dan palet warna acara
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Kelola, tambah, ubah warna atau hapus kategori"
            >
              <Tag size={14} className="text-stone-600" />
              <span>Kelola Kategori</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-stone-900 to-stone-800 hover:from-fuchsia-700 hover:to-rose-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Upload size={15} />
              <span>Upload Foto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Tab Section */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills Filter Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-2xl w-fit self-start overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              selectedCategory === 'all' 
                ? 'bg-white text-stone-900 shadow-2xs' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Semua</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              selectedCategory === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-300 text-stone-700'
            }`}>
              {safeItems.length}
            </span>
          </button>

          {safeCategories.map(cat => {
            const count = safeItems.filter(i => i.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isSelected 
                    ? 'bg-white text-stone-900 shadow-2xs' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-stone-900 text-white' : 'bg-stone-300 text-stone-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari konsep, judul, catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#EADBCE] rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-800"
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Grid Display: Pinterest / Editorial Style */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBCE] shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center mx-auto mb-3">
            <ImageIcon size={28} />
          </div>
          <h3 className="text-sm font-bold text-stone-800">Belum ada foto dalam kategori ini</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Mulai bangun moodboard pernikahan Anda dengan mengunggah foto gaun, dekorasi, riasan, atau bunga.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Upload size={14} />
              <span>Upload Foto Sekarang</span>
            </button>
            {(selectedCategory !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="px-3.5 py-2 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition cursor-pointer"
              >
                Lihat Semua Foto
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredItems.map(item => {
            const cat = getCategory(item.categoryId);
            const badgeClass = getCategoryBadgeClass(item.categoryId);

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => setDetailItem(item)}
                className="group relative bg-white rounded-3xl border border-[#EADBCE]/80 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
              >
                {/* Image Container with Hover Overlay */}
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-2 rounded-full bg-white/90 text-stone-900 shadow-md backdrop-blur-xs flex items-center gap-1.5 text-xs font-bold">
                      <Eye size={14} />
                      <span>Lihat Detail</span>
                    </span>
                  </div>

                  {/* Category Pill Tag */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border shadow-2xs backdrop-blur-xs ${badgeClass}`}>
                      {cat.label}
                    </span>
                  </div>
                </div>

                {/* Card Content Info */}
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 group-hover:text-fuchsia-900 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    {item.notes && (
                      <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Card Bottom Meta & Quick Edit/Delete */}
                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                    <span className="truncate max-w-[150px]">
                      {item.source ? `Sumber: ${item.source}` : 'Koleksi Pribadi'}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                        title="Edit detail"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id, item.title)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus foto"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bottom Footer Info */}
      <div className="p-4 rounded-3xl bg-white border border-[#EADBCE] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
        <div className="flex items-center gap-2 text-stone-600">
          <Sparkles size={16} className="text-fuchsia-600 shrink-0" />
          <span>
            Moodboard visual ini dapat Anda tunjukkan langsung kepada vendor dekorasi, MUA, dan fotografer saat rapat koordinasi.
          </span>
        </div>

        {onResetToDefault && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Kembalikan foto moodboard & kategori ke bawaan template? (Inspirasi kustom Anda akan ter-reset)')) {
                onResetToDefault();
              }
            }}
            className="text-[11px] font-bold text-stone-500 hover:text-rose-700 flex items-center gap-1 transition cursor-pointer shrink-0"
          >
            <RotateCcw size={12} />
            <span>Reset Moodboard Bawaan</span>
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. POPUP DETAIL LIGHTBOX MODAL (Portalled to document.body) */}
      {/* ======================================================== */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {detailItem && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm"
                onClick={() => setDetailItem(null)}
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full sm:max-w-2xl bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border-t sm:border border-stone-200 overflow-hidden flex flex-col z-10 max-h-[92vh]"
              >
                {/* Mobile Drag Indicator */}
                <div className="w-10 h-1 rounded-full bg-stone-300 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

                {/* Header Top Bar */}
                <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`px-2.5 py-0.5 rounded-xl text-[10px] font-extrabold border ${getCategoryBadgeClass(detailItem.categoryId)}`}>
                      {getCategory(detailItem.categoryId)?.label}
                    </span>
                    <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 truncate">
                      {detailItem.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetailItem(null)}
                    className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body: High-Res Image & Info */}
                <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
                  {/* Image Display */}
                  <div className="relative rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center max-h-[55vh]">
                    <img
                      src={detailItem.imageUrl}
                      alt={detailItem.title}
                      className="max-h-[52vh] w-auto max-w-full object-contain rounded-xl"
                    />
                  </div>

                  {/* Details Card */}
                  <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EADBCE]/80 space-y-2.5">
                    <div>
                      <h4 className="text-sm font-extrabold text-stone-900">
                        {detailItem.title}
                      </h4>
                      {detailItem.notes ? (
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          {detailItem.notes}
                        </p>
                      ) : (
                        <p className="text-xs text-stone-400 italic mt-1">
                          Tidak ada catatan konsep tambahan.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-[#EADBCE]/60 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <Tag size={12} className="text-stone-400" />
                        <span>Kategori: <strong>{getCategory(detailItem.categoryId)?.label}</strong></span>
                      </div>
                      {detailItem.source && (
                        <div className="flex items-center gap-1.5">
                          <ExternalLink size={12} className="text-stone-400" />
                          <span>Sumber: <strong>{detailItem.source}</strong></span>
                        </div>
                      )}
                      {detailItem.createdAt && (
                        <div className="flex items-center gap-1.5 text-stone-400">
                          <Calendar size={12} />
                          <span>Ditambahkan: {detailItem.createdAt}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="px-5 py-3 border-t border-stone-100 bg-stone-50/90 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDownloadImage(detailItem)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download size={14} />
                      <span>Unduh Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(detailItem)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 size={14} />
                      <span>Edit Detail</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(detailItem.id, detailItem.title)}
                    className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                    title="Hapus foto ini"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ======================================================== */}
      {/* 2. UPLOAD / EDIT FOTO MODAL (Portalled to document.body)  */}
      {/* ======================================================== */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs"
                onClick={() => setIsUploadModalOpen(false)}
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full sm:max-w-lg bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border-t sm:border border-stone-200 overflow-hidden flex flex-col z-10 max-h-[90vh]"
              >
                {/* Drag Pill */}
                <div className="w-10 h-1 rounded-full bg-stone-300 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

                {/* Header */}
                <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-fuchsia-50/80 via-white to-rose-50/70 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-rose-600 text-white flex items-center justify-center shadow-xs">
                      <Upload size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-stone-900">
                        {editingItem ? 'Edit Foto Moodboard' : 'Upload Foto Inspirasi Baru'}
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Upload dari galeri lokal HP/Laptop atau masukkan tautan URL
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSaveItem} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
                  {/* Image Upload Box & Preview */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Pilih / Upload Foto <span className="text-rose-500">*</span>
                    </label>

                    {formData.imageUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 aspect-[16/9] flex items-center justify-center group">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-white text-stone-900 font-bold text-xs shadow-md hover:bg-stone-100"
                          >
                            Ganti Foto
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md hover:bg-rose-700"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-stone-300 hover:border-fuchsia-400 hover:bg-fuchsia-50/20 rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center shadow-xs">
                          {isCompressing ? <RotateCcw size={20} className="animate-spin text-fuchsia-600" /> : <Upload size={20} />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-800">
                            {isCompressing ? 'Sedang mengompresi foto...' : 'Klik untuk Pilih Foto dari Perangkat'}
                          </p>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            Dukungan JPEG, PNG, WEBP (Otomatis dikompresi agar cepat)
                          </p>
                        </div>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Or URL input alternative */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] text-stone-400 uppercase font-semibold">Atau URL:</span>
                      <input
                        type="url"
                        placeholder="Tempel tautan URL gambar (https://...)"
                        value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                        className="flex-1 px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-800"
                      />
                    </div>
                  </div>

                  {/* Judul Inspirasi */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Judul / Nama Konsep <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Gaun Resepsi Satin, Dekorasi Lorong Masuk, Buket Lily..."
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:border-stone-800 focus:bg-white"
                    />
                  </div>

                  {/* Kategori */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600">
                        Kategori Moodboard <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsUploadModalOpen(false);
                          setIsCategoryModalOpen(true);
                        }}
                        className="text-[10px] text-fuchsia-600 hover:text-fuchsia-800 font-bold"
                      >
                        + Tambah Kategori
                      </button>
                    </div>

                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:border-stone-800 focus:bg-white cursor-pointer"
                    >
                      {safeCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Catatan / Konsep Detail */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Catatan / Detail Konsep (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Deskripsi detail, preferensi warna, jenis kain, jenis bunga, atau arahan untuk vendor..."
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:border-stone-800 focus:bg-white resize-none"
                    />
                  </div>

                  {/* Sumber Inspirasi */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Sumber Inspirasi / Vendor (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Pinterest, @dekorasi_wedding, Bridestory..."
                      value={formData.source}
                      onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:border-stone-800 focus:bg-white"
                    />
                  </div>

                  {/* Submit / Cancel Buttons (Pinned Footer) */}
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isCompressing}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-stone-900 to-stone-800 hover:from-fuchsia-700 hover:to-rose-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Check size={14} />
                      <span>{editingItem ? 'Simpan Perubahan' : 'Tambahkan ke Moodboard'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ======================================================== */}
      {/* 3. KELOLA KATEGORI MODAL (Portalled to document.body)     */}
      {/* ======================================================== */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isCategoryModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setIsAddingCategory(false);
                  setEditingCategoryId(null);
                }}
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border-t sm:border border-stone-200 overflow-hidden flex flex-col z-10 max-h-[88vh]"
              >
                {/* Drag Pill */}
                <div className="w-10 h-1 rounded-full bg-stone-300 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

                {/* Header */}
                <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-amber-50/80 via-white to-fuchsia-50/70 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-fuchsia-600 text-white flex items-center justify-center shadow-xs">
                      <Tag size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-stone-900">
                        Kelola Kategori Moodboard
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Tambah, ganti nama, ubah warna, atau hapus kategori
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCategoryModalOpen(false);
                      setIsAddingCategory(false);
                      setEditingCategoryId(null);
                    }}
                    className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
                  {/* Inline Form to Add / Edit Category */}
                  {(isAddingCategory || editingCategoryId) && (
                    <form onSubmit={handleSaveCategory} className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800">
                          {editingCategoryId ? 'Ubah Kategori' : 'Tambah Kategori Baru'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingCategory(false);
                            setEditingCategoryId(null);
                          }}
                          className="text-stone-400 hover:text-stone-600"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
                          Nama Kategori <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          autoFocus
                          placeholder="Contoh: Sepatu & Aksesoris, Catering, Seserahan..."
                          value={categoryFormData.label}
                          onChange={(e) => setCategoryFormData(prev => ({ ...prev, label: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:border-stone-800"
                        />
                      </div>

                      {/* Color Palette Picker */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1.5">
                          Warna Label
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {COLOR_PRESETS.map(preset => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setCategoryFormData(prev => ({ ...prev, color: preset.id }))}
                              className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${preset.bg} ${
                                categoryFormData.color === preset.id ? 'ring-2 ring-stone-900 ring-offset-2 scale-110 shadow-xs' : 'opacity-70 hover:opacity-100'
                              }`}
                              title={preset.label}
                            >
                              {categoryFormData.color === preset.id && <Check size={14} className="text-white stroke-[3]" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingCategory(false);
                            setEditingCategoryId(null);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-stone-500 hover:bg-stone-200/50"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-stone-900 text-white shadow-xs hover:bg-stone-800"
                        >
                          Simpan
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Add New Category Trigger Button */}
                  {!isAddingCategory && !editingCategoryId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategoryId(null);
                        setCategoryFormData({ id: '', label: '', color: 'amber' });
                        setIsAddingCategory(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-stone-300 hover:border-stone-800 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Tambah Kategori Baru</span>
                    </button>
                  )}

                  {/* Category List */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Daftar Kategori ({safeCategories.length})
                    </span>

                    <div className="divide-y divide-stone-100 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]/80 overflow-hidden">
                      {safeCategories.map(cat => {
                        const count = safeItems.filter(i => i.categoryId === cat.id).length;
                        const preset = COLOR_PRESETS.find(p => p.id === cat.color) || COLOR_PRESETS[0];

                        return (
                          <div 
                            key={cat.id}
                            className="p-3 flex items-center justify-between gap-2 hover:bg-white transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-3 h-3 rounded-full ${preset.bg} shrink-0`} />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-stone-900 truncate">
                                  {cat.label}
                                </p>
                                <p className="text-[10px] text-stone-400">
                                  {count} foto terdaftar
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingCategory(false);
                                  setEditingCategoryId(cat.id);
                                  setCategoryFormData({
                                    id: cat.id,
                                    label: cat.label,
                                    color: cat.color || 'amber'
                                  });
                                }}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                                title="Edit Kategori"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat.id, cat.label)}
                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Hapus Kategori"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between shrink-0">
                  {onResetToDefault ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Kembalikan kategori moodboard ke kategori bawaan template?')) {
                          onResetToDefault();
                        }
                      }}
                      className="text-xs text-stone-500 hover:text-stone-800 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Reset Bawaan</span>
                    </button>
                  ) : <div />}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCategoryModalOpen(false);
                      setIsAddingCategory(false);
                      setEditingCategoryId(null);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition cursor-pointer"
                  >
                    Selesai
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
