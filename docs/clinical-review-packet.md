# ManoMed AI — Clinical Review Packet

> **Document Status:** Active Deliverable for Clinical Governance & Supervising Medical Officers  
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

To guarantee patient safety, comply with healthcare regulatory standards (including FDA CDS guidance and WCAG 2.2 AA), and eliminate unverifiable claims, all heuristic thresholds and clinical decision boundaries in the codebase have been tagged with `TODO: CLINICAL REVIEW REQUIRED`. This document collects each item, its source file, exact threshold or pattern, and the specific decision required from a board-certified clinician.

---

## Section 1: Red-Flag Patterns & Safety Heuristics

**File:** `src/lib/redFlags.ts`  
**Execution Context:** 100% synchronous client-side evaluation during user typing and immediately prior to form submission. Matched symptom narratives are never logged, persisted, or transmitted to any remote analytics.

### 1.1 Emergency Presentation Patterns

| Category ID | Pattern (RegEx / Logic) | User-Facing Alert Message | Clinician Decision Required |
| :--- | :--- | :--- | :--- |
| **`acute_coronary`** | `/(crushing\s+(chest\|substernal\|sternal)\|elephant\s+(is\s+)?(sitting\s+on\|on)\s+(a\s+\|the\s+\|my\s+)?chest\|\b(severe\|intense\|unbearable\|crushing)\s+(chest\|substernal\|sternal)\s+(pain\|pressure\|tightness\|heaviness)\b\|\b(chest\|substernal\|sternal)\s+(pain\|pressure\|tightness\|heaviness)\s+(is\s+)?(severe\|crushing\|intense\|unbearable)\b\|chest\s+(pain\|pressure\|tightness\|heaviness\|ache)\s+.*(left\s*arm\|jaw\|neck\|back)\|(pain\|pressure\|tightness)\s+(is\s+)?(radiat\w*\|spread\w*\|shoot\w*\|go\w*(\s+down)?)\s+.*(left\s*arm\|jaw\|neck)\|pain\s+(is\s+)?(going\|shooting\|radiating)\s+down\s+(my\s+)?left\s*arm\|\b(having\|suspect)\s+a\s+heart\s+attack\b)/i` | "Severe or crushing chest pain, pressure, or symptoms radiating to the arm, neck, or jaw can indicate an acute cardiac emergency." | Approve inclusion of isolated crushing chest pain without radiation; approve radiation descriptors (arm, jaw, neck, back). |
| **`aortic_dissection`** | `/\b(tearing\|ripping)\s+(pain\|sensation)\s+.*(between\s+(the\s+\|my\s+)?shoulder\s+blades\|in\s+(the\s+\|my\s+)?(back\|chest))\b\|\b(pain\|pressure)\s+between\s+(the\s+\|my\s+)?shoulder\s+blades\s+.*(tearing\|ripping)\b\|\b(tearing\|ripping)\s+(chest\|back)\s+pain\b/i` | "Tearing or ripping pain between the shoulder blades or in the chest can indicate an acute aortic emergency." | Approve wording for interscapular ripping/tearing pain as acute aortic dissection trigger. |
| **`thunderclap_headache`** | `/\b(worst\s+headache\s+of\s+my\s+life\|thunderclap\s+headache\|headache\s+.*like\s+a\s+thunderclap\|sudden\s+explosive\s+headache)\b/i` | "A sudden explosive headache (\"worst headache of your life\" or thunderclap onset) can indicate an acute intracranial emergency." | Approve threshold for subarachnoid hemorrhage / intracranial emergency triggers. |
| **`syncope_unresponsive`** | `/\b(passed\s+out\|lost\s+consciousness\|loss\s+of\s+consciousness\|unresponsive\|blacked\s+out\|sudden(ly)?\s+fainted\|feeling\s+like\s+i'?m\s+passing\s+out)\b\|\bfainted\b/i` | "Loss of consciousness, fainting, or becoming unresponsive requires urgent in-person medical evaluation." | Approve triggers for acute syncope, unresponsiveness, and blackouts. |
| **`acute_abdomen`** | `/\b(rigid\|board[- ]like)\s+abdomen\b\|\bsevere\s+(abdominal\|stomach\|belly)\s+pain\s+.*(fever\|chills)\b\|\b(fever\|chills)\s+.*severe\s+(abdominal\|stomach\|belly)\s+pain\b/i` | "A rigid, board-like abdomen or severe abdominal pain with fever and chills can indicate peritonitis or an acute surgical abdomen." | Approve peritonitis triggers (board-like rigidity, severe pain paired with fever/chills). |
| **`overdose_poisoning`** | `/\b(overdos(e\|ed\|ing)\|poison(ed\|ing)?)\b\|\b(took\|swallowed)\s+(a\s+)?(whole\s+bottle\|all\s+(the\|my))\s+(of\s+)?pills?\b\|\b(drank\|swallowed\|ingested)\s+(bleach\|cleaner\|chemical\|poison)\b/i` | "Suspected overdose, poisoning, or chemical ingestion requires immediate emergency medical care or Poison Control contact." | Approve poisoning/overdose triggers and referral to Poison Control / ER. |
| **`stroke_fast`** | `/\b(face\s+(is\s+)?droop(ing)?\|facial\s+droop(ing)?)\b\|\b(slurr(ed\|ing)\s+speech\|speech\s+is\s+slurr(ed\|ing)\|loss\s+of\s+speech)\b\|\b(one[- ]sided\|(left\|right)[- ]side(d)?)\s+(weakness\|paralysis\|numbness)\b\|\bcan'?t\s+move\s+(my\s+)?(left\|right)\s+(arm\|leg\|side)\b\|\b(having\|signs?\s+of)\s+a\s+stroke\b/i` | "Sudden one-sided weakness, facial drooping, or speech difficulty can indicate a stroke, which requires immediate medical treatment." | Approve Cincinnati Prehospital Stroke Scale / FAST symptoms coverage. |
| **`severe_respiratory`** | `/\b(can'?t\|cannot\|unable\s+to\|struggling\s+to)\s+breathe?\b\|\b(blue\s+(lips\|fingers\|skin\|face)\|(lips\|fingers\|skin\|face)\s+(are\s+\|turning\s+)?blue)\b\|\b(gasping\s+for\s+(air\|breath)\|struggling\s+for\s+air\|suffocating)\b\|\bsevere\s+shortness\s+of\s+breath\b/i` | "Severe difficulty breathing or blue lips can indicate acute oxygen deprivation or respiratory failure." | Approve triggers for cyanosis, gasping, suffocating, and severe dyspnea. |
| **`severe_hemorrhage`** | `/\b(bleeding\s+(that\s+)?(won'?t\|doesn'?t\|will\s+not)\s+stop\|can'?t\s+stop\s+(the\s+)?bleeding\|uncontrolled\s+bleeding\|(severe\|massive)\s+hemorrhage\|spurting\s+blood\|(coughing\|vomiting\|throwing)(\s+up)?\s+(blood\|coffee\s*ground))\b/i` | "Uncontrolled bleeding that will not stop or coughing/vomiting blood requires urgent in-person medical evaluation." | Approve triggers for hematemesis, hemoptysis, and uncontrolled external bleeding. |
| **`seizure_convulsions`** | `/\b(seizur\w*\|convuls\w*\|shaking\s+uncontrollably\|having\s+a\s+fit)\b/i` | "Active seizures, convulsions, or uncontrollable shaking require emergency medical evaluation." | Approve triggers for active seizures, convulsions, and uncontrollable shaking. |
| **`sudden_vision_loss`** | `/\b(sudden(ly)?\s+(lost\|losing\|loss\s+of)?\s*(my\s+)?(vision\|sight)\|sudden(ly)?\s+(can'?t\|cannot)\s+see\|sudden(ly)?\s+blind\|lost\s+vision\s+in\s+(my\s+)?(left\|right\|an?\|either)\s+eye\|curtain\s+(falling\|coming\s+down)\s+over\s+(my\s+)?eye)\b/i` | "Sudden loss of vision or sudden blindness in one or both eyes is an emergency that requires immediate medical evaluation." | Approve acute visual loss triggers (ischemic optic neuropathy, retinal detachment, stroke). |
| **`meningismus`** | `/\b(stiff\s+neck\s+.*(fever\|high\s+temp\w*)\|(fever\|high\s+temp\w*)\s+.*stiff\s+neck\|neck\s+stiffness\s+.*(fever\|high\s+temp\w*)\|(fever\|high\s+temp\w*)\s+.*neck\s+stiffness)\b/i` | "A stiff neck accompanied by fever can indicate meningitis or an acute central nervous system infection." | Approve meningeal irritation triggers (nuchal rigidity paired with pyrexia). |
| **`head_injury`** | `/\b(head\s+(injury\|trauma\|hit\|blow)\|hit\s+(my\|the\|their)\s+head)\s+.*(vomit\w*\|throw\w*\s+up\|confus\w*\|disorient\w*)\b\|\b(vomit\w*\|throw\w*\s+up\|confus\w*\|disorient\w*)\s+.*(head\s+(injury\|trauma)\|hit\s+(my\|the\|their)\s+head)\b/i` | "Head trauma accompanied by repeated vomiting, confusion, or disorientation requires urgent medical evaluation." | Approve Canadian CT Head Rule red flags (vomiting, confusion following head blow). |
| **`anaphylaxis`** | `/\b(throat\|tongue\|lip(s)?)\s+(is\s+\|are\s+\|feels?\s+like\s+it'?s\s+)?(swelling\|closing(\s+up)?\|swollen)\b\|\b(swollen\s+(throat\|tongue\|lips?))\b\|\b(severe\s+allergic\s+reaction\|anaphylax(is\|ic))\b/i` | "Throat or airway swelling can indicate a severe allergic reaction (anaphylaxis) requiring immediate emergency care." | Approve airway swelling, angioedema, and allergic shock triggers. |

