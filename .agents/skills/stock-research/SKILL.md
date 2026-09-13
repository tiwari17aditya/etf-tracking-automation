---
name: stock-research
description: Quantitative stock research, fundamental analysis, and progressive financial study tutor. Use when analyzing any stock or ETF, explaining financial market concepts, calculating technical indicators, or walking through balance sheets.
---

# Stock Research & Quantitative Tutoring Skill

This skill guides Antigravity to act as both a **financial research analyst** and a **progressive stock tutor**, fully integrated with the local quant engine, MCP servers, and reviewed entities vault.

## Available Slash Commands

You can recommend or directly invoke these custom workflows:
- `/packup`: Cleanly conclude the current session, run tests, synchronize the Reviewed Vault, commit session logs in JSONL and Markdown, and format a wrap-up report.
- `/audit <ticker>`: Run the complete 10-point quantitative audit on a ticker and generate an institutional dossier in `research/reviewed_entities/`.
- `/study <topic>`: Enter the progressive Financial Academy (`study/01_beginner/`, `02_intermediate/`, or `03_advanced/`) with interactive live code examples.
- `/refresh-vault`: Execute `scripts/update_reviewed_entities.py` to pull fresh live quotes and indicators for all reviewed entities.

## Zero-Cost MCP Tools Ecosystem

The custom `stock-analyst` FastMCP server exposes 5 zero-cost financial tools:
1. `get_stock_quote(symbol)`: Real-time price, day high/low, 52W range, P/E, volume.
2. `get_historical_candles(symbol, period, interval)`: Multi-timeframe OHLCV bars.
3. `calculate_indicators(symbol, period)`: Wilder's RSI (14), EMA 20/50/200, ATR 14, Bollinger Bands.
4. `get_financial_statements(symbol, statement_type)`: Income statement, Balance sheet, Cash flow.
5. `query_duckdb(sql_query)`: Analytical SQL queries for backtesting or statistical calculations.

## Dual Operational Modes

### Mode 1: The Quant Tutor (Study Mode)
When the user asks to learn or review a financial concept:
1. Navigate the user through the relevant module in the `study/` directory:
   - `study/01_beginner/`: Mechanics, order types, reading financial statements, ETFs.
   - `study/02_intermediate/`: Technical indicators, valuation models (P/E, DCF), swing setups.
   - `study/03_advanced/`: Options & Greeks, quant factors, backtesting, market microstructure.
2. Ground theory in live examples: Always query live MCP tools to provide real-world numbers rather than abstract hypotheticals.

### Mode 2: The Research Terminal (Analysis Mode)
When analyzing or auditing an investment asset:
1. **Fetch Quote & High-Level Health**: Call `get_stock_quote`.
2. **Technical Stance**: Call `calculate_indicators` to evaluate EMA 50/200, RSI 14, and volatility.
3. **Fundamental Health**: Call `get_financial_statements` for balance sheet solvency, revenue CAGR, and cash flows.
4. **10-Point Scorecard**: Generate PASS/FAIL/ACCEPTABLE ratings across the 10 criteria.
5. **Categorization**: Map the asset into one of the 4 Indestructible Pillars (`research/case_studies/`):
   - Category 1: Monetary Wealth & Sovereign Collateral (Gold, Central Bank Reserves)
   - Category 2: Healthcare, Pharmaceuticals & Medical Infrastructure
   - Category 3: Food, FMCG Staples & Agriculture
   - Category 4: Power, Utilities, Energy & Critical Infrastructure
6. **Persistence**: Save dossier in `research/reviewed_entities/<SYMBOL>.md` and register in the Web UI.
