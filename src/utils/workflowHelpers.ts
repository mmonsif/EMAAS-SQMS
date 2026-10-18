import { InvestigationLevel, ReportLifecycleStatus, StationRole, RiskAssessment, RiskLevel, Language } from '../types/index.ts';

/**
 * Returns mandated closure window in calendar days based on Investigation Level:
 * - Level 1 (Major): 30 days
 * - Level 2 (Minor): 60 days
 * - Level 3 (Observation): 90 days
 */
export function getLevelDays(level?: InvestigationLevel): number {
  switch (level) {
    case 'level_1':
      return 30;
    case 'level_2':
      return 60;
    case 'level_3':
      return 90;
    default:
      return 30;
  }
}

/**
 * Calculates target closure date given assignment date string (YYYY-MM-DD) and level.
 */
export function calculateTargetClosureDate(assignedDateStr: string, level: InvestigationLevel): string {
  const d = new Date(assignedDateStr);
  const days = getLevelDays(level);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Returns localized level information
 */
export function getLevelMetadata(level?: InvestigationLevel, language: Language = 'en') {
  switch (level) {
    case 'level_1':
      return {
        levelCode: 'Level 1',
        title: language === 'ar' ? 'مستوى ١ - جسيم (Major)' : 'Major – Level 1',
        days: 30,
        timelineDesc: language === 'ar' ? 'إغلاق إلزامي خلال ٣٠ يوماً' : 'Mandatory closure within 30 days',
        badgeClass: 'bg-red-500/20 text-red-400 border border-red-500/40',
        dotClass: 'bg-red-500'
      };
    case 'level_2':
      return {
        levelCode: 'Level 2',
        title: language === 'ar' ? 'مستوى ٢ - طفيف (Minor)' : 'Minor – Level 2',
        days: 60,
        timelineDesc: language === 'ar' ? 'إغلاق إلزامي خلال ٦٠ يوماً' : 'Mandatory closure within 60 days',
        badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
        dotClass: 'bg-amber-500'
      };
    case 'level_3':
      return {
        levelCode: 'Level 3',
        title: language === 'ar' ? 'مستوى ٣ - ملاحظة (Observation)' : 'Observation – Level 3',
        days: 90,
        timelineDesc: language === 'ar' ? 'إغلاق إلزامي خلال ٩٠ يوماً' : 'Mandatory closure within 90 days',
        badgeClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
        dotClass: 'bg-blue-500'
      };
    default:
      return {
        levelCode: 'Unclassified',
        title: language === 'ar' ? 'بانتظار تصنيف المستوى' : 'Pending Classification',
        days: 0,
        timelineDesc: language === 'ar' ? 'يتطلب تصنيف مدير السلامة والجودة (SQM)' : 'Requires SQM Level Determination',
        badgeClass: 'bg-slate-800 text-slate-400 border border-slate-700',
        dotClass: 'bg-slate-600'
      };
  }
}

/**
 * Overdue calculation based on overall case Target Closure Date (as mandated)
 */
export function getOverdueCalculation(targetClosureDate?: string, isClosed: boolean = false) {
  if (!targetClosureDate || isClosed) {
    return {
      isOverdue: false,
      isApproaching: false,
      daysRemaining: null,
      daysOverdue: 0,
      statusText: isClosed ? 'Case Closed' : 'No Target Date',
      badgeClass: 'bg-slate-800 text-slate-400 border border-slate-700',
      pillClass: 'text-slate-400'
    };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const target = new Date(targetClosureDate);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - now.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) {
    const overdue = Math.abs(days);
    return {
      isOverdue: true,
      isApproaching: false,
      daysRemaining: days,
      daysOverdue: overdue,
      statusText: `${overdue}d OVERDUE`,
      badgeClass: 'bg-red-600/20 text-red-400 border border-red-500/50 animate-pulse font-bold',
      pillClass: 'text-red-400 font-bold'
    };
  } else if (days <= 7) {
    return {
      isOverdue: false,
      isApproaching: true,
      daysRemaining: days,
      daysOverdue: 0,
      statusText: days === 0 ? 'DUE TODAY' : `${days}d Left (Due Soon)`,
      badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold',
      pillClass: 'text-amber-300 font-bold'
    };
  } else {
    return {
      isOverdue: false,
      isApproaching: false,
      daysRemaining: days,
      daysOverdue: 0,
      statusText: `${days}d remaining`,
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      pillClass: 'text-emerald-400'
    };
  }
}

/**
 * Returns metadata for the 10-step lifecycle statuses
 */
export function getStatusMetadata(status: ReportLifecycleStatus, language: Language = 'en') {
  switch (status) {
    case 'submitted':
      return {
        stepNumber: 1,
        label: language === 'ar' ? 'مقدم (بانتظار التأكيد)' : '1. Submitted (Pending Ack)',
        shortLabel: language === 'ar' ? 'مقدم' : 'Submitted',
        colorClass: 'bg-slate-500/20 text-slate-300 border border-slate-600/40',
        responsible: language === 'ar' ? 'قسم السلامة والجودة (S&Q)' : 'Safety Officer / S&Q'
      };
    case 'acknowledged':
      return {
        stepNumber: 2,
        label: language === 'ar' ? 'تم استلامه وتأكيده' : '2. Acknowledged',
        shortLabel: language === 'ar' ? 'مؤكد' : 'Acknowledged',
        colorClass: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
        responsible: language === 'ar' ? 'مدير السلامة والجودة (SQM)' : 'Safety & Quality Manager (SQM)'
      };
    case 'level_assigned':
      return {
        stepNumber: 3,
        label: language === 'ar' ? 'تم تحديد المستوى والتاريخ المستهدف' : '3. Level Assigned',
        shortLabel: language === 'ar' ? 'تم التصنيف' : 'Level Assigned',
        colorClass: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40',
        responsible: language === 'ar' ? 'محقق السلامة (S&Q)' : 'Safety Officer / S&Q Investigator'
      };
    case 'under_investigation':
      return {
        stepNumber: 4,
        label: language === 'ar' ? 'قيد التحقيق وتحديد الإجراءات' : '4. Under Investigation',
        shortLabel: language === 'ar' ? 'قيد التحقيق' : 'Investigating',
        colorClass: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
        responsible: language === 'ar' ? 'محقق السلامة (S&Q)' : 'Safety Officer / S&Q'
      };
    case 'plan_pending':
      return {
        stepNumber: 5,
        label: language === 'ar' ? 'بانتظار خطة الـ CAPA من مدير القسم' : '5. CAPA Plan Pending (HoD)',
        shortLabel: language === 'ar' ? 'بانتظار الخطة' : 'CAPA Pending',
        colorClass: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
        responsible: language === 'ar' ? 'مدير القسم المعني (HoD)' : 'Assigned HoD'
      };
    case 'plan_under_review':
      return {
        stepNumber: 6,
        label: language === 'ar' ? 'الخطة قيد مراجعة مدير السلامة' : '6. Plan Under Review (SQM)',
        shortLabel: language === 'ar' ? 'قيد مراجعة الخطة' : 'Plan Review',
        colorClass: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
        responsible: language === 'ar' ? 'مدير السلامة والجودة (SQM)' : 'Safety & Quality Manager (SQM)'
      };
    case 'plan_returned':
      return {
        stepNumber: 6,
        label: language === 'ar' ? 'خطة معادة للتعديل بملاحظات' : '6b. Plan Returned for Revision',
        shortLabel: language === 'ar' ? 'معادة للتعديل' : 'Plan Returned',
        colorClass: 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse',
        responsible: language === 'ar' ? 'مدير القسم المعني (HoD)' : 'Assigned HoD'
      };
    case 'plan_approved':
    case 'effectiveness_pending':
      return {
        stepNumber: 7,
        label: language === 'ar' ? 'معتمدة / بانتظار قياس الفعالية' : '7. Effectiveness Evaluation Pending',
        shortLabel: language === 'ar' ? 'قياس الفعالية' : 'Effectiveness Pending',
        colorClass: 'bg-teal-500/20 text-teal-300 border border-teal-500/40',
        responsible: language === 'ar' ? 'قسم السلامة والجودة (S&Q)' : 'Safety & Quality (S&Q)'
      };
    case 'pending_signoff':
      return {
        stepNumber: 8,
        label: language === 'ar' ? 'بانتظار التوقيع النهائي والإغلاق' : '8. Pending Final SQM Sign-off',
        shortLabel: language === 'ar' ? 'بانتظار الإغلاق' : 'Pending Sign-off',
        colorClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold',
        responsible: language === 'ar' ? 'مدير السلامة والجودة (SQM)' : 'Safety & Quality Manager (SQM)'
      };
    case 'closed':
      return {
        stepNumber: 9,
        label: language === 'ar' ? 'مغلق وموقع رسمياً' : 'Case Closed & Signed Off',
        shortLabel: language === 'ar' ? 'مغلق وموقع' : 'Closed',
        colorClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
        responsible: language === 'ar' ? 'مكتمل' : 'Completed'
      };
    default:
      return {
        stepNumber: 1,
        label: status,
        shortLabel: status,
        colorClass: 'bg-slate-800 text-slate-400',
        responsible: 'N/A'
      };
  }
}

/**
 * Calculates Risk Index (Probability × Severity)
 */
export function calculateRiskIndex(severity: number, likelihood: string): { score: string; level: RiskLevel; colorClass: string; label: string } {
  const score = `${severity}${likelihood}`;
  // Critical (Red): 5A, 5B, 4A, 4B, 5C
  if (severity >= 4 && (likelihood === 'A' || likelihood === 'B' || likelihood === 'C')) {
    return { score, level: 'Critical', colorClass: 'bg-red-500/20 text-red-400 border border-red-500/40', label: 'Critical Risk' };
  }
  // High (Amber-Red): 3A, 3B, 4D, 5D
  if ((severity === 3 && (likelihood === 'A' || likelihood === 'B')) || (severity >= 4 && likelihood === 'D') || (severity === 5 && likelihood === 'E')) {
    return { score, level: 'High', colorClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40', label: 'High Risk' };
  }
  // Medium (Yellow): 2A, 2B, 3C, 3D, 4E
  if ((severity === 2 && (likelihood === 'A' || likelihood === 'B')) || (severity === 3 && (likelihood === 'C' || likelihood === 'D')) || (severity === 4 && likelihood === 'E')) {
    return { score, level: 'Medium', colorClass: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40', label: 'Medium Risk' };
  }
  // Low (Green)
  return { score, level: 'Low', colorClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40', label: 'Low Risk' };
}

/**
 * Role authorization check for each step in the 8-step workflow
 */
export function canUserPerformStep(
  step: 'acknowledge' | 'level' | 'investigate' | 'submit_capa' | 'review_capa' | 'effectiveness' | 'final_signoff',
  role: StationRole,
  reportDepartment?: string
): boolean {
  // Admin and AE/GHM have supervisor override
  if (role === 'ae' || role === 'ghm') return true;

  switch (step) {
    case 'acknowledge':
      // Safety Officer or any S&Q member or SQM
      return role === 'safety_officer' || role === 'hod_safety';

    case 'level':
      // Safety & Quality Manager (SQM) ONLY (or admin)
      return role === 'hod_safety';

    case 'investigate':
      // S&Q / Safety Officer
      return role === 'safety_officer' || role === 'hod_safety';

    case 'submit_capa':
      // Assigned Head of Department (HoD Ops, Maint, Training) or supervisor
      return role === 'hod_ops' || role === 'hod_maint' || role === 'hod_training' || role === 'ramp_supervisor' || role === 'sdm';

    case 'review_capa':
      // SQM Only
      return role === 'hod_safety';

    case 'effectiveness':
      // S&Q Member / Safety Officer
      return role === 'safety_officer' || role === 'hod_safety';

    case 'final_signoff':
      // SQM Only
      return role === 'hod_safety';

    default:
      return false;
  }
}
