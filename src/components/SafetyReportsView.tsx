import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { SafetyReport, ReportLifecycleStatus, ReportCategory, RiskLevel } from '../types/index.ts';
import { 
  FileText, 
  Search, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  X, 
  ChevronRight, 
  BellRing
} from 'lucide-react';

export const SafetyReportsView: React.FC = () => {
  const { 
    language, 
    reports, 
    acknowledgeReport, 
    updateInvestigation, 
    setPreMitigationRisk, 
    setReportRCA, 
    setReportCAPA, 
    markReportCAPAImplemented, 
    setPostMitigationRisk, 
    closeSafetyReport, 
    issueBulletinFromReport,
    activeRole
  } = useApp();

  const t = translations[language];

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected report for modal
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(null);

  // Investigation Workspace Form State
  const [invSummary, setInvSummary] = useState('');
  
  // Pre-Risk State
  const [preSev, setPreSev] = useState(4);
  const [preLike, setPreLike] = useState('B');

  // RCA State
  const [rcaType, setRcaType] = useState<'simple' | 'five_whys'>('five_whys');
  const [directCause, setDirectCause] = useState('');
  const [contributing, setContributing] = useState('');
  const [systemicGap, setSystemicGap] = useState('');
  const [fiveWhys, setFiveWhys] = useState<string[]>([
    '', '', '', '', ''
  ]);

  // CAPA State
  const [corrective, setCorrective] = useState('');
  const [preventive, setPreventive] = useState('');
  const [assignedDept, setAssignedDept] = useState('Operations - Ramp Services');
  const [assignedManager, setAssignedManager] = useState('Capt. Sherif Nour (HoD Operations)');
  const [targetDate, setTargetDate] = useState('2026-10-25');

  // Post-Risk (Residual) State
  const [postSev, setPostSev] = useState(1);
  const [postLike, setPostLike] = useState('E');

  // Closure & Bulletin State
  const [closureNotes, setClosureNotes] = useState('');
  const [showBulletinModal, setShowBulletinModal] = useState(false);
  const [bulletinTitle, setBulletinTitle] = useState('');
  const [bulletinSummary, setBulletinSummary] = useState('');
  const [bulletinActions, setBulletinActions] = useState('1. Conduct pre-arrival FOD sweep.\n2. Verify torque clamps on GSE.\n3. Log on turnaround sheet.');

  const openReportModal = (report: SafetyReport) => {
    setSelectedReport(report);
    setInvSummary(report.investigationSummary || '');
    if (report.preMitigationRisk) {
      setPreSev(report.preMitigationRisk.severity);
      setPreLike(report.preMitigationRisk.likelihood);
    }
    if (report.rcaType) {
      setRcaType(report.rcaType);
      if (report.simpleRca) {
        setDirectCause(report.simpleRca.directCause || '');
        setContributing(report.simpleRca.contributingFactor || '');
        setSystemicGap(report.simpleRca.systemicGap || '');
      }
      if (report.fiveWhysRca && report.fiveWhysRca.length > 0) {
        const padded = [...report.fiveWhysRca];
        while (padded.length < 5) padded.push('');
        setFiveWhys(padded);
      }
    }
    if (report.capa) {
      setCorrective(report.capa.correctiveAction);
      setPreventive(report.capa.preventiveAction);
      setAssignedDept(report.capa.assignedDepartment);
      setAssignedManager(report.capa.assignedManager);
      setTargetDate(report.capa.targetDate);
    }
    if (report.postMitigationRisk) {
      setPostSev(report.postMitigationRisk.severity);
      setPostLike(report.postMitigationRisk.likelihood);
    }
    setClosureNotes(report.closureNotes || '');
  };

  const calculateRisk = (sev: number, like: string): { score: string; level: RiskLevel; badgeClass: string } => {
    const score = `${sev}${like}`;
    if (sev >= 4 && (like === 'A' || like === 'B' || like === 'C')) {
      return { score, level: 'Critical', badgeClass: 'bg-red-500/20 text-red-400 border border-red-500/30' };
    }
    if ((sev === 3 && (like === 'A' || like === 'B')) || (sev >= 4 && like === 'D') || (sev === 5 && like === 'E')) {
      return { score, level: 'High', badgeClass: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' };
    }
    if ((sev === 2 && (like === 'A' || like === 'B')) || (sev === 3 && (like === 'C' || like === 'D')) || (sev === 4 && like === 'E')) {
      return { score, level: 'Medium', badgeClass: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' };
    }
    return { score, level: 'Low', badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' };
  };

  const getStatusBadge = (status: ReportLifecycleStatus) => {
    switch (status) {
      case 'submitted':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Submitted</span>;
      case 'acknowledged':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Acknowledged</span>;
      case 'investigating':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Investigating</span>;
      case 'capa_pending':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">CAPA Formulated</span>;
      case 'capa_implemented':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">CAPA Implemented</span>;
      case 'closed':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">Closed & Verified</span>;
    }
  };

  // Filter reports
  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'all' && r.lifecycleStatus !== statusFilter) return false;
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = r.id.toLowerCase().includes(q);
      const matchLoc = r.location.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchFlight = r.flightNumber ? r.flightNumber.toLowerCase().includes(q) : false;
      return matchId || matchLoc || matchDesc || matchFlight;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            <span>{t.safetyReports.title}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.safetyReports.subtitle}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.safetyReports.searchPlaceholder}
            className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">{t.safetyReports.filterStatus}: {t.safetyReports.all}</option>
            <option value="submitted">{t.safetyReports.stages.submitted}</option>
            <option value="acknowledged">{t.safetyReports.stages.acknowledged}</option>
            <option value="investigating">{t.safetyReports.stages.investigating}</option>
            <option value="capa_pending">{t.safetyReports.stages.capa_pending}</option>
            <option value="capa_implemented">{t.safetyReports.stages.capa_implemented}</option>
            <option value="closed">{t.safetyReports.stages.closed}</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">{t.safetyReports.filterCategory}: {t.safetyReports.all}</option>
            <option value="hazard">Hazard</option>
            <option value="near_miss">Near-Miss</option>
            <option value="gse_damage">GSE Damage</option>
            <option value="personal_injury">Personal Injury</option>
            <option value="fod">FOD</option>
            <option value="delay">Safety Delay</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">{t.safetyReports.tableId}</th>
                <th className="py-3 px-4">{t.safetyReports.tableCategory}</th>
                <th className="py-3 px-4">{t.safetyReports.tableLocation}</th>
                <th className="py-3 px-4">{t.safetyReports.tableDate}</th>
                <th className="py-3 px-4">{t.safetyReports.tableRisk}</th>
                <th className="py-3 px-4">{t.safetyReports.tableStatus}</th>
                <th className="py-3 px-4 text-right rtl:text-left">{t.safetyReports.tableActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    {t.safetyReports.empty}
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const risk = report.preMitigationRisk 
                    ? calculateRisk(report.preMitigationRisk.severity, report.preMitigationRisk.likelihood)
                    : null;

                  return (
                    <tr key={report.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                        {report.id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold capitalize text-slate-300">
                          {report.category.replace('_', ' ')}
                        </span>
                        {report.flightNumber && (
                          <span className="text-[10px] text-slate-500 font-mono block">
                            Flight: {report.flightNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-slate-300">{report.location}</span>
                        {report.gseIdLinked && (
                          <span className="text-[10px] font-mono text-amber-400 block">
                            GSE: {report.gseIdLinked}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                        {report.timestamp}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {risk ? (
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${risk.badgeClass}`}>
                            {risk.score} ({risk.level})
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getStatusBadge(report.lifecycleStatus)}
                      </td>
                      <td className="py-3 px-4 text-right rtl:text-left whitespace-nowrap">
                        <button
                          onClick={() => openReportModal(report)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1 ml-auto rtl:ml-0 rtl:mr-auto"
                        >
                          <span>{t.safetyReports.investigateBtn}</span>
                          <ChevronRight className="w-3 h-3 rtl:rotate-180" />
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

      {/* Complete Safety Officer Investigation File Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl space-y-6 text-slate-100 animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-blue-400">{selectedReport.id}</span>
                  {getStatusBadge(selectedReport.lifecycleStatus)}
                  {selectedReport.issuedBulletinId && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Bulletin: {selectedReport.issuedBulletinId}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  {t.safetyReports.detailModal.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                  <span>Location: <strong className="text-slate-200">{selectedReport.location}</strong></span>
                  <span>Date: <strong className="font-mono text-slate-200">{selectedReport.timestamp}</strong></span>
                  <span>Reporter: <strong className="text-slate-200">{selectedReport.reporterType === 'identified' ? selectedReport.reporterName : 'Anonymous (Just Culture)'}</strong></span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Frontline Report Summary Card */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Frontline Incident Narrative
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {selectedReport.description}
              </p>
              {selectedReport.gseIdLinked && (
                <div className="text-[11px] font-mono text-amber-400 pt-1">
                  Linked GSE Equipment: {selectedReport.gseIdLinked}
                </div>
              )}
            </div>

            {/* STAGE 1: Receipt & Acknowledgment */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <span>{t.safetyReports.detailModal.step1}</span>
                </h3>
                {selectedReport.acknowledgedAt && (
                  <span className="text-[10px] font-mono text-emerald-400">
                    Acknowledged {selectedReport.acknowledgedAt}
                  </span>
                )}
              </div>

              {selectedReport.lifecycleStatus === 'submitted' ? (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <p className="text-xs text-slate-400">
                    Acknowledge report receipt to confirm review by Safety Officer.
                  </p>
                  <button
                    onClick={() => {
                      acknowledgeReport(selectedReport.id, 'Mahmoud Ezz (Safety Officer)');
                      setSelectedReport({
                        ...selectedReport,
                        lifecycleStatus: 'acknowledged',
                        acknowledgedBy: 'Mahmoud Ezz (Safety Officer)',
                        acknowledgedAt: new Date().toISOString().substring(0, 16)
                      });
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors whitespace-nowrap"
                  >
                    {t.safetyReports.detailModal.acknowledgeBtn}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-300">
                  {t.safetyReports.detailModal.acknowledgedAlert} Verified by <strong>{selectedReport.acknowledgedBy}</strong>.
                </p>
              )}
            </div>

            {/* STAGE 2: Operational Investigation */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{t.safetyReports.detailModal.step2}</span>
              </h3>
              <textarea
                rows={2}
                value={invSummary}
                onChange={(e) => setInvSummary(e.target.value)}
                placeholder={t.safetyReports.detailModal.investigatorPlaceholder}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  updateInvestigation(selectedReport.id, invSummary);
                  setSelectedReport({ ...selectedReport, investigationSummary: invSummary, lifecycleStatus: 'investigating' });
                }}
                className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200"
              >
                Save Investigation Findings
              </button>
            </div>

            {/* STAGE 3: Pre-Mitigation Risk Assessment (5x5 Matrix) */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {t.safetyReports.detailModal.step3}
                </h3>
                <div className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${calculateRisk(preSev, preLike).badgeClass}`}>
                  {t.safetyReports.detailModal.initialScore} {calculateRisk(preSev, preLike).score} ({calculateRisk(preSev, preLike).level})
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Severity: {preSev} ({preSev === 5 ? 'Catastrophic' : preSev === 4 ? 'Major' : preSev === 3 ? 'Moderate' : preSev === 2 ? 'Minor' : 'Negligible'})
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
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Likelihood: {preLike} ({preLike === 'A' ? 'Frequent' : preLike === 'B' ? 'Occasional' : preLike === 'C' ? 'Remote' : preLike === 'D' ? 'Improbable' : 'Extremely Improbable'})
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {['A', 'B', 'C', 'D', 'E'].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setPreLike(lvl)}
                        className={`py-1 rounded text-xs font-mono font-bold ${preLike === lvl ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const risk = {
                    severity: preSev,
                    likelihood: preLike,
                    scoreCode: calculateRisk(preSev, preLike).score,
                    level: calculateRisk(preSev, preLike).level
                  };
                  setPreMitigationRisk(selectedReport.id, risk);
                  setSelectedReport({ ...selectedReport, preMitigationRisk: risk, lifecycleStatus: 'investigating' });
                }}
                className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200"
              >
                Record Initial Risk Rating
              </button>
            </div>

            {/* STAGE 4: Root Cause Analysis (RCA) - Simple vs 5-Whys */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {t.safetyReports.detailModal.step4}
                </h3>
                {/* Method Toggle */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setRcaType('simple')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold ${rcaType === 'simple' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    Simple RCA
                  </button>
                  <button
                    type="button"
                    onClick={() => setRcaType('five_whys')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold ${rcaType === 'five_whys' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    5-Whys Deep RCA
                  </button>
                </div>
              </div>

              {rcaType === 'simple' ? (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">{t.safetyReports.detailModal.directCause}</label>
                    <input
                      type="text"
                      value={directCause}
                      onChange={(e) => setDirectCause(e.target.value)}
                      placeholder="E.g. Loose hydraulic connector fitting under pushback tug"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">{t.safetyReports.detailModal.contributing}</label>
                    <input
                      type="text"
                      value={contributing}
                      onChange={(e) => setContributing(e.target.value)}
                      placeholder="E.g. Vibration during high charter turnaround hours"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">{t.safetyReports.detailModal.systemicGap}</label>
                    <input
                      type="text"
                      value={systemicGap}
                      onChange={(e) => setSystemicGap(e.target.value)}
                      placeholder="E.g. Torque check omitted from daily pre-shift inspection card"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {fiveWhys.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-16 shrink-0 font-mono text-[11px] text-blue-400 font-bold">
                        Why #{idx + 1}:
                      </span>
                      <input
                        type="text"
                        value={w}
                        onChange={(e) => {
                          const updated = [...fiveWhys];
                          updated[idx] = e.target.value;
                          setFiveWhys(updated);
                        }}
                        placeholder={
                          idx === 0 ? "Direct symptom: Why did this failure occur?"
                          : idx === 4 ? "Systemic root cause: Why did the safety barrier fail?"
                          : "Contributing reason..."
                        }
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setReportRCA(
                    selectedReport.id, 
                    rcaType, 
                    rcaType === 'simple' ? { directCause, contributingFactor: contributing, systemicGap } : undefined,
                    rcaType === 'five_whys' ? fiveWhys.filter(w => w.trim() !== '') : undefined
                  );
                  setSelectedReport({
                    ...selectedReport,
                    rcaType,
                    simpleRca: rcaType === 'simple' ? { directCause, contributingFactor: contributing, systemicGap } : undefined,
                    fiveWhysRca: rcaType === 'five_whys' ? fiveWhys : undefined
                  });
                }}
                className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200"
              >
                Save Root Cause Analysis
              </button>
            </div>

            {/* STAGE 5: CAPA Formulation */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {t.safetyReports.detailModal.step5}
              </h3>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">{t.safetyReports.detailModal.corrective}</label>
                  <textarea
                    rows={2}
                    value={corrective}
                    onChange={(e) => setCorrective(e.target.value)}
                    placeholder="Immediate action to contain hazard (e.g. ground vehicle, clean apron spill)"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">{t.safetyReports.detailModal.preventive}</label>
                  <textarea
                    rows={2}
                    value={preventive}
                    onChange={(e) => setPreventive(e.target.value)}
                    placeholder="Systemic fix (e.g. revise work instructions, mandate tool torque verification)"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Assigned Department</label>
                    <input
                      type="text"
                      value={assignedDept}
                      onChange={(e) => setAssignedDept(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Assigned Manager</label>
                    <input
                      type="text"
                      value={assignedManager}
                      onChange={(e) => setAssignedManager(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Target Completion Date</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const capaItem = {
                      correctiveAction: corrective,
                      preventiveAction: preventive,
                      assignedDepartment: assignedDept,
                      assignedManager,
                      targetDate,
                      status: 'pending' as const
                    };
                    setReportCAPA(selectedReport.id, capaItem);
                    setSelectedReport({ ...selectedReport, capa: capaItem, lifecycleStatus: 'capa_pending' });
                  }}
                  className="px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-sm"
                >
                  Save CAPA Plan
                </button>

                {selectedReport.capa && selectedReport.capa.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => {
                      markReportCAPAImplemented(selectedReport.id);
                      setSelectedReport({
                        ...selectedReport,
                        lifecycleStatus: 'capa_implemented',
                        capa: { ...selectedReport.capa!, status: 'implemented', implementedDate: new Date().toISOString().substring(0, 10) }
                      });
                    }}
                    className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-sm"
                  >
                    {t.safetyReports.detailModal.markImplemented}
                  </button>
                )}
              </div>
            </div>

            {/* STAGE 6: Post-Mitigation (Residual) Risk Assessment */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {t.safetyReports.detailModal.step6}
                </h3>
                <div className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${calculateRisk(postSev, postLike).badgeClass}`}>
                  {t.safetyReports.detailModal.residualScore} {calculateRisk(postSev, postLike).score} ({calculateRisk(postSev, postLike).level})
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Residual Severity: {postSev} ({postSev <= 2 ? 'Minor/Negligible' : 'Moderate'})
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
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Residual Likelihood: {postLike} ({postLike === 'E' ? 'Extremely Improbable' : 'Remote'})
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {['A', 'B', 'C', 'D', 'E'].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setPostLike(lvl)}
                        className={`py-1 rounded text-xs font-mono font-bold ${postLike === lvl ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const residual = {
                    severity: postSev,
                    likelihood: postLike,
                    scoreCode: calculateRisk(postSev, postLike).score,
                    level: calculateRisk(postSev, postLike).level,
                    notes: 'Residual risk lowered within ALARP (As Low As Reasonably Practicable) criteria.'
                  };
                  setPostMitigationRisk(selectedReport.id, residual);
                  setSelectedReport({ ...selectedReport, postMitigationRisk: residual });
                }}
                className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200"
              >
                Record Residual Risk Rating
              </button>
            </div>

            {/* STAGE 7: Safety Promotion (Issue Bulletin) & Case Closure */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t.safetyReports.detailModal.step7}</span>
              </h3>

              <div className="space-y-2">
                <label className="text-[11px] text-slate-400 block mb-1">
                  {t.safetyReports.detailModal.closureNotes}
                </label>
                <textarea
                  rows={2}
                  value={closureNotes}
                  onChange={(e) => setClosureNotes(e.target.value)}
                  placeholder="Verification comments confirming CAPA implementation effectiveness and zero recurrence..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              {/* Action Buttons: Issue Bulletin & Close Case */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                
                {/* Decision before closing: Issue Safety Bulletin */}
                <button
                  type="button"
                  onClick={() => {
                    setBulletinTitle(`Safety Alert: Lessons Learned from ${selectedReport.id}`);
                    setBulletinSummary(selectedReport.description);
                    setShowBulletinModal(true);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-blue-900/40 hover:bg-blue-800/50 border border-blue-600/50 text-blue-300 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <BellRing className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  <span>{t.safetyReports.detailModal.issueBulletinBtn}</span>
                </button>

                {/* Formally Close Case */}
                {selectedReport.lifecycleStatus !== 'closed' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const closer = activeRole === 'ae' ? 'Gen. Adel Radwan (AE)' : 'Dr. Khaled Fawzy (Safety & Quality Manager)';
                      closeSafetyReport(selectedReport.id, closer, closureNotes || 'Closed after verified CAPA implementation.');
                      setSelectedReport({
                        ...selectedReport,
                        lifecycleStatus: 'closed',
                        closedBy: closer,
                        closedAt: new Date().toISOString().substring(0, 16),
                        closureNotes: closureNotes || 'Closed after verified CAPA implementation.'
                      });
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-colors"
                  >
                    {t.safetyReports.detailModal.closeCaseBtn}
                  </button>
                ) : (
                  <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>Closed on {selectedReport.closedAt} by {selectedReport.closedBy}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Direct Bulletin Issuance Modal from Case */}
      {showBulletinModal && selectedReport && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-600/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  Issue Safety Bulletin from {selectedReport.id}
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
                  const newBul = issueBulletinFromReport(
                    selectedReport.id, 
                    bulletinTitle, 
                    `تنبيه سلامة: الدروس المستفادة من ${selectedReport.id}`, 
                    bulletinSummary, 
                    actionsList
                  );
                  setSelectedReport({ ...selectedReport, issuedBulletinId: newBul.refNumber });
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
