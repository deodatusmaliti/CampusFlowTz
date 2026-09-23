import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Volume2, 
  VolumeX, 
  Clock, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  Globe, 
  Moon, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Volume1, 
  Laptop, 
  Sun, 
  Lock, 
  Smartphone, 
  Eye, 
  Info,
  Trash2
} from 'lucide-react';
import { User } from '../types';
import { StorageService } from '../services/storageService';
import { soundAlerts } from '../services/soundAlertService';

interface SettingsViewProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onResetDefaults: () => void;
  onNotify: (msg: string) => void;
  pendingSyncCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onUpdateUser,
  onResetDefaults,
  onNotify,
  pendingSyncCount,
}) => {
  // Load general settings from StorageService
  const [settings, setSettings] = useState(() => StorageService.getGeneralSettings());
  const [activeSubTab, setActiveSubTab] = useState<'notifications' | 'sound' | 'time_calendar' | 'privacy_security' | 'data'>('notifications');
  const [hasChanges, setHasChanges] = useState(false);

  const importFileRef = useRef<HTMLInputElement>(null);

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    StorageService.saveGeneralSettings(settings);
    soundAlerts.setSoundEnabled(settings.softSoundEnabled);
    soundAlerts.setVolume(settings.soundVolume);
    setHasChanges(false);
    onNotify('Application preferences and notification rules saved successfully.');
  };

  // Sound testing handlers
  const handleTestLectureChime = () => {
    soundAlerts.playLectureChime();
    onNotify('Playing lecture arrival chime preview.');
  };

  const handleTestCatReminder = () => {
    soundAlerts.playCatReminder();
    onNotify('Playing Continuous Assessment Test (CAT) alert chime.');
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

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
              System Preferences
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
              Version 2.5.0
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-sky-600" /> Application Preferences & System Controls
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure sound alarms, quiet hours, timezone adjustments, offline sync, and platform data
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-sm active:scale-95 ${
            hasChanges ? 'bg-amber-500 hover:bg-amber-600 animate-pulse' : 'bg-sky-600 hover:bg-sky-700'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{hasChanges ? 'Save Changes *' : 'Save Preferences'}</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'notifications'
              ? 'bg-sky-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sound')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'sound'
              ? 'bg-sky-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Sound & Quiet Hours</span>
        </button>

        <button
          onClick={() => setActiveSubTab('time_calendar')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'time_calendar'
              ? 'bg-sky-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Timezone & Timetable Display</span>
        </button>

        <button
          onClick={() => setActiveSubTab('privacy_security')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'privacy_security'
              ? 'bg-sky-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Security & Presence</span>
        </button>

        <button
          onClick={() => setActiveSubTab('data')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'data'
              ? 'bg-sky-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Data Backup & Cache</span>
        </button>
      </div>

      {/* Tab 1: Notifications */}
      {activeSubTab === 'notifications' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Bell className="w-4 h-4 text-sky-600" /> Academic Schedule Notifications
            </h2>

            <div className="space-y-3">
              <label className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Imminent Lecture Arrival Warning</div>
                  <div className="text-[11px] text-slate-500">Alert 15 minutes before classes start with hall and route directions</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.lectureArrivalAlerts}
                  onChange={(e) => updateSetting('lectureArrivalAlerts', e.target.checked)}
                  className="w-4 h-4 mt-1 text-sky-600 rounded"
                />
              </label>

              <label className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">CAT & Assignment Deadline Countdown</div>
                  <div className="text-[11px] text-slate-500">Send reminder alerts 48h and 24h prior to assessment deadlines</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.catDeadlineCountdown}
                  onChange={(e) => updateSetting('catDeadlineCountdown', e.target.checked)}
                  className="w-4 h-4 mt-1 text-sky-600 rounded"
                />
              </label>

              <label className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Grade & Coursework Score Release</div>
                  <div className="text-[11px] text-slate-500">Instant notification when lecturer publishes CAT scores or attendance feedback</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.gradeReleaseAlerts}
                  onChange={(e) => updateSetting('gradeReleaseAlerts', e.target.checked)}
                  className="w-4 h-4 mt-1 text-sky-600 rounded"
                />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Smartphone className="w-4 h-4 text-emerald-600" /> External Channels (Email & WhatsApp)
            </h2>

            <div className="space-y-3">
              <label className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Weekly Email Academic Digest</div>
                  <div className="text-[11px] text-slate-500">Receive weekly timetable summary and upcoming lab schedule</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailWeeklyDigest}
                  onChange={(e) => updateSetting('emailWeeklyDigest', e.target.checked)}
                  className="w-4 h-4 mt-1 text-sky-600 rounded"
                />
              </label>

              <label className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Emergency Rescheduling via WhatsApp</div>
                  <div className="text-[11px] text-slate-500">Fast alerts if lecturer changes venue (e.g. Hall 03 to ICT Lab 2)</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.whatsappEmergencyCancel}
                  onChange={(e) => updateSetting('whatsappEmergencyCancel', e.target.checked)}
                  className="w-4 h-4 mt-1 text-emerald-600 rounded"
                />
              </label>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Registered WhatsApp Alert Number</label>
                <input
                  type="tel"
                  value={settings.whatsappNumber}
                  onChange={(e) => updateSetting('whatsappNumber', e.target.value)}
                  placeholder="+255 754 123 456"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Used only for automated course notices if opted-in</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sound & Quiet Hours */}
      {activeSubTab === 'sound' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Volume2 className="w-4 h-4 text-sky-600" /> Audio Chimes & Alert Sounds
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 cursor-pointer">
                <div className="flex items-center gap-2">
                  {settings.softSoundEnabled ? <Volume2 className="w-4 h-4 text-sky-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  <div>
                    <div className="text-xs font-bold text-slate-800">Enable Alert Chimes</div>
                    <div className="text-[11px] text-slate-500">Play pleasant soft chime for lectures and test countdowns</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.softSoundEnabled}
                  onChange={(e) => {
                    updateSetting('softSoundEnabled', e.target.checked);
                    soundAlerts.setSoundEnabled(e.target.checked);
                  }}
                  className="w-4 h-4 text-sky-600 rounded"
                />
              </label>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Chime Volume</span>
                  <span className="font-mono">{settings.soundVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.soundVolume}
                  onChange={(e) => {
                    const vol = Number(e.target.value);
                    updateSetting('soundVolume', vol);
                    soundAlerts.setVolume(vol);
                  }}
                  className="w-full accent-sky-600"
                />
              </div>

              {/* Sound Test Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleTestLectureChime}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition-colors"
                >
                  <Volume1 className="w-3.5 h-3.5" />
                  <span>Test Lecture Chime</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestCatReminder}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Test CAT Exam Alert</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Moon className="w-4 h-4 text-indigo-600" /> Quiet Hours & Do Not Disturb
            </h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Activate Night Quiet Hours</div>
                  <div className="text-[11px] text-slate-500">Mute audio chimes and non-urgent popups while resting</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.quietHoursEnabled}
                  onChange={(e) => updateSetting('quietHoursEnabled', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </label>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quiet Hours Start</label>
                  <input
                    type="time"
                    value={settings.quietHoursStart}
                    onChange={(e) => updateSetting('quietHoursStart', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quiet Hours End</label>
                  <input
                    type="time"
                    value={settings.quietHoursEnd}
                    onChange={(e) => updateSetting('quietHoursEnd', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Timezone & Timetable Display */}
      {activeSubTab === 'time_calendar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Globe className="w-4 h-4 text-sky-600" /> Campus Timezone Configuration
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => updateSetting('timezone', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Africa/Dar_es_Salaam">Africa/Dar_es_Salaam (East Africa Time - EAT, UTC+3)</option>
                  <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
                  <option value="Africa/Kampala">Africa/Kampala (EAT, UTC+3)</option>
                  <option value="UTC">UTC (Universal Time)</option>
                  <option value="local">Local Browser Timezone Detection</option>
                </select>
                <div className="mt-2 p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-[11px] flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>
                    Current campus standard: <strong>East Africa Time (UTC+3)</strong>. All course lecture slots, attendance QR expiry windows, and submission deadlines align with this reference.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <CalendarIcon className="w-4 h-4 text-emerald-600" /> Calendar & Timetable Layout
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Timetable View</label>
                <select
                  value={settings.calendarViewDefault}
                  onChange={(e) => updateSetting('calendarViewDefault', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="week">Full Academic Week Grid (Mon - Sun)</option>
                  <option value="day">Day Agenda (Classes Today)</option>
                  <option value="month">Full Month Calendar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">First Day of the Week</label>
                <select
                  value={settings.firstDayOfWeek}
                  onChange={(e) => updateSetting('firstDayOfWeek', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Monday">Monday (Tanzanian University Standard)</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lead Time for Upcoming Classes</label>
                <select
                  value={settings.reminderLeadTime}
                  onChange={(e) => updateSetting('reminderLeadTime', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="15_mins">15 minutes before class</option>
                  <option value="30_mins">30 minutes before class</option>
                  <option value="1_hour">1 hour before class</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security & Presence */}
      {activeSubTab === 'privacy_security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Account Security & Session
            </h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Multi-Factor Authentication (MFA)</div>
                  <div className="text-[11px] text-slate-500">Require one-time email OTP verification on login</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.mfaActive}
                  onChange={(e) => updateSetting('mfaActive', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Inactivity Timeout</label>
                <select
                  value={settings.sessionTimeoutMinutes}
                  onChange={(e) => updateSetting('sessionTimeoutMinutes', Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes (1 hour)</option>
                  <option value={120}>2 hours</option>
                  <option value={480}>8 hours (Full campus day)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Eye className="w-4 h-4 text-sky-600" /> Study Group Presence & Receipts
            </h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Show Online Presence in Study Pods</div>
                  <div className="text-[11px] text-slate-500">Display green indicator when you are active on the platform</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.onlinePresence}
                  onChange={(e) => updateSetting('onlinePresence', e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Message Read Receipts</div>
                  <div className="text-[11px] text-slate-500">Show blue checkmarks when study pod messages are viewed</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.readReceipts}
                  onChange={(e) => updateSetting('readReceipts', e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Data Backup, Import & Cache */}
      {activeSubTab === 'data' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Database className="w-4 h-4 text-sky-600" /> Complete System Backup & Restore
            </h2>

            <p className="text-xs text-slate-500">
              Export all courses, timetable slots, study materials, peer chat threads, and preferences to a portable JSON backup file.
            </p>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleExportFullBackup}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Export Full Backup (JSON)</span>
              </button>

              <div className="relative">
                <input
                  type="file"
                  ref={importFileRef}
                  onChange={handleImportFile}
                  accept=".json,application/json"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => importFileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Restore from Backup File</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-red-700 flex items-center gap-2 pb-2 border-b border-red-100">
              <RotateCcw className="w-4 h-4 text-red-600" /> Reset & Local Cache Reset
            </h2>

            <p className="text-xs text-slate-500">
              Restore default demo sample data across all timetables, study materials, student network chats, and alerts.
            </p>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="font-bold">Pending Offline Changes: {pendingSyncCount}</div>
              <div className="text-[11px] text-amber-700">Resetting local demo storage will restore the standard university dataset.</div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onResetDefaults}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-red-600" />
                <span>Reset to Default Demo State</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
