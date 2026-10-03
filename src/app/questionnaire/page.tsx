"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter } from "next/navigation";
import { generateQuestionnaire } from "@/ai/flows/generate-questionnaire-flow";
import {
  useAssessmentStore,
  StructuredQuestion,
} from "@/lib/assessment-store";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ClipboardCheck,
  Edit2,
  Keyboard,
} from "lucide-react";
import Loading from "@/components/Loading";

function QuestionnaireContent() {
  const router = useRouter();
  const { assessment, updateAssessment, isLoaded } = useAssessmentStore();

  const [questions, setQuestions] = useState<StructuredQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    // Check if symptoms exist
    if (!assessment.symptoms.primaryDescription && assessment.symptoms.symptomTags.length === 0) {
      router.push("/ManoMedai");
      return;
    }

    // If questions were already generated in this session, restore them
    if (assessment.structuredQuestions && assessment.structuredQuestions.length > 0) {
      setQuestions(assessment.structuredQuestions);
      setAnswers(assessment.answers || {});
      setIsLoading(false);
      return;
    }

    const fetchQuestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const vitalsSummary = Object.entries(assessment.vitals || {})
          .filter(([_, v]) => Boolean(v))
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");

        const generated = await generateQuestionnaire({
          symptoms: assessment.symptoms.primaryDescription,
          medicalHistory: assessment.medicalHistory || undefined,
          medications: assessment.medications?.length ? assessment.medications.join(", ") : undefined,
          allergies: assessment.allergies?.length ? assessment.allergies.join(", ") : undefined,
          vitals: vitalsSummary || undefined,
          age: assessment.patient.age || undefined,
          gender: assessment.patient.gender || undefined,
        });

        if (!generated || generated.length === 0) {
          throw new Error("No follow-up questions generated.");
        }

        setQuestions(generated);
        const initialAnswers: Record<string, string> = {};
        generated.forEach((q) => {
          initialAnswers[q.id] = "";
        });
        setAnswers(initialAnswers);

        updateAssessment({
          structuredQuestions: generated,
          answers: initialAnswers,
        });
      } catch (err: any) {
        console.error("Error generating questionnaire:", err);
        setError("Unable to generate diagnostic questions. Please check your connection or retry.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [isLoaded, assessment.symptoms.primaryDescription]);

  const handleSelectAnswer = useCallback((qId: string, val: string) => {
    setAnswers((prev) => {
      const updated = { ...prev, [qId]: val };
      updateAssessment({ answers: updated });
      return updated;
    });
  }, [updateAssessment]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowReviewModal(true);
    }
  }, [currentIndex, questions.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const currentQ = questions[currentIndex];
  const currentAnswer = currentQ ? answers[currentQ.id] || "" : "";

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentQ || showReviewModal) return;

      // Don't trigger shortcuts when typing in a text area
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return;
      }

      if (currentQ.type === "boolean") {
        if (e.key === "1" || e.key.toLowerCase() === "y") {
          e.preventDefault();
          handleSelectAnswer(currentQ.id, "Yes");
        } else if (e.key === "2" || e.key.toLowerCase() === "n") {
          e.preventDefault();
          handleSelectAnswer(currentQ.id, "No");
        }
      }

      if (e.key === "Enter") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQ, showReviewModal, handleSelectAnswer, handleNext, handlePrevious]);

  const handleFinalSubmit = () => {
    setShowReviewModal(false);
    router.push("/conditions");
  };

  if (isLoading) {
    return (
      <Loading
        title="Synthesizing Clinical Inquiries"
        description="Our AI engine is evaluating your symptoms to generate high-yield differential questions..."
      />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-6">
        <Card className="max-w-md w-full p-6 text-center space-y-4 border-destructive/40 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-bold">Diagnostic Generation Error</CardTitle>
          <CardDescription className="text-xs">{error}</CardDescription>
          <div className="flex gap-2 justify-center pt-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/ManoMedai")}>
              Edit Symptoms
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setIsLoading(true);
                setError(null);
                window.location.reload();
              }}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-4 py-8 bg-background">
      <Card className="w-full max-w-2xl shadow-2xl border-border/80 backdrop-blur-md">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                Differential Focus Question
              </span>
              {currentQ.category && (
                <Badge variant="outline" className="text-[10px] uppercase font-mono px-2 py-0.5">
                  {currentQ.category.replace(/_/g, " ")}
                </Badge>
              )}
            </div>
            <span className="font-bold text-foreground">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          <CardTitle className="text-xl sm:text-2xl font-bold leading-snug pt-1">
            {currentQ.question}
          </CardTitle>
          <Progress value={progressPercent} className="mt-3.5 h-2" />
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Clinical Rationale Box */}
          {currentQ.clinicalRationale && (
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold">Medical Intent: </span>
                {currentQ.clinicalRationale}
              </div>
            </div>
          )}

          {/* Interactive Answer Input based on Type */}
          <div className="py-2">
            {/* 1. BOOLEAN (Yes / No) */}
            {currentQ.type === "boolean" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleSelectAnswer(currentQ.id, "Yes")}
                    className={`p-6 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                      currentAnswer === "Yes"
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold shadow-lg scale-[1.02]"
                        : "border-border hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-foreground"
                    }`}
                  >
                    <CheckCircle className={`w-8 h-8 ${currentAnswer === "Yes" ? "text-emerald-500" : "text-muted-foreground"}`} />
                    <span className="text-lg">Yes</span>
                    <span className="text-[10px] text-muted-foreground font-mono">[Key: 1 / Y]</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectAnswer(currentQ.id, "No")}
                    className={`p-6 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                      currentAnswer === "No"
                        ? "border-gray-500 bg-muted text-foreground font-bold shadow-lg scale-[1.02]"
                        : "border-border hover:border-gray-400 hover:bg-muted/40 text-foreground"
                    }`}
                  >
                    <XCircle className={`w-8 h-8 ${currentAnswer === "No" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-lg">No</span>
                    <span className="text-[10px] text-muted-foreground font-mono">[Key: 2 / N]</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. SCALE (1 to 10) */}
            {currentQ.type === "scale" && (
              <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground">Select Intensity Level:</span>
                  <Badge variant="secondary" className="text-base px-3 py-1 font-bold">
                    {currentAnswer ? `${currentAnswer} / 10` : "Slide to choose (5/10)"}
                  </Badge>
                </div>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[Number(currentAnswer) || 5]}
                  onValueChange={(vals) => handleSelectAnswer(currentQ.id, String(vals[0]))}
                  className="cursor-pointer py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 (Very Mild)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Severe / Worst Possible)</span>
                </div>
              </div>
            )}

            {/* 3. CHOICE (Multiple Choice Buttons) */}
            {currentQ.type === "choice" && (
              <div className="space-y-2.5">
                {(currentQ.options && currentQ.options.length > 0
                  ? currentQ.options
                  : ["Mild", "Moderate", "Severe", "Unsure"]
                ).map((option) => {
                  const isSelected = currentAnswer === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelectAnswer(currentQ.id, option)}
                      className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-primary bg-primary/15 text-primary font-bold shadow-sm ring-1 ring-primary"
                          : "border-border hover:border-primary/40 hover:bg-muted/30 text-foreground"
                      }`}
                    >
                      <span>{option}</span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                        }`}
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white dark:bg-black" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 4. TEXT (Free Textarea) */}
            {currentQ.type === "text" && (
              <div className="space-y-2">
                <textarea
                  className="w-full min-h-[120px] p-3.5 rounded-xl border border-input bg-background text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary"
                  value={currentAnswer}
                  onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                  placeholder="Provide your specific response here..."
                />
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 h-10 px-4 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {!currentAnswer && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    handleSelectAnswer(currentQ.id, "Unsure / Skipped");
                    handleNext();
                  }}
                  className="text-xs text-muted-foreground h-10"
                >
                  Skip
                </Button>
              )}
              <Button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 h-10 shadow-md rounded-xl"
              >
                {currentIndex === questions.length - 1 ? (
                  <>
                    Review & Complete
                    <ClipboardCheck className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Modal before Final Synthesis */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              Review Questionnaire Responses
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirm your answers before our AI diagnostic engine calculates your clinical differential:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-3 rounded-xl border border-border bg-muted/20 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 flex-1">
                  <span className="font-semibold text-foreground block">
                    Q{idx + 1}: {q.question}
                  </span>
                  <span className="text-primary font-medium">
                    Answer: <strong>{answers[q.id] || "No response provided"}</strong>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReviewModal(false);
                    setCurrentIndex(idx);
                  }}
                  className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground shrink-0"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t">
            <Button
              variant="outline"
              onClick={() => setShowReviewModal(false)}
              className="text-xs"
            >
              Continue Reviewing
            </Button>
            <Button
              onClick={handleFinalSubmit}
              className="font-bold flex items-center gap-2 bg-primary text-primary-foreground shadow-md"
            >
              Generate Clinical Differential →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense
      fallback={
        <Loading
          title="Loading Health Assessment"
          description="Preparing your personalized clinical questionnaire..."
        />
      }
    >
      <QuestionnaireContent />
    </Suspense>
  );
}
