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
  isThirdParty?: boolean;
}

interface PatternRule {
  category: string;
  pattern: RegExp;
  userMessage: string;
  thirdPartyMessage?: string;
  // Category-specific negation checker to ensure symptom-level, not narrative-level, guarding
  isNegated?: (clause: string) => boolean;
}

interface LocaleRuleSet {
  medical: PatternRule[];
  crisis: PatternRule[];
}

/**
 * Checks if a clause is describing historical family medical history rather than an active emergency.
 * TODO: CLINICAL REVIEW REQUIRED — Family history heuristic.
 */
function isHistoricalFamilyHistory(clause: string): boolean {
  // Matches past family history (e.g. "my grandfather died of a heart attack", "father had a stroke last year")
  // MUST NOT match active emergencies (e.g. "my father has severe chest pressure", "my brother is unresponsive")
  const isHistorical = /\b(my\s+)?(dad|father|mom|mother|grandfather|grandpa|grandmother|grandma|brother|sister|uncle|aunt|cousin|parent|family)\s+(died(\s+of|\s+from)?|passed\s+away|was\s+diagnosed(\s+with)?|had\s+(a\s+)?history\s+of|survived|suffered\s+from)\b/i.test(clause);
  if (isHistorical) return true;

  const isFamilyContext = /\b(family\s+history\s+of|history\s+of\s+.*in\s+(my\s+|the\s+)?family)\b/i.test(clause);
  if (isFamilyContext) return true;

  const isPastFamilyEvent = /\b(my\s+)?(dad|father|mom|mother|grandfather|grandpa|grandmother|grandma|brother|sister|uncle|aunt|cousin|parent)\s+had\s+(a\s+)?(heart\s+attack|stroke|aneurysm|cardiac\s+arrest|seizure|blood\s+clot)\b/i.test(clause) && !/\b(now|today|currently|suddenly|at\s+present)\b/i.test(clause);
  if (isPastFamilyEvent) return true;

  return false;
}

/**
 * Checks if a clause refers strictly to distant past history or situational fainting.
 * TODO: CLINICAL REVIEW REQUIRED — Distant past heuristic.
 */
function isDistantPastOrSituational(clause: string): boolean {
  return /\b(years\s+ago|decades\s+ago|last\s+year|in\s+the\s+past|when\s+i\s+was\s+(young|little|a\s+kid)|as\s+a\s+child|at\s+the\s+sight\s+of\s+blood)\b/i.test(clause) && !/\b(now|today|currently|suddenly|at\s+present|feeling|feels)\b/i.test(clause);
}

/**
 * Checks if a clause is referring to another person in distress.
 * TODO: CLINICAL REVIEW REQUIRED — Third-party emergency identification.
 */
