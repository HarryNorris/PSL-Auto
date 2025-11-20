import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, AlertCircle, FileText, Sparkles } from 'lucide-react';

interface AccessGateProps {
  onVerify: () => void;
}

export const AccessGate: React.FC<AccessGateProps> = ({ onVerify }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const VALID_CODE = "BETA-2025";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === VALID_CODE) {
      localStorage.setItem('psl_access_granted', 'true');
      setError(false);
      onVerify();
    } else {
      setError(true);
      // Shake animation could be added here, but error text is sufficient for MVP
    }
  };

  return (
    <div className="min-h-screen bg-brand-900 flex flex-col items-center justify-center p-4 animate-fade-in">
      
      {/* Modern Fintech Logo (Scaled Up for Splash Screen) */}
      <div className="mb-10 flex items-center gap-4 select-none">
          {/* Enterprise Icon Mark */}
          <div className="relative">
            <FileText className="text-sky-400" size={48} strokeWidth={2.5} />
            <div className="absolute -top-3 -right-3 bg-brand-900 rounded-full p-1 border-[4px] border-brand-900">
               <Sparkles className="text-sky-200" size={24} fill="currentColor" />
            </div>
          </div>
          {/* Wordmark */}
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold text-4xl tracking-tight text-white">PSL</span>
            <span className="font-light text-4xl text-white/80">AUTO</span>
          </div>
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-brand-50 text-brand-900 rounded-full flex items-center justify-center">
              <ShieldCheck size={32} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-slate-900">Early Access Gate</h2>
          <p className="text-center text-slate-500 mt-2 mb-8">
            Enter your beta access code to unlock the platform.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Access Code
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError(false);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all"
                  placeholder="•••••••••"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg animate-fade-in">
                <AlertCircle size={16} />
                <span>Invalid Access Code. Please try again.</span>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-brand-900 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-brand-900/20 hover:bg-brand-800 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mt-2"
            >
              Unlock App <ArrowRight size={18} />
            </button>
          </form>
        </div>
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
           <p className="text-xs text-slate-400">Restricted to authorised personnel only.</p>
        </div>
      </div>
    </div>
  );
};