import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { SPIItem } from '../types/index.ts';
import { 
  TrendingUp, 
  Plus, 
  Trash2, 
  Edit3, 
  Target, 
  X, 
  Activity
} from 'lucide-react';

export const SPIManager: React.FC = () => {
  const { language, spis, addSPI, updateSPI, deleteSPI, logSPIReading } = useApp();
  const t = translations[language];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSPI, setEditingSPI] = useState<SPIItem | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('per 10k flights');
  const [baseline, setBaseline] = useState(1.0);
  const [targetSPT, setTargetSPT] = useState(0.0);
  const [alertThreshold, setAlertThreshold] = useState(0.5);
  const [frequency, setFrequency] = useState<'Monthly' | 'Quarterly'>('Monthly');

  // Quick Log Reading Modal
  const [readingModalOpen, setReadingModalOpen] = useState(false);
  const [activeLogSPI, setActiveLogSPI] = useState<SPIItem | null>(null);
  const [newReadingVal, setNewReadingVal] = useState(0);

  const openAddModal = () => {
    setEditingSPI(null);
    setCode(`SPI-${String(spis.length + 1).padStart(2, '0')}`);
    setName('');
    setNameAr('');
    setDescription('');
    setUnit('per 10k flights');
    setBaseline(1.0);
    setTargetSPT(0.0);
    setAlertThreshold(0.5);
    setFrequency('Monthly');
    setModalOpen(true);
  };

  const openEditModal = (spi: SPIItem) => {
    setEditingSPI(spi);
    setCode(spi.code);
    setName(spi.name);
    setNameAr(spi.nameAr);
    setDescription(spi.description);
    setUnit(spi.unit);
    setBaseline(spi.baseline);
    setTargetSPT(spi.targetSPT);
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
        name,
        nameAr: nameAr || name,
        description,
        unit,
        baseline,
        targetSPT,
        alertThreshold,
        frequency
      });
    } else {
      addSPI({
        code,
        name,
        nameAr: nameAr || name,
        description,
        unit,
        baseline,
        targetSPT,
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
    setReadingModalOpen(true);
  };

  const handleSaveReading = () => {
    if (activeLogSPI) {
      logSPIReading(activeLogSPI.id, newReadingVal);
      setReadingModalOpen(false);
    }
  };

  const getStatusBadge = (status: 'nominal' | 'warning' | 'alert') => {
    switch (status) {
      case 'nominal':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Within Target</span>;
      case 'warning':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Warning Threshold</span>;
      case 'alert':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Alert Exceeded</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <span>{t.spis.title}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.spis.subtitle}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.spis.addSPIBtn}</span>
        </button>
      </div>

      {/* SPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spis.map((spi) => {
          return (
            <div
              key={spi.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300">
                    {spi.code}
                  </span>
                  {getStatusBadge(spi.status)}
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  {language === 'ar' ? spi.nameAr : spi.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {spi.description}
                </p>
              </div>

              {/* Metric Values Strip */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Current</span>
                  <span className="text-sm font-mono font-bold text-white block mt-0.5">
                    {spi.currentValue}
                  </span>
                  <span className="text-[9px] text-slate-500 truncate block">{spi.unit}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Target (SPT)</span>
                  <span className="text-sm font-mono font-bold text-emerald-400 block mt-0.5">
                    {spi.targetSPT}
                  </span>
                  <span className="text-[9px] text-slate-500 truncate block">{spi.unit}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Alert Limit</span>
                  <span className="text-sm font-mono font-bold text-red-400 block mt-0.5">
                    {spi.alertThreshold}
                  </span>
                  <span className="text-[9px] text-slate-500 truncate block">{spi.unit}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-[11px] font-mono text-slate-500">
                  Updated: {spi.lastUpdated}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openLogReading(spi)}
                    className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                    title="Log new periodic value"
                  >
                    <Activity className="w-3 h-3" />
                    <span>Log</span>
                  </button>
                  <button
                    onClick={() => openEditModal(spi)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Edit Indicator"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Archive indicator ${spi.code}?`)) {
                        deleteSPI(spi.id);
                      }
                    }}
                    className="p-1 rounded bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 transition-colors"
                    title="Delete Indicator"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit SPI Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                {editingSPI ? t.spis.modal.titleEdit : t.spis.modal.titleAdd}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1">{t.spis.modal.unit}</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">{t.spis.modal.name}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">{t.spis.modal.nameAr}</label>
                <input
                  type="text"
                  dir="rtl"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">{t.spis.modal.description}</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">{t.spis.modal.baseline}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={baseline}
                    onChange={(e) => setBaseline(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">{t.spis.modal.targetSPT}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetSPT}
                    onChange={(e) => setTargetSPT(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">{t.spis.modal.alertThreshold}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-red-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300">
                Cancel
              </button>
              <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow">
                {t.spis.modal.saveBtn}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Log Reading Modal */}
      {readingModalOpen && activeLogSPI && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Log Current Reading for {activeLogSPI.code}
            </h3>

            <div className="text-xs space-y-2">
              <p className="text-slate-400">
                Enter current verified station metric for <strong>{activeLogSPI.name}</strong> ({activeLogSPI.unit}):
              </p>
              <input
                type="number"
                step="0.1"
                value={newReadingVal}
                onChange={(e) => setNewReadingVal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-base font-bold"
              />
              <div className="text-[11px] text-slate-400 flex justify-between font-mono">
                <span>Target: {activeLogSPI.targetSPT}</span>
                <span>Alert: {activeLogSPI.alertThreshold}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setReadingModalOpen(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300">
                Cancel
              </button>
              <button onClick={handleSaveReading} className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow">
                Save Reading
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
