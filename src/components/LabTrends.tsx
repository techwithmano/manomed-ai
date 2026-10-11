'use client';

import React from 'react';
import { SavedLabSummary } from '@/lib/assessment-store';
import { parseReferenceRange } from '@/components/LabReferenceRangeBar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Info, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

export interface LabTrendsProps {
  labHistory: SavedLabSummary[];
  className?: string;
}

interface AnalyteDataPoint {
  date: string;
  timestamp: number;
  value: number;
  unit: string;
  referenceRange?: string;
  panelId: string;
}

interface AnalyteSeries {
  analyteName: string;
  unit: string;
  dataPoints: AnalyteDataPoint[];
  referenceRange?: string;
}

/**
 * Evaluates directional movement relative to reference interval boundaries.
 * 
 * TODO: CLINICAL REVIEW REQUIRED — Trend classification semantics and boundaries require clinical review.
 * 
 * Strictly uses neutral clinical wording:
 * - "Moved toward the reference range"
 * - "Moved away from the reference range"
 * - "Stayed within the reference range"
 * (Never uses value-laden terms like "improving", "worsening", or "dangerous").
 */
export function classifyTrendMovement(
  currentVal: number,
  prevVal: number,
  refRangeStr?: string
): string {
  if (currentVal === prevVal) {
    return 'No change';
  }

  const parsed = parseReferenceRange(refRangeStr);
  if (!parsed) {
    return currentVal > prevVal ? 'Value increased' : 'Value decreased';
  }

  const { min, max, isOneSidedUpper, isOneSidedLower } = parsed;

  const wasInside = isOneSidedUpper
    ? prevVal <= max
    : isOneSidedLower
    ? prevVal >= min
    : prevVal >= min && prevVal <= max;

  const isInside = isOneSidedUpper
    ? currentVal <= max
    : isOneSidedLower
    ? currentVal >= min
    : currentVal >= min && currentVal <= max;

  if (wasInside && isInside) {
    return 'Stayed within the reference range';
  }

  // Calculate distance from normal range
  const getDistance = (val: number): number => {
    if (isOneSidedUpper) return val > max ? val - max : 0;
    if (isOneSidedLower) return val < min ? min - val : 0;
    if (val < min) return min - val;
    if (val > max) return val - max;
    return 0;
  };

  const prevDist = getDistance(prevVal);
  const currDist = getDistance(currentVal);

  if (currDist < prevDist) {
    return 'Moved toward the reference range';
  } else if (currDist > prevDist) {
    return 'Moved away from the reference range';
  }

  return 'Stayed within the reference range';
}

/**
 * Renders an accessible SVG sparkline with a text alternative.
 */
function Sparkline({ dataPoints, analyteName }: { dataPoints: AnalyteDataPoint[]; analyteName: string }) {
  if (dataPoints.length < 2) return null;

  const values = dataPoints.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const width = 140;
  const height = 36;
  const padding = 6;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  const points = dataPoints.map((d, index) => {
    const x = padding + (index / (dataPoints.length - 1)) * usableWidth;
    const y = height - padding - ((d.value - minVal) / range) * usableHeight;
    return { x, y, value: d.value, date: d.date };
  });

  const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const accessibleText = `Trend for ${analyteName}: ${dataPoints.map((d) => `${d.value} on ${new Date(d.date).toLocaleDateString()}`).join(', ')}`;

  return (
    <div className="inline-flex items-center" title={accessibleText}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        role="img"
        aria-label={accessibleText}
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
          points={polylinePoints}
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            className="fill-background stroke-primary stroke-2"
          />
        ))}
      </svg>
      <span className="sr-only">{accessibleText}</span>
    </div>
  );
}

