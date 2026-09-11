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
      {/* Top 4 Key Metric Cards with warm nude & bright gradient accents */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Overall Progress Card */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="col-span-2 lg:col-span-1 nude-card p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl flex items-center justify-between bg-gradient-to-br from-white via-nude-50 to-amber-50/40 border-amber-200/70 shadow-nude-soft cursor-default"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Progres Total
              </span>
            </div>
            <div className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent mt-1 tabular-nums">
              {overallProgress}%
            </div>
            <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 sm:mt-1">
              <span className="font-bold text-emerald-700">{completed}</span> dari {total} tugas tuntas
            </p>
          </div>

          <div className="relative w-14 h-14 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="#F97316" />
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
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="url(#progressGrad)"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <TrendingUp size={16} className="text-amber-600 sm:w-5 sm:h-5" />
            </div>
          </div>
        </motion.div>

        {/* 3 Compact Metric Cards (Single Row on Mobile) */}
        <div className="col-span-2 lg:col-span-3 grid grid-cols-3 gap-2 sm:gap-4">
          {/* Completed Tasks */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="nude-card p-3 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col justify-between bg-gradient-to-br from-white via-nude-50 to-emerald-50/40 border-emerald-200/70 shadow-nude-soft cursor-default"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-500">Selesai</span>
              <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 size={13} className="sm:w-4 sm:h-4" />
              </span>
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-xl sm:text-3xl font-extrabold tracking-tight text-emerald-700 tabular-nums">
                {completed}
              </div>
              <p className="text-[10px] sm:text-xs text-stone-500 mt-0.5 font-medium truncate">
                {total > 0 ? Math.round((completed / total) * 100) : 0}% tuntas
              </p>
            </div>
          </motion.div>

          {/* In Progress Tasks */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="nude-card p-3 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col justify-between bg-gradient-to-br from-white via-nude-50 to-amber-50/40 border-amber-200/70 shadow-nude-soft cursor-default"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-500">Proses</span>
              <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-xs">
                <Clock3 size={13} className="sm:w-4 sm:h-4" />
              </span>
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-xl sm:text-3xl font-extrabold tracking-tight text-amber-700 tabular-nums">
                {inProgress}
              </div>
              <p className="text-[10px] sm:text-xs text-stone-500 mt-0.5 font-medium truncate">
                Dikerjakan
              </p>
            </div>
          </motion.div>

          {/* Not Started & Overdue */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="nude-card p-3 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col justify-between bg-gradient-to-br from-white via-nude-50 to-stone-50/60 border-stone-200/70 shadow-nude-soft cursor-default"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-500">Belum</span>
              <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shadow-xs text-white ${
                overdueCount > 0 ? 'bg-gradient-to-tr from-rose-500 to-red-600' : 'bg-gradient-to-tr from-stone-400 to-stone-600'
              }`}>
                {overdueCount > 0 ? <AlertTriangle size={13} className="sm:w-4 sm:h-4" /> : <CircleDashed size={13} className="sm:w-4 sm:h-4" />}
              </span>
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-xl sm:text-3xl font-extrabold tracking-tight text-stone-800 tabular-nums">
                {notStarted}
              </div>
              <p className="text-[10px] sm:text-xs text-stone-500 mt-0.5 font-medium truncate">
                {overdueCount > 0 ? `${overdueCount} telat` : 'Menunggu'}
              </p>
            </div>
          </motion.div>
        </div>

      </div>

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
