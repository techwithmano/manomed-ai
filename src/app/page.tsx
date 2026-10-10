"use client";

import React from "react";
import Link from "next/link";
import { FaHeartbeat } from "react-icons/fa";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language-context";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 1. EDITORIAL ASYMMETRIC HERO & DIRECT CLINICAL LAUNCHER */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column (7 cols): Editorial Narrative & Clinical Authority */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>Clinical Decision Support System</span>
              <span>•</span>
              <span>Version 2.4</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-[1.12]">
              {t.heroTitle}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl font-normal">
              {t.heroSubtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link href="/ManoMedai">
                <Button
                  size="default"
                  className="h-10 px-5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded shadow-none transition-colors flex items-center gap-2"
                >
                  <span>{t.btnStartTriage}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </Button>
              </Link>

              <Link
                href="/station"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-blue-600 transition-colors h-10 px-2"
              >
                <span>{t.btnOpenStation}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Real Telemetry Benchmarks */}
            <div className="pt-8 border-t border-border grid grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-[10px] uppercase text-muted-foreground block mb-0.5">Latency</span>
                <span className="font-semibold text-foreground">~1.0s Groq LPU</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-muted-foreground block mb-0.5">Classification</span>
                <span className="font-semibold text-foreground">ICD-10 & SOAP</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-muted-foreground block mb-0.5">Encryption</span>
                <span className="font-semibold text-foreground">Client Vault</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Direct Clinical Jump-board */}
          <div className="lg:col-span-5 border border-border bg-card p-6 rounded space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                Direct Entry
              </span>
              <h2 className="text-base font-semibold text-foreground">
                Clinical Assessment Modalities
              </h2>
            </div>

            <div className="divide-y divide-border text-xs">
              {/* Modality 1 */}
              <Link
                href="/ManoMedai"
                className="py-3.5 flex items-center justify-between group hover:text-blue-600 transition-colors block"
              >
                <div className="space-y-0.5 pr-4 rtl:pr-0 rtl:pl-4">
                  <span className="font-semibold text-foreground group-hover:text-blue-600 block">
                    {t.pillarTriageTitle}
                  </span>
                  <span className="text-muted-foreground text-[11px] block">
                    Anatomical localization, Bayesian questions, red-flag triage
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all shrink-0" />
              </Link>

              {/* Modality 2 */}
              <Link
                href="/labs"
                className="py-3.5 flex items-center justify-between group hover:text-blue-600 transition-colors block"
              >
                <div className="space-y-0.5 pr-4 rtl:pr-0 rtl:pl-4">
                  <span className="font-semibold text-foreground group-hover:text-blue-600 block">
                    {t.pillarLabsTitle}
                  </span>
                  <span className="text-muted-foreground text-[11px] block">
                    CBC, CMP, Cardiac Troponin I/T, Lipid reference interpretation
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all shrink-0" />
              </Link>

              {/* Modality 3 */}
              <Link
                href="/imaging"
                className="py-3.5 flex items-center justify-between group hover:text-blue-600 transition-colors block"
              >
                <div className="space-y-0.5 pr-4 rtl:pr-0 rtl:pl-4">
                  <span className="font-semibold text-foreground group-hover:text-blue-600 block">
                    {t.pillarImagingTitle}
                  </span>
                  <span className="text-muted-foreground text-[11px] block">
                    PACS viewer with zoom, negative inversion, fracture detection
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all shrink-0" />
              </Link>

              {/* Modality 4 */}
              <Link
                href="/station"
                className="py-3.5 flex items-center justify-between group hover:text-blue-600 transition-colors block"
              >
                <div className="space-y-0.5 pr-4 rtl:pr-0 rtl:pl-4">
                  <span className="font-semibold text-foreground group-hover:text-blue-600 block">
                    Hospital Staff Triage Station
                  </span>
                  <span className="text-muted-foreground text-[11px] block">
                    Live ward queue, attending physician review, SOAP copy
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE CLINICAL WORKFLOWS: Editorial Structure (NO Repetitive Boxes) */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">
              Core Capabilities
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              {t.pillarsHeading}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              {t.pillarsSubheading}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border pt-4">
            {/* Capability 01 */}
            <div className="py-6 md:py-0 md:pr-8 rtl:md:pr-0 rtl:md:pl-8 space-y-3">
              <span className="font-mono text-xs text-blue-600 font-bold block">01 / Triage</span>
              <h3 className="text-base font-semibold text-foreground">
                {t.pillarTriageTitle}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.pillarTriageDesc}
              </p>
              <div className="pt-2">
                <Link
                  href="/ManoMedai"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  <span>Launch Triage Intake</span>
                  <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                </Link>
              </div>
            </div>

            {/* Capability 02 */}
            <div className="py-6 md:py-0 md:px-8 space-y-3">
              <span className="font-mono text-xs text-blue-600 font-bold block">02 / Pathology</span>
              <h3 className="text-base font-semibold text-foreground">
                {t.pillarLabsTitle}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.pillarLabsDesc}
              </p>
              <div className="pt-2">
                <Link
                  href="/labs"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  <span>Launch Lab Interpreter</span>
                  <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                </Link>
              </div>
            </div>

            {/* Capability 03 */}
            <div className="py-6 md:py-0 md:pl-8 rtl:md:pl-0 rtl:md:pr-8 space-y-3">
              <span className="font-mono text-xs text-blue-600 font-bold block">03 / Radiology</span>
              <h3 className="text-base font-semibold text-foreground">
                {t.pillarImagingTitle}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.pillarImagingDesc}
              </p>
              <div className="pt-2">
                <Link
                  href="/imaging"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  <span>Launch PACS Suite</span>
                  <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DUAL-AUDIENCE COMPARISON: Structured Translation Matrix */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-border bg-card/40">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">
              Clinical Synthesis
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              {t.dualHeading}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Every evaluation translates subjective patient symptoms into objective clinical documentation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Column 1: Patient Perspective */}
            <div className="border border-border bg-background p-6 rounded space-y-4">
              <div className="border-b border-border pb-3">
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                  Patient & Family Experience
                </span>
                <h3 className="text-base font-semibold text-foreground">
                  {t.patientViewTitle}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.patientViewDesc}
              </p>
              <div className="space-y-2.5 text-xs text-foreground/90 pt-1">
                <div className="flex items-start gap-2">
                  <span className="font-mono text-blue-600 font-bold">•</span>
                  <span>Jargon-free clinical descriptions with plain-English next steps</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-blue-600 font-bold">•</span>
                  <span>Curated list of 4–6 specific questions to ask your doctor at the visit</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-blue-600 font-bold">•</span>
                  <span>Safe non-pharmacological supportive home care and return precautions</span>
                </div>
              </div>
            </div>

            {/* Column 2: Physician Perspective */}
            <div className="border border-border bg-background p-6 rounded space-y-4">
              <div className="border-b border-border pb-3">
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                  Physician & Nursing Standards
                </span>
                <h3 className="text-base font-semibold text-foreground">
                  {t.doctorViewTitle}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.doctorViewDesc}
              </p>
              <div className="space-y-2.5 text-xs text-foreground/90 pt-1">
                <div className="flex items-start gap-2">
                  <span className="font-mono text-blue-600 font-bold">•</span>
                  <span>International ICD-10 diagnostic coding with Bayesian likelihood percentages</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-blue-600 font-bold">•</span>
                  <span>Standard 4-part EHR SOAP note (Subjective, Objective, Assessment, Plan) with 1-click copy</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-blue-600 font-bold">•</span>
                  <span>Institutional PDF export for laboratory pathology and diagnostic radiography</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EMERGENCY PROTOCOL & TRIAGE TIERS BAR */}
      <section className="py-12 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">
              Triage Protocol
            </span>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Emergency Severity Classification
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 border-l-2 border-l-red-600 border border-border bg-card rounded space-y-1">
              <span className="font-bold text-red-600 block">{t.tierEmergency}</span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Immediate intervention required. Severe chest discomfort, stroke signs, acute airway compromise.
              </p>
            </div>

            <div className="p-4 border-l-2 border-l-amber-600 border border-border bg-card rounded space-y-1">
              <span className="font-bold text-amber-600 block">{t.tierUrgent}</span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Review within 24–48 hours. Progressive abdominal guarding, acute pyrexia, suspected fractures.
              </p>
            </div>

            <div className="p-4 border-l-2 border-l-blue-600 border border-border bg-card rounded space-y-1">
              <span className="font-bold text-blue-600 block">{t.tierRoutine}</span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Scheduled outpatient clinic visit. Subacute localized pain, recurring cough, medication review.
              </p>
            </div>

            <div className="p-4 border-l-2 border-l-emerald-600 border border-border bg-card rounded space-y-1">
              <span className="font-bold text-emerald-600 block">{t.tierSelfCare}</span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Supportive home protocol. Hydration, physical rest, and structured red-flag return precautions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INSTITUTIONAL SAFETY NOTICE */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="p-4 border border-border bg-muted/30 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-muted-foreground">
          <p className="leading-relaxed max-w-3xl">
            {t.emergencyDisclaimer}
          </p>
          <a
            href="tel:911"
            className="text-xs font-mono font-bold text-red-600 hover:underline shrink-0"
          >
            DISPATCH 911 PROTOCOL
          </a>
        </div>
      </section>
    </div>
  );
}