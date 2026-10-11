# ManoMed AI — Design Brief & UI Specification

> **Target Output**: `docs/design-brief.md`  
> **Purpose**: Authoritative, factual design brief derived strictly from verified codebase architecture and UX audits for external UI generation tools.  
> **Status**: Verified against active Next.js App Router codebase (October 2026).

---

## 1. Product Overview

### 1.1 What ManoMed AI Does
ManoMed AI is an intelligent Clinical Decision Support (CDS) and healthcare triage web application. It bridges the gap between anxious patients and busy healthcare providers by translating patient-reported symptom narratives into:
1. **Four-tier urgency triage** (`EMERGENCY`, `URGENT`, `ROUTINE`, `SELF_CARE`) with clear care timeframes.
2. **Ranked differential diagnoses** with qualitative likelihood explanations for patients and calibrated probabilities for clinicians.
3. **Adaptive Bayesian questionnaires** that ask targeted clinical follow-up questions.
4. **Blood work and laboratory test interpretations** with real-time reference range evaluations.
5. **Medical imaging / radiograph assistance** (chest, musculoskeletal, spine, dental) within a PACS-style viewer.
6. **EHR-compatible SOAP clinical notes** (Subjective, Objective, Assessment, Plan) with ICD-10 coding hints.
7. **Client-side encrypted records vault** stored locally on the user's device.

### 1.2 Target Audiences (Ages 18–60)
The application serves two distinct user groups with contrasting health and technological literacy:

* **Audience 1: Everyday Patients & Family Members**
  * **Demographics & Mindset**: Adults aged 18 to 60+ (including non-technical older adults); frequently anxious, stressed, or experiencing acute discomfort.
  * **Needs**: Plain everyday language, gentle reassurance, zero confusing medical jargon or raw probability math, actionable next steps, safe home-care guidance, checklists for clinic visits, and unambiguous emergency red-flag warnings.
  * **Restrictions**: Must never be exposed to raw percentage scores (e.g., "78% probability") or raw ICD-10 codes, which induce health anxiety.

* **Audience 2: Clinicians & Healthcare Professionals**
  * **Demographics & Mindset**: Triage nurses, resident physicians, clinic staff, and attending doctors.
  * **Needs**: Maximum density, speed, diagnostic precision, calibrated probability percentages, ICD-10 codes, differential evidence breakdown (supporting vs. contradicting factors), standardized SOAP notes ready for 1-click EHR export, and PACS manipulation tools.

### 1.3 Supported Languages & Localization
* **5 Global Languages**:
  * English (`en`) — LTR (Active baseline)
  * Arabic (`ar` / العربية) — **RTL** with normalized letter spacing (`[dir="rtl"] { letter-spacing: 0 !important; }`)
  * Spanish (`es` / Español) — LTR
  * Chinese (`zh` / 中文) — LTR
  * French (`fr` / Français) — LTR
* **Persistence & DOM Behavior**: Stored in `localStorage` (`manomed_lang`), applied synchronously to `<html lang="..." dir="...">`.
* **Localization Safety Constraint**: Pattern-based emergency red-flag detection currently has clinically reviewed rules implemented **only for English**. For non-English locales (`ar`, `es`, `zh`, `fr`), a persistent, translated safety notice is rendered in the UI directing the user to contact local emergency services immediately if in distress.

---

## 2. Screen Specifications & Route Inventory

### 2.1 Route: `/` (Editorial Landing & Clinical Launchpad)
* **Purpose**: Establish institutional clinical credibility, provide clear orientation for both audiences, display live telemetry, and provide direct one-click entry to all tools.
* **Main Elements**:
  * Asymmetric editorial hero with primary CTA ("Check My Symptoms" -> `/ManoMedai`) and secondary CTA ("Doctor & Clinic Dashboard" -> `/station`).
  * Live telemetry benchmarks: `~1.0s Fast AI`, `5 Global Languages`, `100% On-Device Privacy`.
  * Direct Entry jump-board cards for Symptom Checker, Blood Test Explainer, and X-Ray Viewer.
  * Three core diagnostic pillar descriptions.
  * Dual-audience translation comparison matrix (Patient Experience vs. Physician Value).
  * 4-Tier triage urgency hierarchy cards.
  * Global footer with emergency helpline reference tags (`US/CA: 911`, `UK: 999`, `EU: 112`, `Crisis: 988`).
