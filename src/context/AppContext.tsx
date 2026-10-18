import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Language, 
  ThemeMode, 
  StationRole, 
  SafetyReport, 
  AuditScheduleItem, 
  AuditFinding, 
  SPIItem, 
  SafetyBulletin, 
  ManagementOfChange, 
  GSEVehicle, 
  StaffTrainingRecord, 
  UserRecord, 
  DepartmentConfig, 
  RolePermissions,
  ManagementReviewSelections,
  RiskAssessment,
  SimpleRCA,
  CAPAItem,
  SafetyReportFormConfig,
  InvestigationLevel,
  SQMSNotification,
  FileAttachment,
  AuditTrailEntry,
  ReportLifecycleStatus,
  AuditTemplate,
  StaffCourse,
  RoleDefinition
} from '../types/index.ts';
import {
  INITIAL_REPORTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_SCHEDULE,
  INITIAL_FINDINGS,
  INITIAL_SPIS,
  INITIAL_BULLETINS,
  INITIAL_MOCS,
  INITIAL_GSE,
  INITIAL_TRAINING,
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_ROLES,
  INITIAL_FORM_CONFIG,
  INITIAL_AUDIT_TEMPLATES,
  DEFAULT_ROLE_PERMISSIONS
} from './initialData.ts';
import { calculateTargetClosureDate, getLevelDays } from '../utils/workflowHelpers.ts';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  activeRole: StationRole;
  setActiveRole: (role: StationRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  isViewPermitted: (viewId: string, role?: StationRole) => boolean;

  // Safety Form Configuration (Admin)
  safetyFormConfig: SafetyReportFormConfig;
  updateSafetyFormConfig: (config: Partial<SafetyReportFormConfig>) => void;
  resetSafetyFormConfig: () => void;
  
  // Safety Reports (Strict 8-Step Lifecycle)
  reports: SafetyReport[];
  addSafetyReport: (report: Omit<SafetyReport, 'id' | 'timestamp' | 'lifecycleStatus' | 'auditTrail' | 'attachments'>) => SafetyReport;
  acknowledgeReport: (id: string, actorName?: string) => void;
  assignReportLevel: (id: string, level: InvestigationLevel, comments?: string, actorName?: string) => void;
  startOrUpdateInvestigation: (
    id: string, 
    payload: {
      investigationSummary: string;
      existingProcedures: string[];
      currentMitigations: string;
      preMitigationRisk: RiskAssessment;
      assignedHoD: string;
      assignedHoDRole: StationRole;
      capaPlanDueDate: string;
    },
    actorName?: string
  ) => void;
  submitCAPAPlan: (
    id: string, 
    payload: {
      rcaType: 'simple' | 'five_whys';
      simpleRca?: SimpleRCA;
      fiveWhysRca?: string[];
      correctiveAction: string;
      preventiveAction: string;
      attachmentName?: string;
    },
    actorName?: string
  ) => void;
  reviewCAPAPlan: (
    id: string, 
    decision: 'approve' | 'return', 
    comments: string, 
    actorName?: string
  ) => void;
  recordEffectiveness: (
    id: string, 
    payload: {
      isEffective: boolean;
      evaluationNotes: string;
      residualRisk: RiskAssessment;
      evidenceSummary?: string;
      attachmentName?: string;
    },
    actorName?: string
  ) => void;
  finalSignoffAndClose: (
    id: string, 
    comments?: string, 
    actorName?: string
  ) => void;
  addReportAttachment: (
    id: string,
    file: { fileName: string; fileSize: string; fileType: string; category: FileAttachment['category'] }
  ) => void;
  issueBulletinFromReport: (reportId: string, title: string, titleAr: string, summary: string, actions: string[]) => SafetyBulletin;

  // Backwards-compatible aliases for existing components
  updateInvestigation: (id: string, summary: string) => void;
  setPreMitigationRisk: (id: string, risk: RiskAssessment) => void;
  setReportRCA: (id: string, rcaType: 'simple' | 'five_whys', simpleRca?: SimpleRCA, fiveWhys?: string[]) => void;
  setReportCAPA: (id: string, capa: CAPAItem) => void;
  markReportCAPAImplemented: (id: string) => void;
  setPostMitigationRisk: (id: string, risk: RiskAssessment) => void;
  closeSafetyReport: (id: string, closedBy: string, notes: string) => void;

  // Notifications
  notifications: SQMSNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  addNotification: (notif: Omit<SQMSNotification, 'id' | 'timestamp' | 'isRead'>) => void;

  // Audits & Findings (Full CRUD & Unified 8-Step Lifecycle)
  auditSchedule: AuditScheduleItem[];
  findings: AuditFinding[];
  addAuditScheduleItem: (audit: Omit<AuditScheduleItem, 'id' | 'findingsCount'>) => AuditScheduleItem;
  updateAuditScheduleItem: (id: string, updated: Partial<AuditScheduleItem>) => void;
  deleteAuditScheduleItem: (id: string) => void;
  addFinding: (finding: Omit<AuditFinding, 'id' | 'lifecycleStatus' | 'auditTrail' | 'attachments'>) => AuditFinding;
  updateFinding: (id: string, updated: Partial<AuditFinding>) => void;
  deleteFinding: (id: string) => void;
  acknowledgeFinding: (findingId: string, actorName?: string) => void;
  assignFindingLevel: (findingId: string, level: InvestigationLevel, comments?: string, actorName?: string) => void;
  startOrUpdateFindingInvestigation: (
    findingId: string, 
    payload: {
      investigationSummary: string;
      existingProcedures: string[];
      currentMitigations: string;
      preMitigationRisk: RiskAssessment;
      assignedHoD: string;
      assignedHoDRole: StationRole;
      capaPlanDueDate: string;
    },
    actorName?: string
  ) => void;
  submitFindingCAPAPlan: (
    findingId: string, 
    payload: {
      rcaType: 'simple' | 'five_whys';
      simpleRca?: SimpleRCA;
      fiveWhysRca?: string[];
      correctiveAction: string;
      preventiveAction: string;
      attachmentName?: string;
    },
    actorName?: string
  ) => void;
  reviewFindingCAPAPlan: (
    findingId: string, 
    decision: 'approve' | 'return', 
    comments: string, 
    actorName?: string
  ) => void;
  recordFindingEffectiveness: (
    findingId: string, 
    payload: {
      isEffective: boolean;
      evaluationNotes: string;
      residualRisk: RiskAssessment;
      evidenceSummary?: string;
      attachmentName?: string;
    },
    actorName?: string
  ) => void;
  finalSignoffAndCloseFinding: (
    findingId: string, 
    comments?: string, 
    actorName?: string
  ) => void;
  addFindingAttachment: (
    findingId: string,
    file: { fileName: string; fileSize: string; fileType: string; category: FileAttachment['category'] }
  ) => void;
  proposeFindingCAPA: (findingId: string, corrective: string, preventive: string, targetDate: string, rcaMethod: 'simple' | 'five_whys', simpleRca?: SimpleRCA, fiveWhys?: string[]) => void;
  approveFindingCAPA: (findingId: string, approverName: string, comments: string) => void;
  submitFindingEvidence: (findingId: string, notes: string, docRef: string) => void;
  verifyCloseFinding: (findingId: string, verifierName: string, notes: string) => void;
  issueNoticeFromFinding: (findingId: string, title: string, titleAr: string, summary: string, actions: string[]) => SafetyBulletin;

  // SPI / SPT
  spis: SPIItem[];
  addSPI: (spi: Omit<SPIItem, 'id' | 'lastUpdated'>) => void;
  updateSPI: (id: string, updated: Partial<SPIItem>) => void;
  deleteSPI: (id: string) => void;
  logSPIReading: (id: string, value: number, period?: string, turnsCount?: number, notes?: string) => void;

  // Bulletins
  bulletins: SafetyBulletin[];
  issueBulletin: (bulletin: Omit<SafetyBulletin, 'id' | 'refNumber' | 'issueDate' | 'acknowledgments'>) => SafetyBulletin;
  acknowledgeBulletin: (bulletinId: string, staffName: string, badgeNumber: string, department: string) => void;

  // MoC
  mocs: ManagementOfChange[];
  createMoC: (moc: Omit<ManagementOfChange, 'id' | 'initiationDate' | 'status' | 'approvals' | 'postReviewDone'>) => void;
  updateMoCApproval: (id: string, stage: 'hod' | 'sqm' | 'ae', approverName: string) => void;
  markMoCImplemented: (id: string) => void;
  completeMoCPostReview: (id: string, notes: string) => void;

  // GSE Fleet (Full CRUD & Tag Management)
  gseFleet: GSEVehicle[];
  addGSEVehicle: (vehicle: Omit<GSEVehicle, 'id'> & { id?: string }) => GSEVehicle;
  updateGSEVehicle: (id: string, updated: Partial<GSEVehicle>) => void;
  deleteGSEVehicle: (id: string) => void;
  updateGSETag: (id: string, status: 'green' | 'amber' | 'red', notes?: string, actorName?: string) => void;

  // Audit Checklist Templates (Template Manager)
  auditTemplates: AuditTemplate[];
  addAuditTemplate: (template: Omit<AuditTemplate, 'id' | 'createdAt'>) => AuditTemplate;
  updateAuditTemplate: (id: string, updated: Partial<AuditTemplate>) => void;
  deleteAuditTemplate: (id: string) => void;

  // Training & Competency Compliance (Full CRUD - Access only by SQM & Training Head)
  trainingRecords: StaffTrainingRecord[];
  addStaffTrainingRecord: (record: Omit<StaffTrainingRecord, 'id'>) => StaffTrainingRecord;
  updateStaffTrainingRecord: (id: string, updated: Partial<StaffTrainingRecord>) => void;
  deleteStaffTrainingRecord: (id: string) => void;
  addStaffCourse: (staffId: string, course: StaffCourse) => void;
  updateStaffCourse: (staffId: string, courseId: string, updated: Partial<StaffCourse>) => void;
  deleteStaffCourse: (staffId: string, courseId: string) => void;
  recertifyStaffCourse: (staffId: string, courseId: string, newExpiryDate: string, certifiedDate?: string) => void;

  // Users, Departments & Roles (Full CRUD)
  users: UserRecord[];
  addUser: (user: Omit<UserRecord, 'id'>) => void;
  updateUser: (id: string, updates: Partial<UserRecord>) => void;
  deleteUser: (id: string) => void;

  departments: DepartmentConfig[];
  addDepartment: (dept: Omit<DepartmentConfig, 'id'> & { id?: string }) => void;
  updateDepartment: (id: string, updates: Partial<DepartmentConfig>) => void;
  deleteDepartment: (id: string) => void;

  roles: RoleDefinition[];
  rolePermissions: Record<string, RolePermissions>;
  updateRolePermission: (role: string, permission: keyof RolePermissions, value: boolean) => void;
  addRole: (roleData: { key: string; label: string; labelAr?: string; clearance: string; permissions?: Partial<RolePermissions> }) => void;
  updateRole: (key: string, updates: { label?: string; labelAr?: string; clearance?: string }) => void;
  deleteRole: (key: string) => void;

  // Management Review selections
  reviewSelections: ManagementReviewSelections;
  setReviewSelections: React.Dispatch<React.SetStateAction<ManagementReviewSelections>>;

  // Station Reset
  resetStationData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('rmf_sqms_lang') as Language) || 'en';
  });
  
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('rmf_sqms_theme') as ThemeMode) || 'light';
  });

  const [activeRole, setActiveRole] = useState<StationRole>('safety_officer');
  const [activeView, setActiveView] = useState<string>('incidentLogs');

  // Safety Report Form Configuration
  const [safetyFormConfig, setSafetyFormConfig] = useState<SafetyReportFormConfig>(() => {
    const saved = localStorage.getItem('rmf_form_config');
    return saved ? JSON.parse(saved) : INITIAL_FORM_CONFIG;
  });

  // Stored state
  const [reports, setReports] = useState<SafetyReport[]>(() => {
    const saved = localStorage.getItem('rmf_reports_v2');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [notifications, setNotifications] = useState<SQMSNotification[]>(() => {
    const saved = localStorage.getItem('rmf_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditSchedule, setAuditSchedule] = useState<AuditScheduleItem[]>(() => {
    const saved = localStorage.getItem('rmf_audits_sched_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 4) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_AUDIT_SCHEDULE;
  });

  const [findings, setFindings] = useState<AuditFinding[]>(() => {
    const saved = localStorage.getItem('rmf_findings_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 4 && parsed[0]?.lifecycleStatus) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_FINDINGS;
  });

  const [auditTemplates, setAuditTemplates] = useState<AuditTemplate[]>(() => {
    const saved = localStorage.getItem('rmf_audit_templates_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_AUDIT_TEMPLATES;
  });

  const [spis, setSpis] = useState<SPIItem[]>(() => {
    const saved = localStorage.getItem('rmf_spis_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10 && parsed[0]?.applicableFramework) {
          return parsed;
        }
      } catch (e) {
        // ignore and fallback
      }
    }
    return INITIAL_SPIS;
  });

  const [bulletins, setBulletins] = useState<SafetyBulletin[]>(() => {
    const saved = localStorage.getItem('rmf_bulletins');
    return saved ? JSON.parse(saved) : INITIAL_BULLETINS;
  });

  const [mocs, setMocs] = useState<ManagementOfChange[]>(() => {
    const saved = localStorage.getItem('rmf_mocs');
    return saved ? JSON.parse(saved) : INITIAL_MOCS;
  });

  const [gseFleet, setGseFleet] = useState<GSEVehicle[]>(() => {
    const saved = localStorage.getItem('rmf_gse');
    return saved ? JSON.parse(saved) : INITIAL_GSE;
  });

  const [trainingRecords, setTrainingRecords] = useState<StaffTrainingRecord[]>(() => {
    const saved = localStorage.getItem('rmf_training');
    return saved ? JSON.parse(saved) : INITIAL_TRAINING;
  });

  const [users, setUsers] = useState<UserRecord[]>(() => {
    const saved = localStorage.getItem('rmf_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [departments, setDepartments] = useState<DepartmentConfig[]>(() => {
    const saved = localStorage.getItem('rmf_departments');
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    const saved = localStorage.getItem('rmf_roles');
    return saved ? JSON.parse(saved) : INITIAL_ROLES;
  });

  const [rolePermissions, setRolePermissions] = useState<Record<string, RolePermissions>>(() => {
    const saved = localStorage.getItem('rmf_role_perms');
    return saved ? JSON.parse(saved) : DEFAULT_ROLE_PERMISSIONS;
  });

  const [reviewSelections, setReviewSelections] = useState<ManagementReviewSelections>({
    safetyPolicy: true,
    spiPerformance: true,
    incidentHeatmap: true,
    auditNonConformities: true,
    capaAging: true,
    safetyBulletins: true,
    mocProgress: true,
    gseReliability: true,
    trainingCompliance: true,
    resourceDirectives: true,
  });

  // Sync to local storage
  useEffect(() => { localStorage.setItem('rmf_form_config', JSON.stringify(safetyFormConfig)); }, [safetyFormConfig]);
  useEffect(() => { localStorage.setItem('rmf_role_perms', JSON.stringify(rolePermissions)); }, [rolePermissions]);
  useEffect(() => { localStorage.setItem('rmf_departments', JSON.stringify(departments)); }, [departments]);
  useEffect(() => { localStorage.setItem('rmf_roles', JSON.stringify(roles)); }, [roles]);
  useEffect(() => { localStorage.setItem('rmf_reports_v2', JSON.stringify(reports)); }, [reports]);
  useEffect(() => { localStorage.setItem('rmf_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { 
    localStorage.setItem('rmf_audits_sched_v2', JSON.stringify(auditSchedule)); 
    localStorage.setItem('rmf_audits_sched', JSON.stringify(auditSchedule)); 
  }, [auditSchedule]);
  useEffect(() => { 
    localStorage.setItem('rmf_findings_v2', JSON.stringify(findings)); 
    localStorage.setItem('rmf_findings', JSON.stringify(findings)); 
  }, [findings]);
  useEffect(() => { 
    localStorage.setItem('rmf_audit_templates_v1', JSON.stringify(auditTemplates)); 
  }, [auditTemplates]);
  useEffect(() => { 
    localStorage.setItem('rmf_spis_v3', JSON.stringify(spis)); 
    localStorage.setItem('rmf_spis', JSON.stringify(spis));
  }, [spis]);
  useEffect(() => { localStorage.setItem('rmf_bulletins', JSON.stringify(bulletins)); }, [bulletins]);
  useEffect(() => { localStorage.setItem('rmf_mocs', JSON.stringify(mocs)); }, [mocs]);
  useEffect(() => { localStorage.setItem('rmf_gse', JSON.stringify(gseFleet)); }, [gseFleet]);
  useEffect(() => { localStorage.setItem('rmf_training', JSON.stringify(trainingRecords)); }, [trainingRecords]);
  useEffect(() => { localStorage.setItem('rmf_users', JSON.stringify(users)); }, [users]);

  // Form Config Updaters
  const updateSafetyFormConfig = (newConfig: Partial<SafetyReportFormConfig>) => {
    setSafetyFormConfig(prev => ({ ...prev, ...newConfig }));
  };

  const resetSafetyFormConfig = () => {
    setSafetyFormConfig(INITIAL_FORM_CONFIG);
  };

  // RBAC Navigation & View Permission Checker
  const isViewPermitted = (viewId: string, role?: StationRole): boolean => {
    const targetRole = role || activeRole;
    const perms = rolePermissions[targetRole];
    if (!perms) return false;

    switch (viewId) {
      case 'quickReport':
        return !!perms.canViewQuickReport;
      case 'incidentLogs':
        return !!perms.canViewIncidentLogs;
      case 'kpiDashboard':
        return perms.canViewKPIDashboard !== undefined ? !!perms.canViewKPIDashboard : true;
      case 'audits':
        return !!perms.canViewAudits;
      case 'spiManager':
        return !!perms.canViewSPI;
      case 'bulletins':
        return !!perms.canViewBulletins;
      case 'moc':
        return !!perms.canViewMoC;
      case 'gseFleet':
        return !!perms.canViewGSE;
      case 'training':
        // Access strictly restricted to Safety & Quality Manager and Training Head per IATA ISAGO & Station Policy
        return (targetRole === 'hod_safety' || targetRole === 'hod_training') && !!perms.canViewTraining;
      case 'mgmtReview':
        return !!perms.canViewMgmtReview;
      case 'usersAndAccess':
        return !!perms.canViewUsersAndAccess;
      case 'formConfig':
        return !!perms.canConfigureForm;
      default:
        return true;
    }
  };

  // Auto-redirect if active role does not have permission for the currently active view
  useEffect(() => {
    if (!isViewPermitted(activeView, activeRole)) {
      if (isViewPermitted('quickReport', activeRole)) {
        setActiveView('quickReport');
      } else {
        const candidateViews = [
          'quickReport', 'incidentLogs', 'kpiDashboard', 'audits', 'spiManager', 'bulletins', 
          'moc', 'gseFleet', 'training', 'mgmtReview', 'usersAndAccess', 'formConfig'
        ];
        const allowed = candidateViews.find(v => isViewPermitted(v, activeRole));
        if (allowed) setActiveView(allowed);
      }
    }
  }, [activeRole, activeView, rolePermissions]);

  // Sync HTML direction and language
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('rmf_sqms_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem('rmf_sqms_theme', t);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [language, theme]);

  // Notifications helper
  const addNotification = (notif: Omit<SQMSNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: SQMSNotification = {
      ...notif,
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
      emailSent: true
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // =========================================================================
  // STRICT 8-STEP SAFETY REPORT WORKFLOW METHODS
  // =========================================================================

  // Step 1: Submission (Frontline report or Airline report intake)
  const addSafetyReport = (data: Omit<SafetyReport, 'id' | 'timestamp' | 'lifecycleStatus' | 'auditTrail' | 'attachments'>): SafetyReport => {
    const nextSeq = String(reports.length + 46).padStart(4, '0');
    const reportId = `RMF-SMS-2026-${nextSeq}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const initialAudit: AuditTrailEntry = {
      id: `AT-${Date.now()}-01`,
      timestamp,
      actorName: data.reporterName || (data.reportSource === 'airline_report' ? data.airlineName || 'Airline Representative' : 'Anonymous Reporter'),
      actorRole: activeRole,
      action: data.reportSource === 'airline_report' ? 'Airline Safety Report Recorded' : 'Safety Report Submitted',
      details: `Report registered into RMF SQMS queue. Location: ${data.location}, Category: ${data.category}.`,
      newStatus: 'submitted'
    };

    const initialAttachments: FileAttachment[] = data.photoUrl ? [
      {
        id: `ATT-${Date.now()}-01`,
        fileName: 'Airside_Photo_Attachment.jpg',
        fileSize: '1.6 MB',
        fileType: 'image/jpeg',
        uploadedBy: data.reporterName || 'Reporter',
        uploadedRole: activeRole,
        uploadedAt: timestamp,
        category: 'initial_report',
        url: data.photoUrl
      }
    ] : [];

    const newReport: SafetyReport = {
      ...data,
      id: reportId,
      timestamp,
      lifecycleStatus: 'submitted',
      auditTrail: [initialAudit],
      attachments: initialAttachments
    };

    // Auto-ground vehicle if GSE damage
    if (data.category === 'gse_damage' && data.gseIdLinked) {
      setGseFleet(prev => prev.map(gse => {
        if (gse.id === data.gseIdLinked) {
          return {
            ...gse,
            tagStatus: 'red',
            activeDefectNotes: `Grounded via Incident Report ${newReport.id}: ${data.description.substring(0, 60)}...`,
            activeDefectReportId: newReport.id
          };
        }
        return gse;
      }));
    }

    // Dispatch Notification to S&Q Team
    addNotification({
      title: "New Safety Report Submitted",
      titleAr: "تم تقديم بلاغ سلامة جديد في المحطة",
      message: `Report ${reportId} logged for ${data.location} (${data.category}). S&Q receipt acknowledgment pending.`,
      messageAr: `تم تسجيل البلاغ ${reportId} في ${data.location}. بانتظار إقرار الاستلام من إدارة السلامة.`,
      targetRoles: ["safety_officer", "hod_safety", "ae", "ghm"],
      sourceReportId: reportId,
      priority: "urgent",
      category: "new_report",
      emailRecipient: "safety.desk@marsa-alam-ground.com"
    });

    setReports([newReport, ...reports]);
    return newReport;
  };

  // Step 2: Acknowledgment (Safety Officer or any S&Q department member)
  const acknowledgeReport = (id: string, actorName: string = "Mahmoud Ezz (Safety Officer)") => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setReports(prev => prev.map(r => {
      if (r.id === id) {
        const auditEntry: AuditTrailEntry = {
          id: `AT-${Date.now()}-02`,
          timestamp,
          actorName,
          actorRole: activeRole,
          action: "Receipt Acknowledged",
          details: `Report receipt confirmed by ${actorName}. Ready for Level Classification by SQM.`,
          previousStatus: r.lifecycleStatus,
          newStatus: "acknowledged"
        };

        return {
          ...r,
          lifecycleStatus: 'acknowledged',
          acknowledgedBy: actorName,
          acknowledgedAt: timestamp,
          safetyOfficerAssigned: actorName,
          auditTrail: [auditEntry, ...r.auditTrail]
        };
      }
      return r;
    }));

    // Notify SQM that report is ready for Level Classification
    addNotification({
      title: "Level Classification Required (SQM)",
      titleAr: "مطلوب تحديد وتصنيف مستوى البلاغ (SQM)",
      message: `Report ${id} acknowledged. Safety & Quality Manager must assign Level 1 (30d), Level 2 (60d), or Level 3 (90d).`,
      messageAr: `تم تأكيد استلام البلاغ ${id}. يتعين على مدير السلامة والجودة تحديد المستوى وتاريخ الإغلاق.`,
      targetRoles: ["hod_safety", "ae", "ghm"],
      sourceReportId: id,
      priority: "urgent",
      category: "acknowledged",
      emailRecipient: "k.fawzy@marsa-alam-ground.com"
    });
  };

  // Step 3: Level Classification (SQM ONLY - Major 30d / Minor 60d / Observation 90d)
  const assignReportLevel = (
    id: string, 
    level: InvestigationLevel, 
    comments: string = "", 
    actorName: string = "Dr. Khaled Fawzy (Safety & Quality Manager)"
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const targetClosureDate = calculateTargetClosureDate(todayStr, level);
    const days = getLevelDays(level);

    setReports(prev => prev.map(r => {
      if (r.id === id) {
        const levelLabel = level === 'level_1' ? 'Major (Level 1)' : level === 'level_2' ? 'Minor (Level 2)' : 'Observation (Level 3)';
        const auditEntry: AuditTrailEntry = {
          id: `AT-${Date.now()}-03`,
          timestamp,
          actorName,
          actorRole: activeRole,
          action: `Investigation Level Assigned: ${levelLabel}`,
          details: `SQM assigned ${levelLabel}. Target closure window: ${days} days (Due: ${targetClosureDate}). ${comments ? `Notes: ${comments}` : ''}`,
          previousStatus: r.lifecycleStatus,
          newStatus: "level_assigned",
          comments
        };

        return {
          ...r,
          lifecycleStatus: 'level_assigned',
          level,
          levelAssignedBy: actorName,
          levelAssignedAt: timestamp,
          targetClosureDate,
          auditTrail: [auditEntry, ...r.auditTrail]
        };
      }
      return r;
    }));

    // Notify S&Q team that Level is assigned and investigation can proceed
    addNotification({
      title: `Level ${level.toUpperCase()} Assigned: ${id}`,
      titleAr: `تم اعتماد مستوى البلاغ ${id}`,
      message: `SQM assigned Level ${level}. Mandated Target Closure Date: ${targetClosureDate} (${days} days). S&Q investigation can commence.`,
      messageAr: `اعتمد مدير السلامة المستوى ${level}. التاريخ المستهدف للإغلاق: ${targetClosureDate}. يمكن بدء التحقيق الميداني.`,
      targetRoles: ["safety_officer", "hod_safety"],
      sourceReportId: id,
      priority: "normal",
      category: "level_assigned",
      emailRecipient: "safety.officer@marsa-alam-ground.com"
    });
  };

  // Step 4: S&Q Investigation (Existing procedures, mitigations, Initial Risk, assign HoD, set CAPA due date)
  const startOrUpdateInvestigation = (
    id: string,
    payload: {
      investigationSummary: string;
      existingProcedures: string[];
      currentMitigations: string;
      preMitigationRisk: RiskAssessment;
      assignedHoD: string;
      assignedHoDRole: StationRole;
      capaPlanDueDate: string;
    },
    actorName: string = "Mahmoud Ezz (Safety Officer)"
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setReports(prev => prev.map(r => {
      if (r.id === id) {
        const auditEntry: AuditTrailEntry = {
          id: `AT-${Date.now()}-04`,
          timestamp,
          actorName,
          actorRole: activeRole,
          action: "Investigation Findings Recorded & HoD Assigned",
          details: `Assigned to ${payload.assignedHoD}. Initial Risk: ${payload.preMitigationRisk.scoreCode} (${payload.preMitigationRisk.level}). CAPA plan submission deadline: ${payload.capaPlanDueDate}.`,
          previousStatus: r.lifecycleStatus,
          newStatus: "plan_pending"
        };

        return {
          ...r,
          lifecycleStatus: 'plan_pending',
          investigationSummary: payload.investigationSummary,
          existingProcedures: payload.existingProcedures,
          currentMitigations: payload.currentMitigations,
          preMitigationRisk: payload.preMitigationRisk,
          assignedHoD: payload.assignedHoD,
          assignedHoDRole: payload.assignedHoDRole,
          capaPlanDueDate: payload.capaPlanDueDate,
          auditTrail: [auditEntry, ...r.auditTrail]
        };
      }
      return r;
    }));

    // Notify assigned HoD that CAPA plan is required
    addNotification({
      title: `CAPA Plan Required: Case ${id}`,
      titleAr: `مطلوب إعداد وتقديم خطة CAPA للبلاغ ${id}`,
      message: `Case ${id} has been investigated and assigned to your department. Root Cause Analysis and CAPA plan due by ${payload.capaPlanDueDate}.`,
      messageAr: `تم إحالة ملف التحقيق للبلاغ ${id} إلى إدارتكم. الموعد النهائي لتقديم خطة الـ CAPA والتحليل الجذري هو ${payload.capaPlanDueDate}.`,
      targetRoles: [payload.assignedHoDRole, "sdm", "hod_safety"],
      sourceReportId: id,
      priority: "urgent",
      category: "plan_assignment",
      emailRecipient: `${payload.assignedHoDRole}@marsa-alam-ground.com`
    });
  };

  // Step 5: CAPA Plan Submission (Assigned HoD)
  const submitCAPAPlan = (
    id: string,
    payload: {
      rcaType: 'simple' | 'five_whys';
      simpleRca?: SimpleRCA;
      fiveWhysRca?: string[];
      correctiveAction: string;
      preventiveAction: string;
      attachmentName?: string;
    },
    actorName: string = "Head of Department"
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setReports(prev => prev.map(r => {
      if (r.id === id) {
        const auditEntry: AuditTrailEntry = {
          id: `AT-${Date.now()}-05`,
          timestamp,
          actorName,
          actorRole: activeRole,
          action: "CAPA Plan & RCA Submitted",
          details: `HoD submitted CAPA plan with ${payload.rcaType === 'five_whys' ? '5-Whys Deep RCA' : 'Simple RCA'}. Transmitted to SQM for formal approval.`,
          previousStatus: r.lifecycleStatus,
          newStatus: "plan_under_review"
        };

        const newAttachments = [...r.attachments];
        if (payload.attachmentName) {
          newAttachments.unshift({
            id: `ATT-${Date.now()}-05`,
            fileName: payload.attachmentName,
            fileSize: '820 KB',
            fileType: 'application/pdf',
            uploadedBy: actorName,
            uploadedRole: activeRole,
            uploadedAt: timestamp,
            category: 'capa_plan'
          });
        }

        const capaItem: CAPAItem = {
          correctiveAction: payload.correctiveAction,
          preventiveAction: payload.preventiveAction,
          assignedDepartment: r.department,
          assignedManager: actorName,
          targetDate: r.targetClosureDate || timestamp.substring(0, 10),
          submittedAt: timestamp,
          status: 'submitted'
        };

        return {
          ...r,
          lifecycleStatus: 'plan_under_review',
          rcaType: payload.rcaType,
          simpleRca: payload.simpleRca,
          fiveWhysRca: payload.fiveWhysRca,
          capa: capaItem,
          attachments: newAttachments,
          auditTrail: [auditEntry, ...r.auditTrail]
        };
      }
      return r;
    }));

    // Notify SQM that plan is ready for review
    addNotification({
      title: `CAPA Plan Awaiting SQM Review: ${id}`,
      titleAr: `خطة CAPA بانتظار مراجعة واعتماد مدير السلامة والجودة: ${id}`,
      message: `Assigned HoD submitted CAPA plan for ${id}. Review required: Approve or Return for revision.`,
      messageAr: `قدم مدير الإدارة خطة الـ CAPA للبلاغ ${id}. مطلوب المراجعة والاعتماد أو الإعادة للتعديل.`,
      targetRoles: ["hod_safety", "ae", "ghm"],
      sourceReportId: id,
      priority: "normal",
      category: "plan_submitted",
      emailRecipient: "k.fawzy@marsa-alam-ground.com"
    });
  };

  // Step 6: Plan Review (SQM: Approve or Return with Comments)
  const reviewCAPAPlan = (
    id: string,
    decision: 'approve' | 'return',
    comments: string,
    actorName: string = "Dr. Khaled Fawzy (Safety & Quality Manager)"
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    let targetHoDRole: StationRole = 'hod_ops';

    setReports(prev => prev.map(r => {
      if (r.id === id) {
        if (r.assignedHoDRole) targetHoDRole = r.assignedHoDRole;

        if (decision === 'approve') {
          const auditEntry: AuditTrailEntry = {
            id: `AT-${Date.now()}-06`,
            timestamp,
            actorName,
            actorRole: activeRole,
            action: "CAPA Plan Approved by SQM",
            details: `Plan approved. Authorizing implementation and effectiveness evaluation. ${comments ? `SQM Directives: ${comments}` : ''}`,
            previousStatus: r.lifecycleStatus,
            newStatus: "effectiveness_pending",
            comments
          };

          return {
            ...r,
            lifecycleStatus: 'effectiveness_pending',
            sqmPlanReviewDecision: 'approve',
            sqmPlanReviewComments: comments,
            sqmPlanReviewedAt: timestamp,
            sqmPlanReviewedBy: actorName,
            capa: r.capa ? { ...r.capa, status: 'approved' } : undefined,
            auditTrail: [auditEntry, ...r.auditTrail]
          };
        } else {
          // Returned for revision
          const auditEntry: AuditTrailEntry = {
            id: `AT-${Date.now()}-06`,
            timestamp,
            actorName,
            actorRole: activeRole,
            action: "CAPA Plan Returned for Revision",
            details: `Plan returned by SQM. Required updates: ${comments}`,
            previousStatus: r.lifecycleStatus,
            newStatus: "plan_returned",
            comments
          };

          return {
            ...r,
            lifecycleStatus: 'plan_returned',
            sqmPlanReviewDecision: 'return',
            sqmPlanReviewComments: comments,
            sqmPlanReviewedAt: timestamp,
            sqmPlanReviewedBy: actorName,
            capa: r.capa ? { ...r.capa, status: 'returned' } : undefined,
            auditTrail: [auditEntry, ...r.auditTrail]
          };
        }
      }
      return r;
    }));

    if (decision === 'approve') {
      addNotification({
        title: `CAPA Plan Approved: ${id}`,
        titleAr: `تم اعتماد خطة الـ CAPA: ${id}`,
        message: `SQM approved plan for ${id}. S&Q team will now evaluate implementation effectiveness.`,
        messageAr: `اعتمد مدير السلامة الخطة للبلاغ ${id}. ستقوم إدارة السلامة والجودة بقياس الفعالية.`,
        targetRoles: ["safety_officer", targetHoDRole, "sdm"],
        sourceReportId: id,
        priority: "normal",
        category: "plan_approved",
        emailRecipient: "safety.officer@marsa-alam-ground.com"
      });
    } else {
      addNotification({
        title: `⚠️ CAPA Plan Returned: ${id}`,
        titleAr: `⚠️ تمت إعادة خطة الـ CAPA للتعديل: ${id}`,
        message: `Plan for ${id} returned by SQM: "${comments}". HoD must revise and resubmit.`,
        messageAr: `أعاد مدير السلامة خطة البلاغ ${id}: "${comments}". يتعين على مدير الإدارة التعديل وإعادة الإرسال.`,
        targetRoles: [targetHoDRole, "sdm"],
        sourceReportId: id,
        priority: "urgent",
        category: "plan_returned",
        emailRecipient: `${targetHoDRole}@marsa-alam-ground.com`
      });
    }
  };

  // Step 7: Effectiveness Evaluation & Residual Risk (S&Q)
  const recordEffectiveness = (
    id: string,
    payload: {
      isEffective: boolean;
      evaluationNotes: string;
      residualRisk: RiskAssessment;
      evidenceSummary?: string;
      attachmentName?: string;
    },
    actorName: string = "Mahmoud Ezz (Safety Officer)"
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setReports(prev => prev.map(r => {
      if (r.id === id) {
        const auditEntry: AuditTrailEntry = {
          id: `AT-${Date.now()}-07`,
          timestamp,
          actorName,
          actorRole: activeRole,
          action: "Effectiveness & Residual Risk Recorded",
          details: `Evaluation: ${payload.isEffective ? 'Effective' : 'Ineffective'}. Residual Risk: ${payload.residualRisk.scoreCode} (${payload.residualRisk.level}). Ready for SQM final sign-off.`,
          previousStatus: r.lifecycleStatus,
          newStatus: "pending_signoff"
        };

        const newAttachments = [...r.attachments];
        if (payload.attachmentName) {
          newAttachments.unshift({
            id: `ATT-${Date.now()}-07`,
            fileName: payload.attachmentName,
            fileSize: '620 KB',
            fileType: 'application/pdf',
            uploadedBy: actorName,
            uploadedRole: activeRole,
            uploadedAt: timestamp,
            category: 'effectiveness'
          });
        }

        return {
          ...r,
          lifecycleStatus: 'pending_signoff',
          effectivenessEvaluation: {
            evaluatedBy: actorName,
            evaluatedAt: timestamp,
            isEffective: payload.isEffective,
            evaluationNotes: payload.evaluationNotes,
            evidenceSummary: payload.evidenceSummary
          },
          residualRisk: payload.residualRisk,
          postMitigationRisk: payload.residualRisk,
          attachments: newAttachments,
          auditTrail: [auditEntry, ...r.auditTrail]
        };
      }
      return r;
    }));

    // Notify SQM that case is ready for final sign-off & closure
    addNotification({
      title: `Final Sign-off Required: ${id}`,
      titleAr: `مطلوب التوقيع الرقمي النهائي والإغلاق للبلاغ: ${id}`,
      message: `Effectiveness and Residual Risk recorded for ${id}. SQM must perform final review and sign-off to close case.`,
      messageAr: `تم تسجيل تقييم الفعالية والخطر المتبقي للبلاغ ${id}. مطلوب اعتماد مدير السلامة والتوقيع الرقمي للإغلاق.`,
      targetRoles: ["hod_safety", "ae", "ghm"],
      sourceReportId: id,
      priority: "urgent",
      category: "signoff_ready",
      emailRecipient: "k.fawzy@marsa-alam-ground.com"
    });
  };

  // Step 8: Final Sign-off & Closure (SQM Only)
  const finalSignoffAndClose = (
    id: string,
    comments: string = "All corrective actions and residual risk verified. Officially closed.",
    actorName: string = "Dr. Khaled Fawzy (Safety & Quality Manager)"
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const signatureHash = `RMF-DSIG-${Math.random().toString(36).substring(2, 8).toUpperCase()}-ICAO-SMS`;

    setReports(prev => prev.map(r => {
      if (r.id === id) {
        const auditEntry: AuditTrailEntry = {
          id: `AT-${Date.now()}-08`,
          timestamp,
          actorName,
          actorRole: activeRole,
          action: "Case Formally Closed & Digitally Signed",
          details: `Final sign-off by SQM. Digital Signature Hash: ${signatureHash}. ${comments}`,
          previousStatus: r.lifecycleStatus,
          newStatus: "closed",
          comments
        };

        return {
          ...r,
          lifecycleStatus: 'closed',
          closedBy: actorName,
          closedAt: timestamp,
          closureNotes: comments,
          finalSignoff: {
            signedBy: actorName,
            signedAt: timestamp,
            comments,
            signatureHash
          },
          capa: r.capa ? { ...r.capa, status: 'verified' } : undefined,
          auditTrail: [auditEntry, ...r.auditTrail]
        };
      }
      return r;
    }));

    // Notify all stakeholders that case is officially closed
    addNotification({
      title: `Case Closed: ${id}`,
      titleAr: `تم إغلاق البلاغ رسمياً والتوقيع: ${id}`,
      message: `Case ${id} successfully signed off and closed by Safety & Quality Manager. Digital certificate generated.`,
      messageAr: `تم اعتماد وإغلاق ملف البلاغ ${id} رسمياً من قِبل مدير السلامة والجودة وتوليد الختم الرقمي.`,
      targetRoles: ["safety_officer", "hod_ops", "hod_maint", "sdm", "ghm", "ae"],
      sourceReportId: id,
      priority: "normal",
      category: "closed",
      emailRecipient: "all.station@marsa-alam-ground.com"
    });
  };

  // File attachment handler
  const addReportAttachment = (
    id: string,
    file: { fileName: string; fileSize: string; fileType: string; category: FileAttachment['category'] }
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newAttachment: FileAttachment = {
      id: `ATT-${Date.now()}`,
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileType: file.fileType,
      uploadedBy: activeRole === 'hod_safety' ? 'Dr. Khaled Fawzy' : activeRole === 'safety_officer' ? 'Mahmoud Ezz' : 'Staff Member',
      uploadedRole: activeRole,
      uploadedAt: timestamp,
      category: file.category
    };

    setReports(prev => prev.map(r => {
      if (r.id === id) {
        const auditEntry: AuditTrailEntry = {
          id: `AT-${Date.now()}-ATT`,
          timestamp,
          actorName: newAttachment.uploadedBy,
          actorRole: activeRole,
          action: "Document/Evidence Attached",
          details: `Uploaded ${file.fileName} (${file.fileSize}) under category ${file.category}.`
        };

        return {
          ...r,
          attachments: [newAttachment, ...r.attachments],
          auditTrail: [auditEntry, ...r.auditTrail]
        };
      }
      return r;
    }));
  };

  // Backwards-compatible aliases for existing components
  const updateInvestigation = (id: string, summary: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, investigationSummary: summary } : r));
  };
  const setPreMitigationRisk = (id: string, risk: RiskAssessment) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, preMitigationRisk: risk } : r));
  };
  const setReportRCA = (id: string, rcaType: 'simple' | 'five_whys', simpleRca?: SimpleRCA, fiveWhys?: string[]) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, rcaType, simpleRca, fiveWhysRca: fiveWhys } : r));
  };
  const setReportCAPA = (id: string, capa: CAPAItem) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, capa } : r));
  };
  const markReportCAPAImplemented = (id: string) => {
    setReports(prev => prev.map(r => r.id === id && r.capa ? { ...r, capa: { ...r.capa, status: 'implemented' } } : r));
  };
  const setPostMitigationRisk = (id: string, risk: RiskAssessment) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, postMitigationRisk: risk, residualRisk: risk } : r));
  };
  const closeSafetyReport = (id: string, closedBy: string, notes: string) => {
    finalSignoffAndClose(id, notes, closedBy);
  };

  const issueBulletinFromReport = (reportId: string, title: string, titleAr: string, summary: string, actions: string[]): SafetyBulletin => {
    const nextSeq = String(bulletins.length + 4).padStart(3, '0');
    const newRef = `RMF-SB-2026-${nextSeq}`;
    const newBulletin: SafetyBulletin = {
      id: `BUL-${Date.now()}`,
      refNumber: newRef,
      type: 'bulletin',
      title,
      titleAr,
      issueDate: new Date().toISOString().substring(0, 10),
      targetDepartments: ["Operations - Ramp Services", "Maintenance - GSE Fleet"],
      priority: 'urgent',
      summary,
      summaryAr: summary,
      content: `Safety notice published following investigation of incident ${reportId}. All frontline personnel must review and acknowledge.`,
      contentAr: `تم إصدار هذا التعميم عقب التحقيق في تقرير السلامة ${reportId}. يتعين على جميع الموظفين المعنيين الإقرار بالاطلاع.`,
      mandatoryActions: actions,
      issuedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
      sourceReportId: reportId,
      requiredStaffCount: 50,
      acknowledgments: []
    };

    setBulletins([newBulletin, ...bulletins]);
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, issuedBulletinId: newRef } : r));
    return newBulletin;
  };

  // =========================================================================
  // AUDITS, FINDINGS, SPIS, BULLETINS, MOC, GSE, TRAINING, USERS
  // =========================================================================

  // =========================================================================
  // AUDITS & FINDINGS (Full CRUD & Unified 8-Step Lifecycle)
  // =========================================================================

  const addAuditScheduleItem = (audit: Omit<AuditScheduleItem, 'id' | 'findingsCount'>): AuditScheduleItem => {
    const nextSeq = String(auditSchedule.length + 1).padStart(2, '0');
    const newItem: AuditScheduleItem = {
      ...audit,
      id: `AUD-SCH-2026-${nextSeq}`,
      findingsCount: 0
    };
    setAuditSchedule(prev => [newItem, ...prev]);
    return newItem;
  };

  const updateAuditScheduleItem = (id: string, updated: Partial<AuditScheduleItem>) => {
    setAuditSchedule(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
  };

  const deleteAuditScheduleItem = (id: string) => {
    setAuditSchedule(prev => prev.filter(a => a.id !== id));
  };

  const addFinding = (
    finding: Omit<AuditFinding, 'id' | 'lifecycleStatus' | 'auditTrail' | 'attachments'>
  ): AuditFinding => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const nextSeq = String(findings.length + 1).padStart(3, '0');
    const newId = `RMF-AUD-2026-${nextSeq}`;

    const auditEntry: AuditTrailEntry = {
      id: `AT-${Date.now()}-01`,
      timestamp,
      actorName: activeRole === 'hod_safety' ? 'Dr. Khaled Fawzy' : 'Lead Auditor',
      actorRole: activeRole,
      action: 'Audit Finding Logged & Submitted',
      details: `Finding ${newId} logged for ${finding.auditTitle || 'Station Audit'}. Reference: ${finding.standardReference}.`,
      newStatus: 'submitted'
    };

    const newFinding: AuditFinding = {
      ...finding,
      id: newId,
      lifecycleStatus: 'submitted',
      lifecycleStage: 'raised',
      auditTrail: [auditEntry],
      attachments: []
    };

    setFindings(prev => [newFinding, ...prev]);

    // If linked to an audit, increment findingsCount
    if (finding.auditId) {
      setAuditSchedule(prev => prev.map(a => 
        a.id === finding.auditId ? { ...a, findingsCount: (a.findingsCount || 0) + 1 } : a
      ));
    }

    addNotification({
      title: `New Finding Created: ${newId}`,
      titleAr: `تم تسجيل ملاحظة تفتيش جديدة: ${newId}`,
      message: `New finding logged for ${finding.auditTitle}. Reference: ${finding.standardReference}. Ready for S&Q acknowledgment.`,
      messageAr: `تم تسجيل ملاحظة تدقيق جديدة للمراجعة ${finding.auditTitle}. المعيار: ${finding.standardReference}. بانتظار تأكيد الاستلام.`,
      targetRoles: ['safety_officer', 'hod_safety', 'ae', 'ghm'],
      sourceFindingId: newId,
      priority: 'normal',
      category: 'new_report'
    });

    return newFinding;
  };

  const updateFinding = (id: string, updated: Partial<AuditFinding>) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, ...updated } : f));
  };

  const deleteFinding = (id: string) => {
    const findingToDelete = findings.find(f => f.id === id);
    if (findingToDelete && findingToDelete.auditId) {
      setAuditSchedule(prev => prev.map(a => 
        a.id === findingToDelete.auditId ? { ...a, findingsCount: Math.max(0, (a.findingsCount || 1) - 1) } : a
      ));
    }
    setFindings(prev => prev.filter(f => f.id !== id));
  };

  // Step 2: Acknowledge Finding
  const acknowledgeFinding = (findingId: string, actorName: string = 'Mahmoud Ezz (Safety Officer)') => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        const auditEntry: AuditTrailEntry = {
          id: `AT-${Date.now()}-02`,
          timestamp,
          actorName,
          actorRole: activeRole,
          action: 'Finding Receipt Acknowledged',
          details: 'Official acknowledgment by S&Q. Ready for SQM Level Classification.',
          previousStatus: f.lifecycleStatus,
          newStatus: 'acknowledged'
        };
        return {
          ...f,
          lifecycleStatus: 'acknowledged',
          lifecycleStage: 'acknowledged',
          acknowledgedBy: actorName,
          acknowledgedAt: timestamp,
          auditTrail: [auditEntry, ...(f.auditTrail || [])]
        };
      }
      return f;
    }));

    addNotification({
      title: `Finding Acknowledged: ${findingId}`,
      titleAr: `تم تأكيد استلام ملاحظة التدقيق: ${findingId}`,
      message: `Finding ${findingId} acknowledged. Ready for SQM Level classification (Major 30d / Minor 60d / Obs 90d).`,
      messageAr: `تم تأكيد استلام ملاحظة التدقيق ${findingId}. بانتظار تصنيف المستوى وحساب التاريخ المستهدف بواسطة مدير السلامة.`,
      targetRoles: ['hod_safety', 'ae', 'ghm'],
      sourceFindingId: findingId,
      priority: 'urgent',
      category: 'acknowledged'
    });
  };

  // Step 3: Assign Finding Level (SQM only)
  const assignFindingLevel = (
    findingId: string, 
    level: InvestigationLevel, 
    comments: string = '', 
    actorName: string = 'Dr. Khaled Fawzy (Safety & Quality Manager)'
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const dateOnly = new Date().toISOString().split('T')[0];
    const targetClosureDate = calculateTargetClosureDate(dateOnly, level);
    const days = getLevelDays(level);

    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        const auditEntry: AuditTrailEntry = {
          id: `AT-${Date.now()}-03`,
          timestamp,
          actorName,
          actorRole: activeRole,
          action: `Investigation Level Assigned: ${level.toUpperCase()} (${days} Days)`,
          details: `Target closure date set to ${targetClosureDate} (${days} days from assignment). Mandatory case closure clock active. ${comments}`,
          previousStatus: f.lifecycleStatus,
          newStatus: 'level_assigned',
          comments
        };
        return {
          ...f,
          lifecycleStatus: 'level_assigned',
          level,
          levelAssignedBy: actorName,
          levelAssignedAt: dateOnly,
          targetClosureDate,
          levelComments: comments,
          auditTrail: [auditEntry, ...(f.auditTrail || [])]
        };
      }
      return f;
    }));

    addNotification({
      title: `Level Assigned: ${findingId}`,
      titleAr: `تم تصنيف مستوى الملاحظة: ${findingId}`,
      message: `Level ${level.toUpperCase()} assigned to ${findingId}. Target closure date: ${targetClosureDate} (${days} days). Ready for S&Q investigation.`,
      messageAr: `تم تصنيف الملاحظة ${findingId} بالمستوى ${level.toUpperCase()}. التاريخ المستهدف للإغلاق: ${targetClosureDate} (${days} يوماً). جاهزة للتحقيق.`,
      targetRoles: ['safety_officer', 'hod_safety'],
      sourceFindingId: findingId,
      priority: 'normal',
      category: 'level_assigned'
    });
  };

  // Step 4: Start or Update Finding Investigation (S&Q)
  const startOrUpdateFindingInvestigation = (
    findingId: string,
    payload: {
      investigationSummary: string;
      existingProcedures: string[];
      currentMitigations: string;
      preMitigationRisk: RiskAssessment;
      assignedHoD: string;
      assignedHoDRole: StationRole;
      capaPlanDueDate: string;
    },
    actorName: string = 'Mahmoud Ezz (Safety Officer)'
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        const auditEntry: AuditTrailEntry = {
          id: `AT-${Date.now()}-04`,
          timestamp,
          actorName,
          actorRole: activeRole,
          action: 'Investigation Completed & HoD Assigned',
          details: `Procedures and mitigations evaluated. Initial Risk: ${payload.preMitigationRisk.scoreCode} (${payload.preMitigationRisk.level}). Assigned to ${payload.assignedHoD}. CAPA Plan Due: ${payload.capaPlanDueDate}.`,
          previousStatus: f.lifecycleStatus,
          newStatus: 'plan_pending'
        };
        return {
          ...f,
          lifecycleStatus: 'plan_pending',
          investigationSummary: payload.investigationSummary,
          existingProcedures: payload.existingProcedures,
          currentMitigations: payload.currentMitigations,
          preMitigationRisk: payload.preMitigationRisk,
          assignedHoD: payload.assignedHoD,
          assignedHoDRole: payload.assignedHoDRole,
          capaPlanDueDate: payload.capaPlanDueDate,
          auditTrail: [auditEntry, ...(f.auditTrail || [])]
        };
      }
      return f;
    }));

    addNotification({
      title: `CAPA Plan Assigned: ${findingId}`,
      titleAr: `تم تكليف إعداد خطة الـ CAPA: ${findingId}`,
      message: `Finding ${findingId} assigned to ${payload.assignedHoD}. CAPA plan must be submitted by ${payload.capaPlanDueDate}.`,
      messageAr: `تم تكليف ${payload.assignedHoD} بإعداد خطة الإجراءات التصحيحية والوقائية للملاحظة ${findingId} قبل تاريخ ${payload.capaPlanDueDate}.`,
      targetRoles: [payload.assignedHoDRole, 'safety_officer', 'hod_safety'],
      sourceFindingId: findingId,
      priority: 'urgent',
      category: 'plan_assignment'
    });
  };

  // Step 5: Submit Finding CAPA Plan (HoD)
  const submitFindingCAPAPlan = (
    findingId: string,
    payload: {
      rcaType: 'simple' | 'five_whys';
      simpleRca?: SimpleRCA;
      fiveWhysRca?: string[];
      correctiveAction: string;
      preventiveAction: string;
      attachmentName?: string;
    },
    actorName: string = 'Head of Department'
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        const auditEntry: AuditTrailEntry = {
          id: `AT-${Date.now()}-05`,
          timestamp,
          actorName,
          actorRole: activeRole,
          action: 'CAPA Plan Submitted by HoD',
          details: `Root Cause Analysis completed (${payload.rcaType}). Corrective & Preventive actions defined. Submitted for SQM approval.`,
          previousStatus: f.lifecycleStatus,
          newStatus: 'plan_under_review'
        };
        const capaItem: CAPAItem = {
          correctiveAction: payload.correctiveAction,
          preventiveAction: payload.preventiveAction,
          assignedDepartment: f.assignedDepartment || 'Operations',
          assignedManager: actorName,
          targetDate: f.capaPlanDueDate || timestamp.split(' ')[0],
          submittedAt: timestamp,
          status: 'submitted'
        };
        return {
          ...f,
          lifecycleStatus: 'plan_under_review',
          lifecycleStage: 'capa_proposed',
          rcaType: payload.rcaType,
          rcaMethod: payload.rcaType,
          simpleRca: payload.simpleRca,
          fiveWhysRca: payload.fiveWhysRca,
          capa: capaItem,
          capaProposal: {
            correctiveAction: payload.correctiveAction,
            preventiveAction: payload.preventiveAction,
            targetDate: f.capaPlanDueDate || timestamp.split(' ')[0],
            proposedAt: timestamp
          },
          auditTrail: [auditEntry, ...(f.auditTrail || [])]
        };
      }
      return f;
    }));

    addNotification({
      title: `CAPA Plan Submitted for Review: ${findingId}`,
      titleAr: `تم تقديم خطة الـ CAPA للمراجعة: ${findingId}`,
      message: `HoD submitted CAPA plan for finding ${findingId}. Safety & Quality Manager review required.`,
      messageAr: `قام مدير الإدارة بتقديم خطة الـ CAPA للملاحظة ${findingId}. بانتظار مراجعة واعتماد مدير السلامة والجودة.`,
      targetRoles: ['hod_safety', 'ae', 'ghm'],
      sourceFindingId: findingId,
      priority: 'urgent',
      category: 'plan_submitted'
    });
  };

  // Step 6: Review Finding CAPA Plan (SQM)
  const reviewFindingCAPAPlan = (
    findingId: string,
    decision: 'approve' | 'return',
    comments: string,
    actorName: string = 'Dr. Khaled Fawzy (Safety & Quality Manager)'
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newStatus: ReportLifecycleStatus = decision === 'approve' ? 'effectiveness_pending' : 'plan_returned';

    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        const auditEntry: AuditTrailEntry = {
          id: `AT-${Date.now()}-06`,
          timestamp,
          actorName,
          actorRole: activeRole,
          action: decision === 'approve' ? 'CAPA Plan Approved by SQM' : 'CAPA Plan Returned for Revision',
          details: `SQM Decision: ${decision.toUpperCase()}. Comments: ${comments}`,
          previousStatus: f.lifecycleStatus,
          newStatus,
          comments
        };
        return {
          ...f,
          lifecycleStatus: newStatus,
          lifecycleStage: decision === 'approve' ? 'sqm_approved' : 'capa_proposed',
          sqmPlanReviewDecision: decision,
          sqmPlanReviewComments: comments,
          sqmPlanReviewedAt: timestamp,
          sqmPlanReviewedBy: actorName,
          sqmApproval: decision === 'approve' ? {
            approvedBy: actorName,
            approvedAt: timestamp,
            comments
          } : undefined,
          capa: f.capa ? { ...f.capa, status: decision === 'approve' ? 'approved' : 'returned' } : undefined,
          auditTrail: [auditEntry, ...(f.auditTrail || [])]
        };
      }
      return f;
    }));

    if (decision === 'approve') {
      addNotification({
        title: `CAPA Plan Approved: ${findingId}`,
        titleAr: `تم اعتماد خطة الـ CAPA: ${findingId}`,
        message: `SQM approved CAPA plan for ${findingId}. S&Q must now monitor implementation and verify effectiveness.`,
        messageAr: `اعتمد مدير السلامة والجودة خطة الـ CAPA للملاحظة ${findingId}. يتوجب على S&Q متابعة التنفيذ وقياس الفعالية.`,
        targetRoles: ['safety_officer', 'hod_safety', 'hod_ops', 'hod_maint'],
        sourceFindingId: findingId,
        priority: 'normal',
        category: 'plan_approved'
      });
    } else {
      addNotification({
        title: `CAPA Plan Returned: ${findingId}`,
        titleAr: `تمت إعادة خطة الـ CAPA للتعديل: ${findingId}`,
        message: `SQM returned CAPA plan for ${findingId} with comments: "${comments}". HoD must update and resubmit.`,
        messageAr: `أعاد مدير السلامة والجودة خطة الـ CAPA للملاحظة ${findingId} مع ملاحظات: "${comments}". يجب على مدير الإدارة التعديل وإعادة الإرسال.`,
        targetRoles: ['hod_ops', 'hod_maint', 'hod_training', 'safety_officer'],
        sourceFindingId: findingId,
        priority: 'critical',
        category: 'plan_returned'
      });
    }
  };

  // Step 7: Record Finding Effectiveness & Residual Risk (S&Q)
  const recordFindingEffectiveness = (
    findingId: string,
    payload: {
      isEffective: boolean;
      evaluationNotes: string;
      residualRisk: RiskAssessment;
      evidenceSummary?: string;
      attachmentName?: string;
    },
    actorName: string = 'Mahmoud Ezz (Safety Officer)'
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        const auditEntry: AuditTrailEntry = {
          id: `AT-${Date.now()}-07`,
          timestamp,
          actorName,
          actorRole: activeRole,
          action: 'Effectiveness & Residual Risk Recorded',
          details: `Effectiveness: ${payload.isEffective ? 'EFFECTIVE' : 'NOT EFFECTIVE'}. Residual Risk: ${payload.residualRisk.scoreCode} (${payload.residualRisk.level}). Ready for SQM Final Sign-off.`,
          previousStatus: f.lifecycleStatus,
          newStatus: 'pending_signoff'
        };
        return {
          ...f,
          lifecycleStatus: 'pending_signoff',
          lifecycleStage: 'implemented',
          effectivenessEvaluation: {
            evaluatedBy: actorName,
            evaluatedAt: timestamp,
            isEffective: payload.isEffective,
            evaluationNotes: payload.evaluationNotes,
            evidenceSummary: payload.evidenceSummary
          },
          residualRisk: payload.residualRisk,
          postMitigationRisk: payload.residualRisk,
          auditTrail: [auditEntry, ...(f.auditTrail || [])]
        };
      }
      return f;
    }));

    addNotification({
      title: `Finding Ready for Final Sign-off: ${findingId}`,
      titleAr: `الملاحظة جاهزة للتوقيع النهائي والإغلاق: ${findingId}`,
      message: `Effectiveness and residual risk evaluated for ${findingId}. SQM final digital sign-off and closure required.`,
      messageAr: `تم تسجيل تقييم الفعالية والخطر المتبقي للملاحظة ${findingId}. مطلوب اعتماد مدير السلامة والتوقيع الرقمي للإغلاق.`,
      targetRoles: ['hod_safety', 'ae', 'ghm'],
      sourceFindingId: findingId,
      priority: 'urgent',
      category: 'signoff_ready'
    });
  };

  // Step 8: Final Sign-off & Closure (SQM Only)
  const finalSignoffAndCloseFinding = (
    findingId: string,
    comments: string = 'All corrective actions and residual risk verified. Officially closed.',
    actorName: string = 'Dr. Khaled Fawzy (Safety & Quality Manager)'
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const signatureHash = `RMF-DSIG-AUD-${Math.random().toString(36).substring(2, 8).toUpperCase()}-ICAO-SMS`;

    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        const auditEntry: AuditTrailEntry = {
          id: `AT-${Date.now()}-08`,
          timestamp,
          actorName,
          actorRole: activeRole,
          action: 'Finding Formally Closed & Digitally Signed',
          details: `Final sign-off by SQM. Digital Signature Hash: ${signatureHash}. ${comments}`,
          previousStatus: f.lifecycleStatus,
          newStatus: 'closed',
          comments
        };
        return {
          ...f,
          lifecycleStatus: 'closed',
          lifecycleStage: 'closed_verified',
          closedBy: actorName,
          closedAt: timestamp,
          closureNotes: comments,
          finalSignoff: {
            signedBy: actorName,
            signedAt: timestamp,
            comments,
            signatureHash
          },
          capa: f.capa ? { ...f.capa, status: 'verified' } : undefined,
          auditTrail: [auditEntry, ...(f.auditTrail || [])]
        };
      }
      return f;
    }));

    addNotification({
      title: `Finding Officially Closed: ${findingId}`,
      titleAr: `تم إغلاق ملاحظة التدقيق رسمياً: ${findingId}`,
      message: `Audit Finding ${findingId} closed and digitally signed by SQM. Digital hash: ${signatureHash}.`,
      messageAr: `تم إغلاق ملف ملاحظة التدقيق ${findingId} رسمياً من قِبل مدير السلامة والجودة وتوليد الختم الرقمي.`,
      targetRoles: ['safety_officer', 'hod_ops', 'hod_maint', 'sdm', 'ghm', 'ae'],
      sourceFindingId: findingId,
      priority: 'normal',
      category: 'closed'
    });
  };

  // Attachments for finding
  const addFindingAttachment = (
    findingId: string,
    file: { fileName: string; fileSize: string; fileType: string; category: FileAttachment['category'] }
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newAttachment: FileAttachment = {
      id: `ATT-${Date.now()}`,
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileType: file.fileType,
      uploadedBy: activeRole === 'hod_safety' ? 'Dr. Khaled Fawzy' : activeRole === 'safety_officer' ? 'Mahmoud Ezz' : 'Staff Member',
      uploadedRole: activeRole,
      uploadedAt: timestamp,
      category: file.category
    };

    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        const auditEntry: AuditTrailEntry = {
          id: `AT-${Date.now()}-ATT`,
          timestamp,
          actorName: newAttachment.uploadedBy,
          actorRole: activeRole,
          action: 'Document/Evidence Attached',
          details: `Uploaded ${file.fileName} (${file.fileSize}) under category ${file.category}.`
        };
        return {
          ...f,
          attachments: [newAttachment, ...(f.attachments || [])],
          auditTrail: [auditEntry, ...(f.auditTrail || [])]
        };
      }
      return f;
    }));
  };

  // Backwards-compatible aliases for findings
  const proposeFindingCAPA = (
    findingId: string, 
    corrective: string, 
    preventive: string, 
    targetDate: string,
    rcaMethod: 'simple' | 'five_whys',
    simpleRca?: SimpleRCA,
    fiveWhys?: string[]
  ) => {
    submitFindingCAPAPlan(findingId, {
      rcaType: rcaMethod,
      simpleRca,
      fiveWhysRca: fiveWhys,
      correctiveAction: corrective,
      preventiveAction: preventive
    });
  };

  const approveFindingCAPA = (findingId: string, approverName: string, comments: string) => {
    reviewFindingCAPAPlan(findingId, 'approve', comments, approverName);
  };

  const submitFindingEvidence = (findingId: string, notes: string, docRef: string) => {
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        return {
          ...f,
          implementationEvidence: {
            evidenceNotes: notes,
            documentRef: docRef,
            submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
          }
        };
      }
      return f;
    }));
  };

  const verifyCloseFinding = (findingId: string, verifierName: string, notes: string) => {
    finalSignoffAndCloseFinding(findingId, notes, verifierName);
  };

  const issueNoticeFromFinding = (findingId: string, title: string, titleAr: string, summary: string, actions: string[]): SafetyBulletin => {
    const nextSeq = String(bulletins.length + 8).padStart(3, '0');
    const newRef = `RMF-ION-2026-${nextSeq}`;
    const newNotice: SafetyBulletin = {
      id: `BUL-${Date.now()}`,
      refNumber: newRef,
      type: 'operational_notice',
      title,
      titleAr,
      issueDate: new Date().toISOString().substring(0, 10),
      targetDepartments: ["Operations - Ramp Services"],
      priority: 'routine',
      summary,
      summaryAr: summary,
      content: `Notice issued following audit non-conformity resolution ${findingId}.`,
      contentAr: `تم إصدار هذا التعميم التشغيلي عقب إغلاق ملاحظة المراجعة ${findingId}.`,
      mandatoryActions: actions,
      issuedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
      sourceFindingId: findingId,
      requiredStaffCount: 40,
      acknowledgments: []
    };

    setBulletins([newNotice, ...bulletins]);
    setFindings(prev => prev.map(f => f.id === findingId ? { ...f, issuedNoticeId: newRef } : f));
    return newNotice;
  };

  const addSPI = (spi: Omit<SPIItem, 'id' | 'lastUpdated'>) => {
    const nextSeq = String(spis.length + 1).padStart(2, '0');
    const newSPI: SPIItem = {
      ...spi,
      id: spi.code || `SPI-${nextSeq}`,
      lastUpdated: new Date().toISOString().substring(0, 10),
      historicalReadings: [
        {
          date: new Date().toISOString().substring(0, 10),
          value: spi.currentValue,
          period: 'Initial',
          notes: 'Baseline configuration'
        }
      ]
    };
    setSpis([...spis, newSPI]);
  };

  const updateSPI = (id: string, updated: Partial<SPIItem>) => {
    setSpis(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          ...updated,
          lastUpdated: new Date().toISOString().substring(0, 10)
        };
      }
      return s;
    }));
  };

  const deleteSPI = (id: string) => {
    setSpis(prev => prev.filter(s => s.id !== id));
  };

  const logSPIReading = (id: string, value: number, period?: string, turnsCount?: number, notes?: string) => {
    setSpis(prev => prev.map(s => {
      if (s.id === id) {
        const isLowerBetter = s.targetDirection !== 'higher_is_better';
        let status: 'nominal' | 'warning' | 'alert' = 'nominal';
        
        if (isLowerBetter) {
          if (value >= s.alertThreshold) status = 'alert';
          else if (value > s.targetSPT) status = 'warning';
          else status = 'nominal';
        } else {
          // Higher is better: targetSPT is high (e.g. 95%), alertThreshold is low (e.g. 85%)
          if (value <= s.alertThreshold) status = 'alert';
          else if (value < s.targetSPT) status = 'warning';
          else status = 'nominal';
        }

        let trend: 'improving' | 'stable' | 'deteriorating' = 'stable';
        const diff = value - s.currentValue;
        if (Math.abs(diff) < 0.001) {
          trend = 'stable';
        } else if (isLowerBetter) {
          trend = diff < 0 ? 'improving' : 'deteriorating';
        } else {
          trend = diff > 0 ? 'improving' : 'deteriorating';
        }

        const history = s.historicalReadings || [];
        const newRecord = {
          date: new Date().toISOString().substring(0, 10),
          value,
          period: period || new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }),
          turnsCount,
          notes
        };

        return {
          ...s,
          currentValue: value,
          status,
          trend,
          historicalReadings: [...history, newRecord].slice(-15),
          lastUpdated: new Date().toISOString().substring(0, 10)
        };
      }
      return s;
    }));
  };

  const issueBulletin = (b: Omit<SafetyBulletin, 'id' | 'refNumber' | 'issueDate' | 'acknowledgments'>): SafetyBulletin => {
    const nextSeq = String(bulletins.length + 5).padStart(3, '0');
    const ref = b.type === 'bulletin' ? `RMF-SB-2026-${nextSeq}` : `RMF-ION-2026-${nextSeq}`;
    const newB: SafetyBulletin = {
      ...b,
      id: `BUL-${Date.now()}`,
      refNumber: ref,
      issueDate: new Date().toISOString().substring(0, 10),
      acknowledgments: []
    };
    setBulletins([newB, ...bulletins]);
    return newB;
  };

  const acknowledgeBulletin = (bulletinId: string, staffName: string, badgeNumber: string, department: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setBulletins(prev => prev.map(b => {
      if (b.id === bulletinId) {
        if (b.acknowledgments.some(a => a.badgeNumber === badgeNumber)) return b;
        return {
          ...b,
          acknowledgments: [
            ...b.acknowledgments,
            {
              staffId: badgeNumber,
              staffName,
              badgeNumber,
              department,
              acknowledgedAt: now,
              signature: staffName
            }
          ]
        };
      }
      return b;
    }));
  };

  const createMoC = (moc: Omit<ManagementOfChange, 'id' | 'initiationDate' | 'status' | 'approvals' | 'postReviewDone'>) => {
    const nextSeq = String(mocs.length + 1).padStart(3, '0');
    const newMoC: ManagementOfChange = {
      ...moc,
      id: `RMF-MOC-2026-${nextSeq}`,
      initiationDate: new Date().toISOString().substring(0, 10),
      status: 'draft',
      approvals: {
        hodApproved: false,
        sqmApproved: false,
        aeApproved: false
      },
      postReviewDone: false
    };
    setMocs([newMoC, ...mocs]);
  };

  const updateMoCApproval = (id: string, stage: 'hod' | 'sqm' | 'ae', approverName: string) => {
    const now = new Date().toISOString().substring(0, 10);
    setMocs(prev => prev.map(m => {
      if (m.id === id) {
        const approvals = { ...m.approvals };
        let status = m.status;

        if (stage === 'hod') {
          approvals.hodApproved = true;
          approvals.hodName = approverName;
          approvals.hodDate = now;
          status = 'hod_reviewed';
        } else if (stage === 'sqm') {
          approvals.sqmApproved = true;
          approvals.sqmName = approverName;
          approvals.sqmDate = now;
          status = 'sqm_reviewed';
        } else if (stage === 'ae') {
          approvals.aeApproved = true;
          approvals.aeName = approverName;
          approvals.aeDate = now;
          status = 'ae_approved';
        }

        return { ...m, approvals, status };
      }
      return m;
    }));
  };

  const markMoCImplemented = (id: string) => {
    setMocs(prev => prev.map(m => m.id === id ? { ...m, status: 'implemented' } : m));
  };

  const completeMoCPostReview = (id: string, notes: string) => {
    setMocs(prev => prev.map(m => m.id === id ? { ...m, postReviewDone: true, postReviewNotes: notes, status: 'closed' } : m));
  };

  // =========================================================================
  // GSE FLEET (Full CRUD & Tag Defect Management)
  // =========================================================================

  const addGSEVehicle = (vehicle: Omit<GSEVehicle, 'id'> & { id?: string }): GSEVehicle => {
    const prefix = vehicle.type.toUpperCase().includes('TUG') || vehicle.type.toUpperCase().includes('TRACTOR')
      ? 'TUG'
      : vehicle.type.toUpperCase().includes('BELT')
      ? 'BL'
      : vehicle.type.toUpperCase().includes('GPU')
      ? 'GPU'
      : vehicle.type.toUpperCase().includes('STAIR') || vehicle.type.toUpperCase().includes('STEP')
      ? 'STAIR'
      : vehicle.type.toUpperCase().includes('WATER')
      ? 'WSU'
      : vehicle.type.toUpperCase().includes('LAV')
      ? 'LSU'
      : 'GSE';
    const nextSeq = String(gseFleet.length + 1).padStart(2, '0');
    const autoId = vehicle.id && vehicle.id.trim() ? vehicle.id.trim() : `RMF-${prefix}-${nextSeq}`;
    const timestamp = new Date().toISOString().substring(0, 10);
    const timeFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const initialHistoryEntry = {
      id: `GSE-LOG-${Date.now()}`,
      timestamp: timeFormatted,
      tag: vehicle.tagStatus,
      notes: vehicle.activeDefectNotes || (vehicle.tagStatus === 'green' ? 'Equipment registered and verified fit for service.' : 'Initial tag status assigned upon fleet intake.'),
      changedBy: 'GSE Maintenance Lead'
    };

    const newVehicle: GSEVehicle = {
      ...vehicle,
      id: autoId,
      lastInspectionDate: vehicle.lastInspectionDate || timestamp,
      tagHistory: [initialHistoryEntry],
      serviceClearanceNotes: vehicle.tagStatus === 'green' ? (vehicle.activeDefectNotes || 'Initial acceptance fit for service') : undefined,
      activeDefectNotes: vehicle.tagStatus === 'green' ? undefined : vehicle.activeDefectNotes
    };

    setGseFleet(prev => [newVehicle, ...prev]);

    addNotification({
      title: `New GSE Equipment Added: ${newVehicle.id}`,
      titleAr: `تمت إضافة معدة أرضية جديدة للأسطول: ${newVehicle.id}`,
      message: `${newVehicle.name} (${newVehicle.type}) added to active fleet register. Tag: ${newVehicle.tagStatus.toUpperCase()}.`,
      messageAr: `تم تسجيل ${newVehicle.name} في سجل أسطول المعدات الأرضية بحالة: ${newVehicle.tagStatus}.`,
      targetRoles: ['hod_maint', 'safety_officer', 'hod_safety', 'hod_ops'],
      priority: 'normal',
      category: 'new_report'
    });

    return newVehicle;
  };

  const updateGSEVehicle = (id: string, updated: Partial<GSEVehicle>) => {
    setGseFleet(prev => prev.map(g => {
      if (g.id === id) {
        return {
          ...g,
          ...updated
        };
      }
      return g;
    }));
  };

  const deleteGSEVehicle = (id: string) => {
    setGseFleet(prev => prev.filter(g => g.id !== id));
    addNotification({
      title: `GSE Equipment De-registered: ${id}`,
      titleAr: `تم إلغاء تسجيل معدة أرضية: ${id}`,
      message: `Equipment ${id} has been removed from the active Marsa Alam GSE fleet register.`,
      messageAr: `تم حذف المعدة ${id} من سجل أسطول المعدات الأرضية النشط بمطار مرسى علم.`,
      targetRoles: ['hod_maint', 'safety_officer', 'hod_safety'],
      priority: 'normal',
      category: 'closed'
    });
  };

  const updateGSETag = (
    id: string, 
    status: 'green' | 'amber' | 'red', 
    notes?: string,
    actorName: string = 'GSE Maintenance Lead'
  ) => {
    const timestamp = new Date().toISOString().substring(0, 10);
    const timeFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setGseFleet(prev => prev.map(g => {
      if (g.id === id) {
        const trimmedNotes = notes ? notes.trim() : '';

        // Crucial fix: When transitioning to Green Tag (Fit for Service):
        // The previous active defect statement MUST NOT remain!
        // The notes entered by user when selecting Green Tag become the clearance/service statement.
        let newActiveDefectNotes: string | undefined;
        let newClearanceNotes: string | undefined = g.serviceClearanceNotes;
        let clearedBy: string | undefined = g.clearedBy;
        let clearedAt: string | undefined = g.clearedAt;

        if (status === 'green') {
          // Clear active defect, record clearance notes
          newActiveDefectNotes = undefined;
          newClearanceNotes = trimmedNotes || 'Maintenance completed, defect rectified, verified fit for flightline service.';
          clearedBy = actorName;
          clearedAt = timeFormatted;
        } else if (status === 'amber') {
          newActiveDefectNotes = trimmedNotes || 'Scheduled maintenance due / deferred item active.';
        } else {
          // red tag
          newActiveDefectNotes = trimmedNotes || 'Grounded - Out of Service pending maintenance.';
        }

        const logEntry = {
          id: `GSE-LOG-${Date.now()}`,
          timestamp: timeFormatted,
          tag: status,
          notes: trimmedNotes || (status === 'green' ? 'Fit for service tag restored.' : status === 'amber' ? 'Maintenance due tag applied.' : 'Red tag grounding applied.'),
          changedBy: actorName
        };

        return {
          ...g,
          tagStatus: status,
          activeDefectNotes: newActiveDefectNotes,
          serviceClearanceNotes: newClearanceNotes,
          clearedBy,
          clearedAt,
          lastInspectionDate: timestamp,
          tagHistory: [logEntry, ...(g.tagHistory || [])]
        };
      }
      return g;
    }));

    if (status === 'red') {
      addNotification({
        title: `GSE Equipment Grounded (Red Tag): ${id}`,
        titleAr: `تم إيقاف معدة أرضية عن العمل (بطاقة حمراء): ${id}`,
        message: `Equipment ${id} tagged RED and grounded. Defect: ${notes || 'Immediate maintenance required.'}`,
        messageAr: `تم وضع بطاقة حمراء على المعدة ${id} وإيقافها عن العمل. السبب: ${notes || 'صيانة فورية مطلوبة.'}`,
        targetRoles: ['hod_maint', 'hod_ops', 'safety_officer', 'sdm', 'ghm'],
        priority: 'urgent',
        category: 'level_assigned'
      });
    } else if (status === 'green') {
      addNotification({
        title: `GSE Equipment Cleared (Green Tag): ${id}`,
        titleAr: `تمت إعادة المعدة للخدمة (بطاقة خضراء): ${id}`,
        message: `Equipment ${id} tagged GREEN and returned to service. Clearance: ${notes || 'Defect cleared and verified.'}`,
        messageAr: `تم وضع بطاقة خضراء على المعدة ${id} والتصريح بعودتها للخدمة بالساحة. ملاحظات: ${notes || 'تم إصلاح العطل والتحقق.'}`,
        targetRoles: ['hod_maint', 'hod_ops', 'safety_officer'],
        priority: 'normal',
        category: 'closed'
      });
    }
  };

  // =========================================================================
  // AUDIT CHECKLIST TEMPLATES (Template Manager)
  // =========================================================================

  const addAuditTemplate = (tpl: Omit<AuditTemplate, 'id' | 'createdAt'>): AuditTemplate => {
    const nextId = `TPL-${tpl.discipline}-${Date.now().toString().slice(-4)}`;
    const newTemplate: AuditTemplate = {
      ...tpl,
      id: nextId,
      createdAt: new Date().toISOString().substring(0, 10),
      items: tpl.items || []
    };
    setAuditTemplates(prev => [newTemplate, ...prev]);
    addNotification({
      title: `Audit Template Created: ${newTemplate.title}`,
      titleAr: `تم إنشاء نموذج تدقيق جديد: ${newTemplate.titleAr || newTemplate.title}`,
      message: `Reusable audit checklist template ${newTemplate.id} (${newTemplate.standardFramework}) added with ${newTemplate.items.length} criteria items.`,
      messageAr: `تمت إضافة نموذج التدقيق ${newTemplate.id} ويتضمن ${newTemplate.items.length} معيار تدقيق.`,
      targetRoles: ['hod_safety', 'safety_officer', 'sdm', 'ghm'],
      priority: 'normal',
      category: 'new_report'
    });
    return newTemplate;
  };

  const updateAuditTemplate = (id: string, updated: Partial<AuditTemplate>) => {
    setAuditTemplates(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          ...updated,
          updatedAt: new Date().toISOString().substring(0, 10)
        };
      }
      return t;
    }));
  };

  const deleteAuditTemplate = (id: string) => {
    setAuditTemplates(prev => prev.filter(t => t.id !== id));
  };

  // =========================================================================
  // TRAINING & COMPETENCY COMPLIANCE (Full CRUD)
  // =========================================================================

  const addStaffTrainingRecord = (record: Omit<StaffTrainingRecord, 'id'>): StaffTrainingRecord => {
    const nextSeq = String(trainingRecords.length + 1).padStart(2, '0');
    const newRecord: StaffTrainingRecord = {
      ...record,
      id: `TR-STAFF-${nextSeq}-${Math.floor(100 + Math.random() * 900)}`,
      courses: record.courses || []
    };
    setTrainingRecords(prev => [...prev, newRecord]);
    addNotification({
      title: `Staff Added to Compliance Matrix: ${newRecord.name}`,
      titleAr: `تمت إضافة موظف لمصفوفة التدريب والكفاءات: ${newRecord.name}`,
      message: `${newRecord.name} (${newRecord.badgeNumber}) added to ${newRecord.department} with ${newRecord.courses.length} qualifications.`,
      messageAr: `تم تسجيل الموظف ${newRecord.name} (شارة ${newRecord.badgeNumber}) بإدارة ${newRecord.department}.`,
      targetRoles: ['hod_training', 'hod_safety'],
      priority: 'normal',
      category: 'new_report'
    });
    return newRecord;
  };

  const updateStaffTrainingRecord = (id: string, updated: Partial<StaffTrainingRecord>) => {
    setTrainingRecords(prev => prev.map(tr => tr.id === id ? { ...tr, ...updated } : tr));
  };

  const deleteStaffTrainingRecord = (id: string) => {
    setTrainingRecords(prev => prev.filter(tr => tr.id !== id));
  };

  const addStaffCourse = (staffId: string, course: StaffCourse) => {
    setTrainingRecords(prev => prev.map(tr => {
      if (tr.id === staffId) {
        const existing = tr.courses.filter(c => c.courseId !== course.courseId);
        return {
          ...tr,
          courses: [...existing, course]
        };
      }
      return tr;
    }));
  };

  const updateStaffCourse = (staffId: string, courseId: string, updated: Partial<StaffCourse>) => {
    setTrainingRecords(prev => prev.map(tr => {
      if (tr.id === staffId) {
        return {
          ...tr,
          courses: tr.courses.map(c => c.courseId === courseId ? { ...c, ...updated } : c)
        };
      }
      return tr;
    }));
  };

  const deleteStaffCourse = (staffId: string, courseId: string) => {
    setTrainingRecords(prev => prev.map(tr => {
      if (tr.id === staffId) {
        return {
          ...tr,
          courses: tr.courses.filter(c => c.courseId !== courseId)
        };
      }
      return tr;
    }));
  };

  const recertifyStaffCourse = (staffId: string, courseId: string, newExpiryDate: string, certifiedDate?: string) => {
    const today = certifiedDate || new Date().toISOString().substring(0, 10);
    const expDate = new Date(newExpiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let status: 'valid' | 'expiring' | 'expired' = 'valid';
    if (diffDays <= 0) {
      status = 'expired';
    } else if (diffDays <= 30) {
      status = 'expiring';
    }

    setTrainingRecords(prev => prev.map(tr => {
      if (tr.id === staffId) {
        return {
          ...tr,
          courses: tr.courses.map(c => {
            if (c.courseId === courseId) {
              return {
                ...c,
                certifiedDate: today,
                expiryDate: newExpiryDate,
                status
              };
            }
            return c;
          })
        };
      }
      return tr;
    }));

    addNotification({
      title: `Staff Qualification Recertified: ${courseId}`,
      titleAr: `تم تجديد اعتماد وتدريب الموظف: ${courseId}`,
      message: `Course ${courseId} recertified with new expiry date: ${newExpiryDate}.`,
      messageAr: `تم تحديث صلاحية الدورة ${courseId} إلى تاريخ ${newExpiryDate}.`,
      targetRoles: ['hod_training', 'hod_safety'],
      priority: 'normal',
      category: 'closed'
    });
  };

  const updateRolePermission = (role: string, permission: keyof RolePermissions, value: boolean) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: value
      }
    }));
  };

  const addUser = (userData: Omit<UserRecord, 'id'>) => {
    const nextSeq = String(users.length + 1).padStart(2, '0');
    const newUser: UserRecord = {
      ...userData,
      id: `USR-${nextSeq}`
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<UserRecord>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addDepartment = (dept: Omit<DepartmentConfig, 'id'> & { id?: string }) => {
    const nextSeq = String(departments.length + 1).padStart(2, '0');
    const newDept: DepartmentConfig = {
      id: dept.id || `DEPT-CUSTOM-${nextSeq}`,
      name: dept.name,
      nameAr: dept.nameAr || dept.name,
      headOfDepartment: dept.headOfDepartment,
      subUnits: dept.subUnits || [],
      staffCount: dept.staffCount || 0
    };
    setDepartments(prev => [...prev, newDept]);
  };

  const updateDepartment = (id: string, updates: Partial<DepartmentConfig>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  const addRole = (roleData: { key: string; label: string; labelAr?: string; clearance: string; permissions?: Partial<RolePermissions> }) => {
    const formattedKey = roleData.key.toLowerCase().trim().replace(/\s+/g, '_');
    const newRole: RoleDefinition = {
      key: formattedKey,
      label: roleData.label,
      labelAr: roleData.labelAr || roleData.label,
      clearance: roleData.clearance || 'Custom Role',
      isSystem: false
    };
    setRoles(prev => [...prev, newRole]);
    setRolePermissions(prev => ({
      ...prev,
      [formattedKey]: {
        canViewQuickReport: true,
        canViewIncidentLogs: true,
        canViewAudits: false,
        canViewSPI: false,
        canViewKPIDashboard: true,
        canViewBulletins: true,
        canViewMoC: false,
        canViewGSE: false,
        canViewTraining: false,
        canViewMgmtReview: false,
        canViewUsersAndAccess: false,
        canConfigureForm: false,
        investigateReports: false,
        approveCAPA: false,
        closeReports: false,
        executeAudits: false,
        manageSPI: false,
        issueBulletins: false,
        approveMoC: false,
        adminConfig: false,
        ...(roleData.permissions || {})
      }
    }));
  };

  const updateRole = (key: string, updates: { label?: string; labelAr?: string; clearance?: string }) => {
    setRoles(prev => prev.map(r => r.key === key ? { ...r, ...updates } : r));
  };

  const deleteRole = (key: string) => {
    setRoles(prev => prev.filter(r => r.key !== key));
    setRolePermissions(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const resetStationData = () => {
    localStorage.removeItem('rmf_reports_v2');
    localStorage.removeItem('rmf_notifications');
    localStorage.removeItem('rmf_audits_sched');
    localStorage.removeItem('rmf_findings');
    localStorage.removeItem('rmf_spis');
    localStorage.removeItem('rmf_bulletins');
    localStorage.removeItem('rmf_mocs');
    localStorage.removeItem('rmf_gse');
    localStorage.removeItem('rmf_training');
    localStorage.removeItem('rmf_users');
    localStorage.removeItem('rmf_departments');
    localStorage.removeItem('rmf_roles');
    localStorage.removeItem('rmf_form_config');
    localStorage.removeItem('rmf_role_perms');
    localStorage.removeItem('rmf_audit_templates_v1');

    setReports(INITIAL_REPORTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditSchedule(INITIAL_AUDIT_SCHEDULE);
    setFindings(INITIAL_FINDINGS);
    setAuditTemplates(INITIAL_AUDIT_TEMPLATES);
    setSpis(INITIAL_SPIS);
    setBulletins(INITIAL_BULLETINS);
    setMocs(INITIAL_MOCS);
    setGseFleet(INITIAL_GSE);
    setTrainingRecords(INITIAL_TRAINING);
    setUsers(INITIAL_USERS);
    setDepartments(INITIAL_DEPARTMENTS);
    setRoles(INITIAL_ROLES);
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    setSafetyFormConfig(INITIAL_FORM_CONFIG);
    setBulletins(INITIAL_BULLETINS);
    setMocs(INITIAL_MOCS);
    setGseFleet(INITIAL_GSE);
    setTrainingRecords(INITIAL_TRAINING);
    setUsers(INITIAL_USERS);
    setSafetyFormConfig(INITIAL_FORM_CONFIG);
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        activeRole,
        setActiveRole,
        activeView,
        setActiveView,
        isViewPermitted,
        safetyFormConfig,
        updateSafetyFormConfig,
        resetSafetyFormConfig,
        reports,
        addSafetyReport,
        acknowledgeReport,
        assignReportLevel,
        startOrUpdateInvestigation,
        submitCAPAPlan,
        reviewCAPAPlan,
        recordEffectiveness,
        finalSignoffAndClose,
        addReportAttachment,
        issueBulletinFromReport,
        updateInvestigation,
        setPreMitigationRisk,
        setReportRCA,
        setReportCAPA,
        markReportCAPAImplemented,
        setPostMitigationRisk,
        closeSafetyReport,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        addNotification,
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
        proposeFindingCAPA,
        approveFindingCAPA,
        submitFindingEvidence,
        verifyCloseFinding,
        issueNoticeFromFinding,
        spis,
        addSPI,
        updateSPI,
        deleteSPI,
        logSPIReading,
        bulletins,
        issueBulletin,
        acknowledgeBulletin,
        mocs,
        createMoC,
        updateMoCApproval,
        markMoCImplemented,
        completeMoCPostReview,
        gseFleet,
        addGSEVehicle,
        updateGSEVehicle,
        deleteGSEVehicle,
        updateGSETag,
        auditTemplates,
        addAuditTemplate,
        updateAuditTemplate,
        deleteAuditTemplate,
        trainingRecords,
        addStaffTrainingRecord,
        updateStaffTrainingRecord,
        deleteStaffTrainingRecord,
        addStaffCourse,
        updateStaffCourse,
        deleteStaffCourse,
        recertifyStaffCourse,
        users,
        addUser,
        updateUser,
        deleteUser,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        roles,
        addRole,
        updateRole,
        deleteRole,
        rolePermissions,
        updateRolePermission,
        reviewSelections,
        setReviewSelections,
        resetStationData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