### 1.2 Crisis Support & Self-Harm Detection
- **Pattern:** `/\b(suicid\w*|kill\s+myself|want\s+to\s+die|ending\s+my\s+life|end\s+my\s+life|harm\s+myself|take\s+my\s+own\s+life|don'?t\s+want\s+to\s+live|better\s+off\s+dead)\b/i`
- **User-Facing Copy:** "If you or someone you know is going through a tough time or having thoughts of self-harm, please know that confidential support is available right now."
- **Contacts:** 988 Suicide & Crisis Lifeline (call/text 988), Crisis Text Line (text HOME to 741741), The Trevor Project (1-866-488-7386).
- **Clinician Decision Required:** Confirm protocol separation of behavioral crisis from general physical emergency medical callouts; confirm supportive copy tone.

### 1.3 False-Positive Heuristics (`isGuarded`)
- **Negation Guard:** `/\b(no|not|never|denies|denying|without|negative\s+for)\s+([a-z]+\s+)?(chest\s+pain|chest\s+pressure|headache|faint\w*|loss\s+of\s+consciousness|shortness\s+of\s+breath|difficulty\s+breathing|vomit\w*\s+blood)\b/i`
- **Family History Guard:** `/\b(my\s+)?(dad|father|mom|mother|grandfather|grandpa|grandmother|grandma|brother|sister|uncle|aunt|cousin|parent)\s+(had|has|died|suffered|was\s+diagnosed|survived)\b/i`
- **Distant Past / Situational Guard:** `/\b(years\s+ago|decades\s+ago|as\s+a\s+child|when\s+i\s+was\s+(young|little|a\s+kid)|at\s+the\s+sight\s+of\s+blood)\b/i`
- **Clinician Decision Required:** Approve 3-layer guard design to prevent unnecessary patient alarm while allowing acute current-clause complaints to trigger.

