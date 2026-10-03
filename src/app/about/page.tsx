'use client';

import Link from 'next/link';
import {
  ShieldCheck,
  Stethoscope,
  Activity,
  FileCheck2,
  Lock,
  HeartPulse,
  Brain,
  Microscope,
  ArrowRight,
  Sparkles,
  Users2,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const pillars = [
  {
    icon: <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
    title: 'Safety-First Clinical Triage',
    desc: 'Emergency red-flag screening designed to instantly rule out acute coronary syndromes, strokes, respiratory failure, and acute abdomen crises before secondary evaluation.',
  },
  {
    icon: <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
    title: 'Multi-Modal GenAI Diagnostics',
    desc: 'Powered by calibrated Google GenAI models fine-tuned on standardized clinical diagnostic protocols and ICD-10 differential taxonomy.',
  },
  {
    icon: <FileCheck2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
    title: 'EHR Clinical Hand-Off',
    desc: 'Automates patient interview synthesis into standard SOAP notes (Subjective, Objective, Assessment, Plan) that physicians can import directly into EHRs.',
  },
  {
    icon: <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
    title: 'Strict Patient Privacy',
    desc: 'Client-side ephemeral storage by default. Patient health data is processed using enterprise encryption standards with zero ad tracking or commercial data sales.',
  },
];

const standards = [
  {
    number: '01',
    title: 'Standardized Triage Hierarchy',
    desc: 'Every assessment maps to Emergency (immediate ER), Urgent (within 24h), Routine (primary clinic), or Self-Care (supportive home monitoring).',
  },
  {
    number: '02',
    title: 'Evidence-Based Differential Reasoning',
    desc: 'Condition likelihoods are calibrated against reported symptoms, patient demographics, vitals, and follow-up clinical questions with explicit supporting and conflicting evidence.',
  },
  {
    number: '03',
    title: 'Physician Empowerment & Partnership',
    desc: 'ManoMed AI does not replace licensed medical practitioners. It prepares patients with informed questions, recommended diagnostic tests, and structured documentation.',
  },
  {
    number: '04',
    title: 'Continuous Safety Auditing',
    desc: 'Algorithms and prompts are continuously reviewed against clinical guidelines from major international health bodies to prevent hallucination and bias.',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-20 max-w-5xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          The Science Behind ManoMed AI
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
          Bridging the Critical Gap Between <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Symptom Onset</span> & Medical Care
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
          ManoMed AI was engineered to eliminate healthcare ambiguity. By combining state-of-the-art medical language modeling with rigorous clinical triage protocols, we empower patients with clear guidance and provide physicians with structured, time-saving clinical notes.
        </p>

        <div className="pt-4 flex justify-center gap-4">
          <Link href="/ManoMedai">
            <Button size="lg" className="rounded-2xl px-8 h-12 font-semibold flex items-center gap-2 shadow-lg">
              Experience the Clinical Triage
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Mission & Vision Banner */}
      <section className="bg-muted/30 border-y border-border/60 py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Our Clinical Mission</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Empowering Safe, Timely Healthcare Decisions Worldwide
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every year, millions of patients either delay emergency medical treatment due to diagnostic uncertainty or overwhelm emergency departments with benign complaints. ManoMed AI provides immediate, reliable preliminary triage to direct patients to the right care tier at the right time.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-foreground">
                  Designed for patient clarity and clinical workflow integration.
                </span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-card border border-border shadow-sm space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Core Institutional Commitments
              </h3>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span><strong>Zero Commercial Bias:</strong> Diagnostic outputs are never influenced by pharmaceutical sponsors or advertorial monetization.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span><strong>Clinical Safety Interceptors:</strong> Immediate hardcoded alerts for acute cardiovascular, cerebrovascular, and respiratory red flags.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span><strong>Data Minimization:</strong> Health data stays locally under patient control with end-to-end encryption during transient inference.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="container mx-auto px-4 py-20 max-w-5xl space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight">Clinical Architecture & Standards</h2>
          <p className="text-sm text-muted-foreground">
            How our intelligence engine operates to deliver high-yield differential assessments:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p, idx) => (
            <Card key={idx} className="border-border/70 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="p-3 rounded-2xl bg-muted/60 w-fit">{p.icon}</div>
                <h3 className="text-lg font-bold">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Clinical Methodology Steps */}
      <section className="bg-muted/40 border-t border-border/60 py-20">
        <div className="container mx-auto px-4 max-w-5xl space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Standard Operating Procedure</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Our 4-Step Diagnostic Pipeline</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {standards.map((s, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-card border border-border flex items-start gap-4">
                <span className="text-2xl font-black text-primary/30 tracking-tight font-mono">{s.number}</span>
                <div className="space-y-1">
                  <h3 className="text-base font-bold">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center space-y-4">
            <h4 className="text-base font-bold">Important Medical Disclaimer</h4>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              ManoMed AI is a clinical decision support and health information tool intended to assist patient education and preliminary triage. It does not constitute formal medical diagnosis or treatment prescribing. If you are experiencing sudden, severe chest pain, shortness of breath, loss of consciousness, or signs of stroke, dial 911 or your local emergency number immediately.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
