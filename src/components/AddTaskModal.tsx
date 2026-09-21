import React, { useState } from 'react';
import { X, CheckSquare, Calendar, Percent, Flag } from 'lucide-react';
import { Task, Course } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
  courses: Course[];
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  courses,
}) => {
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState(courses[0]?.code || 'ZOO 201');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState(15);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      courseCode,
      dueDate,
      weight,
      status: 'not_started',
      priority,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-[#102d4f]">New Academic Assessment</h2>
            <p className="text-xs text-slate-500 mt-0.5">Track lab reports, tests, assignments and presentations</p>
          </div>
          <button
            id="close-add-task-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Task / Assessment Name *
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              placeholder="e.g. Invertebrate Practical Report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-slate-500" /> Course
              </label>
              <select
                id="task-course-select"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code}
                  </option>
                ))}
                <option value="Personal">Personal / Research</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-slate-500" /> Weight (%)
              </label>
              <input
                id="task-weight-input"
                type="number"
                min={1}
                max={100}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Due Date
              </label>
              <input
                id="task-due-date-input"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-slate-500" /> Priority
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              >
                <option value="high">High (Urgent)</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Instructions & Notes
            </label>
            <textarea
              id="task-notes-input"
              rows={2}
              placeholder="Rubrics, format, team members..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-save-task-btn"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1e6fa8] hover:bg-[#185a8a] text-white text-sm font-bold shadow-md transition-all active:scale-95"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
