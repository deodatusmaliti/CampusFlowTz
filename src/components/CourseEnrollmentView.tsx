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
  Info,
  Edit3,
  Trash2,
  Share2,
  Mail,
  MessageSquare,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  Plus,
  X,
  CalendarPlus,
  Building,
  FileText
} from 'lucide-react';
import { 
  Course, 
  User, 
  CourseCategoryOption, 
  CourseAcademicStatus, 
  CourseRelatedAssessmentDate,
  TimetableSlot,
  InstitutionCreditConfig,
  CreditSystemType
} from '../types';
import { StorageService } from '../services/storageService';
import { EndorsementButton } from './EndorsementButton';
import { STANDARD_DEMO_COURSES } from '../data/demoCourses';

interface CourseEnrollmentViewProps {
  user: User;
  courses: Course[];
  onCoursesUpdated: (updatedCourses: Course[]) => void;
  onNotify: (msg: string) => void;
}

const CATEGORY_OPTIONS: CourseCategoryOption[] = [
  'Lecture',
  'Laboratory/practical',
  'Tutorial',
  'Field study',
  'Seminar',
  'Clinical session',
  'Test',
  'Examination',
  'Independent study',
];

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const CourseEnrollmentView: React.FC<CourseEnrollmentViewProps> = ({
  user,
  courses,
  onCoursesUpdated,
  onNotify,
}) => {
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState<number | 'ALL'>('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'enrolled' | 'available' | 'active' | 'completed' | 'withdrawn'>('ALL');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(courses[0]?.id || null);

  // Flexible Institution Credit System (Loaded from StorageService)
  const [creditConfig, setCreditConfig] = useState<InstitutionCreditConfig>(() => StorageService.getCreditConfig());
  const [isCreditConfigModalOpen, setIsCreditConfigModalOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState<InstitutionCreditConfig>(() => StorageService.getCreditConfig());

  // Form Modal (Enroll in a course / Edit course)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // 16 Form Fields
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<CourseCategoryOption>('Lecture');
  const [formDepartment, setFormDepartment] = useState('Department of Biological Sciences');
  const [formProgramme, setFormProgramme] = useState(user.programme || 'BSc Biological Sciences');
  const [formYear, setFormYear] = useState<number>(user.currentYear || 1);
  const [formSemester, setFormSemester] = useState('Semester 1');
  const [formCredits, setFormCredits] = useState<number>(12);
  const [formLecturer, setFormLecturer] = useState('');
  const [formHall, setFormHall] = useState('');
  const [formLectureDay, setFormLectureDay] = useState('Monday');
  const [formStartTime, setFormStartTime] = useState('08:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formDescription, setFormDescription] = useState('');
  const [formPrerequisites, setFormPrerequisites] = useState('');
  const [formAssessmentStructure, setFormAssessmentStructure] = useState('Continuous Assessment: 40%, Final Examination: 60%');
  const [formNotes, setFormNotes] = useState('');

  // Form Validation & Conflict Warnings
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Related Dates Sub-Modal
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [dateTargetCourse, setDateTargetCourse] = useState<Course | null>(null);
  const [dateType, setDateType] = useState<'test' | 'assignment' | 'lab' | 'exam'>('test');
  const [dateTitle, setDateTitle] = useState('');
  const [dateDate, setDateDate] = useState('');
  const [dateTime, setDateTime] = useState('10:00');
  const [dateVenue, setDateVenue] = useState('');
  const [dateNotes, setDateNotes] = useState('');

  // Share popover tracking
  const [activeShareId, setActiveShareId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Success banner
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Extract unique departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    courses.forEach(c => {
      if (c.department) set.add(c.department);
    });
    return Array.from(set);
  }, [courses]);

  // Statistics
  const enrolledCourses = useMemo(() => {
    return courses.filter(c => c.enrollmentStatus === 'enrolled' || c.status === 'active');
  }, [courses]);

  const totalCredits = useMemo(() => {
    return enrolledCourses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
  }, [enrolledCourses]);

  const practicalCredits = useMemo(() => {
    return enrolledCourses
      .filter(c => c.courseCategory === 'Laboratory/practical' || c.courseCategory === 'Clinical session')
      .reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
  }, [enrolledCourses]);

  const weightedWorkloadUnits = useMemo(() => {
    const mult = creditConfig.practicalWeightingMultiplier || 1.0;
    const nonPractical = totalCredits - practicalCredits;
    return Math.round(nonPractical + practicalCredits * mult);
  }, [totalCredits, practicalCredits, creditConfig]);

  // Show warning ONLY when student/institution has explicitly enabled limits
  const isOverConfiguredLimit = Boolean(creditConfig.allowWarnings && totalCredits > creditConfig.normalMaxCredits);
  const isUnderConfiguredLimit = Boolean(creditConfig.allowWarnings && totalCredits < creditConfig.normalMinCredits);

  // Real-time timetable conflict detection in form
  const checkTimetableConflict = (day: string, start: string, end: string, excludeId?: string | null) => {
    const existingSlots: TimetableSlot[] = StorageService.getTimetable();
    const enrolledList = courses.filter(c => 
      (c.enrollmentStatus === 'enrolled' || c.status === 'active') && 
      c.id !== excludeId
    );

    // Helper to check hour overlap
    const timesOverlap = (s1: string, e1: string, s2: string, e2: string) => {
      return s1 < e2 && s2 < e1;
    };

    // 1. Check against enrolled courses
    for (const ec of enrolledList) {
      const cDay = ec.lectureDay || (ec.schedule ? ec.schedule.split(' ')[0] : '');
      const cStart = ec.startTime || '08:00';
      const cEnd = ec.endTime || '10:00';

      if (cDay.toLowerCase() === day.toLowerCase() && timesOverlap(start, end, cStart, cEnd)) {
        return `Schedule overlaps with enrolled course ${ec.code} (${ec.title}) on ${day} at ${cStart}–${cEnd}.`;
      }
    }

    // 2. Check against timetable slots
    for (const slot of existingSlots) {
      if (slot.day.toLowerCase() === day.toLowerCase() && timesOverlap(start, end, slot.startTime, slot.endTime)) {
        return `Schedule overlaps with timetable event "${slot.courseCode} - ${slot.title}" on ${day} at ${slot.startTime}–${slot.endTime}.`;
      }
    }

    return null;
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      if (departmentFilter !== 'ALL' && c.department !== departmentFilter) return false;
      if (yearFilter !== 'ALL' && c.year !== yearFilter) return false;
      if (semesterFilter !== 'ALL' && c.semester !== semesterFilter) return false;
      if (categoryFilter !== 'ALL') {
        const cat = (c.courseCategory || c.category || '').toLowerCase();
        if (!cat.includes(categoryFilter.toLowerCase())) return false;
      }

      if (statusFilter === 'enrolled' && c.enrollmentStatus !== 'enrolled') return false;
      if (statusFilter === 'available' && c.enrollmentStatus === 'enrolled') return false;
      if (statusFilter === 'active' && c.status !== 'active') return false;
      if (statusFilter === 'completed' && c.status !== 'completed') return false;
      if (statusFilter === 'withdrawn' && c.status !== 'withdrawn') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = c.code.toLowerCase().includes(q);
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchLecturer = c.lecturer.toLowerCase().includes(q);
        const matchDept = (c.department || '').toLowerCase().includes(q);
        const matchDesc = (c.description || '').toLowerCase().includes(q);
        const matchNotes = (c.notes || '').toLowerCase().includes(q);
        const matchTopics = (c.syllabusTopics || c.syllabus || []).some(s => s.toLowerCase().includes(q));
        return matchCode || matchTitle || matchLecturer || matchDept || matchDesc || matchNotes || matchTopics;
      }
      return true;
    });
  }, [courses, departmentFilter, yearFilter, semesterFilter, categoryFilter, statusFilter, searchQuery]);

  // Open Form Modal for New Course
  const handleOpenNewCourseForm = () => {
    setEditingCourseId(null);
    setFormCode('');
    setFormTitle('');
    setFormCategory('Lecture');
    setFormDepartment(departments[0] || 'Department of Biological Sciences');
    setFormProgramme(user.programme || 'BSc Biological Sciences');
    setFormYear(user.currentYear || 1);
    setFormSemester('Semester 1');
    setFormCredits(12);
    setFormLecturer('');
    setFormHall('Science Complex Lecture Theatre 1');
    setFormLectureDay('Monday');
    setFormStartTime('08:00');
    setFormEndTime('10:00');
    setFormDescription('');
    setFormPrerequisites('General university science entry requirements');
    setFormAssessmentStructure('Continuous Assessment: 40%, Final University Examination: 60%');
    setFormNotes('');
    setFormErrors({});
    setConflictWarning(null);
    setIsFormModalOpen(true);
  };

  // Open Form Modal for Editing Course
  const handleOpenEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setFormCode(course.code);
    setFormTitle(course.title);
    setFormCategory((course.courseCategory as CourseCategoryOption) || 'Lecture');
    setFormDepartment(course.department || 'Department of Biological Sciences');
    setFormProgramme(course.programme || user.programme || 'BSc Degree Programme');
    setFormYear(course.year || 1);
    setFormSemester(course.semester || 'Semester 1');
    setFormCredits(course.credits || 12);
    setFormLecturer(course.lecturer || '');
    setFormHall(course.hall || course.venue || 'Lecture Hall 1');
    setFormLectureDay(course.lectureDay || (course.schedule ? course.schedule.split(' ')[0] : 'Monday'));
    setFormStartTime(course.startTime || '08:00');
    setFormEndTime(course.endTime || '10:00');
    setFormDescription(course.description || '');
    setFormPrerequisites(course.prerequisitesText || (course.prerequisites ? course.prerequisites.join(', ') : 'None'));
    setFormAssessmentStructure(course.assessmentStructure || 'Continuous Assessment: 40%, Final Exam: 60%');
    setFormNotes(course.notes || '');
    setFormErrors({});
    
    // Check conflict
    const conflict = checkTimetableConflict(
      course.lectureDay || 'Monday',
      course.startTime || '08:00',
      course.endTime || '10:00',
      course.id
    );
    setConflictWarning(conflict);
    setIsFormModalOpen(true);
  };

  // Validate and Submit Course Form
  const handleSubmitCourseForm = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    // 1. Course code and title are required
    if (!formCode.trim()) {
      errors.code = 'Course code is required (e.g. ZOO 101, ANA 101).';
    }
    if (!formTitle.trim()) {
      errors.title = 'Course title is required.';
    }

    // 2. Duplicate course codes should be detected
    const cleanCode = formCode.trim().toUpperCase();
    const duplicate = courses.find(c => c.code.toUpperCase() === cleanCode && c.id !== editingCourseId);
    if (duplicate) {
      errors.code = `A course with code "${cleanCode}" already exists (${duplicate.title}).`;
    }

    // 3. Credit units must be a positive number
    const credNum = Number(formCredits);
    if (isNaN(credNum) || credNum <= 0) {
      errors.credits = 'Credit units must be a positive number greater than 0.';
    }

    // 4. End time must be later than start time
    if (formStartTime >= formEndTime) {
      errors.endTime = `End time (${formEndTime}) must be later than start time (${formStartTime}).`;
    }

    // Required lecturer and hall
    if (!formLecturer.trim()) {
      errors.lecturer = 'Lecturer name is required.';
    }
    if (!formHall.trim()) {
      errors.hall = 'Lecture hall or laboratory venue is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Construct course object
    const coursePayload: Course = {
      id: editingCourseId || ('course_' + Date.now()),
      code: cleanCode,
      title: formTitle.trim(),
      credits: credNum,
      year: Number(formYear),
      semester: formSemester,
      department: formDepartment.trim(),
      programme: formProgramme.trim(),
      lecturer: formLecturer.trim(),
      hall: formHall.trim(),
      venue: formHall.trim(),
      schedule: `${formLectureDay} ${formStartTime}–${formEndTime}`,
      lectureDay: formLectureDay,
      startTime: formStartTime,
      endTime: formEndTime,
      currentScore: 70,
      attendance: 90,
      color: '#0284c7',
      category: 'Core',
      courseCategory: formCategory,
      status: 'active',
      enrollmentStatus: 'enrolled',
      enrolledCount: 95,
      capacity: 120,
      description: formDescription.trim() || 'Comprehensive course syllabus and practical curriculum.',
      prerequisitesText: formPrerequisites.trim() || 'General University Science Entry Requirements',
      prerequisites: formPrerequisites ? [formPrerequisites.trim()] : ['General University Science Entry Requirements'],
      assessmentStructure: formAssessmentStructure.trim(),
      notes: formNotes.trim(),
    };

    // Save to storage
    const updated = StorageService.saveCourse(coursePayload);
    onCoursesUpdated(updated);

    // Automatically prompt / add timetable slot
    const slot: TimetableSlot = {
      id: 'slot_' + coursePayload.id,
      day: formLectureDay as any,
      startTime: formStartTime,
      endTime: formEndTime,
      courseCode: cleanCode,
      courseName: coursePayload.title,
      title: coursePayload.title,
      lecturer: coursePayload.lecturer,
      hall: coursePayload.hall,
      venue: coursePayload.hall,
      year: coursePayload.year || user.currentYear || 1,
      semester: coursePayload.semester === 'Semester 2' ? 2 : 1,
      type: (formCategory === 'Laboratory/practical' ? 'Practical' : formCategory === 'Tutorial' ? 'Tutorial' : 'Lecture') as any,
      attendanceMarked: false,
    };
    StorageService.addTimetableSlot(slot);

    // Success notifications
    const successMsg = editingCourseId 
      ? `Updated course details for ${cleanCode} (${coursePayload.title}) successfully!`
      : `Enrolled in ${cleanCode} - ${coursePayload.title}! Added ${credNum} credits and timetable event.`;
    
    setSuccessBanner(successMsg);
    onNotify(successMsg);
    setIsFormModalOpen(false);

    // Clear banner after 6 seconds
    setTimeout(() => setSuccessBanner(null), 6000);
  };

  // Withdraw / Remove course
  const handleWithdrawCourse = (course: Course) => {
    if (window.confirm(`Are you sure you want to withdraw from ${course.code} (${course.title})? This will update your credit total.`)) {
      const updated = StorageService.dropCourse(course.id);
      onCoursesUpdated(updated);
      onNotify(`Withdrawn from ${course.code}. Enrolled credits updated.`);
    }
  };

  // Toggle Course Academic Status (active, completed, withdrawn)
  const handleUpdateStatus = (course: Course, newStatus: CourseAcademicStatus) => {
    const updated = StorageService.updateCourseStatus(course.id, newStatus);
    onCoursesUpdated(updated);
    onNotify(`Marked ${course.code} as ${newStatus.toUpperCase()}.`);
  };

  // Add Enrolled Course to Timetable manually
  const handleAddToTimetable = (course: Course) => {
    const day = course.lectureDay || (course.schedule ? course.schedule.split(' ')[0] : 'Monday');
    const start = course.startTime || '08:00';
    const end = course.endTime || '10:00';

    const conflict = checkTimetableConflict(day, start, end, course.id);
    if (conflict) {
      if (!window.confirm(`${conflict}\n\nDo you still wish to add this event to your timetable?`)) {
        return;
      }
    }

    const slot: TimetableSlot = {
      id: 'slot_' + Date.now(),
      day: day as any,
      startTime: start,
      endTime: end,
      courseCode: course.code,
      courseName: course.title,
      title: course.title,
      lecturer: course.lecturer,
      hall: course.hall || course.venue || 'Lecture Hall',
      venue: course.hall || course.venue || 'Lecture Hall',
      year: course.year || user.currentYear || 1,
      semester: course.semester === 'Semester 2' ? 2 : 1,
      type: (course.courseCategory === 'Laboratory/practical' ? 'Practical' : 'Lecture') as any,
      attendanceMarked: false,
    };
    StorageService.addTimetableSlot(slot);
    onNotify(`Added ${course.code} to timetable for ${day} ${start}–${end}!`);
  };

  // Reset Demo Data
  const handleResetDemoData = () => {
    if (window.confirm('Reset courses to official standard fictional demo dataset (Zoology I, Biostatistics I, Human Anatomy I, Physiology I, Ecology, General Chemistry, Clinical Skills, Public Health)?')) {
      const fresh = StorageService.resetDemoCourses();
      onCoursesUpdated(fresh);
      onNotify('Demo courses reset to standard university curriculum successfully!');
    }
  };

  // Add Related Assessment Date Modal Handlers
  const handleOpenDateModal = (course: Course) => {
    setDateTargetCourse(course);
    setDateType('test');
    setDateTitle('');
    setDateDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setDateTime('10:00');
    setDateVenue(course.hall || 'Main Lecture Hall');
    setDateNotes('');
    setIsDateModalOpen(true);
  };

  const handleSaveRelatedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateTargetCourse || !dateTitle.trim() || !dateDate) return;

    const newDate: CourseRelatedAssessmentDate = {
      id: 'date_' + Date.now(),
      type: dateType,
      title: dateTitle.trim(),
      date: dateDate,
      time: dateTime,
      venue: dateVenue.trim() || dateTargetCourse.hall,
      notes: dateNotes.trim(),
    };

    const existingDates = dateTargetCourse.relatedDates || [];
    const updatedCourse: Course = {
      ...dateTargetCourse,
      relatedDates: [...existingDates, newDate],
    };

    const updatedCourses = StorageService.saveCourse(updatedCourse);
    onCoursesUpdated(updatedCourses);

    // Also register an alert
    StorageService.addSystemAlert({
      title: `${dateType.toUpperCase()} Scheduled: ${dateTargetCourse.code}`,
      message: `${newDate.title} on ${newDate.date} at ${newDate.time} in ${newDate.venue}.`,
      category: 'tests',
      priority: dateType === 'exam' ? 'urgent' : 'high',
      sourceType: 'server_push',
      actionTab: 'course-enrollment',
      actionLabel: 'View Course',
    });

    onNotify(`Added ${dateType} date for ${dateTargetCourse.code}!`);
    setIsDateModalOpen(false);
  };

  // Share Handlers
  const handleShareWhatsApp = (course: Course) => {
    const text = `📚 *CampusFlow TZ Course Details*\n*${course.code}*: ${course.title}\nCategory: ${course.courseCategory || 'Lecture'}\nCredits: ${course.credits} Credits\nLecturer: ${course.lecturer}\nSchedule: ${course.schedule || `${course.lectureDay} ${course.startTime}-${course.endTime}`}\nVenue: ${course.hall || course.venue}\nPrerequisites: ${course.prerequisitesText || 'None'}\nAssessment: ${course.assessmentStructure || 'CA 40%, UE 60%'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    onNotify(`Sharing ${course.code} via WhatsApp...`);
  };

  const handleShareEmail = (course: Course) => {
    const subject = `Course Syllabus: ${course.code} - ${course.title}`;
    const body = `Hello,\n\nHere are the enrolled course details from CampusFlow TZ:\n\nCourse: ${course.code} - ${course.title}\nCategory: ${course.courseCategory || 'Lecture'}\nDepartment: ${course.department}\nCredits: ${course.credits} Credits\nLecturer: ${course.lecturer}\nSchedule: ${course.schedule || `${course.lectureDay} ${course.startTime}-${course.endTime}`}\nVenue: ${course.hall || course.venue}\n\nDescription:\n${course.description}\n\nPrerequisites: ${course.prerequisitesText}\nAssessment Structure: ${course.assessmentStructure}\n`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    onNotify(`Email client opened to share ${course.code}.`);
  };

  const handleCopyDetails = (course: Course) => {
    const summary = `${course.code}: ${course.title} | ${course.credits} Credits | Lecturer: ${course.lecturer} | ${course.schedule} | Hall: ${course.hall || course.venue}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
    }
    setCopiedId(course.id);
    onNotify(`Course details for ${course.code} copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* SUCCESS CONFIRMATION BANNER */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-900 shadow-sm flex items-start justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-black text-sm text-emerald-950">Enrollment Action Successful</div>
              <div className="text-xs text-emerald-800 mt-0.5">{successBanner}</div>
            </div>
          </div>
          <button 
            onClick={() => setSuccessBanner(null)}
            className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP BANNER & ENROLLMENT CONTROLS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-sky-100 text-sky-800 text-xs font-black uppercase tracking-wider">
                Course Enrollment & Syllabus Hub
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold">
                TCU Compliant Planning
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
              Course Enrollment & Curriculum Management
            </h1>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Enrol in courses, inspect curriculum syllabi, manage credit load limits, and synchronize with your timetable.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleOpenNewCourseForm}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-black text-xs shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Enroll in a Course</span>
            </button>

            <button
              onClick={handleResetDemoData}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              title="Reset course database to standard demo list (Zoology, Anatomy, Biostatistics, etc.)"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>

        {/* FLEXIBLE INSTITUTION CREDIT LOAD INDICATOR & GUIDELINES */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Enrolled Workload:</span>
              <span className={`text-base font-black px-2.5 py-0.5 rounded-lg font-mono ${
                isOverConfiguredLimit 
                  ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                  : 'bg-sky-100 text-sky-950 border border-sky-200'
              }`}>
                {totalCredits} {creditConfig.unitLabel}
              </span>
              <span className="text-xs font-semibold text-slate-700">
                ({enrolledCourses.length} active courses)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-slate-700">
                {creditConfig.institutionName}
              </span>
              {(creditConfig.practicalWeightingMultiplier || 1) > 1 && practicalCredits > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-900">
                  {weightedWorkloadUnits} Workload Units (Practical x{creditConfig.practicalWeightingMultiplier})
                </span>
              )}
            </div>

            {/* Warning or Guidance Notice */}
            {isOverConfiguredLimit ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                <span>
                  Advisory Notice: Enrolment of {totalCredits} {creditConfig.unitLabel} exceeds your institution's normal semester ceiling of {creditConfig.normalMaxCredits} {creditConfig.unitLabel}.
                </span>
              </div>
            ) : isUnderConfiguredLimit ? (
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-sky-50/60 p-2 rounded-lg border border-sky-100">
                <Info className="w-4 h-4 shrink-0 text-sky-700" />
                <span>
                  Current enrolment ({totalCredits} {creditConfig.unitLabel}) is below full-time guideline ({creditConfig.normalMinCredits} {creditConfig.unitLabel}).
                </span>
              </div>
            ) : (
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Within normal semester guideline ({creditConfig.normalMinCredits}–{creditConfig.normalMaxCredits} {creditConfig.unitLabel}). {!creditConfig.allowWarnings && '(Unofficial warnings disabled)'}
                </span>
              </div>
            )}

            {/* Mandatory Academic Office Disclaimer */}
            <p className="text-[11px] text-slate-500 italic pt-0.5">
              Confirm enrolment limits with your university or academic office. CampusFlow does not decide whether an enrolment is officially valid.
            </p>
          </div>

          {/* Quick Credit Rules Button */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              onClick={() => {
                setTempConfig(creditConfig);
                setIsCreditConfigModalOpen(true);
              }}
              className="text-xs text-sky-900 hover:text-sky-950 font-bold bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-300 shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4 text-sky-700" />
              <span>Credit System & Limits</span>
            </button>
          </div>
        </div>
      </div>

      {/* FILTER AND SEARCH BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code (e.g. ZOO 101), title, lecturer, or syllabus topic..."
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="enrolled">Enrolled Only</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed Only</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="available">Available to Enroll</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {CATEGORY_OPTIONS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Department */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none"
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
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Years</option>
              <option value={1}>Year 1</option>
              <option value={2}>Year 2</option>
              <option value={3}>Year 3</option>
              <option value={4}>Year 4</option>
              <option value={5}>Year 5</option>
            </select>

            {/* Semester */}
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Semesters</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
          <span>Showing <strong>{filteredCourses.length}</strong> courses in catalogue</span>
          <span className="text-[11px] text-slate-500">Click course card to inspect complete syllabus, assessment breakdown, and related dates</span>
        </div>
      </div>

      {/* COURSE CARDS LIST */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-800">No courses found matching your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or resetting demo data.
          </p>
          <button
            onClick={handleResetDemoData}
            className="px-4 py-2 rounded-xl bg-sky-700 text-white font-bold text-xs transition-colors"
          >
            Reload Standard Demo Courses
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => {
            const isEnrolled = course.enrollmentStatus === 'enrolled' || course.status === 'active';
            const isExpanded = expandedCourseId === course.id;
            const courseCat = course.courseCategory || course.category || 'Lecture';
            const courseStatus = course.status || (isEnrolled ? 'active' : 'withdrawn');

            return (
              <div
                key={course.id}
                className={`bg-white rounded-3xl border transition-all shadow-xs overflow-hidden ${
                  isEnrolled 
                    ? 'border-emerald-300/80 ring-1 ring-emerald-500/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Course Header Row */}
                <div 
                  onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-sm shrink-0 border ${
                      isEnrolled 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-sky-50 text-sky-800 border-sky-200'
                    }`}>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Course</span>
                      <span>{course.code.split(' ')[0]}</span>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-black text-slate-900">{course.code}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-bold text-slate-600">{course.department || 'Academic Department'}</span>
                        
                        {/* Course Category Badge */}
                        <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-900 text-[11px] font-black uppercase tracking-wide">
                          {courseCat}
                        </span>

                        {/* Credits Badge */}
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-black">
                          {course.credits || 12} Credits
                        </span>

                        {/* Status Badge */}
                        {courseStatus === 'active' && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            Active
                          </span>
                        )}
                        {courseStatus === 'completed' && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 text-[11px] font-black uppercase tracking-wider">
                            Completed
                          </span>
                        )}
                        {courseStatus === 'withdrawn' && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                            Withdrawn
                          </span>
                        )}
                      </div>

                      <h2 className="text-lg font-black text-slate-900 truncate">
                        {course.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                        <span>Lecturer: <strong className="text-slate-900">{course.lecturer}</strong></span>
                        <span>•</span>
                        <span>Venue: <strong className="text-slate-800">{course.hall || course.venue || 'TBA'}</strong></span>
                        <span>•</span>
                        <span>Schedule: <strong className="text-slate-800">{course.schedule || `${course.lectureDay || 'Mon'} ${course.startTime || '08:00'}-${course.endTime || '10:00'}`}</strong></span>
                        <span>•</span>
                        <span>Year {course.year || 1}, {course.semester || 'Semester 1'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Chevron */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
                    {/* Edit Course Button */}
                    <button
                      onClick={() => handleOpenEditCourse(course)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                      title="Edit course details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Quick Status Toggle */}
                    <select
                      value={courseStatus}
                      onChange={(e) => handleUpdateStatus(course, e.target.value as CourseAcademicStatus)}
                      className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>

                    {/* Enroll / Withdraw Button */}
                    {isEnrolled ? (
                      <button
                        onClick={() => handleWithdrawCourse(course)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-xl border border-rose-200 transition-colors"
                        title="Withdraw from this course"
                      >
                        <MinusCircle className="w-4 h-4 text-rose-600" />
                        <span>Withdraw</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenEditCourse(course)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-black rounded-xl shadow-xs transition-all"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Enrol</span>
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                      className="p-2 text-slate-500 hover:text-slate-800 rounded-xl"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-3 border-t border-slate-100 bg-slate-50/60 space-y-5 animate-fade-in">
                    {/* Course Overview & Prereqs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Lecturer Info */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                        <div className="font-black text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                          <UserCheck className="w-4 h-4 text-sky-700" />
                          <span>Lecturer & Office Hours</span>
                        </div>
                        <p className="text-slate-900 font-bold text-sm">{course.lecturer}</p>
                        <p className="text-slate-600">Email: <span className="font-mono text-slate-800">{course.lecturerEmail || `${course.lecturer.toLowerCase().replace(/[^a-z]/g, '')}@udsm.ac.tz`}</span></p>
                        <p className="text-slate-600">Office Hours: <strong className="text-slate-800">{course.officeHours || 'Tues & Thurs 14:00 - 16:00'}</strong></p>
                        
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-medium">Endorse Instructor:</span>
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

                      {/* Course Venue & Prerequisites */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                        <div className="font-black text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                          <GraduationCap className="w-4 h-4 text-indigo-700" />
                          <span>Venue & Prerequisites</span>
                        </div>
                        <p className="text-slate-700">
                          Hall / Venue: <strong className="text-slate-900">{course.hall || course.venue || 'Lecture Theatre 2'}</strong>
                        </p>
                        <p className="text-slate-700">
                          Prerequisites: <strong className="text-slate-900">{course.prerequisitesText || (course.prerequisites ? course.prerequisites.join(', ') : 'Standard Entry')}</strong>
                        </p>
                        <p className="text-slate-700">
                          Programme: <strong className="text-slate-900">{course.programme || user.programme || 'Undergraduate'}</strong>
                        </p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-medium">Endorse Course:</span>
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

                      {/* Assessment Breakdown */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                        <div className="font-black text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                          <Award className="w-4 h-4 text-amber-700" />
                          <span>Assessment Structure</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed font-medium">
                          {course.assessmentStructure || 'Continuous Assessment: 40% (CAT 1, CAT 2, Practical Labs), Final University Examination: 60%'}
                        </p>
                        {course.notes && (
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-[11px] leading-snug">
                            <strong>Note:</strong> {course.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description & Syllabus Topics */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
                      <div className="font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-sky-700" />
                        <span>Course Description & Core Syllabus</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {course.description || 'Comprehensive curriculum providing foundational theory and practical laboratory competencies for undergraduate students.'}
                      </p>

                      {course.syllabusTopics && course.syllabusTopics.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                          {course.syllabusTopics.map((topic, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-800">
                              <span className="font-black text-sky-700">W{i + 1}.</span>
                              <span className="font-semibold">{topic}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Related Dates: Tests, Assignments, Labs, Examinations */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                          <Calendar className="w-4 h-4 text-indigo-700" />
                          <span>Related Tests, Assignments, Labs & Exams</span>
                        </div>
                        <button
                          onClick={() => handleOpenDateModal(course)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Date</span>
                        </button>
                      </div>

                      {course.relatedDates && course.relatedDates.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {course.relatedDates.map((rd) => (
                            <div key={rd.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  rd.type === 'exam' ? 'bg-rose-100 text-rose-900' :
                                  rd.type === 'test' ? 'bg-amber-100 text-amber-900' :
                                  rd.type === 'lab' ? 'bg-sky-100 text-sky-900' :
                                  'bg-indigo-100 text-indigo-900'
                                }`}>
                                  {rd.type}
                                </span>
                                <span className="font-mono text-slate-500 text-[11px]">{rd.date} {rd.time}</span>
                              </div>
                              <div className="font-black text-slate-900">{rd.title}</div>
                              <div className="text-slate-600 text-[11px]">Venue: <strong>{rd.venue || course.hall}</strong></div>
                              {rd.notes && <div className="text-slate-500 text-[11px] italic">{rd.notes}</div>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic">
                          No assessment dates logged yet. Click "Add Date" to schedule related tests, laboratory sessions, or examinations.
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions: Add to Timetable & Share */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddToTimetable(course)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-black text-xs transition-colors"
                          title="Add this course to your weekly timetable"
                        >
                          <CalendarPlus className="w-4 h-4 text-sky-700" />
                          <span>Add to Timetable</span>
                        </button>

                        <button
                          onClick={() => handleOpenDateModal(course)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                        >
                          <Clock className="w-4 h-4 text-slate-600" />
                          <span>Schedule Test/Lab Date</span>
                        </button>
                      </div>

                      {/* Sharing Controls */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Share:</span>
                        <button
                          onClick={() => handleShareWhatsApp(course)}
                          className="p-2 rounded-xl text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Share course syllabus via WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShareEmail(course)}
                          className="p-2 rounded-xl text-sky-700 hover:bg-sky-50 transition-colors"
                          title="Share course details via Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCopyDetails(course)}
                          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Copy details to clipboard"
                        >
                          {copiedId === course.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ENROLL IN A COURSE / EDIT COURSE (16 FIELDS WITH VALIDATION) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingCourseId ? 'Edit Enrolled Course' : 'Enroll in a Course'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fill in complete course details, schedule, and assessment structure
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timetable Conflict Warning */}
            {conflictWarning && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-black text-amber-900">Schedule Conflict Detected</strong>
                  <span>{conflictWarning}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitCourseForm} className="space-y-4 text-xs">
              {/* Row 1: Course Code & Course Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Course Code <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. ZOO 101"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 uppercase focus:ring-2 focus:ring-sky-500"
                  />
                  {formErrors.code && <p className="text-rose-600 text-[11px] mt-1 font-bold">{formErrors.code}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-black text-slate-800 mb-1">
                    Course Title <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Zoology I"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
                  />
                  {formErrors.title && <p className="text-rose-600 text-[11px] mt-1 font-bold">{formErrors.title}</p>}
                </div>
              </div>

              {/* Row 2: Course Category & Credit Units */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Course Category <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as CourseCategoryOption)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Credit Units (Positive Number) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    required
                    value={formCredits}
                    onChange={(e) => setFormCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                  />
                  {formErrors.credits && <p className="text-rose-600 text-[11px] mt-1 font-bold">{formErrors.credits}</p>}
                </div>
              </div>

              {/* Row 3: Department & Programme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="e.g. Department of Zoology"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Programme
                  </label>
                  <input
                    type="text"
                    value={formProgramme}
                    onChange={(e) => setFormProgramme(e.target.value)}
                    placeholder="e.g. BSc Biological Sciences"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Row 4: Study Year & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Study Year
                  </label>
                  <select
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                    <option value={5}>Year 5</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Semester
                  </label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Lecturer & Lecture Hall */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Lecturer <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formLecturer}
                    onChange={(e) => setFormLecturer(e.target.value)}
                    placeholder="e.g. Dr. A. Mushi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                  />
                  {formErrors.lecturer && <p className="text-rose-600 text-[11px] mt-1 font-bold">{formErrors.lecturer}</p>}
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Lecture Hall / Venue <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formHall}
                    onChange={(e) => setFormHall(e.target.value)}
                    placeholder="e.g. Science Block B204"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                  />
                  {formErrors.hall && <p className="text-rose-600 text-[11px] mt-1 font-bold">{formErrors.hall}</p>}
                </div>
              </div>

              {/* Row 6: Lecture Day, Start Time, End Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Lecture Day
                  </label>
                  <select
                    value={formLectureDay}
                    onChange={(e) => {
                      const day = e.target.value;
                      setFormLectureDay(day);
                      setConflictWarning(checkTimetableConflict(day, formStartTime, formEndTime, editingCourseId));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => {
                      const st = e.target.value;
                      setFormStartTime(st);
                      setConflictWarning(checkTimetableConflict(formLectureDay, st, formEndTime, editingCourseId));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    End Time <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => {
                      const et = e.target.value;
                      setFormEndTime(et);
                      setConflictWarning(checkTimetableConflict(formLectureDay, formStartTime, et, editingCourseId));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900"
                  />
                  {formErrors.endTime && <p className="text-rose-600 text-[11px] mt-1 font-bold">{formErrors.endTime}</p>}
                </div>
              </div>

              {/* Row 7: Course Description */}
              <div>
                <label className="block font-black text-slate-800 mb-1">
                  Course Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Outline syllabus topics, learning outcomes, and foundational concepts..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900"
                />
              </div>

              {/* Row 8: Prerequisites & Assessment Structure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Prerequisites
                  </label>
                  <input
                    type="text"
                    value={formPrerequisites}
                    onChange={(e) => setFormPrerequisites(e.target.value)}
                    placeholder="e.g. ACSEE Principal Biology or BIO 100"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Assessment Structure
                  </label>
                  <input
                    type="text"
                    value={formAssessmentStructure}
                    onChange={(e) => setFormAssessmentStructure(e.target.value)}
                    placeholder="e.g. CA: 40% (Tests & Labs), UE: 60%"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Row 9: Optional Course Notes */}
              <div>
                <label className="block font-black text-slate-800 mb-1">
                  Optional Course Notes
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Dissection kit and white lab coat required for Zoology Lab 4."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-black shadow-md transition-all active:scale-95"
                >
                  {editingCourseId ? 'Save Course Updates' : 'Confirm & Enrol Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: ADD RELATED TEST / ASSIGNMENT / LAB / EXAM DATE */}
      {isDateModalOpen && dateTargetCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Add Assessment Date
                </h3>
                <p className="text-xs text-slate-500">
                  {dateTargetCourse.code} • {dateTargetCourse.title}
                </p>
              </div>
              <button 
                onClick={() => setIsDateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRelatedDate} className="space-y-3 text-xs">
              <div>
                <label className="block font-black text-slate-800 mb-1">Assessment Type</label>
                <select
                  value={dateType}
                  onChange={(e) => setDateType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                >
                  <option value="test">Continuous Assessment Test (CAT)</option>
                  <option value="assignment">Assignment / Paper Submission</option>
                  <option value="lab">Laboratory Practical / Dissection</option>
                  <option value="exam">Final University Examination</option>
                </select>
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1">Title / Topic <span className="text-rose-600">*</span></label>
                <input
                  type="text"
                  required
                  value={dateTitle}
                  onChange={(e) => setDateTitle(e.target.value)}
                  placeholder="e.g. Midterm Test 1 (Weeks 1-7)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-800 mb-1">Date <span className="text-rose-600">*</span></label>
                  <input
                    type="date"
                    required
                    value={dateDate}
                    onChange={(e) => setDateDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-800 mb-1">Time</label>
                  <input
                    type="time"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1">Venue / Examination Room</label>
                <input
                  type="text"
                  value={dateVenue}
                  onChange={(e) => setDateVenue(e.target.value)}
                  placeholder="e.g. Science Block B204"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1">Instructions / Notes</label>
                <input
                  type="text"
                  value={dateNotes}
                  onChange={(e) => setDateNotes(e.target.value)}
                  placeholder="e.g. Bring student ID card and scientific calculator"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-black shadow-xs"
                >
                  Schedule Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSTITUTION CREDIT SYSTEM CONFIGURATION MODAL */}
      {isCreditConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full my-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    Institutional Credit System
                  </h2>
                  <p className="text-xs text-slate-300">
                    Customize credit models, ranges, and optional warnings
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreditConfigModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">University / Institution Name</label>
                <input
                  type="text"
                  value={tempConfig.institutionName}
                  onChange={(e) => setTempConfig(p => ({ ...p, institutionName: e.target.value }))}
                  placeholder="e.g. University of Dar es Salaam, SUA, UDOM, etc."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Credit System</label>
                  <select
                    value={tempConfig.systemType}
                    onChange={(e) => {
                      const st = e.target.value as CreditSystemType;
                      let unit = 'Credits';
                      if (st === 'ects') unit = 'ECTS';
                      else if (st === 'us_credits') unit = 'Credit Hours';
                      else if (st === 'uk_cats') unit = 'CATS';
                      setTempConfig(p => ({ ...p, systemType: st, unitLabel: unit }));
                    }}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white"
                  >
                    <option value="tanzania">Tanzanian TCU Credits</option>
                    <option value="ects">ECTS Credits (Europe)</option>
                    <option value="us_credits">US Credit Hours</option>
                    <option value="uk_cats">UK / CATS</option>
                    <option value="custom">Custom System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Unit Label</label>
                  <input
                    type="text"
                    value={tempConfig.unitLabel}
                    onChange={(e) => setTempConfig(p => ({ ...p, unitLabel: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Semester Thresholds */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Semester Normal Range Limits
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="block text-[11px] font-bold text-slate-700">Minimum</span>
                    <input
                      type="number"
                      min="0"
                      max="150"
                      value={tempConfig.normalMinCredits}
                      onChange={(e) => setTempConfig(p => ({ ...p, normalMinCredits: Number(e.target.value) }))}
                      className="w-full mt-1 px-2 py-1 rounded-md border border-slate-300 font-bold text-center bg-white"
                    />
                  </div>
                  <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl">
                    <span className="block text-[11px] font-bold text-sky-950">Recommended</span>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      value={tempConfig.recommendedCredits}
                      onChange={(e) => setTempConfig(p => ({ ...p, recommendedCredits: Number(e.target.value) }))}
                      className="w-full mt-1 px-2 py-1 rounded-md border border-sky-300 font-bold text-center bg-white"
                    />
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="block text-[11px] font-bold text-slate-700">Maximum</span>
                    <input
                      type="number"
                      min="0"
                      max="250"
                      value={tempConfig.normalMaxCredits}
                      onChange={(e) => setTempConfig(p => ({ ...p, normalMaxCredits: Number(e.target.value) }))}
                      className="w-full mt-1 px-2 py-1 rounded-md border border-slate-300 font-bold text-center bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Practical Weighting */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Practical / Lab Coursework Weight Multiplier
                </label>
                <select
                  value={tempConfig.practicalWeightingMultiplier || 1.0}
                  onChange={(e) => setTempConfig(p => ({ ...p, practicalWeightingMultiplier: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white"
                >
                  <option value={1.0}>1.0x (Standard 1:1 weight)</option>
                  <option value={1.25}>1.25x (Practical load +25%)</option>
                  <option value={1.5}>1.5x (Clinical & field heavy +50%)</option>
                </select>
              </div>

              {/* Warnings Toggle */}
              <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-900">Enable Credit Limit Warnings</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Show advisory warning when enrolled credits exceed your institution's maximum semester guideline.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={tempConfig.allowWarnings === true}
                  onChange={(e) => setTempConfig(p => ({ ...p, allowWarnings: e.target.checked }))}
                  className="w-4 h-4 mt-0.5 text-sky-700 rounded"
                />
              </label>

              {/* Disclaimer */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Confirm enrolment limits with your university or academic office. CampusFlow does not decide whether an enrolment is officially valid.
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsCreditConfigModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  StorageService.saveCreditConfig(tempConfig);
                  setCreditConfig(tempConfig);
                  setIsCreditConfigModalOpen(false);
                  onNotify(`Credit model updated to ${tempConfig.institutionName} (${tempConfig.systemType.toUpperCase()}).`);
                }}
                className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Save Credit Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
