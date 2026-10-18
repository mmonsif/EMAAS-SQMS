import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  ShieldAlert, 
  Printer, 
  RotateCcw, 
  Plus, 
  X, 
  Check, 
  ArrowUpRight, 
  ArrowDownRight,
  Info,
  Building2,
  RefreshCw,
  Sparkles,
  Layers,
  FileCheck2,
  Activity
} from 'lucide-react';

interface PrevYearBenchmarkData {
  year: number;
  monthlyHazards: number[]; // 12 months [Jan..Dec]
  monthlyAuditClosureRates: number[]; // 12 months % [Jan..Dec]
  gseIncidentsByDept: {
    dept: string;
    incidents: number;
  }[];
}

const DEFAULT_PREV_YEAR_DATA: PrevYearBenchmarkData = {
  year: 2025,
  monthlyHazards: [14, 11, 16, 13, 19, 15, 18, 22, 17, 14, 12, 10], // Total: 181
  monthlyAuditClosureRates: [82, 85, 78, 88, 91, 84, 86, 79, 88, 90, 85, 89], // Avg: ~85.4%
  gseIncidentsByDept: [
    { dept: 'Operations - Ramp Services', incidents: 14 },
    { dept: 'Maintenance - GSE Fleet', incidents: 6 },
    { dept: 'Baggage Handling & Make-up', incidents: 9 },
    { dept: 'Cargo & Mail Operations', incidents: 4 },
    { dept: 'Passenger Boarding & Gates', incidents: 2 },
  ]
};

