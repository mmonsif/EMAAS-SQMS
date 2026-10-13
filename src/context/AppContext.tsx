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
  SafetyReportFormConfig
} from '../types/index.ts';

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
  
  // Safety Reports
  reports: SafetyReport[];
  addSafetyReport: (report: Omit<SafetyReport, 'id' | 'timestamp' | 'lifecycleStatus'>) => SafetyReport;
  acknowledgeReport: (id: string, safetyOfficerName: string) => void;
  updateInvestigation: (id: string, summary: string) => void;
  setPreMitigationRisk: (id: string, risk: RiskAssessment) => void;
  setReportRCA: (id: string, rcaType: 'simple' | 'five_whys', simpleRca?: SimpleRCA, fiveWhys?: string[]) => void;
  setReportCAPA: (id: string, capa: CAPAItem) => void;
  markReportCAPAImplemented: (id: string) => void;
  setPostMitigationRisk: (id: string, risk: RiskAssessment) => void;
  closeSafetyReport: (id: string, closedBy: string, notes: string) => void;
  issueBulletinFromReport: (reportId: string, title: string, titleAr: string, summary: string, actions: string[]) => SafetyBulletin;

  // Audits & Findings
  auditSchedule: AuditScheduleItem[];
  findings: AuditFinding[];
  addAuditScheduleItem: (audit: Omit<AuditScheduleItem, 'id' | 'findingsCount'>) => void;
  acknowledgeFinding: (findingId: string) => void;
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
  logSPIReading: (id: string, value: number) => void;

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

  // GSE Fleet
  gseFleet: GSEVehicle[];
  updateGSETag: (id: string, status: 'green' | 'amber' | 'red', notes?: string) => void;

  // Training
  trainingRecords: StaffTrainingRecord[];
  recertifyStaffCourse: (staffId: string, courseId: string, newExpiryDate: string) => void;

  // Users & Access
  users: UserRecord[];
  departments: DepartmentConfig[];
  rolePermissions: Record<StationRole, RolePermissions>;
  updateRolePermission: (role: StationRole, permission: keyof RolePermissions, value: boolean) => void;
  addUser: (user: Omit<UserRecord, 'id'>) => void;

  // Management Review selections
  reviewSelections: ManagementReviewSelections;
  setReviewSelections: React.Dispatch<React.SetStateAction<ManagementReviewSelections>>;

  // Station Reset
  resetStationData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Realistic Seed Data for Marsa Alam (RMF) ---
const INITIAL_REPORTS: SafetyReport[] = [
  {
    id: "RMF-SMS-2026-0038",
    timestamp: "2026-10-12 14:20",
    reporterType: "identified",
    reporterName: "Ahmed Mansour",
    reporterBadge: "RMF-7842",
    department: "Operations - Ramp Services",
    category: "hazard",
    location: "Apron Stand 4",
    standNumber: "Stand 4",
    flightNumber: "MS 451",
    aircraftReg: "SU-GDZ",
    gseIdLinked: "RMF-TUG-02",
    description: "Hydraulic oil leak observed pooling beneath main steering cylinder of pushback tug during aircraft pushback preparation.",
    lifecycleStatus: "investigating",
    acknowledgedBy: "Mahmoud Ezz (Safety Officer)",
    acknowledgedAt: "2026-10-12 14:35",
    safetyOfficerAssigned: "Mahmoud Ezz",
    investigationSummary: "Inspected RMF-TUG-02 on Stand 4. High-pressure hydraulic hose clamp was loose. Oil sheen spread ~1.5 meters into aircraft safety zone.",
    preMitigationRisk: {
      severity: 4, // Major
      likelihood: "B", // Occasional
      scoreCode: "4B",
      level: "High",
      notes: "Slip hazard on apron + potential brake/steering loss during pushback operation."
    },
    rcaType: "five_whys",
    fiveWhysRca: [
      "Why did hydraulic fluid spill? High pressure clamp loosened under vibration.",
      "Why was clamp loose? Preventive tightening was missed during last 250-hour service.",
      "Why was it missed? GSE mechanic was rushed during high season charter turnaround.",
      "Why was mechanic rushed? Shift handover checklist had no mandatory torque inspection check.",
      "Why no torque check? GSE maintenance SOP did not integrate IGOM 4.2 torque verification schedule."
    ],
    capa: {
      correctiveAction: "Ground RMF-TUG-02 (Red Tag), clean hydraulic spill using airside absorption granules, replace steering clamp.",
      preventiveAction: "Revise GSE Preventive Maintenance Work Card #14 to mandate hydraulic torque check at every 200h service.",
      assignedDepartment: "Maintenance - GSE Fleet",
      assignedManager: "Eng. Tarek Fathy (HoD Maintenance)",
      targetDate: "2026-10-18",
      status: "pending"
    }
  },
  {
    id: "RMF-SMS-2026-0035",
    timestamp: "2026-10-10 09:15",
    reporterType: "anonymous",
    department: "Operations - Passenger Handling",
    category: "near_miss",
    location: "Gate 3 & Apron Roadway",
    standNumber: "Stand 2",
    flightNumber: "WK 234",
    description: "Passenger shuttle bus crossed marked apron roadway without halting at the aircraft taxiway hold line while Edelweiss A320 was taxiing in.",
    lifecycleStatus: "capa_implemented",
    acknowledgedBy: "Mahmoud Ezz (Safety Officer)",
    acknowledgedAt: "2026-10-10 09:30",
    safetyOfficerAssigned: "Mahmoud Ezz",
    investigationSummary: "Driver reported sun glare and faded ground paint marking at hold line 2B.",
    preMitigationRisk: {
      severity: 4,
      likelihood: "B",
      scoreCode: "4B",
      level: "High"
    },
    rcaType: "simple",
    simpleRca: {
      directCause: "Driver failed to yield at hold line due to impaired visual line-of-sight.",
      contributingFactor: "Roadway paint faded due to intense Red Sea sun; lack of high-visibility vertical stop sign.",
      systemicGap: "Airside Apron Roadway inspection frequency was monthly instead of weekly during peak traffic."
    },
    capa: {
      correctiveAction: "Repaint holding line 2B with reflective aviation paint; install solar LED vertical warning beacon.",
      preventiveAction: "Issue station-wide Safety Bulletin reminding bus drivers of taxiway give-way protocol; increase roadway markings inspection to weekly.",
      assignedDepartment: "Operations - Ramp Services",
      assignedManager: "Capt. Sherif Nour (HoD Operations)",
      targetDate: "2026-10-15",
      implementedDate: "2026-10-12",
      status: "implemented"
    },
    postMitigationRisk: {
      severity: 2,
      likelihood: "E",
      scoreCode: "2E",
      level: "Low",
      notes: "Vertical solar beacon and fresh paint ensure zero ambiguity."
    }
  },
  {
    id: "RMF-SMS-2026-0031",
    timestamp: "2026-10-06 18:40",
    reporterType: "identified",
    reporterName: "Hassan Ali",
    reporterBadge: "RMF-6109",
    department: "Operations - Ramp Services",
    category: "fod",
    location: "Apron Stand 6",
    standNumber: "Stand 6",
    description: "Metal luggage tag fastener and loose baggage trolley bolt spotted near nose gear wheel chalk position prior to flight X3 6128 arrival.",
    lifecycleStatus: "closed",
    acknowledgedBy: "Mahmoud Ezz (Safety Officer)",
    acknowledgedAt: "2026-10-06 18:45",
    safetyOfficerAssigned: "Mahmoud Ezz",
    investigationSummary: "FOD cleared immediately into ramp FOD bin. Fastener originated from worn conveyor belt guide rail.",
    preMitigationRisk: {
      severity: 3,
      likelihood: "C",
      scoreCode: "3C",
      level: "Medium"
    },
    rcaType: "simple",
    simpleRca: {
      directCause: "Vibrations on baggage cart caused loose bolt detachment.",
      contributingFactor: "High turnarounds on charter rush hour.",
      systemicGap: "Mandatory pre-arrival FOD walk was executed but lacked documentation on ramp turnaround log."
    },
    capa: {
      correctiveAction: "Inspect all baggage trolleys in Service Sector B for loose hardware.",
      preventiveAction: "Enforce mandatory signed FOD sweep on turn-around dispatch sheet.",
      assignedDepartment: "Operations - Ramp Services",
      assignedManager: "Capt. Sherif Nour",
      targetDate: "2026-10-08",
      implementedDate: "2026-10-07",
      status: "verified"
    },
    postMitigationRisk: {
      severity: 1,
      likelihood: "E",
      scoreCode: "1E",
      level: "Low"
    },
    issuedBulletinId: "RMF-SB-2026-003",
    closedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
    closedAt: "2026-10-09 11:00",
    closureNotes: "Effectiveness confirmed. All 24 belt loaders inspected, zero loose hardware found."
  }
];

