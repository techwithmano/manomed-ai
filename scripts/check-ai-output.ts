import fs from 'fs';
import path from 'path';
import {
  synthesizeClinicalFallbackDifferential,
  SymptomAnalysisOutputSchema,
  type SymptomAnalysisInput,
} from '../src/ai/flows/symptom-analysis';

interface TestCase {
  name: string;
  expectedTriage: 'EMERGENCY' | 'ROUTINE' | 'SELF_CARE';
  input: SymptomAnalysisInput;
}

const testCases: TestCase[] = [
  {
    name: '1. Emergency Case (Cardiopulmonary / ACS)',
    expectedTriage: 'EMERGENCY',
    input: {
      name: 'Test Patient A',
      age: '58',
      gender: 'Male',
      symptoms: 'Severe crushing chest pain radiating to left arm and jaw with shortness of breath and diaphoresis',
      medicalHistory: 'Hypertension, Hyperlipidemia',
      medications: 'Amlodipine 5mg, Atorvastatin 20mg',
      allergies: 'Penicillin',
      vitals: 'BP 168/98, HR 104, SpO2 93%',
      questionnaireAnswers: 'Onset 45 minutes ago during rest; rated 9/10 severity',
    },
  },
  {
    name: '2. Routine Case (Tension-Type Cephalea)',
    expectedTriage: 'ROUTINE',
    input: {
      name: 'Test Patient B',
      age: '34',
      gender: 'Female',
      symptoms: 'Mild bilateral band-like tension headache recurring for the past 2 weeks without visual aura or dizziness',
      medicalHistory: 'None',
      medications: 'None',
      allergies: 'None',
      vitals: 'BP 118/74, HR 68, SpO2 99%',
      questionnaireAnswers: 'Gradual onset at end of workday; no fever, no vomiting; rated 3/10',
    },
  },
  {
    name: '3. Self-Care Case (Mild Exertional Fatigue)',
    expectedTriage: 'SELF_CARE',
    input: {
      name: 'Test Patient C',
      age: '26',
      gender: 'Non-binary',
      symptoms: 'Mild generalized fatigue and muscle soreness after 6 hours of heavy yard work yesterday',
      medicalHistory: 'None',
      medications: 'Multivitamin',
      allergies: 'None',
      vitals: 'BP 116/72, HR 70, SpO2 99%',
      questionnaireAnswers: 'Afebril, hydrating well, no chest or respiratory symptoms; rated 2/10',
    },
  },
];

// Patterns banned in patient-facing strings
const EMERGENCY_NUMBERS_REGEX = /\b(911|999|112)\b/;
const FIXED_NUMERIC_TIMEFRAME_REGEX = /\b(?:within\s+\d+[-–\s\d]*(?:weeks?|days?|hours?|hrs?|minutes?|mins?|months?)|(?:\d+)\s*[-–]\s*(?:\d+)\s*(?:weeks?|days?|hours?|hrs?|minutes?|mins?|months?)|24-48|\b\d+\s+(?:days?|weeks?|hours?|hrs?|minutes?|mins?)\b)/i;

function checkStringForBannedPatterns(str: string, location: string): string[] {
  const issues: string[] = [];
  if (EMERGENCY_NUMBERS_REGEX.test(str)) {
    issues.push(`Hardcoded emergency phone number found at ${location}: "${str}"`);
  }
  if (FIXED_NUMERIC_TIMEFRAME_REGEX.test(str)) {
    issues.push(`Fixed numeric timeframe found in patient-facing text at ${location}: "${str}"`);
  }
  return issues;
}

function deepScanForBannedPatterns(obj: unknown, loc = 'root'): string[] {
  const issues: string[] = [];
  // Skip user input echo in subjective section
  if (loc.endsWith('soapNote.subjective')) {
    return issues;
  }
  if (typeof obj === 'string') {
    issues.push(...checkStringForBannedPatterns(obj, loc));
  } else if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      issues.push(...deepScanForBannedPatterns(item, `${loc}[${idx}]`));
    });
  } else if (obj && typeof obj === 'object') {
    Object.entries(obj).forEach(([key, val]) => {
      issues.push(...deepScanForBannedPatterns(val, `${loc}.${key}`));
    });
  }
  return issues;
}

// Static codebase scan of target patient-facing files
const TARGET_FILES = [
  'src/ai/flows/symptom-analysis.ts',
  'src/components/ConditionDisplay.tsx',
  'src/lib/clinicalConfig.ts',
  'src/lib/pdf-export.ts',
  'src/app/api/send-report/route.ts',
];

