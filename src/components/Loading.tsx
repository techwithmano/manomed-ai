"use client";

import React, { useState, useEffect } from "react";
import { Activity, ShieldCheck } from "lucide-react";

interface LoadingProps {
  title?: string;
  description?: string;
  stages?: string[];
}

const DEFAULT_STAGES = [
  "Reviewing your entered symptoms and context...",
  "Formulating relevant clinical follow-up questions...",
  "Organizing assessment details for review...",
];

const Loading: React.FC<LoadingProps> = ({
  title = "Analyzing Health Information",
  description,
  stages = DEFAULT_STAGES,
}) => {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!stages || stages.length <= 1) return;
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % stages.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [stages]);

  const currentStageText = stages[stageIndex] || description || "Please wait while your assessment is prepared...";

  return (
    <div
      className="flex items-center justify-center min-h-[calc(100vh-5rem)] bg-background p-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center bg-card border border-border shadow-md rounded-2xl p-8 max-w-md w-full text-center space-y-5">
        {/* Precision Clinical Pulse Ring */}
        <div className="relative w-20 h-20 flex items-center justify-center" aria-hidden="true">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-40" />
          <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-xs">
            <Activity className="w-6 h-6 animate-spin text-primary" />
          </div>
        </div>

        <div className="space-y-2 w-full">
          <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
            PREPARING CLINICAL SESSION
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
          {/* Honest dynamic stage indicator */}
          <div className="pt-2 px-3 py-2 rounded-xl bg-muted/40 border border-border/70 text-xs font-medium text-foreground/90 transition-all duration-300">
            {currentStageText}
          </div>
        </div>

        <div className="pt-2 border-t border-border/60 w-full flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Session securely stored in current browser session</span>
        </div>
      </div>
    </div>
  );
};

export default Loading;