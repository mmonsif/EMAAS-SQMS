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

export const Header: React.FC = () => {
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

  const roleOptions: { key: StationRole; label: string; dept: string }[] = [
    { key: 'field_staff', label: t.roles.field_staff, dept: 'Apron Operations' },
    { key: 'ramp_supervisor', label: t.roles.ramp_supervisor, dept: 'Apron Shift' },
    { key: 'safety_officer', label: t.roles.safety_officer, dept: 'Safety & Quality' },
    { key: 'hod_safety', label: t.roles.hod_safety, dept: 'Safety & Quality' },
    { key: 'hod_ops', label: t.roles.hod_ops, dept: 'Operations' },
    { key: 'hod_maint', label: t.roles.hod_maint, dept: 'GSE Maintenance' },
    { key: 'hod_training', label: t.roles.hod_training, dept: 'Training Academy' },
    { key: 'sdm', label: t.roles.sdm, dept: 'Operations Management' },
    { key: 'ghm', label: t.roles.ghm, dept: 'Station General Manager' },
    { key: 'ae', label: t.roles.ae, dept: 'Executive Board' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 px-4 lg:px-6 py-2.5 transition-colors no-print">
      <div className="flex items-center justify-between gap-4">
        
        {/* Brand & Station Wordmark */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveView('quickReport')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
            title="Go to Quick Safety Report"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
                  MAGS · RMF Ops
                </span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-800/80 text-blue-400 font-semibold">
                  HEMA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[200px] sm:max-w-xs">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap"
          >
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">{t.header.quickAction}</span>
            <span className="sm:hidden">Report</span>
          </button>

          {/* Active Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium transition-colors text-slate-200"
              title={t.header.switchRole}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <div className="text-left hidden md:block">
                <span className="text-[10px] text-slate-400 block leading-tight">{t.header.role}</span>
                <span className="font-semibold text-slate-100 truncate max-w-[130px] block">
                  {t.roles[activeRole]}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div 
                className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-1.5 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-xl shadow-black/50 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100`}
              >
                <div className="px-3 py-1.5 border-b border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {t.header.switchRole}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Test different permissions & views
                  </p>
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {roleOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setActiveRole(opt.key);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left rtl:text-right flex items-center justify-between text-xs transition-colors ${
                        activeRole === opt.key 
                          ? 'bg-blue-900/40 text-blue-300 font-semibold' 
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate">{opt.label}</div>
                        <div className="text-[10px] text-slate-500">{opt.dept}</div>
                      </div>
                      {activeRole === opt.key && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            title="Toggle English / Arabic"
          >
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold">{language === 'en' ? 'عربي' : 'EN'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title={theme === 'dark' ? t.header.lightMode : t.header.darkMode}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => setResetModalOpen(true)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-red-400 transition-colors"
            title={t.header.resetData}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-5 shadow-2xl text-slate-100">
            <div className="w-10 h-10 rounded-full bg-red-900/50 border border-red-700 flex items-center justify-center text-red-400 mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">{t.header.resetData}</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Reset all reports, audits, SPIs, and bulletins to initial Marsa Alam station defaults?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setResetModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetStationData();
                  setResetModalOpen(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white shadow-sm"
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
