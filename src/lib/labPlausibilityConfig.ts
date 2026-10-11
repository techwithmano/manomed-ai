/**
 * @fileOverview Laboratory Reference Ranges & Plausible Value Validation Config.
 * 
 * Contains evidence-calibrated reference intervals extracted from existing preset panels,
 * alongside plausibility checks designed to catch gross data-entry errors (e.g., potassium = 42).
 * 
 * Config entries are explicitly categorized by origin:
 * - 'from existing presets': Extracted directly from presets in labs/page.tsx and blood-work-flow.ts.
 * - 'newly added by me': Newly added definitions, marked TODO: CLINICAL REVIEW REQUIRED.
 */

export interface LabParameterDefinition {
  canonicalName: string;
  aliases: string[];
  unit: string;
  origin: 'from existing presets' | 'newly added by me';
  /** Normal physiological reference interval */
  referenceRange: {
    min?: number;
    max?: number;
    display: string;
  };
  /**
   * Plausible numerical boundaries.
   * Values outside these boundaries typically indicate data entry errors or unit discrepancies.
   */
  plausibleRange: {
    min: number;
    max: number;
    guidance: string;
  };
}

/**
 * Standard reference and plausibility ranges.
 * Newly added entries are marked TODO: CLINICAL REVIEW REQUIRED.
 */
