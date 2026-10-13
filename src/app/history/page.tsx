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
  clearAllLocalDeviceData,
} from '@/lib/assessment-store';
import { isCloudSyncEnabled } from '@/lib/firebase';
import {
  Episode,
  SuggestedEpisode,
  getEpisodes,
  saveEpisode,
  deleteEpisode,
  renameEpisode,
  removeAssessmentFromEpisode,
  detectSuggestedEpisodes,
} from '@/lib/episodes';
import { LabTrends } from '@/components/LabTrends';
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
  FolderPlus,
  FolderCheck,
  Edit2,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

function SuggestedEpisodeCard({
  suggestion,
  onConfirm,
  onDismiss,
}: {
  suggestion: SuggestedEpisode;
  onConfirm: (title: string) => void;
  onDismiss: () => void;
}) {
  const [title, setTitle] = useState(suggestion.suggestedTitle);

  return (
    <div className="p-4 rounded-xl bg-card border border-border space-y-3 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
        <div className="font-semibold text-foreground flex items-center gap-2 flex-wrap">
          <span>Patient: {suggestion.patientName}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{suggestion.dateSpanSummary}</span>
          <Badge variant="outline" className="text-[10px] font-mono">
            {suggestion.assessmentsCount} visits
          </Badge>
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={`sug-title-${suggestion.id}`}
          className="text-xs font-semibold text-muted-foreground block"
        >
          Episode Title (in patient&apos;s own words):
        </label>
        <Input
          id={`sug-title-${suggestion.id}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-h-[44px] text-xs bg-background"
          placeholder="e.g. Symptom check, started Oct 4"
        />
      </div>

      <div className="flex items-center gap-2 justify-end pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDismiss}
          className="min-h-[44px] text-xs"
        >
          Dismiss
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => onConfirm(title)}
          className="min-h-[44px] text-xs bg-primary text-primary-foreground font-semibold flex items-center gap-1.5"
        >
          <FolderCheck className="w-3.5 h-3.5" />
          <span>Confirm Episode</span>
        </Button>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<SavedAssessmentSummary[]>([]);
  const [labs, setLabs] = useState<SavedLabSummary[]>([]);
  const [xrays, setXrays] = useState<SavedXRaySummary[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [suggestedEpisodes, setSuggestedEpisodes] = useState<SuggestedEpisode[]>([]);
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<string[]>([]);
  const [editingEpisodeId, setEditingEpisodeId] = useState<string | null>(null);
  const [editingEpisodeTitle, setEditingEpisodeTitle] = useState('');
  const [expandedEpisodeIds, setExpandedEpisodeIds] = useState<Set<string>>(new Set());
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTriage, setSelectedTriage] = useState<'ALL' | TriageLevel>('ALL');
  const [exportingId, setExportingId] = useState<string | null>(null);

  useEffect(() => {
    const loadedHistory = getAssessmentHistory();
    const loadedLabs = getLabHistory();
    const loadedXrays = getXRayHistory();
    const loadedEpisodes = getEpisodes();

    let dismissed: string[] = [];
    try {
      const raw = localStorage.getItem('manomed_dismissed_suggestions_v1');
      if (raw) dismissed = JSON.parse(raw);
    } catch {
      dismissed = [];
    }

    const suggestions = detectSuggestedEpisodes(loadedHistory, loadedEpisodes, dismissed);

    setHistory(loadedHistory);
    setLabs(loadedLabs);
    setXrays(loadedXrays);
    setEpisodes(loadedEpisodes);
    setDismissedSuggestionIds(dismissed);
    setSuggestedEpisodes(suggestions);
    setIsLoaded(true);
  }, []);

  const handleConfirmSuggestion = (sug: SuggestedEpisode, customTitle?: string) => {
    const title = customTitle && customTitle.trim() ? customTitle.trim() : sug.suggestedTitle;
    const newEpisode: Episode = {
      id: `ep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      patientName: sug.patientName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assessmentIds: sug.assessmentIds,
    };
    saveEpisode(newEpisode);
    const updatedEpisodes = getEpisodes();
    setEpisodes(updatedEpisodes);
    const newSuggestions = detectSuggestedEpisodes(history, updatedEpisodes, dismissedSuggestionIds);
    setSuggestedEpisodes(newSuggestions);
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    const updatedDismissed = [...dismissedSuggestionIds, suggestionId];
    setDismissedSuggestionIds(updatedDismissed);
    try {
      localStorage.setItem('manomed_dismissed_suggestions_v1', JSON.stringify(updatedDismissed));
    } catch {}
    setSuggestedEpisodes((prev) => prev.filter((s) => s.id !== suggestionId));
  };

  const handleDeleteEpisode = (episodeId: string) => {
    if (confirm('Unlink this health episode? The individual assessment encounters will remain safely in your history.')) {
      deleteEpisode(episodeId);
      const updatedEpisodes = getEpisodes();
      setEpisodes(updatedEpisodes);
      const newSuggestions = detectSuggestedEpisodes(history, updatedEpisodes, dismissedSuggestionIds);
      setSuggestedEpisodes(newSuggestions);
    }
  };

  const handleRemoveAssessmentFromEpisode = (episodeId: string, assessmentId: string) => {
    removeAssessmentFromEpisode(episodeId, assessmentId);
    const updatedEpisodes = getEpisodes();
    setEpisodes(updatedEpisodes);
    const newSuggestions = detectSuggestedEpisodes(history, updatedEpisodes, dismissedSuggestionIds);
    setSuggestedEpisodes(newSuggestions);
  };

  const handleSaveRenameEpisode = (episodeId: string) => {
    if (!editingEpisodeTitle.trim()) return;
    renameEpisode(episodeId, editingEpisodeTitle);
    setEpisodes(getEpisodes());
    setEditingEpisodeId(null);
    setEditingEpisodeTitle('');
  };

  const toggleExpandEpisode = (episodeId: string) => {
    setExpandedEpisodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(episodeId)) {
        next.delete(episodeId);
      } else {
        next.add(episodeId);
      }
      return next;
    });
  };

  const handleConfirmClearAllData = () => {
    clearAllLocalDeviceData();
    setHistory([]);
    setLabs([]);
    setXrays([]);
    setEpisodes([]);
    setSuggestedEpisodes([]);
    setShowClearDataModal(false);
  };

  const handleDeleteSymptom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this clinical assessment record?')) {
      deleteAssessmentFromHistory(id);
      const updated = history.filter((item) => item.id !== id);
      setHistory(updated);
      const updatedEpisodes = getEpisodes();
      setEpisodes(updatedEpisodes);
      setSuggestedEpisodes(detectSuggestedEpisodes(updated, updatedEpisodes, dismissedSuggestionIds));
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
          Loading saved assessments...
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
          <span className="font-semibold text-foreground">Past Assessments & Test History</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
          <Activity className="w-3.5 h-3.5 text-primary" />
          <span>Local Browser Storage</span>
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
            Longitudinal Health Records
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-2xl leading-relaxed">
            Review past symptom triage sessions, health episodes, blood work laboratory interpretations, and X-ray radiology evaluations stored locally in your browser.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setShowClearDataModal(true)}
            className="min-h-[44px] flex items-center gap-2 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
          >
            <Trash2 className="w-4 h-4" />
            Remove data from this device
          </Button>
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
        <TabsContent value="symptoms" className="space-y-6">
          {/* Suggested Episodes Grouping (Suggest-and-Confirm) */}
          {suggestedEpisodes.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl border border-primary/30 bg-primary/5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-foreground">
                    Suggested Health Episodes ({suggestedEpisodes.length})
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We found multiple assessments for the same patient within a 14-day window. You can confirm them into an ongoing episode, edit the title to describe what happened in your own words, or dismiss.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {suggestedEpisodes.map((sug) => (
                  <SuggestedEpisodeCard
                    key={sug.id}
                    suggestion={sug}
                    onConfirm={(customTitle) => handleConfirmSuggestion(sug, customTitle)}
                    onDismiss={() => handleDismissSuggestion(sug.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Confirmed Episodes Section */}
          {episodes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <FolderCheck className="w-4 h-4 text-primary" />
                  Confirmed Health Episodes ({episodes.length})
                </h2>
              </div>

              <div className="space-y-3">
                {episodes.map((ep) => {
                  const isEditing = editingEpisodeId === ep.id;
                  const isExpanded = expandedEpisodeIds.has(ep.id);
                  const linkedItems = history.filter((h) => ep.assessmentIds.includes(h.id));

                  return (
                    <Card key={ep.id} className="p-4 bg-card border-border space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingEpisodeTitle}
                              onChange={(e) => setEditingEpisodeTitle(e.target.value)}
                              className="min-h-[44px] text-xs flex-1"
                              placeholder="Episode title (e.g. Symptom check, started Oct 4)"
                            />
                            <Button
                              size="sm"
                              className="min-h-[44px] text-xs"
                              onClick={() => handleSaveRenameEpisode(ep.id)}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="min-h-[44px] text-xs"
                              onClick={() => {
                                setEditingEpisodeId(null);
                                setEditingEpisodeTitle('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-foreground">{ep.title}</span>
                              <Badge variant="outline" className="text-[10px] font-mono">
                                {linkedItems.length} encounter(s)
                              </Badge>
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              Patient: {ep.patientName || 'Anonymous'} • Updated: {new Date(ep.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        )}

                        {!isEditing && (
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingEpisodeId(ep.id);
                                setEditingEpisodeTitle(ep.title);
                              }}
                              className="min-h-[44px] text-xs text-muted-foreground hover:text-foreground"
                              aria-label={`Rename episode ${ep.title}`}
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-1" />
                              Rename
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEpisode(ep.id)}
                              className="min-h-[44px] text-xs text-muted-foreground hover:text-destructive"
                              aria-label={`Unlink episode ${ep.title}`}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Unlink
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleExpandEpisode(ep.id)}
                              className="min-h-[44px] text-xs"
                              aria-expanded={isExpanded}
                              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} episode ${ep.title}`}
                            >
                              {isExpanded ? 'Collapse' : 'Encounters'}
                              <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </Button>
                          </div>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="space-y-2 pt-2 border-t border-border/60">
                          <p className="text-[11px] font-semibold text-muted-foreground">
                            Linked Encounters:
                          </p>
                          {linkedItems.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 rounded-lg bg-muted/40 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {getTriageBadge(item.triageLevel)}
                                  <span className="font-semibold text-xs text-foreground">{item.topCondition}</span>
                                  <span className="text-[11px] text-muted-foreground">
                                    • {new Date(item.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  &quot;{item.primarySymptoms}&quot;
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenAssessment(item)}
                                  className="min-h-[44px] text-xs"
                                >
                                  Open
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveAssessmentFromEpisode(ep.id, item.id)}
                                  className="min-h-[44px] text-xs text-muted-foreground hover:text-destructive"
                                >
                                  Remove from episode
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Assessment Filtering & Listing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                All Symptom Assessments ({filteredHistory.length})
              </h2>
            </div>

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
                  Completed symptom assessments will appear here so you can review differential likelihoods, group related visits into episodes, and export summaries.
                </p>
                <Link href="/ManoMedai" className="mt-4 inline-block">
                  <Button size="sm" className="min-h-[44px] text-xs">Start a Symptom Check</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-3">
                {filteredHistory.map((item) => {
                  const assignedEpisode = episodes.find((e) => e.assessmentIds.includes(item.id));
                  return (
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
                            {assignedEpisode && (
                              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                                In Episode: {assignedEpisode.title}
                              </Badge>
                            )}
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
                            className="text-xs min-h-[44px] px-3"
                          >
                            <Download className="w-3.5 h-3.5 mr-1" />
                            PDF
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleDeleteSymptom(item.id, e)}
                            className="min-h-[44px] min-w-[44px] text-muted-foreground hover:text-destructive"
                            aria-label={`Delete record ${item.topCondition}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: BLOOD WORK & LABS */}
        <TabsContent value="labs" className="space-y-6">
          {/* Longitudinal Lab Trends */}
          <LabTrends labHistory={labs} />

          {/* Individual Lab Tests */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Individual Lab Reports ({filteredLabs.length})
            </h2>

            {filteredLabs.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-border bg-card/40 rounded-2xl">
                <FlaskConical className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                <h3 className="font-semibold text-base text-foreground">No laboratory records found</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Lab reports you enter or analyze will appear here so you can review findings, check reference ranges, and track longitudinal trends over time.
                </p>
                <Link href="/labs" className="mt-4 inline-block">
                  <Button size="sm" className="min-h-[44px] text-xs">Enter a Lab Test</Button>
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
                          className="text-xs min-h-[44px] px-3"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" />
                          PDF
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteLab(lab.id, e)}
                          className="min-h-[44px] min-w-[44px] text-muted-foreground hover:text-destructive"
                          aria-label={`Delete lab test ${lab.panelType}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 3: X-RAY IMAGING */}
        <TabsContent value="imaging" className="space-y-4">
          {filteredXRays.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-border bg-card/40 rounded-2xl">
              <Scan className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
              <h3 className="font-semibold text-base text-foreground">No imaging records found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                X-ray interpretations you run will appear here with anatomical observations, high-contrast views, and questions for your doctor.
              </p>
              <Link href="/imaging" className="mt-4 inline-block">
                <Button size="sm" className="min-h-[44px] text-xs">Analyze an X-Ray</Button>
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
                        className="text-xs min-h-[44px] px-3"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        PDF
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteXRay(xray.id, e)}
                        className="min-h-[44px] min-w-[44px] text-muted-foreground hover:text-destructive"
                        aria-label={`Delete radiograph record ${xray.region}`}
                      >
                        <Trash2 className="w-4 h-4" />
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

      {/* MODAL 3: REMOVE DATA FROM DEVICE CONFIRMATION */}
      <Dialog open={showClearDataModal} onOpenChange={setShowClearDataModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Remove Data from This Device
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
              This action will permanently delete all symptom assessments, health episodes, laboratory reports, and imaging scans stored in this browser&apos;s local storage.
            </DialogDescription>
          </DialogHeader>

          {isCloudSyncEnabled && (
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200 text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Cloud Synchronization Active
              </div>
              <p className="leading-relaxed">
                Cloud sync is currently enabled. Clearing data from this device removes local records from your browser, but does <strong>NOT</strong> delete copies previously synchronized to the clinic station cloud queue. To delete records from the clinic station, an authorized clinician must archive them from the station dashboard.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearDataModal(false)}
              className="min-h-[44px] text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmClearAllData}
              className="min-h-[44px] text-xs font-semibold flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Permanently Remove Local Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
