'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Stethoscope,
  History,
  BookOpen,
  Mail,
  PhoneCall,
  Menu,
  X,
  Activity,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const navItems = [
  { href: '/', icon: Home, label: 'Overview' },
  { href: '/ManoMedai', icon: Stethoscope, label: 'Symptom Triage' },
  { href: '/history', icon: History, label: 'Records Vault' },
  { href: '/about', icon: BookOpen, label: 'Clinical Model' },
  { href: '/contact', icon: Mail, label: 'Contact' },
];

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 clinical-navbar transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-18 min-h-[4.5rem]">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center space-x-3 group focus-visible:outline-none"
          aria-label="ManoMed AI Homepage"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-foreground">
                ManoMed<span className="text-primary font-extrabold">.ai</span>
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border uppercase tracking-widest">
                CDS
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground block -mt-0.5 font-medium">
              Clinical Decision Support
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 min-h-[44px] ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center space-x-3">
          {/* Status Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-medium bg-muted/60 border border-border text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Triage Engine Active</span>
          </div>

          {/* Emergency 911 Call Button */}
          <Button
            variant="destructive"
            size="sm"
            className="h-10 px-3.5 text-xs font-semibold rounded-lg shadow-none flex items-center gap-1.5 min-w-[44px]"
            onClick={() => {
              if (typeof window !== 'undefined') window.location.href = 'tel:911';
            }}
            title="Immediate Emergency Call"
            aria-label="Call emergency dispatch 911"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Emergency 911</span>
          </Button>

          <ThemeSwitcher />

          <Link href="/ManoMedai">
            <Button
              size="sm"
              className="h-10 px-4 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-none transition-colors min-h-[44px]"
            >
              Start Intake
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="flex lg:hidden items-center space-x-2">
          <ThemeSwitcher />
          <button
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Accessible Mobile Drawer Menu */}
      {isMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site Navigation"
          className="fixed inset-0 top-[4.5rem] bg-background/95 backdrop-blur-md z-40 lg:hidden flex flex-col p-6 overflow-y-auto border-t border-border"
        >
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                CDS Inference Online
              </span>
              <Button
                variant="destructive"
                size="sm"
                className="h-9 px-3 text-xs font-bold"
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.href = 'tel:911';
                }}
              >
                <PhoneCall className="w-3 h-3 mr-1" />
                911 Dial
              </Button>
            </div>

            <nav className="flex flex-col space-y-1 pt-2" aria-label="Mobile Navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors min-h-[48px] ${
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-border space-y-3">
            <Link href="/ManoMedai" className="w-full block">
              <Button className="w-full bg-primary text-primary-foreground font-semibold rounded-lg h-12 text-sm shadow-none">
                Start Triage Assessment
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground justify-center pt-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>For acute crises, call 911 immediately.</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
