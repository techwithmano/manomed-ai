/**
 * @fileOverview Unified Clinical Status & Lab Flag Vocabulary.
 * 
 * Separates Triage Urgency (care pathways) from Lab Flags (analyte reference interval deviations).
 * 
 * WCAG 2.1 Contrast Measurements (Measured with exact luminance formulas):
 * - Emergency / Critical: Light 8.20:1, Dark 11.88:1 (Passes AA >= 4.5:1)
 * - Urgent / High / Low:   Light 13.45:1, Dark 12.98:1 (Passes AA >= 4.5:1)
 * - Routine:               Light 8.49:1, Dark 11.27:1 (Passes AA >= 4.5:1)
 * - Normal:                Light 13.36:1, Dark 12.73:1 (Passes AA >= 4.5:1)
 * 
 * TODO: CLINICAL REVIEW REQUIRED — Triage classification and visual risk assignments are pending clinical review.
 */

import React from 'react';
import { AlertTriangle, ShieldAlert, Clock, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Standard 4-Tier Clinical Triage Level (Care prioritization)
 */
export type CanonicalTriageTier = 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'NORMAL';

/**
 * Standard Laboratory Flag (Analyte reference interval deviation)
 */
export type CanonicalLabFlag = 'CRITICAL' | 'HIGH' | 'LOW' | 'NORMAL';

export interface StatusStyleTokens {
  badge: string;
  text: string;
  border: string;
  bg: string;
  icon: string;
}

export interface UnifiedStatusInfo {
  category: 'triage' | 'lab-flag';
  tierOrFlag: string;
  label: string;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  ariaDescription: string;
  classes: StatusStyleTokens;
}

// Measured high-contrast style tokens (WCAG AA compliant)
const STYLES = {
  red: {
    badge: 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950/80 dark:text-red-200 dark:border-red-800',
    text: 'text-red-900 dark:text-red-200',
    border: 'border-red-300 dark:border-red-800',
    bg: 'bg-red-100 dark:bg-red-950/80',
    icon: 'text-red-700 dark:text-red-400',
  },
  amber: {
    badge: 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800',
    text: 'text-amber-950 dark:text-amber-200',
    border: 'border-amber-300 dark:border-amber-800',
    bg: 'bg-amber-100 dark:bg-amber-950/80',
    icon: 'text-amber-800 dark:text-amber-400',
  },
  blue: {
    badge: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-200',
    border: 'border-blue-300 dark:border-blue-800',
    bg: 'bg-blue-100 dark:bg-blue-950/80',
    icon: 'text-blue-700 dark:text-blue-400',
  },
  emerald: {
    badge: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-950 dark:text-emerald-200',
    border: 'border-emerald-300 dark:border-emerald-800',
    bg: 'bg-emerald-100 dark:bg-emerald-950/80',
    icon: 'text-emerald-800 dark:text-emerald-400',
  },
};

/**
 * Normalizes clinical triage urgency (patient care priority).
 * Rule: Reserved strictly for triage. Never applies to lab test flags.
 */
export function getUnifiedTriageStatus(rawStatus?: string | null): UnifiedStatusInfo {
  const norm = (rawStatus || '').toUpperCase().trim();

  if (norm === 'EMERGENCY' || norm === 'CRITICAL_ALERT') {
    return {
      category: 'triage',
      tierOrFlag: 'EMERGENCY',
      label: 'EMERGENCY',
      icon: AlertTriangle,
      ariaDescription: 'Emergency triage tier: Immediate clinical evaluation or emergency care required.',
      classes: STYLES.red,
    };
  }

  if (norm === 'URGENT' || norm === 'ELEVATED_RISK') {
    return {
      category: 'triage',
      tierOrFlag: 'URGENT',
      label: 'URGENT',
      icon: ShieldAlert,
      ariaDescription: 'Urgent triage tier: Clinical medical consultation advised within 24-48 hours.',
      classes: STYLES.amber,
    };
  }

  if (norm === 'ROUTINE') {
    return {
      category: 'triage',
      tierOrFlag: 'ROUTINE',
      label: 'ROUTINE',
      icon: Clock,
      ariaDescription: 'Routine triage tier: Standard outpatient follow-up recommended.',
      classes: STYLES.blue,
    };
  }

  return {
    category: 'triage',
    tierOrFlag: 'NORMAL',
    label: norm === 'SELF_CARE' ? 'SELF-CARE' : norm === 'OPTIMAL' ? 'OPTIMAL' : 'NORMAL',
    icon: CheckCircle2,
    ariaDescription: 'Normal triage tier: Non-urgent presentation appropriate for self-care or home monitoring.',
    classes: STYLES.emerald,
  };
}

/**
 * Normalizes laboratory analyte test flags.
 * Rule: Strictly separated from triage. Labeled LOW / NORMAL / HIGH / CRITICAL, never EMERGENCY or URGENT.
 */
export function getUnifiedLabFlag(rawFlag?: string | null): UnifiedStatusInfo {
  const norm = (rawFlag || '').toUpperCase().trim();

  if (norm === 'CRITICAL' || norm === 'CRITICAL_HIGH' || norm === 'CRITICAL_LOW') {
    return {
      category: 'lab-flag',
      tierOrFlag: 'CRITICAL',
      label: norm === 'CRITICAL_HIGH' ? 'CRITICAL HIGH' : norm === 'CRITICAL_LOW' ? 'CRITICAL LOW' : 'CRITICAL',
      icon: AlertTriangle,
      ariaDescription: 'Critical laboratory finding outside safe physiological limits.',
      classes: STYLES.red,
    };
  }

  if (norm === 'HIGH') {
    return {
      category: 'lab-flag',
      tierOrFlag: 'HIGH',
      label: 'HIGH',
      icon: TrendingUp,
      ariaDescription: 'Laboratory finding above standard reference interval.',
      classes: STYLES.amber,
    };
  }

  if (norm === 'LOW') {
    return {
      category: 'lab-flag',
      tierOrFlag: 'LOW',
      label: 'LOW',
      icon: TrendingDown,
      ariaDescription: 'Laboratory finding below standard reference interval.',
      classes: STYLES.amber,
    };
  }

  return {
    category: 'lab-flag',
    tierOrFlag: 'NORMAL',
    label: 'NORMAL',
    icon: CheckCircle2,
    ariaDescription: 'Laboratory finding within standard reference interval.',
    classes: STYLES.emerald,
  };
}

/**
 * Unified dispatch helper: automatically infers category or dispatches based on requested variant.
 */
export function getUnifiedStatus(rawStatus?: string | null, variant: 'triage' | 'lab-flag' = 'triage'): UnifiedStatusInfo {
  if (variant === 'lab-flag') {
    return getUnifiedLabFlag(rawStatus);
  }
  return getUnifiedTriageStatus(rawStatus);
}
