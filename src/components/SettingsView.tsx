import React, { useState } from 'react';
import { 
  Settings, 
  Building, 
  BookOpen, 
  Bell, 
  Database, 
  Github, 
  Save, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { User } from '../types';

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
  const [university, setUniversity] = useState(currentUser.university);
  const [programme, setProgramme] = useState(currentUser.programme);
  const [currentYear, setCurrentYear] = useState(currentUser.currentYear);
  const [totalYears, setTotalYears] = useState(currentUser.totalYears);
  const [academicYear, setAcademicYear] = useState('2026/27');

  const [lectureAlerts, setLectureAlerts] = useState(true);
  const [catAlerts, setCatAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...currentUser,
      university,
      programme,
      currentYear: Number(currentYear),
      totalYears: Number(totalYears),
    };
    onUpdateUser(updated);
    onNotify('Programme and campus settings saved successfully.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#d9e3ea] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 uppercase tracking-wider">
            Configuration & Preferences
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102d4f] mt-1">
            Academic Profile & System Settings
          </h1>
          <p className="text-xs text-slate-500">
            Customize degree duration, campus notifications, and local offline cache
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#d9e3ea] shadow-xs">
          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="text-base font-bold text-[#102d4f] flex items-center gap-2 mb-3">
              <Building className="w-4 h-4 text-[#1e6fa8]" /> Academic Institution & Programme
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">University / College</label>
                <select
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
                >
                  <option value="University of Dar es Salaam">University of Dar es Salaam (UDSM)</option>
                  <option value="Sokoine University of Agriculture">Sokoine University of Agriculture (SUA)</option>
                  <option value="University of Dodoma">University of Dodoma (UDOM)</option>
                  <option value="Muhimbili Univ of Health & Allied Sciences">MUHAS</option>
                  <option value="Kilimanjaro Christian Medical University">KCMUCo</option>
                  <option value="Mbeya University of Science & Tech">MUST</option>
                  <option value="State University of Zanzibar">SUZA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Degree Programme</label>
                <input
                  type="text"
                  required
                  value={programme}
                  onChange={(e) => setProgramme(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Programme Duration</label>
                <select
                  value={totalYears}
                  onChange={(e) => setTotalYears(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
                >
                  <option value={3}>3 Years (BSc / BA)</option>
                  <option value={4}>4 Years (BSc Eng / LLB)</option>
                  <option value={5}>5 Years (BSc Medicine / MD)</option>
                  <option value={6}>6 Years</option>
                  <option value={7}>7 Years</option>
                  <option value={8}>8 Years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Year</label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
                >
                  {Array.from({ length: totalYears }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Year {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Calendar Year</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
                >
                  <option value="2026/27">2026/27 (Current)</option>
                  <option value="2025/26">2025/26</option>
                </select>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-slate-500" /> Push Alert Triggers
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lectureAlerts}
                    onChange={(e) => setLectureAlerts(e.target.checked)}
                    className="w-4 h-4 text-[#1e6fa8] rounded"
                  />
                  <span>Upcoming lecture & practical room arrival warnings (15 min prior)</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={catAlerts}
                    onChange={(e) => setCatAlerts(e.target.checked)}
                    className="w-4 h-4 text-[#1e6fa8] rounded"
                  />
                  <span>Assessment & CAT deadline countdown alerts (48h and 24h prior)</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentAlerts}
                    onChange={(e) => setPaymentAlerts(e.target.checked)}
                    className="w-4 h-4 text-[#1e6fa8] rounded"
                  />
                  <span>GePG control number settlement confirmations</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#1e6fa8] hover:bg-[#185a8a] text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Academic Preferences
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: GitHub Export & Local Cache Maintenance */}
        <div className="space-y-4">
          {/* GitHub Export Card */}
          <div className="bg-gradient-to-br from-[#102d4f] to-[#1e4878] rounded-2xl p-5 text-white shadow-sm">
            <div className="flex items-center gap-2 text-[#e6ad3d] font-bold text-xs uppercase tracking-wider mb-2">
              <Github className="w-4 h-4" /> Export Codebase to GitHub
            </div>
            <h3 className="text-sm font-bold text-white leading-snug">
              Push to Personal GitHub Account
            </h3>
            <p className="text-xs text-slate-200 mt-2 leading-relaxed">
              In Google AI Studio, you can link your personal GitHub repository directly! Click the <strong className="text-[#e6ad3d]">Settings menu</strong> at the top right of the AI Studio window and choose <strong className="text-white">"Export to GitHub"</strong> or <strong className="text-white">"Download as ZIP"</strong>.
            </p>
            <div className="mt-4 pt-3 border-t border-white/15 text-[11px] text-slate-300">
              Complete modular TypeScript codebase ready for production deployment.
            </div>
          </div>

          {/* Local Cache & Data Storage Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs">
            <h3 className="text-sm font-bold text-[#102d4f] flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-[#1e6fa8]" /> Offline Storage & Reset
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              CampusFlow stores timetable data in local browser storage with cloud delta sync.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-3 flex justify-between items-center">
              <span className="text-slate-600">Pending Delta Queue:</span>
              <span className="font-bold text-[#1e6fa8]">{pendingSyncCount} changes</span>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Reset local demo data to initial defaults?')) {
                  onResetDefaults();
                }
              }}
              className="w-full py-2 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Local Demo State
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