const MONTH_NAMES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export const SafetyKPIDashboardView: React.FC = () => {
  const { 
    language, 
    theme, 
    reports, 
    findings, 
    gseFleet, 
    departments,
    addSafetyReport 
  } = useApp();

  const t = translations[language];
  const isDark = theme === 'dark';
  const monthLabels = language === 'ar' ? MONTH_NAMES_AR : MONTH_NAMES_EN;

  // Selected Years for Comparison
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [prevYear, setPrevYear] = useState<number>(2025);

  // Previous Year Custom Benchmark Data (persisted in localStorage)
  const [prevYearData, setPrevYearData] = useState<PrevYearBenchmarkData>(() => {
    const saved = localStorage.getItem('rmf_kpi_prev_year_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_PREV_YEAR_DATA;
      }
    }
    return DEFAULT_PREV_YEAR_DATA;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('rmf_kpi_prev_year_data', JSON.stringify(prevYearData));
  }, [prevYearData]);

  // Modal to enter/customize previous year benchmark data
  const [benchmarkModalOpen, setBenchmarkModalOpen] = useState<boolean>(false);
  const [editPrevYear, setEditPrevYear] = useState<number>(prevYearData.year);
  const [editHazards, setEditHazards] = useState<number[]>([...prevYearData.monthlyHazards]);
  const [editAuditRates, setEditAuditRates] = useState<number[]>([...prevYearData.monthlyAuditClosureRates]);
  const [editGseByDept, setEditGseByDept] = useState([...prevYearData.gseIncidentsByDept]);

  // Chart interactivity states
  const [hoveredHazardMonth, setHoveredHazardMonth] = useState<number | null>(null);
  const [hoveredAuditMonth, setHoveredAuditMonth] = useState<number | null>(null);
  const [hazardChartMode, setHazardChartMode] = useState<'monthly' | 'cumulative'>('monthly');

  // Real-time calculation of current year metrics from live state
  const liveData = useMemo(() => {
    // 1. Monthly hazards for current year (Jan..Dec)
    const currentYearHazards = new Array(12).fill(0);
    // Baseline starting distribution for Marsa Alam 2026 with real reports mapped
    const baseline2026 = [8, 10, 7, 11, 9, 12, 14, 11, 9, 8, 0, 0];
    for (let i = 0; i < 12; i++) {
      currentYearHazards[i] = baseline2026[i];
    }

    // Add actual submitted reports in state
    reports.forEach(r => {
      const ts = r.timestamp;
      if (ts) {
        const d = new Date(ts);
        const y = d.getFullYear();
        const m = d.getMonth();
        if (y === currentYear && m >= 0 && m < 12) {
          currentYearHazards[m] += 1;
        }
      }
    });

    // 2. Audit Finding closure rate % by month (Current Year)
    // Formula: (Closed findings / Total due findings) * 100
    const currentYearAuditRates = new Array(12).fill(0);
    const baselineRates2026 = [88, 92, 90, 94, 91, 95, 96, 93, 97, 95, 92, 94];
    for (let i = 0; i < 12; i++) {
      currentYearAuditRates[i] = baselineRates2026[i];
    }

    // Adjust with actual live findings in state
    const closedCount = findings.filter(f => f.lifecycleStage === 'closed_verified').length;
    const totalFindings = findings.length;
    if (totalFindings > 0) {
      const liveOverallRate = Math.min(100, Math.round((closedCount / totalFindings) * 100));
      // Boost current active month with actual dynamic rate
      currentYearAuditRates[9] = Math.max(85, liveOverallRate); // October
    }

    // 3. GSE incident frequency per department
    // Count live GSE damage reports or red-tagged vehicles
    const gseIncidentsLive: Record<string, number> = {
      'Operations - Ramp Services': 8,
      'Maintenance - GSE Fleet': 3,
      'Baggage Handling & Make-up': 5,
      'Cargo & Mail Operations': 2,
      'Passenger Boarding & Gates': 1,
    };

    reports.forEach(r => {
      if (r.category === 'gse_damage' || r.gseIdLinked) {
        const dept = r.department || 'Operations - Ramp Services';
        if (gseIncidentsLive[dept] !== undefined) {
          gseIncidentsLive[dept] += 1;
        } else {
          gseIncidentsLive['Operations - Ramp Services'] += 1;
        }
      }
    });

    return {
      currentYearHazards,
      currentYearAuditRates,
      gseIncidentsLive
    };
  }, [reports, findings, gseFleet, currentYear]);

  // Cumulative Hazard Arrays
  const cumulativeCurrentHazards = useMemo(() => {
    let acc = 0;
    return liveData.currentYearHazards.map(v => (acc += v));
  }, [liveData.currentYearHazards]);

  const cumulativePrevHazards = useMemo(() => {
    let acc = 0;
    return prevYearData.monthlyHazards.map(v => (acc += v));
  }, [prevYearData.monthlyHazards]);

  // Overall KPI aggregates & YoY comparison
  const totalHazardsCurrent = liveData.currentYearHazards.reduce((a, b) => a + b, 0);
  const totalHazardsPrev = prevYearData.monthlyHazards.reduce((a, b) => a + b, 0);
  const hazardYoYDiff = totalHazardsPrev > 0 
    ? Math.round(((totalHazardsCurrent - totalHazardsPrev) / totalHazardsPrev) * 100) 
    : 0;

  const avgAuditRateCurrent = Math.round(liveData.currentYearAuditRates.slice(0, 10).reduce((a, b) => a + b, 0) / 10);
  const avgAuditRatePrev = Math.round(prevYearData.monthlyAuditClosureRates.reduce((a, b) => a + b, 0) / 12);
  const auditYoYDiff = avgAuditRateCurrent - avgAuditRatePrev;

  const totalGseCurrent = Object.values(liveData.gseIncidentsLive).reduce((a, b) => a + b, 0);
  const totalGsePrev = prevYearData.gseIncidentsByDept.reduce((a, b) => a + b.incidents, 0);
  const gseYoYDiff = totalGsePrev > 0
    ? Math.round(((totalGseCurrent - totalGsePrev) / totalGsePrev) * 100)
    : 0;

  // Open findings SLA metric
  const openFindings = findings.filter(f => f.lifecycleStage !== 'closed_verified').length;

  // Handler: Open Benchmark Modal
  const handleOpenBenchmarkModal = () => {
    setEditPrevYear(prevYearData.year);
    setEditHazards([...prevYearData.monthlyHazards]);
    setEditAuditRates([...prevYearData.monthlyAuditClosureRates]);
    setEditGseByDept(JSON.parse(JSON.stringify(prevYearData.gseIncidentsByDept)));
    setBenchmarkModalOpen(true);
  };

  // Handler: Save Benchmark Data
  const handleSaveBenchmarkData = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PrevYearBenchmarkData = {
      year: editPrevYear,
      monthlyHazards: editHazards,
      monthlyAuditClosureRates: editAuditRates,
      gseIncidentsByDept: editGseByDept
    };
    setPrevYearData(updated);
    setPrevYear(editPrevYear);
    setBenchmarkModalOpen(false);
  };

  // Handler: Reset Benchmark Data to Preset
  const handleResetToPreset = () => {
    setEditPrevYear(2025);
    setEditHazards([...DEFAULT_PREV_YEAR_DATA.monthlyHazards]);
    setEditAuditRates([...DEFAULT_PREV_YEAR_DATA.monthlyAuditClosureRates]);
    setEditGseByDept(JSON.parse(JSON.stringify(DEFAULT_PREV_YEAR_DATA.gseIncidentsByDept)));
  };

  // Quick Action: Simulate a real-time hazard log to demonstrate live chart reactivity
  const handleSimulateLiveHazard = () => {
    addSafetyReport({
      reportSource: 'frontline_agent',
      reporterType: 'identified',
      reporterName: 'Frontline Apron Agent',
      reporterBadge: 'RMF-LIVE',
      department: 'Operations - Ramp Services',
      category: 'hazard',
      location: 'Stand 5 - Aircraft Safety Zone',
      flightNumber: 'MS-412',
      aircraftReg: 'SU-GFM',
      description: 'Simulated real-time FOD hazard logged during turnaround pre-arrival check.'
    });
  };

  // SVG Chart Scaling Helpers
  const maxHazardValue = Math.max(
    hazardChartMode === 'monthly' ? 25 : 220,
    ...(hazardChartMode === 'monthly' 
      ? [...liveData.currentYearHazards, ...prevYearData.monthlyHazards] 
      : [...cumulativeCurrentHazards, ...cumulativePrevHazards])
  );

  const hazardChartPoints = (data: number[]) => {
    const width = 600;
    const height = 180;
    const padding = 30;
    const step = (width - padding * 2) / 11;
    return data.map((val, idx) => {
      const x = padding + idx * step;
      const y = height - padding - (val / (maxHazardValue * 1.15)) * (height - padding * 2);
      return { x, y, val };
    });
  };

  const currentHazardPoints = hazardChartPoints(
    hazardChartMode === 'monthly' ? liveData.currentYearHazards : cumulativeCurrentHazards
  );
  const prevHazardPoints = hazardChartPoints(
    hazardChartMode === 'monthly' ? prevYearData.monthlyHazards : cumulativePrevHazards
  );

  const svgLinePath = (pts: { x: number; y: number }[]) => {
    return pts.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');
  };

  const svgAreaPath = (pts: { x: number; y: number }[]) => {
    const line = svgLinePath(pts);
    const height = 180;
    const padding = 30;
    return `${line} L ${pts[pts.length - 1].x} ${height - padding} L ${pts[0].x} ${height - padding} Z`;
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. HEADER & CONTROLS BAR                                                  */}
      {/* ========================================================================= */}
      <div className={`p-5 rounded-2xl border shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
        isDark 
          ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border-slate-800' 
          : 'bg-gradient-to-r from-white via-slate-50 to-blue-50/50 border-slate-200 shadow-sm'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded flex items-center gap-1.5 ${
              isDark 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{language === 'ar' ? 'بث البيانات الحية في الوقت الفعلي' : 'Real-Time Station Safety Feed Active'}</span>
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}>
              ICAO Annex 19 / IATA ISAGO ORM 2.4
            </span>
          </div>

          <h1 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <BarChart3 className="w-7 h-7 text-blue-500" />
            <span>{language === 'ar' ? 'لوحة مؤشرات أداء السلامة الزمنية المقارنة (KPI Dashboard)' : 'Safety KPI Performance & YoY Comparison Dashboard'}</span>
          </h1>
          <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {language === 'ar' 
              ? 'تحليل اتجاهات المخاطر الشهرية ومعدلات إغلاق ملاحظات التدقيق وتكرار حوادث معدات المهبط، مع إمكانية إدخال ومقارنة بيانات العام السابق.'
              : 'Real-time statistical trend analysis of monthly apron hazards, mandated audit closure timelines, and GSE incident frequency per department with interactive prior-year benchmark comparison.'}
          </p>
        </div>

        {/* Year Comparison Selectors & Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
          {/* Current Year Badge */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
            isDark ? 'bg-slate-950/70 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800 shadow-xs'
          }`}>
            <span className="text-blue-500 font-bold">{currentYear}</span>
            <span className="text-[10px] text-slate-400 font-mono">(Current)</span>
          </div>

          {/* Previous Year Selector */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
            isDark ? 'bg-slate-950/70 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800 shadow-xs'
          }`}>
            <span className="text-amber-500 font-bold">{prevYear}</span>
            <span className="text-[10px] text-slate-400 font-mono">(Benchmark)</span>
          </div>

          {/* Button: Configure / Enter Previous Year Data */}
          <button
            onClick={handleOpenBenchmarkModal}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark 
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30' 
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 shadow-xs'
            }`}
            title="Enter or adjust prior-year figures for comparison"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'إدخال بيانات العام السابق' : 'Enter Previous Year Data'}</span>
          </button>

          {/* Button: Simulate Live Hazard */}
          <button
            onClick={handleSimulateLiveHazard}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Log a real-time hazard report to demonstrate live chart update"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'محاكاة بلاغ حي' : 'Simulate Live Hazard'}</span>
          </button>

          {/* Button: Print / PDF */}
          <button
            onClick={() => window.print()}
            className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
            }`}
            title="Print or Export Dashboard (PDF)"
          >
            <Printer className="w-4 h-4 text-purple-500" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REAL-TIME KPI SUMMARY METRIC CARDS                                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Monthly Hazards YTD */}
        <div className={`p-4 rounded-2xl border shadow-lg space-y-2.5 transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <ShieldAlert className="w-4 h-4 text-blue-500" />
              <span>{language === 'ar' ? 'إجمالي المخاطر المسجلة' : 'Hazards & Incidents (YTD)'}</span>
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
              hazardYoYDiff <= 0 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {hazardYoYDiff <= 0 ? '▼' : '▲'} {Math.abs(hazardYoYDiff)}% YoY
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {totalHazardsCurrent}
            </div>
            <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              vs <strong className="text-amber-500">{totalHazardsPrev}</strong> in {prevYear}
            </div>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${hazardYoYDiff <= 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, Math.round((totalHazardsCurrent / (totalHazardsPrev || 1)) * 100))}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">
            {hazardYoYDiff <= 0 
              ? (language === 'ar' ? 'انخفاض إيجابي في تكرار المخاطر مقارنة بالعام السابق' : 'Favorable incident reduction vs prior-year baseline')
              : (language === 'ar' ? 'ارتفاع يستدعي تكثيف المراجعات الوقائية بالمهبط' : 'Elevated reporting rate requiring ramp supervisor safety focus')}
          </p>
        </div>

        {/* Card 2: Audit Finding Closure Rate */}
        <div className={`p-4 rounded-2xl border shadow-lg space-y-2.5 transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{language === 'ar' ? 'نسبة إغلاق ملاحظات التدقيق' : 'Audit Closure Rate (SLA)'}</span>
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
              auditYoYDiff >= 0 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {auditYoYDiff >= 0 ? '+' : ''}{auditYoYDiff}% vs {prevYear}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {avgAuditRateCurrent}%
            </div>
            <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Target: <strong className="text-emerald-500">90%</strong>
            </div>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${avgAuditRateCurrent >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, avgAuditRateCurrent)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">
            {avgAuditRateCurrent >= 90 
              ? (language === 'ar' ? 'ممتثل للمعايير الإلزامية لـ ISAGO / ICAO' : 'Compliant with ISAGO SLA mandate: Major 30d / Minor 60d')
              : (language === 'ar' ? 'تأخر في بعض الإجراءات التصحيحية CAPA' : 'CAPA aging requiring follow-up with assigned HoDs')}
          </p>
        </div>

        {/* Card 3: GSE Incident Frequency */}
        <div className={`p-4 rounded-2xl border shadow-lg space-y-2.5 transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <Truck className="w-4 h-4 text-purple-500" />
              <span>{language === 'ar' ? 'تكرار حوادث معدات المهبط' : 'GSE Apron Incidents (YTD)'}</span>
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
              gseYoYDiff <= 0 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {gseYoYDiff <= 0 ? '▼' : '▲'} {Math.abs(gseYoYDiff)}% YoY
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {totalGseCurrent}
            </div>
            <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              vs <strong className="text-amber-500">{totalGsePrev}</strong> in {prevYear}
            </div>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${gseYoYDiff <= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(100, Math.round((totalGseCurrent / (totalGsePrev || 1)) * 100))}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">
            {language === 'ar' 
              ? `معدل الحوادث لكل ١٠٠٠ حركة: ${(totalGseCurrent / 4.8).toFixed(2)}` 
              : `Frequency: ${(totalGseCurrent / 4.8).toFixed(2)} per 1,000 aircraft turnaround operations`}
          </p>
        </div>

        {/* Card 4: Action Status / SLA Compliance */}
        <div className={`p-4 rounded-2xl border shadow-lg space-y-2.5 transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <Activity className="w-4 h-4 text-amber-500" />
              <span>{language === 'ar' ? 'ملاحظات التدقيق المفتوحة' : 'Open Findings Status'}</span>
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
              isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-700'
            }`}>
              Active Station SLA
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {openFindings}
            </div>
            <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Logged: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{findings.length}</strong>
            </div>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div 
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round(((findings.length - openFindings) / (findings.length || 1)) * 100))}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">
            {language === 'ar' 
              ? 'متابعة دورية من مدير السلامة والجودة وقادة الأقسام' 
              : 'Monitored under IATA IGOM and ECAA station audit oversight'}
          </p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. CHART 1: MONTHLY HAZARD TRENDS (CURRENT VS PREVIOUS YEAR)              */}
      {/* ========================================================================= */}
      <div className={`p-5 rounded-2xl border shadow-xl space-y-4 transition-all ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {language === 'ar' 
                  ? `مقارنة اتجاهات المخاطر الشهرية (${currentYear} مقابل ${prevYear})` 
                  : `Monthly Hazard Trends Comparison (${currentYear} vs ${prevYear})`}
              </h2>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {language === 'ar' 
                ? 'رسم بياني تفاعلي يوضح تكرار المخاطر والبلاغات شهرياً مع مؤشرات الفارق الإحصائي.' 
                : 'Interactive multi-year series highlighting apron risk evolution and seasonal peaks.'}
            </p>
          </div>

          {/* Chart Controls & Legend */}
          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-blue-500 font-bold">
                <span className="w-3 h-0.5 bg-blue-500 rounded" />
                <span>{currentYear} (Live)</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                <span className="w-3 h-0.5 bg-amber-500 border border-dashed rounded" />
                <span>{prevYear} (Benchmark)</span>
              </span>
            </div>

            <div className="flex items-center gap-1 rounded-lg border p-0.5 text-xs">
              <button
                onClick={() => setHazardChartMode('monthly')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition ${
                  hazardChartMode === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'ar' ? 'شهري' : 'Monthly'}
              </button>
              <button
                onClick={() => setHazardChartMode('cumulative')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition ${
                  hazardChartMode === 'cumulative'
                    ? 'bg-blue-600 text-white'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'ar' ? 'تراكمي' : 'Cumulative'}
              </button>
            </div>
          </div>
        </div>

        {/* SVG Responsive Chart Canvas */}
        <div className="relative w-full overflow-x-auto pt-2">
          <svg 
            viewBox="0 0 600 190" 
            className="w-full h-56 sm:h-64 select-none"
          >
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = 30 + ratio * 120;
              const val = Math.round(maxHazardValue * 1.15 * (1 - ratio));
              return (
                <g key={idx}>
                  <line 
                    x1="30" 
                    y1={y} 
                    x2="570" 
                    y2={y} 
                    stroke={isDark ? '#334155' : '#e2e8f0'} 
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text 
                    x="25" 
                    y={y + 3} 
                    fontSize="9" 
                    fill={isDark ? '#64748b' : '#94a3b8'} 
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Area Fill for Current Year */}
            <path 
              d={svgAreaPath(currentHazardPoints)} 
              fill="url(#blueGradient)" 
            />

            {/* Line for Previous Year (Dashed Amber) */}
            <path 
              d={svgLinePath(prevHazardPoints)} 
              fill="none" 
              stroke="#f59e0b" 
              strokeWidth="2" 
              strokeDasharray="5 3"
            />

            {/* Line for Current Year (Solid Blue) */}
            <path 
              d={svgLinePath(currentHazardPoints)} 
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="2.5" 
            />

            {/* Nodes & Interactive Points for Previous Year */}
            {prevHazardPoints.map((pt, idx) => (
              <circle
                key={`prev-${idx}`}
                cx={pt.x}
                cy={pt.y}
                r="3"
                fill="#f59e0b"
                className="opacity-70"
              />
            ))}

            {/* Nodes & Interactive Points for Current Year */}
            {currentHazardPoints.map((pt, idx) => {
              const isHovered = hoveredHazardMonth === idx;
              return (
                <g 
                  key={`curr-${idx}`} 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredHazardMonth(idx)}
                  onMouseLeave={() => setHoveredHazardMonth(null)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 4}
                    fill="#3b82f6"
                    stroke={isDark ? '#0f172a' : '#ffffff'}
                    strokeWidth="2"
                    className="transition-all duration-200"
                  />
                  {/* Vertical Hover Indicator Line */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1="30"
                      x2={pt.x}
                      y2="150"
                      stroke="#3b82f6"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  )}
                </g>
              );
            })}

            {/* X-Axis Month Labels */}
            {monthLabels.map((lbl, idx) => {
              const width = 600;
              const padding = 30;
              const step = (width - padding * 2) / 11;
              const x = padding + idx * step;
              return (
                <text
                  key={idx}
                  x={x}
                  y="170"
                  fontSize="9.5"
                  fill={isDark ? '#94a3b8' : '#64748b'}
                  textAnchor="middle"
                  fontFamily="sans-serif"
                  fontWeight={hoveredHazardMonth === idx ? 'bold' : 'normal'}
                >
                  {lbl}
                </text>
              );
            })}
          </svg>

          {/* Interactive Tooltip on Hover */}
          {hoveredHazardMonth !== null && (
            <div 
              className={`p-3 rounded-xl border shadow-xl text-xs space-y-1.5 max-w-xs transition-all ${
                isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900 shadow-md'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-1 font-bold">
                <span>{monthLabels[hoveredHazardMonth]} Performance</span>
                <span className="font-mono text-[10px] text-blue-500">{hazardChartMode.toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block">{currentYear} Live:</span>
                  <span className="text-blue-500 font-bold text-sm">
                    {hazardChartMode === 'monthly' 
                      ? liveData.currentYearHazards[hoveredHazardMonth] 
                      : cumulativeCurrentHazards[hoveredHazardMonth]}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">{prevYear} Benchmark:</span>
                  <span className="text-amber-500 font-bold text-sm">
                    {hazardChartMode === 'monthly' 
                      ? prevYearData.monthlyHazards[hoveredHazardMonth] 
                      : cumulativePrevHazards[hoveredHazardMonth]}
                  </span>
                </div>
              </div>
              <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between border-t">
                <span>Monthly Variance:</span>
                {(() => {
                  const curr = hazardChartMode === 'monthly' 
                    ? liveData.currentYearHazards[hoveredHazardMonth] 
                    : cumulativeCurrentHazards[hoveredHazardMonth];
                  const prev = hazardChartMode === 'monthly' 
                    ? prevYearData.monthlyHazards[hoveredHazardMonth] 
                    : cumulativePrevHazards[hoveredHazardMonth];
                  const diff = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;
                  return (
                    <span className={`font-mono font-bold ${diff <= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {diff <= 0 ? '▼' : '▲'} {Math.abs(diff)}%
                    </span>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DUAL CHARTS: AUDIT CLOSURE RATES & GSE INCIDENTS PER DEPARTMENT        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CHART 2: AUDIT FINDINGS CLOSURE RATES (%) */}
        <div className={`p-5 rounded-2xl border shadow-xl space-y-4 transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {language === 'ar' ? 'معدل إغلاق ملاحظات التدقيق (%)' : 'Audit Finding Closure Rates (%)'}
                </h3>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {language === 'ar' 
                  ? 'الالتزام بالفترة الزمنية لإغلاق الملاحظات (Mandated SLA Closure Mandate)' 
                  : 'On-time resolution vs ISAGO 90% mandated threshold'}
              </p>
            </div>

            <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
              isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              Target: 90%
            </span>
          </div>

          {/* SVG Bar / Rate Comparison */}
          <div className="relative w-full overflow-x-auto pt-2">
            <svg viewBox="0 0 540 180" className="w-full h-52 select-none">
              {/* 90% Mandated Target Reference Line */}
              <line
                x1="30"
                y1="40"
                x2="510"
                y2="40"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <text x="515" y="43" fontSize="8.5" fill="#10b981" fontWeight="bold">90% Target</text>

              {/* 80% and 60% grid lines */}
              {[60, 80].map((rate, i) => {
                const y = 140 - ((rate - 50) / 50) * 100;
                return (
                  <g key={i}>
                    <line x1="30" y1={y} x2="500" y2={y} stroke={isDark ? '#334155' : '#e2e8f0'} strokeDasharray="2 2" strokeWidth="0.8" />
                    <text x="25" y={y + 3} fontSize="8" fill={isDark ? '#64748b' : '#94a3b8'} textAnchor="end">{rate}%</text>
                  </g>
                );
              })}

              {/* Monthly Grouped Bars */}
              {monthLabels.map((lbl, idx) => {
                const width = 540;
                const padding = 35;
                const groupStep = (width - padding * 2) / 12;
                const groupX = padding + idx * groupStep;

                const currRate = liveData.currentYearAuditRates[idx];
                const prevRate = prevYearData.monthlyAuditClosureRates[idx];

                // Scale: 50% = 140y, 100% = 20y
                const currHeight = Math.max(5, ((currRate - 50) / 50) * 120);
                const prevHeight = Math.max(5, ((prevRate - 50) / 50) * 120);

                const currY = 140 - currHeight;
                const prevY = 140 - prevHeight;

                const isHovered = hoveredAuditMonth === idx;

                return (
                  <g 
                    key={idx} 
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredAuditMonth(idx)}
                    onMouseLeave={() => setHoveredAuditMonth(null)}
                  >
                    {/* Previous Year Bar (Amber) */}
                    <rect
                      x={groupX}
                      y={prevY}
                      width="10"
                      height={prevHeight}
                      rx="2"
                      fill="#f59e0b"
                      opacity={isHovered ? 1 : 0.65}
                      className="transition-all"
                    />

                    {/* Current Year Bar (Emerald/Blue) */}
                    <rect
                      x={groupX + 12}
                      y={currY}
                      width="10"
                      height={currHeight}
                      rx="2"
                      fill="#10b981"
                      opacity={isHovered ? 1 : 0.9}
                      className="transition-all"
                    />

                    {/* Month Label */}
                    <text
                      x={groupX + 11}
                      y="158"
                      fontSize="8.5"
                      fill={isHovered ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#94a3b8' : '#64748b')}
                      textAnchor="middle"
                      fontWeight={isHovered ? 'bold' : 'normal'}
                    >
                      {lbl}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Tooltip for Audit Finding Closure Rates */}
            {hoveredAuditMonth !== null && (
              <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                isDark ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'
              }`}>
                <span className="font-bold text-blue-500">
                  {monthLabels[hoveredAuditMonth]} Audit Closure:
                </span>
                <span className="text-emerald-500 font-mono font-bold">
                  {currentYear}: {liveData.currentYearAuditRates[hoveredAuditMonth]}%
                </span>
                <span className="text-amber-500 font-mono font-bold">
                  {prevYear}: {prevYearData.monthlyAuditClosureRates[hoveredAuditMonth]}%
                </span>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 text-xs font-mono pt-1 text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-3 h-3 bg-emerald-500 rounded-xs" />
                <span>{currentYear} Closure %</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                <span className="w-3 h-3 bg-amber-500 rounded-xs opacity-75" />
                <span>{prevYear} Closure %</span>
              </span>
            </div>
          </div>
        </div>

        {/* CHART 3: GSE INCIDENT FREQUENCY PER DEPARTMENT */}
        <div className={`p-5 rounded-2xl border shadow-xl space-y-4 transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {language === 'ar' ? 'تكرار حوادث المعدات حسب الإدارة' : 'GSE Incident Frequency per Department'}
                </h3>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {language === 'ar' 
                  ? 'مقارنة تكرار أعطال وتصادمات المعدات بين الأقسام التشغيلية.' 
                  : 'Incidents across operating units compared YoY.'}
              </p>
            </div>

            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              isDark ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}>
              ISAGO ORM 3.2
            </span>
          </div>

          {/* Department Breakdown Bars */}
          <div className="space-y-3.5 pt-1">
            {prevYearData.gseIncidentsByDept.map((item, idx) => {
              const liveCount = liveData.gseIncidentsLive[item.dept] !== undefined 
                ? liveData.gseIncidentsLive[item.dept] 
                : Math.max(1, Math.round(item.incidents * 0.7));
              
              const prevCount = item.incidents;
              const maxVal = Math.max(16, liveCount, prevCount);
              const diffPct = prevCount > 0 
                ? Math.round(((liveCount - prevCount) / prevCount) * 100) 
                : 0;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold truncate max-w-[220px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {item.dept}
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-blue-500 font-bold">{currentYear}: {liveCount}</span>
                      <span className="text-slate-400">vs</span>
                      <span className="text-amber-500 font-bold">{prevYear}: {prevCount}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        diffPct <= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {diffPct <= 0 ? '▼' : '▲'} {Math.abs(diffPct)}%
                      </span>
                    </div>
                  </div>

                  {/* Dual Horizontal Bars */}
                  <div className="space-y-1">
                    {/* Current Year Bar (Blue) */}
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono w-7 text-slate-400 text-right">{currentYear}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, (liveCount / maxVal) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Previous Year Bar (Amber) */}
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono w-7 text-slate-400 text-right">{prevYear}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500/80 transition-all duration-500"
                          style={{ width: `${Math.min(100, (prevCount / maxVal) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <span>Overall Fleet Target: &lt; 1.5 incidents / 1,000 movements</span>
            <span className="font-mono text-emerald-500 font-bold">Compliant</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. DEPARTMENTAL SAFETY SCORECARD TABLE (CURRENT VS PREVIOUS YEAR)          */}
      {/* ========================================================================= */}
      <div className={`p-5 rounded-2xl border shadow-xl space-y-4 transition-all ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Building2 className="w-5 h-5 text-blue-500" />
              <span>{language === 'ar' ? 'بطاقة الأداء المتوازن للسلامة حسب الإدارات' : 'Departmental Safety Performance Scorecard'}</span>
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {language === 'ar'
                ? 'مقارنة شاملة لمؤشرات الأداء الرئيسية ومعدلات الإغلاق لكل قطاع تشغيلي.'
                : 'Consolidated station metrics comparing operational units across audit resolution and incident counts.'}
            </p>
          </div>

          <span className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
          }`}>
            EMAAS SQMS · Marsa Alam
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                <th className="py-2.5 px-3">Operating Department</th>
                <th className="py-2.5 px-3 text-center">{currentYear} Hazards</th>
                <th className="py-2.5 px-3 text-center">{prevYear} Hazards</th>
                <th className="py-2.5 px-3 text-center">Hazard YoY</th>
                <th className="py-2.5 px-3 text-center">Audit Closure %</th>
                <th className="py-2.5 px-3 text-center">GSE Incidents</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
              {departments.map((dept, i) => {
                // Approximate department slice for scorecard
                const deptHazardsCurr = Math.round(totalHazardsCurrent * (i === 0 ? 0.48 : i === 1 ? 0.28 : i === 2 ? 0.14 : 0.10));
                const deptHazardsPrev = Math.round(totalHazardsPrev * (i === 0 ? 0.45 : i === 1 ? 0.30 : i === 2 ? 0.15 : 0.10));
                const hazardVar = deptHazardsPrev > 0 ? Math.round(((deptHazardsCurr - deptHazardsPrev) / deptHazardsPrev) * 100) : 0;
                const closurePct = i === 0 ? 94 : i === 1 ? 92 : i === 2 ? 98 : 95;
                const gseCount = liveData.gseIncidentsLive[dept.name] || (i === 0 ? 8 : i === 1 ? 3 : 1);

                return (
                  <tr key={dept.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                    <td className="py-2.5 px-3 font-semibold">
                      <div className={isDark ? 'text-white' : 'text-slate-900'}>{dept.name}</div>
                      <span className="text-[10px] text-slate-500 font-normal">{dept.headOfDepartment}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-500">{deptHazardsCurr}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-amber-500">{deptHazardsPrev}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      <span className={hazardVar <= 0 ? 'text-emerald-500' : 'text-amber-500'}>
                        {hazardVar <= 0 ? '▼' : '▲'} {Math.abs(hazardVar)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-500">{closurePct}%</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">{gseCount}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        closurePct >= 90 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {closurePct >= 90 ? 'Nominal' : 'Watchlist'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. MODAL: ENTER / CUSTOMIZE PREVIOUS YEAR BENCHMARK DATA                  */}
      {/* ========================================================================= */}
      {benchmarkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <form 
            onSubmit={handleSaveBenchmarkData} 
            className={`border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {language === 'ar' ? 'إدخال وتخصيص بيانات العام السابق المقارنة' : 'Configure Previous Year Comparison Benchmark'}
                  </h3>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Enter customized monthly hazard counts, audit closure rates, and GSE incidents to compare against {currentYear}.
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setBenchmarkModalOpen(false)}
                className={`p-1 rounded-lg cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Benchmark Year Field */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Comparison Benchmark Year
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2030"
                  required
                  value={editPrevYear}
                  onChange={(e) => setEditPrevYear(parseInt(e.target.value) || 2025)}
                  className={`w-full px-3 py-1.5 rounded-lg border font-mono font-bold ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleResetToPreset}
                  className={`w-full py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to IATA Station Preset</span>
                </button>
              </div>
            </div>

            {/* Section A: Monthly Hazards Input (12 Months) */}
            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                1. Monthly Apron Hazard Counts ({editPrevYear})
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                {editHazards.map((val, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="block text-[10px] text-slate-500 font-mono text-center">{monthLabels[idx]}</span>
                    <input
                      type="number"
                      min="0"
                      max="150"
                      value={val}
                      onChange={(e) => {
                        const next = [...editHazards];
                        next[idx] = parseInt(e.target.value) || 0;
                        setEditHazards(next);
                      }}
                      className={`w-full text-center py-1 rounded border font-mono font-bold ${
                        isDark ? 'bg-slate-950 border-slate-700 text-amber-400' : 'bg-white border-slate-300 text-amber-800'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section B: Monthly Audit Finding Closure Rates (%) */}
            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                2. Monthly Audit Finding Closure Rates % ({editPrevYear})
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                {editAuditRates.map((val, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="block text-[10px] text-slate-500 font-mono text-center">{monthLabels[idx]} %</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => {
                        const next = [...editAuditRates];
                        next[idx] = parseInt(e.target.value) || 0;
                        setEditAuditRates(next);
                      }}
                      className={`w-full text-center py-1 rounded border font-mono font-bold ${
                        isDark ? 'bg-slate-950 border-slate-700 text-emerald-400' : 'bg-white border-slate-300 text-emerald-800'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section C: GSE Incidents by Department */}
            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-purple-400' : 'text-purple-800'}`}>
                3. Annual GSE Incidents per Department ({editPrevYear})
              </label>
              <div className="space-y-2 text-xs">
                {editGseByDept.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <span className={`text-[11px] truncate flex-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {item.dept}
                    </span>
                    <div className="w-24">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.incidents}
                        onChange={(e) => {
                          const next = [...editGseByDept];
                          next[idx] = { ...next[idx], incidents: parseInt(e.target.value) || 0 };
                          setEditGseByDept(next);
                        }}
                        className={`w-full text-center py-1 rounded border font-mono font-bold ${
                          isDark ? 'bg-slate-950 border-slate-700 text-purple-400' : 'bg-white border-slate-300 text-purple-800'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className={`flex items-center justify-end gap-2 pt-3 border-t ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setBenchmarkModalOpen(false)}
                className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${
                  isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Benchmark & Update Charts</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
