'use server';

/**
 * @fileOverview Genkit flow for comprehensive clinical symptom analysis and differential diagnosis.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { callGroqChat } from '@/ai/groq-client';

const SymptomAnalysisInputSchema = z.object({
  name: z.string().optional(),
  age: z.string().optional(),
  gender: z.string().optional(),
  symptoms: z.string().describe('Detailed symptoms, severity, duration, and body regions'),
  medicalHistory: z.string().optional().describe('Past medical history, chronic conditions, surgeries'),
  medications: z.string().optional().describe('Current medications taken by patient'),
  allergies: z.string().optional().describe('Known drug or other allergies'),
  vitals: z.string().optional().describe('Recorded vitals (heart rate, blood pressure, temperature, etc.)'),
  questionnaireAnswers: z.string().optional().describe('Structured questions asked and patient answers'),
});
export type SymptomAnalysisInput = z.infer<typeof SymptomAnalysisInputSchema>;

const ConditionDifferentialSchema = z.object({
  condition: z.string().describe('Name of the potential medical condition'),
  icd10Hint: z.string().optional().describe('Indicative ICD-10 code (e.g. J06.9)'),
  likelihood: z.number().min(0).max(1).describe('Probability score between 0 and 1'),
  description: z.string().describe('Concise clinical explanation of the condition and how it relates to the patient'),
  supportingEvidence: z.array(z.string()).describe('List of patient-reported symptoms that support this diagnosis'),
  contradictingEvidence: z.array(z.string()).optional().describe('List of factors or absent symptoms that make this less likely'),
  riskLevel: z.enum(['Low', 'Moderate', 'High']).describe('Clinical severity risk of the condition if untreated'),
});
export type ConditionDifferential = z.infer<typeof ConditionDifferentialSchema>;

const SymptomAnalysisOutputSchema = z.object({
  id: z.string().describe('Unique assessment ID'),
  timestamp: z.string().describe('ISO timestamp of analysis'),
  triage: z.object({
    level: z.enum(['EMERGENCY', 'URGENT', 'ROUTINE', 'SELF_CARE']).describe('Clinical triage urgency tier'),
    urgencyColor: z.enum(['red', 'amber', 'blue', 'green']).describe('UI color for badge/banner'),
    recommendedAction: z.string().describe('Clear next step, e.g. "Go to the nearest Emergency Room or call 911" or "Schedule a clinic visit within 48 hours"'),
    timeframe: z.string().describe('When patient should seek evaluation (e.g. "Immediate", "Within 24-48 hours", "1-2 weeks")'),
  }),
  redFlags: z.array(z.string()).describe('Any critical warning signs detected (e.g., chest pain with radiation, breathing distress, neurological symptoms). Empty if none.'),
  emergencyGuidance: z.string().optional().describe('Emergency helpline guidance or immediate stabilization instructions if red flags exist'),
  conditions: z.array(ConditionDifferentialSchema).describe('Ranked list of differential diagnoses ordered by likelihood'),
  recommendedSpecialties: z.array(z.string()).describe('Medical specialties best suited to evaluate this (e.g., Cardiology, Pulmonology, Family Medicine)'),
  recommendedTests: z.array(z.string()).describe('Standard diagnostic tests a physician might order (e.g., Complete Blood Count, ECG, Chest X-Ray)'),
  questionsForDoctor: z.array(z.string()).describe('4 to 6 smart, specific questions the patient should bring to their consultation'),
  safeSelfCare: z.array(z.string()).describe('Safe, non-pharmacological or standard supportive home-care measures (hydration, rest, monitoring)'),
  whenToSeekEmergencyCare: z.array(z.string()).describe('Specific red-flag warning signs that should prompt immediate emergency escalation if they develop'),
  soapNote: z.object({
    subjective: z.string().describe('S: Patient chief complaint, HPI, reported symptoms, pertinent positives and negatives'),
    objective: z.string().describe('O: Reported patient vitals, demographics, and provided physical observations'),
    assessment: z.string().describe('A: Clinical synthesis and ranked differential diagnosis with likelihoods'),
    plan: z.string().describe('P: Recommended diagnostic workup, specialty referrals, patient education, and red-flag return precautions'),
  }),
});
export type SymptomAnalysisOutput = z.infer<typeof SymptomAnalysisOutputSchema>;

const symptomAnalysisPrompt = ai.definePrompt({
  name: 'symptomAnalysisPrompt',
  input: {
    schema: SymptomAnalysisInputSchema,
  },
  output: {
    schema: SymptomAnalysisOutputSchema,
  },
  prompt: `You are an elite clinical diagnostic decision support system providing evidence-based triage and differential diagnoses.

PATIENT PRESENTATION:
- Patient Name: {{{name}}}
- Age: {{{age}}} | Gender: {{{gender}}}
- Reported Symptoms & Onset: {{{symptoms}}}
- Medical History: {{{medicalHistory}}}
- Current Medications: {{{medications}}}
- Known Allergies: {{{allergies}}}
- Recorded Vitals: {{{vitals}}}
- Follow-up Questionnaire Responses:
{{{questionnaireAnswers}}}

CLINICAL RESPONSIBILITIES:
1. SAFETY FIRST - RED FLAGS & TRIAGE:
   - Screen rigorously for red flags (e.g. acute coronary syndrome signs, thunderclap headache, focal neurological deficit, anaphylaxis, severe respiratory distress, sepsis signs, acute abdomen, active suicidal ideation).
   - Assign appropriate triage level:
     * EMERGENCY (red): Life/organ-threatening, immediate ER / 911 needed.
     * URGENT (amber): Needs evaluation within 12-24 hours at urgent care or same-day clinic.
     * ROUTINE (blue): Needs primary care appointment in coming days to weeks.
     * SELF_CARE (green): Mild, benign self-limiting symptoms manageable at home with monitoring.

2. DIFFERENTIAL DIAGNOSIS:
   - Provide 3 to 5 ranked potential conditions ordered from highest likelihood to lowest.
   - For each condition, provide:
     * Condition name
     * ICD-10 code hint
     * Likelihood (0.0 to 1.0, ensuring values are realistically calibrated)
     * Description
     * Supporting symptoms reported by patient
     * Contradicting or unconfirmed symptoms
     * Risk level if untreated ('Low', 'Moderate', 'High')

3. CLINICAL EMPOWERMENT & EDUCATION:
   - Recommended medical specialties (e.g., Pulmonology, ENT, Neurology).
   - Common diagnostic tests indicated (e.g., CBC, Comprehensive Metabolic Panel, ECG, Spirometry).
   - 4-6 smart questions for the patient to ask their doctor.
   - Safe self-care and home management supportive measures.
   - Specific criteria for "When to Seek Emergency Care".

4. FORMAL EHR / SOAP NOTE:
   - Write a professional, comprehensive SOAP note formatted in standard medical syntax that a clinician can review and incorporate into an Electronic Health Record.

Ensure the output matches the required JSON schema strictly.
`,
});

function synthesizeClinicalFallbackDifferential(input: SymptomAnalysisInput): SymptomAnalysisOutput {
  const sym = (input.symptoms || "").toLowerCase();
  const history = input.medicalHistory || "None reported";
  const meds = input.medications || "None reported";
  const allergies = input.allergies || "None reported";
  const age = input.age || "Unknown";
  const gender = input.gender || "Unknown";

  let triageLevel: 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'SELF_CARE' = 'ROUTINE';
  let urgencyColor: 'red' | 'amber' | 'blue' | 'green' = 'blue';
  let recommendedAction = "Schedule a consultation with a primary care physician within 3 to 5 days.";
  let timeframe = "Within 3-5 days";
  const redFlags: string[] = [];
  const conditions: ConditionDifferential[] = [];
  const specialties: string[] = ["Primary Care / Internal Medicine"];
  const tests: string[] = ["Comprehensive Metabolic Panel (CMP)", "Complete Blood Count (CBC)"];

  // Red Flag checks
  if (sym.includes("chest") || sym.includes("arm") || sym.includes("shortness of breath") || sym.includes("dyspnea")) {
    triageLevel = 'EMERGENCY';
    urgencyColor = 'red';
    recommendedAction = "Immediate emergency medical evaluation (Call 911 or visit nearest Emergency Department).";
    timeframe = "Immediate / Emergency";
    redFlags.push("Potential cardiopulmonary compromise or acute coronary symptoms detected");
    specialties.unshift("Cardiology", "Emergency Medicine");
    tests.unshift("12-Lead Electrocardiogram (ECG)", "Serum Troponin I/T Levels", "Chest Radiograph");

    conditions.push({
      condition: "Acute Coronary Syndrome Rule-Out",
      icd10Hint: "I21.9",
      likelihood: 0.65,
      description: "Constellation of chest discomfort and exertional dyspnea requires emergent exclusion of myocardial ischemia.",
      supportingEvidence: ["Chest pain / tightness reported", "Shortness of breath noted"],
      contradictingEvidence: ["Awaiting definitive cardiac enzyme and ECG biomarkers"],
      riskLevel: "High",
    });
    conditions.push({
      condition: "Musculoskeletal Chest Wall Strain / Costochondritis",
      icd10Hint: "M94.0",
      likelihood: 0.25,
      description: "Benign inflammation of the costochondral junctions, typically tender to direct palpation.",
      supportingEvidence: ["Atypical chest discomfort"],
      contradictingEvidence: ["Must remain diagnosis of exclusion after cardiac rule-out"],
      riskLevel: "Low",
    });
  } else if (sym.includes("head") || sym.includes("migraine") || sym.includes("dizz")) {
    if (sym.includes("thunderclap") || sym.includes("worst") || sym.includes("droop") || sym.includes("weak")) {
      triageLevel = 'EMERGENCY';
      urgencyColor = 'red';
      recommendedAction = "Seek emergency neurological evaluation immediately via Emergency Services.";
      timeframe = "Immediate";
      redFlags.push("Acute severe neurological presentation rule-out");
      specialties.unshift("Neurology", "Emergency Medicine");
      tests.unshift("Non-contrast Head CT", "MRI Brain");
    } else {
      triageLevel = 'ROUTINE';
      urgencyColor = 'blue';
      recommendedAction = "Consult an outpatient general physician or neurologist for chronic symptom optimization.";
      timeframe = "Within 1-2 weeks";
      specialties.unshift("Neurology");
      tests.push("Basic Neurological Examination", "Orthostatic Vitals");
    }

    conditions.push({
      condition: "Tension-Type Headache or Primary Cephalea",
      icd10Hint: "G44.2",
      likelihood: 0.60,
      description: "Bilateral band-like compressive head discomfort without focal neurological deficits.",
      supportingEvidence: ["Head pain / pressure described"],
      contradictingEvidence: ["Absence of persistent aura"],
      riskLevel: "Low",
    });
    conditions.push({
      condition: "Migraine without Aura",
      icd10Hint: "G43.0",
      likelihood: 0.30,
      description: "Recurrent neurovascular headache characterized by throbbing pain, sensory hypersensitivity, and nausea.",
      supportingEvidence: ["Episodic or intensifying head discomfort"],
      contradictingEvidence: ["Unconfirmed photophobia/phonophobia triggers"],
      riskLevel: "Moderate",
    });
  } else if (sym.includes("abdom") || sym.includes("stomach") || sym.includes("cramp")) {
    triageLevel = 'URGENT';
    urgencyColor = 'amber';
    recommendedAction = "Schedule urgent clinic evaluation or visit urgent care center within 24 hours.";
    timeframe = "Within 24 hours";
    specialties.unshift("Gastroenterology", "General Surgery");
    tests.push("Abdominal Ultrasound / CT Abdomen", "Lipase & Amylase", "Urinalysis");

    conditions.push({
      condition: "Acute Gastroenteritis / Enteropathy",
      icd10Hint: "K52.9",
      likelihood: 0.55,
      description: "Self-limiting or bacterial mucosal inflammation of the gastrointestinal tract.",
      supportingEvidence: ["Reported abdominal discomfort / cramping"],
      contradictingEvidence: ["Absence of continuous peritoneal guarding"],
      riskLevel: "Moderate",
    });
    conditions.push({
      condition: "Functional Dyspepsia or Peptic Irritation",
      icd10Hint: "K30",
      likelihood: 0.35,
      description: "Upper gastric discomfort exacerbated by acid production or motility delay.",
      supportingEvidence: ["Epigastric or abdominal fullness"],
      contradictingEvidence: ["Endoscopy required for structural confirmation"],
      riskLevel: "Low",
    });
  } else {
    triageLevel = 'SELF_CARE';
    urgencyColor = 'green';
    recommendedAction = "Supportive home recovery with monitoring; consult physician if symptoms persist beyond 5-7 days.";
    timeframe = "Self-monitoring / 5-7 days";
    conditions.push({
      condition: "Acute Viral Syndrome / Non-Specific Presentation",
      icd10Hint: "B34.9",
      likelihood: 0.70,
      description: "Transient systemic response with localized constitutional symptoms.",
      supportingEvidence: ["Mild symptom constellation", "Stable baseline status"],
      contradictingEvidence: ["No focal red flags identified"],
      riskLevel: "Low",
    });
    conditions.push({
      condition: "Constitutional / Fatigue Syndrome",
      icd10Hint: "R53.83",
      likelihood: 0.20,
      description: "General malaise associated with sleep deficit, physical stress, or post-viral recovery.",
      supportingEvidence: ["General physical discomfort"],
      contradictingEvidence: ["Rule out endocrine etiologies"],
      riskLevel: "Low",
    });
  }

  return {
    id: `eval_${Date.now()}`,
    timestamp: new Date().toISOString(),
    triage: {
      level: triageLevel,
      urgencyColor,
      recommendedAction,
      timeframe,
    },
    redFlags,
    emergencyGuidance: redFlags.length > 0 ? "Call 911 or proceed to the nearest emergency medical facility immediately." : undefined,
    conditions,
    recommendedSpecialties: specialties,
    recommendedTests: tests,
    questionsForDoctor: [
      "Based on my intake symptoms, which diagnostic tests do you prioritize first?",
      "Are there specific red-flag indicators that should prompt me to go directly to an ER?",
      "Could any of my current medications or lifestyle factors be contributing to this presentation?",
      "What is the expected timeframe for symptom resolution under standard treatment?",
    ],
    safeSelfCare: [
      "Maintain adequate oral hydration with water and electrolyte-balanced fluids.",
      "Ensure sufficient restorative rest and avoid intense physical exertion.",
      "Monitor temperature and symptom progression twice daily in a written log.",
      "Avoid unverified over-the-counter supplements without pharmacist consultation.",
    ],
    whenToSeekEmergencyCare: [
      "Sudden severe chest pressure, jaw pain, or shortness of breath.",
      "Acute confusion, facial drooping, limb weakness, or speech difficulty.",
      "High persistent fever unresponsive to antipyretics or accompanied by stiff neck.",
      "Inability to tolerate oral fluids for over 24 hours or severe intractable vomiting.",
    ],
    soapNote: {
      subjective: `Patient (${age}y, ${gender}) reports: "${input.symptoms}". Past Medical History: ${history}. Current Medications: ${meds}. Known Allergies: ${allergies}. Follow-up responses: ${input.questionnaireAnswers || "Standard intake completed"}.`,
      objective: `Reported vitals: ${input.vitals || "No vital anomalies reported"}. General: Patient-reported distress level consistent with intake narrative.`,
      assessment: `Clinical evaluation demonstrates presentation consistent with ${conditions[0]?.condition || "clinical presentation"} (${Math.round((conditions[0]?.likelihood || 0.5) * 100)}% likelihood). Triage Urgency: ${triageLevel}. Red flags: ${redFlags.length > 0 ? redFlags.join(", ") : "None detected"}.`,
      plan: `1. Patient triage recommendation: ${recommendedAction}. 2. Diagnostic workup considerations: ${tests.join(", ")}. 3. Specialty referral: ${specialties.join(", ")}. 4. Patient advised on emergency return precautions.`,
    },
  };
}

const symptomAnalysisFlow = ai.defineFlow<
  typeof SymptomAnalysisInputSchema,
  typeof SymptomAnalysisOutputSchema
>({
  name: 'symptomAnalysisFlow',
  inputSchema: SymptomAnalysisInputSchema,
  outputSchema: SymptomAnalysisOutputSchema,
}, async (input) => {
  // 1. Try High-Speed Free Groq Engine (120B reasoning model)
  try {
    const groqSystemPrompt = `You are an elite Clinical Decision Support and Emergency Medical AI.
Analyze the clinical intake and return a JSON object with this exact structure:
{
  "id": "eval_123",
  "timestamp": "ISO_DATE",
  "triage": {
    "level": "EMERGENCY" | "URGENT" | "ROUTINE" | "SELF_CARE",
    "urgencyColor": "red" | "amber" | "blue" | "green",
    "recommendedAction": "Clear advice for patient",
    "timeframe": "Immediately / within 24h / etc"
  },
  "redFlags": ["Flag 1", ...],
  "emergencyGuidance": "Life support instructions if red flags exist",
  "conditions": [
    {
      "condition": "Condition Name",
      "icd10Hint": "ICD Code (e.g. I21.9)",
      "likelihood": 0.85,
      "description": "Plain clinical explanation",
      "supportingEvidence": ["Evidence 1", ...],
      "contradictingEvidence": ["Factor 1", ...],
      "riskLevel": "High" | "Moderate" | "Low"
    }
  ],
  "recommendedSpecialties": ["Cardiology", ...],
  "recommendedTests": ["Troponin", "12-Lead ECG", ...],
  "questionsForDoctor": ["Question 1", ...],
  "safeSelfCare": ["Rest", ...],
  "whenToSeekEmergencyCare": ["Chest pain worsens", ...],
  "soapNote": {
    "subjective": "Subjective history",
    "objective": "Objective findings",
    "assessment": "Clinical assessment",
    "plan": "Plan details"
  }
}`;

    const groqUserPrompt = `Patient: ${input.name || 'Anonymous'}, Age: ${input.age || 'N/A'}, Gender: ${input.gender || 'N/A'}
Chief Complaint / Symptoms: ${input.symptoms}
Medical History: ${input.medicalHistory || 'None'}
Medications: ${input.medications || 'None'}
Allergies: ${input.allergies || 'None'}
Vitals: ${input.vitals || 'None'}
Intake Answers: ${input.questionnaireAnswers || 'None'}`;

    const groqOutput = await callGroqChat<any>(groqSystemPrompt, groqUserPrompt);
    if (groqOutput && groqOutput.conditions && groqOutput.conditions.length > 0) {
      // 1. Triage normalization
      const rawLevel = String(groqOutput.triage?.level || '').toUpperCase();
      let level: 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'SELF_CARE' = 'ROUTINE';
      let urgencyColor: 'red' | 'amber' | 'blue' | 'green' = 'blue';

      if (rawLevel.includes('EMERG') || rawLevel.includes('CRIT') || (Array.isArray(groqOutput.redFlags) && groqOutput.redFlags.length > 0)) {
        level = 'EMERGENCY';
        urgencyColor = 'red';
      } else if (rawLevel.includes('URG') || rawLevel.includes('MODER')) {
        level = 'URGENT';
        urgencyColor = 'amber';
      } else if (rawLevel.includes('SELF') || rawLevel.includes('HOME') || rawLevel.includes('MILD')) {
        level = 'SELF_CARE';
        urgencyColor = 'green';
      } else {
        level = 'ROUTINE';
        urgencyColor = 'blue';
      }

      const triage = {
        level,
        urgencyColor,
        recommendedAction: String(groqOutput.triage?.recommendedAction || (
          level === 'EMERGENCY'
            ? 'Seek immediate emergency medical attention or call emergency services.'
            : level === 'URGENT'
            ? 'Schedule an urgent in-person medical evaluation within 24 hours.'
            : 'Schedule a routine consultation with your primary healthcare provider.'
        )),
        timeframe: String(groqOutput.triage?.timeframe || (
          level === 'EMERGENCY' ? 'Immediate' : level === 'URGENT' ? 'Within 24 hours' : 'Within 1-2 weeks'
        )),
      };

      // 2. Conditions normalization
      const conditions: ConditionDifferential[] = (groqOutput.conditions || []).map((c: any) => {
        let l = typeof c.likelihood === 'number' ? c.likelihood : 0.75;
        if (l > 1) l = l / 100;
        if (l < 0) l = 0.1;
        if (l > 1) l = 1;

        const rawRisk = String(c.riskLevel || '').toLowerCase();
        let riskLevel: 'Low' | 'Moderate' | 'High' = 'Moderate';
        if (rawRisk.includes('high') || rawRisk.includes('sev') || rawRisk.includes('crit')) riskLevel = 'High';
        else if (rawRisk.includes('low') || rawRisk.includes('mild')) riskLevel = 'Low';

        return {
          condition: String(c.condition || c.name || 'Clinical Presentation'),
          icd10Hint: c.icd10Hint ? String(c.icd10Hint) : undefined,
          likelihood: Number(l.toFixed(2)),
          description: String(c.description || 'Clinical correlation with reported symptoms.'),
          supportingEvidence: Array.isArray(c.supportingEvidence) ? c.supportingEvidence.map(String) : [],
          contradictingEvidence: Array.isArray(c.contradictingEvidence) ? c.contradictingEvidence.map(String) : undefined,
          riskLevel,
        };
      });

      // 3. SOAP note normalization
      const rawSoap = groqOutput.soapNote || {};
      const soapNote = {
        subjective: String(rawSoap.subjective || `Patient reports: ${input.symptoms}`),
        objective: String(rawSoap.objective || `Vitals / Demographics: Age ${input.age || 'N/A'}, Gender ${input.gender || 'N/A'}, Vitals: ${input.vitals || 'Not provided'}`),
        assessment: String(rawSoap.assessment || `Differential includes: ${conditions.map(c => c.condition).join(', ')}`),
        plan: String(rawSoap.plan || `Clinical recommendation: ${triage.recommendedAction}`),
      };

      return {
        id: String(groqOutput.id || `eval_${Date.now()}`),
        timestamp: String(groqOutput.timestamp || new Date().toISOString()),
        triage,
        redFlags: Array.isArray(groqOutput.redFlags) ? groqOutput.redFlags.map(String) : [],
        emergencyGuidance: groqOutput.emergencyGuidance ? String(groqOutput.emergencyGuidance) : undefined,
        conditions,
        recommendedSpecialties: Array.isArray(groqOutput.recommendedSpecialties) ? groqOutput.recommendedSpecialties.map(String) : ['Primary Care / Family Medicine'],
        recommendedTests: Array.isArray(groqOutput.recommendedTests) ? groqOutput.recommendedTests.map(String) : ['Complete Blood Count', 'Basic Metabolic Panel'],
        questionsForDoctor: Array.isArray(groqOutput.questionsForDoctor) ? groqOutput.questionsForDoctor.map(String) : ['What tests do you recommend to confirm this?', 'What symptoms should prompt urgent follow-up?'],
        safeSelfCare: Array.isArray(groqOutput.safeSelfCare) ? groqOutput.safeSelfCare.map(String) : ['Maintain adequate hydration and rest', 'Monitor temperature and symptoms'],
        whenToSeekEmergencyCare: Array.isArray(groqOutput.whenToSeekEmergencyCare) ? groqOutput.whenToSeekEmergencyCare.map(String) : ['Severe shortness of breath', 'Chest pain or pressure', 'Sudden confusion or dizziness'],
        soapNote,
      };
    }
  } catch (groqErr) {
    console.warn("Groq inference bypassed, falling back to GenAI/rule engine:", groqErr);
  }

  // 2. Try GenAI Gemini
  try {
    const { output } = await symptomAnalysisPrompt(input);
    if (output) {
      return {
        ...output,
        id: output.id || `eval_${Date.now()}`,
        timestamp: output.timestamp || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn("GenAI API unavailable or rate-limited, engaging clinical fallback engine:", err);
  }

  // 3. Clinical Rule Fallback Engine
  return synthesizeClinicalFallbackDifferential(input);
});

export async function symptomAnalysis(input: SymptomAnalysisInput): Promise<SymptomAnalysisOutput> {
  return symptomAnalysisFlow(input);
}
