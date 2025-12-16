import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { useCourtIndexStore } from '../../../store/courtIndex.slice';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Download, ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { downloadProcessedDocument, downloadOriginalDocument } from '../../../services/aiIndexingService';
import { toast } from 'sonner';

export function ResultPage() {
  const { currentDocument, clearCurrent } = useCourtIndexStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('index');

  if (!currentDocument) {
    navigate('/apps/court-index');
    return null;
  }

  const indexEntries = currentDocument.indexData?.entries || [];
  const hasProcessedData = !!currentDocument.processedBase64;

  const handleDownloadProcessed = () => {
    if (!currentDocument.processedBase64) {
      toast.error('No processed document available');
      return;
    }

    try {
      const filename = `${currentDocument.caseId}_indexed_${currentDocument.fileName}`;
      downloadProcessedDocument(currentDocument.processedBase64, filename);
      toast.success('Processed document downloaded');
    } catch (error) {
      toast.error('Failed to download processed document');
      console.error(error);
    }
  };

  const handleDownloadOriginal = () => {
    if (!currentDocument.originalBase64) {
      toast.error('No original document available');
      return;
    }

    try {
      downloadOriginalDocument(currentDocument.originalBase64, currentDocument.fileName);
      toast.success('Original document downloaded');
    } catch (error) {
      toast.error('Failed to download original document');
      console.error(error);
    }
  };

  const handleNewDocument = () => {
    clearCurrent();
    navigate('/apps/court-index');
  };

  const handleGoToDownload = () => {
    navigate('/apps/court-index/download');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="mb-1">Processing Complete!</h2>
            <p className="text-muted-foreground">
              Your document has been successfully indexed
            </p>
          </div>
          <Button variant="outline" onClick={handleNewDocument}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </div>
      </Card>

      {/* Document Info */}
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-muted-foreground mb-1">Document Name</p>
            <p className="font-medium break-words" title={currentDocument.fileName}>
              {currentDocument.fileName}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Case ID</p>
            <p className="font-mono font-medium">{currentDocument.caseId}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Total Pages</p>
            <p className="font-medium">{currentDocument.pageCount || 'N/A'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Index Entries</p>
            <p className="font-medium">{indexEntries.length}</p>
          </div>
        </div>
      </Card>

      {/* Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="index">Index</TabsTrigger>
          <TabsTrigger value="preview">Document Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="index" className="space-y-4">
          <Card>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3>Generated Index</h3>
                <div className="flex gap-2">
                  <Button onClick={handleDownloadProcessed} disabled={!hasProcessedData}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Indexed PDF
                  </Button>
                  <Button variant="outline" onClick={handleDownloadOriginal}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Original
                  </Button>
                  <Button variant="outline" onClick={handleGoToDownload}>
                    View All Downloads
                  </Button>
                </div>
              </div>
            </div>
            {indexEntries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Page</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {indexEntries.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{entry.section}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="text-right">{entry.page}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">
                  {currentDocument.indexData?.remarks || 'No index entries available. The API processed the document successfully.'}
                </p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="p-12">
            <div className="text-center space-y-4">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3>Document Preview</h3>
                <p className="text-muted-foreground">
                  PDF preview would be displayed here
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <Button onClick={handleDownloadProcessed} disabled={!hasProcessedData}>
                  View Processed Document
                </Button>
                <Button variant="outline" onClick={handleDownloadOriginal}>
                  View Original Document
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}