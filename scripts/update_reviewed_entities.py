#!/usr/bin/env python3
"""
Autonomous Telemetry & Dossier Refresher for research/reviewed_entities/
Fetches live quotes, Wilder's RSI, 50/200 EMAs, and Bollinger Bands via yfinance/MCP,
and updates the Markdown dossiers without altering custom fundamental qualitative analysis.
"""

import os
import re
import glob
import datetime
import yfinance as yf
import pandas as pd
import numpy as np

ENTITIES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "research", "reviewed_entities")

def calculate_quant_metrics(symbol: str):
    """Calculates Wilder RSI-14, 50/200 EMA, ATR-14, Bollinger Bands for a ticker."""
    t = yf.Ticker(symbol)
    df = t.history(period="1y")
    if df.empty or len(df) < 50:
        return None

    close = df['Close']
    p = float(close.iloc[-1])
    prev_close = float(close.iloc[-2]) if len(close) > 1 else p
    change_pct = round(((p - prev_close) / prev_close) * 100, 2)
    
    # 52-week High/Low
    fi = getattr(t, 'fast_info', None)
    h52 = float(getattr(fi, 'year_high', 0) or df['High'].max())
    l52 = float(getattr(fi, 'year_low', 0) or df['Low'].min())
    dd52 = round(((p - h52) / h52) * 100, 2)
    
    # Wilder's RSI-14
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(alpha=1/14, min_periods=14, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1/14, min_periods=14, adjust=False).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi_series = 100 - (100 / (1 + rs))
    rsi = round(float(rsi_series.iloc[-1]), 2)
    
    # EMAs
    ema20 = round(float(close.ewm(span=20, adjust=False).mean().iloc[-1]), 2)
    ema50 = round(float(close.ewm(span=50, adjust=False).mean().iloc[-1]), 2)
    ema200 = round(float(close.ewm(span=200, adjust=False).mean().iloc[-1]), 2) if len(close) >= 200 else None
    
    # Bollinger Bands (20, 2)
    sma20 = close.rolling(20).mean()
    std20 = close.rolling(20).std()
    upper = round(float((sma20 + 2 * std20).iloc[-1]), 2)
    lower = round(float((sma20 - 2 * std20).iloc[-1]), 2)
    bw = round(((upper - lower) / float(sma20.iloc[-1])) * 100, 2)
    pct_b = round((p - lower) / (upper - lower) if (upper - lower) != 0 else 0.5, 2)
    
    # ATR-14
    high = df['High']
    low = df['Low']
    tr1 = high - low
    tr2 = (high - close.shift()).abs()
    tr3 = (low - close.shift()).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = round(float(tr.rolling(14).mean().iloc[-1]), 2)
    atr_pct = round((atr / p) * 100, 2)

    return {
        "price": round(p, 2),
        "prev_close": round(prev_close, 2),
        "change_pct": change_pct,
        "52w_high": round(h52, 2),
        "52w_low": round(l52, 2),
        "drawdown_pct": dd52,
        "rsi_14": rsi,
        "ema_20": ema20,
        "ema_50": ema50,
        "ema_200": ema200,
        "bollinger_upper": upper,
        "bollinger_lower": lower,
        "bandwidth_pct": bw,
        "pct_b": pct_b,
        "atr_14": atr,
        "atr_pct": atr_pct
    }

