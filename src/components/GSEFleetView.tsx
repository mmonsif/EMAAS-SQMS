import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { GSEVehicle, GSETagStatus, StationRole } from '../types/index.ts';
import { 
  Truck, 
  CheckCircle, 
  Clock, 
  X, 
  Wrench,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  History,
  Calendar,
  MapPin,
  Check,
  Gauge,
  Building,
  Info
} from 'lucide-react';

const GSE_CATEGORIES = [
  'Towbarless Pushback Tug',
  'Conventional Pushback Tractor',
  'Belt Loader',
  'Ground Power Unit (GPU 90kVA)',
  'Air Start Unit (ASU)',
  'Passenger Boarding Stairs',
  'Water Service Unit (WSU)',
  'Lavatory Service Unit (LSU)',
  'Baggage Cargo Tractor',
  'Catering Hi-Loader'
];

const GSE_MANUFACTURERS = [
  'TLD Ground Support Equipment',
  'Trepel Airport Equipment',
  'Charlatte America',
  'Goldhofer Airport Technology',
  'Mallaghan Ground Support',
  'Hobart Ground Power',
  'Guinault Aviation',
  'NMC Wollard'
];

const APRON_STANDS = [
  'Apron Stand 1',
  'Apron Stand 2',
  'Apron Stand 3',
  'Apron Stand 4',
  'Apron Stand 5',
  'Apron Stand 6',
  'Remote Apron Bay R1',
  'Remote Apron Bay R2',
  'GSE Maintenance Workshop',
  'Equipment Staging Area North'
];

