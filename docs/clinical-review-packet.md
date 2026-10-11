# ManoMed AI — Clinical Review Packet

> **Document Status:** Active Deliverable for Clinical Governance & Supervising Medical Officers  
> **Governance State:** Unreviewed (All Rules Pending Clinical Board Sign-Off)  
> **Repository Baseline:** ManoMed AI Web App  
> **Date Generated:** 2026-10-11  
> **Purpose:** Catalog of every clinical rule, threshold, pattern, patient-facing urgency text, laboratory interval, and translated string flagged with `TODO: CLINICAL REVIEW REQUIRED`.

---

## Executive Summary for Clinical Leadership

ManoMed AI implements software-based clinical decision support (CDS) across three key modalities:
1. **Symptom Triage & Differential Diagnosis** (`/ManoMedai`, `/questionnaire`, `/conditions`)
2. **Laboratory Pathology Explainer** (`/labs`)
3. **Radiograph & Medical Imaging Viewer** (`/imaging`)
4. **Clinical Provider Station** (`/station`)

Following the formal Clinical Governance Review, **safety fixes have been prioritized in Remediation Sprint 1**. All heuristic thresholds, clinical decision boundaries, and triage copy have been cataloged with stable rule IDs, assigned a mandatory `status: unreviewed` attribute, and marked `TODO: CLINICAL REVIEW REQUIRED`. **Nothing in this packet is marked approved.**

---

## Section 1: Red-Flag Patterns & Safety Heuristics

**File:** `src/lib/redFlags.ts`  
**Execution Context:** 100% synchronous client-side evaluation during user typing and prior to submission. Evaluated at symptom/clause level via punctuation and contrastive conjunction splitting, ensuring guards never suppress separate qualifying emergencies. Matched symptom narratives are never logged, persisted, or transmitted to any remote analytics.

### 1.1 Emergency Presentation Rules

