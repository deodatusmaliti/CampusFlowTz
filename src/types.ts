export type EventCategory = 'lecture' | 'practical' | 'assessment' | 'personal' | 'sport' | 'society' | 'assignment' | 'exam';
export type TaskStatus = 'not_started' | 'in_progress' | 'submitted' | 'graded';
export type UserRole = 'student' | 'lecturer' | 'college_admin' | 'system_admin' | 'admin';
export type AcademicSubjectCategory = 'law' | 'science' | 'engineering' | 'business' | 'health' | 'humanities' | 'general';
export type LeadershipTitle = 
  | 'Student'
  | 'Class Representative'
  | 'Guild Leader'
  | 'Course Lecturer / Tutor'
  | 'Head of Department (HOD)'
  | 'Dean of Faculty / School'
  | 'College / University Administrator'
  | 'Academic Registrar / Manager'
  | 'Vice Chancellor / Deputy VC'
  | 'System Administrator';

export type PaymentChannel = 'M-Pesa' | 'Mixx by Yas' | 'Airtel Money' | 'HaloPesa' | 'AzamPesa' | 'Card' | 'Bank' | 'QR';

export type CourseCategoryOption = 
  | 'Lecture'
  | 'Laboratory/practical'
  | 'Tutorial'
  | 'Field study'
  | 'Seminar'
  | 'Clinical session'
  | 'Test'
  | 'Examination'
  | 'Independent study'
  | 'Core'
  | 'Elective'
  | 'Clinical'
  | 'Practical'
  | 'Fieldwork'
  | 'Independent';

export type CourseAcademicStatus = 'active' | 'completed' | 'withdrawn';

export interface CourseRelatedAssessmentDate {
  id: string;
  type: 'test' | 'assignment' | 'lab' | 'exam';
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  venue?: string;
  notes?: string;
}

