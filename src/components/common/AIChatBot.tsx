import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Trash2, ChevronDown, Copy, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AI_RESPONSES: { [key: string]: string } = {
  hello: "Hello! I'm your Truverizen AI Assistant. I can help you with document processing, deduplication, user management, and navigating the platform. How can I assist you today?",
  help: "I can help you with:\n• Master Deduplication - Upload and deduplicate documents\n• Court Index Processing - Process court index files\n• Dashboard Analytics - View processing statistics\n• User Management - Manage users and roles\n• History Tracking - View processing history\n\nWhat would you like to know more about?",
  deduplication: "Master Deduplication allows you to:\n• Upload Excel/CSV files\n• Define match criteria for finding duplicates\n• Set conflict resolution rules\n• Configure output columns\n• Preview and export deduplicated data\n• Save and load configurations\n\nWould you like specific help with any of these features?",
  'court index': "Court Index Processing helps you:\n• Upload court index files\n• Extract and process legal documents\n• Generate structured output\n• Track processing status\n\nIs there a specific part you need help with?",
  dashboard: "The Dashboard shows:\n• Total processing count\n• Active users statistics\n• Recent activity feed\n• Quick access to all applications\n• Processing history and analytics\n\nWhat specific information are you looking for?",
  users: "User Management features:\n• Add/remove users\n• Assign roles (Admin, User, Viewer)\n• Manage company access\n• Track user activity\n• Control permissions\n\nDo you need help with a specific user management task?",
  history: "Processing History shows:\n• All past processing jobs\n• User-specific activity\n• Processing status and results\n• Download processed files\n• Filter and search capabilities\n\nWhat would you like to view in the history?",
  default: "I'm here to help you with the Truverizen Platform. You can ask me about:\n• How to use specific features\n• Master Deduplication\n• Court Index Processing\n• Dashboard and Analytics\n• User Management\n• Processing History\n\nWhat would you like to know?"
};

const QUICK_ACTIONS = [
  "How do I deduplicate files?",
  "Show me dashboard features",
  "How to manage users?",
  "What's in processing history?"
];

const getAIResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return AI_RESPONSES.hello;
  }
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return AI_RESPONSES.help;
  }
  if (lowerMessage.includes('deduplica')) {
    return AI_RESPONSES.deduplication;
  }
  if (lowerMessage.includes('court') || lowerMessage.includes('index')) {
    return AI_RESPONSES['court index'];
  }
  if (lowerMessage.includes('dashboard') || lowerMessage.includes('analytics')) {
    return AI_RESPONSES.dashboard;
  }
  if (lowerMessage.includes('user') && (lowerMessage.includes('manage') || lowerMessage.includes('add') || lowerMessage.includes('role'))) {
    return AI_RESPONSES.users;
  }
  if (lowerMessage.includes('history') || lowerMessage.includes('past') || lowerMessage.includes('previous')) {
    return AI_RESPONSES.history;
  }
  
  return AI_RESPONSES.default;
};

export function AIChatBot() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm TARA (Truverizen AI Research Assistant), your intelligent platform companion. 👋\n\nI'm here to guide you through document processing, answer questions, and help you maximize platform efficiency. What would you like to know?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reliable scroll to bottom function
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    if (messagesContainerRef.current) {
      // Try both methods to ensure reliability
      const container = messagesContainerRef.current;
      
      // Method 1: scrollTop
      if (behavior === 'auto') {
        container.scrollTop = container.scrollHeight;
      } else {
        // Method 2: scrollIntoView
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
    setShowScrollButton(false);
  };

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      // Use setTimeout to ensure DOM is updated
      const timer = setTimeout(() => {
        scrollToBottom('auto');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        chatWindowRef.current &&
        !chatWindowRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Add slight delay to avoid immediate closure
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Handle window resize
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (isOpen) {
          scrollToBottom('auto');
        }
      }, 250);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(messageText),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      // Increment unread count if chat is closed
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        text: "Hello! I'm TARA (Truverizen AI Research Assistant), your intelligent platform companion. 👋\n\nI'm here to guide you through document processing, answer questions, and help you maximize platform efficiency. What would you like to know?",
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
    setShowClearDialog(false);
    toast.success('Chat history cleared');
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Message copied to clipboard');
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const showQuickActions = messages.length === 1 && !isTyping;

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="relative h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-4 border-white group overflow-hidden"
              size="icon"
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Avatar icon with sparkle effect */}
              <div className="relative z-10">
                <Sparkles className="h-7 w-7 absolute -top-1 -right-1 animate-pulse text-yellow-300" />
                <Bot className="h-7 w-7" />
              </div>
              
              {/* Unread badge */}
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold border-2 border-white"
                >
                  {unreadCount}
                </motion.div>
              )}
              
              {/* Pulse ring effect */}
              <span className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatWindowRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
            style={{ height: 'min(650px, calc(100vh - 3rem))' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] animate-gradient text-white p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full border-2 border-white/30">
                    <Bot className="h-6 w-6" />
                  </div>
                  {/* Online status indicator */}
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    TARA AI Assistant
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                  </h3>
                  <p className="text-xs text-blue-100">Online • Always ready to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowClearDialog(true)}
                  className="h-8 w-8 text-white hover:bg-white/20"
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => scrollToBottom('smooth')}
                  className="h-8 w-8 text-white hover:bg-white/20"
                  title="Scroll to bottom"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-white hover:bg-white/20"
                  title="Minimize"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-white hover:bg-white/20"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area - Fixed height with overflow */}
            <div 
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 p-4 bg-gradient-to-b from-gray-50 to-white overflow-y-auto"
              style={{ 
                maxHeight: '70vh',
                scrollBehavior: 'smooth'
              }}
            >
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex gap-3 group ${
                      message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center shadow-md ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                          : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                      }`}
                    >
                      {message.sender === 'user' ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <Bot className="h-5 w-5" />
                      )}
                    </div>
                    <div
                      className={`flex flex-col max-w-[75%] ${
                        message.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`rounded-2xl px-4 py-2.5 shadow-sm relative ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm'
                              : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                        </div>
                        {message.sender === 'ai' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyMessage(message.text)}
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy message"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 mt-1 px-2">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {/* Quick Action Buttons */}
                {showQuickActions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 pt-2"
                  >
                    <p className="text-xs text-gray-500 text-center mb-3">Quick actions:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {QUICK_ACTIONS.map((action, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          onClick={() => handleQuickAction(action)}
                          className="text-left text-sm px-4 py-2.5 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          {action}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-md">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-3 border border-gray-200 shadow-sm">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Scroll to Bottom Button */}
            <AnimatePresence>
              {showScrollButton && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-24 right-8 z-10"
                >
                  <Button
                    onClick={() => scrollToBottom('smooth')}
                    className="h-10 w-10 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
                    size="icon"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area - Fixed at bottom */}
            <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isTyping}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3" />
                Powered by Truverizen AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Chat Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all messages from your current conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearChat} className="bg-red-600 hover:bg-red-700">
              Clear Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}