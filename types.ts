import React from 'react';

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  KNOWLEDGE_VAULT = 'KNOWLEDGE_VAULT',
  NEW_TENDER = 'NEW_TENDER',
  SETTINGS = 'SETTINGS'
}

export interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'XLSX' | 'TXT';
  category?: 'POLICY' | 'PAST_BID';
  content?: string;
  date: string;
  status: 'Completed' | 'Processing' | 'Indexed' | 'Pending';
  size: string;
  results?: TenderQA[]; // Store the QA results for resuming functionality
}

export interface TenderQA {
  question: string;
  answer: string;
}

export interface TenderContextType {
  file: File | null;
  isAnalyzing: boolean;
  results: TenderQA[] | null;
  error: string | null;
  validateAndSetFile: (file: File) => void;
  clearFile: () => void;
  analyzeTender: () => Promise<void>;
  resetTender: () => void;
  loadTender: (doc: Document) => void; // Load a past tender into workspace
  toastMessage: string | null;
  hideToast: () => void;
  
  // DB Data
  vaultDocs: VaultDocument[];
  recentActivity: Document[];
  uploadToVault: (file: File, category: 'POLICY' | 'PAST_BID') => Promise<void>;
  removeDocument: (id: string) => Promise<void>;
  clearAllDocuments: () => Promise<void>;
  deleteActivityItem: (id: string) => Promise<void>; // Remove from history
  clearAllActivity: () => Promise<void>; // Clear entire history
}

export interface VaultDocument {
  id: string;
  name: string;
  content: string;
  category: 'POLICY' | 'PAST_BID';
  date: string;
  size: string;
  status: 'Indexed' | 'Processing';
  type: 'PDF' | 'DOCX' | 'XLSX' | 'TXT';
}

declare global {
  interface Window {
    mammoth: any;
    XLSX: any;
    docx: any;
    saveAs: any;
    pdfjsLib: any;
    idb: any;
  }
}