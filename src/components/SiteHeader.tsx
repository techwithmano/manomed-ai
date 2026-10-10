"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHeartbeat, FaBars, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/context/language-context";

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: "/ManoMedai", label: t.navTriage },
    { href: "/labs", label: t.navLabs },
    { href: "/imaging", label: t.navImaging },
    { href: "/station", label: t.navStation },
    { href: "/history", label: t.navHistory },
  ];

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-background border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
        {/* Preserved Authentic Brand Identity: FaHeartbeat + ManoMed AI */}
        <div className="flex items-center space-x-6 rtl:space-x-reverse">
          <Link
            href="/"
            className="flex items-center space-x-2.5 rtl:space-x-reverse focus-visible:outline-none"
            aria-label="ManoMed AI Homepage"
          >
            <FaHeartbeat className="text-blue-600 text-xl" />
            <span className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              ManoMed AI
            </span>
            <span className="hidden sm:inline-block text-[11px] text-muted-foreground/80 pl-2.5 rtl:pr-2.5 rtl:pl-0 border-l rtl:border-r rtl:border-l-0 border-border font-medium">
              Smart Health Assistant
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse h-14" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`h-14 px-3 flex items-center text-xs transition-colors border-b-2 ${
                    isActive
                      ? "border-blue-600 text-foreground font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground font-medium"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Header Right Utilities */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* Understated Emergency Indicator */}
          <a
            href="tel:911"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 transition-colors"
            title="Emergency Medical Dispatch"
            aria-label="Emergency 911"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span className="font-semibold text-[11px]">Emergency 911</span>
          </a>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Authentication */}
          <div className="hidden sm:flex items-center">
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-7 h-7 rounded border border-border",
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs font-medium rounded border-border hover:bg-muted text-foreground"
                >
                  {t.signIn}
                </Button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-1.5 rounded text-foreground hover:bg-muted transition-colors focus-visible:outline-none"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden border-b border-border bg-background p-4 space-y-3">
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 text-sm transition-colors rounded ${
                    isActive
                      ? "bg-muted font-semibold text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="pt-3 mt-2 border-t border-border flex items-center justify-between text-xs">
              <a href="tel:911" className="text-red-600 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                Emergency Protocol: 911
              </a>

              <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    {t.signIn}
                  </Button>
                </SignInButton>
              </SignedOut>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
