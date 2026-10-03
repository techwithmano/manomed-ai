'use client';

import { useState } from 'react';
import {
  Mail,
  Building2,
  ShieldAlert,
  PhoneCall,
  Send,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const emergencyNumbers = [
  { region: 'United States & Canada', number: '911', desc: 'Emergency Dispatch' },
  { region: 'United Kingdom', number: '999 / 111', desc: 'Emergency / NHS Advice' },
  { region: 'European Union', number: '112', desc: 'Pan-European Emergency' },
  { region: 'Mental Health Crisis (US)', number: '988', desc: 'Suicide & Crisis Lifeline' },
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Save message locally / simulate institutional dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="bg-background text-foreground min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            Institutional Support & Partnerships
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Contact ManoMed AI
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Connect with our clinical engineering team, explore healthcare institutional partnerships, or submit technical feedback.
          </p>
        </div>

        {/* Emergency Alert Banner */}
        <div className="p-5 rounded-2xl bg-red-500/10 border-2 border-red-500/40 text-red-800 dark:text-red-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm">Experiencing a Medical Emergency?</h3>
              <p className="text-xs leading-relaxed opacity-90">
                ManoMed AI does not monitor contact form submissions for emergency dispatch. If you are experiencing sudden, severe chest pain, shortness of breath, or stroke signs, please contact emergency responders immediately.
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (typeof window !== 'undefined') window.location.href = 'tel:911';
            }}
            className="flex items-center gap-1.5 shrink-0 shadow"
          >
            <PhoneCall className="w-4 h-4" />
            Call 911 Now
          </Button>
        </div>

        {/* Main Grid: Form + Info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Contact Form */}
          <div className="md:col-span-7">
            <Card className="border-border shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Submit an Inquiry
                </CardTitle>
                <CardDescription className="text-xs">
                  Our clinical operations team reviews inquiries within 1 to 2 business days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="p-8 text-center space-y-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h3 className="text-xl font-bold text-foreground">Message Dispatched Successfully</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      Thank you for contacting ManoMed AI. A confirmation has been registered, and our support team will reach out to <strong>{email}</strong> shortly.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSubmitted(false);
                        setMessage('');
                        setSubject('');
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-name" className="text-xs font-medium">Your Name *</Label>
                        <Input
                          id="contact-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Dr. Jane Smith"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-email" className="text-xs font-medium">Email Address *</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="jane.smith@hospital.org"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-category" className="text-xs font-medium">Inquiry Type *</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger id="contact-category">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="clinical">Clinical / Hospital Partnership</SelectItem>
                            <SelectItem value="ehr">EHR / FHIR Integration</SelectItem>
                            <SelectItem value="technical">Technical Bug / Feedback</SelectItem>
                            <SelectItem value="privacy">Data Privacy & HIPAA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="contact-subject" className="text-xs font-medium">Subject *</Label>
                        <Input
                          id="contact-subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="Brief topic summary"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact-message" className="text-xs font-medium">Message *</Label>
                      <Textarea
                        id="contact-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Provide details about your inquiry, organizational background, or feedback..."
                        className="min-h-[130px] text-sm resize-y"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full font-semibold flex items-center justify-center gap-2 h-11"
                    >
                      {isSubmitting ? (
                        'Transmitting Inquiry...'
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Inquiry
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Institutional Channels & Emergency Numbers */}
          <div className="md:col-span-5 space-y-6">
            {/* Direct Departments */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Direct Institutional Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                    Clinical Partnerships & Trials
                  </span>
                  <p className="text-muted-foreground">partnerships@manomed.ai</p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                    Patient Support & General Help
                  </span>
                  <p className="text-muted-foreground">support@manomed.ai</p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-purple-600" />
                    Security & Data Governance
                  </span>
                  <p className="text-muted-foreground">compliance@manomed.ai</p>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Helplines */}
            <Card className="border-border shadow-sm bg-red-500/[0.03]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-red-600 dark:text-red-400">
                  <PhoneCall className="w-4 h-4" />
                  International Emergency Hotlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {emergencyNumbers.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-border/60 bg-card flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-foreground block">{item.region}</span>
                      <span className="text-[11px] text-muted-foreground">{item.desc}</span>
                    </div>
                    <span className="font-mono font-bold text-primary px-2 py-1 rounded bg-primary/10">
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