const INITIAL_AUDIT_SCHEDULE: AuditScheduleItem[] = [
  {
    id: "AUD-SCH-2026-01",
    title: "IATA ISAGO Station Renewal Audit",
    auditType: "external",
    auditorOrganization: "IATA ISAGO Lead Audit Team",
    leadAuditor: "Marcello Rossi (ISAGO Senior Auditor)",
    discipline: "ORM",
    scheduledDate: "2026-11-15",
    quarter: "Q4",
    status: "planned",
    findingsCount: 0,
    scopeSummary: "Comprehensive station conformance to IATA ISAGO GOSM Edition 14 across ORM, PAX, BAG, RMP, and LOD."
  },
  {
    id: "AUD-SCH-2026-02",
    title: "ECAA Egyptian Civil Aviation Authority Annual Inspection",
    auditType: "external",
    auditorOrganization: "ECAA Flight Safety Directorate",
    leadAuditor: "Eng. Magdy Soliman (ECAA Inspector)",
    discipline: "RMP",
    scheduledDate: "2026-10-28",
    quarter: "Q4",
    status: "planned",
    findingsCount: 2,
    scopeSummary: "Compliance with ECAR Part 139 airside safety, pushback certification, and dangerous goods handling."
  },
  {
    id: "AUD-SCH-2026-03",
    title: "EgyptAir Ground Handling Carrier Quality Audit",
    auditType: "external",
    auditorOrganization: "EgyptAir Airlines Safety Directorate",
    leadAuditor: "Capt. Alaa Wahba",
    discipline: "LOD",
    scheduledDate: "2026-10-02",
    quarter: "Q4",
    status: "completed",
    findingsCount: 3,
    scopeSummary: "Aircraft weight and balance electronic load sheet cross-check and turnaround ramp safety protocol."
  },
  {
    id: "AUD-SCH-2026-04",
    title: "Internal Ground Operations Q3 Conformance Audit",
    auditType: "internal",
    auditorOrganization: "RMF Safety & Quality Department",
    leadAuditor: "Dr. Khaled Fawzy (SQM)",
    discipline: "BAG",
    scheduledDate: "2026-09-18",
    quarter: "Q3",
    status: "completed",
    findingsCount: 2,
    scopeSummary: "Baggage makeup area reconciliation, ULD container serviceability, and tag scanning accuracy."
  },
  {
    id: "AUD-SCH-2026-05",
    title: "Internal GSE Fleet Maintenance & Tagging Audit",
    auditType: "internal",
    auditorOrganization: "RMF Safety & Quality Department",
    leadAuditor: "Mahmoud Ezz (Lead Auditor)",
    discipline: "RMP",
    scheduledDate: "2026-11-05",
    quarter: "Q4",
    status: "planned",
    findingsCount: 0,
    scopeSummary: "Verification of Green/Red tag adherence, fire extinguisher validities on ramp vehicles, and daily logbooks."
  }
];

const INITIAL_FINDINGS: AuditFinding[] = [
  {
    id: "RMF-AUD-2026-018",
    auditType: "external",
    auditTitle: "EgyptAir Ground Handling Carrier Quality Audit",
    externalAuditorOrg: "EgyptAir Airlines",
    isagoDiscipline: "LOD",
    standardReference: "ISAGO LOD 2.2.1 / IGOM 4.4",
    severityLevel: "Level 1",
    description: "Load controller dispatched electronic trim sheet for flight MS 451 without physical confirmation of aft cargo hold bulk net latching.",
    assignedDepartment: "Operations - Load Control",
    assignedHoD: "Capt. Sherif Nour",
    raisedDate: "2026-10-02",
    deadlineDate: "2026-10-09",
    lifecycleStage: "capa_proposed",
    acknowledgedAt: "2026-10-03 10:15",
    rcaMethod: "five_whys",
    fiveWhysRca: [
      "Why was bulk net unlatched? Ramp agent was called to assist passenger conveyor.",
      "Why did agent leave early? Turnaround was under time pressure to prevent delay.",
      "Why did load controller release trim sheet? Relied on verbal radio call rather than physical signed ramp sheet.",
      "Why no signed sheet? Load sheet dispatch SOP permitted verbal sign-off during high charter volume.",
      "Root Cause: Load Control SOP Section 5.3 lacks mandatory digital photo / physical checklist latching confirmation before final DCS trim sheet release."
    ],
    capaProposal: {
      correctiveAction: "Re-brief all Load Control and Ramp agents on bulk cargo latching verification.",
      preventiveAction: "Update DCS software to require two-factor digital ramp agent sign-off before load sheet closure.",
      targetDate: "2026-10-20",
      proposedAt: "2026-10-04"
    }
  },
  {
    id: "RMF-AUD-2026-015",
    auditType: "internal",
    auditTitle: "Internal Ground Operations Q3 Conformance Audit",
    isagoDiscipline: "BAG",
    standardReference: "ISAGO BAG 3.1.4 (Baggage Security)",
    severityLevel: "Level 2",
    description: "Baggage makeup shed entrance gate magnetic lock was unlatched, allowing unrestricted airside-to-landside personnel crossing.",
    assignedDepartment: "Operations - Passenger & Baggage",
    assignedHoD: "Capt. Sherif Nour",
    raisedDate: "2026-09-18",
    deadlineDate: "2026-10-18",
    lifecycleStage: "implemented",
    acknowledgedAt: "2026-09-19",
    rcaMethod: "simple",
    simpleRca: {
      directCause: "Magnetic lock arm alignment failed due to heat expansion.",
      contributingFactor: "Lock was inspected bi-monthly rather than weekly.",
      systemicGap: "Preventive facility maintenance contract did not cover airside security barrier latency."
    },
    capaProposal: {
      correctiveAction: "Repair and realign magnetic lock arm; install secondary audible alarm on door propping.",
      preventiveAction: "Incorporate security gate checks into daily Station Duty Officer shift handover checklist.",
      targetDate: "2026-10-05",
      proposedAt: "2026-09-22"
    },
    implementationEvidence: {
      evidenceNotes: "Security latch replaced with heavy-duty airside electromagnetic strike lock. Tested 50 cycles successfully.",
      documentRef: "WORK-ORDER-SEC-8821.pdf",
      submittedAt: "2026-10-04"
    }
  },
  {
    id: "RMF-AUD-2026-012",
    auditType: "external",
    auditTitle: "TUI Airline Seasonal Ground Operations Audit",
    externalAuditorOrg: "TUI Fly Safety Inspectorate",
    isagoDiscipline: "RMP",
    standardReference: "IGOM 4.1.2 (Aircraft Chocking)",
    severityLevel: "Level 3",
    description: "Wheel chocks on Stand 3 were aged with worn rubber grip ribs, reducing friction during high wind gusts.",
    assignedDepartment: "Operations - Ramp Services",
    assignedHoD: "Capt. Sherif Nour",
    raisedDate: "2026-08-25",
    deadlineDate: "2026-09-25",
    lifecycleStage: "closed_verified",
    acknowledgedAt: "2026-08-26",
    rcaMethod: "simple",
    simpleRca: {
      directCause: "Chocks exposed to desert sun for > 3 years.",
      contributingFactor: "No retirement shelf-life specified in GSE procurement.",
      systemicGap: "Ramp safety equipment lifecycle policy lacked rubber wear criteria."
    },
    capaProposal: {
      correctiveAction: "Replace all Stand 1-12 chocks with heavy-duty polyurethane chocks with reflective rope.",
      preventiveAction: "Establish a 24-month replacement lifecycle in GSE equipment register.",
      targetDate: "2026-09-10",
      proposedAt: "2026-08-28"
    },
    implementationEvidence: {
      evidenceNotes: "Purchased and deployed 48 sets of ISO-certified aviation chocks across all 12 stands.",
      documentRef: "PO-CHOCKS-2026-RMF.pdf",
      submittedAt: "2026-09-08"
    },
    effectivenessVerification: {
      verifiedBy: "Dr. Khaled Fawzy (SQM)",
      verifiedAt: "2026-09-20",
      isEffective: true,
      verificationNotes: "Follow-up ramp audit confirmed 100% compliant chocks deployed on all active stands."
    },
    issuedNoticeId: "RMF-ION-2026-008"
  }
];

