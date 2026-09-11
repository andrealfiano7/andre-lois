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
    <div className="space-y-2">
      {/* Top Controls: Search Bar & Sort Dropdown side by side */}
      <div className="flex items-center gap-2">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari tugas, vendor, atau PIC..."
            className="w-full pl-8 pr-8 py-2 rounded-xl bg-white border border-stone-200/90 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-600 shadow-2xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="relative flex items-center bg-white rounded-xl border border-stone-200/90 shadow-2xs px-2.5 py-2 text-xs text-stone-700 shrink-0">
          <ArrowUpDown size={13} className="text-amber-600 mr-1.5 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-transparent font-bold text-xs text-stone-700 focus:outline-none cursor-pointer pr-1"
          >
            <option value="default">Urutan</option>
            <option value="date-asc">Tenggat Dekat</option>
            <option value="date-desc">Tenggat Jauh</option>
            <option value="progress-desc">Progres Tinggi</option>
            <option value="progress-asc">Progres Rendah</option>
            <option value="title-asc">Nama (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Row 2: Status Pills (Symmetrical grid on mobile) & Counter */}
      <div className="flex items-center justify-between gap-2">
        <div className="grid grid-cols-4 gap-1 p-1 bg-stone-100/90 rounded-xl border border-stone-200/80 text-xs flex-1">
          <button
            onClick={() => onStatusChange('All')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition text-center cursor-pointer ${
              statusFilter === 'All' 
                ? 'bg-stone-900 text-white shadow-2xs' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Semua
          </button>
          
          <button
            onClick={() => onStatusChange('Done')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              statusFilter === 'Done' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xs' 
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 size={11} className="shrink-0" />
            <span className="truncate">Selesai</span>
          </button>

          <button
            onClick={() => onStatusChange('Working on It')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              statusFilter === 'Working on It' 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xs' 
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <Clock3 size={11} className="shrink-0" />
            <span className="truncate">Proses</span>
          </button>

          <button
            onClick={() => onStatusChange('Not yet Started')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              statusFilter === 'Not yet Started' 
                ? 'bg-stone-600 text-white shadow-2xs' 
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            <CircleDashed size={11} className="shrink-0" />
            <span className="truncate">Belum</span>
          </button>
        </div>

        {/* Reset Filter Button & Result Counter */}
        <div className="flex items-center gap-1.5 shrink-0 pl-1">
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="text-[11px] text-rose-600 hover:text-rose-800 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition flex items-center gap-1 cursor-pointer"
              title="Reset Filter"
            >
              <X size={12} />
              <span>Reset</span>
            </button>
          )}

          <span className="text-[11px] text-stone-400 font-semibold tabular-nums shrink-0 hidden xs:inline">
            {totalResults} tugas
          </span>
        </div>
      </div>
    </div>
  );
}
