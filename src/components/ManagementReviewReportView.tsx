import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { 
  FileCheck2, 
  Printer, 
  Download, 
  RefreshCw, 
  CheckSquare, 
  Square, 
  Languages, 
  ShieldCheck,
  Plane
} from 'lucide-react';

export const ManagementReviewReportView: React.FC = () => {
  const { 
    language: appLanguage, 
    reviewSelections, 
    setReviewSelections,
    reports,
    spis,
    findings,
    bulletins,
    mocs,
    gseFleet,
    trainingRecords
  } = useApp();

  const [reportLang, setReportLang] = useState<'en' | 'ar'>(appLanguage);
  const t = translations[reportLang];

  const toggleSection = (key: keyof typeof reviewSelections) => {
    setReviewSelections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAll = () => {
    setReviewSelections({
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
  };

  const deselectAll = () => {
    setReviewSelections({
      safetyPolicy: false,
      spiPerformance: false,
      incidentHeatmap: false,
      auditNonConformities: false,
      capaAging: false,
      safetyBulletins: false,
      mocProgress: false,
      gseReliability: false,
      trainingCompliance: false,
      resourceDirectives: false,
    });
  };

  // Export to Word (.doc)
  const exportToWord = () => {
    const reportElem = document.getElementById('printable-management-report');
    if (!reportElem) return;

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>RMF Management Review Report</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 20px; color: #111; direction: ${reportLang === 'ar' ? 'rtl' : 'ltr'}; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: ${reportLang === 'ar' ? 'right' : 'left'}; font-size: 11pt; }
          th { background-color: #f2f2f2; font-weight: bold; }
          h1 { color: #1e3a8a; font-size: 20pt; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; }
          h2 { color: #1e40af; font-size: 14pt; margin-top: 25px; }
          .header-box { border: 2px solid #1e3a8a; padding: 15px; margin-bottom: 20px; background-color: #f8fafc; }
        </style>
      </head>
      <body>
        ${reportElem.innerHTML}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RMF-SQMS-Management-Review-Report-2026-${reportLang.toUpperCase()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export to PDF via Window Print
  const exportToPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-blue-400" />
            <span>{t.mgmtReview.title}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.mgmtReview.subtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setReportLang(reportLang === 'en' ? 'ar' : 'en')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
            title="Toggle Report Language"
          >
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            <span>{reportLang === 'en' ? 'Generate Arabic Report' : 'Generate English Report'}</span>
          </button>

          <button
            onClick={exportToWord}
            className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.mgmtReview.exportWord}</span>
          </button>

          <button
            onClick={exportToPdf}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.mgmtReview.exportPdf}</span>
          </button>
        </div>
      </div>

      {/* Configurable Section Checkboxes Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 no-print">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            {t.mgmtReview.configureTitle}
          </span>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <button onClick={selectAll} className="hover:text-blue-400">Select All</button>
            <span>·</span>
            <button onClick={deselectAll} className="hover:text-blue-400">Clear All</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-slate-300">
          {(Object.keys(reviewSelections) as (keyof typeof reviewSelections)[]).map((key) => {
            const isChecked = reviewSelections[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleSection(key)}
                className={`p-2 rounded-lg border text-left rtl:text-right flex items-center gap-2 transition-colors ${
                  isChecked
                    ? 'bg-blue-950/40 border-blue-600/50 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <span className="truncate">{t.mgmtReview.sections[key]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rendered Management Review Document (Print & Export Container) */}
      <div
        id="printable-management-report"
        dir={reportLang === 'ar' ? 'rtl' : 'ltr'}
        className="bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-8 font-sans border border-slate-300"
      >
        
        {/* Official Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-900 font-black text-sm tracking-wider uppercase">
              <Plane className="w-5 h-5 -rotate-45" />
              <span>{t.station.company}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.mgmtReview.reportTitle}
            </h1>
            <p className="text-xs text-slate-600 font-semibold">
              {t.mgmtReview.reportHeader} · ICAO Doc 9859 & IATA ISAGO Conformance
            </p>
          </div>

          <div className="text-right rtl:text-left font-mono text-xs text-slate-600 shrink-0">
            <div>Doc Ref: <strong>RMF-MR-2026-01</strong></div>
            <div>Date: <strong>October 2026</strong></div>
            <div>Status: <span className="text-emerald-700 font-bold">APPROVED (AE)</span></div>
          </div>
        </div>

        {/* 1. Safety Policy */}
        {reviewSelections.safetyPolicy && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-blue-900 border-b border-slate-200 pb-1 uppercase">
              {t.mgmtReview.sections.safetyPolicy}
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs leading-relaxed text-slate-700 space-y-2">
              <p>
                {reportLang === 'ar'
                  ? "تلتزم إدارة الخدمات الأرضية بمطار مرسى علم الدولي بتقديم أعلى معايير السلامة والجودة لجميع شركات الطيران المشغلة وركابها. نؤكد التزامنا التام بمبادئ ثقافة العدالة (Just Culture)، وتوفير الموارد الكافية لصيانة أسطول المعدات، وتدريب الكوادر الميدانية وفقاً لأحدث معايير IATA ISAGO و IGOM."
                  : "Marsa Alam Ground Handling Services (MAGS) leadership is unequivocally dedicated to operating with zero harm across all apron turnarounds. Under our Just Culture mandate, personnel are empowered to halt operations immediately upon observing any unmitigated hazard without fear of reprisal."}
              </p>
              <div className="pt-2 font-bold text-slate-900">
                Gen. Adel Radwan — Accountable Executive (AE)
              </div>
            </div>
          </section>
        )}

        {/* 2. SPI Performance */}
        {reviewSelections.spiPerformance && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-blue-900 border-b border-slate-200 pb-1 uppercase">
              {t.mgmtReview.sections.spiPerformance}
            </h2>
            <table className="w-full text-xs text-left rtl:text-right border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-800">
                  <th className="p-2 border border-slate-200">Code</th>
                  <th className="p-2 border border-slate-200">Indicator Name</th>
                  <th className="p-2 border border-slate-200">Baseline</th>
                  <th className="p-2 border border-slate-200">Target (SPT)</th>
                  <th className="p-2 border border-slate-200">Current Reading</th>
                  <th className="p-2 border border-slate-200">Alert Limit</th>
                  <th className="p-2 border border-slate-200">Performance Status</th>
                </tr>
              </thead>
              <tbody>
                {spis.map((s) => (
                  <tr key={s.id} className="border-b border-slate-200">
                    <td className="p-2 font-mono font-bold border border-slate-200">{s.code}</td>
                    <td className="p-2 font-medium border border-slate-200">{reportLang === 'ar' ? s.nameAr : s.name}</td>
                    <td className="p-2 font-mono border border-slate-200">{s.baseline} {s.unit}</td>
                    <td className="p-2 font-mono font-bold text-emerald-700 border border-slate-200">{s.targetSPT} {s.unit}</td>
                    <td className="p-2 font-mono font-bold border border-slate-200">{s.currentValue} {s.unit}</td>
                    <td className="p-2 font-mono text-red-700 border border-slate-200">{s.alertThreshold} {s.unit}</td>
                    <td className="p-2 border border-slate-200 font-bold capitalize">
                      {s.status === 'nominal' ? '✓ Within Target' : s.status === 'warning' ? '⚠ Warning' : '✕ Alert Exceeded'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* 3. Incidents Heatmap */}
        {reviewSelections.incidentHeatmap && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-blue-900 border-b border-slate-200 pb-1 uppercase">
              {t.mgmtReview.sections.incidentHeatmap}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Total Reports YTD</span>
                <span className="text-xl font-bold font-mono text-slate-900">38 Reports</span>
                <span className="text-[10px] text-slate-500 block">100% acknowledged within 30 min</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Pre-Mitigation High/Critical</span>
                <span className="text-xl font-bold font-mono text-amber-700">6 Incidents</span>
                <span className="text-[10px] text-slate-500 block">All mitigated to ALARP level</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Aircraft Contact / Damage</span>
                <span className="text-xl font-bold font-mono text-emerald-700">0.0 Rate</span>
                <span className="text-[10px] text-slate-500 block">Zero ground damage achieved</span>
              </div>
            </div>
          </section>
        )}

        {/* 4. Audit Non-Conformities */}
        {reviewSelections.auditNonConformities && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-blue-900 border-b border-slate-200 pb-1 uppercase">
              {t.mgmtReview.sections.auditNonConformities}
            </h2>
            <table className="w-full text-xs text-left rtl:text-right border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-800">
                  <th className="p-2 border border-slate-200">Finding ID</th>
                  <th className="p-2 border border-slate-200">Standard Clause</th>
                  <th className="p-2 border border-slate-200">Severity</th>
                  <th className="p-2 border border-slate-200">Responsible Dept</th>
                  <th className="p-2 border border-slate-200">Status</th>
                </tr>
              </thead>
              <tbody>
                {findings.map((f) => (
                  <tr key={f.id} className="border-b border-slate-200">
                    <td className="p-2 font-mono font-bold border border-slate-200">{f.id}</td>
                    <td className="p-2 border border-slate-200 font-semibold">{f.standardReference}</td>
                    <td className="p-2 border border-slate-200">{f.severityLevel}</td>
                    <td className="p-2 border border-slate-200">{f.assignedDepartment}</td>
                    <td className="p-2 border border-slate-200 font-mono capitalize">{f.lifecycleStage.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* 5. CAPA Aging */}
        {reviewSelections.capaAging && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-blue-900 border-b border-slate-200 pb-1 uppercase">
              {t.mgmtReview.sections.capaAging}
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs leading-relaxed text-slate-700">
              Average CAPA closure cycle time at RMF station is currently <strong className="font-mono text-slate-900">14.2 days</strong> (well below the IATA ISAGO 30-day mandate). All Level 1 findings are closed within 7 days.
            </div>
          </section>
        )}

        {/* 6. Safety Bulletins */}
        {reviewSelections.safetyBulletins && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-blue-900 border-b border-slate-200 pb-1 uppercase">
              {t.mgmtReview.sections.safetyBulletins}
            </h2>
            <table className="w-full text-xs text-left rtl:text-right border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-800">
                  <th className="p-2 border border-slate-200">Ref #</th>
                  <th className="p-2 border border-slate-200">Bulletin Title</th>
                  <th className="p-2 border border-slate-200">Issue Date</th>
                  <th className="p-2 border border-slate-200">Staff Acknowledged</th>
                </tr>
              </thead>
              <tbody>
                {bulletins.map((b) => (
                  <tr key={b.id} className="border-b border-slate-200">
                    <td className="p-2 font-mono font-bold border border-slate-200">{b.refNumber}</td>
                    <td className="p-2 font-medium border border-slate-200">{reportLang === 'ar' ? b.titleAr : b.title}</td>
                    <td className="p-2 font-mono border border-slate-200">{b.issueDate}</td>
                    <td className="p-2 font-mono font-bold text-emerald-700 border border-slate-200">
                      {b.acknowledgments.length} / {b.requiredStaffCount} ({Math.round((b.acknowledgments.length / b.requiredStaffCount) * 100)}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* 7. Management of Change (MoC) */}
        {reviewSelections.mocProgress && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-blue-900 border-b border-slate-200 pb-1 uppercase">
              {t.mgmtReview.sections.mocProgress}
            </h2>
            <table className="w-full text-xs text-left rtl:text-right border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-800">
                  <th className="p-2 border border-slate-200">MoC ID</th>
                  <th className="p-2 border border-slate-200">Project Title</th>
                  <th className="p-2 border border-slate-200">Category</th>
                  <th className="p-2 border border-slate-200">Approval Stage</th>
                </tr>
              </thead>
              <tbody>
                {mocs.map((m) => (
                  <tr key={m.id} className="border-b border-slate-200">
                    <td className="p-2 font-mono font-bold border border-slate-200">{m.id}</td>
                    <td className="p-2 font-medium border border-slate-200">{m.title}</td>
                    <td className="p-2 border border-slate-200 capitalize">{m.category.replace('_', ' ')}</td>
                    <td className="p-2 font-mono font-bold border border-slate-200 capitalize">{m.status.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* 8. GSE Fleet Reliability */}
        {reviewSelections.gseReliability && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-blue-900 border-b border-slate-200 pb-1 uppercase">
              {t.mgmtReview.sections.gseReliability}
            </h2>
            <div className="grid grid-cols-3 gap-3 text-xs text-center font-mono">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
                <span className="block text-xl font-bold">
                  {gseFleet.filter(g => g.tagStatus === 'green').length}
                </span>
                <span>Green Tag (Fit)</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                <span className="block text-xl font-bold">
                  {gseFleet.filter(g => g.tagStatus === 'amber').length}
                </span>
                <span>Amber Tag (Service Due)</span>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <span className="block text-xl font-bold">
                  {gseFleet.filter(g => g.tagStatus === 'red').length}
                </span>
                <span>Red Tag (Grounded)</span>
              </div>
            </div>
          </section>
        )}

        {/* 9. Training Compliance */}
        {reviewSelections.trainingCompliance && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-blue-900 border-b border-slate-200 pb-1 uppercase">
              {t.mgmtReview.sections.trainingCompliance}
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs leading-relaxed text-slate-700">
              Station recurrent training compliance across IATA Dangerous Goods CBTA (Categories 7 & 8) and Airside Driving Permits (ADP) stands at <strong className="font-mono text-emerald-700">96.4%</strong>. Zero uncertified operators active on ramp.
            </div>
          </section>
        )}

        {/* 10. Strategic Directives */}
        {reviewSelections.resourceDirectives && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-blue-900 border-b border-slate-200 pb-1 uppercase">
              {t.mgmtReview.sections.resourceDirectives}
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs leading-relaxed text-slate-700 space-y-2">
              <p>
                <strong>Directive 2026-04:</strong> Commission secondary GSE solar fast-charging hub on Stand 7 by Q1 2027.
              </p>
              <p>
                <strong>Directive 2026-05:</strong> Extend apron FOD digital scanning sensors trial to Stands 8 through 12.
              </p>
            </div>
          </section>
        )}

        {/* Signatures Block */}
        <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs font-sans">
          <div>
            <div className="text-slate-500 mb-6">Prepared by Lead Auditor & SQM:</div>
            <div className="font-bold text-slate-900">Dr. Khaled Fawzy</div>
            <div className="text-[11px] text-slate-500">Safety & Quality Manager</div>
          </div>
          <div className="text-right rtl:text-left">
            <div className="text-slate-500 mb-6">Approved by Accountable Executive:</div>
            <div className="font-bold text-slate-900">Gen. Adel Radwan</div>
            <div className="text-[11px] text-slate-500">Accountable Executive (AE)</div>
          </div>
        </div>

      </div>

    </div>
  );
};
