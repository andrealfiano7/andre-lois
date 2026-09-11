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
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from './assets/logo.png';
import { useWeddingData } from './hooks/useWeddingData';
import { useCountdown } from './hooks/useCountdown';
import { GOOGLE_SHEET_URL } from './data/initialTasks';
import { INITIAL_PHOTO_LIST, INITIAL_RUNDOWN } from './data/otherSheets';
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

const PHOTO_STORAGE = 'wedding_photo_list_v4_clean';
const RUNDOWN_STORAGE = 'wedding_rundown_v5_live';

const loadStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
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

    // Initial sync
    syncRundown();
    syncPhotos();

    // Poll for updates every 4 seconds
    const interval = setInterval(() => {
      syncRundown();
      syncPhotos();
    }, 4000);

    // Sync immediately on focus or tab visibility change
    const handleActiveSync = () => {
      if (document.visibilityState === 'visible') {
        syncRundown();
        syncPhotos();
      }
    };
    window.addEventListener('focus', handleActiveSync);
    document.addEventListener('visibilitychange', handleActiveSync);

    // Instant cross-tab sync via storage events
    const handleStorage = (e) => {
      if (e.key === RUNDOWN_STORAGE && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setRundownList(parsed);
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
      branding: 'Andre & Lois Wedding Operations',
      targetDate: countdown.targetDate,
      tasks,
      photoList,
      rundownList
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

  // Available modules / sheets configuration
  const MODULES = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
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
    }
  ], [stats.overallProgress, tasks.length, photoList.length, rundownList.length]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D251E] flex flex-col">
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#EADBCE]/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
            
            {/* Left: Brand Identity with Cursive AL Monogram Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <motion.div 
                whileHover={{ scale: 1.06, rotate: 2 }} 
                whileTap={{ scale: 0.94 }}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border border-[#EADBCE] p-1.5 flex items-center justify-center shadow-xs flex-shrink-0 cursor-pointer"
              >
                <img src={logoImg} alt="Andre & Lois Monogram" className="w-full h-full object-contain block" />
              </motion.div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight truncate">
                  Andre &amp; Lois
                </h1>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-[10px] sm:text-[11px] text-stone-500 truncate font-medium">
                    Wedding Dashboard
                  </p>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full leading-none" title="Tersambung ke database Neon PostgreSQL">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Neon DB</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Countdown Pill */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setIsDateModalOpen(true)}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-2xl border border-stone-200/90 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition shadow-xs cursor-pointer"
                title="Ubah target tanggal Hari-H"
              >
                <CalendarDays size={13} className="text-amber-600 flex-shrink-0" />
                <span className="tabular-nums whitespace-nowrap">
                  {countdown.isPast ? 'Hari-H!' : `H-${countdown.days}`}
                  <span className="hidden sm:inline"> Hari</span>
                </span>
              </motion.button>

              {/* Sync from Google Sheet */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={syncFromGoogleSheet}
                disabled={isSyncing}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition shadow-xs disabled:opacity-50 cursor-pointer"
                title="Sinkronkan data dari Google Spreadsheet"
              >
                <RefreshCw size={13} className={isSyncing ? 'animate-spin text-amber-600' : 'text-stone-500'} />
                <span>{isSyncing ? 'Sinkron...' : 'Sinkronkan'}</span>
              </motion.button>

              {/* Export Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={exportToCSV}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition shadow-xs cursor-pointer"
                title="Unduh data checklist sebagai CSV"
              >
                <Download size={13} className="text-stone-500" />
                <span>CSV</span>
              </motion.button>

              {/* Quick Add Task Button (Desktop) */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={openAddModal}
                className="hidden sm:inline-flex px-3.5 sm:px-4 py-1.5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 hover:from-amber-700 hover:to-rose-700 text-white text-xs font-bold items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Tambah Tugas</span>
              </motion.button>
            </div>
          </div>

          {/* Desktop Navigation Tabs with Sliding Spring Pill Indicator */}
          <nav className="hidden lg:flex items-center gap-1.5 border-t border-stone-100 pt-1.5 pb-1.5">
            {MODULES.map(mod => (
              <DesktopNavTab
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
        </div>
      </header>

      {/* Main Content Area with Smooth Page Crossfade Transitions */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-6 flex-1 space-y-3 sm:space-y-6 pb-28 sm:pb-24 lg:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
        {/* Module 1: Dashboard Overview */}
        {activeModule === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6">

            <StatsOverview 
              stats={stats} 
              onSelectCategory={handleSelectCategoryFromDashboard}
              selectedCategory={selectedCategory}
              onSelectPic={handleSelectPicFromDashboard}
              selectedPic={selectedPic}
              onSwitchToChecklist={() => setActiveModule('checklist')}
            />

            {/* Quick Navigation Cards to other sheets with bright gradient accents */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
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
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Branding (Copyright Only) */}
      <footer className="mt-auto border-t border-[#EADBCE] bg-white pt-5 pb-28 lg:pb-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-stone-500">
          <p className="font-medium">© 2026 Andre &amp; Lois. All rights reserved.</p>
        </div>
      </footer>

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

function DesktopNavTab({ active, onClick, icon: Icon, label, badge, iconColor }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={`relative px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
        active 
          ? 'text-white shadow-xs' 
          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
      }`}
    >
      {active && (
        <motion.div
          layoutId="desktopActiveTabPill"
          className="absolute inset-0 bg-gradient-to-r from-amber-600 to-rose-600 rounded-2xl shadow-xs"
          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        <Icon size={15} className={active ? 'text-white' : iconColor} />
        <span>{label}</span>
        {badge !== undefined && (
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold tabular-nums transition-colors ${
            active ? 'bg-white/25 text-white' : 'bg-stone-200/80 text-stone-700'
          }`}>
            {badge}
          </span>
        )}
      </span>
    </motion.button>
  );
}

function MobileNavButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all cursor-pointer select-none outline-none ${
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

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={active ? { scale: [1, 1.18, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          <Icon 
            size={21} 
            className={`transition-colors duration-200 ${
              active ? 'text-amber-700 stroke-[2.3]' : 'text-stone-400 stroke-[1.8]'
            }`} 
          />
        </motion.div>

        <span className={`text-[10px] tracking-tight mt-1 transition-colors duration-200 ${
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
