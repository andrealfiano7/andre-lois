import React, { useState } from 'react';
import { X, Calendar, Check } from 'lucide-react';

export function CountdownModal({ isOpen, onClose, targetDate, onSaveDate }) {
  const [dateVal, setDateVal] = useState(() => {
    return targetDate ? targetDate.substring(0, 16) : '2026-10-10T09:00';
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dateVal) {
      onSaveDate(dateVal);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Calendar size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ubah Tanggal Hari-H</h3>
              <p className="text-[11px] text-slate-500">Sesuaikan target countdown pernikahan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
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
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs flex items-center gap-1.5"
            >
              <Check size={14} />
              Simpan Tanggal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
