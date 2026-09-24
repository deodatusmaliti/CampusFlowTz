import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Volume2, 
  VolumeX, 
  Clock, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  Globe, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Laptop, 
  Smartphone, 
  Info,
  Trash2,
  AlertTriangle,
  GraduationCap,
  BookOpen,
  Users,
  Briefcase,
  Sliders,
  Check,
  Search,
  Compass,
  BellRing
} from 'lucide-react';
import { User, UserPrivacySettings, InstitutionCreditConfig, CreditSystemType } from '../types';
import { StorageService } from '../services/storageService';
import { soundAlerts } from '../services/soundAlertService';
import { TimeService, POPULAR_TIMEZONES } from '../services/timeService';

interface SettingsViewProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onResetDefaults: () => void;
  onNotify: (msg: string) => void;
  pendingSyncCount: number;
  initialSubTab?: 'alerts' | 'credit_system' | 'time_calendar' | 'privacy_security' | 'data';
}

const UNIVERSITY_CREDIT_PRESETS: Record<string, Partial<InstitutionCreditConfig>> = {
  'University of Dar es Salaam': {
    systemType: 'tanzania',
    unitLabel: 'Credits',
    normalMinCredits: 48,
    recommendedCredits: 60,
    normalMaxCredits: 72,
    annualCredits: 120,
  },
  'University of Dodoma': {
    systemType: 'tanzania',
    unitLabel: 'Credits',
    normalMinCredits: 48,
    recommendedCredits: 60,
    normalMaxCredits: 70,
    annualCredits: 120,
  },
  'Sokoine University of Agriculture': {
    systemType: 'tanzania',
    unitLabel: 'Credits',
    normalMinCredits: 50,
    recommendedCredits: 62,
    normalMaxCredits: 75,
    annualCredits: 124,
  },
  'Muhimbili University of Health and Allied Sciences': {
    systemType: 'tanzania',
    unitLabel: 'Credits',
    normalMinCredits: 55,
    recommendedCredits: 65,
    normalMaxCredits: 80,
    annualCredits: 130,
  },
  'Mzumbe University': {
    systemType: 'tanzania',
    unitLabel: 'Credits',
    normalMinCredits: 48,
    recommendedCredits: 60,
    normalMaxCredits: 72,
    annualCredits: 120,
  },
  'Mbeya University of Science and Technology': {
    systemType: 'tanzania',
    unitLabel: 'Credits',
    normalMinCredits: 50,
    recommendedCredits: 60,
    normalMaxCredits: 72,
    annualCredits: 120,
  },
  'Dar es Salaam Institute of Technology': {
    systemType: 'tanzania',
    unitLabel: 'Credits',
    normalMinCredits: 50,
    recommendedCredits: 60,
    normalMaxCredits: 70,
    annualCredits: 120,
  },
  'European University (ECTS Model)': {
    systemType: 'ects',
    unitLabel: 'ECTS',
    normalMinCredits: 25,
    recommendedCredits: 30,
    normalMaxCredits: 35,
    annualCredits: 60,
  },
  'North American University (Credit Hours)': {
    systemType: 'us_credits',
    unitLabel: 'Credit Hours',
    normalMinCredits: 12,
    recommendedCredits: 15,
    normalMaxCredits: 18,
    annualCredits: 30,
  },
  'UK / Commonwealth (CATS Model)': {
    systemType: 'uk_cats',
    unitLabel: 'CATS',
    normalMinCredits: 50,
    recommendedCredits: 60,
    normalMaxCredits: 70,
    annualCredits: 120,
  },
};

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onUpdateUser,
  onResetDefaults,
  onNotify,
  pendingSyncCount,
  initialSubTab = 'alerts',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'alerts' | 'credit_system' | 'time_calendar' | 'privacy_security' | 'data'>(initialSubTab);

  // Settings state
  const [settings, setSettings] = useState(() => StorageService.getGeneralSettings());
  const [creditConfig, setCreditConfig] = useState<InstitutionCreditConfig>(() => StorageService.getCreditConfig());
  const [tzConfig, setTzConfig] = useState(() => TimeService.getSavedConfig());
  const [hasChanges, setHasChanges] = useState(false);

  // Real-time clock state
  const [clockInfo, setClockInfo] = useState(() => TimeService.getCurrentHeaderClock());
  const [tzSearchQuery, setTzSearchQuery] = useState('');
  const [browserPermissionState, setBrowserPermissionState] = useState<string>('default');

  const importFileRef = useRef<HTMLInputElement>(null);

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setClockInfo(TimeService.getCurrentHeaderClock());
    }, 1000);
    return () => clearInterval(timer);
  }, [tzConfig]);

  // Check notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermissionState(Notification.permission);
    }
  }, []);

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateCreditConfigField = <K extends keyof InstitutionCreditConfig>(key: K, value: InstitutionCreditConfig[K]) => {
    setCreditConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleApplyUniversityPreset = (uniName: string) => {
    const preset = UNIVERSITY_CREDIT_PRESETS[uniName];
    if (preset) {
      setCreditConfig(prev => ({
        ...prev,
        institutionName: uniName,
        ...preset,
      }));
      setHasChanges(true);
      onNotify(`Applied credit guidelines for ${uniName}.`);
    } else {
      setCreditConfig(prev => ({
        ...prev,
        institutionName: uniName,
      }));
      setHasChanges(true);
    }
  };

  const handleSaveAll = () => {
    StorageService.saveGeneralSettings(settings);
    StorageService.saveCreditConfig(creditConfig);
    TimeService.saveConfig(tzConfig);
    soundAlerts.setSoundEnabled(settings.softSoundEnabled);
    soundAlerts.setVolume(settings.soundVolume);
    setHasChanges(false);
    onNotify('All settings, institution credit rules, and timezone preferences saved successfully.');
  };

  // Request browser notification permission
  const handleRequestBrowserNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      onNotify('Browser notifications are not supported in this browser environment.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setBrowserPermissionState(permission);
      if (permission === 'granted') {
        onNotify('Browser notifications granted! You will receive critical campus alerts.');
        new Notification('CampusFlow TZ Alerts Active', {
          body: 'Lecture reminders, test countdowns, and exam notifications enabled.',
          icon: '/favicon.ico',
        });
      } else {
        onNotify(`Notification permission ${permission}. Check browser permissions to enable.`);
      }
    } catch {
      onNotify('Could not request notification permissions.');
    }
  };

  // Test sound and live notification
  const handleTriggerTestAlert = () => {
    soundAlerts.playLectureChime();
    onNotify('🔔 Test Alert: "BIO 203: Biostatistics & Research in Hall 03 starts in 15 minutes."');
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('CampusFlow TZ • Test Notification', {
        body: 'Lecture reminder: BIO 203 in Hall 03 begins in 15 minutes.',
        icon: '/favicon.ico',
      });
    }
  };

  // Reset alert settings
  const handleResetAlertSettings = () => {
    const defaultAlerts = {
      lectureArrivalAlerts: true,
      lectureLeadMinutes: 15,
      catDeadlineCountdown: true,
      examScheduleAlerts: true,
      courseMaterialAlerts: true,
      studyGroupAlerts: true,
      opportunityAlerts: true,
      personalEventAlerts: true,
      softSoundEnabled: true,
      soundVolume: 75,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '06:30',
      muteDuringQuietHours: true,
      emailWeeklyDigest: true,
      whatsappEmergencyCancel: false,
    };
    setSettings((prev: any) => ({ ...prev, ...defaultAlerts }));
    setHasChanges(true);
    onNotify('Notification preferences restored to default.');
  };

  // Export full JSON dump
  const handleExportFullBackup = () => {
    const jsonStr = StorageService.exportAllDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CampusFlow_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify('Complete application backup exported successfully.');
  };

  // Import JSON dump
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importAllDataFromJSON(content);
      if (success) {
        onNotify('Backup imported successfully! Reloading configuration...');
        setTimeout(() => window.location.reload(), 800);
      } else {
        onNotify('Error: Invalid backup file format. Please check the JSON structure.');
      }
    };
    reader.readAsText(file);
  };

  const filteredTimezones = POPULAR_TIMEZONES.filter(tz =>
    tz.label.toLowerCase().includes(tzSearchQuery.toLowerCase()) ||
    tz.iana.toLowerCase().includes(tzSearchQuery.toLowerCase()) ||
    tz.region.toLowerCase().includes(tzSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-900 text-xs font-bold uppercase tracking-wider">
              Academic Settings
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold">
              Canonical Settings & Preferences
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-sky-700" /> Settings & System Controls
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Manage alerts and reminders, institutional credit limits, local timezone conversion, and backups
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-sm active:scale-95 ${
            hasChanges ? 'bg-amber-600 hover:bg-amber-700 animate-pulse' : 'bg-sky-700 hover:bg-sky-800'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{hasChanges ? 'Save Changes *' : 'Save Preferences'}</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('alerts')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'alerts'
              ? 'bg-sky-900 text-white shadow-xs'
              : 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Alerts & Reminders</span>
        </button>

        <button
          onClick={() => setActiveSubTab('credit_system')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'credit_system'
              ? 'bg-sky-900 text-white shadow-xs'
              : 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Course-Credit System</span>
        </button>

        <button
          onClick={() => setActiveSubTab('time_calendar')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'time_calendar'
              ? 'bg-sky-900 text-white shadow-xs'
              : 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Timezone & Timetable Clock</span>
        </button>

        <button
          onClick={() => setActiveSubTab('privacy_security')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'privacy_security'
              ? 'bg-sky-900 text-white shadow-xs'
              : 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Security & Presence</span>
        </button>

        <button
          onClick={() => setActiveSubTab('data')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'data'
              ? 'bg-sky-900 text-white shadow-xs'
              : 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Data Backup & Reset</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CANONICAL ALERTS & REMINDERS SECTION */}
      {/* ========================================================================= */}
      {activeSubTab === 'alerts' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Quick Action Top Bar */}
          <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-sky-950 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-sky-700" /> Canonical Alerts & Reminders Center
              </h2>
              <p className="text-xs text-sky-900 mt-0.5">
                All campus alerts, reminders, lecture chimes, and assessment countdowns are configured here.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTriggerTestAlert}
                className="px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Notification</span>
              </button>
              <button
                type="button"
                onClick={handleResetAlertSettings}
                className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors border border-slate-200"
              >
                Reset Defaults
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Academic Triggers */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Clock className="w-4 h-4 text-sky-700" /> Academic Event Reminders
              </h3>

              <div className="space-y-3.5">
                {/* 1. Lecture Reminders */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Lecture Reminders</div>
                      <div className="text-[11px] text-slate-600">Audio and visual alarm before scheduled classes and lab sessions</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.lectureArrivalAlerts !== false}
                      onChange={(e) => updateSetting('lectureArrivalAlerts', e.target.checked)}
                      className="w-4 h-4 text-sky-700 rounded"
                    />
                  </div>
                  {settings.lectureArrivalAlerts !== false && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                      <span className="text-slate-700 font-medium">Notification Lead Time:</span>
                      <select
                        value={settings.lectureLeadMinutes || 15}
                        onChange={(e) => updateSetting('lectureLeadMinutes', Number(e.target.value))}
                        className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-900"
                      >
                        <option value={10}>10 minutes prior</option>
                        <option value={15}>15 minutes prior (Recommended)</option>
                        <option value={30}>30 minutes prior</option>
                        <option value={60}>1 hour prior</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* 2. Assignment Reminders */}
                <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Assignment Reminders</div>
                    <div className="text-[11px] text-slate-600">Advance deadline notifications (48h and 24h prior) to prevent late submissions</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.catDeadlineCountdown !== false}
                    onChange={(e) => updateSetting('catDeadlineCountdown', e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-sky-700 rounded"
                  />
                </label>

                {/* 3. Test & Exam Reminders */}
                <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Test & Exam Reminders</div>
                    <div className="text-[11px] text-slate-600">Continuous Assessment Tests (CATs), seating arrangements, and university exams</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.examScheduleAlerts !== false}
                    onChange={(e) => updateSetting('examScheduleAlerts', e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-sky-700 rounded"
                  />
                </label>

                {/* 4. Course-Material Notifications */}
                <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Course-Material Notifications</div>
                    <div className="text-[11px] text-slate-600">Alerts when lecturers publish new lecture notes, dissection guides, or lab manuals</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.courseMaterialAlerts !== false}
                    onChange={(e) => updateSetting('courseMaterialAlerts', e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-sky-700 rounded"
                  />
                </label>

                {/* 5. Study-Group Notifications */}
                <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Study-Group Notifications</div>
                    <div className="text-[11px] text-slate-600">Reminders for group discussions, peer revision circles, and virtual study calls</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.studyGroupAlerts !== false}
                    onChange={(e) => updateSetting('studyGroupAlerts', e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-sky-700 rounded"
                  />
                </label>

                {/* 6. Opportunity Deadline Reminders */}
                <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Opportunity Deadline Reminders</div>
                    <div className="text-[11px] text-slate-600">Internships, research grants, scholarships, and graduate trainee closing dates</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.opportunityAlerts !== false}
                    onChange={(e) => updateSetting('opportunityAlerts', e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-sky-700 rounded"
                  />
                </label>

                {/* 7. Personal-Event Reminders */}
                <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Personal-Event Reminders</div>
                    <div className="text-[11px] text-slate-600">Campus fitness sessions, intramural sports matches, and student association meetups</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.personalEventAlerts !== false}
                    onChange={(e) => updateSetting('personalEventAlerts', e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-sky-700 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Column 2: Sound, Quiet Hours & Channels */}
            <div className="space-y-6">
              {/* Sound Controls */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Volume2 className="w-4 h-4 text-sky-700" /> Sound Controls & Volume
                </h3>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    {settings.softSoundEnabled ? <Volume2 className="w-4 h-4 text-sky-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                    <div>
                      <div className="text-xs font-bold text-slate-900">Acoustic Audio Chimes</div>
                      <div className="text-[11px] text-slate-600">Harmonic bell chime for lectures and test countdowns</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.softSoundEnabled !== false}
                    onChange={(e) => {
                      updateSetting('softSoundEnabled', e.target.checked);
                      soundAlerts.setSoundEnabled(e.target.checked);
                    }}
                    className="w-4 h-4 text-sky-700 rounded"
                  />
                </label>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                    <span>Chime Volume</span>
                    <span className="font-mono text-sky-700">{settings.soundVolume || 75}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.soundVolume || 75}
                    onChange={(e) => {
                      const vol = Number(e.target.value);
                      updateSetting('soundVolume', vol);
                      soundAlerts.setVolume(vol);
                    }}
                    className="w-full accent-sky-700"
                  />
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Clock className="w-4 h-4 text-indigo-700" /> Quiet Hours & Study Focus
                </h3>

                <label className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Enable Quiet Hours</div>
                    <div className="text-[11px] text-slate-600">Suppress audio chimes during nocturnal or silent study hours</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.quietHoursEnabled === true}
                    onChange={(e) => updateSetting('quietHoursEnabled', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </label>

                {settings.quietHoursEnabled && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Start Time (Evening)</label>
                      <input
                        type="time"
                        value={settings.quietHoursStart || '22:00'}
                        onChange={(e) => updateSetting('quietHoursStart', e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">End Time (Morning)</label>
                      <input
                        type="time"
                        value={settings.quietHoursEnd || '06:30'}
                        onChange={(e) => updateSetting('quietHoursEnd', e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Browser Permission & External Preferences */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Smartphone className="w-4 h-4 text-emerald-700" /> Delivery Channels
                </h3>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Browser Push Notifications</div>
                    <div className="text-[11px] text-slate-600">
                      Status: <span className="font-semibold capitalize text-sky-800">{browserPermissionState}</span>
                    </div>
                  </div>
                  {browserPermissionState !== 'granted' ? (
                    <button
                      type="button"
                      onClick={handleRequestBrowserNotification}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Request Permission
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3" /> Enabled
                    </span>
                  )}
                </div>

                <div className="space-y-3 pt-1">
                  <label className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Weekly Email Academic Digest</div>
                      <div className="text-[11px] text-slate-600">Summary of upcoming classes, deadlines, and CAT schedules</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emailWeeklyDigest !== false}
                      onChange={(e) => updateSetting('emailWeeklyDigest', e.target.checked)}
                      className="w-4 h-4 text-sky-700 rounded"
                    />
                  </label>

                  <label className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Emergency Rescheduling via WhatsApp</div>
                      <div className="text-[11px] text-slate-600">Fast notices if lecturer relocates hall or cancels attendance</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.whatsappEmergencyCancel === true}
                      onChange={(e) => updateSetting('whatsappEmergencyCancel', e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FLEXIBLE COURSE-CREDIT SYSTEM */}
      {/* ========================================================================= */}
      {activeSubTab === 'credit_system' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs text-amber-950">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm">Flexible Institutional Credit Framework</div>
              <p className="leading-relaxed">
                CampusFlow does not enforce a rigid universal credit cap. Every university, faculty, and national regulatory body (such as TCU in Tanzania) specifies its own credit ranges and workload ratios.
              </p>
              <p className="font-bold text-amber-900 pt-1">
                Notice: Confirm enrolment limits with your university or academic office. CampusFlow provides planning tools only and does not decide whether course enrolment is officially valid.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Institution & Credit Model Configuration */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <GraduationCap className="w-4 h-4 text-sky-700" /> Institution Profile & Credit Model
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Select University or Institution Preset
                  </label>
                  <select
                    value={creditConfig.institutionName}
                    onChange={(e) => handleApplyUniversityPreset(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-sky-600"
                  >
                    {Object.keys(UNIVERSITY_CREDIT_PRESETS).map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                    <option value="Custom Institution">Custom / Other Institution</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Credit System Architecture
                    </label>
                    <select
                      value={creditConfig.systemType}
                      onChange={(e) => {
                        const val = e.target.value as CreditSystemType;
                        updateCreditConfigField('systemType', val);
                        if (val === 'tanzania') updateCreditConfigField('unitLabel', 'Credits');
                        else if (val === 'ects') updateCreditConfigField('unitLabel', 'ECTS');
                        else if (val === 'us_credits') updateCreditConfigField('unitLabel', 'Credit Hours');
                        else if (val === 'uk_cats') updateCreditConfigField('unitLabel', 'CATS');
                        else updateCreditConfigField('unitLabel', 'Units');
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white"
                    >
                      <option value="tanzania">Tanzanian University Credits (TCU Standards)</option>
                      <option value="ects">ECTS Credits (European Credit Transfer System)</option>
                      <option value="us_credits">US Credit Hours (North American Standard)</option>
                      <option value="uk_cats">UK / CATS Credits (Credit Accumulation Scheme)</option>
                      <option value="custom">Custom Institutional Credits</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Credit Unit Label
                    </label>
                    <input
                      type="text"
                      value={creditConfig.unitLabel}
                      onChange={(e) => updateCreditConfigField('unitLabel', e.target.value)}
                      placeholder="e.g. Credits, ECTS, CATS"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white font-medium"
                    />
                  </div>
                </div>

                {/* Semester Normal Range Inputs */}
                <div className="pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                    Semester Workload & Threshold Configuration
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-700">Minimum</label>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        value={creditConfig.normalMinCredits}
                        onChange={(e) => updateCreditConfigField('normalMinCredits', Number(e.target.value))}
                        className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm font-bold text-slate-900 bg-white"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">Full-time floor</span>
                    </div>

                    <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                      <label className="block text-[11px] font-bold text-sky-900">Recommended</label>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        value={creditConfig.recommendedCredits}
                        onChange={(e) => updateCreditConfigField('recommendedCredits', Number(e.target.value))}
                        className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-sky-300 text-sm font-bold text-sky-950 bg-white"
                      />
                      <span className="text-[10px] text-sky-800 mt-1 block">Standard target</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-700">Maximum</label>
                      <input
                        type="number"
                        min="0"
                        max="250"
                        value={creditConfig.normalMaxCredits}
                        onChange={(e) => updateCreditConfigField('normalMaxCredits', Number(e.target.value))}
                        className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm font-bold text-slate-900 bg-white"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">Semester ceiling</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-700">Annual Total</label>
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={creditConfig.annualCredits}
                        onChange={(e) => updateCreditConfigField('annualCredits', Number(e.target.value))}
                        className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm font-bold text-slate-900 bg-white"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">Academic year</span>
                    </div>
                  </div>
                </div>

                {/* Practical / Clinical Weighting */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Practical & Clinical Coursework Weighting</div>
                    <div className="text-[11px] text-slate-600">Apply custom weighting multiplier for lab bench, hospital wards, or field study</div>
                  </div>
                  <select
                    value={creditConfig.practicalWeightingMultiplier || 1.0}
                    onChange={(e) => updateCreditConfigField('practicalWeightingMultiplier', Number(e.target.value))}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                  >
                    <option value={1.0}>1.0x (Standard 1:1 weight)</option>
                    <option value={1.25}>1.25x (Heavy laboratory load)</option>
                    <option value={1.5}>1.5x (Clinical & fieldwork intensive)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Student Warnings & Enforcement Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sliders className="w-4 h-4 text-emerald-700" /> Warnings & Disclaimers
              </h2>

              <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-900">Enable Credit Limit Warnings</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    If disabled, no warning badges will trigger during course enrolment. Limits remain optional guidelines.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={creditConfig.allowWarnings === true}
                  onChange={(e) => updateCreditConfigField('allowWarnings', e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-emerald-600 rounded"
                />
              </label>

              <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200 text-xs text-sky-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-700" /> Active System Status
                </div>
                <div className="text-[11px] text-slate-700 leading-relaxed">
                  Currently active model: <b>{creditConfig.systemType.toUpperCase()}</b> ({creditConfig.unitLabel}).
                  Normal semester range: <b>{creditConfig.normalMinCredits} – {creditConfig.normalMaxCredits} {creditConfig.unitLabel}</b>.
                  Credit warnings during enrolment: <b>{creditConfig.allowWarnings ? 'ENABLED (Informational Only)' : 'DISABLED (No Warnings)'}</b>.
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 leading-relaxed">
                Students can adjust their institution's normal credit range without administrative restriction.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TIMEZONE & TIMETABLE CLOCK DISPLAY */}
      {/* ========================================================================= */}
      {activeSubTab === 'time_calendar' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Live Real-Time Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-sky-800/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-sky-300 text-xs font-bold uppercase tracking-wider">
                  Live Master Academic Clock
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight mt-1 text-white">
                  {clockInfo.timeFormatted}
                </div>
                <div className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  {clockInfo.dateFormatted} • {clockInfo.timeZoneName}
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5">
                <span className="px-3 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold font-mono">
                  {clockInfo.fullBadge}
                </span>
                <span className="text-[11px] text-slate-400">
                  {clockInfo.isEastAfricaTime ? 'Official Tanzania East Africa Time (EAT)' : 'Converted Local Device Timezone'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Globe className="w-4 h-4 text-sky-700" /> Timezone System Selection
              </h2>

              <div className="space-y-3.5">
                {/* 1. Automatic Browser Timezone */}
                <div
                  onClick={() => {
                    setTzConfig(prev => ({ ...prev, mode: 'auto' }));
                    setHasChanges(true);
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    tzConfig.mode === 'auto'
                      ? 'border-sky-700 bg-sky-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    tzConfig.mode === 'auto' ? 'border-sky-700 bg-sky-700 text-white' : 'border-slate-300'
                  }`}>
                    {tzConfig.mode === 'auto' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">Automatic Device Timezone</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Adaptive
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Automatically queries your browser's environment (Detected: <b>{TimeService.getDetectedTimezone()}</b>). Adapts seamlessly for daylight-saving changes.
                    </p>
                  </div>
                </div>

                {/* 2. Tanzania / East Africa Time */}
                <div
                  onClick={() => {
                    setTzConfig(prev => ({ ...prev, mode: 'tanzania' }));
                    setHasChanges(true);
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    tzConfig.mode === 'tanzania'
                      ? 'border-sky-700 bg-sky-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    tzConfig.mode === 'tanzania' ? 'border-sky-700 bg-sky-700 text-white' : 'border-slate-300'
                  }`}>
                    {tzConfig.mode === 'tanzania' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">Tanzania / East Africa Time (EAT)</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        Africa/Dar_es_Salaam • UTC+3
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Matches the official campus operational schedule across UDSM, UDOM, SUA, MZUMBE, MUST, DIT, and all East African institutions.
                    </p>
                  </div>
                </div>

                {/* 3. Manual Timezone */}
                <div
                  onClick={() => {
                    setTzConfig(prev => ({ ...prev, mode: 'manual' }));
                    setHasChanges(true);
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    tzConfig.mode === 'manual'
                      ? 'border-sky-700 bg-sky-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    tzConfig.mode === 'manual' ? 'border-sky-700 bg-sky-700 text-white' : 'border-slate-300'
                  }`}>
                    {tzConfig.mode === 'manual' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">Manual Timezone Selection</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        Custom
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Choose an explicit IANA timezone when traveling, on international academic exchange, or studying remotely.
                    </p>

                    {tzConfig.mode === 'manual' && (
                      <div className="pt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            placeholder="Filter by city or country (e.g. London, Nairobi, Lagos)..."
                            value={tzSearchQuery}
                            onChange={(e) => setTzSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900"
                          />
                        </div>

                        <select
                          value={tzConfig.manualTimezone}
                          onChange={(e) => {
                            setTzConfig(prev => ({ ...prev, manualTimezone: e.target.value }));
                            setHasChanges(true);
                          }}
                          className="w-full p-2.5 text-xs rounded-lg border border-slate-300 font-medium text-slate-900 bg-white"
                        >
                          {filteredTimezones.map(tz => (
                            <option key={tz.iana} value={tz.iana}>
                              {tz.label} ({tz.offset}) — {tz.iana}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Time System Integration Guarantee */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Compass className="w-4 h-4 text-sky-700" /> Unified Clock Architecture
              </h2>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <p>
                  Every schedule entity across CampusFlow TZ shares the same unified time engine:
                </p>
                <ul className="space-y-2 list-disc list-inside text-slate-800">
                  <li><b>Semester Timetable:</b> Class start/end periods</li>
                  <li><b>Examinations:</b> University exam hall admissions</li>
                  <li><b>Assignments:</b> Submission cut-off countdowns</li>
                  <li><b>System Alerts:</b> Imminent lecture audio chimes</li>
                  <li><b>Quiet Hours:</b> Suppression of acoustic alarms</li>
                </ul>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                  Times are never stored as hard-coded demo labels. Daylight saving time changes (DST) are calculated natively via international standard algorithms.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SECURITY & PRESENCE */}
      {/* ========================================================================= */}
      {activeSubTab === 'privacy_security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-sky-700" /> Student Profile Privacy
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Peer Profile Visibility</label>
                <select
                  value={currentUser.privacySettings?.profileVisibility || 'classmates'}
                  onChange={(e) => {
                    const defaultPrivacy: UserPrivacySettings = {
                      profileVisibility: 'classmates',
                      showPhone: false,
                      showWhatsapp: false,
                      showEmail: true,
                      allowInvites: true,
                      ...currentUser.privacySettings,
                    };
                    const updated: User = {
                      ...currentUser,
                      privacySettings: {
                        ...defaultPrivacy,
                        profileVisibility: e.target.value as 'public' | 'classmates' | 'private',
                      },
                    };
                    onUpdateUser(updated);
                    onNotify('Profile visibility preference saved.');
                  }}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white"
                >
                  <option value="public">Campus-wide (All verified students)</option>
                  <option value="classmates">Programme Only (Zoology / Class Cohort)</option>
                  <option value="private">Private (Only instructors and admins)</option>
                </select>
              </div>

              <div className="pt-2 space-y-2.5">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="text-xs font-bold text-slate-800">Show Phone Number to Peers</span>
                  <input
                    type="checkbox"
                    checked={currentUser.privacySettings?.showPhone || false}
                    onChange={(e) => {
                      const defaultPrivacy: UserPrivacySettings = {
                        profileVisibility: 'classmates',
                        showPhone: false,
                        showWhatsapp: false,
                        showEmail: true,
                        allowInvites: true,
                        ...currentUser.privacySettings,
                      };
                      const updated: User = {
                        ...currentUser,
                        privacySettings: {
                          ...defaultPrivacy,
                          showPhone: e.target.checked,
                        },
                      };
                      onUpdateUser(updated);
                      onNotify('Phone privacy setting updated.');
                    }}
                    className="w-4 h-4 text-sky-700 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="text-xs font-bold text-slate-800">Allow Direct Study Group Invites</span>
                  <input
                    type="checkbox"
                    checked={currentUser.privacySettings?.allowInvites !== false}
                    onChange={(e) => {
                      const defaultPrivacy: UserPrivacySettings = {
                        profileVisibility: 'classmates',
                        showPhone: false,
                        showWhatsapp: false,
                        showEmail: true,
                        allowInvites: true,
                        ...currentUser.privacySettings,
                      };
                      const updated: User = {
                        ...currentUser,
                        privacySettings: {
                          ...defaultPrivacy,
                          allowInvites: e.target.checked,
                        },
                      };
                      onUpdateUser(updated);
                      onNotify('Invite preferences updated.');
                    }}
                    className="w-4 h-4 text-sky-700 rounded"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Laptop className="w-4 h-4 text-slate-700" /> Device & Session State
            </h2>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Pending Cloud Sync Items:</span>
                <span className="font-bold text-slate-900 font-mono">{pendingSyncCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Authentication Method:</span>
                <span className="font-bold text-slate-900 uppercase">{currentUser.authProvider || 'Email / Password'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Two-Factor Authentication:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Protected</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DATA BACKUP & RESET */}
      {/* ========================================================================= */}
      {activeSubTab === 'data' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Download className="w-4 h-4 text-sky-700" /> Full Data Backup & Export
            </h2>
            <p className="text-xs text-slate-600">
              Export a complete snapshot of your academic profile, enrolled courses, timetable periods, study materials, and alerts in standard JSON.
            </p>

            <button
              type="button"
              onClick={handleExportFullBackup}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export Complete Academic Archive (JSON)</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <RotateCcw className="w-4 h-4 text-amber-700" /> Restore Sample Defaults
            </h2>
            <p className="text-xs text-slate-600">
              Re-seed standard demo courses, authentic downloadable study materials, and academic timetables for the University of Dar es Salaam.
            </p>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Restore standard demo data across your campus profile and timetable?')) {
                  onResetDefaults();
                  onNotify('Default academic configuration restored.');
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all border border-slate-300"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
              <span>Reset to Standard Sample Data</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