const INITIAL_SPIS: SPIItem[] = [
  {
    id: "SPI-01",
    code: "SPI-01",
    name: "Aircraft Ground Damage Rate",
    nameAr: "معدل تلف وتضرر الطائرات بساحة الطيران",
    description: "Number of aircraft ground contact or damage incidents per 10,000 turnarounds.",
    unit: "per 10k flights",
    baseline: 0.8,
    targetSPT: 0.0,
    alertThreshold: 0.5,
    currentValue: 0.0,
    trend: "improving",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01"
  },
  {
    id: "SPI-02",
    code: "SPI-02",
    name: "Apron FOD Incidents Frequency",
    nameAr: "معدل تكرار الأجسام الغريبة بالمهبط (FOD)",
    description: "Total confirmed Foreign Object Debris sightings on aircraft stands during active turnarounds.",
    unit: "Incidents / Month",
    baseline: 4.2,
    targetSPT: 1.0,
    alertThreshold: 3.0,
    currentValue: 2.0,
    trend: "improving",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01"
  },
  {
    id: "SPI-03",
    code: "SPI-03",
    name: "GSE Red-Tag Out of Service Rate",
    nameAr: "نسبة معدات المهبط المتوقفة بعلامة حمراء",
    description: "Percentage of total active GSE fleet tagged red (out of service) at morning dispatch.",
    unit: "% of Fleet",
    baseline: 8.5,
    targetSPT: 4.0,
    alertThreshold: 6.0,
    currentValue: 4.8,
    trend: "stable",
    frequency: "Monthly",
    status: "warning",
    lastUpdated: "2026-10-01"
  },
  {
    id: "SPI-04",
    code: "SPI-04",
    name: "CAPA On-Time Closure Rate",
    nameAr: "معدل إغلاق الإجراءات التصحيحية في موعدها",
    description: "Percentage of internal and external audit findings closed within agreed target deadline.",
    unit: "% on-time",
    baseline: 82.0,
    targetSPT: 95.0,
    alertThreshold: 85.0,
    currentValue: 92.5,
    trend: "improving",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01"
  },
  {
    id: "SPI-05",
    code: "SPI-05",
    name: "Turnaround Safety Delay Frequency",
    nameAr: "تكرار تأخير الرحلات لأسباب تتعلق بالسلامة",
    description: "Delays exceeding 15 minutes caused by ramp safety holds, GSE breakdowns, or load sheet recalculations.",
    unit: "% of flights",
    baseline: 2.1,
    targetSPT: 0.5,
    alertThreshold: 1.2,
    currentValue: 0.7,
    trend: "improving",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01"
  }
];

const INITIAL_BULLETINS: SafetyBulletin[] = [
  {
    id: "BUL-001",
    refNumber: "RMF-SB-2026-003",
    type: "bulletin",
    title: "Mandatory Pre-Arrival FOD Sweeps on Stands 1 to 12",
    titleAr: "إلزامية مسح الأجسام الغريبة (FOD) قبل وصول الطائرات للمواقف ١ إلى ١٢",
    issueDate: "2026-10-08",
    targetDepartments: ["Operations - Ramp Services", "Maintenance - GSE Fleet"],
    priority: "urgent",
    summary: "Following fastener debris detection on Stand 6, all ramp teams must execute and sign off a 2-person FOD sweep 15 minutes prior to aircraft landing.",
    summaryAr: "عقب رصد شوائب معدنية في موقف ٦، يجب على فرق المهبط إجراء وتوقيع مسح ثنائي للأجسام الغريبة قبل ١٥ دقيقة من وصول الطائرة.",
    content: "All Team Leaders must ensure apron areas within the Aircraft Safety Zone (ASZ) are free of loose bolts, plastic wrappers, and stone debris. Document sweep on Flight Turnaround Card.",
    contentAr: "يجب على جميع قادة الفرق التأكد من خلو منطقة أمان الطائرة (ASZ) من أي مسامير أو أكياس بلاستيكية أو حصى. يتم توثيق المسح في كارت مناولة الرحلة.",
    mandatoryActions: [
      "Conduct visual walk from stand centerline to perimeter boundary.",
      "Inspect baggage belt guide rails before positioning to cargo hold.",
      "Sign turnaround checklist block 3.2."
    ],
    issuedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
    sourceReportId: "RMF-SMS-2026-0031",
    requiredStaffCount: 45,
    acknowledgments: [
      {
        staffId: "RMF-7842",
        staffName: "Ahmed Mansour",
        badgeNumber: "RMF-7842",
        department: "Operations - Ramp Services",
        acknowledgedAt: "2026-10-08 14:10",
        signature: "Ahmed M."
      },
      {
        staffId: "RMF-6109",
        staffName: "Hassan Ali",
        badgeNumber: "RMF-6109",
        department: "Operations - Ramp Services",
        acknowledgedAt: "2026-10-08 15:30",
        signature: "Hassan Ali"
      },
      {
        staffId: "RMF-5521",
        staffName: "Mahmoud Soliman",
        badgeNumber: "RMF-5521",
        department: "Operations - Ramp Services",
        acknowledgedAt: "2026-10-09 09:00",
        signature: "M. Soliman"
      }
    ]
  },
  {
    id: "BUL-002",
    refNumber: "RMF-ION-2026-008",
    type: "operational_notice",
    title: "Deployment of New Heavy-Duty Polyurethane Aircraft Chocks",
    titleAr: "تعميم نشر وتطبيق حواجز العجلات الجديدة المصنوعة من البولي يوريثان",
    issueDate: "2026-09-22",
    targetDepartments: ["Operations - Ramp Services"],
    priority: "routine",
    summary: "Replaced 48 sets of aircraft wheel chocks with high-friction yellow polyurethane chocks per IGOM 4.1.2 requirements.",
    summaryAr: "تم استبدال ٤٨ طقماً من حواجز عجلات الطائرات بحواجز صفراء عالية الاحتكاك مطابقة لمتطلبات IGOM 4.1.2.",
    content: "Old wooden and degraded rubber chocks are formally decommissioned. Inspect chocks daily for rope fraying.",
    contentAr: "تم خروج الحواجز الخشبية والمطاطية القديمة من الخدمة نهائياً. يتم فحص الحبال يومياً للتأكد من سلامتها.",
    mandatoryActions: [
      "Place 2 chocks in front and behind main landing gear wheels.",
      "Never throw or drag chocks across apron pavement."
    ],
    issuedBy: "Capt. Sherif Nour (HoD Operations)",
    sourceFindingId: "RMF-AUD-2026-012",
    requiredStaffCount: 38,
    acknowledgments: [
      {
        staffId: "RMF-7842",
        staffName: "Ahmed Mansour",
        badgeNumber: "RMF-7842",
        department: "Operations - Ramp Services",
        acknowledgedAt: "2026-09-23 08:15",
        signature: "Ahmed Mansour"
      }
    ]
  }
];

