'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Scan,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sun,
  Contrast,
  RotateCcw,
  Stethoscope,
  FileText,
  Copy,
  Check,
  User,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Eye,
  Sliders,
  FileDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { interpretXRay, XRayAnalysisOutput } from '@/ai/flows/xray-analysis-flow';
import { saveXRayToHistory } from '@/lib/assessment-store';
import { exportXRayReportPDF } from '@/lib/pdf-export';

// Clinical Sample Radiographs with simulated high-fidelity specimen illustrations for instant testing
const SAMPLE_XRAYS = [
  {
    id: 'chest-normal',
    title: 'Normal Chest (PA View)',
    region: 'chest' as const,
    indication: 'Routine pre-operative clearance. No respiratory symptoms.',
    patientAge: '45',
    patientGender: 'Male',
    svgData: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="%23050508"/><path d="M150 120 C180 80, 280 80, 300 120 C320 80, 420 80, 450 120 C480 200, 470 420, 410 460 C380 480, 320 460, 300 450 C280 460, 220 480, 190 460 C130 420, 120 200, 150 120 Z" fill="%231a1a24" stroke="%233a3a4c" stroke-width="2"/><ellipse cx="230" cy="270" rx="65" ry="140" fill="%230f0f18" stroke="%232e2e40" stroke-width="1.5"/><ellipse cx="370" cy="270" rx="65" ry="140" fill="%230f0f18" stroke="%232e2e40" stroke-width="1.5"/><path d="M280 220 C270 300, 310 370, 340 370 C360 370, 370 320, 360 260 C350 220, 300 200, 280 220 Z" fill="%23303042" opacity="0.8"/><line x1="300" y1="80" x2="300" y2="480" stroke="%2348485e" stroke-width="6" stroke-dasharray="10 4"/><text x="20" y="40" fill="%236b7280" font-family="monospace" font-size="14">ManoMed PACS • Normal Chest PA • 120kV 4mAs</text></svg>`,
  },
  {
    id: 'chest-pneumonia',
    title: 'Right Lower Lobe Pneumonia',
    region: 'chest' as const,
    indication: '5-day productive cough, high fever 39°C, localized right basilar crackles.',
    patientAge: '68',
    patientGender: 'Female',
    svgData: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="%23050508"/><path d="M150 120 C180 80, 280 80, 300 120 C320 80, 420 80, 450 120 C480 200, 470 420, 410 460 C380 480, 320 460, 300 450 C280 460, 220 480, 190 460 C130 420, 120 200, 150 120 Z" fill="%231a1a24" stroke="%233a3a4c" stroke-width="2"/><ellipse cx="230" cy="270" rx="65" ry="140" fill="%230f0f18" stroke="%232e2e40" stroke-width="1.5"/><ellipse cx="370" cy="270" rx="65" ry="140" fill="%230f0f18" stroke="%232e2e40" stroke-width="1.5"/><circle cx="240" cy="360" r="50" fill="%23555570" opacity="0.75" filter="blur(8px)"/><line x1="300" y1="80" x2="300" y2="480" stroke="%2348485e" stroke-width="6" stroke-dasharray="10 4"/><text x="20" y="40" fill="%23ef4444" font-family="monospace" font-size="14">ManoMed PACS • Infiltrate RLL Detected</text></svg>`,
  },
  {
    id: 'ortho-wrist',
    title: 'Distal Radius Colles Fracture',
    region: 'musculoskeletal' as const,
    indication: 'Mechanical fall on outstretched hand. Severe pain and dorsal wrist deformity.',
    patientAge: '71',
    patientGender: 'Female',
    svgData: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="%23050508"/><rect x="220" y="100" width="70" height="240" rx="15" fill="%23404055" stroke="%2360607a" stroke-width="2"/><rect x="310" y="100" width="50" height="245" rx="10" fill="%2338384a" stroke="%2355556e" stroke-width="2"/><line x1="210" y1="310" x2="300" y2="330" stroke="%23ffffff" stroke-width="3" stroke-dasharray="4 2"/><circle cx="255" cy="320" r="30" fill="none" stroke="%23ef4444" stroke-width="2" stroke-dasharray="5 3"/><rect x="210" y="360" width="160" height="180" rx="20" fill="%23222230" stroke="%2344445c" stroke-width="2"/><text x="20" y="40" fill="%23f59e0b" font-family="monospace" font-size="14">ManoMed PACS • Distal Radius Cortical Breach</text></svg>`,
  },
];

export default function ImagingPage() {
  const [selectedRegion, setSelectedRegion] = useState<'chest' | 'musculoskeletal' | 'abdomen' | 'spine' | 'dental' | 'general'>('chest');
  const [patientAge, setPatientAge] = useState('65');
  const [patientGender, setPatientGender] = useState('Female');
  const [clinicalIndication, setClinicalIndication] = useState('Shortness of breath and fever for 4 days');
  const [imagePreview, setImagePreview] = useState<string>(SAMPLE_XRAYS[1].svgData);

  // PACS Viewer controls
  const [zoomLevel, setZoomLevel] = useState(1);
  const [invertFilm, setInvertFilm] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  // Workflow state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<XRayAnalysisOutput | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [audienceView, setAudienceView] = useState<'patient' | 'clinical'>('patient');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportPdf = async () => {
    if (!result) return;
    setIsExportingPdf(true);
    try {
      await exportXRayReportPDF(result, 'Patient', patientAge || 'N/A', selectedRegion);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Load sample preset
  const handleLoadSample = (sample: typeof SAMPLE_XRAYS[0]) => {
    setImagePreview(sample.svgData);
    setSelectedRegion(sample.region);
    setClinicalIndication(sample.indication);
    setPatientAge(sample.patientAge);
    setPatientGender(sample.patientGender);
    setResult(null);
  };

  // Run analysis
  const handleAnalyze = async () => {
    if (!imagePreview) {
      alert('Please upload an X-ray image or select one of the clinical sample specimens.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const output = await interpretXRay({
        imageBase64: imagePreview,
        anatomicalRegion: selectedRegion,
        patientAge: patientAge || undefined,
        patientGender: patientGender || undefined,
        clinicalIndication: clinicalIndication || undefined,
      });

      setResult(output);
      saveXRayToHistory(output, 'Patient', patientAge || 'N/A', selectedRegion);
    } catch (err: any) {
      console.error('X-ray evaluation failed:', err);
      alert('Unable to analyze radiograph at this moment. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyReport = () => {
    if (!result) return;
    const text = `=== MANOMED AI RADIOLOGY REPORT ===
EXAMINATION: ${result.examinationType}
REGION: ${selectedRegion.toUpperCase()}
DATE: ${new Date(result.timestamp).toLocaleString()}
URGENCY: ${result.urgency}

[IMPRESSION]
${result.radiologicalImpression}

[PATIENT PLAIN LANGUAGE SUMMARY]
${result.plainLanguageExplanation}

[ATTENDING CLINICIAN NOTES]
${result.clinicalPhysicianNotes}

[ANATOMICAL FINDINGS]
${result.anatomicalFindings.map((f) => `- ${f.structure}: ${f.observation} (${f.severity})`).join('\n')}

[DIFFERENTIAL DIAGNOSIS]
${result.differentialDiagnoses.map((d) => `- ${d.condition}: ${Math.round(d.likelihood * 100)}% (${d.rationale})`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Clinical Portal
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span className="font-semibold text-foreground">Medical Imaging & X-Ray Assistant</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Diagnostic Radiation Support System</span>
            </div>
            <Link href="/history">
              <Button variant="outline" size="sm" className="text-xs h-8">
                Records Vault
              </Button>
            </Link>
          </div>
        </div>

        {/* Section Header */}
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <Scan className="w-4 h-4" />
            Diagnostic Radiology & Medical Imaging Hub
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            X-Ray & Radiograph Analysis Assistant
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Upload plain radiographs or select clinical benchmark scans. Features an interactive PACS high-contrast film viewer, automated landmark detection (lungs, heart contour, bone cortical borders), and dual-perspective reporting for patients and clinicians.
          </p>
        </div>

        {/* Sample Scan Presets for Immediate Demo */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Clinical Sample Radiographs (Click to load specimen)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SAMPLE_XRAYS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleLoadSample(sample)}
                className="text-left p-3.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted/40 transition-all space-y-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>{sample.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-1">{sample.indication}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Workspace: Split Viewer & Clinical Parameters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive PACS Radiograph Viewer */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="clinical-card overflow-hidden">
              <CardHeader className="py-3 px-4 border-b border-border flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scan className="w-4 h-4 text-primary" />
                  <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                    Radiology Film Workstation
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setInvertFilm(!invertFilm)}
                    title="Invert Film (Negative / Positive)"
                    className="h-8 w-8 text-xs border-border"
                  >
                    <Eye className="w-3.5 h-3.5 text-primary" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                    title="Zoom In"
                    className="h-8 w-8 text-xs border-border"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                    title="Zoom Out"
                    className="h-8 w-8 text-xs border-border"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setZoomLevel(1);
                      setInvertFilm(false);
                      setBrightness(100);
                      setContrast(100);
                    }}
                    title="Reset Film Parameters"
                    className="h-8 w-8 text-xs border-border"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardHeader>

              {/* Film Display Canvas */}
              <CardContent className="p-0 bg-black relative min-h-[380px] max-h-[500px] flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <div
                    className="w-full h-full flex items-center justify-center transition-transform duration-200"
                    style={{
                      transform: `scale(${zoomLevel})`,
                      filter: `brightness(${brightness}%) contrast(${contrast}%) ${invertFilm ? 'invert(1)' : ''}`,
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Diagnostic Radiograph"
                      className="max-h-[460px] max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-center p-8 space-y-3">
                    <Scan className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="text-xs text-muted-foreground">No radiograph loaded. Upload an image or select a preset.</p>
                  </div>
                )}

                {/* DICOM PACS Overlay Markers */}
                <div className="absolute top-3 left-3 pointer-events-none text-[10px] font-mono text-white/70 space-y-0.5">
                  <div>MANOMED PACS v2.4</div>
                  <div>ZOOM: {Math.round(zoomLevel * 100)}%</div>
                  <div>FILM: {invertFilm ? 'INVERTED' : 'STANDARD'}</div>
                </div>

                <div className="absolute bottom-3 right-3 pointer-events-none text-[10px] font-mono text-white/70">
                  FOV: {selectedRegion.toUpperCase()}
                </div>
              </CardContent>

              {/* Adjustments Footer */}
              <div className="p-3 border-t border-border bg-card/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">Light:</span>
                    <input
                      type="range"
                      min="60"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-20 h-1 bg-muted rounded-lg accent-primary"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Contrast className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">Contrast:</span>
                    <input
                      type="range"
                      min="60"
                      max="160"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-20 h-1 bg-muted rounded-lg accent-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs h-8 flex items-center gap-1.5 border-border"
                  >
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    Upload My X-Ray
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Clinical Parameters & Trigger */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="clinical-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-primary" />
                  Clinical Context & Indication
                </CardTitle>
                <CardDescription className="text-xs">
                  Provide anatomical area and patient indications for higher diagnostic accuracy.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="regionSelect" className="text-xs font-semibold">Anatomical Region</Label>
                  <select
                    id="regionSelect"
                    value={selectedRegion}
                    onChange={(e: any) => setSelectedRegion(e.target.value)}
                    className="w-full text-xs h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="chest">Chest & Cardiopulmonary</option>
                    <option value="musculoskeletal">Musculoskeletal & Extremity</option>
                    <option value="abdomen">Abdomen Plain Film</option>
                    <option value="spine">Spine & Vertebral Column</option>
                    <option value="dental">Dental & Maxillofacial</option>
                    <option value="general">General / Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="xrayAge" className="text-xs font-semibold">Age</Label>
                    <Input
                      id="xrayAge"
                      type="number"
                      placeholder="e.g. 65"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="text-xs h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="xrayGender" className="text-xs font-semibold">Biological Sex</Label>
                    <select
                      id="xrayGender"
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full text-xs h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="clinicalIndication" className="text-xs font-semibold">
                    Clinical Symptoms / Trauma History
                  </Label>
                  <Textarea
                    id="clinicalIndication"
                    rows={3}
                    placeholder="e.g. Sudden severe left sided chest pain after coughing; or post-fall wrist pain."
                    value={clinicalIndication}
                    onChange={(e) => setClinicalIndication(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full h-11 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-none transition-all flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      Scanning Radiograph Landmarks...
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4" />
                      Interpret Radiograph (AI Vision)
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Presentation */}
        {result && (
          <div className="space-y-6 pt-4 animate-in fade-in duration-300">
            {/* Urgency Status Banner */}
            <div
              className={`p-6 rounded-2xl border text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                result.urgency === 'EMERGENCY'
                  ? 'bg-destructive/10 border-destructive text-destructive'
                  : result.urgency === 'URGENT'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                {result.urgency === 'EMERGENCY' ? (
                  <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5 sm:mt-0 animate-pulse text-destructive" />
                ) : result.urgency === 'URGENT' ? (
                  <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5 sm:mt-0 text-amber-500" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 sm:mt-0 text-emerald-600" />
                )}
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    {result.urgency === 'EMERGENCY'
                      ? 'Critical Radiological Alert: Immediate Intervention Required'
                      : result.urgency === 'URGENT'
                      ? 'Abnormal Findings Detected: Clinical Medical Consultation Advised'
                      : 'No Acute Radiographic Abnormality Identified (Within Normal Limits)'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Study: <strong className="text-foreground">{result.examinationType}</strong> • ID: {result.id}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyReport}
                  className="text-xs h-9 flex items-center gap-1.5 border-border bg-card shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Radiology Report'}</span>
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="text-xs h-9 flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold shrink-0"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>{isExportingPdf ? 'Generating PDF...' : 'Export Clinical PDF'}</span>
                </Button>
              </div>
            </div>

            {/* Audience Perspective Switcher */}
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Radiology Explanation Perspective:
              </span>
              <div className="inline-flex p-1 rounded-xl bg-muted border border-border text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAudienceView('patient')}
                  className={`px-4 py-1.5 rounded-lg transition-all ${
                    audienceView === 'patient'
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  👵 Simple Patient Summary
                </button>
                <button
                  type="button"
                  onClick={() => setAudienceView('clinical')}
                  className={`px-4 py-1.5 rounded-lg transition-all ${
                    audienceView === 'clinical'
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🩺 Clinical Radiology Report
                </button>
              </div>
            </div>

            {/* View Mode: Patient Friendly */}
            {audienceView === 'patient' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <Card className="clinical-card border-primary/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                      <span className="text-xl">👵</span> What Your X-Ray Shows (Plain English)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Clear, comforting explanation written without confusing hospital jargon.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm sm:text-base text-foreground leading-relaxed font-normal bg-card p-4 rounded-xl border border-border">
                      {result.plainLanguageExplanation}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
                        <h4 className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          What You Should Do Next
                        </h4>
                        <ul className="space-y-1.5 text-muted-foreground">
                          {result.recommendedNextSteps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
                        <h4 className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                          <FileText className="w-4 h-4 text-primary" />
                          Questions To Ask Your Healthcare Provider
                        </h4>
                        <ul className="space-y-1.5 text-muted-foreground">
                          {result.questionsForDoctor.map((q, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-primary font-bold">{idx + 1}.</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* View Mode: Clinical Radiology Report */}
            {audienceView === 'clinical' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <Card className="clinical-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                      <Stethoscope className="w-4 h-4 text-primary" />
                      Formal Diagnostic Radiology Impression & EHR Note
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Structured radiological documentation for medical charts and PACS systems.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border font-mono text-xs space-y-2">
                      <div>
                        <strong className="text-foreground">IMPRESSION:</strong> {result.radiologicalImpression}
                      </div>
                      <div className="pt-2 border-t border-border/60">
                        <strong className="text-foreground">CLINICAL PHYSICIAN RECOMMENDATIONS:</strong>{' '}
                        {result.clinicalPhysicianNotes}
                      </div>
                    </div>

                    {/* Differential Diagnoses */}
                    <div className="space-y-2 pt-1">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">
                        Ranked Radiological Differential Diagnoses
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {result.differentialDiagnoses.map((diff, i) => (
                          <div key={i} className="p-3 rounded-xl border border-border bg-card space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-foreground">{diff.condition}</span>
                              <Badge variant="outline" className="text-[10px] font-mono">
                                {Math.round(diff.likelihood * 100)}% Match
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-normal">{diff.rationale}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Anatomical Findings Breakdown (Visible in both views) */}
            <Card className="clinical-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Scan className="w-4 h-4 text-primary" />
                  Detailed Anatomical Landmark Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border/60">
                  {result.anatomicalFindings.map((finding, idx) => (
                    <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-xs text-foreground flex items-center gap-2">
                          <span>{finding.structure}</span>
                          {finding.abnormalityDetected ? (
                            <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                              {finding.severity} Abnormality
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-emerald-600 border-emerald-500/30">
                              Normal
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{finding.observation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bottom Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-xs h-10 w-full sm:w-auto border-border"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Analyze Another Image
              </Button>

              <Link href="/history" className="w-full sm:w-auto">
                <Button className="text-xs h-10 w-full sm:w-auto bg-primary text-primary-foreground font-semibold">
                  View Patient History Vault
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Safety Disclaimer */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-foreground">Radiology Advisory:</strong> ManoMed AI radiograph analysis is an investigative computer-aided decision support instrument and not a definitive diagnostic device. All imaging findings must be correlated with clinical examination and verified by a licensed radiologist or attending physician.
          </p>
        </div>
      </div>
    </div>
  );
}
