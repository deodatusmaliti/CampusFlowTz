import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  Percent, 
  Filter, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface TasksViewProps {
  tasks: Task[];
  onOpenAddTask: () => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onNotify: (msg: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onOpenAddTask,
  onUpdateStatus,
  onDeleteTask,
  onNotify,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const totalWeight = tasks.reduce((sum, t) => sum + t.weight, 0);
  const completedWeight = tasks
    .filter((t) => t.status === 'submitted' || t.status === 'graded')
    .reduce((sum, t) => sum + t.weight, 0);

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'not_started':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Not Started</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">In Progress</span>;
      case 'submitted':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">Submitted</span>;
      case 'graded':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Graded</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#d9e3ea] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 uppercase tracking-wider">
            Continuous Assessments (CATs)
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102d4f] mt-1">
            Tasks, Tests & Deadlines
          </h1>
          <p className="text-xs text-slate-500">
            Track weighted laboratory reports, tests, and seminar assignments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-500">CAT Progress</span>
            <span className="block text-sm font-extrabold text-[#1e6fa8]">
              {completedWeight}% / {totalWeight}% Handed In
            </span>
          </div>
          <button
            id="tasks-add-task-btn"
            onClick={onOpenAddTask}
            className="px-4 py-2 rounded-xl bg-[#1e6fa8] hover:bg-[#185a8a] text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Add Assessment
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        {[
          { id: 'all', label: 'All Tasks' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'not_started', label: 'Not Started' },
          { id: 'submitted', label: 'Submitted' },
          { id: 'graded', label: 'Graded' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterStatus(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              filterStatus === f.id
                ? 'bg-[#102d4f] text-white border-[#102d4f] shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tasks Table / Card List */}
      <div className="bg-white rounded-2xl border border-[#d9e3ea] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#eef6fb] text-[#102d4f] border-b border-slate-200">
                <th className="py-3 px-4 font-bold">Assessment / Task</th>
                <th className="py-3 px-4 font-bold">Course</th>
                <th className="py-3 px-4 font-bold">Due Date</th>
                <th className="py-3 px-4 font-bold">Weight</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No assessments match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#102d4f]">
                      <div>{task.title}</div>
                      {task.notes && (
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5 line-clamp-1">
                          {task.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1e6fa8] whitespace-nowrap">
                      {task.courseCode}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {task.dueDate}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-amber-700 whitespace-nowrap">
                      {task.weight}% CAT
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {task.status !== 'graded' && task.status !== 'submitted' ? (
                          <button
                            onClick={() => {
                              onUpdateStatus(task.id, 'submitted');
                              onNotify(`Marked "${task.title}" as Submitted.`);
                            }}
                            className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
                          >
                            Mark Submitted
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              onUpdateStatus(task.id, 'in_progress');
                              onNotify(`Reopened "${task.title}".`);
                            }}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
                          >
                            Reopen
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 rounded transition-colors"
                          title="Delete Assessment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
