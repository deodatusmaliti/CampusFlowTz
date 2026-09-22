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
  RolePermission 
} from '../types';
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

const KEYS = {
  USER: 'campusflow_user_v1',
  COURSES: 'campusflow_courses_v1',
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
  getUser: (): User => safeGet(KEYS.USER, INITIAL_USER),
  saveUser: (user: User): void => {
    safeSet(KEYS.USER, user);
    StorageService.enqueueSync('profile', 'update', `User profile updated: ${user.name}`);
  },

  getCourses: (): Course[] => safeGet(KEYS.COURSES, INITIAL_COURSES),
  saveCourses: (courses: Course[]): void => {
    safeSet(KEYS.COURSES, courses);
    StorageService.enqueueSync('course', 'update', `Course catalogue updated (${courses.length} courses)`);
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

  resetToDefaults: (): void => {
    localStorage.removeItem(KEYS.USER);
    localStorage.removeItem(KEYS.COURSES);
    localStorage.removeItem(KEYS.EVENTS);
    localStorage.removeItem(KEYS.TASKS);
    localStorage.removeItem(KEYS.COMMUNITIES);
    localStorage.removeItem(KEYS.PAYMENTS);
    localStorage.removeItem(KEYS.NOTIFICATIONS);
    localStorage.removeItem(KEYS.ANNOUNCEMENTS);
    localStorage.removeItem(KEYS.UNIVERSITIES);
    localStorage.removeItem(KEYS.STUDY_RESOURCES);
    localStorage.removeItem(KEYS.BREAKTHROUGHS);
    localStorage.removeItem(KEYS.TIMETABLE);
    localStorage.removeItem(KEYS.MANAGED_USERS);
    localStorage.removeItem(KEYS.ROLE_PERMISSIONS);
    localStorage.removeItem(KEYS.SYNC_QUEUE);
    localStorage.removeItem(KEYS.LOGS);
    localStorage.removeItem(KEYS.SIMULATED_OFFLINE);
  }
};
