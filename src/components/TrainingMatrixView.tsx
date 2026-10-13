import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../i18n/translations.ts';
import { StaffTrainingRecord, StaffCourse } from '../types/index.ts';
import { 
  GraduationCap, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  X, 
  FileCheck
} from 'lucide-react';

export const TrainingMatrixView: React.FC = () => {
  const { language, trainingRecords, recertifyStaffCourse } = useApp();
  const t = translations[language];

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [recertModalOpen, setRecertModalOpen] = useState(false);
  const [activeStaff, setActiveStaff] = useState<StaffTrainingRecord | null>(null);
  const [activeCourse, setActiveCourse] = useState<StaffCourse | null>(null);
  const [newExpiry, setNewExpiry] = useState('2028-10-15');

  const openRecertModal = (staff: StaffTrainingRecord, course: StaffCourse) => {
    setActiveStaff(staff);
    setActiveCourse(course);
    setNewExpiry('2028-10-15');
    setRecertModalOpen(true);
  };

  const handleRecertify = () => {
    if (activeStaff && activeCourse) {
      recertifyStaffCourse(activeStaff.id, activeCourse.courseId, newExpiry);
      setRecertModalOpen(false);
    }
  };

  const getStatusBadge = (status: 'valid' | 'expiring' | 'expired') => {
    switch (status) {
      case 'valid':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Valid</span>;
      case 'expiring':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Expiring (&lt; 30d)</span>;
      case 'expired':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Expired</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-400" />
            <span>{t.training.title}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.training.subtitle}
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Qualifications</option>
            <option value="valid">Valid & Current</option>
            <option value="expiring">Expiring Soon</option>
            <option value="expired">Expired Recertifications</option>
          </select>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-5">
        <div className="space-y-4">
          {trainingRecords.map((staff) => (
            <div key={staff.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{staff.name}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-900/40 text-blue-300">
                      Badge: {staff.badgeNumber}
                    </span>
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    {staff.roleTitle} · {staff.department}
                  </div>
                </div>
              </div>

              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {staff.courses.map((course) => {
                  if (filterStatus !== 'all' && course.status !== filterStatus) return null;

                  return (
                    <div
                      key={course.courseId}
                      className={`p-3 rounded-xl border text-xs flex flex-col justify-between space-y-2.5 ${
                        course.status === 'expired'
                          ? 'bg-red-950/20 border-red-800/60'
                          : course.status === 'expiring'
                            ? 'bg-amber-950/20 border-amber-800/60'
                            : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[10px] text-slate-500 font-bold">{course.courseId}</span>
                          {getStatusBadge(course.status)}
                        </div>
                        <h4 className="font-semibold text-white leading-tight">
                          {course.courseName}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                        <span>Exp: {course.expiryDate}</span>
                        <button
                          onClick={() => openRecertModal(staff, course)}
                          className="px-2 py-0.5 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-[10px] font-bold transition-colors"
                        >
                          Recertify
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recertify Modal */}
      {recertModalOpen && activeStaff && activeCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Log Recertification
              </h3>
              <button onClick={() => setRecertModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <p className="text-slate-300">
                Staff: <strong>{activeStaff.name}</strong> ({activeStaff.badgeNumber})
              </p>
              <p className="text-slate-300">
                Course: <strong>{activeCourse.courseName}</strong>
              </p>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">New Certification Expiry Date</label>
                <input
                  type="date"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setRecertModalOpen(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300">
                Cancel
              </button>
              <button onClick={handleRecertify} className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow">
                Save & Validate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
