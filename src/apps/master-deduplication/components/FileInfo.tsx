import { useRef } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { FileSpreadsheet, X, RefreshCw } from 'lucide-react';

interface FileInfoProps {
  fileName: string;
  rows: number;
  columns: number;
  onRemove: () => void;
  onReplace: (file: File) => void;
}

export function FileInfo({ fileName, rows, columns, onRemove, onReplace }: FileInfoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onReplace(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <FileSpreadsheet className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate text-sm sm:text-base">{fileName}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {rows.toLocaleString()} rows × {columns} columns
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-initial"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Replace File</span>
              <span className="sm:hidden">Replace</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onRemove} className="flex-shrink-0">
              <X className="h-4 w-4" />
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}