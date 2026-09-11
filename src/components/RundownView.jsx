import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Sparkles, 
  Info, 
  Sun, 
  Church, 
  PartyPopper, 
  Moon, 
  User, 
  Check, 
  Timer, 
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PHASES = [
  'Semua',
  'Persiapan Pagi',
  'Pemberkatan',
  'Resepsi',
  'Penutupan'
];

// Helper to convert any time string to strict 24-hour HH:MM format
function to24Hour(timeStr) {
  if (!timeStr) return '08:00';
  const clean = timeStr.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!match) {
    const parts = clean.split(':');
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    return clean;
  }
  let h = parseInt(match[1], 10);
  const m = match[2];
  const meridiem = match[3];
  if (meridiem) {
    const isPM = meridiem.toLowerCase() === 'pm';
    if (isPM && h < 12) h += 12;
    if (!isPM && h === 12) h = 0;
  }
  return `${String(h).padStart(2, '0')}:${m}`;
}

// Convert time range to 24-hour format, e.g. "08:00 AM - 10:00 AM" -> "08:00 - 10:00"
function formatRangeTo24Hour(rangeStr) {
  if (!rangeStr) return '';
  const parts = rangeStr.split('-').map(t => t.trim());
  if (parts.length === 2) {
    return `${to24Hour(parts[0])} - ${to24Hour(parts[1])}`;
  }
  return to24Hour(rangeStr);
}

// Helper to compute minutes between HH:MM and HH:MM
function calculateMinutes(start, end) {
  if (!start || !end) return '';
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return '';
  let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diff < 0) diff += 24 * 60; // Crosses midnight
  return diff;
}

// Format minutes to readable duration string, e.g. "60m" or "1j 30m"
function formatMinutes(mins) {
  if (!mins && mins !== 0) return '';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainder = mins % 60;
  return remainder > 0 ? `${hours}j ${remainder}m` : `${hours * 60}m`;
}

