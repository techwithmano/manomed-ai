"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getAssessmentHistory,
  SavedAssessmentSummary,
  deleteAssessmentFromHistory,
  saveCurrentAssessment,
  TriageLevel,
} from "@/lib/assessment-store";
import { exportClinicalReportPDF } from "@/lib/pdf-export";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Filter,
  Activity,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<SavedAssessmentSummary[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTriage, setSelectedTriage] = useState<"ALL" | TriageLevel>("ALL");
  const [exportingId, setExportingId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getAssessmentHistory());
    setIsLoaded(true);
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this clinical assessment record?")) {
      deleteAssessmentFromHistory(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to permanently clear all assessment records from this device?")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("manomed_assessment_history_v2");
      }
      setHistory([]);
    }
  };

  const handleOpenAssessment = (item: SavedAssessmentSummary) => {
    saveCurrentAssessment(item.fullData);
    router.push("/conditions");
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

  // Metrics
  const stats = useMemo(() => {
    const total = history.length;
    const emergency = history.filter((h) => h.triageLevel === "EMERGENCY").length;
    const urgent = history.filter((h) => h.triageLevel === "URGENT").length;
    const routine = history.filter((h) => h.triageLevel === "ROUTINE" || h.triageLevel === "SELF_CARE").length;
    return { total, emergency, urgent, routine };
  }, [history]);

  // Filtered results
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesTriage = selectedTriage === "ALL" || item.triageLevel === selectedTriage;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.topCondition.toLowerCase().includes(q) ||
        item.primarySymptoms.toLowerCase().includes(q) ||
        (item.patientName && item.patientName.toLowerCase().includes(q));
      return matchesTriage && matchesSearch;
    });
  }, [history, selectedTriage, searchQuery]);

  const getTriageBadge = (level: string) => {
    switch (level) {
      case "EMERGENCY":
        return <Badge variant="destructive" className="font-bold text-xs uppercase tracking-wider">Emergency</Badge>;
      case "URGENT":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider">Urgent</Badge>;
      case "ROUTINE":
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider">Routine</Badge>;
      default:
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider">Self-Care</Badge>;
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
          <Activity className="w-5 h-5 animate-spin text-primary" />
          Loading clinical assessment records...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Client-Side Encrypted Audit Vault
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-primary" />
            Clinical Records & Audit Trail
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review past triage summaries, differential diagnoses, and generated EHR documentation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-xs text-muted-foreground hover:text-destructive border-border/60"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear Vault
            </Button>
          )}
          <Link href="/ManoMedai">
            <Button className="flex items-center gap-2 bg-primary text-primary-foreground shadow-sm">
              <PlusCircle className="w-4 h-4" />
              New Triage Assessment
            </Button>
          </Link>
        </div>
      </div>

      {history.length > 0 && (
        <>
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="bg-card/50 border-border/60 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black">{stats.total}</div>
                  <div className="text-xs text-muted-foreground font-medium">Total Evaluations</div>
                </div>
                <Activity className="w-6 h-6 text-primary/60" />
              </CardContent>
            </Card>

            <Card className="bg-destructive/5 border-destructive/20 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-destructive">{stats.emergency}</div>
                  <div className="text-xs text-destructive/80 font-medium">Emergency Flags</div>
                </div>
                <AlertCircle className="w-6 h-6 text-destructive/60" />
              </CardContent>
            </Card>

            <Card className="bg-amber-500/5 border-amber-500/20 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.urgent}</div>
                  <div className="text-xs text-amber-600/80 dark:text-amber-400/80 font-medium">Urgent Triage</div>
                </div>
                <AlertTriangle className="w-6 h-6 text-amber-500/60" />
              </CardContent>
            </Card>

            <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.routine}</div>
                  <div className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium">Routine / Self-Care</div>
                </div>
                <CheckCircle2 className="w-6 h-6 text-emerald-500/60" />
              </CardContent>
            </Card>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border border-border/50">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by condition, symptoms, or patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-background"
              />
            </div>

            {/* Triage Level Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {(["ALL", "EMERGENCY", "URGENT", "ROUTINE", "SELF_CARE"] as const).map((tier) => (
                <Button
                  key={tier}
                  variant={selectedTriage === tier ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTriage(tier)}
                  className={`text-xs h-8 px-2.5 capitalize ${
                    selectedTriage === tier
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tier === "ALL" ? "All Tiers" : tier.replace("_", "-").toLowerCase()}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Record List */}
      {history.length === 0 ? (
        <Card className="text-center p-14 border-dashed border-2 border-border/80 bg-muted/10">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <CardTitle className="text-xl font-bold">No Past Assessments Recorded</CardTitle>
          <CardDescription className="text-sm max-w-md mx-auto mt-2">
            Completed symptom evaluations, differential analyses, and generated clinical SOAP reports will automatically be cataloged securely in this audit vault.
          </CardDescription>
          <div className="pt-6">
            <Link href="/ManoMedai">
              <Button className="bg-primary text-primary-foreground font-semibold px-6">
                Start First Clinical Assessment →
              </Button>
            </Link>
          </div>
        </Card>
      ) : filteredHistory.length === 0 ? (
        <Card className="text-center p-10 border-border/60">
          <p className="text-sm text-muted-foreground">No records matched your search filter criteria.</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedTriage("ALL");
            }}
            className="text-xs text-primary mt-2"
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Showing {filteredHistory.length} of {history.length} Saved Records</span>
            <span>Local Vault (HIPAA Conscious Client Storage)</span>
          </div>

          <div className="grid gap-3">
            {filteredHistory.map((item) => (
              <Card
                key={item.id}
                onClick={() => handleOpenAssessment(item)}
                className="cursor-pointer hover:border-primary/60 transition-all hover:shadow-md group border-border/60 bg-card/60 backdrop-blur-sm"
              >
                <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {getTriageBadge(item.triageLevel)}
                      <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {item.topCondition}
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded">
                        {Math.round(item.topLikelihood * 100)}% Match
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      <span className="font-semibold text-foreground/80">Intake Symptoms:</span>{" "}
                      {item.primarySymptoms || "No symptoms text recorded"}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground/80 pt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <User className="w-3.5 h-3.5 text-primary/70" />
                        {item.patientName || "Anonymous Patient"} {item.patientAge ? `(${item.patientAge}y)` : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {new Date(item.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(item.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleDownloadPDF(item, e)}
                      disabled={exportingId === item.id}
                      className="text-xs h-8 px-2.5 border-border/60 hover:border-primary/50 text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                      title="Download PDF clinical summary"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {exportingId === item.id ? "Exporting..." : "PDF"}
                      </span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="text-muted-foreground hover:text-destructive h-8 px-2"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                      size="sm"
                      className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground font-semibold px-3 h-8 shadow-xs"
                    >
                      View Report
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
