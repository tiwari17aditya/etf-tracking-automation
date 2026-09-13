# System Technology Stack & Architecture Matrix

> **Project**: Quantitative ETF & Stock Tracking Automation  
> **Status**: Production Ready | Zero-Cost Infrastructure ($0.00/month)  
> **Target Runtime**: Python 3.12+ (Windows / Linux / Serverless ASGI)

---

## 1. Master Architecture Overview

The system is engineered as an autonomous, zero-cost, institutional-grade stock and ETF research station. It decouples high-performance quantitative calculation from the user interface using the Model Context Protocol (MCP), an asynchronous ASGI backend, and a glassmorphism client.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ANTIGRAVITY IDE AGENT                           │
│     Skills (/packup, /audit, /study)  │  Rules & Prompts Tracking      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ stdio / JSON-RPC 2.0
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     STOCK-ANALYST MCP SERVER                           │
│   FastMCP 1.2+  │  get_stock_quote  │  calculate_indicators           │
│   get_financial_statements  │  get_historical_candles  │  query_duckdb │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      ASYNC API GATEWAY & BACKEND                       │
│    Starlette / FastAPI ASGI  │  Local: ui_server.py (Port 8000)        │
│    Cloud Serverless: api/index.py (Vercel Serverless Function)         │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
         REST APIs  ▼                     Static     ▼
