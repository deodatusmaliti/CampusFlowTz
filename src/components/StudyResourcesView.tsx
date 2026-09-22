import React, { useState, useMemo } from 'react';
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
  GraduationCap,
  Scale,
  Cpu,
  TrendingUp,
  Stethoscope,
  Globe2,
  BookCheck,
  ArrowRight
} from 'lucide-react';
import { Course, StudyResource, ScientificBreakthrough, User, AcademicSubjectCategory } from '../types';
import { StorageService } from '../services/storageService';

interface StudyResourcesViewProps {
  currentUser: User;
  courses: Course[];
  resources: StudyResource[];
  breakthroughs: ScientificBreakthrough[];
  onShareToCourseChat: (courseCode: string, text: string) => void;
  onOpenFeedStory?: (story: ScientificBreakthrough) => void;
  onNotify: (msg: string) => void;
}

export const StudyResourcesView: React.FC<StudyResourcesViewProps> = ({
  currentUser,
  courses,
  resources,
  breakthroughs: initialBreakthroughs,
  onShareToCourseChat,
  onOpenFeedStory,
  onNotify,
}) => {
  const [breakthroughs, setBreakthroughs] = useState<ScientificBreakthrough[]>(initialBreakthroughs);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<AcademicSubjectCategory | 'all'>('all');
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
    const text = `💡 Academic Feed Discussion [${b.field}]: "${b.headline}" — ${b.discussionPrompt}`;
    onShareToCourseChat(targetCourse, text);
    onNotify(`Breakthrough shared to ${targetCourse} course mates space!`);
  };

  const filteredMaterials = useMemo(() => {
    return resources.filter((res) => {
      const matchesCourse = selectedCourseFilter === 'all' || res.courseCode.toLowerCase() === selectedCourseFilter.toLowerCase();
      const matchesQuery = searchQuery === '' || 
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCourse && matchesQuery;
    });
  }, [resources, selectedCourseFilter, searchQuery]);

  const filteredBreakthroughs = useMemo(() => {
    return breakthroughs.filter((b) => {
      const matchesCourse = selectedCourseFilter === 'all' || b.relevantCourses.includes(selectedCourseFilter);
      const matchesSubject = selectedSubjectFilter === 'all' || b.subjectCategory === selectedSubjectFilter;
      const matchesQuery = searchQuery === '' || 
        b.headline.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.field.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCourse && matchesSubject && matchesQuery;
    });
  }, [breakthroughs, selectedCourseFilter, selectedSubjectFilter, searchQuery]);

  const getSubjectBadge = (cat?: AcademicSubjectCategory) => {
    switch (cat) {
      case 'law':
        return { label: 'Law & Justice', bg: 'bg-amber-100 text-amber-950 border-amber-300' };
      case 'science':
        return { label: 'Life Sciences', bg: 'bg-emerald-100 text-emerald-950 border-emerald-300' };
      case 'engineering':
        return { label: 'Engineering & Tech', bg: 'bg-blue-100 text-blue-950 border-blue-300' };
      case 'business':
        return { label: 'Business & Finance', bg: 'bg-purple-100 text-purple-950 border-purple-300' };
      case 'health':
        return { label: 'Medicine & Health', bg: 'bg-rose-100 text-rose-950 border-rose-300' };
      case 'humanities':
        return { label: 'Humanities', bg: 'bg-indigo-100 text-indigo-950 border-indigo-300' };
      default:
        return { label: 'Academic Feed', bg: 'bg-sky-100 text-sky-950 border-sky-300' };
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-sky-900 text-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-amber-300 font-bold text-xs mb-2 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" /> Intelligent Course Discovery & Knowledge Feed
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">
            Academic Feeds, Research & Study Resources
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1.5 leading-relaxed font-medium">
            Curated textbooks, past papers, legal rulings, clinical protocols, and live research developments across all faculties at {currentUser.university}.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('breakthroughs')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'breakthroughs'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🚀 Global Subject Feeds ({breakthroughs.length})
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'materials'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              📚 Textbooks & Past Papers ({resources.length})
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search topic, title, law, or science..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-600 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
            <span className="text-xs font-bold text-slate-700 shrink-0">Course:</span>
            <button
              onClick={() => setSelectedCourseFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                selectedCourseFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                    ? 'bg-sky-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c.code}
              </button>
            ))}
          </div>
        </div>

        {/* Tab-specific secondary subject pills */}
        {activeTab === 'breakthroughs' && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-bold">
            <span className="text-slate-500 text-[11px] shrink-0">Faculty Filter:</span>
            <button
              onClick={() => setSelectedSubjectFilter('all')}
              className={`px-2.5 py-1 rounded-lg shrink-0 ${
                selectedSubjectFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All ({breakthroughs.length})
            </button>
            <button
              onClick={() => setSelectedSubjectFilter('law')}
              className={`px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 ${
                selectedSubjectFilter === 'law' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Scale className="w-3 h-3" /> Law
            </button>
            <button
              onClick={() => setSelectedSubjectFilter('science')}
              className={`px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 ${
                selectedSubjectFilter === 'science' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Dna className="w-3 h-3" /> Science
            </button>
            <button
              onClick={() => setSelectedSubjectFilter('engineering')}
              className={`px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 ${
                selectedSubjectFilter === 'engineering' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <Cpu className="w-3 h-3" /> Engineering
            </button>
            <button
              onClick={() => setSelectedSubjectFilter('business')}
              className={`px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 ${
                selectedSubjectFilter === 'business' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <TrendingUp className="w-3 h-3" /> Business
            </button>
            <button
              onClick={() => setSelectedSubjectFilter('health')}
              className={`px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 ${
                selectedSubjectFilter === 'health' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <Stethoscope className="w-3 h-3" /> Health
            </button>
            <button
              onClick={() => setSelectedSubjectFilter('humanities')}
              className={`px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 ${
                selectedSubjectFilter === 'humanities' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <Globe2 className="w-3 h-3" /> Humanities
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Live Breakthroughs & Innovation Feed */}
      {activeTab === 'breakthroughs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Academic Feeds & Research Developments
            </h2>
            <span className="text-xs text-slate-600 font-semibold">Click any card to read full article</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBreakthroughs.map((item) => {
              const isSaved = savedNotes.includes(item.id);
              const badge = getSubjectBadge(item.subjectCategory);

              return (
                <div
                  key={item.id}
                  onClick={() => onOpenFeedStory && onOpenFeedStory(item)}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-sky-500 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs font-bold text-slate-700">{item.field}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {item.readingTime || '4 min'} • {item.publishedDate}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-slate-900 mt-2.5 leading-snug group-hover:text-sky-800 transition-colors">
                      {item.headline}
                    </h3>

                    <p className="text-xs text-slate-700 mt-2 leading-relaxed font-normal line-clamp-3">
                      {item.summary}
                    </p>

                    {/* Interactive Discussion Prompt */}
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> Exam & Assignment Discussion Question:
                      </div>
                      <p className="text-xs text-slate-700 mt-1 italic font-medium">
                        "{item.discussionPrompt}"
                      </p>
                    </div>

                    {/* Relevant Courses Pills */}
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Relevant to:</span>
                      {item.relevantCourses.map((code) => (
                        <span
                          key={code}
                          className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 font-bold text-[10px] border border-sky-200"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpvote(item.id);
                        }}
                        className="flex items-center gap-1 text-slate-700 hover:text-sky-800 font-bold"
                        title="Helpful for study"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> {item.upvotes}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmark(item.id, item.headline);
                        }}
                        className={`flex items-center gap-1 font-bold ${
                          isSaved ? 'text-amber-700' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" /> {isSaved ? 'Saved' : 'Bookmark'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareBreakthrough(item);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold flex items-center gap-1 transition-colors border border-emerald-200 text-[11px]"
                        title="Share with course mates"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Discuss with Mates
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenFeedStory) onOpenFeedStory(item);
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1 text-[11px] shadow-xs"
                      >
                        <span>Read Story</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
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
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-700" /> Recommended Academic Materials & Past Papers
            </h2>
            <span className="text-xs text-slate-600 font-semibold">Free Open Access & Syllabus Aligned</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 font-bold text-[11px] border border-sky-200">
                      {res.courseCode}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {res.type.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 mt-2.5 leading-snug">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-normal">
                    {res.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {res.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">{res.fileSize || 'PDF'}</span>
                  <a
                    href={res.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <span>Access Resource</span>
                    <ExternalLink className="w-3.5 h-3.5" />
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
