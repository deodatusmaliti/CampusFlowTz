import { 
  Course, 
  CalendarEvent, 
  Task, 
  User, 
  Community, 
  PaymentRecord, 
  SyncQueueItem, 
  SystemLog, 
  PushNotification,
  Announcement,
  StudyResource,
  ScientificBreakthrough,
  TimetableSlot,
  ManagedUser,
  RolePermission,
  StudyMaterial,
  DiscussionCall,
  LeisureEvent,
  OpportunityItem,
  StudentNetworkProfile,
  EndorsementRecord,
  AlertPreferences,
  SystemAlertItem,
  AttendanceRecord,
  LecturerQRCodeSession,
  StudyGroup,
  DirectConversation,
  InstitutionCreditConfig
} from '../types';
import { REAL_DEMO_MATERIALS } from './materialFileService';
import { 
  INITIAL_USER, 
  INITIAL_COURSES, 
  INITIAL_EVENTS, 
  INITIAL_TASKS, 
  INITIAL_COMMUNITIES, 
  INITIAL_PAYMENTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_SYSTEM_LOGS,
  INITIAL_UNIVERSITIES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_STUDY_RESOURCES,
  INITIAL_BREAKTHROUGHS,
  INITIAL_TIMETABLE,
  INITIAL_MANAGED_USERS,
  INITIAL_ROLE_PERMISSIONS
} from '../data/mockInitialData';
import {
  EXTENDED_DISCIPLINE_COURSES,
  INITIAL_STUDY_MATERIALS,
  INITIAL_CALL_SESSIONS,
  INITIAL_LEISURE_EVENTS,
  INITIAL_OPPORTUNITIES,
  INITIAL_STUDENT_PROFILES,
  INITIAL_ENDORSEMENTS,
  DEFAULT_ALERT_PREFERENCES,
  INITIAL_SYSTEM_ALERTS
} from '../data/academicExtendedData';
import { STANDARD_DEMO_COURSES } from '../data/demoCourses';
import {
  INITIAL_STUDY_GROUPS,
  INITIAL_DIRECT_CONVERSATIONS
} from '../data/chatData';

const KEYS = {
  USER: 'campusflow_user_v1',
  COURSES: 'campusflow_courses_v1',
  MAX_CREDIT_LIMIT: 'campusflow_max_credit_limit_v1',
  EVENTS: 'campusflow_events_v1',
  TASKS: 'campusflow_tasks_v1',
  COMMUNITIES: 'campusflow_communities_v1',
  PAYMENTS: 'campusflow_payments_v1',
  NOTIFICATIONS: 'campusflow_notifications_v1',
  ANNOUNCEMENTS: 'campusflow_announcements_v1',
  UNIVERSITIES: 'campusflow_universities_v1',
  STUDY_RESOURCES: 'campusflow_study_resources_v1',
  BREAKTHROUGHS: 'campusflow_breakthroughs_v1',
  FEED_METADATA: 'campusflow_feed_metadata_v1',
  TIMETABLE: 'campusflow_timetable_v1',
  MANAGED_USERS: 'campusflow_managed_users_v1',
  ROLE_PERMISSIONS: 'campusflow_role_permissions_v1',
  SYNC_QUEUE: 'campusflow_sync_queue_v1',
  LOGS: 'campusflow_logs_v1',
  SIMULATED_OFFLINE: 'campusflow_simulated_offline_v1',
  STUDY_MATERIALS: 'campusflow_study_materials_v1',
  DISCUSSION_CALLS: 'campusflow_discussion_calls_v1',
  LEISURE_EVENTS: 'campusflow_leisure_events_v1',
  OPPORTUNITIES: 'campusflow_opportunities_v1',
  STUDENT_PROFILES: 'campusflow_student_profiles_v1',
  ENDORSEMENTS: 'campusflow_endorsements_v1',
  ALERT_PREFS: 'campusflow_alert_prefs_v1',
  SYSTEM_ALERTS: 'campusflow_system_alerts_v1',
  ATTENDANCE_RECORDS: 'campusflow_attendance_records_v1',
  QR_SESSIONS: 'campusflow_qr_sessions_v1',
  STUDY_GROUPS: 'campusflow_study_groups_v1',
  DIRECT_CONVERSATIONS: 'campusflow_direct_conversations_v1',
  GENERAL_SETTINGS: 'campusflow_general_settings_v1',
  CREDIT_CONFIG: 'campusflow_institution_credit_config_v2',
};

