import React, { useState, useRef, useEffect } from 'react';
import { EmergencyModal } from './EmergencyBanner';
import { Send, Sparkles, AlertTriangle, ShieldCheck, Heart, ArrowRight } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  loading: boolean;
  error: string;
  onSendMessage: (text: string) => void;
  activeSessionTitle: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  loading,
  error,
  onSendMessage,
  activeSessionTitle
}) => {
  const [input, setInput] = useState<string>('');
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestedQuestions = [
    { text: 'I have fever', label: 'I have fever' },
    { text: 'What are symptoms of diabetes?', label: 'Symptoms of diabetes' },
    { text: 'How can I improve sleep?', label: 'Improve sleep' },
    { text: 'I have a headache', label: 'I have a headache' }
  ];

  // Auto-scroll on messages or typing state change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Adjust input box height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const checkEmergencyKeywords = (text: string): boolean => {
    const keywords = [
      'chest pain', 'chest pressure', 'heart attack',
      'shortness of breath', 'difficulty breathing', 'gasping for air',
      'numbness on one side', 'stroke symptoms', 'face drooping',
      'sudden numbness', 'unable to speak', 'slurred speech',
      'anaphylaxis', 'throat closing', 'severe allergic', 'severe bleeding', 'heavy bleeding'
    ];
    const formatted = text.toLowerCase().trim();
    return keywords.some(k => formatted.includes(k));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const query = input.trim();
    setInput('');
    
    if (checkEmergencyKeywords(query)) {
      setIsEmergencyOpen(true);
    }
    
    onSendMessage(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden relative">
      <EmergencyModal isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} />

      {/* Chat header area */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-50 text-blue-600 p-2 rounded-xl border border-blue-100/50">
            <Heart className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
              {activeSessionTitle || 'MediCare AI Chatbot'}
              <Sparkles className="h-4 w-4 text-blue-500" />
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Gemini 2.5 Flash • Professional Guidance
            </p>
          </div>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
        <div className="max-w-[900px] mx-auto space-y-6">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={index} 
                className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-scale-up`}
              >
                <div 
                  className={`rounded-3xl p-4 sm:p-5 shadow-xs text-sm md:text-base leading-relaxed ${
                    isUser 
                      ? 'bg-blue-600 text-white rounded-br-none border border-blue-700' 
                      : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'
                  }`}
                  style={{
                    maxWidth: '75%',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {/* Parsing message Markdown tags simply */}
                  <div className="space-y-2">
                    {msg.parts[0].text.split('\n').map((line, lIdx) => {
                      if (line.startsWith('###')) {
                        return <h5 key={lIdx} className="font-bold text-slate-800 text-sm mt-3 mb-1">{line.replace('###', '').trim()}</h5>;
                      }
                      if (line.startsWith('##') || line.startsWith('#')) {
                        return <h4 key={lIdx} className="font-extrabold text-slate-900 text-base mt-4 mb-1">{line.replace(/#+/g, '').trim()}</h4>;
                      }
                      if (line.startsWith('-') || line.startsWith('*')) {
                        return (
                          <li key={lIdx} className={`ml-4 list-disc py-0.5 ${isUser ? 'marker:text-blue-200' : 'marker:text-blue-500'}`}>
                            {line.substring(1).trim()}
                          </li>
                        );
                      }
                      if (line.trim().length === 0) return <div key={lIdx} className="h-1.5" />;
                      
                      const chunks = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <p key={lIdx}>
                          {chunks.map((chunk, cIdx) => {
                            if (chunk.startsWith('**') && chunk.endsWith('**')) {
                              return <strong key={cIdx} className={isUser ? 'text-white font-extrabold' : 'text-slate-950 font-extrabold'}>{chunk.slice(2, -2)}</strong>;
                            }
                            return chunk;
                          })}
                        </p>
                      );
                    })}
                  </div>

                  {/* Timestamp */}
                  <div className={`text-[9px] mt-3 pt-1.5 border-t font-semibold ${
                    isUser ? 'text-blue-200 border-blue-500' : 'text-slate-400 border-slate-100'
                  }`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Typing Indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-3xl rounded-bl-none border border-slate-100 p-4 shadow-xs flex items-center gap-1.5">
                <span className="h-2 w-2 bg-blue-500 rounded-full animate-typing-dot-1"></span>
                <span className="h-2 w-2 bg-blue-500 rounded-full animate-typing-dot-2"></span>
                <span className="h-2 w-2 bg-blue-500 rounded-full animate-typing-dot-3"></span>
                <span className="text-xs text-slate-400 font-bold ml-1.5">MediCare AI is typing...</span>
              </div>
            </div>
          )}

          {/* Local API error banner */}
          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-semibold max-w-md flex items-center gap-2 shadow-xs">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Sticky Bottom Actions & Input */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0">
        <div className="max-w-[900px] mx-auto space-y-4">
          
          {/* Suggested Questions (only show when starting chat session) */}
          {messages.length <= 1 && !loading && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Suggested Questions
              </span>
              <div className="grid grid-cols-2 gap-2">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSendMessage(q.text)}
                    className="text-left bg-[#F8FAFC] hover:bg-blue-50/50 border border-slate-200/60 hover:border-blue-200 rounded-2xl p-3 text-xs font-semibold text-slate-655 hover:text-blue-600 transition-all flex items-center justify-between group active:scale-[0.99] shadow-2xs"
                  >
                    <span>{q.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all shrink-0 text-blue-600 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input Box */}
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/15 focus-within:border-blue-500 transition-all flex items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your health questions here... (Enter to send, Shift+Enter for new line)"
                rows={1}
                disabled={loading}
                className="w-full bg-transparent border-none outline-hidden text-sm font-semibold text-slate-800 resize-none max-h-44 pr-2 focus:ring-0 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3.5 rounded-2xl transition-all shadow-md shadow-blue-100 shrink-0 flex items-center justify-center active:scale-95 cursor-pointer"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>

          {/* Bottom Disclaimer */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold select-none text-center">
            <ShieldCheck className="h-4 w-4 text-blue-500" />
            <span>This chatbot provides informational guidance only and is not a substitute for professional medical advice.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
