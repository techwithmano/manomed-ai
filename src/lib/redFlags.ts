/**
 * @fileOverview Client-Side Red-Flag and Emergency Pattern Detection.
 * 
 * NOTE & SAFETY DISCLAIMER:
 * TODO: CLINICAL REVIEW REQUIRED — Keyword and regular expression matching serves solely
 * as an immediate, first-layer safety net in the patient's browser. It is non-exhaustive,
 * must be verified by clinical leadership, and must be backed by validated model-based triage.
 * 
 * PRIVACY GUARANTEE:
 * Pattern matching executes 100% locally in the client browser. Matched symptom text is NEVER
 * logged, stored, or transmitted to any external analytics or tracking service.
 */

export type RedFlagType = 'medical_emergency' | 'crisis_support';

export interface RedFlagMatch {
  type: RedFlagType;
  category: string;
  userMessage: string;
}

interface PatternRule {
  category: string;
  pattern: RegExp;
  userMessage: string;
}

interface LocaleRuleSet {
  medical: PatternRule[];
  crisis: PatternRule[];
}

/**
 * Checks if a clause is guarded by clinical negation, family history, or distant past history.
 * TODO: CLINICAL REVIEW REQUIRED — Guard heuristics are pending clinical review.
 */
function isGuarded(clause: string): boolean {
  // 1. Negation guards: e.g. "no chest pain", "no severe headache", "denies shortness of breath", "without chest pain"
  const isNegated = /\b(no|not|never|denies|denying|without|negative\s+for)\s+([a-z]+\s+)?(chest\s+pain|chest\s+pressure|headache|faint\w*|loss\s+of\s+consciousness|shortness\s+of\s+breath|difficulty\s+breathing|vomit\w*\s+blood)\b/i.test(clause);
  if (isNegated) return true;

  // 2. Family history guards: e.g. "my dad had a stroke last year", "my grandfather died of a heart attack"
  const isFamily = /\b(my\s+)?(dad|father|mom|mother|grandfather|grandpa|grandmother|grandma|brother|sister|uncle|aunt|cousin|parent)\s+(had|has|died|suffered|was\s+diagnosed|survived)\b/i.test(clause);
  if (isFamily) return true;

  // 3. Distant past or situational fainting: e.g. "years ago", "when I was a child", "at the sight of blood"
  const isDistantPastOrSituational = /\b(years\s+ago|decades\s+ago|as\s+a\s+child|when\s+i\s+was\s+(young|little|a\s+kid)|at\s+the\s+sight\s+of\s+blood)\b/i.test(clause);
  if (isDistantPastOrSituational) return true;

  return false;
}

/**
 * Localized pattern sets.
 * Currently implemented: 'en' (English).
 * Non-English locales ('ar', 'es', 'zh', 'fr') do NOT currently have active pattern rules.
 * Automated detection is pending clinical review for non-English inputs; a persistent safety notice is displayed in the UI.
 */
