'use server';

/**
 * @fileOverview Genkit flow for generating structured, high-yield clinical questionnaires.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { callGroqChat } from '@/ai/groq-client';

const QuestionTypeEnum = z.enum(['boolean', 'scale', 'choice', 'text']);
export type QuestionType = z.infer<typeof QuestionTypeEnum>;

const StructuredQuestionSchema = z.object({
  id: z.string().describe('Unique ID like q1, q2'),
  question: z.string().describe('Clear, patient-friendly medical question'),
  type: QuestionTypeEnum.describe('boolean (Yes/No), scale (1-10 intensity), choice (mutually exclusive pills), or text'),
  options: z.array(z.string()).optional().describe('List of 2-4 concise choices if type is choice'),
  clinicalRationale: z.string().optional().describe('Brief reason why a physician asks this to rule in/out conditions'),
  category: z.enum(['onset', 'severity', 'associated_symptom', 'trigger', 'risk_factor', 'general']).optional(),
});
export type StructuredQuestion = z.infer<typeof StructuredQuestionSchema>;

const GenerateQuestionnaireInputSchema = z.object({
  symptoms: z.string().describe('Primary symptoms, onset, and duration reported by patient'),
  medicalHistory: z.string().optional().describe('Past medical history, chronic illnesses, surgeries'),
  medications: z.string().optional().describe('Current medications and supplements'),
  allergies: z.string().optional().describe('Known drug or environmental allergies'),
  vitals: z.string().optional().describe('Optional vitals like temperature, heart rate, BP'),
  age: z.string().optional().describe('Patient age'),
  gender: z.string().optional().describe('Patient biological sex or gender'),
});
export type GenerateQuestionnaireInput = z.infer<typeof GenerateQuestionnaireInputSchema>;

const GenerateQuestionnaireOutputSchema = z.array(StructuredQuestionSchema)
  .describe('5 to 7 high-yield, structured clinical follow-up questions tailored to differentiate potential diagnoses.');
export type GenerateQuestionnaireOutput = z.infer<typeof GenerateQuestionnaireOutputSchema>;

const generateQuestionnairePrompt = ai.definePrompt({
  name: 'generateQuestionnairePrompt',
  input: {
    schema: GenerateQuestionnaireInputSchema,
  },
  output: {
    schema: GenerateQuestionnaireOutputSchema,
  },
  prompt: `You are a clinical decision support and triage AI expert.
A patient has presented with the following intake details:
- Age: {{{age}}}
- Gender: {{{gender}}}
- Symptoms: {{{symptoms}}}
- Medical History: {{{medicalHistory}}}
- Current Medications: {{{medications}}}
- Known Allergies: {{{allergies}}}
- Vitals: {{{vitals}}}

Your goal:
Generate 5 to 7 high-yield, focused clinical questions that a doctor would ask during history taking to differentiate between the most probable diagnoses and rule out emergencies.

Instructions:
1. Tailor questions specifically to the patient's reported symptoms and demographic.
2. Select appropriate question types:
   - 'boolean': Use for yes/no red-flag symptoms (e.g., "Do you have shortness of breath?", "Is the pain spreading to your left arm or jaw?")
   - 'scale': Use for pain or severity (e.g., "On a scale of 1 to 10, how severe is your discomfort right now?")
   - 'choice': Use for distinct qualitative presentations (e.g., "How would you describe the cough?", options: ["Dry & hacking", "Wet with clear phlegm", "Wet with yellow/green mucus", "Barking sound"])
   - 'text': Use sparingly for specific timing or unlisted details.
3. Keep questions easy to understand without confusing medical jargon.
4. Provide a 1-sentence 'clinicalRationale' for each question explaining its medical significance.

Return a JSON array of 5 to 7 StructuredQuestion objects.
`,
});

function generateClinicalFallbackQuestions(input: GenerateQuestionnaireInput): StructuredQuestion[] {
  const sym = (input.symptoms || "").toLowerCase();
  const questions: StructuredQuestion[] = [];

  if (sym.includes("chest") || sym.includes("heart") || sym.includes("breath")) {
    questions.push({
      id: "q_chest_rad",
      question: "Does the chest pain or tightness radiate to your left arm, neck, jaw, or upper back?",
      type: "boolean",
      clinicalRationale: "Radiation of discomfort is a classic diagnostic hallmark differentiating acute coronary syndrome from localized musculoskeletal chest wall pain.",
      category: "associated_symptom",
    });
    questions.push({
      id: "q_breath_exertion",
      question: "Does your breathing difficulty significantly worsen with minimal physical exertion or when lying flat?",
      type: "boolean",
      clinicalRationale: "Orthopnea and exertional dyspnea are primary indicators of cardiopulmonary fluid overload or acute bronchospasm.",
      category: "trigger",
    });
  }

  if (sym.includes("head") || sym.includes("dizz") || sym.includes("vision")) {
    questions.push({
      id: "q_head_onset",
      question: "Did the headache reach peak maximum intensity within 60 seconds of onset (a 'thunderclap' sensation)?",
      type: "boolean",
      clinicalRationale: "Differentiates primary vascular/tension headaches from urgent neurovascular emergencies like subarachnoid hemorrhage.",
      category: "onset",
    });
    questions.push({
      id: "q_neuro_deficits",
      question: "Have you experienced any sudden unilateral weakness, facial droop, or difficulty finding words?",
      type: "boolean",
      clinicalRationale: "Screens for acute focal neurological deficits requiring immediate stroke protocol activation.",
      category: "associated_symptom",
    });
  }

  if (sym.includes("abdom") || sym.includes("stomach") || sym.includes("nausea") || sym.includes("vomit")) {
    questions.push({
      id: "q_abd_rebound",
      question: "Is the abdominal tenderness worse when pressure is quickly released, or when coughing or walking?",
      type: "boolean",
      clinicalRationale: "Evaluates peritoneal irritation signs indicative of acute appendicitis, cholecystitis, or perforated viscus.",
      category: "associated_symptom",
    });
    questions.push({
      id: "q_gi_bleeding",
      question: "Have you observed any black tarry stools, bright blood, or coffee-ground material in vomitus?",
      type: "boolean",
      clinicalRationale: "Identifies active upper or lower gastrointestinal hemorrhage.",
      category: "associated_symptom",
    });
  }

  questions.push({
    id: "q_severity_scale",
    question: "On a scale of 1 to 10, how intense is your primary physical discomfort right now?",
    type: "scale",
    clinicalRationale: "Establishes a quantitative baseline to assess functional impairment and prioritize triage urgency.",
    category: "severity",
  });

  questions.push({
    id: "q_symptom_progression",
    question: "How has the progression of your primary symptoms evolved since they first began?",
    type: "choice",
    options: ["Rapidly worsening", "Constant and steady", "Coming in fluctuating waves", "Gradually improving"],
    clinicalRationale: "Temporal progression trajectory strongly differentiates acute inflammatory processes from indolent conditions.",
    category: "onset",
  });

  questions.push({
    id: "q_fever_chills",
    question: "Have you recorded an elevated body temperature (above 38°C / 100.4°F) or experienced shaking chills?",
    type: "boolean",
    clinicalRationale: "Identifies active systemic pyrogenic response characteristic of bacterial or viral infection.",
    category: "associated_symptom",
  });

  return questions.slice(0, 6);
}

const generateQuestionnaireFlow = ai.defineFlow<
  typeof GenerateQuestionnaireInputSchema,
  typeof GenerateQuestionnaireOutputSchema
>({
  name: 'generateQuestionnaireFlow',
  inputSchema: GenerateQuestionnaireInputSchema,
  outputSchema: GenerateQuestionnaireOutputSchema,
}, async (input) => {
  // 1. Try High-Speed Free Groq Engine (120B reasoning model)
  try {
    const groqSystemPrompt = `You are an elite Clinical Decision Support Physician.
Generate 4 to 6 high-yield, Bayesian diagnostic questions to narrow down the differential.
Return a JSON object with a single key "questions":
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text?",
      "type": "boolean" | "scale" | "choice" | "text",
      "options": ["Option 1", "Option 2"],
      "clinicalRationale": "Diagnostic rationale",
      "category": "onset" | "severity" | "associated_symptom" | "trigger" | "risk_factor" | "general"
    }
  ]
}`;

    const groqUserPrompt = `Patient: Age ${input.age || 'N/A'}, Gender ${input.gender || 'N/A'}
Reported Symptoms: ${input.symptoms}
Medical History: ${input.medicalHistory || 'None'}
Current Medications: ${input.medications || 'None'}`;


    const rawOutput = await callGroqChat<any>(groqSystemPrompt, groqUserPrompt);
    const rawQuestions: any[] = Array.isArray(rawOutput)
      ? rawOutput
      : (rawOutput && Array.isArray(rawOutput.questions) ? rawOutput.questions : []);

    if (rawQuestions.length > 0) {
      const normalizedQuestions: StructuredQuestion[] = rawQuestions.map((q, idx) => {
        const rawType = String(q.type || '').toLowerCase();
        let type: QuestionType = 'boolean';
        if (rawType.includes('scale') || rawType.includes('rate') || rawType.includes('num') || rawType.includes('1-10')) {
          type = 'scale';
        } else if (rawType.includes('choice') || rawType.includes('select') || rawType.includes('multi') || (Array.isArray(q.options) && q.options.length > 1 && !rawType.includes('bool'))) {
          type = 'choice';
        } else if (rawType.includes('text') || rawType.includes('string')) {
          type = 'text';
        } else {
          type = 'boolean';
        }

        const rawCat = String(q.category || '').toLowerCase();
        let category: 'onset' | 'severity' | 'associated_symptom' | 'trigger' | 'risk_factor' | 'general' = 'general';
        if (rawCat.includes('onset') || rawCat.includes('temp') || rawCat.includes('time') || rawCat.includes('durat')) {
          category = 'onset';
        } else if (rawCat.includes('sev') || rawCat.includes('red') || rawCat.includes('alarm') || rawCat.includes('intens')) {
          category = 'severity';
        } else if (rawCat.includes('assoc') || rawCat.includes('symptom')) {
          category = 'associated_symptom';
        } else if (rawCat.includes('trig') || rawCat.includes('posit') || rawCat.includes('aggrav') || rawCat.includes('relie')) {
          category = 'trigger';
        } else if (rawCat.includes('risk') || rawCat.includes('hist') || rawCat.includes('factor')) {
          category = 'risk_factor';
        }

        const options = Array.isArray(q.options) && q.options.length > 0
          ? q.options.map(String)
          : (type === 'choice' ? ['Mild', 'Moderate', 'Severe'] : undefined);

        return {
          id: String(q.id || `q_${idx + 1}`),
          question: String(q.question || 'Do you experience this symptom?'),
          type,
          options,
          clinicalRationale: String(q.clinicalRationale || 'Aids in clarifying clinical diagnosis and differentiating risk.'),
          category,
        };
      });

      if (normalizedQuestions.length > 0) {
        return normalizedQuestions;
      }
    }
  } catch (groqErr) {
    console.warn("Groq questionnaire inference bypassed, falling back:", groqErr);
  }

  // 2. Try GenAI Gemini
  try {
    const { output } = await generateQuestionnairePrompt(input);
    if (output && output.length > 0) return output;
  } catch (err) {
    console.warn("GenAI API unavailable or rate-limited, engaging clinical rule-based engine:", err);
  }

  // 3. Clinical Rule Fallback Engine
  return generateClinicalFallbackQuestions(input);
});

export async function generateQuestionnaire(input: GenerateQuestionnaireInput): Promise<GenerateQuestionnaireOutput> {
  return generateQuestionnaireFlow(input);
}
