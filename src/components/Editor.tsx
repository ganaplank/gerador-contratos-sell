import React, { useState, useRef } from 'react';
import { FileText, Bold, Italic, Type, Save, FolderOpen, Trash2, Upload, Copy } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface EditorProps {
  template: string;
  setTemplate: (val: string) => void;
  variables: string[];
  values: Record<string, string>;
  setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

interface SavedTemplate {
  id: string;
  name: string;
  content: string;
}

export const Editor: React.FC<EditorProps> = ({ template, setTemplate, variables, values, setValues }) => {
  const [savedTemplates, setSavedTemplates] = useLocalStorage<SavedTemplate[]>('doc-gen-saved-templates', []);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleValueChange = (variable: string, value: string) => {
    setValues(prev => ({ ...prev, [variable]: value }));
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + before + text.substring(start, end) + after + text.substring(end);
    
    setTemplate(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleLoadTemplate = (id: string) => {
    setSelectedTemplateId(id);
    if (id) {
      const t = savedTemplates.find(t => t.id === id);
      if (t) setTemplate(t.content);
    }
  };

  const handleSaveTemplate = () => {
    if (selectedTemplateId) {
      // Atualiza o template existente
      setSavedTemplates(savedTemplates.map(t => 
        t.id === selectedTemplateId ? { ...t, content: template } : t
      ));
    } else {
      // Se não houver template selecionado, funciona como "Salvar como"
      handleSaveAsTemplate();
    }
  };

  const handleSaveAsTemplate = () => {
    const name = window.prompt('Nome do novo template:');
    if (!name) return;
    
    const newTemplate: SavedTemplate = {
      id: Date.now().toString(),
      name,
      content: template
    };
    
    setSavedTemplates([...savedTemplates, newTemplate]);
    setSelectedTemplateId(newTemplate.id);
  };

  const handleDeleteTemplate = () => {
    if (!selectedTemplateId) return;
    if (window.confirm('Tem certeza que deseja excluir este template?')) {
      setSavedTemplates(savedTemplates.filter(t => t.id !== selectedTemplateId));
      setSelectedTemplateId('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setTemplate(content);
        setSelectedTemplateId(''); // Deselect any saved template
      }
    };
    reader.readAsText(file);
    
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      <div className="p-6 border-b border-slate-200 bg-white shadow-sm z-10 sticky top-0">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Editor de Template
          </h2>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex items-center">
              <FolderOpen className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                value={selectedTemplateId}
                onChange={(e) => handleLoadTemplate(e.target.value)}
                className="pl-8 pr-8 py-1.5 text-sm border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white min-w-[180px] text-slate-700 font-medium"
              >
                <option value="">Meus Templates...</option>
                {savedTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            
            <input 
              type="file" 
              accept=".txt,.md" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-md transition-colors text-sm font-medium shadow-sm"
              title="Importar Arquivo (.txt, .md)"
            >
              <Upload className="w-4 h-4" />
              Importar
            </button>

            <button
              onClick={handleSaveTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-md transition-colors text-sm font-medium shadow-sm"
              title={selectedTemplateId ? "Salvar Alterações" : "Salvar Template"}
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            
            <button
              onClick={handleSaveAsTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 rounded-md transition-colors text-sm font-medium shadow-sm"
              title="Salvar como novo template"
            >
              <Copy className="w-4 h-4" />
              Salvar como
            </button>

            {selectedTemplateId && (
              <button
                onClick={handleDeleteTemplate}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-md transition-colors shadow-sm"
                title="Excluir Template"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        <p className="text-sm text-slate-500">
          Use chaves para criar variáveis. Ex: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono text-xs border border-slate-200">{'{Nome}'}</code>
        </p>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center justify-between">
            <label htmlFor="template-editor" className="text-sm font-medium text-slate-700">
              Conteúdo do Documento
            </label>
            <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-slate-200 shadow-sm">
              <button
                onClick={() => insertText('**', '**')}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                title="Negrito"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertText('*', '*')}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                title="Itálico"
              >
                <Italic className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              <button
                onClick={() => insertText('{', '}')}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                title="Inserir Variável"
              >
                <Type className="w-4 h-4" />
              </button>
            </div>
          </div>
          <textarea
            id="template-editor"
            ref={textareaRef}
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full flex-1 min-h-[350px] p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm shadow-sm transition-all"
            placeholder="Digite seu texto aqui... Exemplo: Eu, {Nome}, portador do CPF {CPF}, declaro que..."
          />
        </div>

        {variables.length > 0 && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              Variáveis Dinâmicas ({variables.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {variables.map((variable) => (
                <div key={variable} className="flex flex-col gap-1.5">
                  <label htmlFor={`var-${variable}`} className="text-sm font-medium text-slate-700">
                    {variable}
                  </label>
                  <input
                    id={`var-${variable}`}
                    type="text"
                    value={values[variable] || ''}
                    onChange={(e) => handleValueChange(variable, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all text-sm"
                    placeholder={`Preencha o valor`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
