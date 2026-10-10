'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  FlaskConical,
  Scan,
  FileText,
  AlertTriangle,
  History,
  Lock,
  Clock,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  ExternalLink,
  Info,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Real clinical showcase specimens for the live hero demonstration widget
const sampleSpecimens = [
  {
    id: 'specimen-cardiac',
    tag: 'Chest & Cardiopulmonary',
    patient: '58y Male • Non-smoker',
    chiefComplaint: 'Substernal chest tightness with mild left shoulder radiation, onset 90 mins ago during brisk walk.',
    triageLevel: 'EMERGENCY',
    urgencyText: 'Immediate Emergency Evaluation (< 15 mins)',
    colorClass: 'text-destructive bg-destructive/10 border-destructive/30',
    borderClass: 'border-l-4 border-l-destructive',
    topDiagnosis: 'Acute Coronary Syndrome (ACS) Rule-Out',
    icd10: 'I21.9',
    likelihood: 78,
    keyRuleOut: 'Requires emergent 12-lead ECG & serial high-sensitivity Troponin assays.',
    soapSnippet: 'S: 58yo M reports 90-min substernal pressure radiating to L shoulder. O: Distress noted. A: Suspected ACS. P: Activate emergency department cardiac pathway.',
  },
  {
    id: 'specimen-abdominal',
    tag: 'Abdomen & GI',
    patient: '27y Female • No prior surgeries',
    chiefComplaint: 'Periumbilical discomfort shifting to right lower quadrant over 14 hours. Mild nausea, anorexia.',
    triageLevel: 'URGENT',
    urgencyText: 'Clinical Assessment Within 12–24 Hours',
    colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30',
    borderClass: 'border-l-4 border-l-amber-500',
    topDiagnosis: 'Acute Appendicitis',
    icd10: 'K35.80',
    likelihood: 72,
    keyRuleOut: 'Evaluates peritoneal signs; differential includes mesenteric adenitis and ovarian pathology.',
    soapSnippet: 'S: 27yo F with progressive migrating RLQ pain. O: Rebound tenderness suspected. A: Likely acute appendicitis. P: Surgical consult & urgent ultrasound/CT.',
  },
  {
    id: 'specimen-neuro',
    tag: 'Cranial & Neurologic',
    patient: '34y Female • History of migraines',
    chiefComplaint: 'Unilateral throbbing right temporal headache with photophobia and nausea for 6 hours.',
    triageLevel: 'ROUTINE',
    urgencyText: 'Outpatient Clinic Consultation (3–5 Days)',
    colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30',
    borderClass: 'border-l-4 border-l-blue-500',
    topDiagnosis: 'Migraine without Aura',
    icd10: 'G43.009',
    likelihood: 84,
    keyRuleOut: 'Absence of thunderclap onset, meningismus, or focal neurological deficit.',
    soapSnippet: 'S: 34yo F with recurrent pulsatile hemicrania. O: Normotensive. A: Episodic migraine flare. P: Triptan therapy review & hydration monitoring.',
  },
];

const clinicalTools = [
  {
    id: 'tool-triage',
    title: 'Symptom Triage & Bayesian Intake',
    badge: 'Core CDS',
    icon: Stethoscope,
    href: '/ManoMedai',
    description: 'Interactive anatomical mapping across 6 physiological zones, hands-free voice dictation, real-time emergency red-flag screening, and automated EHR SOAP note generation.',
    cta: 'Start Symptom Intake',
  },
  {
    id: 'tool-labs',
    title: 'Blood Work & Lab Test Interpreter',
    badge: 'Diagnostic Pathology',
    icon: FlaskConical,
    href: '/labs',
    description: 'Comprehensive analysis of CBC, Metabolic (CMP), Cardiac troponin, renal, and lipid panels with age/sex-calibrated reference intervals and dual-audience reporting.',
    cta: 'Interpret Lab Results',
  },
  {
    id: 'tool-imaging',
    title: 'X-Ray & Radiology Assistant',
    badge: 'PACS Vision AI',
    icon: Scan,
    href: '/imaging',
    description: 'High-contrast PACS radiology film workstation with zoom, inversion, and brightness filters. Multimodal evaluation of chest radiographs, skeletal fractures, and soft tissue.',
    cta: 'Analyze Radiograph',
  },
];

