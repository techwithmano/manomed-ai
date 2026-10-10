import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Plus_Jakarta_Sans, Newsreader } from 'next/font/google';
import Link from 'next/link';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Analytics } from '@vercel/analytics/next';
import {
  ShieldAlert,
  Lock,
  HeartPulse,
  Cpu,
  FileCheck2,
} from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import type { Metadata } from 'next';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'ManoMed AI | Clinical Decision Support & Symptom Triage',
  description: 'Evidence-grounded medical AI triage, dynamic clinical questionnaire assessment, and automated EHR documentation generator.',
  keywords: ['clinical decision support', 'symptom triage', 'medical AI', 'differential diagnosis', 'EHR SOAP notes'],
  authors: [{ name: 'ManoMed AI Clinical Intelligence Systems' }],
  metadataBase: new URL('https://manomed.ai'),
  openGraph: {
    title: 'ManoMed AI | Clinical Decision Support & Symptom Triage',
    description: 'Evidence-grounded medical triage and automated EHR SOAP documentation.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html
        lang="en"
        className={`${plusJakarta.variable} ${newsreader.variable} scroll-smooth`}
        suppressHydrationWarning
      >
        <body className="bg-background text-foreground min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
          {/* Accessible Skip Link */}
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>

          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {/* Modular Site Navigation Header */}
            <SiteHeader />

            {/* Main Content Landmark */}
            <main id="main-content" className="pt-20 flex-1 focus:outline-none" tabIndex={-1}>
              {children}
            </main>

            {/* Institutional Healthcare Footer */}
            <footer className="border-t border-border bg-card/60 transition-colors" role="contentinfo">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Brand & Mission */}
                  <div className="md:col-span-5 space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <HeartPulse className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-base tracking-tight">ManoMed AI</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                        CDS v2.4
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                      Evidence-grounded clinical decision support tool designed to streamline patient intake, structure differential likelihoods, and generate standard EHR documentation.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-primary" />
                        Client-Encrypted Vault
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-primary" />
                        Calibrated Inference
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FileCheck2 className="w-3.5 h-3.5 text-primary" />
                        SOAP Standard
                      </span>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="md:col-span-3 space-y-2.5 text-xs">
                    <h4 className="font-bold uppercase tracking-wider text-foreground">Clinical Platform</h4>
                    <ul className="space-y-1.5 text-muted-foreground">
                      <li>
                        <Link href="/ManoMedai" className="hover:text-primary transition-colors focus-visible:underline">
                          Symptom Triage Intake
                        </Link>
                      </li>
                      <li>
                        <Link href="/labs" className="hover:text-primary transition-colors focus-visible:underline">
                          Blood Work & Labs
                        </Link>
                      </li>
                      <li>
                        <Link href="/imaging" className="hover:text-primary transition-colors focus-visible:underline">
                          X-Ray & Imaging Assistant
                        </Link>
                      </li>
                      <li>
                        <Link href="/history" className="hover:text-primary transition-colors focus-visible:underline">
                          Audit Trail & Records
                        </Link>
                      </li>
                      <li>
                        <Link href="/about" className="hover:text-primary transition-colors focus-visible:underline">
                          Clinical Methodology
                        </Link>
                      </li>
                      <li>
                        <Link href="/contact" className="hover:text-primary transition-colors focus-visible:underline">
                          Institutional Routing
                        </Link>
                      </li>
                      <li>
                        <Link href="/privacy" className="hover:text-primary transition-colors focus-visible:underline">
                          Privacy & Data Governance
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Emergency Helpline Box */}
                  <div className="md:col-span-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-destructive">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Emergency Medical Protocol</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      ManoMed AI is an educational decision-support aid and does not substitute professional medical diagnosis or urgent dispatch services. If in immediate danger:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1 font-mono font-bold text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-card border border-border">US/CA: 911</span>
                      <span className="px-2 py-0.5 rounded bg-card border border-border">UK: 999</span>
                      <span className="px-2 py-0.5 rounded bg-card border border-border">EU: 112</span>
                      <span className="px-2 py-0.5 rounded bg-card border border-border">Crisis: 988</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                  <p>© 2026 ManoMed AI Clinical Intelligence Systems. All rights reserved.</p>
                  <p className="text-[11px]">Engineered for diagnostic rigor, patient safety, and seamless physician hand-off.</p>
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
