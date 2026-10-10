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

/**
 * Export Clinical Laboratory Pathology & Blood Work Report as PDF
 */
export async function exportLabReportPDF(
  labData: any,
  patientName = "Anonymous Patient",
  patientAge = "N/A",
  panelType = "Laboratory Workup"
): Promise<boolean> {
  if (!labData) return false;

  try {
    const doc = new jsPDF("portrait", "pt", "a4");
    const width = doc.internal.pageSize.getWidth();
    const margin = 40;
    let cursorY = 40;

    // Header Banner
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, width, 70, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("ManoMed AI - Clinical Laboratory Report", margin, 42);

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated: ${new Date().toLocaleDateString()} | Panel: ${panelType} | ID: ${labData.id || "LAB-" + Date.now().toString().slice(-6)}`,
      margin,
      58
    );

    cursorY = 90;

    // Patient Demographics Summary Table
    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["Patient Name", "Age", "Panel Examined", "Triage Classification"]],
      body: [
        [
          patientName,
          patientAge,
          panelType,
          `${labData.overallStatus || "NORMAL"} (${labData.triageUrgency || "ROUTINE"})`,
        ],
      ],
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9 },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 15;

    // Critical Alerts Banner (if any)
    if (labData.criticalAlerts && labData.criticalAlerts.length > 0) {
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(margin, cursorY, width - margin * 2, 35, 4, 4, "FD");
      doc.setTextColor(185, 28, 28);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("CRITICAL LABORATORY ALERTS:", margin + 10, cursorY + 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(labData.criticalAlerts.join("; "), margin + 10, cursorY + 28);
      cursorY += 45;
    }

    // Laboratory Parameter Breakdown Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Analyzed Laboratory Parameters & Reference Ranges", margin, cursorY);
    cursorY += 14;

    const paramRows = (labData.analyzedParameters || []).map((p: any) => [
      p.name,
      `${p.value} ${p.unit || ""}`,
      p.referenceRange || "Normal Range",
      p.flag || "NORMAL",
      p.interpretation || "",
    ]);

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["Test Parameter", "Observed Value", "Reference Range", "Status", "Clinical Meaning"]],
      body: paramRows,
      theme: "grid",
      headStyles: { fillColor: [30, 58, 138] },
      styles: { fontSize: 8, cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 100 },
        1: { cellWidth: 70, halign: "center" },
        2: { cellWidth: 80, halign: "center" },
        3: { cellWidth: 65, halign: "center", fontStyle: "bold" },
        4: { cellWidth: 200 },
      },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 15;

    // Dual-Perspective Summaries
    if (cursorY > 600) {
      doc.addPage();
      cursorY = 40;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Clinical Synthesis & Patient Guidance", margin, cursorY);
    cursorY += 14;

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      body: [
        ["Patient Summary (Plain Language)", labData.plainLanguageSummary || "All parameters evaluated."],
        ["Physician Synthesis (Technical)", labData.clinicalPhysicianSynthesis || "No abnormal pathologies noted."],
      ],
      theme: "grid",
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 120 } },
      styles: { fontSize: 8.5, cellPadding: 6 },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 15;

    // Differential Diagnoses (if present)
    if (labData.differentialDiagnoses && labData.differentialDiagnoses.length > 0) {
      if (cursorY > 660) {
        doc.addPage();
        cursorY = 40;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Associated Differential Considerations", margin, cursorY);
      cursorY += 12;

      const diffRows = labData.differentialDiagnoses.map((d: any) => [
        `${d.condition} ${d.icd10Hint ? `(${d.icd10Hint})` : ""}`,
        `${Math.round((d.likelihood || 0) * 100)}%`,
        d.rationale,
      ]);

      autoTable(doc, {
        startY: cursorY,
        margin: { left: margin, right: margin },
        head: [["Condition", "Likelihood", "Clinical Rationale"]],
        body: diffRows,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8, cellPadding: 5 },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 140 },
          1: { cellWidth: 60, halign: "center" },
        },
      });
      cursorY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Questions for Doctor
    if (labData.questionsForDoctor && labData.questionsForDoctor.length > 0) {
      if (cursorY > 680) {
        doc.addPage();
        cursorY = 40;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Questions to Review With Attending Physician:", margin, cursorY);
      cursorY += 12;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      labData.questionsForDoctor.forEach((q: string) => {
        doc.text(`• ${q}`, margin + 10, cursorY);
        cursorY += 12;
      });
    }

    // Disclaimer footer on all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${i} of ${totalPages} | ManoMed AI Clinical Laboratory Decision Support | Educational Decision Tool`,
        width / 2,
        820,
        { align: "center" }
      );
    }

    const safePatient = patientName.replace(/\s+/g, "_");
    doc.save(`ManoMed-LabReport-${safePatient}-${new Date().toISOString().split("T")[0]}.pdf`);
    return true;
  } catch (err) {
    console.error("Lab PDF export failed:", err);
    return false;
  }
}

