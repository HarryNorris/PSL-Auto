import React, { useState, useCallback } from 'react';
import { UploadCloud, FileText, X, ArrowRight, CheckCircle2, RefreshCcw, Copy, AlertCircle, FileSpreadsheet, FileType, Check } from 'lucide-react';
import { useTender } from '../context/TenderContext';
import { generateWordDocument } from '../utils/docGenerator';

export const NewTenderView: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const { 
    file, 
    isAnalyzing, 
    results, 
    error, 
    validateAndSetFile, 
    clearFile, 
    analyzeTender, 
    resetTender 
  } = useTender();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, [validateAndSetFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          validateAndSetFile(e.target.files[0]);
      }
  };

  const getFileIcon = () => {
      if (!file) return <FileText size={32} />;
      if (file.name.endsWith('.pdf')) return <FileText size={32} />;
      if (file.name.endsWith('.docx')) return <FileType size={32} />;
      if (file.name.match(/\.xls/)) return <FileSpreadsheet size={32} />;
      return <FileText size={32} />;
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const handleExport = () => {
      if (results) {
          generateWordDocument(results, file?.name);
      }
  };

  // -- VIEW: LOADING --
  if (isAnalyzing) {
      return (
          <div className="h-full flex flex-col items-center justify-center animate-fade-in">
              <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-100"></div>
                  <div className="w-24 h-24 rounded-full border-4 border-brand-900 border-t-transparent animate-spin absolute top-0 left-0"></div>
                  <div className="absolute top-0 left-0 w-24 h-24 flex items-center justify-center text-brand-900">
                    {getFileIcon()}
                  </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-8">Analysing Tender Document</h3>
              <p className="text-slate-500 mt-2 text-center max-w-md">
                  Extracting text & matching policies...
              </p>
          </div>
      );
  }

  // -- VIEW: RESULTS (A4 PAPER) --
  if (results) {
      return (
          <div className="h-full flex flex-col animate-fade-in pb-4">
             {/* Control Bar */}
             <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analysis Complete</h1>
                    <p className="text-slate-500 mt-1">Review generated responses.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={resetTender}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                        <RefreshCcw size={16} />
                        Start Over
                    </button>
                    <button 
                        onClick={handleExport}
                        className="px-4 py-2 bg-brand-900 text-white rounded-lg text-sm font-medium hover:bg-brand-800 transition-colors shadow-md flex items-center gap-2"
                    >
                        <FileText size={16} />
                        Export to Word
                    </button>
                </div>
             </div>

             {/* A4 Document Viewport */}
             <div className="flex-1 overflow-y-auto bg-slate-100/50 rounded-xl p-4 sm:p-8">
                {/* The Paper */}
                <div className="max-w-4xl mx-auto bg-white shadow-xl min-h-[800px] p-12 relative text-slate-900">
                    
                    {/* Paper Header */}
                    <div className="border-b-2 border-brand-900 pb-6 mb-10 flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-brand-900 tracking-tight">Tender Response</h2>
                            <p className="text-slate-500 text-sm mt-1">Automated Draft • {file?.name}</p>
                        </div>
                        <div className="text-right text-xs text-slate-400">
                             Generated on {new Date().toLocaleDateString()}
                        </div>
                    </div>

                    {/* Q&A Content */}
                    <div className="space-y-10">
                        {results.map((item, index) => (
                            <div key={index} className="group relative">
                                {/* Question Section */}
                                <div className="flex gap-4 mb-4">
                                    <div className="text-brand-900 font-bold text-lg min-w-[2.5rem]">Q{index + 1}</div>
                                    <h3 className="text-brand-900 font-bold text-lg leading-snug">{item.question}</h3>
                                </div>
                                
                                {/* Answer Section */}
                                <div className="pl-[3.5rem] relative">
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                        {item.answer}
                                    </p>
                                    
                                    {/* Copy Button (Floating) */}
                                    <button 
                                        onClick={() => handleCopy(item.answer, index)}
                                        className="absolute top-0 -right-12 opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 text-slate-400 hover:text-brand-900 bg-slate-50 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 hover:shadow-sm"
                                        title="Copy Answer"
                                    >
                                        {copiedIndex === index ? (
                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                        ) : (
                                            <Copy size={16} />
                                        )}
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="border-b border-slate-100 mt-8 w-full"></div>
                            </div>
                        ))}
                    </div>

                    {/* Paper Footer */}
                    <div className="mt-16 pt-8 border-t border-slate-100 text-center text-xs text-slate-300">
                        Page 1 • Confidential • Generated by PSL-Auto
                    </div>
                </div>
             </div>
          </div>
      );
  }

  // -- VIEW: IDLE / UPLOAD --
  return (
    <div className="h-full flex flex-col animate-fade-in">
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">New Tender Automation</h1>
            <p className="text-slate-500 mt-1">Upload a document (PDF, DOCX, XLSX) to extract questions and generate compliant answers.</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
            {error && (
                <div className="w-full mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 shadow-sm animate-fade-in">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {!file ? (
                <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full flex flex-col items-center justify-center p-16 border-2 border-dashed rounded-2xl transition-all duration-300 bg-white ${
                        isDragging 
                        ? 'border-brand-900 bg-brand-50/50 scale-[1.02] shadow-xl' 
                        : 'border-slate-300 hover:border-slate-400 shadow-sm'
                    }`}
                >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${isDragging ? 'bg-brand-100 text-brand-900' : 'bg-slate-100 text-slate-400'}`}>
                        <UploadCloud size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Drag Tender Document Here</h3>
                    <p className="text-slate-500 mb-8 text-center max-w-md">
                        We support PDF (Native Text), Word (DOCX), and Excel (XLSX).
                    </p>
                    
                    <div className="relative group">
                        <input 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                            onChange={handleFileChange}
                            accept=".pdf,.docx,.xlsx,.xls"
                        />
                        <button className="bg-brand-900 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-brand-900/20 transition-all group-hover:bg-brand-800 group-hover:transform group-hover:-translate-y-0.5">
                            Browse Files
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 p-8 animate-fade-in-up">
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                                {getFileIcon()}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{file.name}</h3>
                                <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button 
                            onClick={clearFile}
                            className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <button 
                        onClick={analyzeTender}
                        className="w-full bg-brand-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-brand-900/20 hover:bg-brand-800 transition-all flex items-center justify-center gap-2"
                    >
                        Run Analysis <ArrowRight size={20} />
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};