const INITIAL_MOCS: ManagementOfChange[] = [
  {
    id: "RMF-MOC-2026-001",
    title: "Introduction of Electric Pushback Tug (Goldhofer Phoenix E) on Stands 1 to 6",
    category: "equipment",
    initiatorName: "Eng. Tarek Fathy",
    department: "Maintenance - GSE Fleet",
    initiationDate: "2026-09-15",
    targetImplementationDate: "2026-11-01",
    reasonForChange: "Transitioning RMF station ground operations towards IATA Net Zero 2050 through zero-emission electric GSE.",
    hazards: [
      {
        id: "HAZ-01",
        hazardDescription: "Silent vehicle operation increasing risk of pedestrian ramp collision.",
        initialRisk: "4B - High",
        mitigationMeasure: "Equip tug with continuous white noise reversing hummer + flashing amber rooftop beacon.",
        residualRisk: "2E - Low",
        actionOwner: "Eng. Tarek Fathy",
        deadline: "2026-10-15",
        status: "completed"
      },
      {
        id: "HAZ-02",
        hazardDescription: "Operators unfamiliar with high-torque instant regenerative braking curve.",
        initialRisk: "3B - Medium",
        mitigationMeasure: "Conduct 16-hour manufacturer certified training and wet-run simulations for all 14 pushback drivers.",
        residualRisk: "1E - Low",
        actionOwner: "Mohamed El-Sayed (Training)",
        deadline: "2026-10-25",
        status: "open"
      }
    ],
    status: "sqm_reviewed",
    approvals: {
      hodApproved: true,
      hodName: "Eng. Tarek Fathy",
      hodDate: "2026-09-18",
      sqmApproved: true,
      sqmName: "Dr. Khaled Fawzy (SQM)",
      sqmDate: "2026-09-24",
      aeApproved: false
    },
    postReviewDone: false
  },
  {
    id: "RMF-MOC-2026-002",
    title: "Revision of High-Wind Sandstorm (Khamsin) Apron Parking SOP",
    category: "sop_revision",
    initiatorName: "Capt. Sherif Nour",
    department: "Operations - Ramp Services",
    initiationDate: "2026-08-10",
    targetImplementationDate: "2026-09-01",
    reasonForChange: "Red Sea desert meteorological alerts: wind gusts exceeding 35 knots require enhanced tie-down and GSE clustering rules.",
    hazards: [
      {
        id: "HAZ-03",
        hazardDescription: "Unattended baggage carts rolling into parked aircraft cowlings during 40-knot gusts.",
        initialRisk: "4B - High",
        mitigationMeasure: "Mandate perimeter brake locks and clustering within designated sheltered GSE corral.",
        residualRisk: "1E - Low",
        actionOwner: "Ramp Supervisors",
        deadline: "2026-08-25",
        status: "completed"
      }
    ],
    status: "closed",
    approvals: {
      hodApproved: true,
      hodName: "Capt. Sherif Nour",
      hodDate: "2026-08-12",
      sqmApproved: true,
      sqmName: "Dr. Khaled Fawzy",
      sqmDate: "2026-08-15",
      aeApproved: true,
      aeName: "Gen. Adel Radwan (AE)",
      aeDate: "2026-08-18"
    },
    postReviewDone: true,
    postReviewNotes: "Successfully activated during September 14 sandstorm. Zero GSE movements or aircraft contact recorded."
  }
];

const INITIAL_GSE: GSEVehicle[] = [
  {
    id: "RMF-TUG-01",
    name: "Pushback Tug #1 (Trepel Challenger 150)",
    type: "Pushback Tractor",
    tagStatus: "green",
    manufacturer: "Trepel",
    locationStand: "Stand 1",
    operatingHours: 3410,
    lastInspectionDate: "2026-10-01",
    nextServiceDue: "2026-11-01"
  },
  {
    id: "RMF-TUG-02",
    name: "Pushback Tug #2 (Schopf F110)",
    type: "Pushback Tractor",
    tagStatus: "red",
    manufacturer: "Schopf",
    locationStand: "Workshop Bay 2",
    operatingHours: 4890,
    lastInspectionDate: "2026-09-12",
    nextServiceDue: "2026-10-12",
    activeDefectNotes: "Hydraulic leak on main steering actuator cylinder. Tagged out of service.",
    activeDefectReportId: "RMF-SMS-2026-0038"
  },
  {
    id: "RMF-BL-01",
    name: "Conveyor Belt Loader #1",
    type: "Belt Loader",
    tagStatus: "green",
    manufacturer: "TLD",
    locationStand: "Stand 3",
    operatingHours: 1980,
    lastInspectionDate: "2026-10-05",
    nextServiceDue: "2026-11-05"
  },
  {
    id: "RMF-BL-02",
    name: "Conveyor Belt Loader #2",
    type: "Belt Loader",
    tagStatus: "amber",
    manufacturer: "TLD",
    locationStand: "Stand 5",
    operatingHours: 2490,
    lastInspectionDate: "2026-09-10",
    nextServiceDue: "2026-10-14",
    activeDefectNotes: "Routine 2500-hour roller chain lubrication due in 24 hours."
  },
  {
    id: "RMF-GPU-01",
    name: "Ground Power Unit 90kVA #1",
    type: "GPU Unit",
    tagStatus: "green",
    manufacturer: "ITW GSE",
    locationStand: "Stand 4",
    operatingHours: 1420,
    lastInspectionDate: "2026-10-08",
    nextServiceDue: "2026-12-08"
  },
  {
    id: "RMF-STAIR-01",
    name: "Passenger Boarding Stairs #1 (Self-Propelled)",
    type: "Passenger Stairs",
    tagStatus: "green",
    manufacturer: "TLD",
    locationStand: "Stand 2",
    operatingHours: 2150,
    lastInspectionDate: "2026-09-28",
    nextServiceDue: "2026-11-28"
  }
];