* **States**:
  * *Default*: Clean editorial layout respecting system dark/light theme.
  * *Loading*: Instant client/server hydration.
  * *Empty*: N/A.
  * *Emergency*: Highlighted emergency helpline drawer in footer.
* **Key User Action**: Select triage modality or click "Check My Symptoms".

---

### 2.2 Route: `/ManoMedai` (Intake & Triage Workspace)
* **Purpose**: Step 1 comprehensive intake gathering patient demographics, chief complaints, anatomical region, pain severity, duration, medications, allergies, and optional vitals.
* **Main Elements**:
  * Breadcrumb navigation and local records badge link (`/history`).
  * Patient Demographics: Full Name, Age (1–120), Biological Sex (`Female`, `Male`, `Other`), Email (optional).
  * 2D Interactive Anatomical Body Map (`BodyMapSelector.tsx`) across 6 anatomical zones: Head, Chest, Abdomen, Limbs, Spine, Systemic.
  * Searchable symptom library chips with instant keyword filtering.
  * Chief Complaint narrative textarea with Speech-to-Text dictation toggle.
  * Wong-Baker FACES visual pain scale slider (1 to 10).
  * Duration dropdown (`< 24 hours`, `1-3 days`, `4-7 days`, `1-2 weeks`, `> 2 weeks`) and Onset selector (`Sudden`, `Gradual`, `Fluctuating`).
  * Optional Vitals Panel (Heart Rate, Systolic/Diastolic BP, Temperature, SpO2).
  * Medications & Known Allergies tag inputs with real-time Contraindication Alert Engine (Beta-lactam anaphylaxis, NSAID ulcer/GI bleed, Beta-blocker asthma bronchospasm).
  * Client-side debounced Red-Flag and Crisis Support Alert banner.
  * Non-English persistent emergency notice (`role="note"`).
* **States**:
  * *Loading*: Spinner overlay while restoring cached session from `useAssessmentStore`.
  * *Default*: Clean multi-card intake form.
  * *Recording*: Pulsing microphone button with active audio listening state.
  * *Error*: Destructive inline alert if name, age, biological sex, chief complaint, or privacy checkbox is missing.
  * *Emergency / Crisis*: High-priority `role="alert"` banner triggered on detected emergency phrases (chest pain radiating, stroke signs, breathing failure, anaphylaxis) or supportive mental health crisis resources (suicidal ideation).
* **Key User Action**: Complete intake and click **"Proceed to Diagnostic Questionnaire →"** (`/questionnaire`).

---

### 2.3 Route: `/questionnaire` (Clarifying Questions Wizard)
* **Purpose**: Step 2 adaptive inquiry wizard presenting 3 to 6 targeted follow-up questions generated by AI to narrow diagnostic differentials, followed by an in-card review step.
* **Main Elements**:
  * Progress header: Question index, estimated time remaining, and accessible progress bar (`role="progressbar"`).
  * Question Card: Category badge, primary clinical question, and "Why we ask this" clinical rationale callout.
  * Input Controls:
    * Boolean: Large Dual "Yes" / "No" cards with keyboard shortcuts (`1` or `Y` for Yes; `2` or `N` for No).
    * Severity Scale: 1–10 slider.
    * Multi-choice: Option selection cards.
  * In-Card Review Step: Displays summary table of all answered questions with individual "Edit Answer" links prior to clinical synthesis.
* **States**:
  * *Loading*: Full-screen clinical loader (`Formulating Differential Inquiries`).
  * *Default*: Stepper showing current question with smooth transitions.
  * *Empty / Redirect*: Redirects to `/ManoMedai` if no symptom narrative is present in store.
  * *Error*: Destructive card with "Retry" and "Edit Symptoms" actions if API generation fails.
  * *Review*: Summary list of all questions with final confirmation CTA.
* **Key User Action**: Answer each question, verify on the review step, and click **"Synthesize Clinical Differential →"** (`/conditions`).

---

