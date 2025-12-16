import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Trash2,
  Maximize2,
  Minimize2,
  Paperclip,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';

/* ---------------- TYPES ---------------- */

interface UploadedFile {
  id: string;
  name: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
}

/* ---------------- QUICK DEMO ACTIONS ---------------- */

const QUICK_ACTIONS = [
  {
    label: 'Document Processing',
    message: 'Show how document processing works',
  },
  {
    label: 'Business Intelligence',
    message: 'Show a business intelligence query example',
  },
  {
    label: 'Platform Navigation',
    message: 'Help me navigate the platform',
  },
  {
    label: 'Upload & Analyze Document',
    message: 'How do I upload and analyze a document?',
  },
];

/* ---------------- WEBSITE KNOWLEDGE (MVP) ---------------- */

const WEBSITE_KNOWLEDGE: Record<string, Message> = {
  document: {
    id: '',
    sender: 'ai',
    text:
      'Document Processing includes Court Indexing, OCR, and Deduplication. You can upload PDFs or Excel files and receive structured outputs.',
  },
  business: {
    id: '',
    sender: 'ai',
    text: 'Business Intelligence allows querying HR, loan, and customer data.',
    table: {
      headers: ['Metric', 'Value'],
      rows: [
        ['Total Loans', '1,234'],
        ['Active Users', '196'],
        ['Processed Documents', '4,892'],
      ],
    },
  },
  dashboard: {
    id: '',
    sender: 'ai',
    text:
      'The dashboard shows real-time stats, recent activity, and quick access to platform tools.',
  },
  upload: {
    id: '',
    sender: 'ai',
    text:
      'You can upload PDF, Excel, or CSV files. The AI can extract data, generate tables, and summaries.',
  },
};

/* ---------------- COMPONENT ---------------- */

export function TARAAssistant() {
  const { isAuthenticated } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text:
        "Hello! I'm TARA, your Truverizen AI Assistant. Select a demo option below or ask me anything.",
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isAuthenticated) return null;

  /* ---------------- HELPERS ---------------- */

  const closeChat = () => {
    setIsOpen(false);
    setIsMaximized(false);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: 'Chat cleared. How can I help you?',
      },
    ]);
    toast.success('Chat cleared');
  };

  const getWebsiteAwareResponse = (text: string): Message => {
    const lower = text.toLowerCase();

    for (const key in WEBSITE_KNOWLEDGE) {
      if (lower.includes(key)) {
        return {
          ...WEBSITE_KNOWLEDGE[key],
          id: Date.now().toString(),
        };
      }
    }

    return {
      id: Date.now().toString(),
      sender: 'ai',
      text:
        'I can help with document processing, business intelligence, and platform navigation. Try the demo options above.',
    };
  };

  const sendMessage = (preset?: string) => {
    const messageText = preset ?? input;
    if (!messageText.trim() && files.length === 0) return;

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: messageText || 'Uploaded files',
      },
    ]);

    setInput('');
    setFiles([]);

    setTimeout(() => {
      setMessages(prev => [...prev, getWebsiteAwareResponse(messageText)]);
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const uploaded = Array.from(e.target.files).map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
    }));

    setFiles(uploaded);
    toast.success(`${uploaded.length} file(s) attached`);
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      {/* BIG CHAT BUTTON */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="
            fixed bottom-6 right-6 z-40
            h-20 w-20 rounded-full
            bg-gradient-to-br from-blue-600 to-purple-600
            text-white shadow-2xl
            border-4 border-white
            animate-pulse
          "
          title="Ask TARA"
        >
          <Bot className="h-9 w-9" />
        </Button>
      )}

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={closeChat}
        />
      )}

      {/* CHAT WINDOW */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white shadow-2xl flex flex-col border
          ${
            isMaximized
              ? 'inset-0 rounded-none'
              : 'bottom-6 right-6 w-[420px] h-[620px] rounded-2xl'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center gap-2 font-semibold">
              <Bot className="h-5 w-5" />
              TARA AI Assistant
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={clearChat}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsMaximized(p => !p)}
              >
                {isMaximized ? <Minimize2 /> : <Maximize2 />}
              </Button>
              <Button size="icon" variant="ghost" onClick={closeChat}>
                <X />
              </Button>
            </div>
          </div>

          {/* MESSAGES */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-xl px-4 py-2 text-sm
                  ${
                    m.sender === 'user'
                      ? 'ml-auto bg-blue-600 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  {m.text}

                  {m.table && (
                    <div className="mt-3 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {m.table.headers.map(h => (
                              <TableHead key={h}>{h}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {m.table.rows.map((row, i) => (
                            <TableRow key={i}>
                              {row.map((cell, j) => (
                                <TableCell key={j}>{cell}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ))}

              {/* QUICK ACTIONS */}
              {messages.length === 1 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-gray-500 text-center">
                    Try a quick demo:
                  </p>
                  {QUICK_ACTIONS.map(action => (
                    <button
                      key={action.label}
                      onClick={() => sendMessage(action.message)}
                      className="
                        w-full text-left px-4 py-2 rounded-lg
                        border border-gray-200 bg-white
                        hover:bg-blue-50 hover:border-blue-400
                        transition text-sm
                      "
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* INPUT */}
          <div className="p-3 border-t flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip />
            </Button>
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask TARA..."
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <Button onClick={() => sendMessage()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
