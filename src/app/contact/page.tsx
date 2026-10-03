"use client";

import { useState } from "react";
import {
  Mail,
  Building2,
  ShieldAlert,
  PhoneCall,
  Send,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

const emergencyNumbers = [
  { region: "United States & Canada", number: "911", desc: "Emergency Medical Services" },
  { region: "United Kingdom", number: "999 / 111", desc: "Emergency / NHS Non-Emergency" },
  { region: "European Union", number: "112", desc: "Pan-European Emergency Services" },
  { region: "Mental Health Crisis (US)", number: "988", desc: "Suicide & Crisis Lifeline" },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="bg-background text-foreground min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-foreground transition-colors">
              Clinical Portal
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span className="font-semibold text-foreground">Institutional Inquiries & Support</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Dispatch</span>
          </div>
        </div>

        {/* Header */}
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <Building2 className="w-4 h-4" />
            Institutional Communications
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-foreground">
            Contact ManoMed Clinical Operations
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Connect with our clinical engineering division, propose health system research partnerships, or request EHR integration documentation.
          </p>
        </div>

        {/* Emergency Alert Banner */}
        <div className="p-5 rounded-2xl bg-red-500/10 border-2 border-red-500/40 text-red-900 dark:text-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm">Experiencing an Acute Medical Emergency?</h3>
              <p className="text-xs leading-relaxed opacity-90">
                ManoMed AI does not monitor contact inquiries for urgent dispatch. If you or someone nearby is experiencing acute chest tightness, dyspnea, or signs of stroke, immediately summon emergency first responders.
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (typeof window !== "undefined") window.location.href = "tel:911";
            }}
            className="min-h-[44px] px-5 flex items-center gap-1.5 shrink-0 shadow-xs font-bold"
          >
            <PhoneCall className="w-4 h-4" />
            Call 911 Now
          </Button>
        </div>

        {/* Main Grid: Form + Info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Contact Form */}
          <div className="md:col-span-7">
            <Card className="border-border shadow-xs bg-card">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Submit an Inquiry
                </CardTitle>
                <CardDescription className="text-xs">
                  Our clinical team typically reviews requests within 1 to 2 business days.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {submitted ? (
                  <div className="p-8 text-center space-y-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h3 className="text-lg font-bold text-foreground">Inquiry Registered</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      Thank you for contacting ManoMed AI. A confirmation has been logged, and our team will follow up at <strong>{email}</strong>.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSubmitted(false);
                        setMessage("");
                        setSubject("");
                      }}
                      className="min-h-[40px] text-xs border-border"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-name" className="text-xs font-semibold">Your Name *</Label>
                        <Input
                          id="contact-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Dr. Arthur Miller"
                          required
                          className="h-10 text-xs rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-email" className="text-xs font-semibold">Email Address *</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="arthur.miller@clinic.org"
                          required
                          className="h-10 text-xs rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-category" className="text-xs font-semibold">Inquiry Category *</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger id="contact-category" className="h-10 text-xs rounded-xl">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiries</SelectItem>
                            <SelectItem value="clinical">Clinical Trials & Partnerships</SelectItem>
                            <SelectItem value="ehr">EHR / HL7 FHIR Interoperability</SelectItem>
                            <SelectItem value="technical">Algorithm Safety & Feedback</SelectItem>
                            <SelectItem value="privacy">HIPAA & Regulatory Compliance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="contact-subject" className="text-xs font-semibold">Subject *</Label>
                        <Input
                          id="contact-subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="Topic summary"
                          required
                          className="h-10 text-xs rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact-message" className="text-xs font-semibold">Message Narrative *</Label>
                      <Textarea
                        id="contact-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Provide details regarding your organizational background, research interest, or inquiry..."
                        className="min-h-[120px] text-xs sm:text-sm resize-y rounded-xl"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full font-bold flex items-center justify-center gap-2 min-h-[48px] bg-primary text-primary-foreground rounded-xl shadow-xs"
                    >
                      {isSubmitting ? (
                        "Transmitting..."
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Dispatch Inquiry
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Institutional Channels & Helplines */}
          <div className="md:col-span-5 space-y-6">
            <Card className="border-border shadow-xs bg-card">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Direct Departmental Points
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/70 space-y-1">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-primary" />
                    Clinical Partnerships & Validation
                  </span>
                  <p className="text-muted-foreground font-mono text-[11px]">partnerships@manomed.ai</p>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border/70 space-y-1">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-primary" />
                    Platform Support & Technical Desk
                  </span>
                  <p className="text-muted-foreground font-mono text-[11px]">support@manomed.ai</p>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border/70 space-y-1">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    Data Governance & HIPAA Compliance
                  </span>
                  <p className="text-muted-foreground font-mono text-[11px]">compliance@manomed.ai</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs bg-red-500/[0.02]">
              <CardHeader className="pb-3 border-b border-red-500/20">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-700 dark:text-red-400">
                  <PhoneCall className="w-4 h-4" />
                  International Emergency Hotlines
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {emergencyNumbers.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-border bg-card flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-foreground block">{item.region}</span>
                      <span className="text-[11px] text-muted-foreground">{item.desc}</span>
                    </div>
                    <span className="font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                      {item.number}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