export const GSEFleetView: React.FC = () => {
  const { 
    language, 
    theme, 
    activeRole, 
    gseFleet, 
    addGSEVehicle, 
    updateGSEVehicle, 
    deleteGSEVehicle, 
    updateGSETag, 
    reports 
  } = useApp();
  
  const t = translations[language];
  const isDark = theme === 'dark';

  // Filters & Search
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal: Manage Tag Status & Defect Clearance
  const [tagModalVehicle, setTagModalVehicle] = useState<GSEVehicle | null>(null);
  const [targetTag, setTargetTag] = useState<GSETagStatus>('green');
  const [tagNotes, setTagNotes] = useState<string>('');
  const [tagActorName, setTagActorName] = useState<string>('GSE Maintenance Lead');
  const [activeTagTab, setActiveTagTab] = useState<'manage' | 'history'>('manage');

  // Modal: Add New Equipment
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addFormId, setAddFormId] = useState<string>('');
  const [addFormName, setAddFormName] = useState<string>('');
  const [addFormType, setAddFormType] = useState<string>(GSE_CATEGORIES[0]);
  const [addFormMfg, setAddFormMfg] = useState<string>(GSE_MANUFACTURERS[0]);
  const [addFormStand, setAddFormStand] = useState<string>(APRON_STANDS[0]);
  const [addFormHours, setAddFormHours] = useState<number>(450);
  const [addFormServiceDue, setAddFormServiceDue] = useState<string>('2026-11-30');
  const [addFormTag, setAddFormTag] = useState<GSETagStatus>('green');
  const [addFormNotes, setAddFormNotes] = useState<string>('');

  // Modal: Edit Equipment Details
  const [editingVehicle, setEditingVehicle] = useState<GSEVehicle | null>(null);
  const [editFormName, setEditFormName] = useState<string>('');
  const [editFormType, setEditFormType] = useState<string>('');
  const [editFormMfg, setEditFormMfg] = useState<string>('');
  const [editFormStand, setEditFormStand] = useState<string>('');
  const [editFormHours, setEditFormHours] = useState<number>(0);
  const [editFormServiceDue, setEditFormServiceDue] = useState<string>('');

  // Modal: Delete Confirmation
  const [vehicleToDelete, setVehicleToDelete] = useState<GSEVehicle | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const total = gseFleet.length;
    const green = gseFleet.filter(g => g.tagStatus === 'green').length;
    const amber = gseFleet.filter(g => g.tagStatus === 'amber').length;
    const red = gseFleet.filter(g => g.tagStatus === 'red').length;
    const rate = total > 0 ? Math.round(((green + amber) / total) * 100) : 100;
    return { total, green, amber, red, rate };
  }, [gseFleet]);

  // Filtered Fleet
  const filteredFleet = useMemo(() => {
    return gseFleet.filter(vehicle => {
      if (filterTag !== 'all' && vehicle.tagStatus !== filterTag) return false;
      if (filterType !== 'all' && vehicle.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = vehicle.id.toLowerCase().includes(q);
        const matchesName = vehicle.name.toLowerCase().includes(q);
        const matchesType = vehicle.type.toLowerCase().includes(q);
        const matchesMfg = vehicle.manufacturer.toLowerCase().includes(q);
        const matchesStand = vehicle.locationStand.toLowerCase().includes(q);
        const matchesNotes = vehicle.activeDefectNotes?.toLowerCase().includes(q) || 
                             vehicle.serviceClearanceNotes?.toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesType && !matchesMfg && !matchesStand && !matchesNotes) {
          return false;
        }
      }
      return true;
    });
  }, [gseFleet, filterTag, filterType, searchQuery]);

  // Open Tag Manager Modal
  const openTagModal = (vehicle: GSEVehicle) => {
    setTagModalVehicle(vehicle);
    setTargetTag(vehicle.tagStatus);
    setActiveTagTab('manage');
    
    // Crucial: When opening modal, if currently red and user considers green, or current tag:
    // If currently green: show current clearance notes
    // If currently red: show current defect notes as reference
    if (vehicle.tagStatus === 'green') {
      setTagNotes(vehicle.serviceClearanceNotes || '');
    } else {
      setTagNotes(vehicle.activeDefectNotes || '');
    }
    
    // Set appropriate actor name based on active station role
    if (activeRole === 'hod_maint') {
      setTagActorName('Eng. Tarek Shawky (Head of GSE Maintenance)');
    } else if (activeRole === 'safety_officer') {
      setTagActorName('Mahmoud Ezz (Safety Officer)');
    } else if (activeRole === 'hod_safety') {
      setTagActorName('Dr. Khaled Fawzy (Safety & Quality Manager)');
    } else {
      setTagActorName('GSE Maintenance Technician');
    }
  };

  // Handle Tag Selection Change inside Modal
  const handleSelectTagInModal = (newTag: GSETagStatus) => {
    setTargetTag(newTag);
    // If switching to green from red/amber, suggest a clear return-to-service note rather than keeping the defect!
    if (newTag === 'green' && tagModalVehicle?.tagStatus !== 'green') {
      setTagNotes('Maintenance completed, defect rectified and verified safe for flight operations by GSE Workshop.');
    } else if (newTag === 'red' && tagModalVehicle?.tagStatus === 'green') {
      setTagNotes('');
    } else if (newTag === 'amber' && tagModalVehicle?.tagStatus === 'green') {
      setTagNotes('Scheduled 500-hour preventive maintenance inspection due.');
    }
  };

  // Submit Tag Transition
  const handleApplyTagTransition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagModalVehicle) return;

    updateGSETag(tagModalVehicle.id, targetTag, tagNotes, tagActorName);

    // Close modal
    setTagModalVehicle(null);
    setTagNotes('');
  };

  // Open Edit Modal
  const openEditModal = (vehicle: GSEVehicle) => {
    setEditingVehicle(vehicle);
    setEditFormName(vehicle.name);
    setEditFormType(vehicle.type);
    setEditFormMfg(vehicle.manufacturer);
    setEditFormStand(vehicle.locationStand);
    setEditFormHours(vehicle.operatingHours);
    setEditFormServiceDue(vehicle.nextServiceDue);
  };

  // Submit Edit Modal
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    updateGSEVehicle(editingVehicle.id, {
      name: editFormName,
      type: editFormType,
      manufacturer: editFormMfg,
      locationStand: editFormStand,
      operatingHours: Number(editFormHours),
      nextServiceDue: editFormServiceDue
    });

    setEditingVehicle(null);
  };

  // Submit Add Modal
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormName.trim()) return;

    addGSEVehicle({
      id: addFormId.trim() || undefined,
      name: addFormName.trim(),
      type: addFormType,
      manufacturer: addFormMfg,
      locationStand: addFormStand,
      operatingHours: Number(addFormHours) || 0,
      nextServiceDue: addFormServiceDue,
      tagStatus: addFormTag,
      activeDefectNotes: addFormTag !== 'green' ? addFormNotes : undefined,
      lastInspectionDate: new Date().toISOString().substring(0, 10)
    });

    setShowAddModal(false);
    // Reset form
    setAddFormId('');
    setAddFormName('');
    setAddFormHours(450);
    setAddFormNotes('');
    setAddFormTag('green');
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (vehicleToDelete) {
      deleteGSEVehicle(vehicleToDelete.id);
      setVehicleToDelete(null);
    }
  };

  // Tag Badge UI helper with rich contrast in both light and dark modes
  const renderTagBadge = (status: GSETagStatus) => {
    switch (status) {
      case 'green':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
            <span>Green Tag · Fit for Service</span>
          </span>
        );
      case 'amber':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40">
            <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400" />
            <span>Amber Tag · Maintenance Due</span>
          </span>
        );
      case 'red':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-900 border border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40">
            <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400 animate-ping" />
            <span>Red Tag · Grounded / Out of Service</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t.gse.title}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {t.gse.subtitle} · Marsa Alam International Airport (RMF)
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Equipment</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards with High Contrast */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Total Fleet */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Fleet
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.total}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Units
            </span>
          </div>
        </div>

        {/* Green Tag (Fit for Service) */}
        <div 
          onClick={() => setFilterTag(filterTag === 'green' ? 'all' : 'green')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
            filterTag === 'green' 
              ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-600'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Fit for Service
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              {stats.green}
            </span>
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
              Green Tag
            </span>
          </div>
        </div>

        {/* Amber Tag (Maintenance Due) */}
        <div 
          onClick={() => setFilterTag(filterTag === 'amber' ? 'all' : 'amber')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
            filterTag === 'amber' 
              ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-600'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Service Due
            </span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-amber-700 dark:text-amber-400">
              {stats.amber}
            </span>
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
              Amber Tag
            </span>
          </div>
        </div>

        {/* Red Tag (Grounded) */}
        <div 
          onClick={() => setFilterTag(filterTag === 'red' ? 'all' : 'red')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
            filterTag === 'red' 
              ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-600'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
              Grounded Fleet
            </span>
            <AlertOctagon className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-red-700 dark:text-red-400">
              {stats.red}
            </span>
            <span className="text-[11px] font-bold text-red-800 dark:text-red-300">
              Red Tag
            </span>
          </div>
        </div>

        {/* Serviceability Rate */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Serviceability
            </span>
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.rate}%
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Availability
            </span>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID (e.g. RMF-TUG-01), vehicle name, stand bay, defect..."
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Tag Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Tag Statuses ({gseFleet.length})</option>
              <option value="green">Green Tag · Fit ({stats.green})</option>
              <option value="amber">Amber Tag · Due ({stats.amber})</option>
              <option value="red">Red Tag · Grounded ({stats.red})</option>
            </select>
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Equipment Types</option>
            {GSE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {(filterTag !== 'all' || filterType !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setFilterTag('all');
                setFilterType('all');
                setSearchQuery('');
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              Reset Filters
            </button>
          )}

        </div>

      </div>

      {/* Fleet Cards Grid */}
      {filteredFleet.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <Truck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No GSE Equipment Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No ground support equipment matches your current search criteria or tag filters. Try resetting the filters or add a new vehicle.
          </p>
          <button
            onClick={() => { setFilterTag('all'); setFilterType('all'); setSearchQuery(''); }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFleet.map((vehicle) => {
            const linkedReport = vehicle.activeDefectReportId 
              ? reports.find(r => r.id === vehicle.activeDefectReportId)
              : null;

            const isRed = vehicle.tagStatus === 'red';
            const isAmber = vehicle.tagStatus === 'amber';
            const isGreen = vehicle.tagStatus === 'green';

            return (
              <div
                key={vehicle.id}
                className={`rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between border ${
                  isRed
                    ? 'bg-red-50/40 border-red-300 dark:bg-red-950/20 dark:border-red-800/60 ring-1 ring-red-500/20'
                    : isAmber
                    ? 'bg-amber-50/30 border-amber-300 dark:bg-amber-950/20 dark:border-amber-800/50'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md'
                }`}
              >
                <div className="space-y-3.5">
                  
                  {/* Card Top: ID and Tag Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 border border-blue-200 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-700/50">
                      {vehicle.id}
                    </span>
                    {renderTagBadge(vehicle.tagStatus)}
                  </div>

                  {/* Title & Type */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {vehicle.name}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vehicle.type}</span>
                    </p>
                  </div>

                  {/* Specs Matrix with High Contrast */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold tracking-wider">
                        Stand Bay
                      </span>
                      <span className="text-slate-900 dark:text-slate-100 font-semibold text-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="truncate">{vehicle.locationStand}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold tracking-wider">
                        Operating Hours
                      </span>
                      <span className="text-slate-900 dark:text-slate-100 font-semibold text-xs flex items-center gap-1 mt-0.5">
                        <Gauge className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
                        <span>{vehicle.operatingHours.toLocaleString()} hrs</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold tracking-wider">
                        Manufacturer
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium text-[11px] truncate block mt-0.5" title={vehicle.manufacturer}>
                        {vehicle.manufacturer}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold tracking-wider">
                        Next Service Due
                      </span>
                      <span className="text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{vehicle.nextServiceDue}</span>
                      </span>
                    </div>
                  </div>

                  {/* Defect or Clearance Statement Block (Adjusted & Dynamic) */}
                  {isRed && (
                    <div className="p-3 rounded-xl bg-red-100/80 border border-red-300 dark:bg-red-950/40 dark:border-red-800/70 space-y-1.5 shadow-xs">
                      <div className="font-bold flex items-center gap-1.5 text-xs text-red-900 dark:text-red-300">
                        <AlertOctagon className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                        <span>Active Safety Defect & Grounding Tag</span>
                      </div>
                      <p className="text-xs leading-relaxed text-red-950 dark:text-red-200 font-medium">
                        {vehicle.activeDefectNotes || 'Equipment grounded by GSE Maintenance due to observed safety defect.'}
                      </p>
                      {linkedReport && (
                        <div className="text-[10px] font-mono font-bold text-red-800 dark:text-red-300 pt-1 border-t border-red-200 dark:border-red-800/50 flex items-center justify-between">
                          <span>Triggered by Safety Report:</span>
                          <span className="underline">{linkedReport.id}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {isAmber && (
                    <div className="p-3 rounded-xl bg-amber-100/70 border border-amber-300 dark:bg-amber-950/40 dark:border-amber-800/60 space-y-1.5 shadow-xs">
                      <div className="font-bold flex items-center gap-1.5 text-xs text-amber-900 dark:text-amber-300">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>Maintenance Warning / Deferred Item</span>
                      </div>
                      <p className="text-xs leading-relaxed text-amber-950 dark:text-amber-200 font-medium">
                        {vehicle.activeDefectNotes || 'Scheduled maintenance overdue or deferred maintenance action active.'}
                      </p>
                    </div>
                  )}

                  {isGreen && vehicle.serviceClearanceNotes && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800/50 space-y-1 shadow-xs">
                      <div className="font-bold flex items-center gap-1.5 text-xs text-emerald-900 dark:text-emerald-300">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>Return to Service Clearance</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-emerald-950 dark:text-emerald-200 font-medium">
                        {vehicle.serviceClearanceNotes}
                      </p>
                      {vehicle.clearedAt && (
                        <div className="text-[10px] text-emerald-800 dark:text-emerald-400 pt-1 flex items-center justify-between">
                          <span>Cleared: {vehicle.clearedAt.substring(0, 10)}</span>
                          {vehicle.clearedBy && <span className="truncate max-w-[150px]">{vehicle.clearedBy}</span>}
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Card Action Footer */}
                <div className="pt-3.5 mt-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(vehicle)}
                      title="Edit Equipment Specifications"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setVehicleToDelete(vehicle)}
                      title="De-register Equipment"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => openTagModal(vehicle)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-600 hover:text-white border border-blue-200 dark:bg-blue-600/20 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white dark:border-blue-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Manage Tag</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: MANAGE TAG & DEFECT CLEARANCE (With Dynamic Statement Adaptation) */}
      {/* ========================================================================= */}
      {tagModalVehicle && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-300">
                    {tagModalVehicle.id}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    · Current Tag:
                  </span>
                  {renderTagBadge(tagModalVehicle.tagStatus)}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {tagModalVehicle.name}
                </h3>
              </div>
              <button 
                onClick={() => setTagModalVehicle(null)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTagTab('manage')}
                className={`pb-2 transition-colors border-b-2 ${
                  activeTagTab === 'manage'
                    ? 'border-blue-600 text-blue-700 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                Apply Tag Transition
              </button>
              <button
                type="button"
                onClick={() => setActiveTagTab('history')}
                className={`pb-2 transition-colors border-b-2 flex items-center gap-1 ${
                  activeTagTab === 'history'
                    ? 'border-blue-600 text-blue-700 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Tag Transition History ({tagModalVehicle.tagHistory?.length || 1})</span>
              </button>
            </div>

            {activeTagTab === 'manage' ? (
              <form onSubmit={handleApplyTagTransition} className="space-y-4 text-xs">
                
                {/* Tag Selection Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Select New Equipment Status Tag:
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    
                    {/* Green Button */}
                    <button
                      type="button"
                      onClick={() => handleSelectTagInModal('green')}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                        targetTag === 'green'
                          ? 'border-emerald-600 bg-emerald-100 text-emerald-950 font-black ring-2 ring-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold'
                      }`}
                    >
                      <CheckCircle className={`w-5 h-5 ${targetTag === 'green' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`} />
                      <span className="text-xs">Green Tag</span>
                      <span className="text-[10px] font-normal opacity-85">Fit for Service</span>
                    </button>

                    {/* Amber Button */}
                    <button
                      type="button"
                      onClick={() => handleSelectTagInModal('amber')}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                        targetTag === 'amber'
                          ? 'border-amber-600 bg-amber-100 text-amber-950 font-black ring-2 ring-amber-500 dark:bg-amber-950/60 dark:text-amber-200'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold'
                      }`}
                    >
                      <AlertTriangle className={`w-5 h-5 ${targetTag === 'amber' ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400'}`} />
                      <span className="text-xs">Amber Tag</span>
                      <span className="text-[10px] font-normal opacity-85">Service Due</span>
                    </button>

                    {/* Red Button */}
                    <button
                      type="button"
                      onClick={() => handleSelectTagInModal('red')}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                        targetTag === 'red'
                          ? 'border-red-600 bg-red-100 text-red-950 font-black ring-2 ring-red-500 dark:bg-red-950/60 dark:text-red-200'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold'
                      }`}
                    >
                      <AlertOctagon className={`w-5 h-5 ${targetTag === 'red' ? 'text-red-700 dark:text-red-400' : 'text-slate-400'}`} />
                      <span className="text-xs">Red Tag</span>
                      <span className="text-[10px] font-normal opacity-85">Grounded / OOS</span>
                    </button>

                  </div>
                </div>

                {/* Transition Explanatory Callout */}
                {targetTag === 'green' && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200 text-xs flex items-start gap-2">
                    <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Returning to Green Tag (Fit for Service)</p>
                      <p className="text-[11px] text-emerald-900/90 dark:text-emerald-300 mt-0.5">
                        Applying the Green Tag will resolve any active defect statement. Please enter the work order clearance note, workshop sign-off, or inspection confirmation below.
                      </p>
                    </div>
                  </div>
                )}

                {targetTag === 'red' && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-300 dark:bg-red-950/30 dark:border-red-800/60 text-red-950 dark:text-red-200 text-xs flex items-start gap-2">
                    <AlertOctagon className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Grounding Equipment (Red Tag)</p>
                      <p className="text-[11px] text-red-900/90 dark:text-red-300 mt-0.5">
                        This equipment will be tagged OUT OF SERVICE immediately on the apron. Enter the exact defect reason, brake/hydraulic issue, or safety hazard.
                      </p>
                    </div>
                  </div>
                )}

                {/* Dynamic Notes Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {targetTag === 'green' 
                        ? 'Return-to-Service Clearance & Work Order Notes:' 
                        : targetTag === 'red'
                        ? 'Defect Description & Grounding Reason:'
                        : 'Maintenance Advisory & Deferred Work Notes:'}
                    </label>
                    <span className="text-[10px] text-slate-500">
                      {targetTag === 'green' ? 'Clears active defect' : 'Mandatory for audit trail'}
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    value={tagNotes}
                    onChange={(e) => setTagNotes(e.target.value)}
                    placeholder={
                      targetTag === 'green'
                        ? 'E.g. Work order #WO-4819 completed. Brake system repaired and calibrated. Passed operational load test and verified fit for flightline service by Workshop Lead...'
                        : targetTag === 'red'
                        ? 'E.g. Severe hydraulic fluid leak under main boom cylinder. Vehicle unsafe for aircraft servicing. Grounded pending workshop overhaul...'
                        : 'E.g. 500-hour preventive maintenance interval reached. Servicing required within 48 hours...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-sans text-xs leading-relaxed"
                    required={targetTag === 'red'}
                  />
                </div>

                {/* Authority / Sign-off Person */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Authorized Sign-off Personnel:
                  </label>
                  <input
                    type="text"
                    value={tagActorName}
                    onChange={(e) => setTagActorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setTagModalVehicle(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 ${
                      targetTag === 'green'
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                        : targetTag === 'amber'
                        ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                        : 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply {targetTag.toUpperCase()} Tag</span>
                  </button>
                </div>

              </form>
            ) : (
              /* History Tab */
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {(!tagModalVehicle.tagHistory || tagModalVehicle.tagHistory.length === 0) ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No previous tag history logged for this unit.
                  </div>
                ) : (
                  tagModalVehicle.tagHistory.map((item, idx) => (
                    <div 
                      key={item.id || idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        {renderTagBadge(item.tag)}
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                        {item.notes}
                      </p>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-200 dark:border-slate-800/60">
                        <span>Authorized by:</span>
                        <strong className="text-slate-700 dark:text-slate-300">{item.changedBy}</strong>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD NEW GSE EQUIPMENT                                            */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Add New Ground Support Equipment
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Register equipment into Marsa Alam airside active fleet register
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3.5 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Equipment ID */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Equipment ID (e.g. RMF-TUG-04):
                  </label>
                  <input
                    type="text"
                    value={addFormId}
                    onChange={(e) => setAddFormId(e.target.value)}
                    placeholder="Leave blank for auto-ID"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                {/* Equipment Name */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Equipment Unit Name: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addFormName}
                    onChange={(e) => setAddFormName(e.target.value)}
                    placeholder="E.g. TLD TMX-150 Aircraft Tractor #04"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category / Type */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Equipment Category / Type:
                  </label>
                  <select
                    value={addFormType}
                    onChange={(e) => setAddFormType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    {GSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Manufacturer */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Manufacturer:
                  </label>
                  <select
                    value={addFormMfg}
                    onChange={(e) => setAddFormMfg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    {GSE_MANUFACTURERS.map(mfg => (
                      <option key={mfg} value={mfg}>{mfg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Stand Bay Location */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Stand Bay / Apron Zone:
                  </label>
                  <select
                    value={addFormStand}
                    onChange={(e) => setAddFormStand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    {APRON_STANDS.map(stand => (
                      <option key={stand} value={stand}>{stand}</option>
                    ))}
                  </select>
                </div>

                {/* Operating Hours */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Hours Run:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addFormHours}
                    onChange={(e) => setAddFormHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Next Service Due */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Next Service Due Date:
                  </label>
                  <input
                    type="date"
                    value={addFormServiceDue}
                    onChange={(e) => setAddFormServiceDue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Initial Tag Status */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Tag Status:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label className={`p-2.5 rounded-xl border text-center cursor-pointer font-bold ${
                    addFormTag === 'green' ? 'bg-emerald-100 border-emerald-500 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-200' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="addTag"
                      value="green"
                      checked={addFormTag === 'green'}
                      onChange={() => setAddFormTag('green')}
                      className="sr-only"
                    />
                    ✓ Green Tag (Fit)
                  </label>

                  <label className={`p-2.5 rounded-xl border text-center cursor-pointer font-bold ${
                    addFormTag === 'amber' ? 'bg-amber-100 border-amber-500 text-amber-950 dark:bg-amber-950/60 dark:text-amber-200' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="addTag"
                      value="amber"
                      checked={addFormTag === 'amber'}
                      onChange={() => setAddFormTag('amber')}
                      className="sr-only"
                    />
                    ⚠ Amber Tag (Due)
                  </label>

                  <label className={`p-2.5 rounded-xl border text-center cursor-pointer font-bold ${
                    addFormTag === 'red' ? 'bg-red-100 border-red-500 text-red-950 dark:bg-red-950/60 dark:text-red-200' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="addTag"
                      value="red"
                      checked={addFormTag === 'red'}
                      onChange={() => setAddFormTag('red')}
                      className="sr-only"
                    />
                    ✕ Red Tag (Grounded)
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {addFormTag === 'green' ? 'Acceptance / Commissioning Notes:' : 'Defect / Warning Notes:'}
                </label>
                <textarea
                  rows={2}
                  value={addFormNotes}
                  onChange={(e) => setAddFormNotes(e.target.value)}
                  placeholder="Enter initial commissioning details, warranty notes, or observed defect..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Equipment</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT EQUIPMENT SPECIFICATIONS                                    */}
      {/* ========================================================================= */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">
                  {editingVehicle.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Edit Equipment Details
                </h3>
              </div>
              <button 
                onClick={() => setEditingVehicle(null)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Equipment Name:
                </label>
                <input
                  type="text"
                  required
                  value={editFormName}
                  onChange={(e) => setEditFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Equipment Category:
                  </label>
                  <select
                    value={editFormType}
                    onChange={(e) => setEditFormType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    {GSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Manufacturer:
                  </label>
                  <select
                    value={editFormMfg}
                    onChange={(e) => setEditFormMfg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    {GSE_MANUFACTURERS.map(mfg => (
                      <option key={mfg} value={mfg}>{mfg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Stand Location:
                  </label>
                  <select
                    value={editFormStand}
                    onChange={(e) => setEditFormStand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    {APRON_STANDS.map(stand => (
                      <option key={stand} value={stand}>{stand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hours Run:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormHours}
                    onChange={(e) => setEditFormHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Next Service:
                  </label>
                  <input
                    type="date"
                    value={editFormServiceDue}
                    onChange={(e) => setEditFormServiceDue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE CONFIRMATION                                              */}
      {/* ========================================================================= */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 w-12 h-12 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                De-register Equipment?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to remove <strong>{vehicleToDelete.id}</strong> ({vehicleToDelete.name}) from the active GSE register?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVehicleToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Equipment</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
