import React from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  Edit3,
  Check,
  Heart,
  Sparkles,
  User,
  ClipboardCheck,
  UsersRound
} from 'lucide-react';
import { PICS, CATEGORIES } from '../data/initialTasks';

export function TaskPicView({ tasks = [], onToggleDone, onEditTask }) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const getCategoryMeta = (catId) => {
    return CATEGORIES.find(c => c.id === catId) || {
      label: catId,
      code: 'Umum',
      badgeColor: 'bg-stone-100 text-stone-700 border-stone-200'
    };
  };

  const getPicIcon = (picCode) => {
    if (picCode === 'B&G') return <Heart size={16} className="text-rose-500" />;
    if (picCode === 'Bride') return <Sparkles size={16} className="text-pink-500" />;
    if (picCode === 'Groom') return <User size={16} className="text-sky-500" />;
    if (picCode === 'WO') return <ClipboardCheck size={16} className="text-emerald-600" />;
    return <UsersRound size={16} className="text-amber-600" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {PICS.map(pic => {
        const picTasks = safeTasks.filter(t => t.pic === pic.id);
        const completed = picTasks.filter(t => t.status === 'Done').length;
        const total = picTasks.length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        return (
          <div 
            key={pic.id}
            className="nude-card rounded-3xl p-5 flex flex-col justify-between bg-white shadow-nude-soft"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-nude-100 to-amber-100/60 border border-stone-200 flex items-center justify-center">
                    {getPicIcon(pic.code)}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">{pic.label}</h3>
                    <span className="text-[11px] text-stone-500 font-medium">
                      {completed} dari {total} tugas selesai ({percent}%)
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold tabular-nums px-2.5 py-1 rounded-xl bg-stone-100 text-stone-800">
                  {percent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-stone-100 rounded-full mt-3.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-full transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Task list */}
              <div className="mt-4 space-y-2">
                {picTasks.length === 0 ? (
                  <p className="text-xs text-stone-400 py-3 text-center">Tidak ada tugas yang ditugaskan</p>
                ) : (
                  picTasks.map(task => {
                    const isDone = task.status === 'Done';
                    const catMeta = getCategoryMeta(task.category);

                    return (
                      <div 
                        key={task.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                          isDone 
                            ? 'bg-stone-50/50 border-stone-200/50 text-stone-400' 
                            : 'bg-white border-stone-200/80 text-stone-800 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => onToggleDone(task.id)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition ${
                              isDone 
                                ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 border-emerald-500 text-white' 
                                : 'border-stone-300 bg-white hover:border-amber-500'
                            }`}
                          >
                            {isDone && <Check size={12} strokeWidth={3} />}
                          </button>
                          <div className="min-w-0">
                            <span className={`text-xs font-bold block truncate ${isDone ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                              {task.title}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-0.5 font-medium">
                              <span>{catMeta.code}</span>
                              {task.dueDate && <span>· {task.dueDate}</span>}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex-shrink-0"
                          title="Edit"
                        >
                          <Edit3 size={13} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
