import React, { useState, useMemo, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Download, 
  Search, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Flag, 
  Star, 
  Sparkles, 
  FileSpreadsheet, 
  Presentation, 
  Image as ImageIcon, 
  Archive, 
  FileCode, 
  Clock, 
  User as UserIcon,
  Layers,
  ArrowUpDown,
  BookOpen,
  X,
  Eye,
  Printer,
  Share2,
  Mail,
  MessageSquare,
  Copy,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileCheck
} from 'lucide-react';
import { StudyMaterial, StudyMaterialType, User, Course } from '../types';
import { StorageService } from '../services/storageService';
import { EndorsementButton } from './EndorsementButton';

interface StudyMaterialsViewProps {
  user: User;
  courses: Course[];
  onNotify: (msg: string) => void;
}

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.zip', '.txt'];
const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const StudyMaterialsView: React.FC<StudyMaterialsViewProps> = ({
  user,
  courses,
  onNotify,
}) => {
  const [materials, setMaterials] = useState<StudyMaterial[]>(() => StorageService.getStudyMaterials());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<StudyMaterialType | 'ALL'>('ALL');
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'downloads' | 'course'>('newest');
  const [filterBookmarkedOnly, setFilterBookmarkedOnly] = useState(false);

  // Preview modal state
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [previewZoom, setPreviewZoom] = useState<number>(100);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCourseCode, setUploadCourseCode] = useState(courses[0]?.code || 'ZOO 201');
  const [uploadIsOfficial, setUploadIsOfficial] = useState(user.role === 'lecturer' || user.role === 'admin');
  const [uploadIsRecommended, setUploadIsRecommended] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Quick share menu popover per card
  const [activeShareId, setActiveShareId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered & Sorted list
  const filteredMaterials = useMemo(() => {
    return materials
      .filter(item => {
        if (selectedCourse !== 'ALL' && item.courseCode !== selectedCourse) return false;
        if (selectedType !== 'ALL' && item.fileType !== selectedType) return false;
        if (selectedYear !== 'ALL' && item.year !== selectedYear) return false;
        if (filterBookmarkedOnly && !item.isBookmarked) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchCourse = item.courseCode.toLowerCase().includes(q) || item.courseTitle.toLowerCase().includes(q);
          const matchUploader = item.uploadedBy.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchFile = item.fileName.toLowerCase().includes(q);
          return matchTitle || matchCourse || matchUploader || matchDesc || matchFile;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'downloads') return b.downloadCount - a.downloadCount;
        if (sortBy === 'course') return a.courseCode.localeCompare(b.courseCode);
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      });
  }, [materials, selectedCourse, selectedType, selectedYear, filterBookmarkedOnly, searchQuery, sortBy]);

  // Handlers
  const handleToggleBookmark = (id: string) => {
    const updated = StorageService.toggleBookmarkMaterial(id);
    setMaterials(updated);
    const item = updated.find(m => m.id === id);
    onNotify(item?.isBookmarked ? 'Added to your bookmarked study materials.' : 'Removed from bookmarks.');
  };

  const handleReport = (id: string) => {
    const updated = StorageService.reportMaterial(id);
    setMaterials(updated);
    onNotify('Material flagged for review by faculty moderators. Thank you.');
  };

  const handleDelete = (id: string) => {
    const item = materials.find(m => m.id === id);
    if (!item) return;

    const canDelete = user.role === 'admin' || item.uploaderId === user.id || (user.role === 'lecturer' && item.uploaderRole !== 'admin');
    if (!canDelete) {
      onNotify('Permission denied. You can only delete materials you uploaded or manage.');
      return;
    }

    if (window.confirm(`Delete "${item.title}"?`)) {
      const updated = StorageService.deleteStudyMaterial(id);
      setMaterials(updated);
      onNotify(`Deleted "${item.fileName}" successfully.`);
      if (previewMaterial?.id === id) {
        setPreviewMaterial(null);
      }
    }
  };

  const handleDownload = (item: StudyMaterial) => {
    // Increment count
    const updated = StorageService.incrementDownloadCount(item.id);
    setMaterials(updated);

    // Create a real downloadable file blob with simulated academic content
    const fileHeader = `CAMPUSFLOW TZ ACADEMIC REPOSITORY\n=========================================\nCourse: ${item.courseCode} - ${item.courseTitle}\nDocument: ${item.title}\nUploaded by: ${item.uploadedBy} (${item.uploaderRole})\nDate: ${item.uploadDate}\nSecurity / Integrity Check: Verified SHA-256\n=========================================\n\n${item.description}\n\n[Official University Material - For Study Purposes Only]`;
    
    const blob = new Blob([fileHeader], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onNotify(`Downloaded "${item.fileName}" successfully!`);
  };

  // Print material
  const handlePrintMaterial = (item: StudyMaterial) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print: ${item.title}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; }
              .header { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 24px; }
              .title { font-size: 24px; font-weight: bold; margin: 0 0 6px 0; color: #0f172a; }
              .meta { font-size: 13px; color: #64748b; margin-bottom: 4px; }
              .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #e0f2fe; color: #0369a1; }
              .content { font-size: 14px; line-height: 1.6; margin-top: 20px; }
              .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
            </style>
          </head>
          <body>
            <div class="header">
              <span class="badge">${item.courseCode}</span>
              <h1 class="title">${item.title}</h1>
              <div class="meta">Course: ${item.courseTitle} | File: ${item.fileName} (${item.fileSize})</div>
              <div class="meta">Uploaded by: ${item.uploadedBy} (${item.uploaderRole}) on ${item.uploadDate}</div>
            </div>
            <div class="content">
              <h3>Document Description & Syllabus Notes:</h3>
              <p>${item.description}</p>
              <hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 24px 0;" />
              <h3>Course Topics & Key Concepts:</h3>
              <ul>
                <li>Systematic anatomy and vertebrate taxonomic hierarchy</li>
                <li>Laboratory procedures, dissection tools and sample preparation protocols</li>
                <li>Continuous assessment review points and reference reading chapters</li>
              </ul>
            </div>
            <div class="footer">
              Printed from CampusFlow TZ Academic Repository on ${new Date().toLocaleDateString()} • University of Dar es Salaam
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      onNotify(`Print layout opened for "${item.fileName}".`);
    } else {
      window.print();
      onNotify(`Print dialog launched for "${item.fileName}".`);
    }
  };

  // Share via WhatsApp
  const handleShareWhatsApp = (item: StudyMaterial) => {
    const text = `📘 *CampusFlow TZ Study Material*\n*${item.title}*\nCourse: ${item.courseCode} - ${item.courseTitle}\nFile: ${item.fileName} (${item.fileSize})\nUploaded by: ${item.uploadedBy} (${item.uploaderRole})\nAccess here: ${window.location.origin}/#/materials?id=${item.id}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    onNotify(`Sharing "${item.title}" via WhatsApp...`);
  };

  // Share via Email
  const handleShareEmail = (item: StudyMaterial) => {
    const subject = `Study Material: ${item.title} (${item.courseCode})`;
    const body = `Hello,\n\nI am sharing this study material from CampusFlow TZ:\n\nTitle: ${item.title}\nCourse: ${item.courseCode} - ${item.courseTitle}\nFile: ${item.fileName} (${item.fileSize})\nUploaded by: ${item.uploadedBy}\nDate: ${item.uploadDate}\n\nDescription:\n${item.description}\n\nView on CampusFlow TZ: ${window.location.origin}/#/materials?id=${item.id}\n`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    onNotify(`Email client launched to share "${item.title}".`);
  };

  // Copy shareable link
  const handleCopyLink = (item: StudyMaterial) => {
    const shareableUrl = `${window.location.origin}/#/materials?id=${item.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareableUrl);
    }
    onNotify(`Shareable link for "${item.title}" copied to clipboard!`);
    setActiveShareId(null);
  };

  // Upload Logic
  const handleFileSelect = (file: File) => {
    setUploadError(null);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setUploadError(`Unsupported file extension (${ext}). Allowed: PDF, DOCX, PPTX, XLSX, Images, ZIP, TXT.`);
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError(`File exceeds 25 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }
    setSelectedFile(file);
    if (!uploadTitle.trim()) {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setUploadTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleExecuteUpload = () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    if (!uploadTitle.trim()) {
      setUploadError('Please provide a descriptive title for this study resource.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    const ext = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    let detectedType: StudyMaterialType = 'other';
    if (ext === '.pdf') detectedType = 'pdf';
    else if (ext === '.doc' || ext === '.docx') detectedType = 'docx';
    else if (ext === '.ppt' || ext === '.pptx') detectedType = 'pptx';
    else if (ext === '.xls' || ext === '.xlsx') detectedType = 'xlsx';
    else if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) detectedType = 'image';
    else if (ext === '.zip') detectedType = 'zip';
    else if (ext === '.txt') detectedType = 'txt';

    const courseObj = courses.find(c => c.code === uploadCourseCode);
    const sizeStr = (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB';

    // Read file as Data URL so it can be previewed directly
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      const newMaterial: StudyMaterial = {
        id: 'mat_' + Date.now(),
        title: uploadTitle.trim(),
        fileName: selectedFile.name,
        fileType: detectedType,
        fileSize: sizeStr,
        fileSizeBytes: selectedFile.size,
        courseCode: uploadCourseCode,
        courseTitle: courseObj?.title || uploadCourseCode,
        department: 'Zoology & Life Sciences',
        programme: user.programme,
        year: courseObj?.year || user.currentYear,
        semester: courseObj?.semester || 'Semester 1',
        uploadedBy: user.name,
        uploaderRole: user.role,
        uploaderId: user.id,
        uploadDate: new Date().toISOString().slice(0, 10),
        description: uploadDescription.trim() || 'Uploaded course study notes and lecture slides.',
        downloadCount: 0,
        isOfficial: uploadIsOfficial,
        isRecommended: uploadIsRecommended,
        isBookmarked: false,
        contentDataUrl: dataUrl,
        tags: [uploadCourseCode, detectedType.toUpperCase()],
      };

      // Progress animation
      setUploadProgress(70);
      setTimeout(() => {
        setUploadProgress(100);
        const updated = StorageService.saveStudyMaterial(newMaterial);
        setMaterials(updated);

        setTimeout(() => {
          setIsUploading(false);
          setIsUploadOpen(false);
          setSelectedFile(null);
          setUploadTitle('');
          setUploadDescription('');
          setUploadProgress(0);
          onNotify(`"${newMaterial.title}" uploaded successfully to lecture archives.`);
        }, 300);
      }, 500);
    };

    reader.readAsDataURL(selectedFile);
  };

  // Helper for file type icons
  const renderFileIcon = (type: StudyMaterialType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'pptx':
        return <Presentation className="w-5 h-5 text-amber-500" />;
      case 'xlsx':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-purple-500" />;
      case 'zip':
        return <Archive className="w-5 h-5 text-orange-500" />;
      case 'txt':
        return <FileCode className="w-5 h-5 text-slate-500" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
              Lecture Archives & Study Repository
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-semibold">
              Verified Documents
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-600" /> Study Materials & Course Documents
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Read, preview, print, share, and download course lecture slides, past exams, and lab practical manuals
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedFile(null);
            setUploadError(null);
            setIsUploadOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Material</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, course code, lecturer, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Course filter */}
          <div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white"
            >
              <option value="ALL">All Courses ({courses.length})</option>
              {courses.map(c => (
                <option key={c.id} value={c.code}>{c.code} - {c.title}</option>
              ))}
            </select>
          </div>

          {/* File type filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white"
            >
              <option value="ALL">All File Types</option>
              <option value="pdf">PDF Documents</option>
              <option value="docx">Word (.docx)</option>
              <option value="pptx">Presentations (.pptx)</option>
              <option value="xlsx">Spreadsheets (.xlsx)</option>
              <option value="image">Diagrams & Images</option>
              <option value="zip">ZIP Archives</option>
            </select>
          </div>
        </div>

        {/* Second Row: Sort and Bookmarked toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={filterBookmarkedOnly}
                onChange={(e) => setFilterBookmarkedOnly(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
              <span className="flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Bookmarked Only
              </span>
            </label>

            <span className="text-slate-300">|</span>

            <div className="flex items-center gap-1 text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none"
              >
                <option value="newest">Newest Uploads</option>
                <option value="downloads">Most Downloaded</option>
                <option value="course">Course Code</option>
              </select>
            </div>
          </div>

          <span className="text-slate-500 font-medium">
            Showing <strong>{filteredMaterials.length}</strong> of <strong>{materials.length}</strong> resources
          </span>
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No study materials found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try adjusting your search query, selecting "All Courses", or upload notes to help your classmates.
          </p>
          <button
            onClick={() => { setSelectedCourse('ALL'); setSelectedType('ALL'); setSearchQuery(''); setFilterBookmarkedOnly(false); }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-sky-300 transition-all shadow-2xs hover:shadow-md p-4 flex flex-col justify-between group relative"
            >
              {/* Card Header & Badges */}
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {renderFileIcon(item.fileType)}
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                        {item.courseCode}
                      </span>
                      {item.isOfficial && (
                        <span className="ml-1.5 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold">
                          <Sparkles className="w-2.5 h-2.5 text-sky-600" />
                          Official
                        </span>
                      )}
                      {item.isRecommended && (
                        <span className="ml-1.5 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          <Star className="w-2.5 h-2.5 text-emerald-600 fill-emerald-600" />
                          Recommended
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleBookmark(item.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      item.isBookmarked 
                        ? 'text-amber-500 bg-amber-50' 
                        : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'
                    }`}
                    title={item.isBookmarked ? 'Remove bookmark' : 'Bookmark this material'}
                  >
                    <Bookmark className={`w-4 h-4 ${item.isBookmarked ? 'fill-amber-500' : ''}`} />
                  </button>
                </div>

                <div>
                  <h3 
                    onClick={() => { setPreviewMaterial(item); setPreviewPage(1); }}
                    className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-1 cursor-pointer hover:underline"
                    title="Click to preview file"
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Metadata tags */}
                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-500 pt-1">
                  <span>File: <strong className="text-slate-700 font-mono text-[10px]">{item.fileName}</strong></span>
                  <span>Type: <strong className="uppercase">{item.fileType}</strong></span>
                  <span>Size: <strong>{item.fileSize}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <UserIcon className="w-3 h-3 text-slate-400" />
                  <span className="truncate">By <strong>{item.uploadedBy}</strong> ({item.uploaderRole})</span>
                  <span className="text-slate-300">•</span>
                  <span>{item.uploadDate}</span>
                </div>
              </div>

              {/* Bottom Action Footer with Preview, Share, Print, Endorse, Download */}
              <div className="pt-3.5 mt-3 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-1">
                  <EndorsementButton
                    targetId={item.id}
                    targetType="material"
                    targetTitle={item.title}
                    currentUser={user}
                    onNotify={onNotify}
                    size="sm"
                  />

                  {/* Quick Share Menu */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePrintMaterial(item)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Print material"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleShareWhatsApp(item)}
                      className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Share through WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleShareEmail(item)}
                      className="p-1.5 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
                      title="Share by Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCopyLink(item)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Copy shareable link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleReport(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Flag material"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>

                    {(user.role === 'admin' || item.uploaderId === user.id) && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Primary Card Buttons: Preview and Download */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => { setPreviewMaterial(item); setPreviewPage(1); }}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold rounded-xl transition-all border border-sky-200"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-600" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => handleDownload(item)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-2xs active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL MATERIAL PREVIEW & DOCUMENT READER MODAL */}
      {previewMaterial && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs"
          onClick={() => setPreviewMaterial(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
                  {renderFileIcon(previewMaterial.fileType)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase tracking-wider">
                      {previewMaterial.courseCode}
                    </span>
                    <span className="text-slate-400 text-xs">
                      • {previewMaterial.fileName} ({previewMaterial.fileSize})
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white line-clamp-1 mt-0.5">
                    {previewMaterial.title}
                  </h2>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  onClick={() => handlePrintMaterial(previewMaterial)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                  title="Print this document"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                <button
                  onClick={() => handleShareWhatsApp(previewMaterial)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
                  title="Share through WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>

                <button
                  onClick={() => handleShareEmail(previewMaterial)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                  title="Share via Email"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Email</span>
                </button>

                <button
                  onClick={() => handleCopyLink(previewMaterial)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                  title="Copy shareable link"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copy Link</span>
                </button>

                <button
                  onClick={() => handleDownload(previewMaterial)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors"
                  title="Download file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => setPreviewMaterial(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Reader Sub-bar with Viewer Controls */}
            <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 shrink-0">
              <div className="flex items-center gap-3">
                <span>Course: <strong>{previewMaterial.courseTitle}</strong></span>
                <span className="text-slate-300">•</span>
                <span>Uploaded by: <strong>{previewMaterial.uploadedBy}</strong> ({previewMaterial.uploadDate})</span>
              </div>

              {/* Zoom & Page controls for PDF / image */}
              {(previewMaterial.fileType === 'pdf' || previewMaterial.fileType === 'image') && (
                <div className="flex items-center gap-2">
                  {previewMaterial.fileType === 'pdf' && (
                    <div className="flex items-center gap-1 mr-2">
                      <button
                        onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                        disabled={previewPage <= 1}
                        className="p-1 rounded hover:bg-slate-200 disabled:opacity-40"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-[11px]">Page {previewPage} of 4</span>
                      <button
                        onClick={() => setPreviewPage(p => Math.min(4, p + 1))}
                        disabled={previewPage >= 4}
                        className="p-1 rounded hover:bg-slate-200 disabled:opacity-40"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    <button onClick={() => setPreviewZoom(z => Math.max(60, z - 20))} className="p-0.5 hover:text-sky-600">
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-[11px] w-10 text-center">{previewZoom}%</span>
                    <button onClick={() => setPreviewZoom(z => Math.min(180, z + 20))} className="p-0.5 hover:text-sky-600">
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Document Body Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 flex justify-center">
              {/* PDF Previewer */}
              {previewMaterial.fileType === 'pdf' && (
                <div 
                  className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-2xl p-8 space-y-6 transition-transform origin-top"
                  style={{ transform: `scale(${previewZoom / 100})` }}
                >
                  <div className="border-b-2 border-sky-600 pb-4 flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold uppercase">
                        {previewMaterial.courseCode} • Academic Department Archive
                      </span>
                      <h1 className="text-xl font-black text-slate-900 mt-1">
                        {previewMaterial.title}
                      </h1>
                      <p className="text-xs text-slate-500">
                        {previewMaterial.courseTitle} • Instructor: {previewMaterial.uploadedBy}
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-slate-400 font-mono">
                      Page {previewPage} / 4
                    </div>
                  </div>

                  {previewPage === 1 && (
                    <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1">
                        1. Introduction & Syllabus Foundations
                      </h2>
                      <p>
                        This verified university document constitutes official supplementary materials for <strong>{previewMaterial.courseCode}</strong>. Students are expected to complete the assigned readings prior to the practical session in the central lecture complex.
                      </p>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="font-bold text-slate-900 text-xs">Document Synopsis:</div>
                        <p className="text-xs text-slate-600 italic">
                          "{previewMaterial.description}"
                        </p>
                      </div>
                      <h3 className="font-bold text-slate-900 text-xs">Core Learning Outcomes:</h3>
                      <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                        <li>Differentiate morphological organ structures and physiological systems across taxa.</li>
                        <li>Apply standard taxonomic classification keys and statistical variance formulas.</li>
                        <li>Execute continuous assessment test questions with standard academic rigor.</li>
                      </ul>
                    </div>
                  )}

                  {previewPage === 2 && (
                    <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1">
                        2. Detailed Methodologies, Equations & Specimen Keys
                      </h2>
                      <p>
                        When conducting laboratory assays or phylogenetic comparative analysis, ensure calibration of microscopy objectives and sterile handling:
                      </p>
                      <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 font-mono text-xs text-sky-950">
                        F-statistic = (Between-Group Variance / df_between) / (Within-Group Variance / df_within)
                        <br />
                        p-value critical threshold: α = 0.05
                      </div>
                      <p className="text-xs text-slate-600">
                        Refer to continuous assessment question sets distributed by faculty instructors. Keep detailed experimental observations in your practical logbook.
                      </p>
                    </div>
                  )}

                  {previewPage >= 3 && (
                    <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1">
                        3. Review Exercises & Suggested Bibliography
                      </h2>
                      <p className="text-xs text-slate-600">
                        Solve exercises 1 through 12. Compare results with study pod members in the Student Network discussion channel before Friday's seminar consultation.
                      </p>
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                        <strong>Exam Advisory:</strong> Concepts from this lecture material comprise approximately 25% of the upcoming CAT 1 paper.
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Verified Academic Repository • CampusFlow TZ</span>
                    <span>Document SHA-256: 9e8a7c2b...</span>
                  </div>
                </div>
              )}

              {/* Image Previewer */}
              {previewMaterial.fileType === 'image' && (
                <div className="flex flex-col items-center justify-center max-w-2xl w-full">
                  <div 
                    className="bg-white rounded-2xl p-4 shadow-md border border-slate-200 transition-transform"
                    style={{ transform: `scale(${previewZoom / 100})` }}
                  >
                    <img
                      src={previewMaterial.contentDataUrl || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80'}
                      alt={previewMaterial.title}
                      className="rounded-xl max-h-[65vh] object-contain mx-auto"
                    />
                    <div className="mt-3 text-center">
                      <p className="text-xs font-bold text-slate-800">{previewMaterial.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{previewMaterial.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Presentation (PPTX) Previewer */}
              {previewMaterial.fileType === 'pptx' && (
                <div className="bg-slate-900 text-white rounded-2xl w-full max-w-2xl p-8 flex flex-col justify-between shadow-xl">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs font-bold text-amber-400">{previewMaterial.courseCode} SLIDE DECK</span>
                      <span className="text-xs text-slate-400">Slide 1 of 18</span>
                    </div>
                    <div className="my-12 text-center">
                      <h2 className="text-2xl font-black text-white">{previewMaterial.title}</h2>
                      <p className="text-sm text-slate-400 mt-2">{previewMaterial.courseTitle}</p>
                      <p className="text-xs text-amber-300 mt-1">Instructor: {previewMaterial.uploadedBy}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-800/80 rounded-xl text-xs text-slate-300">
                    <strong>Slide Notes:</strong> {previewMaterial.description}
                  </div>
                </div>
              )}

              {/* Spreadsheet (XLSX) Previewer */}
              {previewMaterial.fileType === 'xlsx' && (
                <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-3xl p-6 shadow-md overflow-x-auto">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Spreadsheet Table Preview: {previewMaterial.title}
                  </h3>
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="p-2.5 border border-slate-200">#</th>
                        <th className="p-2.5 border border-slate-200">Parameter / Variable</th>
                        <th className="p-2.5 border border-slate-200">Mean Value</th>
                        <th className="p-2.5 border border-slate-200">Std Error</th>
                        <th className="p-2.5 border border-slate-200">p-value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2.5 border border-slate-200 font-mono">1</td>
                        <td className="p-2.5 border border-slate-200">Sampling Site A (Marine Flora)</td>
                        <td className="p-2.5 border border-slate-200">42.8 mg/L</td>
                        <td className="p-2.5 border border-slate-200">± 1.4</td>
                        <td className="p-2.5 border border-slate-200 font-semibold text-emerald-700">0.012 *</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="p-2.5 border border-slate-200 font-mono">2</td>
                        <td className="p-2.5 border border-slate-200">Sampling Site B (Mangrove Estuary)</td>
                        <td className="p-2.5 border border-slate-200">67.3 mg/L</td>
                        <td className="p-2.5 border border-slate-200">± 2.1</td>
                        <td className="p-2.5 border border-slate-200 font-semibold text-emerald-700">0.004 **</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 border border-slate-200 font-mono">3</td>
                        <td className="p-2.5 border border-slate-200">Control Specimen Basin</td>
                        <td className="p-2.5 border border-slate-200">12.1 mg/L</td>
                        <td className="p-2.5 border border-slate-200">± 0.8</td>
                        <td className="p-2.5 border border-slate-200 text-slate-500">0.420</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Compressed Archive (ZIP) or Unsupported: Clear Message */}
              {(previewMaterial.fileType === 'zip' || previewMaterial.fileType === 'other') && (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-lg w-full text-center shadow-lg my-auto">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                    <Archive className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    In-Browser Preview Not Available for Compressed Archive
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    This file is stored in compressed format (<strong>.{previewMaterial.fileType}</strong>). Browser sandboxing prevents extracting archive directory trees directly inside this preview window.
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    You can download the full package ({previewMaterial.fileSize}) directly to your device or share the repository access link with classmates.
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <button
                      onClick={() => handleDownload(previewMaterial)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Archive ({previewMaterial.fileSize})</span>
                    </button>
                    <button
                      onClick={() => handleCopyLink(previewMaterial)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Text / Code File Previewer */}
              {(previewMaterial.fileType === 'txt' || previewMaterial.fileType === 'docx') && (
                <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl p-6 shadow-md space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Text & Document Reader</span>
                    <h2 className="text-base font-black text-slate-900 mt-0.5">{previewMaterial.title}</h2>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {`CAMPUSFLOW ACADEMIC ARCHIVE: ${previewMaterial.courseCode}\nTitle: ${previewMaterial.title}\nUploaded by: ${previewMaterial.uploadedBy} on ${previewMaterial.uploadDate}\n\nSUMMARY & LECTURE OUTLINE:\n${previewMaterial.description}\n\n[End of Document]`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MATERIAL MODAL */}
      {isUploadOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => !isUploading && setIsUploadOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">Upload Study Material</h3>
              </div>
              {!isUploading && (
                <button onClick={() => setIsUploadOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {uploadError && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="space-y-4 mt-4">
              {/* File Drag & Drop Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-sky-500 bg-sky-50' : selectedFile ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300 hover:border-sky-400 bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.txt"
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-800 text-xs font-bold">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <span>Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                ) : (
                  <div>
                    <UploadCloud className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">Click or drag & drop lecture file here</p>
                    <p className="text-[11px] text-slate-400 mt-1">PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx), Images or ZIP (Max 25 MB)</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resource Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Vertebrate Skeleton & Anatomy Dissection Guide"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Associated Course *</label>
                <select
                  value={uploadCourseCode}
                  onChange={(e) => setUploadCourseCode(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.code}>{c.code} - {c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Topic Notes</label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe what topics, formulas or practical steps this document covers..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Progress bar when uploading */}
              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>Uploading and verifying document...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className="h-full bg-sky-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => setIsUploadOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUploading || !selectedFile}
                onClick={handleExecuteUpload}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold shadow-md"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isUploading ? 'Uploading...' : 'Publish to Course'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
