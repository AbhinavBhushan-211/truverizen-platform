import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Copy, 
  ScanText, 
  FileSearch,
  Sparkles,
  Database
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

const applications = [
  {
    id: 'court-index',
    title: 'AI Court Index File',
    description: 'Automatically generate index files from court documents with AI-powered classification',
    icon: FileText,
    path: '/app/court-index/upload',
    color: 'bg-blue-500',
  },
  {
    id: 'deduplication',
    title: 'Deduplication Tool',
    description: 'Identify and remove duplicate documents across your database',
    icon: Copy,
    path: '/app/deduplication',
    color: 'bg-green-500',
    comingSoon: true,
  },
  {
    id: 'ocr',
    title: 'OCR Document Extractor',
    description: 'Extract text from scanned documents and images with high accuracy',
    icon: ScanText,
    path: '/app/ocr',
    color: 'bg-purple-500',
    comingSoon: true,
  },
  {
    id: 'entity-extraction',
    title: 'Entity Extraction',
    description: 'Extract key entities like names, dates, and organizations from documents',
    icon: FileSearch,
    path: '/app/entity-extraction',
    color: 'bg-orange-500',
    comingSoon: true,
  },
  {
    id: 'ai-summarization',
    title: 'AI Summarization',
    description: 'Generate concise summaries of lengthy legal documents',
    icon: Sparkles,
    path: '/app/ai-summarization',
    color: 'bg-pink-500',
    comingSoon: true,
  },
  {
    id: 'data-classification',
    title: 'Data Classification',
    description: 'Automatically classify and organize documents by type and content',
    icon: Database,
    path: '/app/data-classification',
    color: 'bg-indigo-500',
    comingSoon: true,
  },
];

export function ApplicationsPage() {
  const navigate = useNavigate();

  const handleAppClick = (app: typeof applications[0]) => {
    if (app.comingSoon) {
      return;
    }
    navigate(app.path);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Applications</h1>
        <p className="text-gray-600">Select an application to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app) => {
          const Icon = app.icon;
          return (
            <Card
              key={app.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                app.comingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-1'
              }`}
              onClick={() => handleAppClick(app)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`${app.color} p-3 rounded-lg text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {app.comingSoon && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>
                <CardTitle className="mt-4">{app.title}</CardTitle>
                <CardDescription>{app.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
