"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  Mic,
  MicOff,
  AlertTriangle,
  HeartPulse,
  HeartHandshake,
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
import { checkRedFlags, RedFlagMatch } from "@/lib/redFlags";
import { emergencyConfig } from "@/lib/emergencyConfig";
import { useLanguage } from "@/context/language-context";

export interface SymptomInputFormProps {
  initialData?: CurrentAssessment | null;
  onSubmit: (data: CurrentAssessment) => void;
  isLoading?: boolean;
}

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
  // Red flag safety banner state (100% client-side evaluation — never stored or transmitted)
  const { language, t } = useLanguage();
  const [activeRedFlag, setActiveRedFlag] = useState<RedFlagMatch | null>(null);
  const [acknowledgedRedFlag, setAcknowledgedRedFlag] = useState<boolean>(false);
  const redFlagAlertRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Client-side red-flag evaluation (Debounced 300ms)
  // PRIVACY: Input text is evaluated strictly in the client's browser and is never logged or transmitted.
  const triggerRedFlagEvaluation = useCallback(
    (textToEvaluate: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        const match = checkRedFlags(textToEvaluate, language);
        if (match) {
          setActiveRedFlag(match);
          setAcknowledgedRedFlag(false);
        } else {
          setActiveRedFlag(null);
        }
      }, 300);
    },
    [language]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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
              const updated = prev + separator + currentTranscript.trim();
              const combined = [updated, ...symptomTags].join(" ");
              triggerRedFlagEvaluation(combined);
              return updated;
            });
          }
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognitionRef.current = recognition;
      }
    }
  }, [symptomTags, triggerRedFlagEvaluation]);

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

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPrimaryDescription(val);
    const combined = [val, ...symptomTags].join(" ");
    triggerRedFlagEvaluation(combined);
  };

  const toggleSymptomTag = (tag: string) => {
    setSymptomTags((prev) => {
      const nextTags = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      const combined = [primaryDescription, ...nextTags].join(" ");
      triggerRedFlagEvaluation(combined);
      return nextTags;
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

    // Safety check on submit: evaluate synchronously so fast submission cannot bypass red flags.
    // The alert never blocks submission permanently or hides user input.
    const combinedSymptoms = [primaryDescription, ...symptomTags].join(" ");
    const submitRedFlag = checkRedFlags(combinedSymptoms, language);

    if (submitRedFlag && !acknowledgedRedFlag) {
      setActiveRedFlag(submitRedFlag);
      if (redFlagAlertRef.current) {
        redFlagAlertRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
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
                <Badge variant="outline" className="text-xs font-mono border-border">
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
            {/* TODO: VERIFY SECURITY CLAIMS — Ensure session security matches actual storage model */}
            <span className="px-2 py-0.5 rounded bg-muted text-xs font-medium font-sans">
              Local Session
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
                <span className="text-xs text-muted-foreground">Required</span>
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
                      <Label htmlFor="vitals-bp-sys" className="text-xs font-semibold text-muted-foreground">
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
                      <Label htmlFor="vitals-hr" className="text-xs font-semibold text-muted-foreground">
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
                      <Label htmlFor="vitals-temp" className="text-xs font-semibold text-muted-foreground">
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
                      <Label htmlFor="vitals-spo2" className="text-xs font-semibold text-muted-foreground">
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
                <span className="text-xs text-muted-foreground">Contraindication Radar</span>
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
                  <div className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-xs">
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

              {/* Persistent safety notice for non-English users (automated red-flag detection for non-English inputs is pending clinical review) */}
              {language !== "en" && (
                <div
                  role="note"
                  className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">
                    {t.persistentEmergencyNotice}
                  </p>
                </div>
              )}

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

              {/* Accessible Client-Side Red-Flag Alert Banner (Single Live Region) */}
              {activeRedFlag && (
                <div
                  ref={redFlagAlertRef}
                  role="alert"
                  aria-live="assertive"
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    activeRedFlag.type === "crisis_support"
                      ? "bg-purple-500/10 border-purple-500/30 text-purple-950 dark:text-purple-100"
                      : "bg-destructive/10 border-destructive/30 text-foreground"
                  }`}
                >
                  {activeRedFlag.type === "crisis_support" ? (
                    <>
                      {/* TODO: CLINICAL REVIEW REQUIRED — Crisis support messaging */}
                      <div className="flex items-start gap-3 text-purple-950 dark:text-purple-100">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                          <HeartHandshake className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 flex-1 text-xs">
                          <h4 className="font-bold text-sm text-purple-950 dark:text-purple-100">
                            Confidential Crisis & Support Available
                          </h4>
                          <p className="leading-relaxed">
                            {activeRedFlag.userMessage}
                          </p>
                          <p className="text-purple-800 dark:text-purple-300">
                            If you or someone you know is going through a difficult time, confidential support is available 24/7.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {emergencyConfig.crisisSupportNumber && (
                          <a
                            href={`tel:${emergencyConfig.crisisSupportNumber}`}
                            className="min-h-[44px] px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold flex items-center gap-2 text-xs shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                          >
                            <PhoneCall className="w-4 h-4" />
                            Call or Text Crisis Helpline ({emergencyConfig.crisisSupportNumber})
                          </a>
                        )}
                        {emergencyConfig.crisisSupportUrl && (
                          <a
                            href={emergencyConfig.crisisSupportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-h-[44px] px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 dark:hover:bg-purple-900 text-purple-950 dark:text-purple-100 font-semibold flex items-center gap-1.5 text-xs border border-purple-300 dark:border-purple-700 transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                          >
                            Find Free Crisis Helpline Worldwide ↗
                          </a>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setAcknowledgedRedFlag(true)}
                          className="min-h-[44px] text-xs text-purple-950 dark:text-purple-100 hover:bg-purple-500/10 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                        >
                          {acknowledgedRedFlag ? "✓ Acknowledged" : "Continue with symptom check"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* TODO: CLINICAL REVIEW REQUIRED — Emergency medical warning */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-destructive/20 text-destructive flex items-center justify-center shrink-0 mt-0.5">
                          <AlertTriangle className="w-4 h-4 animate-pulse" />
                        </div>
                        <div className="space-y-1 flex-1 text-xs text-foreground">
                          <h4 className="font-bold text-sm text-destructive">
                            Potential Medical Emergency Warning
                          </h4>
                          <p className="leading-relaxed">
                            {activeRedFlag.userMessage}
                          </p>
                          <p className="text-muted-foreground">
                            {emergencyConfig.medicalEmergencyNumber
                              ? `Immediate in-person emergency evaluation is strongly advised.`
                              : `If you are experiencing severe or life-threatening symptoms, please call your local emergency number (such as 911, 999, or 112) or proceed to the nearest emergency room immediately.`}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {emergencyConfig.medicalEmergencyNumber && (
                          <a
                            href={`tel:${emergencyConfig.medicalEmergencyNumber}`}
                            className="min-h-[44px] px-4 py-2 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold flex items-center gap-2 text-xs shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                          >
                            <PhoneCall className="w-4 h-4" />
                            Call Emergency Services ({emergencyConfig.medicalEmergencyNumber})
                          </a>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAcknowledgedRedFlag(true)}
                          className="min-h-[44px] text-xs border-destructive/30 hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                          {acknowledgedRedFlag ? "✓ Acknowledged" : "Continue with symptom check"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

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
                  <div className="text-xs leading-tight">
                    <span className={`font-bold block ${painInfo.color}`}>
                      {painInfo.label}
                    </span>
                    <span className="text-muted-foreground text-xs">
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
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
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
                      className="text-destructive hover:underline text-xs"
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
    </>
  );
};
