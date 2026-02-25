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
        position: 'fixed',
        left: '-9999px',
        top: 0,
        width: '210mm',
        minHeight: '297mm',
        zIndex: -1,
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: '20mm',
        fontFamily: 'Georgia, "Times New Roman", serif', // Fonte serifada para seriedade jurídica
        fontSize: '11pt',
        lineHeight: '1.6',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Cabeçalho do PDF (Timbrado) */}
      <div style={{ borderBottom: '2px solid #000000', paddingBottom: '10mm', marginBottom: '10mm' }}>
        <img 
          src="/logo-sell.png" 
          alt="Sell Administradora" 
          crossOrigin="anonymous" // CRÍTICO: Evita erro de CORS no html2canvas
          style={{ height: '45px', objectFit: 'contain' }} 
          onError={(e) => {
            // Fallback visual caso a imagem não exista
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.innerHTML = '<h1 style="margin: 0; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #000000;">SELL ADMINISTRADORA</h1>';
          }}
        />
      </div>

      {/* Corpo do Contrato */}
      <div className="pdf-markdown-content" style={{ color: '#000000', backgroundColor: '#ffffff', flex: 1 }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {processedContent}
        </ReactMarkdown>
      </div>

      {/* Rodapé do PDF */}
      <div style={{ 
        marginTop: '15mm', 
        paddingTop: '5mm', 
        borderTop: '1px solid #cccccc', 
        textAlign: 'center', 
        fontSize: '9pt', 
        color: '#555555',
        fontFamily: 'Arial, Helvetica, sans-serif' // Fonte sem serifa para o rodapé
      }}>
        <strong>Sell Administradora</strong><br />
        Av. Fictícia, 1000 - Edifício Corporate, 15º Andar - Centro, São Paulo/SP - CEP: 01000-000<br />
        contato@selladministradora.com.br | (11) 9999-9999
      </div>
    </div>
  );
};
