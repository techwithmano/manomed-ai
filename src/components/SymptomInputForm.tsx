"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Mic,
  MicOff,
  AlertTriangle,
  HeartPulse,
  Activity,
  Plus,
  X,
  PhoneCall,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Search,
  Pill,
  ShieldAlert,
  User,
  Clock,
  ArrowRight,
  FileText,
  Thermometer,
  Check,
} from "lucide-react";
import { CurrentAssessment } from "@/lib/assessment-store";
import { BodyMapSelector, ANATOMICAL_ZONES, AnatomicalZone } from "./BodyMapSelector";

interface SymptomInputFormProps {
  initialData?: CurrentAssessment;
  onSubmit: (data: CurrentAssessment) => void;
  isLoading?: boolean;
}

const EMERGENCY_KEYWORDS = [
  "chest pressure",
  "crushing chest",
  "left arm pain",
  "slurred speech",
  "facial droop",
  "can't breathe",
  "suffocating",
  "severe hemorrhage",
  "coughing blood",
  "suicide",
  "suicidal",
  "anaphylaxis",
  "throat swelling",
  "thunderclap headache",
  "worst headache of life",
];

// All flat symptoms for live search
const ALL_SYMPTOMS_LIST = Array.from(
  new Set(ANATOMICAL_ZONES.flatMap((z) => z.commonSymptoms))
);

