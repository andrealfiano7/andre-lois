import React from 'react';
import { 
  CheckCircle2, 
  Clock3, 
  CircleDashed, 
  AlertTriangle, 
  Store, 
  FileCheck, 
  HeartHandshake, 
  ShoppingBag,
  TrendingUp,
  CalendarDays,
  ChevronRight,
  Heart,
  Sparkles,
  User,
  ClipboardCheck,
  UsersRound
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORIES, PICS } from '../data/initialTasks';

export function StatsOverview({ stats, onSelectCategory, selectedCategory, onSelectPic, selectedPic, onSwitchToChecklist }) {
  const { 
    total, 
    completed, 
    inProgress, 
    notStarted, 
    overallProgress, 
    categoryStats, 
    picStats, 
    overdueCount,
    upcomingTasks = []
  } = stats;

  const getCategoryIcon = (catId) => {
    if (catId.includes('Vendor')) return <Store size={16} className="text-emerald-600" />;
    if (catId.includes('Documentation')) return <FileCheck size={16} className="text-amber-600" />;
    if (catId.includes('Internal')) return <HeartHandshake size={16} className="text-rose-600" />;
    return <ShoppingBag size={16} className="text-sky-600" />;
  };

  const getPicIcon = (picCode) => {
    if (picCode === 'B&G') return <Heart size={14} className="text-rose-500" />;
    if (picCode === 'Bride') return <Sparkles size={14} className="text-pink-500" />;
    if (picCode === 'Groom') return <User size={14} className="text-sky-500" />;
    if (picCode === 'WO') return <ClipboardCheck size={14} className="text-emerald-600" />;
    return <UsersRound size={14} className="text-amber-600" />;
  };

  // SVG Circular progress constants
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallProgress / 100) * circumference;

  return (
    <div className="space-y-5">
      {/* All-in-One Luxury Hero Card: Progres Persiapan Pernikahan */}
      <motion.div
        whileHover={{ y: -3, scale: 1.006 }}
        transition={{ duration: 0.2 }}
        className="nude-card p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-white via-nude-50/70 to-amber-50/50 border border-amber-200/80 shadow-nude-soft relative overflow-hidden group"
      >
        {/* Subtle decorative warm background glow */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-gradient-to-br from-amber-400/10 via-rose-400/10 to-transparent blur-2xl pointer-events-none" />

        {/* 1. Header: Title, Sparkles, and Status Badge */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold tracking-tight text-stone-900 uppercase">
                Kesiapan Menuju Hari-H
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500 font-medium">
                {completed} dari {total} tugas tuntas terlaksana
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSwitchToChecklist}
            className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-amber-900 bg-amber-100/80 hover:bg-amber-200/70 border border-amber-300/70 px-2.5 py-1 rounded-full transition cursor-pointer shadow-2xs"
          >
            <span>Buka Checklist</span>
            <ChevronRight size={12} />
          </button>
        </div>

        {/* 2. Main Stats: Big Percentage + Ring + Summary */}
        <div className="mt-4 sm:mt-5 flex items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-stone-950 via-amber-900 to-rose-900 bg-clip-text text-transparent tabular-nums">
                {overallProgress}%
              </span>
              <span className="text-xs sm:text-sm font-bold text-stone-500">
                Tuntas
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {notStarted + inProgress === 0 
                ? '✨ Seluruh persiapan selesai 100%!' 
                : `Sisa ${notStarted + inProgress} tugas perlu diselesaikan`}
            </p>
          </div>

          {/* Circular Gauge Ring */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
              <defs>
                <linearGradient id="heroProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="60%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>
              </defs>
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="text-stone-200/80"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <motion.circle
                cx="48"
                cy="48"
                r={radius}
                stroke="url(#heroProgressGrad)"
                strokeWidth="8"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <TrendingUp size={18} className="text-amber-700" />
            </div>
          </div>
        </div>

        {/* 3. Multi-Segment Progress Bar (Visual Tricolor Breakdown) */}
        <div className="mt-4 relative z-10">
          <div className="h-3 sm:h-3.5 w-full bg-stone-200/60 rounded-full p-0.5 flex gap-1 overflow-hidden shadow-inner">
            {/* Completed (Emerald) */}
            {completed > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completed / total) * 100}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-xs"
                title={`Selesai: ${completed} (${Math.round((completed / total) * 100)}%)`}
              />
            )}
            {/* In Progress (Amber) */}
            {inProgress > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(inProgress / total) * 100}%` }}
                transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-xs"
                title={`Sedang Dikerjakan: ${inProgress} (${Math.round((inProgress / total) * 100)}%)`}
              />
            )}
            {/* Not Started (Stone) */}
            {notStarted > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(notStarted / total) * 100}%` }}
                transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
                className="h-full bg-stone-300/80 rounded-full"
                title={`Menunggu: ${notStarted} (${Math.round((notStarted / total) * 100)}%)`}
              />
            )}
          </div>
        </div>

        {/* 4. Integrated 3 Status Badges / Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-4 border-t border-stone-200/70 relative z-10">
          {/* Selesai */}
          <button
            type="button"
            onClick={onSwitchToChecklist}
            className="p-2.5 sm:p-3 rounded-2xl bg-white/90 hover:bg-emerald-50/80 border border-stone-200/80 hover:border-emerald-300/80 flex flex-col justify-between transition group text-left cursor-pointer shadow-2xs"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800">
                Selesai
              </span>
              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 size={12} />
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-lg sm:text-2xl font-black text-emerald-700 tabular-nums">
                {completed}
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 font-semibold">
                ({total > 0 ? Math.round((completed / total) * 100) : 0}%)
              </span>
            </div>
          </button>

          {/* Sedang Dikerjakan */}
          <button
            type="button"
            onClick={onSwitchToChecklist}
            className="p-2.5 sm:p-3 rounded-2xl bg-white/90 hover:bg-amber-50/80 border border-stone-200/80 hover:border-amber-300/80 flex flex-col justify-between transition group text-left cursor-pointer shadow-2xs"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-800">
                Proses
              </span>
              <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock3 size={12} />
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-lg sm:text-2xl font-black text-amber-700 tabular-nums">
                {inProgress}
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 font-semibold">
                tugas
              </span>
            </div>
          </button>

          {/* Menunggu / Belum */}
          <button
            type="button"
            onClick={onSwitchToChecklist}
            className="p-2.5 sm:p-3 rounded-2xl bg-white/90 hover:bg-stone-100/90 border border-stone-200/80 hover:border-stone-400/80 flex flex-col justify-between transition group text-left cursor-pointer shadow-2xs"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-600">
                Belum
              </span>
              <span className={`w-5 h-5 rounded-md flex items-center justify-center ${
                overdueCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-stone-100 text-stone-600'
              }`}>
                {overdueCount > 0 ? <AlertTriangle size={12} /> : <CircleDashed size={12} />}
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-lg sm:text-2xl font-black text-stone-800 tabular-nums">
                {notStarted}
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 font-semibold truncate">
                {overdueCount > 0 ? `${overdueCount} telat` : 'tugas'}
              </span>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Middle Grid: Category Breakdown + Workload PIC */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Category Breakdown (7 cols) */}
        <div className="lg:col-span-7 nude-card p-5 sm:p-6 rounded-3xl bg-white shadow-nude-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-900">
                Kesiapan per Kategori
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Klik salah satu kartu untuk langsung memfilter tugas
              </p>
            </div>
            {selectedCategory && (
              <button 
                onClick={() => onSelectCategory(null)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline"
              >
                Reset filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map(cat => {
              const stat = categoryStats.find(s => s.category === cat.id) || {
                total: 0, completed: 0, inProgress: 0, percentage: 0
              };
              const isSelected = selectedCategory === cat.id;

              return (
                <motion.button
                  key={cat.id}
                  whileHover={{ y: -2, scale: 1.008 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectCategory(isSelected ? null : cat.id)}
                  className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden cursor-pointer ${
                    isSelected 
                      ? 'border-stone-900 bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-white shadow-md' 
                      : 'border-stone-200/80 bg-gradient-to-br from-white to-nude-50/60 hover:border-amber-400/80 text-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-white/10 text-white' : 'bg-white shadow-xs border border-stone-200/60'
                      }`}>
                        {getCategoryIcon(cat.id)}
                      </span>
                      <div>
                        <span className="text-xs font-bold block">{cat.label}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                          {cat.code}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-extrabold tabular-nums px-2 py-0.5 rounded-lg ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-800'
                    }`}>
                      {stat.percentage}%
                    </span>
                  </div>

                  {/* Gradient Progress bar */}
                  <div className="w-full h-2 bg-stone-100 rounded-full mt-3.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full bg-gradient-to-r ${cat.gradient}`}
                    />
                  </div>

                  <div className={`flex items-center justify-between mt-2.5 text-[11px] ${
                    isSelected ? 'text-stone-300' : 'text-stone-500'
                  }`}>
                    <span>{stat.completed}/{stat.total} selesai</span>
                    {stat.inProgress > 0 && (
                      <span className="font-semibold text-amber-500">{stat.inProgress} on process</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Workload by PIC (5 cols) */}
        <div className="lg:col-span-5 nude-card p-5 sm:p-6 rounded-3xl bg-white shadow-nude-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-900">
                  Pembagian PIC
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Beban koordinasi antar pengantin &amp; tim
                </p>
              </div>
              {selectedPic && (
                <button 
                  onClick={() => onSelectPic(null)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {PICS.map(pic => {
                const stat = picStats.find(s => s.pic === pic.id) || {
                  total: 0, completed: 0, percentage: 0
                };
                const isSelected = selectedPic === pic.id;

                return (
                  <motion.button
                    key={pic.id}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectPic(isSelected ? null : pic.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                      isSelected 
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs' 
                        : 'border-stone-200/70 bg-gradient-to-r from-white to-nude-50/40 hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-white/10 text-white' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {getPicIcon(pic.code)}
                      </span>
                      <div>
                        <div className="text-xs font-bold">{pic.label}</div>
                        <div className={`text-[11px] ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                          {stat.completed} dari {stat.total} tugas selesai ({stat.percentage}%)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-stone-200/70 rounded-full overflow-hidden hidden sm:block">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.percentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                        />
                      </div>
                      <ChevronRight size={14} className={isSelected ? 'text-stone-300' : 'text-stone-400'} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Upcoming Milestones Card */}
      {upcomingTasks.length > 0 && (
        <div className="nude-card p-5 sm:p-6 rounded-3xl bg-white shadow-nude-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center">
                <CalendarDays size={14} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-900">
                  Target Terdekat Mendatang
                </h3>
                <p className="text-[11px] text-stone-500">Prioritas agenda persiapan yang perlu diperhatikan</p>
              </div>
            </div>
            {onSwitchToChecklist && (
              <motion.button 
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.96 }}
                onClick={onSwitchToChecklist}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1 cursor-pointer"
              >
                Lihat di Checklist <ChevronRight size={14} />
              </motion.button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingTasks.map(task => (
              <motion.div 
                key={task.id}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/30 via-white to-orange-50/20 flex flex-col justify-between hover:border-amber-300 transition shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {task.pic}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.status === 'Working on It' 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {task.status === 'Working on It' ? 'Dalam Proses' : 'Belum Mulai'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 mt-2 line-clamp-1">
                    {task.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                    {task.notes || task.vendorContact || task.category}
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-amber-100 flex items-center justify-between text-[11px]">
                  <span className="text-stone-400 font-medium">Tenggat Waktu:</span>
                  <span className="font-bold text-amber-900 tabular-nums">
                    {task.dueDate || task.rawDate || 'Segera'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
