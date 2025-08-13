
import React, { useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Omega } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SYMBOLS = [
  { symbol: 'α', name: 'Alpha' },
  { symbol: 'β', name: 'Beta' },
  { symbol: 'γ', name: 'Gamma' },
  { symbol: 'δ', name: 'Delta' },
  { symbol: 'ε', name: 'Epsilon' },
  { symbol: 'ζ', name: 'Zeta' },
  { symbol: 'η', name: 'Eta' },
  { symbol: 'θ', name: 'Theta' },
  { symbol: 'λ', name: 'Lambda' },
  { symbol: 'μ', name: 'Mu' },
  { symbol: 'π', name: 'Pi' },
  { symbol: 'σ', name: 'Sigma' },
  { symbol: 'φ', name: 'Phi' },
  { symbol: 'χ', name: 'Chi' },
  { symbol: 'ψ', name: 'Psi' },
  { symbol: 'ω', name: 'Omega' },
  { symbol: '≤', name: 'Less than or equal' },
  { symbol: '≥', name: 'Greater than or equal' },
  { symbol: '≠', name: 'Not equal' },
  { symbol: '±', name: 'Plus-minus' },
  { symbol: '×', name: 'Multiplication' },
  { symbol: '÷', name: 'Division' },
  { symbol: '°', name: 'Degree' },
  { symbol: '²', name: 'Superscript 2' },
  { symbol: '³', name: 'Superscript 3' },
  { symbol: '½', name: 'One half' },
  { symbol: '¼', name: 'One quarter' },
  { symbol: '¾', name: 'Three quarters' },
  { symbol: '∞', name: 'Infinity' },
  { symbol: '√', name: 'Square root' },
  { symbol: '∑', name: 'Sum' },
  { symbol: '∫', name: 'Integral' },
  { symbol: '∂', name: 'Partial derivative' },
  { symbol: '∆', name: 'Delta (uppercase)' },
  { symbol: '→', name: 'Right arrow' },
  { symbol: '←', name: 'Left arrow' },
  { symbol: '↑', name: 'Up arrow' },
  { symbol: '↓', name: 'Down arrow' },
  { symbol: '⇌', name: 'Equilibrium arrow' },
  { symbol: '©', name: 'Copyright' },
  { symbol: '®', name: 'Registered' },
  { symbol: '™', name: 'Trademark' },
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter text...",
  className = ""
}) => {
  const quillRef = useRef<ReactQuill>(null);
  const [symbolPopoverOpen, setSymbolPopoverOpen] = useState(false);

  const insertSymbol = (symbol: string) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        quill.insertText(range.index, symbol);
        quill.setSelection(range.index + symbol.length);
      } else {
        quill.insertText(quill.getLength() - 1, symbol);
      }
    }
    setSymbolPopoverOpen(false);
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        [{ 'formula': true }],
        ['clean'],
        ['symbol-insert']
      ],
      handlers: {
        'symbol-insert': () => setSymbolPopoverOpen(true)
      }
    },
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'script',
    'list', 'bullet',
    'blockquote', 'code-block',
    'link', 'image',
    'formula'
  ];

  return (
    <div className={className}>
      <div className="relative">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{ 
            minHeight: '150px',
            backgroundColor: 'white'
          }}
        />
        
        {/* Custom Symbol Button */}
        <div className="absolute top-2 right-2 z-10">
          <Popover open={symbolPopoverOpen} onOpenChange={setSymbolPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                title="Insert Symbol"
              >
                <Omega className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 max-h-64 overflow-y-auto">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Insert Symbol</h4>
                <div className="grid grid-cols-6 gap-1">
                  {SYMBOLS.map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-blue-50"
                      onClick={() => insertSymbol(item.symbol)}
                      title={item.name}
                    >
                      {item.symbol}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <style jsx>{`
        .ql-toolbar .ql-symbol-insert {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
