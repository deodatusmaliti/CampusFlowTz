import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Users, 
  Send, 
  Share2, 
  Pin, 
  ThumbsUp, 
  Plus, 
  ExternalLink,
  Sparkles,
  BookOpen,
  Lock,
  CheckCircle2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Community, User as UserType, Course } from '../types';

interface CommunitiesViewProps {
  communities: Community[];
  currentUser: UserType;
  courses?: Course[];
  onSendMessage: (communityId: string, content: string) => void;
  onCreateCommunity: (title: string, code: string) => void;
  onEnrollInCourse?: (course: Course) => void;
  onNotify: (msg: string) => void;
}

export const CommunitiesView: React.FC<CommunitiesViewProps> = ({
  communities,
  currentUser,
  courses = [],
  onSendMessage,
  onCreateCommunity,
  onEnrollInCourse,
  onNotify,
}) => {
  const [filterMode, setFilterMode] = useState<'my' | 'all'>('my');
  const [mobileActiveView, setMobileActiveView] = useState<'list' | 'chat'>('chat');
  const [activeCommId, setActiveCommId] = useState<string>(communities[0]?.id || '');
  const [messageInput, setMessageInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');

  // Check if current user is an enrolled subscriber of a course community
  const isUserSubscribed = (comm: Community): boolean => {
    // Campus-wide general hub is open to all university students
    if (comm.courseCode === 'CAMPUS' || comm.courseCode === 'GENERAL' || comm.courseCode === 'HUB') {
      return true;
    }
    // Admins and instructors have oversight
    if (
      currentUser.role === 'system_admin' || 
      currentUser.role === 'college_admin' || 
      currentUser.role === 'admin' || 
      currentUser.role === 'lecturer'
    ) {
      return true;
    }
    // Check if course is in user's subscribed/enrolled courses
    return courses.some(
      (c) => c.code.trim().toLowerCase() === comm.courseCode.trim().toLowerCase()
    );
  };

  const filteredCommunities = useMemo(() => {
    if (filterMode === 'my') {
      const myComms = communities.filter((c) => isUserSubscribed(c));
      return myComms.length > 0 ? myComms : communities;
    }
    return communities;
  }, [communities, filterMode, courses, currentUser.role]);

  const activeCommunity = communities.find((c) => c.id === activeCommId) || filteredCommunities[0] || communities[0];
  const activeIsSubscribed = activeCommunity ? isUserSubscribed(activeCommunity) : false;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeCommunity) return;
    if (!activeIsSubscribed) {
      onNotify('Access denied: You must be an enrolled course subscriber to send messages.');
      return;
    }
    onSendMessage(activeCommunity.id, messageInput.trim());
    setMessageInput('');
  };

  const handleQuickEnroll = () => {
    if (!activeCommunity) return;
    const newCourse: Course = {
      id: 'crs_sub_' + Date.now(),
      code: activeCommunity.courseCode,
      title: activeCommunity.courseTitle,
      credits: 3,
      year: currentUser.currentYear || 2,
      semester: 'Semester 1',
      lecturer: 'Course Instructor',
      hall: 'Lecture Hall 01',
      schedule: 'Mon, Wed 10:00 - 12:00',
      currentScore: 0,
      attendance: 100,
      notes: 'Subscribed course unit space.',
      category: 'Core',
    };
    if (onEnrollInCourse) {
      onEnrollInCourse(newCourse);
    }
    onNotify(`Subscribed to ${activeCommunity.courseCode}! Course chat unlocked.`);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateCommunity(newTitle.trim(), newCode.trim().toUpperCase() || 'HUB');
    setShowCreateModal(false);
    setNewTitle('');
    setNewCode('');
    onNotify('New course community created.');
  };

  const shareWhatsApp = (community: Community) => {
    const text = `Join our ${community.courseTitle} (${community.courseCode}) campus study hub on CampusFlow TZ: coordination, past papers & lecture announcements.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onNotify('WhatsApp invite link generated.');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 uppercase tracking-wider">
              Enrolled Course Subscriber Hubs
            </span>
            <span className="text-xs text-slate-600 font-semibold">
              Restricted Student Access
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Course Spaces & Class Discussions
          </h1>
          <p className="text-xs text-slate-600">
            Private, course-subscribed channels for lecture notices, exam revisions, and peer study groups.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Create Study Hub
        </button>
      </div>

      {/* Filter Tabs: My Enrolled vs All Courses */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterMode('my')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterMode === 'my'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          My Subscribed Courses ({communities.filter(c => isUserSubscribed(c)).length})
        </button>
        <button
          onClick={() => setFilterMode('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterMode === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Campus Hubs ({communities.length})
        </button>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setMobileActiveView('chat')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mobileActiveView === 'chat'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600'
          }`}
        >
          Discussion ({activeCommunity?.courseCode || 'Chat'})
        </button>
        <button
          onClick={() => setMobileActiveView('list')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mobileActiveView === 'list'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600'
          }`}
        >
          Browse Hubs ({filteredCommunities.length})
        </button>
      </div>

      {/* Main Grid: Left Channel List, Right Active Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Community Hubs List */}
        <div className={`space-y-2.5 ${mobileActiveView === 'list' ? 'block' : 'hidden lg:block'}`}>
          {filteredCommunities.map((comm) => {
            const isActive = comm.id === activeCommunity?.id;
            const subscribed = isUserSubscribed(comm);

            return (
              <div
                key={comm.id}
                onClick={() => {
                  setActiveCommId(comm.id);
                  setMobileActiveView('chat');
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white border-sky-600 ring-2 ring-sky-100 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 font-black text-xs">
                      {comm.courseCode}
                    </span>
                    {subscribed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Subscribed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        <Lock className="w-2.5 h-2.5 text-amber-600" /> Subscribers Only
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Users className="w-3.5 h-3.5" />
                    <span>{comm.memberCount}</span>
                  </div>
                </div>

                <h3 className="text-sm font-black text-slate-900 mt-2 line-clamp-1">
                  {comm.courseTitle}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-1 font-normal">
                  {subscribed ? comm.lastMessage : '🔒 Discussion locked for enrolled course subscribers.'}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px] font-medium">
                    {comm.messages.length} messages
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      shareWhatsApp(comm);
                    }}
                    className="text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 text-[11px]"
                    title="Share invite to WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-600" /> Invite
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Active Discussion Thread or Access Lock Notice */}
        <div className={`lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[520px] sm:h-[580px] ${mobileActiveView === 'chat' ? 'flex' : 'hidden lg:flex'}`}>
          {activeCommunity ? (
            activeIsSubscribed ? (
              // Enrolled Subscribers Full Chat
              <>
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-[#fbfdff]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-slate-900">{activeCommunity.courseTitle}</h2>
                      <span className="text-xs font-bold text-sky-800">({activeCommunity.courseCode})</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Enrolled space: {activeCommunity.memberCount} students & verified lecturers
                    </p>
                  </div>

                  <button
                    onClick={() => shareWhatsApp(activeCommunity)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-200"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-700" /> Share WhatsApp Group
                  </button>
                </div>

                {/* Messages list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {activeCommunity.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        msg.isPinned
                          ? 'bg-amber-50/80 border-amber-300'
                          : 'bg-[#fbfdff] border-slate-200'
                      }`}
                    >
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
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          {msg.isPinned && (
                            <span className="flex items-center gap-1 text-amber-800 font-bold">
                              <Pin className="w-3 h-3" /> Pinned Notice
                            </span>
                          )}
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 mt-2 leading-relaxed">
                        {msg.content}
                      </p>

                      <div className="mt-2.5 flex items-center gap-1 text-xs text-slate-600">
                        <ThumbsUp className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-semibold text-[11px]">{msg.likes} endorsements</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Composer */}
                <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-[#fbfdff]">
                  <input
                    type="text"
                    placeholder={`Post question or update to ${activeCommunity.courseCode} subscribers...`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-600 text-slate-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" /> Send
                  </button>
                </form>
              </>
            ) : (
              // Access Control Screen for Non-Subscribers
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs border border-amber-200">
                  <Lock className="w-8 h-8 text-amber-700" />
                </div>

                <div className="max-w-md space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Restricted Course Channel
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    Course Subscribers Only
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Access to <b>{activeCommunity.courseCode} ({activeCommunity.courseTitle})</b> is reserved exclusively for enrolled students and instructors.
                    Unsubscribed students cannot view lecture notices, shared files, or post in this space.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleQuickEnroll}
                    className="px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs sm:text-sm font-bold shadow-xs flex items-center gap-2 transition-all active:scale-95"
                  >
                    <span>Enroll & Join {activeCommunity.courseCode} Space</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => shareWhatsApp(activeCommunity)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> Share WhatsApp Invite
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Select a course channel to participate.
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Create New Course Study Hub</h2>
            <p className="text-xs text-slate-500 mt-0.5">Form a dedicated peer collaboration space</p>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hub Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Constitutional Law Study Squad"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Code</label>
                <input
                  type="text"
                  placeholder="e.g. LAW 101"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600 text-slate-900"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-xs"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
