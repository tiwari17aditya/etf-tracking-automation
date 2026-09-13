---
name: smart-dip-quant
description: >-
  Quantitative surveillance, mathematical indicator calculation (14-period Wilder RSI,
  50-day EMA), and ticker analysis for GoldBEES, SilverBEES, and future ETF expansions.
  Use when adding new ETF symbols, updating quantitative thresholds, testing yfinance data feeds,
  or diagnosing mathematical discrepancies.
---

# Quantitative Surveillance & ETF Engine Guide

This skill guides the agent on how to run, modify, and expand the quantitative engine for the Smart Dip Accumulator.

## Mathematical Core Mandates

1. **14-Period Wilder's Smoothed RSI**:
   - Calculate using exponential moving average with alpha = 1 / 14:
     $$\alpha = \frac{1}{14}$$
   - Formula:
     $$RSI = 100 - \left(\frac{100}{1 + RS}\right)$$
   - Must match NSE standard calculation (>99% accuracy).
2. **50-Day Exponential Moving Average (EMA)**:
   - Span = 50, smoothing multiplier $k = 2 / (50 + 1) \approx 0.0392$.
   - Pullback signal evaluated when $Close < EMA_{50}$.
3. **Dip Threshold Rules**:
   - **Normal Accumulation Dip**: $RSI_{14} < 35.0$ (Default tranche: ₹7,400).
   - **Extreme Panic Dip**: $RSI_{14} < 28.0$ (Double tranche: ₹14,800).

## Adding New ETF Tickers (e.g. NIFTYBEES, MON100)

1. Open `api/quant.py`.
2. Add the symbol to `TARGET_SYMBOLS`:
   ```python
   TARGET_SYMBOLS = ["GOLDBEES.NS", "SILVERBEES.NS", "NIFTYBEES.NS"]
   ```
3. Update `lib/db/types.ts` and `components/AssetCard.tsx` if customized color themes or badge styling are needed.
4. Run validation test:
   ```bash
   .\.venv\Scripts\python.exe api/quant.py
   ```

## Testing Quant Ingestion & Tenacity Retries

Run the standalone script to verify live Yahoo Finance connectivity:
```bash
.\.venv\Scripts\python.exe api/quant.py
```
If Yahoo Finance throttles, ensure `tenacity` retry kicks in and catches exceptions without writing corrupt data to `data/store.json`.
