import { Document, Paragraph, TextRun, Packer } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const extractVariables = (template: string): string[] => {
  const regex = /\{([^}]+)\}/g;
  const matches = [...template.matchAll(regex)];
  // Use Set to get unique variables
  const uniqueVars = Array.from(new Set(matches.map(match => match[1])));
  return uniqueVars;
};

export const replaceVariables = (template: string, values: Record<string, string>): string => {
  return template.replace(/\{([^}]+)\}/g, (match, p1) => {
    return values[p1] || `[${p1}]`; // Placeholder for empty variables
  });
};

export const generatePDF = async (elementId: string, filename: string = 'documento.pdf') => {
  console.log('1. Iniciando geração do PDF...');
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error('Erro: Elemento com ID', elementId, 'não encontrado na página.');
    alert('Erro: Elemento de prévia não encontrado na página.');
    return;
  }

  try {
    console.log('2. Elemento encontrado. Iniciando captura com html2canvas...');
    
    // html2canvas configuration optimized for reliability
    const canvas = await html2canvas(element, {
      scale: 2, // Melhor qualidade
      useCORS: true,
      logging: true, // Habilitando log interno do html2canvas para debug
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Garantir que o elemento clonado esteja visível e sem estilos que quebrem a captura
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.transform = 'none';
          clonedElement.style.boxShadow = 'none';
        }
      }
    });

    console.log('3. Canvas gerado com sucesso. Dimensões:', canvas.width, 'x', canvas.height);

    const imgData = canvas.toDataURL('image/png');
    console.log('4. Imagem extraída do canvas.');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    console.log('5. Adicionando imagem ao jsPDF...');
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    console.log('6. Preparando download nativo...');
    // Native download approach instead of relying on jsPDF's internal save
    // which can sometimes fail in sandboxed iframes
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('7. Download concluído e limpeza realizada.');
    }, 100);

  } catch (error) {
    console.error('ERRO CRÍTICO ao gerar PDF:', error);
    alert('Ocorreu um erro ao gerar o PDF. Veja o console para mais detalhes.');
  }
};

// Um parser simples para converter Markdown básico (negrito e itálico) para docx
export const generateWord = async (text: string, filename: string = 'documento.docx') => {
  const lines = text.split('\n');
  
  const paragraphs = lines.map(line => {
    // Regex simples para negrito **texto** e itálico *texto*
    const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    
    const textRuns = parts.map(part => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return new TextRun({ text: part.slice(2, -2), bold: true });
      } else if (part.startsWith('*') && part.endsWith('*')) {
        return new TextRun({ text: part.slice(1, -1), italics: true });
      } else {
        return new TextRun({ text: part });
      }
    });

    return new Paragraph({ children: textRuns });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  try {
    const blob = await Packer.toBlob(doc);
    
    // Bulletproof native download approach
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
  } catch (error) {
    console.error('Erro ao gerar Word:', error);
    alert('Ocorreu um erro ao gerar o arquivo Word. Veja o console para mais detalhes.');
  }
};
