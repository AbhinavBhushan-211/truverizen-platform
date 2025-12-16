import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { useCourtIndexStore } from '../../../store/courtIndex.slice';
import { Loader2, CheckCircle, FileText, Brain, List, AlertCircle } from 'lucide-react';
import { processDocument, fileToBase64 } from '../../../services/aiIndexingService';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  icon: any;
}

export function ProcessingPage() {
  const { currentDocument, updateDocument } = useCourtIndexStore();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: 'upload', label: 'File Upload', status: 'completed', icon: FileText },
    { id: 'ocr', label: 'Text Extraction', status: 'pending', icon: Brain },
    { id: 'index', label: 'AI Indexing', status: 'pending', icon: List },
  ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentDocument) {
      navigate('/apps/court-index');
      return;
    }

    if (!currentDocument.file) {
      setError('No file found for processing');
      updateDocument(currentDocument.id, { status: 'failed', error: 'No file found' });
      return;
    }

    const processFile = async () => {
      try {
        // Step 1: Convert to base64
        setSteps([
          { id: 'upload', label: 'File Upload', status: 'completed', icon: FileText },
          { id: 'ocr', label: 'Text Extraction', status: 'processing', icon: Brain },
          { id: 'index', label: 'AI Indexing', status: 'pending', icon: List },
        ]);
        setProgress(10);

        const originalBase64 = await fileToBase64(currentDocument.file!);

        setProgress(30);

        // Step 2: Call AI indexing API
        setSteps([
          { id: 'upload', label: 'File Upload', status: 'completed', icon: FileText },
          { id: 'ocr', label: 'Text Extraction', status: 'completed', icon: Brain },
          { id: 'index', label: 'AI Indexing', status: 'processing', icon: List },
        ]);
        setProgress(50);

        const response = await processDocument(currentDocument.file!);

        setProgress(90);

        // Step 3: Complete processing
        setSteps([
          { id: 'upload', label: 'File Upload', status: 'completed', icon: FileText },
          { id: 'ocr', label: 'Text Extraction', status: 'completed', icon: Brain },
          { id: 'index', label: 'AI Indexing', status: 'completed', icon: List },
        ]);
        setProgress(100);

        // Update document with processed data
        updateDocument(currentDocument.id, {
          status: 'completed',
          originalBase64,
          processedBase64: response.processed_base64,
          indexData: {
            entries: [], // API doesn't return structured index data yet
            remarks: 'Document processed successfully',
          },
        });

        toast.success('Document processed successfully!');

        setTimeout(() => {
          navigate('/apps/court-index/result');
        }, 1000);
      } catch (err) {
        console.error('Processing error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';

        setError(errorMessage);
        setSteps((prev) =>
          prev.map((step) =>
            step.status === 'processing' ? { ...step, status: 'failed' as const } : step
          )
        );

        updateDocument(currentDocument.id, {
          status: 'failed',
          error: errorMessage,
        });

        toast.error('Processing failed: ' + errorMessage);
      }
    };

    processFile();
  }, [currentDocument?.id]); // Only depend on ID to avoid re-running

  if (!currentDocument) {
    return null;
  }

  const handleRetry = () => {
    navigate('/apps/court-index');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h2>Processing Document</h2>
        <p className="text-muted-foreground">
          AI is analyzing and indexing your document
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          {/* Document Info */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="font-medium">{currentDocument.fileName}</p>
              <p className="text-muted-foreground">
                Case ID: {currentDocument.caseId}
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Processing Failed</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
              <Button onClick={handleRetry} variant="outline">
                Back to Upload
              </Button>
            </div>
          )}

          {/* Progress Bar */}
          {!error && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Overall Progress</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Processing Steps */}
          <div className="space-y-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className="flex items-center gap-4 p-4 rounded-lg border"
                >
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : step.status === 'processing' ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : step.status === 'failed' ? (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{step.label}</p>
                    <p className="text-muted-foreground capitalize">
                      {step.status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {!error && (
        <Card className="p-6 bg-muted/50">
          <p className="text-center text-muted-foreground">
            This may take a few minutes. Please don't close this page.
          </p>
        </Card>
      )}
    </div>
  );
}
