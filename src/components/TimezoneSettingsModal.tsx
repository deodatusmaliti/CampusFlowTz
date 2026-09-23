import React, { useState, useEffect } from 'react';
import { X, Clock, Globe, Check, Compass, Info, MapPin } from 'lucide-react';
import { TimeService, TimezoneMode, TimezoneInfo } from '../services/timeService';

interface TimezoneSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModeChanged?: (newMode: TimezoneMode) => void;
  onNotify?: (msg: string) => void;
  onSaved?: (mode: TimezoneMode) => void;
}

export const TimezoneSettingsModal: React.FC<TimezoneSettingsModalProps> = ({
  isOpen,
  onClose,
  onModeChanged,
  onNotify,
  onSaved,
}) => {
  const [currentMode, setCurrentMode] = useState<TimezoneMode>(() => TimeService.getSavedMode());
  const [tzInfo, setTzInfo] = useState<TimezoneInfo>(() => TimeService.getTimezoneInfo());
  const [currentTimeEAT, setCurrentTimeEAT] = useState<string>('');
  const [currentTimeLocal, setCurrentTimeLocal] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    const updateClock = () => {
      const now = new Date();
      setCurrentTimeEAT(
        TimeService.formatInEAT(now, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentTimeLocal(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setTzInfo(TimeService.getTimezoneInfo());
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectMode = (mode: TimezoneMode) => {
    TimeService.setMode(mode);
    setCurrentMode(mode);
    setTzInfo(TimeService.getTimezoneInfo());
    if (onModeChanged) onModeChanged(mode);
    if (onSaved) onSaved(mode);

    if (mode === 'eat') {
      onNotify?.('Time system set to East Africa Time (EAT: UTC+3).');
    } else if (mode === 'auto') {
      onNotify?.('Auto-detection enabled. Matches East African campus schedule automatically.');
    } else {
      onNotify?.('Time system switched to your local device timezone.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full my-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Academic Timezone System
              </h2>
              <p className="text-xs text-slate-300">
                East Africa Time (EAT) & Global Regional Detection
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

        {/* Live Clocks Banner */}
        <div className="p-4 sm:p-5 bg-sky-50/80 border-b border-sky-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-sky-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-sky-800 font-bold uppercase tracking-wider text-[10px]">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>Campus Official Time (EAT)</span>
            </div>
            <div className="text-xl font-black text-slate-900 mt-1 font-mono">
              {currentTimeEAT || '09:30:00 AM'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              UTC+3 • Dar es Salaam, Nairobi, Kampala
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-sky-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Your Device Time</span>
            </div>
            <div className="text-xl font-black text-slate-900 mt-1 font-mono">
              {currentTimeLocal || '09:30:00 AM'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate" title={tzInfo.detectedTimezone}>
              {tzInfo.detectedTimezone}
            </div>
          </div>
        </div>

        {/* Timezone Mode Selection */}
        <div className="p-4 sm:p-6 space-y-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Choose Timezone Display Mode
          </label>

          {/* Option 1: Auto Detection */}
          <div
            onClick={() => handleSelectMode('auto')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
              currentMode === 'auto'
                ? 'border-sky-600 bg-sky-50/60 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
              currentMode === 'auto' ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
            }`}>
              {currentMode === 'auto' && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">
                  Automatic Region Detection (Recommended)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Adaptive
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                East African students see native <b>East Africa Time (EAT)</b>. Students logging in from other international timezones see their local time alongside the official EAT campus clock.
              </p>
            </div>
          </div>

          {/* Option 2: East Africa Time (EAT) */}
          <div
            onClick={() => handleSelectMode('eat')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
              currentMode === 'eat'
                ? 'border-sky-600 bg-sky-50/60 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
              currentMode === 'eat' ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
            }`}>
              {currentMode === 'eat' && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">
                  Strict East Africa Time (EAT: UTC+3)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                  Campus Native
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Locks all lecture schedules, deadlines, assessment timers, and notifications strictly to Tanzania/East Africa campus standard (UTC+3) regardless of current device location.
              </p>
            </div>
          </div>

          {/* Option 3: Local Device Time */}
          <div
            onClick={() => handleSelectMode('local')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
              currentMode === 'local'
                ? 'border-sky-600 bg-sky-50/60 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
              currentMode === 'local' ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
            }`}>
              {currentMode === 'local' && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="space-y-1">
              <span className="text-sm font-black text-slate-900">
                Device Local Timezone Only
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Converts timetable slots and deadlines directly into your browser's current local timezone ({tzInfo.detectedTimezone}).
              </p>
            </div>
          </div>

          {/* Info Note */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
            <span>
              All exam schedules and official university notices are issued in <b>East Africa Time (EAT)</b>. CampusFlow synchronizes timestamps identically across your phone, tablet, and desktop browser.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
