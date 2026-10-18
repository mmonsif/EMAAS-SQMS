export type Language = 'en' | 'ar';
export type ThemeMode = 'dark' | 'light';

export type StationRole = 
  | 'ae'             // Accountable Executive
  | 'ghm'            // Ground Handling Manager
  | 'sdm'            // Service Delivery Manager
  | 'hod_ops'        // Head of Operations (Ramp, Load, Pax)
  | 'hod_maint'      // Head of Maintenance (GSE)
  | 'hod_safety'     // Safety & Quality Manager (SQM)
  | 'hod_training'   // Head of Training
  | 'safety_officer' // Safety Officer / Investigator / S&Q Member
  | 'ramp_supervisor'// Ramp Shift Supervisor
  | 'field_staff';   // Frontline Ramp/Gate Agent

export type ReportCategory = 
  | 'hazard' 
  | 'near_miss' 
  | 'gse_damage' 
  | 'personal_injury' 
  | 'fod' 
  | 'delay'
  | 'wildlife'
  | 'spill';

// Strict 10-State Machine for Safety Reports & Findings
export type ReportLifecycleStatus = 
  | 'submitted'              // 1. Frontline or Airline report submitted
  | 'acknowledged'           // 2. Safety Officer / S&Q acknowledged
  | 'level_assigned'         // 3. SQM assigned Level (Major 30d / Minor 60d / Obs 90d) & targetClosureDate set
  | 'under_investigation'    // 4. S&Q investigates: lists procedures, mitigations, initial risk index
  | 'plan_pending'           // 4b. S&Q assigns HoD and sets capaPlanDueDate
  | 'plan_under_review'      // 5. Assigned HoD submitted CAPA plan (RCA + Corrective + Preventive)
  | 'plan_returned'          // 6a. SQM returned plan for revision with comments
  | 'plan_approved'          // 6b. SQM approved the CAPA plan
  | 'effectiveness_pending'  // 7a. S&Q to record effectiveness
  | 'pending_signoff'        // 7b. S&Q recorded effectiveness & residual risk; awaiting SQM final sign-off
  | 'closed';                // 8. SQM final sign-off approved & digitally signed

// Investigation Level & Mandated Closure Timeline
export type InvestigationLevel = 'level_1' | 'level_2' | 'level_3';
// Level 1: Major – must be closed within 30 days
// Level 2: Minor – must be closed within 60 days
// Level 3: Observation – must be closed within 90 days

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
  submittedAt?: string;
  status: 'pending' | 'submitted' | 'returned' | 'approved' | 'implemented' | 'verified';
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: StationRole | string;
  action: string;
  details?: string;
  previousStatus?: ReportLifecycleStatus | string;
  newStatus?: ReportLifecycleStatus | string;
  comments?: string;
}

export interface FileAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedBy: string;
  uploadedRole: string;
  uploadedAt: string;
  category: 'initial_report' | 'investigation' | 'capa_plan' | 'effectiveness';
  url?: string;
}

export interface SQMSNotification {
  id: string;
  timestamp: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  targetRoles: (StationRole | string)[];
  targetUserId?: string;
  sourceReportId?: string;
  sourceFindingId?: string;
  priority: 'normal' | 'urgent' | 'critical';
  isRead: boolean;
  category: 
    | 'new_report' 
    | 'acknowledged' 
    | 'level_assigned' 
    | 'plan_assignment' 
    | 'plan_submitted' 
    | 'plan_returned' 
    | 'plan_approved' 
    | 'effectiveness_recorded' 
    | 'signoff_ready' 
    | 'closed' 
    | 'overdue_alert';
  emailSent?: boolean;
  emailRecipient?: string;
}

export interface SafetyReport {
  id: string; // RMF-SMS-2026-XXXX
  timestamp: string;
  reportSource: 'frontline_agent' | 'airline_report';
  airlineName?: string;
  airlineRefNumber?: string;
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
  
  // Step 2: Acknowledgment
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  
  // Step 3: Level Classification (SQM Only)
  level?: InvestigationLevel;
  levelAssignedBy?: string;
  levelAssignedAt?: string;
  targetClosureDate?: string; // Automatically calculated based on dateLevelAssigned + 30/60/90 days
  
