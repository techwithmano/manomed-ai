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
                  Audit Vault ({historyCount} Records)
                </Button>
              </Link>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HIPAA-Conscious Session</span>
            </div>
          </div>
        </div>

        {/* Clinical Section Header */}
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <Stethoscope className="w-4 h-4" />
            Stage 01 / Patient Intake & Anatomical Localization
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-foreground">
            Clinical Symptom Intake & Preliminary Triage
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Record patient demographics, chief complaints, pharmacological history, and localize symptomatic anatomical regions. Our evidence-grounded inference engine calibrates follow-up differential inquiries in real time.
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
                Loading clinical intake session...
              </p>
            </div>
          )}
        </div>

        {/* Emergency Escalation Notice */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-foreground">Critical Medical Disclaimer:</strong> ManoMed AI is a clinical decision-support and preparatory health education tool. It does not provide formal diagnosis or prescription treatment. If you or the patient are experiencing sudden crushing chest pain, acute respiratory distress, severe uncontrolled hemorrhage, or focal neurological deficits (facial drooping, unilateral arm weakness, slurred speech), dial <strong>911</strong> or your local emergency number immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
