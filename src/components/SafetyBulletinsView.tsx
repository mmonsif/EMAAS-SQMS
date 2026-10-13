import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { SafetyBulletin } from '../types/index.ts';
import { 
  Bell, 
  Plus, 
  CheckCircle, 
  X, 
  ShieldCheck, 
  AlertCircle
} from 'lucide-react';

export const SafetyBulletinsView: React.FC = () => {
  const { language, bulletins, issueBulletin, acknowledgeBulletin, activeRole } = useApp();
  const t = translations[language];

  const [selectedBulletin, setSelectedBulletin] = useState<SafetyBulletin | null>(null);
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newType, setNewType] = useState<'bulletin' | 'operational_notice'>('bulletin');
  const [newPriority, setNewPriority] = useState<'routine' | 'urgent' | 'critical'>('urgent');
  const [newSummary, setNewSummary] = useState('');
  const [newSummaryAr, setNewSummaryAr] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newActions, setNewActions] = useState('1. Conduct mandatory pre-arrival check.\n2. Verify equipment brakes.\n3. Sign shift handover.');
  const [newDepts, setNewDepts] = useState('Operations - Ramp Services, Maintenance - GSE Fleet');

  // Digital Signature input
  const [signerName, setSignerName] = useState(
    activeRole === 'field_staff' ? 'Ahmed Mansour' : 'Mahmoud Ezz'
  );
  const [signerBadge, setSignerBadge] = useState(
    activeRole === 'field_staff' ? 'RMF-7842' : 'RMF-007'
  );

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    issueBulletin({
      type: newType,
      title: newTitle,
      titleAr: newTitleAr || newTitle,
      priority: newPriority,
      summary: newSummary,
      summaryAr: newSummaryAr || newSummary,
      content: newContent || newSummary,
      contentAr: newSummaryAr || newContent,
      targetDepartments: newDepts.split(',').map(d => d.trim()),
      mandatoryActions: newActions.split('\n').filter(a => a.trim() !== ''),
      issuedBy: "Dr. Khaled Fawzy (Safety & Quality Manager)",
      requiredStaffCount: 45
    });

    setIssueModalOpen(false);
    setNewTitle('');
    setNewSummary('');
  };

  const getPriorityBadge = (p: 'routine' | 'urgent' | 'critical') => {
    switch (p) {
      case 'routine':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">Routine Notice</span>;
      case 'urgent':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">Urgent Operational Alert</span>;
      case 'critical':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">Critical Safety Directive</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-400" />
            <span>{t.bulletins.title}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.bulletins.subtitle}
          </p>
        </div>

        <button
          onClick={() => setIssueModalOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.bulletins.issueBtn}</span>
        </button>
      </div>

      {/* Bulletins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bulletins.map((b) => {
          const ackCount = b.acknowledgments.length;
          const pct = Math.round((ackCount / (b.requiredStaffCount || 1)) * 100);
          const hasAcked = b.acknowledgments.some(a => a.badgeNumber === signerBadge);

          return (
            <div
              key={b.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300">
                    {b.refNumber}
                  </span>
                  {getPriorityBadge(b.priority)}
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  {language === 'ar' ? b.titleAr : b.title}
                </h3>
                
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {language === 'ar' ? b.summaryAr : b.summary}
                </p>

                {/* Target Departments */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {b.targetDepartments.map((dept, i) => (
                    <span key={i} className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress & Verification Bar */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">{t.bulletins.acknowledgmentRate}:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {ackCount} / {b.requiredStaffCount} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Issued: {b.issueDate}
                  </span>

                  <button
                    onClick={() => setSelectedBulletin(b)}
                    className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>View & Verify Acknowledgment</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Acknowledgment Verification Drawer / Modal */}
      {selectedBulletin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 text-slate-100 animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-blue-400">{selectedBulletin.refNumber}</span>
                  {getPriorityBadge(selectedBulletin.priority)}
                </div>
                <h2 className="text-base font-bold text-white mt-1">
                  {language === 'ar' ? selectedBulletin.titleAr : selectedBulletin.title}
                </h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  Issued on <span className="font-mono text-slate-200">{selectedBulletin.issueDate}</span> by {selectedBulletin.issuedBy}
                </div>
              </div>
              <button onClick={() => setSelectedBulletin(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Official Operational Instructions
              </span>
              <p className="text-slate-200 leading-relaxed font-sans">
                {language === 'ar' ? selectedBulletin.contentAr : selectedBulletin.content}
              </p>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-bold text-amber-400 block mb-1">
                  Mandatory Operational Actions Required:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {selectedBulletin.mandatoryActions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Acknowledge Action Box */}
            <div className="bg-blue-950/20 border border-blue-800/50 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block">
                Digital Read-and-Acknowledge Verification
              </span>

              {selectedBulletin.acknowledgments.some(a => a.badgeNumber === signerBadge) ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span>You ({signerName}) have verified receipt and compliance acknowledgment for this notice.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-0.5">Staff Name</label>
                      <input
                        type="text"
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-0.5">Badge Number</label>
                      <input
                        type="text"
                        value={signerBadge}
                        onChange={(e) => setSignerBadge(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      acknowledgeBulletin(
                        selectedBulletin.id, 
                        signerName, 
                        signerBadge, 
                        activeRole === 'field_staff' ? 'Operations - Ramp Services' : 'Safety & Quality'
                      );
                      // Update modal local state
                      const updatedAcks = [
                        ...selectedBulletin.acknowledgments,
                        {
                          staffId: signerBadge,
                          staffName: signerName,
                          badgeNumber: signerBadge,
                          department: 'Operations',
                          acknowledgedAt: new Date().toISOString().substring(0, 16),
                          signature: `${signerName} (${signerBadge})`
                        }
                      ];
                      setSelectedBulletin({ ...selectedBulletin, acknowledgments: updatedAcks });
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{t.bulletins.readAndAcknowledge}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Acknowledgment Audit Log */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                {t.bulletins.auditTrail} ({selectedBulletin.acknowledgments.length} confirmed)
              </span>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl max-h-40 overflow-y-auto divide-y divide-slate-800/80 text-xs">
                {selectedBulletin.acknowledgments.length === 0 ? (
                  <div className="p-3 text-center text-slate-500">No staff members have acknowledged yet.</div>
                ) : (
                  selectedBulletin.acknowledgments.map((ack, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-white block">{ack.staffName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Badge: {ack.badgeNumber} · {ack.department}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {ack.acknowledgedAt}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Issue Bulletin Modal */}
      {issueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleIssueSubmit} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-400" />
                {t.bulletins.modal.title}
              </h3>
              <button type="button" onClick={() => setIssueModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Document Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="bulletin">Safety Bulletin (SB)</option>
                    <option value="operational_notice">Internal Operational Notice (ION)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="critical">Critical Directive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Document Title (English)</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="E.g. Aircraft Chocking Protocol During 30-Knot Wind Alert"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Document Title (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={newTitleAr}
                  onChange={(e) => setNewTitleAr(e.target.value)}
                  placeholder="بروتوكول تثبيت حواجز عجلات الطائرات أثناء تحذيرات الرياح..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Target Departments</label>
                <input
                  type="text"
                  value={newDepts}
                  onChange={(e) => setNewDepts(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Alert Summary</label>
                <textarea
                  rows={2}
                  required
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Mandatory Staff Actions (One per line)</label>
                <textarea
                  rows={2}
                  value={newActions}
                  onChange={(e) => setNewActions(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setIssueModalOpen(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300">
                Cancel
              </button>
              <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow">
                {t.bulletins.modal.publishBtn}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