---

## Section 2: Likelihood Thresholds & Qualitative Clinical Language

**File:** `src/lib/clinicalConfig.ts`

### 2.1 Pre-Test Likelihood Categorization
To prevent false precision and patient anxiety from statistical outputs (e.g. "87% likelihood"), numerical probabilities generated by LLM analysis are mapped to qualitative tiers:

| Numeric Range | Doctor / Clinician View | Patient / Family View | Clinical Description |
| :--- | :--- | :--- | :--- |
| **$\ge 0.70$** | High Pre-Test Probability | **"More Likely"** | Findings strongly align with clinical presentation and history. |
| **$0.35 - 0.69$** | Moderate Differential | **"Possible / To Consider"** | Plausible differential diagnosis warranting clinical consideration. |
| **$< 0.35$** | Lower Probability Differential | **"Less Likely"** | Secondary differential diagnosis with lower pre-test likelihood. |

**Clinician Decision Required:**
1. Approve likelihood cutoffs ($\ge 0.70$, $0.35-0.69$, $< 0.35$).
2. Confirm policy of displaying qualitative terms ("More Likely", "Possible") to patients and restricting percentage figures to the Doctor view.
3. High-risk condition override: If an identified condition has severity `riskLevel === 'High'` and `likelihood >= 0.30`, it is highlighted for clinical attention regardless of position. Approve this clinical safety override rule.

