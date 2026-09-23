import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  PlusCircle, 
  MinusCircle, 
  Search, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  UserCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  Layers, 
  Award, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Info
} from 'lucide-react';
import { Course, User } from '../types';
import { StorageService } from '../services/storageService';
import { EndorsementButton } from './EndorsementButton';

interface CourseEnrollmentViewProps {
  user: User;
  courses: Course[];
  onCoursesUpdated: (updatedCourses: Course[]) => void;
  onNotify: (msg: string) => void;
}

export const CourseEnrollmentView: React.FC<CourseEnrollmentViewProps> = ({
  user,
  courses,
  onCoursesUpdated,
  onNotify,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState<number | 'ALL'>('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'enrolled' | 'available'>('ALL');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(courses[0]?.id || null);

  // Extract unique departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    courses.forEach(c => {
      if (c.department) set.add(c.department);
    });
    return Array.from(set);
  }, [courses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      if (departmentFilter !== 'ALL' && c.department !== departmentFilter) return false;
      if (yearFilter !== 'ALL' && c.year !== yearFilter) return false;
      if (semesterFilter !== 'ALL' && c.semester !== semesterFilter) return false;
      if (statusFilter === 'enrolled' && c.enrollmentStatus !== 'enrolled') return false;
      if (statusFilter === 'available' && c.enrollmentStatus === 'enrolled') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = c.code.toLowerCase().includes(q);
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchLecturer = c.lecturer.toLowerCase().includes(q);
        const matchDept = (c.department || '').toLowerCase().includes(q);
        const matchTopics = (c.syllabus || []).some(s => s.toLowerCase().includes(q));
        return matchCode || matchTitle || matchLecturer || matchDept || matchTopics;
      }
      return true;
    });
  }, [courses, departmentFilter, yearFilter, semesterFilter, statusFilter, searchQuery]);

  // Statistics
  const enrolledCourses = courses.filter(c => c.enrollmentStatus === 'enrolled');
  const totalCredits = enrolledCourses.reduce((sum, c) => sum + (c.credits || 3), 0);

  // Handlers
  const handleEnroll = (course: Course) => {
    if (course.enrollmentStatus === 'enrolled') return;

    if (totalCredits + (course.credits || 3) > 30) {
      onNotify('Credit limit exceeded! Maximum semester load is 30 credits.');
      return;
    }

    const updated = StorageService.enrollInCourse(course.id);
    onCoursesUpdated(updated);

    // Create System Alert
    StorageService.addSystemAlert({
      title: `Enrolled: ${course.code}`,
      message: `You are officially registered for ${course.title} (${course.credits || 3} credits) with ${course.lecturer}.`,
      category: 'lectures',
      priority: 'normal',
      sourceType: 'server_push',
      actionTab: 'enrollment',
      actionLabel: 'View Course',
    });

    onNotify(`Successfully enrolled in ${course.code} - ${course.title}!`);
  };

  const handleDrop = (course: Course) => {
    if (window.confirm(`Are you sure you want to drop ${course.code} (${course.title})?`)) {
      const updated = StorageService.dropCourse(course.id);
      onCoursesUpdated(updated);
      onNotify(`Course ${course.code} dropped.`);
    }
  };

  const handleToggleBookmark = (courseId: string) => {
    const updated = StorageService.toggleBookmarkCourse(courseId);
    onCoursesUpdated(updated);
    const item = updated.find(c => c.id === courseId);
    onNotify(item?.isBookmarked ? `Bookmarked course ${item.code}.` : `Removed bookmark for ${item?.code}.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
              Course Enrollment & Syllabus Hub
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-semibold">
              Academic Year 2025/2026
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Courses, Syllabus & Enrollment Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Explore university curricula, check prerequisites, view assessment weightings, and manage your semester registration.
          </p>
        </div>

        {/* Enrollment Quick Stats */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl shrink-0">
          <div className="text-right">
            <div className="text-[11px] uppercase font-bold text-slate-400">Registered Load</div>
            <div className="text-sm font-black text-slate-900">
              {enrolledCourses.length} Courses • <span className="text-sky-600">{totalCredits} Credits</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black text-sm">
            {totalCredits}/30
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course code (e.g. ZOO 201), lecturer, or syllabus topic..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'enrolled' | 'available')}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none text-slate-700"
            >
              <option value="ALL">All Status</option>
              <option value="enrolled">Enrolled Only</option>
              <option value="available">Available to Enroll</option>
            </select>

            {/* Department */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none text-slate-700"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Year */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none text-slate-700"
            >
              <option value="ALL">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
              <option value="5">Year 5</option>
            </select>

            {/* Semester */}
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none text-slate-700"
            >
              <option value="ALL">All Semesters</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing <b>{filteredCourses.length}</b> courses in catalogue</span>
          <span className="text-[11px] text-slate-400">Click any course to inspect complete syllabus & assessment breakdown</span>
        </div>
      </div>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No courses match your query</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try adjusting your search filters or resetting to "All Departments".
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => {
            const isEnrolled = course.enrollmentStatus === 'enrolled';
            const isExpanded = expandedCourseId === course.id;

            return (
              <div
                key={course.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                  isEnrolled 
                    ? 'border-emerald-300/80 ring-1 ring-emerald-500/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Course Header Bar */}
                <div 
                  onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border ${
                      isEnrolled 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-sky-50 text-sky-700 border-sky-200'
                    }`}>
                      {course.code.split(' ')[0]}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{course.code}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-semibold text-slate-500">{course.department || 'Academic Department'}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                          {course.credits || 3} Credits
                        </span>
                        {isEnrolled && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Enrolled
                          </span>
                        )}
                      </div>

                      <h2 className="text-base font-bold text-slate-900 truncate">
                        {course.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>Lecturer: <b className="text-slate-700">{course.lecturer}</b></span>
                        <span>•</span>
                        <span>Year {course.year || 2}, {course.semester || 'Semester 1'}</span>
                        <span>•</span>
                        <span>{course.schedule || 'TBA'}</span>
                        <span>•</span>
                        <span>Enrolled: <b>{course.enrolledCount || 85}</b> students</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Chevron */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleToggleBookmark(course.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        course.isBookmarked 
                          ? 'bg-amber-50 text-amber-500' 
                          : 'bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                      title={course.isBookmarked ? 'Remove bookmark' : 'Bookmark course'}
                    >
                      <Bookmark className={`w-4 h-4 ${course.isBookmarked ? 'fill-amber-500' : ''}`} />
                    </button>

                    {isEnrolled ? (
                      <button
                        onClick={() => handleDrop(course)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors"
                      >
                        <MinusCircle className="w-4 h-4" />
                        <span>Drop Course</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Enroll Now</span>
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                      className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel: Syllabus, Lecturer Info, Assessment, Endorsement */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-4 animate-fade-in">
                    {/* Course Overview & Prereqs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                          <span>Lecturer & Office Hours</span>
                        </div>
                        <p className="text-slate-700 font-semibold">{course.lecturer}</p>
                        <p className="text-slate-500">Email: {course.lecturerEmail || `${course.lecturer.toLowerCase().replace(/[^a-z]/g, '')}@udsm.ac.tz`}</p>
                        <p className="text-slate-500">Office: {course.officeHours || 'Tues & Thurs 14:00 - 16:00 (Biology Block Rm 14)'}</p>
                        
                        {/* Lecturer Endorsement */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">Endorse Instructor:</span>
                          <EndorsementButton
                            targetId={`lec_${course.lecturer}`}
                            targetType="lecturer"
                            targetTitle={course.lecturer}
                            currentUser={user}
                            onNotify={onNotify}
                            size="sm"
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Prerequisites & Requirements</span>
                        </div>
                        <p className="text-slate-600">
                          Prerequisites: <b>{course.prerequisites?.join(', ') || 'General University Science Entry Requirements'}</b>
                        </p>
                        <p className="text-slate-600">
                          Class Capacity: <b>{course.capacity || 150} Students</b> ({course.enrolledCount || 85} enrolled)
                        </p>
                        <p className="text-slate-600">
                          Venue: <b>{course.venue || 'Lecture Theatre 2 (LT2)'}</b>
                        </p>

                        {/* Course Endorsement */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">Endorse Course:</span>
                          <EndorsementButton
                            targetId={course.id}
                            targetType="course"
                            targetTitle={`${course.code} - ${course.title}`}
                            currentUser={user}
                            onNotify={onNotify}
                            size="sm"
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span>Assessment Breakdown</span>
                        </div>
                        <div className="space-y-1 text-[11px] text-slate-600">
                          <div className="flex justify-between">
                            <span>Continuous Assessment Test 1 (CAT 1):</span>
                            <b>{course.assessmentBreakdown?.test1 || '15%'}</b>
                          </div>
                          <div className="flex justify-between">
                            <span>Continuous Assessment Test 2 (CAT 2):</span>
                            <b>{course.assessmentBreakdown?.test2 || '15%'}</b>
                          </div>
                          <div className="flex justify-between">
                            <span>Practicals & Lab Reports:</span>
                            <b>{course.assessmentBreakdown?.practicals || '20%'}</b>
                          </div>
                          <div className="flex justify-between border-t border-slate-100 pt-1 font-bold text-slate-900">
                            <span>University Final Examination (UE):</span>
                            <b>{course.assessmentBreakdown?.finalExam || '50%'}</b>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Syllabus Outline */}
                    {course.syllabus && course.syllabus.length > 0 && (
                      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                        <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                          <span>Curriculum & Weekly Syllabus Outline</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
                          {course.syllabus.map((topic, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-50">
                              <span className="font-bold text-sky-600 shrink-0">W{idx + 1}.</span>
                              <span className="leading-snug">{topic}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
