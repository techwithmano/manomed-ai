"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  HeartPulse,
  Stethoscope,
  Activity,
  Bone,
  Layers,
  ShieldCheck,
  Check,
  Plus,
  Crosshair,
} from "lucide-react";

export type ZoneIconName =
  | "brain"
  | "heart"
  | "stethoscope"
  | "activity"
  | "bone"
  | "layers"
  | "shield";

export interface AnatomicalZone {
  id: string;
  name: string;
  subTitle: string;
  iconName: ZoneIconName;
  icon?: string; // backwards compatibility
  view: "front" | "back" | "both";
  svgPathCoords: { x: number; y: number; r?: number; w?: number; h?: number };
  commonSymptoms: string[];
}

export const ANATOMICAL_ZONES: AnatomicalZone[] = [
  {
    id: "head",
    name: "Head, Cranial & Sensory",
    subTitle: "Neurological & Ophthalmic",
    iconName: "brain",
    view: "front",
    svgPathCoords: { x: 100, y: 35, r: 22 },
    commonSymptoms: [
      "Throbbing Unilateral Headache",
      "Bilateral Tension Headache",
      "Visual Aura / Photophobia",
      "Dizziness / Vertigo",
      "Facial Pressure / Sinus Pain",
      "Sore Throat / Dysphagia",
      "Tinnitus / Ear Ringing",
    ],
  },
  {
    id: "chest",
    name: "Chest, Heart & Lungs",
    subTitle: "Cardiopulmonary & Thoracic",
    iconName: "heart",
    view: "front",
    svgPathCoords: { x: 100, y: 98, w: 46, h: 42 },
    commonSymptoms: [
      "Substernal Chest Tightness",
      "Shortness of Breath (Dyspnea)",
      "Persistent Dry Cough",
      "Productive Cough (Yellow/Green Sputum)",
      "Heart Palpitations / Tachycardia",
      "Pleuritic Pain on Deep Inhalation",
      "Wheezing / Expiratory Stridor",
    ],
  },
  {
    id: "abdomen",
    name: "Abdomen & Digestive Tract",
    subTitle: "Gastrointestinal & Hepatic",
    iconName: "stethoscope",
    view: "front",
    svgPathCoords: { x: 100, y: 154, w: 42, h: 44 },
    commonSymptoms: [
      "Epigastric Burning / Acid Reflux",
      "Right Lower Quadrant Pain",
      "Right Upper Quadrant Tenderness",
      "Persistent Nausea / Vomiting",
      "Watery Diarrhea",
      "Constipation / Severe Cramping",
      "Abdominal Bloating & Distension",
    ],
  },
  {
    id: "pelvis",
    name: "Pelvis & Urinary Tract",
    subTitle: "Genitourinary & Lower Abdominal",
    iconName: "activity",
    view: "front",
    svgPathCoords: { x: 100, y: 206, w: 44, h: 28 },
    commonSymptoms: [
      "Dysuria (Burning Urination)",
      "Urinary Frequency / Urgency",
      "Suprapubic Pressure / Pain",
      "Flank Pain (Kidney Angle)",
      "Pelvic Cramping",
    ],
  },
  {
    id: "spine",
    name: "Spine & Posterior Back",
    subTitle: "Cervical, Thoracic & Lumbar Spine",
    iconName: "bone",
    view: "back",
    svgPathCoords: { x: 100, y: 125, w: 26, h: 80 },
    commonSymptoms: [
      "Lower Lumbar Back Pain",
      "Cervical Neck Stiffness",
      "Sciatica Radiating to Leg",
      "Muscle Spasms along Spine",
      "Postural Stiffness",
    ],
  },
  {
    id: "upper_limbs",
    name: "Arms, Shoulders & Hands",
    subTitle: "Upper Extremity Musculoskeletal",
    iconName: "layers",
    view: "both",
    svgPathCoords: { x: 45, y: 120, w: 22, h: 70 },
    commonSymptoms: [
      "Shoulder Impingement Pain",
      "Elbow Tendonitis / Soreness",
      "Wrist / Carpal Tunnel Numbness",
      "Hand Joint Stiffness / Arthritis",
      "Paresthesia (Pins & Needles in Fingers)",
    ],
  },
  {
    id: "lower_limbs",
    name: "Hips, Legs & Feet",
    subTitle: "Lower Extremity & Joints",
    iconName: "activity",
    view: "both",
    svgPathCoords: { x: 85, y: 265, w: 30, h: 90 },
    commonSymptoms: [
      "Knee Swelling & Crepitus",
      "Calf Tenderness / Unilateral Edema",
      "Ankle Inversion Sprain Pain",
      "Plantar Fascia Heel Pain",
      "Hip Joint Deep Ache",
    ],
  },
  {
    id: "skin",
    name: "Skin & Dermatologic",
    subTitle: "Integumentary & Cutaneous",
    iconName: "shield",
    view: "both",
    svgPathCoords: { x: 155, y: 120, w: 20, h: 20 },
    commonSymptoms: [
      "Pruritic (Itchy) Erythematous Rash",
      "Raised Urticarial Wheals (Hives)",
      "Localized Bullae / Blistering",
      "Dry Scaling / Eczema Plaques",
      "Erythema / Warmth around Wound",
    ],
  },
];

