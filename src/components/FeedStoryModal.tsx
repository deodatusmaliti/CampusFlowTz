import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  BookOpen, 
  ThumbsUp, 
  Clock, 
  Calendar, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Bookmark, 
  MessageSquare,
  Scale,
  Dna,
  Cpu,
  TrendingUp,
  Stethoscope,
  Globe2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Type
} from 'lucide-react';
import { ScientificBreakthrough, AcademicSubjectCategory } from '../types';

interface FeedStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedItem: ScientificBreakthrough | null;
  onUpvote?: (id: string) => void;
  onNotify: (msg: string) => void;
}

export const FeedStoryModal: React.FC<FeedStoryModalProps> = ({
  isOpen,
  onClose,
  feedItem,
  onUpvote,
  onNotify,
}) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [fontSize, setFontSize] = useState<'standard' | 'large'>('standard');

  // Stop speech if modal closes
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window) || !feedItem) {
      onNotify('Text-to-speech is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      onNotify('Audio narration stopped.');
    } else {
      window.speechSynthesis.cancel(); // Clear any ongoing
      const textToRead = `${feedItem.headline}. Field: ${feedItem.field}. Summary: ${feedItem.summary}. Full academic breakdown: ${feedItem.fullStory || feedItem.summary}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      onNotify('Playing audio narration of academic breakdown.');
    }
  };

  const handleCopyCitation = () => {
    if (!feedItem) return;
    const year = feedItem.publishedDate?.split('-')[0] || '2026';
    const citation = `${feedItem.source} (${year}). "${feedItem.headline}". CampusFlow Academic Research Index, Field: ${feedItem.field}. Course Connections: ${(feedItem.relevantCourses || []).join(', ')}.`;
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    onNotify('APA Citation copied to clipboard.');
    setTimeout(() => setCopiedCitation(false), 2500);
  };

  if (!isOpen || !feedItem) return null;

  const getSubjectBadge = (cat?: AcademicSubjectCategory) => {
    switch (cat) {
      case 'law':
        return {
          icon: <Scale className="w-3.5 h-3.5 text-amber-600" />,
          label: 'Law & Jurisprudence',
          bg: 'bg-amber-100 text-amber-900 border-amber-300'
        };
      case 'science':
        return {
          icon: <Dna className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Natural & Life Sciences',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300'
        };
      case 'engineering':
        return {
          icon: <Cpu className="w-3.5 h-3.5 text-blue-600" />,
          label: 'Engineering & Technology',
          bg: 'bg-blue-100 text-blue-900 border-blue-300'
        };
      case 'business':
        return {
          icon: <TrendingUp className="w-3.5 h-3.5 text-purple-600" />,
          label: 'Business & Economics',
          bg: 'bg-purple-100 text-purple-900 border-purple-300'
        };
      case 'health':
        return {
          icon: <Stethoscope className="w-3.5 h-3.5 text-rose-600" />,
          label: 'Health & Clinical Medicine',
          bg: 'bg-rose-100 text-rose-900 border-rose-300'
        };
      case 'humanities':
        return {
          icon: <Globe2 className="w-3.5 h-3.5 text-indigo-600" />,
          label: 'Humanities & Social Sciences',
          bg: 'bg-indigo-100 text-indigo-900 border-indigo-300'
        };
      default:
        return {
          icon: <BookOpen className="w-3.5 h-3.5 text-sky-600" />,
          label: 'Academic Updates & Research',
          bg: 'bg-sky-100 text-sky-900 border-sky-300'
        };
    }
  };

  const subjectInfo = getSubjectBadge(feedItem.subjectCategory);

  const handleShareWhatsApp = () => {
    const text = `📖 *${feedItem.headline}*\n\n` +
      `📌 *Field:* ${feedItem.field}\n` +
      `🏛️ *Source:* ${feedItem.source} (${feedItem.publishedDate})\n\n` +
      `💡 *Summary:* ${feedItem.summary}\n\n` +
      (feedItem.keyTakeaways ? `🎯 *Key Academic Takeaways:*\n${feedItem.keyTakeaways.map(k => `• ${k}`).join('\n')}\n\n` : '') +
      `💬 *Seminar Discussion Question:* ${feedItem.discussionPrompt}\n\n` +
      `Shared from CampusFlow TZ academic feeds.`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onNotify('Opening WhatsApp with article summary & discussion points.');
  };

  const handleUpvote = () => {
    if (!upvoted && onUpvote) {
      onUpvote(feedItem.id);
      setUpvoted(true);
      onNotify('Endorsed article for campus student feeds.');
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    onNotify(!bookmarked ? 'Saved article to your revision bookmarks.' : 'Removed from bookmarks.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-3 bg-[#fbfdff]">
          <div className="space-y-1.5 flex-1 pr-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${subjectInfo.bg}`}>
                {subjectInfo.icon}
                <span>{subjectInfo.label}</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {feedItem.readingTime}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {feedItem.headline}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-600 font-semibold pt-0.5">
              <span>{feedItem.source}</span>
              <span>•</span>
              <span>{feedItem.publishedDate}</span>
              <span>•</span>
              <span className="text-sky-800 font-bold">{feedItem.field}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 transition-colors"
            title="Close article"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Reader Academic Toolbar */}
        <div className="px-4 sm:px-6 py-2 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSpeech}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors border ${
                isSpeaking 
                  ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' 
                  : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title="Listen to full article narration via speech synthesis"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-700" /> : <Volume2 className="w-3.5 h-3.5 text-sky-700" />}
              <span>{isSpeaking ? 'Stop Narration' : 'Read Aloud'}</span>
            </button>

            <button
              onClick={handleCopyCitation}
              className="px-2.5 py-1 rounded-lg font-semibold bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 transition-colors"
              title="Copy academic APA citation for course assignments"
            >
              {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedCitation ? 'Citation Copied!' : 'Copy Citation'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-300">
            <button
              onClick={() => setFontSize('standard')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                fontSize === 'standard' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Standard reading font size"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                fontSize === 'large' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Enlarged font size for phone reading"
            >
              A+
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-slate-800 leading-relaxed ${
          fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm'
        }`}>
          {/* Executive Overview */}
          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-800 leading-relaxed">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-700" />
              Executive Academic Summary
            </h3>
            <p className="font-medium text-slate-900">{feedItem.summary}</p>
          </div>

          {/* Full Article Text */}
          <div className={`space-y-3 font-normal text-slate-800 leading-relaxed ${
            fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
          }`}>
            {feedItem.fullStory ? (
              feedItem.fullStory.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="leading-relaxed">
                {feedItem.summary} This breakthrough provides relevant clinical and technical insights applicable across undergraduate and postgraduate coursework.
              </p>
            )}
          </div>

          {/* Key Academic Takeaways */}
          {feedItem.keyTakeaways && feedItem.keyTakeaways.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Key Takeaways for Students & Research
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 font-medium">
                {feedItem.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-700 mt-2 shrink-0"></span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Readings & Case Studies */}
          {feedItem.recommendedReadings && feedItem.recommendedReadings.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#1e6fa8]" />
                Recommended Reading & Syllabus Connections
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {feedItem.recommendedReadings.map((reading, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 hover:border-sky-300 transition-colors">
                    <h5 className="font-bold text-xs text-slate-900 leading-snug">{reading.title}</h5>
                    {reading.source && <p className="text-[11px] text-slate-600 mt-0.5">{reading.source}</p>}
                    {reading.notes && <p className="text-[11px] text-sky-800 font-medium mt-1">{reading.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seminar & Exam Discussion Prompt */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
              Seminar & Tutorial Discussion Prompt
            </h4>
            <p className="text-xs sm:text-sm font-semibold text-amber-950">
              "{feedItem.discussionPrompt}"
            </p>
          </div>

          {/* Relevant Courses */}
          {feedItem.relevantCourses && feedItem.relevantCourses.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-600">Relevant Course Codes:</span>
              {feedItem.relevantCourses.map((code) => (
                <span
                  key={code}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200"
                >
                  {code}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Sticky Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-[#f8fafc] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpvote}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                upvoted 
                  ? 'bg-sky-50 text-sky-800 border-sky-300' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${upvoted ? 'text-sky-700 fill-sky-700' : 'text-slate-500'}`} />
              <span>{feedItem.upvotes + (upvoted ? 1 : 0)} Endorsements</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                bookmarked 
                  ? 'bg-amber-50 text-amber-900 border-amber-300' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'text-amber-700 fill-amber-700' : 'text-slate-500'}`} />
              <span>{bookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share to WhatsApp</span>
            </button>

            {feedItem.url && (
              <a
                href={feedItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1 transition-colors"
                title="Open primary research source"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Source</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
