import { create } from 'zustand';

export interface ColumnInfo {
  name: string;
  type: string;
}

export interface FilterValue {
  column: string;
  value: string;
}

export interface MatchColumn {
  column: string;
  enabled: boolean;
}

export interface OutputColumn {
  column: string;
  enabled: boolean;
}

export interface ConflictRule {
  id: string;
  leftTerm: string;
  rightTerm: string;
}

export interface SavedConfiguration {
  id: string;
  name: string;
  tags: string[];
  autoApply: boolean;
  filters: FilterValue[];
  matchColumns: MatchColumn[];
  outputColumns: OutputColumn[];
  conflictRules: ConflictRule[];
  similarityThreshold: number;
  createdAt: string;
}

interface MasterDedupState {
  // File data
  uploadedFile: File | null;
  fileName: string;
  fileMetadata: {
    rows: number;
    columns: number;
  } | null;
  columns: ColumnInfo[];
  rawData: any[];
  
  // Configuration
  filters: FilterValue[];
  matchColumns: MatchColumn[];
  outputColumns: OutputColumn[];
  conflictRules: ConflictRule[];
  similarityThreshold: number;
  currentConfigId: string | null;
  configurationStatus: 'draft' | 'saved' | 'auto-loaded';
  
  // Saved configurations
  savedConfigurations: SavedConfiguration[];
  
  // Processing
  isProcessing: boolean;
  processedData: any[];
  duplicatesFound: number;
  
  // Actions
  setUploadedFile: (file: File, metadata: any, columns: ColumnInfo[], data: any[]) => void;
  replaceFile: (file: File, metadata: any, columns: ColumnInfo[], data: any[]) => void;
  updateFilter: (column: string, value: string) => void;
  resetFilters: () => void;
  addMatchColumn: (column: string) => void;
  removeMatchColumn: (column: string) => void;
  addOutputColumn: (column: string) => void;
  removeOutputColumn: (column: string) => void;
  addConflictRule: (leftTerm: string, rightTerm: string) => void;
  removeConflictRule: (id: string) => void;
  updateConflictRule: (id: string, leftTerm: string, rightTerm: string) => void;
  setSimilarityThreshold: (threshold: number) => void;
  saveConfiguration: (name: string, tags: string[], autoApply: boolean) => void;
  loadConfiguration: (configId: string) => void;
  deleteConfiguration: (configId: string) => void;
  resetConfiguration: () => void;
  startProcessing: () => void;
  setProcessedData: (data: any[], duplicatesCount: number) => void;
  reset: () => void;
}

