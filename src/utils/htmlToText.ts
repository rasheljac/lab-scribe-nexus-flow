
export interface FormattingSpan {
  start: number;
  end: number;
  bold?: boolean;
  italic?: boolean;
  superscript?: boolean;
  subscript?: boolean;
}

export interface StructuredTextElement {
  type: 'heading' | 'paragraph' | 'list' | 'text';
  content: string;
  level?: number; // for headings
  items?: string[]; // for lists
  isOrdered?: boolean; // for lists
  formatting?: FormattingSpan[]; // for formatted text
}

// Import the text processing function from pdfExportUtils
import { processPDFText } from './pdfExportUtils';

export function convertHtmlToStructuredText(html: string): StructuredTextElement[] {
  if (!html) return [];

  console.log('Converting HTML to structured text...');
  
  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const elements: StructuredTextElement[] = [];
  
  function processNode(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        elements.push({
          type: 'text',
          content: processPDFText(text) // Process special characters
        });
      }
      return;
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    
    const element = node as Element;
    const tagName = element.tagName.toLowerCase();
    
    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        const level = parseInt(tagName.charAt(1));
        const headingText = processPDFText(element.textContent || '');
        if (headingText.trim()) {
          elements.push({
            type: 'heading',
            content: headingText,
            level
          });
        }
        break;
        
      case 'p':
        const paragraphText = processPDFText(element.textContent || '');
        if (paragraphText.trim()) {
          const formatting = extractFormatting(element);
          elements.push({
            type: 'paragraph',
            content: paragraphText,
            formatting: formatting.length > 0 ? formatting : undefined
          });
        }
        break;
        
      case 'ul':
      case 'ol':
        const listItems = Array.from(element.children)
          .filter(child => child.tagName.toLowerCase() === 'li')
          .map(li => processPDFText(li.textContent || ''))
          .filter(text => text.trim());
          
        if (listItems.length > 0) {
          elements.push({
            type: 'list',
            content: '',
            items: listItems,
            isOrdered: tagName === 'ol'
          });
        }
        break;
        
      case 'div':
      case 'span':
        // Process child nodes for div and span elements
        Array.from(element.childNodes).forEach(processNode);
        break;
        
      case 'br':
        // Add a small text element for line breaks
        elements.push({
          type: 'text',
          content: ' '
        });
        break;
        
      default:
        // For other elements, process their text content
        const textContent = processPDFText(element.textContent || '');
        if (textContent.trim()) {
          const formatting = extractFormatting(element);
          elements.push({
            type: 'text',
            content: textContent,
            formatting: formatting.length > 0 ? formatting : undefined
          });
        }
        break;
    }
  }
  
  // Process all child nodes
  Array.from(tempDiv.childNodes).forEach(processNode);
  
  console.log(`Converted to ${elements.length} structured elements`);
  return elements;
}

function extractFormatting(element: Element): FormattingSpan[] {
  const text = element.textContent || '';
  const spans: FormattingSpan[] = [];
  
  function processElement(el: Element, startOffset: number = 0): number {
    let currentOffset = startOffset;
    
    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const textLength = child.textContent?.length || 0;
        currentOffset += textLength;
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const childEl = child as Element;
        const childStart = currentOffset;
        currentOffset = processElement(childEl, currentOffset);
        const childEnd = currentOffset;
        
        // Add formatting span based on element type
        const tagName = childEl.tagName.toLowerCase();
        if (childStart < childEnd) {
          const span: FormattingSpan = {
            start: childStart,
            end: childEnd
          };
          
          switch (tagName) {
            case 'strong':
            case 'b':
              span.bold = true;
              break;
            case 'em':
            case 'i':
              span.italic = true;
              break;
            case 'sup':
              span.superscript = true;
              break;
            case 'sub':
              span.subscript = true;
              break;
          }
          
          if (span.bold || span.italic || span.superscript || span.subscript) {
            spans.push(span);
          }
        }
      }
    }
    
    return currentOffset;
  }
  
  processElement(element);
  return spans;
}
