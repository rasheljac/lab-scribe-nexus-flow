
import jsPDF from 'jspdf';

export interface ProtocolPDFData {
  title: string;
  description?: string;
  content: string;
  category: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// Helper function to convert Unicode special characters to readable text
const normalizeSpecialCharacters = (text: string): string => {
  if (!text) return '';
  
  // Handle superscript characters
  const superscriptMap: { [key: string]: string } = {
    '⁰': '^0', '¹': '^1', '²': '^2', '³': '^3', '⁴': '^4', '⁵': '^5',
    '⁶': '^6', '⁷': '^7', '⁸': '^8', '⁹': '^9', '⁺': '^+', '⁻': '^-'
  };
  
  // Handle subscript characters
  const subscriptMap: { [key: string]: string } = {
    '₀': '_0', '₁': '_1', '₂': '_2', '₃': '_3', '₄': '_4', '₅': '_5',
    '₆': '_6', '₇': '_7', '₈': '_8', '₉': '_9', '₊': '_+', '₋': '_-'
  };
  
  // Handle other special characters
  const specialCharMap: { [key: string]: string } = {
    '°': ' degrees',
    'α': 'alpha',
    'β': 'beta',
    'γ': 'gamma',
    'δ': 'delta',
    'ε': 'epsilon',
    'μ': 'micro',
    '≤': '<=',
    '≥': '>=',
    '±': '+/-',
    '×': 'x',
    '÷': '/',
    '∞': 'infinity',
    '∑': 'sum',
    '∆': 'delta',
    '∫': 'integral',
    '∏': 'product',
    '√': 'sqrt',
    '∝': 'proportional to',
    '≈': 'approximately',
    '≠': 'not equal',
    '≡': 'equivalent',
    '∈': 'element of',
    '∉': 'not element of',
    '⊂': 'subset of',
    '⊃': 'superset of',
    '∪': 'union',
    '∩': 'intersection',
    '∅': 'empty set',
    '℃': 'C',
    '℉': 'F',
    '™': '(TM)',
    '®': '(R)',
    '©': '(C)',
    '§': 'section',
    '¶': 'paragraph',
    '†': 'dagger',
    '‡': 'double dagger',
    '•': '* ',
    '–': '-',
    '—': '--',
    ''': "'",
    ''': "'",
    '"': '"',
    '"': '"',
    '…': '...',
    '‰': 'per mille',
    '‱': 'per ten thousand'
  };
  
  let normalizedText = text;
  
  // Replace superscript characters
  Object.entries(superscriptMap).forEach(([unicode, replacement]) => {
    normalizedText = normalizedText.replace(new RegExp(unicode, 'g'), replacement);
  });
  
  // Replace subscript characters
  Object.entries(subscriptMap).forEach(([unicode, replacement]) => {
    normalizedText = normalizedText.replace(new RegExp(unicode, 'g'), replacement);
  });
  
  // Replace other special characters
  Object.entries(specialCharMap).forEach(([unicode, replacement]) => {
    normalizedText = normalizedText.replace(new RegExp(unicode, 'g'), replacement);
  });
  
  // Handle remaining non-ASCII characters by removing or replacing them
  normalizedText = normalizedText.replace(/[^\x00-\x7F]/g, (match) => {
    // Log unhandled characters for future improvement
    console.warn('Unhandled special character in PDF export:', match, 'Unicode:', match.charCodeAt(0));
    return '?'; // Replace with question mark as fallback
  });
  
  return normalizedText;
};

// Helper function to process text content for PDF compatibility
export const processPDFText = (text: string): string => {
  if (!text) return '';
  
  // First normalize special characters
  let processedText = normalizeSpecialCharacters(text);
  
  // Clean up any HTML entities that might remain
  processedText = processedText
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&cent;/g, 'cent')
    .replace(/&pound;/g, 'pound')
    .replace(/&yen;/g, 'yen')
    .replace(/&euro;/g, 'euro')
    .replace(/&copy;/g, '(C)')
    .replace(/&reg;/g, '(R)');
  
  // Clean up multiple spaces and normalize whitespace
  processedText = processedText
    .replace(/\s+/g, ' ')
    .trim();
  
  return processedText;
};

export const addLogoToPDF = async (pdf: jsPDF, pageWidth: number, margin: number): Promise<number> => {
  try {
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      logo.onload = resolve;
      logo.onerror = reject;
      logo.src = '/lovable-uploads/305ae0c2-f9ba-42cc-817b-eda518f05406.png';
    });

    const logoAspectRatio = logo.width / logo.height;
    const maxLogoWidth = 40;
    const maxLogoHeight = 20;
    
    let logoWidth = maxLogoWidth;
    let logoHeight = logoWidth / logoAspectRatio;
    
    if (logoHeight > maxLogoHeight) {
      logoHeight = maxLogoHeight;
      logoWidth = logoHeight * logoAspectRatio;
    }

    pdf.addImage(logo, 'PNG', pageWidth - margin - logoWidth, margin, logoWidth, logoHeight);
    return logoHeight + 10;
  } catch (error) {
    console.warn('Could not load logo for PDF export:', error);
    return 10;
  }
};

export const addMetadataSection = (
  pdf: jsPDF, 
  protocol: ProtocolPDFData, 
  margin: number, 
  contentWidth: number,
  startY: number
): number => {
  let currentY = startY;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  
  const metadata = [
    `Category: ${processPDFText(protocol.category.charAt(0).toUpperCase() + protocol.category.slice(1))}`,
    `Version: v${protocol.version}`,
    `Created: ${new Date(protocol.createdAt).toLocaleDateString()}`,
    `Updated: ${new Date(protocol.updatedAt).toLocaleDateString()}`
  ];
  
  metadata.forEach(line => {
    pdf.text(line, margin, currentY);
    currentY += 4;
  });
  
  return currentY + 8;
};

export const addFooter = (pdf: jsPDF, pageWidth: number, pageHeight: number, margin: number): void => {
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text('Generated by Kapelczak Lab Management System', margin, pageHeight - 10);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
  }
};
