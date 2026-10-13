# Marsa Alam (RMF) Ground Handling Safety & Quality Management System (SQMS)

A specialized aviation Safety and Quality Management System (SQMS) for ground handling operations at Marsa Alam International Airport (RMF), combining an instant 30-second ramp hazard reporting landing page, bi-directional English/Arabic (RTL) localization, ramp-optimized high-contrast dark/light themes, ICAO SMS & IATA ISAGO/IGOM audit workflows, interactive audit calendar, user & roles access matrix, Management of Change (MoC), configurable bilingual Management Review Report (PDF/Word), full CRUD SPI/SPT governance, and Safety Bulletins with staff acknowledgment tracking and direct case-to-bulletin issuance.

***

### User Review & Critical Decisions

> [!IMPORTANT]
> The plan now incorporates all requested enhancements:
> - **SPI & SPT Full CRUD Management**: Full Create, Read, Update, Delete for Safety Performance Indicators and Safety Performance Targets (e.g. Aircraft Ground Damage Rate per 10k turnarounds, GSE Red-Tag Rate, FOD frequency, CAPA closure on-time %) with defined target baselines, alert thresholds, and real-time status tracking.
> - **Safety Bulletins & Controlled Documents with Staff Acknowledgment**: Document repository for Safety Bulletins (SB), Internal Operational Notices (ION), and Station SOPs. Features mandatory read-and-acknowledge verification tracking staff name, timestamp, and station compliance percentage.
> - **Direct Bulletin/Notice Issuance from Cases**: Every Safety Report and Audit Finding includes a dedicated action button at the final closure stage for the Safety & Quality Manager to issue an official Safety Bulletin or Internal Operational Notice (e.g., `RMF-SB-2026-XXXX` or `RMF-ION-2026-XXXX`), automatically linking the root-cause lessons to station-wide distribution.
> - **Audit Calendar & Annual Plan**: Visual calendar for internal/external audits with yearly schedule by quarter and discipline.
> - **User & Role Access Matrix**: Directory, configurable departments, and an interactive RBAC permission matrix.
> - **Management of Change (MoC)**: 4-tier approval flow with risk assessment and post-change review.
> - **Management Review Report Builder**: Checkbox-based section selection, Arabic/English bilingual generation, and export to PDF/Word.

***

### 1. Overview & Core Concept

- **What It Does**: Provides ground handling personnel at Marsa Alam International Airport (RMF) with an end-to-end safety and quality platform. Frontline ramp agents can instantly report hazards, near-misses, Foreign Object Debris (FOD), GSE collisions, or turn-around delays without logging in. Safety officers and managers execute formal investigations, dual-phase risk assessments (initial vs. residual), RCA (Simple vs. 5-Whys), and CAPA approvals. Quality managers track internal and external audit non-conformities, schedule annual audit plans, manage SPIs/SPTs, coordinate Management of Change, and publish Safety Bulletins with staff acknowledgment verification.
- **Target Audience / Persona**:
  - *Frontline Ramp & Gate Agents*: Rapid 30-second hazard capture on the apron with camera/photo upload; quick acknowledgment of published Safety Bulletins.
  - *Safety Officer / SMS Coordinator*: Primary investigator; logs receipt acknowledgments, completes Pre/Post risk ratings, leads RCA investigations, monitors SPIs against SPT targets.
  - *Department Heads (Operations, Maintenance, Training)*: Responsible for executing corrective actions, proposing preventive fixes, and providing implementation evidence.
  - *Safety & Quality Manager (SQM) / Lead Auditor*: Approves CAPA proposals, monitors Internal/External audit findings, issues Safety Bulletins/IONs upon case closure, audits action effectiveness, and closes cases.
  - *Service Delivery Manager (SDM) & Ground Handling Manager (GHM)*: Operational station managers reviewing station-wide safety KPIs, escalation alerts, and budget sign-offs.
  - *Accountable Executive (AE)*: Strategic oversight of overall station Safety Performance Indicators (SPIs) and regulatory compliance.

***

### 2. User Experience & Detailed Module Architecture

#### A. Quick Safety & Hazard Reporting (Landing Page - 30 Seconds)
- Instant hazard/near-miss logging without login barriers.
- Fields: Category (Hazard, Near-Miss, GSE Damage, Personal Injury, FOD, Turnaround Delay), Location (Apron Stands 1–12, Baggage Reclaim, Passenger Check-in/Gates, GSE Workshop, Fueling Area), Description, Simulated Photo/Evidence upload.
- Fast toggle between "Anonymous Just Culture Report" and "Named Staff Report".
- Generates sequential tracking code: `RMF-SMS-2026-XXXX`.