const DEFAULT_CREDIT_CONFIG: InstitutionCreditConfig = {
  institutionName: 'University of Dar es Salaam',
  systemType: 'tanzania',
  unitLabel: 'Credits',
  normalMinCredits: 48,
  recommendedCredits: 60,
  normalMaxCredits: 72,
  annualCredits: 120,
  allowWarnings: false, // Optional; disabled by default!
  practicalWeightingMultiplier: 1.0,
  disclaimerAccepted: true,
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    if (!val) return fallback;
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

export const StorageService = {
  getUser: (): User => {
    const stored = safeGet<Partial<User>>(KEYS.USER, INITIAL_USER);
    return { ...INITIAL_USER, ...stored };
  },
  saveUser: (user: User): void => {
    safeSet(KEYS.USER, user);
    StorageService.enqueueSync('profile', 'update', `User profile updated: ${user.name}`);
  },

  // Combined courses catalogue & Enrollment
  getMaxCreditLimit: (): number => {
    return safeGet<number>(KEYS.MAX_CREDIT_LIMIT, 24);
  },
  saveMaxCreditLimit: (limit: number): void => {
    safeSet(KEYS.MAX_CREDIT_LIMIT, limit);
  },
  getCourses: (): Course[] => {
    const stored = safeGet<Course[]>(KEYS.COURSES, []);
    if (stored.length === 0) {
      // Seed combined courses with priority to standard demo courses
      const allSeed = [
        ...STANDARD_DEMO_COURSES,
        ...EXTENDED_DISCIPLINE_COURSES.filter(ec => !STANDARD_DEMO_COURSES.some(c => c.code === ec.code))
      ];
      safeSet(KEYS.COURSES, allSeed);
      return allSeed;
    }
    // Ensure all 8 standard demo courses exist in storage
    const missingDemos = STANDARD_DEMO_COURSES.filter(demo => !stored.some(s => s.code.toUpperCase() === demo.code.toUpperCase()));
    if (missingDemos.length > 0) {
      const merged = [...missingDemos, ...stored];
      safeSet(KEYS.COURSES, merged);
      return merged;
    }
    return stored;
  },
  saveCourses: (courses: Course[]): void => {
    safeSet(KEYS.COURSES, courses);
    StorageService.enqueueSync('course', 'update', `Course catalogue updated (${courses.length} courses)`);
  },
  saveCourse: (course: Course): Course[] => {
    const courses = StorageService.getCourses();
    const idx = courses.findIndex(c => c.id === course.id || c.code.toUpperCase() === course.code.toUpperCase());
    let updated: Course[];
    if (idx >= 0) {
      updated = [...courses];
      updated[idx] = { ...courses[idx], ...course };
    } else {
      updated = [course, ...courses];
    }
    StorageService.saveCourses(updated);
    return updated;
  },
  deleteCourse: (courseId: string): Course[] => {
    const courses = StorageService.getCourses();
    const updated = courses.filter(c => c.id !== courseId);
    StorageService.saveCourses(updated);
    return updated;
  },
  resetDemoCourses: (): Course[] => {
    const fresh = [
      ...STANDARD_DEMO_COURSES,
      ...EXTENDED_DISCIPLINE_COURSES.filter(ec => !STANDARD_DEMO_COURSES.some(c => c.code === ec.code))
    ];
    safeSet(KEYS.COURSES, fresh);
    StorageService.enqueueSync('course', 'update', 'Reset courses to standard curriculum demo dataset');
    return fresh;
  },
  enrollInCourse: (courseId: string): Course[] => {
    const courses = StorageService.getCourses();
    const updated = courses.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          enrollmentStatus: 'enrolled' as const,
          status: 'active' as const,
          enrolledCount: (c.enrolledCount || 0) + 1
        };
      }
      return c;
    });
    StorageService.saveCourses(updated);
    return updated;
  },
  dropCourse: (courseId: string): Course[] => {
    const courses = StorageService.getCourses();
    const updated = courses.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          enrollmentStatus: 'available' as const,
          status: 'withdrawn' as const,
          enrolledCount: Math.max(0, (c.enrolledCount || 1) - 1)
        };
      }
      return c;
    });
    StorageService.saveCourses(updated);
    return updated;
  },
  updateCourseStatus: (courseId: string, status: 'active' | 'completed' | 'withdrawn'): Course[] => {
    const courses = StorageService.getCourses();
    const updated = courses.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          status,
          enrollmentStatus: status === 'withdrawn' ? ('available' as const) : ('enrolled' as const)
        };
      }
      return c;
    });
    StorageService.saveCourses(updated);
    return updated;
  },
  toggleBookmarkCourse: (courseId: string): Course[] => {
    const courses = StorageService.getCourses();
    const updated = courses.map(c => c.id === courseId ? { ...c, isBookmarked: !c.isBookmarked } : c);
    StorageService.saveCourses(updated);
    return updated;
  },

  getEvents: (): CalendarEvent[] => safeGet(KEYS.EVENTS, INITIAL_EVENTS),
  saveEvents: (events: CalendarEvent[]): void => {
    safeSet(KEYS.EVENTS, events);
    StorageService.enqueueSync('event', 'update', `Timetable events updated (${events.length} items)`);
  },

  getTasks: (): Task[] => safeGet(KEYS.TASKS, INITIAL_TASKS),
  saveTasks: (tasks: Task[]): void => {
    safeSet(KEYS.TASKS, tasks);
    StorageService.enqueueSync('task', 'update', `Tasks updated (${tasks.length} tasks)`);
  },

  getCommunities: (): Community[] => safeGet(KEYS.COMMUNITIES, INITIAL_COMMUNITIES),
  saveCommunities: (communities: Community[]): void => {
    safeSet(KEYS.COMMUNITIES, communities);
  },

  getPayments: (): PaymentRecord[] => safeGet(KEYS.PAYMENTS, INITIAL_PAYMENTS),
  savePayments: (payments: PaymentRecord[]): void => {
    safeSet(KEYS.PAYMENTS, payments);
    StorageService.enqueueSync('payment', 'create', `Payment ledger updated (${payments.length} records)`);
  },

  getNotifications: (): PushNotification[] => safeGet(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  saveNotifications: (notifications: PushNotification[]): void => {
    safeSet(KEYS.NOTIFICATIONS, notifications);
  },

  getAnnouncements: (): Announcement[] => safeGet(KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS),
  saveAnnouncements: (announcements: Announcement[]): void => {
    safeSet(KEYS.ANNOUNCEMENTS, announcements);
    StorageService.enqueueSync('event', 'create', `Campus announcements updated (${announcements.length} records)`);
  },
  addAnnouncement: (announcement: Announcement): void => {
    const list = StorageService.getAnnouncements();
    const updated = [announcement, ...list];
    safeSet(KEYS.ANNOUNCEMENTS, updated);
    StorageService.enqueueSync('event', 'create', `New announcement broadcast: ${announcement.title}`);
  },
  acknowledgeAnnouncement: (id: string): Announcement[] => {
    const list = StorageService.getAnnouncements();
    const updated = list.map(a => a.id === id ? { ...a, acknowledged: true, acknowledgedCount: (a.acknowledgedCount || 0) + 1 } : a);
    safeSet(KEYS.ANNOUNCEMENTS, updated);
    return updated;
  },

  getUniversities: (): string[] => safeGet(KEYS.UNIVERSITIES, INITIAL_UNIVERSITIES),
  addUniversity: (uniName: string): string[] => {
    const trimmed = uniName.trim();
    if (!trimmed) return StorageService.getUniversities();
    const existing = StorageService.getUniversities();
    if (existing.includes(trimmed)) return existing;
    const updated = [trimmed, ...existing];
    safeSet(KEYS.UNIVERSITIES, updated);
    return updated;
  },

  getStudyResources: (): StudyResource[] => safeGet(KEYS.STUDY_RESOURCES, INITIAL_STUDY_RESOURCES),
  saveStudyResources: (res: StudyResource[]): void => {
    safeSet(KEYS.STUDY_RESOURCES, res);
  },

  getBreakthroughs: (): ScientificBreakthrough[] => safeGet(KEYS.BREAKTHROUGHS, INITIAL_BREAKTHROUGHS),
  saveBreakthroughs: (items: ScientificBreakthrough[]): void => {
    safeSet(KEYS.BREAKTHROUGHS, items);
  },
  getFeedMetadata: (): { lastFetched: number; mode: string; activeCategory?: string } => 
    safeGet(KEYS.FEED_METADATA, { lastFetched: 0, mode: 'initial_cache', activeCategory: 'recommended' }),
  saveFeedMetadata: (meta: { lastFetched: number; mode: string; activeCategory?: string }): void => {
    safeSet(KEYS.FEED_METADATA, meta);
  },
  upvoteBreakthrough: (id: string): ScientificBreakthrough[] => {
    const list = StorageService.getBreakthroughs();
    const updated = list.map(b => b.id === id ? { ...b, upvotes: b.upvotes + 1 } : b);
    safeSet(KEYS.BREAKTHROUGHS, updated);
    return updated;
  },

  getSyncQueue: (): SyncQueueItem[] => safeGet(KEYS.SYNC_QUEUE, []),
  
  enqueueSync: (entity: SyncQueueItem['entity'], action: SyncQueueItem['action'], summary: string): void => {
    const queue = StorageService.getSyncQueue();
    const item: SyncQueueItem = {
      id: 'sync_' + Math.random().toString(36).substring(2, 9),
      entity,
      action,
      timestamp: new Date().toISOString(),
      status: 'pending',
      payloadSummary: summary,
    };
    safeSet(KEYS.SYNC_QUEUE, [item, ...queue]);
  },

  flushSyncQueue: (): { syncedCount: number } => {
    const queue = StorageService.getSyncQueue();
    const count = queue.filter(q => q.status === 'pending').length;
    // Mark all as synced
    const updated = queue.map(q => ({ ...q, status: 'synced' as const }));
    safeSet(KEYS.SYNC_QUEUE, updated.slice(0, 30)); // keep last 30 for history

    // Add log
    StorageService.addLog('sync-service', 'info', `Flushed ${count} queued items with cloud backend. Zero conflicts detected.`);
    return { syncedCount: count };
  },

  getLogs: (): SystemLog[] => safeGet(KEYS.LOGS, INITIAL_SYSTEM_LOGS),
  addLog: (service: string, level: SystemLog['level'], message: string): void => {
    const logs = StorageService.getLogs();
    const newLog: SystemLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23),
      service,
      level,
      message,
      traceId: 'trc-' + Math.random().toString(36).substring(2, 8),
    };
    safeSet(KEYS.LOGS, [newLog, ...logs].slice(0, 50));
  },

  getTimetable: (): TimetableSlot[] => safeGet(KEYS.TIMETABLE, INITIAL_TIMETABLE),
  saveTimetable: (slots: TimetableSlot[]): void => {
    safeSet(KEYS.TIMETABLE, slots);
    StorageService.enqueueSync('timetable', 'update', `Updated timetable with ${slots.length} class slots`);
  },
  addTimetableSlot: (slot: TimetableSlot): TimetableSlot[] => {
    const current = StorageService.getTimetable();
    const updated = [...current, slot];
    StorageService.saveTimetable(updated);
    return updated;
  },
  deleteTimetableSlot: (id: string): TimetableSlot[] => {
    const current = StorageService.getTimetable();
    const updated = current.filter(s => s.id !== id);
    StorageService.saveTimetable(updated);
    return updated;
  },
  importTimetableSlots: (newSlots: TimetableSlot[], mode: 'replace' | 'merge' = 'merge'): TimetableSlot[] => {
    let result: TimetableSlot[];
    if (mode === 'replace') {
      result = newSlots;
    } else {
      const current = StorageService.getTimetable();
      // Avoid exact duplicates by day + startTime + courseCode
      const existingKeys = new Set(current.map(s => `${s.day}_${s.startTime}_${s.courseCode}`));
      const filtered = newSlots.filter(s => !existingKeys.has(`${s.day}_${s.startTime}_${s.courseCode}`));
      result = [...current, ...filtered];
    }
    StorageService.saveTimetable(result);
    StorageService.addLog('timetable-service', 'info', `Imported ${newSlots.length} timetable entries (${mode} mode)`);
    return result;
  },

  getManagedUsers: (): ManagedUser[] => safeGet(KEYS.MANAGED_USERS, INITIAL_MANAGED_USERS),
  saveManagedUsers: (users: ManagedUser[]): void => {
    safeSet(KEYS.MANAGED_USERS, users);
    StorageService.enqueueSync('users', 'update', `Updated user directory (${users.length} accounts)`);
  },
  updateManagedUser: (updatedUser: ManagedUser): ManagedUser[] => {
    const users = StorageService.getManagedUsers();
    const updated = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    StorageService.saveManagedUsers(updated);
    return updated;
  },

  getRolePermissions: (): RolePermission[] => safeGet(KEYS.ROLE_PERMISSIONS, INITIAL_ROLE_PERMISSIONS),
  saveRolePermissions: (perms: RolePermission[]): void => {
    safeSet(KEYS.ROLE_PERMISSIONS, perms);
    StorageService.enqueueSync('permissions', 'update', `Updated role access control matrix`);
  },

  isSimulatedOffline: (): boolean => safeGet(KEYS.SIMULATED_OFFLINE, false),
  setSimulatedOffline: (val: boolean): void => {
    safeSet(KEYS.SIMULATED_OFFLINE, val);
  },

  // --------------------------------------------------------------------------
  // STUDY MATERIALS HUB
  // --------------------------------------------------------------------------
  getStudyMaterials: (): StudyMaterial[] => {
    const list = safeGet<StudyMaterial[]>(KEYS.STUDY_MATERIALS, []);
    if (list.length === 0) {
      // Seed with real demo materials first + extended academic initial data
      const merged = [...REAL_DEMO_MATERIALS, ...INITIAL_STUDY_MATERIALS];
      safeSet(KEYS.STUDY_MATERIALS, merged);
      return merged;
    }
    // Ensure the real demo sample files are always accessible at top
    const missingDemos = REAL_DEMO_MATERIALS.filter(demo => !list.some(m => m.id === demo.id));
    if (missingDemos.length > 0) {
      const combined = [...missingDemos, ...list];
      safeSet(KEYS.STUDY_MATERIALS, combined);
      return combined;
    }
    return list;
  },
  saveStudyMaterials: (items: StudyMaterial[]): void => {
    safeSet(KEYS.STUDY_MATERIALS, items);
  },

  // --------------------------------------------------------------------------
  // FLEXIBLE INSTITUTION COURSE-CREDIT SYSTEM
  // --------------------------------------------------------------------------
  getCreditConfig: (): InstitutionCreditConfig => safeGet(KEYS.CREDIT_CONFIG, DEFAULT_CREDIT_CONFIG),
  saveCreditConfig: (config: InstitutionCreditConfig): void => {
    safeSet(KEYS.CREDIT_CONFIG, config);
  },
  saveStudyMaterial: (item: StudyMaterial): StudyMaterial[] => {
    const list = StorageService.getStudyMaterials();
    const existingIdx = list.findIndex(m => m.id === item.id);
    let updated: StudyMaterial[];
    if (existingIdx >= 0) {
      updated = [...list];
      updated[existingIdx] = item;
    } else {
      updated = [item, ...list];
    }
    StorageService.saveStudyMaterials(updated);
    return updated;
  },
  addStudyMaterial: (item: StudyMaterial): StudyMaterial[] => {
    const list = StorageService.getStudyMaterials();
    const updated = [item, ...list];
    StorageService.saveStudyMaterials(updated);
    StorageService.enqueueSync('course', 'create', `Uploaded study material: ${item.title}`);
    return updated;
  },
  toggleBookmarkMaterial: (id: string): StudyMaterial[] => {
    const list = StorageService.getStudyMaterials();
    const updated = list.map(m => m.id === id ? { ...m, isBookmarked: !m.isBookmarked } : m);
    StorageService.saveStudyMaterials(updated);
    return updated;
  },
  reportMaterial: (id: string): StudyMaterial[] => {
    const list = StorageService.getStudyMaterials();
    const updated = list.map(m => m.id === id ? { ...m, isReported: true } : m);
    StorageService.saveStudyMaterials(updated);
    return updated;
  },
  deleteStudyMaterial: (id: string): StudyMaterial[] => {
    const list = StorageService.getStudyMaterials();
    const updated = list.filter(m => m.id !== id);
    StorageService.saveStudyMaterials(updated);
    return updated;
  },
  incrementDownloadCount: (id: string): StudyMaterial[] => {
    const list = StorageService.getStudyMaterials();
    const updated = list.map(m => m.id === id ? { ...m, downloadCount: (m.downloadCount || 0) + 1 } : m);
    StorageService.saveStudyMaterials(updated);
    return updated;
  },

  // --------------------------------------------------------------------------
  // DISCUSSION & CALL-PLANNING HUB
  // --------------------------------------------------------------------------
  getDiscussionCalls: (): DiscussionCall[] => safeGet(KEYS.DISCUSSION_CALLS, INITIAL_CALL_SESSIONS),
  saveDiscussionCalls: (items: DiscussionCall[]): void => {
    safeSet(KEYS.DISCUSSION_CALLS, items);
  },
  addDiscussionCall: (call: DiscussionCall): DiscussionCall[] => {
    const list = StorageService.getDiscussionCalls();
    const updated = [call, ...list];
    StorageService.saveDiscussionCalls(updated);
    StorageService.enqueueSync('event', 'create', `Created discussion call: ${call.title}`);
    return updated;
  },
  updateDiscussionCall: (call: DiscussionCall): DiscussionCall[] => {
    const list = StorageService.getDiscussionCalls();
    const updated = list.map(c => c.id === call.id ? call : c);
    StorageService.saveDiscussionCalls(updated);
    return updated;
  },
  rsvpDiscussionCall: (callId: string, userId: string, response: 'going' | 'maybe' | 'cannot'): DiscussionCall[] => {
    const list = StorageService.getDiscussionCalls();
    const updated = list.map(c => {
      if (c.id !== callId) return c;
      const going = (c.rsvpGoing || []).filter(u => u !== userId);
      const maybe = (c.rsvpMaybe || []).filter(u => u !== userId);
      const cannot = (c.rsvpCannot || []).filter(u => u !== userId);
      if (response === 'going') going.push(userId);
      if (response === 'maybe') maybe.push(userId);
      if (response === 'cannot') cannot.push(userId);
      return { ...c, rsvpGoing: going, rsvpMaybe: maybe, rsvpCannot: cannot };
    });
    StorageService.saveDiscussionCalls(updated);
    return updated;
  },
  toggleAddCallToTimetable: (callId: string): DiscussionCall[] => {
    const list = StorageService.getDiscussionCalls();
    const updated = list.map(c => c.id === callId ? { ...c, addedToTimetable: !c.addedToTimetable } : c);
    StorageService.saveDiscussionCalls(updated);
    return updated;
  },

  // --------------------------------------------------------------------------
  // ENTERTAINMENT & LEISURE HUB
  // --------------------------------------------------------------------------
  getLeisureEvents: (): LeisureEvent[] => safeGet(KEYS.LEISURE_EVENTS, INITIAL_LEISURE_EVENTS),
  saveLeisureEvents: (items: LeisureEvent[]): void => {
    safeSet(KEYS.LEISURE_EVENTS, items);
  },
  addLeisureEvent: (evt: LeisureEvent): LeisureEvent[] => {
    const list = StorageService.getLeisureEvents();
    const updated = [evt, ...list];
    StorageService.saveLeisureEvents(updated);
    return updated;
  },
  rsvpLeisureEvent: (eventId: string, userId: string, status: 'going' | 'interested' | 'not_going'): LeisureEvent[] => {
    const list = StorageService.getLeisureEvents();
    const updated = list.map(e => {
      if (e.id !== eventId) return e;
      const going = (e.rsvpGoing || []).filter(u => u !== userId);
      const interested = (e.rsvpInterested || []).filter(u => u !== userId);
      const notGoing = (e.rsvpNotGoing || []).filter(u => u !== userId);
      if (status === 'going') going.push(userId);
      if (status === 'interested') interested.push(userId);
      if (status === 'not_going') notGoing.push(userId);
      return { ...e, rsvpGoing: going, rsvpInterested: interested, rsvpNotGoing: notGoing };
    });
    StorageService.saveLeisureEvents(updated);
    return updated;
  },
  toggleBookmarkLeisure: (eventId: string): LeisureEvent[] => {
    const list = StorageService.getLeisureEvents();
    const updated = list.map(e => e.id === eventId ? { ...e, isBookmarked: !e.isBookmarked } : e);
    StorageService.saveLeisureEvents(updated);
    return updated;
  },
  deleteLeisureEvent: (eventId: string): LeisureEvent[] => {
    const list = StorageService.getLeisureEvents();
    const updated = list.filter(e => e.id !== eventId);
    StorageService.saveLeisureEvents(updated);
    return updated;
  },

  // --------------------------------------------------------------------------
  // SCHOLARSHIPS & JOB OPPORTUNITIES HUB
  // --------------------------------------------------------------------------
  getOpportunities: (): OpportunityItem[] => safeGet(KEYS.OPPORTUNITIES, INITIAL_OPPORTUNITIES),
  saveOpportunities: (items: OpportunityItem[]): void => {
    safeSet(KEYS.OPPORTUNITIES, items);
  },
  toggleBookmarkOpportunity: (id: string): OpportunityItem[] => {
    const list = StorageService.getOpportunities();
    const updated = list.map(o => o.id === id ? { ...o, isBookmarked: !o.isBookmarked } : o);
    StorageService.saveOpportunities(updated);
    return updated;
  },
  toggleReminderOpportunity: (id: string): OpportunityItem[] => {
    const list = StorageService.getOpportunities();
    const updated = list.map(o => o.id === id ? { ...o, hasReminder: !o.hasReminder } : o);
    StorageService.saveOpportunities(updated);
    return updated;
  },

  // --------------------------------------------------------------------------
  // STUDENT NETWORK & COMMUNITY PROFILES
  // --------------------------------------------------------------------------
  getStudentProfiles: (): StudentNetworkProfile[] => safeGet(KEYS.STUDENT_PROFILES, INITIAL_STUDENT_PROFILES),
  saveStudentProfiles: (profiles: StudentNetworkProfile[]): void => {
    safeSet(KEYS.STUDENT_PROFILES, profiles);
  },
  sendConnectionRequest: (profileId: string): StudentNetworkProfile[] => {
    const list = StorageService.getStudentProfiles();
    const updated = list.map(p => p.id === profileId ? { ...p, connectionStatus: 'pending_sent' as const } : p);
    StorageService.saveStudentProfiles(updated);
    return updated;
  },
  blockStudentProfile: (profileId: string): StudentNetworkProfile[] => {
    const list = StorageService.getStudentProfiles();
    const updated = list.map(p => p.id === profileId ? { ...p, connectionStatus: 'blocked' as const } : p);
    StorageService.saveStudentProfiles(updated);
    return updated;
  },

  // --------------------------------------------------------------------------
  // ENDORSEMENT SYSTEM
  // --------------------------------------------------------------------------
  getEndorsements: (): EndorsementRecord[] => safeGet(KEYS.ENDORSEMENTS, INITIAL_ENDORSEMENTS),
  saveEndorsements: (items: EndorsementRecord[]): void => {
    safeSet(KEYS.ENDORSEMENTS, items);
  },
  addEndorsement: (record: Omit<EndorsementRecord, 'id' | 'timestamp'>): EndorsementRecord[] => {
    const list = StorageService.getEndorsements();
    // Prevent duplicates from same user to same target
    const exists = list.some(e => e.targetId === record.targetId && e.endorsedByUserId === record.endorsedByUserId);
    if (exists) return list;

    const newRecord: EndorsementRecord = {
      ...record,
      id: 'end_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    const updated = [newRecord, ...list];
    StorageService.saveEndorsements(updated);
    return updated;
  },
  removeEndorsement: (targetId: string, userId: string): EndorsementRecord[] => {
    const list = StorageService.getEndorsements();
    const updated = list.filter(e => !(e.targetId === targetId && e.endorsedByUserId === userId));
    StorageService.saveEndorsements(updated);
    return updated;
  },
  hasUserEndorsed: (targetId: string, userId: string): boolean => {
    const list = StorageService.getEndorsements();
    return list.some(e => e.targetId === targetId && e.endorsedByUserId === userId);
  },
  getEndorsementCount: (targetId: string): number => {
    const list = StorageService.getEndorsements();
    return list.filter(e => e.targetId === targetId).length;
  },

  // --------------------------------------------------------------------------
  // ALERTS, REMINDERS & NOTIFICATION MANAGEMENT
  // --------------------------------------------------------------------------
  getAlertPreferences: (): AlertPreferences => safeGet(KEYS.ALERT_PREFS, DEFAULT_ALERT_PREFERENCES),
  saveAlertPreferences: (prefs: AlertPreferences): void => {
    safeSet(KEYS.ALERT_PREFS, prefs);
  },
  getSystemAlerts: (): SystemAlertItem[] => safeGet(KEYS.SYSTEM_ALERTS, INITIAL_SYSTEM_ALERTS),
  saveSystemAlerts: (alerts: SystemAlertItem[]): void => {
    safeSet(KEYS.SYSTEM_ALERTS, alerts);
  },
  markAlertRead: (id: string): SystemAlertItem[] => {
    const alerts = StorageService.getSystemAlerts();
    const updated = alerts.map(a => a.id === id ? { ...a, isRead: true } : a);
    StorageService.saveSystemAlerts(updated);
    return updated;
  },
  markAllAlertsRead: (): SystemAlertItem[] => {
    const alerts = StorageService.getSystemAlerts();
    const updated = alerts.map(a => ({ ...a, isRead: true }));
    StorageService.saveSystemAlerts(updated);
    return updated;
  },
  dismissAlert: (id: string): SystemAlertItem[] => {
    const alerts = StorageService.getSystemAlerts();
    const updated = alerts.map(a => a.id === id ? { ...a, isDismissed: true } : a);
    StorageService.saveSystemAlerts(updated);
    return updated;
  },
  snoozeAlert: (id: string, minutes: number): SystemAlertItem[] => {
    const alerts = StorageService.getSystemAlerts();
    const snoozedUntil = new Date(Date.now() + minutes * 60000).toISOString();
    const updated = alerts.map(a => a.id === id ? { ...a, snoozedUntil, isDismissed: false } : a);
    StorageService.saveSystemAlerts(updated);
    return updated;
  },
  addSystemAlert: (alert: Omit<SystemAlertItem, 'id' | 'timestamp' | 'isRead' | 'isDismissed'>): SystemAlertItem[] => {
    const alerts = StorageService.getSystemAlerts();
    const newAlert: SystemAlertItem = {
      ...alert,
      id: 'alt_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      isRead: false,
      isDismissed: false,
    };
    const updated = [newAlert, ...alerts];
    StorageService.saveSystemAlerts(updated);
    return updated;
  },

  // --------------------------------------------------------------------------
  // QR CODE ATTENDANCE TRACKING & LECTURER SESSIONS
  // --------------------------------------------------------------------------
  getQRSessions: (): LecturerQRCodeSession[] => {
    const defaultSessions: LecturerQRCodeSession[] = [
      {
        id: 'qr_sess_1',
        courseCode: 'CS 211',
        courseTitle: 'Data Structures and Algorithms',
        lecturerName: 'Dr. J. Mvungi',
        sessionTopic: 'Binary Search Trees & Balanced AVL Trees',
        hall: 'Lecture Theatre B, CoICT',
        validDate: new Date().toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 1000 * 60 * 90).toISOString(), // 90 mins active
        verificationToken: 'CF-TZ-CS211-LIVE-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        allowManualCode: true,
        manualPasscode: 'CF-2114',
        attendanceCount: 42,
      },
      {
        id: 'qr_sess_2',
        courseCode: 'LAW 110',
        courseTitle: 'Constitutional Law of Tanzania',
        lecturerName: 'Prof. I. Shivji',
        sessionTopic: 'Separation of Powers & Judicial Review in East Africa',
        hall: 'Mlimani Law Theatre 1',
        validDate: new Date().toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        verificationToken: 'CF-TZ-LAW110-LIVE-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        allowManualCode: true,
        manualPasscode: 'CF-1108',
        attendanceCount: 88,
      },
      {
        id: 'qr_sess_3',
        courseCode: 'MD 301',
        courseTitle: 'Systemic Pathology & Morbid Anatomy',
        lecturerName: 'Dr. F. Massawe',
        sessionTopic: 'Granulomatous Inflammation & Clinical Case Analysis',
        hall: 'MUHAS Pathology Lab 3',
        validDate: new Date().toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
        verificationToken: 'CF-TZ-MD301-LIVE-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        allowManualCode: true,
        manualPasscode: 'CF-3019',
        attendanceCount: 35,
      }
    ];
    return safeGet(KEYS.QR_SESSIONS, defaultSessions);
  },

  saveQRSessions: (sessions: LecturerQRCodeSession[]): void => {
    safeSet(KEYS.QR_SESSIONS, sessions);
  },

  createQRSession: (session: Omit<LecturerQRCodeSession, 'id' | 'verificationToken' | 'attendanceCount'>): LecturerQRCodeSession => {
    const sessions = StorageService.getQRSessions();
    const token = `CF-TZ-${session.courseCode.replace(/\s+/g, '')}-${Date.now().toString(36).toUpperCase()}`;
    const newSession: LecturerQRCodeSession = {
      ...session,
      id: 'qr_sess_' + Date.now(),
      verificationToken: token,
      attendanceCount: 0,
    };
    const updated = [newSession, ...sessions];
    StorageService.saveQRSessions(updated);
    return newSession;
  },

  getAttendanceRecords: (): AttendanceRecord[] => {
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultRecords: AttendanceRecord[] = [
      {
        id: 'att_rec_1',
        courseCode: 'CS 211',
        courseTitle: 'Data Structures and Algorithms',
        studentId: 'user_tz_001',
        studentName: 'Amani Juma',
        studentRegNo: '2023-04-08912',
        sessionTitle: 'Array Lists & Linked Data Structures',
        sessionDate: todayStr,
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        markedVia: 'qr_scanner',
        status: 'present',
        locationRecorded: 'CoICT Kijitonyama Campus',
      },
      {
        id: 'att_rec_2',
        courseCode: 'LAW 110',
        courseTitle: 'Constitutional Law of Tanzania',
        studentId: 'user_tz_001',
        studentName: 'Amani Juma',
        studentRegNo: '2023-04-08912',
        sessionTitle: 'Historical Development of Constitutionalism',
        sessionDate: todayStr,
        timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        markedVia: 'qr_scanner',
        status: 'present',
        locationRecorded: 'UDOSM Main Campus',
      }
    ];
    return safeGet(KEYS.ATTENDANCE_RECORDS, defaultRecords);
  },

  saveAttendanceRecords: (records: AttendanceRecord[]): void => {
    safeSet(KEYS.ATTENDANCE_RECORDS, records);
  },

  markAttendance: (record: Omit<AttendanceRecord, 'id' | 'timestamp'>): { record: AttendanceRecord; updatedCourses: Course[] } => {
    const records = StorageService.getAttendanceRecords();
    const newRecord: AttendanceRecord = {
      ...record,
      id: 'att_' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    // Avoid exact duplicate on same course, sessionDate, studentId
    const filtered = records.filter(r => !(r.courseCode.toLowerCase() === record.courseCode.toLowerCase() && r.sessionDate === record.sessionDate && r.studentId === record.studentId));
    const updatedRecords = [newRecord, ...filtered];
    StorageService.saveAttendanceRecords(updatedRecords);

    // Update course attendance percentage
    const courses = StorageService.getCourses();
    const updatedCourses = courses.map(c => {
      if (c.code.toLowerCase() === record.courseCode.toLowerCase()) {
        const studentCourseRecords = updatedRecords.filter(
          r => r.courseCode.toLowerCase() === c.code.toLowerCase() && r.studentId === record.studentId
        );
        const presentCount = studentCourseRecords.filter(r => r.status === 'present' || r.status === 'late').length;
        const totalEstimated = Math.max(10, presentCount + 2);
        const newPercentage = Math.min(100, Math.round((presentCount / totalEstimated) * 100));
        return {
          ...c,
          attendance: Math.max(c.attendance || 80, newPercentage),
        };
      }
      return c;
    });
    StorageService.saveCourses(updatedCourses);

    // Increment QR session attendanceCount
    const sessions = StorageService.getQRSessions();
    const updatedSessions = sessions.map(s => {
      if (s.courseCode.toLowerCase() === record.courseCode.toLowerCase()) {
        return { ...s, attendanceCount: s.attendanceCount + 1 };
      }
      return s;
    });
    StorageService.saveQRSessions(updatedSessions);

    return { record: newRecord, updatedCourses };
  },

  // --------------------------------------------------------------------------
  // STUDY GROUPS & DIRECT CHAT MESSAGING (LOCAL DEMO STORAGE)
  // --------------------------------------------------------------------------
  getStudyGroups: (): StudyGroup[] => {
    return safeGet<StudyGroup[]>(KEYS.STUDY_GROUPS, INITIAL_STUDY_GROUPS);
  },

  saveStudyGroups: (groups: StudyGroup[]): void => {
    safeSet(KEYS.STUDY_GROUPS, groups);
    StorageService.enqueueSync('profile', 'update', `Study groups updated (${groups.length} active)`);
  },

  saveStudyGroup: (group: StudyGroup): StudyGroup[] => {
    const list = StorageService.getStudyGroups();
    const idx = list.findIndex(g => g.id === group.id);
    let updated: StudyGroup[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = group;
    } else {
      updated = [group, ...list];
    }
    StorageService.saveStudyGroups(updated);
    return updated;
  },

  getDirectConversations: (): DirectConversation[] => {
    return safeGet<DirectConversation[]>(KEYS.DIRECT_CONVERSATIONS, INITIAL_DIRECT_CONVERSATIONS);
  },

  saveDirectConversations: (conversations: DirectConversation[]): void => {
    safeSet(KEYS.DIRECT_CONVERSATIONS, conversations);
  },

  saveDirectConversation: (conversation: DirectConversation): DirectConversation[] => {
    const list = StorageService.getDirectConversations();
    const idx = list.findIndex(c => c.id === conversation.id);
    let updated: DirectConversation[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = conversation;
    } else {
      updated = [conversation, ...list];
    }
    StorageService.saveDirectConversations(updated);
    return updated;
  },

  // --------------------------------------------------------------------------
  // GENERAL APPLICATION SETTINGS
  // --------------------------------------------------------------------------
  getGeneralSettings: () => {
    return safeGet(KEYS.GENERAL_SETTINGS, {
      lectureArrivalAlerts: true,
      lectureLeadMinutes: 15,
      examScheduleAlerts: true,
      courseMaterialAlerts: true,
      studyGroupAlerts: true,
      opportunityAlerts: true,
      personalEventAlerts: true,
      catDeadlineCountdown: true,
      gradeReleaseAlerts: true,
      emailWeeklyDigest: false,
      emailUrgentTimetable: true,
      whatsappDailyBrief: false,
      whatsappEmergencyCancel: true,
      whatsappNumber: '+255 754 123 456',
      softSoundEnabled: true,
      soundVolume: 75,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '06:30',
      timezone: 'Africa/Dar_es_Salaam',
      calendarViewDefault: 'week',
      firstDayOfWeek: 'Monday',
      reminderLeadTime: '15_mins',
      language: 'en',
      theme: 'light',
      onlinePresence: true,
      readReceipts: true,
      mfaActive: true,
      sessionTimeoutMinutes: 60,
    });
  },

  saveGeneralSettings: (settings: any): void => {
    safeSet(KEYS.GENERAL_SETTINGS, settings);
  },

  // --------------------------------------------------------------------------
  // DEMO DATA MANAGEMENT: EXPORT, IMPORT, AND FACTORY RESET
  // --------------------------------------------------------------------------
  exportAllDataAsJSON: (): string => {
    const dump = {
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      user: StorageService.getUser(),
      courses: StorageService.getCourses(),
      timetable: StorageService.getTimetable(),
      events: StorageService.getEvents(),
      tasks: StorageService.getTasks(),
      studyMaterials: StorageService.getStudyMaterials(),
      studyGroups: StorageService.getStudyGroups(),
      directConversations: StorageService.getDirectConversations(),
      discussionCalls: StorageService.getDiscussionCalls(),
      leisureEvents: StorageService.getLeisureEvents(),
      opportunities: StorageService.getOpportunities(),
      studentProfiles: StorageService.getStudentProfiles(),
      endorsements: StorageService.getEndorsements(),
      alertPreferences: StorageService.getAlertPreferences(),
      systemAlerts: StorageService.getSystemAlerts(),
      payments: StorageService.getPayments(),
      generalSettings: StorageService.getGeneralSettings(),
    };
    return JSON.stringify(dump, null, 2);
  },

  importAllDataFromJSON: (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.user) safeSet(KEYS.USER, parsed.user);
      if (parsed.courses) safeSet(KEYS.COURSES, parsed.courses);
      if (parsed.timetable) safeSet(KEYS.TIMETABLE, parsed.timetable);
      if (parsed.events) safeSet(KEYS.EVENTS, parsed.events);
      if (parsed.tasks) safeSet(KEYS.TASKS, parsed.tasks);
      if (parsed.studyMaterials) safeSet(KEYS.STUDY_MATERIALS, parsed.studyMaterials);
      if (parsed.studyGroups) safeSet(KEYS.STUDY_GROUPS, parsed.studyGroups);
      if (parsed.directConversations) safeSet(KEYS.DIRECT_CONVERSATIONS, parsed.directConversations);
      if (parsed.discussionCalls) safeSet(KEYS.DISCUSSION_CALLS, parsed.discussionCalls);
      if (parsed.leisureEvents) safeSet(KEYS.LEISURE_EVENTS, parsed.leisureEvents);
      if (parsed.opportunities) safeSet(KEYS.OPPORTUNITIES, parsed.opportunities);
      if (parsed.studentProfiles) safeSet(KEYS.STUDENT_PROFILES, parsed.studentProfiles);
      if (parsed.endorsements) safeSet(KEYS.ENDORSEMENTS, parsed.endorsements);
      if (parsed.alertPreferences) safeSet(KEYS.ALERT_PREFS, parsed.alertPreferences);
      if (parsed.systemAlerts) safeSet(KEYS.SYSTEM_ALERTS, parsed.systemAlerts);
      if (parsed.payments) safeSet(KEYS.PAYMENTS, parsed.payments);
      if (parsed.generalSettings) safeSet(KEYS.GENERAL_SETTINGS, parsed.generalSettings);
      return true;
    } catch (e) {
      console.error('Failed to import JSON dump:', e);
      return false;
    }
  },

  resetToDefaults: (): void => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }
};
