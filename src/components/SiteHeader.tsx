'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FaHeartbeat,
  FaBars,
  FaTimes,
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaStethoscope,
  FaHistory,
} from 'react-icons/fa';
import {
  PhoneCall,
  ShieldAlert,
  HeartPulse,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const navItems = [
  { href: '/', icon: <FaHome className="w-4 h-4" />, label: 'Home' },
  { href: '/ManoMedai', icon: <FaStethoscope className="w-4 h-4" />, label: 'Symptom Triage' },
  { href: '/history', icon: <FaHistory className="w-4 h-4" />, label: 'Records & History' },
  { href: '/about', icon: <FaInfoCircle className="w-4 h-4" />, label: 'Clinical Mission' },
  { href: '/contact', icon: <FaEnvelope className="w-4 h-4" />, label: 'Contact' },
];

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((s) => !s);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed top-0 w-full z-50 glass-navbar transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-18">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2.5 group focus:outline-none"
          aria-label="ManoMed AI Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-foreground">
                ManoMed<span className="text-blue-600 dark:text-blue-400">AI</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                CDS
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground block -mt-0.5">
              Clinical Decision Support
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all flex items-center gap-2"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center space-x-3">
          {/* Status Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>GenAI Triage Online</span>
          </div>

          {/* Emergency 911 Call Button */}
          <Button
            variant="destructive"
            size="sm"
            className="h-9 px-3.5 text-xs font-semibold rounded-full shadow-sm flex items-center gap-1.5"
            onClick={() => {
              if (typeof window !== 'undefined') window.location.href = 'tel:911';
            }}
            title="Immediate Emergency Call"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Emergency: 911</span>
          </Button>

          <ThemeSwitcher />

          <Link href="/ManoMedai">
            <Button
              size="sm"
              className="h-9 px-4 rounded-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
            >
              Start Assessment
            </Button>
          </Link>
        </div>

        {/* Mobile Menu & Theme Controls */}
        <div className="flex lg:hidden items-center space-x-2">
          <ThemeSwitcher />
          <button
            aria-label="Toggle navigation menu"
            onClick={toggleMenu}
            className="p-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted transition"
          >
            {isMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <div className="absolute top-full left-0 w-full bg-card/95 backdrop-blur-xl border-b border-border shadow-2xl animate-slideDown z-50 lg:hidden">
            <div className="flex flex-col space-y-2 p-5">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>AI Decision Support Active</span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 px-3 text-xs font-semibold"
                  onClick={() => {
                    if (typeof window !== 'undefined') window.location.href = 'tel:911';
                  }}
                >
                  <PhoneCall className="w-3 h-3 mr-1" />
                  911 Call
                </Button>
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  className="flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="pt-3 border-t border-border/60">
                <Link href="/ManoMedai" onClick={closeMenu} className="w-full">
                  <Button className="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-5">
                    Launch Clinical Assessment
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
