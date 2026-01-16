import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportPDFOptions {
  contentRef: React.RefObject<HTMLDivElement>;
  fileName?: string;
}

/**
 * Export any content to PDF using html2canvas for 100% Vietnamese font support
 * This captures the content as high-resolution images to preserve all formatting
 */
export async function exportContentToPDF(options: ExportPDFOptions): Promise<void> {
  const { contentRef, fileName } = options;
  
  if (!contentRef?.current) {
    console.error('No content reference provided for PDF export');
    return;
  }

  try {
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;

    // Capture the content as high-resolution image
    const canvas = await html2canvas(contentRef.current, {
      scale: 2, // Higher resolution for better quality
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: true,
      // Ensure fonts are fully loaded
      onclone: (clonedDoc) => {
        // Apply any necessary styles to the cloned document
        const clonedContent = clonedDoc.body.querySelector('[data-pdf-content]');
        if (clonedContent) {
          (clonedContent as HTMLElement).style.padding = '20px';
        }
      }
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Calculate dimensions to fit in PDF
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height / canvas.width) * imgWidth;
    
    // If image height exceeds one page, split across multiple pages
    const maxHeightPerPage = pageHeight - 2 * margin;
    let remainingHeight = imgHeight;
    let sourceY = 0;
    let currentPage = 0;

    while (remainingHeight > 0) {
      if (currentPage > 0) {
        pdf.addPage();
      }

      // Calculate how much of the image to draw on this page
      const heightOnThisPage = Math.min(remainingHeight, maxHeightPerPage);
      
      // Calculate the portion of the source image to use
      const sourceHeightRatio = heightOnThisPage / imgHeight;
      const sourceHeight = canvas.height * sourceHeightRatio;
      
      // Create a temporary canvas for this page's portion
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = sourceHeight;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        tempCtx.drawImage(
          canvas,
          0, sourceY, // Source x, y
          canvas.width, sourceHeight, // Source width, height
          0, 0, // Destination x, y
          canvas.width, sourceHeight // Destination width, height
        );
        
        const pageImgData = tempCanvas.toDataURL('image/png', 1.0);
        pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, heightOnThisPage);
      }

      sourceY += sourceHeight;
      remainingHeight -= heightOnThisPage;
      currentPage++;
    }

    // Add footer on last page
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      'Future Me AI - He thong huong nghiep thong minh',
      margin,
      pageHeight - 5
    );

    // Save PDF
    const outputFileName = fileName || `FutureMeAI_KetQuaTest_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(outputFileName);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
}

/**
 * Legacy function - kept for compatibility but uses new method
 */
export async function exportTestResultsPDF(options: {
  hollandResults?: any;
  bigFiveResults?: any;
  hollandChartRef?: React.RefObject<HTMLDivElement>;
  bigFiveChartRef?: React.RefObject<HTMLDivElement>;
  aiAnalysis?: string;
  userName?: string;
  contentRef?: React.RefObject<HTMLDivElement>;
}): Promise<void> {
  // If contentRef is provided, use the new method
  if (options.contentRef) {
    return exportContentToPDF({
      contentRef: options.contentRef,
      fileName: `FutureMeAI_KetQuaTest_${new Date().toISOString().split('T')[0]}.pdf`
    });
  }
  
  // Fallback: Create a simple text-based PDF (ASCII only for compatibility)
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Header
  pdf.setFillColor(20, 184, 166);
  pdf.rect(0, 0, pageWidth, 35, 'F');
  pdf.setFontSize(20);
  pdf.setTextColor(255, 255, 255);
  pdf.text('Future Me AI - Ket Qua Test', margin, 22);
  
  yPos = 50;
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.text(`Ngay: ${new Date().toLocaleDateString('vi-VN')}`, margin, yPos);
  yPos += 15;

  // Holland Results
  if (options.hollandResults) {
    pdf.setFontSize(14);
    pdf.setTextColor(20, 184, 166);
    pdf.text('HOLLAND CODE', margin, yPos);
    yPos += 10;
    
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Ma Holland: ${options.hollandResults.topThree?.join('') || 'N/A'}`, margin, yPos);
    yPos += 8;

    const groups = ['R', 'I', 'A', 'S', 'E', 'C'];
    const groupNames: Record<string, string> = {
      R: 'Realistic (Ky thuat)',
      I: 'Investigative (Nghien cuu)',
      A: 'Artistic (Nghe thuat)',
      S: 'Social (Xa hoi)',
      E: 'Enterprising (Quan ly)',
      C: 'Conventional (Nghiep vu)',
    };
    
    for (const g of groups) {
      pdf.text(`  ${groupNames[g]}: ${options.hollandResults.percentages?.[g] || 0}%`, margin, yPos);
      yPos += 6;
    }
    yPos += 10;

    // Capture chart if available
    if (options.hollandChartRef?.current) {
      try {
        const canvas = await html2canvas(options.hollandChartRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 100;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;
        pdf.addImage(imgData, 'PNG', margin + 30, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 15;
      } catch (e) {
        console.error('Chart capture error:', e);
      }
    }
  }

  // Big Five Results
  if (options.bigFiveResults) {
    if (yPos > 200) {
      pdf.addPage();
      yPos = margin;
    }
    
    pdf.setFontSize(14);
    pdf.setTextColor(20, 184, 166);
    pdf.text('BIG FIVE (OCEAN)', margin, yPos);
    yPos += 10;
    
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);

    const traits = ['O', 'C', 'E', 'A', 'N'];
    const traitNames: Record<string, string> = {
      O: 'Openness (Co mo)',
      C: 'Conscientiousness (Tan tam)',
      E: 'Extraversion (Huong ngoai)',
      A: 'Agreeableness (De chiu)',
      N: 'Neuroticism (Nhay cam)',
    };
    
    for (const t of traits) {
      pdf.text(`  ${traitNames[t]}: ${options.bigFiveResults.percentages?.[t] || 0}%`, margin, yPos);
      yPos += 6;
    }
    yPos += 10;

    // Capture chart if available
    if (options.bigFiveChartRef?.current) {
      try {
        const canvas = await html2canvas(options.bigFiveChartRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 100;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;
        pdf.addImage(imgData, 'PNG', margin + 30, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 15;
      } catch (e) {
        console.error('Chart capture error:', e);
      }
    }
  }

  // AI Analysis - capture as image if available
  if (options.aiAnalysis) {
    if (yPos > 180) {
      pdf.addPage();
      yPos = margin;
    }
    
    pdf.setFontSize(14);
    pdf.setTextColor(20, 184, 166);
    pdf.text('PHAN TICH AI', margin, yPos);
    yPos += 10;
    
    pdf.setFontSize(9);
    pdf.setTextColor(80, 80, 80);
    
    // Convert to ASCII-safe text
    const safeText = options.aiAnalysis
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/[đ]/g, 'd')
      .replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A')
      .replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E')
      .replace(/[ÌÍỊỈĨ]/g, 'I')
      .replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O')
      .replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U')
      .replace(/[ỲÝỴỶỸ]/g, 'Y')
      .replace(/[Đ]/g, 'D')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '');
    
    const lines = pdf.splitTextToSize(safeText, pageWidth - 2 * margin);
    for (const line of lines) {
      if (yPos > 280) {
        pdf.addPage();
        yPos = margin;
      }
      pdf.text(line, margin, yPos);
      yPos += 4;
    }
  }

  pdf.save(`FutureMeAI_KetQuaTest_${new Date().toISOString().split('T')[0]}.pdf`);
}
