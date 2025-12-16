import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../components/ui/accordion';
import { MessageSquare, Send, Book, Video, Mail, Paperclip, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';

const faqs = [
  {
    question: 'How do I upload a document?',
    answer:
      'Navigate to the Applications page, select the Court Index application, and click "Upload Document". You can drag and drop files or click to browse.',
  },
  {
    question: 'What file formats are supported?',
    answer:
      'We currently support PDF, DOCX, and TXT file formats. The maximum file size is 50MB per document.',
  },
  {
    question: 'How long does processing take?',
    answer:
      'Processing time varies based on document size and complexity. Most documents are processed within 2-5 minutes. You can track progress in real-time on the processing page.',
  },
  {
    question: 'Can I download the indexed results?',
    answer:
      'Yes! Once processing is complete, you can download the indexed document in PDF or Excel format from the results page.',
  },
  {
    question: 'How do I manage user permissions?',
    answer:
      'Admin users can manage permissions from the Users page. You can assign roles (Admin, User, Viewer) and control access to specific applications.',
  },
];

export function HelpPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [enableAttachments, setEnableAttachments] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccessDialog(true);
    // Reset form
    setSubject('');
    setMessage('');
    setAttachments([]);
    setEnableAttachments(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2>Help & Support</h2>
        <p className="text-muted-foreground">
          Find answers and get support for the Truverizen platform
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <Book className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Documentation</CardTitle>
            <CardDescription>
              Comprehensive guides and tutorials
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <Video className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Video Tutorials</CardTitle>
            <CardDescription>
              Step-by-step video walkthroughs
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <Mail className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Email Support</CardTitle>
            <CardDescription>
              Contact our support team
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Quick answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>Contact Support</CardTitle>
          </div>
          <CardDescription>
            Can't find what you're looking for? Send us a message
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
              />
            </div>

            {/* Attachment Toggle */}
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <Switch
                id="attachments"
                checked={enableAttachments}
                onCheckedChange={setEnableAttachments}
              />
              <Label htmlFor="attachments" className="cursor-pointer">
                Attach images or files to your request
              </Label>
            </div>

            {/* File Upload */}
            {enableAttachments && (
              <div className="space-y-2">
                <Label htmlFor="file-upload">Attachments</Label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported: Images, PDF, DOC, DOCX (Max 10MB per file)
                  </p>
                </div>

                {/* Attachment List */}
                {attachments.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(2)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button type="submit">
              <Send className="mr-2 h-4 w-4" />
              Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Submitted Successfully</DialogTitle>
            <DialogDescription className="space-y-2 pt-4">
              <p>
                Your query has been received and our support team will get back to you shortly.
              </p>
              <p className="text-sm text-muted-foreground">
                You will receive a confirmation email with your ticket number.
                Average response time is 24-48 hours.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowSuccessDialog(false)}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}