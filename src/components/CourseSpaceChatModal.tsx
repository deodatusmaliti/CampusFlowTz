import React, { useState } from 'react';
import { 
  X, 
  Send, 
  AlertTriangle, 
  Pin, 
  ThumbsUp, 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  Sparkles,
  CheckCircle2,
  BookOpen,
  Share2
} from 'lucide-react';
import { Course, Community, CommunityMessage, User } from '../types';

interface CourseSpaceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  community?: Community;
  currentUser: User;
  onSendMessage: (courseCode: string, content: string, isAlert?: boolean, alertType?: 'venue' | 'exam' | 'material' | 'general') => void;
  onAddEventFromAlert: (title: string, location: string, time: string) => void;
  onNotify: (msg: string) => void;
}

export const CourseSpaceChatModal: React.FC<CourseSpaceChatModalProps> = ({
  isOpen,
  onClose,
  course,
  community,
  currentUser,
  onSendMessage,
  onAddEventFromAlert,
  onNotify,
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [isAlertMode, setIsAlertMode] = useState(false);
  const [alertType, setAlertType] = useState<'venue' | 'exam' | 'material' | 'general'>('venue');

  if (!isOpen) return null;

  const messages: CommunityMessage[] = community?.messages || [
    {
      id: 'default_1',
      authorName: course.lecturer,
      authorRole: 'Lecturer',
      content: `Welcome to the official ${course.code} Course Space. Class notices, syllabus updates, and lecture room changes will be posted here.`,
      timestamp: 'Yesterday',
      likes: 12,
      isPinned: true,
      isAlert: false,
    },
    {
      id: 'default_2',
      authorName: 'Amina Baraka',
      authorRole: 'Class Rep',
      content: '🚨 Notice: Dr. Mushi confirmed Lab 4 dissection practical starts promptly at 10:00 AM on Thursday. Bring lab coats!',
      timestamp: '08:45 AM',
      likes: 19,
      isPinned: true,
      isAlert: true,
      alertType: 'venue',
    }
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    onSendMessage(course.code, messageInput.trim(), isAlertMode, isAlertMode ? alertType : undefined);
    onNotify(isAlertMode ? `Broadcasted urgent alert to ${course.code} course mates!` : `Message sent in ${course.code} space.`);
    setMessageInput('');
    setIsAlertMode(false);
  };

  const handleQuickAlert = (type: 'venue' | 'exam' | 'material' | 'group') => {
    if (type === 'venue') {
      setMessageInput(`🚨 VENUE CHANGE ALERT: ${course.code} lecture relocated to [Enter New Hall/Room] today at [Enter Time].`);
      setIsAlertMode(true);
      setAlertType('venue');
    } else if (type === 'exam') {
      setMessageInput(`⏰ EXAM/CAT ALERT: ${course.code} continuous assessment test scheduled for [Enter Date] in Hall [Enter Room].`);
      setIsAlertMode(true);
      setAlertType('exam');
    } else if (type === 'material') {
      setMessageInput(`📚 STUDY NOTES ALERT: Uploaded practical handout & past revision questions for ${course.code}.`);
      setIsAlertMode(true);
      setAlertType('material');
    } else {
      setMessageInput(`👥 STUDY GROUP ALERT: Group discussion meeting at Library 2nd floor at 16:00 today. Everyone welcome!`);
      setIsAlertMode(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full h-[88vh] max-h-[750px] shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-[#102d4f] via-[#163e6c] to-[#1e6fa8] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-sm border border-white/20">
              {course.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">{course.title}</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-[#102d4f] font-black text-[10px]">
                  Enrolled Space
                </span>
              </div>
              <p className="text-xs text-slate-200 flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#e6ad3d]" /> {community?.memberCount || 48} Course Mates
                </span>
                <span>·</span>
                <span>{course.lecturer}</span>
                <span>·</span>
                <span>{course.hall}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Instant Alert Triggers for Course Mates */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold">
          <span className="text-slate-400 uppercase tracking-wider text-[10px] pl-1 shrink-0">Quick Alerts:</span>
          <button
            type="button"
            onClick={() => handleQuickAlert('venue')}
            className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 shrink-0 flex items-center gap-1"
          >
            📍 Venue Changed
          </button>
          <button
            type="button"
            onClick={() => handleQuickAlert('exam')}
            className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 hover:bg-purple-200 shrink-0 flex items-center gap-1"
          >
            ⏰ CAT / Exam Notice
          </button>
          <button
            type="button"
            onClick={() => handleQuickAlert('material')}
            className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 hover:bg-sky-200 shrink-0 flex items-center gap-1"
          >
            📚 Shared Material
          </button>
          <button
            type="button"
            onClick={() => handleQuickAlert('group')}
            className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 hover:bg-emerald-200 shrink-0 flex items-center gap-1"
          >
            👥 Study Group
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]">
          {messages.map((msg) => {
            const isMe = msg.authorName.toLowerCase() === currentUser.name.toLowerCase();
            return (
              <div
                key={msg.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  msg.isAlert 
                    ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-100' 
                    : isMe 
                    ? 'bg-white border-[#1e6fa8]/30 shadow-xs ml-6' 
                    : 'bg-white border-slate-200 mr-6 shadow-xs'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-[#102d4f]">{msg.authorName}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      msg.authorRole.toLowerCase().includes('lecturer') || msg.authorRole.toLowerCase().includes('dean')
                        ? 'bg-[#102d4f] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {msg.authorRole}
                    </span>
                    {msg.isPinned && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-600 font-bold">
                        <Pin className="w-2.5 h-2.5" /> Pinned
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {msg.timestamp}
                  </span>
                </div>

                {/* Message Content */}
                <p className="text-xs sm:text-sm text-slate-800 mt-2 leading-relaxed">
                  {msg.content}
                </p>

                {/* If venue change alert, offer 1-click sync to timetable */}
                {msg.isAlert && msg.content.toLowerCase().includes('venue') && (
                  <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-amber-800 font-semibold">Course mate schedule alert</span>
                    <button
                      onClick={() => onAddEventFromAlert(
                        `${course.code} Relocated Lecture`, 
                        course.hall, 
                        '14:00'
                      )}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs"
                    >
                      <Calendar className="w-3 h-3" /> Add to My Timetable
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Compose Input */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isAlertMode}
                onChange={(e) => setIsAlertMode(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="flex items-center gap-1 font-bold text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5" /> Mark as Urgent Course Alert (Notify All Mates)
              </span>
            </label>

            {isAlertMode && (
              <div className="flex items-center gap-1">
                {(['venue', 'exam', 'material'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAlertType(t)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-all ${
                      alertType === t ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              required
              placeholder={`Post alert or message to ${course.code} classmates...`}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#102d4f] hover:bg-[#1a406c] text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4 text-[#e6ad3d]" /> Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
