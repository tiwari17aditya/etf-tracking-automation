'use client';

import React, { useState } from 'react';
import { AppLog, ChatSessionLog, LogLevel, LogCategory } from '@/lib/db/types';
import {
  FileText,
  Cpu,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Zap,
} from 'lucide-react';

interface TabularLogsProps {
  appLogs: AppLog[];
  chatLogs: ChatSessionLog[];
}

export function TabularLogs({ appLogs, chatLogs }: TabularLogsProps) {
  const [activeTab, setActiveTab] = useState<'APP_LOGS' | 'CHAT_TOKENS'>('APP_LOGS');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter application logs
  const filteredAppLogs = appLogs.filter((log) => {
    if (levelFilter !== 'ALL' && log.level !== levelFilter) return false;
    if (categoryFilter !== 'ALL' && log.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate token analytics
  const totalInputTokens = chatLogs.reduce((acc, c) => acc + c.inputTokens, 0);
  const totalOutputTokens = chatLogs.reduce((acc, c) => acc + c.outputTokens, 0);
  const totalChatTokens = totalInputTokens + totalOutputTokens;
  const avgLatency =
    chatLogs.length > 0
      ? Math.round(chatLogs.reduce((acc, c) => acc + c.latencyMs, 0) / chatLogs.length)
      : 0;

  return (
    <div className="rounded-2xl glass-panel p-6 border border-slate-800 shadow-xl overflow-hidden">
      
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Telemetry Logs & Chat Token Analytics</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Tabular Form
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live audit logs for serverless routines, quant calculations, and input/output token tracking.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start lg:self-auto text-xs">
          <button
            onClick={() => setActiveTab('APP_LOGS')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'APP_LOGS'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Application Logs ({appLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('CHAT_TOKENS')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'CHAT_TOKENS'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat & Token Usage ({chatLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Application Logs in Tabular Form */}
      {activeTab === 'APP_LOGS' && (
        <div className="mt-4 space-y-3">
          
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search log messages or details..."
                className="w-full bg-slate-950 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500/60 font-mono"
              />
            </div>

            {/* Level Filter */}
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-[11px] text-slate-500">Level:</span>
              {['ALL', 'INFO', 'SUCCESS', 'WARN', 'ERROR'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    levelFilter === lvl
                      ? 'bg-slate-700 text-white font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-[11px] text-slate-500">Category:</span>
              {['ALL', 'QUANT', 'CRON', 'HITL', 'CHAT'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tabular Application Logs */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="pb-2.5 pl-2">Timestamp</th>
                  <th className="pb-2.5">Level</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Event Message</th>
                  <th className="pb-2.5">Diagnostic Details</th>
                  <th className="pb-2.5 pr-2 text-right">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono text-xs">
                {filteredAppLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No logs matching the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredAppLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 pl-2 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour12: false })}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase inline-flex items-center space-x-1 ${
                            log.level === 'SUCCESS'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : log.level === 'WARN'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : log.level === 'ERROR'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {log.level}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-300 font-semibold">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/80 text-[10px]">
                          {log.category}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-100 font-sans">{log.message}</td>
                      <td className="py-2.5 text-slate-400 font-mono text-[11px] max-w-[280px] truncate">
                        {log.details || '—'}
                      </td>
                      <td className="py-2.5 pr-2 text-right text-slate-400 font-mono">
                        {log.latencyMs ? `${log.latencyMs}ms` : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Chat Sessions & Token Usage in Tabular Form */}
      {activeTab === 'CHAT_TOKENS' && (
        <div className="mt-4 space-y-4">
          
          {/* Token Analytics KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 block font-mono">
                Total Chat Prompts
              </span>
              <span className="text-lg font-black text-white font-mono mt-0.5 block">
                {chatLogs.length}
              </span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 block font-mono">
                Input (Prompt) Tokens
              </span>
              <span className="text-lg font-black text-amber-400 font-mono mt-0.5 block">
                {totalInputTokens.toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 block font-mono">
                Output (Completion) Tokens
              </span>
              <span className="text-lg font-black text-emerald-400 font-mono mt-0.5 block">
                {totalOutputTokens.toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 block font-mono">
                Avg Response Latency
              </span>
              <span className="text-lg font-black text-slate-100 font-mono mt-0.5 block">
                {avgLatency}ms
              </span>
            </div>
          </div>

          {/* Tabular Chat Session Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="pb-2.5 pl-2">Time</th>
                  <th className="pb-2.5">User Prompt</th>
                  <th className="pb-2.5">Assistant Output</th>
                  <th className="pb-2.5 text-center">Prompt Tokens</th>
                  <th className="pb-2.5 text-center">Completion Tokens</th>
                  <th className="pb-2.5 text-center">Total Tokens</th>
                  <th className="pb-2.5 pr-2 text-right">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono text-xs">
                {chatLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      No chat interactions recorded yet. Chat with the AI Co-Pilot to track tokens in real time!
                    </td>
                  </tr>
                ) : (
                  chatLogs.map((chat) => (
                    <tr key={chat.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 pl-2 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(chat.timestamp).toLocaleTimeString('en-IN', { hour12: false })}
                      </td>
                      <td className="py-3 text-slate-200 font-sans max-w-[200px] truncate font-medium">
                        &ldquo;{chat.userMessage}&rdquo;
                      </td>
                      <td className="py-3 text-slate-400 font-sans max-w-[240px] truncate">
                        {chat.assistantReply}
                      </td>
                      <td className="py-3 text-center text-amber-400 font-semibold">
                        {chat.inputTokens}
                      </td>
                      <td className="py-3 text-center text-emerald-400 font-semibold">
                        {chat.outputTokens}
                      </td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold text-slate-100">
                          {chat.totalTokens}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-right text-slate-400 font-mono">
                        {chat.latencyMs}ms
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
