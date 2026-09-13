'use client';

import React, { useState } from 'react';
import { Signal, SignalStatus } from '@/lib/db/types';
import { Filter, Check, Clock, X, AlertCircle } from 'lucide-react';

interface SignalsTableProps {
  signals: Signal[];
}

export function SignalsTable({ signals }: SignalsTableProps) {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredSignals = signals.filter((s) => {
    if (filter === 'ALL') return true;
    return s.status === filter;
  });

  return (
    <div className="rounded-2xl glass-panel p-6 border border-slate-800 shadow-xl overflow-hidden">
      {/* Table Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Signal Audit Ledger & Quant Records
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically tracked triggers recorded during Vercel Cron market hours scans.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'EXECUTED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === st
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st === 'ALL'
                ? 'All Signals'
                : st === 'PENDING_APPROVAL'
                ? 'Pending'
                : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[11px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
              <th className="pb-3 pl-2">Asset</th>
              <th className="pb-3">Market Price</th>
              <th className="pb-3">14-Period RSI</th>
              <th className="pb-3">50-Day EMA</th>
              <th className="pb-3">Mandate Trigger</th>
              <th className="pb-3">Allocation</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 pr-2 text-right">Detected At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredSignals.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No signals found matching this filter.
                </td>
              </tr>
            ) : (
              filteredSignals.map((signal) => {
                const isGold = signal.symbol.includes('GOLD');
                return (
                  <tr
                    key={signal.id}
                    className="hover:bg-slate-900/40 transition-colors font-mono"
                  >
                    <td className="py-3.5 pl-2 font-bold text-white flex items-center space-x-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isGold ? 'bg-amber-400' : 'bg-slate-400'
                        }`}
                      />
                      <span>{signal.symbol}</span>
                    </td>
                    <td className="py-3.5 text-slate-200 font-semibold">
                      ₹{signal.price.toFixed(2)}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          signal.rsi < 35
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'text-slate-300'
                        }`}
                      >
                        {signal.rsi.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400">
                      ₹{signal.ema50.toFixed(2)}
                    </td>
                    <td className="py-3.5 font-sans text-slate-300 max-w-[200px] truncate">
                      {signal.conditionTriggered}
                    </td>
                    <td className="py-3.5 font-bold text-emerald-400">
                      ₹{signal.recommendedAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase inline-flex items-center space-x-1 ${
                          signal.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            : signal.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : signal.status === 'EXECUTED'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        <span>{signal.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 text-right text-slate-500 text-[11px]">
                      {new Date(signal.createdAt).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
