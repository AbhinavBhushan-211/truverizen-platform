import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { useMasterDedupStore } from '../../../store/masterDedup.slice';
import { toast } from 'sonner@2.0.3';
import * as XLSX from 'xlsx';
import { FileUpload } from '../components/FileUpload';
import { FileInfo } from '../components/FileInfo';
import { ConfigurationPanel } from '../components/ConfigurationPanel';
import { DataPreview } from '../components/DataPreview';
import { ConfigurationSummary } from '../components/ConfigurationSummary';
import { SaveConfigurationModal } from '../components/SaveConfigurationModal';

/**
 * Master Deduplication Main Page
 * 
 * Features:
 * - File upload with drag & drop and file selection
 * - Replace file functionality
 * - Empty-by-default Match Criteria and Output Columns with searchable multi-select
 * - Intelligent Data Filters with column selection
 * - Conflict Rules for keyword pair validation
 * - Save/Load configuration system with auto-apply
 * - Raw and Processed data preview tabs with search
 * - Horizontal and vertical scrolling in data table
 * - Export functionality for both raw and processed data
 * - Configuration status tracking (Draft, Saved, Auto-loaded)
 * - Real-time configuration summary in sidebar
 * - Toast notifications positioned at top-right
 */
export function MainPage() {
  const [showSaveModal, setShowSaveModal] = useState(false);

  const {
    uploadedFile,
    fileName,
    fileMetadata,
    columns,
    rawData,
    filters,
    matchColumns,
    outputColumns,
    conflictRules,
    similarityThreshold,
    isProcessing,
    processedData,
    duplicatesFound,
    configurationStatus,
    currentConfigId,
    savedConfigurations,
    setUploadedFile,
    replaceFile,
    updateFilter,
    resetFilters,
    addMatchColumn,
    removeMatchColumn,
    addOutputColumn,
    removeOutputColumn,
    addConflictRule,
    removeConflictRule,
    updateConflictRule,
    setSimilarityThreshold,
    saveConfiguration,
    resetConfiguration,
    startProcessing,
    setProcessedData,
    reset,
    loadConfiguration,
  } = useMasterDedupStore();

  const processFile = async (file: File) => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xls|xlsx)$/i)) {
      toast.error('Please upload a CSV, XLS, or XLSX file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds 50MB limit');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          if (!data) {
            toast.error('Failed to read file');
            return;
          }

          let workbook: XLSX.WorkBook;
          
          if (file.name.endsWith('.csv')) {
            workbook = XLSX.read(data, { type: 'binary' });
          } else {
            workbook = XLSX.read(data, { type: 'array' });
          }

          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          if (jsonData.length === 0) {
            toast.error('File is empty');
            return;
          }

          const firstRow = jsonData[0] as any;
          const detectedColumns = Object.keys(firstRow).map(key => ({
            name: key,
            type: typeof firstRow[key] === 'number' ? 'number' : 'string'
          }));

          const metadata = {
            rows: jsonData.length,
            columns: detectedColumns.length
          };

          setUploadedFile(file, metadata, detectedColumns, jsonData);
          toast.success('File uploaded successfully');
        } catch (error) {
          toast.error('Error parsing file. Please check the file format.');
          console.error('Parse error:', error);
        }
      };

      reader.onerror = () => {
        toast.error('Error reading file');
      };

      if (file.name.endsWith('.csv')) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    } catch (error) {
      toast.error('Error reading file');
      console.error('Read error:', error);
    }
  };

  const handleReplaceFile = async (file: File) => {
    processFile(file);
  };

  const handleProcess = () => {
    if (rawData.length === 0) {
      toast.error('No data to process');
      return;
    }

    if (matchColumns.filter(c => c.enabled).length === 0) {
      toast.error('Please select at least one match criteria column');
      return;
    }

    if (outputColumns.filter(c => c.enabled).length === 0) {
      toast.error('Please select at least one output column');
      return;
    }

    startProcessing();

    setTimeout(() => {
      let filteredData = [...rawData];
      
      // Apply filters
      filters.forEach(filter => {
        if (filter.value) {
          filteredData = filteredData.filter(row => {
            const cellValue = String(row[filter.column] || '').toLowerCase();
            return cellValue.includes(filter.value.toLowerCase());
          });
        }
      });

      // Simulate deduplication
      const duplicateCount = Math.floor(filteredData.length * 0.15);
      
      // Filter to only enabled output columns
      const enabledOutputCols = outputColumns.filter(c => c.enabled).map(c => c.column);
      const processedRows = filteredData.slice(0, filteredData.length - duplicateCount).map(row => {
        const newRow: any = {};
        enabledOutputCols.forEach(col => {
          newRow[col] = row[col];
        });
        return newRow;
      });

      setProcessedData(processedRows, duplicateCount);
      toast.success(`Processing complete! Found ${duplicateCount} duplicates`);
    }, 2000);
  };

  const handleSaveConfiguration = (name: string, tags: string[], autoApply: boolean) => {
    saveConfiguration(name, tags, autoApply);
    toast.success('Configuration saved successfully');
  };

  const handleLoadConfiguration = (configId: string) => {
    loadConfiguration(configId);
    const config = savedConfigurations.find(c => c.id === configId);
    if (config) {
      toast.success(`Configuration "${config.name}" loaded successfully`);
    }
  };

  const handleExportRaw = () => {
    if (rawData.length === 0) {
      toast.error('No data to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rawData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raw_${fileName.replace(/\.[^/.]+$/, '')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Raw data exported successfully');
  };

  const handleExportProcessed = () => {
    if (processedData.length === 0) {
      toast.error('No processed data to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(processedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deduplicated Data');
    XLSX.writeFile(workbook, `deduplicated_${fileName.replace(/\.[^/.]+$/, '')}.xlsx`);
    toast.success('Processed data exported successfully');
  };

  const currentConfig = currentConfigId
    ? savedConfigurations.find(c => c.id === currentConfigId)
    : undefined;

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="w-full px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 flex-wrap">
              Master Deduplication
              <Badge variant="secondary" className="text-xs">v1.0</Badge>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Advanced data deduplication with configurable matching and filtering
            </p>
          </div>
          {uploadedFile && (
            <Button variant="outline" onClick={reset} className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              Start New
            </Button>
          )}
        </div>
      </div>

      <div className="w-full px-4 sm:px-6">
        {/* File Upload Section */}
        {!uploadedFile ? (
          <FileUpload onFileSelect={processFile} />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
            {/* Main Content */}
            <div className="space-y-6 min-w-0">
              {/* File Info */}
              <FileInfo
                fileName={fileName}
                rows={fileMetadata?.rows || 0}
                columns={fileMetadata?.columns || 0}
                onRemove={reset}
                onReplace={handleReplaceFile}
              />

              {/* Configuration Panel */}
              <ConfigurationPanel
                columns={columns}
                filters={filters}
                matchColumns={matchColumns}
                outputColumns={outputColumns}
                conflictRules={conflictRules}
                similarityThreshold={similarityThreshold}
                isProcessing={isProcessing}
                savedConfigurations={savedConfigurations}
                configurationStatus={configurationStatus}
                onUpdateFilter={updateFilter}
                onResetFilters={resetFilters}
                onAddMatchColumn={addMatchColumn}
                onRemoveMatchColumn={removeMatchColumn}
                onAddOutputColumn={addOutputColumn}
                onRemoveOutputColumn={removeOutputColumn}
                onAddConflictRule={addConflictRule}
                onRemoveConflictRule={removeConflictRule}
                onUpdateConflictRule={updateConflictRule}
                onSetSimilarityThreshold={setSimilarityThreshold}
                onProcess={handleProcess}
                onSaveConfiguration={() => setShowSaveModal(true)}
                onLoadConfiguration={handleLoadConfiguration}
              />

              {/* Data Preview */}
              <DataPreview
                rawData={rawData}
                rawColumns={columns.map(c => c.name)}
                processedData={processedData}
                processedColumns={outputColumns.filter(c => c.enabled).map(c => c.column)}
                totalRows={fileMetadata?.rows || 0}
                duplicatesFound={duplicatesFound}
                onExportRaw={handleExportRaw}
                onExportProcessed={handleExportProcessed}
              />
            </div>

            {/* Right Sidebar - Configuration Summary - Hidden on mobile, shown on xl+ */}
            <div className="hidden xl:block xl:sticky xl:top-6 h-fit">
              <ConfigurationSummary
                status={configurationStatus}
                configName={currentConfig?.name}
                matchCount={matchColumns.filter(c => c.enabled).length}
                outputCount={outputColumns.filter(c => c.enabled).length}
                filterCount={filters.length}
                conflictCount={conflictRules.length}
                onSave={() => setShowSaveModal(true)}
                onReset={resetConfiguration}
              />
            </div>
          </div>
        )}
      </div>

      {/* Save Configuration Modal */}
      <SaveConfigurationModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveConfiguration}
      />
    </div>
  );
}