import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Filter, Target, Columns3, ChevronDown, ChevronUp, Play, RefreshCw, AlertTriangle, Save, FolderOpen } from 'lucide-react';
import { DataFilters } from './DataFilters';
import { MatchCriteria } from './MatchCriteria';
import { OutputColumns } from './OutputColumns';
import { ConflictRules } from './ConflictRules';
import { cn } from '../../../lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';

interface Column {
  name: string;
  type: string;
}

interface Filter {
  column: string;
  value: string;
}

interface MatchColumn {
  column: string;
  enabled: boolean;
}

interface OutputColumn {
  column: string;
  enabled: boolean;
}

interface ConflictRule {
  id: string;
  leftTerm: string;
  rightTerm: string;
}

interface SavedConfiguration {
  id: string;
  name: string;
  tags: string[];
  autoApply: boolean;
  filters: Filter[];
  matchColumns: MatchColumn[];
  outputColumns: OutputColumn[];
  conflictRules: ConflictRule[];
  similarityThreshold: number;
  createdAt: string;
}

interface ConfigurationPanelProps {
  columns: Column[];
  filters: Filter[];
  matchColumns: MatchColumn[];
  outputColumns: OutputColumn[];
  conflictRules: ConflictRule[];
  similarityThreshold: number;
  isProcessing: boolean;
  savedConfigurations: SavedConfiguration[];
  configurationStatus: 'draft' | 'saved' | 'auto-loaded';
  onUpdateFilter: (column: string, value: string) => void;
  onResetFilters: () => void;
  onAddMatchColumn: (column: string) => void;
  onRemoveMatchColumn: (column: string) => void;
  onAddOutputColumn: (column: string) => void;
  onRemoveOutputColumn: (column: string) => void;
  onAddConflictRule: (leftTerm: string, rightTerm: string) => void;
  onRemoveConflictRule: (id: string) => void;
  onUpdateConflictRule: (id: string, leftTerm: string, rightTerm: string) => void;
  onSetSimilarityThreshold: (value: number) => void;
  onProcess: () => void;
  onSaveConfiguration: () => void;
  onLoadConfiguration: (configId: string) => void;
}

export function ConfigurationPanel({
  columns,
  filters,
  matchColumns,
  outputColumns,
  conflictRules,
  similarityThreshold,
  isProcessing,
  savedConfigurations,
  configurationStatus,
  onUpdateFilter,
  onResetFilters,
  onAddMatchColumn,
  onRemoveMatchColumn,
  onAddOutputColumn,
  onRemoveOutputColumn,
  onAddConflictRule,
  onRemoveConflictRule,
  onUpdateConflictRule,
  onSetSimilarityThreshold,
  onProcess,
  onSaveConfiguration,
  onLoadConfiguration,
}: ConfigurationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'filters' | 'match' | 'conflict' | 'output'>('filters');

  const getStatusBadge = () => {
    switch (configurationStatus) {
      case 'saved':
        return <Badge className="bg-green-500">Saved</Badge>;
      case 'auto-loaded':
        return <Badge className="bg-blue-500">Auto-loaded</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Process Data Button - Left Side */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Button
          size="lg"
          onClick={onProcess}
          disabled={isProcessing}
          className="w-full sm:w-auto sm:min-w-[200px]"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Process Data
            </>
          )}
        </Button>
        <span className="text-sm text-muted-foreground text-center sm:text-left">
          Configure your deduplication settings below
        </span>
      </div>

      {/* Collapsible Configuration Card */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="text-base sm:text-lg">Configuration</CardTitle>
                {getStatusBadge()}
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Configure filters, matching criteria, conflict rules, and output columns
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        <div className={cn(
          "transition-all duration-300 overflow-hidden",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}>
          <CardContent>
            {/* Configuration Management Bar */}
            <div className="flex flex-col lg:flex-row lg:items-end gap-3 pb-4 mb-6 border-b">
              <div className="flex-1 min-w-0">
                <label className="text-sm font-medium mb-2 block">
                  Load Saved Configuration
                </label>
                <Select onValueChange={onLoadConfiguration} value="">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a saved configuration..." />
                  </SelectTrigger>
                  <SelectContent>
                    {savedConfigurations.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No saved configurations yet
                      </div>
                    ) : (
                      savedConfigurations.map((config) => (
                        <SelectItem key={config.id} value={config.id}>
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            <span>{config.name}</span>
                            {config.autoApply && (
                              <Badge variant="secondary" className="text-xs ml-2">Auto</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full lg:w-auto">
                <Button onClick={onSaveConfiguration} className="gap-2 w-full lg:w-auto">
                  <Save className="h-4 w-4" />
                  Save Configuration
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="filters" className="text-xs sm:text-sm">
                  <Filter className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Data </span>Filters
                </TabsTrigger>
                <TabsTrigger value="match" className="text-xs sm:text-sm">
                  <Target className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Match </span>Criteria
                </TabsTrigger>
                <TabsTrigger value="conflict" className="text-xs sm:text-sm">
                  <AlertTriangle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Conflict </span>Rules
                </TabsTrigger>
                <TabsTrigger value="output" className="text-xs sm:text-sm">
                  <Columns3 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Output </span>Columns
                </TabsTrigger>
              </TabsList>

              <TabsContent value="filters" className="mt-6">
                <DataFilters
                  columns={columns}
                  filters={filters}
                  onUpdateFilter={onUpdateFilter}
                  onResetFilters={onResetFilters}
                />
              </TabsContent>

              <TabsContent value="match" className="mt-6">
                <MatchCriteria
                  columns={columns.map(c => c.name)}
                  matchColumns={matchColumns}
                  similarityThreshold={similarityThreshold}
                  onAddColumn={onAddMatchColumn}
                  onRemoveColumn={onRemoveMatchColumn}
                  onSetSimilarityThreshold={onSetSimilarityThreshold}
                />
              </TabsContent>

              <TabsContent value="conflict" className="mt-6">
                <ConflictRules
                  conflictRules={conflictRules}
                  onAddRule={onAddConflictRule}
                  onRemoveRule={onRemoveConflictRule}
                  onUpdateRule={onUpdateConflictRule}
                />
              </TabsContent>

              <TabsContent value="output" className="mt-6">
                <OutputColumns
                  columns={columns.map(c => c.name)}
                  outputColumns={outputColumns}
                  onAddColumn={onAddOutputColumn}
                  onRemoveColumn={onRemoveOutputColumn}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}