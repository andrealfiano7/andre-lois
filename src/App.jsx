import React, { useEffect, useMemo, useState } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Camera, 
  Clock, 
  CalendarDays, 
  Download, 
  RefreshCw, 
  ExternalLink, 
  Plus, 
  ArrowRight,
  Luggage,
  Palette,
  Edit3
} from 'lucide-react';
import { motion } from 'framer-motion';
import logoImg from './assets/logo.png';
import { useWeddingData } from './hooks/useWeddingData';
import { useCountdown } from './hooks/useCountdown';
import { GOOGLE_SHEET_URL } from './data/initialTasks';
import { INITIAL_PHOTO_LIST, INITIAL_RUNDOWN } from './data/otherSheets';
import { INITIAL_LOGISTICS_LIST } from './data/initialLogistics';
import { DEFAULT_MOODBOARD_CATEGORIES } from './data/initialMoodboard';
import { StatsOverview } from './components/StatsOverview';
import { ViewSwitcher } from './components/ViewSwitcher';
import { FilterBar } from './components/FilterBar';
import { TaskTableView } from './components/TaskTableView';
import { TaskTimelineView } from './components/TaskTimelineView';
import { TaskPicView } from './components/TaskPicView';
import { TaskModal } from './components/TaskModal';
import { CountdownModal } from './components/CountdownModal';
import { SyncNotification } from './components/SyncNotification';
import { GuestPhotoView } from './components/GuestPhotoView';
import { RundownView } from './components/RundownView';
import { LogisticsView } from './components/LogisticsView';
import { MoodboardView } from './components/MoodboardView';
import { ErrorBoundary } from './components/ErrorBoundary';

const PHOTO_STORAGE = 'wedding_photo_list_v4_clean';
const RUNDOWN_STORAGE = 'wedding_rundown_v5_live';
const LOGISTICS_STORAGE = 'wedding_logistics_v1';
const MOODBOARD_STORAGE = 'wedding_moodboard_items_v1';
const MOODBOARD_CATEGORIES_STORAGE = 'wedding_moodboard_categories_v1';

// Mapping old subcategories to unified standard for automatic migration
// Fallback mapping for items with legacy sub-category ids
const CATEGORY_SUB_FALLBACK = {
  dekorasi: { 'holy-matrimony': 'altar', 'reception': 'pelaminan', 'before-wedding': 'foyer', 'after-party': 'photobooth' },
  busana: { 'holy-matrimony': 'gaun-pemberkatan', 'reception': 'gaun-resepsi', 'before-wedding': 'jas-pria', 'after-party': 'seragam-keluarga' },
  makeup: { 'holy-matrimony': 'mua-pemberkatan', 'reception': 'mua-resepsi', 'before-wedding': 'hairdo-aksesoris', 'after-party': 'mua-keluarga' },
  bunga: { 'holy-matrimony': 'handbouquet', 'reception': 'corsage', 'before-wedding': 'boutonniere', 'after-party': 'bunga-mobil' },
  undangan: { 'holy-matrimony': 'undangan-fisik', 'reception': 'souvenir', 'before-wedding': 'undangan-digital', 'after-party': 'souvenir' },
  dokumentasi: { 'holy-matrimony': 'prosesi', 'reception': 'pelaminan-pose', 'before-wedding': 'flatlay', 'after-party': 'cinematic' }
};

const loadStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
};

// Automatic migration for devices with existing moodboard categories in localStorage
const loadAndMigrateMoodboardCategories = () => {
  try {
    const item = localStorage.getItem(MOODBOARD_CATEGORIES_STORAGE);
    if (!item) return DEFAULT_MOODBOARD_CATEGORIES;
    const parsed = JSON.parse(item);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_MOODBOARD_CATEGORIES;

    // Check if the saved categories were the old unified ones (where all categories had before-wedding, holy-matrimony, etc.)
    const isOldUnified = parsed.every(c => 
      Array.isArray(c.subCategories) && 
      c.subCategories.length === 4 && 
      c.subCategories.some(s => s.id === 'before-wedding') &&
      c.subCategories.some(s => s.id === 'holy-matrimony')
    );

    if (isOldUnified) {
      localStorage.setItem(MOODBOARD_CATEGORIES_STORAGE, JSON.stringify(DEFAULT_MOODBOARD_CATEGORIES));
      return DEFAULT_MOODBOARD_CATEGORIES;
    }

    // Ensure each category has valid subCategories array
    return parsed.map(cat => {
      const def = DEFAULT_MOODBOARD_CATEGORIES.find(d => d.id === cat.id);
      return {
        ...cat,
        subCategories: Array.isArray(cat.subCategories) && cat.subCategories.length > 0
          ? cat.subCategories
          : (def?.subCategories || [{ id: 'utama', label: 'Inspirasi Utama' }])
      };
    });
  } catch {
    return DEFAULT_MOODBOARD_CATEGORIES;
  }
};

