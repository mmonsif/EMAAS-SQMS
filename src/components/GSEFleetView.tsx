import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { GSEVehicle, GSETagStatus } from '../types/index.ts';
import { 
  Truck, 
  CheckCircle, 
  Clock, 
  X, 
  Wrench,
  AlertTriangle
} from 'lucide-react';

export const GSEFleetView: React.FC = () => {
  const { language, gseFleet, updateGSETag, reports } = useApp();
  const t = translations[language];

  const [filterTag, setFilterTag] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<GSEVehicle | null>(null);
  const [defectNotes, setDefectNotes] = useState('');

  const filteredFleet = gseFleet.filter(g => {
    if (filterTag !== 'all' && g.tagStatus !== filterTag) return false;
    return true;
  });

  const getTagBadge = (status: GSETagStatus) => {
    switch (status) {
      case 'green':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Green Tag · Fit for Service</span>;
      case 'amber':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Amber Tag · Maintenance Due</span>;
      case 'red':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Red Tag · Grounded / Out of Service</span>;
    }
  };

  const handleApplyTag = (status: GSETagStatus) => {
    if (selectedVehicle) {
      updateGSETag(selectedVehicle.id, status, defectNotes || undefined);
      setSelectedVehicle({ ...selectedVehicle, tagStatus: status, activeDefectNotes: defectNotes || undefined });
      setDefectNotes('');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-400" />
            <span>{t.gse.title}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.gse.subtitle}
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Fleet Equipment ({gseFleet.length})</option>
            <option value="green">Green Tag - Fit ({gseFleet.filter(g => g.tagStatus === 'green').length})</option>
            <option value="amber">Amber Tag - Due ({gseFleet.filter(g => g.tagStatus === 'amber').length})</option>
            <option value="red">Red Tag - Grounded ({gseFleet.filter(g => g.tagStatus === 'red').length})</option>
          </select>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFleet.map((vehicle) => {
          const linkedReport = vehicle.activeDefectReportId 
            ? reports.find(r => r.id === vehicle.activeDefectReportId)
            : null;

          return (
            <div
              key={vehicle.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-xl space-y-4 transition-all flex flex-col justify-between ${
                vehicle.tagStatus === 'red'
                  ? 'border-red-600/50 bg-red-950/10'
                  : vehicle.tagStatus === 'amber'
                    ? 'border-amber-600/40'
                    : 'border-slate-800'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300">
                    {vehicle.id}
                  </span>
                  {getTagBadge(vehicle.tagStatus)}
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  {vehicle.name}
                </h3>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Type</span>
                    <span className="text-slate-200">{vehicle.type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Stand Bay</span>
                    <span className="text-slate-200">{vehicle.locationStand}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Hours Run</span>
                    <span className="text-slate-200">{vehicle.operatingHours} hrs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Next Service</span>
                    <span className="text-amber-400">{vehicle.nextServiceDue}</span>
                  </div>
                </div>

                {vehicle.activeDefectNotes && (
                  <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-red-300">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Active Safety Defect Tag</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-red-200/90 font-sans">
                      {vehicle.activeDefectNotes}
                    </p>
                    {linkedReport && (
                      <span className="text-[10px] font-mono text-red-300 block pt-0.5">
                        Triggered by Safety Report: <strong>{linkedReport.id}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500">
                  Mfg: {vehicle.manufacturer}
                </span>

                <button
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    setDefectNotes(vehicle.activeDefectNotes || '');
                  }}
                  className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Wrench className="w-3 h-3" />
                  <span>Manage Tag</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Manage Tag Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-400">{selectedVehicle.id}</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{selectedVehicle.name}</h3>
              </div>
              <button onClick={() => setSelectedVehicle(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="text-[11px] text-slate-400 block">
                Update Equipment Tag Status:
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyTag('green')}
                  className="p-2.5 rounded-xl border border-emerald-600/50 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-600 hover:text-white text-xs font-bold text-center transition-colors"
                >
                  ✓ Green Tag
                  <span className="text-[10px] font-normal block">Fit for Service</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyTag('amber')}
                  className="p-2.5 rounded-xl border border-amber-600/50 bg-amber-950/30 text-amber-300 hover:bg-amber-600 hover:text-white text-xs font-bold text-center transition-colors"
                >
                  ⚠ Amber Tag
                  <span className="text-[10px] font-normal block">Service Due</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyTag('red')}
                  className="p-2.5 rounded-xl border border-red-600/50 bg-red-950/30 text-red-300 hover:bg-red-600 hover:text-white text-xs font-bold text-center transition-colors"
                >
                  ✕ Red Tag
                  <span className="text-[10px] font-normal block">Grounded</span>
                </button>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Defect / Tag Notes</label>
                <textarea
                  rows={2}
                  value={defectNotes}
                  onChange={(e) => setDefectNotes(e.target.value)}
                  placeholder="Enter reasons for grounding, work order reference, or maintenance clearance..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedVehicle(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