export interface CourseSession {
  day: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string;   // "11:00"
  type: 'Lecture' | 'Laboratory' | 'Field Study' | 'Seminar' | 'Tutorial' | 'Test' | 'Exam' | 'Clinical' | 'Independent Study' | 'Group Discussion';
  hall: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  year: number; // Supports Year 1 to 6+
  semester: string;
  department?: string;
  programme?: string;
  lecturer: string;
  lecturerEmail?: string;
  officeHours?: string;
  hall: string;
  venue?: string;
  schedule: string;
  lectureDay?: DayOfWeek | string;
  startTime?: string;
  endTime?: string;
  currentScore: number;
  attendance: number;
  notes: string;
  color?: string;
  category?: 'Core' | 'Elective' | 'Clinical' | 'Practical' | 'Fieldwork' | 'Independent';
  courseCategory?: CourseCategoryOption | string;
  status?: CourseAcademicStatus;
  assessmentStructure?: string;
  prerequisitesText?: string;
  syllabus?: string[];
  syllabusTopics?: string[];
  description?: string;
  prerequisites?: string[];
  learningOutcomes?: string[];
  requiredMaterials?: string[];
  assessmentBreakdown?: {
    coursework?: number;
    midtermTest?: number;
    practicalLab?: number;
    finalExam?: number;
    [key: string]: number | undefined;
  };
  assessmentWeighting?: {
    coursework: number; // e.g. 40%
    midtermTest?: number; // e.g. 20%
    finalExam: number;   // e.g. 40%
  };
  capacity?: number;
  enrolledCount?: number;
  enrollmentStatus?: 'enrolled' | 'pending' | 'available';
  enrollmentDeadline?: string;
  isBookmarked?: boolean;
  sessions?: CourseSession[];
  examDate?: string;
  examVenue?: string;
  relatedDates?: CourseRelatedAssessmentDate[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  category: EventCategory;
  type?: string;
  courseId?: string;
  courseCode?: string;
  instructor?: string;
  color?: string;
  reminderMinutes?: number;
  isCompleted?: boolean;
}

export interface Task {
  id: string;
  title: string;
  courseCode: string;
  dueDate: string;
  weight: number; // percentage
  status: TaskStatus;
  score?: number;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface UserEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface UserPrivacySettings {
  profileVisibility: 'public' | 'classmates' | 'private';
  showPhone: boolean;
  showWhatsapp: boolean;
  showEmail: boolean;
  allowInvites: boolean;
}

export interface User {
  id: string;
  name: string;
  preferredName?: string;
  studentId?: string;
  email: string;
  role: UserRole;
  leadershipTitle?: LeadershipTitle | string;
  university: string;
  college?: string;
  department?: string;
  programme: string;
  specialisation?: string;
  currentYear: number;
  totalYears: number;
  semester?: string;
  country?: string;
  region?: string;
  phone?: string;
  whatsapp?: string;
  avatar?: string;
  biography?: string;
  academicInterests?: string[];
  careerInterests?: string[];
  careerAspirations?: string[];
  skills?: string[];
  academicYear?: string;
  hostelRoom?: string;
  emergencyContact?: UserEmergencyContact;
  accessibilityNeeds?: string;
  preferredContactMethod?: 'CampusFlow' | 'WhatsApp' | 'Email' | 'Phone';
  privacySettings?: UserPrivacySettings;
  authProvider: 'email' | 'google' | 'microsoft';
  mfaEnabled: boolean;
  subjectCategory?: AcademicSubjectCategory;
  regNumber?: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimetableSlot {
  id: string;
  courseCode: string; // e.g. "BIO 203"
  courseName: string; // e.g. "Biostatistics & Research Methodology"
  title?: string; // alias for courseName compatibility
  day: DayOfWeek;
  startTime: string; // "09:30"
  endTime: string; // "10:30"
  timeFormatted?: string; // "09:30 - 10:30 AM"
  hall: string; // e.g. "Hall 03"
  venue?: string; // alias for hall compatibility
  building?: string; // e.g. "CoNAS Main Complex"
  lecturer: string; // e.g. "Prof. Assad"
  lecturerEmail?: string;
  year: number; // 1, 2, 3, 4
  semester: number; // 1, 2
  type: 'Lecture' | 'Practical' | 'Tutorial' | 'Seminar';
  color?: string;
  notes?: string;
  attendanceRequired?: boolean;
  attendanceMarked?: boolean;
}

export interface AnnouncementAttachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'word' | 'image' | 'file' | 'doc' | 'other';
  url?: string;
  previewUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: UserRole;
  authorTitle?: string;
  authorId: string;
  university: string; // "ALL" or specific university name
  targetAudience: {
    type: 'course' | 'year' | 'college' | 'university' | 'all';
    courseCode?: string; // e.g. "BIO 203" or "ENG 004"
    year?: number; // e.g. 1
    collegeOrFaculty?: string;
    label: string; // e.g. "Year 1 Biostatistics", "1st Year All Programmes", "All Students"
  };
  priority: 'urgent' | 'venue_change' | 'assessment' | 'general';
  timestamp: string;
  pinned?: boolean;
  acknowledged?: boolean;
  acknowledgedCount?: number;
  actionTab?: string;
  actionUrl?: string;
  attachments?: AnnouncementAttachment[];
}

export interface RolePermission {
  role: UserRole | string;
  label: string;
  canBroadcast: boolean;
  canAttachFiles: boolean;
  canEditTimetable: boolean;
  canManageCourses: boolean;
  canVerifyPayments: boolean;
  canManageUsers: boolean;
  canIssueAlerts: boolean;
  canExportData: boolean;
}

export interface ManagedUser extends User {
  status: 'active' | 'suspended' | 'pending';
  department?: string;
  lastActive?: string;
  phone?: string;
  registeredDate?: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    actionTab?: string;
    prompt?: string;
  }[];
}

export interface StudyResource {
  id: string;
  courseCode: string;
  courseTitle: string;
  title: string;
  type: 'textbook' | 'lecture_notes' | 'past_paper' | 'interactive_tool' | 'research_link';
  source: string; // e.g. "MIT OpenCourseWare", "PubMed Central", "TCU Digital Library"
  description: string;
  url: string;
  fileUrl?: string;
  fileSize?: string;
  readingTime?: string;
  tags: string[];
}

export interface ScientificBreakthrough {
  id: string;
  headline: string;
  summary: string;
  field: string; // e.g. "Constitutional Law & Judicial Review", "Space Technology", "Corporate Finance & FinTech", etc.
  subjectCategory?: AcademicSubjectCategory; // 'law' | 'science' | 'engineering' | 'business' | 'health' | 'humanities' | 'general'
  relevantCourses: string[]; // e.g. ["LAW 101", "ZOO 201", "BIO 203"]
  publishedDate: string;
  source: string; // e.g. "Tanzania Law Reports & EALLR", "Nature Space Tech", "Harvard Business Review"
  readingTime: string;
  discussionPrompt: string;
  upvotes: number;
  url?: string;
  fullStory?: string;
  keyTakeaways?: string[];
  recommendedReadings?: {
    title: string;
    source?: string;
    url?: string;
    notes?: string;
  }[];
}

export type AcademicFeedItem = ScientificBreakthrough;

export interface ImminentLectureAlert {
  id: string;
  courseCode: string;
  courseName: string;
  hall: string;
  building?: string;
  lecturer: string;
  startTime: string;
  endTime: string;
  minutesRemaining: number;
  intervalLabel: '5 hours' | '1 hour' | '30 mins' | '15 mins' | '5 mins';
  timestamp: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs or names
}

export interface SharedStudyMaterialRef {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  courseCode: string;
}

export interface SharedLinkRef {
  url: string;
  title?: string;
  description?: string;
}

export interface CommunityMessage {
  id: string;
  authorId?: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  isPinned?: boolean;
  isAlert?: boolean;
  alertType?: 'venue' | 'exam' | 'material' | 'general';
  replyTo?: {
    id: string;
    authorName: string;
    content: string;
  };
  sharedMaterial?: SharedStudyMaterialRef;
  sharedLink?: SharedLinkRef;
  reactions?: Record<string, string[]>; // e.g. { "👍": ["u1"], "❤️": ["u2"] }
  isReported?: boolean;
  reportedReason?: string;
}

export interface StudyGroupMember {
  userId: string;
  name: string;
  role: 'leader' | 'member';
  programme?: string;
  year?: number;
  avatar?: string;
  isOnline?: boolean;
  joinedAt?: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  courseCode: string;
  courseTitle?: string;
  creatorId: string;
  creatorName: string;
  maxMembers: number;
  currentMembers: number;
  meetingType: string;
  description: string;
  isJoined?: boolean;
  isMuted?: boolean;
  unreadCount?: number;
  members: StudyGroupMember[];
  messages: CommunityMessage[];
  createdAt: string;
}

export interface DirectConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  participantAvatar?: string;
  participantProgramme?: string;
  participantYear?: number;
  isBlocked?: boolean;
  isMuted?: boolean;
  unreadCount: number;
  messages: CommunityMessage[];
  lastMessageTimestamp?: string;
}

