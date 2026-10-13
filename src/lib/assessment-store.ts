"use client";

import { useEffect, useState } from "react";
import { db, isCloudSyncEnabled } from "@/lib/firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, limit } from "firebase/firestore";

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

export type WorkflowStatus = 'pending' | 'reviewed' | 'escalated' | 'archived';

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
  /**
   * Local triage workflow status. Missing defaults to 'pending'.
   * Labeled in UI as "Local triage status (not a medical record)".
   */
  workflowStatus?: WorkflowStatus;
  reviewedAt?: string;
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
      workflowStatus: 'pending',
    };

    // Keep up to 25 latest assessments locally
    const updated = [summary, ...history.filter(h => h.id !== summary.id)].slice(0, 25);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));

    // Cloud Firestore Sync (Only when NEXT_PUBLIC_ENABLE_CLOUD_SYNC=true and Firebase configured)
    if (isCloudSyncEnabled && db) {
      const cleanData = JSON.parse(JSON.stringify(summary));
      setDoc(doc(db, "assessments", summary.id), cleanData).catch(err => {
        console.warn("Firestore sync assessment:", err);
      });
    }
  } catch (err) {
    console.error("Failed to save to assessment history:", err);
  }
}

export function updateAssessmentWorkflowStatus(id: string, status: WorkflowStatus): void {
  if (typeof window === "undefined") return;
  try {
    const history = getAssessmentHistory();
    const updated = history.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          workflowStatus: status,
          reviewedAt: status === "reviewed" ? new Date().toISOString() : item.reviewedAt,
        };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));

    if (isCloudSyncEnabled && db) {
      setDoc(
        doc(db, "assessments", id),
        { workflowStatus: status, reviewedAt: new Date().toISOString() },
        { merge: true }
      ).catch((err) => {
        console.warn("Firestore update assessment status:", err);
      });
    }
  } catch (err) {
    console.error("Failed to update assessment status:", err);
  }
}

export function deleteAssessmentFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const history = getAssessmentHistory();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));

    if (isCloudSyncEnabled && db) {
      deleteDoc(doc(db, "assessments", id)).catch(err => {
        console.warn("Firestore delete assessment:", err);
      });
    }
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
  workflowStatus?: WorkflowStatus;
  reviewedAt?: string;
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
      workflowStatus: 'pending',
    };
    const updated = [summary, ...history.filter(h => h.id !== summary.id)].slice(0, 25);
    localStorage.setItem(STORAGE_KEY_LABS, JSON.stringify(updated));

    if (isCloudSyncEnabled && db) {
      const cleanData = JSON.parse(JSON.stringify(summary));
      setDoc(doc(db, "lab_records", summary.id), cleanData).catch(err => {
        console.warn("Firestore sync lab:", err);
      });
    }
  } catch (err) {
    console.error("Failed to save lab history:", err);
  }
}

export function updateLabWorkflowStatus(id: string, status: WorkflowStatus): void {
  if (typeof window === "undefined") return;
  try {
    const history = getLabHistory();
    const updated = history.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          workflowStatus: status,
          reviewedAt: status === "reviewed" ? new Date().toISOString() : item.reviewedAt,
        };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEY_LABS, JSON.stringify(updated));

    if (isCloudSyncEnabled && db) {
      setDoc(
        doc(db, "lab_records", id),
        { workflowStatus: status, reviewedAt: new Date().toISOString() },
        { merge: true }
      ).catch((err) => {
        console.warn("Firestore update lab status:", err);
      });
    }
  } catch (err) {
    console.error("Failed to update lab status:", err);
  }
}

export function deleteLabFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const history = getLabHistory();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY_LABS, JSON.stringify(updated));

    if (isCloudSyncEnabled && db) {
      deleteDoc(doc(db, "lab_records", id)).catch(err => {
        console.warn("Firestore delete lab:", err);
      });
    }
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
  workflowStatus?: WorkflowStatus;
  reviewedAt?: string;
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
      workflowStatus: 'pending',
    };
    const updated = [summary, ...history.filter(h => h.id !== summary.id)].slice(0, 25);
    localStorage.setItem(STORAGE_KEY_XRAY, JSON.stringify(updated));

    if (isCloudSyncEnabled && db) {
      const cleanData = JSON.parse(JSON.stringify(summary));
      setDoc(doc(db, "imaging_records", summary.id), cleanData).catch(err => {
        console.warn("Firestore sync xray:", err);
      });
    }
  } catch (err) {
    console.error("Failed to save xray history:", err);
  }
}

