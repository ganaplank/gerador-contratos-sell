import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { replaceVariables } from '../utils/documentUtils';
import { Download, FileDown, Eye, GripHorizontal, Loader2, Minimize2 } from 'lucide-react';

interface PreviewProps {
  template: string;
  values: Record<string, string>;
  onDownloadPDF: () => Promise<void>;
  onDownloadWord: () => Promise<void>;
}

export const Preview: React.FC<PreviewProps> = ({ template, values, onDownloadPDF, onDownloadWord }) => {
  const processedContent = replaceVariables(template, values);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Initialize position on mount
  useEffect(() => {
    const initialX = Math.max(20, window.innerWidth - 530);
    const initialY = Math.max(20, window.innerHeight - 830);
    setPosition({ x: initialX, y: initialY });
  }, []);

  // Handle drag events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent dragging if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handlePDF = async () => {
    setIsGeneratingPDF(true);
    await onDownloadPDF();
    setIsGeneratingPDF(false);
  };

  const handleWord = async () => {
    setIsGeneratingWord(true);
    await onDownloadWord();
    setIsGeneratingWord(false);
  };

  if (isMinimized) {
    // Minimized state: fixed at bottom right for better UX
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all font-medium text-sm border border-indigo-500"
        >
          <Eye className="w-5 h-5" />
          Mostrar Prévia
        </button>
      </div>
    );
  }

  return (
    <div 
      className="fixed z-50 flex flex-col bg-slate-200 overflow-hidden rounded-xl shadow-2xl border border-slate-300 w-[90vw] max-w-[500px] h-[80vh] max-h-[800px]"
      style={{ left: position.x, top: position.y }}
    >
      {/* Header / Drag Handle */}
      <div 
        className="p-3 border-b border-slate-300 bg-white flex items-center justify-between shadow-sm z-10 shrink-0 cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-5 h-5 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-indigo-600" />
            Prévia
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleWord}
            disabled={isGeneratingWord}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all font-medium text-xs shadow-sm focus:ring-2 focus:ring-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingWord ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
            Word
          </button>
          <button
            onClick={handlePDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium text-xs shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            PDF
          </button>
          <div className="w-px h-5 bg-slate-200 mx-1"></div>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            title="Minimizar"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-slate-200/80">
        {/* A4 Paper representation */}
        <div 
          className="bg-white w-full max-w-[210mm] min-h-[297mm] p-[15mm] shadow-xl rounded-sm ring-1 ring-slate-900/5 transition-all"
        >
          <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-semibold text-xs md:text-sm">
            {processedContent ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {processedContent}
              </ReactMarkdown>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 mt-20">
                <FileDown className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-base font-medium">A prévia aparecerá aqui.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
