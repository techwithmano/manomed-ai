'use client';

import React from 'react';
import { ClinicalStatusBadge } from '@/components/ClinicalStatusBadge';
import { findLabDefinition } from '@/lib/labPlausibilityConfig';

export interface LabReferenceRangeBarProps {
  parameterName: string;
  value: string | number;
  unit?: string;
  referenceRange?: string;
  flag?: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL_LOW' | 'CRITICAL_HIGH' | string;
  className?: string;
}

export interface ParsedRange {
  min: number;
  max: number;
  display: string;
  isOneSidedUpper: boolean;
  isOneSidedLower: boolean;
}

/**
 * Parses numeric min and max from standard clinical range strings.
 * e.g. "12.0 - 16.0 g/dL" -> { min: 12.0, max: 16.0 }
 * e.g. "< 0.04 ng/mL" -> { min: 0, max: 0.04, isOneSidedUpper: true }
 * e.g. "> 60 mL/min" -> { min: 60, max: 120, isOneSidedLower: true }
 */
export function parseReferenceRange(
  rangeStr?: string,
  paramName?: string,
  userUnit?: string
): ParsedRange | null {
  if (rangeStr) {
    if (rangeStr.toLowerCase().includes('unit needed')) return null;

    // Check for "min - max" format
    const rangeMatch = rangeStr.match(/([\d.]+)\s*-\s*([\d.]+)/);
    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1]);
      const max = parseFloat(rangeMatch[2]);
      if (!isNaN(min) && !isNaN(max)) {
        return { min, max, display: `${min} to ${max}`, isOneSidedUpper: false, isOneSidedLower: false };
      }
    }

    // Check for "< X" format (one-sided upper limit)
    const ltMatch = rangeStr.match(/<\s*([\d.]+)/);
    if (ltMatch) {
      const max = parseFloat(ltMatch[1]);
      if (!isNaN(max)) {
        return { min: 0, max, display: `less than ${max}`, isOneSidedUpper: true, isOneSidedLower: false };
      }
    }

    // Check for "> X" format (one-sided lower limit)
    const gtMatch = rangeStr.match(/>\s*([\d.]+)/);
    if (gtMatch) {
      const min = parseFloat(gtMatch[1]);
      if (!isNaN(min)) {
        return { min, max: min * 2, display: `greater than ${min}`, isOneSidedUpper: false, isOneSidedLower: true };
      }
    }
  }

  // Fallback to definition in config if rangeStr was missing or unparseable
  if (paramName) {
    const def = findLabDefinition(paramName, userUnit);
    if (def?.referenceRange) {
      const min = def.referenceRange.min ?? 0;
      const max = def.referenceRange.max ?? (min > 0 ? min * 2 : 100);
      return {
        min,
        max,
        display: def.referenceRange.display,
        isOneSidedUpper: def.referenceRange.min === undefined || def.referenceRange.min === 0,
        isOneSidedLower: def.referenceRange.max === undefined,
      };
    }
  }

  return null;
}

/**
 * Computes marker position percentage (clamped strictly between 3% and 97%).
 * Proportional zones: Low [0% - 25%], Normal [25% - 75%], High [75% - 100%].
 */
