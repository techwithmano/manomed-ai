import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Analytics } from '@vercel/analytics/next';
import {
  ShieldAlert,
  Sparkles,
  Lock,
  HeartPulse,
} from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ManoMed AI | Clinical Decision Support & Symptom Triage',
  description: 'Evidence-grounded medical AI triage, dynamic clinical questionnaire assessment, and automated EHR documentation generator.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" className="scroll-smooth" suppressHydrationWarning>
        <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {/* Modular Client Header */}
            <SiteHeader />

            {/* Main Content Area */}
            <main className="pt-20 flex-1">
              {children}
            </main>

            {/* Institutional Healthcare Footer */}
            <footer className="border-t border-border bg-card/60 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Brand & Mission */}
                  <div className="md:col-span-5 space-y-3">
                    <div className="flex items-center space-x-2">
                      <HeartPulse className="w-5 h-5 text-blue-600" />
                      <span className="font-extrabold text-lg tracking-tight">ManoMed AI</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        CDS
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                      ManoMed AI is an evidence-grounded clinical decision support tool designed to streamline patient symptom intake, provide structured differential likelihoods, and generate standardized EHR documentation.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-emerald-500" />
                        Client-Side Cached
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        Google GenAI Core
                      </span>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="md:col-span-3 space-y-2.5 text-xs">
                    <h4 className="font-bold uppercase tracking-wider text-foreground">Platform</h4>
                    <ul className="space-y-1.5 text-muted-foreground">
                      <li><Link href="/ManoMedai" className="hover:text-primary transition">Symptom Triage Intake</Link></li>
                      <li><Link href="/history" className="hover:text-primary transition">Past Assessment Records</Link></li>
                      <li><Link href="/about" className="hover:text-primary transition">Clinical Methodology</Link></li>
                      <li><Link href="/contact" className="hover:text-primary transition">Institutional Inquiries</Link></li>
                      <li><Link href="/privacy" className="hover:text-primary transition">Privacy & Data Governance</Link></li>
                    </ul>
                  </div>

                  {/* Emergency Helpline Box */}
                  <div className="md:col-span-4 p-4 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-destructive">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Emergency Care Notice</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      ManoMed AI does not provide emergency medical services or replace direct physical diagnosis by a licensed physician. If you are in immediate danger:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1 font-mono font-bold text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-card border">US/CA: 911</span>
                      <span className="px-2 py-0.5 rounded bg-card border">UK: 999</span>
                      <span className="px-2 py-0.5 rounded bg-card border">EU: 112</span>
                      <span className="px-2 py-0.5 rounded bg-card border">Crisis: 988</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                  <p>© 2026 ManoMed AI Clinical Intelligence Systems. All rights reserved.</p>
                  <p className="text-[11px]">Designed for clinical accuracy, patient safety, and seamless physician hand-off.</p>
                </div>
              </div>
            </footer>

            <Toaster />
            <Analytics />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
