import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  MapPin, 
  UserCheck, 
  Sparkles, 
  Plus, 
  Download, 
  Search, 
  SlidersHorizontal, 
  MessageSquare, 
  CalendarPlus, 
  CheckCircle2, 
  AlertTriangle,
  Compass, 
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  BookOpen,
  GraduationCap,
  ArrowRight
} from 'lucide-react';
import { DayOfWeek, TimetableSlot, User, CalendarEvent } from '../types';
import { TimeService } from '../services/timeService';

interface TimetableViewProps {
  user: User;
  timetable: TimetableSlot[];
  onOpenImportModal: () => void;
  onOpenCourseChat: (courseCode: string) => void;
  onAddCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onOpenAIAssistant: (prompt?: string) => void;
  onDeleteSlot: (id: string) => void;
  onResetSampleTimetable: () => void;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TimetableView: React.FC<TimetableViewProps> = ({
  user,
  timetable,
  onOpenImportModal,
  onOpenCourseChat,
  onAddCalendarEvent,
  onOpenAIAssistant,
  onDeleteSlot,
  onResetSampleTimetable,
}) => {
  // Determine current day of week
  const todayName = useMemo<DayOfWeek>(() => {
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const current = days[new Date().getDay()];
    return current === 'Sunday' ? 'Monday' : current;
  }, []);

  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'ALL'>(todayName);
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [selectedVenueGuide, setSelectedVenueGuide] = useState<string | null>(null);

  // Active or upcoming period calculation
  const currentStatus = useMemo(() => {
    // Look at today's classes
    const todaySlots = timetable
      .filter(s => s.day === todayName)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (todaySlots.length === 0) {
      return { current: null, next: null, count: 0 };
    }

    // Default to the prime morning lecture (e.g. BIO 203 in Hall 03)
    const current = todaySlots[0];
    const next = todaySlots.length > 1 ? todaySlots[1] : null;

    return { current, next, count: todaySlots.length };
  }, [timetable, todayName]);

  // Filtered Slots
  const filteredSlots = useMemo(() => {
    return timetable.filter(slot => {
      if (selectedDay !== 'ALL' && slot.day !== selectedDay) return false;
      if (selectedYear !== 'ALL' && slot.year !== selectedYear) return false;
      if (selectedSemester !== 'ALL' && slot.semester !== selectedSemester) return false;
      if (selectedType !== 'ALL' && slot.type !== selectedType) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = slot.courseCode.toLowerCase().includes(q);
        const matchesName = slot.courseName.toLowerCase().includes(q);
        const matchesHall = slot.hall.toLowerCase().includes(q);
        const matchesLecturer = slot.lecturer.toLowerCase().includes(q);
        return matchesCode || matchesName || matchesHall || matchesLecturer;
      }

      return true;
    }).sort((a, b) => {
      if (selectedDay === 'ALL') {
        const dayOrder: Record<DayOfWeek, number> = {
          'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7
        };
        const diff = (dayOrder[a.day] || 0) - (dayOrder[b.day] || 0);
        if (diff !== 0) return diff;
      }
      return a.startTime.localeCompare(b.startTime);
    });
  }, [timetable, selectedDay, selectedYear, selectedSemester, selectedType, searchQuery]);

  // Quick action: Add slot to student personal calendar
  const handleAddToCalendar = (slot: TimetableSlot) => {
    const today = new Date().toISOString().split('T')[0];
    onAddCalendarEvent({
      title: `${slot.courseCode}: ${slot.courseName} (${slot.type})`,
      description: `Lecturer: ${slot.lecturer} | Venue: ${slot.hall}, ${slot.building || ''}\n${slot.notes || ''}`,
      date: today,
      startTime: slot.startTime,
      endTime: slot.endTime,
      location: `${slot.hall} - ${slot.building || 'Campus'}`,
      category: slot.type === 'Practical' ? 'practical' : 'lecture',
      reminderMinutes: 15,
    });
  };