┌───────────────────────────────┐  ┌─────────────────────────────────────┐
│       REACTIVE WEB UI         │  │     PERSISTENCE & AUDIT VAULT       │
│  Vanilla JS (ES6+ Modules)    │  │  research/reviewed_entities/ (*.md) │
│  Vanilla CSS Glassmorphism    │  │  research/case_studies/ (*.md)      │
│  Single-Page Station Design   │  │  session_logs/ (JSONL + Tables)     │
└───────────────────────────────┘  └─────────────────────────────────────┘
```

---

## 2. Tabular Technology Stack Matrix

### Layer 1: Protocol & Agentic Integration Tier

| Component | Technology | Version | Purpose & Capabilities | License | Cost |
|---|---|---|---|---|---|
| **Protocol Specification** | Model Context Protocol (MCP) | v1.2+ | Anthropic open protocol for standardizing AI-to-tool communication via JSON-RPC 2.0. | MIT | $0.00 |
| **MCP SDK** | `mcp` (FastMCP Python) | `>=1.2.0` | In-memory and stdio tool hosting; provides type-safe decorators for quant function exposure. | MIT | $0.00 |
| **Agent Customizations** | Antigravity Skills & Rules | v2.0 | Progressive disclosure runbooks (`stock-research`, `packup`, `reviewed-vault`) and always-on rules. | Native AGY | $0.00 |
| **Custom Slash Commands** | `/packup`, `/audit`, `/study` | v1.0 | High-level triggers automating end-of-session wrapping, 10-point audits, and study navigation. | Project | $0.00 |

---

### Layer 2: Core Backend, API Gateway & Asynchronous Servers

| Component | Technology | Version | Purpose & Capabilities | License | Cost |
|---|---|---|---|---|---|
| **ASGI Microframework** | `Starlette` | `>=0.37.0` | Ultra-fast, lightweight asynchronous web framework handling routing, static mounting, and CORS. | BSD-3 | $0.00 |
| **Production ASGI Server** | `Uvicorn` | `>=0.29.0` | Lightning-fast ASGI server implementation powered by `uvloop` and `httptools` on localhost:8000. | BSD-3 | $0.00 |
| **HTTP Client** | `requests` / `urllib3` | `>=2.31.0` | Synchronous / resilient HTTP client used for external fallback queries and health probes. | Apache-2.0 | $0.00 |
| **Resilience Engine** | `tenacity` | `>=8.2.0` | Exponential backoff and retry mechanism for financial network requests to eliminate rate drops. | Apache-2.0 | $0.00 |
| **Serverless Adapter** | Vercel Python Runtime | v3.12 | Wraps the ASGI Starlette app into serverless handlers executing in edge lambdas. | Proprietary Free Tier | $0.00 |

---

### Layer 3: Quantitative Analytics & Market Data Engine

| Component | Technology | Version | Purpose & Capabilities | License | Cost |
|---|---|---|---|---|---|
| **Market Data Provider** | `yfinance` | `>=0.2.40` | Fetches real-time quotes, historical OHLCV multi-timeframe candles, balance sheets, and dividends. | Apache-2.0 | $0.00 |
| **DataFrames & Timeseries**| `pandas` | `>=2.2.0` | Fast timeseries aggregation, OHLCV slicing, rolling window computations, and alignment. | BSD-3 | $0.00 |
| **Numerical Computation** | `numpy` | `>=1.26.0` | High-performance vector math for Wilder's smoothed RSI, exponential moving averages, and ATR. | BSD-3 | $0.00 |
| **Technical Indicators** | Custom In-House Math | v2.0 | Native zero-dependency algorithms for: RSI-14, EMA 20/50/200, ATR-14, and 2-Sigma Bollinger Bands. | Project | $0.00 |
| **10-Point Audit Engine** | Quant Evaluation Engine | v1.0 | Deterministic evaluation of AUM, TER, tracking error, volume, trend, and macroeconomic moats. | Project | $0.00 |

---

### Layer 4: Embedded Database & Analytical SQL Engine

| Component | Technology | Version | Purpose & Capabilities | License | Cost |
|---|---|---|---|---|---|
| **Analytical Database** | `DuckDB` | `>=1.0.0` | In-process columnar OLAP SQL database executing analytical queries on financial timeseries in microseconds. | MIT | $0.00 |
| **Query Engine** | DuckDB In-Memory SQL | Standard SQL | Enables complex SQL aggregations (`SELECT AVG(close) ... OVER (...)`) directly on pandas DataFrames without external servers. | MIT | $0.00 |

---

### Layer 5: Web Frontend, User Interface & Design System

| Component | Technology | Version | Purpose & Capabilities | License | Cost |
|---|---|---|---|---|---|
| **Markup Foundation** | Semantic HTML5 | W3C Standard | Clean, responsive single-page structure with semantic tags, tabbed stations, and modal containers. | Open Standard | $0.00 |
| **Styling & Aesthetics** | Pure Vanilla CSS3 | Custom Design System | Ultra-modern dark glassmorphism theme (`hsl(222, 47%, 11%)`), backdrop filters, glow gradients, and animations. | Project | $0.00 |
| **Client-Side Logic** | Vanilla JavaScript | ES6+ Modern | Zero-dependency reactive client managing tabs, live chart rendering, modal controls, and async fetches. | Open Standard | $0.00 |
| **Typography** | Inter & JetBrains Mono | Google Fonts | High-readability neo-grotesque sans-serif paired with a monospace code font for numbers and tickers. | SIL Open Font | $0.00 |
| **Inspection Modal** | Expandable Accordion UI | Custom JS/CSS | Interactive pass/fail audit card with expandable reason drawers revealing mathematical proof per factor. | Project | $0.00 |

---

### Layer 6: Research, Knowledge Base & Storage Layer

| Component | Technology | Format | Purpose & Capabilities | Location |
|---|---|---|---|---|
| **Reviewed Entities Vault** | Markdown Dossiers | GitHub Flavored Markdown | Institutional research reports with 10-factor scorecards, purchase roadmaps, and allocation brackets. | `research/reviewed_entities/` |
| **Indestructible Pillars** | Thematic Whitepapers | Structured Markdown | Deep-dive case studies on human survival categories (Monetary, Pharma, FMCG, Power/Utilities). | `research/case_studies/` |
| **Financial Curriculum** | Educational Courseware | Progressive Markdown | 9-module academy (Beginner, Intermediate, Advanced) covering order types, indicators, and quant factors. | `study/` |
| **Global MCP Census** | Technical Reference | Markdown Guide | Comprehensive 355-line guide detailing ~1,250 MCP servers, ranking, co-creation, and monetization. | `others/` |

---

### Layer 7: Session Audit, Telemetry & Logging

| Component | Format | Update Frequency | Purpose & Capabilities | Location |
|---|---|---|---|---|
| **Machine-Readable Logs** | JSON Lines (`.jsonl`) | Real-time per prompt | Strict newline-delimited JSON capturing timestamps, prompt text, session IDs, and action summaries. | `session_logs/json/` |
| **Human-Readable Journal**| Markdown Tables (`.md`) | Real-time per prompt | Clean GitHub-flavored tables displaying execution timestamps, tickers, goals, and architectural notes. | `session_logs/md/` |
| **Automated Updater** | Python Runner Script | On-demand / Packup | Scans reviewed dossiers, recalculates live indicators, and refreshes the in-memory cache. | `scripts/update_reviewed_entities.py` |

---

### Layer 8: Deployment, Orchestration & Execution

| Environment | Hosting Service | Launch Mechanism | Target Port / URL | Cost |
|---|---|---|---|---|
| **Local Desktop Station** | Local Uvicorn Daemon | Windows Batch (`start_ui.bat`) | `http://localhost:8000` | $0.00 |
| **Cloud Serverless** | Vercel Serverless (Option 1) | CLI Runner (`deploy_vercel.bat`) | `https://*.vercel.app` | $0.00 |
| **MCP Integration** | FastMCP stdio Process | Antigravity `mcp_config.json` | Internal AGY stdio pipe | $0.00 |