export const useMasterDedupStore = create<MasterDedupState>((set, get) => ({
  uploadedFile: null,
  fileName: '',
  fileMetadata: null,
  columns: [],
  rawData: [],
  filters: [],
  matchColumns: [],
  outputColumns: [],
  conflictRules: [],
  similarityThreshold: 0.8,
  currentConfigId: null,
  configurationStatus: 'draft',
  savedConfigurations: [],
  isProcessing: false,
  processedData: [],
  duplicatesFound: 0,

  setUploadedFile: (file, metadata, columns, data) => {
    set({
      uploadedFile: file,
      fileName: file.name,
      fileMetadata: metadata,
      columns,
      rawData: data,
      matchColumns: [], // Empty by default
      outputColumns: [], // Empty by default
      filters: [],
      processedData: [],
      duplicatesFound: 0,
      configurationStatus: 'draft',
    });
    
    // Check for auto-apply configurations
    const state = get();
    const autoConfig = state.savedConfigurations.find(c => c.autoApply);
    if (autoConfig) {
      get().loadConfiguration(autoConfig.id);
      set({ configurationStatus: 'auto-loaded' });
    }
  },

  replaceFile: (file, metadata, columns, data) => {
    get().setUploadedFile(file, metadata, columns, data);
  },

  updateFilter: (column, value) => 
    set((state) => {
      const existingIndex = state.filters.findIndex(f => f.column === column);
      if (existingIndex >= 0) {
        const newFilters = [...state.filters];
        if (value === '') {
          newFilters.splice(existingIndex, 1);
        } else {
          newFilters[existingIndex] = { column, value };
        }
        return { filters: newFilters, configurationStatus: 'draft' };
      } else if (value !== '') {
        return { filters: [...state.filters, { column, value }], configurationStatus: 'draft' };
      }
      return {};
    }),

  resetFilters: () => set({ filters: [], configurationStatus: 'draft' }),

  addMatchColumn: (column) =>
    set((state) => {
      if (state.matchColumns.find(c => c.column === column)) {
        return {};
      }
      return {
        matchColumns: [...state.matchColumns, { column, enabled: true }],
        configurationStatus: 'draft',
      };
    }),

  removeMatchColumn: (column) =>
    set((state) => ({
      matchColumns: state.matchColumns.filter(c => c.column !== column),
      configurationStatus: 'draft',
    })),

  addOutputColumn: (column) =>
    set((state) => {
      if (state.outputColumns.find(c => c.column === column)) {
        return {};
      }
      return {
        outputColumns: [...state.outputColumns, { column, enabled: true }],
        configurationStatus: 'draft',
      };
    }),

  removeOutputColumn: (column) =>
    set((state) => ({
      outputColumns: state.outputColumns.filter(c => c.column !== column),
      configurationStatus: 'draft',
    })),

  addConflictRule: (leftTerm, rightTerm) =>
    set((state) => ({
      conflictRules: [
        ...state.conflictRules,
        { id: Date.now().toString(), leftTerm, rightTerm },
      ],
      configurationStatus: 'draft',
    })),

  removeConflictRule: (id) =>
    set((state) => ({
      conflictRules: state.conflictRules.filter(r => r.id !== id),
      configurationStatus: 'draft',
    })),

  updateConflictRule: (id, leftTerm, rightTerm) =>
    set((state) => ({
      conflictRules: state.conflictRules.map(r =>
        r.id === id ? { ...r, leftTerm, rightTerm } : r
      ),
      configurationStatus: 'draft',
    })),

  setSimilarityThreshold: (threshold) => set({ similarityThreshold: threshold, configurationStatus: 'draft' }),

  saveConfiguration: (name, tags, autoApply) => {
    const state = get();
    const config: SavedConfiguration = {
      id: Date.now().toString(),
      name,
      tags,
      autoApply,
      filters: state.filters,
      matchColumns: state.matchColumns,
      outputColumns: state.outputColumns,
      conflictRules: state.conflictRules,
      similarityThreshold: state.similarityThreshold,
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      savedConfigurations: [...state.savedConfigurations, config],
      currentConfigId: config.id,
      configurationStatus: 'saved',
    }));
  },

  loadConfiguration: (configId) => {
    const state = get();
    const config = state.savedConfigurations.find(c => c.id === configId);
    if (config) {
      set({
        filters: config.filters,
        matchColumns: config.matchColumns,
        outputColumns: config.outputColumns,
        conflictRules: config.conflictRules,
        similarityThreshold: config.similarityThreshold,
        currentConfigId: configId,
        configurationStatus: 'saved',
        processedData: [], // Clear processed data when loading new config
        duplicatesFound: 0,
      });
    }
  },

  deleteConfiguration: (configId) =>
    set((state) => ({
      savedConfigurations: state.savedConfigurations.filter(c => c.id !== configId),
      currentConfigId: state.currentConfigId === configId ? null : state.currentConfigId,
    })),

  resetConfiguration: () =>
    set({
      filters: [],
      matchColumns: [],
      outputColumns: [],
      conflictRules: [],
      similarityThreshold: 0.8,
      currentConfigId: null,
      configurationStatus: 'draft',
    }),

  startProcessing: () => set({ isProcessing: true }),

  setProcessedData: (data, duplicatesCount) =>
    set({
      processedData: data,
      duplicatesFound: duplicatesCount,
      isProcessing: false,
    }),

  reset: () =>
    set({
      uploadedFile: null,
      fileName: '',
      fileMetadata: null,
      columns: [],
      rawData: [],
      filters: [],
      matchColumns: [],
      outputColumns: [],
      conflictRules: [],
      similarityThreshold: 0.8,
      currentConfigId: null,
      configurationStatus: 'draft',
      isProcessing: false,
      processedData: [],
      duplicatesFound: 0,
    }),
}));