import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  UserCheck, 
  Mail, 
  MessageSquare, 
  Phone, 
  ShieldAlert, 
  Sparkles, 
  Plus, 
  Award, 
  BookOpen, 
  GraduationCap, 
  Check, 
  X, 
  Lock, 
  Eye, 
  EyeOff,
  AlertCircle,
  Share2,
  Calendar,
  Layers,
  Info,
  Copy,
  Printer
} from 'lucide-react';
import { 
  StudentNetworkProfile, 
  User, 
  Course, 
  StudyGroup, 
  DirectConversation 
} from '../types';
import { StorageService } from '../services/storageService';
import { EndorsementButton } from './EndorsementButton';
import { StudentChatModal } from './StudentChatModal';

interface StudentNetworkViewProps {
  currentUser: User;
  courses: Course[];
  onNotify: (msg: string) => void;
}

export const StudentNetworkView: React.FC<StudentNetworkViewProps> = ({
  currentUser,
  courses,
  onNotify,
}) => {
  const [profiles, setProfiles] = useState<StudentNetworkProfile[]>(() => StorageService.getStudentProfiles());
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(() => StorageService.getStudyGroups());
  const [directChats, setDirectChats] = useState<DirectConversation[]>(() => StorageService.getDirectConversations());

  const [searchQuery, setSearchQuery] = useState('');
  const [programmeFilter, setProgrammeFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState<number | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'students' | 'groups'>('groups');

  // Active chat modal state
  const [activeGroupChat, setActiveGroupChat] = useState<StudyGroup | null>(null);
  const [activeDirectChat, setActiveDirectChat] = useState<DirectConversation | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Create Group Modal
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupCourse, setGroupCourse] = useState(courses[0]?.code || 'ZOO 201');
  const [groupMaxMembers, setGroupMaxMembers] = useState(8);
  const [groupMeetingType, setGroupMeetingType] = useState('Hybrid (Campus Library & Google Meet)');
  const [groupDesc, setGroupDesc] = useState('');

  // Filtered student peers
  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      if (p.connectionStatus === 'blocked') return false;
      if (programmeFilter !== 'ALL' && p.programme !== programmeFilter) return false;
      const studYear = p.yearOfStudy ?? p.currentYear;
      if (yearFilter !== 'ALL' && studYear !== yearFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchProg = p.programme.toLowerCase().includes(q);
        const matchInterests = p.interests?.some(i => i.toLowerCase().includes(q));
        const matchSkills = p.skills?.some(s => s.toLowerCase().includes(q));
        return matchName || matchProg || matchInterests || matchSkills;
      }
      return true;
    });
  }, [profiles, programmeFilter, yearFilter, searchQuery]);

  // Filtered study groups
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return studyGroups;
    const q = searchQuery.toLowerCase();
    return studyGroups.filter(g => 
      g.name.toLowerCase().includes(q) ||
      g.courseCode.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q)
    );
  }, [studyGroups, searchQuery]);

  // Unique programmes for filter dropdown
  const programmesList = useMemo(() => {
    const set = new Set(profiles.map(p => p.programme));
    return Array.from(set);
  }, [profiles]);

  // Open Direct Chat with Student
  const handleOpenDirectChat = (profile: StudentNetworkProfile) => {
    // Check if conversation already exists in storage
    let conv = directChats.find(c => c.participantId === profile.id);
    if (!conv) {
      conv = {
        id: 'conv_' + profile.id,
        participantId: profile.id,
        participantName: profile.name,
        participantRole: profile.leadershipTitle || 'Student',
        participantAvatar: profile.avatar,
        participantProgramme: profile.programme,
        lastMessageTimestamp: 'Just now',
        unreadCount: 0,
        messages: [
          {
            id: 'msg_welcome_' + Date.now(),
            authorId: profile.id,
            authorName: profile.name,
            authorRole: profile.leadershipTitle || 'Student',
            authorAvatar: profile.avatar,
            content: `Habari ${currentUser.name}! Glad to connect with you on CampusFlow TZ. Are you taking ${profile.programme} modules this term?`,
            timestamp: '10:00 AM',
            likes: 0
          }
        ]
      };
      const updatedList = StorageService.saveDirectConversation(conv);
      setDirectChats(updatedList);
    }

    setActiveDirectChat(conv);
    setActiveGroupChat(null);
    setIsChatModalOpen(true);
  };

  // Open Group Chat
  const handleOpenGroupChat = (group: StudyGroup) => {
    setActiveGroupChat(group);
    setActiveDirectChat(null);
    setIsChatModalOpen(true);
  };

  // Update Group after chat interaction
  const handleUpdateGroup = (updated: StudyGroup) => {
    const list = StorageService.saveStudyGroup(updated);
    setStudyGroups(list);
    setActiveGroupChat(updated);
  };

  // Update Direct Conversation after chat interaction
  const handleUpdateDirectChat = (updated: DirectConversation) => {
    const list = StorageService.saveDirectConversation(updated);
    setDirectChats(list);
    setActiveDirectChat(updated);
  };

  // Join or Leave Group
  const handleToggleJoinGroup = (groupId: string) => {
    const group = studyGroups.find(g => g.id === groupId);
    if (!group) return;

    const willJoin = !group.isJoined;
    let nextMembers = [...group.members];

    if (willJoin) {
      nextMembers.push({
        userId: currentUser.id,
        name: currentUser.name,
        role: 'member',
        programme: currentUser.programme,
        isOnline: true
      });
    } else {
      nextMembers = nextMembers.filter(m => m.userId !== currentUser.id);
    }

    const updatedGroup: StudyGroup = {
      ...group,
      isJoined: willJoin,
      currentMembers: nextMembers.length,
      members: nextMembers
    };

    const list = StorageService.saveStudyGroup(updatedGroup);
    setStudyGroups(list);
    onNotify(willJoin ? `Joined "${group.name}"! Group chat is unlocked.` : `Left "${group.name}".`);
  };

  // Create Group
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      onNotify('Please enter a pod name.');
      return;
    }

    const newGroup: StudyGroup = {
      id: 'sg_' + Date.now(),
      name: groupName.trim(),
      courseCode: groupCourse,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      maxMembers: Number(groupMaxMembers),
      currentMembers: 1,
      meetingType: groupMeetingType,
      description: groupDesc.trim() || 'Weekly peer study session and revision.',
      isJoined: true,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      members: [
        {
          userId: currentUser.id,
          name: currentUser.name,
          role: 'leader',
          programme: currentUser.programme,
          isOnline: true
        }
      ],
      messages: [
        {
          id: 'msg_init_' + Date.now(),
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorRole: 'Pod Creator',
          content: `Welcome to the ${groupName.trim()} study pod! We focus on ${groupCourse} problem sets and lab preparations.`,
          timestamp: 'Just now',
          likes: 0
        }
      ]
    };

    const list = StorageService.saveStudyGroup(newGroup);
    setStudyGroups(list);
    setIsGroupModalOpen(false);
    setGroupName('');
    setGroupDesc('');
    onNotify(`Created and joined study pod "${newGroup.name}"!`);
  };

  // Toggle connection status with student peer
  const handleToggleConnection = (studentId: string) => {
    const updated = profiles.map(p => {
      if (p.id === studentId) {
        const nextStatus: StudentNetworkProfile['connectionStatus'] = 
          p.connectionStatus === 'connected' ? 'none' : 'connected';
        return { ...p, connectionStatus: nextStatus };
      }
      return p;
    });

    setProfiles(updated);
    StorageService.saveStudentProfiles(updated);
    const target = updated.find(p => p.id === studentId);
    onNotify(target?.connectionStatus === 'connected' 
      ? `Connected with ${target.name}!` 
      : `Disconnected from ${target?.name}.`
    );
  };

  // WhatsApp Group Share
  const handleShareGroupWhatsApp = (group: StudyGroup) => {
    const text = `🎓 *Join our CampusFlow TZ Study Pod!*\n*${group.name}* (${group.courseCode})\nMeeting: ${group.meetingType}\nMembers: ${group.currentMembers}/${group.maxMembers}\n\nJoin on CampusFlow: ${window.location.origin}/#/network`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    onNotify(`Sharing invite for "${group.name}" via WhatsApp...`);
  };

  // Copy Group Link
  const handleCopyGroupLink = (group: StudyGroup) => {
    const link = `${window.location.origin}/#/network?pod=${group.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    onNotify(`Invitation link for "${group.name}" copied to clipboard!`);
  };

  // Share Group via Email
  const handleShareGroupEmail = (group: StudyGroup) => {
    const subject = `Study Pod Invitation: ${group.name} (${group.courseCode})`;
    const body = `Hello,\n\nYou are invited to join our academic study pod on CampusFlow TZ:\n\nPod: ${group.name}\nCourse: ${group.courseCode}\nFormat: ${group.meetingType}\nMembers: ${group.currentMembers}/${group.maxMembers}\n\nDescription:\n${group.description}\n\nJoin link: ${window.location.origin}/#/network?pod=${group.id}\n`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    onNotify(`Opening email client to share "${group.name}"...`);
  };

  // Print Group Schedule
  const handlePrintGroupSchedule = (group: StudyGroup) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Study Pod: ${group.name}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
              .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; background: #e0f2fe; color: #0369a1; text-transform: uppercase; }
              h1 { font-size: 24px; font-weight: 900; margin: 10px 0 6px 0; }
              .meta { font-size: 13px; color: #64748b; margin-bottom: 20px; }
              .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
              th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
              th { background: #f1f5f9; }
              .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; }
            </style>
          </head>
          <body>
            <span class="badge">${group.courseCode}</span>
            <h1>${group.name}</h1>
            <div class="meta">Created by ${group.creatorName} • Format: ${group.meetingType}</div>
            <div class="box">
              <strong>Pod Objective:</strong>
              <p>${group.description}</p>
            </div>
            <h3>Enrolled Pod Members (${group.members.length} / ${group.maxMembers}):</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Member Name</th>
                  <th>Role</th>
                  <th>Programme</th>
                </tr>
              </thead>
              <tbody>
                ${group.members.map((m, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${m.name}</strong></td>
                    <td>${m.role}</td>
                    <td>${m.programme || 'Undergraduate'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer">Printed from CampusFlow TZ Academic Study Network • ${new Date().toLocaleDateString()}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      onNotify(`Print layout opened for "${group.name}".`);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
              Student Network & Study Groups
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              Local Demo Mode
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-600" /> Student Network & Peer Study Pods
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Connect with classmates, join WhatsApp-style course pods, exchange notes, and form study groups
          </p>
        </div>

        <button
          onClick={() => setIsGroupModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Study Pod</span>
        </button>
      </div>

      {/* Local Demo Mode Explanatory Card */}
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Info className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>Local Demo Mode:</strong> Chat messages, pod creations, and peer replies are stored securely in your browser's persistent storage. Full multi-device real-time sync activates once your campus WebSocket backend is paired.
          </span>
        </div>
      </div>

      {/* Tabs Switcher: Study Groups vs Student Peers */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'groups'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Course Study Pods ({studyGroups.length})</span>
          {studyGroups.some(g => (g.unreadCount || 0) > 0) && (
            <span className="w-2 h-2 rounded-full bg-sky-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'students'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Classmates & Peer Network ({profiles.length})</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'groups' ? 'Search study pods by course code, name or topics...' : 'Search classmates by name, programme, skills or interests...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {activeTab === 'students' && (
          <div className="flex gap-2">
            <select
              value={programmeFilter}
              onChange={(e) => setProgrammeFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            >
              <option value="ALL">All Programmes</option>
              {programmesList.map(prog => (
                <option key={prog} value={prog}>{prog}</option>
              ))}
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            >
              <option value="ALL">All Years</option>
              <option value={1}>Year 1</option>
              <option value={2}>Year 2</option>
              <option value={3}>Year 3</option>
              <option value={4}>Year 4</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: STUDY GROUPS */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-sky-300 transition-all shadow-2xs hover:shadow-md p-5 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 text-xs font-black uppercase tracking-wider">
                      {group.courseCode}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {group.currentMembers}/{group.maxMembers} Members
                      </span>
                      {group.unreadCount && group.unreadCount > 0 ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-sky-600 text-white text-[10px] font-bold">
                          {group.unreadCount} unread
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                      {group.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {group.description}
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                    <div>Format: <strong>{group.meetingType}</strong></div>
                    <div>Creator: <strong>{group.creatorName}</strong></div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-3 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenGroupChat(group)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open Chat</span>
                    </button>

                    <button
                      onClick={() => handleToggleJoinGroup(group.id)}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-colors border ${
                        group.isJoined
                          ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                          : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {group.isJoined ? 'Leave Pod' : 'Join Pod'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => handleShareGroupWhatsApp(group)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-semibold transition-colors"
                      title="Share Pod on WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => handleShareGroupEmail(group)}
                      className="p-1.5 text-sky-700 hover:bg-sky-50 rounded-xl transition-colors"
                      title="Share Pod via Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCopyGroupLink(group)}
                      className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                      title="Copy invite link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handlePrintGroupSchedule(group)}
                      className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                      title="Print Pod Member Roster & Schedule"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CLASSMATES & STUDENT DIRECT CONNECTIONS */}
      {activeTab === 'students' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.map((student) => {
            const isConnected = student.connectionStatus === 'connected';
            const yearVal = student.yearOfStudy ?? student.currentYear;

            return (
              <div
                key={student.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-sky-300 transition-all shadow-2xs hover:shadow-md p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-sky-900 text-amber-300 flex items-center justify-center font-bold text-lg">
                          {student.name.charAt(0)}
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    <div className="flex-1 truncate">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{student.name}</h3>
                        {student.leadershipTitle && (
                          <span className="p-0.5 rounded bg-amber-100 text-amber-800 text-[10px]" title={student.leadershipTitle}>
                            <Award className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-sky-700 font-medium truncate">{student.programme}</p>
                      <p className="text-[11px] text-slate-400">Year {yearVal} • {student.university || 'UDSM'}</p>
                    </div>
                  </div>

                  {student.bio && (
                    <p className="text-xs text-slate-600 line-clamp-2 italic">
                      "{student.bio}"
                    </p>
                  )}

                  {/* Interests tags */}
                  {student.interests && student.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {student.interests.slice(0, 3).map((int, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {int}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Contact Channels governed by privacy rules */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                    {student.whatsapp && student.privacySettings?.showWhatsapp ? (
                      <a
                        href={`https://wa.me/${student.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="Open WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="p-1.5 rounded-lg bg-slate-50 text-slate-400" title="WhatsApp Private">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}

                    {student.email && student.privacySettings?.showEmail ? (
                      <a
                        href={`mailto:${student.email}`}
                        className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="p-1.5 rounded-lg bg-slate-50 text-slate-400" title="Email Private">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}

                    <span className="text-[10px] text-slate-400 ml-auto">
                      {student.privacySettings?.profileVisibility || 'Classmates'}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions: Endorse, Connect & Direct Message */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <EndorsementButton
                    targetId={student.id}
                    targetType="student"
                    targetTitle={student.name}
                    currentUser={currentUser}
                    onNotify={onNotify}
                    size="sm"
                  />

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleConnection(student.id)}
                      className={`p-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                        isConnected
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}
                      title={isConnected ? 'Connected' : 'Send connection request'}
                    >
                      {isConnected ? <UserCheck className="w-4 h-4 text-emerald-600" /> : <UserPlus className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleOpenDirectChat(student)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE STUDY POD MODAL */}
      {isGroupModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setIsGroupModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">Create New Course Study Pod</h3>
              </div>
              <button onClick={() => setIsGroupModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Study Pod Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zoology Lab & Dissection Prep Circle"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Course Code *</label>
                  <select
                    value={groupCourse}
                    onChange={(e) => setGroupCourse(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.code}>{c.code} - {c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Pod Capacity</label>
                  <select
                    value={groupMaxMembers}
                    onChange={(e) => setGroupMaxMembers(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value={4}>4 Students (Micro Pod)</option>
                    <option value={6}>6 Students (Standard Pod)</option>
                    <option value={8}>8 Students</option>
                    <option value={12}>12 Students</option>
                    <option value={20}>20 Students (Class Workshop)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Location / Format</label>
                <select
                  value={groupMeetingType}
                  onChange={(e) => setGroupMeetingType(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Hybrid (Campus Library & Google Meet)">Hybrid (Campus Library & Google Meet)</option>
                  <option value="In-person (Main Library Discussion Rm)">In-person (Main Library Discussion Rm)</option>
                  <option value="In-person (Department Practical Lab)">In-person (Department Practical Lab)</option>
                  <option value="Online (Google Meet / Zoom)">Online (Google Meet / Zoom)</option>
                  <option value="WhatsApp Voice / Chat Only">WhatsApp Voice / Chat Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pod Focus & Agenda</label>
                <textarea
                  rows={2}
                  placeholder="Describe what assignments, exam questions, or practicals this group will tackle..."
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md"
                >
                  Create & Join Pod
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL CHAT MODAL (Handles both Group and Direct Chat) */}
      <StudentChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        currentUser={currentUser}
        group={activeGroupChat}
        directChat={activeDirectChat}
        onUpdateGroup={handleUpdateGroup}
        onUpdateDirectChat={handleUpdateDirectChat}
        onOpenDirectChatFromMember={(memberId, memberName) => {
          const profile = profiles.find(p => p.id === memberId) || ({
            id: memberId,
            name: memberName,
            role: 'student',
            programme: currentUser.programme,
            university: currentUser.university,
            currentYear: currentUser.currentYear
          } as unknown as StudentNetworkProfile);
          handleOpenDirectChat(profile);
        }}
        onNotify={onNotify}
      />
    </div>
  );
};
