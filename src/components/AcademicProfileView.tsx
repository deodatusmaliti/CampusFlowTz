import React, { useState, useRef } from 'react';
import { 
  User as UserIcon, 
  GraduationCap, 
  Building, 
  Mail, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  Shield, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Camera, 
  Save, 
  Download, 
  RotateCcw, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Heart, 
  Briefcase, 
  Award, 
  Share2, 
  PhoneCall, 
  HelpCircle,
  ExternalLink,
  Printer
} from 'lucide-react';
import { User, UserPrivacySettings, UserEmergencyContact } from '../types';
import { StorageService } from '../services/storageService';
import { INITIAL_USER } from '../data/mockInitialData';

interface AcademicProfileViewProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onNotify: (msg: string) => void;
}

export const AcademicProfileView: React.FC<AcademicProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  onNotify,
}) => {
  const [profile, setProfile] = useState<User>(() => ({
    ...INITIAL_USER,
    ...currentUser,
    privacySettings: {
      profileVisibility: currentUser.privacySettings?.profileVisibility || 'classmates',
      showPhone: currentUser.privacySettings?.showPhone ?? false,
      showWhatsapp: currentUser.privacySettings?.showWhatsapp ?? false,
      showEmail: currentUser.privacySettings?.showEmail ?? false,
      allowInvites: currentUser.privacySettings?.allowInvites ?? true,
    }
  }));

  const [universityList, setUniversityList] = useState<string[]>(() => StorageService.getUniversities());
  const [showAddUni, setShowAddUni] = useState(false);
  const [newUniInput, setNewUniInput] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [newInterestInput, setNewInterestInput] = useState('');
  const [newCareerInput, setNewCareerInput] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Field change helper
  const handleChange = (field: keyof User, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handlePrivacyChange = (field: keyof UserPrivacySettings, value: any) => {
    setProfile(prev => ({
      ...prev,
      privacySettings: {
        ...(prev.privacySettings || {
          profileVisibility: 'classmates',
          showPhone: false,
          showWhatsapp: false,
          showEmail: false,
          allowInvites: true
        }),
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleEmergencyChange = (field: keyof UserEmergencyContact, value: string) => {
    setProfile(prev => ({
      ...prev,
      emergencyContact: {
        ...(prev.emergencyContact || { name: '', relationship: 'Parent / Guardian', phone: '' }),
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Avatar Upload & Preview
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onNotify('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onNotify('Image file is too large (max 5 MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setProfile(prev => ({ ...prev, avatar: base64Url }));
      setHasUnsavedChanges(true);
      onNotify('Profile photo preview updated. Click "Save Academic Profile" to apply.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfile(prev => ({ ...prev, avatar: undefined }));
    setHasUnsavedChanges(true);
    onNotify('Profile photo removed.');
  };

  // Add custom university
  const handleAddCustomUni = () => {
    if (!newUniInput.trim()) return;
    const updated = StorageService.addUniversity(newUniInput.trim());
    setUniversityList(updated);
    handleChange('university', newUniInput.trim());
    setNewUniInput('');
    setShowAddUni(false);
    onNotify(`Added "${newUniInput.trim()}" to platform universities.`);
  };

  // Interest tags management
  const handleAddInterest = (type: 'academic' | 'career' | 'skills') => {
    if (type === 'academic' && newInterestInput.trim()) {
      const current = profile.academicInterests || [];
      if (!current.includes(newInterestInput.trim())) {
        handleChange('academicInterests', [...current, newInterestInput.trim()]);
      }
      setNewInterestInput('');
    } else if (type === 'career' && newCareerInput.trim()) {
      const current = profile.careerInterests || [];
      if (!current.includes(newCareerInput.trim())) {
        handleChange('careerInterests', [...current, newCareerInput.trim()]);
      }
      setNewCareerInput('');
    } else if (type === 'skills' && newSkillInput.trim()) {
      const current = profile.skills || [];
      if (!current.includes(newSkillInput.trim())) {
        handleChange('skills', [...current, newSkillInput.trim()]);
      }
      setNewSkillInput('');
    }
  };

  const handleRemoveTag = (type: 'academic' | 'career' | 'skills', index: number) => {
    if (type === 'academic') {
      const current = [...(profile.academicInterests || [])];
      current.splice(index, 1);
      handleChange('academicInterests', current);
    } else if (type === 'career') {
      const current = [...(profile.careerInterests || [])];
      current.splice(index, 1);
      handleChange('careerInterests', current);
    } else if (type === 'skills') {
      const current = [...(profile.skills || [])];
      current.splice(index, 1);
      handleChange('skills', current);
    }
  };

  // Save profile
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profile.name.trim()) {
      onNotify('Full name is required.');
      return;
    }
    if (!profile.email.trim()) {
      onNotify('Student email is required.');
      return;
    }

    onUpdateUser(profile);
    StorageService.saveUser(profile);
    setHasUnsavedChanges(false);
    onNotify('Academic Profile updated successfully across CampusFlow TZ!');
  };

  // Export profile JSON
  const handleExportProfile = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `CampusFlow_Profile_${profile.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    onNotify('Academic profile exported as JSON.');
  };

  // Print Academic Profile Slip
  const handlePrintProfileSlip = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Academic Student Profile - ${profile.name}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; }
              .uni-title { font-size: 20px; font-weight: 900; color: #0369a1; text-transform: uppercase; }
              .doc-title { font-size: 14px; font-weight: 700; color: #475569; }
              .profile-box { display: grid; grid-template-columns: 120px 1fr; gap: 20px; margin-bottom: 24px; align-items: center; }
              .avatar { width: 120px; height: 120px; border-radius: 12px; object-fit: cover; border: 1px solid #cbd5e1; }
              .avatar-placeholder { width: 120px; height: 120px; border-radius: 12px; background: #0284c7; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: bold; }
              .name { font-size: 22px; font-weight: 900; color: #0f172a; margin-bottom: 4px; }
              .meta { font-size: 13px; color: #334155; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
              th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
              th { background: #f1f5f9; font-weight: 800; width: 30%; }
              .section-heading { font-size: 15px; font-weight: 800; color: #0369a1; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
              .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="uni-title">${profile.university || 'Tanzanian Higher Learning Institution'}</div>
                <div class="doc-title">Official Student Academic Profile Record</div>
              </div>
              <div style="text-align: right; font-size: 12px; color: #64748b;">
                Generated: ${new Date().toLocaleDateString()}<br/>
                Verification: <strong>VALID ACTIVE STUDENT</strong>
              </div>
            </div>

            <div class="profile-box">
              ${profile.avatar ? `<img src="${profile.avatar}" class="avatar" />` : `<div class="avatar-placeholder">${profile.name.charAt(0)}</div>`}
              <div>
                <div class="name">${profile.name}</div>
                <div class="meta">
                  <strong>ID / Reg:</strong> ${profile.studentId || profile.regNumber || 'Not specified'}<br/>
                  <strong>Programme:</strong> ${profile.programme}<br/>
                  <strong>Department / Faculty:</strong> ${profile.department || 'Faculty of Science'}<br/>
                  <strong>Academic Year:</strong> Year ${profile.currentYear} (${profile.academicYear || '2026/2027'})
                </div>
              </div>
            </div>

            <div class="section-heading">Academic & Contact Information</div>
            <table>
              <tr><th>Full Name</th><td>${profile.name}</td></tr>
              <tr><th>Institutional Email</th><td>${profile.email}</td></tr>
              <tr><th>Phone Number</th><td>${profile.phone || 'Not disclosed'}</td></tr>
              <tr><th>Leadership / Representation</th><td>${profile.leadershipTitle || 'Student Member'}</td></tr>
              <tr><th>Campus / Hostel Residence</th><td>${profile.hostelRoom || 'Off-Campus Private Residence'}</td></tr>
              <tr><th>Emergency Contact</th><td>${profile.emergencyContact?.name ? `${profile.emergencyContact.name} (${profile.emergencyContact.relationship}) - ${profile.emergencyContact.phone}` : 'None provided'}</td></tr>
            </table>

            <div class="section-heading">Academic Skills & Focus Areas</div>
            <p style="font-size: 12px; color: #334155;">
              <strong>Skills:</strong> ${(profile.skills || []).join(', ') || 'General Academic Proficiency'}<br/>
              <strong>Interests:</strong> ${(profile.academicInterests || []).join(', ') || 'Interdisciplinary Studies'}<br/>
              <strong>Career Goals:</strong> ${(profile.careerAspirations || []).join(', ') || 'Professional Practice'}
            </p>

            <div class="footer">
              <span>CampusFlow TZ Student Management System</span>
              <span>Printed Record</span>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      onNotify('Student profile slip print layout generated.');
    } else {
      window.print();
    }
  };

  // Share profile summary
  const handleShareProfile = () => {
    const summary = `🎓 *CampusFlow TZ Academic Profile*\nName: ${profile.name}\nProgramme: ${profile.programme} (Year ${profile.currentYear})\nUniversity: ${profile.university}\nEmail: ${profile.email}\nID: ${profile.studentId || profile.regNumber}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
    }
    onNotify('Academic profile summary copied to clipboard!');
  };

  // Reset demo profile
  const handleResetProfile = () => {
    if (window.confirm('Reset your profile details back to the default demo student identity?')) {
      setProfile(INITIAL_USER);
      onUpdateUser(INITIAL_USER);
      StorageService.saveUser(INITIAL_USER);
      setHasUnsavedChanges(false);
      onNotify('Reset to default demo profile.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-16 h-16 sm:w-20 sm:resp-20 rounded-2xl object-cover border-2 border-sky-500 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-sky-900 text-amber-300 flex items-center justify-center font-black text-2xl shadow-sm border border-sky-800">
                {profile.name.charAt(0)}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md transition-transform active:scale-95"
              title="Upload new profile picture"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
                Identity & Credentials
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-semibold">
                ID: {profile.studentId || profile.regNumber || 'Pending ID'}
              </span>
              {profile.leadershipTitle && (
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-700" />
                  {profile.leadershipTitle}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {profile.name} {profile.preferredName && <span className="text-slate-400 font-normal">({profile.preferredName})</span>}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {profile.programme} • Year {profile.currentYear} • {profile.university}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={handlePrintProfileSlip}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            title="Print official student profile record slip"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Slip</span>
          </button>

          <button
            type="button"
            onClick={handleShareProfile}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            title="Copy academic profile summary"
          >
            <Share2 className="w-4 h-4 text-slate-600" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={handleExportProfile}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            title="Download profile as JSON"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={handleSaveProfile}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-sm active:scale-95 ${
              hasUnsavedChanges ? 'bg-amber-500 hover:bg-amber-600 animate-pulse' : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{hasUnsavedChanges ? 'Save Changes *' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Section 1: Basic Identity & Bio */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-sky-600" /> Student Identity & Basic Information
            </h2>
            <span className="text-[11px] text-slate-400">Used as your public handle in study groups & chat</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred / Nickname</label>
              <input
                type="text"
                placeholder="e.g. Deo"
                value={profile.preferredName || ''}
                onChange={(e) => handleChange('preferredName', e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Registration ID *</label>
              <input
                type="text"
                required
                placeholder="e.g. 2024-04-08924"
                value={profile.studentId || profile.regNumber || ''}
                onChange={(e) => {
                  handleChange('studentId', e.target.value);
                  handleChange('regNumber', e.target.value);
                }}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Leadership Role / Title</label>
              <input
                type="text"
                placeholder="e.g. Class Representative, DARUSO Delegate, Lab Head..."
                value={profile.leadershipTitle || ''}
                onChange={(e) => handleChange('leadershipTitle', e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Student Biography & Academic Journey</label>
            <textarea
              rows={3}
              value={profile.biography || ''}
              onChange={(e) => handleChange('biography', e.target.value)}
              placeholder="Tell fellow students about your academic goals, research interests, and what kind of study pods you enjoy..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white resize-y"
            />
          </div>
        </div>

        {/* Section 2: Academic Institution & Curriculum */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" /> Academic Institution & Curriculum
            </h2>
            <span className="text-[11px] text-slate-400">Controls course groups and timetable feeds</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">University / Institution *</label>
                <button
                  type="button"
                  onClick={() => setShowAddUni(!showAddUni)}
                  className="text-[11px] text-sky-600 font-bold hover:underline"
                >
                  {showAddUni ? 'Select from list' : '+ Add custom institution'}
                </button>
              </div>

              {!showAddUni ? (
                <select
                  value={profile.university}
                  onChange={(e) => handleChange('university', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {universityList.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Type university/college name..."
                    value={newUniInput}
                    onChange={(e) => setNewUniInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomUni}
                    className="px-3 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">College / School / Faculty</label>
              <input
                type="text"
                placeholder="e.g. College of Natural and Applied Sciences (CoNAS)"
                value={profile.college || ''}
                onChange={(e) => handleChange('college', e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                placeholder="e.g. Department of Zoology & Wildlife Conservation"
                value={profile.department || ''}
                onChange={(e) => handleChange('department', e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Programme / Major *</label>
              <input
                type="text"
                required
                placeholder="e.g. BSc Zoology & Biological Sciences"
                value={profile.programme}
                onChange={(e) => handleChange('programme', e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Specialisation / Minor</label>
              <input
                type="text"
                placeholder="e.g. Aquatic Ecology"
                value={profile.specialisation || ''}
                onChange={(e) => handleChange('specialisation', e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Year</label>
              <select
                value={profile.currentYear}
                onChange={(e) => handleChange('currentYear', Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {Array.from({ length: profile.totalYears || 5 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Year {i + 1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Duration</label>
              <select
                value={profile.totalYears}
                onChange={(e) => handleChange('totalYears', Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value={3}>3 Years (BSc / BA)</option>
                <option value={4}>4 Years (BSc Eng / LLB)</option>
                <option value={5}>5 Years (BSc Medicine / MD)</option>
                <option value={6}>6 Years</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Semester</label>
              <select
                value={profile.semester || 'Semester 1'}
                onChange={(e) => handleChange('semester', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Trimester 1">Trimester 1</option>
                <option value="Trimester 2">Trimester 2</option>
                <option value="Trimester 3">Trimester 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Contact Details & Location */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" /> Location & Contact Channels
            </h2>
            <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Safe Privacy: Contacts are private unless toggled ON below
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
              <input
                type="text"
                placeholder="e.g. Tanzania"
                value={profile.country || 'Tanzania'}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Region / City</label>
              <input
                type="text"
                placeholder="e.g. Dar es Salaam"
                value={profile.region || 'Dar es Salaam'}
                onChange={(e) => handleChange('region', e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. +255 754 123 456"
                value={profile.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
              <input
                type="tel"
                placeholder="e.g. +255 754 123 456"
                value={profile.whatsapp || ''}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Contact Method</label>
              <select
                value={profile.preferredContactMethod || 'CampusFlow'}
                onChange={(e) => handleChange('preferredContactMethod', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="CampusFlow">CampusFlow Message (Built-in)</option>
                <option value="WhatsApp">WhatsApp Message</option>
                <option value="Email">Official Student Email</option>
                <option value="Phone">Phone Call</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Accessibility / Support Accommodation</label>
              <input
                type="text"
                placeholder="e.g. Visual contrast preference, wheelchair lab bench access, extra exam time..."
                value={profile.accessibilityNeeds || ''}
                onChange={(e) => handleChange('accessibilityNeeds', e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Academic Interests, Careers & Skills */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Academic Interests, Career Focus & Skills
            </h2>
            <span className="text-[11px] text-slate-400">Helps connect you with matching study circles</span>
          </div>

          {/* Academic Interests */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Academic Interests</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(profile.academicInterests || []).map((interest, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-medium">
                  {interest}
                  <button type="button" onClick={() => handleRemoveTag('academic', idx)} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                placeholder="Add academic focus (e.g. ANOVA, Vertebrate Anatomy)..."
                value={newInterestInput}
                onChange={(e) => setNewInterestInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest('academic'))}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={() => handleAddInterest('academic')}
                className="px-3 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Career Interests */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Career & Industry Interests</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(profile.careerInterests || []).map((career, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-medium">
                  {career}
                  <button type="button" onClick={() => handleRemoveTag('career', idx)} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                placeholder="Add career goal (e.g. Wildlife Scientist, Data Analyst)..."
                value={newCareerInput}
                onChange={(e) => setNewCareerInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest('career'))}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={() => handleAddInterest('career')}
                className="px-3 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Technical Skills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Key Skills & Tools</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(profile.skills || []).map((skill, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                  {skill}
                  <button type="button" onClick={() => handleRemoveTag('skills', idx)} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                placeholder="Add skill (e.g. R-Studio, Specimen Dissection, Python)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest('skills'))}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={() => handleAddInterest('skills')}
                className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Section 5: Emergency Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-600" /> Emergency Contact (Confidential)
            </h2>
            <span className="text-[11px] text-slate-400">Strictly private for university administration & emergency</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Name</label>
              <input
                type="text"
                placeholder="e.g. Mzee E. Maliti"
                value={profile.emergencyContact?.name || ''}
                onChange={(e) => handleEmergencyChange('name', e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
              <select
                value={profile.emergencyContact?.relationship || 'Parent / Guardian'}
                onChange={(e) => handleEmergencyChange('relationship', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Parent / Guardian">Parent / Guardian</option>
                <option value="Sibling">Sibling</option>
                <option value="Spouse / Partner">Spouse / Partner</option>
                <option value="Relative">Relative</option>
                <option value="Close Friend">Close Friend</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. +255 784 987 654"
                value={profile.emergencyContact?.phone || ''}
                onChange={(e) => handleEmergencyChange('phone', e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Privacy & Profile Visibility Controls */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold flex items-center gap-2 text-white">
              <Shield className="w-4 h-4 text-amber-400" /> Privacy & Profile Visibility Settings
            </h2>
            <span className="text-[11px] text-amber-300 font-semibold">Strict Safe Defaults Applied</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Overall Profile Visibility</label>
              <select
                value={profile.privacySettings?.profileVisibility || 'classmates'}
                onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs sm:text-sm bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="public">Public (All students & university members)</option>
                <option value="classmates">Classmates Only (Enrolled in shared courses)</option>
                <option value="private">Private (Only instructors and administrators)</option>
              </select>
            </div>

            <div className="space-y-2.5 pt-1">
              <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.privacySettings?.showPhone ?? false}
                  onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded bg-slate-800 border-slate-700"
                />
                <span>Share phone number publicly with peers (Default: Hidden)</span>
              </label>

              <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.privacySettings?.showWhatsapp ?? false}
                  onChange={(e) => handlePrivacyChange('showWhatsapp', e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded bg-slate-800 border-slate-700"
                />
                <span>Share WhatsApp link with peers (Default: Hidden)</span>
              </label>

              <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.privacySettings?.showEmail ?? false}
                  onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded bg-slate-800 border-slate-700"
                />
                <span>Share student email on public card (Default: Hidden)</span>
              </label>

              <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.privacySettings?.allowInvites ?? true}
                  onChange={(e) => handlePrivacyChange('allowInvites', e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded bg-slate-800 border-slate-700"
                />
                <span>Allow course peers to invite me to study pods</span>
              </label>
            </div>
          </div>
        </div>

        {/* Bottom Save & Reset Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetProfile}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Profile</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              Preview Public Card
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Academic Profile</span>
            </button>
          </div>
        </div>
      </form>

      {/* Public Profile Card Preview Modal */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Public Card Preview
              </span>
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 text-center">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-20 h-20 rounded-2xl mx-auto object-cover border-2 border-sky-500 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-sky-900 text-amber-300 flex items-center justify-center font-black text-2xl mx-auto shadow-sm">
                  {profile.name.charAt(0)}
                </div>
              )}

              <h3 className="text-lg font-black text-slate-900 mt-3">
                {profile.name}
              </h3>
              <p className="text-xs font-semibold text-sky-700">
                {profile.programme} • Year {profile.currentYear}
              </p>
              <p className="text-[11px] text-slate-500">
                {profile.university}
              </p>

              {profile.biography && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 text-xs text-slate-600 text-left italic border border-slate-100">
                  "{profile.biography}"
                </div>
              )}

              {/* Interests & Skills tags */}
              <div className="mt-3 text-left space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Academic Focus:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(profile.academicInterests || []).map((int, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[10px] font-medium">
                        {int}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Key Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(profile.skills || []).map((sk, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact buttons governed by privacy settings */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2">
                {profile.privacySettings?.showEmail ? (
                  <a
                    href={`mailto:${profile.email}`}
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                ) : (
                  <span className="p-2 rounded-xl bg-slate-50 text-slate-400 text-xs flex items-center gap-1 border border-dashed border-slate-200">
                    <Lock className="w-3 h-3" /> Email Private
                  </span>
                )}

                {profile.privacySettings?.showWhatsapp && profile.whatsapp ? (
                  <a
                    href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                ) : (
                  <span className="p-2 rounded-xl bg-slate-50 text-slate-400 text-xs flex items-center gap-1 border border-dashed border-slate-200">
                    <Lock className="w-3 h-3" /> WhatsApp Private
                  </span>
                )}

                {profile.privacySettings?.showPhone && profile.phone ? (
                  <a
                    href={`tel:${profile.phone}`}
                    className="p-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                ) : (
                  <span className="p-2 rounded-xl bg-slate-50 text-slate-400 text-xs flex items-center gap-1 border border-dashed border-slate-200">
                    <Lock className="w-3 h-3" /> Phone Private
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
