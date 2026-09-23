import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Smile, 
  Paperclip, 
  Link as LinkIcon, 
  Users, 
  Search, 
  ShieldAlert, 
  VolumeX, 
  Volume2, 
  Share2, 
  MessageSquare, 
  FileText, 
  Download, 
  Check, 
  CheckCheck, 
  CornerUpLeft, 
  Flag, 
  MoreVertical, 
  Eye, 
  Lock, 
  UserMinus, 
  UserCheck, 
  Info,
  ExternalLink
} from 'lucide-react';
import { 
  StudyGroup, 
  DirectConversation, 
  CommunityMessage, 
  User, 
  StudyMaterial 
} from '../types';
import { StorageService } from '../services/storageService';

interface StudentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  group?: StudyGroup | null;
  directChat?: DirectConversation | null;
  onUpdateGroup?: (updated: StudyGroup) => void;
  onUpdateDirectChat?: (updated: DirectConversation) => void;
  onOpenDirectChatFromMember?: (memberId: string, memberName: string) => void;
  onNotify: (msg: string) => void;
}

const COMMON_REACTIONS = ['👍', '❤️', '💡', '🔥', '🙌', '🔬'];

export const StudentChatModal: React.FC<StudentChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  group,
  directChat,
  onUpdateGroup,
  onUpdateDirectChat,
  onOpenDirectChatFromMember,
  onNotify,
}) => {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [replyingTo, setReplyingTo] = useState<CommunityMessage | null>(null);

  // Participants drawer state
  const [showParticipants, setShowParticipants] = useState(false);

  // Material attachment picker state
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);
  const [availableMaterials, setAvailableMaterials] = useState<StudyMaterial[]>([]);

  // Link attachment state
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');

  // Report modal state
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Spam or inappropriate content');

  // Mute & Block state
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load active messages & settings
  useEffect(() => {
    if (group) {
      setMessages(group.messages || []);
      setIsMuted(!!group.isMuted);
      setIsBlocked(false);
      const mats = StorageService.getStudyMaterials().filter(
        m => m.courseCode.toLowerCase() === group.courseCode.toLowerCase()
      );
      setAvailableMaterials(mats.length > 0 ? mats : StorageService.getStudyMaterials().slice(0, 6));
    } else if (directChat) {
      setMessages(directChat.messages || []);
      setIsMuted(!!directChat.isMuted);
      setIsBlocked(!!directChat.isBlocked);
      setAvailableMaterials(StorageService.getStudyMaterials().slice(0, 8));
    }
  }, [group, directChat]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (!isOpen) return null;

  // Filter messages by search keyword
  const displayMessages = searchQuery.trim()
    ? messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  // Send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    if (isBlocked) {
      onNotify('Cannot send messages to a blocked contact.');
      return;
    }

    const newMessage: CommunityMessage = {
      id: 'msg_' + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.preferredName ? `${currentUser.name} (${currentUser.preferredName})` : currentUser.name,
      authorRole: currentUser.leadershipTitle || 'Student',
      authorAvatar: currentUser.avatar,
      content: inputText.trim(),
      timestamp: new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date()),
      likes: 0,
      replyTo: replyingTo ? {
        id: replyingTo.id,
        authorName: replyingTo.authorName,
        content: replyingTo.content.slice(0, 80)
      } : undefined,
      reactions: {}
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputText('');
    setReplyingTo(null);

    if (group && onUpdateGroup) {
      const updatedGroup: StudyGroup = {
        ...group,
        messages: updatedMessages,
        unreadCount: 0
      };
      onUpdateGroup(updatedGroup);
    } else if (directChat && onUpdateDirectChat) {
      const updatedChat: DirectConversation = {
        ...directChat,
        messages: updatedMessages,
        lastMessageTimestamp: newMessage.timestamp,
        unreadCount: 0
      };
      onUpdateDirectChat(updatedChat);
    }

    onNotify('Message sent (Local Demo Mode).');
  };

  // Attach Study Material
  const handleAttachMaterial = (mat: StudyMaterial) => {
    const newMessage: CommunityMessage = {
      id: 'msg_mat_' + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.leadershipTitle || 'Student',
      authorAvatar: currentUser.avatar,
      content: `Shared study document: "${mat.title}"`,
      timestamp: new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date()),
      likes: 1,
      sharedMaterial: {
        id: mat.id,
        title: mat.title,
        fileName: mat.fileName,
        fileType: mat.fileType,
        courseCode: mat.courseCode
      },
      reactions: { '👍': [currentUser.id] }
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setShowMaterialPicker(false);

    if (group && onUpdateGroup) {
      onUpdateGroup({ ...group, messages: updatedMessages });
    } else if (directChat && onUpdateDirectChat) {
      onUpdateDirectChat({ ...directChat, messages: updatedMessages });
    }

    onNotify(`Attached "${mat.fileName}" into the conversation!`);
  };

  // Attach Web Link
  const handleAttachLink = () => {
    if (!linkUrl.trim()) return;

    let validUrl = linkUrl.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    const newMessage: CommunityMessage = {
      id: 'msg_link_' + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.leadershipTitle || 'Student',
      authorAvatar: currentUser.avatar,
      content: `Shared resource link: ${linkTitle.trim() || validUrl}`,
      timestamp: new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date()),
      likes: 0,
      sharedLink: {
        url: validUrl,
        title: linkTitle.trim() || validUrl,
        description: 'Open external academic resource link.'
      }
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setLinkUrl('');
    setLinkTitle('');
    setShowLinkInput(false);

    if (group && onUpdateGroup) {
      onUpdateGroup({ ...group, messages: updatedMessages });
    } else if (directChat && onUpdateDirectChat) {
      onUpdateDirectChat({ ...directChat, messages: updatedMessages });
    }

    onNotify('Resource link shared!');
  };

  // Toggle reaction on a message
  const handleToggleReaction = (msgId: string, emoji: string) => {
    const updatedMessages = messages.map(msg => {
      if (msg.id !== msgId) return msg;
      const currentReactions = { ...(msg.reactions || {}) };
      const usersList = currentReactions[emoji] || [];

      if (usersList.includes(currentUser.id)) {
        // remove user reaction
        const filtered = usersList.filter(u => u !== currentUser.id);
        if (filtered.length === 0) {
          delete currentReactions[emoji];
        } else {
          currentReactions[emoji] = filtered;
        }
      } else {
        // add user reaction
        currentReactions[emoji] = [...usersList, currentUser.id];
      }

      return { ...msg, reactions: currentReactions };
    });

    setMessages(updatedMessages);
    if (group && onUpdateGroup) {
      onUpdateGroup({ ...group, messages: updatedMessages });
    } else if (directChat && onUpdateDirectChat) {
      onUpdateDirectChat({ ...directChat, messages: updatedMessages });
    }
  };

  // Toggle Mute Notifications
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (group && onUpdateGroup) {
      onUpdateGroup({ ...group, isMuted: nextMuted });
      onNotify(nextMuted ? `Muted notifications for "${group.name}".` : `Unmuted "${group.name}".`);
    } else if (directChat && onUpdateDirectChat) {
      onUpdateDirectChat({ ...directChat, isMuted: nextMuted });
      onNotify(nextMuted ? `Muted direct notifications from ${directChat.participantName}.` : `Unmuted notifications.`);
    }
  };

  // Block / Unblock Contact
  const handleToggleBlock = () => {
    if (!directChat) return;
    const nextBlocked = !isBlocked;
    setIsBlocked(nextBlocked);
    if (onUpdateDirectChat) {
      onUpdateDirectChat({ ...directChat, isBlocked: nextBlocked });
    }
    onNotify(nextBlocked ? `Blocked ${directChat.participantName}. Their messages are silenced.` : `Unblocked ${directChat.participantName}.`);
  };

  // Report message
  const handleExecuteReport = () => {
    if (!reportingMessageId) return;

    const updatedMessages = messages.map(msg => {
      if (msg.id === reportingMessageId) {
        return { ...msg, isReported: true, reportedReason: reportReason };
      }
      return msg;
    });

    setMessages(updatedMessages);
    setReportingMessageId(null);
    onNotify(`Message reported for: "${reportReason}". Faculty moderators will review it.`);
  };

  // WhatsApp Share invitation / conversation
  const handleShareToWhatsApp = () => {
    if (group) {
      const shareText = `🎓 *Join our CampusFlow TZ Study Pod!*\n*${group.name}* (${group.courseCode})\nMeeting: ${group.meetingType}\nMembers: ${group.currentMembers}/${group.maxMembers}\n\nJoin pod on CampusFlow: ${window.location.origin}/#/network`;
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      onNotify('Opening WhatsApp to share study pod invite...');
    } else if (directChat) {
      const shareText = `Habari ${directChat.participantName}! Let's connect on CampusFlow TZ for our course study discussions.`;
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      onNotify('Opening WhatsApp...');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Local Demo Mode Warning Banner */}
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-[11px] font-bold flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            <span>Local Demo Mode (No backend connected yet)</span>
          </div>
          <span className="text-[10px] text-slate-900 font-medium hidden sm:inline">
            Messages stored in local browser memory. Realtime sync activates when WebSocket server connects.
          </span>
        </div>

        {/* Chat Header */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            {group ? (
              <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center font-bold text-sm text-white shadow-xs">
                {group.courseCode.slice(0, 3)}
              </div>
            ) : (
              <div className="relative">
                {directChat?.participantAvatar ? (
                  <img
                    src={directChat.participantAvatar}
                    alt={directChat.participantName}
                    className="w-10 h-10 rounded-2xl object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-sky-800 flex items-center justify-center font-bold text-amber-300">
                    {directChat?.participantName.charAt(0) || 'U'}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white line-clamp-1">
                  {group ? group.name : directChat?.participantName}
                </h2>
                {isMuted && (
                  <span title="Muted"><VolumeX className="w-3.5 h-3.5 text-slate-400" /></span>
                )}
                {isBlocked && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                    Blocked
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {group 
                  ? `${group.courseCode} • ${group.currentMembers} active members • ${group.meetingType}`
                  : `${directChat?.participantRole} • ${directChat?.participantProgramme}`
                }
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {/* Search messages toggle */}
            <button
              onClick={() => {
                setIsSearching(!isSearching);
                if (isSearching) setSearchQuery('');
              }}
              className={`p-2 rounded-xl transition-colors ${
                isSearching ? 'bg-sky-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Search within conversation"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Group participants drawer button */}
            {group && (
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className={`p-2 rounded-xl transition-colors ${
                  showParticipants ? 'bg-sky-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="View Participants"
              >
                <Users className="w-4 h-4" />
              </button>
            )}

            {/* Mute button */}
            <button
              onClick={handleToggleMute}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={isMuted ? 'Unmute chat' : 'Mute notifications'}
            >
              {isMuted ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Direct Chat Block button */}
            {directChat && (
              <button
                onClick={handleToggleBlock}
                className={`p-2 rounded-xl transition-colors ${
                  isBlocked ? 'bg-rose-900 text-rose-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isBlocked ? 'Unblock student' : 'Block student'}
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}

            {/* WhatsApp invite share */}
            <button
              onClick={handleShareToWhatsApp}
              className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white transition-colors"
              title="Share via WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* Close modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar Subheader (When toggled) */}
        {isSearching && (
          <div className="p-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              autoFocus
              placeholder="Search in this conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
            />
            {searchQuery && (
              <span className="text-[11px] text-slate-500 pr-2">
                {displayMessages.length} match{displayMessages.length !== 1 ? 'es' : ''}
              </span>
            )}
          </div>
        )}

        {/* Main Chat Body & Optional Participants Sidebar */}
        <div className="flex-1 flex overflow-hidden bg-slate-50 relative">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {displayMessages.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                {searchQuery ? 'No messages match your search keyword.' : 'No messages yet. Send a note to break the ice!'}
              </div>
            ) : (
              displayMessages.map((msg) => {
                const isMe = msg.authorId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                  >
                    {/* Author & Timestamp */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                      {!isMe && <span className="font-bold text-slate-700">{msg.authorName}</span>}
                      {!isMe && msg.authorRole && (
                        <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 text-[10px] font-semibold">
                          {msg.authorRole}
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                      {msg.isReported && (
                        <span className="text-rose-500 text-[10px] font-bold flex items-center gap-0.5">
                          <Flag className="w-3 h-3" /> Flagged
                        </span>
                      )}
                    </div>

                    {/* Message Bubble Container */}
                    <div className="relative max-w-[85%] sm:max-w-[75%]">
                      {/* Quoted Reply Preview */}
                      {msg.replyTo && (
                        <div className={`p-2 rounded-t-xl text-[11px] border-l-4 ${
                          isMe 
                            ? 'bg-sky-800 text-sky-100 border-amber-300' 
                            : 'bg-slate-200 text-slate-700 border-sky-600'
                        }`}>
                          <div className="font-bold text-[10px] opacity-80">{msg.replyTo.authorName}</div>
                          <div className="truncate">{msg.replyTo.content}</div>
                        </div>
                      )}

                      {/* Primary Bubble */}
                      <div className={`p-3.5 rounded-2xl shadow-2xs text-xs sm:text-sm leading-relaxed ${
                        msg.replyTo ? 'rounded-t-none' : ''
                      } ${
                        isMe
                          ? 'bg-sky-600 text-white rounded-tr-xs'
                          : msg.isAlert
                          ? 'bg-amber-50 text-slate-900 border border-amber-200 rounded-tl-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                      }`}>
                        {msg.content}

                        {/* Shared Material Attachment Card */}
                        {msg.sharedMaterial && (
                          <div className={`mt-2 p-3 rounded-xl border flex items-center justify-between gap-3 ${
                            isMe ? 'bg-sky-700/60 border-sky-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}>
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className={`w-5 h-5 shrink-0 ${isMe ? 'text-amber-300' : 'text-sky-600'}`} />
                              <div className="truncate">
                                <div className="font-bold text-xs truncate">{msg.sharedMaterial.title}</div>
                                <div className="text-[10px] opacity-80 font-mono truncate">
                                  {msg.sharedMaterial.fileName} • {msg.sharedMaterial.courseCode}
                                </div>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md shrink-0 uppercase ${
                              isMe ? 'bg-sky-800 text-sky-100' : 'bg-sky-100 text-sky-800'
                            }`}>
                              {msg.sharedMaterial.fileType}
                            </span>
                          </div>
                        )}

                        {/* Shared Web Link Card */}
                        {msg.sharedLink && (
                          <a
                            href={msg.sharedLink.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`mt-2 p-2.5 rounded-xl border flex items-center justify-between gap-2 block hover:underline ${
                              isMe ? 'bg-sky-700/60 border-sky-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="truncate">
                              <div className="font-bold text-xs truncate">{msg.sharedLink.title || msg.sharedLink.url}</div>
                              <div className="text-[10px] opacity-80 truncate">{msg.sharedLink.url}</div>
                            </div>
                            <ExternalLink className="w-4 h-4 shrink-0 opacity-70" />
                          </a>
                        )}
                      </div>

                      {/* Emoji Reactions display pill */}
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(msg.reactions).map(([emoji, users]) => (
                            <button
                              key={emoji}
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border transition-all ${
                                users.includes(currentUser.id)
                                  ? 'bg-sky-100 border-sky-400 text-sky-900'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span>{users.length}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Hover Action Bar: Reply, React, Report */}
                      <div className={`absolute top-1 ${
                        isMe ? '-left-20' : '-right-20'
                      } hidden group-hover:flex items-center gap-1 bg-white border border-slate-200 rounded-xl shadow-xs p-1 text-slate-500`}>
                        <button
                          onClick={() => setReplyingTo(msg)}
                          className="p-1 hover:text-sky-600 rounded hover:bg-slate-100"
                          title="Reply to message"
                        >
                          <CornerUpLeft className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick reaction 👍 */}
                        <button
                          onClick={() => handleToggleReaction(msg.id, '👍')}
                          className="p-1 hover:text-amber-500 rounded hover:bg-slate-100"
                          title="Thumbs up"
                        >
                          👍
                        </button>

                        {/* Quick reaction ❤️ */}
                        <button
                          onClick={() => handleToggleReaction(msg.id, '❤️')}
                          className="p-1 hover:text-rose-500 rounded hover:bg-slate-100"
                          title="Love"
                        >
                          ❤️
                        </button>

                        <button
                          onClick={() => setReportingMessageId(msg.id)}
                          className="p-1 hover:text-rose-600 rounded hover:bg-slate-100"
                          title="Report message"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Group Participants Slideout Drawer */}
          {showParticipants && group && (
            <div className="w-64 border-l border-slate-200 bg-white p-4 overflow-y-auto space-y-4 shrink-0 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-600" /> Pod Members ({group.members.length})
                </h3>
                <button onClick={() => setShowParticipants(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {group.members.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 truncate">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-xl bg-sky-900 text-amber-300 flex items-center justify-center font-bold text-xs">
                          {member.name.charAt(0)}
                        </div>
                        {member.isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-800 truncate">{member.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {member.role === 'leader' ? '⭐ Pod Leader' : member.programme || 'Student'}
                        </div>
                      </div>
                    </div>

                    {member.userId !== currentUser.id && onOpenDirectChatFromMember && (
                      <button
                        onClick={() => onOpenDirectChatFromMember(member.userId, member.name)}
                        className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors shrink-0"
                        title={`Direct message ${member.name}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleShareToWhatsApp}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Invite via WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quoted Message Preview Bar */}
        {replyingTo && (
          <div className="px-4 py-2 bg-sky-50 border-t border-sky-200 flex items-center justify-between text-xs text-sky-900 shrink-0">
            <div className="flex items-center gap-2 truncate">
              <CornerUpLeft className="w-4 h-4 text-sky-600 shrink-0" />
              <div className="truncate">
                Replying to <strong>{replyingTo.authorName}</strong>: <span className="italic truncate">{replyingTo.content.slice(0, 60)}</span>
              </div>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1 hover:text-sky-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Link Attachment Input Bar */}
        {showLinkInput && (
          <div className="p-3 bg-slate-100 border-t border-slate-200 space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-sky-600" /> Share Resource URL
              </span>
              <button onClick={() => setShowLinkInput(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="url"
                placeholder="https://example.com/notes..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="sm:col-span-2 text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Link Title (optional)"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAttachLink}
                  className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Study Material Picker Popover */}
        {showMaterialPicker && (
          <div className="p-3 bg-slate-100 border-t border-slate-200 space-y-2 max-h-48 overflow-y-auto shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-sky-600" /> Pick Study Material to Attach
              </span>
              <button onClick={() => setShowMaterialPicker(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableMaterials.map((mat) => (
                <div
                  key={mat.id}
                  onClick={() => handleAttachMaterial(mat)}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-sky-500 cursor-pointer flex items-center justify-between gap-2 transition-all hover:shadow-xs"
                >
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-800 truncate">{mat.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{mat.fileName} • {mat.courseCode}</div>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 uppercase shrink-0">
                    {mat.fileType}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            {/* Quick Attach Material Button */}
            <button
              type="button"
              onClick={() => setShowMaterialPicker(!showMaterialPicker)}
              className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-slate-100 transition-colors"
              title="Attach course study material"
            >
              <FileText className="w-5 h-5" />
            </button>

            {/* Quick Attach Link Button */}
            <button
              type="button"
              onClick={() => setShowLinkInput(!showLinkInput)}
              className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-slate-100 transition-colors"
              title="Attach web link"
            >
              <LinkIcon className="w-5 h-5" />
            </button>

            {/* Main Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isBlocked ? 'You have blocked this contact.' : 'Type your message or discussion note...'}
              disabled={isBlocked}
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white disabled:opacity-50"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isBlocked}
              className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white font-bold transition-all shadow-xs active:scale-95 shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Report Inappropriate Message Modal */}
        {reportingMessageId && (
          <div 
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70"
            onClick={() => setReportingMessageId(null)}
          >
            <div 
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 text-rose-600 mb-3">
                <Flag className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Report Inappropriate Message</h3>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                CampusFlow TZ maintains academic integrity and respectful student communication. Please specify the violation:
              </p>

              <div className="space-y-2 mb-4">
                {[
                  'Spam or advertising',
                  'Academic dishonesty / exam cheating',
                  'Harassment or disrespectful language',
                  'Misinformation or false class notice'
                ].map((reason) => (
                  <label key={reason} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={reportReason === reason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="text-rose-600"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReportingMessageId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteReport}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
