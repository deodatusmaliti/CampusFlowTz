import React, { useState } from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Moon, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Sliders, 
  Play, 
  Check, 
  Trash2, 
  RefreshCw, 
  Info, 
  Calendar, 
  BookOpen, 
  Video, 
  DollarSign, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  ShieldAlert,
  Flame
} from 'lucide-react';
import { AlertPreferences, AlertCategory, ReminderTiming, SystemAlertItem, User } from '../types';
import { StorageService } from '../services/storageService';
import { soundAlerts } from '../services/soundAlertService';

interface AlertsManagementViewProps {
  user: User;
  onNavigateTab?: (tab: string) => void;
  onNotify: (msg: string) => void;
}

const CATEGORY_DEFINITIONS: { id: AlertCategory; label: string; description: string; icon: React.ReactNode }[] = [
  { id: 'lectures', label: 'Lectures & Practical Classes', description: 'Real-time start alarms, room directions, and countdowns', icon: <BookOpen className="w-4 h-4 text-sky-600" /> },
  { id: 'tests', label: 'Continuous Assessment Tests (CATs)', description: 'Timetable revisions, hall proctor rules, and test alerts', icon: <AlertTriangle className="w-4 h-4 text-amber-600" /> },
  { id: 'examinations', label: 'University Semester Examinations', description: 'Final exam schedules, seating allocations, and clearance alerts', icon: <GraduationCap className="w-4 h-4 text-indigo-600" /> },
  { id: 'assignments', label: 'Assignment & Lab Deadlines', description: 'Submission portal cutoffs and reminder warnings', icon: <Clock className="w-4 h-4 text-rose-600" /> },
  { id: 'course_materials', label: 'New Study Materials & Syllabi', description: 'Notifies when lecturers or peers upload lecture files', icon: <Sparkles className="w-4 h-4 text-teal-600" /> },
  { id: 'discussion_calls', label: 'Discussion Calls & Study Pods', description: 'Virtual Meet/Zoom session links and reminders', icon: <Video className="w-4 h-4 text-purple-600" /> },
  { id: 'payments', label: 'Fee & Payment Clearance', description: 'GePG control numbers, installment deadlines, and receipts', icon: <DollarSign className="w-4 h-4 text-emerald-600" /> },
  { id: 'scholarships', label: 'Scholarship Applications', description: 'HESLB grants, Commonwealth, DAAD, and international deadlines', icon: <GraduationCap className="w-4 h-4 text-blue-600" /> },
  { id: 'jobs', label: 'Jobs & Internships', description: 'Ajira Portal postings, UN fellowships, and private sector roles', icon: <Briefcase className="w-4 h-4 text-slate-700" /> },
  { id: 'personal_events', label: 'Personal & Study Timetable', description: 'Private study sessions, appointments, and travel', icon: <Calendar className="w-4 h-4 text-violet-600" /> },
  { id: 'leisure_events', label: 'Sports, Culture & Leisure', description: 'Campus derby matches, cultural galas, and social events', icon: <Heart className="w-4 h-4 text-pink-600" /> },
];