### 2.4 Route: `/conditions` (Results & Triage Dashboard)
* **Purpose**: Step 3 diagnostic report displaying triage urgency, ranked differential diagnoses, appointment checklist, safe supportive care, and physician EHR SOAP note.
* **Main Elements**:
  * Visual Triage Urgency Banner (`role="alert"` for Emergency/Urgent; `role="status"` for Routine/Self-Care):
    * Emergency (Red), Urgent (Amber), Routine (Blue), Self-Care (Emerald).
    * Care window timeframe badge and recommended clinical action.
    * 4-Tier visual triage hierarchy gauge.
    * Direct "Call Emergency Services" button (if configured) or generic local emergency instructions.
  * Non-dismissible one-sentence clinical disclaimer box.
  * Audience Perspective Switcher (`role="tablist"`): "Patient summary" vs. "Clinician view".
  * **Patient Summary View (Default)**:
    * "Based on what you told us": Plain text read-only echo of reported complaint, duration, body region, and pain rating.
    * "What this usually means": Top 3 ranked conditions with qualitative likelihood badges (e.g., *"More likely based on your answers"*, *"Possible"*, *"Less likely, but worth discussing with your doctor"*), plain-language descriptions, and supporting factors. Zero raw percentages and zero ICD-10 codes.
    * "Questions to ask your doctor": Interactive checklist with `<label>` + checkbox (min 44px touch target) and 1-click clipboard copy with screen-reader announcement.
    * "When to seek emergency care": Red callout listing explicit red-flag triggers requiring immediate ER visit.
    * "Supportive steps you can take at home": Non-pharmacological comfort and monitoring tips.
  * **Clinician View**:
    * Recharts probability comparison horizontal/bar chart with percentage values.
    * Full differential diagnosis table with ICD-10 code hints, continuous likelihoods (0.00–1.00), supporting evidence, and counter-indicators.
    * Recommended diagnostic workup linking directly to `/labs` and `/imaging`.
    * 4-Part EHR SOAP Note (Subjective, Objective, Assessment, Plan) with 1-click clipboard copy.
  * Action Toolbar: "Print Summary" (`window.print()`) and "Export Clinical PDF" (`exportClinicalReportPDF`).
* **States**:
  * *Loading*: `<Loading title="Synthesizing Clinical Differential" />`.
  * *Default*: Complete dual-perspective dashboard.
  * *Empty*: Redirects to `/ManoMedai` if store has no active symptoms.
  * *Error*: Destructive alert with "Back to Questions" and "Retry Analysis" buttons.
  * *Emergency*: Bold Red Emergency Protocol box rendered first with prominent emergency calling guidance.
* **Key User Action**: Review triage level, toggle between Patient and Clinician perspectives, print or export PDF, or click "Start New Health Check".

---

### 2.5 Route: `/station` (Doctor & Clinic Ward Dashboard)
* **Purpose**: Real-time hospital ward and clinic dashboard for doctors and nurses to monitor, triage, and manage the live intake queue across symptoms, blood tests, and X-rays.
* **Main Elements**:
  * Live KPI cards: Active Triage Queue, Emergency Red Flags, Urgent Cases, Optimal/Self-Care.
  * Search filter input (patient name, condition, or symptom text).
  * Urgency Filter pill buttons (`ALL`, `EMERGENCY`, `URGENT`, `ROUTINE`, `SELF_CARE`).
  * Modality Tabs: Symptom Triage, Blood Work, X-Ray Vision.
  * Clinical Queue Cards/Table: Timestamp, Patient Name, Age/Sex, Triage badge, Chief complaint summary, Quick-Action buttons ("Review", "Copy SOAP", "Download PDF").
  * Detail Slide-Over / Dialog: Full clinical inspection modal with complete differential and SOAP notes.
* **States**:
  * *Loading*: Real-time store hydration.
  * *Default*: High-density live clinical queue.
  * *Empty*: "No Active Patients in Queue" / "No matching patient records".
  * *Error*: Graceful local storage fallback.
  * *Emergency*: Pulsing red row indicator and warning badge on critical patients.
* **Key User Action**: Filter queue, open patient case, copy SOAP note to clipboard, or export clinical PDF.

---

### 2.6 Route: `/imaging` (PACS Viewer & Radiograph Assistant)
* **Purpose**: Multimodal imaging assistant providing radiological image inspection and AI-assisted diagnostic reports across chest, skeletal, spine, and dental radiographs.
* **Main Elements**:
  * Modality Region Selector: Chest, Musculoskeletal, Abdomen, Spine, Dental.
  * Clinical Preset Radiograph Library: 6 selectable sample cases (Normal Chest PA, Pneumonia, Colles Wrist Fracture, Knee OA, L2 Compression, Dental Abscess).
  * Image Upload Dropzone with client-side canvas downsampling.
  * PACS Radiograph Viewer:
    * Zoom controls (50% to 250%).
    * Pan & Reset.
    * Brightness slider (50% to 150%).
    * Contrast slider (50% to 150%).
    * Film Invert toggle (Positive/Negative x-ray view).
  * Structured Radiology Report: Technique & Quality, Anatomical Observations, Diagnostic Impression, Urgency classification, Patient summary, Attending physician recommendations.
  * Audience view toggle (Patient vs. Clinician) and 1-click Radiology PDF Export.
