import React from 'react';
import { 
  X, 
  Sparkles, 
  Clock, 
  Cpu, 
  RefreshCw, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  Zap,
  Globe2,
  Database
} from 'lucide-react';
import { TimeService } from '../services/timeService';

interface FeedInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastFetchedTime?: number;
  lastFetched?: number;
  feedMode?: string;
  detectedSubject?: string;
  activeCategory?: string;
  programmeName?: string;
  onRefreshNow?: () => void;
  onTriggerRefresh?: () => void;
  isRefreshing?: boolean;
}

export const FeedInfoModal: React.FC<FeedInfoModalProps> = ({
  isOpen,
  onClose,
  lastFetchedTime,
  lastFetched,
  feedMode = 'gemini_ai_live',
  detectedSubject = 'science',
  activeCategory,
  programmeName = 'General Academic Programme',
  onRefreshNow,
  onTriggerRefresh,
  isRefreshing = false,
}) => {
  if (!isOpen) return null;

  const actualLastFetched = lastFetchedTime ?? lastFetched;
  const actualRefresh = onRefreshNow ?? onTriggerRefresh ?? (() => {});
  const displaySubject = activeCategory ?? detectedSubject;

  const formattedLastFetch = actualLastFetched && actualLastFetched > 0
    ? TimeService.formatInEAT(new Date(actualLastFetched), {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: 'numeric',
        month: 'short',
        hour12: true,
      }) + ' EAT'
    : 'Recently cached';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full my-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Live Academic Feed Architecture
              </h2>
              <p className="text-xs text-slate-300">
                AI Sourcing, Update Cadence & Field Detection
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Status Strip */}
        <div className="px-4 sm:px-6 py-3 bg-sky-50/80 border-b border-sky-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-slate-900">
              {feedMode.includes('gemini') ? 'AI-Engine Active (Gemini)' : 'Curated Peer-Reviewed Fallback'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-medium">Last Sync: {formattedLastFetch}</span>
          </div>

          <button
            onClick={onRefreshNow}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg bg-sky-800 hover:bg-sky-900 text-white font-bold flex items-center gap-1.5 text-xs shadow-2xs transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Fetching AI Feeds...' : 'Refresh Feeds Now'}</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs sm:text-sm text-slate-700 leading-relaxed">
          
          {/* Question 1: How are feeds coming and fetched? */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="font-black text-slate-900 flex items-center gap-2 text-sm">
              <Cpu className="w-4 h-4 text-sky-700" />
              1. How are feeds fetched?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When you load the app, CampusFlow analyzes your active student profile:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><b>Field & Degree Detection:</b> Identified as <b>{programmeName}</b> (Field: <span className="uppercase font-bold text-sky-800">{detectedSubject}</span>).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><b>Course Syllabus Context:</b> Current registered course codes are forwarded to our backend.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><b>Secure Server AI Generation:</b> The backend endpoint (<code>/api/feed/personalized</code>) queries Google Gemini to synthesize relevant research breakthroughs, clinical trials, or jurisprudence precedents customized for your field.</span>
              </li>
            </ul>
          </div>

          {/* Question 2: How often are they fetched? */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="font-black text-slate-900 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-amber-600" />
              2. How often are feeds updated?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="font-bold text-slate-900 block">Every 20 Minutes</span>
                <span className="text-slate-500 text-[11px] leading-tight block mt-0.5">
                  Automated background polling cadence while the application is active.
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="font-bold text-slate-900 block">On Subject Switch</span>
                <span className="text-slate-500 text-[11px] leading-tight block mt-0.5">
                  Clicking Law, Science, Tech, or Health pills fetches relevant disciplinary news immediately.
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="font-bold text-slate-900 block">On Demand (Manual)</span>
                <span className="text-slate-500 text-[11px] leading-tight block mt-0.5">
                  Students and lecturers can click <b>"Refresh Feeds"</b> anytime.
                </span>
              </div>
            </div>
          </div>

          {/* Question 3: Offline Bundling & Low Data Use */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="font-black text-slate-900 flex items-center gap-2 text-sm">
              <Database className="w-4 h-4 text-emerald-600" />
              3. Offline & Mobile Data Protection
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To minimize mobile internet bundle costs in East Africa, all articles and discussion points are cached locally in your browser/device storage. If your internet connection drops, you can continue reading and sharing previously retrieved articles offline.
            </p>
          </div>

          {/* Question 4: Harmonized Rules Across Devices */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="font-black text-slate-900 flex items-center gap-2 text-sm">
              <Globe2 className="w-4 h-4 text-purple-600" />
              4. Unified Principles Across Phone, Tablet & PC
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              CampusFlow TZ is a single, cohesive academic platform. Whether you open it on a smartphone, tablet, or laptop:
            </p>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• <b>Same User Permissions & Roles:</b> Student, Lecturer, CR, and Admin permissions are identical across devices.</li>
              <li>• <b>Same Clock & Time System:</b> All users observe East Africa Time (EAT) for lecture slots and deadlines.</li>
              <li>• <b>Responsive Display Tailoring:</b> The visual layout fluidly adapts for thumbs on mobile or multi-column widescreen on desktop.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-medium">
            CampusFlow TZ • Academic Feeds v2.5
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
