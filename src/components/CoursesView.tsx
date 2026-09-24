import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  MapPin, 
  User, 
  Clock, 
  Sparkles,
  Share2,
  HelpCircle,
  Printer,
  Mail,
  Copy
} from 'lucide-react';
import { Course, User as UserType } from '../types';

interface CoursesViewProps {
  courses: Course[];
  currentUser: UserType;
  onAddCourse: (course: Course) => void;
  onRemoveCourse: (id: string) => void;
  onNavigateToCommunity: (courseCode: string) => void;
  onNavigateToShare: (courseCode: string) => void;
  onOpenCourseChat?: (course: Course) => void;
  onNavigateToStudy?: (courseCode?: string) => void;
  onLoadMedicineDemo: () => void;
  onNotify: (msg: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  currentUser,
  onAddCourse,
  onRemoveCourse,
  onNavigateToCommunity,
  onNavigateToShare,
  onOpenCourseChat,
  onNavigateToStudy,
  onLoadMedicineDemo,
  onNotify,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Form states for adding course
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [credits, setCredits] = useState(12);
  const [year, setYear] = useState(currentUser.currentYear || 2);
  const [semester, setSemester] = useState('Semester 1');
  const [lecturer, setLecturer] = useState('');
  const [hall, setHall] = useState('');
  const [schedule, setSchedule] = useState('');
  const [score, setScore] = useState(65);
  const [attendance, setAttendance] = useState(88);
  const [notes, setNotes] = useState('');

  // At-risk courses (< 50% score or < 75% attendance)
  const atRiskCourses = courses.filter((c) => c.currentScore < 50 || c.attendance < 75);

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) return;

    const newCourse: Course = {
      id: 'c_' + Date.now(),
      code: code.trim().toUpperCase(),
      title: title.trim(),
      credits: Number(credits),
      year: Number(year),
      semester,
      lecturer: lecturer.trim() || 'Faculty Lecturer',
      hall: hall.trim() || 'Main Campus Hall',
      schedule: schedule.trim() || 'TBA',
      currentScore: Number(score),
      attendance: Number(attendance),
      notes: notes.trim(),
      color: '#1e6fa8',
      category: 'Core',
    };

