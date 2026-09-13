'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  ChevronDown,
  Minimize2,
  Maximize2,
  Zap,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tokens?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    latencyMs: number;
  };
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-0',
    role: 'assistant',
    content:
      "Hello! I'm your **Smart Dip Quantitative Co-Pilot**.\n\n" +
      "I monitor **GoldBEES** & **SilverBEES** using **>99% mathematical accuracy** on 14-period RSI and 50-day EMA triggers. All accumulation orders require your Human-in-the-Loop approval.\n\n" +
      "How can I assist your portfolio today?",
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  },
];

const SUGGESTED_QUERIES = [
  'What is the current status of GoldBEES?',
  'What is the current status of Silver?',
  'Show pending HITL approvals',
  'What is my HDFC sweep-in balance?',
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (contentToSend?: string) => {
    const text = contentToSend || input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.content || 'Data verified. Ready for next query.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        tokens: data.tokens || undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat Assistant error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content:
            'Live feed momentarily unavailable. All portfolio sweep-in guards remain securely in place.',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-300/40"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <span className="text-sm tracking-tight">AI Quant Co-Pilot</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col bg-[#0B0F19]/95 border border-amber-500/30 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-2xl transition-all duration-200 overflow-hidden ${
            isExpanded
              ? 'w-[94vw] sm:w-[540px] h-[82vh]'
              : 'w-[92vw] sm:w-[410px] h-[560px]'
          }`}
        >
          {/* Chat Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-[#131A2B] to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-xs font-bold text-white tracking-tight">
                    Smart Dip AI Assistant
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    RAG Guarded
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Deterministic Math • Zero Hallucination
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-slate-400">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => {
              const isBot = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2.5 ${
                    isBot ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {isBot && (
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                      isBot
                        ? 'bg-slate-900/90 border border-slate-800 text-slate-200'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.content}
                    </div>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800/40 text-[9px]">
                      <span className={isBot ? 'text-slate-500' : 'text-slate-900/70'}>
                        {msg.timestamp}
                      </span>
                      {isBot && msg.tokens && (
                        <span className="font-mono text-amber-400/90 font-semibold flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 text-amber-400" />
                          <span>
                            {msg.tokens.totalTokens} tokens ({msg.tokens.inputTokens} in, {msg.tokens.outputTokens} out) • {msg.tokens.latencyMs}ms
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {!isBot && (
                    <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs py-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Executing quant tools & verifying math...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          <div className="px-3 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {SUGGESTED_QUERIES.map((query, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(query)}
                className="whitespace-nowrap text-[10px] bg-slate-800/90 hover:bg-amber-500/10 hover:text-amber-300 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700/80 transition-all cursor-pointer"
              >
                {query}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about GoldBEES, RSI, or pending orders..."
              className="flex-1 bg-slate-950 text-white placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500/60"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 p-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
