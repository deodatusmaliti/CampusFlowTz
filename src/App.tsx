import React, { useState, useEffect, useCallback } from 'react';
import { 
  Course, 
  CalendarEvent, 
  Task, 
  User, 
  Community, 
  PaymentRecord, 
  PushNotification, 
  MicroserviceMetric, 
  SystemLog, 
  TaskStatus,
  EventCategory,
  Announcement,
  StudyResource,
  ScientificBreakthrough,
  TimetableSlot,
  ManagedUser,
  RolePermission
} from './types';
import { StorageService } from './services/storageService';
import { 
  INITIAL_MICROSERVICES, 
  INITIAL_COURSES,
  INITIAL_TIMETABLE 
} from './data/mockInitialData';

import { Navigation, ActiveTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { CoursesView } from './components/CoursesView';
import { StudyResourcesView } from './components/StudyResourcesView';
import { TasksView } from './components/TasksView';
import { GpaCalculatorView } from './components/GpaCalculatorView';
import { CommunitiesView } from './components/CommunitiesView';
import { PersonalPlansView } from './components/PersonalPlansView';
import { PaymentsView } from './components/PaymentsView';
import { TimetableShareView } from './components/TimetableShareView';
import { TimetableView } from './components/TimetableView';
import { UserManagementView } from './components/UserManagementView';
import { SystemArchitectureView } from './components/SystemArchitectureView';
import { SettingsView } from './components/SettingsView';
import { AcademicProfileView } from './components/AcademicProfileView';
import { AttendanceView } from './components/AttendanceView';
import { CourseEnrollmentView } from './components/CourseEnrollmentView';
import { StudyMaterialsView } from './components/StudyMaterialsView';
import { DiscussionsHubView } from './components/DiscussionsHubView';
import { LeisureEventsView } from './components/LeisureEventsView';
import { OpportunitiesView } from './components/OpportunitiesView';
import { StudentNetworkView } from './components/StudentNetworkView';
import { AlertsManagementView } from './components/AlertsManagementView';

import { AddEventModal } from './components/AddEventModal';
import { AddTaskModal } from './components/AddTaskModal';
import { AuthModal } from './components/AuthModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { UniversityPickerModal } from './components/UniversityPickerModal';
import { CreateAnnouncementModal } from './components/CreateAnnouncementModal';
import { CourseSpaceChatModal } from './components/CourseSpaceChatModal';
import { TimetableImportModal } from './components/TimetableImportModal';
import { AIChatAssistantModal } from './components/AIChatAssistantModal';
import { FeedStoryModal } from './components/FeedStoryModal';
import { ImminentLectureModal } from './components/ImminentLectureModal';
import { TimezoneSettingsModal } from './components/TimezoneSettingsModal';
import { FeedInfoModal } from './components/FeedInfoModal';
import { AIService } from './services/aiService';
import { ImminentLectureAlert } from './types';
import { soundAlerts } from './services/soundAlertService';

export default function App() {
  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [addEventInitialDate, setAddEventInitialDate] = useState<string | undefined>(undefined);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isUniversityPickerOpen, setIsUniversityPickerOpen] = useState(false);
  const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);
  const [isCourseChatOpen, setIsCourseChatOpen] = useState(false);
  const [activeChatCourse, setActiveChatCourse] = useState<Course | null>(null);
  const [isTimetableImportOpen, setIsTimetableImportOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiChatPrompt, setAiChatPrompt] = useState<string | undefined>(undefined);
  const [selectedFeedStory, setSelectedFeedStory] = useState<ScientificBreakthrough | null>(null);
  const [isFeedStoryOpen, setIsFeedStoryOpen] = useState(false);
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false);
  const [isFeedInfoModalOpen, setIsFeedInfoModalOpen] = useState(false);
  const [isRefreshingFeeds, setIsRefreshingFeeds] = useState(false);
  const [feedMetadata, setFeedMetadata] = useState(() => StorageService.getFeedMetadata());
  const [imminentAlert, setImminentAlert] = useState<ImminentLectureAlert | null>(null);
  const [isImminentAlertOpen, setIsImminentAlertOpen] = useState(false);

  // Application Data States
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getUser());
  const [courses, setCourses] = useState<Course[]>(() => StorageService.getCourses());
  const [events, setEvents] = useState<CalendarEvent[]>(() => StorageService.getEvents());
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());
  const [communities, setCommunities] = useState<Community[]>(() => StorageService.getCommunities());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => StorageService.getPayments());
  const [notifications, setNotifications] = useState<PushNotification[]>(() => StorageService.getNotifications());
  const [logs, setLogs] = useState<SystemLog[]>(() => StorageService.getLogs());
  const [metrics] = useState<MicroserviceMetric[]>(INITIAL_MICROSERVICES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => StorageService.getAnnouncements());
  const [studyResources, setStudyResources] = useState<StudyResource[]>(() => StorageService.getStudyResources());
  const [breakthroughs, setBreakthroughs] = useState<ScientificBreakthrough[]>(() => StorageService.getBreakthroughs());
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => StorageService.getTimetable());
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(() => StorageService.getManagedUsers());
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(() => StorageService.getRolePermissions());

  // Network & Sync State
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    return !navigator.onLine || StorageService.isSimulatedOffline();
  });
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => {
    return StorageService.getSyncQueue().filter(q => q.status === 'pending').length;
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load Test Simulation State
  const [isLoadTesting, setIsLoadTesting] = useState(false);
  const [loadTestResults, setLoadTestResults] = useState<{
    totalRequests: number;
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
    errorRate: number;
    throughputRps: number;
  } | null>(null);

  // Toast trigger helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Handle window online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (!StorageService.isSimulatedOffline()) {
        setIsOffline(false);
        showToast('Internet connection restored. Synchronizing delta queue...');
        handleSyncNow();
      }
    };
    const handleOffline = () => {
      setIsOffline(true);
      showToast('You are currently offline. Local changes will be saved to IndexedDB/Storage.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync Routine
  const handleSyncNow = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => {
      const result = StorageService.flushSyncQueue();
      setPendingSyncCount(0);
      setLogs(StorageService.getLogs());
      setIsSyncing(false);
      showToast(`Cloud synchronization complete: ${result.syncedCount} delta records resolved.`);
    }, 800);
  }, [showToast]);

  // Toggle Simulated Offline
  const handleToggleOffline = () => {
    const nextVal = !isOffline;
    setIsOffline(nextVal);
    StorageService.setSimulatedOffline(nextVal);
    if (nextVal) {
      showToast('Simulated Offline Mode enabled. All interactions cached locally.');
      StorageService.addLog('sync-engine', 'warn', 'Client disconnected from central gateway. Offline delta buffer active.');
    } else {
      showToast('Simulated Offline Mode disabled. Cloud gateway connected.');
      StorageService.addLog('sync-engine', 'info', 'Client re-connected to central cluster. Replaying delta log.');
      handleSyncNow();
    }
    setLogs(StorageService.getLogs());
  };

  // Event handlers
  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: 'ev_' + Date.now(),
    };
    const updated = [newEvent, ...events];
    setEvents(updated);
    StorageService.saveEvents(updated);
    setPendingSyncCount(StorageService.getSyncQueue().filter(q => q.status === 'pending').length);
    showToast(`"${newEvent.title}" added to academic calendar.`);

    // If reminder set, dispatch a notification
    if (newEvent.reminderMinutes && newEvent.reminderMinutes > 0) {
      const notif: PushNotification = {
        id: 'notif_' + Date.now(),
        title: `Reminder: ${newEvent.title}`,
        message: `Scheduled for ${newEvent.date} at ${newEvent.startTime} (${newEvent.location}).`,
        timestamp: 'Just now',
        read: false,
        type: 'academic',
      };
      const updatedNotifs = [notif, ...notifications];
      setNotifications(updatedNotifs);
      StorageService.saveNotifications(updatedNotifs);
    }
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    StorageService.saveEvents(updated);
    setPendingSyncCount(StorageService.getSyncQueue().filter(q => q.status === 'pending').length);
    showToast('Event removed from schedule.');
  };

  const handleSaveTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: 'tsk_' + Date.now(),
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    StorageService.saveTasks(updated);
    setPendingSyncCount(StorageService.getSyncQueue().filter(q => q.status === 'pending').length);
    showToast(`Assessment "${newTask.title}" registered.`);
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
    setTasks(updated);
    StorageService.saveTasks(updated);
    setPendingSyncCount(StorageService.getSyncQueue().filter(q => q.status === 'pending').length);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    StorageService.saveTasks(updated);
    setPendingSyncCount(StorageService.getSyncQueue().filter(q => q.status === 'pending').length);
    showToast('Task removed.');
  };

  const handleAddCourse = (course: Course) => {
    const updated = [course, ...courses];
    setCourses(updated);
    StorageService.saveCourses(updated);
    setPendingSyncCount(StorageService.getSyncQueue().filter(q => q.status === 'pending').length);
    showToast(`Course "${course.code}" added to catalogue.`);
  };

  const handleRemoveCourse = (courseId: string) => {
    const updated = courses.filter((c) => c.id !== courseId);
    setCourses(updated);
    StorageService.saveCourses(updated);
    setPendingSyncCount(StorageService.getSyncQueue().filter(q => q.status === 'pending').length);
    showToast('Course removed from catalogue.');
  };

  const handleLoadMedicineDemo = () => {
    const medCourses: Course[] = [
      {
        id: 'med_1',
        code: 'MED 101',
        title: 'Human Gross Anatomy & Embryology I',
        credits: 18,
        year: 1,
        semester: 'Semester 1',
        lecturer: 'Dr. M. Mushi',
        hall: 'Anatomy Dissection Hall',
        schedule: 'Mon 08:00–11:00',
        currentScore: 76,
        attendance: 94,
        notes: 'Cadaver dissection practical guides & osteology bones review.',
        category: 'Core',
      },
      {
        id: 'med_2',
        code: 'MED 102',
        title: 'Medical Physiology & Biophysics I',
        credits: 15,
        year: 1,
        semester: 'Semester 1',
        lecturer: 'Dr. A. Massawe',
        hall: 'Physiology Lecture Hall B',
        schedule: 'Tue 10:00–12:00',
        currentScore: 68,
        attendance: 90,
        notes: 'Action potentials and neuromuscular transmission.',
        category: 'Core',
      },
      {
        id: 'med_3',
        code: 'BMS 204',
        title: 'Medical Biostatistics & Epidemiology',
        credits: 12,
        year: 2,
        semester: 'Semester 1',
        lecturer: 'Dr. Neema Said',
        hall: 'ICT Lab 2',
        schedule: 'Wed 14:00–16:00',
        currentScore: 54,
        attendance: 80,
        notes: 'Epidemiological study designs: cohort vs case-control.',
        category: 'Core',
      },
      {
        id: 'med_4',
        code: 'MED 205',
        title: 'General Pharmacology & Toxicology',
        credits: 15,
        year: 2,
        semester: 'Semester 1',
        lecturer: 'Dr. H. Ally',
        hall: 'Medical Block 3 Hall',
        schedule: 'Thu 08:00–10:00',
        currentScore: 61,
        attendance: 85,
        notes: 'Pharmacokinetics: clearance and half-life calculations.',
        category: 'Core',
      },
      {
        id: 'med_5',
        code: 'MED 206',
        title: 'Introductory Clinical Skills & Ethics',
        credits: 10,
        year: 2,
        semester: 'Semester 1',
        lecturer: 'Prof. J. Kweka',
        hall: 'Muhimbili Skills Lab',
        schedule: 'Fri 14:00–17:00',
        currentScore: 78,
        attendance: 96,
        notes: 'Vital signs assessment, history taking and patient consent.',
        category: 'Clinical',
      },
      {
        id: 'med_6',
        code: 'MED 301',
        title: 'Systemic Pathology & Morbid Anatomy',
        credits: 16,
        year: 3,
        semester: 'Semester 1',
        lecturer: 'Dr. S. John',
        hall: 'Pathology Lab 1',
        schedule: 'Mon 14:00–16:00',
        currentScore: 64,
        attendance: 88,
        notes: 'Cellular injury, inflammation, and neoplasia slides.',
        category: 'Core',
      },
    ];

    setCourses(medCourses);
    StorageService.saveCourses(medCourses);
    showToast('Loaded 5-Year Medicine Curriculum Demo Catalogue.');
  };

  const handleSendMessage = (communityId: string, content: string) => {
    const newMessage = {
      id: 'msg_' + Date.now(),
      authorName: currentUser.name,
      authorRole: currentUser.role === 'lecturer' ? 'Lecturer' : 'Student',
      content,
      timestamp: 'Just now',
      likes: 0,
    };

    const updated = communities.map((comm) => {
      if (comm.id === communityId) {
        return {
          ...comm,
          lastMessage: content,
          messages: [...comm.messages, newMessage],
        };
      }
      return comm;
    });

    setCommunities(updated);
    StorageService.saveCommunities(updated);
    showToast('Message posted to study hub.');
  };

  const handleCreateCommunity = (title: string, code: string) => {
    const newComm: Community = {
      id: 'comm_' + Date.now(),
      courseCode: code,
      courseTitle: title,
      memberCount: 1,
      unreadCount: 0,
      lastMessage: 'Study hub launched.',
      messages: [
        {
          id: 'msg_welcome',
          authorName: currentUser.name,
          authorRole: currentUser.role,
          content: `Welcome to the ${title} study hub! Feel free to share notes and revision past papers.`,
          timestamp: 'Just now',
          likes: 1,
          isPinned: true,
        },
      ],
    };
    const updated = [newComm, ...communities];
    setCommunities(updated);
    StorageService.saveCommunities(updated);
  };

  const handleAddPayment = (payment: PaymentRecord) => {
    const updated = [payment, ...payments];
    setPayments(updated);
    StorageService.savePayments(updated);
    setPendingSyncCount(StorageService.getSyncQueue().filter(q => q.status === 'pending').length);

    // Push notification
    const notif: PushNotification = {
      id: 'notif_' + Date.now(),
      title: 'GePG Payment Verified',
      message: `TZS ${payment.amount.toLocaleString()} received under control number ${payment.controlNumber}.`,
      timestamp: 'Just now',
      read: false,
      type: 'payment',
    };
    const updatedNotifs = [notif, ...notifications];
    setNotifications(updatedNotifs);
    StorageService.saveNotifications(updatedNotifs);

    StorageService.addLog('gepg-gateway', 'audit', `Payment verified: Control ${payment.controlNumber}, Amount TZS ${payment.amount} via ${payment.channel}`);
    setLogs(StorageService.getLogs());
  };

  const handleAddPresetActivity = (
    title: string, 
    category: EventCategory, 
    location: string, 
    time: string
  ) => {
    const newEvent: CalendarEvent = {
      id: 'ev_' + Date.now(),
      title,
      category,
      location,
      date: '2026-09-25',
      startTime: time,
      endTime: '19:00',
      description: 'Added from Campus Plans',
    };
    const updated = [newEvent, ...events];
    setEvents(updated);
    StorageService.saveEvents(updated);
    setPendingSyncCount(StorageService.getSyncQueue().filter(q => q.status === 'pending').length);
    showToast(`"${title}" added to academic calendar for 25 Sep.`);
  };

  // Load Test Simulation
  const handleTriggerLoadTest = () => {
    setIsLoadTesting(true);
    showToast('Executing automated load test across distributed cluster...');
    setTimeout(() => {
      setLoadTestResults({
        totalRequests: 500,
        p50Ms: 14.2,
        p95Ms: 28.6,
        p99Ms: 44.1,
        errorRate: 0.0,
        throughputRps: 1240,
      });
      setIsLoadTesting(false);
      StorageService.addLog('load-runner', 'audit', 'Completed 500-request benchmark. 0 dropped packets, 1240 req/s sustained throughput.');
      setLogs(StorageService.getLogs());
      showToast('Load test passed: 0% error rate, 1240 req/s throughput.');
    }, 1400);
  };

  // Push Notifications Actions
  const handleSendTestPush = () => {
    const testNotif: PushNotification = {
      id: 'notif_' + Date.now(),
      title: 'ZOO 201 Practical Reminder',
      message: 'Arthropod specimen dissection in Science Block B204 starts in 15 minutes. Wear lab coat.',
      timestamp: 'Just now',
      read: false,
      type: 'academic',
    };
    const updated = [testNotif, ...notifications];
    setNotifications(updated);
    StorageService.saveNotifications(updated);
    showToast('Simulated real-time push notification dispatched.');

    // Try web push if supported and granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(testNotif.title, {
          body: testNotif.message,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Web push notification error:', e);
      }
    }
  };

  const handleRequestBrowserPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        showToast('Native browser push notifications enabled!');
      } else {
        showToast('Push permission was not granted by browser.');
      }
    } else {
      showToast('Browser notifications not supported in this frame.');
    }
  };

  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    StorageService.saveNotifications(updated);
    showToast('All notifications marked as read.');
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    StorageService.saveNotifications([]);
    showToast('Notifications cleared.');
  };

  const handleResetDefaults = () => {
    StorageService.resetToDefaults();
    setCurrentUser(StorageService.getUser());
    setCourses(StorageService.getCourses());
    setEvents(StorageService.getEvents());
    setTasks(StorageService.getTasks());
    setCommunities(StorageService.getCommunities());
    setPayments(StorageService.getPayments());
    setNotifications(StorageService.getNotifications());
    setLogs(StorageService.getLogs());
    setAnnouncements(StorageService.getAnnouncements());
    setStudyResources(StorageService.getStudyResources());
    setBreakthroughs(StorageService.getBreakthroughs());
    setPendingSyncCount(0);
    showToast('Application state reset to initial demo values.');
  };

  // University Picker Handler
  const handleSelectUniversity = (uniName: string) => {
    const updatedUser = { ...currentUser, university: uniName };
    setCurrentUser(updatedUser);
    StorageService.saveUser(updatedUser);
    StorageService.addLog('auth-service', 'audit', `University updated to: ${uniName}`);
    setLogs(StorageService.getLogs());
    showToast(`Campus switched to "${uniName}". Timetable and resources active.`);
  };

  // Announcement Handlers
  const handlePublishAnnouncement = (announcementData: Omit<Announcement, 'id' | 'timestamp' | 'acknowledged'>) => {
    const newAnnouncement: Announcement = {
      ...announcementData,
      id: 'ann_' + Date.now(),
      timestamp: 'Just now',
      acknowledged: false,
    };
    const updated = [newAnnouncement, ...announcements];
    setAnnouncements(updated);
    StorageService.saveAnnouncements(updated);

    // Also send push notification
    const notif: PushNotification = {
      id: 'notif_' + Date.now(),
      title: `${newAnnouncement.priority === 'urgent' ? '🚨 URGENT: ' : ''}${newAnnouncement.title}`,
      message: `${newAnnouncement.authorName} (${newAnnouncement.authorRole}): ${newAnnouncement.content}`,
      timestamp: 'Just now',
      read: false,
      type: newAnnouncement.priority === 'urgent' ? 'alert' : 'academic',
    };
    const updatedNotifs = [notif, ...notifications];
    setNotifications(updatedNotifs);
    StorageService.saveNotifications(updatedNotifs);

    StorageService.addLog('broadcast-service', 'audit', `Announcement broadcast to ${newAnnouncement.targetAudience.label}: "${newAnnouncement.title}"`);
    setLogs(StorageService.getLogs());
    showToast(`Announcement broadcast to ${newAnnouncement.targetAudience.label}!`);
  };

  const handleAcknowledgeAnnouncement = (id: string) => {
    const updated = StorageService.acknowledgeAnnouncement(id);
    setAnnouncements(updated);
    showToast('Announcement marked as acknowledged.');
  };

  const handleOpenCourseChat = (course: Course) => {
    setActiveChatCourse(course);
    setIsCourseChatOpen(true);
  };

  const handleShareToCourseChat = (courseCode: string, text: string) => {
    const comm = communities.find(c => c.courseCode.toLowerCase() === courseCode.toLowerCase());
    if (comm) {
      handleSendMessage(comm.id, text);
    }
    showToast(`Shared alert to ${courseCode} space!`);
  };

  // Timetable Handlers
  const handleImportTimetableSlots = (newSlots: TimetableSlot[], mode: 'replace' | 'merge') => {
    let updated: TimetableSlot[];
    if (mode === 'replace') {
      updated = newSlots;
    } else {
      const existingKeySet = new Set(timetable.map(s => `${s.day}_${s.startTime}_${s.courseCode}`));
      const filtered = newSlots.filter(s => !existingKeySet.has(`${s.day}_${s.startTime}_${s.courseCode}`));
      updated = [...timetable, ...filtered];
    }
    setTimetable(updated);
    StorageService.saveTimetable(updated);
    showToast(`Successfully saved ${newSlots.length} timetable slot(s).`);
  };

  const handleDeleteTimetableSlot = (id: string) => {
    const updated = timetable.filter(s => s.id !== id);
    setTimetable(updated);
    StorageService.saveTimetable(updated);
    showToast('Timetable slot removed.');
  };

  const handleResetSampleTimetable = () => {
    setTimetable(INITIAL_TIMETABLE);
    StorageService.saveTimetable(INITIAL_TIMETABLE);
    showToast('Reset to university standard timetable schedule.');
  };

  // User Management & RBAC Handlers
  const handleUpdateManagedUser = (user: ManagedUser) => {
    const updated = managedUsers.map(u => u.id === user.id ? user : u);
    setManagedUsers(updated);
    StorageService.saveManagedUsers(updated);
    showToast(`Updated permissions for ${user.name}.`);
  };

  const handleAddManagedUser = (user: ManagedUser) => {
    const updated = [user, ...managedUsers];
    setManagedUsers(updated);
    StorageService.saveManagedUsers(updated);
    showToast(`User ${user.name} added to institutional directory.`);
  };

  const handleUpdateRolePermissions = (perms: RolePermission[]) => {
    setRolePermissions(perms);
    StorageService.saveRolePermissions(perms);
    showToast('Role permissions matrix updated.');
  };

  const handleOpenAIChatWithPrompt = (prompt?: string) => {
    setAiChatPrompt(prompt);
    setIsAIChatOpen(true);
  };

  const handleOpenFeedStory = (story: ScientificBreakthrough) => {
    setSelectedFeedStory(story);
    setIsFeedStoryOpen(true);
  };

  const handleRefreshFeeds = async (category?: string) => {
    setIsRefreshingFeeds(true);
    try {
      const subject = category && category !== 'all' && category !== 'recommended' 
        ? category 
        : currentUser.subjectCategory || 'science';
      
      const res = await AIService.fetchPersonalizedFeed({
        programme: currentUser.programme,
        subjectCategory: subject,
        courses: courses.map(c => c.code),
        limit: 8
      });

      if (res.items && res.items.length > 0) {
        setBreakthroughs(res.items);
        StorageService.saveBreakthroughs(res.items);
        const meta = {
          lastFetched: Date.now(),
          mode: res.mode,
          activeCategory: subject,
        };
        setFeedMetadata(meta);
        StorageService.saveFeedMetadata(meta);
        showToast(`Synced ${res.items.length} academic feeds (${res.mode === 'gemini_ai_live' ? 'Live Gemini AI' : 'Verified Syllabus'}).`);
      } else {
        showToast('Feeds are currently up-to-date.');
      }
    } catch {
      showToast('Offline cache active. Using pre-loaded syllabus stories.');
    } finally {
      setIsRefreshingFeeds(false);
    }
  };

  // Auto-fetch personalized feeds if older than 3 hours or empty
  useEffect(() => {
    const meta = StorageService.getFeedMetadata();
    const THREE_HOURS = 3 * 60 * 60 * 1000;
    if (!meta.lastFetched || Date.now() - meta.lastFetched > THREE_HOURS || breakthroughs.length === 0) {
      handleRefreshFeeds();
    }
  }, [currentUser.programme, currentUser.subjectCategory]);

  const handleEnrollInCourse = (courseToEnroll: Course) => {
    if (!courses.some(c => c.code.trim().toLowerCase() === courseToEnroll.code.trim().toLowerCase())) {
      const updated = [...courses, courseToEnroll];
      setCourses(updated);
      StorageService.saveCourses(updated);
      showToast(`Enrolled in ${courseToEnroll.code}: ${courseToEnroll.title}! Course space unlocked.`);
    } else {
      showToast(`Already registered in ${courseToEnroll.code}.`);
    }
  };

  const handleTriggerImminentLectureAlert = (alert: ImminentLectureAlert) => {
    setImminentAlert(alert);
    setIsImminentAlertOpen(true);
    soundAlerts.playLectureChime();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f5f8fb] text-[#182530] font-sans selection:bg-[#1e6fa8] selection:text-white pb-12">
      {/* Top Navbar & Integrated Desktop Sidebar Layout */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAddEvent={() => {
          setAddEventInitialDate(undefined);
          setAddEventOpen(true);
        }}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenAIChat={() => handleOpenAIChatWithPrompt()}
        unreadNotificationsCount={unreadCount}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        pendingSyncCount={pendingSyncCount}
        onSyncNow={handleSyncNow}
        isSyncing={isSyncing}
        announcements={announcements}
        onOpenCreateAnnouncement={() => setIsCreateAnnouncementOpen(true)}
        onAcknowledgeAnnouncement={handleAcknowledgeAnnouncement}
        onOpenUniversityPicker={() => setIsUniversityPickerOpen(true)}
        onOpenTimezoneSettings={() => setIsTimezoneModalOpen(true)}
      >
        {/* Child views start immediately at the top column with 0px wasted blank space */}
        {activeTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            courses={courses}
            events={events}
            tasks={tasks}
            announcements={announcements}
            breakthroughs={breakthroughs}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAddEvent={() => {
              setAddEventInitialDate(undefined);
              setAddEventOpen(true);
            }}
            onOpenAddTask={() => setAddTaskOpen(true)}
            onCompleteTask={(taskId) => {
              handleUpdateTaskStatus(taskId, 'submitted');
              showToast('Assessment marked as submitted.');
            }}
            onOpenCreateAnnouncement={() => setIsCreateAnnouncementOpen(true)}
            onOpenUniversityPicker={() => setIsUniversityPickerOpen(true)}
            onOpenFeedStory={handleOpenFeedStory}
            onRefreshFeeds={handleRefreshFeeds}
            isRefreshingFeeds={isRefreshingFeeds}
            lastFeedFetched={feedMetadata.lastFetched}
            feedMode={feedMetadata.mode}
            onOpenFeedInfo={() => setIsFeedInfoModalOpen(true)}
            onOpenTimezoneSettings={() => setIsTimezoneModalOpen(true)}
          />
        )}

        {activeTab === 'profile' && (
          <AcademicProfileView
            currentUser={currentUser}
            onUpdateUser={(updated) => {
              setCurrentUser(updated);
              StorageService.saveUser(updated);
              setPendingSyncCount(StorageService.getSyncQueue().filter(q => q.status === 'pending').length);
            }}
            onNotify={showToast}
          />
        )}

        {activeTab === 'timetable' && (
          <TimetableView
            user={currentUser}
            timetable={timetable}
            courses={courses}
            onOpenImportModal={() => setIsTimetableImportOpen(true)}
            onOpenCourseChat={(code) => {
              const c = courses.find(cr => cr.code.toLowerCase() === code.toLowerCase()) || courses[0];
              if (c) handleOpenCourseChat(c);
            }}
            onAddCalendarEvent={(event) => {
              handleSaveEvent(event);
            }}
            onAddTimetableSlot={(slot) => {
              handleImportTimetableSlots([{ ...slot, id: 'slot_' + Date.now() }], 'merge');
            }}
            onOpenAIAssistant={handleOpenAIChatWithPrompt}
            onDeleteSlot={handleDeleteTimetableSlot}
            onResetSampleTimetable={handleResetSampleTimetable}
            onNotify={showToast}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceView
            currentUser={currentUser}
            courses={courses}
            onCoursesUpdated={(updated) => {
              setCourses(updated);
              StorageService.saveCourses(updated);
            }}
            onNotify={showToast}
          />
        )}

        {activeTab === 'course-enrollment' && (
          <CourseEnrollmentView
            user={currentUser}
            courses={courses}
            onCoursesUpdated={(updated) => {
              setCourses(updated);
              StorageService.saveCourses(updated);
            }}
            onNotify={showToast}
          />
        )}

        {activeTab === 'materials' && (
          <StudyMaterialsView
            user={currentUser}
            courses={courses}
            onNotify={showToast}
          />
        )}

        {activeTab === 'discussions' && (
          <DiscussionsHubView
            user={currentUser}
            courses={courses}
            onAddCalendarEvent={(event) => {
              handleSaveEvent(event);
            }}
            onNotify={showToast}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            events={events}
            courses={courses}
            onOpenAddEvent={(date) => {
              setAddEventInitialDate(date);
              setAddEventOpen(true);
            }}
            onDeleteEvent={handleDeleteEvent}
            onNotify={showToast}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesView
            courses={courses}
            currentUser={currentUser}
            onAddCourse={handleAddCourse}
            onRemoveCourse={handleRemoveCourse}
            onNavigateToCommunity={(courseCode) => {
              setActiveTab('community');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToShare={(courseCode) => {
              setActiveTab('share');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenCourseChat={handleOpenCourseChat}
            onNavigateToStudy={(courseCode) => {
              setActiveTab('study');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onLoadMedicineDemo={handleLoadMedicineDemo}
            onNotify={showToast}
          />
        )}

        {activeTab === 'study' && (
          <StudyResourcesView
            currentUser={currentUser}
            courses={courses}
            resources={studyResources}
            breakthroughs={breakthroughs}
            onShareToCourseChat={handleShareToCourseChat}
            onOpenFeedStory={handleOpenFeedStory}
            onNotify={showToast}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            onOpenAddTask={() => setAddTaskOpen(true)}
            onUpdateStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
            onNotify={showToast}
          />
        )}

        {activeTab === 'gpa' && <GpaCalculatorView />}

        {activeTab === 'network' && (
          <StudentNetworkView
            currentUser={currentUser}
            courses={courses}
            onNotify={showToast}
          />
        )}

        {activeTab === 'leisure' && (
          <LeisureEventsView
            user={currentUser}
            onAddCalendarEvent={handleSaveEvent}
            onNotify={showToast}
          />
        )}

        {activeTab === 'opportunities' && (
          <OpportunitiesView
            user={currentUser}
            onNotify={showToast}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsManagementView
            user={currentUser}
            onNavigateTab={(tab) => {
              setActiveTab(tab as ActiveTab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNotify={showToast}
          />
        )}

        {activeTab === 'community' && (
          <CommunitiesView
            communities={communities}
            currentUser={currentUser}
            courses={courses}
            onSendMessage={handleSendMessage}
            onCreateCommunity={handleCreateCommunity}
            onEnrollInCourse={handleEnrollInCourse}
            onNotify={showToast}
          />
        )}

        {activeTab === 'users' && (
          <UserManagementView
            currentUser={currentUser}
            managedUsers={managedUsers}
            rolePermissions={rolePermissions}
            onUpdateUser={handleUpdateManagedUser}
            onUpdateRolePermissions={handleUpdateRolePermissions}
            onAddUser={handleAddManagedUser}
          />
        )}

        {activeTab === 'social' && (
          <PersonalPlansView
            onOpenAddEvent={() => {
              setAddEventInitialDate(undefined);
              setAddEventOpen(true);
            }}
            onAddPresetActivity={handleAddPresetActivity}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsView
            payments={payments}
            onAddPayment={handleAddPayment}
            onNotify={showToast}
          />
        )}

        {activeTab === 'share' && (
          <TimetableShareView
            courses={courses}
            events={events}
            onNotify={showToast}
          />
        )}

        {activeTab === 'architecture' && (
          <SystemArchitectureView
            metrics={metrics}
            logs={logs}
            onTriggerLoadTest={handleTriggerLoadTest}
            isLoadTesting={isLoadTesting}
            loadTestResults={loadTestResults}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            currentUser={currentUser}
            onUpdateUser={(updated) => {
              setCurrentUser(updated);
              StorageService.saveUser(updated);
              setPendingSyncCount(StorageService.getSyncQueue().filter(q => q.status === 'pending').length);
            }}
            onResetDefaults={handleResetDefaults}
            onNotify={showToast}
            pendingSyncCount={pendingSyncCount}
          />
        )}
      </Navigation>

      {/* Global Interactive Modals */}
      <AddEventModal
        isOpen={addEventOpen}
        onClose={() => setAddEventOpen(false)}
        onSave={handleSaveEvent}
        courses={courses}
        initialDate={addEventInitialDate}
      />

      <AddTaskModal
        isOpen={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        onSave={handleSaveTask}
        courses={courses}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
          StorageService.saveUser(updated);
          setPendingSyncCount(StorageService.getSyncQueue().filter(q => q.status === 'pending').length);
        }}
        onNotify={showToast}
      />

      <NotificationCenterModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearAllNotifications}
        onSendTestNotification={handleSendTestPush}
        onRequestBrowserPermission={handleRequestBrowserPermission}
      />

      {/* Dynamic University & College Directory Modal */}
      <UniversityPickerModal
        isOpen={isUniversityPickerOpen}
        onClose={() => setIsUniversityPickerOpen(false)}
        currentUniversity={currentUser.university}
        onSelectUniversity={handleSelectUniversity}
        onNotify={showToast}
      />

      {/* Targeted Role-Based Campus Broadcast Modal */}
      <CreateAnnouncementModal
        isOpen={isCreateAnnouncementOpen}
        onClose={() => setIsCreateAnnouncementOpen(false)}
        currentUser={currentUser}
        courses={courses}
        onBroadcast={handlePublishAnnouncement}
        onNotify={showToast}
      />

      {/* Course-Specific Space Chat & Urgent Alerts Modal */}
      {activeChatCourse && (
        <CourseSpaceChatModal
          isOpen={isCourseChatOpen}
          onClose={() => setIsCourseChatOpen(false)}
          course={activeChatCourse}
          community={communities.find(c => c.courseCode.toLowerCase() === activeChatCourse.code.toLowerCase())}
          currentUser={currentUser}
          courses={courses}
          onEnrollInCourse={handleEnrollInCourse}
          onSendMessage={(courseCode, content, isAlert, alertType) => {
            const comm = communities.find(c => c.courseCode.toLowerCase() === courseCode.toLowerCase());
            if (comm) {
              const newMsg = {
                id: 'msg_' + Date.now(),
                authorName: currentUser.name,
                authorRole: currentUser.leadershipTitle || (currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'lecturer' ? 'Lecturer' : 'Student'),
                content,
                timestamp: 'Just now',
                likes: 0,
                isPinned: Boolean(isAlert),
                isAlert: Boolean(isAlert),
                alertType,
              };
              const updated = communities.map(c => c.id === comm.id ? { ...c, messages: [...c.messages, newMsg] } : c);
              setCommunities(updated);
              StorageService.saveCommunities(updated);
            }
          }}
          onAddEventFromAlert={(title, location, time) => {
            handleAddPresetActivity(title, 'lecture', location, time);
          }}
          onNotify={showToast}
        />
      )}

      {/* Feed Story Detail Modal */}
      <FeedStoryModal
        isOpen={isFeedStoryOpen}
        onClose={() => setIsFeedStoryOpen(false)}
        feedItem={selectedFeedStory}
        onNotify={showToast}
      />

      {/* Imminent Lecture Alert Modal */}
      <ImminentLectureModal
        isOpen={isImminentAlertOpen}
        alert={imminentAlert}
        onClose={() => setIsImminentAlertOpen(false)}
        onOpenCourseChat={(courseCode) => {
          setIsImminentAlertOpen(false);
          const c = courses.find(cr => cr.code.toLowerCase() === courseCode.toLowerCase()) || courses[0];
          if (c) handleOpenCourseChat(c);
        }}
        onNotify={showToast}
      />

      {/* Interactive Timetable Import Modal (CSV, AI Photo Scan, Manual) */}
      <TimetableImportModal
        isOpen={isTimetableImportOpen}
        onClose={() => setIsTimetableImportOpen(false)}
        onImportSlots={handleImportTimetableSlots}
        currentCourseCodes={courses.map(c => c.code)}
      />

      {/* AI Academic & Timetable Assistant Modal */}
      <AIChatAssistantModal
        isOpen={isAIChatOpen}
        onClose={() => {
          setIsAIChatOpen(false);
          setAiChatPrompt(undefined);
        }}
        user={currentUser}
        initialPrompt={aiChatPrompt}
        onNavigateTab={(tab) => {
          setActiveTab(tab as ActiveTab);
          setIsAIChatOpen(false);
        }}
      />

      {/* Academic Timezone & East Africa Time Modal */}
      <TimezoneSettingsModal
        isOpen={isTimezoneModalOpen}
        onClose={() => setIsTimezoneModalOpen(false)}
        onSaved={(mode) => {
          showToast(`Campus timezone configuration updated to: ${mode.toUpperCase()}`);
        }}
      />

      {/* Feed Architecture & Update Transparency Modal */}
      <FeedInfoModal
        isOpen={isFeedInfoModalOpen}
        onClose={() => setIsFeedInfoModalOpen(false)}
        lastFetched={feedMetadata.lastFetched}
        feedMode={feedMetadata.mode}
        activeCategory={feedMetadata.activeCategory || currentUser.subjectCategory || 'science'}
        onTriggerRefresh={() => {
          setIsFeedInfoModalOpen(false);
          handleRefreshFeeds();
        }}
      />

      {/* Persistent Toast notification banner */}
      {toastMessage && (
        <div
          id="global-toast-container"
          className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-[#102d4f] text-white p-4 rounded-2xl shadow-2xl border border-[#1b3d63] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e6ad3d] shrink-0 animate-ping"></span>
            <p className="text-xs font-semibold text-slate-100 leading-snug truncate">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
