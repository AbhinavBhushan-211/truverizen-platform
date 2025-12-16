import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Upload, FileText, X } from 'lucide-react';
import { useCourtIndexStore } from '../../../store/courtIndex.slice';
import { generateCaseId, generateDocumentId } from '../../../utils/caseIdGenerator';
import { formatFileSize } from '../../../utils/fileToBase64';

export function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { addDocument, setCurrentDocument } = useCourtIndexStore();
  const navigate = useNavigate();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    const newDocument = {
      id: generateDocumentId(),
      caseId: generateCaseId(),
      fileName: selectedFile.name,
      uploadDate: new Date().toISOString(),
      status: 'processing' as const,
      pageCount: Math.floor(Math.random() * 50) + 10, // Mock page count
      file: selectedFile, // Store the actual file for API processing
    };

    addDocument(newDocument);
    setCurrentDocument(newDocument);
    navigate('/apps/court-index/processing');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2>Upload Document</h2>
        <p className="text-muted-foreground">
          Upload a court document to begin AI-powered indexing
        </p>
      </div>

      <Card className="p-8">
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!selectedFile ? (
            <>
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">Drop your file here</h3>
              <p className="text-muted-foreground mb-6">
                or click to browse (PDF files only, max 50MB)
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button asChild>
                  <span>Select File</span>
                </Button>
              </label>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4 p-4 bg-muted rounded-lg">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1 text-left">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleUpload} size="lg">
                Start Processing
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4">Upload Guidelines</h3>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Only PDF files are supported</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Maximum file size is 50MB</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Documents should be clear and legible for best results</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Processing time varies based on document complexity</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
