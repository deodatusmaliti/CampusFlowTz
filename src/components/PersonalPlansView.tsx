import React from 'react';
import { 
  HeartHandshake, 
  Plus, 
  MapPin, 
  Clock, 
  Calendar, 
  Trophy, 
  Music, 
  Activity,
  Sparkles
} from 'lucide-react';
import { CalendarEvent } from '../types';

interface PersonalPlansViewProps {
  onOpenAddEvent: (initialDate?: string) => void;
  onAddPresetActivity: (title: string, category: 'sport' | 'society' | 'personal', location: string, time: string) => void;
}

export const PersonalPlansView: React.FC<PersonalPlansViewProps> = ({
  onOpenAddEvent,
  onAddPresetActivity,
}) => {
  const campusActivities = [
    {
      id: 'act_1',
      title: 'Inter-Faculty Football Championship',
      category: 'sport' as const,
      dayTime: 'Friday 25 Sep · 17:30',
      time: '17:30',
      location: 'University Main Stadium',
      icon: Trophy,
      desc: 'Science vs Engineering qualifier match. Open to all students & fans.',
    },
    {
      id: 'act_2',
      title: 'Saturday Campus 5K Morning Run',
      category: 'sport' as const,
      dayTime: 'Saturday 26 Sep · 06:30',
      time: '06:30',
      location: 'Campus Grounds / Hill Route',
      icon: Activity,
      desc: 'Weekly fitness group organized by University Sports Department.',
    },
    {
      id: 'act_3',
      title: 'Wildlife & Environment Society Meeting',
      category: 'society' as const,
      dayTime: 'Tuesday 29 Sep · 18:00',
      time: '18:00',
      location: 'Student Centre Hall B',
      icon: HeartHandshake,
      desc: 'Guest seminar on conservation biology & Mikumi trip logistics.',
    },
    {
      id: 'act_4',
      title: 'Cultural Arts & Music Ensemble Rehearsal',
      category: 'society' as const,
      dayTime: 'Thursday 1 Oct · 16:30',
      time: '16:30',
      location: 'Auditorium Amphitheatre',
      icon: Music,
      desc: 'Traditional instruments and choir rehearsals for graduation gala.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#d9e3ea] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            Holistic Student Life
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102d4f] mt-1">
            Personal Plans, Sports & Societies
          </h1>
          <p className="text-xs text-slate-500">
            Maintain balance between academic rigor, fitness, and campus community engagement
          </p>
        </div>

        <button
          onClick={() => onOpenAddEvent()}
          className="px-4 py-2 rounded-xl bg-[#1e6fa8] hover:bg-[#185a8a] text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Custom Personal Plan
        </button>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campusActivities.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              className="bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs hover:border-[#1e6fa8] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#1e6fa8] flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {act.category}
                  </span>
                </div>

                <h2 className="text-base font-bold text-[#102d4f] mt-3">
                  {act.title}
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {act.desc}
                </p>

                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{act.dayTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{act.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onAddPresetActivity(act.title, act.category, act.location, act.time)}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" /> Add to My Academic Timetable
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
