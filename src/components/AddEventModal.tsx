import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Tag, BookOpen, Bell } from 'lucide-react';
import { CalendarEvent, EventCategory, Course } from '../types';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  courses: Course[];
  initialDate?: string;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  courses,
  initialDate,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<EventCategory>('lecture');
  const [courseId, setCourseId] = useState('');
  const [description, setDescription] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState(15);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      date,
      startTime,
      endTime,
      location: location.trim() || 'Campus',
      category,
      courseId: courseId || undefined,
      description: description.trim() || undefined,
      reminderMinutes,
    });

    // Reset form
    setTitle('');
    setLocation('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-[#102d4f]">Add Academic or Personal Event</h2>
            <p className="text-xs text-slate-500 mt-0.5">Schedule lectures, tests, practicals, sport or revision</p>
          </div>
          <button
            id="close-add-event-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Event Title *
            </label>
            <input
              id="event-title-input"
              type="text"
              required
              placeholder="e.g. ZOO 201 Practical / Football / CAT 2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" /> Category
              </label>
              <select
                id="event-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              >
                <option value="lecture">Lecture</option>
                <option value="practical">Practical / Lab</option>
                <option value="assessment">Assessment / Test / Exam</option>
                <option value="personal">Personal Study / Revision</option>
                <option value="sport">Sport / Fitness</option>
                <option value="society">Student Society / Club</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" /> Linked Course (Optional)
              </label>
              <select
                id="event-course-select"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              >
                <option value="">None / General</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.title.substring(0, 24)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Date
              </label>
              <input
                id="event-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> Start
              </label>
              <input
                id="event-start-time-input"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> End
              </label>
              <input
                id="event-end-time-input"
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> Location / Hall
              </label>
              <input
                id="event-location-input"
                type="text"
                placeholder="e.g. Science Block B204 or Main Field"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-slate-500" /> Push Alert Reminder
              </label>
              <select
                id="event-reminder-select"
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              >
                <option value={0}>At time of event</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
                <option value={1440}>1 day before</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notes / Agenda
            </label>
            <textarea
              id="event-notes-input"
              rows={2}
              placeholder="Topics, readings or equipment needed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              id="submit-save-event-btn"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1e6fa8] hover:bg-[#185a8a] text-white text-sm font-bold shadow-md transition-all active:scale-95"
            >
              Save Event to Timetable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
