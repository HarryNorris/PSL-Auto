import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { KnowledgeVaultView } from './components/KnowledgeVaultView';
import { NewTenderView } from './components/NewTenderView';
import { SettingsView } from './components/SettingsView';
import { AccessGate } from './components/AccessGate';
import { ViewState } from './types';
import { TenderProvider, useTender } from './context/TenderContext';
import { Toast } from './components/Toast';

interface AppContentProps {
  onLogout: () => void;
}

const AppContent: React.FC<AppContentProps> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const { toastMessage, hideToast } = useTender();

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <DashboardView onNavigate={setCurrentView} />;
      case ViewState.KNOWLEDGE_VAULT:
        return <KnowledgeVaultView />;
      case ViewState.NEW_TENDER:
        return <NewTenderView />;
      case ViewState.SETTINGS:
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} onLogout={onLogout} />
      
      <main className="flex-1 md:ml-64 h-screen overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto h-full">
          {renderView()}
        </div>
      </main>

      {toastMessage && (
        <Toast message={toastMessage} onClose={hideToast} />
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessGranted = localStorage.getItem('psl_access_granted');
    if (accessGranted === 'true') {
      setIsVerified(true);
    }
    setIsLoading(false);
  }, []);

  const handleVerify = () => {
    setIsVerified(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('psl_access_granted');
    setIsVerified(false);
  };

  if (isLoading) {
    return <div className="h-screen bg-slate-50"></div>; // Prevent flash of content
  }

  if (!isVerified) {
    return <AccessGate onVerify={handleVerify} />;
  }

  return (
    <TenderProvider>
      <AppContent onLogout={handleLogout} />
    </TenderProvider>
  );
};

export default App;