import React, { useState } from 'react';
import { FileText, Clock, Archive, Filter, Trash2, Download, Eye, Search, AlertTriangle } from 'lucide-react';
import { StatCard } from './StatCard';
import { StatusBadge } from './StatusBadge';
import { Document, ViewState } from '../types';
import { useTender } from '../context/TenderContext';
import { generateWordDocument } from '../utils/docGenerator';

interface DashboardViewProps {
  onNavigate: (view: ViewState) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { resetTender, recentActivity, vaultDocs, loadTender, deleteActivityItem } = useTender();
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for Delete Modal
  const [activityToDelete, setActivityToDelete] = useState<Document | null>(null);

  const handleNewReport = () => {
    resetTender();
    onNavigate(ViewState.NEW_TENDER);
  };

  const handleResume = (doc: Document) => {
      if (doc.status === 'Completed' && doc.results) {
          loadTender(doc);
          onNavigate(ViewState.NEW_TENDER);
      }
  };

  // Wrapper to stop propagation when clicking the "View" button specifically
  const handleResumeClick = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    handleResume(doc);
  };

  const handleDeleteClick = (e: React.MouseEvent, doc: Document) => {
      e.stopPropagation();
      setActivityToDelete(doc);
  };

  const handleConfirmDelete = async () => {
    if (activityToDelete) {
        await deleteActivityItem(activityToDelete.id);
        setActivityToDelete(null);
    }
  };

  const handleExport = (e: React.MouseEvent, doc: Document) => {
      e.stopPropagation();
      if (doc.results) {
          generateWordDocument(doc.results, doc.name);
      } else {
          alert("No analysis results available to export.");
      }
  };

  const filteredActivity = recentActivity.filter(doc => 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your tender automation activity.</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all">
                <Filter size={16} />
                Filter
            </button>
            <button 
                onClick={handleNewReport}
                className="bg-brand-900 hover:bg-brand-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all flex items-center gap-2"
            >
                <FileText size={16} />
                New Report
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Active Bids" 
          value={recentActivity.filter(d => d.status === 'Processing').length.toString()} 
          icon={<FileText size={24} />} 
          subtext="Current processing tasks"
        />
        <StatCard 
          title="Documents Indexed" 
          value={vaultDocs.length.toString()} 
          icon={<Archive size={24} />} 
          subtext="Total Policies & Past Bids"
        />
        <StatCard 
          title="Recent Tenders" 
          value={recentActivity.length.toString()} 
          icon={<Clock size={24} />} 
          subtext="Processed this session"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..." 
                className="pl-10 pr-4 py-2 bg-slate-800 text-white placeholder-slate-400 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent w-full sm:w-64 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {recentActivity.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                  <p>No recent analysis activity found.</p>
                  <button onClick={handleNewReport} className="text-brand-900 font-medium hover:underline mt-2">Start a new tender</button>
              </div>
          ) : (
            <>
              {filteredActivity.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                    <Search size={32} className="mx-auto mb-3 opacity-50" />
                    <p>No documents match "{searchQuery}"</p>
                    <button 
                      onClick={() => setSearchQuery('')} 
                      className="text-brand-900 font-medium hover:underline mt-2"
                    >
                      Clear Search
                    </button>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                      <th className="px-6 py-4">Document Name</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredActivity.map((doc) => (
                      <tr 
                          key={doc.id} 
                          onClick={() => handleResume(doc)}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                          title="Click to resume details"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                              doc.type === 'PDF' ? 'bg-red-50 text-red-600' : 
                              doc.type === 'DOCX' ? 'bg-blue-50 text-blue-600' : 
                              'bg-green-50 text-green-600'
                          }`}>
                              <FileText size={16} />
                          </div>
                          {doc.name}
                        </td>
                        <td className="px-6 py-4 text-slate-500">{doc.type}</td>
                        <td className="px-6 py-4 text-slate-500">{doc.date}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={doc.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                              <button 
                                  onClick={(e) => handleResumeClick(e, doc)}
                                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                                  title="View Results"
                              >
                                  <Eye size={18} />
                              </button>
                              <button 
                                  onClick={(e) => handleExport(e, doc)}
                                  className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors"
                                  title="Export to Word"
                              >
                                  <Download size={18} />
                              </button>
                              <button 
                                  onClick={(e) => handleDeleteClick(e, doc)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                  title="Delete"
                              >
                                  <Trash2 size={18} />
                              </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>

       {/* Delete Confirmation Modal */}
       {activityToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-100 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900">Delete Activity?</h3>
              
              <p className="text-slate-500 mt-3 mb-8 leading-relaxed">
                Are you sure you want to remove <br />
                <span className="font-semibold text-slate-800">"{activityToDelete.name}"</span> <br/>
                from your history?
                <br />
                <span className="text-xs text-red-500 mt-2 block">This will NOT delete the original file from the Vault.</span>
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setActivityToDelete(null)}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
                >
                  Delete Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};