export function renderZoneIcon(iconName: ZoneIconName, className = "w-4 h-4") {
  switch (iconName) {
    case "brain":
      return <Brain className={className} />;
    case "heart":
      return <HeartPulse className={className} />;
    case "stethoscope":
      return <Stethoscope className={className} />;
    case "activity":
      return <Activity className={className} />;
    case "bone":
      return <Bone className={className} />;
    case "layers":
      return <Layers className={className} />;
    case "shield":
      return <ShieldCheck className={className} />;
    default:
      return <Activity className={className} />;
  }
}

interface BodyMapSelectorProps {
  selectedZoneId: string | null;
  onSelectZone: (zone: AnatomicalZone) => void;
  selectedSymptoms: string[];
  onToggleSymptom: (symptom: string) => void;
}

export const BodyMapSelector: React.FC<BodyMapSelectorProps> = ({
  selectedZoneId,
  onSelectZone,
  selectedSymptoms,
  onToggleSymptom,
}) => {
  const [viewOrientation, setViewOrientation] = useState<"front" | "back">("front");

  const currentZone = ANATOMICAL_ZONES.find((z) => z.id === selectedZoneId) || ANATOMICAL_ZONES[0];

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-primary" />
            <h4 className="font-bold text-sm text-foreground tracking-tight">
              Anatomical Localization Locator
            </h4>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select a target anatomical region on the medical wireframe to isolate corresponding clinical indicators.
          </p>
        </div>

        {/* Anterior / Posterior Projection Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 self-start sm:self-auto border border-border/40">
          <button
            type="button"
            onClick={() => setViewOrientation("front")}
            className={`min-h-[34px] px-3 text-xs font-semibold rounded-lg transition-all ${
              viewOrientation === "front"
                ? "bg-card text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Anterior (Front)
          </button>
          <button
            type="button"
            onClick={() => setViewOrientation("back")}
            className={`min-h-[34px] px-3 text-xs font-semibold rounded-lg transition-all ${
              viewOrientation === "back"
                ? "bg-card text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Posterior (Back)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Precision Medical Vector Locator */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 rounded-xl bg-muted/20 border border-border/60 relative">
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-3 pb-2 border-b border-border/40">
            <span className="flex items-center gap-1.5 font-sans font-medium text-foreground">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {viewOrientation === "front" ? "Anterior Projection" : "Posterior Projection"}
            </span>
            <span className="text-[10px] text-muted-foreground/80">SCALE 1:100</span>
          </div>

          <svg
            viewBox="0 0 200 370"
            className="w-48 h-80 filter drop-shadow-xs select-none"
            aria-label="Interactive Clinical Anatomical Locator"
          >
            {/* Background Medical Coordinate Grid */}
            <g className="stroke-border/40" strokeWidth="0.5" strokeDasharray="2 3">
              <line x1="100" y1="10" x2="100" y2="360" />
              <line x1="20" y1="70" x2="180" y2="70" />
              <line x1="20" y1="140" x2="180" y2="140" />
              <line x1="20" y1="210" x2="180" y2="210" />
              <line x1="20" y1="280" x2="180" y2="280" />
            </g>

            {/* Surgical Silhouette (Clean, Neutral Anatomy Wireframe) */}
            <g className="fill-muted/40 stroke-border" strokeWidth="1.2">
              {/* Cranium */}
              <circle cx="100" cy="35" r="21" />
              {/* Cervical Spine / Neck */}
              <rect x="94" y="56" width="12" height="12" rx="2" />
              {/* Thorax & Trunk */}
              <path d="M 68 68 L 132 68 L 124 195 L 76 195 Z" />
              {/* Pelvic girdle */}
              <path d="M 76 195 L 124 195 L 116 226 L 84 226 Z" />
              {/* Left Upper Extremity */}
              <path d="M 68 70 L 50 145 L 42 205 L 50 208 L 60 152 L 72 82 Z" />
              {/* Right Upper Extremity */}
              <path d="M 132 70 L 150 145 L 158 205 L 150 208 L 140 152 L 128 82 Z" />
              {/* Left Lower Extremity */}
              <path d="M 84 226 L 74 300 L 70 355 L 82 358 L 92 300 L 96 226 Z" />
              {/* Right Lower Extremity */}
              <path d="M 116 226 L 126 300 L 130 355 L 118 358 L 108 300 L 104 226 Z" />
            </g>

            {/* Clickable Overlay Hotspots */}
            {ANATOMICAL_ZONES.filter(
              (z) => z.view === "both" || z.view === viewOrientation
            ).map((zone) => {
              const isSelected = selectedZoneId === zone.id;
              const { x, y, r, w, h } = zone.svgPathCoords;

              return (
                <g
                  key={zone.id}
                  onClick={() => onSelectZone(zone)}
                  className="cursor-pointer group transition-all"
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${zone.name}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectZone(zone);
                    }
                  }}
                >
                  {r ? (
                    <circle
                      cx={x}
                      cy={y}
                      r={r}
                      className={`transition-all ${
                        isSelected
                          ? "fill-primary/30 stroke-primary stroke-2 ring-2"
                          : "fill-primary/5 hover:fill-primary/15 stroke-primary/30 group-hover:stroke-primary stroke-1"
                      }`}
                    />
                  ) : (
                    <rect
                      x={x - (w || 20) / 2}
                      y={y}
                      width={w || 20}
                      height={h || 20}
                      rx={6}
                      className={`transition-all ${
                        isSelected
                          ? "fill-primary/30 stroke-primary stroke-2 ring-2"
                          : "fill-primary/5 hover:fill-primary/15 stroke-primary/30 group-hover:stroke-primary stroke-1"
                      }`}
                    />
                  )}

                  {/* Clean Crosshair Point Marker */}
                  <circle
                    cx={x}
                    cy={r ? y : y + (h || 20) / 2}
                    r={isSelected ? 4 : 2.5}
                    className={`transition-all ${
                      isSelected ? "fill-primary" : "fill-primary/70 group-hover:fill-primary"
                    }`}
                  />
                </g>
              );
            })}
          </svg>

          <span className="text-[10px] text-muted-foreground mt-3 font-mono">
            CLICK ON ANY ANATOMICAL ZONE TO TARGET
          </span>
        </div>

        {/* Zone Details & High-Yield Symptoms */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {renderZoneIcon(currentZone.iconName, "w-4 h-4")}
                </div>
                <div>
                  <h5 className="text-sm font-bold text-foreground">
                    {currentZone.name}
                  </h5>
                  <span className="text-xs text-muted-foreground block">
                    {currentZone.subTitle}
                  </span>
                </div>
              </div>

              <Badge variant="outline" className="text-[11px] font-mono border-border">
                {currentZone.commonSymptoms.filter((s) => selectedSymptoms.includes(s)).length} Active
              </Badge>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                High-Yield Diagnostic Symptoms
              </span>
              <span className="text-[11px]">Tap to incorporate into clinical record</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentZone.commonSymptoms.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);

                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => onToggleSymptom(symptom)}
                    className={`min-h-[44px] p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground font-semibold shadow-xs ring-1 ring-primary/40"
                        : "border-border hover:border-primary/50 hover:bg-muted/40 text-foreground/90"
                    }`}
                  >
                    <span className="leading-snug flex-1">{symptom}</span>
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-xs transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-muted-foreground bg-background"
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
