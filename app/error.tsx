'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, Database } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Layer 2 Error Boundary Captured:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-[#111827]/90 border border-amber-500/30 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-amber-950/20">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Layer 2 Active Protection
            </span>
            <h1 className="text-xl font-bold text-white">Live Feed Temporarily Disconnected</h1>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          The quantitative data layer encountered a connection or rendering exception. As per the{' '}
          <strong className="text-amber-300">&gt;99% Anti-Crash Mandate</strong>, the interface
          has safely decoupled from live stream mutations to prevent data loss or false orders.
        </p>

        <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 text-xs font-mono text-slate-400 mb-6 overflow-x-auto">
          <div className="text-amber-400 font-semibold mb-1">Diagnostic Signature:</div>
          <div>{error.message || 'Unknown network rendering boundary breach'}</div>
          {error.digest && <div className="text-slate-500 mt-1">Digest: {error.digest}</div>}
        </div>

        <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4 mb-6 flex items-start space-x-3">
          <Database className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-200">
            <strong>Failsafe Mode Active:</strong> Capital reserves and HDFC Sweep-in funds are secure.
            No automated trades can be executed while this boundary is asserted.
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => reset()}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Restore Live Feed</span>
          </button>

          <a
            href="/"
            className="text-xs text-slate-400 hover:text-slate-200 underline transition-colors"
          >
            Reload Dashboard Fresh
          </a>
        </div>
      </div>
    </div>
  );
}
