import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  MapPin, 
  FileText, 
  Info, 
  Send, 
  ChevronRight, 
  Check, 
  Filter, 
  ExternalLink,
  Plus,
  Clock,
  Sparkles,
  Users,
  Building
} from 'lucide-react';
import { Announcement, User } from '../types';

interface AnnouncementsBarProps {
  announcements: Announcement[];
  currentUser: User;
  onOpenCreateAnnouncement: () => void;
  onAcknowledge: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  compact?: boolean;
}

export const AnnouncementsBar: React.FC<AnnouncementsBarProps> = ({
  announcements,
  currentUser,
  onOpenCreateAnnouncement,
  onAcknowledge,
  onNavigateTab,
  compact = true,
}) => {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'course' | 'campus'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(announcements[0]?.id || null);

  const canPost = currentUser.role === 'lecturer' || 
                  currentUser.role === 'admin' || 
                  currentUser.leadershipTitle?.includes('Representative') ||
                  currentUser.leadershipTitle?.includes('Leader') ||
                  currentUser.leadershipTitle?.includes('Dean') ||
                  currentUser.leadershipTitle?.includes('HOD') ||
                  currentUser.leadershipTitle?.includes('Manager') ||
                  currentUser.leadershipTitle?.includes('Chancellor');

  const filtered = announcements.filter(a => {
    if (filter === 'urgent') return a.priority === 'urgent' || a.priority === 'venue_change';
    if (filter === 'course') return a.targetAudience.type === 'course';
    if (filter === 'campus') return a.targetAudience.type === 'university' || a.targetAudience.type === 'all';
    return true;
  });

  const unacknowledgedCount = announcements.filter(a => !a.acknowledged).length;

  const getPriorityBadge = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'urgent':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          icon: AlertTriangle,
          label: 'Urgent Alert',
        };
      case 'venue_change':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: MapPin,
          label: 'Venue Change',
        };
      case 'assessment':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: FileText,
          label: 'CAT Notice',
        };
      default:
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: Info,
          label: 'Announcement',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#d9e3ea] shadow-xs overflow-hidden">
      {/* Announcements Bar Header */}
      <div className="p-3.5 bg-gradient-to-r from-[#102d4f] to-[#1e4878] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-4 h-4 text-[#e6ad3d]" />
            {unacknowledgedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#102d4f] animate-ping" />
            )}
          </div>
          <div>
            <span className="text-xs font-bold tracking-wide uppercase text-slate-100 flex items-center gap-1.5">
              Live Alerts Bar
              {unacknowledgedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white font-black text-[10px]">
                  {unacknowledgedCount} new
                </span>
              )}
            </span>
          </div>
        </div>

        <button
          id="post-announcement-sidebar-btn"
          onClick={onOpenCreateAnnouncement}
          className="px-2 py-1 rounded-lg bg-[#e6ad3d] hover:bg-[#d49e32] text-[#102d4f] text-[11px] font-extrabold flex items-center gap-1 transition-all active:scale-95 shadow-xs"
          title="Send broadcast to courses, years, or campus"
        >
          <Plus className="w-3 h-3 stroke-[3]" /> Post
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-2.5 py-2 border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-1 rounded-lg transition-colors whitespace-nowrap ${
            filter === 'all' ? 'bg-[#102d4f] text-white' : 'text-slate-500 hover:bg-slate-200/60'
          }`}
        >
          All ({announcements.length})
        </button>
        <button
          onClick={() => setFilter('urgent')}
          className={`px-2 py-1 rounded-lg transition-colors whitespace-nowrap ${
            filter === 'urgent' ? 'bg-red-600 text-white' : 'text-slate-500 hover:bg-slate-200/60'
          }`}
        >
          🚨 Urgent
        </button>
        <button
          onClick={() => setFilter('course')}
          className={`px-2 py-1 rounded-lg transition-colors whitespace-nowrap ${
            filter === 'course' ? 'bg-[#1e6fa8] text-white' : 'text-slate-500 hover:bg-slate-200/60'
          }`}
        >
          Courses
        </button>
        <button
          onClick={() => setFilter('campus')}
          className={`px-2 py-1 rounded-lg transition-colors whitespace-nowrap ${
            filter === 'campus' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:bg-slate-200/60'
          }`}
        >
          Campus
        </button>
      </div>

      {/* Announcements Stream */}
      <div className="p-2 space-y-2 max-h-[420px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            No announcements matching this filter.
          </div>
        ) : (
          filtered.map((item) => {
            const badge = getPriorityBadge(item.priority);
            const BadgeIcon = badge.icon;
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all ${
                  isExpanded 
                    ? 'bg-[#f8fafc] border-[#1e6fa8] shadow-xs' 
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                } ${!item.acknowledged ? 'ring-1 ring-amber-300/60' : ''}`}
              >
                <div 
                  className="p-2.5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                      <BadgeIcon className="w-2.5 h-2.5" />
                      {badge.label}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5 shrink-0">
                      <Clock className="w-2.5 h-2.5" /> {item.timestamp}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-[#102d4f] mt-1.5 leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Target Audience pill */}
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-[#1e6fa8] font-semibold truncate">
                    <Users className="w-2.5 h-2.5 shrink-0 text-[#1e6fa8]" />
                    <span className="truncate">{item.targetAudience.label}</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-2.5 pb-2.5 pt-1 border-t border-slate-100 text-xs text-slate-600 animate-in fade-in duration-150">
                    <p className="text-[11px] leading-relaxed text-slate-700">
                      {item.content}
                    </p>

                    {/* Render Attachments if any */}
                    {item.attachments && item.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Attachments ({item.attachments.length}):
                        </span>
                        <div className="flex flex-col gap-1">
                          {item.attachments.map(att => (
                            <a
                              key={att.id}
                              href={att.url || '#'}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => {
                                if (!att.url || att.url === '#') {
                                  e.preventDefault();
                                  alert(`Downloading attachment: ${att.name}`);
                                }
                              }}
                              className="flex items-center justify-between px-2 py-1 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-md text-[10px] text-slate-700 transition-colors group/att"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                {att.type === 'pdf' ? (
                                  <FileText className="w-3 h-3 text-rose-500 shrink-0" />
                                ) : att.type === 'image' ? (
                                  <Sparkles className="w-3 h-3 text-sky-500 shrink-0" />
                                ) : (
                                  <FileText className="w-3 h-3 text-indigo-500 shrink-0" />
                                )}
                                <span className="font-semibold truncate">{att.name}</span>
                                {att.size && <span className="text-slate-400 text-[9px]">({att.size})</span>}
                              </div>
                              <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover/att:text-sky-600 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <div>
                        <span className="font-bold text-slate-800">{item.authorName}</span>
                        {item.authorTitle && (
                          <span className="block text-[9px] text-slate-400 truncate max-w-[150px]">{item.authorTitle}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {!item.acknowledged ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAcknowledge(item.id);
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold flex items-center gap-1"
                          >
                            <Check className="w-2.5 h-2.5" /> Got it
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-semibold text-[10px] flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Read
                          </span>
                        )}

                        {item.actionTab && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateTab(item.actionTab!);
                            }}
                            className="p-1 rounded bg-[#e5f2fb] hover:bg-[#d0e8f8] text-[#1e6fa8]"
                            title="Jump to relevant view"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Audience Tip */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Targeted to your courses & year</span>
        <button 
          onClick={onOpenCreateAnnouncement}
          className="text-[#1e6fa8] font-bold hover:underline"
        >
          Send Group Notice →
        </button>
      </div>
    </div>
  );
};
