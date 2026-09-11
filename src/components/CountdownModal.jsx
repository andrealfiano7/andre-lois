import React, { useState } from 'react';
import { X, Calendar, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CountdownModal({ isOpen, onClose, targetDate, onSaveDate }) {
  const [dateVal, setDateVal] = useState(() => {
    return targetDate ? targetDate.substring(0, 16) : '2026-10-10T09:00';
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dateVal) {
      onSaveDate(dateVal);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-rose-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <Calendar size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ubah Tanggal Hari-H</h3>
                  <p className="text-[11px] text-slate-500">Sesuaikan target countdown pernikahan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Tanggal &amp; Waktu Pernikahan
                </label>
                <input
                  type="datetime-local"
                  value={dateVal}
                  onChange={(e) => setDateVal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-slate-800"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Standar awal: 10 Oktober 2026 pk 09:00 WIB
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  Simpan Tanggal
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