function scanTargetFiles(): { file: string; issues: string[] }[] {
  const fileResults: { file: string; issues: string[] }[] = [];

  for (const relPath of TARGET_FILES) {
    const fullPath = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    const issues: string[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      // Skip pure comments, imports, timeouts/intervals, css min-h classes, git/types
      if (
        trimmed.startsWith('//') ||
        trimmed.startsWith('/*') ||
        trimmed.startsWith('*') ||
        trimmed.startsWith('import ') ||
        trimmed.includes('setTimeout') ||
        trimmed.includes('setInterval') ||
        trimmed.includes('min-h-') ||
        trimmed.includes('min-w-')
      ) {
        return;
      }

      // Check emergency numbers
      const numMatch = trimmed.match(EMERGENCY_NUMBERS_REGEX);
      if (numMatch && !trimmed.includes('regex') && !trimmed.includes('match') && !trimmed.includes('RegExp')) {
        issues.push(`Line ${idx + 1}: Hardcoded emergency number (${numMatch[0]}) -> ${trimmed}`);
      }

      // Check fixed numeric timeframes in patient-facing literals
      if (
        trimmed.includes('within 1-2 weeks') ||
        trimmed.includes('within 24 hours') ||
        trimmed.includes('5-7 days') ||
        trimmed.includes('24-48') ||
        trimmed.includes('0-15 minutes')
      ) {
        issues.push(`Line ${idx + 1}: Fixed numeric timeframe -> ${trimmed}`);
      }
    });

    fileResults.push({ file: relPath, issues });
  }

  return fileResults;
}

async function runCheck() {
  console.log('='.repeat(80));
  console.log('STRONG AI OUTPUT & PATIENT-FACING CODEBASE CHECK');
  console.log('='.repeat(80));

  let allPassed = true;

  // 1. Static scan of target files
  console.log('\n[1/2] STATIC SCAN OF TARGET PATIENT-FACING SOURCE FILES:');
  const staticResults = scanTargetFiles();
  let totalStaticViolations = 0;

  for (const res of staticResults) {
    if (res.issues.length === 0) {
      console.log(`  ✓ ${res.file}: Clean (0 violations)`);
    } else {
      console.error(`  ❌ ${res.file}: ${res.issues.length} violation(s) found:`);
      res.issues.forEach((iss) => console.error(`     - ${iss}`));
      totalStaticViolations += res.issues.length;
      allPassed = false;
    }
  }

  // 2. Dynamic test cases on synthesized differential
  console.log('\n[2/2] DYNAMIC FALLBACK SYNTHESIS VERIFICATION:');

  for (const tc of testCases) {
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`TEST CASE: ${tc.name}`);
    console.log(`Input symptoms: "${tc.input.symptoms}"`);
    console.log(`--------------------------------------------------------------------------------`);

    // Generate fallback output
    const output = await synthesizeClinicalFallbackDifferential(tc.input);

    // Validate with Zod schema
    const parseResult = SymptomAnalysisOutputSchema.safeParse(output);
    if (!parseResult.success) {
      console.error(`❌ Zod Schema Validation Failed:`, parseResult.error.format());
      allPassed = false;
      continue;
    }
    console.log(`✓ Zod Schema Validated Successfully`);

    // Verify Triage Level
    if (output.triage.level !== tc.expectedTriage) {
      console.error(`❌ Triage Mismatch: Expected ${tc.expectedTriage}, got ${output.triage.level}`);
      allPassed = false;
    } else {
      console.log(`✓ Triage Level Matched: ${output.triage.level} (${output.triage.urgencyColor})`);
    }

    // Scan for banned patterns
    const patternIssues = deepScanForBannedPatterns(output);
    if (patternIssues.length > 0) {
      console.error(`❌ Pattern Scan Violations:`);
      patternIssues.forEach((iss) => console.error(`   - ${iss}`));
      allPassed = false;
    } else {
      console.log(`✓ Clean: Zero hardcoded numbers or fixed numeric timeframes in patient output`);
    }

    // Structured fields
    console.log(`  Recommended Action: "${output.triage.recommendedAction}"`);
    console.log(`  Timeframe:          "${output.triage.timeframe}"`);
    console.log(`  Red Flags Count:    ${output.redFlags.length}`);
    console.log(`  Primary Condition:  ${output.conditions[0]?.condition} (${Math.round((output.conditions[0]?.likelihood || 0) * 100)}% likelihood, ${output.conditions[0]?.riskLevel} risk)`);
    console.log(`  Specialties:        ${output.recommendedSpecialties.join(', ')}`);
    console.log(`  Tests Indicated:    ${output.recommendedTests.slice(0, 3).join(', ')}`);
  }

  console.log(`\n` + '='.repeat(80));
  if (allPassed) {
    console.log(`RESULT: ALL CHECKS PASSED (Static codebase clean, 3 dynamic cases schema-valid).`);
  } else {
    console.error(`RESULT: FAILURES DETECTED in static or dynamic checks.`);
    process.exit(1);
  }
  console.log('='.repeat(80));
}

runCheck().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
