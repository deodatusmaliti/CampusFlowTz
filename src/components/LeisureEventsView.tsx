import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  CalendarPlus, 
  CalendarCheck, 
  Tag, 
  DollarSign, 
  Share2, 
  Trash2, 
  Sparkles,
  Trophy,
  Music,
  Activity,
  X,
  AlertCircle
} from 'lucide-react';
import { LeisureEvent, LeisureCategory, User, CalendarEvent } from '../types';
import { StorageService } from '../services/storageService';
import { soundAlerts } from '../services/soundAlertService';
import { EndorsementButton } from './EndorsementButton';

interface LeisureEventsViewProps {
  user: User;
  onAddCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onNotify: (msg: string) => void;
}

export const LeisureEventsView: React.FC<LeisureEventsViewProps> = ({
  user,
  onAddCalendarEvent,
  onNotify,
}) => {
  const [events, setEvents] = useState<LeisureEvent[]>(() => StorageService.getLeisureEvents());
  const [categoryFilter, setCategoryFilter] = useState<LeisureCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalCategory, setModalCategory] = useState<LeisureCategory>('sports');
  const [modalDate, setModalDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalStartTime, setModalStartTime] = useState('16:00');
  const [modalEndTime, setModalEndTime] = useState('18:00');
  const [modalVenue, setModalVenue] = useState('University Sports Ground');
  const [modalOrganizer, setModalOrganizer] = useState('UDSM Sports Club');
  const [modalFee, setModalFee] = useState('Free Admission');
  const [modalError, setModalError] = useState<string | null>(null);

  // Filtered
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;
      if (bookmarkedOnly && !e.isBookmarked) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
  }, [events, categoryFilter, bookmarkedOnly, searchQuery]);

  const handleRSVP = (eventId: string, status: 'going' | 'interested' | 'not_going') => {
    const updated = StorageService.rsvpLeisureEvent(eventId, user.id, status);
    setEvents(updated);
    soundAlerts.playSoftChime();
    onNotify(`Event RSVP updated: ${status.replace('_', ' ').toUpperCase()}`);
  };

  const handleToggleBookmark = (id: string) => {
    const updated = StorageService.toggleBookmarkLeisure(id);
    setEvents(updated);
    const item = updated.find(e => e.id === id);
    onNotify(item?.isBookmarked ? 'Event saved to bookmarks.' : 'Removed from bookmarks.');
  };

  const handleSyncToCalendar = (evt: LeisureEvent) => {
    onAddCalendarEvent({
      title: `${evt.title} (${evt.category.toUpperCase()})`,
      description: `${evt.description}\nOrganizer: ${evt.organizer}\nAdmission: ${evt.admissionFee}`,
      date: evt.date,
      startTime: evt.startTime,
      endTime: evt.endTime,
      location: evt.venue,
      category: 'personal',
      reminderMinutes: 30,
    });
    onNotify(`"${evt.title}" added to your personal timetable.`);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    if (!modalTitle.trim()) {
      setModalError('Please enter an event title.');
      return;
    }
    if (modalEndTime <= modalStartTime) {
      setModalError('End time must be after start time.');
      return;
    }

    const newEvt: LeisureEvent = {
      id: 'leis_' + Date.now(),
      title: modalTitle.trim(),
      description: modalDesc.trim() || 'Exciting campus student activity. Everyone welcome!',
      category: modalCategory,
      date: modalDate,
      startTime: modalStartTime,
      endTime: modalEndTime,
      location: modalVenue.trim() || 'Campus Grounds',
      venue: modalVenue.trim() || 'Campus Grounds',
      organizer: modalOrganizer.trim() || user.name,
      organizerRole: user.role === 'admin' ? 'University Board' : 'Student Association Lead',
      admissionFee: modalFee.trim() || 'Free Admission',
      postedByUserId: user.id,
      postedByUserName: user.name,
      isUserPosted: true,
      rsvpGoing: [user.id],
      rsvpInterested: [],
      rsvpNotGoing: [],
      isBookmarked: false,
    };

    const updated = StorageService.addLeisureEvent(newEvt);
    setEvents(updated);

    // Broadcast Alert
    StorageService.addSystemAlert({
      title: `Campus Event: ${newEvt.title}`,
      message: `${newEvt.organizer} invites you to ${newEvt.title} on ${newEvt.date} at ${newEvt.venue}.`,
      category: 'leisure_events',
      priority: 'low',
      sourceType: 'server_push',
      actionTab: 'leisure',
      actionLabel: 'View Event',
    });

    setIsModalOpen(false);
    onNotify(`Event "${newEvt.title}" published!`);
  };

  const renderCategoryIcon = (cat: LeisureCategory) => {
    switch (cat) {
      case 'sports':
        return <Trophy className="w-4 h-4 text-amber-600" />;
      case 'music':
      case 'culture':
        return <Music className="w-4 h-4 text-purple-600" />;
      case 'wellness':
        return <Activity className="w-4 h-4 text-emerald-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-pink-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-pink-100 text-pink-800 text-xs font-bold uppercase tracking-wider">
              Student Life & Leisure
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-semibold">
              Sports • Arts • Competitions
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Entertainment, Sports & Leisure Events
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Discover varsity derbies, cultural nights, tech hackathons, and recreation happening across campus.
          </p>
        </div>

        <button
          onClick={() => { setModalError(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Post Campus Event</span>
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
            placeholder="Search campus events, clubs, or venues..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as LeisureCategory | 'ALL')}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none text-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="sports">Sports & Tournaments</option>
            <option value="culture">Cultural Festivals</option>
            <option value="music">Music & Concerts</option>
            <option value="clubs">Student Clubs</option>
            <option value="competitions">Competitions & Hackathons</option>
            <option value="wellness">Wellness & Recreation</option>
          </select>

          <button
            onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              bookmarkedOnly ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
            title="Bookmarked events"
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarkedOnly ? 'fill-amber-600 text-amber-600' : ''}`} />
            <span className="hidden md:inline">Saved</span>
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No leisure events match your search</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Organize a sports match, club meetup, or movie night for your fellow students!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((evt) => {
            const isGoing = (evt.rsvpGoing || []).includes(user.id);
            const isInterested = (evt.rsvpInterested || []).includes(user.id);

            return (
              <div
                key={evt.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-pink-300 transition-all shadow-2xs hover:shadow-md p-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1.5 rounded-lg bg-pink-50 text-pink-700">
                        {renderCategoryIcon(evt.category)}
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                        {evt.category}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleBookmark(evt.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        evt.isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-slate-500'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${evt.isBookmarked ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                      <span>{evt.date} • {evt.startTime} – {evt.endTime} EAT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>By <b>{evt.organizer}</b></span>
                      <span className="font-bold text-emerald-700">{evt.admissionFee}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    {/* Endorsement for Event */}
                    <EndorsementButton
                      targetId={evt.id}
                      targetType="event"
                      targetTitle={evt.title}
                      currentUser={user}
                      onNotify={onNotify}
                      size="sm"
                    />

                    <button
                      onClick={() => handleSyncToCalendar(evt)}
                      className="text-xs font-bold text-slate-600 hover:text-pink-600 flex items-center gap-1"
                      title="Add to personal timetable"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>Sync</span>
                    </button>
                  </div>

                  {/* RSVP */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleRSVP(evt.id, 'going')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 ${
                        isGoing ? 'bg-pink-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>Going</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isGoing ? 'bg-pink-700' : 'bg-slate-200'}`}>
                        {(evt.rsvpGoing || []).length}
                      </span>
                    </button>

                    <button
                      onClick={() => handleRSVP(evt.id, 'interested')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 ${
                        isInterested ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>Interested</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isInterested ? 'bg-amber-700' : 'bg-slate-200'}`}>
                        {(evt.rsvpInterested || []).length}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Event Modal */}
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
                <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Post Campus Leisure Event</h3>
                  <p className="text-xs text-slate-500">Sports, cultural galas, tournaments & celebrations</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
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

            <form onSubmit={handleCreateEvent} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="e.g. Inter-College Football Derby 2026"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value as LeisureCategory)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="sports">Sports & Derby</option>
                    <option value="culture">Cultural Gala</option>
                    <option value="music">Music & Festival</option>
                    <option value="clubs">Student Club Meetup</option>
                    <option value="competitions">Hackathon / Quiz</option>
                    <option value="wellness">Yoga & Recreation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Admission Fee</label>
                  <input
                    type="text"
                    value={modalFee}
                    onChange={(e) => setModalFee(e.target.value)}
                    placeholder="e.g. Free Admission or 3,000 TZS"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
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
                    className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={modalStartTime}
                    onChange={(e) => setModalStartTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    value={modalEndTime}
                    onChange={(e) => setModalEndTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Venue *</label>
                  <input
                    type="text"
                    value={modalVenue}
                    onChange={(e) => setModalVenue(e.target.value)}
                    placeholder="e.g. University Main Sports Complex"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Organizer Club</label>
                  <input
                    type="text"
                    value={modalOrganizer}
                    onChange={(e) => setModalOrganizer(e.target.value)}
                    placeholder="e.g. University Arts Association"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={modalDesc}
                  onChange={(e) => setModalDesc(e.target.value)}
                  placeholder="Details, dress code, registration links..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
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
                  className="px-5 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-xl shadow-xs"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