export interface Community {
  id: string;
  courseCode: string;
  courseTitle: string;
  memberCount: number;
  unreadCount: number;
  lastMessage: string;
  messages: CommunityMessage[];
}

export interface PaymentRecord {
  id: string;
  controlNumber: string;
  amount: number;
  currency: string;
  channel: PaymentChannel;
  status: 'pending' | 'verified' | 'failed';
  timestamp: string;
  description: string;
  studentId: string;
  receiptNumber?: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'academic' | 'payment' | 'system' | 'social' | 'alert';
}

export interface SyncQueueItem {
  id: string;
  entity: 'event' | 'task' | 'course' | 'payment' | 'profile' | 'timetable' | 'users' | 'permissions';
  action: 'create' | 'update' | 'delete';
  timestamp: string;
  status: 'pending' | 'synced' | 'failed';
  payloadSummary: string;
}

export interface MicroserviceMetric {
  name: string;
  status: 'healthy' | 'degraded' | 'warning';
  latencyMs: number;
  throughputRps: number;
  uptimePercent: number;
  region: string;
  activeReplicas: number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  service: string;
  level: 'info' | 'warn' | 'error' | 'audit';
  message: string;
  traceId: string;
}

// ----------------------------------------------------
// STUDY MATERIALS HUB
// ----------------------------------------------------
export type StudyMaterialType = 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'image' | 'zip' | 'txt' | 'other';