export function updateXRayWorkflowStatus(id: string, status: WorkflowStatus): void {
  if (typeof window === "undefined") return;
  try {
    const history = getXRayHistory();
    const updated = history.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          workflowStatus: status,
          reviewedAt: status === "reviewed" ? new Date().toISOString() : item.reviewedAt,
        };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEY_XRAY, JSON.stringify(updated));

    if (isCloudSyncEnabled && db) {
      setDoc(
        doc(db, "imaging_records", id),
        { workflowStatus: status, reviewedAt: new Date().toISOString() },
        { merge: true }
      ).catch((err) => {
        console.warn("Firestore update xray status:", err);
      });
    }
  } catch (err) {
    console.error("Failed to update xray status:", err);
  }
}

export function deleteXRayFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const history = getXRayHistory();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY_XRAY, JSON.stringify(updated));

    if (isCloudSyncEnabled && db) {
      deleteDoc(doc(db, "imaging_records", id)).catch(err => {
        console.warn("Firestore delete xray:", err);
      });
    }
  } catch (err) {
    console.error("Failed to delete xray record:", err);
  }
}

// -------------------------------------------------------------
// Real-Time Hospital Ward / Triage Station Subscriptions (Firestore)
// Enables 100 Doctors and 100 Nurses to view 1,000 patients live
// -------------------------------------------------------------

export function subscribeToAssessments(callback: (items: SavedAssessmentSummary[]) => void): () => void {
  if (typeof window === "undefined") return () => {};
  
  if (isCloudSyncEnabled && db) {
    try {
      const q = query(collection(db, "assessments"), orderBy("date", "desc"), limit(100));
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => doc.data() as SavedAssessmentSummary);
        callback(items);
      }, (err) => {
        console.warn("Firestore assessment subscription fallback to local:", err);
        callback(getAssessmentHistory());
      });
    } catch (err) {
      console.warn("Error setting up assessment subscription:", err);
    }
  }

  callback(getAssessmentHistory());
  return () => {};
}

export function subscribeToLabs(callback: (items: SavedLabSummary[]) => void): () => void {
  if (typeof window === "undefined") return () => {};
  
  if (isCloudSyncEnabled && db) {
    try {
      const q = query(collection(db, "lab_records"), orderBy("date", "desc"), limit(100));
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => doc.data() as SavedLabSummary);
        callback(items);
      }, (err) => {
        console.warn("Firestore lab subscription fallback to local:", err);
        callback(getLabHistory());
      });
    } catch (err) {
      console.warn("Error setting up lab subscription:", err);
    }
  }

  callback(getLabHistory());
  return () => {};
}

export function subscribeToXRays(callback: (items: SavedXRaySummary[]) => void): () => void {
  if (typeof window === "undefined") return () => {};
  
  if (isCloudSyncEnabled && db) {
    try {
      const q = query(collection(db, "imaging_records"), orderBy("date", "desc"), limit(100));
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => doc.data() as SavedXRaySummary);
        callback(items);
      }, (err) => {
        console.warn("Firestore xray subscription fallback to local:", err);
        callback(getXRayHistory());
      });
    } catch (err) {
      console.warn("Error setting up xray subscription:", err);
    }
  }

  callback(getXRayHistory());
  return () => {};
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

/**
 * Permanently clears all local records stored in browser localStorage.
 * Covers assessments, current intake, labs, imaging, episodes, and suggestions.
 * Note: Does NOT delete copies already synchronized to cloud Firestore.
 */
export function clearAllLocalDeviceData(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY_CURRENT);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    localStorage.removeItem(STORAGE_KEY_LABS);
    localStorage.removeItem(STORAGE_KEY_XRAY);
    localStorage.removeItem("manomed_episodes_v1");
    localStorage.removeItem("manomed_dismissed_suggestions_v1");
    localStorage.removeItem("manomed_current_assessment");
    localStorage.removeItem("manomed_assessment_history");
    localStorage.removeItem("manomed_lab_history");
    localStorage.removeItem("manomed_xray_history");
  } catch (err) {
    console.error("Failed to clear local device data:", err);
  }
}
