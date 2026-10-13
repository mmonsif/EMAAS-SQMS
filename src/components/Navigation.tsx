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
  Lock
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
    bulletins
  } = useApp();
  
  const t = translations[language];

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
      id: 'incidentLogs', 
      label: t.nav.incidentLogs, 
      icon: FileText, 
      badge: activeReportsCount > 0 ? activeReportsCount : undefined,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30'
    },
    { 
      id: 'audits', 
      label: t.nav.audits, 
      icon: CalendarCheck, 
      badge: openFindingsCount > 0 ? openFindingsCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
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
      badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
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
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30'
    },
    { 
      id: 'training', 
      label: t.nav.training, 
      icon: GraduationCap, 
      badge: expiringTrainingCount > 0 ? expiringTrainingCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
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
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
  ];

  // RBAC Enforcement: filter navigation items strictly based on the active role's permissions
  const authorizedNavItems = allNavItems.filter((item) => isViewPermitted(item.id, activeRole));
  const hiddenCount = allNavItems.length - authorizedNavItems.length;

  return (
    <nav className="w-full lg:w-64 bg-slate-900 border-r rtl:border-r-0 rtl:border-l border-slate-800 p-3 lg:min-h-[calc(100vh-53px)] shrink-0 no-print flex flex-col justify-between">
      <div>
        
        {/* RBAC Persona & Access Badge */}
        <div className="mb-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <div className={`w-2 h-2 rounded-full shrink-0 ${hiddenCount === 0 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <div className="truncate">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold truncate">
                RBAC Access Filter
              </p>
              <p className="text-[11px] font-semibold text-slate-200 truncate">
                {t.roles[activeRole].split('(')[0]}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-800/60 text-blue-300 font-bold shrink-0">
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                    : item.highlight
                      ? 'text-red-400 hover:bg-slate-800/80 hover:text-red-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive 
                      ? 'text-white' 
                      : item.highlight 
                        ? 'text-red-400 group-hover:text-red-300' 
                        : 'text-slate-400 group-hover:text-slate-200'
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
          <div className="mt-4 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
              <span>{hiddenCount} modules restricted</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">RBAC</span>
          </div>
        )}
      </div>

      {/* Station Status Chip in Sidebar Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 px-2 hidden lg:block">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Station Code</span>
          <span className="font-mono font-semibold text-slate-200">HEMA / RMF</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
          <span>ICAO Runway</span>
          <span className="font-mono text-slate-300">15 / 33</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
          <span>Stands Active</span>
          <span className="font-mono text-emerald-400">12 Stands</span>
        </div>
      </div>
    </nav>
  );
};
