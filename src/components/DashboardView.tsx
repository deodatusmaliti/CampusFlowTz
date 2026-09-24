import React, { useState, useMemo } from 'react';
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
  Sparkles,
  Scale,
  Dna,
  Cpu,
  Stethoscope,
  Globe2,
  ChevronRight,
  ExternalLink,
  BookCheck,
  RefreshCw,
  Info,
  QrCode,
  FolderDown,
  Video,
  Users,
  HeartHandshake,
  Briefcase,
  BellRing
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
import { Course, CalendarEvent, Task, User as UserType, Announcement, ScientificBreakthrough, AcademicSubjectCategory } from '../types';
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
  onOpenFeedStory?: (story: ScientificBreakthrough) => void;
  onRefreshFeeds?: (category?: string) => void;
  isRefreshingFeeds?: boolean;
  lastFeedFetched?: number;
  feedMode?: string;
  onOpenFeedInfo?: () => void;
  onOpenTimezoneSettings?: () => void;
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
  onOpenFeedStory,
  onRefreshFeeds,
  isRefreshingFeeds = false,
  lastFeedFetched,
  feedMode = 'gemini_ai_live',
  onOpenFeedInfo,
  onOpenTimezoneSettings,
}) => {
  // Detect current user's academic subject category
  const detectedSubject: AcademicSubjectCategory = useMemo(() => {
    if (currentUser.subjectCategory) return currentUser.subjectCategory;
    const prog = (currentUser.programme || '').toLowerCase();
    if (prog.includes('law') || prog.includes('llb') || prog.includes('jurisprudence')) return 'law';
    if (prog.includes('engineer') || prog.includes('tech') || prog.includes('computer') || prog.includes('ict')) return 'engineering';
    if (prog.includes('medicine') || prog.includes('pharmacy') || prog.includes('nursing') || prog.includes('clinical') || prog.includes('health')) return 'health';
    if (prog.includes('business') || prog.includes('bba') || prog.includes('accounting') || prog.includes('finance') || prog.includes('economics')) return 'business';
    if (prog.includes('arts') || prog.includes('humanities') || prog.includes('social') || prog.includes('education')) return 'humanities';
    return 'science';
  }, [currentUser.subjectCategory, currentUser.programme]);

  const [activeFeedCategory, setActiveFeedCategory] = useState<AcademicSubjectCategory | 'all' | 'recommended'>('recommended');

  const filteredBreakthroughs = useMemo(() => {
    if (activeFeedCategory === 'recommended') {
      const recs = breakthroughs.filter(b => b.subjectCategory === detectedSubject);
      return recs.length > 0 ? recs : breakthroughs;
    }
    if (activeFeedCategory === 'all') {
      return breakthroughs;
    }
    return breakthroughs.filter(b => b.subjectCategory === activeFeedCategory);
  }, [breakthroughs, activeFeedCategory, detectedSubject]);

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

  const getSubjectBadge = (cat?: AcademicSubjectCategory) => {
    switch (cat) {
      case 'law':
        return { label: 'Law & Justice', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'science':
        return { label: 'Life Sciences', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'engineering':
        return { label: 'Engineering & Tech', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'business':
        return { label: 'Business & Finance', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'health':
        return { label: 'Medicine & Health', bg: 'bg-rose-100 text-rose-900 border-rose-300' };
      case 'humanities':
        return { label: 'Humanities', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      default:
        return { label: 'Academic Feed', bg: 'bg-sky-100 text-sky-900 border-sky-300' };
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      {/* Urgent Announcement Alert Strip */}
      {announcements.some(a => (a.priority === 'urgent' || a.priority === 'venue_change') && !a.acknowledged) && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
              🚨
            </div>
            <div>
              <span className="text-[11px] uppercase font-black tracking-wider text-amber-950 bg-amber-200/90 px-2 py-0.5 rounded">
                Live Campus Alert
              </span>
              <p className="text-sm font-black text-slate-900 mt-0.5">
                {announcements.find(a => (a.priority === 'urgent' || a.priority === 'venue_change') && !a.acknowledged)?.title}
              </p>
              <p className="text-xs text-slate-700 font-medium line-clamp-2">
                {announcements.find(a => (a.priority === 'urgent' || a.priority === 'venue_change') && !a.acknowledged)?.content}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {onOpenCreateAnnouncement && (
              <button
                onClick={onOpenCreateAnnouncement}
                className="px-3 py-1.5 rounded-lg bg-white border border-amber-400 text-amber-950 hover:bg-amber-100 text-xs font-bold transition-colors shadow-2xs"
              >
                Broadcast
              </button>
            )}
            <button
              onClick={() => onNavigate('timetable')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Check Timetable
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-sky-900 p-4 sm:p-7 text-white shadow-lg border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-amber-300 mb-2.5 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" /> High-Performance Higher Ed Portal · {currentUser.university}
          </div>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white">
            Plan your semester with total confidence.
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            Lectures, examination timetables, Tanzanian GePG fee tracking, GPA projections, and student communities — all synchronized offline & cloud-ready.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 sm:gap-2.5">
            <button
              id="hero-view-timetable-btn"
              onClick={() => onNavigate('timetable')}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4 text-slate-950 stroke-[2.5]" /> Semester Timetable
            </button>
            <button
              id="hero-view-courses-btn"
              onClick={() => onNavigate('courses')}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5 backdrop-blur-xs border border-white/20"
            >
              <BookOpen className="w-4 h-4 stroke-[2.5]" /> View My Courses
            </button>
            <button
              id="hero-study-feed-btn"
              onClick={() => onNavigate('study')}
              className="px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-600 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5 border border-sky-500/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Study & Feeds
            </button>
            <button
              id="hero-check-gpa-btn"
              onClick={() => onNavigate('gpa')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold backdrop-blur-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4" /> Check GPA
            </button>
            {onOpenUniversityPicker && (
              <button
                id="hero-change-uni-btn"
                onClick={onOpenUniversityPicker}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Current GPA */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-sky-500 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span>Cumulative GPA</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{currentGpa.toFixed(2)}</span>
            <span className="text-xs font-bold text-slate-500">/ 5.00</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-bold">Upper 2nd Class</span>
            <span className="text-slate-600 font-semibold">Target 4.00</span>
          </div>
        </div>

        {/* Metric 2: Credits Completed */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-sky-500 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span>Credits Completed</span>
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-sky-800">42</span>
            <span className="text-xs font-bold text-slate-500">/ 120 Total</span>
          </div>
          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-sky-600 h-2 rounded-full" style={{ width: '35%' }}></div>
          </div>
        </div>

        {/* Metric 3: Next Assessment */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-sky-500 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span>Next Assessment</span>
            <div className="w-7 h-7 rounded-lg bg-red-100 text-red-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-red-600">3 Days</span>
          </div>
          <p className="mt-2 text-[11px] font-bold text-slate-700 truncate">
            ZOO 201 Written CAT 1
          </p>
        </div>

        {/* Metric 4: Average Attendance */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-sky-500 hover:shadow-md transition-all cursor-pointer group"
          title="Click to open QR Attendance Scanner & Records"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span className="group-hover:text-sky-700 transition-colors">Lecture Attendance</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">{avgAttendance}%</span>
            <span className="text-xs font-bold text-emerald-800">Eligible</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-600">Min 75% required</span>
            <span className="text-sky-700 group-hover:underline flex items-center gap-0.5">QR Scan →</span>
          </div>
        </div>
      </div>

      {/* Quick Access Campus & Academic Services Hub */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
            <h2 className="text-sm sm:text-base font-black text-slate-900">Academic & Campus Life Services</h2>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">Active Semester Modules</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          <button
            onClick={() => onNavigate('attendance')}
            className="p-3 rounded-xl border border-slate-200 hover:border-sky-400 bg-sky-50/50 hover:bg-sky-50 flex flex-col items-center text-center transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <QrCode className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-sky-800">QR Attendance</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Scan & Codes</span>
          </button>

          <button
            onClick={() => onNavigate('materials')}
            className="p-3 rounded-xl border border-slate-200 hover:border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50 flex flex-col items-center text-center transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <FolderDown className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">Materials</span>
            <span className="text-[10px] text-slate-500 mt-0.5">PDFs & Notes</span>
          </button>

          <button
            onClick={() => onNavigate('discussions')}
            className="p-3 rounded-xl border border-slate-200 hover:border-purple-400 bg-purple-50/40 hover:bg-purple-50 flex flex-col items-center text-center transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Video className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-purple-800">Study Calls</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Meet & Pods</span>
          </button>

          <button
            onClick={() => onNavigate('course-enrollment')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50 flex flex-col items-center text-center transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-800">Enrollment</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Courses & Syllabi</span>
          </button>

          <button
            onClick={() => onNavigate('network')}
            className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 bg-amber-50/40 hover:bg-amber-50 flex flex-col items-center text-center transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-amber-800">Peer Network</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Pods & Profiles</span>
          </button>

          <button
            onClick={() => onNavigate('leisure')}
            className="p-3 rounded-xl border border-slate-200 hover:border-rose-400 bg-rose-50/40 hover:bg-rose-50 flex flex-col items-center text-center transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-rose-800">Campus Life</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Events & Sports</span>
          </button>

          <button
            onClick={() => onNavigate('opportunities')}
            className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-teal-50/40 hover:bg-teal-50 flex flex-col items-center text-center transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-teal-800">Opportunities</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Jobs & Grants</span>
          </button>

          <button
            onClick={() => onNavigate('alerts')}
            className="p-3 rounded-xl border border-slate-200 hover:border-orange-400 bg-orange-50/40 hover:bg-orange-50 flex flex-col items-center text-center transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <BellRing className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-orange-800">Alerts & Chimes</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Sound Rules</span>
          </button>
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        {/* GPA Trajectory Chart */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-slate-900">GPA Trajectory & Projections</h2>
              <p className="text-xs text-slate-600 font-medium">Historical performance vs 4.00 First-Class target</p>
            </div>
            <button
              onClick={() => onNavigate('gpa')}
              className="text-xs font-bold text-sky-800 hover:underline flex items-center gap-1 shrink-0"
            >
              Simulate <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-60 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gpaTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="semester" tick={{ fontSize: 11, fill: '#334155' }} />
                <YAxis domain={[3.0, 4.5]} tick={{ fontSize: 11, fill: '#334155' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: 8, color: '#fff', fontSize: 12 }} 
                />
                <Area type="monotone" dataKey="gpa" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#gpaGradient)" name="Actual GPA" />
                <Area type="monotone" dataKey="target" stroke="#eab308" strokeDasharray="4 4" strokeWidth={2} fill="transparent" name="First Class Target" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Performance Breakdown Chart */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Course Marks & Attendance (%)</h2>
              <p className="text-xs text-slate-600 font-medium">Continuous Assessment & lab presence</p>
            </div>
            <button
              onClick={() => onNavigate('courses')}
              className="text-xs font-bold text-sky-800 hover:underline flex items-center gap-1 shrink-0"
            >
              All Courses <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-60 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coursePerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#334155' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#334155' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: 8, color: '#fff', fontSize: 12 }} 
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />
                <Bar dataKey="Score" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Attendance" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Today's Schedule + Assessment Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">Today on Campus</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                  Monday 21 September
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">Scheduled lectures, labs & personal activities</p>
            </div>

            <button
              onClick={onOpenAddEvent}
              className="px-3 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Add Activity
            </button>
          </div>

          <div className="space-y-2.5">
            {todayEvents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-600">No events scheduled for today.</p>
                <button
                  onClick={onOpenAddEvent}
                  className="mt-2 text-xs font-bold text-sky-800 hover:underline"
                >
                  + Add study or revision session
                </button>
              </div>
            ) : (
              todayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-[#fbfdff] hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-900 flex flex-col items-center justify-center font-bold text-xs shrink-0">
                      <span>{ev.startTime}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{ev.title}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-800">
                          {ev.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5 text-xs text-slate-600 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" /> {ev.location}
                        </span>
                        {ev.description && (
                          <span className="text-slate-700 truncate max-w-xs">{ev.description}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onNavigate('calendar')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-sky-900 bg-sky-100 hover:bg-sky-200 transition-colors"
                    >
                      View Hall
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Priority Assessments Watchlist */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-slate-900">Assessments & CATs</h2>
                <p className="text-xs text-slate-600 font-medium">Continuous assessments weights</p>
              </div>
              <button
                id="dashboard-add-task-btn"
                onClick={onOpenAddTask}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 flex items-center justify-center transition-colors"
                title="Add Assessment Task"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">{task.title}</span>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600 font-semibold">
                      <span className="font-black text-sky-800">{task.courseCode}</span>
                      <span>•</span>
                      <span>Due {task.dueDate}</span>
                      <span>•</span>
                      <span className="font-black text-amber-800">{task.weight}% CAT</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onCompleteTask(task.id)}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors shrink-0"
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
            className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold text-center transition-colors"
          >
            Manage All Assessments & Rubrics
          </button>
        </div>
      </div>

      {/* Multi-Subject Academic News & Feeds Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        {/* Header & Description */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Personalized Academic Feeds & Research
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                {currentUser.programme ? `${currentUser.programme} (${detectedSubject.toUpperCase()})` : detectedSubject.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1">
              AI-synthesized research breakthroughs, East African legal judgments, clinical trials, and engineering models mapped to your courses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {onOpenFeedInfo && (
              <button
                type="button"
                onClick={onOpenFeedInfo}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-2xs"
                title="View how feeds are fetched and update frequency"
              >
                <Info className="w-3.5 h-3.5 text-sky-700" />
                <span>How Feeds Work</span>
              </button>
            )}

            {onRefreshFeeds && (
              <button
                type="button"
                onClick={() => onRefreshFeeds(activeFeedCategory)}
                disabled={isRefreshingFeeds}
                className="px-3 py-1.5 rounded-xl bg-sky-800 hover:bg-sky-900 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-50"
                title="Fetch latest AI feeds for your course syllabus"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingFeeds ? 'animate-spin' : ''}`} />
                <span>{isRefreshingFeeds ? 'Fetching...' : 'Refresh Feeds'}</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('study')}
              className="text-xs font-extrabold text-sky-800 hover:text-sky-950 flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-sky-50 transition-colors"
            >
              <span>All Syllabus</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Pills for Subjects */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 text-xs font-bold mobile-scroll-container">
          <button
            onClick={() => {
              setActiveFeedCategory('recommended');
              if (onRefreshFeeds) onRefreshFeeds('recommended');
            }}
            className={`px-3 py-1.5 rounded-xl shrink-0 transition-all ${
              activeFeedCategory === 'recommended'
                ? 'bg-sky-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🎯 Recommended for My Field ({detectedSubject.toUpperCase()})
          </button>
          <button
            onClick={() => {
              setActiveFeedCategory('all');
              if (onRefreshFeeds) onRefreshFeeds('all');
            }}
            className={`px-3 py-1.5 rounded-xl shrink-0 transition-all ${
              activeFeedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🌐 All Subjects ({breakthroughs.length})
          </button>
          <button
            onClick={() => {
              setActiveFeedCategory('law');
              if (onRefreshFeeds) onRefreshFeeds('law');
            }}
            className={`px-3 py-1.5 rounded-xl shrink-0 transition-all flex items-center gap-1 ${
              activeFeedCategory === 'law'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" /> Law
          </button>
          <button
            onClick={() => {
              setActiveFeedCategory('science');
              if (onRefreshFeeds) onRefreshFeeds('science');
            }}
            className={`px-3 py-1.5 rounded-xl shrink-0 transition-all flex items-center gap-1 ${
              activeFeedCategory === 'science'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Dna className="w-3.5 h-3.5" /> Science
          </button>
          <button
            onClick={() => {
              setActiveFeedCategory('engineering');
              if (onRefreshFeeds) onRefreshFeeds('engineering');
            }}
            className={`px-3 py-1.5 rounded-xl shrink-0 transition-all flex items-center gap-1 ${
              activeFeedCategory === 'engineering'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Engineering & Tech
          </button>
          <button
            onClick={() => {
              setActiveFeedCategory('business');
              if (onRefreshFeeds) onRefreshFeeds('business');
            }}
            className={`px-3 py-1.5 rounded-xl shrink-0 transition-all flex items-center gap-1 ${
              activeFeedCategory === 'business'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Business & Econ
          </button>
          <button
            onClick={() => {
              setActiveFeedCategory('health');
              if (onRefreshFeeds) onRefreshFeeds('health');
            }}
            className={`px-3 py-1.5 rounded-xl shrink-0 transition-all flex items-center gap-1 ${
              activeFeedCategory === 'health'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> Health & Med
          </button>
          <button
            onClick={() => {
              setActiveFeedCategory('humanities');
              if (onRefreshFeeds) onRefreshFeeds('humanities');
            }}
            className={`px-3 py-1.5 rounded-xl shrink-0 transition-all flex items-center gap-1 ${
              activeFeedCategory === 'humanities'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" /> Humanities
          </button>
        </div>

        {/* Feed Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {filteredBreakthroughs.map((item) => {
            const badge = getSubjectBadge(item.subjectCategory);

            return (
              <div
                key={item.id}
                onClick={() => onOpenFeedStory && onOpenFeedStory(item)}
                className="p-4 sm:p-5 rounded-2xl bg-[#fbfdff] border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {item.readingTime || '4 min read'} • {item.publishedDate}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-900 mt-2.5 leading-snug group-hover:text-sky-800 transition-colors">
                    {item.headline}
                  </h3>

                  <p className="text-xs text-slate-700 font-normal mt-2 leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>

                  {/* Highlights info pills */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {item.keyTakeaways && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {item.keyTakeaways.length} Key Takeaways
                      </span>
                    )}
                    {item.recommendedReadings && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        <BookCheck className="w-3 h-3 text-sky-600" />
                        {item.recommendedReadings.length} Readings
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold truncate max-w-[180px] sm:max-w-xs">
                    Source: <b className="text-slate-800">{item.source}</b>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenFeedStory) onOpenFeedStory(item);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-xs"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
