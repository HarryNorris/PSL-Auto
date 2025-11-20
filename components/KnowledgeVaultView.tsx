import React, { useState, useRef } from 'react';
import { Folder, FileText, Search, SlidersHorizontal, ChevronRight, Upload, Loader2, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { VaultDocument } from '../types';
import { useTender } from '../context/TenderContext';

export const KnowledgeVaultView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'POLICY' | 'PAST_BIDS'>('POLICY');
  const [searchQuery, setSearchQuery] = useState('');
  const { vaultDocs, uploadToVault, removeDocument } = useTender();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // State for Delete Modal
  const [docToDelete, setDocToDelete] = useState<VaultDocument | null>(null);

  // Filter docs by active tab AND search query
  const documents = vaultDocs.filter(d => {
    const matchesTab = activeTab === 'POLICY' ? d.category === 'POLICY' : d.category === 'PAST_BID';
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setIsUploading(true);
          await uploadToVault(e.target.files[0], activeTab === 'POLICY' ? 'POLICY' : 'PAST_BID');
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = ''; // Reset
      }
  };

  const handleConfirmDelete = async () => {
    if (docToDelete) {
      await removeDocument(docToDelete.id);
      setDocToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Knowledge Vault</h1>
          <p className="text-slate-500 mt-1">Manage your source of truth for automated responses.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange} 
                accept=".pdf,.docx,.xlsx,.xls,.txt"
            />
            <button 
                onClick={handleUploadClick}
                disabled={isUploading}
                className="bg-brand-900 hover:bg-brand-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
            >
                {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                {isUploading ? 'Indexing...' : 'Upload Document'}
            </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('POLICY')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'POLICY'
                ? 'border-brand-900 text-brand-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Folder size={18} />
            Policy Documents
            <span className="bg-slate-100 text-slate-600 text-xs py-0.5 px-2 rounded-full ml-1">
                {vaultDocs.filter(d => d.category === 'POLICY').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('PAST_BIDS')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'PAST_BIDS'
                ? 'border-brand-900 text-brand-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <FileText size={18} />
            Past Successful Bids
            <span className="bg-slate-100 text-slate-600 text-xs py-0.5 px-2 rounded-full ml-1">
                {vaultDocs.filter(d => d.category === 'PAST_BID').length}
            </span>
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'POLICY' ? 'policies' : 'past bids'}...`} 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all"
          />
        </div>
        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      {/* File List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px]">
        {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                {searchQuery ? (
                  <>
                    <Search size={48} className="mb-2 opacity-20" />
                    <p>No matching documents found for "{searchQuery}"</p>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-brand-900 font-medium hover:underline mt-2"
                    >
                      Clear Search
                    </button>
                  </>
                ) : (
                  <>
                    <Folder size={48} className="mb-2 opacity-20" />
                    <p>No documents found in {activeTab === 'POLICY' ? 'Policies' : 'Past Bids'}</p>
                  </>
                )}
            </div>
        ) : (
            <div className="grid grid-cols-1 divide-y divide-slate-100">
                {documents.map((doc) => (
                    <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer relative">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm border border-slate-100 ${
                                doc.type === 'PDF' ? 'bg-red-50 text-red-500' : 
                                doc.type === 'DOCX' ? 'bg-blue-50 text-blue-500' :
                                doc.type === 'TXT' ? 'bg-slate-100 text-slate-500' :
                                'bg-green-50 text-green-500'
                            }`}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-brand-900 transition-colors">{doc.name}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-slate-500">{doc.size}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-xs text-slate-500">Added {doc.date}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <StatusBadge status={doc.status} />
                            
                             {/* Delete Action - Trigger Modal */}
                             <button 
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setDocToDelete(doc);
                                }}
                                className="relative z-50 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all cursor-pointer"
                                title="Delete Document"
                            >
                                <Trash2 size={18} className="pointer-events-none" />
                            </button>

                            <ChevronRight size={20} className="text-slate-300 group-hover:text-brand-900 transition-colors" />
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-100 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
                <Trash2 size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900">Delete Document?</h3>
              
              <p className="text-slate-500 mt-3 mb-8 leading-relaxed">
                Are you sure you want to permanently delete <br />
                <span className="font-semibold text-slate-800">"{docToDelete.name}"</span>? 
                <br />
                <span className="text-xs text-red-500 mt-2 block">This action cannot be undone.</span>
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDocToDelete(null)}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
                >
                  Delete Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};