"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  subscribeToAssessments,
  subscribeToLabs,
  subscribeToXRays,
  SavedAssessmentSummary,
  SavedLabSummary,
  SavedXRaySummary,
  saveAssessmentToHistory,
  saveLabToHistory,
  saveXRayToHistory,
} from "@/lib/assessment-store";
import { exportClinicalReportPDF, exportLabReportPDF, exportXRayReportPDF } from "@/lib/pdf-export";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  HeartPulse,
  Hospital,
  Layers,
  Microscope,
  Radio,
  Search,
  Shield,
  Stethoscope,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export default function ClinicalStationPage() {
  const [assessments, setAssessments] = useState<SavedAssessmentSummary[]>([]);
  const [labs, setLabs] = useState<SavedLabSummary[]>([]);
  const [xrays, setXRays] = useState<SavedXRaySummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<string>("symptoms");
  const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessmentSummary | null>(null);
  const [selectedLab, setSelectedLab] = useState<SavedLabSummary | null>(null);
  const [selectedXRay, setSelectedXRay] = useState<SavedXRaySummary | null>(null);
  const [copiedSoap, setCopiedSoap] = useState(false);

  useEffect(() => {
    const unsubAssessments = subscribeToAssessments((items) => setAssessments(items));
    const unsubLabs = subscribeToLabs((items) => setLabs(items));
    const unsubXRays = subscribeToXRays((items) => setXRays(items));

    return () => {
      unsubAssessments();
      unsubLabs();
      unsubXRays();
    };
  }, []);

  // Filtered lists
  const filteredAssessments = assessments.filter((a) => {
    const matchSearch =
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.topCondition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.primarySymptoms.toLowerCase().includes(searchQuery.toLowerCase());
    const matchUrgency = urgencyFilter === "ALL" || a.triageLevel === urgencyFilter;
    return matchSearch && matchUrgency;
  });

  const filteredLabs = labs.filter((l) => {
    const matchSearch =
      l.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.panelType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchUrgency =
      urgencyFilter === "ALL" ||
      (urgencyFilter === "EMERGENCY" && l.triageUrgency === "EMERGENCY") ||
      (urgencyFilter === "URGENT" && l.triageUrgency === "URGENT") ||
      (urgencyFilter === "ROUTINE" && l.triageUrgency === "ROUTINE") ||
      (urgencyFilter === "SELF_CARE" && l.triageUrgency === "OPTIMAL");
    return matchSearch && matchUrgency;
  });

  const filteredXRays = xrays.filter((x) => {
    const matchSearch =
      x.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      x.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      x.impression.toLowerCase().includes(searchQuery.toLowerCase());
    const matchUrgency =
      urgencyFilter === "ALL" ||
      (urgencyFilter === "EMERGENCY" && x.urgency === "EMERGENCY") ||
      (urgencyFilter === "URGENT" && x.urgency === "URGENT") ||
      (urgencyFilter === "ROUTINE" && x.urgency === "ROUTINE") ||
      (urgencyFilter === "SELF_CARE" && x.urgency === "NORMAL");
    return matchSearch && matchUrgency;
  });

  // Calculate live statistics
  const emergencyCount =
    assessments.filter((a) => a.triageLevel === "EMERGENCY").length +
    labs.filter((l) => l.triageUrgency === "EMERGENCY").length +
    xrays.filter((x) => x.urgency === "EMERGENCY").length;

  const urgentCount =
    assessments.filter((a) => a.triageLevel === "URGENT").length +
    labs.filter((l) => l.triageUrgency === "URGENT").length +
    xrays.filter((x) => x.urgency === "URGENT").length;

  const totalPatients = assessments.length + labs.length + xrays.length;

  const handleCopySoap = (soap: any) => {
    if (!soap) return;
    const text = `SOAP NOTE - CLINICAL TRIAGE
SUBJECTIVE:
${soap.subjective || "N/A"}

OBJECTIVE:
${soap.objective || "N/A"}

ASSESSMENT:
${soap.assessment || "N/A"}

PLAN:
${soap.plan || "N/A"}`;
    navigator.clipboard.writeText(text);
    setCopiedSoap(true);
    setTimeout(() => setCopiedSoap(false), 2000);
  };

  const seedSampleCohort = () => {
    // Seed 3 realistic clinical trial cases for testing
    const sampleAssessment: any = {
      patient: { name: "Marcus Vance", age: "54", gender: "Male", email: "m.vance@example.com" },
      symptoms: {
        primaryDescription: "Severe retrosternal pressure radiating to jaw, diaphoresis, shortness of breath for 45 minutes",
        selectedBodyRegions: ["Chest", "Neck / Throat"],
        symptomTags: ["Chest Pain", "Shortness of Breath", "Diaphoresis"],
        severity: 9,
        duration: "45 minutes",
        onsetSpeed: "sudden",
      },
      vitals: { heartRate: "118", bloodPressureSystolic: "165", bloodPressureDiastolic: "98", temperature: "37.1", oxygenSaturation: "94%" },
      medications: ["Atorvastatin 20mg", "Metformin 500mg"],
      allergies: ["Penicillin"],
      medicalHistory: "Type 2 Diabetes, Hyperlipidemia, 20 pack-year smoking history",
      structuredQuestions: [],
      answers: {},
      result: {
        id: `eval_seed_${Date.now()}`,
        timestamp: new Date().toISOString(),
        triage: {
          level: "EMERGENCY",
          urgencyColor: "red",
          recommendedAction: "Activate Emergency Resuscitation / Primary PCI Protocol immediately.",
          timeframe: "Immediate (0 - 15 minutes)",
        },
        redFlags: ["Crushing chest pain radiating to jaw", "Tachycardia 118 bpm", "Hypertensive urgency"],
        conditions: [
          {
            condition: "Acute Coronary Syndrome (STEMI / NSTEMI)",
            icd10Hint: "I21.9",
            likelihood: 0.92,
            riskLevel: "High",
            description: "Acute myocardial ischemia or infarction requiring immediate 12-lead ECG and catheterization lab evaluation.",
            supportingEvidence: ["Crushing retrosternal chest pain", "Radiation to jaw", "Diaphoresis", "Elevated cardiovascular risk factors"],
            contradictingEvidence: [],
          },
          {
            condition: "Acute Aortic Dissection",
            icd10Hint: "I71.0",
            likelihood: 0.18,
            riskLevel: "High",
            description: "Must be considered in hypertensive presentation with chest distress.",
            supportingEvidence: ["Severe sudden onset chest pain", "Hypertension"],
          },
        ],
        recommendedSpecialties: ["Interventional Cardiology", "Emergency Medicine"],
        recommendedTests: ["12-Lead Electrocardiogram (STAT)", "High-Sensitivity Troponin I", "Portable Chest Radiograph"],
        questionsForDoctor: ["What is the ST segment status on ECG?", "Are bedside cardiac biomarkers elevated?"],
        safeSelfCare: ["Do NOT drive. Maintain absolute physical rest.", "Emergency EMS dispatch is required."],
        whenToSeekEmergencyCare: ["Immediate EMS dispatched."],
        soapNote: {
          subjective: "54yo male reports acute onset severe crushing retrosternal pressure radiating to jaw for 45 min associated with diaphoresis and dyspnea.",
          objective: "Vitals: BP 165/98 mmHg, HR 118 bpm, SpO2 94% on room air, Temp 37.1C. Diaphoretic and in visible distress.",
          assessment: "Acute Coronary Syndrome (ICD-10 I21.9), high pre-test probability. Secondary differential: Acute Aortic Dissection.",
          plan: "Immediate STAT 12-lead ECG. Dual antiplatelet therapy and heparin pending ECG/contraindications. High-sensitivity troponin. Activate Cath Lab.",
        },
      },
    };
    saveAssessmentToHistory(sampleAssessment);

    const sampleLab = {
      id: `lab_seed_${Date.now()}`,
      overallStatus: "CRITICAL_ALERT",
      triageUrgency: "EMERGENCY",
      criticalCount: 1,
      abnormalCount: 3,
      analyzedParameters: [
        { name: "Troponin I", value: 1.45, unit: "ng/mL", referenceRange: "0.00 - 0.04", flag: "HIGH", severity: "CRITICAL", clinicalSignificance: "Significant myocardial necrosis marker." },
        { name: "WBC", value: 14.2, unit: "10^3/uL", referenceRange: "4.5 - 11.0", flag: "HIGH", severity: "ELEVATED", clinicalSignificance: "Leukocytosis secondary to acute stress/inflammation." },
        { name: "Glucose", value: 188, unit: "mg/dL", referenceRange: "70 - 99", flag: "HIGH", severity: "ELEVATED", clinicalSignificance: "Hyperglycemia." },
      ],
      pathologySummary: "Critical Troponin I elevation (1.45 ng/mL) confirms acute myocardial injury.",
      diagnosticDifferential: [
        { condition: "Type 1 Myocardial Infarction", likelihood: 0.94, clinicalRationale: "Marked troponin elevation with typical presentation." },
      ],
      recommendedFollowUps: ["Repeat Troponin I in 2 hours", "Stat 12-Lead ECG"],
      physicianActionRequired: "Immediate Cardiology Consultation for Angiography",
    };
    saveLabToHistory(sampleLab, "Marcus Vance", "54", "Cardiac & Inflammatory Biomarkers");

    const sampleXRay = {
      id: `xray_seed_${Date.now()}`,
      urgency: "EMERGENCY",
      region: "Chest",
      radiologicalImpression: "Right-sided tension pneumothorax with mediastinal shift to the left.",
      keyFindings: [
        "Complete collapse of the right lung with visceral pleural line visible.",
        "Absence of peripheral lung markings in right hemithorax.",
        "Tracheal and mediastinal deviation toward the contralateral left side.",
        "Flattening of the right hemidiaphragm.",
      ],
      rankedDifferential: [
        { condition: "Tension Pneumothorax", likelihood: 0.96, rationale: "Pleural separation with contralateral mediastinal shift.", severityRisk: "CRITICAL_EMERGENCY" },
      ],
      criticalActionRequired: "Immediate needle thoracostomy followed by tube thoracostomy (chest drain). Do not delay for further imaging.",
    };
    saveXRayToHistory(sampleXRay, "Arthur Dent", "28", "Chest Radiograph AP");

    // Re-read local history
    setAssessments(subscribeToAssessments((items) => setAssessments(items)) as any || []);
  };

  const getTriageBadge = (level: string) => {
    switch (level) {
      case "EMERGENCY":
        return (
          <Badge className="bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1 animate-pulse">
            <Flame className="w-3.5 h-3.5" /> 🔴 EMERGENCY
          </Badge>
        );
      case "URGENT":
        return (
          <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> 🟠 URGENT
          </Badge>
        );
      case "ROUTINE":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 🔵 ROUTINE
          </Badge>
        );
      default:
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 🟢 SELF-CARE
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="border border-border rounded-xl p-6 bg-card/60 backdrop-blur-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Hospital className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Doctor & Clinic Dashboard</h1>
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 flex items-center gap-1.5 py-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Clinic Sync
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm max-w-3xl">
              Live overview of patient visits, symptom checks, lab tests, and imaging for doctors and clinic staff.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={seedSampleCohort} className="gap-2">
              <Users className="w-4 h-4 text-primary" />
              Load Sample Patients
            </Button>
            <Link href="/ManoMedai">
              <Button size="sm" className="gap-2">
                <Activity className="w-4 h-4" />
                New Patient Check
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Ward Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/10 text-red-500">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-medium text-muted-foreground">Emergency Cases</p>
                <p className="text-2xl font-bold text-red-500">{emergencyCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-medium text-muted-foreground">Urgent Cases (&lt;48h)</p>
                <p className="text-2xl font-bold text-amber-500">{urgentCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-medium text-muted-foreground">Total In Queue</p>
                <p className="text-2xl font-bold text-foreground">{totalPatients}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-medium text-muted-foreground">AI Engine</p>
                <p className="text-sm font-bold text-foreground">Groq 120B (Free Tier)</p>
                <p className="text-[10px] text-muted-foreground">~1.0s response latency</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Urgency Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search patient name, condition, or symptom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-medium text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Tier:
            </span>
            {[
              { id: "ALL", label: "All Tiers" },
              { id: "EMERGENCY", label: "🔴 Emergency" },
              { id: "URGENT", label: "🟠 Urgent" },
              { id: "ROUTINE", label: "🔵 Routine" },
              { id: "SELF_CARE", label: "🟢 Self-Care" },
            ].map((f) => (
              <Button
                key={f.id}
                size="sm"
                variant={urgencyFilter === f.id ? "default" : "outline"}
                onClick={() => setUrgencyFilter(f.id)}
                className="h-8 text-xs whitespace-nowrap"
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Clinical Modality Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 max-w-lg bg-muted/60 p-1">
            <TabsTrigger value="symptoms" className="gap-2 text-xs sm:text-sm">
              <Stethoscope className="w-4 h-4 text-primary" />
              Symptom Triage ({filteredAssessments.length})
            </TabsTrigger>
            <TabsTrigger value="labs" className="gap-2 text-xs sm:text-sm">
              <Microscope className="w-4 h-4 text-primary" />
              Blood Labs ({filteredLabs.length})
            </TabsTrigger>
            <TabsTrigger value="imaging" className="gap-2 text-xs sm:text-sm">
              <HeartPulse className="w-4 h-4 text-primary" />
              X-Rays ({filteredXRays.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SYMPTOMS TRIAGE QUEUE */}
          <TabsContent value="symptoms" className="space-y-4">
            {filteredAssessments.length === 0 ? (
              <Card className="border-dashed p-12 text-center">
                <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                <h3 className="text-lg font-semibold">No Patients in Triage Queue</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                  Incoming patient assessments from mobile and desktop intake appear here instantly.
                </p>
                <Button variant="outline" size="sm" onClick={seedSampleCohort}>
                  Load Sample Clinical Cohort
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssessments.map((item) => (
                  <Card
                    key={item.id}
                    className={`border transition-all hover:shadow-md cursor-pointer ${
                      item.triageLevel === "EMERGENCY"
                        ? "border-red-500/40 bg-red-500/[0.02]"
                        : item.triageLevel === "URGENT"
                        ? "border-amber-500/40 bg-amber-500/[0.02]"
                        : "border-border"
                    }`}
                    onClick={() => setSelectedAssessment(item)}
                  >
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {getTriageBadge(item.triageLevel)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold flex items-center justify-between">
                        <span>{item.patientName || "Anonymous Patient"}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {item.patientAge ? `${item.patientAge}y` : "Age N/A"}
                        </span>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 space-y-3">
                      <div className="text-xs text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded border border-border/50">
                        <strong className="text-foreground">Complaint:</strong> {item.primarySymptoms}
                      </div>

                      <div className="border-t border-border pt-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-muted-foreground">Primary Differential:</span>
                          <p className="font-semibold text-foreground line-clamp-1">{item.topCondition}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-muted-foreground">Confidence</span>
                          <p className="font-mono font-bold text-primary">
                            {Math.round(item.topLikelihood * 100)}%
                          </p>
                        </div>
                      </div>

                      <Button variant="secondary" size="sm" className="w-full text-xs gap-1.5 mt-2">
                        <Eye className="w-3.5 h-3.5" /> Inspect Clinical Dossier
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: BLOOD LABS QUEUE */}
          <TabsContent value="labs" className="space-y-4">
            {filteredLabs.length === 0 ? (
              <Card className="border-dashed p-12 text-center">
                <Microscope className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                <h3 className="text-lg font-semibold">No Blood Work Panels</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                  Incoming laboratory results analyzed by clinicians or patients appear here.
                </p>
                <Button variant="outline" size="sm" onClick={seedSampleCohort}>
                  Load Sample Lab Panel
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLabs.map((item) => (
                  <Card
                    key={item.id}
                    className={`border transition-all hover:shadow-md cursor-pointer ${
                      item.triageUrgency === "EMERGENCY"
                        ? "border-red-500/40 bg-red-500/[0.02]"
                        : item.triageUrgency === "URGENT"
                        ? "border-amber-500/40 bg-amber-500/[0.02]"
                        : "border-border"
                    }`}
                    onClick={() => setSelectedLab(item)}
                  >
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {getTriageBadge(item.triageUrgency)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold flex items-center justify-between">
                        <span>{item.patientName}</span>
                        <span className="text-xs font-normal text-muted-foreground">{item.patientAge}y</span>
                      </CardTitle>
                      <CardDescription className="text-xs">{item.panelType}</CardDescription>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 space-y-3">
                      <div className="flex items-center justify-between text-xs p-2 rounded bg-muted/30 border border-border/50">
                        <span>Abnormal Parameters:</span>
                        <Badge variant="destructive" className="font-mono text-xs">
                          {item.abnormalCount} Flagged
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.data?.pathologySummary || "Pathology analysis completed."}
                      </p>

                      <Button variant="secondary" size="sm" className="w-full text-xs gap-1.5 mt-2">
                        <Eye className="w-3.5 h-3.5" /> View Full Lab Report
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: X-RAYS QUEUE */}
          <TabsContent value="imaging" className="space-y-4">
            {filteredXRays.length === 0 ? (
              <Card className="border-dashed p-12 text-center">
                <HeartPulse className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                <h3 className="text-lg font-semibold">No Radiographs in Queue</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                  Incoming X-ray studies analyzed with computer vision appear here.
                </p>
                <Button variant="outline" size="sm" onClick={seedSampleCohort}>
                  Load Sample Radiograph
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredXRays.map((item) => (
                  <Card
                    key={item.id}
                    className={`border transition-all hover:shadow-md cursor-pointer ${
                      item.urgency === "EMERGENCY"
                        ? "border-red-500/40 bg-red-500/[0.02]"
                        : item.urgency === "URGENT"
                        ? "border-amber-500/40 bg-amber-500/[0.02]"
                        : "border-border"
                    }`}
                    onClick={() => setSelectedXRay(item)}
                  >
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {getTriageBadge(item.urgency)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold flex items-center justify-between">
                        <span>{item.patientName}</span>
                        <span className="text-xs font-normal text-muted-foreground">{item.patientAge}y</span>
                      </CardTitle>
                      <CardDescription className="text-xs">{item.region} Study</CardDescription>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 space-y-3">
                      <div className="text-xs text-muted-foreground p-2 rounded bg-muted/30 border border-border/50 line-clamp-2">
                        <strong className="text-foreground">Impression:</strong> {item.impression}
                      </div>

                      <Button variant="secondary" size="sm" className="w-full text-xs gap-1.5 mt-2">
                        <Eye className="w-3.5 h-3.5" /> Inspect Radiology Report
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* MODAL 1: SYMPTOM DOSSIER INSPECTION */}
        {selectedAssessment && (
          <Dialog open={Boolean(selectedAssessment)} onOpenChange={() => setSelectedAssessment(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {getTriageBadge(selectedAssessment.triageLevel)}
                    <span className="text-xs text-muted-foreground">
                      Intake: {new Date(selectedAssessment.date).toLocaleString()}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportClinicalReportPDF(selectedAssessment.fullData)}

                    className="gap-1.5 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" /> Export PDF
                  </Button>
                </div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {selectedAssessment.patientName || "Anonymous Patient"} ({selectedAssessment.patientAge || "N/A"}y,{" "}
                  {selectedAssessment.fullData.patient.gender || "Gender N/A"})
                </DialogTitle>
                <DialogDescription>
                  Chief Complaint: {selectedAssessment.primarySymptoms}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Vitals & Demographics */}
                {selectedAssessment.fullData.vitals && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-3 rounded-lg border border-border">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Heart Rate</span>
                      <p className="text-sm font-mono font-bold text-foreground">
                        {selectedAssessment.fullData.vitals.heartRate ? `${selectedAssessment.fullData.vitals.heartRate} bpm` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Blood Pressure</span>
                      <p className="text-sm font-mono font-bold text-foreground">
                        {selectedAssessment.fullData.vitals.bloodPressureSystolic && selectedAssessment.fullData.vitals.bloodPressureDiastolic
                          ? `${selectedAssessment.fullData.vitals.bloodPressureSystolic}/${selectedAssessment.fullData.vitals.bloodPressureDiastolic} mmHg`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Temperature</span>
                      <p className="text-sm font-mono font-bold text-foreground">
                        {selectedAssessment.fullData.vitals.temperature ? `${selectedAssessment.fullData.vitals.temperature} °${selectedAssessment.fullData.vitals.temperatureUnit || "C"}` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">SpO2 Oxygen</span>
                      <p className="text-sm font-mono font-bold text-foreground">
                        {selectedAssessment.fullData.vitals.oxygenSaturation || "N/A"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Ranked Differential Diagnoses */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-primary" /> Ranked Differential Diagnoses
                  </h4>
                  <div className="space-y-2">
                    {selectedAssessment.fullData.result?.conditions.map((c, idx) => (
                      <div key={idx} className="border border-border p-4 rounded-lg bg-card/50">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{c.condition}</span>
                            {c.icd10Hint && (
                              <Badge variant="outline" className="text-[10px] font-mono">
                                ICD-10 {c.icd10Hint}
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm font-bold font-mono text-primary">
                            {Math.round(c.likelihood * 100)}% Match
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{c.description}</p>
                        {c.supportingEvidence && c.supportingEvidence.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {c.supportingEvidence.map((ev, i) => (
                              <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                + {ev}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* EHR SOAP Note */}
                {selectedAssessment.fullData.result?.soapNote && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-primary" /> Physician SOAP Documentation
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopySoap(selectedAssessment.fullData.result?.soapNote)}
                        className="text-xs gap-1 h-7"
                      >
                        {copiedSoap ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedSoap ? "Copied" : "Copy SOAP"}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
                        <span className="font-bold text-foreground block mb-1">Subjective (S)</span>
                        <p className="text-muted-foreground leading-relaxed">{selectedAssessment.fullData.result.soapNote.subjective}</p>
                      </div>
                      <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
                        <span className="font-bold text-foreground block mb-1">Objective (O)</span>
                        <p className="text-muted-foreground leading-relaxed">{selectedAssessment.fullData.result.soapNote.objective}</p>
                      </div>
                      <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
                        <span className="font-bold text-foreground block mb-1">Assessment (A)</span>
                        <p className="text-muted-foreground leading-relaxed">{selectedAssessment.fullData.result.soapNote.assessment}</p>
                      </div>
                      <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
                        <span className="font-bold text-foreground block mb-1">Plan (P)</span>
                        <p className="text-muted-foreground leading-relaxed">{selectedAssessment.fullData.result.soapNote.plan}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* MODAL 2: LAB REPORT INSPECTION */}
        {selectedLab && (
          <Dialog open={Boolean(selectedLab)} onOpenChange={() => setSelectedLab(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between gap-3 mb-2">
                  {getTriageBadge(selectedLab.triageUrgency)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportLabReportPDF(selectedLab.data, selectedLab.patientName, selectedLab.patientAge, selectedLab.panelType)}
                    className="gap-1.5 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" /> Export PDF
                  </Button>
                </div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-primary" />
                  {selectedLab.patientName} ({selectedLab.patientAge}y) - {selectedLab.panelType}
                </DialogTitle>
                <DialogDescription>
                  {selectedLab.data?.pathologySummary}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted text-muted-foreground text-left">
                      <tr>
                        <th className="p-3">Analyte</th>
                        <th className="p-3">Result</th>
                        <th className="p-3">Reference Range</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(selectedLab.data?.analyzedParameters || []).map((p: any, i: number) => (
                        <tr key={i} className={p.flag !== "NORMAL" ? "bg-red-500/[0.04]" : ""}>
                          <td className="p-3 font-medium text-foreground">{p.name}</td>
                          <td className="p-3 font-mono font-bold">{p.value} {p.unit}</td>
                          <td className="p-3 text-muted-foreground">{p.referenceRange}</td>
                          <td className="p-3">
                            {p.flag === "NORMAL" ? (
                              <Badge variant="outline" className="text-emerald-500 border-emerald-500/40 text-[10px]">Normal</Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[10px]">{p.flag} ({p.severity || "Abnormal"})</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedLab.data?.physicianActionRequired && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs">
                    <strong className="text-red-500 block mb-1">Attending Physician Action:</strong>
                    <p className="text-foreground">{selectedLab.data.physicianActionRequired}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* MODAL 3: X-RAY STUDY INSPECTION */}
        {selectedXRay && (
          <Dialog open={Boolean(selectedXRay)} onOpenChange={() => setSelectedXRay(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between gap-3 mb-2">
                  {getTriageBadge(selectedXRay.urgency)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportXRayReportPDF(selectedXRay.data, selectedXRay.patientName, selectedXRay.patientAge, selectedXRay.region)}
                    className="gap-1.5 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" /> Export PDF
                  </Button>
                </div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-primary" />
                  {selectedXRay.patientName} ({selectedXRay.patientAge}y) - {selectedXRay.region} Study
                </DialogTitle>
                <DialogDescription>
                  Impression: {selectedXRay.impression}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4 text-xs">
                {selectedXRay.data?.keyFindings && (
                  <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-2">
                    <strong className="text-foreground text-sm block">Radiological Findings:</strong>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {selectedXRay.data.keyFindings.map((f: string, i: number) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedXRay.data?.criticalActionRequired && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <strong className="text-red-500 block mb-1">Emergency Stabilization:</strong>
                    <p className="text-foreground">{selectedXRay.data.criticalActionRequired}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
