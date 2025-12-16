import { create } from 'zustand';

export interface IndexEntry {
  section: string;
  description: string;
  page: number;
}

export interface CourtIndexDocument {
  id: string;
  caseId: string;
  fileName: string;
  uploadDate: string;
  status: 'processing' | 'completed' | 'failed';
  pageCount?: number;
  indexData?: {
    entries: IndexEntry[];
    remarks?: string;
  };
  // File data
  file?: File;
  originalBase64?: string;
  processedBase64?: string;
  error?: string;
}

interface CourtIndexState {
  currentDocument: CourtIndexDocument | null;
  documents: CourtIndexDocument[];
  setCurrentDocument: (doc: CourtIndexDocument) => void;
  addDocument: (doc: CourtIndexDocument) => void;
  updateDocument: (id: string, updates: Partial<CourtIndexDocument>) => void;
  clearCurrent: () => void;
}

export const useCourtIndexStore = create<CourtIndexState>((set) => ({
  currentDocument: null,
  documents: [],
  setCurrentDocument: (doc) => set({ currentDocument: doc }),
  addDocument: (doc) =>
    set((state) => ({ documents: [...state.documents, doc] })),
  updateDocument: (id, updates) =>
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, ...updates } : doc
      ),
      currentDocument:
        state.currentDocument?.id === id
          ? { ...state.currentDocument, ...updates }
          : state.currentDocument,
    })),
  clearCurrent: () => set({ currentDocument: null }),
}));
