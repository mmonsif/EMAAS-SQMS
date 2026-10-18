import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { 
  AuditScheduleItem, 
  AuditFinding, 
  AuditType, 
  AuditDiscipline, 
  InvestigationLevel,
  RiskAssessment,
  StationRole,
  SimpleRCA,
  FileAttachment,
  AuditTemplate,
  AuditChecklistItem
} from '../types/index.ts';
import { 
  getLevelMetadata, 
  getOverdueCalculation, 
  getStatusMetadata, 
  calculateRiskIndex, 
  canUserPerformStep,
  calculateTargetClosureDate
} from '../utils/workflowHelpers.ts';
import { 
  Calendar, 
  CalendarCheck, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  AlertOctagon, 
  ShieldAlert, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  X, 
  Check, 
  Download, 
  Filter,
  Search,
  RotateCcw,
  Paperclip,
  Printer,
  Edit,
  Trash2,
  FileText,
  Building2,
  User,
  Users,
  Tag,
  Layers,
  ArrowRight,
  ExternalLink,
  Plane,
  History,
  FileCheck,
  Lock,
  BookOpen,
  ListChecks,
  Copy,
  BookmarkCheck
} from 'lucide-react';

export const AuditsModule: React.FC = () => {
  const { 
    language, 
    activeRole,
    setActiveRole,
    auditSchedule, 
    findings, 
    addAuditScheduleItem,
    updateAuditScheduleItem,
    deleteAuditScheduleItem,
    addFinding,
    updateFinding,
    deleteFinding,
    acknowledgeFinding,
    assignFindingLevel,
    startOrUpdateFindingInvestigation,
    submitFindingCAPAPlan,
    reviewFindingCAPAPlan,
    recordFindingEffectiveness,
    finalSignoffAndCloseFinding,
    addFindingAttachment,
    auditTemplates,
    addAuditTemplate,
    updateAuditTemplate,
    deleteAuditTemplate
  } = useApp();

  const t = translations[language];

  // Primary Navigation Tabs
  const [activeTab, setActiveTab] = useState<'calendar' | 'annualPlan' | 'findings' | 'templates'>('calendar');

  // Calendar View Mode: Month Grid vs 12-Month Year Overview
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'year'>('month');
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = useState<number>(9); // 0-indexed: 9 = October 2026

  // Calendar Filters
  const [calDisciplineFilter, setCalDisciplineFilter] = useState<string>('all');
  const [calTypeFilter, setCalTypeFilter] = useState<string>('all');
  const [calStatusFilter, setCalStatusFilter] = useState<string>('all');
  const [calSearch, setCalSearch] = useState('');

  // Findings Filters
  type FindingDashboardTab = 'all' | 'my_actions' | 'overdue' | 'approaching' | 'awaiting_level' | 'awaiting_review';
  const [findingTab, setFindingTab] = useState<FindingDashboardTab>('all');
  const [findingSearch, setFindingSearch] = useState('');
  const [findingDisciplineFilter, setFindingDisciplineFilter] = useState('all');
  const [findingLevelFilter, setFindingLevelFilter] = useState('all');

  // Modal State: View / Manage Audit Dossier
  const [selectedAudit, setSelectedAudit] = useState<AuditScheduleItem | null>(null);

  // Modal State: Export Official Audit Report
  const [exportReportAudit, setExportReportAudit] = useState<AuditScheduleItem | null>(null);

  // Modal State: Create / Edit Audit
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [editingAudit, setEditingAudit] = useState<AuditScheduleItem | null>(null);
  const [auditFormTitle, setAuditFormTitle] = useState('');
  const [auditFormTitleAr, setAuditFormTitleAr] = useState('');
  const [auditFormType, setAuditFormType] = useState<AuditType>('internal');
  const [auditFormAuditorOrg, setAuditFormAuditorOrg] = useState('EMAAS Safety & Quality Department');
  const [auditFormLeadAuditor, setAuditFormLeadAuditor] = useState('Dr. Khaled Fawzy (SQM)');
  const [auditFormTeam, setAuditFormTeam] = useState('Mahmoud Ezz, Ahmed Hassan');
  const [auditFormDiscipline, setAuditFormDiscipline] = useState<AuditDiscipline>('RMP');
  const [auditFormDepartment, setAuditFormDepartment] = useState('Operations - Ramp Services');
  const [auditFormLocation, setAuditFormLocation] = useState('Marsa Alam International Airport (RMF)');
  const [auditFormScheduledDate, setAuditFormScheduledDate] = useState('2026-10-25');
  const [auditFormEndDate, setAuditFormEndDate] = useState('2026-10-27');
  const [auditFormQuarter, setAuditFormQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q4');
  const [auditFormStatus, setAuditFormStatus] = useState<AuditScheduleItem['status']>('planned');
  const [auditFormScope, setAuditFormScope] = useState('');
  const [auditFormExecSummary, setAuditFormExecSummary] = useState('');
  const [auditFormCriteria, setAuditFormCriteria] = useState('ISAGO GOSM 14th Ed, ICAO Doc 9859, ECAR 139');

  // Modal State: Delete Confirmation
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ type: 'audit' | 'finding' | 'template'; id: string; title: string } | null>(null);

  // Template Manager State
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateDisciplineFilter, setTemplateDisciplineFilter] = useState('all');
  const [templateTypeFilter, setTemplateTypeFilter] = useState('all');
  const [selectedTemplateForView, setSelectedTemplateForView] = useState<AuditTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AuditTemplate | null>(null);

  // Template Form Fields
  const [tplFormTitle, setTplFormTitle] = useState('');
  const [tplFormTitleAr, setTplFormTitleAr] = useState('');
  const [tplFormAuditType, setTplFormAuditType] = useState<AuditType>('internal');
  const [tplFormDiscipline, setTplFormDiscipline] = useState<AuditDiscipline>('RMP');
  const [tplFormFramework, setTplFormFramework] = useState('IATA ISAGO GOSM 14th Edition');
  const [tplFormDepartment, setTplFormDepartment] = useState('Operations - Ramp Services');
  const [tplFormLeadRole, setTplFormLeadRole] = useState('Lead ISAGO Ramp Auditor');
  const [tplFormHours, setTplFormHours] = useState(8);
  const [tplFormScope, setTplFormScope] = useState('');
  const [tplFormItems, setTplFormItems] = useState<AuditChecklistItem[]>([]);

  // Template New Item Sub-form State
  const [newCheckCode, setNewCheckCode] = useState('');
  const [newCheckTitle, setNewCheckTitle] = useState('');
  const [newCheckQuestion, setNewCheckQuestion] = useState('');
  const [newCheckCategory, setNewCheckCategory] = useState('Safety Conformance');
  const [newCheckGuidance, setNewCheckGuidance] = useState('');
  const [newCheckMandatory, setNewCheckMandatory] = useState(true);

  // Modal State: Create Finding (either standalone or linked to an audit)
  const [showNewFindingModal, setShowNewFindingModal] = useState(false);
  const [newFindingAuditId, setNewFindingAuditId] = useState<string>('');
  const [newFindingStandardRef, setNewFindingStandardRef] = useState('ISAGO RMP 2.3.1');
  const [newFindingDiscipline, setNewFindingDiscipline] = useState<AuditDiscipline>('RMP');
  const [newFindingDept, setNewFindingDept] = useState('Operations - Ramp Services');
  const [newFindingTitle, setNewFindingTitle] = useState('');
  const [newFindingDesc, setNewFindingDesc] = useState('');
  const [newFindingLocation, setNewFindingLocation] = useState('Apron Stand 4');
  const [newFindingRaisedDate, setNewFindingRaisedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal State: View / Advance Finding in Unified 8-Step Lifecycle
  const [selectedFinding, setSelectedFinding] = useState<AuditFinding | null>(null);
  const [findingModalTab, setFindingModalTab] = useState<'workflow' | 'auditTrail' | 'attachments'>('workflow');

  // Step 3 Level Form State
  const [levelClassification, setLevelClassification] = useState<InvestigationLevel>('level_2');
  const [levelComments, setLevelComments] = useState('');

  // Step 4 Investigation Form State
  const [invSummary, setInvSummary] = useState('');
  const [existingProcedures, setExistingProcedures] = useState<string[]>([
    'EMAAS-SOP-RMP-04: Ground Clearance Verification',
    'IATA IGOM Chapter 4: Apron Safety Standards'
  ]);
  const [newProcedureInput, setNewProcedureInput] = useState('');
  const [currentMitigations, setCurrentMitigations] = useState('');
  const [preSev, setPreSev] = useState(3);
  const [preLike, setPreLike] = useState('C');
  const [assignedHoD, setAssignedHoD] = useState('Capt. Sherif Nour (Head of Operations)');
  const [assignedHoDRole, setAssignedHoDRole] = useState<StationRole>('hod_ops');
  const [capaPlanDueDate, setCapaPlanDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });

  // Step 5 CAPA Form State
  const [rcaType, setRcaType] = useState<'simple' | 'five_whys'>('five_whys');
  const [directCause, setDirectCause] = useState('');
  const [contributing, setContributing] = useState('');
  const [systemicGap, setSystemicGap] = useState('');
  const [fiveWhys, setFiveWhys] = useState<string[]>([
    'Non-conformance observed during turnaround inspection.',
    'Procedures were not adhered to during high flight density.',
    'Checklist card was not carried by frontline agent.',
    'Supervisory briefing omitted turnaround card verification.',
    'Supervisors lacked digital auditing tool on apron.'
  ]);
  const [corrective, setCorrective] = useState('');
  const [preventive, setPreventive] = useState('');

  // Step 6 SQM Review Form State
  const [sqmReviewComments, setSqmReviewComments] = useState('');

  // Step 7 Effectiveness Form State
  const [isEffective, setIsEffective] = useState(true);
  const [effectivenessNotes, setEffectivenessNotes] = useState('');
  const [postSev, setPostSev] = useState(1);
  const [postLike, setPostLike] = useState('E');

  // Step 8 Final Sign-off Form State
  const [closureNotes, setClosureNotes] = useState('All corrective actions and evidence verified. Residual risk reduced to ALARP.');

  // File Upload Simulation
  const [newFileName, setNewFileName] = useState('');
  const [newFileCategory, setNewFileCategory] = useState<FileAttachment['category']>('investigation');

  // ==========================================
  // CALENDAR LOGIC & HELPERS
  // ==========================================
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const currentMonthLabel = language === 'ar' ? `${monthNamesAr[calendarMonth]} ${calendarYear}` : `${monthNames[calendarMonth]} ${calendarYear}`;

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCalendarYear(today.getFullYear());
    setCalendarMonth(today.getMonth());
  };

  // Filtered Audits
  const filteredAudits = useMemo(() => {
    return auditSchedule.filter(a => {
      if (calDisciplineFilter !== 'all' && a.discipline !== calDisciplineFilter) return false;
      if (calTypeFilter !== 'all' && a.auditType !== calTypeFilter) return false;
      if (calStatusFilter !== 'all' && a.status !== calStatusFilter) return false;
      if (calSearch.trim()) {
        const q = calSearch.toLowerCase();
        const matchTitle = a.title.toLowerCase().includes(q) || (a.titleAr && a.titleAr.toLowerCase().includes(q));
        const matchOrg = a.auditorOrganization.toLowerCase().includes(q);
        const matchAuditor = a.leadAuditor.toLowerCase().includes(q);
        const matchId = a.id.toLowerCase().includes(q);
        if (!matchTitle && !matchOrg && !matchAuditor && !matchId) return false;
      }
      return true;
    });
  }, [auditSchedule, calDisciplineFilter, calTypeFilter, calStatusFilter, calSearch]);

  // Map Audits to Calendar Days (YYYY-MM-DD)
  const auditsByDate = useMemo(() => {
    const map = new Map<string, AuditScheduleItem[]>();
    filteredAudits.forEach(audit => {
      const dateKey = audit.scheduledDate;
      const existing = map.get(dateKey) || [];
      existing.push(audit);
      map.set(dateKey, existing);
    });
    return map;
  }, [filteredAudits]);

  // Generate Month Grid Matrix
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1);
    const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const startDayOfWeek = firstDay.getDay();

    const days: { dayNumber: number; dateString: string; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(calendarYear, calendarMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevMonth = calendarMonth === 0 ? 11 : calendarMonth - 1;
      const prevYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
      const dateString = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateString, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const dateString = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dayNumber: i, dateString, isCurrentMonth: true });
    }

    // Next month padding to fill grid to multiple of 7
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;
      const nextYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
      const dateString = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dayNumber: i, dateString, isCurrentMonth: false });
    }

    return days;
  }, [calendarYear, calendarMonth]);

  // Today string
  const todayString = new Date().toISOString().split('T')[0];

  // Helper for audit status styling
  const getAuditStatusBadge = (status: AuditScheduleItem['status']) => {
    switch (status) {
      case 'planned':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">Planned</span>;
      case 'in_progress':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">In Progress</span>;
      case 'completed':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Completed</span>;
      case 'closed':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 border border-slate-500/30">Closed</span>;
      case 'overdue':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-mono">Overdue</span>;
      default:
        return null;
    }
  };

  const getDisciplineColor = (d: AuditDiscipline) => {
    switch (d) {
      case 'ORM': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'RMP': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'PAX': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'LOD': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'BAG': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  // Open Audit Form (Add new or Edit)
  const handleOpenAddAuditModal = (prefillDate?: string) => {
    setEditingAudit(null);
    setAuditFormTitle('');
    setAuditFormTitleAr('');
    setAuditFormType('internal');
    setAuditFormAuditorOrg('EMAAS Safety & Quality Department');
    setAuditFormLeadAuditor(activeRole === 'hod_safety' ? 'Dr. Khaled Fawzy (SQM)' : 'Mahmoud Ezz (Lead Auditor)');
    setAuditFormTeam('Mahmoud Ezz, Ahmed Hassan');
    setAuditFormDiscipline('RMP');
    setAuditFormDepartment('Operations - Ramp Services');
    setAuditFormLocation('Marsa Alam International Airport (RMF)');
    setAuditFormScheduledDate(prefillDate || new Date().toISOString().split('T')[0]);
    const endDate = new Date(prefillDate || new Date());
    endDate.setDate(endDate.getDate() + 2);
    setAuditFormEndDate(endDate.toISOString().split('T')[0]);
    setAuditFormQuarter('Q4');
    setAuditFormStatus('planned');
    setAuditFormScope('Internal station inspection verifying IGOM and SMS procedures.');
    setAuditFormExecSummary('Routine safety and quality conformance audit.');
    setAuditFormCriteria('ISAGO GOSM, ICAO Annex 19, ECAR 139');
    setShowAuditModal(true);
  };

  const handleOpenEditAuditModal = (audit: AuditScheduleItem) => {
    setEditingAudit(audit);
    setAuditFormTitle(audit.title);
    setAuditFormTitleAr(audit.titleAr || '');
    setAuditFormType(audit.auditType);
    setAuditFormAuditorOrg(audit.auditorOrganization);
    setAuditFormLeadAuditor(audit.leadAuditor);
    setAuditFormTeam(audit.auditTeam ? audit.auditTeam.join(', ') : '');
    setAuditFormDiscipline(audit.discipline);
    setAuditFormDepartment(audit.department || 'Operations - Ramp Services');
    setAuditFormLocation(audit.location || 'Marsa Alam International Airport (RMF)');
    setAuditFormScheduledDate(audit.scheduledDate);
    setAuditFormEndDate(audit.endDate || audit.scheduledDate);
    setAuditFormQuarter(audit.quarter);
    setAuditFormStatus(audit.status);
    setAuditFormScope(audit.scopeSummary);
    setAuditFormExecSummary(audit.executiveSummary || '');
    setAuditFormCriteria(audit.checklistCriteria ? audit.checklistCriteria.join(', ') : '');
    setShowAuditModal(true);
  };

  const handleSaveAuditForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditFormTitle.trim()) return;

    const teamArray = auditFormTeam.split(',').map(s => s.trim()).filter(Boolean);
    const criteriaArray = auditFormCriteria.split(',').map(s => s.trim()).filter(Boolean);

    if (editingAudit) {
      updateAuditScheduleItem(editingAudit.id, {
        title: auditFormTitle,
        titleAr: auditFormTitleAr || undefined,
        auditType: auditFormType,
        auditorOrganization: auditFormAuditorOrg,
        leadAuditor: auditFormLeadAuditor,
        auditTeam: teamArray,
        discipline: auditFormDiscipline,
        department: auditFormDepartment,
        location: auditFormLocation,
        scheduledDate: auditFormScheduledDate,
        endDate: auditFormEndDate,
        quarter: auditFormQuarter,
        status: auditFormStatus,
        scopeSummary: auditFormScope,
        executiveSummary: auditFormExecSummary,
        checklistCriteria: criteriaArray
      });
      // Update selected audit if open
      if (selectedAudit && selectedAudit.id === editingAudit.id) {
        setSelectedAudit(prev => prev ? {
          ...prev,
          title: auditFormTitle,
          titleAr: auditFormTitleAr || undefined,
          auditType: auditFormType,
          auditorOrganization: auditFormAuditorOrg,
          leadAuditor: auditFormLeadAuditor,
          auditTeam: teamArray,
          discipline: auditFormDiscipline,
          department: auditFormDepartment,
          location: auditFormLocation,
          scheduledDate: auditFormScheduledDate,
          endDate: auditFormEndDate,
          quarter: auditFormQuarter,
          status: auditFormStatus,
          scopeSummary: auditFormScope,
          executiveSummary: auditFormExecSummary,
          checklistCriteria: criteriaArray
        } : null);
      }
    } else {
      addAuditScheduleItem({
        title: auditFormTitle,
        titleAr: auditFormTitleAr || undefined,
        auditType: auditFormType,
        auditorOrganization: auditFormAuditorOrg,
        leadAuditor: auditFormLeadAuditor,
        auditTeam: teamArray,
        discipline: auditFormDiscipline,
        department: auditFormDepartment,
        location: auditFormLocation,
        scheduledDate: auditFormScheduledDate,
        endDate: auditFormEndDate,
        quarter: auditFormQuarter,
        status: auditFormStatus,
        scopeSummary: auditFormScope,
        executiveSummary: auditFormExecSummary,
        checklistCriteria: criteriaArray
      });
    }

    setShowAuditModal(false);
  };

  // ==========================================
  // TEMPLATE MANAGER HANDLERS
  // ==========================================
  const filteredTemplates = useMemo(() => {
    return auditTemplates.filter(t => {
      if (templateDisciplineFilter !== 'all' && t.discipline !== templateDisciplineFilter) return false;
      if (templateTypeFilter !== 'all' && t.auditType !== templateTypeFilter) return false;
      if (templateSearch.trim()) {
        const q = templateSearch.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q) || (t.titleAr && t.titleAr.toLowerCase().includes(q));
        const matchFw = t.standardFramework.toLowerCase().includes(q);
        const matchScope = t.scopeSummary.toLowerCase().includes(q);
        const matchDept = t.department.toLowerCase().includes(q);
        if (!matchTitle && !matchFw && !matchScope && !matchDept) return false;
      }
      return true;
    });
  }, [auditTemplates, templateDisciplineFilter, templateTypeFilter, templateSearch]);

  const handleOpenAddTemplateModal = () => {
    setEditingTemplate(null);
    setTplFormTitle('');
    setTplFormTitleAr('');
    setTplFormAuditType('internal');
    setTplFormDiscipline('RMP');
    setTplFormFramework('IATA ISAGO GOSM 14th Edition');
    setTplFormDepartment('Operations - Ramp Services');
    setTplFormLeadRole('Lead ISAGO Ramp Auditor');
    setTplFormHours(8);
    setTplFormScope('Standard apron and ramp operations conformity checklist verification.');
    setTplFormItems([
      {
        id: `CHK-${Date.now()}-1`,
        code: 'ISAGO RMP 1.1.1',
        title: 'Safety Clearance Zone',
        question: 'Is the safety clearance zone verified clear of obstacles prior to aircraft arrival?',
        category: 'Apron Readiness',
        guidanceNotes: 'Inspect perimeter visual clearance markings.',
        mandatory: true
      }
    ]);
    setShowTemplateModal(true);
  };

  const handleOpenEditTemplateModal = (tpl: AuditTemplate) => {
    setEditingTemplate(tpl);
    setTplFormTitle(tpl.title);
    setTplFormTitleAr(tpl.titleAr || '');
    setTplFormAuditType(tpl.auditType);
    setTplFormDiscipline(tpl.discipline);
    setTplFormFramework(tpl.standardFramework);
    setTplFormDepartment(tpl.department);
    setTplFormLeadRole(tpl.leadAuditorRole || 'Lead Quality Inspector');
    setTplFormHours(tpl.estimatedHours || 8);
    setTplFormScope(tpl.scopeSummary);
    setTplFormItems([...tpl.items]);
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplFormTitle.trim()) return;

    if (editingTemplate) {
      updateAuditTemplate(editingTemplate.id, {
        title: tplFormTitle,
        titleAr: tplFormTitleAr || undefined,
        auditType: tplFormAuditType,
        discipline: tplFormDiscipline,
        standardFramework: tplFormFramework,
        department: tplFormDepartment,
        leadAuditorRole: tplFormLeadRole,
        estimatedHours: tplFormHours,
        scopeSummary: tplFormScope,
        items: tplFormItems
      });
    } else {
      addAuditTemplate({
        title: tplFormTitle,
        titleAr: tplFormTitleAr || undefined,
        auditType: tplFormAuditType,
        discipline: tplFormDiscipline,
        standardFramework: tplFormFramework,
        department: tplFormDepartment,
        leadAuditorRole: tplFormLeadRole,
        estimatedHours: tplFormHours,
        scopeSummary: tplFormScope,
        items: tplFormItems
      });
    }

    setShowTemplateModal(false);
  };

  const handleDuplicateTemplate = (tpl: AuditTemplate) => {
    addAuditTemplate({
      title: `Copy of ${tpl.title}`,
      titleAr: tpl.titleAr ? `نسخة من ${tpl.titleAr}` : undefined,
      auditType: tpl.auditType,
      discipline: tpl.discipline,
      standardFramework: tpl.standardFramework,
      department: tpl.department,
      leadAuditorRole: tpl.leadAuditorRole,
      estimatedHours: tpl.estimatedHours,
      scopeSummary: tpl.scopeSummary,
      items: tpl.items.map(it => ({ ...it, id: `CHK-${Date.now()}-${Math.floor(Math.random() * 1000)}` }))
    });
  };

  const handleScheduleFromTemplate = (tpl: AuditTemplate) => {
    setEditingAudit(null);
    setAuditFormTitle(tpl.title);
    setAuditFormTitleAr(tpl.titleAr || '');
    setAuditFormType(tpl.auditType);
    setAuditFormDiscipline(tpl.discipline);
    setAuditFormDepartment(tpl.department);
    setAuditFormAuditorOrg(tpl.auditType === 'internal' ? 'EMAAS Safety & Quality Department' : (tpl.standardFramework.includes('ISAGO') ? 'IATA ISAGO Lead Audit Team' : 'Egyptian Civil Aviation Authority (ECAA)'));
    setAuditFormLeadAuditor(tpl.leadAuditorRole || 'Dr. Khaled Fawzy (SQM)');
    setAuditFormScheduledDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setDate(d.getDate() + 2);
    setAuditFormEndDate(d.toISOString().split('T')[0]);
    setAuditFormQuarter('Q4');
    setAuditFormStatus('planned');
    setAuditFormScope(tpl.scopeSummary);
    setAuditFormCriteria(tpl.standardFramework);
    setShowAuditModal(true);
  };

  const handleAddChecklistItemToTemplate = () => {
    if (!newCheckTitle.trim() || !newCheckQuestion.trim()) return;
    const newItem: AuditChecklistItem = {
      id: `CHK-${Date.now()}`,
      code: newCheckCode.trim() || `REF-${tplFormItems.length + 1}`,
      title: newCheckTitle.trim(),
      question: newCheckQuestion.trim(),
      category: newCheckCategory.trim() || 'Safety Conformance',
      guidanceNotes: newCheckGuidance.trim() || undefined,
      mandatory: newCheckMandatory
    };
    setTplFormItems(prev => [...prev, newItem]);
    setNewCheckCode('');
    setNewCheckTitle('');
    setNewCheckQuestion('');
    setNewCheckGuidance('');
    setNewCheckMandatory(true);
  };

  const handleRemoveChecklistItemFromTemplate = (id: string) => {
    setTplFormItems(prev => prev.filter(it => it.id !== id));
  };

  // Open Add Finding Modal (linked to audit)
  const handleOpenAddFindingForAudit = (audit: AuditScheduleItem) => {
    setNewFindingAuditId(audit.id);
    setNewFindingDiscipline(audit.discipline);
    setNewFindingDept(audit.department || 'Operations - Ramp Services');
    setNewFindingStandardRef(audit.discipline === 'ORM' ? 'ISAGO ORM 1.5' : audit.discipline === 'RMP' ? 'IGOM 4.1.2 Aircraft Turnaround' : 'ICAO Annex 19 App 2');
    setNewFindingTitle('');
    setNewFindingDesc('');
    setNewFindingLocation(audit.location || 'Airside Stands');
    setNewFindingRaisedDate(new Date().toISOString().split('T')[0]);
    setShowNewFindingModal(true);
  };

  const handleSaveNewFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFindingTitle.trim() || !newFindingDesc.trim()) return;

    const linkedAudit = auditSchedule.find(a => a.id === newFindingAuditId);

    const created = addFinding({
      auditId: newFindingAuditId || undefined,
      auditTitle: linkedAudit ? linkedAudit.title : 'Standalone Quality Inspection',
      auditType: linkedAudit ? linkedAudit.auditType : 'internal',
      externalAuditorOrg: linkedAudit?.auditorOrganization,
      isagoDiscipline: newFindingDiscipline,
      standardReference: newFindingStandardRef,
      title: newFindingTitle,
      description: newFindingDesc,
      department: newFindingDept,
      assignedDepartment: newFindingDept,
      location: newFindingLocation,
      raisedDate: newFindingRaisedDate,
      assignedHoD: 'Capt. Sherif Nour (Head of Operations)'
    });

    setShowNewFindingModal(false);
    // Open the finding modal so user can proceed with acknowledgment or level assignment
    handleOpenFindingLifecycle(created);
  };

  // Open Finding Lifecycle Wizard Modal
  const handleOpenFindingLifecycle = (finding: AuditFinding) => {
    setSelectedFinding(finding);
    setFindingModalTab('workflow');

    // Hydrate Step 3
    if (finding.level) {
      setLevelClassification(finding.level);
    } else {
      setLevelClassification('level_2');
    }
    setLevelComments(finding.levelComments || '');

    // Hydrate Step 4
    setInvSummary(finding.investigationSummary || '');
    if (finding.existingProcedures && finding.existingProcedures.length > 0) {
      setExistingProcedures(finding.existingProcedures);
    }
    setCurrentMitigations(finding.currentMitigations || '');
    if (finding.preMitigationRisk) {
      setPreSev(finding.preMitigationRisk.severity);
      setPreLike(finding.preMitigationRisk.likelihood);
    }
    setAssignedHoD(finding.assignedHoD || 'Capt. Sherif Nour (Head of Operations)');
    setAssignedHoDRole(finding.assignedHoDRole || 'hod_ops');
    if (finding.capaPlanDueDate) {
      setCapaPlanDueDate(finding.capaPlanDueDate);
    }

    // Hydrate Step 5
    if (finding.rcaType) {
      setRcaType(finding.rcaType);
    }
    if (finding.simpleRca) {
      setDirectCause(finding.simpleRca.directCause || '');
      setContributing(finding.simpleRca.contributingFactor || '');
      setSystemicGap(finding.simpleRca.systemicGap || '');
    }
    if (finding.fiveWhysRca && finding.fiveWhysRca.length > 0) {
      const padded = [...finding.fiveWhysRca];
      while (padded.length < 5) padded.push('');
      setFiveWhys(padded);
    }
    if (finding.capa) {
      setCorrective(finding.capa.correctiveAction);
      setPreventive(finding.capa.preventiveAction);
    } else if (finding.capaProposal) {
      setCorrective(finding.capaProposal.correctiveAction);
      setPreventive(finding.capaProposal.preventiveAction);
    } else {
      setCorrective('');
      setPreventive('');
    }

    // Hydrate Step 6
    setSqmReviewComments(finding.sqmPlanReviewComments || '');

    // Hydrate Step 7
    if (finding.effectivenessEvaluation) {
      setIsEffective(finding.effectivenessEvaluation.isEffective);
      setEffectivenessNotes(finding.effectivenessEvaluation.evaluationNotes);
    } else {
      setIsEffective(true);
      setEffectivenessNotes('');
    }
    if (finding.residualRisk) {
      setPostSev(finding.residualRisk.severity);
      setPostLike(finding.residualRisk.likelihood);
    }

    // Hydrate Step 8
    setClosureNotes(finding.closureNotes || 'All corrective and preventive actions verified. Residual risk reduced to ALARP criteria.');
  };

  // Filtered Findings
  const filteredFindings = useMemo(() => {
    return findings.filter(f => {
      const overdue = getOverdueCalculation(f.targetClosureDate, f.lifecycleStatus === 'closed');

      if (findingTab === 'my_actions') {
        if (activeRole === 'hod_safety') {
          // SQM actions: Acknowledged (needs level), plan_under_review (needs approval), pending_signoff (needs signoff)
          const needsSQM = f.lifecycleStatus === 'acknowledged' || f.lifecycleStatus === 'plan_under_review' || f.lifecycleStatus === 'pending_signoff';
          if (!needsSQM) return false;
        } else if (activeRole === 'safety_officer') {
          const needsSO = f.lifecycleStatus === 'submitted' || f.lifecycleStatus === 'level_assigned' || f.lifecycleStatus === 'effectiveness_pending';
          if (!needsSO) return false;
        } else if (activeRole === 'hod_ops' || activeRole === 'hod_maint' || activeRole === 'hod_training') {
          const needsHoD = f.lifecycleStatus === 'plan_pending' || f.lifecycleStatus === 'plan_returned';
          if (!needsHoD) return false;
        }
      } else if (findingTab === 'overdue') {
        if (!overdue.isOverdue) return false;
      } else if (findingTab === 'approaching') {
        if (!overdue.isApproaching) return false;
      } else if (findingTab === 'awaiting_level') {
        if (f.lifecycleStatus !== 'acknowledged') return false;
      } else if (findingTab === 'awaiting_review') {
        if (f.lifecycleStatus !== 'plan_under_review') return false;
      }

      if (findingDisciplineFilter !== 'all' && f.isagoDiscipline !== findingDisciplineFilter) return false;
      if (findingLevelFilter !== 'all' && f.level !== findingLevelFilter) return false;

      if (findingSearch.trim()) {
        const q = findingSearch.toLowerCase();
        const matchTitle = f.title ? f.title.toLowerCase().includes(q) : false;
        const matchDesc = f.description.toLowerCase().includes(q);
        const matchRef = f.standardReference.toLowerCase().includes(q);
        const matchId = f.id.toLowerCase().includes(q);
        const matchAudit = f.auditTitle.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchRef && !matchId && !matchAudit) return false;
      }

      return true;
    });
  }, [findings, findingTab, findingDisciplineFilter, findingLevelFilter, findingSearch, activeRole]);

  // Calculations for Overview Pills
  const totalAuditsCount = auditSchedule.length;
  const inProgressAuditsCount = auditSchedule.filter(a => a.status === 'in_progress').length;
  const totalFindingsCount = findings.length;
  const overdueFindingsCount = findings.filter(f => {
    const ov = getOverdueCalculation(f.targetClosureDate, f.lifecycleStatus === 'closed');
    return ov.isOverdue;
  }).length;
  const awaitingLevelCount = findings.filter(f => f.lifecycleStatus === 'acknowledged').length;
  const awaitingReviewCount = findings.filter(f => f.lifecycleStatus === 'plan_under_review').length;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <CalendarCheck className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                {t.audits.title}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                  EMAAS RMF
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                {t.audits.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenAddAuditModal()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.audits.scheduleAuditBtn}</span>
          </button>

          <button
            onClick={() => {
              setNewFindingAuditId('');
              setNewFindingTitle('');
              setNewFindingDesc('');
              setShowNewFindingModal(true);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 transition cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{t.audits.addFindingBtn}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Audits</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-slate-100">{totalAuditsCount}</span>
            <span className="text-[10px] text-blue-400 font-mono">2026 Plan</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Active In-Progress</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-amber-400">{inProgressAuditsCount}</span>
            <span className="text-[10px] text-amber-400 font-mono">Active Field</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Findings</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-slate-100">{totalFindingsCount}</span>
            <span className="text-[10px] text-slate-400 font-mono">Dossiers</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Awaiting Level (SQM)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl font-bold font-mono ${awaitingLevelCount > 0 ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}>
              {awaitingLevelCount}
            </span>
            <span className="text-[10px] text-indigo-400 font-mono">Step 3</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">CAPA In Review</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl font-bold font-mono ${awaitingReviewCount > 0 ? 'text-purple-400' : 'text-slate-400'}`}>
              {awaitingReviewCount}
            </span>
            <span className="text-[10px] text-purple-400 font-mono">Step 6</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Overdue Findings</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl font-bold font-mono ${overdueFindingsCount > 0 ? 'text-red-400 font-black animate-pulse' : 'text-emerald-400'}`}>
              {overdueFindingsCount}
            </span>
            <span className="text-[10px] text-red-400 font-mono">Target Date</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'calendar'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t.audits.tabs.calendar}</span>
        </button>

        <button
          onClick={() => setActiveTab('annualPlan')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'annualPlan'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t.audits.tabs.annualPlan}</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400">
            {auditSchedule.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('findings')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'findings'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{t.audits.tabs.findings}</span>
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
            overdueFindingsCount > 0 ? 'bg-red-500/20 text-red-400 font-bold' : 'bg-slate-800 text-slate-400'
          }`}>
            {findings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'templates'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{language === 'ar' ? 'إدارة نماذج التدقيق (ISAGO / IGOM)' : 'Checklist Template Manager'}</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-900/40 text-indigo-300 font-mono">
            {auditTemplates.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ANNUAL PLAN INTERACTIVE CALENDAR VIEW                              */}
      {/* ========================================================================= */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          
          {/* Calendar Control Bar */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Month & Navigation Buttons */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-slate-700 rounded text-slate-300 transition cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-4 py-1 text-sm font-bold font-mono text-slate-100 min-w-[160px] text-center">
                  {currentMonthLabel}
                </div>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-slate-700 rounded text-slate-300 transition cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleJumpToToday}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                {t.audits.today}
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
                <button
                  onClick={() => setCalendarViewMode('month')}
                  className={`px-3 py-1 rounded transition cursor-pointer ${
                    calendarViewMode === 'month' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.audits.calendarViewMonth}
                </button>
                <button
                  onClick={() => setCalendarViewMode('year')}
                  className={`px-3 py-1 rounded transition cursor-pointer ${
                    calendarViewMode === 'year' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.audits.calendarViewYear}
                </button>
              </div>
            </div>

            {/* Quick Filter Inputs */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={calSearch}
                  onChange={(e) => setCalSearch(e.target.value)}
                  placeholder="Filter audits..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Discipline Filter */}
              <select
                value={calDisciplineFilter}
                onChange={(e) => setCalDisciplineFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 px-2 py-1.5 focus:outline-none"
              >
                <option value="all">All Disciplines</option>
                <option value="ORM">ORM (Organization)</option>
                <option value="RMP">RMP (Ramp Services)</option>
                <option value="PAX">PAX (Passenger)</option>
                <option value="LOD">LOD (Load Control)</option>
                <option value="BAG">BAG (Baggage)</option>
              </select>

              {/* Type Filter */}
              <select
                value={calTypeFilter}
                onChange={(e) => setCalTypeFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 px-2 py-1.5 focus:outline-none"
              >
                <option value="all">Internal & External</option>
                <option value="internal">Internal Only</option>
                <option value="external">External Only</option>
              </select>

              {/* Status Filter */}
              <select
                value={calStatusFilter}
                onChange={(e) => setCalStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 px-2 py-1.5 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Month Grid View */}
          {calendarViewMode === 'month' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 bg-slate-800/80 border-b border-slate-800 text-center py-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/60 bg-slate-950/40">
                {calendarDays.map((item, index) => {
                  const dayAudits = auditsByDate.get(item.dateString) || [];
                  const isToday = item.dateString === todayString;

                  return (
                    <div
                      key={index}
                      className={`min-h-[125px] p-2 flex flex-col justify-between transition group hover:bg-slate-800/30 ${
                        !item.isCurrentMonth ? 'opacity-35 bg-slate-900/20' : ''
                      } ${isToday ? 'ring-1 ring-blue-500/60 bg-blue-500/5' : ''}`}
                    >
                      {/* Top Date Header of the cell */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                            isToday
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                              : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        >
                          {item.dayNumber}
                        </span>

                        {/* Quick Add Button on Hover */}
                        <button
                          onClick={() => handleOpenAddAuditModal(item.dateString)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-600 text-slate-400 hover:text-white rounded transition cursor-pointer"
                          title={`Schedule audit on ${item.dateString}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Audits on this date */}
                      <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[105px] pr-0.5">
                        {dayAudits.map(audit => {
                          const linkedFindings = findings.filter(f => f.auditId === audit.id);
                          const hasOverdue = linkedFindings.some(f => {
                            const ov = getOverdueCalculation(f.targetClosureDate, f.lifecycleStatus === 'closed');
                            return ov.isOverdue;
                          });

                          return (
                            <div
                              key={audit.id}
                              onClick={() => setSelectedAudit(audit)}
                              className={`p-2 rounded-lg text-left cursor-pointer transition shadow-sm border ${
                                audit.auditType === 'external'
                                  ? 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-500/40 text-purple-200'
                                  : 'bg-blue-950/40 hover:bg-blue-900/60 border-blue-500/40 text-blue-200'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getDisciplineColor(audit.discipline)}`}>
                                  {audit.discipline}
                                </span>
                                {getAuditStatusBadge(audit.status)}
                              </div>

                              <p className="text-[11px] font-semibold line-clamp-2 leading-tight">
                                {language === 'ar' && audit.titleAr ? audit.titleAr : audit.title}
                              </p>

                              <div className="mt-1.5 pt-1 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                                <span className="truncate max-w-[90px]">{audit.leadAuditor.split(' ')[0]}</span>
                                <span className={`font-mono text-[9px] px-1 py-0.2 rounded ${
                                  hasOverdue 
                                    ? 'bg-red-500/20 text-red-400 font-bold' 
                                    : linkedFindings.length > 0 
                                    ? 'bg-slate-800 text-slate-300' 
                                    : 'text-slate-500'
                                }`}>
                                  {linkedFindings.length} find
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 12-Month Year Overview Mode */}
          {calendarViewMode === 'year' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {monthNames.map((mName, mIdx) => {
                const monthAudits = filteredAudits.filter(a => {
                  const [y, m] = a.scheduledDate.split('-').map(Number);
                  return y === calendarYear && m === mIdx + 1;
                });

                return (
                  <div
                    key={mIdx}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                        <span>{language === 'ar' ? monthNamesAr[mIdx] : mName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                          {monthAudits.length}
                        </span>
                      </h3>
                      <button
                        onClick={() => {
                          setCalendarMonth(mIdx);
                          setCalendarViewMode('month');
                        }}
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                      >
                        Open Grid →
                      </button>
                    </div>

                    <div className="space-y-2 flex-1">
                      {monthAudits.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-3 text-center">No audits scheduled</p>
                      ) : (
                        monthAudits.map(audit => (
                          <div
                            key={audit.id}
                            onClick={() => setSelectedAudit(audit)}
                            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs cursor-pointer transition space-y-1"
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono text-slate-400">{audit.scheduledDate}</span>
                              <span className={`px-1.5 py-0.2 rounded font-bold ${getDisciplineColor(audit.discipline)}`}>
                                {audit.discipline}
                              </span>
                            </div>
                            <div className="font-semibold text-slate-200 line-clamp-1">
                              {language === 'ar' && audit.titleAr ? audit.titleAr : audit.title}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenAddAuditModal(`${calendarYear}-${String(mIdx + 1).padStart(2, '0')}-15`)}
                      className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Schedule for {mName.substring(0, 3)}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AUDITS MASTER TABLE VIEW (FULL CRUD)                               */}
      {/* ========================================================================= */}
      {activeTab === 'annualPlan' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={calSearch}
                onChange={(e) => setCalSearch(e.target.value)}
                placeholder="Search by code, title, lead auditor, or auditing body..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenAddAuditModal()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.audits.scheduleAuditBtn}</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="p-3 font-mono">Audit ID</th>
                    <th className="p-3">Title & Auditing Body</th>
                    <th className="p-3">Discipline</th>
                    <th className="p-3">Lead Auditor</th>
                    <th className="p-3">Schedule Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Findings</th>
                    <th className="p-3 text-right rtl:text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredAudits.map(audit => {
                    const linked = findings.filter(f => f.auditId === audit.id);

                    return (
                      <tr key={audit.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-bold text-slate-300">
                          {audit.id}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-200">
                            {language === 'ar' && audit.titleAr ? audit.titleAr : audit.title}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="font-medium text-slate-300">{audit.auditorOrganization}</span>
                            <span>•</span>
                            <span className="capitalize">{audit.auditType} Audit</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDisciplineColor(audit.discipline)}`}>
                            {audit.discipline}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-300">
                          {audit.leadAuditor}
                        </td>
                        <td className="p-3 font-mono text-slate-300 whitespace-nowrap">
                          {audit.scheduledDate} {audit.endDate ? `to ${audit.endDate}` : ''}
                        </td>
                        <td className="p-3">
                          {getAuditStatusBadge(audit.status)}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full font-mono font-bold text-xs ${
                            linked.length > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {linked.length}
                          </span>
                        </td>
                        <td className="p-3 text-right rtl:text-left">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedAudit(audit)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                              title="View full audit dossier & linked findings"
                            >
                              View Dossier
                            </button>
                            <button
                              onClick={() => setExportReportAudit(audit)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 transition cursor-pointer"
                              title="Export official audit report"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenAddFindingForAudit(audit)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
                              title="Add finding for this audit"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditAuditModal(audit)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                              title="Edit audit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmTarget({ type: 'audit', id: audit.id, title: audit.title })}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-red-400 hover:text-red-300 transition cursor-pointer"
                              title="Delete audit"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AUDIT FINDINGS & CAPA (UNIFIED 8-STEP CYCLE)                       */}
      {/* ========================================================================= */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          
          {/* Finding Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'all', label: 'All Findings', count: findings.length },
              { id: 'my_actions', label: 'My Pending Actions', count: findings.filter(f => {
                if (activeRole === 'hod_safety') return f.lifecycleStatus === 'acknowledged' || f.lifecycleStatus === 'plan_under_review' || f.lifecycleStatus === 'pending_signoff';
                if (activeRole === 'safety_officer') return f.lifecycleStatus === 'submitted' || f.lifecycleStatus === 'level_assigned' || f.lifecycleStatus === 'effectiveness_pending';
                return f.lifecycleStatus === 'plan_pending' || f.lifecycleStatus === 'plan_returned';
              }).length, highlight: true },
              { id: 'overdue', label: 'Overdue (Case Level)', count: overdueFindingsCount, alert: true },
              { id: 'awaiting_level', label: 'Awaiting Level (SQM)', count: awaitingLevelCount },
              { id: 'awaiting_review', label: 'CAPA In Review', count: awaitingReviewCount }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFindingTab(tab.id as FindingDashboardTab)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  findingTab === tab.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  tab.alert && tab.count > 0 
                    ? 'bg-red-500 text-white font-bold' 
                    : findingTab === tab.id 
                    ? 'bg-blue-700 text-white' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Discipline Filter Bar */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={findingSearch}
                onChange={(e) => setFindingSearch(e.target.value)}
                placeholder="Search findings by code, reference, audit, or text..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={findingDisciplineFilter}
                onChange={(e) => setFindingDisciplineFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 px-2 py-1.5 focus:outline-none"
              >
                <option value="all">All Disciplines</option>
                <option value="ORM">ORM (Organization)</option>
                <option value="RMP">RMP (Ramp Services)</option>
                <option value="PAX">PAX (Passenger)</option>
                <option value="LOD">LOD (Load Control)</option>
                <option value="BAG">BAG (Baggage)</option>
              </select>

              <select
                value={findingLevelFilter}
                onChange={(e) => setFindingLevelFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 px-2 py-1.5 focus:outline-none"
              >
                <option value="all">All Levels</option>
                <option value="level_1">Level 1 (Major 30d)</option>
                <option value="level_2">Level 2 (Minor 60d)</option>
                <option value="level_3">Level 3 (Observation 90d)</option>
              </select>
            </div>
          </div>

          {/* Findings Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFindings.map(finding => {
              const overdue = getOverdueCalculation(finding.targetClosureDate, finding.lifecycleStatus === 'closed');
              const levelMeta = getLevelMetadata(finding.level, language);
              const statusMeta = getStatusMetadata(finding.lifecycleStatus, language);

              return (
                <div
                  key={finding.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3 shadow-md"
                >
                  {/* Top Bar: Code, Audit Link, Level Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {finding.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getDisciplineColor(finding.isagoDiscipline)}`}>
                          {finding.isagoDiscipline}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${levelMeta.badgeClass}`}>
                          {levelMeta.levelCode} ({levelMeta.days}d)
                        </span>
                        {finding.targetClosureDate && (
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${overdue.badgeClass}`}>
                            {overdue.statusText}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Standard Reference & Title */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                        <Tag className="w-3 h-3" />
                        <span>{finding.standardReference}</span>
                      </div>
                      <h3 className="font-bold text-slate-100 text-sm line-clamp-1">
                        {finding.title || finding.description}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {finding.description}
                      </p>
                    </div>

                    {/* Linked Audit Name */}
                    <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-800/40 p-1.5 rounded-lg border border-slate-800">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{finding.auditTitle}</span>
                    </div>
                  </div>

                  {/* Bottom Bar: 8-Step Lifecycle Progress & Actions */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="font-semibold text-slate-300">{statusMeta.label}</span>
                      </span>

                      {finding.preMitigationRisk && (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          Initial Risk: <strong>{finding.preMitigationRisk.scoreCode}</strong>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500 font-mono">
                        Dept: {finding.assignedDepartment}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenFindingLifecycle(finding)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow"
                        >
                          <span>Manage 8-Step Cycle</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmTarget({ type: 'finding', id: finding.id, title: finding.title || finding.id })}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer"
                          title="Delete finding"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AUDIT CHECKLIST TEMPLATE MANAGER (ISAGO / IGOM REUSABLE TEMPLATES) */}
      {/* ========================================================================= */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          
          {/* Header & Controls Toolbar */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>{language === 'ar' ? 'إدارة قوالب تدقيق ISAGO / IGOM' : 'Reusable Audit Checklist Templates'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'ar'
                  ? 'قوالب جاهزة ومعايير فحص قياسية لتسريع جدولة وإجراء تدقيقات محطة مرسى علم الدولية.'
                  : 'Pre-configured checklists and conformance criteria to streamline recurring ISAGO, IGOM, and airline safety audits.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Search templates or criteria..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Discipline Filter */}
              <select
                value={templateDisciplineFilter}
                onChange={(e) => setTemplateDisciplineFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 px-2 py-1.5 focus:outline-none"
              >
                <option value="all">All Disciplines</option>
                <option value="ORM">ORM (Organization)</option>
                <option value="RMP">RMP (Ramp Services)</option>
                <option value="PAX">PAX (Passenger)</option>
                <option value="LOD">LOD (Load Control)</option>
                <option value="BAG">BAG (Baggage)</option>
              </select>

              {/* Type Filter */}
              <select
                value={templateTypeFilter}
                onChange={(e) => setTemplateTypeFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 px-2 py-1.5 focus:outline-none"
              >
                <option value="all">All Audit Types</option>
                <option value="internal">Internal Quality</option>
                <option value="isago">IATA ISAGO</option>
                <option value="regulatory">Regulatory (ECAA)</option>
                <option value="airline">Airline Customer</option>
              </select>

              {/* Create Template Button */}
              <button
                onClick={handleOpenAddTemplateModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'ar' ? '+ إنشاء قالب جديد' : '+ New Checklist Template'}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Saved Templates</span>
                <span className="text-xl font-bold font-mono text-indigo-400">{auditTemplates.length}</span>
              </div>
              <BookOpen className="w-6 h-6 text-indigo-500/30" />
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Total Check Criteria</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {auditTemplates.reduce((acc, cur) => acc + (cur.items?.length || 0), 0)}
                </span>
              </div>
              <ListChecks className="w-6 h-6 text-emerald-500/30" />
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">ISAGO / IGOM Compliant</span>
                <span className="text-xl font-bold font-mono text-blue-400">100%</span>
              </div>
              <BookmarkCheck className="w-6 h-6 text-blue-500/30" />
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Active Disciplines</span>
                <span className="text-xl font-bold font-mono text-amber-400">
                  {new Set(auditTemplates.map(t => t.discipline)).size} / 5
                </span>
              </div>
              <Layers className="w-6 h-6 text-amber-500/30" />
            </div>
          </div>

          {/* Templates Cards Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="p-10 text-center bg-slate-900/40 rounded-xl border border-dashed border-slate-800 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No Checklist Templates Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No templates matched your search criteria or discipline filter. Create a new custom ISAGO/IGOM audit template to streamline upcoming station audits.
              </p>
              <button
                onClick={handleOpenAddTemplateModal}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
              >
                + Create Template Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map(tpl => (
                <div
                  key={tpl.id}
                  className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between space-y-4 shadow-lg group"
                >
                  <div>
                    {/* Top Chips */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                          {tpl.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getDisciplineColor(tpl.discipline)}`}>
                          {tpl.discipline}
                        </span>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {tpl.auditType}
                        </span>
                      </div>

                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {tpl.items?.length || 0} Questions
                      </span>
                    </div>

                    {/* Framework & Title */}
                    <div className="text-[11px] font-mono text-indigo-400 font-semibold mb-1 flex items-center gap-1.5">
                      <BookmarkCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>{tpl.standardFramework}</span>
                    </div>

                    <h3 className="font-bold text-slate-100 text-sm leading-snug">
                      {language === 'ar' && tpl.titleAr ? tpl.titleAr : tpl.title}
                    </h3>

                    {/* Scope */}
                    <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {tpl.scopeSummary}
                    </p>

                    {/* Metadata Row */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="text-slate-500 block">Department:</span>
                        <span className="font-medium text-slate-200 truncate block">{tpl.department}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Target Auditor:</span>
                        <span className="font-medium text-slate-200 truncate block">{tpl.leadAuditorRole || 'Lead Auditor'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedTemplateForView(tpl)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                        title="Inspect checklist criteria"
                      >
                        <ListChecks className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Inspect ({tpl.items?.length || 0})</span>
                      </button>

                      <button
                        onClick={() => handleDuplicateTemplate(tpl)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                        title="Duplicate as new template"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEditTemplateModal(tpl)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                        title="Edit template details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmTarget({ type: 'template', id: tpl.id, title: tpl.title })}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer"
                        title="Delete template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Launch Audit from Template Button */}
                    <button
                      onClick={() => handleScheduleFromTemplate(tpl)}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                    >
                      <span>⚡ Schedule Audit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AUDIT DOSSIER / DETAIL VIEW                                        */}
      {/* ========================================================================= */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    {selectedAudit.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getDisciplineColor(selectedAudit.discipline)}`}>
                    {selectedAudit.discipline}
                  </span>
                  {getAuditStatusBadge(selectedAudit.status)}
                </div>
                <h2 className="text-xl font-bold text-slate-100">
                  {language === 'ar' && selectedAudit.titleAr ? selectedAudit.titleAr : selectedAudit.title}
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedAudit.auditorOrganization} · Lead Auditor: {selectedAudit.leadAuditor}
                </p>
              </div>

              <button
                onClick={() => setSelectedAudit(null)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Audit Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">Scheduled Date</span>
                <span className="font-mono font-bold text-slate-200">{selectedAudit.scheduledDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Quarter & Year</span>
                <span className="font-semibold text-slate-200">{selectedAudit.quarter} 2026</span>
              </div>
              <div>
                <span className="text-slate-500 block">Department</span>
                <span className="font-semibold text-slate-200">{selectedAudit.department || 'Operations'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Location / Station</span>
                <span className="font-semibold text-slate-200">{selectedAudit.location || 'Marsa Alam (RMF)'}</span>
              </div>
            </div>

            {/* Scope & Checklist Criteria */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Audit Scope & Focus</h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                  {selectedAudit.scopeSummary}
                </p>
              </div>

              {selectedAudit.checklistCriteria && selectedAudit.checklistCriteria.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Conformance Standards</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAudit.checklistCriteria.map((c, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Linked Findings Section */}
            <div className="space-y-3 border-t border-slate-800 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Findings Linked to this Audit</span>
                    <span className="text-xs px-2 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
                      {findings.filter(f => f.auditId === selectedAudit.id).length}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    All non-conformances follow the unified 8-step investigation & CAPA lifecycle.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleOpenAddFindingForAudit(selectedAudit);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.audits.addFindingForAudit}</span>
                  </button>

                  <button
                    onClick={() => {
                      setExportReportAudit(selectedAudit);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t.audits.exportAuditReport}</span>
                  </button>
                </div>
              </div>

              {/* Linked Findings List */}
              <div className="space-y-2">
                {findings.filter(f => f.auditId === selectedAudit.id).length === 0 ? (
                  <div className="p-6 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                    <p className="text-xs text-slate-400">Zero non-conformities currently logged for this audit.</p>
                    <button
                      onClick={() => handleOpenAddFindingForAudit(selectedAudit)}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                    >
                      + Add First Audit Finding
                    </button>
                  </div>
                ) : (
                  findings.filter(f => f.auditId === selectedAudit.id).map(f => {
                    const statusMeta = getStatusMetadata(f.lifecycleStatus, language);
                    const overdue = getOverdueCalculation(f.targetClosureDate, f.lifecycleStatus === 'closed');
                    const levelMeta = getLevelMetadata(f.level, language);

                    return (
                      <div
                        key={f.id}
                        className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-400">{f.id}</span>
                            <span className="font-mono text-amber-400 font-semibold">{f.standardReference}</span>
                            <span className={`text-[10px] px-2 py-0.2 rounded ${levelMeta.badgeClass}`}>
                              {levelMeta.levelCode}
                            </span>
                            {f.targetClosureDate && (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${overdue.badgeClass}`}>
                                {overdue.statusText}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-300 font-medium">{f.title || f.description}</p>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedAudit(null);
                            handleOpenFindingLifecycle(f);
                          }}
                          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold transition cursor-pointer shrink-0"
                        >
                          Manage →
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenEditAuditModal(selectedAudit);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{t.audits.editAuditBtn}</span>
                </button>

                <button
                  onClick={() => {
                    setDeleteConfirmTarget({ type: 'audit', id: selectedAudit.id, title: selectedAudit.title });
                    setSelectedAudit(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.audits.deleteAuditBtn}</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedAudit(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EXPORT OFFICIAL AUDIT REPORT (FULL DETAILS & CAPA PROCESS)         */}
      {/* ========================================================================= */}
      {exportReportAudit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto print:p-0 print:shadow-none print:max-h-none">
            
            {/* Action Bar (Hidden on print) */}
            <div className="flex items-center justify-between border-b border-slate-300 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-900" />
                <span className="font-bold text-slate-800 text-sm">
                  Official Aviation Conformance & CAPA Audit Dossier
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t.audits.printReport}</span>
                </button>
                <button
                  onClick={() => setExportReportAudit(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div id="printable-audit-report" className="space-y-6 font-sans">
              
              {/* Document Header & Authority Branding */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-blue-900 font-black text-sm tracking-widest uppercase mb-1">
                    <Plane className="w-5 h-5 -rotate-45" />
                    <span>EMAAS Ground Handling · Marsa Alam Station (RMF)</span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    OFFICIAL STATION AUDIT & CAPA INVESTIGATION REPORT
                  </h1>
                  <p className="text-xs text-slate-600 font-semibold">
                    ICAO Doc 9859 Safety Management Manual & IATA ISAGO Conformance Documentation
                  </p>
                </div>

                <div className="text-right rtl:text-left font-mono text-xs text-slate-700 shrink-0">
                  <div>Audit Ref: <strong>{exportReportAudit.id}</strong></div>
                  <div>Report Date: <strong>{new Date().toISOString().split('T')[0]}</strong></div>
                  <div>Discipline: <strong>{exportReportAudit.discipline}</strong></div>
                  <div>Status: <span className="font-bold text-emerald-800 uppercase">{exportReportAudit.status}</span></div>
                </div>
              </div>

              {/* 1. Audit Overview Information */}
              <section className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
                  1. Audit Profile & Authority Details
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block">Audit Title</span>
                    <strong className="text-slate-900">{exportReportAudit.title}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Auditing Body</span>
                    <strong className="text-slate-900">{exportReportAudit.auditorOrganization}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Lead Auditor</span>
                    <strong className="text-slate-900">{exportReportAudit.leadAuditor}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Audit Dates</span>
                    <strong className="text-slate-900">{exportReportAudit.scheduledDate} {exportReportAudit.endDate ? `to ${exportReportAudit.endDate}` : ''}</strong>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-900 block">Scope Summary:</span>
                  <p>{exportReportAudit.scopeSummary}</p>
                  {exportReportAudit.executiveSummary && (
                    <div className="pt-1.5 border-t border-slate-200">
                      <span className="font-bold text-slate-900 block">Executive Summary:</span>
                      <p>{exportReportAudit.executiveSummary}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* 2. Audit Finding & Non-Conformance Metric Summary */}
              {(() => {
                const linkedFindings = findings.filter(f => f.auditId === exportReportAudit.id);
                const l1Count = linkedFindings.filter(f => f.level === 'level_1').length;
                const l2Count = linkedFindings.filter(f => f.level === 'level_2').length;
                const l3Count = linkedFindings.filter(f => f.level === 'level_3').length;
                const closedCount = linkedFindings.filter(f => f.lifecycleStatus === 'closed').length;
                const openCount = linkedFindings.length - closedCount;

                return (
                  <section className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
                      2. Non-Conformance Metrics & Classification Breakdown
                    </h3>
                    <div className="grid grid-cols-5 gap-2 text-center text-xs">
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                        <span className="text-slate-500 block text-[10px]">Total Findings</span>
                        <span className="text-lg font-bold font-mono text-slate-900">{linkedFindings.length}</span>
                      </div>
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-900">
                        <span className="block text-[10px] font-semibold">Major (Level 1)</span>
                        <span className="text-lg font-bold font-mono">{l1Count}</span>
                      </div>
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900">
                        <span className="block text-[10px] font-semibold">Minor (Level 2)</span>
                        <span className="text-lg font-bold font-mono">{l2Count}</span>
                      </div>
                      <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-blue-900">
                        <span className="block text-[10px] font-semibold">Observation (Level 3)</span>
                        <span className="text-lg font-bold font-mono">{l3Count}</span>
                      </div>
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-900">
                        <span className="block text-[10px] font-semibold">Closed & Verified</span>
                        <span className="text-lg font-bold font-mono">{closedCount} / {linkedFindings.length}</span>
                      </div>
                    </div>
                  </section>
                );
              })()}

              {/* 3. Detailed Findings & CAPA Investigation Dossiers */}
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
                  3. Comprehensive Finding Dossiers & CAPA Lifecycle Process
                </h3>

                {findings.filter(f => f.auditId === exportReportAudit.id).length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 text-center bg-slate-50 rounded">
                    No findings recorded for this audit. Full conformance verified.
                  </p>
                ) : (
                  findings.filter(f => f.auditId === exportReportAudit.id).map((f, idx) => {
                    const levelMeta = getLevelMetadata(f.level, language);
                    const overdue = getOverdueCalculation(f.targetClosureDate, f.lifecycleStatus === 'closed');
                    const statusMeta = getStatusMetadata(f.lifecycleStatus, language);

                    return (
                      <div key={f.id} className="border border-slate-300 rounded-lg p-4 bg-slate-50 space-y-3 text-xs page-break-inside-avoid">
                        {/* Finding Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              Finding #{idx + 1}: {f.id}
                            </span>
                            <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-300 font-mono">
                              Clause: {f.standardReference}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {levelMeta.levelCode} ({levelMeta.days} Days Window)
                            </span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white border border-slate-300">
                              {statusMeta.shortLabel}
                            </span>
                          </div>
                        </div>

                        {/* Finding Observation */}
                        <div>
                          <span className="font-bold text-slate-900 block">Non-Conformance Description:</span>
                          <p className="text-slate-800 leading-relaxed mt-0.5">{f.description}</p>
                        </div>

                        {/* S&Q Investigation & Initial Risk */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-2.5 rounded border border-slate-200">
                          <div>
                            <span className="font-bold text-slate-900 block">S&Q Investigation Notes:</span>
                            <p className="text-slate-700">{f.investigationSummary || 'Investigation confirmed non-conformance.'}</p>
                            {f.existingProcedures && f.existingProcedures.length > 0 && (
                              <div className="mt-1 text-[11px] text-slate-600">
                                Procedures: {f.existingProcedures.join(', ')}
                              </div>
                            )}
                          </div>

                          <div>
                            <span className="font-bold text-slate-900 block">Initial Risk Assessment:</span>
                            {f.preMitigationRisk ? (
                              <div className="font-mono text-slate-800 mt-0.5">
                                Risk Index: <strong>{f.preMitigationRisk.scoreCode}</strong> ({f.preMitigationRisk.level}) · Sev {f.preMitigationRisk.severity} × Prob {f.preMitigationRisk.likelihood}
                              </div>
                            ) : (
                              <span className="text-slate-500">Pending initial risk calculation</span>
                            )}
                            <div className="text-[11px] text-slate-600 mt-1">
                              Assigned HoD: <strong>{f.assignedHoD}</strong> · Target Due: <strong>{f.capaPlanDueDate || 'N/A'}</strong>
                            </div>
                          </div>
                        </div>

                        {/* HoD CAPA Plan & RCA */}
                        <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1.5">
                          <span className="font-bold text-slate-900 block">
                            CAPA Plan (Assigned HoD: {f.assignedHoD}):
                          </span>

                          {/* Root Cause */}
                          {f.rcaType === 'five_whys' && f.fiveWhysRca && f.fiveWhysRca.length > 0 ? (
                            <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded">
                              <span className="font-semibold block text-slate-900">5-Whys Root Cause Analysis:</span>
                              <ol className="list-decimal list-inside space-y-0.5 mt-1">
                                {f.fiveWhysRca.filter(Boolean).map((w, wi) => (
                                  <li key={wi}>{w}</li>
                                ))}
                              </ol>
                            </div>
                          ) : f.simpleRca ? (
                            <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded">
                              <span><strong>Direct Cause:</strong> {f.simpleRca.directCause}</span> · 
                              <span> <strong>Systemic Gap:</strong> {f.simpleRca.systemicGap}</span>
                            </div>
                          ) : null}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800 mt-1">
                            <div>
                              <strong className="text-blue-900 block">Immediate Corrective Action:</strong>
                              <p>{f.capa?.correctiveAction || f.capaProposal?.correctiveAction || 'Pending HoD proposal'}</p>
                            </div>
                            <div>
                              <strong className="text-emerald-900 block">Long-Term Preventive Action:</strong>
                              <p>{f.capa?.preventiveAction || f.capaProposal?.preventiveAction || 'Pending HoD proposal'}</p>
                            </div>
                          </div>
                        </div>

                        {/* SQM Plan Review & Effectiveness & Closure */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-2.5 rounded border border-slate-200">
                          <div>
                            <span className="font-bold text-slate-900 block">SQM Review & Effectiveness:</span>
                            <p className="text-slate-700">
                              {f.sqmPlanReviewDecision === 'approve' ? '✓ CAPA Plan Formally Approved by SQM' : 'Plan under review'}
                            </p>
                            {f.effectivenessEvaluation && (
                              <div className="text-[11px] text-slate-700 mt-1 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                                <strong>Effectiveness:</strong> {f.effectivenessEvaluation.isEffective ? 'VERIFIED EFFECTIVE' : 'NOT EFFECTIVE'}
                                <p>{f.effectivenessEvaluation.evaluationNotes}</p>
                              </div>
                            )}
                          </div>

                          <div>
                            <span className="font-bold text-slate-900 block">Residual Risk & Final Sign-off:</span>
                            {f.residualRisk && (
                              <div className="font-mono text-emerald-800">
                                Residual Risk Index: <strong>{f.residualRisk.scoreCode} ({f.residualRisk.level})</strong> · ALARP
                              </div>
                            )}
                            {f.finalSignoff ? (
                              <div className="text-[11px] text-slate-700 mt-1">
                                <div>Signed By: <strong>{f.finalSignoff.signedBy}</strong></div>
                                <div>Timestamp: <strong>{f.finalSignoff.signedAt}</strong></div>
                                <div className="font-mono text-[10px] text-slate-500">Hash: {f.finalSignoff.signatureHash}</div>
                              </div>
                            ) : (
                              <span className="text-amber-700 font-semibold text-[11px]">Pending Final SQM Sign-off</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </section>

              {/* 4. Formal Signatures Block */}
              <section className="pt-6 border-t-2 border-slate-900 space-y-4 page-break-inside-avoid">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  4. {t.audits.signaturesTitle}
                </h4>

                <div className="grid grid-cols-3 gap-6 text-xs text-slate-800">
                  <div className="border-t border-slate-400 pt-2 text-center space-y-1">
                    <div className="font-bold">{exportReportAudit.leadAuditor}</div>
                    <div className="text-slate-500 text-[10px]">Lead Auditor / Quality Inspector</div>
                    <div className="font-mono text-[9px] text-slate-400">Date: {exportReportAudit.scheduledDate}</div>
                  </div>

                  <div className="border-t border-slate-400 pt-2 text-center space-y-1">
                    <div className="font-bold">Capt. Sherif Nour</div>
                    <div className="text-slate-500 text-[10px]">Head of Department (HoD)</div>
                    <div className="font-mono text-[9px] text-slate-400">CAPA Accountability</div>
                  </div>

                  <div className="border-t border-slate-400 pt-2 text-center space-y-1">
                    <div className="font-bold">Dr. Khaled Fawzy</div>
                    <div className="text-slate-500 text-[10px]">Safety & Quality Manager (SQM)</div>
                    <div className="font-mono text-[9px] text-slate-400">Digital Seal & Final Sign-off</div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UNIFIED 8-STEP FINDING LIFECYCLE INVESTIGATION WIZARD             */}
      {/* ========================================================================= */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    {selectedFinding.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getDisciplineColor(selectedFinding.isagoDiscipline)}`}>
                    {selectedFinding.isagoDiscipline}
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {selectedFinding.standardReference}
                  </span>
                  {selectedFinding.level && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${getLevelMetadata(selectedFinding.level, language).badgeClass}`}>
                      {getLevelMetadata(selectedFinding.level, language).title}
                    </span>
                  )}
                  {selectedFinding.targetClosureDate && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${getOverdueCalculation(selectedFinding.targetClosureDate, selectedFinding.lifecycleStatus === 'closed').badgeClass}`}>
                      {getOverdueCalculation(selectedFinding.targetClosureDate, selectedFinding.lifecycleStatus === 'closed').statusText}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-slate-100">
                  {selectedFinding.title || selectedFinding.description}
                </h2>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>Linked Audit: <strong>{selectedFinding.auditTitle}</strong></span>
                  <span>•</span>
                  <span>Dept: <strong>{selectedFinding.assignedDepartment}</strong></span>
                </p>
              </div>

              <button
                onClick={() => setSelectedFinding(null)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
              <button
                onClick={() => setFindingModalTab('workflow')}
                className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  findingModalTab === 'workflow'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>8-Step Investigation & CAPA Wizard</span>
              </button>

              <button
                onClick={() => setFindingModalTab('auditTrail')}
                className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  findingModalTab === 'auditTrail'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Audit Trail History ({selectedFinding.auditTrail?.length || 0})</span>
              </button>

              <button
                onClick={() => setFindingModalTab('attachments')}
                className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  findingModalTab === 'attachments'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Evidence Attachments ({selectedFinding.attachments?.length || 0})</span>
              </button>
            </div>

            {/* TAB CONTENT 1: 8-STEP WORKFLOW WIZARD */}
            {findingModalTab === 'workflow' && (
              <div className="space-y-6">
                
                {/* 10-Step Visual Flow Stepper */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 overflow-x-auto">
                  <div className="flex items-center min-w-[720px] justify-between text-[11px]">
                    {[
                      { step: '1. Logged', status: 'submitted' },
                      { step: '2. Ack', status: 'acknowledged' },
                      { step: '3. Level Set', status: 'level_assigned' },
                      { step: '4. Investigated', status: 'plan_pending' },
                      { step: '5. Plan Sent', status: 'plan_under_review' },
                      { step: '6. Approved', status: 'effectiveness_pending' },
                      { step: '7. Effective', status: 'pending_signoff' },
                      { step: '8. Closed', status: 'closed' }
                    ].map((st, i) => {
                      const isCurrent = selectedFinding.lifecycleStatus === st.status || 
                        (st.status === 'plan_under_review' && selectedFinding.lifecycleStatus === 'plan_returned');
                      
                      return (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                            isCurrent
                              ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {i + 1}
                          </span>
                          <span className={`${isCurrent ? 'font-bold text-slate-100' : 'text-slate-400'}`}>
                            {st.step}
                          </span>
                          {i < 7 && <ChevronRight className="w-3 h-3 text-slate-600 mx-1" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Acknowledgment (S&Q) */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono text-[10px]">2</span>
                      <span>Step 2: S&Q Receipt Acknowledgment</span>
                    </h3>
                    {selectedFinding.acknowledgedAt && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Acknowledged by {selectedFinding.acknowledgedBy} at {selectedFinding.acknowledgedAt}
                      </span>
                    )}
                  </div>

                  {selectedFinding.lifecycleStatus === 'submitted' && (
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-slate-400">
                        Safety Officer or any S&Q member must confirm receipt before SQM Level classification.
                      </p>
                      <button
                        onClick={() => {
                          acknowledgeFinding(selectedFinding.id, activeRole === 'hod_safety' ? 'Dr. Khaled Fawzy (SQM)' : 'Mahmoud Ezz (Safety Officer)');
                          setSelectedFinding(prev => prev ? {
                            ...prev,
                            lifecycleStatus: 'acknowledged',
                            acknowledgedBy: activeRole === 'hod_safety' ? 'Dr. Khaled Fawzy' : 'Mahmoud Ezz',
                            acknowledgedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
                          } : null);
                        }}
                        disabled={!canUserPerformStep('acknowledge', activeRole)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          canUserPerformStep('acknowledge', activeRole)
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Acknowledge Receipt</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Step 3: Level Classification (SQM ONLY) */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono text-[10px]">3</span>
                      <span>Step 3: Level Classification (SQM Only - Mandated Target Closure Date)</span>
                    </h3>
                    {selectedFinding.level && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${getLevelMetadata(selectedFinding.level, language).badgeClass}`}>
                        {getLevelMetadata(selectedFinding.level, language).title} · Target: {selectedFinding.targetClosureDate}
                      </span>
                    )}
                  </div>

                  {selectedFinding.lifecycleStatus === 'acknowledged' && (
                    <div className="space-y-3 pt-2">
                      <p className="text-xs text-slate-400">
                        Safety & Quality Manager determines the finding level. Target closure date is automatically calculated from assignment date.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {[
                          { level: 'level_1', title: 'Major (Level 1)', days: '30 Days', desc: 'Critical non-conformance' },
                          { level: 'level_2', title: 'Minor (Level 2)', days: '60 Days', desc: 'Procedural variance' },
                          { level: 'level_3', title: 'Observation (Level 3)', days: '90 Days', desc: 'Continuous improvement' }
                        ].map(opt => (
                          <button
                            key={opt.level}
                            type="button"
                            onClick={() => setLevelClassification(opt.level as InvestigationLevel)}
                            className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                              levelClassification === opt.level
                                ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                          >
                            <div className="font-bold">{opt.title}</div>
                            <div className="text-[11px] text-blue-400 font-mono mt-0.5">{opt.days} Target Window</div>
                            <div className="text-[10px] text-slate-500 mt-1">{opt.desc}</div>
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs font-mono text-slate-400">
                          Calculated Target Date: <strong>{calculateTargetClosureDate(new Date().toISOString().split('T')[0], levelClassification)}</strong>
                        </div>

                        <button
                          onClick={() => {
                            assignFindingLevel(selectedFinding.id, levelClassification, levelComments, 'Dr. Khaled Fawzy (Safety & Quality Manager)');
                            const dateOnly = new Date().toISOString().split('T')[0];
                            const targetClosureDate = calculateTargetClosureDate(dateOnly, levelClassification);
                            setSelectedFinding(prev => prev ? {
                              ...prev,
                              lifecycleStatus: 'level_assigned',
                              level: levelClassification,
                              levelAssignedBy: 'Dr. Khaled Fawzy',
                              levelAssignedAt: dateOnly,
                              targetClosureDate
                            } : null);
                          }}
                          disabled={!canUserPerformStep('level', activeRole)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            canUserPerformStep('level', activeRole)
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Assign Level & Set Clock</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 4: S&Q Investigation & Initial Risk Matrix */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono text-[10px]">4</span>
                      <span>Step 4: Investigation & Initial Risk Index (S&Q)</span>
                    </h3>
                    {selectedFinding.preMitigationRisk && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${calculateRiskIndex(selectedFinding.preMitigationRisk.severity, selectedFinding.preMitigationRisk.likelihood).colorClass}`}>
                        Risk: {selectedFinding.preMitigationRisk.scoreCode} ({selectedFinding.preMitigationRisk.level})
                      </span>
                    )}
                  </div>

                  {(selectedFinding.lifecycleStatus === 'level_assigned' || selectedFinding.lifecycleStatus === 'plan_pending') && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Investigation Summary & Findings</label>
                        <textarea
                          value={invSummary}
                          onChange={(e) => setInvSummary(e.target.value)}
                          placeholder="Record detailed facts, witness interviews, equipment data, and environmental factors..."
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>

                      {/* Initial Risk Matrix (Probability x Severity) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Severity (1 Negligible → 5 Catastrophic)</label>
                          <select
                            value={preSev}
                            onChange={(e) => setPreSev(Number(e.target.value))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                          >
                            <option value={5}>5 - Catastrophic (Aircraft hull loss / fatality)</option>
                            <option value={4}>4 - Major (Aircraft structure damage / serious injury)</option>
                            <option value={3}>3 - Moderate (Minor aircraft damage / reportable incident)</option>
                            <option value={2}>2 - Minor (GSE dent / first aid injury)</option>
                            <option value={1}>1 - Negligible (Near miss / observation)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Likelihood (A Frequent → E Extremely Improbable)</label>
                          <select
                            value={preLike}
                            onChange={(e) => setPreLike(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                          >
                            <option value="A">A - Frequent (Likely to occur many times)</option>
                            <option value="B">B - Occasional (Likely to occur sometimes)</option>
                            <option value="C">C - Remote (Unlikely, but possible)</option>
                            <option value="D">D - Improbable (Very unlikely)</option>
                            <option value="E">E - Extremely Improbable (Almost inconceivable)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 flex items-center justify-between pt-1">
                          <span className="text-xs text-slate-400">
                            Calculated Risk Index: <strong className="font-mono text-slate-200">{preSev}{preLike}</strong>
                          </span>
                          <span className={`text-xs px-2.5 py-0.5 rounded font-bold ${calculateRiskIndex(preSev, preLike).colorClass}`}>
                            {calculateRiskIndex(preSev, preLike).label}
                          </span>
                        </div>
                      </div>

                      {/* Assign HoD and Due Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Assign Head of Department (HoD)</label>
                          <select
                            value={assignedHoD}
                            onChange={(e) => {
                              setAssignedHoD(e.target.value);
                              if (e.target.value.includes('Operations')) setAssignedHoDRole('hod_ops');
                              else if (e.target.value.includes('Maintenance')) setAssignedHoDRole('hod_maint');
                              else setAssignedHoDRole('hod_training');
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                          >
                            <option value="Capt. Sherif Nour (Head of Operations)">Capt. Sherif Nour (Head of Operations)</option>
                            <option value="Eng. Yasser Mostafa (Head of Maintenance)">Eng. Yasser Mostafa (Head of Maintenance)</option>
                            <option value="Reto Schneider (Safety Training Manager)">Reto Schneider (Head of Training)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-slate-400 block mb-1">CAPA Plan Due Date</label>
                          <input
                            type="date"
                            value={capaPlanDueDate}
                            onChange={(e) => setCapaPlanDueDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                          >
                          </input>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            const risk = calculateRiskIndex(preSev, preLike);
                            startOrUpdateFindingInvestigation(selectedFinding.id, {
                              investigationSummary: invSummary,
                              existingProcedures,
                              currentMitigations,
                              preMitigationRisk: {
                                severity: preSev,
                                likelihood: preLike,
                                scoreCode: `${preSev}${preLike}`,
                                level: risk.level
                              },
                              assignedHoD,
                              assignedHoDRole,
                              capaPlanDueDate
                            });
                            setSelectedFinding(prev => prev ? {
                              ...prev,
                              lifecycleStatus: 'plan_pending',
                              investigationSummary: invSummary,
                              assignedHoD,
                              assignedHoDRole,
                              capaPlanDueDate,
                              preMitigationRisk: {
                                severity: preSev,
                                likelihood: preLike,
                                scoreCode: `${preSev}${preLike}`,
                                level: risk.level
                              }
                            } : null);
                          }}
                          disabled={!canUserPerformStep('investigate', activeRole)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            canUserPerformStep('investigate', activeRole)
                              ? 'bg-amber-600 hover:bg-amber-500 text-white'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Save Investigation & Assign to HoD</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 5: CAPA Plan Submission (Assigned HoD) */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono text-[10px]">5</span>
                      <span>Step 5: CAPA Plan & Root Cause Analysis (Assigned HoD)</span>
                    </h3>
                    {selectedFinding.capa && (
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        Plan Status: {selectedFinding.capa.status.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {(selectedFinding.lifecycleStatus === 'plan_pending' || selectedFinding.lifecycleStatus === 'plan_returned') && (
                    <div className="space-y-3 pt-2">
                      {selectedFinding.lifecycleStatus === 'plan_returned' && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300">
                          <strong>Plan Returned by SQM:</strong> {selectedFinding.sqmPlanReviewComments || 'HoD must address SQM review directives and resubmit.'}
                        </div>
                      )}

                      {/* RCA Selection */}
                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 block">Root Cause Analysis Method</label>
                        <div className="flex gap-4 text-xs">
                          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                            <input
                              type="radio"
                              name="rca"
                              checked={rcaType === 'five_whys'}
                              onChange={() => setRcaType('five_whys')}
                            />
                            <span>5-Whys Methodology</span>
                          </label>
                          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                            <input
                              type="radio"
                              name="rca"
                              checked={rcaType === 'simple'}
                              onChange={() => setRcaType('simple')}
                            />
                            <span>Simple Root Cause (Direct / Contributing / Systemic)</span>
                          </label>
                        </div>
                      </div>

                      {rcaType === 'five_whys' ? (
                        <div className="space-y-1.5 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                          {fiveWhys.map((why, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-xs font-mono text-purple-400 w-14 shrink-0">Why {idx + 1}:</span>
                              <input
                                type="text"
                                value={why}
                                onChange={(e) => {
                                  const updated = [...fiveWhys];
                                  updated[idx] = e.target.value;
                                  setFiveWhys(updated);
                                }}
                                className="flex-1 bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-0.5">Direct Cause</label>
                            <input
                              type="text"
                              value={directCause}
                              onChange={(e) => setDirectCause(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-0.5">Contributing Factor</label>
                            <input
                              type="text"
                              value={contributing}
                              onChange={(e) => setContributing(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-0.5">Systemic Gap</label>
                            <input
                              type="text"
                              value={systemicGap}
                              onChange={(e) => setSystemicGap(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                            />
                          </div>
                        </div>
                      )}

                      {/* Corrective & Preventive Action Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-blue-400 block mb-1">
                            Immediate Corrective Action (Containment)
                          </label>
                          <textarea
                            value={corrective}
                            onChange={(e) => setCorrective(e.target.value)}
                            placeholder="Immediate actions to fix non-conformance..."
                            rows={2}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-emerald-400 block mb-1">
                            Long-Term Preventive Action (Prevent Recurrence)
                          </label>
                          <textarea
                            value={preventive}
                            onChange={(e) => setPreventive(e.target.value)}
                            placeholder="Systemic training, policy, equipment or software changes..."
                            rows={2}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            submitFindingCAPAPlan(selectedFinding.id, {
                              rcaType,
                              simpleRca: rcaType === 'simple' ? { directCause, contributingFactor: contributing, systemicGap } : undefined,
                              fiveWhysRca: rcaType === 'five_whys' ? fiveWhys : undefined,
                              correctiveAction: corrective,
                              preventiveAction: preventive
                            }, activeRole === 'hod_ops' ? 'Capt. Sherif Nour' : 'Head of Department');

                            setSelectedFinding(prev => prev ? {
                              ...prev,
                              lifecycleStatus: 'plan_under_review',
                              rcaType,
                              capa: {
                                correctiveAction: corrective,
                                preventiveAction: preventive,
                                assignedDepartment: prev.assignedDepartment,
                                assignedManager: 'HoD',
                                targetDate: prev.capaPlanDueDate || '',
                                status: 'submitted'
                              }
                            } : null);
                          }}
                          disabled={!canUserPerformStep('submit_capa', activeRole)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            canUserPerformStep('submit_capa', activeRole)
                              ? 'bg-purple-600 hover:bg-purple-500 text-white'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Submit CAPA Plan for SQM Approval</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 6: SQM Plan Review (Approve or Return) */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-[10px]">6</span>
                      <span>Step 6: Plan Review (SQM Only)</span>
                    </h3>
                    {selectedFinding.sqmPlanReviewDecision && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        selectedFinding.sqmPlanReviewDecision === 'approve'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        Decision: {selectedFinding.sqmPlanReviewDecision.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {selectedFinding.lifecycleStatus === 'plan_under_review' && (
                    <div className="space-y-3 pt-2">
                      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5">
                        <span className="font-bold text-slate-300 block">Submitted Actions for Review:</span>
                        <p><strong>Corrective:</strong> {selectedFinding.capa?.correctiveAction || selectedFinding.capaProposal?.correctiveAction}</p>
                        <p><strong>Preventive:</strong> {selectedFinding.capa?.preventiveAction || selectedFinding.capaProposal?.preventiveAction}</p>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1">SQM Review Comments / Directives</label>
                        <textarea
                          value={sqmReviewComments}
                          onChange={(e) => setSqmReviewComments(e.target.value)}
                          placeholder="Provide approval justification or revision directives..."
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => {
                            reviewFindingCAPAPlan(selectedFinding.id, 'return', sqmReviewComments, 'Dr. Khaled Fawzy (SQM)');
                            setSelectedFinding(prev => prev ? {
                              ...prev,
                              lifecycleStatus: 'plan_returned',
                              sqmPlanReviewDecision: 'return',
                              sqmPlanReviewComments: sqmReviewComments
                            } : null);
                          }}
                          disabled={!canUserPerformStep('review_capa', activeRole)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            canUserPerformStep('review_capa', activeRole)
                              ? 'bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Return for Revision</span>
                        </button>

                        <button
                          onClick={() => {
                            reviewFindingCAPAPlan(selectedFinding.id, 'approve', sqmReviewComments, 'Dr. Khaled Fawzy (SQM)');
                            setSelectedFinding(prev => prev ? {
                              ...prev,
                              lifecycleStatus: 'effectiveness_pending',
                              sqmPlanReviewDecision: 'approve',
                              sqmPlanReviewComments: sqmReviewComments
                            } : null);
                          }}
                          disabled={!canUserPerformStep('review_capa', activeRole)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            canUserPerformStep('review_capa', activeRole)
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve CAPA Plan</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 7: Effectiveness Evaluation & Residual Risk Matrix (S&Q) */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono text-[10px]">7</span>
                      <span>Step 7: Effectiveness & Residual Risk Index (S&Q)</span>
                    </h3>
                    {selectedFinding.residualRisk && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${calculateRiskIndex(selectedFinding.residualRisk.severity, selectedFinding.residualRisk.likelihood).colorClass}`}>
                        Residual Risk: {selectedFinding.residualRisk.scoreCode} ({selectedFinding.residualRisk.level})
                      </span>
                    )}
                  </div>

                  {(selectedFinding.lifecycleStatus === 'effectiveness_pending' || selectedFinding.lifecycleStatus === 'plan_approved') && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Effectiveness Evaluation Notes & Audit Evidence</label>
                        <textarea
                          value={effectivenessNotes}
                          onChange={(e) => setEffectivenessNotes(e.target.value)}
                          placeholder="Record verification audit results, operational samples, and field observations..."
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>

                      {/* Residual Risk Matrix (Severity x Likelihood) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Residual Severity (After CAPA)</label>
                          <select
                            value={postSev}
                            onChange={(e) => setPostSev(Number(e.target.value))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                          >
                            <option value={1}>1 - Negligible (Near zero impact)</option>
                            <option value={2}>2 - Minor (Inconvenience)</option>
                            <option value={3}>3 - Moderate</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Residual Likelihood (After CAPA)</label>
                          <select
                            value={postLike}
                            onChange={(e) => setPostLike(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                          >
                            <option value="E">E - Extremely Improbable</option>
                            <option value="D">D - Improbable</option>
                            <option value="C">C - Remote</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 flex items-center justify-between pt-1">
                          <span className="text-xs text-slate-400">
                            Residual Risk Index: <strong className="font-mono text-slate-200">{postSev}{postLike}</strong>
                          </span>
                          <span className={`text-xs px-2.5 py-0.5 rounded font-bold ${calculateRiskIndex(postSev, postLike).colorClass}`}>
                            {calculateRiskIndex(postSev, postLike).label}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            const resRisk = calculateRiskIndex(postSev, postLike);
                            recordFindingEffectiveness(selectedFinding.id, {
                              isEffective,
                              evaluationNotes: effectivenessNotes,
                              residualRisk: {
                                severity: postSev,
                                likelihood: postLike,
                                scoreCode: `${postSev}${postLike}`,
                                level: resRisk.level
                              }
                            }, 'Mahmoud Ezz (Safety Officer)');

                            setSelectedFinding(prev => prev ? {
                              ...prev,
                              lifecycleStatus: 'pending_signoff',
                              residualRisk: {
                                severity: postSev,
                                likelihood: postLike,
                                scoreCode: `${postSev}${postLike}`,
                                level: resRisk.level
                              },
                              effectivenessEvaluation: {
                                evaluatedBy: 'Mahmoud Ezz',
                                evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                                isEffective,
                                evaluationNotes: effectivenessNotes
                              }
                            } : null);
                          }}
                          disabled={!canUserPerformStep('effectiveness', activeRole)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            canUserPerformStep('effectiveness', activeRole)
                              ? 'bg-teal-600 hover:bg-teal-500 text-white'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Record Effectiveness & Request SQM Sign-off</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 8: Final Sign-off & Case Closure (SQM ONLY) */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-[10px]">8</span>
                      <span>Step 8: Final Sign-off & Closure (SQM Only)</span>
                    </h3>
                    {selectedFinding.finalSignoff && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Digitally Signed by SQM
                      </span>
                    )}
                  </div>

                  {selectedFinding.lifecycleStatus === 'pending_signoff' && (
                    <div className="space-y-3 pt-2">
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
                        <strong>Ready for Final Closure:</strong> All corrective and preventive actions, effectiveness evaluation, and residual risk (ALARP) are complete.
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Final Closure Notes</label>
                        <input
                          type="text"
                          value={closureNotes}
                          onChange={(e) => setClosureNotes(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            finalSignoffAndCloseFinding(selectedFinding.id, closureNotes, 'Dr. Khaled Fawzy (Safety & Quality Manager)');
                            const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
                            const signatureHash = `RMF-DSIG-AUD-${Math.random().toString(36).substring(2, 8).toUpperCase()}-ICAO-SMS`;
                            setSelectedFinding(prev => prev ? {
                              ...prev,
                              lifecycleStatus: 'closed',
                              closedBy: 'Dr. Khaled Fawzy',
                              closedAt: timestamp,
                              closureNotes,
                              finalSignoff: {
                                signedBy: 'Dr. Khaled Fawzy',
                                signedAt: timestamp,
                                comments: closureNotes,
                                signatureHash
                              }
                            } : null);
                          }}
                          disabled={!canUserPerformStep('final_signoff', activeRole)}
                          className={`px-5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                            canUserPerformStep('final_signoff', activeRole)
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <FileCheck className="w-4 h-4" />
                          <span>Approve & Digitally Sign Off Finding Closure</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedFinding.lifecycleStatus === 'closed' && selectedFinding.finalSignoff && (
                    <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle className="w-4 h-4" />
                        <span>Case Formally Closed & Digitally Signed</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div>Sign-off Authority: <strong>{selectedFinding.finalSignoff.signedBy}</strong></div>
                        <div>Closed At: <strong>{selectedFinding.finalSignoff.signedAt}</strong></div>
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800">
                        Cryptographic Digital Hash: {selectedFinding.finalSignoff.signatureHash}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: AUDIT TRAIL HISTORY */}
            {findingModalTab === 'auditTrail' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Complete Immutable Audit Trail Log
                </h3>

                <div className="space-y-2.5">
                  {(selectedFinding.auditTrail || []).map((entry, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/40 rounded-lg border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-bold text-slate-200">{entry.action}</span>
                        <span className="font-mono text-[10px]">{entry.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        By: <span className="font-semibold text-blue-400">{entry.actorName}</span> ({entry.actorRole})
                      </div>
                      {entry.details && (
                        <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2 rounded border border-slate-800/80">
                          {entry.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: EVIDENCE ATTACHMENTS */}
            {findingModalTab === 'attachments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Uploaded Verification Files & Documents
                  </h3>
                </div>

                {/* Upload Form Simulation */}
                <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="Enter file name (e.g. Turnaround_Chock_Audit_Photos.pdf)..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                  <select
                    value={newFileCategory}
                    onChange={(e) => setNewFileCategory(e.target.value as FileAttachment['category'])}
                    className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="investigation">Investigation Evidence</option>
                    <option value="capa_plan">CAPA Plan / Proof</option>
                    <option value="effectiveness">Effectiveness Verification</option>
                  </select>
                  <button
                    onClick={() => {
                      if (!newFileName.trim()) return;
                      addFindingAttachment(selectedFinding.id, {
                        fileName: newFileName,
                        fileSize: '1.2 MB',
                        fileType: 'application/pdf',
                        category: newFileCategory
                      });
                      setNewFileName('');
                    }}
                    className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    Attach
                  </button>
                </div>

                <div className="space-y-2">
                  {(selectedFinding.attachments || []).map((att, idx) => (
                    <div key={idx} className="p-3 bg-slate-800/60 rounded-lg border border-slate-700 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="font-semibold text-slate-200">{att.fileName}</div>
                          <div className="text-[10px] text-slate-400">
                            {att.fileSize} · Uploaded by {att.uploadedBy} at {att.uploadedAt}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono capitalize">
                        {att.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT AUDIT (CRUD)                                            */}
      {/* ========================================================================= */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-400" />
                <span>{editingAudit ? 'Edit Audit Schedule' : 'Schedule New Audit'}</span>
              </h3>
              <button
                onClick={() => setShowAuditModal(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAuditForm} className="space-y-3.5 text-xs">
              {/* Quick Load from Checklist Template Selector */}
              <div className="p-3 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-indigo-300 font-bold flex items-center gap-1.5 text-xs">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>⚡ Quick Load from Checklist Template</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Pre-fills scope & checklist standards</span>
                </div>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const tpl = auditTemplates.find(t => t.id === e.target.value);
                    if (tpl) {
                      setAuditFormTitle(tpl.title);
                      if (tpl.titleAr) setAuditFormTitleAr(tpl.titleAr);
                      setAuditFormType(tpl.auditType);
                      setAuditFormDiscipline(tpl.discipline);
                      setAuditFormCriteria(tpl.standardFramework);
                      setAuditFormScope(tpl.scopeSummary);
                      setAuditFormDepartment(tpl.department);
                      if (tpl.leadAuditorRole) setAuditFormLeadAuditor(tpl.leadAuditorRole);
                      if (tpl.auditType === 'internal') {
                        setAuditFormAuditorOrg('EMAAS Safety & Quality Department');
                      } else {
                        setAuditFormAuditorOrg(tpl.standardFramework.includes('ISAGO') ? 'IATA ISAGO Lead Audit Team' : 'Egyptian Civil Aviation Authority (ECAA)');
                      }
                    }
                  }}
                  className="w-full bg-slate-950 border border-indigo-500/40 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-400"
                >
                  <option value="">-- Choose Reusable ISAGO / IGOM Template --</option>
                  {auditTemplates.map(t => (
                    <option key={t.id} value={t.id}>
                      [{t.discipline}] {t.title} ({t.items?.length || 0} questions · {t.standardFramework})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Audit Title (English)</label>
                <input
                  type="text"
                  required
                  value={auditFormTitle}
                  onChange={(e) => setAuditFormTitle(e.target.value)}
                  placeholder="e.g. IATA ISAGO Station Conformance Recertification"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Audit Title (Arabic - Optional)</label>
                <input
                  type="text"
                  value={auditFormTitleAr}
                  onChange={(e) => setAuditFormTitleAr(e.target.value)}
                  placeholder="مراجعة تجديد اعتماد إيزاجو الدولية بالمحطة"
                  dir="rtl"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Audit Type</label>
                  <select
                    value={auditFormType}
                    onChange={(e) => setAuditFormType(e.target.value as AuditType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                  >
                    <option value="internal">Internal Station Audit</option>
                    <option value="external">External Audit (Airline / ECAA / ISAGO)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Discipline</label>
                  <select
                    value={auditFormDiscipline}
                    onChange={(e) => setAuditFormDiscipline(e.target.value as AuditDiscipline)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                  >
                    <option value="ORM">ORM - Organization & Management</option>
                    <option value="RMP">RMP - Ramp Services</option>
                    <option value="PAX">PAX - Passenger Handling</option>
                    <option value="LOD">LOD - Load Control</option>
                    <option value="BAG">BAG - Baggage Handling</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Auditing Organization / Carrier</label>
                  <input
                    type="text"
                    required
                    value={auditFormAuditorOrg}
                    onChange={(e) => setAuditFormAuditorOrg(e.target.value)}
                    placeholder="e.g. IATA ISAGO Audit Team"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Lead Auditor</label>
                  <input
                    type="text"
                    required
                    value={auditFormLeadAuditor}
                    onChange={(e) => setAuditFormLeadAuditor(e.target.value)}
                    placeholder="e.g. Capt. Jean-Luc Moreau"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Scheduled Start Date</label>
                  <input
                    type="date"
                    required
                    value={auditFormScheduledDate}
                    onChange={(e) => setAuditFormScheduledDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">End Date</label>
                  <input
                    type="date"
                    value={auditFormEndDate}
                    onChange={(e) => setAuditFormEndDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Status</label>
                  <select
                    value={auditFormStatus}
                    onChange={(e) => setAuditFormStatus(e.target.value as AuditScheduleItem['status'])}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Audit Scope Summary</label>
                <textarea
                  value={auditFormScope}
                  onChange={(e) => setAuditFormScope(e.target.value)}
                  placeholder="Describe the scope, flight samples, station areas, and checklists covered..."
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {editingAudit ? 'Update Audit' : 'Schedule Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW FINDING FOR AUDIT (OR STANDALONE)                          */}
      {/* ========================================================================= */}
      {showNewFindingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span>Log New Audit Finding</span>
              </h3>
              <button
                onClick={() => setShowNewFindingModal(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewFinding} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Linked Audit (Optional / Recommended)</label>
                <select
                  value={newFindingAuditId}
                  onChange={(e) => {
                    setNewFindingAuditId(e.target.value);
                    const found = auditSchedule.find(a => a.id === e.target.value);
                    if (found) {
                      setNewFindingDiscipline(found.discipline);
                      setNewFindingDept(found.department || 'Operations - Ramp Services');
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                >
                  <option value="">Standalone Quality / Safety Inspection</option>
                  {auditSchedule.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.id} - {a.title} ({a.auditorOrganization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Standard Reference Clause</label>
                  <input
                    type="text"
                    required
                    value={newFindingStandardRef}
                    onChange={(e) => setNewFindingStandardRef(e.target.value)}
                    placeholder="e.g. IGOM 4.1.2 or ISAGO RMP 2.3"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Discipline</label>
                  <select
                    value={newFindingDiscipline}
                    onChange={(e) => setNewFindingDiscipline(e.target.value as AuditDiscipline)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="ORM">ORM - Organization</option>
                    <option value="RMP">RMP - Ramp Services</option>
                    <option value="PAX">PAX - Passenger</option>
                    <option value="LOD">LOD - Load Control</option>
                    <option value="BAG">BAG - Baggage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Finding Title</label>
                <input
                  type="text"
                  required
                  value={newFindingTitle}
                  onChange={(e) => setNewFindingTitle(e.target.value)}
                  placeholder="e.g. Unapproved Chocks Deployed on Stand 4"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Non-Conformance Detailed Description</label>
                <textarea
                  required
                  value={newFindingDesc}
                  onChange={(e) => setNewFindingDesc(e.target.value)}
                  placeholder="Detailed non-conformance observation, affected equipment/flight, and conditions..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Location / Stand</label>
                  <input
                    type="text"
                    value={newFindingLocation}
                    onChange={(e) => setNewFindingLocation(e.target.value)}
                    placeholder="Stand 4 Main Landing Gear"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Department Responsible</label>
                  <select
                    value={newFindingDept}
                    onChange={(e) => setNewFindingDept(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Operations - Ramp Services">Operations - Ramp Services</option>
                    <option value="Maintenance - GSE Fleet">Maintenance - GSE Fleet</option>
                    <option value="Passenger Handling">Passenger Handling</option>
                    <option value="Quality & Safety">Quality & Safety</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewFindingModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/30 cursor-pointer"
                >
                  Create & Launch Investigation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW TEMPLATE CHECKLIST DETAILS                                    */}
      {/* ========================================================================= */}
      {selectedTemplateForView && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                    {selectedTemplateForView.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getDisciplineColor(selectedTemplateForView.discipline)}`}>
                    {selectedTemplateForView.discipline}
                  </span>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {selectedTemplateForView.standardFramework}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {selectedTemplateForView.auditType}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-100">
                  {language === 'ar' && selectedTemplateForView.titleAr ? selectedTemplateForView.titleAr : selectedTemplateForView.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Department: <strong className="text-slate-300">{selectedTemplateForView.department}</strong> · Estimated Duration: <strong className="text-slate-300">{selectedTemplateForView.estimatedHours || 8} hrs</strong> · Lead Role: <strong className="text-slate-300">{selectedTemplateForView.leadAuditorRole || 'Lead Auditor'}</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedTemplateForView(null)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scope Summary */}
            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block font-semibold mb-1 uppercase tracking-wider text-[10px]">Scope & Focus Description:</span>
              <p className="text-slate-300 leading-relaxed">{selectedTemplateForView.scopeSummary}</p>
            </div>

            {/* Checklist Items Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-emerald-400" />
                  <span>Configured Conformance Criteria ({selectedTemplateForView.items?.length || 0} items)</span>
                </h3>
                <span className="text-xs text-slate-400">All criteria follow IATA ISAGO GOSM standards</span>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {(selectedTemplateForView.items || []).map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/70 text-xs space-y-1.5 hover:border-slate-600 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-slate-400 font-mono text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
                          {item.code}
                        </span>
                        <span className="font-semibold text-slate-200 text-xs">
                          {item.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                          {item.category}
                        </span>
                        {item.mandatory && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                            MANDATORY
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-300 font-medium pl-7">
                      {item.question}
                    </p>

                    {item.guidanceNotes && (
                      <div className="pl-7 text-[11px] text-slate-400 flex items-start gap-1.5 italic">
                        <span className="font-semibold not-italic text-slate-500">Guidance:</span>
                        <span>{item.guidanceNotes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <button
                onClick={() => setSelectedTemplateForView(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>

              <button
                onClick={() => {
                  const tpl = selectedTemplateForView;
                  setSelectedTemplateForView(null);
                  handleScheduleFromTemplate(tpl);
                }}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 cursor-pointer flex items-center gap-2"
              >
                <span>⚡ Schedule Station Audit with this Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT AUDIT TEMPLATE (WITH CHECKLIST BUILDER)              */}
      {/* ========================================================================= */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>{editingTemplate ? 'Edit Audit Template' : 'Create New Checklist Template'}</span>
              </h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
              {/* Template Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Template Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={tplFormTitle}
                    onChange={(e) => setTplFormTitle(e.target.value)}
                    placeholder="e.g. IATA ISAGO RMP — Apron Ramp Safety"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Template Title (Arabic)</label>
                  <input
                    type="text"
                    value={tplFormTitleAr}
                    onChange={(e) => setTplFormTitleAr(e.target.value)}
                    placeholder="مثال: اياتا ايساجو - سلامة ساحة الطيران"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none text-right rtl:text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Discipline *</label>
                  <select
                    value={tplFormDiscipline}
                    onChange={(e) => setTplFormDiscipline(e.target.value as AuditDiscipline)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="ORM">ORM - Organization & Safety Mgmt</option>
                    <option value="RMP">RMP - Ramp & Aircraft Servicing</option>
                    <option value="PAX">PAX - Passenger Handling</option>
                    <option value="LOD">LOD - Load Control & Dispatch</option>
                    <option value="BAG">BAG - Baggage Handling</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Audit Type</label>
                  <select
                    value={tplFormAuditType}
                    onChange={(e) => setTplFormAuditType(e.target.value as AuditType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="internal">Internal Quality Inspection</option>
                    <option value="isago">IATA ISAGO Standard</option>
                    <option value="regulatory">Regulatory (ECAA)</option>
                    <option value="airline">Airline Customer Audit</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Estimated Duration (Hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={80}
                    value={tplFormHours}
                    onChange={(e) => setTplFormHours(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Standard Conformance Framework *</label>
                  <input
                    type="text"
                    required
                    value={tplFormFramework}
                    onChange={(e) => setTplFormFramework(e.target.value)}
                    placeholder="e.g. IATA ISAGO GOSM 14th Edition or IGOM Ed 14"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Responsible Department</label>
                  <select
                    value={tplFormDepartment}
                    onChange={(e) => setTplFormDepartment(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Operations - Ramp Services">Operations - Ramp Services</option>
                    <option value="Maintenance - GSE Fleet">Maintenance - GSE Fleet</option>
                    <option value="Passenger Handling & Dispatch">Passenger Handling & Dispatch</option>
                    <option value="Quality & Safety">Quality & Safety</option>
                    <option value="Load Control & Flight Ops">Load Control & Flight Ops</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Scope Summary Description *</label>
                <textarea
                  required
                  rows={2}
                  value={tplFormScope}
                  onChange={(e) => setTplFormScope(e.target.value)}
                  placeholder="Describe the scope, flight density covered, station areas, and conformance objectives..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                />
              </div>

              {/* Checklist Criteria Builder Section */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-emerald-400" />
                    <span>Checklist Criteria Items ({tplFormItems.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Add recurring test criteria questions below</span>
                </div>

                {/* Sub-form: Add Criteria Item */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2.5">
                  <span className="text-[11px] font-bold text-indigo-400 block">Add New Conformance Criterion:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <input
                        type="text"
                        value={newCheckCode}
                        onChange={(e) => setNewCheckCode(e.target.value)}
                        placeholder="Ref Code (e.g. ISAGO RMP 2.3.1)"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={newCheckTitle}
                        onChange={(e) => setNewCheckTitle(e.target.value)}
                        placeholder="Title (e.g. Chock Clearance)"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                      />
                    </div>
                    <div>
                      <select
                        value={newCheckCategory}
                        onChange={(e) => setNewCheckCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                      >
                        <option value="Safety Conformance">Safety Conformance</option>
                        <option value="Equipment & GSE">Equipment & GSE</option>
                        <option value="Airside Marshalling">Airside Marshalling</option>
                        <option value="Fueling Safety">Fueling Safety</option>
                        <option value="Passenger & Baggage">Passenger & Baggage</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={newCheckQuestion}
                      onChange={(e) => setNewCheckQuestion(e.target.value)}
                      placeholder="Audit Verification Question (e.g. Are approved rubber chocks deployed immediately upon engine shutdown?)"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <input
                      type="text"
                      value={newCheckGuidance}
                      onChange={(e) => setNewCheckGuidance(e.target.value)}
                      placeholder="Optional Guidance notes or required physical evidence..."
                      className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                    />

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-slate-300 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newCheckMandatory}
                          onChange={(e) => setNewCheckMandatory(e.target.checked)}
                          className="rounded bg-slate-900 text-indigo-600"
                        />
                        <span>Mandatory</span>
                      </label>

                      <button
                        type="button"
                        onClick={handleAddChecklistItemToTemplate}
                        className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow"
                      >
                        + Add Question
                      </button>
                    </div>
                  </div>
                </div>

                {/* Current Items List */}
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                  {tplFormItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5 truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-indigo-400 font-bold">{item.code}</span>
                          <span className="font-semibold text-slate-200">{item.title}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400">{item.category}</span>
                          {item.mandatory && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-red-500/20 text-red-400 font-bold">MANDATORY</span>
                          )}
                        </div>
                        <p className="text-slate-400 text-[11px] truncate">{item.question}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistItemFromTemplate(item.id)}
                        className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition cursor-pointer"
                        title="Remove question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  {editingTemplate ? 'Update Template' : 'Save & Publish Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                                */}
      {/* ========================================================================= */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-100">
                Confirm Deletion
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete {deleteConfirmTarget.type === 'audit' ? 'Audit' : deleteConfirmTarget.type === 'template' ? 'Checklist Template' : 'Finding'}{' '}
              <strong className="text-white">"{deleteConfirmTarget.title}"</strong> ({deleteConfirmTarget.id})? This action will remove all associated logs and cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmTarget.type === 'audit') {
                    deleteAuditScheduleItem(deleteConfirmTarget.id);
                  } else if (deleteConfirmTarget.type === 'template') {
                    deleteAuditTemplate(deleteConfirmTarget.id);
                  } else {
                    deleteFinding(deleteConfirmTarget.id);
                  }
                  setDeleteConfirmTarget(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