export function LabTrends({ labHistory, className = '' }: LabTrendsProps) {
  // Extract all tested parameters from history and group strictly by analyte + unit
  const groupedSeries = React.useMemo(() => {
    const map = new Map<string, AnalyteSeries>();

    for (const record of labHistory) {
      const params = record.data?.analyzedParameters;
      if (!params || !Array.isArray(params)) continue;
      const recordDate = record.date || new Date().toISOString();
      const panelId = record.id;

      for (const param of params) {
        const num = parseFloat(param.value);
        if (isNaN(num)) continue;

        const cleanName = param.name.trim();
        const cleanUnit = (param.unit || '').trim();
        // Strict separation: Analyte Name + Unit
        const groupKey = `${cleanName.toLowerCase()}:::${cleanUnit.toLowerCase()}`;

        if (!map.has(groupKey)) {
          map.set(groupKey, {
            analyteName: cleanName,
            unit: cleanUnit,
            referenceRange: param.referenceRange,
            dataPoints: [],
          });
        }

        map.get(groupKey)!.dataPoints.push({
          date: recordDate,
          timestamp: new Date(recordDate).getTime(),
          value: num,
          unit: cleanUnit,
          referenceRange: param.referenceRange,
          panelId,
        });
      }
    }

    // Sort data points chronologically ascending
    for (const series of map.values()) {
      series.dataPoints.sort((a, b) => a.timestamp - b.timestamp);
    }

    // Filter to series that have at least 2 readings
    return Array.from(map.values()).filter((s) => s.dataPoints.length >= 2);
  }, [labHistory]);

  // Detect analytes that appear in multiple units across different evaluations
  const multiUnitAnalytes = React.useMemo(() => {
    const nameToUnits = new Map<string, Set<string>>();
    for (const record of labHistory) {
      const params = record.data?.analyzedParameters;
      if (!params || !Array.isArray(params)) continue;
      for (const p of params) {
        const name = p.name.trim().toLowerCase();
        const unit = (p.unit || '').trim();
        if (!nameToUnits.has(name)) nameToUnits.set(name, new Set());
        if (unit) nameToUnits.get(name)!.add(unit);
      }
    }
    const detected: Array<{ analyte: string; units: string[] }> = [];
    for (const [name, units] of nameToUnits.entries()) {
      if (units.size > 1) {
        detected.push({ analyte: name, units: Array.from(units) });
      }
    }
    return detected;
  }, [labHistory]);

  if (groupedSeries.length === 0) {
    return (
      <Card className={`border-border ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Laboratory Analyte Trends
          </CardTitle>
          <CardDescription className="text-xs">
            Tracking longitudinal changes across serial blood tests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
            <p>
              To view longitudinal lab trends, at least <strong>two evaluations</strong> measuring the same analyte with the <strong>same measurement unit</strong> are required.
            </p>
            <p className="font-semibold text-foreground pt-1">
              Reference ranges shown are for adults.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-border ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Laboratory Analyte Trends
            </CardTitle>
            <CardDescription className="text-xs">
              Longitudinal tracking comparing identical analytes and measurement units.
            </CardDescription>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border">
            Reference ranges shown are for adults.
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Unit Difference Explanatory Note if applicable */}
        {multiUnitAnalytes.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <strong>Measurement Unit Boundary Notice:</strong>
              <p>
                {multiUnitAnalytes.map((m) => (
                  <span key={m.analyte} className="block">
                    • <span className="font-semibold capitalize">{m.analyte}</span> was recorded in multiple units ({m.units.join(', ')}). Values with different units cannot be compared numerically and are tracked in separate series.
                  </span>
                ))}
              </p>
            </div>
          </div>
        )}

        {/* Series Tables & Sparklines */}
        <div className="space-y-6">
          {groupedSeries.map((series) => {
            const firstPt = series.dataPoints[0];
            const latestPt = series.dataPoints[series.dataPoints.length - 1];
            const netChange = latestPt.value - firstPt.value;
            const netSign = netChange > 0 ? '+' : '';

            return (
              <div
                key={`${series.analyteName}:::${series.unit}`}
                className="p-4 rounded-xl bg-card border border-border space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
                  <div>
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <span>{series.analyteName}</span>
                      <span className="text-xs font-mono font-normal text-muted-foreground px-2 py-0.5 rounded-md bg-muted border border-border">
                        {series.unit || 'unitless'}
                      </span>
                    </h4>
                    {series.referenceRange && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                        Adult Reference: {series.referenceRange}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <Sparkline dataPoints={series.dataPoints} analyteName={series.analyteName} />
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-foreground">
                        Net: {netSign}{netChange.toFixed(1)} {series.unit}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {series.dataPoints.length} tests recorded
                      </div>
                    </div>
                  </div>
                </div>

                {/* Serial Readings Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground font-semibold">
                        <th className="py-1.5 px-2">Date</th>
                        <th className="py-1.5 px-2">Measured Value</th>
                        <th className="py-1.5 px-2">Change from Previous</th>
                        <th className="py-1.5 px-2">Movement Relative to Reference Interval</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-mono">
                      {series.dataPoints.map((point, idx) => {
                        const prevPoint = idx > 0 ? series.dataPoints[idx - 1] : null;
                        const diff = prevPoint ? point.value - prevPoint.value : null;
                        const movement = prevPoint
                          ? classifyTrendMovement(point.value, prevPoint.value, series.referenceRange)
                          : 'Baseline reading';

                        return (
                          <tr key={idx} className="hover:bg-muted/20">
                            <td className="py-2 px-2 text-foreground font-sans">
                              {new Date(point.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-2 px-2 font-bold text-foreground">
                              {point.value} {point.unit}
                            </td>
                            <td className="py-2 px-2 text-muted-foreground">
                              {diff !== null ? (
                                <span className={diff > 0 ? 'text-primary' : diff < 0 ? 'text-foreground' : ''}>
                                  {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} {point.unit}
                                </span>
                              ) : (
                                <span className="text-muted-foreground/60">—</span>
                              )}
                            </td>
                            <td className="py-2 px-2 font-sans text-xs text-foreground/90">
                              {movement}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default LabTrends;
