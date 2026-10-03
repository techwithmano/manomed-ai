import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CurrentAssessment } from "@/lib/assessment-store";

export async function exportClinicalReportPDF(assessment: CurrentAssessment): Promise<boolean> {
  const result = assessment.result;
  if (!result) return false;

  try {
    const doc = new jsPDF("portrait", "pt", "a4");
    const width = doc.internal.pageSize.getWidth();
    const margin = 40;
    let cursorY = 40;

    // Header Banner
    doc.setFillColor(30, 58, 138); // Clinical Deep Navy
    doc.rect(0, 0, width, 70, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("ManoMed AI - Clinical Triage Report", margin, 42);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated: ${new Date(result.timestamp).toLocaleDateString()} | ID: ${result.id}`,
      margin,
      58
    );

    cursorY = 90;

    // Patient Demographics Summary Table
    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["Patient Name", "Age", "Biological Sex", "Triage Classification"]],
      body: [
        [
          assessment.patient.name || "Anonymous",
          assessment.patient.age || "N/A",
          assessment.patient.gender || "N/A",
          `${result.triage.level} (${result.triage.timeframe})`,
        ],
      ],
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 15;

    // Reported Symptoms & Clinical Intake
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.text("Reported Symptoms & Clinical Intake", margin, cursorY);
    cursorY += 15;

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      body: [
        ["Chief Symptoms", assessment.symptoms.primaryDescription || "None"],
        ["Past History", assessment.medicalHistory || "None reported"],
        ["Medications", assessment.medications.join(", ") || "None reported"],
        ["Allergies", assessment.allergies.join(", ") || "None known"],
      ],
      theme: "grid",
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 110 } },
      styles: { fontSize: 8.5, cellPadding: 5 },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 15;

    // Red Flags Alert (if any)
    if (result.redFlags && result.redFlags.length > 0) {
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(margin, cursorY, width - margin * 2, 35, 4, 4, "FD");
      doc.setTextColor(185, 28, 28);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("CRITICAL RED-FLAG WARNINGS DETECTED:", margin + 10, cursorY + 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(result.redFlags.join("; "), margin + 10, cursorY + 28);
      cursorY += 45;
    }

    // Ranked Differential Diagnoses Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.text("Ranked Differential Diagnosis", margin, cursorY);
    cursorY += 15;

    const conditionRows = result.conditions.map((c) => [
      `${c.condition} ${c.icd10Hint ? `(${c.icd10Hint})` : ""}`,
      `${Math.round(c.likelihood * 100)}%`,
      c.riskLevel,
      c.supportingEvidence.join(", "),
    ]);

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["Condition", "Likelihood", "Risk Level", "Supporting Indicators"]],
      body: conditionRows,
      theme: "grid",
      headStyles: { fillColor: [30, 58, 138] },
      styles: { fontSize: 8.5, cellPadding: 6 },
      columnStyles: {
        0: { cellWidth: 150, fontStyle: "bold" },
        1: { cellWidth: 70, halign: "center" },
        2: { cellWidth: 70, halign: "center" },
      },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 15;

    // SOAP Note Section
    if (cursorY > 600) {
      doc.addPage();
      cursorY = 40;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.text("Clinical SOAP Documentation (EHR Formatted)", margin, cursorY);
    cursorY += 15;

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      body: [
        ["Subjective (S)", result.soapNote.subjective],
        ["Objective (O)", result.soapNote.objective],
        ["Assessment (A)", result.soapNote.assessment],
        ["Plan (P)", result.soapNote.plan],
      ],
      theme: "grid",
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 100 } },
      styles: { fontSize: 8, cellPadding: 5 },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 15;

    // Recommended Diagnostic Workup & Specialties
    if (cursorY > 680) {
      doc.addPage();
      cursorY = 40;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.text("Clinical Consultation & Workup Plan", margin, cursorY);
    cursorY += 15;

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      body: [
        ["Specialties to Consult", result.recommendedSpecialties.join(", ")],
        ["Suggested Diagnostic Tests", result.recommendedTests.join(", ")],
        ["Action Timeframe", result.triage.recommendedAction],
      ],
      theme: "grid",
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 140 } },
      styles: { fontSize: 8.5, cellPadding: 5 },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 15;

    // Doctor Questions
    if (cursorY > 680) {
      doc.addPage();
      cursorY = 40;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text("Key Inquiries to Discuss With Physician:", margin, cursorY);
    cursorY += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    result.questionsForDoctor.forEach((q) => {
      doc.text(`• ${q}`, margin + 10, cursorY);
      cursorY += 12;
    });

    // Disclaimer footer on all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${i} of ${totalPages} | ManoMed AI Clinical Decision Support | Educational Decision Tool (Not a formal diagnosis)`,
        width / 2,
        820,
        { align: "center" }
      );
    }

    // Save local file
    const safeName = (assessment.patient.name || "Patient").replace(/\s+/g, "_");
    doc.save(`ManoMed-AI-${safeName}-${new Date().toISOString().split("T")[0]}.pdf`);

    // Optional background email send
    try {
      const pdfBase64 = doc.output("datauristring").split(",")[1];
      if (assessment.patient.email) {
        await fetch("/api/send-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdfData: pdfBase64,
            patientName: assessment.patient.name,
            patientEmail: assessment.patient.email,
          }),
        });
      }
    } catch {
      // Background email send is optional
    }

    return true;
  } catch (err) {
    console.error("PDF generation failed:", err);
    return false;
  }
}