  // Step 4: Investigation (S&Q)
  safetyOfficerAssigned?: string;
  investigationSummary?: string;
  existingProcedures?: string[];
  currentMitigations?: string;
  preMitigationRisk?: RiskAssessment;
  assignedHoD?: string;
  assignedHoDRole?: StationRole;
  capaPlanDueDate?: string;

  // Step 5: CAPA Plan (Assigned HoD)
  rcaType?: 'simple' | 'five_whys';
  simpleRca?: SimpleRCA;
  fiveWhysRca?: string[];
  capa?: CAPAItem;

  // Step 6: Plan Review (SQM)
  sqmPlanReviewDecision?: 'approve' | 'return';
  sqmPlanReviewComments?: string;
  sqmPlanReviewedAt?: string;
  sqmPlanReviewedBy?: string;

  // Step 7: Effectiveness & Residual Risk (S&Q)
  effectivenessEvaluation?: {
    evaluatedBy: string;
    evaluatedAt: string;
    isEffective: boolean;
    evaluationNotes: string;
    evidenceSummary?: string;
  };
  residualRisk?: RiskAssessment;
  postMitigationRisk?: RiskAssessment; // alias for residual risk

  // Step 8: Final Sign-off & Closure (SQM)
  finalSignoff?: {
    signedBy: string;
    signedAt: string;
    comments?: string;
    signatureHash: string;
  };
  closedBy?: string;
  closedAt?: string;
  closureNotes?: string;

  // Linked Bulletins & History
  issuedBulletinId?: string;
  auditTrail: AuditTrailEntry[];
  attachments: FileAttachment[];
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
  auditId?: string; // Links to AuditScheduleItem.id (e.g. AUD-SCH-2026-01)
  auditTitle: string;
  auditType: AuditType;
  externalAuditorOrg?: string; // e.g. "IATA ISAGO", "ECAA", "EgyptAir", "TUI Fly"
  isagoDiscipline: AuditDiscipline;
  standardReference: string; // e.g. "ISAGO RMP 2.3.1", "IGOM 4.1.2", "ICAO Annex 19 App 2"
  severityLevel?: AuditSeverity;
  title?: string;
  description: string;
  department: string;
  assignedDepartment: string;
  location?: string;
  raisedDate: string;
  deadlineDate?: string;

  // Unified Strict 10-State Machine Lifecycle (identical to SafetyReport)
  lifecycleStatus: ReportLifecycleStatus;
  lifecycleStage?: AuditLifecycleStage; // Backwards-compatible legacy alias

  // Step 2: Acknowledgment
  acknowledgedBy?: string;
  acknowledgedAt?: string;

  // Step 3: Level Classification (SQM Only)
  level?: InvestigationLevel;
  levelAssignedBy?: string;
  levelAssignedAt?: string;
  targetClosureDate?: string; // Automatically calculated based on dateLevelAssigned + 30/60/90 days
  levelComments?: string;

  // Step 4: Investigation (S&Q)
  safetyOfficerAssigned?: string;
  investigationSummary?: string;
  existingProcedures?: string[];
  currentMitigations?: string;
  preMitigationRisk?: RiskAssessment;
  assignedHoD?: string;
  assignedHoDRole?: StationRole;
  capaPlanDueDate?: string;

  // Step 5: CAPA Plan (Assigned HoD)
  rcaType?: 'simple' | 'five_whys';
  rcaMethod?: 'simple' | 'five_whys';
  simpleRca?: SimpleRCA;
  fiveWhysRca?: string[];
  capa?: CAPAItem;
  capaProposal?: {
    correctiveAction: string;
    preventiveAction: string;
    targetDate: string;
    proposedAt: string;
  };

  // Step 6: Plan Review (SQM)
  sqmPlanReviewDecision?: 'approve' | 'return';
  sqmPlanReviewComments?: string;
  sqmPlanReviewedAt?: string;
  sqmPlanReviewedBy?: string;
  sqmApproval?: {
    approvedBy: string;
    approvedAt: string;
    comments: string;
  };

  // Step 7: Effectiveness & Residual Risk (S&Q)
  effectivenessEvaluation?: {
    evaluatedBy: string;
    evaluatedAt: string;
    isEffective: boolean;
    evaluationNotes: string;
    evidenceSummary?: string;
  };
  residualRisk?: RiskAssessment;
  postMitigationRisk?: RiskAssessment;
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

