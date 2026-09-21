import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  FileText, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Download,
  Calendar,
  Clock,
  MapPin,
  UserCheck
} from 'lucide-react';
import { DayOfWeek, TimetableSlot } from '../types';
import { AIService } from '../services/aiService';

interface TimetableImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSlots: (slots: TimetableSlot[], mode: 'replace' | 'merge') => void;
  currentCourseCodes: string[];
}

export const TimetableImportModal: React.FC<TimetableImportModalProps> = ({
  isOpen,
  onClose,
  onImportSlots,
  currentCourseCodes,
}) => {
  const [activeTab, setActiveTab] = useState<'ai_photo' | 'csv' | 'manual'>('ai_photo');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Staged slots ready for review before confirmation
  const [previewSlots, setPreviewSlots] = useState<TimetableSlot[]>([]);

  // Manual Form State
  const [manualSlot, setManualSlot] = useState<Partial<TimetableSlot>>({
    courseCode: 'BIO 203',
    courseName: 'Biostatistics & Research Methodology',
    day: 'Monday',
    startTime: '09:30',
    endTime: '10:30',
    hall: 'Hall 03',
    building: 'CoNAS Lecture Complex',
    lecturer: 'Prof. Assad',
    lecturerEmail: 'assad.m@udsm.ac.tz',
    year: 1,
    semester: 1,
    type: 'Lecture',
    color: '#e6ad3d',
    notes: 'Weekly lecture session in Hall 03',
    attendanceRequired: true,
  });

  if (!isOpen) return null;

  // Handle Photo / Image Upload for AI Scanning
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        const mimeType = file.type || 'image/jpeg';

        const result = await AIService.parseTimetable({
          base64Data: base64,
          mimeType,
        });

        if (result.slots && result.slots.length > 0) {
          setPreviewSlots(result.slots);
          setSuccessMessage(`AI detected ${result.slots.length} class periods from your image.`);
        } else {
          setErrorMessage('Could not find class entries. Please ensure the timetable image is legible.');
        }
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage('Failed to process image: ' + (err.message || 'Unknown error'));
      setIsProcessing(false);
    }
  };

  // Handle CSV File Upload
  const handleCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

        if (lines.length < 2) {
          throw new Error('CSV file is empty or missing data rows');
        }

        // Expected format: CourseCode, CourseName, Day, StartTime, EndTime, Hall, Lecturer, Year, Semester, Type
        const parsed: TimetableSlot[] = [];
        const startIdx = lines[0].toLowerCase().includes('course') ? 1 : 0;

        for (let i = startIdx; i < lines.length; i++) {
          const parts = lines[i].split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
          if (parts.length >= 6) {
            const courseCode = parts[0] || 'BIO 203';
            const courseName = parts[1] || 'Academic Course';
            const day = (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].find(
              d => d.toLowerCase() === parts[2]?.toLowerCase()
            ) || 'Monday') as DayOfWeek;
            const startTime = parts[3] || '09:30';
            const endTime = parts[4] || '10:30';
            const hall = parts[5] || 'Hall 03';
            const lecturer = parts[6] || 'Prof. Assad';
            const year = parseInt(parts[7]) || 1;
            const semester = parseInt(parts[8]) || 1;
            const type = (['Lecture', 'Practical', 'Tutorial', 'Seminar'].includes(parts[9]) ? parts[9] : 'Lecture') as any;

            parsed.push({
              id: 'csv_' + Date.now() + '_' + i,
              courseCode,
              courseName,
              day,
              startTime,
              endTime,
              timeFormatted: `${startTime} - ${endTime}`,
              hall,
              lecturer,
              year,
              semester,
              type,
              color: i % 4 === 0 ? '#1e6fa8' : i % 4 === 1 ? '#e6ad3d' : i % 4 === 2 ? '#16845d' : '#9333ea',
              attendanceRequired: true,
            });
          }
        }

        if (parsed.length > 0) {
          setPreviewSlots(parsed);
          setSuccessMessage(`Successfully parsed ${parsed.length} rows from CSV.`);
        } else {
          setErrorMessage('Could not parse any rows. Please check CSV format.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error reading CSV file');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const csvContent = 
`CourseCode,CourseName,Day,StartTime,EndTime,Hall,Lecturer,Year,Semester,Type
BIO 203,Biostatistics & Research Methodology,Monday,09:30,10:30,Hall 03,Prof. Assad,1,1,Lecture
ZOO 201,Zoology I (Chordate Diversity),Monday,11:00,13:00,Science Block B204,Dr. A. Mushi,2,1,Lecture
ECO 202,Applied Ecology & Conservation,Tuesday,08:30,10:30,Lecture Hall A3,Prof. J. Kweka,2,1,Lecture
BIO 203,Biostatistics R-Studio Lab,Tuesday,14:00,16:00,ICT Lab 2,Dr. Neema Said,2,1,Practical
ENG 004,Scientific Computing,Thursday,09:30,11:30,Hall 03,Prof. Assad,1,1,Lecture
CHE 201,Enzyme Kinetics Wet Lab,Friday,08:30,11:30,Chemistry Lab 1,Dr. H. Ally,2,1,Practical`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'CampusFlow_Semester_Timetable_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add a slot from manual form to preview list
  const handleAddManualSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSlot.courseCode || !manualSlot.startTime || !manualSlot.endTime) {
      setErrorMessage('Please provide course code, start time, and end time.');
      return;
    }

    const newSlot: TimetableSlot = {
      id: 'manual_' + Date.now(),
      courseCode: manualSlot.courseCode.toUpperCase(),
      courseName: manualSlot.courseName || 'Course Session',
      day: (manualSlot.day as DayOfWeek) || 'Monday',
      startTime: manualSlot.startTime || '09:30',
      endTime: manualSlot.endTime || '10:30',
      timeFormatted: `${manualSlot.startTime} - ${manualSlot.endTime}`,
      hall: manualSlot.hall || 'Hall 03',
      building: manualSlot.building || 'Campus Complex',
      lecturer: manualSlot.lecturer || 'Prof. Assad',
      lecturerEmail: manualSlot.lecturerEmail || 'faculty@udsm.ac.tz',
      year: Number(manualSlot.year) || 1,
      semester: Number(manualSlot.semester) || 1,
      type: (manualSlot.type as any) || 'Lecture',
      color: manualSlot.color || '#1e6fa8',
      notes: manualSlot.notes || '',
      attendanceRequired: manualSlot.attendanceRequired !== false,
    };

    setPreviewSlots(prev => [...prev, newSlot]);
    setSuccessMessage(`Added ${newSlot.courseCode} (${newSlot.day} ${newSlot.timeFormatted}) to import list.`);
    setErrorMessage(null);
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (previewSlots.length === 0) {
      setErrorMessage('No timetable periods to import. Add slots manually, or upload a CSV / picture first.');
      return;
    }
    onImportSlots(previewSlots, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        id="timetable-import-dialog"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Upload & Setup Semester Timetable</h2>
              <p className="text-xs text-slate-300">
                Import your classes via AI Photo OCR, CSV spreadsheet, or manual entry.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            id="tab-ai-photo"
            onClick={() => { setActiveTab('ai_photo'); setErrorMessage(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'ai_photo'
                ? 'bg-white border-sky-600 text-sky-800 shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>AI Photo / Camera Scan</span>
            <span className="text-[10px] uppercase tracking-wider bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-md font-bold">
              Smart
            </span>
          </button>

          <button
            id="tab-csv"
            onClick={() => { setActiveTab('csv'); setErrorMessage(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'csv'
                ? 'bg-white border-sky-600 text-sky-800 shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>CSV / Excel Upload</span>
          </button>

          <button
            id="tab-manual"
            onClick={() => { setActiveTab('manual'); setErrorMessage(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'manual'
                ? 'bg-white border-sky-600 text-sky-800 shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4 text-amber-600" />
            <span>Manual Entry</span>
          </button>
        </div>

        {/* Alerts & Notifications */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: AI PHOTO / CAMERA SCAN */}
          {activeTab === 'ai_photo' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-sky-50 to-indigo-50/50 border border-sky-200/80 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Take a Photo or Upload Timetable Image</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Snap a photo of your printed department noticeboard schedule, PDF screenshot, or lecture hall chart.
                      Our Gemini multimodal engine extracts course codes, venues (e.g. <b>Hall 03</b>), times (<b>09:30–10:30 AM</b>), and lecturers (<b>Prof. Assad</b>).
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <label 
                    id="ai-photo-dropzone"
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      isProcessing 
                        ? 'border-sky-400 bg-sky-50/50' 
                        : 'border-slate-300 hover:border-sky-500 bg-white/70 hover:bg-white'
                    }`}
                  >
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      className="hidden" 
                      onChange={handleImageFile}
                      disabled={isProcessing}
                    />
                    {isProcessing ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-9 h-9 border-3 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-semibold text-sky-800">
                          Gemini Vision is analyzing your timetable schedule...
                        </p>
                        <p className="text-xs text-slate-500">Detecting courses, halls, times, and faculty names</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mb-1">
                          <Upload className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-slate-800">
                          Click to upload or drag & drop photo
                        </span>
                        <span className="text-xs text-slate-500">
                          Supports JPG, PNG, WEBP, or phone camera snapshots (up to 15MB)
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CSV UPLOAD */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Standardized Semester CSV Format</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Include: CourseCode, CourseName, Day, StartTime, EndTime, Hall, Lecturer, Year, Semester
                  </p>
                </div>
                <button
                  id="btn-download-csv-template"
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-sky-600" />
                  Download Sample CSV
                </button>
              </div>

              <label 
                id="csv-file-dropzone"
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-white transition-colors"
              >
                <input 
                  type="file" 
                  accept=".csv,.txt" 
                  className="hidden" 
                  onChange={handleCsvFile}
                  disabled={isProcessing}
                />
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-800">
                  Select your Timetable CSV file
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Click to browse from files or drag and drop
                </span>
              </label>
            </div>
          )}

          {/* TAB 3: MANUAL ENTRY FORM */}
          {activeTab === 'manual' && (
            <form onSubmit={handleAddManualSlot} className="space-y-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    value={manualSlot.courseCode || ''}
                    onChange={e => setManualSlot(prev => ({ ...prev, courseCode: e.target.value.toUpperCase() }))}
                    placeholder="e.g. BIO 203, ENG 004"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Course Name</label>
                  <input
                    type="text"
                    value={manualSlot.courseName || ''}
                    onChange={e => setManualSlot(prev => ({ ...prev, courseName: e.target.value }))}
                    placeholder="e.g. Biostatistics & Research Methodology"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Day of Week *</label>
                  <select
                    value={manualSlot.day || 'Monday'}
                    onChange={e => setManualSlot(prev => ({ ...prev, day: e.target.value as DayOfWeek }))}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time (HH:mm) *</label>
                  <input
                    type="time"
                    required
                    value={manualSlot.startTime || '09:30'}
                    onChange={e => setManualSlot(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time (HH:mm) *</label>
                  <input
                    type="time"
                    required
                    value={manualSlot.endTime || '10:30'}
                    onChange={e => setManualSlot(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hall / Venue *</label>
                  <input
                    type="text"
                    required
                    value={manualSlot.hall || ''}
                    onChange={e => setManualSlot(prev => ({ ...prev, hall: e.target.value }))}
                    placeholder="e.g. Hall 03, ICT Lab 2"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lecturer / Tutor *</label>
                  <input
                    type="text"
                    required
                    value={manualSlot.lecturer || ''}
                    onChange={e => setManualSlot(prev => ({ ...prev, lecturer: e.target.value }))}
                    placeholder="e.g. Prof. Assad"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Session Type</label>
                  <select
                    value={manualSlot.type || 'Lecture'}
                    onChange={e => setManualSlot(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Practical">Practical / Lab</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Seminar">Seminar / Presentation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
                  <select
                    value={manualSlot.year || 1}
                    onChange={e => setManualSlot(prev => ({ ...prev, year: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={manualSlot.semester || 1}
                    onChange={e => setManualSlot(prev => ({ ...prev, semester: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Complex / Building</label>
                  <input
                    type="text"
                    value={manualSlot.building || ''}
                    onChange={e => setManualSlot(prev => ({ ...prev, building: e.target.value }))}
                    placeholder="e.g. CoNAS Main Complex"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  id="btn-add-manual-slot"
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add to Staged Import List
                </button>
              </div>
            </form>
          )}

          {/* STAGED PREVIEW SECTION */}
          <div className="border-t border-slate-200 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Staged Timetable Periods ({previewSlots.length})
                </h4>
                {previewSlots.length > 0 && (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    Ready to Save
                  </span>
                )}
              </div>

              {previewSlots.length > 0 && (
                <button
                  onClick={() => setPreviewSlots([])}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear List
                </button>
              )}
            </div>

            {previewSlots.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                No slots staged yet. Upload a photo, import a CSV, or add classes manually above.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white shadow-2xs">
                {previewSlots.map((slot, index) => (
                  <div key={slot.id || index} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs">
                    <div className="flex items-center gap-3">
                      <span 
                        className="w-2.5 h-8 rounded-full" 
                        style={{ backgroundColor: slot.color || '#1e6fa8' }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{slot.courseCode}</span>
                          <span className="text-slate-600 truncate max-w-xs">{slot.courseName}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {slot.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-0.5">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {slot.day}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {slot.timeFormatted || `${slot.startTime} - ${slot.endTime}`}
                          </span>
                          <span className="flex items-center gap-1 text-sky-700 font-semibold">
                            <MapPin className="w-3 h-3 text-sky-500" />
                            {slot.hall}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-slate-400" />
                            {slot.lecturer}
                          </span>
                          <span className="bg-amber-50 text-amber-800 px-1 rounded text-[10px]">
                            Y{slot.year} S{slot.semester}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setPreviewSlots(prev => prev.filter((_, i) => i !== index))}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md transition-colors"
                      title="Remove row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer with Mode Selector and Confirm Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 font-semibold">Import Strategy:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                value="merge"
                checked={importMode === 'merge'}
                onChange={() => setImportMode('merge')}
                className="text-sky-600 focus:ring-sky-500"
              />
              <span className="text-slate-700">Merge with existing</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer ml-2">
              <input
                type="radio"
                name="importMode"
                value="replace"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className="text-sky-600 focus:ring-sky-500"
              />
              <span className="text-slate-700">Replace current schedule</span>
            </label>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-import-timetable"
              type="button"
              onClick={handleConfirmImport}
              disabled={previewSlots.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Apply & Save {previewSlots.length > 0 ? `(${previewSlots.length} Slots)` : ''}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
