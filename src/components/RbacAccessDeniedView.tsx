import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { StationRole } from '../types/index.ts';
import { 
  ShieldAlert, 
  Lock, 
  ArrowLeft, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface RbacAccessDeniedProps {
  attemptedView: string;
}

export const RbacAccessDeniedView: React.FC<RbacAccessDeniedProps> = ({ attemptedView }) => {
  const { language, activeRole, setActiveRole, setActiveView, rolePermissions, theme } = useApp();
  const t = translations[language];
  const isDark = theme === 'dark';

  const currentPerms = rolePermissions[activeRole];

  const permittedModules = [
    { id: 'quickReport', label: t.nav.quickReport, allowed: currentPerms?.canViewQuickReport },
    { id: 'kpiDashboard', label: t.nav.kpiDashboard || 'Safety KPI Dashboard', allowed: currentPerms?.canViewKPIDashboard ?? true },
    { id: 'incidentLogs', label: t.nav.incidentLogs, allowed: currentPerms?.canViewIncidentLogs },
    { id: 'audits', label: t.nav.audits, allowed: currentPerms?.canViewAudits },
    { id: 'spiManager', label: t.nav.spiManager, allowed: currentPerms?.canViewSPI },
    { id: 'bulletins', label: t.nav.bulletins, allowed: currentPerms?.canViewBulletins },
    { id: 'moc', label: t.nav.moc, allowed: currentPerms?.canViewMoC },
    { id: 'gseFleet', label: t.nav.gseFleet, allowed: currentPerms?.canViewGSE },
    { id: 'training', label: t.nav.training, allowed: currentPerms?.canViewTraining },
    { id: 'mgmtReview', label: t.nav.mgmtReview, allowed: currentPerms?.canViewMgmtReview },
    { id: 'usersAndAccess', label: t.nav.usersAndAccess, allowed: currentPerms?.canViewUsersAndAccess },
    { id: 'formConfig', label: t.nav.formConfig, allowed: currentPerms?.canConfigureForm },
  ].filter(m => m.allowed);

  return (
    <div className={`max-w-2xl mx-auto my-8 p-6 rounded-2xl shadow-2xl space-y-6 border transition-colors ${
      isDark ? 'bg-slate-900 border-red-500/30' : 'bg-white border-red-300 shadow-slate-200'
    }`}>
      
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg ${
          isDark 
            ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/10' 
            : 'bg-red-50 border-red-200 text-red-600 shadow-red-500/5'
        }`}>
          <Lock className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
              isDark 
                ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              RBAC 403 RESTRICTED
            </span>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>EMAAS Ground Handling SQMS</span>
          </div>
          <h2 className={`text-lg font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t.rbac.accessDenied}
          </h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t.rbac.deniedSubtitle}
          </p>
        </div>
      </div>

      <div className={`p-4 rounded-xl border space-y-3 ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between text-xs">
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{t.rbac.currentRole}:</span>
          <span className={`font-bold px-2.5 py-1 rounded border ${
            isDark 
              ? 'text-blue-400 bg-blue-950/60 border-blue-800/80' 
              : 'text-blue-800 bg-blue-50 border-blue-200'
          }`}>
            {t.roles[activeRole] || activeRole}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Attempted Module:</span>
          <span className={`font-mono px-2 py-0.5 rounded border ${
            isDark 
              ? 'text-red-300 bg-red-950/50 border-red-900/60' 
              : 'text-red-700 bg-red-50 border-red-200 font-semibold'
          }`}>
            {attemptedView}
          </span>
        </div>
      </div>

      <div>
        <p className={`text-xs font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Authorized Modules for Your Current Role ({permittedModules.length}):
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {permittedModules.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveView(m.id)}
              className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors group text-left rtl:text-right cursor-pointer ${
                isDark 
                  ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-medium">{m.label}</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 transition-colors ${
                isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-900'
              }`} />
            </button>
          ))}
        </div>
      </div>

      <div className={`pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <button
          onClick={() => setActiveView('quickReport')}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t.rbac.returnHome}</span>
        </button>

        <p className={`text-[11px] text-center sm:text-right ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {t.rbac.switchRolePrompt}
        </p>
      </div>
    </div>
  );
};
