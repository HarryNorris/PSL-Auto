import React from 'react';
import { LayoutDashboard, Database, FilePlus, Settings, Loader2, Lock, FileText, Sparkles } from 'lucide-react';
import { ViewState } from '../types';
import { useTender } from '../context/TenderContext';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout }) => {
  const { isAnalyzing } = useTender();
  
  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: ViewState.KNOWLEDGE_VAULT, label: 'Knowledge Vault', icon: <Database size={20} /> },
    { 
      id: ViewState.NEW_TENDER, 
      label: 'New Tender', 
      icon: <FilePlus size={20} />,
      badge: isAnalyzing ? (
        <div className="ml-auto flex items-center gap-2">
          <Loader2 size={14} className="animate-spin text-amber-400" />
        </div>
      ) : null 
    },
  ];

  return (
    <div className="w-64 bg-brand-900 h-screen fixed left-0 top-0 hidden md:flex flex-col border-r border-slate-800 text-white z-20">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-brand-900 select-none">
        <div className="flex items-center gap-3">
          {/* Enterprise Icon Mark */}
          <div className="relative">
            <FileText className="text-sky-400" size={26} strokeWidth={2.5} />
            <div className="absolute -top-2 -right-2 bg-brand-900 rounded-full p-0.5 border-[3px] border-brand-900">
               <Sparkles className="text-sky-200" size={14} fill="currentColor" />
            </div>
          </div>
          {/* Wordmark */}
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold text-xl tracking-tight text-white">PSL</span>
            <span className="font-light text-xl text-white/80">AUTO</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1 flex flex-col">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
              currentView === item.id
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {item.icon}
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge}
          </button>
        ))}
        
        <div className="mt-8">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System</p>
           <button
            onClick={() => onChangeView(ViewState.SETTINGS)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
              currentView === ViewState.SETTINGS
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Settings size={20} />
            Settings
          </button>
        </div>

        {/* Lock / Logout Button */}
        <div className="mt-auto pt-4 border-t border-slate-800">
            <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors duration-200"
          >
            <Lock size={20} />
            Lock App
          </button>
        </div>
      </div>
    </div>
  );
};