| Rule ID | Category | Status | Pattern (RegEx / Logic) | User-Facing Alert Message | Clinician Decision Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`RF-001`** | `acute_coronary` | `status: unreviewed` | `/(crushing\s+(chest\|substernal\|sternal)\|elephant\s+(is\s+)?(sitting\s+on\|on)\s+(a\s+\|the\s+\|my\s+)?chest\|\b(severe\|intense\|unbearable\|crushing)\s+(chest\|substernal\|sternal)\s+(pain\|pressure\|tightness\|heaviness)\b\|\b(chest\|substernal\|sternal)\s+(pain\|pressure\|tightness\|heaviness)\s+(is\s+)?(severe\|crushing\|intense\|unbearable)\b\|chest\s+(pain\|pressure\|tightness\|heaviness\|ache)\s+.*(left\s*arm\|jaw\|neck\|back)\|(pain\|pressure\|tightness)\s+(is\s+)?(radiat\w*\|spread\w*\|shoot\w*\|go\w*(\s+down)?)\s+.*(left\s*arm\|jaw\|neck)\|pain\s+(is\s+)?(going\|shooting\|radiating)\s+down\s+(my\s+)?left\s*arm\|\b(having\|suspect)\s+a\s+heart\s+attack\b)/i` | "Severe or crushing chest pain, pressure, or symptoms radiating to the arm, neck, or jaw can indicate an acute cardiac emergency." | Approve inclusion of isolated crushing chest pain without radiation; approve radiation descriptors (arm, jaw, neck, back). |
| **`RF-002`** | `aortic_dissection` | `status: unreviewed` | `/\b(tearing\|ripping)\s+(pain\|sensation)\s+.*(between\s+(the\s+\|my\s+)?shoulder\s+blades\|in\s+(the\s+\|my\s+)?(back\|chest))\b\|\b(pain\|pressure)\s+between\s+(the\s+\|my\s+)?shoulder\s+blades\s+.*(tearing\|ripping)\b\|\b(tearing\|ripping)\s+(chest\|back)\s+pain\b/i` | "Tearing or ripping pain between the shoulder blades or in the chest can indicate an acute aortic emergency." | Approve wording for interscapular ripping/tearing pain as acute aortic dissection trigger. |
| **`RF-003`** | `thunderclap_headache` | `status: unreviewed` | `/\b(worst\s+headache\s+of\s+my\s+life\|thunderclap\s+headache\|headache\s+.*like\s+a\s+thunderclap\|sudden\s+explosive\s+headache)\b/i` | "A sudden explosive headache (\"worst headache of your life\" or thunderclap onset) can indicate an acute intracranial emergency." | Approve threshold for subarachnoid hemorrhage / intracranial emergency triggers. |
| **`RF-004`** | `syncope_unresponsive` | `status: unreviewed` | `/\b(passed\s+out\|lost\s+consciousness\|loss\s+of\s+consciousness\|unresponsive\|blacked\s+out\|sudden(ly)?\s+fainted\|feeling\s+like\s+i'?m\s+passing\s+out)\b\|\bfainted\b/i` | "Loss of consciousness, fainting, or becoming unresponsive requires urgent in-person medical evaluation." | Approve triggers for acute syncope, unresponsiveness, and blackouts. |
| **`RF-005`** | `acute_abdomen` | `status: unreviewed` | `/\b(rigid\|board[- ]like)\s+abdomen\b\|\bsevere\s+(abdominal\|stomach\|belly)\s+pain\s+.*(fever\|chills)\b\|\b(fever\|chills)\s+.*severe\s+(abdominal\|stomach\|belly)\s+pain\b/i` | "A rigid, board-like abdomen or severe abdominal pain with fever and chills can indicate peritonitis or an acute surgical abdomen." | Approve peritonitis triggers (board-like rigidity, severe pain paired with fever/chills). |
| **`RF-006`** | `overdose_poisoning` | `status: unreviewed` | `/\b(overdos(e\|ed\|ing)\|poison(ed\|ing)?)\b\|\b(took\|swallowed)\s+(a\s+)?(whole\s+bottle\|all\s+(the\|my))\s+(of\s+)?pills?\b\|\b(drank\|swallowed\|ingested)\s+(bleach\|cleaner\|chemical\|poison)\b/i` | "Suspected overdose, poisoning, or chemical ingestion requires immediate emergency medical care or Poison Control contact." | Approve poisoning/overdose triggers and referral to Poison Control / ER. |
| **`RF-007`** | `stroke_fast` | `status: unreviewed` | `/\b(face\s+(is\s+)?droop(ing)?\|facial\s+droop(ing)?)\b\|\b(slurr(ed\|ing)\s+speech\|speech\s+is\s+slurr(ed\|ing)\|loss\s+of\s+speech)\b\|\b(one[- ]sided\|(left\|right)[- ]side(d)?)\s+(weakness\|paralysis\|numbness)\b\|\bcan'?t\s+move\s+(my\s+)?(left\|right)\s+(arm\|leg\|side)\b\|\b(having\|signs?\s+of)\s+a\s+stroke\b/i` | "Sudden one-sided weakness, facial drooping, or speech difficulty can indicate a stroke, which requires immediate medical treatment." | Approve Cincinnati Prehospital Stroke Scale / FAST symptoms coverage. |
| **`RF-008`** | `severe_respiratory` | `status: unreviewed` | `/\b(can'?t\|cannot\|unable\s+to\|struggling\s+to)\s+breathe?\b\|\b(blue\s+(lips\|fingers\|skin\|face)\|(lips\|fingers\|skin\|face)\s+(are\s+\|turning\s+)?blue)\b\|\b(gasping\s+for\s+(air\|breath)\|struggling\s+for\s+air\|suffocating)\b\|\bsevere\s+shortness\s+of\s+breath\b/i` | "Severe difficulty breathing or blue lips can indicate acute oxygen deprivation or respiratory failure." | Approve triggers for cyanosis, gasping, suffocating, and severe dyspnea. |
| **`RF-009`** | `severe_hemorrhage` | `status: unreviewed` | `/\b(bleeding\s+(that\s+)?(won'?t\|doesn'?t\|will\s+not)\s+stop\|can'?t\s+stop\s+(the\s+)?bleeding\|uncontrolled\s+bleeding\|(severe\|massive)\s+hemorrhage\|spurting\s+blood\|(coughing\|vomiting\|throwing)(\s+up)?\s+(blood\|coffee\s*ground))\b/i` | "Uncontrolled bleeding that will not stop or coughing/vomiting blood requires urgent in-person medical evaluation." | Approve triggers for hematemesis, hemoptysis, and uncontrolled external bleeding. |
| **`RF-010`** | `seizure_convulsions` | `status: unreviewed` | `/\b(seizur\w*\|convuls\w*\|shaking\s+uncontrollably\|having\s+a\s+fit)\b/i` | "Active seizures, convulsions, or uncontrollable shaking require emergency medical evaluation." | Approve triggers for active seizures, convulsions, and uncontrollable shaking. |
| **`RF-011`** | `sudden_vision_loss` | `status: unreviewed` | `/\b(sudden(ly)?\s+(lost\|losing\|loss\s+of)?\s*(my\s+)?(vision\|sight)\|sudden(ly)?\s+(can'?t\|cannot)\s+see\|sudden(ly)?\s+blind\|lost\s+vision\s+in\s+(my\s+)?(left\|right\|an?\|either)\s+eye\|curtain\s+(falling\|coming\s+down)\s+over\s+(my\s+)?eye)\b/i` | "Sudden loss of vision or sudden blindness in one or both eyes is an emergency that requires immediate medical evaluation." | Approve acute visual loss triggers (ischemic optic neuropathy, retinal detachment, stroke). |
| **`RF-012`** | `meningismus` | `status: unreviewed` | `/\b(stiff\s+neck\s+.*(fever\|high\s+temp\w*)\|(fever\|high\s+temp\w*)\s+.*stiff\s+neck\|neck\s+stiffness\s+.*(fever\|high\s+temp\w*)\|(fever\|high\s+temp\w*)\s+.*neck\s+stiffness)\b/i` | "A stiff neck accompanied by fever can indicate meningitis or an acute central nervous system infection." | Approve meningeal irritation triggers (nuchal rigidity paired with pyrexia). |
| **`RF-013`** | `head_injury` | `status: unreviewed` | `/\b(head\s+(injury\|trauma\|hit\|blow)\|hit\s+(my\|the\|their)\s+head)\s+.*(vomit\w*\|throw\w*\s+up\|confus\w*\|disorient\w*)\b\|\b(vomit\w*\|throw\w*\s+up\|confus\w*\|disorient\w*)\s+.*(head\s+(injury\|trauma)\|hit\s+(my\|the\|their)\s+head)\b/i` | "Head trauma accompanied by repeated vomiting, confusion, or disorientation requires urgent medical evaluation." | Approve Canadian CT Head Rule red flags (vomiting, confusion following head blow). |
| **`RF-014`** | `anaphylaxis` | `status: unreviewed` | `/\b(throat\|tongue\|lip(s)?)\s+(is\s+\|are\s+\|feels?\s+like\s+it'?s\s+)?(swelling\|closing(\s+up)?\|swollen)\b\|\b(swollen\s+(throat\|tongue\|lips?))\b\|\b(severe\s+allergic\s+reaction\|anaphylax(is\|ic))\b/i` | "Throat or airway swelling can indicate a severe allergic reaction (anaphylaxis) requiring immediate emergency care." | Approve airway swelling, angioedema, and allergic shock triggers. |

