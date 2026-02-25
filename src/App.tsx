import React, { useMemo } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { HiddenPDFTemplate } from './components/HiddenPDFTemplate';
import { useLocalStorage } from './hooks/useLocalStorage';
import { extractVariables, generatePDF, generateWord, replaceVariables } from './utils/documentUtils';

const DEFAULT_TEMPLATE = `# Contrato de Prestação de Serviços

Pelo presente instrumento particular, de um lado **Sell Administradora**, e de outro lado **{Nome_Cliente}**, portador(a) do CPF nº {CPF_Cliente}, residente e domiciliado(a) em {Endereco_Cliente}, firmam o presente contrato mediante as cláusulas a seguir:

## 1. Do Objeto
O presente contrato tem como objeto a prestação de serviços de administração...

## 2. Do Valor
Pela prestação dos serviços, o contratante pagará o valor de R$ {Valor_Contrato}.

E por estarem justos e contratados, assinam o presente.

{Cidade}, {Data}

___________________________________________________
**Sell Administradora**

___________________________________________________
**{Nome_Cliente}**
`;

export default function App() {
  const [template, setTemplate] = useLocalStorage<string>('doc-gen-template', DEFAULT_TEMPLATE);
  const [values, setValues] = useLocalStorage<Record<string, string>>('doc-gen-values', {});

  const variables = useMemo(() => extractVariables(template), [template]);

  const handleDownloadPDF = async () => {
    // Pequeno delay para garantir que o React renderizou o DOM oculto
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Aponta para o ID do componente oculto que não usa Tailwind oklch
    await generatePDF('hidden-pdf-export', 'contrato_sell.pdf');
  };

  const handleDownloadWord = async () => {
    const processedContent = replaceVariables(template, values);
    await generateWord(processedContent, 'contrato_sell.docx');
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Cabeçalho Corporativo */}
      <header className="bg-[#0f172a] text-white px-6 py-4 shadow-md z-20 shrink-0">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1.5 rounded-lg shadow-sm">
              <img 
                src="/logo-sell.png" 
                alt="Logo Sell Administradora" 
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  // Fallback visual caso a imagem não exista durante o dev
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="h-10 w-10 flex items-center justify-center text-slate-800 font-bold">SELL</div>';
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-tight">GERADOR CONTRATO SELL</h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide">Sistema Interno de Documentos</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden w-full">
        {/* Editor takes full width now */}
        <div className="w-full h-full bg-white max-w-[1200px] mx-auto shadow-sm border-x border-slate-200">
          <Editor
            template={template}
            setTemplate={setTemplate}
            variables={variables}
            values={values}
            setValues={setValues}
          />
        </div>

        {/* Floating Preview Window (handles its own minimize state) */}
        <Preview
          template={template}
          values={values}
          onDownloadPDF={handleDownloadPDF}
          onDownloadWord={handleDownloadWord}
        />

        {/* Hidden PDF Export Container - Always in DOM but invisible */}
        <HiddenPDFTemplate 
          template={template}
          values={values}
          id="hidden-pdf-export"
        />
      </main>

      {/* Rodapé Corporativo */}
      <footer className="bg-white border-t border-slate-200 py-2.5 shrink-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <p className="text-xs text-slate-400 font-medium">
            © 2026 Sell Administradora • Uso Interno
          </p>
        </div>
      </footer>
    </div>
  );
}