const triageStandards = [
  {
    level: 'EMERGENCY',
    timeframe: 'Immediate (< 15 mins)',
    badgeClass: 'bg-destructive text-destructive-foreground',
    borderClass: 'border-l-4 border-l-destructive',
    indicators: 'Severe chest discomfort, focal stroke signs, acute airway compromise, heavy hemorrhage, sudden worst-ever headache.',
    action: 'Activate 911 / EMS dispatch or transfer directly to the nearest acute emergency resuscitation facility.',
  },
  {
    level: 'URGENT',
    timeframe: 'Within 12–24 Hours',
    badgeClass: 'bg-amber-500 text-white',
    borderClass: 'border-l-4 border-l-amber-500',
    indicators: 'High persistent pyrexia, progressive abdominal guarding, deep laceration, intractable emesis, suspected acute fractures.',
    action: 'Present to an urgent care medical center, walk-in emergency clinic, or same-day clinical evaluation.',
  },
  {
    level: 'ROUTINE',
    timeframe: '3 to 5 Days',
    badgeClass: 'bg-blue-600 text-white',
    borderClass: 'border-l-4 border-l-blue-600',
    indicators: 'Subacute localized joint pain, chronic recurring cough, mild rashes, gradual fatigue, prescription review.',
    action: 'Schedule an in-person or telehealth consultation with a certified primary care physician or specialist.',
  },
  {
    level: 'SELF-CARE',
    timeframe: 'Supportive / 5–7 Days',
    badgeClass: 'bg-emerald-600 text-white',
    borderClass: 'border-l-4 border-l-emerald-600',
    indicators: 'Uncomplicated mild coryza, minor muscular strain, superficial abrasion, self-limiting viral malaise.',
    action: 'Restorative home protocol: hydration, rest, OTC comfort measures, and structured red-flag return precautions.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [activeSpecimenIndex, setActiveSpecimenIndex] = useState(0);
  const activeSpecimen = sampleSpecimens[activeSpecimenIndex];

  return (
    <div className="bg-background text-foreground flex flex-col">
      {/* Editorial Split Hero Section */}
      <section className="border-b border-border/80 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Authoritative Editorial Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-muted border border-border text-foreground/80">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Evidence-Grounded Clinical Decision Support
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-foreground leading-[1.15]">
                Calibrated clinical triage, blood work, & imaging for informed care.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl font-normal">
                ManoMed AI unifies patient symptom triage, laboratory blood panel interpretation, and radiograph reading. Engineered to be effortlessly accessible for senior family members and rigorous enough for practicing physicians and nurses.
              </p>

              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => router.push('/ManoMedai')}
                  className="h-12 px-6 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-none flex items-center justify-center gap-2 text-sm"
                >
                  <Stethoscope className="w-4 h-4" />
                  Begin Symptom Triage
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                <Link href="/labs">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-5 rounded-xl border-border text-foreground hover:bg-muted font-medium flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                  >
                    <FlaskConical className="w-4 h-4 text-primary" />
                    Blood Work Interpreter
                  </Button>
                </Link>

                <Link href="/imaging">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-5 rounded-xl border-border text-foreground hover:bg-muted font-medium flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                  >
                    <Scan className="w-4 h-4 text-primary" />
                    X-Ray Assistant
                  </Button>
                </Link>
              </div>

              {/* Trust Attributes */}
              <div className="pt-6 border-t border-border/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <span>4-Tier Triage Urgency</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary shrink-0" />
                  <span>Client-Encrypted Vault</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-primary shrink-0" />
                  <span>ICD-10 & SOAP Standard</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Clinical Demonstration Specimen */}
            <div className="lg:col-span-5">
              <div className="clinical-card rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Live Triage Specimen Engine
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">Interactive Demo</span>
                </div>

                {/* Case Selector Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {sampleSpecimens.map((specimen, idx) => (
                    <button
                      key={specimen.id}
                      onClick={() => setActiveSpecimenIndex(idx)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors shrink-0 text-left ${
                        activeSpecimenIndex === idx
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {specimen.tag}
                    </button>
                  ))}
                </div>

                {/* Specimen Content Card */}
                <div className={`p-4 rounded-xl bg-card/80 border border-border/80 space-y-3.5 ${activeSpecimen.borderClass}`}>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground">Chief Complaint</span>
                      <span className="text-[11px] text-muted-foreground">{activeSpecimen.patient}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      &quot;{activeSpecimen.chiefComplaint}&quot;
                    </p>
                  </div>

                  {/* Triage & Assessment Breakdown */}
                  <div className="pt-2 border-t border-border/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Triage Urgency:</span>
                      <Badge className={`text-[11px] font-bold px-2 py-0.5 ${activeSpecimen.colorClass}`}>
                        {activeSpecimen.triageLevel}
                      </Badge>
                    </div>

                    <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{activeSpecimen.urgencyText}</span>
                    </div>

                    <div className="pt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-foreground">{activeSpecimen.topDiagnosis}</span>
                        <span className="font-mono text-primary text-[11px]">
                          {activeSpecimen.icd10} • {activeSpecimen.likelihood}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${activeSpecimen.likelihood}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground/90 italic pt-1">
                        {activeSpecimen.keyRuleOut}
                      </p>
                    </div>
                  </div>

                  {/* Sample SOAP Hand-Off Bar */}
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border text-[11px] text-muted-foreground font-mono leading-relaxed">
                    <span className="font-bold text-foreground block mb-0.5">EHR SOAP Hand-off:</span>
                    {activeSpecimen.soapSnippet}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Simulating real CDS engine logic</span>
                  <Link href="/ManoMedai" className="text-primary font-semibold flex items-center gap-1 hover:underline">
                    Run Custom Patient Intake
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Three Core Clinical Pillars */}
      <section className="py-16 md:py-24 border-b border-border/80 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              Comprehensive Clinical Diagnostic Suite
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Three interconnected clinical tools for every patient evaluation.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Whether conducting initial symptom intake at home or reviewing laboratory assays and chest radiographs in a clinical workstation, ManoMed AI provides exact, structured guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clinicalTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  className="clinical-card rounded-2xl p-6 flex flex-col justify-between space-y-6 bg-card"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono border-border">
                        {tool.badge}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">{tool.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <Link href={tool.href} className="w-full block">
                    <Button
                      variant="outline"
                      className="w-full min-h-[44px] text-xs font-semibold rounded-xl border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all flex items-center justify-center gap-2"
                    >
                      <span>{tool.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: Clinical Triage Standards Table */}
      <section className="py-16 md:py-24 border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              Standardized Triage Protocol
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Calibrated urgency tiers with decisive action timeframes.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ambiguity during early symptom onset delays critical interventions. Every ManoMed evaluation maps to an evidence-based clinical urgency classification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {triageStandards.map((tier) => (
              <div
                key={tier.level}
                className={`clinical-card rounded-2xl p-5 flex flex-col justify-between space-y-4 ${tier.borderClass}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={`text-xs font-bold px-2.5 py-0.5 ${tier.badgeClass}`}>
                      {tier.level}
                    </Badge>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {tier.timeframe}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-foreground">Clinical Presentations:</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tier.indicators}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border space-y-1">
                  <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">
                    Protocol Action:
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tier.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Physician Hand-Off & Safety Covenant */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="clinical-card rounded-3xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Medical Ethics & Privacy Covenant
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Engineered to assist physicians, not replace direct examination.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                ManoMed AI does not collect biometric trackers, does not monetize patient records, and operates under strict client-side encryption. Every evaluation provides patients with informed questions and structured SOAP documentation for treating physicians.
              </p>

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Client-side ephemeral vault
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Standardized ICD-10 cross-references
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Zero advertising or tracking
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <Link href="/ManoMedai" className="w-full">
                <Button className="w-full h-12 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
                  Launch Clinical Intake
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/privacy" className="w-full">
                <Button variant="outline" className="w-full h-11 text-xs font-semibold border-border rounded-xl">
                  Review Privacy Architecture
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}