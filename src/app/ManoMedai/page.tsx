"use client";

import { SymptomInputForm } from "@/components/SymptomInputForm";
import { useRouter } from "next/navigation";
import {
  useAssessmentStore,
  CurrentAssessment,
  getAssessmentHistory,
} from "@/lib/assessment-store";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  History,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ManoMedAIPage() {
  const router = useRouter();
  const { assessment, updateAssessment, isLoaded } = useAssessmentStore();
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    const history = getAssessmentHistory();
    setHistoryCount(history.length);
  }, []);

  const handleStartAnalysis = (data: CurrentAssessment) => {
    updateAssessment(data);
    router.push("/questionnaire");
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb & Vault Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Clinical Portal
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span className="font-semibold text-foreground">Intake & Triage Workspace</span>
          </div>

          <div className="flex items-center gap-3">
            {historyCount > 0 && (
              <Link href="/history">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-[36px] flex items-center gap-2 text-xs border-border/80"
                >
                  <History className="w-3.5 h-3.5 text-primary" />
                  My Past Records ({historyCount})
                </Button>
              </Link>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Private & Secure Session</span>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <Stethoscope className="w-4 h-4" />
            Step 1 / Tell Us What's Bothering You
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Check Your Symptoms
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Describe how you are feeling in simple everyday words. Tell us where it hurts, how long it's been going on, and any medications you take. We will guide you with clear questions and help you prepare for a doctor visit.
          </p>
        </div>

        {/* Form Container */}
        <div>
          {isLoaded ? (
            <SymptomInputForm
              initialData={assessment}
              onSubmit={handleStartAnalysis}
            />
          ) : (
            <div className="p-16 rounded-2xl border border-border bg-card/50 text-center space-y-3">
              <Activity className="w-8 h-8 text-primary animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground font-medium">
                Loading your health check session...
              </p>
            </div>
          )}
        </div>

        {/* Emergency Notice */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-foreground">Medical Disclaimer:</strong> ManoMed AI helps guide your health decisions and prepare for doctor visits, but does not replace emergency medical care. If you or a loved one have severe chest pain, trouble breathing, heavy bleeding, or sudden weakness or numbness, call <strong>911</strong> or go to the nearest emergency room immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
