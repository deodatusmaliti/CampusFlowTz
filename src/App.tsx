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
  EventCategory
} from './types';
import { StorageService } from './services/storageService';
import { 
  INITIAL_MICROSERVICES, 
  INITIAL_COURSES 
} from './data/mockInitialData';

import { Navigation, ActiveTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { CoursesView } from './components/CoursesView';
import { TasksView } from './components/TasksView';
import { GpaCalculatorView } from './components/GpaCalculatorView';
import { CommunitiesView } from './components/CommunitiesView';
import { PersonalPlansView } from './components/PersonalPlansView';
import { PaymentsView } from './components/PaymentsView';
import { TimetableShareView } from './components/TimetableShareView';
import { SystemArchitectureView } from './components/SystemArchitectureView';
import { SettingsView } from './components/SettingsView';

import { AddEventModal } from './components/AddEventModal';
import { AddTaskModal } from './components/AddTaskModal';
import { AuthModal } from './components/AuthModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';

export default function App() {
  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [addEventInitialDate, setAddEventInitialDate] = useState<string | undefined>(undefined);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

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
    category: 'sport' | 'society' | 'personal', 
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
    setPendingSyncCount(0);
    showToast('Application state reset to initial demo values.');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f5f8fb] text-[#182530] font-sans selection:bg-[#1e6fa8] selection:text-white pb-12">
      {/* Top Navbar & Sidebar Layout */}
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
        unreadNotificationsCount={unreadCount}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        pendingSyncCount={pendingSyncCount}
        onSyncNow={handleSyncNow}
        isSyncing={isSyncing}
      />

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <div className="lg:pl-64">
          {activeTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              courses={courses}
              events={events}
              tasks={tasks}
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
              onLoadMedicineDemo={handleLoadMedicineDemo}
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

          {activeTab === 'community' && (
            <CommunitiesView
              communities={communities}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
              onCreateCommunity={handleCreateCommunity}
              onNotify={showToast}
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
        </div>
      </main>

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
