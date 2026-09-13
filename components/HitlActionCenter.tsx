'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Wallet,
  DollarSign,
  UserCheck,
  History,
  SlidersHorizontal,
} from 'lucide-react';
import { Signal, PortfolioSetting } from '@/lib/db/types';

interface HitlActionCenterProps {
  pendingSignals: Signal[];
  allSignals: Signal[];
  settings: PortfolioSetting;
  onApprove: (signalId: string, customAmount?: number) => Promise<void>;
  onReject: (signalId: string) => Promise<void>;
  onRefresh: () => void;
}

export function HitlActionCenter({
  pendingSignals,
  allSignals,
  settings,
  onApprove,
  onReject,
  onRefresh,
}: HitlActionCenterProps) {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'AUDIT'>('PENDING');
  const [editingAmountId, setEditingAmountId] = useState<string | null>(null);
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAmountChange = (signalId: string, amount: number) => {
    setCustomAmounts((prev) => ({ ...prev, [signalId]: amount }));
  };

  const handleExecuteApprove = async (signal: Signal) => {
    setProcessingId(signal.id);
    try {
      const amount = customAmounts[signal.id] || signal.recommendedAmount;
      await onApprove(signal.id, amount);
      setEditingAmountId(null);
    } finally {
      setProcessingId(null);
    }
  };

  const handleExecuteReject = async (signalId: string) => {
    setProcessingId(signalId);
    try {
      await onReject(signalId);
    } finally {
      setProcessingId(null);
    }
  };

  // Past audited decisions
  const auditedSignals = allSignals.filter(
    (s) => s.status === 'APPROVED' || s.status === 'EXECUTED' || s.status === 'REJECTED'
  );

  return (
    <div className="rounded-2xl glass-panel p-6 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Header with Title and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/10 border border-amber-500/30 text-amber-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Human-In-The-Loop (HITL) Action Center
              </h2>
              {pendingSignals.length > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 animate-bounce">
                  {pendingSignals.length} Action Needed
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  All Clean
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Capital protection safeguard: Mathematical triggers generate accumulation proposals requiring your explicit review.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'PENDING'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending Orders ({pendingSignals.length})
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'AUDIT'
                ? 'bg-slate-800 text-slate-100 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit Trail ({auditedSignals.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Pending Action Queue */}
      {activeTab === 'PENDING' && (
        <div className="mt-5 space-y-4">
          {pendingSignals.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/30">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <h3 className="text-sm font-semibold text-slate-200">No Pending Dip Orders</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Both ETFs are currently hovering outside the strict accumulation mandate (RSI &gt; 35).
                Use the <span className="text-amber-400 font-semibold">&quot;Trigger Cron&quot;</span> button above to simulate a live dip trigger.
              </p>
            </div>
          ) : (
            pendingSignals.map((signal) => {
              const isGold = signal.symbol.includes('GOLD');
              const amount = customAmounts[signal.id] || signal.recommendedAmount;
              const isEditing = editingAmountId === signal.id;
              const isBusy = processingId === signal.id;

              return (
                <div
                  key={signal.id}
                  className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-slate-900 p-4.5 transition-all shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    
                    {/* Signal Info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                            isGold
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-700/50 text-slate-200 border border-slate-600/30'
                          }`}
                        >
                          {signal.symbol}
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          @ ₹{signal.price.toFixed(2)}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          RSI: {signal.rsi.toFixed(1)}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          50-EMA: ₹{signal.ema50.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-xs text-amber-200 font-medium flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{signal.conditionTriggered}</span>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Generated {new Date(signal.createdAt).toLocaleTimeString('en-IN', { hour12: true })} • 
                        Source: Sweep-in Capital Pipeline
                      </div>
                    </div>

                    {/* Allocation & Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 self-end md:self-auto">
                      
                      {/* Allocation Adjustment */}
                      <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 flex items-center space-x-2">
                        <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Allocation</span>
                          {isEditing ? (
                            <div className="flex items-center space-x-1 mt-0.5">
                              <span className="text-xs font-mono text-slate-400">₹</span>
                              <input
                                type="number"
                                step="500"
                                value={amount}
                                onChange={(e) =>
                                  handleAmountChange(signal.id, Number(e.target.value))
                                }
                                className="w-20 bg-slate-800 text-white font-mono text-xs px-1.5 py-0.5 rounded border border-amber-500 focus:outline-none"
                              />
                              <button
                                onClick={() => setEditingAmountId(null)}
                                className="text-[10px] text-amber-400 font-bold px-1 hover:underline cursor-pointer"
                              >
                                Done
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1.5">
                              <span className="text-sm font-black text-white font-mono">
                                ₹{amount.toLocaleString('en-IN')}
                              </span>
                              <button
                                onClick={() => setEditingAmountId(signal.id)}
                                title="Adjust Allocation Amount"
                                className="text-[10px] text-slate-400 hover:text-amber-400 cursor-pointer"
                              >
                                <SlidersHorizontal className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Approve & Reject Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          disabled={isBusy}
                          onClick={() => handleExecuteApprove(signal)}
                          className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isBusy ? 'Processing...' : `Approve & Deploy`}</span>
                        </button>

                        <button
                          disabled={isBusy}
                          onClick={() => handleExecuteReject(signal.id)}
                          className="flex items-center space-x-1 bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Audited History */}
      {activeTab === 'AUDIT' && (
        <div className="mt-5 space-y-2.5">
          {auditedSignals.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No historical human decisions recorded yet.
            </div>
          ) : (
            auditedSignals.slice(0, 5).map((signal) => (
              <div
                key={signal.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                      signal.status === 'APPROVED' || signal.status === 'EXECUTED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {signal.status}
                  </span>
                  <div>
                    <span className="font-semibold text-white">{signal.symbol}</span>
                    <span className="text-slate-500 text-[11px] ml-2 font-mono">
                      @ ₹{signal.price.toFixed(2)} (RSI: {signal.rsi.toFixed(1)})
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-slate-200">
                    ₹{signal.recommendedAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Via {signal.approvedBy || 'INVESTOR'} •{' '}
                    {new Date(signal.updatedAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