### 1.2 Crisis Support & Third-Party Presentation Rules

| Rule ID | Category | Status | Pattern / Target | User-Facing Action | Clinician Decision Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`CR-001`** | `crisis_support` | `status: unreviewed` | `/\b(suicid\w*\|kill\s+myself\|want\s+to\s+die\|ending\s+my\s+life\|end\s+my\s+life\|harm\s+myself\|take\s+my\s+own\s+life\|don'?t\s+want\s+to\s+live\|better\s+off\s+dead)\b/i` | Dedicated supportive crisis banner with jurisdiction-neutral crisis referral (`https://findahelpline.com/`). | Confirm separation of behavioral crisis from physical emergency dispatch. |
| **`GD-001`** | `negation_guard` | `status: unreviewed` | `/\b(no\|not\|never\|denies\|denying\|without\|negative\s+for)\s+([a-z]+\s+)?(symptom)\b/i` | Suppresses trigger only within specific clause; does not veto entire narrative. | Confirm symptom-level negation scope. |
| **`GD-002`** | `family_history_guard`| `status: unreviewed` | `/\b(my\s+)?(dad\|father\|mom\|brother\|etc)\s+(had\|has\|died\|suffered)\b/i` | Suppresses trigger only for family history clause. | Confirm clause boundary isolation. |
| **`GD-003`** | `distant_past_guard` | `status: unreviewed` | `/\b(years\s+ago\|decades\s+ago\|as\s+a\s+child\|when\s+i\s+was\s+young)\b/i` | Suppresses historical report without suppressing current acute complaint. | Confirm chronological threshold. |
| **`GD-004`** | `third_party_presentation`| `status: unreviewed` | Third-party pronouns / relational terms with acute emergency (unresponsive, stroke, overdose, anaphylaxis). | Renders third-party guidance: *"Someone nearby may be in immediate danger. Call your local emergency services now. Stay with them and follow dispatcher instructions."* | Approve third-party bystander emergency guidance. |

