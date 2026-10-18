import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { SafetyBulletin, BulletinAcknowledgment, StationRole } from '../types/index.ts';
import { 
  Bell, 
  Plus, 
  CheckCircle, 
  X, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Search,
  Filter,
  Printer,
  FileText,
  User,
  Users,
  ShieldAlert,
  Award,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Lock,
  Calendar,
  Building2,
  Check,
  RotateCcw,
  Eye,
  FileCheck,
  CheckCircle2
} from 'lucide-react';

export const SafetyBulletinsView: React.FC = () => {
  const { 
    language, 
    bulletins, 
    issueBulletin, 
    acknowledgeBulletin, 
    activeRole, 
    users,
    theme 
  } = useApp();
  
  const t = translations[language];
  const isDark = theme === 'dark';

  // RBAC check: Admin or Safety & Quality Manager
  // Admin: Accountable Executive (ae), Ground Handling Manager (ghm)
  // Safety & Quality Manager: hod_safety, safety_officer
  const isSafetyOrAdmin = 
    activeRole === 'hod_safety' || 
    activeRole === 'safety_officer' || 
    activeRole === 'ae' || 
    activeRole === 'ghm';

  // Can issue new safety notices
  const canIssueBulletin = 
    activeRole === 'hod_safety' || 
    activeRole === 'safety_officer' || 
    activeRole === 'hod_ops' || 
    activeRole === 'ae' || 
    activeRole === 'ghm';

  // Resolve current active user from system users table
  const currentUser = useMemo(() => {
    const found = users.find(u => u.role === activeRole);
    if (found) return found;

    // Fallbacks if not in initial list
    return {
      id: `USR-${activeRole}`,
      name: activeRole === 'field_staff' ? 'Ahmed Mansour' : 
            activeRole === 'ramp_supervisor' ? 'Mahmoud Ezz (Shift Lead)' :
            activeRole === 'hod_ops' ? 'Capt. Sherif Nour' :
            activeRole === 'hod_safety' ? 'Dr. Khaled Fawzy' :
            activeRole === 'safety_officer' ? 'Mahmoud Ezz' :
            activeRole === 'hod_maint' ? 'Eng. Tarek Fathy' :
            activeRole === 'hod_training' ? 'Mohamed El-Sayed' :
            activeRole === 'sdm' ? 'Yasser Hamdy' :
            activeRole === 'ae' ? 'Gen. Adel Radwan' :
            activeRole === 'ghm' ? 'Eng. Hisham El-Gohary' : 'Operations Officer',
      email: `${activeRole}@marsa-alam-ground.com`,
      badgeNumber: activeRole === 'field_staff' ? 'RMF-7842' : 
                   activeRole === 'hod_safety' ? 'RMF-004' :
                   activeRole === 'safety_officer' ? 'RMF-007' :
                   activeRole === 'hod_ops' ? 'RMF-003' :
                   activeRole === 'hod_maint' ? 'RMF-005' :
                   activeRole === 'hod_training' ? 'RMF-006' :
                   activeRole === 'sdm' ? 'RMF-010' :
                   activeRole === 'ghm' ? 'RMF-002' :
                   activeRole === 'ae' ? 'RMF-001' : 'RMF-008',
      department: activeRole === 'hod_safety' || activeRole === 'safety_officer' ? 'Safety & Quality' :
                  activeRole === 'hod_maint' ? 'Maintenance - GSE Fleet' :
                  activeRole === 'hod_training' ? 'Training' : 'Operations - Ramp Services',
      role: activeRole,
      isActive: true,
      phone: '+20 100 000 0000'
    };
  }, [users, activeRole]);

  // Modals & Navigation
  const [selectedBulletin, setSelectedBulletin] = useState<SafetyBulletin | null>(null);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [showFullRegisterPrint, setShowFullRegisterPrint] = useState(false);
  const [showUserReceiptPrint, setShowUserReceiptPrint] = useState(false);
  const [showDirectiveDetailsInReceipt, setShowDirectiveDetailsInReceipt] = useState(false);

  // Filters
  type FilterTab = 'all' | 'pending' | 'acknowledged';
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Admin audit log filter (inside modal)
  const [auditLogSearch, setAuditLogSearch] = useState('');
  const [auditLogDeptFilter, setAuditLogDeptFilter] = useState('all');
  const [adminAuditTab, setAdminAuditTab] = useState<'acknowledged' | 'pending'>('acknowledged');

  // Digital Signature inputs for current user
  const [signerName, setSignerName] = useState(currentUser.name);
  const [signerBadge, setSignerBadge] = useState(currentUser.badgeNumber);
  const [signerDept, setSignerDept] = useState(currentUser.department);

  // Sync signer input state when active persona/role changes
  useEffect(() => {
    setSignerName(currentUser.name);
    setSignerBadge(currentUser.badgeNumber);
    setSignerDept(currentUser.department);
  }, [currentUser]);

  // Reset modal sub-states when modal changes
  useEffect(() => {
    setShowDirectiveDetailsInReceipt(false);
  }, [selectedBulletin]);

  // Form State for creating new bulletins
  const [newTitle, setNewTitle] = useState('');
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newType, setNewType] = useState<'bulletin' | 'operational_notice'>('bulletin');
  const [newPriority, setNewPriority] = useState<'routine' | 'urgent' | 'critical'>('urgent');
  const [newSummary, setNewSummary] = useState('');
  const [newSummaryAr, setNewSummaryAr] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newActions, setNewActions] = useState('1. Conduct mandatory pre-arrival check.\n2. Verify equipment brakes.\n3. Sign shift handover.');
  const [newDepts, setNewDepts] = useState('Operations - Ramp Services, Maintenance - GSE Fleet');

  // Helper: check if a specific bulletin has been acknowledged by the active user
  const getUserAcknowledgment = (b: SafetyBulletin): BulletinAcknowledgment | undefined => {
    const curBadge = (signerBadge || currentUser.badgeNumber || '').toLowerCase().trim();
    const curName = (signerName || currentUser.name || '').toLowerCase().trim();

    return b.acknowledgments.find(a => {
      const aBadge = (a.badgeNumber || '').toLowerCase().trim();
      const aStaffId = (a.staffId || '').toLowerCase().trim();
      const aName = (a.staffName || '').toLowerCase().trim();

      return (
        (curBadge && (aBadge === curBadge || aStaffId === curBadge)) ||
        (curName && aName === curName)
      );
    });
  };

  // Filtered Bulletins
  const filteredBulletins = useMemo(() => {
    return bulletins.filter(b => {
      const userAck = getUserAcknowledgment(b);
      const isAcked = !!userAck;

      // Tab filter
      if (filterTab === 'pending' && isAcked) return false;
      if (filterTab === 'acknowledged' && !isAcked) return false;

      // Priority filter
      if (priorityFilter !== 'all' && b.priority !== priorityFilter) return false;

      // Type filter
      if (typeFilter !== 'all' && b.type !== typeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = b.title.toLowerCase().includes(q) || (b.titleAr && b.titleAr.toLowerCase().includes(q));
        const matchRef = b.refNumber.toLowerCase().includes(q);
        const matchSummary = b.summary.toLowerCase().includes(q) || (b.summaryAr && b.summaryAr.toLowerCase().includes(q));
        const matchDept = b.targetDepartments.some(d => d.toLowerCase().includes(q));
        if (!matchTitle && !matchRef && !matchSummary && !matchDept) return false;
      }

      return true;
    });
  }, [bulletins, filterTab, priorityFilter, typeFilter, searchQuery, signerBadge, currentUser]);

  // Priority Badge Styling
  const getPriorityBadge = (p: 'routine' | 'urgent' | 'critical') => {
    switch (p) {
      case 'routine':
        return (
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded font-mono ${
            isDark 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {language === 'ar' ? 'معلومات روتينية' : 'Routine Notice'}
          </span>
        );
      case 'urgent':
        return (
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded font-mono animate-pulse ${
            isDark 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
              : 'bg-amber-50 text-amber-800 border border-amber-300'
          }`}>
            {language === 'ar' ? 'تعميم عملياتي عاجل' : 'Urgent Operational Alert'}
          </span>
        );
      case 'critical':
        return (
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded font-mono ${
            isDark 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {language === 'ar' ? 'توجيه سلامة حرج' : 'Critical Safety Directive'}
          </span>
        );
    }
  };

  // Submit new bulletin
  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    issueBulletin({
      type: newType,
      title: newTitle.trim(),
      titleAr: newTitleAr.trim() || newTitle.trim(),
      priority: newPriority,
      summary: newSummary.trim(),
      summaryAr: newSummaryAr.trim() || newSummary.trim(),
      content: newContent.trim() || newSummary.trim(),
      contentAr: newSummaryAr.trim() || newContent.trim() || newSummary.trim(),
      targetDepartments: newDepts.split(',').map(d => d.trim()).filter(Boolean),
      mandatoryActions: newActions.split('\n').map(a => a.trim()).filter(Boolean),
      issuedBy: activeRole === 'hod_safety' ? 'Dr. Khaled Fawzy (Safety & Quality Manager)' :
                activeRole === 'hod_ops' ? 'Capt. Sherif Nour (Head of Operations)' :
                `${currentUser.name} (${currentUser.role})`,
      requiredStaffCount: 45
    });

    setIssueModalOpen(false);
    setNewTitle('');
    setNewTitleAr('');
    setNewSummary('');
    setNewSummaryAr('');
    setNewContent('');
  };

  // Execute Acknowledgment for the active user
  const handleAcknowledge = (bulletin: SafetyBulletin) => {
    const name = signerName.trim() || currentUser.name;
    const badge = signerBadge.trim() || currentUser.badgeNumber;
    const dept = signerDept.trim() || currentUser.department;

    acknowledgeBulletin(bulletin.id, name, badge, dept);

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newAck: BulletinAcknowledgment = {
      staffId: badge,
      staffName: name,
      badgeNumber: badge,
      department: dept,
      acknowledgedAt: now,
      signature: `${name} (${badge})`
    };

    // Update modal view in real time
    if (selectedBulletin && selectedBulletin.id === bulletin.id) {
      const alreadyHas = selectedBulletin.acknowledgments.some(a => a.badgeNumber === badge);
      if (!alreadyHas) {
        setSelectedBulletin({
          ...selectedBulletin,
          acknowledgments: [...selectedBulletin.acknowledgments, newAck]
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Role Context Banner */}
      <div className={`p-5 rounded-2xl border shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
        isDark 
          ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border-slate-800' 
          : 'bg-gradient-to-r from-white via-slate-50 to-blue-50/50 border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {isSafetyOrAdmin ? (
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded flex items-center gap-1 ${
                isDark 
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' 
                  : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {language === 'ar'
                    ? 'وضع المشرف / مدير السلامة والجودة: عرض إحصائيات وسجلات جميع الموظفين'
                    : 'ADMIN / SQM OVERSIGHT MODE: All Station Staff Acknowledgments & Compliance Visible'}
                </span>
              </span>
            ) : (
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded flex items-center gap-1 ${
                isDark 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                <User className="w-3.5 h-3.5" />
                <span>
                  {language === 'ar' 
                    ? `المستخدم الحالي: ${currentUser.name} (${currentUser.badgeNumber}) · عرض الإقرار الشخصي فقط` 
                    : `ACTIVE USER: ${currentUser.name} (${currentUser.badgeNumber}) · Personal Compliance Only`}
                </span>
              </span>
            )}
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              isDark ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-200 text-slate-700 border border-slate-300'
            }`}>
              ICAO Annex 19 / ISAGO ORM 2.4
            </span>
          </div>

          <h1 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <Bell className="w-7 h-7 text-blue-500" />
            <span>{t.bulletins.title}</span>
          </h1>
          <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {isSafetyOrAdmin
              ? (language === 'ar' 
                  ? 'لوحة إدارة نشرات السلامة والتعميمات العملياتية: متابعة نسب التوقيع والإقرار لجميع موظفي المحطة وسجل الامتثال الكامل.'
                  : 'Safety Communications & Operational Directives Register: Station-wide compliance monitoring, digital verification logs, and required staff tracking.')
              : (language === 'ar'
                  ? 'سجل التوجيهات العملياتية الملزمة: يمكنك قراءة التعليمات وتسجيل إقرارك الرقمي، وعرض إيصالات التوقيع الخاصة بك دون الاطلاع على بيانات الآخرين.'
                  : 'Mandatory operational notices and safety directives. Read and record your personal compliance acknowledgment and view your digital verification receipt.')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
          {canIssueBulletin && (
            <button
              onClick={() => setIssueModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.bulletins.issueBtn}</span>
            </button>
          )}

          {isSafetyOrAdmin && (
            <button
              onClick={() => setShowFullRegisterPrint(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm'
              }`}
              title="Print Station Acknowledgment Compliance Register"
            >
              <Printer className="w-4 h-4 text-purple-500" />
              <span>{language === 'ar' ? 'سجل الامتثال الشامل' : 'Full Audit Register'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Tabs & Search Bar */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-3 text-xs ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'all'
                ? 'bg-blue-600 text-white shadow'
                : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'كل الوثائق' : 'All Documents'}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              isDark ? 'bg-slate-900/80 text-slate-300' : 'bg-slate-200 text-slate-800'
            }`}>
              {bulletins.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'pending'
                ? 'bg-amber-600 text-white shadow'
                : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ar' ? 'بانتظار إقراري' : 'Pending My Acknowledgment'}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
              isDark ? 'bg-slate-900/80 text-amber-300' : 'bg-amber-100 text-amber-800'
            }`}>
              {bulletins.filter(b => !getUserAcknowledgment(b)).length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('acknowledged')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'acknowledged'
                ? 'bg-emerald-600 text-white shadow'
                : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'ar' ? 'تم إقراري مسبقاً' : 'Acknowledged by Me'}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
              isDark ? 'bg-slate-900/80 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {bulletins.filter(b => !!getUserAcknowledgment(b)).length}
            </span>
          </button>
        </div>

        {/* Search & Select Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث بالرقم أو العنوان...' : 'Search ref, title, or keywords...'}
              className={`w-full pl-8 pr-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={`border rounded-lg px-2.5 py-1.5 focus:outline-none ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-800'
            }`}
          >
            <option value="all">{language === 'ar' ? 'جميع الأولويات' : 'All Priorities'}</option>
            <option value="critical">{language === 'ar' ? 'حرج فقط' : 'Critical Only'}</option>
            <option value="urgent">{language === 'ar' ? 'عاجل فقط' : 'Urgent Only'}</option>
            <option value="routine">{language === 'ar' ? 'روتين فقط' : 'Routine'}</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`border rounded-lg px-2.5 py-1.5 focus:outline-none ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-800'
            }`}
          >
            <option value="all">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
            <option value="bulletin">{language === 'ar' ? 'نشرات السلامة' : 'Safety Bulletins'}</option>
            <option value="operational_notice">{language === 'ar' ? 'تعميمات عملياتية' : 'Operational Notices'}</option>
          </select>
        </div>
      </div>

      {/* Bulletins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBulletins.length === 0 ? (
          <div className={`md:col-span-2 p-10 text-center rounded-2xl border border-dashed space-y-3 ${
            isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-300'
          }`}>
            <Bell className={`w-10 h-10 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
            <h3 className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              {language === 'ar' ? 'لا توجد وثائق مطابقة' : 'No Operational Notices Found'}
            </h3>
            <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              {language === 'ar' 
                ? 'لا توجد نشرات تطابق خيارات البحث الحالية. قم بتغيير التبويب أو تصفية البحث.' 
                : 'No bulletins match your current filter settings. Adjust your search or change the active tab.'}
            </p>
          </div>
        ) : (
          filteredBulletins.map((b) => {
            const userAck = getUserAcknowledgment(b);
            const hasAcked = !!userAck;
            const ackCount = b.acknowledgments.length;
            const requiredCount = b.requiredStaffCount || 45;
            const pct = Math.round((ackCount / requiredCount) * 100);

            return (
              <div
                key={b.id}
                className={`border rounded-2xl p-5 shadow-xl space-y-4 transition-all flex flex-col justify-between ${
                  hasAcked 
                    ? isDark 
                      ? 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/60' 
                      : 'bg-white border-emerald-300 hover:border-emerald-500'
                    : isDark 
                      ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded ${
                        isDark 
                          ? 'bg-blue-900/60 text-blue-300 border border-blue-500/30' 
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {b.refNumber}
                      </span>
                      <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                        isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {b.type === 'bulletin' ? 'Safety Bulletin' : 'Operational Notice'}
                      </span>
                    </div>
                    {getPriorityBadge(b.priority)}
                  </div>

                  <h3 className={`text-sm font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {language === 'ar' && b.titleAr ? b.titleAr : b.title}
                  </h3>
                  
                  {/* ========================================================================= */}
                  {/* CARD BODY ADJUSTMENT:                                                     */}
                  {/* For regular users who ALREADY ACKNOWLEDGED:                               */}
                  {/* Instead of showing the full document body, show their confirmed receipt   */}
                  {/* For unacknowledged users or admin/SQM: Show document summary              */}
                  {/* ========================================================================= */}
                  {!isSafetyOrAdmin && hasAcked ? (
                    // Regular user has acknowledged: Shows their official acknowledgment certificate
                    <div className={`p-4 rounded-xl border space-y-2.5 ${
                      isDark 
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100' 
                        : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>
                            {language === 'ar' ? 'تم تسجيل إقرارك الرسمي بنجاح' : 'You Have Acknowledged This Directive'}
                          </span>
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                          isDark 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          COMPLIED
                        </span>
                      </div>

                      <div className={`grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-lg border font-mono ${
                        isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-white border-emerald-200 text-slate-700'
                      }`}>
                        <div>
                          <span className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {language === 'ar' ? 'الموظف المقر:' : 'Officer:'}
                          </span>
                          <span className={`font-sans font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {userAck?.staffName}
                          </span>
                        </div>
                        <div>
                          <span className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {language === 'ar' ? 'رقم الشارة:' : 'Badge #:'}
                          </span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {userAck?.badgeNumber}
                          </span>
                        </div>
                        <div>
                          <span className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {language === 'ar' ? 'تاريخ التوقيع:' : 'Timestamp:'}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {userAck?.acknowledgedAt}
                          </span>
                        </div>
                        <div>
                          <span className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {language === 'ar' ? 'الختم الرقمي:' : 'Digital Seal:'}
                          </span>
                          <span className="truncate block text-[10px]">
                            ACK-{userAck?.badgeNumber}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <Lock className="w-3 h-3 shrink-0" />
                        <span>
                          {language === 'ar' 
                            ? 'معاملة خاصة وموثقة: لا يتم عرض بيانات أو أعداد الموظفين الآخرين التزاماً بالسرية.' 
                            : 'Personal compliance record filed with SQMS. Other staff responses remain confidential.'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Unacknowledged user OR Admin/SQM view: Show standard document summary
                    <div className="space-y-2">
                      <p className={`text-xs leading-relaxed font-sans line-clamp-3 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {language === 'ar' && b.summaryAr ? b.summaryAr : b.summary}
                      </p>

                      {/* Target Departments */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {b.targetDepartments.map((dept, i) => (
                          <span key={i} className={`text-[10px] px-2 py-0.5 rounded border ${
                            isDark 
                              ? 'text-slate-400 bg-slate-950 border-slate-800/80' 
                              : 'text-slate-600 bg-slate-100 border-slate-200'
                          }`}>
                            {dept}
                          </span>
                        ))}
                      </div>

                      <div className={`text-[10px] font-mono flex items-center justify-between pt-1 ${
                        isDark ? 'text-slate-500' : 'text-slate-500'
                      }`}>
                        <span>Issued: {b.issueDate}</span>
                        <span className="truncate max-w-[200px] text-right">By: {b.issuedBy}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ========================================================================= */}
                {/* BOTTOM ACKNOWLEDGMENT DISPLAY                                             */}
                {/* - For regular users: Shows personal status ONLY (no collective numbers)   */}
                {/* - For admin or SQM: Shows full station stats & progress                   */}
                {/* ========================================================================= */}
                <div className={`pt-3 border-t space-y-3 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
                  
                  {/* CASE 1: REGULAR USER VIEW (NO collective user numbers, shows own status) */}
                  {!isSafetyOrAdmin && (
                    <div>
                      {!hasAcked && (
                        <div className={`p-3 rounded-xl space-y-1 border ${
                          isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-300'
                        }`}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                              <Clock className="w-4 h-4 shrink-0 animate-pulse" />
                              <span>
                                {language === 'ar' ? 'إجراء مطلوب: بانتظار إقرارك' : 'Action Required: Pending Your Acknowledgment'}
                              </span>
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.2 rounded font-bold border ${
                              isDark 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}>
                              MANDATORY
                            </span>
                          </div>
                          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {language === 'ar' 
                              ? 'قراءة إلزامية وإقرار رقمي مطلوب لجميع موظفي المهبط قبل بدء النوبة.' 
                              : 'Mandatory reading and digital sign-off required for airside ground personnel.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CASE 2: ADMIN & SAFETY & QUALITY MANAGER VIEW (Sees all users stats) */}
                  {isSafetyOrAdmin && (
                    <div className="space-y-2">
                      <div className={`p-3 rounded-xl space-y-2 border ${
                        isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {language === 'ar' ? 'نسبة الإقرار على مستوى المحطة:' : 'Station Acknowledgment Rate:'}
                          </span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {ackCount} / {requiredCount} ({pct}%)
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                          isDark ? 'bg-slate-900' : 'bg-slate-200'
                        }`}>
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct >= 90 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>

                        {/* Manager personal acknowledgment chip */}
                        <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
                          {hasAcked ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>{language === 'ar' ? 'تم توقيع إقرارك كمدير' : `Your manager sign-off recorded (${userAck?.acknowledgedAt})`}</span>
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{language === 'ar' ? 'توقيعك كمدير بانتظار التسجيل' : 'Your manager sign-off is pending'}</span>
                            </span>
                          )}
                          <span className={isDark ? 'text-slate-500' : 'text-slate-500'}>
                            {requiredCount - ackCount} staff pending
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                    <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {isSafetyOrAdmin 
                        ? `${ackCount} confirmations on file`
                        : hasAcked 
                          ? (language === 'ar' ? 'الإقرار موثق ومؤرشف' : 'Receipt verified & archived') 
                          : (language === 'ar' ? 'مطلوب التوقيع الفوري' : 'Immediate sign-off required')}
                    </span>

                    <button
                      onClick={() => setSelectedBulletin(b)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow ${
                        !isSafetyOrAdmin && hasAcked
                          ? isDark 
                            ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : !isSafetyOrAdmin && !hasAcked
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                            : isDark
                              ? 'bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        {isSafetyOrAdmin 
                          ? (language === 'ar' ? `إدارة وسجل الامتثال (${ackCount})` : `Manage & View Audit Log (${ackCount})`)
                          : hasAcked 
                            ? (language === 'ar' ? 'عرض إيصال إقراري الرسمي' : 'View My Acknowledgment Receipt') 
                            : (language === 'ar' ? 'قراءة وتوقيع الإقرار الآن ←' : 'Read & Acknowledge Now →')}
                      </span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: DOCUMENT DETAILS & ACKNOWLEDGMENT VIEW                             */}
      {/* - For regular users: Shows personal receipt only, hides all other users   */}
      {/* - For admin & SQM: Shows administrative audit log of all staff            */}
      {/* ========================================================================= */}
      {selectedBulletin && (() => {
        const modalUserAck = getUserAcknowledgment(selectedBulletin);
        const modalHasAcked = !!modalUserAck;
        const totalAcks = selectedBulletin.acknowledgments.length;
        const reqCount = selectedBulletin.requiredStaffCount || 45;
        const ackPct = Math.round((totalAcks / reqCount) * 100);

        // Filtered audit log for Admin / SQM
        const filteredAuditLog = selectedBulletin.acknowledgments.filter(a => {
          if (auditLogDeptFilter !== 'all' && a.department !== auditLogDeptFilter) return false;
          if (auditLogSearch.trim()) {
            const q = auditLogSearch.toLowerCase();
            const matchName = a.staffName.toLowerCase().includes(q);
            const matchBadge = a.badgeNumber.toLowerCase().includes(q);
            const matchDept = a.department.toLowerCase().includes(q);
            if (!matchName && !matchBadge && !matchDept) return false;
          }
          return true;
        });

        // Pending users for Admin / SQM
        const pendingUsers = users.filter(u => {
          return !selectedBulletin.acknowledgments.some(a => 
            (a.badgeNumber && a.badgeNumber.toLowerCase() === u.badgeNumber.toLowerCase()) ||
            (a.staffName && a.staffName.toLowerCase() === u.name.toLowerCase())
          );
        });

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className={`border rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              
              {/* Header */}
              <div className={`flex items-start justify-between border-b pb-3 ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-base font-bold text-blue-500">{selectedBulletin.refNumber}</span>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {selectedBulletin.type === 'bulletin' ? 'Safety Bulletin' : 'Operational Notice'}
                    </span>
                    {getPriorityBadge(selectedBulletin.priority)}
                  </div>
                  <h2 className={`text-lg font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {language === 'ar' && selectedBulletin.titleAr ? selectedBulletin.titleAr : selectedBulletin.title}
                  </h2>
                  <div className={`text-xs mt-0.5 flex items-center gap-2 flex-wrap ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <span>Issued: <strong className={`font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{selectedBulletin.issueDate}</strong></span>
                    <span>•</span>
                    <span>By: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{selectedBulletin.issuedBy}</strong></span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedBulletin(null)} 
                  className={`p-1 rounded-lg cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ========================================================================= */}
              {/* SECTION: ADAPTIVE DISPLAY BASED ON ACKNOWLEDGMENT STATUS                  */}
              {/* ========================================================================= */}

              {/* CASE 1: REGULAR USER WHO HAS ALREADY ACKNOWLEDGED                         */}
              {/* Instead of showing the full document and other user numbers:              */}
              {/* Showcase the official personal acknowledgment receipt and compliance seal  */}
              {!isSafetyOrAdmin && modalHasAcked && (
                <div className="space-y-4">
                  {/* Verified Personal Receipt Card */}
                  <div className={`border-2 rounded-2xl p-5 sm:p-6 space-y-4 text-xs ${
                    isDark 
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100' 
                      : 'bg-emerald-50/80 border-emerald-400 text-emerald-900'
                  }`}>
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
                      isDark ? 'border-emerald-800/40' : 'border-emerald-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className={`text-base font-black ${isDark ? 'text-white' : 'text-emerald-950'}`}>
                            {language === 'ar' 
                              ? 'إيصال الإقرار الرقمي الرسمي' 
                              : 'Official Digital Receipt of Acknowledgment'}
                          </h4>
                          <p className={`text-xs ${isDark ? 'text-emerald-300/80' : 'text-emerald-700'}`}>
                            {language === 'ar'
                              ? 'تم توثيق إقرارك وتأكيد امتثالك بنجاح في سجلات السلامة والجودة بمحطة مرسى علم.'
                              : 'Your personal compliance has been officially validated and filed in the station SQMS.'}
                          </p>
                        </div>
                      </div>
                      <span className={`font-mono text-xs px-3 py-1 rounded-full border font-bold uppercase self-start sm:self-auto ${
                        isDark 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}>
                        ✓ ALREADY ACKNOWLEDGED
                      </span>
                    </div>

                    {/* Official Receipt Grid */}
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-xl border text-xs ${
                      isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-emerald-200 shadow-sm'
                    }`}>
                      <div>
                        <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {language === 'ar' ? 'الموظف المصادق:' : 'Acknowledging Officer:'}
                        </span>
                        <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {modalUserAck.staffName}
                        </span>
                      </div>
                      <div>
                        <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {language === 'ar' ? 'رقم شارة المطار:' : 'Airport Badge Number:'}
                        </span>
                        <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                          {modalUserAck.badgeNumber}
                        </span>
                      </div>
                      <div>
                        <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {language === 'ar' ? 'الإدارة التشغيلية:' : 'Operating Department:'}
                        </span>
                        <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {modalUserAck.department || currentUser.department}
                        </span>
                      </div>
                      <div>
                        <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {language === 'ar' ? 'تاريخ ووقت التحقق:' : 'Verification Timestamp:'}
                        </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {modalUserAck.acknowledgedAt}
                        </span>
                      </div>
                      <div className={`sm:col-span-2 pt-2 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono ${
                        isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-600'
                      }`}>
                        <span>
                          {language === 'ar' ? 'الختم الأمني الرقمي:' : 'Digital Verification Seal:'}{' '}
                          <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>
                            RMF-SQMS-ACK-{selectedBulletin.refNumber}-{modalUserAck.badgeNumber}
                          </strong>
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-sans font-bold">
                          ✓ Airside Duty Validated
                        </span>
                      </div>
                    </div>

                    {/* Fair Culture Privacy Notice */}
                    <div className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
                      isDark 
                        ? 'bg-slate-950/40 border-slate-800/60 text-slate-400' 
                        : 'bg-white/70 border-emerald-200 text-slate-600'
                    }`}>
                      <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {language === 'ar' 
                          ? 'سياسة ثقافة العدالة والخصوصية: يتم تسجيل إقرارك الفردي بأمان لدى إدارة السلامة والجودة. تبقى سجلات وأعداد الموظفين الآخرين سرية وغير معروضة.'
                          : 'Station Fair Culture Policy: Your individual acknowledgment is securely recorded with SQMS. Under confidentiality rules, other staff records and counts are not shown.'}
                      </span>
                    </div>

                    {/* Actions: Print Receipt & Toggle Original Instructions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowDirectiveDetailsInReceipt(!showDirectiveDetailsInReceipt)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          isDark 
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                            : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
                        }`}
                      >
                        {showDirectiveDetailsInReceipt ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span>
                          {showDirectiveDetailsInReceipt
                            ? (language === 'ar' ? 'إخفاء نص التعليمات' : 'Hide Original Directive Text')
                            : (language === 'ar' ? 'مراجعة نص التعليمات والإجراءات' : 'Review Original Directive Instructions')}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'طباعة إيصال الإقرار' : 'Print My Receipt'}</span>
                      </button>
                    </div>

                    {/* Optional Collapsed Original Directive for Reference */}
                    {showDirectiveDetailsInReceipt && (
                      <div className={`mt-3 p-4 rounded-xl border text-xs space-y-3 animate-in fade-in-50 ${
                        isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block">
                          {language === 'ar' ? 'التعليمات العملياتية المرجعية:' : 'Reference Operational Instructions:'}
                        </span>
                        <p className={`leading-relaxed font-sans text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {language === 'ar' && selectedBulletin.contentAr ? selectedBulletin.contentAr : selectedBulletin.content}
                        </p>

                        <div className={`pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mb-1 flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'الإجراءات الإلزامية المطلوبة:' : 'Mandatory Operational Actions:'}</span>
                          </span>
                          <ul className={`space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {selectedBulletin.mandatoryActions.map((act, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className={`w-4 h-4 rounded-full font-mono text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                                  isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {i + 1}
                                </span>
                                <span>{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CASE 2: REGULAR USER PENDING ACKNOWLEDGMENT                              */}
              {/* Shows official operational directive and read-and-acknowledge sign form    */}
              {!isSafetyOrAdmin && !modalHasAcked && (
                <div className="space-y-4">
                  {/* Official Document Content */}
                  <div className={`border rounded-xl p-4 text-xs space-y-3 ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block">
                      {language === 'ar' ? 'التعليمات العملياتية الرسمية:' : 'Official Operational Instructions:'}
                    </span>
                    <p className={`leading-relaxed font-sans text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {language === 'ar' && selectedBulletin.contentAr ? selectedBulletin.contentAr : selectedBulletin.content}
                    </p>

                    <div className={`pt-2 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mb-1.5 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'الإجراءات العملياتية الإلزامية:' : 'Mandatory Operational Actions Required:'}</span>
                      </span>
                      <ul className={`space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {selectedBulletin.mandatoryActions.map((act, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className={`w-4 h-4 rounded-full font-mono text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                              isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {i + 1}
                            </span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Digital Sign-off Form */}
                  <div className={`border rounded-2xl p-5 space-y-4 ${
                    isDark ? 'bg-blue-950/20 border-blue-800/50' : 'bg-blue-50/70 border-blue-200'
                  }`}>
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-300 uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      <span>
                        {language === 'ar' ? 'نموذج الإقرار الرقمي وتأكيد الاطلاع' : 'Digital Read-and-Acknowledge Compliance Form'}
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {language === 'ar'
                        ? 'بإرسال هذا الإقرار، فإنك تؤكد اطلاعك التام وفهمك لجميع التوجيهات العملياتية وإجراءات السلامة أعلاه والالتزام بتطبيقها أثناء العمل بالمهبط.'
                        : 'By submitting this acknowledgment, you confirm that you have read, understood, and will strictly apply all operational directives and safety precautions detailed above during your shift.'}
                    </p>

                    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs p-3.5 rounded-xl border ${
                      isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-blue-200'
                    }`}>
                      <div>
                        <label className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {language === 'ar' ? 'الاسم بالكامل' : 'Your Full Name'}
                        </label>
                        <input
                          type="text"
                          value={signerName}
                          onChange={(e) => setSignerName(e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded-lg border font-medium ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {language === 'ar' ? 'رقم شارة المطار' : 'Airport Badge Number'}
                        </label>
                        <input
                          type="text"
                          value={signerBadge}
                          onChange={(e) => setSignerBadge(e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded-lg border font-mono ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {language === 'ar' ? 'الإدارة' : 'Department'}
                        </label>
                        <input
                          type="text"
                          value={signerDept}
                          onChange={(e) => setSignerDept(e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded-lg border ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAcknowledge(selectedBulletin)}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        {language === 'ar' 
                          ? 'أؤكد أنني قرأت هذه التعليمات وأقر بالالتزام بها كاملاً' 
                          : 'I Confirm That I Have Read & Acknowledge This Directive'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* CASE 3: ADMIN & SAFETY & QUALITY MANAGER VIEW                             */}
              {/* Shows official instructions, station metrics, and complete staff audit log */}
              {isSafetyOrAdmin && (
                <div className="space-y-4">
                  {/* Official Document Content */}
                  <div className={`border rounded-xl p-4 text-xs space-y-3 ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block">
                      {language === 'ar' ? 'التعليمات العملياتية الرسمية:' : 'Official Operational Instructions:'}
                    </span>
                    <p className={`leading-relaxed font-sans text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {language === 'ar' && selectedBulletin.contentAr ? selectedBulletin.contentAr : selectedBulletin.content}
                    </p>

                    <div className={`pt-2 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mb-1.5 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'الإجراءات العملياتية الإلزامية:' : 'Mandatory Operational Actions Required:'}</span>
                      </span>
                      <ul className={`space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {selectedBulletin.mandatoryActions.map((act, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className={`w-4 h-4 rounded-full font-mono text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                              isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {i + 1}
                            </span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Station Metrics Card */}
                  <div className={`border rounded-xl p-4 space-y-3 ${
                    isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          <Users className="w-4 h-4 text-blue-500" />
                          <span>{language === 'ar' ? 'متابعة الامتثال بالمحطة' : 'Station Acknowledgment Oversight'}</span>
                        </span>
                        <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {language === 'ar' 
                            ? 'صلاحيات الإشراف: عرض ومتابعة إقرارات موظفي جميع الأقسام.' 
                            : 'Admin & SQM Authority: Full compliance registry across operating departments.'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                          {totalAcks} / {reqCount}
                        </span>
                        <span className={`text-[11px] block font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          ({ackPct}% Compliance Rate)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className={`w-full h-2 rounded-full overflow-hidden ${
                      isDark ? 'bg-slate-900' : 'bg-slate-200'
                    }`}>
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(ackPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Manager Personal Acknowledgment Control */}
                  <div className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
                    isDark ? 'bg-blue-950/20 border-blue-800/40' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div>
                      <span className="font-bold text-blue-600 dark:text-blue-300 block">
                        {language === 'ar' ? 'حالة توقيعك كمدير:' : 'Your Manager Acknowledgment Status:'}
                      </span>
                      {modalHasAcked ? (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {language === 'ar' 
                              ? `تم توقيع إقرارك في ${modalUserAck.acknowledgedAt} باسم ${modalUserAck.staffName}` 
                              : `You signed off on ${modalUserAck.acknowledgedAt} as ${modalUserAck.staffName}`}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 block">
                          {language === 'ar'
                            ? `لم تقم بالتوقيع كمدير بعد باسم ${currentUser.name}.`
                            : `You have not yet signed your personal copy as ${currentUser.name}.`}
                        </span>
                      )}
                    </div>

                    {!modalHasAcked && (
                      <button
                        onClick={() => handleAcknowledge(selectedBulletin)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'توقيع كمدير الآن' : 'Sign as Manager'}</span>
                      </button>
                    )}
                  </div>

                  {/* Staff Acknowledgment Register Tabs */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setAdminAuditTab('acknowledged')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            adminAuditTab === 'acknowledged'
                              ? 'bg-blue-600 text-white shadow'
                              : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? `المقرون (${totalAcks})` : `Acknowledged Staff (${totalAcks})`}</span>
                        </button>
                        <button
                          onClick={() => setAdminAuditTab('pending')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            adminAuditTab === 'pending'
                              ? 'bg-amber-600 text-white shadow'
                              : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? `بانتظار التوقيع (${pendingUsers.length})` : `Pending Staff (${pendingUsers.length})`}</span>
                        </button>
                      </div>

                      {/* Filter Search inside log */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={auditLogSearch}
                          onChange={(e) => setAuditLogSearch(e.target.value)}
                          placeholder={language === 'ar' ? 'بحث باسم الموظف أو الشارة...' : 'Search staff or badge...'}
                          className={`px-2.5 py-1 border rounded text-[11px] ${
                            isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                          }`}
                        />
                        <select
                          value={auditLogDeptFilter}
                          onChange={(e) => setAuditLogDeptFilter(e.target.value)}
                          className={`px-2 py-1 border rounded text-[11px] ${
                            isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                          }`}
                        >
                          <option value="all">{language === 'ar' ? 'جميع الإدارات' : 'All Departments'}</option>
                          <option value="Operations - Ramp Services">Ramp Services</option>
                          <option value="Maintenance - GSE Fleet">GSE Maintenance</option>
                          <option value="Safety & Quality">Safety & Quality</option>
                        </select>
                      </div>
                    </div>

                    {/* Table View of Staff */}
                    {adminAuditTab === 'acknowledged' ? (
                      <div className={`border rounded-xl max-h-56 overflow-y-auto divide-y text-xs ${
                        isDark ? 'bg-slate-950/70 border-slate-800 divide-slate-800/80' : 'bg-white border-slate-200 divide-slate-100'
                      }`}>
                        {filteredAuditLog.length === 0 ? (
                          <div className={`p-4 text-center ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {totalAcks === 0 
                              ? (language === 'ar' ? 'لم يقم أي موظف بالإقرار على هذه النشرة بعد.' : 'No staff members have acknowledged this bulletin yet.')
                              : (language === 'ar' ? 'لا توجد سجلات تطابق البحث.' : 'No acknowledgments match your filter criteria.')}
                          </div>
                        ) : (
                          filteredAuditLog.map((ack, idx) => (
                            <div key={idx} className={`p-2.5 flex items-center justify-between transition ${
                              isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'
                            }`}>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{ack.staffName}</span>
                                  <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded border ${
                                    isDark ? 'bg-indigo-900/30 text-indigo-300 border-indigo-700/40' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  }`}>
                                    {ack.badgeNumber}
                                  </span>
                                </div>
                                <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {ack.department}
                                </span>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block font-bold">
                                  {ack.acknowledgedAt}
                                </span>
                                <span className={`text-[9px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                  Sig: {ack.signature || ack.staffName}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className={`border rounded-xl max-h-56 overflow-y-auto divide-y text-xs ${
                        isDark ? 'bg-slate-950/70 border-slate-800 divide-slate-800/80' : 'bg-white border-slate-200 divide-slate-100'
                      }`}>
                        {pendingUsers.length === 0 ? (
                          <div className="p-4 text-center text-emerald-600 font-bold">
                            {language === 'ar' ? 'جميع موظفي المحطة أتموا الإقرار!' : 'All station staff have completed acknowledgment! 100% compliance.'}
                          </div>
                        ) : (
                          pendingUsers.map((u, idx) => (
                            <div key={idx} className={`p-2.5 flex items-center justify-between transition ${
                              isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'
                            }`}>
                              <div>
                                <span className={`font-semibold block ${isDark ? 'text-white' : 'text-slate-900'}`}>{u.name}</span>
                                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{u.department}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                                  isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {u.badgeNumber}
                                </span>
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                  Pending Sign-off
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Modal Footer */}
              <div className={`flex items-center justify-between border-t pt-3 ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Ref: {selectedBulletin.refNumber} · Marsa Alam International Airport (RMF)
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedBulletin(null)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {language === 'ar' ? 'إغلاق النشرة' : 'Close Notice'}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: FULL STATION AUDIT REGISTER (ADMIN & SQM EXPORT)                   */}
      {/* ========================================================================= */}
      {showFullRegisterPrint && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto print:p-0 print:shadow-none print:max-h-none">
            
            {/* Print Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  EMAAS GROUND HANDLING SERVICES · HEMA / RMF
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  SAFETY BULLETINS & OPERATIONAL NOTICES COMPLIANCE REGISTER
                </h2>
                <div className="text-xs text-slate-600 mt-0.5">
                  IATA ISAGO ORM 2.4 / SMS Safety Communication · Generated on {new Date().toISOString().substring(0, 10)}
                </div>
              </div>

              <div className="flex items-center gap-2 no-print">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setShowFullRegisterPrint(false)}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bulletins Summary Table */}
            <div className="space-y-4">
              <table className="w-full text-left text-xs border border-slate-300 divide-y divide-slate-300">
                <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-700">
                  <tr>
                    <th className="p-2 border-r border-slate-300">Reference #</th>
                    <th className="p-2 border-r border-slate-300">Title & Issue Date</th>
                    <th className="p-2 border-r border-slate-300">Priority</th>
                    <th className="p-2 border-r border-slate-300 text-center">Compliance</th>
                    <th className="p-2">Acknowledged Staff Breakdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bulletins.map((b) => {
                    const ackCount = b.acknowledgments.length;
                    const reqCount = b.requiredStaffCount || 45;
                    const pct = Math.round((ackCount / reqCount) * 100);

                    return (
                      <tr key={b.id} className="align-top">
                        <td className="p-2 font-mono font-bold border-r border-slate-200 text-slate-900">
                          {b.refNumber}
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <div className="font-bold text-slate-900">{b.title}</div>
                          <div className="text-[11px] text-slate-500">Issued: {b.issueDate} by {b.issuedBy}</div>
                        </td>
                        <td className="p-2 border-r border-slate-200 font-mono uppercase text-[10px] font-bold">
                          {b.priority}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-center font-mono font-bold">
                          <span className={pct >= 80 ? 'text-emerald-700' : 'text-amber-700'}>
                            {ackCount} / {reqCount} ({pct}%)
                          </span>
                        </td>
                        <td className="p-2 text-[11px]">
                          {b.acknowledgments.length === 0 ? (
                            <span className="text-slate-400 italic">No acknowledgments recorded yet</span>
                          ) : (
                            <div className="space-y-0.5">
                              {b.acknowledgments.map((a, i) => (
                                <span key={i} className="inline-block mr-2 text-slate-700">
                                  <strong>{a.staffName}</strong> ({a.badgeNumber}) · {a.acknowledgedAt};
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Official Signatures */}
            <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs text-slate-800">
              <div className="border-t border-slate-400 pt-2 text-center space-y-1">
                <div className="font-bold">Dr. Khaled Fawzy</div>
                <div className="text-slate-500 text-[10px]">Safety & Quality Manager (SQM)</div>
                <div className="font-mono text-[9px] text-slate-400">Date: {new Date().toISOString().substring(0, 10)}</div>
              </div>

              <div className="border-t border-slate-400 pt-2 text-center space-y-1">
                <div className="font-bold">Gen. Adel Radwan</div>
                <div className="text-slate-500 text-[10px]">Accountable Executive (AE)</div>
                <div className="font-mono text-[9px] text-slate-400">Station Conformance Seal: RMF-SQMS-REGISTER</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ISSUE NEW BULLETIN                                                 */}
      {/* ========================================================================= */}
      {issueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleIssueSubmit} className={`border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Bell className="w-4 h-4 text-blue-500" />
                <span>{t.bulletins.modal.title}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setIssueModalOpen(false)} 
                className={`cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Document Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="bulletin">Safety Bulletin (SB)</option>
                    <option value="operational_notice">Internal Operational Notice (ION)</option>
                  </select>
                </div>
                <div>
                  <label className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="routine">Routine Information</option>
                    <option value="urgent">Urgent Operational Notice</option>
                    <option value="critical">Critical Safety Directive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Document Title (English) *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Aircraft Chocking Protocol During 30-Knot Wind Alert"
                  className={`w-full px-3 py-1.5 rounded-lg border font-medium ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Document Title (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={newTitleAr}
                  onChange={(e) => setNewTitleAr(e.target.value)}
                  placeholder="بروتوكول تثبيت حواجز عجلات الطائرات أثناء تحذيرات الرياح..."
                  className={`w-full px-3 py-1.5 rounded-lg border font-medium ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Target Departments</label>
                <input
                  type="text"
                  value={newDepts}
                  onChange={(e) => setNewDepts(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Alert Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Mandatory Staff Actions (One per line)</label>
                <textarea
                  rows={2}
                  value={newActions}
                  onChange={(e) => setNewActions(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border font-mono ${
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
                onClick={() => setIssueModalOpen(false)} 
                className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow cursor-pointer">
                {t.bulletins.modal.publishBtn}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
