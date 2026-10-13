import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { SafetyCategoryOption } from '../types/index.ts';
import { 
  Sliders, 
  Check, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Eye, 
  ShieldCheck, 
  AlertTriangle, 
  Plane, 
  Camera, 
  FileText, 
  MapPin, 
  Settings2, 
  ToggleLeft, 
  ToggleRight,
  Sparkles,
  ExternalLink,
  Save
} from 'lucide-react';

export const SafetyFormConfigView: React.FC = () => {
  const { 
    language, 
    safetyFormConfig, 
    updateSafetyFormConfig, 
    resetSafetyFormConfig,
    setActiveView 
  } = useApp();

  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'fields' | 'categories' | 'locations' | 'policy' | 'preview'>('fields');
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Add category form state
  const [newCatKey, setNewCatKey] = useState('');
  const [newCatLabelEn, setNewCatLabelEn] = useState('');
  const [newCatLabelAr, setNewCatLabelAr] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('⚠️');
  const [newCatDescEn, setNewCatDescEn] = useState('');
  const [newCatDescAr, setNewCatDescAr] = useState('');
  const [showAddCatModal, setShowAddCatModal] = useState(false);

  // Add location state
  const [newLocationName, setNewLocationName] = useState('');

  const triggerSavedToast = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  // Field toggles
  const handleToggle = (key: keyof typeof safetyFormConfig) => {
    updateSafetyFormConfig({ [key]: !safetyFormConfig[key] });
    triggerSavedToast();
  };

  const handleMinDescChange = (val: number) => {
    updateSafetyFormConfig({ minDescriptionLength: Math.max(0, val) });
    triggerSavedToast();
  };

  // Category toggles & add/remove
  const handleToggleCategoryActive = (catKey: string) => {
    const updated = safetyFormConfig.categories.map(c => 
      c.key === catKey ? { ...c, isActive: !c.isActive } : c
    );
    updateSafetyFormConfig({ categories: updated });
    triggerSavedToast();
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabelEn.trim() || !newCatLabelAr.trim()) return;

    const key = newCatKey.trim() || newCatLabelEn.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // Check if key already exists
    if (safetyFormConfig.categories.some(c => c.key === key)) {
      alert('A category with this key already exists');
      return;
    }

    const newCategory: SafetyCategoryOption = {
      key,
      labelEn: newCatLabelEn.trim(),
      labelAr: newCatLabelAr.trim(),
      icon: newCatIcon.trim() || '⚠️',
      descEn: newCatDescEn.trim() || newCatLabelEn.trim(),
      descAr: newCatDescAr.trim() || newCatLabelAr.trim(),
      isActive: true
    };

    updateSafetyFormConfig({
      categories: [...safetyFormConfig.categories, newCategory]
    });

    setNewCatKey('');
    setNewCatLabelEn('');
    setNewCatLabelAr('');
    setNewCatIcon('⚠️');
    setNewCatDescEn('');
    setNewCatDescAr('');
    setShowAddCatModal(false);
    triggerSavedToast();
  };

  const handleDeleteCategory = (catKey: string) => {
    if (safetyFormConfig.categories.length <= 1) {
      alert('You must have at least one active category.');
      return;
    }
    const updated = safetyFormConfig.categories.filter(c => c.key !== catKey);
    updateSafetyFormConfig({ categories: updated });
    triggerSavedToast();
  };

  // Location add/remove
  const handleAddLocation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const loc = newLocationName.trim();
    if (!loc) return;
    if (safetyFormConfig.locations.includes(loc)) {
      alert('This location is already in the list.');
      return;
    }

    updateSafetyFormConfig({
      locations: [...safetyFormConfig.locations, loc]
    });
    setNewLocationName('');
    triggerSavedToast();
  };

  const handleDeleteLocation = (locName: string) => {
    if (safetyFormConfig.locations.length <= 1) {
      alert('You must keep at least one airside location.');
      return;
    }
    const updated = safetyFormConfig.locations.filter(l => l !== locName);
    updateSafetyFormConfig({ locations: updated });
    triggerSavedToast();
  };

  const handleAddQuickLocationPreset = (preset: string) => {
    if (!safetyFormConfig.locations.includes(preset)) {
      updateSafetyFormConfig({
        locations: [...safetyFormConfig.locations, preset]
      });
      triggerSavedToast();
    }
  };

  // Disclaimer text
  const handleDisclaimerChange = (lang: 'en' | 'ar', text: string) => {
    if (lang === 'en') {
      updateSafetyFormConfig({ customDisclaimerEn: text });
    } else {
      updateSafetyFormConfig({ customDisclaimerAr: text });
    }
    triggerSavedToast();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                {t.formConfig.title}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ADMIN RBAC
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.formConfig.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveView('quickReport')}
            className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t.formConfig.previewLive}</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Reset safety report form to station defaults?')) {
                resetSafetyFormConfig();
                triggerSavedToast();
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title={t.formConfig.resetDefault}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.formConfig.resetDefault}</span>
          </button>
        </div>
      </div>

      {/* Saved Toast Banner */}
      {showSavedToast && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{t.formConfig.savedToast}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400/80">RMF Station Synced</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('fields')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'fields' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{t.formConfig.fieldControls}</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'categories' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{t.formConfig.categoriesConfig} ({safetyFormConfig.categories.filter(c => c.isActive).length}/{safetyFormConfig.categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('locations')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'locations' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>{t.formConfig.locationsConfig} ({safetyFormConfig.locations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('policy')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'policy' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t.formConfig.policyConfig}</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'preview' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{t.formConfig.previewLive}</span>
        </button>
      </div>

      {/* TAB 1: FIELD CONTROLS & VALIDATION */}
      {activeTab === 'fields' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>{t.formConfig.fieldControls}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enable or disable fields for frontline ramp staff and specify mandatory validation rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Anonymous Submissions */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-200">
                  {t.formConfig.enableAnonymous}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enforces ICAO Annex 19 "Just Culture" by allowing personnel to submit safety hazards without identifying themselves.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('enableAnonymous')}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                  safetyFormConfig.enableAnonymous ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  safetyFormConfig.enableAnonymous ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                } top-1 absolute`} />
              </button>
            </div>

            {/* Flight Number */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-200">
                    {t.formConfig.enableFlightNum}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Allows linking reports to specific commercial turnarounds (e.g., MS 451, WK 340).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('enableFlightNumber')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    safetyFormConfig.enableFlightNumber ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    safetyFormConfig.enableFlightNumber ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                  } top-1 absolute`} />
                </button>
              </div>

              {safetyFormConfig.enableFlightNumber && (
                <label className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyFormConfig.requireFlightNumber}
                    onChange={() => handleToggle('requireFlightNumber')}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>{t.formConfig.requireFlightNum}</span>
                </label>
              )}
            </div>

            {/* Aircraft Registration */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-200">
                    {t.formConfig.enableAircraftReg}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tail code or registration identification (e.g., SU-GDZ, HB-JHC).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('enableAircraftReg')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    safetyFormConfig.enableAircraftReg ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    safetyFormConfig.enableAircraftReg ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                  } top-1 absolute`} />
                </button>
              </div>

              {safetyFormConfig.enableAircraftReg && (
                <label className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyFormConfig.requireAircraftReg}
                    onChange={() => handleToggle('requireAircraftReg')}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>{t.formConfig.requireAircraftReg}</span>
                </label>
              )}
            </div>

            {/* GSE Equipment Linking */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-200">
                    {t.formConfig.enableGSELink}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Connects safety reports to airside GSE assets (e.g. RMF-TUG-01, Belt Loader #3).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('enableGSELink')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    safetyFormConfig.enableGSELink ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    safetyFormConfig.enableGSELink ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                  } top-1 absolute`} />
                </button>
              </div>

              {safetyFormConfig.enableGSELink && (
                <label className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyFormConfig.requireGSELink}
                    onChange={() => handleToggle('requireGSELink')}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>{t.formConfig.requireGSELink}</span>
                </label>
              )}
            </div>

            {/* Photo Evidence Upload */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-200">
                    {t.formConfig.enablePhoto}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Ramp camera capture and photo attachment for immediate visual investigation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('enablePhotoUpload')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    safetyFormConfig.enablePhotoUpload ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    safetyFormConfig.enablePhotoUpload ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                  } top-1 absolute`} />
                </button>
              </div>

              {safetyFormConfig.enablePhotoUpload && (
                <label className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyFormConfig.requirePhotoUpload}
                    onChange={() => handleToggle('requirePhotoUpload')}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>{t.formConfig.requirePhoto}</span>
                </label>
              )}
            </div>

            {/* ICAO Risk Matrix */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-200">
                    {t.formConfig.enableRisk}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Displays ICAO Doc 9859 5x5 Severity (1-5) and Likelihood (A-E) selector for frontline rating.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('enableRiskMatrix')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    safetyFormConfig.enableRiskMatrix ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    safetyFormConfig.enableRiskMatrix ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                  } top-1 absolute`} />
                </button>
              </div>

              {safetyFormConfig.enableRiskMatrix && (
                <label className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyFormConfig.requireRiskMatrix}
                    onChange={() => handleToggle('requireRiskMatrix')}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>{t.formConfig.requireRisk}</span>
                </label>
              )}
            </div>

          </div>

          {/* Validation: Minimum Description Length */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-200">
                  {t.formConfig.minDescLength}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Require frontline staff to provide sufficient detail before allowing submission.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={safetyFormConfig.minDescriptionLength}
                  onChange={(e) => handleMinDescChange(parseInt(e.target.value) || 0)}
                  className="w-32 accent-blue-600"
                />
                <span className="w-12 text-center text-xs font-mono font-bold bg-slate-900 border border-slate-700 text-blue-400 py-1 rounded">
                  {safetyFormConfig.minDescriptionLength} ch
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
              <span>Quick Presets:</span>
              {[5, 15, 30, 50].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleMinDescChange(preset)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    safetyFormConfig.minDescriptionLength === preset 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {preset} chars
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: HAZARD & INCIDENT CATEGORIES (CRUD) */}
      {activeTab === 'categories' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>{t.formConfig.categoriesConfig}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Customize operational hazard classifications available to frontline personnel.
              </p>
            </div>

            <button
              onClick={() => setShowAddCatModal(true)}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{t.formConfig.addCategory}</span>
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {safetyFormConfig.categories.map((cat) => (
              <div
                key={cat.key}
                className={`p-3.5 rounded-xl border transition-all ${
                  cat.isActive 
                    ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700' 
                    : 'bg-slate-950/30 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        {language === 'ar' ? cat.labelAr : cat.labelEn}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Key: {cat.key}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleCategoryActive(cat.key)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        cat.isActive 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Hidden'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.key)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-850/60 text-[11px] text-slate-400">
                  <p>{language === 'ar' ? cat.descAr : cat.descEn}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Category Modal */}
          {showAddCatModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-400" />
                    <span>{t.formConfig.addCategory}</span>
                  </h3>
                  <button
                    onClick={() => setShowAddCatModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddCategory} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      English Label *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. De-Icing Chemical Spill"
                      value={newCatLabelEn}
                      onChange={(e) => setNewCatLabelEn(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Arabic Label (الاسم بالعربية) *
                    </label>
                    <input
                      type="text"
                      required
                      dir="rtl"
                      placeholder="مثال: تسرب سوائل إزالة الصقيع"
                      value={newCatLabelAr}
                      onChange={(e) => setNewCatLabelAr(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Icon Emoji
                      </label>
                      <input
                        type="text"
                        value={newCatIcon}
                        onChange={(e) => setNewCatIcon(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-center text-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        System Key (Slug)
                      </label>
                      <input
                        type="text"
                        placeholder="auto_generated"
                        value={newCatKey}
                        onChange={(e) => setNewCatKey(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      English Guidance / Description
                    </label>
                    <input
                      type="text"
                      placeholder="Brief guidance for frontline agent..."
                      value={newCatDescEn}
                      onChange={(e) => setNewCatDescEn(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Arabic Guidance (الإرشاد بالعربية)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="إرشاد مختصر لموظف المهبط..."
                      value={newCatDescAr}
                      onChange={(e) => setNewCatDescAr(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAddCatModal(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                    >
                      Save Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AIRSIDE LOCATIONS & STANDS (CRUD) */}
      {activeTab === 'locations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{t.formConfig.locationsConfig}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Maintain the list of official Marsa Alam airport stands, apron roads, and terminal areas for hazard geo-tagging.
            </p>
          </div>

          {/* Quick Add Location Input */}
          <form onSubmit={handleAddLocation} className="flex gap-2 max-w-xl">
            <input
              type="text"
              placeholder="e.g. Apron Stand 13, Cargo Warehouse Apron, Runway 33..."
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.formConfig.addLocation}</span>
            </button>
          </form>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Quick Add Presets:</span>
            {['Apron Stand 13 (Remote)', 'Apron Stand 14 (Remote)', 'Cargo Airside Ramp', 'VIP Terminal Stand 1', 'North De-Icing Pad'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAddQuickLocationPreset(preset)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-blue-400" />
                <span>{preset}</span>
              </button>
            ))}
          </div>

          {/* Active Locations List */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-slate-300 mb-2">
              Current Active Airside Locations ({safetyFormConfig.locations.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {safetyFormConfig.locations.map((loc) => (
                <div
                  key={loc}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs text-slate-200 group hover:border-slate-700 transition-colors"
                >
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span>{loc}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteLocation(loc)}
                    className="text-slate-500 hover:text-red-400 transition-colors ml-1"
                    title={`Remove ${loc}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: JUST CULTURE & POLICY DISCLAIMERS */}
      {activeTab === 'policy' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>{t.formConfig.policyConfig}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Customize the statutory confidentiality and Just Culture statement presented to frontline employees upon opening the form.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                English Confidentiality Statement (ICAO SMS Doc 9859 Compliant)
              </label>
              <textarea
                rows={4}
                value={safetyFormConfig.customDisclaimerEn}
                onChange={(e) => handleDisclaimerChange('en', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Arabic Confidentiality Statement (نص سياسة ثقافة العدالة والسرية)
              </label>
              <textarea
                rows={4}
                dir="rtl"
                value={safetyFormConfig.customDisclaimerAr}
                onChange={(e) => handleDisclaimerChange('ar', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LIVE FORM PREVIEW */}
      {activeTab === 'preview' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                <span>{t.formConfig.previewLive}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time visual simulation of the frontline quick safety report form based on your current settings.
              </p>
            </div>

            <button
              onClick={() => setActiveView('quickReport')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>Open Actual Report Screen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Simulation Frame */}
          <div className="max-w-2xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            
            {/* Disclaimer Banner */}
            <div className="p-3 bg-blue-950/40 border border-blue-900/50 rounded-xl text-xs text-blue-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                {language === 'ar' ? safetyFormConfig.customDisclaimerAr : safetyFormConfig.customDisclaimerEn}
              </p>
            </div>

            {/* Reporter Identification Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2">
                Reporter Mode:
              </label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                  safetyFormConfig.enableAnonymous ? 'bg-slate-900 border-blue-600 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60'
                }`}>
                  <span className="w-3.5 h-3.5 rounded-full border border-blue-400 bg-blue-500 shrink-0" />
                  <div>
                    <p className="font-bold">Anonymous</p>
                    <p className="text-[10px] text-slate-400">{safetyFormConfig.enableAnonymous ? 'Allowed' : 'Disabled by Admin'}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900 flex items-center gap-2 text-slate-300">
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                  <div>
                    <p className="font-bold">Identified Staff</p>
                    <p className="text-[10px] text-slate-400">Name + Badge</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2">
                Incident Category ({safetyFormConfig.categories.filter(c => c.isActive).length} available):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {safetyFormConfig.categories.filter(c => c.isActive).map((cat, idx) => (
                  <div
                    key={cat.key}
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                      idx === 0 ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{language === 'ar' ? cat.labelAr : cat.labelEn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Airside Location ({safetyFormConfig.locations.length} stands/zones):
              </label>
              <select className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white">
                {safetyFormConfig.locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Optional / Mandatory Operational Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {safetyFormConfig.enableFlightNumber && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Flight Number {safetyFormConfig.requireFlightNumber && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="e.g. MS 451"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-400"
                  />
                </div>
              )}

              {safetyFormConfig.enableAircraftReg && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Aircraft Reg {safetyFormConfig.requireAircraftReg && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="e.g. SU-GDZ"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-400"
                  />
                </div>
              )}

              {safetyFormConfig.enableGSELink && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Linked GSE Equipment {safetyFormConfig.requireGSELink && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="e.g. RMF-TUG-01"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-400"
                  />
                </div>
              )}

              {safetyFormConfig.enablePhotoUpload && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Photo Upload {safetyFormConfig.requirePhotoUpload && <span className="text-red-400">*</span>}
                  </label>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-500 text-center flex items-center justify-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Attach Photo</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description with Min Length Hint */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="font-bold text-slate-200">
                  Incident Description <span className="text-red-400">*</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  Min: {safetyFormConfig.minDescriptionLength} characters
                </span>
              </div>
              <textarea
                rows={3}
                disabled
                placeholder="What occurred, environmental conditions, equipment involved..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-400 resize-none"
              />
            </div>

            {/* Risk Matrix Preview */}
            {safetyFormConfig.enableRiskMatrix && (
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    ICAO 5x5 Initial Risk Rating {safetyFormConfig.requireRiskMatrix && <span className="text-red-400">*</span>}
                  </span>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Rating Enabled
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 text-[10px] text-center font-bold">
                  <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded">1. Negl</div>
                  <div className="p-1 bg-yellow-500/20 text-yellow-400 rounded">2. Minor</div>
                  <div className="p-1 bg-amber-500/20 text-amber-400 rounded">3. Mod</div>
                  <div className="p-1 bg-orange-500/20 text-orange-400 rounded">4. Maj</div>
                  <div className="p-1 bg-red-500/20 text-red-400 rounded">5. Cat</div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