export interface StudyMaterial {
  id: string;
  title: string;
  fileName: string;
  fileType: StudyMaterialType;
  fileSize: string; // e.g. "3.8 MB"
  fileSizeBytes: number;
  courseCode: string;
  courseTitle: string;
  department: string;
  programme: string;
  year: number;
  semester: string;
  uploadedBy: string;
  uploaderRole: string;
  uploaderId: string;
  uploadDate: string; // YYYY-MM-DD
  description: string;
  downloadCount: number;
  institution?: string;
  sourceLink?: string;
  actualFileUrl?: string;
  previewAvailable?: boolean;
  previewType?: 'pdf' | 'image' | 'text' | 'office' | 'link' | 'document';
  isSample?: boolean;
  isSampleDemo?: boolean;
  sampleType?: 'pdf' | 'docx' | 'image' | 'presentation' | 'external_link' | 'text';
  textPreviewContent?: string;
  isOfficial?: boolean;
  isRecommended?: boolean;
  isBookmarked?: boolean;
  isReported?: boolean;
  downloadUrl?: string;
  contentDataUrl?: string; // local preview/blob support
  tags?: string[];
}

// ----------------------------------------------------
// FLEXIBLE INSTITUTION COURSE-CREDIT SYSTEM
// ----------------------------------------------------
export type CreditSystemType = 'tanzania' | 'ects' | 'us_credits' | 'uk_cats' | 'custom';

export interface InstitutionCreditConfig {
  institutionName: string;
  systemType: CreditSystemType;
  unitLabel: string; // e.g. "Credits", "ECTS", "Credit Hours", "CATS"
  normalMinCredits: number;
  recommendedCredits: number;
  normalMaxCredits: number;
  annualCredits: number;
  allowWarnings: boolean; // default false (no fixed warning by default)
  practicalWeightingMultiplier?: number; // e.g. 1.0 or 1.5
  disclaimerAccepted?: boolean;
}

// ----------------------------------------------------
// TIMEZONE & CALENDAR CONFIGURATION
// ----------------------------------------------------
export type TimezoneSettingMode = 'auto' | 'tanzania' | 'manual';

export interface UserTimezoneConfig {
  mode: TimezoneSettingMode;
  manualTimezone: string; // e.g. "Africa/Dar_es_Salaam", "Europe/London", etc.
}

// ----------------------------------------------------
// DISCUSSION & CALL-PLANNING HUB
// ----------------------------------------------------
export type CallPlatform = 'zoom' | 'google_meet' | 'microsoft_teams' | 'whatsapp' | 'other';

export interface DiscussionCall {
  id: string;
  title: string;
  description: string;
  courseCode: string;
  courseTitle: string;
  classGroup: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  agenda: string[];
  targetParticipants: string;
  platform: CallPlatform;
  meetingLink: string;
  hostName: string;
  hostRole: string;
  hostId: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  rsvpGoing: string[]; // array of user IDs/names
  rsvpMaybe: string[];
  rsvpCannot: string[];
  addedToTimetable?: boolean;
  notes?: string;
}

// ----------------------------------------------------
// ALERTS, REMINDERS & NOTIFICATION SYSTEM
// ----------------------------------------------------
export type AlertCategory = 
  | 'lectures'
  | 'tests'
  | 'examinations'
  | 'assignments'
  | 'course_materials'
  | 'discussion_calls'
  | 'payments'
  | 'scholarships'
  | 'jobs'
  | 'personal_events'
  | 'leisure_events';

export type ReminderTiming =
  | '1_week'
  | '3_days'
  | '1_day'
  | '12_hours'
  | '6_hours'
  | '1_hour'
  | '30_mins'
  | '15_mins'
  | 'at_event_time';

export interface AlertPreferences {
  enabledCategories: Record<AlertCategory, boolean>;
  defaultReminderTiming: ReminderTiming;
  softSoundEnabled: boolean;
  soundVolume: number; // 0 to 100
  isMuted: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string;   // e.g. "07:00"
  dailyDigestEnabled: boolean;
  browserNotificationsEnabled: boolean;
}

export interface SystemAlertItem {
  id: string;
  title: string;
  message: string;
  category: AlertCategory;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  timestamp: string;
  isRead: boolean;
  isDismissed: boolean;
  snoozedUntil?: string;
  sourceType: 'local_timer' | 'server_push' | 'academic_schedule';
  actionTab?: string;
  actionLabel?: string;
  linkUrl?: string;
}

