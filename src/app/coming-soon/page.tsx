"use client";

import Link from "next/link";
import { Activity, ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function UnderMaintenance() {
  return (
    <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-md w-full p-8 rounded-3xl bg-card border border-border shadow-md text-center space-y-6">
        {/* Precision Clinical Status Ring */}
        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-30" />
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
            <Activity className="w-6 h-6 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider border-border">
            SCHEDULED CLINICAL MAINTENANCE
          </Badge>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground">
            Platform Upgrade in Progress
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Our clinical engineering division is deploying updated diagnostic taxonomies and algorithmic safety rules. Service continuity will be restored momentarily.
          </p>
        </div>

        {/* Operational Status Checklist */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 text-left text-xs space-y-2 font-mono">
          <div className="flex items-center justify-between text-[11px] pb-1 border-b border-border/60 font-sans font-semibold text-muted-foreground">
            <span>Subsystem</span>
            <span>Status</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground">Triage Inference Models</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Online
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground">ICD-10 Taxonomy Index</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Calibrated
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground">EHR FHIR Export Pipeline</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> Upgrading
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full min-h-[44px] text-xs font-semibold border-border">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Return to Clinical Portal
            </Button>
          </Link>
          <Link href="/ManoMedai" className="w-full">
            <Button className="w-full min-h-[44px] text-xs font-bold bg-primary text-primary-foreground shadow-xs">
              Access Triage
            </Button>
          </Link>
        </div>

        <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5 pt-2 border-t border-border/60">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>Patient audit vault and local data remain secure</span>
        </div>
      </div>
    </main>
  );
}
