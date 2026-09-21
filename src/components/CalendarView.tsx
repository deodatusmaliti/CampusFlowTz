import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MapPin, 
  Clock, 
  Download, 
  Filter, 
  Trash2, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { CalendarEvent, EventCategory, Course } from '../types';

interface CalendarViewProps {
  events: CalendarEvent[];
  courses: Course[];
  onOpenAddEvent: (initialDate?: string) => void;
  onDeleteEvent: (id: string) => void;
  onNotify: (msg: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  courses,
  onOpenAddEvent,
  onDeleteEvent,
  onNotify,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-21');

  // Days of the active semester week (Mon 21 Sep - Sun 27 Sep 2026 base)
  const baseDates = [
    { name: 'Mon', day: '21', full: '2026-09-21' },
    { name: 'Tue', day: '22', full: '2026-09-22' },
    { name: 'Wed', day: '23', full: '2026-09-23' },
    { name: 'Thu', day: '24', full: '2026-09-24' },
    { name: 'Fri', day: '25', full: '2026-09-25' },
    { name: 'Sat', day: '26', full: '2026-09-26' },
    { name: 'Sun', day: '27', full: '2026-09-27' },
  ];

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'lecture', label: 'Lectures' },
    { id: 'practical', label: 'Practicals & Labs' },
    { id: 'assessment', label: 'Tests & Exams' },
    { id: 'personal', label: 'Study & Revision' },
    { id: 'sport', label: 'Sports & Fitness' },
    { id: 'society', label: 'Clubs & Societies' },
  ];

  const filteredEvents = events.filter((ev) => {
    if (selectedCategory !== 'all' && ev.category !== selectedCategory) return false;
    return true;
  });

  const getEventsForDay = (dateStr: string) => {
    return filteredEvents.filter((ev) => ev.date === dateStr);
  };

  const getCategoryColor = (cat: EventCategory) => {
    switch (cat) {
      case 'lecture': return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'practical': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'assessment': return 'bg-red-50 text-red-800 border-red-200';
      case 'sport': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'society': return 'bg-amber-50 text-amber-800 border-amber-200';
      default: return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  // Export to iCalendar .ics format
  const exportToICS = () => {
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CampusFlow TZ//Academic Calendar//EN\n';
    filteredEvents.forEach((e) => {
      const dtStart = e.date.replace(/-/g, '') + 'T' + e.startTime.replace(/:/g, '') + '00';
      const dtEnd = e.date.replace(/-/g, '') + 'T' + e.endTime.replace(/:/g, '') + '00';
      icsContent += `BEGIN:VEVENT\nSUMMARY:${e.title}\nLOCATION:${e.location}\nDESCRIPTION:${e.description || ''}\nDTSTART:${dtStart}\nDTEND:${dtEnd}\nSTATUS:CONFIRMED\nEND:VEVENT\n`;
    });
    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'campusflow_academic_timetable.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('Timetable exported as .ics for Google Calendar & Outlook');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#d9e3ea] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 uppercase tracking-wider">
              Semester 1 · 2026/27
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102d4f] mt-1">
            Academic & Campus Life Calendar
          </h1>
          <p className="text-xs text-slate-500">
            Interactive schedule for classes, laboratory practicals, CATs, and extracurriculars
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportToICS}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Download .ics for phone or calendar sync"
          >
            <Download className="w-4 h-4 text-slate-600" /> Export (.ics)
          </button>

          <button
            id="calendar-add-event-primary-btn"
            onClick={() => onOpenAddEvent(selectedDate)}
            className="px-4 py-2 rounded-xl bg-[#1e6fa8] hover:bg-[#185a8a] text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Add Event
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === c.id
                ? 'bg-[#102d4f] text-white border-[#102d4f] shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Week Grid (Responsive: 7 columns on desktop, stacked on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {baseDates.map((dateObj) => {
          const dayEvents = getEventsForDay(dateObj.full);
          const isSelected = selectedDate === dateObj.full;
          const isToday = dateObj.full === '2026-09-21';

          return (
            <div
              key={dateObj.full}
              onClick={() => setSelectedDate(dateObj.full)}
              className={`bg-white rounded-2xl p-3 border transition-all min-h-[160px] flex flex-col justify-between cursor-pointer ${
                isSelected 
                  ? 'ring-2 ring-[#1e6fa8] border-transparent shadow-sm' 
                  : 'border-[#d9e3ea] hover:border-slate-300'
              }`}
            >
              <div>
                {/* Day Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase">{dateObj.name}</span>
                    <span className={`block text-lg font-black ${isToday ? 'text-[#1e6fa8]' : 'text-slate-800'}`}>
                      {dateObj.day}
                    </span>
                  </div>
                  {isToday && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-[#1e6fa8]">
                      Today
                    </span>
                  )}
                </div>

                {/* Day Events */}
                <div className="space-y-1.5">
                  {dayEvents.map((ev) => {
                    const badgeClass = getCategoryColor(ev.category);
                    return (
                      <div
                        key={ev.id}
                        className={`p-2 rounded-lg border text-left text-xs ${badgeClass} group relative`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold truncate">{ev.title}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEvent(ev.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-600 transition-opacity"
                            title="Delete Event"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[11px] opacity-80">
                          <Clock className="w-2.5 h-2.5" /> {ev.startTime}–{ev.endTime}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] opacity-75 truncate">
                          <MapPin className="w-2.5 h-2.5" /> {ev.location}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Add on this specific day */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAddEvent(dateObj.full);
                }}
                className="mt-2 w-full py-1 text-[11px] font-semibold text-slate-400 hover:text-[#1e6fa8] hover:bg-slate-50 rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Day Expanded Detail Drawer */}
      <div className="bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#102d4f]">
              Detailed Agenda for {selectedDate}
            </h2>
            <p className="text-xs text-slate-500">
              {getEventsForDay(selectedDate).length} event(s) scheduled on this day
            </p>
          </div>
          <button
            onClick={() => onOpenAddEvent(selectedDate)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#102d4f] text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add to {selectedDate}
          </button>
        </div>

        {getEventsForDay(selectedDate).length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl">
            <p className="text-xs font-medium">No commitments for this date.</p>
            <button
              onClick={() => onOpenAddEvent(selectedDate)}
              className="mt-2 text-xs font-bold text-[#1e6fa8] hover:underline"
            >
              + Click to schedule a lecture or personal study session
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {getEventsForDay(selectedDate).map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl border border-slate-200 bg-[#fbfdff] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-700">
                      {ev.category}
                    </span>
                    <button
                      onClick={() => onDeleteEvent(ev.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-[#102d4f] mt-2">{ev.title}</h3>
                  {ev.description && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ev.description}</p>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-[#1e6fa8]">
                    <Clock className="w-3.5 h-3.5" /> {ev.startTime} – {ev.endTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {ev.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