const INITIAL_TRAINING: StaffTrainingRecord[] = [
  {
    id: "TR-01",
    name: "Ahmed Mansour",
    badgeNumber: "RMF-7842",
    department: "Operations - Ramp Services",
    roleTitle: "Ramp Agent / Pushback Operator",
    courses: [
      { courseId: "C-DGR", courseName: "IATA Dangerous Goods CBTA (Cat 7/8)", certifiedDate: "2025-02-10", expiryDate: "2027-02-10", status: "valid" },
      { courseId: "C-ADP", courseName: "Airside Driving Permit (ADP)", certifiedDate: "2025-11-01", expiryDate: "2026-11-01", status: "expiring" },
      { courseId: "C-PUSH", courseName: "Aircraft Pushback & Headset Endorsement", certifiedDate: "2024-06-15", expiryDate: "2026-06-15", status: "expired" },
      { courseId: "C-RAMP", courseName: "IGOM Apron Safety & Marshalling", certifiedDate: "2026-01-10", expiryDate: "2027-01-10", status: "valid" }
    ]
  },
  {
    id: "TR-02",
    name: "Youssef Kamel",
    badgeNumber: "RMF-4190",
    department: "Operations - Load Control",
    roleTitle: "Weight & Balance Specialist",
    courses: [
      { courseId: "C-DGR", courseName: "IATA Dangerous Goods CBTA (Cat 6)", certifiedDate: "2025-05-12", expiryDate: "2027-05-12", status: "valid" },
      { courseId: "C-WB", courseName: "Load Control & DCS Weight and Balance", certifiedDate: "2025-09-01", expiryDate: "2026-09-01", status: "expiring" },
      { courseId: "C-RAMP", courseName: "IGOM Apron Safety & Marshalling", certifiedDate: "2026-02-01", expiryDate: "2027-02-01", status: "valid" }
    ]
  },
  {
    id: "TR-03",
    name: "Ibrahim Metwally",
    badgeNumber: "RMF-3381",
    department: "Maintenance - GSE Fleet",
    roleTitle: "Senior GSE Mechanic",
    courses: [
      { courseId: "C-ADP", courseName: "Airside Driving Permit (ADP Heavy)", certifiedDate: "2026-04-10", expiryDate: "2027-04-10", status: "valid" },
      { courseId: "C-DGR", courseName: "IATA Dangerous Goods CBTA (Cat 7/8)", certifiedDate: "2024-08-15", expiryDate: "2026-08-15", status: "expired" },
      { courseId: "C-RAMP", courseName: "IGOM Apron Safety & Marshalling", certifiedDate: "2025-03-20", expiryDate: "2026-03-20", status: "expired" }
    ]
  }
];

const INITIAL_USERS: UserRecord[] = [
  { id: "USR-01", name: "Gen. Adel Radwan", email: "a.radwan@marsa-alam-ground.com", badgeNumber: "RMF-001", department: "Executive Leadership", role: "ae", isActive: true, phone: "+20 100 123 4567" },
  { id: "USR-02", name: "Eng. Hisham El-Gohary", email: "h.gohary@marsa-alam-ground.com", badgeNumber: "RMF-002", department: "Station Management", role: "ghm", isActive: true, phone: "+20 100 234 5678" },
  { id: "USR-03", name: "Capt. Sherif Nour", email: "s.nour@marsa-alam-ground.com", badgeNumber: "RMF-003", department: "Operations", role: "hod_ops", isActive: true, phone: "+20 100 345 6789" },
  { id: "USR-04", name: "Dr. Khaled Fawzy", email: "k.fawzy@marsa-alam-ground.com", badgeNumber: "RMF-004", department: "Safety & Quality", role: "hod_safety", isActive: true, phone: "+20 100 456 7890" },
  { id: "USR-05", name: "Eng. Tarek Fathy", email: "t.fathy@marsa-alam-ground.com", badgeNumber: "RMF-005", department: "Maintenance", role: "hod_maint", isActive: true, phone: "+20 100 567 8901" },
  { id: "USR-06", name: "Mohamed El-Sayed", email: "m.elsayed@marsa-alam-ground.com", badgeNumber: "RMF-006", department: "Training", role: "hod_training", isActive: true, phone: "+20 100 678 9012" },
  { id: "USR-07", name: "Mahmoud Ezz", email: "m.ezz@marsa-alam-ground.com", badgeNumber: "RMF-007", department: "Safety & Quality", role: "safety_officer", isActive: true, phone: "+20 100 789 0123" },
  { id: "USR-08", name: "Ahmed Mansour", email: "a.mansour@marsa-alam-ground.com", badgeNumber: "RMF-7842", department: "Operations - Ramp", role: "field_staff", isActive: true, phone: "+20 100 890 1234" }
];

const INITIAL_DEPARTMENTS: DepartmentConfig[] = [
  {
    id: "DEPT-OPS",
    name: "Operations Department",
    nameAr: "إدارة العمليات والتشغيل",
    headOfDepartment: "Capt. Sherif Nour",
    subUnits: ["Ramp Services", "Load Control (Weight & Balance)", "Passenger Handling & Boarding Gates"],
    staffCount: 68
  },
  {
    id: "DEPT-MAINT",
    name: "Maintenance Department (GSE)",
    nameAr: "إدارة صيانة معدات المهبط (GSE)",
    headOfDepartment: "Eng. Tarek Fathy",
    subUnits: ["Heavy Tractor & Pushback Workshop", "Conveyor & Stairs Fleet", "Hydraulics & Electrical Lab"],
    staffCount: 24
  },
  {
    id: "DEPT-SAFETY",
    name: "Safety & Quality Department",
    nameAr: "إدارة السلامة وتأكيد الجودة",
    headOfDepartment: "Dr. Khaled Fawzy",
    subUnits: ["SMS Coordination", "ISAGO & IGOM Lead Auditing", "CAPA Investigation Unit"],
    staffCount: 8
  },
  {
    id: "DEPT-TRAINING",
    name: "Training Department",
    nameAr: "إدارة التدريب وتأهيل الكفاءات",
    headOfDepartment: "Mohamed El-Sayed",
    subUnits: ["IATA DGR CBTA Academy", "Airside Driving Permit (ADP)", "DCS Load Sheet Certification"],
    staffCount: 6
  }
];

