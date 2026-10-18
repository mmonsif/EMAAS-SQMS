import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { StationRole } from '../types/index.ts';
import { 
  Plane, 
  ShieldAlert, 
  Moon, 
  Sun, 
  Languages, 
  UserCheck, 
  RefreshCw, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter.tsx';

interface HeaderProps {
  onSelectReport?: (reportId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSelectReport }) => {
  const { 
    language, 
    setLanguage, 
    theme, 
    setTheme, 
    activeRole, 
    setActiveRole, 
    setActiveView,
    resetStationData 
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const t = translations[language];

  const roleOptions: { key: StationRole; label: string; dept: string; authority: string }[] = [
    { key: 'hod_safety', label: t.roles.hod_safety, dept: 'Safety & Quality', authority: 'SQM: Level Classification & Final Sign-off' },
    { key: 'safety_officer', label: t.roles.safety_officer, dept: 'Safety & Quality', authority: 'S&Q: Acknowledgment, Investigation & Effectiveness' },
    { key: 'hod_ops', label: t.roles.hod_ops, dept: 'Operations Dept', authority: 'HoD: CAPA Plan & 5-Whys RCA Submission' },
    { key: 'hod_maint', label: t.roles.hod_maint, dept: 'GSE Maintenance', authority: 'HoD: Equipment CAPA Plan & Work Cards' },
    { key: 'hod_training', label: t.roles.hod_training, dept: 'Training Academy', authority: 'HoD: Training CAPA & Recertification' },
    { key: 'field_staff', label: t.roles.field_staff, dept: 'Apron Operations', authority: 'Frontline: 30-Second Express Reporting' },
    { key: 'ramp_supervisor', label: t.roles.ramp_supervisor, dept: 'Apron Shift', authority: 'Shift Lead: Immediate Containment' },
    { key: 'sdm', label: t.roles.sdm, dept: 'Operations Management', authority: 'Operational Escalation & Turnaround Oversight' },
    { key: 'ghm', label: t.roles.ghm, dept: 'Station General Manager', authority: 'Station Manager: Budget & Resource Sign-off' },
    { key: 'ae', label: t.roles.ae, dept: 'Executive Board', authority: 'Accountable Executive: Strategic SMS Sign-off' },
  ];

  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 border-b px-4 lg:px-6 py-2.5 transition-colors no-print ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
    }`}>
      <div className="flex items-center justify-between gap-4">
        
        {/* Brand & Station Wordmark */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveView('quickReport')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            title="Go to Quick Safety Report"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-base font-black tracking-tight whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  EMAAS · RMF Ops
                </span>
                <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
                  isDark ? 'bg-blue-950/80 border-blue-800/80 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                  HEMA
                </span>
              </div>
              <p className={`text-[11px] font-medium truncate max-w-[200px] sm:max-w-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t.station.smsTitle}
              </p>
            </div>
          </button>
        </div>

        {/* Center / Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick 30s Report CTA */}
          <button
            onClick={() => setActiveView('quickReport')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">{t.header.quickAction}</span>
            <span className="sm:hidden">Report</span>
          </button>

          {/* Real-time Notification Center */}
          <NotificationCenter onSelectReport={onSelectReport} />

          {/* Active Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-200' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
              }`}
              title={t.header.switchRole}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-500" />
              <div className="text-left hidden md:block">
                <span className={`text-[10px] block leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.header.role}</span>
                <span className={`font-semibold truncate max-w-[130px] block ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {t.roles[activeRole] || activeRole}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div 
                className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-1.5 w-72 rounded-xl border shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                  isDark ? 'bg-slate-900 border-slate-700 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-400/30'
                }`}
              >
                <div className={`px-3 py-1.5 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <p className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t.header.switchRole}
                  </p>
                  <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Test strict SQMS 8-step workflow authorizations
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto py-1">
                  {roleOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setActiveRole(opt.key);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left rtl:text-right flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        activeRole === opt.key 
                          ? isDark ? 'bg-blue-900/40 text-blue-300 font-semibold' : 'bg-blue-50 text-blue-800 font-semibold'
                          : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold truncate">{opt.label}</div>
                        <div className="text-[10px] text-blue-500 font-mono">{opt.authority}</div>
                        <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{opt.dept}</div>
                      </div>
                      {activeRole === opt.key && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-200' 
                : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
            }`}
            title="Toggle English / Arabic"
          >
            <Languages className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-bold">{language === 'en' ? 'عربي' : 'EN'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-300 hover:text-white' 
                : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
            }`}
            title={theme === 'dark' ? t.header.lightMode : t.header.darkMode}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => setResetModalOpen(true)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-red-400' 
                : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-500 hover:text-red-600'
            }`}
            title={t.header.resetData}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Reset Station Data?</h3>
                <p className="text-xs text-slate-400">All local changes and test reports will be reset to initial RMF state.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setResetModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetStationData();
                  setResetModalOpen(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-colors"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