---

## Section 2: Likelihood Labels & Unranked Differential Presentation

**File:** `src/lib/clinicalConfig.ts`

Following the governance review, **fixed cutoff thresholds ($\ge 0.70$, $0.35-0.69$, $< 0.35$) and ranking words ("More likely / Possible / Less likely") have been removed from the patient view**. The 0.30 override logic has been eliminated.

| Rule ID | Rule Scope | Status | Implementation | Clinician Decision Required |
| :--- | :--- | :--- | :--- | :--- |
| **`LK-001`** | High-Risk Note Rule | `status: unreviewed` | Any condition with `riskLevel === 'High'` receives: `"Worth ruling out with a doctor"` regardless of likelihood rank. | Approve high-risk condition note wording. |
| **`LK-002`** | Patient View Display | `status: unreviewed` | Heading: *"Possibilities your doctor may consider"* without probability or ranking labels. | Approve unranked patient-facing differential presentation. |
| **`LK-003`** | Clinician View Display| `status: unreviewed` | Numbers retained for clinician review, explicitly labeled: *"Model-estimated likelihood (not calibrated or validated)"*. | Confirm prohibition against describing figures as disease probability. |

---

## Section 3: Triage Text & Universal Safety-Net Framework

**Files:** `src/lib/clinicalConfig.ts`, `src/components/ConditionDisplay.tsx`, `src/lib/clinicalStatuses.ts`

Fixed timeframe claims shown as rules (0–15 minutes, 24–48 hours, 1–2 weeks) have been removed from static UI rules. The model's own estimated timeframe is displayed alongside a **mandatory universal safety-net sentence** across all tiers.

| Rule ID | Triage Tier | Status | Mandatory Safety Text | Clinician Decision Required |
| :--- | :--- | :--- | :--- | :--- |
| **`TR-001`** | `EMERGENCY` | `status: unreviewed` | *"Your symptoms may indicate a medical emergency. Contact your local emergency services now. Do not delay seeking help while using this tool."* | Approve emergency tier directive. |
| **`TR-002`** | `URGENT` | `status: unreviewed` | Model timeframe + recommended action + *"Seek emergency care immediately if symptoms are severe, rapidly worsening, or you develop warning signs."* | Approve urgent tier safety-net combination. |
| **`TR-003`** | `ROUTINE` | `status: unreviewed` | Model timeframe + recommended action + *"Seek emergency care immediately if symptoms are severe, rapidly worsening, or you develop warning signs."* | Approve routine tier safety-net combination. |
| **`TR-004`** | `SELF_CARE` | `status: unreviewed` | *"This does not mean a serious condition has been ruled out."* + universal safety net sentence. | Approve self-care tier caveat. |
| **`NM-001`** | No-Match Rule | `status: unreviewed` | Persistent on symptom form & results: *"No warning was detected, but this tool cannot rule out an emergency. If you are worried, contact your local emergency services or a doctor."* | Approve persistent no-match safety line. |

