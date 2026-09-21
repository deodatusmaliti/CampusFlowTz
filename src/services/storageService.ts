import { Course, CalendarEvent, Task, User, Community, PaymentRecord, SyncQueueItem, SystemLog, PushNotification } from '../types';
import { 
  INITIAL_USER, 
  INITIAL_COURSES, 
  INITIAL_EVENTS, 
  INITIAL_TASKS, 
  INITIAL_COMMUNITIES, 
  INITIAL_PAYMENTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_SYSTEM_LOGS 
} from '../data/mockInitialData';

const KEYS = {
  USER: 'campusflow_user_v1',
  COURSES: 'campusflow_courses_v1',
  EVENTS: 'campusflow_events_v1',
  TASKS: 'campusflow_tasks_v1',
  COMMUNITIES: 'campusflow_communities_v1',
  PAYMENTS: 'campusflow_payments_v1',
  NOTIFICATIONS: 'campusflow_notifications_v1',
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
    localStorage.removeItem(KEYS.SYNC_QUEUE);
    localStorage.removeItem(KEYS.LOGS);
    localStorage.removeItem(KEYS.SIMULATED_OFFLINE);
  }
};