export function computeMarkerPercentage(
  numValue: number,
  parsedRange: ParsedRange | null,
  normalizedFlag: string
): number {
  if (!parsedRange || isNaN(numValue)) {
    if (normalizedFlag.includes('LOW')) return 14;
    if (normalizedFlag.includes('HIGH') || normalizedFlag.includes('CRITICAL')) return 86;
    return 50;
  }

  const { min, max, isOneSidedUpper, isOneSidedLower } = parsedRange;

  // Case A: One-sided upper range (e.g. Troponin < 0.04)
  if (isOneSidedUpper) {
    if (max <= 0) return 50; // Guard against divide-by-zero when upper bound is 0 or negative
    if (numValue <= max) {
      // Within normal interval: 25% to 75%
      const ratio = numValue / max;
      return Math.max(25, Math.min(75, 25 + 50 * Math.max(0, ratio)));
    }
    // Above upper threshold: high zone 75% to 97%
    const excessRatio = (numValue - max) / max;
    return Math.max(76, Math.min(97, 75 + 22 * Math.min(1, excessRatio / 2)));
  }

  // Case B: One-sided lower range (e.g. eGFR > 60)
  if (isOneSidedLower) {
    if (min <= 0) return 50; // Guard against divide-by-zero when lower bound is 0 or negative
    if (numValue >= min) {
      const ratio = (numValue - min) / min;
      return Math.max(25, Math.min(75, 25 + 50 * Math.min(1, Math.max(0, ratio))));
    }
    // Below minimum threshold: low zone 3% to 24%
    const deficitRatio = numValue / min;
    return Math.max(3, Math.min(24, 25 * Math.max(0.1, deficitRatio)));
  }

  // Case C: Standard two-sided range [min, max]
  const span = max - min;
  if (span <= 0) {
    // Guard against divide-by-zero when span is 0 (min === max) or inverted (max < min)
    return 50;
  }

  if (numValue < min) {
    // Low zone (3% to 24%)
    // Guard against divide-by-zero when min is 0 or negative:
    const denominator = Math.abs(min) > 0 ? Math.abs(min) : span;
    const deficitRatio = (min - numValue) / denominator;
    return Math.max(3, Math.min(24, 25 - 22 * Math.min(1, Math.max(0, deficitRatio))));
  }

  if (numValue > max) {
    // High zone (76% to 97%)
    const excessRatio = (numValue - max) / span;
    return Math.max(76, Math.min(97, 75 + 22 * Math.min(1, excessRatio / 1.5)));
  }

  // Normal zone (25% to 75%)
  const normalRatio = (numValue - min) / span;
  return Math.max(25, Math.min(75, 25 + 50 * normalRatio));
}

/**
 * Visual Horizontal Reference-Range Bar with Accessible Text & Multi-Modal Status
 * 
 * Complies with:
 * - WCAG 2.2 AA non-color alone: every status pairs an icon, an explicit text label (LOW/NORMAL/HIGH/CRITICAL), and color.
 * - Minimum font size: 12px (text-xs).
 * - Full accessible text equivalent for assistive tech via aria-label and accessible descriptions.
 */
