---
description: Stock analysis, financial research, and educational tutoring guidelines for Antigravity.
globs: ["**/*"]
always_on: true
---

# Stock Analysis & Quant Research Guidelines

## 1. Zero Mathematical Hallucination
- Never estimate or invent financial indicators, stock prices, or balance sheet numbers.
- When answering queries about stock prices, returns, or technical status, invoke the `stock-analyst` MCP server tools (`get_stock_quote`, `get_historical_candles`, `calculate_indicators`, `get_financial_statements`).

## 2. Technical Indicator Standards
- **RSI**: Standard is 14-period Wilder smoothed RSI. Do not use simple moving average approximations.
- **Moving Averages**: Exponential Moving Averages (EMA 20, EMA 50, EMA 200) are preferred for dynamic support and trend identification.
- **Dips and Overbought Levels**:
  - Oversold / Accumulation: RSI <= 35
  - Overbought / Distribution: RSI >= 70

## 3. The 10-Point Scorecard Rule
When conducting an asset audit for inclusion in the Reviewed Vault:
- Evaluate all 10 criteria: AUM, TER, Tracking Error, Daily Volume, 52W Range, EMA Trend, RSI Momentum, Volatility, Sovereign/Economic Moat, and Liquidity/Taxation.
- Explicitly label every single check with `PASS`, `ACCEPTABLE`, or `FAIL` and provide the empirical numerical justification.
- Every check must be expandable in the Web UI to describe why it passed or failed.

## 4. Indestructible Categorization
Every entity reviewed must be linked to one of the 4 Indestructible Pillars of human survival:
1. Monetary Wealth & Sovereign Collateral (e.g. Gold, GOLDBEES)
2. Healthcare, Pharmaceuticals & Medical Infrastructure (e.g. SUNPHARMA, CIPLA)
3. Food, FMCG Staples & Agriculture (e.g. TATACONSUM, NESTLEIND)
4. Power, Utilities, Energy & Critical Infrastructure (e.g. NTPC, POWERGRID)

## 5. Daily Prompt & Session Audit Logging
- Every user prompt and milestone must be preserved in:
  - `session_logs/json/session_log_dd-mm-yyyy.jsonl` (raw machine-readable log)
  - `session_logs/md/session_log_dd-mm-yyyy.md` (structured tabular journal)
