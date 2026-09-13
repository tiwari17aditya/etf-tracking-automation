---
name: reviewed-vault
description: Manages the Reviewed Entities Vault. Automates the 10-point quantitative audit, evaluates PASS/FAIL/ACCEPTABLE criteria, updates entity dossiers in research/reviewed_entities/, and synchronizes with the interactive Web UI modal.
---

# Reviewed Entities Vault Management Skill

This skill governs the systematic ingestion, quantitative auditing, dossier creation, and Web UI modal synchronization of investment assets.

## The 10-Point Institutional Audit Protocol

Every entity added to the vault is evaluated against our strict 10-factor quantitative scorecard:

| # | Factor / Metric | Target Standard | Status Condition |
|---|---|---|---|
| 1 | **AUM (Asset Base)** | > ₹1,000 Crores | `PASS` if > ₹1,000 Cr; `FAIL` if < ₹500 Cr |
| 2 | **Expense Ratio (TER)** | < 0.50% (Lower is better) | `PASS` if < 0.30%; `ACCEPTABLE` if 0.30-0.50%; `FAIL` if > 0.50% |
| 3 | **Tracking Error** | < 0.25% against benchmark | `PASS` if < 0.15%; `ACCEPTABLE` if 0.15-0.25%; `FAIL` if > 0.25% |
| 4 | **Average Daily Volume** | > 100,000 units / > ₹5 Cr daily | `PASS` if tight bid-ask spread; `FAIL` if illiquid |
| 5 | **52-Week Price Position** | Reasonable entry valuation | `PASS` if within accumulation corridor; `FAIL` if > 25% parabolic |
| 6 | **EMA 50 / 200 Trend** | Bullish golden alignment | `PASS` if Price > EMA 200; `FAIL` if breaking major structural support |
| 7 | **RSI Momentum (14-period)** | 40 – 65 (Sustainable accumulation) | `PASS` if 40-60; `ACCEPTABLE` if 60-70; `FAIL` if overbought > 75 |
| 8 | **Volatility (ATR & Bands)** | Moderate, bounded within 2-sigma | `PASS` if ATR normalized; `FAIL` if extreme volatility spike |
| 9 | **Macro & Sovereign Moat** | Central bank / Regulatory backing | `PASS` if sovereign backing / physical allocation; `FAIL` if counterparty risk |
| 10| **Taxation & Liquidity** | High market maker participation | `PASS` if immediate liquidity & clean tax classification |

## Workflow Execution

### 1. New Asset Review
When asked to evaluate an asset (e.g. `SILVERBEES`, `NIFTYBEES`, `HDFCBANK.NS`):
1. Query the `stock-analyst` MCP tools:
   - `get_stock_quote(symbol)`
   - `get_historical_candles(symbol, period='1y', interval='1d')`
   - `calculate_indicators(symbol, period='1y')`
   - `get_financial_statements(symbol, ...)` if corporate equity
2. Fill out the 10-point scorecard with the exact numerical values (Zero Hallucination).
3. Determine final recommendation score (out of 10) and assign:
   - `🟢 BUY - ACCUMULATE` (Score >= 7.5)
   - `🟡 HOLD / NEUTRAL` (Score 5.0 - 7.4)
   - `🔴 AVOID / SELL` (Score < 5.0)
4. Write dossier to `research/reviewed_entities/<SYMBOL>.md`.

### 2. Synchronization & UI Verification
1. Run `scripts/update_reviewed_entities.py` to refresh all calculations.
2. The UI at `http://localhost:8000` automatically exposes the entity under the **Reviewed Vault** tab.
3. Clicking on any entity card opens the audit modal with expandable PASS/FAIL explanations.
