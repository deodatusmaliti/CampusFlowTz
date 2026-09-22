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
  Share2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Course, Community, CommunityMessage, User } from '../types';

interface CourseSpaceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  community?: Community;
  currentUser: User;
  courses?: Course[];
  onSendMessage: (courseCode: string, content: string, isAlert?: boolean, alertType?: 'venue' | 'exam' | 'material' | 'general') => void;
  onAddEventFromAlert: (title: string, location: string, time: string) => void;
  onEnrollInCourse?: (course: Course) => void;
  onNotify: (msg: string) => void;
}

export const CourseSpaceChatModal: React.FC<CourseSpaceChatModalProps> = ({
  isOpen,
  onClose,
  course,
  community,
  currentUser,
  courses = [],
  onSendMessage,
  onAddEventFromAlert,
  onEnrollInCourse,
  onNotify,
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [isAlertMode, setIsAlertMode] = useState(false);
  const [alertType, setAlertType] = useState<'venue' | 'exam' | 'material' | 'general'>('venue');

  if (!isOpen) return null;

  // Course Subscribers check: only registered/enrolled students or instructors can access
  const isEnrolledSubscriber = 
    currentUser.role === 'system_admin' ||
    currentUser.role === 'college_admin' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'lecturer' ||
    courses.some(c => c.code.trim().toLowerCase() === course.code.trim().toLowerCase());

  const handleEnrollNow = () => {
    if (onEnrollInCourse) {
      onEnrollInCourse(course);
      onNotify(`Subscribed to ${course.code}! Course chat unlocked.`);
    }
  };

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
    if (!isEnrolledSubscriber) {
      onNotify('Access restricted: You must be an enrolled course subscriber to send messages.');
      return;
    }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full h-[88vh] max-h-[750px] shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-sky-950 to-sky-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-sm border border-white/20">
              {course.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">{course.title}</h2>
                <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                  isEnrolledSubscriber ? 'bg-emerald-400 text-slate-950' : 'bg-amber-400 text-slate-950'
                }`}>
                  {isEnrolledSubscriber ? 'Enrolled Space' : 'Subscribers Only'}
                </span>
              </div>
              <p className="text-xs text-slate-200 flex items-center gap-3 mt-0.5 font-medium">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-amber-300" /> {community?.memberCount || 48} Course Mates
                </span>
                <span>•</span>
                <span>{course.lecturer}</span>
                <span>•</span>
                <span>{course.hall}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {isEnrolledSubscriber ? (
          <>
            {/* Quick Instant Alert Triggers for Course Mates */}
            <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold">
              <span className="text-slate-500 uppercase tracking-wider text-[10px] pl-1 shrink-0">Quick Alerts:</span>
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
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      msg.isAlert
                        ? 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-200'
                        : isMe
                        ? 'bg-sky-50 border-sky-200 ml-4 sm:ml-8'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{msg.authorName}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          msg.authorRole === 'Lecturer'
                            ? 'bg-purple-100 text-purple-900'
                            : msg.authorRole === 'Class Rep'
                            ? 'bg-sky-100 text-sky-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {msg.authorRole}
                        </span>
                        {msg.isAlert && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-white flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> URGENT ALERT
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
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
                        <span className="text-[10px] text-amber-900 font-bold">Course mate schedule alert</span>
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
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-600 text-slate-900"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4 text-amber-300" /> Send
                </button>
              </div>
            </form>
          </>
        ) : (
          // Access Lock for Non-Enrolled Students
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-50">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs border border-amber-200">
              <Lock className="w-8 h-8 text-amber-700" />
            </div>

            <div className="max-w-md space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                Restricted Channel
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Course Subscribers Only
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                This discussion channel is strictly reserved for students and instructors registered in <b>{course.code}: {course.title}</b>.
                Non-enrolled students are restricted to maintain class privacy and academic integrity.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleEnrollNow}
                className="px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs sm:text-sm font-bold shadow-xs flex items-center gap-2 transition-all active:scale-95"
              >
                <span>Enroll in {course.code} to Unlock</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold border border-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