export const CLINICAL_LAB_DEFINITIONS: LabParameterDefinition[] = [
  {
    canonicalName: 'Potassium',
    aliases: ['potassium', 'k', 'k+'],
    unit: 'mmol/L',
    origin: 'from existing presets',
    referenceRange: { min: 3.5, max: 5.1, display: '3.5 - 5.1 mmol/L' },
    plausibleRange: { min: 1.0, max: 12.0, guidance: 'Typical serum potassium values range from 1.0 to 12.0 mmol/L. Values such as 42 are usually typographical mistakes.' },
  },
  {
    canonicalName: 'Fasting Glucose (mg/dL)',
    aliases: ['glucose', 'fasting glucose', 'fbs', 'blood sugar', 'fasting blood glucose'],
    unit: 'mg/dL',
    origin: 'from existing presets',
    referenceRange: { min: 70, max: 99, display: '70 - 99 mg/dL' },
    plausibleRange: { min: 10, max: 1500, guidance: 'Plausible serum glucose in mg/dL is between 10 and 1500 mg/dL.' },
  },
  {
    canonicalName: 'Fasting Glucose (mmol/L)',
    aliases: ['glucose', 'fasting glucose', 'fbs', 'blood sugar', 'fasting blood glucose'],
    unit: 'mmol/L',
    origin: 'newly added by me', // TODO: CLINICAL REVIEW REQUIRED
    referenceRange: { min: 3.9, max: 5.5, display: '3.9 - 5.5 mmol/L' }, // TODO: CLINICAL REVIEW REQUIRED
    plausibleRange: { min: 0.5, max: 80.0, guidance: 'Plausible serum glucose in mmol/L is between 0.5 and 80.0 mmol/L.' }, // TODO: CLINICAL REVIEW REQUIRED
  },
  {
    canonicalName: 'Hemoglobin',
    aliases: ['hemoglobin', 'hgb', 'hb'],
    unit: 'g/dL',
    origin: 'from existing presets',
    referenceRange: { min: 12.0, max: 17.5, display: '12.0 - 17.5 g/dL' },
    plausibleRange: { min: 1.0, max: 28.0, guidance: 'Plausible hemoglobin ranges between 1.0 and 28.0 g/dL.' },
  },
  {
    canonicalName: 'White Blood Cells (WBC)',
    aliases: ['white blood cells', 'wbc', 'leukocytes', 'white count'],
    unit: '10^3/uL',
    origin: 'from existing presets',
    referenceRange: { min: 4.0, max: 11.0, display: '4.0 - 11.0 10^3/uL' },
    plausibleRange: { min: 0.1, max: 350.0, guidance: 'Plausible WBC counts range between 0.1 and 350.0 x 10^3/uL.' },
  },
  {
    canonicalName: 'Platelets',
    aliases: ['platelets', 'plt', 'thrombocytes'],
    unit: '10^3/uL',
    origin: 'from existing presets',
    referenceRange: { min: 150, max: 450, display: '150 - 450 10^3/uL' },
    plausibleRange: { min: 1, max: 3000, guidance: 'Plausible platelet counts range between 1 and 3000 x 10^3/uL.' },
  },
  {
    canonicalName: 'Serum Creatinine (mg/dL)',
    aliases: ['creatinine', 'cr', 'serum creatinine'],
    unit: 'mg/dL',
    origin: 'from existing presets',
    referenceRange: { min: 0.7, max: 1.3, display: '0.7 - 1.3 mg/dL' },
    plausibleRange: { min: 0.1, max: 35.0, guidance: 'Plausible serum creatinine in mg/dL is between 0.1 and 35.0 mg/dL.' },
  },
  {
    canonicalName: 'Serum Creatinine (umol/L)',
    aliases: ['creatinine', 'cr', 'serum creatinine'],
    unit: 'umol/L',
    origin: 'newly added by me', // TODO: CLINICAL REVIEW REQUIRED
    referenceRange: { min: 60, max: 115, display: '60 - 115 umol/L' }, // TODO: CLINICAL REVIEW REQUIRED
    plausibleRange: { min: 10, max: 3100, guidance: 'Plausible serum creatinine in umol/L is between 10 and 3100 umol/L.' }, // TODO: CLINICAL REVIEW REQUIRED
  },
  {
    canonicalName: 'Hematocrit',
    aliases: ['hematocrit', 'hct'],
    unit: '%',
    origin: 'from existing presets',
    referenceRange: { min: 37.0, max: 48.0, display: '37.0 - 48.0 %' },
    plausibleRange: { min: 5.0, max: 80.0, guidance: 'Plausible hematocrit percentages range between 5.0% and 80.0%.' },
  },
  {
    canonicalName: 'MCV',
    aliases: ['mcv', 'mean corpuscular volume'],
    unit: 'fL',
    origin: 'from existing presets',
    referenceRange: { min: 80.0, max: 100.0, display: '80.0 - 100.0 fL' },
    plausibleRange: { min: 40.0, max: 160.0, guidance: 'Plausible mean corpuscular volume is between 40.0 and 160.0 fL.' },
  },
  {
    canonicalName: 'Serum Ferritin',
    aliases: ['ferritin', 'serum ferritin'],
    unit: 'ng/mL',
    origin: 'from existing presets',
    referenceRange: { min: 15, max: 150, display: '15 - 150 ng/mL' },
    plausibleRange: { min: 1, max: 50000, guidance: 'Plausible ferritin is between 1 and 50000 ng/mL.' },
  },
  {
    canonicalName: 'Neutrophils',
    aliases: ['neutrophils', 'segs', 'polys'],
    unit: '%',
    origin: 'from existing presets',
    referenceRange: { min: 40, max: 70, display: '40 - 70 %' },
    plausibleRange: { min: 0, max: 100, guidance: 'Differential percentages must be between 0% and 100%.' },
  },
  {
    canonicalName: 'C-Reactive Protein (CRP)',
    aliases: ['c-reactive protein', 'crp', 'hs-crp'],
    unit: 'mg/L',
    origin: 'from existing presets',
    referenceRange: { min: 0.0, max: 3.0, display: '< 3.0 mg/L' },
    plausibleRange: { min: 0.0, max: 800.0, guidance: 'Plausible CRP is between 0.0 and 800.0 mg/L.' },
  },
  {
    canonicalName: 'High-Sensitivity Troponin I',
    aliases: ['troponin', 'troponin i', 'hs-troponin', 'trop'],
    unit: 'ng/mL',
    origin: 'from existing presets',
    referenceRange: { min: 0.0, max: 0.04, display: '< 0.04 ng/mL' },
    plausibleRange: { min: 0.0, max: 500.0, guidance: 'Plausible cardiac troponin I is between 0.0 and 500.0 ng/mL.' },
  },
  {
    canonicalName: 'HbA1c',
    aliases: ['hba1c', 'a1c', 'glycated hemoglobin'],
    unit: '%',
    origin: 'from existing presets',
    referenceRange: { min: 4.0, max: 5.7, display: '< 5.7 %' },
    plausibleRange: { min: 2.0, max: 25.0, guidance: 'Plausible HbA1c is between 2.0% and 25.0%.' },
  },
  {
    canonicalName: 'Blood Urea Nitrogen (BUN)',
    aliases: ['bun', 'blood urea nitrogen', 'urea'],
    unit: 'mg/dL',
    origin: 'from existing presets',
    referenceRange: { min: 7, max: 20, display: '7 - 20 mg/dL' },
    plausibleRange: { min: 1, max: 300, guidance: 'Plausible BUN is between 1 and 300 mg/dL.' },
  },
  {
    canonicalName: 'eGFR',
    aliases: ['egfr', 'estimated gfr'],
    unit: 'mL/min/1.73m2',
    origin: 'from existing presets',
    referenceRange: { min: 60, max: 130, display: '> 60 mL/min/1.73m2' },
    plausibleRange: { min: 1, max: 250, guidance: 'Plausible eGFR is between 1 and 250 mL/min/1.73m2.' },
  },
  {
    canonicalName: 'ALT',
    aliases: ['alt', 'alanine aminotransferase', 'sgpt'],
    unit: 'U/L',
    origin: 'newly added by me', // TODO: CLINICAL REVIEW REQUIRED
    referenceRange: { min: 7, max: 56, display: '7 - 56 U/L' }, // TODO: CLINICAL REVIEW REQUIRED
    plausibleRange: { min: 1, max: 25000, guidance: 'Plausible serum ALT is between 1 and 25000 U/L.' }, // TODO: CLINICAL REVIEW REQUIRED
  },
  {
    canonicalName: 'AST',
    aliases: ['ast', 'aspartate aminotransferase', 'sgot'],
    unit: 'U/L',
    origin: 'newly added by me', // TODO: CLINICAL REVIEW REQUIRED
    referenceRange: { min: 10, max: 40, display: '10 - 40 U/L' }, // TODO: CLINICAL REVIEW REQUIRED
    plausibleRange: { min: 1, max: 25000, guidance: 'Plausible serum AST is between 1 and 25000 U/L.' }, // TODO: CLINICAL REVIEW REQUIRED
  },
  {
    canonicalName: 'Total Bilirubin',
    aliases: ['bilirubin', 'total bilirubin', 'tbil'],
    unit: 'mg/dL',
    origin: 'newly added by me', // TODO: CLINICAL REVIEW REQUIRED
    referenceRange: { min: 0.2, max: 1.2, display: '0.2 - 1.2 mg/dL' }, // TODO: CLINICAL REVIEW REQUIRED
    plausibleRange: { min: 0.05, max: 90.0, guidance: 'Plausible total bilirubin is between 0.05 and 90.0 mg/dL.' }, // TODO: CLINICAL REVIEW REQUIRED
  },
  {
    canonicalName: 'Albumin',
    aliases: ['albumin', 'serum albumin'],
    unit: 'g/dL',
    origin: 'newly added by me', // TODO: CLINICAL REVIEW REQUIRED
    referenceRange: { min: 3.5, max: 5.0, display: '3.5 - 5.0 g/dL' }, // TODO: CLINICAL REVIEW REQUIRED
    plausibleRange: { min: 0.5, max: 8.0, guidance: 'Plausible serum albumin is between 0.5 and 8.0 g/dL.' }, // TODO: CLINICAL REVIEW REQUIRED
  },
];

