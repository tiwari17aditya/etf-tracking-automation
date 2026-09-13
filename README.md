# Stock Market Research, Study & Quant Station

> An institutional-grade, zero-cost financial intelligence, research vault, and educational station powered by **Google Antigravity**, **FastMCP**, and **Starlette ASGI**.

[![Technology Stack](https://img.shields.io/badge/Tech%20Stack-Documented-00d084.svg)](TECH_STACK.md)
[![Zero Cost](https://img.shields.io/badge/Infrastructure-Zero%20Cost%20($0.00)-blue.svg)](TECH_STACK.md#hardware--operational-requirements)
[![Python 3.12](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](requirements.txt)
[![UI Station](https://img.shields.io/badge/Web%20UI-Active%20(Port%208000)-green.svg)](http://localhost:8000)

---

## 🏛️ System Architecture & Quick Links

- 📋 **Full Technical Matrix**: Read [`TECH_STACK.md`](TECH_STACK.md) for a comprehensive tabular breakdown of all 8 system layers.
- 🔬 **The 4 Indestructible Survival Pillars**: Read [`research/case_studies/`](research/case_studies/) covering Monetary Wealth, Pharma/Healthcare, FMCG Food Staples, and Power/Utilities.
- 🗄️ **Reviewed Entities Vault**: View [`research/reviewed_entities/`](research/reviewed_entities/) for audited assets like [GOLDBEES.md](research/reviewed_entities/GOLDBEES.md) with 10-point scorecard.
- 📚 **Quant Academy Courseware**: Explore [`study/`](study/) for progressive 9-module curriculum from beginner to advanced.
- 📓 **Session Audit Logs**: Review daily prompt tracking in [`session_logs/`](session_logs/).
- 🌐 **Comprehensive MCP Guide**: Explore [`others/mcp_servers_comprehensive_guide.md`](others/mcp_servers_comprehensive_guide.md) for a global census of ~1,250 servers and monetization blueprints.

---

## ⚡ Available Slash Commands & Skills

Custom agent workflows configured in [`.agents/skills/`](.agents/skills/):

| Command / Skill | Trigger | Purpose & Execution |
|---|---|---|
| **`/packup`** | `/packup for today` | Automatically runs the 10-point audit refresh, tests API health, commits session logs (JSONL + Markdown), and delivers an executive wrap-up summary. |
| **`/audit <ticker>`** | `/audit GOLDBEES.NS` | Performs a 10-factor quantitative scorecard audit, assigns PASS/ACCEPTABLE/FAIL ratings with empirical explanations, and generates a dossier. |
| **`/study <module>`** | `/study technicals` | Activates the interactive Quant Tutor navigating modules in `study/` paired with live market calculations. |
| **`/refresh-vault`** | `/refresh-vault` | Runs `scripts/update_reviewed_entities.py` to refresh all live indicators and prices across reviewed dossiers. |

---

## 🚀 Free MCP Tools Ecosystem

The custom `stock-analyst` FastMCP server exposes 5 zero-cost financial tools:

| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| `get_stock_quote` | `symbol: str` | Live/latest price, day high/low, 52W range, P/E, volume for US & Indian tickers (e.g., `GOLDBEES.NS`, `NVDA`, `TCS.NS`). |
| `get_historical_candles` | `symbol, period, interval` | Multi-timeframe OHLCV bars (`1m`, `5m`, `1d`, `1wk`, `1mo`). |
| `calculate_indicators` | `symbol, period` | 14-period Wilder RSI, 20/50/200 EMAs, 14-period ATR, and Bollinger Bands with Bandwidth and %B. |
| `get_financial_statements` | `symbol, statement_type` | Pulls trailing 4 quarters/years for `income`, `balance_sheet`, or `cashflow`. |
| `query_duckdb` | `sql_query: str` | Executes analytical SQL in DuckDB memory for backtesting or statistical calculations. |

---

## 📂 Minimal Directory Hierarchy

The project strictly adheres to a clean, 9-directory structure:

```
etf-tracking-automation/
├── .agents/                          # Antigravity IDE plugins, rules & skills
├── api/                              # Cloud Serverless ASGI gateway (Vercel)
├── core/                             # Backend server & FastMCP tools
├── research/                         # Case studies & reviewed entity dossiers
├── scripts/                          # Maintenance & recalculation runners
├── session_logs/                     # Daily prompt & milestone logs (JSONL + MD)
├── study/                            # 9-module financial academy courseware
├── web/                              # Zero-dependency reactive frontend
├── others/                           # Comprehensive MCP census & guides
├── deploy_vercel.bat                 # 1-Click cloud deployment script
├── start_ui.bat                      # 1-Click local station launcher
├── requirements.txt                  # Python dependencies manifest
├── vercel.json                       # Cloud serverless configuration
├── README.md                         # Project documentation
└── TECH_STACK.md                     # Tabular technology architecture matrix
```

---

## 💻 Running Locally & Cloud Deployment

### Local Station
Launch the interactive web station at `http://localhost:8000`:
```bash
# Double click start_ui.bat or run:
.\start_ui.bat
```

### Vercel Serverless Deployment (Option 1)
Deploy to Vercel in seconds using the local CLI runner:
```bash
# Double click deploy_vercel.bat or run:
.\deploy_vercel.bat
```
*(Requires `npx vercel` installed or runs directly with one-time browser login).*
