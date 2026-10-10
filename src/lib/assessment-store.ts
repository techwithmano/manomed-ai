"use client";

import { useEffect, useState } from "react";

export type QuestionType = "boolean" | "scale" | "choice" | "text";

export interface StructuredQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  clinicalRationale?: string;
  category?: "onset" | "severity" | "associated_symptom" | "trigger" | "risk_factor" | "general";
}

export type TriageLevel = "EMERGENCY" | "URGENT" | "ROUTINE" | "SELF_CARE";

export interface ConditionDifferential {
  condition: string;
  icd10Hint?: string;
  likelihood: number; // 0 to 1
  description: string;
  supportingEvidence: string[];
  contradictingEvidence?: string[];
  riskLevel: "Low" | "Moderate" | "High";
}

export interface ClinicalAnalysisResult {
  id: string;
  timestamp: string;
  triage: {
    level: TriageLevel;
    urgencyColor: "red" | "amber" | "blue" | "green";
    recommendedAction: string;
    timeframe: string;
  };
  redFlags: string[];
  emergencyGuidance?: string;
  conditions: ConditionDifferential[];
  recommendedSpecialties: string[];
  recommendedTests: string[];
  questionsForDoctor: string[];
  safeSelfCare: string[];
  whenToSeekEmergencyCare: string[];
  soapNote: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
}

export interface PatientVitals {
  heartRate?: string;
  bloodPressureSystolic?: string;
  bloodPressureDiastolic?: string;
  temperature?: string;
  temperatureUnit?: "C" | "F";
  oxygenSaturation?: string;
}

export interface CurrentAssessment {
  patient: {
    name: string;
    age: string;
    gender: string;
    email: string;
  };
  symptoms: {
    primaryDescription: string;
    selectedBodyRegions: string[];
    symptomTags: string[];
    severity: number; // 1-10
    duration: string;
    onsetSpeed: "sudden" | "gradual" | "fluctuating";
  };
  vitals: PatientVitals;
  medications: string[];
  allergies: string[];
  medicalHistory: string;
  structuredQuestions: StructuredQuestion[];
  answers: Record<string, string>; // questionId -> answer string
  result?: ClinicalAnalysisResult;
}

const STORAGE_KEY_CURRENT = "manomed_current_assessment_v2";
const STORAGE_KEY_HISTORY = "manomed_assessment_history_v2";

const initialAssessment: CurrentAssessment = {
  patient: {
    name: "",
    age: "",
    gender: "",
    email: "",
  },
  symptoms: {
    primaryDescription: "",
    selectedBodyRegions: [],
    symptomTags: [],
    severity: 5,
    duration: "1-3 days",
    onsetSpeed: "gradual",
  },
  vitals: {},
  medications: [],
  allergies: [],
  medicalHistory: "",
  structuredQuestions: [],
  answers: {},
};

export function getStoredCurrentAssessment(): CurrentAssessment {
  if (typeof window === "undefined") return initialAssessment;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (!raw) return initialAssessment;
    return { ...initialAssessment, ...JSON.parse(raw) };
  } catch (err) {
    console.error("Failed to parse stored assessment:", err);
    return initialAssessment;
  }
}

export function saveCurrentAssessment(assessment: CurrentAssessment): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(assessment));
  } catch (err) {
    console.error("Failed to save current assessment:", err);
  }
}

export function clearCurrentAssessment(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY_CURRENT);
  } catch (err) {
    console.error("Failed to clear current assessment:", err);
  }
}

export interface SavedAssessmentSummary {
  id: string;
  date: string;
  patientName: string;
  patientAge: string;
  primarySymptoms: string;
  triageLevel: TriageLevel;
  topCondition: string;
  topLikelihood: number;
  fullData: CurrentAssessment;
}

export function getAssessmentHistory(): SavedAssessmentSummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read assessment history:", err);
    return [];
  }
}

