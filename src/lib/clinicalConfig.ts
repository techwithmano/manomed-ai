/**
 * @fileOverview Clinical Display Configuration & Qualitative Mapping.
 * 
 * NOTE:
 * All thresholds, fallbacks, and qualitative translations in this file are baseline defaults pending clinical review.
 * TODO: CLINICAL REVIEW REQUIRED — Must be validated by supervising physicians prior to full production release.
 */

export interface LikelihoodInterpretation {
  label: string;
  badgeStyle: string;
  isHighRiskWarning: boolean;
}

/**
 * Thresholds for translating numerical model likelihoods into plain-language patient explanations (pending clinical review).
 * TODO: CLINICAL REVIEW REQUIRED — Calibrate likelihood boundaries against validation dataset.
 */
export const CLINICAL_LIKELIHOOD_THRESHOLDS = {
  MORE_LIKELY_MIN: 0.65,
  POSSIBLE_MIN: 0.35,
};

/**
 * Translates a continuous probability score (0.0 - 1.0) into cautious, plain-language text.
 * Rule: Never shows a reassuring label for a condition marked high-risk without highlighting
 * that it is critical to rule out with a physician.
 * 
 * TODO: CLINICAL REVIEW REQUIRED — Qualitative mappings are pending clinical review.
 */
export function getPatientLikelihoodInterpretation(
  likelihood: number,
  riskLevel: 'Low' | 'Moderate' | 'High' = 'Low'
): LikelihoodInterpretation {
  const isHighRisk = riskLevel === 'High';

  if (likelihood >= CLINICAL_LIKELIHOOD_THRESHOLDS.MORE_LIKELY_MIN) {
    return {
      label: isHighRisk
        ? 'More likely based on your answers (Critical to evaluate with a doctor)'
        : 'More likely based on your answers',
      badgeStyle: isHighRisk
        ? 'bg-destructive/15 text-destructive border-destructive/30'
        : 'bg-primary/15 text-primary border-primary/30',
      isHighRiskWarning: isHighRisk,
    };
  }

  if (likelihood >= CLINICAL_LIKELIHOOD_THRESHOLDS.POSSIBLE_MIN) {
    return {
      label: isHighRisk
        ? 'Possible (Important to evaluate with your doctor)'
        : 'Possible',
      badgeStyle: isHighRisk
        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
        : 'bg-muted text-foreground border-border',
      isHighRiskWarning: isHighRisk,
    };
  }

  // Under POSSIBLE_MIN
  return {
    label: isHighRisk
      ? 'Less likely, but important to rule out with your doctor'
      : 'Less likely, but worth discussing with your doctor',
    badgeStyle: isHighRisk
      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
      : 'bg-muted/70 text-muted-foreground border-border/60',
    isHighRiskWarning: isHighRisk,
  };
}

/**
 * Fallback emergency care warning signs (pending clinical review) used ONLY when the AI response does not provide specific red flags.
 * TODO: CLINICAL REVIEW REQUIRED — Content is pending clinical review.
 */
export const FALLBACK_EMERGENCY_CARE_TRIGGERS: string[] = [
  'Sudden crushing chest pressure, tightness, or pain radiating to your left arm, neck, or jaw',
  'Severe difficulty breathing, gasping for breath, or bluish discoloration of lips or fingers',
  'Sudden one-sided weakness, numbness, facial droop, or difficulty speaking clearly',
  'Sudden loss of consciousness, fainting, or severe disorientation',
  'Uncontrolled bleeding, coughing up blood, or vomiting dark coffee-ground material',
];

/**
 * Fallback safe self-care guidance (pending clinical review) used ONLY when the AI response does not provide safe home-care items.
 * TODO: CLINICAL REVIEW REQUIRED — Content is pending clinical review.
 */
export const FALLBACK_SAFE_SELF_CARE: string[] = [
  'Rest in a comfortable position and avoid strenuous physical activity while monitoring symptoms.',
  'Maintain adequate hydration with water or clear fluids unless on a medically restricted fluid diet.',
  'Keep a written log of your symptom severity, temperatures, and timing to bring to your consultation.',
];

/**
 * Fallback questions for doctor (pending clinical review) used ONLY when the AI response does not provide consultation questions.
 * TODO: CLINICAL REVIEW REQUIRED — Content is pending clinical review.
 */
export const FALLBACK_DOCTOR_QUESTIONS: string[] = [
  'What potential causes explain the pattern and duration of my symptoms?',
  'Are there any specific diagnostic tests or laboratory workups you recommend today?',
  'What red-flag warning signs should prompt me to seek immediate emergency care?',
  'What supportive steps or treatments are safe for me while I recover?',
];

/**
 * Non-dismissible clinical education disclaimer.
 */
export const CLINICAL_EDUCATION_DISCLAIMER =
  'ManoMed AI provides clinical decision support and health education, not an official medical diagnosis. Always consult a qualified medical professional for personal diagnosis and treatment.';
