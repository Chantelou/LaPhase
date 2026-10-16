import { jsPDF } from "jspdf";

export interface PDFExportOptions {
  title: string;
  subtitle?: string;
  category?: string;
  studentName?: string;
  content: string;
  filename?: string;
}

export function exportToPDF({
  title,
  subtitle,
  category = "Fiche d'étude",
  studentName,
  content,
  filename,
}: PDFExportOptions): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const maxLineWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Header Banner
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, pageWidth, 24, "F");

  // Header Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("ERICK AI — Assistant Pédagogique", margin, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(224, 231, 255); // Indigo 100
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`${category} • Généré le ${dateStr}`, margin, 18);

  if (studentName) {
    const studentTag = `Étudiant : ${studentName}`;
    const textWidth = doc.getTextWidth(studentTag);
    doc.text(studentTag, pageWidth - margin - textWidth, 18);
  }

  currentY = 34;

  // Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate 900
  const splitTitle = doc.splitTextToSize(title, maxLineWidth);
  doc.text(splitTitle, margin, currentY);
  currentY += splitTitle.length * 7 + 2;

  // Subtitle / Topic if provided
  if (subtitle) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    const splitSub = doc.splitTextToSize(subtitle, maxLineWidth);
    doc.text(splitSub, margin, currentY);
    currentY += splitSub.length * 5 + 4;
  }

  // Thin line divider
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;

  // Process text lines (handling markdown headers, bullet points, code, and bold tags)
  const rawLines = content.split("\n");

  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      doc.addPage();
      currentY = margin + 5;
      // Re-add top mini-bar on new pages
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, currentY - 5, maxLineWidth, 1, "F");
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i].trim();
    if (!line) {
      currentY += 3;
      continue;
    }

    // Level 1 Markdown Header (# ...)
    if (line.startsWith("# ")) {
      addNewPageIfNeeded(14);
      currentY += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(67, 56, 202); // Indigo 700
      const cleanHeader = line.replace(/^#\s+/, "");
      const lines = doc.splitTextToSize(cleanHeader, maxLineWidth);
      doc.text(lines, margin, currentY);
      currentY += lines.length * 6 + 2;
      continue;
    }

    // Level 2 Markdown Header (## ...)
    if (line.startsWith("## ")) {
      addNewPageIfNeeded(12);
      currentY += 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(30, 41, 59); // Slate 800
      const cleanHeader = line.replace(/^##\s+/, "");
      const lines = doc.splitTextToSize(cleanHeader, maxLineWidth);
      doc.text(lines, margin, currentY);
      currentY += lines.length * 5.5 + 2;
      continue;
    }

    // Level 3 Markdown Header (### ...)
    if (line.startsWith("### ")) {
      addNewPageIfNeeded(10);
      currentY += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(71, 85, 105); // Slate 600
      const cleanHeader = line.replace(/^###\s+/, "");
      const lines = doc.splitTextToSize(cleanHeader, maxLineWidth);
      doc.text(lines, margin, currentY);
      currentY += lines.length * 5 + 1;
      continue;
    }

    // Bullet points (- or * or numbered list)
    const isBullet = line.startsWith("- ") || line.startsWith("* ");
    const isNumberList = /^\d+[\.\)]\s/.test(line);

    if (isBullet || isNumberList) {
      addNewPageIfNeeded(7);
      const cleanText = line.replace(/^[-*]\s+/, "").replace(/^\d+[\.\)]\s+/, "");
      // Remove double asterisks
      const strippedText = cleanText.replace(/\*\*(.*?)\*\*/g, "$1");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85); // Slate 700

      // Bullet symbol or number
      const prefix = isBullet ? "•" : line.match(/^\d+[\.\)]/)?.[0] || "•";
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      doc.text(prefix, margin + 2, currentY);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const wrapped = doc.splitTextToSize(strippedText, maxLineWidth - 8);
      doc.text(wrapped, margin + 8, currentY);
      currentY += wrapped.length * 4.6 + 1.5;
      continue;
    }

    // Blockquote or Callout (> ...)
    if (line.startsWith(">")) {
      addNewPageIfNeeded(10);
      const cleanText = line.replace(/^>\s*/, "").replace(/\*\*(.*?)\*\*/g, "$1");
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);

      const wrapped = doc.splitTextToSize(cleanText, maxLineWidth - 10);
      const blockHeight = wrapped.length * 4.5 + 4;

      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY - 2, maxLineWidth, blockHeight, "F");
      doc.setFillColor(79, 70, 229);
      doc.rect(margin, currentY - 2, 2, blockHeight, "F");

      doc.text(wrapped, margin + 6, currentY + 2);
      currentY += blockHeight + 2;
      continue;
    }

    // Standard paragraph text
    const cleanParagraph = line.replace(/\*\*(.*?)\*\*/g, "$1");
    addNewPageIfNeeded(7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);

    const wrapped = doc.splitTextToSize(cleanParagraph, maxLineWidth);
    doc.text(wrapped, margin, currentY);
    currentY += wrapped.length * 4.6 + 2;
  }

  // Add Page Numbers in Footer
  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(
      `Erick AI — Votre assistant d'études personnalisé • Page ${page} sur ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  const safeFilename =
    (filename || title || "erick-ai-etude")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40) + ".pdf";

  doc.save(safeFilename);
}
