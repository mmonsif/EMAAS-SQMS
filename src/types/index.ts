export type Language = 'en' | 'ar';
export type ThemeMode = 'dark' | 'light';

export type StationRole = 
  | 'ae'             // Accountable Executive
  | 'ghm'            // Ground Handling Manager
  | 'sdm'            // Service Delivery Manager
  | 'hod_ops'        // Head of Operations (Ramp, Load, Pax)
  | 'hod_maint'      // Head of Maintenance (GSE)
  | 'hod_safety'     // Safety & Quality Manager
  | 'hod_training'   // Head of Training
  | 'safety_officer' // Safety Officer / Investigator
  | 'ramp_supervisor'// Ramp Shift Supervisor
  | 'field_staff';   // Frontline Ramp/Gate Agent

export type ReportCategory = 
  | 'hazard' 
  | 'near_miss' 
  | 'gse_damage' 
  | 'personal_injury' 
  | 'fod' 
  | 'delay';

export type ReportLifecycleStatus = 
  | 'submitted' 
  | 'acknowledged' 
  | 'investigating' 
  | 'capa_pending' 
  | 'capa_implemented' 
  | 'closed';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface RiskAssessment {
  severity: number;    // 1 (Negligible) to 5 (Catastrophic)
  likelihood: string;  // 'A' (Extremely Improbable) to 'E' (Frequent)
  scoreCode: string;   // e.g. "4B", "2E"
  level: RiskLevel;
  notes?: string;
}

export interface SimpleRCA {
  directCause: string;
  contributingFactor: string;
  systemicGap: string;
}

export interface CAPAItem {
  correctiveAction: string;       // Immediate containment
  preventiveAction: string;        // Long-term system fix
  assignedDepartment: string;
  assignedManager: string;
  targetDate: string;
  implementedDate?: string;
  status: 'pending' | 'implemented' | 'verified';
}

export interface SafetyReport {
  id: string; // RMF-SMS-2026-XXXX
  timestamp: string;
  reporterType: 'anonymous' | 'identified';
  reporterName?: string;
  reporterBadge?: string;
  department: string;
  category: ReportCategory;
  location: string;
  standNumber?: string;
  description: string;
  photoUrl?: string;
  aircraftReg?: string;
  flightNumber?: string;
  gseIdLinked?: string;
  lifecycleStatus: ReportLifecycleStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  safetyOfficerAssigned?: string;
  investigationSummary?: string;
  preMitigationRisk?: RiskAssessment;
  rcaType?: 'simple' | 'five_whys';
  simpleRca?: SimpleRCA;
  fiveWhysRca?: string[];
  capa?: CAPAItem;
  postMitigationRisk?: RiskAssessment;
  issuedBulletinId?: string;
  closedBy?: string;
  closedAt?: string;
  closureNotes?: string;
}

export type AuditType = 'internal' | 'external';
export type AuditDiscipline = 'ORM' | 'PAX' | 'BAG' | 'RMP' | 'LOD';
export type AuditSeverity = 'Level 1' | 'Level 2' | 'Level 3'; // Critical, Major, Observation
export type AuditLifecycleStage = 
  | 'raised' 
  | 'acknowledged' 
  | 'capa_proposed' 
  | 'sqm_approved' 
  | 'implemented' 
  | 'closed_verified';

export interface AuditFinding {
  id: string; // RMF-AUD-2026-XXXX
  auditType: AuditType;
  auditTitle: string;
  externalAuditorOrg?: string; // e.g. "IATA ISAGO", "ECAA", "EgyptAir", "TUI Fly"
  isagoDiscipline: AuditDiscipline;
  standardReference: string; // e.g. "ISAGO RMP 2.3.1"
  severityLevel: AuditSeverity;
  description: string;
  assignedDepartment: string;
  assignedHoD: string;
  raisedDate: string;
  deadlineDate: string;
  lifecycleStage: AuditLifecycleStage;
  acknowledgedAt?: string;
  rcaMethod?: 'simple' | 'five_whys';
  simpleRca?: SimpleRCA;
  fiveWhysRca?: string[];
  capaProposal?: {
    correctiveAction: string;
    preventiveAction: string;
    targetDate: string;
    proposedAt: string;
  };
  sqmApproval?: {
    approvedBy: string;
    approvedAt: string;
    comments: string;
  };
  implementationEvidence?: {
    evidenceNotes: string;
    documentRef: string;
    submittedAt: string;
  };
  effectivenessVerification?: {
    verifiedBy: string;
    verifiedAt: string;
    isEffective: boolean;
    verificationNotes: string;
  };
  issuedNoticeId?: string;
}

export interface AuditScheduleItem {
  id: string;
  title: string;
  auditType: AuditType;
  auditorOrganization: string;
  leadAuditor: string;
  discipline: AuditDiscipline;
  scheduledDate: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  status: 'planned' | 'in_progress' | 'completed' | 'overdue';
  findingsCount: number;
  scopeSummary: string;
}

export type GSETagStatus = 'green' | 'amber' | 'red'; // Fit for Service, Maintenance Due, Grounded

