import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { StaffTrainingRecord, StaffCourse, StationRole } from '../types/index.ts';
import { 
  GraduationCap, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  X, 
  FileCheck,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Printer,
  ShieldCheck,
  ShieldAlert,
  Lock,
  ArrowRight,
  User,
  Users,
  Award,
  Calendar,
  Building2,
  BookOpen,
  Check,
  RotateCcw
} from 'lucide-react';

export const TrainingMatrixView: React.FC = () => {
  const { 
    language, 
    activeRole,
    setActiveRole,
    trainingRecords, 
    addStaffTrainingRecord,
    updateStaffTrainingRecord,
    deleteStaffTrainingRecord,
    addStaffCourse,
    updateStaffCourse,
    deleteStaffCourse,
    recertifyStaffCourse 
  } = useApp();

  const t = translations[language];

  // RBAC Access Guard: strictly Safety & Quality Manager and Head of Training
  const isAuthorized = activeRole === 'hod_safety' || activeRole === 'hod_training';

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Staff Record Modal State (Create & Edit)
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffTrainingRecord | null>(null);
  const [staffFormName, setStaffFormName] = useState('');
  const [staffFormBadge, setStaffFormBadge] = useState('');
  const [staffFormDept, setStaffFormDept] = useState('Operations - Ramp Services');
  const [staffFormRole, setStaffFormRole] = useState('Apron Ramp Safety Agent');
  const [staffFormPreset, setStaffFormPreset] = useState<'ramp' | 'pax' | 'gse' | 'custom'>('ramp');

  // Course Modal State (Add & Edit Course for Staff)
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseTargetStaff, setCourseTargetStaff] = useState<StaffTrainingRecord | null>(null);
  const [editingCourse, setEditingCourse] = useState<StaffCourse | null>(null);
  const [courseFormId, setCourseFormId] = useState('');
  const [courseFormName, setCourseFormName] = useState('');
  const [courseFormCertifiedDate, setCourseFormCertifiedDate] = useState(new Date().toISOString().split('T')[0]);
  const [courseFormExpiryDate, setCourseFormExpiryDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return d.toISOString().split('T')[0];
  });

  // Fast Recertification Modal State
  const [recertModalOpen, setRecertModalOpen] = useState(false);
  const [recertStaff, setRecertStaff] = useState<StaffTrainingRecord | null>(null);
  const [recertCourse, setRecertCourse] = useState<StaffCourse | null>(null);
  const [recertCertifiedDate, setRecertCertifiedDate] = useState(new Date().toISOString().split('T')[0]);
  const [recertNewExpiry, setRecertNewExpiry] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return d.toISOString().split('T')[0];
  });

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'staff' | 'course';
    staffId: string;
    courseId?: string;
    title: string;
  } | null>(null);

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);

  // Statistics Calculations
  const stats = useMemo(() => {
    const totalStaff = trainingRecords.length;
    const allCourses = trainingRecords.flatMap(tr => tr.courses);
    const totalCourses = allCourses.length;
    const validCount = allCourses.filter(c => c.status === 'valid').length;
    const expiringCount = allCourses.filter(c => c.status === 'expiring').length;
    const expiredCount = allCourses.filter(c => c.status === 'expired').length;
    const complianceRate = totalCourses > 0 ? Math.round(((totalCourses - expiredCount) / totalCourses) * 100) : 100;

    return {
      totalStaff,
      totalCourses,
      validCount,
      expiringCount,
      expiredCount,
      complianceRate
    };
  }, [trainingRecords]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const depts = new Set(trainingRecords.map(tr => tr.department));
    return Array.from(depts);
  }, [trainingRecords]);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return trainingRecords.filter(staff => {
      // Department filter
      if (departmentFilter !== 'all' && staff.department !== departmentFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all') {
        const hasStatus = staff.courses.some(c => c.status === statusFilter);
        if (!hasStatus) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = staff.name.toLowerCase().includes(q);
        const matchBadge = staff.badgeNumber.toLowerCase().includes(q);
        const matchRole = staff.roleTitle.toLowerCase().includes(q);
        const matchCourse = staff.courses.some(c => 
          c.courseName.toLowerCase().includes(q) || c.courseId.toLowerCase().includes(q)
        );
        if (!matchName && !matchBadge && !matchRole && !matchCourse) return false;
      }
      return true;
    });
  }, [trainingRecords, departmentFilter, statusFilter, searchQuery]);

  // Helper for Status Badge
  const getStatusBadge = (status: 'valid' | 'expiring' | 'expired') => {
    switch (status) {
      case 'valid':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Valid</span>
          </span>
        );
      case 'expiring':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3" />
            <span>Expiring (&lt; 30d)</span>
          </span>
        );
      case 'expired':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 font-mono">
            <AlertTriangle className="w-3 h-3" />
            <span>Expired</span>
          </span>
        );
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: STAFF RECORD CRUD
  // -------------------------------------------------------------
  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffFormName('');
    setStaffFormBadge(`RMF-${Math.floor(1000 + Math.random() * 9000)}`);
    setStaffFormDept('Operations - Ramp Services');
    setStaffFormRole('Apron Ramp Safety Agent');
    setStaffFormPreset('ramp');
    setShowStaffModal(true);
  };

  const handleOpenEditStaff = (staff: StaffTrainingRecord) => {
    setEditingStaff(staff);
    setStaffFormName(staff.name);
    setStaffFormBadge(staff.badgeNumber);
    setStaffFormDept(staff.department);
    setStaffFormRole(staff.roleTitle);
    setShowStaffModal(true);
  };

  const handleSaveStaffForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFormName.trim() || !staffFormBadge.trim()) return;

    if (editingStaff) {
      updateStaffTrainingRecord(editingStaff.id, {
        name: staffFormName.trim(),
        badgeNumber: staffFormBadge.trim(),
        department: staffFormDept,
        roleTitle: staffFormRole.trim()
      });
    } else {
      // Build initial courses based on preset
      let initialCourses: StaffCourse[] = [];
      const today = new Date().toISOString().split('T')[0];
      const twoYears = new Date();
      twoYears.setFullYear(twoYears.getFullYear() + 2);
      const twoYearsDate = twoYears.toISOString().split('T')[0];

      if (staffFormPreset === 'ramp') {
        initialCourses = [
          { courseId: 'ISAGO RMP-SAF', courseName: 'IATA ISAGO Ramp Safety & Marshalling', certifiedDate: today, expiryDate: twoYearsDate, status: 'valid' },
          { courseId: 'DGR-CAT8', courseName: 'IATA Dangerous Goods Regulations Cat 8', certifiedDate: today, expiryDate: twoYearsDate, status: 'valid' },
          { courseId: 'SMS-INIT', courseName: 'Station Aviation Safety Management (SMS)', certifiedDate: today, expiryDate: twoYearsDate, status: 'valid' },
          { courseId: 'AIR-FIRSTAID', courseName: 'Airside First Aid & Fire Response', certifiedDate: today, expiryDate: twoYearsDate, status: 'valid' }
        ];
      } else if (staffFormPreset === 'gse') {
        initialCourses = [
          { courseId: 'GSE-PUSHBACK', courseName: 'Aircraft Pushback Tug Operations', certifiedDate: today, expiryDate: twoYearsDate, status: 'valid' },
          { courseId: 'GSE-GPU-ASU', courseName: 'GPU & ASU Ground Power Servicing', certifiedDate: today, expiryDate: twoYearsDate, status: 'valid' },
          { courseId: 'AIR-DRV-PERM', courseName: 'Marsa Alam Airside Driving Permit (ADP)', certifiedDate: today, expiryDate: twoYearsDate, status: 'valid' },
          { courseId: 'ISAGO RMP-SAF', courseName: 'IATA ISAGO Ramp Safety & FOD Prevention', certifiedDate: today, expiryDate: twoYearsDate, status: 'valid' }
        ];
      } else if (staffFormPreset === 'pax') {
        initialCourses = [
          { courseId: 'PAX-DCS-ALTEA', courseName: 'Amadeus Altea Departure Control (DCS)', certifiedDate: today, expiryDate: twoYearsDate, status: 'valid' },
          { courseId: 'PAX-PRM-AMB', courseName: 'PRM Special Assistance & Ambulift Ops', certifiedDate: today, expiryDate: twoYearsDate, status: 'valid' },
          { courseId: 'DGR-CAT9', courseName: 'IATA Dangerous Goods Awareness Cat 9', certifiedDate: today, expiryDate: twoYearsDate, status: 'valid' },
          { courseId: 'SMS-INIT', courseName: 'Station Aviation Safety Management (SMS)', certifiedDate: today, expiryDate: twoYearsDate, status: 'valid' }
        ];
      }

      addStaffTrainingRecord({
        name: staffFormName.trim(),
        badgeNumber: staffFormBadge.trim(),
        department: staffFormDept,
        roleTitle: staffFormRole.trim(),
        courses: initialCourses
      });
    }

    setShowStaffModal(false);
  };

  // -------------------------------------------------------------
  // HANDLERS: COURSE QUALIFICATION CRUD
  // -------------------------------------------------------------
  const handleOpenAddCourse = (staff: StaffTrainingRecord) => {
    setCourseTargetStaff(staff);
    setEditingCourse(null);
    setCourseFormId('ISAGO RMP-SAF-02');
    setCourseFormName('IATA ISAGO Turnaround Inspection Standard');
    setCourseFormCertifiedDate(new Date().toISOString().split('T')[0]);
    const exp = new Date();
    exp.setFullYear(exp.getFullYear() + 2);
    setCourseFormExpiryDate(exp.toISOString().split('T')[0]);
    setShowCourseModal(true);
  };

  const handleOpenEditCourse = (staff: StaffTrainingRecord, course: StaffCourse) => {
    setCourseTargetStaff(staff);
    setEditingCourse(course);
    setCourseFormId(course.courseId);
    setCourseFormName(course.courseName);
    setCourseFormCertifiedDate(course.certifiedDate || new Date().toISOString().split('T')[0]);
    setCourseFormExpiryDate(course.expiryDate);
    setShowCourseModal(true);
  };

  const handleSaveCourseForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTargetStaff || !courseFormId.trim() || !courseFormName.trim()) return;

    // Calculate status based on expiry
    const expDate = new Date(courseFormExpiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let status: 'valid' | 'expiring' | 'expired' = 'valid';
    if (diffDays <= 0) {
      status = 'expired';
    } else if (diffDays <= 30) {
      status = 'expiring';
    }

    const courseData: StaffCourse = {
      courseId: courseFormId.trim().toUpperCase(),
      courseName: courseFormName.trim(),
      certifiedDate: courseFormCertifiedDate,
      expiryDate: courseFormExpiryDate,
      status
    };

    if (editingCourse) {
      updateStaffCourse(courseTargetStaff.id, editingCourse.courseId, courseData);
    } else {
      addStaffCourse(courseTargetStaff.id, courseData);
    }

    setShowCourseModal(false);
  };

  // -------------------------------------------------------------
  // HANDLERS: FAST RECERTIFICATION
  // -------------------------------------------------------------
  const openFastRecertModal = (staff: StaffTrainingRecord, course: StaffCourse) => {
    setRecertStaff(staff);
    setRecertCourse(course);
    const today = new Date().toISOString().split('T')[0];
    setRecertCertifiedDate(today);
    const twoYears = new Date();
    twoYears.setFullYear(twoYears.getFullYear() + 2);
    setRecertNewExpiry(twoYears.toISOString().split('T')[0]);
    setRecertModalOpen(true);
  };

  const handleExecuteRecertification = () => {
    if (recertStaff && recertCourse) {
      recertifyStaffCourse(recertStaff.id, recertCourse.courseId, recertNewExpiry, recertCertifiedDate);
      setRecertModalOpen(false);
    }
  };

  // =============================================================
  // ACCESS RESTRICTION VIEW (if non-authorized role accesses)
  // =============================================================
  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            IATA ISAGO ORM 3.1 & STATION SECURITY POLICY
          </span>
          <h2 className="text-2xl font-bold text-white">
            Access Restricted: Training & Competency Matrix
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
            Under station safety & security protocols, frontline competency records, qualification credentials, and recertification authorizations are restricted to the <strong>Safety & Quality Manager (SQM)</strong> and the <strong>Head of Training</strong>.
          </p>
        </div>

        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Your Current Role:</span>
            <span className="font-mono font-bold text-amber-400 capitalize">{activeRole}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Authorized Personas:</span>
            <span className="text-slate-200">Safety & Quality Manager (hod_safety), Head of Training (hod_training)</span>
          </div>
        </div>

        {/* Quick-switch role helper for review/testing */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setActiveRole('hod_safety')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Switch to Safety & Quality Manager</span>
          </button>

          <button
            onClick={() => setActiveRole('hod_training')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Switch to Head of Training</span>
          </button>
        </div>
      </div>
    );
  }

  // =============================================================
  // MAIN AUTHORIZED VIEW
  // =============================================================
  return (
    <div className="space-y-6">
      
      {/* Authorized Header & Role Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>AUTHORIZED ACCESS: {activeRole === 'hod_safety' ? 'Dr. Khaled Fawzy (SQM)' : 'Capt. Mohamed Galal (Head of Training)'}</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              IATA ISAGO ORM 3.1
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-indigo-400" />
            <span>{t.training.title}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {language === 'ar'
              ? 'مصفوفة الكفاءات وتأهيل الكوادر الأرضية بمحطة مرسى علم الدولية وفقاً لمتطلبات اياتا ايساجو وإجراءات الأمن والسلامة.'
              : 'Complete frontline staff qualification roster, recurrency periodicity, and certified competency compliance at Marsa Alam International Airport (RMF).'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer border border-slate-700"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Export Matrix</span>
          </button>

          <button
            onClick={handleOpenAddStaff}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* KPI Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Staff</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-white">{stats.totalStaff}</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Qualifications</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-blue-400">{stats.totalCourses}</span>
            <Award className="w-4 h-4 text-blue-500/40" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Compliance Rate</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl font-bold font-mono ${stats.complianceRate >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {stats.complianceRate}%
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-500/40" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Valid / Current</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">{stats.validCount}</span>
            <CheckCircle className="w-4 h-4 text-emerald-500/40" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Expiring (&lt; 30d)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl font-bold font-mono ${stats.expiringCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {stats.expiringCount}
            </span>
            <Clock className="w-4 h-4 text-amber-500/40" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Expired Recert</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl font-bold font-mono ${stats.expiredCount > 0 ? 'text-red-400 font-black animate-pulse' : 'text-emerald-400'}`}>
              {stats.expiredCount}
            </span>
            <AlertTriangle className="w-4 h-4 text-red-500/40" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name, badge, role, or qualification..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg text-slate-300 px-3 py-1.5 focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((d, i) => (
              <option key={i} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg text-slate-300 px-3 py-1.5 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="valid">Valid & Current Only</option>
            <option value="expiring">Has Expiring (&lt; 30d)</option>
            <option value="expired">Has Expired Credentials</option>
          </select>
        </div>
      </div>

      {/* Staff Roster Cards List */}
      <div className="space-y-4">
        {filteredStaff.length === 0 ? (
          <div className="p-10 text-center bg-slate-900/40 rounded-xl border border-dashed border-slate-800 space-y-3">
            <GraduationCap className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No Staff Training Records Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No staff members matched your search or department filter. Add a new staff record to begin tracking certifications.
            </p>
            <button
              onClick={handleOpenAddStaff}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
            >
              + Add Staff Record Now
            </button>
          </div>
        ) : (
          filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg hover:border-slate-700 transition"
            >
              {/* Staff Card Header & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-400" />
                      <span>{staff.name}</span>
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-500/20 font-bold">
                      Badge: {staff.badgeNumber}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      ID: {staff.id}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-200">{staff.roleTitle}</span>
                    <span>•</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{staff.department}</span>
                    </span>
                  </div>
                </div>

                {/* Staff Actions */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    onClick={() => handleOpenAddCourse(staff)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition cursor-pointer"
                    title="Add qualification to this staff member"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Course</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditStaff(staff)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                    title="Edit staff member profile"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteTarget({ type: 'staff', staffId: staff.id, title: staff.name })}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer"
                    title="Delete staff record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Courses Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Qualified Certifications ({staff.courses.length})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Mandatory 24-Month Recurrency under ISAGO
                  </span>
                </div>

                {staff.courses.length === 0 ? (
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                    No active qualifications recorded. Click "+ Add Course" to register qualifications.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {staff.courses.map((course) => (
                      <div
                        key={course.courseId}
                        className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between space-y-3 transition ${
                          course.status === 'expired'
                            ? 'bg-red-950/20 border-red-800/60'
                            : course.status === 'expiring'
                              ? 'bg-amber-950/20 border-amber-800/60'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                              {course.courseId}
                            </span>
                            {getStatusBadge(course.status)}
                          </div>
                          <h4 className="font-semibold text-white leading-snug line-clamp-2">
                            {course.courseName}
                          </h4>
                        </div>

                        {/* Dates & Actions */}
                        <div className="pt-2 border-t border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>Certified: {course.certifiedDate || 'N/A'}</span>
                            <span className={course.status === 'expired' ? 'text-red-400 font-bold' : course.status === 'expiring' ? 'text-amber-400 font-bold' : ''}>
                              Exp: {course.expiryDate}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <button
                              onClick={() => openFastRecertModal(staff, course)}
                              className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                              title="Recertify course"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Recertify</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditCourse(staff, course)}
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                                title="Edit course parameters"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({
                                  type: 'course',
                                  staffId: staff.id,
                                  courseId: course.courseId,
                                  title: `${course.courseName} (${course.courseId})`
                                })}
                                className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer"
                                title="Remove qualification"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT STAFF MEMBER                                            */}
      {/* ========================================================================= */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                <span>{editingStaff ? 'Edit Staff Profile' : 'Add Frontline Staff Member'}</span>
              </h3>
              <button
                onClick={() => setShowStaffModal(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaffForm} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={staffFormName}
                  onChange={(e) => setStaffFormName(e.target.value)}
                  placeholder="e.g. Youssef El-Sayed"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Airport Badge Number *</label>
                  <input
                    type="text"
                    required
                    value={staffFormBadge}
                    onChange={(e) => setStaffFormBadge(e.target.value)}
                    placeholder="e.g. RMF-4091"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Department *</label>
                  <select
                    value={staffFormDept}
                    onChange={(e) => setStaffFormDept(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Operations - Ramp Services">Operations - Ramp Services</option>
                    <option value="Maintenance - GSE Fleet">Maintenance - GSE Fleet</option>
                    <option value="Passenger Handling & Dispatch">Passenger Handling & Dispatch</option>
                    <option value="Quality & Safety">Quality & Safety</option>
                    <option value="Baggage Handling & Cargo">Baggage Handling & Cargo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Job Title / Airside Designation *</label>
                <input
                  type="text"
                  required
                  value={staffFormRole}
                  onChange={(e) => setStaffFormRole(e.target.value)}
                  placeholder="e.g. Apron Ramp Safety Agent or Lead Pushback Operator"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              {!editingStaff && (
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-slate-400 block font-semibold text-[11px]">
                    Automatic Initial Qualification Package:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setStaffFormPreset('ramp')}
                      className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                        staffFormPreset === 'ramp' ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Ramp Services (4 Courses)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStaffFormPreset('gse')}
                      className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                        staffFormPreset === 'gse' ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      GSE Fleet (4 Courses)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStaffFormPreset('pax')}
                      className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                        staffFormPreset === 'pax' ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Passenger (4 Courses)
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  {editingStaff ? 'Update Staff Profile' : 'Save & Register Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT QUALIFICATION COURSE                                    */}
      {/* ========================================================================= */}
      {showCourseModal && courseTargetStaff && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <span>{editingCourse ? 'Edit Qualification' : 'Add Qualification Course'}</span>
              </h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-500">Staff Member:</span>
              <div className="font-bold text-white">{courseTargetStaff.name} ({courseTargetStaff.badgeNumber})</div>
            </div>

            <form onSubmit={handleSaveCourseForm} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Course Code / Standard ID *</label>
                <input
                  type="text"
                  required
                  value={courseFormId}
                  onChange={(e) => setCourseFormId(e.target.value)}
                  placeholder="e.g. ISAGO RMP-SAF or DGR-CAT8"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Course Title *</label>
                <input
                  type="text"
                  required
                  value={courseFormName}
                  onChange={(e) => setCourseFormName(e.target.value)}
                  placeholder="e.g. IATA ISAGO Ramp Safety & Marshalling Procedures"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Certified Date *</label>
                  <input
                    type="date"
                    required
                    value={courseFormCertifiedDate}
                    onChange={(e) => setCourseFormCertifiedDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={courseFormExpiryDate}
                    onChange={(e) => setCourseFormExpiryDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Quick Periodicity Shortcuts */}
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                <span>Set Expiry:</span>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(courseFormCertifiedDate || new Date());
                    d.setFullYear(d.getFullYear() + 1);
                    setCourseFormExpiryDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                >
                  +1 Year
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(courseFormCertifiedDate || new Date());
                    d.setFullYear(d.getFullYear() + 2);
                    setCourseFormExpiryDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                >
                  +2 Years (ISAGO standard)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(courseFormCertifiedDate || new Date());
                    d.setFullYear(d.getFullYear() + 3);
                    setCourseFormExpiryDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                >
                  +3 Years
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  {editingCourse ? 'Update Qualification' : 'Add Qualification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FAST RECERTIFICATION                                               */}
      {/* ========================================================================= */}
      {recertModalOpen && recertStaff && recertCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-slate-100 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                <span>Log Qualification Recertification</span>
              </h3>
              <button onClick={() => setRecertModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <p className="text-slate-300">
                Staff: <strong className="text-white">{recertStaff.name}</strong> ({recertStaff.badgeNumber})
              </p>
              <p className="text-slate-300">
                Course: <strong className="text-indigo-400">{recertCourse.courseName}</strong> ({recertCourse.courseId})
              </p>
              <p className="text-slate-400 text-[11px]">
                Previous Expiry: <span className="font-mono text-slate-300">{recertCourse.expiryDate}</span>
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Recertification Date (Today)</label>
                <input
                  type="date"
                  value={recertCertifiedDate}
                  onChange={(e) => setRecertCertifiedDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">New Certification Expiry Date</label>
                <input
                  type="date"
                  value={recertNewExpiry}
                  onChange={(e) => setRecertNewExpiry(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(recertCertifiedDate);
                    d.setFullYear(d.getFullYear() + 1);
                    setRecertNewExpiry(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono hover:bg-slate-700"
                >
                  +1 Year
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(recertCertifiedDate);
                    d.setFullYear(d.getFullYear() + 2);
                    setRecertNewExpiry(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 rounded bg-indigo-900/40 text-indigo-300 font-mono border border-indigo-700 hover:bg-indigo-800/50"
                >
                  +2 Years (Standard)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setRecertModalOpen(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 cursor-pointer">
                Cancel
              </button>
              <button onClick={handleExecuteRecertification} className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow cursor-pointer">
                Validate & Seal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                                */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">
                Confirm Deletion
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete {deleteTarget.type === 'staff' ? 'staff record' : 'qualification'}{' '}
              <strong className="text-white">"{deleteTarget.title}"</strong>?
              {deleteTarget.type === 'staff' && ' This will remove all associated competency records for this employee.'}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteTarget.type === 'staff') {
                    deleteStaffTrainingRecord(deleteTarget.staffId);
                  } else if (deleteTarget.type === 'course' && deleteTarget.courseId) {
                    deleteStaffCourse(deleteTarget.staffId, deleteTarget.courseId);
                  }
                  setDeleteTarget(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EXPORT OFFICIAL TRAINING MATRIX COMPLIANCE REPORT                  */}
      {/* ========================================================================= */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto print:p-0 print:shadow-none print:max-h-none">
            {/* Print Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  MARSA ALAM INTERNATIONAL AIRPORT (RMF / HEMA)
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  STAFF TRAINING & COMPETENCY COMPLIANCE MATRIX REPORT
                </h2>
                <div className="text-xs text-slate-600 mt-0.5">
                  Standard: IATA ISAGO ORM 3.1 & IGOM Turnaround Training · Generated on {new Date().toISOString().substring(0, 10)}
                </div>
              </div>

              <div className="flex items-center gap-2 no-print">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Compliance Summary Statistics */}
            <div className="grid grid-cols-4 gap-3 text-center bg-slate-100 p-3 rounded-lg text-xs font-semibold">
              <div>
                <span className="text-slate-500 block text-[10px]">TOTAL STAFF</span>
                <span className="text-base font-mono font-bold text-slate-900">{stats.totalStaff}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">QUALIFICATIONS</span>
                <span className="text-base font-mono font-bold text-slate-900">{stats.totalCourses}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">COMPLIANCE RATE</span>
                <span className="text-base font-mono font-bold text-emerald-700">{stats.complianceRate}%</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">EXPIRED (GROUNDED)</span>
                <span className="text-base font-mono font-bold text-red-600">{stats.expiredCount}</span>
              </div>
            </div>

            {/* Staff Compliance Table */}
            <div className="space-y-4">
              <table className="w-full text-left text-xs border border-slate-300 divide-y divide-slate-300">
                <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-700">
                  <tr>
                    <th className="p-2 border-r border-slate-300">Badge</th>
                    <th className="p-2 border-r border-slate-300">Staff Member & Role</th>
                    <th className="p-2 border-r border-slate-300">Department</th>
                    <th className="p-2">Qualifications & Expiry Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {trainingRecords.map((st) => (
                    <tr key={st.id} className="align-top">
                      <td className="p-2 font-mono font-bold border-r border-slate-200 text-slate-900">
                        {st.badgeNumber}
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <div className="font-bold text-slate-900">{st.name}</div>
                        <div className="text-[11px] text-slate-500">{st.roleTitle}</div>
                      </td>
                      <td className="p-2 border-r border-slate-200 text-slate-700 text-[11px]">
                        {st.department}
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          {st.courses.map((c) => (
                            <div key={c.courseId} className="flex items-center justify-between text-[11px]">
                              <span><strong>{c.courseId}</strong>: {c.courseName}</span>
                              <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                c.status === 'valid' ? 'text-emerald-700 bg-emerald-50' : c.status === 'expiring' ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'
                              }`}>
                                Exp: {c.expiryDate} ({c.status.toUpperCase()})
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signatures Block */}
            <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs text-slate-800">
              <div className="border-t border-slate-400 pt-2 text-center space-y-1">
                <div className="font-bold">Capt. Mohamed Galal</div>
                <div className="text-slate-500 text-[10px]">Head of Training & Flight Crew Standards</div>
                <div className="font-mono text-[9px] text-slate-400">Date: {new Date().toISOString().substring(0, 10)}</div>
              </div>

              <div className="border-t border-slate-400 pt-2 text-center space-y-1">
                <div className="font-bold">Dr. Khaled Fawzy</div>
                <div className="text-slate-500 text-[10px]">Safety & Quality Manager (SQM)</div>
                <div className="font-mono text-[9px] text-slate-400">Station Conformance Seal: RMF-SQMS-VERIFIED</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