export const AlertsManagementView: React.FC<AlertsManagementViewProps> = ({
  user,
  onNavigateTab,
  onNotify,
}) => {
  const [prefs, setPrefs] = useState<AlertPreferences>(() => StorageService.getAlertPreferences());
  const [alerts, setAlerts] = useState<SystemAlertItem[]>(() => StorageService.getSystemAlerts());
  const [browserPerm, setBrowserPerm] = useState<NotificationPermission>(() => 
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Handlers
  const handleToggleCategory = (cat: AlertCategory) => {
    const updated: AlertPreferences = {
      ...prefs,
      enabledCategories: {
        ...prefs.enabledCategories,
        [cat]: !prefs.enabledCategories[cat],
      },
    };
    setPrefs(updated);
    StorageService.saveAlertPreferences(updated);
    onNotify(`Alert category "${cat}" ${updated.enabledCategories[cat] ? 'enabled' : 'disabled'}.`);
  };

  const handleTimingChange = (timing: ReminderTiming) => {
    const updated = { ...prefs, defaultReminderTiming: timing };
    setPrefs(updated);
    StorageService.saveAlertPreferences(updated);
    onNotify('Default reminder timing updated.');
  };

  const handleSoundToggle = (enabled: boolean) => {
    soundAlerts.setSoundEnabled(enabled);
    const updated = { ...prefs, softSoundEnabled: enabled };
    setPrefs(updated);
    StorageService.saveAlertPreferences(updated);
    onNotify(enabled ? 'Soft acoustic alerts enabled.' : 'Soft acoustic alerts muted.');
  };

  const handleVolumeChange = (vol: number) => {
    soundAlerts.setVolume(vol);
    const updated = { ...prefs, soundVolume: vol };
    setPrefs(updated);
    StorageService.saveAlertPreferences(updated);
  };

  const handleMuteToggle = () => {
    const nextMuted = !prefs.isMuted;
    soundAlerts.setMuted(nextMuted);
    const updated = { ...prefs, isMuted: nextMuted };
    setPrefs(updated);
    StorageService.saveAlertPreferences(updated);
    onNotify(nextMuted ? 'Master sound muted.' : 'Master sound unmuted.');
  };

  const handleTestSound = () => {
    soundAlerts.testSound();
    onNotify('Playing test acoustic harmonic chime.');
  };

  const handleRequestBrowserPerm = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setBrowserPerm(result);
        if (result === 'granted') {
          new Notification('CampusFlow TZ', {
            body: 'Browser push notifications active for East Africa campus schedule.',
            icon: '/favicon.ico',
          });
          onNotify('Browser push notifications successfully granted!');
        } else {
          onNotify('Notification permission denied by browser.');
        }
      } catch {
        onNotify('Browser notification request not permitted in this environment.');
      }
    } else {
      onNotify('Browser notifications not supported on this device.');
    }
  };

  const handleMarkAllRead = () => {
    const updated = StorageService.markAllAlertsRead();
    setAlerts(updated);
    onNotify('All alerts marked as read.');
  };

  const handleDismiss = (id: string) => {
    const updated = StorageService.dismissAlert(id);
    setAlerts(updated);
  };

  const handleSnooze = (id: string, mins: number) => {
    const updated = StorageService.snoozeAlert(id, mins);
    setAlerts(updated);
    onNotify(`Alert snoozed for ${mins} minutes.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
              Alerts & Soft Sounds
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-semibold">
              EAT Timezone Synchronized
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Notification Center & Alert Controls
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure category preferences, reminder lead times, quiet hours, and Web Audio acoustic chimes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestSound}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-all"
            title="Listen to test harmonic chime"
          >
            <Play className="w-3.5 h-3.5 text-amber-700" />
            <span>Test Sound</span>
          </button>

          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Mark All Read
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Notification Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-sky-600" />
                <span>Recent Academic & Campus Alerts</span>
              </h2>
              <span className="text-xs text-slate-400">
                {alerts.filter(a => !a.isRead && !a.isDismissed).length} Unread
              </span>
            </div>

            {/* Offline Resilience / Architecture Banner */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <b>Local Timers & Offline Resilience:</b> Local in-tab alert timers fire accurately while the browser is open. Full background push delivery is active when online.
              </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-2.5 pt-1">
              {alerts.filter(a => !a.isDismissed).length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-70" />
                  All caught up! No active alerts pending.
                </div>
              ) : (
                alerts
                  .filter(a => !a.isDismissed)
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        alert.isRead
                          ? 'bg-white border-slate-200/80 text-slate-700'
                          : 'bg-sky-50/40 border-sky-200 text-slate-900 font-medium shadow-2xs'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${alert.isRead ? 'bg-slate-300' : 'bg-sky-500 animate-pulse'}`} />
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {alert.title}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {alert.sourceType.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                          <span>{alert.timestamp} EAT</span>
                          {alert.actionTab && onNavigateTab && (
                            <button
                              onClick={() => onNavigateTab(alert.actionTab!)}
                              className="text-sky-600 hover:underline font-bold"
                            >
                              {alert.actionLabel || 'Go to Section'} →
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Snooze 15m */}
                        <button
                          onClick={() => handleSnooze(alert.id, 15)}
                          className="px-2 py-1 rounded-lg text-[11px] text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                          title="Snooze for 15 minutes"
                        >
                          Snooze
                        </button>
                        <button
                          onClick={() => handleDismiss(alert.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Dismiss alert"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Browser Permission Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900">Desktop & Mobile Browser Push Notifications</h3>
              <p className="text-xs text-slate-500">
                Current status: <span className="font-bold capitalize">{browserPerm}</span>
              </p>
            </div>

            {browserPerm !== 'granted' ? (
              <button
                onClick={handleRequestBrowserPerm}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
              >
                Enable Push
              </button>
            ) : (
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <Check className="w-4 h-4" />
                <span>Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Audio & Timing Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* Sound & Synthesizer Settings Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-600" />
                <span>Soft Audio Synthesizer</span>
              </h2>
              <button
                onClick={handleMuteToggle}
                className={`p-1.5 rounded-xl border text-xs font-bold transition-colors ${
                  prefs.isMuted
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title={prefs.isMuted ? 'Unmute master' : 'Mute master'}
              >
                {prefs.isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Volume slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Chime Volume</span>
                <span>{prefs.soundVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={prefs.soundVolume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Quiet Hours */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span>Quiet Hours (Mute Audio)</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.quietHoursEnabled}
                  onChange={(e) => {
                    const updated = { ...prefs, quietHoursEnabled: e.target.checked };
                    setPrefs(updated);
                    StorageService.saveAlertPreferences(updated);
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              {prefs.quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-500">From</label>
                    <input
                      type="time"
                      value={prefs.quietHoursStart}
                      onChange={(e) => {
                        const updated = { ...prefs, quietHoursStart: e.target.value };
                        setPrefs(updated);
                        StorageService.saveAlertPreferences(updated);
                      }}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Until</label>
                    <input
                      type="time"
                      value={prefs.quietHoursEnd}
                      onChange={(e) => {
                        const updated = { ...prefs, quietHoursEnd: e.target.value };
                        setPrefs(updated);
                        StorageService.saveAlertPreferences(updated);
                      }}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Default Reminder Lead Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Default Reminder Lead Time</label>
              <select
                value={prefs.defaultReminderTiming}
                onChange={(e) => handleTimingChange(e.target.value as ReminderTiming)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 font-medium"
              >
                <option value="1_week">1 Week before</option>
                <option value="3_days">3 Days before</option>
                <option value="1_day">1 Day before</option>
                <option value="12_hours">12 Hours before</option>
                <option value="6_hours">6 Hours before</option>
                <option value="1_hour">1 Hour before</option>
                <option value="30_mins">30 Minutes before</option>
                <option value="15_mins">15 Minutes before (Recommended)</option>
                <option value="at_event_time">At Event Time</option>
              </select>
            </div>
          </div>

          {/* Category Preferences Toggle List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              <span>Category Notification Toggles</span>
            </h2>
            <p className="text-xs text-slate-500">
              Select which events trigger reminders and audio alerts.
            </p>

            <div className="space-y-2 pt-1">
              {CATEGORY_DEFINITIONS.map(cat => {
                const isEnabled = prefs.enabledCategories[cat.id] ?? true;
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleToggleCategory(cat.id)}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {cat.icon}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{cat.label}</div>
                        <div className="text-[10px] text-slate-400 truncate">{cat.description}</div>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => handleToggleCategory(cat.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded text-sky-600 focus:ring-sky-500 shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
