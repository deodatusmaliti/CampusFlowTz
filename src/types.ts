export type EventCategory = 'lecture' | 'practical' | 'assessment' | 'personal' | 'sport' | 'society';
export type TaskStatus = 'not_started' | 'in_progress' | 'submitted' | 'graded';
export type UserRole = 'student' | 'lecturer' | 'admin';
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
  university: string;
  programme: string;
  currentYear: number;
  totalYears: number;
  avatar?: string;
  authProvider: 'email' | 'google' | 'microsoft';
  mfaEnabled: boolean;
}

export interface CommunityMessage {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  timestamp: string;
  likes: number;
  isPinned?: boolean;
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
  type: 'academic' | 'payment' | 'system' | 'social';
}

export interface SyncQueueItem {
  id: string;
  entity: 'event' | 'task' | 'course' | 'payment' | 'profile';
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