    onAddCourse(newCourse);
    setShowAddForm(false);
    // Reset
    setCode('');
    setTitle('');
    setLecturer('');
    setHall('');
    setSchedule('');
    setNotes('');
  };

  const handlePrintCourses = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Course Catalogue & Syllabus - ${currentUser.university}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
              h1 { font-size: 22px; font-weight: 900; margin: 0 0 6px 0; color: #0369a1; }
              .sub { color: #64748b; font-size: 13px; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
              th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
              th { background: #f1f5f9; font-weight: 800; }
              tr:nth-child(even) { background: #f8fafc; }
              .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; }
            </style>
          </head>
          <body>
            <h1>${currentUser.university} • Enrolled Course Catalogue</h1>
            <div class="sub">Student: ${currentUser.name} (${currentUser.programme}, Year ${currentUser.currentYear})</div>
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Credits</th>
                  <th>Lecturer</th>
                  <th>Hall</th>
                  <th>Schedule</th>
                  <th>CAT Score</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                ${courses.map(c => `
                  <tr>
                    <td><strong>${c.code}</strong></td>
                    <td><strong>${c.title}</strong></td>
                    <td>${c.credits || 12}</td>
                    <td>${c.lecturer || 'TBA'}</td>
                    <td>${c.hall || 'TBA'}</td>
                    <td>${c.schedule || 'TBA'}</td>
                    <td>${c.currentScore}%</td>
                    <td>${c.attendance}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer">Printed from CampusFlow TZ • ${new Date().toLocaleDateString()}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      onNotify('Course catalogue print layout generated.');
    } else {
      window.print();
    }
  };

  const handleShareWhatsApp = (course: Course) => {
    const text = `📚 *CampusFlow TZ Course Details*\n*${course.code}: ${course.title}*\nLecturer: ${course.lecturer}\nVenue: ${course.hall}\nSchedule: ${course.schedule}\nAttendance: ${course.attendance}%`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    onNotify(`Sharing "${course.code}" via WhatsApp...`);
  };

  const handleShareEmail = (course: Course) => {
    const subject = `Course Syllabus & Details: ${course.code} - ${course.title}`;
    const body = `Hello,\n\nCourse Information on CampusFlow TZ:\n\nCourse: ${course.code} - ${course.title}\nLecturer: ${course.lecturer}\nLecture Hall: ${course.hall}\nSchedule: ${course.schedule}\nCredits: ${course.credits}\nNotes: ${course.notes || 'None'}\n`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    onNotify(`Opening email client to share "${course.code}"...`);
  };

  const handleCopyCourse = (course: Course) => {
    const str = `${course.code}: ${course.title} | Lecturer: ${course.lecturer} | Hall: ${course.hall} | Schedule: ${course.schedule}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(str);
    }
    onNotify(`Course info for "${course.code}" copied to clipboard!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#d9e3ea] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 uppercase tracking-wider">
            {currentUser.programme} · Year {currentUser.currentYear}
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102d4f] mt-1">
            Course Catalogue & Academic Coach
          </h1>
          <p className="text-xs text-slate-500">
            Syllabus tracking, continuous assessment marks, lecture halls and attendance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrintCourses}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Print course catalogue and syllabus"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" /> Print Catalogue
          </button>

          <button
            onClick={onLoadMedicineDemo}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Populate Year 1–5 medical curriculum demo"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Load 5-Year Medicine Demo
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-xl bg-[#1e6fa8] hover:bg-[#185a8a] text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Add Course
          </button>
        </div>
      </div>

      {/* Academic Coach Guidance Card */}
      <div className="bg-gradient-to-r from-[#102d4f] to-[#1e5888] rounded-2xl p-5 text-white shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#e6ad3d] uppercase tracking-wider">
                Academic Progress & Retention Coach
              </span>
              {atRiskCourses.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                  {atRiskCourses.length} Course At Risk
                </span>
              )}
            </div>
            <p className="text-sm font-bold">
              {atRiskCourses.length === 0
                ? 'All courses are currently in good standing above the 50% pass mark and 75% attendance threshold.'
                : `Action required for ${atRiskCourses.map((c) => c.code).join(', ')}: attend revision practicals and submit pending CATs.`}
            </p>
            <p className="text-xs text-slate-200 mt-1">
              Tanzanian universities require a minimum of 75% lecture & lab attendance to qualify for University Final Examinations.
            </p>
          </div>
        </div>
      </div>

      {/* Add Course Form (Collapsible) */}
      {showAddForm && (
        <form onSubmit={handleSaveCourse} className="bg-white p-5 rounded-2xl border-2 border-[#1e6fa8] shadow-md animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-base font-bold text-[#102d4f]">Register New Course to Catalogue</h2>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. BMS 204 or LAW 101"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Human Anatomy I or Biostatistics"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Credits</label>
              <input
                type="number"
                min={1}
                max={30}
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              >
                {[1, 2, 3, 4, 5, 6].map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              >
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Score (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lecturer</label>
              <input
                type="text"
                placeholder="Dr. A. Mushi"
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lecture Hall</label>
              <input
                type="text"
                placeholder="Science Block B204"
                value={hall}
                onChange={(e) => setHall(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Weekly Schedule</label>
              <input
                type="text"
                placeholder="Mon & Thu 10:00–12:00"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">Syllabus & Practical Notes</label>
            <input
              type="text"
              placeholder="Core topics, laboratory equipment, references..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1e6fa8] hover:bg-[#185a8a] text-white text-xs font-bold shadow-sm"
            >
              Save Course to Catalogue
            </button>
          </div>
        </form>
      )}

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course) => {
          const isAtRisk = course.currentScore < 50 || course.attendance < 75;
          return (
            <div
              key={course.id}
              className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md flex flex-col justify-between ${
                isAtRisk ? 'border-amber-300 bg-amber-50/20' : 'border-[#d9e3ea]'
              }`}
            >
              <div>
                {/* Card Top Line */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#e5f2fb] text-[#1e6fa8] font-black text-xs">
                      {course.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {course.credits} Credits · Year {course.year}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveCourse(course.id)}
                    className="p-1 text-slate-300 hover:text-red-500 rounded"
                    title="Remove Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h2 className="text-base font-bold text-[#102d4f] mt-2.5 leading-snug">
                  {course.title}
                </h2>

                {/* Details list */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-700">{course.lecturer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{course.hall}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{course.schedule}</span>
                  </div>
                </div>

                {course.notes && (
                  <p className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
                    "{course.notes}"
                  </p>
                )}

                {/* Score & Attendance Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                  <div className="p-2 rounded-lg bg-[#f5f8fb]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">CAT Score</span>
                    <span className={`text-base font-extrabold ${course.currentScore < 50 ? 'text-red-600' : 'text-[#102d4f]'}`}>
                      {course.currentScore}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#f5f8fb]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance</span>
                    <span className={`text-base font-extrabold ${course.attendance < 75 ? 'text-amber-600' : 'text-emerald-700'}`}>
                      {course.attendance}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenCourseChat ? onOpenCourseChat(course) : onNavigateToCommunity(course.code)}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#e6ad3d]" /> Course Mates Chat & Alerts
                  </button>
                  {onNavigateToStudy && (
                    <button
                      onClick={() => onNavigateToStudy(course.code)}
                      className="py-2 px-3 rounded-xl bg-[#e5f2fb] hover:bg-[#d0e8f8] text-[#1e6fa8] text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Study Materials & Past Papers"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Notes
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => handleShareWhatsApp(course)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-emerald-800 hover:bg-emerald-50 text-xs font-semibold transition-colors"
                    title="Share course on WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleShareEmail(course)}
                    className="p-1.5 rounded-lg text-sky-800 hover:bg-sky-50 transition-colors"
                    title="Share course via Email"
                  >
                    <Mail className="w-3.5 h-3.5 text-sky-600" />
                  </button>

                  <button
                    onClick={() => handleCopyCourse(course)}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Copy course details"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onRemoveCourse(course.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove from catalogue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
