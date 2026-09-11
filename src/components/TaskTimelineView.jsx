import React, { useMemo } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  CircleDashed, 
  Clock3, 
  AlertTriangle,
  Edit3,
  Check
} from 'lucide-react';
import { CATEGORIES, PICS } from '../data/initialTasks';

export function TaskTimelineView({ tasks, onToggleDone, onEditTask }) {
  // Sort tasks by due date
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const dateA = a.dueDate || a.rawDate || '9999-99-99';
      const dateB = b.dueDate || b.rawDate || '9999-99-99';
      return dateA.localeCompare(dateB);
    });
  }, [tasks]);

  // Group by month
  const groupedTasks = useMemo(() => {
    const groups = {};
    sortedTasks.forEach(task => {
      const dateStr = task.dueDate || task.rawDate;
      let monthKey = 'Tanpa Tanggal';
      if (dateStr) {
        try {
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            monthKey = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
          }
        } catch {
          monthKey = 'Lainnya';
        }
      }
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(task);
    });
    return groups;
  }, [sortedTasks]);

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

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([month, monthTasks]) => (
        <div key={month} className="space-y-3">
          {/* Month Header */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-950 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 px-3.5 py-1 rounded-xl shadow-xs">
              {month}
            </span>
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs font-semibold text-stone-400 tabular-nums">
              {monthTasks.length} tugas
            </span>
          </div>

          {/* Timeline Cards */}
          <div className="relative pl-6 sm:pl-8 space-y-3 border-l-2 border-amber-300 ml-3 sm:ml-4">
            {monthTasks.map(task => {
              const isDone = task.status === 'Done';
              const catMeta = getCategoryMeta(task.category);
              const picMeta = getPicMeta(task.pic);

              return (
                <div key={task.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition shadow-xs ${
                    isDone 
                      ? 'border-emerald-500 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white' 
                      : task.status === 'Working on It' 
                      ? 'border-amber-500 bg-amber-400' 
                      : 'border-stone-300'
                  }`}>
                    {isDone && <Check size={10} strokeWidth={3} />}
                  </div>

                  <div className={`nude-card p-4 rounded-2xl border transition-all ${
                    isDone ? 'bg-stone-50/50 opacity-75' : 'bg-white hover:border-amber-300'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catMeta.badgeColor}`}>
                          {catMeta.code}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${picMeta.color}`}>
                          {task.pic}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-stone-500 ml-1">
                          <Calendar size={12} />
                          <span className="tabular-nums font-semibold">{task.dueDate || task.rawDate || '—'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleDone(task.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                            isDone 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {isDone ? 'Selesai' : 'Tandai Tuntas'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </div>

                    <h4 className={`text-xs sm:text-sm font-bold text-stone-900 mt-2 ${isDone ? 'line-through text-stone-400' : ''}`}>
                      {task.title}
                    </h4>

                    {task.notes && (
                      <p className="text-xs text-stone-500 mt-1">
                        {task.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