export const SymptomInputForm: React.FC<SymptomInputFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  // Patient details
  const [name, setName] = useState(initialData?.patient.name || "");
  const [age, setAge] = useState(initialData?.patient.age || "");
  const [gender, setGender] = useState(initialData?.patient.gender || "");
  const [email, setEmail] = useState(initialData?.patient.email || "");

  // Symptoms
  const [primaryDescription, setPrimaryDescription] = useState(
    initialData?.symptoms.primaryDescription || ""
  );
  const [selectedBodyRegions, setSelectedBodyRegions] = useState<string[]>(
    initialData?.symptoms.selectedBodyRegions || []
  );
  const [symptomTags, setSymptomTags] = useState<string[]>(
    initialData?.symptoms.symptomTags || []
  );
  const [severity, setSeverity] = useState<number>(initialData?.symptoms.severity ?? 4);
  const [duration, setDuration] = useState(initialData?.symptoms.duration || "1-3 days");
  const [onsetSpeed, setOnsetSpeed] = useState<"sudden" | "gradual" | "fluctuating">(
    initialData?.symptoms.onsetSpeed || "gradual"
  );

  // Anatomical Body Map Selection
  const [activeZoneId, setActiveZoneId] = useState<string | null>("head");

  // Search filter for symptoms
  const [searchQuery, setSearchQuery] = useState("");

  // Vitals
  const [showVitals, setShowVitals] = useState(false);
  const [heartRate, setHeartRate] = useState(initialData?.vitals.heartRate || "");
  const [bpSystolic, setBpSystolic] = useState(initialData?.vitals.bloodPressureSystolic || "");
  const [bpDiastolic, setBpDiastolic] = useState(initialData?.vitals.bloodPressureDiastolic || "");
  const [temperature, setTemperature] = useState(initialData?.vitals.temperature || "");
  const [oxygenSaturation, setOxygenSaturation] = useState(
    initialData?.vitals.oxygenSaturation || ""
  );

  // Meds & Allergies tags
  const [medications, setMedications] = useState<string[]>(initialData?.medications || []);
  const [medInput, setMedInput] = useState("");
  const [allergies, setAllergies] = useState<string[]>(initialData?.allergies || []);
  const [allergyInput, setAllergyInput] = useState("");
  const [medicalHistory, setMedicalHistory] = useState(initialData?.medicalHistory || "");

  // Legal and validation
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Emergency safety modal
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyKeywordFound, setEmergencyKeywordFound] = useState("");

  // Speech Recognition setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setPrimaryDescription((prev) => {
              const separator = prev.trim() ? " " : "";
              return prev + separator + currentTranscript.trim();
            });
          }
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Speech recognition start failed:", err);
      }
    }
  };

  // Real-time emergency check
  const checkForRedFlags = (text: string) => {
    const lower = text.toLowerCase();
    for (const kw of EMERGENCY_KEYWORDS) {
      if (lower.includes(kw)) {
        setEmergencyKeywordFound(kw);
        setShowEmergencyModal(true);
        return;
      }
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPrimaryDescription(val);
    checkForRedFlags(val);
  };

  const toggleSymptomTag = (tag: string) => {
    setSymptomTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      } else {
        checkForRedFlags(tag);
        return [...prev, tag];
      }
    });
  };

  const handleSelectZone = (zone: AnatomicalZone) => {
    setActiveZoneId(zone.id);
    if (!selectedBodyRegions.includes(zone.id)) {
      setSelectedBodyRegions((prev) => [...prev, zone.id]);
    }
  };

  // Filtered symptoms for live search
  const filteredSymptoms = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return ALL_SYMPTOMS_LIST.filter((s) => s.toLowerCase().includes(q));
  }, [searchQuery]);

  // Drug-Allergy & Contraindication Safety Engine
  const drugSafetyAlerts = useMemo(() => {
    const alerts: string[] = [];
    const medsLower = medications.map((m) => m.toLowerCase());
    const allergiesLower = allergies.map((a) => a.toLowerCase());
    const historyLower = medicalHistory.toLowerCase();

    // Penicillin allergy cross-check
    const hasPenicillinAllergy = allergiesLower.some(
      (a) => a.includes("penicillin") || a.includes("amoxicillin")
    );
    const takesPenicillinMed = medsLower.some(
      (m) =>
        m.includes("amox") ||
        m.includes("penicillin") ||
        m.includes("augmentin") ||
        m.includes("ampicillin")
    );
    if (hasPenicillinAllergy && takesPenicillinMed) {
      alerts.push(
        "CRITICAL: Patient reported Penicillin allergy while taking a Beta-lactam medication (Amoxicillin/Augmentin). High risk of anaphylaxis!"
      );
    }

    // NSAID Ulcer / Bleeding Risk
    const hasUlcerOrBleed =
      historyLower.includes("ulcer") ||
      historyLower.includes("gastritis") ||
      historyLower.includes("gerd");
    const takesNSAID = medsLower.some(
      (m) =>
        m.includes("ibuprofen") ||
        m.includes("aspirin") ||
        m.includes("naproxen") ||
        m.includes("advil") ||
        m.includes("aleve")
    );
    if (hasUlcerOrBleed && takesNSAID) {
      alerts.push(
        "CAUTION: NSAID medication (Ibuprofen/Naproxen/Aspirin) reported with gastric ulcer/GERD history. Risk of GI bleed."
      );
    }

    // Asthma + Beta-Blocker
    const hasAsthma = historyLower.includes("asthma") || historyLower.includes("copd");
    const takesBetaBlocker = medsLower.some(
      (m) =>
        m.includes("propranolol") ||
        m.includes("metoprolol") ||
        m.includes("atenolol") ||
        m.includes("carvedilol")
    );
    if (hasAsthma && takesBetaBlocker) {
      alerts.push(
        "WARNING: Non-selective Beta-blocker reported in a patient with reactive airway/asthma history. Risk of bronchospasm."
      );
    }

    return alerts;
  }, [medications, allergies, medicalHistory]);

  const handleAddMedication = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = medInput.trim().replace(/^,|,$/g, "");
      if (val && !medications.includes(val)) {
        setMedications([...medications, val]);
        setMedInput("");
      }
    }
  };

  const handleAddAllergy = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = allergyInput.trim().replace(/^,|,$/g, "");
      if (val && !allergies.includes(val)) {
        setAllergies([...allergies, val]);
        setAllergyInput("");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter patient full name.");
      return;
    }
    if (!age || Number(age) < 1 || Number(age) > 120) {
      setError("Please enter a valid patient age between 1 and 120.");
      return;
    }
    if (!gender) {
      setError("Please select biological sex for baseline clinical calibration.");
      return;
    }
    if (!primaryDescription.trim() && symptomTags.length === 0) {
      setError("Please describe the chief complaint or select symptoms from the anatomical locator.");
      return;
    }
    if (!acceptedPrivacy) {
      setError("You must accept the Clinical Triage & Privacy terms to continue.");
      return;
    }

    setError(null);

    const fullSymptoms = [
      primaryDescription.trim(),
      symptomTags.length > 0 ? `Selected symptom indicators: ${symptomTags.join(", ")}` : "",
      selectedBodyRegions.length > 0 ? `Affected body systems: ${selectedBodyRegions.join(", ")}` : "",
      `Reported severity: ${severity}/10 (${
        severity >= 7 ? "Severe" : severity >= 4 ? "Moderate" : "Mild"
      })`,
      `Duration: ${duration}`,
      `Onset: ${onsetSpeed}`,
    ]
      .filter(Boolean)
      .join(". ");

    const payload: CurrentAssessment = {
      patient: {
        name: name.trim(),
        age: age.trim(),
        gender,
        email: email.trim(),
      },
      symptoms: {
        primaryDescription: fullSymptoms,
        selectedBodyRegions,
        symptomTags,
        severity,
        duration,
        onsetSpeed,
      },
      vitals: {
        heartRate: heartRate.trim() || undefined,
        bloodPressureSystolic: bpSystolic.trim() || undefined,
        bloodPressureDiastolic: bpDiastolic.trim() || undefined,
        temperature: temperature.trim() || undefined,
        temperatureUnit: "C",
        oxygenSaturation: oxygenSaturation.trim() || undefined,
      },
      medications,
      allergies,
      medicalHistory: medicalHistory.trim(),
      structuredQuestions: initialData?.structuredQuestions || [],
      answers: initialData?.answers || {},
    };

    onSubmit(payload);
  };

  // NRS (Numeric Rating Scale) Clinical Descriptors
  const getNRSDescription = (val: number) => {
    if (val === 0) return { label: "Asymptomatic / No Pain", desc: "No noticeable physical discomfort", color: "text-emerald-700 dark:text-emerald-400" };
    if (val <= 2) return { label: "Mild Discomfort (NRS 1-2)", desc: "Noticeable but easily tolerated; no interference with tasks", color: "text-emerald-600 dark:text-emerald-300" };
    if (val <= 4) return { label: "Moderate Discomfort (NRS 3-4)", desc: "Interferes with focus; manageable with distraction", color: "text-amber-700 dark:text-amber-300" };
    if (val <= 6) return { label: "Distressing Discomfort (NRS 5-6)", desc: "Significantly impedes work, routine activities, or sleep", color: "text-amber-800 dark:text-amber-400" };
    if (val <= 8) return { label: "Severe Discomfort (NRS 7-8)", desc: "Disabling pain; unable to concentrate or perform daily tasks", color: "text-red-700 dark:text-red-300" };
    return { label: "Excruciating (NRS 9-10)", desc: "Incapacitating; systemic distress requiring acute intervention", color: "text-red-800 dark:text-red-400" };
  };

  const painInfo = getNRSDescription(severity);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Case Dossier Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary tracking-wider uppercase">
                  CASE INTAKE
                </span>
                <Badge variant="outline" className="text-[10px] font-mono border-border">
                  ESI PROTOCOL v3.2
                </Badge>
              </div>
              <h2 className="text-base font-bold text-foreground">
                Clinical Symptom Intake & Patient Dossier
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground self-start sm:self-auto font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              EST: 3-4 MIN
            </span>
            <span className="px-2 py-0.5 rounded bg-muted text-[11px] font-medium font-sans">
              256-bit Ephemeral
            </span>
          </div>
        </div>

        {/* 2-Column Asymmetric Clinical Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Patient Demographics, Vitals, Pharmacotherapy, History */}
          <div className="lg:col-span-5 space-y-6">
            {/* Step 1: Patient Demographics */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    1. Patient Dossier
                  </h3>
                </div>
                <span className="text-[11px] text-muted-foreground">Required</span>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <Label htmlFor="patient-name" className="text-xs font-semibold text-foreground">
                    Full Name *
                  </Label>
                  <Input
                    id="patient-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    required
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="patient-age" className="text-xs font-semibold text-foreground">
                      Age (Years) *
                    </Label>
                    <Input
                      id="patient-age"
                      type="number"
                      min="1"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="42"
                      required
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="patient-gender" className="text-xs font-semibold text-foreground">
                      Biological Sex *
                    </Label>
                    <Select value={gender} onValueChange={setGender} required>
                      <SelectTrigger id="patient-gender" className="h-10 text-xs rounded-xl">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other / Intersex</SelectItem>
                        <SelectItem value="prefer-not-to-say">Decline to specify</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="patient-email" className="text-xs font-semibold text-muted-foreground">
                    Email Address (Optional, for PDF Report Delivery)
                  </Label>
                  <Input
                    id="patient-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="eleanor@example.com"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Vitals Panel (Expandable) */}
            <div className="rounded-2xl bg-card border border-border shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setShowVitals(!showVitals)}
                className="w-full px-5 py-4 flex items-center justify-between text-xs font-bold text-foreground hover:bg-muted/40 transition-colors"
                aria-expanded={showVitals}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span>2. Objective Clinical Vitals (Optional)</span>
                </div>
                {showVitals ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {showVitals && (
                <div className="p-5 border-t border-border/70 space-y-4 bg-muted/10">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    If available from a home monitor or clinical cuff, record measured baseline parameters:
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <Label htmlFor="vitals-bp-sys" className="text-[11px] font-semibold text-muted-foreground">
                        BP (mmHg Sys / Dia)
                      </Label>
                      <div className="flex items-center gap-1.5">
                        <Input
                          id="vitals-bp-sys"
                          placeholder="120"
                          value={bpSystolic}
                          onChange={(e) => setBpSystolic(e.target.value)}
                          className="h-9 text-xs rounded-lg"
                        />
                        <span className="text-muted-foreground">/</span>
                        <Input
                          placeholder="80"
                          value={bpDiastolic}
                          onChange={(e) => setBpDiastolic(e.target.value)}
                          className="h-9 text-xs rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="vitals-hr" className="text-[11px] font-semibold text-muted-foreground">
                        Heart Rate (bpm)
                      </Label>
                      <Input
                        id="vitals-hr"
                        placeholder="72"
                        value={heartRate}
                        onChange={(e) => setHeartRate(e.target.value)}
                        className="h-9 text-xs rounded-lg"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="vitals-temp" className="text-[11px] font-semibold text-muted-foreground">
                        Body Temp (°C)
                      </Label>
                      <Input
                        id="vitals-temp"
                        placeholder="37.0"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        className="h-9 text-xs rounded-lg"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="vitals-spo2" className="text-[11px] font-semibold text-muted-foreground">
                        Oxygen SpO2 (%)
                      </Label>
                      <Input
                        id="vitals-spo2"
                        placeholder="98"
                        value={oxygenSaturation}
                        onChange={(e) => setOxygenSaturation(e.target.value)}
                        className="h-9 text-xs rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Pharmacotherapy, Allergies & Safety Engine */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
              <div className="pb-3 border-b border-border/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    3. Medications & Allergies
                  </h3>
                </div>
                <span className="text-[11px] text-muted-foreground">Contraindication Radar</span>
              </div>

              {/* Medications */}
              <div className="space-y-2">
                <Label htmlFor="medications-input" className="text-xs font-semibold text-foreground">
                  Active Medications (Press Enter to add)
                </Label>
                <Input
                  id="medications-input"
                  value={medInput}
                  onChange={(e) => setMedInput(e.target.value)}
                  onKeyDown={handleAddMedication}
                  placeholder="e.g. Lisinopril, Metformin, Amoxicillin"
                  className="h-9 text-xs rounded-xl"
                />
                {medications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {medications.map((med, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-muted text-foreground border border-border/80 font-medium"
                      >
                        {med}
                        <button
                          type="button"
                          onClick={() => setMedications(medications.filter((_, idx) => idx !== i))}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={`Remove ${med}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Allergies */}
              <div className="space-y-2">
                <Label htmlFor="allergies-input" className="text-xs font-semibold text-foreground">
                  Known Drug & Environmental Allergies
                </Label>
                <Input
                  id="allergies-input"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={handleAddAllergy}
                  placeholder="e.g. Penicillin, Sulfa, Latex, Aspirin"
                  className="h-9 text-xs rounded-xl"
                />
                {allergies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {allergies.map((allg, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-red-500/10 text-red-800 dark:text-red-300 border border-red-500/20 font-medium"
                      >
                        {allg}
                        <button
                          type="button"
                          onClick={() => setAllergies(allergies.filter((_, idx) => idx !== i))}
                          className="text-red-600 hover:text-red-800"
                          aria-label={`Remove ${allg}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Past History */}
              <div className="space-y-2">
                <Label htmlFor="medical-history" className="text-xs font-semibold text-foreground">
                  Chronic Conditions, Surgeries & Comorbidities
                </Label>
                <Textarea
                  id="medical-history"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma, Prior Cholecystectomy..."
                  className="min-h-[70px] text-xs resize-y rounded-xl"
                />
              </div>

              {/* Real-Time Drug Interaction Alerts */}
              {drugSafetyAlerts.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-1.5 text-xs">
                  <div className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    Clinical Safety Contraindication Alert
                  </div>
                  {drugSafetyAlerts.map((alert, i) => (
                    <p key={i} className="font-medium leading-relaxed">• {alert}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Chief Complaint, Anatomical Locator, Pain & Temporal Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 4: Chief Complaint Narrative & Voice Speech-to-Text */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    4. Chief Complaint Narrative
                  </h3>
                </div>

                {speechSupported && (
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    onClick={toggleRecording}
                    className="flex items-center gap-1.5 h-8 text-xs font-semibold rounded-lg self-start sm:self-auto"
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 animate-pulse" />
                        Listening... Tap to Complete
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-primary" />
                        Voice Dictation
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="relative">
                <Textarea
                  value={primaryDescription}
                  onChange={handleDescriptionChange}
                  placeholder="Describe your symptoms in natural language. How does the discomfort feel (e.g. sharp, burning, dull pressure)? What triggers or relieves it? When did it start?"
                  className="min-h-[110px] text-xs sm:text-sm p-3.5 leading-relaxed rounded-xl resize-y"
                  required={symptomTags.length === 0}
                />
                {isRecording && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 text-red-600 text-xs font-medium border border-red-500/20">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    Recording active
                  </div>
                )}
              </div>

              {/* NRS Severity & Temporal Velocity Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                {/* Numeric Rating Scale (NRS) Pain Slider */}
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">
                      Pain Intensity (NRS):
                    </span>
                    <span className={`font-bold font-mono ${painInfo.color}`}>
                      {severity} / 10
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={[severity]}
                    onValueChange={(vals) => setSeverity(vals[0])}
                    className="cursor-pointer py-1"
                    aria-label="Pain severity slider"
                  />
                  <div className="text-[11px] leading-tight">
                    <span className={`font-bold block ${painInfo.color}`}>
                      {painInfo.label}
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                      {painInfo.desc}
                    </span>
                  </div>
                </div>

                {/* Duration */}
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1.5">
                  <Label htmlFor="symptom-duration" className="text-xs font-semibold text-foreground">
                    Symptom Duration
                  </Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger id="symptom-duration" className="h-9 text-xs rounded-lg bg-card">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="< 24 hours">Under 24 hours</SelectItem>
                      <SelectItem value="1-3 days">1 to 3 days</SelectItem>
                      <SelectItem value="4-7 days">4 to 7 days</SelectItem>
                      <SelectItem value="1-2 weeks">1 to 2 weeks</SelectItem>
                      <SelectItem value="2-4 weeks">2 to 4 weeks</SelectItem>
                      <SelectItem value="> 1 month">More than 1 month</SelectItem>
                      <SelectItem value="Chronic / Recurring">Chronic / Recurring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Onset Speed */}
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1.5">
                  <Label htmlFor="onset-speed" className="text-xs font-semibold text-foreground">
                    Onset Characteristics
                  </Label>
                  <Select
                    value={onsetSpeed}
                    onValueChange={(v) => setOnsetSpeed(v as "sudden" | "gradual" | "fluctuating")}
                  >
                    <SelectTrigger id="onset-speed" className="h-9 text-xs rounded-lg bg-card">
                      <SelectValue placeholder="Select onset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sudden">Sudden / Acute (Minutes/Hour)</SelectItem>
                      <SelectItem value="gradual">Gradual (Over Days)</SelectItem>
                      <SelectItem value="fluctuating">Fluctuating / Intermittent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Step 5: Anatomical Body Map & Live Search */}
            <div className="space-y-4">
              {/* Quick Search Symptom Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Quick-search specific symptoms (e.g. migraine, wheezing, palpitations, epigastric burning)..."
                  className="pl-10 text-xs h-10 rounded-xl bg-card border-border"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Live Search Autocomplete Results */}
              {searchQuery && (
                <div className="p-3.5 rounded-xl bg-card border border-border shadow-md space-y-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                    Matching Clinical Terms ({filteredSymptoms.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                    {filteredSymptoms.length > 0 ? (
                      filteredSymptoms.map((symptom) => {
                        const isTagged = symptomTags.includes(symptom);
                        return (
                          <button
                            key={symptom}
                            type="button"
                            onClick={() => toggleSymptomTag(symptom)}
                            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                              isTagged
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/40 border-border text-foreground hover:border-primary/50"
                            }`}
                          >
                            {isTagged ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            {symptom}
                          </button>
                        );
                      })
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No standard vocabulary matches found. You can describe this in your narrative box above.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Visual Body Map Locator Component */}
              <BodyMapSelector
                selectedZoneId={activeZoneId}
                onSelectZone={handleSelectZone}
                selectedSymptoms={symptomTags}
                onToggleSymptom={toggleSymptomTag}
              />

              {/* Tagged Symptom Pills */}
              {symptomTags.length > 0 && (
                <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Incorporated Clinical Indicators ({symptomTags.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setSymptomTags([])}
                      className="text-destructive hover:underline text-[11px]"
                    >
                      Clear All Tags
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {symptomTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-primary text-primary-foreground shadow-xs"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => toggleSymptomTag(tag)}
                          className="hover:opacity-75 focus:outline-none"
                          aria-label={`Remove ${tag}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action & Safety Footer */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-start space-x-3">
            <input
              id="privacy-policy"
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
            <label
              htmlFor="privacy-policy"
              className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
            >
              I understand that ManoMed AI provides clinical triage and preliminary decision support powered by medical language models. This tool is designed to assist preparation for a licensed healthcare provider consultation and does not replace emergency medical care. I accept the{" "}
              <a href="/privacy" target="_blank" className="underline text-foreground hover:text-primary">
                Privacy Policy & Medical Covenants
              </a>
              .
            </label>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-border/60">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>All entered session parameters are processed under strict client privacy.</span>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="min-h-[48px] px-8 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Synthesizing Diagnostic Questions...
                </>
              ) : (
                <>
                  Synthesize Clinical Assessment & Generate Follow-up
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Emergency Red Flag Interceptor Modal */}
      <Dialog open={showEmergencyModal} onOpenChange={setShowEmergencyModal}>
        <DialogContent className="max-w-md border-red-500 bg-card p-6">
          <DialogHeader>
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-red-600">
              Immediate Emergency Alert
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-foreground/90 pt-2 space-y-2">
              <p>
                You reported clinical indicators matching <strong>"{emergencyKeywordFound}"</strong>. These can indicate a critical acute emergency (such as myocardial infarction, pulmonary embolism, cerebrovascular accident, or anaphylaxis).
              </p>
              <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl text-left text-xs text-red-800 dark:text-red-200 border border-red-200 dark:border-red-900 space-y-1.5">
                <strong>Emergency Response Protocol:</strong>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Call emergency responders (<strong>911, 999, 112</strong>) immediately.</li>
                  <li>Do not attempt to drive yourself to the hospital.</li>
                  <li>If alone, unlock your entrance door and alert a neighbor or contact.</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="destructive"
              className="w-full flex items-center justify-center gap-2 font-bold min-h-[44px]"
              onClick={() => {
                if (typeof window !== "undefined") window.location.href = "tel:911";
              }}
            >
              <PhoneCall className="w-4 h-4" />
              Call Emergency Services (911)
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full text-xs min-h-[44px]"
              onClick={() => setShowEmergencyModal(false)}
            >
              I Understand, Continue Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
