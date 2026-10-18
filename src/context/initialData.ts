import { 
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
  RoleDefinition,
  SafetyReportFormConfig, 
  StationRole,
  SQMSNotification,
  AuditTemplate
} from '../types/index.ts';

export const INITIAL_NOTIFICATIONS: SQMSNotification[] = [
  {
    id: "NOTIF-01",
    timestamp: "2026-10-15 15:30",
    title: "New Safety Report Submitted (Intake)",
    titleAr: "تم تقديم بلاغ سلامة جديد بالمهبط",
    message: "Report RMF-SMS-2026-0045 submitted for Stand 8 (Fuel Puddle). S&Q acknowledgment required.",
    messageAr: "تم تقديم البلاغ RMF-SMS-2026-0045 بموقف ٨ (بقعة وقود). مطلوب تأكيد استلام إدارة السلامة.",
    targetRoles: ["safety_officer", "hod_safety", "ae", "ghm"],
    sourceReportId: "RMF-SMS-2026-0045",
    priority: "urgent",
    isRead: false,
    category: "new_report",
    emailSent: true,
    emailRecipient: "safety.officer@marsa-alam-ground.com"
  },
  {
    id: "NOTIF-02",
    timestamp: "2026-10-15 14:10",
    title: "Level Classification Required (SQM Only)",
    titleAr: "مطلوب تصنيف مستوى البلاغ وتاريخ الإغلاق (SQM)",
    message: "Report RMF-SMS-2026-0044 acknowledged. SQM must assign Level (Major 30d, Minor 60d, Obs 90d).",
    messageAr: "تم تأكيد استلام البلاغ RMF-SMS-2026-0044. يتعين على مدير السلامة والجودة تحديد المستوى وتاريخ الإغلاق.",
    targetRoles: ["hod_safety", "ae", "ghm"],
    sourceReportId: "RMF-SMS-2026-0044",
    priority: "urgent",
    isRead: false,
    category: "acknowledged",
    emailSent: true,
    emailRecipient: "k.fawzy@marsa-alam-ground.com"
  },
  {
    id: "NOTIF-03",
    timestamp: "2026-10-14 11:20",
    title: "CAPA Plan Review Requested",
    titleAr: "طلب مراجعة واعتماد خطة الـ CAPA",
    message: "Capt. Sherif Nour (HoD Operations) submitted CAPA plan with 5-Whys RCA for RMF-SMS-2026-0041. SQM review pending.",
    messageAr: "قدم كابتن شريف نور (مدير العمليات) خطة الإجراءات التصحيحية والتحليل الجذري للبلاغ RMF-SMS-2026-0041. بانتظار اعتماد SQM.",
    targetRoles: ["hod_safety", "ae", "ghm"],
    sourceReportId: "RMF-SMS-2026-0041",
    priority: "normal",
    isRead: false,
    category: "plan_submitted",
    emailSent: true,
    emailRecipient: "k.fawzy@marsa-alam-ground.com"
  },
  {
    id: "NOTIF-04",
    timestamp: "2026-10-14 09:05",
    title: "⚠️ OVERDUE Target Closure Date Warning!",
    titleAr: "⚠️ تنبيه: تجاوز التاريخ المستهدف لإغلاق الحالة!",
    message: "Case RMF-SMS-2026-0037 has exceeded its 30-day mandated closure window. Current status: 14 days OVERDUE.",
    messageAr: "الحالة RMF-SMS-2026-0037 تجاوزت المهلة المحددة قانوناً (٣٠ يوماً). الحالة الحالية: متأخرة ١٤ يوماً.",
    targetRoles: ["hod_safety", "hod_maint", "sdm", "ghm", "ae"],
    sourceReportId: "RMF-SMS-2026-0037",
    priority: "critical",
    isRead: false,
    category: "overdue_alert",
    emailSent: true,
    emailRecipient: "escalation@marsa-alam-ground.com"
  },
  {
    id: "NOTIF-05",
    timestamp: "2026-10-13 16:45",
    title: "Case Ready for Final SQM Sign-off & Closure",
    titleAr: "الحالة جاهزة للتوقيع الرقمي النهائي والإغلاق",
    message: "Case RMF-SMS-2026-0038 effectiveness verified & residual risk 1E (Low) recorded. Ready for SQM digital sign-off.",
    messageAr: "تم التحقق من فعالية الإجراءات وتسجيل الخطر المتبقي 1E للحالة RMF-SMS-2026-0038. جاهزة للتوقيع النهائي من SQM.",
    targetRoles: ["hod_safety", "ae"],
    sourceReportId: "RMF-SMS-2026-0038",
    priority: "urgent",
    isRead: false,
    category: "signoff_ready",
    emailSent: true,
    emailRecipient: "k.fawzy@marsa-alam-ground.com"
  },
  {
    id: "NOTIF-06",
    timestamp: "2026-10-13 10:15",
    title: "CAPA Plan Returned for Revision",
    titleAr: "تمت إعادة خطة الـ CAPA للتعديل والمراجعة",
    message: "Case RMF-SMS-2026-0040 plan returned by SQM: 'Add mandatory latch torque calibration'. HoD update required.",
    messageAr: "تمت إعادة خطة الحالة RMF-SMS-2026-0040 من قِبل مدير السلامة: 'إضافة معايرة عزم إغلاق المزلاج'. مطلوب تحديث مدير الإدارة.",
    targetRoles: ["hod_ops", "ramp_supervisor"],
    sourceReportId: "RMF-SMS-2026-0040",
    priority: "urgent",
    isRead: false,
    category: "plan_returned",
    emailSent: true,
    emailRecipient: "s.nour@marsa-alam-ground.com"
  }
];