#### B. Safety Report Sequence & Investigation Lifecycle
1. **Submitted**: Timestamped report enters Safety Officer inbox.
2. **Received & Acknowledged**: Safety Officer clicks acknowledgment, issuing official confirmation with timestamp and reference code.
3. **Formal Investigation**: Captures ramp conditions, human factors, weather, and turnaround flight details.
4. **Pre-Mitigation Risk Assessment**: Interactive ICAO 5×5 Matrix (Severity 1–5 vs. Likelihood A–E) calculating Initial Risk Index (e.g., `4B - High Risk`).
5. **Root Cause Analysis (RCA)**:
   - **Simple RCA**: Immediate cause, contributing factor, systemic/procedural gap.
   - **5-Whys RCA**: Dynamic 5-level recursive "Why?" causal chain leading to systemic root cause.
6. **CAPA Formulation**: Corrective Action (immediate containment) + Preventive Action (long-term recurrence prevention) assigned to Department Manager with target dates.
7. **Post-Mitigation (Residual) Risk Assessment**: Re-evaluates risk on the 5×5 matrix with mitigation in place (e.g., dropping from `4B - High` to `1E - Low/Acceptable`).
8. **Final Decision & Bulletin Issuance**: Safety & Quality Manager can click **"Issue Safety Bulletin / Operational Notice"** with auto reference number before formally signing off and closing the case.

#### C. Internal & External Quality Audits & 6-Stage Finding-to-Closure Cycle
- **Internal Audits**: Scheduled internal audits by discipline (ORM - Organization, PAX - Passenger, BAG - Baggage, RMP - Ramp Handling, LOD - Load Control), turnaround spot-checks, safety walks.
- **External Audits**: Registered audits from Civil Aviation Authority (ECAA), IATA ISAGO registrar, and Customer Airline Audits (e.g., EgyptAir, TUI, Neos, Air Cairo, Condor).
- **6-Stage Closed-Loop Finding Workflow**:
  `Finding Raised` $\rightarrow$ `HoD Acknowledged` $\rightarrow$ `RCA & CAPA Proposed by HoD` $\rightarrow$ `Safety & Quality Manager Review & Approval` $\rightarrow$ `Implementation & Evidence Upload` $\rightarrow$ `Effectiveness Audit, Bulletin Decision & Final Closure by SQM`.
- **Closure Action**: Option to publish an Internal Operational Notice (ION) directly from findings to alert ramp shifts.

#### D. Interactive Audit Calendar & Yearly Audit Plan
- **Interactive Calendar View**: Month, Week, and Agenda grid views displaying scheduled Internal and External audits tagged by color (Internal = Blue, External Airline = Purple, Regulatory/ECAA = Amber, ISAGO = Emerald).
- **Quick-View Drawer/Modal**: Click any audit date to view scope, lead auditor, checklist, status, and associated findings count.
- **Yearly Audit Plan Table**: Complete 12-month station audit schedule mapped across quarters (Q1-Q4) and disciplines (ORM, PAX, BAG, RMP, LOD), with status filters (Planned, In Progress, Completed, Overdue) and "Schedule New Audit" modal.

#### E. Safety Performance Indicators (SPI) & Targets (SPT) with Full CRUD
- **SPI/SPT Matrix**:
  - Indicator Name & Code (e.g., `SPI-01: Apron Ground Damage Rate`, `SPI-02: FOD Incidents on Ramp`, `SPI-03: GSE Breakdown during Turnaround`, `SPI-04: CAPA On-Time Closure Rate`, `SPI-05: Mandatory Occurrence Reports (MOR) timely submission`).
  - Unit of Measurement (Rate per 10k flights, absolute count, percentage).
  - Target Baseline & Safety Performance Target (SPT).
  - Alert Threshold (e.g. Warning at 80% of limit, Alert at 100%).
  - Current Performance Metric & Trend (Nominal, Warning, Alert).
- **Full CRUD Controls**: Add new SPI/SPT indicator, edit target thresholds, log monthly metric readings, and archive/delete indicators.

#### F. Safety Bulletins & Controlled Documents with Staff Acknowledgment
- **Document Library**: Filterable by Document Type:
  - Safety Bulletins (SB)
  - Internal Operational Notices (ION)
  - Station Standard Operating Procedures (SOP)
  - Regulatory Directives
- **Direct Case Issuance Integration**: Pre-populated modal triggered directly from resolved Safety Reports or Audit Findings, creating official notices with auto-generated reference number (`RMF-SB-2026-004` or `RMF-ION-2026-012`).
- **Staff Acknowledgment Verification Engine**:
  - Displays target departments and total required staff acknowledgments.
  - Interactive "Read & Acknowledge" button with digital signature and timestamp.
  - Acknowledgment audit log listing all acknowledged staff names, badge numbers, dates, and live completion progress bar (e.g., "42 of 50 Ramp Staff Acknowledged - 84%").

