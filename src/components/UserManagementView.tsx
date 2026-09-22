import React, { useState, useMemo } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  Filter, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Download, 
  Mail, 
  Phone, 
  Building2, 
  GraduationCap, 
  Lock,
  Unlock,
  AlertCircle,
  KeyRound,
  FileSpreadsheet
} from 'lucide-react';
import { ManagedUser, RolePermission, User, UserRole, LeadershipTitle } from '../types';

interface UserManagementViewProps {
  currentUser: User;
  managedUsers: ManagedUser[];
  rolePermissions: RolePermission[];
  onUpdateUser: (user: ManagedUser) => void;
  onUpdateRolePermissions: (perms: RolePermission[]) => void;
  onAddUser: (user: ManagedUser) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  managedUsers,
  rolePermissions,
  onUpdateUser,
  onUpdateRolePermissions,
  onAddUser,
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'permissions'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Edit User State
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  // Inspect User Permissions State (Harmonized across phone and desktop)
  const [inspectingUser, setInspectingUser] = useState<ManagedUser | null>(null);

  const handleQuickToggleStatus = (u: ManagedUser) => {
    const nextStatus: 'active' | 'suspended' = u.status === 'active' ? 'suspended' : 'active';
    onUpdateUser({ ...u, status: nextStatus });
  };