---

## Section 3: Patient-Facing Clinical Text & Urgency Labels

**Files:** `src/lib/clinicalConfig.ts`, `src/lib/clinicalStatuses.ts`, `src/lib/emergencyConfig.ts`, `src/components/SymptomInputForm.tsx`

### 3.1 4-Tier Triage Urgency Guidance

| Triage Tier | Actionable Patient Guidance | Target Clinical Timeframe |
| :--- | :--- | :--- |
| **EMERGENCY** | "Immediate emergency medical evaluation is recommended. Call your local emergency services or proceed immediately to the nearest Emergency Department." | Immediate (0–15 minutes) |
| **URGENT** | "Prompt medical evaluation by a licensed physician is advised. Please visit an urgent care center or contact your physician today." | Prompt (Within 24–48 hours) |
| **ROUTINE** | "Non-urgent presentation. Schedule an outpatient appointment with your primary care clinician for routine evaluation." | Outpatient (Within 1–2 weeks) |
| **SELF_CARE / NORMAL** | "Supportive home measures and symptom monitoring. If symptoms worsen, new symptoms appear, or you feel concerned, seek professional medical evaluation." | Self-monitoring |

**Clinician Decision Required:**
- Approve timeframe and escalation guidance wording for each tier.
- Confirm fallback wording when emergency telephone number is unconfigured: `"your local emergency number"` / `"contact your local emergency services"`.

---

## Section 4: Laboratory Reference Intervals & Plausibility Ranges

**File:** `src/lib/labPlausibilityConfig.ts`  
**Origin Classification:**
- **From Existing Presets:** Sourced from existing presets in `blood-work-flow.ts` and `labs/page.tsx`.
- **Newly Added by Me:** Sourced from standard clinical reference texts (e.g. Tietz Textbook of Clinical Chemistry). Marked `TODO: CLINICAL REVIEW REQUIRED`.