* **States**:
  * *Default*: Interactive viewer with active sample case loaded.
  * *Loading / Analyzing*: Pulsing radiological scanline animation on viewer with "Analyzing Radiograph...".
  * *Empty*: Dropzone prompting image upload.
  * *Error*: Error alert on unsupported file formats.
  * *Emergency*: Urgent red notification for acute critical findings (displaced fracture, pneumothorax).
* **Key User Action**: Adjust viewer windowing (brightness/contrast), click "Analyze Radiograph with AI", and export radiology report PDF.

---

### 2.7 Route: `/labs` (Blood Work & Lab Test Interpreter)
* **Purpose**: Laboratory analyte interpreter analyzing numerical blood test panels against standard clinical reference intervals with plain-language explanations.
* **Main Elements**:
  * Quick-Fill Clinical Panel Presets (Normal Routine Screen, Anemia Workup, Acute Bacterial Infection, Cardiac Emergency, Diabetic/Kidney Panel, Hepatic Panel).
  * Patient metadata inputs (Name, Age, Gender, Panel Type, Clinical Notes).
  * Dynamic Lab Value Table: Parameter name, Measured Value, Unit, Standard Reference Range, Add Row button, Delete Row button.
  * Real-time Out-of-Range Status Indicators (Normal, High, Low, Critical).
  * Structured Output Report: Overall clinical interpretation, Triage urgency tier, Plain-language patient explanation, Clinician technical differential, Recommended follow-up tests.
  * Audience view toggle (Patient vs. Clinician) and Pathology Report PDF Export.
* **States**:
  * *Default*: Populated table with preset values ready for evaluation.
  * *Loading*: Spinner on "Interpret Laboratory Results" button.
  * *Empty*: Blank input table with template suggestions.
  * *Error*: Validation alert on non-numeric or missing parameters.
  * *Emergency*: Highlighted red warning for critical values (e.g. Troponin > 0.04 ng/mL, Potassium > 5.5 mmol/L).
* **Key User Action**: Load a preset or input lab values, click "Interpret Laboratory Results", and export official pathology PDF.

---

### 2.8 Route: `/history` (Records Vault)
* **Purpose**: Client-side encrypted history browser for inspecting, filtering, re-evaluating, or purging past triage runs, lab reports, and imaging sessions.
* **Main Elements**:
  * Summary KPI cards: Total Saved Records, Emergency Triage, Urgent Follow-Up, Routine/Optimal.
  * Search input & Urgency level filter dropdown.
  * Multi-Category Tabs: Symptom Triage, Blood Work, X-Ray Scans.
  * Record Cards: Date/Time, Patient Name, Top Finding/Condition, Urgency badge, Primary narrative preview.
  * Actions: "Re-Open Assessment" (loads record into `/conditions`), "Download PDF", and "Delete Record" (with confirmation dialog).
  * Interactive inspection dialogs for past lab panels and X-ray records with patient/clinician perspective toggle.
* **States**:
  * *Loading*: Skeleton cards while reading `localStorage`.
  * *Default*: Filterable list of stored health records.
  * *Empty*: Informative empty state card ("No Saved Health Records Found" with CTA "Start New Health Check").
  * *Error*: N/A.
  * *Emergency*: Red border and alert icon on emergency-tier records.
* **Key User Action**: Search past visits, re-open a symptom report, or export past clinical PDFs.

---

### 2.9 Info & Utility Pages
* **`/about` (Institutional Methodology & Governance)**:
  * Purpose: Detail ManoMed AI's clinical mission, safety-first triage methodology, SOAP note standards, and evidence basis.
  * Elements: Four pillars cards, evidence standards timeline, physician partnership disclosure, CTA to triage.
