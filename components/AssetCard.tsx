'use client';

import React from 'react';
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { MarketQuote } from '@/lib/db/types';

interface AssetCardProps {
  quote: MarketQuote;
  onQuickSimulate?: () => void;
}

export function AssetCard({ quote }: AssetCardProps) {
  const isGold = quote.symbol.includes('GOLD');
  const isDip = quote.dipDetected;
  const isRsiDip = quote.rsi14 < 35;
  const isBelowEma = quote.price < quote.ema50;

  // Calculate 52-week position percentage
  const priceRange = quote.high52 - quote.low52 || 1;
  const rangePct = Math.min(100, Math.max(0, ((quote.price - quote.low52) / priceRange) * 100));

  // RSI Gauge Math (180 degree semi-circle)
  const clampedRsi = Math.min(100, Math.max(0, quote.rsi14));
  const rsiAngle = -90 + (clampedRsi / 100) * 180; // -90 to +90 deg

  // Generate SVG mini sparkline path
  const history = quote.history || [];
  const prices = history.map((h) => h.price);
  const minP = Math.min(...(prices.length ? prices : [quote.price * 0.95]));
  const maxP = Math.max(...(prices.length ? prices : [quote.price * 1.05])) || minP + 1;
  
  const sparklinePoints = history.map((h, i) => {
    const x = (i / (Math.max(1, history.length - 1))) * 140;
    const y = 40 - ((h.price - minP) / (maxP - minP || 1)) * 32;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div
      className={`rounded-2xl p-5 transition-all duration-300 relative overflow-hidden ${
        isGold ? 'glass-panel-gold' : 'glass-panel-silver'
      } ${isDip ? 'ring-2 ring-amber-500 shadow-xl shadow-amber-500/10' : ''}`}
    >
      {/* Background ambient gradient */}
      <div
        className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isGold ? 'bg-amber-500' : 'bg-slate-300'
        }`}
      />

      {/* Card Header */}
      <div className="flex items-start justify-between relative z-10 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                isGold
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-700/50 text-slate-200 border border-slate-600/40'
              }`}
            >
              {quote.symbol}
            </span>
            {isDip && (
              <span className="flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                <AlertCircle className="w-3 h-3" />
                <span>DIP TRIGGERED</span>
              </span>
            )}
          </div>
          <h2 className="text-sm font-semibold text-slate-300 mt-1">{quote.name}</h2>
        </div>

        {/* Price & Change */}
        <div className="text-right">
          <div className="text-2xl font-black text-white font-mono">
            ₹{quote.price.toFixed(2)}
          </div>
          <div
            className={`flex items-center justify-end space-x-1 text-xs font-semibold font-mono ${
              quote.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {quote.change >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {quote.change >= 0 ? '+' : ''}₹{quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Main Indicators Grid: RSI Gauge & 50-EMA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4 relative z-10">
        
        {/* 14-Period Wilder RSI Semi-Gauge */}
        <div className="bg-[#0B1120]/80 rounded-xl p-3.5 border border-slate-800/80 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
            <span>14-DAY WILDER RSI</span>
            <span className={isRsiDip ? 'text-amber-400 font-bold' : 'text-slate-300 font-mono'}>
              {quote.rsi14 < 35 ? 'Oversold (<35)' : quote.rsi14 > 70 ? 'Overbought (>70)' : 'Neutral'}
            </span>
          </div>

          <div className="relative w-36 h-20 flex items-center justify-center my-1">
            <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
              {/* Background Arc */}
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#1E293B"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Oversold Dip Zone Arc (0 to 35%) */}
              <path
                d="M 10 50 A 40 40 0 0 1 38 18"
                fill="none"
                stroke="rgba(245, 158, 11, 0.4)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Needle Indicator */}
              <g transform={`rotate(${rsiAngle}, 50, 50)`}>
                <line
                  x1="50"
                  y1="50"
                  x2="50"
                  y2="15"
                  stroke={isRsiDip ? '#F59E0B' : '#38BDF8'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="4"
                  fill={isRsiDip ? '#F59E0B' : '#38BDF8'}
                />
              </g>
            </svg>
            <div className="absolute bottom-0 text-center">
              <span
                className={`text-xl font-black font-mono tracking-tight ${
                  isRsiDip ? 'text-amber-400' : 'text-white'
                }`}
              >
                {quote.rsi14.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="w-full flex justify-between text-[10px] text-slate-500 font-mono px-2">
            <span className="text-amber-500 font-semibold">0 (Dip &lt;35)</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* 50-Day EMA & Trend */}
        <div className="bg-[#0B1120]/80 rounded-xl p-3.5 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
              <span>50-DAY MOVING AVG</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isBelowEma
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                }`}
              >
                {isBelowEma ? 'Below 50-EMA' : 'Above 50-EMA'}
              </span>
            </div>

            <div className="text-xl font-black font-mono text-white mt-1">
              ₹{quote.ema50.toFixed(2)}
            </div>

            <p className="text-[11px] text-slate-400 mt-1">
              Spread:{' '}
              <span
                className={`font-mono font-semibold ${
                  quote.price < quote.ema50 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {(
                  ((quote.price - quote.ema50) / quote.ema50) *
                  100
                ).toFixed(2)}
                %
              </span>
            </p>
          </div>

          {/* Mini 10-day Sparkline */}
          <div className="mt-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>10-Day Trend</span>
              <span className="font-mono text-slate-500">Close</span>
            </div>
            {prices.length > 1 ? (
              <svg viewBox="0 0 140 40" className="w-full h-8 overflow-visible">
                <polyline
                  fill="none"
                  stroke={isGold ? '#F59E0B' : '#94A3B8'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={sparklinePoints}
                />
              </svg>
            ) : (
              <div className="h-8 flex items-center text-[10px] text-slate-500">Trend loaded</div>
            )}
          </div>
        </div>

      </div>

      {/* 52-Week Range Bar */}
      <div className="bg-[#0B1120]/60 rounded-xl p-3 border border-slate-800/60 relative z-10">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span>52-Week Range</span>
          <span className="font-mono text-slate-300">
            ₹{quote.low52.toFixed(2)} — ₹{quote.high52.toFixed(2)}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
          <div
            className={`h-full rounded-full ${
              isGold ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-gradient-to-r from-slate-500 to-slate-300'
            }`}
            style={{ width: `${rangePct}%` }}
          />
        </div>
      </div>

      {/* Dip Alert Trigger Banner */}
      {isDip && (
        <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold">{quote.dipReason || 'Mathematical Dip Active'}</span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300 whitespace-nowrap ml-2">
            Target: ₹7,400
          </span>
        </div>
      )}
    </div>
  );
}
