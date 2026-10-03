"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { symptomAnalysis } from "@/ai/flows/symptom-analysis";
import { ConditionDisplay } from "@/components/ConditionDisplay";
import { Disclaimer } from "@/components/Disclaimer";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import {
  useAssessmentStore,
  ClinicalAnalysisResult,
  saveAssessmentToHistory,
} from "@/lib/assessment-store";
import { AlertCircle, RefreshCw, ArrowLeft, ChevronRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

function ConditionsContent() {
  const router = useRouter();
  const { assessment, updateAssessment, resetAssessment, isLoaded } = useAssessmentStore();

  const [result, setResult] = useState<ClinicalAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    // Check if symptoms exist
    if (!assessment.symptoms.primaryDescription && assessment.symptoms.symptomTags.length === 0) {
      setIsLoading(false);
      return;
    }

    // If an analysis result is already cached in store, display it immediately
    if (assessment.result) {
      setResult(assessment.result);
      setIsLoading(false);
      return;
    }

    const runAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const qaFormatted = assessment.structuredQuestions
          .map((q, idx) => {
            const answer = assessment.answers[q.id] || "No response provided";
            return `Q${idx + 1} (${q.question}): ${answer}`;
          })
          .join("\n");

        const vitalsFormatted = Object.entries(assessment.vitals || {})
          .filter(([_, v]) => Boolean(v))
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");

        const analysisOutput = await symptomAnalysis({
          name: assessment.patient.name,
          age: assessment.patient.age,
          gender: assessment.patient.gender,
          symptoms: assessment.symptoms.primaryDescription,
          medicalHistory: assessment.medicalHistory || undefined,
          medications: assessment.medications?.length ? assessment.medications.join(", ") : undefined,
          allergies: assessment.allergies?.length ? assessment.allergies.join(", ") : undefined,
          vitals: vitalsFormatted || undefined,
          questionnaireAnswers: qaFormatted || undefined,
        });

        const clinicalResult: ClinicalAnalysisResult = {
          ...analysisOutput,
          id: analysisOutput.id || `eval_${Date.now()}`,
          timestamp: analysisOutput.timestamp || new Date().toISOString(),
        };

        setResult(clinicalResult);

        const updatedAssessment = {
          ...assessment,
          result: clinicalResult,
        };
        updateAssessment({ result: clinicalResult });
        saveAssessmentToHistory(updatedAssessment);
      } catch (err: any) {
        console.error("Clinical symptom analysis failed:", err);
        setError(
          err.message || "Unable to complete clinical evaluation. Please check your connection and try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    runAnalysis();
  }, [isLoaded, assessment.symptoms.primaryDescription]);

  const handleStartNew = () => {
    resetAssessment();
    router.push("/ManoMedai");
  };

  if (!isLoaded || isLoading) {
    return (
      <Loading
        title="Synthesizing Clinical Differential"
        description="Our AI engine is formulating condition probabilities, stratified triage levels, and EHR documentation..."
      />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6 py-12 bg-background">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="w-5 h-5" />
            <AlertTitle>Clinical Evaluation Error</AlertTitle>
            <AlertDescription className="text-xs mt-1">{error}</AlertDescription>
          </Alert>

          <div className="flex justify-between items-center pt-2">
            <Button variant="outline" onClick={() => router.push("/questionnaire")} className="text-xs min-h-[40px]">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to Questions
            </Button>
            <Button
              onClick={() => {
                setIsLoading(true);
                setError(null);
                window.location.reload();
              }}
              className="text-xs flex items-center gap-1.5 min-h-[40px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Analysis
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6 py-12 text-center bg-background">
        <div className="max-w-md space-y-4">
          <h2 className="font-serif text-2xl font-normal text-foreground">No Active Assessment Found</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            To view calibrated condition differentials and generated clinical documentation, please complete the intake and diagnostic inquiry.
          </p>
          <Button onClick={() => router.push("/ManoMedai")} className="min-h-[44px] px-6">
            Begin Clinical Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] px-4 py-8 bg-background text-foreground">
      {/* Navigation Breadcrumb */}
      <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-muted-foreground pb-6 mb-6 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Link href="/ManoMedai" className="hover:text-foreground transition-colors">
            Intake
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <Link href="/questionnaire" className="hover:text-foreground transition-colors">
            Inquiry
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="font-semibold text-foreground">Stage 03 / Clinical Evaluation & EHR Hand-Off</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Case Evaluated</span>
        </div>
      </div>

      <ConditionDisplay
        result={result}
        assessment={assessment}
        onStartNew={handleStartNew}
      />
      <div className="max-w-5xl mx-auto mt-6">
        <Disclaimer />
      </div>
    </div>
  );
}

export default function ConditionsPage() {
  return (
    <Suspense
      fallback={
        <Loading
          title="Loading Clinical Analysis"
          description="Preparing clinical decision report..."
        />
      }
    >
      <ConditionsContent />
    </Suspense>
  );
}
