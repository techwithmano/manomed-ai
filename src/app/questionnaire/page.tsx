"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter } from "next/navigation";
import { generateQuestionnaire } from "@/ai/flows/generate-questionnaire-flow";
import {
  useAssessmentStore,
  StructuredQuestion,
} from "@/lib/assessment-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  ClipboardCheck,
  Edit2,
  Stethoscope,
  Clock,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import Loading from "@/components/Loading";
import Link from "next/link";

function QuestionnaireContent() {
  const router = useRouter();
  const { assessment, updateAssessment, isLoaded } = useAssessmentStore();

  const [questions, setQuestions] = useState<StructuredQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewStep, setIsReviewStep] = useState(false);

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

  const handleSelectAnswer = useCallback(
    (qId: string, val: string) => {
      setAnswers((prev) => {
        const updated = { ...prev, [qId]: val };
        updateAssessment({ answers: updated });
        return updated;
      });
    },
    [updateAssessment]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsReviewStep(true);
    }
  }, [currentIndex, questions.length]);

  const handlePrevious = useCallback(() => {
    if (isReviewStep) {
      setIsReviewStep(false);
      setCurrentIndex(questions.length - 1);
    } else if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [isReviewStep, currentIndex, questions.length]);

  const currentQ = questions[currentIndex];
  const currentAnswer = currentQ ? answers[currentQ.id] || "" : "";

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentQ || isReviewStep) return;

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
  }, [currentQ, isReviewStep, handleSelectAnswer, handleNext, handlePrevious]);

  const handleFinalSubmit = () => {
    router.push("/conditions");
  };

  if (isLoading) {
    return (
      <Loading
        title="Formulating Differential Inquiries"
        description="Our clinical triage engine is analyzing your intake narrative to generate calibrated follow-up questions..."
      />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-6 bg-background">
        <Card className="max-w-md w-full p-6 text-center space-y-4 border-destructive/40 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-bold">Diagnostic Questionnaire Error</CardTitle>
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

  const progressPercent = isReviewStep ? 100 : ((currentIndex + 1) / questions.length) * 100;
  const questionsRemaining = isReviewStep ? 0 : questions.length - (currentIndex + 1);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Link href="/ManoMedai" className="hover:text-foreground transition-colors">
              Intake
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span className="font-semibold text-foreground">
              {isReviewStep ? "Step 2 / Review Responses" : "Step 2 / Clarifying Questions"}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {isReviewStep
                ? "Ready for analysis"
                : questionsRemaining > 0
                ? `~${Math.ceil(questionsRemaining * 0.4)} min left`
                : "Final question"}
            </span>
            <span className="text-primary font-bold">
              {isReviewStep ? `${questions.length} / ${questions.length}` : `${currentIndex + 1} / ${questions.length}`}
            </span>
          </div>
        </div>

        {/* Accessible Segmented Progress Tracker */}
        <div
          role="progressbar"
          aria-label={`Questions progress: ${isReviewStep ? "All questions answered" : `Question ${currentIndex + 1} of ${questions.length}`}`}
          aria-valuenow={isReviewStep ? questions.length : currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={questions.length}
          className="space-y-2"
        >
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {isReviewStep ? "All Questions Complete" : `Question ${currentIndex + 1} of ${questions.length}`}
            </span>
            <span className="font-mono">{Math.round(progressPercent)}% Complete</span>
          </div>

          {/* Segmented visual progress bars */}
          <div
            className="grid gap-1.5 w-full"
            style={{ gridTemplateColumns: `repeat(${questions.length}, minmax(0, 1fr))` }}
            aria-hidden="true"
          >
            {questions.map((q, idx) => {
              const isPast = idx < currentIndex || isReviewStep;
              const isCurrent = idx === currentIndex && !isReviewStep;
              const hasAnswer = Boolean(answers[q.id]);
              return (
                <div
                  key={q.id || idx}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? "bg-primary ring-2 ring-primary/40 ring-offset-1"
                      : isPast || hasAnswer
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                  title={`Question ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Conditional Rendering: In-Card Review Step OR Active Question */}
        {isReviewStep ? (
          <Card className="shadow-lg border-border bg-card">
            <CardHeader className="pb-4 border-b border-border/60 space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                  Review & Confirm
                </span>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Review Your Answers
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                Please review your answers below before generating your diagnostic assessment. You can edit any answer or continue to differential analysis.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">
                          #{idx + 1}
                        </span>
                        {q.category && (
                          <span className="text-xs uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {q.category.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-foreground text-xs sm:text-sm">
                        {q.question}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your answer:{" "}
                        <strong className="text-foreground">
                          {answers[q.id] || "Skipped / Unanswered"}
                        </strong>
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsReviewStep(false);
                      }}
                      className="min-h-[44px] px-3.5 text-xs text-primary shrink-0 self-start sm:self-auto flex items-center gap-1.5 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit Answer
                    </Button>
                  </div>
                ))}
              </div>

              {/* Review Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsReviewStep(false);
                    setCurrentIndex(questions.length - 1);
                  }}
                  className="min-h-[44px] px-4 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back to Questions
                </Button>

                <Button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="min-h-[44px] px-8 text-xs sm:text-sm font-bold bg-primary text-primary-foreground shadow-sm flex items-center justify-center gap-2 rounded-xl hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Synthesize Clinical Differential →
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-border bg-card">
            <CardHeader className="pb-4 border-b border-border/60 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                    Question #{currentIndex + 1}
                  </span>
                </div>
                {currentQ.category && (
                  <Badge variant="outline" className="text-xs font-mono uppercase border-border">
                    {currentQ.category.replace(/_/g, " ")}
                  </Badge>
                )}
              </div>

              <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug pt-1 text-foreground">
                {currentQ.question}
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Clinical Rationale Box */}
              {currentQ.clinicalRationale && (
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 flex items-start gap-2.5 text-xs text-foreground/90">
                  <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-semibold text-foreground">Why we ask this: </span>
                    <span className="text-muted-foreground">{currentQ.clinicalRationale}</span>
                  </div>
                </div>
              )}

              {/* Answer Options */}
              <div className="py-2">
                {/* 1. BOOLEAN (Yes / No) */}
                {currentQ.type === "boolean" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleSelectAnswer(currentQ.id, "Yes")}
                      className={`min-h-[96px] p-5 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                        currentAnswer === "Yes"
                          ? "border-emerald-600 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 font-bold shadow-sm ring-2 ring-emerald-500/30"
                          : "border-border hover:border-emerald-600/50 hover:bg-muted/30 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-5 h-5 ${
                            currentAnswer === "Yes" ? "text-emerald-600" : "text-muted-foreground"
                          }`}
                        />
                        <span className="text-lg font-bold">Yes</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        [Shortcut: 1 or Y]
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectAnswer(currentQ.id, "No")}
                      className={`min-h-[96px] p-5 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                        currentAnswer === "No"
                          ? "border-slate-600 bg-slate-500/10 text-foreground font-bold shadow-sm ring-2 ring-slate-500/30"
                          : "border-border hover:border-slate-500/50 hover:bg-muted/30 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <XCircle
                          className={`w-5 h-5 ${
                            currentAnswer === "No" ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <span className="text-lg font-bold">No</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        [Shortcut: 2 or N]
                      </span>
                    </button>
                  </div>
                )}

                {/* 2. SCALE (1 to 10) */}
                {currentQ.type === "scale" && (
                  <div className="p-6 rounded-2xl border border-border bg-muted/20 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground">Select Intensity Level:</span>
                      <Badge variant="outline" className="text-sm font-mono font-bold px-3 py-1">
                        {currentAnswer ? `${currentAnswer} / 10` : "Slide to adjust (5/10)"}
                      </Badge>
                    </div>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[Number(currentAnswer) || 5]}
                      onValueChange={(vals) => handleSelectAnswer(currentQ.id, String(vals[0]))}
                      className="cursor-pointer py-4"
                      aria-label="Scale input slider"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 (Very Mild)</span>
                      <span>5 (Moderate)</span>
                      <span>10 (Severe / Worst)</span>
                    </div>
                  </div>
                )}

                {/* 3. CHOICE (Multiple Choice) */}
                {currentQ.type === "choice" && (
                  <div className="space-y-2.5">
                    {(currentQ.options && currentQ.options.length > 0
                      ? currentQ.options
                      : ["Mild", "Moderate", "Severe", "Unsure / Fluctuating"]
                    ).map((option) => {
                      const isSelected = currentAnswer === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSelectAnswer(currentQ.id, option)}
                          className={`w-full min-h-[48px] p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            isSelected
                              ? "border-primary bg-primary/10 text-foreground font-semibold shadow-xs ring-1 ring-primary/40"
                              : "border-border hover:border-primary/50 hover:bg-muted/40 text-foreground/90"
                          }`}
                        >
                          <span>{option}</span>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-card"
                            }`}
                          >
                            {isSelected && <span className="w-2 h-2 rounded-full bg-primary-foreground" />}
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
                      className="w-full min-h-[120px] p-3.5 rounded-xl border border-input bg-card text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary"
                      value={currentAnswer}
                      onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                      placeholder="Provide details relevant to this question..."
                    />
                  </div>
                )}
              </div>

              {/* Stepper Navigation */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="min-h-[44px] px-4 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Previous Question
                </Button>

                <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
                  {!currentAnswer && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        handleSelectAnswer(currentQ.id, "Unsure / Skipped");
                        handleNext();
                      }}
                      className="min-h-[44px] text-xs text-muted-foreground flex-1 sm:flex-initial"
                    >
                      Skip
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="min-h-[44px] px-6 text-xs font-bold bg-primary text-primary-foreground shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-initial rounded-xl hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    {currentIndex === questions.length - 1 ? (
                      <>
                        Review Answers
                        <ClipboardCheck className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Next Question
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Diagnostic Security Footer */}
        {/* TODO: VERIFY SECURITY CLAIMS — Confirm browser session privacy architecture */}
        <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2 pt-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Responses are kept in your current browser session.</span>
        </div>
      </div>
    </div>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense
      fallback={
        <Loading
          title="Loading Clinical Session"
          description="Preparing follow-up questionnaire..."
        />
      }
    >
      <QuestionnaireContent />
    </Suspense>
  );
}
