export type EventCategory = 'lecture' | 'practical' | 'assessment' | 'personal' | 'sport' | 'society';
export type TaskStatus = 'not_started' | 'in_progress' | 'submitted' | 'graded';
export type UserRole = 'student' | 'lecturer' | 'admin';
export type LeadershipTitle = 
  | 'Student'
  | 'Class Representative'
  | 'Guild Leader'
  | 'Course Lecturer / Tutor'
  | 'Head of Department (HOD)'
  | 'Dean of Faculty / School'
  | 'Academic Registrar / Manager'
  | 'Vice Chancellor / Deputy VC'
  | 'System Administrator';

export type PaymentChannel = 'M-Pesa' | 'Mixx by Yas' | 'Airtel Money' | 'HaloPesa' | 'AzamPesa' | 'Card' | 'Bank' | 'QR';

export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  year: number;
  semester: string;
  lecturer: string;
  lecturerEmail?: string;
  hall: string;
  schedule: string;
  currentScore: number;
  attendance: number;
  notes: string;
  color?: string;
  category?: 'Core' | 'Elective' | 'Clinical' | 'Practical';
  syllabusTopics?: string[];
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  leadershipTitle?: LeadershipTitle | string;
  university: string;
  programme: string;
  currentYear: number;
  totalYears: number;
  avatar?: string;
  authProvider: 'email' | 'google' | 'microsoft';
  mfaEnabled: boolean;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimetableSlot {
  id: string;
  courseCode: string; // e.g. "BIO 203"
  courseName: string; // e.g. "Biostatistics & Research Methodology"
  day: DayOfWeek;
  startTime: string; // "09:30"
  endTime: string; // "10:30"
  timeFormatted?: string; // "09:30 - 10:30 AM"
  hall: string; // e.g. "Hall 03"
  building?: string; // e.g. "CoNAS Main Complex"
  lecturer: string; // e.g. "Prof. Assad"
  lecturerEmail?: string;
  year: number; // 1, 2, 3, 4
  semester: number; // 1, 2
  type: 'Lecture' | 'Practical' | 'Tutorial' | 'Seminar';
  color?: string;
  notes?: string;
  attendanceRequired?: boolean;
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
  readingTime?: string;
  tags: string[];
}

export interface ScientificBreakthrough {
  id: string;
  headline: string;
  summary: string;
  field: string; // e.g. "Space Technology", "Telemedicine & Digital Health", "Genomics & Tropical Disease", "Microgrid Clean Tech"
  relevantCourses: string[]; // e.g. ["ZOO 201", "BIO 203"]
  publishedDate: string;
  source: string; // e.g. "Nature Health", "NASA Tech Briefs", "Lancet Global Health"
  readingTime: string;
  discussionPrompt: string;
  upvotes: number;
  url?: string;
}

export interface CommunityMessage {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  timestamp: string;
  likes: number;
  isPinned?: boolean;
  isAlert?: boolean;
  alertType?: 'venue' | 'exam' | 'material' | 'general';
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
