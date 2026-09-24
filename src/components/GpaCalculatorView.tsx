import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Award, 
  Plus, 
  Trash2, 
  HelpCircle, 
  Sparkles, 
  Calculator,
  CheckCircle2,
  Printer,
  Download,
  RotateCcw,
  BookOpen,
  Info,
  Sliders,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Course } from '../types';

export type GradingSystemId = 'tcu_5' | 'us_4' | 'ects' | 'uk_honours' | 'custom';

export interface CourseGradeRow {
  id: string;
  code: string;
  title: string;
  credits: number;
  gradeKey: string;
  percentageMark?: number;
  inputMode: 'letter' | 'percentage';
}

interface GradeDefinition {
  key: string;
  label: string;
  gradePoint: number;
  minPercent: number;
  maxPercent: number;
  description: string;
}

export const GpaCalculatorView: React.FC = () => {
  // Navigation between the comprehensive course-by-course calculator and cumulative projection
  const [activeTab, setActiveTab] = useState<'calculator' | 'cumulative_projection'>('calculator');

  // Selected Grading System
  const [selectedSystem, setSelectedSystem] = useState<GradingSystemId>('tcu_5');

  // Custom grade bands (user editable)
  const [customBands, setCustomBands] = useState<GradeDefinition[]>([
    { key: 'A', label: 'A', gradePoint: 5.0, minPercent: 70, maxPercent: 100, description: 'Excellent / Distinction' },
    { key: 'B_PLUS', label: 'B+', gradePoint: 4.0, minPercent: 60, maxPercent: 69, description: 'Very Good' },
    { key: 'B', label: 'B', gradePoint: 3.0, minPercent: 50, maxPercent: 59, description: 'Good' },
    { key: 'C', label: 'C', gradePoint: 2.0, minPercent: 40, maxPercent: 49, description: 'Pass' },
    { key: 'D', label: 'D', gradePoint: 1.0, minPercent: 35, maxPercent: 39, description: 'Marginal Fail' },
    { key: 'F', label: 'F', gradePoint: 0.0, minPercent: 0, maxPercent: 34, description: 'Absolute Fail' },
  ]);

  // Standard Grading Systems Definitions
  const gradingSystems = useMemo<Record<GradingSystemId, {
    name: string;
    scaleLabel: string;
    maxPoint: number;
    description: string;
    isInternationalEstimate: boolean;
    grades: GradeDefinition[];
  }>>(() => ({
    tcu_5: {
      name: 'Tanzania TCU-Style 5.0 Scale (National Benchmark)',
      scaleLabel: '5.0 Scale',
      maxPoint: 5.0,
      description: 'Standard undergraduate grading guideline recommended by the Tanzania Commission for Universities (TCU) and applied by universities including UDSM, MUHAS, SUA, and UDOM.',
      isInternationalEstimate: false,
      grades: [
        { key: 'A', label: 'A (70–100%)', gradePoint: 5.0, minPercent: 70, maxPercent: 100, description: 'Excellent / Distinction' },
        { key: 'B_PLUS', label: 'B+ (60–69%)', gradePoint: 4.0, minPercent: 60, maxPercent: 69, description: 'Very Good' },
        { key: 'B', label: 'B (50–59%)', gradePoint: 3.0, minPercent: 50, maxPercent: 59, description: 'Good' },
        { key: 'C', label: 'C (40–49%)', gradePoint: 2.0, minPercent: 40, maxPercent: 49, description: 'Pass' },
        { key: 'D', label: 'D (35–39%)', gradePoint: 1.0, minPercent: 35, maxPercent: 39, description: 'Marginal Fail' },
        { key: 'F', label: 'F (0–34%)', gradePoint: 0.0, minPercent: 0, maxPercent: 34, description: 'Absolute Fail' },
      ],
    },
    us_4: {
      name: 'United States 4.0 Scale (GPA Model)',
      scaleLabel: '4.0 Scale',
      maxPoint: 4.0,
      description: 'Standard four-point unweighted grading system utilized across US colleges and North American credential evaluators.',
      isInternationalEstimate: true,
      grades: [
        { key: 'A', label: 'A / A+ (93–100%)', gradePoint: 4.0, minPercent: 93, maxPercent: 100, description: 'Superior' },
        { key: 'A_MINUS', label: 'A− (90–92%)', gradePoint: 3.7, minPercent: 90, maxPercent: 92, description: 'Excellent' },
        { key: 'B_PLUS', label: 'B+ (87–89%)', gradePoint: 3.3, minPercent: 87, maxPercent: 89, description: 'Very Good' },
        { key: 'B', label: 'B (83–86%)', gradePoint: 3.0, minPercent: 83, maxPercent: 86, description: 'Good' },
        { key: 'B_MINUS', label: 'B− (80–82%)', gradePoint: 2.7, minPercent: 80, maxPercent: 82, description: 'Above Average' },
        { key: 'C_PLUS', label: 'C+ (77–79%)', gradePoint: 2.3, minPercent: 77, maxPercent: 79, description: 'Average' },
        { key: 'C', label: 'C (73–76%)', gradePoint: 2.0, minPercent: 73, maxPercent: 76, description: 'Competent Pass' },
        { key: 'C_MINUS', label: 'C− (70–72%)', gradePoint: 1.7, minPercent: 70, maxPercent: 72, description: 'Minimal Pass' },
        { key: 'D', label: 'D (60–69%)', gradePoint: 1.0, minPercent: 60, maxPercent: 69, description: 'Passing / Below Average' },
        { key: 'F', label: 'F (0–59%)', gradePoint: 0.0, minPercent: 0, maxPercent: 59, description: 'Fail' },
      ],
    },
    ects: {
      name: 'European Credit Transfer and Accumulation System (ECTS Scale)',
      scaleLabel: 'ECTS 4.0 Conversion',
      maxPoint: 4.0,
      description: 'European statistical percentile grading scale designed to facilitate academic mobility across Bologna process European institutions.',
      isInternationalEstimate: true,
      grades: [
        { key: 'A', label: 'A (Top 10% / Outstanding)', gradePoint: 4.0, minPercent: 90, maxPercent: 100, description: 'Excellent' },
        { key: 'B', label: 'B (Next 25% / Above average)', gradePoint: 3.3, minPercent: 75, maxPercent: 89, description: 'Very Good' },
        { key: 'C', label: 'C (Next 30% / Sound work)', gradePoint: 2.7, minPercent: 60, maxPercent: 74, description: 'Good' },
        { key: 'D', label: 'D (Next 25% / Noticeable flaws)', gradePoint: 2.0, minPercent: 50, maxPercent: 59, description: 'Satisfactory' },
        { key: 'E', label: 'E (Next 10% / Meets minimum)', gradePoint: 1.0, minPercent: 40, maxPercent: 49, description: 'Sufficient' },
        { key: 'FX', label: 'FX / F (Fail / Incomplete)', gradePoint: 0.0, minPercent: 0, maxPercent: 39, description: 'Fail' },
      ],
    },
    uk_honours: {
      name: 'United Kingdom Honours Classification System',
      scaleLabel: 'UK Honours Scale',
      maxPoint: 4.0,
      description: 'British Commonwealth honours degree classification standard based on percentage bands.',
      isInternationalEstimate: true,
      grades: [
        { key: 'FIRST', label: 'First Class Honours (70–100%)', gradePoint: 4.0, minPercent: 70, maxPercent: 100, description: 'First Class (1st)' },
        { key: 'UPPER_SECOND', label: 'Upper Second Class 2:1 (60–69%)', gradePoint: 3.3, minPercent: 60, maxPercent: 69, description: 'Upper Second (2:1)' },
        { key: 'LOWER_SECOND', label: 'Lower Second Class 2:2 (50–59%)', gradePoint: 2.7, minPercent: 50, maxPercent: 59, description: 'Lower Second (2:2)' },
        { key: 'THIRD', label: 'Third Class Honours (40–49%)', gradePoint: 2.0, minPercent: 40, maxPercent: 49, description: 'Third Class (3rd)' },
        { key: 'FAIL', label: 'Fail / Unclassified (< 40%)', gradePoint: 0.0, minPercent: 0, maxPercent: 39, description: 'Fail' },
      ],
    },
    custom: {
      name: 'Custom Percentage / Institutional Scale',
      scaleLabel: 'Custom Scale',
      maxPoint: 5.0,
      description: 'User-configured custom grading thresholds and grade points for specialized faculty or departmental requirements.',
      isInternationalEstimate: true,
      grades: customBands,
    }
  }), [customBands]);

  // Current active grades
  const activeGradeList = useMemo(() => {
    return gradingSystems[selectedSystem].grades;
  }, [gradingSystems, selectedSystem]);

  // Initial Course Rows for the full calculator
  const [coursesRows, setCoursesRows] = useState<CourseGradeRow[]>([
    { id: 'row_1', code: 'ZOO 101', title: 'Zoology I', credits: 12, gradeKey: 'A', percentageMark: 76, inputMode: 'letter' },
    { id: 'row_2', code: 'BST 101', title: 'Biostatistics I', credits: 10, gradeKey: 'B_PLUS', percentageMark: 65, inputMode: 'letter' },
    { id: 'row_3', code: 'ANA 101', title: 'Human Anatomy I', credits: 16, gradeKey: 'A', percentageMark: 78, inputMode: 'letter' },
    { id: 'row_4', code: 'PHS 101', title: 'Physiology I', credits: 12, gradeKey: 'B_PLUS', percentageMark: 68, inputMode: 'letter' },
    { id: 'row_5', code: 'PUB 101', title: 'Public Health', credits: 10, gradeKey: 'A', percentageMark: 82, inputMode: 'letter' },
  ]);

  // Show custom editor toggle
  const [isEditingCustomScale, setIsEditingCustomScale] = useState(false);

  // Success / notification message
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Helper to lookup grade point for a given row and active scale
  const getGradePointForRow = (row: CourseGradeRow): number => {
    if (row.inputMode === 'percentage' && typeof row.percentageMark === 'number') {
      const match = activeGradeList.find(g => 
        row.percentageMark! >= g.minPercent && row.percentageMark! <= g.maxPercent
      );
      if (match) return match.gradePoint;
    }
    const found = activeGradeList.find(g => g.key === row.gradeKey);
    return found ? found.gradePoint : (activeGradeList[0]?.gradePoint || 4.0);
  };

  // Calculations
  const calculationSummary = useMemo(() => {
    let totalCredits = 0;
    let totalQualityPoints = 0;

    coursesRows.forEach(row => {
      const credits = Number(row.credits) || 0;
      const gp = getGradePointForRow(row);
      const qualityPoints = credits * gp;
      totalCredits += credits;
      totalQualityPoints += qualityPoints;
    });

    const weightedGpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
    return {
      totalCredits,
      totalQualityPoints,
      weightedGpa,
    };
  }, [coursesRows, activeGradeList]);

  // TCU 5.0 Honours Classification
  const getTcuClassification = (gpa: number) => {
    if (gpa >= 4.4) return { label: 'First Class Honours', color: 'text-amber-700 bg-amber-50 border-amber-300' };
    if (gpa >= 3.5) return { label: 'Upper Second Class Honours (2:1)', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (gpa >= 2.7) return { label: 'Lower Second Class Honours (2:2)', color: 'text-sky-700 bg-sky-50 border-sky-300' };
    if (gpa >= 2.0) return { label: 'Pass', color: 'text-slate-700 bg-slate-100 border-slate-300' };
    return { label: 'Fail / Discontinued', color: 'text-rose-700 bg-rose-50 border-rose-300' };
  };

  // US 4.0 Classification
  const getUsClassification = (gpa: number) => {
    if (gpa >= 3.8) return { label: 'Summa Cum Laude / High Distinction', color: 'text-amber-700 bg-amber-50 border-amber-300' };
    if (gpa >= 3.5) return { label: 'Magna Cum Laude / Honors', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (gpa >= 3.0) return { label: 'Cum Laude / Above Average', color: 'text-sky-700 bg-sky-50 border-sky-300' };
    if (gpa >= 2.0) return { label: 'Satisfactory / Good Standing', color: 'text-slate-700 bg-slate-100 border-slate-300' };
    return { label: 'Academic Probation / Below Standard', color: 'text-rose-700 bg-rose-50 border-rose-300' };
  };

  // UK Honours Classification
  const getUkClassification = (gpa: number) => {
    if (gpa >= 3.7) return { label: 'First Class (1st)', color: 'text-amber-700 bg-amber-50 border-amber-300' };
    if (gpa >= 3.0) return { label: 'Upper Second (2:1)', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (gpa >= 2.3) return { label: 'Lower Second (2:2)', color: 'text-sky-700 bg-sky-50 border-sky-300' };
    if (gpa >= 2.0) return { label: 'Third Class (3rd)', color: 'text-slate-700 bg-slate-100 border-slate-300' };
    return { label: 'Fail / Non-Honours', color: 'text-rose-700 bg-rose-50 border-rose-300' };
  };

  const currentStandingBadge = useMemo(() => {
    if (selectedSystem === 'tcu_5') return getTcuClassification(calculationSummary.weightedGpa);
    if (selectedSystem === 'uk_honours') return getUkClassification(calculationSummary.weightedGpa);
    return getUsClassification(calculationSummary.weightedGpa);
  }, [selectedSystem, calculationSummary.weightedGpa]);

  // Handlers for Row Mutations
  const handleAddCourseRow = () => {
    const newRow: CourseGradeRow = {
      id: 'row_' + Date.now(),
      code: 'NEW ' + (coursesRows.length + 1) * 10,
      title: 'Elective Course Module',
      credits: 10,
      gradeKey: activeGradeList[0]?.key || 'A',
      inputMode: 'letter',
    };
    setCoursesRows([...coursesRows, newRow]);
    showNotification('New course row added.');
  };

  const handleUpdateRow = (id: string, updates: Partial<CourseGradeRow>) => {
    setCoursesRows(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleDeleteRow = (id: string) => {
    if (coursesRows.length <= 1) {
      showNotification('At least one course row is required.');
      return;
    }
    setCoursesRows(prev => prev.filter(r => r.id !== id));
    showNotification('Course row deleted.');
  };

  const handleResetCalculator = () => {
    if (window.confirm('Reset all course rows to default demonstration entries?')) {
      setCoursesRows([
        { id: 'row_1', code: 'ZOO 101', title: 'Zoology I', credits: 12, gradeKey: 'A', percentageMark: 76, inputMode: 'letter' },
        { id: 'row_2', code: 'BST 101', title: 'Biostatistics I', credits: 10, gradeKey: 'B_PLUS', percentageMark: 65, inputMode: 'letter' },
        { id: 'row_3', code: 'ANA 101', title: 'Human Anatomy I', credits: 16, gradeKey: 'A', percentageMark: 78, inputMode: 'letter' },
        { id: 'row_4', code: 'PHS 101', title: 'Physiology I', credits: 12, gradeKey: 'B_PLUS', percentageMark: 68, inputMode: 'letter' },
      ]);
      showNotification('Calculator reset to initial state.');
    }
  };

  // Import directly from registered / enrolled courses in storage
  const handleImportEnrolledCourses = () => {
    const allCourses = StorageService.getCourses();
    const enrolled = allCourses.filter(c => c.enrollmentStatus === 'enrolled' || c.status === 'active');
    
    if (enrolled.length === 0) {
      showNotification('No enrolled courses found in system catalogue. Using available demo courses.');
      return;
    }

    const importedRows: CourseGradeRow[] = enrolled.map((c, idx) => ({
      id: 'imp_' + c.id + '_' + idx,
      code: c.code,
      title: c.title,
      credits: c.credits || 10,
      gradeKey: activeGradeList[0]?.key || 'A',
      percentageMark: c.currentScore || 75,
      inputMode: 'letter',
    }));

    setCoursesRows(importedRows);
    showNotification(`Successfully imported ${importedRows.length} registered courses!`);
  };

  // Export calculation as CSV
  const handleExportCSV = () => {
    const headers = ['Course Code', 'Course Title', 'Credits', 'Input Mode', 'Percentage Mark', 'Assigned Grade', 'Grade Points', 'Quality Points'];
    const rows = coursesRows.map(r => {
      const gp = getGradePointForRow(r);
      const qp = (r.credits * gp).toFixed(2);
      const mark = r.inputMode === 'percentage' && r.percentageMark ? `${r.percentageMark}%` : 'N/A';
      return [
        `"${r.code}"`,
        `"${r.title.replace(/"/g, '""')}"`,
        r.credits,
        r.inputMode,
        mark,
        `"${r.gradeKey}"`,
        gp,
        qp
      ].join(',');
    });

    const summaryRow = `\n"SUMMARY","Weighted GPA",${calculationSummary.weightedGpa.toFixed(2)},"Total Credits",${calculationSummary.totalCredits},"Total Quality Points",${calculationSummary.totalQualityPoints.toFixed(2)}`;
    const fullContent = [headers.join(','), ...rows].join('\n') + summaryRow;

    const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CampusFlow_GPA_Calculation_${selectedSystem}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('GPA Calculation exported as CSV.');
  };

  // Print Calculation Report
  const handlePrintCalculation = () => {
    window.print();
    showNotification('Print dialog opened.');
  };

  // Existing Cumulative Standing Simulator State (preserves all existing capabilities)
  const [cumulativeScale, setCumulativeScale] = useState<'5.0' | '4.0'>('5.0');
  const [currentGpa, setCurrentGpa] = useState<number>(3.84);
  const [completedCredits, setCompletedCredits] = useState<number>(44);
  const [nextExpectedGpa, setNextExpectedGpa] = useState<number>(4.20);
  const [nextCredits, setNextCredits] = useState<number>(18);

  const totalFutureCredits = completedCredits + nextCredits;
  const projectedCumulativeGpa = totalFutureCredits > 0
    ? ((currentGpa * completedCredits) + (nextExpectedGpa * nextCredits)) / totalFutureCredits
    : currentGpa;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
              Academic Performance & Honors Modeling
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-semibold">
              Tanzania TCU & International Grading Hub
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            GPA Calculator & Degree Honours Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Model course credit weights, quality points, and evaluate international qualification equivalencies with complete mathematical transparency.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0 self-start md:self-center">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'calculator' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-sky-700" />
            <span>Course GPA Calculator</span>
          </button>
          <button
            onClick={() => setActiveTab('cumulative_projection')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'cumulative_projection' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span>Cumulative Standing Simulator</span>
          </button>
        </div>
      </div>

      {/* Floating feedback alert */}
      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ========================================================
          TAB 1: MULTI-COURSE GPA CALCULATOR & INTERNATIONAL SCALES
          ======================================================== */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          {/* Grading System Selection & Scale Overview */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <label className="text-xs font-black uppercase text-slate-700 block mb-1">
                  Select Grading System / Benchmark
                </label>
                <div className="relative inline-block w-full sm:w-80">
                  <select
                    value={selectedSystem}
                    onChange={(e) => setSelectedSystem(e.target.value as GradingSystemId)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
                  >
                    <option value="tcu_5">A. Tanzania TCU-Style 5.0 Scale (National Benchmark)</option>
                    <option value="us_4">B. United States 4.0 Scale (GPA Model)</option>
                    <option value="ects">C. European ECTS-Style Scale</option>
                    <option value="uk_honours">D. UK Honours Classification System</option>
                    <option value="custom">E. Custom Percentage / Institutional Scale</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleImportEnrolledCourses}
                  className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold flex items-center gap-1.5 transition-colors border border-sky-200"
                  title="Import registered courses from your semester catalogue"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Import Enrolled Courses</span>
                </button>

                <button
                  onClick={handleResetCalculator}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Reset to default demo courses"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Description & Official Scale Details */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    {gradingSystems[selectedSystem].name}
                  </h3>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    {gradingSystems[selectedSystem].description}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 font-black text-xs shrink-0">
                  {gradingSystems[selectedSystem].scaleLabel}
                </span>
              </div>

              {/* International Disclaimer */}
              {gradingSystems[selectedSystem].isInternationalEstimate && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 mt-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Planning Estimate Disclaimer: </strong>
                    International GPA conversions are estimates only. There is no single universal equivalence standard. Universities, credential evaluation agencies (such as WES, ECE, or UK ENIC), and foreign ministries apply their own institutional conversion rules. Tanzanian degrees should be reported on the official 5.0 scale unless an institution specifies otherwise.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Calculation Results Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Weighted GPA */}
            <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-2xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300">
                  Weighted Cumulative GPA
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl sm:text-5xl font-black text-white">
                    {calculationSummary.weightedGpa.toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-slate-300">
                    / {gradingSystems[selectedSystem].maxPoint.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black border ${currentStandingBadge.color}`}>
                  {currentStandingBadge.label}
                </span>
              </div>
            </div>

            {/* Total Credits */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-slate-500">
                  Total Course Credits
                </span>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                  {calculationSummary.totalCredits}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Across {coursesRows.length} active course units
                </p>
              </div>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                Denominator in GPA formula
              </div>
            </div>

            {/* Quality Points */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-slate-500">
                  Total Quality Points
                </span>
                <div className="text-3xl sm:text-4xl font-black text-sky-700 mt-2">
                  {calculationSummary.totalQualityPoints.toFixed(1)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Sum of (Credits × Grade Points)
                </p>
              </div>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                Numerator in GPA formula
              </div>
            </div>
          </div>

          {/* Mathematical Formula Banner */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-sky-600" /> Mathematical Formula
              </span>
              <div className="text-sm font-mono font-bold text-slate-800">
                GPA = ∑ (Course Credits × Grade Points) ÷ Total Credits
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 font-mono text-xs text-sky-950 font-bold self-start md:self-auto">
              {calculationSummary.totalQualityPoints.toFixed(1)} Pts ÷ {calculationSummary.totalCredits} Credits = {calculationSummary.weightedGpa.toFixed(2)}
            </div>
          </div>

          {/* Course Rows Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/50">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Course Grade Inputs & Credit Weights
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter course codes, credit loads, and letter grades or numerical marks
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddCourseRow}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Course Row</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 transition-colors flex items-center gap-1.5"
                  title="Export computation as CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                <button
                  onClick={handlePrintCalculation}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 transition-colors flex items-center gap-1.5"
                  title="Print official transcript calculation"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-3 sm:px-4 font-black">Course Code</th>
                    <th className="py-3 px-3 sm:px-4 font-black">Course Title</th>
                    <th className="py-3 px-3 sm:px-4 font-black">Credits</th>
                    <th className="py-3 px-3 sm:px-4 font-black">Input Mode</th>
                    <th className="py-3 px-3 sm:px-4 font-black">Grade / Mark</th>
                    <th className="py-3 px-3 sm:px-4 font-black">Grade Pts</th>
                    <th className="py-3 px-3 sm:px-4 font-black">Quality Pts</th>
                    <th className="py-3 px-3 sm:px-4 font-black text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coursesRows.map((row) => {
                    const gradePoint = getGradePointForRow(row);
                    const qualityPoints = (row.credits * gradePoint).toFixed(1);

                    return (
                      <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Course Code */}
                        <td className="py-2.5 px-3 sm:px-4 font-bold text-slate-900">
                          <input
                            type="text"
                            value={row.code}
                            onChange={(e) => handleUpdateRow(row.id, { code: e.target.value })}
                            className="w-24 sm:w-28 px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold uppercase focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            placeholder="ZOO 101"
                          />
                        </td>

                        {/* Course Title */}
                        <td className="py-2.5 px-3 sm:px-4 font-medium text-slate-800">
                          <input
                            type="text"
                            value={row.title}
                            onChange={(e) => handleUpdateRow(row.id, { title: e.target.value })}
                            className="w-40 sm:w-56 px-2 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            placeholder="Course Module Title"
                          />
                        </td>

                        {/* Credits */}
                        <td className="py-2.5 px-3 sm:px-4">
                          <input
                            type="number"
                            min="1"
                            max="36"
                            value={row.credits}
                            onChange={(e) => handleUpdateRow(row.id, { credits: Math.max(1, Number(e.target.value)) })}
                            className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                          />
                        </td>

                        {/* Mode Switcher: Letter vs Percentage */}
                        <td className="py-2.5 px-3 sm:px-4">
                          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                            <button
                              type="button"
                              onClick={() => handleUpdateRow(row.id, { inputMode: 'letter' })}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                row.inputMode === 'letter' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                              }`}
                            >
                              Letter
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateRow(row.id, { inputMode: 'percentage', percentageMark: row.percentageMark || 75 })}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                row.inputMode === 'percentage' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                              }`}
                            >
                              Mark %
                            </button>
                          </div>
                        </td>

                        {/* Grade / Mark Input */}
                        <td className="py-2.5 px-3 sm:px-4">
                          {row.inputMode === 'letter' ? (
                            <select
                              value={row.gradeKey}
                              onChange={(e) => handleUpdateRow(row.id, { gradeKey: e.target.value })}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            >
                              {activeGradeList.map(g => (
                                <option key={g.key} value={g.key}>
                                  {g.label} ({g.gradePoint.toFixed(1)} pts)
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={row.percentageMark ?? 70}
                                onChange={(e) => handleUpdateRow(row.id, { percentageMark: Number(e.target.value) })}
                                className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                              />
                              <span className="text-xs text-slate-400 font-bold">%</span>
                            </div>
                          )}
                        </td>

                        {/* Grade Point */}
                        <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-slate-700">
                          {gradePoint.toFixed(1)}
                        </td>

                        {/* Quality Points */}
                        <td className="py-2.5 px-3 sm:px-4 font-mono font-black text-sky-800">
                          {qualityPoints}
                        </td>

                        {/* Delete Row */}
                        <td className="py-2.5 px-3 sm:px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove course row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <span>Total Courses: <b>{coursesRows.length}</b></span>
                <span>•</span>
                <span>Cumulative Load: <b>{calculationSummary.totalCredits} Credits</b></span>
                <span>•</span>
                <span>Total Quality Points: <b>{calculationSummary.totalQualityPoints.toFixed(1)}</b></span>
              </div>

              <div className="text-sm font-black text-slate-900">
                Computed GPA: <span className="text-sky-700">{calculationSummary.weightedGpa.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Reference Table of Selected Grading System */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center justify-between">
              <span>Grade Bands & Points Schedule ({gradingSystems[selectedSystem].scaleLabel})</span>
              <span className="text-[11px] font-bold text-slate-400">Institutional Reference</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {activeGradeList.map((g) => (
                <div key={g.key} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-center">
                  <div className="text-sm font-black text-slate-900">{g.label.split(' ')[0]}</div>
                  <div className="text-xs font-bold text-sky-700 mt-0.5">{g.gradePoint.toFixed(1)} Points</div>
                  <div className="text-[10px] text-slate-500 mt-1">{g.minPercent}–{g.maxPercent}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: CUMULATIVE STANDING & HONOURS TARGET SIMULATOR
          ======================================================== */}
      {activeTab === 'cumulative_projection' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Parameters */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-sky-700" />
                  Prior Academic History & Upcoming Semester Target
                </h2>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                  <button
                    onClick={() => setCumulativeScale('5.0')}
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      cumulativeScale === '5.0' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    5.0 Scale (TCU)
                  </button>
                  <button
                    onClick={() => setCumulativeScale('4.0')}
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      cumulativeScale === '4.0' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    4.0 Scale (Intl)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Current Cumulative GPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={cumulativeScale === '5.0' ? '5.0' : '4.0'}
                    value={currentGpa}
                    onChange={(e) => setCurrentGpa(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
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
                    onChange={(e) => setCompletedCredits(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expected Next-Semester Target GPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={cumulativeScale === '5.0' ? '5.0' : '4.0'}
                    value={nextExpectedGpa}
                    onChange={(e) => setNextExpectedGpa(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Upcoming Registered Semester Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={nextCredits}
                    onChange={(e) => setNextCredits(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong>TCU Official Classification Standard (5.0 Scale):</strong> First Class (4.40–5.00) · Upper Second Class (3.50–4.39) · Lower Second Class (2.70–3.49) · Pass (2.00–2.69).
              </div>
            </div>

            {/* Projected Result Card */}
            <div className="bg-gradient-to-br from-slate-900 to-sky-950 rounded-2xl p-6 text-white shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Projected Cumulative Standing
                </span>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">{projectedCumulativeGpa.toFixed(2)}</span>
                  <span className="text-sm font-semibold text-slate-300">/ {cumulativeScale}</span>
                </div>

                <div className="mt-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${
                    cumulativeScale === '5.0' 
                      ? getTcuClassification(projectedCumulativeGpa).color 
                      : getUsClassification(projectedCumulativeGpa).color
                  }`}>
                    {cumulativeScale === '5.0' 
                      ? getTcuClassification(projectedCumulativeGpa).label 
                      : getUsClassification(projectedCumulativeGpa).label
                    }
                  </span>
                </div>

                <p className="mt-4 text-xs text-slate-200 leading-relaxed">
                  Targeting an average of {nextExpectedGpa.toFixed(2)} over {nextCredits} upcoming credits will shift your cumulative standing from {currentGpa.toFixed(2)} to {projectedCumulativeGpa.toFixed(2)}.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-slate-300">
                <span>Total Combined Credits</span>
                <span className="font-extrabold text-white">{totalFutureCredits}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
