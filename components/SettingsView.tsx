import React, { useState } from 'react';
import { Shield, Trash2, Mail, LogOut, Database, AlertTriangle, X } from 'lucide-react';
import { useTender } from '../context/TenderContext';

export const SettingsView: React.FC = () => {
  const { clearAllDocuments, clearAllActivity } = useTender();
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleLock = () => {
    localStorage.removeItem('psl_access_granted');
    window.location.reload();
  };

  const handleFactoryResetClick = () => {
    setShowResetModal(true);
  };

  const executeFactoryReset = async () => {
    setIsResetting(true);
    try {
      // 1. Clear Database
      await clearAllDocuments();
      await clearAllActivity();
      
      // 2. Clear Local Storage (Session + Auth Token)
      localStorage.clear();
      
      // 3. Wait for DB to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 4. Reload (User will be sent back to Access Gate)
      window.location.reload();
    } catch (error: any) {
      alert("Reset Failed: " + error.message);
      setIsResetting(false);
      setShowResetModal(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500 mt-1">Manage security, data, and app configuration.</p>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <div className="bg-brand-50 text-brand-900 p-3 rounded-full">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">App Security</h3>
            <p className="text-sm text-slate-500">Manage your active session.</p>
          </div>
        </div>
        <div className="p-6">
           <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-sm font-medium text-slate-700">Session Active (Verified via Access Code)</span>
              </div>
              <button 
                onClick={handleLock}
                className="text-sm font-medium text-slate-600 hover:text-brand-900 hover:bg-white border border-transparent hover:border-slate-200 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2"
              >
                <LogOut size={16} />
                Lock App
              </button>
           </div>
        </div>
      </div>

      {/* Data Management (Danger Zone) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <div className="bg-red-50 text-red-600 p-3 rounded-full">
            <Database size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Data & Privacy</h3>
            <p className="text-sm text-slate-500">Manage your locally stored data.</p>
          </div>
        </div>
        <div className="p-6">
           <div className="mb-6">
             <p className="text-sm text-slate-600 leading-relaxed">
               PSL-Auto operates on a "Local-First" architecture. All your documents, analysis results, and history are stored strictly within this browser's database. We do not store your files on our servers.
             </p>
           </div>
           
           <div className="border border-red-100 bg-red-50/50 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-4">
                 <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
                 <div>
                   <h4 className="text-sm font-bold text-red-900">Factory Reset</h4>
                   <p className="text-xs text-red-700 mt-1">
                     This will permanently delete all Policies, Past Bids, and Tender History from this browser. This action is irreversible.
                   </p>
                 </div>
              </div>
              <button 
                onClick={handleFactoryResetClick}
                className="w-full sm:w-auto bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Perform Factory Reset
              </button>
           </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-full">
            <Mail size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Support & Feedback</h3>
            <p className="text-sm text-slate-500">Get help or suggest features.</p>
          </div>
        </div>
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
           <p className="text-sm text-slate-600">
             Need assistance using the platform or have a feature request for the beta?
           </p>
           <a 
             href="mailto:harry@auctaai.co.uk?subject=PSL-Auto Support Request"
             className="shrink-0 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all flex items-center gap-2"
           >
             <Mail size={16} />
             Contact Support
           </a>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-red-100 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <AlertTriangle size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900">Factory Reset</h3>
              
              <p className="text-slate-600 mt-3 mb-6 leading-relaxed">
                Are you completely sure? <br/>
                This will <span className="font-bold text-red-600">permanently wipe</span> all data.
                <br />
                <span className="text-sm text-slate-400 mt-2 block">Local database and session will be cleared.</span>
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={executeFactoryReset}
                  disabled={isResetting}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isResetting ? 'Resetting System...' : 'Yes, Wipe Everything'}
                </button>
                <button 
                  onClick={() => setShowResetModal(false)}
                  disabled={isResetting}
                  className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};