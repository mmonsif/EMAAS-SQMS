import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { 
  SafetyReport, 
  InvestigationLevel, 
  RiskAssessment, 
  StationRole, 
  ReportCategory,
  SimpleRCA,
  FileAttachment
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
  FileText, 
  Search, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  AlertOctagon, 
  ShieldAlert, 
  ShieldCheck, 
  ChevronRight, 
  UserCheck, 
  Calendar, 
  Paperclip, 
  Lock, 
  RefreshCw, 
  BellRing, 
  X, 
  Download, 
  Plane, 
  Filter,
  Check,
  RotateCcw,
  History,
  FileCheck
} from 'lucide-react';

export const SafetyReportsView: React.FC = () => {
  const { 
    language, 
    activeRole, 
    reports, 
    acknowledgeReport, 
    assignReportLevel, 
    startOrUpdateInvestigation, 
    submitCAPAPlan, 
    reviewCAPAPlan, 
    recordEffectiveness, 
    finalSignoffAndClose, 
    addReportAttachment,
    addSafetyReport,
    issueBulletinFromReport,
    setActiveRole
  } = useApp();

  const t = translations[language];

  // Quick Dashboard Filter Tabs
  type DashboardTab = 'all' | 'my_actions' | 'overdue' | 'approaching' | 'awaiting_level' | 'awaiting_review' | 'overview';
  const [activeTab, setActiveTab] = useState<DashboardTab>('all');

  // Search and Secondary Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  // Active Report Modal
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(null);
  const [modalActiveTab, setModalActiveTab] = useState<'workflow' | 'auditTrail' | 'attachments'>('workflow');

  // Airline Report Recording Modal
  const [showAirlineModal, setShowAirlineModal] = useState(false);
  const [airlineName, setAirlineName] = useState('EgyptAir');
  const [airlineRefNumber, setAirlineRefNumber] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [aircraftReg, setAircraftReg] = useState('');
  const [occurrenceLocation, setOccurrenceLocation] = useState('Stand 14 (Widebody)');
  const [airlineCategory, setAirlineCategory] = useState<ReportCategory>('hazard');
  const [airlineDescription, setAirlineDescription] = useState('');
  const [airlineReporterContact, setAirlineReporterContact] = useState('');

  // Step 3 Level Assignment State
  const [selectedLevel, setSelectedLevel] = useState<InvestigationLevel>('level_1');
  const [levelComments, setLevelComments] = useState('');

  // Step 4 Investigation State
  const [invSummary, setInvSummary] = useState('');
  const [existingProcedures, setExistingProcedures] = useState<string[]>([
    'RMF-SOP-RMP-04: GSE Pushback Clearance Area',
    'RMF-SOP-GSE-12: High-Pressure Hydraulic Inspection'
  ]);
  const [newProcedureInput, setNewProcedureInput] = useState('');
  const [currentMitigations, setCurrentMitigations] = useState('');
  const [preSev, setPreSev] = useState(4);
  const [preLike, setPreLike] = useState('B');
  const [assignedHoD, setAssignedHoD] = useState('Capt. Tarek Nabil (Head of Operations)');
  const [assignedHoDRole, setAssignedHoDRole] = useState<StationRole>('hod_ops');
  const [capaPlanDueDate, setCapaPlanDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });

  // Step 5 CAPA State
  const [rcaType, setRcaType] = useState<'simple' | 'five_whys'>('five_whys');
  const [directCause, setDirectCause] = useState('');
  const [contributing, setContributing] = useState('');
  const [systemicGap, setSystemicGap] = useState('');
  const [fiveWhys, setFiveWhys] = useState<string[]>([
    'Tug hydraulic hose sheared during pushback operation',
    'Connector fitting experienced high cyclic fatigue stress',
    'Maintenance interval for quick-release coupling was exceeded',
    'Spare parts shipment delayed from central GSE warehouse',
    'Preventive maintenance deferral process did not trigger airside alert'
  ]);
  const [corrective, setCorrective] = useState('');
  const [preventive, setPreventive] = useState('');
  const [capaAttachmentName, setCapaAttachmentName] = useState('CAPA_Engineering_Assessment.pdf');

  // Step 6 SQM Review State
  const [sqmReviewComments, setSqmReviewComments] = useState('');

  // Step 7 Effectiveness State
  const [isEffective, setIsEffective] = useState(true);
  const [effectivenessNotes, setEffectivenessNotes] = useState('');
  const [postSev, setPostSev] = useState(2);
  const [postLike, setPostLike] = useState('E');
  const [effAttachmentName, setEffAttachmentName] = useState('RMF_Post_Mitigation_Verification.pdf');

  // Step 8 Sign-off & Closure State
  const [closureNotes, setClosureNotes] = useState('All corrective and preventive actions verified. Residual risk within ALARP criteria.');
  const [showBulletinModal, setShowBulletinModal] = useState(false);
  const [bulletinTitle, setBulletinTitle] = useState('');
  const [bulletinSummary, setBulletinSummary] = useState('');
  const [bulletinActions, setBulletinActions] = useState('Mandate visual inspection of pushback hydraulic hoses prior to every departure.');

  // File Attachment Upload Simulation State
  const [newFileName, setNewFileName] = useState('');
  const [newFileCategory, setNewFileCategory] = useState<FileAttachment['category']>('investigation');

  // Open & Hydrate Report Modal
  const openReportModal = (report: SafetyReport) => {
    setSelectedReport(report);
    setModalActiveTab('workflow');

    // Hydrate Step 3
    if (report.level) {
      setSelectedLevel(report.level);
    } else {
      setSelectedLevel('level_1');
    }
    setLevelComments('');

    // Hydrate Step 4
    setInvSummary(report.investigationSummary || '');
    if (report.existingProcedures && report.existingProcedures.length > 0) {
      setExistingProcedures(report.existingProcedures);
    }
    setCurrentMitigations(report.currentMitigations || '');
    if (report.preMitigationRisk) {
      setPreSev(report.preMitigationRisk.severity);
      setPreLike(report.preMitigationRisk.likelihood);
    } else {
      setPreSev(4);
      setPreLike('B');
    }
    if (report.assignedHoD) setAssignedHoD(report.assignedHoD);
    if (report.assignedHoDRole) setAssignedHoDRole(report.assignedHoDRole);
    if (report.capaPlanDueDate) setCapaPlanDueDate(report.capaPlanDueDate);

    // Hydrate Step 5
    if (report.rcaType) setRcaType(report.rcaType);
    if (report.simpleRca) {
      setDirectCause(report.simpleRca.directCause);
      setContributing(report.simpleRca.contributingFactor);
      setSystemicGap(report.simpleRca.systemicGap);
    }
    if (report.fiveWhysRca && report.fiveWhysRca.length > 0) {
      setFiveWhys(report.fiveWhysRca);
    }
    if (report.capa) {
      setCorrective(report.capa.correctiveAction);
      setPreventive(report.capa.preventiveAction);
    } else {
      setCorrective('');
      setPreventive('');
    }

    // Hydrate Step 6
    setSqmReviewComments(report.sqmPlanReviewComments || '');

    // Hydrate Step 7
    if (report.effectivenessEvaluation) {
      setIsEffective(report.effectivenessEvaluation.isEffective);
      setEffectivenessNotes(report.effectivenessEvaluation.evaluationNotes);
    } else {
      setIsEffective(true);
      setEffectivenessNotes('');
    }
    if (report.residualRisk) {
      setPostSev(report.residualRisk.severity);
      setPostLike(report.residualRisk.likelihood);
    } else {
      setPostSev(2);
      setPostLike('E');
    }

    // Hydrate Step 8
    setClosureNotes(report.closureNotes || 'All corrective and preventive actions verified. Residual risk within ALARP criteria.');
  };

  // Synchronize modal state if reports change in context
  const currentActiveReport = useMemo(() => {
    if (!selectedReport) return null;
    return reports.find(r => r.id === selectedReport.id) || selectedReport;
  }, [reports, selectedReport]);

  // Dynamic Dashboard Metrics
  const metrics = useMemo(() => {
    let openCount = 0;
    let overdueCount = 0;
    let approachingCount = 0;
    let awaitingLevelCount = 0;
    let awaitingReviewCount = 0;
    let myPendingCount = 0;
    let closedCount = 0;
    let level1Count = 0;
    let level2Count = 0;
    let level3Count = 0;

    reports.forEach(r => {
      const isClosed = r.lifecycleStatus === 'closed';
      if (isClosed) {
        closedCount++;
      } else {
        openCount++;
      }

      if (r.level === 'level_1') level1Count++;
      if (r.level === 'level_2') level2Count++;
      if (r.level === 'level_3') level3Count++;

      // Overdue & Approaching calculation
      if (r.targetClosureDate && !isClosed) {
        const ov = getOverdueCalculation(r.targetClosureDate, isClosed);
        if (ov.isOverdue) overdueCount++;
        if (ov.isApproaching) approachingCount++;
      }

      // Awaiting Level (acknowledged or submitted without level)
      if (r.lifecycleStatus === 'acknowledged' || (r.lifecycleStatus === 'submitted' && !r.level)) {
        awaitingLevelCount++;
      }

      // Awaiting Review (plan_under_review, pending_signoff)
      if (r.lifecycleStatus === 'plan_under_review' || r.lifecycleStatus === 'pending_signoff') {
        awaitingReviewCount++;
      }

      // My Pending Actions by Role
      if (!isClosed) {
        if (activeRole === 'hod_safety' || activeRole === 'ae' || activeRole === 'ghm') {
          // SQM has actions at acknowledged (level), plan_under_review (review), pending_signoff (closure)
          if (['acknowledged', 'plan_under_review', 'pending_signoff'].includes(r.lifecycleStatus)) {
            myPendingCount++;
          }
        } else if (activeRole === 'safety_officer') {
          // Safety officer has actions at submitted (ack), level_assigned/under_investigation (investigate), effectiveness_pending
          if (['submitted', 'level_assigned', 'under_investigation', 'plan_approved', 'effectiveness_pending'].includes(r.lifecycleStatus)) {
            myPendingCount++;
          }
        } else if (activeRole === 'hod_ops' || activeRole === 'hod_maint' || activeRole === 'hod_training' || activeRole === 'ramp_supervisor') {
          // HoD has actions at plan_pending, plan_returned
          if (['plan_pending', 'plan_returned'].includes(r.lifecycleStatus)) {
            myPendingCount++;
          }
        } else if (activeRole === 'field_staff') {
          if (r.lifecycleStatus === 'submitted') {
            myPendingCount++;
          }
        }
      }
    });

    return {
      openCount,
      overdueCount,
      approachingCount,
      awaitingLevelCount,
      awaitingReviewCount,
      myPendingCount,
      closedCount,
      level1Count,
      level2Count,
      level3Count
    };
  }, [reports, activeRole]);

  // Filtered reports based on activeTab, search, and dropdown filters
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const isClosed = r.lifecycleStatus === 'closed';
      const ov = getOverdueCalculation(r.targetClosureDate, isClosed);

      // Primary Tab Filter
      if (activeTab === 'overdue' && !ov.isOverdue) return false;
      if (activeTab === 'approaching' && !ov.isApproaching) return false;
      if (activeTab === 'awaiting_level' && r.lifecycleStatus !== 'acknowledged') return false;
      if (activeTab === 'awaiting_review' && !['plan_under_review', 'pending_signoff'].includes(r.lifecycleStatus)) return false;
      
      if (activeTab === 'my_actions') {
        if (isClosed) return false;
        if (activeRole === 'hod_safety' || activeRole === 'ae' || activeRole === 'ghm') {
          if (!['acknowledged', 'plan_under_review', 'pending_signoff'].includes(r.lifecycleStatus)) return false;
        } else if (activeRole === 'safety_officer') {
          if (!['submitted', 'level_assigned', 'under_investigation', 'plan_approved', 'effectiveness_pending'].includes(r.lifecycleStatus)) return false;
        } else if (['hod_ops', 'hod_maint', 'hod_training', 'ramp_supervisor'].includes(activeRole)) {
          if (!['plan_pending', 'plan_returned'].includes(r.lifecycleStatus)) return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;

      // Source filter
      if (sourceFilter !== 'all' && r.reportSource !== sourceFilter) return false;

      // Level filter
      if (levelFilter !== 'all' && r.level !== levelFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = r.id.toLowerCase().includes(q);
        const matchLoc = r.location.toLowerCase().includes(q);
        const matchDesc = r.description.toLowerCase().includes(q);
        const matchFlight = r.flightNumber?.toLowerCase().includes(q);
        const matchAirline = r.airlineName?.toLowerCase().includes(q);
        const matchGse = r.gseIdLinked?.toLowerCase().includes(q);
        return matchId || matchLoc || matchDesc || matchFlight || matchAirline || matchGse;
      }

      return true;
    });
  }, [reports, activeTab, categoryFilter, sourceFilter, levelFilter, searchQuery, activeRole]);

  // Handle Airline Report Submission
  const handleRecordAirlineReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!airlineDescription.trim()) return;

    addSafetyReport({
      reportSource: 'airline_report',
      airlineName,
      airlineRefNumber: airlineRefNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      reporterType: 'identified',
      reporterName: airlineReporterContact || `${airlineName} Station Rep`,
      reporterBadge: 'AIRLINE-STAFF',
      department: 'Operations - Ramp Services',
      category: airlineCategory,
      location: occurrenceLocation,
      standNumber: occurrenceLocation.includes('Stand') ? occurrenceLocation.split(' ')[1] : '14',
      description: airlineDescription,
      aircraftReg: aircraftReg || undefined,
      flightNumber: flightNumber || undefined
    });

    setShowAirlineModal(false);
    setAirlineDescription('');
    setFlightNumber('');
    setAircraftReg('');
    setAirlineRefNumber('');
  };

  // Add simulated attachment
  const handleAddAttachment = () => {
    if (!selectedReport || !newFileName.trim()) return;
    addReportAttachment(selectedReport.id, {
      fileName: newFileName,
      fileSize: '1.2 MB',
      fileType: 'application/pdf',
      category: newFileCategory
    });
    setNewFileName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              RMF / HESH GROUND HANDLING SQMS
            </span>
            <span className="text-xs text-slate-400">
              ICAO Annex 19 & IATA ISAGO Compliant
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
            <FileText className="w-6 h-6 text-blue-400" />
            <span>{t.safetyReports.title}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.safetyReports.subtitle}
          </p>
        </div>

        {/* Action Button: Record Airline Report */}
        <div className="flex items-center gap-2">
          {canUserPerformStep('acknowledge', activeRole) && (
            <button
              onClick={() => setShowAirlineModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Plane className="w-4 h-4" />
              <span>Record Airline Safety Report</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div 
          onClick={() => setActiveTab('all')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'all' 
              ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10' 
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Reports</div>
          <div className="text-2xl font-black text-white mt-1">{reports.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
            <span>{metrics.openCount} Open</span> • <span>{metrics.closedCount} Closed</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('my_actions')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'my_actions' 
              ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/10' 
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center justify-between">
            <span>My Actions</span>
            {metrics.myPendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            )}
          </div>
          <div className="text-2xl font-black text-purple-300 mt-1">{metrics.myPendingCount}</div>
          <div className="text-[10px] text-purple-400/80 mt-0.5 truncate">
            Pending {activeRole.toUpperCase()} role
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('overdue')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'overdue' 
              ? 'bg-red-950/50 border-red-500 shadow-md shadow-red-500/10' 
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>Overdue</span>
          </div>
          <div className="text-2xl font-black text-red-400 mt-1">{metrics.overdueCount}</div>
          <div className="text-[10px] text-red-400/80 mt-0.5">
            Exceeded SLA target
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('approaching')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'approaching' 
              ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-500/10' 
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Due Soon</span>
          </div>
          <div className="text-2xl font-black text-amber-300 mt-1">{metrics.approachingCount}</div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">
            Within 7 days
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('awaiting_level')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'awaiting_level' 
              ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10' 
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Awaiting Level</div>
          <div className="text-2xl font-black text-cyan-300 mt-1">{metrics.awaitingLevelCount}</div>
          <div className="text-[10px] text-cyan-400/80 mt-0.5">
            Requires SQM SLA
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('awaiting_review')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'awaiting_review' 
              ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10' 
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Plan / Signoff</div>
          <div className="text-2xl font-black text-emerald-300 mt-1">{metrics.awaitingReviewCount}</div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">
            Ready for review
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-md">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Case ID, Flight, Airline, GSE, Stand, Description..."
            className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="level_1">Major (Level 1 - 30d)</option>
            <option value="level_2">Minor (Level 2 - 60d)</option>
            <option value="level_3">Observation (Level 3 - 90d)</option>
          </select>

          {/* Intake Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Intake Sources</option>
            <option value="frontline_agent">Frontline Staff Report</option>
            <option value="airline_report">Airline Received Report</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="hazard">Hazard</option>
            <option value="near_miss">Near-Miss</option>
            <option value="gse_damage">GSE Damage</option>
            <option value="personal_injury">Personal Injury</option>
            <option value="fod">FOD</option>
            <option value="delay">Safety Delay</option>
            <option value="spill">Fuel / Hydraulic Spill</option>
          </select>

          {/* Reset Filters */}
          {(categoryFilter !== 'all' || sourceFilter !== 'all' || levelFilter !== 'all' || searchQuery.trim() || activeTab !== 'all') && (
            <button
              onClick={() => {
                setActiveTab('all');
                setCategoryFilter('all');
                setSourceFilter('all');
                setLevelFilter('all');
                setSearchQuery('');
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Case ID & Intake</th>
                <th className="py-3 px-4">Level & Target Closure</th>
                <th className="py-3 px-4">Category & Location</th>
                <th className="py-3 px-4">Initial Risk</th>
                <th className="py-3 px-4">Investigation Stage</th>
                <th className="py-3 px-4 text-right rtl:text-left">Investigation File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-medium text-slate-400">No safety reports match the selected filters</p>
                    <p className="text-[11px] text-slate-500 mt-1">Try resetting search query or switching dashboard tabs</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const levelMeta = getLevelMetadata(report.level, language);
                  const isClosed = report.lifecycleStatus === 'closed';
                  const overdue = getOverdueCalculation(report.targetClosureDate, isClosed);
                  const statusMeta = getStatusMetadata(report.lifecycleStatus, language);
                  const risk = report.preMitigationRisk 
                    ? calculateRiskIndex(report.preMitigationRisk.severity, report.preMitigationRisk.likelihood)
                    : null;

                  return (
                    <tr key={report.id} className="hover:bg-slate-850/60 transition-colors">
                      
                      {/* Case ID & Source */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-blue-400">{report.id}</span>
                          {report.reportSource === 'airline_report' ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {report.airlineName || 'Airline'}
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              Frontline
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {report.timestamp}
                        </div>
                      </td>

                      {/* Level & SLA Target Closure Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${levelMeta.badgeClass}`}>
                            {levelMeta.levelCode} ({levelMeta.days}d)
                          </span>
                        </div>
                        {report.targetClosureDate ? (
                          <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px]">
                            <span className="text-slate-400">Due: {report.targetClosureDate}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] ${overdue.badgeClass}`}>
                              {overdue.statusText}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-cyan-400 italic block mt-1">
                            Pending SQM Classification
                          </span>
                        )}
                      </td>

                      {/* Category & Location */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold capitalize text-slate-200 block">
                          {report.category.replace('_', ' ')}
                        </span>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{report.location}</span>
                          {report.standNumber && (
                            <span className="text-slate-500">Stand {report.standNumber}</span>
                          )}
                          {report.flightNumber && (
                            <span className="text-[10px] font-mono text-blue-400">
                              Flt: {report.flightNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Initial Risk */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {risk ? (
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${risk.colorClass}`}>
                            {risk.score} ({risk.level})
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Investigation Stage */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusMeta.colorClass}`}>
                          {statusMeta.shortLabel}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Role: <strong className="text-slate-300">{statusMeta.responsible}</strong>
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right rtl:text-left whitespace-nowrap">
                        <button
                          onClick={() => openReportModal(report)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5 ml-auto rtl:ml-0 rtl:mr-auto shadow-sm"
                        >
                          <span>Case File</span>
                          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8-STEP SAFETY INVESTIGATION CASE FILE MODAL                               */}
      {/* ========================================================================= */}
      {currentActiveReport && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl text-slate-100 animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60 rounded-t-2xl shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-blue-400">
                      {currentActiveReport.id}
                    </span>
                    
                    {/* Level Badge */}
                    {(() => {
                      const meta = getLevelMetadata(currentActiveReport.level, language);
                      return (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${meta.badgeClass}`}>
                          {meta.title}
                        </span>
                      );
                    })()}

                    {/* Status Badge */}
                    {(() => {
                      const st = getStatusMetadata(currentActiveReport.lifecycleStatus, language);
                      return (
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${st.colorClass}`}>
                          {st.label}
                        </span>
                      );
                    })()}

                    {/* Overdue / Countdown Badge */}
                    {currentActiveReport.targetClosureDate && (
                      (() => {
                        const ov = getOverdueCalculation(currentActiveReport.targetClosureDate, currentActiveReport.lifecycleStatus === 'closed');
                        return (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${ov.badgeClass}`}>
                            {ov.statusText}
                          </span>
                        );
                      })()
                    )}
                  </div>

                  <h2 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
                    <span>{t.safetyReports.detailModal.title}</span>
                  </h2>

                  {/* Summary Bar */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                    <span>Source: <strong className="text-slate-200">{currentActiveReport.reportSource === 'airline_report' ? `Airline Report (${currentActiveReport.airlineName})` : 'Frontline Staff'}</strong></span>
                    <span>Location: <strong className="text-slate-200">{currentActiveReport.location}</strong></span>
                    <span>Date: <strong className="font-mono text-slate-200">{currentActiveReport.timestamp}</strong></span>
                    {currentActiveReport.flightNumber && <span>Flight: <strong className="font-mono text-blue-300">{currentActiveReport.flightNumber}</strong></span>}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Tabs Navigation */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => setModalActiveTab('workflow')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    modalActiveTab === 'workflow' 
                      ? 'bg-blue-600 text-white shadow' 
                      : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t.safetyReports.detailModal.tabs.workflow}</span>
                </button>

                <button
                  onClick={() => setModalActiveTab('auditTrail')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    modalActiveTab === 'auditTrail' 
                      ? 'bg-blue-600 text-white shadow' 
                      : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>{t.safetyReports.detailModal.tabs.auditTrail} ({currentActiveReport.auditTrail.length})</span>
                </button>

                <button
                  onClick={() => setModalActiveTab('attachments')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    modalActiveTab === 'attachments' 
                      ? 'bg-blue-600 text-white shadow' 
                      : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                  }`}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{t.safetyReports.detailModal.tabs.attachments} ({currentActiveReport.attachments.length})</span>
                </button>
              </div>
            </div>

            {/* Modal Body Container */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* ================================================================= */}
              {/* TAB 1: WORKFLOW (8-STEP LIFECYCLE)                                */}
              {/* ================================================================= */}
              {modalActiveTab === 'workflow' && (
                <div className="space-y-6">

                  {/* Active Step Indicator Banner */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
                        {getStatusMetadata(currentActiveReport.lifecycleStatus, language).stepNumber}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          Current Milestone: {getStatusMetadata(currentActiveReport.lifecycleStatus, language).label}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Responsible Persona: <span className="text-blue-300 font-semibold">{getStatusMetadata(currentActiveReport.lifecycleStatus, language).responsible}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right rtl:text-left">
                      <span className="text-[11px] text-slate-400 block">Logged-in Active Persona:</span>
                      <span className="text-xs font-mono font-bold text-white capitalize bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {activeRole.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* STEP 1: Submission & Intake */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                        <span>{t.safetyReports.detailModal.step1}</span>
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Logged {currentActiveReport.timestamp}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <p className="text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                        {currentActiveReport.description}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 pt-1">
                        <div>
                          <span className="block text-slate-500">Category:</span>
                          <span className="font-semibold text-slate-200 capitalize">{currentActiveReport.category.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500">Location / Stand:</span>
                          <span className="font-semibold text-slate-200">{currentActiveReport.location}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500">GSE Linked:</span>
                          <span className="font-mono text-amber-400">{currentActiveReport.gseIdLinked || 'None'}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500">Reporter:</span>
                          <span className="font-semibold text-slate-200">
                            {currentActiveReport.reporterType === 'identified' ? currentActiveReport.reporterName : 'Anonymous (Just Culture)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STEP 2: Receipt & Acknowledgment */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          currentActiveReport.acknowledgedAt ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>2</span>
                        <span>{t.safetyReports.detailModal.step2}</span>
                      </h3>
                      {currentActiveReport.acknowledgedAt ? (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Confirmed {currentActiveReport.acknowledgedAt}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-400 animate-pulse">
                          Pending Acknowledgment
                        </span>
                      )}
                    </div>

                    {currentActiveReport.lifecycleStatus === 'submitted' ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <p className="text-xs text-slate-400">
                          Confirm official S&Q intake and verify report completeness before SQM Level classification.
                        </p>
                        {canUserPerformStep('acknowledge', activeRole) ? (
                          <button
                            onClick={() => acknowledgeReport(currentActiveReport.id, `${activeRole.toUpperCase()} Officer`)}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition-colors whitespace-nowrap"
                          >
                            {t.safetyReports.detailModal.acknowledgeBtn}
                          </button>
                        ) : (
                          <div className="text-[11px] text-amber-400/90 italic flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Action restricted to Safety Officer or S&Q Member</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 flex items-center justify-between">
                        <span>Receipt confirmed by: <strong className="text-blue-300">{currentActiveReport.acknowledgedBy || 'Safety Officer'}</strong></span>
                        <span className="font-mono text-[11px] text-slate-400">{currentActiveReport.acknowledgedAt}</span>
                      </div>
                    )}
                  </div>

                  {/* STEP 3: Level Classification (SQM Only) */}
                  <div className={`border rounded-xl p-4 space-y-3 transition-colors ${
                    currentActiveReport.lifecycleStatus === 'acknowledged'
                      ? 'bg-blue-950/20 border-blue-500/50 shadow-md'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          currentActiveReport.level ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>3</span>
                        <span>{t.safetyReports.detailModal.step3}</span>
                      </h3>
                      {currentActiveReport.level ? (
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getLevelMetadata(currentActiveReport.level, language).badgeClass}`}>
                            {getLevelMetadata(currentActiveReport.level, language).title}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Assigned {currentActiveReport.levelAssignedAt}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold text-cyan-400 animate-pulse">
                          SQM Level Classification Required
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400">
                      {t.safetyReports.detailModal.levelHelp}
                    </p>

                    {/* If Level has not been assigned or user is SQM wanting to update */}
                    {(!currentActiveReport.level || currentActiveReport.lifecycleStatus === 'acknowledged') ? (
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          
                          {/* Level 1 Major */}
                          <button
                            type="button"
                            onClick={() => setSelectedLevel('level_1')}
                            className={`p-3 rounded-xl border text-left rtl:text-right transition-all ${
                              selectedLevel === 'level_1'
                                ? 'bg-red-950/40 border-red-500 shadow-md text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="text-xs font-black text-red-400">Major – Level 1</div>
                            <div className="text-[11px] text-slate-300 mt-0.5 font-bold">30 Days Closure SLA</div>
                            <div className="text-[10px] text-slate-400 mt-1">High risk to aircraft or personnel</div>
                          </button>

                          {/* Level 2 Minor */}
                          <button
                            type="button"
                            onClick={() => setSelectedLevel('level_2')}
                            className={`p-3 rounded-xl border text-left rtl:text-right transition-all ${
                              selectedLevel === 'level_2'
                                ? 'bg-amber-950/40 border-amber-500 shadow-md text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="text-xs font-black text-amber-400">Minor – Level 2</div>
                            <div className="text-[11px] text-slate-300 mt-0.5 font-bold">60 Days Closure SLA</div>
                            <div className="text-[10px] text-slate-400 mt-1">Operational non-conformity</div>
                          </button>

                          {/* Level 3 Observation */}
                          <button
                            type="button"
                            onClick={() => setSelectedLevel('level_3')}
                            className={`p-3 rounded-xl border text-left rtl:text-right transition-all ${
                              selectedLevel === 'level_3'
                                ? 'bg-blue-950/40 border-blue-500 shadow-md text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="text-xs font-black text-blue-400">Observation – Level 3</div>
                            <div className="text-[11px] text-slate-300 mt-0.5 font-bold">90 Days Closure SLA</div>
                            <div className="text-[10px] text-slate-400 mt-1">Continuous improvement & safety trend</div>
                          </button>
                        </div>

                        {/* Calculated Target Date Preview */}
                        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-400">Calculated Target Closure Date:</span>
                          <span className="font-mono font-bold text-white">
                            {calculateTargetClosureDate(new Date().toISOString().split('T')[0], selectedLevel)}
                          </span>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">SQM Level Classification Directives</label>
                          <input
                            type="text"
                            value={levelComments}
                            onChange={(e) => setLevelComments(e.target.value)}
                            placeholder="Optional comments for safety investigators..."
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                          />
                        </div>

                        {canUserPerformStep('level', activeRole) ? (
                          <button
                            onClick={() => assignReportLevel(currentActiveReport.id, selectedLevel, levelComments, 'Dr. Khaled Fawzy (SQM)')}
                            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>{t.safetyReports.detailModal.assignLevelBtn}</span>
                          </button>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                            <Lock className="w-4 h-4 shrink-0" />
                            <span>{t.safetyReports.detailModal.sqmOnlyNotice}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Mandated Closure Deadline:</span>
                          <span className="font-mono font-bold text-emerald-400">{currentActiveReport.targetClosureDate}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Assigned by:</span>
                          <span className="text-slate-300">{currentActiveReport.levelAssignedBy}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* STEP 4: Investigation (S&Q) */}
                  <div className={`border rounded-xl p-4 space-y-3 transition-colors ${
                    ['level_assigned', 'under_investigation'].includes(currentActiveReport.lifecycleStatus)
                      ? 'bg-blue-950/20 border-blue-500/50 shadow-md'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          currentActiveReport.preMitigationRisk ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>4</span>
                        <span>{t.safetyReports.detailModal.step4}</span>
                      </h3>
                      {currentActiveReport.preMitigationRisk && (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${calculateRiskIndex(currentActiveReport.preMitigationRisk.severity, currentActiveReport.preMitigationRisk.likelihood).colorClass}`}>
                          Initial Risk: {currentActiveReport.preMitigationRisk.scoreCode} ({currentActiveReport.preMitigationRisk.level})
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 text-xs">
                      
                      {/* Investigation Summary Narrative */}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Investigation Findings & Operational Sequence</label>
                        <textarea
                          rows={2}
                          value={invSummary}
                          onChange={(e) => setInvSummary(e.target.value)}
                          placeholder="Detail findings from ramp CCTV, telemetry, ground equipment inspections..."
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>

                      {/* Existing Procedures Checklist */}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">{t.safetyReports.detailModal.existingProcedures}</label>
                        <div className="space-y-1.5 mb-2">
                          {existingProcedures.map((proc, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 text-[11px] text-slate-300">
                              <span className="font-mono">{proc}</span>
                              <button
                                type="button"
                                onClick={() => setExistingProcedures(prev => prev.filter((_, i) => i !== idx))}
                                className="text-slate-500 hover:text-red-400 text-xs"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newProcedureInput}
                            onChange={(e) => setNewProcedureInput(e.target.value)}
                            placeholder="Add SOP reference (e.g. RMF-SOP-LOD-02)..."
                            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newProcedureInput.trim()) {
                                setExistingProcedures([...existingProcedures, newProcedureInput.trim()]);
                                setNewProcedureInput('');
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-white"
                          >
                            Add SOP
                          </button>
                        </div>
                      </div>

                      {/* Current Immediate Mitigations */}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">{t.safetyReports.detailModal.currentMitigations}</label>
                        <input
                          type="text"
                          value={currentMitigations}
                          onChange={(e) => setCurrentMitigations(e.target.value)}
                          placeholder="E.g. Grounded tug #04, apron FOD sweep conducted, personnel retrained on pushback clearance"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>

                      {/* Initial Risk Matrix (ICAO 5x5) */}
                      <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                            {t.safetyReports.detailModal.initialRiskIndex}
                          </span>
                          <div className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${calculateRiskIndex(preSev, preLike).colorClass}`}>
                            {calculateRiskIndex(preSev, preLike).score} – {calculateRiskIndex(preSev, preLike).level}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">
                              Severity (1 to 5): {preSev} ({preSev === 5 ? 'Catastrophic' : preSev === 4 ? 'Major' : preSev === 3 ? 'Moderate' : preSev === 2 ? 'Minor' : 'Negligible'})
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={preSev}
                              onChange={(e) => setPreSev(Number(e.target.value))}
                              className="w-full accent-blue-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">
                              Likelihood (A to E): {preLike} ({preLike === 'A' ? 'Frequent' : preLike === 'B' ? 'Occasional' : preLike === 'C' ? 'Remote' : preLike === 'D' ? 'Improbable' : 'Extremely Improbable'})
                            </label>
                            <div className="grid grid-cols-5 gap-1">
                              {['A', 'B', 'C', 'D', 'E'].map(lvl => (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => setPreLike(lvl)}
                                  className={`py-1 rounded text-xs font-mono font-bold transition-colors ${
                                    preLike === lvl ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Assign HoD and CAPA Due Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">{t.safetyReports.detailModal.assignHoDLabel}</label>
                          <select
                            value={assignedHoDRole}
                            onChange={(e) => {
                              const role = e.target.value as StationRole;
                              setAssignedHoDRole(role);
                              if (role === 'hod_ops') setAssignedHoD('Capt. Tarek Nabil (Head of Operations)');
                              else if (role === 'hod_maint') setAssignedHoD('Eng. Yasser Helmy (Head of GSE Maintenance)');
                              else if (role === 'hod_training') setAssignedHoD('Hesham Barakat (Head of Training)');
                              else setAssignedHoD('Shift Supervisor');
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                          >
                            <option value="hod_ops">Operations Department (Capt. Tarek Nabil)</option>
                            <option value="hod_maint">GSE Fleet Maintenance (Eng. Yasser Helmy)</option>
                            <option value="hod_training">Training & Recertification (Hesham Barakat)</option>
                            <option value="ramp_supervisor">Ramp Services Supervisor (Hassan Salem)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">{t.safetyReports.detailModal.capaDueDateLabel}</label>
                          <input
                            type="date"
                            value={capaPlanDueDate}
                            onChange={(e) => setCapaPlanDueDate(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      {canUserPerformStep('investigate', activeRole) ? (
                        <button
                          type="button"
                          onClick={() => {
                            const risk = {
                              severity: preSev,
                              likelihood: preLike,
                              scoreCode: calculateRiskIndex(preSev, preLike).score,
                              level: calculateRiskIndex(preSev, preLike).level
                            };
                            startOrUpdateInvestigation(currentActiveReport.id, {
                              investigationSummary: invSummary,
                              existingProcedures,
                              currentMitigations,
                              preMitigationRisk: risk,
                              assignedHoD,
                              assignedHoDRole,
                              capaPlanDueDate
                            });
                          }}
                          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>{t.safetyReports.detailModal.saveInvestigationBtn}</span>
                        </button>
                      ) : (
                        <div className="text-[11px] text-amber-400/90 italic flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Investigation is led by S&Q Department</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* STEP 5: CAPA Plan (Assigned HoD) */}
                  <div className={`border rounded-xl p-4 space-y-3 transition-colors ${
                    ['plan_pending', 'plan_returned'].includes(currentActiveReport.lifecycleStatus)
                      ? 'bg-purple-950/20 border-purple-500/50 shadow-md'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          currentActiveReport.capa ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>5</span>
                        <span>{t.safetyReports.detailModal.step5}</span>
                      </h3>
                      {currentActiveReport.lifecycleStatus === 'plan_returned' ? (
                        <span className="text-[10px] font-bold text-rose-400 animate-pulse bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                          Returned by SQM for Revision
                        </span>
                      ) : currentActiveReport.capa ? (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Submitted
                        </span>
                      ) : (
                        <span className="text-[10px] text-purple-400 font-semibold">
                          Assigned to: {currentActiveReport.assignedHoD || 'HoD'}
                        </span>
                      )}
                    </div>

                    {currentActiveReport.sqmPlanReviewComments && currentActiveReport.lifecycleStatus === 'plan_returned' && (
                      <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/50 text-rose-300 text-xs">
                        <strong>SQM Revision Directives:</strong> {currentActiveReport.sqmPlanReviewComments}
                      </div>
                    )}

                    <div className="space-y-3 text-xs">
                      
                      {/* RCA Method Selector */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300">{t.safetyReports.detailModal.rcaMethod}</span>
                        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => setRcaType('simple')}
                            className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                              rcaType === 'simple' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {t.safetyReports.detailModal.rcaSimple}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRcaType('five_whys')}
                            className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                              rcaType === 'five_whys' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {t.safetyReports.detailModal.rcaFiveWhys}
                          </button>
                        </div>
                      </div>

                      {/* RCA Inputs */}
                      {rcaType === 'simple' ? (
                        <div className="space-y-2">
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-0.5">{t.safetyReports.detailModal.directCause}</label>
                            <input
                              type="text"
                              value={directCause}
                              onChange={(e) => setDirectCause(e.target.value)}
                              placeholder="Direct physical or human action (e.g. Hydraulic coupling pin broke)"
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-0.5">{t.safetyReports.detailModal.contributing}</label>
                            <input
                              type="text"
                              value={contributing}
                              onChange={(e) => setContributing(e.target.value)}
                              placeholder="Environmental, high workload, or turnaround rush factor"
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-0.5">{t.safetyReports.detailModal.systemicGap}</label>
                            <input
                              type="text"
                              value={systemicGap}
                              onChange={(e) => setSystemicGap(e.target.value)}
                              placeholder="Deficiency in SOP, training recurrence, or inspection interval"
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {fiveWhys.map((why, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-16 shrink-0 font-mono text-[11px] text-purple-400 font-bold">
                                Why #{idx + 1}:
                              </span>
                              <input
                                type="text"
                                value={why}
                                onChange={(e) => {
                                  const updated = [...fiveWhys];
                                  updated[idx] = e.target.value;
                                  setFiveWhys(updated);
                                }}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Corrective & Preventive Action */}
                      <div className="space-y-2 pt-1">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-0.5">{t.safetyReports.detailModal.corrective}</label>
                          <textarea
                            rows={2}
                            value={corrective}
                            onChange={(e) => setCorrective(e.target.value)}
                            placeholder="Immediate action to contain hazard (e.g. ground vehicle, clean apron spill, notify ATC)"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400 block mb-0.5">{t.safetyReports.detailModal.preventive}</label>
                          <textarea
                            rows={2}
                            value={preventive}
                            onChange={(e) => setPreventive(e.target.value)}
                            placeholder="Long-term systemic fix (e.g. revise SOP, mandate dual sign-off, calibrate torque tools)"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                          />
                        </div>
                      </div>

                      {/* Submit CAPA Button */}
                      {canUserPerformStep('submit_capa', activeRole) ? (
                        <button
                          type="button"
                          onClick={() => {
                            const simple: SimpleRCA | undefined = rcaType === 'simple' ? {
                              directCause,
                              contributingFactor: contributing,
                              systemicGap
                            } : undefined;

                            submitCAPAPlan(currentActiveReport.id, {
                              rcaType,
                              simpleRca: simple,
                              fiveWhysRca: rcaType === 'five_whys' ? fiveWhys.filter(w => w.trim() !== '') : undefined,
                              correctiveAction: corrective || 'Immediate containment implemented.',
                              preventiveAction: preventive || 'Systemic procedure revision submitted.',
                              attachmentName: capaAttachmentName
                            }, activeRole.toUpperCase());
                          }}
                          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          <span>{t.safetyReports.detailModal.submitPlanBtn}</span>
                        </button>
                      ) : (
                        <div className="text-[11px] text-purple-400/90 italic flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Awaiting CAPA submission by assigned Head of Department ({currentActiveReport.assignedHoD || 'HoD'})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* STEP 6: CAPA Plan Review (SQM) */}
                  <div className={`border rounded-xl p-4 space-y-3 transition-colors ${
                    currentActiveReport.lifecycleStatus === 'plan_under_review'
                      ? 'bg-blue-950/20 border-blue-500/50 shadow-md'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          currentActiveReport.sqmPlanReviewDecision === 'approve' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>6</span>
                        <span>{t.safetyReports.detailModal.step6}</span>
                      </h3>
                      {currentActiveReport.sqmPlanReviewDecision === 'approve' ? (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Plan Approved {currentActiveReport.sqmPlanReviewedAt}
                        </span>
                      ) : (
                        <span className="text-[10px] text-cyan-400 font-semibold">
                          SQM Approval Required
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">{t.safetyReports.detailModal.sqmCommentsLabel}</label>
                        <textarea
                          rows={2}
                          value={sqmReviewComments}
                          onChange={(e) => setSqmReviewComments(e.target.value)}
                          placeholder="Directives, observations, or revision requirements..."
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>

                      {canUserPerformStep('review_capa', activeRole) ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => reviewCAPAPlan(currentActiveReport.id, 'approve', sqmReviewComments, 'Dr. Khaled Fawzy (SQM)')}
                            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-colors flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>{t.safetyReports.detailModal.approvePlanBtn}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => reviewCAPAPlan(currentActiveReport.id, 'return', sqmReviewComments || 'Clarification required on preventive action root cause alignment.', 'Dr. Khaled Fawzy (SQM)')}
                            className="px-4 py-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold shadow transition-colors flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>{t.safetyReports.detailModal.returnPlanBtn}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-amber-400/90 italic flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Restricted to Safety & Quality Manager (SQM)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* STEP 7: Effectiveness Evaluation & Residual Risk (S&Q) */}
                  <div className={`border rounded-xl p-4 space-y-3 transition-colors ${
                    currentActiveReport.lifecycleStatus === 'effectiveness_pending'
                      ? 'bg-blue-950/20 border-blue-500/50 shadow-md'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          currentActiveReport.effectivenessEvaluation ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>7</span>
                        <span>{t.safetyReports.detailModal.step7}</span>
                      </h3>
                      {currentActiveReport.residualRisk && (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${calculateRiskIndex(currentActiveReport.residualRisk.severity, currentActiveReport.residualRisk.likelihood).colorClass}`}>
                          Residual Risk: {currentActiveReport.residualRisk.scoreCode} ({currentActiveReport.residualRisk.level})
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Effectiveness Toggle */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300">{t.safetyReports.detailModal.isEffectiveLabel}</span>
                        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => setIsEffective(true)}
                            className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                              isEffective ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Effective (No Recurrence)
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEffective(false)}
                            className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                              !isEffective ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Needs Follow-Up / Ineffective
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">{t.safetyReports.detailModal.effectivenessNotes}</label>
                        <textarea
                          rows={2}
                          value={effectivenessNotes}
                          onChange={(e) => setEffectivenessNotes(e.target.value)}
                          placeholder="Evidence of 30-day monitoring, ramp inspections, and zero repeat events..."
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>

                      {/* Residual Risk Matrix (ICAO 5x5) */}
                      <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                            {t.safetyReports.detailModal.residualRiskLabel}
                          </span>
                          <div className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${calculateRiskIndex(postSev, postLike).colorClass}`}>
                            {calculateRiskIndex(postSev, postLike).score} – {calculateRiskIndex(postSev, postLike).level}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">
                              Residual Severity (1 to 5): {postSev}
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={postSev}
                              onChange={(e) => setPostSev(Number(e.target.value))}
                              className="w-full accent-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">
                              Residual Likelihood (A to E): {postLike}
                            </label>
                            <div className="grid grid-cols-5 gap-1">
                              {['A', 'B', 'C', 'D', 'E'].map(lvl => (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => setPostLike(lvl)}
                                  className={`py-1 rounded text-xs font-mono font-bold transition-colors ${
                                    postLike === lvl ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {canUserPerformStep('effectiveness', activeRole) ? (
                        <button
                          type="button"
                          onClick={() => {
                            const residual = {
                              severity: postSev,
                              likelihood: postLike,
                              scoreCode: calculateRiskIndex(postSev, postLike).score,
                              level: calculateRiskIndex(postSev, postLike).level,
                              notes: 'Residual risk lowered within ALARP (As Low As Reasonably Practicable) criteria.'
                            };
                            recordEffectiveness(currentActiveReport.id, {
                              isEffective,
                              evaluationNotes: effectivenessNotes || 'Verified effective with no recurrence.',
                              residualRisk: residual,
                              attachmentName: effAttachmentName
                            }, 'Mahmoud Ezz (Safety Officer)');
                          }}
                          className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>{t.safetyReports.detailModal.saveEffectivenessBtn}</span>
                        </button>
                      ) : (
                        <div className="text-[11px] text-teal-400/90 italic flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Recorded by Safety & Quality Department</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* STEP 8: Final Sign-off & Case Closure (SQM Only) */}
                  <div className={`border rounded-xl p-4 space-y-4 transition-colors ${
                    currentActiveReport.lifecycleStatus === 'pending_signoff'
                      ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          currentActiveReport.lifecycleStatus === 'closed' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>8</span>
                        <span>{t.safetyReports.detailModal.step8}</span>
                      </h3>
                      {currentActiveReport.lifecycleStatus === 'closed' ? (
                        <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                          <CheckCircle className="w-4 h-4" />
                          <span>Officially Closed on {currentActiveReport.closedAt}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 animate-pulse bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                          {t.safetyReports.detailModal.finalSignoffAlert}
                        </span>
                      )}
                    </div>

                    {currentActiveReport.finalSignoff && (
                      <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Signed Off By:</span>
                          <span className="font-bold text-emerald-300">{currentActiveReport.finalSignoff.signedBy}</span>
                        </div>
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="text-slate-400">Digital Signature Hash:</span>
                          <span className="text-emerald-400">{currentActiveReport.finalSignoff.signatureHash}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[11px] text-slate-400 block mb-1">Final Closure Remarks & Executive Directives</label>
                      <textarea
                        rows={2}
                        value={closureNotes}
                        onChange={(e) => setClosureNotes(e.target.value)}
                        placeholder="Verification comments confirming CAPA implementation effectiveness and zero recurrence..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        disabled={currentActiveReport.lifecycleStatus === 'closed'}
                      />
                    </div>

                    {/* Action Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                      
                      {/* Option to Issue Bulletin before closing */}
                      <button
                        type="button"
                        onClick={() => {
                          setBulletinTitle(`Safety Alert: Lessons Learned from ${currentActiveReport.id}`);
                          setBulletinSummary(currentActiveReport.description);
                          setShowBulletinModal(true);
                        }}
                        className="px-3.5 py-2 rounded-lg bg-blue-900/40 hover:bg-blue-800/50 border border-blue-600/50 text-blue-300 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <BellRing className="w-3.5 h-3.5 text-blue-400" />
                        <span>{t.safetyReports.detailModal.issueBulletinBtn}</span>
                      </button>

                      {/* Close & Sign-off Button */}
                      {currentActiveReport.lifecycleStatus !== 'closed' ? (
                        canUserPerformStep('final_signoff', activeRole) ? (
                          <button
                            type="button"
                            onClick={() => finalSignoffAndClose(currentActiveReport.id, closureNotes, 'Dr. Khaled Fawzy (Safety & Quality Manager)')}
                            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-colors"
                          >
                            <FileCheck className="w-4 h-4" />
                            <span>{t.safetyReports.detailModal.digitalSignoffBtn}</span>
                          </button>
                        ) : (
                          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 shrink-0" />
                            <span>Final Digital Sign-off restricted to Safety & Quality Manager (SQM)</span>
                          </div>
                        )
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Case is fully resolved and locked against further edits.
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* ================================================================= */}
              {/* TAB 2: AUDIT TRAIL & HISTORY                                      */}
              {/* ================================================================= */}
              {modalActiveTab === 'auditTrail' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <History className="w-4 h-4 text-blue-400" />
                      <span>Tamper-Evident Digital Audit Trail ({currentActiveReport.auditTrail.length} Events)</span>
                    </h3>
                  </div>

                  <div className="relative pl-6 rtl:pl-0 rtl:pr-6 space-y-4 before:absolute before:left-2.5 rtl:before:left-auto rtl:before:right-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    {currentActiveReport.auditTrail.map((entry, idx) => (
                      <div key={entry.id || idx} className="relative group">
                        {/* Dot indicator */}
                        <div className="absolute -left-6 rtl:-left-auto rtl:-right-6 top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-900 group-hover:scale-125 transition-transform" />

                        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-white">{entry.action}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">
                                {entry.actorRole}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-400">{entry.timestamp}</span>
                          </div>

                          <div className="text-xs text-slate-300">
                            By: <strong className="text-white">{entry.actorName}</strong>
                          </div>

                          {entry.details && (
                            <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800/80">
                              {entry.details}
                            </p>
                          )}

                          {entry.comments && (
                            <p className="text-[11px] text-amber-300/90 italic">
                              "{entry.comments}"
                            </p>
                          )}

                          {entry.previousStatus && entry.newStatus && (
                            <div className="text-[10px] text-slate-500 font-mono pt-1">
                              Status Transition: <span className="text-slate-400">{entry.previousStatus}</span> &rarr; <span className="text-emerald-400 font-semibold">{entry.newStatus}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* TAB 3: ATTACHMENTS & EVIDENCE                                     */}
              {/* ================================================================= */}
              {modalActiveTab === 'attachments' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-blue-400" />
                      <span>Case Attachments & Supporting Documents</span>
                    </h3>
                  </div>

                  {/* Add New Attachment Form */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <div className="text-xs font-bold text-slate-300">Upload / Attach Supporting Evidence</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="Document name (e.g. Ramp_Inspection_Checklist.pdf)"
                        className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                      <select
                        value={newFileCategory}
                        onChange={(e) => setNewFileCategory(e.target.value as FileAttachment['category'])}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"
                      >
                        <option value="initial_report">Initial Occurrence Evidence</option>
                        <option value="investigation">Investigation Evidence</option>
                        <option value="capa_plan">CAPA Implementation Proof</option>
                        <option value="effectiveness">Effectiveness Audit</option>
                      </select>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddAttachment}
                        disabled={!newFileName.trim()}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Attach File</span>
                      </button>
                    </div>
                  </div>

                  {/* Attachment Listing */}
                  <div className="space-y-2">
                    {currentActiveReport.attachments.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-xs">
                        No attachments uploaded for this case yet.
                      </div>
                    ) : (
                      currentActiveReport.attachments.map((file) => (
                        <div key={file.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-mono text-xs font-bold">
                              PDF
                            </div>
                            <div>
                              <div className="font-bold text-xs text-white flex items-center gap-2">
                                <span>{file.fileName}</span>
                                <span className="text-[10px] font-mono text-slate-400">({file.fileSize})</span>
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span className="capitalize">{file.category.replace('_', ' ')}</span>
                                <span>• Uploaded by {file.uploadedBy} on {file.uploadedAt}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => alert(`Simulated downloading: ${file.fileName}`)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                              title="Download Attachment"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECORD AIRLINE REPORT MODAL (S&Q INTAKE)                                   */}
      {/* ========================================================================= */}
      {showAirlineModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Record Airline Safety Report Intake</h3>
              </div>
              <button onClick={() => setShowAirlineModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordAirlineReport} className="space-y-3 text-xs">
              
              {/* Airline and Ref Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Operating Airline</label>
                  <select
                    value={airlineName}
                    onChange={(e) => setAirlineName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-semibold"
                  >
                    <option value="EgyptAir">EgyptAir (MS)</option>
                    <option value="Saudia">Saudia (SV)</option>
                    <option value="EasyJet">EasyJet (U2 / EZY)</option>
                    <option value="TUI Fly">TUI Fly (BY / TB)</option>
                    <option value="Edelweiss Air">Edelweiss Air (WK)</option>
                    <option value="Neos Air">Neos Air (NO)</option>
                    <option value="Wizz Air">Wizz Air (W6)</option>
                    <option value="Transavia">Transavia (HV)</option>
                    <option value="Air Cairo">Air Cairo (SM)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Airline Ref / Occurrence #</label>
                  <input
                    type="text"
                    value={airlineRefNumber}
                    onChange={(e) => setAirlineRefNumber(e.target.value)}
                    placeholder="E.g. MS-QA-2026-881"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              {/* Flight & Aircraft */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Flight Number</label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="E.g. MS-231"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Aircraft Registration</label>
                  <input
                    type="text"
                    value={aircraftReg}
                    onChange={(e) => setAircraftReg(e.target.value)}
                    placeholder="E.g. SU-GFO"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              {/* Location & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Occurrence Location</label>
                  <select
                    value={occurrenceLocation}
                    onChange={(e) => setOccurrenceLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="Stand 14 (Widebody)">Stand 14 (Widebody)</option>
                    <option value="Stand 11 (Narrowbody)">Stand 11 (Narrowbody)</option>
                    <option value="Stand 04 (Domestic)">Stand 04 (Domestic)</option>
                    <option value="Baggage Make-up Area">Baggage Make-up Area</option>
                    <option value="Fuel Hydrant Pit 12">Fuel Hydrant Pit 12</option>
                    <option value="Taxiway Charlie Inner">Taxiway Charlie Inner</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Hazard / Incident Classification</label>
                  <select
                    value={airlineCategory}
                    onChange={(e) => setAirlineCategory(e.target.value as ReportCategory)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="hazard">Hazard</option>
                    <option value="near_miss">Near-Miss</option>
                    <option value="gse_damage">GSE Damage / Contact</option>
                    <option value="personal_injury">Personal Injury</option>
                    <option value="fod">FOD on Stand</option>
                    <option value="delay">Safety Operational Delay</option>
                    <option value="spill">Fuel / Chemical Spill</option>
                  </select>
                </div>
              </div>

              {/* Reporter Contact */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Airline Contact / Flight Captain</label>
                <input
                  type="text"
                  value={airlineReporterContact}
                  onChange={(e) => setAirlineReporterContact(e.target.value)}
                  placeholder="Capt. Amr Zaki / Ground Safety Rep"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              {/* Incident Narrative */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Incident Narrative from Airline Report</label>
                <textarea
                  rows={3}
                  value={airlineDescription}
                  onChange={(e) => setAirlineDescription(e.target.value)}
                  placeholder="Detailed description as stated in the formal notification..."
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAirlineModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Log Airline Report into RMF SQMS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ISSUE BULLETIN MODAL (SAFETY PROMOTION)                                    */}
      {/* ========================================================================= */}
      {showBulletinModal && currentActiveReport && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-600/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  Issue Safety Bulletin from {currentActiveReport.id}
                </h3>
              </div>
              <button onClick={() => setShowBulletinModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Bulletin Title</label>
                <input
                  type="text"
                  value={bulletinTitle}
                  onChange={(e) => setBulletinTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Safety Alert Summary</label>
                <textarea
                  rows={3}
                  value={bulletinSummary}
                  onChange={(e) => setBulletinSummary(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Mandatory Staff Actions</label>
                <textarea
                  rows={3}
                  value={bulletinActions}
                  onChange={(e) => setBulletinActions(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulletinModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const actionsList = bulletinActions.split('\n').filter(a => a.trim() !== '');
                  issueBulletinFromReport(
                    currentActiveReport.id, 
                    bulletinTitle, 
                    `تنبيه سلامة: الدروس المستفادة من ${currentActiveReport.id}`, 
                    bulletinSummary, 
                    actionsList
                  );
                  setShowBulletinModal(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30"
              >
                Publish & Distribute to Staff
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
