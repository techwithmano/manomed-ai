"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Sparkles,
  Layers,
  Pill,
  ShieldAlert,
} from "lucide-react";
import { CurrentAssessment } from "@/lib/assessment-store";
import { BodyMapSelector, ANATOMICAL_ZONES, AnatomicalZone } from "./BodyMapSelector";

interface SymptomInputFormProps {
  initialData?: CurrentAssessment;
  onSubmit: (data: CurrentAssessment) => void;
  isLoading?: boolean;
}

const EMERGENCY_KEYWORDS = [
  "chest pressure", "crushing chest", "left arm pain", "slurred speech", "facial droop",
  "can't breathe", "suffocating", "severe hemorrhage", "coughing blood", "suicide",
  "suicidal", "anaphylaxis", "throat swelling", "thunderclap headache", "worst headache of life",
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
  const [severity, setSeverity] = useState<number>(initialData?.symptoms.severity ?? 5);
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
  const [oxygenSaturation, setOxygenSaturation] = useState(initialData?.vitals.oxygenSaturation || "");

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
    const hasPenicillinAllergy = allergiesLower.some((a) => a.includes("penicillin") || a.includes("amoxicillin"));
    const takesPenicillinMed = medsLower.some(
      (m) => m.includes("amox") || m.includes("penicillin") || m.includes("augmentin") || m.includes("ampicillin")
    );
    if (hasPenicillinAllergy && takesPenicillinMed) {
      alerts.push("CRITICAL: Patient reported Penicillin allergy while taking a Beta-lactam medication (Amoxicillin/Augmentin). High risk of anaphylaxis!");
    }

    // NSAID Ulcer / Bleeding Risk
    const hasUlcerOrBleed = historyLower.includes("ulcer") || historyLower.includes("gastritis") || historyLower.includes("gerd");
    const takesNSAID = medsLower.some((m) => m.includes("ibuprofen") || m.includes("aspirin") || m.includes("naproxen") || m.includes("advil") || m.includes("aleve"));
    if (hasUlcerOrBleed && takesNSAID) {
      alerts.push("CAUTION: NSAID medication (Ibuprofen/Naproxen/Aspirin) reported with gastric ulcer/GERD history. Risk of GI bleed.");
    }

    // Asthma + Beta-Blocker
    const hasAsthma = historyLower.includes("asthma") || historyLower.includes("copd");
    const takesBetaBlocker = medsLower.some((m) => m.includes("propranolol") || m.includes("metoprolol") || m.includes("atenolol") || m.includes("carvedilol"));
    if (hasAsthma && takesBetaBlocker) {
      alerts.push("WARNING: Non-selective Beta-blocker reported in a patient with reactive airway/asthma history. Risk of bronchospasm.");
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
      setError("Please enter patient name.");
      return;
    }
    if (!age || Number(age) < 1 || Number(age) > 120) {
      setError("Please enter a valid age between 1 and 120.");
      return;
    }
    if (!gender) {
      setError("Please select biological sex.");
      return;
    }
    if (!primaryDescription.trim() && symptomTags.length === 0) {
      setError("Please describe symptoms or select from the anatomical locator.");
      return;
    }
    if (!acceptedPrivacy) {
      setError("You must accept the Clinical Triage & Privacy terms.");
      return;
    }

    setError(null);

    const fullSymptoms = [
      primaryDescription.trim(),
      symptomTags.length > 0 ? `Selected symptom indicators: ${symptomTags.join(", ")}` : "",
      selectedBodyRegions.length > 0 ? `Affected body systems: ${selectedBodyRegions.join(", ")}` : "",
      `Reported severity: ${severity}/10 (${severity >= 7 ? "Severe" : severity >= 4 ? "Moderate" : "Mild"})`,
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

  // Wong-Baker FACES pain representation
  const getPainFace = (val: number) => {
    if (val <= 2) return { face: "😊", label: "0-2 Mild / Minor Discomfort", color: "text-emerald-500" };
    if (val <= 4) return { face: "😐", label: "3-4 Moderate / Tolerable Discomfort", color: "text-amber-500" };
    if (val <= 6) return { face: "🙁", label: "5-6 Distressing / Interferes with Tasks", color: "text-orange-500" };
    if (val <= 8) return { face: "😣", label: "7-8 Severe / Disabling Pain", color: "text-red-500" };
    return { face: "😭", label: "9-10 Excruciating / Incapacitating", color: "text-red-600 animate-pulse" };
  };

  const painInfo = getPainFace(severity);

  return (
    <>
      <Card className="w-full shadow-2xl border-border/80 backdrop-blur-md">
        <CardHeader className="text-center pb-5 border-b border-border/60">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mb-2 shadow-md shadow-blue-500/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Clinical Symptom Intake & Triage
          </CardTitle>
          <CardDescription className="text-sm max-w-xl mx-auto leading-relaxed">
            Fill in your clinical presentation. Our Google GenAI decision support engine analyzes your input against evidence-based medical triage algorithms.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Patient Demographics */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] flex items-center justify-center font-bold">1</span>
                Patient Demographics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="patient-name" className="text-xs font-semibold">Full Name *</Label>
                  <Input
                    id="patient-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="patient-age" className="text-xs font-semibold">Age (Years) *</Label>
                  <Input
                    id="patient-age"
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="28"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="patient-gender" className="text-xs font-semibold">Biological Sex *</Label>
                  <Select value={gender} onValueChange={setGender} required>
                    <SelectTrigger id="patient-gender">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other / Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Step 2: Anatomical Body Map & Live Search */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] flex items-center justify-center font-bold">2</span>
                  Anatomical Localization & Symptom Picker
                </h3>
                <span className="text-[11px] text-primary font-semibold">
                  {symptomTags.length} Symptoms Tagged
                </span>
              </div>

              {/* Live Symptom Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Quick search symptoms (e.g. migraine, cough, palpitations, burning urination)..."
                  className="pl-10 text-xs h-10 rounded-xl"
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
                <div className="p-3 rounded-xl bg-card border border-border shadow-md space-y-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">
                    Matching Clinical Symptoms ({filteredSymptoms.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                    {filteredSymptoms.length > 0 ? (
                      filteredSymptoms.map((symptom) => {
                        const isTagged = symptomTags.includes(symptom);
                        return (
                          <Badge
                            key={symptom}
                            variant={isTagged ? "default" : "outline"}
                            className="cursor-pointer text-xs py-1 px-2.5 transition-all"
                            onClick={() => toggleSymptomTag(symptom)}
                          >
                            {isTagged ? "✓ " : "+ "}
                            {symptom}
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No exact match found. You can describe your specific symptoms in the box below!
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
                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-semibold">Incorporated Symptoms:</span>
                    <button
                      type="button"
                      onClick={() => setSymptomTags([])}
                      className="text-destructive hover:underline text-[10px]"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {symptomTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => toggleSymptomTag(tag)}
                          className="hover:opacity-75 focus:outline-none"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Detailed Description & Voice Speech-to-Text */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] flex items-center justify-center font-bold">3</span>
                  Detailed Chief Complaint & History of Present Illness
                </h3>
                {speechSupported && (
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    onClick={toggleRecording}
                    className="flex items-center gap-1.5 h-8 text-xs font-semibold rounded-xl"
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 animate-pulse" />
                        Recording... (Tap to finish)
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
                  placeholder="Elaborate in your own words. How does the sensation feel (sharp, stabbing, dull ache, burning)? When did it begin? Does anything make it better or worse?"
                  className="min-h-[110px] text-sm p-3.5 leading-relaxed rounded-xl resize-y"
                  required={symptomTags.length === 0}
                />
                {isRecording && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 text-red-600 text-xs font-medium border border-red-500/20">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    Listening to voice...
                  </div>
                )}
              </div>

              {/* Severity & Timeline Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                {/* Pain Slider with Wong-Baker FACES */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                      <span className="text-lg">{painInfo.face}</span>
                      Pain / Severity:
                    </span>
                    <span className={`font-bold ${painInfo.color}`}>
                      {severity}/10
                    </span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[severity]}
                    onValueChange={(vals) => setSeverity(vals[0])}
                    className="cursor-pointer py-1"
                  />
                  <span className="text-[11px] text-muted-foreground block text-center font-medium">
                    {painInfo.label}
                  </span>
                </div>

                {/* Duration */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                  <Label htmlFor="symptom-duration" className="text-xs font-semibold text-muted-foreground">
                    Symptom Duration
                  </Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger id="symptom-duration" className="h-9 text-xs">
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
                <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                  <Label htmlFor="onset-speed" className="text-xs font-semibold text-muted-foreground">
                    Onset Characteristics
                  </Label>
                  <Select
                    value={onsetSpeed}
                    onValueChange={(v) => setOnsetSpeed(v as "sudden" | "gradual" | "fluctuating")}
                  >
                    <SelectTrigger id="onset-speed" className="h-9 text-xs">
                      <SelectValue placeholder="Select onset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sudden">Sudden / Acute (minutes to hour)</SelectItem>
                      <SelectItem value="gradual">Gradual (over several days)</SelectItem>
                      <SelectItem value="fluctuating">Fluctuating / Intermittent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Step 4: Medical History, Medications, Allergies & Safety Engine */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] flex items-center justify-center font-bold">4</span>
                Medications, Allergies & History Context
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Medications */}
                <div className="space-y-1.5">
                  <Label htmlFor="medications-input" className="text-xs font-semibold flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-primary" />
                    Current Medications (Press Enter or Comma)
                  </Label>
                  <Input
                    id="medications-input"
                    value={medInput}
                    onChange={(e) => setMedInput(e.target.value)}
                    onKeyDown={handleAddMedication}
                    placeholder="e.g. Amoxicillin, Lisinopril, Metformin"
                    className="h-9 text-xs rounded-xl"
                  />
                  {medications.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {medications.map((med, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground font-medium"
                        >
                          {med}
                          <button
                            type="button"
                            onClick={() => setMedications(medications.filter((_, idx) => idx !== i))}
                            className="hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Allergies */}
                <div className="space-y-1.5">
                  <Label htmlFor="allergies-input" className="text-xs font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                    Known Drug Allergies (Press Enter or Comma)
                  </Label>
                  <Input
                    id="allergies-input"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyDown={handleAddAllergy}
                    placeholder="e.g. Penicillin, Sulfa, Aspirin"
                    className="h-9 text-xs rounded-xl"
                  />
                  {allergies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {allergies.map((allg, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 font-medium"
                        >
                          {allg}
                          <button
                            type="button"
                            onClick={() => setAllergies(allergies.filter((_, idx) => idx !== i))}
                            className="hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Past History */}
              <div className="space-y-1.5">
                <Label htmlFor="medical-history" className="text-xs font-semibold">
                  Past Medical Conditions, Surgeries & Chronic Diagnoses
                </Label>
                <Textarea
                  id="medical-history"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma, GERD, Gastric Ulcer, smoker history..."
                  className="min-h-[70px] text-xs resize-y rounded-xl"
                />
              </div>

              {/* Real-Time Drug Interaction Alerts */}
              {drugSafetyAlerts.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 space-y-1 text-xs">
                  <div className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Drug-Allergy Safety Screening Flag
                  </div>
                  {drugSafetyAlerts.map((alert, i) => (
                    <p key={i} className="font-medium leading-relaxed">• {alert}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Optional Step 5: Vitals Toggle */}
            <div className="border border-border/80 rounded-2xl overflow-hidden bg-card/60">
              <button
                type="button"
                onClick={() => setShowVitals(!showVitals)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-muted-foreground hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span>Optional Clinical Vitals (Blood Pressure, Heart Rate, Body Temp, SpO2)</span>
                </div>
                {showVitals ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showVitals && (
                <div className="p-4 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/10">
                  <div className="space-y-1">
                    <Label htmlFor="vitals-bp-sys" className="text-[11px] text-muted-foreground font-semibold">
                      BP Systolic / Diastolic
                    </Label>
                    <div className="flex items-center gap-1">
                      <Input
                        id="vitals-bp-sys"
                        placeholder="120"
                        value={bpSystolic}
                        onChange={(e) => setBpSystolic(e.target.value)}
                        className="h-8 text-xs rounded-lg"
                      />
                      <span className="text-muted-foreground">/</span>
                      <Input
                        placeholder="80"
                        value={bpDiastolic}
                        onChange={(e) => setBpDiastolic(e.target.value)}
                        className="h-8 text-xs rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="vitals-hr" className="text-[11px] text-muted-foreground font-semibold">
                      Heart Rate (bpm)
                    </Label>
                    <Input
                      id="vitals-hr"
                      placeholder="e.g. 74"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      className="h-8 text-xs rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="vitals-temp" className="text-[11px] text-muted-foreground font-semibold">
                      Temperature (°C)
                    </Label>
                    <Input
                      id="vitals-temp"
                      placeholder="e.g. 37.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="h-8 text-xs rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="vitals-spo2" className="text-[11px] text-muted-foreground font-semibold">
                      Oxygen SpO2 (%)
                    </Label>
                    <Input
                      id="vitals-spo2"
                      placeholder="e.g. 98"
                      value={oxygenSaturation}
                      onChange={(e) => setOxygenSaturation(e.target.value)}
                      className="h-8 text-xs rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Privacy Checkbox */}
            <div className="flex items-start space-x-2 pt-1">
              <input
                id="privacy-policy"
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="privacy-policy" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                I understand that ManoMed AI provides clinical triage and preliminary decision support powered by Google GenAI. This does not replace emergency medical care. I accept the{" "}
                <a href="/privacy" target="_blank" className="underline text-primary hover:text-primary/80">
                  Privacy Policy
                </a>{" "}
                and consent to assessment.
              </label>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-bold shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? "Synthesizing Questionnaire..." : "Proceed to Clinical Questionnaire →"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Real-time Emergency Warning Dialog */}
      <Dialog open={showEmergencyModal} onOpenChange={setShowEmergencyModal}>
        <DialogContent className="max-w-md border-red-500 bg-card p-6">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-red-600">
              Emergency Symptom Alert
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-foreground/90 pt-2 space-y-2">
              <p>
                You reported symptoms containing <strong>"{emergencyKeywordFound}"</strong>. These can indicate a critical medical emergency (such as a heart attack, stroke, pulmonary embolism, or anaphylaxis).
              </p>
              <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl text-left text-xs text-red-800 dark:text-red-200 border border-red-200 dark:border-red-900 space-y-1">
                <strong>Immediate Emergency Protocols:</strong>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Call emergency responders (<strong>911, 999, 112</strong>) immediately.</li>
                  <li>Do not drive yourself to the emergency department.</li>
                  <li>If alone, unlock your door and notify emergency contacts.</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="destructive"
              className="w-full flex items-center justify-center gap-2 font-bold"
              onClick={() => {
                if (typeof window !== "undefined") window.location.href = "tel:911";
              }}
            >
              <PhoneCall className="w-4 h-4" />
              Call 911 Immediately
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full text-xs"
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