---

## 3. Directory Structure & Minimal Hierarchy Mapping

The project enforces a clean, 9-directory hierarchy ensuring clear separation of concerns with zero file clutter:

```
d:\Antigravity-Projects\etf-tracking-automation\
├── .agents/                          # [DIR 1] Antigravity IDE Automation & Protocol Layer
│   ├── plugins/stock-analyst-suite/  # FastMCP server registration & metadata
│   ├── rules/stock_analysis_rules.md # Zero-hallucination & quant scorecard rules
│   └── skills/                       # Executable skill runbooks & slash commands
│       ├── packup/SKILL.md           # /packup end-of-session wrapup
│       ├── reviewed-vault/SKILL.md   # /audit 10-point scorecard & UI sync
│       └── stock-research/SKILL.md   # /study & live research engine
├── api/                              # [DIR 2] Cloud Serverless Gateway
│   └── index.py                      # Vercel ASGI serverless entry point
├── core/                             # [DIR 3] Backend & FastMCP Servers
│   ├── mcp_servers/stock_mcp_server.py # 5 live quant MCP tools
│   └── ui_server.py                  # Local ASGI/Starlette server & API gateway
├── research/                         # [DIR 4] Institutional Research Vault
│   ├── case_studies/                 # The 4 Indestructible Survival Pillars
│   ├── reviewed_entities/            # Audited investment dossiers (GOLDBEES.md)
│   └── README.md                     # Research methodology documentation
├── scripts/                          # [DIR 5] Maintenance & Automation Runners
│   └── update_reviewed_entities.py   # Vault recalculator & live sync runner
├── session_logs/                     # [DIR 6] Audit & Prompt Tracking Layer
│   ├── json/session_log_*.jsonl      # Machine-readable JSONL logs
│   └── md/session_log_*.md           # Human-readable tabular session logs
├── study/                            # [DIR 7] Financial Academy Courseware
│   ├── 01_beginner/                  # 3 beginner modules
│   ├── 02_intermediate/              # 3 intermediate modules
│   ├── 03_advanced/                  # 3 advanced modules
│   └── README.md                     # Study curriculum syllabus
├── web/                              # [DIR 8] Frontend Client (Zero-dependency)
│   ├── app.js                        # Reactive UI controller & audit modal logic
│   ├── index.html                    # Single-page terminal layout
│   └── styles.css                    # Glassmorphism design system
├── others/                           # [DIR 9] Deep-Dive Knowledge Reference
│   └── mcp_servers_comprehensive_guide.md # Global MCP census & monetization guide
├── deploy_vercel.bat                 # 1-Click Vercel cloud deployment
├── start_ui.bat                      # 1-Click local station launcher
├── requirements.txt                  # Python dependencies manifest
├── vercel.json                       # Vercel serverless configuration
├── README.md                         # Master repository documentation
└── TECH_STACK.md                     # This file (Complete technology stack matrix)
```

---

## 4. Hardware & Operational Requirements

| Dimension | Specification | Notes |
|---|---|---|
| **Operating System** | Windows 10/11, macOS, Linux | Cross-platform compatible. Tested on Windows PowerShell 5.1/7+. |
| **Python Version** | Python 3.12+ 64-bit | Virtual environment pre-configured at `.venv/`. |
| **Memory (RAM)** | < 120 MB runtime memory | Ultra-lightweight footprint due to pure Starlette + DuckDB embedded. |
| **Disk Space** | < 25 MB (excluding `.venv`) | Zero heavy build artifacts, no node_modules required. |
| **Network Bandwidth** | Nominal (< 50 KB per quote) | Cached indicators reduce redundant network roundtrips. |
| **Monthly Operating Cost** | **$0.00 / month** | 100% open-source software, free public APIs, and zero paid cloud services. |