  // New User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<ManagedUser>>({
    name: '',
    email: '',
    role: 'student',
    leadershipTitle: 'Student',
    university: currentUser.university,
    programme: 'BSc Zoology & Biological Sciences',
    currentYear: 1,
    totalYears: 3,
    status: 'active',
    department: 'Department of Zoology',
    phone: '+255 700 000 000',
    authProvider: 'google',
    mfaEnabled: true,
  });

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return managedUsers.filter(u => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesDept = (u.department || '').toLowerCase().includes(q);
        const matchesTitle = (u.leadershipTitle || '').toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesDept || matchesTitle;
      }

      return true;
    });
  }, [managedUsers, roleFilter, statusFilter, searchQuery]);

  // Handle Permission Matrix Toggle
  const handleTogglePermission = (roleName: string, field: keyof RolePermission) => {
    const updated = rolePermissions.map(rp => {
      if (rp.role === roleName && typeof rp[field] === 'boolean') {
        return { ...rp, [field]: !rp[field] };
      }
      return rp;
    });
    onUpdateRolePermissions(updated);
  };

  // Export Users as CSV
  const handleExportUsers = () => {
    const header = 'ID,Name,Email,Role,LeadershipTitle,University,Programme,Department,Status,Phone\n';
    const rows = filteredUsers.map(u => 
      `"${u.id}","${u.name}","${u.email}","${u.role}","${u.leadershipTitle || ''}","${u.university}","${u.programme}","${u.department || ''}","${u.status}","${u.phone || ''}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CampusFlow_User_Roster_${currentUser.university.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    link.click();
  };

  // Submit New User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const userToAdd: ManagedUser = {
      id: 'usr_' + Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: (newUser.role as UserRole) || 'student',
      leadershipTitle: newUser.leadershipTitle || 'Student',
      university: newUser.university || currentUser.university,
      programme: newUser.programme || 'Undergraduate Programme',
      currentYear: Number(newUser.currentYear) || 1,
      totalYears: Number(newUser.totalYears) || 3,
      status: (newUser.status as any) || 'active',
      department: newUser.department || 'Academic Department',
      phone: newUser.phone || '+255 700 000 000',
      authProvider: 'google',
      mfaEnabled: true,
      lastActive: 'Just registered',
      registeredDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };

    onAddUser(userToAdd);
    setIsAddUserOpen(false);
    setNewUser({
      name: '',
      email: '',
      role: 'student',
      leadershipTitle: 'Student',
      university: currentUser.university,
      programme: 'BSc Zoology & Biological Sciences',
      currentYear: 1,
      totalYears: 3,
      status: 'active',
    });
  };

  return (
    <div id="user-management-container" className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider">
              Administration & Access Control
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Multi-Role Directory ({managedUsers.length} Users)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            University User & Role Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Administer student community accounts, faculty credentials, leadership designations, and permission matrices.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            id="btn-add-user"
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </button>

          <button
            onClick={handleExportUsers}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            title="Export User Roster to CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-6 pt-3 gap-3 shadow-2xs">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            activeTab === 'directory'
              ? 'border-purple-600 text-purple-800 bg-purple-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({managedUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            activeTab === 'permissions'
              ? 'border-purple-600 text-purple-800 bg-purple-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Role Permissions Matrix</span>
        </button>
      </div>

      {/* TAB 1: USER DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, department, or title..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
              >
                <option value="ALL">All Roles</option>
                <option value="student">Students</option>
                <option value="lecturer">Lecturers & Tutors</option>
                <option value="admin">Administrators & Deans</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
              >
                <option value="ALL">All Account Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>
          </div>

          {/* User Table / Cards Container */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {/* Mobile View: User Cards */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredUsers.map(u => (
                <div key={u.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                        {u.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-slate-900 block text-xs truncate">{u.name}</span>
                        <span className="text-slate-500 text-[10px] block truncate">{u.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setInspectingUser(u)}
                        title="View evaluated role permissions"
                        className="p-1.5 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-lg inline-flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Perms</span>
                      </button>
                      <button
                        onClick={() => handleQuickToggleStatus(u)}
                        title={u.status === 'active' ? 'Suspend access' : 'Activate access'}
                        className={`p-1.5 text-xs font-bold rounded-lg inline-flex items-center gap-1 ${
                          u.status === 'active' 
                            ? 'text-rose-700 bg-rose-50 hover:bg-rose-100' 
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {u.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        <span className="text-[10px] capitalize">{u.status === 'active' ? 'Suspend' : 'Activate'}</span>
                      </button>
                      <button
                        onClick={() => setEditingUser(u)}
                        className="px-2 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span className="text-[10px]">Edit</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : u.role === 'lecturer' 
                        ? 'bg-sky-100 text-sky-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {u.role}
                    </span>
                    <span className="text-slate-600 font-semibold">{u.leadershipTitle || 'Member'}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 truncate max-w-[160px]">{u.department || u.programme}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`} />
                      <span className="capitalize font-semibold text-slate-700">{u.status}</span>
                      {u.mfaEnabled && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded font-mono">
                          MFA
                        </span>
                      )}
                    </div>
                    <span>{u.lastActive || 'Recently'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Full Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">User Details</th>
                    <th className="py-3.5 px-4">Role & Leadership</th>
                    <th className="py-3.5 px-4">Department & Programme</th>
                    <th className="py-3.5 px-4">Status & MFA</th>
                    <th className="py-3.5 px-4">Last Activity</th>
                    <th className="py-3.5 px-4 text-right">Harmonized Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                            {u.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-sm">{u.name}</span>
                            <span className="text-slate-500 text-[11px] block">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : u.role === 'lecturer' 
                              ? 'bg-sky-100 text-sky-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {u.role}
                          </span>
                          <div className="text-[11px] font-semibold text-slate-700">
                            {u.leadershipTitle || 'Member'}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{u.programme}</div>
                        <div className="text-slate-500 text-[11px]">{u.department || u.university}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`} />
                          <span className="capitalize font-semibold text-slate-700">{u.status}</span>
                          {u.mfaEnabled && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded font-mono">
                              MFA
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {u.lastActive || 'Unknown'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingUser(u)}
                            title="Inspect active RBAC permissions"
                            className="px-2 py-1 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3 h-3 text-sky-700" />
                            <span>Perms</span>
                          </button>
                          <button
                            onClick={() => handleQuickToggleStatus(u)}
                            title={u.status === 'active' ? 'Suspend account' : 'Activate account'}
                            className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1 ${
                              u.status === 'active'
                                ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status === 'active' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            <span>{u.status === 'active' ? 'Suspend' : 'Activate'}</span>
                          </button>
                          <button
                            onClick={() => setEditingUser(u)}
                            className="px-2.5 py-1 text-xs font-bold text-purple-700 hover:bg-purple-50 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLE PERMISSIONS MATRIX */}
      {activeTab === 'permissions' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Role-Based Access Control (RBAC) Matrix</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure granular security capabilities and broadcast authorities across university roles.
              </p>
            </div>
            <span className="sm:hidden text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-bold self-start">
              ← Scroll table horizontally →
            </span>
          </div>

          <div className="overflow-x-auto pb-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">University Role</th>
                  <th className="py-3 px-3 text-center">Broadcast Announcements</th>
                  <th className="py-3 px-3 text-center">Attach Files (PDF/Word)</th>
                  <th className="py-3 px-3 text-center">Edit Timetable</th>
                  <th className="py-3 px-3 text-center">Manage Courses</th>
                  <th className="py-3 px-3 text-center">Verify Payments</th>
                  <th className="py-3 px-3 text-center">Manage Users</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rolePermissions.map(rp => (
                  <tr key={rp.role} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{rp.label}</div>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">role: {rp.role}</span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={rp.canBroadcast}
                        onChange={() => handleTogglePermission(rp.role, 'canBroadcast')}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={rp.canAttachFiles}
                        onChange={() => handleTogglePermission(rp.role, 'canAttachFiles')}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={rp.canEditTimetable}
                        onChange={() => handleTogglePermission(rp.role, 'canEditTimetable')}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={rp.canManageCourses}
                        onChange={() => handleTogglePermission(rp.role, 'canManageCourses')}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={rp.canVerifyPayments}
                        onChange={() => handleTogglePermission(rp.role, 'canVerifyPayments')}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={rp.canManageUsers}
                        onChange={() => handleTogglePermission(rp.role, 'canManageUsers')}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Edit User: {editingUser.name}</h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">University Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">System Role</label>
                  <select
                    value={editingUser.role}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer / Tutor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editingUser.status}
                    onChange={e => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Leadership Title / Designation</label>
                <input
                  type="text"
                  value={editingUser.leadershipTitle || ''}
                  onChange={e => setEditingUser({ ...editingUser, leadershipTitle: e.target.value })}
                  placeholder="e.g. Dean of Faculty, Head of Department, Class Representative"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={editingUser.department || ''}
                  onChange={e => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateUser(editingUser);
                  setEditingUser(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-purple-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Register New University User</h3>
              <button 
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUser.name || ''}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Dr. Frank Kavishe"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">University Email *</label>
                <input
                  type="email"
                  required
                  value={newUser.email || ''}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g. f.kavishe@udsm.ac.tz"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role *</label>
                  <select
                    value={newUser.role || 'student'}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer / Tutor</option>
                    <option value="admin">Administrator / Dean</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Leadership Title</label>
                  <input
                    type="text"
                    value={newUser.leadershipTitle || ''}
                    onChange={e => setNewUser({ ...newUser, leadershipTitle: e.target.value })}
                    placeholder="e.g. Dean of Faculty"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Programme / Faculty</label>
                <input
                  type="text"
                  value={newUser.programme || ''}
                  onChange={e => setNewUser({ ...newUser, programme: e.target.value })}
                  placeholder="e.g. College of Natural & Applied Sciences"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EVALUATED ROLE PERMISSIONS INSPECTOR MODAL (Harmonized across phone and desktop) */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Evaluated Role Permissions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Active RBAC enforcement across mobile, tablet & desktop
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User identity card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">{inspectingUser.name}</div>
                <div className="text-xs text-slate-500">{inspectingUser.email}</div>
                <div className="text-[11px] text-slate-600 mt-0.5">{inspectingUser.programme}</div>
              </div>
              <div className="text-right space-y-1">
                <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                  inspectingUser.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : inspectingUser.role === 'lecturer'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {inspectingUser.role}
                </span>
                <div className="text-[10px] font-semibold text-slate-500 capitalize">
                  Status: <span className={inspectingUser.status === 'active' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>{inspectingUser.status}</span>
                </div>
              </div>
            </div>

            {/* Permission capabilities list */}
            {(() => {
              const userPerm = rolePermissions.find(r => r.role === inspectingUser.role) || {
                role: inspectingUser.role,
                label: inspectingUser.role,
                canBroadcast: inspectingUser.role === 'admin' || inspectingUser.role === 'lecturer',
                canAttachFiles: true,
                canEditTimetable: inspectingUser.role === 'admin',
                canManageCourses: inspectingUser.role === 'admin' || inspectingUser.role === 'lecturer',
                canVerifyPayments: inspectingUser.role === 'admin',
                canManageUsers: inspectingUser.role === 'admin',
                canIssueAlerts: inspectingUser.role === 'admin' || inspectingUser.role === 'lecturer',
                canExportData: true,
              };

              const capabilities = [
                { key: 'canBroadcast', label: 'Broadcast Campus Announcements', desc: 'Can publish urgent or general alerts to student community' },
                { key: 'canAttachFiles', label: 'Upload & Attach Syllabus Files', desc: 'Can upload lecture slides, PDF past papers and notes' },
                { key: 'canEditTimetable', label: 'Modify Master Lecture Timetable', desc: 'Can add, edit, or reschedule class times & venues' },
                { key: 'canManageCourses', label: 'Course & Syllabus Administration', desc: 'Can configure course units, grading criteria, and lecturers' },
                { key: 'canVerifyPayments', label: 'Verify GePG Financial Payments', desc: 'Can view control numbers and confirm tuition settlement' },
                { key: 'canManageUsers', label: 'User Directory & Role Assignment', desc: 'Can promote roles, suspend accounts, and manage faculty' },
                { key: 'canIssueAlerts', label: 'Trigger Real-Time Venue Changes', desc: 'Can send emergency classroom relocation notifications' },
                { key: 'canExportData', label: 'Export Analytics & Grade Roster', desc: 'Can download CSV tables and academic performance data' },
              ];

              return (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {capabilities.map(cap => {
                    const granted = !!(userPerm as any)[cap.key];
                    return (
                      <div
                        key={cap.key}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                          granted
                            ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                            : 'bg-slate-50 border-slate-200/60 text-slate-400'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className={`font-bold ${granted ? 'text-slate-900' : 'text-slate-500'}`}>
                            {cap.label}
                          </div>
                          <div className="text-[11px] text-slate-500">{cap.desc}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0 ${
                          granted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {granted ? 'Allowed' : 'Restricted'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingUser(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