const INITIAL_FORM_CONFIG: SafetyReportFormConfig = {
  enableAnonymous: true,
  enableFlightNumber: true,
  requireFlightNumber: false,
  enableAircraftReg: true,
  requireAircraftReg: false,
  enableGSELink: true,
  requireGSELink: false,
  enablePhotoUpload: true,
  requirePhotoUpload: false,
  enableRiskMatrix: true,
  requireRiskMatrix: true,
  minDescriptionLength: 5,
  customDisclaimerEn: "Confidential 'Just Culture' Reporting Policy: In accordance with ICAO SMS and RMF station regulations, reports are treated with strict confidentiality to identify operational hazards rather than assign blame.",
  customDisclaimerAr: "سياسة ثقافة العدالة والسرية: وفقاً للوائح إدارة السلامة (ICAO SMS) بمطار مرسى علم الدولي، يتم التعامل مع جميع البلاغات بسرية تامة للتعرف على المخاطر التشغيلية وتحسين بيئة العمل دون توجيه اللوم.",
  categories: [
    { key: 'hazard', labelEn: 'Hazard / Unsafe Condition', labelAr: 'خطر / حالة غير آمنة', icon: '⚠️', descEn: 'Unsafe ramp condition', descAr: 'حالة غير آمنة بساحة الطيران', isActive: true },
    { key: 'near_miss', labelEn: 'Near-Miss Event', labelAr: 'حادث وشيك الوقوع', icon: '⚡', descEn: 'Narrowly avoided event', descAr: 'واقعة كادت تتسبب في حادث', isActive: true },
    { key: 'gse_damage', labelEn: 'GSE Equipment Damage', labelAr: 'تلف بمعدة أرضية (GSE)', icon: '🚜', descEn: 'Equipment defect/damage', descAr: 'عطل أو تلف بمعدة الخدمات الأرضية', isActive: true },
    { key: 'personal_injury', labelEn: 'Personal Injury', labelAr: 'إصابة عمل شخصية', icon: '🩹', descEn: 'Staff slip/strain/injury', descAr: 'إصابة أو انزلاق لأحد العاملين', isActive: true },
    { key: 'fod', labelEn: 'Foreign Object Debris (FOD)', labelAr: 'أجسام غريبة بالمهبط (FOD)', icon: '🔩', descEn: 'Debris on apron/runway', descAr: 'شوائب أو مخلفات بساحة الطيران', isActive: true },
    { key: 'delay', labelEn: 'Turnaround Safety Delay', labelAr: 'تأخير رحلة لأسباب السلامة', icon: '⏱️', descEn: 'Turnaround safety delay', descAr: 'تأخير عملياتي ناتج عن إجراءات السلامة', isActive: true },
    { key: 'wildlife', labelEn: 'Wildlife / Bird Activity', labelAr: 'نشاط طيور أو حيوانات بالمهبط', icon: '🦅', descEn: 'Bird flock near runway/stands', descAr: 'رصد طيور قرب الممرات أو المواقف', isActive: true },
    { key: 'spill', labelEn: 'Fuel / Chemical Spill', labelAr: 'تسرب وقود أو مواد كيميائية', icon: '🛢️', descEn: 'Hazardous fluid leak on ramp', descAr: 'انسكاب وقود أو زيوت على الأسفلت', isActive: true },
  ],
  locations: [
    'Apron Stand 1', 'Apron Stand 2', 'Apron Stand 3', 'Apron Stand 4',
    'Apron Stand 5', 'Apron Stand 6', 'Apron Stand 7', 'Apron Stand 8',
    'Apron Stand 9', 'Apron Stand 10', 'Apron Stand 11', 'Apron Stand 12',
    'Baggage Makeup Area', 'Passenger Boarding Gate', 'GSE Workshop Bay',
    'Fueling Hydrant Area', 'Taxiway Mike Holding Point', 'Apron Service Road North'
  ]
};