#### G. User Management, Departments & Roles Access Matrix
- **User Directory**: Searchable list of station personnel with Name, Staff ID, Email, Department, Assigned Role, and Active Status. Ability to add/edit users.
- **Department Configuration**: Manage organizational units (Operations [Ramp, Load Control, Passenger], Maintenance GSE, Safety & Quality, Training).
- **Roles & Permissions Access Matrix**: Interactive grid with switches governing View, Create, Investigate, Approve CAPA, Issue Bulletins, and Admin settings across all roles.

#### H. Management of Change (MoC) Module
- Built according to ICAO Doc 9859 Chapter 9 and IATA ISAGO ORM 1.4 requirements:
- **Change Initiation**: Change Title, Change Category, Department, Proposed Date.
- **Risk Assessment & Hazard Identification**: Evaluates operational hazards introduced by the change and mitigations.
- **Multi-Tier Approval Gateway**: Initiator Submission $\rightarrow$ HoD Review $\rightarrow$ Safety & Quality Review $\rightarrow$ Accountable Executive Final Authorization.
- **Implementation & Post-Change Review**: Tracking rollout status and 30-day post-change safety audit.

#### I. Configurable Management Review Report & Export (PDF / Word)
- **Executive SMS Management Review Builder**: Checkboxes to toggle sections:
  - [x] Executive Summary & Station Safety Policy
  - [x] SPI & SPT Performance vs Targets
  - [x] Safety Incident Trends & Pre/Post Risk Heatmap
  - [x] Internal & External Audit Non-Conformity Status
  - [x] CAPA Implementation Aging
  - [x] Safety Bulletins Issued & Staff Acknowledgment Rates
  - [x] Management of Change (MoC) Progress
  - [x] GSE Fleet Reliability & Tagging
  - [x] Staff Training & DGR Qualification Expiry Rates
- **Bilingual Arabic / English**: Real-time localized preview.
- **Export Formats**: PDF (print-ready stylesheet) and Word (`.doc` downloadable document).

#### J. GSE Fleet Safety & Defect Register
- Maintenance tagging: Green Tag (Fit for Service), Amber Tag (Maintenance Due), Red Tag (Grounded / Out of Service).
- Direct linking: Damage reports automatically tag equipment Red and open maintenance work orders.

#### K. Training & Competency Matrix
- Tracks IATA Dangerous Goods CBTA (Categories 7 & 8), Airside Driving Permit (ADP), Pushback & Headset endorsement, Load Control.
- Visual status: Green (Valid), Amber (< 30 days to expiry), Red (Expired). Recertification logger.

***

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct Case-to-Bulletin Issuance Workflow**
  - *Approach*: At the final closure step of any Safety Report or Audit Finding, a prominent "Issue Safety Bulletin / Operational Notice" action allows the Safety Manager to draft an official station notice in one click, pulling in incident summary and root cause lessons.
  - *Why*: Bridges the gap between investigation lessons learned and frontline awareness, fulfilling ICAO SMS Safety Promotion requirements.
- **Decision 2: Integrated Staff Acknowledgment Verification**
  - *Approach*: Each bulletin tracks individual user acknowledgments, rendering a live compliance rate and detailed audit log. Users can switch their active persona in the header to test acknowledging bulletins as different staff members.
  - *Why*: Critical for aviation compliance audits (ISAGO ORM 2.4 requires proof that personnel received and understood safety communications).
- **Decision 3: Full CRUD SPI/SPT Engine**
  - *Approach*: Allows managers to customize metrics, adjust target thresholds, record periodic data points, and view performance trends.
  - *Why*: Every ground handling station has unique carrier SLAs and seasonal target variations.

***

### 4. Technical Architecture & Data Strategy

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                       MARSA ALAM SQMS - DATA MODEL                            │
└───────────────────────────────────────────────────────────────────────────────┘
                                       │
     ┌─────────────────────────────────┼─────────────────────────────────┐
     ▼                                 ▼                                 ▼