  // Step 8: Final Sign-off & Closure (SQM)
  finalSignoff?: {
    signedBy: string;
    signedAt: string;
    comments?: string;
    signatureHash: string;
  };
  closedBy?: string;
  closedAt?: string;
  closureNotes?: string;

  // Linked Bulletins, Audit Trail & Attachments
  issuedNoticeId?: string;
  auditTrail: AuditTrailEntry[];
  attachments: FileAttachment[];
}

export interface AuditScheduleItem {
  id: string; // AUD-SCH-2026-XX
  title: string;
  titleAr?: string;
  auditType: AuditType;
  auditorOrganization: string;
  leadAuditor: string;
  auditTeam?: string[];
  discipline: AuditDiscipline;
  department?: string;
  location?: string;
  scheduledDate: string; // YYYY-MM-DD
  endDate?: string;      // YYYY-MM-DD
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  status: 'planned' | 'in_progress' | 'completed' | 'overdue' | 'closed';
  findingsCount: number;
  scopeSummary: string;
  executiveSummary?: string;
  checklistCriteria?: string[];
  attachments?: FileAttachment[];
  templateId?: string;
  checklistItems?: AuditChecklistItem[];
}

export interface AuditChecklistItem {
  id: string; // CHK-01
  code: string; // e.g. "ISAGO RMP 2.3.1", "IGOM 4.1.2"
  title: string;
  question: string;
  category: string; // e.g. "Aircraft Marshalling", "GSE Safety", "FOD Prevention", "Load Control"
  guidanceNotes?: string;
  mandatory: boolean;
}

export interface AuditTemplate {
  id: string; // TPL-ISAGO-RMP-01
  title: string;
  titleAr?: string;
  auditType: AuditType; // 'internal' | 'external'
  discipline: AuditDiscipline; // 'ORM' | 'RMP' | 'PAX' | 'LOD' | 'BAG'
  standardFramework: string; // e.g. "IATA ISAGO 14th Ed", "IATA IGOM 2026", "ICAO Doc 9859", "ECAR 139"
  scopeSummary: string;
  department: string;
  leadAuditorRole?: string;
  estimatedHours: number;
  items: AuditChecklistItem[];
  createdAt: string;
  updatedAt?: string;
  isDefault?: boolean;
}

export type GSETagStatus = 'green' | 'amber' | 'red'; // Fit for Service, Maintenance Due, Grounded

export interface GSETagLogEntry {
  id: string;
  timestamp: string;
  tag: GSETagStatus;
  notes: string;
  changedBy: string;
}

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
  serviceClearanceNotes?: string;
  clearedBy?: string;
  clearedAt?: string;
  tagHistory?: GSETagLogEntry[];
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

export type SPIType = 'lagging' | 'leading';
export type SPIDirection = 'lower_is_better' | 'higher_is_better';

export interface SPIReadingRecord {
  date: string;
  value: number;
  period?: string;
  turnsCount?: number;
  notes?: string;
}

export interface SPIItem {
  id: string;
  code: string; // e.g. SPI-01
  type: SPIType; // lagging (actual outcomes) vs leading (preventive)
  category: string; // Ramp Damage, GSE Safety, OHS, Loading & Weight, Reporting Culture, etc.
  name: string;
  nameAr: string;
  description: string;
  unit: string;
  measurementFormula?: string;
  applicableFramework: string; // e.g. "ICAO Annex 19 Amdt 2 (Nov 2026) / ECAA / ISAGO"
  ownerDepartment: string;
  baseline: number;
  baselinePeriod?: string; // e.g. "2026 Baseline"
  targetSPT: number; // Safety Performance Target value
  sptDescription: string; // Target narrative description
  sptDescriptionAr?: string;
  sptDeadline?: string; // e.g. "December 2027"
  alertThreshold: number; // Warning / trigger limit
  targetDirection: SPIDirection; // lower_is_better vs higher_is_better
  currentValue: number;
  trend: 'improving' | 'stable' | 'deteriorating';
  frequency: 'Monthly' | 'Quarterly' | 'Annual';
  status: 'nominal' | 'warning' | 'alert';
  lastUpdated: string;
  reportingCaution?: string; // Special guidance e.g. "Do not set zero occurrences as sole measure"
  historicalReadings?: SPIReadingRecord[];
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
  canViewKPIDashboard?: boolean;
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

export interface RoleDefinition {
  key: string;
  label: string;
  labelAr?: string;
  clearance: string;
  isSystem?: boolean;
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
