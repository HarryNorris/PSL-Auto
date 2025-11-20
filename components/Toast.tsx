import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <div className="bg-brand-900 text-white px-4 py-3 rounded-lg shadow-lg shadow-brand-900/20 flex items-center gap-3 pr-10 relative">
        <CheckCircle2 className="text-emerald-400" size={20} />
        <span className="font-medium text-sm">{message}</span>
        <button 
          onClick={onClose}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};