export interface PlausibilityWarning {
  parameter: string;
  enteredValue: string;
  numericalValue: number;
  plausibleMin: number;
  plausibleMax: number;
  expectedUnit: string;
  guidance: string;
}

/**
 * Normalizes units to match definitions.
 */
function normalizeUnit(unit?: string): string {
  if (!unit) return '';
  const clean = unit.toLowerCase().trim().replace(/\s+/g, '');
  if (clean.includes('mmol')) return 'mmol/l';
  if (clean.includes('mg/dl')) return 'mg/dl';
  if (clean.includes('umol') || clean.includes('µmol')) return 'umol/l';
  if (clean.includes('g/dl')) return 'g/dl';
  return clean;
}

/**
 * Finds a matching lab definition by parameter name and optional user unit.
 * NO SILENT UNIT GUESSING: If multiple definitions exist (e.g. glucose, creatinine)
 * and the user unit is blank or unrecognized, returns undefined so the caller
 * can prompt "Unit needed" rather than inferring a unit based on the number.
 */
export function findLabDefinition(
  parameterName: string,
  userUnit?: string
): LabParameterDefinition | undefined {
  const cleanName = parameterName.toLowerCase().trim();
  const normalizedUserUnit = normalizeUnit(userUnit);

  // Filter definitions that match the parameter name
  const candidateDefs = CLINICAL_LAB_DEFINITIONS.filter((def) => {
    if (def.canonicalName.toLowerCase() === cleanName) return true;
    return def.aliases.some((alias) => cleanName === alias || cleanName.includes(alias));
  });

  if (candidateDefs.length === 0) return undefined;
  if (candidateDefs.length === 1) {
    if (normalizedUserUnit && normalizeUnit(candidateDefs[0].unit) !== normalizedUserUnit) {
      return undefined;
    }
    return candidateDefs[0];
  }

  // If multiple definitions exist (e.g. glucose mg/dL vs mmol/L, creatinine mg/dL vs umol/L):
  // Strictly match by user-specified unit. Never guess from magnitude!
  if (normalizedUserUnit) {
    const unitMatch = candidateDefs.find((def) => normalizeUnit(def.unit) === normalizedUserUnit);
    if (unitMatch) return unitMatch;
  }

  // No silent guessing: user must confirm unit
  return undefined;
}

