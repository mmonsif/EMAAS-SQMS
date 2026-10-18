import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { StationRole, RolePermissions, UserRecord, DepartmentConfig, RoleDefinition } from '../types/index.ts';
import { 
  Users, 
  ShieldCheck, 
  Building2, 
  Plus, 
  X, 
  Check, 
  Sliders, 
  Eye, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  ArrowRight,
  Edit2,
  Trash2,
  Search,
  Filter,
  ShieldAlert,
  UserCheck,
  AlertTriangle,
  BadgeCheck
} from 'lucide-react';

export const UsersAndAccessMatrixView: React.FC = () => {
  const { 
    language, 
    theme,
    users, 
    addUser,
    updateUser,
    deleteUser,
    departments, 
    addDepartment,
    updateDepartment,
    deleteDepartment,
    roles,
    addRole,
    updateRole,
    deleteRole,
    rolePermissions, 
    updateRolePermission, 
    activeRole,
    setActiveRole
  } = useApp();
  
  const t = translations[language];
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'matrix' | 'users' | 'depts'>('users');
  const [matrixFilter, setMatrixFilter] = useState<'all' | 'modules' | 'actions'>('all');
  
  // Search & Filters
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userDeptFilter, setUserDeptFilter] = useState('all');

  // Modals: User CRUD
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);

  // User Form State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userBadge, setUserBadge] = useState('');
  const [userDept, setUserDept] = useState('Operations Department');
  const [userRoleKey, setUserRoleKey] = useState<string>('field_staff');
  const [userPhone, setUserPhone] = useState('+20 100 000 0000');
  const [userActive, setUserActive] = useState(true);

  // Modals: Department CRUD
  const [addDeptModalOpen, setAddDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentConfig | null>(null);
  const [deptToDelete, setDeptToDelete] = useState<DepartmentConfig | null>(null);

  // Department Form State
  const [deptId, setDeptId] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptNameAr, setDeptNameAr] = useState('');
  const [deptHead, setDeptHead] = useState('');
  const [deptSubUnits, setDeptSubUnits] = useState('');
  const [deptStaffCount, setDeptStaffCount] = useState<number>(20);

  // Modals: Role CRUD
  const [addRoleModalOpen, setAddRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<RoleDefinition | null>(null);

  // Role Form State
  const [newRoleKey, setNewRoleKey] = useState('');
  const [newRoleLabel, setNewRoleLabel] = useState('');
  const [newRoleLabelAr, setNewRoleLabelAr] = useState('');
  const [newRoleClearance, setNewRoleClearance] = useState('Operational Staff');

  // Navigation module access keys
  const modulePermissionKeys: { key: keyof RolePermissions; label: string; group: 'modules' }[] = [
    { key: 'canViewQuickReport', label: t.nav.quickReport, group: 'modules' },
    { key: 'canViewKPIDashboard', label: t.nav.kpiDashboard || 'Safety KPI Dashboard', group: 'modules' },
    { key: 'canViewIncidentLogs', label: t.nav.incidentLogs, group: 'modules' },
    { key: 'canViewAudits', label: t.nav.audits, group: 'modules' },
    { key: 'canViewSPI', label: t.nav.spiManager, group: 'modules' },
    { key: 'canViewBulletins', label: t.nav.bulletins, group: 'modules' },
    { key: 'canViewMoC', label: t.nav.moc, group: 'modules' },
    { key: 'canViewGSE', label: t.nav.gseFleet, group: 'modules' },
    { key: 'canViewTraining', label: t.nav.training, group: 'modules' },
    { key: 'canViewMgmtReview', label: t.nav.mgmtReview, group: 'modules' },
    { key: 'canViewUsersAndAccess', label: t.nav.usersAndAccess, group: 'modules' },
    { key: 'canConfigureForm', label: t.nav.formConfig, group: 'modules' },
  ];

  // Action / authorization permission keys
  const actionPermissionKeys: { key: keyof RolePermissions; label: string; group: 'actions' }[] = [
    { key: 'investigateReports', label: t.usersAndAccess.permissions.investigateReports, group: 'actions' },
    { key: 'approveCAPA', label: t.usersAndAccess.permissions.approveCAPA, group: 'actions' },
    { key: 'closeReports', label: t.usersAndAccess.permissions.closeReports, group: 'actions' },
    { key: 'executeAudits', label: t.usersAndAccess.permissions.executeAudits, group: 'actions' },
    { key: 'manageSPI', label: t.usersAndAccess.permissions.manageSPI, group: 'actions' },
    { key: 'issueBulletins', label: t.usersAndAccess.permissions.issueBulletins, group: 'actions' },
    { key: 'approveMoC', label: t.usersAndAccess.permissions.approveMoC, group: 'actions' },
    { key: 'adminConfig', label: t.usersAndAccess.permissions.adminConfig, group: 'actions' },
  ];

  const displayedPermissions = 
    matrixFilter === 'modules' ? modulePermissionKeys :
    matrixFilter === 'actions' ? actionPermissionKeys :
    [...modulePermissionKeys, ...actionPermissionKeys];

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (userDeptFilter !== 'all' && u.department !== userDeptFilter) return false;
      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchBadge = u.badgeNumber.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchRole = u.role.toLowerCase().includes(q);
        if (!matchName && !matchBadge && !matchEmail && !matchRole) return false;
      }
      return true;
    });
  }, [users, userSearchQuery, userDeptFilter]);

  // -------------------------------------------------------------
  // USER CRUD HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddUser = () => {
    setUserName('');
    setUserEmail('');
    setUserBadge(`RMF-${Math.floor(1000 + Math.random() * 9000)}`);
    setUserDept(departments[0]?.name || 'Operations Department');
    setUserRoleKey(roles[0]?.key || 'field_staff');
    setUserPhone('+20 100 000 0000');
    setUserActive(true);
    setAddUserModalOpen(true);
  };

  const handleOpenEditUser = (user: UserRecord) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserBadge(user.badgeNumber);
    setUserDept(user.department);
    setUserRoleKey(user.role);
    setUserPhone(user.phone);
    setUserActive(user.isActive);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    if (editingUser) {
      updateUser(editingUser.id, {
        name: userName.trim(),
        email: userEmail.trim(),
        badgeNumber: userBadge.trim(),
        department: userDept,
        role: userRoleKey as StationRole,
        phone: userPhone.trim(),
        isActive: userActive
      });
      setEditingUser(null);
    } else {
      addUser({
        name: userName.trim(),
        email: userEmail.trim() || `${userBadge.toLowerCase()}@marsa-alam-ground.com`,
        badgeNumber: userBadge.trim(),
        department: userDept,
        role: userRoleKey as StationRole,
        isActive: userActive,
        phone: userPhone.trim()
      });
      setAddUserModalOpen(false);
    }
  };

  // -------------------------------------------------------------
  // DEPARTMENT CRUD HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddDept = () => {
    setDeptId(`DEPT-${String(departments.length + 1).padStart(2, '0')}`);
    setDeptName('');
    setDeptNameAr('');
    setDeptHead('');
    setDeptSubUnits('Operations, Fleet, Customer Care');
    setDeptStaffCount(25);
    setAddDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept: DepartmentConfig) => {
    setEditingDept(dept);
    setDeptId(dept.id);
    setDeptName(dept.name);
    setDeptNameAr(dept.nameAr);
    setDeptHead(dept.headOfDepartment);
    setDeptSubUnits(dept.subUnits.join(', '));
    setDeptStaffCount(dept.staffCount);
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    const units = deptSubUnits.split(',').map(s => s.trim()).filter(Boolean);

    if (editingDept) {
      updateDepartment(editingDept.id, {
        name: deptName.trim(),
        nameAr: deptNameAr.trim() || deptName.trim(),
        headOfDepartment: deptHead.trim(),
        subUnits: units,
        staffCount: deptStaffCount
      });
      setEditingDept(null);
    } else {
      addDepartment({
        id: deptId.trim() || undefined,
        name: deptName.trim(),
        nameAr: deptNameAr.trim() || deptName.trim(),
        headOfDepartment: deptHead.trim(),
        subUnits: units,
        staffCount: deptStaffCount
      });
      setAddDeptModalOpen(false);
    }
  };

  // -------------------------------------------------------------
  // ROLE CRUD HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddRole = () => {
    setNewRoleKey('');
    setNewRoleLabel('');
    setNewRoleLabelAr('');
    setNewRoleClearance('Operational Specialist');
    setAddRoleModalOpen(true);
  };

  const handleOpenEditRole = (role: RoleDefinition) => {
    setEditingRole(role);
    setNewRoleLabel(role.label);
    setNewRoleLabelAr(role.labelAr || role.label);
    setNewRoleClearance(role.clearance);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleLabel.trim()) return;

    if (editingRole) {
      updateRole(editingRole.key, {
        label: newRoleLabel.trim(),
        labelAr: newRoleLabelAr.trim() || newRoleLabel.trim(),
        clearance: newRoleClearance.trim()
      });
      setEditingRole(null);
    } else {
      addRole({
        key: newRoleKey.trim() || newRoleLabel.toLowerCase().replace(/\s+/g, '_'),
        label: newRoleLabel.trim(),
        labelAr: newRoleLabelAr.trim() || newRoleLabel.trim(),
        clearance: newRoleClearance.trim()
      });
      setAddRoleModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className={`p-5 rounded-2xl border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        isDark 
          ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border-slate-800' 
          : 'bg-gradient-to-r from-white via-slate-50 to-blue-50/50 border-slate-200 shadow-sm'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${
              isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}>
              EMAAS RBAC Engine · IATA ISAGO / SMS Framework
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <Users className="w-7 h-7 text-blue-500" />
            <span>{t.usersAndAccess.title}</span>
          </h1>
          <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {language === 'ar'
              ? 'إدارة متكاملة للمستخدمين والأقسام والمناصب الوظيفية (إضافة، تعديل، حذف) مع التحكم في مصفوفة الصلاحيات.'
              : 'Complete administration for station personnel, operating departments, and authorization roles with instant CRUD editing and RBAC permission enforcement.'}
          </p>
        </div>

        {/* Global Action Button based on Active Tab */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeTab === 'users' && (
            <button
              onClick={handleOpenAddUser}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.usersAndAccess.addUserBtn || 'Add New Staff Member'}</span>
            </button>
          )}

          {activeTab === 'depts' && (
            <button
              onClick={handleOpenAddDept}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'إضافة إدارة جديدة' : 'Add New Department'}</span>
            </button>
          )}

          {activeTab === 'matrix' && (
            <button
              onClick={handleOpenAddRole}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'إضافة دور جديد' : 'Create Custom Role'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className={`p-1.5 rounded-xl border flex items-center gap-1 text-xs font-bold ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100 border-slate-300'
      }`}>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{language === 'ar' ? 'دليل موظفي المحطة' : 'Staff Personnel Directory'}</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
            activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
          }`}>
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('depts')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'depts'
              ? 'bg-blue-600 text-white shadow'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{language === 'ar' ? 'الأقسام التشغيلية' : 'Operating Departments'}</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
            activeTab === 'depts' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
          }`}>
            {departments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-blue-600 text-white shadow'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{language === 'ar' ? 'مصفوفة الصلاحيات والأدوار' : 'RBAC Access Matrix & Roles'}</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
            activeTab === 'matrix' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
          }`}>
            {roles.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USERS DIRECTORY (FULL CRUD)                                        */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className={`border rounded-2xl overflow-hidden shadow-xl space-y-4 p-5 transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search staff name, badge, email..."
                  className={`w-full pl-8 pr-3 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <select
                value={userDeptFilter}
                onChange={(e) => setUserDeptFilter(e.target.value)}
                className={`py-1.5 px-2.5 rounded-lg border focus:outline-none ${
                  isDark ? 'bg-slate-950 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto text-[11px] text-slate-500 font-mono">
              <span>Showing {filteredUsers.length} of {users.length} staff</span>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead>
                <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  <th className="py-3 px-4">Staff Name & Contact</th>
                  <th className="py-3 px-3">Airport Badge</th>
                  <th className="py-3 px-3">Operating Department</th>
                  <th className="py-3 px-3">Role Title</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right rtl:text-left">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                      No staff members match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isCurrentUserActivePersona = activeRole === u.role;
                    return (
                      <tr key={u.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                        {/* Name & Email */}
                        <td className="py-3 px-4">
                          <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{u.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email} · {u.phone}</div>
                        </td>

                        {/* Badge Number */}
                        <td className="py-3 px-3">
                          <span className="font-mono text-blue-500 font-bold text-xs bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/60">
                            {u.badgeNumber}
                          </span>
                        </td>

                        {/* Department */}
                        <td className="py-3 px-3">
                          <span className="truncate block max-w-[180px]">{u.department}</span>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}>
                            {t.roles[u.role] || u.role}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.isActive 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Actions: Edit, Delete, Impersonate */}
                        <td className="py-3 px-3 text-right rtl:text-left">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Impersonate / Test Persona */}
                            <button
                              type="button"
                              onClick={() => setActiveRole(u.role)}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                                isCurrentUserActivePersona
                                  ? 'bg-blue-600 text-white'
                                  : isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                              title={`Switch persona to ${u.name}`}
                            >
                              {isCurrentUserActivePersona ? 'Active Persona' : 'Test Persona'}
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                isDark 
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700' 
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300'
                              }`}
                              title="Edit Personnel Record"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => setUserToDelete(u)}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                isDark 
                                  ? 'bg-red-950/30 hover:bg-red-900/50 text-red-400 border-red-800/40' 
                                  : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                              }`}
                              title="Delete Personnel Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DEPARTMENTS (FULL CRUD)                                            */}
      {/* ========================================================================= */}
      {activeTab === 'depts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <div 
              key={dept.id} 
              className={`border rounded-2xl p-5 shadow-xl space-y-4 transition-all flex flex-col justify-between ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded border ${
                    isDark ? 'bg-blue-900/60 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {dept.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono">
                      {dept.staffCount} Staff Members
                    </span>
                    <button
                      onClick={() => handleOpenEditDept(dept)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                      title="Edit Department"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeptToDelete(dept)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        isDark ? 'bg-red-950/30 hover:bg-red-900/50 text-red-400 border-red-800/40' : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                      }`}
                      title="Delete Department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {language === 'ar' ? dept.nameAr : dept.name}
                  </h3>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    Head of Department: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{dept.headOfDepartment}</strong>
                  </span>
                </div>

                <div className={`pt-2 border-t space-y-1.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Operating Sub-Units:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.subUnits.map((sub, i) => (
                      <span 
                        key={i} 
                        className={`text-[11px] px-2.5 py-1 rounded-lg border ${
                          isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`pt-3 border-t flex items-center justify-between text-[11px] text-slate-500 font-mono ${
                isDark ? 'border-slate-800/80' : 'border-slate-200'
              }`}>
                <span>EMAAS Ground Station Unit</span>
                <span className="text-emerald-500 font-bold">Operational</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACCESS MATRIX & ROLES (FULL CRUD & PERMISSIONS TOGGLE)             */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <div className={`border rounded-2xl overflow-hidden shadow-xl space-y-4 p-5 transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {/* Top Filter Buttons for Matrix */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`font-bold mr-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Filter Permissions:</span>
              <button
                onClick={() => setMatrixFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  matrixFilter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'
                }`}
              >
                All ({displayedPermissions.length})
              </button>
              <button
                onClick={() => setMatrixFilter('modules')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  matrixFilter === 'modules' 
                    ? 'bg-blue-600 text-white' 
                    : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'
                }`}
              >
                Navigation Modules
              </button>
              <button
                onClick={() => setMatrixFilter('actions')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  matrixFilter === 'actions' 
                    ? 'bg-blue-600 text-white' 
                    : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'
                }`}
              >
                Critical Actions
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-mono">
                Click any checkbox to grant or revoke real-time role authorization.
              </span>
            </div>
          </div>

          {/* Interactive Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead>
                <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  <th className="py-3 px-3 min-w-[200px] sticky left-0 rtl:left-auto rtl:right-0 bg-slate-100 dark:bg-slate-950 z-20">
                    Station Role
                  </th>
                  <th className="py-3 px-2 text-center">Test Persona</th>
                  <th className="py-3 px-2 text-center">Manage</th>
                  {displayedPermissions.map((p) => (
                    <th key={p.key} className="py-3 px-2 text-center min-w-[90px]">
                      <span className="truncate block max-w-[100px] mx-auto" title={p.label}>
                        {p.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                {roles.map((r) => {
                  const currentPerms = rolePermissions[r.key];
                  const isCurrentActive = activeRole === r.key;

                  return (
                    <tr key={r.key} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                      {/* Role Info */}
                      <td className={`py-2.5 px-3 font-semibold sticky left-0 rtl:left-auto rtl:right-0 z-20 whitespace-nowrap ${
                        isDark ? 'bg-slate-900/95 text-white' : 'bg-white/95 text-slate-900 shadow-xs'
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${isCurrentActive ? 'bg-blue-500 ring-2 ring-blue-400' : 'bg-slate-400'}`} />
                          <div>
                            <span className="block font-bold">{r.label}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">
                              {r.clearance} {!r.isSystem && '(Custom)'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Test Switch Persona */}
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => setActiveRole(r.key as StationRole)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            isCurrentActive
                              ? 'bg-blue-600 text-white'
                              : isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                          }`}
                        >
                          {isCurrentActive ? 'Active' : 'Test'}
                        </button>
                      </td>

                      {/* Role Edit & Delete Actions */}
                      <td className="py-2.5 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditRole(r)}
                            className="p-1 text-slate-400 hover:text-blue-500 cursor-pointer"
                            title="Edit Role Label"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          {!r.isSystem && (
                            <button
                              onClick={() => setRoleToDelete(r)}
                              className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                              title="Delete Role"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Permission Toggles */}
                      {displayedPermissions.map((p) => {
                        const isGranted = currentPerms ? !!currentPerms[p.key] : false;
                        return (
                          <td 
                            key={p.key} 
                            className={`py-2 px-1 text-center ${
                              p.group === 'modules' ? 'bg-blue-500/5' : 'bg-amber-500/5'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => updateRolePermission(r.key, p.key, !isGranted)}
                              className={`w-6 h-6 rounded flex items-center justify-center transition mx-auto cursor-pointer ${
                                isGranted
                                  ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-500'
                                  : isDark 
                                    ? 'bg-slate-950 border border-slate-700 text-slate-600 hover:border-slate-500' 
                                    : 'bg-white border border-slate-300 text-slate-400 hover:border-slate-500'
                              }`}
                              title={`Toggle ${p.label} for ${r.label}`}
                            >
                              {isGranted ? <Check className="w-3.5 h-3.5" /> : null}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT USER                                                    */}
      {/* ========================================================================= */}
      {(addUserModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form 
            onSubmit={handleSaveUser} 
            className={`border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Users className="w-4 h-4 text-blue-500" />
                <span>{editingUser ? 'Edit Personnel Record' : 'Register New Station Staff'}</span>
              </h3>
              <button
                type="button"
                onClick={() => { setAddUserModalOpen(false); setEditingUser(null); }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahmoud Ezz"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={`w-full p-2 rounded-lg border font-medium ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Badge Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="RMF-XXXX"
                    value={userBadge}
                    onChange={(e) => setUserBadge(e.target.value)}
                    className={`w-full p-2 rounded-lg border font-mono font-bold ${
                      isDark ? 'bg-slate-950 border-slate-700 text-blue-400' : 'bg-white border-slate-300 text-blue-700'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className={`w-full p-2 rounded-lg border font-mono ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="user@marsa-alam-ground.com"
                  className={`w-full p-2 rounded-lg border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Assigned Operating Department
                </label>
                <select
                  value={userDept}
                  onChange={(e) => setUserDept(e.target.value)}
                  className={`w-full p-2 rounded-lg border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  System Authorization Role
                </label>
                <select
                  value={userRoleKey}
                  onChange={(e) => setUserRoleKey(e.target.value)}
                  className={`w-full p-2 rounded-lg border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  {roles.map((r) => (
                    <option key={r.key} value={r.key}>{r.label} ({r.clearance})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="userActiveCheck"
                  checked={userActive}
                  onChange={(e) => setUserActive(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <label htmlFor="userActiveCheck" className="text-xs text-slate-400 font-semibold cursor-pointer">
                  Account is Active for Airside Operations
                </label>
              </div>
            </div>

            <div className={`flex items-center justify-end gap-2 pt-3 border-t ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { setAddUserModalOpen(false); setEditingUser(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow cursor-pointer"
              >
                {editingUser ? 'Save Changes' : 'Create Staff Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE USER CONFIRMATION                                            */}
      {/* ========================================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`border rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Delete Staff Record?</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Are you sure you want to remove <strong>{userToDelete.name}</strong> ({userToDelete.badgeNumber}) from station records?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setUserToDelete(null)}
                className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteUser(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT DEPARTMENT                                              */}
      {/* ========================================================================= */}
      {(addDeptModalOpen || editingDept) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form 
            onSubmit={handleSaveDept} 
            className={`border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Building2 className="w-4 h-4 text-blue-500" />
                <span>{editingDept ? 'Edit Operating Department' : 'Create Operating Department'}</span>
              </h3>
              <button
                type="button"
                onClick={() => { setAddDeptModalOpen(false); setEditingDept(null); }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Department Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Passenger Handling Department"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className={`w-full p-2 rounded-lg border font-medium ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Department Name (Arabic)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="إدارة خدمة الركاب وبوابات الصعود..."
                  value={deptNameAr}
                  onChange={(e) => setDeptNameAr(e.target.value)}
                  className={`w-full p-2 rounded-lg border font-medium ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Department ID
                  </label>
                  <input
                    type="text"
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    placeholder="DEPT-PAX"
                    className={`w-full p-2 rounded-lg border font-mono font-bold ${
                      isDark ? 'bg-slate-950 border-slate-700 text-blue-400' : 'bg-white border-slate-300 text-blue-700'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Staff Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={deptStaffCount}
                    onChange={(e) => setDeptStaffCount(parseInt(e.target.value) || 0)}
                    className={`w-full p-2 rounded-lg border font-mono ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Head of Department (HoD)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Capt. Sherif Nour"
                  value={deptHead}
                  onChange={(e) => setDeptHead(e.target.value)}
                  className={`w-full p-2 rounded-lg border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Operating Sub-Units (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Check-in Counters, Boarding Gates, Lost & Found"
                  value={deptSubUnits}
                  onChange={(e) => setDeptSubUnits(e.target.value)}
                  className={`w-full p-2 rounded-lg border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className={`flex items-center justify-end gap-2 pt-3 border-t ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { setAddDeptModalOpen(false); setEditingDept(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow cursor-pointer"
              >
                {editingDept ? 'Update Department' : 'Create Department'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE DEPARTMENT CONFIRMATION                                      */}
      {/* ========================================================================= */}
      {deptToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`border rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Delete Department?</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Are you sure you want to remove <strong>{deptToDelete.name}</strong> ({deptToDelete.id})?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDeptToDelete(null)}
                className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteDepartment(deptToDelete.id);
                  setDeptToDelete(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT ROLE                                                    */}
      {/* ========================================================================= */}
      {(addRoleModalOpen || editingRole) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveRole} 
            className={`border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span>{editingRole ? 'Edit Role Details' : 'Create Custom Role Definition'}</span>
              </h3>
              <button
                type="button"
                onClick={() => { setAddRoleModalOpen(false); setEditingRole(null); }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {!editingRole && (
                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Role Key Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. apron_marshal"
                    value={newRoleKey}
                    onChange={(e) => setNewRoleKey(e.target.value)}
                    className={`w-full p-2 rounded-lg border font-mono ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              )}

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Role Label (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Apron Marshaller"
                  value={newRoleLabel}
                  onChange={(e) => setNewRoleLabel(e.target.value)}
                  className={`w-full p-2 rounded-lg border font-medium ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Role Label (Arabic)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مشرف توجيه الطائرات بالمهبط..."
                  value={newRoleLabelAr}
                  onChange={(e) => setNewRoleLabelAr(e.target.value)}
                  className={`w-full p-2 rounded-lg border font-medium ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Clearance Level / Category
                </label>
                <input
                  type="text"
                  placeholder="Shift Leadership, Frontline, Quality Inspector"
                  value={newRoleClearance}
                  onChange={(e) => setNewRoleClearance(e.target.value)}
                  className={`w-full p-2 rounded-lg border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className={`flex items-center justify-end gap-2 pt-3 border-t ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { setAddRoleModalOpen(false); setEditingRole(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow cursor-pointer"
              >
                {editingRole ? 'Save Role' : 'Create Role'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE ROLE CONFIRMATION                                            */}
      {/* ========================================================================= */}
      {roleToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`border rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Delete Custom Role?</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Are you sure you want to remove the role <strong>{roleToDelete.label}</strong> ({roleToDelete.key})?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setRoleToDelete(null)}
                className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteRole(roleToDelete.key);
                  setRoleToDelete(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