const DEFAULT_ROLE_PERMISSIONS: Record<StationRole, RolePermissions> = {
  ae: {
    canViewQuickReport: true,
    canViewIncidentLogs: true,
    canViewAudits: true,
    canViewSPI: true,
    canViewBulletins: true,
    canViewMoC: true,
    canViewGSE: true,
    canViewTraining: true,
    canViewMgmtReview: true,
    canViewUsersAndAccess: true,
    canConfigureForm: true,
    investigateReports: false,
    approveCAPA: true,
    closeReports: true,
    executeAudits: false,
    manageSPI: true,
    issueBulletins: true,
    approveMoC: true,
    adminConfig: true,
  },
  ghm: {
    canViewQuickReport: true,
    canViewIncidentLogs: true,
    canViewAudits: true,
    canViewSPI: true,
    canViewBulletins: true,
    canViewMoC: true,
    canViewGSE: true,
    canViewTraining: true,
    canViewMgmtReview: true,
    canViewUsersAndAccess: true,
    canConfigureForm: true,
    investigateReports: true,
    approveCAPA: true,
    closeReports: true,
    executeAudits: true,
    manageSPI: true,
    issueBulletins: true,
    approveMoC: true,
    adminConfig: true,
  },
  sdm: {
    canViewQuickReport: true,
    canViewIncidentLogs: true,
    canViewAudits: true,
    canViewSPI: true,
    canViewBulletins: true,
    canViewMoC: true,
    canViewGSE: true,
    canViewTraining: true,
    canViewMgmtReview: true,
    canViewUsersAndAccess: false,
    canConfigureForm: false,
    investigateReports: true,
    approveCAPA: true,
    closeReports: true,
    executeAudits: true,
    manageSPI: true,
    issueBulletins: true,
    approveMoC: true,
    adminConfig: false,
  },
  hod_safety: {
    canViewQuickReport: true,
    canViewIncidentLogs: true,
    canViewAudits: true,
    canViewSPI: true,
    canViewBulletins: true,
    canViewMoC: true,
    canViewGSE: true,
    canViewTraining: true,
    canViewMgmtReview: true,
    canViewUsersAndAccess: true,
    canConfigureForm: true,
    investigateReports: true,
    approveCAPA: true,
    closeReports: true,
    executeAudits: true,
    manageSPI: true,
    issueBulletins: true,
    approveMoC: true,
    adminConfig: true,
  },
  hod_ops: {
    canViewQuickReport: true,
    canViewIncidentLogs: true,
    canViewAudits: true,
    canViewSPI: false,
    canViewBulletins: true,
    canViewMoC: true,
    canViewGSE: true,
    canViewTraining: true,
    canViewMgmtReview: false,
    canViewUsersAndAccess: false,
    canConfigureForm: false,
    investigateReports: true,
    approveCAPA: true,
    closeReports: false,
    executeAudits: true,
    manageSPI: false,
    issueBulletins: false,
    approveMoC: true,
    adminConfig: false,
  },
  hod_maint: {
    canViewQuickReport: true,
    canViewIncidentLogs: true,
    canViewAudits: false,
    canViewSPI: false,
    canViewBulletins: true,
    canViewMoC: true,
    canViewGSE: true,
    canViewTraining: true,
    canViewMgmtReview: false,
    canViewUsersAndAccess: false,
    canConfigureForm: false,
    investigateReports: true,
    approveCAPA: true,
    closeReports: false,
    executeAudits: true,
    manageSPI: false,
    issueBulletins: false,
    approveMoC: true,
    adminConfig: false,
  },
  hod_training: {
    canViewQuickReport: true,
    canViewIncidentLogs: false,
    canViewAudits: false,
    canViewSPI: false,
    canViewBulletins: true,
    canViewMoC: false,
    canViewGSE: false,
    canViewTraining: true,
    canViewMgmtReview: false,
    canViewUsersAndAccess: false,
    canConfigureForm: false,
    investigateReports: false,
    approveCAPA: false,
    closeReports: false,
    executeAudits: true,
    manageSPI: false,
    issueBulletins: false,
    approveMoC: true,
    adminConfig: false,
  },
  safety_officer: {
    canViewQuickReport: true,
    canViewIncidentLogs: true,
    canViewAudits: true,
    canViewSPI: true,
    canViewBulletins: true,
    canViewMoC: true,
    canViewGSE: true,
    canViewTraining: true,
    canViewMgmtReview: false,
    canViewUsersAndAccess: false,
    canConfigureForm: false,
    investigateReports: true,
    approveCAPA: false,
    closeReports: false,
    executeAudits: true,
    manageSPI: true,
    issueBulletins: true,
    approveMoC: false,
    adminConfig: false,
  },
  ramp_supervisor: {
    canViewQuickReport: true,
    canViewIncidentLogs: true,
    canViewAudits: false,
    canViewSPI: false,
    canViewBulletins: true,
    canViewMoC: false,
    canViewGSE: true,
    canViewTraining: true,
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
  },
  field_staff: {
    canViewQuickReport: true,
    canViewIncidentLogs: false,
    canViewAudits: false,
    canViewSPI: false,
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
  },
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('rmf_sqms_lang') as Language) || 'en';
  });
  
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('rmf_sqms_theme') as ThemeMode) || 'dark';
  });

  const [activeRole, setActiveRole] = useState<StationRole>('safety_officer');
  const [activeView, setActiveView] = useState<string>('quickReport');

  // Safety Report Form Configuration
  const [safetyFormConfig, setSafetyFormConfig] = useState<SafetyReportFormConfig>(() => {
    const saved = localStorage.getItem('rmf_form_config');
    return saved ? JSON.parse(saved) : INITIAL_FORM_CONFIG;
  });

  // Stored state
  const [reports, setReports] = useState<SafetyReport[]>(() => {
    const saved = localStorage.getItem('rmf_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [auditSchedule, setAuditSchedule] = useState<AuditScheduleItem[]>(() => {
    const saved = localStorage.getItem('rmf_audits_sched');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_SCHEDULE;
  });

  const [findings, setFindings] = useState<AuditFinding[]>(() => {
    const saved = localStorage.getItem('rmf_findings');
    return saved ? JSON.parse(saved) : INITIAL_FINDINGS;
  });

  const [spis, setSpis] = useState<SPIItem[]>(() => {
    const saved = localStorage.getItem('rmf_spis');
    return saved ? JSON.parse(saved) : INITIAL_SPIS;
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

  const [departments] = useState<DepartmentConfig[]>(INITIAL_DEPARTMENTS);
  const [rolePermissions, setRolePermissions] = useState<Record<StationRole, RolePermissions>>(() => {
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
  useEffect(() => { localStorage.setItem('rmf_reports', JSON.stringify(reports)); }, [reports]);
  useEffect(() => { localStorage.setItem('rmf_audits_sched', JSON.stringify(auditSchedule)); }, [auditSchedule]);
  useEffect(() => { localStorage.setItem('rmf_findings', JSON.stringify(findings)); }, [findings]);
  useEffect(() => { localStorage.setItem('rmf_spis', JSON.stringify(spis)); }, [spis]);
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
        return !!perms.canViewTraining;
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
          'quickReport', 'incidentLogs', 'audits', 'spiManager', 'bulletins', 
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

  // Safety Report Methods
  const addSafetyReport = (data: Omit<SafetyReport, 'id' | 'timestamp' | 'lifecycleStatus'>): SafetyReport => {
    const nextSeq = String(reports.length + 39).padStart(4, '0');
    const newReport: SafetyReport = {
      ...data,
      id: `RMF-SMS-2026-${nextSeq}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      lifecycleStatus: 'submitted',
    };

    // If GSE damage reported, automatically tag vehicle Red
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

    setReports([newReport, ...reports]);
    return newReport;
  };

  const acknowledgeReport = (id: string, safetyOfficerName: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          lifecycleStatus: 'acknowledged',
          acknowledgedBy: safetyOfficerName,
          acknowledgedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          safetyOfficerAssigned: safetyOfficerName
        };
      }
      return r;
    }));
  };

  const updateInvestigation = (id: string, summary: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          investigationSummary: summary,
          lifecycleStatus: 'investigating'
        };
      }
      return r;
    }));
  };

  const setPreMitigationRisk = (id: string, risk: RiskAssessment) => {
    setReports(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, preMitigationRisk: risk, lifecycleStatus: 'investigating' };
      }
      return r;
    }));
  };

  const setReportRCA = (id: string, rcaType: 'simple' | 'five_whys', simpleRca?: SimpleRCA, fiveWhys?: string[]) => {
    setReports(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, rcaType, simpleRca, fiveWhysRca: fiveWhys };
      }
      return r;
    }));
  };

  const setReportCAPA = (id: string, capa: CAPAItem) => {
    setReports(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, capa, lifecycleStatus: 'capa_pending' };
      }
      return r;
    }));
  };

  const markReportCAPAImplemented = (id: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === id && r.capa) {
        return {
          ...r,
          lifecycleStatus: 'capa_implemented',
          capa: {
            ...r.capa,
            status: 'implemented',
            implementedDate: new Date().toISOString().substring(0, 10)
          }
        };
      }
      return r;
    }));
  };

  const setPostMitigationRisk = (id: string, risk: RiskAssessment) => {
    setReports(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, postMitigationRisk: risk };
      }
      return r;
    }));
  };

  const closeSafetyReport = (id: string, closedBy: string, notes: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          lifecycleStatus: 'closed',
          closedBy,
          closedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          closureNotes: notes
        };
      }
      return r;
    }));
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
      content: `Safety notice published following closure of incident ${reportId}. All frontline personnel must review and acknowledge.`,
      contentAr: `تم إصدار هذا التعميم عقب إغلاق تقرير السلامة ${reportId}. يتعين على جميع الموظفين المعنيين الإقرار بالاطلاع.`,
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

  // Audits & Findings Methods
  const addAuditScheduleItem = (audit: Omit<AuditScheduleItem, 'id' | 'findingsCount'>) => {
    const newItem: AuditScheduleItem = {
      ...audit,
      id: `AUD-SCH-2026-${String(auditSchedule.length + 6).padStart(2, '0')}`,
      findingsCount: 0
    };
    setAuditSchedule([...auditSchedule, newItem]);
  };

  const acknowledgeFinding = (findingId: string) => {
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        return {
          ...f,
          lifecycleStage: 'acknowledged',
          acknowledgedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return f;
    }));
  };

  const proposeFindingCAPA = (findingId: string, corrective: string, preventive: string, targetDate: string, rcaMethod: 'simple' | 'five_whys', simpleRca?: SimpleRCA, fiveWhys?: string[]) => {
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        return {
          ...f,
          lifecycleStage: 'capa_proposed',
          rcaMethod,
          simpleRca,
          fiveWhysRca: fiveWhys,
          capaProposal: {
            correctiveAction: corrective,
            preventiveAction: preventive,
            targetDate,
            proposedAt: new Date().toISOString().substring(0, 10)
          }
        };
      }
      return f;
    }));
  };

  const approveFindingCAPA = (findingId: string, approverName: string, comments: string) => {
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        return {
          ...f,
          lifecycleStage: 'sqm_approved',
          sqmApproval: {
            approvedBy: approverName,
            approvedAt: new Date().toISOString().substring(0, 10),
            comments
          }
        };
      }
      return f;
    }));
  };

  const submitFindingEvidence = (findingId: string, notes: string, docRef: string) => {
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        return {
          ...f,
          lifecycleStage: 'implemented',
          implementationEvidence: {
            evidenceNotes: notes,
            documentRef: docRef,
            submittedAt: new Date().toISOString().substring(0, 10)
          }
        };
      }
      return f;
    }));
  };

  const verifyCloseFinding = (findingId: string, verifierName: string, notes: string) => {
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        return {
          ...f,
          lifecycleStage: 'closed_verified',
          effectivenessVerification: {
            verifiedBy: verifierName,
            verifiedAt: new Date().toISOString().substring(0, 10),
            isEffective: true,
            verificationNotes: notes
          }
        };
      }
      return f;
    }));
  };

  const issueNoticeFromFinding = (findingId: string, title: string, titleAr: string, summary: string, actions: string[]): SafetyBulletin => {
    const nextSeq = String(bulletins.length + 9).padStart(3, '0');
    const newRef = `RMF-ION-2026-${nextSeq}`;
    const newBulletin: SafetyBulletin = {
      id: `BUL-${Date.now()}`,
      refNumber: newRef,
      type: 'operational_notice',
      title,
      titleAr,
      issueDate: new Date().toISOString().substring(0, 10),
      targetDepartments: ["Operations - Ramp Services", "Operations - Load Control"],
      priority: 'urgent',
      summary,
      summaryAr: summary,
      content: `Notice issued following resolution of Audit Finding ${findingId}.`,
      contentAr: `تم إصدار هذا التعميم العملياتي بعد معالجة ملاحظة التفتيش رقم ${findingId}.`,
      mandatoryActions: actions,
      issuedBy: "Dr. Khaled Fawzy (Lead Auditor)",
      sourceFindingId: findingId,
      requiredStaffCount: 40,
      acknowledgments: []
    };

    setBulletins([newBulletin, ...bulletins]);
    setFindings(prev => prev.map(f => f.id === findingId ? { ...f, issuedNoticeId: newRef } : f));
    return newBulletin;
  };

  // SPI Methods
  const addSPI = (data: Omit<SPIItem, 'id' | 'lastUpdated'>) => {
    const newSPI: SPIItem = {
      ...data,
      id: `SPI-${String(spis.length + 1).padStart(2, '0')}`,
      lastUpdated: new Date().toISOString().substring(0, 10)
    };
    setSpis([...spis, newSPI]);
  };

  const updateSPI = (id: string, updated: Partial<SPIItem>) => {
    setSpis(prev => prev.map(s => s.id === id ? { ...s, ...updated, lastUpdated: new Date().toISOString().substring(0, 10) } : s));
  };

  const deleteSPI = (id: string) => {
    setSpis(prev => prev.filter(s => s.id !== id));
  };

  const logSPIReading = (id: string, value: number) => {
    setSpis(prev => prev.map(s => {
      if (s.id === id) {
        let status: 'nominal' | 'warning' | 'alert' = 'nominal';
        if (value >= s.alertThreshold) status = 'alert';
        else if (value > s.targetSPT) status = 'warning';

        return {
          ...s,
          currentValue: value,
          status,
          lastUpdated: new Date().toISOString().substring(0, 10)
        };
      }
      return s;
    }));
  };

  // Bulletins
  const issueBulletin = (data: Omit<SafetyBulletin, 'id' | 'refNumber' | 'issueDate' | 'acknowledgments'>): SafetyBulletin => {
    const nextSeq = String(bulletins.length + 5).padStart(3, '0');
    const refNumber = data.type === 'bulletin' ? `RMF-SB-2026-${nextSeq}` : `RMF-ION-2026-${nextSeq}`;
    const newDoc: SafetyBulletin = {
      ...data,
      id: `BUL-${Date.now()}`,
      refNumber,
      issueDate: new Date().toISOString().substring(0, 10),
      acknowledgments: []
    };
    setBulletins([newDoc, ...bulletins]);
    return newDoc;
  };

  const acknowledgeBulletin = (bulletinId: string, staffName: string, badgeNumber: string, department: string) => {
    setBulletins(prev => prev.map(b => {
      if (b.id === bulletinId) {
        const alreadyAck = b.acknowledgments.some(a => a.badgeNumber === badgeNumber);
        if (alreadyAck) return b;
        const newAck = {
          staffId: badgeNumber,
          staffName,
          badgeNumber,
          department,
          acknowledgedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          signature: `${staffName} (${badgeNumber})`
        };
        return {
          ...b,
          acknowledgments: [newAck, ...b.acknowledgments]
        };
      }
      return b;
    }));
  };

  // MoC
  const createMoC = (data: Omit<ManagementOfChange, 'id' | 'initiationDate' | 'status' | 'approvals' | 'postReviewDone'>) => {
    const nextSeq = String(mocs.length + 3).padStart(3, '0');
    const newMoC: ManagementOfChange = {
      ...data,
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
    setMocs(prev => prev.map(m => {
      if (m.id === id) {
        const date = new Date().toISOString().substring(0, 10);
        const approvals = { ...m.approvals };
        let status = m.status;

        if (stage === 'hod') {
          approvals.hodApproved = true;
          approvals.hodName = approverName;
          approvals.hodDate = date;
          status = 'hod_reviewed';
        } else if (stage === 'sqm') {
          approvals.sqmApproved = true;
          approvals.sqmName = approverName;
          approvals.sqmDate = date;
          status = 'sqm_reviewed';
        } else if (stage === 'ae') {
          approvals.aeApproved = true;
          approvals.aeName = approverName;
          approvals.aeDate = date;
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
    setMocs(prev => prev.map(m => m.id === id ? { ...m, status: 'closed', postReviewDone: true, postReviewNotes: notes } : m));
  };

  // GSE
  const updateGSETag = (id: string, status: 'green' | 'amber' | 'red', notes?: string) => {
    setGseFleet(prev => prev.map(g => {
      if (g.id === id) {
        return {
          ...g,
          tagStatus: status,
          activeDefectNotes: notes !== undefined ? notes : g.activeDefectNotes
        };
      }
      return g;
    }));
  };

  // Training
  const recertifyStaffCourse = (staffId: string, courseId: string, newExpiryDate: string) => {
    setTrainingRecords(prev => prev.map(st => {
      if (st.id === staffId) {
        return {
          ...st,
          courses: st.courses.map(c => {
            if (c.courseId === courseId) {
              return {
                ...c,
                certifiedDate: new Date().toISOString().substring(0, 10),
                expiryDate: newExpiryDate,
                status: 'valid'
              };
            }
            return c;
          })
        };
      }
      return st;
    }));
  };

  // Users & Access Matrix
  const updateRolePermission = (role: StationRole, permission: keyof RolePermissions, value: boolean) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: value
      }
    }));
  };

  const addUser = (userData: Omit<UserRecord, 'id'>) => {
    const newUser: UserRecord = {
      ...userData,
      id: `USR-${String(users.length + 9).padStart(2, '0')}`
    };
    setUsers([...users, newUser]);
  };

  // Reset Station Data
  const resetStationData = () => {
    setReports(INITIAL_REPORTS);
    setAuditSchedule(INITIAL_AUDIT_SCHEDULE);
    setFindings(INITIAL_FINDINGS);
    setSpis(INITIAL_SPIS);
    setBulletins(INITIAL_BULLETINS);
    setMocs(INITIAL_MOCS);
    setGseFleet(INITIAL_GSE);
    setTrainingRecords(INITIAL_TRAINING);
    setUsers(INITIAL_USERS);
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    setSafetyFormConfig(INITIAL_FORM_CONFIG);
    localStorage.clear();
  };

  return (
    <AppContext.Provider value={{
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
      updateInvestigation,
      setPreMitigationRisk,
      setReportRCA,
      setReportCAPA,
      markReportCAPAImplemented,
      setPostMitigationRisk,
      closeSafetyReport,
      issueBulletinFromReport,
      auditSchedule,
      findings,
      addAuditScheduleItem,
      acknowledgeFinding,
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
      updateGSETag,
      trainingRecords,
      recertifyStaffCourse,
      users,
      departments,
      rolePermissions,
      updateRolePermission,
      addUser,
      reviewSelections,
      setReviewSelections,
      resetStationData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
