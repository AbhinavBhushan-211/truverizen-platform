import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourtIndexStore } from '../../../store/courtIndex.slice';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Download, CheckCircle2, FileText, Home, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { downloadProcessedDocument, downloadOriginalDocument, downloadBlob } from '../../../services/aiIndexingService';

export function DownloadPage() {
  const navigate = useNavigate();
  const currentDocument = useCourtIndexStore((state) => state.currentDocument);
  const clearCurrent = useCourtIndexStore((state) => state.clearCurrent);
  const [downloading, setDownloading] = useState(false);

  // Extract data from current document
  const caseId = currentDocument?.caseId || 'N/A';
  const fileName = currentDocument?.fileName || 'N/A';
  const indexEntries = currentDocument?.indexData?.entries || [];
  const remarks = currentDocument?.indexData?.remarks || '';

  const handleDownloadProcessed = () => {
    if (!currentDocument?.processedBase64) {
      toast.error('No processed document available');
      return;
    }

    setDownloading(true);
    try {
      const filename = `${caseId}_indexed_${fileName}`;
      downloadProcessedDocument(currentDocument.processedBase64, filename);
      toast.success('Processed document downloaded successfully');
    } catch (error) {
      toast.error('Failed to download processed document');
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadOriginal = () => {
    if (!currentDocument?.originalBase64) {
      toast.error('No original document available');
      return;
    }

    setDownloading(true);
    try {
      downloadOriginalDocument(currentDocument.originalBase64, fileName);
      toast.success('Original document downloaded successfully');
    } catch (error) {
      toast.error('Failed to download original document');
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (indexEntries.length === 0) {
      toast.error('No index entries to export');
      return;
    }

    setDownloading(true);
    try {
      // Create CSV content
      const headers = ['Section', 'Description', 'Page'];
      const rows = indexEntries.map(entry => [
        entry.section,
        entry.description,
        entry.page.toString()
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const filename = `${caseId}_index.csv`;
      downloadBlob(blob, filename);

      toast.success('CSV index downloaded successfully');
    } catch (error) {
      toast.error('Failed to download CSV');
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadAll = () => {
    setDownloading(true);

    // Download all files sequentially
    // Using setTimeout to allow browser to handle multiple downloads
    setTimeout(() => {
      handleDownloadProcessed();
      setTimeout(() => {
        handleDownloadOriginal();
        setTimeout(() => {
          handleDownloadCSV();
          setDownloading(false);
        }, 500); // Delay for CSV
      }, 500); // Delay for Original
    }, 100); // Initial delay
  };

  const handleNewDocument = () => {
    clearCurrent();
    navigate('/app/court-index/upload');
  };

  const handleBackToApps = () => {
    clearCurrent();
    navigate('/applications');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-12 pb-12">
          <div className="text-center space-y-8">
            <div>
              <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="mb-2">Processing Complete!</h2>
              <p className="text-gray-600">
                Your indexed document is ready for download
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Case ID</span>
                <span className="text-gray-900">{caseId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">File Name</span>
                <span className="text-gray-900 truncate max-w-xs">{fileName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sections Indexed</span>
                <span className="text-gray-900">{indexEntries.length}</span>
              </div>
              {remarks && (
                <div className="pt-4 border-t text-left">
                  <span className="text-sm text-gray-600 block mb-2">Remarks</span>
                  <p className="text-sm text-gray-900 bg-white p-3 rounded border">
                    {remarks}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg p-8 border border-blue-200 space-y-4">
              <FileText className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h3 className="mb-2 text-blue-900">Download Files</h3>
              <p className="text-sm text-blue-700 mb-6">
                Download individual files or all at once
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleDownloadProcessed}
                  disabled={downloading || !currentDocument?.processedBase64}
                  size="lg"
                  className="w-full max-w-xs"
                  variant="default"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Indexed PDF Document
                </Button>

                <Button
                  onClick={handleDownloadOriginal}
                  disabled={downloading || !currentDocument?.originalBase64}
                  size="lg"
                  className="w-full max-w-xs"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Original PDF Document
                </Button>

                <Button
                  onClick={handleDownloadCSV}
                  disabled={downloading || indexEntries.length === 0}
                  size="lg"
                  className="w-full max-w-xs"
                  variant="outline"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Index CSV File
                </Button>

                <div className="pt-4">
                  <Button
                    onClick={handleDownloadAll}
                    disabled={downloading}
                    size="lg"
                    className="w-full max-w-xs"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {downloading ? 'Preparing Downloads...' : 'Download All Files'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" onClick={handleNewDocument}>
                Process Another Document
              </Button>
              <Button variant="ghost" onClick={handleBackToApps}>
                <Home className="w-4 h-4 mr-2" />
                Back to Applications
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
