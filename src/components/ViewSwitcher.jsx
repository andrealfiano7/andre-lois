import React from 'react';
import { LayoutList, CalendarDays, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function ViewSwitcher({ activeView, onViewChange, counts = {} }) {
  const views = [
    { 
      id: 'table', 
      label: 'Tabel & Checklist', 
      shortLabel: 'Checklist',
      icon: LayoutList, 
      count: counts?.filtered ?? 0, 
      iconColor: 'text-amber-600' 
    },
    { 
      id: 'timeline', 
      label: 'Linimasa Jadwal', 
      shortLabel: 'Linimasa',
      icon: CalendarDays, 
      iconColor: 'text-sky-600' 
    },
    { 
      id: 'pic', 
      label: 'Beban Tugas PIC', 
      shortLabel: 'Beban PIC',
      icon: Users, 
      iconColor: 'text-emerald-600' 
    }
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100/90 rounded-2xl border border-stone-200/80 w-full sm:flex sm:w-auto sm:gap-1.5 no-scrollbar">
        {views.map(view => {
          const Icon = view.icon;
          const isActive = activeView === view.id;
          return (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`relative flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive ? 'text-stone-900 font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs border border-stone-200/80"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1 sm:gap-2 w-full">
                <Icon size={14} className={isActive ? view.iconColor : 'text-stone-400 shrink-0'} />
                <span className="sm:hidden truncate">{view.shortLabel}</span>
                <span className="hidden sm:inline truncate">{view.label}</span>
                {view.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold tabular-nums shrink-0 leading-none ${
                    isActive 
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs' 
                      : 'bg-stone-200 text-stone-600'
                  }`}>
                    {view.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
