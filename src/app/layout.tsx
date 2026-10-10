import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Link from 'next/link';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Analytics } from '@vercel/analytics/next';
import { ShieldAlert, Lock, Cpu, FileCheck2 } from 'lucide-react';
import { FaHeartbeat } from 'react-icons/fa';
import SiteHeader from '@/components/SiteHeader';
import { LanguageProvider } from '@/context/language-context';
import type { Metadata } from 'next';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'ManoMed AI | Smart Health Assistant & Symptom Checker',
  description: 'Check your symptoms, understand blood tests, and get clear doctor-ready health guidance in simple everyday words.',
  keywords: ['symptom checker', 'health assistant', 'medical guidance', 'check symptoms', 'blood test reader'],
  authors: [{ name: 'ManoMed AI' }],
  metadataBase: new URL('https://manomed.ai'),
  openGraph: {
    title: 'ManoMed AI | Smart Health Assistant & Symptom Checker',
    description: 'Check your symptoms, understand blood tests, and get clear health guidance in simple everyday words.',
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
        className={`${plusJakarta.variable} scroll-smooth`}
        suppressHydrationWarning
      >
        <body className="bg-background text-foreground min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
          {/* Accessible Skip Link */}
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>

          <LanguageProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {/* Modular Site Navigation Header */}
              <SiteHeader />

              {/* Main Content Landmark */}
              <main id="main-content" className="pt-16 flex-1 focus:outline-none" tabIndex={-1}>
                {children}
              </main>

              {/* Institutional Healthcare Footer */}
              <footer className="border-t border-border bg-card/60 transition-colors" role="contentinfo">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Brand & Mission with Preserved FaHeartbeat Logo */}
                    <div className="md:col-span-5 space-y-3">
                      <div className="flex items-center space-x-2.5">
                        <FaHeartbeat className="text-blue-600 text-2xl" />
                        <span className="font-bold text-lg tracking-tight text-foreground">
                          ManoMed AI
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                        Intelligent clinical decision support and triage system designed for both families and healthcare professionals.
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
                    <h4 className="font-bold uppercase tracking-wider text-foreground">Health Tools</h4>
                    <ul className="space-y-1.5 text-muted-foreground">
                      <li>
                        <Link href="/ManoMedai" className="hover:text-primary transition-colors focus-visible:underline">
                          Check Symptoms
                        </Link>
                      </li>
                      <li>
                        <Link href="/labs" className="hover:text-primary transition-colors focus-visible:underline">
                          Blood Tests
                        </Link>
                      </li>
                      <li>
                        <Link href="/imaging" className="hover:text-primary transition-colors focus-visible:underline">
                          X-Rays & Scans
                        </Link>
                      </li>
                      <li>
                        <Link href="/history" className="hover:text-primary transition-colors focus-visible:underline">
                          My Saved Records
                        </Link>
                      </li>
                      <li>
                        <Link href="/about" className="hover:text-primary transition-colors focus-visible:underline">
                          About Us
                        </Link>
                      </li>
                      <li>
                        <Link href="/contact" className="hover:text-primary transition-colors focus-visible:underline">
                          Contact & Support
                        </Link>
                      </li>
                      <li>
                        <Link href="/privacy" className="hover:text-primary transition-colors focus-visible:underline">
                          Privacy Policy
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Emergency Helpline Box */}
                  <div className="md:col-span-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-destructive">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Emergency Help</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      ManoMed AI guides your health decisions, but does not replace emergency medical care. If you are experiencing severe symptoms:
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
                  <p>© 2026 ManoMed AI. All rights reserved.</p>
                  <p className="text-[11px]">Simple and reassuring for patients, organized and practical for doctors.</p>
                </div>
              </div>
            </footer>

            <Toaster />
            <Analytics />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  </ClerkProvider>

  );
}