/**
 * Returns available units for a given parameter name if recognized in config.
 */
export function getCandidateUnitsForParameter(parameterName: string): string[] {
  const cleanName = parameterName.toLowerCase().trim();
  const candidateDefs = CLINICAL_LAB_DEFINITIONS.filter((def) => {
    if (def.canonicalName.toLowerCase() === cleanName) return true;
    return def.aliases.some((alias) => cleanName === alias || cleanName.includes(alias));
  });
  return Array.from(new Set(candidateDefs.map((d) => d.unit)));
}

/**
 * Validates a list of lab input items against plausibility boundaries.
 * Returns an array of warnings for any impossible or extreme values,
 * or when a required unit is missing.
 * 
 * TODO: CLINICAL REVIEW REQUIRED — Plausibility validation thresholds are pending clinical review.
 */
export function checkLabItemsPlausibility(
  items: Array<{ parameter: string; value: string; unit?: string }>
): PlausibilityWarning[] {
  const warnings: PlausibilityWarning[] = [];

  for (const item of items) {
    if (!item.parameter.trim() || !item.value.trim()) continue;
    const num = parseFloat(item.value);
    if (isNaN(num)) continue;

    const cleanName = item.parameter.toLowerCase().trim();

    // Check if parameter has multiple candidate unit systems (e.g. glucose, creatinine)
    const candidateDefs = CLINICAL_LAB_DEFINITIONS.filter((def) => {
      if (def.canonicalName.toLowerCase() === cleanName) return true;
      return def.aliases.some((alias) => cleanName === alias || cleanName.includes(alias));
    });

    if (candidateDefs.length > 1 && !normalizeUnit(item.unit)) {
      const unitsList = Array.from(new Set(candidateDefs.map((d) => d.unit))).join(' or ');
      warnings.push({
        parameter: candidateDefs[0].canonicalName.replace(/\s*\([^)]*\)/, '').trim(),
        enteredValue: item.value,
        numericalValue: num,
        plausibleMin: 0,
        plausibleMax: 0,
        expectedUnit: 'Unit needed',
        guidance: `Measurement unit is required (${unitsList}) to evaluate this test safely. Please select or enter the unit.`,
      });
      continue;
    }

    const def = findLabDefinition(item.parameter, item.unit);
    if (!def) continue;

    // Unit-awareness guard: If user specified a unit and it completely differs from known units, do not falsely flag
    const normalizedItemUnit = normalizeUnit(item.unit);
    const normalizedDefUnit = normalizeUnit(def.unit);
    if (normalizedItemUnit && normalizedDefUnit && normalizedItemUnit !== normalizedDefUnit) {
      const isKnownAlternative = 
        (normalizedItemUnit.includes('mmol') && normalizedDefUnit.includes('mg')) ||
        (normalizedItemUnit.includes('umol') && normalizedDefUnit.includes('mg'));
      if (!isKnownAlternative) {
        continue;
      }
    }

    if (num < def.plausibleRange.min || num > def.plausibleRange.max) {
      warnings.push({
        parameter: def.canonicalName.replace(/\s*\([^)]*\)/, ''), // e.g. "Fasting Glucose"
        enteredValue: item.value,
        numericalValue: num,
        plausibleMin: def.plausibleRange.min,
        plausibleMax: def.plausibleRange.max,
        expectedUnit: def.unit,
        guidance: def.plausibleRange.guidance,
      });
    }
  }

  return warnings;
}
