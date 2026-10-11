"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  Download,
  Copy,
  Check,
  FileText,
  Stethoscope,
  PhoneCall,
  Activity,
  ExternalLink,
  RotateCcw,
  ClipboardList,
  FlaskConical,
  Scan,
  Printer,
  Clock,
  MapPin,
  HeartPulse,
} from "lucide-react";
import { exportClinicalReportPDF } from "@/lib/pdf-export";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { ClinicalAnalysisResult, CurrentAssessment } from "@/lib/assessment-store";
import { emergencyConfig } from "@/lib/emergencyConfig";
import {
  getPatientLikelihoodInterpretation,
  FALLBACK_EMERGENCY_CARE_TRIGGERS,
  FALLBACK_SAFE_SELF_CARE,
  FALLBACK_DOCTOR_QUESTIONS,
  CLINICAL_EDUCATION_DISCLAIMER,
} from "@/lib/clinicalConfig";
import Link from "next/link";

interface ConditionDisplayProps {
  result: ClinicalAnalysisResult;
  assessment: CurrentAssessment;
  onStartNew?: () => void;
}

export const ConditionDisplay: React.FC<ConditionDisplayProps> = ({
  result,
  assessment,
  onStartNew,
}) => {
  const [copiedSOAP, setCopiedSOAP] = useState(false);
  const [copiedQuestions, setCopiedQuestions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});
  const [viewMode, setViewMode] = useState<"patient" | "clinical">("patient");

  const toggleQuestionCheck = (idx: number) => {
    setCheckedQuestions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copySOAPNote = () => {
    const text = `=== CLINICAL SOAP NOTE (ManoMed AI) ===
PATIENT: ${assessment.patient.name || "Anonymous"} | Age: ${assessment.patient.age || "N/A"} | Sex: ${assessment.patient.gender || "N/A"}
DATE: ${new Date(result.timestamp).toLocaleString()}
TRIAGE LEVEL: ${result.triage.level} (${result.triage.timeframe})

[SUBJECTIVE]
${result.soapNote.subjective}

[OBJECTIVE]
${result.soapNote.objective}

[ASSESSMENT]
${result.soapNote.assessment}

[PLAN]
${result.soapNote.plan}

=== END OF NOTE ===`;

    navigator.clipboard.writeText(text);
    setCopiedSOAP(true);
    setTimeout(() => setCopiedSOAP(false), 2500);
  };

  const questionsList =
    result.questionsForDoctor && result.questionsForDoctor.length > 0
      ? result.questionsForDoctor
      : FALLBACK_DOCTOR_QUESTIONS;

  const copyDoctorQuestions = () => {
    const text = `Questions for My Healthcare Provider (ManoMed AI):
${questionsList.map((q, i) => `${i + 1}. ${q}`).join("\n")}`;

    navigator.clipboard.writeText(text);
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 2500);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const emergencyTriggers =
    result.whenToSeekEmergencyCare && result.whenToSeekEmergencyCare.length > 0
      ? result.whenToSeekEmergencyCare
      : FALLBACK_EMERGENCY_CARE_TRIGGERS;

  const homeCareSteps =
    result.safeSelfCare && result.safeSelfCare.length > 0
      ? result.safeSelfCare
      : FALLBACK_SAFE_SELF_CARE;

  // Recharts probability comparison data for Clinician View
  const chartData = result.conditions.map((c) => ({
    name: c.condition.length > 22 ? c.condition.substring(0, 20) + "..." : c.condition,
    fullName: c.condition,
    likelihood: Math.round(c.likelihood * 100),
    riskLevel: c.riskLevel,
  }));

  const getTriageTheme = (level: string) => {
    switch (level) {
      case "EMERGENCY":
        return {
          bg: "bg-destructive/10 border-destructive text-foreground",
          badge: "bg-destructive text-destructive-foreground",
          icon: <AlertTriangle className="w-6 h-6 text-destructive animate-pulse" />,
          title: "Immediate Emergency Care Required",
          gaugeIndex: 3,
        };
      case "URGENT":
        return {
          bg: "bg-amber-500/10 border-amber-500 text-foreground",
          badge: "bg-amber-600 text-white",
          icon: <ShieldAlert className="w-6 h-6 text-amber-600" />,
          title: "Urgent Medical Evaluation Recommended",
          gaugeIndex: 2,
        };
      case "ROUTINE":
        return {
          bg: "bg-blue-500/10 border-blue-500 text-foreground",
          badge: "bg-blue-600 text-white",
          icon: <Stethoscope className="w-6 h-6 text-blue-600" />,
          title: "Routine Primary Care Consultation",
          gaugeIndex: 1,
        };
      default:
        return {
          bg: "bg-emerald-500/10 border-emerald-500 text-foreground",
          badge: "bg-emerald-600 text-white",
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
          title: "Supportive Home Care & Monitoring",
          gaugeIndex: 0,
        };
    }
  };

  const triageTheme = getTriageTheme(result.triage.level);
  const isEmergency = result.triage.level === "EMERGENCY";
  const isEmergencyOrUrgent = isEmergency || result.triage.level === "URGENT";

  const generatePDF = async () => {
    setIsExporting(true);
    try {
      await exportClinicalReportPDF(assessment);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16">
      {/* 1. VISUAL TRIAGE URGENCY BANNER */}
      {/* Accessibility: Announced on page load with role="alert" for emergency/urgent, role="status" for routine */}
      <section
        role={isEmergencyOrUrgent ? "alert" : "status"}
        aria-live={isEmergency ? "assertive" : "polite"}
        className={`p-6 sm:p-8 rounded-3xl border-2 shadow-sm transition-all ${triageTheme.bg}`}
      >
        {/* If emergency, render emergency guidance first */}
        {isEmergency && (
          <div className="mb-6 p-4 rounded-2xl bg-destructive text-destructive-foreground space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm tracking-wide uppercase">
              <AlertTriangle className="w-5 h-5 shrink-0 animate-pulse" />
              <span>Immediate Emergency Protocol</span>
            </div>
            <p className="text-xs sm:text-sm font-medium leading-relaxed">
              {result.emergencyGuidance ||
                "If you are experiencing severe, sudden, or life-threatening symptoms, contact your local emergency services or go to the nearest emergency room immediately."}
            </p>
            {emergencyConfig.medicalEmergencyNumber ? (
              <div className="pt-2">
                <a
                  href={`tel:${emergencyConfig.medicalEmergencyNumber}`}
                  className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-white text-destructive font-bold text-xs shadow-sm hover:bg-neutral-100 transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  Call Emergency Services ({emergencyConfig.medicalEmergencyNumber})
                </a>
              </div>
            ) : (
              <p className="text-xs font-semibold underline pt-1">
                Call your local emergency number (such as 911, 999, or 112) or proceed to the nearest emergency department immediately.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs shrink-0">
              {triageTheme.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${triageTheme.badge}`}>
                  {result.triage.level}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Care Window: <strong className="text-foreground">{result.triage.timeframe}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {triageTheme.title}
              </h1>
              <p className="text-xs sm:text-sm max-w-2xl leading-relaxed text-muted-foreground">
                {result.triage.recommendedAction}
              </p>
            </div>
          </div>

          {/* Action Buttons (Print & PDF) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0 print:hidden">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 min-h-[44px] px-4 font-semibold border-border rounded-xl"
            >
              <Printer className="w-4 h-4 text-primary" />
              Print Summary
            </Button>
            <Button
              type="button"
              onClick={generatePDF}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold min-h-[44px] px-5 shadow-sm rounded-xl"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Compiling PDF..." : "Export Clinical PDF"}
            </Button>
          </div>
        </div>

        {/* 4-Tier Visual Triage Severity Gauge Meter */}
        <div className="mt-8 pt-6 border-t border-border/70 print:hidden">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
            <span>Triage Hierarchy</span>
            <span>Stratum: {result.triage.level}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: "Self-Care", color: "bg-emerald-500", desc: "Home Monitoring" },
              { label: "Routine", color: "bg-blue-500", desc: "Primary Care Clinic" },
              { label: "Urgent", color: "bg-amber-500", desc: "Urgent Care (<24h)" },
              { label: "Emergency", color: "bg-destructive", desc: "Emergency Dept" },
            ].map((tier, idx) => {
              const isCurrent = idx === triageTheme.gaugeIndex;
              return (
                <div key={tier.label} className="p-2.5 rounded-xl bg-card/60 border border-border/70 space-y-1.5 text-center">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      isCurrent
                        ? `${tier.color} ring-2 ring-primary/40 shadow-xs`
                        : "bg-muted/70 opacity-40"
                    }`}
                  />
                  <div>
                    <span
                      className={`text-xs block leading-tight ${
                        isCurrent ? "font-bold text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {tier.label}
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      {tier.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. NON-DISMISSIBLE ONE-SENTENCE CLINICAL DISCLAIMER */}
      <aside aria-label="Clinical disclaimer" className="p-4 rounded-2xl bg-muted/50 border border-border/80 text-xs text-muted-foreground flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {CLINICAL_EDUCATION_DISCLAIMER}
        </p>
      </aside>

      {/* 3. AUDIENCE VIEW SWITCHER */}
      {/* 
        NOTE: Role-based gating is not yet present in the app. Full clinical access control must be integrated
        with hospital/doctor account authentication. This view switcher is informational and must not be
        presented as access control to patients.
      */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 pt-1 print:hidden">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Evaluation Detail View:
        </span>
        <div
          role="tablist"
          aria-label="Result perspective switcher"
          className="inline-flex p-1 rounded-xl bg-muted border border-border text-xs font-semibold"
        >
          <button
            role="tab"
            id="tab-patient"
            aria-selected={viewMode === "patient"}
            aria-controls="panel-patient"
            type="button"
            onClick={() => setViewMode("patient")}
            className={`min-h-[44px] px-4 py-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              viewMode === "patient"
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Patient summary
          </button>
          <button
            role="tab"
            id="tab-clinical"
            aria-selected={viewMode === "clinical"}
            aria-controls="panel-clinical"
            type="button"
            onClick={() => setViewMode("clinical")}
            className={`min-h-[44px] px-4 py-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              viewMode === "clinical"
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Clinician view (for healthcare professionals)
          </button>
        </div>
      </div>

      {/* VIEW 1: PATIENT SUMMARY (DEFAULT) */}
      {viewMode === "patient" && (
        <div
          id="panel-patient"
          role="tabpanel"
          aria-labelledby="tab-patient"
          className="space-y-6 animate-in fade-in duration-200"
        >
          {/* Section: "Based on what you told us:" (Echo of user input) */}
          {/* Privacy Guarantee: Rendered strictly as local read-only plain text */}
          <Card className="clinical-card">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-primary" />
                Based on what you told us
              </CardTitle>
              <CardDescription className="text-xs">
                Your reported concerns and context used for this evaluation:
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-2">
                <span className="font-semibold text-foreground block">Main Symptom Description:</span>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {assessment.symptoms.primaryDescription || "No primary narrative entered."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Timing & Duration:
                  </span>
                  <span className="font-semibold text-foreground block">
                    {assessment.symptoms.duration || "Recent"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    Body Region:
                  </span>
                  <span className="font-semibold text-foreground block">
                    {assessment.symptoms.selectedBodyRegions?.length
                      ? assessment.symptoms.selectedBodyRegions.join(", ")
                      : "General / Unspecified"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    Reported Discomfort:
                  </span>
                  <span className="font-semibold text-foreground block">
                    {assessment.symptoms.severity ? `${assessment.symptoms.severity} / 10` : "Not rated"}
                  </span>
                </div>
              </div>

              {assessment.symptoms.symptomTags && assessment.symptoms.symptomTags.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-muted-foreground font-medium block">Reported Symptom Tags:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {assessment.symptoms.symptomTags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-card border border-border text-foreground font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section: "What this usually means" (Top Possibilities in Plain Words) */}
          {/* Rule: No ICD-10 codes, no raw percentages, qualitative translations */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                What this usually means
              </h2>
              <p className="text-xs text-muted-foreground">
                These are the most relevant conditions suggested by your answers. Review them with your doctor for confirmation.
              </p>
            </div>

            <div className="grid gap-4">
              {result.conditions.slice(0, 3).map((item, idx) => {
                const interp = getPatientLikelihoodInterpretation(item.likelihood, item.riskLevel);
                return (
                  <Card
                    key={idx}
                    className={`clinical-card ${
                      idx === 0 ? "border-primary/50 shadow-sm" : "border-border"
                    }`}
                  >
                    <CardHeader className="pb-3 border-b border-border/50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                          {item.condition}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={`text-xs px-3 py-1 font-semibold self-start sm:self-auto border ${interp.badgeStyle}`}
                        >
                          {interp.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                        {item.description}
                      </p>

                      {item.supportingEvidence && item.supportingEvidence.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-muted/30 border border-border text-xs space-y-1.5">
                          <span className="font-semibold text-foreground block">
                            Why this was considered:
                          </span>
                          <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                            {item.supportingEvidence.map((ev, i) => (
                              <li key={i}>{ev}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Section: "Questions to ask your doctor" */}
          {/* Proper <label> + checkbox with 44px targets & clipboard copy announced to screen readers */}
          <Card className="clinical-card">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  Questions to ask your doctor
                </CardTitle>
                <CardDescription className="text-xs">
                  Check off items as you discuss them at your appointment:
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyDoctorQuestions}
                  className="min-h-[44px] px-4 flex items-center gap-2 text-xs font-semibold border-border rounded-xl"
                  aria-label="Copy list of doctor questions to clipboard"
                >
                  {copiedQuestions ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Questions</span>
                    </>
                  )}
                </Button>
                {/* Screen reader notification for copy */}
                <div role="status" aria-live="polite" className="sr-only">
                  {copiedQuestions ? "Doctor questions copied to clipboard" : ""}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5">
              {questionsList.map((question, idx) => {
                const inputId = `patient-q-${idx}`;
                const isChecked = !!checkedQuestions[idx];
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs transition-colors min-h-[44px] ${
                      isChecked
                        ? "bg-muted/40 border-border line-through text-muted-foreground opacity-75"
                        : "bg-card border-border hover:border-primary/50 text-foreground"
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={inputId}
                      checked={isChecked}
                      onChange={() => toggleQuestionCheck(idx)}
                      className="w-5 h-5 rounded border-border text-primary focus:ring-primary focus:ring-offset-2 mt-0.5 shrink-0 cursor-pointer"
                    />
                    <label
                      htmlFor={inputId}
                      className="leading-relaxed font-medium flex-1 cursor-pointer select-none"
                    >
                      {question}
                    </label>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Section: "When to seek emergency care" & "Safe Supportive Care" */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Emergency triggers */}
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-2">
              <h3 className="font-bold flex items-center gap-1.5 text-sm">
                <AlertTriangle className="w-4 h-4" />
                When to seek emergency care
              </h3>
              <p className="text-muted-foreground text-xs">
                Go to the nearest emergency department or call your local emergency number immediately if you experience:
              </p>
              <ul className="list-disc list-inside space-y-1 font-medium text-destructive pt-1">
                {emergencyTriggers.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>

            {/* Supportive home care */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2 text-xs">
              <h3 className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Supportive steps you can take at home
              </h3>
              <p className="text-muted-foreground text-xs">
                Safe supportive measures while you monitor symptoms and await your doctor visit:
              </p>
              <ul className="space-y-1.5 text-muted-foreground pt-1">
                {homeCareSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CLINICIAN VIEW (FOR HEALTHCARE PROFESSIONALS) */}
      {viewMode === "clinical" && (
        <div
          id="panel-clinical"
          role="tabpanel"
          aria-labelledby="tab-clinical"
          className="space-y-6 animate-in fade-in duration-200"
        >
          <Tabs defaultValue="differential" className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1.5 bg-muted/60 rounded-2xl border border-border gap-1">
              <TabsTrigger
                value="differential"
                className="min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-xs"
              >
                Differential Diagnosis
              </TabsTrigger>
              <TabsTrigger
                value="doctor"
                className="min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-xs"
              >
                Workup & Inquiries
              </TabsTrigger>
              <TabsTrigger
                value="soap"
                className="min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-xs"
              >
                EHR SOAP Note
              </TabsTrigger>
              <TabsTrigger
                value="selfcare"
                className="min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-xs"
              >
                Self-Care & Warnings
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: DIFFERENTIAL DIAGNOSIS */}
            <TabsContent value="differential" className="space-y-6 pt-4">
              {/* Model-Estimated Likelihood Comparison Chart */}
              <Card className="border-border shadow-xs bg-card">
                <CardHeader className="pb-2 border-b border-border/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        Model-Estimated Likelihood Distribution
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Estimated likelihood scores from reported symptoms, demographics, and clinical follow-up answers:
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono self-start sm:self-auto border-border">
                      DIAGNOSTIC SYNTHESIS
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                      >
                        <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                        <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(val: any) => [`${val}%`, "Estimated Likelihood"]}
                          labelFormatter={(label: string, payload: any) =>
                            payload?.[0]?.payload?.fullName || label
                          }
                        />
                        <Bar dataKey="likelihood" radius={[0, 6, 6, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                index === 0
                                  ? "#0E877A"
                                  : entry.riskLevel === "High"
                                  ? "#dc2626"
                                  : entry.riskLevel === "Moderate"
                                  ? "#d97706"
                                  : "#16a34a"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Condition Cards with ICD-10 */}
              <div className="grid gap-4">
                {result.conditions.map((item, idx) => (
                  <Card
                    key={idx}
                    className={`border transition-all shadow-xs bg-card ${
                      idx === 0
                        ? "border-primary/50 ring-1 ring-primary/20"
                        : "border-border"
                    }`}
                  >
                    <CardHeader className="pb-3 border-b border-border/50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <div>
                            <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                              {item.condition}
                              {item.icd10Hint && (
                                <Badge variant="outline" className="text-xs font-mono border-border">
                                  ICD-10: {item.icd10Hint}
                                </Badge>
                              )}
                            </CardTitle>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <Badge
                            variant={item.riskLevel === "High" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {item.riskLevel} Clinical Risk
                          </Badge>
                          <Badge className="bg-primary text-primary-foreground font-mono font-bold text-xs px-3 py-1">
                            {Math.round(item.likelihood * 100)}% Match
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="text-xs sm:text-sm pt-2 text-foreground/85 leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/70 text-xs">
                        <div>
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Clinical Supporting Factors:
                          </span>
                          <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                            {item.supportingEvidence.map((ev, i) => (
                              <li key={i}>{ev}</li>
                            ))}
                          </ul>
                        </div>

                        {item.contradictingEvidence && item.contradictingEvidence.length > 0 && (
                          <div>
                            <span className="font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                              Differentiating Factors:
                            </span>
                            <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                              {item.contradictingEvidence.map((ev, i) => (
                                <li key={i}>{ev}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-xs p-0 h-auto text-primary flex items-center gap-1 font-medium min-h-[32px]"
                          onClick={() =>
                            window.open(
                              `https://medlineplus.gov/search.html?query=${encodeURIComponent(
                                item.condition
                              )}`,
                              "_blank"
                            )
                          }
                        >
                          Search National Library of Medicine (MedlinePlus)
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* TAB 2: WORKUP & CLINICAL INQUIRIES */}
            <TabsContent value="doctor" className="space-y-6 pt-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-3 border-b border-border/60">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-primary" />
                    Recommended Clinical Specialties
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Specialties equipped to manage this clinical presentation:
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-2">
                    {result.recommendedSpecialties.map((spec, i) => (
                      <Badge key={i} variant="outline" className="px-3 py-1.5 text-xs font-semibold border-border">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-3 border-b border-border/60">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Standard Diagnostic Workup Considerations
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Common laboratory panels and imaging modalities indicated:
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.recommendedTests.map((test, i) => {
                      const isLab = /blood|cbc|cmp|metabolic|troponin|electrolyte|panel|urinalysis|culture|biomarker|d-dimer/i.test(test);
                      const isImaging = /x-ray|radiograph|ct|mri|ultrasound|echo|scan|imaging/i.test(test);
                      return (
                        <div
                          key={i}
                          className="p-3 rounded-xl border border-border bg-muted/20 text-xs flex items-center justify-between gap-2.5"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-md bg-primary/10 text-primary font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                              {i + 1}
                            </span>
                            <span className="font-medium text-foreground truncate">{test}</span>
                          </div>
                          {isLab && (
                            <Link href="/labs" className="shrink-0">
                              <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 border-primary/30 text-primary hover:bg-primary/10 gap-1 font-semibold">
                                <FlaskConical className="w-3 h-3" />
                                <span>Lab Suite</span>
                              </Button>
                            </Link>
                          )}
                          {isImaging && (
                            <Link href="/imaging" className="shrink-0">
                              <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 border-primary/30 text-primary hover:bg-primary/10 gap-1 font-semibold">
                                <Scan className="w-3 h-3" />
                                <span>X-Ray Suite</span>
                              </Button>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: EHR SOAP NOTE */}
            <TabsContent value="soap" className="space-y-6 pt-4">
              <Card className="border-border shadow-xs bg-card">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Clinical SOAP Note (EHR Hand-Off Ready)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Formatted in clinical documentation syntax for electronic health records:
                    </CardDescription>
                  </div>
                  <Button
                    onClick={copySOAPNote}
                    size="sm"
                    className="min-h-[44px] px-4 flex items-center gap-2 text-xs font-semibold bg-primary text-primary-foreground shadow-xs rounded-xl"
                  >
                    {copiedSOAP ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy SOAP Note</span>
                      </>
                    )}
                  </Button>
                </CardHeader>

                <CardContent className="pt-4 space-y-4 font-mono text-xs">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/80 space-y-3 leading-relaxed">
                    <div>
                      <span className="font-bold text-primary block mb-0.5">[SUBJECTIVE]</span>
                      <p className="text-muted-foreground whitespace-pre-wrap">{result.soapNote.subjective}</p>
                    </div>

                    <div className="border-t border-border/60 pt-2.5">
                      <span className="font-bold text-primary block mb-0.5">[OBJECTIVE]</span>
                      <p className="text-muted-foreground whitespace-pre-wrap">{result.soapNote.objective}</p>
                    </div>

                    <div className="border-t border-border/60 pt-2.5">
                      <span className="font-bold text-primary block mb-0.5">[ASSESSMENT]</span>
                      <p className="text-muted-foreground whitespace-pre-wrap">{result.soapNote.assessment}</p>
                    </div>

                    <div className="border-t border-border/60 pt-2.5">
                      <span className="font-bold text-primary block mb-0.5">[PLAN]</span>
                      <p className="text-muted-foreground whitespace-pre-wrap">{result.soapNote.plan}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: SELF-CARE & WARNINGS */}
            <TabsContent value="selfcare" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-emerald-500/30 bg-emerald-500/[0.03]">
                  <CardHeader className="pb-3 border-b border-emerald-500/20">
                    <CardTitle className="text-base font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Supportive Home Measures
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Non-pharmacological supportive steps while monitoring symptoms:
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2 text-xs text-foreground/90">
                      {homeCareSteps.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-destructive/30 bg-destructive/[0.03]">
                  <CardHeader className="pb-3 border-b border-destructive/20">
                    <CardTitle className="text-base font-bold text-destructive flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      Emergency Escalation Triggers
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Seek immediate emergency hospital evaluation if you develop:
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2 text-xs text-foreground/90">
                      {emergencyTriggers.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-destructive font-bold">!</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* ACTION FOOTER */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border print:hidden">
        <div className="flex items-center gap-2.5 flex-wrap">
          {onStartNew ? (
            <Button
              variant="outline"
              onClick={onStartNew}
              className="min-h-[44px] flex items-center gap-2 text-xs font-semibold border-border rounded-xl"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Start New Evaluation
            </Button>
          ) : (
            <Link href="/ManoMedai">
              <Button variant="outline" className="min-h-[44px] flex items-center gap-2 text-xs font-semibold border-border rounded-xl">
                <RotateCcw className="w-3.5 h-3.5" />
                Start New Evaluation
              </Button>
            </Link>
          )}
          <Link href="/history">
            <Button variant="ghost" className="min-h-[44px] text-xs font-medium text-muted-foreground hover:text-foreground">
              Audit Records Vault
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            className="min-h-[44px] px-4 flex items-center gap-2 text-xs font-semibold border-border rounded-xl"
          >
            <Printer className="w-4 h-4 text-primary" />
            Print Summary
          </Button>
          <Button
            type="button"
            onClick={generatePDF}
            disabled={isExporting}
            className="min-h-[44px] flex items-center gap-2 bg-primary text-primary-foreground font-semibold shadow-xs rounded-xl px-5"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Generating PDF..." : "Download Full PDF Report"}
          </Button>
        </div>
      </footer>
    </div>
  );
};