---

## Section 4: Pediatric Labs & Multi-Layer Laboratory Governance

**Files:** `src/ai/flows/blood-work-flow.ts`, `src/lib/labPlausibilityConfig.ts`, `src/app/labs/page.tsx`

### 4.1 Four Disjoint Laboratory Layers

To guarantee that input plausibility warnings never suppress or conceal clinical alerts, the architecture maintains four distinct, independent layers:
1. **Input Plausibility:** Detects data-entry errors or impossible physiology without suppressing flags.
2. **Reference-Range Flag:** Evaluates value against analyte interval (`LOW`, `NORMAL`, `HIGH`).
3. **Critical-Result Rule:** Independent alert triggers for dangerous biological extremes.
4. **Needs Human Review:** Compulsory human clinician review requirement.

### 4.2 Pediatric Guardrail Rule

| Rule ID | Parameter | Status | Policy | Clinician Decision Required |
| :--- | :--- | :--- | :--- | :--- |
| **`PED-001`** | Pediatric / Unspecified Age Gate | `status: unreviewed` | If age $< 18$, blank `""`, or invalid/non-numeric: adult LOW/HIGH/CRITICAL classifications and adult critical alerts are **strictly suppressed**. Values are preserved, labeled `"Pediatric - Age-Specific"`, and require clinician review. | Approve adult interpretation withholding policy. |

### 4.3 Laboratory Analyte Thresholds

| Rule ID | Analyte | Unit | Status | Physiological Range | Plausibility Range | Clinician Decision Required |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`LAB-001`** | Potassium | mmol/L | `status: unreviewed` | 3.5 – 5.1 | 1.0 – 12.0 | Approve reference range and plausibility bounds. |
| **`LAB-002`** | Fasting Glucose | mg/dL | `status: unreviewed` | 70 – 99 | 10 – 1500 | Approve conventional unit bounds. |
| **`LAB-003`** | Fasting Glucose | mmol/L | `status: unreviewed` | 3.9 – 5.5 | 0.5 – 80.0 | Approve SI unit bounds. |
| **`LAB-004`** | Hemoglobin | g/dL | `status: unreviewed` | 12.0 – 17.5 | 1.0 – 28.0 | Approve reference interval. |
| **`LAB-005`** | WBC | $10^3/\mu\text{L}$ | `status: unreviewed` | 4.0 – 11.0 | 0.1 – 350.0 | Approve leukocyte bounds. |
| **`LAB-006`** | Platelets | $10^3/\mu\text{L}$ | `status: unreviewed` | 150 – 450 | 1 – 3000 | Approve thrombocyte bounds. |
| **`LAB-007`** | Serum Creatinine | mg/dL | `status: unreviewed` | 0.7 – 1.3 | 0.1 – 35.0 | Approve conventional creatinine bounds. |
| **`LAB-008`** | Serum Creatinine | $\mu\text{mol/L}$ | `status: unreviewed` | 60 – 115 | 10 – 3100 | Approve SI creatinine bounds. |
| **`LAB-009`** | Hematocrit | % | `status: unreviewed` | 37.0 – 48.0 | 5.0 – 80.0 | Approve hematocrit bounds. |
| **`LAB-010`** | MCV | fL | `status: unreviewed` | 80.0 – 100.0 | 40.0 – 160.0 | Approve red cell volume interval. |
| **`LAB-011`** | Serum Ferritin | ng/mL | `status: unreviewed` | 15 – 150 | 1 – 50000 | Approve ferritin bounds. |
| **`LAB-012`** | Neutrophils | % | `status: unreviewed` | 40 – 70 | 0 – 100 | Approve differential percentage. |
| **`LAB-013`** | C-Reactive Protein | mg/L | `status: unreviewed` | $< 3.0$ | 0.0 – 800.0 | Approve inflammatory cut-off. |
| **`LAB-014`** | hs-Troponin I | ng/mL | `status: unreviewed` | Assay-specific | 0.0 – 500.0 | Labeled: *"assay-specific; limit must be confirmed with your lab"*. Approve elimination of universal 0.04. |
| **`LAB-015`** | HbA1c | % | `status: unreviewed` | $< 5.7$ | 2.0 – 25.0 | Approve glycation bounds. |
| **`LAB-016`** | BUN | mg/dL | `status: unreviewed` | 7 – 20 | 1 – 300 | Approve urea nitrogen bounds. |
| **`LAB-017`** | eGFR | $\text{mL/min}$ | `status: unreviewed` | $> 60$ | 1 – 250 | Approve filtration rate cut-off. |
| **`LAB-018`** | ALT | U/L | `status: unreviewed` | 7 – 56 | 1 – 25000 | Approve transaminase bounds. |
| **`LAB-019`** | AST | U/L | `status: unreviewed` | 10 – 40 | 1 – 25000 | Approve transaminase bounds. |
| **`LAB-020`** | Total Bilirubin | mg/dL | `status: unreviewed` | 0.2 – 1.2 | 0.05 – 90.0 | Approve bilirubin bounds. |

