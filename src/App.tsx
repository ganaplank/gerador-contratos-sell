import React, { useMemo } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { HiddenPDFTemplate } from './components/HiddenPDFTemplate';
import { useLocalStorage } from './hooks/useLocalStorage';
import { extractVariables, generatePDF, generateWord, replaceVariables } from './utils/documentUtils';
import { FileSignature } from 'lucide-react';

const DEFAULT_TEMPLATE = `# Declaração de Residência

Eu, **{Nome}**, portador(a) do CPF nº {CPF} e do RG nº {RG}, declaro para os devidos fins que resido no endereço:

{Endereco}, {Numero} - {Bairro}
{Cidade} - {Estado}, CEP: {CEP}

Declaro ainda que as informações acima são verdadeiras e estou ciente das penalidades previstas em lei para declarações falsas.

{Cidade}, {Data}

___________________________________________________
**{Nome}**
`;

export default function App() {
  const [template, setTemplate] = useLocalStorage<string>('doc-gen-template', DEFAULT_TEMPLATE);
  const [values, setValues] = useLocalStorage<Record<string, string>>('doc-gen-values', {});

  const variables = useMemo(() => extractVariables(template), [template]);

  const handleDownloadPDF = async () => {
    // Pequeno delay para garantir que o React renderizou o DOM oculto
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Aponta para o ID do componente oculto que não usa Tailwind oklch
    await generatePDF('hidden-pdf-export', 'documento_gerado.pdf');
  };

  const handleDownloadWord = async () => {
    const processedContent = replaceVariables(template, values);
    await generateWord(processedContent, 'documento_gerado.docx');
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <header className="bg-indigo-900 text-white px-6 py-4 shadow-md z-20 shrink-0">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-800 p-2 rounded-lg shadow-inner">
              <FileSignature className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-tight">Gerador de Documentos Dinâmico</h1>
              <p className="text-xs text-indigo-300 font-medium tracking-wide">100% Client-Side • Markdown Support</p>
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
    </div>
  );
}
