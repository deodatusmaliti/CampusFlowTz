import React, { useState } from 'react';
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
  BookOpen
} from 'lucide-react';
import { Community, User as UserType } from '../types';

interface CommunitiesViewProps {
  communities: Community[];
  currentUser: UserType;
  onSendMessage: (communityId: string, content: string) => void;
  onCreateCommunity: (title: string, code: string) => void;
  onNotify: (msg: string) => void;
}

export const CommunitiesView: React.FC<CommunitiesViewProps> = ({
  communities,
  currentUser,
  onSendMessage,
  onCreateCommunity,
  onNotify,
}) => {
  const [activeCommId, setActiveCommId] = useState<string>(communities[0]?.id || '');
  const [messageInput, setMessageInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');

  const activeCommunity = communities.find((c) => c.id === activeCommId) || communities[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeCommunity) return;
    onSendMessage(activeCommunity.id, messageInput.trim());
    setMessageInput('');
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#d9e3ea] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            Student Collaboration Hubs
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102d4f] mt-1">
            Course Communities & Discussions
          </h1>
          <p className="text-xs text-slate-500">
            Share lab datasets, lecture notices, past papers, and coordinate study sessions
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-[#1e6fa8] hover:bg-[#185a8a] text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Create Study Hub
        </button>
      </div>

      {/* Main Grid: Left Channel List, Right Active Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Community Hubs List */}
        <div className="space-y-2.5">
          {communities.map((comm) => {
            const isActive = comm.id === activeCommId;
            return (
              <div
                key={comm.id}
                onClick={() => setActiveCommId(comm.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white border-[#1e6fa8] ring-2 ring-sky-100 shadow-sm'
                    : 'bg-white border-[#d9e3ea] hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#e5f2fb] text-[#1e6fa8] font-black text-xs">
                    {comm.courseCode}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{comm.memberCount} members</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#102d4f] mt-2">
                  {comm.courseTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {comm.lastMessage}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      shareWhatsApp(comm);
                    }}
                    className="text-[#1e6fa8] hover:text-[#102d4f] font-semibold flex items-center gap-1"
                    title="Share to WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" /> WhatsApp Invite
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Active Discussion Thread */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#d9e3ea] shadow-xs flex flex-col h-[560px]">
          {/* Thread Header */}
          {activeCommunity ? (
            <>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#102d4f]">{activeCommunity.courseTitle}</h2>
                    <span className="text-xs font-bold text-[#1e6fa8]">({activeCommunity.courseCode})</span>
                  </div>
                  <p className="text-xs text-slate-500">{activeCommunity.memberCount} students & lecturers enrolled</p>
                </div>

                <button
                  onClick={() => shareWhatsApp(activeCommunity)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
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
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-[#fbfdff] border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#102d4f]">{msg.authorName}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          msg.authorRole === 'Lecturer' 
                            ? 'bg-purple-100 text-purple-800' 
                            : msg.authorRole === 'Class Rep'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {msg.authorRole}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        {msg.isPinned && (
                          <span className="flex items-center gap-1 text-amber-700 font-bold">
                            <Pin className="w-3 h-3" /> Pinned
                          </span>
                        )}
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                      {msg.content}
                    </p>

                    <div className="mt-2.5 flex items-center gap-1 text-xs text-slate-500">
                      <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-[11px]">{msg.likes} endorsements</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Post question or update to ${activeCommunity.courseCode}...`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#1e6fa8] hover:bg-[#185a8a] text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Select a community channel to participate.
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-[#102d4f]">Create New Course Study Hub</h2>
            <p className="text-xs text-slate-500 mt-0.5">Form a dedicated peer collaboration space</p>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hub Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physiology Lab Study Squad"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Code</label>
                <input
                  type="text"
                  placeholder="e.g. BMS 204"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
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
                  className="px-5 py-2 rounded-xl bg-[#1e6fa8] hover:bg-[#185a8a] text-white text-xs font-bold shadow-sm"
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
