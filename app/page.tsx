'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { AssetCard } from '@/components/AssetCard';
import { HitlActionCenter } from '@/components/HitlActionCenter';
import { SignalsTable } from '@/components/SignalsTable';
import { CronTelemetry } from '@/components/CronTelemetry';
import { ChatWidget } from '@/components/ChatWidget';
import { Signal, MarketQuote, CronRunLog, PortfolioSetting } from '@/lib/db/types';
import { AlertCircle, CheckCircle2, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

interface DashboardState {
  market: {
    isOpen: boolean;
    istTimeString: string;
    istDateString: string;
    statusText: string;
    nextEvent: string;
  };
  quotes: Record<string, MarketQuote>;
  signals: Signal[];
  pendingSignals: Signal[];
  cronLogs: CronRunLog[];
  settings: PortfolioSetting;
  engine: string;
  telemetry: {
    accuracyMandate: string;
    layer1: string;
    layer2: string;
    layer3: string;
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{
    type: 'SUCCESS' | 'ALERT' | 'INFO';
    text: string;
  } | null>(null);

  const showToast = (text: string, type: 'SUCCESS' | 'ALERT' | 'INFO' = 'INFO') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const fetchDashboardData = useCallback(async (isRefresh: boolean = false) => {
    try {
      const res = await fetch(`/api/dashboard-data${isRefresh ? '?refresh=true' : ''}`);
      const json = await res.json();
      if (json) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      showToast('Live feed temporarily disconnected. Using cached telemetry.', 'ALERT');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // Check URL search params for action results
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('action_success') === 'true') {
        const symbol = urlParams.get('signal') || 'ETF';
        const status = urlParams.get('status') || 'PROCESSED';
        showToast(`One-click email link processed: ${symbol} is now ${status}!`, 'SUCCESS');
        // Clean URL without refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // Auto-refresh every 45 seconds during market hours
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 45000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Handle Manual Trigger Scan (Real or Simulated)
  const handleTriggerScan = async (simulateDip: boolean) => {
    showToast(
      simulateDip
        ? 'Executing simulated dip run for pipeline verification...'
        : 'Running quantitative market scan for GOLDBEES & SILVERBEES...',
      'INFO'
    );

    try {
      const secret = 'smart_dip_cron_secure_secret_2026';
      const res = await fetch(`/api/cron-runner?simulate=${simulateDip}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      });

      const result = await res.json();

      if (res.ok) {
        if (result.signalsGenerated > 0) {
          showToast(
            `🚨 Alert: ${result.signalsGenerated} Dip Signal detected! Queued in HITL Action Center.`,
            'ALERT'
          );
        } else {
          showToast('Scan complete. Both ETFs are outside dip trigger thresholds.', 'SUCCESS');
        }
        await fetchDashboardData(true);
      } else {
        showToast(result.error || 'Scan error encountered.', 'ALERT');
      }
    } catch (err: any) {
      showToast(`Scan execution error: ${err.message}`, 'ALERT');
    }
  };

  // Handle HITL Order Approval
  const handleApproveOrder = async (signalId: string, customAmount?: number) => {
    try {
      const res = await fetch('/api/hitl-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signalId,
          action: 'APPROVE',
          amount: customAmount,
          approvedBy: 'UI_DASHBOARD',
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        showToast(
          `Accumulation Order Approved! Deployed ₹${(
            customAmount || 7400
          ).toLocaleString('en-IN')} from HDFC Sweep-In.`,
          'SUCCESS'
        );
        await fetchDashboardData();
      } else {
        showToast(resData.error || 'Failed to approve order', 'ALERT');
      }
    } catch (err: any) {
      showToast(`Approval error: ${err.message}`, 'ALERT');
    }
  };

  // Handle HITL Order Rejection
  const handleRejectOrder = async (signalId: string) => {
    try {
      const res = await fetch('/api/hitl-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signalId,
          action: 'REJECT',
          approvedBy: 'UI_DASHBOARD',
        }),
      });

      if (res.ok) {
        showToast('Accumulation proposal rejected and archived.', 'INFO');
        await fetchDashboardData();
      }
    } catch (err: any) {
      showToast(`Rejection error: ${err.message}`, 'ALERT');
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#080C14] flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
          <Sparkles className="w-5 h-5 text-amber-400 absolute" />
        </div>
        <p className="text-xs font-mono text-slate-400">
          Initializing Smart Dip Accumulator & Quant Engine...
        </p>
      </div>
    );
  }

  const quotesList = Object.values(data.quotes || {});

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 selection:bg-amber-500 selection:text-slate-950 pb-20">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-xl text-xs font-semibold ${
              toastMessage.type === 'ALERT'
                ? 'bg-amber-950/90 text-amber-200 border-amber-500/40 shadow-amber-950/50'
                : toastMessage.type === 'SUCCESS'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-950/50'
                : 'bg-slate-900/90 text-slate-200 border-slate-700 shadow-black/60'
            }`}
          >
            {toastMessage.type === 'ALERT' ? (
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            ) : toastMessage.type === 'SUCCESS' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <Header
        market={data.market}
        settings={data.settings}
        pendingCount={data.pendingSignals?.length || 0}
        onRefresh={() => fetchDashboardData(true)}
        onTriggerScan={handleTriggerScan}
      />

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Top Asset Tickers Section (GoldBEES & SilverBEES) */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>Quantitative ETF Surveillance</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  NSE Real-Time
                </span>
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Next scheduled cron check: Indian Market Hours (Hourly)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {quotesList.map((quote) => (
              <AssetCard key={quote.symbol} quote={quote} />
            ))}
          </div>
        </div>

        {/* Human-In-The-Loop (HITL) Action Center */}
        <HitlActionCenter
          pendingSignals={data.pendingSignals || []}
          allSignals={data.signals || []}
          settings={data.settings}
          onApprove={handleApproveOrder}
          onReject={handleRejectOrder}
          onRefresh={() => fetchDashboardData()}
        />

        {/* Signal Audit Ledger & Quant Records */}
        <SignalsTable signals={data.signals || []} />

        {/* Serverless Telemetry & 3-Layer Health Status */}
        <CronTelemetry logs={data.cronLogs || []} engine={data.engine} />

      </main>

      {/* AI Assistant Chatbot */}
      <ChatWidget />

    </div>
  );
}