---

## Section 5: Clinical Status & Flag Mapping Vocabulary

**File:** `src/lib/clinicalStatuses.ts`

| Rule ID | Incoming Status | Canonical Tier/Flag | Status | UI Label | Clinician Decision Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`STAT-001`** | `CRITICAL_ALERT` | `CRITICAL` | `status: unreviewed` | **CRITICAL** | Approve critical flag mapping. |
| **`STAT-002`** | `HIGH` / `ELEVATED` | `HIGH` | `status: unreviewed` | **HIGH** | Approve high flag mapping. |
| **`STAT-003`** | `LOW` | `LOW` | `status: unreviewed` | **LOW** | Approve low flag mapping. |
| **`STAT-004`** | `NORMAL` (Labs) | `NORMAL` | `status: unreviewed` | **NORMAL** | Approve normal lab flag mapping. |
| **`STAT-005`** | `EMERGENCY` | `EMERGENCY` | `status: unreviewed` | **EMERGENCY** | Approve triage emergency mapping. |
| **`STAT-006`** | `URGENT` | `URGENT` | `status: unreviewed` | **URGENT** | Approve triage urgent mapping. |
| **`STAT-007`** | `ROUTINE` | `ROUTINE` | `status: unreviewed` | **ROUTINE** | Approve routine outpatient mapping. |
| **`STAT-008`** | `SELF_CARE` | `NORMAL` | `status: unreviewed` | **SELF-CARE / OPTIMAL** | Approve self-care mapping. |

---

## Section 6: Imaging & Clinical Station Governance Rules

**Files:** `src/app/imaging/page.tsx`, `src/app/station/page.tsx`

| Rule ID | Feature Area | Status | Governance Directive | Clinician Decision Required |
| :--- | :--- | :--- | :--- | :--- |
| **`IMG-001`** | Radiograph Viewer | `status: unreviewed` | Visible notice on AI findings & recommendations: *"AI-generated, not clinically validated. Requires review by a qualified clinician."* | Approve radiology AI disclaimer. |
| **`IMG-002`** | Diagnostic Accuracy | `status: unreviewed` | Prohibits any claims of diagnostic accuracy across imaging inputs and prompts. | Approve prohibition of accuracy claims. |
| **`STN-001`** | Provider Station | `status: unreviewed` | Persistent clinical advisory banner on station queue, SOAP note inspection, and differential views: *"AI-generated, not clinically validated. Requires review by a qualified clinician."* | Approve clinician dashboard disclaimer. |

---

## Section 7: Localization & Translation Review Strings

**File:** `src/context/language-context.tsx`