const DEPRECATED_TEMPLATE_IDS = new Set(['mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-5', 'mb-6', 'mb-7', 'mb-8', 'mb-9']);

// Automatic migration for devices with existing moodboard items in localStorage
const loadAndMigrateMoodboardItems = () => {
  try {
    const item = localStorage.getItem(MOODBOARD_STORAGE);
    if (!item) return [];
    const parsed = JSON.parse(item);
    if (!Array.isArray(parsed)) return [];

    let hasChange = false;
    // Strip out deprecated template photos so they never resurrect from stale browser cache
    const cleanList = parsed.filter(it => {
      if (it && DEPRECATED_TEMPLATE_IDS.has(it.id)) {
        hasChange = true;
        return false;
      }
      return Boolean(it && it.id && it.imageUrl);
    });

    const migrated = cleanList.map(it => {
      let subId = it.subCategoryId;
      const catMap = CATEGORY_SUB_FALLBACK[it.categoryId];
      if (catMap && catMap[subId]) {
        subId = catMap[subId];
        hasChange = true;
      }
      if (!subId) {
        const def = DEFAULT_MOODBOARD_CATEGORIES.find(d => d.id === it.categoryId);
        subId = def?.subCategories?.[0]?.id || 'altar';
        hasChange = true;
      }
      return {
        ...it,
        subCategoryId: subId
      };
    });

    if (hasChange || cleanList.length !== parsed.length) {
      localStorage.setItem(MOODBOARD_STORAGE, JSON.stringify(migrated));
    }
    return migrated;
  } catch {
    return [];
  }
};

