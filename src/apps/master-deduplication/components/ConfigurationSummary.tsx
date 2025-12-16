import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Save, RefreshCw, FileCheck } from 'lucide-react';

interface ConfigurationSummaryProps {
  status: 'draft' | 'saved' | 'auto-loaded';
  configName?: string;
  matchCount: number;
  outputCount: number;
  filterCount: number;
  conflictCount: number;
  onSave: () => void;
  onReset: () => void;
}

export function ConfigurationSummary({
  status,
  configName,
  matchCount,
  outputCount,
  filterCount,
  conflictCount,
  onSave,
  onReset,
}: ConfigurationSummaryProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'saved':
        return <Badge className="bg-green-500">Saved</Badge>;
      case 'auto-loaded':
        return <Badge className="bg-blue-500">Auto-loaded</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Configuration</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {configName && (
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{configName}</p>
          </div>
        )}

        {status === 'auto-loaded' && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-3 flex items-start gap-2">
            <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Configuration loaded for this file type ✓
            </p>
          </div>
        )}

        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Match Criteria:</span>
            <span className="font-medium">{matchCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Output Columns:</span>
            <span className="font-medium">{outputCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Data Filters:</span>
            <span className="font-medium">{filterCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Conflict Rules:</span>
            <span className="font-medium">{conflictCount}</span>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <Button className="w-full" onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            {status === 'saved' ? 'Update Configuration' : 'Save Configuration'}
          </Button>
          <Button variant="outline" className="w-full" onClick={onReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