| Analyte | Unit | Origin | Physiological Reference Range | Plausibility Validation Range | Clinician Decision Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Potassium** | mmol/L | From existing presets | 3.5 – 5.1 | 1.0 – 12.0 | Approve reference range and flag threshold (e.g. 42 mmol/L data-entry error). |
| **Fasting Glucose** | mg/dL | From existing presets | 70 – 99 | 10 – 1500 | Approve mg/dL reference and plausibility bounds. |
| **Fasting Glucose** | mmol/L | **Newly added by me** | 3.9 – 5.5 | 0.5 – 80.0 | **Approve mmol/L reference interval and plausibility bounds.** |
| **Hemoglobin** | g/dL | From existing presets | 12.0 – 17.5 | 1.0 – 28.0 | Approve reference range and plausibility bounds. |
| **WBC** | $10^3/\mu\text{L}$ | From existing presets | 4.0 – 11.0 | 0.1 – 350.0 | Approve leukocytosis/leukopenia bounds. |
| **Platelets** | $10^3/\mu\text{L}$ | From existing presets | 150 – 450 | 1 – 3000 | Approve thrombocyte bounds. |
| **Serum Creatinine** | mg/dL | From existing presets | 0.7 – 1.3 | 0.1 – 35.0 | Approve mg/dL reference interval and plausibility bounds. |
| **Serum Creatinine** | $\mu\text{mol/L}$ | **Newly added by me** | 60 – 115 | 10 – 3100 | **Approve $\mu\text{mol/L}$ reference interval and plausibility bounds.** |
| **Hematocrit** | % | From existing presets | 37.0 – 48.0 | 5.0 – 80.0 | Approve hematocrit percentage bounds. |
| **MCV** | fL | From existing presets | 80.0 – 100.0 | 40.0 – 160.0 | Approve erythrocyte volume bounds. |
| **Serum Ferritin** | ng/mL | From existing presets | 15 – 150 | 1 – 50000 | Approve ferritin bounds. |
| **Neutrophils** | % | From existing presets | 40 – 70 | 0 – 100 | Approve differential percentage bounds. |
| **C-Reactive Protein** | mg/L | From existing presets | $< 3.0$ | 0.0 – 800.0 | Approve inflammatory marker bounds. |
| **hs-Troponin I** | ng/mL | From existing presets | $< 0.04$ | 0.0 – 500.0 | Approve one-sided upper limit threshold ($< 0.04$). |
| **HbA1c** | % | From existing presets | $< 5.7$ | 2.0 – 25.0 | Approve glycation percentage bounds. |
| **Blood Urea Nitrogen**| mg/dL | From existing presets | 7 – 20 | 1 – 300 | Approve BUN bounds. |
| **eGFR** | $\text{mL/min/1.73m}^2$| From existing presets | $> 60$ | 1 – 250 | Approve one-sided lower limit threshold ($> 60$). |
| **ALT** | U/L | **Newly added by me** | 7 – 56 | 1 – 25000 | **Approve transaminase reference interval and plausibility bounds.** |
| **AST** | U/L | **Newly added by me** | 10 – 40 | 1 – 25000 | **Approve transaminase reference interval and plausibility bounds.** |
| **Total Bilirubin** | mg/dL | **Newly added by me** | 0.2 – 1.2 | 0.05 – 90.0 | **Approve bilirubin reference interval and plausibility bounds.** |
| **Albumin** | g/dL | **Newly added by me** | 3.5 – 5.0 | 0.5 – 8.0 | **Approve serum albumin reference interval and plausibility bounds.** |

### 4.2 Pediatric Population Policy
- **Current App Policy:** ManoMed AI displays reference ranges calibrated for adult populations (ages $\ge 18$).
- **Visible Notice:** Displayed on `/labs` and on all generated PDF reports: `"Reference ranges shown are for adults."`
- **Pediatric Guardrail:** If an entered age is under 18, the system displays a prominent caution:
  > *"Patient age is under 18. Reference ranges and automated interpretations shown are calibrated for adults. Please interpret all pediatric laboratory results directly with a qualified pediatric clinician."*
- **Clinician Decision Required:** Confirm adult-only scope for automated reference intervals and approval of pediatric cautionary messaging until age-stratified pediatric intervals are clinically validated.

---

## Section 5: Clinical Status & Flag Mapping Vocabulary

**File:** `src/lib/clinicalStatuses.ts`

### 5.1 Strict Separation of Lab Flags vs Triage Urgency
In accordance with clinical safety principles, analyte test flags (`LOW`, `NORMAL`, `HIGH`, `CRITICAL`) are strictly segregated from triage prioritization (`EMERGENCY`, `URGENT`, `ROUTINE`, `NORMAL`). A lab test is never labeled "EMERGENCY", and care triage is never labeled "HIGH".

```
                          ┌───────────────────────────┐
                          │  CLINICAL VOCABULARY     │
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┴───────────────────────────┐
           ▼                                                        ▼
┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│     LABORATORY ANALYTE FLAGS    │      │     PATIENT CARE TRIAGE         │
│     (Deviation from Interval)   │      │     (Care Action Prioritization)│
├─────────────────────────────────┤      ├─────────────────────────────────┤
│ • CRITICAL / CRITICAL HIGH/LOW  │      │ • EMERGENCY                     │
│ • HIGH                          │      │ • URGENT                        │
│ • LOW                           │      │ • ROUTINE                       │
│ • NORMAL                        │      │ • NORMAL / SELF-CARE            │
└─────────────────────────────────┘      └─────────────────────────────────┘
```

### 5.2 Status Normalization Mapping Table

