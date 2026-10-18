import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { SPIItem, SPIType, SPIDirection } from '../types/index.ts';
import { 
  TrendingUp, 
  TrendingDown,
  Minus,
  Plus, 
  Trash2, 
  Edit3, 
  Target, 
  X, 
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ShieldAlert,
  BookOpen,
  Info,
  Calendar,
  Building2,
  FileSpreadsheet,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter
} from 'lucide-react';

export const SPIManager: React.FC = () => {
  const { language, spis, addSPI, updateSPI, deleteSPI, logSPIReading, theme } = useApp();
  const t = translations[language];
  const isDark = theme === 'dark';

  // Filters & Search
  const [activeTab, setActiveTab] = useState<'all' | 'lagging' | 'leading'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'nominal' | 'warning' | 'alert'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegulatoryBanner, setShowRegulatoryBanner] = useState(true);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSPI, setEditingSPI] = useState<SPIItem | null>(null);

  // Log Reading Modal
  const [readingModalOpen, setReadingModalOpen] = useState(false);
  const [activeLogSPI, setActiveLogSPI] = useState<SPIItem | null>(null);
  const [newReadingVal, setNewReadingVal] = useState(0);
  const [readingPeriod, setReadingPeriod] = useState('');
  const [readingTurns, setReadingTurns] = useState<number | undefined>(undefined);
  const [readingNotes, setReadingNotes] = useState('');

  // History Modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [activeHistorySPI, setActiveHistorySPI] = useState<SPIItem | null>(null);

  // Form State for Add / Edit
  const [code, setCode] = useState('');
  const [type, setType] = useState<SPIType>('lagging');
  const [category, setCategory] = useState('Aircraft Ground Damage');
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('per 1,000 turns');
  const [measurementFormula, setMeasurementFormula] = useState('');
  const [applicableFramework, setApplicableFramework] = useState('ICAO Annex 19 Amdt 2 (Nov 2026) / ECAA / IATA ISAGO');
  const [ownerDepartment, setOwnerDepartment] = useState('Operations - Ramp Services');
  const [targetDirection, setTargetDirection] = useState<SPIDirection>('lower_is_better');
  const [baseline, setBaseline] = useState(0.25);
  const [baselinePeriod, setBaselinePeriod] = useState('2026 Baseline');
  const [targetSPT, setTargetSPT] = useState(0.20);
  const [sptDescription, setSptDescription] = useState('');
  const [sptDeadline, setSptDeadline] = useState('December 2027');
  const [alertThreshold, setAlertThreshold] = useState(0.30);
  const [frequency, setFrequency] = useState<'Monthly' | 'Quarterly' | 'Annual'>('Monthly');

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const total = spis.length;
    const laggingCount = spis.filter(s => s.type === 'lagging').length;
    const leadingCount = spis.filter(s => s.type === 'leading').length;
    const nominalCount = spis.filter(s => s.status === 'nominal').length;
    const warningCount = spis.filter(s => s.status === 'warning').length;
    const alertCount = spis.filter(s => s.status === 'alert').length;
    const complianceRate = total > 0 ? Math.round((nominalCount / total) * 100) : 100;

    return { total, laggingCount, leadingCount, nominalCount, warningCount, alertCount, complianceRate };
  }, [spis]);

  // Filtered List
  const filteredSpis = useMemo(() => {
    return spis.filter(spi => {
      if (activeTab === 'lagging' && spi.type !== 'lagging') return false;
      if (activeTab === 'leading' && spi.type !== 'leading') return false;
      if (statusFilter !== 'all' && spi.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = spi.code.toLowerCase().includes(q);
        const matchName = spi.name.toLowerCase().includes(q) || (spi.nameAr && spi.nameAr.includes(q));
        const matchCategory = spi.category.toLowerCase().includes(q);
        const matchFramework = spi.applicableFramework.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchCategory && !matchFramework) return false;
      }
      return true;
    });
  }, [spis, activeTab, statusFilter, searchQuery]);

  const openAddModal = () => {
    setEditingSPI(null);
    const isLag = activeTab !== 'leading';
    const nextSeq = String(spis.length + 1).padStart(2, '0');
    setCode(isLag ? `SPI-LAG-${nextSeq}` : `SPI-LED-${nextSeq}`);
    setType(isLag ? 'lagging' : 'leading');
    setCategory(isLag ? 'Aircraft Ground Damage' : 'Ramp Safety Oversight');
    setName('');
    setNameAr('');
    setDescription('');
    setUnit(isLag ? 'per 1,000 turns' : '% compliance');
    setMeasurementFormula('');
    setApplicableFramework('ICAO Annex 19 Amdt 2 (Nov 2026) / ECAA / IATA ISAGO');
    setOwnerDepartment('Operations - Ramp Services');
    setTargetDirection(isLag ? 'lower_is_better' : 'higher_is_better');
    setBaseline(isLag ? 0.3 : 90);
    setBaselinePeriod('2026 Baseline');
    setTargetSPT(isLag ? 0.2 : 95);
    setSptDescription('');
    setSptDeadline('December 2027');
    setAlertThreshold(isLag ? 0.35 : 88);
    setFrequency('Monthly');
    setModalOpen(true);
  };

  const openEditModal = (spi: SPIItem) => {
    setEditingSPI(spi);
    setCode(spi.code);
    setType(spi.type || 'lagging');
    setCategory(spi.category || 'General Safety');
    setName(spi.name);
    setNameAr(spi.nameAr);
    setDescription(spi.description);
    setUnit(spi.unit);
    setMeasurementFormula(spi.measurementFormula || '');
    setApplicableFramework(spi.applicableFramework || 'ICAO Annex 19 / ECAA');
    setOwnerDepartment(spi.ownerDepartment || 'Safety & Quality');
    setTargetDirection(spi.targetDirection || 'lower_is_better');
    setBaseline(spi.baseline);
    setBaselinePeriod(spi.baselinePeriod || '2026 Baseline');
    setTargetSPT(spi.targetSPT);
    setSptDescription(spi.sptDescription || '');
    setSptDeadline(spi.sptDeadline || 'December 2027');
    setAlertThreshold(spi.alertThreshold);
    setFrequency(spi.frequency);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSPI) {
      updateSPI(editingSPI.id, {
        code,
        type,
        category,
        name,
        nameAr: nameAr || name,
        description,
        unit,
        measurementFormula,
        applicableFramework,
        ownerDepartment,
        targetDirection,
        baseline,
        baselinePeriod,
        targetSPT,
        sptDescription: sptDescription || `${targetDirection === 'lower_is_better' ? 'Reduce' : 'Achieve'} target of ${targetSPT} ${unit}`,
        sptDeadline,
        alertThreshold,
        frequency
      });
    } else {
      addSPI({
        code,
        type,
        category,
        name,
        nameAr: nameAr || name,
        description,
        unit,
        measurementFormula,
        applicableFramework,
        ownerDepartment,
        targetDirection,
        baseline,
        baselinePeriod,
        targetSPT,
        sptDescription: sptDescription || `${targetDirection === 'lower_is_better' ? 'Reduce' : 'Achieve'} target of ${targetSPT} ${unit}`,
        sptDeadline,
        alertThreshold,
        currentValue: baseline,
        trend: 'stable',
        frequency,
        status: 'nominal'
      });
    }

    setModalOpen(false);
  };

  const openLogReading = (spi: SPIItem) => {
    setActiveLogSPI(spi);
    setNewReadingVal(spi.currentValue);
    setReadingPeriod(new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }));
    setReadingTurns(1410);
    setReadingNotes('');
    setReadingModalOpen(true);
  };

  const handleSaveReading = () => {
    if (activeLogSPI) {
      logSPIReading(activeLogSPI.id, newReadingVal, readingPeriod, readingTurns, readingNotes);
      setReadingModalOpen(false);
    }
  };

  const openHistoryModal = (spi: SPIItem) => {
    setActiveHistorySPI(spi);
    setHistoryModalOpen(true);
  };

  const getStatusBadge = (status: 'nominal' | 'warning' | 'alert') => {
    switch (status) {
      case 'nominal':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t.spis.statuses.nominal}</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>{t.spis.statuses.warning}</span>
          </span>
        );
      case 'alert':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
            <AlertOctagon className="w-3 h-3" />
            <span>{t.spis.statuses.alert}</span>
          </span>
        );
    }
  };

  const getTrendBadge = (trend: 'improving' | 'stable' | 'deteriorating') => {
    switch (trend) {
      case 'improving':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t.spis.trends.improving}</span>
          </span>
        );
      case 'stable':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
            <Minus className="w-3.5 h-3.5" />
            <span>{t.spis.trends.stable}</span>
          </span>
        );
      case 'deteriorating':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{t.spis.trends.deteriorating}</span>
          </span>
        );
    }
  };

  const exportSummaryCSV = () => {
    const headers = ['Code', 'Type', 'Category', 'Name', 'Unit', 'Baseline', 'Target SPT', 'Alert Limit', 'Current Value', 'Status', 'Trend', 'Framework'];
    const rows = filteredSpis.map(s => [
      `"${s.code}"`,
      `"${s.type}"`,
      `"${s.category}"`,
      `"${s.name}"`,
      `"${s.unit}"`,
      s.baseline,
      s.targetSPT,
      s.alertThreshold,
      s.currentValue,
      `"${s.status}"`,
      `"${s.trend}"`,
      `"${s.applicableFramework}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EMAAS_SPI_SPT_Summary_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Station & Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider font-mono">
              EMAAS GROUND HANDLING SMS
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider font-mono">
              RMF / HEMA STATION
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Target className="w-6 h-6 text-blue-400" />
            <span>{t.spis.title}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            {t.spis.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={exportSummaryCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Export CSV Table"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t.spis.addSPIBtn}</span>
          </button>
        </div>
      </div>

      {/* Regulatory Context & ICAO Annex 19 Amdt 2 / ECAA Banner */}
      {showRegulatoryBanner && (
        <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-800/40 rounded-2xl p-4 sm:p-5 text-xs text-slate-200 shadow-xl space-y-3 relative">
          <button 
            onClick={() => setShowRegulatoryBanner(false)}
            className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 pr-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{t.spis.regulatoryNoticeTitle}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/80 text-blue-300 border border-blue-700">
                  Applicable 26 Nov 2026 (ICAO Annex 19 Amdt 2)
                </span>
              </h3>
              <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                {t.spis.regulatoryNoticeText}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
            <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
              <span className="font-bold text-blue-300 block mb-0.5">🔹 SPI vs. SPT Core Definition:</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong>SPI:</strong> Measurable parameter used to monitor and assess safety performance (e.g. damage events per 1,000 aircraft turns).<br />
                <strong>SPT:</strong> Defined, measurable level of safety performance aimed to be achieved within a specified period (e.g. reduce by 20% by Dec 2027).
              </p>
            </div>

            <div className="bg-amber-950/30 p-2.5 rounded-xl border border-amber-800/40">
              <span className="font-bold text-amber-300 flex items-center gap-1 mb-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Just Culture Reporting Rule:</span>
              </span>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                {t.spis.zeroReportingWarning}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Indicators</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-mono font-black text-white">{kpiStats.total}</span>
            <span className="text-[10px] text-slate-500 font-mono">({kpiStats.laggingCount}L / {kpiStats.leadingCount}P)</span>
          </div>
          <span className="text-[10px] text-blue-400 mt-1 block">Full Station Scope</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-md">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">On-Target (SPT)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-black text-emerald-400">{kpiStats.nominalCount}</span>
            <span className="text-xs text-slate-500 font-mono">/ {kpiStats.total}</span>
          </div>
          <span className="text-[10px] text-emerald-500/80 mt-1 block">Within Defined Target</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-md">
          <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Warning Level</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-black text-amber-400">{kpiStats.warningCount}</span>
            <span className="text-xs text-slate-500 font-mono">approaching</span>
          </div>
          <span className="text-[10px] text-amber-500/80 mt-1 block">Requires Close Monitoring</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-md">
          <span className="text-[10px] uppercase font-bold text-red-400 block tracking-wider">Alert Triggered</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-black text-red-400">{kpiStats.alertCount}</span>
            <span className="text-xs text-slate-500 font-mono">cases</span>
          </div>
          <span className="text-[10px] text-red-400/80 mt-1 block">Triggers Safety Investigation</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-md">
          <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">Lagging (Outcomes)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-black text-purple-300">{kpiStats.laggingCount}</span>
            <span className="text-[10px] text-slate-500 font-mono">actual events</span>
          </div>
          <span className="text-[10px] text-purple-400/80 mt-1 block">Damage, Contacts, Injuries</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-md">
          <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">Leading (Proactive)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-black text-cyan-300">{kpiStats.leadingCount}</span>
            <span className="text-[10px] text-slate-500 font-mono">controls</span>
          </div>
          <span className="text-[10px] text-cyan-400/80 mt-1 block">Audits, Training, Hazards</span>
        </div>
      </div>

      {/* Filtering & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl shadow-sm">
        
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {t.spis.tabs.all} ({spis.length})
          </button>

          <button
            onClick={() => setActiveTab('lagging')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'lagging'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t.spis.tabs.lagging}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {kpiStats.laggingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('leading')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'leading'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t.spis.tabs.leading}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {kpiStats.leadingCount}
            </span>
          </button>
        </div>

        {/* Right Controls: Status & Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search code, name, formula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 w-48 sm:w-60 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="nominal">Within Target (Nominal)</option>
            <option value="warning">Warning Level</option>
            <option value="alert">Alert Exceeded</option>
          </select>
        </div>
      </div>

      {/* SPI Cards Grid */}
      {filteredSpis.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <Target className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold">No performance indicators match your search or filter.</p>
          <button 
            onClick={() => { setActiveTab('all'); setStatusFilter('all'); setSearchQuery(''); }}
            className="text-xs text-blue-400 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredSpis.map((spi) => {
            const isLag = spi.type === 'lagging';
            const isLowerBetter = spi.targetDirection !== 'higher_is_better';

            return (
              <div
                key={spi.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
              >
                {/* Top Glow Stripe based on status */}
                <div 
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    spi.status === 'alert' 
                      ? 'bg-red-500' 
                      : spi.status === 'warning' 
                      ? 'bg-amber-500' 
                      : 'bg-emerald-500'
                  }`} 
                />

                <div className="space-y-3">
                  {/* Category & Badge Header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-slate-950 text-blue-300 border border-slate-700">
                        {spi.code}
                      </span>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isLag 
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' 
                          : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                      }`}>
                        {isLag ? 'Lagging (Outcome)' : 'Leading (Preventive)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getTrendBadge(spi.trend)}
                      {getStatusBadge(spi.status)}
                    </div>
                  </div>

                  {/* Indicator Title & Category */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {spi.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5 leading-snug">
                      {language === 'ar' ? (spi.nameAr || spi.name) : spi.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      {spi.description}
                    </p>
                  </div>

                  {/* Optimization Direction Indicator */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Direction:</span>
                    <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                      isLowerBetter 
                        ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40' 
                        : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                    }`}>
                      {isLowerBetter ? <ArrowDownRight className="w-3 h-3 text-blue-400" /> : <ArrowUpRight className="w-3 h-3 text-emerald-400" />}
                      <span>{isLowerBetter ? 'Lower is Better (Reduction Target)' : 'Higher is Better (Compliance Target)'}</span>
                    </span>
                  </div>

                  {/* 4-Column Metric Values Box */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 grid grid-cols-4 gap-2 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Baseline</span>
                      <span className="text-sm font-mono font-bold text-slate-300 block mt-0.5">
                        {spi.baseline}
                      </span>
                      <span className="text-[9px] text-slate-500 truncate block">{spi.baselinePeriod || '2026'}</span>
                    </div>

                    <div className="border-x border-slate-800/80 px-1">
                      <span className="text-[10px] text-slate-400 uppercase block font-bold">Current</span>
                      <span className={`text-base font-mono font-black block mt-0.5 ${
                        spi.status === 'alert' ? 'text-red-400' : spi.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {spi.currentValue}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono truncate block">{spi.unit}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-emerald-400 uppercase block font-bold">Target (SPT)</span>
                      <span className="text-sm font-mono font-black text-emerald-400 block mt-0.5">
                        {spi.targetSPT}
                      </span>
                      <span className="text-[9px] text-emerald-500/80 font-mono truncate block">{spi.unit}</span>
                    </div>

                    <div className="border-l border-slate-800/80 pl-1">
                      <span className="text-[10px] text-red-400 uppercase block font-bold">Alert Trigger</span>
                      <span className="text-sm font-mono font-bold text-red-400 block mt-0.5">
                        {spi.alertThreshold}
                      </span>
                      <span className="text-[9px] text-red-500/80 font-mono truncate block">{spi.unit}</span>
                    </div>
                  </div>

                  {/* Target (SPT) Narrative Box */}
                  <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" />
                        <span>Safety Performance Target (SPT Objective):</span>
                      </span>
                      {spi.sptDeadline && (
                        <span className="text-[10px] font-mono text-emerald-300/80 px-1.5 py-0.2 bg-emerald-900/40 rounded">
                          Deadline: {spi.sptDeadline}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {language === 'ar' ? (spi.sptDescriptionAr || spi.sptDescription) : spi.sptDescription}
                    </p>
                  </div>

                  {/* Formula & Framework Metadata */}
                  <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                    {spi.measurementFormula && (
                      <div className="flex items-start gap-1 font-mono text-[10px] bg-slate-950/40 px-2 py-1 rounded border border-slate-800/60">
                        <span className="text-slate-500 shrink-0">Formula:</span>
                        <span className="text-blue-300 truncate">{spi.measurementFormula}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Framework: <strong className="text-slate-400 font-normal">{spi.applicableFramework}</strong></span>
                      <span>Owner: <strong className="text-slate-400 font-normal">{spi.ownerDepartment}</strong></span>
                    </div>
                  </div>

                  {/* Reporting Caution Box (if present) */}
                  {spi.reportingCaution && (
                    <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-2.5 text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{spi.reportingCaution}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                    <Calendar className="w-3 h-3 text-slate-600" />
                    <span>Updated: {spi.lastUpdated}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Trend History */}
                    <button
                      onClick={() => openHistoryModal(spi)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors flex items-center gap-1 border border-slate-700"
                      title="View historical trend log"
                    >
                      <History className="w-3 h-3 text-cyan-400" />
                      <span>History</span>
                    </button>

                    {/* Log New Reading */}
                    <button
                      onClick={() => openLogReading(spi)}
                      className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[11px] font-bold transition-all flex items-center gap-1"
                      title="Log verified periodic measurement"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>{t.spis.logReadingBtn}</span>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEditModal(spi)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                      title="Edit Metric"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (confirm(`Archive performance indicator ${spi.code}?`)) {
                          deleteSPI(spi.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-300 transition-colors border border-slate-700"
                      title="Delete Metric"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Log Reading Modal */}
      {readingModalOpen && activeLogSPI && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-300">
                  {activeLogSPI.code}
                </span>
                <h3 className="text-sm font-bold text-white mt-1">
                  {t.spis.logModal.title}
                </h3>
              </div>
              <button onClick={() => setReadingModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <p className="text-slate-400 leading-relaxed">
                {t.spis.logModal.desc} <strong className="text-white">{activeLogSPI.name}</strong> ({activeLogSPI.unit}).
              </p>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-semibold">
                  {t.spis.logModal.currentReading} ({activeLogSPI.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newReadingVal}
                  onChange={(e) => setNewReadingVal(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-lg font-black focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    {t.spis.logModal.period}
                  </label>
                  <input
                    type="text"
                    value={readingPeriod}
                    onChange={(e) => setReadingPeriod(e.target.value)}
                    placeholder="e.g. Oct 2026"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    {t.spis.logModal.turnsCount}
                  </label>
                  <input
                    type="number"
                    value={readingTurns || ''}
                    onChange={(e) => setReadingTurns(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 1410 turns"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  {t.spis.logModal.notes}
                </label>
                <textarea
                  rows={2}
                  value={readingNotes}
                  onChange={(e) => setReadingNotes(e.target.value)}
                  placeholder="Operational comments, ramp audits completed, or flight surge notes..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>

              {/* Status Preview */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Target (SPT): <strong className="text-emerald-400">{activeLogSPI.targetSPT}</strong></span>
                  <span>Alert Trigger: <strong className="text-red-400">{activeLogSPI.alertThreshold}</strong></span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Projected Status:</span>
                  {(() => {
                    const isLowerBetter = activeLogSPI.targetDirection !== 'higher_is_better';
                    if (isLowerBetter) {
                      if (newReadingVal >= activeLogSPI.alertThreshold) return <span className="text-red-400 font-bold">ALERT LEVEL TRIGGERED</span>;
                      if (newReadingVal > activeLogSPI.targetSPT) return <span className="text-amber-400 font-bold">WARNING LEVEL</span>;
                      return <span className="text-emerald-400 font-bold">NOMINAL (WITHIN SPT)</span>;
                    } else {
                      if (newReadingVal <= activeLogSPI.alertThreshold) return <span className="text-red-400 font-bold">ALERT LEVEL TRIGGERED</span>;
                      if (newReadingVal < activeLogSPI.targetSPT) return <span className="text-amber-400 font-bold">WARNING LEVEL</span>;
                      return <span className="text-emerald-400 font-bold">NOMINAL (WITHIN SPT)</span>;
                    }
                  })()}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button 
                onClick={() => setReadingModalOpen(false)} 
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveReading} 
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30"
              >
                {t.spis.logModal.saveBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History & Trend Modal */}
      {historyModalOpen && activeHistorySPI && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-300">
                  {activeHistorySPI.code}
                </span>
                <h3 className="text-sm font-bold text-white mt-1">
                  {activeHistorySPI.name} - Historical Trend Log
                </h3>
              </div>
              <button onClick={() => setHistoryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-[11px]">
                <span>Baseline: <strong className="text-slate-300">{activeHistorySPI.baseline}</strong></span>
                <span>Current: <strong className="text-emerald-400 font-bold">{activeHistorySPI.currentValue} {activeHistorySPI.unit}</strong></span>
                <span>Target (SPT): <strong className="text-emerald-400">{activeHistorySPI.targetSPT}</strong></span>
                <span>Alert Limit: <strong className="text-red-400">{activeHistorySPI.alertThreshold}</strong></span>
              </div>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Periodic Readings History
                </h4>
                {(!activeHistorySPI.historicalReadings || activeHistorySPI.historicalReadings.length === 0) ? (
                  <p className="text-slate-500 text-center py-4">No historical readings logged yet.</p>
                ) : (
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-semibold text-[10px] uppercase border-b border-slate-800">
                        <tr>
                          <th className="p-2.5">Date / Period</th>
                          <th className="p-2.5">Value</th>
                          <th className="p-2.5">Exposure (Turns)</th>
                          <th className="p-2.5">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                        {activeHistorySPI.historicalReadings.map((rec, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="p-2.5 text-slate-300">{rec.period || rec.date}</td>
                            <td className="p-2.5 font-bold text-white">
                              {rec.value} <span className="text-[10px] text-slate-500 font-normal">{activeHistorySPI.unit}</span>
                            </td>
                            <td className="p-2.5 text-slate-400">{rec.turnsCount ? `${rec.turnsCount} turns` : '—'}</td>
                            <td className="p-2.5 text-slate-400 font-sans text-xs">{rec.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button 
                onClick={() => setHistoryModalOpen(false)} 
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit SPI Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-slate-100 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span>{editingSPI ? t.spis.modal.titleEdit : t.spis.modal.titleAdd}</span>
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              
              {/* Code & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-semibold">{t.spis.modal.code}</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                    placeholder="SPI-LAG-08"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-semibold">{t.spis.modal.type}</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="lagging">Lagging (Actual Outcome)</option>
                    <option value="leading">Leading (Preventive Control)</option>
                  </select>
                </div>
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-semibold">{t.spis.modal.category}</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                    placeholder="Aircraft Ground Damage, GSE Fleet, etc."
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-semibold">{t.spis.modal.unit}</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                    placeholder="per 1,000 turns, %, events/mo"
                  />
                </div>
              </div>

              {/* Name EN */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-semibold">{t.spis.modal.name}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-medium"
                  placeholder="e.g. Apron Ground Damage Rate per 1,000 Turns"
                />
              </div>

              {/* Name AR */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-semibold">{t.spis.modal.nameAr}</label>
                <input
                  type="text"
                  dir="rtl"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-medium"
                  placeholder="اسم المؤشر باللغة العربية"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-semibold">{t.spis.modal.description}</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  placeholder="Definition of events and operational scope included..."
                />
              </div>

              {/* Formula & Framework */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-semibold">{t.spis.modal.formula}</label>
                  <input
                    type="text"
                    value={measurementFormula}
                    onChange={(e) => setMeasurementFormula(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-[11px]"
                    placeholder="(Events / Total Turns) * 1,000"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-semibold">{t.spis.modal.framework}</label>
                  <input
                    type="text"
                    value={applicableFramework}
                    onChange={(e) => setApplicableFramework(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-[11px]"
                    placeholder="ICAO Annex 19 Amdt 2 / ECAA / ISAGO"
                  />
                </div>
              </div>

              {/* Responsible Dept & Target Direction */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-semibold">{t.spis.modal.department}</label>
                  <input
                    type="text"
                    value={ownerDepartment}
                    onChange={(e) => setOwnerDepartment(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-[11px]"
                    placeholder="Operations - Ramp Services"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-semibold">{t.spis.modal.direction}</label>
                  <select
                    value={targetDirection}
                    onChange={(e: any) => setTargetDirection(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="lower_is_better">Lower is Better (Reduction Goal)</option>
                    <option value="higher_is_better">Higher is Better (Compliance Goal)</option>
                  </select>
                </div>
              </div>

              {/* Numerical Metrics: Baseline, SPT, Alert Limit */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Numerical Thresholds & Target (SPT)
                </span>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{t.spis.modal.baseline}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={baseline}
                      onChange={(e) => setBaseline(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-emerald-400 block mb-1 font-bold">{t.spis.modal.targetSPT}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={targetSPT}
                      onChange={(e) => setTargetSPT(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-red-400 block mb-1 font-bold">{t.spis.modal.alertThreshold}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={alertThreshold}
                      onChange={(e) => setAlertThreshold(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-red-400 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">{t.spis.modal.sptDescription}</label>
                  <textarea
                    rows={2}
                    value={sptDescription}
                    onChange={(e) => setSptDescription(e.target.value)}
                    placeholder="e.g. Reduce damage by 20% against baseline by Dec 2027 through strict marshaling stop-bars..."
                    className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{t.spis.modal.sptDeadline}</label>
                    <input
                      type="text"
                      value={sptDeadline}
                      onChange={(e) => setSptDeadline(e.target.value)}
                      placeholder="e.g. December 2027"
                      className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{t.spis.modal.frequency}</label>
                    <select
                      value={frequency}
                      onChange={(e: any) => setFrequency(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-[11px]"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annual">Annual</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button 
                type="button" 
                onClick={() => setModalOpen(false)} 
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30"
              >
                {t.spis.modal.saveBtn}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
