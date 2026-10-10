"use client";

import React from "react";
import { Activity, ShieldCheck } from "lucide-react";

interface LoadingProps {
  title: string;
  description: string;
}

const Loading: React.FC<LoadingProps> = ({ title, description }) => (
  <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] bg-background p-6">
    <div className="flex flex-col items-center bg-card border border-border shadow-md rounded-2xl p-8 max-w-md w-full text-center space-y-5">
      {/* Precision Clinical Pulse Ring */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-40" />
        <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-xs">
          <Activity className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold">
          CHECKING YOUR SYMPTOMS
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      <div className="pt-2 border-t border-border/60 w-full flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
        <span>Private & secure health session</span>
      </div>
    </div>
  </div>
);

export default Loading;