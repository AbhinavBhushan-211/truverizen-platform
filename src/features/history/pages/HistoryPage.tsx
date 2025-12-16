import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Search, Eye, Download, ArrowUpDown, Trash2, FileText, Loader2 } from 'lucide-react';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useAuth } from '../../../hooks/useAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { motion } from 'motion/react';
import { toast } from 'sonner';

// --- Types ---

// Type matching the Backend API Response
interface ApiHistoryItem {
  id: number;
  tool: string;
  document_name: string;
  processed_time: string;
  status: string;
  original_document: string;
  processed_document: string;
}

// Type used by the Frontend UI
interface HistoryItem {
  id: string;
  tool: string;
  documentName: string;
  processedTime: string;
  status: 'completed' | 'processing' | 'failed';
  originalDocument: string;
  processedDocument: string;
  // Fields below are not in API yet, so we will generate/default them
  fileSize?: string;
  processingDuration?: string;
}

const API_URL = 'http://16.16.197.117:5050/show_data';

export function HistoryPage() {
  const { user } = useAuth();
  
  // State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter/Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTool, setFilterTool] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Dialog State
  const [selectedDocument, setSelectedDocument] = useState<HistoryItem | null>(null);
  const [viewType, setViewType] = useState<'original' | 'processed'>('original');

  // --- API Integration ---

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      
      const apiData: ApiHistoryItem[] = await response.json();
      
      // Transform API data to UI data
      const mappedData: HistoryItem[] = apiData.map((item) => {
        // Map API status to UI status types
        let uiStatus: HistoryItem['status'] = 'processing';
        const lowerStatus = item.status?.toLowerCase() || '';
        
        if (lowerStatus.includes('completed') || lowerStatus.includes('success')) {
          uiStatus = 'completed';
        } else if (lowerStatus.includes('fail') || lowerStatus.includes('error')) {
          uiStatus = 'failed';
        }

        return {
          id: item.id.toString(),
          tool: item.tool || 'Unknown Tool',
          documentName: item.document_name || 'Untitled',
          processedTime: item.processed_time || new Date().toISOString(),
          status: uiStatus,
          originalDocument: item.document_name, // Using name as filename for now
          processedDocument: `processed_${item.document_name}`,
          // Defaults for missing API fields
          fileSize: 'Unknown', 
          processingDuration: '—' 
        };
      });

      setHistory(mappedData);
    } catch (error) {
      console.error("Error loading history:", error);
      toast.error("Failed to load processing history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // --- Formatting & Helpers ---

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return dateString; 
      
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).replace(',', '');
    } catch (e) {
      return dateString;
    }
  };

  // --- Derived State (Filtering & Sorting) ---

  const filteredHistory = history
    .filter((item) => {
      const matchesSearch =
        item.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tool.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTool = filterTool === 'all' || item.tool === filterTool;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesTool && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.processedTime).getTime();
        const dateB = new Date(b.processedTime).getTime();
        // Handle invalid dates by pushing them to bottom
        const valA = isNaN(dateA) ? 0 : dateA;
        const valB = isNaN(dateB) ? 0 : dateB;
        const comparison = valA - valB;
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const comparison = a.documentName.localeCompare(b.documentName);
        return sortOrder === 'asc' ? comparison : -comparison;
      }
    });

  const getTotalProcessed = () => history.filter(h => h.status === 'completed').length;
  const getTotalFailed = () => history.filter(h => h.status === 'failed').length;

  // --- Handlers ---

  const handleViewDocument = (item: HistoryItem, type: 'original' | 'processed') => {
    setSelectedDocument(item);
    setViewType(type);
  };

  const handleDownload = (item: HistoryItem, type: 'original' | 'processed') => {
    // Note: If the API sends base64 in the future, we would convert it to a Blob here.
    // For now, strictly following the prompt's implied behavior (Toast/Mock).
    const fileName = type === 'original' ? item.originalDocument : item.processedDocument;
    toast.success(`Downloading ${fileName}...`);
  };

  const handleDelete = (id: string) => {
    // API NOTE: No delete endpoint provided in instructions.
    // Implementing Optimistic UI update only.
    if(confirm("Are you sure? This will hide the item from your view.")) {
      setHistory(history.filter(item => item.id !== id));
      toast.success('History item removed');
    }
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // --- Render ---

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Document History</h2>
          <p className="text-muted-foreground">
            Track and access all your processed documents
          </p>
        </div>
        <Button variant="outline" onClick={fetchHistory} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Documents</p>
              <p className="text-2xl font-semibold">{history.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Successfully Processed</p>
              <p className="text-2xl font-semibold">{getTotalProcessed()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <FileText className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-semibold">{getTotalFailed()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by document name or tool..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterTool} onValueChange={setFilterTool}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Tools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tools</SelectItem>
              <SelectItem value="AI Court Indexing">AI Court Indexing</SelectItem>
              <SelectItem value="OCR Processing">OCR Processing</SelectItem>
              <SelectItem value="OCR Tool">OCR Tool</SelectItem>
              <SelectItem value="Text Extractor">Text Extractor</SelectItem>
              <SelectItem value="Master Deduplication">Master Deduplication</SelectItem>
              <SelectItem value="Entity Extraction">Entity Extraction</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: 'date' | 'name') => setSortBy(value)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={toggleSort} title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}>
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool</TableHead>
                <TableHead>Document Name</TableHead>
                <TableHead>Processed Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-center">Original</TableHead>
                <TableHead className="text-center">Processed</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow>
                 <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                   <div className="flex flex-col items-center gap-2">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                     <p>Loading processing history...</p>
                   </div>
                 </TableCell>
               </TableRow>
              ) : filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-12 w-12 text-muted-foreground/30" />
                      <p>No processing history found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <TableCell>
                      <Badge variant="outline">{item.tool}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.documentName}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDateTime(item.processedTime)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.fileSize}</TableCell>
                    <TableCell className="text-muted-foreground">{item.processingDuration}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewDocument(item, 'original')}
                          title="View original document"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDownload(item, 'original')}
                          title="Download original"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewDocument(item, 'processed')}
                          disabled={item.status !== 'completed'}
                          title="View processed document"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDownload(item, 'processed')}
                          disabled={item.status !== 'completed'}
                          title="Download processed"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Document Preview Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {viewType === 'original' ? 'Original Document' : 'Processed Document'}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument?.tool} - {selectedDocument?.documentName}
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg p-6 bg-muted/30 min-h-[400px] overflow-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">
                      {viewType === 'original' 
                        ? selectedDocument?.originalDocument 
                        : selectedDocument?.processedDocument}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedDocument?.fileSize} • Processed {selectedDocument?.processedTime ? formatDateTime(selectedDocument.processedTime) : ''}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => selectedDocument && handleDownload(selectedDocument, viewType)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <div className="text-center text-muted-foreground py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="mb-2">Document Preview</p>
                <p className="text-sm">
                  In a production environment, this would display the actual document content
                  using a document viewer or provide a download link.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedDocument(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}