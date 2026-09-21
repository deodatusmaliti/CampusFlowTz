import React, { useState } from 'react';
import { 
  X, 
  Send, 
  AlertTriangle, 
  Users, 
  Building, 
  Calendar, 
  FileText, 
  MapPin, 
  CheckCircle2, 
  Sparkles,
  ShieldAlert,
  Paperclip,
  File as FileIcon,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { Announcement, AnnouncementAttachment, Course, User } from '../types';

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  courses: Course[];
  onBroadcast: (announcement: Announcement) => void;
  onNotify: (msg: string) => void;
}

export const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  courses,
  onBroadcast,
  onNotify,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Announcement['priority']>('venue_change');
  const [targetType, setTargetType] = useState<'course' | 'year' | 'college' | 'university' | 'all'>('course');
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>(courses[0]?.code || 'BIO 203');
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [collegeName, setCollegeName] = useState<string>('College of Natural & Applied Sciences (CoNAS)');
  const [actionTab, setActionTab] = useState<string>('courses');
  const [attachments, setAttachments] = useState<AnnouncementAttachment[]>([]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let type: AnnouncementAttachment['type'] = 'other';
      if (['pdf'].includes(ext)) type = 'pdf';
      else if (['doc', 'docx'].includes(ext)) type = 'doc';
      else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) type = 'image';

      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      const reader = new FileReader();
      reader.onload = () => {
        const newAttachment: AnnouncementAttachment = {
          id: 'att_' + Date.now() + '_' + i,
          name: file.name,
          url: reader.result as string,
          type,
          size: formattedSize,
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    let targetLabel = '';
    if (targetType === 'course') {
      const matched = courses.find(c => c.code === selectedCourseCode);
      targetLabel = matched ? `${matched.code} (${matched.title})` : `Course ${selectedCourseCode}`;
    } else if (targetType === 'year') {
      targetLabel = `Year ${selectedYear} Students (All Programmes)`;
    } else if (targetType === 'college') {
      targetLabel = collegeName;
    } else if (targetType === 'university') {
      targetLabel = `All Students & Staff at ${currentUser.university}`;
    } else {
      targetLabel = 'Campus-Wide Broadcast';
    }

    const newAnnouncement: Announcement = {
      id: 'ann_' + Date.now(),
      title: title.trim(),
      content: content.trim(),
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorTitle: currentUser.leadershipTitle || (currentUser.role === 'lecturer' ? 'Course Instructor' : currentUser.role === 'admin' ? 'University Management' : 'Class Representative'),
      authorId: currentUser.id,
      university: currentUser.university || 'University of Dar es Salaam',
      targetAudience: {
        type: targetType,
        courseCode: targetType === 'course' ? selectedCourseCode : undefined,
        year: targetType === 'year' ? selectedYear : undefined,
        collegeOrFaculty: targetType === 'college' ? collegeName : undefined,
        label: targetLabel,
      },
      priority,
      timestamp: 'Just now',
      pinned: priority === 'urgent',
      acknowledged: false,
      acknowledgedCount: 0,
      actionTab: actionTab !== 'none' ? actionTab : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    onBroadcast(newAnnouncement);
    onNotify(`Announcement targeted to "${targetLabel}" broadcasted successfully!`);
    onClose();

    // Reset
    setTitle('');
    setContent('');
    setAttachments([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#e6ad3d] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Role-Based Targeted Dispatch
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#102d4f] mt-1">
              Broadcast Targeted Announcement
            </h2>
            <p className="text-xs text-slate-500">
              Send alerts to specific courses, student years, faculties, or the entire campus
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sender Identity Preview */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#102d4f] text-white flex items-center justify-center font-bold text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
              <p className="text-[11px] text-slate-500">
                {currentUser.leadershipTitle || `${currentUser.role.toUpperCase()} · ${currentUser.university}`}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Authorized
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Target Group Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#1e6fa8]" /> Target Recipient Group *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetType('course')}
                className={`p-2 rounded-xl text-xs font-bold text-left border transition-all ${
                  targetType === 'course'
                    ? 'bg-[#102d4f] text-white border-[#102d4f]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Specific Course
                <span className="block text-[10px] opacity-75 font-normal">e.g. Year 1 Biostatistics</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('year')}
                className={`p-2 rounded-xl text-xs font-bold text-left border transition-all ${
                  targetType === 'year'
                    ? 'bg-[#102d4f] text-white border-[#102d4f]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Academic Year
                <span className="block text-[10px] opacity-75 font-normal">e.g. 1st Year Students</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('college')}
                className={`p-2 rounded-xl text-xs font-bold text-left border transition-all ${
                  targetType === 'college'
                    ? 'bg-[#102d4f] text-white border-[#102d4f]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Faculty / School
                <span className="block text-[10px] opacity-75 font-normal">e.g. Health or Science</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('university')}
                className={`p-2 rounded-xl text-xs font-bold text-left border transition-all ${
                  targetType === 'university'
                    ? 'bg-[#102d4f] text-white border-[#102d4f]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All at University
                <span className="block text-[10px] opacity-75 font-normal">{currentUser.university}</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('all')}
                className={`p-2 rounded-xl text-xs font-bold text-left border transition-all ${
                  targetType === 'all'
                    ? 'bg-[#102d4f] text-white border-[#102d4f]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Campus Broadcast
                <span className="block text-[10px] opacity-75 font-normal">All registered users</span>
              </button>
            </div>
          </div>

          {/* Conditional Target Options */}
          {targetType === 'course' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Course Space</label>
              <select
                value={selectedCourseCode}
                onChange={(e) => setSelectedCourseCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#1e6fa8]"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.code}>
                    {c.code} — {c.title} (Year {c.year})
                  </option>
                ))}
                <option value="ENG 004">ENG 004 — Engineering Computing (All 1st Years)</option>
                <option value="LAW 101">LAW 101 — Constitutional Law & Rights</option>
              </select>
            </div>
          )}

          {targetType === 'year' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Academic Year Target</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(yr => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSelectedYear(yr)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      selectedYear === yr
                        ? 'bg-[#1e6fa8] text-white border-[#1e6fa8]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Year {yr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {targetType === 'college' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Faculty / College</label>
              <select
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#1e6fa8]"
              >
                <option value="College of Natural & Applied Sciences (CoNAS)">College of Natural & Applied Sciences (CoNAS)</option>
                <option value="School of Medicine & Allied Health Sciences">School of Medicine & Allied Health Sciences</option>
                <option value="College of Engineering and Technology (CoET)">College of Engineering and Technology (CoET)</option>
                <option value="College of Humanities & Social Sciences">College of Humanities & Social Sciences</option>
                <option value="School of Law & Public Administration">School of Law & Public Administration</option>
              </select>
            </div>
          )}

          {/* Priority Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority & Category *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPriority('venue_change')}
                className={`p-2 rounded-xl text-xs font-bold border text-left transition-all ${
                  priority === 'venue_change'
                    ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                📍 Venue Change
              </button>

              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`p-2 rounded-xl text-xs font-bold border text-left transition-all ${
                  priority === 'urgent'
                    ? 'bg-red-100 text-red-900 border-red-400 ring-2 ring-red-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                🚨 Urgent Alert
              </button>

              <button
                type="button"
                onClick={() => setPriority('assessment')}
                className={`p-2 rounded-xl text-xs font-bold border text-left transition-all ${
                  priority === 'assessment'
                    ? 'bg-purple-100 text-purple-900 border-purple-400 ring-2 ring-purple-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                📝 CAT / Exam
              </button>

              <button
                type="button"
                onClick={() => setPriority('general')}
                className={`p-2 rounded-xl text-xs font-bold border text-left transition-all ${
                  priority === 'general'
                    ? 'bg-sky-100 text-sky-900 border-sky-400 ring-2 ring-sky-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                ℹ️ General Info
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Headline / Subject *</label>
            <input
              type="text"
              required
              placeholder="e.g. 🚨 BIO 203 Biostatistics Lecture moved to Science Lab 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#1e6fa8]"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Message Content *</label>
            <textarea
              required
              rows={3}
              placeholder="Explain schedule adjustments, lab requirements, or important instructions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#1e6fa8]"
            />
          </div>

          {/* Document & Picture Attachments */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Official Attachments (Word, PDF, Pictures)</label>
              <span className="text-[10px] text-slate-500">Optional</span>
            </div>
            
            <label className="border border-dashed border-slate-300 hover:border-[#1e6fa8] rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-white transition-colors">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Paperclip className="w-4 h-4 text-[#1e6fa8]" />
              <span className="text-xs font-semibold text-slate-700">Attach syllabus, timetable PDF, or notice photo</span>
            </label>

            {attachments.length > 0 && (
              <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto">
                {attachments.map(att => (
                  <div key={att.id} className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded-lg text-xs">
                    <div className="flex items-center gap-2 truncate">
                      {att.type === 'pdf' ? (
                        <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      ) : att.type === 'image' ? (
                        <ImageIcon className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      ) : (
                        <FileIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      )}
                      <span className="font-medium text-slate-800 truncate">{att.name}</span>
                      <span className="text-[10px] text-slate-400">({att.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fast Navigation Shortcut */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Direct In-App Action Shortcut</label>
            <select
              value={actionTab}
              onChange={(e) => setActionTab(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#1e6fa8]"
            >
              <option value="courses">Link to Course Space & Communities</option>
              <option value="calendar">Link to Academic Calendar & Timetable</option>
              <option value="tasks">Link to Assessment & Tasks</option>
              <option value="study">Link to Study Resources & Innovation Feed</option>
              <option value="payments">Link to GePG Payments</option>
              <option value="none">No shortcut button</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#102d4f] hover:bg-[#1a406c] text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <Send className="w-4 h-4 text-[#e6ad3d]" /> Dispatch Alert Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
