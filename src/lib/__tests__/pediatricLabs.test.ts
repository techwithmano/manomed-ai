import test from 'node:test';
import assert from 'node:assert/strict';
import { isPediatricOrUnspecifiedAge } from '@/lib/clinicalConfig';
import {
  synthesizeClinicalFallbackBloodWork,
  type BloodWorkInput,
} from '@/ai/flows/blood-work-flow';

test('Pediatric Labs: Age gating and interpretation suppression', async (t) => {
  await t.test('isPediatricOrUnspecifiedAge identifies pediatric (<18), blank, missing, and non-numeric ages', () => {
    // Under 18
    assert.equal(isPediatricOrUnspecifiedAge(17), true, 'Age 17 (number) should be pediatric');
    assert.equal(isPediatricOrUnspecifiedAge('17'), true, 'Age 17 (string) should be pediatric');
    assert.equal(isPediatricOrUnspecifiedAge(0), true, 'Age 0 should be pediatric');
    assert.equal(isPediatricOrUnspecifiedAge('6 months'), true, 'Non-numeric string starting with age/unit should be guarded');

    // Exactly 18 or above (Adult)
    assert.equal(isPediatricOrUnspecifiedAge(18), false, 'Age 18 should be adult');
    assert.equal(isPediatricOrUnspecifiedAge('18'), false, 'Age 18 (string) should be adult');
    assert.equal(isPediatricOrUnspecifiedAge(45), false, 'Age 45 should be adult');

    // Blank or whitespace
    assert.equal(isPediatricOrUnspecifiedAge(''), true, 'Empty string age should be treated as unspecified/pediatric-safe');
    assert.equal(isPediatricOrUnspecifiedAge('   '), true, 'Whitespace age should be treated as unspecified/pediatric-safe');

    // Missing / null / undefined
    assert.equal(isPediatricOrUnspecifiedAge(undefined), true, 'Undefined age should be treated as unspecified/pediatric-safe');
    assert.equal(isPediatricOrUnspecifiedAge(null), true, 'Null age should be treated as unspecified/pediatric-safe');

    // Non-numeric
    assert.equal(isPediatricOrUnspecifiedAge('abc'), true, 'Alphabetical age should be treated as unspecified/pediatric-safe');
    assert.equal(isPediatricOrUnspecifiedAge('unknown'), true, 'String "unknown" should be treated as unspecified/pediatric-safe');
    assert.equal(isPediatricOrUnspecifiedAge(NaN), true, 'NaN age should be treated as unspecified/pediatric-safe');
  });

  await t.test('Age 17: suppresses adult LOW/HIGH/CRITICAL interpretations and flags clinician review', async () => {
    const input: BloodWorkInput = {
      age: '17',
      gender: 'Male',
      labValues: [
        { parameter: 'Hemoglobin', value: '7.5', unit: 'g/dL' },
        { parameter: 'Glucose', value: '250', unit: 'mg/dL' },
        { parameter: 'Potassium', value: '6.5', unit: 'mmol/L' },
      ],
    };

    const result = await synthesizeClinicalFallbackBloodWork(input);

    assert.equal(result.isPediatric, true, 'isPediatric flag must be true');
    assert.equal(result.needsHumanReview, true, 'needsHumanReview must be true');
    assert.equal(result.rawSourceStatus, 'PED_WITHHELD', 'rawSourceStatus must record suppression');
    assert.equal(result.criticalAlerts.length, 0, 'Adult critical alerts must be withheld for pediatric patient');

    // Values must be preserved exactly
    assert.equal(result.analyzedParameters.length, 3);
    assert.equal(result.analyzedParameters[0].name, 'Hemoglobin');
    assert.equal(result.analyzedParameters[0].value, '7.5');
    assert.equal(result.analyzedParameters[0].referenceRange, 'Pediatric - Age-Specific');
    assert.equal(result.analyzedParameters[0].rawSourceFlag, 'PED_WITHHELD');
    assert.match(
      result.analyzedParameters[0].interpretation,
      /Results require review by a clinician who can interpret them for age/i
    );
    assert.match(
      result.plainLanguageSummary,
      /under 18 years old or an age was not specified, standard adult normal and abnormal ranges cannot be applied/i
    );
  });

  await t.test('Age 18: permits adult evaluation and reference ranges', async () => {
    const input: BloodWorkInput = {
      age: '18',
      gender: 'Female',
      labValues: [
        { parameter: 'Hemoglobin', value: '13.5', unit: 'g/dL' },
      ],
    };

    const result = await synthesizeClinicalFallbackBloodWork(input);

    assert.equal(result.isPediatric, false, 'Age 18 must not be flagged as pediatric');
    assert.notEqual(result.rawSourceStatus, 'PED_WITHHELD');
    assert.notEqual(result.analyzedParameters[0].referenceRange, 'Pediatric - Age-Specific');
  });

  await t.test('Blank age: suppresses adult LOW/HIGH/CRITICAL interpretations', async () => {
    const input: BloodWorkInput = {
      age: '',
      gender: 'Female',
      labValues: [
        { parameter: 'Troponin I', value: '0.08', unit: 'ng/mL' },
      ],
    };

    const result = await synthesizeClinicalFallbackBloodWork(input);

    assert.equal(result.isPediatric, true, 'Blank age must trigger pediatric safety withholding');
    assert.equal(result.rawSourceStatus, 'PED_WITHHELD');
    assert.equal(result.analyzedParameters[0].referenceRange, 'Pediatric - Age-Specific');
    assert.equal(result.criticalAlerts.length, 0, 'Adult critical alerts withheld when age is blank');
    assert.match(result.analyzedParameters[0].interpretation, /review by a clinician who can interpret them for age/i);
  });

  await t.test('Non-numeric age ("invalid"): suppresses adult interpretations and preserves values', async () => {
    const input: BloodWorkInput = {
      age: 'invalid-age',
      gender: 'Other',
      labValues: [
        { parameter: 'Creatinine', value: '2.5', unit: 'mg/dL' },
      ],
    };

    const result = await synthesizeClinicalFallbackBloodWork(input);

    assert.equal(result.isPediatric, true, 'Non-numeric age must trigger pediatric safety withholding');
    assert.equal(result.analyzedParameters[0].value, '2.5', 'Entered value must be retained');
    assert.equal(result.analyzedParameters[0].referenceRange, 'Pediatric - Age-Specific');
    assert.equal(result.criticalAlerts.length, 0);
  });
});
