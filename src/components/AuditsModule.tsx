import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { 
  AuditScheduleItem, 
  AuditFinding, 
  AuditType, 
  AuditDiscipline, 
  AuditSeverity 
} from '../types/index.ts';
import { 
  CalendarCheck, 
  Plus, 
  CheckCircle, 
  X, 
  Check, 
  BellRing
} from 'lucide-react';

export const AuditsModule: React.FC = () => {
  const { 
    language, 
    auditSchedule, 
    findings, 
    addAuditScheduleItem,
    acknowledgeFinding,
    proposeFindingCAPA,
    approveFindingCAPA,
    submitFindingEvidence,
    verifyCloseFinding,
    issueNoticeFromFinding
  } = useApp();

  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'calendar' | 'annualPlan' | 'findings'>('calendar');
  const [selectedCalendarAudit, setSelectedCalendarAudit] = useState<AuditScheduleItem | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Findings selection & form state
  const [selectedFinding, setSelectedFinding] = useState<AuditFinding | null>(null);
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [preventiveAction, setPreventiveAction] = useState('');
  const [targetDate, setTargetDate] = useState('2026-10-30');
  const [rcaMethod, setRcaMethod] = useState<'simple' | 'five_whys'>('five_whys');
  const [directCause, setDirectCause] = useState('');
  const [contributingFactor, setContributingFactor] = useState('');
  const [systemicGap, setSystemicGap] = useState('');
  const [fiveWhysList, setFiveWhysList] = useState<string[]>([
    '', '', '', '', ''
  ]);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [evidenceDocRef, setEvidenceDocRef] = useState('SOP-REV-2026-04.pdf');
  const [verificationNotes, setVerificationNotes] = useState('');

  // Schedule Modal State
  const [newAuditTitle, setNewAuditTitle] = useState('');
  const [newAuditType, setNewAuditType] = useState<AuditType>('internal');
  const [newAuditorOrg, setNewAuditorOrg] = useState('RMF Safety & Quality Department');
  const [newLeadAuditor, setNewLeadAuditor] = useState('Dr. Khaled Fawzy (SQM)');
  const [newDiscipline, setNewDiscipline] = useState<AuditDiscipline>('RMP');
  const [newScheduledDate, setNewScheduledDate] = useState('2026-11-20');
  const [newQuarter, setNewQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q4');
  const [newScope, setNewScope] = useState('');

  // Operational Notice trigger state
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeSummary, setNoticeSummary] = useState('');

  const openFindingModal = (finding: AuditFinding) => {
    setSelectedFinding(finding);
    if (finding.capaProposal) {
      setCorrectiveAction(finding.capaProposal.correctiveAction);
      setPreventiveAction(finding.capaProposal.preventiveAction);
      setTargetDate(finding.capaProposal.targetDate);
    }
    if (finding.rcaMethod) {
      setRcaMethod(finding.rcaMethod);
      if (finding.simpleRca) {
        setDirectCause(finding.simpleRca.directCause || '');
        setContributingFactor(finding.simpleRca.contributingFactor || '');
        setSystemicGap(finding.simpleRca.systemicGap || '');
      }
      if (finding.fiveWhysRca) {
        const padded = [...finding.fiveWhysRca];
        while (padded.length < 5) padded.push('');
        setFiveWhysList(padded);
      }
    }
    if (finding.implementationEvidence) {
      setEvidenceNotes(finding.implementationEvidence.evidenceNotes);
      setEvidenceDocRef(finding.implementationEvidence.documentRef);
    }
    if (finding.effectivenessVerification) {
      setVerificationNotes(finding.effectivenessVerification.verificationNotes);
    }
  };

  const getSeverityBadge = (level: AuditSeverity) => {
    switch (level) {
      case 'Level 1':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">Level 1 (Critical)</span>;
      case 'Level 2':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">Level 2 (Major)</span>;
      case 'Level 3':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">Level 3 (Observation)</span>;
    }
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'raised':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">1. Raised</span>;
      case 'acknowledged':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">2. Acknowledged</span>;
      case 'capa_proposed':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">3. CAPA Proposed</span>;
      case 'sqm_approved':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">4. SQM Approved</span>;
      case 'implemented':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400">5. Implemented</span>;
      case 'closed_verified':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">6. Closed & Verified</span>;
      default:
        return null;
    }
  };

  const handleCreateAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuditTitle.trim()) return;

    addAuditScheduleItem({
      title: newAuditTitle,
      auditType: newAuditType,
      auditorOrganization: newAuditorOrg,
      leadAuditor: newLeadAuditor,
      discipline: newDiscipline,
      scheduledDate: newScheduledDate,
      quarter: newQuarter,
      status: 'planned',
      scopeSummary: newScope || 'Comprehensive station conformance check.'
    });

    setShowScheduleModal(false);
    setNewAuditTitle('');
    setNewScope('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-blue-400" />
            <span>{t.audits.title}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.audits.subtitle}
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.audits.scheduleAuditBtn}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'calendar' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.audits.tabs.calendar}
        </button>
        <button
          onClick={() => setActiveTab('annualPlan')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'annualPlan' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.audits.tabs.annualPlan}
        </button>
        <button
          onClick={() => setActiveTab('findings')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors relative ${
            activeTab === 'findings' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.audits.tabs.findings}
          {findings.filter(f => f.lifecycleStage !== 'closed_verified').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-400 absolute top-1 right-1 rtl:right-auto rtl:left-1" />
          )}
        </button>
      </div>

      {/* TAB 1: Interactive Audit Calendar */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>RMF Station Audit Calendar 2026</span>
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  External Carrier / ISAGO
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Internal QMS Audit
                </span>
              </div>
            </div>

            {/* Calendar Event Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {auditSchedule.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedCalendarAudit(item)}
                  className={`p-4 rounded-xl border text-left rtl:text-right cursor-pointer transition-all hover:scale-[1.01] ${
                    item.auditType === 'external'
                      ? 'bg-purple-950/20 border-purple-800/60 hover:border-purple-600'
                      : 'bg-blue-950/20 border-blue-800/60 hover:border-blue-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                    <span className="font-bold text-slate-300">{item.scheduledDate}</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      item.auditType === 'external' ? 'bg-purple-900/60 text-purple-300' : 'bg-blue-900/60 text-blue-300'
                    }`}>
                      {item.quarter} · {item.discipline}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white line-clamp-1 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {item.scopeSummary}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400 truncate max-w-[150px]">
                      {item.auditorOrganization}
                    </span>
                    <span className="font-semibold text-blue-400">
                      View Details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Yearly Audit Plan 2026 Table */}
      {activeTab === 'annualPlan' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Yearly Station Audit Matrix (ISAGO ORM, PAX, BAG, RMP, LOD)
            </h2>
            <span className="text-xs text-slate-400">
              Total Audits Scheduled: <strong className="text-white font-mono">{auditSchedule.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Audit Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">Auditing Body</th>
                  <th className="py-3 px-4">Lead Auditor</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {auditSchedule.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-850/60">
                    <td className="py-3 px-4 font-semibold text-white">
                      {item.title}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.auditType === 'external' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {item.auditType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">
                      {item.discipline}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {item.scheduledDate} ({item.quarter})
                    </td>
                    <td className="py-3 px-4">
                      {item.auditorOrganization}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {item.leadAuditor}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        item.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : item.status === 'in_progress'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-700/40 text-slate-300'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Audit Findings & 6-Stage CAPA Lifecycle */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Audit Findings & 6-Stage Finding-to-Closure Lifecycle
                </h2>
                <p className="text-[11px] text-slate-400">
                  Raised → Acknowledged → Joint RCA & CAPA → SQM Approved → Implemented → Verified Closed
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Finding ID</th>
                    <th className="py-3 px-4">Discipline & Clause</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Assigned Dept</th>
                    <th className="py-3 px-4">Deadline</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4 text-right rtl:text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {findings.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-850/60">
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">
                        {f.id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">{f.standardReference}</span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-xs">{f.auditTitle}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getSeverityBadge(f.severityLevel)}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {f.assignedDepartment}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {f.deadlineDate}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getStageBadge(f.lifecycleStage)}
                      </td>
                      <td className="py-3 px-4 text-right rtl:text-left whitespace-nowrap">
                        <button
                          onClick={() => openFindingModal(f)}
                          className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-[11px] font-semibold transition-colors"
                        >
                          CAPA Lifecycle →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Audit Detail Modal (from Calendar) */}
      {selectedCalendarAudit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-bold uppercase">
                  {selectedCalendarAudit.auditType} · {selectedCalendarAudit.discipline}
                </span>
                <h3 className="text-base font-bold text-white mt-2">
                  {selectedCalendarAudit.title}
                </h3>
              </div>
              <button onClick={() => setSelectedCalendarAudit(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p><strong>Scheduled Date:</strong> <span className="font-mono text-white">{selectedCalendarAudit.scheduledDate}</span> ({selectedCalendarAudit.quarter})</p>
              <p><strong>Auditing Body:</strong> {selectedCalendarAudit.auditorOrganization}</p>
              <p><strong>Lead Auditor:</strong> {selectedCalendarAudit.leadAuditor}</p>
              <p><strong>Scope & Objectives:</strong> {selectedCalendarAudit.scopeSummary}</p>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedCalendarAudit(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6-Stage CAPA & Finding Workflow Modal */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl space-y-5 text-slate-100 animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-blue-400">{selectedFinding.id}</span>
                  {getSeverityBadge(selectedFinding.severityLevel)}
                  {getStageBadge(selectedFinding.lifecycleStage)}
                  {selectedFinding.issuedNoticeId && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Notice: {selectedFinding.issuedNoticeId}
                    </span>
                  )}
                </div>
                <h2 className="text-sm font-bold text-white mt-1">
                  {selectedFinding.standardReference} · {selectedFinding.auditTitle}
                </h2>
              </div>
              <button onClick={() => setSelectedFinding(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Non-Conformity Description */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Non-Conformity Description
              </span>
              <p className="text-slate-200 leading-relaxed font-sans">{selectedFinding.description}</p>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2 font-mono">
                <span>Raised: {selectedFinding.raisedDate}</span>
                <span>Deadline: <strong className="text-red-400">{selectedFinding.deadlineDate}</strong></span>
                <span>Responsible HoD: {selectedFinding.assignedHoD}</span>
              </div>
            </div>

            {/* STAGE 2: HoD Acknowledgment */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  2. Department Head Acknowledgment
                </span>
                {selectedFinding.acknowledgedAt && (
                  <span className="text-[11px] font-mono text-emerald-400">
                    ✓ Acknowledged {selectedFinding.acknowledgedAt}
                  </span>
                )}
              </div>
              {selectedFinding.lifecycleStage === 'raised' && (
                <button
                  type="button"
                  onClick={() => {
                    acknowledgeFinding(selectedFinding.id);
                    setSelectedFinding({ ...selectedFinding, lifecycleStage: 'acknowledged', acknowledgedAt: new Date().toISOString().substring(0, 16) });
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  {t.audits.findingActions.acknowledge}
                </button>
              )}
            </div>

            {/* STAGE 3: Root Cause Analysis (Simple vs 5-Whys) & CAPA Proposal */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  3. Root Cause Analysis & CAPA Plan (HoD)
                </span>
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setRcaMethod('simple')}
                    className={`px-2 py-0.5 rounded text-[11px] ${rcaMethod === 'simple' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    Simple RCA
                  </button>
                  <button
                    type="button"
                    onClick={() => setRcaMethod('five_whys')}
                    className={`px-2 py-0.5 rounded text-[11px] ${rcaMethod === 'five_whys' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    5-Whys RCA
                  </button>
                </div>
              </div>

              {rcaMethod === 'simple' ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={directCause}
                    onChange={(e) => setDirectCause(e.target.value)}
                    placeholder="Direct Cause..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                  <input
                    type="text"
                    value={contributingFactor}
                    onChange={(e) => setContributingFactor(e.target.value)}
                    placeholder="Contributing Human/Environmental Factor..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                  <input
                    type="text"
                    value={systemicGap}
                    onChange={(e) => setSystemicGap(e.target.value)}
                    placeholder="Systemic SOP Gap..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  {fiveWhysList.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-16 font-mono text-[11px] text-blue-400 font-bold shrink-0">Why #{idx+1}:</span>
                      <input
                        type="text"
                        value={w}
                        onChange={(e) => {
                          const updated = [...fiveWhysList];
                          updated[idx] = e.target.value;
                          setFiveWhysList(updated);
                        }}
                        placeholder={`Causal factor level ${idx+1}...`}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Corrective Action (Immediate Containment)</label>
                  <textarea
                    rows={2}
                    value={correctiveAction}
                    onChange={(e) => setCorrectiveAction(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Preventive Action (Systemic Fix)</label>
                  <textarea
                    rows={2}
                    value={preventiveAction}
                    onChange={(e) => setPreventiveAction(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Target Completion Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    proposeFindingCAPA(
                      selectedFinding.id, 
                      correctiveAction, 
                      preventiveAction, 
                      targetDate, 
                      rcaMethod,
                      rcaMethod === 'simple' ? { directCause, contributingFactor, systemicGap } : undefined,
                      rcaMethod === 'five_whys' ? fiveWhysList : undefined
                    );
                    setSelectedFinding({
                      ...selectedFinding,
                      lifecycleStage: 'capa_proposed',
                      capaProposal: { correctiveAction, preventiveAction, targetDate, proposedAt: new Date().toISOString().substring(0, 10) }
                    });
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-sm"
                >
                  {t.audits.findingActions.proposeCAPA}
                </button>
              </div>
            </div>

            {/* STAGE 4: SQM Approval */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                4. Safety & Quality Manager (SQM) Approval
              </span>
              {selectedFinding.sqmApproval ? (
                <p className="text-emerald-400 font-semibold">
                  ✓ Approved by {selectedFinding.sqmApproval.approvedBy} on {selectedFinding.sqmApproval.approvedAt}
                </p>
              ) : selectedFinding.lifecycleStage === 'capa_proposed' ? (
                <button
                  type="button"
                  onClick={() => {
                    approveFindingCAPA(selectedFinding.id, 'Dr. Khaled Fawzy (Lead Auditor)', 'CAPA approved. Feasible and addresses root cause.');
                    setSelectedFinding({
                      ...selectedFinding,
                      lifecycleStage: 'sqm_approved',
                      sqmApproval: { approvedBy: 'Dr. Khaled Fawzy', approvedAt: new Date().toISOString().substring(0, 10), comments: 'Approved' }
                    });
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm"
                >
                  {t.audits.findingActions.approveCAPA}
                </button>
              ) : (
                <span className="text-slate-500">Pending previous steps.</span>
              )}
            </div>

            {/* STAGE 5: Implementation & Evidence Upload */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                5. Implementation & Evidence Submission (HoD)
              </span>
              {selectedFinding.implementationEvidence ? (
                <div className="text-emerald-400 font-semibold">
                  ✓ Evidence uploaded: {selectedFinding.implementationEvidence.documentRef} ({selectedFinding.implementationEvidence.evidenceNotes})
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={evidenceNotes}
                    onChange={(e) => setEvidenceNotes(e.target.value)}
                    placeholder="Implementation remarks (e.g. Work completed, training signed)..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                  <input
                    type="text"
                    value={evidenceDocRef}
                    onChange={(e) => setEvidenceDocRef(e.target.value)}
                    placeholder="Document reference (e.g. WORK-ORDER-442.pdf)..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      submitFindingEvidence(selectedFinding.id, evidenceNotes, evidenceDocRef);
                      setSelectedFinding({
                        ...selectedFinding,
                        lifecycleStage: 'implemented',
                        implementationEvidence: { evidenceNotes, documentRef: evidenceDocRef, submittedAt: new Date().toISOString().substring(0, 10) }
                      });
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-sm"
                  >
                    {t.audits.findingActions.submitEvidence}
                  </button>
                </div>
              )}
            </div>

            {/* STAGE 6: Effectiveness Verification, Operational Notice Decision & Closure */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                6. Effectiveness Verification & Final Closure
              </span>
              <textarea
                rows={2}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Follow-up verification remarks confirming 30-day zero recurrence..."
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                {/* Decision before closing: Issue Operational Notice (ION) */}
                <button
                  type="button"
                  onClick={() => {
                    setNoticeTitle(`Operational Notice: Lessons from ${selectedFinding.id} (${selectedFinding.standardReference})`);
                    setNoticeSummary(selectedFinding.description);
                    setShowNoticeModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-800/50 border border-blue-600/50 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <BellRing className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t.audits.findingActions.issueNotice}</span>
                </button>

                {selectedFinding.lifecycleStage !== 'closed_verified' ? (
                  <button
                    type="button"
                    onClick={() => {
                      verifyCloseFinding(selectedFinding.id, 'Dr. Khaled Fawzy (Lead Auditor)', verificationNotes || 'Follow-up audit confirmed effective implementation.');
                      setSelectedFinding({
                        ...selectedFinding,
                        lifecycleStage: 'closed_verified',
                        effectivenessVerification: { verifiedBy: 'Dr. Khaled Fawzy', verifiedAt: new Date().toISOString().substring(0, 10), isEffective: true, verificationNotes: verificationNotes || 'Verified' }
                      });
                    }}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                  >
                    {t.audits.findingActions.verifyClose}
                  </button>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Closed and Verified
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Direct Operational Notice Modal */}
      {showNoticeModal && selectedFinding && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-600/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BellRing className="w-4 h-4 text-blue-400" />
                Issue Operational Notice (ION) from {selectedFinding.id}
              </h3>
              <button onClick={() => setShowNoticeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Notice Title</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Notice Alert Summary</label>
                <textarea
                  rows={3}
                  value={noticeSummary}
                  onChange={(e) => setNoticeSummary(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowNoticeModal(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300">
                Cancel
              </button>
              <button
                onClick={() => {
                  const notice = issueNoticeFromFinding(
                    selectedFinding.id, 
                    noticeTitle, 
                    `تعميم عملياتي: دروس مستفادة من الملاحظة ${selectedFinding.id}`, 
                    noticeSummary, 
                    ['Verify SOP adherence on ramp.', 'Inspect equipment before flight turnaround.']
                  );
                  setSelectedFinding({ ...selectedFinding, issuedNoticeId: notice.refNumber });
                  setShowNoticeModal(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Broadcast to RMF Personnel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule New Audit Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateAudit} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-blue-400" />
                Schedule New Station Audit
              </h3>
              <button type="button" onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Audit Title</label>
                <input
                  type="text"
                  required
                  value={newAuditTitle}
                  onChange={(e) => setNewAuditTitle(e.target.value)}
                  placeholder="E.g. IATA ISAGO Ground Handling Re-certification"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Audit Type</label>
                  <select
                    value={newAuditType}
                    onChange={(e) => setNewAuditType(e.target.value as AuditType)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="internal">Internal Audit</option>
                    <option value="external">External Audit</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">ISAGO Discipline</label>
                  <select
                    value={newDiscipline}
                    onChange={(e) => setNewDiscipline(e.target.value as AuditDiscipline)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  >
                    <option value="ORM">ORM - Organization</option>
                    <option value="PAX">PAX - Passenger</option>
                    <option value="BAG">BAG - Baggage</option>
                    <option value="RMP">RMP - Ramp Handling</option>
                    <option value="LOD">LOD - Load Control</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Auditing Body</label>
                  <input
                    type="text"
                    value={newAuditorOrg}
                    onChange={(e) => setNewAuditorOrg(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Lead Auditor</label>
                  <input
                    type="text"
                    value={newLeadAuditor}
                    onChange={(e) => setNewLeadAuditor(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={newScheduledDate}
                    onChange={(e) => setNewScheduledDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Quarter</label>
                  <select
                    value={newQuarter}
                    onChange={(e) => setNewQuarter(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  >
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Scope & Objectives</label>
                <textarea
                  rows={2}
                  value={newScope}
                  onChange={(e) => setNewScope(e.target.value)}
                  placeholder="Audit criteria and departments involved..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setShowScheduleModal(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300">
                Cancel
              </button>
              <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30">
                Confirm Schedule
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