| Rule ID | Language | Key | Status | Text String | Clinician Decision Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`LOC-001`** | Arabic (`ar`) | `noMatchSafetyNotice` | `status: unreviewed` | `"لم يتم اكتشاف أي علامات تحذيرية، ولكن هذه الأداة لا يمكنها استبعاد الحالات الطارئة. إذا كنت قلقاً، يرجى الاتصال بخدمات الطوارئ المحلية أو بالطبيب فوراً."` | Verify dialect-neutral MSA emergency safety comprehension. |
| **`LOC-002`** | Spanish (`es`) | `noMatchSafetyNotice` | `status: unreviewed` | `"No se detectaron signos de alarma, pero esta herramienta no puede descartar una emergencia. Si le preocupa su salud, contacte de inmediato a los servicios de emergencias locales o a un médico."` | Verify Spanish medical safety phrasing. |
| **`LOC-003`** | Chinese (`zh`)| `noMatchSafetyNotice` | `status: unreviewed` | `"未检测到紧急预警信号，但本工具无法排除急危重症可能。如果您感到担忧，请立即联系当地急救部门或就医。"` | Verify Chinese emergency safety comprehension. |
| **`LOC-004`** | French (`fr`) | `noMatchSafetyNotice` | `status: unreviewed` | `"Aucun signal d'alarme n'a été détecté, mais cet outil ne peut pas exclure une urgence médicale. Si vous êtes inquiet, contactez immédiatement les services d'urgence locaux ou un médecin."` | Verify French emergency safety comprehension. |
| **`LOC-005`** | English (`en`)| `noMatchSafetyNotice` | `status: unreviewed` | `"No warning was detected, but this tool cannot rule out an emergency. If you are worried, contact your local emergency services or a doctor."` | Approve English baseline safety notice. |
| **`LOC-006`** | Arabic (`ar`) | `persistentEmergencyNotice` | `status: unreviewed` | `"إذا كنت تعتقد أن هذه حالة طارئة، يرجى الاتصال بخدمات الطوارئ المحلية فوراً."` | Approve persistent notice. |
| **`LOC-007`** | Spanish (`es`) | `persistentEmergencyNotice` | `status: unreviewed` | `"Si cree que se trata de una emergencia médica, comuníquese de inmediato con los servicios de emergencia locales."` | Approve persistent notice. |
| **`LOC-008`** | Chinese (`zh`)| `persistentEmergencyNotice` | `status: unreviewed` | `"如果您认为这是紧急情况，请立即联系当地急救部门。"` | Approve persistent notice. |
| **`LOC-009`** | French (`fr`) | `persistentEmergencyNotice` | `status: unreviewed` | `"Si vous pensez qu'il s'agit d'une urgence, contactez immédiatement les services d'urgence locaux."` | Approve persistent notice. |
| **`LOC-010`** | English (`en`)| `persistentEmergencyNotice` | `status: unreviewed` | `"If you believe this is a medical emergency, please contact your local emergency services immediately."` | Approve persistent notice. |

---

## Section 8: Clinical Governance Review Open Items & Remediation Log

This section details all items flagged during the initial Clinical Governance Review and their implementation state following Remediation Sprint 1:

