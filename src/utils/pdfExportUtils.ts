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
  
  console.log('Processing text for PDF:', text);
  
  // Handle superscript characters - process in order of specificity
  const superscriptMap: { [key: string]: string } = {
    // Common superscript sequences first (most specific patterns)
    '²⁺': '^2+',
    '³⁺': '^3+',
    '⁴⁺': '^4+',
    '⁵⁺': '^5+',
    '⁶⁺': '^6+',
    '²⁻': '^2-',
    '³⁻': '^3-',
    '⁴⁻': '^4-',
    '⁵⁻': '^5-',
    '⁶⁻': '^6-',
    
    // Individual superscript characters
    '⁰': '^0',
    '¹': '^1', 
    '²': '^2', 
    '³': '^3', 
    '⁴': '^4', 
    '⁵': '^5',
    '⁶': '^6', 
    '⁷': '^7', 
    '⁸': '^8', 
    '⁹': '^9', 
    '⁺': '^+', 
    '⁻': '^-',
    
    // Superscript letters
    'ᵃ': '^a',
    'ᵇ': '^b',
    'ᶜ': '^c',
    'ᵈ': '^d',
    'ᵉ': '^e',
    'ᶠ': '^f',
    'ᵍ': '^g',
    'ʰ': '^h',
    'ⁱ': '^i',
    'ʲ': '^j',
    'ᵏ': '^k',
    'ˡ': '^l',
    'ᵐ': '^m',
    'ⁿ': '^n',
    'ᵒ': '^o',
    'ᵖ': '^p',
    'ʳ': '^r',
    'ˢ': '^s',
    'ᵗ': '^t',
    'ᵘ': '^u',
    'ᵛ': '^v',
    'ʷ': '^w',
    'ˣ': '^x',
    'ʸ': '^y',
    'ᶻ': '^z'
  };
  
  // Handle subscript characters
  const subscriptMap: { [key: string]: string } = {
    // Common chemical formulas (most specific first)
    'H₂O': 'H_2O',
    'CO₂': 'CO_2',
    'H₂SO₄': 'H_2SO_4',
    'CaCO₃': 'CaCO_3',
    'NaCl': 'NaCl',
    'H₂': 'H_2',
    'O₂': 'O_2',
    'N₂': 'N_2',
    'SO₄': 'SO_4',
    'PO₄': 'PO_4',
    'NO₃': 'NO_3',
    'NH₃': 'NH_3',
    'CH₄': 'CH_4',
    
    // Individual subscript characters
    '₀': '_0', 
    '₁': '_1', 
    '₂': '_2', 
    '₃': '_3', 
    '₄': '_4', 
    '₅': '_5',
    '₆': '_6', 
    '₇': '_7', 
    '₈': '_8', 
    '₉': '_9', 
    '₊': '_+', 
    '₋': '_-',
    
    // Subscript letters
    'ₐ': '_a',
    'ₑ': '_e',
    'ₕ': '_h',
    'ₖ': '_k',
    'ₗ': '_l',
    'ₘ': '_m',
    'ₙ': '_n',
    'ₒ': '_o',
    'ₚ': '_p',
    'ᵣ': '_r',
    'ₛ': '_s',
    'ₜ': '_t',
    'ᵤ': '_u',
    'ᵥ': '_v',
    'ₓ': '_x'
  };
  
  // Handle other special characters including Greek letters and symbols
  const specialCharMap: { [key: string]: string } = {
    // Temperature and degrees
    '°C': ' degrees C',
    '°F': ' degrees F',
    '℃': ' degrees C',
    '℉': ' degrees F',
    '°': ' degrees',
    
    // Greek letters (commonly used in science)
    'α': 'alpha',
    'β': 'beta',
    'γ': 'gamma',
    'δ': 'delta',
    'ε': 'epsilon',
    'ζ': 'zeta',
    'η': 'eta',
    'θ': 'theta',
    'ι': 'iota',
    'κ': 'kappa',
    'λ': 'lambda',
    'μ': 'micro',
    'ν': 'nu',
    'ξ': 'xi',
    'ο': 'omicron',
    'π': 'pi',
    'ρ': 'rho',
    'σ': 'sigma',
    'τ': 'tau',
    'υ': 'upsilon',
    'φ': 'phi',
    'χ': 'chi',
    'ψ': 'psi',
    'ω': 'omega',
    
    // Capital Greek letters
    'Α': 'Alpha',
    'Β': 'Beta',
    'Γ': 'Gamma',
    'Δ': 'Delta',
    'Ε': 'Epsilon',
    'Ζ': 'Zeta',
    'Η': 'Eta',
    'Θ': 'Theta',
    'Ι': 'Iota',
    'Κ': 'Kappa',
    'Λ': 'Lambda',
    'Μ': 'Mu',
    'Ν': 'Nu',
    'Ξ': 'Xi',
    'Ο': 'Omicron',
    'Π': 'Pi',
    'Ρ': 'Rho',
    'Σ': 'Sigma',
    'Τ': 'Tau',
    'Υ': 'Upsilon',
    'Φ': 'Phi',
    'Χ': 'Chi',
    'Ψ': 'Psi',
    'Ω': 'Omega',
    
    // Mathematical symbols
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
    
    // Common symbols
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
    '‘': "'",
    '’': "'",
    '"': '"',
    '“': '"',
    '…': '...',
    '‰': 'per mille',
    '‱': 'per ten thousand',
    
    // Additional scientific notation
    'Å': 'Angstrom',
    '∠': 'angle',
    '⊥': 'perpendicular',
    '∥': 'parallel',
    '∟': 'right angle'
  };
  
  let normalizedText = text;
  
  // Process superscripts first (most specific patterns first)
  const sortedSuperscriptEntries = Object.entries(superscriptMap)
    .sort((a, b) => b[0].length - a[0].length); // Longer patterns first
  
  sortedSuperscriptEntries.forEach(([unicode, replacement]) => {
    // Use a more robust regex that handles word boundaries properly
    const regex = new RegExp(unicode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const beforeReplace = normalizedText;
    normalizedText = normalizedText.replace(regex, replacement);
    if (normalizedText !== beforeReplace) {
      console.log(`Replaced superscript: "${unicode}" -> "${replacement}"`);
    }
  });
  
  // Process subscripts (most specific patterns first)
  const sortedSubscriptEntries = Object.entries(subscriptMap)
    .sort((a, b) => b[0].length - a[0].length);
  
  sortedSubscriptEntries.forEach(([unicode, replacement]) => {
    const regex = new RegExp(unicode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const beforeReplace = normalizedText;
    normalizedText = normalizedText.replace(regex, replacement);
    if (normalizedText !== beforeReplace) {
      console.log(`Replaced subscript: "${unicode}" -> "${replacement}"`);
    }
  });
  
  // Process other special characters (most specific patterns first)
  const sortedSpecialEntries = Object.entries(specialCharMap)
    .sort((a, b) => b[0].length - a[0].length);
  
  sortedSpecialEntries.forEach(([unicode, replacement]) => {
    const regex = new RegExp(unicode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const beforeReplace = normalizedText;
    normalizedText = normalizedText.replace(regex, replacement);
    if (normalizedText !== beforeReplace) {
      console.log(`Replaced special char: "${unicode}" -> "${replacement}"`);
    }
  });
  
  // Handle remaining non-ASCII characters with better fallbacks
  normalizedText = normalizedText.replace(/[^\x00-\x7F]/g, (match) => {
    const charCode = match.charCodeAt(0);
    console.warn(`Unhandled special character in PDF export: "${match}" (U+${charCode.toString(16).toUpperCase().padStart(4, '0')})`);
    
    // Provide better fallbacks based on character ranges
    if (charCode >= 0x2070 && charCode <= 0x209F) {
      // Superscripts and subscripts range
      return `[${match}]`;
    } else if (charCode >= 0x0370 && charCode <= 0x03FF) {
      // Greek and Coptic range
      return `[Greek:${match}]`;
    } else if (charCode >= 0x2190 && charCode <= 0x21FF) {
      // Arrows range
      return '->';
    } else if (charCode >= 0x2200 && charCode <= 0x22FF) {
      // Mathematical operators range
      return `[Math:${match}]`;
    }
    
    // Generic fallback
    return '?';
  });
  
  console.log('Final normalized text:', normalizedText);
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
