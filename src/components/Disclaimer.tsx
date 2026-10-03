"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";

export const Disclaimer: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex items-start gap-3.5">
      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
        <ShieldAlert className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Clinical Guidance & Medical Disclaimer
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          ManoMed AI provides preliminary clinical triage and decision support synthesized from reported patient inputs and evidence-based clinical reasoning models. This application does not establish a formal physician-patient relationship and is not a substitute for clinical diagnosis, laboratory pathology, or prescription therapeutics. For sudden severe symptoms (e.g. crushing chest pain, dyspnea, acute neurological deficit), immediately contact emergency services (<strong>911</strong>).
        </p>
      </div>
    </div>
  );
};
