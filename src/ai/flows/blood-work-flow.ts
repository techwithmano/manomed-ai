'use server';

/**
 * @fileOverview Genkit flow for Comprehensive Blood Work & Laboratory Panel Clinical Interpretation.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const LabItemSchema = z.object({
  parameter: z.string().describe('Name of lab test (e.g. Hemoglobin, White Blood Cells, Creatinine)'),
  value: z.string().describe('Numerical or qualitative result'),
  unit: z.string().describe('Measurement unit (e.g. g/dL, mg/dL, 10*3/uL, mmol/L)'),
  referenceRange: z.string().optional().describe('Normal reference interval (e.g. 13.5 - 17.5 g/dL)'),
});
export type LabItem = z.infer<typeof LabItemSchema>;

const BloodWorkInputSchema = z.object({
  patientName: z.string().optional(),
  age: z.string().optional(),
  gender: z.string().optional(),
  panelType: z.string().optional().describe('e.g. Complete Blood Count (CBC), Comprehensive Metabolic Panel (CMP), Lipid Panel, Cardiac Markers, Custom'),
  labValues: z.array(LabItemSchema).describe('Array of parameter values tested'),
  clinicalSymptoms: z.string().optional().describe('Concurrent clinical symptoms or chief complaint'),
  medications: z.string().optional().describe('Current medications that may influence lab values'),
});
export type BloodWorkInput = z.infer<typeof BloodWorkInputSchema>;

const AnalyzedParameterSchema = z.object({
  name: z.string(),
  value: z.string(),
  unit: z.string(),
  referenceRange: z.string(),
  flag: z.enum(['NORMAL', 'LOW', 'HIGH', 'CRITICAL_LOW', 'CRITICAL_HIGH']),
  interpretation: z.string().describe('Clear medical meaning of this specific value'),
  clinicalImpact: z.string().describe('How this affects the patient'),
});
export type AnalyzedParameter = z.infer<typeof AnalyzedParameterSchema>;

const BloodWorkOutputSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  overallStatus: z.enum(['NORMAL', 'ELEVATED_RISK', 'CRITICAL_ALERT']),
  triageUrgency: z.enum(['EMERGENCY', 'URGENT', 'ROUTINE', 'OPTIMAL']),
  criticalAlerts: z.array(z.string()).describe('Immediate life-threatening or dangerous laboratory flags'),
  analyzedParameters: z.array(AnalyzedParameterSchema),
  plainLanguageSummary: z.string().describe('Clear, compassionate explanation tailored for an everyday patient or senior citizen without medical jargon'),
  clinicalPhysicianSynthesis: z.string().describe('High-density pathophysiological synthesis and differential diagnosis tailored for attending physician or nurse'),
  differentialDiagnoses: z.array(z.object({
    condition: z.string(),
    icd10Hint: z.string().optional(),
    likelihood: z.number().min(0).max(1),
    rationale: z.string(),
  })),
  recommendedFollowUpTests: z.array(z.string()).describe('Next-step confirmatory diagnostic assays or imaging'),
  lifestyleAndDietaryGuidance: z.array(z.string()).describe('Safe, practical nutritional or restorative advice'),
  questionsForDoctor: z.array(z.string()).describe('Specific questions the patient should bring to their follow-up appointment'),
});
export type BloodWorkOutput = z.infer<typeof BloodWorkOutputSchema>;

const bloodWorkPrompt = ai.definePrompt({
  name: 'bloodWorkPrompt',
  input: {
    schema: BloodWorkInputSchema,
  },
  output: {
    schema: BloodWorkOutputSchema,
  },
  prompt: `You are an elite Clinical Pathologist and Internal Medicine Decision Support Specialist.
Analyze the following patient laboratory and blood work panel with rigorous medical precision.

PATIENT PROFILE:
- Name: {{{patientName}}}
- Age: {{{age}}} | Biological Sex: {{{gender}}}
- Panel Category: {{{panelType}}}
- Concurrent Symptoms: {{{clinicalSymptoms}}}
- Current Medications: {{{medications}}}

LABORATORY PARAMETERS TESTED:
{{#each labValues}}
- {{parameter}}: {{value}} {{unit}} (Ref: {{referenceRange}})
{{/each}}

CLINICAL OBJECTIVES:
1. Classify each tested parameter as NORMAL, LOW, HIGH, CRITICAL_LOW, or CRITICAL_HIGH relative to standard age- and sex-adjusted physiological reference intervals.
2. Flag any CRITICAL ALERTS requiring immediate clinical stabilization (e.g. severe hyperkalemia >6.0 mmol/L, severe thrombocytopenia <20k, critical troponin elevation, profound hypoglycemia <50 mg/dL, severe anemia Hb <7.0 g/dL).
3. Synthesize two distinct narratives:
   a) "plainLanguageSummary": A simple, reassuring, crystal-clear explanation suitable for an everyday senior patient (60-year-old grandparent), explaining what the numbers mean in plain English without frightening them.
   b) "clinicalPhysicianSynthesis": An authoritative, evidence-based medical note for the treating doctor or nurse with differential diagnoses, ICD-10 suggestions, and pathophysiological correlations.
4. Recommend high-yield follow-up tests and 4 smart questions for the doctor's appointment.

Strictly return output adhering to the JSON schema.
`,
});

// Robust clinical rule-based engine for offline, test, or rate-limited environments
function synthesizeClinicalFallbackBloodWork(input: BloodWorkInput): BloodWorkOutput {
  const criticalAlerts: string[] = [];

  const analyzedParameters: AnalyzedParameter[] = (input.labValues || []).map((item) => {
    const name = item.parameter.trim();
    const num = parseFloat(item.value);
    const unit = item.unit || '';
    let ref = item.referenceRange || '';
    let flag: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL_LOW' | 'CRITICAL_HIGH' = 'NORMAL';
    let interpretation = 'Value is within expected standard clinical physiological limits.';
    let impact = 'Maintains stable cellular and organ homeostasis.';

    const lowerName = name.toLowerCase();

    // 1. Hemoglobin (Hb)
    if (lowerName.includes('hemoglobin') || lowerName === 'hgb' || lowerName === 'hb') {
      ref = ref || '12.0 - 16.0 g/dL';
      if (!isNaN(num)) {
        if (num < 7.0) {
          flag = 'CRITICAL_LOW';
          criticalAlerts.push(`Critical Anemia: Hemoglobin ${num} g/dL (transfusion threshold)`);
          interpretation = 'Severely depressed hemoglobin concentration carrying severe risk of tissue hypoxia.';
          impact = 'May cause severe dyspnea, tachycardia, orthostatic syncope, and cardiac strain.';
        } else if (num < 12.0) {
          flag = 'LOW';
          interpretation = 'Subnormal hemoglobin indicative of mild to moderate anemia.';
          impact = 'Frequently associated with fatigue, pallor, cold intolerance, and exertional weakness.';
        } else if (num > 17.5) {
          flag = 'HIGH';
          interpretation = 'Elevated hemoglobin concentration (polycythemia).';
          impact = 'Increases blood viscosity; requires rule-out of dehydration or myeloproliferative disorder.';
        }
      }
    }
    // 2. White Blood Cells (WBC)
    else if (lowerName.includes('white blood') || lowerName === 'wbc' || lowerName.includes('leukocyte')) {
      ref = ref || '4.0 - 11.0 10^3/uL';
      if (!isNaN(num)) {
        if (num > 20.0) {
          flag = 'CRITICAL_HIGH';
          criticalAlerts.push(`Marked Leukocytosis: WBC ${num} 10^3/uL (severe infection/sepsis rule-out)`);
          interpretation = 'Severe leukocytosis with pronounced systemic inflammatory/infectious response.';
          impact = 'Urgent evaluation needed for localized abscess, occult sepsis, or hematologic etiology.';
        } else if (num > 11.0) {
          flag = 'HIGH';
          interpretation = 'Elevated white cell count indicative of active infection, inflammatory stress, or tissue trauma.';
          impact = 'Indicates immunological activation fighting potential bacterial or viral challenge.';
        } else if (num < 3.5) {
          flag = 'LOW';
          interpretation = 'Leukopenia representing reduced immune reserve.';
          impact = 'Elevates vulnerability to opportunistic infectious agents.';
        }
      }
    }
    // 3. Platelets (PLT)
    else if (lowerName.includes('platelet') || lowerName === 'plt') {
      ref = ref || '150 - 450 10^3/uL';
      if (!isNaN(num)) {
        if (num < 30) {
          flag = 'CRITICAL_LOW';
          criticalAlerts.push(`Severe Thrombocytopenia: Platelets ${num} 10^3/uL (high spontaneous hemorrhage risk)`);
          interpretation = 'Severe platelet deficiency below safe hemostatic threshold.';
          impact = 'Spontaneous mucosal bleeding, petechiae, or intracranial hemorrhage risk.';
        } else if (num < 150) {
          flag = 'LOW';
          interpretation = 'Thrombocytopenia causing impaired platelet plug formation.';
          impact = 'May lead to easy bruising, prolonged bleeding from cuts, or epistaxis.';
        } else if (num > 450) {
          flag = 'HIGH';
          interpretation = 'Thrombocytosis (reactive vs essential).';
          impact = 'Potential hypercoagulability or reactive phase response to chronic inflammation.';
        }
      }
    }
    // 4. Glucose / Fasting Blood Sugar
    else if (lowerName.includes('glucose') || lowerName.includes('sugar')) {
      ref = ref || '70 - 99 mg/dL';
      if (!isNaN(num)) {
        if (num < 50) {
          flag = 'CRITICAL_LOW';
          criticalAlerts.push(`Severe Hypoglycemia: Glucose ${num} mg/dL (immediate oral/IV dextrose required)`);
          interpretation = 'Critically depressed blood sugar triggering neuroglycopenia.';
          impact = 'High risk of diaphoresis, tremors, altered mental status, and loss of consciousness.';
        } else if (num > 300) {
          flag = 'CRITICAL_HIGH';
          criticalAlerts.push(`Marked Hyperglycemia: Glucose ${num} mg/dL (DKA / HHS rule-out)`);
          interpretation = 'Critical glycemic excursion requiring fluid resuscitation and insulin therapy.';
          impact = 'Risk of osmotic diuresis, electrolyte wasting, dehydration, and ketoacidosis.';
        } else if (num > 125) {
          flag = 'HIGH';
          interpretation = 'Elevated fasting glucose compatible with diabetic dysregulation.';
          impact = 'Chronic microvascular and macrovascular risk factor requiring endocrine management.';
        } else if (num < 70) {
          flag = 'LOW';
          interpretation = 'Mild hypoglycemia.';
          impact = 'Can produce lightheadedness, autonomic sweating, and jitteriness.';
        }
      }
    }
    // 5. Potassium (K+)
    else if (lowerName.includes('potassium') || lowerName === 'k') {
      ref = ref || '3.5 - 5.1 mmol/L';
      if (!isNaN(num)) {
        if (num > 6.0) {
          flag = 'CRITICAL_HIGH';
          criticalAlerts.push(`Dangerous Hyperkalemia: Potassium ${num} mmol/L (urgent ECG & calcium gluconate/insulin-glucose protocol)`);
          interpretation = 'Life-threatening cardiac membrane instability with risk of fatal arrhythmia.';
          impact = 'May cause peaked T waves, conduction delays, and ventricular fibrillation.';
        } else if (num < 3.0) {
          flag = 'CRITICAL_LOW';
          criticalAlerts.push(`Severe Hypokalemia: Potassium ${num} mmol/L (arrhythmia risk, urgent repletion)`);
          interpretation = 'Severe potassium depletion predisposing to cardiac ectopy and muscular paralysis.';
          impact = 'Weakness, cramps, U waves on ECG, and potential cardiac arrest.';
        } else if (num > 5.1) {
          flag = 'HIGH';
          interpretation = 'Mild hyperkalemia; assess renal clearance and medications (ACEi/ARBs/spironolactone).';
          impact = 'Needs serial monitoring and dietary potassium restriction.';
        } else if (num < 3.5) {
          flag = 'LOW';
          interpretation = 'Mild hypokalemia frequently secondary to diuretic therapy or GI losses.';
          impact = 'Associated with fatigue and skeletal muscle cramping.';
        }
      }
    }
    // 6. Creatinine
    else if (lowerName.includes('creatinine') || lowerName === 'cr') {
      ref = ref || '0.7 - 1.3 mg/dL';
      if (!isNaN(num)) {
        if (num > 3.0) {
          flag = 'CRITICAL_HIGH';
          criticalAlerts.push(`Severe Renal Impairment: Creatinine ${num} mg/dL (acute kidney injury / urgent nephrology consult)`);
          interpretation = 'Marked accumulation of nitrogenous waste reflecting severely reduced glomerular filtration.';
          impact = 'Fluid retention, metabolic acidosis, and nephrotoxic drug accumulation.';
        } else if (num > 1.3) {
          flag = 'HIGH';
          interpretation = 'Elevated serum creatinine indicating acute kidney injury or chronic renal disease.';
          impact = 'Requires careful hydration, avoidance of NSAIDs/contrast, and renal ultrasound.';
        }
      }
    }
    // 7. Troponin (Cardiac)
    else if (lowerName.includes('troponin') || lowerName.includes('trop')) {
      ref = ref || '< 0.04 ng/mL';
      if (!isNaN(num) && num > 0.04) {
        flag = 'CRITICAL_HIGH';
        criticalAlerts.push(`Positive Cardiac Troponin: ${num} ng/mL (active myocardial injury / ACS emergency)`);
        interpretation = 'Biochemical hallmark of myocardial cell necrosis.';
        impact = 'Immediate emergency cardiac pathway activation with 12-lead ECG, antiplatelet, and cath lab consult.';
      }
    }
    // 8. Default generic numerical check
    else if (!isNaN(num) && ref.includes('-')) {
      const parts = ref.split('-').map((s) => parseFloat(s.replace(/[^0-9.]/g, '')));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        if (num < parts[0]) {
          flag = 'LOW';
          interpretation = `Lower than the normal interval (${ref}).`;
          impact = 'Subnormal value may indicate mild physiological deficit or altered clearance.';
        } else if (num > parts[1]) {
          flag = 'HIGH';
          interpretation = `Higher than the normal interval (${ref}).`;
          impact = 'Elevated level indicates physiological reaction, accumulation, or hyperfunction.';
        }
      }
    }

    return {
      name,
      value: item.value,
      unit,
      referenceRange: ref || 'Clinical Standard',
      flag,
      interpretation,
      clinicalImpact: impact,
    };
  });

  const hasCritical = analyzedParameters.some((p) => p.flag === 'CRITICAL_HIGH' || p.flag === 'CRITICAL_LOW');
  const hasAbnormal = analyzedParameters.some((p) => p.flag === 'HIGH' || p.flag === 'LOW');
  const overallStatus: 'NORMAL' | 'ELEVATED_RISK' | 'CRITICAL_ALERT' = hasCritical
    ? 'CRITICAL_ALERT'
    : hasAbnormal
    ? 'ELEVATED_RISK'
    : 'NORMAL';
  const triageUrgency: 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'OPTIMAL' = hasCritical
    ? 'EMERGENCY'
    : hasAbnormal
    ? 'URGENT'
    : 'OPTIMAL';

  // Differential condition suggestions based on flags
  const differentials: BloodWorkOutput['differentialDiagnoses'] = [];
  const abnormalCount = analyzedParameters.filter((p) => p.flag !== 'NORMAL').length;

  if (criticalAlerts.some((a) => a.toLowerCase().includes('troponin'))) {
    differentials.push({
      condition: 'Acute Myocardial Infarction / ACS (Rule-Out)',
      icd10Hint: 'I21.9',
      likelihood: 0.85,
      rationale: 'Positive cardiac biomarker release signifies acute myocardial membrane disruption.',
    });
  }
  if (analyzedParameters.some((p) => p.name.toLowerCase().includes('hemo') && (p.flag === 'LOW' || p.flag === 'CRITICAL_LOW'))) {
    differentials.push({
      condition: 'Microcytic / Normocytic Anemia',
      icd10Hint: 'D50.9',
      likelihood: 0.75,
      rationale: 'Depressed hemoglobin concentration requires workup for iron deficiency, occult GI bleeding, or chronic disease.',
    });
  }
  if (analyzedParameters.some((p) => p.name.toLowerCase().includes('white') && (p.flag === 'HIGH' || p.flag === 'CRITICAL_HIGH'))) {
    differentials.push({
      condition: 'Active Bacterial or Inflammatory Infection',
      icd10Hint: 'A49.9',
      likelihood: 0.70,
      rationale: 'Leukocytosis reflects marrow stimulation in response to pyogenic bacteria or acute inflammation.',
    });
  }
  if (analyzedParameters.some((p) => p.name.toLowerCase().includes('glucose') && (p.flag === 'HIGH' || p.flag === 'CRITICAL_HIGH'))) {
    differentials.push({
      condition: 'Type 2 Diabetes Mellitus / Impaired Glucose Tolerance',
      icd10Hint: 'E11.9',
      likelihood: 0.65,
      rationale: 'Elevated circulating serum glucose warrants confirmatory Hemoglobin A1c determination.',
    });
  }

  if (differentials.length === 0) {
    differentials.push({
      condition: 'Within Expected Physiological Baseline',
      icd10Hint: 'Z00.00',
      likelihood: 0.90,
      rationale: 'Tested biological markers demonstrate healthy cellular equilibrium with no overt pathological abnormalities.',
    });
  }

  return {
    id: `lab_${Date.now()}`,
    timestamp: new Date().toISOString(),
    overallStatus,
    triageUrgency,
    criticalAlerts,
    analyzedParameters,
    plainLanguageSummary:
      overallStatus === 'CRITICAL_ALERT'
        ? `Important health alert: One or more of your blood test numbers (including ${criticalAlerts[0] || 'marked findings'}) are outside safe levels and require immediate medical attention today. Please call your doctor or visit the nearest clinic right away so they can help you feel better.`
        : overallStatus === 'ELEVATED_RISK'
        ? `We found ${abnormalCount} test value(s) slightly outside the ideal healthy range. This is very common and can often be easily improved with simple dietary adjustments, medication checks, or follow-up with your primary doctor within the next few days.`
        : `Great news! All analyzed blood test markers are within normal, healthy ranges. Your body's essential systems (blood counts, kidney and liver balance) look stable and well-functioning.`,
    clinicalPhysicianSynthesis: `Laboratory panel reviewed. Overall status: ${overallStatus}. Urgent flags: ${
      criticalAlerts.length > 0 ? criticalAlerts.join('; ') : 'None detected'
    }. Parameter breakdown: ${analyzedParameters.length} analytes processed; ${abnormalCount} demonstrated abnormal deviation from age/sex-standard physiological reference distributions. Recommended clinical correlation with patient physical findings.`,
    differentialDiagnoses: differentials,
    recommendedFollowUpTests: [
      'Comprehensive Metabolic Panel (CMP) if not completed',
      'Serum Ferritin, Iron Saturation & Reticulocyte count (if anemia indicated)',
      'Hemoglobin A1c (if glycemic dysregulation noted)',
      '12-Lead Electrocardiogram (ECG) if cardiac markers elevated',
    ],
    lifestyleAndDietaryGuidance: [
      'Maintain regular hydration with water (aim for 6-8 glasses daily unless on fluid restrictions).',
      'Follow a balanced Mediterranean diet rich in colorful vegetables, lean proteins, and whole grains.',
      'Bring all current prescription bottles and over-the-counter vitamins to your doctor review.',
      'Log any symptoms (dizziness, fatigue, chest discomfort) in a brief daily health diary.',
    ],
    questionsForDoctor: [
      'Are any of these abnormal values related to my current medications or supplements?',
      'Do you recommend repeating any of these tests in 2 to 4 weeks to check the trend?',
      'Should I make any specific changes to my diet or physical activity based on these results?',
      'Are there specific symptoms I should watch out for that would mean I need to call you sooner?',
    ],
  };
}

const bloodWorkFlow = ai.defineFlow<
  typeof BloodWorkInputSchema,
  typeof BloodWorkOutputSchema
>({
  name: 'bloodWorkFlow',
  inputSchema: BloodWorkInputSchema,
  outputSchema: BloodWorkOutputSchema,
}, async (input) => {
  try {
    const { output } = await bloodWorkPrompt(input);
    if (!output) {
      return synthesizeClinicalFallbackBloodWork(input);
    }
    return {
      ...output,
      id: output.id || `lab_${Date.now()}`,
      timestamp: output.timestamp || new Date().toISOString(),
    };
  } catch (err) {
    console.warn('GenAI Blood Work Flow unavailable, engaging clinical fallback engine:', err);
    return synthesizeClinicalFallbackBloodWork(input);
  }
});

export async function interpretBloodWork(input: BloodWorkInput): Promise<BloodWorkOutput> {
  return bloodWorkFlow(input);
}
