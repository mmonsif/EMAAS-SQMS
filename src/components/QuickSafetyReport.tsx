import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { ReportCategory, RiskLevel } from '../types/index.ts';
import { 
  ShieldAlert, 
  Camera, 
  MapPin, 
  Plane, 
  CheckCircle2, 
  Copy, 
  Check, 
  Printer, 
  ArrowRight, 
  Clock, 
  AlertOctagon,
  FileText,
  Sliders,
  Settings,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

export const QuickSafetyReport: React.FC = () => {
  const { 
    language, 
    addSafetyReport, 
    setActiveView, 
    gseFleet, 
    safetyFormConfig,
    activeRole,
    isViewPermitted 
  } = useApp();
  
  const t = translations[language];
  const canConfigureForm = isViewPermitted('formConfig', activeRole);

  const activeCategories = safetyFormConfig.categories.filter(c => c.isActive);

  // Fast-form state
  const [category, setCategory] = useState<string>(activeCategories[0]?.key || 'hazard');
  const [reporterType, setReporterType] = useState<'anonymous' | 'identified'>(
    safetyFormConfig.enableAnonymous ? 'anonymous' : 'identified'
  );
  const [reporterName, setReporterName] = useState('');
  const [reporterBadge, setReporterBadge] = useState('');
  const [department, setDepartment] = useState('Operations - Ramp Services');
  const [location, setLocation] = useState(safetyFormConfig.locations[0] || 'Apron Stand 4');
  const [flightNumber, setFlightNumber] = useState('');
  const [aircraftReg, setAircraftReg] = useState('');
  const [gseIdLinked, setGseIdLinked] = useState('');
  const [description, setDescription] = useState('');
  const [photoSimulated, setPhotoSimulated] = useState(false);

  // Validation feedback state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync category & reporter mode if config changes
  useEffect(() => {
    if (!safetyFormConfig.enableAnonymous && reporterType === 'anonymous') {
      setReporterType('identified');
    }
  }, [safetyFormConfig.enableAnonymous, reporterType]);

  useEffect(() => {
    if (activeCategories.length > 0 && !activeCategories.some(c => c.key === category)) {
      setCategory(activeCategories[0].key);
    }
  }, [safetyFormConfig.categories, category]);

  // ICAO 5x5 Risk Matrix Selection
  const [severity, setSeverity] = useState<number>(3); // 1 to 5
  const [likelihood, setLikelihood] = useState<string>('C'); // A to E

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<{ id: string; timestamp: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Pre-calculated ICAO Risk Index Matrix
  const calculateRiskIndex = (sev: number, like: string): { score: string; level: RiskLevel; color: string } => {
    const score = `${sev}${like}`;
    // Critical (Red): 5A, 5B, 4A, 4B, 5C
    if (sev >= 4 && (like === 'A' || like === 'B' || like === 'C')) {
      return { score, level: 'Critical', color: 'bg-red-500/20 text-red-400 border-red-500/40' };
    }
    // High (Amber-Red): 3A, 3B, 4C, 4D, 5D
    if ((sev === 3 && (like === 'A' || like === 'B')) || (sev >= 4 && like === 'D') || (sev === 5 && like === 'E')) {
      return { score, level: 'High', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
    }
    // Medium (Amber): 2A, 2B, 3C, 3D, 4E
    if ((sev === 2 && (like === 'A' || like === 'B')) || (sev === 3 && (like === 'C' || like === 'D')) || (sev === 4 && like === 'E')) {
      return { score, level: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' };
    }
    // Low (Green)
    return { score, level: 'Low', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
  };

  const currentRisk = calculateRiskIndex(severity, likelihood);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Description validation
    if (!description.trim() || description.trim().length < safetyFormConfig.minDescriptionLength) {
      setValidationError(
        language === 'ar'
          ? `يرجى إدخال وصف كافٍ للواقعة (الحد الأدنى ${safetyFormConfig.minDescriptionLength} أحرف).`
          : `Please provide a detailed description (minimum ${safetyFormConfig.minDescriptionLength} characters required by station policy).`
      );
      return;
    }

    // 2. Flight Number mandatory check
    if (safetyFormConfig.enableFlightNumber && safetyFormConfig.requireFlightNumber && !flightNumber.trim()) {
      setValidationError(
        language === 'ar'
          ? 'رقم الرحلة مطلوب وفقاً لإعدادات المحطة.'
          : 'Flight Number is mandatory under current station policy.'
      );
      return;
    }

    // 3. Aircraft Reg mandatory check
    if (safetyFormConfig.enableAircraftReg && safetyFormConfig.requireAircraftReg && !aircraftReg.trim()) {
      setValidationError(
        language === 'ar'
          ? 'تسجيل الطائرة مطلوب وفقاً لإعدادات المحطة.'
          : 'Aircraft Registration is mandatory under current station policy.'
      );
      return;
    }

    // 4. GSE Link mandatory check
    if (safetyFormConfig.enableGSELink && safetyFormConfig.requireGSELink && !gseIdLinked) {
      setValidationError(
        language === 'ar'
          ? 'يرجى اختيار معدة المهبط (GSE) المرتبطة بالواقعة.'
          : 'Linked GSE Equipment selection is mandatory.'
      );
      return;
    }

    // 5. Photo Upload mandatory check
    if (safetyFormConfig.enablePhotoUpload && safetyFormConfig.requirePhotoUpload && !photoSimulated) {
      setValidationError(
        language === 'ar'
          ? 'إرفاق صورة أو دليل مصور مطلوب لهذا البلاغ.'
          : 'Photo evidence attachment is mandatory for this report.'
      );
      return;
    }

    // 6. Identified reporter check
    if (reporterType === 'identified' && !reporterName.trim()) {
      setValidationError(
        language === 'ar'
          ? 'يرجى إدخال اسم الموظف عند اختيار بلاغ معرّف الهوية.'
          : 'Please enter your name for identified reporting.'
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newReport = addSafetyReport({
        reporterType,
        reporterName: reporterType === 'identified' ? reporterName : undefined,
        reporterBadge: reporterType === 'identified' ? reporterBadge : undefined,
        department,
        category: category as ReportCategory,
        location,
        standNumber: location.startsWith('Apron Stand') ? location.replace('Apron ', '') : undefined,
        flightNumber: flightNumber.trim() ? flightNumber.toUpperCase() : undefined,
        aircraftReg: aircraftReg.trim() ? aircraftReg.toUpperCase() : undefined,
        gseIdLinked: gseIdLinked || undefined,
        description: description.trim(),
        photoUrl: photoSimulated ? 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80' : undefined,
        preMitigationRisk: safetyFormConfig.enableRiskMatrix ? {
          severity,
          likelihood,
          scoreCode: currentRisk.score,
          level: currentRisk.level
        } : undefined
      });

      setIsSubmitting(false);
      setSubmissionReceipt({ id: newReport.id, timestamp: newReport.timestamp });
    }, 450);
  };

  const handleCopyCode = () => {
    if (submissionReceipt) {
      navigator.clipboard.writeText(submissionReceipt.id);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Admin Quick Action Banner: if current role has permission to configure form */}
      {canConfigureForm && (
        <div className="p-3 bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Admin Mode:</strong> You have authorization to customize this safety reporting form, mandatory fields, and hazard categories.
            </span>
          </div>
          <button
            onClick={() => setActiveView('formConfig')}
            className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{t.formConfig.title.split('(')[0]}</span>
          </button>
        </div>
      )}

      {/* Landing Hero Banner with Fast 30-Second Guarantee */}
      <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-slate-900 border border-blue-800/60 rounded-2xl p-5 sm:p-6 text-slate-100 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-red-600/30 border border-red-500/40 text-red-400 text-[11px] font-bold tracking-wide uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 animate-spin" />
                30-Second Express Form
              </span>
              <span className="text-[11px] text-blue-300 font-medium">
                {t.quickReport.badgeJustCulture}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t.quickReport.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {t.quickReport.subtitle}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {isViewPermitted('incidentLogs', activeRole) && (
              <button
                type="button"
                onClick={() => setActiveView('incidentLogs')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t.quickReport.viewInLog}</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Statutory Just Culture Statement */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {language === 'ar' ? safetyFormConfig.customDisclaimerAr : safetyFormConfig.customDisclaimerEn}
          </p>
        </div>
      </div>

      {/* Confirmation Success Receipt Screen */}
      {submissionReceipt ? (
        <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-white">
              {t.quickReport.successTitle}
            </h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              {t.quickReport.successMessage}
            </p>
          </div>

          {/* Reference Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 max-w-sm mx-auto space-y-2">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
              {t.quickReport.trackingCode}
            </span>
            <div className="font-mono text-2xl font-bold text-blue-400 tracking-wider">
              {submissionReceipt.id}
            </div>
            <div className="text-[11px] text-slate-500">
              Logged at {submissionReceipt.timestamp} · RMF Queue
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? t.quickReport.copied : t.quickReport.copyCode}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.quickReport.printReceipt}</span>
            </button>

            <button
              onClick={() => {
                setSubmissionReceipt(null);
                setDescription('');
                setPhotoSimulated(false);
                setValidationError(null);
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-colors"
            >
              <span>{t.quickReport.submitAnother}</span>
            </button>

            {isViewPermitted('incidentLogs', activeRole) && (
              <button
                onClick={() => setActiveView('incidentLogs')}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <span>{t.quickReport.viewInLog}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            )}
          </div>
        </div>
      ) : (

        /* Fast-Form Container */
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl">
          
          {/* Validation Alert */}
          {validationError && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* 1. Report Category Selector Grid (Dynamically rendered from safetyFormConfig) */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-blue-400" />
              <span>{t.quickReport.reportType}</span>
              <span className="text-[11px] text-slate-400 lowercase font-normal">
                ({activeCategories.length} categories)
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {activeCategories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`p-3 rounded-xl border text-left rtl:text-right transition-all flex items-start gap-2.5 ${
                    category === cat.key
                      ? 'bg-blue-950/60 border-blue-500 text-white shadow-md shadow-blue-500/10'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{cat.icon}</span>
                  <div className="truncate">
                    <span className="text-xs font-bold block truncate">
                      {language === 'ar' ? cat.labelAr : cat.labelEn}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {language === 'ar' ? cat.descAr : cat.descEn}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Reporter Mode (Respects safetyFormConfig.enableAnonymous) */}
          <div className="space-y-2 bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {t.quickReport.reporterMode}
              </label>
              
              {safetyFormConfig.enableAnonymous ? (
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setReporterType('anonymous')}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      reporterType === 'anonymous'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t.quickReport.anonymous}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReporterType('identified')}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      reporterType === 'identified'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t.quickReport.identified}
                  </button>
                </div>
              ) : (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Identified Only (Admin Enforced)
                </span>
              )}
            </div>

            {reporterType === 'identified' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    {t.quickReport.staffName} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="E.g. Ahmed Mansour"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">{t.quickReport.badgeNumber}</label>
                  <input
                    type="text"
                    value={reporterBadge}
                    onChange={(e) => setReporterBadge(e.target.value)}
                    placeholder="E.g. RMF-7842"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Location Selector & Configured Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{t.quickReport.location}</span>
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-slate-950/40 rounded-xl border border-slate-800">
              {safetyFormConfig.locations.map((stand) => (
                <button
                  key={stand}
                  type="button"
                  onClick={() => setLocation(stand)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    location === stand
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {stand}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Operational Context (Conditionally enabled by safetyFormConfig) */}
          {(safetyFormConfig.enableFlightNumber || safetyFormConfig.enableAircraftReg || safetyFormConfig.enableGSELink) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {safetyFormConfig.enableFlightNumber && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                    <Plane className="w-3.5 h-3.5 text-blue-400" />
                    <span>{t.quickReport.flightNumber}</span>
                    {safetyFormConfig.requireFlightNumber && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="E.g. MS 451 / WK 234"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {safetyFormConfig.enableAircraftReg && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    <span>{t.quickReport.aircraftReg}</span>
                    {safetyFormConfig.requireAircraftReg && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <input
                    type="text"
                    value={aircraftReg}
                    onChange={(e) => setAircraftReg(e.target.value)}
                    placeholder="E.g. SU-GDZ / HB-JLT"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {safetyFormConfig.enableGSELink && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    <span>{t.quickReport.gseLinked}</span>
                    {safetyFormConfig.requireGSELink && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <select
                    value={gseIdLinked}
                    onChange={(e) => setGseIdLinked(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">None / Not Applicable</option>
                    {gseFleet.map((gse) => (
                      <option key={gse.id} value={gse.id}>
                        {gse.id} - {gse.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            </div>
          )}

          {/* 5. Incident Narrative & Photo Simulator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-200 uppercase tracking-wider">
                {t.quickReport.description} <span className="text-red-400">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {description.trim().length} / {safetyFormConfig.minDescriptionLength} min chars
              </span>
            </div>
            
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.quickReport.descriptionPlaceholder}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
            />

            {/* Photo / Apron Camera Simulator */}
            {safetyFormConfig.enablePhotoUpload && (
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setPhotoSimulated(!photoSimulated)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    photoSimulated
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>
                    {photoSimulated ? t.quickReport.photoSimulated : t.quickReport.evidence}
                    {safetyFormConfig.requirePhotoUpload && ' *'}
                  </span>
                </button>

                {photoSimulated && (
                  <span className="text-[11px] text-emerald-400 font-mono">
                    ✓ Photo attached (RMF_Stand4_Inspection.jpg)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 6. Initial ICAO 5x5 Severity & Likelihood Matrix (Conditional) */}
          {safetyFormConfig.enableRiskMatrix && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {t.quickReport.severityMatrixTitle}
                  {safetyFormConfig.requireRiskMatrix && <span className="text-red-400 ml-1">*</span>}
                </span>
                <div className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${currentRisk.color}`}>
                  {t.quickReport.riskScore}: {currentRisk.score} ({currentRisk.level})
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1.5">
                    Severity: {severity} - {severity === 5 ? 'Catastrophic' : severity === 4 ? 'Major / Hazardous' : severity === 3 ? 'Moderate' : severity === 2 ? 'Minor' : 'Negligible'}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={severity}
                    onChange={(e) => setSeverity(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1 Negligible</span>
                    <span>3 Moderate</span>
                    <span>5 Catastrophic</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1.5">
                    Likelihood: {likelihood} - {likelihood === 'A' ? 'Frequent' : likelihood === 'B' ? 'Occasional' : likelihood === 'C' ? 'Remote' : likelihood === 'D' ? 'Improbable' : 'Extremely Improbable'}
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {['A', 'B', 'C', 'D', 'E'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setLikelihood(lvl)}
                        className={`py-1 rounded text-xs font-mono font-bold transition-all ${
                          likelihood === lvl
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !description.trim()}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-bold text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{isSubmitting ? t.quickReport.submitting : t.quickReport.submitButton}</span>
          </button>

        </form>
      )}

    </div>
  );
};
