"use client";

import { SymptomInputForm } from "@/components/SymptomInputForm";
import { useRouter } from "next/navigation";
import { useAssessmentStore, CurrentAssessment, getAssessmentHistory } from "@/lib/assessment-store";
import { useState, useEffect } from "react";
import Link from "next/link";
import { History, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-4 py-8 bg-background text-foreground">
      <div className="w-full max-w-4xl flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Google GenAI Clinical Decision Support
          </span>
        </div>
        {historyCount > 0 && (
          <Link href="/history">
            <Button variant="outline" size="sm" className="flex items-center gap-2 text-xs">
              <History className="w-3.5 h-3.5" />
              Past Assessments ({historyCount})
            </Button>
          </Link>
        )}
      </div>

      <div className="text-center mb-8 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-3">
          ManoMed Clinical Triage
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Evidence-grounded medical symptom evaluation, differential diagnosis, and clinical recommendations.
        </p>
      </div>

      <div className="w-full max-w-3xl">
        {isLoaded ? (
          <SymptomInputForm
            initialData={assessment}
            onSubmit={handleStartAnalysis}
          />
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            Loading assessment workspace...
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-xs text-muted-foreground max-w-xl flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          ManoMed AI complies with medical ethics and privacy guidelines. For acute, sudden life-threatening crises, immediately call emergency services (911).
        </span>
      </div>
    </div>
  );
}