* **`/contact` (Support & Emergency Helpline)**:
  * Purpose: User inquiries, technical support, and immediate crisis contact numbers.
  * Elements: Clinical inquiry form (Name, Email, Category select, Subject, Message), global emergency numbers list (US/CA 911, UK 999, EU 112, Crisis 988), clinic support channels.
* **`/privacy` (Data Governance & Privacy Covenant)**:
  * Purpose: Disclosure of client-side encryption, zero commercial data sales, and patient privacy standards.
  * Elements: Covenant summary cards, GDPR/HIPAA technical safeguards, local storage purge explanation.
* **`/coming-soon` (System Maintenance & Service Status)**:
  * Purpose: Dedicated fallback / maintenance screen showing live subsystem health.
  * Elements: Status indicator, subsystem checklist (Triage Models: Online, ICD-10 Taxonomy: Calibrated, EHR FHIR Export: Upgrading), "Return to Home" button.

---

## 3. Design Tokens & Component System

### 3.1 Typography
* **Primary Sans-Serif Font**: `Plus Jakarta Sans` (`--font-sans`), loaded via `next/font/google` (`weights: 400, 500, 600, 700, 800`).
  * **Fallback Stack**: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Arabic", "PingFang SC", "Microsoft YaHei", sans-serif`.
  * **Font Features**: `font-feature-settings: "cv02", "cv03", "cv04", "cv11", "tnum"` for clean, tabular clinical numerical alignment.
  * **RTL Behavior**: In Arabic (`[dir="rtl"]`), `letter-spacing: 0 !important;` is strictly enforced to prevent broken Arabic cursive script connections.