export const INITIAL_REPORTS: SafetyReport[] = [
  // 1. Submitted (Pending Ack)
  {
    id: "RMF-SMS-2026-0045",
    timestamp: "2026-10-15 15:20",
    reportSource: "frontline_agent",
    reporterType: "identified",
    reporterName: "Ahmed Mansour",
    reporterBadge: "RMF-7842",
    department: "Operations - Ramp Services",
    category: "spill",
    location: "Apron Stand 8",
    standNumber: "Stand 8",
    flightNumber: "MS 451",
    aircraftReg: "SU-GDZ",
    description: "Jet A-1 fuel sheen and minor puddle spotted near the port refueling hydrant pit during aircraft turnaround fueling.",
    lifecycleStatus: "submitted",
    auditTrail: [
      {
        id: "AT-45-01",
        timestamp: "2026-10-15 15:20",
        actorName: "Ahmed Mansour",
        actorRole: "field_staff",
        action: "Report Submitted",
        details: "Frontline 30-second ramp report registered into RMF safety queue.",
        newStatus: "submitted"
      }
    ],
    attachments: [
      {
        id: "ATT-45-01",
        fileName: "Hydrant_Pit_Sheen_Stand8.jpg",
        fileSize: "1.4 MB",
        fileType: "image/jpeg",
        uploadedBy: "Ahmed Mansour",
        uploadedRole: "Frontline Ramp Agent",
        uploadedAt: "2026-10-15 15:21",
        category: "initial_report"
      }
    ]
  },

  // 2. Acknowledged (Pending Level Classification by SQM)
  {
    id: "RMF-SMS-2026-0044",
    timestamp: "2026-10-15 13:40",
    reportSource: "airline_report",
    airlineName: "Edelweiss Air",
    airlineRefNumber: "WK-GND-2026-881",
    reporterType: "identified",
    reporterName: "Capt. Markus Weber (Flight Crew)",
    department: "Operations - Passenger Handling",
    category: "near_miss",
    location: "Passenger Boarding Gate",
    flightNumber: "WK 234",
    aircraftReg: "HB-JHC",
    description: "Passenger Boarding Bridge (PBB) canopy extended with slight misalignment against aircraft L1 door frame during passenger disembarkation.",
    lifecycleStatus: "acknowledged",
    acknowledgedBy: "Mahmoud Ezz (Safety Officer)",
    acknowledgedAt: "2026-10-15 14:05",
    safetyOfficerAssigned: "Mahmoud Ezz",
    auditTrail: [
      {
        id: "AT-44-01",
        timestamp: "2026-10-15 13:40",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Airline Report Recorded",
        details: "Formally logged carrier notice from Edelweiss Air (WK 234).",
        newStatus: "submitted"
      },
      {
        id: "AT-44-02",
        timestamp: "2026-10-15 14:05",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Receipt Acknowledged",
        details: "Confirmed received; notified SQM for Level Classification (Major / Minor / Observation).",
        previousStatus: "submitted",
        newStatus: "acknowledged"
      }
    ],
    attachments: [
      {
        id: "ATT-44-01",
        fileName: "Edelweiss_Occurrence_Report_WK234.pdf",
        fileSize: "420 KB",
        fileType: "application/pdf",
        uploadedBy: "Mahmoud Ezz",
        uploadedRole: "Safety Officer",
        uploadedAt: "2026-10-15 13:45",
        category: "initial_report"
      }
    ]
  },

  // 3. Level Assigned (Pending Investigation by S&Q)
  {
    id: "RMF-SMS-2026-0043",
    timestamp: "2026-10-14 16:00",
    reportSource: "frontline_agent",
    reporterType: "identified",
    reporterName: "Hassan Ali",
    reporterBadge: "RMF-6109",
    department: "Operations - Ramp Services",
    category: "hazard",
    location: "Apron Stand 2",
    standNumber: "Stand 2",
    flightNumber: "NO 310",
    aircraftReg: "I-NEOS",
    gseIdLinked: "RMF-BL-04",
    description: "Emergency stop button on Belt Loader RMF-BL-04 failed to disengage motor immediately during mock ramp safety check.",
    lifecycleStatus: "level_assigned",
    acknowledgedBy: "Mahmoud Ezz (Safety Officer)",
    acknowledgedAt: "2026-10-14 16:15",
    safetyOfficerAssigned: "Mahmoud Ezz",
    level: "level_1",
    levelAssignedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
    levelAssignedAt: "2026-10-14 17:00",
    targetClosureDate: "2026-11-13", // 30 days
    auditTrail: [
      {
        id: "AT-43-01",
        timestamp: "2026-10-14 16:00",
        actorName: "Hassan Ali",
        actorRole: "field_staff",
        action: "Report Submitted",
        newStatus: "submitted"
      },
      {
        id: "AT-43-02",
        timestamp: "2026-10-14 16:15",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Receipt Acknowledged",
        previousStatus: "submitted",
        newStatus: "acknowledged"
      },
      {
        id: "AT-43-03",
        timestamp: "2026-10-14 17:00",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Level 1 Assigned (Major)",
        details: "Level 1 Major assigned due to potential uncommanded conveyor motion in aircraft hold. Mandated closure: 30 days (due 2026-11-13).",
        previousStatus: "acknowledged",
        newStatus: "level_assigned"
      }
    ],
    attachments: []
  },

  // 4. CAPA Plan Pending (Assigned to HoD Maintenance, Approaching due date)
  {
    id: "RMF-SMS-2026-0042",
    timestamp: "2026-10-13 08:30",
    reportSource: "frontline_agent",
    reporterType: "identified",
    reporterName: "Mahmoud Soliman",
    reporterBadge: "RMF-5521",
    department: "Operations - Ramp Services",
    category: "gse_damage",
    location: "GSE Workshop Bay",
    gseIdLinked: "RMF-GPU-01",
    description: "Ground Power Unit (GPU) output cable sheath cracked with exposed copper braiding detected at Stand 5 connector plug.",
    lifecycleStatus: "plan_pending",
    acknowledgedBy: "Mahmoud Ezz",
    acknowledgedAt: "2026-10-13 08:45",
    safetyOfficerAssigned: "Mahmoud Ezz",
    level: "level_2",
    levelAssignedBy: "Dr. Khaled Fawzy",
    levelAssignedAt: "2026-10-13 09:30",
    targetClosureDate: "2026-12-12", // 60 days
    existingProcedures: [
      "IGOM 4.2.1 Electrical Ground Support Equipment Safe Connection",
      "RMF-SOP-GSE-08 Daily GPU Plug & Cable Visual Inspection"
    ],
    currentMitigations: "GPU RMF-GPU-01 immediately Amber-tagged and withdrawn from active flight turnaround line.",
    preMitigationRisk: {
      severity: 4,
      likelihood: "C",
      scoreCode: "4C",
      level: "High",
      notes: "High voltage shock or short circuit hazard during aircraft 400Hz connection."
    },
    assignedHoD: "Eng. Tarek Fathy",
    assignedHoDRole: "hod_maint",
    capaPlanDueDate: "2026-10-18",
    investigationSummary: "Cable damaged by vehicle tire overrun due to improper cable cradle stowage during transit.",
    auditTrail: [
      {
        id: "AT-42-01",
        timestamp: "2026-10-13 08:30",
        actorName: "Mahmoud Soliman",
        actorRole: "field_staff",
        action: "Report Submitted",
        newStatus: "submitted"
      },
      {
        id: "AT-42-02",
        timestamp: "2026-10-13 08:45",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Acknowledged",
        previousStatus: "submitted",
        newStatus: "acknowledged"
      },
      {
        id: "AT-42-03",
        timestamp: "2026-10-13 09:30",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Level 2 Assigned (Minor)",
        details: "Assigned Level 2 Minor (60 days target closure). Target: 2026-12-12.",
        previousStatus: "acknowledged",
        newStatus: "level_assigned"
      },
      {
        id: "AT-42-04",
        timestamp: "2026-10-13 11:00",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Investigation Completed & HoD Assigned",
        details: "Assigned to Eng. Tarek Fathy (HoD Maintenance). CAPA plan due by 2026-10-18.",
        previousStatus: "level_assigned",
        newStatus: "plan_pending"
      }
    ],
    attachments: [
      {
        id: "ATT-42-01",
        fileName: "GPU_Cable_Sheath_Damage.jpg",
        fileSize: "2.1 MB",
        fileType: "image/jpeg",
        uploadedBy: "Mahmoud Ezz",
        uploadedRole: "Safety Officer",
        uploadedAt: "2026-10-13 10:50",
        category: "investigation"
      }
    ]
  },

  // 5. Plan Under Review by SQM
  {
    id: "RMF-SMS-2026-0041",
    timestamp: "2026-10-12 11:00",
    reportSource: "frontline_agent",
    reporterType: "anonymous",
    department: "Operations - Passenger Handling",
    category: "near_miss",
    location: "Gate 3 & Apron Roadway",
    standNumber: "Stand 2",
    flightNumber: "WK 234",
    description: "Passenger shuttle bus crossed marked apron roadway without halting at the aircraft taxiway hold line while Edelweiss A320 was taxiing in.",
    lifecycleStatus: "plan_under_review",
    acknowledgedBy: "Mahmoud Ezz",
    acknowledgedAt: "2026-10-12 11:15",
    safetyOfficerAssigned: "Mahmoud Ezz",
    level: "level_1",
    levelAssignedBy: "Dr. Khaled Fawzy",
    levelAssignedAt: "2026-10-12 11:45",
    targetClosureDate: "2026-11-11", // 30 days
    existingProcedures: [
      "ICAO Annex 14 Apron Markings & Hold Lines",
      "RMF Apron Driving Regulations Section 3 (Right of Way)"
    ],
    currentMitigations: "Temporary traffic cones deployed at intersection; ramp supervisors conducting random speed radar checks.",
    preMitigationRisk: {
      severity: 4,
      likelihood: "B",
      scoreCode: "4B",
      level: "High",
      notes: "Severe collision potential between ground vehicle and taxiing passenger jet."
    },
    assignedHoD: "Capt. Sherif Nour",
    assignedHoDRole: "hod_ops",
    capaPlanDueDate: "2026-10-16",
    investigationSummary: "Driver reported sun glare and faded ground paint marking at hold line 2B.",
    rcaType: "five_whys",
    fiveWhysRca: [
      "Why did shuttle bus breach hold line? Driver did not see the horizontal yellow ground marking in morning glare.",
      "Why was line not visible? Pavement paint had weathered and faded over 6 months of intense Red Sea sun.",
      "Why was it not repainted earlier? Roadway marking inspections were scheduled quarterly rather than monthly.",
      "Why quarterly? Station infrastructure maintenance schedule had not been updated after charter traffic doubled.",
      "Why not updated? Safety risk assessment for peak season expansion did not trigger roadway maintenance review."
    ],
    capa: {
      correctiveAction: "Repaint holding line 2B with high-reflectivity glass-bead aviation paint; erect vertical high-contrast LED stop beacon.",
      preventiveAction: "Institute bi-weekly apron road markings audit protocol; revise Peak Season Management of Change (MoC) checklist to mandate pavement visibility audits.",
      assignedDepartment: "Operations - Ramp Services",
      assignedManager: "Capt. Sherif Nour (HoD Operations)",
      targetDate: "2026-10-25",
      submittedAt: "2026-10-14 11:15",
      status: "submitted"
    },
    auditTrail: [
      {
        id: "AT-41-01",
        timestamp: "2026-10-12 11:00",
        actorName: "Anonymous Reporter",
        actorRole: "field_staff",
        action: "Report Submitted (Just Culture)",
        newStatus: "submitted"
      },
      {
        id: "AT-41-02",
        timestamp: "2026-10-12 11:15",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Receipt Acknowledged",
        previousStatus: "submitted",
        newStatus: "acknowledged"
      },
      {
        id: "AT-41-03",
        timestamp: "2026-10-12 11:45",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Level 1 Major Assigned",
        details: "Assigned Level 1 Major (30 days mandated closure). Target closure date: 2026-11-11.",
        previousStatus: "acknowledged",
        newStatus: "level_assigned"
      },
      {
        id: "AT-41-04",
        timestamp: "2026-10-12 14:00",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Investigation Recorded & HoD Operations Assigned",
        previousStatus: "level_assigned",
        newStatus: "plan_pending"
      },
      {
        id: "AT-41-05",
        timestamp: "2026-10-14 11:15",
        actorName: "Capt. Sherif Nour",
        actorRole: "hod_ops",
        action: "CAPA Plan & 5-Whys RCA Submitted",
        details: "Plan submitted for SQM review. Includes repainting with glass-bead paint and vertical LED beacon.",
        previousStatus: "plan_pending",
        newStatus: "plan_under_review"
      }
    ],
    attachments: [
      {
        id: "ATT-41-01",
        fileName: "Hold_Line_Fading_Stand2.jpg",
        fileSize: "1.8 MB",
        fileType: "image/jpeg",
        uploadedBy: "Mahmoud Ezz",
        uploadedRole: "Safety Officer",
        uploadedAt: "2026-10-12 13:40",
        category: "investigation"
      },
      {
        id: "ATT-41-02",
        fileName: "Work_Order_Apron_Painting_WO889.pdf",
        fileSize: "650 KB",
        fileType: "application/pdf",
        uploadedBy: "Capt. Sherif Nour",
        uploadedRole: "HoD Operations",
        uploadedAt: "2026-10-14 11:10",
        category: "capa_plan"
      }
    ]
  },

  // 6. Plan Returned for Revision
  {
    id: "RMF-SMS-2026-0040",
    timestamp: "2026-10-11 10:15",
    reportSource: "frontline_agent",
    reporterType: "identified",
    reporterName: "Ibrahim Metwally",
    reporterBadge: "RMF-3381",
    department: "Operations - Ramp Services",
    category: "gse_damage",
    location: "Baggage Makeup Area",
    gseIdLinked: "RMF-CT-12",
    description: "Baggage container trolley towbar latch sprang open while negotiating turn on apron service road. One empty AKH container slipped off.",
    lifecycleStatus: "plan_returned",
    acknowledgedBy: "Mahmoud Ezz",
    acknowledgedAt: "2026-10-11 10:30",
    safetyOfficerAssigned: "Mahmoud Ezz",
    level: "level_2",
    levelAssignedBy: "Dr. Khaled Fawzy",
    levelAssignedAt: "2026-10-11 11:00",
    targetClosureDate: "2026-12-10", // 60 days
    existingProcedures: ["IGOM 4.1 GSE Towing & Coupling Safety Requirements"],
    currentMitigations: "Trolley RMF-CT-12 removed from baggage train service.",
    preMitigationRisk: {
      severity: 3,
      likelihood: "C",
      scoreCode: "3C",
      level: "Medium"
    },
    assignedHoD: "Capt. Sherif Nour",
    assignedHoDRole: "hod_ops",
    capaPlanDueDate: "2026-10-15",
    investigationSummary: "Lock pin spring was worn and failed under lateral force.",
    rcaType: "simple",
    simpleRca: {
      directCause: "Towbar locking pin detached due to internal spring fatigue.",
      contributingFactor: "High salt air ambient environment accelerating corrosion.",
      systemicGap: "Shift pre-use inspection checklist did not specify physical tug test of towbar lock."
    },
    capa: {
      correctiveAction: "Replace lock spring assembly on RMF-CT-12.",
      preventiveAction: "Instruct ramp agents to verbally check latches.",
      assignedDepartment: "Operations - Ramp Services",
      assignedManager: "Capt. Sherif Nour",
      targetDate: "2026-10-20",
      status: "returned"
    },
    sqmPlanReviewDecision: "return",
    sqmPlanReviewComments: "Preventive action is inadequate. Merely 'verbally instructing' staff will not prevent recurrence. Please mandate a documented physical spring tension gauge inspection in GSE maintenance work cards and update the pre-departure checklist. Revise and resubmit.",
    sqmPlanReviewedAt: "2026-10-13 10:10",
    sqmPlanReviewedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
    auditTrail: [
      {
        id: "AT-40-01",
        timestamp: "2026-10-11 10:15",
        actorName: "Ibrahim Metwally",
        actorRole: "field_staff",
        action: "Report Submitted",
        newStatus: "submitted"
      },
      {
        id: "AT-40-02",
        timestamp: "2026-10-11 10:30",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Acknowledged",
        newStatus: "acknowledged"
      },
      {
        id: "AT-40-03",
        timestamp: "2026-10-11 11:00",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Level 2 Minor Assigned (60 days)",
        newStatus: "level_assigned"
      },
      {
        id: "AT-40-04",
        timestamp: "2026-10-12 09:30",
        actorName: "Capt. Sherif Nour",
        actorRole: "hod_ops",
        action: "Initial CAPA Plan Submitted",
        newStatus: "plan_under_review"
      },
      {
        id: "AT-40-05",
        timestamp: "2026-10-13 10:10",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Plan Returned for Revision",
        comments: "Preventive action is inadequate. Mandate physical spring tension gauge checks in maintenance cards and update pre-departure checklist.",
        previousStatus: "plan_under_review",
        newStatus: "plan_returned"
      }
    ],
    attachments: []
  },

  // 7. Effectiveness Evaluation Pending
  {
    id: "RMF-SMS-2026-0039",
    timestamp: "2026-10-09 14:00",
    reportSource: "frontline_agent",
    reporterType: "identified",
    reporterName: "Youssef Kamel",
    reporterBadge: "RMF-4190",
    department: "Operations - Load Control",
    category: "delay",
    location: "Apron Stand 3",
    flightNumber: "SM 812",
    aircraftReg: "SU-BTM",
    description: "Load sheet discrepancy: Cargo hold 3 loaded with 4 ULDs while electronic load trim sheet indicated hold 4. Corrected prior to pushback; flight delayed 18 mins.",
    lifecycleStatus: "effectiveness_pending",
    acknowledgedBy: "Mahmoud Ezz",
    acknowledgedAt: "2026-10-09 14:15",
    safetyOfficerAssigned: "Mahmoud Ezz",
    level: "level_1",
    levelAssignedBy: "Dr. Khaled Fawzy",
    levelAssignedAt: "2026-10-09 15:00",
    targetClosureDate: "2026-11-08", // 30 days
    existingProcedures: [
      "IATA AHM 590 Load Control Procedures",
      "Air Cairo Ground Operations Manual Sec 5 (Weight & Balance)"
    ],
    currentMitigations: "Mandatory double-readback between Loading Team Leader and Central Load Control.",
    preMitigationRisk: {
      severity: 4,
      likelihood: "B",
      scoreCode: "4B",
      level: "High",
      notes: "Aircraft center of gravity (CG) out-of-trim condition creates catastrophic takeoff trim risk."
    },
    assignedHoD: "Capt. Sherif Nour",
    assignedHoDRole: "hod_ops",
    capaPlanDueDate: "2026-10-14",
    investigationSummary: "Radio frequency interference caused loading team leader to mishear hold number; loading instruction report was not cross-verified at aircraft door.",
    rcaType: "simple",
    simpleRca: {
      directCause: "Loading team misread loading sheet hold allocation.",
      contributingFactor: "Noise on ramp and simultaneous radio chatter.",
      systemicGap: "DCS barcode hold verification scanner was offline for battery recharge."
    },
    capa: {
      correctiveAction: "Immediate offload and re-stowage of ULDs to hold 4 under supervision of Load Control Specialist.",
      preventiveAction: "Institute mandatory handheld barcode scanning of each ULD prior to latching into hold locks; install secondary battery docks at ramp dispatch.",
      assignedDepartment: "Operations - Load Control",
      assignedManager: "Capt. Sherif Nour",
      targetDate: "2026-10-12",
      submittedAt: "2026-10-11 12:00",
      status: "approved"
    },
    sqmPlanReviewDecision: "approve",
    sqmPlanReviewComments: "Approved. Handheld scanning protocol aligns with IATA AHM 590 requirements. Proceed with 10-turnaround verification audit.",
    sqmPlanReviewedAt: "2026-10-11 16:00",
    sqmPlanReviewedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
    auditTrail: [
      {
        id: "AT-39-01",
        timestamp: "2026-10-09 14:00",
        actorName: "Youssef Kamel",
        actorRole: "field_staff",
        action: "Report Submitted",
        newStatus: "submitted"
      },
      {
        id: "AT-39-02",
        timestamp: "2026-10-09 14:15",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Acknowledged",
        newStatus: "acknowledged"
      },
      {
        id: "AT-39-03",
        timestamp: "2026-10-09 15:00",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Level 1 Major Assigned (30d target)",
        newStatus: "level_assigned"
      },
      {
        id: "AT-39-04",
        timestamp: "2026-10-11 12:00",
        actorName: "Capt. Sherif Nour",
        actorRole: "hod_ops",
        action: "CAPA Plan Submitted",
        newStatus: "plan_under_review"
      },
      {
        id: "AT-39-05",
        timestamp: "2026-10-11 16:00",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Plan Approved by SQM",
        comments: "Approved. Handheld barcode verification protocol satisfies ISAGO LOD requirements.",
        previousStatus: "plan_under_review",
        newStatus: "effectiveness_pending"
      }
    ],
    attachments: [
      {
        id: "ATT-39-01",
        fileName: "Load_Sheet_Discrepancy_SM812.pdf",
        fileSize: "880 KB",
        fileType: "application/pdf",
        uploadedBy: "Youssef Kamel",
        uploadedRole: "Load Control Specialist",
        uploadedAt: "2026-10-09 14:20",
        category: "initial_report"
      }
    ]
  },

  // 8. Pending Final Sign-off & Closure by SQM
  {
    id: "RMF-SMS-2026-0038",
    timestamp: "2026-10-08 14:20",
    reportSource: "frontline_agent",
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
    lifecycleStatus: "pending_signoff",
    acknowledgedBy: "Mahmoud Ezz (Safety Officer)",
    acknowledgedAt: "2026-10-08 14:35",
    safetyOfficerAssigned: "Mahmoud Ezz",
    level: "level_1",
    levelAssignedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
    levelAssignedAt: "2026-10-08 15:00",
    targetClosureDate: "2026-11-07", // 30 days
    existingProcedures: ["IGOM 4.1 Pushback Operations", "GSE Maintenance Manual Card #14"],
    currentMitigations: "RMF-TUG-02 Red-tagged; absorbent granules applied to stand 4 immediately.",
    preMitigationRisk: {
      severity: 4,
      likelihood: "B",
      scoreCode: "4B",
      level: "High",
      notes: "Slip hazard on apron + potential brake/steering loss during pushback operation."
    },
    assignedHoD: "Eng. Tarek Fathy",
    assignedHoDRole: "hod_maint",
    capaPlanDueDate: "2026-10-12",
    investigationSummary: "Inspected RMF-TUG-02 on Stand 4. High-pressure hydraulic hose clamp was loose. Oil sheen spread ~1.5 meters into aircraft safety zone.",
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
      targetDate: "2026-10-12",
      submittedAt: "2026-10-10 11:00",
      status: "approved"
    },
    sqmPlanReviewDecision: "approve",
    sqmPlanReviewComments: "Approved. Work Card #14 amendment satisfies IGOM 4.2 requirements.",
    sqmPlanReviewedAt: "2026-10-10 14:00",
    sqmPlanReviewedBy: "Dr. Khaled Fawzy",
    effectivenessEvaluation: {
      evaluatedBy: "Mahmoud Ezz (Safety Officer)",
      evaluatedAt: "2026-10-13 16:30",
      isEffective: true,
      evaluationNotes: "Conducted physical torque audit on RMF-TUG-02 and sampled 4 other pushback tugs in GSE workshop. All clamps verified at 45 Nm torque. Work Card #14 signed off.",
      evidenceSummary: "Maintenance work order WO-992 completed; zero leaks observed over 12 operational pushbacks."
    },
    residualRisk: {
      severity: 1,
      likelihood: "E",
      scoreCode: "1E",
      level: "Low",
      notes: "Residual risk negligible under revised mandatory torque verification regimen."
    },
    postMitigationRisk: {
      severity: 1,
      likelihood: "E",
      scoreCode: "1E",
      level: "Low"
    },
    auditTrail: [
      {
        id: "AT-38-01",
        timestamp: "2026-10-08 14:20",
        actorName: "Ahmed Mansour",
        actorRole: "field_staff",
        action: "Report Submitted",
        newStatus: "submitted"
      },
      {
        id: "AT-38-02",
        timestamp: "2026-10-08 14:35",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Receipt Acknowledged",
        newStatus: "acknowledged"
      },
      {
        id: "AT-38-03",
        timestamp: "2026-10-08 15:00",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Level 1 Major Assigned (30d target)",
        newStatus: "level_assigned"
      },
      {
        id: "AT-38-04",
        timestamp: "2026-10-09 10:00",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Investigation & Risk Assessment Saved",
        newStatus: "plan_pending"
      },
      {
        id: "AT-38-05",
        timestamp: "2026-10-10 11:00",
        actorName: "Eng. Tarek Fathy",
        actorRole: "hod_maint",
        action: "CAPA Plan & 5-Whys RCA Submitted",
        newStatus: "plan_under_review"
      },
      {
        id: "AT-38-06",
        timestamp: "2026-10-10 14:00",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Plan Approved by SQM",
        newStatus: "effectiveness_pending"
      },
      {
        id: "AT-38-07",
        timestamp: "2026-10-13 16:30",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Effectiveness & Residual Risk (1E) Recorded",
        details: "Physical audit verified 45 Nm torque on 5 tugs. Requesting SQM final sign-off & closure.",
        previousStatus: "effectiveness_pending",
        newStatus: "pending_signoff"
      }
    ],
    attachments: [
      {
        id: "ATT-38-01",
        fileName: "Hydraulic_Spill_Stand4.jpg",
        fileSize: "1.9 MB",
        fileType: "image/jpeg",
        uploadedBy: "Ahmed Mansour",
        uploadedRole: "Ramp Agent",
        uploadedAt: "2026-10-08 14:25",
        category: "initial_report"
      },
      {
        id: "ATT-38-02",
        fileName: "Work_Order_WO992_Tug_Torque.pdf",
        fileSize: "740 KB",
        fileType: "application/pdf",
        uploadedBy: "Eng. Tarek Fathy",
        uploadedRole: "HoD Maintenance",
        uploadedAt: "2026-10-10 10:55",
        category: "capa_plan"
      },
      {
        id: "ATT-38-03",
        fileName: "Effectiveness_Inspection_Checksheet.pdf",
        fileSize: "510 KB",
        fileType: "application/pdf",
        uploadedBy: "Mahmoud Ezz",
        uploadedRole: "Safety Officer",
        uploadedAt: "2026-10-13 16:20",
        category: "effectiveness"
      }
    ]
  },

  // 9. OVERDUE ITEM (30-day target passed)
  {
    id: "RMF-SMS-2026-0037",
    timestamp: "2026-09-01 10:00",
    reportSource: "frontline_agent",
    reporterType: "identified",
    reporterName: "Ibrahim Metwally",
    reporterBadge: "RMF-3381",
    department: "Maintenance - GSE Fleet",
    category: "gse_damage",
    location: "Apron Stand 1",
    gseIdLinked: "RMF-TUG-01",
    description: "Main aircraft pushback towbar shear pin fractured prematurely while aligning tug with Boeing 737 nose gear.",
    lifecycleStatus: "plan_pending",
    acknowledgedBy: "Mahmoud Ezz",
    acknowledgedAt: "2026-09-01 10:15",
    safetyOfficerAssigned: "Mahmoud Ezz",
    level: "level_1",
    levelAssignedBy: "Dr. Khaled Fawzy",
    levelAssignedAt: "2026-09-01 11:00",
    targetClosureDate: "2026-10-01", // 30 days -> PAST TARGET!
    existingProcedures: ["IGOM 4.1.3 Shear Pin Rating & Replacement Protocols"],
    currentMitigations: "Towbar quarantined for metallurgical analysis.",
    preMitigationRisk: {
      severity: 4,
      likelihood: "C",
      scoreCode: "4C",
      level: "High",
      notes: "Aircraft nose gear damage risk during pushback if incorrect shear pin strength is fitted."
    },
    assignedHoD: "Eng. Tarek Fathy",
    assignedHoDRole: "hod_maint",
    capaPlanDueDate: "2026-09-10",
    investigationSummary: "Counterfeit/unrated shear pin was sourced during emergency inventory stockout without S&Q approval.",
    auditTrail: [
      {
        id: "AT-37-01",
        timestamp: "2026-09-01 10:00",
        actorName: "Ibrahim Metwally",
        actorRole: "field_staff",
        action: "Report Submitted",
        newStatus: "submitted"
      },
      {
        id: "AT-37-02",
        timestamp: "2026-09-01 10:15",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Acknowledged",
        newStatus: "acknowledged"
      },
      {
        id: "AT-37-03",
        timestamp: "2026-09-01 11:00",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Level 1 Major Assigned (30 Days)",
        details: "Mandated closure target: 2026-10-01.",
        newStatus: "level_assigned"
      },
      {
        id: "AT-37-04",
        timestamp: "2026-09-02 09:00",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Investigation & HoD Maintenance Assigned",
        newStatus: "plan_pending"
      }
    ],
    attachments: [
      {
        id: "ATT-37-01",
        fileName: "Shear_Pin_Fracture_Photo.jpg",
        fileSize: "2.4 MB",
        fileType: "image/jpeg",
        uploadedBy: "Ibrahim Metwally",
        uploadedRole: "Senior GSE Mechanic",
        uploadedAt: "2026-09-01 10:20",
        category: "initial_report"
      }
    ]
  },

  // 10. Closed & Signed Off (Full 8-Step Lifecycle with Digital Signature)
  {
    id: "RMF-SMS-2026-0031",
    timestamp: "2026-09-10 18:40",
    reportSource: "frontline_agent",
    reporterType: "identified",
    reporterName: "Hassan Ali",
    reporterBadge: "RMF-6109",
    department: "Operations - Ramp Services",
    category: "fod",
    location: "Apron Stand 6",
    standNumber: "Stand 6",
    description: "Metal luggage tag fastener and loose baggage trolley bolt spotted near nose gear wheel chock position prior to flight X3 6128 arrival.",
    lifecycleStatus: "closed",
    acknowledgedBy: "Mahmoud Ezz (Safety Officer)",
    acknowledgedAt: "2026-09-10 18:45",
    safetyOfficerAssigned: "Mahmoud Ezz",
    level: "level_2",
    levelAssignedBy: "Dr. Khaled Fawzy",
    levelAssignedAt: "2026-09-11 09:00",
    targetClosureDate: "2026-11-10", // 60 days
    existingProcedures: ["IGOM 4.1 Apron Safety & Pre-Arrival FOD Sweeps"],
    currentMitigations: "Debris cleared immediately into airside FOD bin.",
    preMitigationRisk: {
      severity: 3,
      likelihood: "C",
      scoreCode: "3C",
      level: "Medium"
    },
    assignedHoD: "Capt. Sherif Nour",
    assignedHoDRole: "hod_ops",
    capaPlanDueDate: "2026-09-18",
    investigationSummary: "FOD cleared immediately into ramp FOD bin. Fastener originated from worn conveyor belt guide rail.",
    rcaType: "simple",
    simpleRca: {
      directCause: "Vibrations on baggage cart caused loose bolt detachment.",
      contributingFactor: "High turnarounds during charter rush hour.",
      systemicGap: "Mandatory pre-arrival FOD walk was executed but lacked documentation on ramp turnaround log."
    },
    capa: {
      correctiveAction: "Inspect all baggage trolleys in Service Sector B for loose hardware.",
      preventiveAction: "Enforce mandatory signed FOD sweep on turnaround dispatch sheet and issue station bulletin.",
      assignedDepartment: "Operations - Ramp Services",
      assignedManager: "Capt. Sherif Nour",
      targetDate: "2026-09-20",
      submittedAt: "2026-09-15 14:00",
      status: "verified"
    },
    sqmPlanReviewDecision: "approve",
    sqmPlanReviewComments: "Approved. Turnaround sheet sign-off provides mandatory audit trail.",
    sqmPlanReviewedAt: "2026-09-16 10:00",
    sqmPlanReviewedBy: "Dr. Khaled Fawzy",
    effectivenessEvaluation: {
      evaluatedBy: "Mahmoud Ezz (Safety Officer)",
      evaluatedAt: "2026-09-28 11:00",
      isEffective: true,
      evaluationNotes: "Audited 30 consecutive turnaround flight logs. 100% compliance with dual-person signed FOD sweeps. Zero FOD reported on stands 1 to 12.",
      evidenceSummary: "Turnaround logs archived in Safety Office."
    },
    residualRisk: {
      severity: 1,
      likelihood: "E",
      scoreCode: "1E",
      level: "Low"
    },
    postMitigationRisk: {
      severity: 1,
      likelihood: "E",
      scoreCode: "1E",
      level: "Low"
    },
    finalSignoff: {
      signedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
      signedAt: "2026-09-29 14:15",
      comments: "Full corrective and preventive actions verified. Residual risk reduced to As Low As Reasonably Practicable (ALARP). Formally closed.",
      signatureHash: "RMF-DSIG-9842F7B1-ICAO-SMS"
    },
    closedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
    closedAt: "2026-09-29 14:15",
    closureNotes: "Effectiveness confirmed. All 24 belt loaders inspected, zero loose hardware found.",
    issuedBulletinId: "RMF-SB-2026-003",
    auditTrail: [
      {
        id: "AT-31-01",
        timestamp: "2026-09-10 18:40",
        actorName: "Hassan Ali",
        actorRole: "field_staff",
        action: "Report Submitted",
        newStatus: "submitted"
      },
      {
        id: "AT-31-02",
        timestamp: "2026-09-10 18:45",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Receipt Acknowledged",
        newStatus: "acknowledged"
      },
      {
        id: "AT-31-03",
        timestamp: "2026-09-11 09:00",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Level 2 Minor Assigned (60 Days)",
        details: "Target closure date: 2026-11-10.",
        newStatus: "level_assigned"
      },
      {
        id: "AT-31-04",
        timestamp: "2026-09-12 10:00",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Investigation Completed",
        newStatus: "plan_pending"
      },
      {
        id: "AT-31-05",
        timestamp: "2026-09-15 14:00",
        actorName: "Capt. Sherif Nour",
        actorRole: "hod_ops",
        action: "CAPA Plan Submitted",
        newStatus: "plan_under_review"
      },
      {
        id: "AT-31-06",
        timestamp: "2026-09-16 10:00",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Plan Approved by SQM",
        newStatus: "effectiveness_pending"
      },
      {
        id: "AT-31-07",
        timestamp: "2026-09-28 11:00",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Effectiveness Verified (Residual Risk 1E)",
        newStatus: "pending_signoff"
      },
      {
        id: "AT-31-08",
        timestamp: "2026-09-29 14:15",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Final Sign-off & Case Closure",
        details: "Digitally signed with cryptographic hash RMF-DSIG-9842F7B1-ICAO-SMS.",
        previousStatus: "pending_signoff",
        newStatus: "closed"
      }
    ],
    attachments: [
      {
        id: "ATT-31-01",
        fileName: "Debris_Fastener_Stand6.jpg",
        fileSize: "1.2 MB",
        fileType: "image/jpeg",
        uploadedBy: "Hassan Ali",
        uploadedRole: "Ramp Agent",
        uploadedAt: "2026-09-10 18:42",
        category: "initial_report"
      },
      {
        id: "ATT-31-02",
        fileName: "Turnaround_Sheet_FOD_Audit.pdf",
        fileSize: "620 KB",
        fileType: "application/pdf",
        uploadedBy: "Mahmoud Ezz",
        uploadedRole: "Safety Officer",
        uploadedAt: "2026-09-28 10:50",
        category: "effectiveness"
      }
    ]
  }
];

