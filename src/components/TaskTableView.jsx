import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Check,
  Store,
  FileCheck,
  HeartHandshake,
  ShoppingBag,
  Layers,
  Sparkles,
  Clock3,
  CircleDashed
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORIES, PICS, STATUS_TYPES } from '../data/initialTasks';

export function TaskTableView({ 
  tasks, 
  onToggleDone, 
  onUpdateProgress, 
  onUpdateStatus, 
  onEditTask, 
  onDeleteTask 
}) {
  const [expandedNotes, setExpandedNotes] = useState({});

  const toggleNote = (id) => {
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategoryMeta = (catId) => {
    return CATEGORIES.find(c => c.id === catId) || {
      label: catId,
      code: 'Umum',
      gradient: 'from-amber-400 to-orange-500',
      badgeColor: 'bg-amber-50 text-amber-900 border-amber-200'
    };
  };

  const getPicMeta = (picId) => {
    return PICS.find(p => p.id === picId) || {
      label: picId,
      code: 'PIC',
      color: 'bg-stone-100 text-stone-700 border-stone-200'
    };
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return { text: 'Belum diset', isOverdue: false, daysDiff: null };
    try {
      const target = new Date(dateStr);
      if (isNaN(target.getTime())) return { text: dateStr, isOverdue: false, daysDiff: null };
      
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      target.setHours(0, 0, 0, 0);

      const diffTime = target - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const formatted = target.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      return {
        text: formatted,
        isOverdue: diffDays < 0,
        isToday: diffDays === 0,
        daysDiff: diffDays
      };
    } catch {
      return { text: dateStr, isOverdue: false, daysDiff: null };
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="nude-card rounded-3xl p-12 text-center my-6 bg-white shadow-nude-soft">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
          ∅
        </div>
        <h4 className="text-sm font-bold text-stone-900">Tidak ada checklist yang cocok</h4>
        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
          Coba sesuaikan kata kunci pencarian atau reset filter kategori &amp; status.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Desktop Table Container */}
      <div className="hidden md:block overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-nude-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200/80 bg-gradient-to-r from-nude-50 via-white to-nude-50 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-3.5 pl-4 pr-2 w-12 text-center">Tuntas</th>
                <th className="py-3.5 px-3 w-14 text-center">No</th>
                <th className="py-3.5 px-3 min-w-[240px]">Tugas &amp; Kategori</th>
                <th className="py-3.5 px-3 w-40">Penanggung Jawab</th>
                <th className="py-3.5 px-3 w-36">Tenggat Waktu</th>
                <th className="py-3.5 px-3 w-36">Progres</th>
                <th className="py-3.5 px-3 w-36">Status</th>
                <th className="py-3.5 pr-4 pl-2 w-20 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {tasks.map((task) => {
                const isDone = task.status === 'Done';
                const dateInfo = formatDateDisplay(task.dueDate || task.rawDate);
                const catMeta = getCategoryMeta(task.category);
                const picMeta = getPicMeta(task.pic);
                const isNoteOpen = expandedNotes[task.id];

                return (
                  <React.Fragment key={task.id}>
                    <tr className={`group transition-colors ${
                      isDone ? 'bg-stone-50/40 opacity-75' : 'hover:bg-amber-50/20'
                    }`}>
                      {/* Done Checkbox */}
                      <td className="py-3 pl-4 pr-2 text-center">
                        <motion.button
                          whileHover={{ scale: 1.18 }}
                          whileTap={{ scale: 0.8 }}
                          type="button"
                          onClick={() => onToggleDone(task.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                            isDone 
                              ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 border-emerald-500 text-white shadow-xs' 
                              : 'border-stone-300 hover:border-amber-500 bg-white'
                          }`}
                          title={isDone ? 'Tandai belum selesai' : 'Tandai tuntas'}
                        >
                          {isDone && <Check size={13} strokeWidth={3} />}
                        </motion.button>
                      </td>

                      {/* No */}
                      <td className="py-3 px-3 text-center text-stone-400 font-mono text-[11px]">
                        {task.sheetNo || '—'}
                      </td>

                      {/* Title & Category */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-stone-900 ${isDone ? 'line-through text-stone-400' : ''}`}>
                              {task.title}
                            </span>
                            {(task.notes || task.vendorContact) && (
                              <button
                                type="button"
                                onClick={() => toggleNote(task.id)}
                                className={`text-[10px] p-0.5 rounded transition ${
                                  isNoteOpen ? 'text-amber-800 bg-amber-100' : 'text-stone-400 hover:text-amber-700'
                                }`}
                                title="Lihat catatan teknis"
                              >
                                <Info size={13} />
                              </button>
                            )}
                          </div>
                          <span className={`inline-block self-start text-[10px] font-bold px-2 py-0.5 rounded-md border ${catMeta.badgeColor}`}>
                            {catMeta.code || task.category}
                          </span>
                        </div>
                      </td>

                      {/* PIC */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${picMeta.color}`}>
                          {task.pic}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Calendar size={13} className="text-stone-400 flex-shrink-0" />
                          <span className={`tabular-nums ${
                            dateInfo.isOverdue && !isDone 
                              ? 'font-bold text-rose-600' 
                              : dateInfo.isToday && !isDone 
                              ? 'font-bold text-amber-600' 
                              : 'text-stone-600'
                          }`}>
                            {dateInfo.text}
                          </span>
                        </div>
                      </td>

                      {/* Progress Bar & Stepper */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isDone 
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                                  : task.progress > 0 
                                  ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
                                  : 'bg-stone-300'
                              }`}
                              style={{ width: `${task.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-stone-700 tabular-nums w-8 text-right">
                            {task.progress || 0}%
                          </span>
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td className="py-3 px-3">
                        <select
                          value={task.status}
                          onChange={(e) => onUpdateStatus(task.id, e.target.value)}
                          className={`text-[11px] font-bold rounded-xl px-2.5 py-1 border outline-none cursor-pointer transition ${
                            task.status === 'Done' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                              : task.status === 'Working on It' 
                              ? 'bg-amber-50 text-amber-800 border-amber-300' 
                              : 'bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          <option value="Not yet Started">Belum Mulai</option>
                          <option value="Working on It">Dalam Proses</option>
                          <option value="Done">Selesai</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 pr-4 pl-2 text-right">
                        <div className="inline-flex items-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => onEditTask(task)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 size={13} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 size={13} />
                          </motion.button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable note row */}
                    {isNoteOpen && (
                      <tr className="bg-amber-50/30 border-b border-stone-200/60">
                        <td colSpan={8} className="px-6 py-3.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="space-y-1">
                              {task.notes && (
                                <p className="text-stone-700">
                                  <span className="font-bold text-stone-900">Catatan:</span> {task.notes}
                                </p>
                              )}
                              {task.vendorContact && (
                                <p className="text-stone-700">
                                  <span className="font-bold text-stone-900">Kontak / Vendor:</span> {task.vendorContact}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-stone-500">Ubah Progres:</span>
                              {[0, 25, 50, 75, 100].map(val => (
                                <motion.button
                                  key={val}
                                  whileTap={{ scale: 0.92 }}
                                  type="button"
                                  onClick={() => onUpdateProgress(task.id, val)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                    task.progress === val 
                                      ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white border-transparent shadow-xs' 
                                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                                  }`}
                                >
                                  {val}%
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (optimized for touch screens & smartphones) */}
      <div className="md:hidden space-y-3">
        {tasks.map((task) => {
          const isDone = task.status === 'Done';
          const dateInfo = formatDateDisplay(task.dueDate || task.rawDate);
          const catMeta = getCategoryMeta(task.category);
          const picMeta = getPicMeta(task.pic);

          return (
            <motion.div 
              key={task.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className={`nude-card rounded-2xl p-3 sm:p-4 transition-all ${
                isDone ? 'bg-stone-50/60 opacity-80' : 'bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox button */}
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.8 }}
                  type="button"
                  onClick={() => onToggleDone(task.id)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all cursor-pointer ${
                    isDone 
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 border-emerald-500 text-white shadow-xs' 
                      : 'border-stone-300 bg-white hover:border-amber-500'
                  }`}
                  title={isDone ? 'Tandai belum selesai' : 'Tandai tuntas'}
                >
                  {isDone && <Check size={12} strokeWidth={3} />}
                </motion.button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catMeta.badgeColor}`}>
                      {catMeta.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${picMeta.color}`}>
                      {task.pic}
                    </span>
                  </div>

                  <h4 className={`text-xs sm:text-sm font-bold text-stone-900 mt-1.5 ${isDone ? 'line-through text-stone-400' : ''}`}>
                    {task.title}
                  </h4>

                  {task.notes && (
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {task.notes}
                    </p>
                  )}

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-stone-100 rounded-full mt-2.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress || 0}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        isDone 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                          : task.progress > 0 
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
                          : 'bg-stone-300'
                      }`}
                    />
                  </div>

                  {/* Bottom details & quick action bar */}
                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-stone-500">
                      <Calendar size={13} />
                      <span className={`tabular-nums font-semibold ${dateInfo.isOverdue && !isDone ? 'text-rose-600 font-bold' : ''}`}>
                        {dateInfo.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={task.status}
                        onChange={(e) => onUpdateStatus(task.id, e.target.value)}
                        className={`text-[11px] font-bold rounded-lg px-2 py-1 border outline-none cursor-pointer ${
                          task.status === 'Done' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                            : task.status === 'Working on It' 
                            ? 'bg-amber-50 text-amber-800 border-amber-300' 
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        <option value="Not yet Started">Belum</option>
                        <option value="Working on It">Proses</option>
                        <option value="Done">Tuntas</option>
                      </select>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => onEditTask(task)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 bg-stone-50 border border-stone-200 cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 size={13} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