* **Monospace Font**: `font-mono` (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`) utilized for timestamps, telemetry metrics, ICD-10 codes, lab reference ranges, and SOAP clinical documentation.

### 3.2 Color Tokens (HSL Architecture in `globals.css`)
Theme is driven by device OS preference (`prefers-color-scheme`) via `next-themes` (`defaultTheme="system"`).

| Token Name | Light Mode (Crisp White / Medical Blue) | Dark Mode (Deep Obsidian / Surgical Blue) | Clinical Semantics |
| :--- | :--- | :--- | :--- |
| `--background` | `0 0% 100%` (`#FFFFFF`) | `0 0% 3%` (`#08080A`) | Base surface |
| `--foreground` | `222 47% 11%` (`#0F172A`) | `0 0% 98%` (`#FAFAFA`) | Primary body text (min 4.5:1 contrast) |
| `--card` / `--popover` | `0 0% 100%` (`#FFFFFF`) | `0 0% 6%` (`#0F0F13`) | Elevated container surface |
| `--card-foreground` | `222 47% 11%` | `0 0% 98%` | Card body text |
| `--primary` | `221.2 83.2% 53.3%` (`#2563EB` Royal Blue) | `217.2 91.2% 59.8%` (`#3B82F6` Electric Blue) | Primary clinical actions & branding |
| `--primary-foreground`| `0 0% 100%` | `0 0% 100%` | Text on primary buttons |
| `--secondary` | `210 40% 96.1%` (`#F1F5F9`) | `240 4% 14%` (`#232328`) | Secondary actions & neutral fills |
| `--muted` | `210 40% 96.1%` | `240 4% 12%` (`#1C1C20`) | Inactive backgrounds |
| `--muted-foreground` | `215.4 16.3% 44%` (`#64748B`) | `240 5% 65%` (`#A1A1AA`) | Secondary / helper text |
| `--accent` | `214 95% 93%` (`#DBEAFE`) | `217.2 91.2% 18%` | Subtle blue tint / active hover |
| `--destructive` | `0 84.2% 60.2%` (`#EF4444`) | `0 72% 55%` | Emergency triage & critical red-flags |
| `--warning` | `38 92% 50%` (`#F59E0B`) | `38 92% 55%` | Urgent care triage (within 24–48 hours) |
| `--success` | `160 84% 39%` (`#10B981`) | `160 70% 45%` | Routine / Self-care home monitoring |
| `--border` / `--input`| `214.3 31.8% 91.4%` (`#E2E8F0`) | `240 4% 16%` (`#27272A`) | Hairline container borders |
| `--ring` | `221.2 83.2% 53.3%` | `217.2 91.2% 59.8%` | Accessible focus ring indicator |

### 3.3 Radii & Spacing
* **Base Radius Token**: `--radius: 0.375rem;` (6px disciplined surgical instrument radius).
  * `rounded-lg`: `var(--radius)` (6px)
  * `rounded-md`: `calc(var(--radius) - 2px)` (4px)
  * `rounded-sm`: `calc(var(--radius) - 4px)` (2px)
* **Spacing Scale**: Strict Tailwind 4px baseline (`p-1` = 4px, `p-2` = 8px, `p-3` = 12px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px, `p-12` = 48px).

### 3.4 shadcn/ui Components in Active Use (33 Components)
1. `accordion` — Expandable medical justification and rationale
2. `alert-dialog` — Destructive action confirmations (deleting history records)
3. `alert` — Form errors and clinical evaluation alerts
4. `avatar` — User profiles
5. `badge` — Triage levels, out-of-range lab markers, ICD-10 tags, language indicators
6. `button` — Primary, outline, ghost, and destructive interactive triggers
7. `calendar` — Appointment and date pickers
8. `card` — Core layout containers (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`)
9. `chart` — Chart container primitives
10. `checkbox` — Interactive doctor question appointment checklists
11. `dialog` — Clinical detail inspection modals and PACS expanded view
12. `dropdown-menu` — Action menus and overflow options
13. `form` — React Hook Form integrations
14. `input` — Text, age, search, and lab numerical inputs
15. `label` — Accessible form field labeling
16. `menubar` — Desktop navigation menus
17. `popover` — Floating info hints
18. `progress` — Questionnaire completion tracker
19. `radio-group` — Multi-choice questionnaire selections
20. `scroll-area` — High-density queue and report scrolling
21. `select` — Biological sex, duration, onset, and anatomical region selectors
22. `separator` — Hairline clinical dividing lines
23. `sheet` — Mobile navigation drawer and slide-over panels
24. `sidebar` — Ward station sidebar navigation
25. `skeleton` — Asynchronous loading placeholders
26. `slider` — 1-10 pain intensity slider, PACS brightness/contrast controls
27. `switch` — Boolean toggles (e.g. Invert Film, Show Vitals)
28. `table` — Laboratory analyte parameters and ward station patient tables
29. `tabs` — Audience perspective switcher (Patient vs. Clinician), modality navigation
30. `textarea` — Chief complaint symptom narratives and clinical notes
31. `toast` — Ephemeral status notifications
32. `toaster` — Toast notification container
33. `tooltip` — Parameter definition tooltips and reference range explainers

### 3.5 Style Inconsistencies Discovered in Repo Audit
1. **Border Radius Fragmentation**: While `globals.css` specifies `--radius: 0.375rem` (6px), several components independently apply `rounded-xl` (12px), `rounded-2xl` (16px), or `rounded-3xl` (24px) to cards, banners, and buttons.
2. **Color Utility Mixing**: Heavy mixing of CSS variable tokens (`bg-primary`, `bg-card`, `text-destructive`) with hardcoded Tailwind palette classes (e.g. `bg-blue-600`, `text-emerald-700`, `bg-amber-500`, `text-purple-600`).
3. **Arbitrary Typography Sizes**: Occasional usage of arbitrary small font classes (`text-[10px]`, `text-[11px]`) in badges and telemetry metrics alongside standard scale (`text-xs`, `text-sm`).
4. **Theme Switcher Absence**: Manual theme toggle button was intentionally removed from headers in favor of automatic `prefers-color-scheme` matching; some users expect an explicit toggle control.

---

## 4. Non-Negotiables & Clinical Governance Requirements

1. **Red-Flag Alert & Crisis Support Protocol**:
   * **100% Client-Side Evaluation**: Pattern matching executes synchronously in the client browser with zero network transmission, external logging, or telemetry.
   * **Dual-Trigger Execution**: Evaluates on debounced keystroke (300ms) **AND** synchronously re-checks on form submission so fast submission cannot bypass safety checks.
   * **Non-Blocking Guarantee**: The alert must never permanently lock form submission or hide user-typed text.
   * **Separation of Crisis from Emergency**: Suicidal ideation / self-harm triggers a dedicated supportive Crisis Banner with crisis helpline contact (`988` / `https://findahelpline.com/`), distinct from 911 acute medical emergencies.
   * **Non-English Persistent Notice**: Displays a persistent emergency notice in `ar`, `es`, `zh`, and `fr` until clinician-reviewed rules exist for those languages.
   * **Emergency Config**: Medical emergency numbers must not be hardcoded; dynamically driven by `emergencyConfig.medicalEmergencyNumber` or default to generic wording ("your local emergency services").

2. **Non-Dismissible Clinical Disclaimer**:
   * Must remain permanently rendered on `/conditions` (`CLINICAL_EDUCATION_DISCLAIMER`) and in the root footer (`layout.tsx`). Must never include a close (`×`) or dismiss button.

3. **Dual Patient vs. Clinician Perspective**:
   * Uses accessible tabs (`role="tablist"`, `role="tab"`, `role="tabpanel"`).
   * Documented clearly as an informational perspective switcher, not a security access-control barrier.

4. **Qualitative Likelihood Wording (No Percentages for Patients)**:
   * Patients must never see raw probabilities or ICD-10 codes.
   * Thresholds strictly mapped via `getPatientLikelihoodInterpretation()` in `clinicalConfig.ts`:
     * `≥ 0.65`: *"More likely based on your answers"*
     * `0.35–0.64`: *"Possible"*
     * `< 0.35`: *"Less likely, but worth discussing with your doctor"*
     * High-Risk conditions: High-risk conditions must never receive reassuring labels without appending: *"Critical to evaluate with a doctor"*.
   * Raw percentage numbers (e.g. `82%`) and ICD-10 codes (e.g. `J06.9`) are restricted strictly to the Clinician View.

5. **Print View Architecture**:
   * Must include dedicated `@media print` rules hiding interactive UI chrome (`.print:hidden`, navigation header, action buttons, view switchers, tabs).
   * Renders high-contrast, black-and-white, clean clinical documentation with page-break protection.

6. **WCAG 2.2 Level AA Accessibility Standards**:
   * **Color Contrast**: 4.5:1 minimum contrast ratio for normal text across all states in light and dark modes.
   * **Visible Focus Indicators**: `*:focus-visible { outline: 2px solid hsl(var(--ring)); outline-offset: 2px; }`.
   * **Touch Target Size**: Minimum 44×44px (`min-h-[44px]`) on all interactive buttons, checkboxes, inputs, and tab triggers on mobile viewports.
   * **No Color-Only Meaning**: Every triage tier combines color with an icon, explicit text label, and ARIA announcement (`role="alert"` for Emergency/Urgent; `role="status"` for Routine/Self-Care).
   * **Accessible Form Controls**: Every checklist item uses an explicit `<label htmlFor="...">` associated with `<input type="checkbox" id="...">`.
   * **Screen-Reader Announcements**: Skip-to-content landmark link (`#main-content`) and `aria-live` announcements on copy-to-clipboard actions.

---

## 5. Current Pain Points (UX Audit Findings)

1. **Flow Friction & Multi-Step Disconnect**:
   * Users moving from `/ManoMedai` (Intake) to `/questionnaire` (Clarifying Questions) to `/conditions` (Results) can feel confused about why additional questions are asked after completing a detailed intake.
   * Initial lack of visual transition clues connecting intake inputs with questionnaire rationale.
2. **Clunky & High-Effort Intake Form**:
   * Step 1 intake form contains many concurrent sections (demographics, body map, tags, pain slider, duration, onset, vitals, meds, allergies), causing cognitive overload for anxious or elderly users.
   * Questionnaire review step previously lacked clear inline editing before final submission.
3. **Outdated Aesthetic & Visual Inconsistencies**:
   * Mixing of puffy generic AI tropes (large pill-shaped buttons, decorative gradients, glowing borders) with sharp clinical dashboard elements.
   * Inconsistent card radii varying haphazardly between 6px, 12px, 16px, and 24px across different routes.
   * Fragmented color palettes mixing standard HSL tokens with raw Tailwind utility colors.
4. **Historical Accessibility Deficits**:
   * Previous versions lacked keyboard shortcuts for questionnaire navigation.
   * Prior doctor question checklist items lacked associated `<label>` elements and 44px touch boundaries.
   * Missing persistent safety disclaimers for non-English speakers during red-flag detection.
   * Sub-optimal letter spacing on Arabic cursive typography prior to RTL CSS rules.

---

## 6. Technical Constraints & AI Response Architecture

### 6.1 Framework & Frontend Stack
* **Framework**: Next.js 15 with App Router (`src/app/`), React 18/19, TypeScript.
* **Styling**: Tailwind CSS with CSS variable theming and `tailwindcss-animate`.
* **Component Primitives**: Radix UI primitives bundled via shadcn/ui.
* **Icons**: `lucide-react` and `react-icons/fa` (`FaHeartbeat`).
* **Charts**: Recharts (`ResponsiveContainer`, `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `Cell`).
* **Authentication**: Clerk Authentication (`@clerk/nextjs`) integrated in root layout.
* **State Management**: Client-side reactive store in `src/lib/assessment-store.ts` (`localStorage` backing) with subscription listeners.

### 6.2 AI Engine & Response Schema (`SymptomAnalysisOutput`)
The AI diagnostic engine (Groq / Gemini 2.0 Flash fallback) returns a structured JSON payload conforming to `SymptomAnalysisOutput`:

```typescript
export interface SymptomAnalysisOutput {
  id: string; // Unique assessment UUID
  timestamp: string; // ISO 8601 timestamp
  triage: {
    level: 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'SELF_CARE';
    urgencyColor: 'red' | 'amber' | 'blue' | 'green';
    recommendedAction: string; // e.g. "Go to the nearest Emergency Room or call 911"
    timeframe: string; // e.g. "Immediate", "Within 24-48 hours", "1-2 weeks"
  };
  redFlags: string[]; // Critical warning signs detected (empty if none)
  emergencyGuidance?: string; // Immediate emergency stabilization / helpline guidance
  conditions: Array<{
    condition: string; // Name of condition
    icd10Hint?: string; // Indicative ICD-10 code (e.g. "J06.9", "I20.9")
    likelihood: number; // Calibrated probability score (0.0 to 1.0)
    description: string; // Clinical explanation
    supportingEvidence: string[]; // Patient-reported symptoms supporting this
    contradictingEvidence?: string[]; // Absent symptoms or factors making it less likely
    riskLevel: 'Low' | 'Moderate' | 'High'; // Untreated clinical severity risk
  }>;
  recommendedSpecialties: string[]; // e.g. ["Cardiology", "Pulmonology"]
  recommendedTests: string[]; // e.g. ["Complete Blood Count", "12-Lead ECG", "Chest X-Ray"]
  questionsForDoctor: string[]; // 4 to 6 smart questions for patient consultation
  safeSelfCare: string[]; // Safe supportive home care measures
  whenToSeekEmergencyCare: string[]; // Explicit red-flag escalation triggers
  soapNote: {
    subjective: string; // S: Chief complaint, HPI, reported symptoms
    objective: string; // O: Reported vitals, age, gender, physical context
    assessment: string; // A: Clinical synthesis and ranked differential diagnoses
    plan: string; // P: Recommended workup, referrals, patient education, red-flag precautions
  };
}
```

---

## 7. Open Questions & Unverified Items

1. **Institutional Clinical Review Board Validation**:
   * All regex patterns in `redFlags.ts`, likelihood thresholds in `clinicalConfig.ts`, and fallback recommendations are marked with `TODO: CLINICAL REVIEW REQUIRED`. They represent baseline clinical rules but have not yet undergone certified multi-center clinical trials or formal IRB sign-off.
2. **Non-English Red-Flag Pattern Coverage**:
   * Regex patterns are currently populated **only for English (`en`)**. Rule sets for `ar`, `es`, `zh`, and `fr` are currently empty in `redFlags.ts`. The UI relies solely on a persistent warning banner until verified localized medical regexes are compiled.
3. **Role-Based Access Control (RBAC) Architecture**:
   * The Patient vs. Clinician perspective toggle is currently client-side and open to all users. While Clerk authentication is installed, there is currently no backend role gating (e.g. restricting `/station` or the Clinician SOAP tab to verified medical licenses).
4. **Geolocation for Emergency Dispatch**:
   * The app currently relies on `process.env.NEXT_PUBLIC_EMERGENCY_PHONE` or generic text ("your local emergency services"). It does not yet perform automatic browser IP/GPS geolocation to resolve country-specific dispatch numbers (e.g. dynamically calling 112 in France vs 999 in the UK).
5. **Cross-Device Cloud Sync vs. Local Vault**:
   * Firebase Firestore connection is initialized (`src/lib/firebase.ts`), but primary assessment storage is maintained in browser `localStorage`. Real-time multi-device clinician synchronization across clinical wards requires production database rules and HIPAA Business Associate Agreements (BAAs).
