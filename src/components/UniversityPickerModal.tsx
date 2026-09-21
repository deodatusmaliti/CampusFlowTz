import React, { useState } from 'react';
import { 
  Building, 
  Search, 
  Plus, 
  Check, 
  X, 
  Sparkles, 
  GraduationCap, 
  MapPin, 
  Globe 
} from 'lucide-react';
import { StorageService } from '../services/storageService';

interface UniversityPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUniversity: string;
  onSelectUniversity: (uni: string) => void;
  onNotify: (msg: string) => void;
}

export const UniversityPickerModal: React.FC<UniversityPickerModalProps> = ({
  isOpen,
  onClose,
  currentUniversity,
  onSelectUniversity,
  onNotify,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [universities, setUniversities] = useState<string[]>(StorageService.getUniversities());
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCampus, setCustomCampus] = useState('');

  if (!isOpen) return null;

  const filtered = universities.filter(u => 
    u.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (uni: string) => {
    onSelectUniversity(uni);
    onNotify(`Active academic campus switched to "${uni}".`);
    onClose();
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customName.trim();
    if (!trimmed) return;

    const fullTitle = customCampus.trim() 
      ? `${trimmed} (${customCampus.trim()} Campus)`
      : trimmed;

    const updated = StorageService.addUniversity(fullTitle);
    setUniversities(updated);
    onSelectUniversity(fullTitle);
    onNotify(`Added custom university "${fullTitle}" to platform catalog.`);
    setCustomName('');
    setCustomCampus('');
    setShowAddCustom(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#e5f2fb] text-[#1e6fa8] flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#102d4f]">Select Your University / College</h2>
              <p className="text-xs text-slate-500">Connect to any campus, college, or university worldwide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search university or college name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
          />
        </div>

        {/* Add Custom Trigger */}
        <div className="mt-3 flex items-center justify-between bg-[#f5f8fb] p-2.5 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-600 font-medium">Don't see your college listed?</span>
          <button
            onClick={() => setShowAddCustom(!showAddCustom)}
            className="px-2.5 py-1 rounded-lg bg-[#102d4f] hover:bg-[#1a406c] text-white font-bold flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Any University
          </button>
        </div>

        {/* Custom University Form */}
        {showAddCustom && (
          <form onSubmit={handleAddCustom} className="mt-3 p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2.5 animate-in fade-in duration-150">
            <p className="text-xs font-bold text-[#102d4f] flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#1e6fa8]" /> Add New University or Higher Learning Institute
            </p>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Institution Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mzumbe University or Oxford University"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Campus / Branch (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Morogoro Main Campus, Mbeya Campus, etc."
                value={customCampus}
                onChange={(e) => setCustomCampus(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddCustom(false)}
                className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#1e6fa8] hover:bg-[#185a8a] text-white text-xs font-bold shadow-xs"
              >
                Save & Select Campus
              </button>
            </div>
          </form>
        )}

        {/* University List */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-1.5 max-h-[360px] pr-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No institution found matching "{searchQuery}".
              <button
                onClick={() => {
                  setShowAddCustom(true);
                  setCustomName(searchQuery);
                }}
                className="block mx-auto mt-2 text-[#1e6fa8] font-bold hover:underline"
              >
                + Add "{searchQuery}" as a new University
              </button>
            </div>
          ) : (
            filtered.map((uni) => {
              const isSelected = uni.toLowerCase() === currentUniversity.toLowerCase();
              return (
                <button
                  key={uni}
                  onClick={() => handleSelect(uni)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-[#e5f2fb] border-[#1e6fa8] text-[#102d4f] font-bold shadow-xs'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Building className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#1e6fa8]' : 'text-slate-400'}`} />
                    <span className="truncate">{uni}</span>
                  </div>
                  {isSelected && (
                    <span className="shrink-0 flex items-center gap-1 text-xs text-[#1e6fa8] font-bold">
                      <Check className="w-4 h-4 stroke-[3]" /> Active
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Active: <strong className="text-[#102d4f]">{currentUniversity}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