| Governance Finding | Status | Remediation Implementation | Outstanding Clinical Review Item |
| :--- | :--- | :--- | :--- |
| **1. Unsubstantiated Clinical Validation Claims** | `status: unreviewed` | Removed claims of clinical validation, accuracy, and calibrated inference across UI, about page, and layout. Replaced with uncalibrated model estimates and structured reasoning notices. | Formal prospective clinical validation study required before making any clinical performance claims. |
| **2. Red-Flag Guards Narrative-Level Veto** | `status: unreviewed` | Refactored `checkRedFlags` in `src/lib/redFlags.ts` to evaluate at clause/symptom level via punctuation and contrastive conjunctions (`but`, `however`, `yet`, `although`, `and now`). Added third-party emergency detection. | Clinical review of clause-splitting conjunction list and third-party guidance copy. |
| **3. Likelihood Cutoffs & 0.30 Override** | `status: unreviewed` | Deleted rigid cutoffs ($\ge 0.70$, $0.35-0.69$, $< 0.35$) and ranking words ("More likely / Possible") from patient view. Removed 0.30 override logic. Replaced with unranked "Possibilities your doctor may consider" and high-risk note. | Review of patient comprehension for unranked differential lists. |
| **4. Rigid Triage Timeframe Rules** | `status: unreviewed` | Removed fixed timeframe claims (0–15m, 24–48h, 1–2w) presented as rules. Switched to model's timeframe + universal safety-net sentence on every tier. Added explicit emergency directive and self-care caveat. | Board review of safety-net sentence and self-care caveat wording. |
| **5. Pediatric Adult Range Contamination** | `status: unreviewed` | Implemented `isPediatricOrUnspecifiedAge` in `blood-work-flow.ts`. Strictly suppresses adult LOW/HIGH/CRITICAL classifications, adult critical alerts, and adult reference intervals for patients $< 18$, blank age, or invalid age. | Pediatric reference intervals must be established and verified by board-certified pediatricians. |
| **6. Overwritten / Conflated Lab Layers** | `status: unreviewed` | Separated 4 distinct layers: input plausibility, reference-range flag, critical-result rule, needs human review. Plausibility never suppresses flags. Original `rawSourceFlag` and `rawSourceStatus` preserved without overwrite. Troponin labeled assay-specific. | Clinical laboratory director validation of analyte plausibility boundaries. |
| **7. Hardcoded US-Centric Crisis Contacts** | `status: unreviewed` | Made crisis resources config-driven via `emergencyConfig.ts`. Replaced hardcoded `911` / `988` with jurisdiction-neutral references and international crisis directory (`findahelpline.com`). | Country-specific emergency dispatch configuration for deployed jurisdictions. |
| **8. Unlabeled AI Imaging & Station Recommendations** | `status: unreviewed` | Added visible labels on imaging findings and station recommendations: *"AI-generated, not clinically validated. Requires review by a qualified clinician."* Prohibited diagnostic accuracy claims. | Clinical protocol for PACS integration and clinician review workflows. |
| **9. Privacy & Storage Security Overclaims** | `status: unreviewed` | Corrected "encrypted browser storage" to "stored locally on your device in your browser's private storage (localStorage)". Softened "GDPR & HIPAA Standards" badge to "Privacy & Data Protection Principles". | Formal HIPAA Business Associate Agreements (BAAs) and GDPR DPIA required for enterprise clinical deployment. |
| **10. Multilingual Translation Validation** | `status: unreviewed` | Added `noMatchSafetyNotice` across all 5 languages; marked all non-English clinical strings `status: unreviewed`. | Formal translation review by certified medical translators in Arabic, Spanish, Chinese, and French. |

---

## Section 9: Sign-Off & Clinical Authorization Form

*To be completed by Supervising Medical Director / Chief Medical Officer:*

| Review Area | Reviewer Name & Title | Professional License # | Status (Approved / Revisions Requested) | Date |
| :--- | :--- | :--- | :--- | :--- |
| **Red-Flag Heuristics & Negation (`RF-*`, `GD-*`)** | | | [ ] Approved  [ ] Revisions Needed | |
| **Likelihood Wording & Thresholds (`LK-*`)** | | | [ ] Approved  [ ] Revisions Needed | |
| **Patient Triage Text & Crisis Flow (`TR-*`, `CR-*`)** | | | [ ] Approved  [ ] Revisions Needed | |
| **Pediatric Gating & Lab Intervals (`PED-*`, `LAB-*`)** | | | [ ] Approved  [ ] Revisions Needed | |
| **Status Mapping & Disjoint Layers (`STAT-*`)** | | | [ ] Approved  [ ] Revisions Needed | |
| **Multilingual Localization (`LOC-*`)** | | | [ ] Approved  [ ] Revisions Needed | |
| **Imaging & Provider Station Governance (`IMG-*`, `STN-*`)** | | | [ ] Approved  [ ] Revisions Needed | |

**Physician Comments & Mandatory Changes:**  
`__________________________________________________________________________________________________________________`  
`__________________________________________________________________________________________________________________`  
`__________________________________________________________________________________________________________________`