export const INITIAL_AUDIT_SCHEDULE: AuditScheduleItem[] = [
  {
    id: "AUD-SCH-2026-01",
    title: "IATA ISAGO Station Renewal Audit",
    titleAr: "مراجعة تجديد اعتماد إيزاجو الدولية (ISAGO)",
    auditType: "external",
    auditorOrganization: "IATA ISAGO Audit Team",
    leadAuditor: "Capt. Jean-Luc Moreau (IATA Senior Auditor)",
    auditTeam: ["Capt. Jean-Luc Moreau (IATA)", "Elena Rostova (Ground Operations Specialist)"],
    discipline: "ORM",
    department: "Quality & Safety / Operations",
    location: "Marsa Alam International Airport (RMF)",
    scheduledDate: "2026-11-15",
    endDate: "2026-11-18",
    quarter: "Q4",
    status: "planned",
    findingsCount: 1,
    scopeSummary: "Full corporate and station SMS recertification covering Organization & Management (ORM), Ramp (RMP), Load Control (LOD), and Baggage (BAG).",
    executiveSummary: "Scheduled comprehensive biennial ISAGO recertification for EMAAS Marsa Alam station.",
    checklistCriteria: ["ICAO Doc 9859 SMS", "IATA GOSM 14th Edition", "ECAA Part 139 Airside Regulations"]
  },
  {
    id: "AUD-SCH-2026-02",
    title: "Egyptian Civil Aviation Authority (ECAA) Ramp Safety Oversight",
    titleAr: "تفتيش السلامة والرقابة الميدانية لسلطة الطيران المدني المصري (ECAA)",
    auditType: "external",
    auditorOrganization: "Egyptian CAA Flight Safety Directorate",
    leadAuditor: "Eng. Moustafa Kamel (ECAA Senior Inspector)",
    auditTeam: ["Eng. Moustafa Kamel", "Capt. Tarek El-Kholy (Airside Safety Inspector)"],
    discipline: "RMP",
    department: "Operations - Ramp Services",
    location: "Airside Apron & Remote Stands 1-14",
    scheduledDate: "2026-10-22",
    endDate: "2026-10-24",
    quarter: "Q4",
    status: "in_progress",
    findingsCount: 1,
    scopeSummary: "ECAA Part 139 compliance: Airside driving regulations, GSE speed enforcement, pushback clearance zones, and FOD containment procedures.",
    executiveSummary: "Regulatory ramp safety oversight inspection focusing on winter charter flight surge preparedness.",
    checklistCriteria: ["ECAR Part 139 Subpart F", "ICAO Annex 14 Vol I", "IGOM Chapter 4 Aircraft Turnaround"]
  },
  {
    id: "AUD-SCH-2026-03",
    title: "Edelweiss Air Carrier Station Audit",
    titleAr: "مراجعة شركة إديلويس السويسرية لخدمات المحطة",
    auditType: "external",
    auditorOrganization: "Edelweiss Ground Operations Safety",
    leadAuditor: "Reto Schneider (Edelweiss Safety Lead)",
    auditTeam: ["Reto Schneider", "Sarah Baumann (Station Auditor)"],
    discipline: "PAX",
    department: "Passenger Handling & Ramp Services",
    location: "Terminal 1 & Stands 1 to 6",
    scheduledDate: "2026-09-18",
    endDate: "2026-09-20",
    quarter: "Q3",
    status: "completed",
    findingsCount: 2,
    scopeSummary: "Passenger handling, PRM assistance, jet bridge docking procedures, cargo hold securing, and gate boarding security compliance.",
    executiveSummary: "Satisfactory audit completed with two findings identified regarding aircraft chocking and baggage tag verification.",
    checklistCriteria: ["Edelweiss GOM Section 6", "IATA AHM 560", "ISAGO PAX 2.1"]
  },
  {
    id: "AUD-SCH-2026-04",
    title: "Quarterly Internal Ramp & GSE Safety Inspection Q3",
    titleAr: "التفتيش الداخلي الدوري على ساحة الطيران والمعدات - الربع الثالث",
    auditType: "internal",
    auditorOrganization: "EMAAS Safety & Quality Department",
    leadAuditor: "Mahmoud Ezz (Lead Auditor / Safety Officer)",
    auditTeam: ["Mahmoud Ezz", "Ahmed Hassan (GSE Inspector)"],
    discipline: "RMP",
    department: "Operations - Ramp Services",
    location: "Stands 1 to 14 & GSE Staging Areas",
    scheduledDate: "2026-08-20",
    endDate: "2026-08-22",
    quarter: "Q3",
    status: "completed",
    findingsCount: 2,
    scopeSummary: "Internal quality audit of stands 1 to 14, GSE fueling safety, pre-arrival inspection cards, and FOD containment.",
    executiveSummary: "Internal audit of ramp activities showed 92% conformance. Two corrective actions initiated.",
    checklistCriteria: ["EMAAS-SOP-RMP-04", "EMAAS-GSE-TAG-01", "Toolbox Talks Attendance Logs"]
  },
  {
    id: "AUD-SCH-2026-05",
    title: "EgyptAir Technical Ground Operations Audit",
    titleAr: "مراجعة مصر للطيران للعمليات الأرضية الفنية",
    auditType: "external",
    auditorOrganization: "EgyptAir Quality Assurance",
    leadAuditor: "Capt. Hany El-Sayed",
    auditTeam: ["Capt. Hany El-Sayed", "Eng. Amr Zaki"],
    discipline: "LOD",
    department: "Operations - Load Control",
    location: "Flight Dispatch & Baggage Make-up Area",
    scheduledDate: "2026-12-05",
    endDate: "2026-12-07",
    quarter: "Q4",
    status: "planned",
    findingsCount: 0,
    scopeSummary: "Customer carrier audit on aircraft weight & balance, loadsheet integrity, and ULD latching mechanisms.",
    executiveSummary: "Planned customer airline audit on load control and dangerous goods handling compliance.",
    checklistCriteria: ["EgyptAir GOM-8", "IATA DGR 65th Edition", "IATA AHM 510"]
  },
  {
    id: "AUD-SCH-2026-06",
    title: "Internal GSE Maintenance Workshop Conformance Audit",
    titleAr: "مراجعة داخلية على ورش صيانة معدات الخدمات الأرضية",
    auditType: "internal",
    auditorOrganization: "EMAAS Safety & Quality Department",
    leadAuditor: "Dr. Khaled Fawzy (SQM)",
    auditTeam: ["Dr. Khaled Fawzy", "Eng. Yasser Mostafa"],
    discipline: "ORM",
    department: "Maintenance - GSE Fleet",
    location: "GSE Maintenance Hangar North",
    scheduledDate: "2026-07-14",
    endDate: "2026-07-16",
    quarter: "Q3",
    status: "completed",
    findingsCount: 1,
    scopeSummary: "Preventive maintenance scheduling compliance, hazardous fluid storage, torque wrench calibrations, and battery charging safety.",
    executiveSummary: "Workshop audit successfully executed with one observation raised regarding battery charging bay eye-wash inspection.",
    checklistCriteria: ["EMAAS-MNT-SOP-01", "OSHA 1910 Standards", "ISAGO ORM 3.4"]
  }
];

