import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BookOpen, 
  CheckSquare, 
  TrendingUp, 
  MessageSquare, 
  HeartHandshake, 
  CreditCard, 
  Server, 
  Settings, 
  Plus, 
  Wifi, 
  WifiOff, 
  Bell, 
  User as UserIcon,
  Menu, 
  X, 
  Share2, 
  RefreshCw,
  Building,
  Sparkles,
  Clock,
  Users
} from 'lucide-react';
import { User, Announcement } from '../types';
import { AnnouncementsBar } from './AnnouncementsBar';

export type ActiveTab = 
  | 'dashboard'
  | 'timetable'
  | 'calendar'
  | 'courses'
  | 'study'
  | 'tasks'
  | 'gpa'
  | 'community'
  | 'users'
  | 'social'
  | 'payments'
  | 'share'
  | 'architecture'
  | 'settings';

export interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User;
  onOpenAddEvent: () => void;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  onOpenAIChat?: () => void;
  unreadNotificationsCount: number;
  isOffline: boolean;
  onToggleOffline: () => void;
  pendingSyncCount: number;
  onSyncNow: () => void;
  isSyncing: boolean;
  announcements: Announcement[];
  onOpenCreateAnnouncement: () => void;
  onAcknowledgeAnnouncement: (id: string) => void;
  onOpenUniversityPicker: () => void;
  onOpenTimezoneSettings?: () => void;
  children?: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAddEvent,
  onOpenNotifications,
  onOpenAuth,
  onOpenAIChat,
  unreadNotificationsCount,
  isOffline,
  onToggleOffline,
  pendingSyncCount,
  onSyncNow,
  isSyncing,
  announcements,
  onOpenCreateAnnouncement,
  onAcknowledgeAnnouncement,
  onOpenUniversityPicker,
  onOpenTimezoneSettings,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [timeDisplay, setTimeDisplay] = React.useState(() => {
    try {
      const now = new Date();
      const eatFormatted = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Dar_es_Salaam',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(now);
      return { primary: `${eatFormatted} EAT`, badge: 'EAT (UTC+3)' };
    } catch {
      return { primary: '09:30 AM EAT', badge: 'EAT' };
    }
  });

  React.useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const eatFormatted = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Africa/Dar_es_Salaam',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(now);
        setTimeDisplay({ primary: `${eatFormatted} EAT`, badge: 'EAT (UTC+3)' });
      } catch {}
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'timetable' as ActiveTab, label: 'Timetable', icon: Clock, badge: 'Live' },
    { id: 'calendar' as ActiveTab, label: 'Academic Calendar', icon: CalendarDays },
    { id: 'courses' as ActiveTab, label: 'Courses & Syllabus', icon: BookOpen },
    { id: 'study' as ActiveTab, label: 'Study & Feeds', icon: Sparkles, badge: 'Feeds' },
    { id: 'tasks' as ActiveTab, label: 'Tasks & Deadlines', icon: CheckSquare },
    { id: 'gpa' as ActiveTab, label: 'GPA Projections', icon: TrendingUp },
    { id: 'community' as ActiveTab, label: 'Course Communities', icon: MessageSquare },
    { id: 'users' as ActiveTab, label: 'User Directory & Roles', icon: Users, badge: 'Admin' },
    { id: 'social' as ActiveTab, label: 'Personal & Sports', icon: HeartHandshake },
    { id: 'share' as ActiveTab, label: 'Share Timetable', icon: Share2 },
    { id: 'payments' as ActiveTab, label: 'University Payments', icon: CreditCard },
    { id: 'architecture' as ActiveTab, label: 'Architecture & System', icon: Server, badge: 'Cloud' },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
  ];

  // Mobile Bottom Bar items
  const bottomBarItems = [
    { id: 'dashboard' as ActiveTab, label: 'Home', icon: LayoutDashboard },
    { id: 'timetable' as ActiveTab, label: 'Timetable', icon: Clock },
    { id: 'study' as ActiveTab, label: 'Feeds', icon: Sparkles },
    { id: 'community' as ActiveTab, label: 'Chat', icon: MessageSquare },
    { id: 'tasks' as ActiveTab, label: 'Tasks', icon: CheckSquare },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Brand & University Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button 
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
            </button>

            <div 
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2 cursor-pointer select-none shrink-0"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black tracking-tight text-lg shadow-sm">
                CF
              </div>
              <div className="hidden sm:block">
                <span className="font-black text-base tracking-tight text-white flex items-center gap-1">
                  CampusFlow <span className="text-amber-300 font-bold text-xs px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700">TZ</span>
                </span>
                <span className="block text-[10px] text-slate-300 font-medium">
                  University Academic Planner
                </span>
              </div>
            </div>

            {/* University Switcher Pill in Header */}
            <button
              id="header-university-picker-btn"
              onClick={onOpenUniversityPicker}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs text-white transition-colors max-w-[140px] sm:max-w-[220px] truncate shrink"
              title="Click to switch or add any university"
            >
              <Building className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate font-bold text-slate-100">{currentUser.university}</span>
            </button>
          </div>

          {/* Top Quick Actions & Status */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Academic Timezone & EAT Campus Clock */}
            <button
              id="header-timezone-btn"
              onClick={onOpenTimezoneSettings}
              title="Campus Time System: Click to view or adjust East Africa Time (EAT) / Local detection"
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-800 text-sky-200 text-xs font-bold transition-all active:scale-95 shadow-2xs"
            >
              <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="font-mono text-[11px] sm:text-xs">{timeDisplay.primary}</span>
              <span className="hidden xl:inline text-[10px] px-1 rounded bg-sky-800 text-sky-100 font-sans font-semibold">
                {timeDisplay.badge}
              </span>
            </button>

            {/* Offline simulation toggle */}
            <button
              id="network-status-toggle-btn"
              onClick={onToggleOffline}
              title={isOffline ? 'Click to reconnect online' : 'Click to simulate offline mode'}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                isOffline 
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400/30' 
                  : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-400/30'
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 animate-pulse" />
                  <span className="hidden md:inline">Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Live</span>
                </>
              )}
            </button>

            {/* Sync status */}
            <button
              id="sync-now-btn"
              onClick={onSyncNow}
              disabled={isSyncing}
              title="Synchronize local changes with cloud backend"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
              <span>
                {isSyncing ? 'Syncing...' : pendingSyncCount > 0 ? `${pendingSyncCount} queue` : 'Synced'}
              </span>
            </button>

            {/* AI Mentor Quick Launcher */}
            {onOpenAIChat && (
              <button
                id="header-ai-mentor-btn"
                onClick={onOpenAIChat}
                title="CampusFlow Academic AI Advisor"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 text-xs font-bold transition-all active:scale-95 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="hidden sm:inline">AI Mentor</span>
              </button>
            )}

            {/* Add Event Action */}
            <button
              id="global-add-event-btn"
              onClick={onOpenAddEvent}
              className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Add</span>
            </button>

            {/* Notification Bell */}
            <button
              id="notification-bell-btn"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 stroke-[2.2]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            <button
              id="auth-profile-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <p className="text-xs font-bold text-slate-100 max-w-[100px] truncate">{currentUser.name}</p>
                <p className="text-[10px] text-amber-300 capitalize font-semibold truncate max-w-[100px]">
                  {currentUser.leadershipTitle || currentUser.role}
                </p>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Unified Layout Container: Sidebar on Left, Content on Right */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-8">
        <div className="lg:grid lg:grid-cols-[280px_1fr] gap-6 items-start">
          {/* Desktop Left Sidebar: Navigation & Announcements Bar */}
          <aside className="hidden lg:block sticky top-20 space-y-4">
            {/* Primary Campus Hub Navigation */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
              <div className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-500">
                Campus Hub
              </div>
              <nav className="space-y-1">
                {navItems.slice(0, 8).map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-nav-${item.id}`}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-left ${
                        isActive
                          ? 'bg-sky-50 text-sky-900 border border-sky-200 shadow-2xs'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 stroke-[2.2] ${isActive ? 'text-sky-700' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] bg-sky-100 text-sky-900 font-extrabold px-1.5 py-0.5 rounded">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="px-3 pt-3 pb-1.5 text-[11px] font-black uppercase tracking-wider text-slate-500">
                Tools & Administration
              </div>
              <nav className="space-y-1">
                {navItems.slice(8).map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-nav-${item.id}`}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-left ${
                        isActive
                          ? 'bg-sky-50 text-sky-900 border border-sky-200 shadow-2xs'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 stroke-[2.2] ${isActive ? 'text-sky-700' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] bg-slate-200 text-slate-800 font-extrabold px-1.5 py-0.5 rounded">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Left Announcements Bar */}
            <AnnouncementsBar
              announcements={announcements}
              currentUser={currentUser}
              onOpenCreateAnnouncement={onOpenCreateAnnouncement}
              onAcknowledge={onAcknowledgeAnnouncement}
              onNavigateTab={(tab) => handleNavClick(tab as ActiveTab)}
            />

            {/* Quick Degree Progression Widget in Sidebar */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
                <span>{currentUser.programme}</span>
              </div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-lg font-black text-white">{currentUser.regNumber || currentUser.id}</span>
                <span className="text-xs font-bold text-amber-300">Active</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-400 h-1.5 rounded-full" 
                  style={{ width: `${(currentUser.currentYear / currentUser.totalYears) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-slate-300 text-[11px] font-medium">Academic Level</span>
                <span className="text-amber-300 font-bold text-[11px]">
                  Year {currentUser.currentYear} of {currentUser.totalYears}
                </span>
              </div>
            </div>
          </aside>

          {/* Mobile Drawer Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs flex animate-in fade-in duration-150">
              <div className="w-72 sm:w-80 bg-white h-full shadow-2xl p-4 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
                        CF
                      </div>
                      <span className="font-black text-slate-900 text-sm">CampusFlow TZ</span>
                    </div>
                    <button 
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1 text-slate-500 hover:text-slate-900"
                    >
                      <X className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* University change in mobile menu */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Institution</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-black text-slate-900 truncate">{currentUser.university}</span>
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenUniversityPicker(); }}
                        className="text-[10px] text-sky-800 font-bold hover:underline shrink-0 ml-1"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Timezone in mobile menu */}
                  <div 
                    onClick={() => { setMobileMenuOpen(false); if (onOpenTimezoneSettings) onOpenTimezoneSettings(); }}
                    className="mt-2 p-3 bg-sky-50 rounded-xl border border-sky-200 cursor-pointer hover:bg-sky-100/70 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-sky-900 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-700" />
                        Campus Time (EAT)
                      </span>
                      <span className="text-[10px] font-bold text-sky-800">Adjust</span>
                    </div>
                    <div className="text-xs font-black text-slate-900 mt-1 font-mono">
                      {timeDisplay.primary}
                    </div>
                  </div>

                  <nav className="mt-3 space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          id={`mobile-nav-${item.id}`}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-left ${
                            isActive
                              ? 'bg-sky-100 text-sky-950 font-black'
                              : 'text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 stroke-[2.2] ${isActive ? 'text-sky-800' : 'text-slate-600'}`} />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[10px] bg-slate-200 text-slate-900 font-black px-1.5 py-0.5 rounded">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="text-xs text-slate-600 font-medium mb-2 truncate">Logged in as {currentUser.email}</div>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                  >
                    <UserIcon className="w-4 h-4" /> Switch Role / Account
                  </button>
                </div>
              </div>
              <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
            </div>
          )}

          {/* Children View Content Area */}
          <main className="min-w-0">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Quick Navigation Bar (Sticky at bottom for smartphone accessibility) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {bottomBarItems.map((barItem) => {
          const Icon = barItem.icon;
          const isActive = activeTab === barItem.id;
          return (
            <button
              key={barItem.id}
              onClick={() => handleNavClick(barItem.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-sky-800 font-black' : 'text-slate-600 font-medium hover:text-slate-900'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-sky-100 text-sky-900' : ''}`}>
                <Icon className={`w-4 h-4 stroke-[2.4]`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{barItem.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
