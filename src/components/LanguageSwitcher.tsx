"use client";

import React from "react";
import { useLanguage, LANGUAGES, Language } from "@/context/language-context";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
  const { language, setLanguage, currentLanguageOption } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 rounded border-border hover:bg-muted text-foreground flex items-center gap-1.5 text-xs font-medium"
          aria-label="Select Language"
        >
          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-mono text-xs">{currentLanguageOption.code.toUpperCase()}</span>
          <span className="hidden sm:inline text-muted-foreground">|</span>
          <span className="hidden sm:inline text-xs">{currentLanguageOption.nativeName}</span>
        </Button>

      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 p-1.5 space-y-1">
        {LANGUAGES.map((opt) => {
          const isSelected = language === opt.code;
          return (
            <DropdownMenuItem
              key={opt.code}
              onClick={() => setLanguage(opt.code as Language)}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs cursor-pointer ${
                isSelected
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-foreground hover:bg-muted font-medium"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{opt.flag}</span>
                <span>{opt.nativeName}</span>
                <span className="text-[10px] text-muted-foreground">({opt.name})</span>
              </div>
              {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
