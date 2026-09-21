import React from 'react';
import { 
  GraduationCap, 
  Award, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Calendar as CalendarIcon, 
  CreditCard, 
  BookOpen, 
  MapPin, 
  User, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { Course, CalendarEvent, Task, User as UserType, Announcement, ScientificBreakthrough } from '../types';
import { ActiveTab } from './Navigation';

interface DashboardViewProps {
  currentUser: UserType;
  courses: Course[];
  events: CalendarEvent[];
  tasks: Task[];
  announcements?: Announcement[];
  breakthroughs?: ScientificBreakthrough[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenAddEvent: () => void;
  onOpenAddTask: () => void;
  onCompleteTask: (taskId: string) => void;
  onOpenCreateAnnouncement?: () => void;
  onOpenUniversityPicker?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  courses,
  events,
  tasks,
  announcements = [],
  breakthroughs = [],
  onNavigate,
  onOpenAddEvent,
  onOpenAddTask,
  onCompleteTask,
  onOpenCreateAnnouncement,
  onOpenUniversityPicker,
}) => {
  // Calculations
  const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
  const avgScore = courses.length 
    ? Math.round(courses.reduce((acc, c) => acc + c.currentScore, 0) / courses.length) 
    : 0;
  const avgAttendance = courses.length 
    ? Math.round(courses.reduce((acc, c) => acc + c.attendance, 0) / courses.length) 
    : 0;

  // Approximate GPA on 5.0 scale (Tanzania standard)
  const currentGpa = 3.72;

  // Chart data: semester GPA progression
  const gpaTrendData = [
    { semester: 'Y1 Sem 1', gpa: 3.55, target: 3.80 },
    { semester: 'Y1 Sem 2', gpa: 3.68, target: 3.80 },
    { semester: 'Y2 Sem 1 (Current)', gpa: 3.72, target: 4.00 },
    { semester: 'Y2 Sem 2 (Proj)', gpa: 3.85, target: 4.00 },
    { semester: 'Y3 Sem 1 (Proj)', gpa: 4.02, target: 4.00 },
  ];

  // Course performance chart data
  const coursePerformanceData = courses.map((c) => ({
    name: c.code,
    Score: c.currentScore,
    Attendance: c.attendance,
  }));

  // Today's events (sorting by start time)
  const todayStr = '2026-09-21';
  const todayEvents = events.filter((e) => e.date === todayStr);

  // Urgent upcoming tasks
  const pendingTasks = tasks.filter((t) => t.status !== 'graded');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Urgent Announcement Alert Strip (if any urgent alert exists) */}
      {announcements.some(a => (a.priority === 'urgent' || a.priority === 'venue_change') && !a.acknowledged) && (
        <div className="bg-gradient-to-r from-amber-500/15 via-red-500/10 to-amber-500/15 border-2 border-amber-400/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0">
              🚨
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                Live Campus Alert
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-[#102d4f] mt-0.5">
                {announcements.find(a => (a.priority === 'urgent' || a.priority === 'venue_change') && !a.acknowledged)?.title}
              </p>
              <p className="text-xs text-slate-600 line-clamp-1">
                {announcements.find(a => (a.priority === 'urgent' || a.priority === 'venue_change') && !a.acknowledged)?.content}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {onOpenCreateAnnouncement && (
              <button
                onClick={onOpenCreateAnnouncement}
                className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 text-xs font-bold transition-colors"
              >
                Broadcast Notice
              </button>
            )}
            <button
              onClick={() => onNavigate('timetable')}
              className="px-3.5 py-1.5 rounded-lg bg-[#102d4f] hover:bg-[#1a406c] text-white text-xs font-bold transition-colors shadow-2xs"
            >
              Check Timetable
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#102d4f] via-[#1a4b7c] to-[#1e6fa8] p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-[#e6ad3d] mb-3">
            <Sparkles className="w-3.5 h-3.5" /> High-Performance Higher Ed Portal · {currentUser.university}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Plan your semester with total confidence.
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            Lectures, examination timetables, Tanzanian GePG fee tracking, GPA projections, and student communities — all synchronized offline & cloud-ready.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5 sm:gap-3">
            <button
              id="hero-view-timetable-btn"
              onClick={() => onNavigate('timetable')}
              className="px-4 py-2.5 rounded-xl bg-[#e6ad3d] hover:bg-[#f3b844] text-[#102d4f] text-xs sm:text-sm font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" /> Semester Timetable
            </button>
            <button
              id="hero-view-courses-btn"
              onClick={() => onNavigate('courses')}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 backdrop-blur-xs border border-white/20"
            >
              <BookOpen className="w-4 h-4" /> View My Courses
            </button>
            <button
              id="hero-study-feed-btn"
              onClick={() => onNavigate('study')}
              className="px-4 py-2.5 rounded-xl bg-[#1e6fa8] hover:bg-[#2583c4] text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#e6ad3d]" /> Study & Innovations
            </button>
            <button
              id="hero-check-gpa-btn"
              onClick={() => onNavigate('gpa')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold backdrop-blur-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4" /> Check GPA
            </button>
            {onOpenUniversityPicker && (
              <button
                id="hero-change-uni-btn"
                onClick={onOpenUniversityPicker}
                className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
                title="Change or Add University"
              >
                🏫 Switch Campus
              </button>
            )}
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none"></div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Current GPA */}
        <div className="bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs hover:border-[#1e6fa8] transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
            <span>Cumulative GPA</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#102d4f]">{currentGpa.toFixed(2)}</span>
            <span className="text-xs font-semibold text-slate-400">/ 5.00</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 font-bold">Upper Second Class</span>
            <span className="text-slate-400 font-medium">Target 4.00</span>
          </div>
        </div>

        {/* Metric 2: Credits Completed */}
        <div className="bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs hover:border-[#1e6fa8] transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
            <span>Credits Progress</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1e6fa8]">42</span>
            <span className="text-xs font-semibold text-slate-400">/ 120 Total</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#1e6fa8] h-1.5 rounded-full" style={{ width: '35%' }}></div>
          </div>
        </div>

        {/* Metric 3: Next Assessment */}
        <div className="bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs hover:border-[#1e6fa8] transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
            <span>Next Assessment</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600">3 Days</span>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-slate-600 truncate">
            ZOO 201 Written CAT 1
          </p>
        </div>

        {/* Metric 4: Average Attendance */}
        <div className="bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs hover:border-[#1e6fa8] transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
            <span>Lecture Attendance</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#16845d]">{avgAttendance}%</span>
            <span className="text-xs font-semibold text-emerald-700">Eligible</span>
          </div>
          <p className="mt-2 text-[11px] font-medium text-slate-400">
            Min 75% required for exams
          </p>
        </div>
      </div>

      {/* High-Performance Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPA Trajectory Chart */}
        <div className="bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#102d4f]">GPA Trajectory & Projections</h2>
              <p className="text-xs text-slate-500">Historical performance vs 4.00 First-Class target</p>
            </div>
            <button
              onClick={() => onNavigate('gpa')}
              className="text-xs font-bold text-[#1e6fa8] hover:underline flex items-center gap-1"
            >
              Simulate <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gpaTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e6fa8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1e6fa8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                <XAxis dataKey="semester" tick={{ fontSize: 11, fill: '#62717d' }} />
                <YAxis domain={[3.0, 4.5]} tick={{ fontSize: 11, fill: '#62717d' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#102d4f', borderRadius: 8, color: '#fff', fontSize: 12 }} 
                />
                <Area type="monotone" dataKey="gpa" stroke="#1e6fa8" strokeWidth={2.5} fillOpacity={1} fill="url(#gpaGradient)" name="Actual GPA" />
                <Area type="monotone" dataKey="target" stroke="#e6ad3d" strokeDasharray="4 4" strokeWidth={2} fill="transparent" name="First Class Target" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Performance Breakdown Chart */}
        <div className="bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#102d4f]">Course Marks & Attendance (%)</h2>
              <p className="text-xs text-slate-500">Continuous Assessment & lab presence</p>
            </div>
            <button
              onClick={() => onNavigate('courses')}
              className="text-xs font-bold text-[#1e6fa8] hover:underline flex items-center gap-1"
            >
              All Courses <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coursePerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#62717d' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#62717d' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#102d4f', borderRadius: 8, color: '#fff', fontSize: 12 }} 
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />
                <Bar dataKey="Score" fill="#1e6fa8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Attendance" fill="#16845d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Today's Schedule + Assessment Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule (2 cols on large) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#102d4f]">Today on Campus</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Monday 21 September
                </span>
              </div>
              <p className="text-xs text-slate-500">Scheduled lectures, labs & personal activities</p>
            </div>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs font-bold text-[#1e6fa8] hover:underline flex items-center gap-1"
            >
              Full Calendar <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {todayEvents.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No more events scheduled for today.</p>
            ) : (
              todayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-[#1e6fa8] bg-[#fbfdff] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 px-2 py-1.5 rounded-lg bg-[#e5f2fb] text-[#1e6fa8] text-center shrink-0">
                      <span className="block text-xs font-black">{ev.startTime}</span>
                      <span className="block text-[10px] font-medium text-slate-500">{ev.endTime}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#102d4f]">{ev.title}</h3>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {ev.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {ev.location}
                        </span>
                        {ev.description && (
                          <span className="text-slate-600 truncate max-w-xs">{ev.description}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onNavigate('calendar')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1e6fa8] bg-sky-50 hover:bg-sky-100 transition-colors"
                    >
                      View Hall
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Priority Assessments Watchlist (1 col) */}
        <div className="bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#102d4f]">Assessments & CATs</h2>
                <p className="text-xs text-slate-500">Continuous assessments weights</p>
              </div>
              <button
                id="dashboard-add-task-btn"
                onClick={onOpenAddTask}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#102d4f] flex items-center justify-center transition-colors"
                title="Add Assessment Task"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#102d4f] truncate">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="font-semibold text-[#1e6fa8]">{task.courseCode}</span>
                      <span>·</span>
                      <span>Due {task.dueDate}</span>
                      <span>·</span>
                      <span className="font-bold text-amber-700">{task.weight}% CAT</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onCompleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors shrink-0"
                    title="Mark Done"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('tasks')}
            className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#102d4f] text-xs font-bold text-center transition-colors"
          >
            Manage All Assessments & Rubrics
          </button>
        </div>
      </div>

      {/* Live Science, Space Tech & Telemedicine Discovery Feed */}
      <div className="bg-white rounded-3xl p-6 border border-[#d9e3ea] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-[#e6ad3d]">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-black text-[#102d4f]">
                Live Scientific & Technological Breakthroughs
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live scientific developments & telemedicine updates matched to your academic courses
            </p>
          </div>
          <button
            onClick={() => onNavigate('study')}
            className="text-xs font-extrabold text-[#1e6fa8] hover:text-[#165582] flex items-center gap-1 self-start sm:self-auto"
          >
            Explore All Materials & Feeds →
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {breakthroughs.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200/80 hover:border-[#1e6fa8] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e5f2fb] text-[#1e6fa8]">
                    {item.field}
                  </span>
                  <span className="text-[11px] text-slate-400">{item.publishedDate}</span>
                </div>
                <h3 className="text-sm font-extrabold text-[#102d4f] mt-2 leading-snug">
                  {item.headline}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                  {item.summary}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 italic">
                  Course discussion: "{item.relevantCourses.join(', ')}"
                </span>
                <button
                  onClick={() => onNavigate('study')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[#102d4f] text-[11px] font-bold hover:bg-slate-50"
                >
                  Read & Discuss
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
