import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  Printer, 
  Search, 
  Sparkles, 
  Info, 
  Sun, 
  Church, 
  PartyPopper, 
  Moon, 
  Coffee, 
  User, 
  Check, 
  Timer, 
  Layers
} from 'lucide-react';

const PHASES = [
  'Semua',
  'Persiapan Pagi',
  'Pemberkatan',
  'Siang / Adat',
  'Resepsi',
  'Penutupan'
];

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

  // Stats calculation (Clean operational metrics, no status)
  const stats = useMemo(() => {
    const total = items.length;
    // Calculate total minutes
    let totalMinutes = 0;
    items.forEach(i => {
      const match = (i.duration || '').match(/(\d+)/);
      if (match) totalMinutes += parseInt(match[1], 10);
    });
    const hours = (totalMinutes / 60).toFixed(1);
    
    // Unique PICs count
    const pics = new Set(items.map(i => i.pic).filter(Boolean));

    return { total, hours, picCount: pics.size };
  }, [items]);

  // Phase Icon & Color Helper
  const getPhaseMeta = (p) => {
    if (p.includes('Pagi')) return { icon: <Sun size={13} className="text-amber-500" />, badge: 'bg-amber-50 text-amber-900 border-amber-200' };
    if (p.includes('Pemberkatan')) return { icon: <Church size={13} className="text-purple-600" />, badge: 'bg-purple-50 text-purple-900 border-purple-200' };
    if (p.includes('Siang') || p.includes('Adat')) return { icon: <Coffee size={13} className="text-orange-600" />, badge: 'bg-orange-50 text-orange-900 border-orange-200' };
    if (p.includes('Resepsi')) return { icon: <PartyPopper size={13} className="text-rose-500" />, badge: 'bg-rose-50 text-rose-900 border-rose-200' };
    return { icon: <Moon size={13} className="text-sky-600" />, badge: 'bg-sky-50 text-sky-900 border-sky-200' };
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchPhase = selectedPhase === 'Semua' || item.phase === selectedPhase;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || [item.activity, item.pic, item.note, item.time, item.phase].some(v => v?.toLowerCase().includes(q));
      return matchPhase && matchQuery;
    });
  }, [items, selectedPhase, searchQuery]);

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
    
    // Parse time if format is "HH:MM - HH:MM"
    let s = '08:00';
    let e = '09:00';
    if (item.time) {
      const parts = item.time.split('-').map(t => t.trim());
      if (parts[0] && parts[0].includes(':')) s = parts[0];
      if (parts[1] && parts[1].includes(':')) e = parts[1];
    }

    setStartTime(s);
    setEndTime(e);
    setCustomDuration(item.duration || '60m');
    setPhase(item.phase || 'Persiapan Pagi');
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

    const timeFormatted = `${startTime} - ${endTime}`;
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
            onClick={() => window.print()}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold bg-white/90 hover:bg-white border border-stone-300/80 text-stone-700 shadow-xs transition flex items-center gap-1.5"
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
        {/* Phase Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {PHASES.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPhase(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedPhase === p 
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-xs font-bold' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
              }`}
            >
              {p}
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
              <div
                key={item.id}
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
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition"
                      title="Edit Agenda"
                    >
                      <Edit3 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Hapus Agenda"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Clean Modal Add/Edit Rundown with Smart Time Picker (No Status) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-rose-50">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {editingItem ? 'Edit Agenda Rundown' : 'Tambah Agenda Rundown Baru'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Atur jadwal waktu kegiatan hari-H
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {/* Time Pickers (Jam Mulai & Jam Selesai) */}
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1">
                      <Clock size={12} className="text-amber-600" />
                      <span>Jam Mulai</span> <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm font-semibold text-stone-800 bg-white outline-none focus:border-amber-600 shadow-xs cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1">
                      <Clock size={12} className="text-amber-600" />
                      <span>Jam Selesai</span> <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => handleEndTimeChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm font-semibold text-stone-800 bg-white outline-none focus:border-amber-600 shadow-xs cursor-pointer"
                    />
                  </div>
                </div>

                {/* Quick Duration Buttons & Calculated Duration */}
                <div className="mt-2.5 p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-stone-500 font-medium">Estimasi:</span>
                    <span className="font-extrabold text-amber-900 tabular-nums">
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
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white text-stone-700 border border-stone-200 hover:border-amber-400 hover:text-amber-800 transition shadow-xs whitespace-nowrap"
                      >
                        +{mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fase Acara */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1.5">
                  Fase Acara
                </label>
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs bg-white outline-none focus:border-amber-600 cursor-pointer"
                >
                  {PHASES.filter(p => p !== 'Semua').map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Nama Kegiatan */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1.5">
                  Nama Kegiatan / Agenda <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="Contoh: Ibadah Pemberkatan Nikah Kudus..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs outline-none focus:border-amber-600"
                />
              </div>

              {/* PIC (No status field anymore!) */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1.5">
                  PIC / Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={pic}
                  onChange={(e) => setPic(e.target.value)}
                  placeholder="Contoh: WO & Planner, Tim Altar..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs outline-none focus:border-amber-600"
                />
              </div>

              {/* Keterangan & Catatan Teknis */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1.5">
                  Keterangan &amp; Catatan Teknis
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Lokasi, perlengkapan, briefing khusus..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs outline-none focus:border-amber-600 resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 text-white font-bold hover:from-amber-700 hover:to-rose-700 shadow-xs transition"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