export interface GSEVehicle {
  id: string; // RMF-TUG-01, RMF-BL-04
  name: string;
  type: string;
  tagStatus: GSETagStatus;
  manufacturer: string;
  locationStand: string;
  operatingHours: number;
  lastInspectionDate: string;
  nextServiceDue: string;
  activeDefectNotes?: string;
  activeDefectReportId?: string;
}

export interface StaffCourse {
  courseId: string;
  courseName: string;
  certifiedDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring' | 'expired';
}

export interface StaffTrainingRecord {
  id: string;
  name: string;
  badgeNumber: string;
  department: string;
  roleTitle: string;
  courses: StaffCourse[];
}

export interface SPIItem {
  id: string;
  code: string; // SPI-01
  name: string;
  nameAr: string;
  description: string;
  unit: string;
  baseline: number;
  targetSPT: number;
  alertThreshold: number;
  currentValue: number;
  trend: 'improving' | 'stable' | 'deteriorating';
  frequency: 'Monthly' | 'Quarterly';
  status: 'nominal' | 'warning' | 'alert';
  lastUpdated: string;
}

export interface BulletinAcknowledgment {
  staffId: string;
  staffName: string;
  badgeNumber: string;
  department: string;
  acknowledgedAt: string;
  signature: string;
}

export interface SafetyBulletin {
  id: string; // RMF-SB-2026-004 or RMF-ION-2026-012
  refNumber: string;
  type: 'bulletin' | 'operational_notice';
  title: string;
  titleAr: string;
  issueDate: string;
  targetDepartments: string[];
  priority: 'routine' | 'urgent' | 'critical';
  summary: string;
  summaryAr: string;
  content: string;
  contentAr: string;
  mandatoryActions: string[];
  issuedBy: string;
  sourceReportId?: string;
  sourceFindingId?: string;
  requiredStaffCount: number;
  acknowledgments: BulletinAcknowledgment[];
}

export type MoCCategory = 
  | 'organizational' 
  | 'sop_revision' 
  | 'equipment' 
  | 'infrastructure' 
  | 'new_airline';

export type MoCStatus = 
  | 'draft' 
  | 'hod_reviewed' 
  | 'sqm_reviewed' 
  | 'ae_approved' 
  | 'implemented' 
  | 'closed';

export interface MoCHazard {
  id: string;
  hazardDescription: string;
  initialRisk: string;
  mitigationMeasure: string;
  residualRisk: string;
  actionOwner: string;
  deadline: string;
  status: 'open' | 'completed';
}

export interface ManagementOfChange {
  id: string; // RMF-MOC-2026-001
  title: string;
  category: MoCCategory;
  initiatorName: string;
  department: string;
  initiationDate: string;
  targetImplementationDate: string;
  reasonForChange: string;
  hazards: MoCHazard[];
  status: MoCStatus;
  approvals: {
    hodApproved: boolean;
    hodName?: string;
    hodDate?: string;
    sqmApproved: boolean;
    sqmName?: string;
    sqmDate?: string;
    aeApproved: boolean;
    aeName?: string;
    aeDate?: string;
  };
  postReviewDone: boolean;
  postReviewNotes?: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  badgeNumber: string;
  department: string;
  role: StationRole;
  isActive: boolean;
  phone: string;
}

export interface DepartmentConfig {
  id: string;
  name: string;
  nameAr: string;
  headOfDepartment: string;
  subUnits: string[];
  staffCount: number;
}

export interface SafetyCategoryOption {
  key: string;
  labelEn: string;
  labelAr: string;
  icon: string;
  descEn: string;
  descAr: string;
  isActive: boolean;
}

export interface SafetyReportFormConfig {
  enableAnonymous: boolean;
  enableFlightNumber: boolean;
  requireFlightNumber: boolean;
  enableAircraftReg: boolean;
  requireAircraftReg: boolean;
  enableGSELink: boolean;
  requireGSELink: boolean;
  enablePhotoUpload: boolean;
  requirePhotoUpload: boolean;
  enableRiskMatrix: boolean;
  requireRiskMatrix: boolean;
  minDescriptionLength: number;
  customDisclaimerEn: string;
  customDisclaimerAr: string;
  categories: SafetyCategoryOption[];
  locations: string[];
}

export interface RolePermissions {
  // Navigation Module Access Flags
  canViewQuickReport: boolean;
  canViewIncidentLogs: boolean;
  canViewAudits: boolean;
  canViewSPI: boolean;
  canViewBulletins: boolean;
  canViewMoC: boolean;
  canViewGSE: boolean;
  canViewTraining: boolean;
  canViewMgmtReview: boolean;
  canViewUsersAndAccess: boolean;
  canConfigureForm: boolean;

  // Actions
  investigateReports: boolean;
  approveCAPA: boolean;
  closeReports: boolean;
  executeAudits: boolean;
  manageSPI: boolean;
  issueBulletins: boolean;
  approveMoC: boolean;
  adminConfig: boolean;
}

export interface ManagementReviewSelections {
  safetyPolicy: boolean;
  spiPerformance: boolean;
  incidentHeatmap: boolean;
  auditNonConformities: boolean;
  capaAging: boolean;
  safetyBulletins: boolean;
  mocProgress: boolean;
  gseReliability: boolean;
  trainingCompliance: boolean;
  resourceDirectives: boolean;
}
