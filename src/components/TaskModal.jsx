import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Store, User, FileText, Phone, MessageSquare, Sparkles, Layers } from 'lucide-react';
import { CATEGORIES, PICS, STATUS_TYPES } from '../data/initialTasks';

export function TaskModal({ isOpen, onClose, onSave, editingTask }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'A. Dealing Vendor',
    pic: 'Bride & Groom',
    dueDate: '',
    progress: 0,
    status: 'Not yet Started',
    vendorContact: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        category: editingTask.category || 'A. Dealing Vendor',
        pic: editingTask.pic || 'Bride & Groom',
        dueDate: editingTask.dueDate || editingTask.rawDate || '',
        progress: editingTask.progress || 0,
        status: editingTask.status || 'Not yet Started',
        vendorContact: editingTask.vendorContact || '',
        notes: editingTask.notes || ''
      });
    } else {
      setFormData({
        title: '',
        category: 'A. Dealing Vendor',
        pic: 'Bride & Groom',
        dueDate: '',
        progress: 0,
        status: 'Not yet Started',
        vendorContact: '',
        notes: ''
      });
    }
    setErrors({});
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'status') {
        if (value === 'Done') next.progress = 100;
        else if (value === 'Not yet Started') next.progress = 0;
        else if (value === 'Working on It' && (prev.progress === 0 || prev.progress === 100)) next.progress = 50;
      }
      if (field === 'progress') {
        const num = Number(value);
        if (num === 100) next.status = 'Done';
        else if (num > 0) next.status = 'Working on It';
        else next.status = 'Not yet Started';
      }
      return next;
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrors({ title: 'Judul tugas wajib diisi' });
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-rose-50">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              {editingTask ? 'Edit Tugas Checklist' : 'Tambah Tugas Baru'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Kelola tugas persiapan operasional pernikahan
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
              Judul Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Contoh: Booking Ruang Hotel Keluarga..."
              className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs sm:text-sm outline-none transition ${
                errors.title 
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' 
                  : 'border-stone-300 bg-white focus:border-amber-600'
              }`}
            />
            {errors.title && <p className="text-rose-500 text-[11px] mt-1">{errors.title}</p>}
          </div>

          {/* Category & PIC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
                Kategori
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 bg-white text-xs outline-none focus:border-amber-600 cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
                Penanggung Jawab (PIC)
              </label>
              <select
                value={formData.pic}
                onChange={(e) => handleChange('pic', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 bg-white text-xs outline-none focus:border-amber-600 cursor-pointer"
              >
                {PICS.map(pic => (
                  <option key={pic.id} value={pic.id}>{pic.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
                Tenggat Waktu
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 bg-white text-xs outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 bg-white text-xs outline-none focus:border-amber-600 cursor-pointer"
              >
                {STATUS_TYPES.map(st => (
                  <option key={st.id} value={st.id}>{st.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Progress Stepper */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                Kemajuan / Progres
              </label>
              <span className="font-bold text-stone-900 tabular-nums">{formData.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.progress}
              onChange={(e) => handleChange('progress', e.target.value)}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>0% (Belum)</span>
              <span>50% (Proses)</span>
              <span>100% (Tuntas)</span>
            </div>
          </div>

          {/* Vendor Contact */}
          <div>
            <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
              Vendor / Narahubung
            </label>
            <input
              type="text"
              value={formData.vendorContact}
              onChange={(e) => handleChange('vendorContact', e.target.value)}
              placeholder="Contoh: Florist Studio (0812-xxxx-xxxx)"
              className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 bg-white text-xs outline-none focus:border-amber-600"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">
              Catatan &amp; Instruksi Khusus
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Tuliskan catatan teknis, nomor pesanan, atau detail pendukung..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 bg-white text-xs outline-none focus:border-amber-600 resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 transition font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 text-white font-bold hover:from-amber-700 hover:to-rose-700 transition flex items-center gap-1.5 shadow-xs"
            >
              <Check size={14} />
              Simpan Tugas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
