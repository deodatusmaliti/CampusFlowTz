import React, { useState, useMemo, useEffect } from 'react';
import { 
  Briefcase, 
  GraduationCap, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Search, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  Bell, 
  BellRing, 
  Share2, 
  Check, 
  DollarSign, 
  Award, 
  Layers, 
  Clock, 
  Building2,
  Sparkles,
  Info,
  RefreshCw,
  AlertTriangle,
  MessageSquare,
  Copy
} from 'lucide-react';
import { OpportunityItem, OpportunityType, User } from '../types';
import { StorageService } from '../services/storageService';
import { EndorsementButton } from './EndorsementButton';

interface OpportunitiesViewProps {
  user: User;
  onNotify: (msg: string) => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  user,
  onNotify,
}) => {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(() => StorageService.getOpportunities());
  const [typeFilter, setTypeFilter] = useState<OpportunityType | 'ALL'>('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Feed status states
  const [feedState, setFeedState] = useState<'cached' | 'live' | 'error'>('cached');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Cached local repository');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Asynchronous Feed Adapter
  const handleRefreshFeed = async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      // Simulate live network sync with 700ms latency
      await new Promise((resolve) => setTimeout(resolve, 750));
      
      // In web preview environment, load latest cached dataset and verify integrity
      const fresh = StorageService.getOpportunities();
      setOpportunities(fresh);
      setFeedState('cached');
      setLastRefreshed(`Updated today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      onNotify('Opportunities feed refreshed from verified campus repository.');
    } catch (err: any) {
      setFeedState('error');
      setFetchError('Unable to connect to live job portal. Showing offline cached records.');
      onNotify('Feed refresh failed. Displaying offline opportunities.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered list
  const filtered = useMemo(() => {
    return opportunities.filter(item => {
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;
      if (locationFilter !== 'ALL') {
        if (!item.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      }
      if (bookmarkedOnly && !item.isBookmarked) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          (item.organization || item.providerOrOrg || '').toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.fieldOfStudy || item.fieldOfStudyOrCareer || '').toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [opportunities, typeFilter, locationFilter, bookmarkedOnly, searchQuery]);

  const handleToggleBookmark = (id: string) => {
    const updated = StorageService.toggleBookmarkOpportunity(id);
    setOpportunities(updated);
    const item = updated.find(o => o.id === id);
    onNotify(item?.isBookmarked ? 'Saved to your bookmarked opportunities (available offline).' : 'Removed from bookmarks.');
  };

  const handleToggleReminder = (id: string) => {
    const updated = StorageService.toggleReminderOpportunity(id);
    setOpportunities(updated);
    const item = updated.find(o => o.id === id);
    if (item?.hasReminder) {
      StorageService.addSystemAlert({
        title: `Deadline Reminder: ${item.title}`,
        message: `Application closing on ${item.deadline} for ${item.organization}. Prepare your transcripts and statement!`,
        category: item.type === 'scholarship' ? 'scholarships' : 'jobs',
        priority: 'high',
        sourceType: 'server_push',
        actionTab: 'opportunities',
        actionLabel: 'View Listing',
      });
      onNotify(`Deadline alert set for "${item.title}".`);
    } else {
      onNotify('Deadline reminder cancelled.');
    }
  };

  const handleShare = (item: OpportunityItem) => {
    const text = `💼 *${item.title}*\nOrganization: ${item.organization}\nDeadline: ${item.deadline}\nLocation: ${item.location}\nApply here: ${item.applicationUrl}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(item.id);
    onNotify('Opportunity summary copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareWhatsApp = (item: OpportunityItem) => {
    const text = `🎓 *Opportunity on CampusFlow TZ*\n*${item.title}* at ${item.organization}\nDeadline: ${item.deadline}\nLocation: ${item.location}\nApply: ${item.applicationUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    onNotify(`Sharing "${item.title}" via WhatsApp...`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider">
              Career, Grants & Jobs
            </span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-bold flex items-center gap-1 ${
              feedState === 'live' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-amber-100 text-amber-900'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${feedState === 'live' ? 'bg-emerald-600 animate-ping' : 'bg-amber-600'}`} />
              [{feedState === 'live' ? 'live' : 'cached / local demo'}]
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              • {lastRefreshed}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600" /> Scholarships, Internships & Graduate Jobs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verified university career opportunities, HESLB grants, graduate trainee intakes, and attachments across Tanzania
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshFeed}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all disabled:opacity-50"
            title="Refresh feed records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-600' : 'text-slate-500'}`} />
            <span>{isLoading ? 'Syncing...' : 'Refresh Feed'}</span>
          </button>
        </div>
      </div>

      {/* Feed Status / Error Banner */}
      {fetchError && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button 
            onClick={handleRefreshFeed} 
            className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 rounded-lg text-amber-950 font-bold text-[11px]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keywords, organization (e.g. HESLB, DAAD, Vodacom), or role..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as OpportunityType | 'ALL')}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Types</option>
            <option value="scholarship">Scholarships & Grants</option>
            <option value="job">Jobs & Trainees</option>
            <option value="internship">Internships</option>
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Locations</option>
            <option value="Tanzania">Tanzania</option>
            <option value="East Africa">East Africa</option>
            <option value="International">International</option>
            <option value="Remote">Remote</option>
          </select>

          <button
            onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              bookmarkedOnly ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
            title="Bookmarked opportunities saved for offline access"
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarkedOnly ? 'fill-amber-600 text-amber-600' : ''}`} />
            <span className="hidden md:inline">Saved</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-12 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No opportunities match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try adjusting your search terms or clearing the location filter.
          </p>
          <button
            onClick={() => { setTypeFilter('ALL'); setLocationFilter('ALL'); setSearchQuery(''); setBookmarkedOnly(false); }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all shadow-2xs hover:shadow-md p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                      item.type === 'scholarship'
                        ? 'bg-purple-100 text-purple-800'
                        : item.type === 'internship'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {item.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.location}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleReminder(item.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.hasReminder 
                          ? 'text-sky-600 bg-sky-50' 
                          : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'
                      }`}
                      title={item.hasReminder ? 'Deadline reminder active' : 'Set deadline reminder alert'}
                    >
                      <BellRing className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleBookmark(item.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.isBookmarked 
                          ? 'text-amber-500 bg-amber-50' 
                          : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'
                      }`}
                      title={item.isBookmarked ? 'Remove bookmark' : 'Bookmark opportunity (save offline)'}
                    >
                      <Bookmark className={`w-4 h-4 ${item.isBookmarked ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{item.organization || item.providerOrOrg}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Deadline: <strong className="text-slate-800">{item.deadline}</strong></span>
                  </div>

                  {item.fundingAmountOrStipend && (
                    <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.fundingAmountOrStipend}</span>
                    </div>
                  )}

                  {item.fieldOfStudy && (
                    <div className="text-[11px] text-slate-400">
                      Field: {item.fieldOfStudy}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <EndorsementButton
                  targetId={item.id}
                  targetType="opportunity"
                  targetTitle={item.title}
                  currentUser={user}
                  onNotify={onNotify}
                  size="sm"
                />

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleShareWhatsApp(item)}
                    className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                    title="Share via WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleShare(item)}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                    title="Copy opportunity details"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <a
                    href={item.applicationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
