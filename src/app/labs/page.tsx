'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  Check,
  FileText,
  User,
  RotateCcw,
  Sparkles,
  Stethoscope,
  Info,
  ArrowRight,
  ShieldAlert,
  FileDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { interpretBloodWork, LabItem, BloodWorkOutput } from '@/ai/flows/blood-work-flow';
import { saveLabToHistory } from '@/lib/assessment-store';
import { exportLabReportPDF } from '@/lib/pdf-export';

// Standard Clinical Presets for Instant 1-Click Evaluation
const LAB_PRESETS = [
  {
    name: 'Normal Routine Screen',
    panelType: 'Complete Blood Count & Basic Chem',
    description: 'Healthy adult baseline laboratory panel.',
    values: [
      { parameter: 'Hemoglobin', value: '14.2', unit: 'g/dL', referenceRange: '13.5 - 17.5 g/dL' },
      { parameter: 'White Blood Cells (WBC)', value: '6.8', unit: '10^3/uL', referenceRange: '4.0 - 11.0 10^3/uL' },
      { parameter: 'Platelets', value: '240', unit: '10^3/uL', referenceRange: '150 - 450 10^3/uL' },
      { parameter: 'Fasting Glucose', value: '88', unit: 'mg/dL', referenceRange: '70 - 99 mg/dL' },
      { parameter: 'Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.7 - 1.3 mg/dL' },
      { parameter: 'Potassium', value: '4.2', unit: 'mmol/L', referenceRange: '3.5 - 5.1 mmol/L' },
    ],
  },
  {
    name: 'Anemia & Iron Deficit',
    panelType: 'Complete Blood Count (CBC)',
    description: 'Patient presenting with exertional pallor and chronic fatigue.',
    values: [
      { parameter: 'Hemoglobin', value: '9.4', unit: 'g/dL', referenceRange: '12.0 - 16.0 g/dL' },
      { parameter: 'Hematocrit', value: '29.5', unit: '%', referenceRange: '37.0 - 48.0 %' },
      { parameter: 'MCV', value: '72.0', unit: 'fL', referenceRange: '80.0 - 100.0 fL' },
      { parameter: 'Platelets', value: '410', unit: '10^3/uL', referenceRange: '150 - 450 10^3/uL' },
      { parameter: 'Serum Ferritin', value: '9', unit: 'ng/mL', referenceRange: '15 - 150 ng/mL' },
    ],
  },
  {
    name: 'Acute Bacterial Infection',
    panelType: 'CBC & Inflammatory Markers',
    description: 'Patient presenting with high fever, chills, and productive cough.',
    values: [
      { parameter: 'White Blood Cells (WBC)', value: '16.8', unit: '10^3/uL', referenceRange: '4.0 - 11.0 10^3/uL' },
      { parameter: 'Neutrophils', value: '86', unit: '%', referenceRange: '40 - 70 %' },
      { parameter: 'C-Reactive Protein (CRP)', value: '64.5', unit: 'mg/L', referenceRange: '< 3.0 mg/L' },
      { parameter: 'Hemoglobin', value: '13.1', unit: 'g/dL', referenceRange: '12.0 - 16.0 g/dL' },
    ],
  },
  {
    name: 'Cardiac Emergency Screen',
    panelType: 'Cardiac Biomarkers & Electrolytes',
    description: 'Patient with acute substernal chest discomfort.',
    values: [
      { parameter: 'High-Sensitivity Troponin I', value: '0.48', unit: 'ng/mL', referenceRange: '< 0.04 ng/mL' },
      { parameter: 'Creatine Kinase-MB', value: '28', unit: 'ng/mL', referenceRange: '< 5.0 ng/mL' },
      { parameter: 'Potassium', value: '5.8', unit: 'mmol/L', referenceRange: '3.5 - 5.1 mmol/L' },
      { parameter: 'Creatinine', value: '1.4', unit: 'mg/dL', referenceRange: '0.7 - 1.3 mg/dL' },
    ],
  },
];

