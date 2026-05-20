import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const CRITERIA_LABELS = {
  task_achievement: "Task Achievement",
  coherence_cohesion: "Coherence & Cohesion",
  lexical_resource: "Lexical Resource",
  grammar: "Grammar",
};

/**
 * Export analysis result to a PDF report.
 * @param {{ result, answer, chartType, promptTitle, wordCount }} params
 */
export default function exportResultToPDF({
  result,
  answer,
  chartType,
  promptTitle,
  wordCount,
}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Helper: add text and advance y
  const addText = (text, x, size = 10, style = "normal") => {
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
    const lines = doc.splitTextToSize(text, pageWidth - x - 15);
    doc.text(lines, x, y);
    y += lines.length * (size * 0.5) + 4;
  };

  const checkPageBreak = (needed = 30) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }
  };

  // --- Header ---
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(79, 70, 229); // indigo-600
  doc.text("IELTS Writing Task 1 Report", 15, y);
  y += 10;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128); // gray-500
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "full" })}`,
    15,
    y,
  );
  y += 8;

  // --- Metadata ---
  doc.setDrawColor(229, 231, 235); // gray-200
  doc.line(15, y, pageWidth - 15, y);
  y += 8;

  doc.setTextColor(55, 65, 81); // gray-700
  addText(`Prompt: ${promptTitle || "N/A"}`, 15, 10, "bold");
  addText(
    `Chart Type: ${chartType || "N/A"}  |  Word Count: ${wordCount || 0}`,
    15,
    9,
  );
  y += 4;

  // --- Band Scores ---
  const bs = result.band_score || {};
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(55, 65, 81);
  doc.text("Band Scores", 15, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Criterion", "Score"]],
    body: [
      ["Task Achievement", bs.task_achievement?.toFixed(1) || "-"],
      ["Coherence & Cohesion", bs.coherence_cohesion?.toFixed(1) || "-"],
      ["Lexical Resource", bs.lexical_resource?.toFixed(1) || "-"],
      ["Grammar", bs.grammar?.toFixed(1) || "-"],
      ["Overall", bs.overall?.toFixed(1) || "-"],
    ],
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: "center", fontStyle: "bold" } },
    margin: { left: 15, right: 15 },
  });
  y = doc.lastAutoTable.finalY + 10;

  // --- Original Answer ---
  checkPageBreak(40);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(55, 65, 81);
  doc.text("Your Answer", 15, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  const answerLines = doc.splitTextToSize(answer || "", pageWidth - 30);
  for (const line of answerLines) {
    checkPageBreak(6);
    doc.text(line, 15, y);
    y += 4.5;
  }
  y += 8;

  // --- Criteria Feedback ---
  if (result.criteria_feedback) {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(55, 65, 81);
    doc.text("Detailed Feedback", 15, y);
    y += 8;

    for (const [key, label] of Object.entries(CRITERIA_LABELS)) {
      const fb = result.criteria_feedback[key];
      if (!fb) continue;

      checkPageBreak(30);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      doc.text(`${label} (${fb.score?.toFixed(1) || "-"})`, 15, y);
      y += 5;

      if (fb.issues?.length) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(220, 38, 38); // red-600
        for (const issue of fb.issues) {
          checkPageBreak(6);
          doc.text(`• ${issue}`, 18, y);
          y += 4.5;
        }
      }

      if (fb.fixes?.length) {
        doc.setTextColor(22, 163, 74); // green-600
        for (const fix of fb.fixes) {
          checkPageBreak(6);
          doc.text(`→ ${fix}`, 18, y);
          y += 4.5;
        }
      }
      y += 4;
    }
  }

  // --- Grammar Errors ---
  if (result.grammar_errors?.length) {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(55, 65, 81);
    doc.text("Grammar Errors", 15, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Error", "Fix", "Rule"]],
      body: result.grammar_errors.map((e) => [e.error, e.fix, e.rule]),
      theme: "grid",
      headStyles: { fillColor: [220, 38, 38], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 15, right: 15 },
      columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: 55 } },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // --- Vocabulary Issues ---
  if (result.vocabulary_issues?.length) {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(55, 65, 81);
    doc.text("Vocabulary Issues", 15, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Issue", "Fix", "Rule"]],
      body: result.vocabulary_issues.map((v) => [v.issue, v.fix, v.rule]),
      theme: "grid",
      headStyles: { fillColor: [249, 115, 22], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 15, right: 15 },
      columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: 55 } },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // --- Strengths & Weaknesses ---
  if (result.strengths?.length || result.weaknesses?.length) {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(55, 65, 81);
    doc.text("Strengths & Weaknesses", 15, y);
    y += 6;

    if (result.strengths?.length) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(22, 163, 74);
      for (const s of result.strengths) {
        checkPageBreak(6);
        doc.text(`+ ${s}`, 18, y);
        y += 4.5;
      }
    }
    if (result.weaknesses?.length) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(217, 119, 6); // amber-600
      for (const w of result.weaknesses) {
        checkPageBreak(6);
        doc.text(`- ${w}`, 18, y);
        y += 4.5;
      }
    }
    y += 6;
  }

  // --- Suggestions ---
  if (result.suggestions?.length) {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(55, 65, 81);
    doc.text("Suggestions", 15, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(59, 130, 246); // blue-500
    for (const s of result.suggestions) {
      checkPageBreak(6);
      doc.text(`• ${s}`, 18, y);
      y += 4.5;
    }
  }

  // --- Save ---
  const filename = `ielts-report-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}