export default function App() {
  const { 
    tasks, 
    stats, 
    lastSync, 
    isSyncing, 
    syncStatus, 
    setSyncStatus, 
    toggleTaskDone, 
    updateTaskStatus, 
    updateTaskProgress, 
    addTask, 
    editTask, 
    deleteTask, 
    resetToDefault,
    syncFromGoogleSheet, 
    exportToCSV,
    dbStatus
  } = useWeddingData();

  const countdown = useCountdown();

  // Active module / sheet tab: 'dashboard' | 'checklist' | 'photos' | 'rundown'
  const [activeModule, setActiveModule] = useState('dashboard');

  // Checklist sub-views: 'table' | 'kanban' | 'timeline' | 'pic'
  const [activeView, setActiveView] = useState('table');

  // Checklist filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPic, setSelectedPic] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  // Other sheets data
  const [photoList, setPhotoList] = useState(() => loadStorage(PHOTO_STORAGE, INITIAL_PHOTO_LIST));
  const [rundownList, setRundownList] = useState(() => loadStorage(RUNDOWN_STORAGE, INITIAL_RUNDOWN));
  const [logisticsList, setLogisticsList] = useState(() => loadStorage(LOGISTICS_STORAGE, INITIAL_LOGISTICS_LIST));
  const [moodboardItems, setMoodboardItems] = useState(() => loadAndMigrateMoodboardItems());
  const [moodboardCategories, setMoodboardCategories] = useState(() => loadAndMigrateMoodboardCategories());

  // Realtime Live Sync for Rundown & Photos from Neon Database
  useEffect(() => {
    let isMounted = true;

    const syncRundown = () => {
      fetch('/api/rundown')
        .then(res => res.json())
        .then(data => {
          if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
            setRundownList(prev => {
              const prevStr = JSON.stringify(prev);
              const nextStr = JSON.stringify(data.data);
              return prevStr !== nextStr ? data.data : prev;
            });
          }
        })
        .catch(() => {});
    };

    const syncPhotos = () => {
      fetch('/api/photos')
        .then(res => res.json())
        .then(data => {
          if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
            setPhotoList(prev => {
              const prevStr = JSON.stringify(prev);
              const nextStr = JSON.stringify(data.data);
              return prevStr !== nextStr ? data.data : prev;
            });
          }
        })
        .catch(() => {});
    };

    const syncMoodboardCategories = () => {
      fetch('/api/moodboard-categories')
        .then(res => res.json())
        .then(data => {
          if (!isMounted || !data.success || !Array.isArray(data.data) || data.data.length === 0) return;
          setMoodboardCategories(prev => {
            const prevStr = JSON.stringify(prev);
            const nextStr = JSON.stringify(data.data);
            return prevStr !== nextStr ? data.data : prev;
          });
        })
        .catch(() => {});
    };

    const syncMoodboard = () => {
      fetch('/api/moodboard')
        .then(res => res.json())
        .then(data => {
          if (!isMounted || !data.success || !Array.isArray(data.data)) return;

          // Neon DB is source of truth, filter out any deprecated template items
          const cleanData = data.data.filter(it => !DEPRECATED_TEMPLATE_IDS.has(it.id));
          setMoodboardItems(prev => {
            const prevStr = JSON.stringify(prev);
            const nextStr = JSON.stringify(cleanData);
            return prevStr !== nextStr ? cleanData : prev;
          });
        })
        .catch(() => {});
    };

    // Initial sync
    syncRundown();
    syncPhotos();
    syncMoodboard();
    syncMoodboardCategories();

    // Poll for updates every 4 seconds
    const interval = setInterval(() => {
      syncRundown();
      syncPhotos();
      syncMoodboard();
      syncMoodboardCategories();
    }, 4000);

    // Sync immediately on focus or tab visibility change
    const handleActiveSync = () => {
      if (document.visibilityState === 'visible') {
        syncRundown();
        syncPhotos();
        syncMoodboard();
        syncMoodboardCategories();
      }
    };
    window.addEventListener('focus', handleActiveSync);
    document.addEventListener('visibilitychange', handleActiveSync);

    // Instant cross-tab sync via storage events
    const handleStorage = (e) => {
      if (e.key === RUNDOWN_STORAGE && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRundownList(parsed);
          }
        } catch {}
      }
      if (e.key === PHOTO_STORAGE && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPhotoList(parsed);
          }
        } catch {}
      }
      if (e.key === LOGISTICS_STORAGE && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLogisticsList(parsed);
          }
        } catch {}
      }
      if (e.key === MOODBOARD_STORAGE && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMoodboardItems(parsed);
          }
        } catch {}
      }
      if (e.key === MOODBOARD_CATEGORIES_STORAGE && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMoodboardCategories(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleActiveSync);
      document.removeEventListener('visibilitychange', handleActiveSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(PHOTO_STORAGE, JSON.stringify(photoList));
    } catch (e) {
      console.error(e);
    }
  }, [photoList]);

  useEffect(() => {
    try {
      localStorage.setItem(RUNDOWN_STORAGE, JSON.stringify(rundownList));
    } catch (e) {
      console.error(e);
    }
  }, [rundownList]);

  useEffect(() => {
    try {
      localStorage.setItem(LOGISTICS_STORAGE, JSON.stringify(logisticsList));
    } catch (e) {
      console.error(e);
    }
  }, [logisticsList]);

  useEffect(() => {
    try {
      localStorage.setItem(MOODBOARD_STORAGE, JSON.stringify(moodboardItems));
    } catch (e) {
      console.error(e);
    }
  }, [moodboardItems]);

  useEffect(() => {
    try {
      localStorage.setItem(MOODBOARD_CATEGORIES_STORAGE, JSON.stringify(moodboardCategories));
    } catch (e) {
      console.error(e);
    }
  }, [moodboardCategories]);

  const handlePhotoChange = (newList) => {
    setPhotoList(newList);
    fetch('/api/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newList)
    }).catch(() => {});
  };

  const handleRundownChange = (newList) => {
    setRundownList(newList);
    fetch('/api/rundown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newList)
    }).catch(() => {});
  };

  const handleLogisticsChange = (newList) => {
    setLogisticsList(newList);
  };

  const handleResetLogistics = () => {
    setLogisticsList(INITIAL_LOGISTICS_LIST);
    setSyncStatus({ type: 'success', message: 'Daftar logistik dikembalikan ke bawaan template!' });
  };

  const handleMoodboardItemsChange = (newList) => {
    setMoodboardItems(newList);
    fetch('/api/moodboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newList)
    }).catch(() => {});
  };

  const handleMoodboardCategoriesChange = (newList) => {
    setMoodboardCategories(newList);
    fetch('/api/moodboard-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newList)
    }).catch(() => {});
  };

  const handleResetMoodboardCategories = () => {
    setMoodboardCategories(DEFAULT_MOODBOARD_CATEGORIES);
    fetch('/api/moodboard-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(DEFAULT_MOODBOARD_CATEGORIES)
    }).catch(() => {});
    setSyncStatus({ type: 'success', message: 'Kategori moodboard dikembalikan ke bawaan template!' });
  };

  // Filtered tasks for Checklist module
  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(t => 
        [t.title, t.category, t.pic, t.notes, t.vendorContact].some(v => v?.toLowerCase().includes(q))
      );
    }
    if (selectedCategory) {
      result = result.filter(t => t.category === selectedCategory);
    }
    if (selectedPic) {
      result = result.filter(t => t.pic === selectedPic);
    }
    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    }

    const comparators = {
      'date-asc': (a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'),
      'date-desc': (a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''),
      'progress-desc': (a, b) => (b.progress || 0) - (a.progress || 0),
      'progress-asc': (a, b) => (a.progress || 0) - (b.progress || 0),
      'title-asc': (a, b) => a.title.localeCompare(b.title)
    };

    return comparators[sortBy] ? result.sort(comparators[sortBy]) : result;
  }, [tasks, searchQuery, selectedCategory, selectedPic, statusFilter, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedPic(null);
    setStatusFilter('All');
    setSortBy('default');
  };

  const isFiltered = Boolean(searchQuery || selectedCategory || selectedPic || statusFilter !== 'All' || sortBy !== 'default');

  const openAddModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Full backup to JSON
  const handleExportJSON = () => {
    const backupData = {
      version: '4.0',
      timestamp: new Date().toISOString(),
      branding: 'Andre & Lois Wedding App',
      targetDate: countdown.targetDate,
      tasks,
      photoList,
      rundownList,
      logisticsList,
      moodboardItems,
      moodboardCategories
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Andre_Lois_Wedding_Operations_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Switch to checklist and optionally set filter
  const handleSelectCategoryFromDashboard = (catId) => {
    setSelectedCategory(catId);
    setActiveModule('checklist');
  };

  const handleSelectPicFromDashboard = (picId) => {
    setSelectedPic(picId);
    setActiveModule('checklist');
  };

  const handleSelectStatusFromDashboard = (statusKey) => {
    setSelectedCategory(null);
    setSelectedPic(null);
    setSearchQuery('');
    setStatusFilter(statusKey);
    setActiveModule('checklist');
  };

  // Available modules / sheets configuration
  const MODULES = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Progress Dashboard',
      shortLabel: 'Dashboard',
      desc: 'Ringkasan progres, statistik & linimasa',
      icon: LayoutDashboard,
      badge: `${stats.overallProgress}%`,
      color: 'text-amber-500',
      bg: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'checklist',
      label: 'Wedding Checklist',
      shortLabel: 'Checklist',
      desc: '48 tugas persiapan (Checklist, Linimasa, PIC)',
      icon: CheckSquare,
      badge: tasks.length,
      color: 'text-emerald-500',
      bg: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'photos',
      label: 'List Foto Tamu',
      shortLabel: 'Foto Tamu',
      desc: 'Daftar rombongan foto Andre & Lois Erin',
      icon: Camera,
      badge: photoList.length,
      color: 'text-rose-500',
      bg: 'bg-rose-100 text-rose-800'
    },
    {
      id: 'rundown',
      label: 'Rundown Acara',
      shortLabel: 'Rundown',
      desc: 'Jadwal linimasa waktu hari-H',
      icon: Clock,
      badge: rundownList.length,
      color: 'text-sky-500',
      bg: 'bg-sky-100 text-sky-800'
    },
    {
      id: 'logistics',
      label: 'List Barang & Logistik',
      shortLabel: 'Barang',
      desc: 'Checklist barang di hotel & keperluan holy matrimony',
      icon: Luggage,
      badge: `${logisticsList.filter(i => i.status === 'Siap').length}/${logisticsList.length}`,
      color: 'text-amber-600',
      bg: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'moodboard',
      label: 'Moodboard & Visual',
      shortLabel: 'Moodboard',
      desc: 'Inspirasi visual tema, dekorasi, busana & foto',
      icon: Palette,
      badge: moodboardItems.length,
      color: 'text-fuchsia-600',
      bg: 'bg-fuchsia-100 text-fuchsia-800'
    }
  ], [stats.overallProgress, tasks.length, photoList.length, rundownList.length, logisticsList, moodboardItems.length]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D251E] flex flex-col lg:flex-row">
      {/* Sticky Sidebar on Desktop / PC */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 h-screen sticky top-0 bg-white/95 backdrop-blur-xl border-r border-[#EADBCE]/90 z-30 shrink-0 select-none">
        {/* Sidebar Brand Header */}
        <div className="p-4 xl:p-5 border-b border-stone-100 flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.06, rotate: 2 }} 
            whileTap={{ scale: 0.94 }}
            className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shadow-xs shrink-0 cursor-pointer border border-amber-200/60"
          >
            <img src={logoImg} alt="Andre & Lois Monogram" className="w-full h-full object-contain block rounded-2xl" />
          </motion.div>
          <div className="min-w-0">
            <h1 className="text-lg xl:text-xl font-extrabold text-stone-900 tracking-tight truncate leading-tight">
              Andre &amp; Lois
            </h1>
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-xs text-stone-500 truncate font-medium">
                Wedding App
              </p>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full leading-none" title="Tersambung ke database Neon PostgreSQL">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Neon DB</span>
              </span>
            </div>
          </div>
        </div>

        {/* Countdown Card Widget */}
        <div className="px-3 xl:px-4 pt-3.5 pb-1">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsDateModalOpen(true)}
            className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-amber-500/15 border border-amber-300/60 flex items-center justify-between cursor-pointer group shadow-2xs"
            title="Klik untuk ubah target tanggal Hari-H"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <CalendarDays size={15} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900/70 block">
                  Hitung Mundur
                </span>
                <span className="text-xs font-black text-stone-900 tabular-nums truncate block">
                  {countdown.isPast ? 'Hari-H Pernikahan!' : `H-${countdown.days} Hari`}
                </span>
              </div>
            </div>
            <Edit3 size={13} className="text-amber-700 opacity-60 group-hover:opacity-100 transition shrink-0" />
          </motion.div>
        </div>

        {/* Vertical Navigation Menu List */}
        <nav className="flex-1 overflow-y-auto px-3 xl:px-4 py-2.5 space-y-1 custom-scrollbar">
          <div className="px-2 pb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
              Menu Operasional
            </span>
          </div>

          {MODULES.map(mod => (
            <SidebarNavItem
              key={mod.id}
              active={activeModule === mod.id}
              onClick={() => setActiveModule(mod.id)}
              icon={mod.icon}
              label={mod.label}
              badge={mod.badge}
              iconColor={mod.color}
            />
          ))}
        </nav>

        {/* Sidebar Footer & Actions */}
        <div className="p-3 xl:p-4 border-t border-stone-100 bg-stone-50/60 space-y-2">
          {/* Quick Add Task Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={openAddModal}
            className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 hover:from-amber-700 hover:to-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus size={15} />
            <span>Tambah Tugas Baru</span>
          </motion.button>

          {/* Utility Row */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={syncFromGoogleSheet}
              disabled={isSyncing}
              className="flex-1 py-1.5 px-2.5 rounded-xl border border-stone-200 bg-white hover:bg-emerald-50/60 hover:border-emerald-300 text-stone-700 hover:text-emerald-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-2xs disabled:opacity-50 cursor-pointer min-w-0"
              title="Sinkronkan data secara realtime dengan Neon PostgreSQL Database"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin text-emerald-600' : 'text-emerald-600'} />
              <span className="truncate">{isSyncing ? 'Syncing...' : 'Neon DB Live Sync'}</span>
            </button>

            <button
              type="button"
              onClick={exportToCSV}
              className="py-1.5 px-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-[11px] font-bold flex items-center justify-center gap-1 transition shadow-2xs cursor-pointer shrink-0"
              title="Unduh data checklist sebagai CSV"
            >
              <Download size={12} className="text-stone-500" />
              <span>CSV</span>
            </button>
          </div>

          <div className="pt-0.5 text-center text-[10px] text-stone-400 font-medium">
            © 2026 Andre &amp; Lois
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Top Navigation Bar (Mobile Only) */}
        <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#EADBCE]/80 shadow-xs transition-all">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
            <div className="flex items-center justify-between h-14 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-xs shrink-0 cursor-pointer">
                  <img src={logoImg} alt="Andre & Lois Monogram" className="w-full h-full object-contain block rounded-xl" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-extrabold text-stone-900 tracking-tight truncate leading-tight">
                    Andre &amp; Lois
                  </h1>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-stone-500 font-medium">Wedding App</span>
                    <span className="w-1 h-1 rounded-full bg-stone-300" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-700">Neon DB</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={syncFromGoogleSheet}
                  disabled={isSyncing}
                  className="p-1.5 rounded-xl border border-stone-200 bg-white text-emerald-700 text-xs font-bold flex items-center justify-center shadow-2xs cursor-pointer active:scale-95 transition"
                  title="Sinkronkan dengan Neon DB"
                >
                  <RefreshCw size={13} className={isSyncing ? 'animate-spin text-emerald-600' : 'text-emerald-600'} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsDateModalOpen(true)}
                  className="px-2.5 py-1 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="Ubah target tanggal Hari-H"
                >
                  <CalendarDays size={12} className="text-amber-600" />
                  <span>{countdown.isPast ? 'Hari-H!' : `H-${countdown.days}`}</span>
                </button>

                <button
                  type="button"
                  onClick={openAddModal}
                  className="p-1.5 rounded-xl bg-stone-900 text-white text-xs font-bold flex items-center justify-center shadow-xs cursor-pointer"
                  title="Tambah Tugas"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area: Instant 0ms Tab Switching with Hardware Accelerated Fade */}
        <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-6 flex-1 space-y-3 sm:space-y-6 pb-28 sm:pb-24 lg:pb-8">
        <ErrorBoundary onReset={() => setActiveModule('dashboard')} onGoHome={() => setActiveModule('dashboard')}>
          <div key={activeModule} className="w-full animate-fade-in">
        {/* Module 1: Dashboard Overview */}
        {activeModule === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6">

            <StatsOverview 
              stats={stats} 
              onSelectCategory={handleSelectCategoryFromDashboard}
              selectedCategory={selectedCategory}
              onSelectPic={handleSelectPicFromDashboard}
              selectedPic={selectedPic}
              onSelectStatus={handleSelectStatusFromDashboard}
              onSwitchToChecklist={() => {
                setStatusFilter('All');
                setActiveModule('checklist');
              }}
            />

            {/* Quick Navigation Cards to other sheets with bright gradient accents */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-2">
              <button
                type="button"
                onClick={() => setActiveModule('checklist')}
                className="nude-card p-5 rounded-3xl text-left bg-gradient-to-br from-white via-nude-50 to-emerald-50/40 hover:border-emerald-300 transition group shadow-nude-soft"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mb-3 shadow-xs">
                  <CheckSquare size={20} />
                </div>
                <h3 className="text-sm font-bold text-stone-900">Wedding Checklist</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Buka detail 48 tugas dengan 3 tampilan (Checklist, Linimasa, PIC).
                </p>
                <div className="mt-3.5 text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Kelola tugas ({stats.completed}/{stats.total} selesai) <ArrowRight size={13} />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveModule('photos')}
                className="nude-card p-5 rounded-3xl text-left bg-gradient-to-br from-white via-nude-50 to-rose-50/40 hover:border-rose-300 transition group shadow-nude-soft"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center mb-3 shadow-xs">
                  <Camera size={20} />
                </div>
                <h3 className="text-sm font-bold text-stone-900">List Foto Tamu</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Daftar urutan sesi foto panggung keluarga besar Andre &amp; Lois Erin.
                </p>
                <div className="mt-3.5 text-xs font-bold text-rose-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Buka daftar foto ({photoList.length} kelompok) <ArrowRight size={13} />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveModule('rundown')}
                className="nude-card p-5 rounded-3xl text-left bg-gradient-to-br from-white via-nude-50 to-amber-50/40 hover:border-amber-300 transition group shadow-nude-soft"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mb-3 shadow-xs">
                  <Clock size={20} />
                </div>
                <h3 className="text-sm font-bold text-stone-900">Rundown Hari-H</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Linimasa terstruktur persiapan, ibadah pemberkatan, adat &amp; resepsi.
                </p>
                <div className="mt-3.5 text-xs font-bold text-amber-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Lihat linimasa acara ({rundownList.length} sesi) <ArrowRight size={13} />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveModule('logistics')}
                className="nude-card p-5 rounded-3xl text-left bg-gradient-to-br from-white via-nude-50 to-amber-50/40 hover:border-amber-300 transition group shadow-nude-soft"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-600 text-white flex items-center justify-center mb-3 shadow-xs">
                  <Luggage size={20} />
                </div>
                <h3 className="text-sm font-bold text-stone-900">Logistik &amp; Barang</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Checklist barang di hotel &amp; keperluan ibadah Holy Matrimony.
                </p>
                <div className="mt-3.5 text-xs font-bold text-amber-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Cek barang ({logisticsList.filter(i => i.status === 'Siap').length}/{logisticsList.length} siap) <ArrowRight size={13} />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveModule('moodboard')}
                className="nude-card p-5 rounded-3xl text-left bg-gradient-to-br from-white via-nude-50 to-fuchsia-50/40 hover:border-fuchsia-300 transition group shadow-nude-soft"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-pink-500 to-rose-500 text-white flex items-center justify-center mb-3 shadow-xs">
                  <Palette size={20} />
                </div>
                <h3 className="text-sm font-bold text-stone-900">Moodboard &amp; Visual</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Koleksi inspirasi tema dekorasi, busana, makeup, bunga &amp; dokumentasi.
                </p>
                <div className="mt-3.5 text-xs font-bold text-fuchsia-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Lihat inspirasi ({moodboardItems.length} foto) <ArrowRight size={13} />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Module 2: Wedding Checklist */}
        {activeModule === 'checklist' && (
          <div className="space-y-3 sm:space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-base sm:text-xl font-extrabold text-stone-900 tracking-tight">
                    Wedding Checklist
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-2xs">
                    {tasks.length} Tugas
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
                  {stats.completed}/{stats.total} selesai ({stats.overallProgress}%) · 4 kategori
                </p>
              </div>

              <button
                type="button"
                onClick={openAddModal}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-stone-900 to-stone-800 hover:from-amber-700 hover:to-rose-700 text-white transition flex items-center gap-1 shadow-xs shrink-0 cursor-pointer"
              >
                <Plus size={14} />
                <span>Tambah</span>
              </button>
            </div>

            {/* View Switcher: Table, Kanban, Timeline, PIC */}
            <ViewSwitcher
              activeView={activeView}
              onViewChange={setActiveView}
              counts={{ filtered: filteredTasks.length, total: tasks.length }}
            />

            {/* Filter & Search Bar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalResults={filteredTasks.length}
              isFiltered={isFiltered}
              onResetFilters={resetFilters}
              overdueCount={stats.overdueCount}
            />

            {/* Active Sub-View */}
            {activeView === 'table' && (
              <TaskTableView
                tasks={filteredTasks}
                onToggleDone={toggleTaskDone}
                onUpdateProgress={updateTaskProgress}
                onUpdateStatus={updateTaskStatus}
                onEditTask={openEditModal}
                onDeleteTask={deleteTask}
              />
            )}

            {activeView === 'timeline' && (
              <TaskTimelineView
                tasks={filteredTasks}
                onToggleDone={toggleTaskDone}
                onEditTask={openEditModal}
              />
            )}

            {activeView === 'pic' && (
              <TaskPicView
                tasks={filteredTasks}
                onToggleDone={toggleTaskDone}
                onEditTask={openEditModal}
              />
            )}
          </div>
        )}

        {/* Module 3: List Foto Tamu */}
        {activeModule === 'photos' && (
          <GuestPhotoView
            items={photoList}
            onChange={handlePhotoChange}
          />
        )}

        {/* Module 4: Rundown */}
        {activeModule === 'rundown' && (
          <RundownView
            items={rundownList}
            onChange={handleRundownChange}
          />
        )}

        {/* Module 5: Logistik & Barang */}
        {activeModule === 'logistics' && (
          <LogisticsView
            items={logisticsList}
            onChange={handleLogisticsChange}
            onResetToDefault={handleResetLogistics}
          />
        )}

        {/* Module 6: Moodboard & Visual */}
        {activeModule === 'moodboard' && (
          <MoodboardView
            items={moodboardItems}
            categories={moodboardCategories}
            onChangeItems={handleMoodboardItemsChange}
            onChangeCategories={handleMoodboardCategoriesChange}
            onResetToDefault={handleResetMoodboardCategories}
          />
        )}
          </div>
        </ErrorBoundary>
      </main>

      {/* Footer Branding (Copyright Only for Mobile) */}
      <footer className="mt-auto border-t border-[#EADBCE] bg-white pt-5 pb-28 lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-stone-500">
          <p className="font-medium">© 2026 Andre &amp; Lois. All rights reserved.</p>
        </div>
      </footer>
      </div>

      {/* Modern Floating Island Navigation Dock for Mobile (Ultra-modern iOS Style) */}
      <div className="lg:hidden fixed bottom-3.5 inset-x-3 z-40 max-w-md mx-auto pointer-events-none">
        <nav className="pointer-events-auto glass-dock rounded-3xl p-1.5 flex items-center justify-between relative shadow-dock">
          {MODULES.map(mod => (
            <MobileNavButton
              key={mod.id}
              active={activeModule === mod.id}
              onClick={() => setActiveModule(mod.id)}
              icon={mod.icon}
              label={mod.shortLabel}
            />
          ))}
        </nav>
      </div>

      {/* Modals & Notifications */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={(data) => editingTask ? editTask(editingTask.id, data) : addTask(data)}
        editingTask={editingTask}
      />

      <CountdownModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        targetDate={countdown.targetDate}
        onSaveDate={countdown.setTargetDate}
      />

      <SyncNotification
        status={syncStatus}
        onClose={() => setSyncStatus(null)}
      />
    </div>
  );
}

function SidebarNavItem({ active, onClick, icon: Icon, label, badge, iconColor }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full relative px-3 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer group select-none text-left ${
        active 
          ? 'text-stone-900 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border border-amber-400/40 shadow-2xs' 
          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 border border-transparent'
      }`}
    >
      {active && (
        <motion.div
          layoutId="sidebarActiveIndicator"
          className="absolute left-0 top-2 bottom-2 w-1.5 bg-gradient-to-b from-amber-600 to-rose-600 rounded-r-full shadow-xs"
          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
        />
      )}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
          active ? 'bg-gradient-to-tr from-amber-600 to-rose-600 text-white shadow-xs' : 'bg-stone-100 text-stone-500 group-hover:bg-stone-200/80 group-hover:text-stone-800'
        }`}>
          <Icon size={16} className={active ? 'text-white' : iconColor} />
        </div>
        <span className={`truncate text-xs ${active ? 'font-extrabold text-stone-900' : 'font-semibold text-stone-600'}`}>
          {label}
        </span>
      </div>
      {badge !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tabular-nums shrink-0 transition-colors ${
          active ? 'bg-amber-600 text-white shadow-2xs' : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function MobileNavButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 min-w-0 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all cursor-pointer select-none outline-none ${
        active ? 'text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-800'
      }`}
    >
      {active && (
        <motion.div
          layoutId="mobileActiveDockPill"
          className="absolute inset-0 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 rounded-2xl border border-amber-500/30 shadow-xs"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center w-full min-w-0">
        <motion.div
          animate={active ? { scale: [1, 1.15, 1], y: [0, -1.5, 0] } : { scale: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          <Icon 
            size={18} 
            className={`transition-colors duration-200 ${
              active ? 'text-amber-700 stroke-[2.3]' : 'text-stone-400 stroke-[1.8]'
            }`} 
          />
        </motion.div>

        <span className={`text-[9px] sm:text-[10px] leading-tight tracking-tight mt-0.5 truncate max-w-full text-center px-0.5 transition-colors duration-200 ${
          active ? 'font-extrabold text-amber-950' : 'font-medium text-stone-500'
        }`}>
          {label}
        </span>

        {active && (
          <motion.span
            layoutId="mobileActiveDot"
            className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 mt-0.5"
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
      </div>
    </button>
  );
}
