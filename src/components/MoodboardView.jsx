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
  Bookmark,
  Play,
  Video,
  Film,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLOR_PRESETS, DEFAULT_MOODBOARD_CATEGORIES } from '../data/initialMoodboard';
import { parseVideoUrl, isVideoUrl } from '../utils/videoHelper';

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
  onResetToDefault,
  onDeleteItem
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
  const [uploadToast, setUploadToast] = useState(null);

  // Upload Form State
  const [formData, setFormData] = useState({
    title: '',
    categoryId: 'dekorasi',
    subCategoryId: 'altar',
    imageUrl: '',
    videoUrl: '',
    mediaType: 'image',
    notes: '',
    source: ''
  });
  const [isCreatingCustomSubCat, setIsCreatingCustomSubCat] = useState(false);
  const [customSubCatName, setCustomSubCatName] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [inputUrl, setInputUrl] = useState('');
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

  // In-App Confirmation States (No window.confirm!)
  const [subCatToDelete, setSubCatToDelete] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Multi-select delete state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] = useState(false);

  // Category-specific fallback mappings for legacy item subcategory ids
  const CATEGORY_SUB_FALLBACK = useMemo(() => ({
    dekorasi: { 'holy-matrimony': 'altar', 'reception': 'pelaminan', 'before-wedding': 'foyer', 'after-party': 'photobooth' },
    busana: { 'holy-matrimony': 'gaun-pemberkatan', 'reception': 'gaun-resepsi', 'before-wedding': 'jas-pria', 'after-party': 'seragam-keluarga' },
    makeup: { 'holy-matrimony': 'mua-pemberkatan', 'reception': 'mua-resepsi', 'before-wedding': 'hairdo-aksesoris', 'after-party': 'mua-keluarga' },
    bunga: { 'holy-matrimony': 'handbouquet', 'reception': 'corsage', 'before-wedding': 'boutonniere', 'after-party': 'bunga-mobil' },
    undangan: { 'holy-matrimony': 'undangan-fisik', 'reception': 'souvenir', 'before-wedding': 'undangan-digital', 'after-party': 'souvenir' },
    dokumentasi: { 'holy-matrimony': 'prosesi', 'reception': 'pelaminan-pose', 'before-wedding': 'flatlay', 'after-party': 'cinematic' }
  }), []);

  // Independent normalization for categories: each category maintains its own sub-categories
  const safeCategories = useMemo(() => {
    const raw = Array.isArray(categories) && categories.length > 0 ? categories : DEFAULT_MOODBOARD_CATEGORIES;
    return raw.map(cat => {
      const def = DEFAULT_MOODBOARD_CATEGORIES.find(d => d.id === cat.id);
      let currentSubs = cat.subCategories;
      if (!Array.isArray(currentSubs) || currentSubs.length === 0) {
        currentSubs = def?.subCategories || [{ id: 'utama', label: 'Inspirasi Utama' }];
      }

      return {
        ...cat,
        desc: cat.desc || def?.desc || `Koleksi inspirasi dan konsep visual untuk ${cat.label}`,
        subCategories: currentSubs
      };
    });
  }, [categories]);

  // Backward compatibility normalization for items (including video detection & category-specific subcategory mapping)
  const safeItems = useMemo(() => {
    const raw = Array.isArray(items) ? items : [];
    return raw.map(item => {
      let subId = item.subCategoryId;
      const catMap = CATEGORY_SUB_FALLBACK[item.categoryId];
      if (catMap && catMap[subId]) {
        subId = catMap[subId];
      }

      // Find the category and its known subcategory IDs
      const cat = safeCategories.find(c => c.id === item.categoryId);
      const knownSubIds = cat?.subCategories?.map(s => s.id) || [];

      // If subId is empty OR doesn't exist in the category's known subcategories,
      // fall back to the first valid subcategory so the photo is never "orphaned" (invisible)
      if (!subId || (knownSubIds.length > 0 && !knownSubIds.includes(subId))) {
        subId = knownSubIds[0] || 'altar';
      }

      const videoInfo = item.videoUrl ? parseVideoUrl(item.videoUrl) : parseVideoUrl(item.imageUrl);
      const isVideo = item.mediaType === 'video' || Boolean(videoInfo) || Boolean(item.videoUrl);

      return {
        ...item,
        subCategoryId: subId,
        mediaType: isVideo ? 'video' : 'image',
        videoUrl: item.videoUrl || (videoInfo ? videoInfo.originalUrl : '')
      };
    });
  }, [items, safeCategories, CATEGORY_SUB_FALLBACK]);

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
    return sub?.label || cat.subCategories?.[0]?.label || 'Inspirasi';
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
    setSelectedImages([]);
    setInputUrl('');
    setCompressProgress(null);

    const defaultCat = targetCatId || activeCategoryView || safeCategories[0]?.id || 'dekorasi';
    const catObj = safeCategories.find(c => c.id === defaultCat) || safeCategories[0];
    const defaultSub = targetSubCatId || (activeSubCategory !== 'all' ? activeSubCategory : (catObj?.subCategories?.[0]?.id || 'altar'));

    setFormData({
      title: '',
      categoryId: defaultCat,
      subCategoryId: defaultSub,
      imageUrl: '',
      videoUrl: '',
      mediaType: 'image',
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
    setSelectedImages(item.imageUrl ? [{
      imageUrl: item.imageUrl,
      videoUrl: item.videoUrl || '',
      mediaType: item.mediaType || (item.videoUrl ? 'video' : 'image')
    }] : []);
    setInputUrl('');
    setCompressProgress(null);

    const vInfo = item.videoUrl ? parseVideoUrl(item.videoUrl) : parseVideoUrl(item.imageUrl);
    setFormData({
      title: item.title || '',
      categoryId: item.categoryId || safeCategories[0]?.id || 'dekorasi',
      subCategoryId: item.subCategoryId || 'before-wedding',
      imageUrl: item.imageUrl || '',
      videoUrl: item.videoUrl || (vInfo ? vInfo.originalUrl : ''),
      mediaType: item.mediaType || (vInfo || item.videoUrl ? 'video' : 'image'),
      notes: item.notes || '',
      source: item.source || ''
    });
    setDetailItem(null);
    setIsUploadModalOpen(true);
  };

  // Handle Local File Pick & Canvas Compression (Supports Multiple Files)
  const handleFileChange = async (e) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;

    const validFiles = fileList.filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      alert('Silakan pilih file gambar yang valid (JPEG, PNG, atau WEBP).');
      return;
    }

    try {
      setIsCompressing(true);
      setCompressProgress({ current: 0, total: validFiles.length });

      const compressedBatch = [];
      for (let i = 0; i < validFiles.length; i++) {
        setCompressProgress({ current: i + 1, total: validFiles.length });
        const compressedDataUrl = await compressImageFile(validFiles[i]);
        compressedBatch.push({
          imageUrl: compressedDataUrl,
          videoUrl: '',
          mediaType: 'image'
        });
      }

      if (editingItem) {
        setSelectedImages([compressedBatch[0]]);
        setFormData(prev => ({
          ...prev,
          imageUrl: compressedBatch[0].imageUrl,
          videoUrl: '',
          mediaType: 'image'
        }));
      } else {
        setSelectedImages(prev => [...prev, ...compressedBatch]);
        setFormData(prev => ({
          ...prev,
          imageUrl: prev.imageUrl || compressedBatch[0].imageUrl
        }));
      }
    } catch (err) {
      console.error(err);
      alert('Gagal memproses gambar. Coba gunakan gambar lain.');
    } finally {
      setIsCompressing(false);
      setCompressProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add Media via External URL (Supports Images and YouTube/Vimeo/MP4 Videos)
  const handleAddUrlImage = () => {
    const rawUrl = inputUrl.trim();
    if (!rawUrl) return;

    const videoInfo = parseVideoUrl(rawUrl);
    const mediaObj = videoInfo ? {
      imageUrl: videoInfo.thumbnailUrl || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
      videoUrl: rawUrl,
      mediaType: 'video',
      platform: videoInfo.platform
    } : {
      imageUrl: rawUrl,
      videoUrl: '',
      mediaType: 'image',
      platform: 'Image'
    };

    if (editingItem) {
      setSelectedImages([mediaObj]);
      setFormData(prev => ({
        ...prev,
        imageUrl: mediaObj.imageUrl,
        videoUrl: mediaObj.videoUrl,
        mediaType: mediaObj.mediaType
      }));
    } else {
      setSelectedImages(prev => [...prev, mediaObj]);
    }
    setInputUrl('');
  };

  // Remove one image from selected preview batch
  const handleRemoveSelectedImage = (indexToRemove) => {
    setSelectedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Save Item (Add Single/Batch or Edit)
  const handleSaveItem = (e) => {
    e.preventDefault();

    let mediaList = selectedImages.map(img => 
      typeof img === 'string' ? { imageUrl: img, videoUrl: '', mediaType: 'image' } : img
    );

    if (inputUrl.trim()) {
      const rawUrl = inputUrl.trim();
      const vInfo = parseVideoUrl(rawUrl);
      mediaList.push(vInfo ? {
        imageUrl: vInfo.thumbnailUrl || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
        videoUrl: rawUrl,
        mediaType: 'video',
        platform: vInfo.platform
      } : {
        imageUrl: rawUrl,
        videoUrl: '',
        mediaType: 'image',
        platform: 'Image'
      });
    }

    if (mediaList.length === 0 && (formData.imageUrl.trim() || formData.videoUrl.trim())) {
      const rawV = formData.videoUrl.trim();
      const rawI = formData.imageUrl.trim();
      const vInfo = parseVideoUrl(rawV || rawI);
      mediaList.push(vInfo ? {
        imageUrl: vInfo.thumbnailUrl || rawI || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
        videoUrl: vInfo.originalUrl,
        mediaType: 'video',
        platform: vInfo.platform
      } : {
        imageUrl: rawI,
        videoUrl: '',
        mediaType: 'image'
      });
    }

    if (mediaList.length === 0) {
      alert('Harap pilih minimal 1 foto atau masukkan URL gambar / video.');
      return;
    }

    let finalSubCatId = formData.subCategoryId || 'before-wedding';

    // If user created a custom sub-category on the fly
    if (isCreatingCustomSubCat && customSubCatName.trim()) {
      const newSubId = customSubCatName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20) || `sub-${Date.now()}`;
      const newSub = { id: newSubId, label: customSubCatName.trim() };
      
      const updatedCategories = safeCategories.map(c => {
        const currentSubs = c.subCategories || [];
        if (!currentSubs.some(s => s.id === newSubId)) {
          return { ...c, subCategories: [...currentSubs, newSub] };
        }
        return c;
      });
      onChangeCategories?.(updatedCategories);
      finalSubCatId = newSubId;
    }

    if (editingItem) {
      const targetMedia = mediaList[0];
      const updated = safeItems.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            ...formData,
            title: formData.title.trim(),
            notes: (formData.notes || '').trim(),
            imageUrl: targetMedia.imageUrl,
            videoUrl: targetMedia.videoUrl || '',
            mediaType: targetMedia.mediaType || (targetMedia.videoUrl ? 'video' : 'image'),
            subCategoryId: finalSubCatId
          };
        }
        return item;
      });
      onChangeItems?.(updated);
      setActiveCategoryView(formData.categoryId);
      setActiveSubCategory(finalSubCatId);
      setSearchQuery('');
      const catLabel = getCategory(formData.categoryId)?.label || formData.categoryId;
      const subLabel = getSubCategoryLabel(formData.categoryId, finalSubCatId);
      setUploadToast(`✓ Perubahan foto berhasil disimpan ke "${catLabel}" > "${subLabel}"`);
      setTimeout(() => setUploadToast(null), 5000);
    } else {
      const timestamp = Date.now();
      const baseTitle = formData.title.trim();
      const newItems = mediaList.map((m, index) => ({
        id: `mb-${timestamp}-${index}-${Math.random().toString(36).substring(2, 6)}`,
        title: baseTitle ? (mediaList.length > 1 ? `${baseTitle} #${index + 1}` : baseTitle) : '',
        categoryId: formData.categoryId,
        subCategoryId: finalSubCatId,
        imageUrl: m.imageUrl,
        videoUrl: m.videoUrl || '',
        mediaType: m.mediaType || (m.videoUrl ? 'video' : 'image'),
        notes: (formData.notes || '').trim(),
        source: formData.source || (m.mediaType === 'video' ? (m.platform || 'Video') : 'Pinterest'),
        createdAt: new Date().toISOString().split('T')[0]
      }));
      onChangeItems?.([...newItems, ...safeItems]);
      setActiveCategoryView(formData.categoryId);
      setActiveSubCategory(finalSubCatId);
      setSearchQuery('');
      const catLabel = getCategory(formData.categoryId)?.label || formData.categoryId;
      const subLabel = getSubCategoryLabel(formData.categoryId, finalSubCatId);
      setUploadToast(`✓ Berhasil mengunggah ${newItems.length} foto ke "${catLabel}" > "${subLabel}"`);
      setTimeout(() => setUploadToast(null), 5000);
    }
    setIsUploadModalOpen(false);
  };

  // Delete Item (State-driven confirmation, no window.confirm)
  const handleDeleteItem = (id, title) => {
    setItemToDelete({ id, title: title || 'foto ini' });
  };

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    const { id } = itemToDelete;
    if (detailItem?.id === id) setDetailItem(null);
    setItemToDelete(null);

    if (onDeleteItem) {
      onDeleteItem(id);
    } else {
      const updated = safeItems.filter(i => i.id !== id);
      onChangeItems?.(updated);
      fetch(`/api/moodboard?id=${encodeURIComponent(id)}&t=${Date.now()}`, {
        method: 'DELETE',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      }).catch(() => {});
    }

    setUploadToast('✓ Foto berhasil dihapus');
    setTimeout(() => setUploadToast(null), 4000);
  };

  // ── Multi-Select Delete Handlers ──────────────────────────────────────────
  const toggleSelectMode = () => {
    setIsSelectMode(prev => {
      if (prev) setSelectedIds(new Set()); // clear selections when exiting
      return !prev;
    });
  };

  const toggleSelectItem = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = (visibleItems) => {
    setSelectedIds(new Set(visibleItems.map(i => i.id)));
  };

  const confirmMultiDelete = () => {
    if (selectedIds.size === 0) return;
    const ids = [...selectedIds];
    // Optimistic update
    ids.forEach(id => {
      if (onDeleteItem) {
        onDeleteItem(id);
      } else {
        fetch(`/api/moodboard?id=${encodeURIComponent(id)}&t=${Date.now()}`, {
          method: 'DELETE',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        }).catch(() => {});
      }
    });
    if (!onDeleteItem) {
      // If no centralized delete handler, update items locally
      const updated = safeItems.filter(i => !selectedIds.has(i.id));
      onChangeItems?.(updated);
    }
    const count = ids.length;
    setSelectedIds(new Set());
    setIsSelectMode(false);
    setShowMultiDeleteConfirm(false);
    setUploadToast(`✓ ${count} foto berhasil dihapus`);
    setTimeout(() => setUploadToast(null), 4000);
  };
  // ─────────────────────────────────────────────────────────────────────────

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

  // Category Manager: Delete Category (State-driven confirmation)
  const handleDeleteCategory = (catId, catLabel) => {
    if (safeCategories.length <= 1) {
      alert('Minimal harus ada satu kategori dalam moodboard.');
      return;
    }

    const itemsInCat = safeItems.filter(i => i.categoryId === catId);
    const fallbackCat = safeCategories.find(c => c.id !== catId);
    setCategoryToDelete({ 
      id: catId, 
      label: catLabel, 
      itemCount: itemsInCat.length, 
      fallback: fallbackCat 
    });
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    const { id: catId, itemCount, fallback: fallbackCat } = categoryToDelete;

    if (itemCount > 0 && fallbackCat) {
      const updatedItems = safeItems.map(item => {
        if (item.categoryId === catId) {
          return { 
            ...item, 
            categoryId: fallbackCat.id,
            subCategoryId: fallbackCat.subCategories?.[0]?.id || 'before-wedding'
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
    setCategoryToDelete(null);
  };

  // Sub-Category Manager: Add or Edit Sub-Category (Scoped strictly to current active category)
  const handleSaveSubCategory = (e) => {
    e.preventDefault();
    if (!subCatFormLabel.trim() || !currentCategoryObj) return;

    if (editingSubCatId) {
      const updated = safeCategories.map(c => {
        if (c.id !== currentCategoryObj.id) return c;
        return {
          ...c,
          subCategories: (c.subCategories || []).map(s => {
            if (s.id === editingSubCatId) {
              return { ...s, label: subCatFormLabel.trim() };
            }
            return s;
          })
        };
      });
      onChangeCategories?.(updated);
      setEditingSubCatId(null);
    } else {
      const newSubId = subCatFormLabel.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20) || `sub-${Date.now()}`;
      const currentSubs = currentCategoryObj.subCategories || [];
      const finalId = currentSubs.some(s => s.id === newSubId) ? `${newSubId}-${Date.now().toString().slice(-4)}` : newSubId;
      const updated = safeCategories.map(c => {
        if (c.id !== currentCategoryObj.id) return c;
        return {
          ...c,
          subCategories: [...currentSubs, { id: finalId, label: subCatFormLabel.trim() }]
        };
      });
      onChangeCategories?.(updated);
      setIsAddingSubCat(false);
    }
    setSubCatFormLabel('');
  };

  // Sub-Category Manager: Trigger Delete Confirmation (State-driven & Category-specific)
  const handleDeleteSubCategory = (subCatId, subCatLabel) => {
    if (!currentCategoryObj) return;
    const currentSubs = currentCategoryObj.subCategories || [];
    if (currentSubs.length <= 1) {
      alert(`Minimal harus ada satu sub-kategori untuk ${currentCategoryObj.label}.`);
      return;
    }

    const itemsInSub = safeItems.filter(i => i.categoryId === currentCategoryObj.id && i.subCategoryId === subCatId);
    const fallbackSub = currentSubs.find(s => s.id !== subCatId);
    setSubCatToDelete({
      id: subCatId,
      label: subCatLabel,
      count: itemsInSub.length,
      fallback: fallbackSub
    });
  };

  // Sub-Category Manager: Confirm Delete Sub-Category (Affects ONLY the current category)
  const confirmDeleteSubCategory = (subCatId) => {
    if (!currentCategoryObj) return;
    const currentSubs = currentCategoryObj.subCategories || [];
    if (currentSubs.length <= 1) return;

    const fallbackSub = currentSubs.find(s => s.id !== subCatId);
    const itemsInSub = safeItems.filter(i => i.categoryId === currentCategoryObj.id && i.subCategoryId === subCatId);

    // If there are items in this subcategory for THIS category, re-assign them to fallback
    if (itemsInSub.length > 0 && fallbackSub) {
      const updatedItems = safeItems.map(item => {
        if (item.categoryId === currentCategoryObj.id && item.subCategoryId === subCatId) {
          return { ...item, subCategoryId: fallbackSub.id };
        }
        return item;
      });
      onChangeItems?.(updatedItems);
    }

    // Remove this subcategory ONLY from THIS category
    const updatedCategories = safeCategories.map(c => {
      if (c.id !== currentCategoryObj.id) return c;
      return {
        ...c,
        subCategories: (c.subCategories || []).filter(s => s.id !== subCatId)
      };
    });
    onChangeCategories?.(updatedCategories);

    if (activeSubCategory === subCatId) {
      setActiveSubCategory('all');
    }
    setSubCatToDelete(null);
  };

  // Get cover image(s) for a category
  const getCategoryCovers = (catId) => {
    const catPhotos = safeItems.filter(i => i.categoryId === catId);
    return catPhotos.map(p => p.imageUrl).filter(Boolean);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Notification for Upload Success */}
      {uploadToast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-3 bg-emerald-50 border border-emerald-200/90 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Check size={16} className="text-emerald-600 shrink-0" />
            <span>{uploadToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadToast(null)}
            className="text-emerald-600 hover:text-emerald-900 cursor-pointer p-0.5"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}

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

              {/* Right: Search + Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Search input */}
                <div className="relative flex-1 sm:w-52 sm:flex-initial min-w-0">
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

                {/* Select Mode Toggle */}
                <button
                  type="button"
                  onClick={toggleSelectMode}
                  className={`shrink-0 whitespace-nowrap px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                    isSelectMode
                      ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                  title={isSelectMode ? 'Batalkan Pilihan' : 'Pilih Foto untuk Dihapus'}
                >
                  {isSelectMode ? <X size={13} /> : <Check size={13} className="text-stone-500" />}
                  <span className="hidden sm:inline">{isSelectMode ? 'Batal Pilih' : 'Pilih Foto'}</span>
                  <span className="sm:hidden text-[11px]">{isSelectMode ? 'Batal' : 'Pilih'}</span>
                </button>

                {!isSelectMode && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsSubCategoryModalOpen(true)}
                      className="shrink-0 whitespace-nowrap px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Kelola Sub-Kategori"
                    >
                      <Layers size={13} className="text-stone-500" />
                      <span className="hidden lg:inline">Kelola Sub-Kategori</span>
                      <span className="lg:hidden text-[11px]">Sub-Kat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAdd(currentCategoryObj.id, activeSubCategory !== 'all' ? activeSubCategory : null)}
                      className="shrink-0 whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Upload size={13} />
                      <span className="hidden sm:inline">Upload Foto</span>
                      <span className="sm:hidden text-[11px]">Upload</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Subtle Divider Line */}
            <div className="h-px bg-stone-100" />

            {/* Bottom Row: Sub-Category Pills (Wrapping naturally, NO horizontal sliding!) */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setActiveSubCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSubCategory === 'all'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100/90 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900 border border-stone-200/60'
                }`}
              >
                <span>Semua Sub-Kategori</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  activeSubCategory === 'all' ? 'bg-white/20 text-white' : 'bg-white text-stone-700 border border-stone-200/60'
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
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100/90 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900 border border-stone-200/60'
                    }`}
                  >
                    <span>{sub.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white text-stone-700 border border-stone-200/60'
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
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-900 hover:bg-stone-100 border border-dashed border-stone-300 transition flex items-center gap-1 cursor-pointer"
                title="Tambah Sub-Kategori Baru"
              >
                <Plus size={12} />
                <span>+ Sub-Kategori</span>
              </button>
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
                    <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-3 border-b border-[#EADBCE] pb-2.5">
                      <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
                        <Folder size={16} className="text-stone-400 shrink-0 mt-0.5 sm:mt-0" />
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                          <h3 className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight leading-snug">
                            {sub.label}
                          </h3>
                          <span className="shrink-0 whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                            {subPhotos.length} media
                          </span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleOpenAdd(currentCategoryObj.id, sub.id)}
                        className="shrink-0 whitespace-nowrap px-2.5 py-1 rounded-xl text-xs font-bold text-stone-700 hover:text-stone-900 hover:bg-stone-100 bg-white border border-stone-200/90 transition flex items-center gap-1 cursor-pointer shadow-2xs mt-0.5 sm:mt-0"
                        title={`Tambah inspirasi ke ${sub.label}`}
                      >
                        <Plus size={13} className="text-stone-500" />
                        <span className="hidden sm:inline">Tambah Inspirasi</span>
                        <span className="sm:hidden text-[11px]">Tambah</span>
                      </button>
                    </div>

                    {subPhotos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 items-start">
                        {subPhotos.map(item => (
                          <PhotoCard
                            key={item.id}
                            item={item}
                            categoryObj={currentCategoryObj}
                            subCatLabel={sub.label}
                            onViewDetail={isSelectMode ? undefined : setDetailItem}
                            onEdit={isSelectMode ? undefined : handleOpenEdit}
                            onDelete={isSelectMode ? undefined : handleDeleteItem}
                            isSelectMode={isSelectMode}
                            isSelected={selectedIds.has(item.id)}
                            onToggleSelect={toggleSelectItem}
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
                          Belum ada inspirasi di "{sub.label}"
                        </p>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Klik untuk mengunggah foto atau tautan video inspirasi untuk sub-kategori ini.
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
                  <h3 className="text-sm font-bold text-stone-800">Tidak ada inspirasi ditemukan</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    {searchQuery ? `Tidak ada hasil untuk kata kunci "${searchQuery}".` : 'Belum ada foto atau video yang diunggah pada sub-kategori ini.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenAdd(currentCategoryObj.id, activeSubCategory !== 'all' ? activeSubCategory : null)}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Upload size={14} />
                    <span>Upload Foto / Video</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 items-start">
                  {filteredItems.map(item => (
                    <PhotoCard
                      key={item.id}
                      item={item}
                      categoryObj={getCategory(item.categoryId)}
                      subCatLabel={getSubCategoryLabel(item.categoryId, item.subCategoryId)}
                      onViewDetail={isSelectMode ? undefined : setDetailItem}
                      onEdit={isSelectMode ? undefined : handleOpenEdit}
                      onDelete={isSelectMode ? undefined : handleDeleteItem}
                      isSelectMode={isSelectMode}
                      isSelected={selectedIds.has(item.id)}
                      onToggleSelect={toggleSelectItem}
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
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 items-start">
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


                  {/* Judul / Konsep (Opsional) */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Judul / Konsep <span className="text-stone-400 font-normal text-[11px]">(Opsional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Gaun Pengantin Minimalis A-Line & Veil"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-800"
                    />
                  </div>

                  {/* Image Picker: File Upload or External URL */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700">
                        {editingItem ? 'Pilihan Foto' : 'Pilihan Foto (Bisa Pilih Banyak)'} <span className="text-rose-500">*</span>
                      </label>
                      {selectedImages.length > 0 && !editingItem && (
                        <button
                          type="button"
                          onClick={() => setSelectedImages([])}
                          className="text-[10px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          Hapus Semua ({selectedImages.length})
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          multiple={!editingItem}
                          onChange={handleFileChange}
                          className="hidden"
                          id="moodboard-file-input"
                        />
                        <label
                          htmlFor="moodboard-file-input"
                          className="flex-1 py-2.5 px-3 border border-dashed border-stone-300 hover:border-stone-800 bg-stone-50 hover:bg-stone-100 rounded-xl text-xs font-bold text-stone-700 flex items-center justify-center gap-2 cursor-pointer transition text-center"
                        >
                          <Upload size={14} className="text-amber-800 shrink-0" />
                          <span>
                            {isCompressing 
                              ? `Mengompresi Foto (${compressProgress ? `${compressProgress.current}/${compressProgress.total}` : '...'})` 
                              : editingItem 
                                ? 'Pilih Foto Pengganti' 
                                : 'Pilih Foto (Bisa Banyak Sekaligus)'
                            }
                          </span>
                        </label>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="url"
                          placeholder="Atau tempel tautan URL gambar / video (YouTube, Vimeo, MP4)..."
                          value={inputUrl}
                          onChange={(e) => setInputUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddUrlImage();
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-800"
                        />
                        <button
                          type="button"
                          onClick={handleAddUrlImage}
                          disabled={!inputUrl.trim()}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-40 transition cursor-pointer shrink-0"
                        >
                          + Tambah
                        </button>
                      </div>
                    </div>

                    {/* Media Preview Grid (Multiple Thumbnails with Video support) */}
                    {selectedImages.length > 0 && (
                      <div className="mt-2.5 p-2.5 bg-stone-50 rounded-2xl border border-stone-200/90">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-extrabold text-stone-700">
                            {selectedImages.length} Media Siap Diupload:
                          </span>
                          <span className="text-[10px] text-stone-400">
                            Klik silang (x) untuk membatalkan
                          </span>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                          {selectedImages.map((media, idx) => {
                            const imgUrl = typeof media === 'string' ? media : media.imageUrl;
                            const isVid = typeof media === 'object' && media.mediaType === 'video';

                            return (
                              <div 
                                key={idx} 
                                className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-white group shadow-2xs"
                              >
                                <img 
                                  src={imgUrl} 
                                  alt={`Media ${idx + 1}`} 
                                  className="w-full h-full object-cover"
                                />
                                {isVid && (
                                  <span className="absolute top-1 left-1 bg-rose-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-0.5 shadow-xs">
                                    <Play size={8} className="fill-white" />
                                    Video
                                  </span>
                                )}
                                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-md backdrop-blur-xs">
                                  #{idx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSelectedImage(idx)}
                                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-xs cursor-pointer"
                                  title="Hapus media ini"
                                >
                                  <X size={11} />
                                </button>
                              </div>
                            );
                          })}

                          {!editingItem && (
                            <label
                              htmlFor="moodboard-file-input"
                              className="aspect-square rounded-xl border border-dashed border-stone-300 hover:border-stone-800 bg-white hover:bg-stone-50 flex flex-col items-center justify-center text-stone-500 hover:text-stone-800 cursor-pointer text-[10px] font-bold gap-1 transition"
                              title="Tambah foto lagi"
                            >
                              <Plus size={16} />
                              <span>Tambah</span>
                            </label>
                          )}
                        </div>
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
                      disabled={isCompressing || (selectedImages.length === 0 && !inputUrl.trim() && !formData.imageUrl.trim())}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {editingItem 
                        ? 'Simpan Perubahan' 
                        : selectedImages.length > 1 
                          ? `Selesai & Upload ${selectedImages.length} Foto` 
                          : 'Selesai & Simpan ke Moodboard'}
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
                {/* Media Section: Video Player or Image */}
                <div className="md:w-3/5 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-[500px]">
                  {(() => {
                    const videoInfo = detailItem.videoUrl ? parseVideoUrl(detailItem.videoUrl) : parseVideoUrl(detailItem.imageUrl);
                    const isVideo = detailItem.mediaType === 'video' || Boolean(videoInfo);

                    if (isVideo && videoInfo?.embedUrl) {
                      return (
                        <div className="w-full h-full min-h-[300px] md:min-h-[500px] aspect-video flex items-center justify-center">
                          <iframe
                            src={videoInfo.embedUrl}
                            title={detailItem.title || 'Video Player'}
                            className="w-full h-full min-h-[300px] md:min-h-[500px] border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      );
                    }

                    if (isVideo && (detailItem.videoUrl || detailItem.imageUrl)) {
                      return (
                        <video
                          src={detailItem.videoUrl || detailItem.imageUrl}
                          controls
                          autoPlay
                          playsInline
                          className="w-full h-full max-h-[500px] md:max-h-[600px] object-contain"
                        />
                      );
                    }

                    return (
                      <img
                        src={detailItem.imageUrl}
                        alt={detailItem.title}
                        className="w-full h-full max-h-[500px] md:max-h-[600px] object-contain"
                      />
                    );
                  })()}
                  <button
                    type="button"
                    onClick={() => setDetailItem(null)}
                    className="md:hidden absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition z-10 cursor-pointer"
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

                    {/* Badges: Category & Sub-Category & Media Type */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${getCategoryBadgeClass(detailItem.categoryId)}`}>
                        {getCategory(detailItem.categoryId)?.label}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-stone-800 border border-stone-200 shadow-2xs">
                        {getSubCategoryLabel(detailItem.categoryId, detailItem.subCategoryId)}
                      </span>
                      {(detailItem.mediaType === 'video' || parseVideoUrl(detailItem.videoUrl || detailItem.imageUrl)) && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-600 text-white flex items-center gap-1 shadow-2xs">
                          <Play size={10} className="fill-white" />
                          <span>Video</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight leading-snug">
                        {detailItem.title || getSubCategoryLabel(detailItem.categoryId, detailItem.subCategoryId) || 'Inspirasi Moodboard'}
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
                    {(() => {
                      const videoInfo = detailItem.videoUrl ? parseVideoUrl(detailItem.videoUrl) : parseVideoUrl(detailItem.imageUrl);
                      const isVideo = detailItem.mediaType === 'video' || Boolean(videoInfo);

                      if (isVideo) {
                        return (
                          <a
                            href={detailItem.videoUrl || detailItem.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-800 hover:bg-amber-900 text-white transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                          >
                            <ExternalLink size={14} />
                            <span>Buka Video di {videoInfo?.platform || 'Platform Asli'}</span>
                          </a>
                        );
                      }

                      return (
                        <button
                          type="button"
                          onClick={() => handleDownloadImage(detailItem)}
                          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                        >
                          <Download size={14} />
                          <span>Unduh Gambar</span>
                        </button>
                      );
                    })()}

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
                        Kelola Sub-Kategori: {currentCategoryObj.label}
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Khusus untuk kategori {currentCategoryObj.label} (tidak mempengaruhi kategori lain)
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
                        placeholder={`Contoh sub-kategori untuk ${currentCategoryObj.label}...`}
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
                        const totalCount = safeItems.filter(i => i.subCategoryId === sub.id).length;
                        const isConfirmingDelete = subCatToDelete?.id === sub.id;

                        if (isConfirmingDelete) {
                          return (
                            <div 
                              key={sub.id}
                              className="p-3.5 bg-rose-50/95 border-l-4 border-rose-500 space-y-2.5 transition-all"
                            >
                              <div className="flex items-start gap-2.5">
                                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-rose-950">
                                    Hapus sub-kategori &ldquo;{sub.label}&rdquo;?
                                  </p>
                                  {totalCount > 0 ? (
                                    <p className="text-[11px] text-rose-700 mt-0.5 leading-snug">
                                      Perhatian: {totalCount} foto/video di {currentCategoryObj.label} akan otomatis dialihkan ke &ldquo;{subCatToDelete.fallback?.label || 'sub-kategori lain'}&rdquo;.
                                    </p>
                                  ) : (
                                    <p className="text-[11px] text-rose-600 mt-0.5">
                                      Sub-kategori ini kosong dan akan dihapus dari kategori {currentCategoryObj.label}.
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-2 pt-0.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setSubCatToDelete(null);
                                  }}
                                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-200/60 rounded-xl transition cursor-pointer"
                                >
                                  Batal
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    confirmDeleteSubCategory(sub.id);
                                  }}
                                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                  <span>Ya, Hapus</span>
                                </button>
                              </div>
                            </div>
                          );
                        }

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
                                  {count} foto di {currentCategoryObj.label} ({totalCount} total)
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setIsAddingSubCat(false);
                                  setEditingSubCatId(sub.id);
                                  setSubCatFormLabel(sub.label);
                                  setSubCatToDelete(null);
                                }}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                                title="Edit Sub-Kategori"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleDeleteSubCategory(sub.id, sub.label);
                                }}
                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
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

                        const isConfirmingCatDelete = categoryToDelete?.id === cat.id;

                        if (isConfirmingCatDelete) {
                          return (
                            <div 
                              key={cat.id}
                              className="p-3.5 bg-rose-50/95 border-l-4 border-rose-500 space-y-2.5 transition-all"
                            >
                              <div className="flex items-start gap-2.5">
                                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-rose-950">
                                    Hapus kategori &ldquo;{cat.label}&rdquo;?
                                  </p>
                                  {count > 0 ? (
                                    <p className="text-[11px] text-rose-700 mt-0.5 leading-snug">
                                      Perhatian: {count} foto akan dipindahkan ke kategori &ldquo;{categoryToDelete.fallback?.label || 'lainnya'}&rdquo;.
                                    </p>
                                  ) : (
                                    <p className="text-[11px] text-rose-600 mt-0.5">
                                      Kategori ini kosong dan akan langsung dihapus.
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-2 pt-0.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setCategoryToDelete(null);
                                  }}
                                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-200/60 rounded-xl transition cursor-pointer"
                                >
                                  Batal
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    confirmDeleteCategory();
                                  }}
                                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                  <span>Ya, Hapus</span>
                                </button>
                              </div>
                            </div>
                          );
                        }

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
                                  setCategoryToDelete(null);
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
                    showResetConfirm ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-rose-600">Reset ke bawaan?</span>
                        <button
                          type="button"
                          onClick={() => setShowResetConfirm(false)}
                          className="px-2 py-1 text-[11px] font-semibold text-stone-600 hover:bg-stone-200/60 rounded-lg transition cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onResetToDefault();
                            setShowResetConfirm(false);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition cursor-pointer shadow-2xs"
                        >
                          Ya, Reset
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(true)}
                        className="text-xs text-stone-500 hover:text-stone-800 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={12} />
                        <span>Reset Bawaan</span>
                      </button>
                    )
                  ) : <div />}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCategoryModalOpen(false);
                      setIsAddingCategory(false);
                      setEditingCategoryId(null);
                      setCategoryToDelete(null);
                      setShowResetConfirm(false);
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
      {/* MODAL 5: CONFIRM DELETE ITEM DIALOG                                       */}
      {/* ========================================================================= */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {itemToDelete && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overscroll-contain">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.15 }}
                className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-stone-200 p-5 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                    <Trash2 size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-stone-900">Hapus Inspirasi?</h4>
                    <p className="text-xs text-stone-500 truncate mt-0.5">{itemToDelete.title || 'Foto tanpa judul'}</p>
                  </div>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Inspirasi foto/video ini akan dihapus secara permanen dari moodboard dan cloud database.
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setItemToDelete(null)}
                    className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteItem}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Ya, Hapus</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* FLOATING BOTTOM SELECT BAR (appears when isSelectMode is ON)              */}
      {/* ========================================================================= */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isSelectMode && (
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9500] w-[calc(100%-2rem)] max-w-md"
            >
              <div className="bg-stone-900 text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Check size={15} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-snug">
                      {selectedIds.size === 0 ? 'Pilih foto' : `${selectedIds.size} foto dipilih`}
                    </p>
                    <p className="text-[10px] text-stone-400">Ketuk foto untuk memilih / batal pilih</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selectedIds.size > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          // Select all in current view
                          const visibleIds = activeCategoryView
                            ? safeItems.filter(i => i.categoryId === activeCategoryView)
                            : safeItems;
                          selectAllVisible(visibleIds);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                      >
                        Semua
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMultiDeleteConfirm(true)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Hapus ({selectedIds.size})</span>
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={toggleSelectMode}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    title="Batalkan pilih"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: CONFIRM MULTI-DELETE DIALOG                                      */}
      {/* ========================================================================= */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showMultiDeleteConfirm && (
            <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overscroll-contain">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.15 }}
                className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-stone-200 p-5 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">Hapus {selectedIds.size} Foto?</h4>
                    <p className="text-xs text-stone-500 mt-0.5">Foto yang dipilih akan dihapus permanen</p>
                  </div>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {selectedIds.size} foto/video yang dipilih akan dihapus secara permanen dari moodboard dan cloud database. Tindakan ini tidak bisa dibatalkan.
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowMultiDeleteConfirm(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={confirmMultiDelete}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Ya, Hapus Semua</span>
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
function PhotoCard({ item, categoryObj, subCatLabel, onViewDetail, onEdit, onDelete, isSelectMode, isSelected, onToggleSelect }) {
  const hasTitle = Boolean(item.title && item.title.trim());
  const hasNotes = Boolean(item.notes && item.notes.trim());
  const videoInfo = item.videoUrl ? parseVideoUrl(item.videoUrl) : parseVideoUrl(item.imageUrl);
  const isVideo = item.mediaType === 'video' || Boolean(videoInfo);

  const handleCardClick = () => {
    if (isSelectMode) {
      onToggleSelect?.(item.id);
    } else {
      onViewDetail?.(item);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`nude-card rounded-2xl sm:rounded-3xl overflow-hidden border group bg-white shadow-xs hover:shadow-md transition-all flex flex-col ${
        isSelected
          ? 'border-rose-500 ring-2 ring-rose-400 ring-offset-1'
          : 'border-[#EADBCE]'
      }`}
    >
      {/* Image thumbnail with hover overlay */}
      <div
        onClick={handleCardClick}
        className="relative overflow-hidden aspect-4/3 sm:aspect-square bg-stone-100 cursor-pointer shrink-0"
      >
        <img
          src={item.imageUrl}
          alt={item.title || subCatLabel || 'Inspirasi Moodboard'}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-300 ${isSelectMode ? '' : 'group-hover:scale-105'}`}
        />

        {/* Select Mode: tinted overlay + checkmark */}
        {isSelectMode && (
          <div className={`absolute inset-0 transition-all ${isSelected ? 'bg-rose-600/30' : 'bg-black/0 hover:bg-black/15'}`}>
            <div className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-rose-600 border-rose-600 shadow-md'
                : 'bg-white/80 border-stone-300'
            }`}>
              {isSelected && <Check size={13} className="text-white" strokeWidth={3} />}
            </div>
          </div>
        )}

        {/* Video Center Play Indicator (only in normal mode) */}
        {isVideo && !isSelectMode && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-amber-600 transition-all duration-300">
              <Play size={18} className="fill-white ml-0.5" />
            </span>
          </div>
        )}

        {/* Hover overlay with detail icon (only in normal mode) */}
        {!isSelectMode && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <span className="w-9 h-9 rounded-full bg-white/95 text-stone-900 flex items-center justify-center shadow-md">
              {isVideo ? <Play size={16} className="fill-stone-900 ml-0.5" /> : <Eye size={16} />}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-black/60 text-white backdrop-blur-xs">
            {subCatLabel}
          </span>
        </div>

        {/* Video Badge */}
        {isVideo && (
          <div className={`absolute ${isSelectMode ? 'top-2.5 left-2.5 mt-5' : 'top-2.5 right-2.5'}`}>
            <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-rose-600 text-white flex items-center gap-1 shadow-xs">
              <Play size={8} className="fill-white" />
              <span>Video</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Info: Only rendered if title or notes exist */}
      {(hasTitle || hasNotes) && (
        <div className="px-3 pt-2.5 pb-1 sm:px-3.5 sm:pt-3 space-y-0.5">
          {hasTitle && (
            <h4
              onClick={handleCardClick}
              className="text-xs sm:text-sm font-extrabold text-stone-900 group-hover:text-amber-800 transition line-clamp-1 cursor-pointer leading-snug"
              title={item.title}
            >
              {item.title}
            </h4>
          )}
          {hasNotes && (
            <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
              {item.notes.trim()}
            </p>
          )}
        </div>
      )}

      {/* Card Footer Actions */}
      {!isSelectMode ? (
        <div className={`flex items-center justify-between text-[11px] text-stone-400 ${
          (hasTitle || hasNotes)
            ? 'mt-2 pt-2 px-3 pb-2.5 sm:px-3.5 sm:pb-3 border-t border-stone-100'
            : 'px-3 py-2 sm:px-3.5 sm:py-2.5'
        }`}>
          <span className="truncate max-w-[120px] font-medium text-stone-500">
            {item.source || 'Pinterest'}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              title="Edit Info"
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
      ) : (
        /* In select mode: show minimal tap-to-select hint in footer */
        <div className={`px-3 py-2 sm:px-3.5 ${(hasTitle || hasNotes) ? 'border-t border-stone-100' : ''}`}>
          <p className="text-[10px] text-stone-400 text-center">
            {isSelected ? '✓ Dipilih' : 'Ketuk untuk memilih'}
          </p>
        </div>
      )}
    </motion.div>
  );
}

