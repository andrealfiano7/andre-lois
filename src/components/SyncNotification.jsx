import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SyncNotification({ status, onClose }) {
  if (!status) return null;

  const isSuccess = status.type === 'success';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-4 duration-200">
      <div className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 ${
        isSuccess 
          ? 'bg-white border-emerald-200 text-emerald-950' 
          : 'bg-white border-rose-200 text-rose-950'
      }`}>
        <div className={`p-1 rounded-lg ${isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          {isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        </div>
        <div className="flex-1 text-xs">
          <h5 className="font-bold mb-0.5">{isSuccess ? 'Sinkronisasi Berhasil' : 'Perhatian'}</h5>
          <p className="text-slate-600 leading-relaxed">{status.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-0.5"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