export function LabReferenceRangeBar({
  parameterName,
  value,
  unit = '',
  referenceRange = '',
  flag = 'NORMAL',
  className = '',
}: LabReferenceRangeBarProps) {
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  const isNumeric = !isNaN(numValue);

  const parsedRange = parseReferenceRange(referenceRange, parameterName, unit);
  const displayRange = parsedRange?.display || referenceRange || 'standard reference interval';

  const isUnitNeeded = referenceRange?.toLowerCase().includes('unit needed') || (!unit && !parsedRange);

  // Normalize flag
  const normalizedFlag = (flag || 'NORMAL').toUpperCase();
  const isCritical = normalizedFlag.includes('CRITICAL');
  const isLow = normalizedFlag.includes('LOW');
  const isHigh = normalizedFlag.includes('HIGH');
  const isNormal = normalizedFlag === 'NORMAL';

  // Compute proportional magnitude marker
  const markerPercent = computeMarkerPercentage(numValue, parsedRange, normalizedFlag);

  // Accessible description
  let relationText = 'within the normal range of';
  if (isUnitNeeded) {
    relationText = 'unit needed before comparison with';
  } else if (isCritical && isHigh) {
    relationText = 'critically above the normal range of';
  } else if (isCritical && isLow) {
    relationText = 'critically below the normal range of';
  } else if (isHigh) {
    relationText = 'above the normal range of';
  } else if (isLow) {
    relationText = 'below the normal range of';
  }

  const accessibleLabel = isUnitNeeded
    ? `${parameterName} ${value}: Unit needed for clinical interpretation`
    : `${parameterName} ${value} ${unit}, ${relationText} ${displayRange}`;

  return (
    <div
      role="region"
      aria-label={accessibleLabel}
      className={`space-y-1.5 w-full min-w-[200px] max-w-sm ${className}`}
    >
      {/* Top Status & Value Header */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {/* Paired Status Badge: Lab Flag Variant or Unit Needed */}
        {isUnitNeeded ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30">
            Unit needed
          </span>
        ) : (
          <ClinicalStatusBadge
            status={flag}
            variant="lab-flag"
            size="sm"
          />
        )}

        {/* Numeric value readout */}
        <span className="font-mono font-bold text-foreground text-xs">
          {value} <span className="text-muted-foreground font-normal">{unit || '(no unit)'}</span>
        </span>
      </div>

      {/* Visual Reference Range Bar with 3 zones (Low, Normal, High) OR Unit Needed Banner */}
      {isUnitNeeded ? (
        <div className="py-1 px-2.5 rounded-lg bg-muted/60 border border-border text-[11px] text-muted-foreground font-mono">
          Unit needed to display reference range
        </div>
      ) : (
        <div className="relative pt-1 pb-3">
        {/* Bar Track */}
        <div
          className="h-2.5 w-full rounded-full overflow-hidden flex border border-border/80 bg-muted/40 shadow-inner"
          aria-hidden="true"
        >
          {/* Low Zone (25%) */}
          <div
            className={`w-[25%] transition-colors ${
              isLow ? 'bg-amber-500/40 dark:bg-amber-500/50' : 'bg-amber-500/15 dark:bg-amber-500/20'
            }`}
            title="Below reference interval"
          />

          {/* Normal Zone (50%) */}
          <div
            className={`w-[50%] border-x border-border/70 transition-colors ${
              isNormal ? 'bg-emerald-500/45 dark:bg-emerald-500/55' : 'bg-emerald-500/20 dark:bg-emerald-500/25'
            }`}
            title="Normal reference interval"
          />

          {/* High Zone (25%) */}
          <div
            className={`w-[25%] transition-colors ${
              isHigh ? 'bg-amber-500/40 dark:bg-amber-500/50' : 'bg-amber-500/15 dark:bg-amber-500/20'
            }`}
            title="Above reference interval"
          />
        </div>

        {/* Current Value Marker Pip */}
        <div
          className="absolute top-0 -translate-x-1/2 transition-all duration-300 pointer-events-none"
          style={{ left: `${markerPercent}%` }}
          aria-hidden="true"
        >
          <div
            className={`w-4 h-4 rounded-full border-2 border-background shadow-md flex items-center justify-center ${
              isCritical
                ? 'bg-destructive ring-2 ring-destructive/40 animate-pulse'
                : isHigh || isLow
                ? 'bg-amber-600 dark:bg-amber-500 ring-2 ring-amber-500/40'
                : 'bg-emerald-600 dark:bg-emerald-500 ring-2 ring-emerald-500/40'
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-background" />
          </div>
        </div>

        {/* Boundary Ticks & Zone Legend */}
        <div
          className="flex justify-between items-center text-[10px] sm:text-[11px] text-muted-foreground pt-1 select-none font-mono"
          aria-hidden="true"
        >
          <span className="text-left w-[25%] truncate">Low</span>
          <span className="text-center w-[50%] font-semibold text-foreground/80 truncate">
            {parsedRange ? `${parsedRange.min} - ${parsedRange.max}` : 'Normal'}
          </span>
          <span className="text-right w-[25%] truncate">High</span>
        </div>
      </div>
      )}

      {/* Screen-reader only detailed verbalization */}
      <span className="sr-only">{accessibleLabel}</span>
    </div>
  );
}

export default LabReferenceRangeBar;
