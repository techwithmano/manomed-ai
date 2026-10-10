'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAssessmentHistory,
  SavedAssessmentSummary,
  deleteAssessmentFromHistory,
  saveCurrentAssessment,
  TriageLevel,
  getLabHistory,
  SavedLabSummary,
  deleteLabFromHistory,
  getXRayHistory,
  SavedXRaySummary,
  deleteXRayFromHistory,
} from '@/lib/assessment-store';
import { exportClinicalReportPDF, exportLabReportPDF, exportXRayReportPDF } from '@/lib/pdf-export';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  History,
  Calendar,
  User,
  ArrowRight,
  Trash2,
  PlusCircle,
  FileText,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Search,
  Download,
  Activity,
  AlertCircle,
  ChevronRight,
  FlaskConical,
  Scan,
  FileDown,
  Eye,
  Check,
} from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<SavedAssessmentSummary[]>([]);
  const [labs, setLabs] = useState<SavedLabSummary[]>([]);
  const [xrays, setXrays] = useState<SavedXRaySummary[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTriage, setSelectedTriage] = useState<'ALL' | TriageLevel>('ALL');
  const [exportingId, setExportingId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getAssessmentHistory());
    setLabs(getLabHistory());
    setXrays(getXRayHistory());
    setIsLoaded(true);
  }, []);

  const handleDeleteSymptom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this clinical assessment record?')) {
      deleteAssessmentFromHistory(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleDeleteLab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this laboratory report record?')) {
      deleteLabFromHistory(id);
      setLabs((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleDeleteXRay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this X-ray imaging record?')) {
      deleteXRayFromHistory(id);
      setXrays((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleOpenAssessment = (item: SavedAssessmentSummary) => {
    saveCurrentAssessment(item.fullData);
    router.push('/conditions');
  };

  const handleDownloadPDF = async (item: SavedAssessmentSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    setExportingId(item.id);
    try {
      await exportClinicalReportPDF(item.fullData);
    } finally {
      setExportingId(null);
    }
  };

  const [selectedLabModal, setSelectedLabModal] = useState<SavedLabSummary | null>(null);
  const [selectedXRayModal, setSelectedXRayModal] = useState<SavedXRaySummary | null>(null);
  const [modalViewMode, setModalViewMode] = useState<'patient' | 'clinical'>('patient');

  const handleDownloadLabPDF = async (lab: SavedLabSummary, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExportingId(lab.id);
    try {
      await exportLabReportPDF(lab.data, lab.patientName, lab.patientAge, lab.panelType);
    } finally {
      setExportingId(null);
    }
  };

  const handleDownloadXRayPDF = async (xray: SavedXRaySummary, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExportingId(xray.id);
    try {
      await exportXRayReportPDF(xray.data, xray.patientName, xray.patientAge, xray.region);
    } finally {
      setExportingId(null);
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const total = history.length;
    const emergency = history.filter((h) => h.triageLevel === 'EMERGENCY').length;
    const urgent = history.filter((h) => h.triageLevel === 'URGENT').length;
    const routine = history.filter((h) => h.triageLevel === 'ROUTINE' || h.triageLevel === 'SELF_CARE').length;
    return { total, emergency, urgent, routine };
  }, [history]);

  // Filtered Symptom results
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesTriage = selectedTriage === 'ALL' || item.triageLevel === selectedTriage;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.topCondition.toLowerCase().includes(q) ||
        item.primarySymptoms.toLowerCase().includes(q) ||
        (item.patientName && item.patientName.toLowerCase().includes(q));
      return matchesTriage && matchesSearch;
    });
  }, [history, selectedTriage, searchQuery]);

  // Filtered Labs
  const filteredLabs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return labs;
    return labs.filter(
      (l) =>
        l.panelType.toLowerCase().includes(q) ||
        (l.patientName && l.patientName.toLowerCase().includes(q)) ||
        l.overallStatus.toLowerCase().includes(q)
    );
  }, [labs, searchQuery]);

  // Filtered XRays
  const filteredXRays = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return xrays;
    return xrays.filter(
      (x) =>
        x.region.toLowerCase().includes(q) ||
        x.impression.toLowerCase().includes(q) ||
        (x.patientName && x.patientName.toLowerCase().includes(q))
    );
  }, [xrays, searchQuery]);

  const getTriageBadge = (level: string) => {
    switch (level) {
      case 'EMERGENCY':
        return <Badge variant="destructive" className="font-bold text-xs uppercase tracking-wider">Emergency</Badge>;
      case 'URGENT':
        return <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider">Urgent</Badge>;
      case 'ROUTINE':
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider">Routine</Badge>;
      default:
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider">Self-Care</Badge>;
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] bg-background">
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
          <Activity className="w-5 h-5 animate-spin text-primary" />
          Loading clinical assessment vault...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-background text-foreground">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pb-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-foreground transition-colors">
            Clinical Portal
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="font-semibold text-foreground">Audit Vault & Unified Longitudinal Records</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Client Encrypted Storage</span>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
              AUDIT TRAIL
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Clinical Assessment Records Vault
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-2xl leading-relaxed">
            Review past symptom triage sessions, blood work laboratory interpretations, and X-ray radiology evaluations stored securely on your local device.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/ManoMedai">
            <Button className="min-h-[44px] flex items-center gap-2 bg-primary text-primary-foreground font-semibold shadow-xs text-xs">
              <PlusCircle className="w-4 h-4" />
              New Triage
            </Button>
          </Link>
          <Link href="/labs">
            <Button variant="outline" className="min-h-[44px] flex items-center gap-2 text-xs font-semibold border-border">
              <FlaskConical className="w-4 h-4 text-primary" />
              New Lab Test
            </Button>
          </Link>
          <Link href="/imaging">
            <Button variant="outline" className="min-h-[44px] flex items-center gap-2 text-xs font-semibold border-border">
              <Scan className="w-4 h-4 text-primary" />
              New X-Ray
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Search records by condition, symptoms, test name, or patient name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-11 text-xs bg-background rounded-xl border-border"
        />
      </div>

      {/* Multi-Domain Records Tabs */}
      <Tabs defaultValue="symptoms" className="w-full space-y-6">
        <TabsList className="grid grid-cols-3 w-full h-auto p-1.5 bg-muted/60 rounded-2xl border border-border gap-1">
          <TabsTrigger
            value="symptoms"
            className="min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-xs flex items-center justify-center gap-2"
          >
            <Stethoscope className="w-3.5 h-3.5 text-primary" />
            <span>Symptom Triage ({history.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="labs"
            className="min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-xs flex items-center justify-center gap-2"
          >
            <FlaskConical className="w-3.5 h-3.5 text-primary" />
            <span>Blood Work & Labs ({labs.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="imaging"
            className="min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-xs flex items-center justify-center gap-2"
          >
            <Scan className="w-3.5 h-3.5 text-primary" />
            <span>X-Ray Imaging ({xrays.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: SYMPTOM TRIAGE */}
        <TabsContent value="symptoms" className="space-y-4">
          {history.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {(['ALL', 'EMERGENCY', 'URGENT', 'ROUTINE', 'SELF_CARE'] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTriage(tier)}
                  className={`min-h-[34px] px-3 rounded-lg text-xs font-semibold capitalize transition-all shrink-0 ${
                    selectedTriage === tier
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : 'text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {tier.replace('_', ' ').toLowerCase()}
                </button>
              ))}
            </div>
          )}

          {filteredHistory.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-border bg-card/40 rounded-2xl">
              <Stethoscope className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
              <h3 className="font-semibold text-base text-foreground">No symptom assessment records found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Complete a clinical intake to review differential likelihoods and export EHR SOAP notes.
              </p>
              <Link href="/ManoMedai" className="mt-4 inline-block">
                <Button size="sm" className="text-xs">Start Intake</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filteredHistory.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => handleOpenAssessment(item)}
                  className="clinical-card p-4 hover:border-primary/50 cursor-pointer transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getTriageBadge(item.triageLevel)}
                        <span className="font-bold text-sm text-foreground">{item.topCondition}</span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {Math.round(item.topLikelihood * 100)}% Match
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        &quot;{item.primarySymptoms}&quot;
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Patient: {item.patientName || 'Anonymous'} ({item.patientAge || 'N/A'}y)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleDownloadPDF(item, e)}
                        disabled={exportingId === item.id}
                        className="text-xs h-8"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        PDF
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteSymptom(item.id, e)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: BLOOD WORK & LABS */}
        <TabsContent value="labs" className="space-y-4">
          {filteredLabs.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-border bg-card/40 rounded-2xl">
              <FlaskConical className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
              <h3 className="font-semibold text-base text-foreground">No laboratory records found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Interpret Complete Blood Counts, Metabolic Panels, and cardiac biomarkers with automated reference range checks.
              </p>
              <Link href="/labs" className="mt-4 inline-block">
                <Button size="sm" className="text-xs">Interpret Lab Test</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filteredLabs.map((lab) => (
                <Card
                  key={lab.id}
                  onClick={() => {
                    setSelectedLabModal(lab);
                    setModalViewMode('patient');
                  }}
                  className="clinical-card p-4 space-y-2 hover:border-primary/50 cursor-pointer transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={lab.overallStatus === 'CRITICAL_ALERT' ? 'destructive' : 'outline'}
                          className="text-[10px] uppercase font-bold"
                        >
                          {lab.overallStatus.replace('_', ' ')}
                        </Badge>
                        <span className="font-bold text-sm text-foreground">{lab.panelType}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {lab.abnormalCount > 0 ? (
                          <span className="text-amber-500 font-semibold">{lab.abnormalCount} parameter(s) flagged out-of-range</span>
                        ) : (
                          <span className="text-emerald-500 font-semibold">All tested biological parameters normal</span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground pt-0.5">
                        {new Date(lab.date).toLocaleDateString()} • Patient: {lab.patientName} ({lab.patientAge}y)
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleDownloadLabPDF(lab, e)}
                        disabled={exportingId === lab.id}
                        className="text-xs h-8"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        PDF
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteLab(lab.id, e)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: X-RAY IMAGING */}
        <TabsContent value="imaging" className="space-y-4">
          {filteredXRays.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-border bg-card/40 rounded-2xl">
              <Scan className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
              <h3 className="font-semibold text-base text-foreground">No X-ray radiology records found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Examine radiographs with our interactive high-contrast PACS viewer and receive automated landmark observations.
              </p>
              <Link href="/imaging" className="mt-4 inline-block">
                <Button size="sm" className="text-xs">Analyze Radiograph</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filteredXRays.map((xray) => (
                <Card
                  key={xray.id}
                  onClick={() => {
                    setSelectedXRayModal(xray);
                    setModalViewMode('patient');
                  }}
                  className="clinical-card p-4 space-y-2 hover:border-primary/50 cursor-pointer transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={xray.urgency === 'EMERGENCY' ? 'destructive' : 'outline'}
                          className="text-[10px] uppercase font-bold"
                        >
                          {xray.urgency}
                        </Badge>
                        <span className="font-bold text-sm text-foreground">
                          {xray.region.toUpperCase()} Radiograph
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        &quot;{xray.impression}&quot;
                      </p>
                      <div className="text-[11px] text-muted-foreground pt-0.5">
                        {new Date(xray.date).toLocaleDateString()} • Patient: {xray.patientName} ({xray.patientAge}y)
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleDownloadXRayPDF(xray, e)}
                        disabled={exportingId === xray.id}
                        className="text-xs h-8"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        PDF
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteXRay(xray.id, e)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* MODAL 1: LAB REPORT DEEP INSPECTION */}
      {selectedLabModal && (
        <Dialog open={Boolean(selectedLabModal)} onOpenChange={(open) => !open && setSelectedLabModal(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3 pr-6">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-primary" />
                  {selectedLabModal.panelType}
                </DialogTitle>
                <Badge
                  variant={selectedLabModal.overallStatus === 'CRITICAL_ALERT' ? 'destructive' : 'outline'}
                  className="text-xs uppercase font-bold"
                >
                  {selectedLabModal.overallStatus.replace('_', ' ')}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Patient: {selectedLabModal.patientName} ({selectedLabModal.patientAge}y) • Date: {new Date(selectedLabModal.date).toLocaleDateString()} • ID: {selectedLabModal.id}
              </DialogDescription>
            </DialogHeader>

            {/* Dual Audience Perspective Switcher */}
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Perspective:</span>
              <div className="inline-flex p-1 rounded-xl bg-muted border border-border text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setModalViewMode('patient')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    modalViewMode === 'patient'
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  👵 Patient Summary
                </button>
                <button
                  type="button"
                  onClick={() => setModalViewMode('clinical')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    modalViewMode === 'clinical'
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🩺 Clinical Physician Detail
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 py-2 text-xs">
              {modalViewMode === 'patient' ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5">
                    <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      👵 What This Means
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedLabModal.data?.plainLanguageSummary || 'Laboratory parameters analyzed.'}
                    </p>
                  </div>

                  {selectedLabModal.data?.questionsForDoctor && (
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5">
                      <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-primary" /> Questions for Your Doctor
                      </span>
                      <ul className="space-y-1 text-muted-foreground">
                        {selectedLabModal.data.questionsForDoctor.map((q: string, i: number) => (
                          <li key={i}>• {q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5">
                    <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-primary" /> Physician Clinical Synthesis
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedLabModal.data?.clinicalPhysicianSynthesis || 'Routine evaluation.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Analyzed Parameters Table */}
              {selectedLabModal.data?.analyzedParameters && (
                <div className="border border-border rounded-xl overflow-hidden mt-2">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="p-2.5 font-bold">Parameter</th>
                        <th className="p-2.5 font-bold">Value</th>
                        <th className="p-2.5 font-bold">Reference Range</th>
                        <th className="p-2.5 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedLabModal.data.analyzedParameters.map((p: any, i: number) => (
                        <tr key={i} className="hover:bg-muted/20">
                          <td className="p-2.5 font-semibold text-foreground">{p.name}</td>
                          <td className="p-2.5 font-mono font-bold text-foreground">{p.value} {p.unit}</td>
                          <td className="p-2.5 text-muted-foreground">{p.referenceRange}</td>
                          <td className="p-2.5">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              p.flag === 'NORMAL'
                                ? 'bg-emerald-500/15 text-emerald-600'
                                : 'bg-amber-500/15 text-amber-600'
                            }`}>
                              {p.flag}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLabModal(null)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => handleDownloadLabPDF(selectedLabModal)}
                disabled={exportingId === selectedLabModal.id}
                className="text-xs bg-primary text-primary-foreground font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Official PDF Report</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL 2: X-RAY DEEP INSPECTION */}
      {selectedXRayModal && (
        <Dialog open={Boolean(selectedXRayModal)} onOpenChange={(open) => !open && setSelectedXRayModal(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3 pr-6">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Scan className="w-5 h-5 text-primary" />
                  {selectedXRayModal.region.toUpperCase()} Radiograph Report
                </DialogTitle>
                <Badge
                  variant={selectedXRayModal.urgency === 'EMERGENCY' ? 'destructive' : 'outline'}
                  className="text-xs uppercase font-bold"
                >
                  {selectedXRayModal.urgency}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Patient: {selectedXRayModal.patientName} ({selectedXRayModal.patientAge}y) • Date: {new Date(selectedXRayModal.date).toLocaleDateString()} • ID: {selectedXRayModal.id}
              </DialogDescription>
            </DialogHeader>

            {/* Dual Audience Perspective Switcher */}
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Perspective:</span>
              <div className="inline-flex p-1 rounded-xl bg-muted border border-border text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setModalViewMode('patient')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    modalViewMode === 'patient'
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  👵 Patient Summary
                </button>
                <button
                  type="button"
                  onClick={() => setModalViewMode('clinical')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    modalViewMode === 'clinical'
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🩺 Radiologist Detail
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 py-2 text-xs">
              {modalViewMode === 'patient' ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5">
                    <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      👵 What Your Scan Shows
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedXRayModal.data?.plainLanguageExplanation || selectedXRayModal.impression}
                    </p>
                  </div>

                  {selectedXRayModal.data?.questionsForDoctor && (
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5">
                      <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-primary" /> Questions for Your Doctor
                      </span>
                      <ul className="space-y-1 text-muted-foreground">
                        {selectedXRayModal.data.questionsForDoctor.map((q: string, i: number) => (
                          <li key={i}>• {q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5">
                    <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-primary" /> Radiologist Impression & Guidance
                    </span>
                    <p className="text-muted-foreground leading-relaxed font-mono">
                      {selectedXRayModal.data?.radiologicalImpression || selectedXRayModal.impression}
                    </p>
                    {selectedXRayModal.data?.clinicalPhysicianNotes && (
                      <p className="text-muted-foreground leading-relaxed pt-1">
                        <strong>Physician Directives:</strong> {selectedXRayModal.data.clinicalPhysicianNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Anatomical Findings Table */}
              {selectedXRayModal.data?.anatomicalFindings && (
                <div className="border border-border rounded-xl overflow-hidden mt-2">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="p-2.5 font-bold">Structure</th>
                        <th className="p-2.5 font-bold">Observation</th>
                        <th className="p-2.5 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedXRayModal.data.anatomicalFindings.map((f: any, i: number) => (
                        <tr key={i} className="hover:bg-muted/20">
                          <td className="p-2.5 font-semibold text-foreground">{f.structure}</td>
                          <td className="p-2.5 text-muted-foreground">{f.observation}</td>
                          <td className="p-2.5">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              f.abnormalityDetected
                                ? 'bg-amber-500/15 text-amber-600'
                                : 'bg-emerald-500/15 text-emerald-600'
                            }`}>
                              {f.abnormalityDetected ? 'Abnormal' : 'Normal'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedXRayModal(null)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => handleDownloadXRayPDF(selectedXRayModal)}
                disabled={exportingId === selectedXRayModal.id}
                className="text-xs bg-primary text-primary-foreground font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Official PDF Report</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
