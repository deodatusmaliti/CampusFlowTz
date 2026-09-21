import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ExternalLink, 
  Share2, 
  Bookmark, 
  ThumbsUp, 
  Search, 
  Filter, 
  Lightbulb, 
  Rocket, 
  Activity, 
  Dna, 
  SunMedium, 
  Layers, 
  CheckCircle2, 
  MessageSquare,
  HelpCircle,
  GraduationCap
} from 'lucide-react';
import { Course, StudyResource, ScientificBreakthrough, User } from '../types';
import { StorageService } from '../services/storageService';

interface StudyResourcesViewProps {
  currentUser: User;
  courses: Course[];
  resources: StudyResource[];
  breakthroughs: ScientificBreakthrough[];
  onShareToCourseChat: (courseCode: string, text: string) => void;
  onNotify: (msg: string) => void;
}

export const StudyResourcesView: React.FC<StudyResourcesViewProps> = ({
  currentUser,
  courses,
  resources,
  breakthroughs: initialBreakthroughs,
  onShareToCourseChat,
  onNotify,
}) => {
  const [breakthroughs, setBreakthroughs] = useState<ScientificBreakthrough[]>(initialBreakthroughs);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'breakthroughs' | 'materials'>('breakthroughs');

  const handleUpvote = (id: string) => {
    const updated = StorageService.upvoteBreakthrough(id);
    setBreakthroughs(updated);
    onNotify('Voted breakthrough as helpful to academic studies!');
  };

  const handleBookmark = (id: string, title: string) => {
    if (savedNotes.includes(id)) {
      setSavedNotes(savedNotes.filter(item => item !== id));
      onNotify(`Removed "${title.substring(0, 30)}..." from bookmarks.`);
    } else {
      setSavedNotes([...savedNotes, id]);
      onNotify(`Saved "${title.substring(0, 30)}..." to your Personal Study Notes!`);
    }
  };

  const handleShareBreakthrough = (b: ScientificBreakthrough) => {
    const targetCourse = b.relevantCourses[0] || courses[0]?.code || 'BIO 203';
    const text = `💡 Scientific Discovery Discussion [${b.field}]: "${b.headline}" — ${b.discussionPrompt}`;
    onShareToCourseChat(targetCourse, text);
    onNotify(`Breakthrough shared to ${targetCourse} course mates space!`);
  };

  const filteredMaterials = resources.filter((res) => {
    const matchesCourse = selectedCourseFilter === 'all' || res.courseCode.toLowerCase() === selectedCourseFilter.toLowerCase();
    const matchesQuery = searchQuery === '' || 
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCourse && matchesQuery;
  });

  const filteredBreakthroughs = breakthroughs.filter((b) => {
    const matchesCourse = selectedCourseFilter === 'all' || b.relevantCourses.includes(selectedCourseFilter);
    const matchesQuery = searchQuery === '' || 
      b.headline.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.field.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesQuery;
  });

  const getFieldIcon = (field: string) => {
    if (field.toLowerCase().includes('space')) return <Rocket className="w-4 h-4 text-purple-600" />;
    if (field.toLowerCase().includes('telemedicine') || field.toLowerCase().includes('health')) return <Activity className="w-4 h-4 text-emerald-600" />;
    if (field.toLowerCase().includes('genomics') || field.toLowerCase().includes('crispr')) return <Dna className="w-4 h-4 text-sky-600" />;
    return <SunMedium className="w-4 h-4 text-amber-600" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#102d4f] via-[#17487a] to-[#1e6fa8] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#e6ad3d] font-bold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Intelligent Course Discovery & Knowledge Feed
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Study Resources & Science Breakthroughs
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1.5 leading-relaxed">
            Curated open-access textbooks, past exam papers, and live scientific innovations tailored to your degree programme at {currentUser.university}.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('breakthroughs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'breakthroughs'
                  ? 'bg-[#e6ad3d] text-[#102d4f] shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🚀 Global Science & Tech Feed ({breakthroughs.length})
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'materials'
                  ? 'bg-[#e6ad3d] text-[#102d4f] shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              📚 Course Textbooks & Past Papers ({resources.length})
            </button>
          </div>
        </div>
      </div>

      {/* Course Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#d9e3ea] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search textbooks, topics, or breakthroughs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">Filter Course:</span>
          <button
            onClick={() => setSelectedCourseFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              selectedCourseFilter === 'all'
                ? 'bg-[#102d4f] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Courses
          </button>
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCourseFilter(c.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                selectedCourseFilter === c.code
                  ? 'bg-[#1e6fa8] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.code}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Live Breakthroughs & Innovation Feed */}
      {activeTab === 'breakthroughs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#102d4f] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#e6ad3d]" /> Live Scientific & Technological Breakthroughs
            </h2>
            <span className="text-xs text-slate-500">Updated today · Peer-reviewed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBreakthroughs.map((item) => {
              const isSaved = savedNotes.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-slate-100 flex items-center justify-center">
                          {getFieldIcon(item.field)}
                        </span>
                        <span className="text-xs font-bold text-slate-700">{item.field}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{item.publishedDate}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-[#102d4f] mt-3 leading-snug">
                      {item.headline}
                    </h3>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {item.summary}
                    </p>

                    {/* Interactive Discussion Prompt */}
                    <div className="mt-3.5 p-3 rounded-xl bg-[#f5f8fb] border border-sky-100">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#1e6fa8]">
                        <Lightbulb className="w-3.5 h-3.5" /> Exam & Assignment Discussion Question:
                      </div>
                      <p className="text-xs text-slate-700 mt-1 italic">
                        "{item.discussionPrompt}"
                      </p>
                    </div>

                    {/* Relevant Courses Pills */}
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Relevant to:</span>
                      {item.relevantCourses.map((code) => (
                        <span
                          key={code}
                          className="px-2 py-0.5 rounded-md bg-[#e5f2fb] text-[#1e6fa8] font-bold text-[10px]"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpvote(item.id)}
                        className="flex items-center gap-1 text-slate-600 hover:text-[#1e6fa8] font-bold"
                        title="Helpful for study"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> {item.upvotes}
                      </button>

                      <button
                        onClick={() => handleBookmark(item.id, item.headline)}
                        className={`flex items-center gap-1 font-bold ${
                          isSaved ? 'text-amber-600' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" /> {isSaved ? 'Saved' : 'Bookmark'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShareBreakthrough(item)}
                        className="px-2.5 py-1 rounded-lg bg-[#edf7f2] hover:bg-[#d8efe2] text-[#16845d] font-bold flex items-center gap-1 transition-colors"
                        title="Share with course mates"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Discuss with Mates
                      </button>

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                          title="Read full academic paper"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Curated Study Materials & Past Papers */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#102d4f] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1e6fa8]" /> Recommended Academic Materials & Past Papers
            </h2>
            <span className="text-xs text-slate-500">Free Open Access & Syllabus Aligned</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#e5f2fb] text-[#1e6fa8] font-black text-xs">
                      {res.courseCode}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                      {res.type.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#102d4f] mt-2.5 leading-snug">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Source: {res.source}
                  </p>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                    {res.description}
                  </p>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {res.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {res.readingTime && (
                    <span className="text-[11px] text-slate-400 font-semibold">{res.readingTime}</span>
                  )}

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#1e6fa8] hover:bg-[#185a8a] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    Open Resource <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
