import React, { useState, useEffect } from 'react';
import { X, Clock, Globe, Check, MapPin, Compass, Search } from 'lucide-react';
import { TimeService, POPULAR_TIMEZONES, TimezoneOption } from '../services/timeService';
import { TimezoneSettingMode } from '../types';

interface TimezoneSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChanged?: () => void;
  onSaved?: (mode: TimezoneSettingMode) => void;
  onNotify?: (msg: string) => void;
}

export const TimezoneSettingsModal: React.FC<TimezoneSettingsModalProps> = ({
  isOpen,
  onClose,
  onChanged,
  onSaved,
  onNotify,
}) => {
  const [savedConfig, setSavedConfig] = useState(() => TimeService.getSavedConfig());
  const [selectedMode, setSelectedMode] = useState<TimezoneSettingMode>(savedConfig.mode);
  const [manualTimezone, setManualTimezone] = useState<string>(savedConfig.manualTimezone);
  const [searchFilter, setSearchFilter] = useState('');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    const tick = () => {
      const clock = TimeService.getCurrentHeaderClock();
      setCurrentTimeStr(clock.timeFormatted);
      setCurrentDateStr(clock.dateFormatted);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isOpen, selectedMode, manualTimezone]);

  if (!isOpen) return null;

  const state = TimeService.getActiveTimezoneState();
  const detectedTz = TimeService.getDetectedTimezone();

  const handleSave = () => {
    TimeService.saveConfig({
      mode: selectedMode,
      manualTimezone,
    });
    setSavedConfig({ mode: selectedMode, manualTimezone });
    onNotify?.(`Timezone updated to ${selectedMode === 'tanzania' ? 'Tanzania East Africa Time (Africa/Dar_es_Salaam)' : selectedMode === 'manual' ? manualTimezone : 'Automatic Device Timezone'}.`);
    onSaved?.(selectedMode);
    onChanged?.();
    onClose();
  };

  const filteredTimezones = POPULAR_TIMEZONES.filter(tz => 
    tz.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
    tz.iana.toLowerCase().includes(searchFilter.toLowerCase()) ||
    tz.region.toLowerCase().includes(searchFilter.toLowerCase())
  );

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
                Timezone & Academic Clock System
              </h2>
              <p className="text-xs text-slate-300">
                Tanzania East Africa Time (Africa/Dar_es_Salaam) & Global Conversion
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

        {/* Live Active Clock Banner */}
        <div className="p-4 sm:p-5 bg-sky-50/90 border-b border-sky-200 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-sky-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-sky-900 font-bold uppercase tracking-wider text-[11px]">
                <Clock className="w-3.5 h-3.5 text-sky-700" />
                <span>Current Real Time in Selected Zone</span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono tracking-tight">
                {currentTimeStr || '12:00:00 PM'}
              </div>
              <div className="text-xs text-slate-600 font-medium mt-0.5">
                {currentDateStr}
              </div>
            </div>

            <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
              <span className="inline-block px-2.5 py-1 rounded-md bg-sky-100 text-sky-900 font-bold text-xs border border-sky-200">
                {state.timeZoneAbbreviation} ({state.utcOffsetString})
              </span>
              <div className="text-[11px] text-slate-500 mt-1 font-mono truncate max-w-[200px]" title={state.activeTimezone}>
                {state.activeTimezone}
              </div>
            </div>
          </div>
        </div>

        {/* Timezone Mode Selection */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Select Timezone Setting
          </label>

          {/* Option 1: Automatic Browser Timezone */}
          <div
            onClick={() => setSelectedMode('auto')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
              selectedMode === 'auto'
                ? 'border-sky-600 bg-sky-50/60 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
              selectedMode === 'auto' ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
            }`}>
              {selectedMode === 'auto' && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">
                  Automatic Browser Timezone
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Auto Detect
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatically detects your device's browser timezone (Detected: <b>{detectedTz}</b>). Adapts seamlessly for daylight saving transitions.
              </p>
            </div>
          </div>

          {/* Option 2: Tanzania East Africa Time (Africa/Dar_es_Salaam) */}
          <div
            onClick={() => setSelectedMode('tanzania')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
              selectedMode === 'tanzania'
                ? 'border-sky-600 bg-sky-50/60 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
              selectedMode === 'tanzania' ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
            }`}>
              {selectedMode === 'tanzania' && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">
                  Tanzania / East Africa Time (EAT)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  Africa/Dar_es_Salaam • UTC+3
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Matches the official campus schedule at UDSM, UDOM, SUA, MZUMBE, MUST, DIT, and all East African universities.
              </p>
            </div>
          </div>

          {/* Option 3: Manual Timezone Selection */}
          <div
            onClick={() => setSelectedMode('manual')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
              selectedMode === 'manual'
                ? 'border-sky-600 bg-sky-50/60 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
              selectedMode === 'manual' ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
            }`}>
              {selectedMode === 'manual' && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">
                  Manual Timezone Selection
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  Custom
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manually pick your specific IANA timezone for travel, international exchange, or remote study.
              </p>

              {selectedMode === 'manual' && (
                <div className="mt-3 space-y-2 pt-2 border-t border-sky-100" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search city or timezone (e.g. London, Nairobi, Cairo)..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-white"
                    />
                  </div>

                  <select
                    value={manualTimezone}
                    onChange={(e) => setManualTimezone(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-white font-medium text-slate-800"
                  >
                    {filteredTimezones.map(tz => (
                      <option key={tz.iana} value={tz.iana}>
                        {tz.label} ({tz.offset}) - {tz.iana}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
            <Compass className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              Timetable classes, exam schedules, assignment submission deadlines, and audio alarms will all synchronize automatically to your chosen timezone.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            Apply Timezone
          </button>
        </div>

      </div>
    </div>
  );
};