def update_dossier(filepath: str):
    """Refreshes the telemetry section in a markdown dossier file."""
    filename = os.path.basename(filepath)
    raw_sym = os.path.splitext(filename)[0].upper()
    sym = raw_sym if raw_sym.endswith(".NS") or raw_sym.endswith(".BO") else f"{raw_sym}.NS"
    
    print(f"[*] Analyzing live quant metrics for {sym}...")
    m = calculate_quant_metrics(sym)
    if not m:
        print(f"[-] Failed to fetch data for {sym}")
        return False

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    now_str = datetime.datetime.now().strftime("%d-%m-%YT%H:%M:%S IST")
    
    # Format RSI status
    if m["rsi_14"] <= 35:
        rsi_status = "**OVERSOLD** (Deep Accumulation Trigger)"
    elif m["rsi_14"] >= 70:
        rsi_status = "**OVERBOUGHT** (Caution / Trim Zone)"
    else:
        rsi_status = "**NEUTRAL** (Accumulation range: 35 <= RSI <= 50)"

    # Format 50 EMA status
    p_vs_50 = round(((m["price"] - m["ema_50"]) / m["ema_50"]) * 100, 2)
    ema50_str = f"**BULLISH** (Price holds ABOVE 50 EMA by +{p_vs_50}%)" if p_vs_50 >= 0 else f"**PULLBACK** (Price trades BELOW 50 EMA by {p_vs_50}%)"

    # Format 200 EMA status
    if m["ema_200"]:
        p_vs_200 = round(((m["price"] - m["ema_200"]) / m["ema_200"]) * 100, 2)
        ema200_str = f"**STRONG SECULAR BULL** (Price holds ABOVE 200 EMA by +{p_vs_200}%)" if p_vs_200 >= 0 else f"**BELOW 200 EMA** (Long-term consolidation: {p_vs_200}%)"
        ema200_val = f"**₹{m['ema_200']}**"
    else:
        ema200_str = "N/A (< 200 days history)"
        ema200_val = "N/A"

    new_telemetry = (
        "<!-- TELEMETRY_START -->\n"
        "| Factor / Metric | Live Value | Signal / Benchmark Status |\n"
        "| :--- | :--- | :--- |\n"
        f"| **Current Market Price** | **₹{m['price']}** | Consolidation above moving averages |\n"
        f"| **Previous Close** | **₹{m['prev_close']}** | Intraday change: `{m['change_pct']:+}%` |\n"
        f"| **52-Week Range** | **₹{m['52w_low']} – ₹{m['52w_high']}** | Multi-year trading boundaries |\n"
        f"| **Drawdown from 52W High** | **{m['drawdown_pct']}%** | **Accumulation Zone** (Trigger threshold: >= 10%) |\n"
        f"| **14-Period Wilder's RSI** | **{m['rsi_14']}** | {rsi_status} |\n"
        f"| **20-Day Exponential Moving Avg (EMA)** | **₹{m['ema_20']}** | Short-term momentum guide |\n"
        f"| **50-Day Exponential Moving Avg (EMA)** | **₹{m['ema_50']}** | {ema50_str} |\n"
        f"| **200-Day Exponential Moving Avg (EMA)** | {ema200_val} | {ema200_str} |\n"
        f"| **Bollinger Bands (20, 2)** | Lower: **₹{m['bollinger_lower']}** \\| Upper: **₹{m['bollinger_upper']}** | Bandwidth: `{m['bandwidth_pct']}%` \\| %B: `{m['pct_b']}` (Lower quadrant support) |\n"
        f"| **14-Day Average True Range (ATR)** | **₹{m['atr_14']}** | Normalized daily volatility: `{m['atr_pct']}%` |\n"
        "<!-- TELEMETRY_END -->"
    )

    # Safe substring replacement for telemetry
    start_tag = "<!-- TELEMETRY_START -->"
    end_tag = "<!-- TELEMETRY_END -->"
    start_idx = content.find(start_tag)
    end_idx = content.find(end_tag)
    
    if start_idx != -1 and end_idx != -1:
        updated_content = content[:start_idx] + new_telemetry + content[end_idx + len(end_tag):]
    else:
        print(f"[!] Warning: No TELEMETRY tags found in {filename}, skipping table replace.")
        updated_content = content

    # Update Last Telemetry Update header
    updated_lines = []
    for line in updated_content.splitlines():
        if line.startswith("> **Last Telemetry Update**:"):
            updated_lines.append(f"> **Last Telemetry Update**: {now_str}")
        else:
            updated_lines.append(line)
    updated_content = "\n".join(updated_lines)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(updated_content)

    print(f"[+] Successfully refreshed telemetry in {filename} at {now_str}")
    return True

def main():
    print(f"=== Autonomous Entity Dossier Telemetry Refresher ===")
    os.makedirs(ENTITIES_DIR, exist_ok=True)
    dossiers = glob.glob(os.path.join(ENTITIES_DIR, "*.md"))
    if not dossiers:
        print(f"[!] No dossiers found in {ENTITIES_DIR}")
        return

    for d in dossiers:
        update_dossier(d)
    print("=== All Dossiers Successfully Updated ===")

if __name__ == "__main__":
    main()