function isThirdPartyPresentation(clause: string): boolean {
  const hasThirdPartySubject = /\b(my\s+)?(brother|sister|father|dad|mother|mom|parent|son|daughter|child|kid|husband|wife|partner|friend|roommate|coworker|someone|person|he|she|they)\b/i.test(clause);
  const hasFirstPersonOverride = /\b(my\s+own|myself|i\s+am|i'm|i\s+have|i\s+feel)\b/i.test(clause);
  return hasThirdPartySubject && !hasFirstPersonOverride;
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
        // TODO: CLINICAL REVIEW REQUIRED — Crisis detection regex
        pattern: /\b(suicid\w*|kill\s+myself|want\s+to\s+die|ending\s+my\s+life|end\s+my\s+life|harm\s+myself|take\s+my\s+own\s+life|don'?t\s+want\s+to\s+live|better\s+off\s+dead)\b/i,
        userMessage: 'If you or someone you know is going through a tough time or having thoughts of self-harm, please know that confidential support is available right now.',
      },
    ],
    medical: [
      {
        category: 'acute_coronary',
        // TODO: CLINICAL REVIEW REQUIRED — Isolated, exertional, or radiating acute chest pain/pressure
        pattern: /(crushing\s+(chest|substernal|sternal)|elephant\s+(is\s+)?(sitting\s+on|on)\s+(a\s+|the\s+|my\s+)?chest|ton\s+of\s+bricks\s+.*chest|\b(chest|substernal|sternal)\s+(pain|pressure|tightness|heaviness|hurts|ache)\b|\b(pain|pressure|tightness|heaviness|squeezing|burning)\b.*?\b(chest|substernal|sternal)\b|\b(severe|intense|unbearable|crushing)\b.*?\b(chest|substernal|sternal)\s+(pain|pressure|tightness|heaviness)\b|\b(chest|substernal|sternal)\s+(pain|pressure|tightness|heaviness)\b.*?\b(severe|crushing|intense|unbearable)\b|\bchest\b.*?\b(hurts\s+really\s+bad|squeezing)\b|chest\s+(pain|pressure|tightness|heaviness|ache|hurts)\s+.*(left\s*arm|jaw|neck|back)|\b(pain|pressure|tightness|burning)\b.*?\bchest\b.*?\b(left\s*arm|jaw|neck|back)\b|(pain|pressure|tightness)\s+(is\s+)?(radiat\w*|spread\w*|shoot\w*|go\w*(\s+down)?)\s+.*(left\s*arm|jaw|neck|back)|pain\s+(is\s+)?(going|shooting|radiating)\s+down\s+(my\s+)?left\s*arm|\b(having|suspect)\s+a\s+heart\s+attack\b)/i,
        userMessage: 'Severe or crushing chest pain, pressure, or symptoms radiating to the arm, neck, or jaw can indicate an acute cardiac emergency.',
        thirdPartyMessage: 'If someone near you is having severe or crushing chest pressure, difficulty breathing, or symptoms radiating to the arm or jaw, call local emergency services immediately.',
        isNegated: (c) => /\b(no|not|never|denies|denying|without|negative\s+for)\s+([a-z]+\s+)?(chest\s+pain|chest\s+pressure|chest\s+tightness|cardiac\s+symptoms?)\b/i.test(c),
      },
      {
        category: 'aortic_dissection',
        // TODO: CLINICAL REVIEW REQUIRED — Tearing or ripping pain between shoulder blades
        pattern: /\b(tearing|ripping)\s+(pain|sensation)\s+.*(between\s+(the\s+|my\s+)?shoulder\s+blades|in\s+(the\s+|my\s+)?(back|chest))\b|\b(pain|pressure)\s+between\s+(the\s+|my\s+)?shoulder\s+blades\s+.*(tearing|ripping)\b|\b(tearing|ripping)\s+(chest|back)\s+pain\b/i,
        userMessage: 'Tearing or ripping pain between the shoulder blades or in the chest can indicate an acute aortic emergency.',
        thirdPartyMessage: 'Tearing or ripping pain between the shoulder blades or back requires immediate emergency evaluation. Call local emergency services now.',
      },
      {
        category: 'thunderclap_headache',
        // TODO: CLINICAL REVIEW REQUIRED — Worst headache of life / thunderclap onset
        pattern: /\b(worst\s+headache\s+of\s+my\s+life|thunderclap\s+headache|headache\s+.*like\s+a\s+thunderclap|sudden\s+explosive\s+headache)\b/i,
        userMessage: 'A sudden explosive headache ("worst headache of your life" or thunderclap onset) can indicate an acute intracranial emergency.',
        thirdPartyMessage: 'A sudden explosive headache of peak intensity requires immediate emergency medical evaluation. Call emergency services now.',
        isNegated: (c) => /\b(no|not|never|denies|denying|without|negative\s+for)\s+([a-z]+\s+)?headache\b/i.test(c),
      },
      {
        category: 'syncope_unresponsive',
        // TODO: CLINICAL REVIEW REQUIRED — Syncope, loss of consciousness, unresponsiveness
        pattern: /\b(passed\s+out|lost\s+consciousness|loss\s+of\s+consciousness|unresponsive|blacked\s+out|sudden(ly)?\s+fainted|feel(ing)?\s+like\s+(i'?m|i\s+am)\s+(going\s+to\s+)?pass(ing)?\s+out|going\s+to\s+pass\s+out|about\s+to\s+pass\s+out|about\s+to\s+faint)\b|\bfainted\b/i,
        userMessage: 'Loss of consciousness, fainting, or feeling like you are about to pass out requires urgent in-person medical evaluation.',
        thirdPartyMessage: 'If the person is unresponsive, unconscious, or cannot be awakened, call local emergency services immediately. Check for breathing, do not leave them unattended, and follow the dispatcher\'s instructions.',
        isNegated: (c) => /\b(no|not|never|denies|denying|without)\s+([a-z]+\s+)?(faint\w*|loss\s+of\s+consciousness|unresponsive\w*)\b/i.test(c),
      },
      {
        category: 'acute_abdomen',
        // TODO: CLINICAL REVIEW REQUIRED — Board-like abdomen or severe abdominal pain with fever/chills
        pattern: /\b(rigid|board[- ]like)\s+abdomen\b|\bsevere\s+(abdominal|stomach|belly)\s+pain\b.*?(fever|chills)\b|\b(fever|chills)\b.*?severe\s+(abdominal|stomach|belly)\s+pain\b/i,
        userMessage: 'A rigid, board-like abdomen or severe abdominal pain with fever and chills can indicate peritonitis or an acute surgical abdomen.',
        thirdPartyMessage: 'A rigid abdomen or severe abdominal pain with fever requires immediate emergency medical evaluation. Call emergency services now.',
      },
      {
        category: 'overdose_poisoning',
        // TODO: CLINICAL REVIEW REQUIRED — Overdose, poisoning, harmful ingestion
        pattern: /\b(overdos(e|ed|ing)|poison(ed|ing)?)\b|\b(took|swallowed|ingested)\s+(a\s+)?(whole\s+(bottle|bunch|box)|all\s+(the|my)|too\s+many)\s+(of\s+)?(pills?|medication|tablets?|painkillers?|sleeping\s+pills?)\b|\b(drank|swallowed|ingested)\s+(some\s+|a\s+)?(bleach|cleaner|cleaning\s+solution|chemical|poison|rat\s+poison)\b/i,
        userMessage: 'Suspected overdose, poisoning, or chemical ingestion requires immediate emergency medical care or Poison Control contact.',
        thirdPartyMessage: 'Suspected overdose or poisoning in another person requires immediate emergency medical help. Call local emergency services or Poison Control now. Keep containers or pill bottles nearby for emergency personnel.',
      },
      {
        category: 'stroke_fast',
        // TODO: CLINICAL REVIEW REQUIRED — Facial droop, slurred speech, unilateral weakness
        pattern: /\b(face\b.*?\bdroop(ing|ed)?|facial\s+droop(ing)?)\b|\b(crooked\s+smile|smiling\s+crooked|smile\s+is\s+crooked)\b|\b(slurr(ed|ing)\b.*?(speech|words|talk)|speech\b.*?\bslurr(ed|ing)|loss\s+of\s+speech|words\s+coming\s+out\s+(all\s+)?slurred)\b|\b(one[- ]sided|(left|right)[- ]side(d)?)\s+(weakness|paralysis|numbness)\b|\b(one\s+side|left\s+side|right\s+side|half)\s+of\s+(my\s+|the\s+|her\s+|his\s+)?(body|face)\b.*?\b(weak|paralyzed|numb|droop\w*)\b|\bcan'?t\s+move\s+(my\s+|their\s+|her\s+|his\s+)?(left|right|an?|either)?\s*(arm|leg|side)\b|\b(having|signs?\s+of)\s+a\s+stroke\b/i,
        userMessage: 'Sudden one-sided weakness, facial drooping, or speech difficulty can indicate a stroke, which requires immediate medical treatment.',
        thirdPartyMessage: 'If someone near you is showing signs of a stroke (facial droop, arm weakness, or slurred speech), call emergency services immediately. Note the time symptoms began and do not give them anything to eat or drink.',
      },
      {
        category: 'severe_respiratory',
        // TODO: CLINICAL REVIEW REQUIRED — Respiratory distress, cyanosis, gasping
        pattern: /\b(can'?t|cannot|unable\s+to|struggling\s+to|hard\s+to)\s+breathe?\b|\b(can'?t|cannot|unable\s+to)\s+(get|catch)\s+(enough\s+)?(air|breath|oxygen)\b|\b(can'?t|cannot)\s+catch\s+(my\s+)?breath\b|\b(blue\s+(lips|fingers|skin|face)|(lips|fingers|skin|face)\b.*?\bblue\b)\b|\b(gasping\s+for\s+(air|breath)|struggling\s+for\s+air|suffocating)\b|\bsevere\s+shortness\s+of\s+breath\b/i,
        userMessage: 'Severe difficulty breathing, inability to get enough air, or blue lips can indicate acute oxygen deprivation or respiratory failure.',
        thirdPartyMessage: 'If someone is struggling to breathe, gasping for air, or has blue lips, call local emergency services immediately. Help them sit upright in a comfortable position.',
        isNegated: (c) => /\b(no|not|never|denies|denying|without)\s+([a-z]+\s+)?(shortness\s+of\s+breath|difficulty\s+breathing|trouble\s+breathing)\b/i.test(c),
      },
      {
        category: 'severe_hemorrhage',
        // TODO: CLINICAL REVIEW REQUIRED — Hemorrhage, bleeding that won't stop, coughing/vomiting blood
        pattern: /\b(bleeding\s+(that\s+)?(won'?t|doesn'?t|will\s+not)\s+stop|can'?t\s+stop\s+(the\s+)?bleeding|uncontrolled\s+bleeding|(severe|massive)\s+hemorrhage|spurting\s+blood|(coughing|vomiting|throwing)(\s+up)?\s+(blood|coffee\s*ground))\b/i,
        userMessage: 'Uncontrolled bleeding that will not stop or coughing/vomiting blood requires urgent in-person medical evaluation.',
        thirdPartyMessage: 'Uncontrolled bleeding or vomiting blood in another person requires immediate emergency medical attention. Call emergency services now.',
        isNegated: (c) => /\b(no|not|never|without)\s+([a-z]+\s+)?vomit\w*\s+blood\b/i.test(c),
      },
      {
        category: 'seizure_convulsions',
        // TODO: CLINICAL REVIEW REQUIRED — Active seizures, convulsions, continuous shaking
        pattern: /\b(seizur\w*|convuls\w*|shaking\s+uncontrollably|having\s+a\s+fit)\b/i,
        userMessage: 'Active seizures, convulsions, or uncontrollable shaking require emergency medical evaluation.',
        thirdPartyMessage: 'If someone is having an active seizure or convulsing, call emergency services immediately. Clear sharp objects away, do not restrain them, do not put anything in their mouth, and turn them on their side once shaking stops.',
      },
      {
        category: 'sudden_vision_loss',
        // TODO: CLINICAL REVIEW REQUIRED — Sudden loss of vision, sudden blindness
        pattern: /\b(sudden(ly)?\s+(lost|losing|loss\s+of)?\s*(my\s+)?(vision|sight)|sudden(ly)?\s+(can'?t|cannot)\s+see|sudden(ly)?\s+blind|lost\s+vision\s+in\s+(my\s+)?(left|right|an?|either)\s+eye|curtain\s+(falling|coming\s+down)\s+over\s+(my\s+)?eye)\b/i,
        userMessage: 'Sudden loss of vision or sudden blindness in one or both eyes is an emergency that requires immediate medical evaluation.',
        thirdPartyMessage: 'Sudden loss of vision requires urgent in-person medical evaluation. Call emergency services or go to the nearest emergency eye clinic.',
      },
      {
        category: 'meningismus',
        // TODO: CLINICAL REVIEW REQUIRED — Stiff neck with fever, suspected meningitis
        pattern: /\b(stiff\s+neck\s+.*(fever|high\s+temp\w*)|(fever|high\s+temp\w*)\s+.*stiff\s+neck|neck\s+stiffness\s+.*(fever|high\s+temp\w*)|(fever|high\s+temp\w*)\s+.*neck\s+stiffness)\b/i,
        userMessage: 'A stiff neck accompanied by fever can indicate meningitis or an acute central nervous system infection.',
        thirdPartyMessage: 'A stiff neck paired with fever can indicate acute meningitis or central nervous system infection. Seek immediate emergency evaluation.',
      },
      {
        category: 'head_injury',
        // TODO: CLINICAL REVIEW REQUIRED — Head trauma with repeated vomiting or confusion
        pattern: /\b(head\s+(injury|trauma|hit|blow)|hit\s+(my|the|their)\s+head)\s+.*(vomit\w*|throw\w*\s+up|confus\w*|disorient\w*)\b|\b(vomit\w*|throw\w*\s+up|confus\w*|disorient\w*)\s+.*(head\s+(injury|trauma)|hit\s+(my|the|their)\s+head)\b/i,
        userMessage: 'Head trauma accompanied by repeated vomiting, confusion, or disorientation requires urgent medical evaluation.',
        thirdPartyMessage: 'Head trauma with vomiting, confusion, or loss of consciousness in another person requires immediate emergency medical evaluation.',
      },
      {
        category: 'anaphylaxis',
        // TODO: CLINICAL REVIEW REQUIRED — Severe allergic reaction, airway swelling
        pattern: /\b(throat|tongue|lip(s)?)\s+(is\s+|are\s+|feels?\s+like\s+it'?s\s+)?(swelling|closing(\s+up)?|swollen)\b|\b(swollen\s+(throat|tongue|lips?))\b|\b(severe\s+allergic\s+reaction|anaphylax(is|ic))\b/i,
        userMessage: 'Throat or airway swelling can indicate a severe allergic reaction (anaphylaxis) requiring immediate emergency care.',
        thirdPartyMessage: 'If someone is experiencing throat swelling or an anaphylactic reaction, call local emergency services immediately. If an epinephrine auto-injector (EpiPen) is available and prescribed, assist them in administering it as directed.',
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
 * Evaluates symptoms clause-by-clause with symptom-level (not narrative-level) guards:
 * A negation or historical mention in one clause does NOT suppress a qualifying emergency in another clause.
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

  // 2. Evaluate Acute Medical Emergencies by clause with symptom-level guards
  // Split on punctuation (. ! ? ; : \n), contrast transitions (but, however, yet, although, etc.),
  // or coordinating transitions with explicit temporal shifts (, and today, , and now, etc.)
  const rawClauses = trimmed.split(
    /(?:[.!?;:\n]+|\b(?:but|however|yet|although|though|whereas)\b|,\s*and\s+(?:today|currently|suddenly|at\s+present|now)\b|,\s*today\b)+/i
  );

  for (const clause of rawClauses) {
    const trimmedClause = clause.trim();
    if (trimmedClause.length < 3) continue;

    const isFamilyHistory = isHistoricalFamilyHistory(trimmedClause);
    const isDistantPast = isDistantPastOrSituational(trimmedClause);
    const isThirdParty = isThirdPartyPresentation(trimmedClause);

    for (const rule of ruleSet.medical) {
      if (!rule.pattern.test(trimmedClause)) continue;

      // Symptom-Level Guard 1: Specific negation for this rule category
      if (rule.isNegated && rule.isNegated(trimmedClause)) {
        continue;
      }

      // Symptom-Level Guard 2: Historical family history suppression
      // If the clause is historical family history (e.g. "my grandfather died of a heart attack"), suppress
      if (isFamilyHistory) {
        continue;
      }

      // Symptom-Level Guard 3: Distant past / situational trigger suppression
      // If this specific clause is in the distant past (e.g. "years ago", "last year"), suppress
      if (isDistantPast) {
        continue;
      }

      // Active emergency identified!
      return {
        type: 'medical_emergency',
        category: rule.category,
        userMessage: isThirdParty && rule.thirdPartyMessage ? rule.thirdPartyMessage : rule.userMessage,
        isThirdParty,
      };
    }
  }

  return null;
}

