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
  Tag, 
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  Folder,
  Grid,
  Filter,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLOR_PRESETS, DEFAULT_MOODBOARD_CATEGORIES } from '../data/initialMoodboard';

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
  // Navigation level: null = Overview Katalog Kategori (Level 1), string catId = Halaman Khusus Kategori (Level 2)
  const [activeCategoryView, setActiveCategoryView] = useState(null);
  // Active sub-category filter inside category view: 'all' or sub-category id
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  // View mode in Level 1: 'boards' (Papan Kategori) or 'all-photos' (Semua Foto Galeri)
  const [level1Mode, setLevel1Mode] = useState('boards');
  // Global search query
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);

  // Upload Form State
  const [formData, setFormData] = useState({
    title: '',
    categoryId: 'dekorasi',
    subCategoryId: 'altar',
    imageUrl: '',
    notes: '',
    source: ''
  });
  const [isCreatingCustomSubCat, setIsCreatingCustomSubCat] = useState(false);
  const [customSubCatName, setCustomSubCatName] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  // Category Manager Form State
  const [categoryFormData, setCategoryFormData] = useState({
    id: '',
    label: '',
    desc: '',
    color: 'amber'
  });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Sub-Category Manager State
  const [editingSubCatId, setEditingSubCatId] = useState(null);
  const [subCatFormLabel, setSubCatFormLabel] = useState('');
  const [isAddingSubCat, setIsAddingSubCat] = useState(false);

  // Backward compatibility normalization for categories
  const safeCategories = useMemo(() => {
    const raw = Array.isArray(categories) && categories.length > 0 ? categories : DEFAULT_MOODBOARD_CATEGORIES;
    return raw.map(cat => {
      const def = DEFAULT_MOODBOARD_CATEGORIES.find(d => d.id === cat.id);
      const subCats = Array.isArray(cat.subCategories) && cat.subCategories.length > 0
        ? cat.subCategories
        : (def?.subCategories || [{ id: 'utama', label: 'Inspirasi Utama' }]);
      return {
        ...cat,
        desc: cat.desc || def?.desc || `Koleksi inspirasi dan konsep visual untuk ${cat.label}`,
        subCategories: subCats
      };
    });
  }, [categories]);

  // Backward compatibility normalization for items
  const safeItems = useMemo(() => {
    const raw = Array.isArray(items) ? items : [];
    return raw.map(item => {
      if (!item.subCategoryId) {
        const cat = safeCategories.find(c => c.id === item.categoryId);
        return {
          ...item,
          subCategoryId: cat?.subCategories?.[0]?.id || 'utama'
        };
      }
      return item;
    });
  }, [items, safeCategories]);

  // Current active category object
  const currentCategoryObj = useMemo(() => {
    if (!activeCategoryView) return null;
    return safeCategories.find(c => c.id === activeCategoryView) || safeCategories[0];
  }, [activeCategoryView, safeCategories]);

  // Helpers
  const getCategory = (catId) => {
    return safeCategories.find(c => c.id === catId) || {
      id: catId,
      label: catId || 'Lainnya',
      color: 'amber',
      subCategories: []
    };
  };

  const getSubCategoryLabel = (catId, subCatId) => {
    const cat = getCategory(catId);
    const sub = cat.subCategories?.find(s => s.id === subCatId);
    return sub?.label || 'Inspirasi Utama';
  };

  const getCategoryBadgeClass = (catId) => {
    const cat = getCategory(catId);
    const preset = COLOR_PRESETS.find(p => p.id === cat.color) || COLOR_PRESETS[0];
    return preset.badgeColor;
  };

  const getCategoryPreset = (catId) => {
    const cat = getCategory(catId);
    return COLOR_PRESETS.find(p => p.id === cat.color) || COLOR_PRESETS[0];
  };

  // Filtered items based on Category, Sub-Category, and Search Query
  const filteredItems = useMemo(() => {
    return safeItems.filter(item => {
      // In category detail view
      if (activeCategoryView && item.categoryId !== activeCategoryView) {
        return false;
      }
      // Sub-category filter
      if (activeCategoryView && activeSubCategory !== 'all' && item.subCategoryId !== activeSubCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cat = getCategory(item.categoryId);
        const subLabel = getSubCategoryLabel(item.categoryId, item.subCategoryId);
        const match = [
          item.title,
          item.notes,
          item.source,
          cat?.label,
          subLabel
        ].some(val => val?.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [safeItems, activeCategoryView, activeSubCategory, searchQuery, safeCategories]);

  // Open Upload Modal
  const handleOpenAdd = (targetCatId = null, targetSubCatId = null) => {
    setEditingItem(null);
    setIsCreatingCustomSubCat(false);
    setCustomSubCatName('');

    const defaultCat = targetCatId || activeCategoryView || safeCategories[0]?.id || 'dekorasi';
    const catObj = safeCategories.find(c => c.id === defaultCat) || safeCategories[0];
    const defaultSub = targetSubCatId || (activeSubCategory !== 'all' ? activeSubCategory : (catObj?.subCategories?.[0]?.id || 'utama'));

    setFormData({
      title: '',
      categoryId: defaultCat,
      subCategoryId: defaultSub,
      imageUrl: '',
      notes: '',
      source: ''
    });
    setIsUploadModalOpen(true);
  };

  // Open Edit Item Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsCreatingCustomSubCat(false);
    setCustomSubCatName('');

    setFormData({
      title: item.title || '',
      categoryId: item.categoryId || safeCategories[0]?.id || 'dekorasi',
      subCategoryId: item.subCategoryId || 'utama',
      imageUrl: item.imageUrl || '',
      notes: item.notes || '',
      source: item.source || ''
    });
    setDetailItem(null);
    setIsUploadModalOpen(true);
  };

  // Handle Local File Pick & Canvas Compression
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

    let finalSubCatId = formData.subCategoryId;

    // If user created a custom sub-category on the fly
    if (isCreatingCustomSubCat && customSubCatName.trim()) {
      const newSubId = customSubCatName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20) || `sub-${Date.now()}`;
      const newSub = { id: newSubId, label: customSubCatName.trim() };
      
      const updatedCategories = safeCategories.map(c => {
        if (c.id === formData.categoryId) {
          const currentSubs = c.subCategories || [];
          if (!currentSubs.some(s => s.id === newSubId)) {
            return { ...c, subCategories: [...currentSubs, newSub] };
          }
        }
        return c;
      });
      onChangeCategories?.(updatedCategories);
      finalSubCatId = newSubId;
    }

    if (editingItem) {
      const updated = safeItems.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            ...formData,
            subCategoryId: finalSubCatId
          };
        }
        return item;
      });
      onChangeItems?.(updated);
    } else {
      const newItem = {
        id: `mb-${Date.now()}`,
        ...formData,
        subCategoryId: finalSubCatId,
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
            desc: categoryFormData.desc.trim() || c.desc,
            color: categoryFormData.color
          };
        }
        return c;
      });
      onChangeCategories?.(updated);
      setEditingCategoryId(null);
    } else {
      const newCatId = categoryFormData.label.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 24) || `cat-${Date.now()}`;
      const finalId = safeCategories.some(c => c.id === newCatId) ? `${newCatId}-${Date.now().toString().slice(-4)}` : newCatId;
      const newCat = {
        id: finalId,
        label: categoryFormData.label.trim(),
        desc: categoryFormData.desc.trim() || `Koleksi inspirasi dan konsep visual untuk ${categoryFormData.label.trim()}`,
        color: categoryFormData.color,
        subCategories: [
          { id: 'utama', label: 'Inspirasi Utama' }
        ]
      };
      onChangeCategories?.([...safeCategories, newCat]);
      setIsAddingCategory(false);
    }
    setCategoryFormData({ id: '', label: '', desc: '', color: 'amber' });
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
      if (itemsInCat.length > 0 && fallbackCat) {
        const updatedItems = safeItems.map(item => {
          if (item.categoryId === catId) {
            return { 
              ...item, 
              categoryId: fallbackCat.id,
              subCategoryId: fallbackCat.subCategories?.[0]?.id || 'utama'
            };
          }
          return item;
        });
        onChangeItems?.(updatedItems);
      }
      const updatedCategories = safeCategories.filter(c => c.id !== catId);
      onChangeCategories?.(updatedCategories);
      if (activeCategoryView === catId) {
        setActiveCategoryView(null);
      }
    }
  };

  // Sub-Category Manager: Add or Edit Sub-Category
  const handleSaveSubCategory = (e) => {
    e.preventDefault();
    if (!subCatFormLabel.trim() || !activeCategoryView) return;

    if (editingSubCatId) {
      const updated = safeCategories.map(c => {
        if (c.id === activeCategoryView) {
          return {
            ...c,
            subCategories: (c.subCategories || []).map(s => {
              if (s.id === editingSubCatId) {
                return { ...s, label: subCatFormLabel.trim() };
              }
              return s;
            })
          };
        }
        return c;
      });
      onChangeCategories?.(updated);
      setEditingSubCatId(null);
    } else {
      const newSubId = subCatFormLabel.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20) || `sub-${Date.now()}`;
      const updated = safeCategories.map(c => {
        if (c.id === activeCategoryView) {
          const currentSubs = c.subCategories || [];
          const finalId = currentSubs.some(s => s.id === newSubId) ? `${newSubId}-${Date.now().toString().slice(-4)}` : newSubId;
          return {
            ...c,
            subCategories: [...currentSubs, { id: finalId, label: subCatFormLabel.trim() }]
          };
        }
        return c;
      });
      onChangeCategories?.(updated);
      setIsAddingSubCat(false);
    }
    setSubCatFormLabel('');
  };

  // Sub-Category Manager: Delete Sub-Category
  const handleDeleteSubCategory = (subCatId, subCatLabel) => {
    if (!currentCategoryObj) return;
    const currentSubs = currentCategoryObj.subCategories || [];
    if (currentSubs.length <= 1) {
      alert('Minimal harus ada satu sub-kategori di dalam kategori ini.');
      return;
    }

    const itemsInSub = safeItems.filter(i => i.categoryId === activeCategoryView && i.subCategoryId === subCatId);
    let confirmMsg = `Hapus sub-kategori "${subCatLabel}"?`;
    if (itemsInSub.length > 0) {
      const fallbackSub = currentSubs.find(s => s.id !== subCatId);
      confirmMsg += `\n\nPerhatian: ${itemsInSub.length} foto dalam sub-kategori ini akan otomatis dipindahkan ke sub-kategori "${fallbackSub?.label}".`;
    }

    if (window.confirm(confirmMsg)) {
      const fallbackSub = currentSubs.find(s => s.id !== subCatId);
      if (itemsInSub.length > 0 && fallbackSub) {
        const updatedItems = safeItems.map(item => {
          if (item.categoryId === activeCategoryView && item.subCategoryId === subCatId) {
            return { ...item, subCategoryId: fallbackSub.id };
          }
          return item;
        });
        onChangeItems?.(updatedItems);
      }
      const updatedCategories = safeCategories.map(c => {
        if (c.id === activeCategoryView) {
          return {
            ...c,
            subCategories: (c.subCategories || []).filter(s => s.id !== subCatId)
          };
        }
        return c;
      });
      onChangeCategories?.(updatedCategories);
      if (activeSubCategory === subCatId) {
        setActiveSubCategory('all');
      }
    }
  };

  // Get cover image(s) for a category
  const getCategoryCovers = (catId) => {
    const catPhotos = safeItems.filter(i => i.categoryId === catId);
    return catPhotos.map(p => p.imageUrl).filter(Boolean);
  };

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ========================================================================= */}
      {/* LEVEL 2: DEDICATED CATEGORY PAGE (HALAMAN KHUSUS PER KATEGORI & SUB-KAT)  */}
      {/* ========================================================================= */}
      {activeCategoryView && currentCategoryObj ? (
        <div className="space-y-4 sm:space-y-5 animate-fade-in">
          {/* Unified Sleek Category Header Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EADBCE] shadow-xs space-y-3.5">
            {/* Top Row: Back button, Title & Badges, Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Left: Back button + Title */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategoryView(null);
                    setActiveSubCategory('all');
                    setSearchQuery('');
                  }}
                  className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-[#FAF7F2] hover:bg-stone-100 border border-[#EADBCE] text-stone-700 hover:text-stone-900 flex items-center gap-1.5 transition shadow-2xs cursor-pointer group shrink-0"
                  title="Kembali ke Semua Kategori"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                  <span className="hidden sm:inline text-xs font-bold">Semua Kategori</span>
                </button>

                <div className="h-6 w-px bg-stone-200 hidden sm:block shrink-0" />

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-xl font-extrabold text-stone-900 tracking-tight">
                      {currentCategoryObj.label}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80">
                      {safeItems.filter(i => i.categoryId === currentCategoryObj.id).length} Foto
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-stone-100 text-stone-600">
                      {currentCategoryObj.subCategories?.length || 0} Sub-Kategori
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                    {currentCategoryObj.desc}
                  </p>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsSubCategoryModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Kelola Sub-Kategori"
                >
                  <Layers size={13} className="text-stone-500" />
                  <span className="hidden sm:inline">Kelola Sub-Kategori</span>
                  <span className="sm:hidden">Kelola</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAdd(currentCategoryObj.id, activeSubCategory !== 'all' ? activeSubCategory : null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-stone-900 to-stone-800 hover:from-amber-700 hover:to-rose-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Upload size={13} />
                  <span>Upload Foto</span>
                </button>
              </div>
            </div>

            {/* Subtle Divider Line */}
            <div className="h-px bg-stone-100" />

            {/* Bottom Row: Sub-Category Pills & Live Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Horizontal Scrollable Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar max-w-full">
                <button
                  type="button"
                  onClick={() => setActiveSubCategory('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeSubCategory === 'all'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100/90 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                  }`}
                >
                  <span>Semua Sub-Kategori</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    activeSubCategory === 'all' ? 'bg-white/20 text-white' : 'bg-white text-stone-700'
                  }`}>
                    {safeItems.filter(i => i.categoryId === currentCategoryObj.id).length}
                  </span>
                </button>

                {(currentCategoryObj.subCategories || []).map(sub => {
                  const count = safeItems.filter(i => i.categoryId === currentCategoryObj.id && i.subCategoryId === sub.id).length;
                  const isSelected = activeSubCategory === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setActiveSubCategory(sub.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-stone-100/90 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                      }`}
                    >
                      <span>{sub.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white text-stone-700'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    setIsSubCategoryModalOpen(true);
                    setIsAddingSubCat(true);
                    setEditingSubCatId(null);
                    setSubCatFormLabel('');
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-900 hover:bg-stone-100 border border-dashed border-stone-300 transition flex items-center gap-1 cursor-pointer shrink-0"
                  title="Tambah Sub-Kategori Baru"
                >
                  <Plus size={12} />
                  <span>+ Sub-Kategori</span>
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-56 shrink-0">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari foto di sini..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-800 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Gallery Content */}
          {activeSubCategory === 'all' && !searchQuery ? (
            /* Mode 1: Grouped by Sub-Categories with Section Headers */
            <div className="space-y-8">
              {(currentCategoryObj.subCategories || []).map(sub => {
                const subPhotos = safeItems.filter(i => i.categoryId === currentCategoryObj.id && i.subCategoryId === sub.id);
                return (
                  <div key={sub.id} className="space-y-3">
                    <div className="flex items-center justify-between gap-3 border-b border-[#EADBCE] pb-2">
                      <div className="flex items-center gap-2">
                        <Folder size={16} className="text-stone-400" />
                        <h3 className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight">
                          {sub.label}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                          {subPhotos.length} foto
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleOpenAdd(currentCategoryObj.id, sub.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Tambah Foto</span>
                      </button>
                    </div>

                    {subPhotos.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {subPhotos.map(item => (
                          <PhotoCard
                            key={item.id}
                            item={item}
                            categoryObj={currentCategoryObj}
                            subCatLabel={sub.label}
                            onViewDetail={setDetailItem}
                            onEdit={handleOpenEdit}
                            onDelete={handleDeleteItem}
                          />
                        ))}
                      </div>
                    ) : (
                      <div 
                        onClick={() => handleOpenAdd(currentCategoryObj.id, sub.id)}
                        className="p-6 rounded-2xl border-2 border-dashed border-stone-200/90 hover:border-amber-400 bg-white/60 hover:bg-amber-50/20 text-center transition cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-700 flex items-center justify-center mx-auto mb-2 transition">
                          <Plus size={16} />
                        </div>
                        <p className="text-xs font-bold text-stone-700">
                          Belum ada foto di "{sub.label}"
                        </p>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Klik untuk mengunggah foto inspirasi untuk sub-kategori ini.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Mode 2: Specific Sub-Category Filtered Masonry */
            <div>
              {filteredItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBCE] shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3">
                    <ImageIcon size={28} />
                  </div>
                  <h3 className="text-sm font-bold text-stone-800">Tidak ada foto ditemukan</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    {searchQuery ? `Tidak ada hasil untuk kata kunci "${searchQuery}".` : 'Belum ada foto yang diunggah pada sub-kategori ini.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenAdd(currentCategoryObj.id, activeSubCategory !== 'all' ? activeSubCategory : null)}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Upload size={14} />
                    <span>Upload Foto Sekarang</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map(item => (
                    <PhotoCard
                      key={item.id}
                      item={item}
                      categoryObj={getCategory(item.categoryId)}
                      subCatLabel={getSubCategoryLabel(item.categoryId, item.subCategoryId)}
                      onViewDetail={setDetailItem}
                      onEdit={handleOpenEdit}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* LEVEL 1: OVERVIEW KATALOG KATEGORI (CATEGORY BOARDS OVERVIEW)             */
        /* ========================================================================= */
        <div className="space-y-5 animate-fade-in">
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
                      {safeCategories.length} Papan Kategori
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
                      {safeItems.length} Foto Terdaftar
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Pilih kategori untuk membuka galeri foto dan sub-kategori spesifik
                  </p>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* View Toggle Button */}
                <div className="p-1 bg-stone-100 rounded-xl flex items-center gap-1 border border-stone-200/80">
                  <button
                    type="button"
                    onClick={() => setLevel1Mode('boards')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      level1Mode === 'boards' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                    }`}
                    title="Tampilan Papan Kategori"
                  >
                    <Grid size={13} />
                    <span>Papan Kategori</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLevel1Mode('all-photos')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      level1Mode === 'all-photos' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                    }`}
                    title="Tampilan Seluruh Foto"
                  >
                    <ImageIcon size={13} />
                    <span>Semua Foto</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Kelola, tambah, ubah warna atau hapus kategori induk"
                >
                  <Tag size={14} className="text-stone-600" />
                  <span>Kelola Kategori</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAdd()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-stone-900 to-stone-800 hover:from-fuchsia-700 hover:to-rose-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Upload size={14} />
                  <span>Upload Foto</span>
                </button>
              </div>
            </div>
          </div>

          {/* Level 1 Search */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold text-stone-600">
              {level1Mode === 'boards' ? 'Daftar Kategori Moodboard Pernikahan' : `Seluruh Foto Inspirasi (${filteredItems.length})`}
            </p>

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

          {/* Display Mode 1: Boards Grid (Overview) */}
          {level1Mode === 'boards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {safeCategories.map(cat => {
                const covers = getCategoryCovers(cat.id);
                const catPreset = getCategoryPreset(cat.id);
                const subCats = cat.subCategories || [];
                const photoCount = safeItems.filter(i => i.categoryId === cat.id).length;

                return (
                  <motion.div
                    key={cat.id}
                    whileHover={{ y: -3 }}
                    onClick={() => {
                      setActiveCategoryView(cat.id);
                      setActiveSubCategory('all');
                      setSearchQuery('');
                    }}
                    className="nude-card rounded-3xl overflow-hidden border border-[#EADBCE] hover:border-amber-400/90 transition shadow-xs hover:shadow-md cursor-pointer flex flex-col group bg-white"
                  >
                    {/* Cover Preview Area */}
                    <div className="h-44 sm:h-48 w-full bg-stone-100 relative overflow-hidden">
                      {covers.length >= 3 ? (
                        <div className="grid grid-cols-3 h-full gap-0.5">
                          <img src={covers[0]} alt={cat.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <img src={covers[1]} alt={cat.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <img src={covers[2]} alt={cat.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      ) : covers.length > 0 ? (
                        <img 
                          src={covers[0]} 
                          alt={cat.label} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 text-stone-300">
                          <Palette size={36} className="text-stone-300 group-hover:scale-110 transition-transform" />
                          <span className="text-[11px] font-bold text-stone-400 mt-2">Belum ada foto</span>
                        </div>
                      )}

                      {/* Floating Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold shadow-xs ${catPreset.badgeColor} backdrop-blur-md`}>
                          {cat.label}
                        </span>
                      </div>

                      {/* Photo counter chip */}
                      <div className="absolute bottom-3 right-3 z-10">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm shadow-xs flex items-center gap-1">
                          <ImageIcon size={11} />
                          <span>{photoCount} Foto</span>
                        </span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-stone-900 group-hover:text-amber-800 transition">
                          {cat.label}
                        </h3>
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                          {cat.desc}
                        </p>

                        {/* Sub-Category Pills Preview */}
                        <div className="mt-3 flex flex-wrap gap-1">
                          {subCats.slice(0, 3).map(sub => (
                            <span 
                              key={sub.id} 
                              className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium"
                            >
                              {sub.label}
                            </span>
                          ))}
                          {subCats.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500 text-[10px] font-bold">
                              +{subCats.length - 3} lainnya
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Bar */}
                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-700">
                        <span>{subCats.length} Sub-Kategori</span>
                        <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Buka Moodboard</span>
                          <ArrowRight size={13} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Display Mode 2: All Photos Masonry Grid */}
          {level1Mode === 'all-photos' && (
            <div>
              {filteredItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBCE] shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center mx-auto mb-3">
                    <ImageIcon size={28} />
                  </div>
                  <h3 className="text-sm font-bold text-stone-800">Belum ada foto dalam moodboard</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    Mulai bangun moodboard pernikahan dengan mengunggah foto gaun, dekorasi, riasan, atau bunga.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenAdd()}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Upload size={14} />
                    <span>Upload Foto Sekarang</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map(item => (
                    <PhotoCard
                      key={item.id}
                      item={item}
                      categoryObj={getCategory(item.categoryId)}
                      subCatLabel={getSubCategoryLabel(item.categoryId, item.subCategoryId)}
                      onViewDetail={setDetailItem}
                      onEdit={handleOpenEdit}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: UPLOAD / EDIT MOODBOARD PHOTO                                     */}
      {/* ========================================================================= */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs overscroll-contain">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden flex flex-col max-h-[92vh]"
              >
                {/* Mobile Drag Indicator */}
                <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />

                {/* Header */}
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                      <ImageIcon size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">
                        {editingItem ? 'Edit Inspirasi Moodboard' : 'Upload Foto Inspirasi'}
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Tambahkan foto ke dalam kategori &amp; sub-kategori visual
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Scrollable Form Body */}
                <form onSubmit={handleSaveItem} className="p-5 overflow-y-auto space-y-4 flex-1">
                  {/* Category & Sub-Category Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Category Select */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Kategori Induk <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => {
                          const newCatId = e.target.value;
                          const catObj = safeCategories.find(c => c.id === newCatId);
                          const firstSub = catObj?.subCategories?.[0]?.id || 'utama';
                          setFormData(prev => ({
                            ...prev,
                            categoryId: newCatId,
                            subCategoryId: firstSub
                          }));
                          setIsCreatingCustomSubCat(false);
                        }}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:border-stone-800"
                      >
                        {safeCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sub-Category Select */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-stone-700">
                          Sub-Kategori <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCreatingCustomSubCat(!isCreatingCustomSubCat)}
                          className="text-[10px] font-bold text-amber-800 hover:underline"
                        >
                          {isCreatingCustomSubCat ? 'Pilih yang ada' : '+ Buat Baru'}
                        </button>
                      </div>

                      {isCreatingCustomSubCat ? (
                        <input
                          type="text"
                          placeholder="Nama sub-kategori baru..."
                          value={customSubCatName}
                          onChange={(e) => setCustomSubCatName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-amber-600"
                        />
                      ) : (
                        <select
                          value={formData.subCategoryId}
                          onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:border-stone-800"
                        >
                          {(safeCategories.find(c => c.id === formData.categoryId)?.subCategories || []).map(sub => (
                            <option key={sub.id} value={sub.id}>
                              {sub.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Judul / Konsep <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Gaun Pengantin Minimalis A-Line & Veil"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-stone-800"
                    />
                  </div>

                  {/* Image Picker: File Upload or External URL */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Pilihan Gambar <span className="text-rose-500">*</span>
                    </label>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="moodboard-file-input"
                        />
                        <label
                          htmlFor="moodboard-file-input"
                          className="flex-1 py-2.5 px-3 border border-dashed border-stone-300 hover:border-stone-800 bg-stone-50 hover:bg-stone-100 rounded-xl text-xs font-bold text-stone-700 flex items-center justify-center gap-2 cursor-pointer transition"
                        >
                          <Upload size={14} className="text-amber-800" />
                          <span>{isCompressing ? 'Mengompresi Gambar...' : 'Pilih File (Kamera / Galeri)'}</span>
                        </label>
                      </div>

                      <div className="relative">
                        <input
                          type="url"
                          placeholder="Atau tempel tautan URL gambar (https://...)"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="w-full pl-3 pr-8 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-800"
                        />
                        {formData.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, imageUrl: '' })}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Image Preview Box */}
                    {formData.imageUrl && (
                      <div className="mt-2.5 relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 aspect-video max-h-48 flex items-center justify-center">
                        <img 
                          src={formData.imageUrl} 
                          alt="Preview" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                          Pratinjau Gambar
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notes / Concept Details */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Catatan Konsep &amp; Detail Arahan
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tuliskan palet warna, siluet gaun, jenis bunga, atau catatan khusus untuk vendor..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-800"
                    />
                  </div>

                  {/* Source Reference / Vendor */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Sumber Referensi / Vendor
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Pinterest, Atelier Gaun, Florist Studio"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-800"
                    />
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isCompressing}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition shadow-xs disabled:opacity-50"
                    >
                      {editingItem ? 'Simpan Perubahan' : 'Upload ke Moodboard'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DETAIL LIGHTBOX POPUP MODAL (RESOLUSI BESAR + DOWNLOAD)         */}
      {/* ========================================================================= */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {detailItem && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overscroll-contain">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] border border-white/20"
              >
                {/* Image Section */}
                <div className="md:w-3/5 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-[500px]">
                  <img
                    src={detailItem.imageUrl}
                    alt={detailItem.title}
                    className="w-full h-full max-h-[500px] md:max-h-[600px] object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setDetailItem(null)}
                    className="md:hidden absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Details Sidebar */}
                <div className="md:w-2/5 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto bg-[#FAF7F2]">
                  <div className="space-y-4">
                    <div className="hidden md:flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                        Detail Konsep Moodboard
                      </span>
                      <button
                        type="button"
                        onClick={() => setDetailItem(null)}
                        className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Badges: Category & Sub-Category */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${getCategoryBadgeClass(detailItem.categoryId)}`}>
                        {getCategory(detailItem.categoryId)?.label}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-stone-800 border border-stone-200 shadow-2xs">
                        {getSubCategoryLabel(detailItem.categoryId, detailItem.subCategoryId)}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight leading-snug">
                        {detailItem.title}
                      </h2>
                      {detailItem.createdAt && (
                        <p className="text-[10px] text-stone-400 mt-1">
                          Ditambahkan pada {detailItem.createdAt}
                        </p>
                      )}
                    </div>

                    {/* Notes Box */}
                    {detailItem.notes && (
                      <div className="bg-white p-3.5 rounded-2xl border border-[#EADBCE] text-xs text-stone-700 leading-relaxed shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                          Catatan Arahan:
                        </span>
                        {detailItem.notes}
                      </div>
                    )}

                    {/* Source / Vendor Link */}
                    {detailItem.source && (
                      <div className="text-xs text-stone-600 flex items-center gap-1.5">
                        <span className="font-semibold text-stone-400">Sumber:</span>
                        <span className="font-bold text-stone-800">{detailItem.source}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-stone-200 mt-5 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadImage(detailItem)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Unduh Gambar</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(detailItem)}
                        className="py-2 px-3 rounded-xl text-xs font-bold bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Edit3 size={13} />
                        <span>Edit Info</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(detailItem.id, detailItem.title)}
                        className="py-2 px-3 rounded-xl text-xs font-bold bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SUB-CATEGORY MANAGER MODAL (CRUD SUB-KATEGORI KHUSUS)             */}
      {/* ========================================================================= */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isSubCategoryModalOpen && currentCategoryObj && (
            <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs overscroll-contain">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden flex flex-col max-h-[85vh]"
              >
                <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />

                {/* Header */}
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
                  <div className="flex items-center gap-2">
                    <Layers size={18} className="text-amber-800" />
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">
                        Sub-Kategori: {currentCategoryObj.label}
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Atur pembagian kelompok inspirasi di kategori ini
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubCategoryModalOpen(false);
                      setIsAddingSubCat(false);
                      setEditingSubCatId(null);
                    }}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1">
                  {/* Form Add or Edit Sub-Category */}
                  {(isAddingSubCat || editingSubCatId) && (
                    <form onSubmit={handleSaveSubCategory} className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
                      <span className="text-xs font-bold text-stone-900 block">
                        {editingSubCatId ? 'Edit Nama Sub-Kategori' : 'Tambah Sub-Kategori Baru'}
                      </span>
                      
                      <input
                        type="text"
                        placeholder="Contoh: Altar, Pelaminan, Handbouquet..."
                        value={subCatFormLabel}
                        onChange={(e) => setSubCatFormLabel(e.target.value)}
                        required
                        autoFocus
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-stone-800"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingSubCat(false);
                            setEditingSubCatId(null);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-stone-500 hover:bg-stone-200/50"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 shadow-xs"
                        >
                          Simpan
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Add Sub-Category Button */}
                  {!isAddingSubCat && !editingSubCatId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSubCatId(null);
                        setSubCatFormLabel('');
                        setIsAddingSubCat(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-stone-300 hover:border-stone-800 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Tambah Sub-Kategori Baru</span>
                    </button>
                  )}

                  {/* Sub-Category List */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Daftar Sub-Kategori ({currentCategoryObj.subCategories?.length || 0})
                    </span>

                    <div className="divide-y divide-stone-100 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]/80 overflow-hidden">
                      {(currentCategoryObj.subCategories || []).map(sub => {
                        const count = safeItems.filter(i => i.categoryId === currentCategoryObj.id && i.subCategoryId === sub.id).length;
                        return (
                          <div 
                            key={sub.id}
                            className="p-3 flex items-center justify-between gap-2 hover:bg-white transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Folder size={14} className="text-amber-700 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-stone-900 truncate">
                                  {sub.label}
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
                                  setIsAddingSubCat(false);
                                  setEditingSubCatId(sub.id);
                                  setSubCatFormLabel(sub.label);
                                }}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                                title="Edit Sub-Kategori"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSubCategory(sub.id, sub.label)}
                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Hapus Sub-Kategori"
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
                <div className="px-5 py-3 border-t border-stone-100 bg-stone-50/80 flex items-center justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubCategoryModalOpen(false);
                      setIsAddingSubCat(false);
                      setEditingSubCatId(null);
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

      {/* ========================================================================= */}
      {/* MODAL 4: CATEGORY MANAGER MODAL (CRUD KATEGORI INDUK)                     */}
      {/* ========================================================================= */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isCategoryModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs overscroll-contain">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden flex flex-col max-h-[85vh]"
              >
                <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />

                {/* Header */}
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
                  <div className="flex items-center gap-2">
                    <Tag size={18} className="text-amber-800" />
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">Kelola Kategori Induk</h3>
                      <p className="text-[11px] text-stone-500">
                        Tambah, ubah nama, palet warna, atau hapus kategori
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
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1">
                  {(isAddingCategory || editingCategoryId) && (
                    <form onSubmit={handleSaveCategory} className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
                      <span className="text-xs font-bold text-stone-900 block">
                        {editingCategoryId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                      </span>
                      
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          Nama Kategori
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Souvenir &amp; Hadiah..."
                          value={categoryFormData.label}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, label: e.target.value })}
                          required
                          className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-stone-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          Deskripsi Singkat
                        </label>
                        <input
                          type="text"
                          placeholder="Penjelasan singkat konsep kategori ini..."
                          value={categoryFormData.desc}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, desc: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-stone-800"
                        />
                      </div>

                      {/* Color Presets */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
                          Warna Tema Badge
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {COLOR_PRESETS.map(preset => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setCategoryFormData({ ...categoryFormData, color: preset.id })}
                              className={`w-6 h-6 rounded-full ${preset.bg} flex items-center justify-center transition-transform cursor-pointer ${
                                categoryFormData.color === preset.id ? 'ring-2 ring-stone-900 scale-110' : 'hover:scale-105'
                              }`}
                              title={preset.label}
                            >
                              {categoryFormData.color === preset.id && (
                                <Check size={12} className="text-white" />
                              )}
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
                        setCategoryFormData({ id: '', label: '', desc: '', color: 'amber' });
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
                                  {cat.subCategories?.length || 0} sub-kategori · {count} foto
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
                                    desc: cat.desc || '',
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

// Reusable Photo Card Component
function PhotoCard({ item, categoryObj, subCatLabel, onViewDetail, onEdit, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="nude-card rounded-2xl sm:rounded-3xl overflow-hidden border border-[#EADBCE] group bg-white shadow-xs hover:shadow-md transition-all flex flex-col"
    >
      {/* Image thumbnail with hover overlay */}
      <div 
        onClick={() => onViewDetail(item)}
        className="relative overflow-hidden aspect-4/3 sm:aspect-square bg-stone-100 cursor-pointer"
      >
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Hover overlay with detail icon */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <span className="w-9 h-9 rounded-full bg-white/90 text-stone-900 flex items-center justify-center shadow-xs">
            <Eye size={16} />
          </span>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-black/60 text-white backdrop-blur-xs">
            {subCatLabel}
          </span>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 
            onClick={() => onViewDetail(item)}
            className="text-xs sm:text-sm font-extrabold text-stone-900 group-hover:text-amber-800 transition line-clamp-1 cursor-pointer"
            title={item.title}
          >
            {item.title}
          </h4>

          {item.notes && (
            <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
              {item.notes}
            </p>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
          <span className="truncate max-w-[120px] font-medium">
            {item.source || 'Inspirasi'}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              title="Edit Catatan"
            >
              <Edit3 size={13} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id, item.title)}
              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Hapus Foto"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