/**
 * Export Clinical Radiograph / X-Ray Interpretation Report as PDF
 */
export async function exportXRayReportPDF(
  xrayData: any,
  patientName = "Anonymous Patient",
  patientAge = "N/A",
  region = "Radiograph"
): Promise<boolean> {
  if (!xrayData) return false;

  try {
    const doc = new jsPDF("portrait", "pt", "a4");
    const width = doc.internal.pageSize.getWidth();
    const margin = 40;
    let cursorY = 40;

    // Header Banner
    doc.setFillColor(15, 23, 42); // Slate 900 PACS Header
    doc.rect(0, 0, width, 70, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("ManoMed AI - Diagnostic Radiology Report", margin, 42);

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Date: ${new Date().toLocaleDateString()} | Region: ${region.toUpperCase()} | ID: ${xrayData.id || "XR-" + Date.now().toString().slice(-6)}`,
      margin,
      58
    );

    cursorY = 90;

    // Examination & Demographics Table
    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["Patient Name", "Age", "Examination Modality", "Urgency Status"]],
      body: [
        [
          patientName,
          patientAge,
          xrayData.examinationType || `Diagnostic Radiograph (${region})`,
          xrayData.urgency || "ROUTINE",
        ],
      ],
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9 },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 15;

    // Critical Alerts (if any)
    if (xrayData.criticalAlerts && xrayData.criticalAlerts.length > 0) {
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(margin, cursorY, width - margin * 2, 35, 4, 4, "FD");
      doc.setTextColor(185, 28, 28);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("RADIOLOGICAL CRITICAL ALERTS:", margin + 10, cursorY + 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(xrayData.criticalAlerts.join("; "), margin + 10, cursorY + 28);
      cursorY += 45;
    }

    // Anatomical Findings Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Anatomical Findings & Structural Evaluation", margin, cursorY);
    cursorY += 14;

    const findingRows = (xrayData.anatomicalFindings || []).map((f: any) => [
      f.structure,
      f.abnormalityDetected ? "Abnormal" : "Normal",
      f.severity || "None",
      f.observation,
    ]);

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["Anatomical Structure", "State", "Severity", "Radiological Observation"]],
      body: findingRows,
      theme: "grid",
      headStyles: { fillColor: [30, 58, 138] },
      styles: { fontSize: 8, cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 120 },
        1: { cellWidth: 60, halign: "center" },
        2: { cellWidth: 60, halign: "center" },
        3: { cellWidth: 275 },
      },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 15;

    // Impression & Synthesis
    if (cursorY > 600) {
      doc.addPage();
      cursorY = 40;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Diagnostic Impression & Physician Notes", margin, cursorY);
    cursorY += 14;

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      body: [
        ["Radiological Impression", xrayData.radiologicalImpression || "Examination completed without acute osseous or parenchymal pathology."],
        ["Physician Guidance", xrayData.clinicalPhysicianNotes || "Correlate with clinical exam and vitals."],
        ["Patient Summary (Plain English)", xrayData.plainLanguageExplanation || "Your scan has been analyzed."],
      ],
      theme: "grid",
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 130 } },
      styles: { fontSize: 8.5, cellPadding: 6 },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 15;

    // Differential Diagnoses (if any)
    if (xrayData.differentialDiagnoses && xrayData.differentialDiagnoses.length > 0) {
      if (cursorY > 660) {
        doc.addPage();
        cursorY = 40;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Differential Diagnoses", margin, cursorY);
      cursorY += 12;

      const diffRows = xrayData.differentialDiagnoses.map((d: any) => [
        d.condition,
        `${Math.round((d.likelihood || 0) * 100)}%`,
        d.rationale,
      ]);

      autoTable(doc, {
        startY: cursorY,
        margin: { left: margin, right: margin },
        head: [["Condition", "Likelihood", "Radiological Rationale"]],
        body: diffRows,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8, cellPadding: 5 },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 140 },
          1: { cellWidth: 60, halign: "center" },
        },
      });
      cursorY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Recommended Next Steps & Questions
    if (xrayData.questionsForDoctor && xrayData.questionsForDoctor.length > 0) {
      if (cursorY > 680) {
        doc.addPage();
        cursorY = 40;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Questions to Ask Your Doctor:", margin, cursorY);
      cursorY += 12;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      xrayData.questionsForDoctor.forEach((q: string) => {
        doc.text(`• ${q}`, margin + 10, cursorY);
        cursorY += 12;
      });
    }

    // Disclaimer footer on all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${i} of ${totalPages} | ManoMed AI Diagnostic Radiology Decision Support | Educational Decision Tool`,
        width / 2,
        820,
        { align: "center" }
      );
    }

    const safePatient = patientName.replace(/\s+/g, "_");
    doc.save(`ManoMed-XRayReport-${safePatient}-${new Date().toISOString().split("T")[0]}.pdf`);
    return true;
  } catch (err) {
    console.error("X-Ray PDF export failed:", err);
    return false;
  }
}

