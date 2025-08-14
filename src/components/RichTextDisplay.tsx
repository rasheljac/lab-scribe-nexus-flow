
import React from 'react';

interface RichTextDisplayProps {
  content: string;
  className?: string;
  maxLength?: number;
}

const RichTextDisplay = ({ content, className = "", maxLength }: RichTextDisplayProps) => {
  if (!content) return null;

  // Helper function to strip HTML tags for plain text display
  const stripHtmlTags = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  // Helper function to clean and sanitize HTML content
  const sanitizeHtml = (html: string): string => {
    // Remove any potentially harmful scripts or attributes
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remove script tags and event handlers
    const scripts = temp.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove event handler attributes
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(element => {
      Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('on')) {
          element.removeAttribute(attr.name);
        }
      });
    });
    
    return temp.innerHTML;
  };

  // If maxLength is specified, convert to plain text for length calculation and truncation
  if (maxLength) {
    const plainText = stripHtmlTags(content);
    
    if (plainText.length > maxLength) {
      const truncatedText = plainText.substring(0, maxLength) + '...';
      return (
        <div className={className}>
          {truncatedText}
        </div>
      );
    }

    // If it's short enough, show the plain text version for maxLength use case
    return (
      <div className={className}>
        {plainText}
      </div>
    );
  }

  // Check if content contains HTML tags
  const hasHtmlTags = /<[^>]*>/g.test(content);
  
  if (!hasHtmlTags) {
    // If no HTML tags, render as plain text with line breaks
    return (
      <div className={className}>
        {content.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < content.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // For HTML content, render with proper styling and sanitization
  const sanitizedContent = sanitizeHtml(content);

  return (
    <div 
      className={`prose prose-gray max-w-none 
        prose-headings:text-gray-900 prose-headings:mb-2 prose-headings:mt-4 prose-headings:font-semibold
        prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-sm
        prose-p:text-gray-700 prose-p:mb-3 prose-p:leading-relaxed prose-p:mt-0
        prose-strong:text-gray-900 prose-strong:font-semibold
        prose-em:italic prose-em:text-gray-700
        prose-ul:mt-2 prose-ul:mb-3 prose-ul:pl-6 prose-ol:mt-2 prose-ol:mb-3 prose-ol:pl-6
        prose-li:my-1 prose-li:text-gray-700 prose-li:leading-relaxed
        prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
        prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
        prose-pre:bg-gray-900 prose-pre:text-white prose-pre:p-4 prose-pre:rounded prose-pre:overflow-x-auto prose-pre:text-sm
        prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 prose-a:break-words
        prose-img:rounded prose-img:shadow-sm prose-img:max-w-full prose-img:h-auto
        prose-table:border-collapse prose-table:border prose-table:border-gray-300
        prose-th:border prose-th:border-gray-300 prose-th:p-2 prose-th:bg-gray-50 prose-th:font-semibold
        prose-td:border prose-td:border-gray-300 prose-td:p-2
        ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default RichTextDisplay;
