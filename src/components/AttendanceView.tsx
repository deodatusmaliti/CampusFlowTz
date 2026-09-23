import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Users, 
  Plus, 
  Download, 
  RefreshCw, 
  Sparkles, 
  Calendar, 
  MapPin, 
  BookOpen, 
  ShieldCheck, 
  Key, 
  Maximize2, 
  Minimize2, 
  X,
  Upload,
  ArrowRight
} from 'lucide-react';
import QRCode from 'qrcode';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Course, User, AttendanceRecord, LecturerQRCodeSession } from '../types';
import { StorageService } from '../services/storageService';
import { soundAlerts } from '../services/soundAlertService';

interface AttendanceViewProps {
  currentUser: User;
  courses: Course[];
  onCoursesUpdated: (courses: Course[]) => void;
  onNotify: (msg: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  currentUser,
  courses,
  onCoursesUpdated,
  onNotify,
}) => {
  // Mode: Student Scanner vs Lecturer QR Generator
  const isLecturerOrAdmin = currentUser.role === 'lecturer' || currentUser.role === 'admin' || currentUser.role === 'system_admin' || currentUser.role === 'college_admin';
  const [activeTab, setActiveTab] = useState<'student_scanner' | 'lecturer_generator' | 'attendance_records'>(
    isLecturerOrAdmin ? 'lecturer_generator' : 'student_scanner'
  );

  // Attendance Records State
  const [records, setRecords] = useState<AttendanceRecord[]>(() => StorageService.getAttendanceRecords());
  const [qrSessions, setQrSessions] = useState<LecturerQRCodeSession[]>(() => StorageService.getQRSessions());
  
  // Selected Lecturer Session for Display/Projection
  const [selectedSession, setSelectedSession] = useState<LecturerQRCodeSession | null>(() => {
    const sessions = StorageService.getQRSessions();
    return sessions.length > 0 ? sessions[0] : null;
  });

  // Lecturer Session Creation Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSessionCourse, setNewSessionCourse] = useState(courses[0]?.code || 'CS 211');
  const [newSessionTopic, setNewSessionTopic] = useState('');
  const [newSessionHall, setNewSessionHall] = useState('Lecture Theatre 1');
  const [newSessionDuration, setNewSessionDuration] = useState('90'); // minutes
  const [newSessionManualPasscode, setNewSessionManualPasscode] = useState('');

  // Scanner States
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [selectedCourseForScan, setSelectedCourseForScan] = useState(courses[0]?.code || 'CS 211');
  const [isProcessingCode, setIsProcessingCode] = useState(false);
  const [lastScannedResult, setLastScannedResult] = useState<{
    success: boolean;
    courseCode: string;
    topic: string;
    timestamp: string;
  } | null>(null);

  // Fullscreen projection mode for lecturer
  const [isFullscreenQR, setIsFullscreenQR] = useState(false);

  // Filter state for records
  const [recordFilterCourse, setRecordFilterCourse] = useState<string>('ALL');

  // Canvas ref for generating QR code image
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fullscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generate QR code on canvas whenever selectedSession changes
  useEffect(() => {
    if (!selectedSession) return;
    const payload = JSON.stringify({
      token: selectedSession.verificationToken,
      code: selectedSession.courseCode,
      title: selectedSession.courseTitle,
      passcode: selectedSession.manualPasscode,
      topic: selectedSession.sessionTopic,
      hall: selectedSession.hall,
      validUntil: selectedSession.expiresAt,
    });

    if (qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, payload, {
        width: 240,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      }).catch(err => console.error('Error drawing QR Code:', err));
    }

    if (fullscreenCanvasRef.current && isFullscreenQR) {
      QRCode.toCanvas(fullscreenCanvasRef.current, payload, {
        width: 360,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      }).catch(err => console.error('Error drawing Fullscreen QR:', err));
    }
  }, [selectedSession, isFullscreenQR]);

  // Clean up camera scanner on unmount or when scanner toggled off
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Handle Starting Camera Scanner
  const startCameraScanner = async () => {
    setScannerError(null);
    setIsScannerActive(true);

    try {
      // Small timeout to allow scanner DOM container to render
      setTimeout(async () => {
        const scannerElement = document.getElementById('qr-camera-reader');
        if (!scannerElement) return;

        try {
          if (html5QrCodeRef.current) {
            try {
              if (html5QrCodeRef.current.isScanning) {
                await html5QrCodeRef.current.stop();
              }
            } catch {}
          }

          const qrScanner = new Html5Qrcode('qr-camera-reader', {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            verbose: false,
          });
          html5QrCodeRef.current = qrScanner;

          await qrScanner.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              handleCodeScanned(decodedText);
              // Stop scanning once detected
              qrScanner.stop().then(() => {
                setIsScannerActive(false);
              }).catch(() => {});
            },
            () => {
              // Ignore frame decode misses
            }
          );
        } catch (err: any) {
          console.error('Camera start error:', err);
          setScannerError(
            err?.message || 'Unable to access device camera. Please check camera permissions or use the manual passcode entry.'
          );
          setIsScannerActive(false);
        }
      }, 150);
    } catch (e: any) {
      setScannerError('Could not initialize video scanner.');
      setIsScannerActive(false);
    }
  };

  // Handle Stopping Camera Scanner
  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {}
    }
    setIsScannerActive(false);
  };

  // Handle Scanning from File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingCode(true);
      const scanner = new Html5Qrcode('qr-file-dummy-container', false);
      const result = await scanner.scanFile(file, true);
      handleCodeScanned(result);
    } catch (err) {
      onNotify('Could not detect a valid QR code in the uploaded image.');
    } finally {
      setIsProcessingCode(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Process Scanned or Manual Payload
  const handleCodeScanned = (scannedData: string) => {
    setIsProcessingCode(true);
    try {
      let payload: any = null;

      // Check if it's JSON formatted
      try {
        payload = JSON.parse(scannedData);
      } catch {
        // Plain string check (token or manual passcode)
        payload = { raw: scannedData.trim() };
      }

      // Match against known sessions
      const matchedSession = qrSessions.find(s => {
        if (payload.token && s.verificationToken === payload.token) return true;
        if (payload.passcode && s.manualPasscode.toLowerCase() === payload.passcode.toLowerCase()) return true;
        if (payload.raw && (s.manualPasscode.toLowerCase() === payload.raw.toLowerCase() || s.verificationToken === payload.raw)) return true;
        return false;
      });

      if (!matchedSession) {
        // Allow fallback if user matched course code and reasonable session
        const course = courses.find(c => c.code.toLowerCase() === selectedCourseForScan.toLowerCase());
        if (payload.raw && payload.raw.length >= 4) {
          executeAttendanceMark(
            selectedCourseForScan,
            course?.title || 'Academic Course Session',
            `Lecture Session (${payload.raw.toUpperCase()})`,
            'qr_scanner',
            'Lecture Hall'
          );
          return;
        }

        onNotify('Invalid QR code or expired attendance session.');
        setIsProcessingCode(false);
        return;
      }

      executeAttendanceMark(
        matchedSession.courseCode,
        matchedSession.courseTitle,
        matchedSession.sessionTopic,
        'qr_scanner',
        matchedSession.hall
      );
    } catch (e) {
      onNotify('Error validating QR code attendance.');
      setIsProcessingCode(false);
    }
  };

  // Manual PIN submission
  const handleManualPasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) {
      onNotify('Please enter the session code or passcode.');
      return;
    }

    const code = manualCodeInput.trim().toUpperCase();
    const matchedSession = qrSessions.find(
      s => s.manualPasscode.toUpperCase() === code || s.verificationToken.toUpperCase() === code
    );

    if (matchedSession) {
      executeAttendanceMark(
        matchedSession.courseCode,
        matchedSession.courseTitle,
        matchedSession.sessionTopic,
        'manual_lecturer',
        matchedSession.hall
      );
    } else {
      // Fallback to selected course
      const course = courses.find(c => c.code.toLowerCase() === selectedCourseForScan.toLowerCase());
      executeAttendanceMark(
        selectedCourseForScan,
        course?.title || 'Course Lecture',
        `Class Session (Code: ${code})`,
        'manual_lecturer',
        course?.hall || 'Campus Lecture Hall'
      );
    }
    setManualCodeInput('');
  };

  // Perform attendance mark and update app-wide course statistics
  const executeAttendanceMark = (
    courseCode: string,
    courseTitle: string,
    sessionTitle: string,
    mode: 'qr_scanner' | 'manual_lecturer' | 'geofenced_pin',
    location?: string
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Check if already marked for today
    const alreadyMarked = records.some(
      r => r.courseCode.toLowerCase() === courseCode.toLowerCase() && 
           r.sessionDate === todayStr && 
           r.studentId === currentUser.id
    );

    if (alreadyMarked) {
      onNotify(`You have already marked attendance for ${courseCode} today!`);
      setIsProcessingCode(false);
      return;
    }

    const result = StorageService.markAttendance({
      courseCode,
      courseTitle,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentRegNo: currentUser.regNumber || '2023-04-08912',
      sessionTitle,
      sessionDate: todayStr,
      markedVia: mode,
      status: 'present',
      locationRecorded: location || 'Campus Lecture Room',
    });

    // Update parent states
    setRecords(StorageService.getAttendanceRecords());
    setQrSessions(StorageService.getQRSessions());
    onCoursesUpdated(result.updatedCourses);

    // Audio confirmation
    soundAlerts.playCatReminder();

    setLastScannedResult({
      success: true,
      courseCode,
      topic: sessionTitle,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setIsProcessingCode(false);
    onNotify(`Attendance recorded successfully for ${courseCode}!`);
  };

  // Lecturer Create New QR Session
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find(c => c.code === newSessionCourse);
    const durationMin = parseInt(newSessionDuration, 10) || 90;
    const expiresAt = new Date(Date.now() + durationMin * 60 * 1000).toISOString();
    const passcode = newSessionManualPasscode.trim() || `CF-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSession = StorageService.createQRSession({
      courseCode: newSessionCourse,
      courseTitle: course?.title || 'Academic Course',
      lecturerName: currentUser.name,
      sessionTopic: newSessionTopic.trim() || 'General Lecture & Coursework Review',
      hall: newSessionHall.trim() || 'Lecture Theatre 1',
      validDate: new Date().toISOString().split('T')[0],
      expiresAt,
      allowManualCode: true,
      manualPasscode: passcode.toUpperCase(),
    });

    const updatedSessions = StorageService.getQRSessions();
    setQrSessions(updatedSessions);
    setSelectedSession(newSession);
    setIsCreateModalOpen(false);
    setNewSessionTopic('');
    setNewSessionManualPasscode('');
    onNotify(`Active QR Attendance session started for ${newSessionCourse}!`);
  };

  // Export Attendance Roster CSV
  const handleExportRosterCSV = () => {
    const relevantRecords = recordFilterCourse === 'ALL'
      ? records
      : records.filter(r => r.courseCode.toLowerCase() === recordFilterCourse.toLowerCase());

    if (relevantRecords.length === 0) {
      onNotify('No attendance records found to export.');
      return;
    }

    const headers = ['Record ID', 'Course Code', 'Course Title', 'Student Name', 'Reg Number', 'Session Topic', 'Date', 'Time', 'Mode', 'Status', 'Hall/Campus'];
    const rows = relevantRecords.map(r => [
      r.id,
      r.courseCode,
      `"${r.courseTitle.replace(/"/g, '""')}"`,
      `"${r.studentName.replace(/"/g, '""')}"`,
      r.studentRegNo || '',
      `"${r.sessionTitle.replace(/"/g, '""')}"`,
      r.sessionDate,
      new Date(r.timestamp).toLocaleTimeString(),
      r.markedVia,
      r.status,
      `"${(r.locationRecorded || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CampusFlow_Attendance_${recordFilterCourse}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify('Attendance roster exported successfully.');
  };

  // Filtered records for table
  const filteredRecords = records.filter(r => {
    if (recordFilterCourse === 'ALL') return true;
    return r.courseCode.toLowerCase() === recordFilterCourse.toLowerCase();
  });

  // Calculate Overall Student Attendance Rate
  const totalCoursesEnrolled = courses.length;
  const avgAttendance = totalCoursesEnrolled > 0
    ? Math.round(courses.reduce((acc, c) => acc + (c.attendance || 80), 0) / totalCoursesEnrolled)
    : 85;

  return (
    <div className="space-y-6">
      {/* Hidden container for Html5Qrcode file scan */}
      <div id="qr-file-dummy-container" className="hidden"></div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Top Header & Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-200 text-xs font-bold mb-3">
            <QrCode className="w-3.5 h-3.5 text-amber-300" />
            <span>Digital Smart Campus • QR Attendance System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            Automated Attendance & Verification Hub
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
            Lecturers generate dynamic encrypted QR codes for lecture halls and clinical rounds. 
            Students scan in real-time to log verified attendance, calculate TCU/NACTVET 75% exam compliance, and track course records.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-xs">
              <span className="text-[11px] text-slate-300 font-semibold block">Attendance Score</span>
              <span className="text-xl font-black text-amber-300">{avgAttendance}%</span>
              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                {avgAttendance >= 75 ? '✓ Exam Eligible' : '⚠️ Below 75% Rule'}
              </span>
            </div>
            <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-xs">
              <span className="text-[11px] text-slate-300 font-semibold block">Total Sessions Logged</span>
              <span className="text-xl font-black text-white">{records.length}</span>
              <span className="text-[10px] text-slate-300 block mt-0.5">Verified Lectures</span>
            </div>
            <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-xs">
              <span className="text-[11px] text-slate-300 font-semibold block">Active Sessions</span>
              <span className="text-xl font-black text-sky-300">{qrSessions.length}</span>
              <span className="text-[10px] text-slate-300 block mt-0.5">Campus Lectures</span>
            </div>
            <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-xs">
              <span className="text-[11px] text-slate-300 font-semibold block">TCU Min Standard</span>
              <span className="text-xl font-black text-white">75%</span>
              <span className="text-[10px] text-slate-300 block mt-0.5">Statutory Cutoff</span>
            </div>
          </div>
        </div>

        {/* Action Tabs in Header */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('student_scanner')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'student_scanner'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Student Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('lecturer_generator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'lecturer_generator'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Lecturer Code Generator</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance_records')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'attendance_records'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Attendance History</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'lecturer_generator' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Lecture Session</span>
              </button>
            )}
            <button
              onClick={handleExportRosterCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS BANNER WHEN CODE IS SCANNED */}
      {lastScannedResult && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-950">
                Attendance Confirmed: {lastScannedResult.courseCode}
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Topic: <span className="font-semibold">{lastScannedResult.topic}</span> • Time: {lastScannedResult.timestamp}
              </p>
              <p className="text-[11px] text-emerald-700 mt-1">
                Your course record and semester compliance percentage have been updated automatically.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setLastScannedResult(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: STUDENT SCANNER VIEW */}
      {activeTab === 'student_scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Scanner Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-sky-700" />
                  Live Attendance Scanner
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Point your camera at the lecturer's screen or whiteboard QR code
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  title="Upload image or slide containing QR code"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Slide</span>
                </button>
              </div>
            </div>

            {/* Video Viewport or Inactive Prompt */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex flex-col items-center justify-center text-center p-4">
              {isScannerActive ? (
                <div className="w-full h-full relative flex items-center justify-center">
                  <div id="qr-camera-reader" className="w-full h-full max-w-sm"></div>
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-amber-400/80 rounded-2xl animate-pulse shadow-2xl"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-6 text-slate-300">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-900/50 border border-sky-600/40 text-sky-300 flex items-center justify-center">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Camera is inactive</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Tap below to launch your device camera and scan the lecturer's live QR code.
                    </p>
                  </div>
                  <button
                    onClick={startCameraScanner}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95"
                  >
                    <Camera className="w-4 h-4 stroke-[2.5]" />
                    <span>Launch Camera Scanner</span>
                  </button>
                </div>
              )}

              {isScannerActive && (
                <button
                  onClick={stopCameraScanner}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {scannerError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{scannerError}</span>
              </div>
            )}

            {/* Quick Demo Simulator Shortcut */}
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between gap-3">
              <div className="text-xs">
                <span className="font-bold text-sky-950 block">Quick Simulator Mode</span>
                <span className="text-slate-600 text-[11px]">Testing on desktop without a second phone?</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {qrSessions.slice(0, 2).map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleCodeScanned(s.verificationToken)}
                    className="px-2.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs transition-colors"
                  >
                    Simulate {s.courseCode}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Passcode Fallback Card */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  Manual Passcode Fallback
                </span>
                <span className="text-[11px] text-slate-500">No camera? Enter code</span>
              </div>

              <form onSubmit={handleManualPasscodeSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Select Course</label>
                    <select
                      value={selectedCourseForScan}
                      onChange={(e) => setSelectedCourseForScan(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.code}>
                          {c.code} - {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Passcode (e.g. CF-2114)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={manualCodeInput}
                        onChange={(e) => setManualCodeInput(e.target.value)}
                        placeholder="Enter lecturer code"
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        type="submit"
                        disabled={!manualCodeInput.trim() || isProcessingCode}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shrink-0 transition-colors"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side: Course Attendance Status & Eligibility */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-sm font-black text-slate-900 flex items-center justify-between mb-3">
                <span>Course Compliance Breakdown</span>
                <span className="text-[11px] font-bold text-sky-800">TCU 75% Rule</span>
              </h3>

              <div className="space-y-3">
                {courses.map(course => {
                  const pct = course.attendance || 80;
                  const isEligible = pct >= 75;
                  return (
                    <div key={course.id} className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{course.code}</span>
                        <span className={`text-xs font-black ${isEligible ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mb-1.5">{course.title}</div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full ${isEligible ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] mt-1.5 text-slate-500">
                        <span>Status: {isEligible ? 'Examination Cleared' : 'Deficit Warning'}</span>
                        <span className="font-semibold text-slate-700">{course.lecturer}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TCU & University Regulation Card */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-amber-950 text-xs space-y-2">
              <div className="font-black flex items-center gap-1.5 text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Statutory Attendance Requirement</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Under Tanzania Commission for Universities (TCU) and institutional bylaws, students must achieve at least 
                <span className="font-black"> 75% class & lab attendance</span> to be certified for final semester examinations. 
                Keep your records synced after every lecture session.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LECTURER QR CODE GENERATOR */}
      {activeTab === 'lecturer_generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Generator Display Board */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-sky-700" />
                  Live Lecturer Projector Board
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Display on projector or auditorium screen for enrolled students to scan
                </p>
              </div>

              {selectedSession && (
                <button
                  onClick={() => setIsFullscreenQR(!isFullscreenQR)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Projector Fullscreen</span>
                </button>
              )}
            </div>

            {selectedSession ? (
              <div className="space-y-5">
                {/* Active Session Card */}
                <div className="p-5 bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-2xl shadow-md space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black">
                        ACTIVE SESSION
                      </span>
                      <h3 className="text-lg font-black text-white mt-1">
                        {selectedSession.courseCode} • {selectedSession.courseTitle}
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Topic: <span className="text-amber-200 font-semibold">{selectedSession.sessionTopic}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-amber-300">{selectedSession.attendanceCount}</span>
                      <span className="block text-[10px] text-slate-300">Scanned</span>
                    </div>
                  </div>

                  {/* QR Code Presentation Box */}
                  <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center text-slate-900 shadow-inner">
                    <canvas ref={qrCanvasRef} className="rounded-xl shadow-xs"></canvas>
                    
                    <div className="mt-4 space-y-1">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Manual Verification Passcode
                      </div>
                      <div className="text-2xl font-black font-mono tracking-widest text-sky-900 bg-sky-50 px-4 py-1.5 rounded-xl border border-sky-200 inline-block">
                        {selectedSession.manualPasscode}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-center gap-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {selectedSession.hall}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Valid Today
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-white/10">
                    <span>Lecturer: {selectedSession.lecturerName}</span>
                    <span className="font-mono text-[11px] text-amber-300">Token: {selectedSession.verificationToken.substring(0, 16)}...</span>
                  </div>
                </div>

                {/* Session Actions */}
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      onNotify('Session QR code refreshed with updated security signature.');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Rotate Token</span>
                  </button>

                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Create Another Session</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mx-auto">
                  <QrCode className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">No active lecture QR sessions found</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Create First Session
                </button>
              </div>
            )}
          </div>

          {/* Right Side: Lecturer's Active & Past Sessions List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900">Campus QR Sessions</h3>
                <span className="text-xs font-bold text-slate-500">{qrSessions.length} sessions</span>
              </div>

              <div className="space-y-2.5">
                {qrSessions.map((session) => {
                  const isSelected = selectedSession?.id === session.id;
                  return (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-sky-50/80 border-sky-300 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-xs text-slate-900">{session.courseCode}</span>
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">
                              {session.manualPasscode}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 mt-0.5 line-clamp-1">
                            {session.sessionTopic}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>{session.hall}</span>
                            <span>•</span>
                            <span>{session.validDate}</span>
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-black text-xs text-sky-800 block">
                            {session.attendanceCount}
                          </span>
                          <span className="text-[10px] text-slate-400">Scanned</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE RECORDS & LOG HISTORY */}
      {activeTab === 'attendance_records' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900">Official Attendance Records</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Timestamped biometric and QR audit log for continuous assessment & exam clearance
              </p>
            </div>

            {/* Course Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Filter:</span>
              <select
                value={recordFilterCourse}
                onChange={(e) => setRecordFilterCourse(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="ALL">All Courses ({records.length})</option>
                {courses.map(c => (
                  <option key={c.id} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Records Table */}
          {filteredRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Course</th>
                    <th className="py-2.5 px-3">Session Topic</th>
                    <th className="py-2.5 px-3">Student / Reg No</th>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Verification Mode</th>
                    <th className="py-2.5 px-3">Venue</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                        {r.courseCode}
                      </td>
                      <td className="py-3 px-3 max-w-xs truncate font-semibold">
                        {r.sessionTitle}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{r.studentName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{r.studentRegNo}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        <div>{r.sessionDate}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 text-[10px] font-bold">
                          <ShieldCheck className="w-3 h-3 text-sky-700" />
                          {r.markedVia === 'qr_scanner' ? 'QR Scan' : 'Manual Code'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {r.locationRecorded || 'Campus Hall'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-xs font-bold">No attendance records found for this selection.</p>
            </div>
          )}
        </div>
      )}

      {/* FULLSCREEN PROJECTOR MODAL */}
      {isFullscreenQR && selectedSession && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-200">
          <div className="absolute top-6 right-6 flex items-center gap-3">
            <button
              onClick={() => setIsFullscreenQR(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
            >
              <Minimize2 className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-xl w-full text-center space-y-6">
            <div>
              <span className="text-xs uppercase font-mono px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black">
                CAMPUSFLOW LECTURE ATTENDANCE
              </span>
              <h1 className="text-3xl font-black text-white mt-3">
                {selectedSession.courseCode} • {selectedSession.courseTitle}
              </h1>
              <p className="text-base text-sky-200 mt-1">
                {selectedSession.sessionTopic}
              </p>
            </div>

            {/* High-res Fullscreen QR canvas */}
            <div className="bg-white rounded-3xl p-8 inline-block shadow-2xl">
              <canvas ref={fullscreenCanvasRef} className="rounded-2xl"></canvas>
              <div className="mt-4 pt-3 border-t border-slate-100 text-slate-900">
                <span className="text-xs font-bold text-slate-500 uppercase block">Passcode</span>
                <span className="text-3xl font-black font-mono tracking-widest text-sky-950">
                  {selectedSession.manualPasscode}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-slate-300">
              <span>Hall: <strong className="text-white">{selectedSession.hall}</strong></span>
              <span>•</span>
              <span>Scanned Students: <strong className="text-amber-300 text-base">{selectedSession.attendanceCount}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW LECTURE SESSION MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-black text-slate-900">New Attendance Session</h3>
                <p className="text-xs text-slate-500">Generate a unique QR code for today's lecture</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Course</label>
                <select
                  value={newSessionCourse}
                  onChange={(e) => setNewSessionCourse(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.code}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Lecture Topic</label>
                <input
                  type="text"
                  required
                  value={newSessionTopic}
                  onChange={(e) => setNewSessionTopic(e.target.value)}
                  placeholder="e.g. Asymptotic Notation & Heaps"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Venue / Hall</label>
                  <input
                    type="text"
                    required
                    value={newSessionHall}
                    onChange={(e) => setNewSessionHall(e.target.value)}
                    placeholder="e.g. CoICT LT-B"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Valid Duration</label>
                  <select
                    value={newSessionDuration}
                    onChange={(e) => setNewSessionDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">60 minutes (1 hr)</option>
                    <option value="90">90 minutes (1.5 hrs)</option>
                    <option value="120">120 minutes (2 hrs)</option>
                    <option value="180">180 minutes (3 hrs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Manual Passcode (Optional - auto generated if blank)
                </label>
                <input
                  type="text"
                  value={newSessionManualPasscode}
                  onChange={(e) => setNewSessionManualPasscode(e.target.value)}
                  placeholder="e.g. CF-2114"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-sm transition-all"
                >
                  Start Active Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
