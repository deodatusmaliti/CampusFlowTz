import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, Building, CheckCircle, Key } from 'lucide-react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storageService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onNotify: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onNotify,
}) => {
  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [leadershipTitle, setLeadershipTitle] = useState(currentUser.leadershipTitle || '');
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [university, setUniversity] = useState(currentUser.university);
  const [programme, setProgramme] = useState(currentUser.programme);
  const [mfaEnabled, setMfaEnabled] = useState(currentUser.mfaEnabled);
  const universities = StorageService.getUniversities();

  if (!isOpen) return null;

  const handleThirdPartyAuth = (provider: 'google' | 'microsoft') => {
    const updated: User = {
      ...currentUser,
      authProvider: provider,
      email: provider === 'google' ? 'deodatusmaliti2@gmail.com' : 'deodatus.maliti@udsm.ac.tz',
    };
    onUpdateUser(updated);
    onNotify(`Successfully authenticated via ${provider === 'google' ? 'Google OAuth 2.0 (OIDC)' : 'Microsoft 365 Education SSO'}`);
    onClose();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...currentUser,
      name,
      email,
      role,
      leadershipTitle: leadershipTitle.trim() || undefined,
      university,
      programme,
      mfaEnabled,
    };
    onUpdateUser(updated);
    onNotify(`Identity profile updated as ${leadershipTitle || role.toUpperCase()} at ${university}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-[#102d4f] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1e6fa8]" /> User Authentication & Identity
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Enterprise RBAC (Student, Lecturer, Admin) & SSO</p>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Third-Party SSO Fast Logins */}
        <div className="mt-5 space-y-2.5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fast 3rd-Party Single Sign-On</p>
          <button
            id="sso-google-login-btn"
            type="button"
            onClick={() => handleThirdPartyAuth('google')}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-2xs active:scale-98"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Continue with Google Account (Verified)</span>
          </button>

          <button
            id="sso-microsoft-login-btn"
            type="button"
            onClick={() => handleThirdPartyAuth('microsoft')}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-2xs active:scale-98"
          >
            <svg className="w-4 h-4" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z"/>
              <path fill="#81bc06" d="M12 1h10v10H12z"/>
              <path fill="#05a6f0" d="M1 12h10v10H1z"/>
              <path fill="#ffba08" d="M12 12h10v10H12z"/>
            </svg>
            <span>Continue with Microsoft 365 Education</span>
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-slate-400 font-semibold uppercase">Or Configure Role & Profile</span>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Active Security Role (RBAC)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['student', 'lecturer', 'admin'] as UserRole[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                    role === r
                      ? 'bg-[#102d4f] text-white border-[#102d4f] shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r === 'admin' ? 'University Admin' : r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" /> University
              </label>
              <select
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              >
                {universities.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Programme
              </label>
              <input
                type="text"
                value={programme}
                onChange={(e) => setProgramme(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Leadership / Academic Role Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Dean, Head of Department, Lecturer, Class Rep, Vice Chancellor..."
              value={leadershipTitle}
              onChange={(e) => setLeadershipTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
            />
          </div>

          {/* MFA & Security */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Two-Factor Authentication (MFA)</p>
                <p className="text-[11px] text-slate-500">TOTP Authenticator & SMS verification token</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMfaEnabled(!mfaEnabled)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                mfaEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {mfaEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-auth-profile-btn"
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#102d4f] hover:bg-[#1a406c] text-white text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Apply Profile & Tokens
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
