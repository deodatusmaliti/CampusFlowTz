import React, { useState } from 'react';
import { 
  TrendingUp, 
  Award, 
  Plus, 
  Trash2, 
  HelpCircle, 
  Sparkles, 
  Calculator,
  CheckCircle2
} from 'lucide-react';

export const GpaCalculatorView: React.FC = () => {
  const [scale, setScale] = useState<'5.0' | '4.0'>('5.0');
  const [currentGpa, setCurrentGpa] = useState<number>(3.72);
  const [completedCredits, setCompletedCredits] = useState<number>(42);
  const [nextExpectedGpa, setNextExpectedGpa] = useState<number>(4.10);
  const [nextCredits, setNextCredits] = useState<number>(18);

  // Scenario Simulator
  const [scenarioCourses, setScenarioCourses] = useState([
    { id: '1', code: 'ZOO 202', title: 'Physiology II', credits: 12, gradePoint: 5.0, gradeName: 'A (70-100%)' },
    { id: '2', code: 'BIO 204', title: 'Genetics & Genomics', credits: 12, gradePoint: 4.0, gradeName: 'B+ (60-69%)' },
    { id: '3', code: 'MIC 201', title: 'Microbiology Fundamentals', credits: 10, gradePoint: 4.0, gradeName: 'B+ (60-69%)' },
  ]);

  // Overall Projected GPA calculation
  const totalFutureCredits = completedCredits + nextCredits;
  const projectedGpa = totalFutureCredits > 0
    ? ((currentGpa * completedCredits) + (nextExpectedGpa * nextCredits)) / totalFutureCredits
    : currentGpa;

  // Grade classification based on 5.0 scale (Tanzania standard)
  const getClassification = (gpa: number) => {
    if (scale === '5.0') {
      if (gpa >= 4.4) return { label: 'First Class Honours', color: 'text-amber-600 bg-amber-50 border-amber-200' };
      if (gpa >= 3.5) return { label: 'Upper Second Class Honours', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      if (gpa >= 2.7) return { label: 'Lower Second Class Honours', color: 'text-sky-700 bg-sky-50 border-sky-200' };
      if (gpa >= 2.0) return { label: 'Pass', color: 'text-slate-700 bg-slate-100 border-slate-200' };
      return { label: 'Fail / Discontinued', color: 'text-red-700 bg-red-50 border-red-200' };
    } else {
      if (gpa >= 3.6) return { label: 'First Class Honours', color: 'text-amber-600 bg-amber-50 border-amber-200' };
      if (gpa >= 3.0) return { label: 'Upper Second Class', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      if (gpa >= 2.0) return { label: 'Pass', color: 'text-slate-700 bg-slate-100 border-slate-200' };
      return { label: 'Probation', color: 'text-red-700 bg-red-50 border-red-200' };
    }
  };

  const classification = getClassification(projectedGpa);

  // Scenario Simulator Calculation
  const scenarioTotalCredits = scenarioCourses.reduce((sum, c) => sum + c.credits, 0);
  const scenarioPoints = scenarioCourses.reduce((sum, c) => sum + (c.credits * c.gradePoint), 0);
  const scenarioSemesterGpa = scenarioTotalCredits > 0 ? scenarioPoints / scenarioTotalCredits : 0;
  const scenarioCombinedGpa = (completedCredits + scenarioTotalCredits) > 0
    ? ((currentGpa * completedCredits) + scenarioPoints) / (completedCredits + scenarioTotalCredits)
    : currentGpa;

  const handleAddScenarioCourse = () => {
    setScenarioCourses([
      ...scenarioCourses,
      {
        id: 'sc_' + Date.now(),
        code: 'NEW 200',
        title: 'Elective Course',
        credits: 10,
        gradePoint: 4.0,
        gradeName: 'B+ (60-69%)',
      },
    ]);
  };

  const handleRemoveScenarioCourse = (id: string) => {
    setScenarioCourses(scenarioCourses.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#d9e3ea] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 uppercase tracking-wider">
            Academic Performance Modeling
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102d4f] mt-1">
            GPA Projections & Honours Simulator
          </h1>
          <p className="text-xs text-slate-500">
            Compliant with Tanzania Commission for Universities (TCU) grading scales
          </p>
        </div>

        {/* Scale Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setScale('5.0')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              scale === '5.0' ? 'bg-white text-[#102d4f] shadow-xs' : 'text-slate-600'
            }`}
          >
            5.0 Scale (TCU / UDSM)
          </button>
          <button
            onClick={() => setScale('4.0')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              scale === '4.0' ? 'bg-white text-[#102d4f] shadow-xs' : 'text-slate-600'
            }`}
          >
            4.0 Scale (Intl)
          </button>
        </div>
      </div>

      {/* Projection Inputs & Result Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs">
          <h2 className="text-base font-bold text-[#102d4f] mb-4 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#1e6fa8]" /> Semester Weight Inputs
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Cumulative GPA
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max={scale === '5.0' ? '5.0' : '4.0'}
                value={currentGpa}
                onChange={(e) => setCurrentGpa(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Completed Credits to Date
              </label>
              <input
                type="number"
                min="0"
                value={completedCredits}
                onChange={(e) => setCompletedCredits(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Expected Next-Semester GPA Target
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max={scale === '5.0' ? '5.0' : '4.0'}
                value={nextExpectedGpa}
                onChange={(e) => setNextExpectedGpa(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Next-Semester Registered Credits
              </label>
              <input
                type="number"
                min="1"
                value={nextCredits}
                onChange={(e) => setNextCredits(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <strong>Official TCU Classification Scale (5.0):</strong> First Class (4.40–5.00) · Upper Second (3.50–4.39) · Lower Second (2.70–3.49) · Pass (2.00–2.69).
          </div>
        </div>

        {/* Projected Result Output */}
        <div className="bg-gradient-to-br from-[#102d4f] to-[#1e4878] rounded-2xl p-6 text-white shadow-md flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#e6ad3d]">
              Projected Cumulative Standing
            </span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-5xl font-black text-white">{projectedGpa.toFixed(2)}</span>
              <span className="text-sm font-semibold text-slate-300">/ {scale}</span>
            </div>

            <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold border ${classification.color}`}>
              {classification.label}
            </div>

            <p className="mt-4 text-xs text-slate-200 leading-relaxed">
              Based on maintaining a {nextExpectedGpa.toFixed(2)} target over {nextCredits} upcoming credits, your cumulative GPA will adjust from {currentGpa.toFixed(2)} to {projectedGpa.toFixed(2)}.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-slate-300">
            <span>Total Combined Credits</span>
            <span className="font-extrabold text-white">{totalFutureCredits}</span>
          </div>
        </div>
      </div>

      {/* Course-by-Course What-If Scenario Builder */}
      <div className="bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-[#102d4f]">
              Course-by-Course What-If Scenario Builder
            </h2>
            <p className="text-xs text-slate-500">
              Simulate individual letter grades to evaluate minimum scores needed
            </p>
          </div>
          <button
            onClick={handleAddScenarioCourse}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#102d4f] text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" /> Add Course to Model
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#eef6fb] text-[#102d4f] border-b border-slate-200">
                <th className="py-2.5 px-3 font-bold">Course</th>
                <th className="py-2.5 px-3 font-bold">Credits</th>
                <th className="py-2.5 px-3 font-bold">Target Grade</th>
                <th className="py-2.5 px-3 font-bold">Grade Points</th>
                <th className="py-2.5 px-3 font-bold text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scenarioCourses.map((c, idx) => (
                <tr key={c.id}>
                  <td className="py-2.5 px-3 font-semibold text-[#102d4f]">
                    <input
                      type="text"
                      value={c.code}
                      onChange={(e) => {
                        const updated = [...scenarioCourses];
                        updated[idx].code = e.target.value;
                        setScenarioCourses(updated);
                      }}
                      className="px-2 py-1 rounded border border-slate-200 text-xs w-24 font-bold"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={c.credits}
                      onChange={(e) => {
                        const updated = [...scenarioCourses];
                        updated[idx].credits = Number(e.target.value);
                        setScenarioCourses(updated);
                      }}
                      className="px-2 py-1 rounded border border-slate-200 text-xs w-16"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <select
                      value={c.gradePoint}
                      onChange={(e) => {
                        const gp = Number(e.target.value);
                        const updated = [...scenarioCourses];
                        updated[idx].gradePoint = gp;
                        setScenarioCourses(updated);
                      }}
                      className="px-2 py-1 rounded border border-slate-200 text-xs bg-white"
                    >
                      <option value={5.0}>A (70–100%) - 5.0 pts</option>
                      <option value={4.0}>B+ (60–69%) - 4.0 pts</option>
                      <option value={3.0}>B (50–59%) - 3.0 pts</option>
                      <option value={2.0}>C (40–49%) - 2.0 pts</option>
                      <option value={1.0}>D (35–39%) - 1.0 pts</option>
                      <option value={0.0}>E (0–34%) - 0.0 pts</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#1e6fa8]">
                    {(c.credits * c.gradePoint).toFixed(1)} Pts
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleRemoveScenarioCourse(c.id)}
                      className="p-1 text-slate-300 hover:text-red-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Scenario Summary */}
        <div className="mt-4 p-4 rounded-xl bg-[#edf7f2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-[#16845d]">Scenario Semester GPA: {scenarioSemesterGpa.toFixed(2)}</span>
            <span className="text-slate-600 block sm:inline sm:ml-3">
              Combined Cumulative: <strong className="text-[#102d4f]">{scenarioCombinedGpa.toFixed(2)}</strong>
            </span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800">
            {scenarioTotalCredits} Semester Credits Added
          </span>
        </div>
      </div>
    </div>
  );
};
