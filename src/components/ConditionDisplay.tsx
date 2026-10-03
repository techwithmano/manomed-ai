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
  ChevronRight,
  ShieldCheck,
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

  const copyDoctorQuestions = () => {
    const text = `Questions for My Healthcare Provider (ManoMed AI):
${result.questionsForDoctor.map((q, i) => `${i + 1}. ${q}`).join("\n")}`;

    navigator.clipboard.writeText(text);
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 2500);
  };

  // Recharts probability comparison data
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
          bg: "bg-red-500/10 border-red-500 text-red-900 dark:text-red-200",
          badge: "bg-red-600 text-white",
          icon: <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />,
          title: "EMERGENCY: Immediate Medical Care Required",
          gaugeIndex: 3,
        };
      case "URGENT":
        return {
          bg: "bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-200",
          badge: "bg-amber-600 text-white",
          icon: <ShieldAlert className="w-6 h-6 text-amber-600" />,
          title: "URGENT: Evaluation Recommended within 24 Hours",
          gaugeIndex: 2,
        };
      case "ROUTINE":
        return {
          bg: "bg-blue-500/10 border-blue-500 text-blue-950 dark:text-blue-200",
          badge: "bg-blue-600 text-white",
          icon: <Stethoscope className="w-6 h-6 text-blue-600" />,
          title: "ROUTINE: Schedule Primary Care Consultation",
          gaugeIndex: 1,
        };
      default:
        return {
          bg: "bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-200",
          badge: "bg-emerald-600 text-white",
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
          title: "SELF-CARE: Supportive Home Monitoring",
          gaugeIndex: 0,
        };
    }
  };

  const triageTheme = getTriageTheme(result.triage.level);

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
      {/* Visual Triage Urgency Hero & Gauge */}
      <div className={`p-6 sm:p-8 rounded-3xl border-2 shadow-sm transition-all ${triageTheme.bg}`}>
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
              <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-foreground">
                {triageTheme.title}
              </h2>
              <p className="text-xs sm:text-sm max-w-2xl leading-relaxed text-muted-foreground">
                {result.triage.recommendedAction}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
            {result.triage.level === "EMERGENCY" && (
              <Button
                variant="destructive"
                className="flex items-center justify-center gap-2 min-h-[44px] px-5 font-bold shadow-sm"
                onClick={() => {
                  if (typeof window !== "undefined") window.location.href = "tel:911";
                }}
              >
                <PhoneCall className="w-4 h-4 animate-pulse" />
                Call 911 Immediately
              </Button>
            )}
            <Button
              onClick={generatePDF}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold min-h-[44px] px-5 shadow-sm rounded-xl"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Compiling PDF..." : "Export Clinical Report"}
            </Button>
          </div>
        </div>

        {/* 4-Tier Visual Triage Severity Gauge Meter */}
        <div className="mt-8 pt-6 border-t border-border/70">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
            <span>Clinical Triage Severity Hierarchy</span>
            <span>Current Stratum: {result.triage.level}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: "Self-Care", color: "bg-emerald-500", desc: "Home Monitoring" },
              { label: "Routine", color: "bg-blue-500", desc: "Primary Care Clinic" },
              { label: "Urgent", color: "bg-amber-500", desc: "Urgent Care (<24h)" },
              { label: "Emergency", color: "bg-red-500", desc: "Emergency Dept (911)" },
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
                    <span className="text-[10px] text-muted-foreground block">
                      {tier.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Red Flags Banner if any */}
        {result.redFlags && result.redFlags.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-red-600 text-white flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm tracking-wide uppercase font-mono">
                Critical Red Flag Symptoms Detected
              </div>
              <ul className="text-xs mt-1 list-disc pl-4 space-y-0.5">
                {result.redFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
              {result.emergencyGuidance && (
                <p className="text-xs mt-2 font-medium opacity-90">
                  {result.emergencyGuidance}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Clinical Intelligence Tabs */}
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
          {/* Calibrated Probability Comparison Chart */}
          <Card className="border-border shadow-xs bg-card">
            <CardHeader className="pb-2 border-b border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Diagnostic Probability Calibration
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Condition match likelihood calibrated from reported chief complaint, biological sex, age, and clinical follow-up inquiries.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono self-start sm:self-auto border-border">
                  BAYESIAN REASONING
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
                      formatter={(val: any) => [`${val}%`, "Match Likelihood"]}
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

          {/* Detailed Condition Cards */}
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
                        <CardTitle className="font-serif text-xl sm:text-2xl font-normal flex items-center gap-2">
                          {item.condition}
                          {item.icd10Hint && (
                            <Badge variant="outline" className="text-[10px] font-mono border-border">
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
                          Unconfirmed / Differentiating Factors:
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

        {/* TAB 2: WORKUP & DOCTOR INQUIRIES */}
        <TabsContent value="doctor" className="space-y-6 pt-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-primary" />
                Recommended Clinical Specialties
              </CardTitle>
              <CardDescription className="text-xs">
                Physicians practicing in these medical specialties are specifically equipped to manage this presentation:
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
                Common laboratory tests, imaging modalities, or diagnostic procedures typically indicated:
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.recommendedTests.map((test, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-border bg-muted/20 text-xs flex items-center gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-md bg-primary/10 text-primary font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                      {i + 1}
                    </span>
                    <span className="font-medium text-foreground">{test}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  Interactive Physician Discussion Checklist
                </CardTitle>
                <CardDescription className="text-xs">
                  Tap to mark items addressed during your medical consultation:
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyDoctorQuestions}
                className="min-h-[36px] flex items-center gap-1.5 text-xs font-semibold border-border"
              >
                {copiedQuestions ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Checklist
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {result.questionsForDoctor.map((q, idx) => {
                const isChecked = !!checkedQuestions[idx];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleQuestionCheck(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs flex items-start gap-3 transition-all min-h-[44px] ${
                      isChecked
                        ? "bg-muted/40 border-border line-through text-muted-foreground opacity-75"
                        : "bg-card border-border hover:border-primary/50 text-foreground"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                        isChecked
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border bg-background"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <span className="leading-relaxed font-medium flex-1">{q}</span>
                  </button>
                );
              })}
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
                  Standard Clinical SOAP Note (EHR Hand-Off Ready)
                </CardTitle>
                <CardDescription className="text-xs">
                  Formatted in clinical documentation syntax for immediate transfer into physician electronic records.
                </CardDescription>
              </div>
              <Button
                onClick={copySOAPNote}
                size="sm"
                className="min-h-[36px] flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground shadow-xs"
              >
                {copiedSOAP ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy SOAP Note
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
                  {result.safeSelfCare.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-red-500/[0.03]">
              <CardHeader className="pb-3 border-b border-red-500/20">
                <CardTitle className="text-base font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Emergency Escalation Triggers
                </CardTitle>
                <CardDescription className="text-xs">
                  Seek immediate emergency hospital evaluation if you develop:
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2 text-xs text-foreground/90">
                  {result.whenToSeekEmergencyCare.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">!</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
        <div className="flex items-center gap-2.5 flex-wrap">
          {onStartNew ? (
            <Button
              variant="outline"
              onClick={onStartNew}
              className="min-h-[44px] flex items-center gap-2 text-xs font-semibold border-border"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Start New Evaluation
            </Button>
          ) : (
            <Link href="/ManoMedai">
              <Button variant="outline" className="min-h-[44px] flex items-center gap-2 text-xs font-semibold border-border">
                <RotateCcw className="w-3.5 h-3.5" />
                Start New Evaluation
              </Button>
            </Link>
          )}
          <Link href="/history">
            <Button variant="ghost" className="min-h-[44px] text-xs font-medium text-muted-foreground hover:text-foreground">
              Audit Vault
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={generatePDF}
            disabled={isExporting}
            className="min-h-[44px] flex items-center gap-2 bg-primary text-primary-foreground font-semibold shadow-xs rounded-xl px-5"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Generating PDF..." : "Download Full PDF Report"}
          </Button>
        </div>
      </div>
    </div>
  );
};
