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
  AlertCircle,
  Printer,
  Share2,
  Mail,
  MessageSquare,
  Copy,
  Eye,
  Download,
  X,
  Calendar,
  Award,
  BookOpen
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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Not Started</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">In Progress</span>;
      case 'submitted':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900">Submitted</span>;
      case 'graded':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900">Graded</span>;
    }
  };

  // Print Assessments Table
  const handlePrintAssessments = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>CampusFlow TZ - Continuous Assessments Schedule</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
              h1 { font-size: 22px; font-weight: 900; margin: 0 0 6px 0; color: #0284c7; }
              .sub { color: #64748b; font-size: 13px; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
              th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
              th { background: #f1f5f9; font-weight: 800; }
              tr:nth-child(even) { background: #f8fafc; }
              .badge { font-weight: 800; font-size: 10px; text-transform: uppercase; }
              .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; }
            </style>
          </head>
          <body>
            <h1>Continuous Assessments & Examinations Schedule</h1>
            <div class="sub">Generated from CampusFlow TZ • Printed on ${new Date().toLocaleDateString()}</div>
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Assessment / Task Title</th>
                  <th>Due Date</th>
                  <th>CAT Weight</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTasks.map(t => `
                  <tr>
                    <td><strong>${t.courseCode}</strong></td>
                    <td><strong>${t.title}</strong></td>
                    <td>${t.dueDate}</td>
                    <td>${t.weight}%</td>
                    <td><span class="badge">${t.status}</span></td>
                    <td>${t.notes || '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer">Printed from CampusFlow TZ • University Assessment Tracker</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      onNotify('Assessment schedule print layout generated.');
    } else {
      window.print();
    }
  };

  // Share Task on WhatsApp
  const handleShareWhatsApp = (task: Task) => {
    const text = `📝 *CampusFlow TZ Assessment Alert*\n*${task.courseCode}: ${task.title}*\nDue Date: ${task.dueDate}\nWeight: ${task.weight}%\nStatus: ${task.status}\nNotes: ${task.notes || 'None'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    onNotify(`Sharing "${task.title}" via WhatsApp...`);
  };

  // Share Task via Email
  const handleShareEmail = (task: Task) => {
    const subject = `Assessment Deadline: ${task.courseCode} - ${task.title}`;
    const body = `Hello,\n\nAssessment details from CampusFlow TZ:\n\nCourse: ${task.courseCode}\nTitle: ${task.title}\nDue Date: ${task.dueDate}\nWeight: ${task.weight}%\nStatus: ${task.status}\nNotes: ${task.notes || 'None'}\n`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    onNotify(`Opening email client to share "${task.title}"...`);
  };

  // Copy Task Details
  const handleCopyTask = (task: Task) => {
    const str = `${task.courseCode} | ${task.title} | Due: ${task.dueDate} | Weight: ${task.weight}% | Status: ${task.status}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(str);
    }
    onNotify(`Copied details for "${task.title}".`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 uppercase tracking-wider">
            Continuous Assessments (CATs)
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Tasks, Tests & Deadlines
          </h1>
          <p className="text-xs text-slate-600">
            Track weighted laboratory reports, tests, and seminar assignments
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-500">CAT Progress</span>
            <span className="block text-sm font-black text-sky-700">
              {completedWeight}% / {totalWeight}% Handed In
            </span>
          </div>

          <button
            onClick={handlePrintAssessments}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Print assessment schedule"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Schedule</span>
          </button>

          <button
            id="tasks-add-task-btn"
            onClick={onOpenAddTask}
            className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
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
                ? 'bg-sky-800 text-white border-sky-800 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tasks Table / Card List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-800 border-b border-slate-200">
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
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No assessments match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{task.title}</div>
                      {task.notes && (
                        <div className="text-[11px] text-slate-600 font-medium mt-0.5 line-clamp-1">
                          {task.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-sky-800 whitespace-nowrap">
                      {task.courseCode}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-medium">
                      {task.dueDate}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-amber-800 whitespace-nowrap">
                      {task.weight}% CAT
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="p-1.5 text-slate-600 hover:text-sky-700 rounded-lg hover:bg-slate-100 transition-colors"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* WhatsApp Share */}
                        <button
                          onClick={() => handleShareWhatsApp(task)}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Share on WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        {/* Email Share */}
                        <button
                          onClick={() => handleShareEmail(task)}
                          className="p-1.5 text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
                          title="Share via Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>

                        {/* Copy Link */}
                        <button
                          onClick={() => handleCopyTask(task)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Copy details"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {task.status !== 'graded' && task.status !== 'submitted' ? (
                          <button
                            onClick={() => {
                              onUpdateStatus(task.id, 'submitted');
                              onNotify(`Marked "${task.title}" as Submitted.`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors"
                          >
                            Mark Submitted
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              onUpdateStatus(task.id, 'in_progress');
                              onNotify(`Reopened "${task.title}".`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                          >
                            Reopen
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
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

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-black bg-sky-100 text-sky-800 font-mono">
                  {selectedTask.courseCode}
                </span>
                <span className="text-xs text-slate-500">• Assessment Details</span>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-black text-slate-900">{selectedTask.title}</h3>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block font-bold">Due Date</span>
                  <span className="font-mono font-bold text-slate-900">{selectedTask.dueDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-bold">Weight</span>
                  <span className="font-extrabold text-amber-800">{selectedTask.weight}% of Final Grade</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-bold">Status</span>
                  <span className="capitalize font-bold text-slate-900">{selectedTask.status.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-bold">Course</span>
                  <span className="font-bold text-sky-800">{selectedTask.courseCode}</span>
                </div>
              </div>

              {selectedTask.notes && (
                <div className="text-xs space-y-1">
                  <span className="text-slate-700 font-bold block">Assessment Notes & Requirements:</span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
                    {selectedTask.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleShareWhatsApp(selectedTask)}
                  className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl"
                  title="WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShareEmail(selectedTask)}
                  className="p-2 text-sky-700 hover:bg-sky-50 rounded-xl"
                  title="Email"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCopyTask(selectedTask)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedTask.status !== 'graded' && selectedTask.status !== 'submitted' ? (
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedTask.id, 'submitted');
                      onNotify(`Marked "${selectedTask.title}" as Submitted.`);
                      setSelectedTask(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                  >
                    Mark as Submitted
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedTask.id, 'in_progress');
                      onNotify(`Reopened "${selectedTask.title}".`);
                      setSelectedTask(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Reopen Task
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