export default function BloodWorkPage() {
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [panelType, setPanelType] = useState('Complete Blood Count (CBC)');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const [labItems, setLabItems] = useState<LabItem[]>([
    { parameter: 'Hemoglobin', value: '11.2', unit: 'g/dL', referenceRange: '12.0 - 16.0 g/dL' },
    { parameter: 'White Blood Cells (WBC)', value: '7.4', unit: '10^3/uL', referenceRange: '4.0 - 11.0 10^3/uL' },
    { parameter: 'Platelets', value: '230', unit: '10^3/uL', referenceRange: '150 - 450 10^3/uL' },
    { parameter: 'Fasting Glucose', value: '118', unit: 'mg/dL', referenceRange: '70 - 99 mg/dL' },
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<BloodWorkOutput | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [audienceView, setAudienceView] = useState<'patient' | 'clinical'>('patient');

  const handleExportPdf = async () => {
    if (!result) return;
    setIsExportingPdf(true);
    try {
      await exportLabReportPDF(result, patientName || 'Patient', age || 'N/A', panelType);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Add parameter
  const handleAddParameter = () => {
    setLabItems((prev) => [
      ...prev,
      { parameter: '', value: '', unit: '', referenceRange: '' },
    ]);
  };

  // Remove parameter
  const handleRemoveParameter = (index: number) => {
    setLabItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update parameter
  const handleUpdateParameter = (index: number, field: keyof LabItem, val: string) => {
    setLabItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  // Load Preset
  const handleLoadPreset = (preset: typeof LAB_PRESETS[0]) => {
    setPanelType(preset.panelType);
    setLabItems(preset.values);
    setClinicalNotes(preset.description);
    setResult(null);
  };

  // Run Analysis
  const handleRunAnalysis = async () => {
    const validItems = labItems.filter((i) => i.parameter.trim() && i.value.trim());
    if (validItems.length === 0) {
      alert('Please enter at least one laboratory test parameter and value.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const output = await interpretBloodWork({
        patientName: patientName || 'Patient',
        age: age || undefined,
        gender: gender || undefined,
        panelType,
        labValues: validItems,
        clinicalSymptoms: clinicalNotes || undefined,
      });

      setResult(output);
      saveLabToHistory(output, patientName || 'Patient', age || 'N/A', panelType);
    } catch (err: any) {
      console.error('Blood work evaluation failed:', err);
      alert('Unable to analyze blood work right now. Please check values and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyResults = () => {
    if (!result) return;
    const text = `=== MANOMED AI LABORATORY INTERPRETATION ===
PATIENT: ${patientName || 'Anonymous'} | AGE: ${age || 'N/A'} | SEX: ${gender}
PANEL: ${panelType}
STATUS: ${result.overallStatus} (${result.triageUrgency})

[SUMMARY]
${result.plainLanguageSummary}

[PHYSICIAN CLINICAL SYNTHESIS]
${result.clinicalPhysicianSynthesis}

[DIFFERENTIAL DIAGNOSES]
${result.differentialDiagnoses.map((d) => `- ${d.condition}: ${Math.round(d.likelihood * 100)}% (${d.rationale})`).join('\n')}

[TEST PARAMETERS]
${result.analyzedParameters.map((p) => `- ${p.name}: ${p.value} ${p.unit} [${p.flag}] (Ref: ${p.referenceRange})`).join('\n')}
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
            <span className="font-semibold text-foreground">Blood Work & Laboratory Interpreter</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Evidence-Calibrated Reference Ranges</span>
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
            <FlaskConical className="w-4 h-4" />
            Diagnostic Pathology & Hematology Suite
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Blood Work & Lab Test Interpreter
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Enter numerical lab values or select a clinical preset panel. Our system flags out-of-range deviations, formulates differential diagnoses, and provides dual-perspective reporting: simple explanations for patients and senior family members, plus standard medical synthesis for physicians.
          </p>
        </div>

        {/* Presets Quick Picker */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Quick Clinical Test Presets (Click to load)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {LAB_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleLoadPreset(preset)}
                className="text-left p-3.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted/40 transition-all space-y-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>{preset.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-1">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Patient Demographics & Context */}
        <Card className="clinical-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <User className="w-4 h-4 text-primary" />
              Patient Profile & Panel Type
            </CardTitle>
            <CardDescription className="text-xs">
              Values are automatically calibrated against age and biological sex reference intervals.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="patientName" className="text-xs font-semibold">Patient Name (Optional)</Label>
              <Input
                id="patientName"
                placeholder="e.g. Eleanor Vance"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="text-xs h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="age" className="text-xs font-semibold">Age (Years)</Label>
              <Input
                id="age"
                type="number"
                placeholder="e.g. 62"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="text-xs h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gender" className="text-xs font-semibold">Biological Sex</Label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full text-xs h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other / Non-disclosed</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="panelType" className="text-xs font-semibold">Lab Panel Category</Label>
              <Input
                id="panelType"
                placeholder="e.g. Complete Blood Count (CBC)"
                value={panelType}
                onChange={(e) => setPanelType(e.target.value)}
                className="text-xs h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Laboratory Parameters Input Table */}
        <Card className="clinical-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <FlaskConical className="w-4 h-4 text-primary" />
                Laboratory Test Values
              </CardTitle>
              <CardDescription className="text-xs">
                Enter your lab report numbers. Leave reference range blank to use our automated clinical standards.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddParameter}
              className="text-xs h-9 flex items-center gap-1.5 border-border"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              Add Test Line
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2.5">
              <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-semibold text-muted-foreground px-1 pb-1 border-b border-border/60">
                <span className="col-span-4">Test Name / Analyte</span>
                <span className="col-span-2">Result Value</span>
                <span className="col-span-2">Unit</span>
                <span className="col-span-3">Reference Interval</span>
                <span className="col-span-1 text-center">Action</span>
              </div>

              {labItems.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center p-2 rounded-xl bg-card border border-border/80"
                >
                  <div className="sm:col-span-4">
                    <Input
                      placeholder="e.g. Hemoglobin, WBC, Glucose"
                      value={item.parameter}
                      onChange={(e) => handleUpdateParameter(idx, 'parameter', e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="e.g. 12.4"
                      value={item.value}
                      onChange={(e) => handleUpdateParameter(idx, 'value', e.target.value)}
                      className="text-xs h-9 font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="e.g. g/dL, mg/dL"
                      value={item.unit}
                      onChange={(e) => handleUpdateParameter(idx, 'unit', e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Input
                      placeholder="e.g. 12.0 - 16.0"
                      value={item.referenceRange || ''}
                      onChange={(e) => handleUpdateParameter(idx, 'referenceRange', e.target.value)}
                      className="text-xs h-9 font-mono text-muted-foreground"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveParameter(idx)}
                      disabled={labItems.length === 1}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      aria-label="Delete test line"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 pt-2">
              <Label htmlFor="clinicalNotes" className="text-xs font-semibold text-muted-foreground">
                Concurrent Patient Symptoms or Physical Context (Optional)
              </Label>
              <Textarea
                id="clinicalNotes"
                placeholder="e.g. Patient feels weak and lightheaded when standing up; reports dark colored stools for 3 days."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Reference ranges automatically adapt for age and biological sex where applicable.</span>
              </div>

              <Button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="w-full sm:w-auto h-11 px-8 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-none transition-all flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Analyzing Biological Markers...
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-4 h-4" />
                    Interpret Laboratory Panel
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 pt-4 animate-in fade-in duration-300">
            {/* Urgency Status Banner */}
            <div
              className={`p-6 rounded-2xl border text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                result.overallStatus === 'CRITICAL_ALERT'
                  ? 'bg-destructive/10 border-destructive text-destructive'
                  : result.overallStatus === 'ELEVATED_RISK'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                {result.overallStatus === 'CRITICAL_ALERT' ? (
                  <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5 sm:mt-0 animate-pulse text-destructive" />
                ) : result.overallStatus === 'ELEVATED_RISK' ? (
                  <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5 sm:mt-0 text-amber-500" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 sm:mt-0 text-emerald-600" />
                )}
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    {result.overallStatus === 'CRITICAL_ALERT'
                      ? 'Critical Laboratory Alert: Urgent Clinical Attention Advised'
                      : result.overallStatus === 'ELEVATED_RISK'
                      ? 'Elevated Diagnostic Findings: Outpatient Follow-Up Recommended'
                      : 'All Analyzed Biomarkers Within Healthy Target Intervals'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Triage Urgency: <strong className="text-foreground">{result.triageUrgency}</strong> • Tested ID: {result.id}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyResults}
                  className="text-xs h-9 flex items-center gap-1.5 border-border bg-card shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Report'}</span>
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

            {/* Critical Alerts Callout if any */}
            {result.criticalAlerts && result.criticalAlerts.length > 0 && (
              <div className="p-4 rounded-xl bg-destructive/15 border border-destructive/40 text-destructive text-xs space-y-1.5">
                <div className="font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  IMMEDIATE ACTION ITEMS IDENTIFIED:
                </div>
                <ul className="list-disc list-inside space-y-0.5 font-medium">
                  {result.criticalAlerts.map((alert, i) => (
                    <li key={i}>{alert}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Audience Perspective Switcher (Doctor vs Granny) */}
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Audience Perspective View:
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
                  🩺 Clinical Physician Detail
                </button>
              </div>
            </div>

            {/* View Mode: Patient / Senior Citizen Friendly */}
            {audienceView === 'patient' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <Card className="clinical-card border-primary/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                      <span className="text-xl">👵</span> What These Blood Test Numbers Mean For You
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Written in everyday language to help you understand your health without confusion.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm sm:text-base text-foreground leading-relaxed font-normal bg-card p-4 rounded-xl border border-border">
                      {result.plainLanguageSummary}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Practical Daily Guidance */}
                      <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
                        <h4 className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Helpful Steps You Can Take Today
                        </h4>
                        <ul className="space-y-1.5 text-muted-foreground">
                          {result.lifestyleAndDietaryGuidance.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Questions to Ask Doctor */}
                      <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
                        <h4 className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                          <FileText className="w-4 h-4 text-primary" />
                          Good Questions To Ask Your Doctor
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

            {/* View Mode: Clinical Physician / MD / RN */}
            {audienceView === 'clinical' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Physician Synthesis Note */}
                <Card className="clinical-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                      <Stethoscope className="w-4 h-4 text-primary" />
                      Clinical Pathophysiological Synthesis
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Formal laboratory interpretation note for electronic health records.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs leading-relaxed text-foreground">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border font-mono text-[12px] whitespace-pre-wrap">
                      {result.clinicalPhysicianSynthesis}
                    </div>

                    {/* Differential Diagnoses */}
                    <div className="space-y-2 pt-2">
                      <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                        Suggested Laboratory Differential Diagnoses
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
                            {diff.icd10Hint && (
                              <div className="text-[10px] font-mono text-primary font-bold">
                                ICD-10: {diff.icd10Hint}
                              </div>
                            )}
                            <p className="text-[11px] text-muted-foreground leading-normal">{diff.rationale}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Detailed Parameters Analysis Table (Visible in both views) */}
            <Card className="clinical-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Analyzed Laboratory Values & Reference Intervals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-semibold">
                        <th className="py-2.5 px-3">Parameter</th>
                        <th className="py-2.5 px-3">Patient Value</th>
                        <th className="py-2.5 px-3">Reference Range</th>
                        <th className="py-2.5 px-3">Flag Status</th>
                        <th className="py-2.5 px-3">Clinical Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {result.analyzedParameters.map((param, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-3 font-semibold text-foreground">{param.name}</td>
                          <td className="py-3 px-3 font-mono font-bold text-foreground">
                            {param.value} {param.unit}
                          </td>
                          <td className="py-3 px-3 font-mono text-muted-foreground">{param.referenceRange}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                param.flag === 'CRITICAL_HIGH' || param.flag === 'CRITICAL_LOW'
                                  ? 'bg-destructive/20 text-destructive border border-destructive/30'
                                  : param.flag === 'HIGH' || param.flag === 'LOW'
                                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {param.flag.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-muted-foreground text-[11px] leading-relaxed max-w-xs">
                            {param.interpretation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Actions */}
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
                Start New Lab Interpretation
              </Button>

              <Link href="/history" className="w-full sm:w-auto">
                <Button className="text-xs h-10 w-full sm:w-auto bg-primary text-primary-foreground font-semibold">
                  View in Patient Vault
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Emergency Medical Protocol Notice */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-foreground">Pathology Advisory:</strong> ManoMed AI laboratory interpretation assists in clinical pattern recognition and patient education. It does not supersede formal lab re-testing or physical medical consultation. In cases of critical lab values or severe acute distress, activate emergency services (911) or proceed to the nearest emergency department immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
