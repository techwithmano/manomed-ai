import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, FileText, ChevronRight, CheckCircle2 } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background text-foreground min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-foreground transition-colors">
              Clinical Portal
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span className="font-semibold text-foreground">Data Governance & Privacy Policy</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Lock className="w-3.5 h-3.5" />
            <span>GDPR & HIPAA Standards</span>
          </div>
        </div>

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <ShieldCheck className="w-4 h-4" />
            Patient Data Governance
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-foreground">
            ManoMed AI Clinical Privacy Policy
          </h1>
          <p className="text-xs font-mono text-muted-foreground">
            EFFECTIVE DATE: OCTOBER 2026 • REVISION 4.1
          </p>
        </div>

        {/* Institutional Summary Callout */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">
            Summary of Data Ethics & Covenant
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                Zero Commercial Data Sales
              </span>
              <p className="text-muted-foreground leading-relaxed">
                Health inputs and patient identifiers are never sold, rented, or distributed to advertisers or data brokers.
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                Client-Side Vault Storage
              </span>
              <p className="text-muted-foreground leading-relaxed">
                Evaluation history is held locally within your device browser storage, giving you instant 1-click purge control.
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                Transient Encrypted Inference
              </span>
              <p className="text-muted-foreground leading-relaxed">
                All transmissions for AI clinical reasoning utilize TLS 1.3 encryption with strict session minimization.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Articles */}
        <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-foreground">
              1. Information Collected During Assessment
            </h2>
            <p className="text-muted-foreground">
              When utilizing the ManoMed AI clinical symptom intake and dynamic questionnaire workflows, the system processes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
              <li><strong className="text-foreground">Patient Baseline Attributes:</strong> Name, age in years, and biological sex required for calibrating differential epidemiology.</li>
              <li><strong className="text-foreground">Chief Complaints & Anatomical Data:</strong> Primary symptom narrative, affected body system zones, severity rating (0–10 NRS), and temporal onset characteristics.</li>
              <li><strong className="text-foreground">Objective Clinical Vitals (Optional):</strong> Blood pressure, resting heart rate, body temperature, and pulse oximetry (SpO2).</li>
              <li><strong className="text-foreground">Pharmacotherapy & Allergy Profile:</strong> Active medications and documented drug allergies used exclusively for real-time contraindication screening.</li>
              <li><strong className="text-foreground">Differential Questionnaire Responses:</strong> Answers provided to diagnostic follow-up questions formulated by the triage model.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-border/60 pt-6">
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-foreground">
              2. Purpose of Processing & Clinical Inference
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Data collected during an assessment session is utilized exclusively to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
              <li>Formulate calibrated differential condition probabilities based on clinical taxonomy and ICD-10 codification.</li>
              <li>Assign stratified triage urgency tiers (Emergency, Urgent, Routine, Self-Care) according to emergency medical protocols.</li>
              <li>Synthesize Electronic Health Record (EHR) SOAP documentation (Subjective, Objective, Assessment, Plan) and clinical workup checklists for your physician.</li>
              <li>Flag immediate emergency red flags (e.g. acute coronary syndromes, stroke indicators, pulmonary compromise).</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-border/60 pt-6">
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-foreground">
              3. Client-Side Vault & Data Retention
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              ManoMed AI operates with a privacy-first local storage architecture. Completed evaluations are stored on your local device via encrypted browser storage. You can view, search, export to PDF, or permanently erase individual records or the entire vault at any time via the{" "}
              <Link href="/history" className="text-primary underline">
                Audit Vault
              </Link>
              . We do not store persistent patient health dossiers on public centralized databases.
            </p>
          </section>

          <section className="space-y-3 border-t border-border/60 pt-6">
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-foreground">
              4. Patient Rights (GDPR & CCPA Alignment)
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              In accordance with international privacy legislation, including the EU General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), you retain the following rights:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3.5 rounded-xl bg-card border border-border">
                <strong className="text-foreground block mb-0.5">Right to Access & Portability</strong>
                <span className="text-muted-foreground">Export your comprehensive clinical records in standard PDF format at any time.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-card border border-border">
                <strong className="text-foreground block mb-0.5">Right to Erasure (To Be Forgotten)</strong>
                <span className="text-muted-foreground">Instantly wipe all local audit trails using the 1-click Clear Vault command.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-card border border-border">
                <strong className="text-foreground block mb-0.5">Right to Rectification</strong>
                <span className="text-muted-foreground">Edit questionnaire responses during the pre-synthesis review modal before final evaluation.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-card border border-border">
                <strong className="text-foreground block mb-0.5">Right to Non-Discrimination</strong>
                <span className="text-muted-foreground">Access all clinical triage capabilities freely without account registration or tracking cookies.</span>
              </div>
            </div>
          </section>

          <section className="space-y-3 border-t border-border/60 pt-6">
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-foreground">
              5. Governance Officer & Contact
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              For regulatory inquiries, compliance certifications, or institutional audit requests, contact our Data Governance Officer at:
            </p>
            <div className="p-4 rounded-xl bg-muted/40 border border-border font-mono text-xs space-y-1">
              <p><strong className="text-foreground">Email:</strong> compliance@manomed.ai</p>
              <p><strong className="text-foreground">Division:</strong> Data Governance & Regulatory Compliance, ManoMed AI Clinical Systems</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
