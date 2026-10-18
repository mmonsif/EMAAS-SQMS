import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Mail, 
  Clock, 
  AlertCircle, 
  ShieldAlert, 
  ExternalLink,
  Filter,
  Check
} from 'lucide-react';

interface NotificationCenterProps {
  onSelectReport?: (reportId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onSelectReport }) => {
  const { 
    language, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearAllNotifications,
    activeRole,
    setActiveView,
    theme
  } = useApp();

  const isDark = theme === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'my_role'>('all');

  const t = translations[language];

  // Role-targeted notifications
  const displayedNotifs = notifications.filter(n => {
    if (filterRole === 'my_role') {
      return n.targetRoles.includes(activeRole) || n.targetRoles.includes('all');
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleOpenCase = (reportId?: string, notifId?: string) => {
    if (notifId) markNotificationAsRead(notifId);
    if (reportId) {
      if (onSelectReport) {
        onSelectReport(reportId);
      }
      setActiveView('incidentLogs');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg border transition-all active:scale-95 cursor-pointer ${
          isDark 
            ? 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-300 hover:text-white' 
            : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 shadow-xs'
        }`}
        title={t.notifications.title}
      >
        <Bell className="w-4 h-4 text-blue-500" />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 border-2 ${
            isDark ? 'border-slate-900' : 'border-white'
          } text-[10px] font-mono font-bold text-white flex items-center justify-center animate-pulse shadow-md shadow-red-600/40`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div 
          className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col max-h-[85vh] ${
            isDark 
              ? 'bg-slate-900 border-slate-700 shadow-black/70 text-slate-100' 
              : 'bg-white border-slate-200 shadow-slate-400/30 text-slate-900'
          }`}
        >
          {/* Header */}
          <div className={`p-3.5 border-b flex items-center justify-between ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
                isDark 
                  ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' 
                  : 'bg-blue-50 border-blue-200 text-blue-600'
              }`}>
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-xs font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {language === 'ar' ? t.notifications.titleAr : t.notifications.title}
                </h3>
                <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {unreadCount} {t.notifications.unread}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsAsRead}
                  className={`p-1 rounded transition-colors ${
                    isDark ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-500 hover:text-emerald-600'
                  }`}
                  title={t.notifications.markAllRead}
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  className={`p-1 rounded transition-colors ${
                    isDark ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-600'
                  }`}
                  title={t.notifications.clearAll}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className={`px-3 py-2 border-b flex items-center justify-between text-[11px] ${
            isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50/80 border-slate-200'
          }`}>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilterRole('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterRole === 'all' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.notifications.allFilter} ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterRole('my_role')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterRole === 'my_role' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.notifications.myRoleFilter}
              </button>
            </div>

            <span className={`text-[10px] font-mono flex items-center gap-1 ${
              isDark ? 'text-emerald-400/90' : 'text-emerald-700'
            }`}>
              <Mail className="w-3 h-3 text-emerald-500" />
              <span className="hidden sm:inline">SMTP Active</span>
            </span>
          </div>

          {/* Notifications List */}
          <div className={`divide-y overflow-y-auto max-h-[380px] p-1 ${
            isDark ? 'divide-slate-800/80' : 'divide-slate-200'
          }`}>
            {displayedNotifs.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-2">
                <Bell className={`w-8 h-8 mx-auto opacity-40 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t.notifications.empty}
                </p>
              </div>
            ) : (
              displayedNotifs.map((n) => {
                return (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl transition-all ${
                      !n.isRead 
                        ? isDark 
                          ? 'bg-slate-800/80 border border-blue-500/20' 
                          : 'bg-blue-50/70 border border-blue-200 shadow-xs'
                        : isDark 
                          ? 'bg-slate-900 hover:bg-slate-800/60' 
                          : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                            n.priority === 'critical'
                              ? isDark ? 'bg-red-500/30 text-red-300 border border-red-500/50' : 'bg-red-100 text-red-800 border border-red-300'
                              : n.priority === 'urgent'
                                ? isDark ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' : 'bg-amber-100 text-amber-800 border border-amber-300'
                                : isDark ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}>
                            {n.priority}
                          </span>

                          <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {n.timestamp}
                          </span>

                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          )}
                        </div>

                        <h4 className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {language === 'ar' ? n.titleAr : n.title}
                        </h4>

                        <p className={`text-[11px] leading-snug ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {language === 'ar' ? n.messageAr : n.message}
                        </p>

                        {/* Simulated Email Dispatch Badge */}
                        {n.emailRecipient && (
                          <div className={`pt-1 flex items-center gap-1 text-[10px] font-mono ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>Email sent to: <span className={isDark ? 'text-blue-300' : 'text-blue-700 font-semibold'}>{n.emailRecipient}</span></span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {n.sourceReportId && (
                          <button
                            type="button"
                            onClick={() => handleOpenCase(n.sourceReportId, n.id)}
                            className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                              isDark 
                                ? 'bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white' 
                                : 'bg-blue-50 hover:bg-blue-600 border border-blue-200 text-blue-700 hover:text-white'
                            }`}
                          >
                            <span>Open</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}
                        {!n.isRead && (
                          <button
                            type="button"
                            onClick={() => markNotificationAsRead(n.id)}
                            className={`p-1 transition-colors cursor-pointer ${
                              isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-700'
                            }`}
                            title="Mark read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className={`p-2.5 border-t text-[10px] flex items-center justify-between ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <span>RMF Station SMS Oversight</span>
            <span className={`font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ICAO Annex 19</span>
          </div>
        </div>
      )}
    </div>
  );
};
