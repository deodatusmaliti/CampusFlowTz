import React, { useState } from 'react';
import { Award, Check, Sparkles, X, Users } from 'lucide-react';
import { EndorsementTargetType, EndorsementRecord, User } from '../types';
import { StorageService } from '../services/storageService';

interface EndorsementButtonProps {
  targetId: string;
  targetType: EndorsementTargetType;
  targetTitle: string;
  currentUser: User;
  onNotify?: (msg: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EndorsementButton: React.FC<EndorsementButtonProps> = ({
  targetId,
  targetType,
  targetTitle,
  currentUser,
  onNotify,
  className = '',
  size = 'md',
}) => {
  const [hasEndorsed, setHasEndorsed] = useState<boolean>(() => 
    StorageService.hasUserEndorsed(targetId, currentUser.id)
  );
  const [count, setCount] = useState<number>(() => 
    StorageService.getEndorsementCount(targetId)
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');
  const [endorsementsList, setEndorsementsList] = useState<EndorsementRecord[]>([]);

  const handleOpenListOrAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    const all = StorageService.getEndorsements().filter(e => e.targetId === targetId);
    setEndorsementsList(all);
    setShowModal(true);
  };

  const handleToggleEndorsement = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (hasEndorsed) {
      // Remove endorsement
      const updated = StorageService.removeEndorsement(targetId, currentUser.id);
      setHasEndorsed(false);
      setCount(updated.filter(e => e.targetId === targetId).length);
      setEndorsementsList(updated.filter(e => e.targetId === targetId));
      onNotify?.(`Endorsement removed from "${targetTitle}".`);
    } else {
      // Add endorsement
      const updated = StorageService.addEndorsement({
        targetId,
        targetType,
        targetTitle,
        endorsedByUserId: currentUser.id,
        endorsedByUserName: currentUser.name,
        endorsedByUserRole: currentUser.role,
        endorsementNote: note.trim() || undefined,
      });
      setHasEndorsed(true);
      setCount(updated.filter(e => e.targetId === targetId).length);
      setEndorsementsList(updated.filter(e => e.targetId === targetId));
      setNote('');
      onNotify?.(`Successfully endorsed "${targetTitle}"!`);
    }
  };

  const btnPadding = size === 'sm' ? 'px-2.5 py-1 text-xs' : size === 'lg' ? 'px-4 py-2.5 text-sm' : 'px-3 py-1.5 text-xs';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <>
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <button
          type="button"
          onClick={handleToggleEndorsement}
          className={`inline-flex items-center gap-1.5 font-bold rounded-xl transition-all shadow-2xs active:scale-95 ${btnPadding} ${
            hasEndorsed
              ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
              : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 border border-transparent'
          }`}
          title={hasEndorsed ? 'Click to remove endorsement' : 'Click to endorse this ' + targetType}
        >
          <Award className={`${iconSize} ${hasEndorsed ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`} />
          <span>{hasEndorsed ? 'Endorsed' : 'Endorse'}</span>
        </button>

        {/* Counter & Peer List Trigger */}
        <button
          type="button"
          onClick={handleOpenListOrAction}
          className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
            count > 0 
              ? 'bg-amber-100/70 text-amber-900 hover:bg-amber-200' 
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
          title="View peer endorsements"
        >
          <Users className="w-3 h-3 text-amber-700" />
          <span>{count}</span>
        </button>
      </div>

      {/* Peer Endorsement Details Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-xs"
          onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Academic Endorsements</h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-[240px]">{targetTitle}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Box */}
            <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              {hasEndorsed ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>You have endorsed this {targetType}</span>
                  </div>
                  <button
                    onClick={() => handleToggleEndorsement()}
                    className="px-2.5 py-1 text-xs text-rose-700 hover:bg-rose-50 rounded-lg font-medium border border-rose-200"
                  >
                    Un-endorse
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-700">
                    Add your academic endorsement for this {targetType}:
                  </div>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional short note (e.g. Great teaching, clear notes...)"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                  />
                  <button
                    onClick={() => handleToggleEndorsement()}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>Submit Endorsement</span>
                  </button>
                </div>
              )}
            </div>

            {/* Endorsers List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Endorsed by ({endorsementsList.length})
              </div>
              {endorsementsList.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No endorsements recorded yet. Be the first to endorse!
                </div>
              ) : (
                endorsementsList.map(rec => (
                  <div key={rec.id} className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{rec.endorsedByUserName}</span>
                      <span className="text-[10px] text-slate-400 capitalize">{rec.endorsedByUserRole} • {rec.timestamp.split(' ')[0]}</span>
                    </div>
                    {rec.endorsementNote && (
                      <p className="text-slate-600 text-[11px] italic bg-slate-50 p-1.5 rounded-md">
                        "{rec.endorsementNote}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
