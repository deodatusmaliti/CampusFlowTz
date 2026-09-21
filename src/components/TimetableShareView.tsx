import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  MessageSquare, 
  Download, 
  FileText,
  Calendar,
  Sparkles 
} from 'lucide-react';
import { Course, CalendarEvent } from '../types';

interface TimetableShareViewProps {
  courses: Course[];
  events: CalendarEvent[];
  onNotify: (msg: string) => void;
}

export const TimetableShareView: React.FC<TimetableShareViewProps> = ({
  courses,
  events,
  onNotify,
}) => {
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);

  // Generate shareable message
  const generateShareText = () => {
    if (selectedCourseCode === 'ALL') {
      let msg = `🎓 *CAMPUSFLOW TZ - SEMESTER TIMETABLE (UDSM)* 🎓\n\n`;
      courses.forEach((c) => {
        msg += `📚 *${c.code}* - ${c.title}\n`;
        msg += `👨‍🏫 ${c.lecturer} | 📍 ${c.hall}\n`;
        msg += `⏰ ${c.schedule}\n\n`;
      });
      msg += `Sync your timetable and CAT reminders on CampusFlow TZ!`;
      return msg;
    } else {
      const course = courses.find((c) => c.code === selectedCourseCode);
      if (!course) return '';
      return `📚 *CampusFlow TZ Timetable - ${course.code}*\n` +
             `Course: ${course.title}\n` +
             `Lecturer: ${course.lecturer}\n` +
             `Lecture Hall: ${course.hall}\n` +
             `Schedule: ${course.schedule}\n` +
             `Notes: ${course.notes || 'N/A'}\n\n` +
             `Sent via CampusFlow TZ.`;
    }
  };

  const shareText = generateShareText();

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareText);
    setCopied(true);
    onNotify('Timetable copied to clipboard.');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onNotify('Opening WhatsApp with formatted timetable.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#d9e3ea] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 uppercase tracking-wider">
            Collaboration & Sharing
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102d4f] mt-1">
            Share Academic Timetable
          </h1>
          <p className="text-xs text-slate-500">
            Publish formatted class schedules to WhatsApp study groups or classmates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Schedule Scope
            </label>
            <select
              value={selectedCourseCode}
              onChange={(e) => setSelectedCourseCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
            >
              <option value="ALL">Complete Semester Timetable (All Courses)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} - {c.title.substring(0, 24)}...
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={handleWhatsApp}
              className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" /> Share Directly to WhatsApp
            </button>

            <button
              onClick={handleCopy}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-800">
            Tip: Pasting into WhatsApp will preserve bold headings and lecture hall tags automatically.
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Output Preview
            </span>
            <span className="text-xs text-slate-400">Ready to share</span>
          </div>

          <div className="p-4 rounded-xl bg-[#f8fafc] border border-slate-200 font-mono text-xs sm:text-sm whitespace-pre-wrap text-slate-800 max-h-96 overflow-y-auto leading-relaxed">
            {shareText}
          </div>
        </div>
      </div>
    </div>
  );
};
