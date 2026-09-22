import React from 'react';
import { 
  Bell, 
  MapPin, 
  Clock, 
  Volume2, 
  VolumeX, 
  X, 
  Share2, 
  MessageSquare, 
  Sparkles,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { ImminentLectureAlert } from '../types';
import { soundAlerts } from '../services/soundAlertService';

interface ImminentLectureModalProps {
  isOpen: boolean;
  alert: ImminentLectureAlert | null;
  onClose: () => void;
  onOpenCourseChat: (courseCode: string) => void;
  onNotify: (msg: string) => void;
}

export const ImminentLectureModal: React.FC<ImminentLectureModalProps> = ({
  isOpen,
  alert,
  onClose,
  onOpenCourseChat,
  onNotify,
}) => {
  if (!isOpen || !alert) return null;

  const handleReplayChime = () => {
    soundAlerts.playLectureChime();
    onNotify('Playing lecture alert chime');
  };

  const handleShareWhatsApp = () => {
    const text = `🚨 *CAMPUS LECTURE ALERT: ${alert.courseCode}*\n\n` +
      `📚 *Course:* ${alert.courseName}\n` +
      `⏰ *Starts:* ${alert.startTime} (in ${alert.minutesRemaining} minutes)\n` +
      `📍 *Venue:* ${alert.hall}${alert.building ? ` (${alert.building})` : ''}\n` +
      `👨‍🏫 *Lecturer:* ${alert.lecturer}\n\n` +
      `Please be seated early and prepare lecture materials!`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onNotify('Opening WhatsApp with imminent lecture notice.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-2 border-amber-400 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Banner with pulsating alert */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-amber-100">
                IMMINENT LECTURE ALERT ({alert.intervalLabel.toUpperCase()})
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {alert.courseCode}
            </h2>
            <div className="bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-amber-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>In ~{alert.minutesRemaining} mins ({alert.startTime})</span>
            </div>
          </div>

          <p className="text-xs font-semibold text-amber-100 mt-0.5 line-clamp-1">
            {alert.courseName}
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-slate-800">
          {/* Key Details Card */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                  Lecture Venue / Hall
                </span>
                <span className="text-base font-black text-slate-900">
                  {alert.hall}
                </span>
                {alert.building && (
                  <span className="text-xs text-slate-600 block font-medium">
                    {alert.building}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs text-slate-700">
              <div className="flex items-center gap-1.5 font-medium">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span>Instructor: <b>{alert.lecturer}</b></span>
              </div>
              <button
                onClick={handleReplayChime}
                className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 text-[11px]"
                title="Replay alert chime"
              >
                <Volume2 className="w-3.5 h-3.5" /> Sound Chime
              </button>
            </div>
          </div>

          {/* Quick Notice */}
          <p className="text-xs text-slate-600 leading-relaxed">
            Please proceed to {alert.hall} promptly to secure seating, verify attendance registration, and prepare necessary lecture notes.
          </p>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenCourseChat(alert.courseCode);
                }}
                className="py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-sky-700" />
                <span>Course Chat</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Alert on WhatsApp</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              Acknowledge & Dismiss
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
