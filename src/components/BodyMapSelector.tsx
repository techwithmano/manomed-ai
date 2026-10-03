"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HeartPulse,
  Brain,
  Stethoscope,
  Activity,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";

export interface AnatomicalZone {
  id: string;
  name: string;
  subTitle: string;
  icon: string;
  view: "front" | "back" | "both";
  svgPathCoords: { x: number; y: number; r?: number; w?: number; h?: number };
  commonSymptoms: string[];
}

export const ANATOMICAL_ZONES: AnatomicalZone[] = [
  {
    id: "head",
    name: "Head, Brain & Sensory",
    subTitle: "Cranial, Ophthalmic & Neurological",
    icon: "🧠",
    view: "front",
    svgPathCoords: { x: 100, y: 35, r: 24 },
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
    icon: "🫀",
    view: "front",
    svgPathCoords: { x: 100, y: 100, w: 46, h: 42 },
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
    name: "Abdomen & Digestive",
    subTitle: "Gastrointestinal & Hepatic",
    icon: "🩺",
    view: "front",
    svgPathCoords: { x: 100, y: 155, w: 40, h: 45 },
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
    name: "Pelvis & Urinary",
    subTitle: "Genitourinary & Lower Abdominal",
    icon: "🚻",
    view: "front",
    svgPathCoords: { x: 100, y: 205, w: 44, h: 28 },
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
    icon: "🦴",
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
    icon: "💪",
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
    icon: "🦵",
    view: "both",
    svgPathCoords: { x: 85, y: 260, w: 30, h: 90 },
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
    icon: "🩹",
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
    <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div>
          <h4 className="font-bold text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Interactive Anatomical Locator
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click on any anatomical region to isolate corresponding clinical symptoms.
          </p>
        </div>

        {/* Front / Back Perspective Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 self-start sm:self-auto">
          <Button
            type="button"
            variant={viewOrientation === "front" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewOrientation("front")}
            className="h-7 px-3 text-xs font-semibold rounded-lg"
          >
            Anterior (Front)
          </Button>
          <Button
            type="button"
            variant={viewOrientation === "back" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewOrientation("back")}
            className="h-7 px-3 text-xs font-semibold rounded-lg"
          >
            Posterior (Back)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Interactive Stylized Anatomical SVG Model */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-muted/20 border border-border/50 relative">
          <div className="text-[11px] font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span>Interactive {viewOrientation === "front" ? "Anterior" : "Posterior"} Projection</span>
          </div>

          <svg
            viewBox="0 0 200 370"
            className="w-48 h-80 filter drop-shadow-sm select-none"
            aria-label="Interactive Human Body Anatomy"
          >
            {/* Base Body Silhouette */}
            <g className="fill-muted/70 stroke-border/80" strokeWidth="1.5">
              {/* Head */}
              <circle cx="100" cy="35" r="22" />
              {/* Neck */}
              <rect x="94" y="57" width="12" height="12" rx="3" />
              {/* Torso */}
              <path d="M 70 70 L 130 70 L 122 195 L 78 195 Z" />
              {/* Pelvis */}
              <path d="M 78 195 L 122 195 L 115 225 L 85 225 Z" />
              {/* Left Arm */}
              <path d="M 68 72 L 52 145 L 44 200 L 52 205 L 62 150 L 72 85 Z" />
              {/* Right Arm */}
              <path d="M 132 72 L 148 145 L 156 200 L 148 205 L 138 150 L 128 85 Z" />
              {/* Left Leg */}
              <path d="M 85 225 L 75 300 L 72 355 L 84 358 L 94 300 L 98 225 Z" />
              {/* Right Leg */}
              <path d="M 115 225 L 125 300 L 128 355 L 116 358 L 106 300 L 102 225 Z" />
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
                  className="cursor-pointer transition-all group"
                >
                  {r ? (
                    <circle
                      cx={x}
                      cy={y}
                      r={r}
                      className={`transition-all ${
                        isSelected
                          ? "fill-primary/45 stroke-primary stroke-2"
                          : "fill-blue-500/10 hover:fill-primary/25 stroke-blue-500/40 stroke-1"
                      }`}
                    />
                  ) : (
                    <rect
                      x={x - (w || 20) / 2}
                      y={y}
                      width={w || 20}
                      height={h || 20}
                      rx={8}
                      className={`transition-all ${
                        isSelected
                          ? "fill-primary/45 stroke-primary stroke-2"
                          : "fill-blue-500/10 hover:fill-primary/25 stroke-blue-500/40 stroke-1"
                      }`}
                    />
                  )}
                  {/* Subtle label icon in center */}
                  <text
                    x={x}
                    y={r ? y + 4 : y + (h || 20) / 2 + 4}
                    textAnchor="middle"
                    className="text-[10px] pointer-events-none fill-foreground/75 font-bold"
                  >
                    {zone.icon}
                  </text>
                </g>
              );
            })}
          </svg>

          <span className="text-[10px] text-muted-foreground/80 mt-1">
            Tap on any glowing body zone above
          </span>
        </div>

        {/* Zone Details & Symptoms List */}
        <div className="md:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="text-2xl">{currentZone.icon}</span>
                {currentZone.name}
              </span>
              <Badge variant="outline" className="text-xs bg-background">
                {currentZone.subTitle}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Select specific symptoms observed in this anatomical area to incorporate into the clinical evaluation:
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
              <span>High-Yield Symptoms for this Region</span>
              <span className="text-[11px] text-primary">
                {currentZone.commonSymptoms.filter((s) => selectedSymptoms.includes(s)).length} Selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentZone.commonSymptoms.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);

                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => onToggleSymptom(symptom)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? "border-primary bg-primary/15 text-primary font-bold shadow-sm ring-1 ring-primary/40"
                        : "border-border hover:border-primary/50 hover:bg-muted/40 text-foreground"
                    }`}
                  >
                    <span className="leading-snug">{symptom}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[10px] ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-muted-foreground/50"
                      }`}
                    >
                      {isSelected ? "✓" : "+"}
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
