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
  RefreshCw
} from 'lucide-react';
import { User } from '../types';

export type ActiveTab = 
  | 'dashboard'
  | 'calendar'
  | 'courses'
  | 'tasks'
  | 'gpa'
  | 'community'
  | 'social'
  | 'payments'
  | 'share'
  | 'architecture'
  | 'settings';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User;
  onOpenAddEvent: () => void;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  unreadNotificationsCount: number;
  isOffline: boolean;
  onToggleOffline: () => void;
  pendingSyncCount: number;
  onSyncNow: () => void;
  isSyncing: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAddEvent,
  onOpenNotifications,
  onOpenAuth,
  unreadNotificationsCount,
  isOffline,
  onToggleOffline,
  pendingSyncCount,
  onSyncNow,
  isSyncing
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'calendar' as ActiveTab, label: 'Academic Calendar', icon: CalendarDays },
    { id: 'courses' as ActiveTab, label: 'Courses & Syllabus', icon: BookOpen },
    { id: 'tasks' as ActiveTab, label: 'Tasks & Deadlines', icon: CheckSquare },
    { id: 'gpa' as ActiveTab, label: 'GPA Projections', icon: TrendingUp },
    { id: 'community' as ActiveTab, label: 'Course Communities', icon: MessageSquare },
    { id: 'social' as ActiveTab, label: 'Personal & Sports', icon: HeartHandshake },
    { id: 'share' as ActiveTab, label: 'Share Timetable', icon: Share2 },
    { id: 'payments' as ActiveTab, label: 'University Payments', icon: CreditCard },
    { id: 'architecture' as ActiveTab, label: 'Architecture & System', icon: Server, badge: 'Cloud' },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#102d4f] text-white border-b border-[#1b3d63] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button 
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-200 hover:text-white hover:bg-[#1a406c] focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div 
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-[#e6ad3d] text-[#102d4f] flex items-center justify-center font-black tracking-tight text-lg shadow-sm">
                CF
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  CampusFlow <span className="text-[#e6ad3d] font-semibold text-xs px-1.5 py-0.5 rounded bg-[#1e4878]">TZ</span>
                </span>
                <span className="hidden sm:block text-[11px] text-slate-300 font-medium tracking-wide">
                  East African Higher Ed Planner
                </span>
              </div>
            </div>
          </div>

          {/* Top Quick Actions & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Offline simulation toggle */}
            <button
              id="network-status-toggle-btn"
              onClick={onToggleOffline}
              title={isOffline ? 'Click to reconnect online' : 'Click to simulate offline mode'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isOffline 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 animate-pulse" />
                  <span className="hidden md:inline">Offline Mode</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Online (Live Sync)</span>
                </>
              )}
            </button>

            {/* Sync Queue status button */}
            <button
              id="sync-now-btn"
              onClick={onSyncNow}
              disabled={isSyncing}
              title="Synchronize local changes with cloud backend"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-[#163860] hover:bg-[#1f4a7c] border border-white/10 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#e6ad3d]' : ''}`} />
              <span className="hidden sm:inline">
                {isSyncing ? 'Syncing...' : pendingSyncCount > 0 ? `${pendingSyncCount} pending` : 'Synced'}
              </span>
            </button>

            {/* Add Event Global Action */}
            <button
              id="global-add-event-btn"
              onClick={onOpenAddEvent}
              className="flex items-center gap-1.5 bg-[#e6ad3d] hover:bg-[#f3b844] text-[#102d4f] font-bold text-xs sm:text-sm px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Add Event</span>
            </button>

            {/* Notification Bell */}
            <button
              id="notification-bell-btn"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-200 hover:text-white hover:bg-[#1a406c] focus:outline-none transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            <button
              id="auth-profile-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg bg-[#163860] hover:bg-[#1f4a7c] border border-white/10 text-left transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#1e6fa8] text-white flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <p className="text-xs font-bold text-slate-100 max-w-[110px] truncate">{currentUser.name}</p>
                <p className="text-[10px] text-[#e6ad3d] capitalize font-medium">{currentUser.role}</p>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-[240px_1fr] gap-6 items-start">
          {/* Desktop Left Sidebar */}
          <aside className="hidden lg:block sticky top-24 space-y-6">
            <div className="bg-white rounded-2xl p-3 border border-[#d9e3ea] shadow-sm">
              <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-[#8a98a2]">
                Campus Hub
              </div>
              <nav className="space-y-1">
                {navItems.slice(0, 7).map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-nav-${item.id}`}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                        isActive
                          ? 'bg-[#e5f2fb] text-[#1e6fa8] font-bold shadow-xs'
                          : 'text-[#52616c] hover:bg-[#f5f8fb] hover:text-[#102d4f]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#1e6fa8]' : 'text-[#8a98a2]'}`} />
                        <span>{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>

              <div className="px-3 pt-4 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-[#8a98a2]">
                Tools & Architecture
              </div>
              <nav className="space-y-1">
                {navItems.slice(7).map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-nav-${item.id}`}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                        isActive
                          ? 'bg-[#e5f2fb] text-[#1e6fa8] font-bold shadow-xs'
                          : 'text-[#52616c] hover:bg-[#f5f8fb] hover:text-[#102d4f]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#1e6fa8]' : 'text-[#8a98a2]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-gradient-to-br from-[#102d4f] to-[#1e4878] rounded-2xl p-4 text-white shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#e6ad3d]">Semester Active</span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-medium">UDSM 2026/27</span>
              </div>
              <p className="text-sm font-bold text-white leading-snug">{currentUser.programme}</p>
              <p className="text-xs text-slate-300 mt-1">Year {currentUser.currentYear} of {currentUser.totalYears}</p>
              
              <div className="mt-3 pt-3 border-t border-white/15 flex justify-between items-center text-xs">
                <span className="text-slate-300">Sync status</span>
                <span className="text-emerald-300 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live & Protected
                </span>
              </div>
            </div>
          </aside>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex">
              <div className="w-72 bg-white h-full shadow-2xl p-4 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#e6ad3d] text-[#102d4f] flex items-center justify-center font-black text-sm">
                        CF
                      </div>
                      <span className="font-extrabold text-[#102d4f] text-sm">CampusFlow TZ</span>
                    </div>
                    <button 
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="mt-4 space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          id={`mobile-nav-${item.id}`}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                            isActive
                              ? 'bg-[#e5f2fb] text-[#1e6fa8] font-bold'
                              : 'text-[#52616c] hover:bg-[#f5f8fb]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[#1e6fa8]' : 'text-[#8a98a2]'}`} />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500 mb-2">Logged in as {currentUser.email}</div>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#102d4f] text-white text-xs font-bold"
                  >
                    <UserIcon className="w-4 h-4" /> Switch Role / Account
                  </button>
                </div>
              </div>
              <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
            </div>
          )}

          {/* Children View Content Area */}
          <div className="min-w-0">
            {/* The active tab view will be rendered by the caller App component */}
          </div>
        </div>
      </div>
    </>
  );
};
