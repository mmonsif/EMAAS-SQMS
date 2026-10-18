import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { ManagementOfChange, MoCCategory } from '../types/index.ts';
import { 
  GitBranch, 
  Plus, 
  CheckCircle, 
  X, 
  ShieldCheck, 
  UserCheck
} from 'lucide-react';

export const ManagementOfChangeView: React.FC = () => {
  const { 
    language, 
    mocs, 
    createMoC, 
    updateMoCApproval, 
    markMoCImplemented, 
    completeMoCPostReview,
    activeRole,
    theme
  } = useApp();
  
  const t = translations[language];
  const isDark = theme === 'dark';

  const [selectedMoC, setSelectedMoC] = useState<ManagementOfChange | null>(null);
  const [initiateModalOpen, setInitiateModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MoCCategory>('equipment');
  const [department, setDepartment] = useState('Maintenance - GSE Fleet');
  const [initiatorName, setInitiatorName] = useState('Eng. Tarek Fathy');
  const [targetDate, setTargetDate] = useState('2026-11-15');
  const [reason, setReason] = useState('');

  // Post Review Modal
  const [postReviewNotes, setPostReviewNotes] = useState('');

  const handleInitiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createMoC({
      title,
      category,
      initiatorName,
      department,
      targetImplementationDate: targetDate,
      reasonForChange: reason,
      hazards: [
        {
          id: `HAZ-${Date.now()}`,
          hazardDescription: "Personnel unfamiliarity with new operational procedures.",
          initialRisk: "4B - High",
          mitigationMeasure: "Mandate 8-hour classroom briefing + practical simulation before go-live.",
          residualRisk: "1E - Low",
          actionOwner: initiatorName,
          deadline: targetDate,
          status: "open"
        }
      ]
    });

    setInitiateModalOpen(false);
    setTitle('');
    setReason('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400">Initiation & Risk Assessment</span>;
      case 'hod_reviewed':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">HoD Reviewed</span>;
      case 'sqm_reviewed':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">SQM Approved</span>;
      case 'ae_approved':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">AE Authorized</span>;
      case 'implemented':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400">Change Implemented</span>;
      case 'closed':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Post-Review Verified & Closed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <GitBranch className="w-6 h-6 text-blue-500" />
            <span>{t.moc.title}</span>
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t.moc.subtitle}
          </p>
        </div>

        <button
          onClick={() => setInitiateModalOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.moc.initiateBtn}</span>
        </button>
      </div>

      {/* MoC Projects Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mocs.map((moc) => (
          <div
            key={moc.id}
            className={`rounded-2xl p-5 shadow-xl space-y-4 border transition-all flex flex-col justify-between ${
              isDark 
                ? 'bg-slate-900 border-slate-800 hover:border-slate-700' 
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-slate-200'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                  isDark ? 'bg-blue-900/60 text-blue-300 border-blue-800/80' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {moc.id}
                </span>
                {getStatusBadge(moc.status)}
              </div>

              <h3 className={`text-sm font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {moc.title}
              </h3>

              <div className={`text-[11px] flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>Category: <strong className={`capitalize ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{moc.category.replace('_', ' ')}</strong></span>
                <span>·</span>
                <span>Dept: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{moc.department}</strong></span>
              </div>

              <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {moc.reasonForChange}
              </p>

              {/* 4-Tier Governance Strip */}
              <div className={`rounded-xl p-2.5 space-y-1.5 text-[11px] border ${
                isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={`text-[10px] uppercase font-bold tracking-wider block ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {t.moc.approvals}
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className={`p-1 rounded border font-medium ${
                    moc.approvals.hodApproved 
                      ? isDark ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    HoD {moc.approvals.hodApproved ? '✓' : '...'}
                  </div>
                  <div className={`p-1 rounded border font-medium ${
                    moc.approvals.sqmApproved 
                      ? isDark ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    SQM {moc.approvals.sqmApproved ? '✓' : '...'}
                  </div>
                  <div className={`p-1 rounded border font-medium ${
                    moc.approvals.aeApproved 
                      ? isDark ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    AE {moc.approvals.aeApproved ? '✓' : '...'}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-between pt-3 border-t text-xs ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <span className={`text-[11px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                Target: {moc.targetImplementationDate}
              </span>

              <button
                onClick={() => setSelectedMoC(moc)}
                className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                  isDark 
                    ? 'bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border-blue-500/30' 
                    : 'bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border-blue-200'
                }`}
              >
                Change Workspace →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MoC Workspace Modal */}
      {selectedMoC && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className={`border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Header */}
            <div className={`flex items-start justify-between border-b pb-3 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-base font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{selectedMoC.id}</span>
                  {getStatusBadge(selectedMoC.status)}
                </div>
                <h2 className={`text-base font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {selectedMoC.title}
                </h2>
                <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Initiated by {selectedMoC.initiatorName} · {selectedMoC.department} on {selectedMoC.initiationDate}
                </div>
              </div>
              <button 
                onClick={() => setSelectedMoC(null)} 
                className={`p-1 rounded-lg cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reason */}
            <div className={`border rounded-xl p-4 text-xs space-y-1 ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Operational Rationale & Business Justification
              </span>
              <p className={`leading-relaxed font-sans ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{selectedMoC.reasonForChange}</p>
            </div>

            {/* Hazard Identification & Mitigation Matrix */}
            <div className="space-y-2">
              <span className={`text-xs font-bold uppercase tracking-wider block ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                {t.moc.hazardTable}
              </span>
              <div className={`border rounded-xl overflow-x-auto ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <table className="w-full text-left rtl:text-right text-xs">
                  <thead>
                    <tr className={`border-b text-[10px] font-bold uppercase ${
                      isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      <th className="py-2.5 px-3">Hazard Description</th>
                      <th className="py-2.5 px-3">Initial Risk</th>
                      <th className="py-2.5 px-3">Mitigation Action</th>
                      <th className="py-2.5 px-3">Residual Risk</th>
                      <th className="py-2.5 px-3">Owner</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'
                  }`}>
                    {selectedMoC.hazards.map((h) => (
                      <tr key={h.id}>
                        <td className={`py-2 px-3 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{h.hazardDescription}</td>
                        <td className="py-2 px-3 text-red-500 font-mono text-[11px] font-semibold">{h.initialRisk}</td>
                        <td className="py-2 px-3">{h.mitigationMeasure}</td>
                        <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-semibold">{h.residualRisk}</td>
                        <td className={`py-2 px-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h.actionOwner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Multi-Tier Approval Chain */}
            <div className={`border rounded-xl p-4 space-y-3 text-xs ${
              isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/80 border-slate-200'
            }`}>
              <span className={`text-xs font-bold uppercase tracking-wider block ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                4-Tier Approval Governance Gateway
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. HoD */}
                <div className={`p-3 rounded-lg border space-y-2 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>1. Department Head (HoD)</span>
                  {selectedMoC.approvals.hodApproved ? (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Approved on {selectedMoC.approvals.hodDate} by {selectedMoC.approvals.hodName}</div>
                  ) : (
                    <button
                      onClick={() => {
                        updateMoCApproval(selectedMoC.id, 'hod', 'Capt. Sherif Nour (HoD)');
                        setSelectedMoC({
                          ...selectedMoC,
                          status: 'hod_reviewed',
                          approvals: { ...selectedMoC.approvals, hodApproved: true, hodName: 'Capt. Sherif Nour', hodDate: new Date().toISOString().substring(0, 10) }
                        });
                      }}
                      className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm w-full cursor-pointer"
                    >
                      Sign HoD Approval
                    </button>
                  )}
                </div>

                {/* 2. SQM */}
                <div className={`p-3 rounded-lg border space-y-2 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>2. Safety & Quality Manager</span>
                  {selectedMoC.approvals.sqmApproved ? (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Approved on {selectedMoC.approvals.sqmDate} by {selectedMoC.approvals.sqmName}</div>
                  ) : selectedMoC.approvals.hodApproved ? (
                    <button
                      onClick={() => {
                        updateMoCApproval(selectedMoC.id, 'sqm', 'Dr. Khaled Fawzy (SQM)');
                        setSelectedMoC({
                          ...selectedMoC,
                          status: 'sqm_reviewed',
                          approvals: { ...selectedMoC.approvals, sqmApproved: true, sqmName: 'Dr. Khaled Fawzy', sqmDate: new Date().toISOString().substring(0, 10) }
                        });
                      }}
                      className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm w-full cursor-pointer"
                    >
                      Sign SQM Approval
                    </button>
                  ) : (
                    <div className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Awaiting HoD Review</div>
                  )}
                </div>

                {/* 3. Accountable Executive */}
                <div className={`p-3 rounded-lg border space-y-2 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>3. Accountable Executive (AE)</span>
                  {selectedMoC.approvals.aeApproved ? (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Authorized on {selectedMoC.approvals.aeDate} by {selectedMoC.approvals.aeName}</div>
                  ) : selectedMoC.approvals.sqmApproved ? (
                    <button
                      onClick={() => {
                        updateMoCApproval(selectedMoC.id, 'ae', 'Gen. Adel Radwan (AE)');
                        setSelectedMoC({
                          ...selectedMoC,
                          status: 'ae_approved',
                          approvals: { ...selectedMoC.approvals, aeApproved: true, aeName: 'Gen. Adel Radwan', aeDate: new Date().toISOString().substring(0, 10) }
                        });
                      }}
                      className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm w-full cursor-pointer"
                    >
                      Authorize (AE)
                    </button>
                  ) : (
                    <div className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Awaiting SQM Approval</div>
                  )}
                </div>
              </div>
            </div>

            {/* Implementation & Post Review */}
            <div className={`border rounded-xl p-4 space-y-3 text-xs ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`text-xs font-bold uppercase tracking-wider block ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                {t.moc.postReview}
              </span>

              {selectedMoC.status === 'ae_approved' && (
                <button
                  onClick={() => {
                    markMoCImplemented(selectedMoC.id);
                    setSelectedMoC({ ...selectedMoC, status: 'implemented' });
                  }}
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  Confirm Physical Implementation Live on Ramp
                </button>
              )}

              {selectedMoC.status === 'implemented' && (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={postReviewNotes}
                    onChange={(e) => setPostReviewNotes(e.target.value)}
                    placeholder="Enter 30-day post-implementation verification remarks (confirm zero safety anomalies)..."
                    className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <button
                    onClick={() => {
                      completeMoCPostReview(selectedMoC.id, postReviewNotes || 'Post-implementation review completed successfully.');
                      setSelectedMoC({
                        ...selectedMoC,
                        status: 'closed',
                        postReviewDone: true,
                        postReviewNotes: postReviewNotes || 'Post-implementation review completed successfully.'
                      });
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
                  >
                    Verify 30-Day Operation & Formally Close MoC
                  </button>
                </div>
              )}

              {selectedMoC.postReviewDone && (
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Post-Review Completed: {selectedMoC.postReviewNotes}</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Initiate MoC Modal */}
      {initiateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleInitiateSubmit} className={`border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <GitBranch className="w-4 h-4 text-blue-500" />
                Initiate Management of Change (MoC)
              </h3>
              <button 
                type="button" 
                onClick={() => setInitiateModalOpen(false)} 
                className={`p-1 rounded cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className={`text-[11px] block mb-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Change Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. Relocation of GSE Charging Stations on Stand 5"
                  className={`w-full px-3 py-1.5 rounded-lg border font-medium focus:outline-none focus:border-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-[11px] block mb-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MoCCategory)}
                    className={`w-full px-3 py-1.5 rounded-lg border focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="equipment">GSE Equipment</option>
                    <option value="sop_revision">SOP / IGOM Revision</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="organizational">Organizational</option>
                    <option value="new_airline">New Carrier Handling</option>
                  </select>
                </div>
                <div>
                  <label className={`text-[11px] block mb-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-[11px] block mb-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Initiator Name</label>
                  <input
                    type="text"
                    value={initiatorName}
                    onChange={(e) => setInitiatorName(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[11px] block mb-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Target Implementation Date</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border font-mono focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-[11px] block mb-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Reason & Operational Scope</label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe why this change is necessary and what operational benefits/risks are anticipated..."
                  className={`w-full px-3 py-1.5 rounded-lg border focus:outline-none focus:border-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className={`flex items-center justify-end gap-2 pt-3 border-t ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <button 
                type="button" 
                onClick={() => setInitiateModalOpen(false)} 
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Initiate MoC Project
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
