'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Activity,
  FileText,
  History,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    title: '4-Tier Clinical Triage',
    desc: 'Instant emergency red-flag screening categorizing symptoms into Emergency, Urgent, Routine, or Self-Care with clear guidance.',
  },
  {
    icon: <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    title: 'Differential Diagnosis',
    desc: 'Calibrated condition probabilities powered by Google GenAI, complete with ICD-10 codes, supporting factors, and rule-outs.',
  },
  {
    icon: <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
    title: 'EHR / SOAP Notes',
    desc: 'Instantly generate clinical SOAP documentation (Subjective, Objective, Assessment, Plan) formatted for medical record hand-off.',
  },
  {
    icon: <Stethoscope className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
    title: 'Doctor Inquiries & Tests',
    desc: 'Actionable checklists of questions to ask your physician and recommended laboratory/imaging diagnostic workups to request.',
  },
];

const triageLevels = [
  {
    level: 'EMERGENCY',
    badge: 'bg-red-600 text-white',
    desc: 'Immediate 911 / Emergency Room evaluation for acute cardiac, neurologic, or respiratory crises.',
  },
  {
    level: 'URGENT',
    badge: 'bg-amber-500 text-white',
    desc: 'Urgent Care or same-day medical clinic visit recommended within 12 to 24 hours.',
  },
  {
    level: 'ROUTINE',
    badge: 'bg-blue-600 text-white',
    desc: 'Scheduled primary care consultation for stable, non-emergent symptoms within days.',
  },
  {
    level: 'SELF-CARE',
    badge: 'bg-emerald-600 text-white',
    desc: 'Evidence-based supportive home management, hydration, rest, and monitoring criteria.',
  },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="bg-background text-foreground flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-12 pb-20 max-w-5xl flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Clinical-Grade AI Medical Triage & Differential Diagnosis
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.15] mb-6">
          Evidence-Grounded AI Healthcare Insights for <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Every Patient</span>
        </h1>

        <p className="max-w-2xl text-base sm:text-lg text-muted-foreground mb-10 leading-relaxed">
          Move beyond generic search results. ManoMed AI combines dynamic medical intake, voice dictation, red-flag screening, and Google GenAI to synthesize structured differential diagnoses and doctor-ready clinical summaries.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button
            size="lg"
            onClick={() => router.push('/ManoMedai')}
            className="px-8 h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg rounded-2xl flex items-center justify-center gap-2"
          >
            Start Clinical Assessment
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Link href="/history">
            <Button
              variant="outline"
              size="lg"
              className="px-6 h-12 text-base rounded-2xl flex items-center justify-center gap-2 w-full"
            >
              <History className="w-4 h-4 text-muted-foreground" />
              Past Assessments
            </Button>
          </Link>
        </div>

        {/* Quick Safety Callout */}
        <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Private & Client-Side Cached • No forced sign-up • Instant PDF Export</span>
        </div>
      </section>

      {/* Triage Overview Grid */}
      <section className="bg-muted/30 border-y border-border/60 py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Structured 4-Tier Medical Triage
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Every evaluation is mapped to an actionable timeframe so patients know exactly when and where to seek professional care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {triageLevels.map((t, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <Badge className={`px-2.5 py-0.5 text-xs font-bold ${t.badge}`}>
                    {t.level}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Built for True Medical Utility
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Engineered with clinical rigor to provide actionable insights for patients and clear, standard documentation for treating physicians.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-md transition-all flex items-start gap-4"
            >
              <div className="p-3 rounded-xl bg-muted/60 shrink-0">
                {feat.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl space-y-6">
          <HeartPulse className="w-12 h-12 text-blue-300 mx-auto" />
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Analyze Your Symptoms?
          </h2>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Begin your intake questionnaire in seconds. Get evidence-based differential likelihoods and a downloadable clinical consultation summary.
          </p>
          <div className="pt-2">
            <Button
              size="lg"
              onClick={() => router.push('/ManoMedai')}
              className="px-8 h-12 text-base font-semibold bg-white text-blue-900 hover:bg-blue-50 shadow-xl rounded-2xl"
            >
              Start Free Assessment Now →
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}