export const INITIAL_FINDINGS: AuditFinding[] = [
  // Finding 1: Closed & Digitally Signed (from Edelweiss Audit)
  {
    id: "RMF-AUD-2026-001",
    auditId: "AUD-SCH-2026-03",
    auditTitle: "Edelweiss Air Carrier Station Audit",
    auditType: "external",
    externalAuditorOrg: "Edelweiss Ground Operations Safety",
    isagoDiscipline: "RMP",
    standardReference: "IGOM 4.1.2 Aircraft Chocking Protocols",
    severityLevel: "Level 2",
    title: "Substandard Wooden Chocks on Stand 4",
    description: "Observed two wooden wheel chocks with rope rot positioned on Stand 4 main landing gear instead of standard polyurethane yellow chocks.",
    department: "Operations - Ramp Services",
    assignedDepartment: "Operations - Ramp Services",
    location: "Stand 4 Main Landing Gear",
    raisedDate: "2026-09-18",
    targetClosureDate: "2026-11-17",
    lifecycleStatus: "closed",
    lifecycleStage: "closed_verified",
    
    // Step 2
    acknowledgedBy: "Mahmoud Ezz (Safety Officer)",
    acknowledgedAt: "2026-09-19 09:15",

    // Step 3 (SQM Level Assignment)
    level: "level_2",
    levelAssignedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
    levelAssignedAt: "2026-09-19 11:30",
    levelComments: "Minor non-conformance (Level 2). Mandated closure within 60 calendar days.",

    // Step 4 (Investigation)
    safetyOfficerAssigned: "Mahmoud Ezz",
    investigationSummary: "Ramp agents utilized unapproved spare wooden chocks from old ramp storage lockers while polyurethane chocks were undergoing customs clearance.",
    existingProcedures: [
      "EMAAS-SOP-RMP-02: Turnaround Equipment Inspection",
      "IGOM 4.1.2: Aircraft Chocking Minimum Standards"
    ],
    currentMitigations: "Temporarily inspected all stands and removed 14 unapproved wooden chocks.",
    preMitigationRisk: {
      severity: 3,
      likelihood: "B",
      scoreCode: "3B",
      level: "High",
      notes: "Rotten rope or cracked chock could shift under high wind or jet blast."
    },
    assignedHoD: "Capt. Sherif Nour (Head of Operations)",
    assignedHoDRole: "hod_ops",
    capaPlanDueDate: "2026-09-25",

    // Step 5 (CAPA Plan)
    rcaType: "simple",
    simpleRca: {
      directCause: "Ramp agents utilized unapproved spare wooden chocks from old GSE store.",
      contributingFactor: "New polyurethane chocks shipment was delayed at Port Safaga customs.",
      systemicGap: "Decommissioned GSE inventory was not tagged, isolated or disposed from ramp lockers."
    },
    capa: {
      correctiveAction: "Decommission and destroy all 14 wooden chocks from ramp lockers; deploy 48 new yellow polyurethane chocks.",
      preventiveAction: "Incorporate daily chock inspection into Pre-Flight Turnaround Card #2; publish station Operational Notice ION-2026-008.",
      assignedDepartment: "Operations - Ramp Services",
      assignedManager: "Capt. Sherif Nour",
      targetDate: "2026-09-25",
      submittedAt: "2026-09-20 14:00",
      status: "verified"
    },
    capaProposal: {
      correctiveAction: "Decommission and destroy all 14 wooden chocks; deploy 48 new polyurethane chocks.",
      preventiveAction: "Incorporate daily chock inspection into Pre-Flight Turnaround Card #2; publish ION-2026-008.",
      targetDate: "2026-09-25",
      proposedAt: "2026-09-20 14:00"
    },

    // Step 6 (Plan Review)
    sqmPlanReviewDecision: "approve",
    sqmPlanReviewComments: "Approved. Satisfies IGOM 4.1.2 requirements. Photographic evidence of destroyed chocks required.",
    sqmPlanReviewedAt: "2026-09-21 09:30",
    sqmPlanReviewedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
    sqmApproval: {
      approvedBy: "Dr. Khaled Fawzy",
      approvedAt: "2026-09-21 09:30",
      comments: "Approved. Satisfies IGOM 4.1.2 requirements."
    },

    // Step 7 (Effectiveness & Residual Risk)
    effectivenessEvaluation: {
      evaluatedBy: "Mahmoud Ezz (Safety Officer)",
      evaluatedAt: "2026-09-27 15:00",
      isEffective: true,
      evaluationNotes: "Conducted physical audit across all stands 1 to 14. 100% compliance with new yellow polyurethane chocks. Zero wooden chocks present on airside.",
      evidenceSummary: "Disposal certificate and photo log archived under DISPOSAL-REC-2026-042."
    },
    residualRisk: {
      severity: 1,
      likelihood: "E",
      scoreCode: "1E",
      level: "Low"
    },
    postMitigationRisk: {
      severity: 1,
      likelihood: "E",
      scoreCode: "1E",
      level: "Low"
    },
    implementationEvidence: {
      evidenceNotes: "All 48 polyurethane chocks distributed. Photo evidence submitted. ION-008 issued.",
      documentRef: "DISPOSAL-REC-2026-042",
      submittedAt: "2026-09-24 16:00"
    },

    // Step 8 (Final Sign-off)
    finalSignoff: {
      signedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
      signedAt: "2026-09-28 11:20",
      comments: "CAPA verification successful. Satisfies Edelweiss safety auditor. Case closed.",
      signatureHash: "RMF-DSIG-AUD-001-EDELWEISS-OK"
    },
    closedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
    closedAt: "2026-09-28 11:20",
    closureNotes: "Case closed with complete evidence dossier.",
    issuedNoticeId: "RMF-ION-2026-008",

    auditTrail: [
      {
        id: "AT-FIND-01-01",
        timestamp: "2026-09-18 16:30",
        actorName: "Reto Schneider (Edelweiss Safety Lead)",
        actorRole: "external_auditor",
        action: "Audit Finding Logged",
        details: "Finding recorded during Edelweiss Carrier Station Audit.",
        newStatus: "submitted"
      },
      {
        id: "AT-FIND-01-02",
        timestamp: "2026-09-19 09:15",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Finding Acknowledged",
        newStatus: "acknowledged"
      },
      {
        id: "AT-FIND-01-03",
        timestamp: "2026-09-19 11:30",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Level 2 (Minor - 60 Days) Assigned",
        details: "Target closure date set to 2026-11-17.",
        newStatus: "level_assigned"
      },
      {
        id: "AT-FIND-01-04",
        timestamp: "2026-09-19 14:00",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Investigation & Risk Assessment Completed",
        details: "Initial Risk 3B (High). Assigned to Capt. Sherif Nour.",
        newStatus: "plan_pending"
      },
      {
        id: "AT-FIND-01-05",
        timestamp: "2026-09-20 14:00",
        actorName: "Capt. Sherif Nour",
        actorRole: "hod_ops",
        action: "CAPA Plan Submitted by HoD",
        newStatus: "plan_under_review"
      },
      {
        id: "AT-FIND-01-06",
        timestamp: "2026-09-21 09:30",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "CAPA Plan Approved by SQM",
        newStatus: "effectiveness_pending"
      },
      {
        id: "AT-FIND-01-07",
        timestamp: "2026-09-27 15:00",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Effectiveness Verified (Residual Risk 1E Low)",
        newStatus: "pending_signoff"
      },
      {
        id: "AT-FIND-01-08",
        timestamp: "2026-09-28 11:20",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Final Sign-off & Finding Closed",
        details: "Digital Signature Hash: RMF-DSIG-AUD-001-EDELWEISS-OK",
        newStatus: "closed"
      }
    ],
    attachments: [
      {
        id: "ATT-F1-01",
        fileName: "Defective_Wooden_Chocks_Stand4.jpg",
        fileSize: "1.4 MB",
        fileType: "image/jpeg",
        uploadedBy: "Reto Schneider",
        uploadedRole: "External Auditor",
        uploadedAt: "2026-09-18 16:32",
        category: "initial_report"
      },
      {
        id: "ATT-F1-02",
        fileName: "Disposal_Receipt_Wooden_Chocks.pdf",
        fileSize: "520 KB",
        fileType: "application/pdf",
        uploadedBy: "Capt. Sherif Nour",
        uploadedRole: "Head of Operations",
        uploadedAt: "2026-09-24 15:45",
        category: "capa_plan"
      }
    ]
  },

  // Finding 2: CAPA Plan Under Review by SQM (from Internal Ramp Audit Q3)
  {
    id: "RMF-AUD-2026-002",
    auditId: "AUD-SCH-2026-04",
    auditTitle: "Quarterly Internal Ramp & GSE Safety Inspection Q3",
    auditType: "internal",
    externalAuditorOrg: "EMAAS Safety & Quality Department",
    isagoDiscipline: "RMP",
    standardReference: "ISAGO RMP 3.2.1 Aircraft Fueling Safety Distances",
    severityLevel: "Level 2",
    title: "GSE Parked Inside Refueling Safety Zone",
    description: "During turnaround of flight MS-340 on Stand 6, a baggage tug and two container dollies were positioned within 3 meters of the aircraft fuel vent.",
    department: "Operations - Ramp Services",
    assignedDepartment: "Operations - Ramp Services",
    location: "Stand 6 Airside",
    raisedDate: "2026-08-21",
    targetClosureDate: "2026-10-20",
    lifecycleStatus: "plan_under_review",
    lifecycleStage: "capa_proposed",

    acknowledgedBy: "Mahmoud Ezz (Safety Officer)",
    acknowledgedAt: "2026-08-21 10:00",

    level: "level_2",
    levelAssignedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
    levelAssignedAt: "2026-08-21 14:00",
    levelComments: "Minor Non-Conformity (Level 2). 60 days mandated target closure.",

    safetyOfficerAssigned: "Mahmoud Ezz",
    investigationSummary: "Driver was rushed due to short ground time and parked dollies outside designated staging lines. Ramp markings on Stand 6 were faded.",
    existingProcedures: [
      "EMAAS-SOP-RMP-06: Aircraft Fueling Separation Distances",
      "IATA IGOM 4.2: Clear Zone Maintenance"
    ],
    currentMitigations: "Driver verbally briefed; supervisor reinforced 3-meter zone at shift change.",
    preMitigationRisk: {
      severity: 4,
      likelihood: "C",
      scoreCode: "4C",
      level: "High",
      notes: "Ignition risk in the event of fuel vent spill."
    },
    assignedHoD: "Capt. Sherif Nour (Head of Operations)",
    assignedHoDRole: "hod_ops",
    capaPlanDueDate: "2026-09-02",

    rcaType: "five_whys",
    fiveWhysRca: [
      "Tug and dollies parked within 3m of fuel vent.",
      "Driver did not recognize boundaries due to worn apron paint.",
      "Stand 6 red exclusion box markings had not been repainted following summer heat.",
      "Apron line maintenance request was pending Airport Authority approval.",
      "No interim portable cones were deployed by the turnaround supervisor."
    ],
    capa: {
      correctiveAction: "Deploy high-visibility safety boundary cones around fuel vents for all Stand 6 turnarounds immediately.",
      preventiveAction: "Re-paint fuel vent exclusion boxes on Stands 1 to 14 with high-friction reflective epoxy; mandate pre-shift FOD & Line check.",
      assignedDepartment: "Operations - Ramp Services",
      assignedManager: "Capt. Sherif Nour",
      targetDate: "2026-09-05",
      submittedAt: "2026-08-29 11:30",
      status: "submitted"
    },

    auditTrail: [
      {
        id: "AT-FIND-02-01",
        timestamp: "2026-08-21 09:30",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Finding Raised in Internal Ramp Audit",
        newStatus: "submitted"
      },
      {
        id: "AT-FIND-02-02",
        timestamp: "2026-08-21 10:00",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Receipt Acknowledged",
        newStatus: "acknowledged"
      },
      {
        id: "AT-FIND-02-03",
        timestamp: "2026-08-21 14:00",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Level 2 (Minor - 60d) Assigned by SQM",
        newStatus: "level_assigned"
      },
      {
        id: "AT-FIND-02-04",
        timestamp: "2026-08-22 10:30",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Investigation & Risk Assessment Completed (4C High)",
        newStatus: "plan_pending"
      },
      {
        id: "AT-FIND-02-05",
        timestamp: "2026-08-29 11:30",
        actorName: "Capt. Sherif Nour",
        actorRole: "hod_ops",
        action: "CAPA Plan Submitted (Awaiting SQM Approval)",
        newStatus: "plan_under_review"
      }
    ],
    attachments: [
      {
        id: "ATT-F2-01",
        fileName: "Fuel_Vent_Proximity_Stand6.jpg",
        fileSize: "2.1 MB",
        fileType: "image/jpeg",
        uploadedBy: "Mahmoud Ezz",
        uploadedRole: "Lead Auditor",
        uploadedAt: "2026-08-21 09:40",
        category: "initial_report"
      }
    ]
  },

  // Finding 3: Major Level 1 - Plan Pending (from ECAA Ramp Inspection)
  {
    id: "RMF-AUD-2026-003",
    auditId: "AUD-SCH-2026-02",
    auditTitle: "Egyptian Civil Aviation Authority (ECAA) Ramp Safety Oversight",
    auditType: "external",
    externalAuditorOrg: "Egyptian CAA Flight Safety Directorate",
    isagoDiscipline: "RMP",
    standardReference: "ECAR 139.329 Airside Vehicle Operator Permit (AVOP)",
    severityLevel: "Level 1",
    title: "GSE Driver Operating Without Endorsed AVOP License",
    description: "ECAA Inspector observed belt loader operator on Stand 10 without current station AVOP driving permit badge on person. Permit was expired by 12 days.",
    department: "Operations - Ramp Services",
    assignedDepartment: "Operations - Ramp Services",
    location: "Stand 10 Baggage Belt Area",
    raisedDate: "2026-10-10",
    targetClosureDate: "2026-11-09",
    lifecycleStatus: "plan_pending",
    lifecycleStage: "acknowledged",

    acknowledgedBy: "Mahmoud Ezz (Safety Officer)",
    acknowledgedAt: "2026-10-10 11:00",

    level: "level_1",
    levelAssignedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
    levelAssignedAt: "2026-10-10 14:00",
    levelComments: "Major Non-Conformity (Level 1 - Critical Authority Finding). Must be closed within 30 days.",

    safetyOfficerAssigned: "Mahmoud Ezz",
    investigationSummary: "Driver missed annual medical renewal due to rotation schedule. Shift supervisor did not perform daily pre-operation badge check.",
    existingProcedures: [
      "EMAAS-SOP-HR-03: Airside Driving Licensing & Renewals",
      "ECAR Part 139: Airport Airside Driving Authority Mandates"
    ],
    currentMitigations: "Operator grounded from airside driving until medical exam and AVOP renewal are validated.",
    preMitigationRisk: {
      severity: 4,
      likelihood: "B",
      scoreCode: "4B",
      level: "Critical",
      notes: "Legal breach risking airport operating license suspension by CAA."
    },
    assignedHoD: "Capt. Sherif Nour (Head of Operations)",
    assignedHoDRole: "hod_ops",
    capaPlanDueDate: "2026-10-20",

    auditTrail: [
      {
        id: "AT-FIND-03-01",
        timestamp: "2026-10-10 10:15",
        actorName: "Eng. Moustafa Kamel (ECAA Inspector)",
        actorRole: "external_auditor",
        action: "ECAA Ramp Finding Logged",
        newStatus: "submitted"
      },
      {
        id: "AT-FIND-03-02",
        timestamp: "2026-10-10 11:00",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Finding Receipt Acknowledged",
        newStatus: "acknowledged"
      },
      {
        id: "AT-FIND-03-03",
        timestamp: "2026-10-10 14:00",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Level 1 Major Assigned (30 Days Mandated)",
        details: "Target closure date: 2026-11-09. ECAA oversight priority.",
        newStatus: "level_assigned"
      },
      {
        id: "AT-FIND-03-04",
        timestamp: "2026-10-11 09:30",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Investigation & Mitigations Recorded",
        details: "Risk 4B Critical. Assigned to HoD Operations.",
        newStatus: "plan_pending"
      }
    ],
    attachments: [
      {
        id: "ATT-F3-01",
        fileName: "ECAA_Official_Inspection_Notice_2026.pdf",
        fileSize: "840 KB",
        fileType: "application/pdf",
        uploadedBy: "Eng. Moustafa Kamel",
        uploadedRole: "ECAA Inspector",
        uploadedAt: "2026-10-10 10:20",
        category: "initial_report"
      }
    ]
  },

  // Finding 4: Observation Level 3 - Submitted & Pending Level (from ISAGO Audit)
  {
    id: "RMF-AUD-2026-004",
    auditId: "AUD-SCH-2026-01",
    auditTitle: "IATA ISAGO Station Renewal Audit",
    auditType: "external",
    externalAuditorOrg: "IATA ISAGO Audit Team",
    isagoDiscipline: "ORM",
    standardReference: "ISAGO ORM 1.6 Document Control & Versioning",
    severityLevel: "Level 3",
    title: "Obsolete Revision of Emergency Response Manual in Ramp Office",
    description: "Auditor noted a printed hard copy of the Station Emergency Response Plan (ERP) Rev 3 on the ramp supervisor desk, whereas digital portal was updated to Rev 5.",
    department: "Quality & Safety",
    assignedDepartment: "Quality & Safety",
    location: "Ramp Supervisors Office",
    raisedDate: "2026-10-14",
    lifecycleStatus: "submitted",
    lifecycleStage: "raised",

    auditTrail: [
      {
        id: "AT-FIND-04-01",
        timestamp: "2026-10-14 11:00",
        actorName: "Capt. Jean-Luc Moreau (IATA)",
        actorRole: "external_auditor",
        action: "Finding Raised during ISAGO Document Review",
        newStatus: "submitted"
      }
    ],
    attachments: []
  },

  // Finding 5: Plan Returned for Revision (from Internal Ramp Audit)
  {
    id: "RMF-AUD-2026-005",
    auditId: "AUD-SCH-2026-04",
    auditTitle: "Quarterly Internal Ramp & GSE Safety Inspection Q3",
    auditType: "internal",
    externalAuditorOrg: "EMAAS Safety & Quality Department",
    isagoDiscipline: "LOD",
    standardReference: "IATA DGR Section 9.3 Cargo Hold Loading Restrictions",
    severityLevel: "Level 2",
    title: "Incomplete Tie-Down Straps for Dry Ice Consignment",
    description: "During bulk compartment loading on flight EDW-214, two packages of Class 9 dry ice were restrained with only a single net strand rather than 4-point tie-downs.",
    department: "Operations - Ramp Services",
    assignedDepartment: "Operations - Ramp Services",
    location: "Aft Hold #4 Stand 2",
    raisedDate: "2026-08-22",
    targetClosureDate: "2026-10-21",
    lifecycleStatus: "plan_returned",
    lifecycleStage: "capa_proposed",

    acknowledgedBy: "Mahmoud Ezz (Safety Officer)",
    acknowledgedAt: "2026-08-22 11:30",

    level: "level_2",
    levelAssignedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
    levelAssignedAt: "2026-08-22 15:00",
    levelComments: "Minor Non-Conformity (Level 2). 60 days target closure.",

    safetyOfficerAssigned: "Mahmoud Ezz",
    investigationSummary: "Ramp agents did not have access to dedicated cargo tie-down strap bin on Stand 2. Bins were only located near Stand 8.",
    existingProcedures: ["EMAAS-SOP-LOD-04: Special Cargo Hold Tie-down"],
    currentMitigations: "Straps fetched from Stand 8 and cargo secured before departure.",
    preMitigationRisk: {
      severity: 3,
      likelihood: "C",
      scoreCode: "3C",
      level: "Medium"
    },
    assignedHoD: "Capt. Sherif Nour (Head of Operations)",
    assignedHoDRole: "hod_ops",
    capaPlanDueDate: "2026-09-01",

    rcaType: "simple",
    simpleRca: {
      directCause: "Tie-down straps were not stocked at Stand 2.",
      contributingFactor: "Equipment locker inventory was depleted.",
      systemicGap: "No daily stock check for airside cargo securing hardware."
    },
    capa: {
      correctiveAction: "Stock 10 tie-down straps in Stand 2 locker.",
      preventiveAction: "Inform team via email.",
      assignedDepartment: "Operations - Ramp Services",
      assignedManager: "Capt. Sherif Nour",
      targetDate: "2026-09-02",
      submittedAt: "2026-08-30 10:00",
      status: "returned"
    },

    sqmPlanReviewDecision: "return",
    sqmPlanReviewComments: "CAPA plan is insufficient. An email does not prevent recurrence under ICAO SMS. HoD must introduce a formal daily equipment log on Turnaround Dispatch Cards and provide a verified training bulletin.",
    sqmPlanReviewedAt: "2026-08-31 09:00",
    sqmPlanReviewedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",

    auditTrail: [
      {
        id: "AT-FIND-05-01",
        timestamp: "2026-08-22 10:00",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Finding Raised",
        newStatus: "submitted"
      },
      {
        id: "AT-FIND-05-02",
        timestamp: "2026-08-22 11:30",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Finding Acknowledged",
        newStatus: "acknowledged"
      },
      {
        id: "AT-FIND-05-03",
        timestamp: "2026-08-22 15:00",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Level 2 Assigned (60d)",
        newStatus: "level_assigned"
      },
      {
        id: "AT-FIND-05-04",
        timestamp: "2026-08-23 10:00",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Investigation Completed",
        newStatus: "plan_pending"
      },
      {
        id: "AT-FIND-05-05",
        timestamp: "2026-08-30 10:00",
        actorName: "Capt. Sherif Nour",
        actorRole: "hod_ops",
        action: "CAPA Plan Submitted",
        newStatus: "plan_under_review"
      },
      {
        id: "AT-FIND-05-06",
        timestamp: "2026-08-31 09:00",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Plan Returned for Revision",
        details: "Comments: Email is insufficient; formal daily inspection log required.",
        newStatus: "plan_returned"
      }
    ],
    attachments: []
  },

  // Finding 6: Pending Final SQM Sign-off (from GSE Workshop Audit)
  {
    id: "RMF-AUD-2026-006",
    auditId: "AUD-SCH-2026-06",
    auditTitle: "Internal GSE Maintenance Workshop Conformance Audit",
    auditType: "internal",
    externalAuditorOrg: "EMAAS Safety & Quality Department",
    isagoDiscipline: "ORM",
    standardReference: "OSHA 1910.151 Emergency Eyewash Station Inspection",
    severityLevel: "Level 3",
    title: "Battery Charging Bay Eyewash Station Inspection Overdue",
    description: "The emergency eyewash station in the electric GSE battery charging room had not undergone documented weekly flush test for 4 consecutive weeks.",
    department: "Maintenance - GSE Fleet",
    assignedDepartment: "Maintenance - GSE Fleet",
    location: "GSE Maintenance Hangar Battery Bay",
    raisedDate: "2026-07-15",
    targetClosureDate: "2026-10-13",
    lifecycleStatus: "pending_signoff",
    lifecycleStage: "implemented",

    acknowledgedBy: "Mahmoud Ezz (Safety Officer)",
    acknowledgedAt: "2026-07-15 11:00",

    level: "level_3",
    levelAssignedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
    levelAssignedAt: "2026-07-15 14:00",
    levelComments: "Observation (Level 3). 90 days target closure.",

    safetyOfficerAssigned: "Mahmoud Ezz",
    investigationSummary: "Workshop technician responsible for eyewash tests was transferred; handover checklist omitted the eyewash weekly flush log.",
    existingProcedures: ["EMAAS-SOP-MNT-09: Chemical & Acid Safety Controls"],
    currentMitigations: "Eyewash station immediately flushed and verified operational.",
    preMitigationRisk: {
      severity: 3,
      likelihood: "D",
      scoreCode: "3D",
      level: "Medium"
    },
    assignedHoD: "Eng. Yasser Mostafa (Head of Maintenance)",
    assignedHoDRole: "hod_maint",
    capaPlanDueDate: "2026-07-28",

    rcaType: "simple",
    simpleRca: {
      directCause: "Technician responsible left workshop without handover checklist.",
      contributingFactor: "Maintenance management software did not include non-equipment facility tasks.",
      systemicGap: "Facility EHS checklists were not digitized."
    },
    capa: {
      correctiveAction: "Assign dedicated technician; install physical tamper-evident inspection tag on eyewash unit.",
      preventiveAction: "Integrate facility safety inspections into weekly digital CMMS preventive maintenance schedule.",
      assignedDepartment: "Maintenance - GSE Fleet",
      assignedManager: "Eng. Yasser Mostafa",
      targetDate: "2026-08-05",
      submittedAt: "2026-07-24 12:00",
      status: "approved"
    },

    sqmPlanReviewDecision: "approve",
    sqmPlanReviewComments: "Approved. Good integration into CMMS.",
    sqmPlanReviewedAt: "2026-07-25 10:00",
    sqmPlanReviewedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",

    effectivenessEvaluation: {
      evaluatedBy: "Mahmoud Ezz (Safety Officer)",
      evaluatedAt: "2026-09-10 14:30",
      isEffective: true,
      evaluationNotes: "Audited 8 consecutive weekly digital CMMS logs. 100% execution of eyewash flush tests with physical tags signed.",
      evidenceSummary: "CMMS automated log extract and photo of tagged eyewash unit attached."
    },
    residualRisk: {
      severity: 1,
      likelihood: "E",
      scoreCode: "1E",
      level: "Low"
    },
    postMitigationRisk: {
      severity: 1,
      likelihood: "E",
      scoreCode: "1E",
      level: "Low"
    },

    auditTrail: [
      {
        id: "AT-FIND-06-01",
        timestamp: "2026-07-15 10:00",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Observation Raised in Workshop Audit",
        newStatus: "submitted"
      },
      {
        id: "AT-FIND-06-02",
        timestamp: "2026-07-15 11:00",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Acknowledged",
        newStatus: "acknowledged"
      },
      {
        id: "AT-FIND-06-03",
        timestamp: "2026-07-15 14:00",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Level 3 Observation Assigned (90d)",
        newStatus: "level_assigned"
      },
      {
        id: "AT-FIND-06-04",
        timestamp: "2026-07-16 09:30",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Investigation Completed",
        newStatus: "plan_pending"
      },
      {
        id: "AT-FIND-06-05",
        timestamp: "2026-07-24 12:00",
        actorName: "Eng. Yasser Mostafa",
        actorRole: "hod_maint",
        action: "CAPA Plan Submitted",
        newStatus: "plan_under_review"
      },
      {
        id: "AT-FIND-06-06",
        timestamp: "2026-07-25 10:00",
        actorName: "Dr. Khaled Fawzy",
        actorRole: "hod_safety",
        action: "Plan Approved by SQM",
        newStatus: "effectiveness_pending"
      },
      {
        id: "AT-FIND-06-07",
        timestamp: "2026-09-10 14:30",
        actorName: "Mahmoud Ezz",
        actorRole: "safety_officer",
        action: "Effectiveness Verified (Residual Risk 1E Low)",
        newStatus: "pending_signoff"
      }
    ],
    attachments: [
      {
        id: "ATT-F6-01",
        fileName: "CMMS_Eyewash_Inspection_Audit_Report.pdf",
        fileSize: "780 KB",
        fileType: "application/pdf",
        uploadedBy: "Mahmoud Ezz",
        uploadedRole: "Safety Officer",
        uploadedAt: "2026-09-10 14:35",
        category: "effectiveness"
      }
    ]
  }
];