| Raw Incoming Status | Normalized Category | Canonical Tier/Flag | UI Label | Visual Token & Color | WCAG Contrast Ratio | Clinician Decision Required |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CRITICAL_ALERT` (Labs) | Lab Flag | `CRITICAL` | **CRITICAL** | Red (`bg-red-100 text-red-900`) | Light: 8.20:1 / Dark: 11.88:1 | Approve lab critical alert mapping. |
| `HIGH` / `ELEVATED` (Labs) | Lab Flag | `HIGH` | **HIGH** | Amber (`bg-amber-100 text-amber-950`) | Light: 13.45:1 / Dark: 12.98:1 | Approve high lab flag mapping. |
| `LOW` (Labs) | Lab Flag | `LOW` | **LOW** | Amber (`bg-amber-100 text-amber-950`) | Light: 13.45:1 / Dark: 12.98:1 | Approve low lab flag mapping. |
| `NORMAL` (Labs) | Lab Flag | `NORMAL` | **NORMAL** | Emerald (`bg-emerald-100 text-emerald-950`) | Light: 13.36:1 / Dark: 12.73:1 | Approve normal lab flag mapping. |
| `EMERGENCY` (Triage/Imaging) | Triage | `EMERGENCY` | **EMERGENCY** | Red (`bg-red-100 text-red-900`) | Light: 8.20:1 / Dark: 11.88:1 | Approve triage emergency mapping. |
| `URGENT` / `ELEVATED_RISK` | Triage | `URGENT` | **URGENT** | Amber (`bg-amber-100 text-amber-950`) | Light: 13.45:1 / Dark: 12.98:1 | Approve triage urgent mapping. |
| `ROUTINE` | Triage | `ROUTINE` | **ROUTINE** | Blue (`bg-blue-100 text-blue-900`) | Light: 8.49:1 / Dark: 11.27:1 | Approve routine triage mapping. |
| `SELF_CARE` / `OPTIMAL` | Triage | `NORMAL` | **SELF-CARE / OPTIMAL** | Emerald (`bg-emerald-100 text-emerald-950`) | Light: 13.36:1 / Dark: 12.73:1 | Approve normal/self-care mapping. |

---

## Section 6: Non-English Translated Strings Requiring Native-Speaker Medical Review

**File:** `src/context/language-context.tsx`  
**Locales Covered:** Arabic (`ar`), Spanish (`es`), Chinese (`zh`), French (`fr`).

The following core clinical and emergency safety strings are implemented in the UI and require review by native-speaking medical professionals or certified medical translators before deployment in non-English clinical environments:

### 6.1 Arabic (`ar`) — RTL
1. **Persistent Emergency Notice (`persistentEmergencyNotice`):**  
   `"إذا كنت تعتقد أن هذه حالة طارئة، يرجى الاتصال بخدمات الطوارئ المحلية فوراً."`  
   *Clinical Review Decision:* Verify clarity and medical urgency in dialect-neutral Modern Standard Arabic (MSA).
2. **Emergency Disclaimer (`emergencyDisclaimer`):**  
   `"إذا كنت تعاني من ألم شديد في الصدر، صعوبة في التنفس، أو ضعف مفاجئ أو خدر، اتصل فوراً بالرقم 911 أو رقم الطوارئ المحلي في بلدك."`  
   *Clinical Review Decision:* Confirm accurate terminology for chest pain, dyspnea, and focal neurological deficits.
3. **Triage Tiers:**  
   - `tierEmergency`: `"🚨 حالة طارئة (اتصل بالإسعاف / توجه للطوارئ)"`  
   - `tierUrgent`: `"⚠️ عاجل (راجع الطبيب خلال 24–48 ساعة)"`  
   - `tierRoutine`: `"🗓️ روتيني (احجز موعداً مع طبيب العائلة)"`  
   - `tierSelfCare`: `"🏡 رعاية منزلية (راحة ومراقبة في المنزل)"`  
   *Clinical Review Decision:* Confirm patient comprehension across varying levels of Arabic health literacy.

### 6.2 Spanish (`es`)
1. **Persistent Emergency Notice (`persistentEmergencyNotice`):**  
   `"Si cree que se trata de una emergencia médica, comuníquese de inmediato con los servicios de emergencia locales."`  
   *Clinical Review Decision:* Confirm clarity across Latin American and European Spanish variants.
2. **Emergency Disclaimer (`emergencyDisclaimer`):**  
   `"Si tiene dolor de pecho intenso, dificultad para respirar, debilidad repentina o entumecimiento, llame al 911 o a su número de emergencia local de inmediato."`  
   *Clinical Review Decision:* Verify terminology for angina, dyspnea, and paresthesias.
3. **Triage Tiers:**  
   - `tierEmergency`: `"🚨 Emergencia (Llame al 911 / Vaya a Urgencias)"`  
   - `tierUrgent`: `"⚠️ Urgente (Consulte a un médico en 24–48 h)"`  
   - `tierRoutine`: `"🗓️ Rutina (Programe una cita médica normal)"`  
   - `tierSelfCare`: `"🏡 Cuidados en casa (Descanse y vigile síntomas)"`  
   *Clinical Review Decision:* Approve phrasing for primary care follow-up vs. emergency attendance.

### 6.3 Chinese (`zh` - Simplified)
1. **Persistent Emergency Notice (`persistentEmergencyNotice`):**  
   `"如果您认为这是紧急情况，请立即联系当地急救部门。"`  
   *Clinical Review Decision:* Confirm natural phrasing and clarity in mainland and international Chinese dialects.
2. **Emergency Disclaimer (`emergencyDisclaimer`):**  
   `"如果您出现剧烈胸痛、呼吸困难、突发肢体无力或麻木，请立即拨打120、911或当地急救电话。"`  
   *Clinical Review Decision:* Confirm clinical accuracy of cardiac and stroke red-flag descriptions.
3. **Triage Tiers:**  
   - `tierEmergency`: `"🚨 紧急情况（立即就医或呼叫急救）"`  
   - `tierUrgent`: `"⚠️ 较紧急（24–48小时内就医）"`  
   - `tierRoutine`: `"🗓️ 常规门诊（预约普通医生门诊）"`  
   - `tierSelfCare`: `"🏡 居家观察（卧床休息并留意变化）"`  
   *Clinical Review Decision:* Confirm patient understanding of triage urgency intervals.

### 6.4 French (`fr`)
1. **Persistent Emergency Notice (`persistentEmergencyNotice`):**  
   `"Si vous pensez qu'il s'agit d'une urgence, contactez immédiatement les services d'urgence locaux."`  
   *Clinical Review Decision:* Confirm phrasing compliant with European and North American French medical standards.
2. **Emergency Disclaimer (`emergencyDisclaimer`):**  
   `"Si vous ressentez une douleur thoracique aiguë, des difficultés à respirer, une faiblesse soudaine ou un engourdissement, appelez immédiatement le 15, le 911 ou votre numéro d'urgence local."`  
   *Clinical Review Decision:* Confirm cardiovascular and neurological symptom terminology.
3. **Triage Tiers:**  
   - `tierEmergency`: `"🚨 Urgence vitale (Appelez les secours / Urgences)"`  
   - `tierUrgent`: `"⚠️ Prioritaire (Consultez sous 24 à 48 heures)"`  
   - `tierRoutine`: `"🗓️ Consultation de routine (Prenez rendez-vous)"`  
   - `tierSelfCare`: `"🏡 Soins à domicile (Repos et surveillance)"`  
   *Clinical Review Decision:* Confirm clinical appropriateness of "Urgence vitale" vs. "Prioritaire".

---

## Section 7: Sign-Off & Clinical Authorization Form

*To be completed by Supervising Medical Director / Chief Medical Officer:*

| Review Area | Reviewer Name & Title | Professional License # | Status (Approved / Revisions Requested) | Date |
| :--- | :--- | :--- | :--- | :--- |
| **Red-Flag Heuristics & Negation** | | | [ ] Approved  [ ] Revisions Needed | |
| **Likelihood Wording & Thresholds** | | | [ ] Approved  [ ] Revisions Needed | |
| **Patient Triage Text & Crisis Flow**| | | [ ] Approved  [ ] Revisions Needed | |
| **Adult Reference Ranges & Plausibility**| | | [ ] Approved  [ ] Revisions Needed | |
| **Status Mapping & Segregation** | | | [ ] Approved  [ ] Revisions Needed | |
| **Multilingual Localization** | | | [ ] Approved  [ ] Revisions Needed | |

**Physician Comments & Mandatory Changes:**  
`__________________________________________________________________________________________________________________`  
`__________________________________________________________________________________________________________________`  
`__________________________________________________________________________________________________________________`
