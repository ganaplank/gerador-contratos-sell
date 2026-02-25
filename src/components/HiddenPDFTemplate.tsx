import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { replaceVariables } from '../utils/documentUtils';

interface HiddenPDFTemplateProps {
  template: string;
  values: Record<string, string>;
  id: string;
}

export const HiddenPDFTemplate: React.FC<HiddenPDFTemplateProps> = ({ template, values, id }) => {
  const processedContent = replaceVariables(template, values);

  return (
    <div
      id={id}
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 0,
        width: '210mm',
        minHeight: '297mm',
        zIndex: -1,
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: '20mm',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '14px',
        lineHeight: '1.5',
        boxSizing: 'border-box',
      }}
    >
      <div className="pdf-markdown-content" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {processedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};