export const INITIAL_SPIS: SPIItem[] = [
  // ==================== LAGGING INDICATORS (ACTUAL SAFETY OUTCOMES) ====================
  {
    id: "SPI-LAG-01",
    code: "SPI-LAG-01",
    type: "lagging",
    category: "Aircraft Ground Damage",
    name: "Aircraft Ground-Damage Rate per 1,000 Turns",
    nameAr: "معدل حوادث تلف الطائرات بساحة الطيران لكل ١٠٠٠ حركة",
    description: "Total ground handling aircraft damage events (fuselage, engine cowlings, cargo doors, antennas) during turnaround movements.",
    unit: "per 1,000 turns",
    measurementFormula: "(Total Ground Damage Events / Total Station Aircraft Turns) * 1,000",
    applicableFramework: "ICAO Annex 19 Amdt 2 (Nov 2026) / ECAA / IATA ISAGO RMP-2.3",
    ownerDepartment: "Operations - Ramp Services",
    baseline: 0.25,
    baselinePeriod: "2026 Baseline",
    targetSPT: 0.20,
    sptDescription: "Reduce aircraft ground damage rate by 20% against the 2026 baseline through strict marshaling stop-bars and wing-tip clearance zones.",
    sptDescriptionAr: "خفض معدل تلف الطائرات بنسبة ٢٠٪ مقارنة بخط أساس عام ٢٠٢٦ من خلال تفعيل مناطق الأمان ومسارات الإرشاد الدقيقة.",
    sptDeadline: "December 2027",
    alertThreshold: 0.30,
    targetDirection: "lower_is_better",
    currentValue: 0.16,
    trend: "improving",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01",
    historicalReadings: [
      { date: "2026-07-01", period: "Jul 2026", value: 0.24, turnsCount: 1250, notes: "Baseline period" },
      { date: "2026-08-01", period: "Aug 2026", value: 0.21, turnsCount: 1420, notes: "Wing walker deployment reinforced" },
      { date: "2026-09-01", period: "Sep 2026", value: 0.18, turnsCount: 1380, notes: "Zero contact incidents recorded" },
      { date: "2026-10-01", period: "Oct 2026", value: 0.16, turnsCount: 1410, notes: "Within target SPT" }
    ]
  },
  {
    id: "SPI-LAG-02",
    code: "SPI-LAG-02",
    type: "lagging",
    category: "GSE Airside Operation",
    name: "GSE-to-Aircraft Contact Events per 1,000 Turns",
    nameAr: "معدل ملامسة معدات المهبط للطائرات لكل ١٠٠٠ حركة",
    description: "Contact occurrences between motorized/non-motorized Ground Support Equipment (tugs, belt loaders, GPU, stairs) and aircraft body.",
    unit: "per 1,000 turns",
    measurementFormula: "(GSE-to-Aircraft Contact Events / Total Aircraft Turns) * 1,000",
    applicableFramework: "IATA ISAGO AGM-3 / IGOM 4.2 / ECAA Safety Oversight",
    ownerDepartment: "Operations - Ramp Services",
    baseline: 0.12,
    baselinePeriod: "2026 Baseline",
    targetSPT: 0.00,
    sptDescription: "Zero serious contact events; continuous reduction in low-speed proximity events with mandatory 5-meter and 0.5-meter brake tests.",
    sptDescriptionAr: "صفر حوادث تلامس خطيرة؛ وتقليل كافة أحداث الاقتراب مع الإلزام الصارم باختبارات الفرامل على بُعد ٥ أمتار ونصف متر.",
    sptDeadline: "Annual 2026/2027",
    alertThreshold: 0.08,
    targetDirection: "lower_is_better",
    currentValue: 0.00,
    trend: "improving",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01",
    historicalReadings: [
      { date: "2026-07-01", period: "Jul 2026", value: 0.08, turnsCount: 1250, notes: "Belt loader bumper scrape on Stand 4" },
      { date: "2026-08-01", period: "Aug 2026", value: 0.00, turnsCount: 1420, notes: "Zero contact incidents" },
      { date: "2026-09-01", period: "Sep 2026", value: 0.00, turnsCount: 1380, notes: "Zero contact incidents" },
      { date: "2026-10-01", period: "Oct 2026", value: 0.00, turnsCount: 1410, notes: "Target SPT sustained" }
    ]
  },
  {
    id: "SPI-LAG-03",
    code: "SPI-LAG-03",
    type: "lagging",
    category: "Occupational Health & Safety (OHS)",
    name: "Employee Lost-Time Injury Frequency Rate (LTIFR)",
    nameAr: "معدل تكرار إصابات العمل المعطلة لكل ١٠٠ ألف ساعة عمل",
    description: "Number of lost-time workplace injuries (resulting in at least one lost shift) per 100,000 productive staff work-hours.",
    unit: "per 100,000 hrs",
    measurementFormula: "(Lost Time Workplace Injuries * 100,000) / Total Employee Exposure Hours",
    applicableFramework: "ICAO Doc 9859 Chapter 4 / Egyptian Labor Law & ECAA",
    ownerDepartment: "Safety & Quality / Station HR",
    baseline: 1.48,
    baselinePeriod: "2026 Baseline",
    targetSPT: 1.25,
    sptDescription: "Reduce lost-time injury rate by 15% against baseline through ergonomic baggage-handling coaching and mandatory airside PPE enforcement.",
    sptDescriptionAr: "خفض معدل إصابات العمل المعطلة بنسبة ١٥٪ عن خط الأساس عبر التدريب على المناولة المريحة وإلزامية مهمات الوقاية الشخصية.",
    sptDeadline: "December 2027",
    alertThreshold: 1.60,
    targetDirection: "lower_is_better",
    currentValue: 1.15,
    trend: "improving",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01",
    historicalReadings: [
      { date: "2026-07-01", period: "Jul 2026", value: 1.52, notes: "Two lower-back strains reported during heavy charter surge" },
      { date: "2026-08-01", period: "Aug 2026", value: 1.30, notes: "Ergonomics coach deployed to sorting carousels" },
      { date: "2026-09-01", period: "Sep 2026", value: 1.18, notes: "Improvement sustained across shifts" },
      { date: "2026-10-01", period: "Oct 2026", value: 1.15, notes: "Within target SPT" }
    ]
  },
  {
    id: "SPI-LAG-04",
    code: "SPI-LAG-04",
    type: "lagging",
    category: "Load Control & Weight and Balance",
    name: "Aircraft Loading Errors with Safety Implications",
    nameAr: "أخطاء تحميل الطائرات ذات التأثير على السلامة لكل ١٠٠٠ حركة",
    description: "Deviations between Load Instruction Report (LIR) and actual physical hold loading, trim/CG discrepancies, or unmanifested cargo.",
    unit: "per 1,000 turns",
    measurementFormula: "(Loading Safety Discrepancies / Total Departure Turns) * 1,000",
    applicableFramework: "IATA ISAGO LOD-2 / ECAA Weight & Balance Standards",
    ownerDepartment: "Operations - Passenger & Cargo Load Control",
    baseline: 0.30,
    baselinePeriod: "2026 Baseline",
    targetSPT: 0.24,
    sptDescription: "Reduce loading safety discrepancies by 20% against baseline via dual-check hold barcode scanning and DCS automated CG cross-verification.",
    sptDescriptionAr: "خفض أخطاء التحميل بنسبة ٢٠٪ مقارنة بخط الأساس عبر التحقق الثنائي من الباركود والمطابقة الآلية مع نظام مراقبة الحمولة.",
    sptDeadline: "December 2027",
    alertThreshold: 0.35,
    targetDirection: "lower_is_better",
    currentValue: 0.19,
    trend: "improving",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01",
    historicalReadings: [
      { date: "2026-07-01", period: "Jul 2026", value: 0.32, turnsCount: 1250, notes: "Hold 4 piece count mismatch caught before pushback" },
      { date: "2026-08-01", period: "Aug 2026", value: 0.25, turnsCount: 1420, notes: "Ramp Team Leader double-signature instituted" },
      { date: "2026-09-01", period: "Sep 2026", value: 0.20, turnsCount: 1380, notes: "Systematic scanning adherence" },
      { date: "2026-10-01", period: "Oct 2026", value: 0.19, turnsCount: 1410, notes: "Below target limit" }
    ]
  },
  {
    id: "SPI-LAG-05",
    code: "SPI-LAG-05",
    type: "lagging",
    category: "Cargo & ULD Restraint",
    name: "Unsafe Loading or Load-Securing Events",
    nameAr: "أحداث عدم إحكام تثبيت الحمولة أو الشحن غير الآمن",
    description: "Incidents of missing cargo net locks, damaged ULD latches, unrestrained bulk baggage, or hazardous cargo not properly secured in compartments.",
    unit: "events / month",
    measurementFormula: "Absolute count of validated unsafe cargo hold restraint occurrences",
    applicableFramework: "IATA IGOM 4.5 / ISAGO LOD-3 / ECAA Airworthiness Directives",
    ownerDepartment: "Operations - Ramp Services",
    baseline: 2.0,
    baselinePeriod: "2026 Baseline",
    targetSPT: 0.0,
    sptDescription: "Zero high-risk load-securing events; rapid reduction and elimination of compartment net locking non-conformances.",
    sptDescriptionAr: "صفر أحداث تثبيت عالية المخاطر؛ والقضاء الكامل على حالات عدم إغلاق شبكات تثبيت العفش بمقصورات الطائرة.",
    sptDeadline: "Annual 2026/2027",
    alertThreshold: 1.0,
    targetDirection: "lower_is_better",
    currentValue: 0.0,
    trend: "improving",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01",
    historicalReadings: [
      { date: "2026-07-01", period: "Jul 2026", value: 2.0, notes: "Two hold net latches unfastened on charter aircraft" },
      { date: "2026-08-01", period: "Aug 2026", value: 1.0, notes: "Pre-departure hold closure sign-off audited" },
      { date: "2026-09-01", period: "Sep 2026", value: 0.0, notes: "Zero unsecured events" },
      { date: "2026-10-01", period: "Oct 2026", value: 0.0, notes: "Zero unsecured events" }
    ]
  },
  {
    id: "SPI-LAG-06",
    code: "SPI-LAG-06",
    type: "lagging",
    category: "Regulatory & Mandatory Reporting",
    name: "Reportable Ground Safety Occurrences Compliance",
    nameAr: "نسبة الإبلاغ الإلزامي عن وقائع السلامة وفق اشتراطات سلطة الطيران",
    description: "Percentage of mandatory reportable ground handling occurrences notified to ECAA and airline carriers within regulatory reporting deadlines.",
    unit: "% compliance",
    measurementFormula: "(Occurrences Reported within 24h to ECAA & Airline / Total Reportable Events) * 100",
    applicableFramework: "ECAA ECAR Part 13 / ICAO Annex 19 / Airline SGHA Clause 5",
    ownerDepartment: "Safety & Quality Management",
    baseline: 98.5,
    baselinePeriod: "2026 Baseline",
    targetSPT: 100.0,
    sptDescription: "100% of reportable occurrences notified within mandatory timelines. (NOTE: Target of zero reported occurrences should never be used as it discourages reporting).",
    sptDescriptionAr: "إبلاغ إلزامي بنسبة ١٠٠٪ خلال المهل النظامية (تنبيه: لا يجوز استهداف صفر بلاغات حتى لا يُثبط الإبلاغ الطوعي ويُخفى الخطر).",
    sptDeadline: "Ongoing Annual",
    alertThreshold: 95.0,
    targetDirection: "higher_is_better",
    currentValue: 100.0,
    trend: "stable",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01",
    reportingCaution: "Critical SMS Principle: A target of zero reported occurrences should NEVER be used as the only measure of safety performance. It may discourage reporting and conceal active hazards. Always pair outcome reporting with proactive hazard identification measures.",
    historicalReadings: [
      { date: "2026-07-01", period: "Jul 2026", value: 98.0, notes: "One minor bird strike report filed 4 hours late to carrier" },
      { date: "2026-08-01", period: "Aug 2026", value: 100.0, notes: "All occurrences notified via instant automated dispatch" },
      { date: "2026-09-01", period: "Sep 2026", value: 100.0, notes: "100% timely filing" },
      { date: "2026-10-01", period: "Oct 2026", value: 100.0, notes: "100% timely filing" }
    ]
  },
  {
    id: "SPI-LAG-07",
    code: "SPI-LAG-07",
    type: "lagging",
    category: "Apron Environmental Safety",
    name: "Apron Fuel or Hazardous Chemical Spills (> 5 Liters)",
    nameAr: "انسكابات الوقود والمواد الكيميائية بساحة الطيران (> ٥ لتر)",
    description: "Incidents of uncontained fuel, hydraulic fluid, or hazardous chemical spills exceeding 5 liters on aircraft parking bays.",
    unit: "events / month",
    measurementFormula: "Absolute count of Tier 2/3 environmental hazardous liquid spill occurrences",
    applicableFramework: "ICAO Annex 14 Environmental Interface / EMAAS Spill Contingency SOP",
    ownerDepartment: "Operations - Ramp Services / GSE Fleet",
    baseline: 0.6,
    baselinePeriod: "2026 Baseline",
    targetSPT: 0.0,
    sptDescription: "Zero Tier 2/3 apron spills; 100% rapid containment and absorbent sweep within 5 minutes of any drip detection.",
    sptDescriptionAr: "صفر انسكابات متوسطة أو كبرى بالساحة؛ والسيطرة والاحتواء السريع بنسبة ١٠٠٪ خلال ٥ دقائق من رصد أي تسريب.",
    sptDeadline: "Annual 2026/2027",
    alertThreshold: 0.5,
    targetDirection: "lower_is_better",
    currentValue: 0.0,
    trend: "improving",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01",
    historicalReadings: [
      { date: "2026-07-01", period: "Jul 2026", value: 1.0, notes: "Hydraulic leak on old belt loader Stand 7" },
      { date: "2026-08-01", period: "Aug 2026", value: 0.0, notes: "Daily hydraulic line pre-shift checks instituted" },
      { date: "2026-09-01", period: "Sep 2026", value: 0.0, notes: "Zero spills" },
      { date: "2026-10-01", period: "Oct 2026", value: 0.0, notes: "Zero spills" }
    ]
  },

  // ==================== LEADING INDICATORS (PREVENTIVE SAFETY PERFORMANCE) ====================
  {
    id: "SPI-LED-01",
    code: "SPI-LED-01",
    type: "leading",
    category: "Just Culture & Hazard Identification",
    name: "Voluntary Hazard Reports per 1,000 Turns",
    nameAr: "معدل الإبلاغ الطوعي عن المخاطر لكل ١٠٠٠ حركة",
    description: "Rate of voluntary hazard identifications and near-miss observations submitted by frontline ramp and station personnel.",
    unit: "per 1,000 turns",
    measurementFormula: "(Voluntary Near-Miss & Hazard Reports / Total Aircraft Turns) * 1,000",
    applicableFramework: "ICAO Annex 19 Doc 9859 Proactive Safety Management / Just Culture",
    ownerDepartment: "Safety & Quality Management",
    baseline: 11.2,
    baselinePeriod: "2026 Baseline",
    targetSPT: 15.0,
    sptDescription: "Achieve >= 15.0 voluntary reports per 1,000 turns to cultivate a healthy, non-punitive Just Culture and proactively catch hazards before damage.",
    sptDescriptionAr: "تحقيق ١٥ بلاغاً طوعياً على الأقل لكل ١٠٠٠ حركة لتعزيز ثقافة العدالة والسلامة غير العقابية ورصد المخاطر قبل وقوع حوادث.",
    sptDeadline: "December 2027",
    alertThreshold: 9.0,
    targetDirection: "higher_is_better",
    currentValue: 16.4,
    trend: "improving",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01",
    historicalReadings: [
      { date: "2026-07-01", period: "Jul 2026", value: 10.8, turnsCount: 1250, notes: "Baseline voluntary reporting level" },
      { date: "2026-08-01", period: "Aug 2026", value: 13.5, turnsCount: 1420, notes: "Frontline mobile Quick Safety Tool launched" },
      { date: "2026-09-01", period: "Sep 2026", value: 15.2, turnsCount: 1380, notes: "Positive safety culture incentive award given" },
      { date: "2026-10-01", period: "Oct 2026", value: 16.4, turnsCount: 1410, notes: "Exceeding target SPT favorably" }
    ]
  },
  {
    id: "SPI-LED-02",
    code: "SPI-LED-02",
    type: "leading",
    category: "Ramp Safety Oversight",
    name: "Ramp Turnaround Safety Inspections & Audits Completed",
    nameAr: "نسبة إتمام التفتيشات والمراجعات الميدانية لمناولة الرحلات",
    description: "Percentage of scheduled flight turnaround safety inspections executed by Safety Officers against the monthly oversight quota.",
    unit: "% completed",
    measurementFormula: "(Completed Flight Turnaround Audits / Scheduled Mandatory Audits) * 100",
    applicableFramework: "IATA ISAGO ORM-2.2 / ECAA Station Oversight Guidelines",
    ownerDepartment: "Safety & Quality Management",
    baseline: 89.0,
    baselinePeriod: "2026 Baseline",
    targetSPT: 95.0,
    sptDescription: "Achieve >= 95% completion rate of scheduled ramp turnaround audits, covering FOD sweeps, marshaling, chocking, and loading controls.",
    sptDescriptionAr: "إتمام ٩٥٪ على الأقل من جولات التفتيش المجدولة لمناولة الرحلات متضمنة مسح الأجسام الغريبة، التثبيت، والتحميل.",
    sptDeadline: "Annual 2026/2027",
    alertThreshold: 88.0,
    targetDirection: "higher_is_better",
    currentValue: 96.5,
    trend: "improving",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01",
    historicalReadings: [
      { date: "2026-07-01", period: "Jul 2026", value: 88.0, notes: "Inspector summer roster short-staffing" },
      { date: "2026-08-01", period: "Aug 2026", value: 92.0, notes: "Two dedicated airside safety auditors rostered" },
      { date: "2026-09-01", period: "Sep 2026", value: 95.0, notes: "Target reached" },
      { date: "2026-10-01", period: "Oct 2026", value: 96.5, notes: "Robust coverage across all aircraft stands" }
    ]
  },
  {
    id: "SPI-LED-03",
    code: "SPI-LED-03",
    type: "leading",
    category: "CAPA Management & Resolution",
    name: "Safety Findings & CAPA On-Time Closure Rate",
    nameAr: "معدل إغلاق خطط تصحيح الملاحظات في موعدها (CAPA SLA)",
    description: "Percentage of internal/external audit findings and investigation CAPAs closed within assigned Level SLA (Major 30d, Minor 60d, Obs 90d).",
    unit: "% on-time",
    measurementFormula: "(CAPA Plans Closed On or Before Target Closure Date / Total Due Findings) * 100",
    applicableFramework: "SQMS 8-Step Lifecycle SLA / ICAO Doc 9859 SMS Assurance",
    ownerDepartment: "Safety & Quality Management / HoDs",
    baseline: 82.0,
    baselinePeriod: "2026 Baseline",
    targetSPT: 92.0,
    sptDescription: "Achieve >= 92% on-time closure rate for all corrective and preventive action plans without overdue escalation.",
    sptDescriptionAr: "تحقيق نسبة ٩٢٪ على الأقل في إغلاق خطط الإجراءات التصحيحية والوقائية ضمن المدد الزمنية المحددة دون تأخير.",
    sptDeadline: "December 2027",
    alertThreshold: 85.0,
    targetDirection: "higher_is_better",
    currentValue: 92.5,
    trend: "improving",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01",
    historicalReadings: [
      { date: "2026-07-01", period: "Jul 2026", value: 81.5, notes: "Delays in vendor evidence submission" },
      { date: "2026-08-01", period: "Aug 2026", value: 86.0, notes: "Weekly HoD CAPA aging review established" },
      { date: "2026-09-01", period: "Sep 2026", value: 90.0, notes: "Significant reduction in overdue findings" },
      { date: "2026-10-01", period: "Oct 2026", value: 92.5, notes: "Target achieved" }
    ]
  },
  {
    id: "SPI-LED-04",
    code: "SPI-LED-04",
    type: "leading",
    category: "Training & Competency",
    name: "Mandatory SMS & Airside Training Currency Rate",
    nameAr: "نسبة استيفاء تدريبات السلامة الإلزامية وتراخيص المهبط",
    description: "Percentage of active operational staff with 100% current (non-expired) airside qualifications: ADP, IATA DGR CBTA, and Pushback.",
    unit: "% certified",
    measurementFormula: "(Active Operational Staff with All Current Mandatory Certifications / Total Active Roster) * 100",
    applicableFramework: "ICAO Annex 19 Safety Promotion / IATA DGR CBTA / ECAA Personnel Licensing",
    ownerDepartment: "Training & Competency / Human Resources",
    baseline: 94.0,
    baselinePeriod: "2026 Baseline",
    targetSPT: 100.0,
    sptDescription: "100% of staff airside qualifications current; zero uncertified personnel allowed to operate GSE or handle dangerous goods cargo.",
    sptDescriptionAr: "استيفاء بنسبة ١٠٠٪ لمؤهلات العاملين؛ وحظر تام لعمل أي موظف منتهي الترخيص في قيادة المعدات أو شحن البضائع الخطرة.",
    sptDeadline: "Annual 2026/2027",
    alertThreshold: 92.0,
    targetDirection: "higher_is_better",
    currentValue: 97.8,
    trend: "improving",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01",
    historicalReadings: [
      { date: "2026-07-01", period: "Jul 2026", value: 93.5, notes: "12 staff expired DGR CBTA refresher" },
      { date: "2026-08-01", period: "Aug 2026", value: 96.0, notes: "EMAAS Academy batch recertifications" },
      { date: "2026-09-01", period: "Sep 2026", value: 97.2, notes: "Automated qualification lock deployed in roster" },
      { date: "2026-10-01", period: "Oct 2026", value: 97.8, notes: "Nominal, advancing toward 100%" }
    ]
  },
  {
    id: "SPI-LED-05",
    code: "SPI-LED-05",
    type: "leading",
    category: "Operational Communication",
    name: "Tool Box Talk (TBT) / Pre-Shift Briefing Compliance",
    nameAr: "نسبة الالتزام باجتماعات السلامة التنويرية قبل نوبات العمل (TBT)",
    description: "Percentage of daily ramp and passenger handling shift handovers that conduct and digitally document a 5-minute safety Tool Box Talk.",
    unit: "% compliance",
    measurementFormula: "(Documented Shift Safety Briefings / Total Scheduled Operational Shifts) * 100",
    applicableFramework: "EMAAS Ground Handling Station SOP / IGOM General Safety",
    ownerDepartment: "Operations - Ramp Services",
    baseline: 88.0,
    baselinePeriod: "2026 Baseline",
    targetSPT: 95.0,
    sptDescription: "Achieve >= 95% compliance in conducting daily pre-shift safety briefings focusing on stand hazards, extreme weather, and carrier SOPs.",
    sptDescriptionAr: "تحقيق التزام بنسبة ٩٥٪ على الأقل في اجتماعات ما قبل النوبة لتوعية الفرق بمخاطر الساحة والطقس الحار وتعليمات الشركات.",
    sptDeadline: "December 2027",
    alertThreshold: 85.0,
    targetDirection: "higher_is_better",
    currentValue: 95.2,
    trend: "improving",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01",
    historicalReadings: [
      { date: "2026-07-01", period: "Jul 2026", value: 87.0, notes: "Night shifts missing documentation" },
      { date: "2026-08-01", period: "Aug 2026", value: 91.0, notes: "Mobile TBT checklist provided to Supervisors" },
      { date: "2026-09-01", period: "Sep 2026", value: 94.0, notes: "Consistent completion across all shifts" },
      { date: "2026-10-01", period: "Oct 2026", value: 95.2, notes: "Target reached" }
    ]
  },
  {
    id: "SPI-LED-06",
    code: "SPI-LED-06",
    type: "leading",
    category: "GSE Maintenance Reliability",
    name: "GSE Preventive Maintenance (PM) On-Time Compliance Rate",
    nameAr: "نسبة إتمام الصيانة الوقائية لمعدات المهبط في موعدها",
    description: "Percentage of motorized and non-motorized GSE units serviced on or before the manufacturer scheduled PM interval (hours or calendar).",
    unit: "% on-time",
    measurementFormula: "(GSE Units Serviced within PM Interval / Total GSE Units Due for Service) * 100",
    applicableFramework: "IATA ISAGO AGM-1 / IATA AHM 900 / ECAA Equipment Guidelines",
    ownerDepartment: "Maintenance - GSE Fleet",
    baseline: 90.0,
    baselinePeriod: "2026 Baseline",
    targetSPT: 95.0,
    sptDescription: "Maintain >= 95% on-time preventative maintenance compliance to minimize airside breakdown risks and prevent brake/hydraulic failures.",
    sptDescriptionAr: "الحفاظ على نسبة ٩٥٪ على الأقل للصيانة الوقائية في موعدها لتفادي أعطال المهبط وتلف الفرامل والأنظمة الهيدروليكية.",
    sptDeadline: "Annual 2026/2027",
    alertThreshold: 88.0,
    targetDirection: "higher_is_better",
    currentValue: 96.0,
    trend: "improving",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01",
    historicalReadings: [
      { date: "2026-07-01", period: "Jul 2026", value: 89.0, notes: "Spare parts delay for belt loaders" },
      { date: "2026-08-01", period: "Aug 2026", value: 93.0, notes: "Buffer stock established at RMF workshop" },
      { date: "2026-09-01", period: "Sep 2026", value: 95.5, notes: "PM schedule on-track" },
      { date: "2026-10-01", period: "Oct 2026", value: 96.0, notes: "Target achieved" }
    ]
  },
  {
    id: "SPI-LED-07",
    code: "SPI-LED-07",
    type: "leading",
    category: "Change Risk Governance",
    name: "Management of Change (MoC) Risk Assessment Compliance",
    nameAr: "نسبة استيفاء تقييم المخاطر لإدارة التغيير قبل بدء التشغيل",
    description: "Percentage of station operational changes (new carrier, equipment modification, SOP update, infrastructure works) with approved MoC prior to go-live.",
    unit: "% compliance",
    measurementFormula: "(Operational Changes with Authorized MoC Safety Assessment / Total Station Changes) * 100",
    applicableFramework: "ICAO Annex 19 Amdt 2 (Nov 2026) / IATA ISAGO ORM-4 / ECAA SMS",
    ownerDepartment: "Safety & Quality Management",
    baseline: 100.0,
    baselinePeriod: "2026 Baseline",
    targetSPT: 100.0,
    sptDescription: "100% of station changes must complete 4-tier risk assessment and Accountable Executive approval prior to implementation.",
    sptDescriptionAr: "استيفاء ١٠٠٪ لتقييمات المخاطر واعتماد الإدارة التنفيذية لجميع التغييرات قبل تفعيلها تشغيلياً بساحة الطيران.",
    sptDeadline: "Continuous Mandate",
    alertThreshold: 98.0,
    targetDirection: "higher_is_better",
    currentValue: 100.0,
    trend: "stable",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01",
    historicalReadings: [
      { date: "2026-07-01", period: "Jul 2026", value: 100.0, notes: "MoC for Stand 9 refurbishment approved" },
      { date: "2026-08-01", period: "Aug 2026", value: 100.0, notes: "MoC for Condor widebody operations authorized" },
      { date: "2026-09-01", period: "Sep 2026", value: 100.0, notes: "MoC for new electric baggage tugs verified" },
      { date: "2026-10-01", period: "Oct 2026", value: 100.0, notes: "100% governance compliance maintained" }
    ]
  },
  {
    id: "SPI-LED-08",
    code: "SPI-LED-08",
    type: "leading",
    category: "Safety Promotion & Culture",
    name: "Safety Bulletins & Notices Acknowledgment Rate within 14 Days",
    nameAr: "نسبة توقيع وإقرار قراءة النشرات والتعاميم العملياتية خلال ١٤ يوماً",
    description: "Percentage of targeted frontline staff who read, understand, and digitally acknowledge mandatory Safety Bulletins and Operational Notices within 14 days.",
    unit: "% acknowledged",
    measurementFormula: "(Target Personnel Verified Digital Acknowledgment within 14 Days / Total Targeted Roster) * 100",
    applicableFramework: "ICAO Doc 9859 Chapter 9 Safety Communication / EMAAS SMS Manual",
    ownerDepartment: "Safety & Quality Management",
    baseline: 86.0,
    baselinePeriod: "2026 Baseline",
    targetSPT: 95.0,
    sptDescription: "Achieve >= 95% verified digital acknowledgment on all critical safety bulletins within 14 days of publication.",
    sptDescriptionAr: "تحقيق نسبة إقرار وقراءة رقمية ٩٥٪ على الأقل لجميع نشرات السلامة خلال ١٤ يوماً من تاريخ النشر.",
    sptDeadline: "December 2027",
    alertThreshold: 85.0,
    targetDirection: "higher_is_better",
    currentValue: 94.8,
    trend: "improving",
    frequency: "Monthly",
    status: "nominal",
    lastUpdated: "2026-10-01",
    historicalReadings: [
      { date: "2026-07-01", period: "Jul 2026", value: 85.0, notes: "Paper acknowledgment sheets had low tracking" },
      { date: "2026-08-01", period: "Aug 2026", value: 89.0, notes: "Digital kiosk acknowledgment introduced in crew room" },
      { date: "2026-09-01", period: "Sep 2026", value: 93.5, notes: "Strong response to Stand 6 FOD bulletin" },
      { date: "2026-10-01", period: "Oct 2026", value: 94.8, notes: "Target nearly met" }
    ]
  }
];

