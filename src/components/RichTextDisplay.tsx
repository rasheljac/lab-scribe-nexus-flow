
import React from 'react';
import { convertHtmlToStructuredText, convertStructuredTextToPlain } from '@/utils/htmlToText';

interface RichTextDisplayProps {
  content: string;
  className?: string;
  maxLength?: number;
}

const RichTextDisplay = ({ content, className = "", maxLength }: RichTextDisplayProps) => {
  if (!content) return null;

  // Helper function to strip HTML tags
  const stripHtmlTags = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
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

    // If it's short enough, show the plain text version
    return (
      <div className={className}>
        {plainText}
      </div>
    );
  }

  // For full display without maxLength, render HTML with proper styling
  return (
    <div 
      className={`prose prose-gray max-w-none 
        prose-headings:text-gray-900 prose-headings:mb-2 prose-headings:mt-4
        prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
        prose-p:text-gray-700 prose-p:mb-3 prose-p:leading-relaxed
        prose-strong:text-gray-900 prose-strong:font-semibold
        prose-em:italic prose-em:text-gray-700
        prose-ul:mt-2 prose-ul:mb-3 prose-ol:mt-2 prose-ol:mb-3 
        prose-li:my-1 prose-li:text-gray-700
        prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic
        prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-gray-900 prose-pre:text-white prose-pre:p-4 prose-pre:rounded prose-pre:overflow-x-auto
        prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
        prose-img:rounded prose-img:shadow-sm
        ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextDisplay;
