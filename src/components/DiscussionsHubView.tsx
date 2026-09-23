import React, { useState, useMemo } from 'react';
import { 
  Video, 
  Phone, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Plus, 
  ExternalLink, 
  Copy, 
  Check, 
  CalendarPlus, 
  CalendarCheck, 
  AlertCircle, 
  Search, 
  CheckCircle2, 
  X, 
  Edit3, 
  Trash2, 
  Share2, 
  Sparkles,
  Layers
} from 'lucide-react';
import { DiscussionCall, CallPlatform, User, Course, CalendarEvent } from '../types';
import { StorageService } from '../services/storageService';
import { soundAlerts } from '../services/soundAlertService';

interface DiscussionsHubViewProps {
  user: User;
  courses: Course[];
  onAddCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onNotify: (msg: string) => void;
}

export const DiscussionsHubView: React.FC<DiscussionsHubViewProps> = ({
  user,
  courses,
  onAddCalendarEvent,
  onNotify,
}) => {
  const [calls, setCalls] = useState<DiscussionCall[]>(() => StorageService.getDiscussionCalls());
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCallId, setEditingCallId] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalCourseCode, setModalCourseCode] = useState(courses[0]?.code || 'ZOO 201');
  const [modalClassGroup, setModalClassGroup] = useState('Whole Class & Study Pods');
  const [modalDate, setModalDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalStartTime, setModalStartTime] = useState('19:00');
  const [modalEndTime, setModalEndTime] = useState('20:15');
  const [modalAgenda, setModalAgenda] = useState('Lab briefing\nKey questions\nAssignments review');
  const [modalTargetParticipants, setModalTargetParticipants] = useState('Enrolled students & course instructors');
  const [modalPlatform, setModalPlatform] = useState<CallPlatform>('google_meet');
  const [modalMeetingLink, setModalMeetingLink] = useState('https://meet.google.com/campusflow-live');
  const [modalError, setModalError] = useState<string | null>(null);

  // Filtered calls
  const filteredCalls = useMemo(() => {
    return calls.filter(c => {
      if (selectedCourseFilter !== 'ALL' && c.courseCode !== selectedCourseFilter) return false;
      if (selectedStatusFilter !== 'ALL' && c.status !== selectedStatusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.courseCode.toLowerCase().includes(q) ||
          c.hostName.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
  }, [calls, selectedCourseFilter, selectedStatusFilter, searchQuery]);

  // Handlers
  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    onNotify('Meeting link copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRSVP = (callId: string, response: 'going' | 'maybe' | 'cannot') => {
    const updated = StorageService.rsvpDiscussionCall(callId, user.id, response);
    setCalls(updated);
    soundAlerts.playSoftChime();
    onNotify(`RSVP set to "${response.toUpperCase()}".`);
  };

  const handleSyncToCalendar = (call: DiscussionCall) => {
    onAddCalendarEvent({
      title: `Virtual Call: ${call.title}`,
      description: `Hosted by ${call.hostName} on ${call.platform.toUpperCase()}. Link: ${call.meetingLink}`,
      date: call.date,
      startTime: call.startTime,
      endTime: call.endTime,
      location: `Online (${call.platform.replace('_', ' ').toUpperCase()})`,
      category: 'personal',
      reminderMinutes: 15,
    });

    const updated = StorageService.toggleAddCallToTimetable(call.id);
    setCalls(updated);
    onNotify(`"${call.title}" synchronized to your timetable & calendar.`);
  };

  const handleOpenCreateModal = () => {
    setEditingCallId(null);
    setModalTitle('');
    setModalDesc('');
    setModalCourseCode(courses[0]?.code || 'ZOO 201');
    setModalClassGroup('Year 2 Study Group A');
    setModalDate(new Date().toISOString().split('T')[0]);
    setModalStartTime('19:00');
    setModalEndTime('20:15');
    setModalAgenda('Safety procedures review\nSpecimen dissection tips\nQ&A with class reps');
    setModalTargetParticipants('All enrolled students');
    setModalPlatform('google_meet');
    setModalMeetingLink('https://meet.google.com/udsm-call');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (call: DiscussionCall) => {
    setEditingCallId(call.id);
    setModalTitle(call.title);
    setModalDesc(call.description);
    setModalCourseCode(call.courseCode);
    setModalClassGroup(call.classGroup);
    setModalDate(call.date);
    setModalStartTime(call.startTime);
    setModalEndTime(call.endTime);
    setModalAgenda(call.agenda.join('\n'));
    setModalTargetParticipants(call.targetParticipants);
    setModalPlatform(call.platform);
    setModalMeetingLink(call.meetingLink);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!modalTitle.trim()) {
      setModalError('Please enter a session title.');
      return;
    }
    if (modalEndTime <= modalStartTime) {
      setModalError('End time must be after the start time.');
      return;
    }
    if (!modalMeetingLink.trim()) {
      setModalError('Please provide a valid external meeting link (Zoom, Meet, Teams, WhatsApp).');
      return;
    }

    const agendaItems = modalAgenda.split('\n').map(s => s.trim()).filter(Boolean);
    const matchedCourse = courses.find(c => c.code === modalCourseCode);

    if (editingCallId) {
      // Edit
      const existing = calls.find(c => c.id === editingCallId);
      if (!existing) return;

      const updatedCall: DiscussionCall = {
        ...existing,
        title: modalTitle.trim(),
        description: modalDesc.trim(),
        courseCode: modalCourseCode,
        courseTitle: matchedCourse?.title || modalCourseCode,
        classGroup: modalClassGroup,
        date: modalDate,
        startTime: modalStartTime,
        endTime: modalEndTime,
        agenda: agendaItems,
        targetParticipants: modalTargetParticipants,
        platform: modalPlatform,
        meetingLink: modalMeetingLink.trim(),
      };

      const updated = StorageService.updateDiscussionCall(updatedCall);
      setCalls(updated);
      onNotify(`Call session "${updatedCall.title}" updated.`);
    } else {
      // Create new
      const newCall: DiscussionCall = {
        id: 'call_' + Date.now(),
        title: modalTitle.trim(),
        description: modalDesc.trim() || 'Online discussion session for coursework and exam preparation.',
        courseCode: modalCourseCode,
        courseTitle: matchedCourse?.title || modalCourseCode,
        classGroup: modalClassGroup,
        date: modalDate,
        startTime: modalStartTime,
        endTime: modalEndTime,
        agenda: agendaItems,
        targetParticipants: modalTargetParticipants,
        platform: modalPlatform,
        meetingLink: modalMeetingLink.trim(),
        hostName: user.name,
        hostRole: user.role === 'student' ? 'Student Study Lead' : 'Course Lecturer',
        hostId: user.id,
        status: 'scheduled',
        rsvpGoing: [user.id],
        rsvpMaybe: [],
        rsvpCannot: [],
        addedToTimetable: false,
      };

      const updated = StorageService.addDiscussionCall(newCall);
      setCalls(updated);

      // Add Alert
      StorageService.addSystemAlert({
        title: `New Discussion: ${newCall.title}`,
        message: `${newCall.hostName} scheduled a call on ${newCall.date} at ${newCall.startTime} EAT.`,
        category: 'discussion_calls',
        priority: 'high',
        sourceType: 'server_push',
        actionTab: 'discussions',
        actionLabel: 'View Call Hub',
      });

      onNotify(`Virtual discussion session "${newCall.title}" scheduled!`);
    }

    setIsModalOpen(false);
  };

  const handleCancelCall = (callId: string) => {
    const existing = calls.find(c => c.id === callId);
    if (!existing) return;
    if (window.confirm(`Are you sure you want to cancel "${existing.title}"?`)) {
      const updated = StorageService.updateDiscussionCall({
        ...existing,
        status: 'cancelled',
      });
      setCalls(updated);
      onNotify(`Session "${existing.title}" marked as cancelled.`);
    }
  };

  const renderPlatformBadge = (platform: CallPlatform) => {
    switch (platform) {
      case 'google_meet':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1"><Video className="w-3 h-3 text-emerald-600" /> Google Meet</span>;
      case 'zoom':
        return <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200 flex items-center gap-1"><Video className="w-3 h-3 text-sky-600" /> Zoom</span>;
      case 'microsoft_teams':
        return <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center gap-1"><Video className="w-3 h-3 text-indigo-600" /> MS Teams</span>;
      case 'whatsapp':
        return <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200 flex items-center gap-1"><Phone className="w-3 h-3 text-teal-600" /> WhatsApp Call</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1"><ExternalLink className="w-3 h-3" /> External Call</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
              Discussion & Call Hub
            </span>
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-xs font-semibold">
              Live Faculty & Peer Sync
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Academic Discussions & Call Planning
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize study groups, virtual lab clinics, and seminar Q&A calls with external links (Meet, Zoom, Teams, WhatsApp).
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Plan Discussion / Call</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussion calls, host, or course..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none text-slate-700"
          >
            <option value="ALL">All Courses</option>
            {courses.map(c => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none text-slate-700"
          >
            <option value="ALL">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Calls Grid */}
      {filteredCalls.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No discussion calls found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Plan a new virtual study room or revision session for your class.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl"
          >
            Schedule First Call
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredCalls.map((call) => {
            const isUserGoing = (call.rsvpGoing || []).includes(user.id);
            const isUserMaybe = (call.rsvpMaybe || []).includes(user.id);
            const isUserCannot = (call.rsvpCannot || []).includes(user.id);

            return (
              <div
                key={call.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs p-5 flex flex-col justify-between ${
                  call.status === 'cancelled' 
                    ? 'border-slate-200 opacity-60 bg-slate-50/50' 
                    : 'border-slate-200/90 hover:border-sky-300 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-xs font-bold">
                        {call.courseCode}
                      </span>
                      {renderPlatformBadge(call.platform)}
                      {call.status === 'cancelled' && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-bold">
                          Cancelled
                        </span>
                      )}
                    </div>

                    {(user.role === 'admin' || user.id === call.hostId) && call.status !== 'cancelled' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(call)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                          title="Edit call details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCancelCall(call.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Cancel call"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {call.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {call.description}
                    </p>
                  </div>

                  {/* Date, Time & Host info */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{call.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{call.startTime} – {call.endTime} EAT</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Host: <b>{call.hostName}</b> ({call.hostRole})</span>
                    </div>
                  </div>

                  {/* Agenda items */}
                  {call.agenda && call.agenda.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Session Agenda
                      </div>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {call.agenda.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-sky-600 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* External meeting link notice */}
                  <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <ExternalLink className="w-4 h-4 text-sky-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase font-bold text-sky-800 tracking-wider">
                          External Video/Voice Link
                        </div>
                        <a 
                          href={call.meetingLink}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-sky-700 hover:underline font-mono truncate block"
                          title="Opens external conference room"
                        >
                          {call.meetingLink}
                        </a>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyLink(call.meetingLink, call.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-white border border-transparent hover:border-slate-200 transition-colors shrink-0"
                      title="Copy meeting link"
                    >
                      {copiedId === call.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Bottom RSVP and Timetable Sync */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* RSVP buttons with participant counts */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-500 mr-1">RSVP:</span>
                    <button
                      onClick={() => handleRSVP(call.id, 'going')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
                        isUserGoing 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>Going</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isUserGoing ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {(call.rsvpGoing || []).length}
                      </span>
                    </button>

                    <button
                      onClick={() => handleRSVP(call.id, 'maybe')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
                        isUserMaybe 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>Maybe</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isUserMaybe ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {(call.rsvpMaybe || []).length}
                      </span>
                    </button>

                    <button
                      onClick={() => handleRSVP(call.id, 'cannot')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                        isUserCannot 
                          ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Can't attend
                    </button>
                  </div>

                  {/* Add to Timetable / Calendar button */}
                  <button
                    onClick={() => handleSyncToCalendar(call)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                      call.addedToTimetable 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' 
                        : 'bg-slate-900 hover:bg-sky-700 text-white shadow-2xs'
                    }`}
                  >
                    {call.addedToTimetable ? <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" /> : <CalendarPlus className="w-3.5 h-3.5" />}
                    <span>{call.addedToTimetable ? 'Synced to Timetable' : 'Add to Calendar'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Plan / Edit Discussion Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Video className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingCallId ? 'Edit Discussion Session' : 'Plan New Discussion Call'}
                  </h3>
                  <p className="text-xs text-slate-500">Coordinate virtual study groups and review sessions</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveModal} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Title *</label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="e.g. ZOO 201: Pre-Lab Dissection Review"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Course *</label>
                  <select
                    value={modalCourseCode}
                    onChange={(e) => setModalCourseCode(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    {courses.map(c => (
                      <option key={c.code} value={c.code}>{c.code} - {c.title.substring(0, 20)}...</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Group</label>
                  <input
                    type="text"
                    value={modalClassGroup}
                    onChange={(e) => setModalClassGroup(e.target.value)}
                    placeholder="e.g. Zoology Year 2 Group A"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time (EAT) *</label>
                  <input
                    type="time"
                    value={modalStartTime}
                    onChange={(e) => setModalStartTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time (EAT) *</label>
                  <input
                    type="time"
                    value={modalEndTime}
                    onChange={(e) => setModalEndTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Platform *</label>
                  <select
                    value={modalPlatform}
                    onChange={(e) => setModalPlatform(e.target.value as CallPlatform)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="google_meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="microsoft_teams">Microsoft Teams</option>
                    <option value="whatsapp">WhatsApp Group Call</option>
                    <option value="other">Other Web Call</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Link (External) *</label>
                  <input
                    type="url"
                    value={modalMeetingLink}
                    onChange={(e) => setModalMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Agenda Points (one per line)</label>
                <textarea
                  rows={2}
                  value={modalAgenda}
                  onChange={(e) => setModalAgenda(e.target.value)}
                  placeholder="Review lecture 4 slides&#10;Dissecting kit check&#10;Q&A"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                />
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-all"
                >
                  {editingCallId ? 'Save Changes' : 'Schedule Call'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