export const INITIAL_BULLETINS: SafetyBulletin[] = [
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

export const INITIAL_MOCS: ManagementOfChange[] = [
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
        deadline: "2026-10-20",
        status: "completed"
      }
    ],
    status: "hod_reviewed",
    approvals: {
      hodApproved: true,
      hodName: "Eng. Tarek Fathy",
      hodDate: "2026-09-20",
      sqmApproved: true,
      sqmName: "Dr. Khaled Fawzy",
      sqmDate: "2026-09-28",
      aeApproved: false
    },
    postReviewDone: false
  }
];

export const INITIAL_GSE: GSEVehicle[] = [
  {
    id: "RMF-TUG-01",
    name: "Heavy Pushback Tractor #1",
    type: "Aircraft Pushback Tug (Widebody)",
    tagStatus: "green",
    manufacturer: "Goldhofer AST-1X",
    locationStand: "Stand 4 GSE Pen",
    operatingHours: 4210,
    lastInspectionDate: "2026-10-01",
    nextServiceDue: "2026-11-01"
  },
  {
    id: "RMF-TUG-02",
    name: "Towbarless Pushback Tug #2",
    type: "Towbarless Pushback (Narrowbody)",
    tagStatus: "amber",
    manufacturer: "Trepel Challenger 150",
    locationStand: "GSE Workshop Bay 2",
    operatingHours: 5120,
    lastInspectionDate: "2026-09-15",
    nextServiceDue: "2026-10-15",
    activeDefectNotes: "Steering hydraulic clamp replacement under incident RMF-SMS-2026-0038.",
    activeDefectReportId: "RMF-SMS-2026-0038"
  },
  {
    id: "RMF-BL-04",
    name: "High-Lift Baggage Belt Loader #4",
    type: "Conveyor Belt Loader",
    tagStatus: "red",
    manufacturer: "TLD NBL",
    locationStand: "Stand 2 Staging Area",
    operatingHours: 3890,
    lastInspectionDate: "2026-09-28",
    nextServiceDue: "2026-10-28",
    activeDefectNotes: "Emergency stop switch failure reported under RMF-SMS-2026-0043. Vehicle grounded."
  },
  {
    id: "RMF-GPU-01",
    name: "Ground Power Unit 90kVA #1",
    type: "GPU 400Hz Diesel",
    tagStatus: "amber",
    manufacturer: "ITW GSE 2400",
    locationStand: "Stand 5 Parking",
    operatingHours: 6400,
    lastInspectionDate: "2026-10-05",
    nextServiceDue: "2026-11-05",
    activeDefectNotes: "Output cable sheath crack under RMF-SMS-2026-0042."
  }
];

