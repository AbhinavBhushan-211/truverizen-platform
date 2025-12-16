import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Database, CheckCircle } from 'lucide-react';

interface DataPreviewProps {
  rawData: any[];
  rawColumns: string[];
  processedData: any[];
  processedColumns: string[];
  totalRows: number;
  duplicatesFound?: number;
  onExportRaw: () => void;
  onExportProcessed: () => void;
}

export function DataPreview({
  rawData,
  rawColumns,
  processedData,
  processedColumns,
  totalRows,
  duplicatesFound,
  onExportRaw,
  onExportProcessed,
}: DataPreviewProps) {
  const [activeTab, setActiveTab] = useState<'raw' | 'processed'>('raw');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Reset page when switching tabs or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const currentData = activeTab === 'raw' ? rawData : processedData;
  const currentColumns = activeTab === 'raw' ? rawColumns : processedColumns;

  // Filter data based on search term
  const filteredData = searchTerm
    ? currentData.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : currentData;

  // Paginate data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-base sm:text-lg">Data Preview</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              View and export your raw and processed data
            </CardDescription>
          </div>
          {activeTab === 'processed' && processedData.length > 0 && (
            <Badge variant="secondary" className="w-fit">
              {duplicatesFound} duplicates removed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="raw" className="flex-1 sm:flex-initial">
                <Database className="mr-2 h-4 w-4" />
                Raw Data ({rawData.length})
              </TabsTrigger>
              <TabsTrigger value="processed" className="flex-1 sm:flex-initial">
                <CheckCircle className="mr-2 h-4 w-4" />
                Processed ({processedData.length})
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              {activeTab === 'raw' && rawData.length > 0 && (
                <Button size="sm" variant="outline" onClick={onExportRaw} className="flex-1 sm:flex-initial">
                  <Download className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Export Raw</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              )}
              {activeTab === 'processed' && processedData.length > 0 && (
                <Button size="sm" onClick={onExportProcessed} className="flex-1 sm:flex-initial">
                  <Download className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Export Processed</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              )}
            </div>
          </div>

          {currentData.length > 0 && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search across all columns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <TabsContent value={activeTab} className="m-0">
                <PreviewTable
                  data={paginatedData}
                  columns={currentColumns}
                  startIndex={startIndex}
                />
              </TabsContent>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of{' '}
                    {filteredData.length} rows
                    {searchTerm && ` (filtered from ${currentData.length})`}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function PreviewTable({
  data,
  columns,
  startIndex,
}: {
  data: any[];
  columns: string[];
  startIndex: number;
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-auto max-h-[600px]">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
            <TableRow>
              <TableHead className="w-16 text-center border-r bg-muted/80 sticky left-0 z-20">
                #
              </TableHead>
              {columns.map((col) => (
                <TableHead key={col} className="whitespace-nowrap min-w-[200px] border-r last:border-r-0 bg-muted/80">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-12 text-muted-foreground">
                  No data to display
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow key={startIndex + idx} className="hover:bg-muted/50">
                  <TableCell className="text-center border-r bg-muted/30 font-mono text-xs sticky left-0 z-10">
                    {startIndex + idx + 1}
                  </TableCell>
                  {columns.map((col, cellIdx) => (
                    <TableCell key={cellIdx} className="whitespace-nowrap border-r last:border-r-0 max-w-[300px] overflow-hidden text-ellipsis">
                      {String(row[col] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}