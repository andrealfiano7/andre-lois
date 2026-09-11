import React from 'react';
import { Search, X, ArrowUpDown, AlertTriangle, CheckCircle2, Clock3, CircleDashed } from 'lucide-react';

export function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  totalResults,
  isFiltered,
  onResetFilters,
  overdueCount
}) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
      
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama tugas, vendor, atau PIC..."
          className="w-full pl-9 pr-9 py-2 rounded-2xl bg-white border border-stone-300/80 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-600 shadow-xs transition"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Status & Sort Controls */}
      <div className="flex flex-wrap items-center gap-2">
        
        {/* Status Pills */}
        <div className="flex items-center gap-1 bg-stone-100/90 p-1 rounded-2xl border border-stone-200/80 text-xs overflow-x-auto max-w-full no-scrollbar">
          <button
            onClick={() => onStatusChange('All')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              statusFilter === 'All' 
                ? 'bg-stone-900 text-white shadow-xs' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Semua
          </button>
          
          <button
            onClick={() => onStatusChange('Done')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'Done' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs' 
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 size={12} />
            Selesai
          </button>

          <button
            onClick={() => onStatusChange('Working on It')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'Working on It' 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs' 
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <Clock3 size={12} />
            Proses
          </button>

          <button
            onClick={() => onStatusChange('Not yet Started')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'Not yet Started' 
                ? 'bg-stone-600 text-white shadow-xs' 
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            <CircleDashed size={12} />
            Belum
          </button>
        </div>

        {/* Sort Selector */}
        <div className="relative flex items-center bg-white rounded-2xl border border-stone-300/80 shadow-xs px-3 py-1.5 text-xs text-stone-700">
          <ArrowUpDown size={13} className="text-amber-600 mr-1.5" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-transparent font-bold text-stone-700 focus:outline-none cursor-pointer pr-2"
          >
            <option value="default">Urutan Spreadsheet</option>
            <option value="date-asc">Tenggat (Terdekat)</option>
            <option value="date-desc">Tenggat (Terjauh)</option>
            <option value="progress-desc">Progres Tertinggi</option>
            <option value="progress-asc">Progres Terendah</option>
            <option value="title-asc">Nama Tugas (A-Z)</option>
          </select>
        </div>

        {/* Reset Filters Indicator */}
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2.5 py-1.5 rounded-xl hover:bg-rose-50 transition flex items-center gap-1 cursor-pointer"
          >
            <X size={13} /> Reset Filter
          </button>
        )}

        <span className="text-xs text-stone-400 font-semibold pl-1 hidden lg:inline tabular-nums">
          {totalResults} tugas
        </span>

      </div>

    </div>
  );
}