export function saveAssessmentToHistory(assessment: CurrentAssessment): void {
  if (typeof window === "undefined" || !assessment.result) return;
  try {
    const history = getAssessmentHistory();
    const topCondition = assessment.result.conditions[0]?.condition || "Evaluation completed";
    const topLikelihood = assessment.result.conditions[0]?.likelihood || 0;

    const summary: SavedAssessmentSummary = {
      id: assessment.result.id || `eval_${Date.now()}`,
      date: new Date().toISOString(),
      patientName: assessment.patient.name,
      patientAge: assessment.patient.age,
      primarySymptoms: assessment.symptoms.primaryDescription,
      triageLevel: assessment.result.triage.level,
      topCondition,
      topLikelihood,
      fullData: assessment,
    };

    // Keep up to 25 latest assessments
    const updated = [summary, ...history.filter(h => h.id !== summary.id)].slice(0, 25);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save to assessment history:", err);
  }
}

export function deleteAssessmentFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const history = getAssessmentHistory();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to delete assessment:", err);
  }
}

export const STORAGE_KEY_LABS = "manomed_lab_history_v2";
export const STORAGE_KEY_XRAY = "manomed_xray_history_v2";

export interface SavedLabSummary {
  id: string;
  date: string;
  patientName: string;
  patientAge: string;
  panelType: string;
  overallStatus: "NORMAL" | "ELEVATED_RISK" | "CRITICAL_ALERT";
  triageUrgency: "EMERGENCY" | "URGENT" | "ROUTINE" | "OPTIMAL";
  abnormalCount: number;
  data: any;
}

export function getLabHistory(): SavedLabSummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LABS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read lab history:", err);
    return [];
  }
}

export function saveLabToHistory(data: any, patientName = "Anonymous", patientAge = "N/A", panelType = "General Panel"): void {
  if (typeof window === "undefined" || !data) return;
  try {
    const history = getLabHistory();
    const abnormalCount = (data.analyzedParameters || []).filter((p: any) => p.flag !== "NORMAL").length;
    const summary: SavedLabSummary = {
      id: data.id || `lab_${Date.now()}`,
      date: new Date().toISOString(),
      patientName,
      patientAge,
      panelType,
      overallStatus: data.overallStatus || "NORMAL",
      triageUrgency: data.triageUrgency || "OPTIMAL",
      abnormalCount,
      data,
    };
    const updated = [summary, ...history.filter(h => h.id !== summary.id)].slice(0, 25);
    localStorage.setItem(STORAGE_KEY_LABS, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save lab history:", err);
  }
}

export function deleteLabFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const history = getLabHistory();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY_LABS, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to delete lab record:", err);
  }
}

export interface SavedXRaySummary {
  id: string;
  date: string;
  patientName: string;
  patientAge: string;
  region: string;
  urgency: "EMERGENCY" | "URGENT" | "ROUTINE" | "NORMAL";
  impression: string;
  data: any;
}

export function getXRayHistory(): SavedXRaySummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_XRAY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read xray history:", err);
    return [];
  }
}

export function saveXRayToHistory(data: any, patientName = "Anonymous", patientAge = "N/A", region = "Chest"): void {
  if (typeof window === "undefined" || !data) return;
  try {
    const history = getXRayHistory();
    const summary: SavedXRaySummary = {
      id: data.id || `xray_${Date.now()}`,
      date: new Date().toISOString(),
      patientName,
      patientAge,
      region,
      urgency: data.urgency || "NORMAL",
      impression: data.radiologicalImpression || "Examination completed",
      data,
    };
    const updated = [summary, ...history.filter(h => h.id !== summary.id)].slice(0, 25);
    localStorage.setItem(STORAGE_KEY_XRAY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save xray history:", err);
  }
}

export function deleteXRayFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const history = getXRayHistory();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY_XRAY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to delete xray record:", err);
  }
}

export function useAssessmentStore() {
  const [assessment, setAssessmentState] = useState<CurrentAssessment>(initialAssessment);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setAssessmentState(getStoredCurrentAssessment());
    setIsLoaded(true);
  }, []);

  const updateAssessment = (updater: Partial<CurrentAssessment> | ((prev: CurrentAssessment) => CurrentAssessment)) => {
    setAssessmentState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      saveCurrentAssessment(next);
      return next;
    });
  };

  const resetAssessment = () => {
    clearCurrentAssessment();
    setAssessmentState(initialAssessment);
  };

  return {
    assessment,
    updateAssessment,
    resetAssessment,
    isLoaded,
  };
}