export const INITIAL_TRAINING: StaffTrainingRecord[] = [
  {
    id: "TR-01",
    name: "Ahmed Mansour",
    badgeNumber: "RMF-7842",
    department: "Operations - Ramp Services",
    roleTitle: "Senior Ramp Lead Agent",
    courses: [
      { courseId: "C-DGR", courseName: "IATA Dangerous Goods CBTA (Cat 7/8)", certifiedDate: "2025-06-15", expiryDate: "2027-06-15", status: "valid" },
      { courseId: "C-ADP", courseName: "Airside Driving Permit (ADP)", certifiedDate: "2025-11-20", expiryDate: "2026-11-20", status: "expiring" },
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

export const INITIAL_USERS: UserRecord[] = [
  { id: "USR-01", name: "Gen. Adel Radwan", email: "a.radwan@marsa-alam-ground.com", badgeNumber: "RMF-001", department: "Executive Leadership", role: "ae", isActive: true, phone: "+20 100 123 4567" },
  { id: "USR-02", name: "Eng. Hisham El-Gohary", email: "h.gohary@marsa-alam-ground.com", badgeNumber: "RMF-002", department: "Station Management", role: "ghm", isActive: true, phone: "+20 100 234 5678" },
  { id: "USR-03", name: "Capt. Sherif Nour", email: "s.nour@marsa-alam-ground.com", badgeNumber: "RMF-003", department: "Operations", role: "hod_ops", isActive: true, phone: "+20 100 345 6789" },
  { id: "USR-04", name: "Dr. Khaled Fawzy", email: "k.fawzy@marsa-alam-ground.com", badgeNumber: "RMF-004", department: "Safety & Quality", role: "hod_safety", isActive: true, phone: "+20 100 456 7890" },
  { id: "USR-05", name: "Eng. Tarek Fathy", email: "t.fathy@marsa-alam-ground.com", badgeNumber: "RMF-005", department: "Maintenance", role: "hod_maint", isActive: true, phone: "+20 100 567 8901" },
  { id: "USR-06", name: "Mohamed El-Sayed", email: "m.elsayed@marsa-alam-ground.com", badgeNumber: "RMF-006", department: "Training", role: "hod_training", isActive: true, phone: "+20 100 678 9012" },
  { id: "USR-07", name: "Mahmoud Ezz", email: "m.ezz@marsa-alam-ground.com", badgeNumber: "RMF-007", department: "Safety & Quality", role: "safety_officer", isActive: true, phone: "+20 100 789 0123" },
  { id: "USR-08", name: "Ahmed Mansour", email: "a.mansour@marsa-alam-ground.com", badgeNumber: "RMF-7842", department: "Operations - Ramp", role: "field_staff", isActive: true, phone: "+20 100 890 1234" }
];

export const INITIAL_DEPARTMENTS: DepartmentConfig[] = [
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

export const INITIAL_FORM_CONFIG: SafetyReportFormConfig = {
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
  customDisclaimerEn: "Confidential 'Just Culture' Reporting Policy: In accordance with ICAO SMS Doc 9859 and RMF station regulations, reports are treated with strict confidentiality to identify operational hazards rather than assign blame.",
  customDisclaimerAr: "سياسة ثقافة العدالة والسرية: وفقاً للوائح إدارة السلامة (ICAO SMS Doc 9859) بمطار مرسى علم الدولي، يتم التعامل مع جميع البلاغات بسرية تامة للتعرف على المخاطر التشغيلية وتحسين بيئة العمل دون توجيه اللوم.",
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

export const INITIAL_AUDIT_TEMPLATES: AuditTemplate[] = [
  {
    id: "TPL-ISAGO-RMP-01",
    title: "IATA ISAGO RMP — Apron Ramp Safety & Aircraft Servicing",
    titleAr: "اياتا ايساجو - سلامة ساحة الطيران وعمليات المهبط",
    auditType: "internal",
    discipline: "RMP",
    standardFramework: "IATA ISAGO GOSM 14th Edition / IGOM 2026",
    department: "Operations - Ramp Services",
    leadAuditorRole: "Lead ISAGO Ramp Auditor",
    estimatedHours: 16,
    scopeSummary: "Comprehensive airside ramp safety compliance, GSE stand-off safety clearance, aircraft wheel chocking, refuelling earthing, engine hazard ingestion danger zones, and turnaround operations on Stands 1 to 8.",
    createdAt: "2026-01-10",
    isDefault: true,
    items: [
      {
        id: "CHK-RMP-01",
        code: "ISAGO RMP 1.1.1",
        title: "Safety Clearance Zone Verification",
        question: "Is the aircraft stand safety clearance zone verified clear of all foreign objects, vehicles, and unapproved personnel prior to aircraft arrival?",
        category: "Apron Readiness",
        guidanceNotes: "Verify physical walkaround and marshaller visual check.",
        mandatory: true
      },
      {
        id: "CHK-RMP-02",
        code: "ISAGO RMP 1.2.4",
        title: "Main & Nose Gear Chocking Protocol",
        question: "Are four approved rubber chocks positioned at nose and main gear within 60 seconds of aircraft full stop and anti-collision lights turned off?",
        category: "Aircraft Arrival",
        guidanceNotes: "Verify chock condition, distance to tires, and correct placement.",
        mandatory: true
      },
      {
        id: "CHK-RMP-03",
        code: "ISAGO RMP 2.1.2",
        title: "High-Visibility Safety Cones",
        question: "Are safety cones placed at aircraft wingtips, tail engine danger areas, and nose gear within 3 minutes of arrival?",
        category: "Aircraft Arrival",
        guidanceNotes: "Cones must be minimum 75cm height and fluorescent orange/red with reflective bands.",
        mandatory: true
      },
      {
        id: "CHK-RMP-04",
        code: "ISAGO RMP 2.3.1",
        title: "GSE Equipment Staging & Stand-Off",
        question: "Is Ground Support Equipment (GSE) parked strictly inside designated white staging boxes with minimum 0.5m clearance before aircraft stop?",
        category: "GSE Staging",
        guidanceNotes: "Inspect apron marking compliance and brake engagement on parked GSE.",
        mandatory: true
      },
      {
        id: "CHK-RMP-05",
        code: "ISAGO RMP 3.1.5",
        title: "Belt Loader Rubber Bumper Contact Gap",
        question: "Are conveyor belt loaders positioned with a 2.5cm to 5cm gap from aircraft fuselage sill to avoid composite skin contact damage?",
        category: "Aircraft Servicing",
        guidanceNotes: "Zero physical metal/hard plastic contact allowed under any condition.",
        mandatory: true
      },
      {
        id: "CHK-RMP-06",
        code: "ISAGO RMP 4.2.1",
        title: "Refuelling Bonding Cable Earthing",
        question: "Is the refueller bonding wire securely connected to the apron grounding receptacle before fuel hose coupling to the aircraft wing?",
        category: "Refuelling Safety",
        guidanceNotes: "Check electrical bonding resistance clamp and spark-free connection.",
        mandatory: true
      },
      {
        id: "CHK-RMP-07",
        code: "ISAGO RMP 5.3.3",
        title: "Pre-Departure & Post-Pushback FOD Sweep",
        question: "Is a documented physical FOD sweep performed across the entire stand footprint immediately prior to pushback and verified clean afterwards?",
        category: "FOD Prevention",
        guidanceNotes: "Examine FOD collection bins and ramp team signoff card.",
        mandatory: true
      },
      {
        id: "CHK-RMP-08",
        code: "ISAGO RMP 6.1.4",
        title: "Pushback Intercom Standard Phraseology",
        question: "Does the headset operator utilize standardized ICAO/IATA phraseology during pushback clearance, bypass pin check, and engine startup?",
        category: "Aircraft Departure",
        guidanceNotes: "Listen to live communication for 'brakes released', 'all doors closed', and 'clear to start'.",
        mandatory: true
      }
    ]
  },
  {
    id: "TPL-IGOM-TURN-02",
    title: "IATA IGOM Chapter 4 — Aircraft Turnaround & Ramp Operations",
    titleAr: "اياتا ايجوم الباب الرابع - عمليات دوران الطائرة وخدمات الساحة",
    auditType: "internal",
    discipline: "RMP",
    standardFramework: "IATA IGOM 2026 Edition",
    department: "Operations - Ramp Services",
    leadAuditorRole: "Senior Ramp Safety Auditor",
    estimatedHours: 8,
    scopeSummary: "Direct turnaround audit covering aircraft marshalling, GPU/ASU strain-relief, cargo hold sill protection, passenger walkway physical guidance, and bypass pin protocols.",
    createdAt: "2026-01-15",
    isDefault: true,
    items: [
      {
        id: "CHK-IGOM-01",
        code: "IGOM 4.1.2",
        title: "Visual Docking Guidance or Marshalling",
        question: "Are standard illuminated marshalling wands or calibrated Safedock VDGS systems adhered to during gate arrival?",
        category: "Arrival Marshalling",
        guidanceNotes: "Check daylight wand color and emergency stop signal awareness.",
        mandatory: true
      },
      {
        id: "CHK-IGOM-02",
        code: "IGOM 4.2.3",
        title: "Ground Power Unit (GPU) Strain Relief",
        question: "Is the GPU 400Hz heavy electrical cable supported by the lanyard/strain relief hook to prevent strain damage to aircraft receptacle pins?",
        category: "Electrical Servicing",
        guidanceNotes: "No cable weight allowed to hang directly on the aircraft receptacle.",
        mandatory: true
      },
      {
        id: "CHK-IGOM-03",
        code: "IGOM 4.3.1",
        title: "Cargo Hold Sill Protective Matting",
        question: "Are padded sill protective covers installed on lower deck cargo door frames prior to loading or unloading loose baggage?",
        category: "Baggage Loading",
        guidanceNotes: "Prevent luggage belt buckle and metal edge strikes to fuselage lip.",
        mandatory: true
      },
      {
        id: "CHK-IGOM-04",
        code: "IGOM 4.5.6",
        title: "Passenger Apron Walkway Physical Guidance",
        question: "Are mobile stanchion retractable barriers and hi-vis escort agents stationed continuously along the apron walking path for open-air boarding?",
        category: "Passenger Safety",
        guidanceNotes: "No passenger allowed near engine intake danger zones or GSE roads.",
        mandatory: true
      },
      {
        id: "CHK-IGOM-05",
        code: "IGOM 4.6.2",
        title: "Nosewheel Steering Bypass Pin Verification",
        question: "Is the steering bypass pin verified properly seated with high-visibility 'Remove Before Flight' ribbon visible prior to towbar connection?",
        category: "Pushback Preparation",
        guidanceNotes: "Verify flight crew hydraulic system depressurization notification.",
        mandatory: true
      },
      {
        id: "CHK-IGOM-06",
        code: "IGOM 4.7.1",
        title: "Bypass Pin Visual Confirmation to Cockpit",
        question: "Upon pushback completion, is the bypass pin physically held up and clearly shown to the Captain accompanied by the 'Pin Removed' salute?",
        category: "Pushback Completion",
        guidanceNotes: "Visual thumbs up and pin presentation must be acknowledged by PIC.",
        mandatory: true
      }
    ]
  },
  {
    id: "TPL-ISAGO-LOD-03",
    title: "IATA ISAGO LOD — Weight & Balance and Load Control Verification",
    titleAr: "اياتا ايساجو - تدقيق التحكم في الحمولة وتوزيع الأوزان والتوازن",
    auditType: "internal",
    discipline: "LOD",
    standardFramework: "IATA ISAGO LOD Standards & AHM 560/590",
    department: "Operations - Load Control",
    leadAuditorRole: "Lead Load Control Quality Auditor",
    estimatedHours: 12,
    scopeSummary: "Verification of computerized loadsheet parameters, Load Instruction Report (LIR) supervisor sign-offs, dangerous goods NOTOC notifications, and cargo hold structural locks.",
    createdAt: "2026-02-01",
    isDefault: true,
    items: [
      {
        id: "CHK-LOD-01",
        code: "ISAGO LOD 1.1.2",
        title: "Load Instruction Report (LIR) Execution",
        question: "Is the completed Load Instruction Report verified and signed by the certified Ramp Loading Supervisor before the flight deck loadsheet is finalized?",
        category: "Documentation",
        guidanceNotes: "Cross check piece counts and hold compartments with actual aircraft holds.",
        mandatory: true
      },
      {
        id: "CHK-LOD-02",
        code: "ISAGO LOD 2.1.4",
        title: "EDP Loadsheet Automated Trim Validation",
        question: "Is the electronic trim calculation verified against structural operational limitations (MZFW, MTOW, MLAW) and within legal CG envelope limits?",
        category: "Trim Envelope",
        guidanceNotes: "Check underload remaining and ballast fuel calculations if applicable.",
        mandatory: true
      },
      {
        id: "CHK-LOD-03",
        code: "ISAGO LOD 3.2.1",
        title: "Special Load Notification to Captain (NOTOC)",
        question: "Is a signed NOTOC generated and physically handed to the Captain for all Section II lithium batteries, dry ice, and live animal consignments?",
        category: "Dangerous Goods",
        guidanceNotes: "NOTOC copy with PIC signature must be archived in station dispatch file.",
        mandatory: true
      },
      {
        id: "CHK-LOD-04",
        code: "ISAGO LOD 4.1.5",
        title: "Last Minute Changes (LMC) Thresholds",
        question: "Are all Last Minute Changes (LMC) recorded strictly within the airline's allowable weight limits (+/- 500kg) or loadsheet re-issued if breached?",
        category: "LMC Protocol",
        guidanceNotes: "Ensure fuel burn adjustments are factored into landing weight.",
        mandatory: true
      },
      {
        id: "CHK-LOD-05",
        code: "ISAGO LOD 5.2.2",
        title: "Hold Netting & Structural Locks Engagement",
        question: "Are all compartment partition divider nets, door nets, and ULD floor lock latches checked engaged and certified by loading crew?",
        category: "Hold Restraints",
        guidanceNotes: "Physical lock verification prevents catastrophic in-flight cargo shifts.",
        mandatory: true
      }
    ]
  },
  {
    id: "TPL-ISAGO-PAX-BAG-04",
    title: "IATA ISAGO PAX & BAG — Passenger & Baggage Reconciliation",
    titleAr: "اياتا ايساجو - خدمات الركاب والمطابقة الإيجابية للأمتعة",
    auditType: "internal",
    discipline: "PAX",
    standardFramework: "IATA ISAGO PAX/BAG & ICAO Annex 17",
    department: "Passenger Handling",
    leadAuditorRole: "Quality & Security Lead Auditor",
    estimatedHours: 10,
    scopeSummary: "Check-in travel document verification, Passenger Boarding Bridge (PBB) safety interlocking, PRM ambulift procedures, and 100% automated Baggage Reconciliation System (BRS) positive matching.",
    createdAt: "2026-02-15",
    isDefault: true,
    items: [
      {
        id: "CHK-PAX-01",
        code: "ISAGO PAX 1.3.1",
        title: "Passenger Boarding Bridge (PBB) Auto-Level & Canopy",
        question: "Are boarding bridge sensors, auto-leveller wheels, and weather canopy pressure interlocks verified functional before connecting to passenger doors?",
        category: "Airbridge Safety",
        guidanceNotes: "Verify safety shoe sensor emergency stop.",
        mandatory: true
      },
      {
        id: "CHK-PAX-02",
        code: "ISAGO PAX 2.2.4",
        title: "PRM Ambulift Secure Restraints",
        question: "Are Passengers with Reduced Mobility (PRM) wheelchair wheel clamps, hydraulic platform railings, and passenger safety belts locked during lift operations?",
        category: "Special Assistance",
        guidanceNotes: "Zero unassisted movement on ambulift platform.",
        mandatory: true
      },
      {
        id: "CHK-BAG-01",
        code: "ISAGO BAG 1.1.5",
        title: "100% BRS Positive Baggage Matching",
        question: "Is every single loaded bag scanned through the electronic Baggage Reconciliation System (BRS) with zero un-manifested or no-show passenger bags onboard?",
        category: "Security Reconciliation",
        guidanceNotes: "Check BRS reconciliation Bingo sheets and flight manifest offloads.",
        mandatory: true
      },
      {
        id: "CHK-BAG-02",
        code: "ISAGO BAG 2.3.2",
        title: "Rush and Crew Baggage Security Screening",
        question: "Are all unaccompanied rush bags and crew luggage subject to dual-view X-ray security screening with valid security stamp tags?",
        category: "Security Screening",
        guidanceNotes: "Check X-ray screening logs at the baggage makeup area.",
        mandatory: true
      }
    ]
  },
  {
    id: "TPL-ECAR-ORM-05",
    title: "ECAA ECAR 139 / SMS — Airside Operations & Safety Management Audit",
    titleAr: "سلطة الطيران المدني المصري - تدقيق السلامة وإدارة العمليات الجوية",
    auditType: "external",
    discipline: "ORM",
    standardFramework: "Egyptian Civil Aviation Authority (ECAA) ECAR Part 139 & ICAO Doc 9859",
    department: "Quality & Safety",
    leadAuditorRole: "ECAA Certified Lead Inspector",
    estimatedHours: 24,
    scopeSummary: "Station safety policy promulgation, safety committees, hazard logs, airside driving permits (ADP) validity, emergency response plan readiness, and SPI oversight.",
    createdAt: "2026-03-01",
    isDefault: true,
    items: [
      {
        id: "CHK-ORM-01",
        code: "ECAR 139.101",
        title: "Station Safety Policy Sign-Off & Promulgation",
        question: "Is the current Station Safety Policy endorsed by the Accountable Executive conspicuously posted in all staff briefing rooms in both English and Arabic?",
        category: "SMS Governance",
        guidanceNotes: "Verify annual review date and commitment to Just Culture.",
        mandatory: true
      },
      {
        id: "CHK-ORM-02",
        code: "ECAR 139.205",
        title: "Airside Driving Permit (ADP) Currency",
        question: "Are 100% of ground vehicle drivers in possession of valid, unexpired Airside Driving Permits and current medical fitness clearances?",
        category: "Personnel Licensing",
        guidanceNotes: "Sample 10 random ramp drivers across tugs, loaders, and catering trucks.",
        mandatory: true
      },
      {
        id: "CHK-ORM-03",
        code: "ECAR 139.310",
        title: "Station Emergency Response Plan (ERP) Call Tree",
        question: "Has the station ERP crisis mobilization cascade and emergency call tree been tested with a tabletop drill within the past 6 months?",
        category: "Emergency Readiness",
        guidanceNotes: "Examine after-action report and contact numbers verification.",
        mandatory: true
      },
      {
        id: "CHK-ORM-04",
        code: "ECAR 139.420",
        title: "Safety Performance Indicators (SPI) Review",
        question: "Are station SPIs reviewed monthly by the Station Safety Committee with documented target alert thresholds and trend mitigations?",
        category: "Safety Assurance",
        guidanceNotes: "Inspect minutes of the last two Station Safety Committee meetings.",
        mandatory: true
      }
    ]
  }
];

export const INITIAL_ROLES: RoleDefinition[] = [
  { key: 'ae', label: 'Accountable Executive (AE)', labelAr: 'المدير التنفيذي المسؤول (AE)', clearance: 'Executive Board', isSystem: true },
  { key: 'ghm', label: 'Ground Handling Manager (GHM)', labelAr: 'مدير المناولة الأرضية (GHM)', clearance: 'Station General Manager', isSystem: true },
  { key: 'sdm', label: 'Service Delivery Manager (SDM)', labelAr: 'مدير تقديم الخدمات (SDM)', clearance: 'Operations Management', isSystem: true },
  { key: 'hod_safety', label: 'Safety & Quality Manager (SQM)', labelAr: 'مدير السلامة والجودة (SQM)', clearance: 'SMS Authority', isSystem: true },
  { key: 'hod_ops', label: 'Head of Operations (Ramp/Load/Pax)', labelAr: 'مدير العمليات والتشغيل', clearance: 'Department Head', isSystem: true },
  { key: 'hod_maint', label: 'Head of Maintenance (GSE Fleet)', labelAr: 'مدير صيانة معدات المهبط', clearance: 'Department Head', isSystem: true },
  { key: 'hod_training', label: 'Head of Training & Academy', labelAr: 'مدير التدريب والتأهيل', clearance: 'Department Head', isSystem: true },
  { key: 'safety_officer', label: 'Safety Officer / Investigator', labelAr: 'مسؤول السلامة والتحقيق', clearance: 'Safety Investigator', isSystem: true },
  { key: 'ramp_supervisor', label: 'Ramp Shift Supervisor', labelAr: 'مشرف نوبة المهبط', clearance: 'Shift Supervisor', isSystem: true },
  { key: 'field_staff', label: 'Frontline Ramp / Gate Agent', labelAr: 'موظف المهبط وبوابات الركاب', clearance: 'Frontline Agent', isSystem: true },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<StationRole, RolePermissions> = {
  ae: {
    canViewQuickReport: true,
    canViewIncidentLogs: true,
    canViewAudits: true,
    canViewSPI: true,
    canViewKPIDashboard: true,
    canViewBulletins: true,
    canViewMoC: true,
    canViewGSE: true,
    canViewTraining: false, // Access only by safety and quality manager and training head
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
    canViewKPIDashboard: true,
    canViewBulletins: true,
    canViewMoC: true,
    canViewGSE: true,
    canViewTraining: false, // Access only by safety and quality manager and training head
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
    canViewKPIDashboard: true,
    canViewBulletins: true,
    canViewMoC: true,
    canViewGSE: true,
    canViewTraining: false, // Access only by safety and quality manager and training head
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
    canViewKPIDashboard: true,
    canViewBulletins: true,
    canViewMoC: true,
    canViewGSE: true,
    canViewTraining: true, // Authorized: Safety and Quality Manager
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
    canViewKPIDashboard: true,
    canViewBulletins: true,
    canViewMoC: true,
    canViewGSE: true,
    canViewTraining: false, // Access only by safety and quality manager and training head
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
    canViewKPIDashboard: true,
    canViewBulletins: true,
    canViewMoC: true,
    canViewGSE: true,
    canViewTraining: false, // Access only by safety and quality manager and training head
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
    canViewKPIDashboard: true,
    canViewBulletins: true,
    canViewMoC: false,
    canViewGSE: false,
    canViewTraining: true, // Authorized: Training Head
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
    canViewKPIDashboard: true,
    canViewBulletins: true,
    canViewMoC: true,
    canViewGSE: true,
    canViewTraining: false, // Access only by safety and quality manager and training head
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
    canViewKPIDashboard: true,
    canViewBulletins: true,
    canViewMoC: false,
    canViewGSE: true,
    canViewTraining: false, // Access only by safety and quality manager and training head
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
    canViewKPIDashboard: true,
    canViewBulletins: true,
    canViewMoC: false,
    canViewGSE: false,
    canViewTraining: false, // Access only by safety and quality manager and training head
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