const PATTERNS_BY_LOCALE: Record<string, LocaleRuleSet> = {
  en: {
    crisis: [
      {
        category: 'suicide_self_harm',
        // TODO: CLINICAL REVIEW REQUIRED — Crisis detection regex (pending clinical review)
        pattern: /\b(suicid\w*|kill\s+myself|want\s+to\s+die|ending\s+my\s+life|end\s+my\s+life|harm\s+myself|take\s+my\s+own\s+life|don'?t\s+want\s+to\s+live|better\s+off\s+dead)\b/i,
        userMessage: 'If you or someone you know is going through a tough time or having thoughts of self-harm, please know that confidential support is available right now.',
      },
    ],
    medical: [
      {
        category: 'acute_coronary',
        // TODO: CLINICAL REVIEW REQUIRED — Isolated or radiating acute chest pain/pressure (pending clinical review)
        pattern: /(crushing\s+(chest|substernal|sternal)|elephant\s+(is\s+)?(sitting\s+on|on)\s+(a\s+|the\s+|my\s+)?chest|\b(severe|intense|unbearable|crushing)\s+(chest|substernal|sternal)\s+(pain|pressure|tightness|heaviness)\b|\b(chest|substernal|sternal)\s+(pain|pressure|tightness|heaviness)\s+(is\s+)?(severe|crushing|intense|unbearable)\b|chest\s+(pain|pressure|tightness|heaviness|ache)\s+.*(left\s*arm|jaw|neck|back)|(pain|pressure|tightness)\s+(is\s+)?(radiat\w*|spread\w*|shoot\w*|go\w*(\s+down)?)\s+.*(left\s*arm|jaw|neck)|pain\s+(is\s+)?(going|shooting|radiating)\s+down\s+(my\s+)?left\s*arm|\b(having|suspect)\s+a\s+heart\s+attack\b)/i,
        userMessage: 'Severe or crushing chest pain, pressure, or symptoms radiating to the arm, neck, or jaw can indicate an acute cardiac emergency.',
      },
      {
        category: 'aortic_dissection',
        // TODO: CLINICAL REVIEW REQUIRED — Tearing or ripping pain between shoulder blades (pending clinical review)
        pattern: /\b(tearing|ripping)\s+(pain|sensation)\s+.*(between\s+(the\s+|my\s+)?shoulder\s+blades|in\s+(the\s+|my\s+)?(back|chest))\b|\b(pain|pressure)\s+between\s+(the\s+|my\s+)?shoulder\s+blades\s+.*(tearing|ripping)\b|\b(tearing|ripping)\s+(chest|back)\s+pain\b/i,
        userMessage: 'Tearing or ripping pain between the shoulder blades or in the chest can indicate an acute aortic emergency.',
      },
      {
        category: 'thunderclap_headache',
        // TODO: CLINICAL REVIEW REQUIRED — Worst headache of life / thunderclap onset (pending clinical review)
        pattern: /\b(worst\s+headache\s+of\s+my\s+life|thunderclap\s+headache|headache\s+.*like\s+a\s+thunderclap|sudden\s+explosive\s+headache)\b/i,
        userMessage: 'A sudden explosive headache ("worst headache of your life" or thunderclap onset) can indicate an acute intracranial emergency.',
      },
      {
        category: 'syncope_unresponsive',
        // TODO: CLINICAL REVIEW REQUIRED — Syncope, loss of consciousness, unresponsiveness (pending clinical review)
        pattern: /\b(passed\s+out|lost\s+consciousness|loss\s+of\s+consciousness|unresponsive|blacked\s+out|sudden(ly)?\s+fainted|feeling\s+like\s+i'?m\s+passing\s+out)\b|\bfainted\b/i,
        userMessage: 'Loss of consciousness, fainting, or becoming unresponsive requires urgent in-person medical evaluation.',
      },
      {
        category: 'acute_abdomen',
        // TODO: CLINICAL REVIEW REQUIRED — Board-like abdomen or severe abdominal pain with fever/chills (pending clinical review)
        pattern: /\b(rigid|board[- ]like)\s+abdomen\b|\bsevere\s+(abdominal|stomach|belly)\s+pain\s+.*(fever|chills)\b|\b(fever|chills)\s+.*severe\s+(abdominal|stomach|belly)\s+pain\b/i,
        userMessage: 'A rigid, board-like abdomen or severe abdominal pain with fever and chills can indicate peritonitis or an acute surgical abdomen.',
      },
      {
        category: 'overdose_poisoning',
        // TODO: CLINICAL REVIEW REQUIRED — Overdose, poisoning, harmful ingestion (pending clinical review)
        pattern: /\b(overdos(e|ed|ing)|poison(ed|ing)?)\b|\b(took|swallowed)\s+(a\s+)?(whole\s+bottle|all\s+(the|my))\s+(of\s+)?pills?\b|\b(drank|swallowed|ingested)\s+(bleach|cleaner|chemical|poison)\b/i,
        userMessage: 'Suspected overdose, poisoning, or chemical ingestion requires immediate emergency medical care or Poison Control contact.',
      },
      {
        category: 'stroke_fast',
        // TODO: CLINICAL REVIEW REQUIRED — Facial droop, slurred speech, unilateral weakness (pending clinical review)
        pattern: /\b(face\s+(is\s+)?droop(ing)?|facial\s+droop(ing)?)\b|\b(slurr(ed|ing)\s+speech|speech\s+is\s+slurr(ed|ing)|loss\s+of\s+speech)\b|\b(one[- ]sided|(left|right)[- ]side(d)?)\s+(weakness|paralysis|numbness)\b|\bcan'?t\s+move\s+(my\s+)?(left|right)\s+(arm|leg|side)\b|\b(having|signs?\s+of)\s+a\s+stroke\b/i,
        userMessage: 'Sudden one-sided weakness, facial drooping, or speech difficulty can indicate a stroke, which requires immediate medical treatment.',
      },
      {
        category: 'severe_respiratory',
        // TODO: CLINICAL REVIEW REQUIRED — Respiratory distress, cyanosis, gasping (pending clinical review)
        pattern: /\b(can'?t|cannot|unable\s+to|struggling\s+to)\s+breathe?\b|\b(blue\s+(lips|fingers|skin|face)|(lips|fingers|skin|face)\s+(are\s+|turning\s+)?blue)\b|\b(gasping\s+for\s+(air|breath)|struggling\s+for\s+air|suffocating)\b|\bsevere\s+shortness\s+of\s+breath\b/i,
        userMessage: 'Severe difficulty breathing or blue lips can indicate acute oxygen deprivation or respiratory failure.',
      },
      {
        category: 'severe_hemorrhage',
        // TODO: CLINICAL REVIEW REQUIRED — Hemorrhage, bleeding that won't stop, coughing/vomiting blood (pending clinical review)
        pattern: /\b(bleeding\s+(that\s+)?(won'?t|doesn'?t|will\s+not)\s+stop|can'?t\s+stop\s+(the\s+)?bleeding|uncontrolled\s+bleeding|(severe|massive)\s+hemorrhage|spurting\s+blood|(coughing|vomiting|throwing)(\s+up)?\s+(blood|coffee\s*ground))\b/i,
        userMessage: 'Uncontrolled bleeding that will not stop or coughing/vomiting blood requires urgent in-person medical evaluation.',
      },
      {
        category: 'seizure_convulsions',
        // TODO: CLINICAL REVIEW REQUIRED — Active seizures, convulsions, continuous shaking (pending clinical review)
        pattern: /\b(seizur\w*|convuls\w*|shaking\s+uncontrollably|having\s+a\s+fit)\b/i,
        userMessage: 'Active seizures, convulsions, or uncontrollable shaking require emergency medical evaluation.',
      },
      {
        category: 'sudden_vision_loss',
        // TODO: CLINICAL REVIEW REQUIRED — Sudden loss of vision, sudden blindness (pending clinical review)
        pattern: /\b(sudden(ly)?\s+(lost|losing|loss\s+of)?\s*(my\s+)?(vision|sight)|sudden(ly)?\s+(can'?t|cannot)\s+see|sudden(ly)?\s+blind|lost\s+vision\s+in\s+(my\s+)?(left|right|an?|either)\s+eye|curtain\s+(falling|coming\s+down)\s+over\s+(my\s+)?eye)\b/i,
        userMessage: 'Sudden loss of vision or sudden blindness in one or both eyes is an emergency that requires immediate medical evaluation.',
      },
      {
        category: 'meningismus',
        // TODO: CLINICAL REVIEW REQUIRED — Stiff neck with fever, suspected meningitis (pending clinical review)
        pattern: /\b(stiff\s+neck\s+.*(fever|high\s+temp\w*)|(fever|high\s+temp\w*)\s+.*stiff\s+neck|neck\s+stiffness\s+.*(fever|high\s+temp\w*)|(fever|high\s+temp\w*)\s+.*neck\s+stiffness)\b/i,
        userMessage: 'A stiff neck accompanied by fever can indicate meningitis or an acute central nervous system infection.',
      },
      {
        category: 'head_injury',
        // TODO: CLINICAL REVIEW REQUIRED — Head trauma with repeated vomiting or confusion (pending clinical review)
        pattern: /\b(head\s+(injury|trauma|hit|blow)|hit\s+(my|the|their)\s+head)\s+.*(vomit\w*|throw\w*\s+up|confus\w*|disorient\w*)\b|\b(vomit\w*|throw\w*\s+up|confus\w*|disorient\w*)\s+.*(head\s+(injury|trauma)|hit\s+(my|the|their)\s+head)\b/i,
        userMessage: 'Head trauma accompanied by repeated vomiting, confusion, or disorientation requires urgent medical evaluation.',
      },
      {
        category: 'anaphylaxis',
        // TODO: CLINICAL REVIEW REQUIRED — Severe allergic reaction, airway swelling (pending clinical review)
        pattern: /\b(throat|tongue|lip(s)?)\s+(is\s+|are\s+|feels?\s+like\s+it'?s\s+)?(swelling|closing(\s+up)?|swollen)\b|\b(swollen\s+(throat|tongue|lips?))\b|\b(severe\s+allergic\s+reaction|anaphylax(is|ic))\b/i,
        userMessage: 'Throat or airway swelling can indicate a severe allergic reaction (anaphylaxis) requiring immediate emergency care.',
      },
    ],
  },
  // TODO: CLINICAL REVIEW REQUIRED — Pattern sets for other active app locales are pending clinical review
  ar: { crisis: [], medical: [] },
  es: { crisis: [], medical: [] },
  zh: { crisis: [], medical: [] },
  fr: { crisis: [], medical: [] },
};

/**
 * Checks arbitrary symptom narrative or tag text for red flags.
 * Executes synchronously in the client browser with no external logging or transmission.
 * 
 * @param text The user's input text to evaluate.
 * @param locale The active language code (defaults to 'en').
 * @returns RedFlagMatch if a trigger is identified, otherwise null.
 */
export function checkRedFlags(text: string, locale = 'en'): RedFlagMatch | null {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (trimmed.length < 3) return null;

  const ruleSet = PATTERNS_BY_LOCALE[locale] || PATTERNS_BY_LOCALE.en;

  // 1. Prioritize Crisis / Self-Harm evaluation first to provide compassionate support
  for (const rule of ruleSet.crisis) {
    if (rule.pattern.test(trimmed)) {
      return {
        type: 'crisis_support',
        category: rule.category,
        userMessage: rule.userMessage,
      };
    }
  }

  // 2. Evaluate Acute Medical Emergencies by clause with negation and family history guards
  const rawClauses = trimmed.split(/(?:[.!?;]|\n|\bbut\b)+/);

  for (const clause of rawClauses) {
    const trimmedClause = clause.trim();
    if (trimmedClause.length < 3) continue;
    if (isGuarded(trimmedClause)) continue;

    for (const rule of ruleSet.medical) {
      if (rule.pattern.test(trimmedClause)) {
        return {
          type: 'medical_emergency',
          category: rule.category,
          userMessage: rule.userMessage,
        };
      }
    }
  }

  return null;
}
