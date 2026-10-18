import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { 
  ShieldAlert, 
  FileText, 
  CalendarCheck, 
  TrendingUp, 
  Bell, 
  GitBranch, 
  Truck, 
  GraduationCap, 
  FileCheck2, 
  Users, 
  Sliders, 
  ShieldCheck, 
  Lock,
  BarChart3,
  Activity
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { 
    language, 
    activeRole,
    activeView, 
    setActiveView, 
    isViewPermitted,
    reports, 
    findings, 
    gseFleet, 
    trainingRecords,
    bulletins,
    theme
  } = useApp();
  
  const t = translations[language];
  const isDark = theme === 'dark';

  // Calculate live badge counts
  const activeReportsCount = reports.filter(r => r.lifecycleStatus !== 'closed').length;
  const openFindingsCount = findings.filter(f => f.lifecycleStage !== 'closed_verified').length;
  const redTagGSECount = gseFleet.filter(g => g.tagStatus === 'red').length;
  const expiringTrainingCount = trainingRecords.flatMap(tr => tr.courses).filter(c => c.status === 'expired' || c.status === 'expiring').length;
  const activeBulletinsCount = bulletins.length;

  const allNavItems = [
    { 
      id: 'quickReport', 
      label: t.nav.quickReport, 
      icon: ShieldAlert, 
      highlight: true 
    },
    { 
      id: 'kpiDashboard', 
      label: t.nav.kpiDashboard || 'Safety KPI Dashboard', 
      icon: BarChart3,
      badge: 'LIVE',
      badgeColor: isDark 
        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
    },
    { 
      id: 'incidentLogs', 
      label: t.nav.incidentLogs, 
      icon: FileText, 
      badge: activeReportsCount > 0 ? activeReportsCount : undefined,
      badgeColor: isDark 
        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
        : 'bg-red-100 text-red-800 border border-red-200'
    },
    { 
      id: 'audits', 
      label: t.nav.audits, 
      icon: CalendarCheck, 
      badge: openFindingsCount > 0 ? openFindingsCount : undefined,
      badgeColor: isDark 
        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
        : 'bg-amber-100 text-amber-800 border border-amber-200'
    },
    { 
      id: 'spiManager', 
      label: t.nav.spiManager, 
      icon: TrendingUp 
    },
    { 
      id: 'bulletins', 
      label: t.nav.bulletins, 
      icon: Bell,
      badge: activeBulletinsCount > 0 ? activeBulletinsCount : undefined,
      badgeColor: isDark 
        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
        : 'bg-blue-100 text-blue-800 border border-blue-200'
    },
    { 
      id: 'moc', 
      label: t.nav.moc, 
      icon: GitBranch 
    },
    { 
      id: 'gseFleet', 
      label: t.nav.gseFleet, 
      icon: Truck, 
      badge: redTagGSECount > 0 ? redTagGSECount : undefined,
      badgeColor: isDark 
        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
        : 'bg-red-100 text-red-800 border border-red-200'
    },
    { 
      id: 'training', 
      label: t.nav.training, 
      icon: GraduationCap, 
      badge: expiringTrainingCount > 0 ? expiringTrainingCount : undefined,
      badgeColor: isDark 
        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
        : 'bg-amber-100 text-amber-800 border border-amber-200'
    },
    { 
      id: 'mgmtReview', 
      label: t.nav.mgmtReview, 
      icon: FileCheck2 
    },
    { 
      id: 'usersAndAccess', 
      label: t.nav.usersAndAccess, 
      icon: Users 
    },
    { 
      id: 'formConfig', 
      label: t.nav.formConfig, 
      icon: Sliders,
      badge: 'ADMIN',
      badgeColor: isDark 
        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
        : 'bg-amber-100 text-amber-900 border border-amber-300'
    },
  ];

  // RBAC Enforcement: filter navigation items strictly based on the active role's permissions
  const authorizedNavItems = allNavItems.filter((item) => isViewPermitted(item.id, activeRole));
  const hiddenCount = allNavItems.length - authorizedNavItems.length;

  return (
    <nav className={`w-full lg:w-64 border-r rtl:border-r-0 rtl:border-l p-3 lg:min-h-[calc(100vh-53px)] shrink-0 no-print flex flex-col justify-between transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
    }`}>
      <div>
        
        {/* RBAC Persona & Access Badge */}
        <div className={`mb-3 p-2.5 rounded-xl border flex items-center justify-between ${
          isDark ? 'bg-slate-950/80 border-slate-800/90' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 truncate">
            <div className={`w-2 h-2 rounded-full shrink-0 ${hiddenCount === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <div className="truncate">
              <p className={`text-[10px] uppercase tracking-wider font-bold truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                RBAC Access Filter
              </p>
              <p className={`text-[11px] font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {(t.roles[activeRole] || activeRole).split('(')[0]}
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 border ${
            isDark 
              ? 'bg-blue-950/60 border-blue-800/60 text-blue-300' 
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            {authorizedNavItems.length}/{allNavItems.length}
          </span>
        </div>

        {/* Authorized Sidebar Links */}
        <div className="space-y-1">
          {authorizedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                    : item.highlight
                      ? isDark 
                        ? 'text-red-400 hover:bg-slate-800/80 hover:text-red-300 font-semibold' 
                        : 'text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold'
                      : isDark 
                        ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white' 
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive 
                      ? 'text-white' 
                      : item.highlight 
                        ? 'text-red-500 group-hover:text-red-400' 
                        : isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-slate-800'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ml-1.5 shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notice of Restricted Modules (when role has restricted views) */}
        {hiddenCount > 0 && (
          <div className={`mt-4 p-2.5 rounded-lg border text-[11px] flex items-center justify-between ${
            isDark ? 'bg-slate-950/50 border-slate-800/60 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{hiddenCount} modules restricted</span>
            </div>
            <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>RBAC</span>
          </div>
        )}
      </div>

      {/* Station Status Chip in Sidebar Footer */}
      <div className={`mt-6 pt-4 border-t px-2 hidden lg:block ${isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
        <div className="flex items-center justify-between text-[11px]">
          <span>Station Code</span>
          <span className={`font-mono font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>HEMA / RMF</span>
        </div>
        <div className="flex items-center justify-between text-[11px] mt-1">
          <span>ICAO Runway</span>
          <span className={`font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>15 / 33</span>
        </div>
        <div className="flex items-center justify-between text-[11px] mt-1">
          <span>Stands Active</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">12 Stands</span>
        </div>
      </div>
    </nav>
  );
};