┌───────────────────────────┐   ┌───────────────────────────┐   ┌───────────────────────────┐
│     SAFETY REPORTS        │   │       AUDITS & CAPA       │   │   MANAGEMENT OF CHANGE    │
│ - Frontline Submission    │   │ - Internal & External     │   │ - Change Initiation       │
│ - Officer Acknowledgment  │   │ - Interactive Calendar    │   │ - Hazard Identification   │
│ - Pre/Post 5x5 Matrix     │   │ - Annual Audit Plan       │   │ - Multi-tier Approvals    │
│ - Simple / 5-Whys RCA     │   │ - 6-Stage Finding-CAPA    │   │ - Implementation Review   │
│ - CAPA & Closure          │   │ - Evidence Upload         │   │                           │
│ - Issue Bulletin Button ──┼───┤ - Issue Notice Button ────┼───┤                           │
└─────────────┬─────────────┘   └─────────────┬─────────────┘   └─────────────┬─────────────┘
              │                               │                               │
              └───────────────────────────────┼───────────────────────────────┘
                                              │
     ┌────────────────────────────────────────┼────────────────────────────────────────┐
     ▼                                        ▼                                        ▼
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│     SAFETY BULLETINS      │      │        SPIs & SPTs        │      │ MANAGEMENT REVIEW BUILDER │
│ - Reference Numbering     │      │ - Full CRUD Management    │      │ - Configurable Checkboxes │
│ - Linked Incident/Finding │      │ - Target & Alert Levels   │      │ - Arabic & English engine │
│ - Staff Acknowledgment    │      │ - Trend Status Tracking   │      │ - Export to PDF & Word    │
│   Verification Audit Log  │      │ - Station Safety Index    │      │ - Complete Executive SPIs │
└───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
     │                                        │                                        │
     └────────────────────────────────────────┼────────────────────────────────────────┘
                                              │
     ┌────────────────────────────────────────┴────────────────────────────────────────┐
     ▼                                                                                 ▼
┌───────────────────────────┐                                       ┌───────────────────────────┐
│   USER & ACCESS MATRIX    │                                       │   GSE FLEET & TRAINING    │
│ - User Directory          │                                       │ - Green / Amber / Red Tag │
│ - Departments Config      │                                       │ - Defect Work Orders      │
│ - Role Permissions Matrix │                                       │ - DGR CBTA & ADP Matrix   │
│ - Active Persona Switch   │                                       │ - Recertification Logs    │
└───────────────────────────┘                                       └───────────────────────────┘
```

***

### 5. Implementation Sequence & Execution Steps

1. **Step 1 - Internationalization & Styling Engine**:
   - Comprehensive bi-directional dictionary (EN/AR) spanning all 11 modules: Quick Report, Safety Reports, Audits & Calendar, Finding CAPA, SPI/SPT CRUD, Safety Bulletins & Acknowledgment, MoC, GSE Fleet, Training Matrix, Management Review, and User/Role Matrix.
   - Dark/Light high-contrast themes.
2. **Step 2 - State Store with Full Mock Seed Data**:
   - Seed realistic RMF records: active apron incidents across Stands 1-12, scheduled audits across 2026 calendar, active Level 1/2 findings, full set of SPIs/SPTs, published Safety Bulletins with realistic staff acknowledgment lists, MoC cases, user roster, and GSE fleet.
   - LocalStorage synchronization with 1-click station reset.
3. **Step 3 - Frontline 30-Second Quick Report (Landing Page)**:
   - Zero-friction hazard logging, anonymous toggle, ICAO 5×5 matrix, photo simulator, and receipt code generator (`RMF-SMS-2026-XXXX`).
4. **Step 4 - Safety Report Sequence & Investigation Workspace**:
   - Complete 8-stage lifecycle: Acknowledge with timestamp $\rightarrow$ Pre-risk matrix $\rightarrow$ Simple or 5-Whys RCA toggle $\rightarrow$ CAPA assignment $\rightarrow$ Post-risk matrix $\rightarrow$ **"Issue Safety Bulletin" action button** $\rightarrow$ Closure sign-off.
5. **Step 5 - Audits Module: Interactive Calendar & Yearly Audit Plan**:
   - Visual calendar grid with internal/external color markers, date-click detail drawer, yearly schedule planner by quarter and discipline, and audit scheduler modal.
6. **Step 6 - 6-Stage Audit Finding & CAPA Engine**:
   - Interactive Finding-to-Closure cycle with evidence attachment, **"Issue Operational Notice" action button**, and SQM effectiveness audit.
7. **Step 7 - SPI & SPT Full CRUD Module**:
   - Indicator dashboard, create/edit modal for indicators, target levels, alert thresholds, and trend visualization.
8. **Step 8 - Safety Bulletins & Controlled Documents Module**:
   - Document repository, direct case issuance integration, staff acknowledgment logging with digital signature simulation and progress percentage.
9. **Step 9 - Management of Change (MoC) Module**:
   - MoC case tracker, hazard identification table, 4-tier approval sign-offs (HoD $\rightarrow$ SQM $\rightarrow$ AE), and post-implementation review.
10. **Step 10 - User Management, Departments & Roles Access Matrix**:
    - User table with role filters, department configuration, and interactive RBAC access matrix.
11. **Step 11 - Configurable Management Review Report Generator**:
    - Checkbox-driven section selector, live preview in English & Arabic, and instant export buttons for PDF (print styling) and Word (.doc format).
12. **Step 12 - GSE Defect Fleet, Training Matrix & Executive Analytics**:
    - Tagging system, DGR CBTA matrix, and station SPI analytics.
13. **Step 13 - Verification & Build Testing**:
    - Verify bidirectional layout and all interactive workflows.
    - Run `compile_applet` and verify zero errors.
