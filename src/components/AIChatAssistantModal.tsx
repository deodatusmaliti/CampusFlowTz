import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User as UserIcon, 
  MapPin, 
  Clock, 
  BookOpen, 
  Lightbulb, 
  Check, 
  Copy,
  ArrowRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { User, AIChatMessage } from '../types';
import { AIService } from '../services/aiService';

interface AIChatAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  initialPrompt?: string;
  onNavigateTab?: (tab: string) => void;
}

export const AIChatAssistantModal: React.FC<AIChatAssistantModalProps> = ({
  isOpen,
  onClose,
  user,
  initialPrompt,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      content: `Hello **${user.name}**! 👋 I am your **CampusFlow Academic AI Mentor**.\n\nI can help you navigate your semester timetable (like **Hall 03** sessions with **Prof. Assad**), organize study strategies for **BIO 203**, **ZOO 201**, **CHE 201**, review past exam papers, and project your GPA.\n\nWhat would you like assistance with today?`,
      timestamp: 'Just now',
      suggestedActions: [
        { label: 'Next Class & Hall 03 Venue', prompt: 'What is my next class and where is Hall 03?' },
        { label: 'Biostatistics Study Guide', prompt: 'Give me a study guide for BIO 203 Biostatistics & R-Studio' },
        { label: 'Faculty Consultation Hours', prompt: 'What are the consultation office hours for Prof. Assad and Dr. Mushi?' },
        { label: 'GPA Target Calculation', prompt: 'How do I maintain a First Class / Upper Second GPA at UDSM?' },
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle initial prompt if triggered from elsewhere
  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendPrompt(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  if (!isOpen) return null;

  const handleSendPrompt = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMessage: AIChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await AIService.sendMessage(query, {
        userName: user.name,
        university: user.university,
        programme: user.programme,
        year: user.currentYear,
      });

      const assistantMessage: AIChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: AIChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'system',
        content: 'Unable to reach AI mentor server. Please check connection and retry.',
        timestamp: 'Just now',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        id="ai-study-chatbox-modal"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[88vh] flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shadow-xs">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">CampusFlow Academic AI Mentor</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Personalized study guidance for {user.programme} ({user.university})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender !== 'user' && (
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs text-xs font-bold">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-2xs space-y-2 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-xs'
                    : msg.sender === 'system'
                    ? 'bg-rose-50 border border-rose-200 text-rose-800'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-line">
                  {msg.content}
                </div>

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (action.prompt) handleSendPrompt(action.prompt);
                          if (action.actionTab && onNavigateTab) {
                            onNavigateTab(action.actionTab);
                            onClose();
                          }
                        }}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/80 transition-colors flex items-center gap-1"
                      >
                        <span>{action.label}</span>
                        <ArrowRight className="w-3 h-3 text-sky-500" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Footer timestamp & copy button */}
                <div className={`flex items-center justify-between pt-1 text-[10px] ${
                  msg.sender === 'user' ? 'text-sky-200' : 'text-slate-400'
                }`}>
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-slate-700 flex items-center gap-1 text-[10px] ml-2"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs text-xs font-bold">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-2xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-sky-600 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-sky-700 animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-xs text-slate-500 font-medium ml-1">AI Mentor is analyzing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              id="ai-assistant-input"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder="Ask about timetable, Hall 03, Prof. Assad, study tips..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden transition-colors"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
