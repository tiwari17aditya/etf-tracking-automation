'use client';

import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  Zap,
  Clock,
  Wallet,
  PlayCircle,
  RefreshCw,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { PortfolioSetting } from '@/lib/db/types';

interface HeaderProps {
  market: {
    isOpen: boolean;
    istTimeString: string;
    istDateString: string;
    statusText: string;
    nextEvent: string;
  };
  settings: PortfolioSetting;
  pendingCount: number;
  onRefresh: () => void;
  onTriggerScan: (simulateDip: boolean) => Promise<void>;
}

export function Header({
  market,
  settings,
  pendingCount,
  onRefresh,
  onTriggerScan,
}: HeaderProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [showSimulateMenu, setShowSimulateMenu] = useState(false);

  const handleRun = async (simulate: boolean) => {
    setIsRunning(true);
    setShowSimulateMenu(false);
    try {
      await onTriggerScan(simulate);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-[#0A0E1A]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-slate-900 border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  Smart Dip Accumulator
                  <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Vercel Edge
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>Gold & Silver ETFs</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-medium">&gt;99% Math Accuracy Mandate</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400 font-medium">HITL Active</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
            
            {/* Market Status Card */}
            <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <div className="flex items-center space-x-1.5">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    market.isOpen
                      ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse'
                      : 'bg-rose-500 shadow-sm shadow-rose-500/50'
                  }`}
                />
                <span className="font-semibold text-slate-200">
                  {market.isOpen ? 'NSE Active' : 'NSE Closed'}
                </span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center space-x-1 text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{market.istTimeString} IST</span>
              </div>
            </div>

            {/* Sweep-In Liquidity */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <div>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block leading-tight">
                  HDFC Sweep-In
                </span>
                <span className="font-bold text-slate-100 font-mono">
                  ₹{settings.sweepInBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Actions: Scan & Refresh */}
            <div className="flex items-center space-x-2 relative">
              <button
                onClick={() => onRefresh()}
                title="Refresh Live Data"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <div className="relative">
                <button
                  disabled={isRunning}
                  onClick={() => setShowSimulateMenu(!showSimulateMenu)}
                  className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  <PlayCircle className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Scanning...' : 'Trigger Cron'}</span>
                </button>

                {showSimulateMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0F172A] border border-slate-700 p-1.5 shadow-2xl z-50 text-xs">
                    <button
                      onClick={() => handleRun(false)}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Real Market Scan (NSE)</span>
                      <Activity className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      onClick={() => handleRun(true)}
                      className="w-full text-left px-3 py-2 rounded-lg text-amber-300 hover:bg-amber-500/10 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Simulate Dip Trigger (Test)</span>
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
