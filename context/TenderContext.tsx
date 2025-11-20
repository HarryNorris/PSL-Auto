import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import { TenderContextType, TenderQA, VaultDocument, Document } from '../types';
import { extractTextFromFile } from '../utils/fileParser';
import { analyzeTenderWithGemini } from '../lib/gemini';
import { addVaultDocument, getVaultDocuments, addActivity, getRecentActivity, deleteVaultDocument, clearVaultDocs, deleteActivity, clearAllActivity } from '../lib/db';

const TenderContext = createContext<TenderContextType | undefined>(undefined);

export const TenderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<TenderQA[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Database State
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [recentActivity, setRecentActivity] = useState<Document[]>([]);

  // Load DB Data on Mount
  useEffect(() => {
    const loadData = async () => {
        console.log('Loading data from DB...');
        try {
            const docs = await getVaultDocuments();
            const activity = await getRecentActivity();
            setVaultDocs(docs);
            setRecentActivity(activity);
            
            // Auto-Restore Session
            const savedSession = localStorage.getItem('current_tender_session');
            if (savedSession) {
                try {
                    const session = JSON.parse(savedSession);
                    if (session.results && session.file) {
                        console.log("Restoring previous session...");
                        // Create a dummy file to satisfy the type system for display
                        const dummyFile = {
                            name: session.file.name,
                            size: session.file.size || 0,
                            type: session.file.type || 'application/pdf'
                        } as any as File;
                        
                        setFile(dummyFile);
                        setResults(session.results);
                    }
                } catch (e) {
                    console.error("Failed to restore session", e);
                }
            }
        } catch (err) {
            console.error("Failed to load DB data:", err);
        }
    };
    loadData();
  }, []);

  const refreshData = async () => {
      const docs = await getVaultDocuments();
      const activity = await getRecentActivity();
      setVaultDocs(docs);
      setRecentActivity(activity);
  };

  const validateAndSetFile = (selectedFile: File) => {
    const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.xls'];
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
        setError("Invalid file type. Please upload a PDF, DOCX, or Excel file.");
        setFile(null);
        return;
    }
    
    setFile(selectedFile);
    setError(null);
    setResults(null);
  };

  const clearFile = () => {
    setFile(null);
    setResults(null);
    setError(null);
  };

  const resetTender = () => {
    clearFile();
    localStorage.removeItem('current_tender_session');
  };

  // Load a past tender from Dashboard history
  const loadTender = (doc: Document) => {
    if (!doc.results || doc.results.length === 0) {
        setToastMessage("Cannot resume: No analysis data found for this document.");
        return;
    }
    
    // Create a dummy file object for the UI to render the header
    const dummyFile = {
        name: doc.name,
        size: 0, // Size might not be accurate from history, but that's okay
        type: doc.type
    } as any as File;

    setFile(dummyFile);
    setResults(doc.results);
    setIsAnalyzing(false); // Ensure we aren't stuck in loading state
    setError(null);
    
    // Save to local storage so it persists if they refresh immediately
    localStorage.setItem('current_tender_session', JSON.stringify({
        file: { name: doc.name, size: 0 },
        results: doc.results
    }));
  };

  const hideToast = () => {
    setToastMessage(null);
  };

  const uploadToVault = async (file: File, category: 'POLICY' | 'PAST_BID') => {
      console.log('Uploading with Category:', category);
      try {
          setToastMessage("Reading document...");
          
          // Artificial Delay for UX
          await new Promise(resolve => setTimeout(resolve, 1200));

          const text = await extractTextFromFile(file);
          
          console.log('Extracted Text Length:', text?.length);

          if (!text || text.trim().length === 0) {
             throw new Error("File appears to be empty or unreadable.");
          }

          setToastMessage("Indexing document...");

          const newDoc: VaultDocument = {
              id: crypto.randomUUID(),
              name: file.name,
              content: text,
              category: category,
              date: new Date().toLocaleDateString(),
              size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
              status: 'Indexed',
              type: file.name.split('.').pop()?.toUpperCase() as any || 'PDF'
          };

          await addVaultDocument(newDoc);
          
          // Force State Update immediately for UI responsiveness
          setVaultDocs(prev => [newDoc, ...prev]);
          
          setToastMessage(`Document added to ${category === 'POLICY' ? 'Policies' : 'Past Bids'}`);
      } catch (err: any) {
          console.error("Upload failed", err);
          setToastMessage(`Failed to upload: ${err.message}`);
          window.alert('DB Error: ' + err.message);
      }
  };

  const removeDocument = async (id: string) => {
    console.log('Context: Removing document', id);
    try {
      await deleteVaultDocument(id);
      // Manual state update for speed
      setVaultDocs(prev => prev.filter(d => d.id !== id));
      setToastMessage("Document removed from Vault.");
    } catch (err) {
      console.error("Failed to delete document", err);
      setToastMessage("Failed to delete document.");
    }
  };

  const clearAllDocuments = async () => {
    try {
      await clearVaultDocs();
      setVaultDocs([]);
      setToastMessage("All documents cleared from Vault.");
    } catch (err) {
      console.error("Failed to clear vault", err);
      setToastMessage("Failed to clear Vault.");
    }
  };
  
  const deleteActivityItem = async (id: string) => {
      try {
          await deleteActivity(id);
          setRecentActivity(prev => prev.filter(item => item.id !== id));
          setToastMessage("Activity removed from history.");
      } catch (err) {
          console.error("Failed to delete activity", err);
          setToastMessage("Failed to remove activity.");
      }
  };

  const clearAllActivityFunc = async () => {
      try {
          await clearAllActivity();
          setRecentActivity([]);
          setToastMessage("All activity history cleared.");
      } catch (err) {
          console.error("Failed to clear activity", err);
          setToastMessage("Failed to clear history.");
      }
  };

  const analyzeTender = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
        // 1. Extract Text from File (The "Reader")
        console.log(`Parsing file: ${file.name}`);
        const tenderText = await extractTextFromFile(file);
        
        if (!tenderText || tenderText.trim().length < 10) {
            throw new Error("Could not extract meaningful text from the document.");
        }

        // 2. Call Gemini (The "Brain")
        // The brain now fetches its own context from the DB, we just pass the tender.
        const qaResults = await analyzeTenderWithGemini(tenderText);
        
        setResults(qaResults);
        
        // 3. Save to Recent Activity (Including Results!)
        const activityDoc: Document = {
            id: crypto.randomUUID(),
            name: file.name,
            type: file.name.split('.').pop()?.toUpperCase() as any || 'PDF',
            date: new Date().toLocaleString(),
            status: 'Completed',
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
            results: qaResults // Persist the AI results
        };
        await addActivity(activityDoc);
        setRecentActivity(prev => [activityDoc, ...prev]);
        
        // 4. Save Session to LocalStorage for Refresh Persistence
        localStorage.setItem('current_tender_session', JSON.stringify({
            file: { name: file.name, size: file.size },
            results: qaResults
        }));

        setToastMessage("Tender Analysis Complete!");

    } catch (err: any) {
        console.error("Analysis Workflow Failed:", err);
        let msg = err.message || "An unknown error occurred.";
        if (msg.includes("PDF.js")) msg = "Could not read PDF. Please ensure it is a valid text-based PDF.";
        setError(msg);
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <TenderContext.Provider value={{
      file,
      isAnalyzing,
      results,
      error,
      validateAndSetFile,
      clearFile,
      analyzeTender,
      resetTender,
      loadTender,
      toastMessage,
      hideToast,
      vaultDocs,
      recentActivity,
      uploadToVault,
      removeDocument,
      clearAllDocuments,
      deleteActivityItem,
      clearAllActivity: clearAllActivityFunc
    }}>
      {children}
    </TenderContext.Provider>
  );
};

export const useTender = () => {
  const context = useContext(TenderContext);
  if (context === undefined) {
    throw new Error('useTender must be used within a TenderProvider');
  }
  return context;
};