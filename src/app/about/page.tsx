"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Stethoscope,
  Activity,
  FileCheck2,
  Lock,
  HeartPulse,
  Brain,
  ArrowRight,
  Award,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const pillars = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-primary" />,
    title: "Safety-First Clinical Triage",
    desc: "Autonomous emergency red-flag screening designed to immediately rule out acute coronary syndromes, stroke, respiratory insufficiency, and acute abdominal emergencies before secondary workup.",
  },
  {
    icon: <Brain className="w-6 h-6 text-primary" />,
    title: "Calibrated Differential Reasoning",
    desc: "Built on rigorous clinical diagnostic taxonomies and ICD-10 codification. Incorporates patient demographics, past medical history, and follow-up clinical questions.",
  },
  {
    icon: <FileCheck2 className="w-6 h-6 text-primary" />,
    title: "Structured EHR Clinical Hand-Off",
    desc: "Transforms unstructured patient narratives into standard SOAP documentation (Subjective, Objective, Assessment, Plan) that clinicians can import directly into Electronic Health Records.",
  },
  {
    icon: <Lock className="w-6 h-6 text-primary" />,
    title: "Strict Patient Privacy & Ethics",
    desc: "Client-side ephemeral vault storage by default. Clinical sessions are processed with strict data minimization principles with zero advertising tracking or commercial monetization.",
  },
];

const standards = [
  {
    number: "01",
    title: "Standardized Triage Hierarchy",
    desc: "Every assessment maps strictly to Emergency (immediate ER), Urgent (within 24 hours), Routine (primary clinic consultation), or Self-Care (supportive home monitoring).",
  },
  {
    number: "02",
    title: "Evidence-Based Differentiating Evidence",
    desc: "Condition probabilities are explicitly correlated with positive supporting factors and unconfirmed counter-indicators to provide total diagnostic transparency.",
  },
  {
    number: "03",
    title: "Physician Partnership & Empowerment",
    desc: "ManoMed AI does not replace licensed medical practitioners. It prepares patients with informed consultation questions, recommended laboratory workups, and structured clinical summaries.",
  },
  {
    number: "04",
    title: "Continuous Clinical Safety Auditing",
    desc: "Reasoning prompts and safety rules are continuously audited against clinical guidelines from international medical bodies to prevent bias and hallucination.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Editorial Hero */}
      <section className="container mx-auto px-4 pt-16 pb-20 max-w-5xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <Stethoscope className="w-3.5 h-3.5" />
          Our Mission
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-3xl leading-[1.1] text-foreground">
          Clear, Compassionate Health Guidance for Everyone
        </h1>

        <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
          ManoMed AI helps take the anxiety and confusion out of feeling unwell. By combining smart medical intelligence with gentle, everyday language, we give patients calm and trustworthy answers, and give doctors clean visit summaries.
        </p>

        <div className="pt-4 flex flex-wrap gap-4">
          <Link href="/ManoMedai">
            <Button size="lg" className="min-h-[48px] rounded-xl px-8 font-semibold flex items-center gap-2 shadow-xs bg-primary text-primary-foreground">
              Check Symptoms Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="min-h-[48px] rounded-xl px-6 font-semibold border-border">
              Contact Our Team
            </Button>
          </Link>
        </div>
      </section>

      {/* Mission & Commitments */}
      <section className="bg-muted/30 border-y border-border/60 py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                Why We Built This
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Helping You Make Confident, Timely Health Decisions
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When symptoms begin, people often struggle to know whether to rush to the emergency room, book a doctor appointment, or safely rest at home. ManoMed AI provides immediate clarity so you always know the safest next step.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-foreground">
                  Structured for patient clarity and physician workflow integration.
                </span>
              </div>
            </div>

            <div className="md:col-span-5 p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  Institutional Commitments
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-foreground">Zero Commercial Bias:</strong> Diagnostic outputs are never influenced by pharmaceutical sponsorships or advertorial products.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-foreground">Clinical Safety Interceptors:</strong> Immediate alerts for acute cardiovascular, cerebrovascular, and pulmonary red flags.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-foreground">Data Minimization:</strong> Health data remains in client storage with end-to-end encrypted transient evaluation.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="container mx-auto px-4 py-20 max-w-5xl space-y-12">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
            OUR CORE VALUES
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Clear Guidance & Careful Accuracy
          </h2>
          <p className="text-sm text-muted-foreground">
            How our system ensures your guidance is both simple to read and medically sound:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p, idx) => (
            <Card key={idx} className="border-border shadow-xs bg-card">
              <CardContent className="p-6 space-y-3">
                <div className="p-2.5 rounded-xl bg-primary/10 w-fit">{p.icon}</div>
                <h3 className="text-base font-bold text-foreground">{p.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 4-Step Pipeline */}
      <section className="bg-muted/30 border-t border-border/60 py-20">
        <div className="container mx-auto px-4 max-w-5xl space-y-12">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
              How It Works
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Our 4-Step Health Journey
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {standards.map((s, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-card border border-border flex items-start gap-4 shadow-xs">
                <span className="text-2xl font-black text-primary/30 tracking-tight font-mono">{s.number}</span>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-2 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Clinical Advisory & Ethics Covenant
            </h4>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              ManoMed AI is a clinical decision support and health information tool intended to assist patient education and preliminary triage. It does not constitute formal medical diagnosis or prescription treatment. If you are experiencing sudden, severe chest pain, shortness of breath, loss of consciousness, or signs of stroke, dial <strong>911</strong> or your local emergency number immediately.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