// Add minutes to HH:MM string and return new HH:MM
function addMinutes(timeStr, minsToAdd) {
  if (!timeStr) return '09:00';
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  let total = h * 60 + m + minsToAdd;
  total = total % (24 * 60);
  const newH = Math.floor(total / 60);
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

export function RundownView({ items, onChange }) {
  const [selectedPhase, setSelectedPhase] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Time picker state for modal
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [customDuration, setCustomDuration] = useState('60m');
  const [phase, setPhase] = useState('Persiapan Pagi');
  const [activity, setActivity] = useState('');
  const [pic, setPic] = useState('Bride & Groom');
  const [note, setNote] = useState('');

  // Normalize items to ensure no legacy 'Siang / Adat' remains and time is 24-hour
  const normalizedItems = useMemo(() => {
    return items.map(item => {
      let currentPhase = item.phase;
      if (!currentPhase || currentPhase === 'Siang / Adat' || currentPhase.includes('Adat')) {
        const startH = parseInt(item.time?.split(':')[0] || '12', 10);
        currentPhase = startH < 14 ? 'Pemberkatan' : 'Resepsi';
      }
      return {
        ...item,
        phase: currentPhase,
        time: formatRangeTo24Hour(item.time)
      };
    });
  }, [items]);

  // Stats calculation (Clean operational metrics, no status)
  const stats = useMemo(() => {
    const total = normalizedItems.length;
    let totalMinutes = 0;
    normalizedItems.forEach(i => {
      const match = (i.duration || '').match(/(\d+)/);
      if (match) totalMinutes += parseInt(match[1], 10);
    });
    const hours = (totalMinutes / 60).toFixed(1);
    
    // Unique PICs count
    const pics = new Set(normalizedItems.map(i => i.pic).filter(Boolean));

    return { total, hours, picCount: pics.size };
  }, [normalizedItems]);

  // Phase Icon & Color Helper (Strictly without Adat)
  const getPhaseMeta = (p) => {
    if (!p) return { icon: <Layers size={13} className="text-stone-500" />, badge: 'bg-stone-50 text-stone-800 border-stone-200' };
    if (p.includes('Pagi')) return { icon: <Sun size={13} className="text-amber-500" />, badge: 'bg-amber-50 text-amber-900 border-amber-200' };
    if (p.includes('Pemberkatan')) return { icon: <Church size={13} className="text-purple-600" />, badge: 'bg-purple-50 text-purple-900 border-purple-200' };
    if (p.includes('Resepsi')) return { icon: <PartyPopper size={13} className="text-rose-500" />, badge: 'bg-rose-50 text-rose-900 border-rose-200' };
    if (p.includes('Penutupan')) return { icon: <Moon size={13} className="text-sky-600" />, badge: 'bg-sky-50 text-sky-900 border-sky-200' };
    return { icon: <Layers size={13} className="text-stone-500" />, badge: 'bg-stone-50 text-stone-800 border-stone-200' };
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return normalizedItems.filter(item => {
      const matchPhase = selectedPhase === 'Semua' || item.phase === selectedPhase;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || [item.activity, item.pic, item.note, item.time, item.phase].some(v => v?.toLowerCase().includes(q));
      return matchPhase && matchQuery;
    });
  }, [normalizedItems, selectedPhase, searchQuery]);

  // Handle open modal for add
  const handleOpenAdd = () => {
    setEditingItem(null);
    setStartTime('08:00');
    setEndTime('09:00');
    setCustomDuration('60m');
    setPhase(selectedPhase === 'Semua' ? 'Persiapan Pagi' : selectedPhase);
    setActivity('');
    setPic('WO & Planner');
    setNote('');
    setIsModalOpen(true);
  };

  // Handle open modal for edit
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    
    // Parse time in strict 24-hour format
    let s = '08:00';
    let e = '09:00';
    if (item.time) {
      const parts = item.time.split('-').map(t => t.trim());
      if (parts[0]) s = to24Hour(parts[0]);
      if (parts[1]) e = to24Hour(parts[1]);
    }

    setStartTime(s);
    setEndTime(e);
    setCustomDuration(item.duration || '60m');
    let itemPhase = item.phase;
    if (itemPhase === 'Siang / Adat' || itemPhase?.includes('Adat')) {
      const startH = parseInt(s.split(':')[0] || '12', 10);
      itemPhase = startH < 14 ? 'Pemberkatan' : 'Resepsi';
    }
    setPhase(itemPhase || 'Persiapan Pagi');
    setActivity(item.activity || '');
    setPic(item.pic || 'Bride & Groom');
    setNote(item.note || '');
    setIsModalOpen(true);
  };

  // Handlers for time changes with automatic duration sync
  const handleStartTimeChange = (newStart) => {
    setStartTime(newStart);
    const diff = calculateMinutes(newStart, endTime);
    if (diff > 0) {
      setCustomDuration(formatMinutes(diff));
    }
  };

  const handleEndTimeChange = (newEnd) => {
    setEndTime(newEnd);
    const diff = calculateMinutes(startTime, newEnd);
    if (diff > 0) {
      setCustomDuration(formatMinutes(diff));
    }
  };

  const handleQuickAddDuration = (mins) => {
    const newEnd = addMinutes(startTime, mins);
    setEndTime(newEnd);
    setCustomDuration(formatMinutes(mins));
  };

  const handleDelete = (id) => {
    onChange(items.filter(item => item.id !== id));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!activity.trim()) return;

    const timeFormatted = `${to24Hour(startTime)} - ${to24Hour(endTime)}`;
    const payload = {
      time: timeFormatted,
      duration: customDuration || `${calculateMinutes(startTime, endTime)}m`,
      phase,
      activity: activity.trim(),
      pic: pic.trim(),
      note: note.trim()
    };

    if (editingItem) {
      onChange(items.map(i => i.id === editingItem.id ? { ...i, ...payload } : i));
    } else {
      const newItem = {
        id: `rd-${Date.now()}`,
        status: 'Upcoming',
        ...payload
      };
      onChange([...items, newItem]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-3.5 sm:space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-100/90 via-orange-100/70 to-rose-100/80 border border-amber-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-stone-900 tracking-tight">
                Rundown Acara &amp; Linimasa Hari-H
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5">
                Jadwal eksekusi persiapan, ibadah pemberkatan &amp; resepsi pernikahan
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-stone-900 to-stone-800 hover:from-stone-800 hover:to-stone-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={13} />
            <span>Tambah Agenda</span>
          </button>
        </div>
      </div>

      {/* Clean Operational Metric Cards (3 Columns on Mobile & Desktop) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="nude-card p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-white to-amber-50/50">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-500 truncate">Total Sesi</span>
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Calendar size={13} />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-stone-900 mt-1.5 sm:mt-2 tabular-nums">{stats.total}</div>
          <p className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5 truncate">Terjadwal</p>
        </div>

        <div className="nude-card p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-white to-orange-50/50">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-800 truncate">Rentang</span>
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center">
              <Timer size={13} />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-800 mt-1.5 sm:mt-2 tabular-nums">~{stats.hours}j</div>
          <p className="text-[10px] sm:text-[11px] text-amber-700 mt-0.5 truncate">Durasi total</p>
        </div>

        <div className="nude-card p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-white to-emerald-50/50">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-800 truncate">Tim PIC</span>
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <User size={13} />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-800 mt-1.5 sm:mt-2 tabular-nums">{stats.picCount}</div>
          <p className="text-[10px] sm:text-[11px] text-emerald-700 mt-0.5 truncate">Koordinator</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl nude-card">
        {/* Phase Buttons with Spring Indicator */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {PHASES.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPhase(p)}
              className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedPhase === p 
                  ? 'text-white font-bold' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
              }`}
            >
              {selectedPhase === p && (
                <motion.div
                  layoutId="rundownPhasePill"
                  className="absolute inset-0 bg-gradient-to-r from-amber-600 to-rose-600 rounded-xl shadow-xs"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10">{p}</span>
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
            placeholder="Cari kegiatan atau PIC..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-stone-50/50 focus:bg-white outline-none focus:border-amber-600 transition"
          />
        </div>
      </div>

      {/* Clean Rundown List (No Status Buttons, Clean Schedule) */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="nude-card rounded-2xl p-12 text-center">
            <Clock size={24} className="mx-auto text-stone-300 mb-2" />
            <p className="text-xs font-semibold text-stone-700">Tidak ada agenda pada fase yang dipilih.</p>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const phaseMeta = getPhaseMeta(item.phase);

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -2, scale: 1.006 }}
                transition={{ duration: 0.18 }}
                className="nude-card rounded-2xl p-4 border border-stone-200/80 bg-white hover:border-amber-300 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left: Time badge & activity info */}
                  <div className="flex items-start md:items-center gap-3.5">
                    {/* Time Block */}
                    <div className="px-3.5 py-2.5 rounded-2xl border border-stone-200 bg-gradient-to-b from-nude-50 to-amber-50/40 flex flex-col items-center justify-center flex-shrink-0 min-w-[110px] shadow-xs">
                      <span className="text-xs font-extrabold text-stone-900 tabular-nums">
                        {item.time}
                      </span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.2 rounded-full mt-0.5">
                        {item.duration}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${phaseMeta.badge}`}>
                          {phaseMeta.icon}
                          {item.phase}
                        </span>
                        <h4 className="text-sm font-bold text-stone-900">
                          {item.activity}
                        </h4>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-500">
                        <span className="font-bold text-stone-700 flex items-center gap-1">
                          <User size={12} className="text-stone-400" />
                          PIC: {item.pic}
                        </span>
                        {item.note && <span className="text-stone-500">· {item.note}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: Clean Action Buttons (Edit & Delete only) */}
                  <div className="flex items-center gap-1.5 self-end md:self-center">
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
                      title="Edit Agenda"
                    >
                      <Edit3 size={15} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Hapus Agenda"
                    >
                      <Trash2 size={15} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Clean Modal Add/Edit Rundown with Smart Time Picker (Mobile Optimized) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-950/40 backdrop-blur-xs"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              className="relative w-full max-w-md max-h-[92vh] sm:max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden z-10"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Modal Header */}
            <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-rose-50 flex-shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-stone-900">
                  {editingItem ? 'Edit Agenda Rundown' : 'Tambah Agenda Rundown Baru'}
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
                  Atur jadwal waktu kegiatan hari-H
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden min-h-0">
              {/* Scrollable Form Body */}
              <div className="p-4 sm:p-5 space-y-3 sm:space-y-3.5 text-xs overflow-y-auto flex-1 overscroll-contain">
                {/* Time Pickers: Jam Mulai & Jam Selesai */}
                <div>
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
                        <Clock size={11} className="text-amber-600" />
                        <span>Jam Mulai</span> <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-1 bg-stone-50 p-1 sm:p-1.5 rounded-xl border border-stone-200">
                        <div>
                          <select
                            value={startTime.split(':')[0] || '08'}
                            onChange={(e) => {
                              const m = startTime.split(':')[1] || '00';
                              handleStartTimeChange(`${e.target.value.padStart(2, '0')}:${m}`);
                            }}
                            className="w-full px-1.5 py-1.5 rounded-lg border border-stone-300 text-xs sm:text-sm font-bold bg-white text-stone-900 text-center font-mono outline-none focus:border-amber-600 cursor-pointer shadow-2xs"
                          >
                            {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <select
                            value={startTime.split(':')[1] || '00'}
                            onChange={(e) => {
                              const h = startTime.split(':')[0] || '08';
                              handleStartTimeChange(`${h}:${e.target.value.padStart(2, '0')}`);
                            }}
                            className="w-full px-1.5 py-1.5 rounded-lg border border-stone-300 text-xs sm:text-sm font-bold bg-white text-stone-900 text-center font-mono outline-none focus:border-amber-600 cursor-pointer shadow-2xs"
                          >
                            {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
                        <Clock size={11} className="text-amber-600" />
                        <span>Jam Selesai</span> <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-1 bg-stone-50 p-1 sm:p-1.5 rounded-xl border border-stone-200">
                        <div>
                          <select
                            value={endTime.split(':')[0] || '09'}
                            onChange={(e) => {
                              const m = endTime.split(':')[1] || '00';
                              handleEndTimeChange(`${e.target.value.padStart(2, '0')}:${m}`);
                            }}
                            className="w-full px-1.5 py-1.5 rounded-lg border border-stone-300 text-xs sm:text-sm font-bold bg-white text-stone-900 text-center font-mono outline-none focus:border-amber-600 cursor-pointer shadow-2xs"
                          >
                            {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <select
                            value={endTime.split(':')[1] || '00'}
                            onChange={(e) => {
                              const h = endTime.split(':')[0] || '09';
                              handleEndTimeChange(`${h}:${e.target.value.padStart(2, '0')}`);
                            }}
                            className="w-full px-1.5 py-1.5 rounded-lg border border-stone-300 text-xs sm:text-sm font-bold bg-white text-stone-900 text-center font-mono outline-none focus:border-amber-600 cursor-pointer shadow-2xs"
                          >
                            {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Duration Buttons & Calculated Duration */}
                  <div className="mt-2 p-2 rounded-xl bg-amber-50/60 border border-amber-200/70 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-stone-500 font-medium text-[11px]">Estimasi:</span>
                      <span className="font-extrabold text-amber-900 text-xs tabular-nums">
                        {customDuration || '60m'}
                      </span>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {[15, 30, 45, 60, 90, 120].map(mins => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => handleQuickAddDuration(mins)}
                          className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-white text-stone-700 border border-stone-200 hover:border-amber-400 hover:text-amber-800 transition shadow-xs whitespace-nowrap cursor-pointer"
                        >
                          +{mins}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fase Acara */}
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
                    Fase Acara
                  </label>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white outline-none focus:border-amber-600 cursor-pointer"
                  >
                    {PHASES.filter(p => p !== 'Semua').map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Nama Kegiatan */}
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
                    Nama Kegiatan / Agenda <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    placeholder="Contoh: Ibadah Pemberkatan Nikah Kudus..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none focus:border-amber-600"
                  />
                </div>

                {/* PIC */}
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
                    PIC / Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    value={pic}
                    onChange={(e) => setPic(e.target.value)}
                    placeholder="Contoh: WO & Planner, Tim Altar..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none focus:border-amber-600"
                  />
                </div>

                {/* Keterangan & Catatan Teknis */}
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
                    Keterangan &amp; Catatan Teknis
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Lokasi, perlengkapan, briefing khusus..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none focus:border-amber-600 resize-none"
                  />
                </div>
              </div>

              {/* Pinned Modal Actions Footer */}
              <div className="px-4 py-2.5 sm:py-3 sm:px-5 border-t border-stone-100 bg-stone-50/90 flex items-center justify-end gap-2 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200/60 font-semibold transition text-xs cursor-pointer"
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 text-white font-bold hover:from-amber-700 hover:to-rose-700 shadow-xs transition text-xs cursor-pointer"
                >
                  Simpan Agenda
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </div>
  );
}
