import React, { useState } from 'react';
import { 
  CircleDashed, 
  Clock3, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  Edit3, 
  Trash2,
  GripVertical
} from 'lucide-react';
import { CATEGORIES, PICS } from '../data/initialTasks';

export function TaskKanbanView({ 
  tasks, 
  onUpdateStatus, 
  onEditTask, 
  onDeleteTask 
}) {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dropTargetCol, setDropTargetCol] = useState(null);
  const [mobileTab, setMobileTab] = useState('All'); // 'All' | 'Not yet Started' | 'Working on It' | 'Done'

  const columns = [
    {
      id: 'Not yet Started',
      label: 'Belum Mulai',
      shortLabel: 'Belum',
      icon: CircleDashed,
      iconColor: 'text-stone-500',
      badgeColor: 'bg-stone-200 text-stone-700',
      accent: 'border-t-4 border-stone-400',
      headerBg: 'bg-stone-100 text-stone-800'
    },
    {
      id: 'Working on It',
      label: 'Dalam Proses',
      shortLabel: 'Proses',
      icon: Clock3,
      iconColor: 'text-amber-500',
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
      accent: 'border-t-4 border-amber-500',
      headerBg: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-950'
    },
    {
      id: 'Done',
      label: 'Selesai',
      shortLabel: 'Selesai',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      accent: 'border-t-4 border-emerald-500',
      headerBg: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-950'
    }
  ];

  const getCategoryMeta = (catId) => {
    return CATEGORIES.find(c => c.id === catId) || {
      label: catId,
      code: 'Umum',
      badgeColor: 'bg-stone-100 text-stone-700 border-stone-200'
    };
  };

  const getPicMeta = (picId) => {
    return PICS.find(p => p.id === picId) || {
      label: picId,
      code: 'PIC',
      color: 'bg-stone-100 text-stone-700 border-stone-200'
    };
  };

  const getNextStatus = (currentStatus) => {
    if (currentStatus === 'Not yet Started') return 'Working on It';
    if (currentStatus === 'Working on It') return 'Done';
    return null;
  };

  const getPrevStatus = (currentStatus) => {
    if (currentStatus === 'Done') return 'Working on It';
    if (currentStatus === 'Working on It') return 'Not yet Started';
    return null;
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDropTargetCol(null);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetCol !== colId) {
      setDropTargetCol(colId);
    }
  };

  const handleDragLeave = (e, colId) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (dropTargetCol === colId) {
        setDropTargetCol(null);
      }
    }
  };

  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onUpdateStatus(taskId, targetColId);
    }
    setDraggedTaskId(null);
    setDropTargetCol(null);
  };

  const visibleColumns = mobileTab === 'All' 
    ? columns 
    : columns.filter(c => c.id === mobileTab);

  return (
    <div className="space-y-3">
      {/* Mobile Column Filter Pills */}
      <div className="md:hidden grid grid-cols-4 gap-1 p-1 bg-stone-100/90 rounded-2xl border border-stone-200/80">
        <button
          type="button"
          onClick={() => setMobileTab('All')}
          className={`py-1.5 px-1 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
            mobileTab === 'All'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>Semua</span>
          <span className={`px-1 py-0.2 text-[9px] rounded-full tabular-nums ${
            mobileTab === 'All' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
          }`}>
            {tasks.length}
          </span>
        </button>

        {columns.map(col => {
          const count = tasks.filter(t => t.status === col.id).length;
          const isActive = mobileTab === col.id;
          const Icon = col.icon;
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => setMobileTab(col.id)}
              className={`py-1.5 px-1 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200/60'
              }`}
            >
              <Icon size={11} className={isActive ? 'text-white shrink-0' : `${col.iconColor} shrink-0`} />
              <span className="truncate">{col.shortLabel}</span>
              <span className={`px-1 py-0.2 text-[9px] rounded-full tabular-nums shrink-0 ${
                isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kanban Grid Container (Horizontal snap swipeable on Mobile when 'All', 3 Columns on Desktop) */}
      <div className="flex md:grid md:grid-cols-3 gap-3 sm:gap-4 items-start overflow-x-auto snap-x snap-mandatory pb-3 md:pb-0 no-scrollbar">
        {visibleColumns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          const Icon = col.icon;
          const isOver = dropTargetCol === col.id;

          return (
            <div 
              key={col.id} 
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`${
                mobileTab === 'All' ? 'flex-shrink-0 w-[86vw] sm:w-[340px] snap-center' : 'w-full'
              } md:w-auto flex flex-col rounded-3xl border bg-white shadow-nude-soft p-3 sm:p-4 transition-all duration-200 self-start ${
                col.accent
              } ${
                isOver 
                  ? 'border-amber-400 ring-2 ring-amber-400/50 bg-amber-50/20' 
                  : 'border-stone-200/90'
              }`}
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl mb-2.5 border border-stone-200/60 ${col.headerBg}`}>
                <div className="flex items-center gap-2">
                  <Icon size={15} className={col.iconColor} />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                    {col.label}
                  </h3>
                </div>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-white text-stone-800 border border-stone-200 tabular-nums shadow-2xs">
                  {colTasks.length}
                </span>
              </div>

              {/* Drop Target Indicator when Dragging */}
              {isOver && (
                <div className="p-3 mb-2.5 rounded-2xl border-2 border-dashed border-amber-500 bg-amber-100/60 text-center text-xs font-bold text-amber-900 animate-pulse">
                  Lepas tugas di sini
                </div>
              )}

              {/* Column Task Cards */}
              <div className="space-y-2.5">
                {colTasks.length === 0 ? (
                  <div className="py-8 px-3 rounded-2xl border border-dashed border-stone-200 flex flex-col items-center justify-center text-xs text-stone-400">
                    <Icon size={18} className="text-stone-300 mb-1" />
                    <span>Tidak ada tugas</span>
                  </div>
                ) : (
                  colTasks.map(task => {
                    const catMeta = getCategoryMeta(task.category);
                    const picMeta = getPicMeta(task.pic);
                    const prevStatus = getPrevStatus(task.status);
                    const nextStatus = getNextStatus(task.status);
                    const isDragging = draggedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className={`p-3 rounded-2xl border bg-gradient-to-br from-white to-nude-50/40 shadow-xs hover:border-amber-300 transition-all duration-150 group select-none cursor-grab active:cursor-grabbing ${
                          isDragging 
                            ? 'opacity-30 scale-95 border-amber-400 border-dashed bg-amber-50' 
                            : 'border-stone-200/80 hover:shadow-sm'
                        }`}
                      >
                        {/* Top: Category, PIC, and Drag Grip Handle */}
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catMeta.badgeColor}`}>
                              {catMeta.code}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${picMeta.color}`}>
                              {task.pic}
                            </span>
                          </div>

                          <span className="text-stone-300 group-hover:text-amber-600 transition" title="Tarik kartu untuk memindahkan kolom">
                            <GripVertical size={14} />
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-stone-900 leading-snug">
                          {task.title}
                        </h4>

                        {task.notes && (
                          <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                            {task.notes}
                          </p>
                        )}

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-stone-100 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              task.status === 'Done' 
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                                : task.progress > 0 
                                ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
                                : 'bg-stone-300'
                            }`}
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>

                        {/* Footer: Date & Action/Move Buttons */}
                        <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1 text-stone-500">
                            <Calendar size={11} className="text-stone-400" />
                            <span className="tabular-nums font-semibold text-[10px]">
                              {task.dueDate || task.rawDate || '—'}
                            </span>
                          </div>

                          {/* Quick 1-tap Move & Edit Controls */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onEditTask(task)}
                              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                              title="Edit tugas"
                            >
                              <Edit3 size={12} />
                            </button>

                            <button
                              type="button"
                              onClick={() => onDeleteTask(task.id)}
                              className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Hapus tugas"
                            >
                              <Trash2 size={12} />
                            </button>

                            {/* Move Prev Button */}
                            {prevStatus && (
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(task.id, prevStatus)}
                                className="px-1.5 py-0.5 rounded-lg text-[10px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center gap-0.5 transition"
                                title={`Pindahkan ke ${prevStatus}`}
                              >
                                <ArrowLeft size={10} />
                              </button>
                            )}

                            {/* Move Next Button */}
                            {nextStatus && (
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(task.id, nextStatus)}
                                className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center gap-0.5 shadow-2xs hover:brightness-105 transition"
                                title={`Pindahkan ke ${nextStatus}`}
                              >
                                <span>{nextStatus === 'Done' ? 'Selesai' : 'Proses'}</span>
                                <ArrowRight size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
