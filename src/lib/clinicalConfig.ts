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
 * Universal safety-net sentence for all triage tiers (pending clinical review).
 * TODO: CLINICAL REVIEW REQUIRED — Must be validated by supervising physicians prior to full production release.
 */
export const TRIAGE_SAFETY_NET_SENTENCE =
  'Seek emergency care immediately if symptoms are severe, rapidly worsening, or you develop warning signs.';

/**
 * Specific directive for EMERGENCY triage tier (pending clinical review).
 * TODO: CLINICAL REVIEW REQUIRED — Emergency directive wording pending clinical review.
 */
export const EMERGENCY_TIER_DIRECTIVE =
  'Your symptoms may indicate a medical emergency. Contact your local emergency services now. Do not delay seeking help while using this tool.';

/**
 * Caveat for SELF-CARE / NORMAL triage tier (pending clinical review).
 * TODO: CLINICAL REVIEW REQUIRED — Self-care caveat wording pending clinical review.
 */
export const SELF_CARE_TIER_CAVEAT =
  'This does not mean a serious condition has been ruled out.';

/**
 * Returns a cautious note for high-risk conditions without ranking or probability wording.
 * Rule: Any condition with riskLevel High gets a "worth ruling out with a doctor" note regardless of likelihood.
 * 
 * TODO: CLINICAL REVIEW REQUIRED — Qualitative note wording is pending clinical review.
 */
export function getPatientConditionNote(riskLevel: 'Low' | 'Moderate' | 'High' = 'Low'): string | null {
  if (riskLevel === 'High') {
    return 'Worth ruling out with a doctor';
  }
  return null;
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

/**
 * Evaluates whether an entered age is valid (a number from 0 to 120).
 */
export function isValidLabAge(age?: string | number | null): boolean {
  if (age === undefined || age === null) return false;
  const str = String(age).trim();
  if (str === '') return false;
  const num = Number(str);
  if (isNaN(num)) return false;
  return num >= 0 && num <= 120;
}

/**
 * Evaluates whether an entered age is pediatric (< 18), unspecified, or invalid (outside 0-120).
 * Accept only a number from 0 to 120. Anything else (negative, over 120, text, empty) is treated
 * as unspecified: adult-range interpretations and classifications must be strictly suppressed.
 * TODO: CLINICAL REVIEW REQUIRED — Age boundaries (0-120) and pediatric thresholds (<18) must be clinically validated.
 */
export function isPediatricOrUnspecifiedAge(age?: string | number | null): boolean {
  if (age === undefined || age === null) return true;
  const str = String(age).trim();
  if (str === '') return true;
  const num = Number(str);
  if (isNaN(num)) return true;
  if (num < 0 || num > 120) return true;
  return num < 18;
}


