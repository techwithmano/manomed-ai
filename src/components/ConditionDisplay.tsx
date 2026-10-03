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
  Sparkles,
  ClipboardList,
  Flame,
  Gauge,
  Share2,
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
    name: c.condition.length > 20 ? c.condition.substring(0, 18) + "..." : c.condition,
    fullName: c.condition,
    likelihood: Math.round(c.likelihood * 100),
    riskLevel: c.riskLevel,
  }));

  const getTriageTheme = (level: string) => {
    switch (level) {
      case "EMERGENCY":
        return {
          bg: "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400",
          badge: "bg-red-600 text-white",
          icon: <AlertTriangle className="w-6 h-6 text-red-600 animate-bounce" />,
          title: "EMERGENCY: Immediate Medical Care Required",
          gaugeIndex: 3,
        };
      case "URGENT":
        return {
          bg: "bg-amber-500/10 border-amber-500 text-amber-800 dark:text-amber-300",
          badge: "bg-amber-500 text-white",
          icon: <ShieldAlert className="w-6 h-6 text-amber-500" />,
          title: "URGENT: Evaluation Recommended within 24 Hours",
          gaugeIndex: 2,
        };
      case "ROUTINE":
        return {
          bg: "bg-blue-500/10 border-blue-500 text-blue-800 dark:text-blue-300",
          badge: "bg-blue-600 text-white",
          icon: <Stethoscope className="w-6 h-6 text-blue-600" />,
          title: "ROUTINE: Schedule Clinic Consultation",
          gaugeIndex: 1,
        };
      default:
        return {
          bg: "bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300",
          badge: "bg-emerald-600 text-white",
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
          title: "SELF-CARE: Supportive Home Management",
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
      <div className={`p-6 sm:p-8 rounded-3xl border-2 shadow-xl transition-all ${triageTheme.bg}`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-background/90 shadow-md shrink-0">
              {triageTheme.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${triageTheme.badge}`}>
                  {result.triage.level}
                </Badge>
                <span className="text-xs font-semibold text-muted-foreground">
                  Timeframe: <strong className="text-foreground">{result.triage.timeframe}</strong>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {triageTheme.title}
              </h2>
              <p className="text-sm mt-1 max-w-2xl leading-relaxed text-foreground/90">
                {result.triage.recommendedAction}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
            {result.triage.level === "EMERGENCY" && (
              <Button
                variant="destructive"
                className="flex items-center justify-center gap-2 shadow-lg h-11 px-5 font-bold"
                onClick={() => {
                  if (typeof window !== "undefined") window.location.href = "tel:911";
                }}
              >
                <PhoneCall className="w-4 h-4 animate-pulse" />
                Call 911 Now
              </Button>
            )}
            <Button
              onClick={generatePDF}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold shadow-md h-11 px-5"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Generating PDF..." : "Export Medical Report"}
            </Button>
          </div>
        </div>

        {/* 4-Tier Visual Triage Severity Gauge Meter */}
        <div className="mt-8 pt-6 border-t border-border/60">
          <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            <span>Clinical Triage Severity Meter</span>
            <span>Target Level: {result.triage.level}</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Self-Care", color: "bg-emerald-500", desc: "Home Monitoring" },
              { label: "Routine", color: "bg-blue-500", desc: "Primary Care" },
              { label: "Urgent", color: "bg-amber-500", desc: "Urgent Clinic 24h" },
              { label: "Emergency", color: "bg-red-500", desc: "Immediate 911 / ER" },
            ].map((tier, idx) => {
              const isCurrent = idx === triageTheme.gaugeIndex;
              return (
                <div key={tier.label} className="space-y-1.5 text-center">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      isCurrent
                        ? `${tier.color} ring-4 ring-primary/30 shadow-md scale-y-125`
                        : "bg-muted/70 opacity-40"
                    }`}
                  />
                  <span
                    className={`text-[11px] block leading-tight ${
                      isCurrent ? "font-bold text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {tier.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Red Flags Banner if any */}
        {result.redFlags && result.redFlags.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-red-600 text-white flex items-start gap-3 shadow-md">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm tracking-wide uppercase">
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="differential" className="w-full">
        <TabsList className="grid grid-cols-4 w-full h-12 p-1 bg-muted/80 rounded-2xl border border-border/60">
          <TabsTrigger value="differential" className="rounded-xl text-xs sm:text-sm font-semibold">
            Differential Diagnosis
          </TabsTrigger>
          <TabsTrigger value="doctor" className="rounded-xl text-xs sm:text-sm font-semibold">
            Workup & Inquiries
          </TabsTrigger>
          <TabsTrigger value="soap" className="rounded-xl text-xs sm:text-sm font-semibold">
            EHR SOAP Note
          </TabsTrigger>
          <TabsTrigger value="selfcare" className="rounded-xl text-xs sm:text-sm font-semibold">
            Self-Care & Warnings
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: DIFFERENTIAL DIAGNOSIS */}
        <TabsContent value="differential" className="space-y-6 pt-6">
          {/* Probability Comparison Chart */}
          <Card className="border-border shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Diagnostic Likelihood Comparison
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Calibrated condition probabilities based on reported symptoms, demographics, and clinical questionnaire
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
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
                      formatter={(val: any) => [`${val}%`, "Likelihood"]}
                      labelFormatter={(label: string, payload: any) =>
                        payload?.[0]?.payload?.fullName || label
                      }
                    />
                    <Bar dataKey="likelihood" radius={[0, 8, 8, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index === 0
                              ? "#2563eb"
                              : entry.riskLevel === "High"
                              ? "#ef4444"
                              : entry.riskLevel === "Moderate"
                              ? "#f59e0b"
                              : "#10b981"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Condition Cards */}
          <div className="grid gap-4">
            {result.conditions.map((item, idx) => (
              <Card
                key={idx}
                className={`border transition-all shadow-sm ${
                  idx === 0
                    ? "border-primary/50 bg-primary/[0.02] ring-1 ring-primary/20"
                    : "border-border/80"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        {item.condition}
                        {item.icd10Hint && (
                          <Badge variant="outline" className="text-[11px] font-mono font-normal">
                            ICD-10: {item.icd10Hint}
                          </Badge>
                        )}
                      </CardTitle>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={item.riskLevel === "High" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {item.riskLevel} Risk
                      </Badge>
                      <Badge className="bg-primary text-primary-foreground font-bold text-sm px-3 py-1">
                        {Math.round(item.likelihood * 100)}% Match
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-sm pt-1 text-foreground/80 leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs">
                    <div>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Supporting Factors:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                        {item.supportingEvidence.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>

                    {item.contradictingEvidence && item.contradictingEvidence.length > 0 && (
                      <div>
                        <span className="font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                          Unconfirmed / Contradicting:
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
                      className="text-xs p-0 h-auto text-primary flex items-center gap-1 font-medium"
                      onClick={() =>
                        window.open(
                          `https://medlineplus.gov/search.html?query=${encodeURIComponent(
                            item.condition
                          )}`,
                          "_blank"
                        )
                      }
                    >
                      Research on MedlinePlus
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 2: WORKUP & DOCTOR INQUIRIES */}
        <TabsContent value="doctor" className="space-y-6 pt-6">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-primary" />
                Recommended Medical Specialties
              </CardTitle>
              <CardDescription className="text-xs">
                Physicians specializing in these fields are best equipped to manage this presentation:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.recommendedSpecialties.map((spec, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1.5 text-xs font-semibold">
                    {spec}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Standard Diagnostic Workup to Request
              </CardTitle>
              <CardDescription className="text-xs">
                Common clinical laboratory, imaging, and functional tests indicated:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.recommendedTests.map((test, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-border bg-card text-xs flex items-center gap-2.5 shadow-sm"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-medium text-foreground">{test}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  Questions Checklist for Your Consultation
                </CardTitle>
                <CardDescription className="text-xs">
                  Check off questions as you discuss them with your physician:
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyDoctorQuestions}
                className="flex items-center gap-1.5 text-xs font-semibold"
              >
                {copiedQuestions ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
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
            <CardContent className="space-y-2">
              {result.questionsForDoctor.map((q, idx) => {
                const isChecked = !!checkedQuestions[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleQuestionCheck(idx)}
                    className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 cursor-pointer transition-all ${
                      isChecked
                        ? "bg-muted/50 border-border line-through text-muted-foreground opacity-75"
                        : "bg-card border-border hover:border-primary/50 text-foreground"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                        isChecked
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <span className="leading-relaxed font-medium">{q}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: EHR SOAP NOTE */}
        <TabsContent value="soap" className="space-y-6 pt-6">
          <Card className="border-border shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Clinical SOAP Note (EHR Ready)
                </CardTitle>
                <CardDescription className="text-xs">
                  Formatted in standard clinical documentation syntax for immediate transfer into Electronic Health Records.
                </CardDescription>
              </div>
              <Button
                onClick={copySOAPNote}
                size="sm"
                className="flex items-center gap-1.5 text-xs shadow-sm font-semibold"
              >
                {copiedSOAP ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
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

            <CardContent className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-3 leading-relaxed">
                <div>
                  <span className="font-bold text-primary block mb-0.5">[SUBJECTIVE]</span>
                  <p className="text-muted-foreground whitespace-pre-wrap">{result.soapNote.subjective}</p>
                </div>

                <div className="border-t border-border/40 pt-2">
                  <span className="font-bold text-primary block mb-0.5">[OBJECTIVE]</span>
                  <p className="text-muted-foreground whitespace-pre-wrap">{result.soapNote.objective}</p>
                </div>

                <div className="border-t border-border/40 pt-2">
                  <span className="font-bold text-primary block mb-0.5">[ASSESSMENT]</span>
                  <p className="text-muted-foreground whitespace-pre-wrap">{result.soapNote.assessment}</p>
                </div>

                <div className="border-t border-border/40 pt-2">
                  <span className="font-bold text-primary block mb-0.5">[PLAN]</span>
                  <p className="text-muted-foreground whitespace-pre-wrap">{result.soapNote.plan}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: SELF-CARE & WARNINGS */}
        <TabsContent value="selfcare" className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Supportive Home Measures
                </CardTitle>
                <CardDescription className="text-xs">
                  Evidence-based self-care while monitoring your recovery:
                </CardDescription>
              </CardHeader>
              <CardContent>
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

            <Card className="border-red-500/30 bg-red-50/20 dark:bg-red-950/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  When to Escalate to Emergency Care
                </CardTitle>
                <CardDescription className="text-xs">
                  Go to the nearest emergency department if you experience any of these worsening signs:
                </CardDescription>
              </CardHeader>
              <CardContent>
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
        <div className="flex items-center gap-2">
          {onStartNew ? (
            <Button variant="outline" onClick={onStartNew} className="flex items-center gap-2 text-xs font-semibold">
              <RotateCcw className="w-3.5 h-3.5" />
              Start New Evaluation
            </Button>
          ) : (
            <Link href="/ManoMedai">
              <Button variant="outline" className="flex items-center gap-2 text-xs font-semibold">
                <RotateCcw className="w-3.5 h-3.5" />
                Start New Evaluation
              </Button>
            </Link>
          )}
          <Link href="/history">
            <Button variant="ghost" className="text-xs font-medium">
              View Assessment History
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={generatePDF}
            disabled={isExporting}
            className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold shadow-md"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting PDF..." : "Download Full PDF Report"}
          </Button>
        </div>
      </div>
    </div>
  );
};
