import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { StationRole, RolePermissions, UserRecord } from '../types/index.ts';
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
  ArrowRight
} from 'lucide-react';

export const UsersAndAccessMatrixView: React.FC = () => {
  const { 
    language, 
    users, 
    departments, 
    rolePermissions, 
    updateRolePermission, 
    addUser,
    activeRole,
    setActiveRole
  } = useApp();
  
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'matrix' | 'users' | 'depts'>('matrix');
  const [matrixFilter, setMatrixFilter] = useState<'all' | 'modules' | 'actions'>('all');
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserBadge, setNewUserBadge] = useState('');
  const [newUserDept, setNewUserDept] = useState('Operations - Ramp Services');
  const [newUserRole, setNewUserRole] = useState<StationRole>('field_staff');
  const [newUserPhone, setNewUserPhone] = useState('+20 100 000 0000');

  const rolesList: { key: StationRole; label: string; clearance: string }[] = [
    { key: 'ae', label: t.roles.ae, clearance: 'Executive' },
    { key: 'ghm', label: t.roles.ghm, clearance: 'General Manager' },
    { key: 'sdm', label: t.roles.sdm, clearance: 'Operations Lead' },
    { key: 'hod_safety', label: t.roles.hod_safety, clearance: 'SMS Authority' },
    { key: 'hod_ops', label: t.roles.hod_ops, clearance: 'Department Head' },
    { key: 'hod_maint', label: t.roles.hod_maint, clearance: 'Department Head' },
    { key: 'hod_training', label: t.roles.hod_training, clearance: 'Department Head' },
    { key: 'safety_officer', label: t.roles.safety_officer, clearance: 'Investigator' },
    { key: 'ramp_supervisor', label: t.roles.ramp_supervisor, clearance: 'Shift Supervisor' },
    { key: 'field_staff', label: t.roles.field_staff, clearance: 'Frontline Agent' },
  ];

  // Navigation module access keys (strictly control sidebar visibility and page exploration)
  const modulePermissionKeys: { key: keyof RolePermissions; label: string; group: 'modules' }[] = [
    { key: 'canViewQuickReport', label: t.nav.quickReport, group: 'modules' },
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

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    addUser({
      name: newUserName,
      email: newUserEmail,
      badgeNumber: newUserBadge,
      department: newUserDept,
      role: newUserRole,
      isActive: true,
      phone: newUserPhone
    });

    setAddUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserBadge('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span>{t.usersAndAccess.title}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.usersAndAccess.subtitle}
          </p>
        </div>

        <button
          onClick={() => setAddUserModalOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.usersAndAccess.addUserBtn}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'matrix' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{t.usersAndAccess.matrixTab}</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'users' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{t.usersAndAccess.usersTab} ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('depts')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'depts' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{t.usersAndAccess.deptsTab} ({departments.length})</span>
        </button>
      </div>

      {/* TAB 1: Role Permissions Access Matrix */}
      {activeTab === 'matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-3 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Dynamic RBAC Permissions & Navigation Visibility Matrix</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Checkboxes directly dictate which items appear in each role's sidebar and which actions they can execute.
              </p>
            </div>

            {/* Matrix View Filter */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setMatrixFilter('all')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  matrixFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({modulePermissionKeys.length + actionPermissionKeys.length})
              </button>
              <button
                type="button"
                onClick={() => setMatrixFilter('modules')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  matrixFilter === 'modules' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sidebar Modules ({modulePermissionKeys.length})
              </button>
              <button
                type="button"
                onClick={() => setMatrixFilter('actions')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  matrixFilter === 'actions' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Actions ({actionPermissionKeys.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3 sticky left-0 rtl:left-auto rtl:right-0 bg-slate-950/95 z-20 min-w-[200px]">
                    Station Persona / Role
                  </th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[100px] z-10">
                    Live Test
                  </th>
                  {displayedPermissions.map((p) => (
                    <th 
                      key={p.key} 
                      className={`py-2.5 px-3 text-center whitespace-nowrap min-w-[120px] ${
                        p.group === 'modules' ? 'text-blue-300 bg-blue-950/20' : 'text-amber-300 bg-amber-950/20'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[9px] uppercase tracking-wider opacity-60">
                          {p.group === 'modules' ? 'Sidebar' : 'Action'}
                        </span>
                        <span>{p.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {rolesList.map((r) => {
                  const currentPerms = rolePermissions[r.key];
                  const isCurrentActive = activeRole === r.key;

                  return (
                    <tr 
                      key={r.key} 
                      className={`hover:bg-slate-850/60 transition-colors ${
                        isCurrentActive ? 'bg-blue-950/30' : ''
                      }`}
                    >
                      {/* Role Info */}
                      <td className="py-2.5 px-3 font-semibold text-white sticky left-0 rtl:left-auto rtl:right-0 bg-slate-900/95 z-20 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isCurrentActive ? 'bg-blue-400 animate-ping' : 'bg-slate-600'}`} />
                          <div>
                            <span className="block">{r.label}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">
                              {r.clearance}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Live Switch & Test Button */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setActiveRole(r.key)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                            isCurrentActive
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                          title={`Switch active persona to ${r.label}`}
                        >
                          {isCurrentActive ? 'Active' : 'Test'}
                        </button>
                      </td>

                      {/* Permission Toggles */}
                      {displayedPermissions.map((p) => {
                        const isGranted = currentPerms ? !!currentPerms[p.key] : false;
                        return (
                          <td 
                            key={p.key} 
                            className={`py-2.5 px-3 text-center ${
                              p.group === 'modules' ? 'bg-blue-950/10' : 'bg-amber-950/10'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => updateRolePermission(r.key, p.key, !isGranted)}
                              className={`w-6 h-6 rounded flex items-center justify-center transition-all mx-auto ${
                                isGranted
                                  ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-500'
                                  : 'bg-slate-950 border border-slate-700 text-slate-600 hover:border-slate-500'
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

      {/* TAB 2: Staff Directory Table */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              RMF Registered Personnel ({users.length} Users)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Staff Name</th>
                  <th className="py-3 px-4">Badge #</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Role Title</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/60">
                    <td className="py-2.5 px-4 font-semibold text-white">
                      {u.name}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-blue-400 font-bold">
                      {u.badgeNumber}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">
                      {u.department}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-200 font-medium">
                        {t.roles[u.role]}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">
                      {u.email}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">
                      {u.phone}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Department Configuration */}
      {activeTab === 'depts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300">
                  {dept.id}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {dept.staffCount} Staff Members
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">
                  {language === 'ar' ? dept.nameAr : dept.name}
                </h3>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Head of Department: <strong className="text-slate-200">{dept.headOfDepartment}</strong>
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-500 uppercase font-bold block">Operating Sub-Units:</span>
                <div className="flex flex-wrap gap-1.5">
                  {dept.subUnits.map((sub, i) => (
                    <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add User Modal */}
      {addUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>{t.usersAndAccess.addUserBtn}</span>
              </h3>
              <button
                onClick={() => setAddUserModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahmoud Ezz"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Badge Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="RMF-XXXX"
                    value={newUserBadge}
                    onChange={(e) => setNewUserBadge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="name@marsa-alam-ground.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Department
                </label>
                <select
                  value={newUserDept}
                  onChange={(e) => setNewUserDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Operations - Ramp Services">Operations - Ramp Services</option>
                  <option value="Operations - Load Control">Operations - Load Control</option>
                  <option value="Operations - Passenger Handling">Operations - Passenger Handling</option>
                  <option value="Maintenance - GSE Fleet">Maintenance - GSE Fleet</option>
                  <option value="Safety & Quality">Safety & Quality</option>
                  <option value="Training Academy">Training Academy</option>
                  <option value="Station Management">Station Management</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Assigned Station Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as StationRole)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {rolesList.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddUserModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                >
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
