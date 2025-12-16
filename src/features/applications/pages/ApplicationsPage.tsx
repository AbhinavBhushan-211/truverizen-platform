import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { FileText, FileSearch, Copy, Brain, ArrowRight } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';

interface Application {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: 'available' | 'coming-soon';
  path?: string;
  // Removed 'stats' property from interface
}

const applications: Application[] = [
  {
    id: 'court-index',
    name: 'AI Court Index File',
    description: 'Automatically index and organize court documents with AI-powered analysis',
    icon: FileText,
    status: 'available',
    path: '/apps/court-index',
  },
  {
    id: 'ocr',
    name: 'OCR Processing',
    description: 'Extract text from scanned documents and images with high accuracy',
    icon: FileSearch,
    status: 'coming-soon',
  },
  {
    id: 'deduplication',
    name: 'Master Deduplication',
    description: 'Advanced data deduplication with configurable matching criteria and filters',
    icon: Copy,
    status: 'available',
    path: '/apps/master-deduplication',
  },
  {
    id: 'entity-extraction',
    name: 'Entity Extraction',
    description: 'Extract key entities like names, dates, and locations from documents',
    icon: Brain,
    status: 'coming-soon',
  },
];

export function ApplicationsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h2>Applications</h2>
        <p className="text-muted-foreground">
          Select an application to get started
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {applications.map((app) => {
          const Icon = app.icon;
          const isAvailable = app.status === 'available';

          return (
            <Card key={app.id} className="relative overflow-hidden flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{app.name}</CardTitle>
                    </div>
                  </div>
                  {!isAvailable && (
                    <Badge variant="secondary">Coming Soon</Badge>
                  )}
                </div>
                <CardDescription className="mt-2">
                  {app.description}
                </CardDescription>
              </CardHeader>
              
              {/* Added mt-auto to push button to bottom if cards have different heights */}
              <CardContent className="mt-auto pt-0">
                <Button
                  className="w-full"
                  onClick={() => app.path && navigate(app.path)}
                  disabled={!isAvailable}
                >
                  {isAvailable ? (
                    <>
                      Open Application
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    'Coming Soon'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}