  // Export Timetable as CSV
  const handleExportCSV = () => {
    const header = 'CourseCode,CourseName,Day,StartTime,EndTime,Hall,Building,Lecturer,Year,Semester,Type,Notes\n';
    const rows = filteredSlots.map(s => 
      `"${s.courseCode}","${s.courseName}","${s.day}","${s.startTime}","${s.endTime}","${s.hall}","${s.building || ''}","${s.lecturer}",${s.year},${s.semester},"${s.type}","${s.notes || ''}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CampusFlow_${user.university.replace(/[^a-zA-Z0-9]/g, '_')}_Timetable.csv`;
    link.click();
  };

  return (
    <div id="timetable-view-container" className="space-y-6 animate-fade-in">
      {/* Top Header & Action Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
              Academic Year 2026/27
            </span>
            <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1 border border-amber-200">
              <Clock className="w-3 h-3 text-amber-700" />
              <span>Campus Time: EAT (UTC+3)</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {user.university} • {user.programme}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Interactive Semester Timetable
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Your real-time daily operational compass: class schedules, venue directions, and faculty sync.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            id="btn-upload-timetable"
            onClick={onOpenImportModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow-md active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-sky-200" />
            <span>Upload Timetable (AI / CSV / Manual)</span>
          </button>

          <button
            id="btn-export-timetable"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            title="Export to CSV Spreadsheet"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onResetSampleTimetable}
            className="px-3 py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
            title="Reload default standard sample timetable"
          >
            Reset Sample
          </button>
        </div>
      </div>

      {/* LIVE NOW & NEXT UP RADAR CARD */}
      {currentStatus.current && (
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-sky-800/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-center">
            {/* Live Now Column */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
                  LIVE SESSION NOW • {currentStatus.current.day.toUpperCase()}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-medium">
                  {currentStatus.current.timeFormatted || `${currentStatus.current.startTime} - ${currentStatus.current.endTime}`}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {currentStatus.current.courseCode}
                  </span>
                  <span className="text-lg text-sky-200 font-medium truncate">
                    {currentStatus.current.courseName}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                  {currentStatus.current.notes || 'Arrive early, prepare lecture handouts, and sign in for attendance.'}
                </p>
              </div>

              {/* Venue & Instructor Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div 
                  onClick={() => setSelectedVenueGuide(currentStatus.current?.hall || null)}
                  className="flex items-center gap-2 bg-sky-900/60 hover:bg-sky-800/80 border border-sky-700/50 px-3 py-1.5 rounded-xl cursor-pointer transition-colors text-xs font-semibold text-sky-100"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>Venue: <b>{currentStatus.current.hall}</b></span>
                  <span className="text-[10px] text-sky-300">({currentStatus.current.building || 'Campus Complex'})</span>
                </div>

                <div className="flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Instructor: <b>{currentStatus.current.lecturer}</b></span>
                </div>

                <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-300 font-bold">
                  Year {currentStatus.current.year} • Sem {currentStatus.current.semester}
                </span>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={() => onOpenCourseChat(currentStatus.current!.courseCode)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-sky-50 text-xs font-bold transition-colors shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                  <span>Course Group Chat</span>
                </button>

                <button
                  onClick={() => onOpenAIAssistant(`Tell me about ${currentStatus.current!.courseCode} lecture topics and how to excel in it with ${currentStatus.current!.lecturer}`)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-white text-xs font-bold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                  <span>Ask AI Tutor for Topics</span>
                </button>

                <button
                  onClick={() => handleAddToCalendar(currentStatus.current!)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-colors"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Sync Calendar</span>
                </button>
              </div>
            </div>

            {/* Next Up Column */}
            <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-xl p-4.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Coming Up Next
                </span>
                <span className="text-[11px] text-sky-300 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Today's Timeline
                </span>
              </div>

              {currentStatus.next ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-base">
                      {currentStatus.next.courseCode}
                    </span>
                    <span className="text-xs font-mono bg-sky-950/80 px-2 py-0.5 rounded text-sky-300 border border-sky-800">
                      {currentStatus.next.startTime} - {currentStatus.next.endTime}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium truncate">
                    {currentStatus.next.courseName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span>{currentStatus.next.hall}</span>
                    <span>•</span>
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentStatus.next.lecturer}</span>
                  </div>
                </div>
              ) : (
                <div className="py-3 text-center text-xs text-slate-400">
                  No further scheduled sessions for today. Take time to revise or complete coursework!
                </div>
              )}

              <div className="border-t border-white/10 pt-2 flex items-center justify-between text-xs text-slate-300">
                <span>Today's Total Classes: <b>{currentStatus.count} periods</b></span>
                <button 
                  onClick={() => setSelectedDay(todayName)}
                  className="text-sky-300 hover:text-white font-bold flex items-center gap-1"
                >
                  View Today's Day View <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DAY SELECTOR TABS & VIEW TOGGLES */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Day Navigation Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
            <button
              id="day-btn-all"
              onClick={() => setSelectedDay('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedDay === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Full Week (All Days)
            </button>

            {DAYS_OF_WEEK.map(day => {
              const count = timetable.filter(s => s.day === day).length;
              const isToday = day === todayName;
              return (
                <button
                  key={day}
                  id={`day-btn-${day.toLowerCase()}`}
                  onClick={() => setSelectedDay(day)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    selectedDay === day
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{day.substring(0, 3)}</span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    selectedDay === day ? 'bg-sky-800 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode & Quick Filter Reset */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Cards Timeline
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Weekly Matrix
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search course, Hall 03, Prof. Assad..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">All Academic Years</option>
              <option value={1}>Year 1 Students</option>
              <option value={2}>Year 2 Students</option>
              <option value={3}>Year 3 Students</option>
              <option value={4}>Year 4 Students</option>
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <select
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">All Semesters</option>
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>

          {/* Session Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">All Types (Lectures & Labs)</option>
              <option value="Lecture">Lectures Only</option>
              <option value="Practical">Practicals / Labs</option>
              <option value="Tutorial">Tutorials</option>
              <option value="Seminar">Seminars</option>
            </select>
          </div>
        </div>
      </div>

      {/* VENUE GUIDE MODAL / POPOVER */}
      {selectedVenueGuide && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-sky-900">
                Venue Navigation Guide: {selectedVenueGuide}
              </h4>
              <p className="text-xs text-sky-800 mt-0.5">
                {selectedVenueGuide.includes('03') 
                  ? 'Hall 03 is situated on the 1st Floor of CoNAS Main Complex. Enter via the North Courtyard stairway.'
                  : selectedVenueGuide.includes('ICT')
                  ? 'ICT Lab 2 is located on the Ground Floor of Central Informatics Centre. Badge clearance is required at entrance.'
                  : selectedVenueGuide.includes('Science Block')
                  ? 'Science Block B204 is on the 2nd floor, Zoology & Life Sciences Wing.'
                  : 'Main lecture theatre complex. Projection and sound facilities available.'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedVenueGuide(null)}
            className="text-xs text-sky-700 hover:text-sky-900 font-bold px-2 py-1 bg-white rounded-lg border border-sky-200 shadow-2xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TIMETABLE CONTENT */}
      {filteredSlots.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No classes found matching filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Try adjusting your day, year, semester, or search query. You can also import your timetable using our AI photo scanner or CSV uploader.
            </p>
          </div>
          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl hover:bg-sky-700 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upload or Scan Timetable</span>
          </button>
        </div>
      ) : viewMode === 'timeline' ? (
        /* TIMELINE CARD LIST */
        <div className="space-y-3.5">
          {filteredSlots.map(slot => (
            <div
              key={slot.id}
              id={`slot-card-${slot.id}`}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-sky-300 p-4.5 sm:p-5 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Left: Time & Day Pill */}
                <div className="flex items-center gap-4">
                  <div className="w-20 sm:w-24 text-center shrink-0 py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-200 group-hover:border-sky-200 transition-colors">
                    <span className="block text-[11px] font-bold text-sky-700 uppercase tracking-wide">
                      {slot.day.substring(0, 3)}
                    </span>
                    <span className="block text-sm font-black text-slate-900 font-mono mt-0.5">
                      {slot.startTime}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      to {slot.endTime}
                    </span>
                  </div>

                  {/* Course Details */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span 
                        className="px-2.5 py-0.5 rounded-md text-xs font-black tracking-tight text-white shadow-2xs"
                        style={{ backgroundColor: slot.color || '#1e6fa8' }}
                      >
                        {slot.courseCode}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-900 transition-colors">
                        {slot.courseName}
                      </h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {slot.type}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                        Year {slot.year} • Sem {slot.semester}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
                      <button
                        onClick={() => setSelectedVenueGuide(slot.hall)}
                        className="flex items-center gap-1.5 font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-sky-600" />
                        <span>Venue: <b>{slot.hall}</b></span>
                        {slot.building && (
                          <span className="text-slate-500 font-normal">({slot.building})</span>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Lecturer: <b>{slot.lecturer}</b></span>
                      </div>
                    </div>

                    {slot.notes && (
                      <p className="text-xs text-slate-500 pt-1 italic line-clamp-1">
                        "{slot.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    id={`btn-chat-${slot.courseCode}`}
                    onClick={() => onOpenCourseChat(slot.courseCode)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-sky-50 hover:text-sky-800 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                    title="Course space chat & peer alerts"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                    <span className="hidden md:inline">Course Chat</span>
                  </button>

                  <button
                    onClick={() => handleAddToCalendar(slot)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                    title="Add to personal calendar schedule"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden md:inline">Sync</span>
                  </button>

                  <button
                    onClick={() => onOpenAIAssistant(`Tell me what is covered in ${slot.courseCode} with ${slot.lecturer} in ${slot.hall}`)}
                    className="p-2 bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 rounded-xl transition-colors"
                    title="Ask AI Assistant about this lecture"
                  >
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </button>

                  <button
                    onClick={() => onDeleteSlot(slot.id)}
                    className="text-slate-300 hover:text-rose-600 p-2 rounded-xl transition-colors"
                    title="Delete period"
                  >
                    <span className="text-sm font-bold">×</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* WEEKLY MATRIX GRID VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 p-4 overflow-x-auto shadow-xs">
          <div className="min-w-[800px] grid grid-cols-5 gap-3">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
              const daySlots = filteredSlots
                .filter(s => s.day === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
              const isToday = day === todayName;

              return (
                <div 
                  key={day} 
                  className={`rounded-xl border p-3 flex flex-col space-y-2.5 ${
                    isToday ? 'bg-sky-50/40 border-sky-300' : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className={`text-xs font-black ${isToday ? 'text-sky-900' : 'text-slate-800'}`}>
                      {day} {isToday && '• Today'}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {daySlots.length}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {daySlots.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-[11px]">
                        No classes
                      </div>
                    ) : (
                      daySlots.map(slot => (
                        <div
                          key={slot.id}
                          className="bg-white rounded-xl p-2.5 border border-slate-200 hover:border-sky-400 shadow-2xs space-y-1 transition-all cursor-pointer"
                          onClick={() => setSelectedVenueGuide(slot.hall)}
                        >
                          <div className="flex items-center justify-between">
                            <span 
                              className="text-[10px] font-black px-1.5 py-0.5 rounded text-white"
                              style={{ backgroundColor: slot.color || '#1e6fa8' }}
                            >
                              {slot.courseCode}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 font-semibold">
                              {slot.startTime}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {slot.courseName}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                            <span className="font-semibold text-sky-800 flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5 text-sky-600" />
                              {slot.hall}
                            </span>
                            <span className="truncate max-w-[80px]">
                              {slot.lecturer.split(' ').pop()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
