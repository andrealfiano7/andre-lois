import { useState, useEffect, useMemo, useCallback } from 'react';
import { INITIAL_TASKS, GOOGLE_SHEET_CSV_URL } from '../data/initialTasks';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'wedding_checklist_tasks_v4_clean';
const LAST_SYNC_KEY = 'wedding_checklist_last_sync_v4';

export function fireCelebrationConfetti() {
  try {
    confetti({
      particleCount: 45,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: ['#0f172a', '#059669', '#d97706', '#38bdf8']
    });
    confetti({
      particleCount: 45,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: ['#0f172a', '#059669', '#d97706', '#38bdf8']
    });
  } catch (e) {
    console.error('Confetti error:', e);
  }
}

export function useWeddingData() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load from local storage:', e);
    }
    return INITIAL_TASKS;
  });

  const [lastSync, setLastSync] = useState(() => {
    return localStorage.getItem(LAST_SYNC_KEY) || 'Database Neon PostgreSQL';
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [dbStatus, setDbStatus] = useState({ connected: false, checking: true });

  // Auto-save to LocalStorage as offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [tasks]);

  // Fetch from Neon Database via /api/tasks on mount
  useEffect(() => {
    let isMounted = true;
    async function loadFromDb() {
      try {
        const res = await fetch('/api/tasks');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          if (data.data.length > 0 && isMounted) {
            setTasks(data.data);
            setDbStatus({ connected: true, checking: false });
            setLastSync('Database Neon PostgreSQL');
            localStorage.setItem(LAST_SYNC_KEY, 'Database Neon PostgreSQL');
          } else if (data.data.length === 0) {
            await fetch('/api/seed');
            const retryRes = await fetch('/api/tasks');
            const retryData = await retryRes.json();
            if (retryData.success && retryData.data.length > 0 && isMounted) {
              setTasks(retryData.data);
              setDbStatus({ connected: true, checking: false });
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setDbStatus({ connected: false, checking: false });
        }
        console.info('Menggunakan data cache lokal (API database belum aktif di environment ini):', err.message);
      }
    }
    loadFromDb();
    return () => { isMounted = false; };
  }, []);

  // Statistics calculation (Executive Metrics)
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Done').length;
    const inProgress = tasks.filter(t => t.status === 'Working on It').length;
    const notStarted = tasks.filter(t => t.status === 'Not yet Started').length;
    
    // Weighted progress
    const totalProgressPoints = tasks.reduce((sum, t) => {
      if (t.status === 'Done') return sum + 100;
      if (t.status === 'Working on It') return sum + (t.progress || 50);
      return sum + (t.progress || 0);
    }, 0);
    
    const overallProgress = total > 0 ? Math.round(totalProgressPoints / total) : 0;

    // Category Stats
    const categoryMap = {};
    tasks.forEach(t => {
      const cat = t.category || 'Lainnya';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { total: 0, completed: 0, inProgress: 0, notStarted: 0, progressSum: 0 };
      }
      categoryMap[cat].total++;
      if (t.status === 'Done') categoryMap[cat].completed++;
      else if (t.status === 'Working on It') categoryMap[cat].inProgress++;
      else categoryMap[cat].notStarted++;

      const p = t.status === 'Done' ? 100 : (t.status === 'Working on It' ? (t.progress || 50) : 0);
      categoryMap[cat].progressSum += p;
    });

    const categoryStats = Object.keys(categoryMap).map(key => ({
      category: key,
      ...categoryMap[key],
      percentage: Math.round(categoryMap[key].progressSum / categoryMap[key].total)
    }));

    // PIC Stats
    const picMap = {};
    tasks.forEach(t => {
      const pic = t.pic || 'Unassigned';
      if (!picMap[pic]) {
        picMap[pic] = { total: 0, completed: 0, inProgress: 0, notStarted: 0, progressSum: 0 };
      }
      picMap[pic].total++;
      if (t.status === 'Done') picMap[pic].completed++;
      else if (t.status === 'Working on It') picMap[pic].inProgress++;
      else picMap[pic].notStarted++;

      const p = t.status === 'Done' ? 100 : (t.status === 'Working on It' ? (t.progress || 50) : 0);
      picMap[pic].progressSum += p;
    });

    const picStats = Object.keys(picMap).map(key => ({
      pic: key,
      ...picMap[key],
      percentage: Math.round(picMap[key].progressSum / picMap[key].total)
    }));

    // Overdue tasks
    const today = new Date().toISOString().split('T')[0];
    const overdueTasks = tasks.filter(t => t.status !== 'Done' && t.dueDate && t.dueDate < today);

    // Upcoming tasks (next 5 uncompleted tasks)
    const upcomingTasks = [...tasks]
      .filter(t => t.status !== 'Done' && t.dueDate)
      .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
      .slice(0, 5);

    return {
      total,
      completed,
      inProgress,
      notStarted,
      overallProgress,
      categoryStats,
      picStats,
      overdueCount: overdueTasks.length,
      upcomingTasks
    };
  }, [tasks]);

  // Toggle Done
  const toggleTaskDone = useCallback((taskId) => {
    setTasks(prev => {
      let target = null;
      const updated = prev.map(task => {
        if (task.id === taskId) {
          const isDone = task.status === 'Done';
          if (!isDone) {
            fireCelebrationConfetti();
            target = { ...task, status: 'Done', progress: 100 };
          } else {
            target = { ...task, status: 'Not yet Started', progress: 0 };
          }
          return target;
        }
        return task;
      });
      if (target) {
        fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: target.id, status: target.status, progress: target.progress })
        }).catch(e => console.info('API sync note:', e.message));
      }
      return updated;
    });
  }, []);

  // Update Status
  const updateTaskStatus = useCallback((taskId, newStatus) => {
    setTasks(prev => {
      let target = null;
      const updated = prev.map(task => {
        if (task.id === taskId) {
          let newProgress = task.progress;
          if (newStatus === 'Done') {
            newProgress = 100;
            fireCelebrationConfetti();
          } else if (newStatus === 'Working on It') {
            newProgress = task.progress === 100 || task.progress === 0 ? 50 : task.progress;
          } else if (newStatus === 'Not yet Started') {
            newProgress = 0;
          }
          target = { ...task, status: newStatus, progress: newProgress };
          return target;
        }
        return task;
      });
      if (target) {
        fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: target.id, status: target.status, progress: target.progress })
        }).catch(e => console.info('API sync note:', e.message));
      }
      return updated;
    });
  }, []);

  // Update Progress
  const updateTaskProgress = useCallback((taskId, progressVal) => {
    setTasks(prev => {
      let target = null;
      const updated = prev.map(task => {
        if (task.id === taskId) {
          let status = 'Not yet Started';
          if (progressVal === 100) {
            status = 'Done';
            fireCelebrationConfetti();
          } else if (progressVal > 0) {
            status = 'Working on It';
          }
          target = { ...task, progress: progressVal, status };
          return target;
        }
        return task;
      });
      if (target) {
        fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: target.id, progress: target.progress, status: target.status })
        }).catch(e => console.info('API sync note:', e.message));
      }
      return updated;
    });
  }, []);

  // Add Task
  const addTask = useCallback((newTask) => {
    const id = 'task-' + Date.now();
    const taskWithDefaults = {
      id,
      sheetNo: String(tasks.length + 1),
      category: newTask.category || 'A. Dealing Vendor',
      title: newTask.title || 'Tugas Baru',
      pic: newTask.pic || 'Bride & Groom',
      rawDate: newTask.dueDate || '',
      dueDate: newTask.dueDate || '',
      progress: Number(newTask.progress) || 0,
      status: newTask.status || 'Not yet Started',
      vendorContact: newTask.vendorContact || '',
      notes: newTask.notes || ''
    };
    setTasks(prev => [taskWithDefaults, ...prev]);
    setSyncStatus({ type: 'success', message: `Tugas "${newTask.title}" berhasil ditambahkan!` });

    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskWithDefaults)
    }).catch(e => console.info('API sync note:', e.message));
  }, [tasks.length]);

  // Edit Task
  const editTask = useCallback((taskId, updatedFields) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, ...updatedFields };
      }
      return task;
    }));
    setSyncStatus({ type: 'success', message: `Perubahan tugas berhasil disimpan!` });

    fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId, ...updatedFields })
    }).catch(e => console.info('API sync note:', e.message));
  }, []);

  // Delete Task
  const deleteTask = useCallback((taskId) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setSyncStatus({ 
      type: 'success', 
      message: `Tugas "${taskToDelete ? taskToDelete.title : ''}" telah dihapus.` 
    });

    fetch(`/api/tasks?id=${encodeURIComponent(taskId)}`, {
      method: 'DELETE'
    }).catch(e => console.info('API sync note:', e.message));
  }, [tasks]);

  // Reset to Default
  const resetToDefault = useCallback(() => {
    setTasks(INITIAL_TASKS);
    localStorage.removeItem(STORAGE_KEY);
    const nowStr = 'Data Di-reset ke Awal (' + new Date().toLocaleTimeString('id-ID') + ')';
    setLastSync(nowStr);
    localStorage.setItem(LAST_SYNC_KEY, nowStr);
    setSyncStatus({ type: 'success', message: 'Seluruh checklist berhasil dikembalikan ke data template awal!' });
  }, []);

  // Live Sync from Neon Database (with Google Sheet fallback)
  const syncFromGoogleSheet = useCallback(async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      // 1. Prioritaskan Live Sync langsung dari database Neon PostgreSQL
      try {
        const res = await fetch('/api/tasks');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setTasks(data.data);
            const timestamp = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
            const syncMsg = `Database Neon PostgreSQL (${timestamp})`;
            setLastSync(syncMsg);
            localStorage.setItem(LAST_SYNC_KEY, syncMsg);
            setDbStatus({ connected: true, checking: false });
            setSyncStatus({ 
              type: 'success', 
              message: `Neon DB Live Sync berhasil! ${data.data.length} tugas termutakhirkan secara realtime dari database cloud.` 
            });
            return;
          }
        }
      } catch (dbErr) {
        console.warn('Neon DB sync direct fetch failed, trying Google Sheet fallback:', dbErr);
      }

      // 2. Fallback ke Google Sheet jika API Neon offline atau di environment lokal tanpa backend
      let csvText = '';
      try {
        const res = await fetch(GOOGLE_SHEET_CSV_URL);
        if (res.ok) {
          csvText = await res.text();
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      } catch (directErr) {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(GOOGLE_SHEET_CSV_URL)}`;
        const resProxy = await fetch(proxyUrl);
        if (resProxy.ok) {
          csvText = await resProxy.text();
        } else {
          throw new Error('Koneksi server database & spreadsheet tidak merespon');
        }
      }

      if (!csvText || !csvText.includes('Dealing Vendor')) {
        throw new Error('Data spreadsheet tidak valid atau tertutup');
      }

      const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
      const parsedTasks = [];
      let currentCategory = '';

      function parseCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current);
        return result;
      }

      lines.forEach((line, index) => {
        const row = parseCsvLine(line);
        const col0 = (row[0] || '').trim();
        const col1 = (row[1] || '').trim();
        const col2 = (row[2] || '').trim();
        const col3 = (row[3] || '').trim();
        const col4 = (row[4] || '').trim();
        const col5 = (row[5] || '').trim();
        const col6 = (row[6] || '').trim();

        if (col1 === 'Progres Keseluruhan' || col1.includes('%')) return;
        if (col1 === 'Kategori' || col2 === 'Tugas' || col2 === 'To Do') return;

        if (col2) {
          let cat = col1 || currentCategory;
          if (cat) currentCategory = cat;

          let progress = 0;
          if (col5) {
            if (col5.includes('%')) {
              progress = parseInt(col5.replace('%', ''), 10) || 0;
            } else {
              const num = parseFloat(col5.replace(',', '.'));
              if (!isNaN(num)) {
                progress = Math.round(num <= 1 ? num * 100 : num);
              }
            }
          }

          let status = col6 || 'Not yet Started';
          if (!col6) {
            if (progress === 100) status = 'Done';
            else if (progress > 0) status = 'Working on It';
            else status = 'Not yet Started';
          }

          let isoDate = '';
          if (col4) {
            if (col4.includes('/')) {
              const [d, m, y] = col4.split('/');
              isoDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            } else if (col4.includes('-')) {
              isoDate = col4;
            }
          }

          const existing = tasks.find(t => t.title === col2);

          parsedTasks.push({
            id: `sheet-task-${index}`,
            sheetNo: col0,
            category: cat,
            title: col2,
            pic: col3 || 'Bride & Groom',
            rawDate: col4,
            dueDate: isoDate,
            progress,
            status,
            vendorContact: existing?.vendorContact || '',
            notes: existing?.notes || ''
          });
        }
      });

      if (parsedTasks.length > 0) {
        setTasks(parsedTasks);
        const timestamp = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
        const syncMsg = `Tersinkronisasi (${timestamp})`;
        setLastSync(syncMsg);
        localStorage.setItem(LAST_SYNC_KEY, syncMsg);
        setSyncStatus({ type: 'success', message: `Sinkronisasi berhasil! ${parsedTasks.length} tugas diperbarui dari Google Sheet.` });
      }
    } catch (err) {
      console.error('Sync error:', err);
      setSyncStatus({ 
        type: 'error', 
        message: `Sinkronisasi gagal: ${err.message}. Data lokal tetap aman.` 
      });
    } finally {
      setIsSyncing(false);
    }
  }, [tasks]);

  // Export Data to CSV (Checklist Operasional)
  const exportToCSV = useCallback(() => {
    const headers = ['No', 'Kategori', 'Tugas', 'PIC', 'Target Tanggal', 'Progress', 'Status', 'Kontak Vendor', 'Catatan'];
    const rows = tasks.map(t => [
      t.sheetNo || t.id,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.pic || '').replace(/"/g, '""')}"`,
      t.dueDate || t.rawDate || '',
      `${t.progress}%`,
      t.status,
      `"${(t.vendorContact || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Wedding_Checklist_Andre_Lois_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [tasks]);

  return {
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
  };
}