// ----------------------------------------------------
// ENTERTAINMENT & LEISURE HUB
// ----------------------------------------------------
export type LeisureCategory = 'sports' | 'music' | 'cultural' | 'culture' | 'social' | 'wellness' | 'university_club' | 'local' | 'national' | 'international';

export interface LeisureEvent {
  id: string;
  title: string;
  description: string;
  category: LeisureCategory;
  location: string;
  venue: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  organizer: string;
  organizerRole?: string;
  postedByUserId: string;
  postedByUserName: string;
  isUserPosted?: boolean;
  rsvpGoing: string[];
  rsvpInterested: string[];
  rsvpNotGoing: string[];
  isBookmarked?: boolean;
  imageUrl?: string;
  contactInfo?: string;
  ticketPrice?: string;
  admissionFee?: string;
  isReported?: boolean;
}

// ----------------------------------------------------
// SCHOLARSHIPS & JOB OPPORTUNITIES HUB
// ----------------------------------------------------
export type OpportunityType = 'scholarship' | 'job_internship' | 'internship' | 'job';

export interface OpportunityItem {
  id: string;
  type: OpportunityType;
  title: string;
  providerOrOrg: string;
  organization?: string;
  country: string;
  location: string;
  workplaceType?: 'remote' | 'hybrid' | 'on_site';
  studyLevelOrExperience?: string;
  fieldOfStudyOrCareer: string;
  fieldOfStudy?: string;
  targetLevel?: string;
  fundingCoverageOrSalary?: string;
  fundingAmountOrStipend?: string;
  eligibility: string;
  deadline: string; // YYYY-MM-DD
  applicationUrl: string;
  sourceName: string;
  isBookmarked?: boolean;
  hasReminder?: boolean;
  description: string;
  benefits?: string[];
  requirements?: string[];
}

// ----------------------------------------------------
// STUDENT NETWORK & COMMUNITY
// ----------------------------------------------------
export interface StudentNetworkProfile {
  id: string;
  name: string;
  preferredName?: string;
  leadershipTitle?: string;
  avatar?: string;
  avatarUrl?: string;
  institution: string;
  university?: string;
  programme: string;
  department: string;
  currentYear: number;
  yearOfStudy?: number;
  country: string;
  biography: string;
  bio?: string;
  skills: string[];
  interests: string[];
  studyInterests?: string[];
  coursesEnrolled?: string[];
  badges?: string[];
  studyGoals: string[];
  languages: string[];
  email?: string;
  phone?: string;
  whatsapp?: string;
  preferredContact: 'campusflow_msg' | 'email' | 'whatsapp' | 'phone';
  isProfilePublic: boolean;
  hideContactDetails: boolean;
  isAvailableForStudy?: boolean;
  privacySettings?: UserPrivacySettings;
  connectionStatus: 'none' | 'pending_sent' | 'connected' | 'blocked';
  reported?: boolean;
}

// ----------------------------------------------------
// ENDORSEMENT SYSTEM
// ----------------------------------------------------
export type EndorsementTargetType = 'lecturer' | 'course' | 'material' | 'project' | 'student' | 'event' | 'opportunity';

export interface EndorsementRecord {
  id: string;
  targetId: string;
  targetType: EndorsementTargetType;
  targetTitle: string;
  endorsedByUserId: string;
  endorsedByUserName: string;
  endorsedByUserRole: string;
  endorsementNote?: string;
  timestamp: string;
}

// ----------------------------------------------------
// ATTENDANCE & QR CODE SYSTEM
// ----------------------------------------------------
export interface AttendanceRecord {
  id: string;
  courseCode: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  studentRegNo?: string;
  sessionTitle: string;
  sessionDate: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  markedVia: 'qr_scanner' | 'manual_lecturer' | 'geofenced_pin';
  status: 'present' | 'late' | 'excused' | 'absent';
  locationRecorded?: string;
}

export interface LecturerQRCodeSession {
  id: string;
  courseCode: string;
  courseTitle: string;
  lecturerName: string;
  sessionTopic: string;
  hall: string;
  validDate: string;
  expiresAt: string; // ISO string
  verificationToken: string;
  allowManualCode: boolean;
  manualPasscode: string; // e.g. "CF-9482"
  attendanceCount: number;
}


