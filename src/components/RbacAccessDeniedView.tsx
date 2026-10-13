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
  const { language, activeRole, setActiveRole, setActiveView, rolePermissions } = useApp();
  const t = translations[language];

  const currentPerms = rolePermissions[activeRole];

  const permittedModules = [
    { id: 'quickReport', label: t.nav.quickReport, allowed: currentPerms?.canViewQuickReport },
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
    <div className="max-w-2xl mx-auto my-8 p-6 bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl space-y-6">
      
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-lg shadow-red-500/10">
          <Lock className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40">
              RBAC 403 RESTRICTED
            </span>
            <span className="text-xs text-slate-400">Marsa Alam Ground Handling SQMS</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            {t.rbac.accessDenied}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.rbac.deniedSubtitle}
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">{t.rbac.currentRole}:</span>
          <span className="font-bold text-blue-400 px-2.5 py-1 rounded bg-blue-950/60 border border-blue-800/80">
            {t.roles[activeRole]}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Attempted Module:</span>
          <span className="font-mono text-red-300 bg-red-950/50 px-2 py-0.5 rounded border border-red-900/60">
            {attemptedView}
          </span>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-300 mb-2">
          Authorized Modules for Your Current Role ({permittedModules.length}):
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {permittedModules.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveView(m.id)}
              className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors group text-left rtl:text-right"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{m.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={() => setActiveView('quickReport')}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t.rbac.returnHome}</span>
        </button>

        <p className="text-[11px] text-slate-400 text-center sm:text-right">
          {t.rbac.switchRolePrompt}
        </p>
      </div>

    </div>
  );
};
